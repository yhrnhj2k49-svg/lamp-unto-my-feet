import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { FEELINGS, findPassages, type Reading } from "../../src/engine/match";
import { CRISIS_NOTE, needsCrisisNote } from "../../src/engine/safety";
import { aiAvailable, closerReading, ReadingError } from "../../src/engine/ai";
import type { Theme } from "../../src/data/verses";
import Passage from "../../src/components/Passage";
import PageGlow from "../../src/components/PageGlow";
import ConsentSheet from "../../src/components/ConsentSheet";
import ReportSheet from "../../src/components/ReportSheet";
import FollowUp from "../../src/components/FollowUp";
import { setConsent, useConsent } from "../../src/store/consent";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import GoldRule from "../../src/components/GoldRule";

// The screen opens on a worked example rather than an empty shell, so the
// first thing anyone sees is the thing the app actually does.
const EXAMPLE_QUERY =
  "I just found out I'm being laid off after eleven years. I'm ashamed to tell my wife and I don't know who I am without this job.";

const PROMPT =
  "Write it the way you would say it out loud. What happened, and where it has left you.";

export default function ReadScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const scroller = useRef<ScrollView>(null);

  const [text, setText] = useState("");
  const [feelings, setFeelings] = useState<Theme[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [answered, setAnswered] = useState("");
  const [busy, setBusy] = useState(false);
  const [fellBack, setFellBack] = useState("");
  const [answeredKey, setAnsweredKey] = useState("");
  const [answeredFeelings, setAnsweredFeelings] = useState<Theme[]>([]);
  const [asking, setAsking] = useState<{ q: string; picked: Theme[]; id: number } | null>(null);
  const [reporting, setReporting] = useState(false);
  // Permission asked from the follow-up section. Kept apart from `asking` so
  // saying yes there turns Claude on without paying for the reading twice.
  const [askingForFollowUp, setAskingForFollowUp] = useState(false);
  const { value: consent } = useConsent();
  const aiOn = aiAvailable && consent === "granted";

  // Every search is numbered, and only the newest may update the screen. A
  // slow reading for an earlier search must never land on top of a later one.
  const latest = useRef(0);

  const example = useMemo(() => findPassages(EXAMPLE_QUERY, []), []);
  const shown = reading ?? example;
  const isExample = reading === null;
  const crisis = !isExample && needsCrisisNote(answered);
  const ready = text.trim().length > 2 || feelings.length > 0;
  const key = `${text.trim()}|${feelings.join(",")}`;
  // Pressing again on the very search Claude is still reading would only pay
  // for the same reading twice. A changed search can go straight away.
  const canSearch = ready && !(busy && key === answeredKey);

  // New results settle in rather than snapping, unless reduced motion is on.
  const fade = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);
  useEffect(() => {
    if (!reading || reduceMotion) return;
    fade.setValue(0.25);
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [reading, reduceMotion, fade]);

  const toggleFeeling = (k: Theme) => {
    Haptics.selectionAsync().catch(() => {});
    setFeelings((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  };

  const search = async () => {
    if (!canSearch) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const q = text.trim();
    const picked = feelings;
    const id = ++latest.current;
    setAnswered(q);
    setAnsweredKey(key);
    setAnsweredFeelings(picked);
    setFellBack("");

    // The phone's own match lands at once, so there is something to read
    // straight away, whatever happens next.
    setReading(findPassages(q, picked));
    requestAnimationFrame(() => scroller.current?.scrollTo({ y: 320, animated: true }));

    if (!aiAvailable || consent === "declined") return;

    // Nothing is sent until the person has said yes. The phone's match is
    // already on screen while they decide.
    if (consent !== "granted") {
      setAsking({ q, picked, id });
      return;
    }
    await readWithClaude(q, picked, id);
  };

  const allow = () => {
    if (askingForFollowUp) {
      setAskingForFollowUp(false);
      void setConsent("granted");
      return;
    }
    const pending = asking;
    setAsking(null);
    void setConsent("granted");
    if (pending && pending.id === latest.current) void readWithClaude(pending.q, pending.picked, pending.id);
  };

  const decline = () => {
    setAskingForFollowUp(false);
    setAsking(null);
    void setConsent("declined");
  };

  // Claude reads it more closely and replaces the phone's match when done. If
  // that fails, the phone's match simply stays.
  const readWithClaude = async (q: string, picked: Theme[], id: number) => {
    setBusy(true);
    try {
      const closer = await closerReading(q, picked);
      if (id !== latest.current) return;
      setReading(closer);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (e) {
      if (id !== latest.current) return;
      setFellBack(e instanceof ReadingError ? e.message : "The reading could not be made.");
    } finally {
      if (id === latest.current) setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.ground }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <PageGlow />
      <ScrollView
        ref={scroller}
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={[
          s.page,
          { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* masthead */}
        <View style={[s.masthead, { borderBottomWidth: 0, paddingBottom: space.md + 6 }]}>
          <GoldRule pinned />
          <Text style={[s.wordmark, { color: c.ink }]}>He Answers</Text>
          <Text style={[s.epigraph, { color: c.ink2 }]}>
            Call unto me, and I will answer thee, and shew thee great and mighty
            things, which thou knowest not.
            <Text style={[label, { color: c.rubric }]}>{"   Jeremiah 33:3"}</Text>
          </Text>
        </View>

        {/* composer */}
        <View style={[s.composer, { backgroundColor: c.panel, borderColor: c.rule }]}>
          <Text style={[label, { color: c.gilt }]}>What are you carrying?</Text>
          <TextInput
            style={[s.input, { color: c.ink }]}
            value={text}
            onChangeText={setText}
            placeholder={PROMPT}
            placeholderTextColor={c.ink3}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Describe what you are going through"
          />

          <View style={[s.divider, { backgroundColor: c.ruleSoft }]} />

          <Text style={[label, { color: c.gilt }]}>And how does it feel?</Text>
          <View style={s.chips}>
            {FEELINGS.map((f) => {
              const on = feelings.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => toggleFeeling(f.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={[
                    s.chip,
                    {
                      borderColor: on ? c.rubric : c.rule,
                      backgroundColor: on ? c.rubricWash : "transparent",
                    },
                  ]}
                >
                  <Text style={[s.chipText, { color: on ? c.rubric : c.ink2 }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={search}
            disabled={!canSearch}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSearch }}
            style={[
              s.go,
              ready
                ? { backgroundColor: c.ink, borderColor: c.ink }
                : { backgroundColor: "transparent", borderColor: c.rule },
            ]}
          >
            <Text style={[s.goText, { color: ready ? c.ground : c.ink3 }]}>
              Find the passages
            </Text>
          </Pressable>
        </View>

        {/* results */}
        <View style={[s.resHead, { borderBottomColor: c.rule }]}>
          <Text style={[s.resTitle, { color: c.ink }]}>
            {`${shown.passages.length} passages`}
          </Text>
          <Text
            style={[
              label,
              s.method,
              { color: isExample ? c.indigo : c.gilt, borderColor: isExample ? c.indigo : c.rule },
            ]}
          >
            {isExample
              ? "Example"
              : shown.source === "reading"
                ? "Read by Claude"
                : "Matched on this phone"}
          </Text>
        </View>

        {answered ? (
          <Text style={[s.answered, { color: c.ink3 }]}>
            You wrote: <Text style={[s.answeredQuote, { color: c.ink2 }]}>{answered}</Text>
          </Text>
        ) : isExample ? (
          <Text style={[s.answered, { color: c.ink3 }]}>
            Someone wrote:{" "}
            <Text style={[s.answeredQuote, { color: c.ink2 }]}>{EXAMPLE_QUERY}</Text>
          </Text>
        ) : null}

        {busy ? (
          <View
            style={[s.refining, { borderColor: c.rule, backgroundColor: c.panel }]}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="small" color={c.rubric} />
            <Text style={[s.refiningText, { color: c.ink2 }]}>
              Claude is reading this more closely. Until then, these are the closest matches on
              your phone.
            </Text>
          </View>
        ) : null}

        <Animated.View style={{ opacity: fade }}>
          {crisis ? (
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

          {fellBack ? (
            <Text style={[s.fellBack, { color: c.ink3, borderLeftColor: c.gilt }]}>
              {fellBack} These are the closest matches on your phone.
            </Text>
          ) : null}

          <Text style={[s.opening, { color: c.ink, borderLeftColor: c.rubric }]}>
            {shown.opening}
          </Text>

          {shown.passages.map((p, i) => (
            <Passage
              // A fresh card for each set of results, so nothing written for one
              // search, or for the phone's matches, carries over into the next.
              key={`${answeredKey}|${shown.source}|${p.ref}`}
              verse={p}
              theme={p.themes[0]}
              first={i === 0}
              personalize={
                shown.source === "reading" && aiOn
                  ? { situation: answered, feelings: answeredFeelings }
                  : undefined
              }
            />
          ))}
        </Animated.View>

        {shown.source === "reading" && !busy ? (
          <Pressable
            onPress={() => setReporting(true)}
            accessibilityRole="button"
            hitSlop={8}
            style={s.reportRow}
          >
            <Text style={[s.report, { color: c.ink3, borderBottomColor: c.rule }]}>Report this reading</Text>
          </Pressable>
        ) : null}

        {!isExample && !busy ? (
          <FollowUp
            // A fresh thread for each search: nothing carries across.
            key={answeredKey}
            situation={answered}
            feelings={answeredFeelings}
            shown={shown.passages}
            aiOn={aiOn}
            consentDeclined={consent === "declined"}
            onNeedConsent={() => setAskingForFollowUp(true)}
          />
        ) : null}

        <Text style={[s.foot, { color: c.ink3, borderTopColor: c.rule }]}>
          King James Version, which is in the public domain.{" "}
          {aiOn
            ? "What you write is sent to Claude so it can choose passages for you. This app keeps no copy. If Claude cannot be reached, passages are matched on this phone."
            : "Passages are matched on this phone. Nothing you write is sent anywhere."}
        </Text>
      </ScrollView>

      <ConsentSheet
        visible={asking !== null || askingForFollowUp}
        onAllow={allow}
        onDecline={decline}
        onDismiss={() => {
          setAsking(null);
          setAskingForFollowUp(false);
        }}
      />
      <ReportSheet
        visible={reporting}
        onClose={() => setReporting(false)}
        kind="reading"
        content={{
          opening: shown.opening,
          passages: shown.passages.map((p) => ({ ref: p.ref, plain: p.plain, why: p.why })),
        }}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  masthead: { borderBottomWidth: 1, paddingBottom: space.md, gap: space.sm },
  wordmark: { fontFamily: font.display, fontSize: 34, lineHeight: 40, letterSpacing: 0.2 },
  epigraph: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 23 },

  composer: { marginTop: space.lg, borderWidth: 1, padding: 16, gap: space.md },
  input: { fontFamily: font.serif, fontSize: 17, lineHeight: 27, minHeight: 108 },
  divider: { height: 1, marginVertical: space.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 1, paddingVertical: 6, paddingHorizontal: 10 },
  chipText: { fontFamily: font.ui, fontSize: 13 },
  go: { borderWidth: 1, borderRadius: 1, paddingVertical: 14, alignItems: "center", marginTop: space.xs },
  goText: { fontFamily: font.uiSemi, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase" },

  resHead: {
    marginTop: space.xl,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  resTitle: { fontFamily: font.display, fontSize: 21 },
  method: { borderWidth: 1, borderRadius: 1, paddingHorizontal: 6, paddingVertical: 3 },

  answered: { fontFamily: font.ui, fontSize: 12.5, lineHeight: 20, marginTop: space.md },
  answeredQuote: { fontFamily: font.serifItalic, fontSize: 14 },

  crisis: { marginTop: space.lg, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: space.md, gap: 5 },
  crisisTitle: { fontFamily: font.uiSemi, fontSize: 13.5 },
  crisisBody: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
  crisisLine: { fontFamily: font.ui, fontSize: 13, lineHeight: 20 },

  refining: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.md,
    borderWidth: 1,
    borderRadius: 1,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  refiningText: { flex: 1, fontFamily: font.ui, fontSize: 13, lineHeight: 19 },
  fellBack: {
    fontFamily: font.ui,
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: space.lg,
    borderLeftWidth: 2,
    paddingLeft: 12,
  },
  opening: {
    fontFamily: font.serif,
    fontSize: 17.5,
    lineHeight: 28,
    marginTop: space.lg,
    marginBottom: space.md,
    borderLeftWidth: 2,
    paddingLeft: 14,
  },
  reportRow: { alignSelf: "flex-start", marginTop: space.lg },
  report: { fontFamily: font.ui, fontSize: 12.5, borderBottomWidth: 1, paddingBottom: 1 },
  foot: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 19,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
