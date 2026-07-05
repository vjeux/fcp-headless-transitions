import { parseMotr } from './parser/index.js';
import { evaluate } from './evaluator/index.js';
import { composite } from './compositor/index.js';
import { resample } from './compositor/resample.js';
import type { MotrScene } from './types.js';

export interface TransitionOptions {
  width?: number;
  height?: number;
  /** Conform output to this resolution (renders native then resamples). */
  outputWidth?: number;
  outputHeight?: number;
  /**
   * Resolve a bundled-media relativeURL (e.g. "Media/beginning rect copy.png")
   * to decoded RGBA pixels. Some transitions (e.g. Stylized/Documentary/Slide)
   * reference template-bundled PNG tile assets alongside the drop-zone images.
   * The core engine does no file IO; the host injects a resolver (e.g. reading
   * from the .motr's directory). Returns null when the asset can't be resolved.
   */
  mediaResolver?: (url: string) => ImageData | null;
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
  const outW = opts?.outputWidth;
  const outH = opts?.outputHeight;

  return {
    scene,
    width: outW ?? width,
    height: outH ?? height,
    render(imageA: ImageData, imageB: ImageData, progress: number): ImageData {
      // Map progress (0-1) to scene time. progress=1 maps to the animation end
      // (the last keyframe), NOT the full scene/playRange duration — the extra
      // frame past the last keyframe wraps back to the start in Motion.
      const duration = scene.settings.duration;
      const endSec = scene.settings.animationEndSec ?? (duration.value / duration.timescale);
      const timeSec = progress * endSec;

      // Evaluate all layers at this time
      const evaluated = evaluate(scene, timeSec);

      // Composite into a frame at native scene resolution
      const frame = composite(evaluated, imageA, imageB, width, height, opts?.mediaResolver);
      // Conform to output resolution if requested
      if (outW && outH && (outW !== width || outH !== height)) {
        return resample(frame, outW, outH);
      }
      return frame;
    }
  };
}
