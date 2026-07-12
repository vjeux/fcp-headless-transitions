# ROADMAP — long-term architecture work

This is the living plan. It is the ONLY tracking file (no scattered findings, no
external notes). Every item has a **Definition of Done (DoD)**, a **Verify** command,
and a **Status**. Update Status in the same commit that does the work.

## The rules (non-negotiable — these are why the last effort drifted)

1. **One truth.** Score ONLY against the GUI GT (`~/fct-gui-gt`, via `fct score`).
   NEVER compare a render to another render ("headless-vs-headless" was circular and
   produced false "at ceiling" verdicts — see `docs/notes/CEILING_DIAGNOSTIC_FAILURE.md`).
2. **The gate.** Every change must pass `fct regress <source>` (no slug drops >0.30 dB
   below the committed baseline) BEFORE it is committed. Green gate = safe to commit.
3. **One change per commit**, small blast radius, independently revertible.
4. **No autonomous pool** that declares success against a self-generated metric. Agents
   only for well-scoped, gate-verifiable mechanical chunks — never "make it pixel-perfect".
5. **Everything in the repo.** No `~/`-level scripts, notes, or scoreboards. `fct/` is the
   one toolkit; `docs/notes/` is the one knowledge store; this file is the one plan.
6. **Commit == push.** Work on `main`. A change is not "done" until it is committed, the
   gate is green, AND pushed to `origin/main`. Never leave `origin` behind — `git push`
   in the same step as the commit, not as a separate "later" task (that drift is how the
   remote fell 61 commits behind once the auto-pushing pool was removed).
7. **No stray branches.** `main` is the only branch. No integration/agent branches — the
   `fct regress` gate does the safety work a review branch used to.

## The gate, concretely

```
fct gen headless --all        # populate ~/fct-frames/headless/ (once, or after .mm/engine change)
fct gen engine   --all        # populate ~/fct-frames/engine/
fct baseline headless         # freeze fct/baseline_headless.json  (do once, at a known-good point)
fct baseline engine           # freeze fct/baseline_engine.json
fct regress  headless         # after ANY change: exit 0 = safe, exit 1 = regression, DO NOT COMMIT
fct regress  engine
```

Re-baseline ONLY intentionally, when an improvement is verified and you want it protected.

**Gate sensitivity caveat (verified 2026-07-10 by injecting a 15% darken):** the gate
correctly goes RED (exit 1, names the slug) on a real regression, but its sensitivity
scales with how close a render already is to truth. A uniform 15% darken dropped
Blurs__Gaussian (baseline 18dB) by 1.57dB — caught — but Push/Mask (engine baseline
12–14dB, already far from GUI) by only 0.02–0.19dB — under the 0.30 tol. So on
LOW-scoring slugs a genuine regression can hide. Mitigation for later: a relative/
per-slug tolerance (e.g. tighter tol on high-baseline slugs). For now, 0.30 dB absolute
reliably catches meaningful regressions on the slugs that matter most (the good ones).

**✅ JPEG-determinism gotcha (FIXED 2026-07-10 in read_frame_cached — cold path now re-reads the saved thumbnail so cold==warm; kept for history):** the ENGINE render is
deterministic (same code → byte-identical JPEG). BUT a baseline frozen from one encode
path (e.g. PNG→JPEG bulk conversion) and compared against frames from a different encode
path (canvas-JPEG-direct) shows ~0.5–0.7 dB false "regressions" on unchanged slugs — same
pixels, different JPEG bytes → different thumbnail → jittered PSNR. RULE: when a behavior-
NEUTRAL change trips the gate, first verify the render pixels are unchanged (render the slug
with old vs new code, compare decoded pixels — max diff 0 = neutral). If neutral, the gate
noise is a stale-baseline/encode mismatch: RE-RENDER the affected slugs fresh with current
code and RE-FREEZE the baseline (`fct gen engine --all && fct baseline engine`) so baseline
and future renders share one encode path. Do NOT chase these as real regressions.

**The gate is FAST by design** (a slow gate gets skipped, defeating the point):
- It scores at `GATE_SIZE` (480×270), not full 1920×1080. Downscaling averages out
  noise but **preserves regression ranking** — a real drop still shows as a drop
  (validated: full-vs-gate offset is monotonic across the score range).
- Both the immutable GUI GT **and** the source frames are read from mtime-invalidated
  disk thumbnails (`.fctcache/<w>x<h>/`), so a re-rendered slug rebuilds only its own
  thumbnail. Cost drops from "decode 48 full-res (up to 10MB) PNGs/slug" to "decode 48
  ~40KB thumbnails".
- **Warm timing: ~0.34s/slug, slug-uniform (~22s for all 65).** First run after a
  re-render pays the thumbnail build once per changed slug. `fct regress` prints total
  time + the slowest 5 slugs so a slow outlier is visible.
- `fct score <slug> --full` (full res) is for reporting the true dB; the GATE uses
  gate-res. Tolerance `TOL=0.30 dB`.


---

## Items  (priority = impact x safety; do top-down)

Status legend: TODO / DOING / DONE / BLOCKED

### 1. Delete dead code + unify duplicated primitives  [DONE]  (engine, safe)
- DoD: `colorizeFilter()`, `isOscFilter()` removed; a single `sampleBilinear()` and `luma()`
  in `engine/src/compositor/sampling.ts` used by transition360, reorient360, compositor,
  resample, perspective, channel-mixer (was 6 copies / 2 luma standards).
