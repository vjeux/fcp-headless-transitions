if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { evaluateCurve } from '../src/evaluator/curves.js';
import fs from 'node:fs';
const xml = fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8');
const scene = parseMotr(xml);
function findLayer(ls:any[],id:number):any{for(const l of ls){if(l.id===id)return l;const r=findLayer(l.children,id);if(r)return r;}return null;}
const cs=findLayer(scene.layers,1999869897);
console.log('ColorSolid Y curve type:', typeof cs.transform.positionY, cs.transform.positionY?.keyframes?.length,'keys');
const c=cs.transform.positionY;
if(c && c.keyframes) for(const k of c.keyframes) console.log(`  key t=${(k.time.value/k.time.timescale).toFixed(4)} v=${k.value} interp=${k.interpolation} outTt=${k.outTangentTime} outTv=${k.outTangentValue} inTt=${k.inTangentTime} inTv=${k.inTangentValue}`);
const T_LAST=200200/120000;
console.log('eval at frames:');
for(const fi of [11,26,29]){ const t=(fi/49)*T_LAST; console.log(`  f${fi} t=${t.toFixed(4)} Y=${evaluateCurve(c,t).toFixed(1)}`);}
