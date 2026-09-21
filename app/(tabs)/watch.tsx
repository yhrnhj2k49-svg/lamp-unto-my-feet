import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import PageGlow from "../../src/components/PageGlow";
import Fleuron from "../../src/components/Fleuron";
import { SHOWS, VIDEO_GROUPS, minutesLabel } from "../../src/data/media";

type Part = "watch" | "listen";

export default function WatchScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [part, setPart] = useState<Part>("watch");

  const tap = () => Haptics.selectionAsync().catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={[s.page, { paddingTop: insets.top + space.lg, paddingBottom: space.xxl }]}
      >
        <View style={[s.head, { borderBottomColor: c.giltBright }]}>
          <Text style={[s.title, { color: c.ink }]}>{part === "watch" ? "Watch" : "Listen"}</Text>
          <View style={s.switch} accessibilityRole="tablist">
            {(["watch", "listen"] as const).map((p) => {
              const on = part === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => {
                    tap();
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

        {part === "watch" ? (
          VIDEO_GROUPS.map((g, gi) => (
            <View key={g.title} style={{ marginTop: gi === 0 ? space.lg : space.xl }}>
              {gi > 0 && <Fleuron />}
              <Text style={[s.group, { color: c.ink }]}>{g.title}</Text>
              <Text style={[s.groupNote, { color: c.ink2 }]}>{g.note}</Text>
              {g.videos.map((v, i) => (
                <Pressable
                  key={v.id}
                  onPress={() => {
                    tap();
                    router.push({ pathname: "/video", params: { id: v.id, title: v.title } });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Watch ${v.title}, ${minutesLabel(v.minutes)}`}
                  style={({ pressed }) => [
                    s.row,
                    { borderTopColor: i === 0 ? c.rule : c.ruleSoft, opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <View style={[s.play, { borderColor: c.gilt }]}>
                    <View style={[s.tri, { borderLeftColor: c.rubric }]} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[s.name, { color: c.ink }]}>{v.title}</Text>
                    <Text style={[label, { color: c.gilt }]}>
                      {v.from} · {minutesLabel(v.minutes)}
                    </Text>
                    <Text style={[s.about, { color: c.ink2 }]}>{v.about}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))
        ) : (
          <View style={{ marginTop: space.lg }}>
            <Text style={[s.groupNote, { color: c.ink2 }]}>
              Daily prayer, the Bible read aloud, and teaching — from Catholic, Protestant and
              non-denominational voices.
            </Text>
            {SHOWS.map((sh, i) => (
              <Pressable
                key={sh.id}
                onPress={() => {
                  tap();
                  router.push({ pathname: "/show", params: { id: sh.id } });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${sh.title}, by ${sh.by}`}
                style={({ pressed }) => [
                  s.row,
                  { borderTopColor: i === 0 ? c.rule : c.ruleSoft, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={[s.play, { borderColor: c.gilt }]}>
                  <Text style={[s.mic, { color: c.rubric }]}>♪</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.name, { color: c.ink }]}>{sh.title}</Text>
                  <Text style={[label, { color: c.gilt }]}>{sh.by}</Text>
                  <Text style={[s.about, { color: c.ink2 }]}>{sh.about}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={[s.fine, { color: c.ink3, borderTopColor: c.rule }]}>
          {part === "watch"
            ? "Videos play in YouTube's privacy-enhanced player. Nothing is sent to YouTube until you open one."
            : "Episode lists come through this app's server, so no podcast host sees you browse. The audio itself streams from each show's host when you press play."}
        </Text>
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
  switch: { flexDirection: "row", gap: space.md },
  switchItem: { borderBottomWidth: 2, paddingBottom: 2 },
  group: { fontFamily: font.displayMedium, fontSize: 21, marginBottom: 2 },
  groupNote: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 23, marginBottom: space.md },
  row: { flexDirection: "row", gap: space.md, borderTopWidth: 1, paddingVertical: space.md, alignItems: "flex-start" },
  play: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  tri: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 11,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  mic: { fontFamily: font.serifBold, fontSize: 17, marginTop: -1 },
  name: { fontFamily: font.displayMedium, fontSize: 18 },
  about: { fontFamily: font.serif, fontSize: 15, lineHeight: 22 },
  fine: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 18,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
