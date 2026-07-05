# `.motr` implementation catalog

An exhaustive inventory of every structure, field, and value the browser engine
must implement to render Final Cut Pro's 65 built-in transitions, with current
implementation status. Derived from a full survey of all 65 `.motr` files plus
reverse-engineering of the real engine (see `DEBUGGING.md`).

Status legend:  ✅ done & validated · 🟡 partial · ❌ not implemented

---

## 1. Document / scene structure

| Element | Purpose | Status |
|---|---|---|
| `<ozml version=…>` root | container | ✅ |
| `<factory id uuid>` (×~14/file) | node/behavior type registry (`description` = type) | ✅ |
| `<scene>` | root scene | ✅ |
| `<sceneSettings>` | width, height, duration(frames), frameRate, NTSC, pixelAspectRatio, motionBlurSamples/Duration, workingGamut, viewGamut, parameterColorSpaceID, reflectionRecursionLimit, backgroundColor, Object3DEnvironments, … | 🟡 (width/height/duration/frameRate used; motion-blur, gamut, colorspace ignored) |
| `<currentFrame>` `<timeRange>` `<playRange>` | time bounds | 🟡 (animation end derived from keyframes) |
| `<layer>` / `<scenenode>` hierarchy | scene graph | ✅ |
| `<footage>`/`<clip>`/`<pathURL>` | drop-zone A/B media refs | ✅ |
| `<publishSettings>`/`<target>` | published rig params | 🟡 |
| `<timemarkerset>` `<guideset>` `<curvesets>` | editor metadata | ❌ (ignore) |

### Time encoding
`VALUE TIMESCALE FLAGS EPOCH` (e.g. `36036 120000 1 0` = 36036/120000 s). ✅

---

## 2. Factory / node types (count = # of instances across all 65)

| Factory `description` | # | Role | Status |
|---|---|---|---|
| Channel | 512 | animated parameter channel | ✅ |
| Widget | 117 | rig control (popup/checkbox/slider) | ✅ |
| Project | 65 | root project node | ✅ |
| Image | 65 | drop-zone image (Transition A/B) | ✅ |
| Rig Behavior | 57 | maps widget value → param snapshots | ✅ |
| Rig | 52 | rig container | ✅ |
| ProPlugin Filter | 43 | FxPlug effect (see §4) | 🟡 (17 of ~30 filter UUIDs) |
| Replicator Cell | 40 | replicator cell content | 🟡 |
| Replicator | 40 | tile/grid/pattern replicator | 🟡 (basic grid only) |
| Gradient | 36 | gradient generator | 🟡 (linear/radial) |
| Shape | 34 | vector shape / mask geometry | 🟡 |
| Generator | 25 | procedural image (Color Solid, Gradient, Noise…) | 🟡 (Color Solid, Gradient) |
| Image Mask | 21 | per-layer mask | 🟡 |
| Clone Layer | 19 | renders another object's image | ✅ |
| Link | 17 | drives a channel from another object (+ rig Scale/Mix) | ✅ |
| Fade In/Fade Out | 14 | opacity envelope behavior | 🟡 |
| Camera | 10 | 3D camera / projection | ❌ |
| Ramp | 6 | parameter ramp behavior | 🟡 |
| Output | 6 | render output node | n/a |
| Align To | 5 | orientation behavior | ❌ |
| Particle Cell | 4 | particle system cell | ❌ |
| Emitter | 4 | particle emitter | ❌ |
| Sequence Replicator | 3 | staggered-timing replicator | 🟡 |
| Oscillate | 3 | oscillation behavior | ❌ |
| Spin | 2 | continuous rotation behavior | 🟡 |
| Motion Path | 2 | path-follow behavior | ❌ |
| Gravity | 2 | particle force | ❌ |
| Framing | 2 | reframe behavior | ❌ |
| Throw / Scrub / Scale Over Life / Rate / Random Motion / Light / Grow-Shrink | 1 each | misc behaviors | ❌ |

---

## 3. Transform / Properties parameter IDs (the standard block)

Every drawable node has `Properties(id=1)` → `Transform(id=100)`:

