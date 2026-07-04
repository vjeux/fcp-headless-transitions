/**
 * Parser: .motr XML → MotrScene
 *
 * Handles the ozml XML format including:
 *   - Factory definitions (maps factoryIDs to node types)
 *   - Scene settings (resolution, duration, fps)
 *   - Scene graph (layers, groups, transforms)
 *   - Keyframe curves (bezier, linear, constant)
 *   - Filters and behaviors
 *   - Timing (in/out/offset per layer)
 */
import type { MotrScene, SceneSettings, Layer, Curve, Keyframe, RationalTime, Parameter, Transform, Filter } from '../types.js';

export function parseMotr(xml: string): MotrScene {
  // TODO: implement full parser
  // For now, return a minimal scene so the API compiles
  return {
    settings: { width: 1920, height: 1080, duration: { value: 200200, timescale: 120000 }, frameRate: 23.976 },
    layers: [],
    factories: new Map(),
  };
}
