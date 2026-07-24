// ============================================================================
// Scene graph types (output of the parser, input to the evaluator)
// ============================================================================

/** A rational time value (matches CMTime). */
export interface RationalTime {
  value: number;
  timescale: number;
}

/** A single keyframe in a curve. */
export interface Keyframe {
  time: RationalTime;
  value: number;
  interpolation: number; // 1=linear, 6=bezier, etc.
  inTangentTime?: number;
  inTangentValue?: number;
  outTangentTime?: number;
  outTangentValue?: number;
}

/** An animated curve (parameter over time). */
export interface Curve {
  type: number;
  default: number;
  /** Current/target value (for Retime-driven default→value interpolation on curves with no keyframes). */
  value?: number;
  /**
   * Retiming extrapolation mode (attribute `retimingExtrapolation` on a Retime
   * Value / Page Number curve). Governs how the media playhead behaves PAST the
   * last keyframe:
   *   undefined / 0 = constant hold (playhead stays on the last frame)
   *   1            = wrap/loop — the transition playhead loops back to the START
   *                  (t=0), so past the last Retime keyframe the drop zones
   *                  re-show source A. Verified on Blurs/Zoom: GT frames past the
   *                  retime end are byte-identical to frame 0 (pure A).
   */
  retimingExtrapolation?: number;
  keyframes: Keyframe[];
}

/** A named parameter — either a static value or an animated curve. */
export interface Parameter {
  name: string;
  id: number;
  value?: number | string;
  default?: number | string;
  curve?: Curve;
  children?: Parameter[];
}

/** A transform (position, rotation, scale, anchor, opacity). */
export interface Transform {
  positionX?: Curve | number;
  positionY?: Curve | number;
  positionZ?: Curve | number;
  rotationX?: Curve | number;
  rotationY?: Curve | number;
  rotationZ?: Curve | number;
  scaleX?: Curve | number;
  scaleY?: Curve | number;
  scaleZ?: Curve | number;
  anchorX?: Curve | number;
  anchorY?: Curve | number;
  anchorZ?: Curve | number;
  opacity?: Curve | number;
  cropLeft?: Curve | number;
  cropRight?: Curve | number;
  cropTop?: Curve | number;
  cropBottom?: Curve | number;
  /**
   * Channels ('posX'|'posY'|'posZ'|'rotX'|'rotY'|'rotZ'|'scaleX'|'scaleY'|'scaleZ')
   * whose value was REPLACED by a Link behavior or set by a rig snapshot. Motion's Link/rig override the channel
   * outright — the value must NOT be re-scaled by the Retime static-position
   * heuristic (which ramps a static value from its default toward the value over
   * retimeProgress). These channels bypass that ramp and use the full value.
   */
  __overrideChannels?: Set<string>;
  /**
   * Extra in-plane Z rotation (RADIANS) contributed by a Spin behavior (factory 22)
   * on this layer, accumulated over the behavior's own timing window and ADDED to
   * rotationZ in buildTransformMatrix (composed about the layer's own anchor origin,
   * so the layer pivots in place). Set by applySpinBehaviors; undefined when the
   * layer carries no Spin. Kept separate from rotationZ so it stacks on any authored
   * rotation curve without disturbing the Retime/override logic.
   */
  __spinRadians?: number;
  /**
   * Additive positionX offset (pixels) contributed by a Motion Path behavior
   * (factoryID=24) on this layer, evaluated from the Motion Path's `basePosition`
   * X curve at the behavior-local time (sceneTime clamped to the behavior's own
   * timing window). Added to positionX in buildTransformMatrix so the layer
   * slides in world space. Set by applyMotionPathBehaviors; undefined when the
   * layer carries no Motion Path. Kept separate from positionX so it stacks on
   * any authored position curve without disturbing the Retime/override logic.
   * See parseMotionPath (parser/behaviors.ts) for the payload decode. Follow-up
   * ticks will evaluate the `pathControlPoints` curved path with Attach-To-Shape
   * (currently only the linear basePosition curve contributes).
   */
  __mpDeltaX?: number;
  /** Additive positionY offset from a Motion Path behavior. See __mpDeltaX. */
  __mpDeltaY?: number;
}

/**
 * Blend mode for layer compositing.
 *
 * Names correspond to the ProCore.framework PC_BLEND_* enum. The integer value
 * of the .motr "Blend Mode" parameter (id=203/227) maps to these names via the
 * ordered PC_BLEND string table in ProCore's __cstring section (SEPARATOR
 * entries occupy indices too). See parser/index.ts BLEND_MODE_ENUM.
 */
export type BlendMode =
  | 'normal'
  | 'subtract'
  | 'darken'
  | 'multiply'
  | 'colorBurn'
  | 'linearBurn'
  | 'add'
  | 'lighten'
  | 'screen'
  | 'colorDodge'
  | 'linearDodge'
  | 'overlay'
  | 'softLight'
  | 'hardLight'
  | 'vividLight'
  | 'linearLight'
  | 'pinLight'
  | 'hardMix'
  | 'difference'
  | 'exclusion'
  | 'stencilAlpha'
  | 'stencilLuma'
  | 'silhouetteAlpha'
  | 'silhouetteLuma'
  | 'behind'
  | 'alphaAdd'
  | 'luminescentPremul'
  | 'combine'
  | 'lightWrap';

/** A filter/effect applied to a layer. */
export interface Filter {
  id: number;
  /** The scenenode `name` attribute (e.g. "Zoom Blur (for OSC)"). Distinct from
   *  pluginName (e.g. "PAEZoomBlur"). Used to detect on-screen-control preview
   *  filters, whose pluginName is identical to the real filter's. */
  name?: string;
  pluginName: string;
  pluginUUID: string;
  parameters: Parameter[];
  enabled?: Curve | boolean;
  /**
   * The filter's `<timing offset>` in seconds. A filter's parameter curves are
   * authored on the effect's OWN (filter-local) timeline; Motion places local zero
   * at `offset` on the scene timeline (scene = local + offset). To evaluate a filter
   * curve at a given scene time, sample it at (sceneTime − timingOffsetSec). Undefined
   * ⇒ 0 (curves already in scene time). Lights/Bloom's Bloom filters carry a large
   * negative offset (≈−0.77s) that re-anchors their Threshold ramps into scene time.
   */
  timingOffsetSec?: number;
}

/** Source of an image layer (transition input A or B, or a generator). */
export type ImageSource =
  | { type: 'transitionA' }
  | { type: 'transitionB' }
  | { type: 'media'; url: string; frameRate?: number }
  | { type: 'generator'; name: string; parameters: Parameter[] }
  | { type: 'gaussianGradient'; gradient: GaussianGradientConfig }
  | { type: 'lensFlare'; flare: LensFlareConfig }
  | { type: 'linearGradient'; gradient: LinearGradientConfig }
  | { type: 'color'; r: number; g: number; b: number; a: number };

