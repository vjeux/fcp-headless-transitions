/**
 * Robustness test: parse and render ALL 65 transitions without crashing.
 * Verifies the engine handles every template's structure.
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
import fs from 'node:fs';
import path from 'node:path';

const BASE = '/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized';

function findMotrFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findMotrFiles(full));
    else if (entry.name.endsWith('.motr')) results.push(full);
  }
  return results;
}

function runTests() {
  const motrs = findMotrFiles(BASE);
  console.log(`Robustness test: parse + render all ${motrs.length} transitions\n`);

  // Small test images for speed
  const w = 320, h = 180;
  const imgA = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  const imgB = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < w * h * 4; i += 4) {
    imgA.data[i] = 200; imgA.data[i+1] = 100; imgA.data[i+2] = 50; imgA.data[i+3] = 255;
    imgB.data[i] = 50; imgB.data[i+1] = 100; imgB.data[i+2] = 200; imgB.data[i+3] = 255;
  }

  let parsed = 0, rendered = 0, failed = 0;
  const failures: string[] = [];

  for (const motrPath of motrs) {
    const name = path.basename(path.dirname(motrPath)).replace('.localized', '');
    try {
      const xml = fs.readFileSync(motrPath, 'utf-8');
      const transition = createTransition(xml);
      parsed++;
      // Render at 3 progress points (using small downscaled sources for speed)
      // Note: the transition renders at its native resolution; we scale sources
      const scaledA = new ImageData(imgA.data, w, h);
      const scaledB = new ImageData(imgB.data, w, h);
      for (const p of [0, 0.5, 1.0]) {
        const frame = transition.render(scaledA, scaledB, p);
        if (!frame || frame.data.length === 0) throw new Error('empty frame');
      }
      rendered++;
    } catch (e: any) {
      failed++;
      failures.push(`${name}: ${e.message}`);
    }
  }

  console.log(`  Parsed:   ${parsed}/${motrs.length}`);
  console.log(`  Rendered: ${rendered}/${motrs.length}`);
  console.log(`  Failed:   ${failed}`);
  if (failures.length > 0) {
    console.log('\n  Failures:');
    for (const f of failures.slice(0, 20)) console.log(`    ✗ ${f}`);
  }

  console.log(`\n${rendered} transitions rendered without crashing, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
