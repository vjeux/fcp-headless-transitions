# Bad Film

- **PAE class:** `Bad Film`
- **Plugin UUID:** `9B5C17D9-1AC3-4B04-B8F3-59C1420963BF`
- **Node names in corpus:** Bad Film (451), Bad Film copy (11), Bad Film 2 (11), Bad Film 1 (11), Bad Film 7 (2), Bad Film 6 (2)
- **Corpus usage:** 231 files, 500 instances

## What it does

Bad Film emulates aged/damaged film: it adds dust, hairs, scratches, random per-frame brightness and saturation flicker, focus wobble, and frame jitter to make clean footage look like a scratched print. It is a heavily-parameterized "vintage projector" effect with independent Amount and Variance controls for each artifact type. FCP's HgcBadFilm shader (a brightness/saturation/tint pass over the source) is checked in; the dust/scratch/hair layers are generated separately.

> **Note.** HgcBadFilm shader is checked in but the full filter (procedural dust/scratch/hair generation) is not implemented in TS. Corpus dropped 13 localized (non-English) parameter duplicates. Descriptions of the artifact knobs follow the standard Motion "Bad Film" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Focus Amount | float | 0 | 0 .. 64 | Maximum defocus/blur applied by the wobble, 0-64. 0 = always sharp. *(keyframed in 1 instance)* |
| Focus Variance | float | 1 | 0 .. 100 | How much the focus randomly varies frame to frame, 0-100. *(keyframed in 1 instance)* |
| Brightness Amount | float | 1 | 0.5 .. 5 | Base brightness multiplier of the aged look, 0.5-5. |
| Brightness Variance | float | 0.34 | 0 .. 2.5 | Random per-frame brightness flicker amount, 0-2.5. |
| Saturate Amount | float | -50 | -100 .. 58 | Base saturation shift, -100..58 (negative desaturates toward a faded print). |
| Saturate Variance | float | 5 | 0 .. 100 | Random per-frame saturation flicker, 0-100. |
| Scratches | float | 1 | 0 .. 20 | Density of vertical scratch lines, 0-20. |
| Scratch Color | color | - | - | Color of the scratches (nested Red/Green/Blue/Opacity). |
| Hairs | enum(int) | 1 | 0 .. 10 | Number of stray hair/fiber artifacts overlaid, 0-10. |
| Dust | float | 4 | 0 .. 100 | Density of dust specks, 0-100. |
| Jitter Amount | float | 0 | 0 .. 1 | Amount of frame position jitter (gate weave), 0-1. |
| Jitter Variance | float | 0.05 | 0 .. 0.5 | How much the jitter magnitude varies, 0-0.5. |
| Frequency of Change | float | 3 | 0 .. 100 | How often the random artifacts re-roll, 0-100 (higher = more frantic flicker). |
| Grain | float | 0 | 0 .. 1 | Film-grain noise amount, 0-1. Continuous float, heavily keyframed. *(keyframed in 176 instances)* |
| Random Seed | float (int seed) | 25 | 0 .. 1000 | Seed for the artifact RNG; changing it reshuffles the dust/scratch/jitter pattern. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the aged result over the clean original, 0-1 continuous. *(keyframed in 45 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcBadFilm` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcBadFilm.metal` (Phase-1 done, Phase-2 open).

> 13 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
