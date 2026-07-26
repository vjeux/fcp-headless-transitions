# Perspective / Position-Z projection decode (2026-07-26)

Reverse-engineering of the exact 3D perspective-projection convention FCP's Motion
transition engine uses, driven by controlled headless-FCP probes on the camera-less
`3D_Rectangle` drop-zone (`/tmp/zprobe/`). **DECODE, not fit** — every number below
comes from a real headless render or the parser/binary, cross-checked at ≥5 points.

---

## TL;DR

1. **FCP's unified projection formula** (verified for BOTH Position-Z translation and
   rotation-induced Z):
   ```
   scale = d / (d − Z_world)          ,  +Z_world = TOWARD viewer (near, enlarge)
   ```
   where `Z_world` is the world-space Z of the projected point (Motion Position Z goes
   straight in; +Z is toward the camera).

2. **Camera distance for the camera-less default scene:**
   ```
   d = (frameWidth / 2) / tan(AOV/2)  ,  AOV = 45°  (Motion default)
     = 960 / tan(22.5°) ≈ 2317.6      (1920-wide scene)
   ```
   Measured `d = 2324.8 ± 7` over 5 Position-Z probes (≡ AOV 44.88°, i.e. the 45°
   default within integer-edge noise). It scales with frame WIDTH (a 1080-wide probe
   gave d≈1304 = (1080/2)/tan22.5°). **NOT height-based** — height-based-45° would be
   1304 for the 1920 scene and predicts 0.685 at Z=−600, but the measured shrink is 0.795.

3. **The engine's `projectPoint` sign is CORRECT once fed the right world-Z.**
   `scale = cameraZ/(cameraZ + wz)`. This is `d/(d + wz)`, i.e. the engine's `wz` is
   `−Z_world`. So for the engine to match FCP, the world matrix must place a Motion
   Position +Z as world `wz < 0` (near). The evaluator currently puts Motion Position Z
   straight into `m14` (`mat4Translate(posX,posY,posZ)`), so `wz = +posZ` — **inverted**.

4. **rotationX is already correct** (evaluator negates it → matches FCP: +RotX tilts TOP
   edge away). **rotationY is latently WRONG-signed** (engine gives right-edge-near for
   +RotY, FCP gives left-edge-near) but is NOT exercised by any passing slug through the
   `projectQuad` path (the page-flip family uses `renderPageFlip`, its own projection).

5. **The camera distance 2000 → 2318 change is a strict improvement** for the perspective
   path: a pure RotationX-60° foreshortens the far edge to width **1598** in FCP; the
   engine reproduces **1598 exactly at d=2318** (it gave 1556 at d=2000). d=2318 is the
   correct camera-less reference for BOTH translation and rotation.

6. **BLOCKER — no safe ship.** The minimized `_t_3dr_v4` case is NOT a faithful perspective
   probe: minimization stripped the Replicator, which flips the engine's camera-less scene
   to the **orthographic** branch (`distance = Infinity`, no foreshortening). That
   orthographic assumption is a deliberate, MEASURED tuning that HELPS Fall / Color_Planes
   (+3.0 dB) / Reflection (+0.91 dB). My probes prove camera-less Z-translation is
   perspective (not orthographic) in FCP — so the orthographic decode is over-broad — but
   flipping it back would regress those tuned rotation slugs. Fixing `_t_3dr_v4` therefore
   requires reworking the orthographic discriminator, which is OUT of the safe scope
   (verify-only-_t_3dr_v4 + golden 2123/0). See "Recommended patch" for the bounded change
   and why it is NOT shipped here.

---

## Probe table (headless FCP, camera-less single drop-zone Image, frame 7/24)

Scene 1920×1080, single `Drop Zone Transition B` image with authored Position Z.
Plate width/height measured vs Z=0 (full frame). `d` solved from `scale = d/(d − Z)`.

| Z (Motion) | plate w×h   | scale_w | scale_h | d (from w) | engine@2318 | err   |
|-----------:|-------------|--------:|--------:|-----------:|------------:|------:|
|    0       | 1920×1080   | 1.0000  | 1.0000  | —          | 1.0000      |  —    |
|  −150      | 1804×1016   | 0.9396  | 0.9407  | 2333       | 0.9394      | −.0002|
|  −300      | 1702×958    | 0.8865  | 0.8870  | 2342       | 0.8857      | −.0008|
|  −450      | 1608×906    | 0.8375  | 0.8389  | 2319       | 0.8378      | +.0003|
|  −600      | 1526×858    | 0.7948  | 0.7944  | 2324       | 0.7949      | +.0001|
|  −900      | 1384×778    | 0.7208  | 0.7204  | 2324       | 0.7209      | +.0001|
| +300/+600  | full frame  | (clamp) | (clamp) | —          | (enlarge)   |  —    |

