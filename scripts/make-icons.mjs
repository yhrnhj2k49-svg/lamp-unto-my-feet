// Ship set for the illuminated initial. Every file is drawn as its own SVG —
// no compositing — so nothing can silently end up underneath something else.
import sharp from "sharp";

const GROUND = `
  <radialGradient id="ground" cx="50%" cy="38%" r="78%">
    <stop offset="0%" stop-color="#262C52"/>
    <stop offset="62%" stop-color="#161A33"/>
    <stop offset="100%" stop-color="#0E1020"/>
  </radialGradient>`;
const GOLD = `
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#F6E3AC"/>
    <stop offset="40%" stop-color="#E5C266"/>
    <stop offset="100%" stop-color="#B98B1E"/>
  </linearGradient>`;
const DARKGOLD = `
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#B08A22"/>
    <stop offset="50%" stop-color="#8A6714"/>
    <stop offset="100%" stop-color="#6E5110"/>
  </linearGradient>`;
const HALO = `
  <radialGradient id="halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#FFE9AE" stop-opacity="0.5"/>
    <stop offset="55%" stop-color="#FFD98A" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="#FFD98A" stop-opacity="0"/>
  </radialGradient>`;
const FRAME = `
  <linearGradient id="goldFlat" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#EBCE7C"/>
    <stop offset="100%" stop-color="#C39A2A"/>
  </linearGradient>`;

// The H itself. Cap 292–732, stems 78 wide, hairline crossbar, slab serifs.
// Bounding box is 296..728 x 292..732 — a 616px diagonal, inside Android's
// 676px safe circle, so the same drawing works as an adaptive foreground.
const H = (fill) => `<g fill="${fill}">
  <rect x="344" y="292" width="78" height="440"/>
  <rect x="602" y="292" width="78" height="440"/>
  <rect x="422" y="494" width="180" height="30"/>
  <rect x="296" y="292" width="174" height="26"/>
  <rect x="554" y="292" width="174" height="26"/>
  <rect x="296" y="706" width="174" height="26"/>
  <rect x="554" y="706" width="174" height="26"/>
</g>`;

const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs>${defs}</defs>${body}</svg>`;

const files = {
  // Full app icon: ground, halo, rule, initial.
  "icon.png": svg(
    GROUND + GOLD + HALO + FRAME,
    `<rect width="1024" height="1024" fill="url(#ground)"/>
     <circle cx="512" cy="506" r="340" fill="url(#halo)"/>
     <rect x="104" y="104" width="816" height="816" rx="6" fill="none" stroke="url(#goldFlat)" stroke-width="7" opacity="0.55"/>
     ${H("url(#gold)")}`
  ),
  // Android adaptive: background and foreground are separate layers and the
  // system parallaxes them, so the rule lives on the background.
  "android-icon-background.png": svg(
    GROUND + HALO + FRAME,
    `<rect width="1024" height="1024" fill="url(#ground)"/>
     <circle cx="512" cy="506" r="340" fill="url(#halo)"/>`
  ),
  "android-icon-foreground.png": svg(GOLD, H("url(#gold)")),
  // Monochrome (themed icons): flat white, the system recolours it.
  "android-icon-monochrome.png": svg("", H("#FFFFFF")),
  // Splash marks sit on the theme's own background, so no ground here.
  "splash-icon.png": svg(DARKGOLD, H("url(#gold)")),
  "splash-icon-dark.png": svg(GOLD, H("url(#gold)")),
};

const out = process.argv[2];
for (const [name, s] of Object.entries(files)) {
  await sharp(Buffer.from(s)).png().toFile(`${out}/${name}`);
  console.log("wrote", name);
}
// Favicon last, small and square.
await sharp(Buffer.from(files["icon.png"])).resize(48, 48).png().toFile(`${out}/favicon.png`);
console.log("wrote favicon.png");
