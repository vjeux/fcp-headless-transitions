# Highpass

- **PAE class:** `Highpass`
- **Plugin UUID:** `44CB7A9A-4E16-4B32-9567-C1EAD1C0693A`
- **Node names in corpus:** Highpass (4), Edges (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Highpass keeps only the high-frequency detail of the image, subtracting a blurred (low-pass) copy from the original and centering the result around mid-gray -- the classic frequency-separation / high-pass-sharpen building block. The verbatim HgcHighPass shader is exactly (color0 - blurred)*Amount + 0.5, clamped. Radius sets the blur radius (the frequency split) and Amount the gain.

> **Note.** Shader-only. The verbatim HgcHighPass Metal shader ((in - blur)*Amount + 0.5) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 15 | 0 .. 30 | Gain on the high-frequency residual (shader hg_Params[0]), ~0-30 (default 15). |
| Radius | float (pixels) | 10 | 5 .. 100 | Blur radius defining the low/high frequency split, ~5-100 (default 10). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcHighPass` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcHighPass.metal` (Phase-1 done, Phase-2 open).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcHighPass.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHighPass.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcHighPass
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Highpass keeps only the high-frequency detail, biased to mid-gray (the classic Photoshop High Pass):

```
orig = color0.rgb / max(color0.a,1e-6)     // un-premultiply
blur = color1.rgb / max(color1.a,1e-6)     // un-premultiply the upstream Gaussian copy
hp   = (orig - blur) * hg_Params[0].rgb + 0.5   // detail, centered at 0.5 gray
out.rgb = max(hp, 0) * color0.a            // clamp≥0, re-premultiply
out.a   = color0.a
```

`hg_Params[0]` = **Amount** (per-channel). Flat regions → 0.5 gray; edges deviate from gray. The
blur radius (which builds `color1`) is the frequency-cutoff knob. Head-start: Gaussian blur (shared
`HGBlur`), then the one-line combine above. Differs from Sharpen only in that Sharpen adds the band
back to the original instead of centering on gray.

