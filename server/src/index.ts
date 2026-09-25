// The reading server for He Answers.
//
// Holds the Anthropic API key so the app never has to. Its routes:
//
//   POST /         what someone wrote  ->  the four passages that meet it
//   POST /living   one of those passages  ->  how to live it, in that situation
//   POST /followup more on a reading: a question, or "these did not fit"  ->  a reply and new passages
//   POST /word     a word tapped in a verse  ->  what it means, and the word behind it
//   POST /report   something Claude wrote was wrong or harmful  ->  kept for review
//
// "How to live it" is only written when someone taps for it, so the reading
// itself stays quick and nobody pays for application text they never open.
//
// Deploy:  npx wrangler secret put ANTHROPIC_API_KEY  &&  npx wrangler deploy
// Local:   put the key in .dev.vars, then npm run dev:node

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { PASSAGES } from "./corpus";
import { cleanStrings } from "./text";
import { podcast } from "./podcast";

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** Effort for readings: low | medium | high | xhigh | max. Defaults to medium. */
  READING_EFFORT?: string;
  /** Effort for "how to live it". Same values, same default. */
  LIVING_EFFORT?: string;
  /** Cloudflare rate limiters, per minute per IP. Absent when running locally. */
  READING_LIMIT?: RateLimit;
  LIVING_LIMIT?: RateLimit;
  REPORT_LIMIT?: RateLimit;
  PODCAST_LIMIT?: RateLimit;
  FOLLOWUP_LIMIT?: RateLimit;
  WORD_LIMIT?: RateLimit;
  /** Where reports are kept. Absent locally, where they go to the log instead. */
  REPORTS?: KVNamespace;
}

const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof EFFORTS)[number];
const effortFrom = (value?: string): Effort =>
  (EFFORTS as readonly string[]).includes(value ?? "") ? (value as Effort) : "medium";

const MAX_INPUT = 2000;
const WINDOW_MS = 60 * 60 * 1000;
// Per IP, per hour. A reading can be followed by a tap on each of its passages.
// A follow-up costs what a reading costs, so it gets a reading-sized budget.
const LIMITS = { reading: 20, living: 80, followup: 40, word: 120, report: 20, podcast: 240 } as const;
type Route = keyof typeof LIMITS;

// The concordance as the reading prompt shows it, and as /living looks it up.
const CORPUS = PASSAGES.map((p) => `${p.ref} | ${p.text}`).join("\n");
const BY_REF = new Map(PASSAGES.map((p) => [p.ref, p]));

/* ---------- schemas ---------- */

const Passage = z.object({
  ref: z.string().describe("Book chapter:verse, e.g. Psalm 34:18"),
  text: z.string().describe("The passage, King James Version, quoted exactly"),
  plain: z.string().describe("One sentence of modern English saying what it says"),
  why: z.string().describe("One or two sentences on why it meets THIS situation"),
  themes: z.array(z.string()).describe("One or two lowercase words, e.g. grief"),
});

const ReadingSchema = z.object({
  opening: z.string().describe("1-2 sentences naming what this person is carrying"),
  passages: z.array(Passage).describe("Exactly four passages"),
});

const LivingSchema = z.object({
  apply: z.string().describe("What this passage asks of them, concretely, in their situation"),
  reflect: z.string().describe("One open question to sit with, ending in a question mark"),
});

const FollowUpSchema = z.object({
  reply: z.string().describe("Two to five sentences answering what they just said"),
  passages: z.array(Passage).describe("Zero to three NEW passages, only if they help; never one already shown"),
});

const WordSchema = z.object({
  plain: z.string().describe("What the word means in THIS verse, one or two plain sentences"),
  original: z.string().describe("The Hebrew or Greek word behind it, transliterated, or empty if not certain"),
  range: z.string().describe("What that original word covers, or empty if original is empty"),
  elsewhere: z.string().describe("One place the same word is used tellingly elsewhere, or empty"),
});

/* ---------- prompts ---------- */

