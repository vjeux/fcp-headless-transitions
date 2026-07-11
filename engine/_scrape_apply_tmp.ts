if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
import { lookupFilter, makeContext } from './src/compositor/filters/registry.js';
import './src/compositor/filters/scrape.js';
import type { Filter } from './src/types.js';
const spec = JSON.parse(fs.readFileSync(process.env.FCT_FILTER_SPEC!, 'utf-8'));
const png = PNG.sync.read(fs.readFileSync(spec.in));
const img = new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
const filter: Filter = { id:1, name:spec.pluginName, pluginName:spec.pluginName, pluginUUID:spec.uuid, parameters: spec.params||[] };
const mod = lookupFilter(filter);
if (!mod) { console.error('NO FILTER'); process.exit(2); }
const ctx = makeContext(filter, spec.time ?? 0, img.width, img.height);
const out = mod.apply(img, ctx);
const cv = createCanvas(out.width, out.height);
const c = cv.getContext('2d');
const id = c.createImageData(out.width, out.height);
id.data.set(out.data); c.putImageData(id,0,0);
fs.writeFileSync(spec.out, cv.toBuffer('image/png'));
console.error('OK');