| Param | id | Sub (X=1,Y=2,Z=3) | Status |
|---|---|---|---|
| Position | 101 | X/Y/Z | ✅ |
| Rotation | 102 (or 109) | X/Y/Z (radians) | 🟡 (Z ok; X/Y need 3D) |
| Scale | 105 | X/Y/Z (fractional, 1=100%) | ✅ |
| Shear | — | X/Y | ❌ |
| Anchor Point | 107 | X/Y/Z | ✅ |
| Blending(200) → Opacity | 202 | 0–1 | ✅ |
| Blending → Blend Mode | 203 (or 227) | enum (see §6) | 🟡 (normal + a few) |
| Crop | 216 | Left/Right/Top/Bottom | 🟡 |
| Four Corner | 207 | 4 corner points (perspective) | 🟡 |
| Drop Shadow | 208 | color/offset/blur | ❌ |
| Reflection | 223 | floor reflection | ❌ |
| Lighting(230)/Shadows(234) | | 3D lighting | ❌ |
| Cinematic(344) → Depth of Field | 346 | DoF | ❌ |
| Retime Value | 304 | host-time → template-frame remap | ✅ |
| Fixed/Aperture Width/Height | 302/303/312/313 | fixed-res behavior | 🟡 |

---

## 4. FxPlug filters (by stable UUID)

| UUID | Names | Status |
|---|---|---|
| C18E8B62-… | Color Solid / FG / BG / PAEColorSolid | ✅ |
| B2E0DE39-… | Channel Mixer / PAEChannelMixer | ✅ |
| 2B221FA1-… | Levels / PAELevels | ✅ |
| D995BBCF-… | Colorize / PAEColorize | ✅ |
| E472D646-… | Gaussian Blur / GaussianBlur / PAEGaussianBlur | ✅ |
| 40091D89-… | Gradient | 🟡 |
| E61FE95E-… | 360° Reorient (+ Start/2/X/Y variants) | ❌ |
| 2E4DBB0A-… | Brightness / Brightness copy / PAEBrightness | ✅ |
| 9C655247-… | Bevel | ✅ |
| D23AF030-… | Hue/Saturation / PAEHSVAdjust | ✅ |
| 2E7B1340-… | Directional Blur / PAEDirectionalBlur | ✅ |
| 8F9F88CF-… | Radial Blur / Blur Start/End / PAERadialBlur | ✅ |
| 11C0E095-… | Zoom Blur / PAEZoomBlur (+ OSC) | ✅ |
| 717D6E01-… | Tint / PAETint / TintFx | ✅ |
| 73F69C87-… | Glow / PAEGlow | ✅ |
| 5599C557-… | Bloom / PAEBloom | ✅ |
| 7E9178C5-… | Luma Keyer | ✅ |
| 47D6B897-… | Fill | 🟡 |
| 96A13FF0-… | Gaussian Gradient | ❌ |
| 4933D9F1-… | LensFlareGenerator | ❌ |
| EFCC7FE1-… | PerlinNoiseV2 / PAECloudsV2 | ❌ |
| 30911E49-… | PAENoise | ❌ |
| 1A32EFEF-… | PAEBlackHole | ❌ |
| DEB7CD03-… | PAEEarthquake | ❌ |
| 0D6E968B-… | Smear | ❌ |
| 2DB30B44-… | PAETrails | ❌ |
| 2FF8887B-… | PAEFlop | ❌ |
| 32AB5EE1-… | PAEBadTV | ❌ |
| 9FA1F483-… | PAEUnderwater | ❌ |
| D2342006-… | MinMax2/3/4 | ❌ |

Filter param vocabulary: Amount, Radius, Threshold, Angle, Distance, Mix,
Brightness, Gamma, Black In/White In/White Out, Red/Green/Blue channel-mix rows,
Hue/Saturation/Value, Bevel Width/Light Angle, Luma/Rolloff/Strength/Invert,
Intensity/Opacity. (See §6 for the general param model.)

---

## 5. Keyframe / curve model  ✅ (fully reverse-engineered)

`<curve type default value round retimingExtrapolation>` with `<keypoint
interpolation flags>` → `<time> <value> <inputTangentTime/Value>
<outputTangentTime/Value>`.

- **Interpolation types** (full table in `DEBUGGING.md`): 0 Constant, 1/18 Linear,
  2–5/9–12 Bezier(stored tangents), 6 CatmullRom, 7 EaseIn, 8 EaseOut, 13
  Exponential, 14 Logarithmic, 15 Ease, 16 Accelerate, 17 Decelerate, 19 Convex,
  20 Concave, 21 SCurve. Implemented & validated: 0,1,2,6,7,8,15,16,17 (all types
  used by the 65). ❌ 13,14,19,20,21 (unused).
- **Keyframe flags**: 0x80 boundary, 0x100/0x180 locked/smooth (editor metadata,
  do not affect output). ✅
- **Keyframeless curve** holds `value` (not `default`) — rig snapshot selectors. ✅
- **Retime Value** maps host time → template frame. ✅

---

