const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if sharp is available, if not install it temporarily
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp for SVG→PNG conversion...');
  execSync('npm install --no-save sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

const BRAND_DIR = path.join(__dirname, '..', 'public', 'brand');
const OUT_DIR = path.join(BRAND_DIR, 'png-exports');

const exports_config = [
  { svg: 'nali-mark.svg',         png: 'nali-mark-1920x1920.png',         w: 1920, h: 1920, bg: '#000000' },
  { svg: 'nali-wordmark.svg',     png: 'nali-wordmark-2560x800.png',      w: 2560, h: 800,  bg: '#000000' },
  { svg: 'nali-lockup.svg',       png: 'nali-lockup-2880x640.png',        w: 2880, h: 640,  bg: '#000000' },
  { svg: 'nali-app-icon.svg',     png: 'nali-app-icon-1024x1024.png',     w: 1024, h: 1024, bg: '#07090e' },
  { svg: 'nali-mark-mono.svg',    png: 'nali-mark-mono-1920x1920.png',    w: 1920, h: 1920, bg: '#000000' },
  { svg: 'nali-lockup-mono.svg',  png: 'nali-lockup-mono-2880x640.png',   w: 2880, h: 640,  bg: '#000000' },
  // Transparent versions
  { svg: 'nali-mark.svg',         png: 'nali-mark-transparent-1920.png',  w: 1920, h: 1920, bg: null },
  { svg: 'nali-app-icon.svg',     png: 'nali-app-icon-512x512.png',       w: 512,  h: 512,  bg: null },
  { svg: 'nali-app-icon.svg',     png: 'nali-app-icon-192x192.png',       w: 192,  h: 192,  bg: null },
  { svg: 'nali-app-icon.svg',     png: 'nali-app-icon-96x96.png',         w: 96,   h: 96,   bg: null },
  { svg: 'nali-app-icon.svg',     png: 'nali-app-icon-48x48.png',         w: 48,   h: 48,   bg: null },
];

async function run() {
  console.log(`\nExporting ${exports_config.length} PNG files to:\n${OUT_DIR}\n`);

  for (const cfg of exports_config) {
    const svgPath = path.join(BRAND_DIR, cfg.svg);
    const outPath = path.join(OUT_DIR, cfg.png);

    try {
      let pipeline = sharp(svgPath, { density: 300 })
        .resize(cfg.w, cfg.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

      if (cfg.bg) {
        pipeline = pipeline.flatten({ background: cfg.bg });
      }

      await pipeline.png({ quality: 100 }).toFile(outPath);
      console.log(`  ✓ ${cfg.png} (${cfg.w}x${cfg.h})`);
    } catch (err) {
      console.error(`  ✗ ${cfg.png}: ${err.message}`);
    }
  }

  console.log(`\nDone! All PNGs saved to: ${OUT_DIR}\n`);
}

run().catch(console.error);
