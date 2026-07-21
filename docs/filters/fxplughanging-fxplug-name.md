# FxPlugHanging::FxPlug Name

- **PAE class:** `FxPlugHanging::FxPlug Name`
- **Plugin UUID:** `B622EAC8-C911-4203-9155-3FFD117CCD52`
- **Node names in corpus:** FxPlugHanging::FxPlug Name (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

This is not a real filter -- it is a placeholder/orphan record left by an FxPlug plugin that failed to load or resolve its name ("FxPlugHanging::FxPlug Name" is the literal fallback identifier). It carries only a generic Input group and Mix. No image behavior can be attributed to it.

> **Note.** Not a built-in filter. This is a dangling/unresolved third-party FxPlug plugin record (name failed to resolve). No pixel behavior to document.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Input | group | - | - | Generic passthrough input group of the unresolved plugin. |
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
