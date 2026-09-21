import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import PageGlow from "../src/components/PageGlow";
import { TRANSLATIONS, megabytes } from "../src/bible/catalog";
import { install, remove, setActive, useBibleState } from "../src/bible/store";
import { font, label, space } from "../src/theme";
import { usePalette } from "../src/usePalette";
import GoldRule from "../src/components/GoldRule";

export default function VersionsScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  // Opened from a deep link there is no history to pop, so fall back to the tab.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/bible"));
  const { installed, active } = useBibleState();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string>("");

  const download = async (id: string) => {
    setBusy(id);
    setFailed("");
    try {
      await install(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      setFailed(e instanceof Error ? e.message : "The download did not finish.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        contentContainerStyle={[s.page, { paddingTop: insets.top + space.md, paddingBottom: space.xxl }]}
      >
        <Pressable onPress={goBack} hitSlop={12} style={s.backRow}>
          <Text style={[s.back, { color: c.ink2 }]}>‹ Back</Text>
        </Pressable>

        <View style={[s.head, { borderBottomWidth: 0, paddingBottom: space.sm + 6 }]}>

          <GoldRule pinned />
          <Text style={[s.title, { color: c.ink }]}>Translations</Text>
          <Text style={[label, { color: c.gilt }]}>{installed.length} of {TRANSLATIONS.length}</Text>
        </View>

        <Text style={[s.intro, { color: c.ink2 }]}>
          Each one downloads once and then works with no signal. All ten are complete and in
          the public domain, which is why they can live inside the app at all.
        </Text>

        {failed ? <Text style={[s.failed, { color: c.rubric }]}>{failed}</Text> : null}

        {TRANSLATIONS.map((t, i) => {
          const have = installed.includes(t.id);
          const isActive = active === t.id;
          return (
            <View key={t.id} style={[s.row, { borderTopColor: i === 0 ? c.rule : c.ruleSoft }]}>
              <View style={s.rowHead}>
                <Text style={[s.name, { color: isActive ? c.rubric : c.ink }]}>{t.name}</Text>
                <Text style={[s.year, { color: c.ink3 }]}>{t.year}</Text>
              </View>
              <Text style={[s.note, { color: c.ink2 }]}>{t.note}</Text>
              <Text style={[s.stat, { color: c.ink3 }]}>
                {t.books} books · {t.verses.toLocaleString()} verses · {megabytes(t.bytes)}
              </Text>

              <View style={s.actions}>
                {busy === t.id ? (
                  <View style={s.busy}>
                    <ActivityIndicator color={c.rubric} size="small" />
                    <Text style={[s.busyText, { color: c.ink2 }]}>Downloading…</Text>
                  </View>
                ) : have ? (
                  <>
                    {isActive ? (
                      <Text style={[s.badge, { color: c.rubric, borderColor: c.rubric }]}>Reading</Text>
                    ) : (
                      <Pressable onPress={() => setActive(t.id)} style={[s.btn, { borderColor: c.ink }]}>
                        <Text style={[s.btnText, { color: c.ink }]}>Read this</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => remove(t.id)} hitSlop={8}>
                      <Text style={[s.remove, { color: c.ink3, borderBottomColor: c.rule }]}>Remove</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    onPress={() => download(t.id)}
                    style={[s.btn, { backgroundColor: c.ink, borderColor: c.ink }]}
                  >
                    <Text style={[s.btnText, { color: c.ground }]}>Download</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        <Text style={[s.foot, { color: c.ink3, borderTopColor: c.rule }]}>
          NIV, ESV, NLT, NASB, CSB and The Message are copyrighted and cannot be included.
          Every chapter has links that open those on Bible Gateway instead.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  backRow: { paddingVertical: 6, alignSelf: "flex-start" },
  back: { fontFamily: font.ui, fontSize: 13.5 },
  head: {
    borderBottomWidth: 1,
    paddingBottom: space.sm,
    marginTop: space.sm,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: { fontFamily: font.display, fontSize: 30 },
  intro: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21, marginTop: space.md },
  failed: { fontFamily: font.ui, fontSize: 13, marginTop: space.md },
  row: { borderTopWidth: 1, paddingVertical: space.lg, gap: 6 },
  rowHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  name: { fontFamily: font.displayMedium, fontSize: 18 },
  year: { fontFamily: font.ui, fontSize: 11.5 },
  note: { fontFamily: font.serifItalic, fontSize: 14.5, lineHeight: 22 },
  stat: { fontFamily: font.ui, fontSize: 11.5 },
  actions: { flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.sm },
  btn: { borderWidth: 1, borderRadius: 1, paddingVertical: 9, paddingHorizontal: 14 },
  btnText: { fontFamily: font.uiSemi, fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase" },
  badge: {
    fontFamily: font.uiSemi,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    borderWidth: 1,
    borderRadius: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  busy: { flexDirection: "row", alignItems: "center", gap: space.sm },
  busyText: { fontFamily: font.ui, fontSize: 13 },
  remove: { fontFamily: font.ui, fontSize: 12, borderBottomWidth: 1, paddingBottom: 1 },
  foot: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 19,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
