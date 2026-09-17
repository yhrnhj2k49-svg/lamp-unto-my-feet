import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { personalLiving, type Personal } from "../engine/ai";
import ReportSheet from "./ReportSheet";
import type { Theme } from "../data/verses";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

export type Personalize = { situation: string; feelings: Theme[]; ref: string; why: string };

type Props = {
  setting?: string;
  apply?: string;
  reflect?: string;
  /** When present, opening this asks Claude to write it for that situation. */
  personalize?: Personalize;
  onPersonal?: (p: Personal) => void;
};

/**
 * "How to live this": closed by default, so the passage itself is still the
 * first thing read. When the passage came from Claude's reading, opening it
 * asks Claude to write the application for the situation described. The
 * general version shows in the meantime, and stays if that fails.
 */
export default function Living({ setting, apply, reflect, personalize, onPersonal }: Props) {
  const c = usePalette();
  const [open, setOpen] = useState(false);
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [status, setStatus] = useState<"idle" | "writing" | "failed">("idle");
  const [reporting, setReporting] = useState(false);

  // A reply that lands after this card has gone must not write anywhere.
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    []
  );

  if (!setting && !apply && !reflect) return null;

  const toggle = async () => {
    Haptics.selectionAsync().catch(() => {});
    const next = !open;
    setOpen(next);
    // Written once per card. A failure is retried the next time it is opened.
    if (!next || !personalize || personal || status === "writing") return;

    setStatus("writing");
    try {
      const p = await personalLiving(
        personalize.situation,
        personalize.feelings,
        personalize.ref,
        personalize.why
      );
      if (!alive.current) return;
      setPersonal(p);
      setStatus("idle");
      onPersonal?.(p);
    } catch {
      if (alive.current) setStatus("failed");
    }
  };

  const writing = status === "writing";
  const shownApply = personal?.apply ?? apply;
  const shownReflect = personal?.reflect ?? reflect;

  return (
    <View style={[s.wrap, { borderTopColor: c.ruleSoft }]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, busy: writing }}
        accessibilityLabel="How to live this"
        hitSlop={8}
        style={s.toggle}
      >
        <Text style={[label, { color: c.indigo }]}>How to live this</Text>
        <Text style={[s.sign, { color: c.indigo }]}>{open ? "−" : "+"}</Text>
      </Pressable>

      {open ? (
        <View style={s.body}>
          <View accessibilityLiveRegion="polite">
            {writing ? (
              <View style={s.caption}>
                <ActivityIndicator size="small" color={c.rubric} />
                <Text style={[s.captionText, { color: c.ink3 }]}>
                  Writing this for what you described…
                </Text>
              </View>
            ) : personal ? (
              <Text style={[s.captionText, { color: c.ink3 }]}>
                Written for what you described.{"   "}
                <Text
                  onPress={() => setReporting(true)}
                  accessibilityRole="button"
                  style={{ textDecorationLine: "underline" }}
                >
                  Report
                </Text>
              </Text>
            ) : status === "failed" ? (
              <Text style={[s.captionText, { color: c.ink3 }]}>
                Could not reach Claude, so this is the general version. Close and reopen to try again.
              </Text>
            ) : null}
          </View>

          {setting ? (
            <View style={s.block}>
              <Text style={[label, { color: c.gilt }]}>The setting</Text>
              <Text style={[s.text, { color: c.ink2 }]}>{setting}</Text>
            </View>
          ) : null}
          {shownApply ? (
            <View style={[s.block, writing && s.pending]}>
              <Text style={[label, { color: c.gilt }]}>Living it</Text>
              <Text style={[s.text, { color: c.ink }]}>{shownApply}</Text>
            </View>
          ) : null}
          {shownReflect ? (
            <View style={[s.block, s.question, { borderLeftColor: c.giltBright }, writing && s.pending]}>
              <Text style={[label, { color: c.gilt }]}>To sit with</Text>
              <Text style={[s.reflect, { color: c.ink }]}>{shownReflect}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {personal ? (
        <ReportSheet
          visible={reporting}
          onClose={() => setReporting(false)}
          kind="living"
          content={{ ref: personalize?.ref, apply: personal.apply, reflect: personal.reflect }}
        />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: space.md, borderTopWidth: 1, paddingTop: space.xs },
  toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  sign: { fontFamily: font.uiMedium, fontSize: 17, lineHeight: 18 },
  body: { gap: space.md, marginTop: space.xs, paddingBottom: space.xs },
  caption: { flexDirection: "row", alignItems: "center", gap: space.sm },
  captionText: { fontFamily: font.ui, fontSize: 12, lineHeight: 18 },
  block: { gap: 4 },
  // The general text is about to be replaced; show it, but quietly.
  pending: { opacity: 0.55 },
  text: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
  question: { borderLeftWidth: 2, paddingLeft: 12 },
  reflect: { fontFamily: font.serifItalic, fontSize: 16.5, lineHeight: 25 },
});
