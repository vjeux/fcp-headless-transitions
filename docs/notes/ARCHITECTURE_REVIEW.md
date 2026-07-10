# Architecture Review — fcp-headless-transitions

Reviewed 2026-07-10 by reading every module in `fct/`, `tools/`, and `engine/src/`.

Two codebases with very different health:
- **`fct/` + `tools/ozengine.py`** (the toolkit): clean, small, single-responsibility. Minor polish only.
- **`engine/src/`** (the TS renderer, 11.3K LOC): three god-objects accreted with
  ~100 per-transition structural detectors. This is where the short-term debt lives.

────────────────────────────────────────────────────────
## PART 1 — `fct/` toolkit (healthy; small improvements)

Strengths: one job per module, disk-only data flow, single color model / timing / slug map,
the circular-diagnostic lesson encoded in code. Keep this shape.

### F1. `gen.py` embeds a TS program as a Python string heredoc
`_ENGINE_SCRIPT` is 12 lines of TypeScript inside a Python triple-quoted string, written to
`engine/test/_fct_render.ts` on every call. This is invisible to the TS toolchain (no type
check, no lint), and splits the engine-invocation logic across two languages.
**Fix:** make `_fct_render.ts` a real committed file in `engine/test/` that reads slug/out/N
from argv or env. `gen.py` just calls it. One language per file; the TS compiler sees it.

### F2. Three renderers, but only two share a code path; GUI is a different verb
`gen_headless`/`gen_engine` are "render slug→frames"; `slice_gui` is "extract from .mov".
The CLI already unifies them under `fct gen <source>`, but there's no common interface —
`cli.py` has a per-source if/elif ladder, and the isolation/teardown logic for headless is
inlined in the CLI. **Fix:** define a tiny `Renderer` protocol (`gen(slug, out_dir) -> dir`)
with three implementations (`GuiSlicer`, `HeadlessRenderer`, `EngineRenderer`), each owning
its own quirks (headless owns the subprocess-isolation + SIGSEGV-tolerance; gui owns the
.mov window). The CLI becomes a dumb dispatch `RENDERERS[source].gen(slug)`. Removes the
special-case branch in `cli.py` and makes "add a 4th source" a one-file change.

### F3. Config uses module-load side effects
`config.py` runs `_load_slug_map()` at import — any import of `fct` fails hard if the slug
map is missing, and it silently falls back to `/tmp`. **Fix:** lazy `get_slug_map()` cached
with `@functools.cache`; drop the `/tmp` fallback now that the map is committed at
`fct/slug_map.json` (the /tmp copy was a migration crutch).

### F4. `frames_dir` is a string-keyed switch
`if source=='gui'/'headless'/'engine'` appears in config, and `--sources` is split on comma
with no validation. **Fix:** a `Source` enum (or frozen dict `SOURCES`) with `{dir, needs_color}`
so "engine renders sRGB, gui is bt709" is data, not scattered `if source in (...)` checks
(that knowledge is currently duplicated in `score.py`, `montage.py`).

### F5. Timing model silently truncated
`fct.timing` kept only `scene_duration_seconds` + `sample_time`. But `api.ts` (the engine)
maps progress→time via `animationEndSec`, NOT scene duration — the two renderers use
DIFFERENT time models. `fct` papers over it because each renderer computes its own time.
That's a latent inconsistency: a frame `i` from headless and engine may not be the same
scene-moment. **Fix:** make `fct.timing` the single authority both renderers consume
(headless already does; the engine should take an explicit `timeSec`, see E4).

────────────────────────────────────────────────────────
## PART 2 — `engine/src/` (the real debt)

The engine works but its architecture is the opposite of "long-term oriented": correctness
was bought one transition at a time by adding a detector + a special path, each guarded by a
comment explaining the single transition it was tuned against.

### E1. ⭐ THE core problem: `createTransition` is a 370-line heuristic router
`api.ts` inspects the parsed scene and sets a pile of booleans — `band360`, `isSlideFamily`,
`retimeWrapSec`, `strokedMaskClampSec`, `hasFilledShapeOverlay`, `hasBlendedMediaOverlay`,
`hasReplicatorMaskReveal`, `motionBlurEnabled` — each computed by a bespoke scene scan and
documented with "this fires on Objects/Arrows", "regressed Light Sweep 44→15dB", etc. This
is a **rules engine masquerading as a renderer**. Every new transition risks flipping a
boolean that another transition depended on (the comments are littered with these
near-misses). It is inherently short-term: correctness is O(transitions) special cases, not
O(1) generic evaluation.

**Direction:** these are all really answers to TWO real questions the Motion engine answers
structurally, that this engine answers heuristically:
  (a) *"what scene-time does output progress p map to?"* (retime wrap, stroked-mask clamp,
      animationEnd) — this is a **time-remap curve**, which Motion stores in the .motr
      (`Retime Value` + layer lifetimes). Build ONE `buildTimeMap(scene) -> (p)=>tSec` that
      reads the retime/lifetime data generically, instead of 5 booleans patched in render().
  (b) *"which layers are visible/how are they composited at time t?"* (360 band, slide
      motion-blur, page-flip, drop-in, replicator-matte) — these are **compositor
      capabilities** that should be driven by node/filter/behavior TYPES present in the
      scene, not by "does this look like Arrows?". A layer that carries a shutter with
      moving content gets motion blur — full stop; no "isSlideFamily" gate.

