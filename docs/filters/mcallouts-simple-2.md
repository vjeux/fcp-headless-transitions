# mCallouts Simple 2

- **PAE class:** `mCallouts Simple 2`
- **Plugin UUID:** `A6CA56AA-0861-40BE-804D-F62FCC98B9C1`
- **Node names in corpus:** mCallouts Simple 2 (34), mCallouts Simple 2 1 (16)
- **Corpus usage:** 50 files, 50 instances

## What it does

This is a third-party callout template (MotionVFX 'mCallouts'), not a built-in FCP image filter -- it is a published effect/generator that draws an animated callout line + title that tracks a point on screen. Its parameters are template rig controls (Track/Title/Image position groups and OSC settings), not image-processing knobs.

> **Note.** This is a third-party MotionVFX callout template, NOT a built-in Apple filter. It appears in the corpus purely because templates embed it; its parameters are animation-rig groups (position/scale/angle tracks) rather than pixel operations. No image-processing behavior to reverse-engineer.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Track | group | - | - | Rig group positioning/scaling the tracked callout endpoint (Position X/Y, Scale X/Y, Z Angle). |
| Title | group | - | - | Rig group positioning the title card (Movement, Far/Close, Position X/Y). |
| Image | group | - | - | Rig group binding the title/track/line elements together. |
| OSC | group | - | - | On-screen-control settings group (Magnification, Settings). |
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1. Always 1 in the corpus. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

This is a **Motion template preset** (a `· KF` / packaged template), not a filter class with its own compiled algorithm. There is no Apple per-pixel code to decompile — it is a composition of other primitives with saved keyframes. The decompilable pieces are whatever built-in filters/behaviors the preset instantiates (documented in their own pages).
