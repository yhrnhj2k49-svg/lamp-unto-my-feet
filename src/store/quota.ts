// How many readings Claude has written this month, against what a free user gets.
//
// Everything the phone can do on its own stays free and unmetered: the
// concordance, the whole Bible, Watch and Listen, keeping passages. Only the
// requests that cost real money are counted — a reading, and a follow-up.
//
// One exception, and it is not negotiable: if what someone wrote suggests they
// may be in danger, the reading is never blocked and never counted. Nobody in
// crisis meets a paywall.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

const KEY = "lamp.quota.v1";

/** A reading plus a few follow-ups, several times a month, costs us about 50 cents. */
export const FREE_PER_MONTH = 10;

const monthNow = () => new Date().toISOString().slice(0, 7); // YYYY-MM

type State = { month: string; used: number };

let state: State = { month: monthNow(), used: 0 };
let snapshot = { used: 0, left: FREE_PER_MONTH, ready: false };
const listeners = new Set<() => void>();

const emit = (ready = true) => {
  snapshot = { used: state.used, left: Math.max(0, FREE_PER_MONTH - state.used), ready };
  listeners.forEach((l) => l());
};

const save = () => {
  AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
};

/** A new calendar month starts the allowance again. */
const rollOver = () => {
  const m = monthNow();
  if (state.month !== m) {
    state = { month: m, used: 0 };
    save();
  }
};

export async function hydrateQuota() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<State>) : null;
    if (parsed && typeof parsed.month === "string" && typeof parsed.used === "number") {
      state = { month: parsed.month, used: Math.max(0, parsed.used) };
    }
  } catch {
    // Start the month fresh rather than locking someone out on a bad read.
  }
  rollOver();
  emit();
}

/** Is there a free reading left this month? */
export function hasFreeLeft(): boolean {
  rollOver();
  return state.used < FREE_PER_MONTH;
}

/** Count one paid-for answer. Call only when Claude was actually asked. */
export function countOne() {
  rollOver();
  state.used += 1;
  save();
  emit();
}

export function useQuota() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot
  );
}
