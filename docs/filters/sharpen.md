# Sharpen

- **PAE class:** `Sharpen`
- **Plugin UUID:** `6EFE2B74-1702-4829-B98E-E619501D1F16`
- **Node names in corpus:** Sharpen (19), Sharpen copy (1)
- **Corpus usage:** 19 files, 20 instances

## What it does

Sharpen increases apparent detail by subtracting a blurred copy of the image from the original and adding the difference back, boosting local contrast at edges. The verbatim HgcSharpen shader is exactly out = max(color0 + (color0 - blurred) * Amount, 0), where color1 is the pre-blurred input. Amount scales the edge enhancement.

> **Note.** Shader-only. The verbatim HgcSharpen Metal shader (unsharp-mask style: color0 + (color0-blur)*Amount, clamped >=0) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 2.5 | 0 .. 100 | Edge-enhancement strength (shader hg_Params[0]); higher = crisper/harsher, ~0-100 (default 2.5). |
| Intensity | float | 1 | 1 .. 2 | Secondary strength/gain on the sharpen, ~1-2 (default 1). Continuous float. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcSharpen` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcSharpen.metal` (Phase-1 done, Phase-2 open).
