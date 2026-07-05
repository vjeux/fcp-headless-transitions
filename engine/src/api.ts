import { parseMotr } from './parser/index.js';
import { evaluate } from './evaluator/index.js';
import { composite } from './compositor/index.js';
import { resample } from './compositor/resample.js';
import { detect360Band, render360Band } from './compositor/transition360.js';
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
  mediaResolver?: (url: string, timeSec?: number, absolute?: boolean) => ImageData | null;
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

  // 360° transition family: drop-zone cover-fit band + "Align To" horizontal push.
  // These render at the CONFORMED output resolution directly (the push transform
  // lives in point space and the equirect drop zone would otherwise be a slow 4K
  // scene render). Detected by the 4096×2048 Type=1 drop zone + Align To signature.
  const band360 = detect360Band(scene);
  if (band360) {
    const bw = outW ?? width, bh = outH ?? height;
    return {
      scene,
      width: bw,
      height: bh,
      render(imageA: ImageData, imageB: ImageData, progress: number): ImageData {
        return render360Band(band360, imageA, imageB, progress, bw, bh);
      },
    };
  }

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

  // The wrap freezes the WHOLE scene back to frame 0 (drop zones re-show A). That
  // is correct when the drop-zone crossfade IS the entire visible transition (e.g.
  // Blurs/Zoom and Lights/Bloom, whose GT past the drop-zone timeout is
  // byte-identical to frame 0). But a transition with a SOLID-FILL SHAPE overlay
  // (Lights/Flash's white flash rectangles) keeps that overlay animating past the
  // drop-zone wrap — freezing would kill the flash. Disable the wrap ONLY when
  // such a filled-shape overlay exists AND the true animation end extends past the
  // wrap. The same applies to a SCREEN/ADD-blend VIDEO overlay that plays along
  // its own frame-numbered Retime timeline (Lights/Light Noise's light-noise .mov):
  // its second light burst fires PAST the drop-zone wrap, so freezing the scene to
  // time 0 (before the overlay's `in`) would drop that whole burst. Gating on a
  // filled shape OR a blended media overlay (not just "end > wrap") avoids breaking
  // plain media-crossfade Lights transitions (Bloom) whose correct tail IS the
  // frozen-A wrap.
  {
    const endSec = scene.settings.animationEndSec
      ?? (scene.settings.duration.value / scene.settings.duration.timescale);
    const frameSec = scene.settings.frameRate > 0 ? 1 / scene.settings.frameRate : 1 / 30;
    let hasFilledShapeOverlay = false;
    let hasBlendedMediaOverlay = false;
    (function scan2(layers: readonly import('./types.js').Layer[]) {
      for (const l of layers) {
        if (l.type === 'shape' && l.shape && !l.shape.isMask && (l.shape.fillColor || l.shape.isSolidPanel)) hasFilledShapeOverlay = true;
        // A blended (screen/add) VIDEO media leaf that outlives the wrap: its own
        // Retime curve (clip-frame numbers) drives an independent playhead.
        if (l.type === 'image' && l.source?.type === 'media'
          && (l.blendMode === 'screen' || l.blendMode === 'add' || l.blendMode === 'overlay' || l.blendMode === 'lighten')
          && l.timing) {
          const outSec = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
          if (outSec > (retimeWrapSec ?? 0) + frameSec) hasBlendedMediaOverlay = true;
        }
        scan2(l.children);
      }
    })(scene.layers);
    if (retimeWrapSec !== undefined && (hasFilledShapeOverlay || hasBlendedMediaOverlay) && endSec > retimeWrapSec + frameSec) {
      retimeWrapSec = undefined;
    }
  }

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
      // Preserve the UN-wrapped scene time (before the retime-wrap-to-0 above) so
      // the compositor's particle-field proxy can follow the true transition
      // envelope even after the drop zones wrap back to source A. The particle
      // field / texture live on a separate (non-wrapping) timeline.
      evaluated.unwrappedTime = progress * endSec;

      // Composite into a frame. FCP renders a transition at the PROJECT (output)
      // resolution — template scene coordinates are interpreted 1:1 in that output
      // space (a template authored at a sub-output preview canvas still lays its
      // shapes/masks out in the project's pixel space). When the template's native
      // canvas is SMALLER than the requested output (e.g. Dissolves/Divide &
      // Movements/Drop In are authored at 1280×720 but rendered into a 1080p
      // project), rendering at native then upscaling MIS-SCALES absolute-coordinate
      // shape masks — Divide's section masks are authored in 1080 space, so a 720
      // raster overflows every section to ~99% coverage instead of GT's ~48%.
      // Rendering directly at output fixes this (Divide 7.5→9.4dB, Drop In +0.4dB).
      //
      // We do this ONLY for the upscale case. For templates whose native canvas is
      // LARGER than output (the 360° equirectangular set at 4096×2048, Smear/Squares
      // at 4096, etc.), the projection/geometry is resolution-dependent and the GT
      // is produced by rendering at native then downscaling — so we preserve the
      // native-render + resample path there (rendering those at 1080 regresses them
      // ~3dB, e.g. Smear 9.9→7.1, Squares 10.6→7.4, 360° Push 10.1→7.4).
      const upscale = !!(outW && outH && outW > width && outH > height);
      if (upscale) {
        return composite(evaluated, imageA, imageB, outW!, outH!, opts?.mediaResolver);
      }
      const frame = composite(evaluated, imageA, imageB, width, height, opts?.mediaResolver);
      // Conform to output resolution if requested (native-render + resample).
      if (outW && outH && (outW !== width || outH !== height)) {
        return resample(frame, outW, outH);
      }
      return frame;
    }
  };
}
