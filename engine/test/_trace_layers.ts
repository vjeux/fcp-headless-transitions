// Trace evaluated layer visibility/opacity at a given scene time.
// Usage: FCT_SLUG=<slug> FCT_T=<sec> npx tsx test/_trace_layers.ts
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'),'utf-8'));
const slug = process.env.FCT_SLUG!;
const t = parseFloat(process.env.FCT_T || '0.717');
const xml = fs.readFileSync(map[slug], 'utf-8');
const scene = parseMotr(xml);
const ev = evaluate(scene, t);
function walk(ls: readonly any[], d=0){
  for(const l of ls){
    const wt=l.worldTransform;
    // FCT_XFORM=1 → also print Z translation + the 3x3 linear part (rotation/scale)
    // so 3D folds (Z / X-rot / Y-rot links) are visible, not just X/Y translation.
    const xf = process.env.FCT_XFORM === '1' && wt
      ? ` z=${wt[14].toFixed(0)} m3x3=[${[wt[0],wt[1],wt[2],wt[4],wt[5],wt[6],wt[8],wt[9],wt[10]].map((x:number)=>x.toFixed(2)).join(',')}]`
      : '';
    console.log('  '.repeat(d)+`[${l.layer.type}] "${l.layer.name}" id=${l.layer.id} vis=${l.visible} op=${l.opacity.toFixed(2)} src=${l.layer.source??''} tx=${wt?wt[12].toFixed(0):'-'},${wt?wt[13].toFixed(0):'-'} filters=${(l.layer.filters||[]).map((f:any)=>f.pluginName).join(',')}${xf}`);
    walk(l.children, d+1);
  }
}
console.log(`=== ${slug} @ t=${t}s (endSec=${(scene.settings.animationEndSec ?? scene.settings.duration.value/scene.settings.duration.timescale).toFixed(3)}) ===`);
walk(ev.layers);
