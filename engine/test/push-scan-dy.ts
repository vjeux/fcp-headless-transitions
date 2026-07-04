if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
import { parseMotr } from '../src/parser/index.js'; import { evaluate } from '../src/evaluator/index.js';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return {data:p.data as Buffer,w:p.width,h:p.height};}
const srcA=loadPNG(path.resolve(import.meta.dirname,'start.png')),srcB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const W=1920,H=1080,ox=(W-srcA.w)>>1,oy=(H-srcA.h)>>1;
function cv(s:any){const o=new Uint8ClampedArray(W*H*4);for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const si=(y*s.w+x)*4,di=((y+oy)*W+(x+ox))*4;o[di]=s.data[si];o[di+1]=s.data[si+1];o[di+2]=s.data[si+2];o[di+3]=255;}return o;}
const cA=cv(srcA),cB=cv(srcB);
function renderPush(dy:number){const out=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const di=(y*W+x)*4;let src,sy;if(y>=dy){src=cA;sy=y-dy;}else{src=cB;sy=y+(H-dy);}if(sy>=0&&sy<H){const si=(sy*W+x)*4;out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];out[di+3]=255;}}return out;}
function psnr(a:Uint8ClampedArray,b:Buffer){let mse=0;const n=Math.min(a.length,b.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a[i+c]-b[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findEval(ev:any,id:number):any{if(ev.layer.id===id)return ev;for(const c of ev.children){const r=findEval(c,id);if(r)return r;}return null;}
function bezDY(p:number){const e=evaluate(scene,p*T_LAST);const g=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);return g.worldTransform[13];}
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
// For a few frames, scan dy to find the TRUE best-PSNR dy vs the bezier dy.
for(const fi of [8,14,20,26,32]){
  const p=fi/(frames.length-1);
  const gt=loadPNG(path.join(GT,frames[fi])).data;
  const bez=Math.round(bezDY(p));
  let best=[-1,0];
  for(let dy=Math.max(0,bez-80);dy<=bez+80;dy++){const v=psnr(renderPush(dy),gt);if(v>best[0])best=[v,dy];}
  console.log(`f${fi}: bezDY=${bez} bezPSNR=${psnr(renderPush(bez),gt).toFixed(1)}  bestDY=${best[1]} bestPSNR=${best[0].toFixed(1)}`);
}
