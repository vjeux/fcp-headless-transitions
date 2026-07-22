# Droplet

- **PAE class:** `Droplet`
- **Plugin UUID:** `0ACFAE37-4FAF-4D60-A50C-46E422EE0CD7`
- **Node names in corpus:** Droplet (8), Droplet 2 (4), Droplet 1 (4), Droplet 4 (3), Droplet 3 (3), Droplet 5 (1)
- **Corpus usage:** 8 files, 35 instances

## What it does

Droplet simulates a water droplet/ripple lens on the image: a circular ring at Center refracts the picture like a bead of water, with Radius/Thickness shaping the droplet's lens ring and Height its bulge. Radius is typically animated to make the droplet expand.

> **Note.** Not implemented; description is the standard Apple Motion "Droplet" filter. Radius is animated per-instance (kept internal here).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Thickness | float (pixels) | 40 | 30 .. 100 | Thickness of the droplet's refractive ring, ~30-100 (default 40). *(keyframed in 17 instances)* |
| Height | float | 30 | -50 .. 50 | Bulge height of the droplet lens, ~-50..50 (default 30). *(keyframed in 18 instances)* |
| Center | point2D | - | - | Center of the droplet (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0.9 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 9 instances)* |
| Radius | unknown | - | - | *(unverified)* *(keyframed in 35 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcDroplet`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcDroplet` → [`HgcDroplet.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcDroplet.metal)

```metal
//Metal1.0     
//LEN=0000000588
[[ visible ]] FragmentOut HgcDroplet_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(9.999999975e-07, 1.000000000, -2.000000000, 0.000000000);
    const float4 c1 = float4(0.000000000, 1.000000000, 2.000000000, 3.000000000);
    const float4 c2 = float4(0.000000000, 1.000000000, -1.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[0].xy + hg_Params[0].zw;
    r1 = float4(dot(r0.xy, r0.xy));
    r2.x = fmax(r1.x, c0.x);
    r2 = rsqrt(r2.xxxx);
    r1 = r1*r2;
    r2.xy = r0.xy*r2.xy;
    r1 = r1*hg_Params[2].xxxx + hg_Params[2].yyyy;
    r1 = r1 - c1;
    r3.xyz = clamp(r1.xyz, 0.00000f, 1.00000f);
    r4.xyz = -r3.xyz*c1.zzz + c1.www;
    r3.xyz = r3.xyz*r3.xyz;
    r4.xyz = r3.xyz*r4.xyz;
    r4.xyz = r4.xyz*c0.yzy + c2.xyz;
    r3.x = select(r4.x, c2.x, r1.x < 0.00000f);
    r3.x = select(r4.y, r3.x, r1.y < 0.00000f);
    r3.x = select(r4.z, r3.x, r1.z < 0.00000f);
    r1.x = select(c2.x, r3.x, r1.w < 0.00000f);
    r1.xy = r1.xx*r2.xy;
    r1.xy = r1.xy*hg_Params[2].zz + r0.xy;
    r1.xy = r1.xy*hg_Params[1].xy + hg_Params[1].zw;
    r1.xy = r1.xy + hg_Params[3].xy;
    r1.xy = r1.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEDroplet canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEDroplet`

```asm
00000000000a1fd4	mov	w4, #0x1
00000000000a1fd8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000a1fdc	add	x8, sp, #0xb0
00000000000a1fe0	add	x2, sp, #0x130
00000000000a1fe4	mov	x0, x22
00000000000a1fe8	mov	x3, x21
00000000000a1fec	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000a1ff0	ldr	q2, [sp, #0xb0]
00000000000a1ff4	ldp	q0, q1, [x29, #-0x80]
00000000000a1ff8	stp	q0, q1, [sp, #0xf0]
00000000000a1ffc	ldp	q0, q1, [x29, #-0x60]
00000000000a2000	str	q0, [sp, #0x110]
00000000000a2004	stp	q1, q2, [sp, #0x120]
00000000000a2008	ldp	q0, q1, [x29, #-0xc0]
00000000000a200c	stp	q0, q1, [sp, #0xb0]
00000000000a2010	ldp	q0, q1, [x29, #-0xa0]
00000000000a2014	stp	q0, q1, [sp, #0xd0]
00000000000a2018	ldp	q0, q1, [sp, #0x180]
00000000000a201c	stp	q0, q1, [sp, #0x70]
00000000000a2020	ldp	q0, q1, [sp, #0x1a0]
00000000000a2024	stp	q0, q1, [sp, #0x90]
00000000000a2028	ldp	q0, q1, [sp, #0x140]
00000000000a202c	stp	q0, q1, [sp, #0x30]
00000000000a2030	ldp	q0, q1, [sp, #0x160]
00000000000a2034	stp	q0, q1, [sp, #0x50]
00000000000a2038	ldp	d0, d1, [sp, #0x130]
00000000000a203c	add	x0, sp, #0xb0
00000000000a2040	movi.2d	v2, #0000000000000000
00000000000a2044	bl	__ZN14PCMatrix44TmplIdE14rightTranslateEddd
00000000000a2048	ldp	d0, d1, [sp, #0x130]
00000000000a204c	fneg	d0, d0
00000000000a2050	fneg	d1, d1
00000000000a2054	add	x0, sp, #0x30
00000000000a2058	movi.2d	v2, #0000000000000000
00000000000a205c	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000000a2060	mov	x8, #0xc00000000000
00000000000a2064	movk	x8, #0x4072, lsl #48
00000000000a2068	str	x8, [sp, #0x28]
00000000000a206c	ldr	x4, [x23]
00000000000a2070	add	x2, sp, #0x28
00000000000a2074	mov	x0, x19
00000000000a2078	mov	w3, #0x2
00000000000a207c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a2080	mov	x8, #0x4044000000000000
00000000000a2084	str	x8, [sp, #0x20]
00000000000a2088	ldr	x4, [x23]
00000000000a208c	add	x2, sp, #0x20
00000000000a2090	mov	x0, x19
00000000000a2094	mov	w3, #0x4
00000000000a2098	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a209c	mov	x8, #0x403e000000000000
00000000000a20a0	str	x8, [sp, #0x18]
00000000000a20a4	ldr	x4, [x23]
00000000000a20a8	add	x2, sp, #0x18
00000000000a20ac	mov	x0, x19
00000000000a20b0	mov	w3, #0x3
00000000000a20b4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a20b8	ldr	x2, [x23]
00000000000a20bc	mov	x0, x22
00000000000a20c0	bl	"_objc_msgSend$getRenderMode:"
00000000000a20c4	cbz	w0, 0xa21f4
00000000000a20c8	mov	x0, x21
00000000000a20cc	bl	_objc_msgSend$imageType
00000000000a20d0	cmp	x0, #0x3
00000000000a20d4	b.ne	0xa21f4
00000000000a20d8	cbz	x21, 0xa20ec
00000000000a20dc	add	x8, sp, #0x10
00000000000a20e0	mov	x0, x21
00000000000a20e4	bl	_objc_msgSend$heliumRef
00000000000a20e8	b	0xa20f0
00000000000a20ec	str	xzr, [sp, #0x10]
00000000000a20f0	mov	w8, #0x1
00000000000a20f4	strb	w8, [sp, #0xf]
00000000000a20f8	tbnz	w24, #0x0, 0xa2110
00000000000a20fc	ldr	x4, [x23]
00000000000a2100	add	x2, sp, #0xf
00000000000a2104	mov	x0, x19
00000000000a2108	mov	w3, #0x5
00000000000a210c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000a2110	ldr	d0, [sp, #0x20]
00000000000a2114	fcmp	d0, #0.0
00000000000a2118	b.ls	0xa21d4
00000000000a211c	mov	w0, #0x2c0
00000000000a2120	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a2124	mov	x23, x0
00000000000a2128	bl	__ZN8HDropletC2Ev
00000000000a212c	ldr	x2, [sp, #0x10]
00000000000a2130	ldr	x8, [x23]
00000000000a2134	ldr	x8, [x8, #0x78]
00000000000a2138	mov	x0, x23
00000000000a213c	mov	w1, #0x0
00000000000a2140	blr	x8
00000000000a2144	add	x1, sp, #0x30
00000000000a2148	mov	x0, x23
00000000000a214c	bl	__ZN8HDroplet16SetOutputToImageERK14PCMatrix44TmplIdE
00000000000a2150	add	x1, sp, #0xb0
00000000000a2154	mov	x0, x23
00000000000a2158	bl	__ZN8HDroplet15SetImageToInputERK14PCMatrix44TmplIdE
00000000000a215c	ldp	d1, d0, [sp, #0x20]
00000000000a2160	ldr	d2, [sp, #0x18]
00000000000a2164	mov	x0, x23
00000000000a2168	bl	__ZN8HDroplet24SetBiasThicknessAndScaleEddd
00000000000a216c	str	x23, [sp]
00000000000a2170	ldr	x8, [x23]
00000000000a2174	ldr	x8, [x8, #0x10]
00000000000a2178	mov	x0, x23
00000000000a217c	blr	x8
00000000000a2180	ldrb	w8, [sp, #0xf]
00000000000a2184	cmp	w8, #0x1
00000000000a2188	b.ne	0xa21a0
00000000000a218c	mov	x2, sp
00000000000a2190	mov	x0, x22
00000000000a2194	mov	x3, x21
00000000000a2198	mov	x4, x20
00000000000a219c	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000a21a0	mov	x2, sp
00000000000a21a4	mov	x0, x20
00000000000a21a8	bl	"_objc_msgSend$setHeliumRef:"
00000000000a21ac	ldr	x0, [sp]
00000000000a21b0	cbz	x0, 0xa21c0
00000000000a21b4	ldr	x8, [x0]
00000000000a21b8	ldr	x8, [x8, #0x18]
00000000000a21bc	blr	x8
00000000000a21c0	ldr	x8, [x23]
00000000000a21c4	ldr	x8, [x8, #0x18]
00000000000a21c8	mov	x0, x23
00000000000a21cc	blr	x8
00000000000a21d0	b	0xa21e0
00000000000a21d4	add	x2, sp, #0x10
00000000000a21d8	mov	x0, x20
00000000000a21dc	bl	"_objc_msgSend$setHeliumRef:"
00000000000a21e0	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm4 (float)
    - parm3 (float)
    - parm5 (bool)

```
