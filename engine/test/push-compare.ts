/** Focused Push ground-truth comparison against the 50-frame clean render. */
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

const MOTR = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr';
const GT = path.resolve(import.meta.dirname, 'ground-truth/Movements__Push');

function loadPNG(fp: string): ImageData {
  const png = PNG.sync.read(fs.readFileSync(fp));
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}
function savePNG(img: ImageData, fp: string) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data.buffer, img.data.byteOffset, img.data.length);
  fs.writeFileSync(fp, PNG.sync.write(png));
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
const t = createTransition(fs.readFileSync(MOTR, 'utf-8'), { outputWidth: 1920, outputHeight: 1080 });
const frames = fs.readdirSync(GT).filter(f=>f.endsWith('.png')).sort();
let sum=0, cnt=0, worst:[number,number][]=[];
const dump = process.argv.includes('--dump');
if (dump) fs.mkdirSync('/tmp/push_engine', {recursive:true});
for (let i=0;i<frames.length;i++){
  const p = frames.length>1 ? i/(frames.length-1) : 0;
  const gt = loadPNG(path.join(GT, frames[i]));
  const r = t.render(imgA, imgB, p);
  if (dump) savePNG(r, `/tmp/push_engine/frame_${String(i).padStart(4,'0')}.png`);
  const v = psnr(r, gt);
  if (isFinite(v)) { sum+=v; cnt++; }
  worst.push([i, v]);
}
worst.sort((a,b)=>a[1]-b[1]);
console.log(`Push: mean PSNR ${(sum/cnt).toFixed(2)}dB over ${cnt} frames`);
console.log('Worst frames:', worst.slice(0,6).map(([i,v])=>`f${i}=${v.toFixed(1)}`).join(' '));
console.log('Best frames: ', worst.slice(-4).map(([i,v])=>`f${i}=${v.toFixed(1)}`).join(' '));
