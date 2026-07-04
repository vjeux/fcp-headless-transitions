if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const xml = fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8');
const scene = parseMotr(xml);
// which clones exist, their static Y, source, opacity rig snapshots
function walk(l:any){ if(l.type==='clone'){ console.log(`clone ${l.name} id=${l.id} posY=${JSON.stringify(l.transform.positionY)} posX=${JSON.stringify(l.transform.positionX)} src=${l.cloneSourceId}`);} for(const c of l.children) walk(c);}
for(const l of scene.layers) walk(l);
console.log('--- rig behaviors (opacity) ---');
for(const rb of scene.rigBehaviors){ if(rb.paramType==='Opacity') console.log(`affects ${rb.affectedObjectId} widget ${rb.widgetId} snaps=${rb.snapshots.map((s:any)=>JSON.stringify(s.curve?.value ?? s.value)).join(',')}`);}
