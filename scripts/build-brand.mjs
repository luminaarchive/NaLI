// Processes the exact original NaLI artwork (brand-source/*.png, navy-background
// 8000x8000 masters) into the web brand kit in public/brand.
// Keys out the uniform navy background so the emblem adapts to light/dark, then
// derives favicon, OG image, app icons, marks, lockup + wordmark exports.
// Run: node scripts/build-brand.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "brand-source";
const OUT = "public/brand";
const EXPORTS = `${OUT}/png-exports`;
const NAVY = { r: 14, g: 58, b: 92 };
const NAVY_BG = { ...NAVY, alpha: 1 };
const L_NAVY = 0.299 * NAVY.r + 0.587 * NAVY.g + 0.114 * NAVY.b;

mkdirSync(EXPORTS, { recursive: true });

// Key the navy background to transparent, recolour the white art to `fill`.
// Alpha is derived from luminance (navy -> 0, white -> 1) for smooth edges.
async function keyed(srcPath, fill) {
  const { data, info } = await sharp(srcPath)
    .resize({ width: 1800, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels], g = data[i * channels + 1], b = data[i * channels + 2];
    const L = 0.299 * r + 0.587 * g + 0.114 * b;
    const a = Math.max(0, Math.min(1, (L - L_NAVY) / (255 - L_NAVY)));
    out[i * 4] = fill.r; out[i * 4 + 1] = fill.g; out[i * 4 + 2] = fill.b;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).png().trim({ threshold: 6 });
}

// Centre `inputBuf` on a navy canvas of WxH.
function onNavy(inputBuf, w, h) {
  return sharp({ create: { width: w, height: h, channels: 4, background: NAVY_BG } })
    .composite([{ input: inputBuf, gravity: "center" }])
    .png();
}

async function run() {
  const emblem = `${SRC}/nali-emblem-source.png`;
  const lockup = `${SRC}/nali-lockup-source.png`;
  const wordmark = `${SRC}/nali-wordmark-source.png`;

  // 1) adaptive emblem (transparent), navy for light surfaces + white for dark
  const navyMark = await keyed(emblem, NAVY);
  const whiteMark = await keyed(emblem, { r: 255, g: 255, b: 255 });
  await navyMark.clone().resize({ height: 720 }).toFile(`${OUT}/nali-emblem-navy.png`);
  await whiteMark.clone().resize({ height: 720 }).toFile(`${OUT}/nali-emblem-white.png`);

  // 2) favicon + app icons (navy tile = original square, no keying needed)
  for (const s of [48, 96, 192, 512, 1024]) {
    await sharp(emblem).resize(s, s, { fit: "cover" }).png().toFile(`${EXPORTS}/nali-app-icon-${s}x${s}.png`);
  }
  await sharp(emblem).resize(256, 256, { fit: "cover" }).png().toFile("app/icon.png");

  // keyed (transparent) lockup + wordmark so they composite seamlessly on navy
  const whiteLock = await keyed(lockup, { r: 255, g: 255, b: 255 });
  const whiteWord = await keyed(wordmark, { r: 255, g: 255, b: 255 });

  // 3) OG image: keyed lockup centred on 1200x630 navy
  const ogLock = await whiteLock.clone().resize({ width: 980, height: 500, fit: "inside" }).toBuffer();
  await onNavy(ogLock, 1200, 630).toFile(`${OUT}/og-default.png`);

  // 4) mark exports
  await sharp(emblem).resize(1920, 1920, { fit: "cover" }).png().toFile(`${EXPORTS}/nali-mark-1920x1920.png`);
  await navyMark.clone().resize({ height: 1920 }).toFile(`${EXPORTS}/nali-mark-mono-1920x1920.png`);
  await whiteMark.clone().resize({ height: 1920 }).toFile(`${EXPORTS}/nali-mark-transparent-1920.png`);

  // 5) lockup + wordmark exports (keyed art centred on navy)
  const lockExp = await whiteLock.clone().resize({ width: 1000, height: 560, fit: "inside" }).toBuffer();
  await onNavy(lockExp, 2880, 640).toFile(`${EXPORTS}/nali-lockup-2880x640.png`);
  await onNavy(lockExp, 2880, 640).toFile(`${EXPORTS}/nali-lockup-mono-2880x640.png`);
  const word = await whiteWord.clone().resize({ width: 1900, height: 620, fit: "inside" }).toBuffer();
  await onNavy(word, 2560, 800).toFile(`${EXPORTS}/nali-wordmark-2560x800.png`);

  console.log("brand kit built from original artwork:");
  for (const f of ["nali-emblem-navy.png", "nali-emblem-white.png", "og-default.png"]) {
    const m = await sharp(`${OUT}/${f}`).metadata();
    console.log(`  ${f}: ${m.width}x${m.height}`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
