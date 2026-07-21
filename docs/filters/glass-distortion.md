# Glass Distortion

- **PAE class:** `Glass Distortion`
- **Plugin UUID:** `ACDB3E3B-DEEA-4973-B918-2E355750B995`
- **Node names in corpus:** Glass Distortion (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Glass Distortion displaces the image using a supplied distortion map ("Distort Input"), as if viewed through textured glass. Amount sets the displacement strength and Fit/X-Y Scale fit the map to the frame. The distortion source is an image input.

> **Note.** Not implemented; description is the standard Apple Motion "Glass Distortion" filter. Distort Input is an image-map handle; X/Y Scale and Softness are map-fit/soften sub-knobs.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 110 | 110 .. 110 | Displacement strength, ~110 (default 110). *(keyframed in 2 instances)* |
| Fit | bool | 1 | 1 .. 1 | Fit the distortion map to the frame. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |
| Center | unknown | - | - | *(unverified)* |
| Distort Input | float | 0 | 0 .. 3099128836 | *(unverified)* |
| X Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Y Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Softness | float | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
