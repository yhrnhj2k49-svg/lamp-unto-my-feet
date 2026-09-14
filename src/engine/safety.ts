// If someone types that they are in danger, the app says so plainly and points
// at a person they can reach tonight. The passages still follow — this is
// added alongside them, never instead of them.

const CRISIS = [
  /\bkill(ing)? myself\b/,
  /\bend (my life|it all)\b/,
  /\btake my own life\b/,
  /\bsuicid(e|al)\b/,
  /\b(want|wanna|going) to die\b/,
  /\bdon'?t want to (live|be here|wake up)\b/,
  /\bbetter off (dead|without me)\b/,
  /\bno reason to (live|go on)\b/,
  /\b(harm|hurt|cut) myself\b/,
  /\boverdos(e|ing)\b/,
  /\bcan'?t go on\b/,
];

export function needsCrisisNote(text: string): boolean {
  const t = text.toLowerCase();
  return CRISIS.some((r) => r.test(t));
}

export const CRISIS_NOTE = {
  title: "Please reach a person tonight",
  body: "Some of what you wrote sounds like you may be in danger. Scripture is not a substitute for someone who can sit with you right now.",
  lines: [
    "US and Canada — call or text 988",
    "UK and Ireland — call 116 123 (Samaritans)",
    "Anywhere — findahelpline.com",
    "If you are in immediate danger, call your local emergency number.",
  ],
};
