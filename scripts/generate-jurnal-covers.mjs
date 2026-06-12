#!/usr/bin/env node
/**
 * Generates topic-specific, non-AI explanatory cover visuals (SVG) for every
 * Jurnal entry. Each cover is a distinct schematic in NaLI's visual language:
 * species range maps, volcano profiles, caldera cross-sections, crater-lake
 * variants, reef zones, mangrove coast, forest-loss timelines, and so on. These
 * are explanatory diagrams, not photographs, and are labelled as such.
 *
 * Output: public/images/jurnal-covers/<slug>.svg
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "images", "jurnal-covers");
fs.mkdirSync(OUT, { recursive: true });

// NaLI palette
const BG = "#f7fbf8";
const PAPER = "#ffffff";
const INK = "#0f5e4b";
const WASH = "#eaf8f3";
const TEAL = "#2dd4a7";
const CHAR = "#1c1c1c";
const GRAY = "#4f5b57";
const SEA = "#cfeee6";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SERIF = "Georgia, serif";

const W = 1200;
const H = 675;

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(title, scene, accent = INK) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.6" stroke-dasharray="12 10"/>
  <text x="70" y="96" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="4" fill="${INK}">JURNAL NaLI, VISUAL PENJELAS</text>
  <text x="70" y="150" font-family="${SERIF}" font-size="34" font-weight="700" fill="${CHAR}">${esc(title)}</text>
  <g>${scene}</g>
  <line x1="70" y1="600" x2="${W - 70}" y2="600" stroke="${INK}" stroke-opacity="0.32" stroke-dasharray="7 8"/>
  <text x="70" y="628" font-family="${MONO}" font-size="14" fill="${GRAY}">VISUAL PENJELAS, BUKAN FOTO LAPANGAN. NaLI by NatIve, non-AI, berdasarkan sumber yang dicantumkan.</text>
</svg>`;
}

/* ---- shared bits ---- */

function chip(x, y, label, fill = WASH) {
  const w = 16 + label.length * 9.6;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="30" fill="${fill}" stroke="${INK}" stroke-opacity="0.55" stroke-dasharray="6 6"/><text x="${x + 10}" y="${y + 20}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1" fill="${INK}">${esc(label)}</text></g>`;
}

// Simplified Indonesia archipelago inside the schematic box, with highlights.
function indonesia(highlights = []) {
  const has = (k) => highlights.includes(k);
  const hl = (k) => (has(k) ? TEAL : WASH);
  const st = (k) => (has(k) ? INK : INK);
  const op = (k) => (has(k) ? "0.9" : "0.5");
  const islands = [
    // key, points (roughly placed in 70..1130 x 210..560)
    ["sumatra", "150,300 250,250 360,360 320,430 230,420 170,360", ],
    ["java", "300,470 470,460 600,478 470,500 330,498", ],
    ["kalimantan", "390,250 540,235 600,330 510,380 410,350", ],
    ["sulawesi", "650,270 700,250 690,330 730,360 700,420 668,360 640,400 660,330", ],
    ["maluku", "790,300 825,295 820,335 786,338", ],
    ["papua", "880,280 1080,260 1090,370 980,400 880,360", ],
    ["nusra", "640,500 760,492 900,505 760,524", ],
  ];
  let s = `<rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.35"/>`;
  for (const [k, pts] of islands) {
    s += `<polygon points="${pts}" fill="${hl(k)}" stroke="${st(k)}" stroke-opacity="${op(k)}" stroke-width="1.5"/>`;
  }
  return s;
}

const REGION_MAP = {
  Sumatra: "sumatra",
  "Sumatra Utara": "sumatra",
  "Batang Toru": "sumatra",
  Jawa: "java",
  Java: "java",
  Banten: "java",
  "Ujung Kulon": "java",
  Yogyakarta: "java",
  Kalimantan: "kalimantan",
  Sulawesi: "sulawesi",
  Maluku: "maluku",
  "Maluku Utara": "maluku",
  Buru: "maluku",
  Papua: "papua",
  "Nusa Tenggara Timur": "nusra",
  Komodo: "nusra",
  Rinca: "nusra",
  Flores: "nusra",
  Lombok: "nusra",
};

function regionsToKeys(geos) {
  const set = new Set();
  for (const g of geos) {
    for (const [name, key] of Object.entries(REGION_MAP)) {
      if (g.includes(name)) set.add(key);
    }
  }
  return [...set];
}

