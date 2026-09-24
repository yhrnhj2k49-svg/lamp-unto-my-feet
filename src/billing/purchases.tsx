// Purchases, straight to Apple and Google — no third-party service in between.
//
// The honest tradeoff of doing it this way: entitlement is decided from what
// the store tells this device, with no server checking the receipt. Someone
// determined can fake an unlock. For a five-dollar subscription on a free app
// that is an acceptable risk, and it keeps a whole company out of the privacy
// policy. If this ever earns enough to be worth attacking, the fix is a receipt
// check on the Cloudflare worker, and only this file changes.
//
// Purchases need a real build. In Expo Go the native module is absent, which is
// why the library is loaded defensively: with no store, `canBuy` stays false and
// the paywall simply explains the monthly allowance instead of offering a
// button that cannot work.

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { Platform } from "react-native";
import { PRODUCTS, setEntitlement } from "./entitlement";

type Buyable = { id: string; title: string; price: string };

type Billing = {
  ready: boolean;
  canBuy: boolean;
  subscriptions: Buyable[];
  tips: Buyable[];
  buy: (id: string) => Promise<void>;
  restore: () => Promise<void>;
};

const STUB: Billing = {
  ready: false,
  canBuy: false,
  subscriptions: [],
  tips: [],
  buy: async () => {},
  restore: async () => {},
};

const Ctx = createContext<Billing>(STUB);
export const useBilling = () => useContext(Ctx);

const SUBS = [PRODUCTS.monthly, PRODUCTS.yearly];
const TIPS = [PRODUCTS.tipSmall, PRODUCTS.tipMedium, PRODUCTS.tipLarge];

// Loaded at module scope, so whether the hook below exists never changes
// between renders — the rules of hooks stay satisfied.
let IAP: typeof import("expo-iap") | null = null;
try {
  // There are no in-app purchases on the web build, and loading a native
  // module there can only break the page.
  if (Platform.OS === "web") throw new Error("no store on web");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  IAP = require("expo-iap") as typeof import("expo-iap");
} catch {
  IAP = null;
}

function Live({ children }: { children: ReactNode }) {
  const iap = IAP!.useIAP();

  useEffect(() => {
    if (!iap.connected) return;
    void iap.fetchProducts({ skus: SUBS, type: "subs" });
    void iap.fetchProducts({ skus: TIPS, type: "in-app" });
    void iap.getActiveSubscriptions(SUBS);
  }, [iap.connected]);

  // What the store says this device is entitled to.
  useEffect(() => {
    const unlimited = (iap.activeSubscriptions ?? []).length > 0;
    setEntitlement({
      plan: unlimited ? "unlimited" : "free",
      canBuy: iap.connected && (iap.subscriptions ?? []).length > 0,
      ready: true,
    });
  }, [iap.connected, iap.activeSubscriptions, iap.subscriptions]);

  const value = useMemo<Billing>(() => {
    const shape = (p: { id: string; title?: string; displayPrice?: string }): Buyable => ({
      id: p.id,
      title: p.title ?? p.id,
      price: p.displayPrice ?? "",
    });
    return {
      ready: true,
      canBuy: iap.connected && (iap.subscriptions ?? []).length > 0,
      subscriptions: (iap.subscriptions ?? []).map(shape),
      tips: (iap.products ?? []).map(shape),
      buy: async (id: string) => {
        const isTip = TIPS.includes(id as (typeof TIPS)[number]);
        await iap.requestPurchase({
          // The library keys these by SDK, not by OS name.
          request: Platform.OS === "ios" ? { apple: { sku: id } } : { google: { skus: [id] } },
          type: isTip ? "in-app" : "subs",
        });
      },
      restore: async () => {
        await iap.restorePurchases();
        await iap.getActiveSubscriptions(SUBS);
      },
    };
  }, [iap]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Finishing a purchase is what stops the store re-delivering it forever. */
function useFinishing() {
  useEffect(() => {
    if (!IAP) return;
    const sub = IAP.purchaseUpdatedListener(async (purchase) => {
      try {
        const isTip = TIPS.includes(purchase.id as (typeof TIPS)[number]);
        await IAP!.finishTransaction({ purchase, isConsumable: isTip });
      } catch {
        // Left unfinished, the store simply offers it again next launch.
      }
    });
    return () => sub.remove();
  }, []);
}

export function BillingProvider({ children }: { children: ReactNode }) {
  useFinishing();
  if (!IAP) return <Ctx.Provider value={STUB}>{children}</Ctx.Provider>;
  return <Live>{children}</Live>;
}
