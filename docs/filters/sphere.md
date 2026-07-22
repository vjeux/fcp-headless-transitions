# Sphere

- **PAE class:** `Sphere`
- **Plugin UUID:** `1E78D3E3-63AC-46E3-99F4-014129B9ECCC`
- **Node names in corpus:** Sphere (16), On Screen Control (1), On Screen Controls (1)
- **Corpus usage:** 16 files, 18 instances

## What it does

Sphere wraps the image onto a 3D sphere, mapping the flat frame around a ball centered at Center with the given Radius, so the picture bulges into a globe with the edges receding around the back.

> **Note.** Not implemented; description is the standard Apple Motion "Sphere" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 400 | 15 .. 915 | Radius of the sphere the image is wrapped onto, ~15-915 (default 400). |
| Center | point2D | - | - | Center of the sphere (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSphere`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSphere` → [`HgcSphere.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSphere.metal)

```metal
//Metal1.0     
//LEN=00000004f7
[[ visible ]] FragmentOut HgcSphere_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[1].xy + hg_Params[1].zw;
    r1.xy = float2(dot(r0.xy, r0.xy));
    r2.xy = rsqrt(r1.xx);
    r2.xy = select(r2.xy, c0.xx, r1.xy < 0.00000f);
    r2.xy = select(c0.xx, r2.xy, -r1.xy < 0.00000f);
    r0.xy = r0.xy*r2.xy;
    r2.xy = r1.xy*r2.xy;
    r2.xy = r2.xy*-hg_Params[0].xx + c0.yy;
    r1.x = rsqrt(r2.x);
    r1.x = select(r1.x, c0.x, r2.x < 0.00000f);
    r1.x = select(c0.x, r1.x, -r2.x < 0.00000f);
    r1.xy = r2.xy*-r1.xx + c0.yy;
    r1.xy = r1.xy*hg_Params[0].yy;
    r1.xy = r0.xy*r1.xy;
    r1.xy = r1.xy*hg_Params[2].xy + hg_Params[2].zw;
    r1.xy = r1.xy + hg_Params[3].xy;
    r1.xy = r1.xy*hg_Params[3].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    r0.xy = r0.xy*hg_Params[1].xy;
    r0.xy = abs(r0.xy);
    r2.x = r2.x*hg_Params[0].y;
    r0.x = dot(r0.xy, 1.00000f);
    r2.x = clamp(r2.x/r0.x, 0.00000f, 1.00000f);
    output.color0 = r1*r2.xxxx;
    return output;
}
```

### CPU parameter wiring — `-[PAESphere canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESphere`

```asm
00000000000cb114	mov	w4, #0x1
00000000000cb118	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000cb11c	add	x8, sp, #0x20
00000000000cb120	add	x2, sp, #0x30
00000000000cb124	mov	x0, x22
00000000000cb128	mov	x3, x21
00000000000cb12c	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000cb130	ldr	q0, [sp, #0x20]
00000000000cb134	str	q0, [sp, #0x30]
00000000000cb138	ldp	d0, d1, [sp, #0x30]
00000000000cb13c	add	x0, sp, #0xc0
00000000000cb140	movi.2d	v2, #0000000000000000
00000000000cb144	bl	__ZN14PCMatrix44TmplIdE14rightTranslateEddd
00000000000cb148	ldp	d0, d1, [sp, #0x30]
00000000000cb14c	fneg	d0, d0
00000000000cb150	fneg	d1, d1
00000000000cb154	add	x0, sp, #0x40
00000000000cb158	movi.2d	v2, #0000000000000000
00000000000cb15c	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000000cb160	mov	x8, #0x4079000000000000
00000000000cb164	str	x8, [sp, #0x20]
00000000000cb168	ldr	x4, [x23]
00000000000cb16c	add	x2, sp, #0x20
00000000000cb170	mov	x0, x19
00000000000cb174	mov	w3, #0x2
00000000000cb178	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000cb17c	ldr	d0, [sp, #0x20]
00000000000cb180	fcmp	d0, #0.0
00000000000cb184	b.ne	0xcb1c0
00000000000cb188	mov	w0, #0x1a0
00000000000cb18c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cb190	mov	x21, x0
00000000000cb194	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
00000000000cb198	str	x21, [sp, #0x18]
00000000000cb19c	add	x2, sp, #0x18
00000000000cb1a0	mov	x0, x20
00000000000cb1a4	bl	"_objc_msgSend$setHeliumRef:"
00000000000cb1a8	ldr	x0, [sp, #0x18]
00000000000cb1ac	cbz	x0, 0xcb2c0
00000000000cb1b0	ldr	x8, [x0]
00000000000cb1b4	ldr	x8, [x8, #0x18]
00000000000cb1b8	blr	x8
00000000000cb1bc	b	0xcb2c0
00000000000cb1c0	cbz	x21, 0xcb1d4
00000000000cb1c4	add	x8, sp, #0x18
00000000000cb1c8	mov	x0, x21
00000000000cb1cc	bl	_objc_msgSend$heliumRef
00000000000cb1d0	b	0xcb1d8
00000000000cb1d4	str	xzr, [sp, #0x18]
00000000000cb1d8	mov	w0, #0x2b0
00000000000cb1dc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cb1e0	mov	x24, x0
00000000000cb1e4	bl	__ZN7HSphereC2Ev
00000000000cb1e8	ldr	x2, [sp, #0x18]
00000000000cb1ec	ldr	x8, [x24]
00000000000cb1f0	ldr	x8, [x8, #0x78]
00000000000cb1f4	mov	x0, x24
00000000000cb1f8	mov	w1, #0x0
00000000000cb1fc	blr	x8
00000000000cb200	ldr	d0, [sp, #0x20]
00000000000cb204	fcvt	s0, d0
00000000000cb208	mov	x0, x24
00000000000cb20c	bl	__ZN7HSphere9SetRadiusEf
00000000000cb210	add	x1, sp, #0x40
00000000000cb214	mov	x0, x24
00000000000cb218	bl	__ZN7HSphere16SetOutputToImageERK14PCMatrix44TmplIdE
00000000000cb21c	add	x1, sp, #0xc0
00000000000cb220	mov	x0, x24
00000000000cb224	bl	__ZN7HSphere15SetImageToInputERK14PCMatrix44TmplIdE
00000000000cb228	mov	w8, #0x1
00000000000cb22c	strb	w8, [sp, #0x17]
00000000000cb230	tbnz	w25, #0x0, 0xcb248
00000000000cb234	ldr	x4, [x23]
00000000000cb238	add	x2, sp, #0x17
00000000000cb23c	mov	x0, x19
00000000000cb240	mov	w3, #0x3
00000000000cb244	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000cb248	str	x24, [sp, #0x8]
00000000000cb24c	ldr	x8, [x24]
00000000000cb250	ldr	x8, [x8, #0x10]
00000000000cb254	mov	x0, x24
00000000000cb258	blr	x8
00000000000cb25c	ldrb	w8, [sp, #0x17]
00000000000cb260	cmp	w8, #0x1
00000000000cb264	b.ne	0xcb27c
00000000000cb268	add	x2, sp, #0x8
00000000000cb26c	mov	x0, x22
00000000000cb270	mov	x3, x21
00000000000cb274	mov	x4, x20
00000000000cb278	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000cb27c	add	x2, sp, #0x8
00000000000cb280	mov	x0, x20
00000000000cb284	bl	"_objc_msgSend$setHeliumRef:"
00000000000cb288	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (bool)

```
