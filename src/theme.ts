// Design tokens for Lamp Unto My Feet.
//
// The palette comes from the material world of a printed Bible: India-paper
// bone, blue-black printer's ink, the oxidised vermilion of rubricated
// pilcrows, binding-cloth indigo, and the gilt of a gilded page edge.

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
  rule: string;
  ruleSoft: string;
  rubricWash: string;
};

export const palettes: Record<Scheme, Palette> = {
  light: {
    ground: "#EEEDE7",
    panel: "#F5F4EF",
    recess: "#E6E4DB",
    ink: "#1B1E28",
    ink2: "#585B69",
    ink3: "#84858F",
    rubric: "#9E2B20",
    indigo: "#2C3766",
    gilt: "#8E6E3A",
    rule: "#CFCCC1",
    ruleSoft: "#DFDCD3",
    rubricWash: "rgba(158,43,32,0.07)",
  },
  dark: {
    ground: "#14161C",
    panel: "#191C24",
    recess: "#1E212A",
    ink: "#E5E1D6",
    ink2: "#9C9DA8",
    ink3: "#787985",
    rubric: "#D4695B",
    indigo: "#93A2DD",
    gilt: "#BFA067",
    rule: "#2E323C",
    ruleSoft: "#262A33",
    rubricWash: "rgba(212,105,91,0.14)",
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
