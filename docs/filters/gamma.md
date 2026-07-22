# Gamma

- **PAE class:** `Gamma`
- **Plugin UUID:** `9F2DAEB8-1875-4E0E-B62F-DF1E28C1999B`
- **Node names in corpus:** Gamma (24), Gamma copy (1)
- **Corpus usage:** 17 files, 25 instances

## What it does

Gamma applies a power-law tone curve to the image: out = in ^ (1/Gamma) per channel, brightening midtones for Gamma>1 and darkening them for Gamma<1 while leaving black and white fixed. A single slider.

> **Note.** Not implemented; description is the standard Apple Motion "Gamma" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Gamma | float | 1 | 0.1445 .. 10 | Gamma exponent; >1 brightens midtones, <1 darkens, ~0.14-10 (default 1 = identity). *(keyframed in 5 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGamma`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGamma` → [`HgcGamma.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGamma.metal)

```metal
//Metal1.0     
//LEN=000000018b
[[ visible ]] FragmentOut HgcGamma_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = pow(r0, hg_Params[0]);
    r0 = select(r1, r0, r0 < 0.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### Metal fragment shader — `HgcGammaNoPremult`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGammaNoPremult` → [`HgcGammaNoPremult.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGammaNoPremult.metal)

```metal
//Metal1.0     
//LEN=0000000169
[[ visible ]] FragmentOut HgcGammaNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = abs(r0);
    r2.xyz = pow(r1.xyz, hg_Params[0].xyz);
    r2.w = r1.w;
    output.color0 = select(r2, -r2, r0 < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGamma canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGamma`

```asm
000000000002fc40	mov	w3, #0x1
000000000002fc44	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000002fc48	ldr	d0, [sp, #0x18]
000000000002fc4c	adrp	x8, 570 ; 0x269000
000000000002fc50	ldr	d1, [x8, #0x830]
000000000002fc54	fcmp	d0, d1
000000000002fc58	fcsel	d0, d1, d0, mi
000000000002fc5c	fmov	d1, #1.00000000
000000000002fc60	fdiv	d0, d1, d0
000000000002fc64	str	d0, [sp, #0x18]
000000000002fc68	ldr	x2, [x21]
000000000002fc6c	mov	x0, x22
000000000002fc70	bl	"_objc_msgSend$getRenderMode:"
000000000002fc74	cbz	w0, 0x2fd54
000000000002fc78	mov	x0, x19
000000000002fc7c	bl	_objc_msgSend$imageType
000000000002fc80	cmp	x0, #0x3
000000000002fc84	b.ne	0x2fc9c
000000000002fc88	cbz	x19, 0x2fca4
000000000002fc8c	add	x8, sp, #0x10
000000000002fc90	mov	x0, x19
000000000002fc94	bl	_objc_msgSend$heliumRef
000000000002fc98	b	0x2fca8
000000000002fc9c	mov	w0, #0x0
000000000002fca0	b	0x2fd54
000000000002fca4	str	xzr, [sp, #0x10]
000000000002fca8	mov	w0, #0x1b0
000000000002fcac	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000002fcb0	mov	x19, x0
000000000002fcb4	bl	0x251894 ; symbol stub for: __ZN7HGGammaC1Ev
000000000002fcb8	ldr	d0, [sp, #0x18]
000000000002fcbc	fcvt	s0, d0
000000000002fcc0	ldr	x8, [x19]
000000000002fcc4	ldr	x8, [x8, #0x60]
000000000002fcc8	fmov	s3, #1.00000000
000000000002fccc	mov	x0, x19
000000000002fcd0	mov	w1, #0x0
000000000002fcd4	mov.16b	v1, v0
000000000002fcd8	mov.16b	v2, v0
000000000002fcdc	blr	x8
000000000002fce0	ldr	x2, [sp, #0x10]
000000000002fce4	ldr	x8, [x19]
000000000002fce8	ldr	x8, [x8, #0x78]
000000000002fcec	mov	x0, x19
000000000002fcf0	mov	w1, #0x0
000000000002fcf4	blr	x8
000000000002fcf8	str	x19, [sp, #0x8]
000000000002fcfc	ldr	x8, [x19]
000000000002fd00	ldr	x8, [x8, #0x10]
000000000002fd04	mov	x0, x19
000000000002fd08	blr	x8
000000000002fd0c	add	x2, sp, #0x8
000000000002fd10	mov	x0, x20
000000000002fd14	bl	"_objc_msgSend$setHeliumRef:"
000000000002fd18	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (float)
```
