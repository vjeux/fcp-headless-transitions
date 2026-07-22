# NoiseDither

- **PAE class:** `NoiseDither`
- **Plugin UUID:** `1AF9D5FE-EC69-4021-BA8C-39F9BE738AF1`
- **Node names in corpus:** Reduce Banding (5)
- **Corpus usage:** 3 files, 5 instances

## What it does

NoiseDither ("Reduce Banding") adds a small amount of dithering noise to smooth gradients, breaking up visible color banding in low-bit-depth or heavily-graded footage. Noisiness sets the dither strength and Movement whether the noise animates per frame.

> **Note.** Not implemented; description is the standard Apple Motion "Reduce Banding" (NoiseDither) filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Noisiness | enum(int) | 0.5 | 1 .. 3 | Strength of the dithering noise, 1-3 (default ~1). |
| Movement | bool | 0 | 1 .. 1 | Whether the dither pattern animates each frame (vs static). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcNoise`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcNoise` → [`HgcNoise.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcNoise.metal)

```metal
//Metal1.0     
//LEN=0000001b37
[[ visible ]] FragmentOut HgcNoise_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.02127659507, 0.02439024299, 0.01639344171, 0.01694915257);
    const float4 c1 = float4(47.00000000, -41.00000000, 32.00000000, 0.5000000000);
    const float4 c2 = float4(0.3660254180, 0.2113248706, 0.003460207721, 289.0000000);
    const float4 c3 = float4(1.000000000, 0.000000000, 34.00000000, 0.8537347317);
    const float4 c4 = float4(1.792842865, 0.2113248706, -0.5773502588, -61.00000000);
    const float4 c5 = float4(-59.00000000, 65.00000000, 0.01886792481, -53.00000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;
    FragmentOut output;

    r0.xy = texCoord0.xy*c0.xy;
    r0.xy = floor(r0.xy);
    r1.w = texCoord0.x*c0.z;
    r2.w = texCoord0.y*c0.w;
    r1.w = floor(r1.w);
    r2.w = floor(r2.w);
    r0.y = r0.y*c1.y + texCoord0.y;
    r0.x = -r0.x*c1.x + texCoord0.x;
    r0.xy = r0.xy - c1.zz;
    r0.xy = r0.xy + c1.ww;
    r0.xy = r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy*hg_Params[0].zw;
    r0.xy = hg_Texture0.sample(hg_Sampler0, r0.xy).xy;
    r2.xy = r0.xy + texCoord0.xy;
    r0.x = dot(r2.xy, c2.xx);
    r0.xy = r2.xy + r0.xx;
    r0.xy = floor(r0.xy);
    r2.z = dot(r0.xy, c2.yy);
    r2.xy = r2.xy - r0.xy;
    r3.zw = r2.xy + r2.zz;
    r0.zw = r0.xy*c2.zz;
    r0.zw = floor(r0.zw);
    r1.xy = -r0.zw*c2.ww + r0.xy;
    r2.x = r3.w - r3.z;
    r0.xy = select(c3.yx, c3.xy, r2.xx < 0.00000f);
    r4.y = r0.y;
    r4.xz = c3.yx;
    r4.xyz = r1.yyy + r4.xyz;
    r2.xyz = r4.xyz*c3.zzz + c3.xxx;
    r4.xyz = r2.xyz*r4.xyz;
    r2.xyz = r4.xyz*c2.zzz;
    r2.xyz = floor(r2.xyz);
    r4.xyz = -r2.xyz*c2.www + r4.xyz;
    r2.xyz = r4.xyz + r1.xxx;
    r4.y = r0.x;
    r4.xz = c3.yx;
    r4.xyz = r2.xyz + r4.xyz;
    r2.xyz = r4.xyz*c3.zzz + c3.xxx;
    r4.xyz = r2.xyz*r4.xyz;
    r2.xyz = r4.xyz*c2.zzz;
    r2.xyz = floor(r2.xyz);
    r4.xyz = -r2.xyz*c2.www + r4.xyz;
    r4.xyz = r4.xyz*c0.yyy;
    r4.xyz = fract(r4.xyz);
    r4.xyz = r4.xyz + r4.xyz;
    r2.xyz = r4.xyz - c3.xxx;
    r4.xyz = r4.xyz - c1.www;
    r4.xyz = floor(r4.xyz);
    r1.xyz = fabs(r2.xyz) - c1.www;
    r2.xyz = r2.xyz - r4.xyz;
    r4.xyz = r1.xyz*r1.xyz;
    r4.xyz = r2.xyz*r2.xyz + r4.xyz;
    r4.xyz = -r4.xyz*c3.www + c4.xxx;
    r5 = r3.zwzw + c4.yyzz;
    r5.xy = r5.xy - r0.xy;
    r0.y = r1.w*c4.w + texCoord0.x;
    r1.zw = r1.yz*r5.yw;
    r0.x = r2.w*c5.x + texCoord0.y;
    r0.zw = r0.xy - c1.zz;
    r0.xy = r5.xy*r5.xy;
    r0.zw = floor(r0.zw);
    r6.xy = r0.zw + c1.ww;
    r6.xy = r6.xy + hg_Params[0].xy;
    r6.xy = r6.xy*hg_Params[0].zw;
    r6.xy = hg_Texture0.sample(hg_Sampler0, r6.xy).xy;
    r3.xy = texCoord0.xy + r6.xy;
    r2.w = dot(r3.xy, c2.xx);
    r6.xy = r3.xy + r2.ww;
    r2.yz = r2.yz*r5.xz + r1.zw;
    r6.zw = floor(r6.xy);
    r0.zw = r3.zw*r3.zw;
    r0.xy = r0.zx + r0.wy;
    r0.z = dot(r5.zw, r5.zw);
    r1.w = r3.w*r1.x;
    r0.xyz = c1.www - r0.xyz;
    r0.xyz = fmax(r0.xyz, c3.yyy);
    r0.xyz = r0.xyz*r0.xyz;
    r2.w = dot(r6.zw, c4.yy);
    r5.zw = r3.xy - r6.zw;
    r6.xy = r5.zw + r2.ww;
    r5.xy = r6.zw*c2.zz;
    r5.xy = floor(r5.xy);
    r6.zw = -r5.xy*c2.ww + r6.zw;
    r2.w = r6.y - r6.x;
    r3.xy = select(c3.yx, c3.xy, r2.ww < 0.00000f);
    r0.xyz = r0.xyz*r0.xyz;
    r2.x = r3.z*r2.x + r1.w;
    r0.xyz = r0.xyz*r4.xyz;
    r0.w = dot(r0.xyz, r2.xyz);
    output.color0.x = r0.w*c5.y + c1.w;
    r5.w = texCoord0.x*c5.z;
    r1.y = r3.y;
    r1.xz = c3.yx;
    r1.xyz = r6.www + r1.xyz;
    r4.xyz = r1.xyz*c3.zzz + c3.xxx;
    r1.xyz = r4.xyz*r1.xyz;
    r2.xyz = r1.xyz*c2.zzz;
    r5.xyz = floor(r2.xyz);
    r5.xyz = -r5.xyz*c2.www + r1.xyz;
    r0.xyz = r5.xyz + r6.zzz;
    r5.y = r3.x;
    r5.xz = c3.yx;
    r5.xyz = r0.xyz + r5.xyz;
    r4.xyz = r5.xyz*c3.zzz + c3.xxx;
    r5.xyz = r4.xyz*r5.xyz;
    r2.x = texCoord0.y*c0.x;
    r2.x = floor(r2.x);
    r2.y = -r2.x*c1.x + texCoord0.y;
    r5.w = floor(r5.w);
    r2.x = r5.w*c5.w + texCoord0.x;
    r2.xy = r2.xy - c1.zz;
    r1.xyz = r5.xyz*c2.zzz;
    r1.xyz = floor(r1.xyz);
    r5.xyz = -r1.xyz*c2.www + r5.xyz;
    r5.xyz = r5.xyz*c0.yyy;
    r2.xy = floor(r2.xy);
    r2.xy = r2.xy + c1.ww;
    r2.xy = r2.xy + hg_Params[0].xy;
    r2.xy = r2.xy*hg_Params[0].zw;
    r2.xy = hg_Texture0.sample(hg_Sampler0, r2.xy).xy;
    r2.zw = texCoord0.xy + r2.xy;
    r5.xyz = fract(r5.xyz);
    r5.xyz = r5.xyz + r5.xyz;
    r0.xyz = r5.xyz - c3.xxx;
    r5.xyz = r5.xyz - c1.www;
    r2.x = dot(r2.zw, c2.xx);
    r2.xy = r2.zw + r2.xx;
    r2.xy = floor(r2.xy);
    r5.w = dot(r2.xy, c4.yy);
    r2.zw = r2.zw - r2.xy;
    r6.zw = r2.zw + r5.ww;
    r4.xy = r2.xy*c2.zz;
    r2.zw = floor(r4.xy);
    r2.xy = -r2.zw*c2.ww + r2.xy;
    r5.w = r6.w - r6.z;
    r1.xy = select(c3.yx, c3.xy, r5.ww < 0.00000f);
    r5.xyz = floor(r5.xyz);
    r5.xyz = r0.xyz - r5.xyz;
    r0.xyz = fabs(r0.xyz) - c1.www;
    r4.xz = c3.yx;
    r4.y = r1.y;
    r4.xyz = r2.yyy + r4.xyz;
    r7.xyz = r4.xyz*c3.zzz + c3.xxx;
    r7.xyz = r7.xyz*r4.xyz;
    r4.xyz = r0.xyz*r0.xyz;
    r4.xyz = r5.xyz*r5.xyz + r4.xyz;
    r8.xyz = r7.xyz*c2.zzz;
    r8.xyz = floor(r8.xyz);
    r8.xyz = -r8.xyz*c2.www + r7.xyz;
    r4.xyz = -r4.xyz*c3.www + c4.xxx;
    r8.xyz = r8.xyz + r2.xxx;
    r7.xz = c3.yx;
    r7.y = r1.x;
    r8.xyz = r8.xyz + r7.xyz;
    r2 = r6.xyxy + c4.yyzz;
    r2.xy = r2.xy - r3.xy;
    r0.zw = r0.yz*r2.yw;
    r7.xyz = r8.xyz*c3.zzz + c3.xxx;
    r7.xyz = r7.xyz*r8.xyz;
    r3.zw = r2.zw*r2.zw;
    r2.w = r6.y*r0.x;
    r3.y = dot(r2.xy, r2.xy);
    r3.x = dot(r6.xy, r6.xy);
    r8.xyz = r7.xyz*c2.zzz;
    r3.z = dot(r3.zw, 1.00000f);
    r3.xyz = c1.www - r3.xyz;
    r3.xyz = fmax(r3.xyz, c3.yyy);
    r8.xyz = floor(r8.xyz);
    r3.xyz = r3.xyz*r3.xyz;
    r3.xyz = r3.xyz*r3.xyz;
    r5.yz = r5.yz*r2.xz + r0.zw;
    r5.x = r6.x*r5.x + r2.w;
    r4.xyz = r3.xyz*r4.xyz;
    r4.w = dot(r4.xyz, r5.xyz);
    r7.xyz = -r8.xyz*c2.www + r7.xyz;
    r7.xyz = r7.xyz*c0.yyy;
    r7.xyz = fract(r7.xyz);
    r7.xyz = r7.xyz + r7.xyz;
    r0.xyz = r7.xyz - c3.xxx;
    r4.xyz = r7.xyz - c1.www;
    r2.xyz = fabs(r0.xyz) - c1.www;
    r4.xyz = floor(r4.xyz);
    r4.xyz = r0.xyz - r4.xyz;
    r3 = r6.zwzw + c4.yyzz;
    r1.xy = r3.xy - r1.xy;
    r5.y = dot(r1.xy, r1.xy);
    r5.x = dot(r6.zw, r6.zw);
    r1.zw = r3.zw;
    r5.z = dot(r3.zw, r3.zw);
    r8.xy = r2.yz*r1.yw;
    r7.xyz = r2.xyz*r2.xyz;
    r7.xyz = r4.xyz*r4.xyz + r7.xyz;
    r5.xyz = c1.www - r5.xyz;
    r5.xyz = fmax(r5.xyz, c3.yyy);
    r5.xyz = r5.xyz*r5.xyz;
    r8.z = r6.w*r2.x;
    r1.y = r4.w*c5.y;
    r7.xyz = -r7.xyz*c3.www + c4.xxx;
    r5.xyz = r5.xyz*r5.xyz;
    r5.xyz = r5.xyz*r7.xyz;
    r4.x = r6.z*r4.x + r8.z;
    r4.yz = r4.yz*r1.xz + r8.xy;
    r1.x = dot(r5.xyz, r4.xyz);
    r1.x = r1.x*c5.y;
    output.color0.yz = r1.yx + c1.ww;
    output.color0.w = c3.x;
    return output;
}
```

### CPU parameter wiring — `-[PAENoise canThrowRenderOutput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAENoise`

```asm
00000000000c2990	mov	w3, #0x1
00000000000c2994	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000c2998	mov	x0, x28
00000000000c299c	bl	_objc_msgSend$imageType
00000000000c29a0	mov	x22, x0
00000000000c29a4	ldr	x2, [x20]
00000000000c29a8	mov	x0, x19
00000000000c29ac	bl	"_objc_msgSend$getRenderMode:"
00000000000c29b0	cmp	w0, #0x0
00000000000c29b4	ccmp	x22, #0x3, #0x0, ne
00000000000c29b8	cset	w27, eq
00000000000c29bc	b.ne	0xc2ca8
00000000000c29c0	adrp	x8, 425 ; 0x26b000
00000000000c29c4	add	x8, x8, #0x868
00000000000c29c8	ldr	w8, [x8]
00000000000c29cc	add	w8, w8, w8, lsr #31
00000000000c29d0	adrp	x9, 425 ; 0x26b000
00000000000c29d4	add	x9, x9, #0x86c
00000000000c29d8	neg	w0, w8, asr #1
00000000000c29dc	ldr	w9, [x9]
00000000000c29e0	add	w9, w9, w9, lsr #31
00000000000c29e4	neg	w1, w9, asr #1
00000000000c29e8	asr	w2, w8, #1
00000000000c29ec	asr	w3, w9, #1
00000000000c29f0	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000c29f4	mov	x22, x0
00000000000c29f8	mov	x23, x1
00000000000c29fc	mov	w0, #0x80
00000000000c2a00	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c2a04	mov	x19, x0
00000000000c2a08	mov	x1, x22
00000000000c2a0c	mov	x2, x23
00000000000c2a10	mov	w3, #0x16
00000000000c2a14	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
00000000000c2a18	cbz	x19, 0xc2a2c
00000000000c2a1c	ldr	x8, [x19]
00000000000c2a20	ldr	x8, [x8, #0x10]
00000000000c2a24	mov	x0, x19
00000000000c2a28	blr	x8
00000000000c2a2c	ldrsw	x22, [sp, #0x2c]
00000000000c2a30	ldr	x8, [x19, #0x50]
00000000000c2a34	str	x8, [sp, #0x20]
00000000000c2a38	ldp	w24, w20, [x19, #0x1c]
00000000000c2a3c	ldp	w25, w21, [x19, #0x14]
00000000000c2a40	ldr	w26, [x19, #0x40]
00000000000c2a44	add	x0, sp, #0x30
00000000000c2a48	bl	0x2510b4 ; symbol stub for: __ZN12RandMersenneC1Ev
00000000000c2a4c	add	x0, sp, #0x30
00000000000c2a50	mov	x1, x22
00000000000c2a54	bl	0x2510a8 ; symbol stub for: __ZN12RandMersenne7SetSeedEm
00000000000c2a58	cmp	w20, w21
00000000000c2a5c	b.ne	0xc2a74
00000000000c2a60	add	x0, sp, #0x30
00000000000c2a64	bl	0x2510c0 ; symbol stub for: __ZN12RandMersenneD1Ev
00000000000c2a68	b	0xc2b90
00000000000c2a6c	mov	w27, #0x0
00000000000c2a70	b	0xc2ca8
00000000000c2a74	str	x28, [sp, #0x8]
00000000000c2a78	str	w27, [sp, #0x14]
00000000000c2a7c	str	x19, [sp, #0x18]
00000000000c2a80	mov	w27, #0x0
00000000000c2a84	sub	w19, w24, w25
00000000000c2a88	sub	w20, w20, w21
00000000000c2a8c	add	x8, sp, #0x30
00000000000c2a90	add	x22, x8, #0x8
00000000000c2a94	fmov	d8, #-1.00000000
00000000000c2a98	adrp	x8, 423 ; 0x269000
00000000000c2a9c	ldr	d9, [x8, #0xd60]
00000000000c2aa0	mov	w21, #0xff
00000000000c2aa4	cmp	w24, w25
00000000000c2aa8	b.eq	0xc2b6c
00000000000c2aac	mul	w8, w27, w26
00000000000c2ab0	ldr	x9, [sp, #0x20]
00000000000c2ab4	add	x23, x9, w8, sxtw
00000000000c2ab8	ldr	w8, [sp, #0xc38]
00000000000c2abc	mov	x28, x19
00000000000c2ac0	cmp	w8, #0x17d
00000000000c2ac4	b.le	0xc2ad4
00000000000c2ac8	mov	x0, x22
00000000000c2acc	bl	0x252170 ; symbol stub for: _dsfmt_gen_rand_all
00000000000c2ad0	mov	w8, #0x0
00000000000c2ad4	sxtw	x9, w8
00000000000c2ad8	add	x10, x9, #0x1
00000000000c2adc	str	w10, [sp, #0xc38]
00000000000c2ae0	ldr	d10, [x22, w8, sxtw #3]
00000000000c2ae4	cmp	w8, #0x17d
00000000000c2ae8	b.lt	0xc2b00
00000000000c2aec	mov	x0, x22
00000000000c2af0	bl	0x252170 ; symbol stub for: _dsfmt_gen_rand_all
00000000000c2af4	mov	w9, #0x1
00000000000c2af8	ldr	d11, [sp, #0x38]
00000000000c2afc	b	0xc2b20
00000000000c2b00	add	w9, w8, #0x2
00000000000c2b04	str	w9, [sp, #0xc38]
00000000000c2b08	ldr	d11, [x22, x10, lsl #3]
00000000000c2b0c	cmp	w8, #0x17c
00000000000c2b10	b.ne	0xc2b20
00000000000c2b14	mov	x0, x22
00000000000c2b18	bl	0x252170 ; symbol stub for: _dsfmt_gen_rand_all
00000000000c2b1c	mov	w9, #0x0
00000000000c2b20	fadd	d0, d10, d8
00000000000c2b24	fmul	d0, d0, d9
00000000000c2b28	fcvtzs	w10, d0
00000000000c2b2c	fadd	d0, d11, d8
00000000000c2b30	add	w8, w9, #0x1
00000000000c2b34	str	w8, [sp, #0xc38]
00000000000c2b38	ldr	d1, [x22, w9, sxtw #3]
00000000000c2b3c	fadd	d1, d1, d8
00000000000c2b40	fmul	d0, d0, d9
00000000000c2b44	fcvtzs	w9, d0
00000000000c2b48	fmul	d0, d1, d9
00000000000c2b4c	fcvtzs	w11, d0
00000000000c2b50	strb	w21, [x23]
00000000000c2b54	strb	w10, [x23, #0x1]
00000000000c2b58	strb	w9, [x23, #0x2]
00000000000c2b5c	strb	w11, [x23, #0x3]
00000000000c2b60	add	x23, x23, #0x4
00000000000c2b64	subs	w28, w28, #0x1
00000000000c2b68	b.ne	0xc2ac0
00000000000c2b6c	add	w27, w27, #0x1
00000000000c2b70	cmp	w27, w20
00000000000c2b74	b.ne	0xc2aa4
00000000000c2b78	add	x0, sp, #0x30
00000000000c2b7c	bl	0x2510c0 ; symbol stub for: __ZN12RandMersenneD1Ev
00000000000c2b80	ldr	x19, [sp, #0x18]
00000000000c2b84	ldr	w27, [sp, #0x14]
00000000000c2b88	ldr	x28, [sp, #0x8]
00000000000c2b8c	cbz	x19, 0xc2ba0
00000000000c2b90	ldr	x8, [x19]
00000000000c2b94	ldr	x8, [x8, #0x18]
00000000000c2b98	mov	x0, x19
00000000000c2b9c	blr	x8
00000000000c2ba0	mov	w0, #0x1f0
00000000000c2ba4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c2ba8	mov	x22, x0
00000000000c2bac	mov	x1, x19
00000000000c2bb0	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
00000000000c2bb4	mov	w0, #0x1b0
00000000000c2bb8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c2bbc	mov	x23, x0
00000000000c2bc0	bl	__ZN8HgcNoiseC2Ev
00000000000c2bc4	adrp	x8, 732 ; 0x39e000
00000000000c2bc8	add	x8, x8, #0xc00
00000000000c2bcc	add	x9, x8, #0x10
00000000000c2bd0	str	x9, [x23]
00000000000c2bd4	stp	xzr, xzr, [x23, #0x1a0]
00000000000c2bd8	ldr	x8, [x8, #0x88]
00000000000c2bdc	mov	x0, x23
00000000000c2be0	mov	w1, #0x0
00000000000c2be4	mov	x2, x22
00000000000c2be8	blr	x8
00000000000c2bec	mov	x0, x28
00000000000c2bf0	bl	_objc_msgSend$width
00000000000c2bf4	mov	x24, x0
00000000000c2bf8	mov	x0, x28
00000000000c2bfc	bl	_objc_msgSend$height
00000000000c2c00	mov	x25, x0
00000000000c2c04	mov	x0, x28
00000000000c2c08	bl	_objc_msgSend$width
00000000000c2c0c	mov	x26, x0
00000000000c2c10	mov	x0, x28
00000000000c2c14	bl	_objc_msgSend$height
00000000000c2c18	ucvtf	d0, x24
00000000000c2c1c	fmov	d1, #-0.50000000
00000000000c2c20	ucvtf	d2, x25
00000000000c2c24	fmul	d0, d0, d1
00000000000c2c28	fmul	d1, d2, d1
00000000000c2c2c	ucvtf	d2, x26, #0x1
00000000000c2c30	ucvtf	d3, x0
00000000000c2c34	mov	x0, x23
00000000000c2c38	bl	__ZN6HNoise7SetRectEdddd
00000000000c2c3c	str	x23, [sp, #0x30]
00000000000c2c40	ldr	x8, [x23]
00000000000c2c44	ldr	x8, [x8, #0x10]
00000000000c2c48	mov	x0, x23
00000000000c2c4c	blr	x8
00000000000c2c50	add	x2, sp, #0x30
00000000000c2c54	mov	x0, x28
00000000000c2c58	bl	"_objc_msgSend$setHeliumRef:"
00000000000c2c5c	ldr	x0, [sp, #0x30]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : IntSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (int)

```
