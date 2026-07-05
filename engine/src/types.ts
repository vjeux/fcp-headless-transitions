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
  opacity?: Curve | number;
  cropLeft?: Curve | number;
  cropRight?: Curve | number;
  cropTop?: Curve | number;
  cropBottom?: Curve | number;
}

/** Blend mode for layer compositing. */
export type BlendMode = 'normal' | 'add' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'difference' | 'exclusion';

/** A filter/effect applied to a layer. */
export interface Filter {
  id: number;
  pluginName: string;
  pluginUUID: string;
  parameters: Parameter[];
  enabled?: Curve | boolean;
}

/** Source of an image layer (transition input A or B, or a generator). */
export type ImageSource =
  | { type: 'transitionA' }
  | { type: 'transitionB' }
  | { type: 'generator'; name: string; parameters: Parameter[] }
  | { type: 'color'; r: number; g: number; b: number; a: number };

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
   * Link behaviors attached to this layer. A Link makes one of this layer's
   * transform channels track a source object's channel (× scale, gated by a
   * rig-driven Custom Mix, clamped to [min,max]).
   */
  links?: LinkBehavior[];
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
  /** Which source channel is read: 'X' | 'Y' | 'Z'. */
  sourceChannel: 'X' | 'Y' | 'Z';
  /** Multiplier applied to the source value. */
  scale: number;
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
}


/** An animation behavior attached to a layer (Fade, Ramp, Oscillate, Spin). */
export interface LayerBehavior {
  type: 'fade' | 'ramp' | 'oscillate' | 'spin' | 'other';
  /** Behavior parameters (name → value). */
  params: Record<string, number>;
  /** For Ramp: the target parameter name it animates. */
  targetParam?: string;
}

/** A vector shape (polygon mask or filled shape). */
export interface Shape {
  /** Vertex X coordinates (centered coordinate space). */
  verticesX: number[];
  /** Vertex Y coordinates (centered coordinate space). */
  verticesY: number[];
  /** Whether the path is closed. */
  closed: boolean;
  /** Whether this shape is used as a mask (vs a filled shape). */
  isMask: boolean;
}


/** A scene-level behavior that affects an object by ID (Ramp, Oscillate with target). */
export interface SceneBehavior {
  type: 'ramp' | 'oscillate' | 'spin' | 'other';
  affectedObjectId: number;
  params: Record<string, number>;
}

/** A rig widget (popup/checkbox/slider that controls transition variants). */
export interface RigWidget {
  id: number;
  name: string;
  /** Current selected value (which snapshot to use). */
  value: number;
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
}

export interface MotrScene {
  settings: SceneSettings;
  layers: Layer[];
  factories: Map<number, string>;
  rigWidgets: RigWidget[];
  rigBehaviors: RigBehavior[];
  sceneBehaviors: SceneBehavior[];
}
