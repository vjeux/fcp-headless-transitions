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
  const rank = inst.col + ((rows - 1) - inst.row);
  return rank / maxDiag;
}
