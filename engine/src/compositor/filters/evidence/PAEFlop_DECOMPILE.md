# PAEFlop decompilation report (agent n2) — Movements/Flip

Binary: `Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters` (arm64 slice @ file 0x66c000). Tools: `nm`, `otool -arch arm64 -tV`, custom Mach-O `__TEXT,__const` reader. UUID `2FF8887B-E673-4727-9601-1B3353531C10`.

## Symbols (verbatim from `nm -arch arm64`)
```
0002d5f4 t -[PAEFlop addParameters]
0002d6e0 t -[PAEFlop canThrowRenderOutput:withInput:withInfo:]
0002da40 t -[PAEFlop frameSetup:inputInfo:hardware:software:]
```

## Parameters (`-[PAEFlop addParameters]` @ 0x2d5f4)
Adds exactly ONE popup menu via `addPopupMenuWithName:parmId:defaultValue:menuEntries:parmFlags:`
with `parmId=1` (w3=#1), default 0 (w4=#0). This is the **"Flop"** menu (3 entries).
`Mix`(10001)/`Flip`(10002)/`Input Points`(10003) come from `PAESharedDefaultBase`, not here.
Flip.motr sets **Flop=0, Mix=1, Flip=0, Input Points=1**.

## The filter is a MIRROR, not the flip motion (`canThrowRenderOutput` @ 0x2d6e0)
Traced 0x2d6e0–0x2d8dc:
1. `getPixelTransformForImage:` → x29-0xb0 (pixelXform, 4x4 double).
2. `getInversePixelTransformForImage:` → sp+0x190 (invPixelXform).
3. `getIntValue:fromParm:atFxTime:` parmId `#1` → `w23` = **Flop** (`cmp w23,#3; b.hs` ⇒ 0..2).
4. `mov w8,#6 ; lsr w8,w8,w23` ⇒ `mask = 6 >> Flop`.
5. Build 4x4 at sp+0x100 = identity (diag 1.0 at 0x100/0x128/0x150/0x178; zeros elsewhere).
6. `tbnz w23,#0x0, +block1` — if Flop bit0==0 (EVEN) run block1:
   `ldr q1,[0x2697e0]=( -1.0, -0.0 ); stp q1,q0,[sp+0x100]` ⇒ **m[0] = -1.0**.
7. `tbz w8,#0x0, +block2` — if (6>>Flop) bit0==1 run block2:
   `ldr q0,[0x2697f0]=( -0.0, -1.0 ); stp q0,..,[sp+0x120]` ⇒ **m[5] = -1.0**.
8. `PCMatrix44::operator* (pixelXform, FlipMatrix) → sp`; then `(that, invPixelXform) → sp+0x80`.
9. `FxSupport::makeHeliumXForm( sp+0x80, node, ... )` → `setHeliumRef:`.

### Decoded diagonal per Flop value (verified in evidence/PAEFlop.disasm.txt)
```
Flop=0 : 6>>0=6 (bit0=0) → block1 only → diag(-1, 1, 1, 1)  = mirror X (HORIZONTAL)
Flop=1 : 6>>1=3 (bit0=1) → block2 only → diag( 1,-1, 1, 1)  = mirror Y (VERTICAL)
Flop=2 : 6>>2=1 (bit0=1) → both        → diag(-1,-1, 1, 1)  = 180° (both)
```
Composition `pixelXform · Flip · invPixelXform` centres the mirror on the image.
The two `__TEXT,__const` vectors decode (little-endian doubles):
`0x2697e0 = (-1.0, -0.0)`, `0x2697f0 = (-0.0, -1.0)`.

**Conclusion:** PAEFlop is purely a centred axis mirror. Flip.motr uses **Flop=0 = horizontal
mirror**, applied to the BACK page (Transition B) so its reverse reads correctly once the page
has rotated past edge-on. `frameSetup` merely forwards to `overrideFrameSetupForRenderMode:`.

## Where the page-flip MOTION comes from (Flip.motr rig, not the filter)
- Group (id 987260501, parent of Transition A + Transition B) carries a scene Ramp on **Rotation Y
  0→π**, curvature 0 ⇒ **LINEAR** (evaluator confirmed: 45°@p=.25, 90°@.5, 180°@1; group world
  transform is a pure Y-rotation, no translation/Z).
- Transition A (front, Type=1, src=A) is visible first half; Transition B (back, Type=2, src=B) has
  the PAEFlop filter + its own Rotation-Z rig (snapshots 0,0,π,π).

## Reproduced geometry (verified against headless GT, engine/test/start.png→end.png, 24f)
- A SINGLE page rotates about its **centre vertical (Y) axis** by θ=π·p. GT column-height profiles:
  θ=31° → left edge enlarges past the left border (near, −Z), right edge recedes to screen x≈0.84
  (far, +Z); θ≈90° → sliver at screen centre. Sign: `z' = x·sinθ` (left x<0 → −Z forward). This
  sign beats its mirror in eng-vs-GT PSNR.
- The **headless reference resolves BOTH drop-zone pages to source A** (confirmed by rendering with
  distinct solid red/blue: the whole flip stays RED — source B never appears; the media-ref hook
  hands source A to the first element and B is never distinctly requested). So the same media renders
  throughout; past edge-on (θ>90°) the reverse faces the camera and PAEFlop's horizontal mirror is
  reproduced by reversing the quad UV (mirrorUV).
- Perspective is weak: the far-edge screen positions across θ=15.7°→78.3° fit a camera ≈7000 units
  back (vs the 2000 scene default); PSNR is flat for any camera ≥~6000 (near-orthographic).

## Result
Movements/Flip mean PSNR (24 frames): **12.50 → 15.71 dB** (+3.21). Frame 0 (face-on) = 50 dB.
Remaining gap: inside-page (masked) PSNR caps ~12–14 dB with a ~36px horizontal pivot offset and a
residual perspective-warp shape — matching Motion's exact 3D compositor projection would be needed
to close it; the PAEFlop mirror math and the centre-axis flip geometry themselves are exact.
