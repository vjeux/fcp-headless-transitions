if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class ImageData { data:any;width:number;height:number;constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };}
import { createBenchTransition, loadGT } from './gt-cache.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function loadPNG(p:string){const png=PNG.sync.read(fs.readFileSync(p));return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data),png.width,png.height);}
function psnr(a:any,b:any){const n=Math.min(a.data.length,b.data.length);let m=0,c2=0;for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];m+=d*d;c2++;}m/=c2;return m===0?99:10*Math.log10(65025/m);}
const D="/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized";
const imgA=loadPNG(path.resolve('test/start.png')),imgB=loadPNG(path.resolve('test/end.png'));
const checks:[string,string][]=[
  ['Objects__Leaves',D+'/Objects.localized/Leaves.localized/Leaves.motr'],
  ['Objects__Veil',D+'/Objects.localized/Veil.localized/Veil.motr'],
  ['Replicator-Clones__Concentric',D+'/Replicator:Clones.localized/Concentric.localized/Concentric.motr'],
  ['Replicator-Clones__Vertigo',D+'/Replicator:Clones.localized/Vertigo.localized/Vertigo.motr'],
  ['Stylized__Diagonal',D+'/Stylized.localized/Nature.localized/Diagonal.localized/Diagonal.motr'],
  ['Stylized__Glide',D+'/Stylized.localized/Nature.localized/Glide.localized/Glide.motr'],
];
for(const [slug,motr] of checks){try{const gtDir=path.join(process.env.HOME!,'fct-gt-cache',slug);const frames=fs.readdirSync(gtDir).filter(f=>f.endsWith('.png')).sort();const tr=createBenchTransition(motr,{outputWidth:1920,outputHeight:1080});let sum=0;for(let i=0;i<frames.length;i++){const gt=loadGT(path.join(gtDir,frames[i]));const r=tr.render(imgA,imgB,i/(frames.length-1));sum+=psnr(r,gt);}console.error(`${slug}: ${(sum/frames.length).toFixed(2)}dB`);}catch(e:any){console.error(`${slug}: ERR ${e.message}`);}}
