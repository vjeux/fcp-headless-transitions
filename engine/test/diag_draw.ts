if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const endSec=scene.settings.animationEndSec!;
const t=0.4*endSec;
const e=evaluate(scene,t);
// walk evaluated tree, print every node that WOULD draw (image/clone/generator + visible)
function walk(ev:any,d:number){
  const l=ev.layer;
  const draws=(l.type==='image'||l.type==='clone'||l.type==='generator');
  const x=ev.worldTransform[12].toFixed(0), y=ev.worldTransform[13].toFixed(0);
  const mark = draws && ev.visible ? ' <<< DRAWS' : '';
  console.log(`${'  '.repeat(d)}[${l.type}] "${l.name}" id=${l.id} vis=${ev.visible} op=${ev.opacity.toFixed(2)} pos=(${x},${y}) clone=${l.cloneSourceId??''} src=${l.source?.type??''}${mark}`);
  for(const c of ev.children) walk(c,d+1);
}
for(const l of e.layers) walk(l,0);
