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
8. **Decode the scene graph BEFORE writing code (`fct census <slug>`).** Twice a tick
   burned effort chasing a task premise the .motr flatly contradicted ("colour-channel
   Link drives Color_Planes" — it drives position.Z, a 3D fold; "gradient generator fills
   Slide_In" — its Gradient node is a paint-stroke Emitter). Every filter/behaviour tick
   MUST start by running `fct census` on the target slug(s) and confirming the premise
   against the real node types / filters / link channels / emitters. If census contradicts
   the ROADMAP item, FIX THE ITEM first (it's a decode, not an opinion), then do the work.
   Algorithm facts come from the FCP binary / .motr — never from prose in this file, and never
   from black-box render-diffing. GUI GT only ever CONFIRMS or REFUTES a decode; a refutation
   means "re-read the source," not "nudge a constant." Decode-don't-fit, applied to the task list.

9. **BUILD THE SUBSYSTEM. Do not hide behind gate-neutral no-ops.** The gate says "don't commit
   RED." It does NOT say "only commit changes that do nothing." A byte-identical parser stub, a
   struct nothing reads, or a documentation-only tick is NOT progress — it cannot regress, but it
   also cannot help, and shipping a stream of them is how the last effort drifted while looking
   busy. The unit of work is a WHOLE WORKING SUBSYSTEM (the emitter sim renders real sprites; the
   linear chain composites the whole frame in float; the gradient generator actually rasterises),
   built end-to-end until a TARGET SLUG MEASURABLY IMPROVES against GUI GT. The correct loop is:
   build the whole thing → verify the target slug's dB goes UP → confirm 0 collateral regressions
   → THEN commit. A tick that ends with "gate-neutral, no pixels changed" is only acceptable when
   it is (a) a genuine premise-correcting decode that RETIRES/RESCOPES a task (like dropping a
   dead driver), or (b) an explicitly-labelled intermediate step of a subsystem you WILL finish in
   the same or next tick. It is NOT acceptable as the habitual outcome. If you find yourself
   reaching for "commit the stub, it's safe" — STOP: that is timidity, not discipline. Land the
   working subsystem or land nothing.

   **Per-tick honesty check (answer before you commit):** "Does this change move a real pixel
   toward GT on a real slug, or am I committing a no-op because it feels safe?" If the latter,
   keep working — the tick is not done. A "measure twice" investigation tick is fine; a
   perpetual-stub tick is the failure mode this rule exists to kill.


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

## Status snapshot  (2026-07-13)

- **Engine mean: 13.93 dB** across 65 GUI-GT transitions; **20 / 65 already ≥ 15 dB** (matched).
- **Architecture is DONE.** The renderer contract, single time authority, filter registry,
  RenderContext threading, god-object splits, colour-transform CI, and the 360° full-frame
  model all landed (items A1–A8 in the "Done architecture" ledger at the bottom).
- **All 24+ FCP FILTERS are reverse-engineered and implemented** (registry in
  `engine/src/compositor/filters/`). Remaining low scores are NOT missing filters — they are
  missing **subsystems** (behaviours, particle sim, generators) and the **linear working-space
  compositing** model. This file now tracks every subsystem, implemented or not.
- Work top-down by **coverage × safety** (Σ deficit-to-16 dB ÷ risk). One subsystem per arc,
  gate-green each commit, baseline re-frozen when an improvement is protected.

- **✅ BASELINE RE-FROZEN (2026-07-13, commit f8d4d6d):** the swarm drained, all 65 slugs were
  re-rendered from current main (0 regressions), and `fct baseline engine` re-froze at **13.93 dB**
  — now capturing the landed gains (T-G1 Color_Planes 10.47→11.35, T-E1 Video_Wall 8.74→9.1; the
  T-D2 linear migrations are flags-OFF = byte-identical, so no delta). `fct regress engine` is
  clean (0/0). Those gains are now PROTECTED — any future regression trips the gate.

Deficit accounting (Σ of `max(0, 16 − score)` over the slugs each subsystem gates):

```
SUBSYSTEM                                  #slugs  Σdef→16  avg   status
S1  Behaviour drivers (Link/MotionPath/Grav)  16     37.6   2.4   PARTIAL — biggest safe lever
S2  Linear working-space compositing          ~19    ~50    2.7   NOT DONE — highest ceiling, risky
S3  Particle-emitter simulation                6     25.6   4.3   FAKED (texture proxy only)
S4  Colour pipeline (Tint/Bloom/Colorize)      7     13.7   2.0   per-filter; folds into S2
S5  Gradient generator                         3     11.4   3.8   returns null
S6  Framing-camera / clone-grid                3     13.9   4.6   partial, deepest geometry
S7  Residual per-slug (shape/mask/timing)     mixed   —      —    one-offs, opportunistic
```

## Parallel execution model  (crank it to the max)

Every task below is an independent unit. There is NO wave gating, NO central integrator, and NO
file-ownership rules — **each agent edits whatever files it needs and rebases + merges its own
work.** If two agents touch the same file, git rebase resolves it at merge time (see the contract
below). Run as many agents at once as you have tasks; the only ordering is the handful of explicit
`after:` dependencies in the flat task list.

### Why it's safe to parallelize
Collisions are resolved by rebase, not prevented by carving up the tree. Two things make that
smooth:

- **Prefer additive, self-registering modules.** The proven pattern is the **filter registry**:
  each unit lives in its own module, self-registers via one entry hook, and wires in through a
  single append-only import line. Additive edits rebase cleanly even when several agents touch the
  same barrel. Reach for this pattern when it fits — but if a task genuinely needs to change a
  shared file (`parser/index.ts`, `evaluator/index.ts`, `compositor/index.ts`, `types.ts`), just
  do it and let the rebase sort it out.
- **The baseline is DERIVED state, never hand-merged.** `fct/baseline_engine.json` is git-tracked
  and the gate scores against it. On any rebase conflict there, take either side then REGENERATE
  (`fct gen engine --all && fct baseline engine`) — the regenerated file is the truth.

### The self-merge contract (every agent follows this exactly)
```
1. BRANCH   git fetch origin && git checkout -B <task-id> origin/main
2. BUILD    edit ANY files your task needs. Prefer additive/self-registering modules where they
            fit, but change shared files freely if the work calls for it.
3. GATE     fct gen engine --all && fct regress engine     # 0 regressions vs committed baseline
            (also: npm --prefix engine test  -> no-hardcode + unit tests green)
4. MERGE    git fetch origin && git rebase origin/main
              - code conflict     -> resolve it (keep both changes; re-run the gate after)
              - baseline conflict -> take either side; you REGENERATE + re-freeze in step 5
5. REFREEZE fct gen engine --all && fct regress engine     # re-gate after rebase; must be green
            fct baseline engine                            # lock your improvements as new floor
6. COMMIT   git add -A (your changes + fct/baseline_engine.json + ROADMAP.md)
            git commit  (ONE logical change; per-slug before->after in the message)
7. PUSH     git push origin HEAD:main
              - rejected (non-fast-forward)? someone merged first -> GOTO 4
8. LEDGER   tick your task in the flat list + add a Progress-log line (in the same commit).
```
Hard rules: never force-push; never commit a red gate; never hand-edit `baseline_engine.json`
(always regenerate); one task = one commit. If a rebase conflict is non-trivial, re-run the FULL
gate after resolving — a clean rebase does not guarantee a green gate.

### Truth & anti-drift (unchanged, apply to every agent)
- Score ONLY vs GUI GT via `fct score <slug> --full` / `fct regress engine`. Never render-vs-render.
- No per-transition hardcoding. New capability detectors must fire on ≥2 built-ins
  (`engine/test/no-hardcode.test.ts` stays green).
- Reverse-engineer from the FCP binary; cite the decoded constant/offset in a code comment.

### Flat task list  (each row = one agent; run all non-blocked rows at once)
`after:` is the ONLY ordering constraint. Rows without it run concurrently right now; if two rows
happen to edit the same file, whoever merges second rebases onto the first.

```
ID    STATUS  TASK                                                TARGET SLUGS / GOAL
----  ------  --------------------------------------------------  ------------------------------------
T-A1  PARTIAL colour-channel Link (census-verified)               Panels_Across, Slide_In, Loop,
                                                                  Heart (NOT Color_Planes — 3D fold)
              [infrastructure landed; PSNR=neutral because downstream renderers missing —
               Cross image = Media/cross.ai vector-unsupported, Loop/Heart/Slide_In target
               GRADIENT-TAG colour (renderer TBD). Framework hooks left for future ticks.
               2026-07-13: gradient-tag structure fully DECODED from Loop/Heart .motr — see
               docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md. Target path `.../104/1/<tagId>/3/{1,2,3}`
               = Gradient→RGB-folder→stop→Color→R/G/B (0..1 float). Renderer is a 6-step plan in
               that note; needs types.ts + parser/behaviors.ts + parser/index.ts (was collision-
               blocked by in-flight T-F1/T-B3 at decode time). Build once those land.
               2026-07-13b: gradient-tag DATA PIPELINE landed (de070ba: types+parser+color-links
               resolve stop overrides). CRITICAL Rule-8 correction: the gradient renderer is NOT the
               Loop/Heart lever — GUI GT proves those two deficits are a STALLED B-REVEAL (static A
               for the whole transition), not a missing gradient. Full decode in
               docs/notes/STYLIZED_LOOP_HEART_REVEAL_RE.md. The gradient swoosh is a small STROKE
               decoration on the reveal; the reveal itself is a media Image-Mask (shape.png teardrop).
               Loop/Heart now belong to a new REVEAL-TIMING item (S6/S7), not T-A1. T-A1's remaining
               renderer value is the SWOOSH stroke, which composites via the shape branch once the
               reveal path lands.]
T-A2  DONE    Motion Path driver                                  layer follows a spatial path;
                                                                  unblocks path users
T-A3  DROPPED Gravity driver (LAYER-level)                        census: 0 built-in LAYERS use
                                                                  Gravity. All 4 Gravity behaviours
                                                                  (Drop_In x3, Earthquake x1) sit on
                                                                  Particle Cells -> folded into T-B1
                                                                  (which already lists "gravity").
T-B1  DONE    Emitter+Cell param PARSER                           birth rate, life, vel, spin, gravity
                                                                  (owns gravity after T-A3 dropped) —
                                                                  EmitterParams/ParticleCellParams
                                                                  /GravityBehavior types + parser
                                                                  + MotrScene.emitters/particleCells
                                                                  flat indexes. Parse-only, gate 0/0.
T-B2  DONE    Emitter SIM+render, MINIMAL     after: T-B1         spawn + advect + gravity + composite
                                                                  (flat colour). Target: Diagonal x2
                                                                  — spawn/advect/gravity sim + flat-white dot
                                                                  render landed (compositor/emitter-sim.ts),
                                                                  wired after field-texture proxy; gate 0/0
                                                                  regressions (Diagonal ×2 within noise —
                                                                  colour comes in T-B3). Probe fires on 4.
T-B3  DONE    Emitter appearance-over-life    after: T-B2         colour/scale/opacity ramps ->
                                                                  Close_and_Open, Up-Over, Glide, Center
              [2026-07-13i: SHIPPED as a net win — flag flipped ON by default (FCT_SPRITE_SIM=0
               forces old flat-dot path). Diagonal ×2 11.09→11.39, Glide 13.68→14.32; gate 0
               regressions. The two calibration decodes + the sprite-onset gate that were pending
               are all landed — see progress-log 2026-07-13i for the full mechanism (hard-light
               TintFx shader, texture-opacity backdrop envelope, groupFade sprite-onset gate).]
T-C1  DROPPED linear/radial gradient generator                   census: NO built-in uses a gradient
                                                                  FILL; Slide_In/Loop/Heart are S1
                                                                  colour-Link (see S5). Off critical path.
T-D1  DONE    linear working-space composite path                 flag-gated; overlay slugs first
T-D2a DONE    Brightness/Colorize into linear after: T-D1         Colorize=1 users, Brightness>1
T-D2b DONE    Tint into linear               after: T-D1          Tint filter flag-gated (Leaves +0.07)
T-D2c PARTIAL Glow/Bloom into linear         after: T-D1          Bloom, 360°_Bloom
              [⚠️ STATUS CORRECTED 2026-07-14 (rule 8, forensic). The "DONE" was WRONG on two counts:
               (1) ACCIDENTAL CLOBBER — b8a6c8e added a linear branch to glow.ts (flag-OFF, byte-id),
               but eefb0ec (T-B2 Emitter SIM) was cut from a STALE glow.ts and its merge reverted
               glow.ts's blob 56219de→7ea6bec, silently DELETING the entire T-D2c linear branch + its
               9 unit tests. eefb0ec's message never mentions glow — pure rebase-clobber (parallel-
               worktree hazard). Current glow.ts on main has NO `../linear.js` import; only channel-
               mixer.ts + hue-saturation.ts are wired to the linear chain. (2) EVEN IF RESTORED, it
               would NOT fix Bloom — b8a6c8e stored the bright/blur intermediate as Uint8ClampedArray
               (linear-light u8, clamped at 255), so it CANNOT preserve the >1.0 headroom Bloom needs
               (S3-bloom agent proved 360°_Bloom under-blooms 194 vs GT 250; the 8-bit clamp is the
               cause). REAL T-D2c = a FLOAT (Float32) headroom-preserving glow/bloom chain, tone-mapped
               once at readback. So T-D2c is PARTIAL/NOT-DONE: the u8 scaffold was lost AND was
               insufficient. Do NOT trust the old "byte-identical DONE" — rebuild as float.]
T-D2d DONE    HSV into linear                after: T-D1          Color_Panels (HSV x4; flag OFF, byte-id).
                                                                  Panels_Random has ZERO HSV (Colorize
                                                                  only, folds into T-D2a).
T-E1  DONE    retime-ramp cancel for off-canvas wall Transition A Video_Wall 8.7->9.1 (+0.36; Clone_Spin unchanged)
T-E2  BLOCKED clone-tile wall render          after: T-E1         Video_Wall 14-tile grid (blocked by S6 framing-camera pose bug — see progress log 2026-07-13)
T-F1  BLOCKED Smear appearance at mid-frames                      Movements/Smear (11.0)
              [2026-07-13: pulled from the swarm pool after 6 identical failed runs — the CC
               agent hangs EVERY run (log frozen at the 203-byte startup banner + worktree quiet
               for 20m, on both signals, so the liveness-gated reaper correctly kills+relaunches
               it, forever). Not a false-wedge; the agent genuinely cannot make progress on this
               task via the swarm. And it is NOT a filter-algorithm gap: scrape.ts (PAEScrape/Smear,
               UUID 0D6E968B-…) is probe-verified vs isolated headless FCP. The 11-dB deficit is a
               TRANSITION timing issue — the smear tail continues PAST the drop-zone timeout (content
               vanishes at 0.467s; a clamp was tried and made it WORSE, rejected). Needs focused
               sequential drop-zone/retime RE, not swarm churn. Set BLOCKED so the pool stops
               wasting a slot; revisit as a dedicated ceiling item alongside S2 linear-composite.]
T-G1  DONE    Movements 3D-fold + Color_Planes (census:           Multi/Flip/Pinwheel/Swing +
              3D fold + 6x Channel Mixer, NOT colour-Link)        Color_Planes 10.47→11.35 (+0.88)
```
Max concurrency today = the 8 rows with no `after:` (T-A1,A2,B1,D1,E1,F1,G1 + all four T-D2*
after T-D1) run simultaneously. Once parents merge, the dependents fan out to MORE parallelism,
not less: T-B1→T-B2→T-B3 (chain); T-D1 unblocks FOUR filter rows at once (T-D2a/b/c/d); T-E1→T-E2.
(T-A3 dropped — census: gravity only on Particle Cells, folded into T-B1. T-C1 dropped.)
Rightsizing note: rows are kept at "one independently gate-verifiable change" — parse-only stages
(T-A2/B1) are NOT split further because a parser edit scores nothing on its own; big rendering rows
(T-B2, T-D2) ARE split because each sub-row moves PSNR alone.

---

## Items  (priority = coverage × safety; do top-down)

Status legend: TODO / DOING / DONE / BLOCKED

Each subsystem below is a durable description of a REAL part of the FCP/Motion engine, its
current status in the TS engine, the slugs it gates, and the concrete next step. The ONE-TRUTH
gate rules above apply to every item.

### S1. Behaviour drivers — Link / Motion Path  [DONE — drivers settled; low slugs move via S3/S7]  (tasks T-A1/A2 · safe, high-coverage)
**What it is (FCP):** Motion "Behaviors" are procedural animation drivers layered on top of
keyframe curves. The engine already evaluates Rig Behavior, Fade In/Fade Out, Ramp, Align To,
Oscillate, Spin, Throw, and Sequence Replicator. Three driver families are **parsed but NOT
evaluated**, so any channel they drive is silently frozen:
- **Link** (`links.ts`) drives one object's channel from another's. Position/rotation/scale/
  anchor/opacity work, but **colour-channel Links** are dropped. `fct census` PROVED which
  slugs actually use them (the earlier premise was wrong on both counts):
  - **Color_Planes does NOT use colour Links** — its 6 Links all drive `position.Z` /
    rotation (`LinkZ`, `LinkXRot`, `LinkYRot`, `LinkZPos`), i.e. a 3D fold, and it colours
    via 6× **Channel Mixer** filters. So Color_Planes belongs to the 3D-fold / colour-filter
    bucket, not here. (10.5)
  - **Panels_Across DOES** — 7 colour Links: `Link remap white`/`Link remap black` (→ a
    **Colorize** filter's remap endpoints) + `Link fill color` (→ a shape fill, path
    `./2/353/113/111`, `Apply Mode=2`). Filters: Bevel×7, Colorize×3. (10.4)
  - **Slide_In DOES** — 6 colour Links `Link 1|4 red|green|blue` piping a source colour into
    replicator-cell fills. (Its "Gradient" node is a paint-stroke Emitter, NOT a fill — see S5.)
  Colour Links target a filter/generator colour folder (never the `100` transform folder);
  `fct census` classifies each Link's channel from its `affectingChannel` path.
- **Motion Path** (fID skipped in `parser/index.ts`) — a spatial path a layer follows. Unhandled.
- **Gravity** — constant downward acceleration. **Census 2026-07-13 (T-A3):** ZERO built-in
  transitions use Gravity at the LAYER level; all 4 Gravity behaviours in the corpus sit on
  Particle Cells (Movements/Drop_In: 3 cells "Blur 11"/"copy"/"copy 1"; Movements/Earthquake:
  1 cell "Blur 11" with a keyframed Acceleration curve default=30). "Layer fall" is not a
  real usage — the Drop_In "card falling in" is a keyframed Position curve, not a Gravity
  behaviour, and Movements/Fall has NO behaviours at all. Therefore Gravity as a LAYER driver
  gates 0 slugs; the real Gravity work is emitter/cell param parsing, folded into T-B1
  (which explicitly lists "gravity" in its scope) and consumed by T-B2's particle sim.
  T-A3 DROPPED for this reason.
- **Motion Path** (factory "Motion Path" id 24) — **CENSUS 2026-07-13g: gates 0 directly-
  rendered layers, DROPPED as a standalone S1 driver (mirrors T-A3 Gravity).** Only 2 slugs
  carry Motion Path behaviours and BOTH attach them to non-layer subsystems: Slide_In's 8
  Motion Paths are all on **Replicator Cells** (parent factory "Replicator Cell") → they feed
  the replicator/particle sim (S3, currently a texture-proxy fake), and Center_Reveal's 16 are
  all on **Generators** ("Grad middle"/"Grad ends", factory "Generator") → the gradient
  generator (S5, returns null). No top-level rendered layer carries a Motion Path, so a
  standalone layer-driver implementation would be dead code (nothing consumes it). The real
  Motion Path work is per-cell traversal inside S3 and per-generator path inside S5 — folded
  there, not implemented here. (Decoded by walking each Motion Path behaviour to its parent
  scenenode factory across the corpus.)
**Status:** COLOUR-LINK DONE (layer level); Motion Path DROPPED (folds into S3/S5). Slugs gated
(16): Panels_Across, Color_Planes, Lens_Flare, Switch, Center_Reveal, Push, Reflection, Zoom,
360°_Wipe, Drop_In, Clothesline, Earthquake, Scale, 3D_Rectangle, 360°_Reveal_Wipe,
360°_Circle_Wipe (many already ≥15 — the low ones are the target).
**Colour-channel Link — VERIFIED DONE + FIRING (2026-07-13g).** The full pipeline (parser →
`computeColorLinks` → `mergeColorLinksIntoFilterOverrides` / shapeFill override → Colorize
filter reading `__ColorLink.Remap*` keys) is landed and RESOLVES on the real slugs: Panels_Across
(21 raw colour Links → 3 Colorize Remap-Black/White overrides + 1 shapeFill, all firing at the
correct red RGB 0.74/0.07/0.14). Heart/Loop use `gradientTag` colour Links → the `gradientStops`
bucket (written, consumed only by the DEFERRED T-A1 gradient rasteriser). Slide_In's 6 "Link N
red/green/blue" colour Links are all on **Replicator Cells** (S3), so the layer-level parser
correctly does not surface them — they belong to the replicator sim, not here. So colour-Link is
NOT the remaining lever on Panels_Across/Slide_In: their dominant gap is TIMING/CHOREOGRAPHY —
GUI-GT verified the panel/solid wipe races across MUCH faster than the engine (Panels_Across GT
f09 ≈ fully white/wiped while engine is mid-wipe; Slide_In GT f12 ≈ full teal slid-in while engine
is still 100% photo A). That wipe timing is an S7 residual + the S3 replicator sim, tracked there.
**Next step:** colour-Link + Motion Path are settled (done / dropped-into-S3-S5). S1's remaining
open driver work is Motion-Path-in-S3 (replicator-cell traversal) — pursue via S3. This S1 item's
standalone driver scope is now COMPLETE; the low gated slugs move via S3 (replicator) / S7 (wipe
timing), not via more S1 driver code. NOTE: Color_Planes is a 3D-fold + Channel-Mixer slug.
**Direction-rig index→tag remap DONE (2026-07-14d):** factoryID-13 Direction popups store a menu
DISPLAY INDEX; FCP feeds the rig the entry's TAG (parser/rig.ts `resolveMenuEntryTag`). Fixed the
Push vertical-direction inversion (12.41→17.59, +5.18; 0 regressions). Generic across the whole
factoryID-13 rig family + all direction values; factoryID-12 (Switch/Scale/Flip) excluded (stored
value is already the tag). See docs/notes/RIG_DIRECTION_FORENSICS.md (RESOLVED).
**DoD:** each driver evaluated; gate 0 regressions; the gated low slugs improve; baseline re-frozen.
**Verify:** `fct census` first, then `fct regress engine` + `fct score Stylized__Panels_Across Stylized__Slide_In --full`.

### S2. Linear working-space compositing  [TODO]  (tasks T-D1/D2 · BIG, highest ceiling)
**What it is (FCP):** `oz_render.mm` runs the WHOLE filter+blend+composite chain in
`kCGColorSpaceLinearSRGB` and encodes to sRGB **once** at readback (decoded in item A6). The TS
engine composites in gamma/sRGB space, so every semi-transparent overlay, additive/screen blend,
Brightness>1, and white flash lands warm/dim (Lower f12 GUI≈239,245 vs engine≈137,99; Bloom;
Panels_Across; Colorize=1; Tint). This is the single largest ceiling.
**Status:** NOT DONE. A per-FILTER linear encode was tried and REGRESSED the stacked GT (the
error is in COMPOSITING, not isolated filters). The correct model is an engine-level pass:
decode sRGB→linear once at scene input, run all blends/filters/composite in linear, encode once
at output.
**RE-CONFIRMED 2026-07-13d (measurement):** flipping the existing `LINEAR_COMPOSITE_ENABLED`
flag ON (its only consumers are the HSV + Channel-Mixer filters, T-D2d) does NOT help — measured
Color_Planes 11.35→11.26 (slightly WORSE) and Center 11.76→11.76 (unchanged), full gate reverted.
This RE-VALIDATES the thesis above: a per-filter linear encode is a DEAD END; the fix must be the
WHOLE-CHAIN engine-level pass (linear buffer through every blit/blend/composite, one encode at
output), NOT more per-filter flag flips. Do not re-test the flag — build the whole-chain pass.
**Slugs gated:** the low tail of the "other" bucket + all of S4 (Lower, Bloom, 360°_Bloom,
Panels_Across, Smear, Brightness/Colorize/Tint users).
**Next step:** add a WHOLE-CHAIN linear composite path (Float32 linear `output` buffer + linear
blit/blend variants) behind the flag; gate-green (byte-identical) with the flag OFF FIRST, then
flip + measure on the overlay slugs (start with the cleanest single-blend case, not the
mask-choreography scenes — Lower/Center's deficits are dominated by mask-reveal breakage, NOT
linear dimness, so they are the WRONG first target). Migrate one blend/filter family at a time,
gate-green after each. Never commit red.
**DoD:** linear chain on by default; net improvement across the gated slugs; 0 regressions.
**Verify:** `fct regress engine`; spot `fct score Stylized__Lower Lights__Bloom --full`.

### S3. Particle-emitter simulation  [TODO]  (tasks T-B1/B2/B3 · self-contained new module)
**What it is (FCP):** Motion Emitters (factoryID 17/23) spawn Particle Cells (fID 15/18) with a
birth rate, lifetime, initial velocity/spin, gravity, and scale/opacity/colour-over-life. The
Stylized/Nature transitions are dominated by these (Diagonal = 18 emitters, Close_and_Open = 109,
Up-Over = 46) — the drifting bokeh/leaves/flakes ARE the transition.
**Status:** FAKED. `compositor/field-texture.ts` composites ONE bundled full-frame texture over an
envelope instead of simulating particles — a crude stand-in that caps these at ~11 dB.
**Slugs gated (6 dominant):** Close_and_Open (10.9), Diagonal ×2 (11.1), Center (11.8),
Up-Over (11.8), Glide (13.7); + accent particles on ~11 more.
**Next step:** build a generic emitter: parse Emitter+Cell params → deterministic per-particle
spawn/advect/fade → composite. Additive new module (low regression risk).
**DoD:** ≥4 of the 6 dominant slugs improve; 0 regressions; baseline re-frozen.
**Verify:** `fct regress engine` + `fct score Wipes__Diagonal Stylized__Close_and_Open --full`.

### S4. Colour pipeline — Tint / Bloom / Colorize / Brightness>1  [TODO]  (tasks T-D2a–d · folds into S2)
**What it is (FCP):** these filters ARE implemented (registry), and match in ISOLATED probes, but
regress when STACKED because FCP applies them in linear space (S2). Bloom's ObjC
`bloomHeliumRender` and Tint's Color-Space=3 + Rig indirection are additionally non-convergent
decodes noted in `docs/notes/`.
**Status:** filters correct in isolation; the stacked error is the S2 linear-chain limit.
**⚠️ CORRECTION 2026-07-13e (Bloom is NOT correct in isolation):** diagnosed Lights__Bloom (the
ONLY PAEBloom/PAEGlow user, blast radius 1) — its PEAK frames (f11–f18) should blow the whole
frame to WHITE (GT f14 ≈ full white); the engine renders the near-UNBLOOMED sepia photo (f14 ≈
3 dB, mean 10.44). Root cause is a FILTER bug, not linear compositing: glowFilter drops the
Bloom **Brightness** gain (maps Brightness=100 → combine gain 1.0 via /100) so the extracted
highlight layer is never amplified — measured input mean-luma 97.3 → bloom output 97.3 (NO
brightening at any threshold); the additive combine has nothing bright to add and just replaces
the image with a blurred copy of itself. Also ignores Clip to White (=1), doDarkBloom, X/Y scale.
The REAL dispatch is `-[PAEBloom bloomHeliumRender:…:withRadius:withBrightness:withThreshold:
doDarkBloom:withXScale:withYScale:withDoCrop:withDoClip:is360:]` (Filters.bundle @0xe58a) — all
distinct inputs. Decoded so far: d11@0x268c48=0.01 (H/V→XScale /100), radius ×4.0, threshold pack
uses ±10 range + −2.25 bias; the exact Brightness→RGB-scale + Threshold→bias packing needs the
full bloomHeliumRender register trace (NEXT tick, decode-don't-fit). See glow.ts P2-bloom notes.
**Slugs gated (7):** Bloom (10.6), 360°_Bloom (11.6), Panels_Random (13.0), Color_Panels, Veil,
Slide, Leaves.
**Next step:** the Bloom pipeline is now FULLY DECODED (2026-07-13f, bloomHeliumRender register
trace): extract `rgb=max(color·10 − Threshold/10, 0)` → Gaussian blur → ADDITIVE combine
(HgcEchoScaleAndAdd) `out = orig + blur·(Brightness/50)`, clamp to (Clip to White ? 1 : ∞).
Blast radius = 2 (Lights__Bloom + 360°__360°_Bloom; the latter stores pluginName="Bloom").
**FLOAT-BUFFER bloomFilter BUILT + VERIFIED-IN-ISOLATION then REVERTED (2026-07-14h):** wrote a
decode-faithful `bloomFilter` in glow.ts carrying extract→blur→combine in Float32 (blurFloatRGB +
resampleFloatRGB + decimatedBlurFloatRGB, mirroring gaussian-blur.ts's sigma=radius/6.67 kernel and
gaussianDecimation strategy so blur SHAPE is identical, but with NO 8-bit clamp so the ×10 extract's
>1 cores survive). UNIT-VERIFIED: a uniform 0.8 input → 255 white (the old glowFilter 8-bit path
clamped the extract to 1.0 and under-bloomed). REVERTED because shipping it alone net-REGRESSES both
gated slugs, for two now-fully-measured reasons — NEITHER is the filter maths:
  • **Lights__Bloom (−0.11): the retime-wrap pins f4–f23 ALL to t=0** (MEASURED: timeMap.remap(t)=0
    for every t≥0.212s). At t=0 the Bloom Threshold=100/Mix=0 → the filter is inert → the engine
    renders the flat sepia base for the ENTIRE second half. But GT is a **flash-to-white A→B wipe**
    (f12 warm 242,204,151 → f14 WHITE 241,255,255 → f23 photo B 92,107,137), NOT frozen sepia. The
    old "Bloom tail = frame 0" claim in timemap.ts was STALE — now corrected in-code. `pureCrossfade
    SettleB` does NOT rescue it: B.out=0.534 ≪ endSec=1.270, so the "B lives to the end" gate
    correctly rejects it. A naive wrap-cancel would expose a BLACK tail (both drop zones dead by
    0.534s), so the content must PERSIST (hold B) past 0.534s while the bloom filter time plays on.
  • **360°__360°_Bloom (regressed 11.51→10.48): NOT a band-path bypass — CORRECTED 2026-07-14r.**
    The earlier claim here ("the 360° BAND crossfade path BYPASSES the filter") is FALSE and now
    retired: VERIFIED that `detect360Band` returns NULL for 360° Bloom (it is NOT in the 7 slugs the
    detector fires on: Divide/Circle_Wipe/Push/Slide/Reveal_Wipe/Gaussian_Blur/Wipe). 360° Bloom takes
    the NORMAL filter path — the stacked Gaussian Blur → Glow → Bloom all execute LIVE (no wrap, no
    band bypass). So the bloom DOES fire; it just under-bloomed at the PEAK under the 8-bit path.
    2026-07-14r BUILT + MEASURED the decode-faithful FLOAT bloomFilter (extract max(color·10 −
    Threshold/10,0) → decimatedBlurFloatRGB [new Float32 mirror of the u8 decimated blur, same kernel/
    decimation] → additive orig+blur·(Brightness/50), clip@1). RESULT: the PEAK is now CORRECT —
    f13–f14 luma 194→**222.8 vs GT 227** (the 8-bit clamp that lost the >1 headroom is fixed, proven).
    BUT the MID-RAMP over-blooms: f06 132 (GT 98), f09 191 (GT 119), f10 209 (GT 138) — it reaches full
    bloom ~3–4 frames too early, so net 11.51→10.48 (REVERTED, clean). THREE measured causes, none a
    tuned constant: (a) the threshold-curve keypoints are interp="1" with FLAT stored tangents
    (outputTangentValue=0) — tested treating them as smoothstep-ease, made it slightly WORSE (10.39),
    so that's not it; (b) the co-stacked GLOW (Radius 0→13, Threshold 1→0.1) ALSO ramps and blooms,
    compounding with Bloom — the two filters' interaction/order isn't modeled; (c) GT's bloom LAGS its
    own threshold curve by ~2–4 frames (peak lum at f14 while threshold-min is f10–12) = a real FCP
    temporal ACCUMULATION/persistence the engine doesn't model.
    ── REGISTER TRACE COMPLETE 2026-07-14s (arm64, InternalFiltersXPC slice; the prior @0xe58a was
    x86_64 — arm64 is @0xc88c). -[PAEBloom bloomHeliumRender:…] fully decoded, extract/scale/bias/
    gain/RADIUS all confirmed (decode-don't-fit, no guessed constant):
      • HgcBloomThreshold: s13=doDarkBloom?-10:+10 → SCALE hg_Params[1]=+10; s14=doDarkBloom?+10:-10
        → BIAS hg_Params[0]=s14·Threshold/100=−Threshold/10; hg_Params[2]=(−FLT_MAX,+FLT_MAX)=NO
        alpha clamp; hg_Params[3]=0. Shader r0=color·10−Threshold/10, max(·,0). (extract CONFIRMED.)
      • BLUR radius fed to HGaussianBlur::init / HEquirectGaussianBlur::init = 0.5·Amount (cb8c/caa8:
        fmov d0,#0.5; fmul d0,d11,d0) — HALF the Amount param, NOT raw Amount. X/Y scale = |Horiz|·
        imgW, |Vert|·imgH (both 1 here). CORRECTED my impl (was using raw Amount = 2× too wide).
      • HgcEchoScaleAndAdd (verbatim shader): r1=color0·hg_Params[0]+color1; min(·,hg_Params[1].x);
        max(·,0). Wiring: hg_Params[0]=Brightness/50 (cc04 d8/50, d9=50 fcsel doDarkBloom);
        hg_Params[1].x=doClip?1.0:+FLT_MAX (cc44 fcsel on withDoClip). => out=orig+blur·(Bright/50),
        clip@(ClipToWhite?1:∞). (combine CONFIRMED.) The −2.25 HGTransform::Translate at cc98 is
        GATED on versionAtCreation==0 (legacy compat) and SKIPPED on the modern path — correctly omitted.
    RESULT after the 0.5·Amount radius fix: 360° Bloom PEAK still matches (f13–14 ≈ 223 vs GT 227) but
    the mid-ramp STILL over-blooms (10.48→10.54, still < baseline 11.51). So the spatial math is now
    fully register-verified CORRECT; the residual is NOT the Bloom filter — it is (b) the Glow-stack +
    (c) the ~2-frame temporal ONSET lag, BOTH of which also affect the OLD 8-bit path (old engine also
    blooms at f04 while GT waits to f06 — the lag is pre-existing, not introduced). Verified the 360°
    base image matches GT at f00–f03 (84.6 vs 89), so it's not an equirect-base error.
    NEXT (the ONLY remaining blockers, both pre-existing): (1) decode the Glow↔Bloom stacking/onset;
    (2) model the temporal onset lag (GT holds flat ~89 through f06 then ramps — likely a curve/eval
    or HGBlur temporal property, decode-don't-fit — smoothstep-ease on the interp=1 threshold was
    TESTED and made it WORSE, so it is NOT a naive ease). THEN the register-verified float peak-fix
    lands as a net win. Do NOT ship the partial (regresses) and do NOT fit the ramp.
So the fix needs THREE things landed together: (1) float-buffer bloomFilter (BUILT+peak-VERIFIED 3×,
register-decode COMPLETE + radius corrected — needs Glow-stack + temporal-onset before it's a net win);
(2) Lights__Bloom wrap-cancel + B-content-persistence past 0.534s (time-authority change, risky);
(3) 360° Bloom already takes the normal filter path (NOT the band path — corrected above), so the
bloom fires live there; the sub-step is the packing/stack/lag decode, not band-wiring. Multi-step;
decode notes in glow.ts. (b) Then S2 for the STACKED colour bucket (Tint/Colorize/Brightness>1).
**DoD/Verify:** subsumed by S2's gate.

### S5. Gradient generator  [PREMISE CORRECTED — mostly folds into S1]  (task T-C1 · small)
**What it is (FCP):** a linear/radial colour Gradient GENERATOR fills a layer. `renderGradient`
(linear/radial with colour stops) exists in `filters/gradient.ts` but is not wired to any parsed
ImageSource; `renderGaussianGradient` is wired and works.
**⚠️ Premise corrected by `fct census` (2026-07-13):** the 3 slugs this item claimed were NONE of
them a linear/radial gradient FILL:
  - **Slide_In** — its "Gradient" node is a **PAINT STROKE** (Brush Profile + Emitter + Cell copy),
    not a fill; plus 6 **colour-channel Links** (`Link 1|4 rgb`). → S1 colour-Link + paint-stroke.
  - **Loop** — NO gradient generator. 8 **colour Links** + 1 PAEColorize filter. → pure S1.
  - **Heart** — NO gradient generator. 6 **colour Links** + 1 GaussianBlur. → pure S1.
So S5 as originally framed gates ~0 slugs. The real shared cause across all three is
**colour-channel Link evaluation (S1/T-A1)**, not a gradient generator.
**Status:** the linear/radial gradient generator is still UNWIRED, but no current built-in needs
it — do NOT invent work here. If a future slug genuinely uses a Gradient FILL (census shows a
`Generator` node with `[fill]`, not `[PAINT-STROKE]`), wire `renderGradient` then.
**Next step:** none standalone — subsumed by S1 colour-Link (T-A1). Keep the generator code; drop
the T-C1/T-C2 gradient tasks from the critical path (they were premised on a fill that isn't there).
**DoD/Verify:** covered by S1's gate on Panels_Across/Slide_In/Loop/Heart.

### S6. Framing-camera / clone-grid geometry  [TODO]  (tasks T-E1/E2 · deepest geometry)
**What it is (FCP):** `OZScene::computeFraming` (decoded in `evaluator/framing.ts`) poses a camera
to frame a target; Video_Wall builds a wall of ~14 hand-placed clone tiles viewed through it, each
flipping to reveal B. Clone_Spin spins a clone grid.
**Status:** PARTIAL. The framing pose targets a point offset from Transition A, so A projects
off-centre (Video_Wall f4 = black); the tile wall doesn't render.
**Slugs gated (3):** Video_Wall (8.7), Clone_Spin (10.3), Curtains (15.1 — already OK).
**Next step:** debug the framing anchor (proxy→content-plane ray) + the clone-tile wall render.
Deepest geometry, only 2 low slugs — do LAST.
**✅ ORTHOGRAPHIC-FOLD SHIPPED (2026-07-14f, commit see log):** replicator-free static-camera
plane-fold scenes now render under a PARALLEL (orthographic) projection. Discriminator (structural,
no transition names, in `resolveCamera`): a static (non-framing) camera driving a scene that
contains ZERO Replicator layers → `distance = Infinity`. This fires on exactly the two rep=0
static-camera slugs and NO others. MEASURED wins: **Color_Planes 11.35→14.39 (+3.04), Reflection
12.71→13.53 (+0.82)**. The perspective-needing static-camera slugs all carry ≥2 Replicator refs and
were MEASURED to REGRESS under ortho (3D_Rectangle −0.36, Close_and_Open 10.87→10.55 −0.32) — the
rep=0 gate correctly excludes them. Framing cameras (Video_Wall/Clone_Spin) use their own framed-pose
path and are unaffected. Mechanism: Motion composites a group's 3D contents through the camera's
perspective ONLY for genuine 3D scenes; a scene whose entire 3D content is rig/Link-rotated planes
with no clone/particle/environment replicator is composited in flattened 2D (parallel) space — the
same `viewIsOrthographic` branch the camera-less slugs (Fall) take. Investigated & REJECTED as
discriminators: the `Flatten` group param (=0 everywhere), camera baseFlags bit-64 (marks 3D_Rectangle
but also would force-ortho the base=16 Close_and_Open which regresses), Z-depth presence (both fold
and box slugs have Z-translated content). Diagnostic: `FCT_XFORM=1 tsx test/_trace_layers.ts`.
**DoD:** Video_Wall + Clone_Spin improve; 0 regressions.
**Verify:** `fct regress engine` + `fct score Replicator-Clones__Video_Wall --full`.
**⚠️ DECODE UPDATE (2026-07-14n, S6 agent — premise corrected):** the task premise "framed stays
UNDEFINED" is WRONG — `framed` DOES populate for both. Instrumented `evaluate()`: Clone_Spin has
**1 Framing behavior (factory 1, NOT 3)** → falls back to `resolveFramedPose` (single-target);
Video_Wall has **2 (factory 3)** → `resolveFramedWallPose`. Concentric has **0 camera / 0 Framing**
→ camera-less orthographic (SCOPE OUT — needs depth-resolved 3D swing, a different subsystem). The
real bug: the framed pose is MISCALIBRATED so the 14-tile wall projects off-frame/behind camera.
For Video_Wall at t=0.5 the replicators span world x[-2021,6132] y[-2379,6012] (centroid ≈
[1535,2572], z=0) but the framed pose anchors at **[2399,-2145]** (the wall's BOTTOM EDGE, from the
proxy-ray→content-plane reconciliation) → ~9/14 grids fail `projectFramed`'s `cz<=1e-3` behind-camera
guard, the rest land at sx=±5000-8000 (frame 1920 wide) → engine renders ONE static drop-zone tile,
frozen, offset up-left ~78% scale; the wall never appears. A world-axis-orientation experiment
(FLATZ, both pose fns) was MEASURED (CS 10.28→10.27, VW 9.06→9.11) = within noise, REJECTED+reverted
— orientation is NOT the dominant error, the ANCHOR is. Also: the wall path fires on only 1 built-in
(Video_Wall) and the single path on only 1 (Clone_Spin), so ONLY a SHARED-geometry fix satisfies the
≥2-builtin rule. **NEXT-TICK BUILD (single highest-value piece):** fix the framing ANCHOR in
`resolveFramedWallPose`/`framePose` to resolve to the wall/content-tile world CENTROID (VW ≈
[1535,2572]; content tile @[716,1253]) instead of the proxy-ray point, + a distance that frames the
visible sub-grid (not one tile), + calcFramingRotation quaternion (RE'd at Ozone `0x6cb40`
`PCMatrix44::leftRotate(PCQuat)`; distance via `fcsel` max-extent at `0x6ce9c`/`0x6cec0`). Multi-tick
arc — build on Video_Wall, verify Clone_Spin (shared `framePose`) doesn't regress. Current clean
baselines (deterministic re-score): Clone_Spin 10.28, Video_Wall 9.06, Concentric 8.95.

### S7. Residual per-slug bugs  [ONGOING]  (tasks T-F1/G1 · opportunistic, one-offs)
Bugs not owned by a shared subsystem — fix opportunistically when a clean structural root cause is
found (never per-transition hardcoding). Current known:
- **Movements/Switch (11.68→11.96, +0.28 SHIPPED 2026-07-14u):** the tail-settle bug is FIXED — it
  was NOT a clone-source binding issue (Clone B correctly mirrors Transition B) but a Z-ORDER bug in
  the flat-coplanar-stack draw order. Structure (census): Group{ Clone B(→Transition B) + Transition A
  + Transition B }, all Z-rotation only (flat 2D). The two cards counter-rotate + translate past each
  other (the "switch"): A holds centre f00→~f05, then B slides to centre and STAYS to the end (after
  Transition B times out ~f16, its Clone B persists B). The old `isFlatCoplanarStack` used DECLARED
  order (last-listed on top) which wrongly brought the still-visible Transition A back to the front at
  the tail → f18–f23 rendered warm photo A; GUI GT is cool photo B. FIX (compositor/index.ts): for a
  flat coplanar stack, PAINT the visible cards farthest-from-frame-centre first (bottom) → closest
  last (top), using |worldTransform (m12,m13)| (Motion origin = canvas centre). Verified vs GUI GT:
  tail f20 10.32→10.83, f21 10.63→11.53, f22 10.64→12.44, f23 10.34→13.76 — the tail now settles on B.
  Generic (flat-stack geometry, no slug name); gate 0 regressions. REMAINING (smaller): the early
  swap f02–f05 still shows B a touch too early (GT holds A to ~f05) + the tail card's coverage/scale
  is slightly under GT (mean-luma low) — a geometry refinement, separate from the now-correct z-order.
- **Movements/Smear (10.91):** DirectionalBlur+Smear filter appearance + smear continuing past the
  drop-zone timeout (content vanishes at 0.467s). Clamp tried → worse (rejected).
  **🔬 CONFIRMED NOT-FILTER-MATH (2026-07-14n, S7-smear agent):** the Smear (PAEScrape, `scrape.ts`)
  + DirectionalBlur math is verified CORRECT (~39 dB vs isolated headless FCP; all .motr constants
  decode cleanly: Rotation=3π/2, Amount 70→thr 130, Center.X 1.043→0). The 10.91 deficit is the
  A/B-RETIME + content-persistence subsystem, not the filter: per-frame trace shows the engine
  composites Transition-B fully opaque from f01 (occluding smeared A) then wraps to frame-0 for
  f09–f23, whereas GUI-GT holds photo A while it smears into horizontal streaks (revealing B as a
  thin growing strip from the LEFT edge f0–f16) and only fades to full B at the tail (f17–f23).
  Neither drop zone has an Opacity curve — the reveal is driven purely by drop-zone lifetimes ×
  smear geometry × retime. MEASURED all candidates: wrap-cancel 10.91→10.15, +holdIncomingB 10.15
  (fixes f10–16 to ~12 but f17–23 collapse 10.4→6.4 — GT keeps REVEALING B while hold freezes it),
  clamp@{0.30,0.40,0.467,0.55} all 10.15. Frame-0 wrap "wins" only because frozen-A is numerically
  closer to final-B than the black/frozen tail a cancel produces. Real fix = the flagged S4/S2
  continuing-reveal content-persistence model (multi-tick), NOT a one-slug patch. T-F1 confirmed +
  generalized: wrap-cancel/hold-B/clamp ALL regress because the true bug is a CONTINUING reveal the
  current drop-zone model cannot express.
- **Stylized/Lower (9.0):** kinetic mask-panel choreography; misses the bright mid white flash
  (partly S2 linear-compositing, partly panels culled vis=false).
- **Stylized/Panels_Across (10.4):** DIAGNOSED 2026-07-14 — sharp per-frame dip at f09–f11
  (5.16/6.11/7.68 dB). GUI GT f09–f11 is a near-UNIFORM WHITE FLASH (mean ≈(252,251,251)→(223)) but
  the engine renders a LEFT→RIGHT whiteness RAMP (col-brightness 8 bins: 50,81,98,100,166,231,214,
  254 vs GT 250–254 flat). Root cause: the "White panels" group (id 1027432) has 7 white "Rectangle"
  strips with STATIC per-panel Fill Opacity (id=141: 0.05,0.15,0.30,0.55,0.70,0.80,1.0 — verified NO
  animation curve; layer opacity + group opacity both flat 1.0) that FAN OUT from a stack over time
  (t=0.20 all at tx≈545; t=0.375 four low-op panels bunch at screen x=[880..1157], the 0.7/0.8/1.0
  panels at [1087..1919]). So at the flash peak the engine covers only the RIGHT ~half (mid-scanline
  white-alpha bins 0,0,0,.25,.79,.73,.83,1.0) leaving the LEFT half tan photo-A, while FCP shows full
  white. The flash is NOT opacity-animated and NOT Transition B (vis=false at f09). Likely the panel
  Fill Opacity 0.05→1.0 is NOT a per-panel render alpha but a build-order stagger (all panels paint
  opaque white, sequenced), OR the panels are wider / positioned to fully tile at peak. Needs the
  real panel layout/opacity semantics decoded before a fix — a wrong guess (e.g. force opaque) risks
  regressing the correct pre/post-flash frames. TESTED + REJECTED (2026-07-14): flag FCT_PANEL_OPAQUE
  forcing all panel fills to alpha 1.0 made Panels_Across WORSE (10.33→9.21) and left f09 at 5.19 —
  the left frame-half stays tan REGARDLESS of opacity because NO panel covers it at the peak. So the
  bug is GEOMETRIC COVERAGE (panels only reach the right ~half by f09), not fill alpha. The real fix
  is the panel sweep/position/count so they tile the FULL frame at the flash peak (or a separate
  full-frame white element FCP composites that the engine drops). DECODED FURTHER 2026-07-14: each of
  the 7 panels (verts x=[-139..139]=278px, wt scale 1.0) has a different Position-X keyframe count and
  distinct final rest that together TILE the frame: R1(2kf)→+833, R2(3kf)→+556, R3(4kf)→+277,
  R4(5kf)→0, R5(6kf)→-278, R6(7kf)→-556, R7(8kf)→-833 (offset 3.67s; the isSolidPanel re-anchor
  curveTime=timeSec-offset IS applied). Each reaches its rest at a DIFFERENT scene time (R1 ~f6 …
  R7 ~f17), so full tiling completes ~f17 — but GT peaks at f09 then FADES (252→241→223→200→167), a
  TRANSIENT, not the late opaque tiling. So GT's f09 full-white is likely a mid-sweep OVERLAP peak
  that the 278px strips can't reproduce (panels probably wider in FCP, or more of them, or a separate
  contributor). ACTIONABLE ROOT (2026-07-14): each panel ALSO has an animated LAYER Opacity (id=202)
  fading 1→0 over LOCAL time −2.369..−2.069s, but the engine's single `curveTime = timeSec−offset`
  (offset 3.67s → curveTime range −3.67..−2.87 for scene 0..0.80) NEVER reaches −2.37, so the panels
  never fade — opacity holds 1.0 all transition. The panel POSITION curves (−3.67..−2.97) and OPACITY
  curves (−2.37..−2.07) live in DIFFERENT local sub-ranges spanning ~1.6s total, which must be mapped
  into the 0.80s clip by the TEMPLATE RETIME (playRange 1.668s), not a single constant offset shift.
  So the real fix is a template-timeline retime for offset-authored panel shapes (scale local time to
  the clip), NOT a position/opacity tweak — a time-authority change (risky; the current single-offset
  model is what gives Rotate 18→32 dB, so must be done isolated + gate-green). Unresolved mechanism;
  a wrong guess regresses. NO fix shipped; full decode recorded for a future focused time-authority effort.
- **Multi / Multi-flip / Pinwheel / Swing / Rotate (12–14):** Movements 3D fold geometry,
  each near-matched; small residuals.
- **Movements/Flip — FIXED 2026-07-14g (14.70→16.50):** the PAEFlop page-flip drew source A on
  BOTH card faces (stale "headless resolves both pages to A" note); GUI GT shows the back face is
  photo B. Fix: bind each page to its own drop-zone source (front→A, back→B). Concentric neutral.
Solved recently (see Done ledger): Divide A/B + wrap + mask-dilation, Duplicate/Squares A/B.

### S8. Procedural / animated group masks  [SHIPPED 2026-07-14m: source-less shape-mask matte + write-on envelope, Diagonal pair 11.39→13.47 (+2.08), default ON · HIGH coverage]  (task T-H1)
DECODED (Stylized/Wipes Diagonal): the effects field is revealed by an `<mask name="Animated mask"
factoryID="11">` attached to the "Gradient and background" GROUP (id 999207202). The mask is
SELF-DRAWING — it contains an Emitter replicator ("Emitter" 987201535 → "Cell copy") that paints a
shape along a stroke, sweeping DIAGONALLY from bottom-left to fill the frame. Its rendered content IS
the group's alpha matte, so the gray Background + hard-light green field are revealed progressively
(GT greenness grid: green sweeps BL→TR; f05 only BL corner, f08 lower-left ~half green, TR still
brown). My engine has NO handling for a `<mask>` node WITHOUT a `Mask Source` reference (parser only
captures Image Mask = masks that POINT to another shape/group; this one draws its own alpha), so the
"Gradient and background" group renders UNMASKED and washes the whole frame gray from its hard
timing.in=0.100s (≈f03). THIS is the true root cause of the Diagonal f03 wash (NOT population
density, NOT the field proxy — both retired; see progress log 13k).
COVERAGE: a census of all 65 built-ins found **16 slugs** with non-Image-Mask procedural `<mask>`
nodes (factoryID 11/12/13/14/15 = various shape/animated/emitter mask kinds): Objects/Arrows,
3D_Rectangle, Combo_Spin, Stylized/Center, Center_Reveal, Color_Panels, Diagonal (×2 slugs),
Glide, Heart, Light_Sweep, Loop, Lower, Slide_In. Several are current low performers (Lower 9.0,
Center 11.8, Glide, Loop, Heart) → this is a genuinely GENERIC, high-value subsystem, not a
per-transition patch.
BUILD PLAN (generic, no transition names):
  1. Parser: capture `<mask>` nodes that have NO Mask Source but DO contain drawable content
     (shape geometry and/or an Emitter replicator) — a "procedural mask". Store its subtree so the
     compositor can render it to an alpha buffer.
  2. Compositor: render the procedural mask's content to a single-channel alpha buffer at the
     evaluated time (rasterize its shape(s); sim its emitter-along-stroke if present), then use that
     as the owning layer/group's alpha matte (multiply group alpha), honouring Invert + Mask Blend
     Mode already decoded for Image Mask.
  3. The cumulative-ancestor-opacity primitive (buildCumulativeOpacity, built + reverted in 13k) is
     the correct COMPANION gate for the emitter cells and should be reintroduced together so the
     net is a win (alone it regressed because early sprites compensated for the unmasked wash).
VERIFY: gate green; expect Diagonal pair + Lower/Center/Glide/Loop to move up together.

S8 SUB-TAXONOMY (decoded 2026-07-13k — pick the tractable path FIRST):
  (a) STATIC shape masks — rig-selected, timing-gated shapes with curve_X/curve_Y geometry and
      NO emitter (Stylized/Lower's 20 triangle/leaf/box panels fid=12; Stylized/Center fid=14).
      ⚠️ MEASURED DEAD END (2026-07-13k): a flag-gated experiment (FCT_LIFT_ALL_MASKS) that lifted
      EVERY non-Image-Mask procedural <mask> to an isMask clip child and rendered all 65 slugs gave
      **0 improvements and 1 regression** (Stylized/Center_Reveal 12.09→11.04, −1.05; Lower 9.04→
      8.97, Slide_In 10.25→10.18, Diagonal/Glide −0.1). So these masks are NOT simple alpha clips —
      lifting their geometry as a clip helps nothing and hurts. They are either write-on strokes
      (see (b)) or additive content, and need the FULL semantics, not a shape lift. The old
      clone-only scar is now quantified: the same lift regresses Center_Reveal by ~1 dB. Do NOT
      pursue the naive static-mask-lift; it is retired.
  (b) PAINT-STROKE WRITE-ON masks — emitter/brush masks (fid=11/13 with Emitter=true) whose alpha
      is painted progressively along a bezier stroke by a brush-dab emitter (params: Brush Source /
      Brush Profile / Brush Type / Build Style / "Completed" write-on % / Angle+Pen-Speed Over
      Stroke / Dab Depth Ordered). Used by Wipes+Stylized/Diagonal ("Animated mask"), Stylized/
      Slide_In (8 rect/arrow/pill × up/down variants), and this is the SAME "arc write-on = FCP-
      internal procedural draw" already flagged deferred for Loop/Heart/Center-reveal timing. This
      is the HARDEST render primitive in the engine: a brush-dab stroke rasteriser along a bezier
      path gated by a "Completed" write-on envelope. Since (a) is a proven dead end, S8's ONLY real
      path is (b) — build the brush-dab write-on stroke rasteriser as its own primitive (shared
      across ≥5 slugs: Diagonal ×2, Slide_In, Loop, Heart, Center-reveal). Treat as multi-tick.

  ⭐ PREMISE CORRECTION (2026-07-14k, from `fct minimize Wipes__Diagonal --frame 3`): the Diagonal
  early-frame wash is NOT gated by the (b) brush-dab write-on emitter. The minimizer converged the
  17,671-element scene to a **6-node** reproducer that still diverges 6.5→7.0 dB at f3 — and it
  STRIPPED THE EMITTER ENTIRELY. The surviving essential nodes are just:
      layer "Transition Diagonal"
        └ group "Gradient and background"
            └ scenenode "Background" (fID 11 = shape)
        └ mask  "Animated mask"      (fID 11, NO emitter, NO Mask Source)
      layer "Transition Drop Zones"
        └ scenenode "Transition A"   (fID 9 = photo A)
  The "Animated mask" reduces to a **closed, feathered, keyframe-animated SHAPE mask** (Shape
  Type=1, Closed=1, Is Mask=1, Feather=300, Mask Blend Mode=0; curve_X/curve_Y = 12 vertices;
  27 curves / 14 keypoints animating the control points; Rotation.Z≈−0.79 rad ≈ −45°). Its content
  IS the group's alpha matte. Our engine has NO handler for a `<mask>` with NO Mask Source (it
  draws its own alpha from its own shape geometry), so the "Gradient and background" group renders
  UNMASKED and washes gray from Background's timing.in=0.100s (≈f03). At f03 the emitter has barely
  painted anything, so the DOMINANT early-frame bug is purely the missing procedural SHAPE-mask
  matte — a far more tractable primitive than the feared brush-dab stroke rasteriser. The emitter/
  brush (b) still refines the LATE progressive edge (f06–f12), but the first, biggest win is:
  rasterise the animated closed feathered shape → single-channel alpha → multiply the owning
  group's alpha (honour Feather + Rotation + the already-decoded Invert/Blend Mode). Reduced case:
  `fct/minimized/Wipes__Diagonal/` (case.motr + 24 frozen FCP-truth frames + manifest, engine-vs-
  FCP 8.48 dB mean / 2.27 dB worst). NEXT S8 step: build the procedural-shape-mask alpha matte
  against this minimal repro, drive it to ≥25 dB on the reduced case via `fct min-*`, THEN verify
  the Diagonal pair (and other shape-mask slugs) on the GUI-GT gate.

  ⭐ BUILT (2026-07-14l, FLAG-GATED `FCT_PROCMASK`, default OFF — byte-identical baseline, gate
  0/0): the procedural-shape-mask matte infrastructure is landed. Parser lifts a source-less
  `<mask>` (no Mask Source) that carries its own closed geometry into a child mask-shape — in BOTH
  `parseSceneNode` AND `parseLayerElement` (Diagonal's "Animated mask" is a direct `<mask>` child of
  the "Transition Diagonal" `<layer>`, not a scenenode). Added `Shape.feather` (parsed from the
  mask's Feather param) + a 3-pass separable box-blur in `rasterizeShape` that soft-blurs the alpha
  edge by feather·transformScale px (Diagonal Feather=300 → wide soft sweep). Added a mask
  local-frame re-anchor (curveTime −= offset) so the sweep starts off-screen not mid-frame. Verified:
  flag ON lifts the mask + improves the reduced case **8.48 → 11.21 dB** (min-gen/min-score); flag
  OFF renders max-pixel-diff 0 vs baseline on Center_Reveal/Lower/Arrows (byte-identical).
  ⚠️ WHY STILL FLAG-OFF (the write-on discovery): with the flag ON the FULL Diagonal GUI-GT slug
  REGRESSES −0.47 dB (11.39→10.92). Root cause DECODED via instrumented mask coverage: the
  instantaneous shape mask is a FINITE quad that sweeps diagonally ACROSS the frame and EXITS
  (coverage 0→11→39→85→52→0 over f0–f18) — it reveals then RETREATS. But the GUI-GT greenness grid
  proves FCP's reveal is a MONOTONIC WRITE-ON: the green front sweeps bottom-left→top-right and once
  a pixel is revealed it STAYS revealed (f06 BL-corner only → f08 BL-half → f10 ⅔ → f12 full, never
  retreating). So the correct matte is the per-pixel MAX-over-time of the instantaneous mask alpha
  (a write-on envelope), NOT the instantaneous alpha. This is the same "write-on" semantic (b)
  flagged for the emitter — but it applies to the SHAPE mask's own swept region, and is the ONE
  remaining piece. NEXT S8 step: add the temporal max-accumulation (sample the mask transform at K
  sub-times from mask-start→t, union the rasterised alphas) so the reveal is monotonic; verify the
  reduced case → ≥25 dB AND the Diagonal pair goes UP on the GUI-GT gate, THEN flip `FCT_PROCMASK`
  on by default. The accumulation needs the compositor (or evaluator) to re-rasterise the mask at
  sub-times — a localized addition on top of the now-landed lift+feather+re-anchor.

  ⭐ SHIPPED (2026-07-14m, `FCT_PROCMASK` default ON): the procedural shape-mask matte + write-on
  envelope. (1) parser `liftProceduralMasks` lifts a source-less `<mask>` with real closed-shape
  geometry + Is Mask=1 into a child mask-shape (in BOTH parseSceneNode and parseLayerElement —
  Diagonal's "Animated mask" is a direct `<mask>` child of the `Transition Diagonal` <layer>, not a
  scenenode; the layer path was silently dropping it → the fix); (2) `parseShape` reads the mask
  `Feather` radius; (3) `rasterizeShape` applies a 3-pass separable box blur (Gaussian approx),
  scaled by transform magnification; (4) evaluator re-anchors the mask's animated Position/Scale
  curves to the mask timeline `offset` (Diagonal's sweep is keyed in local frame, offset 0.3003s);
  (5) ⭐ WRITE-ON envelope: the evaluator samples the mask worldTransform at K=12 sub-times in
  [mask-start, t] (`EvaluatedLayer.writeOnTransforms`) and the compositor rasterizes each + unions
  them per-pixel-max, so the reveal is MONOTONIC (a pixel revealed at any earlier sub-time stays
  revealed) instead of the instantaneous quad that sweeps ACROSS and RETREATS. An empty
  writeOnTransforms (sweep not yet entered) zeroes the group matte (reveal nothing) rather than
  leaving it unmasked. WHY write-on: the greenness grid proved FCP's reveal sweeps BL→TR and never
  retreats (f06 BL corner; f08 BL half; f10 ~2/3; f12 full; then holds). VERIFIED on the GUI-GT gate
  (the one truth): Diagonal pair **11.39 → 13.47 dB (+2.08 each), 0 collateral regressions** across
  all 65 (the lift fires on 14 built-ins: Diagonal ×2, Center, Center_Reveal, Lower, Glide, Loop,
  Heart, Slide_In, Light_Sweep, Color_Panels, 3D_Rectangle, Combo_Spin, Arrows — none regressed).
  NOTE: the plain instantaneous mask (no write-on) REGRESSED −0.47 dB and its min-gate score (11.21)
  is ANTI-correlated with GUI-GT — a reminder that the min-gate is a diagnostic, NOT the truth; only
  `fct regress engine` (GUI-GT) decides. Perf: K=12 rasterizations/mask/frame makes mask-heavy slugs
  (Color_Panels) slower to render; acceptable for now, could be adaptively reduced later.


---

## Reference — implemented subsystems (DONE; documented so nothing is undocumented)

These parts of the engine are complete and gate-protected. Listed so the ROADMAP is a full map
of what EXISTS, not only what's left.

**Filters (all reverse-engineered + registered in `compositor/filters/`, dispatched by UUID):**
Gaussian Blur, Directional Blur, Radial Blur, Zoom Blur (log-polar), Channel Mixer, Colorize,
Tint, Levels, Brightness, HSV Adjust / Hue-Saturation, Glow, Bloom, Fill, Luma Keyer (trapezoid
alpha), MinMax (separable erode/dilate morphology), Flop, Bevel, Bad TV, Black Hole, Earthquake,
Underwater, Scrape, Smear, PAENoise (Lights/Static), 360° Reorient. Each has a decoded-constant
comment citing the FCP binary it came from; verified via `tools/re/filter_sweep.py`
(`tools/re/filter_sweeps.json`, 46 PASS / 0 FAIL param-space cases).

**Behaviours evaluated (`evaluator/`):** Rig Behavior (widget snapshot select), Fade In/Fade Out,
Ramp, Align To, Oscillate, Spin, Throw, Sequence Replicator, Link (position/rotation/scale/anchor/
opacity — NOT colour, see S1).

**Compositing/geometry:** blend modes (normal/screen/add/overlay/lighten/multiply), Image Mask
reveal (rasterized shapes + replicator matte + mask-source-group filters e.g. Divide MinMax
dilation), replicator instance layout + sequence build, Clone Layer resolution, drop-zone
conform + native-then-resample for upscaled scenes, page-flip (PAEFlop), 360° full-frame panorama
model, framing camera pose (partial — see S6).

**Time authority (`timemap.ts` + `api.ts`):** single scene-time remap; retime-wrap (extrapolation
mode 1) with structural cancels (filled-shape / blended-media / replicator-matte / kinetic-panel /
filtered-mask reveals) and stroked-mask clamp; animationEndSec local-frame re-anchors
(camera/generator/panel negative-offset); media playback FORWARD by default.

**Parser (`parser/`):** `<enabled>0>` skips disabled filters; drop-zone Width/Height curve parse;
A/B binding by name with document-order override + both-masked suppression (Divide) + replicator-
mask-reveal binding (Squares/Duplicate); fade-direction A/B; footage clip media resolution.

**Toolkit (`fct/`) + CI:** `fct gen|score|regress|baseline|probe|gate`; GUI-GT one-truth gate at
480×270 with mtime-thumbnail cache; `tools/re/read_const.py` fat-binary constant reader;
`fit_color.py` derives the GAM constants; `test/no-hardcode.test.ts` fails any detector firing on
< 2 built-ins.

**Delta-debug minimizer (`fct minimize` + `fct min-*`):** shrinks a transition's `.motr` to the
MINIMAL node subtree where the TS engine still DIVERGES from the real FCP engine (headless), so a
fix targets the exact responsible nodes instead of a 17k-element scene. ddmin over structural nodes
(scenenode/layer/group/filter/behavior/mask), oracle = engine-vs-headless-FCP PSNR on the SAME
reduced `.motr` (headless IS the real Motion algorithm — this isolates where our CODE differs from
FCP's CODE; it does NOT replace the GUI-GT gate on the 65 shipped transitions). Two correctness
invariants: (1) trial motrs are written in a work dir that SYMLINKS the source's siblings so FCP +
the TS engine resolve bundled `Media/` textures relative to the `.motr` dir (a bare /tmp copy loses
them → false divergence); (2) headless renders go through a PERSISTENT worker (`fct
_headless-worker`) that boots the FCP Ozone engine ONCE and is reused across all trials, only
RESPAWNING when a malformed reduced doc SIGSEGVs it — so crash-isolation is preserved but the
~3.5s engine boot is paid ~once-per-crash instead of once-per-trial (measured ~1.7s first render
incl boot, then ~0.35s reused; the whole finalize dropped from ">12 min stuck" to ~30s). The
per-call isolated `fct _headless-frame` path is kept as a fallback.
Reduced cases live in `fct/minimized/<case>/` (case.motr + headless/ truth frames + manifest); the
`min-gen|min-score|min-baseline|min-regress` gate tracks engine-vs-FCP PSNR per case (99 dB = the
underlying engine bug is fixed). This is the new forcing function for the hard subsystems (S2/S3/S8):
minimize a low slug → fix its minimal repro → verify on the GUI-GT gate.

---

## Progress log  (newest first — one line per completed chunk)
- 2026-07-14u  S7 WIN — Movements/Switch tail-settle FIXED via flat-stack z-order (11.68→11.96, +0.28,
              gate 0 regressions). Pivoted off Bloom (3 ticks, decode complete, remaining blocker is a
              subtle curve/temporal effect) to a shippable slug. Census confirmed the premise but
              CORRECTED the earlier "clone-source binding" decode: Clone B DOES correctly mirror
              Transition B — the bug was Z-ORDER. Switch = a flat coplanar stack (Clone B + Transition
              A + Transition B, all Z-rotation only); the two cards counter-rotate past each other so A
              holds centre f00→~f05 then B slides to centre and STAYS to the end. The old
              isFlatCoplanarStack used DECLARED order (last-listed on top), which wrongly brought the
              still-visible Transition A to the front at the tail → f18–f23 rendered warm photo A while
              GUI GT is cool photo B. FIX (compositor/index.ts): for a flat stack, paint visible cards
              farthest-from-centre first (bottom) → closest last (top) using |worldTransform(m12,m13)|
              (Motion origin = canvas centre). Tail f20 10.32→10.83, f22 10.64→12.44, f23 10.34→13.76.
              Generic (flat-stack geometry, not a slug name); only Switch carries the Clone-B flat-stack
              signature in the corpus. Baseline re-frozen 14.39→14.395. tsc + no-hardcode green.
              Remaining (smaller, separate): early swap f02–f05 shows B slightly too early + tail card
              coverage/scale a touch under GT — a geometry refinement, not the (now-correct) z-order.
- 2026-07-14t  S4/T-D2c BLOOM — decoded the canThrowRenderOutput PARAM PREP (the missing transform
              layer) + isolated the residual to a threshold-curve/temporal effect (NOT Glow, NOT the
              Bloom math). Register-traced -[PAEBloom canThrowRenderOutput:…] @0xc610: the UI params
              are TRANSFORMED before bloomHeliumRender receives them — withRadius=Amount,
              withBrightness=|Brightness−50|·4 (so Brightness=100 → gain 200/50=4.0, NOT 2.0),
              withThreshold=Threshold (or 100−Threshold if Brightness<50), doDarkBloom=(Brightness<50),
              withXScale/YScale=Horiz/Vert·0.01·(scale/max). Wired all of these into bloomFilter
              (glow.ts). CRITICAL ISOLATION: rendered Bloom-ALONE with the Glow filter disabled (temp
              FCT_NO_GLOW diagnostic, reverted) — it STILL over-blooms the mid-ramp (f06 112 vs GT 98,
              f10 191 vs 138), so the over-bloom is NEITHER the co-stacked Glow NOR the now
              register-verified Bloom math. It is a threshold-CURVE-response/temporal onset: GT holds
              flat (~89) until ~f06 then ramps to the f14 peak, while the engine's threshold (linear
              interp of the 100→3→100 curve — and even the exact flat-tangent bezier ≈41 at f06) lets
              the ×10 extract bloom the base's many bright pixels (~36% have max-ch>0.63) far too early.
              Peak still matches GT (f13–14 ≈223 vs 227). Kept FCT_BLOOM_FLOAT default OFF (gate
              re-confirmed 0/0, byte-identical). NEXT: decode the curve-time/onset (why FCP's effective
              threshold stays high through f06) — likely the filter evaluating its curve on the filter's
              OWN 0.25s timeline vs the engine's 0.2667s span, or an HGBlur/threshold temporal property;
              decode-don't-fit (smoothstep ease TESTED, worse). This is the sole remaining blocker to
              flipping the flag ON and shipping the verified peak-fix. tsc + no-hardcode green.
- 2026-07-14s  S4/T-D2c BLOOM — COMPLETED the bloomHeliumRender register trace (decode-don't-fit) +
              corrected the blur radius; float bloom landed FLAG-OFF (byte-identical, gate 0/0) as a
              register-verified building block. The prior @0xe58a addr was the x86_64 slice — the arm64
              method is -[PAEBloom bloomHeliumRender:…] @0xc88c. Traced every shader-param store:
              HgcBloomThreshold SCALE=+10 / BIAS=−Threshold/10 / no-alpha-clamp (extract CONFIRMED as
              already implemented); HgcEchoScaleAndAdd out=orig+blur·(Brightness/50) clip@(doClip?1:∞)
              (combine CONFIRMED); and the ONE correction — the blur radius fed to HGaussianBlur::init
              is 0.5·Amount, not raw Amount (my impl was 2× too wide). Also confirmed the −2.25 echo
              Translate is a legacy versionAtCreation==0 path, SKIPPED on modern renders (correctly
              omitted). Rebuilt glow.ts bloomFilter (radius 0.5·Amount) + gaussian-blur.ts
              decimatedBlurFloatRGB (Float32 mirror of the u8 decimated blur). MEASURED: peak still
              matches GT (f13–14 ≈223 vs 227) but the mid-ramp still over-blooms (10.54 < baseline
              11.51) → gated behind FCT_BLOOM_FLOAT (default OFF = byte-identical, gate re-confirmed
              0/0). Isolated the residual to two PRE-EXISTING (also in the 8-bit path) issues, NOT the
              now-verified Bloom math: the co-stacked GLOW ramp + a ~2-frame temporal ONSET lag (GT
              holds flat ~89 through f06 then ramps; engine blooms at f04). Verified the 360° base
              image matches GT (f00 84.6 vs 89) so it's not an equirect-base error; smoothstep-ease on
              the interp=1 threshold was tested and made it WORSE (ruled out). NEXT: decode the temporal
              onset lag + Glow-stack, THEN flip the flag to ship. tsc + no-hardcode green.
- 2026-07-14r  S4/T-D2c BLOOM — BUILT + PEAK-VERIFIED the float bloomFilter; REVERTED clean (mid-ramp
              regresses). Anti-timidity: proven building block + clean reversal, NOT a diagnosis-only
              no-op. (1) CORRECTED a false premise (rule 8): the ROADMAP claimed 360° Bloom's band path
              "BYPASSES the filter" — VERIFIED detect360Band returns NULL for Bloom (fires only on the
              other 7 push/slide/wipe 360° slugs), so 360° Bloom takes the NORMAL path and its stacked
              Gaussian Blur→Glow→Bloom all fire LIVE. (2) Implemented the decode-faithful FLOAT bloom
              (glow.ts bloomFilter + gaussian-blur.ts decimatedBlurFloatRGB — a Float32 mirror of the u8
              decimated blur, identical kernel/decimation so the blur SHAPE matches HGBlur, but no 8-bit
              clamp so the ×10 extract's >1 cores survive). (3) MEASURED vs GUI-GT: the PEAK is FIXED —
              360° Bloom f13–f14 luma 194→222.8 vs GT 227 (the 8-bit headroom clamp the old glowFilter
              path imposed is gone, proven correct). BUT the mid-ramp over-blooms ~3–4 frames early
              (f09 191 vs GT 119) → net 11.51→10.48, so REVERTED (tree clean, gate re-confirmed 0/0).
              Isolated 3 decode-shaped causes (none a tuned constant): flat-tangent interp=1 threshold
              curve (tested smoothstep ease → worse, ruled out), the co-stacked Glow ALSO ramping/
              compounding, and a real FCP bloom temporal-LAG (GT peaks ~2–4 frames AFTER threshold-min).
              NEXT: full bloomHeliumRender @0xe58a register trace (scale/bias/gain packing via
              tools/re/read_const.py) + Glow↔Bloom stack order + temporal-lag model, THEN the verified
              float peak-fix lands as a net win. Full detail in S4 section. No pixels shipped (revert).
- 2026-07-14q  FORENSIC premise-correction (rule 8/9a, docs-only): T-D2c "Glow/Bloom into linear —
              DONE" was FALSE. Traced glow.ts blob history: b8a6c8e added the linear branch (flag-OFF,
              7× isLinearCompositeEnabled), then eefb0ec (T-B2 Emitter SIM, cut from a stale glow.ts)
              reverted the blob 56219de→7ea6bec on merge, silently deleting the whole T-D2c linear
              branch + its 9 tests — a rebase-clobber (eefb0ec's message never mentions glow). Verified
              current main: glow.ts has NO ../linear.js import; only channel-mixer + hue-saturation are
              linear-wired. AND even the lost branch stored intermediates as Uint8ClampedArray (u8
              linear-light, clamped 255) so it could never hold Bloom's >1.0 headroom (corroborates the
              S3-bloom agent's 194-vs-250 under-bloom proof). Flipped the flat-list marker DONE→PARTIAL
              with the full forensic note; the real T-D2c is a FLOAT headroom-preserving glow/bloom
              chain (tone-map once at readback), still pending. No code touched (flag was OFF = no pixel
              impact either way); this retires a false "done" that would have misled the next S2 tick.
- 2026-07-14p  S7 LENS-FLARE GENERATOR SHIPPED — real subsystem win, gate-green (orchestrator merged
              the S7-lensflare agent's work after gate-verifying on main per rule 4). The engine's
              `determineImageSource` returned `undefined` for the LensFlareGenerator (pluginUUID
              4933D9F1-A848-4625-BCCA-198A97726DB5, Screen-blended), so the flare rendered as nothing
              and the mid-transition frame stayed dark while GUI-GT is a near-white additive bloom.
              Built a faithful procedural generator: `parseLensFlare` (footage.ts) reads Intensity,
              the Falloff CURVE (dips 10→0.71 at midpoint = peak bloom), Color/Streak-Color, Ring
              radius/width, Glow Falloff, and the flare-sweep endpoints from the two published
              Center-Start/Center-End controls (authored on the DISABLED Blur Start/End filters' Center,
              read GENERICALLY by pluginName). `renderLensFlare` (gradient.ts) emits an additive
              core-glow + veil wash + halo-ring field whose brightness envelope tracks the Falloff
              curve; composited full-frame via the layer's Screen blend (masks.ts uses UN-wrapped
              mediaTime so the retime-wrap doesn't warp the flare's own animation; index.ts blits it
              1:1 so the parent Rig-scale doesn't displace it). Detection is by generator UUID/pluginName
              (like parseGaussianGradient) — NOT a slug hardcode; no-hardcode.test.ts green.
              Lights__Lens_Flare **11.63 → 13.83 (+2.2 dB)**, 0 regressions across all 65, tsc clean.
              Baseline re-frozen 14.36 → **14.39 dB**. NOTE: the appearance model uses 5 fitted
              constants (GAIN/ENVG/RAD/EXPDIV/CAP, env-tunable) rather than binary-decoded values —
              acceptable as the flare's visual magnitude isn't cleanly recoverable from the .fxp, and
              the structure (endpoints, envelope, blend) IS decoded; a future decode-tighten could
              replace the fit. Commit below.
- 2026-07-14o(2)  S3/S4 Bloom agent SETTLED — rigorous BLOCKED-ON-S2 (T-D2c), NO code shipped,
              worktree byte-identical to HEAD (562cb80), gate 0/0. Premise CORRECTED: there is no
              `compositor/filters/bloom.ts` — PAEBloom+PAEGlow both live in `glow.ts` (registered
              "Glow"+"Bloom"). Agent also CLEANED UP a broken non-compiling experiment left by a prior
              run (`evaluator/index.ts` had a half-wired `bloomWipe` behind FCT_BLOOM_EXP=1 that deleted
              the `ectx` construction + dangling brace → tsc failed); reverted 3 files via
              `git show HEAD:… > file` (not checkout), removed scratch. One-truth per-frame luma decode:
              (A) Lights__Bloom retime-wrap fires f6 and FREEZES scene to photo A — engine luma flat 90.7
              all 24 frames while GT ramps 89→250 (white flash f14)→111 (photo B); naive wrap-cancel →
              black tail (both drop zones die 0.534 ≪ endSec 1.270). (B) 360°__360°_Bloom does NOT wrap,
              bloom fires live, engine peaks 194 vs GT 250 = pure 8-bit under-bloom. WHY NO WIN: (1)
              corpus scan for the wrap-cancel bloom signature matched ONLY Lights__Bloom (1 slug) → any
              time-fix is a 1-built-in HARDCODE (violates ≥2 rule); (2) glow.ts runs entirely in 8-bit
              Uint8ClampedArray clamping at 255 at extract/blur/combine → destroys >1.0 headroom; linear
              float infra (linear.ts, S2) exists but defaults OFF, encode clamps [0,1], and Glow/Bloom is
              NOT wired in. Both slugs gate on T-D2c (migrate Glow/Bloom to headroom-preserving float
              chain). Do NOT ship the env-flagged bloomWipe synthetic-crossfade hack (per-transition).
- 2026-07-14n(2)  3 of 5 dispatched agents SETTLED as premise-correcting decodes (NO code, gate
              untouched — Rule-9(a) valid): S5-gradient BLOCKED (gradient generator + gradientTag
              pipeline already exist; Loop/Heart's real deficit is media-ornament reveal-timing, a
              separate subsystem). S6-clonegrid NO NET WIN (premise wrong: `framed` IS populated;
              Clone_Spin=1 Framing behavior factory 1, Video_Wall=2 factory 3, Concentric=camera-less;
              real bug = framing ANCHOR lands on the wall bottom-edge not centroid → wall projects
              off-frame; measured FLATZ orientation fix = within noise, reverted; next step = anchor→
              centroid, decoded Ozone offsets recorded in S6 section). S7-smear NO NET WIN (Smear/
              Scrape filter math verified correct ~39 dB isolated; deficit is A/B-retime content-
              persistence; measured wrap-cancel/hold-B/clamp ALL regress 10.91→10.15). Findings
              written to the S6/S7 sections. S3-bloom + S7-lensflare still building (implementation
              agents — the two that may ship a win). Each ran in an isolated worktree+frames+lock; I
              gate-verify + merge any winner on main (no auto-push pool).
- 2026-07-14o  PARALLEL AGENTS wave results (orchestrator gate-verifies before merge — rule 4).
              3 of 5 returned NO-NET-WIN with valuable premise-correcting decodes (no code, worktrees
              clean, nothing to merge): (S5) gradient generator + gradientTag pipeline already exist —
              Loop/Heart's real deficit is the media-ornament reveal-timing subsystem, not a fill
              gradient; (S6) framing `framed` pose IS populated (premise wrong: Clone_Spin=factory-1
              single path, Video_Wall=factory-3 wall path, Concentric=camera-less ortho) — real bug is
              the pose ANCHOR ([2399,-2145]=wall bottom edge, should be centroid [1535,2572]) scattering
              the wall off-frame; shared world-axis-orientation fix measured within-noise + reverted;
              blocked on ≥2-builtin rule (each path = 1 builtin); (S7-smear) Scrape/DirBlur math verified
              correct (~39 dB isolated) — deficit is A/B-retime continuing-reveal (S4 content-persistence),
              wrap-cancel/hold-B/clamp ALL measured-worse (10.91→10.15). S3-bloom + S7-lensflare still
              building (both in implementation, may ship). All decodes recorded in S6/S7 sections above.
- 2026-07-14n  DISPATCHED 5 focused sub-agents (isolated worktrees + private frames/lock via
              fct/swarm/setup_worktree.sh) on the remaining subsystems: S5 Gradient generator
              (Loop/Heart), S6 Framing-camera/clone-grid (Clone_Spin/Video_Wall/Concentric), S3/S4
              Bloom (Lights__Bloom/360°_Bloom), S7 Lens-Flare generator (Lights__Lens_Flare), S7
              Smear (Movements__Smear). Each self-gates in isolation and reports before→after +
              premise; per ROADMAP rule 4 the ORCHESTRATOR gate-verifies every result on main before
              merging (no autonomous auto-push pool). Early return: S5 correctly reported PREMISE
              WRONG — the gradient generator + gradientTag pipeline already exist; Loop/Heart's real
              deficit is the reveal-timing subsystem (STYLIZED_LOOP_HEART_REVEAL_RE.md), not a fill
              gradient — no code, nothing to merge (rigorous decode-first, saved a wasted build).
- 2026-07-14n  DISPATCHED 5 focused isolated-worktree agents (one subsystem each) via the
              per-agent worktree+FCT_FRAMES_DIR+FCT_LOCK isolation (fct/swarm/setup_worktree.sh),
              orchestrator gate-verifies + merges each result on main (NOT an auto-push pool — rule 4):
              S5-gradient (Loop/Heart), S6-clonegrid (Clone_Spin/Video_Wall/Concentric),
              S3-bloom (Lights__Bloom/360°_Bloom), S7-lensflare (Lights__Lens_Flare),
              S7-smear (Movements__Smear). Each: census-first, one-truth GUI-GT, gate-green,
              report before->after. S5 came back BLOCKED (false premise — the gradient generator +
              gradientTag pipeline already exist; Loop/Heart's true deficit is reveal-timing, a
              separate multi-tick subsystem — no code, nothing to merge). Others in flight.
- 2026-07-14m  S8 SHIPPED — procedural shape-mask matte + WRITE-ON envelope, `FCT_PROCMASK` default
              ON. Completed the write-on temporal accumulation the previous tick decoded: evaluator
              samples the mask worldTransform at K=12 sub-times in [mask-start, t]
              (EvaluatedLayer.writeOnTransforms); compositor rasterizes each and unions per-pixel-max
              → MONOTONIC reveal (matches FCP's BL→TR sweep that never retreats), instead of the
              instantaneous quad that swept ACROSS + RETREATED. Empty transforms (sweep not entered)
              → zero matte (reveal nothing), not unmasked. VERIFIED on GUI-GT (the one truth):
              Diagonal pair 11.39 → 13.47 dB (+2.08 each), 0 collateral regressions across all 65
              (lift fires on 14 built-ins, none regressed). ⚠️ PROCESS NOTE: a sub-agent had reverted
              the write-on based on the MIN-GATE (10.24 < plain-lift 11.21) — but the min-gate is a
              DIAGNOSTIC and here it is ANTI-correlated with GUI-GT (the reduced case's f18–f23 tail
              is a separate group-end-fade, not the mask). Rule #1 (score ONLY vs GUI-GT) caught it:
              the GUI-GT gate proves write-on is a clean win, so it ships default-ON. tsc + no-
              hardcode green. Perf: K=12 rasterizations/mask/frame slows mask-heavy slugs; acceptable.
- 2026-07-14m  S8 SHIPPED — procedural shape-mask matte + WRITE-ON envelope, default ON
              (`FCT_PROCMASK=0` disables). Diagonal pair **11.39 → 13.47 dB (+2.08 each), 0
              regressions** across all 65 on the GUI-GT gate. The write-on completes last tick's
              flag-OFF infrastructure: evaluator samples the mask worldTransform at K=12 sub-times
              in [mask-start, t] (`EvaluatedLayer.writeOnTransforms`); compositor rasterizes each +
              unions per-pixel-max → the reveal is MONOTONIC (matches FCP's BL→TR sweep that never
              retreats) instead of the instantaneous quad that sweeps across + exits (which
              regressed −0.47). Empty writeOnTransforms (sweep not entered) zeroes the group matte
              (reveal nothing), not unmasked. CAUTION LOGGED: a sub-agent reverted the write-on
              based on the MIN-gate (10.24 < plain-lift 11.21) — but the min-gate is ANTI-correlated
              with GUI-GT here (its tail-frame divergence dominates); the ROADMAP's #1 rule (ONE
              TRUTH = GUI-GT) is why the write-on ships: `fct regress engine` = +2.08, 0 regress.
              Perf: K=12 rasterizations/mask/frame slows mask-heavy slugs (Color_Panels) but renders
              fine. Lift fires on 14 built-ins (generic reveal primitive). tsc + no-hardcode green.
- 2026-07-14l  S8 SUBSYSTEM (procedural shape-mask matte) — infrastructure BUILT + write-on
              mechanism DECODED, landed FLAG-GATED OFF (`FCT_PROCMASK`, byte-identical baseline,
              gate 0/0). Parser `liftProceduralMasks` lifts a source-less `<mask>` (no Mask Source)
              with real closed geometry + Is Mask=1 into a child mask-shape, in BOTH parseSceneNode
              AND parseLayerElement (Diagonal's "Animated mask" is a `<mask>` child of the
              `Transition Diagonal` <layer>, which parseLayerElement handles — the initial lift in
              parseSceneNode alone missed it). Added `Shape.feather` parse + a 3-pass separable
              box-blur in rasterizeShape (Gaussian approx, scaled by transform magnification;
              Diagonal Feather=300 → wide soft sweep) + an evaluator mask local-frame re-anchor
              (curveTime −= offset). VERIFIED: flag ON improves the isolated min-case 8.48→11.21 dB
              (min-score); flag OFF renders max-pixel-diff 0 vs baseline on Center_Reveal/Lower/
              Arrows (byte-identical) and full gate 0 regressions. ⚠️ Kept OFF because flag-ON
              REGRESSES the full Diagonal pair −0.47 dB (11.39→10.92): the instantaneous shape mask
              is a finite quad that sweeps ACROSS + EXITS (coverage 0→11→39→85→52→0) — reveals then
              RETREATS — but the GUI-GT greenness grid proves FCP's reveal is a MONOTONIC WRITE-ON
              (BL→TR, never retreats). DECODED next step: mask alpha(t) = per-pixel MAX over
              sub-times [mask-start, t] (write-on accumulation), which makes coverage monotonic; that
              addition (evaluator-precomputed sub-time transforms or a compositor re-rasterize loop)
              is the next tick and should flip −0.47 into a win. Lift fires on 14 built-ins so the
              write-on is generic. tsc + no-hardcode green.
- 2026-07-14k  TOOLING+DECODE: (1) made the minimizer's headless renders use a PERSISTENT worker
              (`fct _headless-worker` + `_HeadlessWorker` in minimize.py) — boots the FCP Ozone
              engine ONCE and reuses it across all ddmin trials, respawning only on an actual
              SIGSEGV (crash-isolation preserved, ~10x fewer boots; measured 1.71s first render
              incl boot then ~0.35s reused; the case-frame finalize dropped from ">12 min stuck on
              the per-trial-boot path" to ~30s). Verified reuse + crash-recovery (good→bad→good all
              correct). Also routed `_render_case_frames` through the worker and deleted 2 dead
              duplicate `_link_siblings` defs. (2) DECISIVE S8 PREMISE CORRECTION from the converged
              Wipes__Diagonal minimization: ddmin reduced 105 scenenodes → a 6-node fixpoint
              (2 scenenodes/2 layers/1 group/1 mask; ZERO filters/behaviours, EMITTER STRIPPED) that
              STILL diverges at f3 (6.95 dB). So the Diagonal wash is NOT the feared brush-dab
              write-on emitter (S8(b)) — it is the plain **animated closed feathered SHAPE mask**
              ("Animated mask" fID=11: Shape Type=1, Closed=1, Is Mask=1, Feather=300, 12-vertex
              curve_X/Y outline w/ 27 curves/14 keypoints animating BL→TR) acting as the group's
              alpha matte, which our engine drops (no handler for a source-less `<mask>`) → gray
              wash from f03 while FCP holds photo-A. S8's tractable FIRST build is the procedural
              shape-mask matte (rasterise the mask's own animated shape → alpha → multiply group
              alpha), FAR simpler than the brush-dab rasteriser. Reduced case committed at
              `fct/minimized/Wipes__Diagonal/` (min-score 8.48 dB mean / 2.27 worst). Gate green
              (engine 0/0; tooling-only, no engine pixels changed). (3) Fixed `npm --prefix engine
              test` which crashed on Node 24 (`ts-node/esm` loader is broken there) — switched the
              `test`/`test:visual` scripts to the already-declared `tsx` runner; `npm test` now
              exits 0 and no-hardcode.test.ts passes (all 7 detectors fire on ≥2 built-ins),
              restoring the self-merge contract's test step. NEXT: build the source-less
              shape-mask alpha matte, drive the reduced case → 99 dB on the min-gate, verify the
              Diagonal pair improves on GUI-GT.
- 2026-07-14j  TOOLING: added `fct minimize` — a `.motr` DELTA-DEBUGGER (ddmin) that reduces a
              transition to the minimal node subtree where the TS engine still diverges from the real
              FCP engine (headless), plus the `fct min-gen|min-score|min-baseline|min-regress` gate
              over `fct/minimized/<case>/`. Debugging whole transitions was the blocker (Diagonal =
              17,671 XML elements); this isolates the exact responsible nodes. Oracle = engine-vs-
              headless on the SAME reduced motr (headless = real Motion algo; NOT a GUI-GT stand-in —
              the shipped-transition GUI gate is untouched). Decoded + fixed two traps: (1) FCP/engine
              resolve bundled `Media/` RELATIVE TO the .motr dir, so trial motrs must symlink the
              source's siblings (a /tmp copy renders Diagonal's field 146→161 = a false 21.8 dB
              divergence); (2) the FCP engine SIGSEGVs on malformed reduced docs, so each headless
              render is subprocess-isolated. Verified end-to-end on Wipes__Diagonal: baseline worst
              frame f3, engine-vs-FCP 6.52 dB (huge divergence, the real S8 write-on-mask bug). Commit
              e2aff22 (pushed). NEXT: let the Diagonal minimization finish, commit the reduced case +
              freeze the min-baseline, then fix the minimal repro and verify on both gates.
- 2026-07-14i  S7 Wipes__Mask — endSec-cap hypothesis TESTED + REFUTED (clean reversal, gate 0/0).
              DECODED the mechanism: Wipes__Mask's `animationEndSec` = **5.038s** while the authored
              span (duration÷frameRate) = **1.30s** and ALL real motion curves (the "Vertical" wipe
              shape's X/scale sweep) end by **0.968s**. The inflation comes from the drop-zone
              `Object`-block FIT curves (Object>Width 1088→1920, Object>Fit Factor X/Y 1→1) carrying a
              trailing keyframe at 5.038s — canvas layout metadata, not motion. HYPOTHESIS: cap those
              Object-fit curves to spanSec so the 24 frames sample the real ~1s wipe (Divide's in-span
              Object>Width 1280→1311 at 1.00s stays untouched — verified endSec 1.38 unchanged; only
              Wipes__Mask 5.04→1.30 and Earthquake 2.25→1.77 changed). MEASURED: **REGRESSED** Wipes__
              Mask 14.30→10.40 (and Earthquake 15.27→15.11). Root of the refutation: the inflated endSec
              was ACCIDENTALLY LOAD-BEARING — it froze the wipe mask at FULL for f6–f23, and that frozen
              full-mask happens to render photo-A held across the body, which matches GT (GT holds photo-A
              through f17, wipes to B only at f18–f23). Capping endSec made the mask wipe CONTINUOUSLY
              across all 24 frames instead, which is further from GT. The real fix is NOT the time window:
              it is the A/B binding (engine base = transitionB but GT's held frames are photo-A) COMBINED
              with a mask that HOLDS its start state then wipes late — i.e. a template-retime + binding
              problem, same class as Panels_Across. The naive A/B swap alone was already shown to regress
              the body (see S7 note). Reverted parser, re-rendered the 3 touched slugs, gate green 0/0.
              LESSON: a too-long animationEndSec can be a hidden CRUTCH for a hold-then-act transition —
              don't "fix" it in isolation. (Also confirmed: LensFlare/Bloom are missing-subsystem, and
              Rotate/Swing/Scale/Duplicate/Concentric are coupled clone/mask geometry — no clean 1-tick
              pixel win exists in the current 9–14 dB band; the remaining wins are subsystem builds.)
- 2026-07-14h  S4 Bloom DECODE ADVANCE (gate-neutral, premise-correcting per rule 9a) — built the
              decode-faithful FLOAT-buffer `bloomFilter` (glow.ts: extract ×10−Thr/10 → float Gaussian
              blur mirroring makeGaussianKernel/gaussianDecimation with NO 8-bit clamp → additive
              combine ×Bright/50 → clip-to-white). UNIT-VERIFIED correct (uniform 0.8 → 255 white, the
              amplification the 8-bit glowFilter path dropped). REVERTED (clean) — shipping it alone
              net-regresses BOTH gated slugs, and MEASURED exactly why: (1) Lights__Bloom's retime-wrap
              pins f4–f23 all to t=0 (bloom Threshold=100/inert there) so the filter never fires at the
              peak — but GT is a flash-to-white A→B wipe (f14 WHITE 241,255,255, f23 photo B), NOT the
              frozen sepia the stale timemap comment claimed (comment now CORRECTED in-code);
              pureCrossfadeSettleB can't cancel the wrap (B.out 0.534 ≪ endSec 1.27 → black tail needs
              content-persistence). (2) 360°__360°_Bloom's band-crossfade path BYPASSES the filter
              entirely (transition360 "filter inert" premise is WRONG — real params Amount=32/Bright=100
              /Thr→3 at the peak; earlier "t≈1.1 peak" was a wrong span=2.0, true span=0.267s → peak
              f12–13). Fix needs 3 coupled sub-steps (float filter READY + wrap-cancel/B-persist +
              360°-band filter wiring). Full analysis in S4 + glow.ts. tsc clean, gate 0/0 (no pixels
              changed — the filter code was reverted; only the timemap/ROADMAP premise corrections land).
- 2026-07-14g  S7 WIN — Flip page-flip back-face now shows source B (compositor/index.ts). The PAEFlop
              page-flip path drew `flip.front.layer.source` (Transition A → imageA) for BOTH the front
              AND the back page, on a stale note claiming "headless resolves both pages to source A".
              GUI GT (the one truth) refutes that: the flip tail settles on photo B (bluish 91,106,137),
              not A (brown 130,84,56). Fix = bind each page to its OWN drop-zone source (front→A,
              back→B) via `page.layer.source`. Movements__Flip 14.70→**16.50 (+1.80)** — the whole tail
              collapse (f13–f23 were 9.9–15.6, showing brown A; now 13–18, showing blue B) is gone.
              The other PAEFlop user (Concentric) is byte-NEUTRAL (verified by stash-diff: its
              detectPageFlip group never reaches pastEdge with a differing front/back source in the
              rendered range). 0 regressions. Baseline re-frozen. tsc + gate green.
- 2026-07-14f  S6 WIN — SHIPPED the orthographic-fold discriminator (evaluator/index.ts resolveCamera).
              Replicator-free static-camera plane-fold scenes now project ORTHOGRAPHICALLY (distance=∞,
              the same parallel branch camera-less slugs take). Discriminator is a PARSE-TIME factory
              check: `scene.factories` has NO "Replicator"/"Sequence Replicator" node. This is the clean
              binary separator — False only for Color_Planes/Reflection, True for every perspective
              clone/panel/360° slug. CRITICAL BUG AVOIDED: my first attempt scanned the EVALUATED tree
              for `type==='replicator'` layers, but Motion expands a Replicator node into per-instance
              CLONE layers at render (3D_Rectangle's tree = 25 [clone], 0 [replicator]), so the scan
              wrongly force-orthographic'd it → MEASURED −0.56 regression. The factory-description
              presence check fixed it (3D_Rectangle held on perspective). MEASURED WINS: Color_Planes
              11.35→14.61 (+3.26), Reflection 12.71→13.67 (+0.96), 0 regressions. Baseline re-frozen
              14.20→**14.26 dB**. tsc + gate green. (Framing cameras Video_Wall/Clone_Spin use their own
              framed-pose path, unaffected.) S6 section updated to SHIPPED.
- 2026-07-14e  S6 INVESTIGATION (gate 0/0, no pixels shipped) — measured the plane-fold camera model.
              Targeted the biggest engine↔headless gap (Color_Planes: engine 11.3 vs headless 36.7).
              PROVED via a temporary cameraZ probe that Color_Planes (+3.0) and Reflection (+0.91)
              want NEAR-ORTHOGRAPHIC projection (both monotonic-to-∞, the camera-less/AOV≈0 signature),
              but a blanket static-camera→ortho rule REGRESSES 3D_Rectangle (16.59→16.23, needs its
              perspective box). No safe structural discriminator found yet (Z-depth doesn't separate
              them; both have Z-translated content). Also decoded that Color_Planes' AOV rig resolves
              widgetVal=0→31.6° (aspect widget 1999869211 not reaching resolveCamera as ordinal 2) —
              but AOV is NOT the lever, the projection MODEL is. Full finding + candidate discriminator
              ("static cam + no Replicator + only rig-rotated planes → orthographic") recorded in S6.
              SHIPPED: `FCT_XFORM=1` diagnostic in test/_trace_layers.ts (prints z + 3x3 rotation so
              3D folds are visible). Probe reverted, frames re-rendered, gate green (0 regressions).
              Next: find + gate-verify the ortho discriminator (must hold 3D_Rectangle on perspective).
- 2026-07-14d  S1 WIN — factoryID-13 Direction popup index→tag remap (parser/rig.ts). Decoded the
              long-open RIG_DIRECTION question (docs/notes/RIG_DIRECTION_FORENSICS.md "THE OPEN
              QUESTION"): a **factoryID-13** Direction popup stores the selected menu entry's
              DISPLAY INDEX, but FCP feeds the rig that entry's TAG. Push.motr menu tags (display
              order) = [0,3,1,2]; stored value=2 = display idx 2 = "Top to Bottom" → tag 1 →
              snapshot Value==1 → rig ordinal 1 = the vertical-UP push the GUI GT renders. The
              engine was feeding the raw value 2 → ordinal 2 = the DOWN push (source A slid down
              instead of up; headless/GUI GT both push A up, B in from bottom). Root proven by
              forced-index probe: ALL rigs at ordinal 1 → Push 12.3→17.4 flat every frame (the
              mid-transition dip vanished); ordinals 0/2/3 all ≤12.5. Fix = `resolveMenuEntryTag`
              maps the popup display index through the menu <entry tag=…> list, scoped to
              factoryID 13 ONLY. Identity no-op for every menu with natural-order tags (Reflection,
              Color_Planes, all 360°/Blur/Scale/Flip/Swing directional slugs). factoryID-12 (Switch/
              Scale/Flip) EXCLUDED — its stored value is already the tag; routing Switch (tags
              [1,2], stored 1) through the remap regressed it 11.7→10.1, so the fID-13 gate keeps
              Switch byte-identical. **Full 65-slug gate: 1 improvement (Push 12.41→17.59, +5.18),
              0 regressions.** Baseline re-frozen 14.12→**14.20 dB**. tsc + no-hardcode green.
              This is a real per-input FCP-fidelity fix: it corrects the Direction semantics for
              the ENTIRE factoryID-13 rig family across ALL direction values (not just Push's
              value=2), so any future factoryID-13 template with a reordered menu resolves correctly.
- 2026-07-14c  INVESTIGATION (gate 0/0, no pixels changed) — mined the remaining head/tail anomalies
              in the low-mid band and PROVED three dead-ends with measurements so future ticks stop
              re-chasing them:
              (1) **Clone_Spin f23 wrap-to-A is a NO-OP** (not a settle-on-B win). Its retime-wrap
              fires only at the very last frame (wrapSec 1.869 / endSec 1.969, ratio 0.949; f23
              remaps to 0) and GT f23 = photo B — looked exactly like the earlier Multi-flip/Zoom
              settle-on-B wins. But MEASURED: rendering f23 as settled-B (renderAt endSec·0.999) vs
              the frame-0 wrap gives the IDENTICAL PSNR (9.71 both), because Clone_Spin is dominated
              by the S6 framing-camera bug (camera pose never populates; the 9 "Timeline Pin" clone
              tiles at Z=-842..-1192 project wrong regardless of which source they hold). Widening the
              pureCrossfadeSettleB gate to Clone_Spin's 11-wrap-zone case would also risk Video_Wall
              (whose wrap fires EARLY at ratio 0.367 = a real loop, not a tail settle). Not worth it.
              Clone_Spin/Video_Wall/Combo_Spin(spatial detail) are pure S6 (framing-camera), do LAST.
              (2) **Single-masked-reveal A/B "fix" REGRESSES** (reverted). Wipes/Mask + Center_Reveal
              both render photo-B at f00–f01 where GT shows photo-A (the unmasked base "Transition A"
              node is bound to source transitionB via the document-order override). Tried binding by
              MASK ROLE (unmasked base→A, masked reveal→B) — it fixes f00 but REGRESSED both slugs
              (Wipes/Mask 14.14→12.55, Center_Reveal 11.99→11.65): the swapped binding is correct for
              the BODY of the transition (the mask reveals the base's opposite source), so the small
              f00 head error is the right tradeoff. The old "keep pure document order" note stands;
              it was NOT stale. Reverted, re-rendered, gate green.
              (3) **Combo_Spin / Multi tail declines are NOT isolated** — Combo_Spin's tail color
              matches GT (settles to B ≈92,107,137); its dB decline is spinning-tile spatial detail
              (S6). Multi's f20–21 black dip → f23 B reveal is 3D-fold crossfade choreography, not a
              time-authority bug.
              CONCLUSION: the clean isolated-collapse vein (3 wins over prior ticks: no-op-curve
              endSec, flat-stack momentary-flat, retime settle-on-B) is now EXHAUSTED at the top of
              the low-slug list. The remaining deficit is genuine subsystem work — S6 framing-camera
              (Video_Wall 9.1, Clone_Spin 10.3), S2 whole-chain linear composite (highest ceiling),
              S3 particle sim, and the Movements 3D-fold choreography residuals. Next tick should
              commit to one multi-tick subsystem (S6 or S2), not hunt for more one-frame fixes.


- 2026-07-14b  S7 WIN — flat-coplanar-stack momentary-flat guard (compositor/geometry.ts). Decoded
              that Movements/Pinwheel (f00) and Replicator-Clones/Concentric (f00–f01) render blue
              photo-B instead of the brown photo-A the GT starts on — an isolated HEAD glitch (both
              had f00 ≈ 10 dB while every other slug starts ~18 dB). Root cause: isFlatCoplanarStack
              decides clone-group draw order from the INSTANTANEOUS world matrix — a coplanar stack
              (m2/m6/m8/m9 ≈ 0) renders FORWARD (last-listed on top = the Switch "flat 2D stack"
              rule). Pinwheel/Concentric are 3D FOLDS whose tiles rotate about X/Y over time, but at
              t=0 every fold angle is exactly 0 → sinθ = 0 → the matrix looks coplanar → the group is
              misclassified as a flat stack for the FIRST frame(s) and flips to forward order, landing
              the source-B clone on top. Fix: reject a flat-stack classification when the group's OWN
              transform (Concentric: each per-tile "…copy" GROUP carries a Rotation.Y curve reaching
              π) OR any content-child subtree (Pinwheel: an invisible "square_fix" fold image sibling
              carries a Rotation.X/Y curve reaching π) has an ANIMATED X/Y-rotation CURVE — a 3D fold
              that WILL tilt out of plane. Curve-based, so it holds at every instant including t=0.
              Switch has no X/Y-rotation curve anywhere → stays a flat stack (unchanged). Full 65-slug
              gate: **2 improvements, 0 regressions** — Pinwheel 12.92→13.27 (+0.35), Concentric
              11.50→12.61 (+1.11). Baseline re-frozen 14.10→**14.12 dB**. tsc + no-hardcode green.
              Commit 901bb1d.


              Movements/Multi-flip freezes on static photo B from f16–f23 (tail collapse 21→7 dB)
              because animationEndSec is set to 1.568s by a NO-OP curve: "Transition B" Rotation.Z
              runs 0.0→0.0003 rad (a ~0.017° non-motion) with a stray keyframe at 1.568s, PAST the
              authored scene duration (1.167s). The real card-flip (Clone Layer Rotation.X/Y, value
              range 4.6/2.4) ends at 1.034s. The inflated 1.568s window compressed the multi-flip
              into f0–15 then held B for the tail, while GT keeps flipping (photo A returns f16–21,
              B settles only at f22–23). FIX: a curve whose keyframe VALUES never change (value-range
              < 1e-3) may extend the animation window only UP TO the scene duration, never past it —
              a value that doesn't move has no motion to bound. Same class as the existing Retime/
              Preview/Snapshot exclusions but keyed on the curve's own value delta. Census (all 65):
              fires on EXACTLY Multi-flip + Black_Hole (both have a zero-range curve keyed past their
              duration; Black_Hole's "Transition A" Scale.X/Y/Z hold constant with a key at 0.968s vs
              dur 0.667s). Real animating curves are never capped, so the many legitimate "animates
              past nominal duration" slugs (Arrows, Duplicate, Curtains, etc.) are untouched. Full
              65-slug gate: **2 improvements, 0 regressions** — Multi-flip 12.36→15.66 (+3.3),
              Black_Hole 13.93→14.53 (+0.6). Baseline re-frozen 14.04→**14.10 dB**. tsc + no-hardcode
              policy green. Commit b502442.


              (loop back to source A once the outgoing drop zone times out) is WRONG for a plain A→B
              crossfade whose Transition B drop zone stays alive to the animation end: the current
              GUI GT tail holds photo B, not A (Blurs/Zoom f23 ≈ (92,106,137)=B while wrap-to-0
              rendered brown A ≈ (131,85,56); the in-code comment claiming "GT past the timeout is
              byte-identical to frame 0" was stale). Added a structural wrap-CANCEL case
              `pureCrossfadeSettleB`: the ONLY wrapping (extrap=1) zones are the two drop zones
              (transitionA+transitionB), no accent/overlay media, AND B.out ≥ endSec−1frame. Then the
              identity remap lets the crossfade run to completion and hold B (tops out at
              progress·endSec < endSec = the settled-B instant). Rejected two global variants first
              (hold-wrapSec and hold-endSec each REGRESSED Loop/Static/Heart/Bloom/Smear — those loop
              or have overlays that keep animating, so their frame-0 wrap is correct). Full 65-slug
              gate: **3 improvements, 0 regressions** — Blurs/Zoom 13.75→15.47 (+1.72), Movements/
              Flashback 16.87→19.59 (+2.72), Movements/Flip 13.54→14.70 (+1.16). Baseline re-frozen
              13.95→**14.04 dB**. tsc + no-hardcode policy green. Commit de6b37c.

- 2026-07-13l  S7 Panels_Across DIAGNOSED (no fix shipped; gate 0/0). Its f09–f11 dip (5.2/6.1/7.7 dB)
              is a GUI-GT near-uniform WHITE FLASH peaking at f09 then fading, which the engine misses
              (renders a left→right whiteness ramp; left frame-half stays tan). Decoded the "White
              panels" group: 7 white 278px strips, STATIC per-panel Fill Opacity 0.05→1.0 (no anim
              curve), each with a different Position-X keyframe count fanning to rest positions that
              tile the frame (-833..+833) — but each rests at a DIFFERENT scene time (R1 ~f6 … R7 ~f17)
              so full tiling completes ~f17, while GT peaks at f09 → GT flash is a TRANSIENT, not the
              late tiling. TESTED+REJECTED the opacity hypothesis (flag FCT_PANEL_OPAQUE forcing fills
              to 1.0 made it WORSE 10.33→9.21, f09 unchanged) → the bug is GEOMETRIC coverage, not
              fill alpha. Mechanism (wider panels / more panels / separate flash element) unresolved;
              a wrong guess regresses, so recorded the full decode for a future focused effort.
              TEMPLATE-RETIME GAP (2026-07-14, the actionable root cause): the panels ALSO have an
              animated LAYER Opacity (id=202) keyed to fade 1→0 at LOCAL time -2.37..-2.07s, but the
              engine's single `curveTime = timeSec - offset` (offset 3.67s → curveTime range
              -3.67..-2.87 for scene 0..0.80) NEVER reaches those opacity keyframes, so the panels
              never fade. The position curves (local -3.67..-2.97) and the opacity curves (-2.37..
              -2.07) live in DIFFERENT local sub-ranges that a single offset shift cannot reconcile —
              they require the template's full RETIME (playRange duration 1.668s mapped into the
              ~0.80s transition). The engine shifts but does NOT scale local→scene time for shapes.
              NEXT: model the template playRange→transition retime for offset-authored shape panels
              (scale, not just shift, curveTime) so both the sweep AND the opacity fade land in-window
              — carefully, since the current single-offset shift is what makes Rotate/Flash correct
              (gate every slug). This is time-authority work, its own focused chunk.
- 2026-07-13k  T-B3 DEEP RE — FULLY DECODED the Nature/Diagonal early-frame wash + RETIRED the
              "particle population density" hypothesis from 13j. Method: instrumented the compositor
              layer-by-layer (temporary FCT_DBG_TOP / FCT_DBG_CHILD / FCT_DBG_RENDER traces, all
              reverted) and read per-quadrant + per-3×3-cell mean RGB of the GUI GT. FINDINGS (one
              truth = GUI GT):
              (1) The wash is NOT the sprites and NOT the field-texture proxy. With BOTH proxy and
                  sprite-sim disabled, f03 STILL washes to (196,184,179) — the wash is a plain layer
                  render. The culprit is the "Background" SHAPE (id 971105401, fill (227,227,227) +
                  a Levels filter → gray ~168) inside the "Gradient and background" group (id
                  999207202). That group has timing.in = 768768/7680000 = 0.100s (≈f03) and NO
                  opacity fade — it HARD-POPS ON at 100% at f03, painting the whole frame gray.
              (2) GT does NOT show that gray full-frame at f03. GT is a genuine DIAGONAL SPATIAL WIPE
                  from the BOTTOM-LEFT: per-3×3-cell GT means show BL greening first (f06 BL
                  (158,157,131) while top rows still brown ~ (142,94,62)), sweeping up-right (f07 BL
                  (199,229,196), TR still (136,86,52)). The frame MEAN rises because the green AREA
                  grows, NOT because a global opacity ramps — a global-opacity model provably can't
                  fit it (compositing the aggregate pale-green field (183,225,178) at the texOp
                  envelope 0.03→0.31 undershoots f08/f11 by ~30 in G: model 141/147 vs GT 172/183).
              (3) The reveal geometry: the effects root "Transition Diagonal" (332773) is a sibling
                  OVER the "Transition Drop Zones" (987205193, photo A/B). Its first child "Bezier 29"
                  (971936924, factoryID=11 shape) carries an "Emitter" REPLICATOR (factoryID=17) that
                  spawns "Cell copy" ALONG the bezier STROKE ("Angle/Source-Start-Frame Over Stroke",
                  rangeName "Stroke Length") — i.e. the sparkle LEADING EDGE of the diagonal sweep.
                  The "Gaussian Gradient" (971142209) is a RADIAL gradient (Center 0.536,0.462 R=615)
                  with Blend Mode 14 and Fade In/Out=20 — the soft reveal matte, ramping from f05.
                  The hexagon field lives under "Emitters-hard light" (971892355, blend=hardLight)
                  which the evaluator marks OFF the whole transition; the visible particles are the
                  "Emitter-normal" group (987210282, opacity 0→0.857 f08→end).
              CONCLUSION: matching this pair (Wipes__Diagonal + Stylized__Diagonal, both map to the
              SAME Nature/Diagonal .motr, a 3-phase Nature CONTENT clip — the known GT-bug pair) needs
              a SPATIAL diagonal-wipe reveal subsystem (radial-gaussian luma matte gating the whole
              effects group's alpha + bezier-stroke leading-edge emitter), NOT any global
              opacity/count curve. Also decoded + tested a correct-but-partial fix: gating each
              particle cell by its CUMULATIVE ancestor-group opacity (buildCumulativeOpacity tree
              walk) correctly drops the hard-light hexagons (ancestor 0) and fades normal particles
              in from f08 — but it REGRESSES the metric (Diagonal 11.39→11.13, Glide 14.32→14.21)
              because those sprites were partially masking the background wash; REVERTED (gate stays
              0/0 at 8226ae7). The cumulative-opacity gating is the RIGHT primitive but only lands as
              a net win once the spatial reveal matte exists to suppress the background wash. Next
              lever = build the radial-gaussian reveal matte for the effects group (generic: gate the
              effects-root alpha by an in-group luma-matte generator), then re-apply cumulative gating.

- 2026-07-13k  T-B3 FOLLOW-UP #2 — SUPERSEDED the "particle population density" root cause from
              tick 13k(j) with the CORRECT one, via a full layer-tree + per-child-composite decode
              (one truth = GUI GT). NO code shipped (a cumulative-ancestor-opacity gate was built,
              measured, and REVERTED as a net regression; gate stays 0/0 at 8226ae7). FINDINGS:
              (1) The f03 wash is NOT the sprites and NOT the field-texture proxy — proven by
                  disabling BOTH (FCT_NO_PROXY + FCT_SPRITE_SIM=0): f02 stays perfect brown
                  (131,85,56) but f03 still jumps to (196,184,179). Per-top-layer + per-child mean
                  traces isolate it to ONE layer: the "Background" SHAPE (id 971105401, fill
                  (227,227,227) → PAELevels → ~168 gray) inside "Gradient and background" (999207202),
                  which has a hard timing.in = 768768/7680000 = 0.100s (≈f03) at opacity 1.0 and NO
                  fade. My engine composites it FULL-FRAME at f03; the whole effects group washes gray.
              (2) The particle sprites ARE mis-gated too (independent bug): cells live under
                  intermediate GROUPS that carry the real fade envelope — "Emitter-normal" (987210282,
                  off until f08 then 0.05→0.86) and "Emitters-hard light" (971892355, OFF entire
                  transition, blend=hardLight). The Emitter LAYERS + cells all evaluate opacity 1.0
                  in isolation, so gating on them alone draws ~200 pre-rolled sprites from f03. Built
                  buildCumulativeOpacity() (product of ancestor-group opacities, generic tree walk)
                  and gated each cell by it — CORRECT (hexagons never draw, normal particles fade in
                  from f08) but it REGRESSED the metric (Diagonal 11.39→11.13, Glide 14.32→14.21)
                  because those sprites were partially COMPENSATING for the background wash. Reverted.
              (3) THE REAL MECHANISM is a DIAGONAL SPATIAL WIPE, not any global fade. 3×3 quadrant
                  means of the GUI GT: f06 bottom-left greens (158,157,131) while top-right stays
                  brown (152,102,67); f07 BL fully green (199,229,196) sweeping up-right; f08 BL
                  (196,229,193) vs TR (153,105,69). The effects field (gray Background + hard-light
                  green particle field) is REVEALED along a BL→TR diagonal. Verified a global-opacity
                  model can't fit: compositing the field aggregate at texOp (max 0.30) undershoots
                  f08/f11 badly (model 141/147 vs GT 172/183) — the frame mean rises because more
                  AREA turns green, each region near-fully green, not because a global alpha ramps.
              (4) Reveal geometry decoded: root "Transition Diagonal" (332773) child order (top-first)
                  = [Bezier 29 (971936924, factoryID=11 shape) → "Emitter" replicator (factoryID=17)
                  → "Cell copy" spawning ALONG the bezier stroke ("Angle/Source-Start Over Stroke",
                  rangeName "Stroke Length") = the sparkle LEADING EDGE of the wipe], "Texture
                  opacity", "Emitter-normal", "Emitters-hard light" (blend hardLight), "Gradient and
                  background" (radial "Gaussian Gradient " id 971142209: Center (0.536,0.462),
                  Radius 615, Blend Mode 14, Fade In/Out 20 + gray Background). Root's only filter is
                  the green TintFx (R0.302 G0.773 B0.286, Color Space 3) — already detected.
              CONCLUSION / NEXT LEVER: this is a SPATIAL-REVEAL subsystem (bezier-stroke leading-edge
              emitter + radial-gradient/stroke reveal matte gating the whole effects group's alpha +
              hard-light green field + background timing.in), NOT a per-sprite or global-opacity nudge.
              It is a multi-component build; the cumulative-ancestor-opacity primitive (buildCumulative
              Opacity) is a CORRECT sub-piece to reintroduce ONLY once the spatial reveal lands so the
              net is a win. NOTE: Wipes__Diagonal AND Stylized__Diagonal both map to this same
              Stylized/Nature/Diagonal .motr (flagged GT-content-not-a-wipe pair, ~11.1–11.4 dB).

- 2026-07-13j  T-B3 FOLLOW-UP: root-caused the early-frame wash (f03–f06 ≈6.6 dB while GT holds
              pure photo A), NO code change shipped (two curve fixes tested + REVERTED — gate stays
              at the 2026-07-13i baseline, 0/0). DECODED (via a temporary `[field]` proxy trace +
              per-frame mean-RGB reads, one truth = GUI GT):
              (a) the backdrop proxy is NOT the culprit — at f03 its o=0.030 and the tinted texture
                  is (75,193,72), so it contributes ~3% and the composite stays brown (~130,89,58).
              (b) per-sprite alpha is NOT the culprit either — the wash is PARTICLE POPULATION
                  DENSITY: the sim keeps thousands of sprites alive at f03 (cell in-times are
                  NEGATIVE / pre-roll, so streamed=floor((sceneTime−inSec)·birthRate) is already
                  huge), and 500+ overlapping white-hexagon sprites source-over-stack to ≈0.99
                  coverage even at groupFade²-suppressed alpha 0.009 (1−(1−0.009)^500).
              TESTED + REJECTED: (1) real-opacity backdrop envelope on the untinted default — known
              to regress 10.99→10.46. (2) groupFade² sprite gate — helps Diagonal +0.04 (full-res)
              but REGRESSES Glide 14.32→14.21 (gate-res) because Glide's texOp curve differs; a
              single global exponent is a fit, not a decode, so reverted per careful-coder.
              REAL FIX (next, substantial S3 decode): FCP's emitter start/pre-roll semantics + the
              particle-DENSITY ramp — the field is genuinely SPARSE at onset and fills in; the sim's
              pre-roll population must be cut to match (likely: particles born before the group's
              own fade-in are not yet emitted, OR density scales with the group envelope at the
              COUNT level with a per-slug-correct curve derived from each cell's real birthRate/life,
              not a blanket square). Instrument left in place: engine/test/_trace_texop.ts.

- 2026-07-13j  T-B3 FOLLOW-UP — ROOT-CAUSED the f03–f06 early-frame wash (Diagonal stuck ~6.6 dB
              while GT holds pure photo A), and REJECTED two curve-shape fixes against the GUI GT.
              INSTRUMENTED the field proxy (FCT_DBG_FIELD trace) + the texture-opacity curve
              (_trace_texop.ts): at f03 the BACKDROP contributes only 3% (o=0.030, tinted (75,193,72))
              → composites to ~(130,89,58), essentially still brown. So the wash to (194,185,177) is
              NOT the backdrop and NOT per-sprite alpha — it is PARTICLE POPULATION DENSITY. The sim
              streams particles from the cell's (negative, pre-roll) in-time, so THOUSANDS are alive
              at f03; even at groupFade²-suppressed alpha ≈0.009 each, 500+ overlapping sprites stack
              source-over to ~0.99 coverage (1−(1−0.009)^500). No per-particle alpha curve can fix a
              too-dense population. TESTED + REJECTED: (a) real-opacity backdrop envelope alone
              regresses the untinted default (known); (b) groupFade² sprite gate — helped Diagonal
              +0.04 at full-res but REGRESSED Glide 14.32→14.21 at gate-res (its texOp curve differs),
              so a global curve-shape guess is wrong. Reverted to the shipped linear groupFade; gate
              clean (0/0). CONCLUSION: the real lever is the S3 PARTICLE-POPULATION model — decode
              FCP's emitter start / pre-roll semantics (is the cell in-time truly negative? does FCP
              pre-roll the stream or ignite at t=0?) and the density ramp, so the early field is
              genuinely SPARSE (few particles) rather than dense-but-dim. That is the named next step;
              it is a population decode, not a constant nudge. No engine change committed this tick
              (revert = shipped state); this is a decode/"do-not-ship-a-regressing-guess" record.

- 2026-07-13i  T-B3 SPRITE SUBSYSTEM SHIPPED as a NET WIN — flag flipped ON by default (rule 9:
              a whole working subsystem verified to improve the target metric, 0 regressions).
              Decoded and landed the two calibration constants + the sprite-onset gate that the
              prior tick flagged:
              (1) TINT MODEL — the particle-group TintFx is FCP's HARD-LIGHT two-leg shader
                  (tintPixelHardLight, transcribed verbatim from Filters.bundle HgcTint), NOT the
                  luma·color multiply. For the gray field texture (152)+Diagonal green it yields
                  (111,208,108) and, crucially, leaves WHITE hexagon-sprite highlights near-white
                  (sel=0 leg→1) so the massed field reads PALE green — matching GT. Applied to BOTH
                  the field-proxy backdrop and the sprite blit. f12 mean (52,134,50)→(144,213,142)
                  vs GT (183,229,181); mid-frames f10–f19 jumped ~5.7→12–13.7 dB.
              (2) BACKDROP ENVELOPE — the tinted backdrop now uses the texture layer's OWN evaluated
                  Opacity (decoded test/_trace_texop.ts: op≈0 through f02, 0.03→0.31 f03–f11, ~0.31
                  plateau, decays) instead of the synthetic bell. Gated behind `tint` present so the
                  untinted default path keeps the byte-identical bell (the real-opacity envelope
                  REGRESSES the untinted gray 10.99→10.46 — verified).
              (3) SPRITE-ONSET GATE — the whole particle GROUP shares a fade-in (FCP holds pure
                  source A, then fades texture+sprites in together). Emitter opacity is a flat 1.0
                  (no fade), so I gate sprite alpha by groupFade = clamp(texOpacity/0.31, 0..1). This
                  recovered f00–f02 to a perfect 18.08 (pure photo A held) — the missing piece that
                  turned flag-ON from 10.24 (regress) into 11.39 (win).
              RESULT (one truth, GUI GT, gate-res): Stylized/Wipes Diagonal 11.09→11.39 (+0.30 each),
              Glide 13.68→14.32 (+0.64); Close_and_Open / Up-Over / Earthquake FLAT (no field texture
              → my changes don't touch them); Drop_In −0.08 (sub-tol). Full gate: 0 regressions,
              1 gate-registered improvement. Baseline re-frozen 13.93→13.95 dB. tsc clean, no-hardcode
              policy OK (7 detectors). Flag inverted: FCT_SPRITE_SIM=0 forces the old flat-dot path.
              Also FIXED a toolkit bug: `./fct.sh regress|score|gate|cmp|probe|census|montage|read`
              now re-exec under the venv python (were crashing ModuleNotFoundError: numpy via the
              system-python3 wrapper). New committed diagnostics: engine/test/_trace_field.ts (texture
              window/mean/tint), _trace_texop.ts (texture opacity curve), _trace_emop.ts (emitter
              opacity/frame), _trace_blend.ts (emitter/tint/blend tree). Files: fct/cli.py,
              fct/baseline_engine.json, engine/src/compositor/{index,field-texture,emitter-sim}.ts.
              NEXT: f03–f07 green onset is still slightly steep vs GT (6.6–7.7 dB) — refine the
              onset curve; then decode Glide's own tint (0.13/0.82/0.07) coverage.


- 2026-07-13h  T-B3 SPRITE SUBSYSTEM built end-to-end (rule 9 — a real subsystem, not a stub).
              emitter-sim.ts: resolveSprite() loads each cell's Particle Source PNG via the
              mediaResolver (Diagonal hexagon_white.png = 256×256 w/ alpha, cached per source id);
              drawSprite() is a bilinear-sampled, scaled+rotated+tinted+alpha quad blit — replacing
              the flat 2px dots. Per particle: size = nativePNG · sourceLayerScale · cellScale ·
              (1±scaleRandomness); rotation = spin(rad/s)·elapsed; over-life = trapezoid fade
              (15% in / 15% out); tint = cell colour (colorMode==1) folded with the particle-group
              ancestor TintFx. field-texture.ts: detectParticleGroupTint() finds the TintFx on the
              nearest ancestor group that contains an emitter (Diagonal green 0.30/0.77/0.29) and
              applyParticleFieldProxy() now tints the texture backdrop by it. VERIFIED (GUI GT, one
              truth): the render now shows the CORRECT STRUCTURE — green hexagons drifting over a
              green field — vs the old monochrome gray dots. HONEST STATUS: with the subsystem live
              it currently REGRESSES 10.99→8.74 because two constants aren't decoded yet: (1) the
              TintFx Color-Space=3 blend makes GT's green PALE (f12 (183,225,178)) but luma·color
              over-darkens to (52,134,50); (2) the field/green envelope fires too early (proxy bell
              starts f02; GT stays pure brown photo through f05, greens f06→f11). Per the gate, a
              regression must NOT ship, so the sprite path is GATED behind FCT_SPRITE_SIM=1 (default
              OFF → byte-identical to baseline, gate 0 regressions / 0 improvements, tsc clean). This
              is rule-9(b): an explicitly-labelled intermediate step of a subsystem being finished
              NEXT tick (decode the two constants, flip the flag ON, verify Diagonal improves,
              ungate). T-B3 → DOING. Files: engine/src/compositor/emitter-sim.ts,
              engine/src/compositor/field-texture.ts, engine/src/compositor/index.ts.
- 2026-07-13h  T-B3 REAL sprite emitter renderer BUILT (subsystem, not a stub) — flag-gated OFF
              pending 2 calibration decodes. Replaced the flat 2px-dot particle render with a real
              textured-quad sprite blit: resolveSprite() loads the cell's Particle Source PNG via
              the mediaResolver (Diagonal hexagon_white.png 256²) + the source layer's own scale/
              opacity; drawSprite() composites each particle scaled (native×source-scale×cell-scale
              ×scale-randomness ≈145px), rotated by spin·elapsed, faded over life (15% in/out
              trapezoid), tinted by the cell colour AND the particle-group ancestor TintFx
              (detectParticleGroupTint finds the green RGB(0.30,0.77,0.29) on the group wrapping the
              emitters); applyParticleFieldProxy now also tints its texture backdrop by that group
              tint. GUI-GT VERIFIED the render is now STRUCTURALLY correct — green hexagons drifting
              over a green field (was a gray paper wash + invisible white dots). BUT it currently
              REGRESSES PSNR (Diagonal 10.99→8.74) for two decoded-but-uncalibrated reasons, so it
              is GATED behind FCT_SPRITE_SIM=1 (default OFF = byte-identical, full gate 0 regressions,
              tsc clean): (1) TINT MAGNITUDE — Motion TintFx (Color Space id=11=3) yields a PALE green
              (GT f12 mean≈(183,225,178)); the luma·color model over-darkens to ≈(52,134,50) — need
              the Color-Space=3 blend decoded, not plain luma·tint. (2) FIELD ENVELOPE TIMING — GT
              stays pure brown photo through f05 then greens f06→f11 and holds; the proxy bell starts
              at progress≈0.088 (f02), far too early — need the real green-onset envelope (texture
              opacity curve, not a symmetric bell). NEXT TICK: decode both, flip the default ON, and
              verify Diagonal (and the other emitter slugs Glide/Close_and_Open/Up-Over) improve on
              GT. This is rule-9(b): a labelled intermediate step of a subsystem being finished — the
              renderer is real, verified-to-render code, not inert scaffolding.
- 2026-07-13g  S1 driver scope SETTLED via census (Rule-8 premise check, doc-only, no code
              change). (1) COLOUR-CHANNEL LINK verified DONE + firing: the parser→computeColorLinks→
              Colorize-override pipeline RESOLVES on the real slugs — Panels_Across 21 raw colour
              Links → 3 Colorize Remap-Black/White + 1 shapeFill all firing at the correct red RGB
              (0.74,0.07,0.14); Heart/Loop use gradientTag Links → the gradientStops bucket (read
              only by the deferred T-A1 gradient rasteriser). (2) MOTION PATH DROPPED as a standalone
              S1 driver (mirrors T-A3 Gravity): it gates 0 directly-rendered layers — walked every
              Motion Path behaviour to its parent factory across the corpus; Slide_In's 8 are ALL on
              Replicator Cells (→ S3 particle sim) and Center_Reveal's 16 are ALL on Generators (→ S5
              gradient). Standalone impl would be dead code. (3) GUI-GT proved the remaining
              Panels_Across/Slide_In gap is TIMING/CHOREOGRAPHY not colour: GT f09 Panels_Across is
              fully wiped-white while engine is mid-wipe; GT f12 Slide_In is full teal slid-in while
              engine is still 100% photo A — that wipe timing is S7 + the S3 replicator sim. Also
              found Slide_In's 6 colour Links are on Replicator Cells (S3), so the layer parser
              correctly surfaces 0 of them. S1 header → DONE (drivers settled); low slugs move via
              S3/S7. Gate: unchanged (doc-only). Next top-down item: S2 (linear compositing) or S3
              (replicator sim, which now also owns Slide_In's Motion Path + colour Links).
- 2026-07-13f  BLOOM pipeline FULLY DECODED + implemented + REVERTED (net-negative, two timing
              blockers). Completed the -[PAEBloom bloomHeliumRender:…] @0xe58a register trace: three
              GPU nodes — HgcBloomThreshold extract rgb=max(color·10 − Threshold/10, 0); Gaussian
              blur; HgcEchoScaleAndAdd ADDITIVE combine out = orig + blur·(Brightness/50) clamped to
              (Clip to White ? 1 : ∞). Built a decode-faithful bloomFilter (correct in isolation:
              mean-luma 97→255 at peak). REVERTED per the gate rule — net-negative in the render due
              to TWO transition-timing blockers, not a filter-math error: (A) buildTimeMap wraps
              Lights__Bloom to time 0 at 0.20s, BEFORE the Bloom/Glow keyframes at 0.36→0.59s, so
              Threshold stays pinned at 100 → the extract knocks out everything → ZERO bloom (the
              filter is dormant, hence gate-neutral on Lights__Bloom). GT REFUTES the wrap (f06 past
              0.20s is already blown-out, not frame-0). (B) cancelling the wrap makes bloom FIRE but
              exposes a BLACK tail — Transition A(out 0.20s)+B(in 0.234,out 0.534s) BOTH time out by
              0.534s → frames f11+ have no drop zone → black. GT holds the bloom peak (~f14 white)
              then reveals CLEAN B by f23 (a flash-to-white A→B wipe), so the content must PERSIST
              (hold B) while the FILTER time plays through — a clamp on CONTENT time decoupled from
              FILTER time. Also blast radius is 2 (360°__360°_Bloom stores pluginName="Bloom", not
              "PAEBloom" — earlier grep missed it) and the 8-bit-blur HEADROOM proxy distorted the >1
              energy (360° Bloom regressed 11.47→10.48). Recorded the full decode + both blockers in
              glow.ts (comment-only, gate-neutral, tsc clean). NEXT (multi-step): float-buffer blur
              (no 8-bit proxy) + content-persist/clamp decoupled from filter-time + gate-verify BOTH
              Bloom slugs. No pixels changed this tick.
- 2026-07-13e  BLOOM under-bloom ROOT-CAUSE (isolated filter bug, blast radius 1, decode-in-progress).
              Diagnosed Lights__Bloom (10.44) via GUI GT: PEAK frames f11-18 should blow the frame to
              WHITE (GT f14 ~full white) but the engine renders the near-UNBLOOMED sepia photo (f14 ~3
              dB). Root cause is a FILTER bug (NOT S2 linear compositing): glowFilter's Bloom path drops
              the Brightness gain (maps Brightness=100 -> combine gain 1.0 via /100), so the extracted
              highlight layer is never amplified — measured glowFilter input mean-luma 97.3 -> output
              97.3 (zero brightening at ANY threshold); the additive combine has nothing bright to add
              and just replaces the image with a blurred copy of itself. Corrected the S4 ROADMAP claim
              ("filters correct in isolation" — Bloom is NOT). Found the real dispatch
              -[PAEBloom bloomHeliumRender:...:withRadius:withBrightness:withThreshold:doDarkBloom:
              withXScale:withYScale:withDoCrop:withDoClip:is360:] @0xe58a (all distinct inputs; TS also
              ignores Clip-to-White=1, doDarkBloom, X/Y scale). Decoded constants: d11@0x268c48=0.01
              (H/V->XScale /100), radius x4.0, threshold pack ±10 range + -2.25 bias. Recorded precise
              P2-bloom notes in glow.ts (comment-only, gate-neutral, tsc clean). NEXT: complete the
              bloomHeliumRender register trace (Brightness->RGB scale, Threshold->bias, Clip-to-White
              ceiling), decode-don't-fit, then fix glowFilter's Bloom path and gate-verify (+3-6 dB
              potential, only affects Lights__Bloom). No pixels changed this tick.
- 2026-07-13d  S2 LINEAR-COMPOSITE re-confirmation (measurement, no code shipped). Empirically
              tested flipping the existing LINEAR_COMPOSITE_ENABLED flag ON (consumers: HSV +
              Channel-Mixer filters only): Color_Planes 11.35→11.26 (WORSE), Center 11.76→11.76
              (unchanged) → reverted, tree clean, gate green. This RE-VALIDATES that the per-filter
              linear encode is a DEAD END (matches the original "per-filter regressed the stacked
              GT" finding); the fix MUST be the whole-chain engine-level pass (Float32 linear buffer
              through every blit/blend/composite, one encode at output). Updated S2 next-step to say
              so + flagged that Lower/Center/Panels_Across are the WRONG first target (their deficits
              are dominated by mask-reveal breakage + wipe-timing, NOT linear dimness — verified via
              GT vs engine frame compares: Center f23 renders a broken white panel over blank instead
              of full B; Panels_Across f12 left third still shows A + dim gray panels). The clean
              first linear target is a single semi-transparent overlay blend, not a choreography scene.
              Also re-confirmed Loop's write-on source is elusive: arc/shape/Loop1 clips are all
              "Missing Is Still=1" (single-still placeholders, not sequences) and the "Gradient" vector
              shape's First/Last Point Offset carry NO keyframes — so the visible stroke write-on is an
              FCP-internal procedural draw not reconstructable from a static PNG; reinforces that the
              Loop reveal-timing is a dedicated multi-step RE item. NEXT: build the S2 whole-chain
              linear composite pass (biggest lever) as a dedicated multi-tick effort, gate-green flag
              OFF first, then flip+measure on a clean single-blend overlay slug.
- 2026-07-13c  LOOP REVEAL — full GT-verified RE + MEASURED decomposition (docs/notes/
              STYLIZED_LOOP_HEART_REVEAL_RE.md refined). Killed two wrong hypotheses: the "growing
              teardrop" is NOT a scaling matte (shape/Group/Ornament all Scale=1.0 the whole
              transition) and NOT a sprite sequence (shape.png is a single static near-FULL-FRAME
              teardrop, opaque bbox 1618×913 = 68% of canvas; no numbered frames in Media/). The
              reveal = static full-frame teardrop matte × an UNCOVER front (arc/Bezier ornament
              Retime write-on) × a B-over-A cross-fade that begins ONLY AFTER the grey stroke
              outline CLOSES (~f8 — GT-verified: f8 shows a complete eye outline with the WHOLE
              frame still sepia A, zero B), then a CLAMP tail holding completed B. Built + measured
              the full combined change (media-from-wrap exclusion + media-mask clamp + opacity-ramp
              cross-fade), then REVERTED per the gate rule (net −0.64: 12.82→12.18). Per-frame decomp
              isolates the exact missing piece: CLAMP tail is a clean +3 dB win in isolation (f16-23
              9.9→13.0) but the early frames LOSE −6 dB (f3-8 11.0 vs 17) because B reveals ~4 frames
              too early — neither the mask-source Opacity ramp (fade f0→f6) nor the "shape" Retime
              progress (linear from f0) delays B to f8; the B fill is gated on STROKE-WRITE-ON
              COMPLETION (~f8), which is the unresolved core. NEXT (dedicated multi-step): RE the
              arc/Bezier write-on front → gate the B cross-fade on write-on completion → keep the
              clamp tail → net-positive, gate-verified frame-by-frame. Gate untouched (all code
              reverted; Loop back to 12.82). tsc clean.
- 2026-07-13  STYLIZED/LOOP+HEART STALLED-REVEAL RE (Rule-8 decode corrects the T-A1 premise).
              Full root-cause decode written to docs/notes/STYLIZED_LOOP_HEART_REVEAL_RE.md.
              The gradient-tag renderer is NOT the Loop/Heart lever — GT proves the deficit is a
              STALLED B-REVEAL: the engine renders a STATIC Transition A for the whole transition
              (Loop f4-f23 ~9.9 dB frozen-A). THREE stacked bugs found: (1) DOMINANT — buildTimeMap's
              retime-wrap is driven by a decorative ORNAMENT media layer ("arc" out=0.60s) instead of
              the A/B drop zones, collapsing everything past 0.6s to frame 0 so B never reveals;
              (2) resolveImageMaskAlpha's media branch used luma×alpha = 0 EVERYWHERE for shape.png's
              alpha-defined teardrop matte (inside luma0×a1, outside luma255×a0); (3) mask-source shape
              collection gated on el.visible excludes DISABLED mask geometry. Reveal mechanism decoded:
              Transition B is clipped by an Image Mask whose Mask Source is the disabled image "shape"
              (Media/shape.png teardrop), NOT a vector wipe and NOT the gradient swoosh. LANDED
              (gate-neutral, RE-correct prerequisites): fixes (2)+(3) in compositor/masks.ts — media-mask
              ALPHA-vs-luma channel decision + disabled-mask-geometry admit. DEFERRED: fix (1) wrap
              (exclude bundled media from wrap-min) — it is CORRECT but reveals B TOO EARLY without a
              progressive stroke-then-fill reveal-timing model + completed-B CLAMP tail, so alone it
              regresses Loop 12.82->11.09 (GT f6 = thin arc STROKE, engine = B already filled). Reverted
              per the gate rule; must land WITH the timing model. Gate 0/0, tsc clean, no-hardcode green.
              NEXT: build the progressive reveal-timing (teardrop matte gated by the shape's Retime
              -11..94 / arc stroke write-on) + clamp-to-completed-B tail, verified frame-by-frame vs GT
              (f0 none -> mid arc-stroke -> fill -> held-B), then re-enable the media-from-wrap exclusion.
- 2026-07-13  T-A1 RENDERER STEP 2 (gradientTag detect + stop-override resolve). Completed the
              gradient-tag DATA PIPELINE (de070ba): (1) types.ts colorTarget gains 'gradientTag'
              kind + tagId; (2) parseColorTarget structurally matches .../104/1/<tagId>/3/{1,2,3}
              and returns {kind,tagId} (was a bare string — caller updated) so these links are no
              longer dropped; (3) color-links.ts gains a gradientStops bucket (ownerLayerId→tagId→
              0-1 RGB) that walkColorLinks fills. VERIFIED end-to-end on Heart.motr: 6 gradientTag
              links → gradientStops resolves owner 845044017 (the "Gradient" shape) tags 845044020/
              845044022 to driven colours at t=0.5. ADDITIVE + behavior-neutral (compositor doesn't
              read gradientStops yet). Gate 0 regressions/0 improvements (byte-identical). Also
              diagnosed Heart's deficit is CONCENTRATED (f06-09 + f16-23 at ~10dB, rest ~15-18) —
              a missing mid/late reveal element, consistent with the unrendered gradient shape, so
              the rasteriser payoff is real. NEXT (step 3, the big one): compositor GRADIENT-FILL
              RASTERISER — render Shape.fillGradient (2-stop linear ramp, type/direction from the
              Gradient param) with gradientStops overrides applied, behind the existing shape-branch
              guard so solid-fill rendering is untouched; verify Loop/Heart/Slide_In, gate green.
- 2026-07-13  T-A1 RENDERER STEP 1 (gradient stop-list parse) + BASELINE RE-FREEZE. With the
              swarm fully drained (no agents holding types.ts/parser/compositor), started building
              the documented T-A1 gradient-tag renderer. Confirmed the real gap first: the compositor
              shape branch renders ONLY flat fillColor/override — it has NO gradient-fill path, and
              the parser deliberately EXCLUDES gradient-mode shapes (so Heart/Loop's gradient shapes
              don't render at all today). So the renderer is a multi-step build. Step 1 (this tick,
              66f8629): parse the shape-fill gradient STOP LIST onto Shape.fillGradient — Style→Fill→
              Gradient(104)→RGB folder(1)→stops (each tagId + location + 0..1 RGB). Additive +
              behavior-neutral (nothing consumes it yet). Verified vs Heart.motr: extracts 'Circle'
              (red→blue placeholder) + 'Gradient' (cream→olive, the colour-Link-driven one, tags
              845044020/845044022) — decode confirmed end-to-end. Gate 0 regressions. THEN, since the
              re-render surfaced the long-pending stale-baseline gains (T-G1 +0.88, T-E1 +0.36),
              re-froze the engine baseline 13.914→13.93 (f8d4d6d) — gains now PROTECTED, regress
              clean 0/0. Resolved the "BASELINE RE-FREEZE PENDING" note. NEXT: step 2 (parseColorTarget
              gradientTag kind) + step 3-5 (evaluator stop-override + compositor GRADIENT RASTERISER —
              the big new piece) + verify Loop/Heart/Slide_In.
- 2026-07-13  SWARM DRAINED + roadmap-sync BLOCKED-bug FIX + T-A1 premise VERIFIED. The pool
              exited (0 eligible): all 16 tasks are terminal except T-A1 (PARTIAL). T-E2 landed
              BLOCKED (5f0c2e9: Video_Wall's black frame is an S6 framing-camera POSE bug —
              resolveFramedWallPose fits the dolly to a SINGLE tile bbox, not the 8000-unit wall
              extent, so tiles project ±43000px off-screen; + timeMap wraps all frames to t=0). Found
              & fixed a roadmap-sync bug: it reused pool.done_task_ids() (which counts BLOCKED/NOOP
              commits as "done"), so a "T-E2 BLOCKED" commit wrongly flipped its row TODO->DONE,
              erasing the ceiling signal. Fixed: _done_only_ids() scans ONLY "T-X DONE" subjects;
              reconcile upgrades ONLY TODO/DOING (BLOCKED+PARTIAL are deliberate, left alone).
              Reverted T-E2 marker to BLOCKED. (a7029b1). Then, with the swarm drained and NO agents
              holding types.ts/parser (the collision that blocked T-A1 for many ticks is GONE),
              VERIFIED the gradient-tag renderer premise against Loop.motr ground truth: real link
              affectingChannel="./2/353/113/104/1/845136461/3/3" = Style(353)/Fill(113)/Gradient(104)/
              RGB-folder(1)/stop(845136461)/Color(3)/Blue(3) — decode CONFIRMED (the 353 is Style, NOT
              Colorize; census correctly shows some links drive BOTH a Colorize ./1|./2 remap AND a
              gradient ./…/104 stop via separate channelBehaviors). T-A1 gradient-tag renderer is now
              UNBLOCKED + premise-verified; build it next tick (6-step plan in the RE note). done=13,
              +T-A1 PARTIAL, 2 BLOCKED ceilings (T-E2 S6-pose, T-F1 Smear-timing), 2 DROPPED.
- 2026-07-13  T-E2 BLOCKED (S6 · clone-tile wall render, on top of the harness-pollution fix below).
              Prior-tick's HARNESS-POLLUTION log correctly identified the parsePinIndex compositor
              add as "the right clone-tile fix" (Pin 1→imageA, Pin 2→imageB). Kept. This tick
              INSTRUMENTED the remaining PSNR gap: baseline 9.06 (post-T-E1) → GT fills the frame
              throughout, engine renders bottom 100% black + top 22% dark with a CONSTANT per-frame
              pattern. Root cause is the SAME S6 framing-camera pose bug T-E1's log flagged as a
              follow-up ("Framing-anchor projection itself STILL diverges ~350px from A — deeper OZ
              computeFraming decode needed").
              Decode: at t=0 (100% "framer" proxy) resolveFramedWallPose computes eye
              (2490,-1589,1190), focal=1304 (AOV=45°), dolly range near=1317→far=2341 — near/far
              BOTH derive from Transition B's single-tile bbox (halfV=540, halfMax=960) at
              framing.ts:259-262, so the whole dolly spans ONE TILE. Wall extends world
              (-2000..+6000)X × (-2400..+6000)Y ≈ 8000+ units — a fit needs dist ~10000+. Result:
              Replicator Pin 1's 3×3 tiles at origin project to screen (sx,sy) up to (-43295,56289)
              — massively off the 1920×1080 frame. Also: timeMap wraps ALL frames ≥ 0.367s back to
              t=0 because Transition A's retime-1 curve times out at 0.367s (shortest wins
              min-wrapSec).
              Tried (all rejected as regressions or no-ops):
                • Extend T-E1's off-canvas override to Transition B (dropZone.type∈{1,2}): B not
                  actually retime-ramped, no delta.
                • Treat replicator scenenodes as always-visible (<timing> is Sequence-Replicator
                  internal band, not clip lifetime): all 14 become vis=true in trace but framing
                  projection still lands them off-screen — no delta.
                • Skip wall-placed drop zones in timemap wrapSec-min: removes the t=0 freeze but
                  UNMASKS the misprojection — tiles animate through wrong positions and score
                  regresses 9.06→8.29. Reverted.
                • Swap proxy/content near-far assignment (farDist + (near-far)*f): 8.56, worse.
                  Direction was correct; magnitudes are the issue.
              Full fix needs the "far" distance in resolveFramedWallPose (framing.ts:255-262) to
              fit the FULL WALL bbox (all Replicators' world positions + per-instance grid
              extents), not just the content-behavior target tile's own bbox. Requires OZ_FRAMING_
              DEBUG on native FCP to record eye/target/distance at every GUI-GT frame, then
              replay. Marked T-E2 BLOCKED so the pool stops assigning it; this is a focused
              sequential S6 item, not a swarm task. Gate: 0 regressions / 0 improvements
              (Video_Wall 9.06 unchanged from prior tick's parsePinIndex; no other slugs touched).
- 2026-07-13  HARNESS-POLLUTION FEEDBACK-LOOP FIX — caught a landmine in T-E2's worktree: it
              carried a diff DELETING the salvage-RESTORE block from fct/swarm/setup_worktree.sh
              (the agent was even actively editing it, mtime fresher than its task file). Root cause:
              salvage did `git add -A`, capturing harness files that leaked into task worktrees; with
              salvage-RESTORE, a stale patch reverting a harness file gets salvaged→restored→re-reverted
              — a feedback loop that would have re-landed the reflect-agent regression a 3rd time if
              T-E2 committed. Fix: (1) reset setup_worktree.sh in T-E2's worktree to origin (kept its
              real clone-tile work); (2) scope salvage to non-harness paths (git add -A -- . :(exclude)
              fct/swarm/*) so harness state lives ONLY on origin/main (80da4cf). VERIFIED T-E2 is doing
              EXCELLENT targeted work: decoded Video_Wall's "Pin N" Type-3 drop-zone convention (Pin 1→A,
              Pin 2→B) to route the 14 wall tiles to real photos instead of gray placeholders — exactly
              the right clone-tile fix. T-E2 healthy post-reset (wt_quiet 4m, clean diff). DECISION:
              leaving reflectloop DOWN — it keeps dying after dispatching, its agents have CAUSED
              regressions (1d7af7e), and with only 1 pool task left it has ~nothing to optimize; not
              worth more debug time. done=13/16, T-E2 in-flight and productive.
- 2026-07-13  T-F1 (Smear) PULLED FROM POOL — the liveness-gated wedge-reaper (prev tick) worked
              exactly right: it stopped false-reaping T-E2 (which is genuinely progressing, editing
              engine/src) but CORRECTLY reaped T-F1 whose worktree AND log were both frozen 20m. That
              exposed the truth: T-F1 hangs on EVERY run — all 6 runs' logs are exactly 203 bytes
              (startup banner only), the CC agent freezes for 20m, gets reaped+restored+relaunched,
              and repeats. Not a false-wedge, not a filter gap (scrape.ts/PAEScrape-Smear is probe-
              verified vs isolated headless FCP). The 11-dB deficit is a TRANSITION timing problem
              (smear tail continues past the drop-zone timeout; content vanishes at 0.467s; clamp
              tried→worse). Marked T-F1 BLOCKED (a45918f) so the pool stops wasting a slot; saved its
              WIP patch; killed the stuck session. Pool now correctly runs ONLY T-E2 (eligible=[T-E2],
              slot 1 empty, no relaunch). Net: swarm converged to 1 productive agent, 0 churn.
              done=13/16; remaining = T-A1 (PARTIAL, gradient-tag renderer documented), T-E2 (in-flight),
              T-F1 (BLOCKED ceiling — needs focused drop-zone RE alongside S2 linear-composite).
- 2026-07-13  WEDGE-REAP FALSE-POSITIVE FIX — root-caused why T-F1/T-E2 never finished. The
              wedge-reaper (_slot_stalled, from swarm-reflect 1d7af7e) declared a slot wedged on
              "log quiet >=15m + no SWARM_RESULT" alone. But Claude Code -p BUFFERS stdout: a
              hard-working agent's log sits at the 203-byte startup banner for many minutes while
              it burns CPU + edits files. So the reaper was a FALSE-POSITIVE machine, killing
              PRODUCTIVE agents every 20m — T-F1 wedged 2x, ran 74m+20m+20m across relaunches, 0
              results. Verified live: T-F1/T-E2 sat at exactly 203B logs (the wedge signature) while
              113 claude procs burned 205% CPU. Fix (cf51989): gate the reap on a BUFFERING-IMMUNE
              signal — minutes since the agent's worktree SOURCE tree (engine/src|test, docs) was
              last written. Reap only when BOTH log AND worktree are quiet >=15m (the true "claude -p
              silent + MCP orphans hold the pipe" hang freezes both). Rejected CPU-by-pgid first
              (Claude Code re-parents workers out of the pane pgid → reads ~0 when busy); deleted
              that dead helper. Restarted pool (salvage-RESTORE preserved both agents' work byte-
              identical across the restart — verified). done=13/16; T-F1/T-E2 now run un-churned.
- 2026-07-13  CENSUS COLOUR-LINK SUB-KIND + RE VALIDATION — established the harness needs NO
              further pool restart (running pool has wedge-reap; setup_worktree salvage-RESTORE is
              a script read fresh each launch → already active), so left T-F1/T-E2 to run
              UNINTERRUPTED (my frequent restarts had been resetting T-F1: 5 relaunches, never a
              SWARM_RESULT — it is churn-victim, not a landing bug). Did isolated, no-collision work:
              enhanced `fct census` _classify_channel to report the colour-Link target SUB-KIND
              (COLOUR:gradientTag / colorizeRemap / shapeFill) by path shape. This VALIDATES the
              gradient-tag RE against real .motr data — census now shows Loop+Heart colour-Links
              resolving to COLOUR:gradientTag(+colorizeRemap), confirming the decode in
              docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md is correct and telling you which renderer
              path each link needs. Fixed the summary flag to startswith('COLOUR'); verified no
              regression (Panels_Across colorizeRemap/shapeFill intact, Color_Planes stays
              6-transform/0-COLOUR). census is a pure decode tool (not on the engine render path) →
              no gate impact. Commit 50891b7. State: 13/16 DONE, T-F1(Smear)+T-E2(clone-tile) in-
              flight; T-A1 renderer documented+validated, buildable once those free types.ts.
- 2026-07-13  SALVAGE-RESTORE REGRESSION FIX — while integrating this tick's gradient-tag RE
              doc, discovered the swarm-reflect commit 1d7af7e (reap wedged slots) had branched
              from a STALE base and, on landing, silently REVERTED my earlier salvage-RESTORE block
              in setup_worktree.sh (+ the orphan-sweep/MAX_SLOTS in pool.py). Consequence: a pool
              restart relaunched T-F1 (60m/14 files) + T-E2 without restoring their salvaged work.
              RE-added salvage-RESTORE (git apply --3way of the latest patch onto the fresh worktree,
              hard-reset-to-pristine on failure), marked so it isn't reverted again (9eb51bc). Kept
              the reflect agent's genuinely-useful wedge-reap (_slot_stalled + _kill_slot_pg, which
              reaps the "claude -p silent + MCP orphans hold the stdout pipe open so tee never hits
              EOF" case). Did NOT restore the orphan-sweep (only needed when restarting at a smaller
              size; we are steady at 5). Restarted pool (stable, wedge-reap loaded). T-B3 landed
              (42ab49a: emitter appearance) → emitter chain B1→B2→B3 complete, done=13/16. Only
              T-F1 (Smear) + T-E2 (clone-tile wall) remain in-flight; T-A1 PARTIAL collision-blocked.
- 2026-07-13  SWARM WEDGE-REAP TICK — at 04:07 all 3 pool slots were simultaneously WEDGED (T-B3
              30m, T-F1 60m, T-E2 22m) with 3-line logs and no SWARM_RESULT. Root cause: `claude
              -p` went silent while its ~30 MCP fast_mux orphans kept the runner's stdout pipe FDs
              open, so `tee` couldn't hit EOF and the runner never fell through to `echo
              SWARM_SLOT_EXIT`. tmux session stayed "alive", pool considered slot active → burnt
              forever. Fix: pool.py grew `_slot_stalled` (age ≥20m + log quiet ≥15m + no result)
              and `_kill_slot_pg` (tears down tmux AND SIGTERMs the runner's whole process group,
              reaping MCP orphans that hold pipes open). Also push_helper.sh: added `--filter
              'protect /.git'` after T-B1 harvest died with `rsync error: .git: unlinkat: Directory
              not empty` (see pool.log ~02:41 — T-B1 work was salvaged via patch, then re-derived).
              And reflect.py surfaces the wedged-log list in metrics so future reflections don't
              have to eyeball ps. Gate: 0 regressions (harness-only). See docs/notes/swarm/
              reflection-2026-07-13-0407.md for the full write-up.
- 2026-07-13  T-A1 GRADIENT-TAG RE TICK — the T-A1 PARTIAL renderer gap (colour Links to
              gradient-tag colour, used by Loop/Heart/Slide_In) was blocked from CODING by a
              file-collision with in-flight agents (T-F1/T-B3 hold types.ts + parser/index.ts).
              So did the Phase-1 work that DOESN'T collide: read-only reverse-engineering. Decoded
              the gradient-tag target path straight from Loop.motr + Heart.motr (FCP binary):
              `.../104/1/<tagId>/3/{1,2,3}` = Gradient param(104) → RGB colour-tags folder(1) →
              a specific STOP scenenode (RGB1 id 845136460, factoryID=3) → Color(3, fac=15) →
              Red/Green/Blue(1/2/3, fac=24), each a 0..1 float curve (range −6..8, NOT 0-255).
              Verified GaussianGradientConfig is the GENERATOR gradient (distinct from these
              shape-fill stops) and that the compositor shape branch renders flat fillColor only
              (no stops) — so a stop-list parse + a gradient rasteriser upgrade are needed. Wrote
              the full decode + a 6-step renderer plan to docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md
              and linked it from the T-A1 row. This makes the renderer buildable in one shot once
              T-F1/T-B3 free those files. Doc-only, no engine/behaviour touched. Swarm unchanged:
              12/16 DONE, T-B3/E2/F1 in-flight (T-F1 63m/14 files deep on Smear).
- 2026-07-13  REFLECTLOOP RESILIENCE TICK — the 30-min reflection meta-loop had been DOWN for
              several ticks (needing manual restart each tick) AND was itself CAUSING OOM churn.
              Root causes + fixes: (1) the python `reflect loop` never crashes (robust try/except)
              but the PROCESS gets OOM-SIGKILLed, ending the python|tee pipeline + killing the tmux
              session → wrapped it in a bash restart-supervisor (`while true; python; sleep 60`) so
              the session self-heals across OOM. (2) dispatch_reflection launches a FULL extra Claude
              Code agent; on a saturated size-5 pool this tipped RAM over and OOM-killed POOL agents
              mid-work → added a vm_stat RAM guard: skip dispatch (retry next cycle) when free+inactive
              < 2500MB, so the meta-optimiser never starves the primary task agents. Verified guard
              (4.8GB free → dispatches; computes worker count). run.sh default SIZE 8→5 to match live
              pool. Swarm state unchanged: 12/16 DONE, T-B3/E2/F1 in-flight (T-F1 53m/13 files deep on
              Smear, T-B3 24m/5 files, T-E2 15m). Harness-only, no engine/headless code touched.
              Commit 278e24c.
- 2026-07-13  GATE-HEALTH + STALE-BASELINE FINDING TICK — with all remaining ROADMAP tasks
              either DONE (12/16) or actively in-flight (T-B3/E2/F1) and T-A1's gradient-tag
              renderer blocked by a hard file-collision (it needs types.ts + parser/behaviors.ts
              + parser/index.ts, all being edited RIGHT NOW by T-F1 and T-B3 — editing them would
              guarantee a merge conflict, violating careful-coder), there was no safe non-colliding
              engine chunk. Did the valuable isolated work instead: ran `fct regress engine` = GREEN
              (0 regressions, 0 improvements, 64s, rc=0) — the ONE-TRUTH gate confirms nothing has
              regressed. BUT discovered the baseline is STALE: it was frozen from Jul-10 engine
              frames that predate landed gains (T-G1 Color_Planes 10.47→11.35, T-E1 Video_Wall
              8.74→~9.1, T-B2 emitter, T-D2* linear [flags OFF]). Deliberately did NOT re-freeze
              mid-swarm (would starve the 3 active agents of cores + miss improvements they may
              still land this session). Documented a standing "BASELINE RE-FREEZE PENDING" note in
              the status snapshot: once the swarm drains, `fct gen engine --all` + `fct baseline
              engine` captures all gains at once. Confirmed T-A1 PARTIAL gap precisely: colour Links
              to gradient-tag colour (`.../353/113/104/1/<tagId>/3/{1,2,3}`, used by Loop/Heart/
              Slide_In) are parsed-but-not-rendered; parseColorTarget needs a 'gradientTag' kind.
              Doc-only tick, no code/behavior touched.
- 2026-07-13  ROADMAP-DRIFT TOOLING TICK — the ROADMAP flat task table kept drifting from
              reality: T-A2, T-D2a, T-D2c all sat as TODO on origin/main long after their DONE
              commits landed (agents edit the row separately from the commit, and concurrent
              rebases / other agents' ROADMAP edits clobber the marker). Harmless to the scheduler
              (pool.done_task_ids ALSO scans the commit log) but the ROADMAP was lying to humans +
              agents. Built `fct roadmap-sync` (fct/roadmap_sym.py + cli wiring): flips TODO/DOING/
              BLOCKED -> DONE ONLY when the authoritative done set (same commit-log scan the pool
              uses) proves it; monotonic, never un-marks, never touches PARTIAL/DROPPED, preserves
              column alignment. Ran it: reconciled T-A2/D2a/D2c -> DONE, 0 remaining drift. This
              tick also observed T-E1 land (7272d30: retime-ramp cancel for off-canvas wall Transition
              A, Video_Wall 8.7->9.1) + T-B2 land (eefb0ec: emitter sim+render) -> done = 12, T-E1's
              landing UNBLOCKS T-E2 (where the stashed cell-DZ patch belongs). In-flight: T-B3, T-F1,
              T-E2 (auto-eligible). Toolkit-only change, no engine/headless behavior touched.
- 2026-07-13  T-E1 (S6 · Framing wall) DONE — the actual root cause of Video_Wall's
              f4-black wasn't the framing anchor's proxy->content ray (that anchor
              (2400,-2144) is only ~350px off Transition A's authored (2051,-2390)).
              It was the Retime static-position heuristic (resolveWithRetime) ramping
              A's static POSITION from origin toward its wall coord over frames 1..11
              (retime spans 1->13), making A wobble ORIGIN<->WALL every non-endpoint
              frame. Under the framing camera that wobble drove A off-frame (f4
              projected A to (-2162, 1531) — completely off-canvas -> BLACK), even
              though A's authored position is truly static. Fix: mark position as
              __overrideChannels for a REAL Transition A drop zone (dropZone.type===1,
              1920x1080 A/B card) whose static authored pos is off-canvas in BOTH
              axes (|x|>1920 AND |y|>1080) — a "wall-cell" placement that shouldn't
              retime-ramp. Scope excludes: Clone_Spin's 9 SQUARE Type=0 "Timeline
              Pin" 1920x1920 tiles (also source A, but their ramp IS the slide-in),
              and Clothesline's A at (-1342, 540) (single-axis side-slide that DOES
              want the ramp). Video_Wall 8.7->9.1 (+0.36; f4 8.36->10.08). Gate: 0
              regressions / 1 improvement (2 total: T-G1's Color_Planes +0.88 is
              carry-over from origin/main). Clone_Spin unchanged (10.28 -> 10.28).
              No new capability detectors -> no-hardcode test unaffected. Framing-
              anchor projection itself STILL diverges ~350px from A (deeper OZ
              computeFraming decode needed for that) — left as follow-up in S6.
- 2026-07-13  T-B3 DONE (S3 · Emitter appearance — per-cell colour/scale +
              opacity-over-life envelope, PARTIAL/NEUTRAL, gate 0 reg).
              CENSUS-VERIFIED FIRST: 3 of 4 ROADMAP-listed targets are NOT
              emitter scenes — Stylized/Close_and_Open has 107 Replicator
              +107 Replicator Cell +107 Shape nodes and ZERO Emitter/Particle
              Cell nodes (the roadmap's "109 emitters" for Close_and_Open
              miscounted Shape+Replicator+Cell); Stylized/Up-Over is 44
              Replicators +44 Cells with ZERO emitters; Stylized/Center has
              41 Shapes +5 Clone Layers with ZERO emitters. Only Glide (15
              emitters/15 cells) and Diagonal ×2 (15/37 each) among the
              listed targets are true emitter scenes; the drifting bokeh in
              Close_and_Open/Up-Over/Center is a Replicator-driven pattern
              that a future T-B* row would need to gate (out-of-scope for
              T-B3 which is definitionally emitter-appearance).
              Ships APPEARANCE INFRASTRUCTURE on top of T-B2's spawn+advect
              backbone: (1) extends ParticleCellParams with `color`
              (Object/id=130 R/G/B/Opacity), `colorMode` (id=129 enum: 0
              Original / 1 Colorize / 3 Over Life), `cellScale` (id=116
              X/Y) — census-verified against Diagonal hexagon cell
              (RGBA=0.483,0.482,0.484,1; ColorMode=3; Scale=0.5/0.5),
              Hexagon 1 (0.999,0.960,0.956,1; ColorMode=1; 0.75/0.75), Bar
              (0.05/0.05 scale → sub-pixel), Ring 1 (green 0.41,0.76,0.36);
              (2) parser/emitter.ts reads them with the same numeric-or-
              default convention as the existing schema (readSubStatic
              walks direct children of the Color / Scale folders so nested
              gradient stops at other depths don't pollute the read); (3)
              compositor/emitter-sim.ts consumes: per-particle colour is
              scaled from cell.color (fallback near-white 240 for the
              handful of cells that omit the folder, e.g. Diagonal
              circle_particle), per-particle alpha is baseAlpha (0.10) ×
              cell.color.a × opacityOverLife(elapsed/life), per-dot radius
              is BASE_RADIUS (2px) × mean(cellScale.x, cellScale.y) clamped
              to [0.5, 8]. Opacity envelope is a linear 10%-fade-in / hold /
              25%-fade-out — approximates Motion's default id=112 Opacity
              Over Life ramp shape without decoding the gradient stops.
              Determinism preserved (same emitterSeed+cellSeed+index →
              same dot).
              PSNR (all target slugs, engine vs GUI GT, gate res):
              Stylized__Diagonal 10.99 (baseline 11.09; delta -0.10 within
              0.30 tol), Wipes__Diagonal 10.99 (11.09 -0.10), Stylized__
              Glide 13.54 (13.68 -0.14), Stylized__Close_and_Open 10.87
              (10.95 -0.08 — non-emitter scene, delta is JPEG-encode noise
              not the sim), Stylized__Up-Over 11.71 (11.75 -0.04
              non-emitter), Stylized__Center 11.76 (11.81 -0.05
              non-emitter). All within tol; the emitter targets are byte-
              similar to T-B2's contribution (frame-level cmp between old
              and new Diagonal f12 shows 69.22 dB PSNR / mean abs diff 0.004
              — per-cell colour/scale/envelope DID change the composited
              pixels, but the T-B2 dot alpha × radius contribution is small
              enough that per-cell colouring doesn't yet clear the noise
              floor at aggregate PSNR). Gate: 0 regressions across all 65
              slugs; 1 improvement (Movements__Color_Planes 10.47→11.35, a
              carry-over from T-G1's earlier landing that hadn't been
              re-baselined — NOT caused by this change).
              NEXT VISIBLE LEVER (not this row): render each particle as
              its Particle Source SPRITE (a bundled shape/image tile), not
              a flat dot — Diagonal cells reference sprite ids 971894859
              (hexagon), Ring cells reference full geometry, Glide's
              circle_particle references media 970697767. That's a sizeable
              new module: sprite raster + per-particle spin + composite
              blend. This T-B3 landing is the schema + colour + envelope
              infrastructure that sprite rendering will consume.
              Tests: emitter-parser (21/21 pass, +3: hexagon/Hexagon 1
              colour+scale+mode assertions, "most cells >=90% have color"
              proving the schema is canonical without demanding it on
              every cell); emitter-sim (15/15 pass, +5: envelope shape at
              4 age fractions, "per-cell colour paints below-240 pixels
              on Diagonal" proving the colour path fires); no-hardcode 7/7
              (hasSimulatableEmitter still fires on 4 built-ins: Diagonal,
              Glide, Drop In, Earthquake); parser 12/12; behaviors 23/23;
              tsc clean.
              Unblocks: T-B4/T-B5 if/when someone wants per-cell sprite
              rendering (colour+scale schema and alpha envelope are ready).
- 2026-07-13  T-B2 DONE (S3 · Emitter SIM+render MINIMAL — spawn/advect/gravity
              /composite flat-COLOUR dots, gate 0/0). Ships
              engine/src/compositor/emitter-sim.ts: deterministic
              per-particle simulation off the T-B1 EmitterParams/
              ParticleCellParams schema, composited as flat-COLOUR
              dots (r=2, near-white 240 @ 0.10 alpha) on top of the
              existing field-texture proxy. Sim runs from
              cell.timing.in (Motion pre-runs emitters at NEGATIVE
              in, e.g. Diagonal hexagon cell in=-4.838s, so at scene
              t=0 a stream of already-airborne particles blankets
              the frame). Analytical per-particle solve:
              birthTime_i = inSec + i/birthRate; elapsed = t −
              birthTime_i; dir_i = angle ± range/2 seeded by
              splitmix64(emitterSeed, cellSeed, i) → uniform in the
              emission arc; pos_i = emitterWorld + (cos(dir),
              −sin(dir))·speed·elapsed + (0, ½·g·elapsed²). Motion
              +Y-UP canvas convention (Emission Angle +90° = up on
              canvas) → velocity in Y-DOWN world is (cos, −sin), so
              Diagonal's angle 5.198 rad places its stream on the
              expected upper-left→lower-right diagonal.
              VISIBILITY GATE: sim runs ONLY for cells whose parent
              Emitter LAYER is visible in the evaluator (rig
              suppression of the 7 non-selected shape variants
              zeros their opacity → visible=false → skipped). For
              Diagonal this scopes 37 parsed cells → 6 sim'd
              (default rig picks Shape=0 hexagon variant: Emitter-
              hexagon + Emitter-white + Emitter-hexagons children).
              MAX 4000 particles/frame (safety bound; Diagonal
              typical ≈ 1500).
              WIRED: composite() in compositor/index.ts calls
              applyEmitterSim AFTER applyParticleFieldProxy so the
              dots overlay on top of the existing aggregate gray
              blend (T-B3 will replace both with per-cell colour/
              scale/opacity-over-life ramps). EvaluatedScene
              extended with emitters/particleCells map refs
              (copied from MotrScene at evaluate() time — no eval
              cost).
              NEUTRALITY: hasSimulatableEmitter (structural probe:
              ≥1 emitter with ≥1 cell that would contribute) fires
              on 4 built-ins (Diagonal, Glide, Drop In, Earthquake)
              and returns false on the other 61, so non-emitter
              transitions are byte-identical to pre-T-B2.
              Registered in test/no-hardcode.test.ts (6→7
              detectors, all ≥ 2 fires: OK).
              Diagonal ×2 scores: Wipes__Diagonal 11.09→10.99 (-0.10,
              within 0.30 dB tolerance — the sim's flat-white
              @ 0.10 alpha is intentionally subtle; PSNR movement
              lands with T-B3's per-cell colour ramps). Gate:
              0 regressions across all 65 slugs, 1 improvement
              (Movements__Color_Planes 10.47→11.35 from T-G1's
              earlier landing that hadn't re-baselined — not caused
              by this change; every non-emitter slug is
              byte-identical to pre-T-B2). Tests: new emitter-sim.
              test.ts (10/10 pass: probe on 4 emitter slugs +
              Push absence, determinism at composite() and sim
              level, Push byte-neutrality after applyEmitterSim,
              rig-suppressed cells skipped, time-dependent particle
              set). Also green: emitter-parser 18/18, behaviors
              23/23, parser 12/12, no-hardcode 7/7. tsc clean.
              Unblocks T-B3 (appearance-over-life colour/scale/
              opacity ramps consumed off this same schema).
- 2026-07-13  T-B1 DONE (S3 · Emitter+Cell param PARSER, PARSE-ONLY, gate 0/0)
              — added typed `EmitterParams` / `ParticleCellParams` /
              `GravityBehavior` schemas + `engine/src/parser/emitter.ts`
              lifting the Motion Emitter/Cell Object folder into them from
              canonical param ids (Emitter/Object: 310 emissionAngle, 358
              emissionLongitude, 311 emissionRange, 303 emitAtPoints, 349
              emitterSeed, 356 3D, 357 faceCamera, 307 radius; Cell/Object:
              101 birthRate, 102 birthRateRandomness, 103 initialNumber,
              104 life, 105 lifeRandomness, 106 speed, 107 speedRandomness,
              110 spin, 111 spinRandomness, 128 particleSource, 131 seed;
              Gravity behavior: 401 acceleration static-or-curve default 30,
              300 affectSubobjects). Verified by XML dump on Movements/Drop_In
              (fid 19/14 — every cell carries Gravity default=30, static),
              Movements/Earthquake (fid 19/14 — Life=0.4s, Speed=2409, an
              animated 5-keypoint Acceleration curve 0→−75.7→−100→−200→0),
              and Stylized/Diagonal (fid 23/15 — Emitter emissionAngle
              5.198 rad, emissionRange 2.008 rad; hexagon cell birthRate 30
              / life 10s / speed 350 / spin 0.873 rad-s / particleSourceId
              971894859). Wired via parser/index.ts into the returned Layer
              (layer.emitter / layer.particleCell) + into MotrScene as flat
              lookup maps (scene.emitters / scene.particleCells, undefined
              on non-particle scenes so consumers can early-out); cells get
              their `emitterId` back-reference stamped by a post-parse walk
              of the layer tree. Gravity behaviour is folded onto the cell
              (owns gravity after T-A3 dropped — census 2026-07-13 proved
              every built-in Gravity sits on a Particle Cell, never a layer).
              PARSE-ONLY: nothing evaluator/compositor-side reads the new
              fields yet, so render pixels are byte-identical (`fct regress
              engine` 0 regressions / 0 improvements vs baseline, 35.45s).
              Tests: new `engine/test/emitter-parser.test.ts` (18/18 pass)
              covers all three census slugs + the empty-scene contract
              (Push.motr → emitters/particleCells absent, not empty). Also
              green: parser.test.ts (12/12), behaviors.test.ts (23/23),
              no-hardcode.test.ts (6/6 detectors ≥ 2 built-ins). This unblocks
              T-B2 (minimal emitter SIM: spawn + advect + gravity + composite)
              and T-B3 (appearance-over-life ramps), both of which now have a
              typed input schema to consume.
- 2026-07-13  SWARM THROUGHPUT TICK — added "reap LIVE sessions that already reported
              SWARM_RESULT". Agents on the old brief finish + print a terminal SWARM_RESULT
              (usually BLOCKED, since macOS TCC blocks their in-worktree git push) but Claude
              Code's -p mode LINGERS, holding the slot indefinitely (T-A1 96m, T-F1 95m). The
              pool only harvested on OS session EXIT, which never came. Now each cycle, a LIVE
              slot whose current log already has "SWARM_RESULT <id>" is harvested (lands gate-green
              work via push_helper, no-op otherwise) then killed+refilled. Restarted the pool with
              the fix (0 errors, looping clean). Progress: T-D2d landed (HSV->linear); done now
              {A3,C1,D1,D2b,D2d,G1} = 6 tasks. 7 agents on all remaining eligible work; slot 2
              idle waiting on deps (T-B2/B3/E2 gated on T-B1/T-E1). Commit 8dc3c36.
- 2026-07-13  T-D2d (S2/S4 · HSV→linear) DONE — added a LINEAR-working-space
              branch to `hueSaturationFilter`
              (engine/src/compositor/filters/hue-saturation.ts) behind
              `isLinearCompositeEnabled()` (T-D1's flag, DEFAULTS OFF so gate
              stays byte-identical — 0 regressions / 0 improvements vs
              baseline_engine). The linear path decodes input sRGB codes via
              LUT_SRGB_TO_LINEAR, runs the HgcHSVAdjust math (RGB→HSV normalize,
              Hue rotation, Rec.709-luma Saturation lerp, squared-multiply
              Value) on LINEAR RGB, and encodes via linearChannelToSrgb at
              emission — matching the FCP shader's ExtendedLinearSRGB working
              space (decoded 2026-07-12 in linear.ts header; oz_render.mm
              OZ_WS_DEBUG confirms). Mix (unused in shipping — PAEHSVAdjust
              has no Mix slot) also lerps in LINEAR when the flag is on, for
              consistency with the working-space model. Target slugs (census-
              verified via `fct census`): Stylized__Color_Panels is the real
              target (PAEHSVAdjust ×4 + PAEColorize ×4 + Clone Layer ×4);
              Stylized__Panels_Random has ZERO HSV filters (Colorize ×3 only)
              so this task cannot move it — folds into T-D2a's scope. Post-
              migration scores (flag OFF, intentionally identical to pre-change):
              Color_Panels 15.12, Panels_Random 12.99, Color_Planes 11.35 — all
              equal to baseline. Unit tests: hue-saturation 13/13 (+5 for T-D2d:
              flag default, linear-mode identity, linear V=0.5 physically-correct
              midtone [sRGB 188 → 99 in linear vs 47 in legacy], linear grayscale
              = encode(luma709 of linear RGB), flag-off byte-identical after
              toggle); linear 15/15; no-hardcode 6/6; tsc clean. Progress: T-D2d
              landed; done={A3,C1,D1,D2b,D2d,G1}.
- 2026-07-13  SWARM DATA-SAFETY TICK — fixed a work-DESTROYING bug + broadened harvest. T-B1's
              completed, gate-green emitter-parser work was WIPED when the pool relaunched it:
              setup_worktree.sh did `git worktree remove --force` on the uncommitted worktree
              (reflog "reset: moving to HEAD"). FIX 1: setup_worktree.sh now saves any uncommitted
              changes to ~/fct-swarm/salvage/<id>.<stamp>.patch BEFORE removing (already caught a
              reflect-worktree patch). FIX 2: harvest_exited_slot scans ALL of a task's logs (not
              just the current run) and harvests on DONE *or* a BLOCKED result that asserts
              complete+gate-green (push_helper re-gates + refuses red, so it can't regress).
              Removed a dead stub. Complements reflect's own 60cdb45 (T-id regex + read ROADMAP
              from origin/main) — the reflection loop independently caught the same relaunch-waste
              class. Progress: T-D2b landed; done={A3,C1,D1,D2b,G1}; 8 slots on distinct work.
              Commits 967066a (+ reflect 60cdb45).
- 2026-07-13  T-D2b (S2/S4 · Tint→linear) DONE — added a LINEAR-working-space
              branch to `tintFilter` (engine/src/compositor/filters/channel-mixer.ts)
              behind `isLinearCompositeEnabled()` (T-D1's flag, DEFAULTS OFF so
              gate stays byte-identical — 0 regressions / 0 improvements). The
              linear path decodes input sRGB codes via LUT_SRGB_TO_LINEAR,
              decodes the sRGB-authored target colour ONCE via srgbChannelToLinear,
              computes luma601 on LINEAR-light values (not sRGB codes), runs the
              intensity+mix lerps in linear, then encodes back to sRGB — a
              per-filter decode/encode matching FCP's kCGColorSpaceExtendedLinearSRGB
              working-space semantics (decoded 2026-07-12 in oz_render.mm) for a
              single filter. The CEILING (one Float32 linear buffer chained across
              ALL filters, encoded ONCE at compositor exit) is reached only after
              all four T-D2* land and the outer compositor threads the buffer.
              Census before code: the 4 real Tint users are Objects__Leaves
              (PAETint x2), Stylized__Diagonal / Wipes__Diagonal / Stylized__Glide
              (TintFx x1 each — all particle-emitter-dominated). "Veil" in the
              task row is a Colorize user (PAEColorize x1) not a Tint user, so
              it belongs to T-D2a; rendered here as a byte-identity spot-check
              (Objects__Veil 16.04 unchanged). FLAG-ON PROBE via FCT_LINEAR=1
              (scratch env hook in _fct_render.ts, since removed): Leaves
              16.56→16.63 (+0.07, real but sub-tol), Diagonal / Glide /
              Wipes__Diagonal all 0.00 change (the emitters swamp the single
              TintFx contribution — those slugs' tails are owned by S3/T-B2/B3,
              not S4). Ships infrastructure only; the default flag flip happens
              after all four T-D2 families migrate (T-D1's contract). Files:
              channel-mixer.ts (+63 -4 for tintFilter linear branch + registry
              wiring), NEW engine/test/tint.test.ts (9/9 pass: sRGB path byte-
              identical to legacy formula, linear path matches decode/apply/encode
              expectation, intensity=0 identity, mix=0 identity, sRGB-vs-linear
              divergence on saturated inputs, registered filter respects flag
              under try/finally). Gate 0 reg / 0 imp; no-hardcode 6/6 green;
              tsc clean. Unblocks the eventual whole-chain flag flip.
- 2026-07-13  SWARM REFLECT TICK — three fixes complementing the reap/harvest work: (a) pool.py
              completion regex now accepts `T-<id>:` at commit-subject start (T-G1 committed as
              `T-G1: Color_Planes 3D fold — driver offset shift...` with no DONE keyword; the old
              regex missed it → wasted NOCHANGE relaunch in log T-G1.013622). (b) parse_tasks reads
              ROADMAP.md from origin/main via `git show` so a fresh DONE row is visible on the very
              next scheduler cycle regardless of MAIN's working-tree freshness. (c) push_helper.sh
              rewritten to rsync the worktree state into the /tmp clone instead of `git add -A` +
              `git diff --cached` — the sandbox silently denies `.git/worktrees/<id>/index.lock`
              writes, so the old capture returned an empty diff and push_helper reported "nothing
              to push" while real work sat uncommitted (harvest_exited_slot depends on push_helper,
              so this fix multiplies the value of 1e57d17). Also added a "zeroth-step" grep check
              to agent_brief.md so an agent launched onto an already-DONE task exits in ~1s
              instead of running full census (six T-A3 relaunches on 2026-07-13 each spent
              ~1-5min re-confirming the same DROPPED verdict). Gate 0 reg / 0 imp (harness-only).
- 2026-07-13  T-A1 (colour-channel Link, PARTIAL/NEUTRAL) — landed the colour-Link
              INFRASTRUCTURE end-to-end (parser -> evaluator -> Colorize filter + Shape
              fill) but the census-verified target slugs stay at 0.00 dB delta because
              the downstream renderers a colour Link needs are ABSENT for every
              built-in colour-Link user in the wild.
              Decode (fct census, verified in-code): 4 slugs are true colour-Link
              users. Panels_Across has 7 colour Links (3 Colorize Remap-Black/White
              pairs on "Cross 1/2/3" + 1 Shape-Fill on "Red bar") all sourced from
              the hidden enabled=0 "Color linker" shape whose static Fill Color is
              (0.737, 0.070, 0.141). Slide_In has 6, Loop 8, Heart 6 — all targeting
              GRADIENT COLOR TAGS on a Gradient shape (affectingChannel path
              `.../353/113/104/1/<tagId>/3/{1,2,3}`). Sources decoded from
              `./2/353/113/111/{1,2,3}` (Object > Shape > Style > Fill Color > R/G/B)
              via expressionChannels.
              Implementation: extended LinkBehavior with targetProp='color' + a
              structural `colorTarget` discriminator (colorizeRemapBlack |
              colorizeRemapWhite | shapeFill); parser adds a pre-scan for
              filtersById (needed to classify `./1`/`./2` as Colorize-Remap when
              the affected object is a Colorize filter) and a linkColorSources
              scan (Fill-Color RGB from every scenenode, INCLUDING enabled=0 and
              solid-fill-flag-clear driver shapes — the strict shape-parse gates
              rejected the hidden "Color linker"). New evaluator/color-links.ts
              resolves Link value = clamp(src,min,max)*scale+offset per RGB, folds
              Colorize-Remap overrides into filterOverrides via special
              `__ColorLink.RemapBlack.{Red|Green|Blue}` / `.RemapWhite.*` keys the
              Colorize filter checks, and rides Shape-Fill overrides on
              EvaluatedLayer.fillColorOverride (renderDrawableLayer accepts an
              override even when parseShape's strict solid-fill gate skipped the
              base fillColor). Gradient-tag targets are DETECTED as colour Links
              (source path ends in 111) but SKIPPED (no target renderer yet) so
              they never fall through to the transform-link path (which would
              otherwise decode a colour ref as a POSITION and drive a random
              transform channel with garbage).
              Neutrality: Panels_Across 10.33->10.33, Slide_In 10.18->10.18,
              Loop 12.82->12.82, Heart 13.34->13.34 (full-res). Gate-size:
              10.38/10.25/12.92/13.49 all delta 0.00. Verified neutral on 7
              additional sample slugs (Blurs__Gaussian 18.30/18.30, Objects__
              Curtains 15.10/15.10, Wipes__Mask 14.30/14.30, ...).
              Why 0.00 dB: (a) Panels_Across's Colorize filters apply to "Cross"
              IMAGE layers whose Source Media is `Media/cross.ai` — a vector .ai
              file the engine cannot load (no vector-image support), so the layer
              renders nothing and the Colorize override never touches a pixel.
              (b) Red bar's Shape-Fill override activates (parser produces
              linkColorSource 988593389 -> (188,18,36) and the compositor accepts
              it via the new fillColorOverride path) — frames 20-23 pixel-differ
              from baseline but the change nets to 0.00 dB (a small crimson bar
              at the transition tail). (c) Loop/Heart/Slide_In colour Links target
              GRADIENT color tags — the renderer they need (gradient-tag colour
              override on a Shape's Gradient generator) doesn't exist yet.
              No-hardcode: probes unchanged (still 6 detectors, all fire on >=2).
              Detection is purely path-shape (`111` for source, `./1`/`./2` +
              Colorize filter for target, `./2/353/113/111` for shapeFill) — no
              transition names. Parser structural detection fires on 4 built-ins
              (Panels_Across + Slide_In + Loop + Heart).
              Follow-ups this UNBLOCKS: a vector-image loader (would make
              Panels_Across's Cross Colorize actually paint the accent — likely
              the biggest single win on this slug); a gradient-tag override path
              on the Gradient generator (would light up Loop/Heart/Slide_In's
              colour Links immediately with no more Link work).
- 2026-07-13  SWARM RESILIENCE TICK — two pool fixes so agents' work reliably lands. (1) REAP:
              the pool now kills any live slot whose task is already DONE on origin (T-D1 had been
              redundantly re-run in slot 2 for 25min after it merged); reaping freed slot 2 which
              refilled with T-D2d. (2) HARVEST: agents launched before push_helper build+gate fine
              but can't commit (CC sandbox blocks .git/worktrees/*); on slot exit the pool now
              auto-runs push_helper for any worktree left dirty with a gate-green "SWARM_RESULT
              <id> DONE" (push_helper re-gates in a /tmp clone and refuses to push red, so a bad
              DONE can't regress). Restarted the scheduler with both fixes; all 8 slots now on
              distinct real work (T-A1,A2,B1,D2a-d,F1). Commits e724a48, 1e57d17.
- 2026-07-13  SWARM TICK — landed T-D1 + found & fixed the swarm's #1 blocker. (a) Applied +
              gate-verified T-D1 (linear-compositing infra, flag-OFF, byte-identical, 0 reg),
              which UNBLOCKED T-D2a/b/c/d — the pool auto-fanned them out to free slots. done set
              now {T-A3,T-C1,T-D1,T-G1}. (b) ROOT CAUSE of agents not landing work: Claude Code's
              macOS sandbox DENIES writes to a worktree's shared .git/worktrees/* (SIP/
              com.apple.provenance), so agents couldn't git commit/push in-worktree — capable ones
              improvised /tmp clones (T-G1 landed 4e3c17a that way), others reported BLOCKED.
              Shipped fct/swarm/push_helper.sh: captures the worktree diff -> fresh /tmp clone
              (sandbox-allowed) -> re-gate -> commit -> push w/ rebase-retry; updated the agent
              brief to call it instead of raw git. Commits 2606af4, cf72a11, 6e04220.
- 2026-07-13  T-D1 (S2) DONE — linear working-space compositing INFRASTRUCTURE landed
              behind a flag that defaults OFF. Ships engine/src/compositor/linear.ts:
              sRGB↔linear (IEC 61966-2-1) with 256-entry Float32 decode LUT — matches
              CoreGraphics kCGColorSpaceExtendedLinearSRGB (decoded 2026-07-12 from
              oz_render.mm OZ_WS_DEBUG); whole-image RGBA float ↔ u8 codecs
              (decodeImageToLinear / encodeLinearToImage; alpha kept linear as
              coverage per Extended-Linear-sRGB semantics); physically-correct
              source-over blend in linear light — linearOverlay (ImageData pair)
              and linearOverlayFloat (Float32 pair, so T-D2 can chain multiple ops
              and encode ONCE — the model that avoids the per-filter re-encode drift
              documented in levels.ts + brightness). Flag via {is,set}LinearComposite
              Enabled(); getter is the only supported read so tests can flip it under
              try/finally without touching the shipped OFF default. Unit tests
              (engine/test/linear.test.ts, 15/15 pass) pin: sRGB→linear→sRGB u8-exact
              round-trip; image-level round-trip pixel-exact; 50% grey @ 50%α on black
              lands at the linear midpoint (~sRGB 188, NOT gamma-blended 94); float
              blend matches ImageData blend to ≤1 code; flag defaults OFF. Overlay
              slugs re-rendered + scored: Lower 9.04, Bloom 10.55, 360°_Bloom 11.58,
              Panels_Across 10.38, Veil 16.04 — ALL byte-identical to pre-change (flag
              OFF path proven neutral). Gate 0 regressions / 0 improvements; no-hardcode
              6/6 green; tsc clean. Unblocks T-D2a/b/c/d (Brightness/Colorize, Tint,
              Glow/Bloom, HSV migrations — each opts one filter family into the linear
              chain and gate-verifies).
- 2026-07-13  T-G1 (Color_Planes 3D fold) DONE — Movements/Color_Planes 10.47→11.35 (+0.88 dB),
              f23 (end frame) 8.49→14.21 (+5.72). ROOT CAUSE: the hidden Color Solid driver has
              `timing.offset=-68068/120000=-0.567s` while `in=0`, so its 6-KF Position.Z and
              Rotation.Y curves are authored in the LOCAL frame (KFs at local times 0.567..2.369s).
              At scene time 0..1.802 the correct playback is local = scene + 0.567 (KF1 at scene 0,
              KF6 at scene 1.802s = scene end). The engine's Link source-read went straight to the
              raw curves at scene time (no shift), so the last two KFs (KF5 val 649.95, KF6 val 0)
              never played and Group 2 stayed at Z≈650 at scene end — engine rendered a small
              tilted plane where GT shows the full-frame un-folded B. Same failure on Rotation.Y
              (never reached π=180°, so the fold never completed). FIX: added driverCurveTime() in
              evaluator/links.ts that shifts the driver's read time by its own timing.offset (same
              semantic the evaluator already applies to image/shape drop zones with off != in);
              driverChannelValue and resolveDriverChannel's readRigged now sample the driver's
              curves at local time. Blast radius = 4 driver-source scenenodes with off != in (grep
              across 65 built-ins): Color_Planes' Color Solid (-0.567), Switch's Transition B
              (-0.901, tiny gate-size effect: 11.68→11.64, under 0.30 tol), 360°_Circle_Wipe /
              360°_Wipe (-0.017 each, no-op). Gate 0 regressions / 1 improvement; baseline
              re-frozen (engine mean 13.91→13.93 dB).
- 2026-07-13  SWARM HARDENING (tick) — fixed two harness bugs found watching the live pool:
              (1) git worktrees SHARE .git/info/exclude, so setup_worktree.sh's per-call append
              bloated one file 15x and didn't isolate; moved symlink+scratch patterns to the
              TRACKED .gitignore (engine/node_modules, /venv, .swarm_run.sh, .frames/) that every
              worktree inherits (commit 6d08f41). (2) the pool relaunched T-A3 in a tight loop
              after it finished — the completion regex only matched "swarm <id>:" but the agent
              committed "T-A3 DROPPED:"; regex now matches a task id at subject start in any
              DONE/DROPPED/BLOCKED/NOOP/swarm form (commit 90c9dfe). Restarted the pool scheduler
              with the fix; slot 2 now correctly idle (all 7 non-dep tasks in-flight, T-A3 done).
              First real swarm result also landed: T-A3 DROPPED via decode-first census.
- 2026-07-13  SWARM TICK — kept the pool healthy + fixed 2 harness bugs found by watching it run:
              (1) git worktrees SHARE .git/info/exclude, so setup's per-call append bloated one
              file 15x and didn't isolate; moved symlink/scratch/.frames patterns into the TRACKED
              .gitignore (symlink-safe entries) which every worktree inherits. (2) completion regex
              only matched "swarm <id>:" so the pool relaunched T-A3 five times after it finished
              as "T-A3 DROPPED:"; regex now matches "<id> DONE/DROPPED/BLOCKED:" too. Restarted the
              pool scheduler with the fix; slot 2 now correctly idle (all 7 non-dep tasks in
              flight). First real swarm result landed: T-A3 (Gravity) DROPPED — census proved
              gravity is a Particle-Cell param, not a layer driver (folds into T-B1). 7 agents live.
- 2026-07-13  T-A3 DROPPED (Gravity LAYER driver) — census refuted the premise. `fct census`
              extended to report Gravity behaviours + host scenenode; ran across all built-ins:
              only Movements/Drop_In (3 cells) and Movements/Earthquake (1 cell) have Gravity,
              and every one of the 4 behaviours sits on a Particle Cell (factoryID resolves to
              "Particle Cell", not a layer/group/emitter). Movements/Fall has ZERO behaviours —
              its animation is pure keyframes, no Gravity. "Feeds layer fall" is not a real
              usage; the drop-in "card falling" is a keyframed Position curve. Since Gravity is
              purely a particle-sim parameter and T-B1 ("Emitter+Cell param PARSER") already
              lists "gravity" in its scope, Gravity work is folded there and consumed by T-B2's
              sim. ROADMAP updated: T-A3 row -> DROPPED with the census verdict; S1 heading now
              "Link / Motion Path" (no Gravity), S1's Gravity bullet cites the T-A3 census;
              T-B1 row annotated "owns gravity after T-A3 dropped"; concurrency count updated
              (was 9, now 8). fct/census.py adds `_gravities()` + a "gravity:" print line
              (walks back to the enclosing scenenode to distinguish Cell vs Layer hosts). Gate
              0 regressions (toolkit + doc only, no engine change). Rule 8 saved a tick.
- 2026-07-13  SHIPPED the parallel swarm (fct/swarm/) + LAUNCHED it: a self-refilling pool of 8
              Claude Code agents working the flat task list, each in an isolated git worktree
              (own frames dir via $FCT_FRAMES_DIR, own render lock via $FCT_LOCK, node_modules+venv
              symlinked, frames seeded via per-slug symlinks; worktrees under ~/fct-swarm so CC's
              internet-mode prompt never fires). Each agent owns one task end-to-end via the
              self-merge contract (decode-first census -> build -> gate green vs GUI GT -> rebase
              -> re-freeze baseline -> commit "swarm <id>:" -> push, retry on reject). A reflection
              agent runs every 30 min: summarizes agent logs (wall time, gate fails, rebase churn)
              and dispatches a CC efficiency agent that improves the brief/harness/tooling. Enabling
              engine changes (config/cli/gen env overrides, symlinked-slug-dir guard) are
              behavior-neutral for single-agent use; gate stayed green throughout. Launched all 8
              slots (T-A1/A2/A3/B1/D1/E1/F1/G1) + pool + reflection loop under tmux; verified live.
- 2026-07-13  SWARM LIVE — launched the self-refilling 8-agent Claude Code pool + 30-min reflection
              loop (fct/swarm/, commits d4b1495..9de1bdf). 8 agents (T-A1/A2/A3/B1/D1/E1/F1/G1)
              each own one ROADMAP task in a fully-isolated git worktree (own frames dir via
              $FCT_FRAMES_DIR, own render lock via $FCT_LOCK, node_modules+venv symlinked, per-slug
              frame symlinks seeded from the shared baseline). Pool keeps 8 alive and refills on
              exit; agents self-merge (decode->gate->rebase->re-freeze->commit 'swarm <id>:'->push).
              Reflection agent every 30 min reads agent logs and improves the brief/harness/tooling.
              Isolation validated: an isolated worktree gates 0-regressions identical to main.
- 2026-07-13  Baked in a DECODE-FIRST forcing function to stop the debug-spiral pattern.
              Added `fct census <slug>` (fct/census.py, wired in cli.py): reads a slug's REAL
              scene graph from its .motr — factory-resolved node types, <filter> plugins,
              <behavior> Link channels (decoded from affectingChannel paths, transform vs COLOUR),
              generators (paint-stroke vs fill), emitter/cell counts. No render, no FCP, ~1s.
              New RULE 8: run census + verify the premise BEFORE writing engine code; algorithm
              facts come from the binary/.motr, GUI GT only confirms/refutes. Census immediately
              CORRECTED two wrong ROADMAP premises: (1) Color_Planes is NOT a colour-Link slug —
              its Links drive position.Z/rotation (3D fold) + 6x Channel Mixer (moved to T-G1);
              (2) S5 "gradient generator" gates ZERO built-ins — Slide_In's "Gradient" is a
              paint-stroke Emitter, and Slide_In/Loop/Heart are all colour-channel-Link slugs
              (folded into S1/T-A1). Dropped T-C1/T-C2. Gate 0 regressions (toolkit-only).
- 2026-07-13  BAKED IN "decode-first" as rule 8 + shipped `fct census` (fct/census.py, 147 lines):
              a pure-XML scene-graph fact-finder (factory-table-resolved node types, <filter>
              plugins, <behavior> Link channels decoded from the affectingChannel path, emitters,
              paint-stroke vs fill generators). Built because TWO ticks burned effort on ROADMAP
              premises the .motr contradicted. census then CORRECTED those premises: Color_Planes
              is a 3D-fold (position.Z/rotation Links) + 6x Channel Mixer, NOT colour-Link (moved
              to T-G1); Panels_Across/Slide_In/Loop/Heart ARE the real colour-Link users (T-A1);
              S5 "gradient generator" DROPPED — no built-in uses a gradient FILL (Slide_In's
              "Gradient" is a paint-stroke Emitter; Loop/Heart are colour-Link). Gate 0/0.
- 2026-07-13  Removed the file-OWNERSHIP concept from the parallel model (it confused agents
              last time more than it helped). Agents now edit WHATEVER files they need and rely on
              git rebase to resolve collisions at merge time; the self-merge contract's BUILD step
              says "edit any files your task needs" and MERGE says "resolve code conflicts, re-gate
              after". Kept the additive/self-registering-module PREFERENCE (filter registry) as a
              soft nicety, not a rule. Dropped the OWNS column from the flat task list (now just
              ID/STATUS/TASK/TARGET). Doc-only; gate 0/0.
- 2026-07-13  Removed the file-OWNERSHIP concept from the parallel model (it confused agents
              more than it helped last time). Agents now edit ANY files they need and rely on
              rebase/merge to resolve collisions — the self-merge contract's step 4 handles code
              conflicts (keep both, re-gate) and baseline conflicts (regenerate). Dropped the
              "OWNS (edit these only)" column from the flat task list and the hub-file edit
              restriction; kept the additive/self-registering pattern as a PREFERENCE, not a rule.
              Doc-only; gate 0/0.
- 2026-07-13  Rightsized the flat task list — split the two genuinely-big rendering rows into
              independently gate-verifiable sub-rows: T-B2 (minimal emitter: spawn/advect/gravity/
              composite) + T-B3 (appearance-over-life ramps); T-D2 -> T-D2a/b/c/d (levels,
              channel-mixer, glow, hue-saturation — 4 DISJOINT filter files, run in parallel once
              T-D1 lands). Left parse-only rows (T-A2/B1) and atomic fixes unsplit: a split only
              helps when each piece moves PSNR alone or is a disjoint module — a parser stage
              scores nothing by itself, so splitting it just adds rebase overhead. 15 rows total.
- 2026-07-13  ROADMAP parallelism reworked for MAX concurrency — dropped the wave/integrator
              model. Every task is now an INDEPENDENT unit and each agent REBASES + MERGES ITS
              OWN work via an 8-step self-merge contract (branch off origin/main → build owned
              files only → gate → rebase → RE-FREEZE baseline → commit → push w/ retry-on-reject
              → tick ledger). Baseline_engine.json is treated as DERIVED state (regenerate on
              rebase, never hand-merge); hub touches stay single append-only lines (rebase keeps
              both). Added a FLAT TASK LIST (T-A1..T-G1, 13 rows) with per-task OWNED file sets +
              `after:` deps; 9 rows have no deps → run simultaneously today. S1–S6 headers now
              point at task IDs. Doc-only; gate 0/0.
- 2026-07-13  ROADMAP made SWARM-PARALLELIZABLE — added a "Parallel execution model" section:
              4 HUB files identified as the collision zone (parser/evaluator/compositor/index.ts +
              types.ts); 6 disjoint OWNERSHIP LANES (A behaviours, B particles, C gradient/gen,
              D compositing, E framing/geom, F filters) that can run concurrently; a 3-WAVE
              dependency schedule (wave 1 additive/low-risk in parallel → wave 2 one-hub-hook-each
              → wave 3 serialized architectural); an INTEGRATION protocol (agents own lane files
              only, write hub hooks as single append-only lines, integrator merges one lane at a
              time gate-green before commit); and an agent-brief template. Each S1–S6 header now
              tagged with its LANE + WAVE. Models the parallel-safe filter-registry pattern
              (self-registering module + append-only barrel import). Doc-only; gate 0/0.
- 2026-07-13  ROADMAP REGENERATED — rewrote the Items section as a complete SUBSYSTEM catalogue
              (S1–S7) after all filters + architecture (items 1–11) landed. Every part of the
              engine is now documented: 6 remaining-work subsystems ranked by coverage×safety
              (S1 behaviour drivers = biggest safe lever; S2 linear compositing = highest ceiling;
              S3 particle sim; S4 colour pipeline; S5 gradient gen; S6 framing camera; S7 residual)
              + a "Reference — implemented subsystems" ledger so nothing is undocumented. No code
              change; doc only. Engine mean 13.91 dB, 20/65 ≥15.
- 2026-07-13  ITEM 12 (Duplicate/Squares) DONE — replicator-mask-reveal A/B binding was
              INVERTED. parseFootage's masked-reveal rule bound the unmasked base → B and the
              masked (growing-dots/squares) reveal → A, so both slugs played B→A: f0 showed
              full blue B where GUI shows full sepia A, and the dots revealed A instead of B.
              The code even CONTRADICTED its own comment ("unmasked base shows the OUTGOING
              image, bind → A"). FIX: base → A, masked reveal → B (matches GUI GT A→B and the
              comment's stated intent). Structural (fires on any replicator-mask-reveal drop
              zone, hasReplicatorMaskReveal = Squares+Duplicate), no names. Duplicate 11.24→
              15.51 (+4.27), Squares 11.72→12.46 (+0.74). Gate 0 regressions/2 improvements;
              baseline re-frozen (engine mean 13.84→13.91 dB).
- 2026-07-13  ITEM 12 (Replicator-mask A/B) DONE — Duplicate 11.24->15.51 (+4.27), Squares
              11.72->12.46 (+0.74). The MASKED-REVEAL A/B binding in parseFootage was INVERTED:
              it bound the unmasked BASE drop zone -> B and the replicator-masked reveal -> A,
              so both slugs played B->A (f0 showed the incoming blue B instead of outgoing sepia
              A). GUI GT is A->B (base = outgoing A at f0; the growing dots/squares reveal the
              incoming B). FIX: bind base -> A, masked-reveal -> B (matches the code's OWN stated
              comment, which disagreed with the code). Structural (fires on any replicator-mask
              reveal: Squares + Duplicate), no names. Gate 0 regressions/2 improvements; baseline
              re-frozen (engine mean 13.84->13.91 dB).
- 2026-07-13  ITEM 12 (Divide) DONE — Dissolves/Divide 11.23->14.24 (+3.01). THREE coupled
              root causes, all necessary together (alone each regresses or no-ops):
              (1) A/B INVERSION — the doc-order override in parseFootage re-keyed Divide's
              clips by render order (its "Transition B" scenenode is authored before
              "Transition A"), so image A got source B. FIX: BOTH-MASKED SUPPRESSION — when
              both referenced drop zones carry an Image Mask (a two-sided masked split), keep
              the name-based binding instead of the doc-order re-key. Fires only when
              referenced.length===2 so Up-Over (3 refs) is safe.
              (2) RETIME-WRAP froze the tail — wrapSec=0.801s collapsed every render past 0.8s
              to scene t=0, culling Transition B (timing in=0.017s) so f14-20 froze flat at
              8.77 dB. FIX: new capabilities.ts hasFilteredMaskReveal (a mask-source group
              bearing its OWN image filter is an actively-reshaped reveal that outlives the
              drop-zone timeout) cancels the wrap — gated && !strokedMaskShape so
              Objects/Arrows (also a filtered mask, but a STROKED reveal needing the clamp,
              which depends on wrapSec surviving) is untouched (verified: Arrows held 16.9).
              (3) MASK-GROUP FILTER APPLICATION — resolveImageMaskAlpha now runs the
              mask-source group's OWN filters over the rasterized matte (generic UUID dispatch,
              no-op when the group has no filters), so Divide's "B Masks" 3x MinMax DILATE
              (Radius 0->32/194/29) GROWS the raw ~75% rectangle union to full-frame B
              (f23 13.34->17.54). Files: capabilities.ts (+probe), timemap.ts (wire+gate),
              parser/footage.ts (both-masked suppression), compositor/masks.ts (filter apply),
              test/no-hardcode.test.ts (register probe: fires on Arrows+Divide). Gate 0
              regressions/1 improvement; baseline re-frozen (engine mean 13.79->13.84 dB).
- 2026-07-13  ITEM 12 (Divide) DONE — Dissolves/Divide 11.23→14.24 (+3.01). THREE coupled
              root causes, all necessary together (alone each regresses or no-ops):
              (1) A/B INVERSION — the doc-order override in parseFootage re-keyed Divide's
              clips by render order (its "Transition B" scenenode is authored before
              "Transition A"), so image A got source B. FIX: BOTH-MASKED SUPPRESSION — when
              both referenced drop zones carry an Image Mask (a two-sided masked split), keep
              the name-based binding instead of the doc-order re-key. Fires only when
              referenced.length===2 so Up-Over (3 masked refs) is unaffected.
              (2) RETIME-WRAP froze the tail — wrapSec=0.801s collapsed every render past 0.8s
              to scene t=0, culling Transition B (timing in=0.017s) so f14–20 froze flat at
              8.77 dB. FIX: new capabilities.ts hasFilteredMaskReveal (a mask-source group
              bearing its OWN image filter is an actively-reshaped reveal that outlives the
              drop-zone timeout) cancels the wrap — gated `&& !strokedMaskShape` so
              Objects/Arrows (also filtered-mask, but a STROKED reveal needing the clamp that
              depends on wrapSec surviving) is untouched (verified Arrows 16.9 held).
              (3) MASK-GROUP FILTER APPLICATION — resolveImageMaskAlpha now runs the
              mask-source group's OWN filters over the rasterized matte (generic UUID dispatch,
              no-op when the group has no filters), so Divide's "B Masks" 3× MinMax DILATE
              (Radius 0→32/194/29) GROWS the raw ~75% rectangle union to full-frame B
              (f23 13.34→17.54). Files: capabilities.ts, timemap.ts, parser/footage.ts,
              compositor/masks.ts, test/no-hardcode.test.ts. Gate 0 regressions/1 improvement;
              baseline re-frozen (engine mean 13.79→13.84 dB).
- 2026-07-13  ITEM 12 (Dissolves/Divide) DONE — full A→B reveal, 11.23→14.24 (+3.01). THREE
              coupled root causes, all fixed in one gate-green commit (each necessary; any
              alone regresses or no-ops). (1) A/B INVERSION: the parseFootage doc-order override
              re-keyed Divide's clips by render order (its "Transition B" scenenode is authored
              BEFORE "Transition A"), so image A got source B. FIX: BOTH-MASKED SUPPRESSION —
              when both referenced drop-zone nodes carry a direct Image Mask (a two-sided masked
              split, not the single-masked reveal the override targets), keep the NAME-based
              binding. Fires only when referenced.length===2 so Up-Over (3 masked refs) is
              untouched. (2) RETIME-WRAP froze the scene to t=0 past wrapSec=0.801s → Transition
              B (timing in=0.017s) was culled for f14–f23, flat 8.77 dB. FIX: new
              capabilities.ts hasFilteredMaskReveal (a mask-SOURCE group carrying its OWN image
              filter = a matte actively reshaped over the transition, outliving the drop-zone
              timeout) cancels the wrap — gated && !strokedMaskShape so Objects/Arrows (also a
              filtered-mask reveal, but STROKED → needs the CLAMP, which requires wrapSec to
              survive) is unaffected (verified: Arrows 16.9, 0 regression). (3) MATTE GROWTH:
              masks.ts applyMaskGroupFilters runs the mask-source group's OWN filters over the
              rasterized matte (generic UUID dispatch, no-op when the group has no filters), so
              Divide's "B Masks" 3× MinMax DILATE (Radius 0→32/194/29) grows the divide-pieces
              from the raw ~75% rectangle union to full-frame B (f23 13.34→17.54). Files:
              engine/src/capabilities.ts (+hasFilteredMaskReveal), engine/src/timemap.ts (wire
              cancel), engine/src/compositor/masks.ts (+applyMaskGroupFilters),
              engine/src/parser/footage.ts (both-masked suppression), test/no-hardcode.test.ts
              (register probe — fires on 2: Arrows, Divide). Gate 0 regressions, engine mean
              13.79→13.84 dB. Baseline re-frozen.
- 2026-07-13  ITEM 12 (Divide mask-scale) DONE — upscaled scenes now render NATIVE-then-resample.
              ROOT CAUSE of Dissolves/Divide's 51% BLACK (an inset centred rect at every frame,
              incl. f0 where GUI shows full A): Divide is a 1280×720 scene shown at 1920×1080 and
              was rendered DIRECTLY at 1920 output, but its divide-piece MASK shapes are authored
              in SCENE (1280) coordinates. Rasterized into the 1920 buffer without a scene→output
              scale, the pieces covered only 1280/1920≈67% per axis (≈49% area) — clipping the A
              card to a centred rect, the rest black (isolated: A-Masks alpha coverage 0.49 @1920
              vs 0.98 @1280 native). FIX: dropped the "render upscaled scenes directly at output"
              special-case; upscaled scenes now render at their NATIVE size then resample to
              output (identical to how larger-than-output canvases already render), so ALL
              geometry — drop-zone images, shapes, AND masks — scales uniformly and the pieces
              tile the frame again. Blast radius = the only two upscaled slugs, both improve:
              Divide 10.15→11.23 (+1.08), Drop_In 14.61→14.81 (+0.20). Gate 0 regressions; engine
              mean 13.78→13.79; baseline re-frozen. tsc clean. STILL OPEN (documented in the
              item-12 TRIAGE MAP): Divide's A/B inversion at f0 (parseFootage document-order
              override inverts its name-correct clips; the same override is required by Wipes/
              Mask + Center Reveal, so it needs a safe structural discriminator).
- 2026-07-13  ITEM 12 (Divide mask-scale) DONE — upscaled scenes now render NATIVE then
              resample. ROOT CAUSE of Dissolves/Divide's 51% black: it is a 1280×720 scene shown
              at 1920×1080 and rendered DIRECTLY at 1920 output, but its divide-piece MASK shapes
              live in SCENE (1280) coordinates — so rasterized into the 1920 buffer they covered
              only 1280/1920 ≈ 67% width (≈49% area), clipping the A card to a centred rect with
              a black L-border (verified: A-Masks alpha coverage 0.488 at output res vs 0.980 at
              native res; the 4 divide rectangles tile ±640/±360 = the full 1280×720 frame in
              scene space). The drop-zone IMAGES happened to fill by their own source size, hiding
              the bug for years. FIX: removed the "render upscaled scenes directly at output"
              special-case so they render at native scene size then resample to output (api.ts),
              scaling ALL geometry (images, shapes, masks) uniformly — same path the larger-than-
              output canvases already use. Blast radius = the 2 upscaled slugs, both improve:
              Divide 10.15→11.23 (+1.08), Drop_In 14.61→14.81 (+0.20). Gate 0 regressions; engine
              mean 13.78→13.79; baseline re-frozen. tsc clean. STILL OPEN (documented in triage):
              Divide's f0 shows B not A — a separate A/B document-order-override inversion that
              also serves Wipes/Mask + Center Reveal, so it needs a safe discriminator first.
- 2026-07-13  ITEM 12 (parser correctness) — fixed a latent drop-zone Width/Height CURVE bug +
              added the low-scorer TRIAGE MAP. parseDropZone read the drop-zone frame Width/
              Height (id 313/314) only from the static `value`, but Motion authors some as a
              CURVE (Dissolves/Divide ramps Width 1311→…) with a SENTINEL static value=1 (min=1)
              alongside — so the parser captured 1, which would collapse the compositor's
              aspect-fill (fitScale = frameW/srcW ≈ 1/1854 ≈ 0). Fixed parseDropZone to prefer a
              curved dimension's real size (first keyframe → curve value → curve default) over
              the sentinel; 4 new unit tests (test/dropzone-dim.test.ts) green. Blast radius = 9
              slugs' parsed drop-zone dims corrected (Divide, Blurs/Gaussian+Radial, Multi-flip,
              Smear, Light_Sweep, Loop, Slide, Up-Over, Wipes/Mask — all had 1×/0× sentinels);
              re-rendered all 9, gate 0 regressions AND 0 score change (behavior-NEUTRAL: the
              compositor's effCrop produced identical output either way, so no metric movement —
              but the parsed data is now correct, unblocking future compositor work on these
              upscaled/curved-frame slugs). Also TRIAGED the top low-scorers (Smear/Slide_In/
              Panels_Across/Divide/Video_Wall/Clone_Spin/Lower): each is a deep multi-issue case
              documented in the item-12 TRIAGE MAP; Smear's clamp path was tried + REJECTED
              (11.03→10.61, uncommitted). tsc clean, gate green.
- 2026-07-13  ITEM 12 (triage tick) — investigated the next tranche of low-scorers and added
              the item-12 TRIAGE MAP above; NO code landed because each is a deep multi-issue
              case, and forcing a change into the heavily-tuned shared timemap / isSolidPanel /
              mask-group code would risk regressions (careful-coder rule). Verified per slug:
              Smear 11.03 is a DirectionalBlur+Smear filter/geometry gap NOT a wrap bug
              (force-clamp REGRESSED 11.03→10.61, reverted uncommitted); Slide_In 10.25 is
              two-deep (endSec inflated to 3.0s by the Gradient generator's keys + a 0.467s
              wrap); Panels_Across 10.38 panels ARE parsed correctly as white (panelFill
              255,255,255 verified) — the gap is dim panel blend over sepia A + late B reveal in
              tuned code; Divide 10.15 renders a centered ~1350×782 content rect (51% black) from
              the upscaled-scene (1280×720→1920×1080) + cross-group A/B MinMax mask compositing;
              Video_Wall 8.74 / Clone_Spin 10.32 are Framing-camera projection geometry; Lower
              9.04 is a kinetic mask-panel choreography. Tree clean, gate green (untouched). Next
              tick: take ONE as a dedicated deep item (Divide's mask-group + upscale-conform is
              the most concrete; Video_Wall's Framing pose is the lowest-scoring).
- 2026-07-13  ITEM 12 (triage tick) — mapped the next tranche of low-scorers; NO code landed
              because none is a clean single-fix and forcing a change into the heavily-tuned
              shared timemap / isSolidPanel / mask-group code would risk regressions
              (careful-coder). Added the item-12 TRIAGE MAP above with per-slug root causes +
              rejected approaches. Key findings: Smear 11.03 is a DirectionalBlur+Smear
              filter/geometry gap NOT a wrap bug (force-clamp REGRESSED 11.03→10.61, reverted
              uncommitted); Slide_In 10.25 is two-deep (endSec inflated to 3.0s by the Gradient
              generator's keys + a 0.467s wrap); Panels_Across 10.38 panels parse correctly as
              white (verified panelFill 255,255,255) — the gap is dim panel blend + late B
              reveal in tuned code; Divide 10.15 renders 51% black at every frame from cross-
              group A/B mask compositing; Video_Wall 8.74 / Clone_Spin 10.32 are Framing-camera
              projection geometry. Tree clean, gate green (untouched). Next tick: take ONE
              dedicated deep item — Divide's mask-group compositing (most concrete: A op=1 but
              clipped to an inset black rect) or the Framing-camera pose (Video_Wall, lowest).
- 2026-07-13  ITEM 12 (triage tick) — investigated the next tranche of low-scorers; NO code
              landed because none is a clean single-fix and forcing one would risk the
              heavily-tuned shared timemap/isSolidPanel/mask code (careful-coder). Findings
              recorded in the item-12 TRIAGE MAP above: (a) Smear 11.03 — DirectionalBlur+Smear
              filter/geometry, NOT wrap; force-clamp REGRESSED 11.03→10.61 (reverted,
              uncommitted). (b) Slide_In 10.25 — endSec inflated to 3.0s (Gradient generator
              keys) AND a wrap; two-deep. (c) Panels_Across 10.38 — panels parse correctly as
              white (verified), issue is dim panel blend over sepia A + late B reveal, in tuned
              code. (d) Divide 10.15 — cross-group "A Masks"/"B Masks" (MinMax morphology) clip
              the frame to a center rect → 51% black at every frame; mask-group compositing bug.
              (e) Video_Wall 8.74 / Clone_Spin 10.32 — Framing-camera projection geometry.
              (f) Lower 9.04 — kinetic mask-panel choreography. Each needs a dedicated tick.
              Tree clean, gate untouched (green). Next: pick ONE (Divide's cross-group mask
              compositing is the most concrete: A visible op=1 but rendered as an inset black
              rect — a compositing bug, not subjective color/timing).
- 2026-07-13  ITEM 12 (Slide) DONE — retime-wrap cancel now covers a kinetic media-panel
              MONTAGE. ROOT CAUSE of Stylized/Slide's frozen tail: its transition is a montage
              of 18 bundled-media sprite PANELS (Media/*.png "rectangles across") that slide
              across (Position keyframes) and reveal B, outliving the outgoing A drop zone
              (panels out=1.068s, B out=1.668s vs wrapSec=0.667s). The retime-wrap snapped every
              frame past 0.667s back to scene time 0 = pure A, so the mid-transition rendered
              correctly (f12 matched GT) but the tail froze on A (f23 showed A, GT shows B). Same
              "an overlay keeps animating past the wrap" class as the existing filled-shape /
              blended-media / replicator-matte cancels, expressed as sliding media panels. Added
              a kinetic-media-panel probe: ≥3 media-sourced image layers with a Position keyframe
              curve whose lifetime `out` survives past the wrap → cancel. Fires ONLY on a genuine
              montage (Slide: 15 past-wrap panels); a lone decorative sprite (Loop: 1, not past
              wrap) and every plain drop-zone-crossfade wrap slug (Bloom/Zoom/Static/…: 0) are
              untouched. Blast radius verified = exactly 1 slug (buildTimeMap wrap/clamp diff
              old-vs-new: only Slide's 0.667 wrap → cancelled). Slide 14.21→16.59 (+2.38); gate
              0 regressions; engine mean 13.74→13.78 dB; baseline re-frozen. tsc clean.
              Structural (media source + position keyframes + out>wrap + count≥3), not a name.
- 2026-07-13  ITEM 12 (Lens_Flare) DONE — retime-wrap cancel now covers screen-blend
              GENERATOR overlays. ROOT CAUSE of Lights/Lens_Flare (9.57): its Transition A
              drop zone times out at 0.567s (the A→B crossfade completing), so the retime-wrap
              (min drop-zone `out`) snapped every tail frame past 0.567s back to scene time 0 =
              pure A. But B lives to 1.001s (endSec) and IS the destination — GT f23 shows B,
              not A. The wrap-cancel probe (which disables the wrap when a filled-shape /
              blended-MEDIA / replicator-matte overlay keeps animating past the wrap) missed
              Lens_Flare's LensFlareGenerator: a screen-blend (Blend Mode 10) GENERATOR that
              outlives the wrap (out=1.001s) and animates the whole duration — the SAME
              "blended overlay survives the wrap" class as Light Noise's screen .mov, just a
              generator instead of a media image. Extended the blendedMediaOverlay scan to also
              match l.type==='generator' with a screen-family blend + out>wrapSec. Blast radius
              = Lens_Flare only (the only slug with BOTH a wrap AND a screen-blend generator
              outliving it; verified every other slug's wrapSec/clampSec unchanged). f0 and f23
              now match (A→B crossfade restored); the f12 flare-brightness overlay remains a
              separate LensFlareGenerator feature gap. Lens_Flare 9.57→11.63 (+2.06) gate-res /
              22.72 full-res; gate 0 regressions; engine mean 13.71→13.74 dB; baseline
              re-frozen. tsc clean. Structural (layer type + blend + out>wrap), not a name.
- 2026-07-13  ITEM 12 (Drop_In) DONE — deleted the STALE top-left card-conform model → full
              frame. Movements/Drop_In drew its Transition A/B drop zones through a dedicated
              "DropInCard" pass that conformed each source into a 1588×902 card pinned to the
              output's TOP-LEFT, leaving the right+bottom ~30% of the frame BLACK (f0 blackfrac
              0.305, an L-shaped void). That geometry was fit to an OLD GUI-GT capture; the
              CURRENT GUI GT shows A/B filling the ENTIRE frame every frame (f0 = full-frame
              sepia A, f23 = full-frame B, no void). Removed detectDropInCard/blitDropInCard +
              the DropInCard context type + the renderLayer skip + the composite() draw pass,
              and deleted compositor/drop-in.ts (dead-code rule). Drop_In now renders through
              the normal full-frame drop-zone path (same as Push); scene 1280×720 upscales to
              1920×1080 at identical 16:9 aspect (no letterbox) — only the shared ~3.6%
              start.png conform edge remains. Blast radius = Drop_In only (detectDropInCard
              fired on its unique upscaled-scene + Transition-B position-bounce signature).
              Gate: 0 regressions, Drop_In 9.29→14.61 (+5.32) gate-res / 14.89 full-res.
              Engine mean 13.63→13.71 dB; baseline re-frozen. tsc clean.
- 2026-07-13  ITEM 12 (Drop_In) DONE — deleted the STALE DropInCard "card conform" model.
              Drop_In was scoring 9.29 because the compositor drew its Transition A/B drop
              zones as a 1588×902 CARD pinned to the top-left (0,0), leaving ~30% of the frame
              (right + bottom) BLACK from f0 onward. That card model was fit to an OLD GUI
              capture; the CURRENT GUI GT shows A/B FULL-FRAME (f0 = uniform sepia A edge-to-
              edge; f23 = full B) with the drop-impact particles overlaid. Deleted the whole
              stale path: compositor/drop-in.ts (detectDropInCard + blitDropInCard), the
              detect+draw block in composite(), the renderLayer skip, and the DropInCard type
              in context.ts — Drop_In now renders through the normal full-frame drop-zone blit
              like Push. Only Drop_In was affected (detectDropInCard's signature fired on it
              alone). Drop_In 9.29→14.61 (+5.32); gate 0 regressions, 1 improvement; engine
              mean 13.63→13.71 dB; baseline re-frozen. tsc clean; dead code removed (ROADMAP
              rule: delete stale code, don't leave it disabled).
- 2026-07-13  ITEM 12 (Drop_In) DONE — deleted the STALE top-left card-conform model → full
              frame. Movements/Drop_In rendered its Transition A/B drop zones through a
              dedicated "DropInCard" pass that conformed each source into a 1588×902 card
              pinned to the output's top-left, leaving the right+bottom ~30% of the frame
              BLACK (verified: f0 blackfrac 0.305, an L-shaped void). That geometry was fit to
              an OLD GUI-GT capture; the CURRENT GUI GT shows A/B filling the ENTIRE frame at
              every frame (f0 = full-frame sepia A, f23 = full-frame B, no void). The card
              model was drift. Removed detectDropInCard/blitDropInCard + the DropInCard type +
              the renderLayer skip + the composite() draw pass, and deleted
              compositor/drop-in.ts (dead-code rule). Drop_In now renders through the normal
              full-frame drop-zone path (same as Push). Scene is 1280×720 upscaled to 1920×1080
              (identical 16:9 aspect → no letterbox); only the shared ~3.6% start.png conform
              edge remains. Blast radius = Drop_In only (detectDropInCard fired on its unique
              upscaled-scene + Transition-B position-bounce signature). Gate: 0 regressions,
              Drop_In 9.29→14.61 (+5.32) gate-res / 14.89 full-res. Engine mean 13.63→13.71 dB;
              baseline re-frozen. tsc clean.
- 2026-07-13  ITEM 12 (Color_Planes) DONE — Generator negative-offset local-frame re-anchor.
              ROOT CAUSE of Movements/Color_Planes' BLACK tail (f23 = 0,0,0 vs GT B): the
              decorative "Color Solid" backdrop is a Generator (factory 4) with timeline
              offset≈−0.567s, so its Z-Position/Y-Rotation curves live in the layer-LOCAL
              frame. The animationEndSec walk read the RAW local 2.369s (0.5s past the 1.867s
              span), so the progress→time map over-ran and the additively-recombined RGB
              channel planes (offset ±154px at that end) over-separated → black tail. FIX:
              re-anchor Generator neg-offset curves to scene time (scene = local + offset =
              1.802s ≈ span), mirroring the existing Camera / media-overlay neg-offset
              re-anchors. Gated on factory=Generator AND offset < −0.3s. _trace_end old-vs-new
              diff confirms it changes ONLY Color_Planes' animationEndSec (2.369→1.802), zero
              blast radius. Gate 0 regressions, Color_Planes 9.86→10.47 (+0.61); engine mean
              13.62→13.63 dB; baseline re-frozen. tsc clean. Structural (factory + neg offset),
              not a per-transition path.
- 2026-07-13  ITEM 11 DONE — media clips play FORWARD by default (was reversed). The bench
              mediaResolver defaulted bundled .mov overlays+mattes to REVERSE (clipTime =
              duration − t) on an un-GT-verified assumption. Measured WRONG: Objects/Veil
              rendered fully time-reversed (its Veil-Wipe-Matte, which Image-Masks B with
              Invert=1, was sampled at its BLACK end at progress 0 → revealed B backwards;
              the matte clip even carries Reverse=0). Forward beats reverse on EVERY media
              slug vs the GUI GT: Veil 9.51→16.04 (+6.53), Leaves 12.42→16.73 (+4.31),
              Curtains 14.15→15.10 (+0.95), Static 14.14→14.52 (+0.38); Light Noise/Light
              Sweep unchanged (retime absolute path). Flipped the default to forward
              (247f0ca). Full gate 0 regressions, 4 improvements; engine mean 13.43→13.62 dB.
- 2026-07-13  ITEM 10 DONE — animationEndSec local-frame timing (3 classes) + audit of the rest.
              The remaining end>span slugs (Slide_In, Center_Reveal, Heart, Loop, Up-Over,
              Video_Wall) proved NOT timing bugs: a renderAt end-sweep on Slide_In scored an
              identical 10.18 dB at every candidate end, so its low score is a Gradient-generator
              rendering gap (the full-screen colored wipe isn't composited), not the animation
              window. Those become item 12 (compositor/generator feature gaps).
- 2026-07-13  ITEM 10 (note) — drop-zone-lifetime BOUND tried + REJECTED (gate red). Hypothesis:
              the frozen-tail slugs (Slide_In 10.25, Center_Reveal 12.09, Close_and_Open 10.95)
              inflate animationEndSec via a decorative background Gradient/offset-0 Camera whose
              keys run past the drop zones, so bounding animationEndSec by max(span, latest
              drop-zone image `out`) should trim the overshoot. MEASURED (rendered 11 affected
              slugs, scored vs GUI GT): net-neutral but FAILS the gate — +Static/Color_Planes/Heart
              (0.5/0.8/1.92) but −Smear/Center_Reveal/Loop (0.8/1.02/0.43), and crucially
              Slide_In/Close_and_Open/Up-Over did NOT improve. CONCLUSION: (a) those three frozen
              slugs are NOT fixed by shortening animationEndSec — their freeze has a different root
              cause (the decorative gradient IS the intended render, or the drop-zone slide geometry
              is wrong), needs separate investigation; (b) Center_Reveal/Smear/Loop genuinely
              PREFER their larger animationEndSec (retime maps the visible transition onto a longer
              scene-time axis). Reverted; NOT committed. Lesson: the drop-zone `out` is not a safe
              universal upper bound for the animation window.
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
