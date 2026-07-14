/**
 * Compositor — MINIMAL Motion Emitter particle simulation + render (ROADMAP S3 / T-B2).
 *
 * Motion's particle Emitter (factory description "Emitter") owns one or more Particle
 * Cell children (factory "Particle Cell"). Each cell spawns per-second at `birthRate`
 * particles into a direction cone (Emitter.emissionAngle ± emissionRange/2) at
 * initial velocity `speed`; a per-cell Gravity behavior adds constant downward
 * acceleration. Motion runs this from `cell.timing.in` to `cell.timing.out` (both
 * often NEGATIVE, meaning "the emitter has been running for N seconds before the
 * transition starts" — so at scene t=0 a stream of already-airborne particles
 * blankets the frame; see Stylized/Nature Diagonal, cell "hexagon" in=-4.838s).
 *
 * This module is the T-B2 MINIMAL SIM: deterministic spawn+advect+gravity, composited
 * as flat-COLOUR dots (no per-particle sprite; no colour/scale/opacity-over-life ramp —
 * that's T-B3). Precondition: T-B1 populates `scene.emitters` / `scene.particleCells`;
 * the evaluator marks the enclosing Emitter LAYER visible=true for the rig-selected
 * variant (Diagonal's rig picks 1 of 8 shape variants; the other 7 emitters end up at
 * opacity 0, evaluator visible=false). We sim ONLY cells whose parent emitter layer
 * is visible.
 *
 * COORDS: Motion internal space is Y-DOWN (blit.ts screen_y = height/2 + worldY —
 * verified against Push's B-enters-top). Motion's Emission Angle: +90° = UP on the
 * canvas (FCP inspector convention), so the direction vector in the Y-DOWN world is
 * (cos(angle), −sin(angle)) — this is what places Diagonal's stream correctly on the
 * upper-left→lower-right diagonal (emitter world (-1200,-60) + angle 5.198 rad →
 * cos=+0.46, −sin=+0.89 → right+down into frame).
 *
 * NON-HARDCODE: fires on any scene with ≥1 visible Emitter layer (Wipes/Stylized
 * Diagonal, Movements/Drop_In, Movements/Earthquake, Stylized/Glide/Close_and_Open/
 * Up-Over/Center). Zero transition-name checks.
 */
import type { EvaluatedScene, EvaluatedLayer } from '../evaluator/index.js';
import type { ParticleCellParams, EmitterParams, Curve, Layer } from '../types.js';
import { evaluateCurve, timeToSeconds } from '../evaluator/curves.js';
import { tintPixelHardLight } from './field-texture.js';
/** Media resolver signature (matches compositor/api mediaResolver). */
type MediaResolver = (url: string, timeSec?: number, absolute?: boolean) => ImageData | null;

/**
 * A resolved particle SPRITE: the cell's Particle Source image (e.g. hexagon_white.png,
 * 256×256 with alpha) plus the source LAYER's own scale/opacity, which Motion folds into
 * every emitted particle's on-screen size. `baseScale` = source-layer uniform scale;
 * `baseOpacity` = source-layer opacity. Cached per source layer id.
 */
interface Sprite {
  img: ImageData;
  nativeW: number;
  nativeH: number;
  baseScaleX: number;
  baseScaleY: number;
  baseOpacity: number;
}

/**
 * Resolve a cell's Particle Source layer → its bundled sprite image + native size +
 * the source layer's own transform scale/opacity. Returns null when the source isn't a
 * resolvable media image (in which case the caller falls back to flat dots). Cached.
 */
