import sharp from "sharp";
const P = "/Users/rbg/apps and files from claude/lamp-unto-my-feet";
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
  <defs>
    <radialGradient id="n" cx="26%" cy="50%" r="92%">
      <stop offset="0%" stop-color="#242B55"/><stop offset="56%" stop-color="#141833"/><stop offset="100%" stop-color="#0A0C18"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="54%" r="50%">
      <stop offset="0%" stop-color="#FFE2A0" stop-opacity="0.85"/>
      <stop offset="32%" stop-color="#FFD183" stop-opacity="0.34"/>
      <stop offset="70%" stop-color="#F5BC58" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="#F5BC58" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="core" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#FFF6D8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#CFE0FF" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDF0"/><stop offset="28%" stop-color="#FFEFC0"/>
      <stop offset="60%" stop-color="#FBD378"/><stop offset="100%" stop-color="#E8AE3C"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#n)"/>
  <circle cx="236" cy="258" r="250" fill="url(#glow)"/>
  <g transform="translate(236 258) scale(0.46) translate(-512 -434)">
    <path d="M523 168 C 516 300 592 336 618 430 C 660 585 592 700 512 700 C 424 700 366 596 400 486 C 424 406 470 380 492 316 C 506 274 504 222 523 168 Z" fill="url(#flame)"/>
    <path d="M519 366 C 512 436 560 460 570 522 C 582 596 552 646 508 646 C 466 646 438 596 452 540 C 466 484 508 452 519 366 Z" fill="url(#core)"/>
  </g>
  <text x="446" y="238" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="#F4E6C0">He Answers</text>
  <rect x="449" y="272" width="118" height="3" fill="#C9A227" opacity="0.85"/>
  <text x="449" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="31" font-style="italic" fill="#C6BDA4">Scripture for what you carry</text>
</svg>`;
await sharp(Buffer.from(fg)).removeAlpha().png().toFile(`${P}/store/play/feature-graphic.png`);
const m = await sharp(`${P}/store/play/feature-graphic.png`).metadata();
console.log("feature-graphic", `${m.width}x${m.height}`, "alpha=" + m.hasAlpha);
