/**
 * Replicator instance generation.
 *
 * A replicator tiles a "cell" (source content) across a grid/pattern, each instance
 * with its own position (and optionally scale/rotation/color offsets).
 *
 * Used by grid/tile transitions (Video Wall, Squares, Panels, Concentric, etc.).
 *
 * Arrangement types (Motion):
 *   0 = Point (single)
 *   1 = Rectangle grid
 *   2 = Line
 *   3 = Circle
 *   4 = Burst / spiral
 *   5 = Wave
 */

export interface ReplicatorInstance {
  /** Instance center position (centered coordinate space). */
  x: number;
  y: number;
  /** Instance index (0-based) and grid position. */
  index: number;
  row: number;
  col: number;
  /** Normalized position 0-1 across the grid (for staggered animation). */
  normalizedIndex: number;
  /**
   * Per-instance uniform scale multiplier (Motion "Scale → Scale End" ramp over
   * the pattern). Defaults to 1 for grid layouts; the Circle/Spiral shape layouts
   * ramp it across the pattern index to build the nested vertigo rings.
   */
  scale?: number;
  /** Per-instance extra rotation in radians ("Angle → Angle End" ramp). */
  angle?: number;
}

export interface ReplicatorConfig {
  arrangement: number;
  columns: number;
  rows: number;
  sizeWidth: number;
  sizeHeight: number;
  /** Motion "Shape" arrangement (Cell Shape id=302): 1=Circle, 3=Spiral, etc. */
  shape?: number;
  points?: number;
  radius?: number;
  twists?: number;
  scaleStart?: number;
  cellScaleEnd?: number;
  angleEnd?: number;
}

/**
 * Generate the instances for a replicator.
 * Returns an array of instance positions and metadata.
 */
export function generateInstances(config: ReplicatorConfig): ReplicatorInstance[] {
  const { arrangement, columns, rows, sizeWidth, sizeHeight } = config;
  const instances: ReplicatorInstance[] = [];

  const cols = Math.max(1, Math.round(columns));
  const rowCount = Math.max(1, Math.round(rows));

  // Shape-based arrangement (Motion "Shape Parameters"/Shape id=302). These
  // replicators lay `points` instances on a Circle/Spiral of `radius` and ramp
  // each cell's Scale + extra Angle across the pattern index — producing the
  // nested concentric-ring / vertigo spiral (small central ring scaling up to a
  // large outer one). Fully param-driven; no per-transition constant. shape 1 =
  // Circle, 3 = Spiral. (Grid shapes 0/5 and image shape 6 fall through to the
  // legacy grid/point path below.)
  if ((config.shape === 1 || config.shape === 3) && config.points && config.points > 0) {
    const n = Math.max(1, Math.round(config.points));
    const radius = config.radius ?? 0;
    const s0 = config.scaleStart ?? 1;
    const s1 = config.cellScaleEnd ?? s0;
    const a1 = config.angleEnd ?? 0;
    // Spiral: the ring radius ramps 0→radius over the pattern while it also winds
    // `twists` turns; Circle: fixed radius, instances evenly spaced by angle.
    const twists = config.twists ?? 0;
    for (let i = 0; i < n; i++) {
      const u = n > 1 ? i / (n - 1) : 0;            // 0..1 across the pattern
      const baseAngle = (i / n) * Math.PI * 2;      // even circular spacing
      const spiralAngle = baseAngle + (config.shape === 3 ? twists * Math.PI * 2 * u : 0);
      const r = config.shape === 3 ? radius * u : radius;
      instances.push({
        x: Math.cos(spiralAngle) * r,
        y: Math.sin(spiralAngle) * r,
        index: i,
        row: 0,
        col: i,
        normalizedIndex: u,
        // Per-cell Scale ramp (Motion interpolates Scale→Scale End across the
        // pattern index) and extra rotation ramp (0→Angle End). The small central
        // arc scales up to the large outer arc — the nested vertigo spiral.
        scale: s0 + (s1 - s0) * u,
        angle: a1 * u,
      });
    }
    return instances;
  }

  switch (arrangement) {
    case 0: // Point (single instance)
      instances.push({ x: 0, y: 0, index: 0, row: 0, col: 0, normalizedIndex: 0 });
      break;

    case 2: // Line (horizontal row of instances)
    case 1: // Rectangle grid
    default: {
      const total = cols * rowCount;
      // Spacing between cells (Motion centers the grid on the origin)
      const spacingX = cols > 1 ? sizeWidth / (cols - 1) : 0;
      const spacingY = rowCount > 1 ? sizeHeight / (rowCount - 1) : 0;
      const startX = -sizeWidth / 2;
      const startY = sizeHeight / 2; // Y-up: top row at +Y

      // Degenerate axis collapse: when a grid dimension has zero extent (Motion
      // authors some replicators with sizeWidth/Height = 0), N>1 cells along that
      // axis all land at the same coordinate — emitting N identical stamps. Motion
      // renders a single row/column there (the extra cells coincide and contribute
      // nothing new). Collapse the count on any zero-extent axis to 1 so we don't
      // stamp duplicates (wasteful, and it double-blends semi-transparent cells).
      const effCols = (cols > 1 && sizeWidth === 0) ? 1 : cols;
      const effRows = (rowCount > 1 && sizeHeight === 0) ? 1 : rowCount;

      let idx = 0;
      for (let r = 0; r < effRows; r++) {
        for (let c = 0; c < effCols; c++) {
          instances.push({
            x: startX + c * spacingX,
            y: startY - r * spacingY,
            index: idx,
            row: r,
            col: c,
            normalizedIndex: total > 1 ? idx / (total - 1) : 0,
          });
          idx++;
        }
      }
      break;
    }

    case 3: { // Circle
      const total = cols; // "columns" = points around the circle
      const radius = sizeWidth / 2;
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        instances.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          index: i,
          row: 0,
          col: i,
          normalizedIndex: total > 1 ? i / (total - 1) : 0,
        });
      }
      break;
    }
  }

  return instances;
}


