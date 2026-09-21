// Recent episodes, via the reading server, which trims each feed to a few
// kilobytes and keeps podcast hosts from seeing who is only browsing.

import { ENDPOINT } from "./ai";

export type Episode = {
  title: string;
  audio: string;
  published: string | null;
  seconds: number | null;
  summary: string;
};

export async function episodesFor(show: string, signal?: AbortSignal): Promise<Episode[]> {
  if (!ENDPOINT) throw new Error("Podcasts need the reading server, which is not configured.");
  const res = await fetch(`${ENDPOINT.replace(/\/+$/, "")}/podcast?show=${encodeURIComponent(show)}`, { signal });
  const body = (await res.json().catch(() => ({}))) as { episodes?: Episode[]; error?: string };
  if (!res.ok || !body.episodes) throw new Error(body.error ?? "That show could not be reached.");
  return body.episodes;
}

export const durationLabel = (seconds: number | null) => {
  if (!seconds || seconds <= 0) return "";
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)} hr ${m % 60} min` : `${m} min`;
};

// The server sends the publisher's own day as YYYY-MM-DD. new Date() would read
// that as midnight UTC and, west of Greenwich, show the day before — so build
// it from its parts, in local time.
export const dateLabel = (day: string | null) => {
  // Tolerate a full timestamp too (older cached responses sent one): only the
  // date part is used either way.
  const m = day?.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

/** A summary that only repeats the title says nothing; leave it out. */
export const addsToTitle = (title: string, summary: string) => {
  const t = title.toLowerCase().trim();
  const s = summary.toLowerCase().trim();
  return s.length > 0 && !t.includes(s) && s !== t;
};

export const clock = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};
