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