- Verify: `cd engine && npx tsc --noEmit` clean; `fct regress engine` OK.
- DONE 2026-07-10 (commits 6eaed6c, 2e65b19): deleted both dead fns; unified the 6
  duplicated Rec.601 luma copies into `blend.luma601`. Rec.709 `blend.luma` kept separate
  (different coefficients). Bilinear NOT deduped — the compositor's copy is fused into a
  hot premult-alpha blit with crop bounds; extracting it would change edges + add per-pixel
  overhead (documented as a deliberate non-change). tsc clean, gate green 0 regressions.

### 2. Finish the filter-registry migration  [DONE]  (engine, medium)
- DoD: every filter dispatched by UUID via `filters/registry.ts`; the fuzzy
  `name.includes('gaussian'|'blur'|...)` chain in `applyFilter` deleted; the
  "Migrated so far: (none yet)" comment gone.
- Verify: `cd engine && npx tsc --noEmit` clean; `fct regress engine` OK (filter output identical).
- IN PROGRESS: registry infra already existed (fill/noise/reorient360 registered). Migrated
  Brightness (PAEBrightness, UUID 2E4DBB0A-…) to levels.ts + barrel; removed its legacy
  name-includes branch. Fixed the stale "none yet" barrel comment. ~13 legacy filters remain
  (gaussian/bevel/luma-key/directional/radial/zoom/hsv/channel-mixer/tint/colorize/levels/
  gaussian/directional/radial/zoom; 10 done incl colorize) — migrate one-at-a-time, gate-green each. Verified pixel-neutral + re-froze baseline.

### 3. fct toolkit polish  [DONE]  (fct, safe)
- DoD: (a) `engine/test/_fct_render.ts` is a committed real file read from argv/env, not a
  Python heredoc in `gen.py`; (b) `config.py` loads the slug map lazily (`@cache`), no
  import-time side effect, no `/tmp` fallback; (c) a `Source` enum/dict carries
  `{dir, needs_color}` so gui=bt709/engine=sRGB lives in ONE place (not duplicated across
  score.py/montage.py/config.py).
- Verify: `python3 -c "import fct"` clean; `fct score Movements__Push` == 36.63.

### 4. Thread RenderContext; remove module globals  [DONE]  (engine, medium)
- DoD: `CURRENT_FPS`, `DROPZONE_WRAP_TO_A`, `HOLD_INCOMING_B` (evaluator), `ctx`,
  `_dzPlaceholder` (compositor), `CLIP_MEDIA` (parser) all threaded through an explicit
  `RenderContext`; two concurrent `render()` calls no longer corrupt each other.
- Verify: `fct regress engine` OK; a new `engine/test/concurrent.test.ts` renders 2 slugs
  interleaved and gets identical frames to serial.

### 5. Define the renderer contract + single time authority  [DONE]  (cross-cutting)
- DoD: a short `docs/RENDERER_CONTRACT.md`: "a renderer takes (motr, imgA, imgB, timeSec)
  -> 1920x1080 RGBA sRGB; the harness color-conforms to bt709; frame i = timeSec
  sample_time(i,24,span)". Engine's `render(progress)` gains a `renderAt(timeSec)` that
  uses `fct.timing`'s model so headless & engine sample the SAME scene-moment per frame.
- Verify: for a few slugs, headless frame i and engine frame i are the same scene-time
  (spot-check via montage alignment); `fct regress` both OK.

### 6. ⭐ Replace the heuristic router in api.ts  [DONE]  (engine, BIG)
- DoD: `createTransition`'s pile of booleans (band360, isSlideFamily, retimeWrapSec,
  strokedMaskClampSec, hasFilledShapeOverlay, hasBlendedMediaOverlay, hasReplicatorMaskReveal,
  motionBlurEnabled) replaced by (a) ONE generic `buildTimeMap(scene) -> (p)=>tSec` reading
  retime curves + layer lifetimes, and (b) capability probes driven by node/filter/behavior
  TYPES (not "looks like Arrows"). Same code path for all 65.
- Approach: incremental — migrate ONE boolean at a time, `fct regress engine` green after each.
  A wrong abstraction is worse than the special cases, so each step must be independently
  revertible and gate-verified; if a migration can't stay gate-green, revert it and leave the
  boolean in place with a note rather than forcing a bad abstraction.
- Verify: `fct regress engine` OK after each step; `no-hardcode.test.ts` still passes;
  final: zero transition-name special cases remain in api.ts.
- DONE: api.ts 470->260 lines. `src/timemap.ts` = the single scene-time authority
  (`buildTimeMap(scene) -> { remap, wrapSec, clampSec }`, all retime-wrap/clamp logic,
  clone-continuation scan — type-driven). `src/capabilities.ts` = 5 structural probes
  (hasColorizeRemapRig, hasFilledShapeOverlay, hasStrokedMaskShape, hasReplicatorMaskReveal,
  isWideEquirect), ALL registered in `no-hardcode.test.ts` and each verified to fire on >=2
  of the 65 built-ins (3/12/2/2 + detect360Band=7). Both `render(progress)` and
  `renderAt(timeSec)` funnel through one `renderInstant` -> `timeMap.remap`. Zero
  transition-name special cases remain in api.ts code (only comments name examples).
  Commits: 047823c (rename isSlideFamily->hasColorizeRemapRig), 0c7bf7b (extract buildTimeMap),
  fafb201 (extract capabilities + enforce genericity). Gate 0/0 after each.

