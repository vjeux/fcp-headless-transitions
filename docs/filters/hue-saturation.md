# Hue/Saturation

- **PAE class:** `Hue/Saturation`
- **Plugin UUID:** `D23AF030-B0BF-44DF-B622-7C9EA0DF5744`
- **Node names in corpus:** Hue/Saturation (1516), Hue/Saturation Source (31), Hue/Saturation copy (28), hs (13), HSV Adjust copy (9), HS (8)
- **Corpus usage:** 827 files, 1620 instances

## What it does

Hue/Saturation (PAEHSVAdjust) converts each pixel to HSV, rotates its hue, scales its saturation and value, then converts back. It is the standard tool for shifting color casts, boosting/killing saturation, or driving animated color cycles. The engine implements it as a branchless in-place RGB<->HSV round-trip matching FCP's shader.

> **Note.** RE finding: FCP's `Hue` param is authored in DEGREES internally (fed to the shader as `hue/360` turns); the corpus stores it in RADIANS (0..2pi). `Saturation` is 0-centered (0 = unchanged, -1 = grayscale). `Value` and `Saturation` are both MULTIPLIERS in FCP, not additive offsets.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Hue | float (radians) | 0 | 0 .. 6.283 | Hue rotation around the color wheel. Stored 0..2pi (pi = 180 deg). 0 = no shift. Rotates every pixel's hue by this angle. *(keyframed in 5 instances)* |
| Saturation | float | 0 | -1 .. 3 | Saturation adjustment, 0-centered: 0 = unchanged, -1 = fully desaturated (grayscale), positive = more saturated (up to +3 observed). *(keyframed in 71 instances)* |
| Value | float | 1 | 0 .. 2 | Brightness/value multiplier: 1 = unchanged, 0 = black, up to 2 = doubled. Continuous float. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the adjusted result over the original, 0-1 continuous. Often keyframed to animate color shifts. *(keyframed in 281 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/hue-saturation.ts`](../../engine/src/compositor/filters/hue-saturation.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSaturation`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSaturation` → [`HgcSaturation.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSaturation.metal)

```metal
//Metal1.0     
//LEN=0000000217
[[ visible ]] FragmentOut HgcSaturation_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.2125000060, 0.7153999805, 0.07209999859, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xyz = float3(dot(r0.xyz, c0.xyz));
    r0.xyz = clamp(mix(r1.xyz, r0.xyz, hg_Params[0].xyz), 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAESaturation canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESaturation`

```asm
0000000000089278	mov	w3, #0x1
000000000008927c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000089280	ldr	x2, [x20]
0000000000089284	mov	x0, x22
0000000000089288	bl	"_objc_msgSend$getRenderMode:"
000000000008928c	ldr	d0, [sp, #0x18]
0000000000089290	fmov	d1, #1.00000000
0000000000089294	fadd	d0, d0, d1
0000000000089298	movi.2d	v1, #0000000000000000
000000000008929c	fmaxnm	d0, d0, d1
00000000000892a0	str	d0, [sp, #0x18]
00000000000892a4	cmp	w0, #0x0
00000000000892a8	ccmp	w24, #0x3, #0x0, ne
00000000000892ac	cset	w20, eq
00000000000892b0	b.ne	0x8935c
00000000000892b4	cbz	x21, 0x892d0
00000000000892b8	add	x8, sp, #0x10
00000000000892bc	mov	x0, x21
00000000000892c0	bl	_objc_msgSend$heliumRef
00000000000892c4	b	0x892d4
00000000000892c8	mov	w20, #0x0
00000000000892cc	b	0x8935c
00000000000892d0	str	xzr, [sp, #0x10]
00000000000892d4	mov	w0, #0x1a0
00000000000892d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000892dc	mov	x21, x0
00000000000892e0	bl	__ZN13HgcSaturationC1Ev
00000000000892e4	str	x21, [sp, #0x8]
00000000000892e8	ldr	x2, [sp, #0x10]
00000000000892ec	ldr	x8, [x21]
00000000000892f0	ldr	x8, [x8, #0x78]
00000000000892f4	mov	x0, x21
00000000000892f8	mov	w1, #0x0
00000000000892fc	blr	x8
0000000000089300	ldr	d0, [sp, #0x18]
0000000000089304	fcvt	s0, d0
0000000000089308	ldr	x8, [x21]
000000000008930c	ldr	x8, [x8, #0x60]
0000000000089310	movi.2d	v1, #0000000000000000
0000000000089314	movi.2d	v2, #0000000000000000
0000000000089318	movi.2d	v3, #0000000000000000
000000000008931c	mov	x0, x21
0000000000089320	mov	w1, #0x0
0000000000089324	blr	x8
0000000000089328	add	x2, sp, #0x8
000000000008932c	mov	x0, x19
0000000000089330	bl	"_objc_msgSend$setHeliumRef:"
0000000000089334	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm1 (float)
```
