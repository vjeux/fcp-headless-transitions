import { resample } from '../src/compositor/resample.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
if (typeof (globalThis as any).ImageData === "undefined") { (globalThis as any).ImageData = class { data:any;width:number;height:number; constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
const png=PNG.sync.read(fs.readFileSync('test/start.png'));
const src=new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
const r = resample(src, 2160, 1080);
const d=r.data; let br=0;
for(let y=0;y<1080;y++){let s=0;for(let x=0;x<2160;x++){const i=(y*2160+x)*4;s+=(d[i]+d[i+1]+d[i+2])/3;}if(s/2160<20)br++;}
console.log('resampled 2160x1080 black rows:', br);
