import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
function loadPNG(p:string){ const png=PNG.sync.read(fs.readFileSync(p)); return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height); }
if (typeof (globalThis as any).ImageData === "undefined") { (globalThis as any).ImageData = class { data:any;width:number;height:number; constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
const imgA = loadPNG('test/start.png'); const imgB = loadPNG('test/end.png');
// NO output override → render at scene native 2160x1080
const tr = createBenchTransition('../fct/minimized/Movements__Switch/case.motr', {});
const r = tr.render(imgA, imgB, 0);
console.log('native render:', r.width, 'x', r.height);
// row profile
const d = r.data; let blackRows=0;
for (let y=0;y<r.height;y++){ let s=0; for(let x=0;x<r.width;x++){const i=(y*r.width+x)*4; s+=(d[i]+d[i+1]+d[i+2])/3;} if(s/r.width<20) blackRows++; }
console.log('black rows:', blackRows, 'of', r.height);