function resolveSprite(
  cell: ParticleCellParams,
  scene: EvaluatedScene,
  mediaResolver: MediaResolver | undefined,
  cache: Map<number, Sprite | null>,
): Sprite | null {
  if (!mediaResolver || cell.particleSourceId === undefined) return null;
  const cached = cache.get(cell.particleSourceId);
  if (cached !== undefined) return cached;
  const srcLayer: Layer | undefined = scene.layerById.get(cell.particleSourceId);
  let out: Sprite | null = null;
  if (srcLayer && srcLayer.source && srcLayer.source.type === 'media') {
    const img = mediaResolver(srcLayer.source.url);
    if (img && img.width > 0 && img.height > 0) {
      const t = srcLayer.transform;
      out = {
        img,
        nativeW: img.width,
        nativeH: img.height,
        baseScaleX: t?.scaleX !== undefined ? numAt(t.scaleX) : 1,
        baseScaleY: t?.scaleY !== undefined ? numAt(t.scaleY) : 1,
        baseOpacity: t?.opacity !== undefined ? numAt(t.opacity) : 1,
      };
    }
  }
  cache.set(cell.particleSourceId, out);
  return out;
}

/**
 * Deterministic hash → uniform [0,1). Same particle index + seed → same random
 * value across runs, so the composited frame is byte-identical across renders.
 * splitmix64-derived: fast, single 32-bit output, no state carried between calls.
 */
