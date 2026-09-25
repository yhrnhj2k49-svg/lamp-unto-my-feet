import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VERSES } from "../../src/data/verses";
import { CRISIS_NOTE } from "../../src/engine/safety";
import { aiAvailable } from "../../src/engine/ai";
import { setConsent, useConsent } from "../../src/store/consent";
import { PRIVACY_URL, SUPPORT_URL, TERMS_URL } from "../../src/links";
import { useBilling } from "../../src/billing/purchases";
import { FREE_PER_MONTH, useQuota } from "../../src/store/quota";
import { useEntitlement } from "../../src/billing/entitlement";
import { disableDaily, enableDaily, setDailyTime, useDaily } from "../../src/store/daily";
import { verseForDay } from "../../src/engine/daily";
import { font, label, space } from "../../src/theme";
import { usePalette } from "../../src/usePalette";
import PageGlow from "../../src/components/PageGlow";
import GoldRule from "../../src/components/GoldRule";

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
  const billing = useBilling();
  const { used } = useQuota();
  const { plan } = useEntitlement();
  const daily = useDaily();
  const [refused, setRefused] = useState(false);
  const today = verseForDay();

  const TIMES = [
    { hour: 6, minute: 0, label: "6 am" },
    { hour: 7, minute: 0, label: "7 am" },
    { hour: 8, minute: 0, label: "8 am" },
    { hour: 9, minute: 0, label: "9 am" },
    { hour: 21, minute: 0, label: "9 pm" },
  ];
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { value: consent } = useConsent();
  const aiOn = aiAvailable && consent === "granted";
  const A = ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={{ alignSelf: "flex-start" }}>
      <Text style={[s.link, { color: c.indigo, borderBottomColor: c.indigo }]}>{children}</Text>
    </Pressable>
  );
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
      <View style={[s.head, { borderBottomWidth: 0, paddingBottom: space.sm + 6 }]}>
        <GoldRule pinned />
        <Text style={[s.title, { color: c.ink }]}>About</Text>
      </View>

      <Text style={[s.lede, { color: c.ink, borderLeftColor: c.rubric }]}>
        Write down what is actually happening and how it has left you. It gets read for
        what it actually is, and you get the passages that meet it — with a plain reading
        of each, so nothing turns on knowing what a word meant in 1611.
      </Text>

      {aiAvailable ? (
        <Section title="Claude's reading">
          <P>
            {consent === "granted"
              ? "On. What you write is sent to Claude, an AI made by Anthropic, to choose passages for you and to write how to live them."
              : consent === "declined"
                ? "Off. Passages are matched on this phone and nothing you write is sent."
                : "Not decided yet. You will be asked the first time you search, before anything is sent."}
          </P>
          {consent === "granted" ? (
            <A onPress={() => void setConsent("declined")}>Keep everything on this phone instead</A>
          ) : (
            <A onPress={() => void setConsent("granted")}>Let Claude read what I write</A>
          )}
        </Section>
      ) : null}

      <Section title="How the passages are chosen">
        {aiOn ? (
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
        {aiOn ? (
          <>
            <P>
              What you write, and any feelings you pick, is sent to the reading service and on
              to Anthropic so Claude can choose passages. Opening "How to live this" sends it
              again, with that passage. Neither this app nor its reading service keeps a copy.
            </P>
            <P>
              If you report something Claude wrote, that writing and the reason you choose are
              kept for review for up to 90 days. What you wrote is not included.
            </P>
          </>
        ) : (
          <P>
            Nothing you write. There is no account and no analytics, and passages are matched
            on this phone.
          </P>
        )}
        <P>
          Passages you keep are stored only on this phone, which also means they go if you
          delete the app. Bible translations download from GitHub, like any web page.
        </P>
        <A onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}>Read the privacy policy</A>
        <A onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}>Read the terms of use</A>
      </Section>

      <Section title="A verse each morning">
        <P>
          {daily.on
            ? `On, at ${TIMES.find((t) => t.hour === daily.hour)?.label ?? `${daily.hour}:00`}. Today's is ${today.ref}.`
            : "One passage each morning, on your lock screen. It is chosen on this phone, so it works with no signal and nothing is sent anywhere."}
        </P>

        {daily.on ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {TIMES.map((t) => {
              const on = daily.hour === t.hour && daily.minute === t.minute;
              return (
                <Pressable
                  key={t.label}
                  onPress={() => void setDailyTime(t.hour, t.minute)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{
                    borderWidth: 1,
                    borderColor: on ? c.rubric : c.rule,
                    backgroundColor: on ? c.rubricWash : "transparent",
                    paddingVertical: 6,
                    paddingHorizontal: 11,
                  }}
                >
                  <Text style={{ fontFamily: font.ui, fontSize: 13, color: on ? c.rubric : c.ink2 }}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <A
          onPress={() => {
            if (daily.on) {
              void disableDaily();
              setRefused(false);
              return;
            }
            void enableDaily().then((ok) => setRefused(!ok));
          }}
        >
          {daily.on ? "Turn the morning verse off" : "Send me a verse each morning"}
        </A>

        {refused ? (
          <P>
            Your phone refused notifications for this app. Turn them on in the phone&apos;s
            settings, then try again.
          </P>
        ) : null}
      </Section>

      <Section title="Readings">
        <P>
          {plan === "unlimited"
            ? "You have unlimited readings. Thank you for paying for this — it is what keeps the app running."
            : `Claude has written ${used} of your ${FREE_PER_MONTH} readings this month. Everything the phone does by itself — matching passages, the whole Bible, Watch and Listen — is free and unmetered.`}
        </P>
        {billing.tips.length > 0 ? (
          <>
            <P>
              If the app has been worth something to you, you can put something toward what it
              costs to run. Nothing changes in the app if you do; it is a thank you, not a purchase.
            </P>
            {billing.tips.map((t) => (
              <A key={t.id} onPress={() => void billing.buy(t.id)}>
                {`Support the app — ${t.price || t.title}`}
              </A>
            ))}
          </>
        ) : null}
        {billing.canBuy ? (
          <A onPress={() => void billing.restore()}>Restore a purchase</A>
        ) : null}
      </Section>

      <Section title="The text">
        <P>
          Passages are the King James Version, which is in the public domain. You can have
          them shown in any translation you have downloaded — tap the translation name above
          the passages on the Read tab. The words then come from that translation's own text,
          never rewritten, and it says which one you are reading. The plain reading beside
          each one is a paraphrase written for this app, not a translation — where the two
          differ, the scripture is what counts. Check anything that matters against your own
          Bible.
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
        Moda and Archivo. Version 1.0.0.{"\n"}
        <Text
          accessibilityRole="link"
          onPress={() => Linking.openURL(SUPPORT_URL).catch(() => {})}
          style={{ textDecorationLine: "underline" }}
        >
          Help and support
        </Text>
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
