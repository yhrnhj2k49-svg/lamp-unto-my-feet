// Claude occasionally escapes a non-ASCII character twice in a structured
// reply, so it survives parsing as the six characters \u2014 instead of a dash.
// Decode those, anywhere in a parsed result.

export const decodeEscapes = (s: string) =>
  s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));

export function cleanStrings<T>(value: T): T {
  if (typeof value === "string") return decodeEscapes(value) as T;
  if (Array.isArray(value)) return value.map((v) => cleanStrings(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanStrings(v)])) as T;
  }
  return value;
}
