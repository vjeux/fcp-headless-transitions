/**
 * Full 65-transition benchmark scoreboard.
 *
 * For every .motr transition template shipped inside Final Cut Pro, this harness:
 *   1. Loads the 24-frame ground-truth frames rendered by the headless FCP engine
 *      (tools/render_gt.py) into /tmp/gt_all/<slug>/frame_XXXX.png.
 *   2. Runs the TypeScript engine's createTransition pipeline over the SAME 24
 *      progress points (i/(N-1)) at native scene resolution.
 *   3. Computes mean PSNR (dB) across all 24 frames vs the GT frames.
 *
 * Emits docs/SCOREBOARD.md: table sorted by PSNR ascending (worst first), plus
 * the overall mean PSNR and pass/partial/fail bucket counts.
 *
 * Run with:  npx tsx test/scoreboard.ts       (ts-node/esm crashes on Node 24)
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

// Canonical ground-truth cache (deterministic; generated once, never per-run).
// Override with FCT_GT_CACHE. GT frames are loaded via loadGT (native decode once
// → raw .rgba sidecar, then zero-decode reads) so repeated benchmark runs are fast.
const GT_ROOT = process.env.FCT_GT_CACHE
  || path.join(process.env.HOME || '', 'fct-gt-cache');
// FCP's shipped transition templates — the source of truth for the 65 set.
const TRANS_DIR = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized';
const DOCS_OUT = path.resolve(import.meta.dirname, '../../docs/SCOREBOARD.md');

// slug must match tools/gen_all_gt.sh: `${cat}__${name}` with
//   ' '->_ , '/'->- , ':'->- , '&'->and
function slugify(cat: string, name: string): string {
  return `${cat}__${name}`.replace(/ /g, '_').replace(/\//g, '-').replace(/:/g, '-').replace(/&/g, 'and');
}

function findMotrs(dir: string): Array<{ cat: string; name: string; path: string }> {
  const out: Array<{ cat: string; name: string; path: string }> = [];
  const walk = (d: string, rel: string[]) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full, [...rel, e.name.replace('.localized', '')]);
      else if (e.name.endsWith('.motr')) {
        const name = e.name.replace('.motr', '');
        const cat = rel[0] || '?';
        out.push({ cat, name, path: full });
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
  for (let i = 0; i < n; i += 4)
    for (let c = 0; c < 3; c++) { const d = a.data[i + c] - b.data[i + c]; mse += d * d; }
  mse /= (n * 3 / 4);
  return mse === 0 ? 99 : 10 * Math.log10(255 * 255 / mse);
}

const motrs = findMotrs(TRANS_DIR);
const slugToMotr = new Map<string, string>();
for (const m of motrs) slugToMotr.set(slugify(m.cat, m.name), m.path);

const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));

type Row = { slug: string; avg: number; frames: number; sampled?: number; err?: string };
const results: Row[] = [];

// Some transitions are pathologically slow in the pure-JS compositor:
//  - 360° transitions render at 4K-equirect native (e.g. 4096×2160), ~30-50s/frame.
//  - Movements/Pinwheel (~150s/frame) and Movements/Rotate (full-frame rotation)
//    OOM at 24 frames under memory pressure.
// Scoring all 24 frames would take ~20 min each. We sample a reduced, evenly-spaced
// set of progress points for these heavy transitions (noted in the scoreboard); the
// measurement (mean PSNR at those points, engine conformed to GT's native res) is
// otherwise identical.
const HEAVY = new Set([
  ...[...slugToMotr.keys()].filter(s => s.startsWith('360°__')),
  'Movements__Pinwheel',
  'Movements__Rotate',
]);
const HEAVY_SAMPLES = 3;

// Iterate fast (non-heavy) transitions FIRST so the bulk of results stream quickly,
// then the slow heavy ones last (a slow-tail crash can't lose the fast results, and
// partial progress is visible early).
const orderedSlugs = [...slugToMotr.keys()].sort(
  (a, b) => (HEAVY.has(a) ? 1 : 0) - (HEAVY.has(b) ? 1 : 0) || a.localeCompare(b)
);
for (const slug of orderedSlugs) {
  const motrPath = slugToMotr.get(slug)!;
  const gtDir = path.join(GT_ROOT, slug);
  if (!fs.existsSync(gtDir)) { results.push({ slug, avg: 0, frames: 0, err: 'no GT dir' }); continue; }
  const gtFrames = fs.readdirSync(gtDir).filter(f => f.endsWith('.png')).sort();
  if (gtFrames.length === 0) { results.push({ slug, avg: 0, frames: 0, err: 'no GT frames' }); continue; }
  const t0 = Date.now();
  const heavy = HEAVY.has(slug);
  process.stderr.write(`[${new Date().toISOString()}] scoring ${slug}${heavy ? ' (heavy/sampled)' : ''} ...\n`);
  try {
    // Render engine conformed to GT's 1920×1080 native resolution so PSNR is valid.
    const tr = createTransition(fs.readFileSync(motrPath, 'utf-8'), { outputWidth: 1920, outputHeight: 1080 });
    // Choose which GT frame indices to score. Full set for normal transitions;
    // an evenly-spaced subset for the 4K-equirect 360° transitions (cost control).
    let idxs: number[];
    if (heavy && gtFrames.length > HEAVY_SAMPLES) {
      idxs = [];
      for (let k = 0; k < HEAVY_SAMPLES; k++) {
        idxs.push(Math.round((k * (gtFrames.length - 1)) / (HEAVY_SAMPLES - 1)));
      }
      idxs = [...new Set(idxs)];
    } else {
      idxs = Array.from({ length: gtFrames.length }, (_, i) => i);
    }
    let sum = 0, cnt = 0, dimMiss = 0;
    for (const i of idxs) {
      const prog = gtFrames.length > 1 ? i / (gtFrames.length - 1) : 0;
      const gt = loadGT(path.join(gtDir, gtFrames[i]));
      const r = tr.render(imgA, imgB, prog);
      if (r.width !== gt.width || r.height !== gt.height) { dimMiss++; continue; }
      sum += psnr(r, gt); cnt++;
    }
    if (cnt === 0) results.push({ slug, avg: 0, frames: 0, err: `dim mismatch (${dimMiss})` });
    else results.push({ slug, avg: sum / cnt, frames: gtFrames.length, sampled: cnt });
  } catch (e: any) {
    results.push({ slug, avg: 0, frames: 0, err: e.message });
  }
  process.stderr.write(`    done ${slug} in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
}

results.sort((a, b) => a.avg - b.avg);

const scored = results.filter(r => !r.err);
const mean = scored.length ? scored.reduce((s, r) => s + r.avg, 0) / scored.length : 0;
const pass = scored.filter(r => r.avg > 30).length;
const partial = scored.filter(r => r.avg >= 20 && r.avg <= 30).length;
const fail = scored.filter(r => r.avg < 20).length;
const errored = results.filter(r => r.err);

// ---- console ----
console.log('Full 65-transition benchmark scoreboard (mean PSNR over 24 frames):\n');
for (const r of results) {
  const bucket = r.err ? 'ERR' : r.avg > 30 ? 'PASS' : r.avg >= 20 ? 'PART' : 'FAIL';
  console.log(`  ${bucket.padEnd(4)} ${r.err ? '  n/a' : r.avg.toFixed(1).padStart(5)}dB  ${r.slug}${r.err ? '  [' + r.err + ']' : ''}`);
}
console.log(`\n  MEAN PSNR: ${mean.toFixed(2)}dB across ${scored.length} scored transitions`);
console.log(`  PASS >30dB: ${pass}   PARTIAL 20-30dB: ${partial}   FAIL <20dB: ${fail}   ERROR: ${errored.length}`);

// ---- markdown ----
const bucketOf = (r: Row) => r.err ? 'error' : r.avg > 30 ? 'pass' : r.avg >= 20 ? 'partial' : 'fail';
const lines: string[] = [];
lines.push('# FCP Transition Benchmark Scoreboard');
lines.push('');
lines.push('Mean PSNR of the TypeScript engine vs headless Final Cut Pro ground truth, over up to **24 frames** per transition (progress `i/23`, `i=0..23`). Engine output is conformed to GT native 1920×1080. Source images: `images/start.jpg` / `images/end.jpg`. Sorted by PSNR ascending (worst first). 360° transitions render at 4K-equirect native (~30–50s/frame in JS), so they are scored on 3 evenly-spaced progress points (0, 0.5, 1.0) rather than all 24 (noted in the Sampled column).');
lines.push('');
lines.push(`- **Mean PSNR:** ${mean.toFixed(2)} dB across ${scored.length} scored transitions`);
lines.push(`- **Pass (>30 dB):** ${pass}`);
lines.push(`- **Partial (20–30 dB):** ${partial}`);
lines.push(`- **Fail (<20 dB):** ${fail}`);
if (errored.length) lines.push(`- **GT/error (unscored):** ${errored.length}`);
lines.push('');
lines.push('| # | Transition | Mean PSNR (dB) | Frames | Sampled | Bucket |');
lines.push('|---|------------|---------------:|-------:|--------:|--------|');
results.forEach((r, i) => {
  const val = r.err ? `n/a (${r.err})` : r.avg.toFixed(2);
  const sampled = r.err ? '0' : String(r.sampled ?? r.frames);
  lines.push(`| ${i + 1} | ${r.slug} | ${val} | ${r.frames} | ${sampled} | ${bucketOf(r)} |`);
});
lines.push('');
fs.mkdirSync(path.dirname(DOCS_OUT), { recursive: true });
fs.writeFileSync(DOCS_OUT, lines.join('\n'));
console.log(`\n  wrote ${DOCS_OUT}`);