/**
 * Parsed parameters of Motion's "Gradient" generator (factoryID=8,
 * pluginUUID 40091D89-9517-4344-9CB5-18436B1542D1, pluginName "Gradient").
 *
 * A LINEAR gradient fill: authored under `Object(id=2) > Gradient(id=1)` with
 * canvas Width(id=300) x Height(id=301), a Gradient(id=310) folder holding two
 * RGB stops (RGB1/RGB2, each with Location(id=1) + Color(id=3, R/G/B) child
 * curves), Opacity stops (Opacity1/Opacity2), and a Start(id=4)/End(id=5) axis
 * (X id=1, Y id=2, canvas-centred pixel coords, +Y up) as direct children of
 * `Gradient(id=310)` (the same folder as the stops). The gradient value at a
 * pixel `p` is computed by projecting `(p - Start)` onto the axis
 * `(End - Start)` and normalizing by `|axis|^2`, then clamping [0,1]:
 *   `t = dot(p - Start, End - Start) / |End - Start|^2`.
 *
 * SALVAGE — read `curve.value` NOT `curve.default`: the parser's parseParameter
 * mirrors `curve.default` onto `param.value` when `param.value` is unset, so
 * reading `param.value` returns the AUTHORED default (RED(1,0,0)@stop0,
 * BLUE(0,0,1)@stop1). Slide_In's 6 COLOUR links (colorizeRemap) remap those
 * defaults to the observed teal(72,141,144)->lightblue(223,241,242), and the
 * remapped values live in `curve.value` on each Red/Green/Blue leaf. Access
 * `param.curve.value` (falling back to `curve.default`, then `param.value`) so
 * the colorized colors are read out.
 */
export interface LinearGradientConfig {
  /** Generator canvas size (Width/Height params, in px). */
  width: number;
  height: number;
  /** Gradient axis start point, canvas-centred pixels (+Y up). */
  start: { x: number; y: number };
  /** Gradient axis end point, canvas-centred pixels (+Y up). */
  end: { x: number; y: number };
  /**
   * Colour stops, sorted by location ascending. Each stop has an axis location
   * (0..1), an RGB colour (0-255), and an opacity (0..1). Between stops the
   * engine linearly interpolates R, G, B, A.
   */
  stops: Array<{ location: number; r: number; g: number; b: number; a: number }>;
}

/**
 * Parsed parameters of Motion's "LensFlareGenerator"
 * (pluginUUID 4933D9F1-A848-4625-BCCA-198A97726DB5), used by Lights/Lens Flare.
 *
 * A procedural lens flare: a bright additive glow CORE with a radial star-burst
 * and a large concentric HALO ring, SCREEN-blended over the crossfade. The core
 * travels along a link-driven axis from `centerStart` to `centerEnd` (Motion's
 * published "Center Start"/"Center End" controls, normalized 0-1, +Y up), driven
 * by transition progress (time / animationEndSec).
 */
export interface LensFlareConfig {
  /** Generator canvas size (Width/Height params, px). */
  width: number;
  height: number;
  /** Flare-axis endpoints in Motion normalized coords (0-1, origin bottom-left, +Y up). */
  centerStart: { x: number; y: number };
  centerEnd: { x: number; y: number };
  /** Core color (0-255). */
  color: { r: number; g: number; b: number };
  /** Streak/ray color (0-255). */
  streakColor: { r: number; g: number; b: number };
  /** Master intensity (Intensity param, 0..~). */
  intensity: number;
  /**
   * Falloff CURVE (Falloff param, id 4): dips from 10 at the transition ends to
   * ~0.71 at the middle. LOWER falloff = a tighter, HOTTER, brighter core, so this
   * doubles as the brightness envelope (dim at the ends, blazing at the midpoint —
   * matches the GUI GT mean-luminance peaking at the centre frame). Undefined ⇒
   * use `falloffStatic`.
   */
  falloff?: Curve;
  falloffStatic: number;
  /** Streak intensity (0-1). */
  streakIntensity: number;
  /** Number of star-burst rays. */
  streakCount: number;
  /** Halo ring radius as a fraction of the half-diagonal (Ring Radius param). */
  ringRadius: number;
  /** Halo ring width fraction (Ring Width param). */
  ringWidth: number;
  /** Glow falloff exponent (Glow Falloff param). */
  glowFalloff: number;
}


/**
 * Parsed parameters of the Motion "Gaussian Gradient" generator
 * (pluginUUID 96A13FF0-1BBF-11D9-94CD-000A95DF1816).
 *
 * A radial gradient: Color 1 at the Center, falling off with a Gaussian
 * profile toward Color 2 at (and beyond) Radius.
 */
export interface GaussianGradientConfig {
  /** Generator canvas size (Width/Height params, in px). */
  width: number;
  height: number;
  /**
   * Center of the gradient. When `absolutePoints` is false (default) the
   * values are normalized 0-1 across the canvas; when true they are pixels
   * with origin at the canvas centre (Motion convention).
   */
  centerX: number;
  centerY: number;
  absolutePoints: boolean;
  /** Radius in canvas pixels (Color 1 → Color 2 falloff distance). */
  radius: number;
  /** Center colour (0-255 rgb, 0-1 alpha). */
  color1: { r: number; g: number; b: number; a: number };
  /** Edge colour (0-255 rgb, 0-1 alpha). */
  color2: { r: number; g: number; b: number; a: number };
  /** Flip param (invert Color 1/Color 2). */
  flip: boolean;
}

