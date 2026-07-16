// Dump every layer's parsed animation behaviors (Fade/Ramp/Oscillate/Spin/other) with
// their params + timing window. Verifies the parser surfaces group/layer-level behaviors
// (e.g. Combo_Spin's blade-group "Spin LT/RT") before the evaluator consumes them.
// Usage: FCT_SLUG=<slug> npx tsx test/_trace_behaviors.ts
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'), 'utf-8'));
const scene = parseMotr(fs.readFileSync(map[process.env.FCT_SLUG!], 'utf-8'));
const t2s = (rt: any) => rt && rt.timescale > 0 ? rt.value / rt.timescale : 0;
let n = 0;
function walk(ls: readonly any[], d = 0) {
  for (const l of ls) {
    const bs = l.behaviors || [];
    if (bs.length) {
      n++;
      const desc = bs.map((b: any) => {
        const win = b.timing ? ` [${t2s(b.timing.in).toFixed(3)}..${t2s(b.timing.out).toFixed(3)}s]` : '';
        return `${b.type}${win} ${JSON.stringify(b.params)}`;
      }).join('; ');
      console.log(`${'  '.repeat(d)}[${l.type}] "${l.name}" id=${l.id}  ${desc}`);
    }
    walk(l.children, d + 1);
  }
}
console.log(`=== ${process.env.FCT_SLUG} — parsed layer behaviors ===`);
walk(scene.layers);
console.log(`total layers with behaviors: ${n}`);
