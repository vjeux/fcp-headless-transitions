# Simple Border

- **PAE class:** `Simple Border`
- **Plugin UUID:** `8777A5DD-CDDA-4707-8454-D648943210D9`
- **Node names in corpus:** Simple Border (30), Simple Border 1 (16), Fill Colour (2), Outside 2nd Border (2), 2nd Border Filler  (2), Color Filler (2)
- **Corpus usage:** 22 files, 58 instances

## What it does

Simple Border draws a solid-colored frame around the image. Width sets the border thickness in pixels, Color its color, and Border Placement whether the border sits inside, centered on, or outside the image edge.

> **Note.** Not implemented; description is the standard Apple Motion "Simple Border" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Width | float (pixels) | 10 | 0 .. 1000 | Border thickness in pixels, ~0-1000 (default 10). |
| Color | color | - | - | Border color. |
| Mix | float | 1 | 0.3942 .. 1 | Wet/dry blend, 0-1 continuous. |
| Border Placement | enum(int) | 0 | 0 .. 2 | Where the border sits relative to the edge: inside / center / outside (0-2). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

### CPU render method — `-[PAESimpleBorder canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESimpleBorder`

```asm
00000000000b3958	mov	w3, #0x1
00000000000b395c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b3960	add	x24, x25, #0x18
00000000000b3964	ldr	x7, [x20]
00000000000b3968	sub	x2, x29, #0x70
00000000000b396c	orr	x3, x25, #0x8
00000000000b3970	add	x4, x25, #0x10
00000000000b3974	mov	x0, x23
00000000000b3978	mov	x5, x24
00000000000b397c	mov	w6, #0x2
00000000000b3980	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:alphaValue:fromParm:atFxTime:"
00000000000b3984	ldur	d0, [x29, #-0x70]
00000000000b3988	ldur	q1, [x25, #0x8]
00000000000b398c	ld1.d	{ v1 }[1], [x24]
00000000000b3990	ldur	q2, [x29, #-0x60]
00000000000b3994	ext.16b	v3, v2, v2, #0x8
00000000000b3998	fmul.d	d0, d0, v2[1]
00000000000b399c	stur	d0, [x29, #-0x70]
00000000000b39a0	fmul.2d	v0, v1, v3
00000000000b39a4	stur	q0, [x25, #0x8]
00000000000b39a8	ldr	x4, [x20]
00000000000b39ac	sub	x2, x29, #0x74
00000000000b39b0	mov	x0, x23
00000000000b39b4	mov	w3, #0x3
00000000000b39b8	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000b39bc	mov	x0, x21
00000000000b39c0	bl	_objc_msgSend$imageType
00000000000b39c4	mov	x23, x0
00000000000b39c8	ldr	x2, [x20]
00000000000b39cc	mov	x0, x22
00000000000b39d0	bl	"_objc_msgSend$getRenderMode:"
00000000000b39d4	cmp	w0, #0x0
00000000000b39d8	ccmp	w23, #0x3, #0x0, ne
00000000000b39dc	cset	w20, eq
00000000000b39e0	b.ne	0xb3a80
00000000000b39e4	cbz	x21, 0xb3a00
00000000000b39e8	add	x8, sp, #0x30
00000000000b39ec	mov	x0, x21
00000000000b39f0	bl	_objc_msgSend$heliumRef
00000000000b39f4	b	0xb3a04
00000000000b39f8	mov	w20, #0x0
00000000000b39fc	b	0xb3a80
00000000000b3a00	str	xzr, [sp, #0x30]
00000000000b3a04	mov	x8, sp
00000000000b3a08	mov	x0, x22
00000000000b3a0c	mov	x2, x21
00000000000b3a10	bl	"_objc_msgSend$getImageBoundary:"
00000000000b3a14	ldp	d0, d1, [sp]
00000000000b3a18	fcvtl	v0.2d, v0.2s
00000000000b3a1c	fcvtl	v1.2d, v1.2s
00000000000b3a20	stp	q0, q1, [sp, #0x10]
00000000000b3a24	ldur	d0, [x29, #-0x48]
00000000000b3a28	fcvt	s0, d0
00000000000b3a2c	ldur	w4, [x29, #-0x74]
00000000000b3a30	mov	x8, sp
00000000000b3a34	add	x0, sp, #0x30
00000000000b3a38	add	x1, sp, #0x10
00000000000b3a3c	sub	x2, x29, #0x70
00000000000b3a40	add	x3, sp, #0x38
00000000000b3a44	mov.16b	v1, v0
00000000000b3a48	bl	0x250d54 ; symbol stub for: __Z14fxSimpleBorderRK5HGRefI6HGNodeERK6PCRectIdEffRK9PCVector4IdERK14PCMatrix44TmplIdE18FxSimpleBorderType
00000000000b3a4c	mov	x2, sp
00000000000b3a50	mov	x0, x19
00000000000b3a54	bl	"_objc_msgSend$setHeliumRef:"
00000000000b3a58	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : ColorParameter
    parm3 : PopupMenu
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm3 (int)

```
