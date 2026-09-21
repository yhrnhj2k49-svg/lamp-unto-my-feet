import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePalette } from "../usePalette";

const PARCHMENT = require("../../assets/parchment.png");

/**
 * The page itself: a faint parchment grain, and light falling onto it from
 * above. Sits behind the content and never takes a touch, so it reads as the
 * surface of a page rather than as something to press.
 *
 * The grain is a white tile whose only content is its alpha, tinted per theme
 * — warm brown by day, candle-gold by night — and kept to a whisper so the
 * text is never fighting it.
 */
export default function PageGlow() {
  const c = usePalette();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={PARCHMENT}
        resizeMode="repeat"
        tintColor={c.grain}
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%", opacity: c.grainOpacity }]}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={[c.glow, "transparent"]}
        locations={[0, 0.42]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
