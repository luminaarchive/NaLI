// Regenerates the whole public/brand kit from one canonical gunungan emblem.
// New navy NaLI identity. Run: node scripts/build-brand.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";

const NAVY = "#0E3A5C";
const INK = "#0A0A0A";
const WHITE = "#FFFFFF";
const BRAND = "public/brand";
const EXPORTS = `${BRAND}/png-exports`;

// ── canonical emblem (gunungan / kayon), drawn in a 200x300 box ──────────────
function sunRays(color) {
  let out = "";
  for (let i = 0; i < 13; i++) {
    const a = (-90 + (i - 6) * 13) * (Math.PI / 180);
    const cx = 100, cy = 26, r1 = 13, r2 = i % 2 === 0 ? 22 : 18;
    out += `<line x1="${(cx + Math.cos(a) * r1).toFixed(2)}" y1="${(cy + Math.sin(a) * r1).toFixed(2)}" x2="${(cx + Math.cos(a) * r2).toFixed(2)}" y2="${(cy + Math.sin(a) * r2).toFixed(2)}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
  }
  return out;
}

function emblem(color) {
  const leaves = [
    [70, 132], [130, 132], [62, 162], [138, 162],
    [82, 118], [118, 118], [76, 150], [124, 150],
  ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${color}"/>`).join("");
  const birds = [78, 122].map((cx, i) =>
    `<path transform="${i === 1 ? `translate(${cx}, 96) scale(-1,1)` : `translate(${cx}, 96)`}" fill="${color}" d="M0 0 C4 -3 9 -3 12 1 C14 -1 17 -1 18 1 C16 3 13 3 12 2 C10 5 4 6 1 3 Z"/>`
  ).join("");
  return `
    <g fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      ${sunRays(color)}
      <path d="M100 40 C 82 76 56 116 46 164 C 38 202 50 228 78 238 L 122 238 C 150 228 162 202 154 164 C 144 116 118 76 100 40 Z"/>
    </g>
    <g fill="${color}">
      <path d="M97 238 L97 96 C97 86 103 86 103 96 L103 238 Z"/>
      <path d="M100 60 C96 70 96 80 100 88 C104 80 104 70 100 60 Z"/>
      ${leaves}
      ${birds}
      <path d="M52 196 C54 190 60 188 66 188 C70 184 76 184 80 188 C84 188 88 190 90 194 L90 200 L86 200 L86 205 L82 205 L82 200 L66 200 L66 205 L62 205 L62 200 L56 200 C53 200 51 199 52 196 Z"/>
      <path transform="translate(200,0) scale(-1,1)" d="M52 196 C54 190 60 189 66 189 C68 184 72 182 76 184 C73 187 75 189 79 188 C84 188 88 190 90 194 L90 200 L86 200 L86 205 L82 205 L82 200 L66 200 L66 205 L62 205 L62 200 L56 200 C53 200 51 199 52 196 Z"/>
      <rect x="58" y="246" width="84" height="6" rx="1"/>
      <path d="M92 246 L92 224 C92 218 108 218 108 224 L108 246 Z"/>
      <rect x="80" y="226" width="6" height="20" rx="1"/>
      <rect x="114" y="226" width="6" height="20" rx="1"/>
    </g>
    <g fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round">
      <path d="M100 104 C84 104 74 116 70 132"/>
      <path d="M100 104 C116 104 126 116 130 132"/>
      <path d="M100 132 C80 134 66 146 62 162"/>
      <path d="M100 132 C120 134 134 146 138 162"/>
    </g>`;
}

// ── compositions ─────────────────────────────────────────────────────────────
const mark = (color) =>
  `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"><g transform="translate(20,10)">${emblem(color)}</g></svg>`;

const appIcon = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="${NAVY}"/>
  <g transform="translate(146,76) scale(1.1)">${emblem(WHITE)}</g>
</svg>`;

// wordmark uses a serif (Georgia is on macOS; resvg loads system fonts)
const wordmark = (fg, tag) => `<svg viewBox="0 0 800 250" xmlns="http://www.w3.org/2000/svg">
  <text x="400" y="120" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="150" font-weight="700" fill="${fg}" letter-spacing="-4">NaLI</text>
  <text x="400" y="185" text-anchor="middle" font-family="Georgia, serif" font-size="34" letter-spacing="10" fill="${fg}">${tag}</text>
</svg>`;

const lockup = (fg, bg) => `<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
  ${bg ? `<rect width="1440" height="320" fill="${bg}"/>` : ""}
  <g transform="translate(120,10) scale(0.95)">${emblem(fg)}</g>
  <text x="430" y="160" font-family="Georgia, serif" font-size="150" font-weight="700" fill="${fg}" letter-spacing="-4">NaLI</text>
  <text x="436" y="222" font-family="Georgia, serif" font-size="34" letter-spacing="9" fill="${fg}">Nature Life Intelligence</text>
</svg>`;

const og = `<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <g transform="translate(470,70) scale(1.05)">${emblem(WHITE)}</g>
  <text x="600" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="700" fill="${WHITE}" letter-spacing="-3">NaLI</text>
  <text x="600" y="525" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="9" fill="#BFD3E4">NATURE LIFE INTELLIGENCE</text>
  <text x="600" y="575" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#8FB0C8">Jurnal Riset Terbuka Indonesia</text>
</svg>`;

// ── write SVGs ───────────────────────────────────────────────────────────────
mkdirSync(EXPORTS, { recursive: true });
const svgs = {
  "nali-mark.svg": mark(NAVY),
  "nali-mark-mono.svg": mark(INK),
  "nali-app-icon.svg": appIcon,
  "nali-wordmark.svg": wordmark(NAVY, "NATURE LIFE INTELLIGENCE"),
  "nali-lockup.svg": lockup(NAVY, null),
  "nali-lockup-mono.svg": lockup(INK, null),
};
for (const [name, svg] of Object.entries(svgs)) {
  writeFileSync(`${BRAND}/${name}`, svg.trim() + "\n");
}

// ── rasterize PNGs ───────────────────────────────────────────────────────────
function png(svg, width, out, background) {
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background, // undefined = transparent
    font: { loadSystemFonts: true },
  });
  writeFileSync(out, r.render().asPng());
}

for (const s of [48, 96, 192, 512, 1024]) png(appIcon, s, `${EXPORTS}/nali-app-icon-${s}x${s}.png`);
png(mark(NAVY), 1920, `${EXPORTS}/nali-mark-1920x1920.png`, "#FFFFFF");
png(mark(INK), 1920, `${EXPORTS}/nali-mark-mono-1920x1920.png`, "#FFFFFF");
png(mark(NAVY), 1920, `${EXPORTS}/nali-mark-transparent-1920.png`);
png(lockup(NAVY, "#FFFFFF"), 2880, `${EXPORTS}/nali-lockup-2880x640.png`, "#FFFFFF");
png(lockup(WHITE, NAVY), 2880, `${EXPORTS}/nali-lockup-mono-2880x640.png`);
png(wordmark(NAVY, "NATURE LIFE INTELLIGENCE"), 2560, `${EXPORTS}/nali-wordmark-2560x800.png`, "#FFFFFF");
png(og, 1200, `${BRAND}/og-default.png`);

console.log("brand kit rebuilt:", Object.keys(svgs).length, "svgs +", "png exports + og-default.png");
