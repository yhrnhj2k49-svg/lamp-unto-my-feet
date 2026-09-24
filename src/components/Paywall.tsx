// Shown when the month's free readings are used up.
//
// It says plainly what it costs to run and what stays free, and the way out is
// always visible: the phone's own concordance keeps working, unmetered, with
// nothing sent anywhere. Someone who cannot pay is not left with nothing.

import { Pressable, StyleSheet, Text, View } from "react-native";
import Sheet from "./Sheet";
import Fleuron from "./Fleuron";
import { FREE_PER_MONTH, useQuota } from "../store/quota";
import { useEntitlement } from "../billing/entitlement";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

export default function Paywall({
  visible,
  onClose,
  onBuy,
}: {
  visible: boolean;
  onClose: () => void;
  /** Absent until a store is wired in. */
  onBuy?: (product: "monthly" | "yearly") => void;
}) {
  const c = usePalette();
  const { used } = useQuota();
  const { canBuy } = useEntitlement();

  return (
    <Sheet visible={visible} label="Readings this month" onDismiss={onClose}>
      <Text style={[s.title, { color: c.ink }]}>That is this month's readings</Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        You have had {used} of {FREE_PER_MONTH} readings written by Claude this month. Each one
        costs real money to produce, which is why there is a limit rather than an advert.
      </Text>

      <Fleuron tight />

      <Text style={[label, { color: c.gilt }]}>Still free, always</Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        Passages matched on this phone, the whole Bible in ten translations, everything under Watch
        and Listen, and every passage you have kept. None of it is metered, and none of it is sent
        anywhere.
      </Text>

      {canBuy && onBuy ? (
        <View style={s.buttons}>
          <Pressable
            onPress={() => onBuy("yearly")}
            accessibilityRole="button"
            style={[s.btn, { backgroundColor: c.ink, borderColor: c.ink }]}
          >
            <Text style={[s.btnText, { color: c.ground }]}>Unlimited readings — yearly</Text>
          </Pressable>
          <Pressable
            onPress={() => onBuy("monthly")}
            accessibilityRole="button"
            style={[s.btn, { borderColor: c.rule }]}
          >
            <Text style={[s.btnText, { color: c.ink }]}>Unlimited readings — monthly</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={[s.soon, { color: c.ink3, borderLeftColor: c.gilt }]}>
          Unlimited readings are not on sale yet. Until they are, the allowance starts again at the
          beginning of next month.
        </Text>
      )}

      <Pressable onPress={onClose} accessibilityRole="button" style={[s.btn, { borderColor: c.rule }]}>
        <Text style={[s.btnText, { color: c.ink }]}>Keep reading on this phone</Text>
      </Pressable>

      <Text style={[s.small, { color: c.ink3 }]}>
        If you are in danger, nothing here is counted or blocked.
      </Text>
    </Sheet>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 24, marginBottom: space.sm },
  p: { fontFamily: font.serif, fontSize: 15.5, lineHeight: 24, marginBottom: space.sm },
  buttons: { gap: space.sm, marginTop: space.md },
  btn: { borderWidth: 1, paddingVertical: 13, alignItems: "center", marginTop: space.sm },
  btnText: { fontFamily: font.uiSemi, fontSize: 13.5, letterSpacing: 0.4 },
  soon: {
    fontFamily: font.serifItalic,
    fontSize: 14.5,
    lineHeight: 22,
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginTop: space.md,
  },
  small: { fontFamily: font.ui, fontSize: 11.5, lineHeight: 18, marginTop: space.md },
});
