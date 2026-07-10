/**
 * Concurrency invariant test (ROADMAP item 4 verifier).
 *
 * Item 4 threaded every render-scoped module global (evaluator CURRENT_FPS /
 * DROPZONE_WRAP_TO_A / HOLD_INCOMING_B, compositor `ctx` + `_dzPlaceholder`,
 * parser CLIP_MEDIA / DROPZONE_MEDIA_HEIGHT) into explicit per-call context
 * objects (EvalCtx / RenderContext / ClipInfo). The invariant that buys: a
 * render() call is a pure function of (imageA, imageB, progress) — interleaving
 * two different transitions' renders can no longer corrupt each other via shared
 * module state.
 *
 * This test PROVES that invariant the way the DoD asks: it renders two
 * structurally-different slugs (a) SERIALLY (all of A's frames, then all of B's)
 * and (b) INTERLEAVED (A0, B0, A1, B1, ...), and asserts the interleaved frames
 * are BYTE-IDENTICAL to the serial ones. If any module global still leaked across
 * renders, the interleaved B render would perturb A's next frame (or vice-versa)
 * and the buffers would differ.
 *
 * Run: node_modules/.bin/tsx test/concurrent.test.ts
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: any; width: number; height: number;
    constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); }
  };
}
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

function loadPNG(p: string) {
  const png = PNG.sync.read(fs.readFileSync(p));
  return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

// Byte-identical comparison of two ImageData RGBA buffers.
function framesEqual(a: any, b: any): { equal: boolean; firstDiff?: number; diffCount: number } {
  if (a.width !== b.width || a.height !== b.height) return { equal: false, diffCount: -1 };
  const da = a.data, db = b.data;
  let diffCount = 0, firstDiff: number | undefined;
  for (let i = 0; i < da.length; i++) {
    if (da[i] !== db[i]) { diffCount++; if (firstDiff === undefined) firstDiff = i; }
  }
  return { equal: diffCount === 0, firstDiff, diffCount };
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  \u2713 ${name}`); pass++; }
    catch (e: any) { console.log(`  \u2717 ${name}: ${e.message}`); fail++; }
  }

  console.log('Concurrency invariant tests (item 4 verifier):\n');

  const slugMapPath = process.env.FCT_SLUGMAP || path.resolve(import.meta.dirname, '../../fct/slug_map.json');
  const map = JSON.parse(fs.readFileSync(slugMapPath, 'utf-8'));
  const imgA = loadPNG(path.resolve(import.meta.dirname, 'start.png'));
  const imgB = loadPNG(path.resolve(import.meta.dirname, 'end.png'));
  const N = 24;
  const OPTS = { outputWidth: 1920, outputHeight: 1080 };

  // Structurally-different pairs that between them exercise every ex-global path:
  //   Lights/Flash        -> evaluator wrapToA + filled-shape overlay
  //   Objects/Veil        -> parser clip.media (bundled .mov) + holdIncomingB
  //   Replicator/Concentric -> compositor clone/replicator ctx + dzPlaceholder
  //   Movements/Push      -> the canonical drop-zone A/B crossfade
  const PAIRS: [string, string][] = [
    ['Lights__Flash', 'Replicator-Clones__Concentric'],
    ['Objects__Veil', 'Movements__Push'],
  ];

  for (const [slugA, slugB] of PAIRS) {
    test(`interleaving ${slugA} + ${slugB} == serial`, () => {
      assert(!!map[slugA], `slug_map missing ${slugA}`);
      assert(!!map[slugB], `slug_map missing ${slugB}`);

      // --- SERIAL: fresh transition per slug, render all N frames of A then all of B ---
      const trA1 = createBenchTransition(map[slugA], OPTS);
      const serialA: any[] = [];
      for (let i = 0; i < N; i++) serialA.push(trA1.render(imgA, imgB, i / N));
      const trB1 = createBenchTransition(map[slugB], OPTS);
      const serialB: any[] = [];
      for (let i = 0; i < N; i++) serialB.push(trB1.render(imgA, imgB, i / N));

      // --- INTERLEAVED: two live transitions, alternate A/B frame-by-frame ---
      const trA2 = createBenchTransition(map[slugA], OPTS);
      const trB2 = createBenchTransition(map[slugB], OPTS);
      const interA: any[] = [], interB: any[] = [];
      for (let i = 0; i < N; i++) {
        interA.push(trA2.render(imgA, imgB, i / N));
        interB.push(trB2.render(imgA, imgB, i / N));
      }

      // --- Assert byte-identical ---
      for (let i = 0; i < N; i++) {
        const ra = framesEqual(serialA[i], interA[i]);
        assert(ra.equal, `${slugA} frame ${i} differs interleaved-vs-serial (${ra.diffCount} bytes, first @${ra.firstDiff})`);
        const rb = framesEqual(serialB[i], interB[i]);
        assert(rb.equal, `${slugB} frame ${i} differs interleaved-vs-serial (${rb.diffCount} bytes, first @${rb.firstDiff})`);
      }
    });
  }

  // Also prove re-parsing the same slug twice (interleaved) gives identical frames:
  // this catches any residual parser module state (ClipInfo threading).
  test('interleaved re-parse of same slug is deterministic', () => {
    const slug = 'Objects__Veil';
    assert(!!map[slug], `slug_map missing ${slug}`);
    const t1 = createBenchTransition(map[slug], OPTS);
    const t2 = createBenchTransition(map[slug], OPTS);
    for (let i = 0; i < N; i++) {
      const f1 = t1.render(imgA, imgB, i / N);
      const f2 = t2.render(imgA, imgB, i / N);
      const r = framesEqual(f1, f2);
      assert(r.equal, `${slug} frame ${i} nondeterministic across two live parses (${r.diffCount} bytes)`);
    }
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
