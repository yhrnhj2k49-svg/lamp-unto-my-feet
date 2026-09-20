// Generates the whole icon set for He Answers. sharp is not a dependency of
// the app, so borrow it for the run:
//   npx --yes -p sharp@0.33 node scripts/make-icons.mjs assets
//
// The mark is one warm light in the dark, chosen against how icons are
// actually seen rather than how they look in a design tool:
//   · recognition at a glance runs on low spatial frequency, so the bright
//     mass is large and the silhouette simple — it still reads when blurred;
//   · curved contours read as safer than angular ones, which matters for an
//     app opened in distress, so there is not a straight line in the mark;
//   · a dark tile is the odd one out on a home screen full of saturated
//     colour, and the odd one out is the one you find and remember;
//   · warm light in darkness is about as close to a universal figure for
//     help as exists.
//
// Every file is drawn as its own SVG. Nothing is composited, because sharp's
// .composite() does NOT stack across calls — a second call silently discards
// the first, which is how an earlier icon set shipped with a blank layer.
import sharp from "sharp";

const NIGHT = `
  <radialGradient id="night" cx="50%" cy="46%" r="76%">
    <stop offset="0%" stop-color="#1E2447"/><stop offset="58%" stop-color="#141833"/><stop offset="100%" stop-color="#0B0D19"/>
  </radialGradient>`;
const GLOW = `
  <radialGradient id="glow" cx="50%" cy="54%" r="50%">
    <stop offset="0%" stop-color="#FFE2A0" stop-opacity="0.95"/>
    <stop offset="30%" stop-color="#FFD183" stop-opacity="0.42"/>
    <stop offset="66%" stop-color="#F5BC58" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="#F5BC58" stop-opacity="0"/>
  </radialGradient>`;
const FLAME = `
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFFDF0"/><stop offset="28%" stop-color="#FFEFC0"/>
    <stop offset="60%" stop-color="#FBD378"/><stop offset="100%" stop-color="#E8AE3C"/>
  </linearGradient>`;
// For the light splash the flame sits on ivory, where pale gold would vanish.
const DEEP = `
  <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#E7C063"/><stop offset="35%" stop-color="#D2A537"/>
    <stop offset="100%" stop-color="#9A7216"/>
  </linearGradient>`;

// Teardrop: pointed apex, full round belly, no straight edges.
const flame = (cx, topY, w, botY) => {
  const r = w / 2;
  const cy = botY - r;
  return `M${cx} ${topY} C ${cx + w * 0.62} ${topY + (cy - topY) * 0.52}, ${cx + r} ${cy - r * 0.62}, ${cx + r} ${cy} a ${r} ${r} 0 0 1 ${-w} 0 c 0 ${-r * 0.62}, ${w * 0.06} ${-(cy - topY) * 0.48}, ${w * 0.5} ${-(cy - topY)} Z`;
};

// Full bleed, for the app icon.
const BIG = flame(512, 150, 420, 872);
// Android keeps adaptive-icon artwork inside a 676px centre circle; this one
// is 330 x 560, a 650px diagonal, so it clears the mask in every shape.
const SAFE = flame(512, 240, 330, 800);

const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs>${defs}</defs>${body}</svg>`;

const files = {
  "icon.png": svg(
    NIGHT + GLOW + FLAME,
    `<rect width="1024" height="1024" fill="url(#night)"/>
     <circle cx="512" cy="546" r="500" fill="url(#glow)"/>
     <path d="${BIG}" fill="url(#flame)"/>`
  ),
  // Adaptive background and foreground are parallaxed apart by the system,
  // so the ground and its glow stay on the background layer.
  "android-icon-background.png": svg(
    NIGHT + GLOW,
    `<rect width="1024" height="1024" fill="url(#night)"/>
     <circle cx="512" cy="546" r="500" fill="url(#glow)"/>`
  ),
  "android-icon-foreground.png": svg(FLAME, `<path d="${SAFE}" fill="url(#flame)"/>`),
  "android-icon-monochrome.png": svg("", `<path d="${SAFE}" fill="#FFFFFF"/>`),
  // Splash marks sit on the theme's own background.
  "splash-icon.png": svg(DEEP, `<path d="${SAFE}" fill="url(#flame)"/>`),
  "splash-icon-dark.png": svg(FLAME, `<path d="${SAFE}" fill="url(#flame)"/>`),
};

const out = process.argv[2] ?? "assets";
for (const [name, s] of Object.entries(files)) {
  let img = sharp(Buffer.from(s)).png();
  // The App Store rejects an icon that carries an alpha channel at all, even
  // a fully opaque one. The layers that need transparency keep it.
  if (name === "icon.png" || name === "android-icon-background.png") img = img.removeAlpha();
  await img.toFile(`${out}/${name}`);
  console.log("wrote", name);
}
await sharp(Buffer.from(files["icon.png"])).resize(48, 48).removeAlpha().png().toFile(`${out}/favicon.png`);
console.log("wrote favicon.png");
