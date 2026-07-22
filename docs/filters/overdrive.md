# Overdrive

- **PAE class:** `Overdrive`
- **Plugin UUID:** `37C59CC3-8FD8-4460-A17E-71B32254FAD7`
- **Node names in corpus:** Overdrive (37), Glow (9)
- **Corpus usage:** 37 files, 46 instances

## What it does

Overdrive is a stylized bloom/edge-glow that extracts the brightest parts of the image, blurs and colorizes them into an inner and outer glow, and adds them back over the source for a hot, over-exposed neon look. Size controls how far the glow spreads, Intensity how hot it burns, and the two glow colors tint the inner core and outer halo. Rotation slightly rotates the glow kernel for a streaky flare.

> **Note.** Not implemented in the TS engine; description is the standard Apple Motion "Overdrive" glow filter. Exact glow kernel is unverified.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Intensity | float | 10 | 0 .. 100 | Strength/brightness of the glow that is added back, ~0-100 (default 10). |
| Size | float (pixels) | 30 | 1 .. 32 | Spread/blur radius of the glow, ~1-32 (default 30). |
| Rotation | float (radians) | 0.006854 | 0 .. 6.283 | Rotates the glow kernel, giving a streaky/directional flare. 0-2pi. |
| Inner Glow | color | - | - | Color of the hot inner core of the glow. |
| Outer Glow | color | - | - | Color of the softer outer halo. |
| Mix | float | 1 | 0 .. 0.7 | Wet/dry blend of the glow result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 12 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPremultToStraight`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPremultToStraight` → [`HgcPremultToStraight.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPremultToStraight.metal)

```metal
//Metal1.0     
//LEN=0000000122
[[ visible ]] FragmentOut HgcPremultToStraight_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    output.color0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    return output;
}
```

### CPU parameter wiring — `-[PAEOverdrive canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEOverdrive`

```asm
00000000000365a8	mov	w3, #0x2
00000000000365ac	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000365b0	ldr	d0, [sp, #0xa0]
00000000000365b4	fmul	d0, d8, d0
00000000000365b8	str	d0, [sp, #0xa0]
00000000000365bc	fcmp	d0, #0.0
00000000000365c0	b.ne	0x365d8
00000000000365c4	cbz	x21, 0x36764
00000000000365c8	add	x8, sp, #0x98
00000000000365cc	mov	x0, x21
00000000000365d0	bl	_objc_msgSend$heliumRef
00000000000365d4	b	0x36768
00000000000365d8	ldr	x4, [x22]
00000000000365dc	add	x2, sp, #0x98
00000000000365e0	mov	x0, x25
00000000000365e4	mov	w3, #0x1
00000000000365e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000365ec	ldr	x4, [x22]
00000000000365f0	add	x2, sp, #0x90
00000000000365f4	mov	x0, x25
00000000000365f8	mov	w3, #0x3
00000000000365fc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000036600	ldr	x6, [x22]
0000000000036604	add	x2, sp, #0x88
0000000000036608	add	x3, sp, #0x80
000000000003660c	add	x4, sp, #0x78
0000000000036610	mov	x0, x25
0000000000036614	mov	w5, #0x4
0000000000036618	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000003661c	ldr	x6, [x22]
0000000000036620	add	x2, sp, #0x70
0000000000036624	add	x3, sp, #0x68
0000000000036628	add	x4, sp, #0x60
000000000003662c	mov	x0, x25
0000000000036630	mov	w5, #0x5
0000000000036634	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000036638	ldr	x4, [x22]
000000000003663c	add	x2, sp, #0x5f
0000000000036640	mov	x0, x25
0000000000036644	mov	w3, #0x6
0000000000036648	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000003664c	ldr	x4, [x22]
0000000000036650	add	x2, sp, #0x5e
0000000000036654	mov	x0, x25
0000000000036658	mov	w3, #0x7
000000000003665c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000036660	ldr	d0, [sp, #0x88]
0000000000036664	adrp	x8, 563 ; 0x269000
0000000000036668	ldr	d9, [x8, #0xa20]
000000000003666c	fcmp	d0, d9
0000000000036670	fcsel	d0, d9, d0, mi
0000000000036674	adrp	x8, 563 ; 0x269000
0000000000036678	ldr	d8, [x8, #0xa28]
000000000003667c	mov.16b	v1, v8
0000000000036680	bl	0x252398 ; symbol stub for: _pow
0000000000036684	str	d0, [sp, #0x88]
0000000000036688	ldr	d0, [sp, #0x80]
000000000003668c	fcmp	d0, d9
0000000000036690	fcsel	d0, d9, d0, mi
0000000000036694	mov.16b	v1, v8
0000000000036698	bl	0x252398 ; symbol stub for: _pow
000000000003669c	str	d0, [sp, #0x80]
00000000000366a0	ldr	d0, [sp, #0x78]
00000000000366a4	fcmp	d0, d9
00000000000366a8	fcsel	d0, d9, d0, mi
00000000000366ac	mov.16b	v1, v8
00000000000366b0	bl	0x252398 ; symbol stub for: _pow
00000000000366b4	str	d0, [sp, #0x78]
00000000000366b8	ldr	d0, [sp, #0x70]
00000000000366bc	fcmp	d0, d9
00000000000366c0	fcsel	d0, d9, d0, mi
00000000000366c4	mov.16b	v1, v8
00000000000366c8	bl	0x252398 ; symbol stub for: _pow
00000000000366cc	str	d0, [sp, #0x70]
00000000000366d0	ldr	d0, [sp, #0x68]
00000000000366d4	fcmp	d0, d9
00000000000366d8	fcsel	d0, d9, d0, mi
00000000000366dc	mov.16b	v1, v8
00000000000366e0	bl	0x252398 ; symbol stub for: _pow
00000000000366e4	str	d0, [sp, #0x68]
00000000000366e8	ldr	d0, [sp, #0x60]
00000000000366ec	fcmp	d0, d9
00000000000366f0	fcsel	d0, d9, d0, mi
00000000000366f4	mov.16b	v1, v8
00000000000366f8	bl	0x252398 ; symbol stub for: _pow
00000000000366fc	str	d0, [sp, #0x60]
0000000000036700	ldr	d8, [sp, #0x98]
0000000000036704	ldr	x2, [x22]
0000000000036708	mov	x0, x26
000000000003670c	bl	"_objc_msgSend$getRenderMode:"
0000000000036710	cmp	w0, #0x0
0000000000036714	ccmp	w23, #0x3, #0x0, ne
0000000000036718	cset	w0, eq
000000000003671c	b.ne	0x36c98
0000000000036720	str	w0, [sp, #0x14]
0000000000036724	str	x26, [sp]
0000000000036728	str	x20, [sp, #0x18]
000000000003672c	mov	x0, x24
0000000000036730	bl	_objc_msgSend$versionAtCreation
0000000000036734	mov	x0, x21
0000000000036738	bl	_objc_msgSend$width
000000000003673c	mov	x25, x0
0000000000036740	mov	x0, x21
0000000000036744	bl	_objc_msgSend$height
0000000000036748	mov	x26, x0
000000000003674c	str	x21, [sp, #0x8]
0000000000036750	cbz	x21, 0x36790
0000000000036754	add	x8, sp, #0x50
0000000000036758	mov	x0, x21
000000000003675c	bl	_objc_msgSend$heliumRef
0000000000036760	b	0x36794
0000000000036764	str	xzr, [sp, #0x98]
0000000000036768	add	x2, sp, #0x98
000000000003676c	mov	x0, x20
0000000000036770	bl	"_objc_msgSend$setHeliumRef:"
0000000000036774	ldr	x0, [sp, #0x98]
0000000000036778	cbz	x0, 0x36788
000000000003677c	ldr	x8, [x0]
0000000000036780	ldr	x8, [x8, #0x18]
0000000000036784	blr	x8
0000000000036788	mov	w0, #0x1
000000000003678c	b	0x36c98
0000000000036790	str	xzr, [sp, #0x50]
0000000000036794	mov	w0, #0x1b0
0000000000036798	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003679c	mov	x24, x0
00000000000367a0	bl	0x251894 ; symbol stub for: __ZN7HGGammaC1Ev
00000000000367a4	ldr	x8, [x24]
00000000000367a8	ldr	x8, [x8, #0x60]
00000000000367ac	adrp	x9, 563 ; 0x269000
00000000000367b0	ldr	s0, [x9, #0xa38]
00000000000367b4	movi.2d	v1, #0000000000000000
00000000000367b8	movi.2d	v2, #0000000000000000
00000000000367bc	movi.2d	v3, #0000000000000000
00000000000367c0	mov	x0, x24
00000000000367c4	mov	w1, #0x0
00000000000367c8	str	x24, [sp, #0x38]
00000000000367cc	blr	x8
00000000000367d0	ldr	x2, [sp, #0x50]
00000000000367d4	ldr	x8, [x24]
00000000000367d8	ldr	x8, [x8, #0x78]
00000000000367dc	mov	x0, x24
00000000000367e0	mov	w1, #0x0
00000000000367e4	blr	x8
00000000000367e8	mov	w0, #0x1a0
00000000000367ec	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000367f0	str	x0, [sp, #0x40]
00000000000367f4	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
00000000000367f8	fcvtzs	x8, d8
00000000000367fc	cmp	x8, #0x1
0000000000036800	b.lt	0x36b90
0000000000036804	mov	x23, #0x0
0000000000036808	ucvtf	d0, x25, #0x1
000000000003680c	fmov	d1, #1.00000000
0000000000036810	fmov	d2, #0.50000000
0000000000036814	ucvtf	d3, x26, #0x1
0000000000036818	fdiv	d1, d1, d8
000000000003681c	fadd	d0, d0, d2
0000000000036820	fadd	d2, d3, d2
0000000000036824	fcvt	s8, d1
0000000000036828	fcvt	s1, d0
000000000003682c	fcvt	s0, d2
0000000000036830	stp	s0, s1, [sp, #0x30]
0000000000036834	lsl	x8, x8, #1
0000000000036838	cmp	x8, #0x1
000000000003683c	csinc	x8, x8, xzr, gt
0000000000036840	str	x8, [sp, #0x20]
0000000000036844	mov	x20, #0xaee5
0000000000036848	movk	x20, #0x2d9f, lsl #16
000000000003684c	movk	x20, #0x8656, lsl #32
0000000000036850	movk	x20, #0x446f, lsl #48
0000000000036854	mov	w22, #0x65
0000000000036858	adrp	x8, 563 ; 0x269000
000000000003685c	ldr	s13, [x8, #0x614]
0000000000036860	adrp	x8, 562 ; 0x268000
0000000000036864	ldr	d14, [x8, #0xdd8]
0000000000036868	adrp	x8, 563 ; 0x269000
000000000003686c	ldr	d15, [x8, #0xa30]
0000000000036870	mov	w21, #0xe529
0000000000036874	movk	w21, #0xa, lsl #16
0000000000036878	str	s8, [sp, #0x2c]
000000000003687c	mov	w0, #0x1b0
0000000000036880	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000036884	mov	x25, x0
0000000000036888	bl	__ZN11HOverdrive2C2Ev
000000000003688c	ldr	x8, [x25]
0000000000036890	ldr	x8, [x8, #0x60]
0000000000036894	movi.2d	v2, #0000000000000000
0000000000036898	movi.2d	v3, #0000000000000000
000000000003689c	mov	x0, x25
00000000000368a0	mov	w1, #0x2
00000000000368a4	ldp	s1, s0, [sp, #0x30]
00000000000368a8	blr	x8
00000000000368ac	ldr	d0, [sp, #0xa0]
00000000000368b0	fcmp	d0, #0.0
00000000000368b4	b.ne	0x368ec
00000000000368b8	ldr	x8, [x25]
00000000000368bc	ldr	x8, [x8, #0x60]
00000000000368c0	fmov	s11, #1.00000000
00000000000368c4	fmov	s0, #1.00000000
00000000000368c8	fmov	s1, #1.00000000
00000000000368cc	fmov	s2, #1.00000000
00000000000368d0	mov	x0, x25
00000000000368d4	mov	w1, #0x0
00000000000368d8	mov.16b	v3, v8
00000000000368dc	blr	x8
00000000000368e0	fmov	s1, #1.00000000
00000000000368e4	fmov	s2, #1.00000000
00000000000368e8	b	0x3692c
00000000000368ec	ldp	d1, d0, [sp, #0x80]
00000000000368f0	fcvt	s0, d0
00000000000368f4	fcvt	s1, d1
00000000000368f8	ldr	d2, [sp, #0x78]
00000000000368fc	fcvt	s2, d2
0000000000036900	ldr	x8, [x25]
0000000000036904	ldr	x8, [x8, #0x60]
0000000000036908	mov	x0, x25
000000000003690c	mov	w1, #0x0
0000000000036910	mov.16b	v3, v8
0000000000036914	blr	x8
0000000000036918	ldp	d0, d1, [sp, #0x68]
000000000003691c	fcvt	s11, d1
0000000000036920	fcvt	s1, d0
0000000000036924	ldr	d0, [sp, #0x60]
0000000000036928	fcvt	s2, d0
000000000003692c	ldr	x8, [x25]
0000000000036930	ldr	x8, [x8, #0x60]
0000000000036934	mov	x0, x25
0000000000036938	mov	w1, #0x1
000000000003693c	mov.16b	v0, v11
0000000000036940	mov.16b	v3, v8
0000000000036944	blr	x8
0000000000036948	ldr	x8, [x25]
000000000003694c	ldr	x8, [x8, #0x78]
0000000000036950	mov	x0, x25
0000000000036954	mov	w1, #0x1
0000000000036958	mov	x2, x24
000000000003695c	blr	x8
0000000000036960	ldr	x8, [x25]
0000000000036964	ldr	x8, [x8, #0x78]
0000000000036968	mov	x0, x25
000000000003696c	mov	w1, #0x0
0000000000036970	ldr	x2, [sp, #0x40]
0000000000036974	blr	x8
0000000000036978	ldrb	w8, [sp, #0x5e]
000000000003697c	ldr	x9, [x25]
0000000000036980	ldr	x9, [x9, #0x60]
0000000000036984	cmp	w8, #0x0
0000000000036988	mov	w8, #0x7f7fffff
000000000003698c	fmov	s0, w8
0000000000036990	fmov	s1, #1.00000000
0000000000036994	fcsel	s0, s1, s0, ne
0000000000036998	movi.2d	v1, #0000000000000000
000000000003699c	movi.2d	v2, #0000000000000000
00000000000369a0	movi.2d	v3, #0000000000000000
00000000000369a4	mov	x0, x25
00000000000369a8	mov	w1, #0x12
00000000000369ac	blr	x9
00000000000369b0	ldr	x8, [sp, #0x40]
00000000000369b4	cmp	x8, x25
00000000000369b8	b.eq	0x369e4
00000000000369bc	cbz	x8, 0x369d0
00000000000369c0	ldr	x0, [sp, #0x40]
00000000000369c4	ldr	x8, [x0]
00000000000369c8	ldr	x8, [x8, #0x18]
00000000000369cc	blr	x8
00000000000369d0	ldr	x8, [x25]
00000000000369d4	ldr	x8, [x8, #0x10]
00000000000369d8	str	x25, [sp, #0x40]
00000000000369dc	mov	x0, x25
00000000000369e0	blr	x8
00000000000369e4	mov	w26, #0x8
00000000000369e8	ldr	x24, [sp, #0xb8]
00000000000369ec	ldr	d12, [sp, #0xa0]
00000000000369f0	fcvt	s0, d12
00000000000369f4	umulh	x8, x24, x20
00000000000369f8	sub	x9, x24, x8
00000000000369fc	add	x8, x8, x9, lsr #1
0000000000036a00	lsr	x8, x8, #6
0000000000036a04	msub	x8, x8, x22, x24
0000000000036a08	ldr	x9, [x28, x8, lsl #3]
0000000000036a0c	add	x10, x27, x9, lsl #12
0000000000036a10	umulh	x11, x10, x19
0000000000036a14	lsr	x11, x11, #18
0000000000036a18	msub	x10, x11, x21, x10
0000000000036a1c	str	x10, [x28, x8, lsl #3]
0000000000036a20	ucvtf	s1, x9
0000000000036a24	fdiv	s1, s1, s13
0000000000036a28	fadd	s2, s0, s0
0000000000036a2c	fmul	s1, s2, s1
0000000000036a30	fsub	s10, s1, s0
0000000000036a34	umulh	x8, x9, x20
0000000000036a38	sub	x10, x9, x8
0000000000036a3c	add	x8, x8, x10, lsr #1
0000000000036a40	lsr	x8, x8, #6
0000000000036a44	msub	x8, x8, x22, x9
0000000000036a48	ldr	x9, [x28, x8, lsl #3]
0000000000036a4c	add	x10, x27, x9, lsl #12
0000000000036a50	umulh	x11, x10, x19
0000000000036a54	lsr	x11, x11, #18
0000000000036a58	msub	x10, x11, x21, x10
0000000000036a5c	str	x10, [x28, x8, lsl #3]
0000000000036a60	ucvtf	s1, x9
0000000000036a64	fdiv	s1, s1, s13
0000000000036a68	fmul	s1, s2, s1
0000000000036a6c	fsub	s8, s1, s0
0000000000036a70	ldr	d9, [sp, #0x90]
0000000000036a74	umulh	x8, x9, x20
0000000000036a78	sub	x10, x9, x8
0000000000036a7c	add	x8, x8, x10, lsr #1
0000000000036a80	lsr	x8, x8, #6
0000000000036a84	msub	x8, x8, x22, x9
0000000000036a88	ldr	x24, [x28, x8, lsl #3]
0000000000036a8c	add	x9, x27, x24, lsl #12
0000000000036a90	umulh	x10, x9, x19
0000000000036a94	lsr	x10, x10, #18
0000000000036a98	msub	x9, x10, x21, x9
0000000000036a9c	str	x9, [x28, x8, lsl #3]
0000000000036aa0	fcvt	d0, s10
0000000000036aa4	fcvt	d1, s8
0000000000036aa8	bl	0x2521f4 ; symbol stub for: _hypot
0000000000036aac	mov.16b	v11, v0
0000000000036ab0	sub	w1, w26, #0x5
0000000000036ab4	fneg	s0, s10
0000000000036ab8	fneg	s1, s8
0000000000036abc	ldr	x8, [x25]
0000000000036ac0	ldr	x8, [x8, #0x60]
0000000000036ac4	movi.2d	v2, #0000000000000000
0000000000036ac8	movi.2d	v3, #0000000000000000
0000000000036acc	mov	x0, x25
0000000000036ad0	blr	x8
0000000000036ad4	fcvt	s0, d9
0000000000036ad8	fadd	s1, s0, s0
0000000000036adc	ucvtf	s2, x24
0000000000036ae0	fdiv	s2, s2, s13
0000000000036ae4	fmul	s1, s1, s2
0000000000036ae8	fsub	s0, s1, s0
0000000000036aec	fcvt	d0, s0
0000000000036af0	fmul	d0, d0, d14
0000000000036af4	fdiv	d0, d0, d15
0000000000036af8	fcvt	s0, d0
0000000000036afc	bl	0x252068 ; symbol stub for: ___sincosf_stret
0000000000036b00	mov.16b	v4, v1
0000000000036b04	fneg	s1, s0
0000000000036b08	ldr	x8, [x25]
0000000000036b0c	ldr	x8, [x8, #0x60]
0000000000036b10	movi.2d	v2, #0000000000000000
0000000000036b14	movi.2d	v3, #0000000000000000
0000000000036b18	mov	x0, x25
0000000000036b1c	mov	x1, x26
0000000000036b20	mov.16b	v0, v4
0000000000036b24	blr	x8
0000000000036b28	fcvt	s0, d11
0000000000036b2c	fcvt	d0, s0
0000000000036b30	fdiv	d0, d0, d12
0000000000036b34	fcvt	s0, d0
0000000000036b38	ldr	x8, [x25]
0000000000036b3c	ldr	x8, [x8, #0x60]
0000000000036b40	add	w1, w26, #0x5
0000000000036b44	movi.2d	v1, #0000000000000000
0000000000036b48	movi.2d	v2, #0000000000000000
0000000000036b4c	movi.2d	v3, #0000000000000000
0000000000036b50	mov	x0, x25
0000000000036b54	blr	x8
0000000000036b58	add	w26, w26, #0x1
0000000000036b5c	cmp	w26, #0xd
0000000000036b60	b.ne	0x369ec
0000000000036b64	str	x24, [sp, #0xb8]
0000000000036b68	ldr	x8, [x25]
0000000000036b6c	ldr	x8, [x8, #0x18]
0000000000036b70	mov	x0, x25
0000000000036b74	blr	x8
0000000000036b78	add	x23, x23, #0x1
0000000000036b7c	ldr	x8, [sp, #0x20]
0000000000036b80	cmp	x23, x8
0000000000036b84	ldr	x24, [sp, #0x38]
0000000000036b88	ldr	s8, [sp, #0x2c]
0000000000036b8c	b.ne	0x3687c
0000000000036b90	mov	w0, #0x1b0
0000000000036b94	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000036b98	mov	x25, x0
0000000000036b9c	bl	0x251894 ; symbol stub for: __ZN7HGGammaC1Ev
0000000000036ba0	ldr	x8, [x25]
0000000000036ba4	ldr	x8, [x8, #0x60]
0000000000036ba8	adrp	x9, 563 ; 0x269000
0000000000036bac	ldr	s0, [x9, #0xa3c]
0000000000036bb0	movi.2d	v1, #0000000000000000
0000000000036bb4	movi.2d	v2, #0000000000000000
0000000000036bb8	movi.2d	v3, #0000000000000000
0000000000036bbc	mov	x0, x25
0000000000036bc0	mov	w1, #0x0
0000000000036bc4	blr	x8
0000000000036bc8	ldr	x8, [x25]
0000000000036bcc	ldr	x8, [x8, #0x78]
0000000000036bd0	mov	x0, x25
0000000000036bd4	mov	w1, #0x0
0000000000036bd8	ldr	x2, [sp, #0x40]
0000000000036bdc	blr	x8
0000000000036be0	mov	w0, #0x1a0
0000000000036be4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000036be8	mov	x26, x0
0000000000036bec	bl	__ZN20HgcPremultToStraightC1Ev
0000000000036bf0	str	x26, [sp, #0x48]
0000000000036bf4	ldr	x8, [x26]
0000000000036bf8	ldr	x8, [x8, #0x78]
0000000000036bfc	mov	x0, x26
0000000000036c00	mov	w1, #0x0
0000000000036c04	mov	x2, x25
0000000000036c08	blr	x8
0000000000036c0c	ldr	x19, [sp, #0x18]
0000000000036c10	ldrb	w8, [sp, #0x5f]
0000000000036c14	cmp	w8, #0x1
0000000000036c18	b.ne	0x36c2c
0000000000036c1c	add	x2, sp, #0x48
0000000000036c20	ldp	x0, x3, [sp]
0000000000036c24	mov	x4, x19
0000000000036c28	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000036c2c	add	x2, sp, #0x48
0000000000036c30	mov	x0, x19
0000000000036c34	bl	"_objc_msgSend$setHeliumRef:"
0000000000036c38	ldr	x0, [sp, #0x48]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm3 (float)
    - parm4 (colour)
    - parm5 (colour)
    - parm6 (bool)
    - parm7 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm2 (float), parm7 (bool), parm1 (float)
    slot 2  <-  (constant / computed)
    slot 0  <-  parm2 (float)
    slot 0  <-  parm7 (bool)
    slot 1  <-  parm7 (bool)
    slot 18  <-  parm2 (float), parm3 (float)
    slot 18  <-  (constant / computed)
    slot 18  <-  parm7 (bool)
    slot 0  <-  (constant / computed)
```
