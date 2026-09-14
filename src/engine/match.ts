// The on-device concordance.
//
// Everything here runs locally: no network, no account, nothing about what a
// person types ever leaves the phone. That is deliberate — this is the kind of
// thing people write at three in the morning.

import { VERSES, type Theme, type Verse } from "../data/verses";
import { PHRASES, STOPWORDS, TERMS } from "../data/lexicon";

export type Passage = Verse & { score: number };

export type Reading = {
  opening: string;
  themes: Theme[];
  passages: Passage[];
  source: "device" | "reading";
};

/* ---------- text handling ---------- */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  // Collapse the silent -e so "relapse" and "relapsing" land on one key.
  if (w.length > 4 && w.endsWith("e")) w = w.slice(0, -1);
  return w;
}

// stemmed term -> themes it points at
const TERM_INDEX: Map<string, Theme[]> = (() => {
  const m = new Map<string, Theme[]>();
  for (const [theme, words] of Object.entries(TERMS) as Array<[Theme, string[]]>) {
    for (const w of words) {
      const k = stem(normalize(w));
      const cur = m.get(k);
      if (cur) {
        if (!cur.includes(theme)) cur.push(theme);
      } else {
        m.set(k, [theme]);
      }
    }
  }
  return m;
})();

// How someone feels should outweigh what the situation is about. "I am so
// tired, working two jobs" is a passage about exhaustion, not about work.
const STATE_THEMES = new Set<Theme>([
  "anxiety", "fear", "grief", "despair", "loneliness", "anger", "guilt",
  "temptation", "doubt", "exhaustion", "envy", "pride", "failure",
  "weakness", "gratitude", "hope", "peace", "betrayal",
]);

