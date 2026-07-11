// Phase-2 filter verification (TS half): apply ONE registered filter to an image and
// write the result, so it can be compared to FCP's headless output on the same input.
// Committed tool (paired with tools/re/filter_verify.py) — NOT a scratch script.
//
// Spec is read from env FCT_FILTER_SPEC (a JSON file):
//   { "uuid": "...", "pluginName": "PAEBrightness",
//     "in": "/abs/in.png", "out": "/abs/out.png", "time": 0.0,
//     "params": [ { "name":"Brightness","id":1,"value":2.0 },
//                 { "name":"Color","id":1,"children":[
//                     {"name":"Red","id":1,"value":1.0}, ... ] } ] }
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js'; // side-effect: register all filter modules
import type { Filter } from '../src/types.js';

function loadImage(p: string) {
  if (p.toLowerCase().endsWith('.png')) {
    const png = PNG.sync.read(fs.readFileSync(p));
    return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
  }
  // jpeg via canvas
  const { loadImage: ci } = require('canvas');
  throw new Error('use PNG input for _filter_apply (got ' + p + ')');
}

const spec = JSON.parse(fs.readFileSync(process.env.FCT_FILTER_SPEC!, 'utf-8'));
const img = loadImage(spec.in);
const filter: Filter = {
  id: 1,
  name: spec.pluginName,
  pluginName: spec.pluginName,
  pluginUUID: spec.uuid,
  parameters: spec.params || [],
};
const mod = lookupFilter(filter);
if (!mod) { console.error('NO FILTER for uuid ' + spec.uuid); process.exit(2); }
const ctx = makeContext(filter, spec.time ?? 0, img.width, img.height);
const out = mod.apply(img, ctx);
const cv = createCanvas(out.width, out.height);
const cx = cv.getContext('2d');
const id = cx.createImageData(out.width, out.height);
id.data.set(out.data);
cx.putImageData(id, 0, 0);
fs.writeFileSync(spec.out, cv.toBuffer('image/png'));
console.error(`OK ${spec.pluginName} ${out.width}x${out.height} -> ${spec.out}`);