### 7. Split the god-objects  [DONE]  (engine)
- DoD: `parser/index.ts` (2585) -> per-node parsers; `compositor/index.ts` renderLayer (445-line
  switch) -> per-layer-type renderers registered by type; `evaluator/index.ts` visibility
  rules -> per-concern resolvers. No file > ~800 lines.
- Verify: `fct regress engine` OK; `npx tsc --noEmit` clean.
- DONE: no engine file now exceeds 800 lines (max 726). Splits, each gate-verified 0/0 + tsc clean:
  - parser 2603 -> 637: xml.ts (DOM+time+curve+param), shapes.ts, behaviors.ts, replicator.ts,
    rig.ts, footage.ts (+ClipInfo), transform.ts (blend+retime+transform), camera.ts. index.ts
    now holds only the recursive core (parseSceneNode/parseLayerElement) + parseMotr.
  - evaluator 1411 -> 701: matrix.ts (4x4, re-exported), links.ts (driver/link/rig resolution),
    ramp.ts (Ramp/Fade), filter-overrides.ts, context.ts (EvalCtx).
  - compositor 1882 -> 726: blit.ts (pixel/matrix primitives), context.ts (RenderContext/DropInCard),
    masks.ts (source-resolution + mask-alpha), geometry.ts (projection/detection), field-texture.ts,
    drop-in.ts. renderLayer's 423-line switch -> LAYER_RENDERERS type->renderer-chain registry +
    4 named per-type renderers (renderReplicatorLayer/renderCloneLayer/renderDrawableLayer/
    renderChildLayers) each returning a RenderOutcome ('stop'|'children').
  Commits 0a4ae30..c6493e5. All verbatim/faithful moves; fct regress engine 0/0 after each.

### 8. Measure the color transform; add Python CI  [DONE]  (cross-cutting)
- DoD: (a) the 6 fitted GAM constants replaced by a measured/derived sRGB->bt709 transform
  (or the shim emits bt709 directly so no transform is needed); (b) `fct/test_fct.py` covers
  read/color/compare/score on synthetic arrays + sample_time on a fixture .motr (no FCP needed).
- Verify: `python3 -m pytest fct/` green; `fct regress` both OK after the color change.
- DONE (2026-07-11): (a) fct/fit_color.py now DERIVES the GAM constants by maximizing the
  gate's own objective (mean per-frame PSNR vs GUI GT), with the docstring recording why
  plain-MSE (~20.3 dB, worse) and a physical transfer function (~30.9 dB on color-isolated
  frames vs ~40 dB empirical) are both wrong. The derivation reproduces the shipped values
  to +0.059 dB (< 0.30 gate tol) so GAM is unchanged but now measured+reproducible; config.py
  cites it. (b) fct/test_fct.py = 21 pytest tests (color/read/compare/score on synthetic
  arrays + sample_time & scene_duration on committed fixture .motr), no FCP needed.
  Verify: `python3 -m pytest fct/` -> 21 passed; `fct regress headless/engine` -> 0/0 both.

### 9. 360° transition family — full-frame model (GUI-GT drift fix)  [DONE]  (engine)
- Problem: the 8 360° transitions scored 6-8 dB (the biggest low-score cluster). The
  `transition360.ts` model composited the panorama into a bottom-half "band" (BAND_TOP=502,
  TILE_W=1855) — that matched an OLDER GUI-GT capture, but the CURRENT GUI GT shows the
  equirect panorama filling the ENTIRE frame (verified: Push f0 == full-frame start.png at
  28.9 dB; the band model scored ~7 dB against the current truth).
- DoD: 360° push/slide/crossfade/wipe/divide/circle render FULL-FRAME (cover-fit the whole
  output, translate by one frame width); no bottom-half band constants; dead band code deleted.
- Verify: `fct regress engine` OK (improvements, 0 regressions); re-baseline; tsc clean.
- DONE 2026-07-13: rewrote render360Band on a full-frame model (new `drawFull` + `sampleFull`
  cover-fit-to-frame; push = A slides out one width, B trails; slide/crossfade/masked-reveal
  all full-frame). Deleted the dead band model (`drawTile`, REF_W/REF_H/HOME_LEFT/TILE_W/
  BAND_TOP, unused `snapValue`, the Rig End-Value sweep read, `Band360Config.sweep`). Sweep is
  now always one output width, signed by the Direction widget. Gate: 7 IMPROVED, 0 regressions
  (Push 7.40→14.28, Slide 7.53→14.97, Wipe 7.35→14.12, Divide 6.25→14.47, Reveal_Wipe
  7.45→18.66, Circle_Wipe 7.47→22.91, Gaussian_Blur 7.66→23.63). Engine mean 11.92→13.02 dB;
  baseline re-frozen. tsc clean.

