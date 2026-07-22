# Sliced Scale

- **PAE class:** `Sliced Scale`
- **Plugin UUID:** `546352EB-956A-4DDA-9071-C82CC50B7F73`
- **Node names in corpus:** Sliced Scale (6), Scale (2), Width (1)
- **Corpus usage:** 5 files, 9 instances

## What it does

Sliced Scale is a 9-slice / nine-patch scaler: it divides the image into a 3x3 grid using two slice guides and scales the center and edge regions independently, so corners stay fixed while edges stretch (like scalable UI panels/frames). Slice guides and the Scale point set the grid and target size.

> **Note.** Not implemented; description is the standard Apple Motion "Sliced Scale" (nine-patch) filter. Expand/Debug are internal groups.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Edit Slices | bool | 0 | 0 .. 0 | Toggles the slice-guide editing mode (UI). |
| Slice Right Top | point2D | - | - | Top-right slice guide position. |
| Slice Left Bottom | point2D | - | - | Bottom-left slice guide position. |
| Scale Method | enum(int) | 0 | 0 .. 2 | How the sliced regions are scaled (stretch vs tile), 0-2. |
| Scale | point2D | - | - | Target scale (X,Y) applied to the sliced image. |
| Offset | point2D | - | - | Positional offset of the scaled result. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Expand | group | - | - | *(unverified)* |
| Debug | group | - | - | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSlicedScale`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSlicedScale` → [`HgcSlicedScale.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSlicedScale.metal)

```metal
//Metal1.0     
//LEN=00000009de
[[ visible ]] FragmentOut HgcSlicedScale_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.5000000000, 0.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.x = c0.x + hg_Params[11].x;
    r1.y = -c0.x - hg_Params[11].x;
    r0.y = fmax(r0.x, hg_Params[2].y);
    r0.z = r0.y*hg_Params[0].x;
    r1.z = fmin(r1.y, hg_Params[1].z);
    r1.w = r1.z*hg_Params[0].x;
    r1.x = dot(texCoord0, hg_Params[5]);
    r1.x = r1.x/hg_Params[9].x;
    r1.x = r1.x*hg_Params[7].x;
    r1.x = r1.x/hg_Params[10].x;
    r1.z = r1.z*hg_Params[0].x + -r1.z;
    r0.y = -r0.y*hg_Params[0].x + r0.y;
    r2.x = float(r1.x < r1.w);
    r0.w = float(r0.z < r1.x);
    r2.y = r0.w*-r2.x;
    r0.w = float(r0.z >= r1.x);
    r0.z = float(r1.x >= r1.w);
    r1.zw = r1.xx - r1.zw;
    r1.z = select(r1.z, c0.y, r1.w < 0.00000f);
    r0.y = r1.x + r0.y;
    r1.x = r1.x/hg_Params[0].x;
    r1.w = fmin(r1.y, hg_Params[3].w);
    r0.z = c0.z - r0.z;
    r2.x = float(-r0.w >= c0.y);
    r2.x = fmin(r0.z, r2.x);
    r0.z = fmin(r0.z, r0.w);
    r1.z = select(r1.z, r0.y, -r0.z < 0.00000f);
    r2.x = fmin(r2.x, r2.y);
    r1.x = select(r1.z, r1.x, r2.x < 0.00000f);
    r1.z = fmax(r0.x, hg_Params[4].z);
    r2.xy = r1.wz*hg_Params[0].yy;
    r1.x = r1.x*hg_Params[9].x;
    r1.y = dot(texCoord0, hg_Params[6]);
    r1.y = r1.y/hg_Params[9].y;
    r1.y = r1.y*hg_Params[8].y;
    r1.y = r1.y/hg_Params[10].y;
    r1.w = r1.w*hg_Params[0].y + -r1.w;
    r2.w = float(r1.y < r2.x);
    r2.z = float(r2.y < r1.y);
    r0.x = fmin(r2.z, r2.w);
    r2.z = float(r2.y >= r1.y);
    r2.y = float(r1.y >= r2.x);
    r2.w = r2.z;
    r2.x = r1.y - r2.x;
    r1.w = r1.y - r1.w;
    r2.yw = float2(-r2.yw >= c0.yy);
    r2.yw = fmin(r2.yy, r2.zw);
    r2.w = fmin(r2.w, r0.x);
    r1.z = -r1.z*hg_Params[0].y + r1.z;
    r1.w = select(r1.w, c0.y, r2.x < 0.00000f);
    r2.x = r1.y + r1.z;
    r1.w = select(r1.w, r2.x, -r2.y < 0.00000f);
    r1.y = r1.y/hg_Params[0].y;
    r1.y = select(r1.w, r1.y, -r2.w < 0.00000f);
    r0.x = r1.x*hg_Params[5].x;
    r1.x = r1.y*hg_Params[9].y;
    r0.w = c0.z;
    r0.y = r1.x*hg_Params[6].y;
    r2.y = dot(r0.xyw, hg_Params[8].xyw);
    r2.x = dot(r0.xyw, hg_Params[7].xyw);
    r2.xy = r2.xy + hg_Params[12].xy;
    r2.xy = r2.xy*hg_Params[12].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    return output;
}
```

### Metal fragment shader — `HgcSlicedTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSlicedTile` → [`HgcSlicedTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSlicedTile.metal)