/** A scene-graph layer (may be a group with children). */
export interface Layer {
  name: string;
  id: number;
  type: 'image' | 'group' | 'shape' | 'generator' | 'replicator' | 'clone' | 'camera';
  transform: Transform;
  blendMode: BlendMode;
  filters: Filter[];
  source?: ImageSource;
  children: Layer[];
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };
  masks?: Layer[];
  /** Retime Value curve — maps host time to template frame progress. */
  retimeValue?: Curve;
  /** Shape geometry (for shape/mask layers). */
  shape?: Shape;
  /** Replicator configuration (for replicator layers). */
  replicator?: Replicator;
  /** Animation behaviors attached to this layer. */
  behaviors?: LayerBehavior[];
  /**
   * Whether the node is enabled/visible. Motion stores `<enabled>0</enabled>` on
   * nodes that exist only to drive other objects (e.g. Push's Color Solid, which
   * is a hidden position driver linked to the visible group). Default: true.
   */
  enabled?: boolean;
  /**
   * Object ID whose Position channel this clone/image mirrors, if any.
   * Clone Layers reference their source object by ID via `Source id="300"`.
   */
  cloneSourceId?: number;
  /**
   * Object ID of the drawable content a Replicator/Replicator-Cell tiles across
   * its instances. Motion stores this on the Replicator Cell scenenode as the
   * `Object Source id="128"` parameter, referencing another scenenode/layer
   * (a Shape, a Group, a Transition A/B image, etc.). Attached to the replicator
   * layer so the compositor can materialize the cell content at each instance.
   */
  cellSourceId?: number;
  /**
   * True for a Motion particle Emitter node (factoryID 23, factory description
   * "Emitter"). Its children are Particle Cell (factory 15) nodes that Motion
   * spawns into a dense field over the frame. The pure-JS engine does not run the
   * seeded particle simulation; instead, for Emitter-based Stylized/Nature
   * transitions (Diagonal, Glide) the compositor approximates the aggregate
   * particle field by compositing the bundled gray "paper" texture over the frame
   * on a structurally-derived bell envelope (see composite()). This flag lets the
   * compositor detect such scenes without English-name matching.
   */
  isParticleEmitter?: boolean;
  /**
   * Parsed Motion Emitter parameters — populated on scenenodes whose factory
   * description is "Emitter" (companion to `isParticleEmitter`). Owns emission
   * direction/range and the emitter random seed. The Particle Cell children carry
   * the per-particle physics (see `particleCell` below). Populated by T-B1 parser;
   * consumed by T-B2's particle sim.
   */
  emitter?: EmitterParams;
  /**
   * Parsed Motion Particle Cell parameters — populated on scenenodes whose
   * factory description is "Particle Cell". Owns birth rate, life, initial
   * velocity, spin, and any Gravity behavior. Populated by T-B1 parser;
   * consumed by T-B2's particle sim.
   */
  particleCell?: ParticleCellParams;
  /**
   * Link behaviors attached to this layer. A Link makes one of this layer's
   * transform channels track a source object's channel (× scale, gated by a
   * rig-driven Custom Mix, clamped to [min,max]).
   */
  links?: LinkBehavior[];
  /**
   * Camera configuration (for type === 'camera'). Motion's Camera node carries an
   * "Angle Of View" (param id 201, degrees). Some transitions rig-drive this via a
   * Rig Behavior snapshot keyed on a widget (e.g. aspect ratio); `angleOfView` holds
   * the resolved value. This is the vertical field of view used by gluPerspective.
   */
  camera?: {
    /** Vertical field of view in degrees (Motion "Angle Of View", default 45). */
    angleOfView: number;
    /** Rig behavior driving the AOV, if any (widget-selected snapshots of AOV values). */
    aovSnapshots?: number[];
    aovWidgetId?: number;
    aovDefault?: number;
    /**
     * Framing behaviors (factory 3, "Framing") attached to the camera. Each
     * targets an object by ID and drives the camera to frame that object's world
     * bbox (OZScene::computeFraming). The replicator "wall" transitions use two:
     * "Frame framer" (frames an invisible proxy → near-full-frame source A at the
     * start) cross-blending into "Frame B" (frames Transition B). See framing.ts.
     */
    framing?: FramingBehavior[];
  };
  /**
   * Image Mask source object ID. Motion attaches an `<mask name="Image Mask">`
   * node to a layer whose `Mask Source` (id=1) references another scenenode
   * (a Shape or a group of shapes) supplying the alpha. Unlike the "Masks"-group
   * sibling-clip convention, an Image Mask clips ONLY this layer (e.g. Wipes/Mask
   * masks Transition B by a rig-selected wipe shape, over an unmasked Transition A).
   * The compositor rasterizes the referenced shape(s) at their evaluated
   * transforms and multiplies this layer's alpha by the result.
   */
  imageMaskSourceId?: number;
  /**
   * Image Mask "Invert Mask" flag (id 102). When true, the rasterized mask alpha
   * is inverted before clipping (Objects/Veil reveals Transition B where the
   * wipe-matte luma is DARK, not bright).
   */
  imageMaskInvert?: boolean;
  /**
   * Drop-zone Object parameters for a Transition A/B image. Motion's drop zone
   * stores a `Type` (id 321) and a Fixed canvas `Width`/`Height` (Object ids
   * 313/314). The 360° transition family uses `Type=1` with a `4096×2048` fixed
   * canvas — a 2:1 equirectangular drop zone that cover-fits the 16:9 source into
   * a horizontal band. Present only on drop-zone image layers that declare these.
   */
  dropZone?: { type: number; width: number; height: number };
  /**
   * True when this layer carries an "Align To" behavior (factoryID 22). The 360°
   * transition family uses Align To (plus Rig Behaviors) to drive the horizontal
   * band push; its presence on a 4096×2048 Type=1 drop zone is the 360° signature.
   */
  hasAlignTo?: boolean;
}

/**
 * A Link behavior: drives one transform channel of the host layer from a source
 * object's channel. Motion uses these to make a group follow a hidden driver
 * (e.g. the Push "Color Solid" position drives the transition group's position).
 *
 * Effective value = clamp(sourceChannelValue, min, max) * scale, applied only when
 * the (rig-selected) Custom Mix is non-zero.
 */
export interface LinkBehavior {
  /** Object ID this link is attached to (the driven layer). */
  affectedObjectId: number;
  /** Object ID whose channel supplies the value (the driver). */
  sourceObjectId: number;
  /** Which transform channel is driven: 'X' | 'Y' | 'Z'. */
  targetChannel: 'X' | 'Y' | 'Z';
  /** Which transform property the target channel belongs to, decoded from the
   *  channelBehavior affectingChannel path:
   *  "./1/100/101/*"=position, "./1/100/105/*"=scale, "./1/100/109/*"=rotation,
   *  "./1/200/202"=opacity (Blending > Opacity).
   *  Defaults to 'position' when the path is absent/unrecognized (legacy Push
   *  links carry position paths). A rotation/scale Link (e.g. Clothesline's
   *  LinkRotZ on ".../100/109/3") must NOT corrupt positionZ. An opacity Link
   *  (e.g. Scale's LinkAO/LinkBO/LinkBOF on ".../200/202") drives layer opacity.
   *  An anchor Link (e.g. Reflection's LinkAnchor on ".../100/107") drives the
   *  anchor point (anchor-Z = the book-fold hinge spine). */
  targetProp: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' | 'color';
  /** Which transform property the SOURCE channel is read from, decoded from the
   *  sourceChannelRef path. Defaults to 'position'. */
  sourceProp: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' | 'color';
  /**
   * Colour-Link target (only set when `targetProp === 'color'`). Decoded from the
   * Link's affectingChannel path + the Affecting Object's node type:
   *
   *   Colorize filter's Remap Black To (id=1)/Remap White To (id=2) — the Link is
   *   attached to a scenenode whose Affecting Object (id 199) resolves to a
   *   ProPlugin Colorize filter (pluginName contains "Colorize"), and
   *   affectingChannel is `./1` (RemapBlack) or `./2` (RemapWhite). Panels_Across
   *   uses this: 3× "Cross" scenenodes each carry a Colorize filter + a `Link
   *   remap black` (./1) + `Link remap white` (./2), both reading the hidden
   *   "Color linker" shape's Fill Color RGB (0.737, 0.070, 0.141) as the accent.
   *
   *   Shape Fill Color (id=111) — affectingChannel is `./2/353/113/111` and the
   *   affected object is a Shape scenenode. Panels_Across's "Red bar" uses this
   *   (a single Link fill color copies the Color linker's RGB into the bar's fill).
   *
   *   The channel is R/G/B, mapped from targetChannel X/Y/Z (Motion emits three
   *   sibling <expressionChannels> with targetChannelID 1/2/3 → R/G/B). Colour
   *   Links are decoded by the source path shape (contains `111` = Fill Color)
   *   and the target path shape, NEVER by transition name.
   */
  colorTarget?: {
    kind: 'colorizeRemapBlack' | 'colorizeRemapWhite' | 'shapeFill' | 'gradientTag';
    channel: 'R' | 'G' | 'B';
    /** For 'colorize*' targets, the filter object id (the Affecting Object). Absent
     *  for shapeFill (the affected layer id is `affectedObjectId`). */
    filterId?: number;
    /** For 'gradientTag' targets: the gradient STOP scenenode id being driven (the
     *  `<tagId>` in `.../104/1/<tagId>/3/{1,2,3}`). Matches Shape.fillGradient
     *  stops[].tagId so the evaluator can override exactly that stop's colour.
     *  See docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md. */
    tagId?: number;
  };
  /** Which source channel is read: 'X' | 'Y' | 'Z'. */
  sourceChannel: 'X' | 'Y' | 'Z';
  /** Multiplier applied to the source value. */
  scale: number;
  /** Additive offset applied AFTER scale: linked = source*scale + offset. Comes
   *  from the Link's "X/Y/Z offset" parameter (the offsetChannelRef). Keeps a
   *  clone spatially separated from its driver — e.g. Clothesline's Transition B
   *  carries X offset ≈ +2072 so B starts off-screen right and swings to center
   *  as the shared driver slides left. Default 0. */
  offset: number;
  /** Static Custom Mix (0/1 gate). Overridden by a rig snapshot when present. */
  customMix: number;
  /** Clamp range for the source value. */
  min: number;
  max: number;
  /** Rig widget id controlling Custom Mix (if rig-gated). */
  rigWidgetId?: number;
  /** Per-widget-value Custom Mix snapshots (index = widget value). */
  rigCustomMix?: number[];
  /** Per-widget-value Scale snapshots (index = widget value). Carries the
   *  per-direction sign; overrides the static `scale` when present. */
  rigScale?: number[];
}

