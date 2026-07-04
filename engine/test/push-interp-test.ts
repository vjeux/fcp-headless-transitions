if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
import { parseMotr } from '../src/parser/index.js';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return {data:p.data as Buffer,w:p.width,h:p.height};}
const srcA=loadPNG(path.resolve(import.meta.dirname,'start.png')),srcB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const W=1920,H=1080,ox=(W-srcA.w)>>1,oy=(H-srcA.h)>>1;
function cv(s:any){const o=new Uint8ClampedArray(W*H*4);for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const si=(y*s.w+x)*4,di=((y+oy)*W+(x+ox))*4;o[di]=s.data[si];o[di+1]=s.data[si+1];o[di+2]=s.data[si+2];o[di+3]=255;}return o;}
const cA=cv(srcA),cB=cv(srcB);
function renderPush(dy:number){const idy=Math.round(dy);const out=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const di=(y*W+x)*4;let src,sy;if(y>=idy){src=cA;sy=y-idy;}else{src=cB;sy=y+(H-idy);}if(sy>=0&&sy<H){const si=(sy*W+x)*4;out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];out[di+3]=255;}}return out;}
function psnr(a:Uint8ClampedArray,b:Buffer){let mse=0;const n=Math.min(a.length,b.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a[i+c]-b[i+c];mse+=d*d;}mse/=(n*3/4);return mse===0?99:10*Math.log10(255*255/mse);}
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findLayer(ls:any[],id:number):any{for(const l of ls){if(l.id===id)return l;const r=findLayer(l.children,id);if(r)return r;}return null;}
const ky=findLayer(scene.layers,1999869897).transform.positionY.keyframes.map((k:any)=>({t:k.time.value/k.time.timescale,v:k.value,ott:k.outTangentTime,otv:k.outTangentValue,itt:k.inTangentTime,itv:k.inTangentValue}));
function cub(t:number,p0:number,p1:number,p2:number,p3:number){const mt=1-t;return mt*mt*mt*p0+3*mt*mt*t*p1+3*mt*t*t*p2+t*t*t*p3;}
function sT(x:number,a0:number,a1:number,a2:number,a3:number){let t=a3!==a0?(x-a0)/(a3-a0):.5;t=Math.max(0,Math.min(1,t));for(let i=0;i<80;i++){const c=cub(t,a0,a1,a2,a3),e=c-x;if(Math.abs(e)<1e-14)break;const mt=1-t;const d=3*mt*mt*(a1-a0)+6*mt*t*(a2-a1)+3*t*t*(a3-a2);if(Math.abs(d)<1e-16)break;t-=e/d;t=Math.max(0,Math.min(1,t));}return t;}
function seg(ts:number){for(let i=0;i<ky.length-1;i++)if(ky[i].t<=ts&&ts<=ky[i+1].t)return[ky[i],ky[i+1]];return[ky[ky.length-2],ky[ky.length-1]];}
function disp(ts:number,mode:string){if(ts<=ky[0].t)return -ky[0].v;if(ts>=ky[ky.length-1].t)return -ky[ky.length-1].v;const [a,b]=seg(ts);const t0=a.t,t3=b.t,v0=a.v,v3=b.v;const u=(ts-t0)/(t3-t0);
  if(mode==='timebezier'){const T1=t0+(a.ott||0),T2=t3+(b.itt||0),V1=v0+(a.otv||0),V2=v3+(b.itv||0);return -cub(sT(ts,t0,T1,T2,t3),v0,V1,V2,v3);}
  if(mode==='normalized'){const V1=v0+(a.otv||0),V2=v3+(b.itv||0);return -cub(u,v0,V1,V2,v3);}
  if(mode==='linear'){return -(v0+(v3-v0)*u);}
  return 0;}
const GT=path.resolve(import.meta.dirname,'ground-truth/Movements__Push');
const frames=fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
for(const mode of ['timebezier','normalized','linear']){
  let s=0,c=0;
  for(let i=0;i<frames.length;i++){const p=i/(frames.length-1);const gt=loadPNG(path.join(GT,frames[i])).data;s+=psnr(renderPush(disp(p*T_LAST,mode)),gt);c++;}
  console.log(`${mode}: ${(s/c).toFixed(2)}dB`);
}
