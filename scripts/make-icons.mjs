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
const FIRE = `
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

const CORE_G = `
  <linearGradient id="core" x1="0.5" y1="0" x2="0.5" y2="1">
    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
    <stop offset="60%" stop-color="#FFF6D8" stop-opacity="0.85"/>
    <stop offset="100%" stop-color="#CFE0FF" stop-opacity="0.55"/>
  </linearGradient>`;

// A flame that flickers, rather than a teardrop. The old shape was
// symmetrical, which reads as water; this one leans, hooks at the tip and
// carries one shoulder fuller than the other. The inner core is white-hot with
// a touch of cool blue at its base, where a real flame is coolest.
//
// Drawn once at full size; the adaptive and splash variants scale it down and
// re-centre it, since the flame's own centre sits above the canvas centre.
const FLAME = `M523 168 C 516 300 592 336 618 430 C 660 585 592 700 512 700
  C 424 700 366 596 400 486 C 424 406 470 380 492 316
  C 506 274 504 222 523 168 Z`;
const CORE = `M519 366 C 512 436 560 460 570 522 C 582 596 552 646 508 646
  C 466 646 438 596 452 540 C 466 484 508 452 519 366 Z`;

// Bounding box is 366..660 x 168..700 — a 608px diagonal, inside Android's
// 676px safe circle once re-centred.
const flame = (fill, core) => `<path d="${FLAME}" fill="${fill}"/>${core ? `<path d="${CORE}" fill="${core}"/>` : ""}`;
// Nudged down so the shape sits on the canvas centre rather than above it.
const centred = (scale, fill, core) =>
  `<g transform="translate(512 512) scale(${scale}) translate(-512 -434)">${flame(fill, core)}</g>`;

const svg = (defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs>${defs}</defs>${body}</svg>`;

const files = {
  "icon.png": svg(
    NIGHT + GLOW + FIRE + CORE_G,
    `<rect width="1024" height="1024" fill="url(#night)"/>
     <circle cx="512" cy="520" r="470" fill="url(#glow)"/>
     ${flame("url(#flame)", "url(#core)")}`
  ),
  // Adaptive background and foreground are parallaxed apart by the system,
  // so the ground and its glow stay on the background layer.
  "android-icon-background.png": svg(
    NIGHT + GLOW,
    `<rect width="1024" height="1024" fill="url(#night)"/>
     <circle cx="512" cy="520" r="470" fill="url(#glow)"/>`
  ),
  "android-icon-foreground.png": svg(FIRE + CORE_G, centred(0.82, "url(#flame)", "url(#core)")),
  // Themed icons are a single flat colour: the core would be invisible.
  "android-icon-monochrome.png": svg("", centred(0.82, "#FFFFFF", null)),
  // Splash marks sit on the theme's own background.
  "splash-icon.png": svg(DEEP, centred(0.82, "url(#flame)", null)),
  "splash-icon-dark.png": svg(FIRE + CORE_G, centred(0.82, "url(#flame)", "url(#core)")),
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
