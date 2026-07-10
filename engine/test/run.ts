/**
 * Test harness: compares the motr-engine output against headless FCP ground truth.
 *
 * For each transition:
 *   1. Load the .motr file
 *   2. Load ground-truth PNGs (rendered by `fct gen headless`)
 *   3. Render the same frames with our engine
 *   4. Compare pixel-by-pixel, report PSNR / % diff
 *
 * Prerequisites:
 *   - Run `npm run ground-truth` first to generate reference frames
 *   - ground-truth/ contains dirs per transition with frame_NNNN.png files
 */
import { createTransition } from '../src/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const GROUND_TRUTH_DIR = path.resolve(import.meta.dirname, 'ground-truth');
const TRANSITIONS_DIR = path.resolve(import.meta.dirname, '../../motion-renderer/examples/PETemplates.localized/Transitions.localized');
const IMAGES_DIR = path.resolve(import.meta.dirname, '../images');

interface TestResult {
  transition: string;
  frame: number;
  progress: number;
  diffPixels: number;
  totalPixels: number;
  diffPercent: number;
  psnr: number;
}

function loadPNG(filepath: string): ImageData {
  const buf = fs.readFileSync(filepath);
  const png = PNG.sync.read(buf);
  return new ImageData(
    new Uint8ClampedArray(png.data),
    png.width,
    png.height
  );
}

function computePSNR(imgA: ImageData, imgB: ImageData): number {
  let mse = 0;
  for (let i = 0; i < imgA.data.length; i++) {
    const d = imgA.data[i] - imgB.data[i];
    mse += d * d;
  }
  mse /= imgA.data.length;
  if (mse === 0) return Infinity;
  return 10 * Math.log10((255 * 255) / mse);
}

async function testTransition(motrPath: string, gtDir: string): Promise<TestResult[]> {
  const xml = fs.readFileSync(motrPath, 'utf-8');
  const transition = createTransition(xml);

  // Load source images
  const imgA = loadPNG(path.join(IMAGES_DIR, 'start.jpg.png'));
  const imgB = loadPNG(path.join(IMAGES_DIR, 'end.jpg.png'));

  const frames = fs.readdirSync(gtDir)
    .filter(f => f.endsWith('.png'))
    .sort();

  const results: TestResult[] = [];
  const numFrames = frames.length;

  for (let i = 0; i < numFrames; i++) {
    const progress = numFrames > 1 ? i / (numFrames - 1) : 0;
    const gt = loadPNG(path.join(gtDir, frames[i]));
    const rendered = transition.render(imgA, imgB, progress);

    const diffPixels = pixelmatch(
      rendered.data, gt.data, null,
      gt.width, gt.height,
      { threshold: 0.1 }
    );

    const psnr = computePSNR(rendered, gt);

    results.push({
      transition: path.basename(gtDir),
      frame: i,
      progress,
      diffPixels,
      totalPixels: gt.width * gt.height,
      diffPercent: (diffPixels / (gt.width * gt.height)) * 100,
      psnr,
    });
  }

  return results;
}

async function main() {
  if (!fs.existsSync(GROUND_TRUTH_DIR)) {
    console.error('Ground truth not found. Run: npm run ground-truth');
    process.exit(1);
  }

  const dirs = fs.readdirSync(GROUND_TRUTH_DIR)
    .filter(d => fs.statSync(path.join(GROUND_TRUTH_DIR, d)).isDirectory());

  console.log(`Testing ${dirs.length} transitions against ground truth...\n`);

  let totalPass = 0, totalFail = 0;

  for (const dir of dirs) {
    const gtDir = path.join(GROUND_TRUTH_DIR, dir);
    // Find corresponding .motr
    const slug = dir;
    // TODO: resolve slug -> motr path
    // For now, print placeholder
    console.log(`  ${slug}: [not yet implemented — needs .motr path resolver]`);
    totalFail++;
  }

  console.log(`\n=== ${totalPass} pass, ${totalFail} not yet implemented ===`);
}

main().catch(console.error);