function hash01(a: number, b: number, c: number): number {
  let h = ((a | 0) * 0x9e3779b1 ^ (b | 0) * 0x85ebca77 ^ (c | 0) * 0xc2b2ae3d) >>> 0;
  h = ((h ^ (h >>> 16)) * 0x85ebca6b) >>> 0;
  h = ((h ^ (h >>> 13)) * 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 0x1_0000_0000;
}

/** Numeric-or-Curve reader (curves evaluated at scene time 0 — birth rate / life / speed
 *  animation is rare on cells, and T-B2 uses the static/initial value for the minimal sim). */
function numAt(v: number | Curve, timeSec: number = 0): number {
  if (typeof v === 'number') return v;
  return evaluateCurve(v, timeSec);
}

/** Cell's active window on the scene timeline (seconds). Motion authors emitter
 *  cells with a NEGATIVE `in` to "pre-run" the emitter (particles already airborne
 *  at scene t=0). */
function cellWindow(cell: ParticleCellParams): { inSec: number; outSec: number } {
  const t = cell.timing;
  if (!t) return { inSec: 0, outSec: Infinity };
  return {
    inSec: timeToSeconds(t.in),
    outSec: timeToSeconds(t.out),
  };
}

/**
 * Hard cap on total simulated particles per composite call. A far outer safety
 * bound: at Diagonal-typical parameters (6 visible cells, birthRate ≤ 51,
 * pre-run window ≤ 10s, life 10s) we expect ~1500 alive at once. Cap at 4000 so a
 * pathological scene (very high birthRate × very long pre-run) can't blow up
 * per-frame work — anything past the cap is simply skipped (deterministic order).
 */
const MAX_PARTICLES_PER_FRAME = 4000;

/** Skip cells whose animation is completely stationary + off-frame (would only paint
 *  dots in a non-visible strip). Zero cost when the cell would contribute nothing. */
function cellContributes(cell: ParticleCellParams, emitter: EmitterParams): boolean {
  if (numAt(cell.birthRate) <= 0 && numAt(cell.initialNumber) <= 0) return false;
  if (numAt(cell.life) <= 0) return false;
  if (emitter.emissionRange < 0) return false;
  return true;
}

/**
 * Simulate one cell + composite each alive particle as a flat-COLOUR dot. Called
 * once per visible cell. Deterministic: identical params → identical dots.
 *
 * Motion's emitter runs continuously from cell.timing.in to cell.timing.out at
 * birthRate particles/sec. Rather than tracking per-particle state across a
 * simulation stepper, we spawn particles at DISCRETE integer indices and compute
 * each particle's state analytically from its birth time:
 *   birthTime_i = inSec + i / birthRate
 *   elapsed     = sceneTime − birthTime_i   (skip if <0 or >life)
 *   dir_i       = angle ± range/2, hashed by (cellSeed, i)  → uniform in the arc
 *   pos_i       = emitterWorldPos
 *               + (cos(dir) · speed) · elapsed          , X
 *               + (−sin(dir) · speed) · elapsed + ½·g·elapsed²   , Y-down
 *   screen_i    = (pos_i.x + W/2, pos_i.y + H/2)
 * Motion accumulates identical formulas per particle; the analytical form is
 * pixel-equivalent to running a per-step integrator and orders-of-magnitude
 * cheaper for 100–1500 alive particles per frame.
 */
function simulateAndCompositeCell(
  output: ImageData,
  emitter: EmitterParams,
  cell: ParticleCellParams,
  emEval: EvaluatedLayer,
  sceneTime: number,
  color: { r: number; g: number; b: number; a: number },
  dotRadius: number,
  particleBudget: number,
  sprite: Sprite | null,
  groupTint: { r: number; g: number; b: number; intensity: number; mix: number } | null,
  groupFade: number = 1,
): number {
  const win = cellWindow(cell);
  if (sceneTime < win.inSec) return 0;

  const birthRate = numAt(cell.birthRate);
  const initialNumber = Math.round(numAt(cell.initialNumber));
  const life = numAt(cell.life);
  const speed = numAt(cell.speed);
  const gravity = cell.gravity ? numAt(cell.gravity.acceleration) : 0;
  const spin = cell.spin !== undefined ? numAt(cell.spin) : 0; // radians/sec

  // Per-cell appearance (T-B3). colorMode: 0=Original (source colour, no tint),
  // 1=Colorize (tint by cell colour), others fall back to no-tint. Cell opacity ×
  // source-layer opacity is the base alpha; scaleX/Y × source-layer scale sizes it.
  const doTint = cell.colorMode === 1 && cell.color !== undefined;
  const cellColor = doTint ? cell.color! : { r: 1, g: 1, b: 1 };
  // The particle-group TintFx (e.g. Diagonal's green) is applied per-pixel inside
  // drawSprite via the DECODED hard-light two-leg shader (tintPixelHardLight), NOT
  // pre-folded into cellColor as a `luma·color` multiply. A white hexagon sprite
  // (luma≈1) under hard-light stays near-white (pale) — matching FCP's PALE green
  // massed field — whereas the old multiply drove it to a saturated dark green
  // (255·0.30,255·0.77,255·0.29)=(77,197,73). groupTint is threaded to drawSprite.
  const cellOpacity = cell.opacity !== undefined ? cell.opacity : 1;
  const cScaleX = cell.scaleX !== undefined ? cell.scaleX : 1;
  const cScaleY = cell.scaleY !== undefined ? cell.scaleY : 1;
  const scaleRand = cell.scaleRandomness ?? 0;

  // Emitter world position (Motion internal Y-DOWN; blit.ts convention).
  const emX = emEval.worldTransform[12];
  const emY = emEval.worldTransform[13];
  const emAngle = emitter.emissionAngle;
  const emRange = emitter.emissionRange;
  const halfRange = emRange * 0.5;

  // How many particles have been born by `sceneTime`? Stream started at
  // cell.timing.in (possibly negative). Cap at particleBudget so a pathological
  // long pre-run stays bounded.
  const streamAge = sceneTime - win.inSec;
  const streamed = Math.min(particleBudget, Math.max(0, Math.floor(streamAge * birthRate)));
  const bursts = Math.min(particleBudget - streamed, initialNumber);
  const total = streamed + bursts;
  if (total <= 0) return 0;

  const W = output.width, H = output.height;
  const seedA = (emitter.emitterSeed | 0) ^ 0x9e3779b1;
  const seedB = (cell.randomSeed | 0) ^ 0x85ebca77;

  let drawn = 0;
  for (let i = 0; i < total; i++) {
    // Streamed particles at index i are born at inSec + i/birthRate; burst particles
    // (initialNumber) are born at inSec — Motion fires them all together at emitter
    // ignition. Motion's actual seeded stream may differ in per-particle ORDER (a
    // permutation) but not in the aggregate density of dots visible at t; for a
    // MINIMAL flat-colour composite the aggregate is what the PSNR sees.
    const isBurst = i >= streamed;
    const birthTime = isBurst ? win.inSec : win.inSec + (i / birthRate);
    const elapsed = sceneTime - birthTime;
    if (elapsed < 0 || elapsed > life) continue;

    // Emission direction: uniform in [angle-halfRange, angle+halfRange]. Seeded by
    // (emitterSeed, cellSeed, particle-index) → identical dots every render.
    const u = hash01(seedA, seedB, i);
    const dir = emAngle + (u - 0.5) * 2 * halfRange;

    // World-space velocity. Motion Emission Angle: +90° = UP on canvas → direction
    // in Y-DOWN world is (cos(dir), −sin(dir)); +gravity pulls +Y (down on screen).
    const vx = Math.cos(dir) * speed;
    const vy = -Math.sin(dir) * speed;

    // Position at elapsed. Kinematic: p = p0 + v·t + ½·g·t² (down = +Y).
    const px = emX + vx * elapsed;
    const py = emY + vy * elapsed + 0.5 * gravity * elapsed * elapsed;

    // Screen-space (Y-DOWN: screen_y = H/2 + motionY).
    const sx = W * 0.5 + px;
    const sy = H * 0.5 + py;

    if (sprite) {
      // Per-particle size: native × source-layer scale × cell scale × per-particle
      // random scale variation (Scale Randomness is a ± fraction of the base size).
      const rScale = scaleRand > 0 ? 1 + (hash01(seedA ^ 0x2545f491, seedB, i) - 0.5) * 2 * scaleRand : 1;
      const destW = sprite.nativeW * sprite.baseScaleX * cScaleX * rScale;
      const destH = sprite.nativeH * sprite.baseScaleY * cScaleY * rScale;
      const maxHalf = Math.max(destW, destH) * 0.5;
      if (sx + maxHalf < 0 || sx - maxHalf >= W || sy + maxHalf < 0 || sy - maxHalf >= H) continue;
      // Rotation: base spin (radians/sec) accumulated over the particle's life.
      const rot = spin * elapsed;
      // Over-life opacity: Motion's default particle envelope fades in over the first
      // ~15% of life and out over the last ~15% (a trapezoid), so newborn/dying
      // particles are translucent. lifeFrac ∈ [0,1].
      const lifeFrac = life > 0 ? elapsed / life : 0;
      const fade = lifeFrac < 0.15 ? lifeFrac / 0.15
                 : lifeFrac > 0.85 ? (1 - lifeFrac) / 0.15
                 : 1;
      const alpha = cellOpacity * sprite.baseOpacity * fade * groupFade;
      drawSprite(output, sprite, sx, sy, destW, destH, rot, cellColor, alpha, groupTint);
    } else {
      // Cull dots whose bbox is entirely off-frame.
      if (sx + dotRadius < 0 || sx - dotRadius >= W ||
          sy + dotRadius < 0 || sy - dotRadius >= H) continue;
      drawDot(output, sx, sy, dotRadius, color);
    }
    drawn++;
  }
  return drawn;
}

/**
 * Rasterize a filled circle at (cx, cy) with radius r, source-over. Antialiased
 * via edge coverage (1-pixel ramp). Flat colour + fixed radius = correct match to
 * "minimal flat-colour composite" for T-B2 (T-B3 introduces per-particle scale +
 * colour-over-life). Small r (≤6) makes this ~40 pixels/particle at worst — a full
 * 1500-particle frame is ~60k pixels, well under one image-copy pass.
 */
function drawDot(
  output: ImageData,
  cx: number, cy: number, r: number,
  color: { r: number; g: number; b: number; a: number },
): void {
  const W = output.width, H = output.height;
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(W - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(H - 1, Math.ceil(cy + r));
  const rSq = r * r;
  const rInner = Math.max(0, r - 1);
  const rInnerSq = rInner * rInner;
  const cr = color.r, cg = color.g, cb = color.b, ca = color.a;
  const data = output.data;
  for (let y = y0; y <= y1; y++) {
    const dy = y + 0.5 - cy;
    const dySq = dy * dy;
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx;
      const dSq = dx * dx + dySq;
      if (dSq >= rSq) continue;
      // Edge coverage: fully opaque inside rInner, ramp to 0 across last pixel.
      let cov = 1;
      if (dSq > rInnerSq && rSq > rInnerSq) {
        cov = (rSq - dSq) / (rSq - rInnerSq);
      }
      const sa = ca * cov;
      if (sa <= 0) continue;
      const di = (y * W + x) * 4;
      const db = data[di + 3] / 255;
      const outA = sa + db * (1 - sa);
      if (outA <= 0) continue;
      data[di]     = Math.round((cr * sa + data[di]     * db * (1 - sa)) / outA);
      data[di + 1] = Math.round((cg * sa + data[di + 1] * db * (1 - sa)) / outA);
      data[di + 2] = Math.round((cb * sa + data[di + 2] * db * (1 - sa)) / outA);
      data[di + 3] = Math.round(outA * 255);
    }
  }
}

/**
 * Composite a scaled + rotated + tinted particle SPRITE at (cx, cy), source-over.
 *
 * The sprite (e.g. hexagon_white.png, a white shape on transparent) is Motion's
 * Particle Source image. Motion draws each particle as that image, scaled to
 * `destW × destH` on screen, rotated by `rot` (radians), TINTED by (tr,tg,tb) — the
 * particle multiplies its RGB by the cell colour — and faded to `alpha` (cell opacity
 * × source-layer opacity × over-life envelope). We iterate the destination bbox and,
 * for each pixel, inverse-map into sprite UV (rotation + scale), bilinear-sample the
 * sprite's RGBA, tint, premultiply by `alpha`, and blend source-over. This is a real
 * textured-quad blit — the same operation Motion's GPU does per particle, on the CPU.
 */
function drawSprite(
  output: ImageData,
  sprite: Sprite,
  cx: number, cy: number,
  destW: number, destH: number,
  rot: number,
  tint: { r: number; g: number; b: number },
  alpha: number,
  groupTint?: { r: number; g: number; b: number; intensity: number; mix: number } | null,
): void {
  if (alpha <= 0 || destW <= 0 || destH <= 0) return;
  const W = output.width, H = output.height, data = output.data;
  const sImg = sprite.img.data, sW = sprite.img.width, sH = sprite.img.height;
  const hw = destW * 0.5, hh = destH * 0.5;
  // Rotated half-extent bounds the destination bbox (conservative AABB of the quad).
  const cosr = Math.cos(rot), sinr = Math.sin(rot);
  const ext = Math.abs(hw * cosr) + Math.abs(hh * sinr);
  const eyt = Math.abs(hw * sinr) + Math.abs(hh * cosr);
  const x0 = Math.max(0, Math.floor(cx - ext));
  const x1 = Math.min(W - 1, Math.ceil(cx + ext));
  const y0 = Math.max(0, Math.floor(cy - eyt));
  const y1 = Math.min(H - 1, Math.ceil(cy + eyt));
  if (x1 < x0 || y1 < y0) return;
  const tr = tint.r, tg = tint.g, tb = tint.b;
  // Inverse rotation (screen→local): rotate by −rot, then /halfsize to get [-1,1] UV.
  for (let y = y0; y <= y1; y++) {
    const dyc = y + 0.5 - cy;
    for (let x = x0; x <= x1; x++) {
      const dxc = x + 0.5 - cx;
      // Screen delta → local (un-rotate).
      const lx = dxc * cosr + dyc * sinr;
      const ly = -dxc * sinr + dyc * cosr;
      // Local → sprite pixel coords. lx∈[-hw,hw] maps to u∈[0,sW].
      const u = (lx / destW + 0.5) * sW;
      const v = (ly / destH + 0.5) * sH;
      if (u < 0 || u >= sW || v < 0 || v >= sH) continue;
      // Bilinear sample.
      const u0 = Math.floor(u - 0.5), v0 = Math.floor(v - 0.5);
      const fu = u - 0.5 - u0, fv = v - 0.5 - v0;
      const u0c = u0 < 0 ? 0 : u0 >= sW ? sW - 1 : u0;
      const v0c = v0 < 0 ? 0 : v0 >= sH ? sH - 1 : v0;
      const u1c = u0 + 1 < 0 ? 0 : u0 + 1 >= sW ? sW - 1 : u0 + 1;
      const v1c = v0 + 1 < 0 ? 0 : v0 + 1 >= sH ? sH - 1 : v0 + 1;
      const i00 = (v0c * sW + u0c) * 4, i10 = (v0c * sW + u1c) * 4;
      const i01 = (v1c * sW + u0c) * 4, i11 = (v1c * sW + u1c) * 4;
      const w00 = (1 - fu) * (1 - fv), w10 = fu * (1 - fv), w01 = (1 - fu) * fv, w11 = fu * fv;
      const sr = sImg[i00] * w00 + sImg[i10] * w10 + sImg[i01] * w01 + sImg[i11] * w11;
      const sg = sImg[i00 + 1] * w00 + sImg[i10 + 1] * w10 + sImg[i01 + 1] * w01 + sImg[i11 + 1] * w11;
      const sb = sImg[i00 + 2] * w00 + sImg[i10 + 2] * w10 + sImg[i01 + 2] * w01 + sImg[i11 + 2] * w11;
      const saSrc = sImg[i00 + 3] * w00 + sImg[i10 + 3] * w10 + sImg[i01 + 3] * w01 + sImg[i11 + 3] * w11;
      const sa = (saSrc / 255) * alpha;
      if (sa <= 0) continue;
      // Tint: multiply sprite RGB (0-255) by the cell colour (0-1), THEN apply the
      // particle-group TintFx via the decoded hard-light shader (leaves white sprite
      // highlights pale rather than darkening them to a saturated green).
      let cr = sr * tr, cg = sg * tg, cb = sb * tb;
      if (groupTint) {
        const amt = groupTint.intensity * groupTint.mix;
        if (amt > 0) [cr, cg, cb] = tintPixelHardLight(cr, cg, cb, groupTint.r, groupTint.g, groupTint.b, amt);
      }
      const di = (y * W + x) * 4;
      const db = data[di + 3] / 255;
      const outA = sa + db * (1 - sa);
      if (outA <= 0) continue;
      data[di]     = Math.round((cr * sa + data[di]     * db * (1 - sa)) / outA);
      data[di + 1] = Math.round((cg * sa + data[di + 1] * db * (1 - sa)) / outA);
      data[di + 2] = Math.round((cb * sa + data[di + 2] * db * (1 - sa)) / outA);
      data[di + 3] = Math.round(outA * 255);
    }
  }
}

/**
 * Structural probe: does the scene contain ≥1 Emitter with ≥1 Particle Cell that
 * would actually contribute particles? Used by:
 *   - `applyEmitterSim` to early-out on non-emitter scenes,
 *   - `test/no-hardcode.test.ts` to prove this is a GENERIC primitive
 *     (fires on Diagonal ×2, Drop_In, Earthquake, Close_and_Open, Glide, Up-Over, …).
 * No transition names, no factoryID magic — pure scene-shape.
 */
export function hasSimulatableEmitter(scene: {
  emitters?: Map<number, EmitterParams>;
  particleCells?: Map<number, ParticleCellParams>;
}): boolean {
  if (!scene.emitters || !scene.particleCells) return false;
  for (const cell of scene.particleCells.values()) {
    if (cell.emitterId === undefined) continue;
    const em = scene.emitters.get(cell.emitterId);
    if (!em) continue;
    if (cellContributes(cell, em)) return true;
  }
  return false;
}

/**
 * MINIMAL flat-colour emitter sim + render. Iterate every VISIBLE cell whose parent
 * Emitter layer is visible (rig-suppressed variants have opacity 0 → visible=false,
 * so this naturally scopes to the rig-selected shape/color variant), simulate
 * deterministically, composite as flat-COLOUR dots on top of the frame.
 *
 * SAFETY / COST: total particles across all cells is capped at
 * MAX_PARTICLES_PER_FRAME (4000). Each cell's contribution is bounded by that
 * remaining budget; when the budget hits 0 the remaining cells silently produce
 * zero particles that frame (deterministic — same input, same output). At Diagonal
 * defaults the total is ~1500, comfortably under the cap.
 *
 * NEUTRALITY: no-op when scene has no emitters (early-out via hasSimulatableEmitter),
 * so non-particle transitions are byte-identical to pre-T-B2.
 */
export function applyEmitterSim(
  output: ImageData,
  scene: EvaluatedScene,
  motrScene: {
    emitters?: Map<number, EmitterParams>;
    particleCells?: Map<number, ParticleCellParams>;
  },
  mediaResolver?: MediaResolver,
  groupTint?: { r: number; g: number; b: number; intensity: number; mix: number } | null,
  groupFade: number = 1,
): void {
  if (!hasSimulatableEmitter(motrScene)) return;
  if (groupFade <= 0) return; // whole particle group not yet faded in

  // Iterate cells in a STABLE order (numeric id) so identical scenes render identical
  // frames across Map iteration whims.
  const cellIds = [...motrScene.particleCells!.keys()].sort((a, b) => a - b);
  const sceneTime = scene.unwrappedTime ?? scene.time;
  const spriteCache = new Map<number, Sprite | null>();

  let budget = MAX_PARTICLES_PER_FRAME;
  // Flat-dot fallback colour (used only when the cell's Particle Source can't be
  // resolved to a sprite): near-white, low alpha.
  const color = { r: 240, g: 240, b: 240, a: 0.10 };
  const dotRadius = 2;

  for (const cellId of cellIds) {
    if (budget <= 0) break;
    const cell = motrScene.particleCells!.get(cellId)!;
    if (cell.emitterId === undefined) continue;
    const emitter = motrScene.emitters!.get(cell.emitterId);
    if (!emitter) continue;
    if (!cellContributes(cell, emitter)) continue;
    // Gate: parent Emitter LAYER must be visible in the evaluator. Rig suppression
    // of variants zeros their opacity → visible=false, so this drops the 7 (out of
    // 8) Diagonal shape variants the rig didn't pick.
    const emEval = scene.evalLayerById.get(emitter.id);
    if (!emEval || !emEval.visible) continue;
    // The cell itself may also be individually rig-suppressed under a visible parent
    // (Diagonal's Emitter-hexagons visible → 4 Hexagon-N cells all visible, none
    // suppressed). Belt-and-suspenders: gate on the cell's evaluator layer too.
    const cellEval = scene.evalLayerById.get(cellId);
    if (!cellEval || !cellEval.visible) continue;

    // Resolve the cell's Particle Source sprite (T-B3). Null → flat-dot fallback.
    const sprite = resolveSprite(cell, scene, mediaResolver, spriteCache);

    const drawn = simulateAndCompositeCell(
      output, emitter, cell, emEval, sceneTime,
      color, dotRadius, budget, sprite, groupTint ?? null, groupFade,
    );
    budget -= drawn;
  }
}
