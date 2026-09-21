// A printer's ornament between sections: a gilt rule, three lozenges, a rule.
// Drawn rather than set as a glyph — a character like ❦ falls back to
// whatever system font has it, and looks different on every phone.

import { StyleSheet, View } from "react-native";
import { usePalette } from "../usePalette";

export default function Fleuron({ tight = false }: { tight?: boolean }) {
  const c = usePalette();
  const lozenge = (size: number, filled: boolean, color: string) => (
    <View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: "45deg" }],
        borderWidth: 1,
        borderColor: color,
        backgroundColor: filled ? color : "transparent",
      }}
    />
  );
  return (
    <View
      style={[s.row, { marginVertical: tight ? 10 : 18 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[s.rule, { backgroundColor: c.giltBright }]} />
      <View style={s.mid}>
        {lozenge(5, false, c.gilt)}
        {lozenge(8, true, c.rubric)}
        {lozenge(5, false, c.gilt)}
      </View>
      <View style={[s.rule, { backgroundColor: c.giltBright }]} />
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rule: { flex: 1, height: 1, opacity: 0.7 },
  mid: { flexDirection: "row", alignItems: "center", gap: 9 },
});
