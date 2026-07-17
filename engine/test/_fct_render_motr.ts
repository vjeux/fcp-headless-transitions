// Render ONE frame of an ARBITRARY .motr path (for the faithful fuzz oracle).
// Env: FCT_RENDER_MOTR (path), FCT_RENDER_A, FCT_RENDER_B (png paths),
//      FCT_RENDER_T (progress 0..1), FCT_RENDER_OUT (out path).
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
function loadPNG(p: string){ const png=PNG.sync.read(fs.readFileSync(p)); return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height); }
const motr = process.env.FCT_RENDER_MOTR!, out = process.env.FCT_RENDER_OUT!;
// A/B default to the PNG test images (pngjs can't read JPEG). The oracle renders the
// same source images as JPEG; they are the identical picture (verified meanAbsDiff<0.3),
// so engine-vs-oracle PSNR is apples-to-apples.
import path from 'node:path';
const imgA = loadPNG(process.env.FCT_RENDER_A_PNG || path.resolve('test/start.png'));
const imgB = loadPNG(process.env.FCT_RENDER_B_PNG || path.resolve('test/end.png'));
const t = parseFloat(process.env.FCT_RENDER_T || '0.5');
const tr = createBenchTransition(motr, { outputWidth: 1920, outputHeight: 1080 });
const r = tr.render(imgA, imgB, t);
const cv = createCanvas(r.width, r.height); const cx = cv.getContext('2d');
const id = cx.createImageData(r.width, r.height); id.data.set(r.data); cx.putImageData(id,0,0);
fs.writeFileSync(out, cv.toBuffer('image/png'));
console.error(`OK motr t=${t} ${r.width}x${r.height} -> ${out}`);