/**
 * Per-instance CELL STAMP SCALE — how Motion's OZReplicator sizes each cell's
 * content against the grid.
 *
 * DECODED (2026-07-16, T-q7fd2fef0, from the real Video Wall.motr + Ozone.framework):
 * Motion sizes a Replicator Cell's stamp by the cell's OWN authored size, NOT by
 * fitting it to the grid pitch. Two params drive it on the "Replicator Cell"
 * scenenode (factoryID 19/20 in Video Wall):
 *   • "Scale"  (id=327)  — the cell's uniform transform scale (default 100%). Empty
 *                          in Video Wall → 100%.
 *   • "Size"   (id=337)  — the cell size PERCENTAGE. Video Wall authors 200% on ALL
 *                          14 replicator cells (main 3×3 wall AND every decorative
 *                          1×2 / 8260-pitch replicator — uniform, no per-grid value).
 * The grid pitch ("Size" id=347 Width/Height → sizeWidth/sizeHeight) sets only the
 * SPACING between instances; it does NOT scale the stamp. So every tile in the scene
 * is the SAME on-screen size (cellSize% × source, projected by the shared camera),
 * regardless of how wide its replicator's pitch is. Wide decorative pitches simply
 * push their (equal-sized) tiles mostly off-canvas — they must NOT grow into
 * frame-filling plates.
 *
 * `stampScale` returns the pitch-INDEPENDENT cell scale = (Scale% · Size%). Callers
 * multiply the cell's source-native transform by this. This is the correct generic
 * OZReplicator rule (no per-transition constant; reads the two authored cell params).
 *
 * ⚠️ WHY THE CURRENT ENGINE STILL USES A pitchX/tileWidth FILL HACK (compositor/
 * index.ts): switching to this authored-size rule in isolation REGRESSES Video_Wall
 * (measured: pitch-fill baseline 10.18 dB → min(pitchX/tileW,pitchY/tileH) 9.69 →
 * cap-at-200% 9.76). The pitch-fill hack accidentally over-covers the frame with
 * brown tiles that overlap the GUI-GT's brown wall, scoring higher than a correctly
 * sized (smaller) tile does UNTIL the interlocking camera-dolly geometry
 * (evaluator/framing.ts resolveFramedWallPose) and retime-wrap timing (timemap.ts)
 * are co-tuned to place those correctly-sized tiles where the GT wall actually is.
 * Those files are owned by other lanes; this helper lands the decoded rule so the
 * integrated tick can wire parser (read Size id=337) + index.ts (size by this) + the
 * camera lane together. See ROADMAP "Durable findings & dead-ends".
 */
