# Refraction

- **PAE class:** `Refraction`
- **Plugin UUID:** `F6CC79AD-7C35-4AB0-BF10-527994BCD143`
- **Node names in corpus:** Refraction (18), Refraction copy (1), Distortion (1)
- **Corpus usage:** 19 files, 20 instances

## What it does

Refraction distorts the image as if seen through a bumpy refractive surface, displacing each pixel by the gradient of a height map (by default derived from the image itself). Refraction sets the displacement strength and Softness blurs the height map for smoother, glassier bending.

> **Note.** Not implemented; description is the standard Apple Motion "Refraction" filter. The Height Map / Map Channel params are internal image-input wiring.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Softness | float | 0.25 | 0 .. 1 | Blur applied to the height field before refracting, 0-1 (default 0.25). Continuous float. |
| Refraction | float | 100 | 0 .. 200 | Displacement strength; how strongly pixels bend, ~0-200 (default 100). *(keyframed in 2 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |
| Height Map | float | 0 | 0 .. 3331531719 | *(unverified)* |
| Map Channel | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcRefraction`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRefraction` → [`HgcRefraction.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRefraction.metal)

```metal
//Metal1.0     
//LEN=00000004b0
[[ visible ]] FragmentOut HgcRefraction_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.zw = texCoord1.zw;
    r0.x = dot(texCoord1, hg_Params[2]);
    r0.y = dot(texCoord1, hg_Params[3]);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r2 = r2 - r1;
    r2.y = dot(hg_Params[4], r2);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r1 = r1 - r3;
    r2.x = dot(hg_Params[4], r1);
    r2.zw = c0.zz;
    r2 = r2*hg_Params[9] + r0;
    r3.y = dot(r2, hg_Params[1]);
    r3.x = dot(r2, hg_Params[0]);
    r3.xy = r3.xy + hg_Params[26].xy;
    r3.xy = r3.xy*hg_Params[26].zw;
    output.color0 = hg_Texture1.sample(hg_Sampler1, r3.xy);
    return output;
}
```

### Metal fragment shader — `HgcRefractionHeightMap`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRefractionHeightMap` → [`HgcRefractionHeightMap.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRefractionHeightMap.metal)

```metal
//Metal1.0     
//LEN=0000000644
[[ visible ]] FragmentOut HgcRefractionHeightMap_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6,
    float4 texCoord7)
{
    const float4 c0 = float4(0.1250000000, 256.0000000, 0.000000000, -0.003906250000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r6 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r7 = hg_Texture0.sample(hg_Sampler0, texCoord7.xy);
    r0.x = dot(r0, hg_Params[0]);
    r1.x = dot(r1, hg_Params[0]);
    r2.x = dot(r2, hg_Params[0]);
    r3.x = dot(r3, hg_Params[0]);
    r4.x = dot(r4, hg_Params[0]);
    r5.x = dot(r5, hg_Params[0]);
    r6.x = dot(r6, hg_Params[0]);
    r7.x = dot(r7, hg_Params[0]);
    r8.zw = c0.zz;
    r1.x = r1.x + r0.x;
    r2.x = r2.x + r1.x;
    r3.x = r3.x + r2.x;
    r4.x = r4.x + r3.x;
    r5.x = r5.x + r4.x;
    r6.x = r6.x + r5.x;
    r7.x = r7.x + r6.x;
    r8.x = c0.x*r7.x;
    r8.y = r8.x*c0.y;
    r8.y = fract(r8.y);
    r8.x = clamp(r8.y*c0.w + r8.x, 0.00000f, 1.00000f);
    output.color0 = r8;
    return output;
}
```

### CPU parameter wiring — `-[PAERefraction canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERefraction`

```asm
00000000000f7ed0	mov	w3, #0x2
00000000000f7ed4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f7ed8	ldur	d8, [x29, #-0x68]
00000000000f7edc	fcmp	d8, #0.0
00000000000f7ee0	b.ne	0xf7ef8
00000000000f7ee4	cbz	x20, 0xf7fd8
00000000000f7ee8	add	x8, sp, #0x8
00000000000f7eec	mov	x0, x20
00000000000f7ef0	bl	_objc_msgSend$heliumRef
00000000000f7ef4	b	0xf7fdc
00000000000f7ef8	ldr	x4, [x22]
00000000000f7efc	sub	x2, x29, #0x70
00000000000f7f00	mov	x0, x23
00000000000f7f04	mov	w3, #0x1
00000000000f7f08	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f7f0c	ldr	x4, [x22]
00000000000f7f10	sub	x2, x29, #0x74
00000000000f7f14	mov	x0, x23
00000000000f7f18	mov	w3, #0x4
00000000000f7f1c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000f7f20	ldur	w8, [x29, #-0x74]
00000000000f7f24	movi.2d	v9, #0000000000000000
00000000000f7f28	movi.2d	v10, #0000000000000000
00000000000f7f2c	movi.2d	v11, #0000000000000000
00000000000f7f30	movi.2d	v12, #0000000000000000
00000000000f7f34	cmp	w8, #0x4
00000000000f7f38	b.hi	0xf7f6c
00000000000f7f3c	adrp	x9, 372 ; 0x26b000
00000000000f7f40	add	x9, x9, #0x200
00000000000f7f44	ldr	d9, [x9, x8, lsl #3]
00000000000f7f48	adrp	x9, 372 ; 0x26b000
00000000000f7f4c	add	x9, x9, #0x228
00000000000f7f50	ldr	d10, [x9, x8, lsl #3]
00000000000f7f54	adrp	x9, 372 ; 0x26b000
00000000000f7f58	add	x9, x9, #0x250
00000000000f7f5c	ldr	d11, [x9, x8, lsl #3]
00000000000f7f60	adrp	x9, 372 ; 0x26b000
00000000000f7f64	add	x9, x9, #0x278
00000000000f7f68	ldr	d12, [x9, x8, lsl #3]
00000000000f7f6c	mov	x0, x20
00000000000f7f70	bl	_objc_msgSend$imageType
00000000000f7f74	mov	x23, x0
00000000000f7f78	ldr	x2, [x22]
00000000000f7f7c	mov	x0, x21
00000000000f7f80	bl	"_objc_msgSend$getRenderMode:"
00000000000f7f84	mov	x8, x0
00000000000f7f88	mov	w0, #0x0
00000000000f7f8c	cbz	w8, 0xf8000
00000000000f7f90	cmp	x23, #0x3
00000000000f7f94	b.ne	0xf8000
00000000000f7f98	ldp	d0, d1, [x29, #-0x70]
00000000000f7f9c	ldp	q2, q3, [x22]
00000000000f7fa0	stp	q2, q3, [sp, #0x40]
00000000000f7fa4	ldr	q2, [x22, #0x20]
00000000000f7fa8	str	q2, [sp, #0x60]
00000000000f7fac	stp	d0, d1, [sp, #0x8]
00000000000f7fb0	stp	d8, d12, [sp, #0x18]
00000000000f7fb4	stp	d11, d10, [sp, #0x28]
00000000000f7fb8	str	d9, [sp, #0x38]
00000000000f7fbc	add	x4, sp, #0x40
00000000000f7fc0	add	x5, sp, #0x8
00000000000f7fc4	mov	x0, x21
00000000000f7fc8	mov	x2, x19
00000000000f7fcc	mov	x3, x20
00000000000f7fd0	bl	"_objc_msgSend$canThrowRenderHeliumOutput:withHeliumInput:withInfo:withRefractionInfo:"
00000000000f7fd4	b	0xf8000
00000000000f7fd8	str	xzr, [sp, #0x8]
00000000000f7fdc	add	x2, sp, #0x8
00000000000f7fe0	mov	x0, x19
00000000000f7fe4	bl	"_objc_msgSend$setHeliumRef:"
00000000000f7fe8	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm4 (int)

```