/**
 * A Framing behavior (factory 3). Attached to the camera; drives the camera to
 * frame `targetId`'s world bbox over its timing window. Transcribed from
 * OZScene::computeFraming. `framingOffset` shifts the framing point in the
 * target's local frame; `pathOffset`/`apex` add a curved path offset; the
 * transition-time params control the position/rotation cross-blend easing.
 */
export interface FramingBehavior {
  /** Object ID this behavior frames (param Target id 200). */
  targetId: number;
  /** Framing Offset (id 204) X/Y/Z — offset of the framing point (target-local). */
  framingOffset: { x: number; y: number; z: number };
  /** Path Offset (id 207) X/Y/Z — additive curved-path offset. */
  pathOffset: { x: number; y: number; z: number };
  /** Offset Path Apex (id 206) — 0..1 apex position along the offset path. */
  apex: number;
  /** Position/Rotation Transition Time (ids 209/210) — 0..1 blend fraction. */
  positionTransitionTime: number;
  rotationTransitionTime: number;
  /** Ease Out Curve (id 213) — easing exponent/type. */
  easeOutCurve: number;
  /** Transition mode (id 211; =3 for these). */
  transition: number;
  /** Behavior timing window (scene time). */
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };
}

/** Scene-level settings (resolution, duration, frame rate). */
export interface SceneSettings {
  width: number;
  height: number;
  duration: RationalTime;
  frameRate: number;
  /**
   * The transition's animation end time in seconds — the maximum keyframe time
   * across all curves. progress=1 maps here (NOT to the full scene/playRange
   * duration, which can extend a frame past the last keyframe and wrap). If no
   * keyframes exist, falls back to the scene duration.
   */
  animationEndSec?: number;
  /**
   * Smallest drop-zone media box height (the `<clip>` Fixed Height, id 115) across
   * the transition's Transition A/B clips. Motion conforms the drop-zone source to
   * this media box; Movements/Drop In uses it (600 in a 720 scene) to size the
   * top-left card the source is scaled into. Undefined when no drop-zone clip
   * declares a Fixed Height.
   */
  dropZoneMediaHeight?: number;
  /**
   * Motion-blur shutter samples (`<motionBlurSamples>`), 1 = no blur. FCP averages
   * this many sub-frame renders across the shutter interval (`motionBlurDuration`
   * frames) to smear fast-moving content. Used by the Slide-family decorative
   * tiles, whose fast sweep reads as a soft blur in the reference renderer.
   */
  motionBlurSamples?: number;
  /** Shutter length in frames (`<motionBlurDuration>`), default 1. */
  motionBlurDuration?: number;
}

/** The complete parsed transition scene. */



/** Replicator configuration — tiles a cell across a grid/pattern. */
export interface Replicator {
  /** Arrangement type: 0=rectangle grid, 1=line, 2=circle, etc. */
  arrangement: number;
  /** Number of columns in the grid. */
  columns: number;
  /** Number of rows in the grid. */
  rows: number;
  /** Grid size (width, height in pixels). */
  sizeWidth: number;
  sizeHeight: number;
  /** Origin/pattern offset. */
  origin: number;
  /** Sequence Replicator behavior (per-instance staggered param ramp), if present. */
  sequence?: SequenceReplicator;
  /**
   * Motion "Shape" arrangement (Cell "Shape Parameters"/Shape id=302): 0=Rectangle,
   * 1=Circle, 2=Burst, 3=Spiral, 4=Wave, 5=Geometry, 6=Image. This is DISTINCT from
   * the legacy grid `arrangement` field (which reads the "Arrangement" param that
   * these shape-based replicators do not author). When present it drives a
   * point/circle/spiral instance layout with per-cell parameter ramps below.
   */
  shape?: number;
  /** Points around the pattern (Circle/Spiral: instance count). */
  points?: number;
  /** Pattern radius in scene units (Circle/Spiral). */
  radius?: number;
  /**
   * Per-cell ramps "over pattern": each instance i in [0,points) interpolates the
   * cell's Scale (X≈Y) from `scaleStart` → `scaleEnd`, and its extra rotation from
   * 0 → `angleEnd` (radians). Reproduces the nested vertigo spiral (small central
   * ring scaling up to a large outer ring). Undefined ⇒ no ramp (uniform cells).
   */
  scaleStart?: number;
  cellScaleEnd?: number;
  angleEnd?: number;
  /**
   * Uniform per-cell scale MULTIPLIER read from the Replicator Cell scenenode's
   * "Scale" param (id=116, X≈Y — Motion's cell-size control, distinct from the
   * replicator group's own transform scale). Multiplies the cell shape's authored
   * size so the tile fills its grid cell. For a grid replicator whose cell shape
   * extent × cellScale == the grid spacing, the tiles tessellate with NO gaps;
   * dropping this (as the old fid-19-only reader did for fid-18 cells like Squares)
   * rasterizes the cell at its bare extent, leaving orange seams between tiles.
   * Undefined ⇒ 1 (no extra scale).
   */
  cellScale?: number;
  /** Twists (Spiral shape): fractional turns the spiral sweeps across `points`. */
  twists?: number;
}

/**
 * Sequence Replicator behavior — staggers a parameter animation across the
 * replicator's instances as the transition plays. Each instance plays the same
 * per-instance curve (Opacity/Scale/Rotation), but its START is offset by the
 * instance's sequence position, producing a traveling wave across the grid.
 *
 * Params come from the behavior's "Sequence Control" group:
 *   - sequencing (id 1011): ordering/traversal mode
 *   - end        (id 1002): global progress at which the LAST instance begins
 *   - spread     (id 1003): number of instances simultaneously animating (window)
 *   - mapAnimation (id 1006), quadraticEase (id 1013): easing flags
 *
 * The animated targets are the per-instance curves keyframed on the behavior:
 *   - opacityEnd:  Opacity   ramps 0 → opacityEnd  (usually 1)
 *   - scaleEnd:    Scale X/Y ramps 1 → scaleEnd    (Motion scale is a multiplier;
 *                  the curve stores 0→2.5 meaning +250% i.e. multiplier 1→3.5? —
 *                  interpreted below as an additive-to-multiplier ramp)
 *   - rotationEnd: Rotation Z ramps 0 → rotationEnd (radians)
 */
