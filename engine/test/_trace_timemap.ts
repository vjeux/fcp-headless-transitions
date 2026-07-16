// Trace the scene-time authority (buildTimeMap) for a slug: endSec, wrapSec, clampSec,
// and the progress->sceneTime remap across the 24 render frames. Reveals retime-wrap
// FREEZES (many progress values mapping to the same sceneTime) — the Video_Wall /
// Combo_Spin frozen-render class. Usage: FCT_SLUG=<slug> npx tsx test/_trace_timemap.ts
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import { buildTimeMap } from '../src/timemap.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'), 'utf-8'));
const slug = process.env.FCT_SLUG!;
const xml = fs.readFileSync(map[slug], 'utf-8');
const scene = parseMotr(xml);
const tm = buildTimeMap(scene);
const endSec = scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale);
console.log(`=== ${slug} ===`);
console.log(`endSec=${endSec.toFixed(4)}  wrapSec=${tm.wrapSec === undefined ? 'none' : tm.wrapSec.toFixed(4)}  clampSec=${tm.clampSec === undefined ? 'none' : tm.clampSec.toFixed(4)}  frameRate=${scene.settings.frameRate}`);
const N = 24;
let prev = NaN, frozen = 0;
console.log('frame  progress  sceneTime');
for (let i = 0; i < N; i++) {
  const progress = i / N;
  const st = tm.remap(progress * endSec);
  const froze = Math.abs(st - prev) < 1e-6;
  if (froze) frozen++;
  console.log(`  f${String(i).padStart(2, '0')}  ${progress.toFixed(4)}  ${st.toFixed(4)}${froze ? '  <-- FROZEN' : ''}`);
  prev = st;
}
console.log(`frozen frames: ${frozen}/${N}`);
