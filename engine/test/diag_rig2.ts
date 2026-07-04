if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
// Left clone opacity behavior, index 2 snapshot structure
for(const rb of scene.rigBehaviors){
  if(rb.affectedObjectId===1999892168 && rb.paramType==='Opacity'){
    const snap=rb.snapshots[2];
    console.log('Left clone Opacity snapshot[2]:', JSON.stringify(snap,null,1).slice(0,400));
  }
}
