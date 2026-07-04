import { parseMotr } from '../src/parser/index.js';
import { evaluateCurve, timeToSeconds } from '../src/evaluator/curves.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function find(l:any[],n:string):any{for(const x of l){if(x.name===n)return x;if(x.children){const f=find(x.children,n);if(f)return f;}}return null;}
const ta=find(scene.layers,'Transition A');
const rx=ta.transform.rotationX;
console.log('rotationX keyframes:');
for(const kf of rx.keyframes) console.log(`  t=${timeToSeconds(kf.time).toFixed(3)}s val=${kf.value}`);
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
console.log('duration', dur);
console.log('rotationX evaluated over transition:');
for(const p of [0,0.2,0.43,0.6,0.8,1.0]) console.log(`  p=${p}: ${evaluateCurve(rx, p*dur).toFixed(3)}`);