// taxon glyphs (very simplified emblematic silhouettes)
function glyph(kind, cx, cy, color = INK) {
  const g = {
    reptile: `<path d="M${cx - 60} ${cy} q20 -22 50 -10 q14 -26 40 -12 q26 -10 44 8 q-18 14 -44 8 q-18 22 -42 8 q-26 14 -48 -10z" fill="${color}"/><path d="M${cx + 64} ${cy - 4} q26 -6 44 10 q-22 6 -44 -2z" fill="${color}"/>`,
    rhino: `<path d="M${cx - 64} ${cy + 14} q-4 -34 26 -38 q6 -22 30 -14 l8 -16 l6 18 q34 0 40 30 q10 4 8 24 l-14 -2 l-6 12 l-8 -12 l-44 0 l-8 12 l-8 -12 q-24 -2 -26 -22z" fill="${color}"/>`,
    mammal: `<path d="M${cx - 58} ${cy + 16} q-2 -30 24 -34 q4 -18 24 -14 q6 -14 18 -6 q14 -4 16 10 q22 4 22 28 l0 12 l-10 0 l0 -10 l-66 0 l0 10 l-10 0 q-22 0 -22 -16z" fill="${color}"/>`,
    primate: `<circle cx="${cx}" cy="${cy - 6}" r="30" fill="${color}"/><circle cx="${cx - 10}" cy="${cy - 10}" r="6" fill="${PAPER}"/><circle cx="${cx + 10}" cy="${cy - 10}" r="6" fill="${PAPER}"/><path d="M${cx - 34} ${cy + 18} q34 26 68 0 l0 26 q-34 18 -68 0z" fill="${color}"/>`,
    bird: `<path d="M${cx - 50} ${cy + 18} q10 -40 50 -44 q4 -16 18 -16 q-2 14 -8 18 q26 8 30 40 q-18 -14 -34 -12 q-30 6 -36 30 q-12 -6 -12 -16z" fill="${color}"/><path d="M${cx + 36} ${cy + 24} q34 6 60 26 q-30 4 -58 -8z" fill="${color}"/>`,
    fish: `<path d="M${cx - 64} ${cy} q34 -34 84 -22 q24 -16 40 -12 q-8 16 -16 18 q12 12 8 30 q-18 -10 -34 -12 q-46 12 -82 -2z" fill="${color}"/><circle cx="${cx - 40}" cy="${cy - 4}" r="4" fill="${PAPER}"/>`,
    cat: `<path d="M${cx - 54} ${cy + 16} q-2 -26 18 -32 l-8 -16 l16 8 l8 -6 l8 6 l16 -8 l-8 16 q22 6 22 32 l0 8 l-10 0 l0 -8 l-62 0 l0 8 l-10 0z" fill="${color}"/>`,
  };
  return g[kind] ?? g.mammal;
}

/* ---- scene templates ---- */

function speciesRange({ name, taxon, status, geos }) {
  const keys = regionsToKeys(geos);
  return `
  ${indonesia(keys)}
  ${chip(70, 176, status)}
  <g transform="translate(950,250)"><rect x="-70" y="-60" width="150" height="150" fill="${WASH}" fill-opacity="0.6" stroke="${INK}" stroke-opacity="0.5" stroke-dasharray="6 6"/>${glyph(taxon, 5, 10)}<text x="5" y="74" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">${esc(taxon.toUpperCase())}</text></g>
  <text x="70" y="540" font-family="${MONO}" font-size="17" fill="${CHAR}">${esc(name)} . sebaran disorot pada peta Nusantara.</text>`;
}

function volcanoProfile({ hazard, label }) {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.18"/>
  <polygon points="70,560 520,250 760,560" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <polygon points="430,330 520,250 610,330 560,360 480,360" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.5"/>
  <path d="M520 250 q-30 -36 8 -64 q34 22 6 64z" fill="${TEAL}" fill-opacity="0.7"/>
  <path d="M540 330 q120 30 230 200" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="9 8"/>
  <polygon points="760,520 800,540 762,556" fill="${INK}"/>
  ${chip(820, 360, hazard)}
  <text x="820" y="430" font-family="${MONO}" font-size="16" fill="${CHAR}">${esc(label)}</text>`;
}

function volcanoClimate({ year }) {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.18"/>
  <circle cx="980" cy="300" r="48" fill="${WASH}" stroke="${INK}" stroke-opacity="0.5"/>
  <text x="980" y="306" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">MATAHARI REDUP</text>
  <polygon points="120,560 360,300 600,560" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <path d="M360 300 q-10 -40 30 -70 q60 -40 120 -20" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8"/>
  <line x1="500" y1="240" x2="1040" y2="270" stroke="${TEAL}" stroke-width="4" stroke-opacity="0.6" stroke-dasharray="3 10"/>
  ${chip(70, 176, year + ", AEROSOL SULFAT")}
  <text x="120" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Letusan tropis besar memantulkan sebagian sinar matahari.</text>`;
}

