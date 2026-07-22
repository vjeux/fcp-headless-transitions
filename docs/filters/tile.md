# Tile

- **PAE class:** `Tile`
- **Plugin UUID:** `1EFA89E8-CFDA-4D08-B833-33F01A4B9139`
- **Node names in corpus:** Tile (21)
- **Corpus usage:** 16 files, 21 instances

## What it does

Tile repeats the image in a grid of copies filling the frame. Scale sets how many tiles (how small each copy), Stretch the aspect of each tile, Skew/Angle shear or rotate the tiling, and Center anchors the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Tile" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor point of the tiling grid (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Skew | float | 0 | 0 .. 0 | Shears the tile grid. Continuous float (default 0). |
| Scale | enum(int) | 3 | 1 .. 10 | Tiling density (number/size of tiles), 1-10 (default 3). *(keyframed in 4 instances)* |
| Stretch | float | 1 | 0.1 .. 1 | Aspect stretch of each tile, 0.1-1 (default 1). |
| Angle | float (radians) | 0 | 0 .. 0 | Rotation of the tiling grid, radians (default 0). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcParallelogramTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcParallelogramTile` → [`HgcParallelogramTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcParallelogramTile.metal)

```metal
//Metal1.0     
//LEN=0000000325
[[ visible ]] FragmentOut HgcParallelogramTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.y = dot(r0.xyw, hg_Params[1].xyz);
    r1.x = dot(r0.xyw, hg_Params[0].xyz);
    r1.xy = fract(r1.xy);
    r0.xy = c0.ww - r1.xy;
    r1.xy = fmin(r1.xy, r0.xy);
    r1.w = c0.w;
    r0.y = dot(r1.xyw, hg_Params[3].xyz);
    r0.x = dot(r1.xyw, hg_Params[2].xyz);
    r0.xy = r0.xy + hg_Params[4].xy;
    r0.xy = r0.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEParallelogramTile canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEParallelogramTile`

