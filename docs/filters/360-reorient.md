# 360° Reorient

- **PAE class:** `360° Reorient`
- **Plugin UUID:** `E61FE95E-0108-47DA-8F29-3CB3C47428EF`
- **Node names in corpus:** 360° Reorient (5), DistortionOrient (1)
- **Corpus usage:** 4 files, 6 instances

## What it does

360 Reorient rotates the viewing sphere of an equirectangular 360 image by three Euler angles -- Tilt (pitch, X), Pan (yaw, Y), and Roll (Z) -- resampling the panorama so the horizon/heading changes. All angles are in radians read straight from the .motr. Identity (0,0,0) is an exact passthrough. Implemented in the TS engine.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Tilt (X) | float (radians) | 0 | -1.571 .. 0 | Pitch rotation about the X axis, radians. |
| Pan (Y) | float (radians) | 0 | 0 .. 3.142 | Yaw/heading rotation about the Y axis, radians. |
| Roll (Z) | float (radians) | 0 | 0 .. 3.142 | Roll rotation about the Z axis, radians. |
| Mix | float | 1 | 1 .. 1 | Blend the reoriented result back toward the input, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/reorient360.ts`](../../engine/src/compositor/filters/reorient360.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcEquirectReorient`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEquirectReorient` → [`HgcEquirectReorient.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEquirectReorient.metal)

```metal
//Metal1.0     
//LEN=0000000abb
[[ visible ]] FragmentOut HgcEquirectReorient_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 6.283185482, -3.141592741, 1.000000000);
    const float4 c1 = float4(0.05747731403, -0.1212390736, -0.01348046958, 0.1956359297);
    const float4 c2 = float4(0.9999956489, 1.570796371, -0.3329946101, -0.01872929931);
    const float4 c3 = float4(-0.2121143937, 0.1591549367, 1.570728779, 0.07426100224);
    const float4 c4 = float4(0.3183098733, 0.5000000000, 0.000000000, -2.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.w = c0.w;
    r0.xy = texCoord0.xy;
    r1.x = dot(r0.xyw, hg_Params[5].xyz);
    r1.y = 1.00000f / hg_Params[0].x;
    r1.x = r1.x*r1.y + c0.x;
    r0.x = dot(r0.xyw, hg_Params[6].xyz);
    r0.y = r1.x*c0.y + c0.z;
    r1.y = 1.00000f / hg_Params[1].x;
    r0.x = r0.x*r1.y + c0.x;
    r0.x = r0.x*-c0.z;
    r1.w = sin(r0.x);
    r0.xz = cos(r0.xy);
    r0.z = r1.w*r0.z;
    r0.w = sin(r0.y);
    r1.xyz = r0.zzz*hg_Params[4].xyz;
    r0.w = r0.w*r1.w;
    r0.xyz = r0.xxx*hg_Params[3].xyz;
    r0.xyz = r0.www*hg_Params[2].xyz + r0.xyz;
    r2.xyz = r0.xyz + r1.xyz;
    r0.xz = abs(r2.xz);
    r0.w = fmax(r0.x, r0.z);
    r1.x = 1.00000f / r0.w;
    r0.w = fmin(r0.x, r0.z);
    r0.w = r0.w*r1.x;
    r1.x = r0.w*r0.w;
    r1.z = r1.x*c1.z + c1.x;
    r1.z = r1.z*r1.x + c1.y;
    r1.z = r1.z*r1.x + c1.w;
    r1.z = r1.z*r1.x + c2.z;
    r1.x = r1.z*r1.x + c2.x;
    r0.w = r1.x*r0.w;
    r0.y = float(r0.y < -r1.y);
    r1.x = c2.y - r0.w;
    r0.x = r0.z - r0.x;
    r0.x = select(r0.w, r1.x, r0.x < 0.00000f);
    r0.z = -r0.x - c0.z;
    r0.x = select(r0.x, r0.z, r2.z < 0.00000f);
    r0.z = abs(r2.y);
    r1.x = c0.w - r0.z;
    r0.w = r0.z*c2.w + c3.w;
    r0.w = r0.w*r0.z + c3.x;
    r0.x = select(r0.x, -r0.x, r2.x < 0.00000f);
    r0.x = r0.x*c3.y;
    r1.x = sqrt(r1.x);
    r0.z = r0.w*r0.z + c3.z;
    r0.z = r0.z*r1.x;
    r0.w = r0.y*r0.z;
    r0.w = r0.w*c4.w + r0.z;
    r0.y = r0.y*-c0.z + r0.w;
    r0.z = hg_Params[0].x - c0.w;
    r0.yz = r0.yz*c4.xy;
    r0.y = r0.y - c4.y;
    r0.x = r0.x*hg_Params[0].x;
    r0.x = fmin(r0.z, r0.x);
    r0.z = c4.y*-hg_Params[0].x;
    r0.x = fmax(r0.z, r0.x);
    r2.x = c4.y*-hg_Params[1].x;
    r0.z = hg_Params[1].x*c4.y + -c4.y;
    r0.y = r0.y*hg_Params[1].x;
    r0.y = fmin(r0.z, r0.y);
    r0.w = c0.w;
    r0.y = fmax(r2.x, r0.y);
    r1.y = dot(r0.xyw, hg_Params[8].xyz);
    r1.x = dot(r0.xyw, hg_Params[7].xyz);
    r1.xy = r1.xy + hg_Params[9].xy;
    r1.xy = r1.xy*hg_Params[9].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEEquirectReorient canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEEquirectReorient`

