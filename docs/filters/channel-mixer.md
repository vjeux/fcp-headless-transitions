# Channel Mixer

- **PAE class:** `Channel Mixer`
- **Plugin UUID:** `B2E0DE39-119F-4AD6-8796-C18BF8FE27B8`
- **Node names in corpus:** Channel Mixer (382), Channel Mixer copy (3), mixer-green-blue2green (1), mixer-red (1)
- **Corpus usage:** 102 files, 387 instances

## What it does

Channel Mixer recomputes each output channel as a weighted sum of the input R, G, B (and optionally alpha) channels plus an offset -- a full per-channel linear color matrix. It is used for creative channel swaps, custom monochrome mixes, and color-space corrections. Implemented and RE'd from the HgcChannelMixer shader (a 4-wide dot per channel, un-premultiply then re-premultiply).

> **Note.** RE gap: the '...-Alpha' offset column does not behave as a clean per-channel add in real FCP, but every shipping transition sets those offsets to 0, so the exercised path is exact.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Red Output | group | - | - | Weights that build the output red channel: Red-Red, Red-Green, Red-Blue (channel mix) and Red-Alpha (offset). *(keyframed in 12 instances)* |
| Green Output | group | - | - | Weights that build the output green channel (Green-Red/Green/Blue mix + Green-Alpha offset). *(keyframed in 12 instances)* |
| Blue Output | group | - | - | Weights that build the output blue channel (Blue-Red/Green/Blue mix + Blue-Alpha offset). *(keyframed in 12 instances)* |
| Alpha Output | group | - | - | Weights that build the output alpha channel (only used when Include Alpha is on). *(keyframed in 12 instances)* |
| Monochrome | bool | 0 | 0 .. 1 | Toggle: set all three RGB rows to the same luma weights for a custom grayscale mix. |
| Include Alpha | bool | 0 | 0 .. 1 | Toggle: also mix the alpha channel. |
| Allow Mono > 1 | bool | 1 | 1 .. 1 | Toggle: permit monochrome weights that sum above 1 (brighter gray mix). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the mixed result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcChannelMixer`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcChannelMixer` → [`HgcChannelMixer.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcChannelMixer.metal)

```metal
//Metal1.0     
//LEN=000000021d
[[ visible ]] FragmentOut HgcChannelMixer_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r2.x = clamp(dot(r1, hg_Params[3]), 0.00000f, 1.00000f);
    r3.w = r2.x;
    r3.z = dot(r1, hg_Params[2]);
    r3.x = dot(r1, hg_Params[0]);
    r3.y = dot(r1, hg_Params[1]);
    r3.xyz = r3.xyz*r2.xxx;
    output.color0 = mix(r0, r3, hg_Params[4]);
    return output;
}
```

### CPU parameter wiring — `-[PAEChannelMixer canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEChannelMixer`

```asm
0000000000077348	mov	w3, #0x15
000000000007734c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000077350	ldr	x2, [x21]
0000000000077354	mov	x0, x23
0000000000077358	bl	"_objc_msgSend$mixAmountAtTime:"
000000000007735c	mov.16b	v8, v0
0000000000077360	ldr	x2, [x21]
0000000000077364	mov	x0, x22
0000000000077368	bl	"_objc_msgSend$getRenderMode:"
000000000007736c	cbz	w0, 0x77534
0000000000077370	mov	x0, x20
0000000000077374	bl	_objc_msgSend$imageType
0000000000077378	cmp	x0, #0x3
000000000007737c	b.ne	0x77394
0000000000077380	cbz	x20, 0x7739c
0000000000077384	add	x8, sp, #0x10
0000000000077388	mov	x0, x20
000000000007738c	bl	_objc_msgSend$heliumRef
0000000000077390	b	0x773a0
0000000000077394	mov	w0, #0x0
0000000000077398	b	0x77534
000000000007739c	str	xzr, [sp, #0x10]
00000000000773a0	mov	w0, #0x1a0
00000000000773a4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000773a8	mov	x20, x0
00000000000773ac	bl	__ZN13HChannelMixerC2Ev
00000000000773b0	str	x20, [sp, #0x8]
00000000000773b4	ldr	x2, [sp, #0x10]
00000000000773b8	ldr	x8, [x20]
00000000000773bc	ldr	x8, [x8, #0x78]
00000000000773c0	mov	x0, x20
00000000000773c4	mov	w1, #0x0
00000000000773c8	blr	x8
00000000000773cc	ldp	d1, d0, [x29, #-0x50]
00000000000773d0	fcvt	s0, d0
00000000000773d4	fcvt	s1, d1
00000000000773d8	ldp	d3, d2, [x29, #-0x60]
00000000000773dc	fcvt	s2, d2
00000000000773e0	fcvt	s3, d3
00000000000773e4	ldr	x8, [x20]
00000000000773e8	ldr	x8, [x8, #0x60]
00000000000773ec	mov	x0, x20
00000000000773f0	mov	w1, #0x0
00000000000773f4	blr	x8
00000000000773f8	ldrb	w9, [sp, #0x1f]
00000000000773fc	ldr	x8, [x20]
0000000000077400	ldr	x8, [x8, #0x60]
0000000000077404	tbz	w9, #0x0, 0x77440
0000000000077408	ldp	d1, d0, [x29, #-0x50]
000000000007740c	fcvt	s0, d0
0000000000077410	fcvt	s1, d1
0000000000077414	ldp	d3, d2, [x29, #-0x60]
0000000000077418	fcvt	s2, d2
000000000007741c	fcvt	s3, d3
0000000000077420	mov	x0, x20
0000000000077424	mov	w1, #0x1
0000000000077428	blr	x8
000000000007742c	sub	x8, x29, #0x60
0000000000077430	sub	x9, x29, #0x58
0000000000077434	sub	x10, x29, #0x50
0000000000077438	sub	x11, x29, #0x48
000000000007743c	b	0x77478
0000000000077440	ldur	d0, [x29, #-0x68]
0000000000077444	fcvt	s0, d0
0000000000077448	ldp	d2, d1, [sp, #0x68]
000000000007744c	fcvt	s1, d1
0000000000077450	fcvt	s2, d2
0000000000077454	ldr	d3, [sp, #0x60]
0000000000077458	fcvt	s3, d3
000000000007745c	mov	x0, x20
0000000000077460	mov	w1, #0x1
0000000000077464	blr	x8
0000000000077468	add	x8, sp, #0x40
000000000007746c	add	x9, sp, #0x48
0000000000077470	add	x10, sp, #0x50
0000000000077474	add	x11, sp, #0x58
0000000000077478	ldr	d0, [x11]
000000000007747c	fcvt	s0, d0
0000000000077480	ldr	d1, [x10]
0000000000077484	fcvt	s1, d1
0000000000077488	ldr	d2, [x9]
000000000007748c	fcvt	s2, d2
0000000000077490	ldr	d3, [x8]
0000000000077494	fcvt	s3, d3
0000000000077498	ldr	x8, [x20]
000000000007749c	ldr	x8, [x8, #0x60]
00000000000774a0	mov	x0, x20
00000000000774a4	mov	w1, #0x2
00000000000774a8	blr	x8
00000000000774ac	ldp	d1, d0, [sp, #0x30]
00000000000774b0	fcvt	s0, d0
00000000000774b4	fcvt	s1, d1
00000000000774b8	ldp	d3, d2, [sp, #0x20]
00000000000774bc	fcvt	s2, d2
00000000000774c0	fcvt	s3, d3
00000000000774c4	ldr	x8, [x20]
00000000000774c8	ldr	x8, [x8, #0x60]
00000000000774cc	mov	x0, x20
00000000000774d0	mov	w1, #0x3
00000000000774d4	blr	x8
00000000000774d8	fcvt	s0, d8
00000000000774dc	ldr	x8, [x20]
00000000000774e0	ldr	x8, [x8, #0x60]
00000000000774e4	mov	x0, x20
00000000000774e8	mov	w1, #0x4
00000000000774ec	mov.16b	v1, v0
00000000000774f0	mov.16b	v2, v0
00000000000774f4	mov.16b	v3, v0
00000000000774f8	blr	x8
00000000000774fc	add	x2, sp, #0x8
0000000000077500	mov	x0, x19
0000000000077504	bl	"_objc_msgSend$setHeliumRef:"
0000000000077508	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm21 (bool)
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  host Mix
    slot 1  <-  host Mix
    slot 2  <-  parm21 (bool), host Mix
    slot 3  <-  parm21 (bool), host Mix
    slot 4  <-  host Mix
```