### E2. Per-transition detectors should be capability probes, not family sniffers
`detectPageFlip`, `detectDropInCard`, `detect360Band`, `isSlideFamily`, replicator-mask
reveal — each answers "is this THE transition X?". The `no-hardcode.test.ts` guard (fire on
≥2) is a good instinct but it's fighting the architecture instead of fixing it. **Fix:**
replace "detect family" with "detect capability from node types": e.g. motion blur is
`layer has shutter AND layer.velocity>threshold` evaluated per-layer at composite time;
page-flip is `two coplanar image children of a 3D group with a flip behavior`. Same code
path for all transitions; the .motr data decides. This is what makes it generic AND removes
the whole class of "adding Y broke X".

### E3. God-objects: split by responsibility
- `parser/index.ts` (2585) — one `parseMotr` doing XML→scene for every node type. Split into
  per-node parsers (`parseLayer`, `parseFilter`, `parseBehavior`, `parseKeyframes`,
  `parseReplicator`) behind a small dispatch, each testable in isolation.
- `compositor/index.ts` (2127) — `renderLayer` is 445 lines with a type-switch cascade +
  inline mask/clone/replicator/flip resolution. Extract a `LayerRenderer` per layer type
  (image/shape/replicator/clone/group), registered by type. `composite()` walks the tree and
  dispatches; each renderer is ~100 lines and unit-testable.
- `evaluator/index.ts` (1402) — `evaluateLayer` with many special-case visibility rules.
  Same treatment: a visibility/transform resolver per concern.

### E4. Non-reentrant module-global state
`compositor/index.ts` uses module-level mutable globals (`ctx`, `_dzPlaceholder`), evaluator
has `CURRENT_FPS`/`DROPZONE_WRAP_TO_A`/`HOLD_INCOMING_B`, parser has `CLIP_MEDIA`. These are
set per-render, so two concurrent `render()` calls corrupt each other, and tests must run
serially. **Fix:** thread a `RenderContext` object through the call tree (already partially
exists at compositor/index.ts:135 — extend it and remove the globals). Enables parallel
rendering and isolated tests.

### E5. Filter dispatch is a stalled migration
`registry.ts` is a clean UUID-keyed filter registry, but `filters/index.ts` says "Migrated
so far: (none yet)" while `applyFilter` still routes 14 filters via a fragile
`name.includes('gaussian'|'blur'|...)` string chain. Two dispatch systems, one dead.
**Fix:** finish the migration — every filter registers by UUID; delete the string chain.
High-value because filter matching by fuzzy name is a silent-wrong-filter risk.

### E6. Duplicated primitives
Bilinear sampling is reimplemented ≥6 times (transition360, reorient360, compositor ×2,
resample, perspective); luma coefficients differ (blend.ts Rec.709 vs channel-mixer Rec.601
inlined 3×). **Fix:** `sampleBilinear()` and `luma()` in one `compositor/sampling.ts`. Safe,
mechanical, shrinks the surface.

### E7. Dead code + hardcoded absolute paths
`colorizeFilter()` and `isOscFilter()` are unreferenced. Test files hardcode
`/Users/vjeux/random/motion-renderer/examples/...` (a sibling repo that doesn't exist here)
and `/Applications/Final Cut Pro.app/...`. **Fix:** delete the dead fns; route all test
fixtures through `fct.config` paths (or an env var) so the engine tests run on any machine.

────────────────────────────────────────────────────────
## PART 3 — cross-cutting / structural

### X1. Two engines, no shared contract
`tools/ozengine.py` (real FCP) and `engine/src` (TS reimpl) are validated against the same
GUI GT but share NOTHING — not the time model, not the color model, not the frame contract.
`fct` is the only thing that knows both exist. **Fix:** define the contract explicitly (a
tiny spec doc + the shared constants in `fct.config`): "a renderer takes (motr, imgA, imgB,
timeSec) → 1920×1080 RGBA; sRGB; the harness color-conforms to bt709." Then BOTH renderers
are just implementations of it, and `fct` scores them identically. This is the single most
"long-term" change: it turns "headless vs engine" from two ad-hoc programs into two
conformant backends.

### X2. The GUI GT color space should be measured, not modeled with 6 magic constants
`GAM = R:1.095/0.977 …` is a fitted sRGB→bt709 approximation. It's a global fudge that
"hurts some frames, helps others" (per the old findings). **Fix (longer-term):** derive the
transform from a known color chart rendered through both paths, or better, render the GUI GT
and headless in the SAME color space (the shim can emit bt709 directly — the .mov is bt709).
Removes a whole category of "is this a color gap or a real gap?" confusion.

### X3. No CI / typed contract on the Python side
`fct` has no tests and no type checking in CI. It's small enough to add: a `fct/test_*.py`
that (1) checks `read/color/compare/score` on synthetic arrays (no engine needed), (2)
asserts `sample_time`/`scene_duration` on a fixture .motr. Fast, no FCP required, guards the
toolkit.

────────────────────────────────────────────────────────
## Priority order (impact × safety)

1. **E7 + E6** — delete dead code, unify sampling/luma. Safe, immediate.
2. **E5** — finish the filter-registry migration; kill the string chain.
3. **F1 + F3 + F4** — de-stringify `gen.py`, lazy config, Source enum. Small, safe.
4. **E4** — thread RenderContext, remove module globals. Enables parallelism + tests.
5. **X1 + F5** — define the renderer contract; make `fct.timing` the shared time authority.
6. **E1 + E2** — the big one: replace the heuristic router with `buildTimeMap` +
   capability-driven compositing. Do it incrementally behind the existing GT scores, one
   boolean at a time, each verified with `fct score --all` against the GUI GT (never against
   another render).
7. **E3** — split the god-objects once E1/E2 shrink them.
8. **X2 + X3** — measure the color transform; add Python CI.

The throughline: today correctness scales with the number of special cases. Every item above
moves a special case into either (a) generic evaluation of .motr data, or (b) a shared
contract — so adding transition #66 doesn't risk breaking #1–65.
