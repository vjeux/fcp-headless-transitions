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