### 10. animationEndSec local-frame timing fixes (progress→time map)  [DOING]  (engine)
- Problem: the lowest-scoring slugs were rendering BLACK/frozen tails because the
  `animationEndSec` heuristic (parser/index.ts) read RAW keyframe/timing values that live
  in a node's LOCAL time frame, inflating the transition window far past the authored span
  (sceneSettings/duration ÷ frameRate). `render(progress)` = `progress·animationEndSec`, so
  an inflated end sampled scene instants LONG past every layer's `out` = empty frames. The
  evaluator already re-anchors these local-frame curves at RENDER time; the animation-end
  DOMAIN must match the render or the two desync.
- DoD: every slug's animationEndSec ≤ the authored span except where a curve genuinely
  animates in scene-time; the three local-frame classes (maxOut fallback, Camera negative
  offset, screen/add media-overlay negative offset) re-anchor to match the evaluator.
- Verify: `fct regress engine` 0 regressions after each; `_trace_end` shows only the intended
  slug's animationEndSec change; no-hardcode policy OK (parser invariants, not scene detectors).
- IN PROGRESS: 3 classes fixed, each a separate gate-green commit:
  - maxOut fallback clamp (cc9bef6): Squares 7.78→11.72, Combo_Spin 7.41→11.21.
  - Camera negative-offset re-anchor (ef4ff92): Light Sweep 4.42→14.44 (was BLACK).
  - screen/add media-overlay negative-offset re-anchor (2c7a370): Light Noise 8.72→17.07.
  Engine mean 13.02→13.43 dB. Remaining candidates to audit: Video_Wall (8.74), Slide_In,
  Center_Reveal, Heart, Loop, Up-Over (all have animationEndSec > span but via paths NOT yet
  proven safe to clamp — each needs the render-vs-GT check before touching).

---

## Progress log  (newest first — one line per completed item)
- 2026-07-13  ITEM 10 (DOING) — animationEndSec LOCAL-FRAME timing fixes. The lowest slugs
              rendered BLACK/frozen tails: their animationEndSec was inflated far past the
              authored span because the keyframe/timing walk read RAW values that live in a
              node's LOCAL time frame (the evaluator re-anchors these at render time, so the
              animation DOMAIN and the render had desynced). Fixed 3 structural classes, each a
              gate-green commit: (a) maxOut fallback clamp to span (cc9bef6) — Squares 7.78→11.72,
              Combo_Spin 7.41→11.21; (b) Camera negative-offset re-anchor (ef4ff92) — Light Sweep
              4.42→14.44 (its Camera offset −17.6s put Position keys at local 18.9s → scene 1.3s;
              render(0.5) had sampled 9.4s = black); (c) screen/add media-overlay negative-offset
              re-anchor (2c7a370) — Light Noise 8.72→17.07 (light-noise .mov screen overlay, offset
              −0.734s + retime = the evaluator's exact re-anchor signature). Each verified via
              _trace_end to change ONLY the intended slug's animationEndSec; no-hardcode OK (parser
              invariants, not scene detectors). Engine mean 13.02→13.43 dB; baseline re-frozen 3×.
- 2026-07-13  ITEM 9 DONE — 360° family FULL-FRAME model (GUI-GT drift fix). The 8 360°
              transitions scored 6-8 dB because transition360.ts composited the panorama into
              a bottom-half "band" (BAND_TOP=502) that matched an OLD GUI-GT capture; the
              CURRENT GUI GT shows the equirect panorama filling the ENTIRE frame (Push f0 ==
              full-frame start.png at 28.9 dB). Rewrote render360Band full-frame (drawFull +
              sampleFull cover-fit; push=A slides out one width & B trails; slide/crossfade/
              wipe/divide/circle all full-frame). Deleted the dead band code (drawTile, REF_*/
              HOME_LEFT/TILE_W/BAND_TOP, snapValue, End-Value sweep read, Band360Config.sweep).
              Gate: 7 IMPROVED, 0 regressions (Push 7.40→14.28, Slide→14.97, Wipe→14.12,
              Divide 6.25→14.47, Reveal_Wipe→18.66, Circle_Wipe→22.91, Gaussian_Blur→23.63).
              Engine mean 11.92→13.02 dB; baseline re-frozen. tsc clean.
- 2026-07-12  FILTER RE — session wrap: added a STATUS SNAPSHOT to docs/FILTER_RE_PHASE2.md
              (24 filters: MATCHED+verified vs CEILING vs documented-GAP vs 360-is-compositing).
              This session matched Zoom Blur (log-polar), Luma Keyer (getAlphaLuma trapezoid +
              RGBA harness fix), pinned Channel Mixer (42 dB sweep), fixed Bevel band-width law
              (1px no-op → headless-verified band), and characterised the Tint ceiling
              (nested-color IS probe-drivable; transfer measured but non-convergent — Color
              Space=3 leg undecoded). Full sweep 46 PASS/0 FAIL across 21 filters; full engine
              gate 0 regressions; tsc clean. Remaining filter ceilings all share ONE of two
              root causes: (a) a key param not probe-drivable (Tint transfer, Bevel angle,
              Bloom), or (b) the per-filter-encode vs linear-CHAIN limit (needs an engine-level
              linear filter chain, not per-filter encodes). 360-family low scores are
              transition-compositing, not filter math (reorient fills the frame, 0% black).
