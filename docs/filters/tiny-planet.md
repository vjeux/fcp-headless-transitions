# Tiny Planet

- **PAE class:** `Tiny Planet`
- **Plugin UUID:** `AAC5D840-7379-4B49-941A-DAE7F6882AEE`
- **Node names in corpus:** Tiny Planet (4), WarpEffect (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Tiny Planet reprojects an equirectangular 360 image into a stereographic "little planet" -- the ground curls into a small globe with the sky wrapping around the outside. X/Y/Z Rotation orient the sphere before projection and Field of View sets how much of the sphere is squeezed into frame.

> **Note.** Not implemented; description is the standard Apple Motion 360 "Tiny Planet" projection.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| X Rotation | float (radians) | 0 | -2.635 .. 0 | Pitch of the sphere before projection, radians. |
| Y Rotation | float (radians) | 0 | -2.548 .. 1.536 | Yaw of the sphere before projection, radians. |
| Z Rotation | float (radians) | 0 | 0 .. 1.885 | Roll of the sphere before projection, radians. |
| Field of View | float (degrees) | 360 | 360 .. 720 | How much of the sphere is squeezed into frame, ~360-720 (default 360). |
| Rotation Order | enum | 0 | 0 .. 0 | Order the X/Y/Z rotations are applied. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTextureWrapClampToEdge`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTextureWrapClampToEdge` → [`HgcTextureWrapClampToEdge.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTextureWrapClampToEdge.metal)

```metal
//Metal1.0     
//LEN=00000002a8
[[ visible ]] FragmentOut HgcTextureWrapClampToEdge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].zw;
    r1.xy = hg_Params[0].xy - c0.xx;
    r0.xy = fmin(r0.xy, r1.xy);
    r0.xy = fmax(r0.xy, c0.xx);
    r0.xy = r0.xy + hg_Params[0].zw;
    r0.xy = r0.xy + hg_Params[1].xy;
    r0.xy = r0.xy*hg_Params[1].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEEquirectTinyPlanet canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEEquirectTinyPlanet`

```asm
0000000000125764	mov	w3, #0x4
0000000000125768	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012576c	ldr	x4, [x23]
0000000000125770	add	x2, sp, #0x60
0000000000125774	mov	x0, x21
0000000000125778	mov	w3, #0x1
000000000012577c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000125780	ldr	x4, [x23]
0000000000125784	add	x2, sp, #0x58
0000000000125788	mov	x0, x21
000000000012578c	mov	w3, #0x2
0000000000125790	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000125794	ldr	x4, [x23]
0000000000125798	add	x2, sp, #0x50
000000000012579c	mov	x0, x21
00000000001257a0	mov	w3, #0x3
00000000001257a4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000001257a8	ldr	x4, [x23]
00000000001257ac	add	x2, sp, #0x4c
00000000001257b0	mov	x0, x21
00000000001257b4	mov	w3, #0x5
00000000001257b8	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000001257bc	ldr	w25, [sp, #0x4c]
00000000001257c0	ldr	x4, [x23]
00000000001257c4	add	x2, sp, #0x4b
00000000001257c8	mov	x0, x21
00000000001257cc	mov	w3, #0x6
00000000001257d0	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000001257d4	mov	x0, x20
00000000001257d8	bl	_objc_msgSend$imageType
00000000001257dc	mov	x21, x0
00000000001257e0	ldr	x2, [x23]
00000000001257e4	mov	x0, x22
00000000001257e8	bl	"_objc_msgSend$getRenderMode:"
00000000001257ec	mov	x23, x0
00000000001257f0	mov	x0, x20
00000000001257f4	bl	_objc_msgSend$width
00000000001257f8	ucvtf	d12, x0
00000000001257fc	mov	x0, x20
0000000000125800	bl	_objc_msgSend$height
0000000000125804	ucvtf	d13, x0
0000000000125808	ldr	d9, [sp, #0x68]
000000000012580c	adrp	x8, 324 ; 0x269000
0000000000125810	ldr	d10, [x8, #0x4c8]
0000000000125814	fmul	d0, d9, d10
0000000000125818	cmp	w24, #0x2
000000000012581c	b.lo	0x125848
0000000000125820	adrp	x8, 326 ; 0x26b000
0000000000125824	ldr	d1, [x8, #0x8c0]
0000000000125828	fcmp	d0, d1
000000000012582c	b.le	0x1258c4
0000000000125830	fmov	d1, #-1.00000000
0000000000125834	fadd	d0, d0, d1
0000000000125838	adrp	x8, 326 ; 0x26b000
000000000012583c	ldr	d1, [x8, #0x8c8]
0000000000125840	fdiv	d0, d0, d1
0000000000125844	b	0x1258e4
0000000000125848	fmov	d1, #0.50000000
000000000012584c	fmul	d8, d13, d1
0000000000125850	fmul	d11, d12, d1
0000000000125854	fmul	d0, d0, d1
0000000000125858	bl	0x25247c ; symbol stub for: _tan
000000000012585c	fdiv	d1, d11, d0
0000000000125860	mov.16b	v0, v8
0000000000125864	bl	0x2520bc ; symbol stub for: _atan2
0000000000125868	fadd	d0, d0, d0
000000000012586c	adrp	x8, 326 ; 0x26b000
0000000000125870	ldr	d1, [x8, #0x888]
0000000000125874	fcmp	d9, d1
0000000000125878	adrp	x8, 326 ; 0x26b000
000000000012587c	fdiv	d0, d0, d10
0000000000125880	b.le	0x12589c
0000000000125884	ldr	d1, [x8, #0x880]
0000000000125888	fcmp	d9, d1
000000000012588c	b.hi	0x12589c
0000000000125890	adrp	x8, 324 ; 0x269000
0000000000125894	ldr	d1, [x8, #0x760]
0000000000125898	b	0x125950
000000000012589c	adrp	x9, 326 ; 0x26b000
00000000001258a0	ldr	d1, [x9, #0x890]
00000000001258a4	fcmp	d9, d1
00000000001258a8	adrp	x9, 325 ; 0x26a000
00000000001258ac	b.le	0x1258ec
00000000001258b0	ldr	d1, [x9, #0x248]
00000000001258b4	fcmp	d9, d1
00000000001258b8	b.hi	0x1258ec
00000000001258bc	ldr	d1, [x8, #0x880]
00000000001258c0	b	0x125950
00000000001258c4	fmov	d1, #0.50000000
00000000001258c8	fmul	d0, d0, d1
00000000001258cc	bl	0x25247c ; symbol stub for: _tan
00000000001258d0	fmov	d1, #1.00000000
00000000001258d4	fdiv	d1, d1, d0
00000000001258d8	fmov	d0, #0.50000000
00000000001258dc	bl	0x2520bc ; symbol stub for: _atan2
00000000001258e0	fadd	d0, d0, d0
00000000001258e4	fdiv	d0, d0, d10
00000000001258e8	b	0x125954
00000000001258ec	adrp	x8, 326 ; 0x26b000
00000000001258f0	ldr	d1, [x8, #0x898]
00000000001258f4	fcmp	d9, d1
00000000001258f8	adrp	x8, 326 ; 0x26b000
00000000001258fc	b.le	0x125914
0000000000125900	ldr	d1, [x8, #0x8a0]
0000000000125904	fcmp	d9, d1
0000000000125908	b.hi	0x125914
000000000012590c	ldr	d1, [x9, #0x248]
0000000000125910	b	0x125950
0000000000125914	adrp	x9, 326 ; 0x26b000
0000000000125918	ldr	d1, [x9, #0x8a8]
000000000012591c	fcmp	d9, d1
0000000000125920	adrp	x9, 326 ; 0x26b000
0000000000125924	b.le	0x12593c
0000000000125928	ldr	d1, [x9, #0x8b0]
000000000012592c	fcmp	d9, d1
0000000000125930	b.hi	0x12593c
0000000000125934	ldr	d1, [x8, #0x8a0]
0000000000125938	b	0x125950
000000000012593c	adrp	x8, 326 ; 0x26b000
0000000000125940	ldr	d1, [x8, #0x8b8]
0000000000125944	fcmp	d9, d1
0000000000125948	b.le	0x125954
000000000012594c	ldr	d1, [x9, #0x8b0]
0000000000125950	fadd	d0, d0, d1
0000000000125954	str	d0, [sp, #0x68]
0000000000125958	cmp	w23, #0x0
000000000012595c	ccmp	w21, #0x3, #0x0, ne
0000000000125960	cset	w21, eq
0000000000125964	b.ne	0x125cd4
0000000000125968	cbz	x20, 0x12597c
000000000012596c	add	x8, sp, #0x40
0000000000125970	mov	x0, x20
0000000000125974	bl	_objc_msgSend$heliumRef
0000000000125978	b	0x125980
000000000012597c	str	xzr, [sp, #0x40]
0000000000125980	stp	d13, d12, [sp, #0x10]
0000000000125984	add	x8, sp, #0x30
0000000000125988	mov	x0, x22
000000000012598c	mov	x2, x20
0000000000125990	bl	"_objc_msgSend$getImageBoundary:"
0000000000125994	ldp	s0, s1, [sp, #0x30]
0000000000125998	fcvt	d15, s0
000000000012599c	fcvt	d14, s1
00000000001259a0	ldp	s0, s1, [sp, #0x38]
00000000001259a4	fcvt	d0, s0
00000000001259a8	fcvt	d1, s1
00000000001259ac	fadd	d13, d15, d0
00000000001259b0	fadd	d12, d14, d1
00000000001259b4	fcvt	s0, d13
00000000001259b8	fcvt	s1, d12
00000000001259bc	ldp	d2, d3, [sp, #0xd0]
00000000001259c0	fmul	d4, d2, d15
00000000001259c4	fmul	d5, d3, d14
00000000001259c8	fadd	d4, d4, d5
00000000001259cc	ldp	d5, d6, [sp, #0x70]
00000000001259d0	fmul	d7, d5, d15
00000000001259d4	fmul	d16, d6, d14
00000000001259d8	fadd	d7, d7, d16
00000000001259dc	ldp	d16, d17, [sp, #0x88]
00000000001259e0	fmul	d18, d17, d15
00000000001259e4	ldr	d19, [sp, #0x98]
00000000001259e8	ldr	d20, [sp, #0xa8]
00000000001259ec	fmul	d21, d19, d14
00000000001259f0	fadd	d18, d18, d21
00000000001259f4	ldr	d21, [sp, #0xe8]
00000000001259f8	fadd	d4, d21, d4
00000000001259fc	fcvt	s4, d4
0000000000125a00	fadd	d7, d16, d7
0000000000125a04	fcvt	d4, s4
0000000000125a08	fdiv	d7, d7, d4
0000000000125a0c	fcvt	s9, d7
0000000000125a10	fadd	d7, d20, d18
0000000000125a14	fdiv	d4, d7, d4
0000000000125a18	fcvt	s8, d4
0000000000125a1c	fcvt	d0, s0
0000000000125a20	fmul	d2, d2, d0
0000000000125a24	fcvt	d1, s1
0000000000125a28	fmul	d3, d3, d1
0000000000125a2c	fadd	d2, d2, d3
0000000000125a30	fadd	d2, d21, d2
0000000000125a34	fcvt	s2, d2
0000000000125a38	fmul	d3, d5, d0
0000000000125a3c	fmul	d4, d6, d1
0000000000125a40	fadd	d3, d3, d4
0000000000125a44	fadd	d3, d16, d3
0000000000125a48	fcvt	d2, s2
0000000000125a4c	fdiv	d3, d3, d2
0000000000125a50	fcvt	s10, d3
0000000000125a54	fmul	d0, d17, d0
0000000000125a58	fmul	d1, d19, d1
0000000000125a5c	fadd	d0, d0, d1
0000000000125a60	fadd	d0, d20, d0
0000000000125a64	fdiv	d0, d0, d2
0000000000125a68	fcvt	s11, d0
0000000000125a6c	frintp	s0, s9
0000000000125a70	frintp	s1, s8
0000000000125a74	frintm	s2, s10
0000000000125a78	frintm	s3, s11
0000000000125a7c	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000125a80	stp	x0, x1, [sp, #0x30]
0000000000125a84	mov	w0, #0x1a0
0000000000125a88	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000125a8c	mov	x20, x0
0000000000125a90	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000125a94	ldr	x2, [sp, #0x40]
0000000000125a98	ldr	x8, [x20]
0000000000125a9c	ldr	x8, [x8, #0x78]
0000000000125aa0	mov	x0, x20
0000000000125aa4	mov	w1, #0x0
0000000000125aa8	blr	x8
0000000000125aac	ldp	s0, s1, [sp, #0x30]
0000000000125ab0	scvtf	s0, s0
0000000000125ab4	scvtf	s1, s1
0000000000125ab8	ldp	s2, s3, [sp, #0x38]
0000000000125abc	scvtf	s2, s2
0000000000125ac0	scvtf	s3, s3
0000000000125ac4	ldr	x8, [x20]
0000000000125ac8	ldr	x8, [x8, #0x60]
0000000000125acc	mov	x0, x20
0000000000125ad0	mov	w1, #0x0
0000000000125ad4	blr	x8
0000000000125ad8	mov	w0, #0x1d0
0000000000125adc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000125ae0	mov	x22, x0
0000000000125ae4	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
0000000000125ae8	mov	x0, x22
0000000000125aec	mov	w1, #0x3
0000000000125af0	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
0000000000125af4	ldr	x8, [x22]
0000000000125af8	ldr	x8, [x8, #0x78]
0000000000125afc	mov	x0, x22
0000000000125b00	mov	w1, #0x0
0000000000125b04	mov	x2, x20
0000000000125b08	blr	x8
0000000000125b0c	fsub	d0, d13, d15
0000000000125b10	fcvt	s16, d0
0000000000125b14	fsub	d0, d12, d14
0000000000125b18	fcvt	s4, d0
0000000000125b1c	ldp	d1, d0, [sp, #0x58]
0000000000125b20	fcvt	s0, d0
0000000000125b24	fneg	s0, s0
0000000000125b28	fcvt	s1, d1
0000000000125b2c	ldr	d2, [sp, #0x50]
0000000000125b30	fcvt	s2, d2
0000000000125b34	fneg	s2, s2
0000000000125b38	ldr	d3, [sp, #0x68]
0000000000125b3c	fcvt	s3, d3
0000000000125b40	ldp	d13, d12, [sp, #0x10]
0000000000125b44	fcvt	s7, d12
0000000000125b48	fcvt	s17, d13
0000000000125b4c	scvtf	s5, w25
0000000000125b50	stp	s4, s5, [sp, #0x8]
0000000000125b54	add	x8, sp, #0x28
0000000000125b58	movi.2d	v4, #0000000000000000
0000000000125b5c	movi.2d	v5, #0000000000000000
0000000000125b60	movi.2d	v6, #0000000000000000
0000000000125b64	add	x0, sp, #0xf0
0000000000125b68	add	x1, sp, #0x70
0000000000125b6c	add	x2, sp, #0x30
0000000000125b70	stp	s17, s16, [sp]
0000000000125b74	bl	0x250e2c ; symbol stub for: __Z25NewEquirectTinyPlanetNodefffffffffRK14PCMatrix44TmplIdES2_fffR6HGRect
0000000000125b78	ldr	x0, [sp, #0x28]
0000000000125b7c	ldr	x8, [x0]
0000000000125b80	ldr	x8, [x8, #0x78]
0000000000125b84	mov	w1, #0x0
0000000000125b88	mov	x2, x22
0000000000125b8c	blr	x8
0000000000125b90	mov.16b	v0, v9
0000000000125b94	mov.16b	v1, v8
0000000000125b98	mov.16b	v2, v10
0000000000125b9c	mov.16b	v3, v11
0000000000125ba0	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000125ba4	ldrb	w8, [sp, #0x4b]
0000000000125ba8	tbnz	w8, #0x0, 0x125bec
0000000000125bac	fcvt	d0, s9
0000000000125bb0	fmov	d1, #0.50000000
0000000000125bb4	fmul	d2, d12, d1
0000000000125bb8	fsub	d0, d0, d2
0000000000125bbc	fcvt	s0, d0
0000000000125bc0	fcvt	d3, s8
0000000000125bc4	fmul	d4, d13, d1
0000000000125bc8	fsub	d1, d3, d4
0000000000125bcc	fcvt	s1, d1
0000000000125bd0	fcvt	d3, s10
0000000000125bd4	fadd	d2, d2, d3
0000000000125bd8	fcvt	s2, d2
0000000000125bdc	fcvt	d3, s11
0000000000125be0	fadd	d3, d4, d3
0000000000125be4	fcvt	s3, d3
0000000000125be8	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000125bec	mov	x25, x0
0000000000125bf0	mov	x24, x1
0000000000125bf4	mov	w0, #0x1a0
0000000000125bf8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000125bfc	mov	x23, x0
0000000000125c00	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000125c04	ldr	x2, [sp, #0x28]
0000000000125c08	ldr	x8, [x23]
0000000000125c0c	ldr	x8, [x8, #0x78]
0000000000125c10	mov	x0, x23
0000000000125c14	mov	w1, #0x0
0000000000125c18	blr	x8
0000000000125c1c	scvtf	s0, w25
0000000000125c20	lsr	x8, x25, #32
0000000000125c24	scvtf	s1, w8
0000000000125c28	scvtf	s2, w24
0000000000125c2c	lsr	x8, x24, #32
0000000000125c30	scvtf	s3, w8
0000000000125c34	ldr	x8, [x23]
0000000000125c38	ldr	x8, [x8, #0x60]
0000000000125c3c	mov	x0, x23
0000000000125c40	mov	w1, #0x0
0000000000125c44	blr	x8
0000000000125c48	str	x23, [sp, #0x20]
0000000000125c4c	ldr	x8, [x23]
0000000000125c50	ldr	x8, [x8, #0x10]
0000000000125c54	mov	x0, x23
0000000000125c58	blr	x8
0000000000125c5c	add	x2, sp, #0x20
0000000000125c60	mov	x0, x19
0000000000125c64	bl	"_objc_msgSend$setHeliumRef:"
0000000000125c68	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : AngleSlider
    parm2 : AngleSlider
    parm3 : AngleSlider
    parm4 : FloatSlider
    parm5 : PopupMenu
    parm6 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm4 (float)
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm5 (int)
    - parm6 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