## 6. Enumerations & value conventions

| Thing | Values | Status |
|---|---|---|
| Blend Mode | 0 Normal (864×), 2, 8, 14, 15, 16, 25, 27, 28, 34 (Add/Screen/Multiply/Overlay/… — need exact map) | 🟡 |
| Scale | fractional (1.0 = 100%) | ✅ |
| Rotation | radians | ✅ |
| Opacity | 0–1 | ✅ |
| Color | RGBA 0–1 | ✅ |
| Color Space / parameterColorSpaceID | gamut ids | ❌ |
| Widget `entry`/`tag` | popup option → value map | ✅ |
| Direction rig | tag 0 L→R, 1 T→B, 2 B→T, 3 R→L | 🟡 (B→T exact; others structural) |

---

## 7. Behaviors

| Behavior | Effect | Status |
|---|---|---|
| Rig Behavior | widget value → parameter snapshots (Position/Scale/Opacity/Custom Mix on links) | ✅ |
| Link | channel = source channel × Scale (rig-gated) × Custom Mix, clamped | ✅ |
| Fade In/Fade Out | opacity envelope over frames | 🟡 |
| Ramp | linear param ramp start→end | 🟡 |
| Spin | continuous rotation | 🟡 |
| Oscillate | sinusoidal param | ❌ |
| Motion Path | follow a path | ❌ |
| Align To / Framing | orientation | ❌ |
| Gravity / Throw / Random Motion / Rate / Scale Over Life | particle forces | ❌ |

---

## 8. Replicator / Shape / Particle geometry

- **Replicator**: Arrangement (rectangle/line/circle/…), Rows, Columns, Origin,
  Shape, Radius, Points, 3D, Tile Offset, Angle. Sequence Replicator adds
  per-instance staggered timing. 🟡 (basic rectangle grid only).
- **Shape**: `<vertex index id flags>` list, Closed, Fill/Outline, Fill Color,
  Build Style, control points (bezier path). Used as filled shapes and Image Masks.
  🟡 (polygon rasterize + mask; bezier path 🟡).
- **Particles** (Emitter/Particle Cell/Gravity): ❌ (Drop In, Earthquake, Diagonal,
  Glide).

---

## 9. 3D / Camera  ❌

Camera (10 transitions), 3D rotation (X/Y), perspective projection, Object3D
environments, 360° Reorient filter. Needed by: 360° family, Color Planes,
Reflection, Clone Spin, Video Wall, 3D Rectangle, Close & Open, Light Sweep, Up-Over.
Basic 4-corner perspective exists (🟡); full camera pipeline ❌.

---

## 10. Per-transition feature matrix

(F = feature present. See `tools/` to regenerate. Categories: 360°, Blurs,
Dissolves, Lights, Movements, Objects, Replicator:Clones, Stylized, Wipes.)

The dependency-ranked implementation order:
1. **Curve/transform core** ✅ — unblocks the simplest Movements (Push, Scale,
   Rotate, Fall, Flip, Smear, Slide, Earthquake-motion).
2. **Filters** (🟡) — Blurs, Lights, color Movements.
3. **Shapes + Image Mask** (🟡) — Wipes, many Stylized/Objects.
4. **Replicator** (🟡) — Replicator:Clones family, Objects, Stylized panels.
5. **3D / Camera** (❌) — 360° family, Reflection, Color Planes.
6. **Particles** (❌) — Drop In, Earthquake, Diagonal, Glide.
7. **Behaviors** (🟡/❌) — Oscillate, Motion Path, Align To, Gravity.

See the feature matrix generated by the survey (each transition's exact feature
set) reproduced below.

