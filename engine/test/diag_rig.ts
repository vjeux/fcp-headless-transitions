if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
console.log('rigWidgets:',JSON.stringify(scene.rigWidgets));
console.log('\nrigBehaviors affecting the clones:');
const cloneIds=new Set([1999892065,1999892168,1999892165,1999892171]);
for(const rb of scene.rigBehaviors){
  if(cloneIds.has(rb.affectedObjectId)){
    console.log(`  affects=${rb.affectedObjectId} widget=${rb.widgetId} paramType="${rb.paramType}" nsnap=${rb.snapshots.length}`);
    console.log(`    snapshot values: ${rb.snapshots.map((s:any)=>JSON.stringify(s.curve?.value ?? s.value)).join(', ')}`);
    console.log(`    snapshot names: ${rb.snapshots.map((s:any)=>s.name).join(', ')}`);
  }
}
