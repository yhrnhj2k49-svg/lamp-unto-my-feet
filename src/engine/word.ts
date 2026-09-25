// A word tapped in a verse, looked up more closely.
//
// The offline glossary in src/data/archaic.ts answers most of these instantly.
// This is for the rest, and for the word behind the word: the Hebrew or Greek,
// what it covers, and where else it is used tellingly.

import { ENDPOINT, ReadingError } from "./ai";

export type WordStudy = {
  plain: string;
  /** Transliterated Hebrew or Greek, or empty when the server was not certain. */
  original: string;
  range: string;
  elsewhere: string;
};

const TIMEOUT_MS = 30_000;

export async function wordStudy(ref: string, text: string, word: string): Promise<WordStudy> {
  if (!ENDPOINT) throw new ReadingError("That needs Claude's reading, which is off.");
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT.replace(/\/+$/, "")}/word`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, text, word }),
      signal: abort.signal,
    });
  } catch {
    throw new ReadingError(abort.signal.aborted ? "That took too long." : "Could not reach the reading service.");
  } finally {
    clearTimeout(timer);
  }

  const data = (await res.json().catch(() => ({}))) as Partial<WordStudy> & { error?: string };
  if (!res.ok) throw new ReadingError(data.error ?? `That failed (${res.status}).`);
  if (!data.plain) throw new ReadingError("It came back empty.");
  return {
    plain: data.plain.trim(),
    original: (data.original ?? "").trim(),
    range: (data.range ?? "").trim(),
    elsewhere: (data.elsewhere ?? "").trim(),
  };
}
