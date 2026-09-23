// Choosing which translation passages are shown in.
//
// Only translations already on the phone can be chosen, because the words have
// to come out of that translation's own file. The rest are listed with the way
// to get them, rather than being offered and then quietly showing the King
// James instead.

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Sheet from "./Sheet";
import { byId } from "../bible/catalog";
import { PASSAGE_VERSIONS } from "../bible/lookup";
import { useBibleState } from "../bible/store";
import { DEFAULT_VERSION, setVersion, useVersion } from "../store/version";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

export default function VersionSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = usePalette();
  const { value: chosen } = useVersion();
  const { installed } = useBibleState();

  const choose = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    void setVersion(id);
    onClose();
  };

  return (
    <Sheet visible={visible} label="Choose a translation" onDismiss={onClose}>
      <Text style={[s.title, { color: c.ink }]}>Passages in</Text>
      <Text style={[s.note, { color: c.ink2 }]}>
        The words come from the translation itself, not from anything rewritten. The King James is
        always here; the others once downloaded.
      </Text>

      <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: space.sm }}>
        {PASSAGE_VERSIONS.map((id) => {
          const t = byId(id);
          const here = id === DEFAULT_VERSION || installed.includes(id);
          const on = chosen === id;
          return (
            <Pressable
              key={id}
              onPress={() => (here ? choose(id) : (onClose(), router.push("/versions")))}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                s.row,
                { borderTopColor: c.ruleSoft, backgroundColor: pressed ? c.recess : "transparent" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.name, { color: here ? c.ink : c.ink3 }]}>{t?.name ?? id}</Text>
                <Text style={[label, { color: c.gilt }]}>
                  {id} · {t?.year}
                </Text>
              </View>
              <Text style={[s.state, { color: on ? c.rubric : c.ink3 }]}>
                {on ? "Chosen" : here ? "Choose" : "Download"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[s.foot, { color: c.ink3 }]}>
        The Catholic Public Domain Version is not here: it numbers the psalms as the Vulgate does,
        so a reference would point at a different psalm. It is still in the Bible tab to read.
      </Text>
    </Sheet>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 24, marginBottom: space.xs },
  note: { fontFamily: font.serifItalic, fontSize: 15, lineHeight: 23 },
  list: { marginTop: space.md, maxHeight: 340 },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, borderTopWidth: 1, paddingVertical: space.md },
  name: { fontFamily: font.displayMedium, fontSize: 17 },
  state: { fontFamily: font.ui, fontSize: 12.5 },
  foot: { fontFamily: font.ui, fontSize: 11.5, lineHeight: 18, marginTop: space.md },
});