export interface SequenceReplicator {
  sequencing: number;
  end: number;
  spread: number;
  mapAnimation: number;
  quadraticEase: number;
  /** Per-instance animated curve endpoints (start is the replicator base). */
  opacityEnd?: number;
  scaleEnd?: number;
  rotationEnd?: number;
}


/**
 * Motion Emitter parameters (parsed from the Emitter scenenode's Object/id=2 tree).
 *
 * A Motion "Emitter" (factory description "Emitter"; factoryID NOT stable across
 * .motr files — always resolved by the per-file factory table) is the spawn side
 * of a particle simulation: it declares an emission REGION + direction, and any
 * Particle Cell scenenodes nested under it are the particles being spawned. The
 * cell owns the per-particle physics (birth rate, life, velocity, spin, gravity —
 * see ParticleCellParams). Together they describe the drifting bokeh/leaves/flakes
 * that dominate the Stylized/Nature transitions (Diagonal, Glide, Close_and_Open,
 * Up-Over, Center).
 *
 * Field IDs come from Motion's canonical Object folder for an Emitter, verified by
 * XML dump of Movements/Drop_In (fid 19), Movements/Earthquake (fid 19), and
 * Stylized/Diagonal (fid 23) — all three carry the SAME id numbering under Object,
 * confirming these are the plugin-schema ids, not per-file assignments.
 *
 * PARSE-ONLY: T-B1 wires these into MotrScene but does not consume them; T-B2 will
 * run the actual particle sim off this schema.
 */
export interface EmitterParams {
  /** Object ID of the Emitter scenenode (matches Layer.id). */
  id: number;
  /** Human-readable emitter node name. */
  name?: string;
  /**
   * Emission direction center in RADIANS (Object/id 310, "Emission Angle").
   * 0 = +X (right); positive = counter-clockwise. Combined with `emissionRange`
   * gives the spawn direction arc. Diagonal emits at ~5.198 rad ≈ 297.9°.
   */
  emissionAngle: number;
  /**
   * Emission longitude in RADIANS (Object/id 358, "Emission Longitude"). Only
   * meaningful when `is3D` is true (adds a spherical/latitude component to the
   * spawn direction). Default 3π/2 ≈ 4.712 rad.
   */
  emissionLongitude: number;
  /**
   * Emission arc width in RADIANS (Object/id 311, "Emission Range"). 2π ≈ 6.283
   * = omnidirectional; smaller values narrow the cone around `emissionAngle`.
   */
  emissionRange: number;
  /**
   * Emit-at-points flag (Object/id 303). When 1, particles spawn from a discrete
   * point set defined by the Emitter's Shape Parameters (Points/Columns/Rows on
   * a rectangle/circle/spiral arrangement) instead of a continuous region.
   */
  emitAtPoints: boolean;
  /**
   * Emitter random seed (Object/id 349). Motion uses this to seed the emitter's
   * spawn RNG so the same .motr renders identical particle streams across runs.
   */
  emitterSeed: number;
  /**
   * 3D emitter flag (Object/id 356). When 1, particles spawn into an XYZ volume
   * and `emissionLongitude` participates in the direction; when 0 (the default
   * across all built-ins observed), the emitter is 2D — Longitude is ignored.
   */
  is3D: boolean;
  /**
   * Face-camera flag (Object/id 357). When 1 (default), each particle sprite is
   * billboarded to face the camera; when 0, the sprite orientation is fixed in
   * world space.
   */
  faceCamera: boolean;
  /**
   * Optional spawn-region radius in scene units (Object/id 307 under Shape
   * Parameters). Used by circle/spiral/burst arrangements to size the emission
   * region. Absent when the emitter uses a point/line arrangement.
   */
  radius?: number;
}

/**
 * Motion Particle Cell parameters (parsed from the Particle Cell scenenode's
 * Object/id=2 tree — and its Gravity behavior child).
 *
 * A Particle Cell is the PER-PARTICLE physics + appearance spec. Motion nests one
 * or more Particle Cell scenenodes under an Emitter (see EmitterParams). Each cell
 * declares:
 *   • birth rate & life (how often, how long each particle lives),
 *   • initial velocity magnitude (`speed`) + directional randomness,
 *   • initial spin rate (rotational velocity, radians/sec),
 *   • a "Particle Source" object id that names the sprite/shape the emitter draws
 *     at each particle position,
 *   • an optional Gravity behavior child that adds a constant downward acceleration
 *     (folded into T-B1 after T-A3 census proved every built-in Gravity sits on a
 *     Particle Cell, never a layer — see ROADMAP S1/T-A3 census note).
 *
 * Field IDs come from Motion's canonical Object folder for a Particle Cell, verified
 * against Movements/Drop_In (cell fid 14, "Blur 11"), Movements/Earthquake (fid 14),
 * and Stylized/Diagonal (fid 15, "hexagon") — same numbering across all three.
 *
 * PARSE-ONLY: T-B1 wires these into MotrScene but does not consume them; T-B2 will
 * run the deterministic per-particle spawn/advect/fade loop off this schema.
 */