```metal
//Metal1.0     
//LEN=00000012fd
[[ visible ]] FragmentOut HgcSlicedTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0.z = c0.z - hg_Params[13].x;
    r1.y = fmin(r0.z, hg_Params[1].x);
    r2.x = r1.y*hg_Params[0].x;
    r3.x = -c0.z + hg_Params[13].x;
    r2.y = fmax(r3.x, hg_Params[2].x);
    r1.x = dot(texCoord0, hg_Params[5]);
    r1.x = r1.x/hg_Params[9].x;
    r1.x = r1.x*hg_Params[7].x;
    r1.x = r1.x/hg_Params[12].x;
    r1.z = r2.y*hg_Params[0].x;
    r0.x = float(r1.z >= r1.x);
    r2.z = float(r1.x >= r2.x);
    r2.w = float(-r2.z >= c0.x);
    r1.w = float(-r0.x >= c0.x);
    r1.w = fmin(r2.w, r1.w);
    r1.y = r1.y*hg_Params[0].x + -r1.y;
    r2.z = float(r1.z < r1.x);
    r0.y = float(r1.x < r2.x);
    r0.y = fmin(r2.z, r0.y);
    r0.y = fmin(r1.w, r0.y);
    r2.z = float(r1.x < r1.z);
    r1.w = fmin(r0.y, r2.z);
    r1.w = select(r1.x, r1.z, -r1.w < 0.00000f);
    r2.z = float(r2.x < r1.w);
    r2.z = fmin(r0.y, r2.z);
    r0.w = r2.x - r1.z;
    r1.w = select(r1.w, r2.x, -r2.z < 0.00000f);
    r1.yz = r1.xw - r1.yz;
    r1.z = r1.z/r0.w;
    r1.z = r1.z*hg_Params[0].x;
    r0.w = fract(r1.z);
    r3.y = hg_Params[0].x*-c0.z + r0.w;
    r3.z = hg_Params[0].x*c0.z;
    r2.z = float(hg_Params[10].z >= c0.x);
    r3.z = fract(r3.z);
    r3.y = r3.y - c0.z;
    r1.z = fmin(r0.y, r2.z);
    r4.y = float(-r2.z >= c0.x);
    r3.w = float(-r3.z < c0.x);
    r3.z = fmin(r1.z, r4.y);
    r3.z = select(r3.w, c0.x, -r3.z < 0.00000f);
    r1.z = select(c0.y, r3.z, -r1.z < 0.00000f);
    r2.x = r1.x - r2.x;
    r2.y = -r2.y*hg_Params[0].x + r2.y;
    r1.x = r1.x + r2.y;
    r3.y = fract(r3.y);
    r1.z = fmin(r0.y, r1.z);
    r0.w = select(r0.w, r3.y, -r1.z < 0.00000f);
    r3.y = c0.y - r0.w;
    r1.z = r0.y*-hg_Params[11].x;
    r4.w = select(r0.w, r3.y, r1.z < 0.00000f);
    r3.y = fmax(r3.x, hg_Params[4].x);
    r0.z = fmin(r0.z, hg_Params[3].x);
    r0.w = r0.z*hg_Params[0].y;
    r3.z = r3.y*hg_Params[0].y;
    r4.z = float(r4.w < c0.x);
    r1.z = dot(texCoord0, hg_Params[6]);
    r1.z = r1.z/hg_Params[9].y;
    r1.z = r1.z*hg_Params[8].y;
    r1.z = r1.z/hg_Params[12].y;
    r3.w = float(r3.z >= r1.z);
    r5.x = float(r3.z < r1.z);
    r5.y = float(r1.z < r0.w);
    r5.y = fmin(r5.x, r5.y);
    r5.x = float(r1.z < r3.z);
    r2.y = r1.z - r0.w;
    r3.x = float(r1.z < r0.w);
    r1.y = select(r1.y, c0.x, r2.x < 0.00000f);
    r2.w = fmin(r2.w, r0.x);
    r4.x = float(-r3.w >= c0.x);
    r4.x = fmin(r3.x, r4.x);
    r4.x = fmin(r4.x, r5.y);
    r5.y = fmin(r0.y, r4.z);
    r5.y = select(r4.w, c0.x, -r5.y < 0.00000f);
    r5.x = fmin(r4.x, r5.x);
    r4.z = select(r1.z, r3.z, -r5.x < 0.00000f);
    r4.w = float(r0.w < r4.z);
    r4.w = fmin(r4.x, r4.w);
    r2.z = fmin(r4.x, r2.z);
    r4.z = select(r4.z, r0.w, -r4.w < 0.00000f);
    r5.x = r0.w - r3.z;
    r3.z = r4.z - r3.z;
    r3.z = r3.z/r5.x;
    r4.z = r3.z*hg_Params[0].y;
    r3.z = hg_Params[0].y*c0.z;
    r4.z = fract(r4.z);
    r5.z = float(c0.y < r5.y);
    r3.z = fract(r3.z);
    r1.w = hg_Params[0].y*-c0.z + r4.z;
    r1.w = r1.w - c0.z;
    r4.y = fmin(r2.z, r4.y);
    r3.z = float(-r3.z < c0.x);
    r3.z = select(r3.z, c0.x, -r4.y < 0.00000f);
    r2.z = select(c0.y, r3.z, -r2.z < 0.00000f);
    r4.w = fmin(r0.y, r5.z);
    r1.y = select(r1.y, r1.x, -r2.w < 0.00000f);
    r2.z = fmin(r4.x, r2.z);
    r1.w = fract(r1.w);
    r1.w = select(r4.z, r1.w, -r2.z < 0.00000f);
    r3.z = c0.y - r1.w;
    r2.z = r4.x*-hg_Params[11].x;
    r2.z = select(r1.w, r3.z, r2.z < 0.00000f);
    r3.z = float(r2.z < c0.x);
    r3.z = fmin(r4.x, r3.z);
    r2.z = select(r2.z, c0.x, -r3.z < 0.00000f);
    r1.x = float(c0.y < r2.z);
    r1.x = fmin(r4.x, r1.x);
    r1.x = select(r2.z, c0.y, -r1.x < 0.00000f);
    r2.x = fmin(r3.x, r3.w);
    r2.z = -r3.y*hg_Params[0].y + r3.y;
    r4.y = select(r5.y, c0.y, -r4.w < 0.00000f);
    r1.w = mix(hg_Params[2].x, hg_Params[1].x, r4.y);
    r1.y = select(r1.y, r1.w, -r0.y < 0.00000f);
    r1.w = r0.z*hg_Params[0].y + -r0.z;
    r1.w = r1.z - r1.w;
    r1.z = r1.z + r2.z;
    r1.w = select(r1.w, c0.x, r2.y < 0.00000f);
    r1.x = mix(hg_Params[4].x, hg_Params[3].x, r1.x);
    r1.z = select(r1.w, r1.z, -r2.x < 0.00000f);
    r1.y = r1.y*hg_Params[9].x;
    r1.x = select(r1.z, r1.x, -r4.x < 0.00000f);
    r1.x = r1.x*hg_Params[9].y;
    r3.x = r1.y*hg_Params[5].x;
    r3.w = c0.y;
    r3.y = r1.x*hg_Params[6].y;
    r5.y = dot(r3.xyw, hg_Params[8].xyw);
    r5.x = dot(r3.xyw, hg_Params[7].xyw);
    r5.xy = r5.xy + hg_Params[14].xy;
    r5.xy = r5.xy*hg_Params[14].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r5.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAESlicedScale canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESlicedScale`

