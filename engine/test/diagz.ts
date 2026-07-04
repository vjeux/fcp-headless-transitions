import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
function findEv(el:any,n:string):any{if(el.layer?.name===n)return el;for(const c of el.children||[]){const f=findEv(c,n);if(f)return f;}return null;}
const ev=evaluate(scene, 0.4286*dur);
let e:any=null; for(const l of ev.layers){const f=findEv(l,'Transition A'); if(f){e=f;break;}}
const m=e.worldTransform as Float64Array;
// top corner local (0, +521, 0) [half of 1042], transform including Z
for(const [lx,ly,lz,lbl] of [[0,521,0,'TOP'],[0,-521,0,'BOTTOM']] as any){
  const wz=m[2]*lx+m[6]*ly+m[10]*lz+m[14];
  const wy=m[1]*lx+m[5]*ly+m[9]*lz+m[13];
  console.log(`${lbl}: world z=${wz.toFixed(1)} y=${wy.toFixed(1)}`);
}
