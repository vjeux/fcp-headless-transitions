// Trace the particle-field texture proxy: timing window (pin/pout), texture mean
// colour, and the ancestor TintFx. Anchors T-B3 calibration against GUI GT.
// Usage: FCT_SLUG=Wipes__Diagonal npx tsx test/_trace_field.ts
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { detectFieldTexture, detectParticleGroupTint } from '../src/compositor/field-texture.js';
import { makeMediaResolver } from './media-resolver.js';
import fs from 'node:fs'; import path from 'node:path';

const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'), 'utf-8'));
const slug = process.env.FCT_SLUG || 'Wipes__Diagonal';
const motr = map[slug];
const xml = fs.readFileSync(motr, 'utf-8');
const resolver = makeMediaResolver(motr);
const scene = parseMotr(xml);
const endSec = (scene as any).settings?.animationEndSec ?? ((scene as any).settings?.duration ? (scene as any).settings.duration.value / (scene as any).settings.duration.timescale : 1);
const ev = evaluate(scene as any, 0);
// evaluate() populates the EvaluatedScene fields detectFieldTexture reads.
const field = detectFieldTexture(ev as any, resolver as any);
console.log(`=== ${slug}  endSec=${endSec.toFixed(4)} ===`);
if (!field) { console.log('NO FIELD TEXTURE DETECTED'); }
else {
  const t = field.img;
  let r = 0, g = 0, b = 0; const n = t.width * t.height;
  for (let i = 0; i < n; i++) { r += t.data[i*4]; g += t.data[i*4+1]; b += t.data[i*4+2]; }
  console.log(`field: layerId=${field.layerId} tex=${t.width}x${t.height} mean_rgb=[${(r/n).toFixed(1)},${(g/n).toFixed(1)},${(b/n).toFixed(1)}]`);
  console.log(`window: pin=${field.pin.toFixed(4)} pout=${field.pout.toFixed(4)}  (pin*23frames=${(field.pin*23).toFixed(1)}, pout*23=${(field.pout*23).toFixed(1)})`);
}
const tint = detectParticleGroupTint(ev as any);
console.log(`tint: ${tint ? JSON.stringify(tint) : 'null'}`);
