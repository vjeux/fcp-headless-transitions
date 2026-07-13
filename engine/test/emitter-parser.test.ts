/**
 * Tests for the Motion Emitter + Particle Cell parser (ROADMAP S3 / T-B1).
 *
 * Verifies against three census-confirmed emitter-dominant slugs, each hitting a
 * different corner of the parser's schema:
 *   1. Movements/Drop_In     — cell + Gravity behavior (no acceleration curve;
 *                              defaults apply)
 *   2. Movements/Earthquake  — cell + Gravity with an animated Acceleration curve
 *                              (0→−75.7→−100→−200→0)
 *   3. Stylized/Diagonal     — Emitter with narrow emissionRange (~2.008 rad) +
 *                              cells at Speed=350 / Spin=0.873 / Life=10s +
 *                              hexagon particleSource pointer
 *
 * The parser is PARSE-ONLY (T-B1 wires no evaluator/compositor path). Correctness
 * is measured by "the schema comes out matching what an XML dump reads" — no
 * PSNR is expected to move.
 */
import { parseMotr } from '../src/parser/index.js';
import type { Curve } from '../src/types.js';
import fs from 'node:fs';

const FCP = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized';
const DROP_IN    = `${FCP}/Movements.localized/Drop In.localized/Drop In.motr`;
const EARTHQUAKE = `${FCP}/Movements.localized/Earthquake.localized/Earthquake.motr`;
const DIAGONAL   = `${FCP}/Stylized.localized/Nature.localized/Diagonal.localized/Diagonal.motr`;

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }
function assertClose(a: number, b: number, tol: number, msg: string) {
  if (!isFinite(a) || Math.abs(a - b) > tol) throw new Error(`FAIL: ${msg} — expected ${b} ± ${tol}, got ${a}`);
}
function num(v: number | Curve): number {
  return typeof v === 'number' ? v : (v.value ?? v.default);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Emitter/Cell parser tests:\n');

  // -------- Movements/Drop_In: 2 emitters, 3 cells, 3 Gravity behaviors --------
  const dropIn = parseMotr(fs.readFileSync(DROP_IN, 'utf-8'));
  test('drop-in: parses emitters map', () => assert(!!dropIn.emitters, 'no emitters map'));
  test('drop-in: 2 emitters', () => assert(dropIn.emitters!.size === 2, `got ${dropIn.emitters!.size}`));
  test('drop-in: 3 particle cells', () => assert(dropIn.particleCells!.size === 3, `got ${dropIn.particleCells!.size}`));

  // Every cell in Drop_In carries a Gravity behavior (census).
  test('drop-in: every cell has a Gravity behavior', () => {
    for (const c of dropIn.particleCells!.values()) {
      assert(!!c.gravity, `cell ${c.id} (${c.name}) missing gravity`);
    }
  });
  // Drop_In gravity is authored as `default="30"` on the Acceleration curve with
  // no explicit override — the parser must surface the default (Motion applies 30
  // when the curve carries no `value`).
  test('drop-in: gravity acceleration surfaces default 30', () => {
    for (const c of dropIn.particleCells!.values()) {
      const a = c.gravity!.acceleration;
      assertClose(num(a), 30, 1e-9, `cell ${c.name} gravity`);
    }
  });

  // Every cell stamped with its parent Emitter id.
  test('drop-in: cells carry emitterId back-reference', () => {
    for (const c of dropIn.particleCells!.values()) {
      assert(c.emitterId !== undefined, `cell ${c.id} has no emitterId`);
      assert(dropIn.emitters!.has(c.emitterId!), `emitterId ${c.emitterId} not in emitters map`);
    }
  });

  // Drop_In cells default their speed/spin to their param defaults or values (from
  // the XML dump: Speed=2409, Speed Randomness=1228 for the impact cells).
  test('drop-in: impact cell Speed = 2409', () => {
    let seenImpactSpeed = false;
    for (const c of dropIn.particleCells!.values()) {
      if (Math.abs(num(c.speed) - 2409) < 1e-6) { seenImpactSpeed = true; break; }
    }
    assert(seenImpactSpeed, 'no cell with Speed=2409');
  });

  // -------- Movements/Earthquake: 1 emitter, 1 cell, animated Gravity curve --------
  const eq = parseMotr(fs.readFileSync(EARTHQUAKE, 'utf-8'));
  test('earthquake: 1 emitter, 1 cell', () => {
    assert(eq.emitters!.size === 1, `emitters ${eq.emitters!.size}`);
    assert(eq.particleCells!.size === 1, `cells ${eq.particleCells!.size}`);
  });
  test('earthquake: cell Life = 0.4s', () => {
    const cell = eq.particleCells!.values().next().value!;
    assertClose(num(cell.life), 0.4, 1e-6, 'life');
  });
  test('earthquake: cell Speed = 2409', () => {
    const cell = eq.particleCells!.values().next().value!;
    assertClose(num(cell.speed), 2409, 1e-6, 'speed');
  });
  test('earthquake: gravity acceleration is an animated curve', () => {
    const cell = eq.particleCells!.values().next().value!;
    const a = cell.gravity!.acceleration;
    assert(typeof a !== 'number', 'expected Curve, got number');
    const c = a as Curve;
    // XML dump: 5 keypoints (0, -75.7, -100, -200, 0)
    assert(c.keyframes.length === 5, `keyframes ${c.keyframes.length}`);
    assertClose(c.default, 30, 1e-9, 'default');
    // Third keyframe is exactly -100 per the raw XML.
    assertClose(c.keyframes[2].value, -100, 1e-9, 'kp[2].value');
  });

  // -------- Stylized/Diagonal: 15 emitters, 37 cells --------
  const diag = parseMotr(fs.readFileSync(DIAGONAL, 'utf-8'));
  test('diagonal: 15 emitters, 37 cells', () => {
    assert(diag.emitters!.size === 15, `emitters ${diag.emitters!.size}`);
    assert(diag.particleCells!.size === 37, `cells ${diag.particleCells!.size}`);
  });
  // First-emitter values from the XML dump: emissionAngle 5.198, emissionRange 2.008.
  test('diagonal: first emitter emissionAngle ~5.198 rad', () => {
    const first = [...diag.emitters!.values()][0];
    assertClose(first.emissionAngle, 5.19842, 1e-4, 'emissionAngle');
    assertClose(first.emissionRange, 2.00772, 1e-4, 'emissionRange');
    assert(first.faceCamera === true, 'faceCamera default');
    assert(first.is3D === false, '3D default');
  });
  // First-cell values from the XML dump: birthRate 30, life 10, speed 350,
  // spin ~0.8727 rad/s. No Gravity behavior on Diagonal cells.
  test('diagonal: first cell birth/life/speed/spin', () => {
    const first = [...diag.particleCells!.values()][0];
    assertClose(num(first.birthRate), 30, 1e-9, 'birthRate');
    assertClose(num(first.life), 10, 1e-9, 'life');
    assertClose(num(first.speed), 350, 1e-9, 'speed');
    assertClose(num(first.spin), 0.87266, 1e-4, 'spin');
    assert(first.gravity === undefined, 'diagonal cells have no gravity');
  });
  // Cells with a Particle Source pointer resolve their sprite id (Diagonal
  // hexagon cell → 971894859 per the XML dump).
  test('diagonal: first cell references its hexagon particle-source', () => {
    const first = [...diag.particleCells!.values()][0];
    assert(first.particleSourceId === 971894859, `particleSourceId ${first.particleSourceId}`);
  });

  // T-B3: per-cell appearance (Color id=130, Color Mode id=129, Scale id=116).
  // XML dump of the hexagon cell: Color Mode=3 (Over Life), Color=(0.483,0.482,0.484,1),
  // Scale=(0.50,0.50). Hexagon 1 cell: Color Mode=1 (Colorize), Color=(0.999,0.960,
  // 0.956,1), Scale=(0.75,0.75).
  test('diagonal: hexagon cell has Color/ColorMode/Scale (T-B3)', () => {
    const hex = [...diag.particleCells!.values()].find(c => c.name === 'hexagon')!;
    assert(!!hex, 'hexagon cell missing');
    assert(!!hex.color, 'hexagon color missing');
    assertClose(hex.color!.r, 0.483, 0.01, 'hex R');
    assertClose(hex.color!.g, 0.482, 0.01, 'hex G');
    assertClose(hex.color!.b, 0.484, 0.01, 'hex B');
    assertClose(hex.color!.a, 1.0, 1e-6, 'hex A');
    assert(hex.colorMode === 3, `hex colorMode ${hex.colorMode}`);
    assert(!!hex.cellScale, 'hex cellScale missing');
    assertClose(hex.cellScale!.x, 0.50, 1e-4, 'hex sx');
    assertClose(hex.cellScale!.y, 0.50, 1e-4, 'hex sy');
  });
  test('diagonal: Hexagon 1 cell has Color/ColorMode/Scale (T-B3)', () => {
    const h1 = [...diag.particleCells!.values()].find(c => c.name === 'Hexagon 1')!;
    assert(!!h1, 'Hexagon 1 cell missing');
    assert(!!h1.color, 'Hexagon 1 color missing');
    assertClose(h1.color!.r, 0.999, 0.01, 'H1 R');
    assertClose(h1.color!.g, 0.961, 0.01, 'H1 G');
    assertClose(h1.color!.b, 0.956, 0.01, 'H1 B');
    assert(h1.colorMode === 1, `H1 colorMode ${h1.colorMode}`);
    assertClose(h1.cellScale!.x, 0.75, 1e-4, 'H1 sx');
    assertClose(h1.cellScale!.y, 0.75, 1e-4, 'H1 sy');
  });
  // Most Diagonal cells author a Color folder; a handful (e.g. circle_particle,
  // whose colour comes from a Particle Source image tint) do not — the T-B3 sim
  // falls back to a flat near-white in that case. Prove the majority DO have a
  // parsed colour, so downstream code isn't defending against a rare no-colour
  // path only. Threshold picked from the census: 36/37 Diagonal cells author Color.
  test('diagonal: most cells (>=90%) carry parsed color', () => {
    let withColor = 0;
    for (const c of diag.particleCells!.values()) if (c.color) withColor++;
    const total = diag.particleCells!.size;
    assert(withColor / total >= 0.9, `only ${withColor}/${total} cells have color`);
  });

  // -------- MotrScene index consistency --------
  test('scene index: every layer.emitter is in scene.emitters', () => {
    const walk = (ls: any[]) => {
      for (const l of ls) {
        if (l.emitter) assert(diag.emitters!.get(l.emitter.id) === l.emitter,
          `emitter ${l.emitter.id} not in map`);
        if (l.children) walk(l.children);
      }
    };
    walk(diag.layers);
  });
  test('scene index: every layer.particleCell is in scene.particleCells', () => {
    const walk = (ls: any[]) => {
      for (const l of ls) {
        if (l.particleCell) assert(diag.particleCells!.get(l.particleCell.id) === l.particleCell,
          `cell ${l.particleCell.id} not in map`);
        if (l.children) walk(l.children);
      }
    };
    walk(diag.layers);
  });

  // -------- Non-particle scenes leave the fields undefined (no orphan maps) --------
  const push = parseMotr(fs.readFileSync(
    `${FCP}/Movements.localized/Push.localized/Push.motr`, 'utf-8'));
  test('push: no emitters (absent, not empty)', () => {
    assert(push.emitters === undefined, `unexpected emitters map`);
    assert(push.particleCells === undefined, `unexpected cells map`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
