// Which translation passages are shown in. The King James is the default,
// because it is the text the app carries and always has, with or without a
// download. Any other choice reads from that translation's own file.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { PASSAGE_VERSIONS } from "../bible/lookup";

const KEY = "lamp.passages.version.v1";
export const DEFAULT_VERSION = "KJV";

let value = DEFAULT_VERSION;
let snapshot = { value: DEFAULT_VERSION, ready: false };
const listeners = new Set<() => void>();
const emit = (ready = true) => {
  snapshot = { value, ready };
  listeners.forEach((l) => l());
};

export async function hydrateVersion() {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    value = stored && PASSAGE_VERSIONS.includes(stored) ? stored : DEFAULT_VERSION;
  } catch {
    value = DEFAULT_VERSION;
  }
  emit();
}

export async function setVersion(next: string) {
  value = PASSAGE_VERSIONS.includes(next) ? next : DEFAULT_VERSION;
  emit();
  try {
    await AsyncStorage.setItem(KEY, value);
  } catch {
    // The choice still holds for this session.
  }
}

export function useVersion() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot
  );
}
