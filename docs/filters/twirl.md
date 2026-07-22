# Twirl

- **PAE class:** `Twirl`
- **Plugin UUID:** `42D649CE-8CAA-4BCC-8F59-50E1009B03CE`
- **Node names in corpus:** Twirl (491), OSC (52), Control (40), PRS (34), Rotate (28), Twirl copy (6)
- **Corpus usage:** 492 files, 693 instances

## What it does

Twirl applies a swirling rotational distortion around a center point: pixels near the center are rotated most and the rotation falls off with radius, spiraling the image like water down a drain. The `Twirl` angle sets how many radians of spin at the core and `Amount` scales the effect radius/strength. Used for vortex, dizzy, and dissolve-into-a-whirl transition effects.

> **Note.** Not implemented in the TS engine; description is the standard Apple Motion "Twirl" filter. The exact radial falloff curve is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Twirl | float (radians) | pi (3.1416) | -6.083 .. 9.069 | Swirl angle at the center in radians (default pi ~= 3.1416, a half-turn). Negative values swirl the opposite direction; the twist decreases toward the edges. *(keyframed in 7 instances)* |
| Amount | float | 0.5 | 0 .. 1 | Scales the strength / falloff radius of the swirl, 0-1. 0 = no distortion. (Corpus mis-sampled the type; this is a continuous float.) *(keyframed in 3 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the twirled result over the original, 0-1 continuous. NOT a boolean despite only 0/1 being sampled. |
| Center | point2D | - | - | Center of the swirl (X,Y) in Motion's normalized frame coordinates, (0.5,0.5) = frame center. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTwirl`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTwirl` → [`HgcTwirl.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTwirl.metal)

```metal
//Metal1.0     
//LEN=00000004dd
[[ visible ]] FragmentOut HgcTwirl_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-3.000000000, 1.000000000, 2.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r0.xyz = r0.xyz*hg_Params[2].xyx;
    r1.x = dot(r0.xyz, r0.xyz);
    r1.x = rsqrt(r1.x);
    r1.x = r1.x*hg_Params[1].x;
    r1.x = clamp(1.00000f / r1.x, 0.00000f, 1.00000f);
    r2.x = r1.x*r1.x;
    r1.x = r2.x*r1.x;
    r2.x = r2.x*c0.x + c0.y;
    r2.x = r1.x*c0.z + r2.x;
    r2.x = r2.x*hg_Params[1].y;
    r1.x = cos(r2.x);
    r1.y = sin(r2.x);
    r2.xy = float2(-r1.y, r1.x);
    r1.x = dot(r0.xy, r1.xy);
    r1.y = dot(r0.xy, r2.xy);
    r1.xy = r1.xy*hg_Params[2].zw + hg_Params[0].xy;
    r0.xy = r1.xy + hg_Params[4].xy;
    r0.xy = r0.xy*hg_Params[4].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r1.xy = r1.xy - hg_Params[3].zw;
    r2 = fmin(r1.yyyy, r1.xxxx);
    r1.xy = hg_Params[3].xy - r1.xy;
    r2 = fmin(r1.xxxx, r2);
    r1 = fmin(r1.yyyy, r2);
    output.color0 = select(r0, c0.wwww, r1 < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAETwirl canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAETwirl`

```asm
0000000000065908	mov	x4, x25
000000000006590c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000065910	ldur	d0, [x29, #-0x58]
0000000000065914	fcmp	d0, #0.0
0000000000065918	b.ne	0x65930
000000000006591c	cbz	x20, 0x65a0c
0000000000065920	add	x8, sp, #0x30
0000000000065924	mov	x0, x20
0000000000065928	bl	_objc_msgSend$heliumRef
000000000006592c	b	0x65a10
0000000000065930	mov	x0, x23
0000000000065934	bl	_objc_msgSend$versionAtCreation
0000000000065938	mov	x26, x0
000000000006593c	cmp	w0, #0x1
0000000000065940	ccmp	w0, #0x2, #0x2, ne
0000000000065944	cset	w27, hi
0000000000065948	cmp	w27, #0x0
000000000006594c	csel	x0, x20, x19, ne
0000000000065950	bl	_objc_msgSend$width
0000000000065954	mov	x23, x0
0000000000065958	sub	x2, x29, #0x60
000000000006595c	mov	x0, x24
0000000000065960	mov	w3, #0x2
0000000000065964	mov	x4, x25
0000000000065968	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006596c	add	x8, sp, #0x30
0000000000065970	mov	x0, x21
0000000000065974	mov	x2, x19
0000000000065978	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000006597c	add	x8, sp, #0x20
0000000000065980	fmov.2d	v0, #0.50000000
0000000000065984	str	q0, [sp, #0x20]
0000000000065988	add	x2, sp, #0x20
000000000006598c	orr	x3, x8, #0x8
0000000000065990	mov	x0, x24
0000000000065994	mov	w4, #0x3
0000000000065998	mov	x5, x25
000000000006599c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000659a0	cmp	w26, #0x1
00000000000659a4	csel	x3, x19, x20, eq
00000000000659a8	add	x8, sp, #0x10
00000000000659ac	add	x2, sp, #0x20
00000000000659b0	mov	x0, x21
00000000000659b4	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000000659b8	ldr	q0, [sp, #0x10]
00000000000659bc	str	q0, [sp, #0x20]
00000000000659c0	ldr	x4, [x22]
00000000000659c4	add	x2, sp, #0xf
00000000000659c8	mov	x0, x24
00000000000659cc	mov	w3, #0x4
00000000000659d0	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000659d4	cmp	w27, #0x0
00000000000659d8	csel	x0, x19, x20, ne
00000000000659dc	bl	_objc_msgSend$imageType
00000000000659e0	cmp	w0, #0x3
00000000000659e4	b.ne	0x658ec
00000000000659e8	ldr	x2, [x22]
00000000000659ec	mov	x0, x21
00000000000659f0	bl	"_objc_msgSend$getRenderMode:"
00000000000659f4	cbz	w0, 0x65a34
00000000000659f8	cbz	x20, 0x65a54
00000000000659fc	add	x8, sp, #0x10
0000000000065a00	mov	x0, x20
0000000000065a04	bl	_objc_msgSend$heliumRef
0000000000065a08	b	0x65a58
0000000000065a0c	str	xzr, [sp, #0x30]
0000000000065a10	add	x2, sp, #0x30
0000000000065a14	mov	x0, x19
0000000000065a18	bl	"_objc_msgSend$setHeliumRef:"
0000000000065a1c	ldr	x0, [sp, #0x30]
0000000000065a20	cbz	x0, 0x65a30
0000000000065a24	ldr	x8, [x0]
0000000000065a28	ldr	x8, [x8, #0x18]
0000000000065a2c	blr	x8
0000000000065a30	mov	w0, #0x1
0000000000065a34	ldp	x29, x30, [sp, #0x110]
0000000000065a38	ldp	x20, x19, [sp, #0x100]
0000000000065a3c	ldp	x22, x21, [sp, #0xf0]
0000000000065a40	ldp	x24, x23, [sp, #0xe0]
0000000000065a44	ldp	x26, x25, [sp, #0xd0]
0000000000065a48	ldp	x28, x27, [sp, #0xc0]
0000000000065a4c	add	sp, sp, #0x120
0000000000065a50	ret
0000000000065a54	str	xzr, [sp, #0x10]
0000000000065a58	mov	w0, #0x1c0
0000000000065a5c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000065a60	mov	x22, x0
0000000000065a64	bl	__ZN6HTwirlC2Ev
0000000000065a68	ldr	x2, [sp, #0x10]
0000000000065a6c	ldr	x8, [x22]
0000000000065a70	ldr	x8, [x8, #0x78]
0000000000065a74	mov	x0, x22
0000000000065a78	mov	w1, #0x0
0000000000065a7c	blr	x8
0000000000065a80	ucvtf	d2, x23
0000000000065a84	ldp	d0, d1, [sp, #0x20]
0000000000065a88	fcvt	s0, d0
0000000000065a8c	fcvt	s1, d1
0000000000065a90	ldp	d3, d6, [x29, #-0x60]
0000000000065a94	fmul	d2, d6, d2
0000000000065a98	ldr	d4, [sp, #0x30]
0000000000065a9c	ldr	d5, [sp, #0x58]
0000000000065aa0	fmul	d2, d2, d4
0000000000065aa4	fcvt	s2, d2
0000000000065aa8	fcvt	s3, d3
0000000000065aac	fcvt	s4, d4
0000000000065ab0	fcvt	s5, d5
0000000000065ab4	mov	x0, x22
0000000000065ab8	bl	__ZN6HTwirl4initEffffff
0000000000065abc	mov	w0, #0x1a0
0000000000065ac0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000065ac4	mov	x23, x0
0000000000065ac8	bl	0x250f34 ; symbol stub for: __ZN11HGOverwriteC1Ev
0000000000065acc	ldr	x2, [sp, #0x10]
0000000000065ad0	ldr	x8, [x23]
0000000000065ad4	ldr	x8, [x8, #0x78]
0000000000065ad8	mov	x0, x23
0000000000065adc	mov	w1, #0x0
0000000000065ae0	blr	x8
0000000000065ae4	ldr	x8, [x23]
0000000000065ae8	ldr	x8, [x8, #0x78]
0000000000065aec	mov	x0, x23
0000000000065af0	mov	w1, #0x1
0000000000065af4	mov	x2, x22
0000000000065af8	blr	x8
0000000000065afc	str	x23, [sp]
0000000000065b00	ldr	x8, [x23]
0000000000065b04	ldr	x8, [x8, #0x10]
0000000000065b08	mov	x0, x23
0000000000065b0c	blr	x8
0000000000065b10	ldrb	w8, [sp, #0xf]
0000000000065b14	cmp	w8, #0x1
0000000000065b18	b.ne	0x65b30
0000000000065b1c	mov	x2, sp
0000000000065b20	mov	x0, x21
0000000000065b24	mov	x3, x20
0000000000065b28	mov	x4, x19
0000000000065b2c	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000065b30	mov	x2, sp
0000000000065b34	mov	x0, x19
0000000000065b38	bl	"_objc_msgSend$setHeliumRef:"
0000000000065b3c	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : AngleSlider
    parm3 : PointParameter
    parm4 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm4 (bool)

```
