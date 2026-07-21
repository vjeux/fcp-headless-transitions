# Matte Magic

- **PAE class:** `Matte Magic`
- **Plugin UUID:** `01D6BDCE-4E12-11D9-9271-000A95AFC10A`
- **Node names in corpus:** mm (3), Matte Magic copy (2), Matte Magic (2)
- **Corpus usage:** 5 files, 7 instances

## What it does

Matte Magic refines an existing matte/alpha channel: it applies levels, shrink/erode, and feathering to clean up the edges of a key. Shrink/Erode tighten the matte and the Levels group remaps its density. It is a matte-cleanup companion, not a standalone key.

> **Note.** Not implemented; description is the standard Apple Motion "Matte Magic" matte-cleanup filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Levels | group | - | - | Black/white/gamma remap applied to the matte density. |
| Shrink | float | 0 | 0 .. 1.87 | Shrinks the matte inward, 0-~1.9 (default 0). |
| Erode | float | 0 | 0 .. 0.32 | Erodes matte edges, 0-~0.32 (default 0). |
| Feather | float | 0 | 0 .. 0 | Softens the matte edge. Continuous float (default 0). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
