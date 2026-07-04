if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { createTransition } from '../src/index.js';
import fs from 'node:fs';
const xml = fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8');
const t = createTransition(xml);
console.log('scene settings:', JSON.stringify(t.scene.settings));
function walk(l:any,d:number){ console.log('  '.repeat(d)+`[${l.type}] "${l.name}" id=${l.id} enabled=${l.enabled} links=${(l.links||[]).length} clone=${l.cloneSourceId??''} src=${l.source?.type??''}`); for(const c of l.children) walk(c,d+1);}
for(const l of t.scene.layers) walk(l,0);
console.log('rigWidgets:', JSON.stringify(t.scene.rigWidgets));
// dump links
function dumpLinks(l:any){ if(l.links) for(const lk of l.links) console.log('  LINK on',l.id,'->src',lk.sourceObjectId,'chan',lk.sourceChannel,'->',lk.targetChannel,'scale',lk.scale,'mix',lk.customMix,'rigMix',JSON.stringify(lk.rigCustomMix),'widget',lk.rigWidgetId); for(const c of l.children) dumpLinks(c);}
for(const l of t.scene.layers) dumpLinks(l);
