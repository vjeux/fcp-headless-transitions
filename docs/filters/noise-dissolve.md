# Noise Dissolve

- **PAE class:** `Noise Dissolve`
- **Plugin UUID:** `ABFED81E-35D9-429C-AB47-438C1FB5D9DE`
- **Node names in corpus:** Noise Dissolve (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Noise Dissolve is a transition filter that dissolves the image away through a random noise pattern: as Dissolve Amount rises, pixels drop out in a random (Random Seed) speckle order until the image is gone. Used as a grainy dissolve transition.

> **Note.** Not implemented; description is the standard Apple Motion "Noise Dissolve" transition filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Dissolve Amount | float | - | - | Fraction of the image dissolved away, 0-1 (animate to drive the transition). *(keyframed in 1 instance)* |
| Random Seed | float (int seed) | - | - | Seed for the dissolve noise pattern; changing it reshuffles the speckle order. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcNoiseDissolve` embedded shader. Decoded functional form:_

Noise Dissolve is a **threshold-on-noise reveal** — a per-pixel noise field (`color1`, upstream) is
compared to a threshold; pixels whose noise is below the threshold become transparent, so raising
the threshold dissolves the image away in a random speckle (a transition wipe).

```
n    = color1.x                              // noise value at this pixel (0..1)
keep = (n >= hg_Params[0])                   // hg_Params[0] = dissolve Threshold (animate 0→1)
out.rgb = (color0.rgb/max(a,1e-6)) * (a·keep)   // pass through where kept, transparent where not
out.a   = a·keep
```

`hg_Params[0]` = **Threshold / progress** (animatable → the dissolve). The noise *pattern* (grain
size, seed) is set by the upstream generator. Head-start: `out = (noise >= t) ? src : transparent`;
drive `t` over the transition. A soft edge can be added by `smoothstep(t-w, t+w, noise)` on alpha.
