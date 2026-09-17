import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";

type Props = { setting?: string; apply?: string; reflect?: string };

/**
 * "How to live this": closed by default, so the passage itself is still the
 * first thing read, and one tap away when someone wants to take it further.
 */
export default function Living({ setting, apply, reflect }: Props) {
  const c = usePalette();
  const [open, setOpen] = useState(false);
  if (!setting && !apply && !reflect) return null;

  return (
    <View style={[s.wrap, { borderTopColor: c.ruleSoft }]}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          setOpen((o) => !o);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="How to live this"
        hitSlop={8}
        style={s.toggle}
      >
        <Text style={[label, { color: c.indigo }]}>How to live this</Text>
        <Text style={[s.sign, { color: c.indigo }]}>{open ? "−" : "+"}</Text>
      </Pressable>

      {open ? (
        <View style={s.body}>
          {setting ? (
            <View style={s.block}>
              <Text style={[label, { color: c.gilt }]}>The setting</Text>
              <Text style={[s.text, { color: c.ink2 }]}>{setting}</Text>
            </View>
          ) : null}
          {apply ? (
            <View style={s.block}>
              <Text style={[label, { color: c.gilt }]}>Living it</Text>
              <Text style={[s.text, { color: c.ink }]}>{apply}</Text>
            </View>
          ) : null}
          {reflect ? (
            <View style={[s.block, s.question, { borderLeftColor: c.giltBright }]}>
              <Text style={[label, { color: c.gilt }]}>To sit with</Text>
              <Text style={[s.reflect, { color: c.ink }]}>{reflect}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: space.md, borderTopWidth: 1, paddingTop: space.xs },
  toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  sign: { fontFamily: font.uiMedium, fontSize: 17, lineHeight: 18 },
  body: { gap: space.md, marginTop: space.xs, paddingBottom: space.xs },
  block: { gap: 4 },
  text: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
  question: { borderLeftWidth: 2, paddingLeft: 12 },
  reflect: { fontFamily: font.serifItalic, fontSize: 16.5, lineHeight: 25 },
});
