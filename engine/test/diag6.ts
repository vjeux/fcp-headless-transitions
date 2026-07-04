import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
// Patch: temporarily log inside buildTransformMatrix via re-implementing the resolve here
import { evaluateCurve, resolveValue, timeToSeconds } from '../src/evaluator/curves.js';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function find(l:any[],n:string):any{for(const x of l){if(x.name===n)return x;if(x.children){const f=find(x.children,n);if(f)return f;}}return null;}
const ta=find(scene.layers,'Transition A');
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
// retime progress
const rv=ta.retimeValue;
for(const p of [0,0.14,0.43]){
  const t=p*dur;
  const cf=evaluateCurve(rv,t); const ff=rv.keyframes[0].value, lf=rv.keyframes[rv.keyframes.length-1].value;
  const rp=Math.max(0,Math.min(1,(cf-ff)/(lf-ff)));
  // posY: static -540, default? resolveWithRetime(value=-540, default from... )
  // In evaluator posY uses resolveWithRetime(tx.positionY,...,0,rp). tx.positionY is -540 (number).
  // resolveWithRetime for a static number: default + (value-default)*rp = 0 + (-540)*rp
  const posY = -540*rp;
  const ancY = -540; // resolveValue static
  console.log(`p=${p}: retimeProgress=${rp.toFixed(3)} posY=${posY.toFixed(1)} ancY=${ancY}`);
}
