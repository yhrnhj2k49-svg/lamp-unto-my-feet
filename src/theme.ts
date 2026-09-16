// Design tokens for Lamp Unto My Feet.
//
// The palette comes from an illuminated Bible rather than a plain printed one:
// ivory vellum catching the light, ultramarine ground from lapis lazuli, gold
// leaf, and the oxidised vermilion of a rubricated pilcrow. Day is a page in
// sunlight; night is the same page by candle.

export type Scheme = "light" | "dark";

export type Palette = {
  ground: string;
  panel: string;
  recess: string;
  ink: string;
  ink2: string;
  ink3: string;
  rubric: string;
  indigo: string;
  gilt: string;
  giltBright: string;
  rule: string;
  ruleSoft: string;
  rubricWash: string;
  glow: string;
};

export const palettes: Record<Scheme, Palette> = {
  light: {
    ground: "#FCFAF5",
    panel: "#FFFFFF",
    recess: "#F5F0E4",
    ink: "#1C1A2E",
    ink2: "#55506B",
    ink3: "#8A8499",
    rubric: "#A82B1E",
    indigo: "#2E3F8F",
    gilt: "#8A6714",
    giltBright: "#C9A227",
    rule: "#E4DCC9",
    ruleSoft: "#EFE9DA",
    rubricWash: "rgba(168,43,30,0.06)",
    glow: "rgba(201,162,39,0.13)",
  },
  dark: {
    ground: "#131527",
    panel: "#1A1D33",
    recess: "#1F2240",
    ink: "#F1EBDD",
    ink2: "#A9A3BC",
    ink3: "#7D7793",
    rubric: "#E0796A",
    indigo: "#93A6EC",
    gilt: "#E0BC63",
    giltBright: "#F0D489",
    rule: "#2E3253",
    ruleSoft: "#242745",
    rubricWash: "rgba(224,121,106,0.14)",
    glow: "rgba(224,188,99,0.10)",
  },
};

// Font family keys registered in app/_layout.tsx.
export const font = {
  serif: "Gentium_400",
  serifItalic: "Gentium_400i",
  serifBold: "Gentium_700",
  display: "Bodoni_400",
  displayMedium: "Bodoni_500",
  displayItalic: "Bodoni_400i",
  ui: "Archivo_400",
  uiMedium: "Archivo_500",
  uiSemi: "Archivo_600",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 34,
  xxl: 52,
} as const;

// Uppercase gilt labels used for marginal glosses and section eyebrows.
export const label = {
  fontFamily: font.uiSemi,
  fontSize: 10.5,
  letterSpacing: 1.5,
  textTransform: "uppercase" as const,
};
