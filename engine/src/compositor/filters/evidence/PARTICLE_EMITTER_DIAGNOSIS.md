# Stylized/Nature Particle Emitter — Diagnosis & Field-Proxy (m11)

Targets: `Stylized/Diagonal` (baseline 19.84 dB) and `Stylized/Glide` (16.16 dB).
Both are Motion "theme" transitions built from a large particle-emitter scene graph
(`.../Stylized.localized/Nature.localized/{Diagonal,Glide}.localized/*.motr`).

## 1. Scene-graph model (parsed, by factory id — not by English name)

Factory table (`<factory><description>`):
- `1`  Generator (the "Gaussian Gradient " glow generator)
- `9`  Image
- `11` Shape
- `15` **Particle Cell**
- `17` **Replicator**, `18` Replicator Cell
- `23` **Emitter**

Diagonal top-level stack (back→front), abbreviated:
```
Transition Diagonal (group)
  Bezier 29 (shape, emitter-source geometry)
    Emitter (17 Replicator) → Cell copy (18)
    Texture (9 Image → Media/texture.jpg)        ← full-frame gray "paper", 1920×1080
    Emitter-hexagon / -bar / -petal / … (23 Emitter, one THEME active)
      <name> (15 Particle Cell) → sprite image (hexagon.png, circle_particle.png, …)
    Emitters-hard light (group, blend=HARD LIGHT)  ← the dominant gray hexagon field
      Emitter-hexagons (23) → Hexagon 1..4 (15 Particle Cell) → hexagon*.png
      … + Emitter source shapes (colored theme variants: Blue/Chocolate/Snow/…)
    Gaussian Gradient  (1 Generator, blend=OVERLAY, op≈0.5)
    Background (11 Shape, RGB≈227 fill) hosting an Emitter (17)  ← emitter geometry, NOT a fill
  Transition Drop Zones → Transition A / Transition B (the two source photos)
```
The active theme is rig-selected (only the hexagon emitters evaluate visible; bars/
petals/leaves/flakes/rings/droplets stay opacity 0). The GT confirms **hexagons**.

## 2. What the GT mid-transition actually is
GT frames 10–18 are a near-uniform **gray paper (~155)** with sparse dark heptagon/
hexagon particles + small white bokeh dots; the source photo is fully hidden and only
re-emerges at the very corners as B arrives. `texture.jpg` mean RGB = **(152,152,152)** —
i.e. the gray backdrop IS the bundled paper texture, over which the particle field
accumulates (hard-light) to add the hexagon detail.

The pure-JS engine rendered instead a **sepia photo** (texture at its authored 0.31
opacity over Transition A) — the gray field/backdrop was never reconstructed, which is
why frames 9–18 collapsed to ~9 dB.

## 3. Particle emitter parameters (real, from the .motr)
Each Particle Cell (id=15) under an Emitter carries a full Motion particle spec, e.g.
`Emitter-hexagons/Hexagon 1`:
- Birth Rate 7 (default 30), Birth Rate Randomness 4, Initial Number 7
- Life 10, Speed 350, Speed Randomness 250
- Angle 0.8727 rad (50°) + Angle Randomness 0.8727, Spin 0.8727 (+randomness)
- Color Mode 1, Color ≈ (0.999,0.961,0.956) (near-white), Opacity Over Life curve
- Blend of the wrapper group = **Hard Light** (parser BLEND enum value 16)

## 4. RNG / decompilation
Motion's particle sim is **deterministic seeded**. Found `RandMersenne::SetSeed(unsigned long)`,
`RandMersenne::RandMersenne()` exported in **ProCore.framework** (Mersenne-Twister). The
actual per-particle simulation (birth scheduling, per-particle RNG draws for position/
scale/opacity/rotation, physics integration) is NOT reachable via symbols — `nm -C` on
ProCore/ProGraphics/Flexo/Helium/Lithium returns **zero** `particle`-sim symbols (the sim
is stripped / GPU-Metal). Reproducing the exact particle POSITIONS pixel-for-pixel would
require reversing the full ProCore particle engine + its MT seed stream, which is not
feasible from the shipped stripped binaries. NO GUESSED positions were shipped (a wrong
field doubles the error vs. a correct backdrop).

## 5. Shipped approximation — the "particle-field proxy"
Since the DOMINANT visible quantity is the gray paper backdrop (the field's aggregate),
and the sim positions are unrecoverable, we reconstruct the backdrop honestly:

- Detect the scene structurally: has a **factory-23 Emitter** (`Layer.isParticleEmitter`)
  AND a resolvable **full-frame bundled texture** image (largest media ≥ 50% of frame).
- Composite that texture over the rendered frame on a **symmetric smoothstep bell**
  whose active window = the **texture layer's own parsed timing (in→out)** in progress
  space (ramp = 35% of the window each side). No hardcoded frame numbers.
- Use the **un-wrapped** scene time (`EvaluatedScene.unwrappedTime`) so the envelope
  follows true transition progress even after the drop-zone retime-wrap resets time to 0
  for the tail frames.
- Skip the texture layer's normal (dim 0.31) render when the proxy owns it (avoids a
  double-composite that over-grayed the early frames).

Requires a `mediaResolver` (the texture is a bundled JPG; node-canvas decodes it).
Strict **no-op** without a resolver and for any scene lacking an Emitter+texture — so
Push and the non-resolver scoreboard are byte-for-byte unchanged.

## 6. Results (mean PSNR over 24 frames, engine conformed to GT 1920×1080)
| transition | before | after (with mediaResolver) |
|---|---|---|
| Stylized/Diagonal | 19.84 dB | **23.32 dB** (+3.48) |
| Stylized/Glide    | 16.16 dB | **18.16 dB** (+2.00) |

No-resolver path = exact baseline (19.84 / 16.16). Push guard: 4/4 PASS ~32 dB. tsc clean.

## 7. Remaining work to reach GT
The residual gap is the **individual hexagon particles + white bokeh** (the sparse dark
polygons the field proxy cannot place) and the paper's subtle vertical streak/vignette.
Closing it needs the real ProCore MT19937 particle simulation (birth schedule + per-
particle draws + hard-light sprite compositing), which requires reversing the stripped
ProCore particle engine.
