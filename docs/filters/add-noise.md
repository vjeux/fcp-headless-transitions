# Add Noise

- **PAE class:** `Add Noise`
- **Plugin UUID:** `C423A28F-C016-4133-B120-22FF2E9A7862`
- **Node names in corpus:** Add Noise (122), Add Noise copy (53), Noise (6), Add Noise Source (4), Grain (2), Add Noise 1 (1)
- **Corpus usage:** 123 files, 188 instances

## What it does

Add Noise overlays procedural random noise onto the image, blended by Amount and a chosen Blend Mode, optionally monochrome and auto-animated over time. It is the grain/static generator used for film-grain, TV-static and texture effects. FCP's HgcAddNoise shader is a simple per-pixel scale+abs blend of a noise field; the shader is checked in.

> **Note.** HgcAddNoise shader is checked in (evidence/shaders/HgcAddNoise.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 0.33 | 0 .. 4 | Strength of the noise added, 0-4. 0 = no noise; the primary knob. *(keyframed in 1 instance)* |
| Type | enum(int) | 1 | 0 .. 4 | Noise distribution/type, 0-4 (e.g. uniform vs gaussian variants). |
| Blend Mode | enum(int) | 0 | 0 .. 17 | How the noise composites over the image, 0-17 (add, screen, overlay, etc.). |
| Monochrome | bool | 0 | 0 .. 1 | Toggle: single-channel gray noise vs independent per-channel color noise. |
| Autoanimate | bool | 1 | 0 .. 1 | Toggle: re-roll the noise field every frame (animated static) vs a static pattern. |
| Random Seed | float (int seed) | 25 | 0 .. 500 | Seed for the noise RNG. |
| Mix | float | 1 | 0.0043 .. 1 | Wet/dry blend of the noisy result over the original, 0-1 continuous. *(keyframed in 35 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcAddNoise` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcAddNoise`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcAddNoise` → [`HgcAddNoise.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal)

```metal
//Metal1.0     
//LEN=00000001da
[[ visible ]] FragmentOut HgcAddNoise_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    r0 = r0*c0.xxxw + -c0.wwwy;
    r0 = r0*hg_Params[0];
    r0 = mix(r0, fabs(r0), hg_Params[1]);
    output.color0 = r0*r1.wwww;
    return output;
}
```

### Metal fragment shader — `HgcAddNoiseNormal`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcAddNoiseNormal` → [`HgcAddNoiseNormal.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAddNoiseNormal.metal)

```metal
//Metal1.0     
//LEN=00000001f8
[[ visible ]] FragmentOut HgcAddNoiseNormal_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(2.000000000, -1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xyz = color0.xyz;
    r0.xyz = r0.xyz*c0.xxx + c0.yyy;
    r1 = color1;
    r0.xyz = r0.xyz*hg_Params[0].xyz;
    r1.xyz = r1.www*r0.xyz + r1.xyz;
    output.color0 = fmax(r1, c0.zzzz);
    return output;
}
```

### CPU parameter wiring — `-[PAEAddNoise canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEAddNoise`

```asm
00000000000354b0	mov	w3, #0x1
00000000000354b4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000354b8	ldur	d0, [x29, #-0x58]
00000000000354bc	fcmp	d0, #0.0
00000000000354c0	b.ne	0x354e0
00000000000354c4	cbz	x20, 0x35504
00000000000354c8	sub	x8, x29, #0xe8
00000000000354cc	mov	x0, x20
00000000000354d0	bl	_objc_msgSend$heliumRef
00000000000354d4	b	0x35508
00000000000354d8	mov	w0, #0x0
00000000000354dc	b	0x35bb4
00000000000354e0	ldr	x0, [x21, x24]
00000000000354e4	adrp	x8, 927 ; 0x3d4000
00000000000354e8	ldr	x2, [x8, #0x528]
00000000000354ec	bl	"_objc_msgSend$apiForProtocol:"
00000000000354f0	cbz	x0, 0x3552c
00000000000354f4	bl	_objc_msgSend$versionAtCreation
00000000000354f8	cmp	w0, #0x0
00000000000354fc	cset	w24, eq
0000000000035500	b	0x35530
0000000000035504	stur	xzr, [x29, #-0xe8]
0000000000035508	sub	x2, x29, #0xe8
000000000003550c	mov	x0, x19
0000000000035510	bl	"_objc_msgSend$setHeliumRef:"
0000000000035514	ldur	x0, [x29, #-0xe8]
0000000000035518	cbz	x0, 0x35bb0
000000000003551c	ldr	x8, [x0]
0000000000035520	ldr	x8, [x8, #0x18]
0000000000035524	blr	x8
0000000000035528	b	0x35bb0
000000000003552c	mov	w24, #0x0
0000000000035530	mov	w25, #0x1
0000000000035534	stur	w25, [x29, #-0x5c]
0000000000035538	ldr	x4, [x22]
000000000003553c	sub	x2, x29, #0x5c
0000000000035540	mov	x0, x23
0000000000035544	mov	w3, #0x2
0000000000035548	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000003554c	sturb	wzr, [x29, #-0x5d]
0000000000035550	ldr	x4, [x22]
0000000000035554	sub	x2, x29, #0x5d
0000000000035558	mov	x0, x23
000000000003555c	mov	w3, #0x3
0000000000035560	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000035564	sturb	w25, [x29, #-0x5e]
0000000000035568	ldr	x4, [x22]
000000000003556c	sub	x2, x29, #0x5e
0000000000035570	mov	x0, x23
0000000000035574	mov	w3, #0x5
0000000000035578	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000003557c	mov	w8, #0x19
0000000000035580	stur	w8, [x29, #-0x64]
0000000000035584	ldr	x4, [x22]
0000000000035588	sub	x2, x29, #0x64
000000000003558c	mov	x0, x23
0000000000035590	mov	w3, #0x6
0000000000035594	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000035598	stur	wzr, [x29, #-0x68]
000000000003559c	ldr	x4, [x22]
00000000000355a0	sub	x2, x29, #0x68
00000000000355a4	mov	x0, x23
00000000000355a8	mov	w3, #0x4
00000000000355ac	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000355b0	sub	x8, x29, #0xe8
00000000000355b4	mov	x0, x21
00000000000355b8	mov	x2, x20
00000000000355bc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000355c0	add	x8, sp, #0x248
00000000000355c4	mov	x0, x21
00000000000355c8	mov	x2, x19
00000000000355cc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000355d0	add	x8, sp, #0x1c8
00000000000355d4	mov	x0, x21
00000000000355d8	mov	x2, x19
00000000000355dc	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000355e0	ldr	x2, [x22]
00000000000355e4	mov	x0, x21
00000000000355e8	mov	x3, x21
00000000000355ec	bl	"_objc_msgSend$frameFromFxTime:forPlugIn:"
00000000000355f0	mov.16b	v8, v0
00000000000355f4	mov	x0, x20
00000000000355f8	bl	_objc_msgSend$width
00000000000355fc	mov	x23, x0
0000000000035600	mov	x0, x20
0000000000035604	bl	_objc_msgSend$height
0000000000035608	mov	x3, x0
000000000003560c	add	x8, sp, #0x40
0000000000035610	ldur	w4, [x29, #-0x5c]
0000000000035614	ldurb	w5, [x29, #-0x5d]
0000000000035618	ldurb	w6, [x29, #-0x5e]
000000000003561c	ldur	w7, [x29, #-0x64]
0000000000035620	ldur	q0, [x29, #-0xa8]
0000000000035624	ldur	q1, [x29, #-0x98]
0000000000035628	ldur	q2, [x29, #-0x88]
000000000003562c	ldur	q3, [x29, #-0x78]
0000000000035630	stp	q1, q2, [x8, #0x150]
0000000000035634	str	q3, [x8, #0x170]
0000000000035638	ldur	q1, [x29, #-0xe8]
000000000003563c	ldur	q2, [x29, #-0xd8]
0000000000035640	ldur	q3, [x29, #-0xc8]
0000000000035644	ldur	q4, [x29, #-0xb8]
0000000000035648	stp	q2, q3, [x8, #0x110]
000000000003564c	stp	q4, q0, [x8, #0x130]
0000000000035650	add	x9, sp, #0x109
0000000000035654	ldur	q0, [x9, #0xff]
0000000000035658	add	x9, sp, #0x119
000000000003565c	ldur	q2, [x9, #0xff]
0000000000035660	add	x9, sp, #0x129
0000000000035664	ldur	q3, [x9, #0xff]
0000000000035668	add	x9, sp, #0x139
000000000003566c	ldur	q4, [x9, #0xff]
0000000000035670	stp	q2, q3, [x8, #0xd0]
0000000000035674	stp	q4, q1, [x8, #0xf0]
0000000000035678	add	x9, sp, #0xc9
000000000003567c	ldur	q1, [x9, #0xff]
0000000000035680	add	x9, sp, #0xd9
0000000000035684	ldur	q2, [x9, #0xff]
0000000000035688	add	x9, sp, #0xe9
000000000003568c	ldur	q3, [x9, #0xff]
0000000000035690	add	x9, sp, #0xf9
0000000000035694	ldur	q4, [x9, #0xff]
0000000000035698	stp	q2, q3, [x8, #0x90]
000000000003569c	stp	q4, q0, [x8, #0xb0]
00000000000356a0	add	x9, sp, #0x149
00000000000356a4	ldur	q0, [x9, #0xff]
00000000000356a8	add	x9, sp, #0x159
00000000000356ac	ldur	q2, [x9, #0xff]
00000000000356b0	add	x9, sp, #0x169
00000000000356b4	ldur	q3, [x9, #0xff]
00000000000356b8	add	x9, sp, #0x179
00000000000356bc	ldur	q4, [x9, #0xff]
00000000000356c0	stp	q3, q4, [sp, #0x60]
00000000000356c4	stp	q0, q2, [sp, #0x40]
00000000000356c8	add	x9, sp, #0x189
00000000000356cc	ldur	q0, [x9, #0xff]
00000000000356d0	add	x9, sp, #0x199
00000000000356d4	ldur	q2, [x9, #0xff]
00000000000356d8	add	x9, sp, #0x1a9
00000000000356dc	ldur	q3, [x9, #0xff]
00000000000356e0	add	x9, sp, #0x1b9
00000000000356e4	ldur	q4, [x9, #0xff]
00000000000356e8	stp	q4, q1, [x8, #0x70]
00000000000356ec	stp	q2, q3, [sp, #0x90]
00000000000356f0	str	q0, [sp, #0x80]
00000000000356f4	strb	wzr, [sp, #0x18]
00000000000356f8	add	x8, sp, #0x40
00000000000356fc	str	x8, [sp, #0x10]
0000000000035700	add	x8, sp, #0xc0
0000000000035704	add	x9, sp, #0x140
0000000000035708	stp	x9, x8, [sp]
000000000003570c	add	x8, sp, #0x1c0
0000000000035710	mov	x0, x21
0000000000035714	mov	x2, x23
0000000000035718	mov.16b	v0, v8
000000000003571c	bl	"_objc_msgSend$noiseNodeWithWidth:height:noiseType:isMono:frameNum:autoAnimate:randomSeed:inputPixelTransform:outputPixelTransform:outputInvPixelTransform:is360:"
0000000000035720	cbz	x20, 0x35734
0000000000035724	add	x8, sp, #0x38
0000000000035728	mov	x0, x20
000000000003572c	bl	_objc_msgSend$heliumRef
0000000000035730	b	0x35738
0000000000035734	str	xzr, [sp, #0x38]
0000000000035738	mov	x0, x20
000000000003573c	bl	_objc_msgSend$width
0000000000035740	mov	x0, x20
0000000000035744	bl	_objc_msgSend$height
0000000000035748	mov	w0, #0x220
000000000003574c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000035750	mov	x23, x0
0000000000035754	bl	0x25130c ; symbol stub for: __ZN16HGHWBlendFlippedC1Ev
0000000000035758	str	x23, [sp, #0x30]
000000000003575c	mov	x0, x21
0000000000035760	bl	_objc_msgSend$getBlendingGamma
0000000000035764	ldr	x8, [x23]
0000000000035768	ldr	x8, [x8, #0x60]
000000000003576c	movi.2d	v1, #0000000000000000
0000000000035770	movi.2d	v2, #0000000000000000
0000000000035774	movi.2d	v3, #0000000000000000
0000000000035778	mov	x0, x23
000000000003577c	mov	w1, #0x5
0000000000035780	blr	x8
0000000000035784	cbz	x20, 0x35798
0000000000035788	add	x8, sp, #0x28
000000000003578c	mov	x0, x20
0000000000035790	bl	_objc_msgSend$heliumRef
0000000000035794	b	0x3579c
0000000000035798	str	xzr, [sp, #0x28]
000000000003579c	ldur	w8, [x29, #-0x68]
00000000000357a0	cbz	w8, 0x3583c
00000000000357a4	mov	w0, #0x1a0
00000000000357a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000357ac	mov	x23, x0
00000000000357b0	bl	__ZN11HgcAddNoiseC1Ev
00000000000357b4	cbz	x23, 0x357c8
00000000000357b8	ldr	x8, [x23]
00000000000357bc	ldr	x8, [x8, #0x10]
00000000000357c0	mov	x0, x23
00000000000357c4	blr	x8
00000000000357c8	ldr	x2, [sp, #0x1c0]
00000000000357cc	ldr	x8, [x23]
00000000000357d0	ldr	x8, [x8, #0x78]
00000000000357d4	mov	x0, x23
00000000000357d8	mov	w1, #0x0
00000000000357dc	blr	x8
00000000000357e0	ldr	x2, [sp, #0x38]
00000000000357e4	ldr	x8, [x23]
00000000000357e8	ldr	x8, [x8, #0x78]
00000000000357ec	mov	x0, x23
00000000000357f0	mov	w1, #0x1
00000000000357f4	blr	x8
00000000000357f8	cbz	w24, 0x35974
00000000000357fc	ldur	d0, [x29, #-0x58]
0000000000035800	fcvt	s0, d0
0000000000035804	ldr	x8, [x23]
0000000000035808	ldr	x8, [x8, #0x60]
000000000003580c	fmov	s8, #1.00000000
0000000000035810	fmov	s3, #1.00000000
0000000000035814	mov	x0, x23
0000000000035818	mov	w1, #0x0
000000000003581c	mov.16b	v1, v0
0000000000035820	mov.16b	v2, v0
0000000000035824	blr	x8
0000000000035828	ldur	w8, [x29, #-0x68]
000000000003582c	cmp	w8, #0x0
0000000000035830	movi.2d	v0, #0000000000000000
0000000000035834	fcsel	s0, s0, s8, eq
0000000000035838	b	0x359b0
000000000003583c	mov	w0, #0x1a0
0000000000035840	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000035844	mov	x22, x0
0000000000035848	bl	__ZN17HgcAddNoiseNormalC1Ev
000000000003584c	cbz	x22, 0x35860
0000000000035850	ldr	x8, [x22]
0000000000035854	ldr	x8, [x8, #0x10]
0000000000035858	mov	x0, x22
000000000003585c	blr	x8
0000000000035860	ldr	x2, [sp, #0x1c0]
0000000000035864	ldr	x8, [x22]
0000000000035868	ldr	x8, [x8, #0x78]
000000000003586c	mov	x0, x22
0000000000035870	mov	w1, #0x0
0000000000035874	blr	x8
0000000000035878	ldr	x2, [sp, #0x38]
000000000003587c	ldr	x8, [x22]
0000000000035880	ldr	x8, [x8, #0x78]
0000000000035884	mov	x0, x22
0000000000035888	mov	w1, #0x1
000000000003588c	blr	x8
0000000000035890	ldur	d0, [x29, #-0x58]
0000000000035894	fcvt	s0, d0
0000000000035898	ldr	x8, [x22]
000000000003589c	ldr	x8, [x8, #0x60]
00000000000358a0	fmov	s3, #1.00000000
00000000000358a4	mov	x0, x22
00000000000358a8	mov	w1, #0x0
00000000000358ac	mov.16b	v1, v0
00000000000358b0	mov.16b	v2, v0
00000000000358b4	blr	x8
00000000000358b8	ldr	x0, [sp, #0x30]
00000000000358bc	adrp	x8, 564 ; 0x269000
00000000000358c0	add	x8, x8, #0x9c0
00000000000358c4	ldursw	x9, [x29, #-0x68]
00000000000358c8	ldr	s0, [x8, x9, lsl #2]
00000000000358cc	ucvtf	s0, s0
00000000000358d0	ldr	x8, [x0]
00000000000358d4	ldr	x8, [x8, #0x60]
00000000000358d8	movi.2d	v1, #0000000000000000
00000000000358dc	movi.2d	v2, #0000000000000000
00000000000358e0	movi.2d	v3, #0000000000000000
00000000000358e4	mov	w1, #0x0
00000000000358e8	blr	x8
00000000000358ec	ldr	x0, [sp, #0x30]
00000000000358f0	ldr	x8, [x0]
00000000000358f4	ldr	x8, [x8, #0x60]
00000000000358f8	mov	w9, #0x42240000
00000000000358fc	fmov	s0, w9
0000000000035900	movi.2d	v1, #0000000000000000
0000000000035904	movi.2d	v2, #0000000000000000
0000000000035908	movi.2d	v3, #0000000000000000
000000000003590c	mov	w1, #0x0
0000000000035910	blr	x8
0000000000035914	ldr	x0, [sp, #0x30]
0000000000035918	ldr	x8, [x0]
000000000003591c	ldr	x8, [x8, #0x60]
0000000000035920	fmov	s0, #1.00000000
0000000000035924	movi.2d	v1, #0000000000000000
0000000000035928	movi.2d	v2, #0000000000000000
000000000003592c	movi.2d	v3, #0000000000000000
0000000000035930	mov	w1, #0x1
0000000000035934	blr	x8
0000000000035938	ldr	x0, [sp, #0x30]
000000000003593c	ldr	x8, [x0]
0000000000035940	ldr	x8, [x8, #0x78]
0000000000035944	mov	w1, #0x0
0000000000035948	mov	x2, x22
000000000003594c	blr	x8
0000000000035950	ldr	x8, [x22]
0000000000035954	ldr	x8, [x8, #0x18]
0000000000035958	mov	x0, x22
000000000003595c	blr	x8
0000000000035960	ldr	x8, [x22]
0000000000035964	ldr	x8, [x8, #0x18]
0000000000035968	mov	x0, x22
000000000003596c	blr	x8
0000000000035970	b	0x35b40
0000000000035974	ldr	x8, [x23]
0000000000035978	ldr	x8, [x8, #0x60]
000000000003597c	fmov	s8, #1.00000000
0000000000035980	fmov	s0, #1.00000000
0000000000035984	fmov	s1, #1.00000000
0000000000035988	fmov	s2, #1.00000000
000000000003598c	fmov	s3, #1.00000000
0000000000035990	mov	x0, x23
0000000000035994	mov	w1, #0x0
0000000000035998	blr	x8
000000000003599c	ldur	w8, [x29, #-0x68]
00000000000359a0	sub	w8, w8, #0x2
00000000000359a4	cmp	w8, #0x5
00000000000359a8	movi.2d	v0, #0000000000000000
00000000000359ac	fcsel	s0, s8, s0, lo
00000000000359b0	ldr	x8, [x23]
00000000000359b4	ldr	x8, [x8, #0x60]
00000000000359b8	mov	x0, x23
00000000000359bc	mov	w1, #0x1
00000000000359c0	mov.16b	v1, v0
00000000000359c4	mov.16b	v2, v0
00000000000359c8	mov.16b	v3, v0
00000000000359cc	blr	x8
00000000000359d0	ldr	x0, [sp, #0x30]
00000000000359d4	adrp	x8, 564 ; 0x269000
00000000000359d8	add	x8, x8, #0x9c0
00000000000359dc	ldursw	x9, [x29, #-0x68]
00000000000359e0	ldr	s0, [x8, x9, lsl #2]
00000000000359e4	ucvtf	s0, s0
00000000000359e8	ldr	x8, [x0]
00000000000359ec	ldr	x8, [x8, #0x60]
00000000000359f0	movi.2d	v1, #0000000000000000
00000000000359f4	movi.2d	v2, #0000000000000000
00000000000359f8	movi.2d	v3, #0000000000000000
00000000000359fc	mov	w1, #0x0
0000000000035a00	blr	x8
0000000000035a04	ldr	x0, [sp, #0x30]
0000000000035a08	ldur	d0, [x29, #-0x58]
0000000000035a0c	fcvt	s0, d0
0000000000035a10	cmp	w24, #0x0
0000000000035a14	fmov	s1, #1.00000000
0000000000035a18	fcsel	s0, s1, s0, ne
0000000000035a1c	ldr	x8, [x0]
0000000000035a20	ldr	x8, [x8, #0x60]
0000000000035a24	movi.2d	v1, #0000000000000000
0000000000035a28	movi.2d	v2, #0000000000000000
0000000000035a2c	movi.2d	v3, #0000000000000000
0000000000035a30	mov	w1, #0x1
0000000000035a34	blr	x8
0000000000035a38	ldr	x0, [sp, #0x30]
0000000000035a3c	ldur	d0, [x29, #-0x58]
0000000000035a40	fcvt	s0, d0
0000000000035a44	ldr	x8, [x0]
0000000000035a48	ldr	x8, [x8, #0x60]
0000000000035a4c	movi.2d	v1, #0000000000000000
0000000000035a50	movi.2d	v2, #0000000000000000
0000000000035a54	movi.2d	v3, #0000000000000000
0000000000035a58	mov	w1, #0x1
0000000000035a5c	blr	x8
0000000000035a60	ldr	x0, [sp, #0x30]
0000000000035a64	ldr	x8, [x0]
0000000000035a68	ldr	x8, [x8, #0x60]
0000000000035a6c	movi.2d	v0, #0000000000000000
0000000000035a70	movi.2d	v1, #0000000000000000
0000000000035a74	movi.2d	v2, #0000000000000000
0000000000035a78	movi.2d	v3, #0000000000000000
0000000000035a7c	mov	w1, #0x2
0000000000035a80	blr	x8
0000000000035a84	ldr	x8, [x22, #0x28]
0000000000035a88	cbnz	x8, 0x35af4
0000000000035a8c	mov	w0, #0x1c0
0000000000035a90	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000035a94	mov	x22, x0
0000000000035a98	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
0000000000035a9c	ldr	x2, [sp, #0x28]
0000000000035aa0	ldr	x8, [x22]
0000000000035aa4	ldr	x8, [x8, #0x78]
0000000000035aa8	mov	x0, x22
0000000000035aac	mov	w1, #0x0
0000000000035ab0	blr	x8
0000000000035ab4	ldr	x0, [sp, #0x28]
0000000000035ab8	cmp	x0, x22
0000000000035abc	b.eq	0x35ae4
0000000000035ac0	cbz	x0, 0x35ad0
0000000000035ac4	ldr	x8, [x0]
0000000000035ac8	ldr	x8, [x8, #0x18]
0000000000035acc	blr	x8
0000000000035ad0	str	x22, [sp, #0x28]
0000000000035ad4	ldr	x8, [x22]
0000000000035ad8	ldr	x8, [x8, #0x10]
0000000000035adc	mov	x0, x22
0000000000035ae0	blr	x8
0000000000035ae4	ldr	x8, [x22]
0000000000035ae8	ldr	x8, [x8, #0x18]
0000000000035aec	mov	x0, x22
0000000000035af0	blr	x8
0000000000035af4	ldp	x2, x0, [sp, #0x28]
0000000000035af8	ldr	x8, [x0]
0000000000035afc	ldr	x8, [x8, #0x78]
0000000000035b00	mov	w1, #0x0
0000000000035b04	blr	x8
0000000000035b08	ldr	x0, [sp, #0x30]
0000000000035b0c	ldr	x8, [x0]
0000000000035b10	ldr	x8, [x8, #0x78]
0000000000035b14	mov	w1, #0x1
0000000000035b18	mov	x2, x23
0000000000035b1c	blr	x8
0000000000035b20	ldr	x8, [x23]
0000000000035b24	ldr	x8, [x8, #0x18]
0000000000035b28	mov	x0, x23
0000000000035b2c	blr	x8
0000000000035b30	ldr	x8, [x23]
0000000000035b34	ldr	x8, [x8, #0x18]
0000000000035b38	mov	x0, x23
0000000000035b3c	blr	x8
0000000000035b40	add	x2, sp, #0x30
0000000000035b44	mov	x0, x21
0000000000035b48	mov	x3, x20
0000000000035b4c	mov	x4, x19
0000000000035b50	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000035b54	add	x2, sp, #0x30
0000000000035b58	mov	x0, x19
0000000000035b5c	bl	"_objc_msgSend$setHeliumRef:"
0000000000035b60	ldr	x0, [sp, #0x28]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (int)
    - parm3 (bool)
    - parm5 (bool)
    - parm6 (int)
    - parm4 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 5  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
```
