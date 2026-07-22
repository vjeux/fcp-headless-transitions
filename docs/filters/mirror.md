# Mirror

- **PAE class:** `Mirror`
- **Plugin UUID:** `E1134541-27A1-45CD-972B-AD61D9528316`
- **Node names in corpus:** Mirror (11), Mirror 2 (7), Mirror 1 (7), Mirror 3 (6), Bottom (3), Top (3)
- **Corpus usage:** 14 files, 56 instances

## What it does

Mirror reflects the image across a line through Center at the given Angle, replacing everything on one side of the line with a mirrored copy of the other side. Rotating the Angle changes the axis of reflection.

> **Note.** Not implemented; description is the standard Apple Motion "Mirror" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Point the mirror line passes through (X,Y) in normalized frame coordinates. *(keyframed in 15 instances)* |
| Angle | float (radians) | 0 | 0 .. 4.712 | Angle of the mirror axis, radians (0-~3pi/2). |
| Repeat Border Pixels | bool | 1 | 1 .. 1 | Clamp/repeat edge pixels rather than leaving gaps at the reflection edge. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcMirror.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcMirror.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcMirror
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Mirror reflects the image across a line through a center point: it rotates into the mirror-line
frame, takes the absolute value of one axis (the fold), then rotates back.

```
d   = texCoord - Center                     // Center = hg_Params[0]
u   = dot(d, hg_Params[1].xy)               // project onto the mirror axis (rotation into line frame)
v   = dot(d, hg_Params[1].zw)               // perpendicular axis
u   = abs(u)                                // THE FOLD — everything mirrors onto one side
uv.x= dot((u,v), hg_Params[2].xy) + Center  // rotate back (inverse basis)
uv.y= dot((u,v), hg_Params[2].zw) + Center
out = sample(source, (uv + hg_Params[3].xy)*hg_Params[3].zw)
```

`hg_Params[1]` = the mirror-line orientation (its angle = the reflection axis, from a **Angle**
param), `hg_Params[0]` = **Center** of the mirror line, `hg_Params[2]` = inverse basis. The single
`abs()` is the whole trick. Head-start: rotate coords by −Angle about Center, `x = |x|`, rotate back,
gather.