```asm
00000000000c4aec	mov	w3, #0x1
00000000000c4af0	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000c4af4	cbz	x27, 0xc4b08
00000000000c4af8	add	x8, sp, #0x190
00000000000c4afc	mov	x0, x27
00000000000c4b00	bl	_objc_msgSend$heliumRef
00000000000c4b04	b	0xc4b0c
00000000000c4b08	str	xzr, [sp, #0x190]
00000000000c4b0c	ldrb	w8, [sp, #0x19f]
00000000000c4b10	tbz	w8, #0x0, 0xc4b24
00000000000c4b14	add	x2, sp, #0x190
00000000000c4b18	mov	x0, x20
00000000000c4b1c	bl	"_objc_msgSend$setHeliumRef:"
00000000000c4b20	b	0xc55bc
00000000000c4b24	add	x8, sp, #0x180
00000000000c4b28	fmov.2d	v0, #1.00000000
00000000000c4b2c	str	q0, [sp, #0x180]
00000000000c4b30	ldr	x5, [x22]
00000000000c4b34	add	x2, sp, #0x180
00000000000c4b38	orr	x3, x8, #0x8
00000000000c4b3c	mov	x0, x23
00000000000c4b40	mov	w4, #0x5
00000000000c4b44	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c4b48	ldr	q0, [sp, #0x180]
00000000000c4b4c	mov	x8, #0x68f1
00000000000c4b50	movk	x8, #0x88e3, lsl #16
00000000000c4b54	movk	x8, #0xf8b5, lsl #32
00000000000c4b58	movk	x8, #0x3ee4, lsl #48
00000000000c4b5c	dup.2d	v1, x8
00000000000c4b60	fmaxnm.2d	v0, v0, v1
00000000000c4b64	str	q0, [sp, #0x180]
00000000000c4b68	ldr	x5, [x22]
00000000000c4b6c	add	x2, sp, #0x1d0
00000000000c4b70	add	x3, sp, #0x1c0
00000000000c4b74	mov	x0, x23
00000000000c4b78	mov	w4, #0x3
00000000000c4b7c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c4b80	ldr	x5, [x22]
00000000000c4b84	add	x2, sp, #0x1d8
00000000000c4b88	add	x3, sp, #0x1c8
00000000000c4b8c	mov	x0, x23
00000000000c4b90	mov	w4, #0x2
00000000000c4b94	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c4b98	fmov	d0, x25
00000000000c4b9c	mov.d	v0[1], x26
00000000000c4ba0	ucvtf.2d	v2, v0
00000000000c4ba4	fmov	d0, #1.00000000
00000000000c4ba8	fdiv	d1, d0, d2
00000000000c4bac	str	q2, [sp, #0x30]
00000000000c4bb0	mov	d9, v2[1]
00000000000c4bb4	fdiv	d2, d0, d9
00000000000c4bb8	ldr	d3, [sp, #0x1d0]
00000000000c4bbc	fcmp	d1, d3
00000000000c4bc0	fcsel	d3, d3, d1, mi
00000000000c4bc4	fmov	d4, #-0.50000000
00000000000c4bc8	fadd	d5, d3, d4
00000000000c4bcc	ldr	d3, [sp, #0x1c0]
00000000000c4bd0	fcmp	d2, d3
00000000000c4bd4	fcsel	d3, d3, d2, mi
00000000000c4bd8	fadd	d6, d3, d4
00000000000c4bdc	fsub	d1, d0, d1
00000000000c4be0	ldr	d3, [sp, #0x1d8]
00000000000c4be4	fcmp	d1, d3
00000000000c4be8	fcsel	d1, d3, d1, gt
00000000000c4bec	fadd	d1, d1, d4
00000000000c4bf0	stp	d5, d1, [sp, #0x1d0]
00000000000c4bf4	fsub	d0, d0, d2
00000000000c4bf8	ldr	d1, [sp, #0x1c8]
00000000000c4bfc	fcmp	d0, d1
00000000000c4c00	fcsel	d0, d1, d0, gt
00000000000c4c04	fadd	d0, d0, d4
00000000000c4c08	stp	d6, d0, [sp, #0x1c0]
00000000000c4c0c	ldr	x4, [x22]
00000000000c4c10	add	x2, sp, #0x1bf
00000000000c4c14	mov	x0, x23
00000000000c4c18	mov	w3, #0xf
00000000000c4c1c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000c4c20	add	x8, sp, #0x1a0
00000000000c4c24	ldr	x5, [x22]
00000000000c4c28	add	x2, sp, #0x1a0
00000000000c4c2c	orr	x3, x8, #0x8
00000000000c4c30	mov	x0, x23
00000000000c4c34	mov	w4, #0x6
00000000000c4c38	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c4c3c	ldr	x4, [x22]
00000000000c4c40	add	x2, sp, #0x17c
00000000000c4c44	mov	x0, x23
00000000000c4c48	mov	w3, #0x4
00000000000c4c4c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000c4c50	ldr	x4, [x22]
00000000000c4c54	add	x2, sp, #0x170
00000000000c4c58	mov	x0, x23
00000000000c4c5c	mov	w3, #0x8
00000000000c4c60	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c4c64	ldr	x4, [x22]
00000000000c4c68	add	x2, sp, #0x160
00000000000c4c6c	mov	x0, x23
00000000000c4c70	mov	w3, #0x9
00000000000c4c74	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c4c78	ldr	x4, [x22]
00000000000c4c7c	add	x2, sp, #0x168
00000000000c4c80	mov	x0, x23
00000000000c4c84	mov	w3, #0xa
00000000000c4c88	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c4c8c	ldr	x4, [x22]
00000000000c4c90	add	x2, sp, #0x158
00000000000c4c94	mov	x0, x23
00000000000c4c98	mov	w3, #0xb
00000000000c4c9c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c4ca0	ldr	w6, [sp, #0x17c]
00000000000c4ca4	cmp	w6, #0x2
00000000000c4ca8	b.ne	0xc4cdc
00000000000c4cac	cmp	w24, #0x2
00000000000c4cb0	b.lo	0xc4cdc
00000000000c4cb4	ldp	d0, d1, [sp, #0x1d0]
00000000000c4cb8	ldp	d2, d3, [sp, #0x1c0]
00000000000c4cbc	add	x2, sp, #0x170
00000000000c4cc0	add	x3, sp, #0x168
00000000000c4cc4	add	x4, sp, #0x160
00000000000c4cc8	add	x5, sp, #0x158
00000000000c4ccc	add	x6, sp, #0x180
00000000000c4cd0	mov	x0, x21
00000000000c4cd4	bl	"_objc_msgSend$wholeTileExpandLeftScale:expandRightScale:expandBottomScale:expandTopScale:objectScale:xLeft:xRight:yBottom:yTop:"
00000000000c4cd8	ldr	w6, [sp, #0x17c]
00000000000c4cdc	str	d8, [sp, #0x8]
00000000000c4ce0	ldr	d0, [sp, #0x170]
00000000000c4ce4	ldp	d1, d2, [sp, #0x180]
00000000000c4ce8	fadd	d0, d1, d0
00000000000c4cec	ldr	d1, [sp, #0x168]
00000000000c4cf0	fadd	d15, d0, d1
00000000000c4cf4	ldp	d1, d0, [sp, #0x158]
00000000000c4cf8	fadd	d0, d2, d0
00000000000c4cfc	fadd	d8, d0, d1
00000000000c4d00	stp	xzr, xzr, [sp, #0x148]
00000000000c4d04	stp	d15, d8, [sp, #0x40]
00000000000c4d08	ldp	d0, d1, [sp, #0x1d0]
00000000000c4d0c	ldp	d3, d2, [sp, #0x1c0]
00000000000c4d10	ldr	q4, [sp, #0x30]
00000000000c4d14	str	q4, [sp, #0xe0]
00000000000c4d18	add	x2, sp, #0x40
00000000000c4d1c	add	x3, sp, #0x1e0
00000000000c4d20	add	x4, sp, #0xe0
00000000000c4d24	add	x5, sp, #0x148
00000000000c4d28	mov	x0, x21
00000000000c4d2c	bl	"_objc_msgSend$innerScaleFromObjectScale:innerScale:xLeft:xRight:yTop:yBottom:inputSize:newObjectSize:mode:"
00000000000c4d30	stp	xzr, xzr, [sp, #0x130]
00000000000c4d34	stp	d15, d8, [sp, #0x40]
00000000000c4d38	ldr	q0, [sp, #0x1e0]
00000000000c4d3c	str	q0, [sp, #0xe0]
00000000000c4d40	ldp	d0, d1, [sp, #0x1d0]
00000000000c4d44	ldp	d3, d2, [sp, #0x1c0]
00000000000c4d48	add	x2, sp, #0x130
00000000000c4d4c	add	x3, sp, #0x40
00000000000c4d50	add	x4, sp, #0xe0
00000000000c4d54	mov	x0, x21
00000000000c4d58	bl	"_objc_msgSend$additionalObjectDownScale:objectScale:innerScale:xLeft:xRight:yTop:yBottom:"
00000000000c4d5c	fcvt	d13, s13
00000000000c4d60	fcvt	d14, s14
00000000000c4d64	ldrb	w8, [sp, #0x1bf]
00000000000c4d68	movi.2d	v0, #0000000000000000
00000000000c4d6c	str	q0, [sp, #0x10]
00000000000c4d70	tbnz	w8, #0x0, 0xc4ebc
00000000000c4d74	ldp	q1, q0, [sp, #0x20]
00000000000c4d78	fmul.2d	v0, v1, v0
00000000000c4d7c	stp	d13, d14, [sp, #0xe0]
00000000000c4d80	ldr	w4, [sp, #0x17c]
00000000000c4d84	str	q0, [sp, #0x20]
00000000000c4d88	str	q0, [sp, #0x120]
00000000000c4d8c	ldp	d0, d1, [sp, #0x1d0]
00000000000c4d90	ldp	d2, d3, [sp, #0x1c0]
00000000000c4d94	stp	d15, d8, [sp, #0x110]
00000000000c4d98	ldr	q4, [sp, #0x1a0]
00000000000c4d9c	str	q4, [sp, #0x100]
00000000000c4da0	add	x8, sp, #0x100
00000000000c4da4	str	x8, [sp]
00000000000c4da8	add	x2, sp, #0x40
00000000000c4dac	add	x3, sp, #0xe0
00000000000c4db0	add	x5, sp, #0x120
00000000000c4db4	add	x7, sp, #0x110
00000000000c4db8	mov	x0, x21
00000000000c4dbc	mov	w6, #0x0
00000000000c4dc0	bl	"_objc_msgSend$calculateBounds:fromOrigin:mode:inputSize:ignoreOffsets:xLeft:xRight:yBottom:yTop:objectScale:offset:"
00000000000c4dc4	stp	d13, d14, [sp, #0x120]
00000000000c4dc8	ldr	w4, [sp, #0x17c]
00000000000c4dcc	ldr	q5, [sp, #0x20]
00000000000c4dd0	ldrb	w6, [sp, #0x1bf]
00000000000c4dd4	ldp	d0, d1, [sp, #0x1d0]
00000000000c4dd8	ldp	d2, d3, [sp, #0x1c0]
00000000000c4ddc	ldr	q4, [sp, #0x180]
00000000000c4de0	stp	q4, q5, [sp, #0x100]
00000000000c4de4	ldr	q4, [sp, #0x1a0]
00000000000c4de8	str	q4, [sp, #0xd0]
00000000000c4dec	add	x8, sp, #0xd0
00000000000c4df0	str	x8, [sp]
00000000000c4df4	add	x2, sp, #0xe0
00000000000c4df8	add	x3, sp, #0x120
00000000000c4dfc	add	x5, sp, #0x110
00000000000c4e00	add	x7, sp, #0x100
00000000000c4e04	mov	x0, x21
00000000000c4e08	bl	"_objc_msgSend$calculateBounds:fromOrigin:mode:inputSize:ignoreOffsets:xLeft:xRight:yBottom:yTop:objectScale:offset:"
00000000000c4e0c	ldp	d1, d0, [sp, #0x168]
00000000000c4e10	ldp	d2, d3, [sp, #0x1d0]
00000000000c4e14	ldp	q4, q5, [sp, #0xe0]
00000000000c4e18	fadd.2d	v4, v4, v4
00000000000c4e1c	fadd.2d	v4, v4, v5
00000000000c4e20	fmov.2d	v5, #0.50000000
00000000000c4e24	fmul.2d	v4, v4, v5
00000000000c4e28	ldr	q16, [sp, #0x20]
00000000000c4e2c	fdiv.2d	v4, v4, v16
00000000000c4e30	ldp	q6, q7, [sp, #0x40]
00000000000c4e34	fadd.2d	v6, v6, v6
00000000000c4e38	fadd.2d	v6, v6, v7
00000000000c4e3c	fmul.2d	v6, v6, v5
00000000000c4e40	add	x8, sp, #0x160
00000000000c4e44	ld1.d	{ v0 }[1], [x8]
00000000000c4e48	fdiv.2d	v6, v6, v16
00000000000c4e4c	add	x8, sp, #0x158
00000000000c4e50	ld1.d	{ v1 }[1], [x8]
00000000000c4e54	fsub.2d	v0, v0, v1
00000000000c4e58	fmul.2d	v0, v0, v5
00000000000c4e5c	fsub.2d	v1, v4, v6
00000000000c4e60	fsub.2d	v0, v1, v0
00000000000c4e64	ldr	q1, [sp, #0x1e0]
00000000000c4e68	add	x8, sp, #0x1c0
00000000000c4e6c	ld1.d	{ v2 }[1], [x8]
00000000000c4e70	fmul.2d	v4, v2, v1
00000000000c4e74	fsub.2d	v2, v2, v4
00000000000c4e78	ldr	q4, [sp, #0x130]
00000000000c4e7c	add	x8, sp, #0x1c8
00000000000c4e80	ld1.d	{ v3 }[1], [x8]
00000000000c4e84	fmul.2d	v2, v4, v2
00000000000c4e88	fmul.2d	v1, v1, v3
00000000000c4e8c	fsub.2d	v1, v1, v3
00000000000c4e90	fmul.2d	v1, v4, v1
00000000000c4e94	fsub.2d	v1, v2, v1
00000000000c4e98	fmul.2d	v1, v1, v5
00000000000c4e9c	fadd.2d	v0, v0, v1
00000000000c4ea0	ldr	q1, [sp, #0x1a0]
00000000000c4ea4	fmov.2d	v2, #-0.50000000
00000000000c4ea8	fadd.2d	v1, v1, v2
00000000000c4eac	fadd.2d	v0, v1, v0
00000000000c4eb0	ldr	q1, [sp, #0x30]
00000000000c4eb4	fmul.2d	v0, v0, v1
00000000000c4eb8	str	q0, [sp, #0x10]
00000000000c4ebc	add	x0, sp, #0x40
00000000000c4ec0	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c4ec4	ldr	q0, [sp, #0x10]
00000000000c4ec8	mov	d1, v0[1]
00000000000c4ecc	add	x0, sp, #0x40
00000000000c4ed0	movi.2d	v2, #0000000000000000
00000000000c4ed4	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000c4ed8	mov	w0, #0x210
00000000000c4edc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c4ee0	mov	x21, x0
00000000000c4ee4	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000c4ee8	ldr	x8, [x21]
00000000000c4eec	ldr	x8, [x8, #0x230]
00000000000c4ef0	add	x1, sp, #0x40
00000000000c4ef4	mov	x0, x21
00000000000c4ef8	blr	x8
00000000000c4efc	fmul	d0, d11, d13
00000000000c4f00	ldr	d1, [sp, #0x8]
00000000000c4f04	fmul	d1, d1, d14
00000000000c4f08	fadd	d0, d0, d10
00000000000c4f0c	fadd	d1, d1, d12
00000000000c4f10	fcvtzs	w0, d0
00000000000c4f14	fcvtzs	w1, d1
00000000000c4f18	ldr	q2, [sp, #0x30]
00000000000c4f1c	fadd	d0, d0, d2
00000000000c4f20	fcvtzs	w2, d0
00000000000c4f24	fadd	d0, d1, d9
00000000000c4f28	fcvtzs	w3, d0
00000000000c4f2c	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000c4f30	mov	x25, x0
00000000000c4f34	mov	x24, x1
00000000000c4f38	mov	w0, #0x1a0
00000000000c4f3c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c4f40	mov	x22, x0
00000000000c4f44	mov	x1, x25
00000000000c4f48	mov	x2, x24
00000000000c4f4c	bl	0x251060 ; symbol stub for: __ZN12HGSolidColorC1E6HGRect
00000000000c4f50	ldr	x8, [x22]
00000000000c4f54	ldr	x8, [x8, #0x60]
00000000000c4f58	movi.2d	v0, #0000000000000000
00000000000c4f5c	movi.2d	v1, #0000000000000000
00000000000c4f60	movi.2d	v2, #0000000000000000
00000000000c4f64	movi.2d	v3, #0000000000000000
00000000000c4f68	mov	x0, x22
00000000000c4f6c	mov	w1, #0x0
00000000000c4f70	blr	x8
00000000000c4f74	mov	w0, #0x220
00000000000c4f78	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c4f7c	mov	x23, x0
00000000000c4f80	bl	0x25130c ; symbol stub for: __ZN16HGHWBlendFlippedC1Ev
00000000000c4f84	ldr	x8, [x23]
00000000000c4f88	ldr	x8, [x8, #0x60]
00000000000c4f8c	fmov	s0, #9.00000000
00000000000c4f90	movi.2d	v1, #0000000000000000
00000000000c4f94	movi.2d	v2, #0000000000000000
00000000000c4f98	movi.2d	v3, #0000000000000000
00000000000c4f9c	mov	x0, x23
00000000000c4fa0	mov	w1, #0x0
00000000000c4fa4	blr	x8
00000000000c4fa8	ldr	x8, [x23]
00000000000c4fac	ldr	x8, [x8, #0x60]
00000000000c4fb0	fmov	s0, #1.00000000
00000000000c4fb4	movi.2d	v1, #0000000000000000
00000000000c4fb8	movi.2d	v2, #0000000000000000
00000000000c4fbc	movi.2d	v3, #0000000000000000
00000000000c4fc0	mov	x0, x23
00000000000c4fc4	mov	w1, #0x1
00000000000c4fc8	blr	x8
00000000000c4fcc	ldr	x8, [x23]
00000000000c4fd0	ldr	x8, [x8, #0x78]
00000000000c4fd4	mov	x0, x23
00000000000c4fd8	mov	w1, #0x0
00000000000c4fdc	mov	x2, x22
00000000000c4fe0	blr	x8
00000000000c4fe4	ldr	x2, [sp, #0x190]
00000000000c4fe8	ldr	x8, [x23]
00000000000c4fec	ldr	x8, [x8, #0x78]
00000000000c4ff0	mov	x0, x23
00000000000c4ff4	mov	w1, #0x1
00000000000c4ff8	blr	x8
00000000000c4ffc	ldr	w8, [sp, #0x17c]
00000000000c5000	cbz	w8, 0xc52d8
00000000000c5004	mov	w0, #0x1b0
00000000000c5008	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c500c	mov	x26, x0
00000000000c5010	bl	__ZN13HgcSlicedTileC2Ev
00000000000c5014	adrp	x8, 715 ; 0x390000
00000000000c5018	add	x8, x8, #0xa28
00000000000c501c	add	x9, x8, #0x10
00000000000c5020	str	x9, [x26]
00000000000c5024	ldr	w9, [sp, #0x17c]
00000000000c5028	ldr	x8, [x8, #0x70]
00000000000c502c	cmp	w9, #0x1
00000000000c5030	movi.2d	v0, #0000000000000000
00000000000c5034	fmov	s1, #1.00000000
00000000000c5038	fcsel	s0, s1, s0, eq
00000000000c503c	movi.2d	v1, #0000000000000000
00000000000c5040	movi.2d	v2, #0000000000000000
00000000000c5044	movi.2d	v3, #0000000000000000
00000000000c5048	mov	x0, x26
00000000000c504c	mov	w1, #0xa
00000000000c5050	blr	x8
00000000000c5054	ldr	x8, [x26]
00000000000c5058	ldr	x8, [x8, #0x60]
00000000000c505c	movi.2d	v0, #0000000000000000
00000000000c5060	movi.2d	v1, #0000000000000000
00000000000c5064	movi.2d	v2, #0000000000000000
00000000000c5068	movi.2d	v3, #0000000000000000
00000000000c506c	mov	x0, x26
00000000000c5070	mov	w1, #0xb
00000000000c5074	blr	x8
00000000000c5078	ldp	d0, d1, [sp, #0x1e0]
00000000000c507c	fcvt	s0, d0
00000000000c5080	fcvt	s1, d1
00000000000c5084	ldr	x8, [x26]
00000000000c5088	ldr	x8, [x8, #0x60]
00000000000c508c	movi.2d	v2, #0000000000000000
00000000000c5090	movi.2d	v3, #0000000000000000
00000000000c5094	mov	x0, x26
00000000000c5098	mov	w1, #0x0
00000000000c509c	blr	x8
00000000000c50a0	ldr	x8, [x26]
00000000000c50a4	ldr	x8, [x8, #0x78]
00000000000c50a8	mov	x0, x26
00000000000c50ac	mov	w1, #0x0
00000000000c50b0	mov	x2, x23
00000000000c50b4	blr	x8
00000000000c50b8	ldr	d0, [sp, #0x1d8]
00000000000c50bc	fcvt	s0, d0
00000000000c50c0	ldr	x8, [x26]
00000000000c50c4	ldr	x8, [x8, #0x60]
00000000000c50c8	movi.2d	v1, #0000000000000000
00000000000c50cc	movi.2d	v2, #0000000000000000
00000000000c50d0	movi.2d	v3, #0000000000000000
00000000000c50d4	mov	x0, x26
00000000000c50d8	mov	w1, #0x1
00000000000c50dc	blr	x8
00000000000c50e0	ldr	d0, [sp, #0x1d0]
00000000000c50e4	fcvt	s0, d0
00000000000c50e8	ldr	x8, [x26]
00000000000c50ec	ldr	x8, [x8, #0x60]
00000000000c50f0	movi.2d	v1, #0000000000000000
00000000000c50f4	movi.2d	v2, #0000000000000000
00000000000c50f8	movi.2d	v3, #0000000000000000
00000000000c50fc	mov	x0, x26
00000000000c5100	mov	w1, #0x2
00000000000c5104	blr	x8
00000000000c5108	ldr	d0, [sp, #0x1c8]
00000000000c510c	fcvt	s0, d0
00000000000c5110	ldr	x8, [x26]
00000000000c5114	ldr	x8, [x8, #0x60]
00000000000c5118	movi.2d	v1, #0000000000000000
00000000000c511c	movi.2d	v2, #0000000000000000
00000000000c5120	movi.2d	v3, #0000000000000000
00000000000c5124	mov	x0, x26
00000000000c5128	mov	w1, #0x3
00000000000c512c	blr	x8
00000000000c5130	ldr	d0, [sp, #0x1c0]
00000000000c5134	fcvt	s0, d0
00000000000c5138	ldr	x8, [x26]
00000000000c513c	ldr	x8, [x8, #0x60]
00000000000c5140	movi.2d	v1, #0000000000000000
00000000000c5144	movi.2d	v2, #0000000000000000
00000000000c5148	movi.2d	v3, #0000000000000000
00000000000c514c	mov	x0, x26
00000000000c5150	mov	w1, #0x4
00000000000c5154	blr	x8
00000000000c5158	ldr	d0, [sp, #0x270]
00000000000c515c	ldr	d1, [sp, #0x278]
00000000000c5160	fcvt	s0, d0
00000000000c5164	fcvt	s1, d1
00000000000c5168	ldr	d2, [sp, #0x280]
00000000000c516c	ldr	d3, [sp, #0x288]
00000000000c5170	fcvt	s2, d2
00000000000c5174	fcvt	s3, d3
00000000000c5178	ldr	x8, [x26]
00000000000c517c	ldr	x8, [x8, #0x60]
00000000000c5180	mov	x0, x26
00000000000c5184	mov	w1, #0x5
00000000000c5188	blr	x8
00000000000c518c	ldr	d0, [sp, #0x290]
00000000000c5190	ldr	d1, [sp, #0x298]
00000000000c5194	fcvt	s0, d0
00000000000c5198	fcvt	s1, d1
00000000000c519c	ldr	d2, [sp, #0x2a0]
00000000000c51a0	ldr	d3, [sp, #0x2a8]
00000000000c51a4	fcvt	s2, d2
00000000000c51a8	fcvt	s3, d3
00000000000c51ac	ldr	x8, [x26]
00000000000c51b0	ldr	x8, [x8, #0x60]
00000000000c51b4	mov	x0, x26
00000000000c51b8	mov	w1, #0x6
00000000000c51bc	blr	x8
00000000000c51c0	ldp	d0, d1, [sp, #0x1f0]
00000000000c51c4	fcvt	s0, d0
00000000000c51c8	fcvt	s1, d1
00000000000c51cc	ldr	d2, [sp, #0x200]
00000000000c51d0	ldr	d3, [sp, #0x208]
00000000000c51d4	fcvt	s2, d2
00000000000c51d8	fcvt	s3, d3
00000000000c51dc	ldr	x8, [x26]
00000000000c51e0	ldr	x8, [x8, #0x60]
00000000000c51e4	mov	x0, x26
00000000000c51e8	mov	w1, #0x7
00000000000c51ec	blr	x8
00000000000c51f0	ldr	d0, [sp, #0x210]
00000000000c51f4	ldr	d1, [sp, #0x218]
00000000000c51f8	fcvt	s0, d0
00000000000c51fc	fcvt	s1, d1
00000000000c5200	ldr	d2, [sp, #0x220]
00000000000c5204	ldr	d3, [sp, #0x228]
00000000000c5208	fcvt	s2, d2
00000000000c520c	fcvt	s3, d3
00000000000c5210	ldr	x8, [x26]
00000000000c5214	ldr	x8, [x8, #0x60]
00000000000c5218	mov	x0, x26
00000000000c521c	mov	w1, #0x8
00000000000c5220	blr	x8
00000000000c5224	ldr	q0, [sp, #0x30]
00000000000c5228	fcvt	s0, d0
00000000000c522c	fcvt	s1, d9
00000000000c5230	ldr	x8, [x26]
00000000000c5234	ldr	x8, [x8, #0x60]
00000000000c5238	movi.2d	v2, #0000000000000000
00000000000c523c	movi.2d	v3, #0000000000000000
00000000000c5240	mov	x0, x26
00000000000c5244	mov	w1, #0x9
00000000000c5248	blr	x8
00000000000c524c	ldp	d0, d1, [sp, #0x130]
00000000000c5250	fcvt	s0, d0
00000000000c5254	fcvt	s1, d1
00000000000c5258	ldr	x8, [x26]
00000000000c525c	ldr	x8, [x8, #0x60]
00000000000c5260	movi.2d	v2, #0000000000000000
00000000000c5264	movi.2d	v3, #0000000000000000
00000000000c5268	mov	x0, x26
00000000000c526c	mov	w1, #0xc
00000000000c5270	blr	x8
00000000000c5274	ldr	x8, [x26]
00000000000c5278	ldr	x8, [x8, #0x60]
00000000000c527c	adrp	x9, 421 ; 0x26a000
00000000000c5280	ldr	s0, [x9, #0x64]
00000000000c5284	movi.2d	v1, #0000000000000000
00000000000c5288	movi.2d	v2, #0000000000000000
00000000000c528c	movi.2d	v3, #0000000000000000
00000000000c5290	mov	x0, x26
00000000000c5294	mov	w1, #0xd
00000000000c5298	blr	x8
00000000000c529c	mov	x0, x26
00000000000c52a0	mov	x1, x25
00000000000c52a4	mov	x2, x24
00000000000c52a8	bl	__ZN27HGradientWipeClockGenerator6setDODE6HGRect
00000000000c52ac	ldr	x8, [x21]
00000000000c52b0	ldr	x8, [x8, #0x78]
00000000000c52b4	mov	x0, x21
00000000000c52b8	mov	w1, #0x0
00000000000c52bc	mov	x2, x26
00000000000c52c0	blr	x8
00000000000c52c4	ldr	x8, [x26]
00000000000c52c8	ldr	x8, [x8, #0x18]
00000000000c52cc	mov	x0, x26
00000000000c52d0	blr	x8
00000000000c52d4	b	0xc5550
00000000000c52d8	mov	w0, #0x1b0
00000000000c52dc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c52e0	mov	x26, x0
00000000000c52e4	bl	__ZN14HgcSlicedScaleC2Ev
00000000000c52e8	adrp	x8, 726 ; 0x39b000
00000000000c52ec	add	x8, x8, #0x8b8
00000000000c52f0	add	x9, x8, #0x10
00000000000c52f4	str	x9, [x26]
00000000000c52f8	ldp	d0, d1, [sp, #0x1e0]
00000000000c52fc	fcvt	s0, d0
00000000000c5300	fcvt	s1, d1
00000000000c5304	ldr	x8, [x8, #0x70]
00000000000c5308	movi.2d	v2, #0000000000000000
00000000000c530c	movi.2d	v3, #0000000000000000
00000000000c5310	mov	x0, x26
00000000000c5314	mov	w1, #0x0
00000000000c5318	blr	x8
00000000000c531c	ldr	x8, [x26]
00000000000c5320	ldr	x8, [x8, #0x78]
00000000000c5324	mov	x0, x26
00000000000c5328	mov	w1, #0x0
00000000000c532c	mov	x2, x23
00000000000c5330	blr	x8
00000000000c5334	ldr	d0, [sp, #0x1d8]
00000000000c5338	fcvt	s0, d0
00000000000c533c	ldr	x8, [x26]
00000000000c5340	ldr	x8, [x8, #0x60]
00000000000c5344	movi.2d	v1, #0000000000000000
00000000000c5348	movi.2d	v2, #0000000000000000
00000000000c534c	movi.2d	v3, #0000000000000000
00000000000c5350	mov	x0, x26
00000000000c5354	mov	w1, #0x1
00000000000c5358	blr	x8
00000000000c535c	ldr	d0, [sp, #0x1d0]
00000000000c5360	fcvt	s0, d0
00000000000c5364	ldr	x8, [x26]
00000000000c5368	ldr	x8, [x8, #0x60]
00000000000c536c	movi.2d	v1, #0000000000000000
00000000000c5370	movi.2d	v2, #0000000000000000
00000000000c5374	movi.2d	v3, #0000000000000000
00000000000c5378	mov	x0, x26
00000000000c537c	mov	w1, #0x2
00000000000c5380	blr	x8
00000000000c5384	ldr	d0, [sp, #0x1c8]
00000000000c5388	fcvt	s0, d0
00000000000c538c	ldr	x8, [x26]
00000000000c5390	ldr	x8, [x8, #0x60]
00000000000c5394	movi.2d	v1, #0000000000000000
00000000000c5398	movi.2d	v2, #0000000000000000
00000000000c539c	movi.2d	v3, #0000000000000000
00000000000c53a0	mov	x0, x26
00000000000c53a4	mov	w1, #0x3
00000000000c53a8	blr	x8
00000000000c53ac	ldr	d0, [sp, #0x1c0]
00000000000c53b0	fcvt	s0, d0
00000000000c53b4	ldr	x8, [x26]
00000000000c53b8	ldr	x8, [x8, #0x60]
00000000000c53bc	movi.2d	v1, #0000000000000000
00000000000c53c0	movi.2d	v2, #0000000000000000
00000000000c53c4	movi.2d	v3, #0000000000000000
00000000000c53c8	mov	x0, x26
00000000000c53cc	mov	w1, #0x4
00000000000c53d0	blr	x8
00000000000c53d4	ldr	d0, [sp, #0x270]
00000000000c53d8	ldr	d1, [sp, #0x278]
00000000000c53dc	fcvt	s0, d0
00000000000c53e0	fcvt	s1, d1
00000000000c53e4	ldr	d2, [sp, #0x280]
00000000000c53e8	ldr	d3, [sp, #0x288]
00000000000c53ec	fcvt	s2, d2
00000000000c53f0	fcvt	s3, d3
00000000000c53f4	ldr	x8, [x26]
00000000000c53f8	ldr	x8, [x8, #0x60]
00000000000c53fc	mov	x0, x26
00000000000c5400	mov	w1, #0x5
00000000000c5404	blr	x8
00000000000c5408	ldr	d0, [sp, #0x290]
00000000000c540c	ldr	d1, [sp, #0x298]
00000000000c5410	fcvt	s0, d0
00000000000c5414	fcvt	s1, d1
00000000000c5418	ldr	d2, [sp, #0x2a0]
00000000000c541c	ldr	d3, [sp, #0x2a8]
00000000000c5420	fcvt	s2, d2
00000000000c5424	fcvt	s3, d3
00000000000c5428	ldr	x8, [x26]
00000000000c542c	ldr	x8, [x8, #0x60]
00000000000c5430	mov	x0, x26
00000000000c5434	mov	w1, #0x6
00000000000c5438	blr	x8
00000000000c543c	ldp	d0, d1, [sp, #0x1f0]
00000000000c5440	fcvt	s0, d0
00000000000c5444	fcvt	s1, d1
00000000000c5448	ldr	d2, [sp, #0x200]
00000000000c544c	ldr	d3, [sp, #0x208]
00000000000c5450	fcvt	s2, d2
00000000000c5454	fcvt	s3, d3
00000000000c5458	ldr	x8, [x26]
00000000000c545c	ldr	x8, [x8, #0x60]
00000000000c5460	mov	x0, x26
00000000000c5464	mov	w1, #0x7
00000000000c5468	blr	x8
00000000000c546c	ldr	d0, [sp, #0x210]
00000000000c5470	ldr	d1, [sp, #0x218]
00000000000c5474	fcvt	s0, d0
00000000000c5478	fcvt	s1, d1
00000000000c547c	ldr	d2, [sp, #0x220]
00000000000c5480	ldr	d3, [sp, #0x228]
00000000000c5484	fcvt	s2, d2
00000000000c5488	fcvt	s3, d3
00000000000c548c	ldr	x8, [x26]
00000000000c5490	ldr	x8, [x8, #0x60]
00000000000c5494	mov	x0, x26
00000000000c5498	mov	w1, #0x8
00000000000c549c	blr	x8
00000000000c54a0	ldr	q0, [sp, #0x30]
00000000000c54a4	fcvt	s0, d0
00000000000c54a8	fcvt	s1, d9
00000000000c54ac	ldr	x8, [x26]
00000000000c54b0	ldr	x8, [x8, #0x60]
00000000000c54b4	movi.2d	v2, #0000000000000000
00000000000c54b8	movi.2d	v3, #0000000000000000
00000000000c54bc	mov	x0, x26
00000000000c54c0	mov	w1, #0x9
00000000000c54c4	blr	x8
00000000000c54c8	ldp	d0, d1, [sp, #0x130]
00000000000c54cc	fcvt	s0, d0
00000000000c54d0	fcvt	s1, d1
00000000000c54d4	ldr	x8, [x26]
00000000000c54d8	ldr	x8, [x8, #0x60]
00000000000c54dc	movi.2d	v2, #0000000000000000
00000000000c54e0	movi.2d	v3, #0000000000000000
00000000000c54e4	mov	x0, x26
00000000000c54e8	mov	w1, #0xa
00000000000c54ec	blr	x8
00000000000c54f0	ldr	x8, [x26]
00000000000c54f4	ldr	x8, [x8, #0x60]
00000000000c54f8	adrp	x9, 421 ; 0x26a000
00000000000c54fc	ldr	s0, [x9, #0x64]
00000000000c5500	movi.2d	v1, #0000000000000000
00000000000c5504	movi.2d	v2, #0000000000000000
00000000000c5508	movi.2d	v3, #0000000000000000
00000000000c550c	mov	x0, x26
00000000000c5510	mov	w1, #0xb
00000000000c5514	blr	x8
00000000000c5518	mov	x0, x26
00000000000c551c	mov	x1, x25
00000000000c5520	mov	x2, x24
00000000000c5524	bl	__ZN27HGradientWipeClockGenerator6setDODE6HGRect
00000000000c5528	ldr	x8, [x21]
00000000000c552c	ldr	x8, [x8, #0x78]
00000000000c5530	mov	x0, x21
00000000000c5534	mov	w1, #0x0
00000000000c5538	mov	x2, x26
00000000000c553c	blr	x8
00000000000c5540	ldr	x8, [x26]
00000000000c5544	ldr	x8, [x8, #0x18]
00000000000c5548	mov	x0, x26
00000000000c554c	blr	x8
00000000000c5550	str	x21, [sp, #0xe0]
00000000000c5554	ldr	x8, [x21]
00000000000c5558	ldr	x8, [x8, #0x10]
00000000000c555c	mov	x0, x21
00000000000c5560	blr	x8
00000000000c5564	add	x2, sp, #0xe0
00000000000c5568	mov	x0, x20
00000000000c556c	bl	"_objc_msgSend$setHeliumRef:"
00000000000c5570	ldr	x0, [sp, #0xe0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : ToggleButton
    parm2 : PointParameter
    parm3 : PointParameter
    parm4 : PopupMenu
    parm5 : 2DScale
    parm6 : PointParameter
    parm8 : PercentSlider
    parm10 : PercentSlider
    parm11 : PercentSlider
    parm9 : PercentSlider
    parm9 : FloatSlider
    parm10 : FloatSlider
    parm11 : FloatSlider
    parm9 : FloatSlider
    parm15 : ToggleButton
    parm16 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (bool)
    - parm15 (bool)
    - parm4 (int)
    - parm8 (float)
    - parm9 (float)
    - parm10 (float)
    - parm11 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm15 (bool)
    slot 11  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm15 (bool)
    slot 3  <-  parm15 (bool)
    slot 4  <-  parm15 (bool)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  (constant / computed / multi-pass — read the disasm)
    slot 7  <-  (constant / computed / multi-pass — read the disasm)
    slot 8  <-  (constant / computed / multi-pass — read the disasm)
    slot 9  <-  (constant / computed / multi-pass — read the disasm)
    slot 12  <-  (constant / computed / multi-pass — read the disasm)
    slot 13  <-  (constant / computed / multi-pass — read the disasm)
    slot 10  <-  (constant / computed / multi-pass — read the disasm)
```
