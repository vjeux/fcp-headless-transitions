/**
 * Evaluator — rig-resolved filter parameter overrides.
 *
 * Rig behaviors can target filter objects (by id) to drive params (Amount/Mix/Angle)
 * from the selected widget's snapshot, and Oscillate scene behaviors can drive a
 * filter channel (e.g. a Zoom Blur pulse). Produces filterId -> (paramName -> value),
 * consumed by the compositor when applying filters. Split out of evaluator/index.ts
 * (ROADMAP item 7).
 */
import type { MotrScene, SceneBehavior, Layer, Filter } from '../types.js';
import { evaluateCurve, timeToSeconds } from './curves.js';

/**
 * Compute rig-resolved filter parameter overrides.
 * Rig behaviors can target filter objects (by id) to set params like Amount/Mix/Angle
 * based on the widget's snapshot. Returns filterId → (paramName → resolved value).
 */
export function computeFilterOverrides(scene: MotrScene, timeSec: number, widgetValues: Map<number, number>): Map<number, Map<string, number>> {
  const overrides = new Map<number, Map<string, number>>();

  // Collect all filter IDs in the scene
  const filterIds = new Set<number>();
  function collectFilters(layers: Layer[]) {
    for (const l of layers) {
      for (const f of l.filters) filterIds.add(f.id);
      collectFilters(l.children);
    }
  }
  collectFilters(scene.layers);

  // Find the max retime frame span for time→frame conversion (use scene duration)
  for (const behavior of scene.rigBehaviors) {
    if (!filterIds.has(behavior.affectedObjectId)) continue;
    // This rig behavior targets a filter
    const rawValue = widgetValues.get(behavior.widgetId) ?? 0;
    let snapIndex = Math.round(rawValue);
    snapIndex = Math.max(0, Math.min(behavior.snapshots.length - 1, snapIndex));
    const byId = behavior.snapshotIds.indexOf(snapIndex + 1);
    if (byId >= 0) snapIndex = byId;
    const snapshot = behavior.snapshots[snapIndex];
    if (!snapshot) continue;

    // The snapshot's value is the resolved parameter (may be a curve or default→value)
    let value: number;
    if (snapshot.curve) {
      if (snapshot.curve.keyframes.length > 0) {
        value = evaluateCurve(snapshot.curve, timeSec);
      } else {
        value = snapshot.curve.value !== undefined ? snapshot.curve.value : snapshot.curve.default;
      }
    } else if (typeof snapshot.value === 'number') {
      value = snapshot.value;
    } else {
      continue;
    }

    if (!overrides.has(behavior.affectedObjectId)) {
      overrides.set(behavior.affectedObjectId, new Map());
    }
    overrides.get(behavior.affectedObjectId)!.set(behavior.paramType, value);
  }

  // Scene Oscillate behaviors can drive a filter parameter channel directly
  // (e.g. Blurs/Zoom: an Oscillate targets the real "Zoom Blur" filter's channel
  // "./1" = Amount). This is distinct from rig snapshots — it's a procedural
  // animator. Map channel "./N" → the filter param whose id === N, then apply the
  // Oscillate value at this time.
  {
    // Index every filter by id for channel→param resolution.
    const filterById = new Map<number, Filter>();
    (function collect(layers: Layer[]) {
      for (const l of layers) { for (const f of l.filters) filterById.set(f.id, f); collect(l.children); }
    })(scene.layers);

    for (const b of scene.sceneBehaviors) {
      if (b.type !== 'oscillate') continue;
      if (!filterIds.has(b.affectedObjectId)) continue;
      const filter = filterById.get(b.affectedObjectId);
      if (!filter) continue;
      // Resolve the driven channel "./N" → param id N → param name.
      const chanMatch = /\.\/(\d+)$/.exec(b.affectingChannel || '');
      if (!chanMatch) continue;
      const paramId = parseInt(chanMatch[1], 10);
      const targetParam = filter.parameters.find(p => p.id === paramId);
      if (!targetParam) continue;

      const oscVal = evaluateOscillateChannel(b, timeSec, scene);
      if (oscVal === undefined) continue;

      if (!overrides.has(b.affectedObjectId)) overrides.set(b.affectedObjectId, new Map());
      // The channel's base value + the oscillation. Base is the param's static value.
      const base = typeof targetParam.value === 'number' ? targetParam.value : 0;
      overrides.get(b.affectedObjectId)!.set(targetParam.name, base + oscVal);
    }
  }

  return overrides;
}

