/**
 * motr-engine: Browser-based Motion .motr transition renderer.
 *
 * The public API is intentionally minimal:
 *
 *   const transition = await createTransition(motrXML);
 *   const frame = transition.render(imageA, imageB, progress);
 *   // frame is an ImageData (width × height × RGBA)
 *
 * Internally:
 *   1. Parser: .motr XML → MotrScene (typed scene graph)
 *   2. Evaluator: MotrScene + time → evaluated per-layer transforms/params
 *   3. Compositor: layers + source images → final ImageData
 */

export { createTransition, type TransitionFn, type TransitionOptions } from './api.js';
export { parseMotr } from './parser/index.js';
export type { MotrScene, Layer, Keyframe, Curve } from './types.js';
