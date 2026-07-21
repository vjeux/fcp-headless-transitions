# Bleach

- **PAE class:** `Bleach`
- **Plugin UUID:** `2DCA84A9-B341-4818-8EC1-D55E33D06CBD`
- **Node names in corpus:** Bleach (4)
- **Corpus usage:** 4 files, 4 instances

## What it does

Bleach is a preset bleach-bypass film look: it desaturates and boosts contrast to mimic skipping the bleach step in film development, giving a gritty, silvery, high-contrast image. A canned look with only Mix exposed.

> **Note.** Not implemented; description is the standard Apple Motion "Bleach" (bleach-bypass) preset. No creative parameters beyond Mix. (unverified) exact curve.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 0 | Wet/dry blend of the bleach-bypass look, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
