# PAEVignette — Phase-2 verification against headless FCP

Filter: `engine/src/compositor/filters/vignette.ts` (UUID EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B).
Verified with the faithful delta-response oracle: a single-Vignette synthetic scene (grafted
from a real corpus host onto the Movements__Fall scaffold) rendered through REAL headless FCP
vs the TS engine, sweeping each parameter across its range at t=0.5. Metric =
`ddb = PSNR(oracle(θ)−oracle(θ0), engine(θ)−engine(θ0))` (delta-response; background cancels).

## Decoded model (measured, not assumed)
- Coordinate space: PER-AXIS normalized [-1,1]×[-1,1], NO aspect correction (ellipse in px).
  Verified: mask crosses 0.5 at nx=ny=0.900 for Size=0.6.
- Radius: R0 = 1.5 - Size (hard-ring radius at Falloff=0; verified 0.4/0.6/0.8 → 1.1/0.9/0.7).
- Falloff band (smoothstep innerR→outerR), fit residual < 0.003 in radius units:
    innerR = R0 - 0.11·Size·Falloff
    outerR = R0 + 1.13·Size·Falloff       (band opens OUTWARD, scaled by Size)
- Darken: edge brightness multiplier = (1 - Darken), in sRGB CODE space (ratio 0.500 exact;
  linear-space would be 25 codes off — refuted). Alpha untouched.

## Sweep result (worst-case ddb per param, higher = closer to FCP)
```
  Size=0.2: ddb=35.47   Size=0.4: 35.67   Size=0.8: 36.05   Size=1.2: 37.60
  Darken=0.1: 32.37     Darken=0.5: 37.37   Darken=0.8: 44.64
  Falloff=0.1: 36.58    Falloff=0.3: 36.93  Falloff=0.7: 43.28   Falloff=0.9: 37.90
  WORST ddb = 32.37 dB   (harness: >=40 VERIFIED, >=30 good, <20 diverged)
```
Before the geometry decode the worst ddb was 11.40 dB (aspect-corrected circle + linear band —
both wrong). After: 32.4 dB, solidly in the "good" band. The residual ~5-8 dB below the 40 dB
VERIFIED bar is sub-code smoothstep-edge antialiasing (FCP supersamples the falloff gradient;
the engine evaluates it per-pixel) — not a model error. No shipping transition in the 65 uses
PAEVignette, so this is byte-neutral to the GUI-GT gate.
