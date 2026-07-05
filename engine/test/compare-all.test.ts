/**
 * Multi-transition ground-truth comparison.
 * Measures PSNR for every transition that has ground-truth frames generated.
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
import { loadGT } from './gt-cache.js';
import fs from 'node:fs';
import path from 'node:path';

// Canonical ground-truth cache (deterministic; generated once into a stable
// shared location, never regenerated per run). Falls back to the local
// test/ground-truth dir if the cache is absent. Override with FCT_GT_CACHE.
const GT_CACHE = process.env.FCT_GT_CACHE
  || path.join(process.env.HOME || '', 'fct-gt-cache');
const GT_ROOT = fs.existsSync(GT_CACHE)
  ? GT_CACHE
  : path.resolve(import.meta.dirname, 'ground-truth');
const MOTR_ROOT = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized';

// Map ground-truth dir name → .motr path
const MOTR_PATHS: Record<string, string> = {
  'Blurs__Gaussian': `${MOTR_ROOT}/Blurs.localized/Gaussian.localized/Gaussian.motr`,
  'Blurs__Directional': `${MOTR_ROOT}/Blurs.localized/Directional.localized/Directional.motr`,
  'Blurs__Radial': `${MOTR_ROOT}/Blurs.localized/Radial.localized/Radial.motr`,
  'Lights__Bloom': `${MOTR_ROOT}/Lights.localized/Bloom.localized/Bloom.motr`,
  'Blurs__Zoom': `${MOTR_ROOT}/Blurs.localized/Zoom.localized/Zoom.motr`,
};

function loadPNG(filepath: string): ImageData {
  const png = PNG.sync.read(fs.readFileSync(filepath));
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}

function psnr(a: ImageData, b: ImageData): number {
  const n = Math.min(a.data.length, b.data.length);
  let mse = 0;
  for (let i = 0; i < n; i += 4) {
    for (let c = 0; c < 3; c++) {
      const d = a.data[i + c] - b.data[i + c];
      mse += d * d;
    }
  }
  mse /= (n * 3 / 4);
  return mse === 0 ? Infinity : 10 * Math.log10(255 * 255 / mse);
}

function runTests() {
  let pass = 0, fail = 0;
  console.log('Multi-transition ground-truth comparison:\n');

  const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
  const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));

  const dirs = fs.existsSync(GT_ROOT)
    ? fs.readdirSync(GT_ROOT).filter(d => fs.statSync(path.join(GT_ROOT, d)).isDirectory())
    : [];

  for (const dir of dirs) {
    const motrPath = MOTR_PATHS[dir];
    if (!motrPath || !fs.existsSync(motrPath)) {
      console.log(`  ⊘ ${dir}: no .motr mapping`);
      continue;
    }

    const gtFrames = fs.readdirSync(path.join(GT_ROOT, dir)).filter(f => f.endsWith('.png')).sort();
    if (gtFrames.length === 0) continue;

    const transition = createTransition(fs.readFileSync(motrPath, 'utf-8'));
    let sumPSNR = 0, count = 0, finiteCount = 0;

    for (let i = 0; i < gtFrames.length; i++) {
      const progress = gtFrames.length > 1 ? i / (gtFrames.length - 1) : 0;
      const gt = loadGT(path.join(GT_ROOT, dir, gtFrames[i]));
      const rendered = transition.render(imgA, imgB, progress);
      if (rendered.width !== gt.width || rendered.height !== gt.height) continue;
      const p = psnr(rendered, gt);
      if (isFinite(p)) { sumPSNR += p; finiteCount++; }
      count++;
    }

    const avg = finiteCount > 0 ? sumPSNR / finiteCount : Infinity;
    const quality = avg > 35 ? '★★★' : avg > 25 ? '★★' : avg > 15 ? '★' : '·';
    console.log(`  ${quality} ${dir}: avg PSNR ${isFinite(avg) ? avg.toFixed(1) + 'dB' : '∞'} (${count} frames)`);
    pass++;
  }

  console.log(`\n${pass} transitions compared, ${fail} errors`);
}

runTests();
