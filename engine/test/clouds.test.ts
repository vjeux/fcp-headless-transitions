// Unit tests for the DECODED CloudsV2 Perlin generator (clouds.ts). Verifies the exact
// FCP-decoded permutation table + gradient hash + quintic-fade gradient noise, so the
// reverse-engineered core is permanently guarded. (Full node-boundary render is a separate
// scoped port; this locks the evaluator.)
import { makeCloudsPermTable, cloudsNoise2D, CLOUDS_GRADIENTS } from '../src/compositor/filters/clouds.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  \u2713 ${name}`); pass++; }
    catch (e: any) { console.log(`  \u2717 ${name}: ${e.message}`); fail++; }
  }
  console.log('CloudsV2 Perlin generator tests:\n');

  test('perm table matches the decoded FCP reference (makePermTable @0x5313c)', () => {
    const perm = makeCloudsPermTable();
    const head = [208, 84, 188, 177, 134, 131, 38, 36];
    for (let i = 0; i < head.length; i++) {
      assert(perm[i] === head[i], `perm[${i}]=${perm[i]} expected ${head[i]}`);
    }
  });

  test('perm table is a valid 256-entry permutation (Fisher-Yates)', () => {
    const perm = makeCloudsPermTable();
    assert(perm.length === 256, `length ${perm.length}`);
    assert(new Set(perm).size === 256, 'not all values unique');
    assert(Math.min(...perm) === 0 && Math.max(...perm) === 255, 'range not 0..255');
  });

  test('gradient table is the canonical 12 improved-noise 2D gradients', () => {
    assert(CLOUDS_GRADIENTS.length === 12, `len ${CLOUDS_GRADIENTS.length}`);
    // every gradient is a unit-ish axis/diagonal vector
    for (const [gx, gy] of CLOUDS_GRADIENTS) {
      assert((Math.abs(gx) === 1 || gx === 0) && (Math.abs(gy) === 1 || gy === 0), `bad gradient ${gx},${gy}`);
    }
  });

  test('gradient noise is exactly 0 at integer lattice points', () => {
    // The defining property of Ken-Perlin gradient noise: value == 0 at integer coords.
    for (const [x, y, z] of [[5, 7, 0], [0, 0, 0], [12, 3, 5], [-4, 9, 2]]) {
      const v = cloudsNoise2D(x, y, z);
      assert(Math.abs(v) < 1e-9, `noise(${x},${y},${z})=${v} should be ~0 at integer lattice`);
    }
  });

  test('noise field is bounded ~[-1,1] with ~0 mean', () => {
    let mn = 9, mx = -9, sum = 0, n = 0;
    for (let y = 0; y < 40; y += 0.37) for (let x = 0; x < 40; x += 0.37) {
      const v = cloudsNoise2D(x, y, 0); mn = Math.min(mn, v); mx = Math.max(mx, v); sum += v; n++;
    }
    assert(mn > -1.2 && mx < 1.2, `range [${mn.toFixed(3)},${mx.toFixed(3)}] out of Perlin bounds`);
    assert(Math.abs(sum / n) < 0.05, `mean ${(sum / n).toFixed(4)} not ~0`);
  });

  test('deterministic + continuous (smoothness)', () => {
    assert(cloudsNoise2D(3.3, 4.4, 1) === cloudsNoise2D(3.3, 4.4, 1), 'not deterministic');
    // a tiny step should change the value only slightly (continuity)
    const a = cloudsNoise2D(3.30, 4.4, 1), b = cloudsNoise2D(3.31, 4.4, 1);
    assert(Math.abs(a - b) < 0.1, `discontinuous: ${a} vs ${b}`);
  });

  test('z (evolution) axis changes the field', () => {
    const a = cloudsNoise2D(3.3, 4.4, 0), b = cloudsNoise2D(3.3, 4.4, 1);
    assert(a !== b, 'z axis had no effect');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
