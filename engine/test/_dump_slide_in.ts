if (typeof (globalThis as any).ImageData === 'undefined') { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import fs from 'fs';
process.env.FCT_LINEAR_GRADIENT_GEN = '1';
const scene = parseMotr(fs.readFileSync('/tmp/slide_in.motr', 'utf8'));
function walk(l: any, depth: number) {
  const pad = '  '.repeat(depth);
  const enabled = l.enabled === false ? ' DISABLED' : '';
  const desc = `${l.type} "${l.name}" id=${l.id}${l.source?.type ? ' src=' + l.source.type : ''}${l.shape?.isMask ? ' [MASK]' : ''}${l.shape?.verticesX?.length ? ' V' + l.shape.verticesX.length : ''}${l.imageMaskSourceId ? ' imgMaskSrc=' + l.imageMaskSourceId : ''}${l.behaviors?.length ? ' beh:[' + l.behaviors.map((b: any) => b.type + ' fid=' + b.factoryID).join(',') + ']' : ''}${l.dropZone ? ' DZ' : ''}${enabled}`;
  console.log(pad + desc);
  for (const c of (l.children || [])) walk(c, depth + 1);
}
console.log('=== keys of scene:', Object.keys(scene).join(','));
console.log('=== layers count:', scene.layers.length);
for (const l of scene.layers) walk(l, 0);
