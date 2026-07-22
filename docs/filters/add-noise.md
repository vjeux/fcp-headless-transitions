# Add Noise

- **PAE class:** `Add Noise`
- **Plugin UUID:** `C423A28F-C016-4133-B120-22FF2E9A7862`
- **Node names in corpus:** Add Noise (122), Add Noise copy (53), Noise (6), Add Noise Source (4), Grain (2), Add Noise 1 (1)
- **Corpus usage:** 123 files, 188 instances

## What it does

Add Noise overlays procedural random noise onto the image, blended by Amount and a chosen Blend Mode, optionally monochrome and auto-animated over time. It is the grain/static generator used for film-grain, TV-static and texture effects. FCP's HgcAddNoise shader is a simple per-pixel scale+abs blend of a noise field; the shader is checked in.

> **Note.** HgcAddNoise shader is checked in (evidence/shaders/HgcAddNoise.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 0.33 | 0 .. 4 | Strength of the noise added, 0-4. 0 = no noise; the primary knob. *(keyframed in 1 instance)* |
| Type | enum(int) | 1 | 0 .. 4 | Noise distribution/type, 0-4 (e.g. uniform vs gaussian variants). |
| Blend Mode | enum(int) | 0 | 0 .. 17 | How the noise composites over the image, 0-17 (add, screen, overlay, etc.). |
| Monochrome | bool | 0 | 0 .. 1 | Toggle: single-channel gray noise vs independent per-channel color noise. |
| Autoanimate | bool | 1 | 0 .. 1 | Toggle: re-roll the noise field every frame (animated static) vs a static pattern. |
| Random Seed | float (int seed) | 25 | 0 .. 500 | Seed for the noise RNG. |
| Mix | float | 1 | 0.0043 .. 1 | Wet/dry blend of the noisy result over the original, 0-1 continuous. *(keyframed in 35 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcAddNoise` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal` (Phase-1 done, Phase-2 open).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcAddNoise
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

The noise field itself (`color0`) is generated upstream (a hash/random pass — see the existing
`HgcNoise` RE in `NOISE_DECOMPILE_REPORT.md` for the dSFMT-seeded generator). `HgcAddNoise` is the
combine that maps that raw noise into a signed, scaled, optionally-rectified perturbation:

```
n    = color0 * 2 - 1                 // remap noise [0,1] → [-1,1] (signed), alpha untouched
n    = n * hg_Params[0]               // Amount (per-channel gain)
n    = mix(n, abs(n), hg_Params[1])   // "Type": 0 = signed noise, 1 = rectified (|n|, one-sided)
out  = n * color1.a                   // premultiply against alpha
```

`hg_Params[0]` = **Amount** (how much noise, per channel), `hg_Params[1]` = a **noise-type** blend
between bipolar and rectified noise. The actual noise *character* (monochrome vs color, grain size,
seed) lives in the upstream generator params. Head-start: generate per-pixel noise, then apply the
4 lines above; combine with the source in the host (Add/Screen blend) per the Apply Mode param.

