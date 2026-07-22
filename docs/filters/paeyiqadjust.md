# PAEYIQAdjust

- **PAE class:** `PAEYIQAdjust`
- **Plugin UUID:** `CECECA09-7686-4EBA-A9AA-585A3F5B322E`
- **Node names in corpus:** YIQ Adjust (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

YIQ Adjust (PAEYIQAdjust) is the NTSC-YIQ analogue of YUV Adjust: it converts to the YIQ color space and lets you tweak luma (Y) and the I/Q chroma axes independently. This corpus record is at defaults so only Mix is sampled.

> **Note.** Not implemented; description is the standard Apple Motion "YIQ Adjust" filter. The Y/I/Q channel sliders were left at defaults (not sampled) in the single corpus instance; only Mix appears.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcYIQAdjust` embedded shader. Decoded functional form:_

YIQ Adjust adds a **YIQ-space offset** to the image — you specify a shift in the Y (luma), I, and Q
(chroma) axes, and it's converted to an RGB offset and added:

```
c    = clamp(rgb / max(a,1e-6), 0, 1)
// YIQ→RGB matrix (the shader's baked constants, standard NTSC YIQ):
//   R = Y + 0.956·I + 0.621·Q
//   G = Y − 0.272·I − 0.647·Q
//   B = Y − 1.105·I + 1.702·Q
offset = YIQtoRGB( hg_Params[0].xyz )     // hg_Params[0] = (ΔY, ΔI, ΔQ) user adjustment
out.rgb= clamp(c + offset, 0, 1) * a
```

The matrix rows `(1, 0.956, 0.621)`, `(1, −0.272, −0.647)`, `(1, −1.105, 1.702)` are the textbook
NTSC YIQ→RGB transform. `hg_Params[0]` = the **Y/I/Q offsets**. Head-start: convert the YIQ
adjustment to an RGB bias via that matrix, add. (YUV Adjust is the same idea with the YUV/Rec.601
matrix; no dedicated shader — same additive-offset structure.)
