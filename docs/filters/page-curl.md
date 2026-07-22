# Page Curl

- **PAE class:** `Page Curl`
- **Plugin UUID:** `BA8D0B63-2F01-4DA6-9751-56D308A28F98`
- **Node names in corpus:** Page Curl (74), Page Curl copy (14), Page Curl 1 (13), Page Curl 2 (12), Animate (3), Page Curl In (3)
- **Corpus usage:** 50 files, 127 instances

## What it does

Page Curl peels the layer back like turning a page: a corner/edge set by Angle and Rotation lifts and curls with a given Radius, revealing a Back Color behind it, animated by Percent from flat to fully turned. It is the classic page-turn transition. Not implemented; described from the standard Motion "Page Curl".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Page Curl" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Percent | float (percent) | 50 | 12 .. 100 | How far the page is turned, 12-100 (default 50). Animated (87 keyframe curves) to drive the turn. *(keyframed in 87 instances)* |
| Angle | float (radians) | -0.3142 | -7.052 .. 4.102 | Direction the curl travels across the page. *(keyframed in 7 instances)* |
| Rotation | float (radians) | -0.4189 | -0.7854 .. 5.84 | Orientation of the curl axis / which corner lifts. *(keyframed in 4 instances)* |
| Radius | float (pixels) | 20 | 1 .. 100 | Tightness of the curl roll, 1-100 (default 20). Smaller = a tighter roll. *(keyframed in 4 instances)* |
| Animate | bool | 1 | 0 .. 1 | Toggle: drive the curl by the built-in animation vs the Percent param directly. |
| Direction | bool | 0 | 0 .. 1 | Toggle: which way the page turns. |
| Highlight Color | color | - | - | Color of the specular highlight along the curl (nested RGB). |
| Back Color | color | - | - | Color revealed on the back of the curled page (nested RGB + Opacity). |
| Shadow | float | 50 | 0 .. 100 | Strength of the shadow cast by the lifted page, 0-100. |
| Fade Out | float | 20 | 0 .. 41 | Fade of the curled-away area, 0-41. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean (only 1 sampled). *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

### CPU render method — `-[PAEPageCurlFilter canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPageCurlFilter`

