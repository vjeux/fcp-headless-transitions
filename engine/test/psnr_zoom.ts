if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const MOTR = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Blurs.localized/Zoom.localized/Zoom.motr';
const GT = path.resolve(import.meta.dirname, 'ground-truth/Blurs__Zoom');

function loadPNG(fp: string): ImageData {
  const png = PNG.sync.read(fs.readFileSync(fp));
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}
function psnr(a: ImageData, b: ImageData): number {
  const n = Math.min(a.data.length, b.data.length);
  let mse = 0;
  for (let i = 0; i < n; i += 4) for (let c = 0; c < 3; c++) { const d = a.data[i+c]-b.data[i+c]; mse += d*d; }
  mse /= (n*3/4);
  return mse === 0 ? Infinity : 10*Math.log10(255*255/mse);
}

const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));
const t = createTransition(fs.readFileSync(MOTR, 'utf-8'));
const gtFrames = fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
let sum=0, cnt=0;
for (let i=0;i<gtFrames.length;i++){
  const p = gtFrames.length>1 ? i/(gtFrames.length-1):0;
  const gt = loadPNG(path.join(GT, gtFrames[i]));
  const r = t.render(imgA, imgB, p);
  const v = psnr(r, gt);
  console.log(`  frame ${i} (p=${p.toFixed(3)}): ${isFinite(v)?v.toFixed(2)+'dB':'inf'}  [${r.width}x${r.height} vs ${gt.width}x${gt.height}]`);
  if(isFinite(v)){sum+=v;cnt++;}
}
console.log(`\nZoom avg PSNR: ${(sum/cnt).toFixed(2)}dB over ${cnt} frames`);
