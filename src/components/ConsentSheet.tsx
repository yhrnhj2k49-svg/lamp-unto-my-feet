import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import Sheet from "./Sheet";
import { ANTHROPIC_PRIVACY_URL, TERMS_URL } from "../links";
import { font, space } from "../theme";
import { usePalette } from "../usePalette";

type Props = { visible: boolean; onAllow: () => void; onDecline: () => void; onDismiss: () => void };

/**
 * Asked before the first reading is sent, never assumed. Closing it without
 * choosing sends nothing and asks again next time.
 */
export default function ConsentSheet({ visible, onAllow, onDecline, onDismiss }: Props) {
  const c = usePalette();
  return (
    <Sheet visible={visible} label="Before Claude reads this" onDismiss={onDismiss}>
      <Text style={[s.title, { color: c.ink }]}>Before Claude reads this</Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        To choose passages for what you wrote, the app sends your words, and any feelings you
        picked, to Claude, an AI made by Anthropic.
      </Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        This app keeps no copy. Anthropic handles what it receives under{" "}
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL(ANTHROPIC_PRIVACY_URL).catch(() => {})}
          style={[s.link, { color: c.indigo }]}
        >
          its privacy policy
        </Text>
        .
      </Text>
      <Text style={[s.p, { color: c.ink2 }]}>
        Or keep it on this phone. You still get passages, matched here instead, and nothing is
        sent.
      </Text>

      <View style={s.buttons}>
        <Pressable
          onPress={onAllow}
          accessibilityRole="button"
          style={[s.btn, { backgroundColor: c.ink, borderColor: c.ink }]}
        >
          <Text style={[s.btnText, { color: c.ground }]}>Allow Claude to read it</Text>
        </Pressable>
        <Pressable onPress={onDecline} accessibilityRole="button" style={[s.btn, { borderColor: c.rule }]}>
          <Text style={[s.btnText, { color: c.ink }]}>Keep it on my phone</Text>
        </Pressable>
      </View>
      <Text style={[s.small, { color: c.ink3 }]}>
        You can change this any time in About. Claude's writing can be wrong, and the app is not
        counselling or a crisis service. Using it means you agree to the{" "}
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}
          style={{ textDecorationLine: "underline" }}
        >
          terms of use
        </Text>
        .
      </Text>
    </Sheet>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30 },
  p: { fontFamily: font.ui, fontSize: 14, lineHeight: 22 },
  link: { textDecorationLine: "underline" },
  buttons: { gap: space.sm, marginTop: space.xs },
  btn: { borderWidth: 1, borderRadius: 1, paddingVertical: 14, alignItems: "center" },
  btnText: { fontFamily: font.uiSemi, fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase" },
  small: { fontFamily: font.ui, fontSize: 12, textAlign: "center" },
});
