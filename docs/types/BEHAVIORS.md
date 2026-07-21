# Motion Behaviors — corpus reference

Behaviors are Apple Motion's procedural animation system: instead of keyframing a parameter, a behavior *computes* its value every frame from a few controls. In the scene graph they are `<behavior>` / `<parameterBehavior>` nodes attached to an object or a specific parameter channel. This engine evaluates them in `engine/src/evaluator/` (`links.ts`, `ramp.ts`, `motion-curve.ts`, `behaviors/`).

All **34** behavior types observed across the **5,365-file** corpus are documented below, ordered by usage (files). Counts are empirical. Two families:

- **Parameter behaviors** drive a single parameter/channel (Link, Ramp, Oscillate, Clamp…).
- **Motion behaviors** drive an object's transform, including physics simulations (Throw, Gravity, Spring, Repel…).

> Every behavior carries **`Affecting Object (Hidden)`** — the internal target reference, not a user control — plus, on object behaviors, style passthrough params (`Format`, `Face`, `Glow`, `Drop Shadow`, `Controls`…). These are omitted from the tables below.

## Index

| Behavior | Family | Files | Instances |
|---|---|---|---|
| [Link](#link) | Parameter | 3495 | 50480 |
| [Rig Behavior](#rig-behavior) | Parameter | 3240 | 45242 |
| [Clamp](#clamp) | Parameter | 1640 | 6594 |
| [Custom](#custom) | Parameter | 824 | 2032 |
| [Sequence Text](#sequence-text) | Parameter | 400 | 1563 |
| [Ramp](#ramp) | Parameter | 327 | 1873 |
| [Sequence](#sequence) | Parameter | 312 | 993 |
| [Rate](#rate) | Parameter | 310 | 711 |
| [Fade In/Fade Out](#fade-infade-out) | Parameter | 280 | 729 |
| [Oscillate](#oscillate) | Parameter | 194 | 788 |
| [Align To](#align-to) | Motion | 191 | 907 |
| [Randomize](#randomize) | Parameter | 188 | 496 |
| [Track](#track) | Motion | 146 | 606 |
| [Wriggle](#wriggle) | Parameter | 144 | 362 |
| [Negate](#negate) | Parameter | 83 | 120 |
| [Overshoot](#overshoot) | Parameter | 69 | 145 |
| [Motion Path](#motion-path) | Motion | 59 | 181 |
| [Gravity](#gravity) | Motion (simulation) | 40 | 148 |
| [Random Motion](#random-motion) | Motion (simulation) | 34 | 57 |
| [Drag](#drag) | Motion (simulation) | 29 | 109 |
| [Spin](#spin) | Motion | 21 | 69 |
| [Throw](#throw) | Motion (simulation) | 21 | 54 |
| [Grow/Shrink](#growshrink) | Motion | 20 | 51 |
| [Spring](#spring) | Motion (simulation) | 18 | 90 |
| [Type On](#type-on) | Parameter | 14 | 16 |
| [Repel](#repel) | Motion (simulation) | 9 | 20 |
| [Point](#point) | Parameter | 7 | 38 |
| [Edge Collision](#edge-collision) | Motion (simulation) | 5 | 11 |
| [Rotational Drag](#rotational-drag) | Motion (simulation) | 3 | 14 |
| [Snap Alignment](#snap-alignment) | Motion | 3 | 13 |
| [Stop](#stop) | Parameter | 2 | 9 |
| [Orbit Around](#orbit-around) | Motion (simulation) | 2 | 3 |
| [Reverse](#reverse) | Parameter | 1 | 1 |
| [Attractor](#attractor) | Motion (simulation) | 1 | 1 |

---

## Link

*Parameter behavior · 3495 files · 50480 instances*

Reads a **Source Object**'s value each frame and drives the target parameter from it, with optional linear remap (min/max) and Scale. The backbone of Motion rigs: one master control fanned out to many parameters. Channel-suffixed instances (Link PX/SY/RZ) drive individual position/scale/rotation axes.

| Parameter | What it controls |
|---|---|
| Source Object | The object/parameter whose value is read. |
| Mix Time Range | How the source is sampled in time relative to the target. |
| Clamp Source Value Within Range | Clamp the source to [min,max] before remapping. |
| X min | Input-range low end of the source value… |
| X max | …input-range high end, mapped linearly to the output range. |
| Scale | Multiplier applied to the source value before it drives the target (default 1). |
| Y min | Output-range low end. |
| Y max | Output-range high end. |
| Source Frame Mode | Sample the source at a fixed frame instead of the current time. |
| Source Frame | The fixed frame to sample when Source Frame Mode is on. |

Other observed parameters (not individually described): `Red min`, `Red max`, `Green min`, `Green max`, `Blue min`, `Blue max`, `Y offset`, `X offset`, `Source Attribute`, `Custom Mix`, `Width min`, `Width max`, `Z min`.

## Rig Behavior

*Parameter behavior · 3240 files · 45242 instances*

Backs a **Rig**'s published Widget (slider/popup/checkbox): stores parameter **Snapshots** and interpolates the rigged params between them as the Widget value moves. A popup snaps between discrete snapshots; a slider blends continuously.

| Parameter | What it controls |
|---|---|
| Widget | The published control whose value selects/blends snapshots. |
| Snapshots | The stored parameter states interpolated between. |

## Clamp

*Parameter behavior · 1640 files · 6594 instances*

Constrains the parameter it is attached to within a range every frame.

| Parameter | What it controls |
|---|---|
| Max | Upper bound. |
| Min | Lower bound. |
| Clamp At | Clamp the low end, high end, or both. |

Other observed parameters (not individually described): `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `Max min`, `Max max`, `Min min`, `Min max`, `Apply Mode`, `Scale`, `Y min`, `Y max`, `X min`, `X max`, `Y offset`, `X offset`.

## Custom

*Parameter behavior · 824 files · 2032 instances*

A generic container holding a hand-authored curve/expression for the parameter — bespoke animation that is not one of the named behaviors.

Other observed parameters (not individually described): `Opacity`, `Position`, `Scale`, `Position.Y`, `Position.X`, `Rotation`, `Scale.X`, `Rotation.X`, `Rotation.Z`, `Rotation.Y`, `Mix`, `Position.Z`, `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`.

## Sequence Text

*Parameter behavior · 400 files · 1563 instances*

Animates a repeating transform (position/scale/opacity/color/…) across the units of a Text object, offset in time per unit — the basis of type-on and cascading text animations.

| Parameter | What it controls |
|---|---|
| Sequence Control | How the animation spreads across characters/words/lines. |

Other observed parameters (not individually described): `3D`, `Old Steel`, `Dark Gold`, `Blue Plastic`, `Cardboard`.

## Ramp

*Parameter behavior · 327 files · 1873 instances*

A self-contained tween: drives the parameter from **Start Value** to **End Value** over the behavior's active range, shaped by **Curvature**.

| Parameter | What it controls |
|---|---|
| Curvature | Ease shape (0 = linear, higher = more ease). |
| End Value | Value at the end. |
| Start Value | Value at the start of the ramp. |
| End Offset | Trim frames off the end of the active range. |
| Start Offset | Trim frames off the start of the active range. |

Other observed parameters (not individually described): `Source Object`, `Mix Time Range`, `Custom Mix`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`, `Z max`, `Animate min`, `Animate max`.

## Sequence

*Parameter behavior · 312 files · 993 instances*

The general sequence behavior — spreads an animated transform across an object's sub-elements (replicator cells, text units) with staggered timing.

| Parameter | What it controls |
|---|---|
| Sequence Control | Spread mode across sub-elements. |
| Scale | Per-element scale. |
| Opacity | Per-element opacity. |
| Position | Per-element position. |
| Rotation | Per-element rotation. |

Other observed parameters (not individually described): `Color`, `Redwood`, `Width`.

## Rate

*Parameter behavior · 310 files · 711 instances*

Adds a steady per-frame increment to the parameter — constant-velocity drive (e.g. continuous rotation or scroll).

| Parameter | What it controls |
|---|---|
| Rate | Amount added per unit time. |
| Curvature | Optional ease on the rate ramp. |
| End Offset | Trim frames off the end of the active range. |

## Fade In/Fade Out

*Parameter behavior · 280 files · 729 instances*

An opacity envelope: fades the object in over Fade In Time at the start and out over Fade Out Time at the end.

| Parameter | What it controls |
|---|---|
| Fade Out Time | Duration of the closing fade. |
| Fade In Time | Duration of the opening fade (frames). |
| End Offset | Advance the fade-out. |
| Start Offset | Delay the fade-in. |

## Oscillate

*Parameter behavior · 194 files · 788 instances*

Adds a periodic oscillation (sine/triangle/square/sawtooth) to the parameter.

| Parameter | What it controls |
|---|---|
| Amplitude | Peak deviation from the base value. |
| Speed | Oscillations per unit time. |
| Phase | Starting offset of the wave. |
| Wave Shape | Sine / triangle / square / sawtooth. |
| Start Offset | Trim start frames. |
| Half Range | Oscillate only to one side of the base value. |
| End Offset | Trim end frames. |

Other observed parameters (not individually described): `Oscillate Around`, `Origin`, `Start`, `End`.

## Align To

*Motion behavior · 191 files · 907 instances*

Keeps the object oriented toward / aligned with a target object.

Other observed parameters (not individually described): `Object`, `Align`, `To`, `Offset`, `Transition`, `Custom Amount`, `Align Frame`, `Ignore Sequencing`, `Alignment`, `End Offset`, `Target Alignment`, `Affect Subobjects`.

## Randomize

*Parameter behavior · 188 files · 496 instances*

Adds per-frame pseudo-random variation to the parameter (jittery), seeded and band-limited by Frequency/Noisiness.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the random variation. |
| Frequency | How fast the value changes. |
| Noisiness | Adds higher-frequency roughness on top. |
| Random Seed | Seed; reshuffles the pattern. |
| Apply Mode | Add to / replace the base value. |
| Start Offset | Trim start frames. |
| End Offset | Trim end frames. |
| Multiplier | Scales the applied amount. |

Other observed parameters (not individually described): `Wriggle Offset`, `Affect Subobjects`.

## Track

*Motion behavior · 146 files · 606 instances*

Drives the object's transform from tracking data (a Tracker), so it follows tracked screen motion.

| Parameter | What it controls |
|---|---|
| Source | Tracked source. |
| Tracker Root | Root of the tracker data. |
| Transform | Channels driven by the track. |

Other observed parameters (not individually described): `Align Tangents`, `Tracker`.

## Wriggle

*Parameter behavior · 144 files · 362 instances*

Like Randomize but with **smooth** noise — organic wandering rather than per-frame jitter.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the wander. |
| Frequency | Speed of the wander. |
| Noisiness | Higher-frequency roughness. |
| Random Seed | Seed. |
| Wriggle Offset | Phase offset into the noise field. |
| Start Offset | Trim start frames. |
| End Offset | Trim end frames. |
| Preserve Angle | Keep orientation while wriggling. |

Other observed parameters (not individually described): `Apply Mode`.

## Negate

*Parameter behavior · 83 files · 120 instances*

Inverts the source parameter value (multiplies by −1) every frame.

## Overshoot

*Parameter behavior · 69 files · 145 instances*

Springy settle: ramps toward a target but overshoots and oscillates past it before settling — a bouncy ease.

| Parameter | What it controls |
|---|---|
| Ramp Duration | Time over which the value ramps to target. |
| End Offset | Trim end frames. |
| Start Value | Value at start. |
| Cycles | Number of overshoot oscillations. |
| Start Offset | Trim start frames. |
| End Value | Target value. |
| Acceleration | Shape of the ramp acceleration. |

## Motion Path

*Motion behavior · 59 files · 181 instances*

Moves the object's position along an authored spline path, with speed control.

| Parameter | What it controls |
|---|---|
| Shape Source | Source of the path. |
| Custom Speed | Use a custom speed curve. |
| Path Shape | The path geometry (open/closed spline). |
| Speed | Travel speed along the path. |
| Loops | How many times to traverse. |
| End Condition | What happens at the path end (stop/loop/ping-pong). |
| Direction | Forward/reverse traversal. |
| Offset | Starting offset along the path. |
| Amplitude | Wave amplitude if oscillating along path. |
| Frequency | Wave frequency. |
| Phase | Wave phase. |

Other observed parameters (not individually described): `Position`, `End Point`, `Apply Speed`, `Damping`, `Radius`, `Attach To Shape`, `Start Value`, `End Value`, `Start Point`, `Shape Type`, `Size`.

## Gravity

*Motion (simulation) behavior · 40 files · 148 instances*

Applies constant downward acceleration to a moving object (used with Throw for arcs).

| Parameter | What it controls |
|---|---|
| Acceleration | Downward acceleration magnitude. |
| Affect Subobjects | Also affect child objects. |

## Random Motion

*Motion (simulation) behavior · 34 files · 57 instances*

Sends the object wandering along a smooth random path (2D/3D), seeded.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the wander. |
| Random Seed | Seed. |
| Affect Subobjects | Also move child objects. |
| Frequency | Speed of direction change. |
| Noisiness | Roughness of the path. |
| Drag | Velocity damping. |

## Drag

*Motion (simulation) behavior · 29 files · 109 instances*

Damps a moving object's velocity over time (air resistance).

| Parameter | What it controls |
|---|---|
| Amount | Damping strength. |
| Affect Subobjects | Also affect child objects. |

## Spin

*Motion behavior · 21 files · 69 instances*

Continuously rotates the object at a constant rate about an axis.

| Parameter | What it controls |
|---|---|
| Spin Rate | Rotation speed (degrees/sec). |
| Affect Subobjects | Also spin child objects. |
| Axis | Rotation axis (2D/3D). |
| Spin To | Optional target angle. |
| Latitude | 3D axis latitude. |
| Longitude | 3D axis longitude. |

## Throw

*Motion (simulation) behavior · 21 files · 54 instances*

Gives the object an initial velocity — it drifts in a straight line at constant speed (no forces).

| Parameter | What it controls |
|---|---|
| Throw Velocity | Initial velocity vector. |
| Affect Subobjects | Also throw child objects. |
| Throw Distance | Alternative distance-based throw. |

## Grow/Shrink

*Motion behavior · 20 files · 51 instances*

Animates the object's scale up or down over time.

| Parameter | What it controls |
|---|---|
| Scale To | Target scale. |
| Curvature | Ease shape. |
| End Offset | Trim end frames. |

## Spring

*Motion (simulation) behavior · 18 files · 90 instances*

Pulls the object toward a target with spring physics — it springs to and oscillates around the attractor.

| Parameter | What it controls |
|---|---|
| Attract To | Target the spring pulls toward. |
| Spring Tension | Stiffness of the spring. |
| Relaxed Length | Rest length before force applies. |
| Affect Subobjects | Also affect child objects. |

## Type On

*Parameter behavior · 14 files · 16 instances*

Reveals a Text object one character at a time (typewriter effect).

## Repel

*Motion (simulation) behavior · 9 files · 20 instances*

Pushes the object away from other object(s) within an influence radius.

| Parameter | What it controls |
|---|---|
| Strength | Repulsion force. |
| Influence | Radius of effect. |
| Object | Object(s) repelled from. |
| Falloff Rate | How force decays with distance. |
| Affect | Which objects are affected. |

Other observed parameters (not individually described): `Affect Subobjects`.

## Point

*Parameter behavior · 7 files · 38 instances*

Aims one object at another (points its orientation toward a target), with per-axis remap.

| Parameter | What it controls |
|---|---|
| Object | Target to point at. |
| Invert Axis | Flip the pointing axis. |
| Speed | How quickly it re-aims. |
| Axis | Which axis points at the target. |

Other observed parameters (not individually described): `Transition`, `Source Object`, `Mix Time Range`, `Custom Mix`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`, `Z max`, `Animate min`, `Animate max`, `Start Value`, `End Value`, `Curvature`, `Clamp At`, `Max`, `Start Offset`.

## Edge Collision

*Motion (simulation) behavior · 5 files · 11 instances*

Bounces a moving object off the frame (or a defined boundary) edges.

| Parameter | What it controls |
|---|---|
| Affect Subobjects | Also affect child objects. |

Other observed parameters (not individually described): `Bounce Strength`, `Active Edges`, `Height`, `Depth`.

## Rotational Drag

*Motion (simulation) behavior · 3 files · 14 instances*

Damps a spinning object's angular velocity over time.

| Parameter | What it controls |
|---|---|
| Amount | Angular damping strength. |
| Affect Subobjects | Also affect child objects. |

## Snap Alignment

*Motion behavior · 3 files · 13 instances*

Snaps the object's alignment to discrete steps (grid/angle snapping).

Other observed parameters (not individually described): `Axis`, `Invert Axis`, `End Offset`.

## Stop

*Parameter behavior · 2 files · 9 instances*

Freezes the parameter at its value when the behavior starts (halts other animation from that point).

## Orbit Around

*Motion (simulation) behavior · 2 files · 3 instances*

Makes the object orbit around a target object.

| Parameter | What it controls |
|---|---|
| Object | The body orbited around. |

Other observed parameters (not individually described): `Strength`, `Influence`, `Pole Axis`.

## Reverse

*Parameter behavior · 1 files · 1 instances*

Plays the driving parameter's animation backwards.

## Attractor

*Motion (simulation) behavior · 1 files · 1 instances*

Pulls the object toward an attractor object within an influence radius (inverse of Repel).

| Parameter | What it controls |
|---|---|
| Strength | Attraction force. |
| Falloff Rate | Force decay with distance. |
| Influence | Radius of effect. |

Other observed parameters (not individually described): `Affect`, `Drag`.

---
_Corpus-derived (`~/motr-collection`, 5,365 files). Usage counts empirical; parameter meanings are standard Apple Motion behavior semantics — verify against `engine/src/evaluator/` for the engine's decoded implementations of Link, Ramp, and the motion-curve system._