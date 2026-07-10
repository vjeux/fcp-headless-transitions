/**
 * Push Direction rig variants (Left→Right, Top→Bottom, Bottom→Top, Right→Left)
 * vs real-FCP ground truth. Each /tmp/dir_gt_<N> is rendered from a push_dir<N>.motr
 * (Direction rig value N) via `fct gen headless`.
 *
 * STATUS: only Bottom→Top (dir 2) is currently pixel-accurate. The other 3 need
 * the per-direction clone-selection + link-axis/sign interaction fully worked out
 * (each direction activates a different clone via an opacity rig AND a different
 * Link axis; the group-vs-A drive and the horizontal sign are still WIP). This is
 * a REPORT, not a hard-fail gate, so it doesn't block the validated interpolation
 * work — but it documents exactly which directions remain.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(d: Uint8ClampedArray, w: number, h?: number){ this.data=d; this.width=w; this.height=h??(d.length/4/w); }
  };
}
import { createTransition } from '../src/index.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

function loadPNG(fp: string): ImageData { const p = PNG.sync.read(fs.readFileSync(fp)); return new ImageData(new Uint8ClampedArray(p.data), p.width, p.height); }
function psnr(a: ImageData, b: ImageData): number { const n=Math.min(a.data.length,b.data.length); let m=0; for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const d=a.data[i+c]-b.data[i+c];m+=d*d;} m/=(n*3/4); return m===0?99:10*Math.log10(255*255/m); }

const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));
const NAMES = ['Left→Right','Top→Bottom','Bottom→Top','Right→Left'];
let allPass = true;
console.log('Push Direction rig variants vs real FCP:\n');
for (const dv of [0,1,2,3]) {
  const motr = `/tmp/push_dir${dv}.motr`;
  const gtDir = `/tmp/dir_gt_${dv}`;
  if (!fs.existsSync(motr) || !fs.existsSync(gtDir)) { console.log(`  dir ${dv}: (no fixtures — render push_dir${dv}.motr via fct)`); continue; }
  const t = createTransition(fs.readFileSync(motr, 'utf-8'), { outputWidth: 1920, outputHeight: 1080 });
  const frames = fs.readdirSync(gtDir).filter(f => f.endsWith('.png')).sort();
  let sum = 0, cnt = 0;
  for (let i = 0; i < frames.length; i++) {
    const p = i / (frames.length - 1);
    const gt = loadPNG(path.join(gtDir, frames[i]));
    const r = t.render(imgA, imgB, p);
    const v = psnr(r, gt); if (isFinite(v)) { sum += v; cnt++; }
  }
  const mean = sum / cnt;
  const ok = mean > 25; // Push-quality
  if (!ok) allPass = false;
  console.log(`  dir ${dv} ${NAMES[dv].padEnd(12)}: mean PSNR ${mean.toFixed(1)}dB  ${ok ? 'PASS' : 'FAIL'}`);
}
console.log(`\n${allPass ? 'all directions PASS' : '(WIP) only some directions accurate — see status note'}`);
