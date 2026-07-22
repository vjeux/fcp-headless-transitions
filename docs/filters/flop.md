# Flop

- **PAE class:** `Flop`
- **Plugin UUID:** `2FF8887B-E673-4727-9601-1B3353531C10`
- **Node names in corpus:** Flop (383), Flip (64), Flop copy (30), Flop 1 (4), Flop 2 (3), Flop 5 (1)
- **Corpus usage:** 212 files, 487 instances

## What it does

Flop mirrors the layer about its center: horizontally (left<->right), vertically (top<->bottom), or both (a 180 deg point reflection). It is a lossless axis-aligned pixel permutation with no resampling. Implemented and verified faithful to FCP's pure geometric transform (there is no shader).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Flop | enum(int) | 0 | 0 .. 2 | Mirror axis: 0 = Horizontal (mirror left/right), 1 = Vertical (mirror top/bottom), 2 = Both (180 deg point reflection). |
| Mix | float | 1 | 0 .. 1 | Host-level wet/dry blend, 0-1 continuous. Always 1 in the corpus; the filter itself is a hard mirror. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/flop.ts`](../../engine/src/compositor/filters/flop.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

### CPU render method — `-[PAEFlop canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEFlop`

```asm
000000000002d758	mov	w3, #0x1
000000000002d75c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000002d760	ldr	w23, [sp, #0x18c]
000000000002d764	cmp	w23, #0x3
000000000002d768	b.hs	0x2d8f4
000000000002d76c	ldr	x2, [x21]
000000000002d770	mov	x0, x22
000000000002d774	bl	"_objc_msgSend$getRenderMode:"
000000000002d778	cbz	w0, 0x2d8dc
000000000002d77c	ldr	x21, [x21, #0x8]
000000000002d780	mov	x0, x20
000000000002d784	bl	_objc_msgSend$imageType
000000000002d788	cmp	x0, #0x3
000000000002d78c	b.ne	0x2d850
000000000002d790	add	x9, sp, #0x100
000000000002d794	mov	w8, #0x6
000000000002d798	mov	x10, #0x3ff0000000000000
000000000002d79c	str	x10, [sp, #0x178]
000000000002d7a0	str	x10, [sp, #0x150]
000000000002d7a4	lsr	w8, w8, w23
000000000002d7a8	str	x10, [sp, #0x128]
000000000002d7ac	str	x10, [sp, #0x100]
000000000002d7b0	movi.2d	v0, #0000000000000000
000000000002d7b4	stur	q0, [x9, #0x8]
000000000002d7b8	stur	q0, [x9, #0x18]
000000000002d7bc	stp	q0, q0, [sp, #0x130]
000000000002d7c0	stur	q0, [x9, #0x58]
000000000002d7c4	stur	q0, [x9, #0x68]
000000000002d7c8	tbnz	w23, #0x0, 0x2d7dc
000000000002d7cc	adrp	x9, 572 ; 0x269000
000000000002d7d0	ldr	q1, [x9, #0x7e0]
000000000002d7d4	fneg.2d	v0, v0
000000000002d7d8	stp	q1, q0, [sp, #0x100]
000000000002d7dc	tbz	w8, #0x0, 0x2d7f4
000000000002d7e0	adrp	x8, 572 ; 0x269000
000000000002d7e4	ldr	q0, [x8, #0x7f0]
000000000002d7e8	movi.2d	v1, #0000000000000000
000000000002d7ec	fneg.2d	v1, v1
000000000002d7f0	stp	q0, q1, [sp, #0x120]
000000000002d7f4	mov	x8, sp
000000000002d7f8	sub	x0, x29, #0xb0
000000000002d7fc	add	x1, sp, #0x100
000000000002d800	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
000000000002d804	add	x22, sp, #0x80
000000000002d808	add	x8, sp, #0x80
000000000002d80c	mov	x0, sp
000000000002d810	add	x1, sp, #0x190
000000000002d814	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
000000000002d818	mov	x8, #0x0
000000000002d81c	add	x9, sp, #0x100
000000000002d820	add	x10, x9, x8
000000000002d824	add	x11, x22, x8
000000000002d828	ldp	q0, q1, [x11]
000000000002d82c	stp	q0, q1, [x10]
000000000002d830	add	x8, x8, #0x20
000000000002d834	cmp	x8, #0x80
000000000002d838	b.ne	0x2d820
000000000002d83c	cbz	x20, 0x2d858
000000000002d840	add	x8, sp, #0x80
000000000002d844	mov	x0, x20
000000000002d848	bl	_objc_msgSend$heliumRef
000000000002d84c	b	0x2d85c
000000000002d850	mov	w0, #0x0
000000000002d854	b	0x2d8dc
000000000002d858	str	xzr, [sp, #0x80]
000000000002d85c	cmp	x21, #0x2
000000000002d860	cset	w2, eq
000000000002d864	mov	x8, sp
000000000002d868	add	x0, sp, #0x100
000000000002d86c	add	x1, sp, #0x80
000000000002d870	mov	x3, x2
000000000002d874	bl	0x251c24 ; symbol stub for: __ZN9FxSupport15makeHeliumXFormERK14PCMatrix44TmplIdERK5HGRefI6HGNodeEbb
000000000002d878	ldr	x8, [sp, #0x80]
000000000002d87c	ldr	x0, [sp]
000000000002d880	cmp	x8, x0
000000000002d884	b.eq	0x2d8a8
000000000002d888	cbz	x8, 0x2d8a0
000000000002d88c	ldr	x9, [x8]
000000000002d890	ldr	x9, [x9, #0x18]
000000000002d894	mov	x0, x8
000000000002d898	blr	x9
000000000002d89c	ldr	x0, [sp]
000000000002d8a0	str	x0, [sp, #0x80]
000000000002d8a4	b	0x2d8b8
000000000002d8a8	cbz	x8, 0x2d8b8
000000000002d8ac	ldr	x8, [x0]
000000000002d8b0	ldr	x8, [x8, #0x18]
000000000002d8b4	blr	x8
000000000002d8b8	add	x2, sp, #0x80
000000000002d8bc	mov	x0, x19
000000000002d8c0	bl	"_objc_msgSend$setHeliumRef:"
000000000002d8c4	ldr	x0, [sp, #0x80]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PopupMenu
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (int)

```
