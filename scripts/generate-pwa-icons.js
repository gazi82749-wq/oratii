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

// Oratii brand colors:
// Background Navy: #1B2140 -> R:27, G:33, B:64
// Bar Gradient: #F2A93B (242, 169, 59) to #2FBF9F (47, 191, 159)

function drawOratiiIcon(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / width;  // -0.5 to 0.5
  const ny = (y - cy) / height; // -0.5 to 0.5

  // Maskable uses full bleed background, standard uses rounded sqircle
  if (!isMaskable) {
    // Rounded corner check (radius ~ 22% of dimension)
    const padding = 0.05;
    if (Math.abs(nx) > 0.45 || Math.abs(ny) > 0.45) {
      // Corners
      const cornerR = 0.12;
      const cornerCx = 0.45 - cornerR;
      const cornerCy = 0.45 - cornerR;
      if (Math.abs(nx) > cornerCx && Math.abs(ny) > cornerCy) {
        const dx = Math.abs(nx) - cornerCx;
        const dy = Math.abs(ny) - cornerCy;
        if (dx * dx + dy * dy > cornerR * cornerR) {
          return [0, 0, 0, 0]; // Transparent outside
        }
      }
    }
  }

  // Navy background color (#1B2140)
  let bgR = 27, bgG = 33, bgB = 64, bgA = 255;

  // 5 Soundwave Bars in center
  // Bar definitions relative to center: { xCenter, yMin, yMax, width }
  const bars = [
    { xCenter: -0.22, yMin: -0.05, yMax: 0.22, w: 0.07 },
    { xCenter: -0.11, yMin: -0.18, yMax: 0.28, w: 0.07 },
    { xCenter: 0.00,  yMin: -0.28, yMax: 0.32, w: 0.07 },
    { xCenter: 0.11,  yMin: -0.14, yMax: 0.24, w: 0.07 },
    { xCenter: 0.22,  yMin: -0.02, yMax: 0.18, w: 0.07 },
  ];

  for (const bar of bars) {
    const halfW = bar.w / 2;
    if (nx >= bar.xCenter - halfW && nx <= bar.xCenter + halfW) {
      if (ny >= bar.yMin && ny <= bar.yMax) {
        // Gradient from top (#F2A93B) to bottom (#2FBF9F)
        const t = (ny - bar.yMin) / (bar.yMax - bar.yMin);
        const r = Math.round(242 * (1 - t) + 47 * t);
        const g = Math.round(169 * (1 - t) + 191 * t);
        const b = Math.round(59 * (1 - t) + 159 * t);
        return [r, g, b, 255];
      }
    }
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generating 192x192 icon...');
const png192 = createPng(192, 192, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

console.log('Generating 512x512 icon...');
const png512 = createPng(512, 512, (x, y, w, h) => drawOratiiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

console.log('Generating 512x512 maskable icon...');
const pngMaskable = createPng(512, 512, (x, y, w, h) => drawOratiiIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable.png'), pngMaskable);

console.log('Generating 180x180 Apple Touch Icon...');
const pngApple = createPng(180, 180, (x, y, w, h) => drawOratiiIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

console.log('Successfully generated all PWA icons!');
