# OpenEXR Tone Map

- **PAE class:** `OpenEXR Tone Map`
- **Plugin UUID:** `ECA5A044-91D9-46F2-B03A-A4D411EA1D16`
- **Node names in corpus:** OpenEXR Tone Map (45), OpenEXR Tone Map applied (1)
- **Corpus usage:** 16 files, 46 instances

## What it does

OpenEXR Tone Map compresses high-dynamic-range (HDR/EXR) imagery into displayable range using the classic OpenEXR exposure + knee tone-mapping. Exposure applies an overall stop adjustment, Defog subtracts a fog floor, and Knee Low/High define the shoulder where highlights are rolled off gracefully.

> **Note.** Not implemented; description is the standard OpenEXR exposure/knee tone-map (as exposed by Apple Motion).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Exposure | float (stops) | 0 | -10 .. 2.5 | Overall exposure adjustment in stops, ~-10..2.5 (default 0). |
| Defog | float | 0 | 0 .. 0 | Subtracts a small fog/veiling-glare floor before mapping. Continuous. |
| Knee Low | float | 0 | 0.3 .. 3 | Lower knee point where highlight roll-off begins, ~0.3-3 (default 0). |
| Knee High | float | 5 | 3.5 .. 7.5 | Upper knee point controlling how hard highlights compress, ~3.5-7.5 (default 5). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcOpenEXR`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcOpenEXR` → [`HgcOpenEXR.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcOpenEXR.metal)

```metal
//Metal1.0     
//LEN=000000038e
[[ visible ]] FragmentOut HgcOpenEXR_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz - hg_Params[1].xyz;
    r1.xyz = fmax(c0.xxx, r1.xyz);
    r1.xyz = r1.xyz*hg_Params[0].xyz;
    r2.xyz = r1.xyz - hg_Params[4].xyz;
    r2.xyz = r2.xyz*hg_Params[5].xxx + c0.yyy;
    r2.xyz = log2(r2.xyz);
    r2.xyz = r2.xyz*hg_Params[5].yyy + hg_Params[4].xyz;
    r3.xyz = float3(hg_Params[4].xyz < r1.xyz);
    r1.xyz = select(r1.xyz, r2.xyz, -r3.xyz < 0.00000f);
    r1.xyz = fmax(c0.xxx, r1.xyz);
    r1.xyz = pow(r1.xyz, hg_Params[2].xyz);
    r1.xyz = r1.xyz*hg_Params[3].xyz;
    output.color0.xyz = select(r1.xyz, r0.xyz, r0.xyz < 0.00000f);
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcPremultiply`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPremultiply` → [`HgcPremultiply.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPremultiply.metal)

```metal
//Metal1.0     
//LEN=000000010f
[[ visible ]] FragmentOut HgcPremultiply_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### Metal fragment shader — `HgcUnpremultiply`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcUnpremultiply` → [`HgcUnpremultiply.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcUnpremultiply.metal)

```metal
//Metal1.0     
//LEN=000000011e
[[ visible ]] FragmentOut HgcUnpremultiply_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    output.color0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    return output;
}
```

### CPU parameter wiring — `-[PAEOpenEXRToneMap canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEOpenEXRToneMap`

```asm
000000000012501c	mov	w3, #0x1
0000000000125020	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000125024	ldr	x4, [x21]
0000000000125028	add	x2, sp, #0x20
000000000012502c	mov	x0, x23
0000000000125030	mov	w3, #0x2
0000000000125034	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000125038	ldr	x4, [x21]
000000000012503c	add	x2, sp, #0x18
0000000000125040	mov	x0, x23
0000000000125044	mov	w3, #0x3
0000000000125048	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012504c	ldr	x4, [x21]
0000000000125050	add	x2, sp, #0x10
0000000000125054	mov	x0, x23
0000000000125058	mov	w3, #0x4
000000000012505c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000125060	ldr	x2, [x21]
0000000000125064	mov	x0, x22
0000000000125068	bl	"_objc_msgSend$getRenderMode:"
000000000012506c	mov	x21, x0
0000000000125070	mov	x0, x19
0000000000125074	bl	_objc_msgSend$imageType
0000000000125078	cmp	w21, #0x0
000000000012507c	ccmp	x0, #0x3, #0x0, ne
0000000000125080	cset	w21, eq
0000000000125084	b.ne	0x1251cc
0000000000125088	cbz	x19, 0x1250a4
000000000012508c	add	x8, sp, #0x8
0000000000125090	mov	x0, x19
0000000000125094	bl	_objc_msgSend$heliumRef
0000000000125098	b	0x1250a8
000000000012509c	mov	w21, #0x0
00000000001250a0	b	0x1251cc
00000000001250a4	str	xzr, [sp, #0x8]
00000000001250a8	mov	w0, #0x1a0
00000000001250ac	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000001250b0	mov	x19, x0
00000000001250b4	bl	0x251300 ; symbol stub for: __ZN15HGUnpremultiplyC1Ev
00000000001250b8	ldr	x2, [sp, #0x8]
00000000001250bc	ldr	x8, [x19]
00000000001250c0	ldr	x8, [x8, #0x78]
00000000001250c4	mov	x0, x19
00000000001250c8	mov	w1, #0x0
00000000001250cc	blr	x8
00000000001250d0	ldr	x0, [sp, #0x8]
00000000001250d4	cmp	x0, x19
00000000001250d8	b.eq	0x125100
00000000001250dc	cbz	x0, 0x1250ec
00000000001250e0	ldr	x8, [x0]
00000000001250e4	ldr	x8, [x8, #0x18]
00000000001250e8	blr	x8
00000000001250ec	str	x19, [sp, #0x8]
00000000001250f0	ldr	x8, [x19]
00000000001250f4	ldr	x8, [x8, #0x10]
00000000001250f8	mov	x0, x19
00000000001250fc	blr	x8
0000000000125100	mov	w0, #0x1a0
0000000000125104	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000125108	mov	x22, x0
000000000012510c	bl	0x251c90 ; symbol stub for: __ZN9HGOpenEXRC1Ev
0000000000125110	ldp	d1, d0, [sp, #0x20]
0000000000125114	ldp	d3, d2, [sp, #0x10]
0000000000125118	adrp	x8, 326 ; 0x26b000
000000000012511c	ldr	d4, [x8, #0x878]
0000000000125120	fcmp	d3, d4
0000000000125124	fcsel	d3, d4, d3, mi
0000000000125128	fmov	d4, #1.00000000
000000000012512c	mov	x0, x22
0000000000125130	bl	0x251c84 ; symbol stub for: __ZN9HGOpenEXR19ProcessOpenEXRInputEddddd
0000000000125134	ldr	x2, [sp, #0x8]
0000000000125138	ldr	x8, [x22]
000000000012513c	ldr	x8, [x8, #0x78]
0000000000125140	mov	x0, x22
0000000000125144	mov	w1, #0x0
0000000000125148	blr	x8
000000000012514c	mov	w0, #0x1a0
0000000000125150	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000125154	mov	x23, x0
0000000000125158	bl	0x251174 ; symbol stub for: __ZN13HGPremultiplyC1Ev
000000000012515c	str	x23, [sp]
0000000000125160	ldr	x8, [x23]
0000000000125164	ldr	x8, [x8, #0x78]
0000000000125168	mov	x0, x23
000000000012516c	mov	w1, #0x0
0000000000125170	mov	x2, x22
0000000000125174	blr	x8
0000000000125178	mov	x2, sp
000000000012517c	mov	x0, x20
0000000000125180	bl	"_objc_msgSend$setHeliumRef:"
0000000000125184	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

```
