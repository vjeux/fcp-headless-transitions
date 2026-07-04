/**
 * Per-transition verification against headless FCP ground truth.
 * Usage: npx tsx test/verify.ts <slug> <relative-motr-path> [gtDir]
 * Reports per-frame PSNR (all 8 frames) at 1920x1080 conform.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(d: Uint8ClampedArray, w: number, h?: number){this.data=d;this.width=w;this.height=h??(d.length/4/w);}
  };
}
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function load(p:string){const g=PNG.sync.read(fs.readFileSync(p));return new ImageData(new Uint8ClampedArray(g.data),g.width,g.height);}
function psnr(a:ImageData,b:ImageData){let m=0;const n=Math.min(a.data.length,b.data.length);for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];m+=d*d;}m/=(n*3/4);return m===0?99:10*Math.log10(255*255/m);}
const TRANS='/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/';
const slug=process.argv[2], rel=process.argv[3];
const gtDir=process.argv[4] || `/tmp/gt_all/${slug}`;
const a=load(path.resolve(import.meta.dirname,'start.png'));
const b=load(path.resolve(import.meta.dirname,'end.png'));
const tr=createTransition(fs.readFileSync(TRANS+rel,'utf-8'),{outputWidth:1920,outputHeight:1080});
const gtf=fs.readdirSync(gtDir).filter(f=>f.endsWith('.png')).sort();
console.log(`${slug} (native ${tr.width}x${tr.height}), ${gtf.length} frames:`);
let sum=0, min=99;
for(let i=0;i<gtf.length;i++){
  const gt=load(path.join(gtDir,gtf[i]));
  const r=tr.render(a,b,i/(gtf.length-1));
  const p=psnr(r,gt); sum+=p; min=Math.min(min,p);
  const bar='#'.repeat(Math.max(0,Math.round(p/2)));
  console.log(`  f${i} p=${(i/(gtf.length-1)).toFixed(2)}: ${p.toFixed(1).padStart(5)}dB ${bar}`);
}
console.log(`  MEAN ${(sum/gtf.length).toFixed(1)}dB, MIN ${min.toFixed(1)}dB`);
