# Lumakey

- **PAE class:** `Lumakey`
- **Plugin UUID:** `A0CE702C-9875-4C9F-9A9A-F0968C4F4A90`
- **Node names in corpus:** Luma Key (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Lumakey (node name "Luma Key") keys out pixels based on their luminance, making dark (or bright) areas transparent. Key Mode selects whether low or high luma is keyed. This corpus record exposes only Key Mode; it is the simple luminance keyer variant.

> **Note.** Not implemented; description is the standard Apple Motion luma-key behavior. This single-instance record exposes only Key Mode.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Key Mode | enum | 0 | 1 .. 1 | Whether dark or bright luminance is keyed to transparent. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcLumaKey`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcLumaKey` → [`HgcLumaKey.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLumaKey.metal)

```metal
//Metal1.0     
//LEN=00000003f6
[[ visible ]] FragmentOut HgcLumaKey_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xz = float2(dot(r0.xyz, hg_Params[0].xyz));
    r2.x = hg_Params[2].y - hg_Params[2].x;
    r2.xz = 1.00000f / r2.xx;
    r3.xz = r1.xz - hg_Params[2].xx;
    r3.xz = r3.xz*r2.xz;
    r2.xz = float2(r1.xz >= hg_Params[2].xx);
    r2.xz = r2.xz*r3.xz;
    r3.xz = float2(r1.xz >= hg_Params[2].yy);
    r2.x = clamp(r2.x + r3.x, 0.00000f, 1.00000f);
    r2.y = c0.y - r2.x;
    r4.z = c0.y - hg_Params[2].y;
    r4.z = float(r1.z < r4.z);
    r2.z = clamp(r3.z*r4.z + r2.z, 0.00000f, 1.00000f);
    r2.w = c0.y - r2.z;
    r2.w = dot(r2, hg_Params[1]);
    r2.w = r2.w*r0.w;
    output.color0.xyz = r0.xyz*r2.www;
    output.color0.w = r2.w;
    return output;
}
```

### CPU parameter wiring — `-[PAELumaKey canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELumaKey`

```asm
00000000000b6718	mov	w3, #0x1
00000000000b671c	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000b6720	ldr	x4, [x22]
00000000000b6724	add	x2, sp, #0x3c
00000000000b6728	mov	x0, x19
00000000000b672c	mov	w3, #0x2
00000000000b6730	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000b6734	ldr	x4, [x22]
00000000000b6738	add	x2, sp, #0x28
00000000000b673c	mov	x0, x19
00000000000b6740	mov	w3, #0x3
00000000000b6744	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b6748	ldr	x4, [x22]
00000000000b674c	add	x2, sp, #0x30
00000000000b6750	mov	x0, x19
00000000000b6754	mov	w3, #0x4
00000000000b6758	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b675c	ldr	w8, [sp, #0x3c]
00000000000b6760	cmp	w8, #0x6
00000000000b6764	b.hs	0xb6790
00000000000b6768	adrp	x9, 436 ; 0x26a000
00000000000b676c	add	x9, x9, #0x9c8
00000000000b6770	ldr	s8, [x9, x8, lsl #2]
00000000000b6774	adrp	x9, 436 ; 0x26a000
00000000000b6778	add	x9, x9, #0x9e0
00000000000b677c	ldr	s10, [x9, x8, lsl #2]
00000000000b6780	adrp	x9, 436 ; 0x26a000
00000000000b6784	add	x9, x9, #0x9f8
00000000000b6788	ldr	s9, [x9, x8, lsl #2]
00000000000b678c	b	0xb67c8
00000000000b6790	adrp	x8, 476 ; 0x292000
00000000000b6794	add	x10, x8, #0xfc4 ; literal pool for: "Invalid lumType"
00000000000b6798	adrp	x8, 476 ; 0x292000
00000000000b679c	add	x8, x8, #0xf6d ; literal pool for: "/Library/Caches/com.apple.xbs/Sources/Filters/Filters-45000.0.17/Filters/PAELumaKey.mm"
00000000000b67a0	mov	w9, #0xc0
00000000000b67a4	stp	x9, x10, [sp, #0x8]
00000000000b67a8	str	x8, [sp]
00000000000b67ac	adrp	x0, 476 ; 0x292000
00000000000b67b0	add	x0, x0, #0xf3c ; literal pool for: "File %s, line %d should not have been reached:\n\t"
00000000000b67b4	bl	0x250cdc ; symbol stub for: _PCPrint
00000000000b67b8	bl	0x25238c ; symbol stub for: _pcAbortImpl
00000000000b67bc	fmov	s9, #1.00000000
00000000000b67c0	movi.2d	v8, #0000000000000000
00000000000b67c4	movi.2d	v10, #0000000000000000
00000000000b67c8	ldr	x2, [x22]
00000000000b67cc	mov	x0, x23
00000000000b67d0	bl	"_objc_msgSend$getRenderMode:"
00000000000b67d4	cbz	w0, 0xb6920
00000000000b67d8	mov	x0, x21
00000000000b67dc	bl	_objc_msgSend$imageType
00000000000b67e0	cmp	x0, #0x3
00000000000b67e4	b.ne	0xb6920
00000000000b67e8	mov	w0, #0x1a0
00000000000b67ec	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b67f0	mov	x22, x0
00000000000b67f4	bl	__ZN10HgcLumaKeyC1Ev
00000000000b67f8	str	x22, [sp, #0x20]
00000000000b67fc	ldr	w8, [sp, #0x38]
00000000000b6800	ldp	d12, d11, [sp, #0x28]
00000000000b6804	cmp	w8, #0x2
00000000000b6808	fmov	d0, #0.25000000
00000000000b680c	fmov	d1, #0.50000000
00000000000b6810	fcsel	d13, d1, d0, lt
00000000000b6814	ldr	x8, [x22]
00000000000b6818	ldr	x8, [x8, #0x60]
00000000000b681c	movi.2d	v14, #0000000000000000
00000000000b6820	movi.2d	v3, #0000000000000000
00000000000b6824	mov	x0, x22
00000000000b6828	mov	w1, #0x0
00000000000b682c	mov.16b	v0, v8
00000000000b6830	mov.16b	v1, v10
00000000000b6834	mov.16b	v2, v9
00000000000b6838	blr	x8
00000000000b683c	ldr	w8, [sp, #0x38]
00000000000b6840	cmp	w8, #0x1
00000000000b6844	fmov	s3, #1.00000000
00000000000b6848	fcsel	s0, s3, s14, eq
00000000000b684c	cmp	w8, #0x0
00000000000b6850	fcsel	s1, s3, s14, eq
00000000000b6854	cmp	w8, #0x2
00000000000b6858	fcsel	s2, s3, s14, eq
00000000000b685c	cmp	w8, #0x3
00000000000b6860	fcsel	s3, s3, s14, eq
00000000000b6864	ldr	x8, [x22]
00000000000b6868	ldr	x8, [x8, #0x60]
00000000000b686c	mov	x0, x22
00000000000b6870	mov	w1, #0x1
00000000000b6874	blr	x8
00000000000b6878	fmul	d0, d12, d13
00000000000b687c	fadd	d0, d0, d13
00000000000b6880	fabd	d1, d13, d0
00000000000b6884	fsub	d1, d13, d1
00000000000b6888	fmul	d1, d11, d1
00000000000b688c	fsub	d2, d0, d1
00000000000b6890	fadd	d1, d0, d1
00000000000b6894	fcvt	s0, d2
00000000000b6898	fcvt	s1, d1
00000000000b689c	ldr	x8, [x22]
00000000000b68a0	ldr	x8, [x8, #0x60]
00000000000b68a4	movi.2d	v2, #0000000000000000
00000000000b68a8	movi.2d	v3, #0000000000000000
00000000000b68ac	mov	x0, x22
00000000000b68b0	mov	w1, #0x2
00000000000b68b4	blr	x8
00000000000b68b8	cbz	x21, 0xb68d0
00000000000b68bc	add	x8, sp, #0x18
00000000000b68c0	mov	x0, x21
00000000000b68c4	bl	_objc_msgSend$heliumRef
00000000000b68c8	ldr	x2, [sp, #0x18]
00000000000b68cc	b	0xb68d8
00000000000b68d0	mov	x2, #0x0
00000000000b68d4	str	xzr, [sp, #0x18]
00000000000b68d8	ldr	x8, [x22]
00000000000b68dc	ldr	x8, [x8, #0x78]
00000000000b68e0	mov	x0, x22
00000000000b68e4	mov	w1, #0x0
00000000000b68e8	blr	x8
00000000000b68ec	ldr	x0, [sp, #0x18]
00000000000b68f0	cbz	x0, 0xb6900
00000000000b68f4	ldr	x8, [x0]
00000000000b68f8	ldr	x8, [x8, #0x18]
00000000000b68fc	blr	x8
00000000000b6900	add	x2, sp, #0x20
00000000000b6904	mov	x0, x20
00000000000b6908	bl	"_objc_msgSend$setHeliumRef:"
00000000000b690c	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (int)
    - parm2 (int)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm3 (float)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
```
