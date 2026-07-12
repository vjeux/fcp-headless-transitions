/**
 * Tests for parseDropZone curved-dimension handling.
 *
 * Regression guard for the Dissolves/Divide drop-zone Width bug: Motion authors a
 * drop zone's frame Width (id 313) as a CURVE (ramping 1311→…) with a SENTINEL
 * static value=1 (min=1) alongside it. Reading that sentinel 1 collapsed the
 * compositor's aspect-fill (fitScale = frameW/srcW ≈ 1/1854 ≈ 0). parseDropZone
 * must prefer the curve's real size (first keyframe) over the sentinel.
 */
import { parseDropZone } from '../src/parser/footage.js';
import type { Parameter } from '../src/types.js';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('parseDropZone dimension tests:\n');

  // The Divide pattern: Width is a curve (kf value 1311) with a sentinel static value=1.
  const curvedWidthObj = (): Parameter[] => [{
    name: 'Object', id: 2, children: [
      { name: 'Type', id: 321, value: 1 },
      { name: 'Width', id: 313, value: 1, curve: { type: 1, default: 1, value: 1311, keyframes: [
        { time: { value: 0, timescale: 15360000 }, value: 1311, interpolation: 1 },
        { time: { value: 256256, timescale: 15360000 }, value: 900, interpolation: 1 },
      ] } },
      { name: 'Height', id: 314, value: 720 },
    ],
  }];

  test('curved Width prefers the first-keyframe value over the sentinel static 1', () => {
    const dz = parseDropZone(curvedWidthObj());
    assert(dz !== undefined, 'dropZone undefined');
    assert(dz!.width === 1311, `width ${dz!.width} (expected 1311, not sentinel 1)`);
    assert(dz!.height === 720, `height ${dz!.height}`);
    assert(dz!.type === 1, `type ${dz!.type}`);
  });

  // A plain static Width (the common Push case) is read directly.
  test('static Width is read directly', () => {
    const dz = parseDropZone([{
      name: 'Object', id: 2, children: [
        { name: 'Type', id: 321, value: 0 },
        { name: 'Width', id: 313, value: 1920 },
        { name: 'Height', id: 314, value: 1080 },
      ],
    }]);
    assert(dz !== undefined && dz.width === 1920 && dz.height === 1080, `got ${JSON.stringify(dz)}`);
  });

  // No Object block → no drop zone.
  test('no Object(id=2) → undefined', () => {
    const dz = parseDropZone([{ name: 'Opacity', id: 100, value: 1 }]);
    assert(dz === undefined, `expected undefined, got ${JSON.stringify(dz)}`);
  });

  // A curve whose only size is the target `value` (no keyframes) still resolves.
  test('curve value used when no keyframes', () => {
    const dz = parseDropZone([{
      name: 'Object', id: 2, children: [
        { name: 'Width', id: 313, value: 1, curve: { type: 1, default: 1, value: 1088, keyframes: [] } },
        { name: 'Height', id: 314, value: 1080 },
      ],
    }]);
    assert(dz !== undefined && dz.width === 1088, `got ${JSON.stringify(dz)}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