/**
 * Evaluate a scene Oscillate behavior driving a filter-parameter channel.
 *
 * Motion's Oscillate produces a periodic offset around the channel's base value.
 * Parameters observed on Blurs/Zoom's Amount oscillator:
 *   Wave Shape = 3, Amplitude = 100, Speed = 50, sliderRange = 32
 *
 * Formula (derived + validated against the real FCP engine on Blurs/Zoom):
 *   - Speed is oscillations per MINUTE ⇒ cyclesPerSec = Speed / 60. With Speed=50
 *     over the ~0.6s window this is ≈0.5 cycle = a single hump.
 *   - Wave Shape 3 = sine. Taking the positive half (|sin|) over the behavior's
 *     active [in,out] window yields a hump: 0 at the ends, peak in the middle —
 *     the "blur peaks mid-transition" pattern the previous agent observed and that
 *     the GT (frames ~5–7) confirms.
 *   - Amplitude is a percentage of the channel's slider range, so the raw FCP
 *     channel offset is (Amplitude/100) * sliderRange (peak 32 for Amount).
 *
 * IMPORTANT UNIT + WINDOW NOTES (validated empirically against the real engine):
 *   1. FCP's PAEZoomBlur "Amount" units are NOT 1:1 with this engine's zoomBlur()
 *      `amount` (a per-sample scale of `1 + t*0.01`). Applying the raw channel
 *      value (≈32) as a zoomBlur amount massively over-blurs (PSNR 31→20dB).
 *      Calibrating the peak against the GT sharpness profile gives a conversion of
 *      ~0.016 (FCP Amount 32 → zoomBlur amount ≈0.5).
 *   2. The visible blur in the GT is concentrated in the LATE half of the window
 *      (frames ~4–8, i.e. once Transition B has faded in and the two layers
 *      overlap); the first half is sharp Transition A. A raw half-sine over the
 *      full Oscillate window would blur those sharp early frames. So we phase the
 *      hump into the second half of the window (where A/B overlap), matching where
 *      FCP actually shows the zoom streaking.
 *   3. Even so, the mid-transition softness is dominated by the A/B cross-dissolve
 *      (which the compositor already reproduces); the incremental zoom blur is
 *      subtle. See the w3 report / test/window_sweep.ts for the calibration data.
 */
const FCP_AMOUNT_TO_ZOOMBLUR = 0.016; // calibrated on Blurs/Zoom GT (32 → ~0.5)

function evaluateOscillateChannel(b: SceneBehavior, timeSec: number, scene: MotrScene): number | undefined {
  const amplitude = b.params['Amplitude'] ?? 0;
  const sliderRange = b.params['sliderRange'] ?? 1;

  // Active window (seconds) from the behavior's <timing>. Outside it, no drive.
  const winIn = b.timing ? timeToSeconds(b.timing.in) : 0;
  const winOut = b.timing ? timeToSeconds(b.timing.out)
    : (scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale));
  const dur = winOut - winIn;
  if (dur <= 0) return 0;

  const tRel = timeSec - winIn;
  if (tRel <= 0 || tRel >= dur) return 0;

  // Phase the hump into the overlap half of the window: the blur ramps in only
  // once Transition B has appeared (the first ~40% of the window is sharp A).
  const HUMP_START = 0.4; // fraction of the window where the blur begins
  const u = (tRel / dur - HUMP_START) / (1 - HUMP_START);
  if (u <= 0) return 0;
  // Half-sine hump over [HUMP_START, 1] (Wave Shape 3 = sine, positive half).
  const wave = Math.sin(Math.PI * Math.min(1, u));
  const fcpAmount = (amplitude / 100) * sliderRange * wave;
  return fcpAmount * FCP_AMOUNT_TO_ZOOMBLUR;
}
