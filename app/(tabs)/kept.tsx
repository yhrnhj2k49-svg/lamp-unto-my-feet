import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { drop, useKept } from "../../src/store/kept";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";

export default function KeptScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const kept = useKept();

  return (
    <ScrollView
      style={{ backgroundColor: c.ground }}
      contentContainerStyle={[
        s.page,
        { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
      ]}
    >
      <View style={[s.head, { borderBottomColor: c.rule }]}>
        <Text style={[s.title, { color: c.ink }]}>Kept</Text>
        <Text style={[label, { color: c.gilt }]}>
          {kept.length === 0 ? "Nothing yet" : `${kept.length} passage${kept.length === 1 ? "" : "s"}`}
        </Text>
      </View>

      {kept.length === 0 ? (
        <Text style={[s.empty, { color: c.ink2, borderLeftColor: c.rule }]}>
          Passages you keep are held here, on this phone. People in a hard season tend
          to return to the same few — this is where they wait for you.
        </Text>
      ) : (
        kept.map((k, i) => (
          <View
            key={k.ref}
            style={[s.row, { borderTopColor: i === 0 ? c.rule : c.ruleSoft }]}
          >
            <View style={s.rowHead}>
              <Text style={[s.ref, { color: c.ink }]}>{k.ref}</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  drop(k.ref);
                }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${k.ref}`}
              >
                <Text style={[s.drop, { color: c.ink3, borderBottomColor: c.rule }]}>Remove</Text>
              </Pressable>
            </View>
            <Text style={[s.verse, { color: c.ink }]}>
              <Text style={[s.pilcrow, { color: c.rubric }]}>¶ </Text>
              {k.text}
            </Text>
            <Text style={[s.note, { color: c.ink2 }]}>
              <Text style={[label, { color: c.gilt }]}>In plain words  </Text>
              {k.plain}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
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
  empty: {
    fontFamily: font.serifItalic,
    fontSize: 16.5,
    lineHeight: 27,
    marginTop: space.lg,
    borderLeftWidth: 2,
    paddingLeft: 14,
  },
  row: { borderTopWidth: 1, paddingVertical: space.lg, gap: space.md },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  ref: { fontFamily: font.displayMedium, fontSize: 17 },
  drop: { fontFamily: font.ui, fontSize: 12, borderBottomWidth: 1, paddingBottom: 1 },
  verse: { fontFamily: font.serif, fontSize: 18.5, lineHeight: 30 },
  pilcrow: { fontFamily: font.serifBold, fontSize: 18.5 },
  note: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
});
