import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VERSES } from "../../src/data/verses";
import { CRISIS_NOTE } from "../../src/engine/safety";
import { aiAvailable } from "../../src/engine/ai";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import PageGlow from "../../src/components/PageGlow";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = usePalette();
  return (
    <View style={[s.section, { borderTopColor: c.ruleSoft }]}>
      <Text style={[label, { color: c.gilt }]}>{title}</Text>
      <View style={{ gap: space.sm }}>{children}</View>
    </View>
  );
}

export default function AboutScreen() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={[s.p, { color: c.ink2 }]}>{children}</Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.ground }}>
    <PageGlow />
    <ScrollView
      style={{ backgroundColor: "transparent" }}
      contentContainerStyle={[
        s.page,
        { paddingTop: insets.top + space.lg, paddingBottom: space.xxl },
      ]}
    >
      <View style={[s.head, { borderBottomColor: c.giltBright }]}>
        <Text style={[s.title, { color: c.ink }]}>About</Text>
      </View>

      <Text style={[s.lede, { color: c.ink, borderLeftColor: c.rubric }]}>
        Write down what is actually happening and how it has left you. It gets read for
        what it actually is, and you get the passages that meet it — with a plain reading
        of each, so nothing turns on knowing what a word meant in 1611.
      </Text>

      <Section title="How the passages are chosen">
        {aiAvailable ? (
          <>
            <P>
              What you write is read by Claude, which chooses four passages that meet your
              particular situation and says why each one applies in your terms — not the
              terms of a category you have been sorted into.
            </P>
            <P>
              It is held to a vetted concordance of {VERSES.length} passages and quotes from
              it, so the scripture you are given is the scripture as printed rather than as
              remembered.
            </P>
            <P>
              If the reading cannot be made — no signal, or the service is down — the app
              falls back to matching on this phone against those same passages, each tagged
              for the moments it speaks to. It never leaves you with nothing.
            </P>
          </>
        ) : (
          <P>
            {VERSES.length} passages are carried in the app, each tagged for the kinds of
            moments it speaks to. What you write is weighed against those tags — phrases
            first, since losing a job and losing a parent share a word but nothing else —
            and how you say you feel counts for more than what the situation is about.
          </P>
        )}
        <P>
          Either way it is a concordance, not a counsellor. It will sometimes hand you the
          wrong passage. Take the one that lands and leave the rest.
        </P>
      </Section>

      <Section title="What leaves your phone">
        {aiAvailable ? (
          <>
            <P>
              When a reading is made, what you wrote is sent to the reading service so it
              can be read, and on to Anthropic to do the reading. Neither the app nor the
              service keeps it — there is no account, and no history is stored anywhere.
            </P>
            <P>
              Passages you keep are stored only on this phone, which also means they go if
              you delete the app. When the app falls back to matching on the device,
              nothing leaves the phone at all.
            </P>
          </>
        ) : (
          <P>
            Nothing. There is no account, no server and no analytics. The matching runs on
            the device, and passages you keep are stored only on it — which also means they
            go if you delete the app.
          </P>
        )}
      </Section>

      <Section title="The text">
        <P>
          Passages are the King James Version, which is in the public domain. The plain
          reading beside each one is a paraphrase written for this app, not a translation
          — where the two differ, the scripture is what counts. Check anything that
          matters against your own Bible.
        </P>
      </Section>

      <Section title="If you are in danger">
        <P>{CRISIS_NOTE.body}</P>
        {CRISIS_NOTE.lines.map((l) => (
          <Text key={l} style={[s.p, { color: c.ink }]}>
            {l}
          </Text>
        ))}
        <Pressable onPress={() => Linking.openURL("https://findahelpline.com").catch(() => {})}>
          <Text style={[s.link, { color: c.indigo, borderBottomColor: c.indigo }]}>
            Open findahelpline.com
          </Text>
        </Pressable>
      </Section>

      <Text style={[s.colophon, { color: c.ink3, borderTopColor: c.rule }]}>
        Set in Gentium Book Plus, drawn by SIL for scripture typesetting, with Bodoni
        Moda and Archivo. Version 1.0.0.
      </Text>
    </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: 20, maxWidth: 760, width: "100%", alignSelf: "center" },
  head: { borderBottomWidth: 1, paddingBottom: space.sm },
  title: { fontFamily: font.display, fontSize: 30 },
  lede: {
    fontFamily: font.serif,
    fontSize: 17.5,
    lineHeight: 28,
    marginTop: space.lg,
    borderLeftWidth: 2,
    paddingLeft: 14,
  },
  section: { marginTop: space.lg, paddingTop: space.md, borderTopWidth: 1, gap: space.sm },
  p: { fontFamily: font.ui, fontSize: 14, lineHeight: 22.5 },
  link: { fontFamily: font.uiMedium, fontSize: 14, borderBottomWidth: 1, alignSelf: "flex-start" },
  colophon: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 19,
    marginTop: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
  },
});
