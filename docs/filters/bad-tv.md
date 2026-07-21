# Bad TV

- **PAE class:** `Bad TV`
- **Plugin UUID:** `32AB5EE1-BACB-4B81-B44E-6D1E643C8D00`
- **Node names in corpus:** Bad TV (129), Bad TV copy (14), Bad TV 1 (8), Bad TV 2 (7), Roll 3 (5), Roll 2 (5)
- **Corpus usage:** 103 files, 199 instances

## What it does

Bad TV emulates analog-TV glitch: horizontal roll, wavy random-walk horizontal displacement, static/noise overlay, dark scan lines, chromatic aberration and desaturation. It is the CRT/VHS-breakup effect. Implemented and RE'd verbatim from the HgcBadTV / HgcBadTVNoise Metal shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Roll | float | 45 | -100 .. 400 | Vertical roll/scroll speed of the picture (the classic hold-vertical breakup). *(keyframed in 48 instances)* |
| Waviness | float | 10 | 0 .. 200 | Amplitude of the wavy horizontal displacement (random-walk per scanline), 0-200. *(keyframed in 22 instances)* |
| Static | float | 0.1 | 0 .. 1 | Amount of noise/static overlaid, 0-1. When >0 the noise-variant shader (HgcBadTVNoise) runs. *(keyframed in 5 instances)* |
| Saturate | float | -25 | -100 .. 100 | Saturation shift, -100..100 (negative bleeds color toward gray). *(keyframed in 4 instances)* |
| Color Synch | float | 0.8 | 0 .. 1 | Chromatic aberration / color-sync error, 0-1 (higher = more RGB split). *(keyframed in 5 instances)* |
| Number of Scan Lines | float | 100 | 1 .. 1035 | How many dark scan lines are drawn across the frame, 1-1035. *(keyframed in 2 instances)* |
| Scan Line Brightness | float | 1.5 | 0 .. 5 | Brightness floor of the dark scan-line bands, 0-5 (lower = darker lines). *(keyframed in 2 instances)* |
| Scan Line Percentage | float | 0.5 | 0 .. 1 | Duty cycle / thickness of the scan lines, 0-1. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glitched result over the clean original, 0-1 continuous. *(keyframed in 23 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/badtv.ts`](../../engine/src/compositor/filters/badtv.ts).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 3 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
