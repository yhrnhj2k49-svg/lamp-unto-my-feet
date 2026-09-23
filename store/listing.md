# Store listing — He Answers

Draft copy and answers for App Store Connect and the Google Play Console.
**Review everything here before submitting.** The privacy answers describe how
the app works as built; they are not legal advice.

---

## Names and short text

| Field | Limit | Text | Length |
|---|---|---|---|
| App name (both stores) | 30 | He Answers | 10 |
| App Store subtitle | 30 | Scripture for what you carry | 28 |
| Play short description | 80 | Write what you're carrying. Get the scripture that meets it. | 60 |
| App Store keywords | 100 | bible,scripture,verses,prayer,devotional,kjv,comfort,grief,anxiety,faith,psalms,christian,hope | 94 |

Suggested category: **Reference** (primary), **Books** or **Lifestyle** (secondary).

**App Store promotional text** (170, can be changed without a new build):
> Write down what's actually happening and how it has left you. Get the passages that meet it, what each one means, and how to live it.

---

## Description (both stores)

Write down what is actually happening and how it has left you. He Answers sets out the passages of scripture that meet it.

PASSAGES CHOSEN FOR YOU
With your permission, Claude, an AI made by Anthropic, reads what you write and chooses four passages for your particular situation, with a line on why each one applies to you. Losing a job at 58 and losing a first job at 22 are not the same weight, and the passages shouldn't be either.

HOW TO LIVE IT
Every passage opens into three parts: the setting (who wrote it, to whom, and what was happening), what it asks of you, and a question to sit with.

SCRIPTURE AS PRINTED
Passages are the King James Version, checked word for word against the complete text, each with a plain-English reading beside it. Prefer another translation? Have passages shown in any of nine you can download, taken from that translation's own text.

PRIVATE BY CHOICE
No account, no ads, no tracking. The app asks before anything you write is sent. Say no, and passages are matched on your phone instead, with nothing leaving it.

THE WHOLE BIBLE, OFFLINE
Ten complete translations, free to download and read with no signal: Berean Standard, New Heart English, King James, American King James, American Standard, Young's Literal, Darby, Bible in Basic English, Catholic Public Domain, and Webster's.

WATCH AND LISTEN
The JESUS film and other full-length films from the Jesus Film Project, short animated studies from BibleProject, and daily prayer, Bible readings and teaching from six podcasts across Catholic, Protestant and non-denominational voices.

KEEP WHAT LANDS
Keep the passages you want to come back to. They stay on your phone.

If you are in danger, the app points you to people who can help right now.

---

## Apple — App Privacy ("nutrition label")

- **Data used to track you:** None.
- **Data linked to you:** None.
- **Data not linked to you:** User Content → *Other User Content*.
  - Purpose: App Functionality.
  - Why declare it: when someone allows Claude's reading, what they write is sent to Anthropic, which handles it under its own policy. Declaring it is the conservative, honest answer. Reports (Claude's writing plus a reason) fall under the same heading.
- Everything else (identifiers, usage data, diagnostics, location, contacts): not collected.

## Google Play — Data safety

- **Data collected:** App activity → *Other user-generated content*. Optional (the user chooses whether Claude reads what they write). Purpose: App functionality. Not used for ads or analytics.
- **Data shared:** Anthropic processes it on the app's behalf as a service provider, which Google's form does not count as sharing. Confirm against the current form wording when you fill it in.
- **Encrypted in transit:** Yes.
- **Deletion:** the app stores nothing on a server about the user, so there is nothing to request deletion of; kept passages live only on the device.

## Age rating

Answer the questionnaires honestly. Points that matter: the app shows AI-generated text, and it mentions suicide in a supportive context (crisis helplines). Expect **12+** on the App Store and a comparable rating on Play; neither store lets you choose the rating directly.

---

## Notes for Apple's reviewer

> No sign-in is needed. Type a situation on the Read tab and tap Find the passages.
>
> Before anything is sent, the app asks for permission to share what the user writes with Claude, Anthropic's AI (guideline 5.1.2(i)). "Keep it on my phone" gives passages matched on the device, with no network request. The choice can be changed under About → Claude's reading.
>
> AI-generated readings can be reported in-app ("Report this reading", and "Report" under How to live this).
>
> If what a user writes suggests they may be in danger, helpline numbers appear above the passages.
>
> All Bible text is in the public domain. Copyrighted translations (NIV, ESV, NLT) are linked out to Bible Gateway, not included.

## Links

- Support email (both stores ask for one, and it is shown publicly):
  **richbygodfr@gmail.com**
