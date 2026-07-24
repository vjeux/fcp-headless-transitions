import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const s = parseMotr(fs.readFileSync('../fct/minimized/Movements__Switch/case.motr','utf8'));
const E = s.settings.animationEndSec!;
function find(ls:any[],name:string):any{for(const l of ls){if(l.layer.name===name)return l;const r=find(l.children,name);if(r)return r;}return null;}
console.log('endSec', E);
for (const f of [0,6,12,18,23]) {
  const t=f/23*E; const ev=evaluate(s,t); const cb=find(ev.layers,'Clone B');
  console.log(`f${f} t=${t.toFixed(3)}: CloneB vis=${cb?cb.visible:'?'} op=${cb?cb.opacity.toFixed(2):'?'} timingIn=${cb?.layer.timing?.in?.value}/${cb?.layer.timing?.in?.timescale}`);
}
