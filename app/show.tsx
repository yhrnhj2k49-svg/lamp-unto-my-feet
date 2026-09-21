import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { font, label, space } from "../src/theme";
import { usePalette } from "../src/usePalette";
import PageGlow from "../src/components/PageGlow";
import { SHOWS } from "../src/data/media";
import { addsToTitle, clock, dateLabel, durationLabel, episodesFor, type Episode } from "../src/engine/podcast";

export default function ShowScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const show = SHOWS.find((x) => x.id === id);

  const [episodes, setEpisodes] = useState<Episode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Episode | null>(null);

  // One player for the whole screen; choosing an episode swaps its source.
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // Play even with the ringer switched to silent — a podcast is not a notification.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!show) return;
    const ctl = new AbortController();
    episodesFor(show.id, ctl.signal)
      .then(setEpisodes)
      .catch((e: unknown) => {
        if (!ctl.signal.aborted) setError(e instanceof Error ? e.message : "That show could not be reached.");
      });
    return () => ctl.abort();
  }, [show]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/watch"));

  const choose = (ep: Episode) => {
    Haptics.selectionAsync().catch(() => {});
    if (current?.audio === ep.audio) {
      status.playing ? player.pause() : player.play();
      return;
    }
    setCurrent(ep);
    player.replace({ uri: ep.audio });
    player.play();
  };

  const skip = (by: number) => {
    Haptics.selectionAsync().catch(() => {});
    const to = Math.max(0, Math.min((status.duration || 0) - 1, (status.currentTime || 0) + by));
    player.seekTo(to).catch(() => {});
  };

  if (!show) {
    return (
      <View style={[s.center, { backgroundColor: c.ground }]}>
        <Text style={[s.msg, { color: c.ink2 }]}>That show is not in this app.</Text>
      </View>
    );
  }

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <PageGlow />
      <ScrollView
        style={{ backgroundColor: "transparent" }}
        contentContainerStyle={[
          s.page,
          { paddingTop: insets.top + space.md, paddingBottom: (current ? 150 : space.xxl) + insets.bottom },
        ]}
      >
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button">
          <Text style={[s.back, { color: c.indigo }]}>‹ Back</Text>
        </Pressable>
        <View style={[s.head, { borderBottomColor: c.giltBright }]}>
          <Text style={[s.title, { color: c.ink }]}>{show.title}</Text>
          <Text style={[label, { color: c.gilt }]}>{show.by}</Text>
        </View>
        <Text style={[s.intro, { color: c.ink2 }]}>{show.about}</Text>

        {error ? (
          <Text style={[s.msg, { color: c.ink2, marginTop: space.lg }]}>{error}</Text>
        ) : !episodes ? (
          <ActivityIndicator style={{ marginTop: space.xl }} color={c.gilt} />
        ) : (
          episodes.map((ep, i) => {
            const on = current?.audio === ep.audio;
            return (
              <Pressable
                key={ep.audio}
                onPress={() => choose(ep)}
                accessibilityRole="button"
                accessibilityLabel={`${on && status.playing ? "Pause" : "Play"} ${ep.title}`}
                style={({ pressed }) => [
                  s.row,
                  { borderTopColor: i === 0 ? c.rule : c.ruleSoft, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={[s.dot, { borderColor: on ? c.rubric : c.gilt, backgroundColor: on ? c.rubricWash : "transparent" }]}>
                  {on && status.playing ? (
                    <View style={s.pauseBars}>
                      <View style={[s.bar, { backgroundColor: c.rubric }]} />
                      <View style={[s.bar, { backgroundColor: c.rubric }]} />
                    </View>
                  ) : (
                    <View style={[s.tri, { borderLeftColor: c.rubric }]} />
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.epTitle, { color: c.ink }]}>{ep.title}</Text>
                  <Text style={[label, { color: c.gilt }]}>
                    {[dateLabel(ep.published), durationLabel(ep.seconds)].filter(Boolean).join(" · ")}
                  </Text>
                  {addsToTitle(ep.title, ep.summary) && (
                    <Text style={[s.summary, { color: c.ink2 }]} numberOfLines={3}>
                      {ep.summary}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {current && (
        <View
          style={[
            s.dock,
            { backgroundColor: c.panel, borderTopColor: c.giltBright, paddingBottom: insets.bottom + space.sm },
          ]}
        >
          <View style={[s.track, { backgroundColor: c.ruleSoft }]}>
            <View style={[s.fill, { width: `${progress * 100}%`, backgroundColor: c.rubric }]} />
          </View>
          <Text style={[s.dockTitle, { color: c.ink }]} numberOfLines={1}>
            {current.title}
          </Text>
          <View style={s.controls}>
            <Text style={[s.time, { color: c.ink3 }]}>{clock(status.currentTime || 0)}</Text>
            <View style={s.buttons}>
              <Pressable onPress={() => skip(-15)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back 15 seconds">
                <Text style={[s.skip, { color: c.ink2 }]}>−15</Text>
              </Pressable>
              <Pressable
                onPress={() => choose(current)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={status.playing ? "Pause" : "Play"}
                style={[s.big, { borderColor: c.rubric }]}
              >
                {status.isBuffering && !status.playing ? (
                  <ActivityIndicator color={c.rubric} />
                ) : status.playing ? (
                  <View style={s.pauseBars}>
                    <View style={[s.barBig, { backgroundColor: c.rubric }]} />
                    <View style={[s.barBig, { backgroundColor: c.rubric }]} />
                  </View>
                ) : (
                  <View style={[s.triBig, { borderLeftColor: c.rubric }]} />
                )}
              </Pressable>
              <Pressable onPress={() => skip(30)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Forward 30 seconds">
                <Text style={[s.skip, { color: c.ink2 }]}>+30</Text>
              </Pressable>
            </View>
            <Text style={[s.time, { color: c.ink3 }]}>{status.duration ? clock(status.duration) : "--:--"}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  back: { fontFamily: font.ui, fontSize: 15, marginBottom: space.md },
  head: { borderBottomWidth: 1, paddingBottom: space.sm, gap: 4 },
  title: { fontFamily: font.display, fontSize: 28 },
  intro: { fontFamily: font.serifItalic, fontSize: 15.5, lineHeight: 24, marginVertical: space.md },
  msg: { fontFamily: font.serif, fontSize: 16, lineHeight: 24 },
  row: { flexDirection: "row", gap: space.md, borderTopWidth: 1, paddingVertical: space.md, alignItems: "flex-start" },
  dot: { width: 34, height: 34, borderWidth: 1, borderRadius: 17, alignItems: "center", justifyContent: "center", marginTop: 2 },
  tri: {
    width: 0, height: 0, marginLeft: 3,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
    borderTopColor: "transparent", borderBottomColor: "transparent",
  },
  pauseBars: { flexDirection: "row", gap: 3 },
  bar: { width: 3, height: 11 },
  epTitle: { fontFamily: font.displayMedium, fontSize: 16.5, lineHeight: 22 },
  summary: { fontFamily: font.serif, fontSize: 14, lineHeight: 21 },
  dock: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 0, gap: 6,
  },
  track: { height: 2, marginHorizontal: -20 },
  fill: { height: 2 },
  dockTitle: { fontFamily: font.displayMedium, fontSize: 15, marginTop: space.sm },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  buttons: { flexDirection: "row", alignItems: "center", gap: space.xl },
  time: { fontFamily: font.ui, fontSize: 12, minWidth: 52, fontVariant: ["tabular-nums"] },
  skip: { fontFamily: font.uiSemi, fontSize: 14 },
  big: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  triBig: {
    width: 0, height: 0, marginLeft: 4,
    borderTopWidth: 9, borderBottomWidth: 9, borderLeftWidth: 15,
    borderTopColor: "transparent", borderBottomColor: "transparent",
  },
  barBig: { width: 4, height: 16 },
});
