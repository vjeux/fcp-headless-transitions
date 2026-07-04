# motr-engine

A browser-based TypeScript renderer for Final Cut Pro / Motion `.motr` transition templates.

Renders FCP transitions in the browser using `ImageData` (Canvas/WebGL compatible),
validated against a headless FCP renderer for pixel accuracy.

## Public API

```typescript
import { createTransition } from 'motr-engine';

const transition = createTransition(motrXML);
const frame: ImageData = transition.render(imageA, imageB, progress); // progress 0→1
```

## Architecture

```
.motr XML → parser → MotrScene (typed graph)
                       ↓
         evaluator (time → EvaluatedScene)
           - bezier keyframe interpolation
           - transform matrices (Motion coord space)
           - Retime host-transition model
           - rig system (widgets/behaviors/snapshots)
                       ↓
         compositor (EvaluatedScene + images → ImageData)
           - layer stacking (correct z-order)
           - 2D affine + 3D perspective rendering
           - opacity, crop, filters, masks
```

## Implemented Features

### Phase 1 — Core ✅
- **Parser** (`src/parser/`): full `.motr` XML → typed scene graph. Factories, layers,
  groups, scenenodes, parameter trees, keyframe curves, timing, filters, rigs, shapes.
- **Bezier evaluator** (`src/evaluator/curves.ts`): all Motion interpolation types
  (constant, linear, bezier 6/7/8/15/16/17) with Newton-Raphson parametric solving.
- **Transform system** (`src/evaluator/index.ts`): 4×4 matrices, Motion's transform
  order (anchor → scale → rotate → translate), parent-child composition.
- **Compositor** (`src/compositor/`): software renderer, inverse-mapped affine transforms,
  source-over alpha, bilinear sampling.
- **Retime model**: host-transition parameter interpolation (default→value driven by
  the Retime Value curve).

### Phase 2 — Filters ✅ (10 types)
Gaussian blur, Directional blur, Radial blur, Zoom blur, Glow/Bloom, Levels, Brightness,
Channel Mixer, Colorize, Hue/Saturation. Each reads animated parameters via the curve evaluator.

### Phase 3 — Shapes/Masks ✅ (core)
- Shape geometry parsing (`<curve_X>`/`<curve_Y>` vertex lists, `<group>` containers)
- Polygon rasterization (scanline even-odd fill, transform-aware, union/invert)
- Mask compositing (shape masks clip group content)

### Phase 5 — 3D Perspective ✅ (core)
- Perspective camera projection (Motion reference camera)
- Textured quad rasterization (perspective-correct barycentric UV, bilinear sampling)
- Auto-routing: 3D-transformed layers use the perspective path

### Phase 6 — Rig System ✅ (core)
The mechanism behind 59/65 transitions:
- Widget parsing (popup/checkbox with current values, e.g. Push Direction=2)
- Rig behaviors mapping (object, widget, paramType) → parameter snapshots
- Snapshot selection by widget value + Retime-driven interpolation

### Generators ✅
- Color Solid (solid color fill)

## Validation

Ground-truth comparison (`test/compare.test.ts`) renders transitions and measures PSNR
against the headless FCP renderer output. Frame 0 (t=0) achieves ~50 dB PSNR
(near pixel-perfect) for the Gaussian Blur transition.

## Tests

59 tests across 7 files:
- `curves.test.ts` (15) — bezier/linear/constant interpolation, real Push keyframe data
- `parser.test.ts` (12) — scene structure, factories, layer hierarchy
- `evaluator.test.ts` (9) — matrix math, layer evaluation
- `integration.test.ts` (5) — end-to-end render
- `shapes.test.ts` (8) — polygon rasterization, masks
- `perspective.test.ts` (10) — 3D projection
- `compare.test.ts` — ground-truth PSNR

```bash
npx tsx test/curves.test.ts    # etc.
```

## Remaining Work
- Phase 4: Replicator engine (8 transitions)
- Phase 7: Particles / 360° / special (2-3 transitions)
- Phase 6 (behaviors): Oscillate, Spin, Throw, Gravity, Motion Path
- Filter + perspective combination
- Per-transition accuracy tuning against all 65 ground-truth renders
- WebGL backend (performance)
