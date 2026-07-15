// Render ONE frame of an ARBITRARY .motr through the full TS engine pipeline
// (parse -> evaluate -> composite). Unlike _fct_render_one.ts (which looks a slug up
// in slug_map.json), this takes a direct .motr PATH, so it can render the synthetic
// single-primitive scenes the capability catalog builds (tools/re/probe_scene.py).
// Committed tool paired with tools/re/probe_scene.py — NOT a scratch script.
//
//   FCT_MOTR  = absolute path to the .motr to render
//   FCT_TIME  = scene time in SECONDS (default 0)
//   FCT_OUT   = output PNG path
//   FCT_INA / FCT_INB = optional Transition A / B source images (default test/start|end.png)
//   FCT_W / FCT_H = output size (default 1920x1080)
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

const motr = process.env.FCT_MOTR!;
const out = process.env.FCT_OUT!;
const tsec = parseFloat(process.env.FCT_TIME || '0');
const W = parseInt(process.env.FCT_W || '1920'), H = parseInt(process.env.FCT_H || '1080');
const inA = process.env.FCT_INA || path.resolve('test/start.png');
const inB = process.env.FCT_INB || path.resolve('test/end.png');
if (!motr || !fs.existsSync(motr)) { console.error('no .motr at FCT_MOTR=' + motr); process.exit(1); }

const imgA = loadPNG(inA), imgB = loadPNG(inB);
const tr = createBenchTransition(motr, { outputWidth: W, outputHeight: H });
const r = tr.renderAt(imgA, imgB, tsec);
const cv = createCanvas(r.width, r.height);
const cx = cv.getContext('2d');
const id = cx.createImageData(r.width, r.height);
id.data.set(r.data);
cx.putImageData(id, 0, 0);
fs.writeFileSync(out, cv.toBuffer('image/png'));
console.error(`OK scene ${r.width}x${r.height} t=${tsec}s -> ${out}`);
