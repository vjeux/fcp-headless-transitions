if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class ImageData { data:any;width:number;height:number;constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };}
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function loadPNG(p:string){const png=PNG.sync.read(fs.readFileSync(p));return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data),png.width,png.height);}
function savePNG(img:any,p:string){const png=new PNG({width:img.width,height:img.height});png.data=Buffer.from(img.data.buffer,img.data.byteOffset,img.data.byteLength);fs.writeFileSync(p,PNG.sync.write(png));}
const map=JSON.parse(fs.readFileSync('/tmp/slug_map.json','utf-8'));
const HOME=process.env.HOME!;
const imgA=loadPNG(path.resolve('test/start.png')),imgB=loadPNG(path.resolve('test/end.png'));
const slugs=Object.keys(map).sort();
const only=process.env.ONLY; // optional single slug for parallelism
for(const slug of slugs){
  if(only && slug!==only) continue;
  const motr=map[slug]; if(!motr){console.error(`SKIP ${slug} (no motr)`);continue;}
  const gtDir=path.join(HOME,'fct-gt-cache',slug);
  const gtFrames=fs.readdirSync(gtDir).filter(f=>f.endsWith('.png')).sort();
  const n=gtFrames.length; if(n<2){console.error(`SKIP ${slug} (${n} frames)`);continue;}
  const outDir=`/tmp/engine-frames/${slug}`; fs.mkdirSync(outDir,{recursive:true});
  try{
    const tr=createBenchTransition(motr,{outputWidth:1920,outputHeight:1080});
    for(let i=0;i<n;i++){ const r=tr.render(imgA,imgB,i/(n-1)); savePNG(r,path.join(outDir,`frame_${String(i).padStart(4,'0')}.png`)); }
    console.error(`OK ${slug} (${n})`);
  }catch(e:any){console.error(`ERR ${slug}: ${e.message}`);}
}
