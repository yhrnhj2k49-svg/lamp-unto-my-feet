// Downloaded translations, held on the device.
//
// A translation arrives as one gzipped file of about 1.2 MB. It is inflated
// once, then written out as one file per book, so opening a chapter parses
// roughly a hundred kilobytes instead of eight megabytes.

import { Directory, File, Paths } from "expo-file-system";
import { ungzip } from "pako";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { assetUrl } from "./catalog";

export type BookMeta = { n: string; chapters: number };
export type BibleIndex = { id: string; name: string; year: string; books: BookMeta[] };

type Wire = { id: string; name: string; year: string; books: { n: string; c: string[][] }[] };

const ACTIVE_KEY = "lamp.bible.active.v1";

// pako dropped its to:"string" option in v2, so decode the inflated bytes
// ourselves. Expo's runtime provides TextDecoder on native as well as web.
const inflateToString = (bytes: Uint8Array): string =>
  new TextDecoder().decode(ungzip(bytes));

// expo-file-system's web implementation cannot write files in this SDK, so the
// browser keeps translations in memory for the session instead. Phones use the
// filesystem and keep them for good.
const isWeb = Platform.OS === "web";
const memory = new Map<string, { index: BibleIndex; books: string[][][] }>();

const root = () => new Directory(Paths.document, "bibles");
const dirFor = (id: string) => new Directory(Paths.document, "bibles", id);
const fileIn = (id: string, name: string) => new File(Paths.document, "bibles", id, name);

/* ---------- reactive state ---------- */

let installed: string[] = [];
let active: string | null = null;
let ready = false;
const listeners = new Set<() => void>();
const emit = () => {
  installed = [...installed];
  listeners.forEach((l) => l());
};

export function useBibleState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot
  );
}

let snapshot = { installed: [] as string[], active: null as string | null, ready: false };
const refresh = () => {
  snapshot = { installed, active, ready };
  emit();
};

export async function hydrateBibles() {
  if (ready) return;
  ready = true;
  try {
    if (isWeb) {
      installed = [...memory.keys()];
    } else {
      const dir = root();
      installed = dir.exists ? dir.list().filter((e) => e instanceof Directory).map((e) => e.name) : [];
    }
  } catch {
    installed = [];
  }
  try {
    active = await AsyncStorage.getItem(ACTIVE_KEY);
  } catch {
    active = null;
  }
  if (active && !installed.includes(active)) active = installed[0] ?? null;
  if (!active && installed.length) active = installed[0];
  refresh();
}

export async function setActive(id: string) {
  active = id;
  refresh();
  try {
    await AsyncStorage.setItem(ACTIVE_KEY, id);
  } catch {}
}

/* ---------- install / remove ---------- */

export async function install(id: string) {
  const res = await fetch(assetUrl(id));
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const text = inflateToString(new Uint8Array(await res.arrayBuffer()));
  const data = JSON.parse(text) as Wire;

  const index: BibleIndex = {
    id: data.id,
    name: data.name,
    year: data.year,
    books: data.books.map((b) => ({ n: b.n, chapters: b.c.length })),
  };

  if (isWeb) {
    memory.set(id, { index, books: data.books.map((b) => b.c) });
  } else {
    const dir = dirFor(id);
    if (dir.exists) dir.delete();
    dir.create({ intermediates: true });

    data.books.forEach((b, i) => {
      const f = new File(dir, `${i}.json`);
      f.create();
      f.write(JSON.stringify(b.c));
    });

    const meta = new File(dir, "index.json");
    meta.create();
    meta.write(JSON.stringify(index));
  }

  if (!installed.includes(id)) installed.push(id);
  if (!active) await setActive(id);
  refresh();
}

export function remove(id: string) {
  try {
    if (isWeb) {
      memory.delete(id);
    } else {
      const dir = dirFor(id);
      if (dir.exists) dir.delete();
    }
  } catch {}
  installed = installed.filter((x) => x !== id);
  if (active === id) {
    active = installed[0] ?? null;
    AsyncStorage.setItem(ACTIVE_KEY, active ?? "").catch(() => {});
  }
  refresh();
}

/* ---------- reading ---------- */

export function readIndex(id: string): BibleIndex | null {
  if (isWeb) return memory.get(id)?.index ?? null;
  try {
    const f = fileIn(id, "index.json");
    if (!f.exists) return null;
    return JSON.parse(f.textSync()) as BibleIndex;
  } catch {
    return null;
  }
}

/** Verses of one chapter. Chapter numbers are 1-based, book index is 0-based. */
export function readChapter(id: string, bookIndex: number, chapter: number): string[] {
  if (isWeb) return memory.get(id)?.books[bookIndex]?.[chapter - 1] ?? [];
  try {
    const f = fileIn(id, `${bookIndex}.json`);
    if (!f.exists) return [];
    const chapters = JSON.parse(f.textSync()) as string[][];
    return chapters[chapter - 1] ?? [];
  } catch {
    return [];
  }
}

/** Everything before Matthew is the Old Testament, which holds for all ten. */
export function splitTestaments(books: BookMeta[]) {
  const nt = books.findIndex((b) => b.n === "Matthew");
  return nt < 0
    ? { old: books.map((b, i) => ({ ...b, i })), neu: [] }
    : {
        old: books.slice(0, nt).map((b, i) => ({ ...b, i })),
        neu: books.slice(nt).map((b, i) => ({ ...b, i: i + nt })),
      };
}
