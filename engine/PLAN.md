# Motion .motr Engine — Implementation Plan

## Implementation Status (updated)

- **Phase 1 (Core)**: ✅ COMPLETE — parser, bezier evaluator, transforms, compositor, retime model
- **Phase 2 (Filters)**: ✅ SUBSTANTIAL — 10 filters (Gaussian/Directional/Radial/Zoom blur, Glow/Bloom, Levels, Brightness, Channel Mixer, Colorize, Hue/Saturation)
- **Phase 3 (Shapes/Masks)**: ✅ CORE — parsing, rasterization, mask compositing
- **Phase 4 (Replicators)**: ⏳ TODO
- **Phase 5 (3D/Camera)**: ✅ CORE — perspective projection, textured quad rendering
- **Phase 6 (Rigs/Behaviors)**: ✅ RIGS DONE — widgets/behaviors/snapshots; behaviors (Oscillate/Spin/Throw) TODO
- **Phase 7 (Particles/360°)**: ⏳ TODO
- **Phase 8 (WebGL backend)**: ⏳ TODO

59 tests passing. Ground-truth PSNR validation in place (~50dB at frame 0). See README.md.

---


A comprehensive plan for building a browser-based Motion transition renderer that
faithfully reproduces FCP's output for all 65 built-in transitions.

## Architecture

```
.motr XML
   │
   ▼
┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌──────────┐
│  Parser  │────►│ Evaluator │────►│ Compositor  │────►│ ImageData│
│ (XML→AST)│     │ (time→vals)│     │ (layers→px) │     │ (output) │
└──────────┘     └───────────┘     └─────────────┘     └──────────┘
                       │                    │
                       │                    ├── WebGL backend (fast)
                       │                    └── Canvas2D fallback
                       │
                       └── Bezier curve evaluator
                           Transform matrix builder
                           Filter parameter resolver
```

## Phase 1: Core Infrastructure (2-3 weeks)

### 1.1 Parser (`src/parser/`)
- [ ] Parse `<factory>` definitions → type registry
- [ ] Parse `<scenenode>` tree → Layer hierarchy
- [ ] Parse `<parameter>` values (static + animated)
- [ ] Parse `<curve>` / `<keypoint>` → Keyframe arrays
- [ ] Parse `<timing>` (in/out/offset per layer)
- [ ] Parse `<layer>` groups
- [ ] Parse `<footage>` / image source references (identify Transition A/B)
- [ ] Parse `<behavior>` nodes (rigs, fade in/out)
- [ ] Handle `<pluginUUID>` filter references

### 1.2 Keyframe Evaluator (`src/evaluator/`)
- [ ] Linear interpolation (type=1)
- [ ] Bezier interpolation (type=6) — the dominant type
  - Input/output tangent handling (normalized time/value tangents)
  - Multi-segment cubic bezier evaluation
- [ ] Constant/hold interpolation
- [ ] Time remapping (Retime Value curves)
- [ ] Parameter expression evaluation (linked parameters via Channel refs)

### 1.3 Transform System
- [ ] 2D affine transforms (position, rotation, scale, anchor)
- [ ] 3D transforms (rotationX/Y/Z, positionZ)
- [ ] Transform composition (parent→child matrix multiply)
- [ ] Anchor point (rotation/scale pivot)
- [ ] Crop regions (per-side crop with animation)

### 1.4 Basic Compositor (`src/compositor/`)
- [ ] Layer stacking (back-to-front)
- [ ] Per-layer opacity
- [ ] Transform application (matrix → pixel mapping)
- [ ] Source A/B image injection into drop-zone layers

**Milestone: Push transition renders correctly (position keyframes only).**

## Phase 2: Blend Modes & Filters (3-4 weeks)

### 2.1 Blend Modes
- [ ] Normal (source-over)
- [ ] Add (linear dodge)
- [ ] Multiply
- [ ] Screen
- [ ] Overlay
- [ ] Darken / Lighten
- [ ] Difference / Exclusion