function caldera({ year, lake }) {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.18"/>
  <path d="M120 380 L320 380 L420 470 L780 470 L880 380 L1080 380 L1080 560 L120 560 Z" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <rect x="420" y="455" width="360" height="60" fill="${SEA}" stroke="${INK}" stroke-opacity="0.4"/>
  <text x="600" y="492" text-anchor="middle" font-family="${MONO}" font-size="15" fill="${INK}">${esc(lake)}</text>
  <text x="230" y="360" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">DINDING KALDERA</text>
  ${chip(70, 176, "KALDERA, " + year)}
  <text x="120" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Cekungan besar sisa letusan, kini berisi danau.</text>`;
}

function craterLakeGas({ variant, label }) {
  let extra = "";
  if (variant === "blue-flame") {
    extra = `<path d="M520 430 q-14 -44 30 -70 q-6 30 18 44 q26 -16 14 -50 q40 30 18 80z" fill="${TEAL}" fill-opacity="0.75"/><text x="560" y="500" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${INK}">API BIRU = GAS BELERANG TERBAKAR</text>`;
  } else if (variant === "co2") {
    extra = `<g opacity="0.7"><circle cx="540" cy="430" r="10" fill="${GRAY}"/><circle cx="565" cy="410" r="8" fill="${GRAY}"/><circle cx="520" cy="408" r="7" fill="${GRAY}"/></g><text x="560" y="500" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${INK}">GAS CO2 BERKUMPUL DI AREA RENDAH</text>`;
  } else {
    extra = `<path d="M620 470 q120 0 150 60" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="8 8"/><text x="560" y="500" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${INK}">TEROWONGAN MENGURANGI AIR DANAU</text>`;
  }
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.18"/>
  <path d="M250 540 Q420 300 600 300 Q780 300 950 540 Z" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <ellipse cx="600" cy="470" rx="150" ry="34" fill="${SEA}" stroke="${INK}" stroke-opacity="0.45"/>
  ${extra}
  ${chip(70, 176, label)}`;
}

function tsunamiFlank() {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.5"/>
  <polygon points="300,560 470,300 640,560" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <polygon points="560,420 640,560 700,470" fill="${TEAL}" fill-opacity="0.5" stroke="${INK}" stroke-opacity="0.5"/>
  <path d="M700 480 q40 -30 80 0 q40 30 80 0 q40 -30 80 0" fill="none" stroke="${INK}" stroke-width="3"/>
  <polygon points="940,470 980,480 942,496" fill="${INK}"/>
  ${chip(70, 176, "TSUNAMI TANPA GEMPA BESAR")}
  <text x="300" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Sisi tubuh gunung runtuh ke laut dan mendorong air.</text>`;
}

function reefZones() {
  return `
  <rect x="70" y="206" width="1060" height="200" fill="${SEA}" fill-opacity="0.5"/>
  <rect x="70" y="406" width="1060" height="160" fill="${WASH}" fill-opacity="0.5"/>
  <line x1="70" y1="406" x2="1130" y2="406" stroke="${INK}" stroke-opacity="0.4" stroke-dasharray="6 6"/>
  <g fill="${TEAL}" fill-opacity="0.8">
    <path d="M200 406 q10 -40 24 0 q10 -30 22 0z"/>
    <path d="M320 406 q8 -50 22 0 q10 -34 20 0z"/>
    <circle cx="460" cy="392" r="16"/>
    <path d="M600 406 q12 -46 26 0z"/>
    <path d="M760 406 q9 -38 20 0 q10 -28 18 0z"/>
    <circle cx="900" cy="394" r="14"/>
  </g>
  ${chip(70, 176, "SEGITIGA TERUMBU KARANG")}
  <text x="90" y="300" font-family="${MONO}" font-size="15" fill="${INK}">PERAIRAN DANGKAL</text>
  <text x="90" y="470" font-family="${MONO}" font-size="15" fill="${GRAY}">DASAR LAUT</text>
  <text x="70" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Keanekaragaman karang tertinggi dunia ada di perairan Indonesia.</text>`;
}

