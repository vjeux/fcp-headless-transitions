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
    console.log('  '.repeat(d)+`[${l.layer.type}] "${l.layer.name}" id=${l.layer.id} vis=${l.visible} op=${l.opacity.toFixed(2)} src=${l.layer.source??''} tx=${wt?wt[12].toFixed(0):'-'},${wt?wt[13].toFixed(0):'-'} filters=${(l.layer.filters||[]).map((f:any)=>f.pluginName).join(',')}`);
    walk(l.children, d+1);
  }
}
console.log(`=== ${slug} @ t=${t}s (endSec=${(scene.settings.animationEndSec ?? scene.settings.duration.value/scene.settings.duration.timescale).toFixed(3)}) ===`);
walk(ev.layers);
