// Recent episodes of a fixed set of podcasts, trimmed to what a phone needs.
//
// The feeds themselves run 2–9 MB each. A phone should not pull eight
// megabytes over cellular to list thirty episodes, and the podcast hosts
// should not learn who is browsing — only who presses play, which is when the
// audio itself is fetched. So this route reads just the top of a feed, keeps
// the newest episodes, and serves a few kilobytes, cached for an hour.
//
// Only the shows listed here can be fetched. Anything else is refused, so the
// server cannot be used to fetch arbitrary URLs on someone else's behalf.

export const SHOWS: Record<string, string> = {
  bibleproject: "https://feeds.simplecast.com/3NVmUWZO",
  "bible-in-a-year": "https://feeds.fireside.fm/bibleinayear/rss",
  "bible-recap": "https://feed.podbean.com/thebiblerecap/feed.xml",
  "pray-as-you-go": "https://admin.prayasyougo.org/api/feed.xml",
  "tim-keller": "https://podcast.gospelinlife.com/feed.xml",
  "daily-audio-bible": "https://feeds.feedburner.com/dailyaudiobible",
};

export type Episode = {
  title: string;
  audio: string;
  /** YYYY-MM-DD, the publisher's own calendar day. */
  published: string | null;
  seconds: number | null;
  summary: string;
};

const KEEP = 30;
// Feeds list newest first, so thirty episodes sit in the first few hundred
// kilobytes. Stop reading there even if the thirtieth has not closed.
const MAX_BYTES = 1_500_000;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m);

const plain = (s: string) =>
  decode(decode(s))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tag = (item: string, name: string) => {
  const m = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
};

// itunes:duration is "HH:MM:SS", "MM:SS", or a count of seconds.
const toSeconds = (raw: string): number | null => {
  const s = plain(raw);
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

// The day as the publisher wrote it. Converting through UTC moved Pray As You
// Go's "Tuesday 22 September" episode — published at midnight in London — to
// Monday the 21st for anyone in America.
const calendarDay = (raw: string): string | null => {
  const m = raw.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  const month = m ? MONTHS[m[2].toLowerCase()] : undefined;
  if (m && month) return `${m[3]}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

function parse(xml: string): Episode[] {
  const out: Episode[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const item = m[0];
    const audio = item.match(/<enclosure[^>]*\surl="([^"]+)"/i)?.[1];
    // Plain http audio is refused by iOS and exposes the listener; skip it.
    if (!audio || !audio.startsWith("https://")) continue;
    const date = plain(tag(item, "pubDate"));
    const summary = plain(tag(item, "itunes:summary") || tag(item, "description"));
    out.push({
      title: plain(tag(item, "title")),
      audio: decode(audio),
      published: date ? calendarDay(date) : null,
      seconds: toSeconds(tag(item, "itunes:duration")),
      summary: summary.length > 280 ? `${summary.slice(0, 277).trimEnd()}…` : summary,
    });
    if (out.length >= KEEP) break;
  }
  return out;
}

/** Read the top of a feed only: stop once enough episodes have closed. */
async function head(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "HeAnswers/1.0 (+podcast list)" } });
  if (!res.ok || !res.body) throw new Error(`feed ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let xml = "";
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      xml += decoder.decode(value, { stream: true });
      if (bytes > MAX_BYTES || (xml.match(/<\/item>/gi)?.length ?? 0) >= KEEP) break;
    }
  } finally {
    reader.cancel().catch(() => {});
  }
  return xml;
}

const CACHE_SECONDS = 60 * 60;

export async function podcast(req: Request, headers: Record<string, string>): Promise<Response> {
  const id = new URL(req.url).searchParams.get("show") ?? "";
  const feed = SHOWS[id];
  const reply = (body: unknown, status: number, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers, ...extra } });

  if (!feed) return reply({ error: "Unknown show." }, 404);

  // One cache entry per show, whoever asks, so a busy hour costs one fetch.
  // Versioned, so a change to what is sent back is not masked by an hour of old copies.
  const key = new Request(`https://cache.internal/podcast/v2/${id}`);
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default: Cache }).default : null;
  const hit = cache ? await cache.match(key) : undefined;
  if (hit) {
    // Headers.set replaces regardless of case. Spreading plain objects does not:
    // the cached copy's lowercase keys and these capitalised ones both survived,
    // and browsers refuse a response whose CORS header reads "*, *".
    const merged = new Headers(hit.headers);
    for (const [k, v] of Object.entries(headers)) merged.set(k, v);
    return new Response(hit.body, { status: 200, headers: merged });
  }

  try {
    const episodes = parse(await head(feed));
    if (episodes.length === 0) return reply({ error: "No episodes could be read." }, 502);
    const res = reply({ show: id, episodes }, 200, { "Cache-Control": `public, max-age=${CACHE_SECONDS}` });
    if (cache) await cache.put(key, res.clone());
    return res;
  } catch (error) {
    console.error(`podcast ${id}:`, error);
    return reply({ error: "That show could not be reached." }, 502);
  }
}
