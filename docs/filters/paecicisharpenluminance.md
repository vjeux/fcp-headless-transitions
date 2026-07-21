# PAECICISharpenLuminance

- **PAE class:** `PAECICISharpenLuminance`
- **Plugin UUID:** `1386B4FC-1BBF-11D9-94CD-000A95DF1816`
- **Node names in corpus:** Sharpen Luminance (1), Sharpen Luminance copy (1)
- **Corpus usage:** 1 files, 2 instances

## What it does

Sharpen Luminance (PAECICISharpenLuminance) is a Core-Image-backed sharpen that boosts detail on the luminance channel only, avoiding color fringing. Sharpness sets the strength. It is a CIFilter wrapper (the "CICI" in the class name).

> **Note.** Not implemented; wraps Core Image's CISharpenLuminance. Absolute Points is a coordinate-mode plumbing flag. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Sharpness | float | 0.4 | 0 .. 0 | Luminance sharpen strength, default ~0.4. Continuous float, NOT a boolean. |
| Absolute Points | bool | 1 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
