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
import { projectPoint, projectQuad, needsPerspective, renderPerspectiveQuad, projectQuadWithWorldZ, renderPerspectiveQuadDepth } from '../src/compositor/perspective.js';
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

  test('projectQuadWithWorldZ: identity → wz=0 at all corners', () => {
    const corners = projectQuadWithWorldZ(mat4Identity(), 200, 100);
    for (const [, , , wz] of corners) assertClose(wz, 0, 1e-6, 'wz@identity');
  });

  test('projectQuadWithWorldZ: translate Z=+300 → all corners wz=+300', () => {
    const corners = projectQuadWithWorldZ(mat4Translate(0, 0, 300), 200, 100);
    for (const [, , , wz] of corners) assertClose(wz, 300, 1e-6, 'wz@z=300');
  });

  test('renderPerspectiveQuadDepth: near quad WINS over far quad (Motion convention: smaller wz = closer)', () => {
    // Two 40x40 red/blue quads overlapping fully in screen space; the "near" one
    // (world-z=-100) must occlude the "far" one (world-z=+100). Motion convention:
    // positive wz = FARTHER (receded), negative wz = CLOSER to camera.
    const dst = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    const srcNear = new ImageData(new Uint8ClampedArray(40 * 40 * 4), 40, 40);
    const srcFar = new ImageData(new Uint8ClampedArray(40 * 40 * 4), 40, 40);
    for (let i = 0; i < srcNear.data.length; i += 4) { srcNear.data[i]=255; srcNear.data[i+3]=255; } // red
    for (let i = 0; i < srcFar.data.length; i += 4) { srcFar.data[i+2]=255; srcFar.data[i+3]=255; }  // blue
    const zbuf = new Float64Array(80 * 80); zbuf.fill(Infinity);
    // Paint FAR first, then NEAR — order irrelevant to the depth compare's result.
    // Use camZ=Infinity (orthographic) so the projection preserves +/-hh screen extent.
    const farCorners = projectQuadWithWorldZ(mat4Translate(0, 0, +100), 40, 40, Infinity);
    const nearCorners = projectQuadWithWorldZ(mat4Translate(0, 0, -100), 40, 40, Infinity);
    renderPerspectiveQuadDepth(dst, zbuf, srcFar, farCorners, 1.0);
    renderPerspectiveQuadDepth(dst, zbuf, srcNear, nearCorners, 1.0);
    // Centre pixel should now be RED (near quad wins).
    const centerIdx = (40 * 80 + 40) * 4;
    assert(dst.data[centerIdx] > 200 && dst.data[centerIdx + 2] < 20,
      `centre should be near-red, got r=${dst.data[centerIdx]} b=${dst.data[centerIdx + 2]}`);
    // Reverse: paint near first, then far — depth compare must REJECT the far paint.
    const dst2 = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    const zbuf2 = new Float64Array(80 * 80); zbuf2.fill(Infinity);
    renderPerspectiveQuadDepth(dst2, zbuf2, srcNear, nearCorners, 1.0);
    renderPerspectiveQuadDepth(dst2, zbuf2, srcFar, farCorners, 1.0);
    assert(dst2.data[centerIdx] > 200 && dst2.data[centerIdx + 2] < 20,
      `order-independent: centre still near-red, got r=${dst2.data[centerIdx]} b=${dst2.data[centerIdx + 2]}`);
  });

  test('renderPerspectiveQuadDepth: two perpendicular quads produce split ownership (per-pixel depth)', () => {
    // Two overlapping quads with OPPOSITE X-rotations about a shared axis: one tilted
    // top-back (top-of-source recedes, bottom stays), the other tilted top-forward.
    // Depth compare should split the frame — the top half owned by whichever quad has
    // its "top-of-source" nearer to camera; the bottom half by whichever has bottom
    // nearer. This is exactly the two-sided-card pattern the framework was built for.
    // Uses camZ=Infinity (ortho) so we can compute wz analytically.
    const dst = new ImageData(new Uint8ClampedArray(100 * 100 * 4), 100, 100);
    const zbuf = new Float64Array(100 * 100); zbuf.fill(Infinity);
    const srcA = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    const srcB = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    for (let i = 0; i < srcA.data.length; i += 4) { srcA.data[i]=255; srcA.data[i+3]=255; } // red
    for (let i = 0; i < srcB.data.length; i += 4) { srcB.data[i+2]=255; srcB.data[i+3]=255; } // blue
    // Build a rotX 4x4 by hand (column-major): rotX(+45°) puts source-top at wz=-hh·sin,
    // source-bottom at wz=+hh·sin.
    const c = Math.cos(0.5), s = Math.sin(0.5); // ≈28.6° for a moderate tilt
    const rotXPlus = new Float64Array([
      1, 0, 0, 0,
      0, c, s, 0,      // col 1: applied to y — y goes to (c·y, s·y) plus rest
      0, -s, c, 0,     // col 2: applied to z
      0, 0, 0, 1,
    ]);
    const rotXMinus = new Float64Array([
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1,
    ]);
    const cornersA = projectQuadWithWorldZ(rotXPlus, 80, 80, Infinity);
    const cornersB = projectQuadWithWorldZ(rotXMinus, 80, 80, Infinity);
    renderPerspectiveQuadDepth(dst, zbuf, srcA, cornersA, 1.0);
    renderPerspectiveQuadDepth(dst, zbuf, srcB, cornersB, 1.0);
    // Sample top-of-frame (y=20) vs bottom-of-frame (y=80) at frame centre x=50.
    const topIdx = (20 * 100 + 50) * 4;
    const botIdx = (80 * 100 + 50) * 4;
    const topIsRed = dst.data[topIdx] > dst.data[topIdx + 2];
    const botIsRed = dst.data[botIdx] > dst.data[botIdx + 2];
    // The two rotation directions produce OPPOSITE ownership top vs bottom:
    // rotXPlus (m6=+s) puts source-top at wz=−hh·s (near) → wins TOP of frame.
    // rotXMinus (m6=−s) puts source-top at wz=+hh·s (far)  → LOSES TOP.
    assert(topIsRed !== botIsRed,
      `depth split should invert top vs bottom (top red=${topIsRed}, bot red=${botIsRed})`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
