// PERSISTENT engine render worker for the minimizer's hot loop.
//
// WHY: the ddmin loop does hundreds of engine renders. The one-shot `_fct_render_one.ts`
// pays Node startup + tsx/esbuild TS transpile of the whole engine import graph + module
// init on EVERY trial (~1-2s each) — that startup dominates; the actual render is ~10-50ms.
// This worker boots ONCE, then reads render requests off stdin and streams results, exactly
// like the FCP-headless persistent worker (fct _headless-worker). ~10-50x fewer startups.
//
// Protocol (line-oriented, tab-separated), mirroring the headless worker:
//   stdout: "READY"                        once the engine graph is loaded + input PNGs read
//   stdin : "<motrAbsPath>\t<frameIdx>\t<nframes>\t<outAbsPath>\n"   one request per line
//   stdout: "OK"  after the frame is written, or "ERR <msg>" on any failure (a parse/render
//           throw is CAUGHT and reported so a bad reduced doc never kills the worker — the
//           minimizer just marks that trial invalid and continues).
//   stdin : "QUIT\n"  -> clean exit.
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { createTransition } from '../src/index.js';
import { makeMediaResolver } from './media-resolver.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs'; import path from 'node:path'; import readline from 'node:readline';

function loadPNG(p: string){ const png=PNG.sync.read(fs.readFileSync(p)); return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height); }

// Boot ONCE: load the input plates a single time and reuse them across every render.
const imgA = loadPNG(path.resolve('test/start.png'));
const imgB = loadPNG(path.resolve('test/end.png'));

function renderOne(motrPath: string, fi: number, N: number, out: string): void {
  const xml = fs.readFileSync(motrPath, 'utf-8');
  const tr = createTransition(xml, { outputWidth: 1920, outputHeight: 1080, mediaResolver: makeMediaResolver(motrPath) });
  const r = tr.render(imgA, imgB, fi / N);
  const cv = createCanvas(r.width, r.height); const cx = cv.getContext('2d');
  const id = cx.createImageData(r.width, r.height); id.data.set(r.data); cx.putImageData(id, 0, 0);
  fs.writeFileSync(out, cv.toBuffer('image/jpeg', { quality: 0.9 }));
}

const rl = readline.createInterface({ input: process.stdin });
process.stdout.write('READY\n');
rl.on('line', (line: string) => {
  const s = line.trim();
  if (s === 'QUIT') { process.exit(0); }
  if (s === '') return;
  const parts = s.split('\t');
  if (parts.length < 4) { process.stdout.write('ERR bad-request\n'); return; }
  const [motrPath, fiStr, nStr, out] = parts;
  try {
    if (fs.existsSync(out)) { try { fs.unlinkSync(out); } catch {} }
    renderOne(motrPath, parseInt(fiStr, 10), parseInt(nStr, 10), out);
    process.stdout.write(fs.existsSync(out) ? 'OK\n' : 'ERR no-output\n');
  } catch (e: any) {
    process.stdout.write('ERR ' + String(e && e.message ? e.message : e).replace(/[\r\n\t]/g, ' ').slice(0, 200) + '\n');
  }
});
rl.on('close', () => process.exit(0));
