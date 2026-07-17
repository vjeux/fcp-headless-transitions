// Persistent engine render worker for the faithful fuzz oracle. Boots node/tsx + the A/B
// source images ONCE, then serves many render requests over stdin — avoiding the ~2s
// tsx cold-start per render that dominated the delta sweep (640 renders/primitive).
//
// Protocol (line-oriented, like fct _headless-worker):
//   stdin:  "<motrPath>\t<t>\t<outPath>\n"   -> render one frame
//           "QUIT\n"                          -> exit
//   stdout: "READY\n" once booted; then "OK\n" or "ERR <msg>\n" per request.
// A malformed .motr can throw; we catch per-request and reply ERR (the worker survives),
// so the caller only respawns on a hard crash (closed pipe / no reply).
if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import { createCanvas } from 'canvas';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

function loadPNG(p: string){ const png=PNG.sync.read(fs.readFileSync(p)); return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height); }
const imgA = loadPNG(process.env.FCT_RENDER_A_PNG || path.resolve('test/start.png'));
const imgB = loadPNG(process.env.FCT_RENDER_B_PNG || path.resolve('test/end.png'));

const rl = readline.createInterface({ input: process.stdin });
process.stdout.write('READY\n');
rl.on('line', (line: string) => {
  const s = line.trim();
  if (s === 'QUIT' || s === '') { if (s === 'QUIT') process.exit(0); return; }
  const parts = s.split('\t');
  if (parts.length < 3) { process.stdout.write('ERR bad request\n'); return; }
  const [motr, tStr, out] = parts;
  try {
    const t = parseFloat(tStr);
    const tr = createBenchTransition(motr, { outputWidth: 1920, outputHeight: 1080 });
    const r = tr.render(imgA, imgB, t);
    const cv = createCanvas(r.width, r.height); const cx = cv.getContext('2d');
    const id = cx.createImageData(r.width, r.height); id.data.set(r.data); cx.putImageData(id, 0, 0);
    fs.writeFileSync(out, cv.toBuffer('image/png'));
    process.stdout.write('OK\n');
  } catch (e: any) {
    process.stdout.write('ERR ' + String(e && e.message || e).slice(0, 300).replace(/\n/g, ' ') + '\n');
  }
});
