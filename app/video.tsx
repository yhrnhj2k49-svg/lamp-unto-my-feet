import { createElement } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { font, label, space } from "../src/theme";
import { usePalette } from "../src/usePalette";
import Fleuron from "../src/components/Fleuron";
import { VIDEO_GROUPS, minutesLabel } from "../src/data/media";

// YouTube's privacy-enhanced host: no tracking cookies are set until the
// video is actually played.
const EMBED = "https://www.youtube-nocookie.com/embed/";
// YouTube refuses embeds that arrive with no referring page (its "error 153"),
// so the player is written into a page that claims the app's own public site.
const HOME = "https://yhrnhj2k49-svg.github.io/";

// Only ids from the checked library can be played, whatever the link says.
const LIBRARY = new Map(VIDEO_GROUPS.flatMap((g) => g.videos.map((v) => [v.id, v] as const)));

const page = (id: string) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>html,body{margin:0;height:100%;background:#000}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style>
</head><body>
<iframe src="${EMBED}${id}?playsinline=1&rel=0&modestbranding=1"
  allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
  referrerpolicy="strict-origin-when-cross-origin"></iframe>
</body></html>`;

// The player may load whatever it needs inside its own frame. A tap that tries
// to take the whole screen somewhere else (the YouTube logo, "watch on
// YouTube") opens in the browser instead of turning this screen into a web
// browser pointed at who knows what.
function allow(req: WebViewNavigation & { isTopFrame?: boolean }) {
  if (req.isTopFrame === false) return true;
  if (req.url === "about:blank" || req.url.startsWith(HOME)) return true;
  if (req.url.startsWith(EMBED)) return true;
  Linking.openURL(req.url).catch(() => {});
  return false;
}

export default function VideoScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { id = "", title = "" } = useLocalSearchParams<{ id?: string; title?: string }>();
  const video = LIBRARY.get(id);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/watch"));

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
      <View style={[s.bar, { paddingTop: insets.top + space.sm, borderBottomColor: c.rule }]}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close video">
          <Text style={[s.back, { color: c.indigo }]}>‹ Back</Text>
        </Pressable>
      </View>

      {!video ? (
        <View style={s.center}>
          <Text style={[s.msg, { color: c.ink2 }]}>That video is not in this app's library.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
          {/* 16:9, the shape the films were made in; full screen is one tap away in the player. */}
          <View style={s.frame}>
            {Platform.OS === "web" ? (
              createElement("iframe", {
                src: `${EMBED}${video.id}?rel=0&modestbranding=1`,
                allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
                allowFullScreen: true,
                referrerPolicy: "strict-origin-when-cross-origin",
                style: { border: 0, width: "100%", height: "100%" },
                title: video.title,
              })
            ) : (
              <WebView
                style={{ flex: 1, backgroundColor: "#000" }}
                source={{ html: page(video.id), baseUrl: HOME }}
                originWhitelist={["https://*", "about:*"]}
                onShouldStartLoadWithRequest={allow}
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction
                javaScriptCanOpenWindowsAutomatically={false}
                setSupportMultipleWindows={false}
              />
            )}
          </View>

          <View style={s.body}>
            <Text style={[s.title, { color: c.ink }]}>{video.title || title}</Text>
            <Text style={[label, { color: c.gilt }]}>
              {video.from} · {minutesLabel(video.minutes)}
            </Text>
            <Text style={[s.about, { color: c.ink2 }]}>{video.about}</Text>
            <Fleuron />
            <Text style={[s.fine, { color: c.ink3 }]}>
              Made by {video.from}, who share it freely, and played in YouTube's privacy-enhanced
              player. Tap the player's full-screen button to watch it large.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: 16,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
  },
  back: { fontFamily: font.ui, fontSize: 15 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  msg: { fontFamily: font.serif, fontSize: 16, textAlign: "center" },
  frame: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000" },
  body: { paddingHorizontal: 20, paddingTop: space.lg, gap: space.sm, maxWidth: 760, width: "100%", alignSelf: "center" },
  title: { fontFamily: font.display, fontSize: 28 },
  about: { fontFamily: font.serif, fontSize: 16.5, lineHeight: 26, marginTop: space.xs },
  fine: { fontFamily: font.ui, fontSize: 12.5, lineHeight: 19 },
});