export interface ParticleCellParams {
  /** Object ID of the Cell scenenode (matches Layer.id). */
  id: number;
  /** Cell node name (Motion often names cells after their source shape, e.g. "hexagon"). */
  name?: string;
  /** Object ID of the enclosing Emitter (undefined when the cell is orphaned). */
  emitterId?: number;
  /**
   * Particles per second (Object/id 101, "Birth Rate"). Static or animated —
   * Stylized/Glide/Diagonal are static, Drop_In cells are 0 (spawn triggered by
   * `initialNumber`), Earthquake is 0 (single-burst emitter). Motion default 30.
   */
  birthRate: number | Curve;
  /** Birth rate ± Randomness (Object/id 102). Motion default 0. */
  birthRateRandomness: number;
  /**
   * Initial number of particles emitted AT birth-time (Object/id 103, "Initial
   * Number"). Non-zero cells fire a one-shot burst at the emitter's `in` time —
   * this is how Drop_In's impact cells spawn their card-strike particle puff.
   */
  initialNumber: number | Curve;
  /**
   * Particle lifetime in SECONDS (Object/id 104, "Life"). Static or animated;
   * Earthquake's cell is 0.4s, Diagonal's is 10s. Motion default 5.
   */
  life: number | Curve;
  /** Life ± Randomness in seconds (Object/id 105). Motion default 0. */
  lifeRandomness: number;
  /**
   * Initial velocity magnitude (Object/id 106, "Speed"), in scene units/sec. The
   * direction comes from the enclosing Emitter's `emissionAngle` ± `emissionRange`.
   * Diagonal cells fly at 350 units/sec; Drop_In impact cells at 2409. Default 100.
   */
  speed: number | Curve;
  /** Speed ± Randomness (Object/id 107). Motion default 0. */
  speedRandomness: number;
  /**
   * Initial spin rate in RADIANS/sec (Object/id 110, "Spin"). Diagonal cells
   * spin at 0.873 rad/s ≈ 50°/s (creates the rotating hexagons/leaves).
   * Motion default 0.
   */
  spin: number | Curve;
  /** Spin ± Randomness (Object/id 111). Motion default 0. */
  spinRandomness: number;
  /**
   * Object ID of the drawable Motion uses as the particle sprite (Object/id 128,
   * "Particle Source"). References another scenenode (a Shape, an Image, a Group)
   * in the same .motr — e.g. Diagonal's hexagon cell points to id 971894859
   * (its "hexagon" shape). Undefined when the cell renders a built-in point
   * primitive instead of an object.
   */
  particleSourceId?: number;
  /**
   * Cell random seed (Object/id 131, "Random Seed"). Seeds the per-particle RNG
   * so identical .motr replays produce identical particle streams.
   */
  randomSeed: number;
  /**
   * Gravity behavior on this cell (constant downward acceleration), if present.
   * Every built-in Gravity in the corpus sits on a Particle Cell (T-A3 census,
   * ROADMAP 2026-07-13). Absent on the majority of cells (they float / drift
   * without gravity).
   */
  gravity?: GravityBehavior;
  /**
   * The Cell's own `<timing in out offset>` element. Motion uses this to define
   * WHEN the cell actively spawns on the parent timeline (Drop_In's impact cells
   * spawn only during a narrow window around the card-strike moment). Distinct
   * from per-particle `life` (which is how long a spawned particle lives).
   */
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };

  // ── Particle APPEARANCE (ROADMAP S3 / T-B3) ────────────────────────────────
  // Decoded from a real airborne cell (Wipes/Diagonal "Ring 4 copy"): the sim
  // must draw each particle at the cell's real SIZE and COLOUR, not a fixed 2px
  // near-white dot. These are parsed here (gate-neutral until the sim reads them)
  // so the T-B3 sim wiring is a pure consumer change.
  /**
   * Colour Mode (Object/id 129). 0 = "Original" (use the source object's own
   * colour / image), 1 = "Colorize" (tint every particle by the cell `color`),
   * 2 = "Over Life", 3 = "Pick from Range". The built-in airborne cells
   * (Diagonal/Glide/Up-Over hexagons/leaves) use mode 1 with a solid colour.
   */
  colorMode?: number;
  /**
   * Cell tint colour (Object/id 130 → children Red 1 / Green 2 / Blue 3), 0-1
   * float RGB. Used when colorMode routes to a solid tint. undefined = no colour
   * folder (fall back to the source object's colour).
   */
  color?: { r: number; g: number; b: number };
  /** Particle opacity (Object/id 130 → Opacity 4), 0-1. Motion default 1. */
  opacity?: number;
  /**
   * Cell Scale (Object/id 116 → X 1 / Y 2) as a FRACTION of the source object's
   * native size (1 = 100%). Motion default 1. The on-screen particle size =
   * sourceSize · scale · (1 ± scaleRandomness·rand).
   */
  scaleX?: number;
  scaleY?: number;
  /** Scale ± Randomness (Object/id 117 → X/Y), fraction. Motion default 0. */
  scaleRandomness?: number;
  /**
   * Show Particles As (Object/id 100): 3 = render the source OBJECT (a shape/
   * image sprite — the common case), other values select a built-in point
   * primitive. The sim uses this to decide sprite-size vs point-size.
   */
  showParticlesAs?: number;
  /** Point Size (Object/id 127) — the point-primitive radius when NOT showing an
   *  object source. Motion default 2. */
  pointSize?: number;
}

/**
 * A Gravity behavior on a Particle Cell — constant downward acceleration.
 *
 * Motion authors this as a `<behavior>` whose factory description resolves to
 * "Gravity" (factoryID NOT stable across .motr files). Its `Acceleration` (id 401)
 * child is either a static value (default 30) or a Curve (Movements/Earthquake
 * animates Acceleration through 0→-100→-200→0 across the shake). Value units are
 * scene units/sec² downward (positive = +Y = down in Motion's coordinate frame).
 *
 * ROADMAP T-A3 census 2026-07-13 verified every built-in Gravity attaches to a
 * Particle Cell, NEVER a layer — so gravity is definitionally a particle-sim
 * parameter and lives here (folded into T-B1 per ROADMAP S1/T-A3 note).
 */
export interface GravityBehavior {
  /** Downward acceleration (scene units/sec²), static or animated. */
  acceleration: number | Curve;
  /**
   * Whether the behavior propagates to nested sub-emitters (id 300, "Affect
   * Subobjects"). Motion default 0 (only this cell's particles feel it).
   */
  affectSubobjects: boolean;
  /** Behavior timing window (usually inherits the parent cell's). */
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };
}

/** An animation behavior attached to a layer (Fade, Ramp, Oscillate, Spin, Motion Path). */
export interface LayerBehavior {
  type: 'fade' | 'ramp' | 'oscillate' | 'spin' | 'motionPath' | 'other';
  /** Behavior parameters (name → value). */
  params: Record<string, number>;
  /** For Ramp: the target parameter name it animates. */
  targetParam?: string;
  /**
   * The behavior's own `<timing in out offset>` element. This — NOT generic
   * Start/End Offset params — defines the window over which a Fade behavior
   * ramps opacity. `in`/`out` are scene times (RationalTime). Fade In/Out Time
   * params are frame counts anchored to this window.
   */
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };
  /**
   * FactoryID of the underlying behavior scenenode (e.g. 24 = Motion Path).
   * Set when structural decoding needs to route on factoryID even for behaviors
   * that fall into the generic 'other' bucket (whose `type` doesn't yet encode
   * the specifics). Optional — pre-Motion-Path behaviors don't carry this.
   */
  factoryID?: number;
  /**
   * Motion Path payload (factoryID=24). Present only when `type='motionPath'`.
   * Decoded from the built-in Motion "Motion Path" behavior — a shared behavior
   * primitive that animates an object's position along a path over the
   * behavior's own timing window. Fires on 16 built-ins (per fct census, e.g.
   * Slide_In, Center_Reveal, Heart, Lower, Loop, Wipes/Mask, 360°/Push/Slide).
   *
   * Motion authors the path as a small parameter tree. Field mapping to the
   * .motr:
   *   - `basePosition`: `Position(id=200)` — the base position CURVE (X/Y/Z),
   *     often the traveled-distance-along-path when Shape Source != 0, or a
   *     plain animated position when the behavior is a straight-line
   *     translate.
   *   - `pathControlPoints`: `Position(id=206)` — the CUSTOM PATH keypoints
   *     (closed=1 loops back to first). Each channel (X/Y/Z) is a keyframed
   *     Curve with Bezier tangents; use these vertices as the control polygon
   *     that defines the spatial path when `attachToShape=1` and
   *     `shapeSource=0`.
   *   - `startPoint` / `endPoint`: `Point(id=214)` / `Point(id=215)` — the
   *     STRAIGHT-LINE endpoints (used when `shapeSource=0` and the path
   *     degenerates to a line).
   *   - Sinusoidal modulation: `amplitude(id=216)`, `frequency(id=217)`,
   *     `phase(id=218)`, `damping(id=221)` — a perpendicular sine wave
   *     superimposed on the base path (Amplitude=0 → straight path).
   *   - Path selection: `shapeSource(id=210)` (0 = built-in / straight line,
   *     nonzero = external Shape object), `offset(id=211)` (starting position
   *     along path 0..1), `attachToShape(id=220)` (1 = follow the shape's
   *     tangent orientation), `direction(id=219)`, `customSpeed(id=204)`,
   *     `applySpeed(id=209)`, `loops(id=208)`, `endCondition(id=222)`.
   *
   * The evaluator applies the Motion Path as an ADDITIVE position offset to
   * the host layer's transform (like Fade/Ramp/Spin do for their target
   * parameter). Gate-neutral until the evaluator subsystem is wired up.
   */
  motionPath?: MotionPathPayload;
}