const READING_SYSTEM = `You are a scripture concordance for someone who has just written down what they are going through. You choose the passages that meet it, and you say why in their terms.

CHOOSING
- Choose exactly four passages.
- Prefer the concordance below and quote its text verbatim. It is the King James Version and it is correct. You may go outside it when nothing there fits, but only if you are certain of the KJV wording — a misquoted verse is worse than a less apt one.
- Vary the books. Do not return four psalms unless the Psalms are genuinely where the answer is.
- Meet the situation honestly. If someone is grieving, do not hurry them to resolution; the laments are scripture too, and a psalm that ends in darkness is sometimes the right answer.
- If what they wrote is good news, do not manufacture a problem to solve.
- Read for the specific thing. Someone losing a job at 58 and someone losing a first job at 22 are not carrying the same weight.

WRITING
- "opening": 1-2 sentences naming what this person seems to be carrying. Warm, unhurried, plain. Do not give advice, diagnose, or moralise. Do not begin with "It sounds like" or "I'm sorry to hear".
- "plain": one sentence of modern English saying what the passage says. Not commentary — a reading.
- "why": one or two sentences on why this passage meets what THEY wrote. Refer to their actual situation. Never a generic platitude; if the sentence would fit anyone, rewrite it.
- Address the person as "you". Never assume their gender, age or circumstances beyond what they wrote: "my wife" does not tell you who is writing.
- Never invent a citation. Never blend two passages into one quotation.
- Do not tell them what God is doing in their life. Set out the passage and let it speak.

CONCORDANCE (${PASSAGES.length} passages, KJV)
${CORPUS}`;

const FOLLOWUP_SYSTEM = `You are continuing a conversation with someone who wrote down what they are going through and was given passages of scripture for it. They want to keep going: the passages may not have fit, they may want to go deeper, or they may have a question.

HOW TO REPLY
- Two to five sentences, warm and plain, addressed to them as "you". Answer what they actually said just now; the earlier conversation is context, not the question.
- Write continuous prose. No line breaks, no lists, no headings. Where a sentence needs a break in thought, use a dash or a comma, never a new line.
- If they say the passages did not fit, take that seriously. Say briefly what was missed, and offer different passages.
- If they want to go deeper, stay with what they wrote and open one passage further: its setting, a word in it, how it has been read.
- If they ask a question about the Bible or faith, answer it honestly. Where Christian traditions genuinely disagree, say so plainly instead of presenting one view as settled.
- If they ask for something unrelated to scripture, faith, or what they are carrying, say kindly that this is a place for that, and bring it back.

PASSAGES
- Offer up to three new passages, only when they help. Offering none is fine.
- Never repeat a passage already shown to them; those are listed with the conversation.
- Quote the King James Version exactly. Prefer the concordance below and quote its text verbatim. Go outside it only when certain of the wording; a misquoted verse is worse than none.

LIMITS
- You are not a counsellor, doctor, lawyer, or pastor. When someone needs one, say so gently and encourage them to reach a person they trust.
- If anything suggests they may be in danger, tell them first, before anything else, to contact emergency services now, or call or text 988 in the US.
- Do not speak for God, do not claim to know God's particular will for their life, and do not tell them what God is doing in it.
- Never assume their gender, age, or circumstances beyond what they wrote. "My wife" or "my husband" does not tell you who is writing: do not call them a man or a woman, a father or a mother, a husband or a wife.

CONCORDANCE (${PASSAGES.length} passages, KJV)
${CORPUS}`;

const WORD_SYSTEM = `Someone reading the King James Version has tapped a word in a verse and wants to understand it.

- "plain": one or two sentences on what the word means in this verse. If the King James sense differs from how the word is used today, say so plainly — that is usually the whole reason they tapped it.
- "original": the Hebrew or Greek word behind it, transliterated (for example "chesed", "agape"). Leave this an empty string unless you are certain; a confidently wrong original is worse than none.
- "range": if you gave an original, what that word covers in its own language. Otherwise an empty string.
- "elsewhere": one other place the same original word is used in a way that lights this one up, with its reference. Otherwise an empty string.

Never invent an etymology, a reference, or a Strong's number. Do not preach, and do not apply the verse to anyone's life — this is a dictionary entry, not a sermon. Address the reader as "you" only if needed.`;