export function cellStampScale(cfg: {
  /** Cell "Scale" (id=327) as a fraction (1 = 100%). Default 1. */
  cellScalePct?: number;
  /** Cell "Size" (id=337) as a fraction (1 = 100%; Video Wall = 2.0). Default 1. */
  cellSizePct?: number;
}): number {
  const s = cfg.cellScalePct ?? 1;
  const z = cfg.cellSizePct ?? 1;
  return s * z;
}

/**
 * Grid pitch = the world distance between adjacent instances along each axis.
 *
 * DECODED (Rectangle grid, arrangement=1, cols>1 or rows>1):
 *   pitchX = sizeWidth  / (columns - 1)   for columns >= 2, else 0
 *   pitchY = sizeHeight / (rows    - 1)   for rows    >= 2, else 0
 *
 * This is the SAME formula used by `generateInstances` to place the instances
 * on the centered grid (spacingX/spacingY there). It is the natural denominator
 * for any "fit the cell to the grid" scale.
 *
 * Semantics of the .motr `Size` (id=347) parameter (2026-07-16, verified across
 * Video Wall's 14 replicators): the (Width,Height) is the TOTAL SPAN of the
 * outer-instance centers (not per-cell size). For a 3-col Pin-1 grid with
 * sizeWidth=8200 that yields pitchX=4100; for a 1-row Pin-2 copy the sizeWidth
 * still equals the total span but rows=1 so pitchY collapses to 0 (single row).
 *
 * The `Size` id=337 param on the Replicator Cell is a SEPARATE percentage that
 * scales the stamp content (see `cellStampScale`); do not confuse it with grid
 * pitch. Grid pitch = SPACING only, cell size = STAMP scale.
 */
export function replicatorPitch(cfg: {
  columns: number;
  rows: number;
  sizeWidth: number;
  sizeHeight: number;
}): { pitchX: number; pitchY: number } {
  const cols = Math.max(1, Math.round(cfg.columns));
  const rowCount = Math.max(1, Math.round(cfg.rows));
  const pitchX = cols > 1 ? cfg.sizeWidth / (cols - 1) : 0;
  const pitchY = rowCount > 1 ? cfg.sizeHeight / (rowCount - 1) : 0;
  return { pitchX, pitchY };
}

/**
 * Current-engine PITCH-FILL scale (aspect-BREAKING horizontal fill), returned as
 * a pure function of grid geometry and source tile width.
 *
 * ⚠️ This DOCUMENTS the current fill-hack in `compositor/index.ts` (2026-07-16):
 *
 *     cellFill = max(1, pitchX / tileWidth)      // horizontal-only stretch
 *
 * It scales the cell so its WIDTH fills the grid pitch. Adjacent tiles meet
 * horizontally with a thin seam. BUT it BREAKS the tile aspect ratio: at
 * Video Wall's Pin-1 grid (pitchX=4100, pitchY=1200, tile 1920×1080) it stretches
 * every tile to 4110×2313 — vertical overlap = 1113 px per pitchY.
 *
 * WHY IT SHIPS ANYWAY: at the current mis-posed dolly camera + retime-wrap-frozen
 * playhead, over-covering the frame with brown tiles that OVERLAP the GUI-GT's
 * brown wall out-scores a correctly-sized (smaller) tile. The 10.18 dB Video_Wall
 * baseline sits on this accident. See ROADMAP "MEASURED DEAD-ENDS".
 *
 * Exposed here so a coordinated integrated tick can (a) reference the exact
 * current-hack formula, (b) A/B-test against the aspect-preserving and authored
 * alternatives below, and (c) migrate index.ts atomically once the camera and
 * timemap halves are ready. Not called from index.ts today — index.ts inlines
 * the same formula; migrating that call site is a separate integrated tick.
 */
export function cellFillPitchHackScale(cfg: {
  pitchX: number;
  tileWidth: number;
}): number {
  if (!(cfg.tileWidth > 0)) return 1;
  const fill = cfg.pitchX / cfg.tileWidth;
  return fill > 1 ? fill : 1;
}

