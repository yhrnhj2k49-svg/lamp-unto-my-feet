import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { VERSES } from "../src/data/verses";
import { verseForDay } from "../src/engine/daily";
import Passage from "../src/components/Passage";
import PageGlow from "../src/components/PageGlow";
import GoldRule from "../src/components/GoldRule";
import { font, label, space } from "../src/theme";
import { usePalette } from "../src/usePalette";

/** Where the morning notification lands: that day's passage, on its own. */
export default function VerseScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { ref } = useLocalSearchParams<{ ref?: string }>();
  const verse = (ref && VERSES.find((v) => v.ref === ref)) || verseForDay();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={[s.page, { paddingTop: insets.top + space.md, paddingBottom: space.xxl }]}
      >
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button">
          <Text style={[s.back, { color: c.indigo }]}>‹ Back</Text>
        </Pressable>

        <View style={[s.head, { paddingBottom: space.sm + 6 }]}>
          <GoldRule pinned />
          <Text style={[s.title, { color: c.ink }]}>This morning</Text>
          <Text style={[label, { color: c.gilt }]}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>

        <Passage verse={verse} theme={verse.themes?.[0]} first />

        <Text style={[s.foot, { color: c.ink3, borderTopColor: c.rule }]}>
          Chosen on this phone from the passages the app carries. Nothing was sent anywhere to
          pick it.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  back: { fontFamily: font.ui, fontSize: 15, marginBottom: space.md },
  head: { gap: 4 },
  title: { fontFamily: font.display, fontSize: 28 },
  foot: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