```asm
00000000000be7f0	mov	w4, #0x1
00000000000be7f4	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000be7f8	add	x8, sp, #0x28
00000000000be7fc	add	x2, sp, #0xc0
00000000000be800	mov	x0, x22
00000000000be804	mov	x3, x21
00000000000be808	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000000be80c	ldur	q0, [sp, #0x28]
00000000000be810	str	q0, [sp, #0xc0]
00000000000be814	str	xzr, [sp, #0xb8]
00000000000be818	ldr	x4, [x23]
00000000000be81c	add	x2, sp, #0xb8
00000000000be820	mov	x0, x24
00000000000be824	mov	w3, #0x2
00000000000be828	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000be82c	ldr	d0, [sp, #0xb8]
00000000000be830	fneg	d0, d0
00000000000be834	str	d0, [sp, #0xb8]
00000000000be838	mov	x8, #0x2d18
00000000000be83c	movk	x8, #0x5444, lsl #16
00000000000be840	movk	x8, #0x21fb, lsl #32
00000000000be844	movk	x8, #0x3ff9, lsl #48
00000000000be848	str	x8, [sp, #0xb0]
00000000000be84c	ldr	x4, [x23]
00000000000be850	add	x2, sp, #0xb0
00000000000be854	mov	x0, x24
00000000000be858	mov	w3, #0x3
00000000000be85c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000be860	ldr	d0, [sp, #0xb0]
00000000000be864	adrp	x8, 426 ; 0x268000
00000000000be868	ldr	d8, [x8, #0xd48]
00000000000be86c	mov.16b	v1, v8
00000000000be870	bl	0x2521ac ; symbol stub for: _fmod
00000000000be874	mov.16b	v9, v0
00000000000be878	mov.16b	v1, v8
00000000000be87c	bl	0x2521ac ; symbol stub for: _fmod
00000000000be880	adrp	x8, 427 ; 0x269000
00000000000be884	ldr	d1, [x8, #0x4b0]
00000000000be888	fadd	d2, d9, d1
00000000000be88c	fcmp	d0, d1
00000000000be890	fcsel	d0, d2, d9, mi
00000000000be894	fneg	d0, d0
00000000000be898	str	d0, [sp, #0xb0]
00000000000be89c	mov	x8, #0x4059000000000000
00000000000be8a0	str	x8, [sp, #0xa8]
00000000000be8a4	ldr	x4, [x23]
00000000000be8a8	add	x2, sp, #0xa8
00000000000be8ac	mov	x0, x24
00000000000be8b0	mov	w3, #0x4
00000000000be8b4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000be8b8	str	xzr, [sp, #0xe8]
00000000000be8bc	str	xzr, [sp, #0x108]
00000000000be8c0	mov	x8, #0x3ff0000000000000
00000000000be8c4	str	x8, [sp, #0xa0]
00000000000be8c8	str	x8, [sp, #0x78]
00000000000be8cc	stp	xzr, xzr, [sp, #0x38]
00000000000be8d0	movi.2d	v0, #0000000000000000
00000000000be8d4	stur	q0, [sp, #0x58]
00000000000be8d8	stur	q0, [sp, #0x68]
00000000000be8dc	stur	q0, [x26, #0x58]
00000000000be8e0	stur	q0, [x26, #0x68]
00000000000be8e4	ldr	d10, [sp, #0xb8]
00000000000be8e8	mov.16b	v0, v10
00000000000be8ec	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000be8f0	mov.16b	v8, v0
00000000000be8f4	mov.16b	v9, v1
00000000000be8f8	str	d1, [sp, #0x28]
00000000000be8fc	str	d0, [sp, #0x48]
00000000000be900	ldr	d0, [sp, #0xb0]
00000000000be904	fadd	d0, d10, d0
00000000000be908	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000be90c	str	d1, [sp, #0x30]
00000000000be910	str	d0, [sp, #0x50]
00000000000be914	ldr	d2, [sp, #0xa8]
00000000000be918	fadd	d2, d2, d2
00000000000be91c	fmov	d3, #1.00000000
00000000000be920	fcmp	d2, d3
00000000000be924	b.eq	0xbe958
00000000000be928	fmul	d3, d9, d2
00000000000be92c	fmul	d1, d1, d2
00000000000be930	stp	d3, d1, [sp, #0x28]
00000000000be934	movi.2d	v1, #0000000000000000
00000000000be938	fmul	d1, d2, d1
00000000000be93c	stp	d1, d1, [sp, #0x38]
00000000000be940	fmul	d3, d8, d2
00000000000be944	fmul	d0, d0, d2
00000000000be948	stp	d3, d0, [sp, #0x48]
00000000000be94c	stp	d1, d1, [sp, #0x58]
00000000000be950	stp	d1, d1, [sp, #0x68]
00000000000be954	stp	d2, d1, [sp, #0x78]
00000000000be958	add	x0, sp, #0x28
00000000000be95c	add	x1, sp, #0xd0
00000000000be960	bl	__ZN14PCMatrix44TmplIdE9rightMultERKS0_
00000000000be964	ldp	d0, d1, [sp, #0xc0]
00000000000be968	add	x0, sp, #0x28
00000000000be96c	movi.2d	v2, #0000000000000000
00000000000be970	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000000be974	cbz	x21, 0xbe988
00000000000be978	add	x8, sp, #0x20
00000000000be97c	mov	x0, x21
00000000000be980	bl	_objc_msgSend$heliumRef
00000000000be984	b	0xbe98c
00000000000be988	str	xzr, [sp, #0x20]
00000000000be98c	mov	w0, #0x2b0
00000000000be990	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000be994	mov	x23, x0
00000000000be998	bl	__ZN18HParallelogramTileC2Ev
00000000000be99c	add	x1, sp, #0x28
00000000000be9a0	mov	x0, x23
00000000000be9a4	bl	__ZN18HParallelogramTile9setMatrixERK14PCMatrix44TmplIdE
00000000000be9a8	mov	x8, sp
00000000000be9ac	mov	x0, x22
00000000000be9b0	mov	x2, x21
00000000000be9b4	mov	x3, x20
00000000000be9b8	bl	"_objc_msgSend$getCropRectFromImage:toImage:"
00000000000be9bc	ldr	q0, [sp]
00000000000be9c0	fcvtzs.4s	v0, v0
00000000000be9c4	str	q0, [sp, #0x10]
00000000000be9c8	add	x1, sp, #0x10
00000000000be9cc	mov	x0, x23
00000000000be9d0	bl	__ZN18HParallelogramTile7setRectERK6PCRectIiE
00000000000be9d4	ldr	x2, [sp, #0x20]
00000000000be9d8	ldr	x8, [x23]
00000000000be9dc	ldr	x8, [x8, #0x78]
00000000000be9e0	mov	x0, x23
00000000000be9e4	mov	w1, #0x0
00000000000be9e8	blr	x8
00000000000be9ec	str	x23, [sp, #0x10]
00000000000be9f0	ldr	x8, [x23]
00000000000be9f4	ldr	x8, [x8, #0x10]
00000000000be9f8	mov	x0, x23
00000000000be9fc	blr	x8
00000000000bea00	add	x2, sp, #0x10
00000000000bea04	mov	x0, x20
00000000000bea08	bl	"_objc_msgSend$setHeliumRef:"
00000000000bea0c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

```
