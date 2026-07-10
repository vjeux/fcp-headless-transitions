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

---

## Items  (priority = impact x safety; do top-down)

Status legend: TODO / DOING / DONE / BLOCKED

### 1. Delete dead code + unify duplicated primitives  [TODO]  (engine, safe)
- DoD: `colorizeFilter()`, `isOscFilter()` removed; a single `sampleBilinear()` and `luma()`
  in `engine/src/compositor/sampling.ts` used by transition360, reorient360, compositor,
  resample, perspective, channel-mixer (was 6 copies / 2 luma standards).
- Verify: `cd engine && npx tsc --noEmit` clean; `fct regress engine` OK.

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
- (none yet — baseline being established)
