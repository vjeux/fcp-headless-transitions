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

## Algorithm (decoded)

_RE'd from the `HgcPrism` embedded fragment shader (`tools/re/extract_shader.py HgcPrism`).
Decoded functional form below._

Prism is a **chromatic-aberration / RGB-split**. The dispersion is done *upstream*: the compositor
samples the source three times at chromatically-offset texture coordinates and feeds the results in
as `color0`, `color1`, `color2`. The `HgcPrism` shader itself is a trivial per-channel recombine:

```
out.r = color0.r        // red   channel taken from the "red-offset" sample
out.g = color1.g        // green channel from the "green-offset" sample
out.b = color2.b        // blue  channel from the "blue-offset" sample
out.a = max(color0.a, color1.a, color2.a)
```

So the *look* (how far R/G/B separate, and along what direction) is entirely encoded in the three
sample offsets computed CPU-side from the filter's params — **not** in the shader. To finish this
RE, decode `-[PAEPrism canThrowRenderOutput:]` to recover the per-channel offset vectors as a
function of the **Amount/Angle**-style params (expected: offset_R = +k·dir, offset_B = −k·dir,
offset_G ≈ 0, with `k` from Amount and `dir` from an Angle/Center param).

**Implementation head-start:** implement as three shifted gathers of the source (bilinear), then
compose `(R from shiftA, G from shiftB, B from shiftC)`; alpha = max. Matches the shader exactly
once the three offsets are known.
