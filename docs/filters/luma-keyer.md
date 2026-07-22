# Luma Keyer

- **PAE class:** `Luma Keyer`
- **Plugin UUID:** `7E9178C5-7B0F-4B86-884D-FE79F568B6CE`
- **Node names in corpus:** Luma Keyer (57), Luma Keyer copy (22), lk (1), Luma Keyer  (1)
- **Corpus usage:** 65 files, 81 instances

## What it does

Luma Keyer makes pixels transparent based on their luminance: it keeps a band of luma (shadows+mids by default) and keys out the rest via a 4-control-point trapezoid tolerance curve baked into a 256-entry LUT. It is the standard brightness-based matte for luma reveals. Implemented and RE'd from the HgcLumaKeyer LUT shader; the vast majority of its 30 parameters are internal keyer state (matte tools, spill suppression) that the shipping templates leave at defaults.

> **Note.** Of the 30 exposed parameters, only a handful are creative knobs; the rest (MinGreen/MaxGreen/Spill*/Chroma*, Matte Tools sub-params, KeyerIsInitialized, etc.) are internal keyer engine state persisted in the .motr and are left at their defaults by every corpus user. The measured default curve keeps shadows+mids and keys out highlights.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Luma | unknown | - | - | The luma key definition (threshold band / graph). Static keyer blob in the corpus -- both shipping users get the default curve (keep shadows+mids, key out highlights). *(keyframed in 2 instances)* |
| Invert | bool | 0 | 0 .. 1 | Toggle: flip which side of the luma band is kept vs keyed out. |
| Luma Rolloff | float | 0 | 0 .. 1 | Softness of the key edge, 0-1. Higher = a gentler transparency ramp. |
| Preserve RGB | bool | 0 | 0 .. 1 | Toggle: replace only alpha and pass RGB through unchanged (vs also premultiplying). |
| Matte Tools | group | - | - | Post-key matte cleanup group: Edge Distance, Levels, Shrink/Expand, Erode, Fill Holes, Soften. Left at defaults in the corpus. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the keyed result over the original, 0-1 continuous. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/luma-keyer.ts`](../../engine/src/compositor/filters/luma-keyer.ts).

> 24 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcLumaKeyer`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcLumaKeyer` → [`HgcLumaKeyer.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLumaKeyer.metal)

```metal
//Metal1.0     
//LEN=00000002b2
[[ visible ]] FragmentOut HgcLumaKeyer_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.000000000, 255.0000000, 0.5000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.x = color0.x;
    r0.x = fmax(r0.x, c0.x);
    r0.x = fmin(r0.x, hg_Params[2].x);
    r0.x = r0.x*c0.y + c0.z;
    r0.y = c0.z;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    r0.x = hg_Texture1.sample(hg_Sampler1, r0.xy).x;
    output.color0 = clamp(r0.xxxx*hg_Params[1] + hg_Params[0], 0.00000f, 1.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAELumaKeyer canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELumaKeyer`

```asm
000000000005b060	sub	sp, sp, #0x50
000000000005b064	stp	x29, x30, [sp, #0x40]
000000000005b068	add	x29, sp, #0x40
000000000005b06c	ldp	q0, q1, [x4]
000000000005b070	stp	q0, q1, [sp, #0x10]
000000000005b074	ldr	q0, [x4, #0x20]
000000000005b078	str	q0, [sp, #0x30]
000000000005b07c	adrp	x8, 889 ; 0x3d4000
000000000005b080	ldr	x8, [x8, #0x980] ; Objc class ref: bad class ref
000000000005b084	stp	x0, x8, [sp]
000000000005b088	adrp	x8, 1023 ; 0x45a000
000000000005b08c	ldr	x1, [x8, #0xe40]
000000000005b090	mov	x0, sp
000000000005b094	add	x4, sp, #0x10
000000000005b098	bl	0x252308 ; Objc message: _objc_msgSendSuper2
000000000005b09c	ldp	x29, x30, [sp, #0x40]
000000000005b0a0	add	sp, sp, #0x50
000000000005b0a4	ret
```
