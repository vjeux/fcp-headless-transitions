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

### 2. Finish the filter-registry migration  [TODO]  (engine, medium)
- DoD: every filter dispatched by UUID via `filters/registry.ts`; the fuzzy
  `name.includes('gaussian'|'blur'|...)` chain in `applyFilter` deleted; the
  "Migrated so far: (none yet)" comment gone.
- Verify: `cd engine && npx tsc --noEmit` clean; `fct regress engine` OK (filter output identical).

### 3. fct toolkit polish  [TODO]  (fct, safe)
- DoD: (a) `engine/test/_fct_render.ts` is a committed real file read from argv/env, not a
  Python heredoc in `gen.py`; (b) `config.py` loads the slug map lazily (`@cache`), no
  import-time side effect, no `/tmp` fallback; (c) a `Source` enum/dict carries
  `{dir, needs_color}` so gui=bt709/engine=sRGB lives in ONE place (not duplicated across
  score.py/montage.py/config.py).
- Verify: `python3 -c "import fct"` clean; `fct score Movements__Push` == 36.63.

### 4. Thread RenderContext; remove module globals  [TODO]  (engine, medium)
- DoD: `CURRENT_FPS`, `DROPZONE_WRAP_TO_A`, `HOLD_INCOMING_B` (evaluator), `ctx`,
  `_dzPlaceholder` (compositor), `CLIP_MEDIA` (parser) all threaded through an explicit
  `RenderContext`; two concurrent `render()` calls no longer corrupt each other.
- Verify: `fct regress engine` OK; a new `engine/test/concurrent.test.ts` renders 2 slugs
  interleaved and gets identical frames to serial.

### 5. Define the renderer contract + single time authority  [TODO]  (cross-cutting)
- DoD: a short `docs/RENDERER_CONTRACT.md`: "a renderer takes (motr, imgA, imgB, timeSec)
  -> 1920x1080 RGBA sRGB; the harness color-conforms to bt709; frame i = timeSec
  sample_time(i,24,span)". Engine's `render(progress)` gains a `renderAt(timeSec)` that
  uses `fct.timing`'s model so headless & engine sample the SAME scene-moment per frame.
- Verify: for a few slugs, headless frame i and engine frame i are the same scene-time
  (spot-check via montage alignment); `fct regress` both OK.

### 6. ⭐ Replace the heuristic router in api.ts  [TODO]  (engine, BIG — needs approach review)
- DoD: `createTransition`'s pile of booleans (band360, isSlideFamily, retimeWrapSec,
  strokedMaskClampSec, hasFilledShapeOverlay, hasBlendedMediaOverlay, hasReplicatorMaskReveal,
  motionBlurEnabled) replaced by (a) ONE generic `buildTimeMap(scene) -> (p)=>tSec` reading
  retime curves + layer lifetimes, and (b) capability probes driven by node/filter/behavior
  TYPES (not "looks like Arrows"). Same code path for all 65.
- Approach: incremental — migrate ONE boolean at a time, `fct regress engine` green after each.
  ⚠️ Get approach sign-off before starting (a wrong abstraction is worse than the special cases).
- Verify: `fct regress engine` OK after each step; `no-hardcode.test.ts` still passes;
  final: zero transition-name special cases remain in api.ts.

### 7. Split the god-objects  [TODO]  (engine, do AFTER 6 shrinks them)
- DoD: `parser/index.ts` (2585) -> per-node parsers; `compositor/index.ts` renderLayer (445-line
  switch) -> per-layer-type renderers registered by type; `evaluator/index.ts` visibility
  rules -> per-concern resolvers. No file > ~800 lines.
- Verify: `fct regress engine` OK; `npx tsc --noEmit` clean.

### 8. Measure the color transform; add Python CI  [TODO]  (cross-cutting)
- DoD: (a) the 6 fitted GAM constants replaced by a measured/derived sRGB->bt709 transform
  (or the shim emits bt709 directly so no transform is needed); (b) `fct/test_fct.py` covers
  read/color/compare/score on synthetic arrays + sample_time on a fixture .motr (no FCP needed).
- Verify: `python3 -m pytest fct/` green; `fct regress` both OK after the color change.

---

## Progress log  (newest first — one line per completed item)
- 2026-07-10  Item 1 DONE — deleted dead code (colorizeFilter/isOscFilter); unified 6 Rec.601
              luma copies into blend.luma601. Gate proven (goes red on a 15% darken, green after
              revert). tsc clean, regress engine green. (6eaed6c, 2e65b19)
- (baseline established: headless 21.8 / engine 11.5 dB, JPEG q90 frames)
