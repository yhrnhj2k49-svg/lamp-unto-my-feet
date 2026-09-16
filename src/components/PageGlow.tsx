import { LinearGradient } from "expo-linear-gradient";
import { usePalette } from "../usePalette";

/**
 * Light falling onto the page from above. Sits behind the content and never
 * takes a touch, so it reads as illumination rather than as a surface.
 */
export default function PageGlow() {
  const c = usePalette();
  return (
    <LinearGradient
      colors={[c.glow, "transparent"]}
      locations={[0, 0.42]}
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
