import { parseMotr } from './parser/index.js';
import { evaluate } from './evaluator/index.js';
import { composite } from './compositor/index.js';
import type { MotrScene } from './types.js';

export interface TransitionOptions {
  width?: number;
  height?: number;
}

/**
 * A compiled transition function.
 * Call .render() with two source images and a progress (0–1) to get a frame.
 */
export interface TransitionFn {
  /** The parsed scene metadata. */
  scene: MotrScene;
  /**
   * Render one frame of the transition.
   * @param imageA - Source A pixels (Uint8ClampedArray RGBA, width×height×4)
   * @param imageB - Source B pixels (same dimensions)
   * @param progress - Transition progress 0.0 (all A) to 1.0 (all B)
   * @returns The composited frame as ImageData
   */
  render(imageA: ImageData, imageB: ImageData, progress: number): ImageData;
  /** Width of the output frame. */
  width: number;
  /** Height of the output frame. */
  height: number;
}

/**
 * Compile a .motr transition file into a render function.
 * @param motrXML - The full XML text of the .motr file
 * @param opts - Override output dimensions (default: scene's native)
 */
export function createTransition(motrXML: string, opts?: TransitionOptions): TransitionFn {
  const scene = parseMotr(motrXML);
  const width = opts?.width ?? scene.settings.width;
  const height = opts?.height ?? scene.settings.height;

  return {
    scene,
    width,
    height,
    render(imageA: ImageData, imageB: ImageData, progress: number): ImageData {
      // Map progress (0-1) to scene time
      const duration = scene.settings.duration;
      const timeSec = progress * (duration.value / duration.timescale);

      // Evaluate all layers at this time
      const evaluated = evaluate(scene, timeSec);

      // Composite into a frame
      return composite(evaluated, imageA, imageB, width, height);
    }
  };
}