const LIVING_SYSTEM = `You help someone take one passage of scripture into their own life. They have written down what they are going through, and this passage was chosen for them.

Write two things:
- "apply": one or two sentences on what this passage asks of them today, in the situation they described. Concrete and doable. Sometimes the honest application is permission, to rest, to grieve, not to fix it yet, rather than a task. Never a list of religious duties and never a rebuke. Do not restate why the passage was chosen; say what to do with it.
- "reflect": one open question for them to sit with, ending in a question mark. Not rhetorical, not steering toward a right answer, never guilt-inducing.

Address the person as "you". Never assume their gender, age or circumstances beyond what they wrote. Do not tell them what God is doing in their life.`;

/* ---------- plumbing ---------- */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

// Phones send no Origin header; browsers always do. So a request carrying an
// Origin we do not know is a web page calling this server, and the only reason
// to do that is to spend someone else's Anthropic credit. Turn it away before
// any of that can happen. Add an entry here if the app is ever served as a
// website from a real domain.
const ORIGIN_ALLOWED = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/yhrnhj2k49-svg\.github\.io$/,
];
const originOk = (origin: string | null) =>
  origin === null || ORIGIN_ALLOWED.some((re) => re.test(origin));

// Nothing legitimate comes near this. The situation is capped at 2000
// characters, and the cap below is enforced before the body is parsed at all,
// so a large body cannot make the server do work on the way to rejecting it.
const MAX_BODY = 64 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });

// Two layers of per-IP limiting. Cloudflare's rate limiters (wrangler.toml) stop
// bursts within a minute; they count per data centre and are approximate by
// design. This in-memory hourly count is a rough second cap, and the only one
// when running locally. Isolates get recycled, so on its own it resets.
const hits = new Map<string, { n: number; resetAt: number }>();

function overLimit(key: string, cap: number): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || now > cur.resetAt) {
    hits.set(key, { n: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  cur.n += 1;
  return cur.n > cap;
}

async function limited(env: Env, route: Route, ip: string): Promise<boolean> {
  const binding = {
    reading: env.READING_LIMIT,
    living: env.LIVING_LIMIT,
    report: env.REPORT_LIMIT,
    podcast: env.PODCAST_LIMIT,
    followup: env.FOLLOWUP_LIMIT,
    word: env.WORD_LIMIT,
  }[route];
  if (binding && !(await binding.limit({ key: ip })).success) return true;
  return overLimit(`${ip}:${route}`, LIMITS[route]);
}

type Input = Record<string, unknown>;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 20) : [];

const situation = (text: string, feelings: string[]) =>
  `Here is what they wrote:\n\n${text || "(nothing written)"}\n\nThey also said it feels: ${
    feelings.length ? feelings.join(", ") : "(nothing selected)"
  }`;

function failure(error: unknown): Response {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("ANTHROPIC_API_KEY is missing or invalid");
    return json({ error: "The reading service is not configured." }, 500);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return json({ error: "Busy right now. Try again in a moment." }, 429);
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}: ${error.message}`);
    return json({ error: "That could not be completed." }, 502);
  }
  console.error(error);
  return json({ error: "Something went wrong." }, 500);
}

/* ---------- routes ---------- */

async function reading(input: Input, env: Env, client: Anthropic): Promise<Response> {
  const text = str(input.text, MAX_INPUT);
  const feelings = list(input.feelings);
  if (!text && feelings.length === 0) return json({ error: "Nothing to read" }, 400);

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      // Defaults to medium: over four real readings it averaged 15s against
      // 20s at high, with every quote still verbatim and 13 of 16 passages the same.
      output_config: { effort: effortFrom(env.READING_EFFORT), format: zodOutputFormat(ReadingSchema) },
      // The concordance is the stable prefix; the situation below it is what varies.
      system: [{ type: "text", text: READING_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: situation(text, feelings) }],
    });

    if (response.stop_reason === "refusal") return json({ error: "That could not be read." }, 422);
    const parsed = response.parsed_output;
    if (!parsed || parsed.passages.length === 0) return json({ error: "The reading came back empty." }, 502);
    return json(cleanStrings(parsed));
  } catch (error) {
    return failure(error);
  }
}

async function living(input: Input, env: Env, client: Anthropic): Promise<Response> {
  const text = str(input.text, MAX_INPUT);
  const feelings = list(input.feelings);
  const why = str(input.why, 800);

  // Only passages from the concordance, and only its own copy of them, so the
  // one thing a caller can write freely is their situation, as with a reading.
  const passage = BY_REF.get(str(input.ref, 80));
  if (!passage) return json({ error: "That passage is not in the concordance." }, 404);
  if (!text && feelings.length === 0) return json({ error: "Nothing to read" }, 400);

  const about = [
    situation(text, feelings),
    `The passage: ${passage.ref}\n${passage.text}`,
    `Its setting: ${passage.setting}`,
    why ? `Why it was chosen for them: ${why}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: effortFrom(env.LIVING_EFFORT), format: zodOutputFormat(LivingSchema) },
      system: LIVING_SYSTEM,
      messages: [{ role: "user", content: about }],
    });

    if (response.stop_reason === "refusal") return json({ error: "That could not be written." }, 422);
    const parsed = response.parsed_output;
    if (!parsed?.apply || !parsed?.reflect) return json({ error: "It came back empty." }, 502);
    return json(cleanStrings(parsed));
  } catch (error) {
    return failure(error);
  }
}

