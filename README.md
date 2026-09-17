# Lamp Unto My Feet

Write down what you are actually going through and how it has left you. Claude
reads it and sets out the passages that meet it — each with a plain-English
reading, and a line on why it applies to your situation rather than to a
category you have been sorted into.

Expo / React Native app, iOS and Android, plus a small Cloudflare Worker that
holds the API key. If the reading cannot be made, the app falls back to a
concordance that runs on the phone, so it always answers.

---

## Run it on your phone right now

You do **not** need Xcode or Android Studio for this.

```bash
npm install
npx expo start
```

Install **Expo Go** from the App Store or Play Store, then scan the QR code in
the terminal. The app opens on your phone with live reload.

To run it in a browser instead (useful for a quick look, not a shipping target):

```bash
npx expo start --web
```

---

## What it does

**The reading (default).** What you write goes to the reading server, which asks
Claude to choose four passages and say why each meets *your* situation. Claude is
held to the app's vetted concordance and quotes from it, so scripture comes out as
printed rather than as recalled — the single biggest risk in an app like this.

**The device concordance (fallback).** 167 passages, King James Version (public
domain), each tagged for the moments it speaks to. Phrases are weighed before
single words, because "lost my job" and "lost my mum" share a word and nothing
else; how you say you feel counts for more than what the situation is about. It
runs with no network, and it is what answers when a reading cannot be made.

**How to live it.** Every passage has a "How to live this" section: the setting (who wrote it, to whom, and what was happening), what it asks of you, and a question to sit with. Claude writes all three for the situation you describe; offline they come from `src/data/living.ts`, written for each of the 167 passages. Settings say "traditionally" wherever authorship is not certain.

**Crisis detection.** If someone writes that they are in danger, helpline numbers
appear above the passages — alongside them, never instead of them.

**Keeping.** Passages you keep are stored on the phone only.

---

## What it costs to run

Every reading is a call to Claude, paid for on your Anthropic key. The reading
server uses `claude-opus-5` with adaptive thinking at effort **medium**.

Measured on the same four real situations at each setting:

| Effort | Average wait | Slowest | Quotes word-for-word KJV |
|---|---|---|---|
| medium (default) | 15.1s | 16.8s | 16 of 16 |
| high | 20.2s | 28.0s | 16 of 16 |

Medium chose 13 of the same 16 passages as high. Four readings each shows the
difference; it does not pin the numbers down.

Nobody waits on this. The phone's own matches appear the moment you search, and
Claude's reading replaces them when it arrives.

Levers:

- **`READING_EFFORT`**: `low`, `medium`, `high`, `xhigh` or `max`. Change it on the
  deployed worker without touching code by adding `READING_EFFORT = "high"` under
  `[vars]` in `server/wrangler.toml`, or set it as an environment variable locally.
- **The model.** `claude-sonnet-5` costs $2/$10 per million tokens against Opus 5's
  $5/$25. Opus is the better reader.
- **Rate limiting.** The worker caps 20 readings per IP per hour, in memory. That
  blunts casual abuse but does not prevent it; put Cloudflare's Rate Limiting
  binding in front before you advertise the app anywhere.

---

## Shipping to the App Store and Google Play

Builds happen in Expo's cloud, so you don't need Xcode or Android Studio
installed.

### 1. Accounts you have to create yourself

These require your identity, payment, and acceptance of store agreements, so
they can't be done for you:

| | Cost | Where |
|---|---|---|
| Apple Developer Program | $99/year | developer.apple.com/programs |
| Google Play Developer | $25 once | play.google.com/console/signup |
| Expo account | free | expo.dev/signup |

Apple's individual enrolment can take a couple of days to verify. Start it first.

### 2. Set your own identifiers

In `app.json`, replace the placeholder bundle IDs with something you own —
reverse-domain form, and they can never be changed after first submission:

```json
"ios":     { "bundleIdentifier": "com.yourname.lampuntomyfeet" },
"android": { "package":          "com.yourname.lampuntomyfeet" }
```

### 3. Build

```bash
npm install -g eas-cli
eas login
eas build:configure

eas build --platform ios          # produces an .ipa
eas build --platform android      # produces an .aab for Play
```

The first iOS build asks for your Apple credentials and generates the signing
certificates and provisioning profiles for you.

### 4. Submit

```bash
eas submit --platform ios
eas submit --platform android
```

Then finish the store listing in App Store Connect and the Play Console:
screenshots, description, and the privacy questionnaire.

