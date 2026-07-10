// fct engine renderer — render one slug's 24 frames to disk. Driven by fct.gen (env vars).
// Format is chosen by FCT_EXT (jpg|png) + FCT_QUALITY; canvas encodes both.
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
import path from 'node:path';

function loadPNG(p: string) {
  const png = PNG.sync.read(fs.readFileSync(p));
  return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}
function saveFrame(img: any, p: string, ext: string, quality: number) {
  if (ext === 'png') {
    const png = new PNG({ width: img.width, height: img.height });
    png.data = Buffer.from(img.data.buffer, img.data.byteOffset, img.data.byteLength);
    fs.writeFileSync(p, PNG.sync.write(png));
    return;
  }
  // jpg: draw the RGBA buffer onto a canvas and encode as JPEG q=quality/100.
  const cv = createCanvas(img.width, img.height);
  const ctx = cv.getContext('2d');
  const id = ctx.createImageData(img.width, img.height);
  id.data.set(img.data);
  ctx.putImageData(id, 0, 0);
  fs.writeFileSync(p, cv.toBuffer('image/jpeg', { quality: quality / 100 }));
}

const map = JSON.parse(fs.readFileSync(process.env.FCT_SLUGMAP || path.resolve('../fct/slug_map.json'), 'utf-8'));
const imgA = loadPNG(path.resolve('test/start.png')), imgB = loadPNG(path.resolve('test/end.png'));
const slug = process.env.FCT_SLUG!, outDir = process.env.FCT_OUT!, N = parseInt(process.env.FCT_N || '24');
const ext = (process.env.FCT_EXT || 'jpg').toLowerCase(), quality = parseInt(process.env.FCT_QUALITY || '90');
const motr = map[slug];
if (!motr) { console.error('no motr for ' + slug); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const tr = createBenchTransition(motr, { outputWidth: 1920, outputHeight: 1080 });
for (let i = 0; i < N; i++) {
  const r = tr.render(imgA, imgB, i / N);
  saveFrame(r, path.join(outDir, `frame_${String(i).padStart(4, '0')}.${ext}`), ext, quality);
}
console.error('OK ' + slug);
