# Motion Behaviors — corpus reference

Behaviors are Apple Motion's procedural animation system: instead of keyframing a parameter,
a behavior *computes* its value every frame from a small set of controls. In the `.motr`/`.moti`
scene graph they appear as `<behavior>` / `<parameterBehavior>` nodes attached to an object or a
specific parameter channel. This engine evaluates them in `engine/src/evaluator/` (see
`links.ts`, `ramp.ts`, `motion-curve.ts`, `behaviors/`).

Counts below are corpus-wide across **5,365** template files (`.motr/.moti/.moef/.motn`),
i.e. how these behaviors are actually used in the wild — far broader than the 65 shipping FCP
transitions that `docs/CATALOG.md` tallies.

> **`Affecting Object (Hidden)`** appears on every behavior — it is the internal target-object
> reference (which object/parameter the behavior drives), not a user control. Ignore it when
> reading the creative parameters.

---

## Link — bind one parameter to another  ·  50,480 instances / 3,495 files
The workhorse of Motion rigs. Reads a **Source Object**'s value and drives the target parameter
from it, with optional linear remap and scaling. This is how "one master control moves twelve
things at once" is built (a Rig publishes a Widget; Links fan its value out to many params).

| Parameter | Type | What it controls |
|---|---|---|
| Source Object | ref | The object/parameter whose value is read. |
| Scale | float | Multiplier applied to the source value before it drives the target (default 1). |
| Mix Time Range | enum | How the source's time is sampled relative to the target. |
| Clamp Source Value Within Range | bool | If set, the source value is clamped to `[X min, X max]` before mapping. |
| X min / X max | float | Input range of the source value… |
| Y min / Y max | float | …mapped linearly to this output range (per-channel remap). |
| Red/Green/Blue min-max | float | Same linear remap, applied per colour channel when the linked param is a colour. |
| Source Frame Mode / Source Frame | enum/int | Sample the source at a fixed frame instead of the current time. |

Channel suffixes (`Link PX`, `Link SY`, `Link RZ`…) are per-axis instances of the same behavior
driving position X, scale Y, rotation Z, etc. — the engine collapses these to one Link type.

## Rig Behavior — snapshot interpolation from a Widget  ·  45,242 instances / 3,240 files
Backs a **Rig**'s published control (a Widget — slider/popup/checkbox). Stores a set of
**Snapshots** (parameter states) and interpolates the rigged parameters between them as the
Widget value moves. A popup Widget snaps between discrete snapshots; a slider blends continuously.

| Parameter | Type | What it controls |
|---|---|---|
| Widget | ref | The published control (slider/popup/checkbox) whose value selects/blends snapshots. |
| Snapshots | data | The stored parameter states the Widget interpolates between. |

## Clamp — bound a value  ·  6,594 instances / 1,640 files
Constrains the parameter it's attached to within a range every frame.

| Parameter | Type | What it controls |
|---|---|---|
| Min | float | Lower bound. |
| Max | float | Upper bound. |
| Clamp At | enum | Whether to clamp the low end, high end, or both. |

## Ramp — animate a value from Start to End  ·  1,873 instances / 327 files
A self-contained tween: drives the parameter from **Start Value** to **End Value** over the
behavior's active range, shaped by **Curvature** (0 = linear, positive = ease).

| Parameter | Type | What it controls |
|---|---|---|
| Start Value / End Value | float | The values ramped between. |
| Curvature | float | Ease shape of the ramp (0 = linear). |
| Start Offset / End Offset | float | Trim the active range from the clip's start/end (frames). |

## Custom — hand-authored parameter curve  ·  2,032 instances / 824 files
A generic behavior holding an arbitrary user curve/expression for the parameter. Effectively a
container for bespoke animation that isn't one of the named behaviors.

## Sequence Text — animate text per character/word/line  ·  1,563 instances / 400 files
Applies a repeating transform (position/scale/opacity/etc.) across the units of a Text object,
offset in time per unit — the basis of type-on and cascading text effects.

## Oscillate — sinusoidal wobble  ·  788 instances / 194 files
Adds a periodic oscillation to the parameter.

| Parameter | Type | What it controls |
|---|---|---|
| Amplitude | float | Peak deviation from the base value. |
| Speed | float | Oscillations per unit time. |
| Phase | float | Starting offset of the wave. |
| Wave Shape | enum | Sine / triangle / square / sawtooth. |
| Half Range | bool | Oscillate only to one side of the base value. |

## Align To — orient/position toward another object  ·  907 instances / 191 files
Keeps the object aimed at or aligned with a target object.

## Rate — constant-velocity drive  ·  711 instances / 310 files
Adds a steady per-frame increment to the parameter (e.g. continuous rotation).

## Track — follow tracked motion  ·  606 instances / 146 files
Drives the parameter from tracking data.

## Randomize / Wriggle — noise-driven jitter  ·  496 / 362 instances
Add pseudo-random variation to the parameter (Wriggle = smooth noise, Randomize = per-frame),
controlled by amount/frequency/seed.

## Motion Path — move along a spline  ·  181 instances / 59 files
Drives an object's position along an authored path.

## Physics: Gravity · Overshoot · Drag · Spring · Negate · Reverse
Simulation/utility behaviors (lower usage): Gravity (constant acceleration), Overshoot (springy
settle past the target), Drag/Rotational Drag (velocity damping), Spring, Negate (invert the
source value), Reverse (play the driving value backwards).

---
_Corpus-derived (`~/motr-collection`, 5,365 files). Usage counts are empirical. Parameter meanings
reflect standard Apple Motion behavior semantics; verify against `engine/src/evaluator/` for the
engine's decoded implementation._