### 2.2 Core Filters (used across transitions)
| Filter | Transitions using it | Complexity |
|--------|---------------------|------------|
| Gaussian Blur | 17 | Medium — separable 2-pass |
| Levels / PAELevels | 27 | Simple — per-channel remap |
| Channel Mixer | 16 | Simple — 3x3 matrix |
| Color Solid | 18 | Trivial — fill color |
| Colorize/PAEColorize | 19 | Medium — hue shift + saturation |
| Brightness | 7 | Trivial — additive |
| Hue/Saturation | 4 | Medium — HSV conversion |
| Directional Blur | 4 | Medium — angled kernel |
| Radial Blur | 5 | Hard — per-pixel angle |
| Zoom Blur | 2 | Hard — per-pixel radial |
| Glow/PAEGlow/PAEBloom | 6 | Medium — threshold + blur + add |
| Bevel | 7 | Hard — edge detection + lighting |

### 2.3 Filter Framework
- [ ] Per-filter parameter evaluation
- [ ] Filter chain (multiple filters per layer)
- [ ] Animated filter enable/disable
- [ ] Filter order (applied in XML order)

**Milestone: Blurs/Gaussian, Blurs/Directional, Dissolves/Divide render correctly.**

## Phase 3: Shapes & Generators (2-3 weeks)

### 3.1 Shape Renderer
- [ ] Rectangle shapes
- [ ] Rounded rectangles
- [ ] Circle/Ellipse
- [ ] Custom path shapes (bezier paths from XML)
- [ ] Shape fill (solid, gradient)
- [ ] Shape stroke
- [ ] Shape as mask (alpha/luminance)

### 3.2 Generators
- [ ] Color Solid (flat fill)
- [ ] Gradient (linear + radial)
- [ ] Ramp (1D gradient)

### 3.3 Masks
- [ ] Layer as alpha mask
- [ ] Image Mask (21 transitions use these)
- [ ] Shape-defined mask regions
- [ ] Inverted masks
- [ ] Mask feathering

**Milestone: Wipes/Mask, Wipes/Diagonal, Lights/Flash render correctly.**

## Phase 4: Replicators & Clones (3-4 weeks)

### 4.1 Clone Layer System
- [ ] Clone source reference resolution
- [ ] Clone transform offset
- [ ] Clone count
- [ ] 19 transitions use Clone Layers

### 4.2 Replicator Engine
- [ ] Grid replicator (rows × columns)
- [ ] Circular replicator (count around center)
- [ ] Replicator cell transforms (per-cell offset, rotation, scale)
- [ ] Replicator cell randomization
- [ ] Source assignment per cell (A or B input)
- [ ] 40 replicator cells + 40 replicators across all transitions

### 4.3 Sequence Replicator
- [ ] Frame-offset per clone (stagger animation)
- [ ] Build order (sequential reveal)

**Milestone: All 8 Replicator:Clones transitions render correctly.**

## Phase 5: 3D & Camera (2-3 weeks)

### 5.1 3D Transforms
- [ ] Perspective projection
- [ ] 3D rotation (X/Y axis rotation around anchor)
- [ ] Z-position (depth ordering)
- [ ] 3D compositing order (depth sort)

### 5.2 Camera System
- [ ] Camera position/rotation/FOV (10 transitions use cameras)
- [ ] Camera animation (dolly, orbit)
- [ ] Camera → projection matrix

### 5.3 3D Lighting (for Bevel)
- [ ] Normal map from shape edges
- [ ] Directional light
- [ ] Specular + diffuse

**Milestone: Movements/Flip, Movements/Multi-flip, Replicator:Clones/3D Rectangle render.**

## Phase 6: Behaviors & Rigs (2 weeks)

### 6.1 Fade In / Fade Out
- [ ] Opacity ramp at layer start/end (14 transitions)

### 6.2 Rig System
- [ ] Rig widgets (direction selectors, sliders)
- [ ] Rig-driven parameter switching (52 rigs across transitions)
- [ ] Widget → parameter value mapping