```asm
0000000000006b78	mov	w3, #0xa
0000000000006b7c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000006b80	mov	x25, x0
0000000000006b84	ldr	x4, [x20]
0000000000006b88	sub	x2, x29, #0x68
0000000000006b8c	mov	x0, x24
0000000000006b90	mov	w3, #0x9
0000000000006b94	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000006b98	cmp	w25, #0x0
0000000000006b9c	ccmp	w0, #0x0, #0x4, ne
0000000000006ba0	b.ne	0x6bd0
0000000000006ba4	mov	w21, #0x0
0000000000006ba8	mov	x0, x21
0000000000006bac	ldp	x29, x30, [sp, #0x100]
0000000000006bb0	ldp	x20, x19, [sp, #0xf0]
0000000000006bb4	ldp	x22, x21, [sp, #0xe0]
0000000000006bb8	ldp	x24, x23, [sp, #0xd0]
0000000000006bbc	ldp	x26, x25, [sp, #0xc0]
0000000000006bc0	ldp	x28, x27, [sp, #0xb0]
0000000000006bc4	ldp	d9, d8, [sp, #0xa0]
0000000000006bc8	add	sp, sp, #0x110
0000000000006bcc	ret
0000000000006bd0	ldurb	w8, [x29, #-0x61]
0000000000006bd4	cmp	w8, #0x1
0000000000006bd8	b.ne	0x6ca4
0000000000006bdc	ldr	x24, [x20]
0000000000006be0	adrp	x25, 898 ; 0x388000
0000000000006be4	ldr	x25, [x25, #0x478] ; literal pool symbol address: _kCMTimeIndefinite
0000000000006be8	ldr	q0, [x25]
0000000000006bec	str	q0, [sp, #0x80]
0000000000006bf0	ldr	x8, [x25, #0x10]
0000000000006bf4	str	x8, [sp, #0x90]
0000000000006bf8	add	x8, sp, #0x80
0000000000006bfc	str	x8, [sp, #0x78]
0000000000006c00	add	x2, sp, #0x78
0000000000006c04	mov	x0, x23
0000000000006c08	bl	"_objc_msgSend$startFxTimeForEffect:"
0000000000006c0c	ldr	q0, [x25]
0000000000006c10	str	q0, [sp, #0x60]
0000000000006c14	ldr	x8, [x25, #0x10]
0000000000006c18	str	x8, [sp, #0x70]
0000000000006c1c	add	x8, sp, #0x60
0000000000006c20	str	x8, [sp, #0x58]
0000000000006c24	add	x2, sp, #0x58
0000000000006c28	mov	x0, x23
0000000000006c2c	bl	"_objc_msgSend$durationFxTimeForEffect:"
0000000000006c30	ldr	q0, [x24]
0000000000006c34	ldr	x8, [x24, #0x10]
0000000000006c38	str	x8, [sp, #0x30]
0000000000006c3c	str	q0, [sp, #0x20]
0000000000006c40	ldr	x8, [sp, #0x78]
0000000000006c44	ldr	x9, [x8, #0x10]
0000000000006c48	ldr	q0, [x8]
0000000000006c4c	str	q0, [sp]
0000000000006c50	str	x9, [sp, #0x10]
0000000000006c54	add	x8, sp, #0x40
0000000000006c58	add	x0, sp, #0x20
0000000000006c5c	mov	x1, sp
0000000000006c60	bl	0x250994 ; symbol stub for: _CMTimeSubtract
0000000000006c64	ldr	q0, [sp, #0x40]
0000000000006c68	str	q0, [sp, #0x20]
0000000000006c6c	ldr	x8, [sp, #0x50]
0000000000006c70	str	x8, [sp, #0x30]
0000000000006c74	add	x0, sp, #0x20
0000000000006c78	bl	0x25094c ; symbol stub for: _CMTimeGetSeconds
0000000000006c7c	mov.16b	v8, v0
0000000000006c80	ldr	x8, [sp, #0x58]
0000000000006c84	ldr	x9, [x8, #0x10]
0000000000006c88	ldr	q0, [x8]
0000000000006c8c	str	q0, [sp, #0x20]
0000000000006c90	str	x9, [sp, #0x30]
0000000000006c94	add	x0, sp, #0x20
0000000000006c98	bl	0x25094c ; symbol stub for: _CMTimeGetSeconds
0000000000006c9c	fdiv	d0, d8, d0
0000000000006ca0	b	0x6ccc
0000000000006ca4	ldr	x4, [x20]
0000000000006ca8	add	x2, sp, #0x80
0000000000006cac	mov	x0, x24
0000000000006cb0	mov	w3, #0xb
0000000000006cb4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000006cb8	cbz	w0, 0x6ba4
0000000000006cbc	ldr	d0, [sp, #0x80]
0000000000006cc0	mov	x8, #0x4059000000000000
0000000000006cc4	fmov	d1, x8
0000000000006cc8	fdiv	d0, d0, d1
0000000000006ccc	fcvt	s0, d0
0000000000006cd0	ldur	w8, [x29, #-0x68]
0000000000006cd4	fmov	s1, #1.00000000
0000000000006cd8	fsub	s1, s1, s0
0000000000006cdc	cmp	w8, #0x0
0000000000006ce0	fcsel	s0, s0, s1, eq
0000000000006ce4	ldr	x1, [x22, x26]
0000000000006ce8	cset	w5, ne
0000000000006cec	add	x8, sp, #0x80
0000000000006cf0	mov	x0, x22
0000000000006cf4	mov	x2, x19
0000000000006cf8	mov	x3, x21
0000000000006cfc	mov	x4, x20
0000000000006d00	mov	w6, #0x0
0000000000006d04	bl	__ZN12_GLOBAL__N_112renderOutputEP11objc_objectS1_P13FxHeliumImageS3_ffRK12FxRenderInfobb
0000000000006d08	ldr	x20, [sp, #0x80]
0000000000006d0c	cmp	x20, #0x0
0000000000006d10	cset	w21, ne
0000000000006d14	cbz	x20, 0x6ba8
0000000000006d18	str	x20, [sp, #0x60]
0000000000006d1c	ldr	x8, [x20]
0000000000006d20	ldr	x8, [x8, #0x10]
0000000000006d24	mov	x0, x20
0000000000006d28	blr	x8
0000000000006d2c	add	x2, sp, #0x60
0000000000006d30	mov	x0, x19
0000000000006d34	bl	"_objc_msgSend$setHeliumRef:"
0000000000006d38	ldr	x0, [sp, #0x60]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm10 (bool)
    - parm9 (int)
    - parm11 (float)

```
