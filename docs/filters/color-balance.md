# Color Balance

- **PAE class:** `Color Balance`
- **Plugin UUID:** `E9B93275-A56D-4012-BEF6-5DD59A74B344`
- **Node names in corpus:** Color Balance (255), Color Balance Master (2), Color Balance - Green (1), Color Balance - Blue (1), Color Balance Wheel (1), Color Balance RGB (1)
- **Corpus usage:** 196 files, 262 instances

## What it does

Color Balance shifts the color in three tonal ranges independently -- Shadows, Midtones and Highlights -- letting you warm the shadows and cool the highlights (or any combination) for color grading. Boost controls overall intensity and Clip Color Values sets clamping behavior. It is the classic three-way color-grade control.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Color Balance". The exact luminance masks that separate shadows/mids/highlights are unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Shadows | color | - | - | Color shift applied to the darkest tones (nested Red/Green/Blue + Color Space). *(keyframed in 2 instances)* |
| Midtones | color | - | - | Color shift applied to the mid tones (nested RGB + Color Space). *(keyframed in 2 instances)* |
| Highlights | color | - | - | Color shift applied to the brightest tones (nested RGB + Color Space). *(keyframed in 2 instances)* |
| Boost | float | 0 | 0 .. 1.003 | Overall strength of the three-way balance, 0-1. *(keyframed in 1 instance)* |
| Clip Color Values | enum(int) | 0 | 0 .. 3 | How out-of-range values are clamped, 0-3. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the graded result over the original, 0-1 continuous. *(keyframed in 74 instances)* |
| ColorBalance::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle (Rec.709 HDR). Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcChannelBalance`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcChannelBalance` → [`HgcChannelBalance.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcChannelBalance.metal)

```metal
//Metal1.0     
//LEN=000000038a
[[ visible ]] FragmentOut HgcChannelBalance_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.5000000000, 2.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = hg_Params[2].xyz - hg_Params[1].xyz;
    r3.xyz = r1.xyz - c0.xxx;
    r3.xyz = r3.xyz*r2.xyz;
    r3.xyz = r3.xyz + r3.xyz;
    r2.xyz = hg_Params[1].xyz - hg_Params[0].xyz;
    r2.xyz = r2.xyz*r1.xyz;
    r4.xyz = float3(r1.xyz >= c0.xxx);
    r3.xyz = r3.xyz + hg_Params[1].xyz;
    r4.xyz = r3.xyz*r4.xyz;
    r2.xyz = r2.xyz*c0.yyy + hg_Params[0].xyz;
    r1.xyz = float3(r1.xyz < c0.xxx);
    r1.xyz = r2.xyz*r1.xyz + r4.xyz;
    r1.w = r0.w;
    r1.xyz = r1.xyz*r0.www;
    output.color0 = mix(r0, r1, hg_Params[3]);
    return output;
}
```

### CPU parameter wiring — `-[PAEColorBalance canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEColorBalance`

```asm
000000000001869c	mov	w5, #0xa
00000000000186a0	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
00000000000186a4	add	x25, sp, #0x50
00000000000186a8	ldr	x6, [x23]
00000000000186ac	add	x2, sp, #0x50
00000000000186b0	orr	x3, x25, #0x8
00000000000186b4	add	x4, x25, #0x10
00000000000186b8	mov	x0, x24
00000000000186bc	mov	w5, #0xb
00000000000186c0	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
00000000000186c4	ldr	q0, [sp, #0x50]
00000000000186c8	fcvtn	v0.2s, v0.2d
00000000000186cc	fmov.2s	v1, #1.00000000
00000000000186d0	fcmgt.2s	v2, v0, v1
00000000000186d4	bif.8b	v1, v0, v2
00000000000186d8	fcmlt.2s	v0, v0, #0.0
00000000000186dc	bic.8b	v0, v1, v0
00000000000186e0	fcvtl	v0.2d, v0.2s
00000000000186e4	str	q0, [sp, #0x50]
00000000000186e8	ldur	d0, [x25, #0x10]
00000000000186ec	fcvt	s0, d0
00000000000186f0	fmov	s1, #1.00000000
00000000000186f4	fcmp	s0, s1
00000000000186f8	fcsel	s1, s1, s0, gt
00000000000186fc	fcmp	s0, #0.0
0000000000018700	movi.2d	v0, #0000000000000000
0000000000018704	fcsel	s0, s0, s1, mi
0000000000018708	fcvt	d0, s0
000000000001870c	stur	d0, [x25, #0x10]
0000000000018710	add	x8, sp, #0x38
0000000000018714	ldr	x6, [x23]
0000000000018718	add	x2, sp, #0x38
000000000001871c	add	x3, x8, #0x8
0000000000018720	add	x4, x8, #0x10
0000000000018724	mov	x0, x24
0000000000018728	mov	w5, #0xc
000000000001872c	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000018730	ldr	x4, [x23]
0000000000018734	add	x2, sp, #0x28
0000000000018738	mov	x0, x24
000000000001873c	mov	w3, #0xd
0000000000018740	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000018744	ldr	x4, [x23]
0000000000018748	add	x2, sp, #0x30
000000000001874c	mov	x0, x24
0000000000018750	mov	w3, #0xe
0000000000018754	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000018758	ldr	x4, [x23]
000000000001875c	add	x2, sp, #0x2f
0000000000018760	mov	x0, x24
0000000000018764	mov	w3, #0xf
0000000000018768	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001876c	movi.2d	v15, #0000000000000000
0000000000018770	fmov	s12, #0.50000000
0000000000018774	fmov	s0, #1.00000000
0000000000018778	stp	s0, s0, [sp]
000000000001877c	fmov	s11, #1.00000000
0000000000018780	fmov	s13, #0.50000000
0000000000018784	fmov	s14, #0.50000000
0000000000018788	movi.2d	v9, #0000000000000000
000000000001878c	movi.2d	v10, #0000000000000000
0000000000018790	b	0x188d4
0000000000018794	ldr	x4, [x23]
0000000000018798	add	x2, sp, #0x68
000000000001879c	mov	x0, x24
00000000000187a0	mov	w3, #0x1
00000000000187a4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000187a8	ldr	x4, [x23]
00000000000187ac	add	x8, sp, #0x68
00000000000187b0	add	x2, x8, #0x8
00000000000187b4	mov	x0, x24
00000000000187b8	mov	w3, #0x2
00000000000187bc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000187c0	add	x27, sp, #0x68
00000000000187c4	ldr	x4, [x23]
00000000000187c8	add	x2, x27, #0x10
00000000000187cc	mov	x0, x24
00000000000187d0	mov	w3, #0x3
00000000000187d4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000187d8	ldr	x4, [x23]
00000000000187dc	add	x19, sp, #0x50
00000000000187e0	add	x2, sp, #0x50
00000000000187e4	mov	x0, x24
00000000000187e8	mov	w3, #0x4
00000000000187ec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000187f0	orr	x25, x19, #0x8
00000000000187f4	ldr	x4, [x23]
00000000000187f8	mov	x0, x24
00000000000187fc	mov	x2, x25
0000000000018800	mov	w3, #0x5
0000000000018804	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000018808	add	x28, sp, #0x50
000000000001880c	ldr	x4, [x23]
0000000000018810	add	x2, x28, #0x10
0000000000018814	mov	x0, x24
0000000000018818	mov	w3, #0x6
000000000001881c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000018820	ldr	x4, [x23]
0000000000018824	add	x26, sp, #0x38
0000000000018828	add	x2, sp, #0x38
000000000001882c	mov	x0, x24
0000000000018830	mov	w3, #0x7
0000000000018834	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000018838	ldr	x4, [x23]
000000000001883c	add	x2, x26, #0x8
0000000000018840	mov	x0, x24
0000000000018844	mov	w3, #0x8
0000000000018848	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001884c	add	x19, sp, #0x38
0000000000018850	ldr	x4, [x23]
0000000000018854	add	x2, x19, #0x10
0000000000018858	mov	x0, x24
000000000001885c	mov	w3, #0x9
0000000000018860	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000018864	ldr	d0, [sp, #0x38]
0000000000018868	fmov	d1, #1.00000000
000000000001886c	fadd	d0, d0, d1
0000000000018870	ldur	d2, [x26, #0x8]
0000000000018874	fadd	d2, d2, d1
0000000000018878	ldur	d3, [x19, #0x10]
000000000001887c	fadd	d1, d3, d1
0000000000018880	ldr	d3, [sp, #0x50]
0000000000018884	fmov	d4, #0.50000000
0000000000018888	fadd	d3, d3, d4
000000000001888c	ldr	d5, [x25]
0000000000018890	fadd	d5, d5, d4
0000000000018894	ldur	d6, [x28, #0x10]
0000000000018898	fadd	d4, d6, d4
000000000001889c	ldr	d6, [sp, #0x68]
00000000000188a0	add	x8, sp, #0x68
00000000000188a4	ldur	d7, [x8, #0x8]
00000000000188a8	ldur	d16, [x27, #0x10]
00000000000188ac	fcvt	s10, d6
00000000000188b0	fcvt	s9, d7
00000000000188b4	fcvt	s15, d16
00000000000188b8	fcvt	s12, d3
00000000000188bc	fcvt	s13, d5
00000000000188c0	fcvt	s14, d4
00000000000188c4	fcvt	s3, d0
00000000000188c8	fcvt	s0, d2
00000000000188cc	stp	s0, s3, [sp]
00000000000188d0	fcvt	s11, d1
00000000000188d4	ldr	x2, [x23]
00000000000188d8	mov	x0, x24
00000000000188dc	bl	"_objc_msgSend$mixAmountAtTime:"
00000000000188e0	mov.16b	v8, v0
00000000000188e4	ldr	x2, [x23]
00000000000188e8	mov	x0, x22
00000000000188ec	bl	"_objc_msgSend$getRenderMode:"
00000000000188f0	cbz	w0, 0x189c4
00000000000188f4	mov	x0, x20
00000000000188f8	bl	_objc_msgSend$imageType
00000000000188fc	cmp	x0, #0x3
0000000000018900	b.ne	0x189c0
0000000000018904	cbz	x20, 0x18a0c
0000000000018908	add	x8, sp, #0x20
000000000001890c	mov	x0, x20
0000000000018910	bl	_objc_msgSend$heliumRef
0000000000018914	cbz	w21, 0x18a14
0000000000018918	ldr	w20, [sp, #0x28]
000000000001891c	ldr	d0, [sp, #0x30]
0000000000018920	fmov	d9, #1.00000000
0000000000018924	fadd	d3, d0, d9
0000000000018928	str	d3, [sp, #0x30]
000000000001892c	ldr	x0, [sp, #0x20]
0000000000018930	str	x0, [sp, #0x10]
0000000000018934	ldr	x19, [sp, #0x8]
0000000000018938	cbz	x0, 0x1894c
000000000001893c	ldr	x8, [x0]
0000000000018940	ldr	x8, [x8, #0x10]
0000000000018944	blr	x8
0000000000018948	ldr	d3, [sp, #0x30]
000000000001894c	and	w8, w20, #0xfffffffe
0000000000018950	and	w9, w20, #0xfffffffd
0000000000018954	cmp	w9, #0x1
0000000000018958	fmov	d0, #-1.00000000
000000000001895c	fcsel	d1, d0, d9, eq
0000000000018960	cmp	w8, #0x2
0000000000018964	fcsel	d2, d0, d9, eq
0000000000018968	ldrb	w4, [sp, #0x2f]
000000000001896c	add	x8, sp, #0x18
0000000000018970	add	x0, sp, #0x10
0000000000018974	add	x1, sp, #0x68
0000000000018978	add	x2, sp, #0x38
000000000001897c	add	x3, sp, #0x50
0000000000018980	mov.16b	v0, v8
0000000000018984	bl	0x250d9c ; symbol stub for: __Z18createColorBalance5HGRefI6HGNodeEPKdS3_S3_ddddb
0000000000018988	ldr	x0, [sp, #0x10]
000000000001898c	cbz	x0, 0x1899c
0000000000018990	ldr	x8, [x0]
0000000000018994	ldr	x8, [x8, #0x18]
0000000000018998	blr	x8
000000000001899c	add	x2, sp, #0x18
00000000000189a0	mov	x0, x19
00000000000189a4	bl	"_objc_msgSend$setHeliumRef:"
00000000000189a8	ldr	x0, [sp, #0x18]
00000000000189ac	cbz	x0, 0x18af0
00000000000189b0	ldr	x8, [x0]
00000000000189b4	ldr	x8, [x8, #0x18]
00000000000189b8	blr	x8
00000000000189bc	b	0x18af0
00000000000189c0	mov	w0, #0x0
00000000000189c4	ldr	x8, [sp, #0x80]
00000000000189c8	adrp	x9, 881 ; 0x389000
00000000000189cc	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
00000000000189d0	ldr	x9, [x9]
00000000000189d4	cmp	x9, x8
00000000000189d8	b.ne	0x18b0c
00000000000189dc	ldp	x29, x30, [sp, #0x120]
00000000000189e0	ldp	x20, x19, [sp, #0x110]
00000000000189e4	ldp	x22, x21, [sp, #0x100]
00000000000189e8	ldp	x24, x23, [sp, #0xf0]
00000000000189ec	ldp	x26, x25, [sp, #0xe0]
00000000000189f0	ldp	x28, x27, [sp, #0xd0]
00000000000189f4	ldp	d9, d8, [sp, #0xc0]
00000000000189f8	ldp	d11, d10, [sp, #0xb0]
00000000000189fc	ldp	d13, d12, [sp, #0xa0]
0000000000018a00	ldp	d15, d14, [sp, #0x90]
0000000000018a04	add	sp, sp, #0x130
0000000000018a08	ret
0000000000018a0c	str	xzr, [sp, #0x20]
0000000000018a10	cbnz	w21, 0x18918
0000000000018a14	mov	w0, #0x1a0
0000000000018a18	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000018a1c	mov	x20, x0
0000000000018a20	bl	__ZN17HgcChannelBalanceC1Ev
0000000000018a24	ldr	x19, [sp, #0x8]
0000000000018a28	str	x20, [sp, #0x18]
0000000000018a2c	ldr	x8, [x20]
0000000000018a30	ldr	x8, [x8, #0x60]
0000000000018a34	fmov	s3, #1.00000000
0000000000018a38	mov	x0, x20
0000000000018a3c	mov	w1, #0x0
0000000000018a40	mov.16b	v0, v10
0000000000018a44	mov.16b	v1, v9
0000000000018a48	mov.16b	v2, v15
0000000000018a4c	blr	x8
0000000000018a50	ldr	x8, [x20]
0000000000018a54	ldr	x8, [x8, #0x60]
0000000000018a58	fmov	s3, #1.00000000
0000000000018a5c	mov	x0, x20
0000000000018a60	mov	w1, #0x1
0000000000018a64	mov.16b	v0, v12
0000000000018a68	mov.16b	v1, v13
0000000000018a6c	mov.16b	v2, v14
0000000000018a70	blr	x8
0000000000018a74	ldr	x8, [x20]
0000000000018a78	ldr	x8, [x8, #0x60]
0000000000018a7c	fmov	s3, #1.00000000
0000000000018a80	mov	x0, x20
0000000000018a84	mov	w1, #0x2
0000000000018a88	ldp	s1, s0, [sp]
0000000000018a8c	mov.16b	v2, v11
0000000000018a90	blr	x8
0000000000018a94	fcvt	s0, d8
0000000000018a98	ldr	x8, [x20]
0000000000018a9c	ldr	x8, [x8, #0x60]
0000000000018aa0	mov	x0, x20
0000000000018aa4	mov	w1, #0x3
0000000000018aa8	mov.16b	v1, v0
0000000000018aac	mov.16b	v2, v0
0000000000018ab0	mov.16b	v3, v0
0000000000018ab4	blr	x8
0000000000018ab8	ldr	x2, [sp, #0x20]
0000000000018abc	ldr	x8, [x20]
0000000000018ac0	ldr	x8, [x8, #0x78]
0000000000018ac4	mov	x0, x20
0000000000018ac8	mov	w1, #0x0
0000000000018acc	blr	x8
0000000000018ad0	add	x2, sp, #0x18
0000000000018ad4	mov	x0, x19
0000000000018ad8	bl	"_objc_msgSend$setHeliumRef:"
0000000000018adc	ldr	x0, [sp, #0x18]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm10 (colour)
    - parm11 (colour)
    - parm12 (colour)
    - parm13 (int)
    - parm14 (float)
    - parm15 (bool)
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)
    - parm7 (float)
    - parm8 (float)
    - parm9 (float)
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm4 (float), parm7 (float), parm1 (float), parm14 (float), host Mix
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  host Mix
```