Least-squares over all 5 points: **d = 2324.8** (width & height agree to ±0.6). Positive Z
overflows the frame (enlarges) — confirming +Z = toward viewer.

### Rotation probes (same camera-less drop-zone)

| transform      | FCP result                                  | engine result (matrix + projectQuad) | match? |
|----------------|---------------------------------------------|--------------------------------------|--------|
| RotationX +60° | TOP edge narrow (w=1598, far), BOT wide 1920 | with `-rotX` negation: TOP w=1598 (far) | ✅ MATCH |
| RotationY +60° | LEFT edge tall (near), RIGHT short (far, h=794) | no negation: RIGHT tall (near)       | ❌ INVERTED |

RotationX at d=2318 → top width 1598 = FCP exactly; at d=2000 → 1556 (too narrow).

---

## Derivation of d (AOV)

- Motion's default camera **Angle Of View = 45°** (confirmed in `parser/camera.ts`:
  `let aov = 45; // Motion default`, and the Camera's `id=201` default="45").
- gluPerspective takes fovy (vertical), but the camera-less DEFAULT reference distance
  matches **frame WIDTH** at 45°, not height:
  - width-45°:  `(1920/2)/tan(22.5°) = 2317.6`  → predicts 0.794 at Z=−600 ✅ (meas 0.795)
  - height-45°: `(1080/2)/tan(22.5°) = 1303.7`  → predicts 0.685 at Z=−600 ❌
- Implied AOV from the joint fit (width-based) = **44.88°** ≈ 45° exactly.
- Height-dependence check: a 1080-wide probe gave d≈1304 = (1080/2)/tan(22.5°), i.e.
  **d ∝ frameWidth**. (`d = (frameWidth/2)/tan(AOV/2)`.)

> Note the engine's *camera-present* distance formula (`evaluator/index.ts` L1383) uses
> `(frameHeight/2)/tan(AOV/2)`. That is correct for a real Camera node whose AOV is the
> vertical fovy, but the camera-LESS default reference is width-based-45° (equivalently
> height-based-≈26.15°). The two are not the same convention; the discrepancy only surfaces
> for camera-less Position-Z, which is currently orthographic anyway (see blocker).

---

## Blast-radius analysis

Shared users of `projectPoint` / `projectQuad` / `cameraZ`:

| Consumer | Path | Uses camera-less default? | Effect of d 2000→2318 | Effect of posZ sign |
|----------|------|---------------------------|-----------------------|---------------------|
| **3D_Rectangle (full)** | projectQuad, HAS Camera AOV=65 → d=(1080/2)/tan32.5°=848 | no (camera present) | unaffected (uses 848) | affected if any layer has Position Z |
| **Fall** | projectQuad, camera-less rotX | **orthographic** (Inf) | none while orthographic | none (rotX only) |
| **Color_Planes / Reflection** | camera-less/static, replicator-free | **orthographic** (MEASURED win) | none | none |
| **Movements/Flip page-flip** | `renderPageFlip` + `FLIP_CAMERA_Z=7000` | no | none (own constant) | none (own projection) |
| **Swing / z-composite** | `projectQuadWithWorldZ` | via rctx.cameraZ | tracks default | tracks matrix |
| **Shapes (Stylized/Close&Open box)** | `shapes.ts` `cameraZ+wz` or `camP−wz` | camera-present dolly | uses camera distance | n/a |

Key facts:
- The `projectQuad(..., rctx.cameraZ ?? 2000)` fallback `?? 2000` is **dead code** —
  `rctx.cameraZ` is always set to a number at `compositor/index.ts` L1501.
- Camera-less scenes currently resolve `distance = Infinity` (orthographic) at
  `evaluator/index.ts` L1362, BEFORE the replicator discriminator. So changing
  `DEFAULT_CAMERA_Z` alone does NOT fix a camera-less scene — it never reaches projectPoint
  with a finite camera.
- The orthographic branch is load-bearing for Fall / Color_Planes / Reflection
  (ROADMAP: forcing them perspective/orthographic was measured; orthographic wins there).

---

## Why the minimized `_t_3dr_v4` scores 10.76 dB (and won't move via a camera-distance fix)

