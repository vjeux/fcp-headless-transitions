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

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcSharpen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSharpen.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcSharpen
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Sharpen is a classic **unsharp mask**: it amplifies the difference between the image and a blurred
copy. The blurred copy (`color1`) is produced upstream by a Gaussian pass; this shader does the
amplify-and-add:

```
orig    = color0
blurred = color1
out     = max( orig + (orig - blurred) * hg_Params[0], 0 )
```

`hg_Params[0]` is the **Amount/Intensity** (per-channel float4). `orig − blurred` is the high-
frequency detail; scaling it and adding back boosts edges. Negative-clamp at 0. The blur *radius*
that makes `color1` is the other creative knob (edge scale). Head-start: run the same `HGBlur`
Gaussian used by `gaussian-blur.ts`, then `out = clamp(orig + amount·(orig−blur), 0, ∞)`.

## See also: `HgcHighPass` (the "Highpass" filter)
Highpass is the same idea but keeps *only* the detail, centered at gray:
`out = max( (orig − blur)·Amount + 0.5, 0 )` (un/re-premultiplied). It's the isolated high-pass
band (mid-gray where flat), whereas Sharpen adds that band back onto the original.

