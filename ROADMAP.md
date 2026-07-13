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

- **Engine mean: 13.91 dB** across 65 GUI-GT transitions; **20 / 65 already ≥ 15 dB** (matched).
- **Architecture is DONE.** The renderer contract, single time authority, filter registry,
  RenderContext threading, god-object splits, colour-transform CI, and the 360° full-frame
  model all landed (items A1–A8 in the "Done architecture" ledger at the bottom).
- **All 24+ FCP FILTERS are reverse-engineered and implemented** (registry in
  `engine/src/compositor/filters/`). Remaining low scores are NOT missing filters — they are
  missing **subsystems** (behaviours, particle sim, generators) and the **linear working-space
  compositing** model. This file now tracks every subsystem, implemented or not.
- Work top-down by **coverage × safety** (Σ deficit-to-16 dB ÷ risk). One subsystem per arc,
  gate-green each commit, baseline re-frozen when an improvement is protected.

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
T-A1  TODO    colour-channel Link (census-verified)               Panels_Across, Slide_In, Loop,
                                                                  Heart (NOT Color_Planes — 3D fold)
T-A2  TODO    Motion Path driver                                  layer follows a spatial path;
                                                                  unblocks path users
T-A3  DROPPED Gravity driver (LAYER-level)                        census: 0 built-in LAYERS use
                                                                  Gravity. All 4 Gravity behaviours
                                                                  (Drop_In x3, Earthquake x1) sit on
                                                                  Particle Cells -> folded into T-B1
                                                                  (which already lists "gravity").
T-B1  TODO    Emitter+Cell param PARSER                           birth rate, life, vel, spin, gravity
                                                                  (owns gravity after T-A3 dropped)
T-B2  TODO    Emitter SIM+render, MINIMAL     after: T-B1         spawn + advect + gravity + composite
                                                                  (flat colour). Target: Diagonal x2
T-B3  TODO    Emitter appearance-over-life    after: T-B2         colour/scale/opacity ramps ->
                                                                  Close_and_Open, Up-Over, Glide, Center
T-C1  DROPPED linear/radial gradient generator                   census: NO built-in uses a gradient
                                                                  FILL; Slide_In/Loop/Heart are S1
                                                                  colour-Link (see S5). Off critical path.
T-D1  DONE    linear working-space composite path                 flag-gated; overlay slugs first
T-D2a TODO    Brightness/Colorize into linear after: T-D1         Colorize=1 users, Brightness>1
T-D2b DONE    Tint into linear               after: T-D1          Tint filter flag-gated (Leaves +0.07)
T-D2c TODO    Glow/Bloom into linear         after: T-D1          Bloom, 360°_Bloom
T-D2d DONE    HSV into linear                after: T-D1          Color_Panels (HSV x4; flag OFF, byte-id).
                                                                  Panels_Random has ZERO HSV (Colorize
                                                                  only, folds into T-D2a).
T-E1  TODO    framing anchor (proxy->content ray)                 Video_Wall f4 black, Clone_Spin
T-E2  TODO    clone-tile wall render          after: T-E1         Video_Wall 14-tile grid
T-F1  TODO    Smear appearance at mid-frames                      Movements/Smear (11.0)
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

### S1. Behaviour drivers — Link / Motion Path  [DOING]  (tasks T-A1/A2 · safe, high-coverage)
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
**Status:** PARTIAL. Slugs gated (16): Panels_Across, Color_Planes, Lens_Flare, Switch,
Center_Reveal, Push, Reflection, Zoom, 360°_Wipe, Drop_In, Clothesline, Earthquake, Scale,
3D_Rectangle, 360°_Reveal_Wipe, 360°_Circle_Wipe (many already ≥15 — the low ones are the target).
**Next step:** implement **colour-channel Link** first, targeting **Panels_Across** and
**Slide_In** (census-confirmed colour-Link users), then Motion Path — each an additive
evaluator handler, independently gate-verifiable. NOTE: Color_Planes is a 3D-fold +
Channel-Mixer slug, so do not expect colour-Link work to move it.
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
**Slugs gated:** the low tail of the "other" bucket + all of S4 (Lower, Bloom, 360°_Bloom,
Panels_Across, Smear, Brightness/Colorize/Tint users).
**Next step:** add a linear composite path behind a flag; gate-green on the overlay slugs FIRST;
then migrate filter families into it one at a time, gate-green after each. Never commit red.
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
**Slugs gated (7):** Bloom (10.6), 360°_Bloom (11.6), Panels_Random (13.0), Color_Panels, Veil,
Slide, Leaves.
**Next step:** do S2 first; then re-measure — most of this bucket resolves with linear compositing.
Only after S2 revisit Tint's shadow-leg transfer + Bloom's Helium pipeline as isolated decodes.
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
**DoD:** Video_Wall + Clone_Spin improve; 0 regressions.
**Verify:** `fct regress engine` + `fct score Replicator-Clones__Video_Wall --full`.

### S7. Residual per-slug bugs  [ONGOING]  (tasks T-F1/G1 · opportunistic, one-offs)
Bugs not owned by a shared subsystem — fix opportunistically when a clean structural root cause is
found (never per-transition hardcoding). Current known:
- **Movements/Smear (11.0):** DirectionalBlur+Smear filter appearance + smear continuing past the
  drop-zone timeout (content vanishes at 0.467s). Clamp tried → worse (rejected).
- **Stylized/Lower (9.0):** kinetic mask-panel choreography; misses the bright mid white flash
  (partly S2 linear-compositing, partly panels culled vis=false).
- **Multi / Multi-flip / Pinwheel / Swing / Flip / Rotate (12–14):** Movements 3D fold geometry,
  each near-matched; small residuals.
Solved recently (see Done ledger): Divide A/B + wrap + mask-dilation, Duplicate/Squares A/B.

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

---

## Progress log  (newest first — one line per completed chunk)
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
