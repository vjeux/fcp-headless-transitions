# Earthquake

- **PAE class:** `Earthquake`
- **Plugin UUID:** `DEB7CD03-0C92-416A-B42A-656FB37530A1`
- **Node names in corpus:** Earthquake (122), Earthquake copy (2), Earthquake 3 (2), Earthquake 2 (2), Earthquake 1 (2), OSC 03 (2)
- **Corpus usage:** 128 files, 145 instances

## What it does

Earthquake shakes and twists the frame with a per-frame pseudo-random rigid transform: a small rotation about an Epicenter plus horizontal/vertical translation, optionally composited across several jittered Layers for a blurred multi-exposure shake. Amplitudes are deterministic functions of Twist/Shake and a seeded RNG. Implemented and RE'd (twist is +/- Twist*0.1 radians, shakes are +/- amount*25 pixels).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Twist | float (radians scale) | 0.1 | 0 .. 0.43 | Rotational shake amplitude. Per-frame rotation is +/- Twist*0.1 radians about the epicenter. 0 = no rotation. *(keyframed in 74 instances)* |
| Horizontal Shake | float (pixels scale) | 0.1 | 0 .. 1 | Horizontal translation amplitude. Per-frame shift is +/- Shake*25 pixels. Keyframed. *(keyframed in 74 instances)* |
| Vertical Shake | float (pixels scale) | 0.1 | 0 .. 1 | Vertical translation amplitude. Per-frame shift is +/- Shake*25 pixels. Keyframed. *(keyframed in 74 instances)* |
| Layers | enum(int) | 1 | 1 .. 5 | Number of jittered copies blended together, 1-8. >1 blurs the shake into a multi-exposure smear. |
| Epicenter | point2D | - | - | Center of the rotational shake (X,Y) in normalized frame coordinates. |
| Random Seed | float (int seed) | 0 | 0 .. 1000 | Seed for the shake RNG; changing it reshuffles the jitter pattern. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the shaken result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/earthquake.ts`](../../engine/src/compositor/filters/earthquake.ts).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 8 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
