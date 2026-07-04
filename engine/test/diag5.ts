import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function findEv(el:any,n:string):any{if(el.layer?.name===n)return el;for(const c of el.children||[]){const f=findEv(c,n);if(f)return f;}return null;}
for(const p of [0, 0.14, 0.43]){
  const dur=scene.settings.duration.value/scene.settings.duration.timescale;
  const ev=evaluate(scene, p*dur);
  let e:any=null; for(const l of ev.layers){const f=findEv(l,'Transition A'); if(f){e=f;break;}}
  const m=Array.from(e.worldTransform as Float64Array);
  console.log(`p=${p}: translation=(${m[12].toFixed(1)}, ${m[13].toFixed(1)}, ${m[14].toFixed(1)})`);
}
