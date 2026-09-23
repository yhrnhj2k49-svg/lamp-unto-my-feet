import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { drop, useKept } from "../../src/store/kept";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import PageGlow from "../../src/components/PageGlow";
import Living from "../../src/components/Living";
import { livingFor } from "../../src/data/living";
import Illuminated from "../../src/components/Illuminated";
import { usePassageText } from "../../src/bible/usePassageText";
import GoldRule from "../../src/components/GoldRule";

// A kept passage is stored as the King James text it was kept as; it is shown
// in whichever translation is currently chosen, like everywhere else.
function KeptText({ ref_, text }: { ref_: string; text: string }) {
  const shown = usePassageText(ref_, text);
  return <Illuminated text={shown.text} size={18.5} lineHeight={30} />;
}

export default function KeptScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const kept = useKept();

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
    <PageGlow />
    <ScrollView
      style={{ backgroundColor: "transparent" }}
      contentContainerStyle={[
        s.page,
        { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
      ]}
    >
      <View style={[s.head, { borderBottomWidth: 0, paddingBottom: space.sm + 6 }]}>
        <GoldRule pinned />
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
            <KeptText ref_={k.ref} text={k.text} />
            <Text style={[s.note, { color: c.ink2 }]}>
              <Text style={[label, { color: c.gilt }]}>In plain words  </Text>
              {k.plain}
            </Text>
            <Living
              setting={k.setting || livingFor(k.ref)?.setting}
              apply={k.apply || livingFor(k.ref)?.apply}
              reflect={k.reflect || livingFor(k.ref)?.reflect}
            />
          </View>
        ))
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
  note: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
});
