if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return new ImageData(new Uint8ClampedArray(p.data),p.width,p.height);}
function psnr(a:ImageData,b:ImageData){let mse=0;const n=Math.min(a.data.length,b.data.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const MOTR='/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr';
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
const imgA=loadPNG(path.resolve(import.meta.dirname,'start.png')),imgB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
for(const s of [1.0,0.75,0.5,0.33,0.25,0.0]){
  (globalThis as any).__TANGENT_SCALE=s;
  const t=createTransition(fs.readFileSync(MOTR,'utf-8'),{outputWidth:1920,outputHeight:1080});
  let sum=0,c=0;
  for(let i=0;i<frames.length;i++){const p=i/(frames.length-1);const gt=loadPNG(path.join(GT,frames[i]));const r=t.render(imgA,imgB,p);const v=psnr(r,gt);if(isFinite(v)){sum+=v;c++;}}
  console.log(`tangent scale ${s}: mean ${(sum/c).toFixed(2)}dB`);
}
