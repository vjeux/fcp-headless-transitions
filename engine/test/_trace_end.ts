// Print animationEndSec + scene_duration for all slugs (blast-radius check).
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length/4/w); } }; }
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'),'utf-8'));
for (const slug of Object.keys(map).sort()) {
  try {
    const scene = parseMotr(fs.readFileSync(map[slug],'utf-8'));
    const dur = scene.settings.duration.value/scene.settings.duration.timescale;
    console.log(`${(scene.settings.animationEndSec??dur).toFixed(3)}\t${dur.toFixed(3)}\t${slug}`);
  } catch(e:any){ console.log(`ERR\t-\t${slug}\t${e.message}`); }
}
