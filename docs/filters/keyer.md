# Keyer

- **PAE class:** `Keyer`
- **Plugin UUID:** `41122549-B8A6-470E-94DA-211294D20B62`
- **Node names in corpus:** Keyer (44), Green Screen Keyer (1)
- **Corpus usage:** 22 files, 45 instances

## What it does

Keyer is FCP's flagship chroma/color keyer: it pulls a matte from a green- or blue-screen automatically (Autokey samples the dominant backing color) and knocks it out, with grouped controls for color selection, spill suppression, matte tools, and light wrap. In this corpus it appears mostly at defaults with an auto-sampled key. It is a full compositing keyer, not a simple image filter.

> **Note.** Not implemented. Many of this filter's real_params are persisted internal keyer engine state (MinGreen/MaxGreen/GreenChroma/Strength/etc.) rather than user knobs; only the user-facing groups are documented here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color Selection | group | - | - | The sampled backing color(s) and their selection tolerance. *(keyframed in 4 instances)* |
| Spill Suppression | group | - | - | Removes green/blue spill from the retained foreground. |
| Edge Distance | enum(int) | 3 | 0 .. 3 | Matte edge tightness (0-3). |
| Fill Holes | enum(int) | 0 | 0 .. 10 | Fills small transparent holes in the matte, 0-10. |
| Invert | bool | 0 | 0 .. 1 | Invert the matte (key the foreground instead of the backing). |
| Matte Tools | group | - | - | Shrink/erode/feather/levels controls on the pulled matte. |
| Light Wrap | group | - | - | Wraps background light around the foreground edges for realistic compositing. |
| Preserve RGB | bool | 0 | 0 .. 0 | Keep original RGB values rather than premultiplying by the matte. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the keyed result, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 14 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
