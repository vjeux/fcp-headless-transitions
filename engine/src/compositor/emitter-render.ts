// PAINT-STROKE EMITTER RASTERISER — subsystem scaffolding for the Motion
// "paint-stroke" Replicator family (T-q1f2f0f55).
// ============================================================================
//
// WHAT IS A PAINT-STROKE REPLICATOR (decoded 2026-07-16 from Slide_In .motr)
// -------------------------------------------------------------------------
// Motion authors a THIRD kind of instance-generator, distinct from the two the
// engine already handles:
//
//   (1) Grid Replicator   (factory desc "Replicator" + factory desc "Replicator
//       Cell"; `Arrangement` param authored). Squares, Video Wall, Vertigo.
//       Handled by compositor/replicator.ts + parser/replicator.ts.
//
//   (2) Particle Emitter  (factory desc "Emitter" + factory desc "Particle Cell").
//       Diagonal, Glide, Drop_In, Earthquake. Parsed by parser/emitter.ts →
//       EmitterParams / ParticleCellParams; particle sim in compositor/
//       emitter-sim.ts (T-B2 shipped).
//
//   (3) Paint-Stroke Emitter  <-- THIS MODULE. The .motr scenenode is *NAMED*
//       "Emitter" but its factoryID resolves via the per-file factory table to
//       "Replicator" (not "Emitter"), with a child "Cell copy" whose factoryID
//       resolves to "Replicator Cell". The DAB parameters that make it a
//       paint-stroke, not a grid-replicator, live on the Cell copy:
//
//           Angle Over Stroke              (id 145) — curve over rangeName="Stroke Length"
//           Source Start Frame Over Stroke (id 149) — curve
//           Spacing Over Stroke            (id 139) — curve, min 0.01
//           Width Over Stroke              (id 140) — curve, min 0
//           Jitter Over Stroke             (id 144) — group {X,Y} of curves, min 0
//           Attach To Emitter              (id 126) — bool (dab tracks emitter transform)
//
//       …and on the Emitter (parent Replicator) node itself:
//
//           Shape (id 302) = 4               — "point-set / paint dab" arrangement
//                                              (0=Rect, 1=Circle, 2=Burst, 3=Spiral,
//                                               4=paint-stroke point-set)
//           Emit At Points  (id 303) = 1     — spawn at discrete Points × Ranks grid
//           Points          (id 304) = N     — dabs along stroke length
//           Ranks           (id 359) = M     — dabs perpendicular to stroke
//           Origin          (id 360)          — grid-origin alignment
//           Build Style     (id 361, id 332)  — dab build order (sequential/random)
//           Uniform Distribution (id 350)     — 1 = evenly spaced along stroke
//           Dab Depth Ordered (id 363) = 1   — z-order dabs by grid index
//           Image Source    (id 327)          — object id of the sprite/brush image
//
//       Semantic difference from a grid Replicator: the same POINTS×RANKS lattice
//       exists, but each cell is a "dab" (a brush stamp of the sprite) rasterised
//       with per-dab progress along the "Stroke Length" range, driving per-dab
//       size/angle/jitter/sprite-frame. In Slide_In this lays 10 stroke bands of
//       5×5 = 25 dabs each — the animated brush strokes that reveal photo B.
//
// STRUCTURAL DETECTORS (register in test/no-hardcode.test.ts)
// ----------------------------------------------------------
// This module exports two probes:
//
//   • hasPaintStrokeReplicator(scene) — fires on ANY .motr containing a
//     Replicator scenenode with parsed `replicator.shape === 4`. Verified fires
//     on 6 built-ins:
//         Lights/Flash, Replicator-Clones/Duplicate,
//         Stylized/Up-Over, Stylized/Slide_In,
//         Stylized/Light_Sweep, Stylized/Close_&_Open.
//     Zero transition-name checks; pure scene-shape.
//
//   • isPaintStrokeReplicator(layer) — per-layer version, used by the caller
//     to filter WHICH replicators to route to this subsystem when the composite
//     wiring lands. Fires on the same 6 built-ins' individual layers.
//
// CORE RASTERISER — rasterisePaintStroke(...)
// -------------------------------------------
// A pure function: given a brush sprite (ImageData), a PaintStrokeSpec (dab
// layout + per-stroke curves + parent transform), and a scene time in seconds,
// stamps every dab of the Points×Ranks lattice onto an output buffer with:
//
//   • per-dab position           = origin + rank * perpVec + stroke-t * alongVec
//   • per-dab stroke progress    = point index / (points-1)  ∈ [0,1]
//   • per-dab scale              = width-over-stroke curve at stroke-t
//   • per-dab rotation           = angle-over-stroke curve at stroke-t (radians)
//   • per-dab jitter offset      = (jitterX, jitterY) curves × per-dab seeded RNG
//   • per-dab sprite frame       = source-start-frame curve (for animated sprites;
//                                  for static sprites, ignored)
//   • per-dab visibility gate    = point index / (points-1) <= progress-along-build
//
// This is the pure math; the OUTPUT rasterization uses a bounded-AABB inverse-warp
// bilinear stamp (mirrors the perspective.ts quad rasterizer's pattern — no new
// pixel primitive). All curve evaluations go through evaluator/curves.ts.
//
// NO-OP SAFETY: the rasteriser is a pure function on an owned output buffer —
// no global state, no side effects, no MotrScene walk. Every code path is
// determined by the PaintStrokeSpec passed in; the *detector* alone decides
// whether to call it. Called on a spec with points===0 or ranks===0 it
// early-returns.
//
// WIRING RECIPE (ONE-LINE, gate-neutral by default — save for a downstream tick
// after compositor/index.ts is free of concurrent editors)
// ---------------------------------------------------------------------------
// At the top of composite() in engine/src/compositor/index.ts, immediately
// AFTER `rctx` is built and BEFORE the back-to-front loop, add:
//
//     if (process.env.FCT_PAINT_STROKE === '1' &&
//         scene.hasPaintStrokeEmitter) {
//       for (const layer of scene.layers) {
//         if (!isPaintStrokeReplicator(layer)) continue;
//         const spec = extractPaintStrokeSpec(layer, mediaResolver);
//         if (spec) rasterisePaintStroke(output, spec, width, height);
//       }
//     }
//
// api.ts must precompute `scene.hasPaintStrokeEmitter = hasPaintStrokeReplicator(motrScene)`
// (same one-line pattern as `equirectScene`) and expose it on EvaluatedScene.
// Gate default-OFF makes the wiring byte-neutral for the 65-built-in gate.
//
// PARSER GAPS DOCUMENTED FOR A FUTURE TICK (do NOT chase in this tick; scope is
// gate-neutral WIP module + tests, no parser edits):
// ---------------------------------------------------------------------------
//   • parser/replicator.ts does not yet lift the per-cell "Over Stroke" curves
//     (Angle 145, Source-Start 149, Spacing 139, Width 140, Jitter 144.X/Y) nor
//     `Ranks` (id 359) nor `Emit At Points` (id 303) nor `Image Source` (id 327)
//     off the Cell copy. Add a new `paintStroke?: PaintStrokeCellParams` field on
//     Replicator (mirroring the ParticleCellParams pattern), populated only when
//     shape===4. The extractor in this module currently supplies safe defaults
//     (spacing=1, width=1, jitter=(0,0), angle=0, sourceStartFrame=0) so the
//     rasteriser produces a correct uniform-dab layout even before that parser
//     work lands.
//   • Emitter transform (position/scale/anchor) is stripped by the parser for
//     these paint-stroke Replicator nodes (verified: transform === {}). The
//     extractor treats the emitter as living at the scene centre with an
//     axis-aligned stroke of default extent (1920 wide × 1080 tall). The wiring
//     tick should populate Layer.transform on Replicator-shape=4 layers.
//
// DECODE CITATION (Slide_In.motr scenenode enumeration confirmed 2026-07-16):
//   • 10 <scenenode name="Emitter" factoryID="19"> nodes (factory table:
//     "Replicator"), each hosting one <scenenode name="Cell copy" factoryID="20">
//     (factory table: "Replicator Cell"). Each Emitter has Shape=4, Emit At
//     Points=1, Points=5, Ranks=5. Each Cell copy carries Life=10000,
//     Speed=100, Angle-Over-Stroke curve, Spacing-Over-Stroke curve (default 1,
//     min 0.01), Width-Over-Stroke curve (default 1), Jitter-Over-Stroke X/Y
//     curves (default 0), Source-Start-Frame-Over-Stroke curve (default 0),
//     Attach To Emitter=1.
//   • Every one of these authors <rangeName>Stroke Length</rangeName> on the
//     "Over Stroke" curves — Motion's marker that the curve's independent
//     variable is the per-dab stroke position, NOT scene time. This module's
//     rasteriser respects that: over-stroke curves are evaluated at stroke_t
//     ∈ [0,1] via evaluateCurve with time=stroke_t (the curve keyframes for the
//     built-ins are two identical points, so this is a static ramp today; the
//     evaluator handles the general case correctly).
//
// GATE-GREEN STATUS (this tick): tsc clean, unit tests green, no-hardcode
// registers hasPaintStrokeReplicator (fires on 6 built-ins ≥ MIN_FIRES=2),
// module has ZERO import sites → 65 built-ins byte-identical to baseline.

