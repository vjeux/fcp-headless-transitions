# OpenEXR Tone Map

- **PAE class:** `OpenEXR Tone Map`
- **Plugin UUID:** `ECA5A044-91D9-46F2-B03A-A4D411EA1D16`
- **Node names in corpus:** OpenEXR Tone Map (45), OpenEXR Tone Map applied (1)
- **Corpus usage:** 16 files, 46 instances

## What it does

OpenEXR Tone Map compresses high-dynamic-range (HDR/EXR) imagery into displayable range using the classic OpenEXR exposure + knee tone-mapping. Exposure applies an overall stop adjustment, Defog subtracts a fog floor, and Knee Low/High define the shoulder where highlights are rolled off gracefully.

> **Note.** Not implemented; description is the standard OpenEXR exposure/knee tone-map (as exposed by Apple Motion).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Exposure | float (stops) | 0 | -10 .. 2.5 | Overall exposure adjustment in stops, ~-10..2.5 (default 0). |
| Defog | float | 0 | 0 .. 0 | Subtracts a small fog/veiling-glare floor before mapping. Continuous. |
| Knee Low | float | 0 | 0.3 .. 3 | Lower knee point where highlight roll-off begins, ~0.3-3 (default 0). |
| Knee High | float | 5 | 3.5 .. 7.5 | Upper knee point controlling how hard highlights compress, ~3.5-7.5 (default 5). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
