if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class { constructor(public data:any,public width:number,public height?:number){} };}
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
import { parseMotr } from '../src/parser/index.js'; import { evaluate } from '../src/evaluator/index.js';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return {data:p.data as Buffer,w:p.width,h:p.height};}
const srcA=loadPNG(path.resolve(import.meta.dirname,'start.png')),srcB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const W=1920,H=1080,ox=(W-srcA.w)>>1,oy=(H-srcA.h)>>1;
function cv(s:any){const o=new Uint8ClampedArray(W*H*4);for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const si=(y*s.w+x)*4,di=((y+oy)*W+(x+ox))*4;o[di]=s.data[si];o[di+1]=s.data[si+1];o[di+2]=s.data[si+2];o[di+3]=255;}return o;}
const cA=cv(srcA),cB=cv(srcB);
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr','utf-8'));
const T_LAST=200200/120000;
function findEval(ev:any,id:number):any{if(ev.layer.id===id)return ev;for(const c of ev.children){const r=findEval(c,id);if(r)return r;}return null;}
function bezDY(p:number){const e=evaluate(scene,p*T_LAST);const g=e.layers.map((l:any)=>findEval(l,1999869838)).find(Boolean);return g.worldTransform[13];}
function renderPush(dy:number){const out=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const di=(y*W+x)*4;let src,sy;if(y>=dy){src=cA;sy=y-dy;}else{src=cB;sy=y+(H-dy);}if(sy>=0&&sy<H){const si=(sy*W+x)*4;out[di]=src[si];out[di+1]=src[si+1];out[di+2]=src[si+2];out[di+3]=255;}}return out;}
const p=26/49; const dy=Math.round(bezDY(p));
const buf=renderPush(dy);
const png=new PNG({width:W,height:H}); png.data=Buffer.from(buf.buffer,0,buf.length); fs.writeFileSync('/tmp/pure_f26.png',PNG.sync.write(png));
console.log('dy=',dy,'wrote /tmp/pure_f26.png');
