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
}

/** Source of an image layer (transition input A or B, or a generator). */
export type ImageSource =
  | { type: 'transitionA' }
  | { type: 'transitionB' }
  | { type: 'media'; url: string; frameRate?: number }
  | { type: 'generator'; name: string; parameters: Parameter[] }
  | { type: 'gaussianGradient'; gradient: GaussianGradientConfig }
  | { type: 'color'; r: number; g: number; b: number; a: number };

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
    kind: 'colorizeRemapBlack' | 'colorizeRemapWhite' | 'shapeFill';
    channel: 'R' | 'G' | 'B';
    /** For 'colorize*' targets, the filter object id (the Affecting Object). Absent
     *  for shapeFill (the affected layer id is `affectedObjectId`). */
    filterId?: number;
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


/** An animation behavior attached to a layer (Fade, Ramp, Oscillate, Spin). */
export interface LayerBehavior {
  type: 'fade' | 'ramp' | 'oscillate' | 'spin' | 'other';
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
   * Solid fill color for a NON-mask filled shape (0-255 RGB, 0-1 alpha), read
   * from the shape's "Fill Color" (id=111) Red/Green/Blue params. Undefined when
   * the shape has no solid fill (e.g. gradient-only) or is a mask. Used by
   * Lights/Flash's full-frame white flash rectangles.
   */
  fillColor?: { r: number; g: number; b: number; a: number };
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
}
