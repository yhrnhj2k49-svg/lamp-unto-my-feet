// What someone has paid for, kept behind one small interface so the store
// plumbing can be swapped without touching any screen.
//
// Nothing here talks to a store yet. Until a purchase library is wired in,
// `unlimited` is false and `canBuy` is false, which means the paywall explains
// the free allowance and offers the phone's own matching — it never shows a
// buy button that cannot work.
//
// When it is wired in (RevenueCat, or expo-iap direct), only this file and its
// implementation change. Note that purchases cannot be tested in Expo Go: they
// need a development build.

import { useSyncExternalStore } from "react";

export type Plan = "free" | "unlimited";

export type Entitlement = {
  plan: Plan;
  /** True when a store is connected and products are available to buy. */
  canBuy: boolean;
  ready: boolean;
};

export const PRODUCTS = {
  monthly: "com.heanswers.app.unlimited.monthly",
  yearly: "com.heanswers.app.unlimited.yearly",
  tipSmall: "com.heanswers.app.tip.small",
  tipMedium: "com.heanswers.app.tip.medium",
  tipLarge: "com.heanswers.app.tip.large",
} as const;

let state: Entitlement = { plan: "free", canBuy: false, ready: true };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Called by whichever purchase library is wired in. */
export function setEntitlement(next: Partial<Entitlement>) {
  state = { ...state, ...next };
  emit();
}

export function useEntitlement(): Entitlement {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state
  );
}

export const isUnlimited = () => state.plan === "unlimited";
