import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('public/favicon.svg');

// Generate icon.png (192x192)
await sharp(svgBuffer)
  .resize(192, 192)
  .png()
  .toFile('src/app/icon.png');
console.log('✓ Generated src/app/icon.png (192x192)');

// Generate apple-icon.png (180x180)
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile('src/app/apple-icon.png');
console.log('✓ Generated src/app/apple-icon.png (180x180)');

// Generate icon-512.png (512x512)
await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png');
console.log('✓ Generated public/icon-512.png (512x512)');

// Generate sizes for favicon.ico
await sharp(svgBuffer)
  .resize(16, 16)
  .png()
  .toFile('/tmp/icon-16.png');
console.log('✓ Generated /tmp/icon-16.png (16x16)');

await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile('/tmp/icon-32.png');
console.log('✓ Generated /tmp/icon-32.png (32x32)');

await sharp(svgBuffer)
  .resize(48, 48)
  .png()
  .toFile('/tmp/icon-48.png');
console.log('✓ Generated /tmp/icon-48.png (48x48)');

console.log('\n✓ All PNG icons generated successfully!');
console.log('\nNext step: Combine /tmp/icon-*.png into src/app/favicon.ico');
console.log('You can use an online tool like https://convertico.com or favicon.io');
