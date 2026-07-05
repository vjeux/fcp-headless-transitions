if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const endSec=scene.settings.animationEndSec!;
function findEval(ev:any,id:number):any{if(ev.layer.id===id)return ev;for(const c of ev.children){const r=findEval(c,id);if(r)return r;}return null;}
// engine displacement = Group Y worldTransform
const out:string[]=[];
for(let fi=0;fi<50;fi++){
  const p=fi/49; const t=p*endSec;
  const e=evaluate(scene,t);
  const g=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);
  out.push(`${fi}:${g.worldTransform[13].toFixed(2)}`);
}
console.log(out.join(' '));
