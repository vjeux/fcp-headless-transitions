if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data:Uint8ClampedArray;width:number;height:number; constructor(d:Uint8ClampedArray,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };
}
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';
// Manual Push: linear vs bezier displacement, pure translation model.
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return {data:p.data as Buffer,w:p.width,h:p.height};}
const srcA=loadPNG(path.resolve(import.meta.dirname,'start.png'));
const srcB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const W=1920,H=1080,ox=(W-srcA.w)>>1,oy=(H-srcA.h)>>1;
function canvasify(s:{data:Buffer,w:number,h:number}){const out=new Uint8ClampedArray(W*H*4);for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const si=(y*s.w+x)*4;const di=((y+oy)*W+(x+ox))*4;out[di]=s.data[si];out[di+1]=s.data[si+1];out[di+2]=s.data[si+2];out[di+3]=255;}return out;}
const cA=canvasify(srcA),cB=canvasify(srcB);
function renderPush(dy:number){ // A shifted down by dy; B fills top (B bottom edge at row dy)
  const out=new Uint8ClampedArray(W*H*4);
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const di=(y*W+x)*4;
      let src:Uint8ClampedArray|null=null, sy=0;
      if(y>=dy){ src=cA; sy=y-dy; } // A
      else { src=cB; sy=y+(H-dy); } // B enters from top
      if(sy>=0&&sy<H){const si=(sy*W+x)*4;out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];out[di+3]=255;}
    }
  }
  return out;
}
function psnr(a:Uint8ClampedArray,b:Buffer){let mse=0;const n=Math.min(a.length,b.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a[i+c]-b[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
// bezier displacement from base curve (precomputed via engine group Y) vs linear
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findEval(ev:any,id:number):any{if(ev.layer.id===id)return ev;for(const c of ev.children){const r=findEval(c,id);if(r)return r;}return null;}
function bezierDY(p:number){const t=p*T_LAST;const e=evaluate(scene,t);const g=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);return g.worldTransform[13];}
let lin=0,bez=0,cnt=0;
for(let i=0;i<frames.length;i++){
  const p=i/(frames.length-1);
  const gt=loadPNG(path.join(GT,frames[i])).data;
  const dyLin=Math.round(p*H);
  const dyBez=Math.round(bezierDY(p));
  lin+=psnr(renderPush(dyLin),gt); bez+=psnr(renderPush(dyBez),gt); cnt++;
}
console.log(`LINEAR displacement: ${(lin/cnt).toFixed(2)}dB   BEZIER displacement: ${(bez/cnt).toFixed(2)}dB`);