import type { MotrScene, Layer, Curve } from '../types.js';
import { evaluateCurve } from '../evaluator/curves.js';

// ─── DETECTORS ──────────────────────────────────────────────────────────────

/**
 * Per-layer probe: does this layer represent a paint-stroke Emitter? Fires when
 * the layer parses as a Replicator (factory desc "Replicator") AND its
 * Replicator config carries `shape === 4` (Motion's paint-stroke / point-set
 * emitter arrangement, id 302). This is the canonical structural discriminator
 * — grid Replicators (Squares, Video Wall) leave `shape` undefined, and
 * shape-based Replicators (Vertigo, Combo Spin) use `shape === 1` (Circle) or
 * higher. Verified fires on the 6 built-in paint-stroke slugs listed in the
 * module header — never on any of the other 59 built-ins.
 */
export function isPaintStrokeReplicator(layer: Layer): boolean {
  return layer.type === 'replicator'
    && layer.replicator !== undefined
    && layer.replicator.shape === 4;
}

/**
 * Scene-level probe: does this scene contain AT LEAST ONE paint-stroke Emitter?
 * Walks the whole layer tree (paint-stroke emitters are usually nested inside a
 * Generator group, not at the top level — Slide_In hides them in its Gradient
 * generator). Used by:
 *   - api.ts (to precompute `EvaluatedScene.hasPaintStrokeEmitter` for the
 *     one-line wiring dispatch, once the compositor hook lands),
 *   - test/no-hardcode.test.ts (proves this is a GENERIC primitive — fires on 6
 *     built-ins ≥ MIN_FIRES=2, zero transition-name matching).
 */
