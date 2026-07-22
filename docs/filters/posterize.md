# Posterize

- **PAE class:** `Posterize`
- **Plugin UUID:** `2AC86D66-BBD2-467B-B257-6C5E182488F4`
- **Node names in corpus:** Posterize (9)
- **Corpus usage:** 2 files, 9 instances

## What it does

Posterize reduces the number of tonal levels per channel, snapping smooth gradients into flat bands for a poster-print look. Levels sets how many steps per channel (fewer = more banding).

> **Note.** Not implemented; description is the standard Apple Motion "Posterize" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Levels | float (int) | 5 | 255 .. 255 | Number of tonal levels per channel (default 5; corpus sampled the internal 255 cap). Fewer = harsher banding. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPosterize`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPosterize` → [`HgcPosterize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPosterize.metal)

```metal
//Metal1.0     
//LEN=0000000235
[[ visible ]] FragmentOut HgcPosterize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r0 = r0*hg_Params[0];
    r0 = floor(r0);
    r1 = hg_Params[0] - c0.xxxx;
    r0 = fmin(r1, r0);
    r0 = fmax(r0, c0.yyyy);
    r0 = r0*hg_Params[1];
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEPosterize canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPosterize`

```asm
00000000000534f4	mov	w3, #0x1
00000000000534f8	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000534fc	ldr	x2, [x22]
0000000000053500	mov	x0, x23
0000000000053504	bl	"_objc_msgSend$getRenderMode:"
0000000000053508	cbz	w0, 0x53624
000000000005350c	mov	x0, x20
0000000000053510	bl	_objc_msgSend$imageType
0000000000053514	cmp	x0, #0x3
0000000000053518	b.ne	0x53624
000000000005351c	cbz	x20, 0x53530
0000000000053520	add	x8, sp, #0x10
0000000000053524	mov	x0, x20
0000000000053528	bl	_objc_msgSend$heliumRef
000000000005352c	b	0x53534
0000000000053530	str	xzr, [sp, #0x10]
0000000000053534	mov	w0, #0x1a0
0000000000053538	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005353c	mov	x20, x0
0000000000053540	bl	__ZN12HgcPosterizeC1Ev
0000000000053544	ldr	x2, [sp, #0x10]
0000000000053548	ldr	x8, [x20]
000000000005354c	ldr	x8, [x8, #0x78]
0000000000053550	mov	x0, x20
0000000000053554	mov	w1, #0x0
0000000000053558	blr	x8
000000000005355c	ldr	w8, [sp, #0x1c]
0000000000053560	cbz	w8, 0x5357c
0000000000053564	sub	w9, w8, #0x1
0000000000053568	scvtf	d0, w9
000000000005356c	fmov	d1, #1.00000000
0000000000053570	fdiv	d0, d1, d0
0000000000053574	fcvt	s8, d0
0000000000053578	b	0x53584
000000000005357c	adrp	x9, 534 ; 0x269000
0000000000053580	ldr	s8, [x9, #0xda0]
0000000000053584	scvtf	s0, w8
0000000000053588	ldr	x8, [x20]
000000000005358c	ldr	x8, [x8, #0x60]
0000000000053590	mov	x0, x20
0000000000053594	mov	w1, #0x0
0000000000053598	mov.16b	v1, v0
000000000005359c	mov.16b	v2, v0
00000000000535a0	mov.16b	v3, v0
00000000000535a4	blr	x8
00000000000535a8	ldr	x8, [x20]
00000000000535ac	ldr	x8, [x8, #0x60]
00000000000535b0	mov	x0, x20
00000000000535b4	mov	w1, #0x1
00000000000535b8	mov.16b	v0, v8
00000000000535bc	mov.16b	v1, v8
00000000000535c0	mov.16b	v2, v8
00000000000535c4	mov.16b	v3, v8
00000000000535c8	blr	x8
00000000000535cc	str	x20, [sp, #0x8]
00000000000535d0	ldr	x8, [x20]
00000000000535d4	ldr	x8, [x8, #0x10]
00000000000535d8	mov	x0, x20
00000000000535dc	blr	x8
00000000000535e0	add	x2, sp, #0x8
00000000000535e4	mov	x0, x21
00000000000535e8	bl	"_objc_msgSend$setHeliumRef:"
00000000000535ec	ldr	x0, [sp, #0x8]
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

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
```
