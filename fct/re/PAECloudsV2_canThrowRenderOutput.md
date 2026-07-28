# PAECloudsV2 render decode — `-[PAECloudsV2 canThrowRenderOutput:withInfo:]`

Binary: `.../Filters.bundle/Contents/MacOS/Filters` (arm64 slice). Method @ **0x51b48**.
`addParameters` @ **0x517c8**. This is the CPU setup that builds the HgcClouds render graph;
its uniforms are exactly the "hg_Params" the HgcClouds.metal shader consumes. Decoded 2026-07-28
to REPLACE the failed brute-force fBm fit (corr capped 0.27 = decode-don't-fit trap).

## Parameter map (from addParameters CFStrings + getFloatValue:fromParm: indices)
- parm **1** = `Clouds::XSize`  (Horizontal Scale)
- parm **2** = `Clouds::YSize`  (Vertical Scale)
- parm **3** = `Clouds::Speed`
- parm **4** = `Clouds::Gradient`  → `getGradientSamples:numSamples:256 depth:4` → 256×RGBA8 LUT bitmap (HGFormat 0x1d), 256×1 rect via HGRectMake4i(0,0,0x100,1)
- parm **5** = `Clouds::Method` (INT, getIntValue → w26) with `Clouds::MethodChoices` popup
- parm **6** = `Clouds::Position` (getXValue:YValue: → cx@0x398, cy@0x390)
- parm **7,8,9,10** = `Clouds::Strength1..4`  (into 0x388/0x380/0x378/0x370)

## Coordinate setup (@0x51d94–0x51e08)
- `s9` = pixelTransform.y (getPixelTransformForImage), `d8` initially pixelTransform.x-derived.
- `d8  = width  / pixelTransform.x`
- `d13 = height / |pixelTransform.y|`   (fabs s9)
- centerX' = (cx − 0.5) · d8      ; centerY' = −((cy − 0.5) · d13)
- scaleX = parm1 · **0.03125** (=1/32, const 0x3fa0000000000000)   ; scaleY = parm2 · 0.03125
- final X offset (→0x398) = centerX' · scaleX ; final Y offset (→0x390) = centerY' · scaleY
  (These feed the HgcClouds vertex/texcoord transform via hglMultMatrixd; see 0x51fc0–0x52044.)

## HgcClouds node (@0x51ecc; size 0x1f0) + HGGLNode child (size 0x1b0)
- vtable installed = (adrp 0x39b000 + 0x650 + 0x10). Fragment shader added via HGGLNode::addFragmentShader.
- texture wrap: hglTexParameteri(0x84f5, 0x2801)  [0x84f5=GL_TEXTURE_WRAP? 0x2801=GL_TEXTURE_MIN_FILTER? verify].

## UNIFORMS via HGNode::SetParameter (vtable *0x60)  — the hg_Params
- **SetParameter(0, s0, s1, 0, 0)** @0x52048–0x52078:
  `s0 = (Method==1) ? 1.0 : 0.5` ; `s1 = (Method==1) ? 0.0 : 0.5`.
  → hg_Params[0] = (contrast, brightness) is an EXACT pair keyed on Method:
    Method==1 → (1.0, 0.0) ; else → (0.5, 0.5).   [NOTE the (s0,s1) order: s0 first arg.]
  This is why the fit's (0.2,0.22) was wrong — these are exact binary constants.
- **SetParameter(1, s7, s8, s9, s10)** @0x5207c–0x520ac:
  the four floats parm7..10 (Strength1..4) = hg_Params[1] fBm octave weights (NOT fixed 1/.5/.25/.125).
- Animation: d14 = 3.0 / timelineFps (Speed term), from versionAtCreation + timelineFpsNumerator/Denominator.

## Gradient opacity fast-path (@0x51fc0–0x52044)
- reads 0x3c0 (=d2) and 0x3e8 (=d0). If ==1.0 skip; else scales an 8-vec by them (Opacity1/Opacity2)
  and applies hglMultMatrixd. Both 1.0 in the common case (identity).

## Shader core (already decoded in compositor/filters/clouds.ts)
HgcClouds.metal: 4-octave |fBm| turbulence → dot(hg_Params[1] octave weights) →
  ×hg_Params[0].contrast + hg_Params[0].brightness → |·|×256 → index 256 gradient LUT → premult.

## TO WIRE INTO THE ENGINE
1. Parse Clouds node params 1..10 from the .motr (XSize,YSize,Speed,Gradient(256 LUT),Method,Position,Strength1..4).
2. Coord transform: cell scale = param×(1/32), aspect via width/pixelTransform, center = (pos−0.5)·dim.
3. hg_Params[0] = Method==1 ? (1.0,0.0) : (0.5,0.5).  hg_Params[1] = (Str1,Str2,Str3,Str4).
4. Evaluate HgcClouds turbulence (clouds.ts core) per pixel, index the 256 gradient LUT, premult.
5. AUTHORITATIVE GT: `fct/clouds_gt_render.py` renders the REAL plugin headless via ozengine —
   diff engine output against it (NOT against a hand-fit).

## Open items
- Exact meaning of the `×(1/32)` vs the shader's internal frequency (does the shader multiply again?).
- Verify hglTexParameteri enum values; confirm octave doubling direction in HgcClouds.metal.
- The solo GT for host Close_and_Open renders mean 3.4 (near-black) but smooth — host-param dependent;
  Light_Sweep's frame is bright gray. Always GT-render the SPECIFIC host's params.