- 2026-07-12  FILTER RE — Bevel band-width law DECODED + verified (P2-BEV1 partial). ROOT
              CAUSE of the bevel being a 1-px no-op: TS read the NORMALIZED Bevel Width (a
              fraction ~0.05) as a raw pixel step (Math.round→0→1px). DECODED + HEADLESS-VERIFIED
              the band-width law band_px = BevelWidth·0.28125·maxDim (9/32; exact 0.05→27,
              0.1→54, 0.2→108 @1920). Rewrote bevelFilter to the offset-accumulation model:
              band-width law + 4-lobe |cos(theta+k)| lighting (k∈{0,-45,-90,+45}) + treat the
              FRAME BORDER as an alpha boundary (OOB=transparent) + plumb Light Color. TS band
              now matches headless (104 vs 105 px @w0.2). CEILING: Light Angle is NOT
              probe-drivable (headless identical for 0/45/90/135 — same class as keyer blob /
              HSV hue / Tint), so the angle-dependent lobe rotation + exact HgcBevel composite
              can't be headless-verified; only band GEOMETRY (exact) + default top-lit result
              are observable. Only user Stylized__Panels_Across gate-neutral (10.36→10.33), full
              gate 0 regressions. 4 bevel unit tests updated for the normalized-width contract.
- 2026-07-12  FILTER RE — Luma Keyer MATCHED + harness fixed (was a false "ceiling"). DECODED
              OMKeyer2D::getAlphaLuma (ProAppsFxSupport @0x3bf94) = a 4-control-point TRAPEZOID
              band-pass over luma Y (Rec.709): 0 below A', smoothstep rise A'→B', plateau 1
              B'→C', linear fall C'→D', 0 above D'; the HgcLumaKeyer LUT is just
              lut[i]=getAlphaLuma(i/255) (-[PAELumaKeyer createLutForNode:]). RGB passes through
              UNCHANGED, only ALPHA is keyed. ROOT CAUSE of the prior "not probe-verifiable"
              verdict: filter_verify compared RGB-ONLY, so the alpha-only keyer looked like
              near-identity (hvi 1.35) and tripped the identity guard — FIXED filter_verify to
              ALSO score alpha_psnr + made the identity guard RGBA-aware; sweep runner gates
              `alpha:true` entries on alpha_psnr. Added a `ramp` pattern to gen_pattern.py and
              MEASURED FCP's default keyer curve directly (both users have a static
              numberOfKeypoints=0 blob = default). Rewrote luma-keyer.ts: isolated headless PSNR
              7.54→34.15 (alpha_psnr 30.78, ramp-curve mae 0.019). 7 unit tests rewritten to
              pin the decoded band-pass. Sweep 46 PASS/0 FAIL. Full engine gate GREEN 0 regress
              (both users 360-reorient dominated; Circle_Wipe 7.47→7.46, Reveal_Wipe 7.45→7.43).
- 2026-07-12  FILTER RE — Zoom Blur is a LOG-POLAR scale-space blur (P2-ZB3 RESOLVED). A
              concentric-ring headless probe (new committed tool tools/re/gen_pattern.py) proved
              FCP's zoom-blur width GROWS ∝ radius: rings survive at center, are obliterated
              toward the edges, and higher Amount pushes the destruction radius inward (measured
              constant sigma in ln(r) space). This is the decoded polarToRect(LOG-polar) →
              HDirectionalBlur 1-D Gaussian along the log-radius axis → rectToPolar pipeline — the
              same reason SPIN works on the angle axis. Rewrote zoomBlurPolar() from the old
              LINEAR-radius uniform Gaussian (blurred every radius equally, ~16 dB @Amount=50) to
              log-radius. Verified vs headless: rings.png PSNR 24-29 dB (Amount=5..40), start.png
              19-21 dB (smooth-input remap ceiling). ZOOM_LOG_K=1.0 (rings-optimum plateau).
              Added zoom(3)+directional(2) sweep cases (suite now 42 PASS/0 FAIL). Full engine
              gate GREEN 0/0 (both users keyframe Amount from 0 / wipe-dominated: 13.76→13.69,
              7.47→7.46). tsc clean.