- Privacy policy: https://yhrnhj2k49-svg.github.io/lamp-unto-my-feet/privacy.html
- Terms of use: https://yhrnhj2k49-svg.github.io/lamp-unto-my-feet/terms.html
- Support: https://yhrnhj2k49-svg.github.io/lamp-unto-my-feet/support.html
- Marketing: https://yhrnhj2k49-svg.github.io/lamp-unto-my-feet/

---

# Google Play — the rest of the console

## Before you can publish at all

A **personal** developer account opened after 13 Nov 2023 cannot ship straight
to production. You must first run a **closed test with at least 12 testers,
opted in continuously for 14 days**, then apply for production access, which
Google reviews in about 7 days. Testers who drop out break the streak and the
clock restarts. Budget three weeks, and start collecting the 12 Gmail addresses
before anything else — it is the only part that cannot be hurried.

## Store listing assets Play requires

| Asset | Spec | Status |
|---|---|---|
| App icon | 512 × 512 PNG, 32-bit, no transparency | `store/play/icon-512.png` |
| Feature graphic | 1024 × 500 PNG or JPG, no transparency | `store/play/feature-graphic.png` |
| Phone screenshots | 2–8, min 320 px, max 3840 px, ratio at most 2:1 | capture from the app |
| Short description | 80 chars | see table above |
| Full description | 4000 chars | see Description above |

## Content rating questionnaire (IARC)

Answer these as written; they are what the app actually does.

- Violence, sexuality, profanity, controlled substances, gambling: **no** to all.
- **Does the app contain user-generated content?** No — nothing a user writes is
  shown to any other user. What they write goes to Claude and comes back only
  to them.
- **Does the app reference or depict self-harm or suicide?** Yes, in a
  supportive context only: when what someone writes suggests danger, the app
  shows crisis helpline numbers. Say so plainly; hiding it is worse.
- **Does the app share the user's location?** No.
- **Does it allow users to communicate with each other?** No.

## Target audience and content

- Target age groups: **13+**. Do not tick under-13; that pulls in Families
  policy, which requires a different AI-content posture entirely.
- Is the app appealing to children? **No.**

## App access

**All functionality is available without any special access.** No account, no
login, no credentials. Say this in the App access section, or review stalls
while Google waits for sign-in details that do not exist.

## Ads

**Contains ads: No.**

## Data safety — the exact answers

- Does your app collect or share any of the required user data types? **Yes.**
- Data type: **App activity → Other user-generated content.**
  - Collected: **Yes.** Shared: **No** (Anthropic processes it as a service
    provider on the app's behalf; confirm against the form's current wording).
  - Is it optional? **Yes** — the user is asked first and can decline, and the
    app then matches passages on the device with nothing leaving the phone.
  - Purpose: **App functionality** only. Not ads, not analytics, not
    personalisation.
- Encrypted in transit: **Yes** (HTTPS to the Cloudflare Worker).
- Can users request deletion? There is nothing stored about a user to delete —
  no accounts, no server-side records. Kept passages live on the device and go
  when the app is uninstalled.

## AI-generated content policy

Play requires apps with AI-generated content to offer in-app reporting. This app
has it: **"Report this reading"** on a reading, and **Report** under "How to
live this". Reports carry Claude's own words and the reason — never what the
user wrote. Mention this in the production-access application.

## Applying for production access — what they ask

1. *How did recruiting testers go, and how did they engage?* Answer honestly.
2. *Who is the app for and what is its value?* People carrying something hard
   who want scripture that meets it, not a search box.
3. *Expected installs in year one?* A range is fine; do not inflate it.
4. *What did you change because of testing?* Keep notes during the 14 days —
   this question is easier to answer if you wrote things down as they came up.


---

# Watch & Listen — what it changes on the privacy forms

Videos play in a YouTube embed (privacy-enhanced mode) inside the app, and
podcast audio streams from each show's host. Both are third parties receiving
a user's IP address and device details once the user opens a video or plays
an episode. Browsing the lists sends nothing to either.

- **Apple privacy label.** The app's own code still collects nothing for
  tracking. Whether an embedded YouTube player counts as a "third-party
  partner" whose collection must be declared is a judgment call. The
  conservative answer is to add **Identifiers → Device ID** and **Usage Data →
  Product Interaction**, *not linked* and *not used for tracking* by this app,
  with a note that they reach Google only when a video is opened. Decide this
  deliberately; understating it is the riskier mistake.
- **Google Play data safety.** Same reasoning. Read Google's current guidance
  on data collected through WebViews and third-party libraries when filling
  in the form, and answer against what the app actually does.
- **Terms of use** are linked from the consent sheet and About, and live at
  the URL above. They are drafted, not reviewed by a lawyer.
