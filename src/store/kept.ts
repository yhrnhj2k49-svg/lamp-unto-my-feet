// Passages the reader has kept, held on the device. Nothing syncs anywhere.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import type { Verse } from "../data/verses";

export type Kept = Pick<Verse, "ref" | "text" | "plain" | "why"> & { keptAt: number };

const KEY = "lamp.kept.v1";

let items: Kept[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  items = [...items];
  listeners.forEach((l) => l());
}

async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // A failed write should never take the screen down with it.
  }
}

export async function hydrate() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    items = [];
  }
  emit();
}

export function keep(v: Verse) {
  if (items.some((i) => i.ref === v.ref)) return;
  items.unshift({ ref: v.ref, text: v.text, plain: v.plain, why: v.why, keptAt: Date.now() });
  emit();
  void persist();
}

export function drop(ref: string) {
  items = items.filter((i) => i.ref !== ref);
  emit();
  void persist();
}

export function toggle(v: Verse) {
  items.some((i) => i.ref === v.ref) ? drop(v.ref) : keep(v);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useKept(): Kept[] {
  return useSyncExternalStore(subscribe, () => items, () => items);
}
