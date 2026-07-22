# Prism

- **PAE class:** `Prism`
- **Plugin UUID:** `5A913CA7-CA5C-4EB5-951C-DDF4EDEC5B65`
- **Node names in corpus:** Prism (740), Prism copy (34), Prism 1 (13), Prism 2 (11), Prism  (5), Prism In (4)
- **Corpus usage:** 538 files, 829 instances

## What it does

Prism simulates chromatic dispersion: it splits the image into red, green and blue components and offsets them along an axis, as light does passing through a glass prism. The result is colored fringing / rainbow edges scaled by Amount and oriented by Angle. Templates use it for glitchy, refractive, light-bending transition looks.

> **Note.** Not implemented in the TS engine and no checked-in shader; description is from the standard Apple Motion "Prism" filter. The exact per-channel offset geometry (linear vs radial dispersion) is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 7 | 0 .. 950 | Magnitude of the chromatic separation. 0 = no split (identity); larger = wider color fringing. Default 7 to pulse the dispersion. *(keyframed in 227 instances)* |
| Angle | float (radians) | 0 | 0 .. 6.283 | Direction of the RGB dispersion axis, 0..2pi. Rotates which way the red/blue fringes fan out. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the dispersed result over the original, 0-1 continuous. *(keyframed in 252 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `OSC Center`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPrism`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPrism` → [`HgcPrism.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPrism.metal)

```metal
//Metal1.0     
//LEN=00000001d0
[[ visible ]] FragmentOut HgcPrism_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xw = color0.xw;
    r1.yw = color1.yw;
    r2.zw = color2.zw;
    output.color0.x = r0.x;
    output.color0.y = r1.y;
    output.color0.z = r2.z;
    r0.w = fmax(r0.w, r1.w);
    output.color0.w = fmax(r0.w, r2.w);
    return output;
}
```

### CPU parameter wiring — `-[PAEPrism canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPrism`

```asm
00000000000565a8	mov	w3, #0x1
00000000000565ac	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000565b0	ldr	d0, [sp, #0x28]
00000000000565b4	fmov	d1, #0.50000000
00000000000565b8	fmul	d0, d0, d1
00000000000565bc	str	d0, [sp, #0x28]
00000000000565c0	ldr	x4, [x23]
00000000000565c4	add	x2, sp, #0x20
00000000000565c8	mov	x0, x19
00000000000565cc	mov	w3, #0x2
00000000000565d0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000565d4	mov	x0, x21
00000000000565d8	bl	_objc_msgSend$origin
00000000000565dc	cmp	x0, #0x2
00000000000565e0	b.ne	0x565f0
00000000000565e4	ldr	d0, [sp, #0x20]
00000000000565e8	fneg	d0, d0
00000000000565ec	str	d0, [sp, #0x20]
00000000000565f0	ldr	x4, [x23]
00000000000565f4	add	x2, sp, #0x1f
00000000000565f8	mov	x0, x19
00000000000565fc	mov	w3, #0x3
0000000000056600	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000056604	mov	x0, x21
0000000000056608	bl	_objc_msgSend$imageType
000000000005660c	mov	x24, x0
0000000000056610	ldr	x2, [x23]
0000000000056614	mov	x0, x22
0000000000056618	bl	"_objc_msgSend$getRenderMode:"
000000000005661c	cbz	w0, 0x56768
0000000000056620	mov	w8, w24
0000000000056624	cmp	x8, #0x3
0000000000056628	b.ne	0x56768
000000000005662c	ldr	d0, [sp, #0x28]
0000000000056630	fcmp	d0, #0.0
0000000000056634	b.ne	0x5664c
0000000000056638	cbz	x21, 0x56660
000000000005663c	mov	x8, sp
0000000000056640	mov	x0, x21
0000000000056644	bl	_objc_msgSend$heliumRef
0000000000056648	b	0x56664
000000000005664c	cbz	x21, 0x56688
0000000000056650	add	x8, sp, #0x10
0000000000056654	mov	x0, x21
0000000000056658	bl	_objc_msgSend$heliumRef
000000000005665c	b	0x5668c
0000000000056660	str	xzr, [sp]
0000000000056664	mov	x2, sp
0000000000056668	mov	x0, x20
000000000005666c	bl	"_objc_msgSend$setHeliumRef:"
0000000000056670	ldr	x0, [sp]
0000000000056674	cbz	x0, 0x56768
0000000000056678	ldr	x8, [x0]
000000000005667c	ldr	x8, [x8, #0x18]
0000000000056680	blr	x8
0000000000056684	b	0x56768
0000000000056688	str	xzr, [sp, #0x10]
000000000005668c	mov	w0, #0x1b0
0000000000056690	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000056694	mov	x23, x0
0000000000056698	bl	__ZN6HPrismC1Ev
000000000005669c	ldr	d0, [sp, #0x20]
00000000000566a0	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000566a4	ldr	d2, [sp, #0x28]
00000000000566a8	ldr	q3, [sp, #0x30]
00000000000566ac	ldr	q4, [sp, #0x50]
00000000000566b0	zip1.2d	v5, v3, v4
00000000000566b4	fmul.2d	v1, v5, v1[0]
00000000000566b8	zip2.2d	v3, v3, v4
00000000000566bc	fmul.2d	v0, v3, v0[0]
00000000000566c0	fadd.2d	v0, v1, v0
00000000000566c4	fmul.2d	v0, v0, v2[0]
00000000000566c8	str	q0, [sp]
00000000000566cc	mov	x1, sp
00000000000566d0	mov	x0, x23
00000000000566d4	bl	__ZN6HPrism4initERK9PCVector2IdE
00000000000566d8	ldr	x2, [sp, #0x10]
00000000000566dc	ldr	x8, [x23]
00000000000566e0	ldr	x8, [x8, #0x78]
00000000000566e4	mov	x0, x23
00000000000566e8	mov	w1, #0x0
00000000000566ec	blr	x8
00000000000566f0	str	x23, [sp]
00000000000566f4	ldr	x8, [x23]
00000000000566f8	ldr	x8, [x8, #0x10]
00000000000566fc	mov	x0, x23
0000000000056700	blr	x8
0000000000056704	ldrb	w8, [sp, #0x1f]
0000000000056708	cmp	w8, #0x1
000000000005670c	b.ne	0x56724
0000000000056710	mov	x2, sp
0000000000056714	mov	x0, x22
0000000000056718	mov	x3, x21
000000000005671c	mov	x4, x20
0000000000056720	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000056724	mov	x2, sp
0000000000056728	mov	x0, x20
000000000005672c	bl	"_objc_msgSend$setHeliumRef:"
0000000000056730	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (bool)

```
