import { useColorScheme } from "react-native";
import { palettes, type Palette } from "./theme";

export function usePalette(): Palette {
  return palettes[useColorScheme() === "dark" ? "dark" : "light"];
}
