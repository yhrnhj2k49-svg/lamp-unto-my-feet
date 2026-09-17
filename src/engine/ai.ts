// The reading: Claude reads what someone wrote and chooses the passages.
//
// The app binary holds no API key — it posts to the reading server in server/,
// which holds the key. Set EXPO_PUBLIC_READING_ENDPOINT to point at it. With no
// endpoint set the app runs entirely on the device concordance, which is also
// what it falls back to whenever a reading cannot be made.

import type { Reading } from "./match";
import type { Theme, Verse } from "../data/verses";

export const ENDPOINT = process.env.EXPO_PUBLIC_READING_ENDPOINT ?? "";

export const aiAvailable = ENDPOINT.length > 0;

const TIMEOUT_MS = 45_000;

type Wire = { opening?: unknown; passages?: Array<Record<string, unknown>>; error?: unknown };

// Also decodes \u2014-style escapes, which Claude occasionally doubles in a
// structured reply. The server does this too; this covers an older deployment.
function str(v: unknown): string {
  return typeof v === "string"
    ? v.trim().replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    : "";
}

export class ReadingError extends Error {}

/**
 * Ask the server for a reading. Anything malformed is rejected rather than
 * rendered — a passage with no text is worse than no passage, and the caller
 * falls back to the device concordance on any throw.
 */
export async function closerReading(text: string, feelings: Theme[]): Promise<Reading> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, feelings }),
      signal: abort.signal,
    });
  } catch (e) {
    throw new ReadingError(
      abort.signal.aborted ? "The reading took too long." : "Could not reach the reading service."
    );
  } finally {
    clearTimeout(timer);
  }

  const data = (await res.json().catch(() => ({}))) as Wire;

  if (!res.ok) throw new ReadingError(str(data.error) || `The reading failed (${res.status}).`);

  const passages = (data.passages ?? [])
    .map((p): Verse & { score: number } => ({
      ref: str(p.ref),
      text: str(p.text),
      plain: str(p.plain),
      why: str(p.why),
      themes: (Array.isArray(p.themes) ? p.themes : []) as Theme[],
      score: 0,
    }))
    .filter((p) => p.ref && p.text);

  if (passages.length === 0) throw new ReadingError("The reading came back empty.");

  return {
    opening: str(data.opening) || "Here is what these passages say to what you wrote.",
    themes: [],
    passages,
    source: "reading",
  };
}

export type Personal = { apply: string; reflect: string };

/**
 * "How to live this" for one passage, written for the situation. Only asked for
 * when someone opens it. The caller keeps showing the general version until this
 * resolves, and if it throws.
 */
export async function personalLiving(
  situation: string,
  feelings: Theme[],
  ref: string,
  why: string
): Promise<Personal> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT.replace(/\/+$/, "")}/living`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: situation, feelings, ref, why }),
      signal: abort.signal,
    });
  } catch {
    throw new ReadingError(abort.signal.aborted ? "That took too long." : "Could not reach the reading service.");
  } finally {
    clearTimeout(timer);
  }

  const data = (await res.json().catch(() => ({}))) as { apply?: unknown; reflect?: unknown; error?: unknown };
  if (!res.ok) throw new ReadingError(str(data.error) || `That failed (${res.status}).`);

  const apply = str(data.apply);
  const reflect = str(data.reflect);
  if (!apply || !reflect) throw new ReadingError("It came back empty.");
  return { apply, reflect };
}
