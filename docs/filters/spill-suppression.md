# Spill Suppression

- **PAE class:** `Spill Suppression`
- **Plugin UUID:** `4CE35227-69BA-4F0B-AF5E-299526610307`
- **Node names in corpus:** ss (4), Spill Suppression (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Spill Suppression removes colored spill (usually green or blue backing-screen reflections) from a keyed foreground by pulling the chosen Color out of the image. Level sets how aggressively the spill color is neutralized. It is a keyer companion filter.

> **Note.** Not implemented; description is the standard Apple Motion "Spill Suppression" filter. Spill Contrast/Tint/Saturation are internal sub-controls.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color | color | - | - | The spill color to suppress (typically the backing screen's green/blue). |
| Level | float | 0.46 | 0.46 .. 0.46 | How strongly the spill color is neutralized, ~0.46 (default 0.46). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Tint | bool | 0 | 0 .. 0 | *(unverified)* |
| Saturation | float | 1 | 1 .. 1 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
