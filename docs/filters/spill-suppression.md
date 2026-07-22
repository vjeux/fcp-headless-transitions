# Spill Suppression

- **PAE class:** `Spill Suppression`
- **Plugin UUID:** `4CE35227-69BA-4F0B-AF5E-299526610307`
- **Node names in corpus:** ss (4), Spill Suppression (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Spill Suppression removes colored spill (usually green or blue backing-screen reflections) from a keyed foreground by pulling the chosen Color out of the image. Level sets how aggressively the spill color is neutralized. It is a keyer companion filter.

> **Note.** Not implemented; description is the standard Apple Motion "Spill Suppression" filter. Spill Contrast/Tint/Saturation are internal sub-controls.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color | color | - | - | The spill color to suppress (typically the backing screen's green/blue). |
| Level | float | 0.46 | 0.46 .. 0.46 | How strongly the spill color is neutralized, ~0.46 (default 0.46). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Tint | bool | 0 | 0 .. 0 | *(unverified)* |
| Saturation | float | 1 | 1 .. 1 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSpillRemoval`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSpillRemoval` → [`HgcSpillRemoval.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSpillRemoval.metal)

```metal
//Metal1.0     
//LEN=00000003a7
[[ visible ]] FragmentOut HgcSpillRemoval_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = float3(dot(r0, hg_Params[4]));
    r2.xyz = abs(r2.xyz);
    r1.xyz = r2.xyz*hg_Params[5].xyz + r1.xyz;
    r3.x = dot(r0, hg_Params[0]);
    r3.y = dot(r0, hg_Params[1]);
    r3.z = dot(r0, hg_Params[2]);
    r4.x = dot(r0, hg_Params[6]);
    r4.y = dot(r0, hg_Params[7]);
    r4.z = dot(r0, hg_Params[8]);
    r2.xyz = clamp(r2.xyz*hg_Params[9].xyz, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r4.xyz, r2.xyz);
    r1.xyz = clamp(r1.xyz*c0.xxx + c0.yyy, 0.00000f, 1.00000f);
    output.color0.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcSpillRemovalDarkEdges`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSpillRemovalDarkEdges` → [`HgcSpillRemovalDarkEdges.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSpillRemovalDarkEdges.metal)

```metal
//Metal1.0     
//LEN=00000005f4
[[ visible ]] FragmentOut HgcSpillRemovalDarkEdges_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    const float4 c1 = float4(-0.1145000011, -0.3855000138, 0.5000000000, 0.000000000);
    const float4 c2 = float4(0.5016000271, -0.4555999935, -0.04589999840, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = float3(dot(r0, hg_Params[4]));
    r2.xyz = abs(r2.xyz);
    r1.xyz = r2.xyz*hg_Params[5].xyz + r1.xyz;
    r3.x = dot(r0, hg_Params[0]);
    r3.y = dot(r0, hg_Params[1]);
    r3.z = dot(r0, hg_Params[2]);
    r4.x = dot(r0, hg_Params[6]);
    r4.y = dot(r0, hg_Params[7]);
    r4.z = dot(r0, hg_Params[8]);
    r2.xyz = clamp(r2.xyz*hg_Params[9].xyz, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r4.xyz, r2.xyz);
    r1.xyz = clamp(r1.xyz*c0.xxx + c0.yyy, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    r2.xyz = r0.xyz - r3.xyz;
    r2.xyz = abs(r2.xyz);
    r2.w = dot(r2.xyz, 1.00000f);
    r2.w = clamp(r2.w + r2.w, 0.00000f, 1.00000f);
    r4.x = dot(r3.xyz, c1.xyz);
    r4.y = dot(r3.xyz, c2.xyz);
    r4.w = fmax(r4.x, r4.y);
    r4.w = clamp(r4.w*hg_Params[11].w, 0.00000f, 1.00000f);
    r2.w = r2.w*-r4.w + r2.w;
    r1.xyz = r3.xyz*hg_Params[10].xyz;
    output.color0.xyz = mix(r3.xyz, r1.xyz, r2.www);
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAESpillSuppression canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESpillSuppression`

```asm
000000000006b3a8	mov	w5, #0x3
000000000006b3ac	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000006b3b0	ldp	d1, d0, [x29, #-0x78]
000000000006b3b4	fcvt	s0, d0
000000000006b3b8	fcvt	s1, d1
000000000006b3bc	ldur	d2, [x29, #-0x80]
000000000006b3c0	fcvt	s2, d2
000000000006b3c4	stp	s0, s1, [x29, #-0x8c]
000000000006b3c8	stur	s2, [x29, #-0x84]
000000000006b3cc	ldr	x4, [x22]
000000000006b3d0	sub	x2, x29, #0x98
000000000006b3d4	mov	x0, x23
000000000006b3d8	mov	w3, #0x1
000000000006b3dc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006b3e0	ldur	x19, [x29, #-0x68]
000000000006b3e4	stur	x19, [x29, #-0xa0]
000000000006b3e8	cbz	x19, 0x6b3fc
000000000006b3ec	ldr	x8, [x19]
000000000006b3f0	ldr	x8, [x8, #0x10]
000000000006b3f4	mov	x0, x19
000000000006b3f8	blr	x8
000000000006b3fc	ldur	d0, [x29, #-0x98]
000000000006b400	adrp	x8, 510 ; 0x269000
000000000006b404	ldr	d1, [x8, #0x478]
000000000006b408	fcmp	d0, d1
000000000006b40c	b.lt	0x6b8a4
000000000006b410	adrp	x8, 510 ; 0x269000
000000000006b414	ldr	d1, [x8, #0xf58]
000000000006b418	fadd	d0, d0, d1
000000000006b41c	fmov	d1, #9.00000000
000000000006b420	fdiv	d0, d0, d1
000000000006b424	stur	d0, [x29, #-0x98]
000000000006b428	movi.2s	v0, #0x3f, lsl #24
000000000006b42c	stur	d0, [x29, #-0xb0]
000000000006b430	mov	w8, #0x3f000000
000000000006b434	stur	w8, [x29, #-0xa8]
000000000006b438	ldr	x6, [x22]
000000000006b43c	sub	x2, x29, #0xb8
000000000006b440	sub	x3, x29, #0xc0
000000000006b444	sub	x4, x29, #0xc8
000000000006b448	mov	x0, x24
000000000006b44c	mov	w5, #0x2
000000000006b450	bl	"_objc_msgSend$getLevelsBlack:White:Gamma:fromParm:atTime:"
000000000006b454	ldr	x0, [x21, x25]
000000000006b458	adrp	x8, 873 ; 0x3d4000
000000000006b45c	ldr	x2, [x8, #0x528]
000000000006b460	bl	"_objc_msgSend$apiForProtocol:"
000000000006b464	cbz	x0, 0x6b478
000000000006b468	bl	_objc_msgSend$versionAtCreation
000000000006b46c	cmp	w0, #0x0
000000000006b470	cset	w24, eq
000000000006b474	b	0x6b47c
000000000006b478	mov	w24, #0x0
000000000006b47c	ldr	x4, [x22]
000000000006b480	add	x2, sp, #0xd0
000000000006b484	mov	x0, x23
000000000006b488	mov	w3, #0x4
000000000006b48c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006b490	ldr	d0, [sp, #0xd0]
000000000006b494	fmov	d1, #20.00000000
000000000006b498	fmul	d0, d0, d1
000000000006b49c	str	d0, [sp, #0xd0]
000000000006b4a0	ldr	x4, [x22]
000000000006b4a4	add	x2, sp, #0xc8
000000000006b4a8	mov	x0, x23
000000000006b4ac	mov	w3, #0x5
000000000006b4b0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006b4b4	ldur	d9, [x29, #-0x98]
000000000006b4b8	ldp	d0, d10, [x29, #-0xc0]
000000000006b4bc	fmov	d1, #-1.00000000
000000000006b4c0	fadd	d0, d0, d1
000000000006b4c4	fcvt	s0, d0
000000000006b4c8	cmp	w24, #0x0
000000000006b4cc	movi.2d	v1, #0000000000000000
000000000006b4d0	fcsel	s8, s0, s1, ne
000000000006b4d4	ldr	d11, [sp, #0xc8]
000000000006b4d8	mov	x0, x21
000000000006b4dc	bl	_objc_msgSend$getColorPrimaries
000000000006b4e0	mov	x22, x0
000000000006b4e4	mov	x0, x21
000000000006b4e8	bl	_objc_msgSend$isApplyTuningForRec2020
000000000006b4ec	mov	x6, x0
000000000006b4f0	fcvt	s0, d9
000000000006b4f4	fcvt	s1, d10
000000000006b4f8	fcvt	s4, d11
000000000006b4fc	sub	x0, x29, #0x8c
000000000006b500	sub	x1, x29, #0xb0
000000000006b504	movi.2d	v3, #0000000000000000
000000000006b508	add	x2, sp, #0x88
000000000006b50c	add	x3, sp, #0x48
000000000006b510	add	x4, sp, #0x8
000000000006b514	mov.16b	v2, v8
000000000006b518	mov	x5, x22
000000000006b51c	bl	0x251ce4 ; symbol stub for: __ZN9OMKeyer2D22getSpillSuppressTransfERK5Vec3ffS2_fffR5Mat4fS4_S4_f16OMColorPrimariesb
000000000006b520	tbz	w24, #0x0, 0x6b6c0
000000000006b524	mov	w0, #0x1a0
000000000006b528	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006b52c	mov	x21, x0
000000000006b530	bl	__ZN15HgcSpillRemovalC1Ev
000000000006b534	ldp	s0, s1, [sp, #0x48]
000000000006b538	ldp	s2, s3, [sp, #0x50]
000000000006b53c	ldr	x8, [x21]
000000000006b540	ldr	x8, [x8, #0x60]
000000000006b544	mov	x0, x21
000000000006b548	mov	w1, #0x0
000000000006b54c	blr	x8
000000000006b550	ldp	s0, s1, [sp, #0x58]
000000000006b554	ldp	s2, s3, [sp, #0x60]
000000000006b558	ldr	x8, [x21]
000000000006b55c	ldr	x8, [x8, #0x60]
000000000006b560	mov	x0, x21
000000000006b564	mov	w1, #0x1
000000000006b568	blr	x8
000000000006b56c	ldp	s0, s1, [sp, #0x68]
000000000006b570	ldp	s2, s3, [sp, #0x70]
000000000006b574	ldr	x8, [x21]
000000000006b578	ldr	x8, [x8, #0x60]
000000000006b57c	mov	x0, x21
000000000006b580	mov	w1, #0x2
000000000006b584	blr	x8
000000000006b588	ldp	s0, s1, [sp, #0xa8]
000000000006b58c	ldp	s2, s3, [sp, #0xb0]
000000000006b590	ldr	x8, [x21]
000000000006b594	ldr	x8, [x8, #0x60]
000000000006b598	mov	x0, x21
000000000006b59c	mov	w1, #0x3
000000000006b5a0	blr	x8
000000000006b5a4	ldp	s0, s1, [sp, #0x98]
000000000006b5a8	ldp	s2, s3, [sp, #0xa0]
000000000006b5ac	ldr	x8, [x21]
000000000006b5b0	ldr	x8, [x8, #0x60]
000000000006b5b4	mov	x0, x21
000000000006b5b8	mov	w1, #0x4
000000000006b5bc	blr	x8
000000000006b5c0	ldr	x8, [x21]
000000000006b5c4	ldr	x8, [x8, #0x60]
000000000006b5c8	movi.2d	v0, #0000000000000000
000000000006b5cc	movi.2d	v1, #0000000000000000
000000000006b5d0	movi.2d	v2, #0000000000000000
000000000006b5d4	movi.2d	v3, #0000000000000000
000000000006b5d8	mov	x0, x21
000000000006b5dc	mov	w1, #0x5
000000000006b5e0	blr	x8
000000000006b5e4	ldp	s0, s1, [sp, #0x8]
000000000006b5e8	ldp	s2, s3, [sp, #0x10]
000000000006b5ec	ldr	x8, [x21]
000000000006b5f0	ldr	x8, [x8, #0x60]
000000000006b5f4	mov	x0, x21
000000000006b5f8	mov	w1, #0x6
000000000006b5fc	blr	x8
000000000006b600	ldp	s0, s1, [sp, #0x18]
000000000006b604	ldp	s2, s3, [sp, #0x20]
000000000006b608	ldr	x8, [x21]
000000000006b60c	ldr	x8, [x8, #0x60]
000000000006b610	mov	x0, x21
000000000006b614	mov	w1, #0x7
000000000006b618	blr	x8
000000000006b61c	ldp	s0, s1, [sp, #0x28]
000000000006b620	ldp	s2, s3, [sp, #0x30]
000000000006b624	ldr	x8, [x21]
000000000006b628	ldr	x8, [x8, #0x60]
000000000006b62c	mov	x0, x21
000000000006b630	mov	w1, #0x8
000000000006b634	blr	x8
000000000006b638	ldr	d0, [sp, #0xd0]
000000000006b63c	fcvt	s0, d0
000000000006b640	ldr	x8, [x21]
000000000006b644	ldr	x8, [x8, #0x60]
000000000006b648	mov	x0, x21
000000000006b64c	mov	w1, #0x9
000000000006b650	mov.16b	v1, v0
000000000006b654	mov.16b	v2, v0
000000000006b658	mov.16b	v3, v0
000000000006b65c	blr	x8
000000000006b660	ldur	x2, [x29, #-0x68]
000000000006b664	ldr	x8, [x21]
000000000006b668	ldr	x8, [x8, #0x78]
000000000006b66c	mov	x0, x21
000000000006b670	mov	w1, #0x0
000000000006b674	blr	x8
000000000006b678	cmp	x19, x21
000000000006b67c	b.eq	0x6b6ac
000000000006b680	cbz	x19, 0x6b694
000000000006b684	ldr	x8, [x19]
000000000006b688	ldr	x8, [x8, #0x18]
000000000006b68c	mov	x0, x19
000000000006b690	blr	x8
000000000006b694	stur	x21, [x29, #-0xa0]
000000000006b698	ldr	x8, [x21]
000000000006b69c	ldr	x8, [x8, #0x10]
000000000006b6a0	mov	x19, x21
000000000006b6a4	mov	x0, x21
000000000006b6a8	blr	x8
000000000006b6ac	ldr	x8, [x21]
000000000006b6b0	ldr	x8, [x8, #0x18]
000000000006b6b4	mov	x0, x21
000000000006b6b8	blr	x8
000000000006b6bc	b	0x6b8a4
000000000006b6c0	mov	w0, #0x1a0
000000000006b6c4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006b6c8	mov	x21, x0
000000000006b6cc	bl	__ZN24HgcSpillRemovalDarkEdgesC1Ev
000000000006b6d0	ldp	s0, s1, [sp, #0x48]
000000000006b6d4	ldp	s2, s3, [sp, #0x50]
000000000006b6d8	ldr	x8, [x21]
000000000006b6dc	ldr	x8, [x8, #0x60]
000000000006b6e0	mov	x0, x21
000000000006b6e4	mov	w1, #0x0
000000000006b6e8	blr	x8
000000000006b6ec	ldp	s0, s1, [sp, #0x58]
000000000006b6f0	ldp	s2, s3, [sp, #0x60]
000000000006b6f4	ldr	x8, [x21]
000000000006b6f8	ldr	x8, [x8, #0x60]
000000000006b6fc	mov	x0, x21
000000000006b700	mov	w1, #0x1
000000000006b704	blr	x8
000000000006b708	ldp	s0, s1, [sp, #0x68]
000000000006b70c	ldp	s2, s3, [sp, #0x70]
000000000006b710	ldr	x8, [x21]
000000000006b714	ldr	x8, [x8, #0x60]
000000000006b718	mov	x0, x21
000000000006b71c	mov	w1, #0x2
000000000006b720	blr	x8
000000000006b724	ldp	s0, s1, [sp, #0xa8]
000000000006b728	ldp	s2, s3, [sp, #0xb0]
000000000006b72c	ldr	x8, [x21]
000000000006b730	ldr	x8, [x8, #0x60]
000000000006b734	mov	x0, x21
000000000006b738	mov	w1, #0x3
000000000006b73c	blr	x8
000000000006b740	ldp	s0, s1, [sp, #0x98]
000000000006b744	ldp	s2, s3, [sp, #0xa0]
000000000006b748	ldr	x8, [x21]
000000000006b74c	ldr	x8, [x8, #0x60]
000000000006b750	mov	x0, x21
000000000006b754	mov	w1, #0x4
000000000006b758	blr	x8
000000000006b75c	ldr	x8, [x21]
000000000006b760	ldr	x8, [x8, #0x60]
000000000006b764	movi.2d	v0, #0000000000000000
000000000006b768	movi.2d	v1, #0000000000000000
000000000006b76c	movi.2d	v2, #0000000000000000
000000000006b770	movi.2d	v3, #0000000000000000
000000000006b774	mov	x0, x21
000000000006b778	mov	w1, #0x5
000000000006b77c	blr	x8
000000000006b780	ldp	s0, s1, [sp, #0x8]
000000000006b784	ldp	s2, s3, [sp, #0x10]
000000000006b788	ldr	x8, [x21]
000000000006b78c	ldr	x8, [x8, #0x60]
000000000006b790	mov	x0, x21
000000000006b794	mov	w1, #0x6
000000000006b798	blr	x8
000000000006b79c	ldp	s0, s1, [sp, #0x18]
000000000006b7a0	ldp	s2, s3, [sp, #0x20]
000000000006b7a4	ldr	x8, [x21]
000000000006b7a8	ldr	x8, [x8, #0x60]
000000000006b7ac	mov	x0, x21
000000000006b7b0	mov	w1, #0x7
000000000006b7b4	blr	x8
000000000006b7b8	ldp	s0, s1, [sp, #0x28]
000000000006b7bc	ldp	s2, s3, [sp, #0x30]
000000000006b7c0	ldr	x8, [x21]
000000000006b7c4	ldr	x8, [x8, #0x60]
000000000006b7c8	mov	x0, x21
000000000006b7cc	mov	w1, #0x8
000000000006b7d0	blr	x8
000000000006b7d4	ldr	d0, [sp, #0xd0]
000000000006b7d8	fcvt	s0, d0
000000000006b7dc	ldr	x8, [x21]
000000000006b7e0	ldr	x8, [x8, #0x60]
000000000006b7e4	mov	x0, x21
000000000006b7e8	mov	w1, #0x9
000000000006b7ec	mov.16b	v1, v0
000000000006b7f0	mov.16b	v2, v0
000000000006b7f4	mov.16b	v3, v0
000000000006b7f8	blr	x8
000000000006b7fc	ldur	d0, [x29, #-0xc0]
000000000006b800	fcvt	s0, d0
000000000006b804	ldr	x8, [x21]
000000000006b808	ldr	x8, [x8, #0x60]
000000000006b80c	fmov	s3, #1.00000000
000000000006b810	mov	x0, x21
000000000006b814	mov	w1, #0xa
000000000006b818	mov.16b	v1, v0
000000000006b81c	mov.16b	v2, v0
000000000006b820	blr	x8
000000000006b824	ldr	x8, [x21]
000000000006b828	ldr	x8, [x8, #0x60]
000000000006b82c	fmov	s0, #10.00000000
000000000006b830	fmov	s1, #10.00000000
000000000006b834	fmov	s2, #10.00000000
000000000006b838	fmov	s3, #10.00000000
000000000006b83c	mov	x0, x21
000000000006b840	mov	w1, #0xb
000000000006b844	blr	x8
000000000006b848	ldur	x2, [x29, #-0x68]
000000000006b84c	ldr	x8, [x21]
000000000006b850	ldr	x8, [x8, #0x78]
000000000006b854	mov	x0, x21
000000000006b858	mov	w1, #0x0
000000000006b85c	blr	x8
000000000006b860	cmp	x19, x21
000000000006b864	b.eq	0x6b894
000000000006b868	cbz	x19, 0x6b87c
000000000006b86c	ldr	x8, [x19]
000000000006b870	ldr	x8, [x8, #0x18]
000000000006b874	mov	x0, x19
000000000006b878	blr	x8
000000000006b87c	stur	x21, [x29, #-0xa0]
000000000006b880	ldr	x8, [x21]
000000000006b884	ldr	x8, [x8, #0x10]
000000000006b888	mov	x19, x21
000000000006b88c	mov	x0, x21
000000000006b890	blr	x8
000000000006b894	ldr	x8, [x21]
000000000006b898	ldr	x8, [x8, #0x18]
000000000006b89c	mov	x0, x21
000000000006b8a0	blr	x8
000000000006b8a4	sub	x2, x29, #0xa0
000000000006b8a8	mov	x0, x20
000000000006b8ac	bl	"_objc_msgSend$setHeliumRef:"
000000000006b8b0	ldur	x0, [x29, #-0xa0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm3 : ColorParameter
    parm1 : PercentSlider
    parm2 : Levels
    parm4 : PercentSlider
    parm5 : PercentSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm3 (colour)
    - parm1 (float)
    - parm4 (float)
    - parm5 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  (constant / computed / multi-pass — read the disasm)
    slot 7  <-  (constant / computed / multi-pass — read the disasm)
    slot 8  <-  (constant / computed / multi-pass — read the disasm)
    slot 9  <-  parm4 (float)
    slot 10  <-  parm4 (float)
    slot 11  <-  (constant / computed / multi-pass — read the disasm)
```