async function word(input: Input, env: Env, client: Anthropic): Promise<Response> {
  const term = str(input.word, 60);
  const ref = str(input.ref, 80);
  const verse = str(input.text, 1200);
  if (!term || !verse) return json({ error: "Nothing to look up." }, 400);

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      // A dictionary entry is small work; low effort keeps it quick and cheap.
      output_config: { effort: "low", format: zodOutputFormat(WordSchema) },
      system: WORD_SYSTEM,
      messages: [
        {
          role: "user",
          content: `The verse (${ref || "King James Version"}):\n${verse}\n\nThe word they tapped: ${term}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") return json({ error: "That could not be looked up." }, 422);
    const parsed = response.parsed_output;
    if (!parsed?.plain) return json({ error: "It came back empty." }, 502);
    return json(cleanStrings(parsed));
  } catch (error) {
    return failure(error);
  }
}

const MAX_TURNS = 16; // eight exchanges
const MAX_TURN = 1200;

async function followUp(input: Input, env: Env, client: Anthropic): Promise<Response> {
  const text = str(input.text, MAX_INPUT);
  const feelings = list(input.feelings);
  const message = str(input.message, MAX_INPUT);
  if (!message) return json({ error: "Nothing to answer." }, 400);

  const shown = Array.isArray(input.shown)
    ? input.shown.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 80)).slice(0, 40)
    : [];
  const history = (Array.isArray(input.history) ? input.history : [])
    .filter(
      (h): h is { role: "user" | "assistant"; text: string } =>
        !!h && typeof h === "object" && (h.role === "user" || h.role === "assistant") && typeof h.text === "string"
    )
    .slice(-MAX_TURNS)
    .map((h) => ({ role: h.role, text: h.text.trim().slice(0, MAX_TURN) }));

  const context = [
    situation(text, feelings),
    `Passages already shown to them: ${shown.length ? shown.join("; ") : "(none)"}`,
    history.length
      ? `The conversation so far:\n${history.map((h) => `${h.role === "user" ? "They said" : "You said"}: ${h.text}`).join("\n")}`
      : "",
    `What they just said: ${message}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: effortFrom(env.READING_EFFORT), format: zodOutputFormat(FollowUpSchema) },
      system: [{ type: "text", text: FOLLOWUP_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: context }],
    });

    if (response.stop_reason === "refusal") return json({ error: "That could not be answered." }, 422);
    const parsed = response.parsed_output;
    if (!parsed?.reply) return json({ error: "It came back empty." }, 502);

    // Belt and braces on the two promises the prompt makes: nothing already
    // shown comes back, and a passage the app carries is quoted from the app's
    // own checked text rather than from memory.
    const seen = new Set(shown.map((r) => r.toLowerCase()));
    const passages = parsed.passages
      .filter((p) => p.ref && p.text && !seen.has(p.ref.trim().toLowerCase()))
      .slice(0, 3)
      .map((p) => {
        const own = BY_REF.get(p.ref.trim());
        return own ? { ...p, ref: own.ref, text: own.text } : p;
      });

    return json(cleanStrings({ reply: parsed.reply, passages }));
  } catch (error) {
    return failure(error);
  }
}

