// Trace each layer's resolved ImageSource (transitionA/B binding) + Image Mask wiring.
// Diagnoses A/B drop-zone binding bugs (which node renders photo A vs B) and single- vs
// two-sided masked reveals. Usage: FCT_SLUG=<slug> npx tsx test/_trace_src.ts
// Committed diagnostic (paired with parser/footage.ts A/B binding logic).
// Trace each layer's resolved ImageSource (transitionA/B/media/color) + Image-Mask
// wiring for a slug. The A/B binding diagnostic that decodes drop-zone→image mapping
// (the doc-order / fade-direction / masked-reveal binding in parser/footage.ts).
//   FCT_SLUG=<slug>            which transition to trace (default Wipes__Mask)
//   FCT_DEBUG_AB=1             ALSO print the parser's final clip→A/B map (set in footage.ts)
// Usage: FCT_SLUG=Wipes__Mask FCT_DEBUG_AB=1 node_modules/.bin/tsx test/_trace_src.ts
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'),'utf-8'));
const scene:any=parseMotr(fs.readFileSync(map[process.env.FCT_SLUG||'Wipes__Mask'],'utf-8'));
function walk(layers:any[]){ for(const l of layers){ if(l.source) console.log(`"${l.name}" id=${l.id} source=`, JSON.stringify(l.source), 'imgMask=',l.imageMaskSourceId,'inv=',l.imageMaskInvert); if(l.children) walk(l.children);} }
walk(scene.layers);
