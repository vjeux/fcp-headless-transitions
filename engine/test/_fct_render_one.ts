// Render ONE frame of a slug (fast iteration). FCT_SLUG, FCT_FRAME (index), FCT_N (default 24), FCT_OUT (file path).
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs'; import path from 'node:path';
function loadPNG(p: string){ const png=PNG.sync.read(fs.readFileSync(p)); return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height); }
const map = JSON.parse(fs.readFileSync(process.env.FCT_SLUGMAP || path.resolve('../fct/slug_map.json'),'utf-8'));
const imgA = loadPNG(path.resolve('test/start.png')), imgB = loadPNG(path.resolve('test/end.png'));
const slug = process.env.FCT_SLUG!, out = process.env.FCT_OUT!, N = parseInt(process.env.FCT_N||'24'), fi = parseInt(process.env.FCT_FRAME||'12');
const tr = createBenchTransition(map[slug], { outputWidth: 1920, outputHeight: 1080 });
const t0 = Date.now();
const r = tr.render(imgA, imgB, fi / N);
const ms = Date.now() - t0;
const cv = createCanvas(r.width, r.height); const cx = cv.getContext('2d');
const id = cx.createImageData(r.width, r.height); id.data.set(r.data); cx.putImageData(id,0,0);
fs.writeFileSync(out, cv.toBuffer('image/jpeg', { quality: 0.9 }));
console.error(`OK ${slug} f${fi} ${r.width}x${r.height} ${ms}ms -> ${out}`);
