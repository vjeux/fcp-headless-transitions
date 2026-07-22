# Mirror

- **PAE class:** `Mirror`
- **Plugin UUID:** `E1134541-27A1-45CD-972B-AD61D9528316`
- **Node names in corpus:** Mirror (11), Mirror 2 (7), Mirror 1 (7), Mirror 3 (6), Bottom (3), Top (3)
- **Corpus usage:** 14 files, 56 instances

## What it does

Mirror reflects the image across a line through Center at the given Angle, replacing everything on one side of the line with a mirrored copy of the other side. Rotating the Angle changes the axis of reflection.

> **Note.** Not implemented; description is the standard Apple Motion "Mirror" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Point the mirror line passes through (X,Y) in normalized frame coordinates. *(keyframed in 15 instances)* |
| Angle | float (radians) | 0 | 0 .. 4.712 | Angle of the mirror axis, radians (0-~3pi/2). |
| Repeat Border Pixels | bool | 1 | 1 .. 1 | Clamp/repeat edge pixels rather than leaving gaps at the reflection edge. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcMirror`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcMirror` → [`HgcMirror.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcMirror.metal)

```metal
//Metal1.0     
//LEN=000000029d
[[ visible ]] FragmentOut HgcMirror_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r1.x = dot(r0.xyz, hg_Params[1].xyx);
    r1.y = dot(r0.xyz, hg_Params[1].zwz);
    r1.x = abs(r1.x);
    r0.x = dot(r1.xy, hg_Params[2].xy);
    r0.y = dot(r1.xy, hg_Params[2].zw);
    r0.xy = r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEMirror canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEMirror`

```asm
000000000004a154	mov	w4, #0x1
000000000004a158	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000004a15c	ldr	x4, [x22]
000000000004a160	sub	x2, x29, #0x68
000000000004a164	mov	x0, x23
000000000004a168	mov	w3, #0x2
000000000004a16c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000004a170	ldr	x4, [x22]
000000000004a174	sub	x2, x29, #0x6c
000000000004a178	mov	x0, x23
000000000004a17c	mov	w3, #0x3
000000000004a180	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000004a184	mov	x23, x0
000000000004a188	cbz	x19, 0x4a1b0
000000000004a18c	add	x8, sp, #0x20
000000000004a190	mov	x0, x19
000000000004a194	bl	_objc_msgSend$imageInfo
000000000004a198	ldr	x8, [sp, #0x48]
000000000004a19c	cbz	x8, 0x4a1c0
000000000004a1a0	ldur	d0, [x29, #-0x68]
000000000004a1a4	fneg	d0, d0
000000000004a1a8	stur	d0, [x29, #-0x68]
000000000004a1ac	b	0x4a1c0
000000000004a1b0	str	xzr, [sp, #0x60]
000000000004a1b4	movi.2d	v0, #0000000000000000
000000000004a1b8	stp	q0, q0, [sp, #0x40]
000000000004a1bc	stp	q0, q0, [sp, #0x20]
000000000004a1c0	ldr	x2, [x22]
000000000004a1c4	mov	x0, x21
000000000004a1c8	bl	"_objc_msgSend$getRenderMode:"
000000000004a1cc	cbz	w0, 0x4a458
000000000004a1d0	mov	x0, x20
000000000004a1d4	bl	_objc_msgSend$imageType
000000000004a1d8	cmp	x0, #0x3
000000000004a1dc	b.ne	0x4a1f4
000000000004a1e0	cbz	x20, 0x4a1fc
000000000004a1e4	add	x8, sp, #0x18
000000000004a1e8	mov	x0, x20
000000000004a1ec	bl	_objc_msgSend$heliumRef
000000000004a1f0	b	0x4a200
000000000004a1f4	mov	w0, #0x0
000000000004a1f8	b	0x4a458
000000000004a1fc	str	xzr, [sp, #0x18]
000000000004a200	ldur	w8, [x29, #-0x6c]
000000000004a204	cbz	w8, 0x4a288
000000000004a208	ldr	x0, [sp, #0x18]
000000000004a20c	str	x0, [sp, #0x8]
000000000004a210	cbz	x0, 0x4a220
000000000004a214	ldr	x8, [x0]
000000000004a218	ldr	x8, [x8, #0x10]
000000000004a21c	blr	x8
000000000004a220	add	x8, sp, #0x10
000000000004a224	add	x2, sp, #0x8
000000000004a228	mov	x0, x21
000000000004a22c	mov	x3, x20
000000000004a230	mov	x4, x20
000000000004a234	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000004a238	ldp	x0, x8, [sp, #0x10]
000000000004a23c	cmp	x8, x0
000000000004a240	b.eq	0x4a264
000000000004a244	cbz	x8, 0x4a25c
000000000004a248	ldr	x9, [x8]
000000000004a24c	ldr	x9, [x9, #0x18]
000000000004a250	mov	x0, x8
000000000004a254	blr	x9
000000000004a258	ldr	x0, [sp, #0x10]
000000000004a25c	stp	xzr, x0, [sp, #0x10]
000000000004a260	b	0x4a274
000000000004a264	cbz	x8, 0x4a274
000000000004a268	ldr	x8, [x0]
000000000004a26c	ldr	x8, [x8, #0x18]
000000000004a270	blr	x8
000000000004a274	ldr	x0, [sp, #0x8]
000000000004a278	cbz	x0, 0x4a288
000000000004a27c	ldr	x8, [x0]
000000000004a280	ldr	x8, [x8, #0x18]
000000000004a284	blr	x8
000000000004a288	ldur	d0, [x29, #-0x68]
000000000004a28c	bl	0x25205c ; symbol stub for: ___sincos_stret
000000000004a290	mov.16b	v8, v0
000000000004a294	mov.16b	v9, v1
000000000004a298	mov	w0, #0x1e0
000000000004a29c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004a2a0	mov	x22, x0
000000000004a2a4	bl	__ZN7HMirrorC2Ev
000000000004a2a8	ldr	x2, [sp, #0x18]
000000000004a2ac	ldr	x8, [x22]
000000000004a2b0	ldr	x8, [x8, #0x78]
000000000004a2b4	mov	x0, x22
000000000004a2b8	mov	w1, #0x0
000000000004a2bc	blr	x8
000000000004a2c0	ldur	d10, [x29, #-0x58]
000000000004a2c4	mov	x0, x20
000000000004a2c8	bl	_objc_msgSend$width
000000000004a2cc	mov	x24, x0
000000000004a2d0	ldur	d11, [x29, #-0x60]
000000000004a2d4	mov	x0, x20
000000000004a2d8	bl	_objc_msgSend$height
000000000004a2dc	fmov	d0, #-0.50000000
000000000004a2e0	fadd	d1, d11, d0
000000000004a2e4	fadd	d0, d10, d0
000000000004a2e8	ucvtf	d2, x24
000000000004a2ec	fmul	d0, d0, d2
000000000004a2f0	fcvt	s0, d0
000000000004a2f4	ucvtf	d2, x0
000000000004a2f8	fmul	d1, d1, d2
000000000004a2fc	fcvt	s1, d1
000000000004a300	ldr	x8, [x22]
000000000004a304	ldr	x8, [x8, #0x60]
000000000004a308	movi.2d	v2, #0000000000000000
000000000004a30c	movi.2d	v3, #0000000000000000
000000000004a310	mov	x0, x22
000000000004a314	mov	w1, #0x0
000000000004a318	blr	x8
000000000004a31c	fcvt	s9, d9
000000000004a320	fcvt	s8, d8
000000000004a324	fneg	s10, s8
000000000004a328	ldr	x8, [x22]
000000000004a32c	ldr	x8, [x8, #0x60]
000000000004a330	mov	x0, x22
000000000004a334	mov	w1, #0x1
000000000004a338	mov.16b	v0, v9
000000000004a33c	mov.16b	v1, v8
000000000004a340	mov.16b	v2, v10
000000000004a344	mov.16b	v3, v9
000000000004a348	blr	x8
000000000004a34c	ldr	x8, [x22]
000000000004a350	ldr	x8, [x8, #0x60]
000000000004a354	mov	x0, x22
000000000004a358	mov	w1, #0x2
000000000004a35c	mov.16b	v0, v9
000000000004a360	mov.16b	v1, v10
000000000004a364	mov.16b	v2, v8
000000000004a368	mov.16b	v3, v9
000000000004a36c	blr	x8
000000000004a370	ldur	w8, [x29, #-0x6c]
000000000004a374	cmp	w8, #0x0
000000000004a378	csel	w8, wzr, w23, eq
000000000004a37c	cmp	w8, #0x1
000000000004a380	b.ne	0x4a3a4
000000000004a384	mov	x0, x20
000000000004a388	bl	_objc_msgSend$width
000000000004a38c	mov	x23, x0
000000000004a390	mov	x0, x20
000000000004a394	bl	_objc_msgSend$height
000000000004a398	fmov	s2, #0.50000000
000000000004a39c	fmov	s1, #-0.50000000
000000000004a3a0	b	0x4a3c0
000000000004a3a4	mov	x0, x20
000000000004a3a8	bl	_objc_msgSend$width
000000000004a3ac	mov	x23, x0
000000000004a3b0	mov	x0, x20
000000000004a3b4	bl	_objc_msgSend$height
000000000004a3b8	fmov	s2, #-0.50000000
000000000004a3bc	fmov	s1, #0.50000000
000000000004a3c0	ucvtf	s0, x23
000000000004a3c4	fadd	s0, s1, s0
000000000004a3c8	ucvtf	s3, x0
000000000004a3cc	fadd	s1, s1, s3
000000000004a3d0	ldr	x8, [x22]
000000000004a3d4	ldr	x8, [x8, #0x60]
000000000004a3d8	mov	x0, x22
000000000004a3dc	mov	w1, #0x3
000000000004a3e0	mov.16b	v3, v2
000000000004a3e4	blr	x8
000000000004a3e8	str	x22, [sp, #0x10]
000000000004a3ec	ldr	x8, [x22]
000000000004a3f0	ldr	x8, [x8, #0x10]
000000000004a3f4	mov	x0, x22
000000000004a3f8	blr	x8
000000000004a3fc	add	x2, sp, #0x10
000000000004a400	mov	x0, x21
000000000004a404	mov	x3, x20
000000000004a408	mov	x4, x19
000000000004a40c	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000004a410	add	x2, sp, #0x10
000000000004a414	mov	x0, x19
000000000004a418	bl	"_objc_msgSend$setHeliumRef:"
000000000004a41c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  parm3 (int)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
```
