const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Dynamically check and install dependencies if missing
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp for image rendering...');
  execSync('npm install --no-save sharp', { stdio: 'inherit' });
}

try {
  require.resolve('png-to-ico');
} catch (e) {
  console.log('Installing png-to-ico for real ICO container generation...');
  execSync('npm install --no-save png-to-ico', { stdio: 'inherit' });
}

const sharp = require('sharp');
const pngToIcoModule = require('png-to-ico');
const pngToIco = typeof pngToIcoModule === 'function' ? pngToIcoModule : (pngToIcoModule.default || pngToIcoModule.imagesToIco);

const SVG_PATH = path.join(__dirname, '..', 'public', 'icon.svg');
const FAVICON_PATH = path.join(__dirname, '..', 'public', 'favicon.ico');
const APPLE_ICON_PATH = path.join(__dirname, '..', 'public', 'apple-icon.png');
const PNG_192_PATH = path.join(__dirname, '..', 'public', 'brand', 'png-exports', 'nali-app-icon-192x192.png');
const PNG_512_PATH = path.join(__dirname, '..', 'public', 'brand', 'png-exports', 'nali-app-icon-512x512.png');

async function generate() {
  console.log('Generating favicon and touch icons from:', SVG_PATH);

  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Source SVG not found at ${SVG_PATH}`);
  }

  const svgContent = fs.readFileSync(SVG_PATH);

  // 1. Generate real favicon.ico (ICO format, containing 16x16 and 32x32 images)
  console.log('Rendering intermediate PNGs for ICO...');
  const png16 = await sharp(svgContent).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgContent).resize(32, 32).png().toBuffer();
  
  console.log('Converting to real multi-resolution ICO file...');
  const icoBuffer = await pngToIco([png16, png32]);
  fs.writeFileSync(FAVICON_PATH, icoBuffer);
  console.log('  ✓ Saved real ICO file to:', FAVICON_PATH);

  // 2. Generate apple-icon.png (180x180)
  console.log('Rendering apple-touch-icon (180x180)...');
  await sharp(svgContent)
    .resize(180, 180)
    .png()
    .toFile(APPLE_ICON_PATH);
  console.log('  ✓ Saved Apple Touch Icon to:', APPLE_ICON_PATH);

  // 3. Generate nali-app-icon-192x192.png
  console.log('Rendering app icon 192x192...');
  await sharp(svgContent)
    .resize(192, 192)
    .png()
    .toFile(PNG_192_PATH);
  console.log('  ✓ Saved PWA App Icon 192x192 to:', PNG_192_PATH);

  // 4. Generate nali-app-icon-512x512.png
  console.log('Rendering app icon 512x512...');
  await sharp(svgContent)
    .resize(512, 512)
    .png()
    .toFile(PNG_512_PATH);
  console.log('  ✓ Saved PWA App Icon 512x512 to:', PNG_512_PATH);

  console.log('\nFavicon and app icon generation completed successfully!');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
