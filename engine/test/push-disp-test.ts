if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
import { parseMotr } from '../src/parser/index.js'; import { evaluate } from '../src/evaluator/index.js'; import { evaluateCurve } from '../src/evaluator/curves.js';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return {data:p.data as Buffer,w:p.width,h:p.height};}
const srcA=loadPNG(path.resolve(import.meta.dirname,'start.png')),srcB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const W=1920,H=1080,ox=(W-srcA.w)>>1,oy=(H-srcA.h)>>1;
function cv(s:any){const o=new Uint8ClampedArray(W*H*4);for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const si=(y*s.w+x)*4,di=((y+oy)*W+(x+ox))*4;o[di]=s.data[si];o[di+1]=s.data[si+1];o[di+2]=s.data[si+2];o[di+3]=255;}return o;}
const cA=cv(srcA),cB=cv(srcB);
function renderPush(dy:number){const out=new Uint8ClampedArray(W*H*4);const idy=Math.round(dy);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const di=(y*W+x)*4;let src,sy;if(y>=idy){src=cA;sy=y-idy;}else{src=cB;sy=y+(H-idy);}if(sy>=0&&sy<H){const si=(sy*W+x)*4;out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];out[di+3]=255;}}return out;}
function psnr(a:Uint8ClampedArray,b:Buffer){let mse=0;const n=Math.min(a.length,b.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a[i+c]-b[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findLayer(ls:any[],id:number):any{for(const l of ls){if(l.id===id)return l;const r=findLayer(l.children,id);if(r)return r;}return null;}
const cs=findLayer(scene.layers,1999869897);
const yCurve=cs.transform.positionY;
// bezier displacement
function bezDisp(p:number){return -evaluateCurve(yCurve,p*T_LAST);}
// linear-keyframe displacement
const kf=yCurve.keyframes.map((k:any)=>({t:k.time.value/k.time.timescale,v:k.value}));
function linDisp(p:number){const ts=p*T_LAST;if(ts<=kf[0].t)return -kf[0].v;if(ts>=kf[kf.length-1].t)return -kf[kf.length-1].v;for(let i=0;i<kf.length-1;i++){if(kf[i].t<=ts&&ts<=kf[i+1].t)return -(kf[i].v+(kf[i+1].v-kf[i].v)*(ts-kf[i].t)/(kf[i+1].t-kf[i].t));}return -kf[kf.length-1].v;}
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
let bez=0,lin=0,cnt=0;
for(let i=0;i<frames.length;i++){const p=i/(frames.length-1);const gt=loadPNG(path.join(GT,frames[i])).data;bez+=psnr(renderPush(bezDisp(p)),gt);lin+=psnr(renderPush(linDisp(p)),gt);cnt++;}
console.log(`BEZIER disp: ${(bez/cnt).toFixed(2)}dB   LINEAR-keyframe disp: ${(lin/cnt).toFixed(2)}dB`);
