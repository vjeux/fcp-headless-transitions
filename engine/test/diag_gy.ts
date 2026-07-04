if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const xml = fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8');
const scene = parseMotr(xml);
const T_LAST=200200/120000;
function findEval(ev:any,id:number):any{ if(ev.layer.id===id) return ev; for(const c of ev.children){const r=findEval(c,id); if(r) return r;} return null;}
// measured GT displacement from /tmp/alldy2.log
const meas:Record<number,number> = {};
for(const l of fs.readFileSync('/tmp/alldy2.log','utf-8').trim().split('\n')){const [a,b]=l.split(' ');meas[+a]=+b;}
console.log('frame  engineGroupY  measuredDY');
for(const fi of [4,8,12,16,20,24,28,32,36]){
  const t=(fi/49)*T_LAST;
  const e=evaluate(scene,t);
  const grp=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);
  console.log(`  ${fi}   ${grp.worldTransform[13].toFixed(1)}   ${meas[fi]}`);
}
