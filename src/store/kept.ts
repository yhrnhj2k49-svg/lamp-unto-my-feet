// Passages the reader has kept, held on the device. Nothing syncs anywhere.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import type { Verse } from "../data/verses";
import { livingFor } from "../data/living";

export type Kept = Pick<Verse, "ref" | "text" | "plain" | "why" | "setting" | "apply" | "reflect"> & {
  keptAt: number;
};

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
  const own = livingFor(v.ref);
  items.unshift({
    ref: v.ref,
    text: v.text,
    plain: v.plain,
    why: v.why,
    setting: v.setting || own?.setting,
    apply: v.apply || own?.apply,
    reflect: v.reflect || own?.reflect,
    keptAt: Date.now(),
  });
  emit();
  void persist();
}

export const isKept = (ref: string) => items.some((i) => i.ref === ref);

/** Give a kept passage the application written for the reading it was kept from. */
export function updateLiving(ref: string, p: { apply: string; reflect: string }) {
  const i = items.findIndex((x) => x.ref === ref);
  if (i < 0) return;
  items[i] = { ...items[i], apply: p.apply, reflect: p.reflect };
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
