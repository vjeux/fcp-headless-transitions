/**
 * Visual comparison: renders a single transition at multiple progress points
 * and saves the output + ground-truth side by side for manual inspection.
 */
import { createTransition } from '../src/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const TRANSITIONS_DIR = '../../motion-renderer/examples/PETemplates.localized/Transitions.localized';

function saveImageData(img: ImageData, filepath: string) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  const buf = PNG.sync.write(png);
  fs.writeFileSync(filepath, buf);
}

async function main() {
  const motrPath = process.argv[2];
  if (!motrPath) {
    console.error('Usage: visual.ts <path-to.motr>');
    process.exit(1);
  }

  const xml = fs.readFileSync(motrPath, 'utf-8');
  const transition = createTransition(xml, { width: 960, height: 540 });

  // Create dummy source images (solid colors for now)
  const w = transition.width, h = transition.height;
  const imgA = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  const imgB = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < w * h * 4; i += 4) {
    imgA.data[i] = 200; imgA.data[i+1] = 150; imgA.data[i+2] = 100; imgA.data[i+3] = 255;
    imgB.data[i] = 100; imgB.data[i+1] = 150; imgB.data[i+2] = 200; imgB.data[i+3] = 255;
  }

  const outDir = path.join('test', 'visual-output');
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i <= 10; i++) {
    const progress = i / 10;
    const frame = transition.render(imgA, imgB, progress);
    saveImageData(frame, path.join(outDir, `frame_${i.toString().padStart(2, '0')}.png`));
  }

  console.log(`Rendered 11 frames to ${outDir}/`);
}

main().catch(console.error);
