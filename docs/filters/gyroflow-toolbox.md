# Gyroflow Toolbox

- **PAE class:** `Gyroflow Toolbox`
- **Plugin UUID:** `92ADB2F9-C649-48C2-B2D4-441CFC0633CB`
- **Node names in corpus:** Gyroflow Toolbox (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Gyroflow Toolbox is a third-party open-source FxPlug plugin that applies Gyroflow gyroscope-based video stabilization inside FCP, using a linked .gyroflow project. Its parameters are project/import/tools rigs and opaque project data, not built-in Motion image controls.

> **Note.** Third-party open-source plugin, NOT a built-in Apple filter (Gyroflow Toolbox). Project path/bookmark/data params are opaque project handles. No pixel behavior to document.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Import | group | - | - | Import a Gyroflow project / gyro data. |
| Gyroflow Parameters | group | - | - | Stabilization parameters read from the Gyroflow project. |
| Tools | group | - | - | Utility tools for the stabilization workflow. |
| File Management | group | - | - | Project file management controls. |
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1 continuous. |
| Unique Identifier | unknown | - | - | *(unverified)* |
| Gyroflow Project Path | unknown | - | - | *(unverified)* |
| Gyroflow Project Bookmark Data | unknown | - | - | *(unverified)* |
| Gyroflow Project Data | unknown | - | - | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

This is a **third-party plug-in**, not an Apple filter — its code ships in the vendor's own bundle, so there is nothing in FCP's binaries to decompile. Reverse-engineer it from the vendor bundle if an interoperable implementation is needed.
