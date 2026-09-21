// The ruled border of an illuminated page: a heavier gold line over a hairline,
// both fading out at the ends the way gold leaf thins where the brush lifted.

import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePalette } from "../usePalette";

/**
 * `pinned` lays the rule along the bottom edge of its parent, so a heading can
 * keep whatever layout it has (a row, a stack) and simply stand on the rule.
 */
export default function GoldRule({ fade = "end", pinned = false }: { fade?: "end" | "both"; pinned?: boolean }) {
  const c = usePalette();
  const colors =
    fade === "both"
      ? (["transparent", c.giltDeep, c.giltBright, c.giltDeep, "transparent"] as const)
      : ([c.giltDeep, c.giltBright, c.gilt, "transparent"] as const);
  const locations = fade === "both" ? ([0, 0.18, 0.5, 0.82, 1] as const) : ([0, 0.35, 0.8, 1] as const);
  return (
    <View
      pointerEvents="none"
      style={[{ gap: 2.5 }, pinned && { position: "absolute", left: 0, right: 0, bottom: 0 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient colors={colors} locations={locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1.75 }} />
      <LinearGradient
        colors={colors}
        locations={locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 0.75, opacity: 0.75 }}
      />
    </View>
  );
}
