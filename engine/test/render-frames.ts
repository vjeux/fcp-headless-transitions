/**
 * Render engine output frames to PNG files for visual inspection.
 * Usage: npx tsx test/render-frames.ts <motr-path> <outdir> [numFrames]
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

function loadPNG(filepath: string): ImageData {
  const png = PNG.sync.read(fs.readFileSync(filepath));
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}

function savePNG(img: ImageData, filepath: string): void {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data.buffer);
  fs.writeFileSync(filepath, PNG.sync.write(png));
}

const motrPath = process.argv[2];
const outDir = process.argv[3];
const numFrames = parseInt(process.argv[4] || '12', 10);

if (!motrPath || !outDir) {
  console.error('Usage: render-frames.ts <motr-path> <outdir> [numFrames]');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const xml = fs.readFileSync(motrPath, 'utf-8');
const transition = createTransition(xml);

// Load source images (use test PNGs)
const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));

console.log(`Rendering ${numFrames} frames of ${path.basename(motrPath)} (${transition.width}x${transition.height})`);

for (let i = 0; i < numFrames; i++) {
  const progress = numFrames > 1 ? i / (numFrames - 1) : 0;
  const frame = transition.render(imgA, imgB, progress);
  const outPath = path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`);
  savePNG(frame, outPath);
}

console.log(`Wrote ${numFrames} frames to ${outDir}`);
