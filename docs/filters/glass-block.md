# Glass Block

- **PAE class:** `Glass Block`
- **Plugin UUID:** `E8018079-D8E9-45B0-9A29-6B2BFC356AFB`
- **Node names in corpus:** Glass Block (13)
- **Corpus usage:** 7 files, 13 instances

## What it does

Glass Block tiles the image into a grid of rectangular glass bricks, each refracting/magnifying its portion of the picture like glass-block windows. Tile Size sets the brick size, Scale the magnification within each brick, and Angle rotates the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Glass Block" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float | 2.8 | 1.12 .. 2.92 | Magnification within each glass brick, ~1.1-2.9 (default 2.8). *(keyframed in 4 instances)* |
| Center | point2D | - | - | Anchor of the brick grid (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0 .. 6.37 | Rotation of the brick grid, radians (default 0). |
| Tile Size | float (pixels) | 65 | 30 .. 1000 | Size of each glass brick, ~30-1000 (default 65). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGlassBlock`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGlassBlock` → [`HgcGlassBlock.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGlassBlock.metal)

```metal
//Metal1.0     
//LEN=0000000448
[[ visible ]] FragmentOut HgcGlassBlock_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r1.xy = r0.xy*hg_Params[1].xy;
    r1.xy = floor(r1.xy);
    r1.xy = r1.xy*hg_Params[1].zw;
    r0.xy = r0.xy - r1.xy;
    r2.x = dot(r1.xy, hg_Params[2].xy);
    r2.y = dot(r1.xy, hg_Params[2].zw);
    r2.xy = r2.xy + r0.xy;
    r2.xy = r2.xy + hg_Params[0].xy;
    r1.xy = fmax(r2.xy, hg_Params[3].xy);
    r1.xy = fmin(r1.xy, hg_Params[4].xy);
    r0.xy = hg_Params[3].xy - r2.xy;
    r2.xy = r2.xy - hg_Params[4].xy;
    r0.x = fmax(r0.x, r0.y);
    r0.y = fmax(r2.x, r2.y);
    r0.x = fmax(r0.x, r0.y);
    r1.xy = r1.xy + hg_Params[5].xy;
    r1.xy = r1.xy*hg_Params[5].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.xxxx, -r0.xxxx < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGlassBlock canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGlassBlock`

```asm
00000000000a570c	mov	w4, #0x1
00000000000a5710	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000a5714	add	x8, sp, #0x50
00000000000a5718	sub	x2, x29, #0x70
00000000000a571c	mov	x0, x22
00000000000a5720	mov	x3, x21
00000000000a5724	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000000a5728	ldr	q0, [sp, #0x50]
00000000000a572c	stur	q0, [x29, #-0x70]
00000000000a5730	stur	xzr, [x29, #-0x78]
00000000000a5734	ldr	x4, [x20]
00000000000a5738	sub	x2, x29, #0x78
00000000000a573c	mov	x0, x23
00000000000a5740	mov	w3, #0x2
00000000000a5744	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a5748	ldur	d0, [x29, #-0x78]
00000000000a574c	fmov	d1, #1.00000000
00000000000a5750	fdiv	d0, d1, d0
00000000000a5754	stur	d0, [x29, #-0x78]
00000000000a5758	mov	x8, #0x403e000000000000
00000000000a575c	stur	x8, [x29, #-0x80]
00000000000a5760	ldr	x4, [x20]
00000000000a5764	sub	x2, x29, #0x80
00000000000a5768	mov	x0, x23
00000000000a576c	mov	w3, #0x3
00000000000a5770	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a5774	cbz	x19, 0xa579c
00000000000a5778	sub	x8, x29, #0xd0
00000000000a577c	mov	x0, x19
00000000000a5780	bl	_objc_msgSend$imageInfo
00000000000a5784	ldur	x8, [x29, #-0xa8]
00000000000a5788	ldur	d0, [x29, #-0x80]
00000000000a578c	cbz	x8, 0xa57b0
00000000000a5790	fneg	d0, d0
00000000000a5794	stur	d0, [x29, #-0x80]
00000000000a5798	b	0xa57b0
00000000000a579c	stur	xzr, [x29, #-0x90]
00000000000a57a0	movi.2d	v0, #0000000000000000
00000000000a57a4	stp	q0, q0, [x29, #-0xb0]
00000000000a57a8	stp	q0, q0, [x29, #-0xd0]
00000000000a57ac	ldur	d0, [x29, #-0x80]
00000000000a57b0	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000a57b4	mov.16b	v8, v0
00000000000a57b8	mov.16b	v9, v1
00000000000a57bc	stur	xzr, [x29, #-0xd8]
00000000000a57c0	ldr	x4, [x20]
00000000000a57c4	sub	x2, x29, #0xd8
00000000000a57c8	mov	x0, x23
00000000000a57cc	mov	w3, #0x4
00000000000a57d0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a57d4	add	x8, sp, #0xd8
00000000000a57d8	mov	x0, x22
00000000000a57dc	mov	x2, x21
00000000000a57e0	bl	"_objc_msgSend$getScaleForImage:"
00000000000a57e4	ldr	d0, [sp, #0xd8]
00000000000a57e8	ldur	d1, [x29, #-0xd8]
00000000000a57ec	fmul	d10, d0, d1
00000000000a57f0	stur	d10, [x29, #-0xd8]
00000000000a57f4	adrp	x0, 803 ; 0x3c8000
00000000000a57f8	add	x0, x0, #0xbe8 ; Objc cfstring ref: @"bad cfstring ref"
00000000000a57fc	bl	0x250ba4 ; symbol stub for: _NSClassFromString
00000000000a5800	bl	0x252284 ; symbol stub for: _objc_alloc
00000000000a5804	ldr	x2, [x22, x24]
00000000000a5808	bl	"_objc_msgSend$initWithAPIManager:"
00000000000a580c	bl	0x25229c ; symbol stub for: _objc_autorelease
00000000000a5810	ldr	x8, [x20, #0x10]
00000000000a5814	cbz	x8, 0xa582c
00000000000a5818	bl	_objc_msgSend$upscalesFields
00000000000a581c	fmov	d0, #0.50000000
00000000000a5820	fmul	d0, d10, d0
00000000000a5824	cmp	w0, #0x0
00000000000a5828	fcsel	d10, d10, d0, ne
00000000000a582c	ldr	x2, [x20]
00000000000a5830	mov	x0, x22
00000000000a5834	bl	"_objc_msgSend$getRenderMode:"
00000000000a5838	cbz	w0, 0xa5a2c
00000000000a583c	mov	x0, x21
00000000000a5840	bl	_objc_msgSend$imageType
00000000000a5844	cmp	x0, #0x3
00000000000a5848	b.ne	0xa5860
00000000000a584c	cbz	x21, 0xa5868
00000000000a5850	add	x8, sp, #0xd0
00000000000a5854	mov	x0, x21
00000000000a5858	bl	_objc_msgSend$heliumRef
00000000000a585c	b	0xa586c
00000000000a5860	mov	w0, #0x0
00000000000a5864	b	0xa5a2c
00000000000a5868	str	xzr, [sp, #0xd0]
00000000000a586c	mov	w0, #0x1b0
00000000000a5870	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a5874	mov	x20, x0
00000000000a5878	bl	__ZN13HgcGlassBlockC2Ev
00000000000a587c	adrp	x8, 749 ; 0x392000
00000000000a5880	add	x8, x8, #0xda0
00000000000a5884	add	x8, x8, #0x10
00000000000a5888	str	x8, [x20]
00000000000a588c	add	x8, sp, #0x50
00000000000a5890	mov	x0, x22
00000000000a5894	mov	x2, x21
00000000000a5898	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000a589c	add	x8, sp, #0x40
00000000000a58a0	mov	x0, x22
00000000000a58a4	mov	x2, x21
00000000000a58a8	bl	"_objc_msgSend$getImageBoundary:"
00000000000a58ac	stp	xzr, xzr, [sp, #0x20]
00000000000a58b0	fmov.2d	v0, #-1.00000000
00000000000a58b4	str	q0, [sp, #0x30]
00000000000a58b8	ldp	d0, d1, [sp, #0x40]
00000000000a58bc	fcvtl	v0.2d, v0.2s
00000000000a58c0	fcvtl	v1.2d, v1.2s
00000000000a58c4	stp	q0, q1, [sp]
00000000000a58c8	add	x0, sp, #0x50
00000000000a58cc	mov	x1, sp
00000000000a58d0	add	x2, sp, #0x20
00000000000a58d4	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000a58d8	ldp	d0, d1, [sp, #0x20]
00000000000a58dc	fcvt	s0, d0
00000000000a58e0	fcvt	s1, d1
00000000000a58e4	ldp	d2, d3, [sp, #0x30]
00000000000a58e8	fcvt	s2, d2
00000000000a58ec	fcvt	s3, d3
00000000000a58f0	fadd	s2, s0, s2
00000000000a58f4	fadd	s3, s1, s3
00000000000a58f8	bl	0x250a78 ; symbol stub for: _HGRectfMake4f
00000000000a58fc	stp	s0, s1, [sp]
00000000000a5900	stp	s2, s3, [sp, #0x8]
00000000000a5904	mov	x1, sp
00000000000a5908	mov	x0, x20
00000000000a590c	bl	__ZN10HStarburst7SetRectERK7HGRectf
00000000000a5910	ldr	x2, [sp, #0xd0]
00000000000a5914	ldr	x8, [x20]
00000000000a5918	ldr	x8, [x8, #0x78]
00000000000a591c	mov	x0, x20
00000000000a5920	mov	w1, #0x0
00000000000a5924	blr	x8
00000000000a5928	ldp	d0, d1, [x29, #-0x70]
00000000000a592c	fcvt	s0, d0
00000000000a5930	fcvt	s1, d1
00000000000a5934	ldr	x8, [x20]
00000000000a5938	ldr	x8, [x8, #0x60]
00000000000a593c	movi.2d	v2, #0000000000000000
00000000000a5940	movi.2d	v3, #0000000000000000
00000000000a5944	mov	x0, x20
00000000000a5948	mov	w1, #0x0
00000000000a594c	blr	x8
00000000000a5950	ldur	d2, [x29, #-0xd8]
00000000000a5954	fmov	d1, #1.00000000
00000000000a5958	fdiv	d0, d1, d2
00000000000a595c	fcvt	s0, d0
00000000000a5960	fdiv	d1, d1, d10
00000000000a5964	fcvt	s1, d1
00000000000a5968	fcvt	s2, d2
00000000000a596c	fcvt	s3, d10
00000000000a5970	ldr	x8, [x20]
00000000000a5974	ldr	x8, [x8, #0x60]
00000000000a5978	mov	x0, x20
00000000000a597c	mov	w1, #0x1
00000000000a5980	blr	x8
00000000000a5984	fcvt	s2, d8
00000000000a5988	fcvt	s0, d9
00000000000a598c	fneg	s1, s2
00000000000a5990	fcvt	d0, s0
00000000000a5994	ldur	d3, [x29, #-0x78]
00000000000a5998	fmul	d0, d3, d0
00000000000a599c	fcvt	s0, d0
00000000000a59a0	fcvt	d1, s1
00000000000a59a4	fmul	d1, d3, d1
00000000000a59a8	fcvt	s1, d1
00000000000a59ac	fcvt	d2, s2
00000000000a59b0	fmul	d2, d3, d2
00000000000a59b4	fcvt	s2, d2
00000000000a59b8	ldr	x8, [x20]
00000000000a59bc	ldr	x8, [x8, #0x60]
00000000000a59c0	mov	x0, x20
00000000000a59c4	mov	w1, #0x2
00000000000a59c8	mov.16b	v3, v0
00000000000a59cc	blr	x8
00000000000a59d0	str	x20, [sp]
00000000000a59d4	ldr	x8, [x20]
00000000000a59d8	ldr	x8, [x8, #0x10]
00000000000a59dc	mov	x0, x20
00000000000a59e0	blr	x8
00000000000a59e4	mov	x2, sp
00000000000a59e8	mov	x0, x19
00000000000a59ec	bl	"_objc_msgSend$setHeliumRef:"
00000000000a59f0	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
    parm3 : AngleSlider
    parm4 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm4 (float)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
```