/**
 * Motion "Motion Path" behavior payload — the structural parameter tree of a
 * factoryID=24 behavior child. Decoded from Slide In.motr (line 548) and
 * cross-checked against Motion's built-in Motion Path behavior schema.
 *
 * Parser reads and types it; evaluator TBD (T-qcf704c6b Stage 2 continuation).
 */
export interface MotionPathPayload {
  /** Base position curve (id=200). X/Y/Z are keyframed curves. */
  basePosition: { x: Curve; y: Curve; z: Curve };
  /** Custom path control points (id=206). Closed=1 loops. */
  pathControlPoints: { x: Curve; y: Curve; z: Curve; closed: boolean };
  /** Straight-line START endpoint (id=214). */
  startPoint: { x: Curve; y: Curve };
  /** Straight-line END endpoint (id=215). */
  endPoint: { x: number; y: number };
  /** Sinusoidal amplitude (id=216) perpendicular to path. 0 = straight. */
  amplitude: number;
  /** Sine frequency (id=217). */
  frequency: number;
  /** Sine phase (id=218). */
  phase: number;
  /** Sine damping (id=221). */
  damping: number;
  /**
   * Path type / source (id=210). 0 = built-in (line via startPoint/endPoint or
   * pathControlPoints). Nonzero = external Shape object reference.
   */
  shapeSource: number;
  /** Starting position along path (id=211, 0..1). */
  offset: number;
  /**
   * Attach To Shape (id=220). 1 = orient tangent to path; 0 = position only.
   */
  attachToShape: number;
  /** Direction (id=219): 0 = forward, 1 = reverse. */
  direction: number;
  /** Custom Speed (id=204). */
  customSpeed: number;
  /** Apply Speed (id=209). 0 = use default speed, 1 = use Custom Speed. */
  applySpeed: number;
  /** Loop count (id=208). */
  loops: number;
  /** End Condition (id=222): 0 = stop, 1 = wrap, etc. */
  endCondition: number;
}

/** A vector shape (polygon mask or filled shape). */
export interface Shape {
  /** Vertex X coordinates (centered coordinate space), ordered by vertex index. */
  verticesX: number[];
  /** Vertex Y coordinates (centered coordinate space), ordered by vertex index. */
  verticesY: number[];
  /**
   * Bezier control-handle tangents, one entry per vertex (relative offsets from
   * the vertex position, in the same centered coordinate space). Undefined when a
   * vertex is a plain corner point (no handle). Motion stores the outgoing handle
   * (toward the next vertex) as "Output Tangent" (id=5) and the incoming handle
   * (from the previous vertex) as "Input Tangent" (id=4).
   */
  inTangentX?: (number | undefined)[];
  inTangentY?: (number | undefined)[];
  outTangentX?: (number | undefined)[];
  outTangentY?: (number | undefined)[];
  /** True if any vertex carries a bezier control handle (curved path). */
  hasTangents?: boolean;
  /** Whether the path is closed. */
  closed: boolean;
  /** Whether this shape is used as a mask (vs a filled shape). */
  isMask: boolean;
  /**
   * Mask edge FEATHER width in shape-local units (Motion "Feather" id, 0 = hard
   * edge). Motion soft-blurs the mask alpha outward+inward by this radius, which
   * for a large value (e.g. Wipes/Diagonal's "Animated mask" = 300) makes the
   * reveal edge a wide soft gradient rather than a crisp cut. The compositor
   * converts this shape-local radius into output pixels (using the same
   * centered-coord→pixel scale the vertices use) and blurs the rasterized alpha.
   * Undefined/0 = no feather (existing hard-edged behaviour, byte-identical).
   */
  feather?: number;
  /**
   * Shape ASPECT RATIO (Motion's `<aspectRatio>` element — a DIRECT child of the
   * shape/mask scenenode, sibling of the shape params — NOT the "Aspect Ratio"
   * id=153 parameter, which has NO rendering effect). Motion multiplies every
   * vertex's local X coordinate by this value BEFORE the shape's own
   * scale/rotation/position transform, i.e. it stretches the shape horizontally
   * in shape-local space. Decoded from a clean ±100 square probe through REAL
   * FCP-headless: aspectRatio=1.5 renders a 200-unit square as 301×203 px (X×1.5,
   * Y unchanged); linear across {0.5,1,1.5,2,3}; applied PRE-rotation (a 300×200
   * rect rotated 45° yields a 355×355 bbox = (300+200)/√2, matching FCP exactly).
   * The engine previously ignored it → rendered a plain 199×199 square → the
   * Wipes/Diagonal write-on union capped at ~71% coverage instead of 100%.
   * 1 / undefined = no stretch (byte-identical to origin/main).
   */
  aspectRatio?: number;
  /**
   * Solid fill color for a NON-mask filled shape (0-255 RGB, 0-1 alpha), read
   * from the shape's "Fill Color" (id=111) Red/Green/Blue params. Undefined when
   * the shape has no solid fill (e.g. gradient-only) or is a mask. Used by
   * Lights/Flash's full-frame white flash rectangles.
   */
  fillColor?: { r: number; g: number; b: number; a: number };
  /**
   * Shape-fill GRADIENT stop list (Fill Mode = gradient), read from the shape's
   * Style → Fill → "Gradient" (id=104) → "RGB" tags folder (id=1). Each stop is a
   * scenenode ("RGB1"/"RGB2"/…) with an id (the `tagId` a colour-Link targets via
   * `.../104/1/<tagId>/3/{1,2,3}`), a `location` (0..1 along the ramp) and a
   * `color` (0..1 float RGB, from Color(id=3) Red/Green/Blue). Distinct from the
   * generator's `GaussianGradientConfig` (that is a RADIAL center/radius gradient;
   * this is a SHAPE-fill STOP LIST). Undefined for solid-fill or mask shapes.
   * See docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md. Currently parsed for future
   * gradient-fill rendering + colour-Link stop overrides (S1/T-A1).
   */
  fillGradient?: {
    /** Stops in authored order; `tagId` is the stop scenenode id (per-file, not stable). */
    stops: { tagId: number; location: number; color: { r: number; g: number; b: number } }[];
  };
  /**
   * True when this shape is an OFFSET-AUTHORED sweeping panel — the Stylized/
   * Panels signature: a non-mask solid-fill rectangle whose timing `offset` is
   * re-anchored well past its `in` point AND whose Position curve is keyed at
   * NEGATIVE (local-frame) times. This marker is set by the parser at the layer
   * level (where both the shape fill and the transform curves are available) and
   * is the SOLE gate for the compositor's panel-paint path. It is kept STRICTLY
   * SEPARATE from `fillColor` so gradient-rendered shapes (Heart, Center Reveal,
   * Wipes/Diagonal) — which are Fill Mode 0 but must render their gradient, not a
   * flat color — are never painted as solid panels.
   */
  isSolidPanel?: boolean;
  /**
   * Solid fill color (0-255 RGB, 0-1 alpha) for an `isSolidPanel` shape, read
   * permissively from the "Fill Color" (id=111) Red/Green/Blue params regardless
   * of the solid-fill flag bit (the panels leave that bit clear). Populated ONLY
   * when `isSolidPanel` is true; distinct from `fillColor`.
   */
  panelFill?: { r: number; g: number; b: number; a: number };
  /** Fill opacity (0-1) for an `isSolidPanel` shape. Defaults to 1. */
  panelFillOpacity?: number;

