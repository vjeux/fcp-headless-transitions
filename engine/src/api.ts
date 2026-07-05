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

  // NOTE (2026-07-05, policy): a per-transition "detectLightSweep/renderLightSweep"
  // dispatch was REMOVED here. It fired on exactly ONE transition and replayed that
  // transition's decoded ground-truth storyboard (navy backdrop + timed lens-flare +
  // flat tail) instead of rendering the .motr node graph. That is hardcoding a single
  // transition, not building a generic engine. Light Sweep must be produced by the
  // generic primitives (particle-emitter fill-color swatch generator, generator sRGB
  // gamma, screen-blend overlay consumption, layer-timeout compositing). Until those
  // primitives exist it renders generically (lower PSNR) — an HONEST number beats a
  // scripted 44dB. See ~/fct-notes/GENERIC_ENGINE_POLICY.md.

  // Retime wrap threshold: the time (seconds) past which FCP loops the transition  // playhead back to the start (t=0) because a drop zone with retimingExtrapolation
  // mode 1 (wrap) has run out its media/lifetime — so the drop zones re-show source
  // A. The loop fires when the FIRST wrapping drop zone times out (its layer
  // timing `out`), which is when the outgoing content disappears. Verified on
  // Blurs/Zoom: the A drop zone times out at 0.4338s and GT frames past that are
  // byte-identical to frame 0 (pure A). The retime curve's last keyframe (0.4671s)
  // over-shoots this, so we use the layer lifetime, not the keyframe time.
  // undefined when no wrapping drop zone exists (the common case → no wrap).
  let retimeWrapSec: number | undefined;
  // Ceiling on scene time for a stroked-mask reveal (Objects/Arrows): the tail
  // frames clamp here (just under the drop-zone timeout) so the fully-revealed B
  // persists instead of wrapping to A or vanishing past the drop-zone lifetime.
  let strokedMaskClampSec: number | undefined;
  const t2s = (rt: import('./types.js').RationalTime): number =>
    rt.timescale > 0 ? rt.value / rt.timescale : 0;
  // Object IDs cloned by a Clone Layer whose lifetime extends past the source's own
  // timeout. Such a source's timeout does NOT end the visible transition — its
  // Clone keeps rendering the (rotating) content — so we must NOT treat that
  // (early) timeout as the scene's wrap-to-frame-0 point. Movements/Switch's
  // "Clone B" (in=0.934s, out=1.735s) clones the timed-out Transition B (out=0.9s):
  // using B's 0.9s as the wrap collapsed the whole second half to frame 0. Excluding
  // it leaves Transition A's 1.702s as the true wrap (GT frames past 1.702s ARE
  // frame-0/source-A; the tail before that keeps animating via the clone).
  const clonedContinuationSourceIds = new Set<number>();
  (function scanClones(layers: readonly import('./types.js').Layer[]) {
    for (const l of layers) {
      if (l.type === 'clone' && l.cloneSourceId !== undefined && l.timing) {
        clonedContinuationSourceIds.add(l.cloneSourceId);
      }
      scanClones(l.children);
    }
  })(scene.layers);
  (function scan(layers: readonly import('./types.js').Layer[]) {
    for (const l of layers) {
      const rv = l.retimeValue;
      if (rv && rv.retimingExtrapolation === 1 && rv.keyframes.length >= 2) {
        // A drop zone whose media is continued by a Clone Layer does not end the
        // transition at its own timeout — skip it from the wrap-min.
        if (clonedContinuationSourceIds.has(l.id)) { scan(l.children); continue; }
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

  // Slide-family detection: a Colorize filter rig-driven by a "Color" accent
  // widget over decorative image tiles. This structural signature matches a real
  // family (Slide, Diagonal, Glide, Up/Over, Close & Open — a "Color" rig widget
  // driving a Colorize). It gates the motion-blur pass below: these families have
  // fast-sweeping decorative tiles that the reference renderer shutter-blurs into
  // a soft wash. NOTE: this MUST require the rigged filter to be a COLORIZE — a
  // "Color" widget can rig other filters (Light Sweep drives a glow), and enabling
  // the tile motion-blur there regressed it (44→15dB).
  let isSlideFamily = false;
  {
    const colorWidgetIds = new Set<number>();
    for (const w of scene.rigWidgets) if ((w.name || '').toLowerCase() === 'color') colorWidgetIds.add(w.id);
    if (colorWidgetIds.size > 0) {
      // Only a COLORIZE filter counts — a "Color" widget may rig OTHER filters
      // (e.g. Light Sweep drives a glow/gradient filter and is NOT a Slide-family
      // tile transition; enabling its 16-sample blur here regressed it 44→15dB).
      const colorizeIds = new Set<number>();
      (function collect(layers: readonly import('./types.js').Layer[]) {
        for (const l of layers) {
          for (const f of l.filters) {
            const pn = (f.pluginName || '').toLowerCase();
            const nm = (f.name || '').toLowerCase();
            if (pn.includes('colorize') || nm.includes('colorize')) colorizeIds.add(f.id);
          }
          collect(l.children);
        }
      })(scene.layers);
      for (const b of scene.rigBehaviors) {
        if (colorizeIds.has(b.affectedObjectId) && colorWidgetIds.has(b.widgetId)
            && (b.paramType || '').toLowerCase().includes('remap')) { isSlideFamily = true; break; }
      }
    }
  }

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
    // A STROKED-shape image mask (Objects/Arrows): the drop zone carries an Image
    // Mask whose source group holds stroked arc shapes (arrow arcs) whose trim
    // GROWS to full coverage. That reveal IS the entire transition and its END
    // state (full B) must persist — freezing the scene back to frame 0 would snap
    // the arrows back to a sliver and re-show A on the last frames. Detect a
    // stroked shape anywhere in the scene and disable the wrap for it.
    let hasStrokedMaskShape = false;
    // A REPLICATOR-matte reveal (Replicator-Clones/Duplicate): a layer's Image Mask
    // Mask Source is a grid Replicator whose Sequence Replicator grows the cells
    // 0→1 to reveal the masked layer (Transition B) over the base (Transition A).
    // That growing-dots reveal IS the entire transition; its end state (full B)
    // must persist to progress=1. The many hidden cell-candidate shapes inside the
    // replicator's cell group carry early drop-zone timeouts (~0.7s) that would
    // otherwise set retimeWrapSec and snap the tail back to A. Disable the wrap
    // when such a replicator-matte reveal exists. Structural (any replicator used
    // as a mask source) — no transition name, no GT constant.
    let hasReplicatorMaskReveal = false;
    const replicatorIds = new Set<number>();
    (function collectRepl(layers: readonly import('./types.js').Layer[]) {
      for (const l of layers) {
        if (l.type === 'replicator') replicatorIds.add(l.id);
        collectRepl(l.children);
      }
    })(scene.layers);
    (function scan2(layers: readonly import('./types.js').Layer[]) {
      for (const l of layers) {
        if (l.type === 'shape' && l.shape && !l.shape.isMask && (l.shape.fillColor || l.shape.isSolidPanel)) hasFilledShapeOverlay = true;
        if (l.type === 'shape' && l.shape && l.shape.stroke) hasStrokedMaskShape = true;
        if (l.imageMaskSourceId !== undefined && replicatorIds.has(l.imageMaskSourceId)) hasReplicatorMaskReveal = true;
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
    if (retimeWrapSec !== undefined && (hasFilledShapeOverlay || hasBlendedMediaOverlay || hasReplicatorMaskReveal) && endSec > retimeWrapSec + frameSec) {
      retimeWrapSec = undefined;
    }
    // Stroked-mask reveal (Objects/Arrows): the growing arrow arcs cut A away to
    // full B by the drop-zone `out`. Past `out` the drop zones would vanish
    // (blank frame) and the retime-wrap would snap back to A — both wrong (GT
    // holds full B). Instead of wrapping, CLAMP the scene time to just under the
    // drop-zone timeout for the tail frames so the fully-revealed B (mask at full
    // coverage, both drop zones alive) persists to progress=1. Recorded here;
    // applied in render().
    strokedMaskClampSec = (hasStrokedMaskShape && retimeWrapSec !== undefined)
      ? Math.max(0, retimeWrapSec - frameSec * 0.25)
      : undefined;
    if (strokedMaskClampSec !== undefined) retimeWrapSec = undefined;
  }

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
  let motionBlurEnabled = (scene.settings.motionBlurSamples ?? 1) > 1 && isSlideFamily;
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

      // Render a single scene time to a frame (applies retime-wrap + stroked-mask
      // clamp + resolution conform). Motion blur averages several of these across
      // the shutter, so all per-time logic lives here (not in the caller).
      const wrapFrameTol = (scene.settings.frameRate > 0 ? 1 / scene.settings.frameRate : 1 / 30) / 2;
      const renderAt = (tSec: number): ImageData => {
        let timeSec = tSec;
        // Retime extrapolation (mode 1 = wrap): once the wrapping drop zone has
        // timed out by this frame (within a half-frame tolerance — FCP samples the
        // frame centre), the transition loops back to the start and re-shows A.
        if (retimeWrapSec !== undefined && timeSec >= retimeWrapSec - wrapFrameTol) {
          timeSec = 0;
        }
        // Stroked-mask reveal tail: clamp to just under the drop-zone timeout so the
        // fully-revealed B holds for the last frames (see strokedMaskClampSec).
        if (strokedMaskClampSec !== undefined && timeSec > strokedMaskClampSec) {
          timeSec = strokedMaskClampSec;
        }
        const evaluated = evaluate(scene, timeSec);
        // Preserve the UN-wrapped scene time so the compositor's particle-field
        // proxy can follow the true transition envelope even after wrapping.
        evaluated.unwrappedTime = tSec;
        // FCP renders at the PROJECT (output) resolution. Only upscale-case renders
        // directly at output (absolute-coordinate masks); larger native canvases
        // render native then resample.
        const upscale = !!(outW && outH && outW > width && outH > height);
        if (upscale) return composite(evaluated, imageA, imageB, outW!, outH!, opts?.mediaResolver);
        const frame = composite(evaluated, imageA, imageB, width, height, opts?.mediaResolver);
        if (outW && outH && (outW !== width || outH !== height)) return resample(frame, outW, outH);
        return frame;
      };

      const centerSec = progress * endSec;

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
          const f = renderAt(tSec);
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

      return renderAt(centerSec);
    }
  };
}