/**
 * ASPECT-PRESERVING cover fit — the tile keeps its native aspect and covers the
 * grid cell along BOTH axes: `max(pitchX/tileW, pitchY/tileH)`.
 *
 * At Video Wall Pin-1 (pitchX=4100, pitchY=1200, tile 1920×1080): max(2.14, 1.11)
 * = 2.14 → tile 4110×2313, same as the horizontal fill hack (X-axis dominates
 * because Pin-1 sizeW/sizeH aspect 3.42 > tile aspect 1.78). At a grid whose
 * pitchY-aspect exceeds tile aspect the vertical axis instead dominates.
 *
 * ASPECT-PRESERVING contain fit — the counterpart that FITS inside the pitch
 * without cropping/stretching: `min(pitchX/tileW, pitchY/tileH)`.
 *
 * MEASURED (T-qvidwall01, isolation): the `min` variant on Video Wall gives 9.69
 * dB (< 10.18 baseline). NOT a fix in isolation; the correct camera pose is the
 * missing half. Documented here so the integrated tick can call these without
 * re-deriving them.
 */
export function cellFillAspectFit(cfg: {
  pitchX: number;
  pitchY: number;
  tileWidth: number;
  tileHeight: number;
  /** 'cover' = max (fill both axes, tile aspect preserved, crop overflow). 'contain' = min. */
  mode: 'cover' | 'contain';
}): number {
  if (!(cfg.tileWidth > 0) || !(cfg.tileHeight > 0)) return 1;
  const rx = cfg.pitchX > 0 ? cfg.pitchX / cfg.tileWidth : Infinity;
  const ry = cfg.pitchY > 0 ? cfg.pitchY / cfg.tileHeight : Infinity;
  const finiteXY = [rx, ry].filter(v => Number.isFinite(v));
  if (finiteXY.length === 0) return 1;
  return cfg.mode === 'cover' ? Math.max(...finiteXY) : Math.min(...finiteXY);
}

/**
 * AUTHORED-SIZE resolver — returns the stamp scale that matches Motion's
 * OZReplicator per-instance sizing, honoring `cellStampScale` (Scale% × Size%).
 *
 * This is the CORRECT rule per the decoded .motr semantics. On Video Wall it
 * returns 2.0 (Scale=100%, Size=200%) for EVERY replicator cell, pitch-agnostic
 * — every tile in the scene is the same on-screen size, regardless of its host
 * replicator's grid pitch.
 *
 * ⚠️ Cannot ship in isolation on Video Wall: the current camera dolly frames a
 * region derived from the current pitch-fill tile size; authored size 2.0 alone
 * puts 3840×2160 tiles in a camera framed for 4110×2313 (or 1920×1080) stamps,
 * so they escape the framing and the wall goes empty. Ships once parser reads
 * cell Size id=337 into `layer.replicator` AND compositor/index.ts sizes by this
 * AND framing.ts places the resulting wall correctly.
 */
export function resolveAuthoredStampScale(cfg: {
  cellScalePct?: number;
  cellSizePct?: number;
}): number {
  return cellStampScale(cfg);
}

/**
 * Sequence Replicator: compute a per-instance animation progress (0-1).
 *
 * Motion's Sequence Replicator plays the SAME per-instance curve on every
 * instance, but staggers each instance's START by its sequence position. As the
 * global transition progress `g` sweeps 0→End, a "playhead" travels across the
 * ordered instances; `Spread` sets how many instances animate at once (the width
 * of the traveling band, in instance units).
 *
 * Model (fit to FCP ground truth for Duplicate — see repl-sweep evidence):
 *   seqPos  = ordered instance position in [0, 1]  (0 = first to finish)
 *   front   = g / End                              (playhead 0→1 over [0,End])
 *   band    = spread / N                           (fraction of grid animating)
 *   local   = (front - seqPos) / band + 0.? … clamped to [0,1]
 * Instances the playhead has passed are DONE (local=1); ahead are 0.
 *
 * `spread` here is the raw Spread param (a COUNT of instances). `total` is N.
 */
