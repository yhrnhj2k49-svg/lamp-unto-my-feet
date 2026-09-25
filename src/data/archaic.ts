// Words the King James uses that mean something else, or nothing at all, in
// modern English.
//
// This is the offline half of "look closer": it costs nothing, works with no
// signal, and never involves an AI. It covers the words that actually trip
// people up in the passages this app carries — the pronouns, the verb endings,
// and above all the false friends, where a word is still in use today but meant
// something different in 1611.
//
// Only glosses that hold across the King James are listed. Where a word's sense
// genuinely depends on the verse, that is said rather than guessed at, and the
// deeper reading is left to the word study.

export type Gloss = { plain: string; note?: string };

export const ARCHAIC: Record<string, Gloss> = {
  // Pronouns and verb endings
  thee: { plain: "you", note: "One person, as the object of the sentence." },
  thou: { plain: "you", note: "One person, as the subject of the sentence." },
  thy: { plain: "your", note: "Belonging to one person." },
  thine: { plain: "yours", note: "Also 'your' before a vowel: thine eyes." },
  ye: { plain: "you", note: "More than one person." },
  you: { plain: "you", note: "In 1611 this was plural, or formal to one person." },
  art: { plain: "are", note: "As in 'thou art' — you are." },
  wast: { plain: "were" },
  wert: { plain: "were" },
  hast: { plain: "have", note: "As in 'thou hast' — you have." },
  hath: { plain: "has" },
  doth: { plain: "does" },
  dost: { plain: "do" },
  didst: { plain: "did" },
  shalt: { plain: "shall", note: "'Thou shalt' — you shall." },
  wilt: { plain: "will" },
  canst: { plain: "can" },
  saith: { plain: "says" },
  sayest: { plain: "say" },
  knowest: { plain: "know" },
  knoweth: { plain: "knows" },
  cometh: { plain: "comes" },
  giveth: { plain: "gives" },
  maketh: { plain: "makes" },
  taketh: { plain: "takes" },
  seeketh: { plain: "seeks" },
  dwelleth: { plain: "dwells", note: "Lives, stays." },
  keepeth: { plain: "keeps" },
  loveth: { plain: "loves" },
  worketh: { plain: "works", note: "Often: brings about, produces." },
  bringeth: { plain: "brings" },
  hearkeneth: { plain: "listens" },

  // False friends: still English, but not what they now mean
  charity: { plain: "love", note: "Not giving to the poor. The self-giving love of 1 Corinthians 13." },
  conversation: { plain: "way of life", note: "How someone conducts themselves, not talking." },
  prevent: { plain: "go before", note: "To come ahead of, not to stop." },
  let: { plain: "hinder", note: "In older usage the opposite of today's 'let'." },
  quick: { plain: "living", note: "As in 'the quick and the dead' — the living and the dead." },
  meat: { plain: "food", note: "Any food, not only flesh." },
  corn: { plain: "grain", note: "Wheat or barley, not maize." },
  suffer: { plain: "allow", note: "'Suffer the little children' — let them come." },
  comfort: { plain: "strengthen", note: "To put strength into someone, more than to soothe." },
  wonderful: { plain: "causing wonder", note: "Astonishing, not merely very nice." },
  peculiar: { plain: "belonging to", note: "A people for God's own possession, not odd." },
  simple: { plain: "easily led", note: "Naive, untaught — not stupid." },
  virtue: { plain: "power", note: "As in power going out of someone." },
  presently: { plain: "at once", note: "Immediately, not 'in a little while'." },
  by: { plain: "by", note: "'By and by' means at once, not eventually." },
  careful: { plain: "anxious", note: "Full of care: 'be careful for nothing' means do not be anxious." },
  communicate: { plain: "share", note: "To share what you have with someone." },
  convenient: { plain: "fitting", note: "Proper or right, not handy." },
  ensue: { plain: "pursue", note: "'Seek peace and ensue it' — chase after it." },
  instant: { plain: "urgent", note: "Persistent: 'instant in prayer'." },
  nought: { plain: "nothing" },
  outwent: { plain: "went ahead of" },
  room: { plain: "place", note: "A position or seat, not a chamber." },
  several: { plain: "separate", note: "Each one's own, not 'a few'." },
  sometimes: { plain: "formerly", note: "Once, in times past." },
  trow: { plain: "suppose" },
  wealth: { plain: "wellbeing", note: "Welfare in general, not only money." },
  wit: { plain: "know", note: "'To wit' means namely." },

  // Common words that are simply out of use
  abideth: { plain: "remains" },
  abide: { plain: "remain", note: "To stay, to keep on." },
  albeit: { plain: "although" },
  behold: { plain: "look", note: "A word that points: see this." },
  beseech: { plain: "beg", note: "To ask earnestly." },
  betimes: { plain: "early" },
  contrite: { plain: "broken-hearted", note: "Crushed by sorrow over wrong done." },
  countenance: { plain: "face", note: "A face, and the look on it." },
  divers: { plain: "various" },
  durst: { plain: "dared" },
  ere: { plain: "before" },
  fain: { plain: "gladly" },
  forsake: { plain: "abandon" },
  forsaketh: { plain: "abandons" },
  fret: { plain: "be angry", note: "To burn with irritation." },
  hearken: { plain: "listen" },
  henceforth: { plain: "from now on" },
  hither: { plain: "here", note: "To this place." },
  howbeit: { plain: "however" },
  lest: { plain: "in case", note: "For fear that." },
  lo: { plain: "look" },
  mete: { plain: "measure" },
  nay: { plain: "no" },
  nigh: { plain: "near" },
  peradventure: { plain: "perhaps" },
  raiment: { plain: "clothing" },
  reproof: { plain: "correction" },
  saveth: { plain: "saves" },
  shew: { plain: "show" },
  shewed: { plain: "showed" },
  shewest: { plain: "show" },
  shewing: { plain: "showing" },
  smite: { plain: "strike" },
  sore: { plain: "severely", note: "'Sore afraid' — greatly afraid." },
  sundry: { plain: "various" },
  tarry: { plain: "wait" },
  thence: { plain: "from there" },
  thither: { plain: "there", note: "To that place." },
  travail: { plain: "hard labour", note: "Painful effort, and a woman's labour." },
  tribulation: { plain: "trouble", note: "Pressing, crushing pressure." },
  verily: { plain: "truly" },
  vex: { plain: "distress" },
  wax: { plain: "grow", note: "To become: wax cold, wax strong." },
  whence: { plain: "from where" },
  wherefore: { plain: "why", note: "Or: for this reason." },
  whither: { plain: "where", note: "To what place." },
  whoso: { plain: "whoever" },
  whosoever: { plain: "whoever" },
  wilderness: { plain: "wild country", note: "Empty, unfarmed land — not necessarily desert." },
  wrath: { plain: "anger" },
  yea: { plain: "yes", note: "Often: and more than that." },
};

/** Strips punctuation and case so a tapped word can be looked up. */
export const normaliseWord = (w: string) =>
  w.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");

export const glossFor = (word: string): Gloss | undefined => ARCHAIC[normaliseWord(word)];
