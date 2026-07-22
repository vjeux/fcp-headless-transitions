# Neon

- **PAE class:** `Neon`
- **Plugin UUID:** `176021CD-2DFB-40FF-B3D4-9399F25C36C4`
- **Node names in corpus:** Neon (22), Glow (2)
- **Corpus usage:** 23 files, 24 instances

## What it does

Neon finds the edges in the image and lights them up like glowing neon tubing, adding a bright colored inner line and a softer outer glow around detected contours. Inner/Outer Glow set the two halo sizes, the Brightness enums pick their intensity tiers, and Edge Intensity controls how strongly edges are detected.

> **Note.** Not implemented; description is the standard Apple Motion "Neon" edge-glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Outer Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the outer halo (1-2). |
| Outer Glow | float (pixels) | 45 | 1 .. 200 | Size of the outer glow halo, ~1-200 (default 45). |
| Inner Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the inner glowing line (1-2). |
| Inner Glow | float (pixels) | 50 | 50 .. 65 | Size of the inner glow, ~50-65 (default 50). *(keyframed in 2 instances)* |
| Edge Intensity | float | 10 | 10 .. 15 | How strongly edges are detected/lit, ~10-15 (default 10). |
| Mix | float | 1 | 0.05 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorMatrix`, `HGHWMultiBlend`, `HGaussianBlur`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

### CPU render method — `-[PAENeon canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAENeon`

```asm
000000000000d65c	mov	w3, #0x1
000000000000d660	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d664	stur	xzr, [x29, #-0x70]
000000000000d668	ldr	x4, [x19]
000000000000d66c	sub	x2, x29, #0x70
000000000000d670	mov	x0, x24
000000000000d674	mov	w3, #0x3
000000000000d678	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d67c	stur	x25, [x29, #-0x78]
000000000000d680	ldr	x4, [x19]
000000000000d684	sub	x2, x29, #0x78
000000000000d688	mov	x0, x24
000000000000d68c	mov	w3, #0x2
000000000000d690	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d694	str	xzr, [sp, #0x80]
000000000000d698	ldr	x4, [x19]
000000000000d69c	add	x2, sp, #0x80
000000000000d6a0	mov	x0, x24
000000000000d6a4	mov	w3, #0x5
000000000000d6a8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d6ac	str	x25, [sp, #0x78]
000000000000d6b0	ldr	x4, [x19]
000000000000d6b4	add	x2, sp, #0x78
000000000000d6b8	mov	x0, x24
000000000000d6bc	mov	w3, #0x4
000000000000d6c0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d6c4	ldr	x2, [x19]
000000000000d6c8	mov	x0, x22
000000000000d6cc	bl	"_objc_msgSend$getRenderMode:"
000000000000d6d0	mov	x19, x0
000000000000d6d4	mov	x0, x23
000000000000d6d8	bl	_objc_msgSend$imageType
000000000000d6dc	cmp	w19, #0x0
000000000000d6e0	ccmp	x0, #0x3, #0x0, ne
000000000000d6e4	cset	w19, eq
000000000000d6e8	b.ne	0xd9b8
000000000000d6ec	cbz	x23, 0xd700
000000000000d6f0	add	x8, sp, #0x70
000000000000d6f4	mov	x0, x23
000000000000d6f8	bl	_objc_msgSend$heliumRef
000000000000d6fc	b	0xd704
000000000000d700	str	xzr, [sp, #0x70]
000000000000d704	add	x8, sp, #0x60
000000000000d708	mov	x0, x22
000000000000d70c	mov	x2, x23
000000000000d710	bl	"_objc_msgSend$getScaleForImage:"
000000000000d714	ldur	d8, [x29, #-0x68]
000000000000d718	ldr	x0, [sp, #0x70]
000000000000d71c	str	x0, [sp, #0x50]
000000000000d720	cbz	x0, 0xd730
000000000000d724	ldr	x8, [x0]
000000000000d728	ldr	x8, [x8, #0x10]
000000000000d72c	blr	x8
000000000000d730	add	x8, sp, #0x58
000000000000d734	add	x2, sp, #0x50
000000000000d738	mov	x0, x22
000000000000d73c	mov.16b	v0, v8
000000000000d740	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d744	ldr	x0, [sp, #0x50]
000000000000d748	cbz	x0, 0xd758
000000000000d74c	ldr	x8, [x0]
000000000000d750	ldr	x8, [x8, #0x18]
000000000000d754	blr	x8
000000000000d758	ldur	d8, [x29, #-0x70]
000000000000d75c	ldp	d9, d10, [sp, #0x60]
000000000000d760	ldr	x0, [sp, #0x70]
000000000000d764	str	x0, [sp, #0x40]
000000000000d768	cbz	x0, 0xd778
000000000000d76c	ldr	x8, [x0]
000000000000d770	ldr	x8, [x8, #0x10]
000000000000d774	blr	x8
000000000000d778	add	x8, sp, #0x48
000000000000d77c	add	x2, sp, #0x40
000000000000d780	mov	x0, x22
000000000000d784	mov.16b	v0, v8
000000000000d788	mov.16b	v1, v9
000000000000d78c	mov.16b	v2, v10
000000000000d790	bl	"_objc_msgSend$blurNodeWithRadius:xScale:yScale:inputNode:"
000000000000d794	ldr	x0, [sp, #0x40]
000000000000d798	cbz	x0, 0xd7a8
000000000000d79c	ldr	x8, [x0]
000000000000d7a0	ldr	x8, [x8, #0x18]
000000000000d7a4	blr	x8
000000000000d7a8	ldur	d8, [x29, #-0x78]
000000000000d7ac	ldr	x0, [sp, #0x48]
000000000000d7b0	str	x0, [sp, #0x30]
000000000000d7b4	cbz	x0, 0xd7c4
000000000000d7b8	ldr	x8, [x0]
000000000000d7bc	ldr	x8, [x8, #0x10]
000000000000d7c0	blr	x8
000000000000d7c4	add	x8, sp, #0x38
000000000000d7c8	add	x2, sp, #0x30
000000000000d7cc	mov	x0, x22
000000000000d7d0	mov.16b	v0, v8
000000000000d7d4	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d7d8	ldr	x0, [sp, #0x30]
000000000000d7dc	cbz	x0, 0xd7ec
000000000000d7e0	ldr	x8, [x0]
000000000000d7e4	ldr	x8, [x8, #0x18]
000000000000d7e8	blr	x8
000000000000d7ec	ldr	d8, [sp, #0x80]
000000000000d7f0	ldp	d9, d10, [sp, #0x60]
000000000000d7f4	ldr	x0, [sp, #0x70]
000000000000d7f8	str	x0, [sp, #0x20]
000000000000d7fc	cbz	x0, 0xd80c
000000000000d800	ldr	x8, [x0]
000000000000d804	ldr	x8, [x8, #0x10]
000000000000d808	blr	x8
000000000000d80c	add	x8, sp, #0x28
000000000000d810	add	x2, sp, #0x20
000000000000d814	mov	x0, x22
000000000000d818	mov.16b	v0, v8
000000000000d81c	mov.16b	v1, v9
000000000000d820	mov.16b	v2, v10
000000000000d824	bl	"_objc_msgSend$blurNodeWithRadius:xScale:yScale:inputNode:"
000000000000d828	ldr	x0, [sp, #0x20]
000000000000d82c	cbz	x0, 0xd83c
000000000000d830	ldr	x8, [x0]
000000000000d834	ldr	x8, [x8, #0x18]
000000000000d838	blr	x8
000000000000d83c	ldr	d8, [sp, #0x78]
000000000000d840	ldr	x0, [sp, #0x28]
000000000000d844	str	x0, [sp, #0x10]
000000000000d848	cbz	x0, 0xd858
000000000000d84c	ldr	x8, [x0]
000000000000d850	ldr	x8, [x8, #0x10]
000000000000d854	blr	x8
000000000000d858	add	x8, sp, #0x18
000000000000d85c	add	x2, sp, #0x10
000000000000d860	mov	x0, x22
000000000000d864	mov.16b	v0, v8
000000000000d868	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d86c	ldr	x0, [sp, #0x10]
000000000000d870	cbz	x0, 0xd880
000000000000d874	ldr	x8, [x0]
000000000000d878	ldr	x8, [x8, #0x18]
000000000000d87c	blr	x8
000000000000d880	mov	w0, #0x280
000000000000d884	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000000d888	mov	x22, x0
000000000000d88c	bl	0x25124c ; symbol stub for: __ZN14HGHWMultiBlendC1Ev
000000000000d890	ldr	x2, [sp, #0x58]
000000000000d894	ldr	x8, [x22]
000000000000d898	ldr	x8, [x8, #0x78]
000000000000d89c	mov	x0, x22
000000000000d8a0	mov	w1, #0x0
000000000000d8a4	blr	x8
000000000000d8a8	ldr	x8, [x22]
000000000000d8ac	ldr	x8, [x8, #0x78]
000000000000d8b0	cmp	w21, #0x4
000000000000d8b4	b.lo	0xd8d0
000000000000d8b8	ldr	x2, [sp, #0x18]
000000000000d8bc	mov	x0, x22
000000000000d8c0	mov	w1, #0x1
000000000000d8c4	blr	x8
000000000000d8c8	add	x8, sp, #0x38
000000000000d8cc	b	0xd8e4
000000000000d8d0	ldr	x2, [sp, #0x38]
000000000000d8d4	mov	x0, x22
000000000000d8d8	mov	w1, #0x1
000000000000d8dc	blr	x8
000000000000d8e0	add	x8, sp, #0x18
000000000000d8e4	ldr	x2, [x8]
000000000000d8e8	ldr	x8, [x22]
000000000000d8ec	ldr	x8, [x8, #0x78]
000000000000d8f0	mov	x0, x22
000000000000d8f4	mov	w1, #0x2
000000000000d8f8	blr	x8
000000000000d8fc	str	x22, [sp, #0x8]
000000000000d900	ldr	x8, [x22]
000000000000d904	ldr	x8, [x8, #0x10]
000000000000d908	mov	x0, x22
000000000000d90c	blr	x8
000000000000d910	add	x2, sp, #0x8
000000000000d914	mov	x0, x20
000000000000d918	bl	"_objc_msgSend$setHeliumRef:"
000000000000d91c	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm1 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm2 (float)
    - parm5 (float)
    - parm4 (float)

```
