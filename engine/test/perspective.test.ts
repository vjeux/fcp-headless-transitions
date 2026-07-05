/**
 * Tests for 3D perspective projection.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { projectPoint, projectQuad, needsPerspective, renderPerspectiveQuad } from '../src/compositor/perspective.js';
import { mat4Identity, mat4RotateY, mat4Translate } from '../src/evaluator/index.js';

function assertClose(a: number, b: number, tol: number, msg: string) {
  if (Math.abs(a - b) > tol) throw new Error(`FAIL: ${msg} — expected ${b}, got ${a}`);
}
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Perspective projection tests:\n');

  test('projectPoint: z=0 → no scale', () => {
    const [x, y, s] = projectPoint(100, 50, 0);
    assertClose(x, 100, 0.01, 'x'); assertClose(y, 50, 0.01, 'y'); assertClose(s, 1, 0.01, 'scale');
  });

  test('projectPoint: positive z (away from camera) → recedes/shrinks', () => {
    const [x, y, s] = projectPoint(100, 0, 500);
    assert(s < 1, `scale should be <1 for z>0 (recedes), got ${s}`);
    assert(x < 100, `x should shrink, got ${x}`);
  });

  test('projectPoint: negative z (toward camera) → magnified', () => {
    const [x, y, s] = projectPoint(100, 0, -500);
    assert(s > 1, `scale should be >1 for z<0 (toward), got ${s}`);
    assert(x > 100, `x should magnify, got ${x}`);
  });

  test('needsPerspective: identity → false', () => {
    assert(!needsPerspective(mat4Identity()), 'identity should not need perspective');
  });

  test('needsPerspective: 2D translate → false', () => {
    assert(!needsPerspective(mat4Translate(100, 50, 0)), '2D translate should not need perspective');
  });

  test('needsPerspective: Y rotation → true', () => {
    assert(needsPerspective(mat4RotateY(45)), 'Y rotation should need perspective');
  });

  test('needsPerspective: Z translate → true', () => {
    assert(needsPerspective(mat4Translate(0, 0, 100)), 'Z translate should need perspective');
  });

  test('projectQuad: identity → axis-aligned rectangle', () => {
    const corners = projectQuad(mat4Identity(), 200, 100);
    // Y-DOWN local convention (matching blitTransformed): TL=(-100,-50), TR=(100,-50),
    // BR=(100,50), BL=(-100,50). The final screen map (dh/2 + y) flips it back upright.
    assertClose(corners[0][0], -100, 0.1, 'TL x');
    assertClose(corners[0][1], -50, 0.1, 'TL y');
    assertClose(corners[2][0], 100, 0.1, 'BR x');
    assertClose(corners[2][1], 50, 0.1, 'BR y');
  });

  test('projectQuad: Y rotation → foreshortened (left/right edges differ)', () => {
    const corners = projectQuad(mat4RotateY(45), 200, 100);
    // With Y rotation, one side comes toward camera (wider), other goes away (narrower)
    const leftW = corners[0][2], rightW = corners[1][2];
    assert(Math.abs(leftW - rightW) > 0.01, `edges should have different perspective (${leftW} vs ${rightW})`);
  });

  test('renderPerspectiveQuad: renders content', () => {
    const dst = new ImageData(new Uint8ClampedArray(200 * 200 * 4), 200, 200);
    const src = new ImageData(new Uint8ClampedArray(100 * 100 * 4), 100, 100);
    for (let i = 0; i < src.data.length; i += 4) { src.data[i]=255; src.data[i+3]=255; }
    const corners = projectQuad(mat4Identity(), 100, 100);
    renderPerspectiveQuad(dst, src, corners, 1.0);
    // Center should have red content
    const centerIdx = (100 * 200 + 100) * 4;
    assert(dst.data[centerIdx] > 200, `center should be red, got ${dst.data[centerIdx]}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
