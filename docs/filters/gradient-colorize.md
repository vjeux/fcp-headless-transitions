# Gradient Colorize

- **PAE class:** `Gradient Colorize`
- **Plugin UUID:** `FB917FD2-68DF-4BE7-A313-82124F6DE776`
- **Node names in corpus:** Gradient Colorize (31), Gradient Colorize copy (4), Gradient Colorize left (1), Gradient Colorize right (1), flagWave_h (1), flagWave (1)
- **Corpus usage:** 26 files, 41 instances

## What it does

Gradient Colorize is a gradient-map: it computes each pixel's luminance and looks that value up in a user-defined color gradient, replacing the pixel color while keeping its brightness structure. Offset scrolls the lookup position along the gradient and Repeats tiles the gradient multiple times across the tonal range (with a Repeat Method for how the ends wrap). The verbatim HgcGradientColorize shader confirms: dot(rgb, luma-weights) -> scale/offset -> fract/repeat -> sample the gradient texture -> optional saturation mix.

> **Note.** Shader-only. The verbatim HgcGradientColorize Metal shader is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Gradient | group | - | - | The color gradient the image's luminance is mapped through (color stops + positions). *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the colorized result over the original, 0-1 continuous. NOT a boolean (shader mixes via hg_Params[7]). *(keyframed in 3 instances)* |
| Offset | float | 0 | 0 .. 28.27 | Scrolls the luminance-to-gradient lookup position; animate for a sweeping color shift. ~0-28. |
| Repeats | float | 1 | 1 .. 20 | How many times the gradient tiles across the tonal range, ~1-20 (default 1). |
| Repeat Method | enum | 1 | 0 .. 1 | How the gradient ends wrap when Repeats>1 (repeat vs mirror). |
| Map Channel | enum | 0 | 0 .. 0 | Which channel drives the lookup (luminance by default). |
| Saturation | float | 1 | 1 .. 1 | Blend between the mapped color and its desaturated luma, 0-1 (shader hg_Params[4]). NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcGradientColorize` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcGradientColorize.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGradientColorize`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGradientColorize` → [`HgcGradientColorize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGradientColorize.metal)

```metal
//Metal1.0     
//LEN=00000006a4
[[ visible ]] FragmentOut HgcGradientColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.9999899864, 0.5000000000, -2.000000000, 1.000000000);
    const float4 c1 = float4(0.000000000, 0.2989999950, 0.5870000124, 0.1140000001);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.x = dot(r1, hg_Params[0]);
    r1.x = c0.x - r1.x;
    r1.x = r1.x*hg_Params[1].x + hg_Params[1].y;
    r1.y = r1.x*c0.y;
    r1.y = fract(r1.y);
    r1.z = -r1.y + c0.y;
    r1.z = fabs(r1.z)*c0.z + c0.w;
    r1.y = select(r1.z, r1.x, hg_Params[2].x < 0.00000f);
    r1.z = fract(r1.x);
    r1.x = abs(r1.x);
    r1.xz = float2(-r1.xz >= c1.xx);
    r1.y = fract(r1.y);
    r1.y = r1.y + r1.z;
    r1.x = r1.y - r1.x;
    r1.x = r1.x*hg_Params[3].x;
    r1.x = fmin(r1.x, hg_Params[3].y);
    r1.x = fmax(r1.x, c1.x);
    r1.x = floor(r1.x);
    r1.y = c0.y;
    r1.x = r1.x + c0.y;
    r1.xy = r1.xy + hg_Params[8].xy;
    r1.xy = r1.xy*hg_Params[8].zw;
    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    r2.x = dot(r1.xyz, c1.yzw);
    r2 = clamp(mix(r2.xxxx, r1, hg_Params[4]), 0.00000f, 1.00000f);
    r2 = select(r1, r2, -hg_Params[6].xxxx < 0.00000f);
    r1.w = dot(r2, hg_Params[5]);
    r1.xyz = mix(r1.www, r2.yzw, hg_Params[4].yzw);
    r2 = r2.yzwx*r0.wwww + -r0;
    r1.xyz = r1.xyz*r0.www;
    r1.w = r0.w;
    r1 = mix(r0, r1, hg_Params[7].xxxx);
    r0 = r2*hg_Params[7].xxxx + r0;
    output.color0 = select(r1, r0, -fabs(hg_Params[6].xxxx) < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGradientColorize canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGradientColorize`

