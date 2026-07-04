/**
 * Comprehensive accuracy benchmark: engine vs headless FCP ground truth.
 * Auto-discovers all ground-truth dirs in /tmp/gt_all and measures per-frame PSNR.
 */
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

const GT_ROOT = '/tmp/gt_all';
const TRANS_DIR = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized';

// Build slug → motr path map by scanning the transitions dir the same way run_all.py does.
function slugify(cat: string, name: string): string {
  return `${cat}__${name}`.replace(/ /g, '_').replace(/\//g, '-').replace(/:/g, '-').replace(/&/g, 'and');
}
function findMotrs(dir: string): Array<{cat:string,name:string,path:string}> {
  const out: Array<{cat:string,name:string,path:string}> = [];
  const walk = (d: string, rel: string[]) => {
    for (const e of fs.readdirSync(d, {withFileTypes:true})) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full, [...rel, e.name.replace('.localized','')]);
      else if (e.name.endsWith('.motr')) {
        const name = e.name.replace('.motr','');
        const cat = rel[0] || '?';
        out.push({cat, name, path: full});
      }
    }
  };
  walk(dir, []);
  return out;
}

function loadPNG(p: string): ImageData {
  const png = PNG.sync.read(fs.readFileSync(p));
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}
function psnr(a: ImageData, b: ImageData): number {
  const n = Math.min(a.data.length, b.data.length);
  let mse = 0;
  for (let i = 0; i < n; i += 4) for (let c = 0; c < 3; c++) { const d = a.data[i+c]-b.data[i+c]; mse += d*d; }
  mse /= (n*3/4);
  return mse === 0 ? 99 : 10*Math.log10(255*255/mse);
}

const motrs = findMotrs(TRANS_DIR);
const slugToMotr = new Map<string,string>();
for (const m of motrs) slugToMotr.set(slugify(m.cat, m.name), m.path);

const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));

const dirs = fs.readdirSync(GT_ROOT).filter(d => {
  try { return fs.statSync(path.join(GT_ROOT, d)).isDirectory(); } catch { return false; }
});

const results: Array<{slug:string, avg:number, frames:number, err?:string}> = [];

for (const slug of dirs.sort()) {
  const motrPath = slugToMotr.get(slug);
  if (!motrPath) { results.push({slug, avg:0, frames:0, err:'no motr'}); continue; }
  const gtFrames = fs.readdirSync(path.join(GT_ROOT, slug)).filter(f=>f.endsWith('.png')).sort();
  if (gtFrames.length === 0) { results.push({slug, avg:0, frames:0, err:'no frames'}); continue; }
  try {
    const tr = createTransition(fs.readFileSync(motrPath, 'utf-8'), { outputWidth: 1920, outputHeight: 1080 });
    let sum = 0, cnt = 0;
    const idxs = [0, Math.floor((gtFrames.length-1)/2), gtFrames.length-1];
    for (const i of idxs) {
      const prog = gtFrames.length > 1 ? i/(gtFrames.length-1) : 0;
      const gt = loadPNG(path.join(GT_ROOT, slug, gtFrames[i]));
      const r = tr.render(imgA, imgB, prog);
      if (r.width !== gt.width || r.height !== gt.height) continue;
      sum += psnr(r, gt); cnt++;
    }
    results.push({slug, avg: cnt?sum/cnt:0, frames: cnt});
  } catch (e:any) {
    results.push({slug, avg:0, frames:0, err: e.message});
  }
}

results.sort((a,b)=>a.avg-b.avg);
let total = 0, counted = 0;
for (const r of results) {
  const q = r.avg>=30?'★★★':r.avg>=22?'★★':r.avg>=15?'★':'·';
  console.log(`  ${q} ${r.avg.toFixed(1).padStart(5)}dB  ${r.slug}${r.err?' ['+r.err+']':''}`);
  if (!r.err) { total += r.avg; counted++; }
}
console.log(`\n  MEAN PSNR: ${(total/counted).toFixed(2)}dB across ${counted} transitions`);
