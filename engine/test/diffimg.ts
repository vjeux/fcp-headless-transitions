if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: Uint8ClampedArray; width: number; height: number; constructor(d: Uint8ClampedArray, w: number, h?: number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function load(p:string){const g=PNG.sync.read(fs.readFileSync(p));return new ImageData(new Uint8ClampedArray(g.data),g.width,g.height);}
const a=load(path.resolve(import.meta.dirname,'start.png')), b=load(path.resolve(import.meta.dirname,'end.png'));
const tr=createTransition(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'),{outputWidth:1920,outputHeight:1080});
const r=tr.render(a,b,0.4286);
const gt=load('/tmp/gt_all/Movements__Fall/frame_0003.png');
const diff=new ImageData(new Uint8ClampedArray(1920*1080*4),1920,1080);
for(let i=0;i<diff.data.length;i+=4){
  const d=Math.abs(r.data[i]-gt.data[i])+Math.abs(r.data[i+1]-gt.data[i+1])+Math.abs(r.data[i+2]-gt.data[i+2]);
  const v=Math.min(255,d);
  diff.data[i]=v;diff.data[i+1]=v;diff.data[i+2]=v;diff.data[i+3]=255;
}
const png=new PNG({width:1920,height:1080});png.data=Buffer.from(diff.data.buffer);fs.writeFileSync('/tmp/fall_diff.png',PNG.sync.write(png));
console.log('wrote /tmp/fall_diff.png (white=error)');
