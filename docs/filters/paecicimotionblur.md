# PAECICIMotionBlur

- **PAE class:** `PAECICIMotionBlur`
- **Plugin UUID:** `9734F854-1BBF-11D9-94CD-000A95DF1816`
- **Node names in corpus:** Motion Blur (1), Motion Blur copy (1)
- **Corpus usage:** 1 files, 2 instances

## What it does

Motion Blur (PAECICIMotionBlur) applies a directional (linear) motion blur along Angle over a given Radius, simulating camera/subject movement. It is a Core-Image CIFilter wrapper. Radius sets the blur length, Angle its direction.

> **Note.** Not implemented; wraps Core Image's CIMotionBlur. Absolute Points is a coordinate-mode plumbing flag. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 20 | 4 .. 6 | Length of the directional blur, ~4-6 (default 20). |
| Angle | float (radians) | 0 | 0.7854 .. 2.356 | Direction of the motion blur, radians (default 0). |
| Absolute Points | bool | 1 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
