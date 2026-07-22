# Sixties

- **PAE class:** `Sixties`
- **Plugin UUID:** `67DF2D7D-BE87-437E-BE8D-8E989FA7E803`
- **Node names in corpus:** Sixties (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Sixties is a preset psychedelic 1960s color look (bold saturated color shifts / solarization). A canned stylize with only Mix exposed.

> **Note.** Not implemented; description is the standard Apple Motion "Sixties" preset. No creative parameters beyond Mix. (unverified) exact color transform.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 0 | Wet/dry blend of the sixties look, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.
