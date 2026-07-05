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

  // Retime wrap threshold: the time (seconds) past which FCP loops the transition
  // playhead back to the start (t=0) because a drop zone with retimingExtrapolation
  // mode 1 (wrap) has run out its media/lifetime — so the drop zones re-show source
  // A. The loop fires when the FIRST wrapping drop zone times out (its layer
  // timing `out`), which is when the outgoing content disappears. Verified on
  // Blurs/Zoom: the A drop zone times out at 0.4338s and GT frames past that are
  // byte-identical to frame 0 (pure A). The retime curve's last keyframe (0.4671s)
  // over-shoots this, so we use the layer lifetime, not the keyframe time.
  // undefined when no wrapping drop zone exists (the common case → no wrap).
  let retimeWrapSec: number | undefined;
  const t2s = (rt: import('./types.js').RationalTime): number =>
    rt.timescale > 0 ? rt.value / rt.timescale : 0;
  (function scan(layers: readonly import('./types.js').Layer[]) {
    for (const l of layers) {
      const rv = l.retimeValue;
      if (rv && rv.retimingExtrapolation === 1 && rv.keyframes.length >= 2) {
        // Prefer the layer's lifetime end (when the outgoing content times out);
        // fall back to the retime curve's last keyframe if the layer is untimed.
        let wrap: number;
        if (l.timing) wrap = t2s(l.timing.out);
        else {
          const kf = rv.keyframes[rv.keyframes.length - 1];
          wrap = t2s(kf.time);
        }
        if (wrap > 0 && (retimeWrapSec === undefined || wrap < retimeWrapSec)) retimeWrapSec = wrap;
      }
      scan(l.children);
    }
  })(scene.layers);

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
      let timeSec = progress * endSec;

      // Retime extrapolation (mode 1 = wrap): past the last Retime keyframe the
      // transition loops back to the start, so the drop zones re-show source A.
      // Wrapping timeSec to 0 reproduces FCP's frozen-A tail (verified: GT frames
      // past the retime end are byte-identical to frame 0).
      if (retimeWrapSec !== undefined && timeSec > retimeWrapSec) {
        timeSec = 0;
      }

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
