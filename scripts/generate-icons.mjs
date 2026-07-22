// One-off script that generates simple solid-colour PWA icons (no external
// image deps needed). Re-run with `node scripts/generate-icons.mjs` if you
// want to change the icon colour later.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import path from "node:path";

const ICON_COLOR = { r: 0x4f, g: 0x46, b: 0xe5 }; // indigo-600
const OUT_DIR = path.join(process.cwd(), "public", "icons");
const SIZES = [192, 512, 180];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** Draws a solid square with a lighter rounded "checkmark-ish" corner mark,
 * kept intentionally simple - this is a placeholder icon, not final branding. */
function buildSolidSquarePng(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const margin = Math.round(size * 0.18);

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const idx = rowStart + 1 + x * 4;
      const insideMark =
        x > margin && x < size - margin && y > size - margin * 1.6 && y < size - margin * 0.9;
      if (insideMark) {
        raw[idx] = 0xff;
        raw[idx + 1] = 0xff;
        raw[idx + 2] = 0xff;
        raw[idx + 3] = 0x35;
      } else {
        raw[idx] = ICON_COLOR.r;
        raw[idx + 1] = ICON_COLOR.g;
        raw[idx + 2] = ICON_COLOR.b;
        raw[idx + 3] = 0xff;
      }
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const png = buildSolidSquarePng(size);
  writeFileSync(path.join(OUT_DIR, `icon-${size}.png`), png);
  console.log(`Wrote public/icons/icon-${size}.png (${png.length} bytes)`);
}
