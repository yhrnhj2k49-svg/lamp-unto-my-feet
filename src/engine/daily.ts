// Which verse belongs to which day.
//
// Worked out from the date itself rather than stored or randomised, so the
// phone can schedule a fortnight ahead without keeping a list, two people on
// the same day get the same verse, and nothing about it needs a network.

import { VERSES, type Verse } from "../data/verses";

// Stepping by a number that shares no factor with the corpus size walks through
// every passage before repeating any — 167 is prime, so any step but a multiple
// of it will do. 61 simply keeps consecutive days far apart in the list.
const STEP = 61;

/** Days since 1970 in local time, so the verse turns over at local midnight. */
export const dayNumber = (d = new Date()) =>
  Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);

export function verseForDay(day: number = dayNumber()): Verse {
  const i = ((day * STEP) % VERSES.length + VERSES.length) % VERSES.length;
  return VERSES[i];
}

/** The notification body: enough to be worth reading on a lock screen. */
export function notificationText(v: Verse): { title: string; body: string } {
  const text = v.text.trim();
  return {
    title: v.ref,
    body: text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text,
  };
}
