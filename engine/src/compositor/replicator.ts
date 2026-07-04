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
}

export interface ReplicatorConfig {
  arrangement: number;
  columns: number;
  rows: number;
  sizeWidth: number;
  sizeHeight: number;
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

      let idx = 0;
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < cols; c++) {
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
 * Sequence Replicator: compute a per-instance time offset (0-1) for staggered animation.
 *
 * Cells animate in sequence based on their position, creating a wave/cascade effect.
 * The `spread` controls how much the animation is staggered across instances.
 *
 * @param instance - the instance (has normalizedIndex 0-1)
 * @param globalProgress - overall transition progress (0-1)
 * @param spread - how spread out the sequence is (0 = all together, 1 = fully staggered)
 * @param traversal - direction/order: 0 = forward by index, 1 = reverse, 2 = from center
 * @returns per-instance progress (0-1), clamped
 */
export function sequenceProgress(
  instance: ReplicatorInstance,
  globalProgress: number,
  spread: number,
  traversal: number = 0
): number {
  let idx = instance.normalizedIndex;

  // Traversal order
  switch (traversal) {
    case 1: idx = 1 - idx; break;             // reverse
    case 2: idx = Math.abs(idx - 0.5) * 2; break; // from center outward
  }

  // With spread, each instance's animation window is offset.
  // At spread=0, all instances share globalProgress.
  // At spread=1, instance i starts at time idx and finishes at idx + (1-spread window).
  const window = 1 - spread * 0.8; // animation window per instance (never 0)
  const startTime = idx * spread * 0.8;
  const localProgress = (globalProgress - startTime) / window;

  return Math.max(0, Math.min(1, localProgress));
}