function contentTokens(norm: string): string[] {
  return norm
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/* ---------- theme scoring ---------- */

export function scoreThemes(text: string, feelings: Theme[]): Map<Theme, number> {
  const norm = normalize(text);
  const scores = new Map<Theme, number>();
  const bump = (t: Theme, n: number) => scores.set(t, (scores.get(t) ?? 0) + n);

  // Phrases carry the most signal: they disambiguate shared words.
  for (const [phrase, themes, weight] of PHRASES) {
    if (norm.includes(phrase)) themes.forEach((t) => bump(t, weight));
  }

  // Single terms, stemmed. Each token counts once so repetition cannot flood.
  const seen = new Set<string>();
  for (const raw of contentTokens(norm)) {
    const k = stem(raw);
    if (seen.has(k)) continue;
    seen.add(k);
    const themes = TERM_INDEX.get(k) ?? TERM_INDEX.get(raw);
    if (themes) themes.forEach((t) => bump(t, STATE_THEMES.has(t) ? 3.5 : 2));
  }

  // A tapped feeling is a direct statement, so it outweighs inference.
  feelings.forEach((t) => bump(t, 7));

  return scores;
}

/* ---------- verse scoring ---------- */

// A verse lists its themes most-central first, so later tags count for less.
const POSITION_WEIGHT = [1, 0.8, 0.62, 0.48, 0.4];

function bookOf(ref: string): string {
  const m = ref.match(/^(\d?\s?[A-Za-z]+)/);
  return m ? m[1].trim() : ref;
}

function scoreVerse(v: Verse, themeScores: Map<Theme, number>, tokens: Set<string>): number {
  let score = 0;
  v.themes.forEach((t, i) => {
    const ts = themeScores.get(t);
    if (ts) score += ts * (POSITION_WEIGHT[i] ?? 0.35);
  });

  // A small bonus when the person's own words show up in the passage or its
  // gloss — it makes matches feel answered rather than merely categorised.
  if (score > 0) {
    const hay = `${v.text} ${v.plain} ${v.why}`.toLowerCase();
    let overlap = 0;
    tokens.forEach((t) => {
      if (t.length > 3 && hay.includes(t)) overlap += 1;
    });
    score += Math.min(overlap, 4) * 0.7;
  }
  return score;
}

/* ---------- openings ---------- */

const OPENINGS: Partial<Record<Theme, string>> = {
  grief: "This reads like grief. None of what follows tries to hurry it along.",
  death: "You are near a death. Scripture does not rush past those, and neither will this.",
  despair: "This sounds heavy — heavier than a bad week. These are passages written from low ground, not about it.",
  anxiety: "There is a lot of forward-running in what you wrote. These passages mostly work to bring you back to today.",
  fear: "Something has you frightened. What follows does not argue you out of it; it puts something beside you in it.",
  loneliness: "What comes through here is being on your own with it. These are about presence more than answers.",
  anger: "There is real anger in this. Scripture does not ask you to put it down — it asks what you do next with it.",
  guilt: "You are carrying something you have done. These passages take that seriously and still do not leave you there.",
  forgiving: "You are being asked to forgive something, or asking whether you have to. These do not make it small.",
  temptation: "This is the pull of something you keep going back to. These were written by and for people who knew it.",
  doubt: "There is doubt in this, and scripture has more room for that than it is usually given credit for.",
  waiting: "You are in the middle of a wait. These are about the middle, not the end.",
  provision: "There is money pressure here. These are plain about need rather than pious about it.",
  work: "This is about work — what you do, or losing it, or what it says about you.",
  guidance: "You are at a decision. Notice how little of the road these promise to light at once.",
  illness: "There is a body in pain here. These do not explain it away.",
  injustice: "Something unjust has happened. Scripture is not neutral about that.",
  betrayal: "Someone close did this. That is a particular wound, and these passages know it.",
  marriage: "This is close-quarters — the person you share a life with.",
  friendship: "This is about the people around you, or the lack of them.",
  parenting: "This is about your child. These hold both the long view and tonight.",
  gratitude: "Something is good. It is worth stopping on that, which is what these are for.",
  pride: "There is something here about standing and how much of it is yours.",
  envy: "You are measuring yourself against someone. These go after the measuring itself.",
  exhaustion: "You sound tired in a way sleep has not been fixing.",
  newstart: "Something is starting or changing. These are for the part before it is clear.",
  enemies: "There is someone set against you here.",
  failure: "Something did not work. Notice how ordinary falling is in these.",
  identity: "Underneath this is a question about who you are and whether it is enough.",
  hope: "You are reaching for something to hold. These are what there is.",
  prayer: "This is about talking to God, or not being able to.",
  weakness: "You are at the end of what you can do. That turns out to be a place scripture takes seriously.",
  sleep: "It is late, or it has been a run of late nights.",
  peace: "You are after quiet.",
  perseverance: "You are trying to keep going.",
};

const DEFAULT_OPENING =
  "Here is what the concordance found closest to what you wrote. Take the one that lands and leave the rest.";

/* ---------- the reading ---------- */

export function findPassages(text: string, feelings: Theme[], limit = 4): Reading {
  const themeScores = scoreThemes(text, feelings);
  const norm = normalize(text);
  const tokens = new Set(contentTokens(norm).map((t) => t));

  const ranked = [...themeScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);

  const scored = VERSES.map((v) => ({ ...v, score: scoreVerse(v, themeScores, tokens) }))
    .filter((v) => v.score > 0)
    .sort((a, b) => b.score - a.score);

  // Spread the selection across books so a search does not return four psalms
  // unless the Psalms are genuinely where the answer is.
  const chosen: Passage[] = [];
  const perBook = new Map<string, number>();
  for (const v of scored) {
    if (chosen.length >= limit) break;
    const b = bookOf(v.ref);
    const n = perBook.get(b) ?? 0;
    if (n >= 2) continue;
    perBook.set(b, n + 1);
    chosen.push(v);
  }

  // Nothing matched — fall back to passages that meet almost any hard moment.
  if (chosen.length === 0) {
    const fallback = ["Psalm 34:18", "Matthew 11:28-30", "Isaiah 41:10", "Psalm 62:8"];
    fallback.forEach((ref) => {
      const v = VERSES.find((x) => x.ref === ref);
      if (v) chosen.push({ ...v, score: 0 });
    });
  }

  return {
    opening: (ranked[0] && OPENINGS[ranked[0]]) || DEFAULT_OPENING,
    themes: ranked.slice(0, 4),
    passages: chosen,
    source: "device",
  };
}

// Labels for the feeling chips, in the order they are shown.
export const FEELINGS: Array<{ key: Theme; label: string }> = [
  { key: "anxiety", label: "Anxious" },
  { key: "fear", label: "Afraid" },
  { key: "grief", label: "Grieving" },
  { key: "despair", label: "Hopeless" },
  { key: "loneliness", label: "Lonely" },
  { key: "anger", label: "Angry" },
  { key: "guilt", label: "Ashamed" },
  { key: "betrayal", label: "Betrayed" },
  { key: "temptation", label: "Tempted" },
  { key: "doubt", label: "Doubting" },
  { key: "exhaustion", label: "Exhausted" },
  { key: "envy", label: "Envious" },
  { key: "waiting", label: "Waiting" },
  { key: "failure", label: "Defeated" },
  { key: "hope", label: "Hopeful" },
  { key: "gratitude", label: "Grateful" },
];
