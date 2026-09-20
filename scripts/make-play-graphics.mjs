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
    <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDF0"/><stop offset="28%" stop-color="#FFEFC0"/>
      <stop offset="60%" stop-color="#FBD378"/><stop offset="100%" stop-color="#E8AE3C"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#n)"/>
  <circle cx="236" cy="258" r="250" fill="url(#glow)"/>
  <path d="M236 92 C284 163 316 200 316 246 a80 80 0 0 1 -160 0 c0 -46 32 -83 80 -154 Z" fill="url(#flame)"/>
  <text x="446" y="238" font-family="Georgia, 'Times New Roman', serif" font-size="84" fill="#F4E6C0">He Answers</text>
  <rect x="449" y="272" width="118" height="3" fill="#C9A227" opacity="0.85"/>
  <text x="449" y="330" font-family="Georgia, 'Times New Roman', serif" font-size="31" font-style="italic" fill="#C6BDA4">Scripture for what you carry</text>
</svg>`;
await sharp(Buffer.from(fg)).removeAlpha().png().toFile(`${P}/store/play/feature-graphic.png`);
const m = await sharp(`${P}/store/play/feature-graphic.png`).metadata();
console.log("feature-graphic", `${m.width}x${m.height}`, "alpha=" + m.hasAlpha);
