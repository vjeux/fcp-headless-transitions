import { parseMotr } from './parser/index.js';
import { evaluate } from './evaluator/index.js';
import { composite } from './compositor/index.js';
import { resample, cropCenter } from './compositor/resample.js';
import { detect360Band, render360Band } from './compositor/transition360.js';
import { buildTimeMap } from './timemap.js';
import { hasColorizeRemapRig, isEquirectScene } from './capabilities.js';
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
  /**
   * Render one frame at an ABSOLUTE scene time (seconds) — the engine's single
   * time authority. `render(progress)` is exactly `renderAt(progress *
   * animationEndSec)`. A harness that wants headless and engine to sample the SAME
   * scene-moment per frame should drive BOTH with the shared time model, e.g.
   * `renderAt(sample_time(i, N, span))` (see docs/RENDERER_CONTRACT.md); the same
   * timeSec then produces the same evaluated scene instant in either renderer.
   * @param timeSec - Scene time in seconds (0 = start; animationEndSec = visual end)
   */
  renderAt(imageA: ImageData, imageB: ImageData, timeSec: number): ImageData;
  /** Width of the output frame. */
  width: number;
  /** Height of the output frame. */
  height: number;
  /**
   * The scene time (seconds) that progress=1 maps to — the transition's VISUAL end
   * (the last animating keyframe / layer-out), which for most transitions is
   * slightly before the authored span (duration/frameRate). `render(progress)`
   * scales progress by this. Exposed so a caller can convert between the progress
   * and absolute-time domains.
   */
  animationEndSec: number;
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

  // WIDE EQUIRECT (360°/VR) scene: a ≥3072-wide, ~2:1 panorama that does NOT take
  // the detect360Band fast path (e.g. 360°/Bloom: a 4096×2160 group with 360°-Aware
  // Gaussian/Glow/Bloom filters over the two drop zones). FCP renders the full
  // panorama then reads back an output-sized window CENTERED on the aperture centre —
  // a front-facing view — NOT a bilinear squeeze of the 2:1 canvas into 16:9 (which
  // horizontally compresses everything ~2.13×: the geometry bug that scored
  // 360°_Bloom at 5.1 dB vs the headless centred-crop's 16.9). Matches oz_render.mm's
  // `sceneBounds.w >= 3072` equirect readback. When set, renderInstant CROPs the
  // conform instead of resampling. See docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md.
  // Scene-aware: only a GENUINE panorama scene (both drop zones wide, see
  // isEquirectScene) takes the cropCenter readback. A plain HD transition inside a 4K
  // canvas (Movements/Smear) resamples the full frame down (and its drop zones get the
  // fill-conform) so the settled-B tail fills the frame instead of centre-cropping.
  const wideEquirect = isEquirectScene(scene);

  // 360° transition family: drop-zone cover-fit band + "Align To" horizontal push.
  // These render at the CONFORMED output resolution directly (the push transform
  // lives in point space and the equirect drop zone would otherwise be a slow 4K
  // scene render). Detected by the 4096×2048 Type=1 drop zone + Align To signature.
  const band360 = detect360Band(scene);
  if (band360) {
    const bw = outW ?? width, bh = outH ?? height;
    // The 360° band renders directly from progress; its animation span is the
    // authored scene duration (no keyframe-walk override applies to this fast path).
    const band360End = scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale);
    return {
      scene,
      width: bw,
      height: bh,
      animationEndSec: band360End,
      render(imageA: ImageData, imageB: ImageData, progress: number): ImageData {
        return render360Band(band360, imageA, imageB, progress, bw, bh);
      },
      renderAt(imageA: ImageData, imageB: ImageData, timeSec: number): ImageData {
        return render360Band(band360, imageA, imageB, band360End > 0 ? timeSec / band360End : 0, bw, bh);
      },
    };
  }

  // NOTE (2026-07-05, policy): a per-transition "detectLightSweep/renderLightSweep"
  // dispatch was REMOVED here. It fired on exactly ONE transition and replayed that
  // transition's decoded ground-truth storyboard (navy backdrop + timed lens-flare +
  // flat tail) instead of rendering the .motr node graph. That is hardcoding a single
  // transition, not building a generic engine. Light Sweep must be produced by the
  // generic primitives (particle-emitter fill-color swatch generator, generator sRGB
  // gamma, screen-blend overlay consumption, layer-timeout compositing). Until those
  // primitives exist it renders generically (lower PSNR) — an HONEST number beats a
  // scripted 44dB. See ~/fct-notes/GENERIC_ENGINE_POLICY.md.

  // Single scene-time authority: retime-wrap + stroked-mask clamp, derived from
  // node/behavior TYPES (no transition names). See timemap.ts.
  const timeMap = buildTimeMap(scene);

  // Motion blur keys off a structural signature (capabilities.ts): a COLORIZE
  // filter rigged by a "Color" widget through a "remap" behavior — the decorative
  // tile "Slide" family. NOT any "Color" rig (Light Sweep drives a glow and must not
  // get the 16-sample blur: it regressed 44->15 dB when it did).
  const colorizeRemapRig = hasColorizeRemapRig(scene);

  // Motion blur: the scene declares a shutter (motionBlurSamples>1). Enable it
  // ONLY for the Slide-family decorative-tile transitions — their tiles sweep
  // thousands of pixels per frame, and the reference renderer's 8-sample blur
  // turns their hard edges into the soft grayscale wash the GT shows mid-
  // transition. Gating this way avoids paying 8× render cost — and risking sub-
  // pixel regressions — on the 60+ other transitions that also carry the default
  // samples=8 but have no fast tile sweep.
  // Motion blur is enabled for the Slide family ONLY when its decorative tiles
  // actually MOVE — motion blur is intrinsically motion-dependent, so a family
  // member whose tiles are stationary (e.g. Close & Open, whose tiles have 0
  // velocity — its transition is the drop-zone crossfade, not a tile sweep) must
  // not be blurred (averaging sub-frames there would smear the A→B crossfade and
  // regress it). Measure the max per-frame world-translation of any animated image
  // layer over a short probe; require a few px/frame before blurring.
  let motionBlurEnabled = (scene.settings.motionBlurSamples ?? 1) > 1 && colorizeRemapRig;
  if (motionBlurEnabled) {
    const endProbe = scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale);
    const fps = scene.settings.frameRate > 0 ? scene.settings.frameRate : 30;
    let maxTilePxPerFrame = 0;
    // Probe a handful of frames across the transition; track each animated image
    // layer's world-translation delta between adjacent frames.
    let prev: Map<string, [number, number]> | null = null;
    const probes = 8;
    for (let k = 0; k <= probes; k++) {
      const ev = evaluate(scene, (k / probes) * endProbe);
      const cur = new Map<string, [number, number]>();
      (function walk(ls: readonly import('./evaluator/index.js').EvaluatedLayer[]) {
        for (const l of ls) {
          if (l.layer.type === 'image' && l.layer.source && l.opacity > 0.05) {
            cur.set(l.layer.name ?? String(l.layer.id), [l.worldTransform[12], l.worldTransform[13]]);
          }
          walk(l.children);
        }
      })(ev.layers);
      if (prev) {
        for (const [name, [x, y]] of cur) {
          const p = prev.get(name);
          if (!p) continue;
          const pxPerFrame = Math.hypot(x - p[0], y - p[1]) / (endProbe / probes) / fps;
          if (pxPerFrame > maxTilePxPerFrame) maxTilePxPerFrame = pxPerFrame;
        }
      }
      prev = cur;
    }
    // A couple px/frame of motion is the floor below which an 8-sample shutter is a
    // visual no-op; below it, skip the blur (and its cost + crossfade smear).
    if (maxTilePxPerFrame < 4) motionBlurEnabled = false;
  }

  // progress=1 maps to the animation end (the last keyframe), NOT the full
  // scene/playRange duration — the extra frame past the last keyframe wraps back to
  // the start in Motion. `render(progress)` and `renderAt(timeSec)` share this.
  const duration = scene.settings.duration;
  const endSec = scene.settings.animationEndSec ?? (duration.value / duration.timescale);

  // Render a SINGLE scene instant (seconds) to a frame, applying the scene-time
  // remap (retime-wrap + stroked-mask clamp, see timemap.ts) + resolution conform.
  // This is the engine's single time authority: both the public `renderAt(timeSec)`
  // and the progress-based `render()` (via `progress * endSec`) funnel through here.
  // Motion blur averages several of these across the shutter, so all per-instant
  // logic lives here.
  const renderInstant = (imageA: ImageData, imageB: ImageData, centerSec: number): ImageData => {
    const renderOne = (tSec: number): ImageData => {
      const timeSec = timeMap.remap(tSec);
      const evaluated = evaluate(scene, timeSec);
      // Preserve the UN-wrapped scene time so the compositor's particle-field
      // proxy can follow the true transition envelope even after wrapping.
      evaluated.unwrappedTime = tSec;
      // FCP renders at the PROJECT (output) resolution. A scene authored SMALLER
      // than the output (Dissolves/Divide, Movements/Drop In: 1280×720 → 1920×1080)
      // renders at its NATIVE scene size and then resamples to output — exactly like
      // a scene authored LARGER than output. Rendering an upscaled scene DIRECTLY at
      // output size (an earlier special-case) left every SCENE-space geometry — most
      // visibly the mask shapes — at its authored pixel extent inside the bigger
      // buffer: Divide's divide-piece masks (authored to tile the 1280-wide frame)
      // then covered only 1280/1920 ≈ 67% → the A card was clipped to a centred rect
      // and 51% of the frame rendered BLACK. Native-then-resample scales the whole
      // scene (images, shapes, masks) uniformly, so the pieces tile the frame again.
      // (Verified vs GUI GT: Divide 10.15→11.16, Drop In 14.61→14.76; both improve.)
      const frame = composite(evaluated, imageA, imageB, width, height, opts?.mediaResolver);
      if (outW && outH && (outW !== width || outH !== height)) {
        // WIDE EQUIRECT (360°/VR, e.g. 4096×2048 panorama): FCP reads back a
        // centred output-sized window (front-facing view), it does NOT squeeze the
        // 2:1 panorama into 16:9. Matches oz_render.mm's `sb.w >= 3072` readback ROI.
        // A bilinear squeeze here horizontally compresses everything ~2.13× (the
        // geometry bug behind Bloom's 5 dB vs headless's 17 dB). See
        // docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md.
        return wideEquirect ? (process.env.FCT_DBG_NOCROP ? frame : cropCenter(frame, outW, outH)) : resample(frame, outW, outH);
      }
      return frame;
    };

    if (motionBlurEnabled) {
      const samples = scene.settings.motionBlurSamples ?? 1;
      const shutterFrames = scene.settings.motionBlurDuration ?? 1;
      const frameSec = scene.settings.frameRate > 0 ? 1 / scene.settings.frameRate : 1 / 30;
      const shutterSec = shutterFrames * frameSec;
      let out: ImageData | null = null;
      let accum: Float64Array | null = null;
      for (let s = 0; s < samples; s++) {
        // Trailing shutter: motion blur accumulates the object's PAST positions
        // (samples span [centerSec - shutter, centerSec]), the physically-correct
        // model for a frame exposed over the preceding shutter interval.
        const frac = samples > 1 ? (s / (samples - 1)) - 1 : 0; // -1..0
        let tSec = centerSec + frac * shutterSec;
        if (tSec < 0) tSec = 0;
        if (tSec > endSec) tSec = endSec;
        const f = renderOne(tSec);
        if (!accum) { accum = new Float64Array(f.data.length); out = f; }
        const d = f.data;
        for (let i = 0; i < d.length; i++) accum[i] += d[i];
      }
      if (out && accum) {
        const d = out.data;
        for (let i = 0; i < d.length; i++) d[i] = Math.round(accum[i] / samples);
        return out;
      }
    }

    return renderOne(centerSec);
  };

  return {
    scene,
    width: outW ?? width,
    height: outH ?? height,
    animationEndSec: endSec,
    render(imageA: ImageData, imageB: ImageData, progress: number): ImageData {
      return renderInstant(imageA, imageB, progress * endSec);
    },
    renderAt(imageA: ImageData, imageB: ImageData, timeSec: number): ImageData {
      return renderInstant(imageA, imageB, timeSec);
    },
  };
}
