# Extrude

- **PAE class:** `Extrude`
- **Plugin UUID:** `85C01B33-3560-45E5-959E-5C265B0A8977`
- **Node names in corpus:** Extrude (91), Extrude  copy (20), Direction (2), Extrude copy (2), Extrude  (1), OSC 1 (1)
- **Corpus usage:** 60 files, 120 instances

## What it does

Extrude gives a 2D layer a faux-3D extruded depth: it projects the alpha shape back along an Angle by a Distance, shading the extruded sides between Front and Back brightness for a beveled/3D-text look. Not implemented; described from the standard Motion "Extrude".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Extrude" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Distance | float (pixels) | 50 | 0 .. 500 | Depth of the extrusion, 0-500 (default 50). 0 = flat. *(keyframed in 3 instances)* |
| Angle | float (radians) | pi/4 (0.7854) | 0 .. 6.265 | Direction the shape is extruded toward, 0..2pi (default pi/4 = 45 deg). *(keyframed in 1 instance)* |
| Extrude Style | bool/enum | 0 | 0 .. 1 | Style of the extrusion (e.g. solid vs gradient sides). |
| Gradient | group | - | - | Gradient applied along the extruded depth (RGB, Opacity). |
| Face Brightness | float | 1 | 0 .. 8 | Brightness of the front face, 0-8 (default 1). |
| Front Brightness | float | 0.7 | 0 .. 1.42 | Brightness at the near end of the extruded sides, 0-1.42. |
| Back Brightness | float | 0.3 | 0 .. 2 | Brightness at the far end of the extruded sides, 0-2. |
| Back Size | float | 1 | 0.78 .. 1 | Scale of the far face relative to the front, 0.78-1 (perspective taper). *(keyframed in 1 instance)* |
| Clipping | float | 0 | 0 .. 99 | Clips the extrusion depth, 0-99. *(keyframed in 4 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the extruded result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
