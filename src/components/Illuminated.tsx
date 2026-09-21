// A passage opened the way a scribe opened one: the first letter set large in
// rubric, the rest of the text running on after it.
//
// React Native has no float, so this is a raised initial rather than a true
// drop cap. The capital keeps the paragraph's own line height, so it rises
// above the first line instead of pushing the lines apart.

import { StyleSheet, Text, type TextStyle, type StyleProp } from "react-native";
import { font } from "../theme";
import { usePalette } from "../usePalette";

// Anything before the first letter (an opening quotation mark, a bracket)
// stays at text size; only the letter itself is illuminated.
const split = (text: string) => {
  const i = text.search(/\p{L}/u);
  if (i < 0) return { lead: "", initial: "", rest: text };
  return { lead: text.slice(0, i), initial: text[i], rest: text.slice(i + 1) };
};

export default function Illuminated({
  text,
  style,
  size = 19.5,
  lineHeight = 32,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  size?: number;
  lineHeight?: number;
}) {
  const c = usePalette();
  const { lead, initial, rest } = split(text);
  return (
    <Text style={[{ fontFamily: font.serif, fontSize: size, lineHeight, color: c.ink }, style]}>
      {lead}
      {!!initial && (
        <Text
          style={[
            s.initial,
            {
              color: c.rubric,
              fontSize: size * 2.15,
              lineHeight,
              textShadowColor: c.giltBright,
            },
          ]}
        >
          {initial}
        </Text>
      )}
      {rest}
    </Text>
  );
}

const s = StyleSheet.create({
  initial: {
    fontFamily: font.displayMedium,
    // A hair of gold at the edge, as if the letter were laid over leaf.
    textShadowOffset: { width: 0.6, height: 0.6 },
    textShadowRadius: 0.5,
  },
});
