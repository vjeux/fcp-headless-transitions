if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'), 'utf-8'));
const slug = process.env.FCT_SLUG || 'Wipes__Diagonal';
const scene: any = parseMotr(fs.readFileSync(map[slug], 'utf-8'));
function walk(l: any, d = 0) {
  const nm = l.name || '';
  if (/emitter|hard|tint|texture|particle/i.test(nm) || l.isParticleEmitter || (l.filters&&l.filters.length)) {
    console.log('  '.repeat(d) + `[${l.type}] "${nm}" id=${l.id} blend=${l.blendMode} emit=${!!l.isParticleEmitter} filters=${(l.filters||[]).map((f:any)=>f.pluginName).join(',')}`);
  }
  for (const c of (l.children || [])) walk(c, d + 1);
}
const seen = new Set<number>();
for (const l of scene.layerById.values()) { if (!l.parentId && !seen.has(l.id)) { seen.add(l.id); walk(l); } }
