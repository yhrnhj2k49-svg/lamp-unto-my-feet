import { memo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { font, label, space } from "../theme";
import { usePalette } from "../usePalette";
import { isKept as isKeptNow, toggle, updateLiving, useKept } from "../store/kept";
import type { Personal } from "../engine/ai";
import type { Theme, Verse } from "../data/verses";
import { livingFor } from "../data/living";
import Living from "./Living";
import Illuminated from "./Illuminated";
import { usePassageText } from "../bible/usePassageText";
import Fleuron from "./Fleuron";

type Props = {
  verse: Verse;
  theme?: string;
  first?: boolean;
  /** Set when the passage came from Claude's reading, so its application can be written for it. */
  personalize?: { situation: string; feelings: Theme[] };
};

/**
 * A passage set the way a centre-column reference Bible sets one: the citation
 * and apparatus out in the margin, the text itself given the width, and the
 * glosses underneath in a smaller face so ancient text and modern explanation
 * never get mistaken for one another.
 */
function PassageCard({ verse, theme, first, personalize }: Props) {
  const c = usePalette();
  const kept = useKept();
  const isKept = kept.some((k) => k.ref === verse.ref);
  const wide = useWindowDimensions().width >= 700;
  const own = livingFor(verse.ref);
  const [personal, setPersonal] = useState<Personal | null>(null);
  const shownText = usePassageText(verse.ref, verse.text);

  // Only a passage kept from this card takes on the words written here. One
  // kept from an earlier reading keeps the words written for that reading.
  const keptHere = useRef(false);

  const onPersonal = (p: Personal) => {
    setPersonal(p);
    if (keptHere.current && isKeptNow(verse.ref)) updateLiving(verse.ref, p);
  };

  const onKeep = () => {
    Haptics.impactAsync(
      isKept ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
    keptHere.current = !isKept;
    toggle({ ...verse, apply: personal?.apply ?? verse.apply, reflect: personal?.reflect ?? verse.reflect });
  };

  return (
    <>
    {/* Between passages, a printer's ornament rather than a plain rule. */}
    {!first && <Fleuron tight />}
    <View
      style={[
        s.wrap,
        wide && s.wrapWide,
        first && { borderTopColor: c.rule, borderTopWidth: 1 },
      ]}
    >
      <View style={[s.margin, wide && s.marginWide]}>
        <Text style={[s.ref, { color: c.ink }]}>{verse.ref}</Text>
        <Text style={[label, { color: c.ink3 }]}>{shownText.version}</Text>
        {theme ? <Text style={[label, s.theme, { color: c.gilt }]}>{theme}</Text> : null}
        <Pressable
          onPress={onKeep}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isKept ? `Remove ${verse.ref} from kept` : `Keep ${verse.ref}`}
          accessibilityState={{ selected: isKept }}
        >
          <Text
            style={[
              s.keep,
              { color: isKept ? c.rubric : c.ink3, borderBottomColor: isKept ? c.rubric : c.rule },
            ]}
          >
            {isKept ? "Kept" : "Keep"}
          </Text>
        </Pressable>
      </View>

      <View style={s.body}>
        <Illuminated text={shownText.text} />

        <View style={s.notes}>
          <Text style={[s.note, { color: c.ink2 }]}>
            <Text style={[label, { color: c.gilt }]}>In plain words  </Text>
            {verse.plain}
          </Text>
          <Text style={[s.note, { color: c.ink2 }]}>
            <Text style={[label, { color: c.gilt }]}>Why this one  </Text>
            {verse.why}
          </Text>
        </View>

        <Living
          setting={verse.setting || own?.setting}
          apply={verse.apply || own?.apply}
          reflect={verse.reflect || own?.reflect}
          personalize={personalize ? { ...personalize, ref: verse.ref, why: verse.why } : undefined}
          onPersonal={onPersonal}
        />
      </View>
    </View>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: space.lg, gap: space.md },
  wrapWide: { flexDirection: "row", gap: 34 },
  margin: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space.md },
  marginWide: {
    flexDirection: "column",
    alignItems: "flex-end",
    width: 150,
    gap: space.sm,
    paddingTop: 3,
  },
  body: { flex: 1, minWidth: 0 },
  ref: { fontFamily: font.displayMedium, fontSize: 17 },
  theme: {},
  keep: { fontFamily: font.ui, fontSize: 12, letterSpacing: 0.5, borderBottomWidth: 1, paddingBottom: 1 },
  notes: { marginTop: space.md, gap: space.sm },
  note: { fontFamily: font.ui, fontSize: 13.5, lineHeight: 21 },
});

export default memo(PassageCard);
