import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";

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

  const example = useMemo(() => findPassages(EXAMPLE_QUERY, []), []);
  const shown = reading ?? example;
  const isExample = reading === null && !busy && answered === "";
  const crisis = !isExample && needsCrisisNote(answered);
  const ready = text.trim().length > 2 || feelings.length > 0;

  const toggleFeeling = (k: Theme) => {
    Haptics.selectionAsync().catch(() => {});
    setFeelings((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));
  };

  const search = async () => {
    if (!ready || busy) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const q = text.trim();
    setAnswered(q);
    setFellBack("");
    requestAnimationFrame(() => scroller.current?.scrollTo({ y: 320, animated: true }));

    if (!aiAvailable) {
      setReading(findPassages(q, feelings));
      return;
    }

    // Claude reads it. If that cannot happen — no signal, service down, a
    // reading that came back malformed — the device concordance answers
    // instead, so the app is never unusable.
    setBusy(true);
    setReading(null);
    try {
      setReading(await closerReading(q, feelings));
    } catch (e) {
      setFellBack(
        e instanceof ReadingError ? e.message : "The reading could not be made."
      );
      setReading(findPassages(q, feelings));
    } finally {
      setBusy(false);
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
        <View style={[s.masthead, { borderBottomColor: c.giltBright }]}>
          <Text style={[s.wordmark, { color: c.ink }]}>Lamp Unto My Feet</Text>
          <Text style={[s.epigraph, { color: c.ink2 }]}>
            Thy word is a lamp unto my feet, and a light unto my path.
            <Text style={[label, { color: c.rubric }]}>   Psalm 119:105</Text>
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
            disabled={!ready || busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready || busy, busy }}
            style={[
              s.go,
              ready
                ? { backgroundColor: c.ink, borderColor: c.ink }
                : { backgroundColor: "transparent", borderColor: c.rule },
            ]}
          >
            <Text style={[s.goText, { color: ready ? c.ground : c.ink3 }]}>
              {busy ? "Reading\u2026" : "Find the passages"}
            </Text>
          </Pressable>
        </View>

        {/* results */}
        <View style={[s.resHead, { borderBottomColor: c.rule }]}>
          <Text style={[s.resTitle, { color: c.ink }]}>
            {busy ? "Reading" : `${shown.passages.length} passages`}
          </Text>
          <Text
            style={[
              label,
              s.method,
              { color: isExample ? c.indigo : c.gilt, borderColor: isExample ? c.indigo : c.rule },
            ]}
          >
            {busy
              ? "In progress"
              : isExample
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
          <View style={s.reading}>
            <ActivityIndicator color={c.rubric} />
            <Text style={[s.readingText, { color: c.ink2 }]}>
              Reading what you wrote, and looking for the passages that meet it.
            </Text>
          </View>
        ) : (
          <>
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
                {fellBack} Matched on this phone instead.
              </Text>
            ) : null}

            <Text style={[s.opening, { color: c.ink, borderLeftColor: c.rubric }]}>
              {shown.opening}
            </Text>

            {shown.passages.map((p, i) => (
              <Passage key={p.ref} verse={p} theme={p.themes[0]} first={i === 0} />
            ))}
          </>
        )}

        <Text style={[s.foot, { color: c.ink3, borderTopColor: c.rule }]}>
          King James Version, which is in the public domain.{" "}
          {aiAvailable
            ? "What you write is sent to the reading service so it can be read, and is not stored. If it cannot be reached, matching falls back to this phone."
            : "Matching happens on this phone — nothing you write is sent anywhere."}
        </Text>
      </ScrollView>
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

  reading: { marginTop: space.xl, alignItems: "center", gap: space.md, paddingVertical: space.lg },
  readingText: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21, textAlign: "center", maxWidth: 300 },
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
  foot: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 19,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