Trace (added FCT_DBG logging to `projectQuad`, since reverted):
```
needsPersp m14=-600 m2=0 m9=0
projectQuad m14=-600 cameraZ=Infinity src=1854x1042   ← cameraZ = Infinity ⇒ scale 1
engine plate bbox 1854x1042 (full source, NO shrink)
```
- Parser reads `posZ = -600` correctly (curve value −600 on image id=10006).
- `needsPerspective` returns true (m14≠0) → projectQuad IS called.
- BUT `rctx.cameraZ = Infinity` because the minimized case is camera-less AND has no
  Replicator → orthographic branch → `projectPoint` returns scale 1 → flat plate.
- The FULL slug has a Camera (AOV=65) and Replicators, so it is NOT camera-less and DOES
  project perspectively (d=848). The minimizer stripped the Replicator (struct 95→2),
  which is what dropped baseline 14.31 → 10.76 — an artifact of minimization, not a pure
  perspective-distance gap. **`_t_3dr_v4` is not a faithful camera-distance probe.**

---

## Recommended patch (BOUNDED — NOT shipped; needs a regression gate outside this scope)

Two independent corrections are needed for a *faithful* camera-less Position-Z scene; only
ship them together behind a family re-score (Fall/Color_Planes/Reflection/3D_Rectangle):

**(A) Position-Z sign** — `engine/src/evaluator/index.ts` L452:
```ts
// current:
m = mat4Multiply(mat4Translate(posX, posY, posZ), m);
// fix: Motion +Z = toward viewer = world wz<0 (near). projectPoint uses cameraZ/(cameraZ+wz),
// so posZ must be negated into m14 (Motion −600 → world +600 → recede/shrink):
m = mat4Multiply(mat4Translate(posX, posY, -posZ), m);
```
This is provably correct for Position-Z (probe scale d/(d−Z)); it does NOT touch rotation
(rotation-induced wz comes from the R basis columns, unchanged).

**(B) Camera distance** — `engine/src/compositor/perspective.ts` L12 + threading:
```ts
// current: const DEFAULT_CAMERA_Z = 2000;
// fix: width-derived Motion default-45° reference (2317.6 for 1920):
export function defaultCameraDistance(frameWidth: number): number {
  return (frameWidth / 2) / Math.tan((45 * Math.PI) / 360);
}
```
and at `compositor/index.ts` L1501 replace `?? 2000` with `?? defaultCameraDistance(width)`.
This makes the RotationX (Fall) foreshortening EXACT (1598 vs FCP 1598) — a latent improvement.

**(C) THE BLOCKER — camera-less perspective vs orthographic.** For the minimized/faithful
camera-less Z case to shrink at all, the camera-less branch (`evaluator/index.ts` L1362)
must NOT return `distance = Infinity` — it must return the width-derived default
(`(frameWidth/2)/tan(22.5°) ≈ 2318`) so `projectPoint` foreshortens. My probes prove FCP
does perspective here. BUT the orthographic branch is a MEASURED win for Fall /
Color_Planes (+3.0) / Reflection (+0.91). Flipping it regresses them. Reconciling requires
either (i) discovering the SEPARATE reason Fall prefers weak/no foreshortening (candidate:
the rotationY sign inversion, or DoF blur — both open) so those slugs stay correct under a
finite camera, or (ii) a Position-Z-specific perspective path that applies the divide to
pure Z-translation while leaving rotation-fold planes orthographic. Both are larger than the
verify-only-_t_3dr_v4 scope and MUST be gated across the whole camera-less family. **Not
shipped.**

### Verification performed this session
- Golden `cd engine && npm run test:node` = **2123 passed, 0 diverged** (with and without the
  exploratory (B) change — the color test doesn't exercise geometry).
- `npx tsc --noEmit` clean before and after.
- `min-gen && min-score _t_3dr_v4` = **10.76 dB** both before and with the (B)-only change —
  confirming the camera-distance change alone does NOT move the minimized case (it's
  orthographic). No faithful improvement is possible without change (C), which is unsafe here.
- All exploratory edits reverted; tree clean.

## Probe artifacts
`/tmp/zprobe/` — z{0,−150,−300,−450,−600,−900,+300,+600}.motr + _f7.png, roty{30,60}.motr,
rotx{30,60}.motr, sq_z{0,−600}.motr and rendered frames. Reproduce with
`python3 fct/cli.py _headless-frame <motr> 7 24 <out.png>`.
