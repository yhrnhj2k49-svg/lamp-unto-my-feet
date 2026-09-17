// The reading server for Lamp Unto My Feet.
//
// Holds the Anthropic API key so the app never has to. The app posts what
// someone wrote; this asks Claude to choose the passages that meet it and to
// say why, in that person's terms.
//
// Deploy:  npx wrangler secret put ANTHROPIC_API_KEY  &&  npx wrangler deploy
// Local:   cp .dev.vars.example .dev.vars, add your key, npx wrangler dev

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CORPUS, CORPUS_SIZE } from "./corpus";

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** low | medium | high | xhigh | max. Anything else falls back to medium. */
  READING_EFFORT?: string;
}

const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof EFFORTS)[number];
const effortFrom = (value?: string): Effort =>
  (EFFORTS as readonly string[]).includes(value ?? "") ? (value as Effort) : "medium";

const MAX_INPUT = 2000;
const RATE_LIMIT = 20; // requests per IP per window
const WINDOW_MS = 60 * 60 * 1000;

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

const SYSTEM = `You are a scripture concordance for someone who has just written down what they are going through. You choose the passages that meet it, and you say why in their terms.

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

CONCORDANCE (${CORPUS_SIZE} passages, KJV)
${CORPUS}`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });

// Coarse per-IP limiting. Isolates are per-location and get recycled, so this
// blunts casual abuse rather than preventing it — put Cloudflare's Rate
// Limiting binding in front before you advertise the app anywhere.
const hits = new Map<string, { n: number; resetAt: number }>();

function overLimit(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now > cur.resetAt) {
    hits.set(ip, { n: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  cur.n += 1;
  return cur.n > RATE_LIMIT;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "POST only" }, 405);

    const ip = req.headers.get("CF-Connecting-IP") ?? "local";
    if (overLimit(ip)) return json({ error: "Too many readings. Try again later." }, 429);

    let text = "";
    let feelings: string[] = [];
    try {
      const body = (await req.json()) as { text?: unknown; feelings?: unknown };
      text = typeof body.text === "string" ? body.text.trim() : "";
      feelings = Array.isArray(body.feelings) ? body.feelings.filter((f) => typeof f === "string") : [];
    } catch {
      return json({ error: "Expected JSON" }, 400);
    }

    if (!text && feelings.length === 0) return json({ error: "Nothing to read" }, 400);
    if (text.length > MAX_INPUT) text = text.slice(0, MAX_INPUT);

    // Constructing the client without a key throws, which would surface as a
    // 500 with no explanation in the logs. Say what is actually wrong.
    if (!env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set — run: npx wrangler secret put ANTHROPIC_API_KEY");
      return json({ error: "The reading service is not configured." }, 500);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.messages.parse({
        model: "claude-opus-5",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        // Quality/latency/cost knob, set with READING_EFFORT so it can be tuned
        // on the deployed worker without a code change. Defaults to medium: over
        // four real readings it averaged 15s against 20s at high, with every
        // quote still verbatim and 13 of 16 passages the same.
        output_config: { effort: effortFrom(env.READING_EFFORT), format: zodOutputFormat(ReadingSchema) },
        // The corpus is the stable prefix; the situation below it is what varies.
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [
          {
            role: "user",
            content: `Here is what they wrote:\n\n${text || "(nothing written)"}\n\nThey also said it feels: ${
              feelings.length ? feelings.join(", ") : "(nothing selected)"
            }`,
          },
        ],
      });

      if (response.stop_reason === "refusal") {
        return json({ error: "That could not be read." }, 422);
      }

      const parsed = response.parsed_output;
      if (!parsed || parsed.passages.length === 0) {
        return json({ error: "The reading came back empty." }, 502);
      }

      return json(parsed);
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        console.error("ANTHROPIC_API_KEY is missing or invalid");
        return json({ error: "The reading service is not configured." }, 500);
      }
      if (error instanceof Anthropic.RateLimitError) {
        return json({ error: "Busy right now. Try again in a moment." }, 429);
      }
      if (error instanceof Anthropic.APIError) {
        console.error(`Anthropic API error ${error.status}: ${error.message}`);
        return json({ error: "The reading could not be completed." }, 502);
      }
      console.error(error);
      return json({ error: "Something went wrong." }, 500);
    }
  },
};