```
360°   360° Bloom         (filters only)
360°   360° Circle Wipe   Replicator,Shape,Link,Gradient,Rig,Ramp,AlignTo,360Reorient
360°   360° Divide        Replicator,SeqRepl,Shape,Camera,Clone,Gradient,Rig,Ramp,360Reorient
360°   360° Gaussian Blur Rig,Oscillate
360°   360° Push          Replicator,Shape,Clone,Gradient,Rig,AlignTo,360Reorient
360°   360° Reveal Wipe   Replicator,Shape,Link,Gradient,Rig,Ramp,AlignTo,360Reorient
360°   360° Slide         Replicator,Shape,Clone,Gradient,Rig,AlignTo,360Reorient
360°   360° Wipe          Replicator,Shape,Camera,Clone,Link,Gradient,Rig,AlignTo,360Reorient
Blurs  Directional        Fade
Blurs  Gaussian           Rig,Fade
Blurs  Radial             Rig,Fade
Blurs  Zoom               Link,Fade,Oscillate
Dissolves Divide          Replicator,Shape,ImageMask,Gradient,Rig,Fade
Lights Bloom              (filters only)
Lights Flash              Replicator,Shape,Gradient
Lights Lens Flare         Replicator,Shape,Link,Gradient,Fade,Oscillate
Lights Light Noise        (filters only)
Lights Static             Rig,Fade
Movements Black Hole      Rig (+PAEBlackHole)
Movements Clothesline     Link,Rig
Movements Color Planes    Camera,Clone,Link,Rig
Movements Drop In         Emitter,Gradient,Rig,Gravity
Movements Earthquake      Emitter,Gradient,Rig,Gravity (+PAEEarthquake)
Movements Fall            (transform only)
Movements Flashback       Fade
Movements Flip            Rig,Ramp
Movements Multi-flip      Clone,Rig
Movements Pinwheel        ImageMask,Clone,Rig
Movements Push            Clone,Link,Rig
Movements Reflection      Camera,Link,Rig
Movements Rotate          Rig
Movements Scale           Clone,Link,Rig
Movements Smear           Rig (+Smear)
Movements Swing           Clone,Rig,Ramp
Movements Switch          Clone,Link,Rig
Objects Arrows            Replicator,Shape,ImageMask,Clone,Gradient,Rig
Objects Curtains          Rig
Objects Leaves            ImageMask,Rig
Objects Squares           Replicator,SeqRepl,Shape,ImageMask,Gradient
Objects Veil              ImageMask
Repl:Clones 3D Rectangle  Replicator,Shape,ImageMask,Camera,Clone,Link,Gradient,Rig,Fade
Repl:Clones Clone Spin    Camera,Rig
Repl:Clones Combo Spin    Replicator,Shape,ImageMask,Clone,Gradient,Rig,Fade,Spin
Repl:Clones Concentric    Replicator,Shape,ImageMask,Clone,Gradient,Rig
Repl:Clones Duplicate     Replicator,SeqRepl,Shape,ImageMask,Gradient,Rig
Repl:Clones Multi         Replicator,Shape,Gradient,Rig,Ramp,Spin
Repl:Clones Vertigo       Replicator,Shape,ImageMask,Gradient,Rig
Repl:Clones Video Wall    Replicator,Shape,Camera,Gradient,Rig
Stylized Center Reveal    Replicator,Shape,ImageMask,Link,Gradient,Rig,MotionPath
Stylized Slide In         Replicator,Shape,Clone,Link,Gradient,Rig,Fade,MotionPath
Stylized Light Sweep      Replicator,Shape,ImageMask,Camera,Clone,Gradient,Rig
Stylized Color Panels     Replicator,Shape,Clone,Gradient,Rig
Stylized Panels Across    Replicator,Shape,Link,Gradient
Stylized Panels Random    Replicator,Shape,ImageMask,Gradient
Stylized Close & Open     Replicator,Shape,ImageMask,Camera,Gradient,Rig
Stylized Slide            Rig
Stylized Heart            Replicator,Shape,ImageMask,Link,Gradient,Rig,Fade
Stylized Loop             Replicator,Shape,ImageMask,Link,Gradient,Rig
Stylized Center           Replicator,Shape,ImageMask,Clone,Gradient,Rig
Stylized Lower            Replicator,Shape,ImageMask,Gradient,Rig
Stylized Diagonal         Replicator,Shape,Emitter,Gradient,Rig,Fade
Stylized Glide            Replicator,Shape,Emitter,Gradient,Rig,Fade
Stylized Up:Over          Replicator,Shape,ImageMask,Camera,Gradient,Rig
Wipes  Diagonal           Replicator,Shape,Gradient,Rig
Wipes  Mask               Replicator,Shape,ImageMask,Gradient,Rig
```

---

## 11. Rendering pipeline requirements

| Capability | Status |
|---|---|
| Source conform (1:1 centered, letterbox) | ✅ |
| Affine transform (translate/rotate-Z/scale/anchor) | ✅ |
| Bilinear sampling | ✅ |
| Coordinate system (Y-down internal) | ✅ |
| Layer stacking / source-over alpha | ✅ |
| Opacity | ✅ |
| Crop | 🟡 |
| Blend modes (Add/Screen/Multiply/…) | 🟡 |
| 4-corner perspective | 🟡 |
| 3D perspective + camera projection | ❌ |
| Masks (shape + image mask) | 🟡 |
| Motion blur | ❌ |
| Color management / gamut | ❌ |
| Reflection / drop shadow / lighting | ❌ |
