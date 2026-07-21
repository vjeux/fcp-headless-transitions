# Hue/Saturation

- **PAE class:** `Hue/Saturation`
- **Plugin UUID:** `D23AF030-B0BF-44DF-B622-7C9EA0DF5744`
- **Node names in corpus:** Hue/Saturation (1516), Hue/Saturation Source (31), Hue/Saturation copy (28), hs (13), HSV Adjust copy (9), HS (8)
- **Corpus usage:** 827 files, 1620 instances

## What it does

Hue/Saturation (PAEHSVAdjust) converts each pixel to HSV, rotates its hue, scales its saturation and value, then converts back. It is the standard tool for shifting color casts, boosting/killing saturation, or driving animated color cycles. The engine implements it as a branchless in-place RGB<->HSV round-trip matching FCP's shader.

> **Note.** RE finding: FCP's `Hue` param is authored in DEGREES internally (fed to the shader as `hue/360` turns); the corpus stores it in RADIANS (0..2pi). `Saturation` is 0-centered (0 = unchanged, -1 = grayscale). `Value` and `Saturation` are both MULTIPLIERS in FCP, not additive offsets.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Hue | float (radians) | 0 | 0 .. 6.283 | Hue rotation around the color wheel. Stored 0..2pi (pi = 180 deg). 0 = no shift. Rotates every pixel's hue by this angle. *(keyframed in 5 instances)* |
| Saturation | float | 0 | -1 .. 3 | Saturation adjustment, 0-centered: 0 = unchanged, -1 = fully desaturated (grayscale), positive = more saturated (up to +3 observed). *(keyframed in 71 instances)* |
| Value | float | 1 | 0 .. 2 | Brightness/value multiplier: 1 = unchanged, 0 = black, up to 2 = doubled. Continuous float. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the adjusted result over the original, 0-1 continuous. Often keyframed to animate color shifts. *(keyframed in 281 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/hue-saturation.ts`](../../engine/src/compositor/filters/hue-saturation.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
