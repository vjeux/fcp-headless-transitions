# Scrub

- **PAE class:** `Scrub`
- **Plugin UUID:** `3A359CB1-0572-48AD-8623-4D5A681466F5`
- **Node names in corpus:** Scrub (3), Scrub Source (1)
- **Corpus usage:** 3 files, 4 instances

## What it does

Scrub offsets which frame of the source clip is displayed (a time-scrub), optionally blending between frames. Frame offset picks the temporal shift and Frame Blending smooths between offset frames. It is a time filter, not a pixel filter.

> **Note.** Not implemented; description is the standard Apple Motion "Scrub" time filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Frame offset | float | 0 | 0 .. 1 | Temporal offset (how many frames to scrub). Continuous. |
| Frame Blending | bool | 1 | 0 .. 0 | Blend between adjacent frames for smoother scrubbing. |
| Offset from | enum | 0 | 0 .. 1 | Reference point the offset is measured from. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcEchoBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoBlend` → [`HgcEchoBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoBlend.metal)

```metal
//Metal1.0     
//LEN=0000000130
[[ visible ]] FragmentOut HgcEchoBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    output.color0 = mix(r1, r0, hg_Params[0]);
    return output;
}
```

### CPU parameter wiring — `-[PAEScrub canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEScrub`

```asm
000000000005a7e8	add	x0, sp, #0x30
000000000005a7ec	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000005a7f0	add	x0, sp, #0x30
000000000005a7f4	fmov	d0, #1.00000000
000000000005a7f8	fmov	d1, #2.00000000
000000000005a7fc	fmov	d2, #1.00000000
000000000005a800	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000005a804	mov	w0, #0x210
000000000005a808	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005a80c	mov	x25, x0
000000000005a810	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000005a814	ldr	x8, [x25]
000000000005a818	ldr	x8, [x8, #0x230]
000000000005a81c	add	x1, sp, #0x30
000000000005a820	mov	x0, x25
000000000005a824	blr	x8
000000000005a828	ldr	x8, [x25]
000000000005a82c	ldr	x8, [x8, #0x78]
000000000005a830	mov	x0, x25
000000000005a834	mov	w1, #0x0
000000000005a838	mov	x2, x24
000000000005a83c	blr	x8
000000000005a840	ldur	x24, [x29, #-0x98]
000000000005a844	cmp	x24, x25
000000000005a848	b.eq	0x5a878
000000000005a84c	cbz	x24, 0x5a860
000000000005a850	ldr	x8, [x24]
000000000005a854	ldr	x8, [x8, #0x18]
000000000005a858	mov	x0, x24
000000000005a85c	blr	x8
000000000005a860	stur	x25, [x29, #-0x98]
000000000005a864	ldr	x8, [x25]
000000000005a868	ldr	x8, [x8, #0x10]
000000000005a86c	mov	x0, x25
000000000005a870	blr	x8
000000000005a874	mov	x24, x25
000000000005a878	ldr	x8, [x25]
000000000005a87c	ldr	x8, [x8, #0x18]
000000000005a880	mov	x0, x25
000000000005a884	blr	x8
000000000005a888	add	x0, sp, #0x30
000000000005a88c	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
000000000005a890	ldurb	w8, [x29, #-0x75]
000000000005a894	tbz	w8, #0x0, 0x5aa04
000000000005a898	ldur	d8, [x29, #-0x70]
000000000005a89c	ldr	q0, [x27]
000000000005a8a0	str	q0, [sp, #0x10]
000000000005a8a4	ldr	x8, [x27, #0x10]
000000000005a8a8	str	x8, [sp, #0x20]
000000000005a8ac	add	x8, sp, #0x10
000000000005a8b0	str	x8, [sp, #0x8]
000000000005a8b4	ldr	x0, [x22, x28]
000000000005a8b8	fmov	d0, #-1.00000000
000000000005a8bc	sub	x1, x29, #0x90
000000000005a8c0	add	x2, sp, #0x8
000000000005a8c4	bl	0x250e08 ; symbol stub for: __Z22subtractFramesFromTimePU26objcproto15PROAPIAccessing11objc_objectd6FxTimePS1_
000000000005a8c8	str	xzr, [sp]
000000000005a8cc	ldp	q0, q1, [x23]
000000000005a8d0	stp	q0, q1, [sp, #0x30]
000000000005a8d4	ldr	q0, [x23, #0x20]
000000000005a8d8	str	q0, [sp, #0x50]
000000000005a8dc	ldr	x5, [sp, #0x8]
000000000005a8e0	mov	x2, sp
000000000005a8e4	add	x4, sp, #0x30
000000000005a8e8	mov	x0, x22
000000000005a8ec	mov	w3, #0x0
000000000005a8f0	bl	"_objc_msgSend$getHeliumImage:source:withInfo:atTime:"
000000000005a8f4	ldr	x0, [sp]
000000000005a8f8	cbnz	x0, 0x5a908
000000000005a8fc	str	x21, [sp]
000000000005a900	mov	x0, x21
000000000005a904	cbz	x21, 0x5aa60
000000000005a908	add	x8, sp, #0x30
000000000005a90c	bl	_objc_msgSend$heliumRef
000000000005a910	ldr	x22, [sp, #0x30]
000000000005a914	mov	w0, #0x1a0
000000000005a918	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005a91c	mov	x23, x0
000000000005a920	bl	__ZN12HgcEchoBlendC1Ev
000000000005a924	ldr	x8, [x23]
000000000005a928	ldr	x8, [x8, #0x78]
000000000005a92c	mov	x0, x23
000000000005a930	mov	w1, #0x0
000000000005a934	mov	x2, x24
000000000005a938	blr	x8
000000000005a93c	ldur	x0, [x29, #-0xa0]
000000000005a940	cmp	x0, x21
000000000005a944	b.eq	0x5a94c
000000000005a948	bl	0x252344 ; symbol stub for: _objc_release
000000000005a94c	ldr	x8, [x23]
000000000005a950	ldr	x8, [x8, #0x78]
000000000005a954	mov	x0, x23
000000000005a958	mov	w1, #0x1
000000000005a95c	mov	x2, x22
000000000005a960	blr	x8
000000000005a964	ldr	x0, [sp]
000000000005a968	cmp	x0, x21
000000000005a96c	b.eq	0x5a974
000000000005a970	bl	0x252344 ; symbol stub for: _objc_release
000000000005a974	frintm	d0, d8
000000000005a978	fsub	d0, d0, d8
000000000005a97c	fmov	d1, #1.00000000
000000000005a980	fadd	d0, d0, d1
000000000005a984	fcvt	s0, d0
000000000005a988	ldr	x8, [x23]
000000000005a98c	ldr	x8, [x8, #0x60]
000000000005a990	mov	x0, x23
000000000005a994	mov	w1, #0x0
000000000005a998	mov.16b	v1, v0
000000000005a99c	mov.16b	v2, v0
000000000005a9a0	mov.16b	v3, v0
000000000005a9a4	blr	x8
000000000005a9a8	str	x23, [sp, #0x30]
000000000005a9ac	ldr	x8, [x23]
000000000005a9b0	ldr	x8, [x8, #0x10]
000000000005a9b4	mov	x0, x23
000000000005a9b8	blr	x8
000000000005a9bc	add	x2, sp, #0x30
000000000005a9c0	mov	x0, x20
000000000005a9c4	bl	"_objc_msgSend$setHeliumRef:"
000000000005a9c8	ldr	x0, [sp, #0x30]
000000000005a9cc	cbz	x0, 0x5a9dc
000000000005a9d0	ldr	x8, [x0]
000000000005a9d4	ldr	x8, [x8, #0x18]
000000000005a9d8	blr	x8
000000000005a9dc	ldr	x8, [x23]
000000000005a9e0	ldr	x8, [x8, #0x18]
000000000005a9e4	mov	x0, x23
000000000005a9e8	blr	x8
000000000005a9ec	cbz	x22, 0x5aa20
000000000005a9f0	ldr	x8, [x22]
000000000005a9f4	ldr	x8, [x8, #0x18]
000000000005a9f8	mov	x0, x22
000000000005a9fc	blr	x8
000000000005aa00	b	0x5aa20
000000000005aa04	sub	x2, x29, #0x98
000000000005aa08	mov	x0, x20
000000000005aa0c	bl	"_objc_msgSend$setHeliumRef:"
000000000005aa10	ldur	x0, [x29, #-0xa0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : PopupMenu
    parm3 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
