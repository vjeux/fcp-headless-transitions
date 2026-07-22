# New York

- **PAE class:** `New York`
- **Plugin UUID:** `6E61328D-0355-41B3-AD0C-7CAC8D9B6F8C`
- **Node names in corpus:** New York (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

New York is a preset color-grade look (part of Motion's named-city film-look presets). It exposes only Mix.

> **Note.** Not implemented; a preset city-look grade with only Mix exposed. (unverified) exact transform.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 0 | Wet/dry blend of the New York look, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.
