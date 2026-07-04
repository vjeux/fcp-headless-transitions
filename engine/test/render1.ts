if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: Uint8ClampedArray; width: number; height: number; constructor(d: Uint8ClampedArray, w: number, h?: number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function load(p:string){const g=PNG.sync.read(fs.readFileSync(p));return new ImageData(new Uint8ClampedArray(g.data),g.width,g.height);}
const rel=process.argv[2], prog=parseFloat(process.argv[3]), out=process.argv[4];
const a=load(path.resolve(import.meta.dirname,'start.png'));
const b=load(path.resolve(import.meta.dirname,'end.png'));
const tr=createTransition(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/'+rel,'utf-8'),{outputWidth:1920,outputHeight:1080});
const r=tr.render(a,b,prog);
const png=new PNG({width:1920,height:1080}); png.data=Buffer.from(r.data.buffer); fs.writeFileSync(out, PNG.sync.write(png));
console.log('wrote '+out);