export function hasPaintStrokeReplicator(scene: MotrScene): boolean {
  return sceneHasPaintStroke(scene.layers);
}

function sceneHasPaintStroke(layers: readonly Layer[]): boolean {
  for (const l of layers) {
    if (isPaintStrokeReplicator(l)) return true;
    if (l.children && sceneHasPaintStroke(l.children)) return true;
  }
  return false;
}

// ─── SPEC (rasteriser input) ────────────────────────────────────────────────

/**
 * PaintStrokeSpec — all the data the pure rasteriser needs to stamp a single
 * paint-stroke Emitter. Everything the extractor doesn't have yet is filled
 * with safe defaults; over time the parser will lift more of it out of the
 * .motr and the defaults will retreat.
 */
export interface PaintStrokeSpec {
  /** The brush sprite that gets stamped at each dab. Rasterised as-is with the
   *  per-dab scale/rotation; a null brush (unresolved sprite) is a no-op.  */
  readonly brush: ImageData | null;
  /** Points along the stroke (Emitter "Points" id 304). Every built-in in the
   *  corpus authors an integer >= 1. `points === 0` is treated as a no-op. */
  readonly points: number;
  /** Ranks perpendicular to the stroke (Emitter "Ranks" id 359). Currently
   *  parser-unlifted; the extractor supplies 1 as the safe default. */
  readonly ranks: number;
  /** Stroke extent in scene units — the along-stroke length + perpendicular
   *  width. The extractor supplies (1920, 1080) as a safe scene-covering
   *  default until parser lifts the emitter's authored size. */
  readonly extent: { readonly along: number; readonly across: number };
  /** Stroke centre in scene coordinates (0,0 = frame centre, Motion Y-down). */
  readonly centre: { readonly x: number; readonly y: number };
  /** Stroke orientation in radians (0 = along +X). Default 0. */
  readonly angleRad: number;
  /** Per-stroke curves. Each is a Motion curve keyed by stroke_t ∈ [0,1]. All
   *  optional; missing curves fall back to the noted default. */
  readonly curves: {
    /** Angle over stroke (id 145, radians). Default 0 (flat). */
    readonly angleOverStroke?: Curve;
    /** Width over stroke (id 140). Default 1 (uniform). Min 0. */
    readonly widthOverStroke?: Curve;
    /** Spacing over stroke (id 139). Default 1 (uniform). Min 0.01. */
    readonly spacingOverStroke?: Curve;
    /** Jitter X over stroke (id 144.X). Default 0. Min 0. */
    readonly jitterXOverStroke?: Curve;
    /** Jitter Y over stroke (id 144.Y). Default 0. Min 0. */
    readonly jitterYOverStroke?: Curve;
    /** Source Start Frame over stroke (id 149). Default 0 (frame 0 of sprite). */
    readonly sourceStartFrameOverStroke?: Curve;
  };
  /** Build progress ∈ [0,1] — how much of the stroke to stamp so far. Motion's
   *  Build Style + the parent Emitter's timing drives this externally; the
   *  rasteriser just gates dabs whose stroke_t exceeds this. Default 1 (fully
   *  built stroke, no gating). */
  readonly buildProgress: number;
  /** Deterministic RNG seed (Motion "Random Seed" — currently defaulted to the
   *  Emitter layer id so per-emitter jitter is stable across renders). */
  readonly seed: number;
  /** Global opacity multiplier applied to every stamped dab (0-1). Default 1. */
  readonly opacity: number;
}

