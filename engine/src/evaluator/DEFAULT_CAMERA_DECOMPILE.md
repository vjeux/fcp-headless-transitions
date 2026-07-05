# Default Camera (camera-less 3D scene) — Ozone.framework decompilation

## Question
When a Motion `.motr` scene contains a 3D transition (layers with Z / 3D rotation)
but **no explicit `<scenenode ... factoryID="12">` Camera node** (e.g.
`Movements/Fall`), what camera framing does Motion use to project the scene?

The prior camera work (merged: AOV → gluPerspective, distance = (H/2)/tan(AOV/2))
covers scenes that DO have a Camera node. This documents the camera-LESS default.

## Binary
`/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Ozone`
(Apple Silicon, arm64). Disassembled with `otool -tV`.

## Evidence 1 — no synthetic default camera is created

`OZScene::getActiveCamera(CMTime)` @ **0x65cb4** iterates the scene's OZCamera
nodes (`begin_t<OZCamera>` at 0x65ce4). The result register is x19. When the scene
has **no OZCamera node**, the iteration falls through to:

```
0000000000065f64  mov  w19, #0x0      ; return value = NULL
...
0000000000065f40  mov  x0, x19
0000000000065f60  ret
```

i.e. `getActiveCamera` **returns NULL** for a camera-less scene. No default/fallback
camera object is synthesized on the render path.

## Evidence 2 — a null camera renders orthographically

`-[OZViewer viewIsOrthographic]` @ **0x37420**:

```
0000000000037420  sub   sp, sp, #0x30
0000000000037430  cbz   x0, 0x37444        ; null viewer/camera -> zero the camera slot
0000000000037438  bl    _objc_msgSend$getCamera
...
0000000000037444  mov   x19, #0x0          ; null-camera branch: camera = 0
0000000000037448  stp   xzr, xzr, [sp]
...
0000000000037458  ldr   x8, [x19]          ; vtable of (possibly null) camera
000000000003745c  ldr   x8, [x8, #0x1f8]   ; -> getAngleOfView()
0000000000037464  blr   x8                 ; d0 = angleOfView   (0 for null camera)
0000000000037468  fabs  d0, d0             ; |angleOfView|
000000000003746c  mov   x8, #0xaf48        ; \
0000000000037470  movk  x8, #0x9abc, lsl 16 ;  } assemble the double
0000000000037474  movk  x8, #0xd7f2, lsl 32 ;  } 0x3e7ad7f29abcaf48
0000000000037478  movk  x8, #0x3e7a, lsl 48 ; /  == 1.0e-7 exactly
000000000003747c  fmov  d1, x8
0000000000037480  fcmp  d0, d1
0000000000037484  cset  w0, mi             ; return (|AOV| < 1e-7)
0000000000037494  ret
```

`0x3e7ad7f29abcaf48` decoded as an IEEE-754 double is **1.0e-7** exactly.

So: a null / AOV≈0 camera makes `viewIsOrthographic` return **true**, and Motion
projects the scene with a **parallel (orthographic) projection** — no perspective
foreshortening.

## Conclusion
A camera-less 3D transition is framed **orthographically**: every world-Z projects
at scale 1 (equivalently camera distance → ∞). No perspective divide is applied.

## Implementation
`resolveCamera()` (src/evaluator/index.ts) returns
`{ angleOfView: 0, distance: Infinity }` when no Camera node is present.
`projectPoint()` (src/compositor/perspective.ts) short-circuits to `[x, y, 1]`
(scale 1) when `cameraZ` is not finite.

## Empirical validation (headless FCP GT, Movements/Fall, 24 frames)
Fall PSNR rises **monotonically** with the assumed camera distance, with no
interior perspective optimum — exactly the signature of a true orthographic scene:

| assumed camera distance | mean PSNR |
|-------------------------|-----------|
| 1303                    | 17.45 dB  |
| 2000 (old hardcoded)    | 18.48 dB  |
| ∞ (orthographic)        | **20.61 dB** |