function bleaching() {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.4"/>
  <g><path d="M260 520 q20 -90 60 0 q20 -70 56 0z" fill="${TEAL}" fill-opacity="0.85"/><text x="320" y="552" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${INK}">SEHAT</text></g>
  <g><path d="M620 520 q20 -90 60 0 q20 -70 56 0z" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.5"/><text x="680" y="552" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">MEMUTIH</text></g>
  <rect x="900" y="250" width="40" height="240" fill="${WASH}" stroke="${INK}" stroke-opacity="0.5"/>
  <rect x="900" y="250" width="40" height="90" fill="${TEAL}" fill-opacity="0.8"/>
  <text x="960" y="270" font-family="${MONO}" font-size="14" fill="${INK}">SUHU NAIK</text>
  <text x="960" y="300" font-family="${MONO}" font-size="13" fill="${GRAY}">AMBANG STRES</text>
  ${chip(70, 176, "PEMUTIHAN KARANG")}
  <text x="70" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Karang memutih saat kehilangan alga simbiotik akibat panas.</text>`;
}

function plasticFlow() {
  return `
  <rect x="70" y="206" width="540" height="360" fill="${WASH}" fill-opacity="0.5"/>
  <rect x="610" y="206" width="520" height="360" fill="${SEA}" fill-opacity="0.5"/>
  <text x="120" y="250" font-family="${MONO}" font-size="15" fill="${INK}">DARAT</text>
  <text x="660" y="250" font-family="${MONO}" font-size="15" fill="${INK}">LAUT</text>
  <path d="M180 430 q200 -10 380 30 q140 30 480 10" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8"/>
  <polygon points="1030,470 1070,478 1032,494" fill="${INK}"/>
  <g fill="${GRAY}"><circle cx="300" cy="440" r="8"/><circle cx="520" cy="470" r="8"/><circle cx="760" cy="470" r="8"/><circle cx="940" cy="466" r="8"/></g>
  ${chip(70, 176, "ESTIMASI MODEL, BUKAN TIMBANGAN LANGSUNG")}
  <text x="70" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Sungai membawa sampah dari darat ke laut.</text>`;
}

function mangroveCoast() {
  return `
  <rect x="70" y="206" width="500" height="360" fill="${WASH}" fill-opacity="0.5"/>
  <rect x="570" y="206" width="560" height="360" fill="${SEA}" fill-opacity="0.5"/>
  <line x1="570" y1="206" x2="570" y2="566" stroke="${INK}" stroke-opacity="0.3" stroke-dasharray="6 6"/>
  <g stroke="${INK}" stroke-opacity="0.7" stroke-width="3" fill="none">
    <path d="M560 470 l0 -120 M520 470 q40 -30 40 -120 M600 470 q-40 -30 -40 -120"/>
    <path d="M520 470 q-20 30 -50 40 M560 470 q0 30 0 50 M600 470 q20 30 50 40"/>
    <path d="M650 470 l0 -100 M620 470 q30 -20 30 -100 M680 470 q-30 -20 -30 -100"/>
  </g>
  <ellipse cx="540" cy="350" rx="70" ry="40" fill="${TEAL}" fill-opacity="0.6"/>
  <ellipse cx="660" cy="360" rx="60" ry="34" fill="${TEAL}" fill-opacity="0.6"/>
  <path d="M820 470 l0 -60" stroke="${INK}" stroke-width="3"/><polygon points="812,418 828,418 820,398" fill="${INK}"/>
  <text x="760" y="500" font-family="${MONO}" font-size="14" fill="${INK}">KARBON BIRU DI TANAH</text>
  ${chip(70, 176, "MANGROVE, PESISIR, KARBON")}
  <text x="70" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Akar meredam gelombang; lumpur menyimpan karbon.</text>`;
}

function carbonColumn() {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.15"/>
  <rect x="300" y="240" width="240" height="300" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <rect x="300" y="240" width="240" height="40" fill="${TEAL}" fill-opacity="0.5"/>
  <g stroke="${INK}" stroke-opacity="0.3"><line x1="300" y1="320" x2="540" y2="320"/><line x1="300" y1="400" x2="540" y2="400"/><line x1="300" y1="480" x2="540" y2="480"/></g>
  <text x="420" y="305" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${INK}">VEGETASI</text>
  <text x="420" y="450" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">GAMBUT, KARBON TUA</text>
  <path d="M620 460 l0 -180" stroke="${INK}" stroke-width="3" stroke-dasharray="9 8"/><polygon points="612,290 628,290 620,266" fill="${INK}"/>
  <text x="650" y="360" font-family="${MONO}" font-size="15" fill="${CHAR}">Kering dan terbakar =</text>
  <text x="650" y="386" font-family="${MONO}" font-size="15" fill="${CHAR}">karbon dan kabut asap lepas.</text>
  ${chip(70, 176, "GAMBUT, GUDANG KARBON")}`;
}

