if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: Uint8ClampedArray; width: number; height: number; constructor(d: Uint8ClampedArray, w: number, h?: number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { needsPerspective } from '../src/compositor/perspective.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
function findEv(el:any,n:string):any{if(el.layer?.name===n)return el;for(const c of el.children||[]){const f=findEv(c,n);if(f)return f;}return null;}
for(const p of [0.43,0.8]){
  const ev=evaluate(scene, p*dur);
  let e:any=null; for(const l of ev.layers){const f=findEv(l,'Transition A'); if(f){e=f;break;}}
  const m=Array.from(e.worldTransform as Float64Array);
  console.log(`p=${p}: needsPerspective=${needsPerspective(e.worldTransform)}`);
  console.log(`  matrix rows: [${m[0].toFixed(2)},${m[4].toFixed(2)},${m[8].toFixed(2)},${m[12].toFixed(1)}]`);
  console.log(`               [${m[1].toFixed(2)},${m[5].toFixed(2)},${m[9].toFixed(2)},${m[13].toFixed(1)}]`);
  console.log(`               [${m[2].toFixed(2)},${m[6].toFixed(2)},${m[10].toFixed(2)},${m[14].toFixed(1)}]`);
}
