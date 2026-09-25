// Look closer at one passage: the same verse in every translation on the
// phone, and any word in it looked up.
//
// The translations and the archaic glossary are read from the device, so this
// costs nothing and works with no signal. Only the deeper word study — the
// Hebrew or Greek behind a word — asks Claude, and only when tapped.

import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Sheet from "./Sheet";
import Fleuron from "./Fleuron";
import { byId, OFFSITE, offsiteUrl } from "../bible/catalog";
import { PASSAGE_VERSIONS, passageIn } from "../bible/lookup";
import { useBibleState } from "../bible/store";
import { glossFor, normaliseWord } from "../data/archaic";
import { wordStudy, type WordStudy } from "../engine/word";
import { aiAvailable, ReadingError } from "../engine/ai";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

type Props = { visible: boolean; onClose: () => void; ref_: string; text: string; aiOn: boolean };

export default function Closer({ visible, onClose, ref_, text, aiOn }: Props) {
  const c = usePalette();
  const { installed } = useBibleState();
  const [part, setPart] = useState<"translations" | "words">("translations");
  const [word, setWord] = useState<string | null>(null);
  const [study, setStudy] = useState<WordStudy | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");

  const others = PASSAGE_VERSIONS.filter((v) => v !== "KJV" && installed.includes(v))
    .map((v) => ({ id: v, name: byId(v)?.name ?? v, text: passageIn(v, ref_) }))
    .filter((v): v is { id: string; name: string; text: string } => !!v.text);

  const pick = (w: string) => {
    const clean = normaliseWord(w);
    if (!clean) return;
    Haptics.selectionAsync().catch(() => {});
    setWord(clean);
    setStudy(null);
    setFailed("");
  };

  const deeper = async () => {
    if (!word) return;
    setBusy(true);
    setFailed("");
    try {
      setStudy(await wordStudy(ref_, text, word));
    } catch (e) {
      setFailed(e instanceof ReadingError ? e.message : "That could not be looked up.");
    } finally {
      setBusy(false);
    }
  };

  const gloss = word ? glossFor(word) : undefined;

  return (
    <Sheet visible={visible} label={`Look closer at ${ref_}`} onDismiss={onClose}>
      <View style={s.head}>
        <Text style={[s.title, { color: c.ink }]}>{ref_}</Text>
        <View style={s.switch}>
          {(["translations", "words"] as const).map((p) => {
            const on = part === p;
            return (
              <Pressable
                key={p}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setPart(p);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                hitSlop={8}
                style={[s.switchItem, { borderBottomColor: on ? c.rubric : "transparent" }]}
              >
                <Text style={[label, { color: on ? c.rubric : c.ink3 }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: space.md }}>
        {part === "translations" ? (
          <>
            <View style={s.row}>
              <Text style={[label, { color: c.gilt }]}>King James</Text>
              <Text style={[s.verse, { color: c.ink }]}>{text}</Text>
            </View>

            {others.map((o) => (
              <View key={o.id} style={[s.row, { borderTopColor: c.ruleSoft, borderTopWidth: 1 }]}>
                <Text style={[label, { color: c.gilt }]}>{o.name}</Text>
                <Text style={[s.verse, { color: c.ink }]}>{o.text}</Text>
              </View>
            ))}

            {others.length === 0 ? (
              <Text style={[s.note, { color: c.ink2 }]}>
                Download a translation and this passage will appear here in it, taken from that
                translation&apos;s own text.
              </Text>
            ) : null}

            <Pressable
              onPress={() => {
                onClose();
                router.push("/versions");
              }}
              accessibilityRole="button"
            >
              <Text style={[s.link, { color: c.indigo }]}>Get more translations</Text>
            </Pressable>

            <Fleuron tight />
            <Text style={[s.note, { color: c.ink3 }]}>
              NIV, ESV and NLT are under copyright and cannot live inside the app. These open them
              on Bible Gateway:
            </Text>
            <View style={s.offsite}>
              {OFFSITE.map((o) => (
                <Pressable
                  key={o.label}
                  onPress={() => Linking.openURL(offsiteUrl(ref_, o.search)).catch(() => {})}
                  accessibilityRole="link"
                  style={[s.chip, { borderColor: c.rule }]}
                >
                  <Text style={[s.chipText, { color: c.ink2 }]}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={[s.note, { color: c.ink2 }]}>Tap any word.</Text>
            <View style={s.words}>
              {text.split(/\s+/).map((w, i) => {
                const clean = normaliseWord(w);
                const known = !!glossFor(w);
                const on = word === clean;
                return (
                  <Pressable key={`${w}-${i}`} onPress={() => pick(w)} accessibilityRole="button">
                    <Text
                      style={[
                        s.word,
                        {
                          color: on ? c.rubric : c.ink,
                          // A faint gold underline marks the words the app can
                          // already explain without asking anything.
                          borderBottomColor: known ? c.giltBright : "transparent",
                          borderBottomWidth: known ? 1 : 0,
                        },
                      ]}
                    >
                      {w}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {word ? (
              <View style={[s.found, { borderTopColor: c.rule }]}>
                <Text style={[s.wordTitle, { color: c.ink }]}>{word}</Text>
                {gloss ? (
                  <>
                    <Text style={[s.verse, { color: c.ink }]}>{gloss.plain}</Text>
                    {gloss.note ? <Text style={[s.note, { color: c.ink2 }]}>{gloss.note}</Text> : null}
                  </>
                ) : (
                  <Text style={[s.note, { color: c.ink2 }]}>
                    Not in the app&apos;s glossary of old words.
                  </Text>
                )}

                {study ? (
                  <View style={{ gap: space.sm, marginTop: space.sm }}>
                    <Text style={[s.verse, { color: c.ink }]}>{study.plain}</Text>
                    {study.original ? (
                      <Text style={[s.note, { color: c.ink2 }]}>
                        <Text style={[label, { color: c.gilt }]}>Behind it  </Text>
                        {study.original}
                        {study.range ? ` — ${study.range}` : ""}
                      </Text>
                    ) : null}
                    {study.elsewhere ? (
                      <Text style={[s.note, { color: c.ink2 }]}>
                        <Text style={[label, { color: c.gilt }]}>Elsewhere  </Text>
                        {study.elsewhere}
                      </Text>
                    ) : null}
                  </View>
                ) : busy ? (
                  <View style={s.busy}>
                    <ActivityIndicator size="small" color={c.rubric} />
                    <Text style={[s.note, { color: c.ink2 }]}>Looking it up.</Text>
                  </View>
                ) : aiOn && aiAvailable ? (
                  <Pressable onPress={() => void deeper()} accessibilityRole="button">
                    <Text style={[s.link, { color: c.indigo }]}>
                      Look at the Hebrew or Greek behind it
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={[s.note, { color: c.ink3 }]}>
                    Turn on Claude&apos;s reading in About to see the word behind this one.
                  </Text>
                )}

                {failed ? <Text style={[s.note, { color: c.ink3 }]}>{failed}</Text> : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </Sheet>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  title: { fontFamily: font.display, fontSize: 24 },
  switch: { flexDirection: "row", gap: space.md },
  switchItem: { borderBottomWidth: 2, paddingBottom: 2 },
  body: { marginTop: space.md, maxHeight: 420 },
  row: { paddingVertical: space.md, gap: 4 },
  verse: { fontFamily: font.serif, fontSize: 16.5, lineHeight: 26 },
  note: { fontFamily: font.ui, fontSize: 13, lineHeight: 20 },
  link: { fontFamily: font.ui, fontSize: 13.5, marginTop: space.sm, textDecorationLine: "underline" },
  offsite: { flexDirection: "row", gap: 6, marginTop: space.sm },
  chip: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 11 },
  chipText: { fontFamily: font.ui, fontSize: 13 },
  words: { flexDirection: "row", flexWrap: "wrap", marginTop: space.sm },
  word: { fontFamily: font.serif, fontSize: 17.5, lineHeight: 30, marginRight: 6 },
  found: { borderTopWidth: 1, marginTop: space.md, paddingTop: space.md, gap: 6 },
  wordTitle: { fontFamily: font.displayMedium, fontSize: 19 },
  busy: { flexDirection: "row", gap: space.sm, alignItems: "center", marginTop: space.sm },
});
