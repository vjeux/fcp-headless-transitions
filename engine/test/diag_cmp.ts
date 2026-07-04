if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findEval(ev:any,id:number):any{if(ev.layer.id===id)return ev;for(const c of ev.children){const r=findEval(c,id);if(r)return r;}return null;}
const meas:Record<number,number>={8:90,11:167,14:259,17:356,20:455,23:550,26:642,29:736,32:829,35:916};
console.log('frame  engineGroupY  trueDY  diff');
for(const fi of Object.keys(meas).map(Number)){
  const t=(fi/49)*T_LAST;
  const e=evaluate(scene,t);
  const grp=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);
  const gy=grp.worldTransform[13];
  console.log(`  ${fi}   ${gy.toFixed(1)}   ${meas[fi]}   ${(gy-meas[fi]).toFixed(1)}`);
}