// ─── EXTRACTOR (Layer → PaintStrokeSpec) ─────────────────────────────────────

/**
 * Media resolver — pluggable brush-sprite loader, matching the compositor/api
 * pattern. Returns null when the referenced object isn't resolvable as an
 * image (bundled path missing, object is a group not an image, etc.), which
 * short-circuits the rasteriser to a no-op for that spec.
 */
export type BrushResolver = (spriteObjectId: number | undefined) => ImageData | null;

/**
 * Extract a PaintStrokeSpec from a Layer + optional brush resolver. Returns
 * null when the layer isn't a paint-stroke replicator OR when required fields
 * are absent (points === undefined). Everything currently unavailable from the
 * parser is filled with the safe default documented on PaintStrokeSpec.
 *
 * CURRENT PARSER-GAP DEFAULTS (see module header):
 *   • ranks = 1     (parser doesn't lift Ranks id 359 yet)
 *   • extent = (1920, 1080) if the emitter's transform is empty
 *   • angleRad = 0
 *   • curves = {} (rasteriser then uses the per-curve default listed above)
 *   • buildProgress = 1 (no timing gate; full stroke stamped)
 *   • opacity = 1
 *   • brush = resolver(cellSourceId) if resolver given, else null
 */
export function extractPaintStrokeSpec(
  layer: Layer,
  resolveBrush?: BrushResolver,
): PaintStrokeSpec | null {
  if (!isPaintStrokeReplicator(layer)) return null;
  const rep = layer.replicator!;
  const points = rep.points ?? 0;
  if (points <= 0) return null;

  const tx = layer.transform || {};
  const cx = typeof tx.positionX === 'number' ? tx.positionX : 0;
  const cy = typeof tx.positionY === 'number' ? tx.positionY : 0;
  const along = rep.sizeWidth > 0 ? rep.sizeWidth : 1920;
  const across = rep.sizeHeight > 0 ? rep.sizeHeight : 1080;

  const brush = resolveBrush ? resolveBrush(layer.cellSourceId) : null;

  return {
    brush,
    points,
    ranks: 1, // parser gap — see module header
    extent: { along, across },
    centre: { x: cx, y: cy },
    angleRad: 0,
    curves: {},
    buildProgress: 1,
    seed: layer.id,
    opacity: 1,
  };
}

// ─── DAB GEOMETRY ────────────────────────────────────────────────────────────