- 2026-07-12  FILTER RE — HSV Hue unit DECODED = DEGREES (was treated as turns, 360x off).
              From -[PAEHSVAdjust canThrowRenderOutput] @0x372f4-0x37350: FCP wraps Hue to
              [0,360] then hg_Params[0].x=Hue/360+1.0. Fixed hue-saturation.ts; isolated
              sweep Hue=0.25 14.97->29.01. Gate-neutral (all 5 users Hue=0), verified 0 regress.
              Large hue rotations NOT probe-verifiable (headless renders Hue=90/180 as identity
              — the w25/HGColorMatrix branch isn't triggered by a bare param set). commit bb97e59.
- 2026-07-12  FILTER RE — Glow FULLY matched + working color space DECODED. (1) Instrumented
              oz_render.mm (OZ_WS_DEBUG) to read OZRenderParams_getWorkingColorSpace() =
              kCGColorSpaceLinearSRGB (16-bit half-float ExtendedLinearSRGB readback); this
              RESOLVES the long-standing "color-pipeline root cause". Decoded the exact Brightness
              transfer (darken=clip(b·v); brighten=srgbEncode(b·v/255), hard split at b=1) but SHIP
              the plain multiply: the sole PAEBrightness user (Curtains, b=2.91) stacks Brightness→Mono
              and the GUI GT prefers the plain-multiply chain (per-filter encode regressed it −0.46);
              the "27 users darken" claim was wrong (1 user, it brightens). (2) DECODED HgcGlow mask
              (soft ramp a=clamp((luma709−Threshold)/Softness+0.5,0,1)) + HgcGlowCombineFx
              ((1−glowA)·orig + min(glow·gain,ceil)) from the Filters binary; glow.ts now applies both
              verbatim. Isolated glow sweep 16-20 dB → 37-42 dB; GUI-GT 360°__360°_Bloom +0.70
              (10.88→11.58), 0 regressions; baseline re-frozen (mean 11.92); glow.test.ts (6 tests).
              3 commits pushed; sweep 35→37 PASS.

- 2026-07-11  Item 8 DONE (color transform + Python CI). (a) fct/fit_color.py now DERIVES the
              sRGB->bt709 GAM by maximizing the GATE metric (mean per-frame PSNR vs GUI GT),
              not plain pixel-MSE: measured that MSE-optimal lands at gamma~0.9 and scores
              ~20.3 dB (WORSE than shipped 21.85), and a physical sRGB->Rec.709 transfer
              function scores ~30.9 dB on color-isolated frames vs ~40 dB empirical (FCP does
              more than a transfer swap). The gate-metric fit reproduces the shipped 6 constants
              to +0.059 dB (< 0.30 tol) -> GAM unchanged but now measured+reproducible, config.py
              cites the derivation. Reverted the interrupted prior turn's pure-a GAM swap, which
              had regressed the gate (headless 14 slugs down, engine Lights__Flash -0.62).
              (b) fct/test_fct.py = 21 pytest tests over read/color/compare/score on synthetic
              arrays + sample_time/scene_duration on a committed fixture .motr; runs with no FCP
              and no rendered frames. Verify: pytest fct/ -> 21 passed; fct regress -> 0/0 both.
- 2026-07-11  Items 6 & 7 DONE. Item 6: replaced api.ts heuristic router with buildTimeMap
              (single scene-time authority) + capabilities.ts (TYPE-driven probes, no
              transition-name matches; enforced by no-hardcode.test.ts). Item 7: split the
              god-objects — parser/index.ts -> xml/shapes/behaviors/replicator/rig/footage/
              transform/camera modules; evaluator -> matrix/filter-overrides/links/context/ramp;
              compositor -> blit/context/masks/geometry/field-texture/drop-in + renderLayer
              dispatched to per-layer-type renderers registered by type. Gate green after each
              step; concurrent + evaluator tests pass; tsc clean.

- 2026-07-10  360°/equirect CROP fix (reverse-engineered from Filters.bundle + oz_render.mm):
              wide-equirect scenes (width>=3072) now CENTER-CROP the panorama to the 1920x1080
              output window (FCP's front-facing readback) instead of bilinear-squeezing the 2:1
              canvas into 16:9. Fixed the geometry bug behind Bloom's 5 dB. Measured via the
              official gate: 360°_Bloom 5.16->10.83 (+5.67), Movements__Smear 9.6->11.03 (+1.43),
              Objects__Squares 7.21->7.78 (+0.57); 0 regressions. Added `fct probe <slug> [frame]`
              + gen_engine_frame + engine/test/_fct_render_one.ts for fast single-frame iteration
              (seconds, not the ~5 min full-slug render). Documented the real FCP 360-blur algo
              (HEquirectGaussianBlur = seam-wrap + sinusoidal reproject + Gaussian) in
              docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md as the next lever toward the ~17 dB
              headless ceiling (remaining gap: drop-zone fill scale + bloom overexposure).
- 2026-07-10  Item 5 DONE — wrote docs/RENDERER_CONTRACT.md (render(motr,A,B,timeSec)->1920x1080
              RGBA sRGB; harness color-conforms to bt709; frame i = sample_time(i,24,span)). Added
              public TransitionFn.renderAt(A,B,timeSec) + .animationEndSec: both render() and
              renderAt() now funnel through ONE internal renderInstant() (single time authority).
              KEY FINDING (measured): 64/65 slugs have animationEndSec != span, so render(i/N)
              (= (i/N)*animationEndSec) samples a DIFFERENT scene instant than headless's
              (i/N)*span. animationEndSec is an intentional gate-frozen scar; renderAt lets a
              caller address absolute scene time directly without disturbing render(progress).
              render(p)===renderAt(p*animationEndSec) verified byte-identical; tsc clean;
              full engine re-render + gate green 0/0.
- 2026-07-10  PERF: parallelized `fct gen engine/gui --all` across cores (ThreadPoolExecutor,
              default min(8,ncpu), longest-slug-first, FCT_JOBS override; headless stays serial
              for the FCP GL mutex). Measured 960s→537s (1.8x) on the full 65-slug engine batch.
              Remaining bottleneck is 360°_Bloom alone (262s: it renders the full 4096x2048
              equirect scene + 6 blur passes because it does NOT match the 360-band fast path,
              unlike 360°_Slide) — noted as a future engine-perf lever, not touched (would risk
              its gate output). Also hardened fct/read.py cache writes to be ATOMIC (temp +
              os.replace) since parallel passes can race the shared .fctcache. Gate green 0/0.
- 2026-07-10  Item 4 DONE — added engine/test/concurrent.test.ts verifier (DoD): renders 2
              structurally-different slug pairs SERIALLY vs INTERLEAVED (A0,B0,A1,B1,...) at
              1920×1080×24 and asserts BYTE-IDENTICAL frames + interleaved re-parse determinism.
              All 3 tests pass. Proves two concurrent render() calls no longer corrupt each
              other. ALL render-scoped module globals (evaluator+compositor+parser) eliminated;
              tsc fully clean; engine gate green 0/0. Item 4 complete. Next: item 5 (renderer
              contract + single time authority).
- 2026-07-10  Item 4 — PARSER globals ELIMINATED. Bundled CLIP_MEDIA + DROPZONE_MEDIA_HEIGHT
              (+ the existing clipAB map) into one per-parse `ClipInfo {ab, media,
              dropZoneMediaHeight}` returned by parseFootageClipAB and threaded through
              parseSceneNode/parseLayerElement/determineImageSource (replaces the clipAB param,
              no param bloat). parseMotr reads clip.dropZoneMediaHeight. Both module globals
              deleted. tsc clean; full engine re-render; gate green 0/0. ALL render-scoped
              module globals (evaluator + compositor + parser) are now eliminated. Next: add the
              engine/test/concurrent.test.ts verifier (item-4 DoD) then mark item 4 DONE.
- 2026-07-10  Item 4 — COMPOSITOR module globals ELIMINATED. composite() now builds a local
              `const rctx: RenderContext` (was module `let ctx`); threaded isMaskGroup +
              dropZonePlaceholderCell; moved the `_dzPlaceholder` size-keyed cache INTO
              RenderContext.dzPlaceholder. Deleted both module globals (`ctx`, `_dzPlaceholder`).
              tsc fully clean; full engine re-render; gate green 0/0. Two concurrent composite()
              calls no longer share mutable state. Item-4 remaining: parser CLIP_MEDIA +
              DROPZONE_MEDIA_HEIGHT, then the concurrent.test.ts verifier.
- 2026-07-10  Item 4 — threaded RenderContext through renderLayer (the core recursive render
              workhorse): 22 ctx refs → rctx param, 5 callers updated (3 recursive pass rctx,
              resolveCellImage + composite pass ctx!). tsc clean; full engine re-render;
              gate green 0/0. Remaining item-4 work: composite() body + delete the module `ctx`
              + `_dzPlaceholder` vars; parser CLIP_MEDIA/DROPZONE_MEDIA_HEIGHT.
- 2026-07-10  Item 4 — EVALUATOR globals eliminated. Found the tree dirty from a prior
              interrupted tick: EvalCtx interface defined + the 3 module globals (CURRENT_FPS,
              DROPZONE_WRAP_TO_A, HOLD_INCOMING_B) deleted but 11 refs left DANGLING → engine
              wouldn't compile (gate only passed on stale on-disk frames). Completed the refactor:
              threaded EvalCtx through evaluate()->evaluateLayer->applyRampTransforms/
              applyRampOpacity/applyFadeBehaviors->rampProgress. Also threaded compositor
              resolveCellImage. tsc now FULLY CLEAN (0 errors); re-rendered all 65 engine slugs;
              gate green 0/0. Remaining compositor globals: renderLayer(3)+composite(6)+_dzPlaceholder;
              parser CLIP_MEDIA/DROPZONE_MEDIA_HEIGHT.
- 2026-07-10  Item 4 — EVALUATOR globals ELIMINATED. Found the tree dirty from a prior
              interrupted tick: evaluator/index.ts had a broken half-refactor (EvalCtx defined,
              3 module globals deleted, 11 dangling refs -> tsc broken, engine wouldn't build).
              Completed it: threaded EvalCtx {fps,wrapToA,holdIncomingB} through evaluate ->
              evaluateLayer -> applyRampTransforms/applyRampOpacity/applyFadeBehaviors ->
              rampProgress. Also threaded compositor resolveCellImage. tsc now FULLY clean;
              full engine re-render + gate green 0/0. Compositor globals remaining: renderLayer,
              composite (+ the module `ctx` var itself).
- 2026-07-10  Item 4 — threaded RenderContext through resolveImageMaskAlpha + replicatorMaskAlpha
              (6 ctx refs total → rctx; the mask fn also passes rctx into replicatorMaskAlpha).
              tsc clean, gate green 0/0. Remaining: resolveCellImage(2), renderLayer(3), composite.
- 2026-07-10  Item 4 — threaded RenderContext through resolveCloneImage (self-recursive +
              1 external caller in renderLayer; 4 ctx refs → rctx). tsc clean, gate green 0/0.
              Remaining: resolveImageMaskAlpha(4), resolveCellImage(2), replicatorMaskAlpha(2),
              renderLayer(3), composite(6).
- 2026-07-10  Item 4 — threaded RenderContext through getSourceImage (7 callers updated,
              3 ctx refs → explicit rctx param). tsc clean (compositor), gate green 0/0.
              Remaining: resolveCloneImage(4), resolveImageMaskAlpha(4), resolveCellImage(2),
              replicatorMaskAlpha(2), renderLayer(3), composite(6).
- 2026-07-10  Item 4 STARTED — threaded RenderContext through retimedClipTime (first of 8
              compositor functions to thread). Also fixed the cache-fidelity gate bug (cold!=warm)
              that had been causing phantom regressions for several ticks. tsc unchanged, gate green.
- 2026-07-10  GATE FIX — root-caused the recurring phantom regressions/improvements: read_frame_cached
              returned the pre-JPEG in-memory thumbnail on the COLD (build) path but the re-read lossy
              JPEG on the WARM path -> baseline(cold) and regress(warm) scored identical frames ~1dB
              apart. Fixed: cold path now re-reads the saved thumbnail. Both gates now truly 0/0.
              Re-froze both baselines (headless 21.23, engine 11.48). This removes the JPEG-encode
              gate-noise caveat.
- 2026-07-10  Re-froze the stale headless baseline from a fresh full headless re-render (mean 20.92,
              Push 35.x gate-res). Headless gate green 0/0. This corrects the pre-existing drift found
              in item 3; the headless renderer output is deterministic, baseline now matches disk.
- 2026-07-10  Item 3 DONE — (a) _fct_render.ts already a committed file; (b) config.py slug map now
              lazy @cache, no import-time read, dropped /tmp fallback; (c) added SOURCES dict +
              needs_bt709() so gui=bt709/srgb-sources color decision lives in ONE place (score.py &
              montage.py now use it). Engine gate green 0/0; change proven behavior-neutral.
              NOTE: found a PRE-EXISTING stale headless baseline (Push headless now renders 35.12,
              baseline had 37.48) — unrelated to this change (OLD config gives same 35.12). Re-freezing
              headless baseline separately.
- 2026-07-10  Item 2 COMPLETE — migrated the last 4 filters (Gaussian/Directional/Radial/Zoom Blur)
              via a new ctx.blurAmount helper (preserves override-honoring + 'static value=0=inactive').
              Deleted the ENTIRE legacy name.includes chain + resolveParam/resolveBlurAmount + unused
              imports; applyFilter is now pure UUID-registry dispatch. tsc clean, gate green 0/0.
- 2026-07-10  Item 2 — migrated Colorize (PAEColorize, D995BBCF-…, 9 users) to UUID registry.
              Replicated the nested-child RGB readColor via ctx.filter.parameters (faithful, raw).
              Verified byte-identical on Stylized__Slide (max diff 0); tsc clean, gate green 0/0.
              Only the 4 blurs remain (gaussian/directional/radial/zoom).
- 2026-07-10  Item 2 — HSV root cause FOUND + fixed: legacy dispatch read raw filter params
              (ignored rig overrides); registry ctx.param HONORS overrides -> diverged on
              Color_Panels (rig-driven Saturation). Added ctx.rawParam/hasRaw to FilterContext;
              HSV registered via rawParam = byte-identical to legacy (verified max pixel diff 0).
              Migrated. tsc clean, gate green 0/0. Remaining: Colorize + 4 blurs.
- 2026-07-10  Item 2 — migrated Channel Mixer (B2E0DE39-…) + Tint (717D6E01-…) to UUID registry.
              tsc clean, gate green 0/0. HSV Adjust migration REVERTED: it changed Color_Panels
              output (verified real, max pixel diff 76 vs legacy) for reasons not fully explained
              by param-reading inspection — per careful-coder rule, did NOT ship it. HSV + Colorize
              + 4 blurs remain. HSV needs a param-by-param debug of ctx.param vs the legacy loop.
- 2026-07-10  Item 2 — migrated Glow (73F69C87-…) + Bloom (5599C557-…) to UUID registry
              (both via glowFilter; users 360_Bloom, Lights_Bloom). tsc clean, gate green 0/0.
              ~8 filters left (gaussian/directional/radial/zoom/hsv/channel-mixer/tint/colorize).
- 2026-07-10  Item 2 — migrated Levels (PAELevels, 2B221FA1-…; 5 users) to UUID registry.
              tsc clean, gate green 0/0. ~10 filters left (gaussian/directional/radial/zoom/hsv/
              channel-mixer/tint/colorize/glow/bloom).
- 2026-07-10  Item 2 — migrated Luma Keyer to UUID registry (7E9178C5-…; users 360 Circle/Reveal
              Wipe). tsc clean, gate green 0/0. ~11 filters left (gaussian/directional/radial/zoom/
              hsv/channel-mixer/tint/colorize/levels/glow/bloom).
- 2026-07-10  Item 2 — migrated Bevel filter to UUID registry (9C655247-…, only user
              Stylized__Panels_Across). tsc clean, gate green 0/0. ~12 filters left.
- 2026-07-10  Item 2 STARTED — migrated Brightness to the UUID registry; proved luma601 (item 1b)
              pixel-neutral (max diff 0); found+documented the JPEG-encode baseline gotcha, re-froze
              engine baseline (mean 11.48). Gate green 0/0. ~13 filters left to migrate.
- 2026-07-10  Item 1 DONE — deleted dead code (colorizeFilter/isOscFilter); unified 6 Rec.601
              luma copies into blend.luma601. Gate proven (goes red on a 15% darken, green after
              revert). tsc clean, regress engine green. (6eaed6c, 2e65b19)
- (baseline established: headless 21.8 / engine 11.5 dB, JPEG q90 frames)