function forestTimeline() {
  const years = ["2001", "2006", "2011", "2016", "2021"];
  const heights = [220, 190, 150, 110, 80];
  let bars = "";
  years.forEach((y, i) => {
    const x = 200 + i * 170;
    const h = heights[i];
    bars += `<rect x="${x}" y="${540 - h}" width="90" height="${h}" fill="${i < 2 ? TEAL : WASH}" fill-opacity="0.7" stroke="${INK}" stroke-opacity="0.5"/><text x="${x + 45}" y="562" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${GRAY}">${y}</text>`;
  });
  return `
  <line x1="170" y1="540" x2="1100" y2="540" stroke="${INK}" stroke-opacity="0.5"/>
  ${bars}
  ${chip(70, 176, "TUTUPAN POHON DIPANTAU SATELIT")}
  <text x="70" y="200" font-family="${MONO}" font-size="14" fill="${GRAY}">skema ilustratif arah tren, bukan angka resmi</text>`;
}

function subsidenceBars() {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.25"/>
  <line x1="70" y1="386" x2="1130" y2="386" stroke="${INK}" stroke-opacity="0.5" stroke-dasharray="6 6"/>
  <rect x="320" y="386" width="120" height="150" fill="${WASH}" stroke="${INK}" stroke-opacity="0.6"/>
  <text x="380" y="560" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${GRAY}">TANAH TURUN</text>
  <path d="M380 386 l0 130" stroke="${INK}" stroke-width="3"/><polygon points="372,500 388,500 380,524" fill="${INK}"/>
  <rect x="760" y="330" width="120" height="56" fill="${TEAL}" fill-opacity="0.5" stroke="${INK}" stroke-opacity="0.6"/>
  <text x="820" y="320" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${GRAY}">LAUT NAIK</text>
  <path d="M820 386 l0 -40" stroke="${INK}" stroke-width="3"/><polygon points="812,352 828,352 820,330" fill="${INK}"/>
  ${chip(70, 176, "BANJIR ROB = TURUN + NAIK")}
  <text x="70" y="556" font-family="${MONO}" font-size="15" fill="${CHAR}">Pengambilan air tanah mempercepat penurunan muka tanah.</text>`;
}

function riverProfile() {
  return `
  <rect x="70" y="206" width="1060" height="360" fill="${SEA}" fill-opacity="0.18"/>
  <path d="M120 280 q200 40 360 30 q220 -16 540 60" fill="none" stroke="${INK}" stroke-width="6" stroke-opacity="0.6"/>
  <g fill="${GRAY}">
    <rect x="300" y="330" width="36" height="36"/><rect x="560" y="320" width="36" height="36"/><rect x="820" y="360" width="36" height="36"/>
  </g>
  <text x="300" y="396" font-family="${MONO}" font-size="12" fill="${GRAY}">INDUSTRI</text>
  <text x="560" y="312" font-family="${MONO}" font-size="12" fill="${GRAY}">PERMUKIMAN</text>
  <text x="820" y="416" font-family="${MONO}" font-size="12" fill="${GRAY}">LIMBAH</text>
  ${chip(70, 176, "SUNGAI MENANGGUNG BEBAN PENCEMARAN")}
  <text x="70" y="540" font-family="${MONO}" font-size="16" fill="${CHAR}">Pemulihan sungai adalah tata kelola jangka panjang.</text>`;
}

/* ---- per-slug specs ---- */
const SPECS = {
  "komodo-lima-pulau": ["Komodo dan sebaran pulaunya", () => speciesRange({ name: "Varanus komodoensis", taxon: "reptile", status: "ENDANGERED", geos: ["Komodo", "Rinca", "Flores", "Nusa Tenggara Timur"] })],
  "badak-jawa-satu-benteng": ["Badak Jawa di Ujung Kulon", () => speciesRange({ name: "Rhinoceros sondaicus", taxon: "rhino", status: "CRITICALLY ENDANGERED", geos: ["Ujung Kulon", "Banten", "Jawa"] })],
  "anoa-kerbau-kerdil-sulawesi": ["Anoa, endemik Sulawesi", () => speciesRange({ name: "Anoa", taxon: "mammal", status: "ENDANGERED", geos: ["Sulawesi"] })],
  "babirusa-taring-melengkung": ["Babirusa di Wallacea", () => speciesRange({ name: "Babirusa", taxon: "mammal", status: "VULNERABLE", geos: ["Sulawesi", "Buru", "Maluku"] })],
  "tarsius-primata-malam-mungil": ["Tarsius, primata malam", () => speciesRange({ name: "Tarsius", taxon: "primate", status: "BERVARIASI", geos: ["Sulawesi"] })],
  "maleo-burung-pengubur-telur": ["Maleo, megapoda Sulawesi", () => speciesRange({ name: "Macrocephalon maleo", taxon: "bird", status: "ENDANGERED", geos: ["Sulawesi"] })],
  "coelacanth-sulawesi-fosil-hidup": ["Coelacanth laut dalam", () => speciesRange({ name: "Latimeria menadoensis", taxon: "fish", status: "DATA TERBATAS", geos: ["Sulawesi", "Maluku Utara"] })],
  "orangutan-tapanuli-kera-besar-termuda": ["Orangutan Tapanuli", () => speciesRange({ name: "Pongo tapanuliensis", taxon: "primate", status: "CRITICALLY ENDANGERED", geos: ["Batang Toru", "Sumatra Utara"] })],
  "cenderawasih-bulu-dan-perdagangan": ["Cenderawasih Papua", () => speciesRange({ name: "Cenderawasih", taxon: "bird", status: "BERVARIASI", geos: ["Papua"] })],
  "harimau-jawa-status-punah": ["Harimau Jawa, status punah", () => speciesRange({ name: "Panthera tigris sondaica", taxon: "cat", status: "PUNAH", geos: ["Jawa"] })],

  "tsunami-vulkanik-tanpa-gempa": ["Tsunami vulkanik tanpa gempa", () => tsunamiFlank()],
  "toba-letusan-super": ["Kaldera Toba", () => caldera({ year: "~74.000 TAHUN LALU", lake: "DANAU TOBA" })],
  "tambora-1815-tahun-tanpa-musim-panas": ["Tambora 1815 dan iklim", () => volcanoClimate({ year: "1815" })],
  "merapi-awan-panas": ["Profil bahaya Merapi", () => volcanoProfile({ hazard: "AWAN PANAS", label: "Aliran panas meluncur cepat menuruni lereng." })],
  "kawah-ijen-api-biru": ["Kawah Ijen, api biru", () => craterLakeGas({ variant: "blue-flame", label: "API BIRU = GAS BELERANG" })],
  "dieng-gas-co2-senyap": ["Dieng, gas senyap", () => craterLakeGas({ variant: "co2", label: "GAS VULKANIK TAK TERLIHAT" })],
  "kelud-danau-kawah-direkayasa": ["Kelud, danau kawah", () => craterLakeGas({ variant: "tunnel", label: "DANAU KAWAH DIREKAYASA" })],
  "samalas-1257-letusan-terlupakan": ["Samalas 1257", () => caldera({ year: "1257", lake: "SEGARA ANAK" })],

  "segitiga-terumbu-karang-dunia": ["Segitiga Terumbu Karang", () => reefZones()],
  "pemutihan-karang-dan-suhu-laut": ["Pemutihan karang", () => bleaching()],
  "sampah-plastik-laut-indonesia": ["Plastik dari darat ke laut", () => plasticFlow()],

  "mangrove-karbon-biru": ["Mangrove dan karbon biru", () => mangroveCoast()],

  "gambut-karbon-dan-api": ["Gambut, karbon, dan api", () => carbonColumn()],
  "deforestasi-dipantau-satelit": ["Tutupan pohon dari satelit", () => forestTimeline()],

  "jakarta-penurunan-tanah": ["Jakarta, tanah turun", () => subsidenceBars()],

  "citarum-sungai-dan-pencemaran": ["Citarum, beban pencemaran", () => riverProfile()],
};

let count = 0;
for (const [slug, [title, scene]] of Object.entries(SPECS)) {
  const svg = wrap(title, scene());
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), svg);
  count++;
}
console.log(`Generated ${count} jurnal cover SVGs in public/images/jurnal-covers/`);
