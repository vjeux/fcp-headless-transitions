# Hue/Saturation Curves

- **PAE class:** `Hue/Saturation Curves`
- **Plugin UUID:** `23723AD7-62C4-4ED0-A8C6-FA5A2D7162E4`
- **Node names in corpus:** Hue/Saturation Curves copy (2), Hue/Saturation Curves (2)
- **Corpus usage:** 2 files, 4 instances

## What it does

Hue/Saturation Curves is FCP's curve-based secondary color tool: it lets you reshape color via curves keyed on hue, saturation, and luma (Hue vs Hue, Hue vs Sat, Hue vs Luma, Luma vs Sat, Sat vs Sat, plus a custom range). It is a full curve panel, not a single-slider filter.

> **Note.** Not implemented; description is the standard FCP "Hue/Saturation Curves" tool.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Hue vs. Hue | curve | - | - | Shifts hue as a function of hue (rotate specific hues). |
| Hue vs. Saturation | curve | - | - | Adjusts saturation as a function of hue. |
| Hue vs. Luma | curve | - | - | Adjusts luma as a function of hue. |
| Luma vs. Saturation | curve | - | - | Adjusts saturation as a function of luma. |
| Saturation vs. Saturation | curve | - | - | Adjusts saturation as a function of saturation. |
| Custom vs. Saturation | curve | - | - | Adjusts saturation for a custom-picked color range. |
| Preserve Luma | bool | 1 | 1 .. 1 | Keep luminance constant while shifting color. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
