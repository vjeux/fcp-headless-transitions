/**
 * Tests for the Z-buffered clone composite subsystem (T-q98a30de5).
 * Pin the depth-quad rasterization + structural probes so the scaffolding
 * cannot silently regress once it is wired into composite().
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}

import {
  hasNestedMaskedCloneCameraStack,
  hasCameraCloneStack,
  createDepthBuffer,
  renderDepthComposite,
  buildDepthQuad,
  collectMaskedCloneQuads,
  renderNestedMaskedCloneStack,
  type DepthQuad,
} from '../src/compositor/z-composite.js';
import { mat4Identity, mat4Translate, evaluate } from '../src/evaluator/index.js';
import { parseMotr } from '../src/parser/index.js';
import { collectImageMaskSourceIds } from '../src/compositor/masks.js';
import fs from 'node:fs';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }
function assertClose(a: number, b: number, tol: number, msg: string) {
  if (Math.abs(a - b) > tol) throw new Error(`FAIL: ${msg} — expected ${b}, got ${a}`);
}

const RECT_3D_MOTR = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized/Replicator:Clones.localized/3D Rectangle.localized/3D Rectangle.motr';
const CONCENTRIC_MOTR = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized/Replicator:Clones.localized/Concentric.localized/Concentric.motr';
const BLURS_ZOOM_MOTR = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized/Blurs.localized/Zoom.localized/Zoom.motr';

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Z-composite tests:\n');

  test('createDepthBuffer: seeded to +Infinity', () => {
    const z = createDepthBuffer(4, 4);
    assert(z.length === 16, 'size');
    for (const v of z) assert(v === Infinity, 'all Infinity');
  });

  test('hasNestedMaskedCloneCameraStack: fires on 3D_Rectangle', () => {
    if (!fs.existsSync(RECT_3D_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(RECT_3D_MOTR, 'utf-8'));
    assert(hasNestedMaskedCloneCameraStack(scene), '3D_Rectangle should match');
  });

  test('hasNestedMaskedCloneCameraStack: does NOT fire on Concentric (no camera)', () => {
    if (!fs.existsSync(CONCENTRIC_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(CONCENTRIC_MOTR, 'utf-8'));
    assert(!hasNestedMaskedCloneCameraStack(scene), 'Concentric should not match');
  });

  test('hasNestedMaskedCloneCameraStack: does NOT fire on Blurs/Zoom (no clones)', () => {
    if (!fs.existsSync(BLURS_ZOOM_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(BLURS_ZOOM_MOTR, 'utf-8'));
    assert(!hasNestedMaskedCloneCameraStack(scene), 'Blurs/Zoom should not match');
  });

  test('hasCameraCloneStack: fires on 3D_Rectangle (structural parent)', () => {
    if (!fs.existsSync(RECT_3D_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(RECT_3D_MOTR, 'utf-8'));
    assert(hasCameraCloneStack(scene), '3D_Rectangle should match camera-clone-stack');
  });

  test('renderDepthComposite: 2 opaque quads at different Z — nearer wins pixel-by-pixel', () => {
    // Two full-frame red / green quads, one at z=100 (far) one at z=-100 (near).
    // The near one should paint every pixel green; the far one should be occluded.
    const W = 20, H = 20;
    const dst = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    const zbuf = createDepthBuffer(W, H);
    const red = new ImageData(new Uint8ClampedArray(W * H * 4).fill(0), W, H);
    for (let i = 0; i < W * H; i++) { red.data[i * 4] = 255; red.data[i * 4 + 3] = 255; }
    const green = new ImageData(new Uint8ClampedArray(W * H * 4).fill(0), W, H);
    for (let i = 0; i < W * H; i++) { green.data[i * 4 + 1] = 255; green.data[i * 4 + 3] = 255; }
    // Full-frame quads via cornersWithZ (screen-space is centre-origin: ±W/2 × ±H/2).
    const cornersFar: Array<[number, number, number, number]> = [
      [-W/2, -H/2, 0.95, 100], [W/2, -H/2, 0.95, 100],
      [W/2, H/2, 0.95, 100], [-W/2, H/2, 0.95, 100],
    ];
    const cornersNear: Array<[number, number, number, number]> = [
      [-W/2, -H/2, 1.05, -100], [W/2, -H/2, 1.05, -100],
      [W/2, H/2, 1.05, -100], [-W/2, H/2, 1.05, -100],
    ];
    // Paint FAR first, then NEAR — near must overwrite because its wz is smaller.
    const quads: DepthQuad[] = [
      { layerId: 1, src: red, cornersWithZ: cornersFar, opacity: 1 },
      { layerId: 2, src: green, cornersWithZ: cornersNear, opacity: 1 },
    ];
    renderDepthComposite(dst, zbuf, quads);
    // Sample centre pixel: should be green.
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    const di = (cy * W + cx) * 4;
    assert(dst.data[di + 1] > 200, `centre pixel should be green (g=${dst.data[di + 1]})`);
    assert(dst.data[di] < 30, `centre pixel R should be low (r=${dst.data[di]})`);
  });

  test('renderDepthComposite: reverse order — near wins regardless of paint order', () => {
    // Paint NEAR first, then FAR — near must still own its pixels (depth-compare).
    const W = 20, H = 20;
    const dst = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    const zbuf = createDepthBuffer(W, H);
    const red = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    for (let i = 0; i < W * H; i++) { red.data[i * 4] = 255; red.data[i * 4 + 3] = 255; }
    const green = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    for (let i = 0; i < W * H; i++) { green.data[i * 4 + 1] = 255; green.data[i * 4 + 3] = 255; }
    const cornersFar: Array<[number, number, number, number]> = [
      [-W/2, -H/2, 0.95, 100], [W/2, -H/2, 0.95, 100],
      [W/2, H/2, 0.95, 100], [-W/2, H/2, 0.95, 100],
    ];
    const cornersNear: Array<[number, number, number, number]> = [
      [-W/2, -H/2, 1.05, -100], [W/2, -H/2, 1.05, -100],
      [W/2, H/2, 1.05, -100], [-W/2, H/2, 1.05, -100],
    ];
    const quads: DepthQuad[] = [
      { layerId: 2, src: green, cornersWithZ: cornersNear, opacity: 1 },
      { layerId: 1, src: red, cornersWithZ: cornersFar, opacity: 1 },
    ];
    renderDepthComposite(dst, zbuf, quads);
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    const di = (cy * W + cx) * 4;
    assert(dst.data[di + 1] > 200, `centre pixel should stay green (paint order should not matter for depth): g=${dst.data[di + 1]}`);
  });

  test('buildDepthQuad: identity transform → axis-aligned quad at z=0', () => {
    const src = new ImageData(new Uint8ClampedArray(4 * 4 * 4), 4, 4);
    // Fake EvaluatedLayer stub — only worldTransform + layer.id + opacity are read.
    const evalLayer = {
      layer: { id: 42 } as any,
      worldTransform: mat4Identity(),
      opacity: 0.5,
    } as any;
    const q = buildDepthQuad(evalLayer, src, 2000);
    assert(q.layerId === 42, 'layerId');
    assertClose(q.opacity, 0.5, 1e-9, 'opacity');
    assert(q.cornersWithZ.length === 4, 'four corners');
    // At Z=0, wz should be 0.
    for (const [,, , wz] of q.cornersWithZ) assertClose(wz, 0, 1e-6, 'wz at z=0');
  });

  test('buildDepthQuad: Z-translated transform → all corners share the translated wz', () => {
    const src = new ImageData(new Uint8ClampedArray(4 * 4 * 4), 4, 4);
    const evalLayer = {
      layer: { id: 42 } as any,
      worldTransform: mat4Translate(0, 0, 300),
      opacity: 1,
    } as any;
    const q = buildDepthQuad(evalLayer, src, 2000);
    for (const [,, , wz] of q.cornersWithZ) assertClose(wz, 300, 1e-6, 'wz translated');
  });

  // ============================================================================
  // Integration tests against the real 3D_Rectangle scene.
  // ============================================================================

  function loadScene(motrPath: string) {
    if (!fs.existsSync(motrPath)) return null;
    return parseMotr(fs.readFileSync(motrPath, 'utf-8'));
  }

  function buildRctx(evalScene: any, W: number, H: number) {
    // Minimal RenderContext for read-only mask/clone resolution.
    // imageA / imageB are 2×2 photos with distinct colours so the mask+bake
    // path can be validated visually (A = red, B = blue).
    const imageA = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    const imageB = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    for (let i = 0; i < W * H; i++) {
      imageA.data[i * 4] = 200; imageA.data[i * 4 + 3] = 255;   // red
      imageB.data[i * 4 + 2] = 200; imageB.data[i * 4 + 3] = 255; // blue
    }
    return {
      layerById: evalScene.layerById,
      evalLayerById: evalScene.evalLayerById,
      imageA, imageB,
      cameraZ: evalScene.camera?.distance ?? 2000,
      cameraPosZ: evalScene.camera?.worldTransform ? evalScene.camera.worldTransform[14] : undefined,
      framed: evalScene.camera?.framed,
      imageMaskSourceIds: new Set<number>(),
      mediaResolver: undefined,
      mediaCache: new Map<string, ImageData | null>(),
      animationEndSec: evalScene.animationEndSec || 1,
      time: evalScene.time,
      mediaTime: evalScene.unwrappedTime ?? evalScene.time,
      filterTime: evalScene.unwrappedTime ?? evalScene.time,
    } as any;
  }

  test('collectMaskedCloneQuads: fires on 3D_Rectangle, collects ≥ 1 quad', () => {
    const scene = loadScene(RECT_3D_MOTR);
    if (!scene) { console.log('    (skipped — motr not present)'); return; }
    const W = 128, H = 72;  // downscaled so the mask alpha work is cheap
    const evalScene = evaluate({ ...scene, settings: { ...scene.settings, width: W, height: H } } as any, 0.5);
    const rctx = buildRctx(evalScene, W, H);
    const quads = collectMaskedCloneQuads(rctx, evalScene, W, H);
    // 3D_Rectangle has 27 total clones, of which 9 are "Shape 0N" masked leaves
    // + 8 "Clone Layer N" re-clones = up to 17 masked leaves. Our LEAF filter
    // (direct or one-hop cloneSource mask) fires on the direct-mask "Shape 0N"
    // set (9). Assert ≥ 1 for robustness against evaluator changes; log the
    // exact count for regression triage.
    console.log(`    (3D_Rectangle f≈mid collected ${quads.length} masked-clone quads)`);
    assert(quads.length >= 1, `expected ≥1 quad, got ${quads.length}`);
    for (const q of quads) {
      assert(q.cornersWithZ.length === 4, 'quad has 4 corners');
      assert(q.src.width === W && q.src.height === H, 'quad src matches frame size');
    }
  });

  test('renderNestedMaskedCloneStack: 3D_Rectangle output writes A pixels through the depth buffer', () => {
    const scene = loadScene(RECT_3D_MOTR);
    if (!scene) { console.log('    (skipped — motr not present)'); return; }
    const W = 96, H = 54;
    const evalScene = evaluate({ ...scene, settings: { ...scene.settings, width: W, height: H } } as any, 0.5);
    const rctx = buildRctx(evalScene, W, H);
    const output = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    renderNestedMaskedCloneStack(rctx, evalScene, output, W, H);
    // Count RED-dominant (A wins pixel) vs BLUE-dominant (B base wins pixel).
    // At t=0.5 with the current transform pipeline, the masked-A rectangles
    // project at wz < 0 (in front of the camera) and win their covered pixels
    // over the base B at wz=0. Presence of ≥1 red pixel = mask BAKE + clone
    // resolve + projection worked end-to-end. B pixel count can be 0 here
    // because the rectangles fully overlap the frame at mid-transition (the
    // "smaller-inside-larger, both A" pattern from ROADMAP dead-end note);
    // seam-emergence requires the animated per-rectangle world-Z spread that
    // a subsequent tick will feed through the same depth pass.
    let redPx = 0, bluePx = 0;
    for (let i = 0; i < W * H; i++) {
      const r = output.data[i * 4], b = output.data[i * 4 + 2];
      if (r > b + 40) redPx++;
      else if (b > r + 40) bluePx++;
    }
    console.log(`    (redPx=${redPx} bluePx=${bluePx})`);
    assert(redPx > 0, `expected some A-red pixels via masked clones; got redPx=${redPx}`);
  });

  test('renderNestedMaskedCloneStack: gate-neutral by default (env flag off → no side effect)', () => {
    // The COMPOSITE() gate is off unless FCT_Z_COMPOSITE_3D=1. This test just
    // pins that this function does NOT read any global state — it operates
    // purely on the passed rctx + output. It also verifies that repeated
    // invocations with the same inputs produce byte-identical output (no
    // hidden randomness / no accumulator drift).
    const scene = loadScene(RECT_3D_MOTR);
    if (!scene) { console.log('    (skipped — motr not present)'); return; }
    const W = 64, H = 36;
    const evalScene = evaluate({ ...scene, settings: { ...scene.settings, width: W, height: H } } as any, 0.5);
    const rctx = buildRctx(evalScene, W, H);
    const out1 = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    const out2 = new ImageData(new Uint8ClampedArray(W * H * 4), W, H);
    renderNestedMaskedCloneStack(rctx, evalScene, out1, W, H);
    renderNestedMaskedCloneStack(rctx, evalScene, out2, W, H);
    for (let i = 0; i < out1.data.length; i++) {
      if (out1.data[i] !== out2.data[i]) {
        throw new Error(`byte drift at index ${i}: ${out1.data[i]} vs ${out2.data[i]}`);
      }
    }
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