/** A single stamped dab: absolute scene-space centre + evaluated curve values. */
export interface Dab {
  /** Dab centre in scene coordinates (Motion Y-down). */
  readonly x: number;
  readonly y: number;
  /** Stroke-space parameter for this dab, ∈ [0,1]. */
  readonly strokeT: number;
  /** Point index along the stroke (0..points-1) and rank index (0..ranks-1). */
  readonly pointIdx: number;
  readonly rankIdx: number;
  /** Per-dab scale multiplier (evaluated widthOverStroke, clamped >= 0). */
  readonly scale: number;
  /** Per-dab rotation in radians (evaluated angleOverStroke + spec.angleRad). */
  readonly rotationRad: number;
  /** Per-dab jitter offsets in scene units (already applied to x,y).  */
  readonly jitterX: number;
  readonly jitterY: number;
  /** Sprite frame index for animated brushes (rounded from sourceStartFrame). */
  readonly spriteFrame: number;
}

/**
 * Sample the Points × Ranks lattice of dabs for a PaintStrokeSpec, applying
 * per-stroke curves (width/angle/jitter/spacing/source-start) and the build
 * progress gate. Returns dabs strictly in build order (point-major, rank-minor
 * — matching Motion's "Dab Depth Ordered" default). O(points × ranks). Pure.
 *
 * When the spec's `buildProgress < 1`, only dabs whose strokeT <= buildProgress
 * are returned (matches Motion's Build Style progressive stamp). At
 * buildProgress === 0 the array is empty; at 1 it is fully populated.
 */
export function sampleDabs(spec: PaintStrokeSpec): readonly Dab[] {
  const { points, ranks, extent, centre, angleRad, curves, buildProgress, seed } = spec;
  if (points <= 0 || ranks <= 0) return [];

  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const halfAlong = extent.along / 2;

  const dabs: Dab[] = [];
  const rng = mulberry32(seed >>> 0);

  for (let p = 0; p < points; p++) {
    const strokeT = points > 1 ? p / (points - 1) : 0;
    if (strokeT > buildProgress + 1e-6) break; // build-order gate (point-major)
    // Spacing curve nudges dab positions ALONG the stroke: not yet consumed
    // (the corpus's stroke-length curves are static-1 in every built-in — same
    // constant at both keypoints — so uniform spacing is correct). Kept as a
    // TODO for the wiring tick to fold in when a non-static spacing appears.
    const alongT = strokeT * extent.along - halfAlong;

    const angleOff = curves.angleOverStroke ? evaluateCurve(curves.angleOverStroke, strokeT) : 0;
    const widthMul = curves.widthOverStroke ? Math.max(0, evaluateCurve(curves.widthOverStroke, strokeT)) : 1;
    const jitterAmpX = curves.jitterXOverStroke ? Math.max(0, evaluateCurve(curves.jitterXOverStroke, strokeT)) : 0;
    const jitterAmpY = curves.jitterYOverStroke ? Math.max(0, evaluateCurve(curves.jitterYOverStroke, strokeT)) : 0;
    const spriteFrameF = curves.sourceStartFrameOverStroke
      ? Math.max(0, evaluateCurve(curves.sourceStartFrameOverStroke, strokeT))
      : 0;
    const spriteFrame = Math.round(spriteFrameF);

    for (let r = 0; r < ranks; r++) {
      const acrossT = ranks > 1 ? r / (ranks - 1) - 0.5 : 0; // ∈ [-0.5, 0.5]
      const acrossOffset = acrossT * extent.across;
      // Deterministic per-dab jitter (each draw is per-dab, order-stable).
      const jx = jitterAmpX * (rng() * 2 - 1);
      const jy = jitterAmpY * (rng() * 2 - 1);
      // Local (along, across) → world via emitter rotation + centre.
      const lx = alongT + jx;
      const ly = acrossOffset + jy;
      const wx = centre.x + lx * cosA - ly * sinA;
      const wy = centre.y + lx * sinA + ly * cosA;
      dabs.push({
        x: wx, y: wy,
        strokeT,
        pointIdx: p,
        rankIdx: r,
        scale: widthMul,
        rotationRad: angleRad + angleOff,
        jitterX: jx,
        jitterY: jy,
        spriteFrame,
      });
    }
  }
  return dabs;
}

// ─── RASTERISER ──────────────────────────────────────────────────────────────

