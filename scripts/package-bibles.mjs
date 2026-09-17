// Turns the source translation JSON into the compact, gzipped files the app
// downloads. Run from the repo root:
//
//   node scripts/package-bibles.mjs            # uses ./.bible-src, fetching if absent
//
// Source texts come from github.com/scrollmapper/bible_databases (MIT repo;
// the translations themselves are public domain). Fetched with the gh CLI
// because the raw hosts are not always reachable directly.

import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { mkdirSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";

export const TRANSLATIONS = [
  { id: "BSB",     name: "Berean Standard Bible",     year: "2022", note: "Modern English. The most readable of the free translations." },
  { id: "NHEB",    name: "New Heart English Bible",   year: "2010", note: "Modern English, in the King James tradition." },
  { id: "KJV",     name: "King James Version",        year: "1769", note: "The classic. Formal, familiar, four centuries old." },
  { id: "AKJV",    name: "American King James",       year: "1999", note: "The King James wording with archaic words updated." },
  { id: "ASV",     name: "American Standard Version", year: "1901", note: "Precise and literal. The basis of many later translations." },
  { id: "YLT",     name: "Young's Literal Translation", year: "1898", note: "Word-for-word from the original. Useful for study, hard to read aloud." },
  { id: "Darby",   name: "Darby Bible",               year: "1890", note: "A literal translation with careful attention to tense." },
  { id: "BBE",     name: "Bible in Basic English",    year: "1965", note: "A deliberately small vocabulary. The plainest English here." },
  { id: "CPDV",    name: "Catholic Public Domain",    year: "2009", note: "Includes the twelve deuterocanonical books." },
  { id: "Webster", name: "Webster's Bible",           year: "1833", note: "Noah Webster's revision of the King James." },
];

// The source spells numbered books with Roman numerals ("II Timothy") and calls
// the last book "Revelation of John". Readers expect "2 Timothy" and
// "Revelation", and so does Bible Gateway when chapters link out.
function bookName(name) {
  if (name === "Revelation of John") return "Revelation";
  return name.replace(/^III /, "3 ").replace(/^II /, "2 ").replace(/^I /, "1 ");
}

const SRC = ".bible-src";
const OUT = ".bible-dist";

function fetchSource(id) {
  const path = `${SRC}/${id}.json`;
  if (existsSync(path) && statSync(path).size > 0) return path;
  console.log(`  fetching ${id}...`);
  const raw = execFileSync("gh", [
    "api", "-H", "Accept: application/vnd.github.raw",
    `repos/scrollmapper/bible_databases/contents/formats/json/${id}.json`,
  ], { maxBuffer: 64 * 1024 * 1024 });
  writeFileSync(path, raw);
  return path;
}

mkdirSync(SRC, { recursive: true });
mkdirSync(OUT, { recursive: true });

const catalog = [];
for (const t of TRANSLATIONS) {
  const src = JSON.parse(readFileSync(fetchSource(t.id), "utf8"));

  // Strip the repeated keys: a book becomes a name plus chapters of verse
  // strings. Roughly halves the payload before gzip even runs.
  const books = src.books.map((b) => ({
    n: bookName(b.name),
    c: b.chapters.map((ch) => ch.verses.map((v) => v.text)),
  }));

  const payload = JSON.stringify({ id: t.id, name: t.name, year: t.year, books });
  const gz = gzipSync(Buffer.from(payload), { level: 9 });
  writeFileSync(`${OUT}/${t.id}.json.gz`, gz);

  const verses = books.reduce((n, b) => n + b.c.reduce((m, c) => m + c.length, 0), 0);
  catalog.push({ ...t, books: books.length, verses, bytes: gz.length });
  console.log(`  ${t.id.padEnd(8)} ${String(books.length).padStart(3)} books  ${String(verses).padStart(6)} verses  ${(gz.length / 1024 / 1024).toFixed(2)} MB`);
}

writeFileSync(`${OUT}/catalog.json`, JSON.stringify(catalog, null, 2));
console.log(`\ntotal download if someone takes all ten: ${(catalog.reduce((n, c) => n + c.bytes, 0) / 1024 / 1024).toFixed(1)} MB`);