```asm
0000000000033c4c	mov	w3, #0x1
0000000000033c50	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000033c54	ldr	x4, [x22]
0000000000033c58	sub	x2, x29, #0x58
0000000000033c5c	mov	x0, x23
0000000000033c60	mov	w3, #0x2
0000000000033c64	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000033c68	ldr	x4, [x22]
0000000000033c6c	sub	x2, x29, #0x60
0000000000033c70	mov	x0, x23
0000000000033c74	mov	w3, #0x3
0000000000033c78	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000033c7c	sub	x8, x29, #0xe0
0000000000033c80	add	x22, sp, #0x190
0000000000033c84	mov	x23, #0x3ff0000000000000
0000000000033c88	stur	x23, [x29, #-0x68]
0000000000033c8c	stur	x23, [x29, #-0x90]
0000000000033c90	stur	x23, [x29, #-0xb8]
0000000000033c94	stur	x23, [x29, #-0xe0]
0000000000033c98	movi.2d	v0, #0000000000000000
0000000000033c9c	stur	q0, [x8, #0x8]
0000000000033ca0	stur	q0, [x8, #0x18]
0000000000033ca4	stp	q0, q0, [x8, #0x30]
0000000000033ca8	stur	q0, [x8, #0x58]
0000000000033cac	stur	q0, [x8, #0x68]
0000000000033cb0	str	xzr, [sp, #0x218]
0000000000033cb4	str	xzr, [sp, #0x210]
0000000000033cb8	adrp	x8, 566 ; 0x269000
0000000000033cbc	ldr	q0, [x8, #0x7a0]
0000000000033cc0	str	q0, [x22, #0x90]
0000000000033cc4	ldur	d0, [x29, #-0x60]
0000000000033cc8	sub	x0, x29, #0xe0
0000000000033ccc	add	x1, sp, #0x210
0000000000033cd0	mov	w2, #0x0
0000000000033cd4	bl	__ZN14PCMatrix44TmplIdE6rotateERK9PCVector4IdEdb
0000000000033cd8	str	x23, [sp, #0x288]
0000000000033cdc	str	x23, [sp, #0x260]
0000000000033ce0	str	x23, [sp, #0x238]
0000000000033ce4	str	x23, [sp, #0x210]
0000000000033ce8	movi.2d	v0, #0000000000000000
0000000000033cec	stur	q0, [x22, #0x88]
0000000000033cf0	stur	q0, [x22, #0x98]
0000000000033cf4	stp	q0, q0, [x22, #0xb0]
0000000000033cf8	stur	q0, [x22, #0xd8]
0000000000033cfc	stur	q0, [x22, #0xe8]
0000000000033d00	adrp	x8, 565 ; 0x268000
0000000000033d04	ldr	q0, [x8, #0xfc0]
0000000000033d08	str	q0, [x22]
0000000000033d0c	stp	xzr, xzr, [sp, #0x1a0]
0000000000033d10	ldur	d0, [x29, #-0x58]
0000000000033d14	add	x0, sp, #0x210
0000000000033d18	add	x1, sp, #0x190
0000000000033d1c	mov	w2, #0x0
0000000000033d20	bl	__ZN14PCMatrix44TmplIdE6rotateERK9PCVector4IdEdb
0000000000033d24	mov	x8, #0x3ff0000000000000
0000000000033d28	str	x8, [sp, #0x208]
0000000000033d2c	str	x8, [sp, #0x1e0]
0000000000033d30	str	x8, [sp, #0x1b8]
0000000000033d34	str	x8, [sp, #0x190]
0000000000033d38	movi.2d	v0, #0000000000000000
0000000000033d3c	stur	q0, [x22, #0x8]
0000000000033d40	stur	q0, [x22, #0x18]
0000000000033d44	stp	q0, q0, [x22, #0x30]
0000000000033d48	stur	q0, [x22, #0x58]
0000000000033d4c	stur	q0, [x22, #0x68]
0000000000033d50	mov	x8, #-0x4010000000000000
0000000000033d54	stp	x8, xzr, [sp, #0x110]
0000000000033d58	stp	xzr, xzr, [sp, #0x120]
0000000000033d5c	ldur	d0, [x29, #-0x50]
0000000000033d60	add	x0, sp, #0x190
0000000000033d64	add	x1, sp, #0x110
0000000000033d68	mov	w2, #0x0
0000000000033d6c	bl	__ZN14PCMatrix44TmplIdE6rotateERK9PCVector4IdEdb
0000000000033d70	add	x8, sp, #0x90
0000000000033d74	add	x0, sp, #0x210
0000000000033d78	add	x1, sp, #0x190
0000000000033d7c	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
0000000000033d80	add	x8, sp, #0x110
0000000000033d84	add	x0, sp, #0x90
0000000000033d88	sub	x1, x29, #0xe0
0000000000033d8c	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
0000000000033d90	add	x8, sp, #0x90
0000000000033d94	mov	x0, x21
0000000000033d98	mov	x2, x20
0000000000033d9c	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000033da0	add	x8, sp, #0x10
0000000000033da4	mov	x0, x21
0000000000033da8	mov	x2, x19
0000000000033dac	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000033db0	mov	w0, #0x1b0
0000000000033db4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000033db8	mov	x21, x0
0000000000033dbc	bl	0x25148c ; symbol stub for: __ZN18HGEquirectReorientC1Ev
0000000000033dc0	ldur	x2, [x29, #-0x48]
0000000000033dc4	ldr	x8, [x21]
0000000000033dc8	ldr	x8, [x8, #0x78]
0000000000033dcc	mov	x0, x21
0000000000033dd0	mov	w1, #0x0
0000000000033dd4	blr	x8
0000000000033dd8	ldr	x8, [x21]
0000000000033ddc	ldr	x8, [x8, #0x88]
0000000000033de0	mov	x0, x21
0000000000033de4	mov	w1, #0x0
0000000000033de8	mov	w2, #0x4
0000000000033dec	blr	x8
0000000000033df0	mov	x0, x20
0000000000033df4	bl	_objc_msgSend$width
0000000000033df8	ucvtf	d0, x0
0000000000033dfc	ldr	d1, [sp, #0x90]
0000000000033e00	fdiv	d0, d0, d1
0000000000033e04	fcvt	s0, d0
0000000000033e08	mov	x0, x21
0000000000033e0c	bl	0x251480 ; symbol stub for: __ZN18HGEquirectReorient7SetTexWEf
0000000000033e10	mov	x0, x20
0000000000033e14	bl	_objc_msgSend$height
0000000000033e18	ucvtf	d0, x0
0000000000033e1c	ldr	d1, [sp, #0xb8]
0000000000033e20	fdiv	d0, d0, d1
0000000000033e24	fcvt	s0, d0
0000000000033e28	mov	x0, x21
0000000000033e2c	bl	0x251474 ; symbol stub for: __ZN18HGEquirectReorient7SetTexHEf
0000000000033e30	ldr	d0, [sp, #0x110]
0000000000033e34	ldr	d1, [sp, #0x130]
0000000000033e38	fcvt	s0, d0
0000000000033e3c	fcvt	s1, d1
0000000000033e40	ldr	d2, [sp, #0x150]
0000000000033e44	fcvt	s2, d2
0000000000033e48	mov	x0, x21
0000000000033e4c	bl	0x251450 ; symbol stub for: __ZN18HGEquirectReorient7SetCol0Efff
0000000000033e50	ldr	d0, [sp, #0x118]
0000000000033e54	ldr	d1, [sp, #0x138]
0000000000033e58	fcvt	s0, d0
0000000000033e5c	fcvt	s1, d1
0000000000033e60	ldr	d2, [sp, #0x158]
0000000000033e64	fcvt	s2, d2
0000000000033e68	mov	x0, x21
0000000000033e6c	bl	0x25145c ; symbol stub for: __ZN18HGEquirectReorient7SetCol1Efff
0000000000033e70	ldr	d0, [sp, #0x120]
0000000000033e74	ldr	d1, [sp, #0x140]
0000000000033e78	fcvt	s0, d0
0000000000033e7c	fcvt	s1, d1
0000000000033e80	ldr	d2, [sp, #0x160]
0000000000033e84	fcvt	s2, d2
0000000000033e88	mov	x0, x21
0000000000033e8c	bl	0x251468 ; symbol stub for: __ZN18HGEquirectReorient7SetCol2Efff
0000000000033e90	ldp	d0, d1, [sp, #0x90]
0000000000033e94	fcvt	s0, d0
0000000000033e98	fcvt	s1, d1
0000000000033e9c	ldp	d2, d3, [sp, #0xa0]
0000000000033ea0	fcvt	s2, d2
0000000000033ea4	fcvt	s3, d3
0000000000033ea8	mov	x0, x21
0000000000033eac	bl	0x251420 ; symbol stub for: __ZN18HGEquirectReorient11SetInputPTXEffff
0000000000033eb0	ldp	d0, d1, [sp, #0xb0]
0000000000033eb4	fcvt	s0, d0
0000000000033eb8	fcvt	s1, d1
0000000000033ebc	ldp	d2, d3, [sp, #0xc0]
0000000000033ec0	fcvt	s2, d2
0000000000033ec4	fcvt	s3, d3
0000000000033ec8	mov	x0, x21
0000000000033ecc	bl	0x25142c ; symbol stub for: __ZN18HGEquirectReorient11SetInputPTYEffff
0000000000033ed0	ldp	d0, d1, [sp, #0x10]
0000000000033ed4	fcvt	s0, d0
0000000000033ed8	fcvt	s1, d1
0000000000033edc	ldp	d2, d3, [sp, #0x20]
0000000000033ee0	fcvt	s2, d2
0000000000033ee4	fcvt	s3, d3
0000000000033ee8	mov	x0, x21
0000000000033eec	bl	0x251438 ; symbol stub for: __ZN18HGEquirectReorient19SetInverseOutputPTXEffff
0000000000033ef0	ldp	d0, d1, [sp, #0x30]
0000000000033ef4	fcvt	s0, d0
0000000000033ef8	fcvt	s1, d1
0000000000033efc	ldp	d2, d3, [sp, #0x40]
0000000000033f00	fcvt	s2, d2
0000000000033f04	fcvt	s3, d3
0000000000033f08	mov	x0, x21
0000000000033f0c	bl	0x251444 ; symbol stub for: __ZN18HGEquirectReorient19SetInverseOutputPTYEffff
0000000000033f10	str	x21, [sp, #0x8]
0000000000033f14	ldr	x8, [x21]
0000000000033f18	ldr	x8, [x8, #0x10]
0000000000033f1c	mov	x0, x21
0000000000033f20	blr	x8
0000000000033f24	add	x2, sp, #0x8
0000000000033f28	mov	x0, x19
0000000000033f2c	bl	"_objc_msgSend$setHeliumRef:"
0000000000033f30	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : AngleSlider
    parm2 : AngleSlider
    parm3 : AngleSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)

```
