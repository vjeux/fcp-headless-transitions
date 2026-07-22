# Trails

- **PAE class:** `Trails`
- **Plugin UUID:** `2DB30B44-28E5-4A3C-BCBA-6B8D3966F4C6`
- **Node names in corpus:** Trails (31), Trails copy (1), Trails 2 (1), Trails 1 (1)
- **Corpus usage:** 25 files, 34 instances

## What it does

Trails is a temporal echo effect: it composites several delayed, fading copies of the moving image on top of the current frame, leaving a motion-blur/ghosting streak behind anything that moves. Duration sets how far back in time the echoes reach, Echoes how many copies, and Decay whether each successive echo fades out.

> **Note.** Not implemented; description is the standard Apple Motion "Trails" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Duration | float (seconds) | 0.1 | 0.01 .. 0.9 | Time span the trailing echoes cover, ~0.01-0.9s (default 0.1). *(keyframed in 3 instances)* |
| Echoes | enum(int) | 4 | 2 .. 12 | Number of delayed copies drawn, 2-12 (default 4). *(keyframed in 3 instances)* |
| Decay | float | 1 | 1 .. 1 | Whether/how much each successive echo fades toward transparent. Continuous, not a hard boolean. |
| Trail On | bool | 0 | 0 .. 1 | Enables the trailing behavior (vs pass-through). |
| Mix | float | 1 | 0.209 .. 1 | Wet/dry blend of the trailed result over the original, 0-1 continuous. *(keyframed in 14 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_PAETrails — temporal echo/feedback (accumulates previous frames)._

```
// feedback buffer F persists across frames:
F_new = max(current, F_prev · Decay)      // or lerp: mix(current, F_prev, Persistence)
out   = mix(current, F_new, Amount)
F_prev = F_new                             // store for next frame
```

Params: **Amount/Persistence** (how long trails last = Decay), **Mix**. This is a *temporal* filter —
it needs a persistent frame buffer (unlike the per-pixel filters). Head-start: keep a decaying
accumulation of prior frames; composite over the current. Note: requires frame-to-frame state in the
engine (most filters are stateless).
