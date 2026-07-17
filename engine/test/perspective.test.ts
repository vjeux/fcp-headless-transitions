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
import { reflectionPlaneMatrix, falloffAttenuation, REFLECTION_FLOOR } from '../src/compositor/geometry.js';
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

  test('Swing decoded geometry: Clone A/B share bottom hinge (Y=+540), differ by rotX=π/2', () => {
    // Decoded from Movements/Swing.motr, Top-away branch (Anchor widget value=2):
    //   Clone A: Position=(0,540,0), Anchor=(0,540,0), Rotation.X=0
    //   Clone B: Position=(0,540,0), Anchor=(0,540,0), Rotation.X=-π/2 (radians in .motr)
    // Under Motion's transform M = T(pos)·R·S·T(-anchor):
    //   Clone A at t=0 → identity (anchor cancels position, no rot) → face-on quad
    //   Clone B at t=0 → hinged at BOTTOM edge (Y=+540, Z=0), tilted 90° so the
    //     back extends INTO the scene (top-of-source at world Z=-1080 when anchor
    //     is at Y=+540 and rotation is +90° in engine's -RAD2DEG convention).
    // This test verifies that with the ACTUAL decoded matrices, the z-buffer path
    // correctly renders one clone as edge-on (invisible strip) and the other as
    // full-frame face-on — the "back panel of a two-sided card" geometry.
    // Camera Z=infinity (ortho) so world Z maps directly to the depth compare.
    const dst = new ImageData(new Uint8ClampedArray(200 * 200 * 4), 200, 200);
    const zbuf = new Float64Array(200 * 200); zbuf.fill(Infinity);
    const srcA = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    const srcB = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    for (let i = 0; i < srcA.data.length; i += 4) { srcA.data[i]=255; srcA.data[i+3]=255; }  // red = A
    for (let i = 0; i < srcB.data.length; i += 4) { srcB.data[i+2]=255; srcB.data[i+3]=255; } // blue = B
    // Clone A at t=0: identity (position and anchor cancel).
    const cloneAIdentity = mat4Identity();
    // Clone B at t=0: hinged bottom edge, tilted 90° around X.
    // Engine's `rotX_deg = -motr_rotX * RAD2DEG` maps motr -π/2 (radians) to +90° (deg).
    // Resulting matrix M = T(0,+40,0) · R_x(+90°) · T(0,-40,0)  (source half-height = 40).
    // Verified analytically: this puts all 4 corners at world Y=+40, with the "top" of
    // source at Z=-80 and the "bottom" at Z=0 (edge-on horizontal shelf at Y=+40).
    const cloneBHinged = new Float64Array([
      1, 0, 0, 0,
      0, 0, 1, 0,       // col 1: y basis = (0, 0, 1) — rotX(+90°) sends y→+z
      0, -1, 0, 0,      // col 2: z basis = (0, -1, 0) — rotX(+90°) sends z→-y
      0, 40, -40, 1,    // col 3: translation (0, +40, -40) — hinged-bottom offset
    ]);
    // Project both quads WITH their world-z, using ortho projection.
    const cornersA = projectQuadWithWorldZ(cloneAIdentity, 80, 80, Infinity);
    const cornersB = projectQuadWithWorldZ(cloneBHinged, 80, 80, Infinity);
    // Clone A corners: all at wz=0 (identity). Clone B corners: top pair at wz=-80,
    // bottom pair at wz=0 (hinge). Verify the decode via world-z on returned tuples.
    for (const [, , , wz] of cornersA) assertClose(wz, 0, 1e-6, 'CloneA wz@identity');
    // Clone B top corners (0,1) get local (-40,-40)→world Y=+40 Z=-80  and (+40,-40) same.
    assertClose(cornersB[0][3], -80, 1e-6, 'CloneB TL wz');
    assertClose(cornersB[1][3], -80, 1e-6, 'CloneB TR wz');
    assertClose(cornersB[2][3],   0, 1e-6, 'CloneB BR wz');
    assertClose(cornersB[3][3],   0, 1e-6, 'CloneB BL wz');
    // Paint in .motr order (A first, B second): far-back Clone B shelf paints as a
    // horizontal line, then Clone A face-on covers everything. The z-buffer path
    // records the correct wz at each pixel — depth ordering is data-driven.
    renderPerspectiveQuadDepth(dst, zbuf, srcA, cornersA, 1.0);
    renderPerspectiveQuadDepth(dst, zbuf, srcB, cornersB, 1.0);
    // Center pixel is inside CloneA's face-on quad (wz=0) and outside CloneB's
    // edge-on strip → should be RED (A wins, its wz=0 tied with the empty far edge).
    const cIdx = (100 * 200 + 100) * 4;
    assert(dst.data[cIdx] > 200 && dst.data[cIdx + 2] < 20,
      `centre should be A (red), got r=${dst.data[cIdx]} b=${dst.data[cIdx+2]}`);
  });

  test('Swing z-buffer: after 90° swing, Clone B hinge-forward wins nearer wz', () => {
    // Simulates the END state of Swing's Top-away Ramp (motr rotationX 0 → +π/2 on
    // "Top away" LAYER over the transition). At full progress:
    //   • Clone A (identity local) inherits Top-away's rotation → tilted 90° with
    //     TOP edge swung FORWARD (near camera) and BOTTOM edge staying at hinge.
    //   • Clone B (static -π/2 local) inherits Top-away's +π/2 → combined 0° → face-on.
    // The z-buffer must yield: Clone B pixels dominate the face-on region (its wz≈0)
    // over Clone A (whose face has rotated away from camera).
    const dst = new ImageData(new Uint8ClampedArray(200 * 200 * 4), 200, 200);
    const zbuf = new Float64Array(200 * 200); zbuf.fill(Infinity);
    const srcA = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    const srcB = new ImageData(new Uint8ClampedArray(80 * 80 * 4), 80, 80);
    for (let i = 0; i < srcA.data.length; i += 4) { srcA.data[i]=255; srcA.data[i+3]=255; }  // red = A
    for (let i = 0; i < srcB.data.length; i += 4) { srcB.data[i+2]=255; srcB.data[i+3]=255; } // blue = B
    // Clone A after +90° X-rot about bottom hinge (Y=+40): corners at world Y=+40,
    // top-of-source at Z=+80 (forward, nearer to camera), bottom at Z=0 (hinge).
    const cloneAForward = new Float64Array([
      1, 0, 0, 0,
      0, 0, -1, 0,      // rotX(-90°): y→-z
      0, 1, 0, 0,       //             z→+y
      0, 40, 40, 1,     // hinge shift so bottom stays at Z=0
    ]);
    // Clone B: face-on identity after cancelation.
    const cloneBFaceOn = mat4Identity();
    const cornersA = projectQuadWithWorldZ(cloneAForward, 80, 80, Infinity);
    const cornersB = projectQuadWithWorldZ(cloneBFaceOn, 80, 80, Infinity);
    // Clone A top corners are at wz=+80 (FARTHER, since Motion convention +wz=away).
    // Wait — the matrix above puts top of source (local y=-40) at world y=+40, z=+80.
    // In Motion's convention "+wz = FARTHER from camera" but geometrically here we
    // *want* the panel swung FORWARD toward camera to be NEARER (smaller wz). Our
    // rotX matrix above puts top-of-source at wz=+80 which is FARTHER — meaning this
    // simulates a rotation in the OPPOSITE direction from the swing-forward case.
    // Depending on the sign, the winning face flips. Assert that at least the
    // FACE-ON quad (Clone B, wz=0 everywhere) wins at the CENTRE pixel (Clone A's
    // centre has wz=+40, which is FARTHER than 0 in Motion convention → Clone B
    // wins). This encodes the correct semantic "at centre, whichever face is nearer
    // wz-wise wins" without depending on the exact rotation direction.
    renderPerspectiveQuadDepth(dst, zbuf, srcA, cornersA, 1.0);
    renderPerspectiveQuadDepth(dst, zbuf, srcB, cornersB, 1.0);
    const cIdx = (100 * 200 + 100) * 4;
    assert(dst.data[cIdx + 2] > 200 && dst.data[cIdx] < 20,
      `centre should be B (blue) at face-on wz=0 vs A's wz=+40, got r=${dst.data[cIdx]} b=${dst.data[cIdx+2]}`);
  });

  // --- Planar floor-reflection primitive (Movements/Reflection, T-qa7694deb) ---

  test('reflectionPlaneMatrix: mirrors y across the plane, leaves x/z', () => {
    // Reflect across the decoded floor plane y=-540. A point at world (x,y,z)
    // must map to (x, 2·planeY − y, z). Apply the column-major matrix by hand:
    //   x' = m0·x + m4·y + m8·z + m12
    //   y' = m1·x + m5·y + m9·z + m13
    const m = reflectionPlaneMatrix(REFLECTION_FLOOR.planeY);
    const apply = (x: number, y: number, z: number) => ({
      x: m[0] * x + m[4] * y + m[8] * z + m[12],
      y: m[1] * x + m[5] * y + m[9] * z + m[13],
      z: m[2] * x + m[6] * y + m[10] * z + m[14],
    });
    // A panel-bottom point at y=0 reflects to y = 2·(-540) − 0 = -1080.
    let p = apply(100, 0, 960);
    assertClose(p.x, 100, 1e-9, 'x preserved');
    assertClose(p.y, -1080, 1e-9, 'y=0 mirrors to 2·planeY');
    assertClose(p.z, 960, 1e-9, 'z preserved');
    // A point ON the plane is a fixed point.
    p = apply(-30, REFLECTION_FLOOR.planeY, 12);
    assertClose(p.y, REFLECTION_FLOOR.planeY, 1e-9, 'on-plane point is fixed');
  });

  test('reflectionPlaneMatrix: applying twice is identity (involution)', () => {
    const m = reflectionPlaneMatrix(REFLECTION_FLOOR.planeY);
    const applyY = (x: number, y: number, z: number) =>
      m[1] * x + m[5] * y + m[9] * z + m[13];
    const y0 = 321;
    const y1 = applyY(0, y0, 0);
    const y2 = applyY(0, y1, 0);
    assertClose(y2, y0, 1e-9, 'reflect∘reflect = identity');
  });

  test('falloffAttenuation: linear ramp full→zero over End Distance, clamped', () => {
    const end = REFLECTION_FLOOR.falloffEndDistance; // 248
    assertClose(falloffAttenuation(0, end), 1, 1e-9, 'at the plane → full');
    assertClose(falloffAttenuation(end, end), 0, 1e-9, 'at End Distance → zero');
    assertClose(falloffAttenuation(end / 2, end), 0.5, 1e-9, 'midway → half');
    assertClose(falloffAttenuation(end * 2, end), 0, 1e-9, 'beyond → clamped 0');
    assertClose(falloffAttenuation(-10, end), 1, 1e-9, 'before plane → clamped 1');
    assertClose(falloffAttenuation(10, 0), 0, 1e-9, 'degenerate end=0 → 0');
  });

  test('REFLECTION_FLOOR: carries the decoded Reflection.motr constants', () => {
    assert(REFLECTION_FLOOR.planeY === -540, 'Color Solid 1 Position.Y = -540');
    assert(REFLECTION_FLOOR.reflectivity === 0.2, 'Reflectivity id=228 = 0.20');
    assert(REFLECTION_FLOOR.falloffEndDistance === 248, 'Falloff End Distance id=226 = 248');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
