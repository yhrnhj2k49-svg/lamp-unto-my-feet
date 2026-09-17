import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Sheet from "./Sheet";
import { ReadingError, reportContent, type ReportKind } from "../engine/ai";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

const REASONS = [
  { key: "harmful", label: "Harmful or offensive" },
  { key: "misleading", label: "Misleading or untrue" },
  { key: "misquote", label: "Misquotes scripture" },
  { key: "other", label: "Something else" },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  kind: ReportKind;
  /** Claude's words only. What the person wrote is never part of a report. */
  content: Record<string, unknown>;
};

export default function ReportSheet({ visible, onClose, kind, content }: Props) {
  const c = usePalette();
  const [reason, setReason] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    setReason(null);
    setState("idle");
    setError("");
  }, [visible]);

  const send = async () => {
    if (!reason || state === "sending") return;
    setState("sending");
    try {
      await reportContent(kind, reason, content);
      setState("sent");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      setError(e instanceof ReadingError ? e.message : "The report did not send.");
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <Sheet visible={visible} label="Report sent" onDismiss={onClose}>
        <Text style={[s.title, { color: c.ink }]}>Thank you</Text>
        <Text style={[s.p, { color: c.ink2 }]}>It has been reported, and will be looked at.</Text>
        <Pressable onPress={onClose} accessibilityRole="button" style={[s.btn, { backgroundColor: c.ink, borderColor: c.ink }]}>
          <Text style={[s.btnText, { color: c.ground }]}>Done</Text>
        </Pressable>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} label="Report this" onDismiss={state === "sending" ? undefined : onClose}>
      <Text style={[s.title, { color: c.ink }]}>Report this</Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        What is wrong with it? Only what Claude wrote is sent. Your own words are not included.
      </Text>

      <View style={s.reasons} accessibilityRole="radiogroup">
        {REASONS.map((r) => {
          const on = reason === r.key;
          return (
            <Pressable
              key={r.key}
              onPress={() => setReason(r.key)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={[s.reason, { borderColor: on ? c.rubric : c.rule, backgroundColor: on ? c.rubricWash : "transparent" }]}
            >
              <Text style={[s.reasonText, { color: on ? c.rubric : c.ink }]}>{r.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {state === "failed" ? <Text style={[s.p, { color: c.rubric }]}>{error} Try again.</Text> : null}

      <View style={s.buttons}>
        <Pressable
          onPress={send}
          disabled={!reason || state === "sending"}
          accessibilityRole="button"
          accessibilityState={{ disabled: !reason || state === "sending", busy: state === "sending" }}
          style={[
            s.btn,
            reason ? { backgroundColor: c.ink, borderColor: c.ink } : { borderColor: c.rule },
          ]}
        >
          {state === "sending" ? (
            <ActivityIndicator size="small" color={c.ground} />
          ) : (
            <Text style={[s.btnText, { color: reason ? c.ground : c.ink3 }]}>Send report</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} disabled={state === "sending"} accessibilityRole="button" hitSlop={8} style={s.cancel}>
          <Text style={[label, { color: c.ink3 }]}>Cancel</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30 },
  p: { fontFamily: font.ui, fontSize: 14, lineHeight: 22 },
  reasons: { gap: space.sm },
  reason: { borderWidth: 1, borderRadius: 1, paddingVertical: 12, paddingHorizontal: 14 },
  reasonText: { fontFamily: font.ui, fontSize: 14 },
  buttons: { gap: space.sm, marginTop: space.xs },
  btn: { borderWidth: 1, borderRadius: 1, paddingVertical: 14, alignItems: "center", minHeight: 48, justifyContent: "center" },
  btnText: { fontFamily: font.uiSemi, fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase" },
  cancel: { alignItems: "center", paddingVertical: 8 },
});
