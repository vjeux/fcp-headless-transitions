# Canvas · KF

- **PAE class:** `Canvas · KF`
- **Plugin UUID:** `8CF7922C-58A1-45DD-A21F-F29924FF3499`
- **Node names in corpus:** Canvas · KF (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

"Canvas · KF" is a third-party published FxPlug/Motion template (the " · KF" suffix marks a keyframe-rig template, a naming convention used by template vendors), not a built-in Apple image filter. It carries only an opaque rig parameter and a host Mix; the corpus records it because a template embeds it. No image-processing behavior to attribute.

> **Note.** Third-party template effect ("Canvas · KF"), NOT a built-in Apple filter. Its single "?" parameter is an unresolved rig group. No pixel behavior to document.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
