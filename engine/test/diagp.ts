import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { projectQuad } from '../src/compositor/perspective.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
function findEv(el:any,n:string):any{if(el.layer?.name===n)return el;for(const c of el.children||[]){const f=findEv(c,n);if(f)return f;}return null;}
const ev=evaluate(scene, 0.4286*dur);
let e:any=null; for(const l of ev.layers){const f=findEv(l,'Transition A'); if(f){e=f;break;}}
const corners=projectQuad(e.worldTransform, 1854, 1042);
const labels=['TL','TR','BR','BL'];
corners.forEach((c,i)=>console.log(`${labels[i]}: screen=(${c[0].toFixed(0)},${c[1].toFixed(0)}) w=${c[2].toFixed(3)}`));
// width of top edge vs bottom edge
const topW=corners[1][0]-corners[0][0], botW=corners[2][0]-corners[3][0];
console.log(`top edge width=${topW.toFixed(0)}, bottom edge width=${botW.toFixed(0)}`);
console.log(topW>botW ? "TOP WIDER (tilt toward viewer at top)" : "BOTTOM WIDER (tilt away at top) — matches GT");
