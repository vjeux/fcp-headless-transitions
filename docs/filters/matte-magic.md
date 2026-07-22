# Matte Magic

- **PAE class:** `Matte Magic`
- **Plugin UUID:** `01D6BDCE-4E12-11D9-9271-000A95AFC10A`
- **Node names in corpus:** mm (3), Matte Magic copy (2), Matte Magic (2)
- **Corpus usage:** 5 files, 7 instances

## What it does

Matte Magic refines an existing matte/alpha channel: it applies levels, shrink/erode, and feathering to clean up the edges of a key. Shrink/Erode tighten the matte and the Levels group remaps its density. It is a matte-cleanup companion, not a standalone key.

> **Note.** Not implemented; description is the standard Apple Motion "Matte Magic" matte-cleanup filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Levels | group | - | - | Black/white/gamma remap applied to the matte density. |
| Shrink | float | 0 | 0 .. 1.87 | Shrinks the matte inward, 0-~1.9 (default 0). |
| Erode | float | 0 | 0 .. 0.32 | Erodes matte edges, 0-~0.32 (default 0). |
| Feather | float | 0 | 0 .. 0 | Softens the matte edge. Continuous float (default 0). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcConvolvePassMatteMagic`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcConvolvePassMatteMagic` → [`HgcConvolvePassMatteMagic.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePassMatteMagic.metal)

```metal
//Metal1.0     
//LEN=0000002c4e
[[ visible ]] FragmentOut HgcConvolvePassMatteMagic_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19, r20, r21, r22, r23, r24, r25, r26, r27, r28, r29;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r6.xy = texCoord1.xy + hg_Params[6].xy;
    r6.xy = r6.xy + hg_Params[63].xy;
    r6.xy = r6.xy*hg_Params[63].zw;
    r6 = hg_Texture0.sample(hg_Sampler0, r6.xy);
    r7.xy = texCoord1.xy + hg_Params[7].xy;
    r7.xy = r7.xy + hg_Params[63].xy;
    r7.xy = r7.xy*hg_Params[63].zw;
    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);
    r8.xy = texCoord1.xy + hg_Params[8].xy;
    r8.xy = r8.xy + hg_Params[63].xy;
    r8.xy = r8.xy*hg_Params[63].zw;
    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);
    r9.xy = texCoord1.xy + hg_Params[9].xy;
    r9.xy = r9.xy + hg_Params[63].xy;
    r9.xy = r9.xy*hg_Params[63].zw;
    r9 = hg_Texture0.sample(hg_Sampler0, r9.xy);
    r10.xy = texCoord1.xy + hg_Params[10].xy;
    r10.xy = r10.xy + hg_Params[63].xy;
    r10.xy = r10.xy*hg_Params[63].zw;
    r10 = hg_Texture0.sample(hg_Sampler0, r10.xy);
    r11.xy = texCoord1.xy + hg_Params[11].xy;
    r11.xy = r11.xy + hg_Params[63].xy;
    r11.xy = r11.xy*hg_Params[63].zw;
    r11 = hg_Texture0.sample(hg_Sampler0, r11.xy);
    r12.xy = texCoord1.xy + hg_Params[12].xy;
    r12.xy = r12.xy + hg_Params[63].xy;
    r12.xy = r12.xy*hg_Params[63].zw;
    r12 = hg_Texture0.sample(hg_Sampler0, r12.xy);
    r13.xy = texCoord1.xy + hg_Params[13].xy;
    r13.xy = r13.xy + hg_Params[63].xy;
    r13.xy = r13.xy*hg_Params[63].zw;
    r13 = hg_Texture0.sample(hg_Sampler0, r13.xy);
    r14.xy = texCoord1.xy + hg_Params[14].xy;
    r14.xy = r14.xy + hg_Params[63].xy;
    r14.xy = r14.xy*hg_Params[63].zw;
    r14 = hg_Texture0.sample(hg_Sampler0, r14.xy);
    r15.xy = texCoord1.xy + hg_Params[15].xy;
    r15.xy = r15.xy + hg_Params[63].xy;
    r15.xy = r15.xy*hg_Params[63].zw;
    r15 = hg_Texture0.sample(hg_Sampler0, r15.xy);
    r16.xy = texCoord1.xy + hg_Params[16].xy;
    r16.xy = r16.xy + hg_Params[63].xy;
    r16.xy = r16.xy*hg_Params[63].zw;
    r16 = hg_Texture0.sample(hg_Sampler0, r16.xy);
    r17.xy = texCoord1.xy + hg_Params[17].xy;
    r17.xy = r17.xy + hg_Params[63].xy;
    r17.xy = r17.xy*hg_Params[63].zw;
    r17 = hg_Texture0.sample(hg_Sampler0, r17.xy);
    r18.xy = texCoord1.xy + hg_Params[18].xy;
    r18.xy = r18.xy + hg_Params[63].xy;
    r18.xy = r18.xy*hg_Params[63].zw;
    r18 = hg_Texture0.sample(hg_Sampler0, r18.xy);
    r19.xy = texCoord1.xy + hg_Params[19].xy;
    r19.xy = r19.xy + hg_Params[63].xy;
    r19.xy = r19.xy*hg_Params[63].zw;
    r19 = hg_Texture0.sample(hg_Sampler0, r19.xy);
    r20.xy = texCoord1.xy + hg_Params[20].xy;
    r20.xy = r20.xy + hg_Params[63].xy;
    r20.xy = r20.xy*hg_Params[63].zw;
    r20 = hg_Texture0.sample(hg_Sampler0, r20.xy);
    r21.xy = texCoord1.xy + hg_Params[21].xy;
    r21.xy = r21.xy + hg_Params[63].xy;
    r21.xy = r21.xy*hg_Params[63].zw;
    r21 = hg_Texture0.sample(hg_Sampler0, r21.xy);
    r22.xy = texCoord1.xy + hg_Params[22].xy;
    r22.xy = r22.xy + hg_Params[63].xy;
    r22.xy = r22.xy*hg_Params[63].zw;
    r22 = hg_Texture0.sample(hg_Sampler0, r22.xy);
    r23.xy = texCoord1.xy + hg_Params[23].xy;
    r23.xy = r23.xy + hg_Params[63].xy;
    r23.xy = r23.xy*hg_Params[63].zw;
    r23 = hg_Texture0.sample(hg_Sampler0, r23.xy);
    r24.xy = texCoord1.xy + hg_Params[24].xy;
    r24.xy = r24.xy + hg_Params[63].xy;
    r24.xy = r24.xy*hg_Params[63].zw;
    r24 = hg_Texture0.sample(hg_Sampler0, r24.xy);
    r25.xy = texCoord1.xy + hg_Params[25].xy;
    r25.xy = r25.xy + hg_Params[63].xy;
    r25.xy = r25.xy*hg_Params[63].zw;
    r25 = hg_Texture0.sample(hg_Sampler0, r25.xy);
    r26.xy = texCoord1.xy + hg_Params[26].xy;
    r26.xy = r26.xy + hg_Params[63].xy;
    r26.xy = r26.xy*hg_Params[63].zw;
    r26 = hg_Texture0.sample(hg_Sampler0, r26.xy);
    r27.xy = texCoord1.xy + hg_Params[27].xy;
    r27.xy = r27.xy + hg_Params[63].xy;
    r27.xy = r27.xy*hg_Params[63].zw;
    r27 = hg_Texture0.sample(hg_Sampler0, r27.xy);
    r28.xy = texCoord1.xy + hg_Params[28].xy;
    r28.xy = r28.xy + hg_Params[63].xy;
    r28.xy = r28.xy*hg_Params[63].zw;
    r28 = hg_Texture0.sample(hg_Sampler0, r28.xy);
    r0 = r0*hg_Params[61] + hg_Params[62];
    r0 = r0*hg_Params[58] + hg_Params[59];
    r29 = r0 - hg_Params[60];
    r0 = select(r0, c0.xxxx, r29 < 0.00000f);
    r1 = r1*hg_Params[61] + hg_Params[62];
    r1 = r1*hg_Params[58] + hg_Params[59];
    r29 = r1 - hg_Params[60];
    r1 = select(r1, c0.xxxx, r29 < 0.00000f);
    r2 = r2*hg_Params[61] + hg_Params[62];
    r2 = r2*hg_Params[58] + hg_Params[59];
    r29 = r2 - hg_Params[60];
    r2 = select(r2, c0.xxxx, r29 < 0.00000f);
    r3 = r3*hg_Params[61] + hg_Params[62];
    r3 = r3*hg_Params[58] + hg_Params[59];
    r29 = r3 - hg_Params[60];
    r3 = select(r3, c0.xxxx, r29 < 0.00000f);
    r4 = r4*hg_Params[61] + hg_Params[62];
    r4 = r4*hg_Params[58] + hg_Params[59];
    r29 = r4 - hg_Params[60];
    r4 = select(r4, c0.xxxx, r29 < 0.00000f);
    r5 = r5*hg_Params[61] + hg_Params[62];
    r5 = r5*hg_Params[58] + hg_Params[59];
    r29 = r5 - hg_Params[60];
    r5 = select(r5, c0.xxxx, r29 < 0.00000f);
    r6 = r6*hg_Params[61] + hg_Params[62];
    r6 = r6*hg_Params[58] + hg_Params[59];
    r29 = r6 - hg_Params[60];
    r6 = select(r6, c0.xxxx, r29 < 0.00000f);
    r7 = r7*hg_Params[61] + hg_Params[62];
    r7 = r7*hg_Params[58] + hg_Params[59];
    r29 = r7 - hg_Params[60];
    r7 = select(r7, c0.xxxx, r29 < 0.00000f);
    r8 = r8*hg_Params[61] + hg_Params[62];
    r8 = r8*hg_Params[58] + hg_Params[59];
    r29 = r8 - hg_Params[60];
    r8 = select(r8, c0.xxxx, r29 < 0.00000f);
    r9 = r9*hg_Params[61] + hg_Params[62];
    r9 = r9*hg_Params[58] + hg_Params[59];
    r29 = r9 - hg_Params[60];
    r9 = select(r9, c0.xxxx, r29 < 0.00000f);
    r10 = r10*hg_Params[61] + hg_Params[62];
    r10 = r10*hg_Params[58] + hg_Params[59];
    r29 = r10 - hg_Params[60];
    r10 = select(r10, c0.xxxx, r29 < 0.00000f);
    r11 = r11*hg_Params[61] + hg_Params[62];
    r11 = r11*hg_Params[58] + hg_Params[59];
    r29 = r11 - hg_Params[60];
    r11 = select(r11, c0.xxxx, r29 < 0.00000f);
    r12 = r12*hg_Params[61] + hg_Params[62];
    r12 = r12*hg_Params[58] + hg_Params[59];
    r29 = r12 - hg_Params[60];
    r12 = select(r12, c0.xxxx, r29 < 0.00000f);
    r13 = r13*hg_Params[61] + hg_Params[62];
    r13 = r13*hg_Params[58] + hg_Params[59];
    r29 = r13 - hg_Params[60];
    r13 = select(r13, c0.xxxx, r29 < 0.00000f);
    r14 = r14*hg_Params[61] + hg_Params[62];
    r14 = r14*hg_Params[58] + hg_Params[59];
    r29 = r14 - hg_Params[60];
    r14 = select(r14, c0.xxxx, r29 < 0.00000f);
    r15 = r15*hg_Params[61] + hg_Params[62];
    r15 = r15*hg_Params[58] + hg_Params[59];
    r29 = r15 - hg_Params[60];
    r15 = select(r15, c0.xxxx, r29 < 0.00000f);
    r16 = r16*hg_Params[61] + hg_Params[62];
    r16 = r16*hg_Params[58] + hg_Params[59];
    r29 = r16 - hg_Params[60];
    r16 = select(r16, c0.xxxx, r29 < 0.00000f);
    r17 = r17*hg_Params[61] + hg_Params[62];
    r17 = r17*hg_Params[58] + hg_Params[59];
    r29 = r17 - hg_Params[60];
    r17 = select(r17, c0.xxxx, r29 < 0.00000f);
    r18 = r18*hg_Params[61] + hg_Params[62];
    r18 = r18*hg_Params[58] + hg_Params[59];
    r29 = r18 - hg_Params[60];
    r18 = select(r18, c0.xxxx, r29 < 0.00000f);
    r19 = r19*hg_Params[61] + hg_Params[62];
    r19 = r19*hg_Params[58] + hg_Params[59];
    r29 = r19 - hg_Params[60];
    r19 = select(r19, c0.xxxx, r29 < 0.00000f);
    r20 = r20*hg_Params[61] + hg_Params[62];
    r20 = r20*hg_Params[58] + hg_Params[59];
    r29 = r20 - hg_Params[60];
    r20 = select(r20, c0.xxxx, r29 < 0.00000f);
    r21 = r21*hg_Params[61] + hg_Params[62];
    r21 = r21*hg_Params[58] + hg_Params[59];
    r29 = r21 - hg_Params[60];
    r21 = select(r21, c0.xxxx, r29 < 0.00000f);
    r22 = r22*hg_Params[61] + hg_Params[62];
    r22 = r22*hg_Params[58] + hg_Params[59];
    r29 = r22 - hg_Params[60];
    r22 = select(r22, c0.xxxx, r29 < 0.00000f);
    r23 = r23*hg_Params[61] + hg_Params[62];
    r23 = r23*hg_Params[58] + hg_Params[59];
    r29 = r23 - hg_Params[60];
    r23 = select(r23, c0.xxxx, r29 < 0.00000f);
    r24 = r24*hg_Params[61] + hg_Params[62];
    r24 = r24*hg_Params[58] + hg_Params[59];
    r29 = r24 - hg_Params[60];
    r24 = select(r24, c0.xxxx, r29 < 0.00000f);
    r25 = r25*hg_Params[61] + hg_Params[62];
    r25 = r25*hg_Params[58] + hg_Params[59];
    r29 = r25 - hg_Params[60];
    r25 = select(r25, c0.xxxx, r29 < 0.00000f);
    r26 = r26*hg_Params[61] + hg_Params[62];
    r26 = r26*hg_Params[58] + hg_Params[59];
    r29 = r26 - hg_Params[60];
    r26 = select(r26, c0.xxxx, r29 < 0.00000f);
    r27 = r27*hg_Params[61] + hg_Params[62];
    r27 = r27*hg_Params[58] + hg_Params[59];
    r29 = r27 - hg_Params[60];
    r27 = select(r27, c0.xxxx, r29 < 0.00000f);
    r28 = r28*hg_Params[61] + hg_Params[62];
    r28 = r28*hg_Params[58] + hg_Params[59];
    r29 = r28 - hg_Params[60];
    r28 = select(r28, c0.xxxx, r29 < 0.00000f);
    r0 = r0 - hg_Params[29];
    r1 = r1 - hg_Params[30];
    r2 = r2 - hg_Params[31];
    r3 = r3 - hg_Params[32];
    r4 = r4 - hg_Params[33];
    r5 = r5 - hg_Params[34];
    r6 = r6 - hg_Params[35];
    r7 = r7 - hg_Params[36];
    r8 = r8 - hg_Params[37];
    r9 = r9 - hg_Params[38];
    r10 = r10 - hg_Params[39];
    r11 = r11 - hg_Params[40];
    r12 = r12 - hg_Params[41];
    r13 = r13 - hg_Params[42];
    r14 = r14 - hg_Params[43];
    r15 = r15 - hg_Params[44];
    r16 = r16 - hg_Params[45];
    r17 = r17 - hg_Params[46];
    r18 = r18 - hg_Params[47];
    r19 = r19 - hg_Params[48];
    r20 = r20 - hg_Params[49];
    r21 = r21 - hg_Params[50];
    r22 = r22 - hg_Params[51];
    r23 = r23 - hg_Params[52];
    r24 = r24 - hg_Params[53];
    r25 = r25 - hg_Params[54];
    r26 = r26 - hg_Params[55];
    r27 = r27 - hg_Params[56];
    r28 = r28 - hg_Params[57];
    r0 = fmax(r0, r1);
    r0 = fmax(r0, r2);
    r0 = fmax(r0, r3);
    r0 = fmax(r0, r4);
    r0 = fmax(r0, r5);
    r0 = fmax(r0, r6);
    r0 = fmax(r0, r7);
    r0 = fmax(r0, r8);
    r0 = fmax(r0, r9);
    r0 = fmax(r0, r10);
    r0 = fmax(r0, r11);
    r0 = fmax(r0, r12);
    r0 = fmax(r0, r13);
    r0 = fmax(r0, r14);
    r0 = fmax(r0, r15);
    r0 = fmax(r0, r16);
    r0 = fmax(r0, r17);
    r0 = fmax(r0, r18);
    r0 = fmax(r0, r19);
    r0 = fmax(r0, r20);
    r0 = fmax(r0, r21);
    r0 = fmax(r0, r22);
    r0 = fmax(r0, r23);
    r0 = fmax(r0, r24);
    r0 = fmax(r0, r25);
    r0 = fmax(r0, r26);
    r0 = fmax(r0, r27);
    output.color0 = fmax(r0, r28);
    return output;
}
```

### Metal fragment shader — `HgcConvolvePassMatteMagicYPass`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcConvolvePassMatteMagicYPass` → [`HgcConvolvePassMatteMagicYPass.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePassMatteMagicYPass.metal)

```metal
//Metal1.0     
//LEN=0000001d5f
[[ visible ]] FragmentOut HgcConvolvePassMatteMagicYPass_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color1,
    float4 texCoord0,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18, r19, r20, r21, r22, r23, r24, r25, r26, r27, r28, r29;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r5.xy = texCoord2.xy + hg_Params[5].xy;
    r5.xy = r5.xy + hg_Params[58].xy;
    r5.xy = r5.xy*hg_Params[58].zw;
    r5 = hg_Texture0.sample(hg_Sampler0, r5.xy);
    r6.xy = texCoord2.xy + hg_Params[6].xy;
    r6.xy = r6.xy + hg_Params[58].xy;
    r6.xy = r6.xy*hg_Params[58].zw;
    r6 = hg_Texture0.sample(hg_Sampler0, r6.xy);
    r7.xy = texCoord2.xy + hg_Params[7].xy;
    r7.xy = r7.xy + hg_Params[58].xy;
    r7.xy = r7.xy*hg_Params[58].zw;
    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);
    r8.xy = texCoord2.xy + hg_Params[8].xy;
    r8.xy = r8.xy + hg_Params[58].xy;
    r8.xy = r8.xy*hg_Params[58].zw;
    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);
    r9.xy = texCoord2.xy + hg_Params[9].xy;
    r9.xy = r9.xy + hg_Params[58].xy;
    r9.xy = r9.xy*hg_Params[58].zw;
    r9 = hg_Texture0.sample(hg_Sampler0, r9.xy);
    r10.xy = texCoord2.xy + hg_Params[10].xy;
    r10.xy = r10.xy + hg_Params[58].xy;
    r10.xy = r10.xy*hg_Params[58].zw;
    r10 = hg_Texture0.sample(hg_Sampler0, r10.xy);
    r11.xy = texCoord2.xy + hg_Params[11].xy;
    r11.xy = r11.xy + hg_Params[58].xy;
    r11.xy = r11.xy*hg_Params[58].zw;
    r11 = hg_Texture0.sample(hg_Sampler0, r11.xy);
    r12.xy = texCoord2.xy + hg_Params[12].xy;
    r12.xy = r12.xy + hg_Params[58].xy;
    r12.xy = r12.xy*hg_Params[58].zw;
    r12 = hg_Texture0.sample(hg_Sampler0, r12.xy);
    r13.xy = texCoord2.xy + hg_Params[13].xy;
    r13.xy = r13.xy + hg_Params[58].xy;
    r13.xy = r13.xy*hg_Params[58].zw;
    r13 = hg_Texture0.sample(hg_Sampler0, r13.xy);
    r14.xy = texCoord2.xy + hg_Params[14].xy;
    r14.xy = r14.xy + hg_Params[58].xy;
    r14.xy = r14.xy*hg_Params[58].zw;
    r14 = hg_Texture0.sample(hg_Sampler0, r14.xy);
    r15.xy = texCoord2.xy + hg_Params[15].xy;
    r15.xy = r15.xy + hg_Params[58].xy;
    r15.xy = r15.xy*hg_Params[58].zw;
    r15 = hg_Texture0.sample(hg_Sampler0, r15.xy);
    r16.xy = texCoord2.xy + hg_Params[16].xy;
    r16.xy = r16.xy + hg_Params[58].xy;
    r16.xy = r16.xy*hg_Params[58].zw;
    r16 = hg_Texture0.sample(hg_Sampler0, r16.xy);
    r17.xy = texCoord2.xy + hg_Params[17].xy;
    r17.xy = r17.xy + hg_Params[58].xy;
    r17.xy = r17.xy*hg_Params[58].zw;
    r17 = hg_Texture0.sample(hg_Sampler0, r17.xy);
    r18.xy = texCoord2.xy + hg_Params[18].xy;
    r18.xy = r18.xy + hg_Params[58].xy;
    r18.xy = r18.xy*hg_Params[58].zw;
    r18 = hg_Texture0.sample(hg_Sampler0, r18.xy);
    r19.xy = texCoord2.xy + hg_Params[19].xy;
    r19.xy = r19.xy + hg_Params[58].xy;
    r19.xy = r19.xy*hg_Params[58].zw;
    r19 = hg_Texture0.sample(hg_Sampler0, r19.xy);
    r20.xy = texCoord2.xy + hg_Params[20].xy;
    r20.xy = r20.xy + hg_Params[58].xy;
    r20.xy = r20.xy*hg_Params[58].zw;
    r20 = hg_Texture0.sample(hg_Sampler0, r20.xy);
    r21.xy = texCoord2.xy + hg_Params[21].xy;
    r21.xy = r21.xy + hg_Params[58].xy;
    r21.xy = r21.xy*hg_Params[58].zw;
    r21 = hg_Texture0.sample(hg_Sampler0, r21.xy);
    r22.xy = texCoord2.xy + hg_Params[22].xy;
    r22.xy = r22.xy + hg_Params[58].xy;
    r22.xy = r22.xy*hg_Params[58].zw;
    r22 = hg_Texture0.sample(hg_Sampler0, r22.xy);
    r23.xy = texCoord2.xy + hg_Params[23].xy;
    r23.xy = r23.xy + hg_Params[58].xy;
    r23.xy = r23.xy*hg_Params[58].zw;
    r23 = hg_Texture0.sample(hg_Sampler0, r23.xy);
    r24.xy = texCoord2.xy + hg_Params[24].xy;
    r24.xy = r24.xy + hg_Params[58].xy;
    r24.xy = r24.xy*hg_Params[58].zw;
    r24 = hg_Texture0.sample(hg_Sampler0, r24.xy);
    r25.xy = texCoord2.xy + hg_Params[25].xy;
    r25.xy = r25.xy + hg_Params[58].xy;
    r25.xy = r25.xy*hg_Params[58].zw;
    r25 = hg_Texture0.sample(hg_Sampler0, r25.xy);
    r26.xy = texCoord2.xy + hg_Params[26].xy;
    r26.xy = r26.xy + hg_Params[58].xy;
    r26.xy = r26.xy*hg_Params[58].zw;
    r26 = hg_Texture0.sample(hg_Sampler0, r26.xy);
    r27.xy = texCoord2.xy + hg_Params[27].xy;
    r27.xy = r27.xy + hg_Params[58].xy;
    r27.xy = r27.xy*hg_Params[58].zw;
    r27 = hg_Texture0.sample(hg_Sampler0, r27.xy);
    r28.xy = texCoord2.xy + hg_Params[28].xy;
    r28.xy = r28.xy + hg_Params[58].xy;
    r28.xy = r28.xy*hg_Params[58].zw;
    r28 = hg_Texture0.sample(hg_Sampler0, r28.xy);
    r29 = color1;
    r0 = c0.xxxx - r0;
    r1 = c0.xxxx - r1;
    r2 = c0.xxxx - r2;
    r3 = c0.xxxx - r3;
    r4 = c0.xxxx - r4;
    r5 = c0.xxxx - r5;
    r6 = c0.xxxx - r6;
    r7 = c0.xxxx - r7;
    r8 = c0.xxxx - r8;
    r9 = c0.xxxx - r9;
    r10 = c0.xxxx - r10;
    r11 = c0.xxxx - r11;
    r12 = c0.xxxx - r12;
    r13 = c0.xxxx - r13;
    r14 = c0.xxxx - r14;
    r15 = c0.xxxx - r15;
    r16 = c0.xxxx - r16;
    r17 = c0.xxxx - r17;
    r18 = c0.xxxx - r18;
    r19 = c0.xxxx - r19;
    r20 = c0.xxxx - r20;
    r21 = c0.xxxx - r21;
    r22 = c0.xxxx - r22;
    r23 = c0.xxxx - r23;
    r24 = c0.xxxx - r24;
    r25 = c0.xxxx - r25;
    r26 = c0.xxxx - r26;
    r27 = c0.xxxx - r27;
    r28 = c0.xxxx - r28;
    r0 = r0*r0 + hg_Params[29];
    r1 = r1*r1 + hg_Params[30];
    r2 = r2*r2 + hg_Params[31];
    r3 = r3*r3 + hg_Params[32];
    r4 = r4*r4 + hg_Params[33];
    r5 = r5*r5 + hg_Params[34];
    r6 = r6*r6 + hg_Params[35];
    r7 = r7*r7 + hg_Params[36];
    r8 = r8*r8 + hg_Params[37];
    r9 = r9*r9 + hg_Params[38];
    r10 = r10*r10 + hg_Params[39];
    r11 = r11*r11 + hg_Params[40];
    r12 = r12*r12 + hg_Params[41];
    r13 = r13*r13 + hg_Params[42];
    r14 = r14*r14 + hg_Params[43];
    r15 = r15*r15 + hg_Params[44];
    r16 = r16*r16 + hg_Params[45];
    r17 = r17*r17 + hg_Params[46];
    r18 = r18*r18 + hg_Params[47];
    r19 = r19*r19 + hg_Params[48];
    r20 = r20*r20 + hg_Params[49];
    r21 = r21*r21 + hg_Params[50];
    r22 = r22*r22 + hg_Params[51];
    r23 = r23*r23 + hg_Params[52];
    r24 = r24*r24 + hg_Params[53];
    r25 = r25*r25 + hg_Params[54];
    r26 = r26*r26 + hg_Params[55];
    r27 = r27*r27 + hg_Params[56];
    r28 = r28*r28 + hg_Params[57];
    r0 = fmin(r0, r1);
    r0 = fmin(r0, r2);
    r0 = fmin(r0, r3);
    r0 = fmin(r0, r4);
    r0 = fmin(r0, r5);
    r0 = fmin(r0, r6);
    r0 = fmin(r0, r7);
    r0 = fmin(r0, r8);
    r0 = fmin(r0, r9);
    r0 = fmin(r0, r10);
    r0 = fmin(r0, r11);
    r0 = fmin(r0, r12);
    r0 = fmin(r0, r13);
    r0 = fmin(r0, r14);
    r0 = fmin(r0, r15);
    r0 = fmin(r0, r16);
    r0 = fmin(r0, r17);
    r0 = fmin(r0, r18);
    r0 = fmin(r0, r19);
    r0 = fmin(r0, r20);
    r0 = fmin(r0, r21);
    r0 = fmin(r0, r22);
    r0 = fmin(r0, r23);
    r0 = fmin(r0, r24);
    r0 = fmin(r0, r25);
    r0 = fmin(r0, r26);
    r0 = fmin(r0, r27);
    r0 = fmin(r0, r28);
    r0 = sqrt(r0);
    r0 = c0.xxxx - r0;
    output.color0 = fmax(r0, r29);
    return output;
}
```

### Metal fragment shader — `HgcCopyAlpha`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcCopyAlpha` → [`HgcCopyAlpha.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcCopyAlpha.metal)

```metal
//Metal1.0     
//LEN=0000000147
[[ visible ]] FragmentOut HgcCopyAlpha_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    output.color0 = select(r0, r1.wwww, hg_Params[0] < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcShrinkAndFeatherMatteMagic`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcShrinkAndFeatherMatteMagic` → [`HgcShrinkAndFeatherMatteMagic.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcShrinkAndFeatherMatteMagic.metal)

```metal
//Metal1.0     
//LEN=0000000250
[[ visible ]] FragmentOut HgcShrinkAndFeatherMatteMagic_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    r1.w = c0.w - r1.w;
    r1.w = r1.w - hg_Params[0].x;
    r1.w = clamp(r1.w*hg_Params[0].y, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    output.color0.xyz = r0.xyz*r1.www;
    output.color0.w = r1.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEMatteMagic canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEMatteMagic`

```asm
00000000000f5d84	mov	w3, #0x1
00000000000f5d88	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f5d8c	ldr	d0, [sp, #0x68]
00000000000f5d90	fmul	d0, d11, d0
00000000000f5d94	str	d0, [sp, #0x68]
00000000000f5d98	ldr	x4, [x24]
00000000000f5d9c	add	x2, sp, #0x60
00000000000f5da0	mov	x0, x22
00000000000f5da4	mov	w3, #0x2
00000000000f5da8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f5dac	ldr	d0, [sp, #0x60]
00000000000f5db0	fmul	d0, d11, d0
00000000000f5db4	str	d0, [sp, #0x60]
00000000000f5db8	ldr	x4, [x24]
00000000000f5dbc	add	x2, sp, #0x58
00000000000f5dc0	mov	x0, x22
00000000000f5dc4	mov	w3, #0x3
00000000000f5dc8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f5dcc	ldr	d0, [sp, #0x58]
00000000000f5dd0	fmul	d0, d11, d0
00000000000f5dd4	str	d0, [sp, #0x58]
00000000000f5dd8	mov	x0, x21
00000000000f5ddc	bl	_objc_msgSend$imageType
00000000000f5de0	mov	x26, x0
00000000000f5de4	ldr	x2, [x24]
00000000000f5de8	mov	x0, x27
00000000000f5dec	bl	"_objc_msgSend$getRenderMode:"
00000000000f5df0	mov	x8, x0
00000000000f5df4	mov	w0, #0x0
00000000000f5df8	cbz	w8, 0xf689c
00000000000f5dfc	mov	w8, w26
00000000000f5e00	cmp	x8, #0x3
00000000000f5e04	b.ne	0xf689c
00000000000f5e08	cbz	x21, 0xf6264
00000000000f5e0c	add	x8, sp, #0x50
00000000000f5e10	mov	x0, x21
00000000000f5e14	bl	_objc_msgSend$heliumRef
00000000000f5e18	cbz	w25, 0xf626c
00000000000f5e1c	ldr	x0, [sp, #0x50]
00000000000f5e20	str	x0, [sp, #0xf8]
00000000000f5e24	cbz	x0, 0xf5e34
00000000000f5e28	ldr	x8, [x0]
00000000000f5e2c	ldr	x8, [x8, #0x10]
00000000000f5e30	blr	x8
00000000000f5e34	adrp	x8, 873 ; 0x45e000
00000000000f5e38	ldrsw	x8, [x8, #0xda8]
00000000000f5e3c	ldr	x25, [x27, x8]
00000000000f5e40	ldp	q0, q1, [x24]
00000000000f5e44	stp	q0, q1, [sp, #0x170]
00000000000f5e48	ldr	q0, [x24, #0x20]
00000000000f5e4c	str	q0, [sp, #0x190]
00000000000f5e50	mov	x0, x27
00000000000f5e54	bl	_objc_msgSend$getBlendingGamma
00000000000f5e58	mov.16b	v2, v0
00000000000f5e5c	fcvt	s0, d8
00000000000f5e60	add	x8, sp, #0xf8
00000000000f5e64	add	x9, sp, #0x50
00000000000f5e68	stp	x9, x8, [sp, #0x8]
00000000000f5e6c	strb	wzr, [sp]
00000000000f5e70	add	x4, sp, #0x170
00000000000f5e74	fmov	s1, #1.00000000
00000000000f5e78	mov	x0, x25
00000000000f5e7c	mov	x2, x22
00000000000f5e80	mov	x3, x23
00000000000f5e84	mov	w5, #0x0
00000000000f5e88	mov	w6, #0x0
00000000000f5e8c	mov	w7, #0x0
00000000000f5e90	bl	"_objc_msgSend$doMatteManipulationWithParamAPI:withPrivateParamAPI:withInfo:pixelAspectRatio:fieldHeight:doInvertMatte:inputIsInverted:fillHoles:scaling:blendingGamma:preKeyedInputNode:outputNode:"
00000000000f5e94	tbz	w0, #0x0, 0xf675c
00000000000f5e98	ldr	d0, [sp, #0x68]
00000000000f5e9c	adrp	x8, 374 ; 0x26b000
00000000000f5ea0	ldr	d1, [x8, #0x190]
00000000000f5ea4	fmul	d8, d0, d1
00000000000f5ea8	str	d8, [sp, #0x68]
00000000000f5eac	ldr	x22, [sp, #0xf8]
00000000000f5eb0	cbz	x22, 0xf5ec4
00000000000f5eb4	ldr	x8, [x22]
00000000000f5eb8	ldr	x8, [x8, #0x10]
00000000000f5ebc	mov	x0, x22
00000000000f5ec0	blr	x8
00000000000f5ec4	fmov	d0, #10.00000000
00000000000f5ec8	fdiv	d0, d8, d0
00000000000f5ecc	fcvtps	w19, d0
00000000000f5ed0	cmp	w19, #0x1
00000000000f5ed4	b.lt	0xf5f78
00000000000f5ed8	fmov	d11, #10.00000000
00000000000f5edc	mov	w0, #0x1b0
00000000000f5ee0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f5ee4	mov	x23, x0
00000000000f5ee8	bl	0x251348 ; symbol stub for: __ZN16HGrowShrinkMatteC1Ev
00000000000f5eec	fminnm	d12, d8, d11
00000000000f5ef0	fcvt	s0, d12
00000000000f5ef4	fneg	s0, s0
00000000000f5ef8	str	s0, [x23, #0x198]
00000000000f5efc	ldr	x8, [x23]
00000000000f5f00	ldr	x8, [x8, #0x78]
00000000000f5f04	mov	x0, x23
00000000000f5f08	mov	w1, #0x0
00000000000f5f0c	mov	x2, x22
00000000000f5f10	blr	x8
00000000000f5f14	ldr	x8, [x23]
00000000000f5f18	ldr	x8, [x8, #0x88]
00000000000f5f1c	mov	x0, x23
00000000000f5f20	mov	w1, #0x0
00000000000f5f24	mov	w2, #0x2
00000000000f5f28	blr	x8
00000000000f5f2c	cmp	x22, x23
00000000000f5f30	b.eq	0xf5f5c
00000000000f5f34	cbz	x22, 0xf5f48
00000000000f5f38	ldr	x8, [x22]
00000000000f5f3c	ldr	x8, [x8, #0x18]
00000000000f5f40	mov	x0, x22
00000000000f5f44	blr	x8
00000000000f5f48	ldr	x8, [x23]
00000000000f5f4c	ldr	x8, [x8, #0x10]
00000000000f5f50	mov	x22, x23
00000000000f5f54	mov	x0, x23
00000000000f5f58	blr	x8
00000000000f5f5c	ldr	x8, [x23]
00000000000f5f60	ldr	x8, [x8, #0x18]
00000000000f5f64	mov	x0, x23
00000000000f5f68	blr	x8
00000000000f5f6c	fsub	d8, d8, d12
00000000000f5f70	subs	w19, w19, #0x1
00000000000f5f74	b.ne	0xf5edc
00000000000f5f78	ldr	x0, [sp, #0xf8]
00000000000f5f7c	cmp	x0, x22
00000000000f5f80	b.eq	0xf5fac
00000000000f5f84	cbz	x0, 0xf5f94
00000000000f5f88	ldr	x8, [x0]
00000000000f5f8c	ldr	x8, [x8, #0x18]
00000000000f5f90	blr	x8
00000000000f5f94	str	x22, [sp, #0xf8]
00000000000f5f98	cbz	x22, 0xf5fac
00000000000f5f9c	ldr	x8, [x22]
00000000000f5fa0	ldr	x8, [x8, #0x10]
00000000000f5fa4	mov	x0, x22
00000000000f5fa8	blr	x8
00000000000f5fac	ldr	d0, [sp, #0x60]
00000000000f5fb0	fcmp	d0, #0.0
00000000000f5fb4	b.eq	0xf6050
00000000000f5fb8	mov	w0, #0x1b0
00000000000f5fbc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f5fc0	mov	x23, x0
00000000000f5fc4	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000f5fc8	ldr	d0, [sp, #0x60]
00000000000f5fcc	adrp	x8, 374 ; 0x26b000
00000000000f5fd0	ldr	d1, [x8, #0x198]
00000000000f5fd4	fmul	d0, d0, d1
00000000000f5fd8	fcvt	s0, d0
00000000000f5fdc	fcvt	s1, d9
00000000000f5fe0	fcvt	s2, d10
00000000000f5fe4	mov	x0, x23
00000000000f5fe8	mov	w1, #0x0
00000000000f5fec	mov	w2, #0x0
00000000000f5ff0	mov	w3, #0x0
00000000000f5ff4	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000f5ff8	ldr	x2, [sp, #0xf8]
00000000000f5ffc	ldr	x8, [x23]
00000000000f6000	ldr	x8, [x8, #0x78]
00000000000f6004	mov	x0, x23
00000000000f6008	mov	w1, #0x0
00000000000f600c	blr	x8
00000000000f6010	ldr	x0, [sp, #0xf8]
00000000000f6014	cmp	x0, x23
00000000000f6018	b.eq	0xf6040
00000000000f601c	cbz	x0, 0xf602c
00000000000f6020	ldr	x8, [x0]
00000000000f6024	ldr	x8, [x8, #0x18]
00000000000f6028	blr	x8
00000000000f602c	str	x23, [sp, #0xf8]
00000000000f6030	ldr	x8, [x23]
00000000000f6034	ldr	x8, [x8, #0x10]
00000000000f6038	mov	x0, x23
00000000000f603c	blr	x8
00000000000f6040	ldr	x8, [x23]
00000000000f6044	ldr	x8, [x8, #0x18]
00000000000f6048	mov	x0, x23
00000000000f604c	blr	x8
00000000000f6050	ldr	d0, [sp, #0x58]
00000000000f6054	fcmp	d0, #0.0
00000000000f6058	b.le	0xf60d0
00000000000f605c	mov	w0, #0x1b0
00000000000f6060	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f6064	mov	x23, x0
00000000000f6068	bl	0x251780 ; symbol stub for: __ZN6HErodeC1Ev
00000000000f606c	ldr	d0, [sp, #0x58]
00000000000f6070	fcvt	s0, d0
00000000000f6074	str	s0, [x23, #0x198]
00000000000f6078	ldr	x2, [sp, #0xf8]
00000000000f607c	ldr	x8, [x23]
00000000000f6080	ldr	x8, [x8, #0x78]
00000000000f6084	mov	x0, x23
00000000000f6088	mov	w1, #0x0
00000000000f608c	blr	x8
00000000000f6090	ldr	x0, [sp, #0xf8]
00000000000f6094	cmp	x0, x23
00000000000f6098	b.eq	0xf60c0
00000000000f609c	cbz	x0, 0xf60ac
00000000000f60a0	ldr	x8, [x0]
00000000000f60a4	ldr	x8, [x8, #0x18]
00000000000f60a8	blr	x8
00000000000f60ac	str	x23, [sp, #0xf8]
00000000000f60b0	ldr	x8, [x23]
00000000000f60b4	ldr	x8, [x8, #0x10]
00000000000f60b8	mov	x0, x23
00000000000f60bc	blr	x8
00000000000f60c0	ldr	x8, [x23]
00000000000f60c4	ldr	x8, [x8, #0x18]
00000000000f60c8	mov	x0, x23
00000000000f60cc	blr	x8
00000000000f60d0	mov	w0, #0x1a0
00000000000f60d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f60d8	mov	x23, x0
00000000000f60dc	bl	0x251300 ; symbol stub for: __ZN15HGUnpremultiplyC1Ev
00000000000f60e0	ldr	x2, [sp, #0x50]
00000000000f60e4	ldr	x8, [x23]
00000000000f60e8	ldr	x8, [x8, #0x78]
00000000000f60ec	mov	x0, x23
00000000000f60f0	mov	w1, #0x0
00000000000f60f4	blr	x8
00000000000f60f8	mov	w0, #0x1a0
00000000000f60fc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f6100	mov	x24, x0
00000000000f6104	movi.2d	v0, #0000000000000000
00000000000f6108	stp	q0, q0, [x0, #0x180]
00000000000f610c	stp	q0, q0, [x0, #0x160]
00000000000f6110	stp	q0, q0, [x0, #0x140]
00000000000f6114	stp	q0, q0, [x0, #0x120]
00000000000f6118	stp	q0, q0, [x0, #0x100]
00000000000f611c	stp	q0, q0, [x0, #0xe0]
00000000000f6120	stp	q0, q0, [x0, #0xc0]
00000000000f6124	stp	q0, q0, [x0, #0xa0]
00000000000f6128	stp	q0, q0, [x0, #0x80]
00000000000f612c	stp	q0, q0, [x0, #0x60]
00000000000f6130	stp	q0, q0, [x0, #0x40]
00000000000f6134	stp	q0, q0, [x0, #0x20]
00000000000f6138	stp	q0, q0, [x0]
00000000000f613c	bl	__ZN12HgcCopyAlphaC2Ev
00000000000f6140	adrp	x8, 674 ; 0x398000
00000000000f6144	add	x8, x8, #0xa28
00000000000f6148	str	x8, [x24]
00000000000f614c	movi.2d	v0, #0000000000000000
00000000000f6150	movi.2d	v1, #0000000000000000
00000000000f6154	movi.2d	v2, #0000000000000000
00000000000f6158	fmov	s3, #1.00000000
00000000000f615c	mov	x0, x24
00000000000f6160	mov	w1, #0x0
00000000000f6164	bl	__ZN12HgcCopyAlpha12SetParameterEiffff
00000000000f6168	ldr	x8, [x24]
00000000000f616c	ldr	x8, [x8, #0x78]
00000000000f6170	mov	x0, x24
00000000000f6174	mov	w1, #0x0
00000000000f6178	mov	x2, x23
00000000000f617c	blr	x8
00000000000f6180	ldr	x2, [sp, #0xf8]
00000000000f6184	ldr	x8, [x24]
00000000000f6188	ldr	x8, [x8, #0x78]
00000000000f618c	mov	x0, x24
00000000000f6190	mov	w1, #0x1
00000000000f6194	blr	x8
00000000000f6198	mov	w0, #0x1a0
00000000000f619c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f61a0	mov	x25, x0
00000000000f61a4	bl	0x251174 ; symbol stub for: __ZN13HGPremultiplyC1Ev
00000000000f61a8	ldr	x8, [x25]
00000000000f61ac	ldr	x8, [x8, #0x78]
00000000000f61b0	mov	x0, x25
00000000000f61b4	mov	w1, #0x0
00000000000f61b8	mov	x2, x24
00000000000f61bc	blr	x8
00000000000f61c0	str	x25, [sp, #0x170]
00000000000f61c4	ldr	x8, [x25]
00000000000f61c8	ldr	x8, [x8, #0x10]
00000000000f61cc	mov	x0, x25
00000000000f61d0	blr	x8
00000000000f61d4	add	x2, sp, #0x170
00000000000f61d8	mov	x0, x27
00000000000f61dc	mov	x3, x21
00000000000f61e0	mov	x4, x20
00000000000f61e4	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000f61e8	add	x2, sp, #0x170
00000000000f61ec	mov	x0, x20
00000000000f61f0	bl	"_objc_msgSend$setHeliumRef:"
00000000000f61f4	ldr	x0, [sp, #0x170]
00000000000f61f8	cbz	x0, 0xf6208
00000000000f61fc	ldr	x8, [x0]
00000000000f6200	ldr	x8, [x8, #0x18]
00000000000f6204	blr	x8
00000000000f6208	ldr	x8, [x25]
00000000000f620c	ldr	x8, [x8, #0x18]
00000000000f6210	mov	x0, x25
00000000000f6214	blr	x8
00000000000f6218	ldr	x8, [x24]
00000000000f621c	ldr	x8, [x8, #0x18]
00000000000f6220	mov	x0, x24
00000000000f6224	blr	x8
00000000000f6228	ldr	x8, [x23]
00000000000f622c	ldr	x8, [x8, #0x18]
00000000000f6230	mov	x0, x23
00000000000f6234	blr	x8
00000000000f6238	cbz	x22, 0xf624c
00000000000f623c	ldr	x8, [x22]
00000000000f6240	ldr	x8, [x8, #0x18]
00000000000f6244	mov	x0, x22
00000000000f6248	blr	x8
00000000000f624c	ldr	x0, [sp, #0xf8]
00000000000f6250	cbz	x0, 0xf6884
00000000000f6254	ldr	x8, [x0]
00000000000f6258	ldr	x8, [x8, #0x18]
00000000000f625c	blr	x8
00000000000f6260	b	0xf6884
00000000000f6264	str	xzr, [sp, #0x50]
00000000000f6268	cbnz	w25, 0xf5e1c
00000000000f626c	ldr	d0, [sp, #0x60]
00000000000f6270	fcmp	d0, #0.0
00000000000f6274	b.hi	0xf6294
00000000000f6278	mov	x8, #0x68f1
00000000000f627c	movk	x8, #0x88e3, lsl #16
00000000000f6280	movk	x8, #0xf8b5, lsl #32
00000000000f6284	movk	x8, #0x3ee4, lsl #48
00000000000f6288	str	x8, [sp, #0x60]
00000000000f628c	adrp	x8, 371 ; 0x269000
00000000000f6290	ldr	d0, [x8, #0x4b8]
00000000000f6294	ldr	d1, [sp, #0x68]
00000000000f6298	fadd	d1, d1, d0
00000000000f629c	fcvt	s2, d1
00000000000f62a0	fmov	s1, #29.00000000
00000000000f62a4	fdiv	s1, s2, s1
00000000000f62a8	fmov	s11, #1.00000000
00000000000f62ac	fadd	s1, s1, s11
00000000000f62b0	fcmp	s1, #0.0
00000000000f62b4	movi.2d	v3, #0000000000000000
00000000000f62b8	fcsel	s1, s3, s1, mi
00000000000f62bc	adrp	x8, 372 ; 0x26a000
00000000000f62c0	ldr	s3, [x8, #0x64]
00000000000f62c4	fadd	s3, s1, s3
00000000000f62c8	fcvtms	w8, s3
00000000000f62cc	fdiv	s8, s11, s2
00000000000f62d0	tbnz	w8, #0x1f, 0xf6788
00000000000f62d4	stp	x27, x21, [sp, #0x18]
00000000000f62d8	str	x20, [sp, #0x28]
00000000000f62dc	mov	w26, #0x0
00000000000f62e0	mov	x23, #0x0
00000000000f62e4	mov	x22, #0x0
00000000000f62e8	lsl	w27, w8, #1
00000000000f62ec	scvtf	s0, w27
00000000000f62f0	fsub	s13, s1, s0
00000000000f62f4	mov	w9, #0x1
00000000000f62f8	bfi	w9, w8, #1, #31
00000000000f62fc	str	w9, [sp, #0x4c]
00000000000f6300	lsl	w9, w9, #1
00000000000f6304	sub	w9, w9, #0x1
00000000000f6308	str	w9, [sp, #0x48]
00000000000f630c	adrp	x9, 678 ; 0x39c000
00000000000f6310	add	x9, x9, #0xee0
00000000000f6314	ldr	x9, [x9, #0x88]
00000000000f6318	str	x9, [sp, #0x38]
00000000000f631c	fsub	s9, s11, s8
00000000000f6320	fcvt	d0, s9
00000000000f6324	adrp	x9, 370 ; 0x268000
00000000000f6328	ldr	d1, [x9, #0xc58]
00000000000f632c	fadd	d0, d0, d1
00000000000f6330	fcvt	s10, d0
00000000000f6334	mov	w9, #0x2
00000000000f6338	orr	w8, w9, w8, lsl #2
00000000000f633c	cmp	w8, #0x1
00000000000f6340	csinc	w8, w8, wzr, gt
00000000000f6344	str	w8, [sp, #0x44]
00000000000f6348	adrp	x8, 678 ; 0x39c000
00000000000f634c	add	x8, x8, #0xc88
00000000000f6350	ldr	x8, [x8, #0x88]
00000000000f6354	str	x8, [sp, #0x30]
00000000000f6358	adrp	x8, 371 ; 0x269000
00000000000f635c	ldr	s14, [x8, #0xe70]
00000000000f6360	add	x28, sp, #0xf8
00000000000f6364	add	x20, sp, #0x84
00000000000f6368	add	x19, sp, #0x170
00000000000f636c	ldr	w8, [sp, #0x4c]
00000000000f6370	sub	w8, w26, w8
00000000000f6374	lsl	w9, w8, #4
00000000000f6378	sub	w8, w9, w8, lsl #1
00000000000f637c	ldr	w9, [sp, #0x48]
00000000000f6380	cmp	w26, w9
00000000000f6384	ccmp	w26, w27, #0x4, ne
00000000000f6388	mov	w9, #0x1
00000000000f638c	lsl	w9, w9, w26
00000000000f6390	fcsel	s0, s13, s11, eq
00000000000f6394	cmp	w26, w27
00000000000f6398	csel	w8, w8, wzr, gt
00000000000f639c	csinc	w9, w9, wzr, le
00000000000f63a0	scvtf	s1, w9
00000000000f63a4	scvtf	s15, w8
00000000000f63a8	fmul	s12, s0, s1
00000000000f63ac	movi.2d	v0, #0000000000000000
00000000000f63b0	fcsel	s0, s14, s0, gt
00000000000f63b4	bl	0x252068 ; symbol stub for: ___sincosf_stret
00000000000f63b8	mov	x8, #0x0
00000000000f63bc	fmul	s2, s1, s12
00000000000f63c0	fmul	s3, s0, s12
00000000000f63c4	fmul	s4, s1, s15
00000000000f63c8	fmul	s5, s0, s15
00000000000f63cc	fnmul	s1, s1, s15
00000000000f63d0	fnmul	s0, s0, s15
00000000000f63d4	sub	w9, w8, #0xe
00000000000f63d8	scvtf	s6, w9
00000000000f63dc	cmp	x8, #0xe
00000000000f63e0	fcsel	s7, s4, s1, hi
00000000000f63e4	fcsel	s16, s5, s0, hi
00000000000f63e8	fmul	s17, s2, s6
00000000000f63ec	fadd	s7, s17, s7
00000000000f63f0	str	s7, [x28, x8, lsl #2]
00000000000f63f4	fmul	s6, s3, s6
00000000000f63f8	fadd	s6, s6, s16
00000000000f63fc	str	s6, [x20, x8, lsl #2]
00000000000f6400	fmul	s7, s7, s7
00000000000f6404	fmul	s6, s6, s6
00000000000f6408	fadd	s6, s7, s6
00000000000f640c	fsqrt	s6, s6
00000000000f6410	fmul	s6, s8, s6
00000000000f6414	cmp	w26, w27
00000000000f6418	b.le	0xf6430
00000000000f641c	fmul	s6, s6, s6
00000000000f6420	str	s6, [x19, x8, lsl #2]
00000000000f6424	cmp	x8, #0x1c
00000000000f6428	b.ne	0xf643c
00000000000f642c	b	0xf6444
00000000000f6430	str	s6, [x19, x8, lsl #2]
00000000000f6434	cmp	x8, #0x1c
00000000000f6438	b.eq	0xf649c
00000000000f643c	add	x8, x8, #0x1
00000000000f6440	b	0xf63d4
00000000000f6444	cmp	w26, #0x0
00000000000f6448	cset	w21, eq
00000000000f644c	mov	w0, #0x1a0
00000000000f6450	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f6454	mov	x24, x0
00000000000f6458	bl	__ZN30HgcConvolvePassMatteMagicYPassC2Ev
00000000000f645c	adrp	x8, 678 ; 0x39c000
00000000000f6460	add	x8, x8, #0xee0
00000000000f6464	add	x8, x8, #0x10
00000000000f6468	str	x8, [x24]
00000000000f646c	mov	x0, x24
00000000000f6470	mov	w1, #0x0
00000000000f6474	mov	x2, x23
00000000000f6478	ldr	x8, [sp, #0x38]
00000000000f647c	blr	x8
00000000000f6480	ldr	x8, [x24]
00000000000f6484	ldr	x8, [x8, #0x78]
00000000000f6488	mov	x0, x24
00000000000f648c	mov	w1, #0x1
00000000000f6490	mov	x2, x22
00000000000f6494	blr	x8
00000000000f6498	b	0xf64f4
00000000000f649c	mov	w0, #0x1a0
00000000000f64a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f64a4	mov	x24, x0
00000000000f64a8	bl	__ZN25HgcConvolvePassMatteMagicC2Ev
00000000000f64ac	adrp	x8, 678 ; 0x39c000
00000000000f64b0	add	x8, x8, #0xc88
00000000000f64b4	add	x8, x8, #0x10
00000000000f64b8	str	x8, [x24]
00000000000f64bc	cbz	w26, 0xf64dc
00000000000f64c0	mov	x0, x24
00000000000f64c4	mov	w1, #0x0
00000000000f64c8	mov	x2, x22
00000000000f64cc	ldr	x8, [sp, #0x30]
00000000000f64d0	blr	x8
00000000000f64d4	mov	w21, #0x0
00000000000f64d8	b	0xf64f4
00000000000f64dc	ldr	x2, [sp, #0x50]
00000000000f64e0	mov	x0, x24
00000000000f64e4	mov	w1, #0x0
00000000000f64e8	ldr	x8, [sp, #0x30]
00000000000f64ec	blr	x8
00000000000f64f0	mov	w21, #0x1
00000000000f64f4	mov	x25, #0x0
00000000000f64f8	ldr	s0, [x28, x25, lsl #2]
00000000000f64fc	ldr	s1, [x20, x25, lsl #2]
00000000000f6500	ldr	x8, [x24]
00000000000f6504	ldr	x8, [x8, #0x60]
00000000000f6508	movi.2d	v2, #0000000000000000
00000000000f650c	movi.2d	v3, #0000000000000000
00000000000f6510	mov	x0, x24
00000000000f6514	mov	x1, x25
00000000000f6518	blr	x8
00000000000f651c	add	x25, x25, #0x1
00000000000f6520	cmp	x25, #0x1d
00000000000f6524	b.ne	0xf64f8
00000000000f6528	mov	x25, #0x0
00000000000f652c	ldr	s0, [x19, x25, lsl #2]
00000000000f6530	ldr	x8, [x24]
00000000000f6534	ldr	x8, [x8, #0x60]
00000000000f6538	add	w1, w25, #0x1d
00000000000f653c	mov	x0, x24
00000000000f6540	mov.16b	v1, v0
00000000000f6544	mov.16b	v2, v0
00000000000f6548	mov.16b	v3, v0
00000000000f654c	blr	x8
00000000000f6550	add	x25, x25, #0x1
00000000000f6554	cmp	x25, #0x1d
00000000000f6558	b.ne	0xf652c
00000000000f655c	ldr	x8, [x24]
00000000000f6560	ldr	x8, [x8, #0x60]
00000000000f6564	tbz	w21, #0x0, 0xf6618
00000000000f6568	mov	x0, x24
00000000000f656c	mov	w1, #0x3a
00000000000f6570	mov.16b	v0, v8
00000000000f6574	mov.16b	v1, v8
00000000000f6578	mov.16b	v2, v8
00000000000f657c	mov.16b	v3, v8
00000000000f6580	blr	x8
00000000000f6584	ldr	x8, [x24]
00000000000f6588	ldr	x8, [x8, #0x60]
00000000000f658c	mov	x0, x24
00000000000f6590	mov	w1, #0x3b
00000000000f6594	mov.16b	v0, v9
00000000000f6598	mov.16b	v1, v9
00000000000f659c	mov.16b	v2, v9
00000000000f65a0	mov.16b	v3, v9
00000000000f65a4	blr	x8
00000000000f65a8	ldr	x8, [x24]
00000000000f65ac	ldr	x8, [x8, #0x60]
00000000000f65b0	mov	x0, x24
00000000000f65b4	mov	w1, #0x3c
00000000000f65b8	mov.16b	v0, v10
00000000000f65bc	mov.16b	v1, v10
00000000000f65c0	mov.16b	v2, v10
00000000000f65c4	mov.16b	v3, v10
00000000000f65c8	blr	x8
00000000000f65cc	ldr	x8, [x24]
00000000000f65d0	ldr	x8, [x8, #0x60]
00000000000f65d4	fmov	s0, #-1.00000000
00000000000f65d8	fmov	s1, #-1.00000000
00000000000f65dc	fmov	s2, #-1.00000000
00000000000f65e0	fmov	s3, #-1.00000000
00000000000f65e4	mov	x0, x24
00000000000f65e8	mov	w1, #0x3d
00000000000f65ec	blr	x8
00000000000f65f0	ldr	x8, [x24]
00000000000f65f4	ldr	x8, [x8, #0x60]
00000000000f65f8	fmov	s0, #1.00000000
00000000000f65fc	fmov	s1, #1.00000000
00000000000f6600	fmov	s2, #1.00000000
00000000000f6604	fmov	s3, #1.00000000
00000000000f6608	mov	x0, x24
00000000000f660c	mov	w1, #0x3e
00000000000f6610	blr	x8
00000000000f6614	b	0xf66c4
00000000000f6618	fmov	s0, #1.00000000
00000000000f661c	fmov	s1, #1.00000000
00000000000f6620	fmov	s2, #1.00000000
00000000000f6624	fmov	s3, #1.00000000
00000000000f6628	mov	x0, x24
00000000000f662c	mov	w1, #0x3a
00000000000f6630	blr	x8
00000000000f6634	ldr	x8, [x24]
00000000000f6638	ldr	x8, [x8, #0x60]
00000000000f663c	movi.2d	v0, #0000000000000000
00000000000f6640	movi.2d	v1, #0000000000000000
00000000000f6644	movi.2d	v2, #0000000000000000
00000000000f6648	movi.2d	v3, #0000000000000000
00000000000f664c	mov	x0, x24
00000000000f6650	mov	w1, #0x3b
00000000000f6654	blr	x8
00000000000f6658	ldr	x8, [x24]
00000000000f665c	ldr	x8, [x8, #0x60]
00000000000f6660	movi.2d	v0, #0000000000000000
00000000000f6664	movi.2d	v1, #0000000000000000
00000000000f6668	movi.2d	v2, #0000000000000000
00000000000f666c	movi.2d	v3, #0000000000000000
00000000000f6670	mov	x0, x24
00000000000f6674	mov	w1, #0x3c
00000000000f6678	blr	x8
00000000000f667c	ldr	x8, [x24]
00000000000f6680	ldr	x8, [x8, #0x60]
00000000000f6684	fmov	s0, #1.00000000
00000000000f6688	fmov	s1, #1.00000000
00000000000f668c	fmov	s2, #1.00000000
00000000000f6690	fmov	s3, #1.00000000
00000000000f6694	mov	x0, x24
00000000000f6698	mov	w1, #0x3d
00000000000f669c	blr	x8
00000000000f66a0	ldr	x8, [x24]
00000000000f66a4	ldr	x8, [x8, #0x60]
00000000000f66a8	movi.2d	v0, #0000000000000000
00000000000f66ac	movi.2d	v1, #0000000000000000
00000000000f66b0	movi.2d	v2, #0000000000000000
00000000000f66b4	movi.2d	v3, #0000000000000000
00000000000f66b8	mov	x0, x24
00000000000f66bc	mov	w1, #0x3e
00000000000f66c0	blr	x8
00000000000f66c4	cmp	x22, x24
00000000000f66c8	b.eq	0xf66f4
00000000000f66cc	cbz	x22, 0xf66e0
00000000000f66d0	ldr	x8, [x22]
00000000000f66d4	ldr	x8, [x8, #0x18]
00000000000f66d8	mov	x0, x22
00000000000f66dc	blr	x8
00000000000f66e0	ldr	x8, [x24]
00000000000f66e4	ldr	x8, [x8, #0x10]
00000000000f66e8	mov	x22, x24
00000000000f66ec	mov	x0, x24
00000000000f66f0	blr	x8
00000000000f66f4	cmp	w26, w27
00000000000f66f8	b.ne	0xf672c
00000000000f66fc	cmp	x23, x24
00000000000f6700	b.eq	0xf672c
00000000000f6704	cbz	x23, 0xf6718
00000000000f6708	ldr	x8, [x23]
00000000000f670c	ldr	x8, [x8, #0x18]
00000000000f6710	mov	x0, x23
00000000000f6714	blr	x8
00000000000f6718	ldr	x8, [x24]
00000000000f671c	ldr	x8, [x8, #0x10]
00000000000f6720	mov	x23, x24
00000000000f6724	mov	x0, x24
00000000000f6728	blr	x8
00000000000f672c	ldr	x8, [x24]
00000000000f6730	ldr	x8, [x8, #0x18]
00000000000f6734	mov	x0, x24
00000000000f6738	blr	x8
00000000000f673c	add	w26, w26, #0x1
00000000000f6740	ldr	w8, [sp, #0x44]
00000000000f6744	cmp	w26, w8
00000000000f6748	b.ne	0xf636c
00000000000f674c	ldr	d0, [sp, #0x60]
00000000000f6750	ldp	x21, x20, [sp, #0x20]
00000000000f6754	ldr	x27, [sp, #0x18]
00000000000f6758	b	0xf6790
00000000000f675c	ldr	x0, [sp, #0xf8]
00000000000f6760	cbz	x0, 0xf6770
00000000000f6764	ldr	x8, [x0]
00000000000f6768	ldr	x8, [x8, #0x18]
00000000000f676c	blr	x8
00000000000f6770	ldr	x0, [sp, #0x50]
00000000000f6774	cbz	x0, 0xf689c
00000000000f6778	ldr	x8, [x0]
00000000000f677c	ldr	x8, [x8, #0x18]
00000000000f6780	blr	x8
00000000000f6784	b	0xf5d28
00000000000f6788	mov	x22, #0x0
00000000000f678c	mov	x23, #0x0
00000000000f6790	fcvt	d9, s8
00000000000f6794	fcmp	d0, #0.0
00000000000f6798	b.le	0xf67b0
00000000000f679c	fmul	d0, d0, d9
00000000000f67a0	fmov	d1, #1.00000000
00000000000f67a4	fdiv	d0, d1, d0
00000000000f67a8	fcvt	s8, d0
00000000000f67ac	b	0xf67b8
00000000000f67b0	adrp	x8, 373 ; 0x26b000
00000000000f67b4	ldr	s8, [x8, #0x1a0]
00000000000f67b8	ldr	d10, [sp, #0x68]
00000000000f67bc	mov	w0, #0x1a0
00000000000f67c0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f67c4	mov	x24, x0
00000000000f67c8	bl	__ZN29HgcShrinkAndFeatherMatteMagicC1Ev
00000000000f67cc	str	x24, [sp, #0x170]
00000000000f67d0	ldr	x2, [sp, #0x50]
00000000000f67d4	ldr	x8, [x24]
00000000000f67d8	ldr	x8, [x8, #0x78]
00000000000f67dc	mov	x0, x24
00000000000f67e0	mov	w1, #0x0
00000000000f67e4	blr	x8
00000000000f67e8	ldr	x8, [x24]
00000000000f67ec	ldr	x8, [x8, #0x78]
00000000000f67f0	mov	x0, x24
00000000000f67f4	mov	w1, #0x1
00000000000f67f8	mov	x2, x22
00000000000f67fc	blr	x8
00000000000f6800	fmul	d0, d10, d9
00000000000f6804	fcvt	s0, d0
00000000000f6808	ldr	x0, [sp, #0x170]
00000000000f680c	ldr	x8, [x0]
00000000000f6810	ldr	x8, [x8, #0x60]
00000000000f6814	movi.2d	v2, #0000000000000000
00000000000f6818	movi.2d	v3, #0000000000000000
00000000000f681c	mov	w1, #0x0
00000000000f6820	mov.16b	v1, v8
00000000000f6824	blr	x8
00000000000f6828	add	x2, sp, #0x170
00000000000f682c	mov	x0, x27
00000000000f6830	mov	x3, x21
00000000000f6834	mov	x4, x20
00000000000f6838	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000f683c	add	x2, sp, #0x170
00000000000f6840	mov	x0, x20
00000000000f6844	bl	"_objc_msgSend$setHeliumRef:"
00000000000f6848	ldr	x0, [sp, #0x170]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm0 : LevelsParameters
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 58  <-  (constant / computed / multi-pass — read the disasm)
    slot 59  <-  (constant / computed / multi-pass — read the disasm)
    slot 60  <-  (constant / computed / multi-pass — read the disasm)
    slot 61  <-  (constant / computed / multi-pass — read the disasm)
    slot 62  <-  (constant / computed / multi-pass — read the disasm)
```
