# Gradient-tag colour-Link — reverse-engineering (T-A1 PARTIAL follow-up)

**Status:** decoded from the real FCP .motr binaries (read-only, 2026-07-13). Renderer NOT
yet built — blocked only by a file-collision window (needs `types.ts` + `parser/behaviors.ts`
+ `parser/index.ts`, which were being edited by in-flight swarm agents T-F1/T-B3 at decode
time). This note is the SPEC so the renderer can be built fast once those files are free.

## The gap

`engine/src/parser/behaviors.ts` (≈line 222) already DETECTS colour Links whose *target* is a
gradient colour tag, but deliberately DROPS them (`if (anyColourSourceRef && !colorTargetKind)
continue;`) because there is no `gradientTag` colorTarget kind and no renderer. Affected
built-ins: **Stylized/Loop, Stylized/Heart, Stylized/Slide_In** (all carry a hidden colour
driver shape + a Link routing its Fill Color RGB into a gradient stop). This is why T-A1 is
PARTIAL: the Colorize-remap and shape-fill colour-Link paths render, but the gradient-tag path
is a no-op, so Loop/Heart/Slide_In see PSNR-neutral (the driven gradient stop stays default).

## The target path, decoded

The Link's `affectingChannel` for a gradient-tag target has the shape:

```
./2/353/113/104/1/<tagId>/3/{1,2,3}
```

Walking it against the .motr scene graph (verified in Loop.motr, the "Gradient" scenenode
`factoryID=12`, and confirmed structurally identical in Heart.motr):

| path seg | id / factory     | meaning                                                            |
|----------|------------------|--------------------------------------------------------------------|
| `2`      | —                | Object → (style container)                                         |
| `353`    | —                | Style                                                              |
| `113`    | —                | Fill                                                              |
| `104`    | id=104           | **Gradient** parameter (the shape's fill gradient)                |
| `1`      | id=1 "RGB"       | the RGB colour-tags FOLDER (list of gradient stops)               |
| `<tagId>`| e.g. 845136460   | a specific STOP: "RGB1" (id 845136460, factoryID=3), "RGB2" (…461)|
| `3`      | id=3 "Color"     | that stop's **Color** parameter (factoryID=15)                    |
| `{1,2,3}`| id 1/2/3         | **Red / Green / Blue** (each factoryID=24)                        |

So a Link targeting `.../104/1/845136460/3/1` drives the **Red channel of gradient stop RGB1's
Color**. The `<tagId>` is a per-file scenenode id (NOT stable across .motr files — resolve it
from the gradient's RGB folder like every other id, via the factory table, never hardcode).

## The gradient-stop structure (Loop.motr, Gradient scenenode)

```
Gradient (id=104)
  RGB (id=1)                          # colour-tags folder
    RGB1 (id=845136460, factoryID=3)  # stop 1
      Location (id=1,  fac=4)  curve default 0      # 0..1 position along the ramp
      Middle   (id=2,  fac=4)  curve default 0.5    # midpoint bias to next stop
      Interpolation (id=100, fac=7)  curve default 2
      Color (id=3, fac=15)
        Red   (id=1, fac=24) curve value 0.9960…    # 0..1 float, range min=-6 max=8
        Green (id=2, fac=24) curve value 0.9686…
        Blue  (id=3, fac=24) curve value 0.8745…
        Gamma (id=10) 2.2 ; Color Space (id=11) 3   # (linear sRGB working space, per OZ_WS)
    RGB2 (id=845136461, factoryID=3)  # stop 2 … (N stops total)
      Location …                                     # e.g. 1.0 (end of ramp)
      Color (RGB) …
  (optionally an Alpha (id=2) tags folder in parallel with RGB)
```

Colour values are **0..1 float** (like the driver shape's Fill Color) — NOT 0-255. Range is
min=-6 max=8 (HDR-capable), so do NOT clamp to 0..1 before the working-space encode.

## Renderer plan (when types.ts is free)

1. **types.ts** — add `gradientTag` to the `colorTarget` discriminated union:
   `{ kind: 'gradientTag'; gradientOwnerId: number; tagId: number; channel: 'R'|'G'|'B' }`.
   (Mirror the existing `colorizeRemapBlack/White` + `shapeFill` variants.)
2. **parser/behaviors.ts `parseColorTarget`** — add a case: when `affPath` matches
   `…/104/1/<tagId>/3/{1,2,3}`, return the `gradientTag` kind (tagId + channel). Structural
   match on the segment ids only (104,1,·,3,{1,2,3}) — never per-transition.
3. **parser/index.ts** — the gradient stops already parse via `GaussianGradientConfig`? NO —
   that config is the RADIAL/Gaussian GENERATOR gradient (center/radius/color1/color2), a
   DIFFERENT thing. Shape-fill gradients (id=104 RGB tags) are a STOP LIST. Add a light
   parse of the RGB-tag stop list (id→{location, color{r,g,b}}) onto the Shape, keyed by the
   gradient owner id, so the evaluator can override a specific stop's colour.
4. **evaluator/color-links.ts** — add a `gradientStops: Map<ownerId, Map<tagId,{r,g,b}>>`
   bucket to `ColorLinkResult`; in `walkColorLinks`, for `kind==='gradientTag'` write
   `evalLinkChannel(...)` into `gradientStops[ownerId][tagId][channel]` (0..1 float).
5. **compositor** shape-fill gradient rasteriser — when rendering a shape whose fill is a
   gradient, apply any `gradientStops` overrides to the matching stop before building the
   colour ramp. (If shapes currently render gradient fills as a flat colour, that flat path
   is the first thing to upgrade — check compositor/index.ts renderDrawableLayer shape branch.)
6. **Verify** vs GUI GT: `fct probe Stylized__Loop` / `Stylized__Heart` / `Stylized__Slide_In`;
   gate `fct regress engine`. Expect movement on Loop (12.92) / Heart (13.49) / Slide_In (10.25).

## No-hardcode note

Detection is purely the structural path shape (segment ids 104/1/·/3/{1,2,3}) + node types —
never keyed on transition name. The tagId + gradientOwnerId are resolved from the scene graph
per-file. Fires on ≥2 built-ins (Loop + Heart + Slide_In), satisfying no-hardcode.test.ts.
