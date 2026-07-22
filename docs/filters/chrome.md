# Chrome

- **PAE class:** `Chrome`
- **Plugin UUID:** `0A69EDEE-4A75-4685-930F-8A649BB0C7ED`
- **Node names in corpus:** Chrome (5)
- **Corpus usage:** 4 files, 5 instances

## What it does

Chrome is a preset that gives the image a shiny, metallic chrome-reflection look via a canned bump/environment treatment. Only Mix is exposed.

> **Note.** Not implemented; description is the standard Apple Motion "Chrome" preset. No creative parameters beyond Mix. (unverified) exact reflection model.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0.5 .. 1 | Wet/dry blend of the chrome look, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.
