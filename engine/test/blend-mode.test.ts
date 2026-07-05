/**
 * Blend-mode parsing + enum-mapping test.
 *
 * Guards the ProCore PC_BLEND_* enum mapping (reverse-engineered from the
 * ordered __cstring table). 360° Push uses Blend Mode value 28 = Silhouette
 * Luma on its Color Solid layer; enabling blend modes improves its PSNR vs the
 * FCP ground truth by ~+3.9dB.
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: any; width: number; height: number;
    constructor(data: any, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { parseMotr } from '../src/parser/index.js';
import type { Layer } from '../src/types.js';
import fs from 'node:fs';

const M = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/360\u00b0.localized/360\u00b0 Push.localized/360\u00b0 Push.motr';

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { console.log(`  \u2713 ${name}`); pass++; }
  else { console.log(`  \u2717 ${name}`); fail++; }
}

const scene = parseMotr(fs.readFileSync(M, 'utf-8'));

function collect(layers: Layer[], out: Layer[] = []): Layer[] {
  for (const l of layers) { out.push(l); collect(l.children, out); }
  return out;
}
const all = collect(scene.layers);
const modes = new Set(all.map(l => l.blendMode));
console.log('blend modes present:', [...modes].join(', '));

check('at least one silhouetteLuma layer (value 28)', all.some(l => l.blendMode === 'silhouetteLuma'));
check('normal layers still present', all.some(l => l.blendMode === 'normal'));
check('no undefined blendMode', all.every(l => typeof l.blendMode === 'string'));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
