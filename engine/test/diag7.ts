import { parseMotr } from '../src/parser/index.js';
import { resolveValue } from '../src/evaluator/curves.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function find(l:any[],n:string):any{for(const x of l){if(x.name===n)return x;if(x.children){const f=find(x.children,n);if(f)return f;}}return null;}
const ta=find(scene.layers,'Transition A');
console.log('tx.anchorY:', JSON.stringify(ta.transform.anchorY));
console.log('tx.positionY:', JSON.stringify(ta.transform.positionY));
console.log('resolveValue(anchorY,0,0):', resolveValue(ta.transform.anchorY,0,0));
console.log('resolveValue(positionY,0,0):', resolveValue(ta.transform.positionY,0,0));
