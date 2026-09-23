// Showing a passage in the translation someone chose.
//
// The text is read out of that translation's own downloaded file, never from
// Claude and never converted from the King James. If the translation is not on
// the phone, or the reference cannot be found in it, the King James text the
// passage already carries is shown instead, labelled as such. A passage shown
// under the wrong name would be worse than showing the King James.

import { readChapter, readIndex } from "./store";

/**
 * Translations a passage can be shown in. The Catholic Public Domain Version is
 * deliberately absent: it follows the Vulgate's psalm numbering, where Psalm 23
 * is "The earth and all its fullness" — what every other Bible here calls Psalm
 * 24. Every psalm reference would land on the wrong text. It stays in the Bible
 * reader, where chapters are browsed rather than looked up by reference.
 *
 * The other nine were checked against all 167 references the app can show:
 * every one resolves, and every one matches the King James verse.
 */
export const PASSAGE_VERSIONS = ["KJV", "BSB", "NHEB", "AKJV", "ASV", "YLT", "Darby", "BBE", "Webster"];

export const NOT_FOR_PASSAGES = "CPDV";

// Book names as references write them, against the names the files use.
const ALIASES: Record<string, string> = {
  psalm: "Psalms",
  psalms: "Psalms",
  canticles: "Song of Solomon",
  "song of songs": "Song of Solomon",
  "songs of solomon": "Song of Solomon",
};

export type Ref = { book: string; chapter: number; from: number; to: number };

/** "Psalm 34:18" or "Ecclesiastes 4:9-10" → its parts. */
export function parseRef(ref: string): Ref | null {
  const m = ref.trim().match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–]\s*(\d+))?$/);
  if (!m) return null;
  const book = ALIASES[m[1].trim().toLowerCase()] ?? m[1].trim();
  const chapter = Number(m[2]);
  const from = Number(m[3]);
  const to = Number(m[4] ?? m[3]);
  if (!chapter || !from || to < from) return null;
  return { book, chapter, from, to };
}

/**
 * The passage in `version`, or null if it cannot be found there — in which case
 * the caller keeps the King James text it already has.
 */
export function passageIn(version: string, ref: string): string | null {
  const parsed = parseRef(ref);
  if (!parsed) return null;

  const index = readIndex(version);
  if (!index) return null;

  const want = parsed.book.toLowerCase();
  const bookIndex = index.books.findIndex((b) => b.n.toLowerCase() === want);
  if (bookIndex < 0) return null;

  const verses = readChapter(version, bookIndex, parsed.chapter);
  if (verses.length === 0) return null;

  const picked: string[] = [];
  for (let v = parsed.from; v <= parsed.to; v++) {
    const text = verses[v - 1];
    // A missing verse means the reference does not line up in this translation.
    // Show the King James rather than a gap or the wrong words.
    if (!text) return null;
    picked.push(text.trim());
  }
  const joined = picked.join(" ").trim();
  return joined.length > 0 ? joined : null;
}