### 6.3 Other Behaviors
- [ ] Oscillate (3 uses)
- [ ] Spin (2 uses)
- [ ] Motion Path (2 uses)
- [ ] Align To (5 uses)
- [ ] Gravity/Throw (3 uses)

**Milestone: Stylized transitions that use rig-driven direction switches render.**

## Phase 7: Particles & Special (2-3 weeks)

### 7.1 Particle System
- [ ] Emitter (position, shape, rate)
- [ ] Particle Cell (life, speed, spin, scale over life)
- [ ] Birth rate / life randomization
- [ ] Particle physics (gravity, wind)
- [ ] 4 emitters + 4 particle cells used

### 7.2 360° / Equirectangular
- [ ] Equirectangular projection mapping
- [ ] 360° Reorient filter (8 uses)
- [ ] Spherical transforms

### 7.3 Special Effects
- [ ] Lens Flare (custom lens element rendering)
- [ ] Static/Noise generator
- [ ] Light Noise
- [ ] Bevel/emboss (edge-detect + lighting)

**Milestone: All remaining transitions render.**

## Phase 8: Optimization & Polish (ongoing)

### 8.1 WebGL Compositor
- [ ] GPU-accelerated layer compositing
- [ ] Shader-based filters (blur, color ops)
- [ ] Texture atlas for static layers
- [ ] Render-to-texture for groups

### 8.2 Performance
- [ ] Cache evaluated keyframes (temporal coherence)
- [ ] Skip invisible layers
- [ ] Progressive rendering (low-res preview → full)
- [ ] Worker thread for parsing/evaluation

### 8.3 Accuracy
- [ ] Per-transition PSNR tracking against ground truth
- [ ] Sub-pixel accuracy in transforms
- [ ] Color-space-correct compositing (linear vs sRGB)
- [ ] Half-float precision where needed

---

## Verification Strategy

Each phase is validated against the headless FCP ground truth:

```bash
# Generate reference frames (12 per transition, all 65)
npm run ground-truth

# Run pixel comparison
npm test
```

The test harness reports per-transition PSNR and a pixel-diff percentage.
Target: **PSNR > 35dB** for each transition (visually indistinguishable).

---

## Priority Order (what to implement first)

Based on how many transitions each system unblocks:

1. **Bezier keyframe evaluation** — needed by ALL 65
2. **Position/scale/rotation transforms** — needed by ALL 65
3. **Opacity animation** — 61 transitions
4. **Crop animation** — ~50 transitions
5. **Gaussian blur filter** — 17 transitions
6. **Color/Levels filters** — 27 transitions
7. **Replicator engine** — 8 transitions (but complex)
8. **Shape/Mask rendering** — 21 transitions
9. **3D transforms** — 10 transitions
10. **Particle system** — 4 transitions

---

## Key .motr Format Details

### Time format
`<time>VALUE TIMESCALE FLAGS EPOCH</time>` → time = VALUE/TIMESCALE seconds.
Standard timescale: 120000 (allows frame-accurate representation at 23.976fps).

### Keyframe interpolation types
- `1` = linear
- `6` = bezier (with in/out tangent time+value)
- `4` = constant (hold previous value)

### Coordinate system
- Origin = **center of frame** (Motion uses centered coordinates)
- Y-up (positive Y = up)
- Rotation in degrees, clockwise positive

### Transform order
Scale → Rotate → Translate (applied from the anchor point)

### Layer compositing
Back-to-front (XML order = bottom → top), premultiplied alpha.

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Core | 2-3 weeks | 3 weeks |
| Phase 2: Filters | 3-4 weeks | 7 weeks |
| Phase 3: Shapes | 2-3 weeks | 10 weeks |
| Phase 4: Replicators | 3-4 weeks | 14 weeks |
| Phase 5: 3D/Camera | 2-3 weeks | 17 weeks |
| Phase 6: Behaviors | 2 weeks | 19 weeks |
| Phase 7: Particles/Special | 2-3 weeks | 22 weeks |
| Phase 8: Polish | ongoing | — |

**Total: ~5-6 months to full coverage of all 65 transitions.**

The first visually-correct transition (Push) should render in **2-3 weeks** from start.