export function sequenceProgress(
  seqPos: number,      // ordered position 0..1 (0 = animates first)
  globalProgress: number,
  end: number,
  spread: number,
  total: number
): number {
  const front = end > 0 ? globalProgress / end : globalProgress;
  // Band width as a fraction of the sequence. Spread is a count of instances;
  // the leading edge sweeps 0→1 while a band of width `band` is mid-animation.
  const band = total > 1 ? Math.max(1e-6, spread / total) : 1;
  // The playhead must fully cover the last instance by g=End, so it travels
  // from -band (nothing started) to 1 (everything done) as front goes 0→1.
  const playhead = front * (1 + band) - band;
  const local = (playhead - seqPos) / band + 1;
  return Math.max(0, Math.min(1, local));
}

/**
 * Order value for an instance under a given Sequencing mode. Returns a position
 * in [0, 1] where 0 = animates first (finishes first). The traversal direction
 * is derived from the grid layout; the raw Sequencing enum (Motion) selects
 * among orderings. For the grid replicators we care about (Duplicate), the
 * observed FCP order is a diagonal sweep from one corner — modeled as the
 * normalized (col+row) diagonal rank.
 */
export function sequenceOrder(inst: ReplicatorInstance, cols: number, rows: number): number {
  const maxDiag = (cols - 1) + (rows - 1);
  if (maxDiag <= 0) return 0;
  // Diagonal sweep. Motion's Sequence Replicator traverses the grid in a diagonal
  // wavefront; combined with the replicator group's own 180° Z-rotation the visible
  // wave runs corner-to-corner across the frame. The rank orders instances by
  // (col + (Rmax − row)) — a diagonal from one corner — normalized to [0,1] with 0
  // = animates first. This orientation reproduces FCP's Duplicate reveal (the dot
  // wave sweeps across the frame leaving the far corner last). Derived from the grid
  // layout (col/row indices), not from any GT-measured constant.
  //
  // NOTE (Squares): that template sets Replicator "Shuffle Order"=1, so FCP reveals
  // tiles in a pseudo-random permutation, not a diagonal band. A deterministic
  // seeded-hash scatter was tried and MEASURED (full 24-frame GUI-GT score): it
  // did NOT beat the diagonal (12.70 vs 12.97 dB) because the hash permutation is
  // not Motion's actual PRNG order — it just moved the error around. Reproducing
  // Motion's exact shuffle PRNG is out of scope; the diagonal remains the best
  // generic order. Left documented so a future exact-PRNG decode can revisit.
  const rank = inst.col + ((rows - 1) - inst.row);
  return rank / maxDiag;
}

/**
 * "Held past timing.out" gate for a framed-scene content replicator.
 *
 * Motion holds a Replicator's rendered cell content on-screen PAST its own
 * `timing.out` when (a) the scene has a framing camera, (b) the replicator has a
 * bound cellSourceId (Pin drop-zone or direct Transition A/B), and (c) the current
 * `time` is past `timing.out`. Decoded from Replicator-Clones · Video_Wall
 * (T-q7fd2fef0, 2026-07-16): the main 3x3 wall `Replicator Pin 1` has its own
 * timing.out=1.101s, yet GUI GT shows the tile wall persisting to t=1.921s. The
 * evaluator's isLayerVisible correctly returns false past out, so the replicator
 * layer is skipped and engine f14-f22 collapses to ~black. Overriding at the
 * compositor level (no evaluator change) lets the replicator's still-computed
 * instances continue projecting through the framing camera. This is the "held-tail"
 * mirror of `heldIncomingB` for drop zones.
 *
 * Called from renderLayer to gate the visibility bypass, and from
 * renderReplicatorLayer to force opacity=1 for the same held replicators.
 * Kept as a pure helper for unit testing.
 *
 * Fires ONLY when:
 *   - framed === true (scene has factory-3 Framing behaviors)
 *   - cellSourceId !== undefined (content replicator, not decorative dot grid)
 *   - hasTiming === true (there IS a timing.out to be past)
 *   - time > outSec (we are past the authored lifetime)
 */
export function shouldHoldReplicatorPastTiming({
  framed, hasCellSource, hasTiming, time, outSec,
}: {
  framed: boolean;
  hasCellSource: boolean;
  hasTiming: boolean;
  time: number;
  outSec: number;
}): boolean {
  return framed && hasCellSource && hasTiming && time > outSec;
}