```asm
000000000001a7f8	mov	w3, #0x1c
000000000001a7fc	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
000000000001a800	ldr	x2, [x19, #0x50]
000000000001a804	ldr	x6, [x24]
000000000001a808	mov	x0, x27
000000000001a80c	mov	w3, #0x100
000000000001a810	mov	w4, #0x4
000000000001a814	mov	w5, #0xbad
000000000001a818	bl	"_objc_msgSend$getGradientSamples:numSamples:depth:fromParm:atFxTime:"
000000000001a81c	ldr	x4, [x24]
000000000001a820	add	x2, sp, #0x38
000000000001a824	mov	x0, x25
000000000001a828	mov	w3, #0x2
000000000001a82c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001a830	ldr	d0, [sp, #0x38]
000000000001a834	adrp	x8, 590 ; 0x268000
000000000001a838	ldr	d1, [x8, #0xd48]
000000000001a83c	fdiv	d0, d0, d1
000000000001a840	str	d0, [sp, #0x38]
000000000001a844	ldr	x4, [x24]
000000000001a848	add	x2, sp, #0x30
000000000001a84c	mov	x0, x25
000000000001a850	mov	w3, #0x3
000000000001a854	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001a858	ldr	x4, [x24]
000000000001a85c	add	x2, sp, #0x2c
000000000001a860	mov	x0, x25
000000000001a864	mov	w3, #0x4
000000000001a868	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001a86c	ldr	x4, [x24]
000000000001a870	add	x2, sp, #0x28
000000000001a874	mov	x0, x25
000000000001a878	mov	w3, #0x5
000000000001a87c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001a880	ldr	x4, [x24]
000000000001a884	add	x2, sp, #0x20
000000000001a888	mov	x0, x25
000000000001a88c	mov	w3, #0x6
000000000001a890	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001a894	ldr	x2, [x24]
000000000001a898	mov	x0, x25
000000000001a89c	bl	"_objc_msgSend$mixAmountAtTime:"
000000000001a8a0	mov.16b	v8, v0
000000000001a8a4	ldr	x2, [x24]
000000000001a8a8	mov	x0, x26
000000000001a8ac	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000001a8b0	bl	_objc_msgSend$matrix
000000000001a8b4	mov	x25, x0
000000000001a8b8	ldr	w8, [sp, #0x28]
000000000001a8bc	cmp	w8, #0x1
000000000001a8c0	b.le	0x1a8e8
000000000001a8c4	cmp	w8, #0x2
000000000001a8c8	b.eq	0x1a928
000000000001a8cc	cmp	w8, #0x3
000000000001a8d0	b.eq	0x1a938
000000000001a8d4	cmp	w8, #0x4
000000000001a8d8	b.ne	0x1a904
000000000001a8dc	movi.2d	v10, #0000000000000000
000000000001a8e0	fmov	s9, #1.00000000
000000000001a8e4	b	0x1a940
000000000001a8e8	movi.2d	v9, #0000000000000000
000000000001a8ec	cbz	w8, 0x1a94c
000000000001a8f0	fmov	s12, #1.00000000
000000000001a8f4	movi.2d	v10, #0000000000000000
000000000001a8f8	movi.2d	v11, #0000000000000000
000000000001a8fc	cmp	w8, #0x1
000000000001a900	b.eq	0x1a960
000000000001a904	adrp	x0, 625 ; 0x28b000
000000000001a908	add	x0, x0, #0x594 ; literal pool for: "-[PAEGradientColorize canThrowRenderOutput:withInput:withInfo:]"
000000000001a90c	adrp	x1, 625 ; 0x28b000
000000000001a910	add	x1, x1, #0x5d4 ; literal pool for: "PAEGradientColorize.mm"
000000000001a914	adrp	x3, 625 ; 0x28b000
000000000001a918	add	x3, x3, #0x5eb ; literal pool for: "false"
000000000001a91c	mov	w2, #0x103
000000000001a920	bl	0x251fcc ; symbol stub for: ___assert_rtn
000000000001a924	brk	#0x1
000000000001a928	fmov	s11, #1.00000000
000000000001a92c	movi.2d	v9, #0000000000000000
000000000001a930	movi.2d	v10, #0000000000000000
000000000001a934	b	0x1a944
000000000001a938	fmov	s10, #1.00000000
000000000001a93c	movi.2d	v9, #0000000000000000
000000000001a940	movi.2d	v11, #0000000000000000
000000000001a944	movi.2d	v12, #0000000000000000
000000000001a948	b	0x1a960
000000000001a94c	ldp	d0, d1, [x25]
000000000001a950	fcvt	s12, d0
000000000001a954	fcvt	s11, d1
000000000001a958	ldr	d0, [x25, #0x10]
000000000001a95c	fcvt	s10, d0
000000000001a960	ldp	d14, d13, [sp, #0x30]
000000000001a964	ldr	x2, [x24]
000000000001a968	mov	x0, x23
000000000001a96c	bl	"_objc_msgSend$getRenderMode:"
000000000001a970	cbz	w0, 0x1a998
000000000001a974	mov	x0, x22
000000000001a978	bl	_objc_msgSend$imageType
000000000001a97c	cmp	x0, #0x3
000000000001a980	b.ne	0x1a998
000000000001a984	cbz	x22, 0x1a9a0
000000000001a988	add	x8, sp, #0x18
000000000001a98c	mov	x0, x22
000000000001a990	bl	_objc_msgSend$heliumRef
000000000001a994	b	0x1a9a4
000000000001a998	mov	w20, #0x0
000000000001a99c	b	0x1abc4
000000000001a9a0	str	xzr, [sp, #0x18]
000000000001a9a4	mov	w0, #0x1a0
000000000001a9a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001a9ac	mov	x22, x0
000000000001a9b0	bl	__ZN17HGradientColorizeC1Ev
000000000001a9b4	ldr	x8, [x22]
000000000001a9b8	ldr	x8, [x8, #0x60]
000000000001a9bc	mov	x0, x22
000000000001a9c0	mov	w1, #0x0
000000000001a9c4	mov.16b	v0, v12
000000000001a9c8	mov.16b	v1, v11
000000000001a9cc	mov.16b	v2, v10
000000000001a9d0	mov.16b	v3, v9
000000000001a9d4	blr	x8
000000000001a9d8	fcvt	s0, d14
000000000001a9dc	fcvt	d1, s0
000000000001a9e0	fmul	d1, d13, d1
000000000001a9e4	fcvt	s1, d1
000000000001a9e8	ldr	x8, [x22]
000000000001a9ec	ldr	x8, [x8, #0x60]
000000000001a9f0	movi.2d	v2, #0000000000000000
000000000001a9f4	movi.2d	v3, #0000000000000000
000000000001a9f8	mov	x0, x22
000000000001a9fc	mov	w1, #0x1
000000000001aa00	blr	x8
000000000001aa04	fcvt	s0, d8
000000000001aa08	ldr	x8, [x22]
000000000001aa0c	ldr	x8, [x8, #0x60]
000000000001aa10	movi.2d	v1, #0000000000000000
000000000001aa14	movi.2d	v2, #0000000000000000
000000000001aa18	movi.2d	v3, #0000000000000000
000000000001aa1c	mov	x0, x22
000000000001aa20	mov	w1, #0x7
000000000001aa24	blr	x8
000000000001aa28	ldr	w8, [sp, #0x2c]
000000000001aa2c	ldr	x9, [x22]
000000000001aa30	ldr	x9, [x9, #0x60]
000000000001aa34	cmp	w8, #0x0
000000000001aa38	fmov	s0, #1.00000000
000000000001aa3c	fmov	s1, #-1.00000000
000000000001aa40	fcsel	s0, s1, s0, eq
000000000001aa44	mov	x0, x22
000000000001aa48	mov	w1, #0x2
000000000001aa4c	mov.16b	v1, v0
000000000001aa50	mov.16b	v2, v0
000000000001aa54	mov.16b	v3, v0
000000000001aa58	blr	x9
000000000001aa5c	ldr	x8, [x22]
000000000001aa60	ldr	x8, [x8, #0x60]
000000000001aa64	mov	w9, #0x43800000
000000000001aa68	fmov	s0, w9
000000000001aa6c	mov	w9, #0x437f0000
000000000001aa70	fmov	s1, w9
000000000001aa74	movi.2d	v2, #0000000000000000
000000000001aa78	movi.2d	v3, #0000000000000000
000000000001aa7c	mov	x0, x22
000000000001aa80	mov	w1, #0x3
000000000001aa84	blr	x8
000000000001aa88	ldr	d0, [sp, #0x20]
000000000001aa8c	fcvt	s0, d0
000000000001aa90	ldr	x8, [x22]
000000000001aa94	ldr	x8, [x8, #0x60]
000000000001aa98	mov	x0, x22
000000000001aa9c	mov	w1, #0x4
000000000001aaa0	mov.16b	v1, v0
000000000001aaa4	mov.16b	v2, v0
000000000001aaa8	mov.16b	v3, v0
000000000001aaac	blr	x8
000000000001aab0	ldp	d0, d2, [x25]
000000000001aab4	fcvt	s1, d0
000000000001aab8	fcvt	s2, d2
000000000001aabc	ldr	d0, [x25, #0x10]
000000000001aac0	fcvt	s3, d0
000000000001aac4	ldr	x8, [x22]
000000000001aac8	ldr	x8, [x8, #0x60]
000000000001aacc	movi.2d	v8, #0000000000000000
000000000001aad0	movi.2d	v0, #0000000000000000
000000000001aad4	mov	x0, x22
000000000001aad8	mov	w1, #0x5
000000000001aadc	blr	x8
000000000001aae0	ldr	w8, [sp, #0xc]
000000000001aae4	cmp	w8, #0x2
000000000001aae8	fmov	s0, #1.00000000
000000000001aaec	fcsel	s0, s0, s8, lt
000000000001aaf0	ldr	x8, [x22]
000000000001aaf4	ldr	x8, [x8, #0x60]
000000000001aaf8	movi.2d	v1, #0000000000000000
000000000001aafc	movi.2d	v2, #0000000000000000
000000000001ab00	movi.2d	v3, #0000000000000000
000000000001ab04	mov	x0, x22
000000000001ab08	mov	w1, #0x6
000000000001ab0c	blr	x8
000000000001ab10	mov	w0, #0x1f0
000000000001ab14	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001ab18	mov	x21, x0
000000000001ab1c	mov	x1, x19
000000000001ab20	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
000000000001ab24	ldr	x2, [sp, #0x18]
000000000001ab28	ldr	x8, [x22]
000000000001ab2c	ldr	x8, [x8, #0x78]
000000000001ab30	mov	x0, x22
000000000001ab34	mov	w1, #0x0
000000000001ab38	blr	x8
000000000001ab3c	ldr	x8, [x22]
000000000001ab40	ldr	x8, [x8, #0x78]
000000000001ab44	mov	x0, x22
000000000001ab48	mov	w1, #0x1
000000000001ab4c	mov	x2, x21
000000000001ab50	blr	x8
000000000001ab54	str	x22, [sp, #0x10]
000000000001ab58	ldr	x8, [x22]
000000000001ab5c	ldr	x8, [x8, #0x10]
000000000001ab60	mov	x0, x22
000000000001ab64	blr	x8
000000000001ab68	add	x2, sp, #0x10
000000000001ab6c	mov	x0, x20
000000000001ab70	bl	"_objc_msgSend$setHeliumRef:"
000000000001ab74	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (int)
    - parm5 (int)
    - parm6 (float)
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm2 (float), parm3 (float), host Mix
    slot 1  <-  host Mix
    slot 7  <-  host Mix
    slot 3  <-  (constant / computed)
    slot 4  <-  parm6 (float)
    slot 5  <-  host Mix
    slot 6  <-  (constant / computed)
```
