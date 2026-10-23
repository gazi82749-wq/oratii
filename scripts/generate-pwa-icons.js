const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const buffer = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    buffer[offset++] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[offset++] = r;
      buffer[offset++] = g;
      buffer[offset++] = b;
      buffer[offset++] = a;
    }
  }

  const idatRaw = zlib.deflateSync(buffer);
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // 8 bits per channel
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatRaw);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += img.buffer.length;
    entries.push(entry);
  }

  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

// Distance from point (px, py) to rounded rectangle centered at (cx, cy) with half-width hw, half-height hh, and corner radius r
function distToRoundRect(px, py, cx, cy, hw, hh, r) {
  const dx = Math.abs(px - cx) - (hw - r);
  const dy = Math.abs(py - cy) - (hh - r);
  const outsideDist = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  const insideDist = Math.min(Math.max(dx, dy), 0);
  return outsideDist + insideDist - r;
}

// Check if point is inside speech bubble tail triangle: (-0.32, 0.28) -> (-0.32, 0.46) -> (-0.12, 0.30)
function insideTail(x, y) {
  if (x < -0.34 || x > -0.10 || y < 0.26 || y > 0.48) return false;
  // Barycentric or edge function for triangle A(-0.32, 0.28), B(-0.32, 0.46), C(-0.12, 0.30)
  const d1 = (x - -0.32) * (0.30 - 0.46) - (y - 0.46) * (-0.12 - -0.32);
  const d2 = (x - -0.12) * (0.28 - 0.30) - (y - 0.30) * (-0.32 - -0.12);
  const d3 = (x - -0.32) * (0.46 - 0.28) - (y - 0.28) * (-0.32 - -0.32);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

function drawOratiiIcon(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / width;  // -0.5 to 0.5
  const ny = (y - cy) / height; // -0.5 to 0.5

  const bgNavy = [21, 25, 48, 255];     // #151930
  const goldBorder = [242, 169, 59, 255]; // #F2A93B

  const badgeDist = distToRoundRect(nx, ny, 0.01, -0.04, 0.44, 0.40, 0.16);
  const inBadge = badgeDist <= 0;
  const inTail = insideTail(nx, ny);
  const isInsideShape = inBadge || inTail;

  if (!isInsideShape && !isMaskable) {
    return [0, 0, 0, 0]; // Transparent background outside badge!
  }

  // 5 Soundwave bars positioned prominently inside the badge
  const bars = [
    { xCenter: -0.24, yCenter: -0.04, halfH: 0.13, halfW: 0.04 },
    { xCenter: -0.12, yCenter: -0.04, halfH: 0.24, halfW: 0.04 },
    { xCenter:  0.00, yCenter: -0.04, halfH: 0.32, halfW: 0.04 },
    { xCenter:  0.12, yCenter: -0.04, halfH: 0.21, halfW: 0.04 },
    { xCenter:  0.24, yCenter: -0.04, halfH: 0.10, halfW: 0.04 },
  ];

  for (const bar of bars) {
    const barDist = distToRoundRect(nx, ny, bar.xCenter, bar.yCenter, bar.halfW, bar.halfH, bar.halfW);
    if (barDist <= 0) {
      // Vibrant vertical gradient: #F2A93B (gold) to #2FBF9F (emerald)
      const topY = bar.yCenter - bar.halfH;
      const botY = bar.yCenter + bar.halfH;
      const t = Math.max(0, Math.min(1, (ny - topY) / (botY - topY)));
      const r = Math.round(242 * (1 - t) + 47 * t);
      const g = Math.round(169 * (1 - t) + 191 * t);
      const b = Math.round(59 * (1 - t) + 159 * t);
      return [r, g, b, 255];
    }
  }

  // Subtle golden border around the badge for crisp contrast on dark and light surfaces
  if (inBadge && badgeDist >= -0.02) {
    return goldBorder;
  }

  return bgNavy;
}

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

console.log('Generating crisp favicon icons (16x16, 32x32, 48x48)...');
const png16 = createPng(16, 16, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
const png32 = createPng(32, 32, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
const png48 = createPng(48, 48, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));

console.log('Creating multi-resolution favicon.ico...');
const ico = createIco([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
fs.writeFileSync(path.join(appDir, 'favicon.ico'), ico);

console.log('Generating 192x192 icon...');
const png192 = createPng(192, 192, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(appDir, 'icon.png'), png192);

console.log('Generating 512x512 icon...');
const png512 = createPng(512, 512, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

console.log('Generating 512x512 maskable icon...');
const pngMaskable = createPng(512, 512, (x, y, w, h) => drawOratiiIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable.png'), pngMaskable);

console.log('Generating 180x180 Apple Touch Icon...');
const pngApple = createPng(180, 180, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), pngApple);

console.log('Successfully generated all PWA & Favicon assets with transparent background and vivid brand soundwaves!');
