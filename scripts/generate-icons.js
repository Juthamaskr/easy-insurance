/**
 * PWA Icon Generator Script
 *
 * This script generates PWA icons from the base SVG icon.
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Alternative: Use online tools like:
 *   - https://realfavicongenerator.net/
 *   - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Run: npm install sharp');
  console.log('');
  console.log('Or use these online alternatives:');
  console.log('1. https://realfavicongenerator.net/');
  console.log('2. https://www.pwabuilder.com/imageGenerator');
  console.log('');
  console.log('Upload public/icons/icon.svg to generate all icon sizes.');
  process.exit(0);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputFile);

    console.log(`Created: icon-${size}x${size}.png`);
  }

  // Generate favicon
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, '../favicon.png'));

  console.log('Created: favicon.png');
  console.log('');
  console.log('Done! Icons generated successfully.');
}

generateIcons().catch(console.error);
