// Dump the field-texture layer's opacity over the 24 frames (evaluated), plus its
// timing window, to reveal the REAL green-onset envelope (vs the synthetic bell).
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'), 'utf-8'));
const slug = process.env.FCT_SLUG || 'Wipes__Diagonal';
const texId = parseInt(process.env.FCT_TEXID || '970891043');
const xml = fs.readFileSync(map[slug], 'utf-8');
const scene = parseMotr(xml);
const endSec = (scene as any).settings?.animationEndSec ?? ((scene as any).settings?.duration ? (scene as any).settings.duration.value/(scene as any).settings.duration.timescale : 1);
console.log(`=== ${slug} texId=${texId} endSec=${endSec.toFixed(4)} ===`);
function findEv(ls: readonly any[], id: number): any { for (const l of ls) { if (l.layer.id === id) return l; const r = findEv(l.children, id); if (r) return r; } return null; }
for (let i = 0; i < 24; i++) {
  const t = (i/24) * endSec;
  const ev = evaluate(scene as any, t);
  const el = findEv(ev.layers, texId);
  console.log(`f${String(i).padStart(2,'0')} t=${t.toFixed(3)}  vis=${el?el.visible:'?'} op=${el?el.opacity.toFixed(3):'?'}`);
}
