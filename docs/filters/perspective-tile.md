# Perspective Tile

- **PAE class:** `Perspective Tile`
- **Plugin UUID:** `A4519C66-916B-470E-B21F-9898EBEAE560`
- **Node names in corpus:** Perspective Tile (3), perst (2)
- **Corpus usage:** 5 files, 5 instances

## What it does

Perspective Tile maps the image into a four-corner quad (Top Left/Right, Bottom Left/Right) and then tiles that perspective-warped copy to fill the frame, producing a receding tiled-floor/wall look. The corner points define the perspective and Angle rotates the tiling.

> **Note.** Not implemented; description is the standard Apple Motion "Perspective Tile" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Top Left | point2D | - | - | Top-left corner of the perspective quad. |
| Top Right | point2D | - | - | Top-right corner of the perspective quad. |
| Bottom Right | point2D | - | - | Bottom-right corner of the perspective quad. |
| Bottom Left | point2D | - | - | Bottom-left corner of the perspective quad. |
| Center | point2D | - | - | Anchor of the tiling (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0.09727 .. 6.267 | Rotation of the tiling, radians (default 0). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPerspectiveTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPerspectiveTile` → [`HgcPerspectiveTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPerspectiveTile.metal)

```metal
//Metal1.0     
//LEN=00000002ff
[[ visible ]] FragmentOut HgcPerspectiveTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = dot(texCoord0, hg_Params[2]);
    r1.x = dot(texCoord0, hg_Params[1]);
    r1.zw = r1.xy/r0.xx;
    r1.xy = select(r1.xy, r1.zw, -fabs(r0.xx) < 0.00000f);
    r1.zw = r1.xy + hg_Params[0].zw;
    r1.xy = r1.zw/hg_Params[0].xy;
    r1.xy = fract(r1.xy);
    r1.xy = r1.xy*hg_Params[0].xy + -hg_Params[0].zw;
    r1.xy = r1.xy + hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}
```

### Metal fragment shader — `HgcSolidColor`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSolidColor` → [`HgcSolidColor.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSolidColor.metal)

```metal
//Metal1.0     
//LEN=00000000c9
[[ visible ]] FragmentOut HgcSolidColor_hgc_visible(const constant float4* hg_Params)
{
    FragmentOut output;

    output.color0 = hg_Params[0];
    return output;
}
```
