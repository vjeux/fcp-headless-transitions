import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function findEv(el:any,n:string,depth=0):any{if(el.layer?.name===n)return {e:el,depth};for(const c of el.children||[]){const f=findEv(c,n,depth+1);if(f)return f;}return null;}
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
for(const p of [0,0.14]){
  const ev=evaluate(scene, p*dur);
  console.log(`\np=${p}:`);
  for(const l of ev.layers){
    const walk=(x:any,d=0)=>{
      const m=x.worldTransform as Float64Array; const lm=x.localTransform as Float64Array;
      console.log('  '.repeat(d)+`"${x.layer.name}": world_ty=${m[13].toFixed(1)} local_ty=${lm[13].toFixed(1)}`);
      for(const c of x.children||[]) walk(c,d+1);
    };
    walk(l);
  }
}
