# Poke

- **PAE class:** `Poke`
- **Plugin UUID:** `70471B0A-5D9D-4699-AEEE-CCFC84045B4B`
- **Node names in corpus:** Poke (127), Poke 2 (60), Poke 1 (59), CP2 (13), CP1 (13), Poke copy (7)
- **Corpus usage:** 177 files, 397 instances

## What it does

Poke pushes the image outward from a center point as if a finger poked the surface: pixels within the effect are displaced radially, scaled by Scale, over a region set by Radius, sampling the source at the poked coordinate. The HgcPoke shader is a per-pixel inverse radial remap (normalize position, scale by distance, resample). The shader is checked in.

> **Note.** HgcPoke shader is checked in (evidence/shaders/HgcPoke.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the poke (X,Y) in normalized frame coordinates. Often keyframed to drive the poke around the frame. *(keyframed in 50 instances)* |
| Scale | float | 0.5 | 0 .. 1 | Strength of the radial push, 0-1. 0 = no distortion. *(keyframed in 116 instances)* |
| Radius | float (pixels) | 300 | 0 .. 1000 | Radius of the affected region in pixels (default 300). *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the poked result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcPoke` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcPoke.metal` (Phase-1 done, Phase-2 open).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPoke`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPoke` → [`HgcPoke.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPoke.metal)

```metal
//Metal1.0     
//LEN=0000000533
[[ visible ]] FragmentOut HgcPoke_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-9.999999747e-06, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.x = dot(r0.xyw, hg_Params[1].xyz);
    r1.y = dot(r0.xyw, hg_Params[2].xyz);
    r2.x = dot(r0.xyw, hg_Params[3].xyz);
    r3.x = fmin(c0.x, r2.x);
    r4.x = fmax(-c0.x, r2.x);
    r4.x = select(r4.x, r3.x, r2.x < 0.00000f);
    r0.xy = r1.xy/r4.xx;
    r0.xy = r0.xy - hg_Params[0].xy;
    r2.x = dot(r0.xy, r0.xy);
    r2.x = sqrt(r2.x);
    r2.x = fmax(r2.x, -c0.x);
    r2.x = r2.x*hg_Params[0].z;
    r2.xy = rsqrt(r2.xx);
    r0.xy = r0.xy*r2.xy + hg_Params[0].xy;
    r3.x = dot(r0.xyw, hg_Params[4].xyz);
    r3.y = dot(r0.xyw, hg_Params[5].xyz);
    r0.x = dot(r0.xyw, hg_Params[6].xyz);
    r1.x = fmin(c0.x, r0.x);
    r4.x = fmax(-c0.x, r0.x);
    r0.x = select(r4.x, r1.x, r0.x < 0.00000f);
    r3.xy = r3.xy/r0.xx;
    r3.xy = mix(texCoord0.xy, r3.xy, hg_Params[0].ww);
    r3.xy = r3.xy + hg_Params[7].xy;
    r3.xy = r3.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEPoke canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPoke`

```asm
00000000000fc7c4	mov	w4, #0x1
00000000000fc7c8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000fc7cc	mov	x8, #0xc00000000000
00000000000fc7d0	movk	x8, #0x4072, lsl #48
00000000000fc7d4	str	x8, [sp, #0x18]
00000000000fc7d8	ldr	x4, [x22]
00000000000fc7dc	add	x2, sp, #0x18
00000000000fc7e0	mov	x0, x23
00000000000fc7e4	mov	w3, #0x2
00000000000fc7e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fc7ec	ldr	d0, [sp, #0x18]
00000000000fc7f0	adrp	x8, 365 ; 0x269000
00000000000fc7f4	ldr	d1, [x8, #0x4b8]
00000000000fc7f8	fcmp	d0, d1
00000000000fc7fc	fcsel	d0, d1, d0, mi
00000000000fc800	str	d0, [sp, #0x18]
00000000000fc804	mov	x8, #0x3fe0000000000000
00000000000fc808	str	x8, [sp, #0x10]
00000000000fc80c	ldr	x4, [x22]
00000000000fc810	add	x2, sp, #0x10
00000000000fc814	mov	x0, x23
00000000000fc818	mov	w3, #0x3
00000000000fc81c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fc820	ldr	x2, [x22]
00000000000fc824	mov	x0, x20
00000000000fc828	bl	"_objc_msgSend$getRenderMode:"
00000000000fc82c	mov	x22, x0
00000000000fc830	mov	x8, sp
00000000000fc834	add	x2, sp, #0x20
00000000000fc838	mov	x0, x20
00000000000fc83c	mov	x3, x21
00000000000fc840	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000fc844	ldr	q0, [sp]
00000000000fc848	str	q0, [sp, #0x20]
00000000000fc84c	cbz	w22, 0xfc940
00000000000fc850	mov	x0, x21
00000000000fc854	bl	_objc_msgSend$imageType
00000000000fc858	cmp	x0, #0x3
00000000000fc85c	b.ne	0xfc940
00000000000fc860	mov	w0, #0x2a0
00000000000fc864	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000fc868	mov	x20, x0
00000000000fc86c	bl	__ZN5HPokeC2Ev
00000000000fc870	ldp	d0, d1, [sp, #0x20]
00000000000fc874	fcvt	s0, d0
00000000000fc878	fcvt	s1, d1
00000000000fc87c	ldr	d2, [sp, #0x18]
00000000000fc880	fmov	d3, #1.00000000
00000000000fc884	fdiv	d2, d3, d2
00000000000fc888	fcvt	s2, d2
00000000000fc88c	ldr	d3, [sp, #0x10]
00000000000fc890	fcvt	s3, d3
00000000000fc894	ldr	x8, [x20]
00000000000fc898	ldr	x8, [x8, #0x60]
00000000000fc89c	mov	x0, x20
00000000000fc8a0	mov	w1, #0x0
00000000000fc8a4	blr	x8
00000000000fc8a8	add	x1, sp, #0x30
00000000000fc8ac	mov	x0, x20
00000000000fc8b0	bl	__ZN5HPoke17setPixelTransformERK14PCMatrix44TmplIdE
00000000000fc8b4	cbz	x21, 0xfc8dc
00000000000fc8b8	mov	x8, sp
00000000000fc8bc	mov	x0, x21
00000000000fc8c0	bl	_objc_msgSend$heliumRef
00000000000fc8c4	ldr	x21, [sp]
00000000000fc8c8	cbz	x21, 0xfc8dc
00000000000fc8cc	ldr	x8, [x21]
00000000000fc8d0	ldr	x8, [x8, #0x18]
00000000000fc8d4	mov	x0, x21
00000000000fc8d8	blr	x8
00000000000fc8dc	ldr	x8, [x20]
00000000000fc8e0	ldr	x8, [x8, #0x78]
00000000000fc8e4	mov	x0, x20
00000000000fc8e8	mov	w1, #0x0
00000000000fc8ec	mov	x2, x21
00000000000fc8f0	blr	x8
00000000000fc8f4	str	x20, [sp]
00000000000fc8f8	ldr	x8, [x20]
00000000000fc8fc	ldr	x8, [x8, #0x10]
00000000000fc900	mov	x0, x20
00000000000fc904	blr	x8
00000000000fc908	mov	x2, sp
00000000000fc90c	mov	x0, x19
00000000000fc910	bl	"_objc_msgSend$setHeliumRef:"
00000000000fc914	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
    parm3 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
