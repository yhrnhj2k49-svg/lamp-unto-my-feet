import { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import PageGlow from "../src/components/PageGlow";
import { readChapter, readIndex } from "../src/bible/store";
import { OFFSITE, offsiteUrl } from "../src/bible/catalog";
import { font, label, space } from "../src/theme";
import { usePalette } from "../src/usePalette";

export default function ChapterScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  // Opened from a deep link there is no history to pop, so fall back to the tab.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/bible"));
  const { v, b, ch } = useLocalSearchParams<{ v: string; b: string; ch: string }>();

  const bookIndex = Number(b ?? 0);
  const chapter = Number(ch ?? 1);

  const index = useMemo(() => (v ? readIndex(v) : null), [v]);
  const book = index?.books[bookIndex];
  const verses = useMemo(
    () => (v ? readChapter(v, bookIndex, chapter) : []),
    [v, bookIndex, chapter]
  );

  const reference = book ? `${book.n} ${chapter}` : "";
  const go = (n: number) => {
    Haptics.selectionAsync().catch(() => {});
    router.replace({ pathname: "/chapter", params: { v, b: String(bookIndex), ch: String(n) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        contentContainerStyle={[s.page, { paddingTop: insets.top + space.md, paddingBottom: space.xxl }]}
      >
        <Pressable onPress={goBack} hitSlop={12} style={s.backRow}>
          <Text style={[s.back, { color: c.ink2 }]}>‹ Books</Text>
        </Pressable>

        <View style={[s.head, { borderBottomColor: c.giltBright }]}>
          <Text style={[s.ref, { color: c.ink }]}>{reference}</Text>
          <Text style={[label, { color: c.gilt }]}>{index?.name ?? ""}</Text>
        </View>

        {verses.length === 0 ? (
          <Text style={[s.missing, { color: c.ink2 }]}>
            That chapter is not in this translation.
          </Text>
        ) : (
          <Text style={[s.body, { color: c.ink }]}>
            {verses.map((text, i) => (
              <Text key={i}>
                <Text style={[s.num, { color: c.gilt }]}>{i + 1} </Text>
                {text}{" "}
              </Text>
            ))}
          </Text>
        )}

        <View style={s.nav}>
          <Pressable
            disabled={chapter <= 1}
            onPress={() => go(chapter - 1)}
            style={[s.navBtn, { borderColor: c.rule, opacity: chapter <= 1 ? 0.35 : 1 }]}
          >
            <Text style={[s.navText, { color: c.ink2 }]}>‹ Previous</Text>
          </Pressable>
          <Pressable
            disabled={!book || chapter >= book.chapters}
            onPress={() => go(chapter + 1)}
            style={[s.navBtn, { borderColor: c.rule, opacity: !book || chapter >= book.chapters ? 0.35 : 1 }]}
          >
            <Text style={[s.navText, { color: c.ink2 }]}>Next ›</Text>
          </Pressable>
        </View>

        {/* Copyrighted translations can be linked to, never reproduced. */}
        <View style={[s.offsite, { borderTopColor: c.rule }]}>
          <Text style={[label, { color: c.gilt }]}>Also read this chapter in</Text>
          <View style={s.offsiteRow}>
            {OFFSITE.map((o) => (
              <Pressable
                key={o.label}
                onPress={() => Linking.openURL(offsiteUrl(reference, o.search)).catch(() => {})}
                style={[s.offsiteBtn, { borderColor: c.rule }]}
              >
                <Text style={[s.offsiteText, { color: c.indigo }]}>{o.label} ↗</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[s.offsiteNote, { color: c.ink3 }]}>
            These are copyrighted, so they open on Bible Gateway rather than living in the app.
          </Text>
        </View>
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
    gap: space.md,
  },
  ref: { fontFamily: font.display, fontSize: 27 },
  body: { fontFamily: font.serif, fontSize: 19, lineHeight: 33, marginTop: space.lg },
  num: { fontFamily: font.uiSemi, fontSize: 11 },
  missing: { fontFamily: font.ui, fontSize: 14, marginTop: space.lg },
  nav: { flexDirection: "row", gap: space.md, marginTop: space.xl },
  navBtn: { flex: 1, borderWidth: 1, borderRadius: 1, paddingVertical: 12, alignItems: "center" },
  navText: { fontFamily: font.uiMedium, fontSize: 12.5 },
  offsite: { marginTop: space.xl, paddingTop: space.md, borderTopWidth: 1, gap: space.sm },
  offsiteRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  offsiteBtn: { borderWidth: 1, borderRadius: 1, paddingVertical: 8, paddingHorizontal: 14 },
  offsiteText: { fontFamily: font.uiMedium, fontSize: 13 },
  offsiteNote: { fontFamily: font.ui, fontSize: 11.5, lineHeight: 18 },
});
