# Highpass

- **PAE class:** `Highpass`
- **Plugin UUID:** `44CB7A9A-4E16-4B32-9567-C1EAD1C0693A`
- **Node names in corpus:** Highpass (4), Edges (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Highpass keeps only the high-frequency detail of the image, subtracting a blurred (low-pass) copy from the original and centering the result around mid-gray -- the classic frequency-separation / high-pass-sharpen building block. The verbatim HgcHighPass shader is exactly (color0 - blurred)*Amount + 0.5, clamped. Radius sets the blur radius (the frequency split) and Amount the gain.

> **Note.** Shader-only. The verbatim HgcHighPass Metal shader ((in - blur)*Amount + 0.5) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 15 | 0 .. 30 | Gain on the high-frequency residual (shader hg_Params[0]), ~0-30 (default 15). |
| Radius | float (pixels) | 10 | 5 .. 100 | Blur radius defining the low/high frequency split, ~5-100 (default 10). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcHighPass` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcHighPass.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcHighPass`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcHighPass` → [`HgcHighPass.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHighPass.metal)

```metal
//Metal1.0     
//LEN=000000025d
[[ visible ]] FragmentOut HgcHighPass_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = color1;
    r1.xyz = r1.xyz / fmax(r1.w, 1.00000e-06f);
    r1.xyz = r0.xyz - r1.xyz;
    r1.xyz = r1.xyz*hg_Params[0].xyz + c0.xxx;
    r0.xyz = fmax(r1.xyz, c0.yyy);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEHighPass canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEHighPass`

```asm
00000000001035fc	mov	w3, #0x1
0000000000103600	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000103604	ldr	d0, [sp, #0x18]
0000000000103608	mov	x8, #0x4059000000000000
000000000010360c	fmov	d1, x8
0000000000103610	fdiv	d0, d0, d1
0000000000103614	fcvt	s0, d0
0000000000103618	adrp	x8, 360 ; 0x26b000
000000000010361c	ldr	s1, [x8, #0x408]
0000000000103620	bl	0x2523a4 ; symbol stub for: _powf
0000000000103624	fcvt	d0, s0
0000000000103628	adrp	x8, 360 ; 0x26b000
000000000010362c	ldr	d1, [x8, #0x410]
0000000000103630	fmul	d0, d0, d1
0000000000103634	str	d0, [sp, #0x18]
0000000000103638	ldr	x4, [x19]
000000000010363c	add	x2, sp, #0x10
0000000000103640	mov	x0, x24
0000000000103644	mov	w3, #0x2
0000000000103648	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000010364c	ldr	x2, [x19]
0000000000103650	mov	x0, x22
0000000000103654	bl	"_objc_msgSend$getRenderMode:"
0000000000103658	cbz	w0, 0x1036c0
000000000010365c	mov	x0, x21
0000000000103660	bl	_objc_msgSend$imageType
0000000000103664	cmp	x0, #0x3
0000000000103668	b.ne	0x1036bc
000000000010366c	mov	w0, #0x1b0
0000000000103670	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000103674	mov	x19, x0
0000000000103678	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
000000000010367c	cmp	w23, #0x0
0000000000103680	cset	w1, eq
0000000000103684	ldr	d0, [sp, #0x18]
0000000000103688	fcvt	s0, d0
000000000010368c	fcvt	s1, d8
0000000000103690	fcvt	s2, d9
0000000000103694	mov	x0, x19
0000000000103698	mov	w2, #0x0
000000000010369c	mov	w3, #0x0
00000000001036a0	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000001036a4	cbz	x21, 0x1036dc
00000000001036a8	add	x8, sp, #0x8
00000000001036ac	mov	x0, x21
00000000001036b0	bl	_objc_msgSend$heliumRef
00000000001036b4	ldr	x2, [sp, #0x8]
00000000001036b8	b	0x1036e4
00000000001036bc	mov	w0, #0x0
00000000001036c0	ldp	x29, x30, [sp, #0x70]
00000000001036c4	ldp	x20, x19, [sp, #0x60]
00000000001036c8	ldp	x22, x21, [sp, #0x50]
00000000001036cc	ldp	x24, x23, [sp, #0x40]
00000000001036d0	ldp	d9, d8, [sp, #0x30]
00000000001036d4	add	sp, sp, #0x80
00000000001036d8	ret
00000000001036dc	mov	x2, #0x0
00000000001036e0	str	xzr, [sp, #0x8]
00000000001036e4	ldr	x8, [x19]
00000000001036e8	ldr	x8, [x8, #0x78]
00000000001036ec	mov	x0, x19
00000000001036f0	mov	w1, #0x0
00000000001036f4	blr	x8
00000000001036f8	ldr	x0, [sp, #0x8]
00000000001036fc	cbz	x0, 0x10370c
0000000000103700	ldr	x8, [x0]
0000000000103704	ldr	x8, [x8, #0x18]
0000000000103708	blr	x8
000000000010370c	mov	w0, #0x1a0
0000000000103710	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000103714	mov	x22, x0
0000000000103718	bl	__ZN11HgcHighPassC1Ev
000000000010371c	str	x22, [sp, #0x8]
0000000000103720	cbz	x21, 0x103738
0000000000103724	mov	x8, sp
0000000000103728	mov	x0, x21
000000000010372c	bl	_objc_msgSend$heliumRef
0000000000103730	ldr	x2, [sp]
0000000000103734	b	0x103740
0000000000103738	mov	x2, #0x0
000000000010373c	str	xzr, [sp]
0000000000103740	ldr	x8, [x22]
0000000000103744	ldr	x8, [x8, #0x78]
0000000000103748	mov	x0, x22
000000000010374c	mov	w1, #0x0
0000000000103750	blr	x8
0000000000103754	ldr	x0, [sp]
0000000000103758	cbz	x0, 0x103768
000000000010375c	ldr	x8, [x0]
0000000000103760	ldr	x8, [x8, #0x18]
0000000000103764	blr	x8
0000000000103768	ldr	x8, [x22]
000000000010376c	ldr	x8, [x8, #0x78]
0000000000103770	mov	x0, x22
0000000000103774	mov	w1, #0x1
0000000000103778	mov	x2, x19
000000000010377c	blr	x8
0000000000103780	ldr	d0, [sp, #0x10]
0000000000103784	fcvt	s0, d0
0000000000103788	ldr	x8, [x22]
000000000010378c	ldr	x8, [x8, #0x60]
0000000000103790	movi.2d	v1, #0000000000000000
0000000000103794	movi.2d	v2, #0000000000000000
0000000000103798	movi.2d	v3, #0000000000000000
000000000010379c	mov	x0, x22
00000000001037a0	mov	w1, #0x0
00000000001037a4	blr	x8
00000000001037a8	add	x2, sp, #0x8
00000000001037ac	mov	x0, x20
00000000001037b0	bl	"_objc_msgSend$setHeliumRef:"
00000000001037b4	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (float), parm2 (float)
```
