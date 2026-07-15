/**
 * Evaluator — per-call evaluation context.
 *
 * Bundles the render-scoped flags that used to be module globals (fps + drop-zone
 * visibility policy) into one object threaded through evaluate -> evaluateLayer -> ...
 * so nothing render-scoped is a module global. Split out of evaluator/index.ts
 * (ROADMAP item 7) into its own module to avoid an index<->ramp import cycle.
 */

/**
 * Scene frame rate for the current evaluation pass. Set at the top of
 * `evaluate()`. Fade In/Out Times are expressed in frames; the behavior's
 * timing window is in seconds, so we need the fps to convert.
 *
 * These three were module-level globals (set per-render at the top of evaluate()),
 * which meant two concurrent evaluate() calls corrupted each other and tests had to
 * run serially. They are now bundled into a per-call EvalCtx threaded through the
 * evaluation tree (evaluate -> evaluateLayer -> ...). Nothing render-scoped is a
 * module global anymore.
 */
export interface EvalCtx {
  /** scene.settings.frameRate (or 30). Frame->second conversions for behaviors. */
  fps: number;
  /**
   * When true, a wrapping drop-zone image layer (Retime mode 1) whose lifetime has
   * ended is kept VISIBLE re-showing source A past its `out`, rather than
   * disappearing. Set only when the transition has an independent overlay animation
   * that outlives the drop-zone crossfade (e.g. Lights/Flash's white flash), so the
   * flash rides over a persistent source-A base instead of an empty frame.
   */
  wrapToA: boolean;
  /**
   * When true, the incoming (Type=2) Transition-B drop zone HOLDS its last frame
   * (source B) past its timing `out`, staying visible as the settled base. Set for a
   * scene whose drop-zone A->B crossfade is over-run by an independent blended VIDEO
   * overlay (Lights/Light Noise). Without it the tail frames render an empty base.
   */
  holdIncomingB: boolean;
  /**
   * When true, this scene is a FILTER-driven A→B reveal that SETTLES on B in the
   * tail (Movements/Smear, Lights/Bloom — see capabilities.hasFilterRevealSettleB).
   * Its held B drop zone must render OPAQUE and force its (timed-out) parent group
   * visible, so the wrap-released tail shows settled photo B instead of a black
   * frame. Distinct from holdIncomingB (Light Noise), whose held B rides behind a
   * still-opaque overlay and keeps its own (curve) opacity + group gating unchanged.
   */
  filterRevealSettleB: boolean;
  /**
   * animationEndSec — the rendered clip duration (last spatial keyframe / scene
   * duration). Used by the kinetic-panel template RETIME: an offset-authored panel's
   * media [in,out] range plays over [0,endSec], so its local curve time advances at
   * rate (out-in)/endSec, not 1:1 with scene time. Needed where curveTime is built.
   */
  animationEndSec?: number;
}
