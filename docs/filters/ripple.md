# Ripple

- **PAE class:** `Ripple`
- **Plugin UUID:** `F6D546C6-5F27-4E9D-9814-960565D6F403`
- **Node names in corpus:** Ripple (5)
- **Corpus usage:** 5 files, 5 instances

## What it does

Ripple sends concentric circular waves rippling out from Center, displacing pixels radially like a stone dropped in water. Amplitude sets the wave height; animate it (or Center) for an expanding ripple.

> **Note.** Not implemented; description is the standard Apple Motion "Ripple" distortion filter. Amplitude was sampled as int in a tiny corpus (5 files) — treat as continuous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float | 50 | 0 .. 4 | Height/strength of the ripple waves (default ~50; corpus samples 0-4). Continuous float. *(keyframed in 1 instance)* |
| Center | point2D | - | - | Center the ripples emanate from (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGArrayI13SRippleVertexL8HGFormat0EE`, `HGArrayI7HGVec2fL8HGFormat13EE`, `HGArrayI7HGVec3fL8HGFormat21EE`, `HGCrop`, `HGGLNode`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

### CPU render method — `-[PAERipple canThrowRenderOutputHe:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERipple`

```asm
000000000005949c	mov	x4, x24
00000000000594a0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000594a4	ldur	d0, [x29, #-0xb8]
00000000000594a8	fcmp	d0, #0.0
00000000000594ac	b.ne	0x594c4
00000000000594b0	cbz	x22, 0x599c0
00000000000594b4	add	x8, sp, #0xb8
00000000000594b8	mov	x0, x22
00000000000594bc	bl	_objc_msgSend$heliumRef
00000000000594c0	b	0x599c4
00000000000594c4	sub	x2, x29, #0xc0
00000000000594c8	add	x3, sp, #0xc8
00000000000594cc	mov	x0, x23
00000000000594d0	mov	w4, #0x1
00000000000594d4	mov	x5, x24
00000000000594d8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000594dc	mov	x0, x22
00000000000594e0	bl	_objc_msgSend$width
00000000000594e4	mov	x20, x0
00000000000594e8	mov	x0, x22
00000000000594ec	bl	_objc_msgSend$height
00000000000594f0	fmov	d0, x20
00000000000594f4	mov.d	v0[1], x0
00000000000594f8	ucvtf.2d	v0, v0
00000000000594fc	ldr	q1, [sp, #0x20]
0000000000059500	fdiv.2d	v1, v0, v1
0000000000059504	fmov.2d	v0, #0.50000000
0000000000059508	fmul.2d	v2, v1, v0
000000000005950c	fmov	d0, #-0.50000000
0000000000059510	fmul	d8, d0, d1
0000000000059514	stp	q2, q1, [sp, #0x50]
0000000000059518	fmul.d	d9, d0, v1[1]
000000000005951c	ldur	d0, [x29, #-0xc0]
0000000000059520	fsub	d1, d2, d8
0000000000059524	fmul	d0, d0, d1
0000000000059528	fadd	d3, d8, d0
000000000005952c	ldr	d0, [sp, #0xc8]
0000000000059530	mov	d10, v2[1]
0000000000059534	fsub	d1, d10, d9
0000000000059538	fmul	d0, d0, d1
000000000005953c	fadd	d0, d9, d0
0000000000059540	str	d0, [sp, #0xc8]
0000000000059544	ldur	d0, [x29, #-0xb8]
0000000000059548	mov	x8, #0x4049000000000000
000000000005954c	fmov	d1, x8
0000000000059550	fdiv	d0, d0, d1
0000000000059554	adrp	x8, 528 ; 0x269000
0000000000059558	ldr	d1, [x8, #0xe38]
000000000005955c	fmul	d0, d0, d1
0000000000059560	stp	d3, d0, [x29, #-0xc0]
0000000000059564	add	x0, sp, #0xb8
0000000000059568	bl	__ZN7HGArrayI13SRippleVertexL8HGFormat0EEC2Ev
000000000005956c	str	d12, [sp, #0x8]
0000000000059570	str	s11, [sp, #0x10]
0000000000059574	add	x0, sp, #0xb8
0000000000059578	mov	w1, #0x13ec
000000000005957c	bl	__ZN7HGArrayI13SRippleVertexL8HGFormat0EE6resizeEi
0000000000059580	mov	w8, #0x0
0000000000059584	mov	x26, #0x0
0000000000059588	ldr	q1, [sp, #0x50]
000000000005958c	fcvtn	v0.2s, v1.2d
0000000000059590	str	d0, [sp, #0x18]
0000000000059594	ldr	q0, [sp, #0x60]
0000000000059598	fcvtzs	w9, d0
000000000005959c	fcvtzs	w10, d8
00000000000595a0	fcvtzs	w11, d9
00000000000595a4	mov	d0, v0[1]
00000000000595a8	fcvtzs	w12, d1
00000000000595ac	sub	w12, w12, w10
00000000000595b0	scvtf	s1, w12
00000000000595b4	fcvtzs	w12, d10
00000000000595b8	sub	w12, w12, w11
00000000000595bc	scvtf	s2, w12
00000000000595c0	adrp	x12, 528 ; 0x269000
00000000000595c4	ldr	s3, [x12, #0xe40]
00000000000595c8	fcvtzs	w12, d0
00000000000595cc	fmul	s11, s1, s3
00000000000595d0	scvtf	s0, w9
00000000000595d4	fmul	s1, s2, s3
00000000000595d8	str	s1, [sp, #0x50]
00000000000595dc	fmul	s13, s0, s3
00000000000595e0	scvtf	s0, w12
00000000000595e4	scvtf	s14, w10
00000000000595e8	fmul	s0, s0, s3
00000000000595ec	str	s0, [sp, #0x40]
00000000000595f0	scvtf	s0, w11
00000000000595f4	str	s0, [sp, #0x30]
00000000000595f8	movi.2d	v9, #0000000000000000
00000000000595fc	adrp	x9, 528 ; 0x269000
0000000000059600	ldr	q0, [x9, #0xe50]
0000000000059604	str	q0, [sp, #0x60]
0000000000059608	mov	x27, #0x0
000000000005960c	ucvtf	s0, x26
0000000000059610	ldr	s2, [sp, #0x50]
0000000000059614	fmul	s1, s2, s0
0000000000059618	ldr	s3, [sp, #0x40]
000000000005961c	fmul	s0, s3, s0
0000000000059620	ldr	s4, [sp, #0x30]
0000000000059624	fadd	s8, s1, s4
0000000000059628	fadd	s12, s0, s9
000000000005962c	fadd	s15, s2, s8
0000000000059630	fadd	s10, s3, s12
0000000000059634	mov	x20, x8
0000000000059638	add	x0, sp, #0xb8
000000000005963c	mov	x1, x8
0000000000059640	bl	__ZN14HGArrayDataRef7elementEi
0000000000059644	mov	x25, x0
0000000000059648	ldrsw	x28, [sp, #0xc0]
000000000005964c	add	w24, w20, #0x1
0000000000059650	add	x0, sp, #0xb8
0000000000059654	mov	x1, x24
0000000000059658	bl	__ZN14HGArrayDataRef7elementEi
000000000005965c	add	x8, x25, x28
0000000000059660	ldrsw	x9, [sp, #0xc0]
0000000000059664	ucvtf	s0, x27
0000000000059668	add	x9, x0, x9
000000000005966c	fmul	s1, s11, s0
0000000000059670	fadd	s1, s1, s14
0000000000059674	stp	s1, s8, [x8, #0x8]
0000000000059678	fmul	s0, s13, s0
000000000005967c	fadd	s0, s0, s9
0000000000059680	stp	s0, s12, [x8]
0000000000059684	stp	s1, s15, [x9, #0x8]
0000000000059688	stp	s0, s10, [x9]
000000000005968c	ldr	q0, [sp, #0x60]
0000000000059690	str	q0, [x8, #0x10]
0000000000059694	str	q0, [x9, #0x10]
0000000000059698	add	x27, x27, #0x1
000000000005969c	add	w8, w24, #0x1
00000000000596a0	cmp	x27, #0x33
00000000000596a4	b.ne	0x59634
00000000000596a8	add	w8, w20, #0x2
00000000000596ac	add	x26, x26, #0x1
00000000000596b0	cmp	x26, #0x32
00000000000596b4	b.ne	0x59608
00000000000596b8	mov	w24, #0x0
00000000000596bc	mov	w20, #0x0
00000000000596c0	ldr	s1, [sp, #0x10]
00000000000596c4	fmul	s0, s1, s1
00000000000596c8	str	s0, [sp, #0x14]
00000000000596cc	fmov	d0, #30.00000000
00000000000596d0	fcvt	d12, s1
00000000000596d4	mov	x25, #0x4059000000000000
00000000000596d8	adrp	x8, 527 ; 0x268000
00000000000596dc	ldr	d13, [x8, #0xd48]
00000000000596e0	ldr	d1, [sp, #0x8]
00000000000596e4	fdiv	d14, d1, d0
00000000000596e8	mov	w27, #0x0
00000000000596ec	add	w26, w24, #0x66
00000000000596f0	add	x0, sp, #0xb8
00000000000596f4	add	w1, w24, w27
00000000000596f8	bl	__ZN14HGArrayDataRef7elementEi
00000000000596fc	ldrsw	x8, [sp, #0xc0]
0000000000059700	add	x28, x0, x8
0000000000059704	ldp	s0, s1, [x28, #0x8]
0000000000059708	fcvt	d0, s0
000000000005970c	ldur	d2, [x29, #-0xc0]
0000000000059710	fsub	d0, d0, d2
0000000000059714	fcvt	s8, d0
0000000000059718	fcvt	d0, s1
000000000005971c	ldr	d1, [sp, #0xc8]
0000000000059720	stp	q1, q2, [sp, #0x50]
0000000000059724	fsub	d0, d0, d1
0000000000059728	fcvt	s0, d0
000000000005972c	ldr	s1, [sp, #0x14]
0000000000059730	fmul	s1, s1, s8
0000000000059734	fmul	s1, s1, s8
0000000000059738	fmul	s10, s0, s0
000000000005973c	fadd	s1, s1, s10
0000000000059740	fsqrt	s9, s1
0000000000059744	mov.16b	v1, v8
0000000000059748	bl	0x2520c8 ; symbol stub for: _atan2f
000000000005974c	fcvt	d15, s0
0000000000059750	ldur	d11, [x29, #-0xb8]
0000000000059754	fcvt	d0, s9
0000000000059758	fmov	d1, x25
000000000005975c	fdiv	d0, d0, d1
0000000000059760	fadd	d0, d14, d0
0000000000059764	fmul	d0, d0, d13
0000000000059768	bl	0x2520f8 ; symbol stub for: _cos
000000000005976c	fmul	d1, d11, d0
0000000000059770	fdiv	d0, d1, d12
0000000000059774	fadd	d0, d0, d15
0000000000059778	fcvt	s0, d0
000000000005977c	fmul	d1, d1, d12
0000000000059780	fadd	d1, d1, d15
0000000000059784	fcvt	s9, d1
0000000000059788	fmul	s1, s8, s8
000000000005978c	fadd	s1, s1, s10
0000000000059790	fsqrt	s1, s1
0000000000059794	str	q1, [sp, #0x40]
0000000000059798	bl	0x252104 ; symbol stub for: _cosf
000000000005979c	str	q0, [sp, #0x30]
00000000000597a0	mov.16b	v0, v9
00000000000597a4	bl	0x252440 ; symbol stub for: _sinf
00000000000597a8	ldr	q1, [sp, #0x30]
00000000000597ac	mov.s	v1[1], v0[0]
00000000000597b0	str	wzr, [x28, #0x10]
00000000000597b4	ldp	q0, q2, [sp, #0x40]
00000000000597b8	fmul.2s	v0, v1, v0[0]
00000000000597bc	fcvtl	v0.2d, v0.2s
00000000000597c0	ldr	q1, [sp, #0x60]
00000000000597c4	mov.d	v1[1], v2[0]
00000000000597c8	fadd.2d	v0, v1, v0
00000000000597cc	fcvtn	v0.2s, v0.2d
00000000000597d0	ldr	d1, [x28]
00000000000597d4	ldr	d2, [sp, #0x18]
00000000000597d8	fsub.2s	v1, v1, v2
00000000000597dc	fcvtl	v0.2d, v0.2s
00000000000597e0	fcvtl	v1.2d, v1.2s
00000000000597e4	ldr	q2, [sp, #0x20]
00000000000597e8	fmul.2d	v0, v2, v0
00000000000597ec	fmul.2d	v1, v2, v1
00000000000597f0	fcvtn	v1.2s, v1.2d
00000000000597f4	fcvtn2	v1.4s, v0.2d
00000000000597f8	str	q1, [x28]
00000000000597fc	add	w27, w27, #0x1
0000000000059800	cmp	w27, #0x66
0000000000059804	b.ne	0x596f0
0000000000059808	add	w20, w20, #0x1
000000000005980c	mov	x24, x26
0000000000059810	cmp	w20, #0x32
0000000000059814	b.ne	0x596e8
0000000000059818	mov	w0, #0x1b0
000000000005981c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000059820	mov	x20, x0
0000000000059824	mov	x1, #0x0
0000000000059828	bl	0x251ae0 ; symbol stub for: __ZN8HGGLNodeC1Em
000000000005982c	mov	x0, x20
0000000000059830	bl	0x2519e4 ; symbol stub for: __ZN8HGGLNode15hglClearToBlackEv
0000000000059834	ldr	x8, [sp, #0xb8]
0000000000059838	cbz	x8, 0x59b94
000000000005983c	ldr	w9, [x8, #0x8]
0000000000059840	cmp	w9, #0x0
0000000000059844	b.le	0x59b94
0000000000059848	ldr	x8, [x8, #0x10]
000000000005984c	ldrsw	x9, [sp, #0xc0]
0000000000059850	add	x9, x8, x9
0000000000059854	add	x8, sp, #0x98
0000000000059858	add	x0, sp, #0xb8
000000000005985c	add	x1, x9, #0x8
0000000000059860	mov	w2, #0x3
0000000000059864	bl	0x2511ec ; symbol stub for: __ZN14HGArrayDataRef5fieldEPKfi
0000000000059868	add	x0, sp, #0xa8
000000000005986c	add	x1, sp, #0x98
0000000000059870	bl	__ZN7HGArrayI7HGVec3fL8HGFormat21EEC2ERK14HGArrayDataRef
0000000000059874	ldr	x0, [sp, #0x98]
0000000000059878	cbz	x0, 0x59880
000000000005987c	bl	__ZN11HGArrayData7ReleaseEv
0000000000059880	ldr	x8, [sp, #0xb8]
0000000000059884	cbz	x8, 0x59bb8
0000000000059888	ldr	w9, [x8, #0x8]
000000000005988c	cmp	w9, #0x0
0000000000059890	b.le	0x59bb8
0000000000059894	ldr	x9, [x8, #0x10]
0000000000059898	ldrsw	x10, [sp, #0xc0]
000000000005989c	add	x8, sp, #0x88
00000000000598a0	add	x0, sp, #0xb8
00000000000598a4	add	x1, x9, x10
00000000000598a8	mov	w2, #0x2
00000000000598ac	bl	0x2511ec ; symbol stub for: __ZN14HGArrayDataRef5fieldEPKfi
00000000000598b0	add	x0, sp, #0x98
00000000000598b4	add	x1, sp, #0x88
00000000000598b8	bl	__ZN7HGArrayI7HGVec2fL8HGFormat13EEC2ERK14HGArrayDataRef
00000000000598bc	ldr	x0, [sp, #0x88]
00000000000598c0	cbz	x0, 0x598c8
00000000000598c4	bl	__ZN11HGArrayData7ReleaseEv
00000000000598c8	mov	x0, x20
00000000000598cc	mov	w1, #0x8074
00000000000598d0	bl	0x251a68 ; symbol stub for: __ZN8HGGLNode20hglEnableClientStateEj
00000000000598d4	add	x1, sp, #0xa8
00000000000598d8	mov	x0, x20
00000000000598dc	bl	0x2519d8 ; symbol stub for: __ZN8HGGLNode14hglVertexArrayERK14HGArrayDataRef
00000000000598e0	mov	x0, x20
00000000000598e4	mov	w1, #0x84c0
00000000000598e8	bl	0x251a08 ; symbol stub for: __ZN8HGGLNode16hglActiveTextureEj
00000000000598ec	mov	x0, x20
00000000000598f0	mov	w1, #0x8078
00000000000598f4	bl	0x251a68 ; symbol stub for: __ZN8HGGLNode20hglEnableClientStateEj
00000000000598f8	add	x1, sp, #0x98
00000000000598fc	mov	x0, x20
0000000000059900	bl	0x251a14 ; symbol stub for: __ZN8HGGLNode16hglTexCoordArrayERK14HGArrayDataRef
0000000000059904	ldr	x8, [sp, #0xb8]
0000000000059908	cbz	x8, 0x59bdc
000000000005990c	ldr	w9, [x8, #0x8]
0000000000059910	cmp	w9, #0x0
0000000000059914	b.le	0x59bdc
0000000000059918	ldr	x8, [x8, #0x10]
000000000005991c	ldrsw	x9, [sp, #0xc0]
0000000000059920	add	x9, x8, x9
0000000000059924	add	x8, sp, #0x78
0000000000059928	add	x0, sp, #0xb8
000000000005992c	add	x1, x9, #0x14
0000000000059930	mov	w2, #0x3
0000000000059934	bl	0x2511ec ; symbol stub for: __ZN14HGArrayDataRef5fieldEPKfi
0000000000059938	add	x0, sp, #0x88
000000000005993c	add	x1, sp, #0x78
0000000000059940	bl	__ZN7HGArrayI7HGVec3fL8HGFormat21EEC2ERK14HGArrayDataRef
0000000000059944	ldr	x0, [sp, #0x78]
0000000000059948	cbz	x0, 0x59950
000000000005994c	bl	__ZN11HGArrayData7ReleaseEv
0000000000059950	mov	x0, x20
0000000000059954	mov	w1, #0x8076
0000000000059958	bl	0x251a68 ; symbol stub for: __ZN8HGGLNode20hglEnableClientStateEj
000000000005995c	add	x1, sp, #0x88
0000000000059960	mov	x0, x20
0000000000059964	bl	0x251984 ; symbol stub for: __ZN8HGGLNode13hglColorArrayERK14HGArrayDataRef
0000000000059968	mov	w24, #0x0
000000000005996c	mov	w25, #0x32
0000000000059970	mov	x0, x20
0000000000059974	mov	w1, #0x5
0000000000059978	mov	x2, x24
000000000005997c	mov	w3, #0x66
0000000000059980	bl	0x251990 ; symbol stub for: __ZN8HGGLNode13hglDrawArraysEjii
0000000000059984	add	w24, w24, #0x66
0000000000059988	subs	x25, x25, #0x1
000000000005998c	b.ne	0x59970
0000000000059990	mov	x0, x20
0000000000059994	mov	w1, #0x8074
0000000000059998	bl	0x251a74 ; symbol stub for: __ZN8HGGLNode21hglDisableClientStateEj
000000000005999c	mov	x0, x20
00000000000599a0	mov	w1, #0x8078
00000000000599a4	bl	0x251a74 ; symbol stub for: __ZN8HGGLNode21hglDisableClientStateEj
00000000000599a8	cbz	x22, 0x599e8
00000000000599ac	add	x8, sp, #0x78
00000000000599b0	mov	x0, x22
00000000000599b4	bl	_objc_msgSend$heliumRef
00000000000599b8	ldr	x2, [sp, #0x78]
00000000000599bc	b	0x599f0
00000000000599c0	str	xzr, [sp, #0xb8]
00000000000599c4	add	x2, sp, #0xb8
00000000000599c8	mov	x0, x19
00000000000599cc	bl	"_objc_msgSend$setHeliumRef:"
00000000000599d0	ldr	x0, [sp, #0xb8]
00000000000599d4	cbz	x0, 0x59b60
00000000000599d8	ldr	x8, [x0]
00000000000599dc	ldr	x8, [x8, #0x18]
00000000000599e0	blr	x8
00000000000599e4	b	0x59b60
00000000000599e8	mov	x2, #0x0
00000000000599ec	str	xzr, [sp, #0x78]
00000000000599f0	ldr	x8, [x20]
00000000000599f4	ldr	x8, [x8, #0x78]
00000000000599f8	mov	x0, x20
00000000000599fc	mov	w1, #0x0
0000000000059a00	blr	x8
0000000000059a04	ldr	x0, [sp, #0x78]
0000000000059a08	cbz	x0, 0x59a18
0000000000059a0c	ldr	x8, [x0]
0000000000059a10	ldr	x8, [x8, #0x18]
0000000000059a14	blr	x8
0000000000059a18	ldr	x4, [x21]
0000000000059a1c	add	x2, sp, #0x77
0000000000059a20	mov	x0, x23
0000000000059a24	mov	w3, #0x3
0000000000059a28	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000059a2c	ldrb	w8, [sp, #0x77]
0000000000059a30	cmp	w8, #0x1
0000000000059a34	b.ne	0x59aec
0000000000059a38	mov	x0, x19
0000000000059a3c	bl	_objc_msgSend$width
0000000000059a40	mov	x22, x0
0000000000059a44	mov	x0, x19
0000000000059a48	bl	_objc_msgSend$height
0000000000059a4c	mov	x23, x0
0000000000059a50	mov	w0, #0x1a0
0000000000059a54	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000059a58	mov	x21, x0
0000000000059a5c	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000059a60	ldr	x8, [x21]
0000000000059a64	ldr	x8, [x8, #0x78]
0000000000059a68	mov	x0, x21
0000000000059a6c	mov	w1, #0x0
0000000000059a70	mov	x2, x20
0000000000059a74	blr	x8
0000000000059a78	ucvtf	d0, x22, #0x1
0000000000059a7c	ucvtf	d1, x23, #0x1
0000000000059a80	fcvt	s2, d0
0000000000059a84	fcvt	s3, d1
0000000000059a88	fneg	s0, s2
0000000000059a8c	fneg	s1, s3
0000000000059a90	ldr	x8, [x21]
0000000000059a94	ldr	x8, [x8, #0x60]
0000000000059a98	mov	x0, x21
0000000000059a9c	mov	w1, #0x0
0000000000059aa0	blr	x8
0000000000059aa4	str	x21, [sp, #0x78]
0000000000059aa8	ldr	x8, [x21]
0000000000059aac	ldr	x8, [x8, #0x10]
0000000000059ab0	mov	x0, x21
0000000000059ab4	blr	x8
0000000000059ab8	add	x2, sp, #0x78
0000000000059abc	mov	x0, x19
0000000000059ac0	bl	"_objc_msgSend$setHeliumRef:"
0000000000059ac4	ldr	x0, [sp, #0x78]
0000000000059ac8	cbz	x0, 0x59ad8
0000000000059acc	ldr	x8, [x0]
0000000000059ad0	ldr	x8, [x8, #0x18]
0000000000059ad4	blr	x8
0000000000059ad8	ldr	x8, [x21]
0000000000059adc	ldr	x8, [x8, #0x18]
0000000000059ae0	mov	x0, x21
0000000000059ae4	blr	x8
0000000000059ae8	b	0x59b20
0000000000059aec	str	x20, [sp, #0x78]
0000000000059af0	ldr	x8, [x20]
0000000000059af4	ldr	x8, [x8, #0x10]
0000000000059af8	mov	x0, x20
0000000000059afc	blr	x8
0000000000059b00	add	x2, sp, #0x78
0000000000059b04	mov	x0, x19
0000000000059b08	bl	"_objc_msgSend$setHeliumRef:"
0000000000059b0c	ldr	x0, [sp, #0x78]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm3 (bool), parm2 (float)
```
