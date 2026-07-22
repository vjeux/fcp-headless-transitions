# MinMax

- **PAE class:** `MinMax`
- **Plugin UUID:** `D2342006-51C4-4439-8E89-E970F135E21C`
- **Node names in corpus:** MinMax (272), MinMax 2 (2), MinMax 1 (1), MinMax copy (1)
- **Corpus usage:** 117 files, 276 instances

## What it does

MinMax is a morphological erode/dilate: in Minimum mode it shrinks (erodes) light areas by replacing each pixel with the minimum in a Radius window, in Maximum mode it grows (dilates) them with the maximum. It runs a separable X-then-Y pass over the full 2R+1 window on premultiplied RGBA. Implemented and verified against headless FCP.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 0 | 0 .. 100 | Window half-width in pixels (0-250 nominal). 0 = identity (passthrough). Larger = more aggressive erode/dilate. *(keyframed in 2 instances)* |
| Mode | bool/enum | 0 | 0 .. 1 | 0 = Minimum (erode: shrink light areas), 1 = Maximum (dilate: grow light areas). |
| Mix | float | 1 | 0.9343 .. 1 | Wet/dry blend of the morphed result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/minmax.ts`](../../engine/src/compositor/filters/minmax.ts).

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

### CPU parameter wiring — `-[PAEMinMax canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEMinMax`

```asm
0000000000046034	mov	w3, #0x1
0000000000046038	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000004603c	ldr	x4, [x22]
0000000000046040	add	x2, sp, #0x48
0000000000046044	mov	x0, x23
0000000000046048	mov	w3, #0x2
000000000004604c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000046050	ldr	x2, [x22]
0000000000046054	mov	x0, x21
0000000000046058	bl	"_objc_msgSend$getRenderMode:"
000000000004605c	cbz	w0, 0x46084
0000000000046060	mov	x0, x20
0000000000046064	bl	_objc_msgSend$imageType
0000000000046068	cmp	x0, #0x3
000000000004606c	b.ne	0x46084
0000000000046070	cbz	x20, 0x460ac
0000000000046074	add	x8, sp, #0x40
0000000000046078	mov	x0, x20
000000000004607c	bl	_objc_msgSend$heliumRef
0000000000046080	b	0x460b0
0000000000046084	mov	w22, #0x0
0000000000046088	mov	x0, x22
000000000004608c	ldp	x29, x30, [sp, #0x120]
0000000000046090	ldp	x20, x19, [sp, #0x110]
0000000000046094	ldp	x22, x21, [sp, #0x100]
0000000000046098	ldp	x24, x23, [sp, #0xf0]
000000000004609c	ldp	x28, x27, [sp, #0xe0]
00000000000460a0	ldp	d9, d8, [sp, #0xd0]
00000000000460a4	add	sp, sp, #0x130
00000000000460a8	ret
00000000000460ac	str	xzr, [sp, #0x40]
00000000000460b0	ldr	w8, [sp, #0x48]
00000000000460b4	cbz	w8, 0x46150
00000000000460b8	add	x8, sp, #0x10
00000000000460bc	mov	x0, x21
00000000000460c0	mov	x2, x20
00000000000460c4	bl	"_objc_msgSend$getImageBoundary:"
00000000000460c8	ldp	d0, d1, [sp, #0x10]
00000000000460cc	fcvtl	v0.2d, v0.2s
00000000000460d0	fcvtl	v1.2d, v1.2s
00000000000460d4	stp	q0, q1, [sp, #0x20]
00000000000460d8	add	x0, sp, #0x50
00000000000460dc	add	x1, sp, #0x20
00000000000460e0	add	x2, sp, #0x20
00000000000460e4	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000460e8	mov	x22, x0
00000000000460ec	tbz	w0, #0x0, 0x462c0
00000000000460f0	ldr	x0, [sp, #0x40]
00000000000460f4	str	x0, [sp, #0x8]
00000000000460f8	cbz	x0, 0x46108
00000000000460fc	ldr	x8, [x0]
0000000000046100	ldr	x8, [x8, #0x10]
0000000000046104	blr	x8
0000000000046108	add	x8, sp, #0x10
000000000004610c	add	x2, sp, #0x8
0000000000046110	add	x3, sp, #0x20
0000000000046114	mov	x0, x21
0000000000046118	bl	"_objc_msgSend$changeDOD:withRect:"
000000000004611c	ldr	x8, [sp, #0x40]
0000000000046120	ldr	x0, [sp, #0x10]
0000000000046124	cmp	x8, x0
0000000000046128	b.eq	0x46178
000000000004612c	cbz	x8, 0x46144
0000000000046130	ldr	x9, [x8]
0000000000046134	ldr	x9, [x9, #0x18]
0000000000046138	mov	x0, x8
000000000004613c	blr	x9
0000000000046140	ldr	x0, [sp, #0x10]
0000000000046144	str	x0, [sp, #0x40]
0000000000046148	str	xzr, [sp, #0x10]
000000000004614c	b	0x46188
0000000000046150	add	x2, sp, #0x40
0000000000046154	mov	x0, x19
0000000000046158	bl	"_objc_msgSend$setHeliumRef:"
000000000004615c	ldr	x0, [sp, #0x40]
0000000000046160	cbz	x0, 0x46170
0000000000046164	ldr	x8, [x0]
0000000000046168	ldr	x8, [x8, #0x18]
000000000004616c	blr	x8
0000000000046170	mov	w22, #0x1
0000000000046174	b	0x46088
0000000000046178	cbz	x8, 0x46188
000000000004617c	ldr	x8, [x0]
0000000000046180	ldr	x8, [x8, #0x18]
0000000000046184	blr	x8
0000000000046188	ldr	x0, [sp, #0x8]
000000000004618c	cbz	x0, 0x4619c
0000000000046190	ldr	x8, [x0]
0000000000046194	ldr	x8, [x8, #0x18]
0000000000046198	blr	x8
000000000004619c	mov	w0, #0x1d0
00000000000461a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000461a4	mov	x23, x0
00000000000461a8	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
00000000000461ac	ldr	x2, [sp, #0x40]
00000000000461b0	ldr	x8, [x23]
00000000000461b4	ldr	x8, [x8, #0x78]
00000000000461b8	mov	x0, x23
00000000000461bc	mov	w1, #0x0
00000000000461c0	blr	x8
00000000000461c4	mov	x0, x23
00000000000461c8	mov	w1, #0x1
00000000000461cc	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
00000000000461d0	mov	w0, #0x1c0
00000000000461d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000461d8	mov	x24, x0
00000000000461dc	bl	0x251b04 ; symbol stub for: __ZN8HGMinMaxC1Ev
00000000000461e0	ldr	x8, [x24]
00000000000461e4	ldr	x8, [x8, #0x78]
00000000000461e8	mov	x0, x24
00000000000461ec	mov	w1, #0x0
00000000000461f0	mov	x2, x23
00000000000461f4	blr	x8
00000000000461f8	ldr	s0, [sp, #0x4c]
00000000000461fc	scvtf	s0, s0
0000000000046200	ldr	x8, [x24]
0000000000046204	ldr	x8, [x8, #0x60]
0000000000046208	movi.2d	v1, #0000000000000000
000000000004620c	movi.2d	v2, #0000000000000000
0000000000046210	movi.2d	v3, #0000000000000000
0000000000046214	mov	x0, x24
0000000000046218	mov	w1, #0x0
000000000004621c	blr	x8
0000000000046220	ldr	s0, [sp, #0x48]
0000000000046224	scvtf	s0, s0
0000000000046228	fcvt	d1, s0
000000000004622c	fmul	d0, d9, d1
0000000000046230	fcvt	s0, d0
0000000000046234	fmul	d1, d8, d1
0000000000046238	fcvt	s1, d1
000000000004623c	ldr	x8, [x24]
0000000000046240	ldr	x8, [x8, #0x60]
0000000000046244	movi.2d	v2, #0000000000000000
0000000000046248	movi.2d	v3, #0000000000000000
000000000004624c	mov	x0, x24
0000000000046250	mov	w1, #0x1
0000000000046254	blr	x8
0000000000046258	str	x24, [sp, #0x10]
000000000004625c	ldr	x8, [x24]
0000000000046260	ldr	x8, [x8, #0x10]
0000000000046264	mov	x0, x24
0000000000046268	blr	x8
000000000004626c	add	x2, sp, #0x10
0000000000046270	mov	x0, x21
0000000000046274	mov	x3, x20
0000000000046278	mov	x4, x19
000000000004627c	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000046280	add	x2, sp, #0x10
0000000000046284	mov	x0, x19
0000000000046288	bl	"_objc_msgSend$setHeliumRef:"
000000000004628c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PopupMenu
    parm2 : IntSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (int)
    - parm2 (int)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm1 (int)
    slot 1  <-  parm2 (int)
```