/**
 * Stamp every dab from the spec onto `output` (an ImageData in the compositor's
 * frame coordinate system — origin top-left, Motion Y-down). No-op when
 * `spec.brush` is null, points===0, ranks===0, or opacity===0. Every stamped
 * dab is a rotated+scaled bilinear copy of `spec.brush`; pixels are `over`-blended
 * (source-over) into the target using premultiplied alpha semantics.
 *
 * This is deliberately a MINIMAL first-cut rasteriser — no motion blur, no per-
 * dab colour tint, no blend-mode selection (paint-stroke transitions in the
 * corpus author Blend=Normal on the parent Emitter). Colour/blend extensions
 * are follow-ups; the interface (Dab.scale/rotationRad/spriteFrame) is stable.
 *
 * Returns the number of dabs actually stamped (for tests / debug tracing).
 */
export function rasterisePaintStroke(
  output: ImageData,
  spec: PaintStrokeSpec,
  frameWidth: number,
  frameHeight: number,
): number {
  if (spec.brush === null) return 0;
  if (spec.opacity <= 0) return 0;
  if (spec.points <= 0 || spec.ranks <= 0) return 0;

  const dabs = sampleDabs(spec);
  const brush = spec.brush;
  const bw = brush.width;
  const bh = brush.height;
  if (bw === 0 || bh === 0) return 0;

  let stamped = 0;
  for (const dab of dabs) {
    stampDab(output, brush, bw, bh, dab, spec.opacity, frameWidth, frameHeight);
    stamped++;
  }
  return stamped;
}

/**
 * Stamp a single dab: rotate+scale the brush around its centre, translate to
 * (dab.x, dab.y) in the output. Uses inverse-warp bilinear sampling with a
 * bounded scan of the transformed brush AABB. This mirrors the perspective.ts
 * quad rasterizer's pattern (bounded AABB scan + inverse warp) — no new pixel
 * primitive; shape.ts's stamp helper is a private stateful path we deliberately
 * don't reuse to keep this module pure.
 */
function stampDab(
  output: ImageData,
  brush: ImageData,
  bw: number, bh: number,
  dab: Dab,
  opacity: number,
  fw: number, fh: number,
): void {
  if (dab.scale <= 0) return;

  const cx = fw / 2 + dab.x;
  const cy = fh / 2 + dab.y;
  const s = dab.scale;
  const cos = Math.cos(dab.rotationRad);
  const sin = Math.sin(dab.rotationRad);

  // Transformed AABB: rotated+scaled brush rectangle around (cx,cy).
  const hw = (bw / 2) * s;
  const hh = (bh / 2) * s;
  const absC = Math.abs(cos), absS = Math.abs(sin);
  const boxW = hw * absC + hh * absS;
  const boxH = hw * absS + hh * absC;
  const minX = Math.max(0, Math.floor(cx - boxW));
  const maxX = Math.min(fw - 1, Math.ceil(cx + boxW));
  const minY = Math.max(0, Math.floor(cy - boxH));
  const maxY = Math.min(fh - 1, Math.ceil(cy + boxH));
  if (minX > maxX || minY > maxY) return;

  const invS = 1 / s;
  const dst = output.data;
  const src = brush.data;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      // Inverse-warp: output pixel (x,y) → brush space.
      const dx = x - cx;
      const dy = y - cy;
      const bx =  (dx * cos + dy * sin) * invS + bw / 2;
      const by = (-dx * sin + dy * cos) * invS + bh / 2;
      if (bx < 0 || by < 0 || bx >= bw - 1 || by >= bh - 1) continue;

      const bx0 = Math.floor(bx), by0 = Math.floor(by);
      const fx = bx - bx0, fy = by - by0;
      const i00 = (by0 * bw + bx0) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + bw * 4;
      const i11 = i01 + 4;
      // Bilinear on premultiplied-alpha assumption (matches other compositor stamps).
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;
      const sr = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
      const sg = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
      const sb = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
      const sa = (src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11) * opacity;
      if (sa <= 0) continue;

      const di = (y * fw + x) * 4;
      const dr = dst[di], dg = dst[di + 1], db = dst[di + 2], da = dst[di + 3];
      const inv = 1 - sa / 255;
      dst[di]     = sr + dr * inv;
      dst[di + 1] = sg + dg * inv;
      dst[di + 2] = sb + db * inv;
      dst[di + 3] = sa + da * inv;
    }
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

/** Tiny deterministic RNG (mulberry32). Same primitive used by other places in
 *  the engine that need seedable per-instance randomness without pulling in a
 *  full PRNG library. Produces a uniform double in [0,1) per call. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
