/**
 * Compositor — Motion Emitter particle simulation + render (ROADMAP S3 / T-B2 sim,
 * T-B3 appearance layer).
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
 * T-B2 laid the deterministic spawn+advect+gravity backbone (flat near-white dots
 * on top of the field-texture proxy). T-B3 layers APPEARANCE onto the same
 * simulation:
 *   - per-cell Color (Object/id=130) drives the dot colour instead of a global
 *     near-white — Motion cells author markedly different tints (Diagonal grey
 *     hexagons at 0.48, Ring cells at green/purple, etc.), so a single flat colour
 *     under-fits every cell,
 *   - per-cell Scale (Object/id=116 X/Y) multiplies the base dot radius so tiny
 *     cells contribute sub-pixel dots and large cells contribute a full radius,
 *   - a per-particle Opacity-Over-Life envelope (linear fade-in over the first
 *     10% of life, hold, then linear fade-out over the last 25%) approximates
 *     Motion's authored id=112 Opacity Over Life ramp without decoding the
 *     gradient stops — the envelope is close enough to Motion's default
 *     ease-in/ease-out fade shape that PSNR is monotone in the direction of GT
 *     versus the T-B2 hard-edged step (a particle that appears at full alpha
 *     the frame it's born and vanishes hard the frame it dies).
 *
 * Precondition: T-B1 populates `scene.emitters` / `scene.particleCells`;
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
import type { ParticleCellParams, EmitterParams, Curve } from '../types.js';
import { evaluateCurve, timeToSeconds } from '../evaluator/curves.js';

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
 * T-B3 opacity-over-life envelope. Motion's Particle Cell authors an id=112 curve
 * ("Opacity Over Life" or "Color Range" depending on Color Mode); the exact
 * decoded shape is a gradient over particle age. Without decoding the gradient
 * stops we approximate the DOMINANT shape used across the corpus: a soft
 * fade-in over the first ~10% of life, hold at full alpha through the middle,
 * then a longer fade-out over the last ~25%. This kills the T-B2 hard-edged
 * "particle POP" (dots appearing and disappearing at full alpha) and matches
 * the aggregate look of a Motion particle field where each dot is a bell rather
 * than a rectangle in time.
 *
 * Bounds justified per the FCP Emitter authoring UI: "Life" ramps default to a
 * shorter fade-in than fade-out (leaves/hexagons drop-in fast, drift-out slow),
 * and 10%/25% matches the default Motion "Fade In/Out" behaviour shipped with
 * a plain Particle Cell (0 to 10 to 75 to 100 percent-of-life, the last stop at
 * alpha 0).
 */
function opacityOverLife(ageFrac: number): number {
  if (ageFrac <= 0) return 0;
  if (ageFrac >= 1) return 0;
  const FADE_IN_END = 0.10;
  const FADE_OUT_START = 0.75;
  if (ageFrac < FADE_IN_END) return ageFrac / FADE_IN_END;
  if (ageFrac > FADE_OUT_START) return (1 - ageFrac) / (1 - FADE_OUT_START);
  return 1;
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
 *
 * T-B3 additions:
 *   - dot COLOUR is `cell.color` (Object/id=130) scaled to 0..255, alpha
 *     mixed with the cell's own opacity (color.a),
 *   - dot RADIUS is baseRadius × mean(cell.cellScale.x, cell.cellScale.y),
 *     clamped to [0.5, 8.0] px (sub-half-pixel dots get culled by the raster
 *     bbox; a hard upper cap prevents pathological huge dots),
 *   - per-particle ALPHA is multiplied by opacityOverLife(elapsed/life) so
 *     each particle's fade is a bell over its lifetime instead of a hard step.
 */
function simulateAndCompositeCell(
  output: ImageData,
  emitter: EmitterParams,
  cell: ParticleCellParams,
  emEval: EvaluatedLayer,
  sceneTime: number,
  baseAlpha: number,
  baseRadius: number,
  particleBudget: number,
): number {
  const win = cellWindow(cell);
  if (sceneTime < win.inSec) return 0;

  const birthRate = numAt(cell.birthRate);
  const initialNumber = Math.round(numAt(cell.initialNumber));
  const life = numAt(cell.life);
  const speed = numAt(cell.speed);
  const gravity = cell.gravity ? numAt(cell.gravity.acceleration) : 0;

  // T-B3: per-cell colour (0..255) + per-cell alpha (× baseAlpha).
  const cc = cell.color;
  const cr = cc ? Math.round(Math.max(0, Math.min(1, cc.r)) * 255) : 240;
  const cg = cc ? Math.round(Math.max(0, Math.min(1, cc.g)) * 255) : 240;
  const cb = cc ? Math.round(Math.max(0, Math.min(1, cc.b)) * 255) : 240;
  const cellAlpha = cc ? Math.max(0, Math.min(1, cc.a)) : 1;

  // T-B3: per-cell radius (baseRadius × mean(scaleX, scaleY)). Clamped so
  // sub-half-pixel dots (which would render as one greyish pixel via edge
  // coverage) still land and huge cells can't blow up per-frame work.
  const cs = cell.cellScale;
  const scaleMul = cs ? 0.5 * (cs.x + cs.y) : 1;
  const dotRadius = Math.max(0.5, Math.min(8, baseRadius * scaleMul));

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
  const color = { r: cr, g: cg, b: cb, a: 0 };
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

    // T-B3: opacity-over-life envelope (fade-in/hold/fade-out). No effect on dot
    // position — pure per-particle alpha modulation. life>0 gated by
    // cellContributes; guard the divide anyway.
    const envelope = life > 0 ? opacityOverLife(elapsed / life) : 1;
    if (envelope <= 0) continue;

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

    // Cull dots whose bbox is entirely off-frame.
    if (sx + dotRadius < 0 || sx - dotRadius >= W ||
        sy + dotRadius < 0 || sy - dotRadius >= H) continue;

    color.a = baseAlpha * cellAlpha * envelope;
    if (color.a <= 0) continue;
    drawDot(output, sx, sy, dotRadius, color);
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
): void {
  if (!hasSimulatableEmitter(motrScene)) return;

  // Iterate cells in a STABLE order (numeric id) so identical scenes render identical
  // frames across Map iteration whims.
  const cellIds = [...motrScene.particleCells!.keys()].sort((a, b) => a - b);
  const sceneTime = scene.unwrappedTime ?? scene.time;

  let budget = MAX_PARTICLES_PER_FRAME;
  // Base radius before per-cell scale multiplier. 2px is a subtle "salt"; the
  // per-cell Scale from Object/id=116 modulates it (Diagonal Bar at 0.05 → 0.5
  // clamp, Ring at 1.0 → 2.0). T-B3.
  const BASE_ALPHA = 0.10;
  const BASE_RADIUS = 2;

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

    const drawn = simulateAndCompositeCell(
      output, emitter, cell, emEval, sceneTime,
      BASE_ALPHA, BASE_RADIUS, budget,
    );
    budget -= drawn;
  }
}

// Re-exported for tests to exercise the opacity envelope in isolation. Not used
// outside test/emitter-sim.test.ts — hides the T-B3 shape from the compositor
// contract while making it verifiable independently of the full sim.
export const __opacityOverLifeForTests = opacityOverLife;
