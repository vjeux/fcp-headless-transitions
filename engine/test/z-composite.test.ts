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
  type DepthQuad,
} from '../src/compositor/z-composite.js';
import { mat4Identity, mat4Translate } from '../src/evaluator/index.js';
import { parseMotr } from '../src/parser/index.js';
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

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
