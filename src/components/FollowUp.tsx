// Keep going: what to do when the passages did not land, or a question is left
// over. The thread lives in memory for this search only — nothing is written to
// the phone and nothing is kept on the server.

import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import { followUp, ReadingError, type Turn } from "../engine/ai";
import { findPassages } from "../engine/match";
import { CRISIS_NOTE, needsCrisisNote } from "../engine/safety";
import { countOne, hasFreeLeft } from "../store/quota";
import { isUnlimited } from "../billing/entitlement";
import type { Theme, Verse } from "../data/verses";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";
import Fleuron from "./Fleuron";
import GoldRule from "./GoldRule";
import Passage from "./Passage";
import ReportSheet from "./ReportSheet";

type Entry =
  | { kind: "said"; text: string }
  | { kind: "reply"; text: string; passages: Array<Verse & { score: number }>; onPhone?: boolean };

// Eight exchanges is plenty for one sitting, and it keeps the cost of a
// runaway thread bounded.
const MAX_EXCHANGES = 8;

const STARTERS = [
  { key: "different", label: "Different passages", says: "These did not quite fit. Could you show me different ones?" },
  { key: "deeper", label: "Go deeper", says: "Go deeper on what these are saying to my situation." },
] as const;

export default function FollowUp({
  situation,
  feelings,
  shown,
  aiOn,
  consentDeclined,
  onNeedConsent,
  onOutOfReadings,
}: {
  situation: string;
  feelings: Theme[];
  shown: Verse[];
  aiOn: boolean;
  consentDeclined: boolean;
  /** Opens the same permission sheet the first reading uses. */
  onNeedConsent: () => void;
  /** The month's free readings are gone; the screen above shows why. */
  onOutOfReadings: () => void;
}) {
  const c = usePalette();
  const [thread, setThread] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  const [reporting, setReporting] = useState<string | null>(null);
  const input = useRef<TextInput>(null);

  const exchanges = thread.filter((e) => e.kind === "said").length;
  const spent = exchanges >= MAX_EXCHANGES;

  // Every reference this person has already been shown, so none comes back.
  const seenRefs = () => [...shown.map((p) => p.ref), ...thread.flatMap((e) => (e.kind === "reply" ? e.passages.map((p) => p.ref) : []))];

  const history = (): Turn[] =>
    thread.map((e) => ({ role: e.kind === "said" ? ("user" as const) : ("assistant" as const), text: e.text }));

  // Without Claude there is still one useful answer: other passages from the
  // phone's own concordance that it did not show the first time.
  const onPhoneAlternatives = (said: string) => {
    const seen = new Set(seenRefs());
    const more = findPassages(situation, feelings, 12).passages.filter((p) => !seen.has(p.ref)).slice(0, 3);
    setThread((t) => [
      ...t,
      { kind: "said", text: said },
      {
        kind: "reply",
        onPhone: true,
        text: more.length
          ? "Matched on this phone, these are the next closest to what you wrote."
          : "This phone has nothing else close to what you wrote. Turning on Claude's reading would let it look properly.",
        passages: more,
      },
    ]);
  };

  // "Different passages" is answerable on the phone; anything else is a question.
  const needsClaude = (said: string) => said !== STARTERS[0].says;

  const send = async (said: string) => {
    const message = said.trim();
    if (!message || busy || spent) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDraft("");
    setFailed("");

    if (!aiOn) {
      if (consentDeclined || !needsClaude(message)) return onPhoneAlternatives(message);
      onNeedConsent();
      return;
    }

    // Same rule as a reading: danger is never counted or blocked; otherwise a
    // follow-up spends one of the month's free answers.
    const urgent = needsCrisisNote(message);
    if (!urgent && !isUnlimited() && !hasFreeLeft()) {
      onOutOfReadings();
      return;
    }
    if (!urgent && !isUnlimited()) countOne();

    const asked = history();
    const refs = seenRefs();
    setThread((t) => [...t, { kind: "said", text: message }]);
    setBusy(true);
    try {
      const { reply, passages } = await followUp({ situation, feelings, shown: refs, history: asked, message });
      setThread((t) => [...t, { kind: "reply", text: reply, passages }]);
    } catch (e) {
      setFailed(e instanceof ReadingError ? e.message : "That could not be answered.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.wrap}>
      <View style={[s.head, { paddingBottom: space.sm + 6 }]}>
        <GoldRule pinned />
        <Text style={[s.title, { color: c.ink }]}>Keep going</Text>
      </View>
      <Text style={[s.intro, { color: c.ink2 }]}>
        {aiOn
          ? "If these did not meet it, say so. Ask anything left over."
          : "Ask for other passages, or turn on Claude's reading to ask a question."}
      </Text>

      {thread.map((e, i) =>
        e.kind === "said" ? (
          <Text key={i} style={[s.said, { color: c.ink2, borderLeftColor: c.rule }]}>
            {e.text}
          </Text>
        ) : (
          <View key={i} style={s.replyWrap}>
            {needsCrisisNote(thread[i - 1]?.text ?? "") ? (
              <View style={[s.crisis, { borderColor: c.rubric }]}>
                <Text style={[s.crisisTitle, { color: c.rubric }]}>{CRISIS_NOTE.title}</Text>
                <Text style={[s.crisisBody, { color: c.ink }]}>{CRISIS_NOTE.body}</Text>
                {CRISIS_NOTE.lines.map((l) => (
                  <Text key={l} style={[s.crisisLine, { color: c.ink2 }]}>
                    {l}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={[s.reply, { color: c.ink }]}>{e.text}</Text>
            {e.passages.map((p, n) => (
              <Passage
                key={`${i}|${p.ref}`}
                verse={p}
                theme={p.themes?.[0]}
                first={n === 0}
                personalize={!e.onPhone && aiOn ? { situation, feelings } : undefined}
              />
            ))}
            {!e.onPhone ? (
              <Pressable onPress={() => setReporting(e.text)} hitSlop={8} accessibilityRole="button">
                <Text style={[s.report, { color: c.ink3, borderBottomColor: c.rule }]}>Report this reply</Text>
              </Pressable>
            ) : null}
            <Fleuron tight />
          </View>
        )
      )}

      {busy ? (
        <View style={[s.busy, { borderColor: c.rule, backgroundColor: c.panel }]} accessibilityLiveRegion="polite">
          <ActivityIndicator size="small" color={c.rubric} />
          <Text style={[s.busyText, { color: c.ink2 }]}>Reading what you said.</Text>
        </View>
      ) : null}

      {failed ? <Text style={[s.failed, { color: c.ink3, borderLeftColor: c.gilt }]}>{failed}</Text> : null}

      {spent ? (
        <Text style={[s.spent, { color: c.ink3 }]}>
          That is as far as this thread goes. Write what you are carrying again above to begin a new one.
        </Text>
      ) : (
        <>
          <View style={s.starters}>
            {STARTERS.map((st) => (
              <Pressable
                key={st.key}
                onPress={() => send(st.says)}
                disabled={busy}
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.chip,
                  { borderColor: c.rule, backgroundColor: pressed ? c.recess : "transparent" },
                ]}
              >
                <Text style={[s.chipText, { color: c.ink2 }]}>{st.label}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => input.current?.focus()}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [
                s.chip,
                { borderColor: c.rule, backgroundColor: pressed ? c.recess : "transparent" },
              ]}
            >
              <Text style={[s.chipText, { color: c.ink2 }]}>I have a question</Text>
            </Pressable>
          </View>

          <View style={[s.composer, { borderColor: c.rule, backgroundColor: c.panel }]}>
            <TextInput
              ref={input}
              style={[s.input, { color: c.ink }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask, or say what did not fit."
              placeholderTextColor={c.ink3}
              multiline
              editable={!busy}
              accessibilityLabel="Ask a follow-up question"
            />
            <Pressable
              onPress={() => send(draft)}
              disabled={busy || draft.trim().length === 0}
              accessibilityRole="button"
              style={({ pressed }) => [
                s.send,
                {
                  borderColor: draft.trim() ? c.ink : c.rule,
                  backgroundColor: pressed ? c.recess : "transparent",
                  opacity: draft.trim() ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[label, { color: draft.trim() ? c.ink : c.ink3 }]}>Send</Text>
            </Pressable>
          </View>
        </>
      )}

      <ReportSheet
        visible={reporting !== null}
        onClose={() => setReporting(null)}
        kind="followup"
        content={{ reply: reporting ?? "" }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: space.xl, gap: space.sm },
  head: {},
  title: { fontFamily: font.display, fontSize: 26 },
  intro: { fontFamily: font.serifItalic, fontSize: 15.5, lineHeight: 24 },
  said: {
    fontFamily: font.serifItalic,
    fontSize: 16,
    lineHeight: 25,
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginTop: space.md,
  },
  replyWrap: { marginTop: space.sm },
  reply: { fontFamily: font.serif, fontSize: 17, lineHeight: 28 },
  report: {
    fontFamily: font.ui,
    fontSize: 12,
    borderBottomWidth: 1,
    alignSelf: "flex-start",
    paddingBottom: 1,
    marginTop: space.md,
  },
  busy: { flexDirection: "row", gap: space.md, alignItems: "center", borderWidth: 1, padding: space.md, marginTop: space.md },
  busyText: { fontFamily: font.ui, fontSize: 13.5, flex: 1 },
  failed: { fontFamily: font.ui, fontSize: 13, borderLeftWidth: 2, paddingLeft: 12, marginTop: space.md },
  spent: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 23, marginTop: space.md },
  starters: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.md },
  chip: { borderWidth: 1, borderRadius: 1, paddingVertical: 7, paddingHorizontal: 11 },
  chipText: { fontFamily: font.ui, fontSize: 13 },
  composer: { borderWidth: 1, padding: space.md, gap: space.sm, marginTop: space.sm },
  input: { fontFamily: font.serif, fontSize: 16.5, lineHeight: 26, minHeight: 64 },
  send: { borderWidth: 1, paddingVertical: 9, alignItems: "center" },
  crisis: { borderWidth: 1, padding: space.md, gap: 4, marginBottom: space.md },
  crisisTitle: { fontFamily: font.uiSemi, fontSize: 13 },
  crisisBody: { fontFamily: font.serif, fontSize: 15, lineHeight: 23 },
  crisisLine: { fontFamily: font.ui, fontSize: 13, lineHeight: 20 },
});