  /**
   * Stroke ("Outline") geometry for a STROKED shape — a thick band drawn ALONG
   * the path rather than filling its interior. This is the Objects/Arrows
   * mechanism: each C-shape is a CLOSED circle bezier whose visible geometry is a
   * heavy stroke (Width 145–470 px in shape-local units) with arrow end-caps and
   * an animated arc TRIM (First/Last Point Offset). When `stroke` is present the
   * shape rasterizer draws the trimmed, capped stroke band instead of filling the
   * polygon. Populated only for non-mask shapes that carry an Outline (id=108)
   * with a positive Width; undefined for ordinary fill/mask shapes so every other
   * transition keeps the existing fill-polygon path.
   */
  stroke?: {
    /** Outline Width (id=105) in shape-local units (before the layer transform). */
    width: number;
    /** Start Cap style (id=119): 3/4 = arrowhead variants, other = flat/round. */
    startCap: number;
    /** End Cap style (id=134): 3/4 = arrowhead variants. */
    endCap: number;
    /** Arrow Length (id=132) — arrowhead length as a multiple of the stroke width. */
    arrowLength: number;
    /** Arrow Width (id=133) — arrowhead half-width as a multiple of the stroke width. */
    arrowWidth: number;
    /**
     * First Point Offset (id=126): fraction [0..1] along the path where the
     * visible stroke STARTS. Static number or an animated curve (evaluated at the
     * scene time in the compositor).
     */
    firstPointOffset: number | Curve;
    /**
     * Last Point Offset (id=127): fraction [0..1] along the path where the visible
     * stroke ENDS. Animating this from ~0.38→1.0 grows the arrow arc around the
     * circle — the Arrows sweep. Static number or an animated curve.
     */
    lastPointOffset: number | Curve;
  };

}


/** A scene-level behavior that affects an object by ID (Ramp, Oscillate with target). */
export interface SceneBehavior {
  type: 'ramp' | 'oscillate' | 'spin' | 'other';
  affectedObjectId: number;
  params: Record<string, number>;
  /**
   * The `<channelBehavior affectingChannel="...">` path this behavior drives,
   * e.g. "./1/100/109/2" (Transform → Rotation → Y), "./203" (a rig End Value),
   * or "./1" (a filter parameter id, e.g. Zoom Blur's "Amount"). Undefined when
   * the behavior has no channelBehavior child.
   */
  affectingChannel?: string;
  /** Resolved transform channel this behavior targets, if the path maps to one. */
  targetChannel?: RampTargetChannel;
  /**
   * The behavior's own `<timing in out offset>` window (scene time, RationalTime).
   * Oscillate/Ramp only animate within [in, out]. For Ramp, progress `t` runs over
   * [in, out] of THIS window, independent of the layer's Retime curve;
   * `startFrameOffset`/`endFrameOffset` (Start/End Frame Offset channels, default 0)
   * nudge the window in frames. Convert with `timeToSeconds()` before use.
   * Undefined ⇒ always active.
   */
  timing?: { in: RationalTime; out: RationalTime; offset: RationalTime };
}

/** Which transform channel a Ramp behavior drives (resolved from affectingChannel). */
export type RampTargetChannel =
  | 'rotationX' | 'rotationY' | 'rotationZ'
  | 'positionX' | 'positionY' | 'positionZ'
  | 'scaleX' | 'scaleY' | 'scaleZ'
  | 'opacity';

/** A rig widget (popup/checkbox/slider that controls transition variants). */
export interface RigWidget {
  id: number;
  name: string;
  /** Current selected value (which snapshot to use). */
  value: number;
  /**
   * The scenenode factoryID of the Widget node. Direction widgets come in two
   * flavours: factoryID 13 (Push/Reflection) and factoryID 12 (Scale/Flip/Switch).
   * The evaluator's degenerate-direction advancement (adjustDegenerateDirection)
   * is scoped to factoryID-12 Direction widgets so it cannot affect Push et al.
   */
  factoryID?: number;
}

/** A rig behavior: maps a widget value to a set of parameter snapshots for a target object. */
export interface RigBehavior {
  /** ID of the object this behavior affects. */
  affectedObjectId: number;
  /** ID of the controlling widget. */
  widgetId: number;
  /** The parameter type this controls (e.g., "Position", "Scale", "Opacity"). */
  paramType: string;
  /** Snapshots: one parameter set per widget value. snapshots[widgetValue] is active. */
  snapshots: Parameter[];
  /**
   * Snapshot ids in the SAME order as `snapshots` (document order). A continuous
   * Widget (e.g. Aspect Ratio) resolves to a snapshot *id* − 1, but snapshots are
   * stored in document order which is NOT id order (e.g. 5,4,2,1,3,7). Selecting
   * by array position then picks the wrong snapshot. Keep ids so the evaluator can
   * match the active snapshot by id and only fall back to positional indexing.
   */
  snapshotIds: number[];
}

export interface MotrScene {
  settings: SceneSettings;
  layers: Layer[];
  factories: Map<number, string>;
  rigWidgets: RigWidget[];
  rigBehaviors: RigBehavior[];
  sceneBehaviors: SceneBehavior[];
  /**
   * Object ID → static Fill Color RGB (0-1) read from ANY scenenode that carries a
   * Fill Color (id=111) param, INCLUDING nodes marked `<enabled>0</enabled>` and
   * nodes whose solid-fill flag bit is clear. Populated by scanning the raw XML so
   * hidden "colour driver" shapes (the source of a colour-channel Link) are always
   * available: Panels_Across's "Color linker" (enabled=0) has fill (0.737,0.070,
   * 0.141) that Motion pipes via `Link remap black/white` into each Colorize
   * filter's Remap folder; Slide_In/Loop/Heart have similar hidden source shapes.
   * A colour Link's `sourceChannelRef` `./2/353/113/111/{1,2,3}` reads these RGB.
   * See parser/index.ts (buildLinkColorSources).
   */
  linkColorSources?: Map<number, { r: number; g: number; b: number }>;
  /**
   * Flat index of every parsed EmitterParams in the scene, keyed by Emitter
   * scenenode id (matches Layer.id). Populated by the T-B1 parser as a walk-free
   * lookup for downstream code (T-B2 particle sim, no-hardcode detector) that
   * doesn't want to re-descend the layer tree to enumerate emitters. Absent when
   * the scene has zero Emitter nodes.
   */
  emitters?: Map<number, EmitterParams>;
  /**
   * Flat index of every parsed ParticleCellParams in the scene, keyed by Cell
   * scenenode id. Populated by the T-B1 parser (see `emitters` above). Absent
   * when the scene has zero Particle Cell nodes.
   */
  particleCells?: Map<number, ParticleCellParams>;
}
