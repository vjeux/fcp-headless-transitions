if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { composite } from '../src/compositor/index.js';
import { resample } from '../src/compositor/resample.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';
const MOTR='/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr';
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return new ImageData(new Uint8ClampedArray(p.data),p.width,p.height);}
function psnr(a:ImageData,b:ImageData){let mse=0;const n=Math.min(a.data.length,b.data.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const scene=parseMotr(fs.readFileSync(MOTR,'utf-8'));
const imgA=loadPNG(path.resolve(import.meta.dirname,'start.png'));
const imgB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const T_LAST=200200/120000;
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
function renderAt(t:number){const e=evaluate(scene,t);const f=composite(e,imgA,imgB,1920,1080);return f;}
// sweep a multiplicative time scale + additive offset
for(const scale of [0.9,0.95,1.0,1.05,1.1]){
  let sum=0,cnt=0;
  for(let i=0;i<frames.length;i++){
    const p=i/(frames.length-1);
    let t=p*T_LAST*scale;
    t=Math.max(0,Math.min(T_LAST-1e-4,t));
    const gt=loadPNG(path.join(GT,frames[i]));
    const r=renderAt(t);
    const v=psnr(r,gt); if(isFinite(v)){sum+=v;cnt++;}
  }
  console.log(`time scale ${scale}: mean ${(sum/cnt).toFixed(2)}dB`);
}
