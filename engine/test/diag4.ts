import { parseMotr } from '../src/parser/index.js';
import { evaluateCurve, resolveValue, timeToSeconds } from '../src/evaluator/curves.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function find(l:any[],n:string):any{for(const x of l){if(x.name===n)return x;if(x.children){const f=find(x.children,n);if(f)return f;}}return null;}
const ta=find(scene.layers,'Transition A');
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
// retime progress
const rv=ta.retimeValue;
console.log('Fall Transition A:');
console.log('  positionY:', JSON.stringify(ta.transform.positionY));
console.log('  anchorY:', JSON.stringify(ta.transform.anchorY));
console.log('  retimeValue kfs:', rv?rv.keyframes.map((k:any)=>k.value):'none');
console.log('  scene', scene.settings.width, scene.settings.height);
