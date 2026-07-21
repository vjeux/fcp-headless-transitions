# Black Hole

- **PAE class:** `Black Hole`
- **Plugin UUID:** `1A32EFEF-6687-401B-A078-300A7AE8F621`
- **Node names in corpus:** Black Hole (9), Black Hole In (2), infoOSC 2 (1), reflectX (1), Black Hole 1 (1), Black Hole 2 (1)
- **Corpus usage:** 11 files, 17 instances

## What it does

Black Hole warps the image radially as if pulled toward a gravitational point at Center: it displaces sample positions away from the center as a function of distance so the picture appears sucked inward, composited over the original. Amount is the pull strength (FCP UI: "Pulls an object toward a point"). Fully reverse-engineered: it is a MIP pyramid of radial-warp passes whose level count = max(1, round(log2(Amount/8))).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 150 | 0 .. 1000 | Pull strength toward the center, 0-1000 (default 150). Drives the number of warp pyramid levels. *(keyframed in 6 instances)* |
| Center | point2D | - | - | The gravitational center (X,Y) in normalized frame coordinates (default 0.5,0.5). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/blackhole.ts`](../../engine/src/compositor/filters/blackhole.ts).