const REASONS = new Set(["harmful", "misleading", "misquote", "other"]);
const REPORT_DAYS = 90;

// Google Play requires a way to report AI-generated content from inside the app.
// The app sends only Claude's words and a reason, never what the person wrote.
async function report(input: Input, env: Env): Promise<Response> {
  const kind = input.kind === "reading" || input.kind === "living" || input.kind === "followup" ? input.kind : null;
  const reason = str(input.reason, 20);
  if (!kind || !REASONS.has(reason)) return json({ error: "That report is missing its reason." }, 400);

  const record = {
    kind,
    reason,
    content: JSON.stringify(input.content ?? null).slice(0, 8000),
    at: new Date().toISOString(),
  };

  try {
    if (env.REPORTS) {
      await env.REPORTS.put(`report:${record.at}:${crypto.randomUUID()}`, JSON.stringify(record), {
        expirationTtl: REPORT_DAYS * 24 * 60 * 60,
      });
    } else {
      console.log(`report ${JSON.stringify(record)}`);
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "The report did not save." }, 500);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (!originOk(req.headers.get("Origin"))) return json({ error: "Not allowed from there." }, 403);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });

    const ip = req.headers.get("CF-Connecting-IP") ?? "local";

    // The one read-only route: recent episodes of the listed podcasts.
    if (req.method === "GET" && new URL(req.url).pathname.replace(/\/+$/, "").endsWith("/podcast")) {
      if (await limited(env, "podcast", ip)) return json({ error: "Too many requests. Try again later." }, 429);
      return podcast(req, cors);
    }

    if (req.method !== "POST") return json({ error: "POST only" }, 405);

    const declared = Number(req.headers.get("Content-Length") ?? 0);
    if (declared > MAX_BODY) return json({ error: "That is too large to read." }, 413);

    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    const route: Route = path.endsWith("/living")
      ? "living"
      : path.endsWith("/followup")
        ? "followup"
        : path.endsWith("/word")
          ? "word"
        : path.endsWith("/report")
          ? "report"
          : "reading";

    if (await limited(env, route, ip)) {
      return json({ error: "Too many requests. Try again later." }, 429);
    }

    // Content-Length can be left off a chunked request, so measure the body
    // itself rather than trusting what the caller said it would be.
    let input: Input;
    try {
      const raw = await req.text();
      if (raw.length > MAX_BODY) return json({ error: "That is too large to read." }, 413);
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error();
      input = parsed as Input;
    } catch {
      return json({ error: "Expected JSON" }, 400);
    }

    // Reports never reach Claude, so they need no key.
    if (route === "report") return report(input, env);

    // Constructing the client without a key throws, which would surface as a
    // 500 with no explanation in the logs. Say what is actually wrong.
    if (!env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set — run: npx wrangler secret put ANTHROPIC_API_KEY");
      return json({ error: "The reading service is not configured." }, 500);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    if (route === "followup") return followUp(input, env, client);
    if (route === "word") return word(input, env, client);
    return route === "living" ? living(input, env, client) : reading(input, env, client);
  },
};
