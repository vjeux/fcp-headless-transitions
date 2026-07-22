# CorridorKey by LateNite

- **PAE class:** `CorridorKey by LateNite`
- **Plugin UUID:** `D29F6B10-4F3A-4C5E-B611-7A2E8D4C9F08`
- **Node names in corpus:** CorridorKey by LateNite (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

CorridorKey by LateNite is a third-party FxPlug keyer plugin (by LateNite Films / CoreMelt-style vendor), not a built-in Apple filter. It is an AI/analysis-driven matte generator with grouped controls for analysis data, subject points, matte, edge & spill, and temporal stability. Its parameters are the plugin's own rig, not standard Motion image knobs.

> **Note.** Third-party plugin, NOT a built-in Apple filter (CorridorKey by LateNite). Analysis Data / Subject Points are opaque analysis blobs. No pixel behavior to reverse-engineer here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Settings | group | - | - | Main keyer settings. |
| Interior Detail | group | - | - | Controls for retaining interior matte detail. |
| Matte | group | - | - | Matte density / cleanup controls. |
| Edge & Spill | group | - | - | Edge treatment and spill suppression. |
| Edge Refinement | group | - | - | Fine edge refinement controls. |
| Temporal Stability | group | - | - | Frame-to-frame matte stabilization. |
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1 continuous. |
| Analysis Data | unknown | - | - | *(unverified)* |
| Subject Points | unknown | - | - | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This is a **third-party plug-in**, not an Apple filter — its code ships in the vendor's own bundle, so there is nothing in FCP's binaries to decompile. Reverse-engineer it from the vendor bundle if an interoperable implementation is needed.
