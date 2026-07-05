if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(d: Uint8ClampedArray, w: number, h?: number){ this.data=d; this.width=w; this.height=h??(d.length/4/w); }
  };
}
import { createTransition } from '../src/index.js';
import { loadGT } from './gt-cache.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const GT = path.join(process.env.HOME||'', 'fct-gt-cache');
const MROOT = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized';
function loadPNG(fp:string){const p=PNG.sync.read(fs.readFileSync(fp));return new ImageData(new Uint8ClampedArray(p.data),p.width,p.height);}
function psnr(a:ImageData,b:ImageData){const n=Math.min(a.data.length,b.data.length);let m=0;for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];m+=d*d;}m/=(n*3/4);return m===0?99:10*Math.log10(255*255/m);}

const TARGETS: Record<string,string> = {
  'Replicator-Clones__Video_Wall': `${MROOT}/Replicator:Clones.localized/Video Wall.localized/Video Wall.motr`,
  'Replicator-Clones__3D_Rectangle': `${MROOT}/Replicator:Clones.localized/3D Rectangle.localized/3D Rectangle.motr`,
  'Replicator-Clones__Concentric': `${MROOT}/Replicator:Clones.localized/Concentric.localized/Concentric.motr`,
  'Replicator-Clones__Combo_Spin': `${MROOT}/Replicator:Clones.localized/Combo Spin.localized/Combo Spin.motr`,
  'Movements__Color_Planes': `${MROOT}/Movements.localized/Color Planes.localized/Color Planes.motr`,
  'Movements__Fall': `${MROOT}/Movements.localized/Fall.localized/Fall.motr`,
  'Movements__Flip': `${MROOT}/Movements.localized/Flip.localized/Flip.motr`,
};
const imgA = loadPNG(path.resolve(import.meta.dirname,'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname,'end.png'));
const only = process.argv[2];
for (const [slug,motr] of Object.entries(TARGETS)) {
  if (only && !slug.toLowerCase().includes(only.toLowerCase())) continue;
  if (!fs.existsSync(motr)) { console.log(`${slug}: NO MOTR`); continue; }
  const gtDir = path.join(GT, slug);
  if (!fs.existsSync(gtDir)) { console.log(`${slug}: NO GT`); continue; }
  const t = createTransition(fs.readFileSync(motr,'utf-8'), {outputWidth:1920,outputHeight:1080});
  const frames = fs.readdirSync(gtDir).filter(f=>f.endsWith('.png')).sort();
  let sum=0,cnt=0; const per:number[]=[];
  for (let i=0;i<frames.length;i++){
    const p=i/(frames.length-1);
    const gt=loadGT(path.join(gtDir,frames[i]));
    const r=t.render(imgA,imgB,p);
    const v=psnr(r,gt); if(isFinite(v)){sum+=v;cnt++;} per.push(v);
  }
  console.log(`${slug.padEnd(36)}: ${(sum/cnt).toFixed(2)}dB  (f0=${per[0].toFixed(1)} f11=${per[11]?.toFixed(1)} f23=${per[23]?.toFixed(1)})`);
}
