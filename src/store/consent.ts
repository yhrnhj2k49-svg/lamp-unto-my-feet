// Whether Claude may read what someone writes. Asked once, before the first
// reading would be sent, and changeable any time in About. Nothing leaves the
// phone until the answer is yes. (Apple guideline 5.1.2(i).)

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";

export type Consent = "granted" | "declined" | null;

const KEY = "lamp.consent.v1";

let value: Consent = null;
let snapshot: { value: Consent; ready: boolean } = { value: null, ready: false };
const listeners = new Set<() => void>();
const emit = (ready = true) => {
  snapshot = { value, ready };
  listeners.forEach((l) => l());
};

export async function hydrateConsent() {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    value = stored === "granted" || stored === "declined" ? stored : null;
  } catch {
    value = null;
  }
  emit();
}

export async function setConsent(next: "granted" | "declined") {
  value = next;
  emit();
  try {
    await AsyncStorage.setItem(KEY, next);
  } catch {
    // The choice still holds for this session.
  }
}

export function useConsent() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot
  );
}
