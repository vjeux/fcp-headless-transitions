if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const xml = fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8');
const scene = parseMotr(xml);
const T_LAST=200200/120000;
function findEval(ev:any, id:number):any{ if(ev.layer.id===id) return ev; for(const c of ev.children){const r=findEval(c,id); if(r) return r;} return null;}
for(const p of [0,0.25,0.5,0.75,1.0]){
  const t=p*T_LAST;
  const e=evaluate(scene,t);
  const grp=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);
  const bottom=e.layers.map((l:any)=>findEval(l,1999892065)).find(Boolean);
  const top=e.layers.map((l:any)=>findEval(l,1999892165)).find(Boolean);
  const A=e.layers.map((l:any)=>findEval(l,1999869843)).find(Boolean);
  const wt=(x:any)=>x?`(${x.worldTransform[12].toFixed(0)},${x.worldTransform[13].toFixed(0)}) vis=${x.visible} op=${x.opacity.toFixed(2)}`:'?';
  console.log(`p=${p} Group${wt(grp)}  A${wt(A)}  Bottom${wt(bottom)}  Top${wt(top)}`);
}
