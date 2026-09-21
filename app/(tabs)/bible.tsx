import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import PageGlow from "../../src/components/PageGlow";
import { readIndex, splitTestaments, useBibleState } from "../../src/bible/store";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import GoldRule from "../../src/components/GoldRule";

export default function BibleScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { active, installed } = useBibleState();
  const [openBook, setOpenBook] = useState<number | null>(null);

  const index = useMemo(() => (active ? readIndex(active) : null), [active, installed.length]);
  const testaments = useMemo(() => (index ? splitTestaments(index.books) : null), [index]);

  const openChapter = (bookIndex: number, chapter: number) => {
    Haptics.selectionAsync().catch(() => {});
    router.push({
      pathname: "/chapter",
      params: { v: active ?? "", b: String(bookIndex), ch: String(chapter) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        contentContainerStyle={[s.page, { paddingTop: insets.top + space.lg, paddingBottom: space.xxl }]}
      >
        <View style={[s.head, { borderBottomWidth: 0, paddingBottom: space.sm + 6 }]}>
          <GoldRule pinned />
          <Text style={[s.title, { color: c.ink }]}>Bible</Text>
          <Pressable onPress={() => router.push("/versions")} hitSlop={10}>
            <Text style={[label, { color: c.indigo }]}>
              {installed.length ? "Translations" : "Get a translation"}
            </Text>
          </Pressable>
        </View>

        {!index || !testaments ? (
          <View style={s.empty}>
            <Text style={[s.emptyText, { color: c.ink2, borderLeftColor: c.giltBright }]}>
              No translation on this phone yet. Ten are available, all free and complete, at
              about a megabyte each. Once one is downloaded it works with no signal at all.
            </Text>
            <Pressable
              onPress={() => router.push("/versions")}
              style={[s.cta, { backgroundColor: c.ink, borderColor: c.ink }]}
            >
              <Text style={[s.ctaText, { color: c.ground }]}>Choose a translation</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable onPress={() => router.push("/versions")}>
              <Text style={[s.current, { color: c.ink2, borderColor: c.rule }]}>
                Reading <Text style={{ color: c.ink, fontFamily: font.displayMedium }}>{index.name}</Text>
                {"  ·  change"}
              </Text>
            </Pressable>

            {[
              { heading: "Old Testament", books: testaments.old },
              { heading: "New Testament", books: testaments.neu },
            ].map((section) =>
              section.books.length === 0 ? null : (
                <View key={section.heading}>
                  <Text style={[label, s.section, { color: c.gilt }]}>{section.heading}</Text>
                  {section.books.map((b) => (
                    <View key={b.i}>
                      <Pressable
                        onPress={() => setOpenBook(openBook === b.i ? null : b.i)}
                        style={[s.book, { borderBottomColor: c.ruleSoft }]}
                      >
                        <Text style={[s.bookName, { color: openBook === b.i ? c.rubric : c.ink }]}>
                          {b.n}
                        </Text>
                        <Text style={[s.bookMeta, { color: c.ink3 }]}>{b.chapters}</Text>
                      </Pressable>
                      {openBook === b.i ? (
                        <View style={s.grid}>
                          {Array.from({ length: b.chapters }, (_, k) => k + 1).map((n) => (
                            <Pressable
                              key={n}
                              onPress={() => openChapter(b.i, n)}
                              style={[s.chip, { borderColor: c.rule }]}
                            >
                              <Text style={[s.chipText, { color: c.ink2 }]}>{n}</Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  head: {
    borderBottomWidth: 1,
    paddingBottom: space.sm,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: { fontFamily: font.display, fontSize: 30 },
  empty: { marginTop: space.lg, gap: space.lg, alignItems: "flex-start" },
  emptyText: { fontFamily: font.serifItalic, fontSize: 16.5, lineHeight: 27, borderLeftWidth: 2, paddingLeft: 14 },
  cta: { borderWidth: 1, borderRadius: 1, paddingVertical: 13, paddingHorizontal: 18 },
  ctaText: { fontFamily: font.uiSemi, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" },
  current: {
    fontFamily: font.ui,
    fontSize: 13,
    marginTop: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderRadius: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  section: { marginTop: space.lg, marginBottom: space.sm },
  book: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bookName: { fontFamily: font.serif, fontSize: 17.5 },
  bookMeta: { fontFamily: font.ui, fontSize: 11.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: space.md },
  chip: { borderWidth: 1, borderRadius: 1, minWidth: 40, paddingVertical: 8, alignItems: "center" },
  chipText: { fontFamily: font.ui, fontSize: 13 },
});
