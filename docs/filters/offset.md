# Offset

- **PAE class:** `Offset`
- **Plugin UUID:** `D6245DC0-5D17-4847-ABB0-C4D01C3FA3F7`
- **Node names in corpus:** Offset (347), Offset copy (13), Offset 1 (3), Offset 2 (3), Ofst (1), Offset H (1)
- **Corpus usage:** 228 files, 374 instances

## What it does

Offset scrolls the image by a horizontal and vertical pixel amount, wrapping it around the frame edges (a torus roll). It is the simplest positional filter, used to slide or wrap content for scrolling backgrounds and roll transitions.

> **Note.** Not implemented in the TS engine and no checked-in shader; described as the standard Motion "Offset" scroll/wrap. Whether the shipping filter wraps or clamps at the edge is unverified here (the wide negative observed range suggests large scrolls).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Horizontal Offset | float (pixels) | 0 | -4945 .. 1000 | Pixels to shift the image on X. Negative = left, positive = right. Content wraps around. Heavily keyframed for scrolls. *(keyframed in 65 instances)* |
| Vertical Offset | float (pixels) | 0 | -169 .. 1000 | Pixels to shift the image on Y. Negative = up, positive = down. Content wraps around. *(keyframed in 74 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the offset result over the original, 0-1 continuous. *(keyframed in 7 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcOffset.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcOffset.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcOffset
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Offset is a **homographic (perspective-matrix) coordinate warp with integer-cell snapping** — used
for tiling/scrolling with optional perspective. Two 3×3-style transforms (rows in
`hg_Params[5..7]` forward and `hg_Params[2..4]` inverse) are applied around a `floor()` that snaps
to a cell grid:

```
p    = (texCoord.x, texCoord.y, 1)
// forward homography (params 5,6,7 are the three matrix rows; row 7 = w-divide)
u    = dot(p, P5)/dot(p, P7)              // pre-snap coords in cell space
v    = dot(p, P6)/dot(p, P7)
uv   = (u,v) + hg_Params[0].zw            // offset
// conditional integer offset per axis (P1.x, P1.y) gated by sign tests, then:
uv   = floor(uv) + 0.5                    // snap to cell centre
// inverse homography (params 2,3,4) back to texture space
s    = dot((uv,1), P2)/dot((uv,1), P4)
t    = dot((uv,1), P3)/dot((uv,1), P4)
st   = (s,t)*hg_Params[8].zw + hg_Params[8].xy   // final scale+bias to UV
out  = sample(source, st)
```

The `floor(...)+0.5` is the tell: Offset quantizes to a grid of cells (like a coarse tile/scroll)
rather than a smooth shift. The two homography matrices allow a perspective/parallelogram offset,
not just axis-aligned translation.

**To finish:** decode `-[PAEOffset canThrowRenderOutput:]` to map the **Horizontal/Vertical
Offset** params → the `hg_Params[0].zw` / `hg_Params[1].xy` translation+integer-step slots, and the
Offset **mode** enum → whether the homography rows are identity (pure translate) or perspective.
The wide negative ranges observed in the corpus (`Offset` down to −147) are large multi-cell scrolls.

