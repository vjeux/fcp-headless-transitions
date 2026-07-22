# Cool

- **PAE class:** `Cool`
- **Plugin UUID:** `9B01A4D7-9B46-4BE0-8074-EB3F7A5CEDDB`
- **Node names in corpus:** Cool (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Cool is a preset that shifts the image's white balance toward cooler (bluer) tones. A canned look with only Mix exposed.

> **Note.** Not implemented; a preset cool color look with only Mix exposed. (unverified) exact transform.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | - | - | Wet/dry blend of the cool grade, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.
