# NoiseDither

- **PAE class:** `NoiseDither`
- **Plugin UUID:** `1AF9D5FE-EC69-4021-BA8C-39F9BE738AF1`
- **Node names in corpus:** Reduce Banding (5)
- **Corpus usage:** 3 files, 5 instances

## What it does

NoiseDither ("Reduce Banding") adds a small amount of dithering noise to smooth gradients, breaking up visible color banding in low-bit-depth or heavily-graded footage. Noisiness sets the dither strength and Movement whether the noise animates per frame.

> **Note.** Not implemented; description is the standard Apple Motion "Reduce Banding" (NoiseDither) filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Noisiness | enum(int) | 0.5 | 1 .. 3 | Strength of the dithering noise, 1-3 (default ~1). |
| Movement | bool | 0 | 1 .. 1 | Whether the dither pattern animates each frame (vs static). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