**On the privacy questionnaire:** with readings switched on, "no data collected"
is no longer the honest answer. What someone writes is transmitted to your worker
and on to Anthropic. Neither stores it, but it *is* transmitted, and both stores
ask about transmission, not just storage. Declare it — the usual fit is
"Other User Content", used for App Functionality, not linked to identity, not
used for tracking. Your privacy policy needs to say the same in plain words.
(With the endpoint unset the app makes no network requests at all, and "no data
collected" is then accurate.)

### Before you submit

- [ ] Replace `assets/icon.png` — it's still the Expo default. 1024×1024, no
      transparency, no rounded corners (the stores round it themselves).
- [ ] Replace `assets/android-icon-foreground.png` and the monochrome variant.
- [ ] Both stores need screenshots at several device sizes. `npx expo start`
      on a real phone plus the system screenshot key is the quickest route.
- [ ] Apple asks for a support URL and a privacy policy URL. Both are required
      even when you collect nothing.
- [ ] Deploy the reading server and set `EXPO_PUBLIC_READING_ENDPOINT` **before**
      you build — Expo inlines `EXPO_PUBLIC_*` at build time, so a build made
      without it ships as device-only however you set it afterwards.

---

## The reading server

Lives in `server/`. It exists for one reason: **an API key cannot go in the app.**
Anything shipped to a store can be unpacked, and a leaked key is billable to you.
So the app posts to this, and this holds the key.

### Deploy it

Wrangler needs Node 22 or later (with nvm: `nvm install 22`):

```bash
cd server
npm install
npx wrangler secret put ANTHROPIC_API_KEY    # paste your key; never commit it
npx wrangler deploy
```

Wrangler prints a URL. Put it in the app's `.env` at the repo root:

```
EXPO_PUBLIC_READING_ENDPOINT=https://lamp-reading.<your-subdomain>.workers.dev
```

Restart `npx expo start` so Expo picks up the new env var.

### Run it locally

Two ways. `npm run dev:node` needs only Node 20 and is the quicker loop:

```bash
cd server
cp .dev.vars.example .dev.vars     # add your key
ANTHROPIC_API_KEY=sk-ant-... npm run dev:node    # plain Node, port 8787
npm run dev                                       # or wrangler, needs Node 22
```

Then point the app at `http://localhost:8787`. Note that a phone running Expo Go
cannot reach your laptop's `localhost` — use your machine's LAN IP, or test in
the browser with `npx expo start --web`.

### Leaving it off

Unset `EXPO_PUBLIC_READING_ENDPOINT` and the app runs entirely on the device
concordance: no network, no cost, nothing leaves the phone. The About screen
copy changes to match automatically.

### If you edit the corpus

The grounding list Claude quotes from is generated from the app's own corpus.
After editing `src/data/verses.ts`:

```bash
npx tsx scripts/build-corpus.ts
```

## Layout

```
app/
  _layout.tsx           fonts, splash, providers
  (tabs)/
    _layout.tsx         tab bar
    index.tsx           the writing screen and results
    kept.tsx            saved passages
    about.tsx           how it works, the text, crisis resources
src/
  data/verses.ts        the corpus — KJV text, gloss, why, theme tags
  data/lexicon.ts       what people type, mapped to themes
  engine/match.ts       scoring, book diversity, openings
  engine/safety.ts      crisis phrase detection
  engine/ai.ts          reading client (talks to server/)
  store/kept.ts         local storage for kept passages
  theme.ts              design tokens
  components/Passage.tsx
scripts/
  build-corpus.ts       regenerates the server's grounding list from verses.ts
server/
  src/index.ts          the Cloudflare Worker — holds the API key
  src/local.ts          runs the same handler on plain Node for local dev
  src/corpus.ts         GENERATED grounding list
```

### Adding passages

Append to `VERSES` in `src/data/verses.ts`. List the themes **most central
first** — the matcher weights them by position, so the first tag counts fully
and later ones taper off.

```ts
{
  ref: "Psalm 46:10",
  text: "Be still, and know that I am God.",
  plain: "Stop. Let go. Know who I am.",
  why: "For a mind that will not stop working the problem.",
  themes: ["peace", "anxiety", "doubt"],
}
```

If people describe a situation in words the lexicon doesn't know, add them to
`src/data/lexicon.ts` — `PHRASES` for anything multi-word (they score higher and
disambiguate), `TERMS` for single words.

---

## Design

Set in **Gentium Book Plus**, drawn by SIL specifically for scripture
typesetting and minority-language Bible translation, with **Bodoni Moda** for
citations and **Archivo** for apparatus. The palette is taken from a printed
Bible: India-paper bone, blue-black printer's ink, the oxidised vermilion of a
rubricated pilcrow, binding-cloth indigo, gilt page edge. Passages are set the
way a centre-column reference Bible sets them — citation in the margin, text
given the width, glosses below in a smaller face so ancient text and modern
explanation are never mistaken for one another.

Both light and dark are designed, not inverted.

---

## The text

King James Version, public domain. The plain reading beside each passage is a
paraphrase written for this app, not a translation — where they differ, the
scripture is what counts.

---

## License

All rights reserved — see [LICENSE](LICENSE). The code is public to read, not to
reuse or republish. The King James Version text is not covered by that notice.
