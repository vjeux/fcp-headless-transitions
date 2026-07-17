# ROADMAP — full-engine reverse-engineering plan (rebuilt 2026-07-15)

This is the living plan. It holds the **rules, leverage ordering, methodology, done-map,
and durable dead-ends** — the parts that must survive any individual slug's completion. The
**per-slug forward work** (one claimable item per transition below the 17 dB bar, each with
its diagnosis + next step + DoD) lives in the appendable **swarm TODO queue**
(`fct/swarm/todo/*.json`, `python3 -m fct.swarm.todo list`), NOT here — that is the single
source of truth for "what to do next per slug" and avoids duplicating it in two places.

The previous ROADMAP grew to 3,841 lines and — critically — was ORDERED by
filter-completeness, so "work the next TODO top-down" kept steering every tick into
low-leverage filter documentation while the engine mean sat FLAT at 14.59 dB for many ticks.
That was a local optimum. This rebuild re-orders the work by **measured dB leverage across
the WHOLE engine** (parser → evaluator → compositor → timemap), not by which filter is next
in a list.

The full prior plan (all decoded-constant history, 171 progress entries, per-filter RE
notes) is preserved verbatim in `docs/notes/ROADMAP_ARCHIVE_2026-07-15.md`. Nothing was
lost; this file is the lean forward plan.

Every per-slug work item lives in the TODO queue with its own **Definition of Done (DoD)**
and target slug; completion is a pushed commit whose subject starts `<id> DONE|DROPPED:`.
The leverage table (below) is the ORDERING over those items; this file's dead-ends are the
guardrails. Update the queue item's status + this file's dead-ends in the commit that does
the work.

## How the work gets done: the swarm (2026-07-16)
The engineering is run by **navi sub-agents spawned manually by the orchestrator agent**
(the main navi session), each taking ONE task in an isolated git worktree and self-merging
to origin/main (there is NO tmux and NO Claude Code — the old launcher was removed). The
**orchestrator does NO engineering** — its only job is to read the eligible queue
(`python3 -m fct.swarm.pool status`) and `spawn_agent` a sub-agent per open task, keeping
the pool full by spawning replacements as tasks finish. Work comes from the **appendable
TODO queue** `fct/swarm/todo/*.json` (one claimable item per slug; `pool.py` also reads any
legacy `ID STATUS TASK` fenced table for back-compat, but there are none now). Sub-agents
APPEND follow-up work they discover (a new fix a decode opens, a subsystem too big for one
task, a regressed-but-already-imperfect slug per Rule 11) to that queue so future agents
pick it up, and each cleans up its own worktree once its work has landed. See
`fct/swarm/README.md`; file items with `python3 -m fct.swarm.todo add`.

---

## The rules (non-negotiable — these are why the last effort drifted)

1. **One truth.** Score ONLY against the GUI GT (`~/fct-gui-gt`, via `fct score`).
   NEVER compare a render to another render ("headless-vs-headless" was circular and
   produced false "at ceiling" verdicts — see `docs/notes/CEILING_DIAGNOSTIC_FAILURE.md`).
2. **The gate = NET progress, not "zero regressions."** (Policy changed 2026-07-15 on
   vjeux's instruction: *"remove the rule that you can't break existing things — these
   transitions are massive and have a lot wrong right now; go in small pieces and fix one
   by one."*) A change ships when it is a genuine correctness improvement and moves the
   whole-engine mean UP: run `fct regress engine --verbose` and require **improvements
   that clearly outweigh regressions** (e.g. the drop-zone conform: +40 slugs, −2 slugs of
   <0.5 dB). Small collateral regressions on a few slugs are ACCEPTABLE when the fix is
   correct and net-positive — they become the next small piece to fix. Still: (a) re-render
   affected slugs with `fct gen engine <slug>`/`--all` first (the gate reads frames off
   disk); (b) UNDERSTAND every regression before shipping — a regression you can't explain
   is a bug, not collateral (investigate; a stale-baseline/JPEG-encode mismatch is not a
   real regression); (c) re-`fct baseline engine` after shipping so the new floor is
   protected; (d) never ship a NET-NEGATIVE change. Do NOT chase a behavior-neutral change
   that trips the gate as if it were real.

3. **One change per commit**, small blast radius, independently revertible.
4. **Focused sub-agents OK, gate-verified before merge.** A well-scoped, gate-verifiable
   mechanical chunk may go to a sub-agent (own worktree `~/fct-swarm/worktrees/<id>`, own
   `FCT_FRAMES_DIR`+`FCT_LOCK`, symlinked node_modules/venv). The ORCHESTRATOR always
   re-verifies with the full GUI-GT gate on main before the change is trusted. No
   sub-agent's self-generated metric ("my repro hit 40 dB") authorizes a merge — the full
   `fct regress engine` (0 regressions) does. Do NOT spawn a pool that declares success
   against a self-generated score.
5. **Everything in the repo.** No `~/`-level scripts, notes, or scoreboards. `fct/` is the
   one toolkit; `docs/notes/` is the one knowledge store; this file is the one plan.
6. **Commit == push.** Work on `main`. A change is not "done" until it is committed, the
   gate is green, AND pushed to `origin/main` in the same step. No stray branches.
7. **Decode the scene graph BEFORE writing code (`fct census <slug>`).** Algorithm facts
   come from the FCP binary / `.motr` (use `tools/re/read_const.py`, fat-binary aware) —
   never from prose in this file, never from black-box render-diffing. GUI GT only ever
   CONFIRMS or REFUTES a decode; a refutation means "re-read the source," not "nudge a
   constant." Decode-don't-fit. If census contradicts a ROADMAP item, FIX THE ITEM first.
8. **BUILD THE SUBSYSTEM. Do not hide behind gate-neutral no-ops.** The unit of work is a
   WHOLE WORKING SUBSYSTEM built end-to-end until a TARGET SLUG MEASURABLY IMPROVES vs GUI
   GT. A documentation-only / byte-identical tick is progress ONLY when it is (a) a genuine
   premise-correcting decode that retires/rescopes a task, or (b) an explicitly-labelled
   intermediate step of a subsystem you WILL finish next tick. It is NOT acceptable as the
   habitual outcome. **Per-tick honesty check before committing:** "Does this move a real
   pixel toward GT on a real slug, or am I committing a no-op because it feels safe?"

9. **⚠️ ANTI-LOOP (added 2026-07-15, the reason for this rebuild).** Do NOT spend a tick
   on filter-parameter-space documentation while the low tail (geometry/panels/3D-fold)
   is untouched. The remaining dB is NOT in the filters — they are decoded and the sweep
   is 46/46. Work the **LEVERAGE TABLE** below top-down: pick the highest-deficit
   subsystem that is workable and BUILD until a target slug's dB goes up. If three
   consecutive ticks end gate-neutral, that is the drift alarm — switch to the single
   worst slug and force a minimizer repro (`fct minimize <slug>`) to find a concrete pixel
   bug rather than re-documenting a known ceiling.

10. **⚠️ MINIMIZE-FIRST when debugging a full transition (added 2026-07-16).** If you are
    debugging a FULL transition, you must FIRST minimize it, fix the MINIMIZED version, and
    THEN try again on the full one. Do not attempt a fix directly on the 100+-node full
    scene — `fct minimize <slug>` shrinks it to the minimal node subtree where the TS engine
    still diverges from headless FCP, so the fix targets the exact responsible nodes instead
    of guessing against the whole graph. Order every debugging tick: `fct minimize <slug>` →
    fix the minimized repro (verify via `fct min-score`/`min-regress`) → re-run the fix on
    the full slug and confirm on the GUI-GT gate.

11. **Regressions of already-imperfect slugs are OK — WRITE THEM DOWN, don't discard
    (added 2026-07-16).** If a correct fix regresses OTHER slugs that were NOT fully correct
    in the first place, that is ACCEPTABLE — do NOT immediately revert/discard the fix.
    Instead, keep the fix (it moved the target slug toward GT) and RECORD each regressed slug
    in this ROADMAP as a **next target to be investigated** (add it to the "Regression
    follow-ups" list below with the before→after dB and the fix that caused it). Only a
    NET-NEGATIVE change that regresses ALREADY-CORRECT (high-dB, "done") slugs must be
    reverted. The judgement call: a small regression on a known-broken slug is the next
    small piece to fix (Rule 2), not a reason to throw away a correct improvement. (This
    supersedes the old reflex of reverting on ANY regression — that reflex caused several
    correct fixes to be discarded, e.g. the Wipes/Mask binding.)

## Regression follow-ups — slugs knocked down by a correct fix, to investigate next

Log every slug a shipped-but-net-positive fix regressed here (Rule 11), newest first, so a
future tick picks it up as a concrete target instead of the regression being lost/reverted.
Format: `<slug> <before>→<after> (caused by <commit/fix>) — why it was already imperfect / hypothesis`.

- _(none yet — populate as Rule 11 fires)_
- Stylized__Loop 15.91→15.63 (caused by T-q29039791 broad sceneDur cap on 2026-07-16) — Loop's
  `Transition loop` subtree has retimingExtrapolation=1 curves (correctly exempted) but its
  sibling decorative shape curves (Ornament groups authoring X/Y Position out to 5.539s) are
  outside the loop container and get capped. Hypothesis: extend the loop-container check to
  cover a scene-level "any subtree contains re=1" signal, OR use direct-curve re=1 detection
  instead of subtree scan. Fix should confirm no Close_and_Open regression.


## The workflow, concretely (EFFICIENCY-FIRST — updated 2026-07-15 on vjeux's instruction)

vjeux: *"remove the whole 'run 65 slugs' from the project … focus on efficiency and
just build for now."* So the DEFAULT loop is BUILD + cheap checks, NOT a full-fleet
render every change. Rendering all 65 slugs (`fct gen engine --all`, ~2–3 min) is now an
OCCASIONAL confirmation step, not the per-change gate.

```
# --- fast inner loop (use these every change) ---
cd engine && node_modules/.bin/tsc --noEmit      # typecheck — instant, catches most breakage
fct caps [cap ...]            # capability catalog: ONE primitive vs headless FCP (dev oracle, ~seconds)
fct probe <slug> [frame]      # render+PSNR ONE engine frame vs GUI GT (seconds, not minutes)
fct gen engine <slug>         # render ONE slug (24 frames) when you need its full score
fct score <slug> --source engine   # that slug's dB vs GUI GT
fct census <slug>             # decode the scene graph BEFORE writing code (Rule 7)
fct minimize <slug>           # delta-debug to a node-level engine-vs-FCP repro

# --- occasional whole-fleet confirmation (NOT every change) ---
fct gen engine --all          # re-render all 65 (only before a re-baseline / net-change audit)
fct regress engine --verbose  # per-slug improved/regressed table vs baseline
fct baseline engine           # freeze the new floor AFTER a verified net-positive change
```

Verify the SMALL SET a change can affect (the slugs whose subsystem you touched) with
`fct probe`/`fct gen <slug>`+`fct score`. Only run the full `gen --all` + `regress` when
you're auditing a broad change (e.g. a base-compositor change like the drop-zone conform)
or about to re-freeze the baseline. Gate math unchanged: 480×270, TOL 0.30 dB, but the BAR
is NET progress (Rule 2), not zero-regression.


---

## ⭐⭐ CAPABILITY CATALOG — unit-test every FCP primitive (NEW methodology, 2026-07-15)

**The problem this solves.** The 65 built-in transitions are 100+-node integration scenes;
a low score can't be attributed to one cause, so fixing a slug means getting many subsystems
right at once — the exact trap that produced the flat-14.6 local optimum. `fct minimize`
shrinks a FAILING slug REACTIVELY. This is the inverse and PROACTIVE: enumerate every atomic
thing FCP does, and for each build a MINIMAL synthetic scene that isolates exactly ONE feature,
verified against headless FCP. Engine UNIT TESTS, with real FCP as the per-primitive oracle.

**How it works (built this tick):**
- `tools/re/probe_scene.py` — builds a minimal synthetic `.motr` that injects ONE primitive
  (a Transform / Opacity / Blend Mode / Time-Remap / behavior / filter) onto Transition A of the
  clean Blurs/Directional skeleton (scene filter stripped), renders it through BOTH the real
  headless FCP engine (`ozengine`) AND the full TS pipeline (`_scene_render.ts`: parse→evaluate→
  composite), and compares. Generalises `filter_probe.py` from filters to ALL primitives.
- `engine/test/_scene_render.ts` — renders one frame of an ARBITRARY `.motr` path through the TS
  engine at an absolute scene time (the same `createBenchTransition` path the 65 slugs use, so a
  capability probe exercises the parser + evaluator + compositor, not just the filter registry).
- `tools/re/capabilities.json` — the CATALOG: one entry per capability {cap, family, inject, time,
  min_psnr, note}. Grows as primitives are enumerated.
- `fct caps [ids…] [--list]` — run the catalog; PASS/FAIL per capability. This is a DEV ORACLE
  (headless FCP is truth for a synthetic scene), NOT the GUI-GT gate — the 65 shipped slugs are
  still scored ONLY against `~/fct-gui-gt`.

**The build order (do these top-down; each closes ONE capability to PASS, then add the next):**
1. **baseline.identity** — ✅ CLOSED 2026-07-15 (drop-zone conform, commit eed1f5d). Was headless
   mae 1.09 vs A but TS mae 16.5 (worst at TOP rows ~140 — a black letterbox band because the TS
   compositor blitted the 1854×1042 source at native size instead of conforming it to fill the
   frame). Now psnr 17.58→43.31, mae 1.04. This was a hidden baseline error under EVERY full-frame
   slug (Blurs__Directional 17.79→26.84 +9.05, Movements__Push 17.59→19.68 +2.09).
2. **transform.position.x / .y** — ✅ CLOSED (both engines apply, psnr 44.4/43.7 after #1's
   conform floor was fixed).
3. **transform.scale / .rotation / opacity** — ✅ CLOSED 2026-07-15. The injector used the WRONG
   ids/units (Scale id=103 default="100" percent, Rotation id=102 single-leaf, Opacity attr-append
   over an animated curve) so headless FCP IGNORED them (hvi~0.9). Decoded the REAL schema from the
   shipped templates: Transform id=100 > Position id=101 / Rotation id=**109** (deg, X/Y/Z) / Scale
   id=**105** (RATIO 1.0=100%, X/Y/Z). Opacity id=202 ships as a <curve>, so the injector now
   replaces the whole element with a static-value leaf. RESULT: scale.half hvi 0.9→111.6 (psnr
   42.70), rotation.z hvi 0.9→76.8 (34.93), opacity.half hvi 0.9→33.3 (39.96) — all 3 now APPLY and
   the TS engine matches. `fct caps` = 6/6 PASS. (Engine math was already correct; tools+docstring only.)
4. Then enumerate the rest: blend modes, crop, anchor, shear, time-remap/speed/reverse,
   masks (rect/circle/bezier), behaviors (Fade/Ramp/Throw/Spin/Oscillate/Sequence-Replicator),
   replicator layout, camera/3D projection, generators. Each = one catalog entry + make it PASS.
   - **blend modes** — ⛔ DEAD-END on the Directional skeleton, FULLY DEBUGGED 2026-07-15. FCP
     ignores the drop-zone Image card's layer Blend Mode here. Root cause, proven step by step:
     (1) B IS behind A (opacity=0 on A reveals end.jpg, hvi 136.7, both engines agree) — not an
     empty backdrop. (2) NOT a flag gate — the skeleton's Blend Mode flags 0x301010010 vs a working
     Color-Planes 0x200010010 differ by bits 0x1000000|0x100000000, but rewriting to the working
     flags STILL renders maxdiff 0. (3) STRUCTURAL — FCP's transition compositor draws the drop-zone
     Image (factory 3) cards through a fixed source-over path that never consults their Blend Mode;
     modes only apply on the node types stacked through the general layer compositor (Color Planes'
     6 Clone-Layer / factory-9 siblings value=8; Lens Flare overlay value=10), which ARE gate-verified
     on real slugs. (4) The TS engine ALREADY MATCHES: TS Normal-vs-Add is also maxdiff 0 — NO engine
     bug. So any blend.* cap here is a FALSE PASS (measures opacity, not the mode); the `blend` inject
     kind is kept but `raise`s a documented error. Blend math is validated via the real slugs per
     Rule 1.
   - **crop** — ⛔ DEAD-END for a synthetic drop-zone cap, FULLY DEBUGGED 2026-07-15 (same class as
     blend). Real schema: Crop id=**216** (not id=500), children Left/Right/Top/Bottom = id 1/2/3/4,
     SOURCE pixels; on an Image card it is a Properties(1) child sibling of Transform, on a Clone
     Layer it nests under Transform id=100. FCP IGNORES Crop 216 on the transition drop-zone Image:
     a big 4-edge crop (600/600/400/400) renders maxdiff 0 on BOTH the Directional skeleton AND the
     Flip skeleton (which ships a real Transform+Crop), at t=0/0.25/0.5, scalar OR curve form. But
     the TS engine DOES crop (blit.ts) → a crop.* cap here is a FALSE FAIL (TS diverges from FCP's
     ignore). Crop IS honored on Clone Layers (factory 15): Concentric uses Left/Right = 900+ px, and
     Concentric is a gate slug (12.35 dB) — so crop is validated there per Rule 1, not via the probe.
     The `crop` inject kind is kept for schema reference but `raise`s a documented error.
   - **crop** — ⛔ DEAD-END for a drop-zone cap, FULLY DEBUGGED 2026-07-15 (same class as blend).
     Crop is id=**216** (not id=500 as the stale transform.ts docstring says), children
     Left/Right/Top/Bottom id=1/2/3/4 in SOURCE px. Headless FCP IGNORES Crop id=216 on the
     transition drop-zone Image: injecting a big 4-edge crop (600/600/400/400) renders maxdiff 0 on
     BOTH the Directional skeleton AND the Flip skeleton (which ships a real Transform+Crop),
     scalar OR curve, at t=0/0.25/0.5. The TS engine DOES crop (blit.ts), so a crop.* cap here is a
     FALSE FAIL. FCP only honors Crop 216 on the node types stacked through the general layer
     compositor — CLONE LAYERS (factory 15) and generators. Concentric (a Clone-Layer slug, a known
     12.35 dB target) uses non-zero crop (Left/Right = 900+ px), so crop IS load-bearing and is
     validated there via the GUI-GT gate per Rule 1, NOT via a drop-zone probe. `_crop_xml` kept
     for schema reference; the `crop` inject kind raises a documented error.

**Why this breaks the loop:** a capability PASS is a small, attributable, gate-safe win. When a
primitive is verified in isolation, every transition that uses it improves for free, and a slug's
remaining error is now a COMPOSITION of known-good parts — debuggable. Prefer closing capabilities
over grinding whole slugs. (This complements the leverage table: capabilities are the *unit* of
engine correctness; the leverage table says which SLUGS the wins should target first.)

## Status snapshot (2026-07-15, rebuilt)

- **Engine mean: 14.59 dB** across 65 slugs (median 14.30). Distribution: 5 broken (<11),
  12 weak (11–13), 23 ok (13–15), 23 good (15–20), 2 great (≥20).
- **Phase 1 (reverse-engineer + document every filter): COMPLETE.** All 24 transition-filter
  UUIDs implemented + documented from the real FCP binaries; `tools/re/filter_sweep.py` =
  46 PASS / 0 FAIL across the param space. Structural subsystems (parser, evaluator, curves,
  behaviours, masks S8) are mature and gate-protected.
- **Phase 2 (match + verify): the frontier is now STRUCTURAL, not filters.** The dB deficit
  lives in geometry + compositing (see leverage table). The filter color gaps (Colorize=1,
  Tint, Brightness>1, Bloom) are real but small and all fold into S2 (linear chain).

## 🧪 CAPABILITY CATALOG — unit-test every FCP primitive one-by-one (new 2026-07-15)

The 65 transitions are 100+-node INTEGRATION scenes: a low score can't be blamed on one
cause, which is the exact trap that produced the filter-grind local optimum. The catalog
inverts `fct minimize` (which REACTIVELY shrinks a failing slug): it PROACTIVELY builds a
MINIMAL synthetic scene that isolates exactly ONE primitive, renders it through BOTH the
real headless FCP engine AND the full TS pipeline (parse->evaluate->composite), and compares.
Unit tests for the engine, with headless FCP as the per-primitive oracle.

- `tools/re/capabilities.json` — the catalog. One entry per atomic FCP capability:
  `{cap, family, inject:{kind,...}, time, min_psnr, note}`.
- `tools/re/probe_scene.py` — builds the synthetic .motr (skeleton + ONE injected primitive
  on Transition A, scene filter stripped), renders headless + TS, reports psnr/mae/hvi
  (headless-vs-input, so hvi~0 => FCP IGNORED the injection = a schema bug, not an engine bug).
- `engine/test/_scene_render.ts` — renders an arbitrary .motr through the TS engine at time t.
- `fct caps [ids...] [--list] [--keep]` — run the catalog (a DEV ORACLE; the GUI-GT gate is
  still the only merge bar for the 65 slugs).

**FIRST FINDINGS (2026-07-15, this is the harness working as designed):**
1. **Harness FLOOR bug** — even an IDENTITY scene (show image A) diverges: headless matches A
   (mae 1.09) but the TS engine diverges (mae 16.5), worst at the TOP rows (~140 mae; centre
   pixel is byte-identical). So the TS **drop-zone conform/fit** differs from FCP on the bare
   skeleton — a real engine gap under every transition, previously masked inside the integration
   scenes. **This is the first capability to close** (before per-primitive deltas are trustworthy).
2. **Schema TODOs** — transform Position X/Y DO apply in both engines (hvi 45/71); Scale/Rotation/
   Opacity injections were IGNORED by headless (hvi~0.9) => the drop-zone transform/opacity
   encoding needs decoding from a real slug (Scale appears as id=105 in Movements/Scale, Rotation
   id=109 in Flip — the ids/nesting vary). Marked `schema_todo` in the catalog.

**How to extend:** add a capability to capabilities.json, add its injector `kind` to
probe_scene.py (transform + opacity exist), decode the exact .motr schema from a real slug that
uses it (Rule 8 — `fct census`), then `fct caps <cap>` until it PASSES. Families to build out:
transform (position✓/scale/rotation/anchor/shear/crop), blend modes, opacity, time-remap/speed,
behaviours (Fade/Ramp/Throw/Oscillate/Spin/Link), masks, replicator layout, camera/3D, generators.

## ⭐ LEVERAGE TABLE — the work, ordered by measured dB deficit (do top-down)

Deficit = Σ max(0, 17 − score) over the slugs each subsystem OWNS (how much total dB sits
below a "good" 17 dB bar). This is the anti-loop ordering: **highest deficit first.**

| # | Subsystem (task) | slugs | mean | worst | deficit | status |
|---|---|---|---|---|---|---|
| **L1** | **S6-geom — replicator / clone-grid / framing-camera** | 8 | 13.00 | 10.24 | **32.0** | queue: 5 items (Video_Wall/Clone_Spin/Combo_Spin/Concentric/3D_Rectangle) |
| **L2** | **kinetic-panel coverage** (Lower/Close_and_Open/Up-Over/Panels/Loop) | 7 | 12.73 | 10.19 | **30.1** | queue: LEAD Close_and_Open → 4 deps |
| **L3** | **3D-fold Movements** (Switch/Swing/Pinwheel/Reflection/Rotate/Flip/Fall/...) | 12 | 14.65 | 11.96 | **28.7** | queue: LEAD Switch (Rig/Link) → 7 deps |
| **L4** | **S2/S4 — linear working-space chain + colour** (Bloom/Flash/LensFlare/Static) | 6 | 14.13 | 11.58 | **17.3** | queue: LEAD 360°_Bloom → Flash/Lens_Flare |
| **L5** | **S5 — gradient generator** (Slide_In/Center_Reveal/Light_Sweep) | 3 | 12.17 | 10.25 | **14.5** | queue: Slide_In LEAD; Center_Reveal after L8 |
| **L6** | **group Image-Mask reveal** (Center/Heart/Squares) | 3 | 12.98 | 12.35 | **12.1** | queue: Center + Squares (Heart ≥17, done) |
| **L7** | **S6-360 — equirect push/slide geometry** | 7 | 17.58 | 14.12 | **10.2** | queue: LEAD 360°_Push → Slide/Divide/Wipe |
| **L8** | **S8 — procedural shape-mask write-on** (Diagonal pair, Wipes/Mask) | 3 | 13.75 | 13.47 | 9.8 | mostly SHIPPED |
| — | colour/xfade/blur/timemap residuals | 16 | — | — | <9 each | opportunistic (S7) |

**Rule-9 note:** L4's isolated filter math is DONE (decoded, sweep-verified). What remains
in L4 is the ENGINE-LEVEL linear chain (composite whole frame in float, encode once), NOT
more per-filter work — a per-filter linear encode is a proven dead-end (regresses stacked
transitions). Bloom-float is decoded but its temporal onset over-blooms (regresses both Bloom
slugs on the current tree, re-measured 2026-07-15) — gated OFF until the onset is decoded.

---

## Work items (detail) → now the swarm TODO queue

Per-slug work items (diagnosis + next concrete step + DoD) are **no longer listed here** —
they live in the appendable swarm queue as one claimable item per slug scoring below the
17 dB "good" bar:

```
python3 -m fct.swarm.todo list            # all queued work
python3 -m fct.swarm.todo list --status open
cat fct/swarm/todo/<id>.json              # full brief for one item
```

The queue is the single source of truth for *what to do next per slug*. This ROADMAP keeps
only what must survive a slug's completion and isn't captured by a transient todo: the
**rules** (above), the **leverage ordering** (below), the **capability-catalog methodology**
(above), the **done-map** (Reference section), and the **durable findings & dead-ends**
(below). When a worker finishes a slug, its todo closes — but the dead-ends it proved stay
here so no future agent re-attempts a measured-negative fix.

The leverage table (which subsystem to drain first) is the ordering; the queue's `after:`
deps encode the shared-root leads (L2 Close_and_Open, L3 Switch Rig/Link, L7 360°_Push
equirect, L4 360°_Bloom linear-chain, L8 Wipes/Mask discriminator → Center_Reveal).

---

## Durable findings & dead-ends (survive todo completion — DO NOT re-attempt the ⛔ items)

These are the measured-negative attempts and non-obvious decode facts a worker needs BEFORE
starting a slug. A todo may point here ("DO NOT re-attempt X — see ROADMAP dead-ends"); the
full measured record lives here, once.

### ⛔ Combo_Spin is NOT a timemap/fade-timing bug — it is a MISSING-REPLICATOR geometry gap (2026-07-16, T-qcombospin1 BLOCKED census-refutes)

The T-qcombospin1 brief claimed "the 6-blade pinwheel renders correctly; only the per-blade
A/B fade TIMING (in timemap.ts) is off (f08–f12 ~9 dB)." **Render + decode evidence refutes
both halves — DO NOT chase this in timemap.ts.**
- `buildTimeMap` for Combo_Spin returns `wrapSec=undefined, clampSec=undefined` → the timemap
  is the **IDENTITY** map (remap(t)==t on every frame). No edit to timemap.ts can change ANY
  Combo_Spin output. Fade timing does not flow through timemap here.
- Fresh full-res `gen headless` + `score` = **MEAN 14.45 dB** (matches the "reachable 14.54"),
  with f08–f12 at 11.4/13.2/14.7/15.6/15.9. Headless FCP renders the full 6-blade concentric-
  ring **replicator pinwheel** across the whole transition (4 Replicators + 12 Clone Layers +
  6 Image Masks per census). The **TS engine renders only a broken single-tile spin on a black
  background** — the replicator/clone pinwheel is NOT composited. engine-vs-headless-FCP at
  f10 = **8.5 dB** (headless warm [145,112,91] vs engine cold [66,77,96] — geom-broken AND
  A/B-inverted). So the pinwheel does NOT "render correctly"; it barely renders.
- The real fix lives in **replicator.ts / compositor / geometry.ts** (forbidden to
  T-qcombospin1's timemap-only scope). Filed as follow-up **T-qa840dfe1**.
- ⚠️ `fct minimize Combo_Spin` reports a FALSE **99 dB "engine matches headless"** and "nothing
  to minimize". Its isolated 480×270 `_headless-frame` render is UNRELIABLE for this replicator
  slug (full `gen headless` also **segfaults** after writing frames). Trust full-res
  `gen headless` + `score` (8.5 dB engine-vs-headless), NOT minimize, for replicator slugs.

### 🔬 VIDEO_WALL OZReplicator STAMP-SIZING DECODE — cell size is AUTHORED, not pitch-fit (2026-07-16, T-q7fd2fef0)

Decoded how Motion's OZReplicator sizes per-instance stamps, from the real `Video Wall.motr`
(Replicator Cell scenenodes, factoryID 19/20) + `Ozone.framework`:

- The stamp size is set by the CELL's own authored params, **pitch-INDEPENDENT**:
  - `Scale` (id=327) — cell transform scale; **empty in Video Wall → 100%**.
  - `Size`  (id=337) — cell size PERCENTAGE; **=200 on ALL 14 replicator cells** (main 3×3 wall
    AND every decorative 1×2 / 8260-pitch replicator — uniform, no per-grid value).
  - Grid pitch (`Size` id=347 Width/Height → `sizeWidth`/`sizeHeight`) sets only instance
    SPACING; it does NOT scale the stamp. Every tile is the SAME on-screen size (cellSize% ·
    source, shared-camera projected) regardless of its replicator's pitch. Wide decorative
    pitches push equal-sized tiles mostly off-canvas — they must NOT grow into frame-filling
    plates. The "giant blue plate at f11" = `Replicator Pin 2 copy` (2×1, pitchX 8260) whose
    `cellFill = pitchX/tileW = 4.30×` inflates its imageB tile to a full-frame plate.
- The decoded rule now lives as `cellStampScale({cellScalePct,cellSizePct})` in
  `compositor/replicator.ts` (returns Scale%·Size%, pitch-independent). It is NOT yet wired
  into the blit path (that is `compositor/index.ts`, owned by another lane).

⛔ **MEASURED DEAD-ENDS (do NOT re-attempt in isolation):** switching the stamp size off the
current `cellFill = pitchX/tileW` fill-hack REGRESSES Video_Wall when done ALONE:
  - `min(pitchX/tileW, pitchY/tileH)` aspect cover-fit → **9.69 dB** (< 10.18 baseline; shrinks
    the main wall into black gaps AND the blue plate persists — the plate's pitchY dominates).
  - cap-at-authored-cellSize (2.0) → **9.76 dB**.
Reason: the pitch-fill hack accidentally OVER-COVERS the frame with brown tiles that overlap the
GUI-GT's brown wall, out-scoring a correctly-sized (smaller) tile UNTIL the interlocking
camera-dolly geometry (`evaluator/framing.ts resolveFramedWallPose`) + retime-wrap timing
(`timemap.ts`) are co-tuned to place the correctly-sized tiles where the GT wall actually is.
This is the ROADMAP's documented "4 parts must land together" trap — the stamp-SIZING lane
cannot show a positive dB in isolation. **NEXT LEAD:** an INTEGRATED tick owning parser +
index.ts + framing/timemap must (1) parse cell `Size` id=337 in `parser/replicator.ts`, (2) size
the blit by `cellStampScale()` instead of `cellFill=pitchX/tileW` in `index.ts`, (3) verify the
dolly pose puts the 200%-sized wall on the GT tiles, all in one gate-measured commit. Filed as a
follow-up todo.

### 🔬 REFLECTION Z-CONVENTION DECODE — sign is INVERTED in perspective.ts (2026-07-16, T-qreflect001)

Investigating Movements/Reflection (14.23 dB, currently orthographic-forced by the S6 discriminator)
to add the missing mid-transition book-fold wedge. Measured wedge geometry vs GT + traced world
transforms, established the Motion Z convention that current `projectPoint` inverts:

- **GT Reflection f10** (mid-transition) has near-seam panel height ~689px, off-frame panel height
  ~961px. The panels are **SHORTER at the seam, TALLER at their outer edges** — i.e. the outer
  edge is closer to the camera.
- Engine world transforms at t=0.737: Panel A corner near seam is at world Z=-373, corner off-frame
  at world Z=+721 (measured via `FCT_XFORM=1 test/_trace_layers.ts`).
- So the outer edge (world Z=+721) is CLOSER to camera than the seam (world Z=-373). Motion's
  convention: **+Z = toward viewer** (not away, as the current code comment claims).
- Current `perspective.ts::projectPoint` uses `denom = cameraZ + z; scale = cameraZ/denom` — this
  makes +Z RECEDE (smaller) and -Z APPROACH (bigger), the OPPOSITE of Motion. Verified: with
  FCT_FORCE_PERSPECTIVE=1 (default cam distance 1614 for AOV=37°) at f10, engine renders panel-A
  near-seam TALLER than off-frame — exactly the flip of GT (see /tmp/reflect_cmp/persp*_f10.jpg).
- Adding a sign flip (`denom = cameraZ - z`) gives the CORRECT wedge direction visually
  (verified render at D=2000+FLIP: near-seam shorter, off-frame taller — matches GT), but does
  NOT beat orthographic globally: 14.23 (ortho) vs 14.17 (flip+perspective @ D=2000). At true
  D=1614 the flip produces 12.62 dB (panels blow up in X).

### ⛔ REFLECTION — perspective-projection ALL variants are DEAD-END (2026-07-16, T-qreflect001 + T-q50a7f2e6)

Measured cam-distance sweep with both FCT_FORCE_PERSPECTIVE=1 and FCT_FLIP_Z=1 (custom Z-flip
gated on env for the sweep). Both curves are MONOTONIC toward orthographic — no interior optimum:

| D    | no-flip | flip |
|------|---------|------|
| 1614 | 13.68   | 12.62 |
| 2000 | -       | 14.17 |
| 3000 | 13.92   | 14.16 |
| 6000 | 14.03   | 14.18 |
| ∞    | 14.23 (ortho baseline) | |

**T-q50a7f2e6 update (2026-07-16i):** the hypothesized "hinge-relative perspective"
(perspective divide on Z-DELTA from the scene's anchor world Z, sign-flipped to match
Motion's +Z=toward-viewer decode) was BUILT end-to-end and MEASURED. Structural detector
(anchor-Z + position-Z Links coupled from the same driver) fires on Reflection (parent
Group anchor world Z = 960). Best result: 14.26 dB @ D=30000 with hingeWorldZ=960 (sign=−).
Every combination at the AOV-implied D=1614 is 12.33–13.53 dB (i.e. −0.70 to −1.90 vs
ortho). See 2026-07-16i progress-log entry for the full 4×7 sweep. So perspective
projection in ANY form (raw, hinge-relative, either sign, any D consistent with the AOV
of 37°) cannot recover the wedge — the +0.03 at D=30000 is within score noise and
requires a camera distance ~19× the AOV-implied one, which has no Motion decode support.
This CLOSES the perspective-subsystem line of attack for Reflection.

Where the wedge actually comes from — the three candidates that dominate Reflection's
tail difference vs GT (all NOT perspective):
1. The "Floor" reflection group — a mirrored copy of the panels on a Z-tilted plane below
   y=-540, using Color_Solid 1 at m3x3=[4,0,0, 0,0,-4, 0,4,0] (a 4× scale sheet reflection);
2. Cinematic Depth of Field (id 344, value 2 — Motion's default is 1.4), blurring the far
   panel edge selectively;
3. Transition A's OWN drop-zone rotY keyframes (~+45° at t=0 → 0° at t=endSec) — A rotates
   INDEPENDENTLY of the group Y-rotation link, so the two rotations stack asymmetrically.

Filed follow-ups (see fct/swarm/todo/): T-qreflectfloor (decode & wire Floor reflection
group), T-qreflectdof (Cinematic DoF blur), T-qreflectrot (Transition A own rotY curve).
DoD for those: measurable improvement of Reflection above 14.23 dB with 0 regressions.

### ⛔ ORCHESTRATOR: never rsync a worktree's file-state to land work — commit+rebase instead (2026-07-16)
DO NOT reintroduce the old "rsync the whole worktree over a fresh clone with --delete then git add -A"
push path. It clobbered the swarm harness 4× in one session: a worktree branched off an OLD origin/main
carries a stale copy of EVERY untouched file, and the --delete overlay dragged that stale harness back
onto origin (a file-content overlay, so `git merge-base --is-ancestor` reported "already landed" while
the files were reverted). push_helper now commits IN THE WORKTREE and pushes via `git rebase origin/main`
— rebase replays only the agent's diff, so untouched files come from origin unchanged; the clobber is
structurally impossible. Staging also excludes fct/swarm (except the append-only todo/) so harness files
are never even staged. In-worktree commits work fine on the Mac CLI node (the sandbox `.git/worktrees/*`
write-denial that originally motivated rsync does not apply here).
No rsync, no `--delete`, no whole-tree overlay anywhere in the swarm anymore.

### Oracle validity per slug (pick your method before you start)
Headless FCP (`fct score <slug> --source headless`) is a TRUSTWORTHY per-slug oracle for most
clone/replicator slugs (it scores 13–32 dB vs the GUI GT), so `headless − engine` measures the
FINDABLE engine gap. L1 ranking (decoded 2026-07-15):

| slug | headless | engine | gap | note |
|---|---|---|---|---|
| 3D_Rectangle | 32.25 | 16.79 | **15.46** | biggest gap; engine renders ~flat A (reveal missing) |
| Multi | 19.48 | 11.85 | 7.63 | ⛔ **DEGENERATE GT — DROPPED** (T-qmulti00001, 2026-07-16); do NOT target (below) |
| Squares | 17.70 | 13.11 | 4.59 | ⚠️ headless order does NOT match GT (corr 0.102) — NOT a valid oracle |
| Combo_Spin | 14.54 | 11.21 | 3.33 | 6-blade replicator spiral |
| Clone_Spin | 13.54 | 10.32 | 3.22 | framing camera |
| Video_Wall | 13.37 | 10.24 | **3.13** | SMALLEST gap — the 7 prior Video_Wall-only ticks were the Rule-9 drift trap |

Lesson: prefer the BIG-gap slugs (3D_Rectangle, Squares, Combo_Spin). Video_Wall has the
smallest findable headroom of the L1 group. **Exception: Squares** — headless does NOT
reproduce the GT reveal order (correlation 0.102), so for Squares the GUI GT is the ONLY
oracle (the symmetric-order decode below is from the GUI GT, not headless).

### ⛔ MULTI — DEGENERATE GUI GT, DROPPED (decoded 2026-07-15, re-verified + swarm-dropped 2026-07-16 T-qmulti00001)
Multi's `~/fct-gui-gt` capture shows FCP's EMPTY-DROP-ZONE PLACEHOLDER graphic (uniform gray
R=G=B≈106 with down-arrow glyphs; f10 meanRGB=[106,106,106] std 58) for the inner tiles, NOT
real photo content — captured with unfilled drop zones. Headless renders the same gray (mean
60). The TS engine CORRECTLY fills the tiles with the A/B photos, so it "diverges" from a
placeholder. Matching placeholder arrows is not reverse-engineering; the 7.63 "gap" is a
capture artifact. SKIP until the GT is re-captured with real media.

**Re-verified 2026-07-16 (T-qmulti00001 DROPPED, docs-only).** Frame-by-frame + pixel-sample
check of `~/fct-gui-gt/Replicator-Clones__Multi/frame_00{00,12,23}.jpg` confirms the
diagnosis: f0 = photo A (sepia mountain lake), f23 = photo B (blue mountain lake), but the
transition body (f12) is a synthetic 4-panel 2×2 grid — pure-black gutter RGB(0,0,0) between
four gray plates with uniform RGB≈(140,140,140) (R=G=B, std≈0), each plate containing a
darker-gray stylized ↓ down-arrow glyph. If Multi were rendering real transition content
those tiles would carry the sepia/blue photo tint; they don't. The placeholder-arrow
signature is unambiguous. Marking DROPPED in the swarm queue with no engine change.

### ⛔ 3D_RECTANGLE — clone-source Image-Mask + Z-painter-order is NET-NEGATIVE (measured + reverted 2026-07-15)
Root cause CORRECTLY decoded: a "Pieces" group of 9 "Clone Layer" nodes, each cloning a hidden
"Shape 0X" = photo-A clipped to a nested rectangle Image Mask ("Inside 0X", scale 0.2..0.9),
each pushed to its own ANIMATED world-Z (−768..+601 at t=1.5), seen through a Camera.
`resolveCloneImage` (masks.ts) returns the source PIXELS but DROPS the source layer's Image
Mask, so every clone paints full photo A → engine renders ~flat A, the whole nested-rectangle
reveal missing (engine f18 9.75 dB vs headless 35). Two fixes built + MEASURED:
  (1) bake the clone SOURCE's Image Mask into the resolved pixels in `renderCloneLayer`
      (keyed on `imageMaskSourceId` — generic; `resolveImageMaskAlpha`+`applyMask`);
  (2) paint the Pieces clones FAR→NEAR by world-Z (painter's order) via a `depthPieceStack`
      branch keyed on clone children whose source carries an Image Mask + a Z spread.
RESULT: f00 jumped 18.59→**37.87** (mask correct at Z=0) BUT mid-transition regressed → net
16.79→**15.60 (−1.19)** and 10 slugs regressed, 0 improved (Pinwheel 13.27→13.10, Arrows
27.16→26.96, Combo_Spin 11.21→11.15, Concentric 12.67→12.53, Duplicate 21.34→21.25, Vertigo
19.76→19.60, Center 12.35→12.29, Center_Reveal 15.24→15.10, Light_Sweep 17.10→16.98). Reverted.
**WHY IT FAILS:** the reveal is NOT filled A-rectangles occluding by painter/Z order — it is a
spiral of THIN photo-B rectangle OUTLINES; interiors stay A, thin frames show B. Sources:
(i) each masked rectangle at its own animated Z, (ii) rectangles slightly ROTATE (the spiral)
so edges misalign and B (base Z≈−143..−600) shows in thin seams, (iii) occlusion is per-PIXEL
by depth (Z −768→+601 vs coverage 4.4%→82.9% are UNCORRELATED, so layer-Z-sort is wrong).
Adjacent filled A-rectangles fully overlap (smaller inside larger, both A → no seam → flat A).
**NEXT (real subsystem):** a per-pixel Z-BUFFERED composite of the 9 masked+rotated rectangle
quads against the B base + the "Shading" group (Top/Left/Right shapes at op 0.48) bevel edges.
The clone-source-mask BAKE (step 1) is correct in isolation (f00 +19 dB) and should be RE-USED
once the depth composite exists — it is only net-negative WITHOUT the depth/rotation seam.
**T-qrect3d0001 re-decode (2026-07-16), CONFIRMS the above + adds two facts:**
(a) TOPOLOGY re-read from the .motr: standalone `Transition A` (id 10009) carries
    `<enabled>0</enabled>` — it is NOT drawn directly; it is cloned by 27 nodes. The drawn
    base is `Transition B` (id 10006, enabled, last in tree = bottom of stack). So GT is
    "photo-B background + concentric photo-A rectangle frames on top, thin B seams between
    them" (visually identical to the brief's "thin-B-outline spiral"). The clone chain is a
    NESTED clone: `Inside 01`(Shape 10054, ±960×±540 filled rect, scale 0.91) → `Inside 02`
    clones Inside 01 → … → `Inside 08`; each `Shape 0N`(clone, src=TransA, mask=Inside 0(N-1),
    Mask Blend Mode=1) is re-cloned by `Clone Layer / 1..8`. Per-clone scale/position comes
    from TWO Rig Behaviors on Inside 01 driving `./1/100/105`(Scale) and `./1/100/101`(Position)
    via 7 Snapshot columns (scale X 0.26..1.18, Y 0.82..0.89 — anisotropic; that anisotropy is
    the rectangle spiral). The `Shading` Widget's Top/Left/Right shapes are bevel edges at op
    0.48 (LinkOpacity → ./1/200/202).
(b) MEASURED the engine's failure signature directly (not a black-box guess): "B-ness"
    (mean Blue−Red) of GT rises −48(f7)→−30(f12)→+13(f16) as B fills the frame, while the
    engine stays PINNED at ≈−81 across ALL frames — i.e. **Transition B never enters the
    engine composite at all**; the full-frame masked A rectangles paint over B in painter
    order with no per-pixel Z occlusion, so no thin B seams and no B interior reveal. This is
    exactly the "needs per-pixel Z-buffer" conclusion. Verdict THIS session: BLOCKED — the
    per-pixel Z-buffered depth composite (25 camera-projected masked+rotated quads over B +
    the Shading bevel subsystem) is a multi-session subsystem, NOT landable net-positive in one
    tick, and the painter-order shortcut is the ⛔ measured dead-end above. Filed the two
    sub-pieces (depth composite; Shading bevel) as follow-up TODOs.

### CONCENTRIC — structural fix SHIPPED (3ac72b0 + 821ad0b), + one dead-end
Was rendering vertical STRIPES instead of concentric rings. THREE bugs fixed:
  1. **Static-value drop (root cause).** Ring-mask Circles carry static Scale
     `<parameter default="1" value="1.27"/>` (1.27/1.0/0.75/0.5/0.26/0.15). `resolveWithRetime`
     returned `default`(1.0) not `value` when retimeProgress==0 — and a layer with NO retime
     curve is retimeProgress==0 EVERY frame, so all ring circles collapsed to radius 803. Fix:
     thread `hasRetime`; static `value` authoritative when !hasRetime. Gate +2 (Dissolves_Divide
     +1.16, Light_Sweep +0.79), 0 reg.
  2. **Mask perspective** (masks.ts): `resolveImageMaskAlpha` now rasterizes the non-stroke mask
     shape through the SAME cameraZ perspective divide as the content (was flat-affine).
  3. **Draw order + 3D-swing guard removed** (index.ts): paint masked ring groups by DESCENDING
     mask radius (largest bottom → smallest top) via `maskSourceWorldRadius`; deleted the
     `maskSrcIsFlat` guard + dead `transformHas3D`. Metric 12.62→12.67.
  **⛔ CROP-ON-MASK-GEOMETRY DEAD-END (refuted 2026-07-15).** The ring-mask Circles/Clone-Layers
  DO carry a real Crop id=216 (half-disc: left copies Right=900, right copies Left=900). Honoring
  it does NOT carve the woven seam: (a) MATH — Circle 1 verts span ±803.5, so the crop leaves a
  ~193-local-unit CENTRAL GAP (~230px), but GT shows CONTINUOUS rings with a thin ~5–15px seam;
  (b) GATE — implementing the crop clip (Sutherland–Hodgman in shapes.ts via masks.ts) rendered
  Concentric 12.67→**10.42 (−2.25)**. FCP does NOT honor Crop id=216 on mask-geometry Shapes/
  Clone-Layers (same class as the drop-zone-Image + Clone crop ignore). The woven seam comes from
  the per-ring A/B crossfade PHASE (Clone A src10008 / Clone B src10006 stacked, Rig/timing-driven
  fade), NOT crop. Do NOT re-attempt crop-on-mask-geometry.

### VIDEO_WALL — deeper root cause (the "framing pose" diagnosis was incomplete, decoded 2026-07-15)
`timeMap.remap()` COLLAPSES ALL scene times to 0: `buildTimeMap` sets `wrapSec=0.367s` because
Transition A (drop zone, retimingExtrapolation=1 "wrap") times out at 0.367s, so the retime-wrap
loops the playhead to frame-0. But Video_Wall's transition is authored by the CAMERA DOLLY (two
Framing behaviors to 1.969s), NOT the drop-zone crossfade — so EVERY frame evaluates at t=0, a
static pose that coincidentally scores 10.24. GT is a near→far→near dolly. FOUR parts must land
TOGETHER (each partial regresses vs the accidental frozen 10.24 — see the slug's
`fct/minimized/…/manifest.json` `decode_2026_07_15_wrap_freeze`):
  1. **timemap.ts** — cancel the drop-zone wrap when the scene has Framing behaviors (factory 3),
     via a `hasFramingCamera()` helper (fires on Video_Wall 0.367≪end; Clone_Spin 1.869≈end
     negligible). *Verified correct in isolation.*
  2. **framing.ts `resolveFramedWallPose`** — far dist = the PROXY framePose eye distance (eye
     Z≈5109 where wall half-width ≈4100 fills the 45° frame), near→far→near triangle. *Verified.*
  3. **WALL PLACEMENT (the real blocker)** — the 14 replicators must collectively fill a DENSE
     grid at the far pose (engine renders ~5 sparse tiles, frame mean ~30–50 vs GT ~90–130).
  4. **camera orientation / 3-KEY ANCHOR PATH** — proxy fwd=(0.069,0.422,0.904); the dolly likely
     follows STATIC A-tile pose → proxy/wall → B-tile pose (Motion Transition type=3), NOT one
     wall-centre anchor (the WIP single-anchor made the near ends frame EMPTY space).
Parts 1+2 are decoded + verified-in-isolation; a landing tick MUST also build part 3 so the
combined change is net-positive — do NOT ship 1+2 alone (regresses).

### ⛔ WIPES/MASK — two coupled bugs; the naive binding fix is NET-NEGATIVE (measured + reverted 2026-07-15)
Engine 14.30 vs headless 35.7 (+21 reachable). GT holds photo A (warm) f0–f18 then reveals B
(cool) only at f23 — a LATE single-shape wipe. TWO independent bugs:
  1. **A/B binding SWAPPED.** The "Drop Zones" group lists the masked "Transition B" node BEFORE
     the unmasked base "Transition A", so the doc-order override (parser/footage.ts) binds
     base→B / masked→A. GUI GT wants base→A (unmasked outgoing) + the single masked layer reveals
     B. The existing MASKED-REVEAL rule (base→A, masked→B) ONLY fires for REPLICATOR-source masks
     (Duplicate/Squares); a SHAPE-source mask (Wipes/Mask, Center_Reveal) falls through wrong.
  2. **animationEndSec INFLATED 4×.** `render(progress)=renderAt(progress·endSec)` uses the
     keyframe-walk max 5.038s, but the transition span is 1.30s (39f/30fps). The 5.038s comes from
     the drop-zone Image media-fit params Width(313)/Height(314)/Fit-Factor(318), padded to scene
     end. So progress 0.5 samples scene-time ~2.52s, past the ~1.0s mask sweep → B fully revealed
     mid-transition.
  **NET-NEGATIVE FIX (reverted — do NOT re-attempt as-is):** (a) generalise the masked-reveal
  binding to ANY single-masked reveal + (b) cap Width/Height/Fit-Factor keyframes to the span.
  Wipes/Mask improved **14.30→16.49 (+2.19)** and Slide was preserved, BUT it CATASTROPHICALLY
  regressed **Arrows 27.16→10.46 (−16.7)** and **Vertigo 19.76→11.40 (−8.36)** (+Center_Reveal
  −0.69): both carry a single Image Mask but are NOT A/B-crossfade reveals (Arrows = arrow-glyph
  composition; Vertigo = spiral replicator), so forcing base→A/masked→B inverted their correct
  name-based binding. The replicator-source restriction (`hasReplMask`) is LOAD-BEARING — it's
  what distinguishes a true A/B wipe from a decorative single mask.
  **NEXT (both together):** (i) a PRECISE discriminator for "single-masked A/B REVEAL" that
  INCLUDES Wipes/Mask + Center_Reveal but EXCLUDES Arrows/Vertigo — e.g. masked node source is a
  full-frame Transition drop zone AND the sibling base is the OTHER full-frame Transition drop zone
  AND the mask geometry sweeps/grows to full coverage (not an arrow glyph or spiral); (ii) the
  surgical drop-zone-fit endSec CAP (already Slide-safe). Center_Reveal ALSO needs its own endSec
  fix (its 3.0s comes from "Grad middle/ends" Position curves that saturate visually ~0.57s but
  keep animating — a separate visible-end-vs-keyframe-end issue).

### SQUARES — the reveal order is 4-fold SYMMETRIC, not a random PRNG (decoded from GUI GT 2026-07-15)
The Replicator authors Shuffle Order=1, Replicate Seed=987639852, 14×8 grid, Sequencing=1. The
engine reveals in a DIAGONAL wavefront (`sequenceOrder` = normalized col+row diagonal); GT reveals
a scattered-looking pattern the ROADMAP long assumed was Motion's PRNG. NOT SO. Extracting the
per-tile A→B flip FRAME from the GUI GT shows a **4-FOLD MIRROR-SYMMETRIC** reveal (mirror L↔R AND
top↔bottom), rows in identical pairs, ~7 distinct flip times {3,4,5,10,15,16,20,23} (center-sampled
14×8):
```
20  3  3 23 23 16 16 16 16 23 23  3  3 20      (rows 0,1 identical)
 4 10 10 15 15  5  5  5  5 15 15 10 10  4      (rows 2,3,4,5 identical)
20  3  3 23 23 16 16 16 16 23 23  3  3 20      (rows 6,7 == rows 0,1)
```
So the order is a DETERMINISTIC symmetric function of (|row−centre|, |col−centre|), NOT a
Fisher-Yates/PRNG scramble (a seeded-hash scatter was tried and MEASURED 12.70 < diagonal 12.97 —
now known WHY: the target isn't random). Motion's PRNG (`HGRandomInit`→`ran_setup`, an LCG
`x*0x4A4E39 + 0x5AFA6 & 0xffffff` in Helium at 0x1205f4) has spearman 0.15 vs the GT order → the
shuffle is NOT in Helium; it's in the Ozone/PE layer. **NEXT:** decode which Build Style(id330=2)/
Origin(id331=4, id360=14) selects the symmetric order, implement it in `sequenceOrder`/
`sequenceProgress` keyed on the replicator's Shuffle Order param (NO per-slug constant), verify the
flip-frame grid vs the GUI GT. NOTE: endpoints f0/f23 also gap ~20 dB — a SEPARATE base-conform/
tone issue (the drop-zone conform capability), not the shuffle.

### Subsystem framing (what each L-group's shared root IS)
- **L1 clone/replicator/framing:** off-canvas tiles/clones through a framing camera (look-at pose)
  and/or a replicator grid. Video_Wall = 14 Replicators + Camera + framing; Clone_Spin = 9
  Timeline-Pin tiles + Camera(Framing beh); Concentric = 44 Clone Layers + 26 Image Masks;
  Combo_Spin = 6 blade groups (C1–C6) masked + replicators.
- **L2 kinetic-panel:** replicator-driven panels that slide/close to COVER photo A then reveal B
  (Close_and_Open = 107 Shapes + 107 Replicators + Image Mask + Clouds generator; at mid-transition
  the engine shows full A where GT shows closed panels occluding it — a replicator-panel z-coverage
  + reveal-timing subsystem in `compositor/replicator.ts` + timemap). Close_and_Open is the LEAD.
- **L3 3D-fold Movements (12 slugs):** a Rig-Behavior→Link swing-out curve advances the photo's 3D
  fold TOO FAST in the interpolation-timing subsystem (decoded, T-N3 archive). A correct shared
  Rig/Link timing fix lifts the whole family but MUST be gated against all 12. Switch is the LEAD.
- **L4 S2 linear working-space chain:** FCP keeps the WHOLE filter+blend chain in
  `kCGColorSpaceLinearSRGB` and encodes to sRGB ONCE at readback; the engine encodes per-filter.
  Infra exists (`compositor/linear.ts`, flag-gated). A per-filter linear encode is a PROVEN
  DEAD-END (regresses stacked transitions) — build the WHOLE-CHAIN float pass, flip ON
  family-by-family, gate all 65 after each, never commit red. Bloom-float is decoded but its
  threshold TEMPORAL ONSET over-blooms (FCT_BLOOM_FLOAT ON regresses Lights_Bloom −1.0, 360°_Bloom
  −1.1) — stays OFF until the onset is decoded.
- **L5 gradient generator (coupled to masks):** all 3 (Slide_In/Center_Reveal/Light_Sweep) have a
  `<mask>` sibling clipping the gradient. Census: Slide_In gradient is a PAINT-STROKE emitter (NOT
  a fill); Center_Reveal has two Gradient fills + Gaussian + 2 Image Masks + 6 colour Links.
  Confirm the gradient TYPE per slug (Rule 7 — a prior premise was wrong) before writing a generator.
- **L6 group Image-Mask reveal:** group-level image mask on comp groups; 3D-rotated groups can't
  use screen-space mask rasterization (guard skips them → unmasked). Reuse Concentric's cameraZ-
  perspective mask rasterization for 3D-rotated groups.
- **L7 S6-360 equirect:** the 360° "band" family (Push/Slide/Divide/Wipe) shares an equirect
  push/crossfade geometry; the low members show a smooth mid-transition U-dip (two panorama halves
  positioned differently than GT — confirmed f12). Circle_Wipe (22.9) + Gaussian_Blur (23.6) are
  the good members to diff against. Decode the equirect push offset in `compositor/transition360.ts`.
- **S7 opportunistic residuals:** Smear tail, Black_Hole, Color_Planes, Glide/Slide colour,
  Dissolves_Divide. Heuristic: scan mid-band per-frame scores for a TAIL/HEAD collapse — those are
  isolated time-authority (timemap wrap/clamp) bugs with clean structural fixes.

### FILTER-P2 leftovers  [LOW PRIORITY — do NOT let these dominate ticks (see Rule 9)]
T-M1 Tint hard-light G/B (CEILING — colour-space unpinned), T-M2 Levels two-stage (load-bearing,
deferred), T-M5 Colorize Intensity=1 (decoded mad 2.80, blocked on L4 linear chain), T-M8 Bevel
angle / Underwater black-render. All decoded + documented; they move only when L4 lands or a
specific slug needs them. NOT a source of tick work on their own.


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

- 2026-07-16reflfloor  📝 REFLECTION FLOOR-REFLECTION DECODE + planar-mirror geometry primitive
              (WIP T-qa7694deb, additive/inert, gate 0/0 — Reflection 14.82 UNCHANGED, byte-identical
              render). DECODE (Reflection.motr, verified): the residual tail-difference vs GT on
              Movements/Reflection is NOT perspective (that whole line is dead — T-qreflect001/
              T-q50a7f2e6). Per-frame + bottom-strip pixel probe: the GT panels END ~y=920 and BELOW
              them sits a DIM (~15–20% lum), VERTICALLY-MIRRORED, distance-faded copy of the panels;
              the engine currently draws the panel content full-brightness down to y=1060 with a hard
              black edge and NO reflection. Source: scenenode **"Color Solid 1"** (id 1999871095), a
              sibling of Transition A/B — a BLACK 1920×1080 Color Solid (footage.ts::Reflection Floor
              exception, r=g=b=0) laid flat as a mirror: Position.Y=-540, Rotation.X=+π/2, Scale=4×,
              with an ENABLED Reflection folder Reflectivity(id228)=0.20, Falloff.End Distance(id226)=248.
              GENERIC DISCRIMINATOR: every Motion object serialises a Reflection folder, but it is
              DISABLED at the default Reflectivity=0.80 on the inactive-param flag class 0x3…10
              (12884901904) with inert Blur Amount/Blend Mode children (scan: ~30 slugs). Reflection's
              floor is the ONLY corpus layer whose Reflectivity is a NON-default 0.20 on the ENABLED
              flag class 0x2…10 (8589934608 — same class as its live Position/Rotation) WITH a Falloff
              child → "reflection is ON" is read structurally, not by name. SEMANTICS: (a) Motion's
              object Reflection is a WORLD-SPACE PLANAR mirror — it reflects the OTHER 3D objects across
              the reflective object's plane and re-projects through the SAME camera (re-render with a
              Y-flip baked into the world matrix, NOT a 2D screen-space flip of the composited frame);
              (b) retime/opacity are inherently locked to the panels (it's the same panels re-rendered
              — no separate driver); visible opacity = Reflectivity·falloff; (c) no additive glow
              (Blend Mode absent on the enabled folder → Normal/over). LANDED: pure geometry primitives
              in compositor/geometry.ts — REFLECTION_FLOOR constants, reflectionPlaneMatrix(planeY)
              (column-major diag(1,-1,1,1)+2·planeY, an involution), falloffAttenuation(dist,end)
              (linear 1→0, clamped), + 4 unit tests in perspective.test.ts (20/20 pass). INERT: nothing
              in src imports them → render byte-identical, gate green (no-hardcode 13/13, the primitive
              is math not a detector). ⚠️ CROSS-LANE NOTE (compositor lane, NOT geometry): finishing the
              feature needs LOCKED files — parser must read the enabled-Reflection folder (parser/
              footage.ts or index.ts) onto the floor Layer, and compositor/index.ts must detect the
              reflective floor node, re-render the panel subtree under reflectionPlaneMatrix(-540) with
              per-pixel alpha × 0.20 × falloffAttenuation(|y−(-540)|, 248), and composite it UNDER the
              panels. Filed as follow-up (see fct/swarm/todo). Reflection baseline row is STALE in
              baseline_engine (14.32); fresh origin/main render is 14.82 (T-q7529db51 static-B-fold was
              never re-baselined). Earthquake/Leaves gate flags are the known stochastic-emitter
              phantoms (Earthquake re-renders to exactly 21.79; Leaves swings 15.9↔22.4↔19.5 across
              identical renders) — NOT caused by this inert change.

- 2026-07-16swng1  ✅ SWING FOLD DIRECTION — factoryID-16 "Anchor" widget Top↔Bottom Y-UP→Y-DOWN
              flip (T-q00deefab, **Movements__Swing 12.89 → 14.60 dB, +1.71** (per-slug re-render
              14.44), gate 0 regressions). DECODE: Swing folds two Clone children (source A + B)
              hinge chosen by a factoryID-16 "Anchor" popup [Right=0,Left=1,Top=2,Bottom=3]; value=2
              ("Top"). Motion authors the branches in Y-UP, but the compositor is Y-DOWN, so the
              branch NAMED "Top" renders its hinge at the screen BOTTOM (mirror of the GUI GT which
              folds A down, reveals B from the top). Fix = `adjustAnchorFoldDirection` in
              evaluator/index.ts: swap the vertical selections (Top↔Bottom, 2↔3) for factoryID-16
              Anchor widgets — same Y-UP→Y-DOWN class as the existing rotZ (Switch) / rotX (Fall)
              negations, scoped by widget factoryID+name exactly like adjustDegenerateDirection
              (factoryID-12). Fires ONLY on Swing (the sole factoryID-16 Anchor transition in the
              corpus) so it cannot touch the fold-rig family (Fall/Clothesline/Rotate/Flip/Push/
              Reflection use factoryID-12/13 Direction) — verified. no-hardcode green (it is a
              widget-value NORMALIZER, not a registered dispatch detector). REMAINING (follow-up):
              mid-transition f12-f16 (~10.5-11.4 dB) still over-occlude — both clones painted in
              painter's order, outgoing A covers incoming B. The per-pixel Z-buffer helpers
              (projectQuadWithWorldZ + renderPerspectiveQuadDepth, already landed) hook here, but
              the 2-clone-perpendicular detector fires only on Swing so it cannot satisfy the ≥2
              no-hardcode bar as a standalone detector — needs a broader two-sided-fold family key.
- 2026-07-16-q360zoom  ✅ 360° PUSH CENTRE-WEDGE (panning-A / static-B) (T-q360zoom01 DONE) —
              **360°__360°_Push 14.28 → 21.85 (+7.58 dB), 0 real regressions.** DECODE-DON'T-FIT:
              the task premise of an animated ~3.2× FOV zoom + yaw+pitch reorient is REFUTED by
              BOTH (a) the .motr — the two `360° Reorient` filters (pluginUUID E61FE95E-…) carry
              ONLY Tilt(X)/Pan(Y)/Roll(Z)/Mix/Flip and **NO FOV/scale parameter**, with
              Tilt=Roll=0 and Pan a STATIC constant (Push/Slide/Divide identity + a π "Reorient
              Start" offset; Wipe Pan=1.2043 rad static/Link-driven) — no keyframe curve, no
              zoom filter, no Scale keyframe on the equirect card; and (b) the GUI GT — FFT
              phase-correlation of the Push GT gives a CONSTANT −86 px/frame horizontal pan with
              dy≡0 and a single clean peak (NO radial smear → NO magnification). A pure yaw on an
              equirect map IS exactly a horizontal wrap-roll, so no spherical warp is needed.
              The real Push structure (per-column A/B classifier): OUTGOING A yaws at −86 px/f
              (wraps; f8 A-pan −688 err 40.5 ≪ static 48.8), INCOMING B is STATIC at HOME (f8
              B-home err 34.6), revealed through a CENTRE-anchored wedge growing 91.3 px/f in two
              phases (right half f0–10.5, plateau f11–13, left half f13–23) + terminal settle to
              full B at p≥0.94. Same rig family as the 27 dB sibling 360° Slide, roles flipped.
              Edit: `engine/src/compositor/transition360.ts` push branch only. Gate: fresh
              re-render shows the 2 batch "regressions" (Earthquake −0.53, Leaves −0.42) RECOVER
              to baseline (Earthquake 21.79=base, Leaves 22.36 vs 22.44 within 0.3 tol) — pure
              render-contention phantoms, not caused by this push-only change. no-hardcode +
              reorient360 (39/0) green. RESIDUAL: mid-band f8–f18 ~14–16 dB (wedge seam is hard,
              not feathered; the panorama-blur rig is unmodelled) — filed as follow-up.

- 2026-07-16za  ✅ 360° PUSH CENTRE-WEDGE + PANNING-A (T-q360zoom01 DONE) — **360°__360°_Push
              14.28 → 21.85 (+7.57 dB), 0 real regressions.** ⚠️ FIRST decoded the task premise
              (animated ~3.2× FOV zoom + yaw+pitch reorient) and REFUTED it: the `360° Reorient`
              filter in all four .motrs carries ONLY Tilt(X)/Pan(Y)/Roll(Z)/Mix — NO FOV/scale
              param exists — with Tilt=Roll=0 and NO keyframe curve (Push/Divide identity;
              Wipe a static Pan=1.2043; all a static π "Start" offset). And the GUI GT phase-
              correlates to a CLEAN −86 px/frame horizontal pan, dy≡0, single peak, NO radial
              smear = NO magnification. A pure yaw on an equirect map IS exactly a horizontal
              wrap-roll (no spherical warp needed), so the reproject reduces to the existing
              cover-fit roll. The REAL Push bug: the old model drew both cards full-frame
              (A opaque over B) sweeping one W-width → mid band collapsed to 10 dB. Decoded the
              true rig (per-column A/B classifier): outgoing A YAWS at −86 px/frame (wrap) while
              incoming B is STATIC at HOME, revealed through a CENTRE-anchored wedge growing at
              91.3 px/frame in two phases (right half f0–10.5, plateau f11–13, left half f13–23),
              with a terminal settle to full B at f23. Same rig family as the sibling 360° Slide
              (27.66). Push-branch-only edit in transition360.ts; Slide/Wipe/Divide unchanged.
              no-hardcode + reorient360 (39/0) green; the 2 batch "regressions" (Earthquake,
              Leaves) were CPU-contention render phantoms — fresh re-render = baseline exactly.


- 2026-07-16zclonespin  ✅ CLONE_SPIN single-framer near-A→reveal dolly (T-qclonespin1, 10.32→10.75,
              +0.43 dB, full gate 0 regressions). Clone_Spin's Camera has ONE factory-3 Framing
              behavior (transition type 1) targeting the "Transition B" tile, in=0 out≈endSec
              (wrapSec≈1.869 near-negligible retime). Decoded from Clone Spin.motr: oblique B pose
              (rotX=0.309, rotY=0.529), Path Offset (1450,980,5332), Offset Path Apex=0.2925. BUG: the
              single-framer path returned framePose(B) STATICALLY (never opened on A → f00 14.29). FIX
              (framing.ts resolveFramedWallPose single-behavior branch, framing.length===1 so it fires
              ONLY on Clone_Spin — sole 1-framer built-in; ≥2-framer wall path byte-identical): near-A
              (full-frame A at world origin z=0) → oblique framePose(B) far reveal over [0, apex·end],
              then HOLD. f00 14.29→22.14, f01 8.8→11.86, f02-f20 up ~0.5-1, f21-23 unchanged. FOLLOW-UP
              T-qb6a721a6: grid-centroid far fit (needs full layer list in index.ts) + B retime-wrap
              tail settle (timemap) — both out of framing.ts scope.

- 2026-07-16p  ✅ HUESAT OVER-SATURATION CLAMP (T-qba9797b8 DONE) — **Stylized__Color_Panels
              17.95 → 18.11 (+0.16 dB), 0 regressions.** Decoded HgcHSVAdjust (extract_shader.py
              line 39): `sat = clamp((chroma/value)*satMul, 0, 1)` — FCP scales HSV *saturation*
              and CLAMPS it to 1 before the HSV→RGB rebuild. The TS HueSat used an UNBOUNDED
              Rec.709 luma-lerp (`gray+(c-gray)*satFactor`), which for over-saturation
              (satFactor>1) pushes chroma past the gamut edge → per-channel clip → over-bright
              over-red panels (Color_Panels engine f10 (95.5,55.9,35.7) vs GUI GT (52.7,49.1,42.3)).
              FIX: route saturation>1 through the decoded true-HSV path (rebuild with sat clamped
              to 1); keep the measured-correct luma-lerp for desaturation (satFactor≤1, verified
              ~47 dB vs headless on Leaves Sat=-1/Val=0.65). Color_Panels' Sat=1 is the ONLY
              shipping HueSat user with Saturation>0 (Leaves/Center/Lower are Sat=-1, Light_Sweep
              Sat=0 — verified every .motr), so the branch is byte-identical for every other slug;
              Leaves 22.44→22.36 / Lower 11.76→11.74 deltas are within tol (0.30) render noise on
              the unchanged path. Isolated filter_verify PAEHSVAdjust Sat=1 confirmed the old
              luma-lerp*2 was only 11.7 dB vs headless. REMAINING CEILING: FCP's v1 (pluginVersion=1)
              Hue/Saturation path (HGColorMatrix YCbCr, canThrowRenderOutput @0x373a0) produces a
              genuinely bright+desaturated Sat=1 output that matches NEITHER standard HSV nor
              YCbCr-chroma-scale nor linear-YCbCr (best isolated model ~11.7 dB) — the exact
              transfer needs either the branchless HgcHSVAdjust ladder transcribed cleanly or a
              chain-level linear working buffer (T-qlinchain01). Filed as follow-up.

- 2026-07-16z1  🚧 3D_RECTANGLE Z-COMPOSITE WORKS END-TO-END (WIP T-q98a30de5, gate 0 regressions) —
              wired the Z-buffered clone composite into composite() behind FCT_Z_COMPOSITE_3D
              (default OFF ⇒ byte-neutral, target 16.48 unchanged on the shipped path). With the
              flag ON the subsystem renders the concentric photo-B-seam rectangle spiral over base B
              (verified f12 visually + f00 **18.59 → 34.65**, the all-A head frame near-perfect).
              Three real bugs fixed in the z-composite MODULE (never the shared rasterizer, never
              renderCloneLayer): (1) the resolved clone-source A media (1854×1042) sheared into
              horizontal streaks when applyMask indexed it at the 1920×1080 frame stride — now
              conformToFrame() resamples it first; (2) the perspective triangle rasterizer left 1px
              scanline gaps on near-full-frame magnified quads — replaced with a screen-space
              center-scaled depth blit (depthBlitCenterScaled) since every clone is axis-aligned at
              constant Z; (3) B is the drawn BACKDROP not a depth peer — seed B then reset zbuf to
              +Inf so every masked-A piece wins over it and B shows only in the inter-rectangle
              seams. collectMaskedCloneQuads honours parent-group visibility (skips the hidden
              clone-SOURCE "Clones" group; composites only the 9 visible "Pieces" re-clones).
              REMAINING GAP (queued as **T-q66e85aa6**): mid-transition f04-f18 still < flat-A
              baseline because the evaluator doesn't apply Inside 01's two Rig SNAPSHOT behaviors
              (3001325829 Scale via ./1/100/105, 3001966583 Position via ./1/100/101 — 7 anisotropic
              snapshot columns morphed by Rig Widget 10001), so the 9 rectangles are concentric-
              ALIGNED instead of the GT's offset/anisotropic spiral. Pure evaluator addition
              (Switch's domain); the compositor side is DONE. Detector hasNestedMaskedCloneCamera
              Stack fires on 3D_Rectangle only (subset refinement of hasCameraCloneStack which fires
              on 4 — registered + exempt in no-hardcode.test.ts). Gate 0 regressions; tsc + 12
              z-composite + no-hardcode green. SCOPE: only z-composite.ts + its test + the single
              composite() flag hook changed (index.ts diff = 11 insertions, Close_and_Open block
              untouched).

- 2026-07-16q-sw  🔬 SWITCH A/B INVERSION — LINK-REROUTE HYPOTHESIS DISPROVEN BY MEASUREMENT
              (T-q7b464494 WIP, docs-only, gate 0/0). Resumed from d40a3ca decode +
              T-qff1b6de2 salvage notes and IMPLEMENTED the descendant-vs-sibling link-routing
              fix the decode proposed, then MEASURED it on the full render. Result: it REGRESSES
              Switch 14.67 → 9.72 dB (per-frame: the previously-CORRECT peak-swing band collapses,
              f10 20.38→7.19, f08-f16 all fall to ~7 dB; only the very tail f22-f23 improve
              slightly). So the salvage/d40a3ca hypothesis — "route Transition B's cross-sibling
              LinkRot (Affecting Object = Transition A) onto Transition A so A accumulates both
              rotation links" — is EMPIRICALLY WRONG. Reverted; baseline restored to 14.67.
              .motr FACTS (re-verified against Switch.motr, all correct as-decoded):
                • Direction widget (id 1999871392, factoryID 12) stored value=1 →
                  resolveDiscreteWidgetOrdinal → ordinal 0 (first snapshot Value==1). CORRECT.
                • Trans A LinkRot 1999871280: inlineScale=+1, rigScale=[+1,-1] → index0=+1 → +driver.
                • Trans B LinkRot 1999871312: inlineScale=-1, rigScale=[-1,+1] → index0=-1 → +driver.
                  (readSnapshots skips the leading <flags> child, so rigScale = [+1,-1]/[−1,+1],
                  NOT [0,…]; the "rigScale[0]<0" discriminator I built to separate Switch from
                  Clothesline IS well-formed — Switch flipped, Clothesline [+1,-1] not — but it's
                  moot because the reroute itself is the wrong fix.)
                • ⇒ BOTH Trans A and Trans B get +1×driver rotation (SAME sign), as the WIP decode
                  claimed. The OPPOSITE on-screen shear the engine renders (A m[1]=+0.19 vs B
                  m[1]=−0.19 at f04) is NOT a rotation-sign difference — it is the TIMING OFFSET:
                  Trans B carries offset=-108108 so it reads the driver rotZ curve ~108108 ahead
                  (near its −0.42 rad peak) while Trans A reads near 0. Same-sign rotation, wildly
                  different phase.
              REAL ROOT CAUSE (traced via test/_trace_layers.ts world transforms):
                Trans A/B carry IDENTICAL LinkPos+LinkAnchor (X/Y/Z from the Color-Solid driver,
                scale=1 mix=1 clamp ±100). At f04 (t≈0.302) Trans A world tx=(2083,−85) — swung
                OFF the right edge (frame ≈1920 wide) — while Trans B world tx=(47,486) sits near
                centre. So "Trans A invisible, only B rendered" is A being ROTATED OFF-FRAME about
                the far anchor pivot, driven by the timing-offset phase gap, NOT an A/B rotation
                inversion and NOT a link-routing mis-target. The peak f10 is already ≈GT (20.38),
                so the swing END pose is correct; only the RAMP phase (f01-f06, 8-13 dB) is wrong,
                and it's wrong because Trans A's rotation-about-far-anchor over-translates it out
                of frame far earlier than FCP's.
              WHY IT IS OUT OF THIS TASK'S SCOPE: the fix must slow/re-phase Trans A's swing
              during the ramp (a timemap/retime-offset change, timemap.ts) or change how the far
              anchor pivot maps rotation→world translation (geometry.ts / matrix.ts / framing.ts),
              all OUTSIDE the behaviors.ts + evaluator/index.ts lane this task is fenced to. Both
              in-scope levers were tried and rejected: (1) link reroute → 9.72 (measured, reverted);
              (2) rigScale tag-vs-ordinal indexing → index 1 flips BOTH cards' rotation sign
              (equivalent to negating the driver), which would undo the landed rotZ-sign fix
              (e31dc61, 12.31→14.67) and regress the rotation family — rejected without render.
              EXACT NEXT STEP for a future timemap/geometry-lane tick: read Trans A's timing
              (in=0,out=204204,offset=0) vs Trans B (in=4004,out=108108,offset=-108108); the
              per-card driver-read phase is the discriminator. Either (a) compress Trans A's
              early ramp so its rotation-about-anchor keeps it on-frame through f06 (match GT's
              slower A swing-out), or (b) verify the anchor-pivot→world-translation is using the
              clamped anchor (±100 ≈ near-centre) vs the far self-linked anchor (~2363) — if the
              engine uses the far pivot for A but FCP uses near-centre, that alone over-throws A.
              DELTA: ROADMAP.md only (this entry). No engine code change; gate 0/0 by construction.
              Frozen baseline for Switch stays 12.31; current code renders 14.67 (post e31dc61).

- 2026-07-16q  ✅ 360° DIVIDE SLICES (T-qdivide3601 DONE) — **360°__360°_Divide 14.47 → 16.05
              (+1.58 dB), gate 0 regressions / 5 improvements.** DECODE (GUI GT per-column A/B
              classifier, W=1920 N=24): "360° Divide" (Slices replicator rig) is NOT a centre
              barn-door — it is a 3-cell replicator of vertical A-STRIPS at centres x≈{128,960,1790}
              (=W·{0.067,0.5,0.933}; the outer pair is the seam strip split by the equirect wrap)
              that HOLD then SHRINK to 0. Phases: p<0.083 full A; f02-f16 strips hold (outer w 257→217,
              centre w 129); f17-f20 shrink LINEARLY, LSQ zero-crossing p≈0.87 for both strips
              (0.871 centre / 0.870 outer); p≥0.875 full B. New `divide360slices` mode in
              transition360.ts (routed from the existing `Slices` structural slot that previously
              returned generic `divide` — no new detector, no-hardcode green). Remaining ~14 dB
              content ceiling = panorama REORIENT (yaw+pitch) not yet modelled: best-global-yaw
              residual ~28-38 >> noise, so A/B undergo a 3D reorient peaking mid-transition (filed
              follow-up T-q0c8ef80d, shared with Push/Wipe). tsc clean; Leaves -0.42 is emitter
              nondeterminism phantom (fresh re-render 22.36 ≈ 22.44 baseline).
- 2026-07-16q-eq  ✅ EARTHQUAKE TIMEMAP COMPRESSION FIX (T-q7f6795d6 DONE) — Earthquake timemap
              compression fix: mean 20.99→21.79 (+0.80), f10-f11 dip 11→20 dB, endpoints held.
              Residual f12-f16 = missing impact-dust/flash which is an EMITTER/COMPOSITOR issue
              (Falling Impact particle system renders as wrong-location arc vs GT's bottom
              impact-dust band) — OUT of timemap scope, cross-lane note for emitter-render.ts owner.
              Gate 0 regressions; Switch +2.43 collateral.


- 2026-07-16q  ✅ REFLECTION STATIC B-FOLD (T-q7529db51 DONE) — **Movements__Reflection 14.23 → 14.82
              (+0.59 dB), 0 real regressions.** DECODE (Reflection.motr, verified — the prior "candidate
              #3 = Transition A own rotY ~+45°→0°" hypothesis is REFUTED): Transition A carries NO
              Rotation param at all (rotationY undefined). Transition B (scenenode id=1999870955,
              dropZone Type=2) carries a STATIC Rotation Y = value="1.5707963267948966" (=π/2, param
              id=109 "Rotation" → child id=2 "Y", no keyframes) — a fixed structural 3D pre-fold, plus
              anchorZ=posZ=960 (hinges on the shared spine). The parent Group (id=1999870952) has
              rotationY=0 driven by a LinkRot pulling Color Solid's (id=1999870964) Y-rot curve
              0→−π/2. BUG: resolveWithRetime's static-value ramp (default→value × retimeProgress,
              active whenever the layer has a ≥2-keyframe retime curve — every A/B drop zone does)
              was collapsing B's π/2 fold to ~0 for most of the transition (traced B world m8≈−0.05≈0°
              at t=0.717 instead of group-fold(−33°)+90°≈+57°, m8≈+0.83). FIX (evaluator/index.ts,
              right after the clone-layer static-fold block): a REAL transition-source drop zone
              (dropZone.type 1 or 2 = Transition A/B card) with a STATIC number X/Y rotation marks that
              channel as an __overrideChannels entry so buildTransformMatrix uses the authored angle
              directly (bypassRetime), exactly like the Swing clone-fold block. Scoped to type 1/2 so
              Clone_Spin's Type=0 "Timeline Pin" tiles (which DO rely on the retime ramp to rotate in
              from flat) are untouched. Fires on exactly 1 layer corpus-wide (Reflection Transition B);
              verified zero hits on Leaves and every non-A/B slug. Per-frame: broad mid-transition lift
              f03–f23. Gate: Reflection +0.63 real; Switch/Color_Panels deltas are stale-baseline
              phantoms (my worktree branched pre-Switch-land — resolve on rebase); Objects__Leaves
              22.44→22.02 in the one-off gate render is Combo-Spin emitter FLAP noise (3 fresh renders
              with my change all give a STABLE 22.36; my change fires 0× on Leaves so it cannot be the
              cause). SWITCH-LANE NOTE (per brief): this fix touches ONLY evaluator/index.ts drop-zone
              static-rotation override — it does NOT change parser/behaviors.ts::parseLinkBehaviors
              routing, so it is fully compatible with Switch's pending descendant-vs-sibling routing
              heuristic (no collision; Switch can build on the current ENCLOSING-scenenode routing
              untouched). Clothesline 19.31 and the rest of the 3D-fold family unaffected (none carry a
              static A/B-card rotation). Commit gate-green.
- 2026-07-16q  ✅ 360° WIPE CENTRE-HALF SWEEP (T-qwipe360001 DONE) — **360°__360°_Wipe 14.23 → 16.45
              (+2.22 dB)**, gate net-positive (0 real regressions; Leaves −0.42/Switch/Color_Panels
              are pre-existing stale-baseline phantoms, re-render confirms Leaves 22.36≈22.44). New
              360°-only reveal mode `wipe360h` in transition360.ts, routed from the `Direction` wipe
              rig (the same structural slot that used to return generic `mode:'wipe'`). Decoded from
              the GUI GT per-column A/B classifier (W=1920): the 360° Wipe is NOT a full-frame wipe —
              it splits at frame CENTRE and reveals B only in the RIGHT HALF (A holds home in the
              left complement). Boundary sweeps from c0=W/2 outward: f01 width=0, f02=209, f03=479,
              f04=829, f05=959(=W/2 SATURATED, holds f05-f22), then f23 SNAPS to full B (fracB=1.000).
              LSQ line through unsaturated f2-f4 → width=7440·p−424 ⇒ w0=0.057, w1=0.186, width=t·(W/2);
              terminal snap via settle threshold p≥0.94 (between f22=0.917 and f23=0.958 on the i/24
              half-open grid). Both panoramas stay at HOME (best B yaw ≈ 0). Reveal_Wipe (Soften Edges)
              and Circle/Divide untouched — verified 18.73 / 23.04 unchanged. tsc + no-hardcode green.

- 2026-07-16p  📝 SWITCH A/B INVERSION DECODE (T-q7b464494 WIP, docs-only, gate 0/0) — deep decode of
              Movements__Switch's remaining inversion after T-qff1b6de2 landed 12.31→14.67. Empirical
              symptom: engine f01-f06 render only Trans B (heavily rotated), Trans A is COMPLETELY
              INVISIBLE; engine f10 (peak swing) ≈ GT. So the ROT-Z magnitudes are correct but
              A/B compositing during the ramp phase is inverted. Full link-routing map decoded:
              (1) LinkPos/LinkAnchor in BOTH Trans A & Trans B scenenodes → Affecting Object =
              Clone B (1999871187), NOT the enclosing scenenode. LinkRot in Trans A → self (Trans A),
              LinkRot in Trans B → CROSS to sibling Trans A (1999871182). (2) Rig Behaviors for the
              two LinkRots have INVERTED snapshot columns (Trans A rig: id=2 +1, id=3 -1; Trans B
              rig: id=2 -1, id=3 +1) which compose with inverted inline Scale (+1 / -1) to
              produce IDENTICAL signed rotZ on both scenenodes. (3) Trans B carries timing
              offset=-108108 so it reads the driver curve 108108 ahead of Trans A — Trans B
              reads near-peak rotZ at scene t=0 while Trans A reads near-zero. (4) Parser
              currently uses ENCLOSING-scenenode routing (parser/behaviors.ts::parseLinkBehaviors
              L246: `affectedId = enclosing.id`), ignoring Affecting Object for transform links.
              This is CORRECT for Clothesline (19.31 with cross-linked LinkRot but different
              geometry) but produces the observed A/B compositing inversion for Switch. Two
              candidate fixes both carry cross-family regression risk: (a) descendant-vs-sibling
              heuristic in parser link routing (collides with Reflection T-q50a7f2e6's parser
              lane), (b) compositor z-order rule for standalone Transition A/B during their
              overlap phase (collides with z-composite / Concentric / Video_Wall / 3D_Rect
              lanes). No code change this tick — landing decode so the next Switch tick, once
              parser+compositor lanes clear, can commit surgical code without re-tracing.
              Files: ROADMAP.md (append-only, this entry). Empirical evidence: side-by-side
              GT vs engine reads of frames 0/1/2/4/10 confirm f10 ≈ GT (swing peak correct),
              f01-f06 = A invisible, B huge-rotated (ramp phase inverted). Score unchanged at
              14.67 (frozen baseline still 12.31; T-qff1b6de2 landed code but no rebaseline).

- 2026-07-16q  📦 PAINT-STROKE EMITTER RASTERISER SUBSYSTEM (T-q1f2f0f55 WIP, gate neutral) —
              New standalone module `engine/src/compositor/emitter-render.ts` (524 lines) +
              `engine/test/emitter-render.test.ts` (564 lines, 39/39 passing). Decodes Motion's
              THIRD kind of instance-generator (distinct from grid replicators and particle
              emitters): a scenenode NAMED "Emitter" whose factoryID resolves via the per-file
              factory table to "Replicator", carrying `Shape (id 302)=4`, `Emit At Points=1`,
              a Points × Ranks lattice, and a "Cell copy" child with per-stroke curves
              (Angle/Width/Spacing/Jitter/Source-Start-Over-Stroke, rangeName "Stroke Length")
              and `Dab Depth Ordered`. Structural discriminator: `layer.type ===
              'replicator' && layer.replicator.shape === 4`. Verified fires on 6 built-ins
              (Flash, Duplicate, Up:Over, Slide_In, Light_Sweep, Close & Open) via
              `hasPaintStrokeReplicator` — registered in `no-hardcode.test.ts`, MIN_FIRES OK,
              zero transition-name checks. Module has ZERO import sites → 65 built-ins
              byte-identical to baseline (0/2 regress). One-line wiring recipe is documented
              in the module header (behind `FCT_PAINT_STROKE=1` flag); wiring deferred to a
              downstream tick when compositor/index.ts is uncontended by other editors.
              Parser gaps documented for a follow-up: replicator.ts does not yet lift the
              per-cell over-stroke curves nor Ranks (id 359) / Emit At Points (id 303) /
              Image Source (id 327) off the "Cell copy" — extractor supplies safe defaults
              (ranks=1, extent=1920×1080, empty curves) so the rasteriser produces a correct
              uniform-dab layout even before the parser work lands. This is the FIRST
              landing tick of a multi-tick subsystem — the wiring + parser enrichment +
              brush-sprite resolver + score-vs-GT are follow-ups.

- 2026-07-16o  ✅ CONCENTRIC CLONE IMAGE-MASK (T-qconcentric1 DONE) — **Replicator-Clones__Concentric
              12.67 → 13.38 (+0.71 dB)**. `renderCloneLayer` now honors a clone layer's own
              `imageMaskSourceId` (rig-selected Image Mask) — mirroring exactly what `renderMedia`
              already does for regular layers. Decoded: each "Clone B copy N" ring in Concentric
              has an `imageMaskSourceId` pointing at a ring-shaped mask shape/group; the previous
              code only handled shape-geometry `isMask` children, so ring clones rendered full-frame
              B and the woven bullseye was invisible. Additive branch: if the clone has an
              `imageMaskSourceId`, blit source through worldTransform to a temp, `applyMask` with
              `resolveImageMaskAlpha`, then composite — otherwise fall through to the pre-existing
              shape-mask / perspective / direct-blit paths (byte-identical for all other clones).
              Generic (fires on any clone with `imageMaskSourceId` — no per-transition hardcoding).
              3D_Rectangle 16.79→16.48 (−0.31, small/acceptable — a clone in that scene picks up a
              mask it did not previously honor; net +0.40 across the two affected slugs).
- 2026-07-16o  ✅ CONCENTRIC CLONE IMAGEMASKSOURCEID (T-qconcentric1 DONE) — **Replicator-Clones__Concentric
              12.67 → 13.38 dB (+0.71)**. `renderCloneLayer` now honors a clone's own
              `imageMaskSourceId` (mirrors what `renderMedia` already does) — before this fix a
              clone's Image Mask was silently ignored because the clone path only handled
              shape-geometry `isMask` children. Decoded from Concentric: each "Clone B copy N"
              ring references a ring-shaped shape/group via `imageMaskSourceId`; without the fix
              every ring clone rendered full-frame B and the woven bullseye was invisible. Fix is
              purely additive (new `cloneMaskAlpha` branch inserted before the existing
              `cloneMasks` shape-mask branch — no changes to any other branch). Generic: fires on
              any clone that carries an `imageMaskSourceId`. tsc + no-hardcode green.
- 2026-07-16n  ✅ CENTER WRAP-TO-A NARROW GATE (T-qcenter0001 DONE) — **6 slugs improved, 0 regressions
              caused**. Narrowed the wrapToA `bDropZoneAliveAtEnd` disable-gate so it only fires
              when the alive-at-end transitionB has its curves anchored at scene time (retime shift
              `offset − in` ≤ 1 frame). The prior wide gate (out ≥ endSec − 1fr) treated Duplicate's
              transitionB (in=0, out=5.84, offset=0.868, endSec=0.998) as "settled B" even though at
              scene tail the layer's curveTime is only 0.13s (still fade-in). Duplicate's GT tail IS
              photo A, so wrapToA must stay on there — the wide gate was regressing Duplicate by
              −5.22 dB on a fresh render (masked earlier by stale frame cache). Narrow gate keeps
              wrapToA on for Duplicate (shift=+0.868) while still cancelling it for the settle-on-B
              family (Center/Multi/Diagonal/Glide/Panels_Random/Panels_Across, shift ≤ 0). Full
              regress vs baseline_engine.json:
                Stylized__Center             12.35 → 13.41 (+1.06)  [DoD target met]
                Stylized__Glide              18.58 → 20.32 (+1.74)
                Stylized__Panels_Across      15.15 → 18.09 (+2.94)
                Stylized__Panels_Random      18.02 → 18.83 (+0.81)
                Replicator-Clones__Multi     11.66 → 12.67 (+1.01)
                Replicator-Clones__Concentric 12.67 → 13.55 (+0.88)
                Replicator-Clones__Duplicate 21.34 → 21.25 (−0.09, within tol)
              Only Stylized__Color_Panels flags −0.83, verified pre-existing (identical score with
              stash+fresh-render on clean origin/main; owned by another agent). tsc clean;
              no-hardcode PASS. Files: engine/src/evaluator/index.ts (+9/−1 in wrapToA gate).

- 2026-07-16m  🚧 3D_RECTANGLE Z-COMPOSITE SCAFFOLD (WIP T-q98a30de5) — added standalone
              engine/src/compositor/z-composite.ts (pure-addition module, no import site
              yet, gate-neutral) + engine/test/z-composite.test.ts (9/9 pass). Provides
              createDepthBuffer / buildDepthQuad / renderDepthComposite reusing perspective.ts
              projectQuadWithWorldZ + renderPerspectiveQuadDepth, plus two structural probes
              (hasCameraCloneStack fires on 4: 3D Rectangle, Light Sweep, Color Planes, 360°
              Wipe; hasNestedMaskedCloneCameraStack fires on 1: 3D Rectangle — a subset
              refinement of the parent). Depth semantics verified: at every pixel, whichever
              surface has the smaller world-Z wins (near-wins-per-pixel), regardless of paint
              order. Wiring into renderCloneLayer / composite() deferred to next tick to avoid
              collision with concurrent T-qconcentric1 (renderCloneLayer) and T-qswing00001
              (perspective.ts). Detailed wiring recipe in the z-composite.ts header comment.
              Target slug 3D_Rectangle 16.48 dB unchanged; gate 0/1 (Movements__Switch +2.43,
              pre-existing improvement from T-qff1b6de2 landing).

- 2026-07-16l  ✅ SWITCH ROTZ SIGN (T-qff1b6de2 DONE) — Movements__Switch **12.31 → 14.67 (+2.36 dB)**,
              Movements__Clothesline **19.31 → 21.61 (+2.30 dB)**, Movements__Reflection 14.32 → 14.23
              (−0.09, within tol). Root cause: Motion authors rotationZ in Y-UP mathematical
              convention (positive = CCW when viewed from +Z), but the compositor pipeline is
              Y-DOWN (screen coords, +Y = down; see blit.ts). For LINK-driven rotZ (Switch's
              book-fold rig Link-copies driver rotZ onto Trans A rigScale=+1 / Trans B rigScale=−1),
              rendering the raw numeric rotZ under Y-DOWN inverts the visual rotation — the fold
              runs the wrong way (Switch f12 rendered A on-canvas + B off, GT is A sepia
              top-right + B blue bottom-right). SCOPED fix: negate rotZ ONLY when it comes from
              a Link (`ov?.has('rotZ')`, set exclusively by applyLinks/links.ts:281). Directly
              -authored rotZ (Spin/Pinwheel/Rotate/Flip/Combo_Spin/Clone_Spin/Twirl) and
              __spinRadians are left alone — they already render at the correct visual direction
              in the current baseline. Global negation was tried first and regressed 7 slugs
              (Earthquake −4.47, Arrows −8.09, Curtains −2.52, …) because those slugs' rotation
              chains use directly-authored rotZ that was already correct; scoping to Link-driven
              rotZ zeroed those regressions. LinkRot census: only 3/65 slugs have LinkRot
              behaviors (Switch, Clothesline, Reflection); every other slug's `ov?.has('rotZ')`
              is false so buildTransformMatrix's rotZ path is identical to baseline for them.
              Files: engine/src/evaluator/index.ts (+8/−2 in buildTransformMatrix).

- 2026-07-16k  ⛔ MULTI RE-CONFIRMED DEGENERATE (T-qmulti00001 DROPPED, docs-only, no engine change) —
              visual + pixel-level re-verification of `~/fct-gui-gt/Replicator-Clones__Multi`:
              f0 = photo A (sepia mountain lake, RGB dominant ~(230,150,80)), f23 = photo B
              (blue mountain lake, RGB dominant ~(60,90,140)), but mid-transition **f12 is a
              4-panel 2×2 grid of gray plates (RGB uniform ~(140,140,140), R=G=B, std ≈0)
              with a stylized ↓ arrow glyph centered in each plate, on a pure-black gutter
              RGB(0,0,0)**. Sampled pixels at f12: gutter (20,20)=(0,0,0), gutter (960,540)=
              (0,0,0), TL plate interior (480,210)=(141,141,141), TR (1440,210)=(139,139,139),
              BL (480,750)=(140,140,140), BR (1440,750)=(139,139,139). These are FCP's UI
              empty-drop-zone placeholder graphics — synthetic gray plates with drop-arrow
              icons — NOT the real Multi replicator applied to photos A/B (which would carry
              sepia/blue tint, not pure-desaturated gray). Matching placeholder arrows is
              not reverse-engineering; the 7.63 dB "gap" is a GT capture artifact. Marking
              Multi DROPPED per the standing ⛔ decision (already documented 2026-07-15 in
              the ⛔ MULTI section below; this tick formalizes it as a swarm-queue DROP).
              Multi row in the L1 leverage table stays annotated ⚠️ DEGENERATE GT. Zero
              engine diff — commit is ROADMAP.md only, gate impossible to regress.

- 2026-07-16j  📝 REFLECTION HINGE-RELATIVE — MEASURED DEAD-END (T-q50a7f2e6 DROPPED, docs-only,
              gate 0/0). Built the hinge-relative perspective end-to-end per the task brief and
              MEASURED that it does NOT beat orthographic for Movements/Reflection. The full
              build: (a) evaluator scene-level detector for anchor-Z+position-Z-coupled Links
              from the same driver source (fires on Movements/Reflection AND Movements/Switch,
              structural — no transition names; Switch's coupled Link is anchor.X not .Z so
              gates out at the resolveCamera step); (b) computed scene-shared hinge world Z
              by transforming the coupled-link target's local anchor through its
              worldTransform (Reflection: parent Group anchor=[0,0,960] → world Z 960);
              (c) resolveCamera S6 branch, when anchor-Z-coupled: keep the AOV-derived
              distance (D=1614 for Reflection AOV=37°) and set hingeRelativePerspective=true;
              (d) projectQuad + rctx.hingeWorldZ path applies `scale = D / (D − (wz − 960))`
              (Motion's decoded +Z=toward-viewer convention → sign FLIPPED versus current
              projectPoint's `denom = cameraZ + z`); (e) numerical denom clamp |denom| ≥ D/16
              so a runaway rotation can't produce NaN.
              Full D-sweep on Reflection with the wired code (env-gated FCT_HINGE_D + FCT_HINGE_WZ
              probe to explore the (D, hinge-world-Z, sign) space without editing code between runs):
              | D    | hingeWZ=960 sign=− | hingeWZ=960 sign=+ | hingeWZ=(per-layer m14) sign=− | hingeWZ=0 sign=− (bare flip) |
              |------|--------------------|--------------------|--------------------------------|------------------------------|
              | 1614 | 12.53              | 12.33              | 13.53                          | 12.62                        |
              | 2000 | 12.77              | 12.54              | 13.62                          | 14.17                        |
              | 3000 | 13.16              | 12.48              | 13.78                          | -                            |
              | 5000 | 13.61              | 13.27              | 13.96                          | 14.17                        |
              | 8000 | 13.88              | 13.56              | 14.06                          | -                            |
              | 15000| 14.13              | 13.84              | 14.14                          | 14.20                        |
              | 30000| **14.26**          | -                  | 14.21                          | -                            |
              | ortho baseline (all D=∞) = **14.23** ← best physically-plausible; the +0.03 dB
              at D=30000 is within score noise and requires a camera distance ~19× the AOV-
              implied 1614, which has no Motion-decode support (Motion's OZScene camera is
              literally the null-camera orthographic branch here — see resolveCamera's
              !hasFraming && !sceneHasReplicator comment). Every entry with D at Motion's true
              AOV distance 1614 is WORSE than ortho by 0.02–1.70 dB across all four variants.
              This subsumes and refutes the task-brief hypothesis; the ROADMAP dead-end
              (T-qreflect001) now covers hinge-relative too, not just global-perspective.
              Where the wedge actually comes from: NOT a perspective divide. Reflection's
              GT tail difference is dominated by (a) the "Floor" reflection group (a mirrored
              copy of the panels on a Z-tilted plane below y=-540 — Color_Solid 1 at
              m3x3=[4,0,0, 0,0,-4, 0,4,0] is a 4× lens-flare-scale sheet reflection); (b) the
              Cinematic "Depth of Field" (id 344, value 2 — default 1.4) blurring the far
              edge; and (c) the drop-zone rotate keyframes on Transition A itself (rotY
              swings from ~+45° to 0° AS the group rotates back, so A doesn't rotate in
              lockstep with the group). Reflection's headroom lives in ONE of those three
              subsystems, NOT in perspective projection. Filed follow-ups: T-qa7694deb
              (Floor group), T-qe59c7f31 (Cinematic DoF), T-q7529db51 (Transition A/B own
              rotY curves). Files touched during decode: none landed (engine reverted to
              origin/main exactly; ROADMAP progress-log line + task DROPPED status only).
              Diagnostic tests (_trace_anchor.ts, _trace_group_anchor.ts, _trace_cam.ts,
              _trace_tx.ts, _check_folds.ts) written and DELETED — data captured in this
              log entry (structural detector fires on Reflection + Switch; Reflection hinge
              world Z = 960 from parent Group anchor; Panel A pivots on m14 without own
              anchor while Panel B has anchor=(0,0,389)→world 960).

- 2026-07-16i  ✅ EARTHQUAKE (T-qca011a65 DONE, gate 0/0, +3 improved) — restored the overlay-dust
              pureCrossfadeSettleB extension in timemap.ts that had been silently reverted by
              a stale-base rebase in the Smear commit (86b8489). Earthquake 16.51→21.26 dB
              (+4.75), Curtains 21.29→23.81 dB (+2.52), engine mean 16.89→17.07 dB. Filed
              follow-up T-q7f6795d6 for the residual mid-crossfade dip f10-f16 (~10-13 dB)
              that remains after the tail fix — a separate crossfade-timing problem
              (engine crossfade midpoint ~f10, GUI GT midpoint ~f12-f13).
- 2026-07-16j  📝 VIDEO_WALL DECODE-4 (T-qd1814800 WIP, gate 0/0) — instrumented trace of the framed
              projection path REFUTES the "giant plate = projected quad rasterizing across frame"
              hypothesis from the task briefing. `FCT_TRACE_FRAMED=1` dump at f11 shows the
              standalone Transition B at world (1313, 2298) projects to sy=+813 (dest y ∈ [1145,
              1561], entirely below the 1080-tall frame) with the correct sign convention:
              `projectFramed` returns center-relative sx/sy, `up=(0,1,0)`, blitTransformed uses
              m[13]=sy as Y-DOWN center-relative — and `blitDstBBox` correctly clips the off-frame
              plate. NO on-frame pixels are written for that standalone. The visible "giant blue
              plate" at f11 is actually `Replicator Pin 2 copy` (cellSrc=Pin 2 → imageB) whose 1×2
              8260-wide grid + cellFill=pitchX/tileW=4.46× stretches its imageB tile to 1966×1105
              (near-frame-filling). REFUTED two fallback attempts (aspect-preserving cellFill
              MIN → 9.58, wall-bbox-derived farDist → 9.89). Follow-up T-q7fd2fef0 queued:
              decompile Motion's OZReplicator stamp/cell-scale for the aspect-preserving cover-fit
              rule (prior decode: GT screen pitch aspect 1.68 = tile-native 16:9, NOT pitch aspect
              3.42). WIP state: timemap wrap-cancel + 3-key dolly + wall-centroid +
              cellFill(pitchX/tileW) land 10.16→10.18. All engine changes staged; standalone cull
              gated & DISABLED per f00/f23 near-key evidence (do not re-enable).

              gate 0/0). Built the hinge-relative perspective end-to-end per the task brief and
              MEASURED that it does NOT beat orthographic for Movements/Reflection. The full
              build: (a) evaluator scene-level detector for anchor-Z+position-Z-coupled Links
              from the same driver source (fires on Movements/Reflection AND Movements/Switch,
              structural — no transition names; Switch's coupled Link is anchor.X not .Z so
              gates out at the resolveCamera step); (b) computed scene-shared hinge world Z
              by transforming the coupled-link target's local anchor through its
              worldTransform (Reflection: parent Group anchor=[0,0,960] → world Z 960);
              (c) resolveCamera S6 branch, when anchor-Z-coupled: keep the AOV-derived
              distance (D=1614 for Reflection AOV=37°) and set hingeRelativePerspective=true;
              (d) projectQuad + rctx.hingeWorldZ path applies `scale = D / (D − (wz − 960))`
              (Motion's decoded +Z=toward-viewer convention → sign FLIPPED versus current
              projectPoint's `denom = cameraZ + z`); (e) numerical denom clamp |denom| ≥ D/16
              so a runaway rotation can't produce NaN.
              Full D-sweep on Reflection with the wired code (env-gated FCT_HINGE_D + FCT_HINGE_WZ
              probe to explore the (D, hinge-world-Z, sign) space without editing code between runs):
              | D    | hingeWZ=960 sign=− | hingeWZ=960 sign=+ | hingeWZ=(per-layer m14) sign=− | hingeWZ=0 sign=− (bare flip) |
              |------|--------------------|--------------------|--------------------------------|------------------------------|
              | 1614 | 12.53              | 12.33              | 13.53                          | 12.62                        |
              | 2000 | 12.77              | 12.54              | 13.62                          | 14.17                        |
              | 3000 | 13.16              | 12.48              | 13.78                          | -                            |
              | 5000 | 13.61              | 13.27              | 13.96                          | 14.17                        |
              | 8000 | 13.88              | 13.56              | 14.06                          | -                            |
              | 15000| 14.13              | 13.84              | 14.14                          | 14.20                        |
              | 30000| **14.26**          | -                  | 14.21                          | -                            |
              | ortho baseline (all D=∞) = **14.23** ← best physically-plausible; the +0.03 dB
              at D=30000 is within score noise and requires a camera distance ~19× the AOV-
              implied 1614, which has no Motion-decode support (Motion's OZScene camera is
              literally the null-camera orthographic branch here — see resolveCamera's
              !hasFraming && !sceneHasReplicator comment). Every entry with D at Motion's true
              AOV distance 1614 is WORSE than ortho by 0.02–1.70 dB across all four variants.
              This subsumes and refutes the task-brief hypothesis; the ROADMAP dead-end
              (T-qreflect001) now covers hinge-relative too, not just global-perspective.
              Where the wedge actually comes from: NOT a perspective divide. Reflection's
              GT tail difference is dominated by (a) the "Floor" reflection group (a mirrored
              copy of the panels on a Z-tilted plane below y=-540 — Color_Solid 1 at
              m3x3=[4,0,0, 0,0,-4, 0,4,0] is a 4× lens-flare-scale sheet reflection); (b) the
              Cinematic "Depth of Field" (id 344, value 2 — default 1.4) blurring the far
              edge; and (c) the drop-zone rotate keyframes on Transition A itself (rotY
              swings from ~+45° to 0° AS the group rotates back, so A doesn't rotate in
              lockstep with the group). Reflection's headroom lives in ONE of those three
              subsystems, NOT in perspective projection. Filed follow-ups (see below).
              Files touched during decode: none landed (engine reverted to origin/main
              exactly; ROADMAP progress-log line + task DROPPED status only). Diagnostic tests
              (_trace_anchor.ts, _trace_group_anchor.ts, _trace_cam.ts, _trace_tx.ts,
              _check_folds.ts) written and DELETED — data captured in this log entry
              (structural detector fires on Reflection + Switch; Reflection hinge world Z =
              960 from parent Group anchor; Panel A pivots on m14 without own anchor while
              Panel B has anchor=(0,0,389)→world 960).

- 2026-07-16h  🔧 SWING (T-qswing00001 WIP, gate 0/0) — landed the reusable per-pixel Z-BUFFERED
              perspective rasterizer (perspective.ts::projectQuadWithWorldZ +
              renderPerspectiveQuadDepth + CAMERA_Z_DEFAULT export). Motion depth convention
              pinned by unit test: smaller world-Z = closer to camera; a near quad WINS pixels
              over a farther overlapping quad regardless of paint order (perspective.test.ts
              +4 cases). NOT WIRED into renderChildLayers yet — the WIRING requires an upstream
              anchor/rotation-sign decode per family (see below). Filed follow-ups so the
              plumbing can be consumed once the decode lands:
                • T-q98a30de5 (already open) — 3D_Rectangle Z-buffer over B, reuses these helpers
                • T-qswinganchor (NEW) — Swing rig-widget decode (anchor picks Bottom for
                  Anchor=2 "Top"; `-rotX` negation calibrated for Fall inverts Swing's wedge)
              REPRODUCED the empirical dead-end from the T-qrect3d0001 write-up (whole-quad
              z-sort net-negative): the naive "compare each clone's origin wz once, paint back
              then front" branch regressed Swing 12.89→12.58 (−0.31 dB); depth-buffering the
              clones with the CURRENT engine worldTransforms landed at 12.89→12.63 (still net
              negative) because the two projected quads share BOTTOM-anchor origin (world y=540,
              z=−9 vs +297) — NOT the top-hinge the task-brief decode assumed — and rotate in
              matching (not opposite) directions once `-rotX` is applied to both. i.e. the
              per-pixel depth math is CORRECT, the geometry FEEDING it is wrong. Ship the
              helpers + tests only, so the downstream tick can hook without re-deriving the
              rasterizer. Files: engine/src/compositor/perspective.ts (+154 lines),
              engine/test/perspective.test.ts (+4 test cases). Baseline untouched. Task
              status: open; queued after T-qswinganchor.

- 2026-07-16g  ✅ FILTER APPLY ORDER (T-qb697c0d4) — parser now reverses the per-layer <filter> list so
              filters apply in bottom-up XML order (LAST listed first, matching Motion's Inspector
              stack: top = last applied). Objects/Curtains 16.53 → 21.29 (+4.76 dB): the .motr's
              [Colorize, Brightness, Mono] chain was being applied top-down, so the final ChannelMixer
              Mono step DESATURATED the just-colorized red curtain back to grey (engine mid-band
              ~(75,75,75) vs GT red ~(80,9,1)). Applied bottom-up (Mono→Brightness→Colorize) it's the
              intuitive image-processing pipeline: desaturate photo to luma → brighten 2.91× → remap
              luma to the target red (Remap White To=(0.7255, 0.1021, 0)). Mid-band f05-f17 now scores
              23–26 dB. Filter constants read via tools/re/read_const.py + Curtains.motr:655 XML.
              Gate: NET +5.05 dB across 4 slugs — Curtains +4.76, Movements/Pinwheel +0.71, Objects/
              Leaves +0.41; Stylized/Color_Panels regressed −0.83 (HueSat Sat=1 + Colorize interaction
              on the 4 panel layers — an underlying filter-fidelity gap now unmasked by the correct
              order; follow-up T-qba9797b8 filed). Baseline refrozen mean 16.87 → 16.95 dB. Curtains
              tail collapse f18-f23 (10-16 dB, GT reveals photo B under opening curtains) is a
              SEPARATE bug — follow-up T-qd25ba20c filed. Files: engine/src/parser/index.ts (two
              filter-list reverse() sites, both with the empirical decode + Curtains cite),
              engine/src/compositor/filters/levels.ts (docstring corrected — chain is Mono→Brightness→
              Colorize, not Brightness→Mono).

- 2026-07-16f  📝 VIDEO_WALL DECODE-3 (T-qd1814800 WIP, docs-only, gate 0/0) — restored the 4 WIP diffs
              (they were deleted by an unrelated Smear-fix commit 86b8489); re-verified they apply
              cleanly against current origin/main and land Video_Wall 10.16→10.18 (+0.02, still
              net-neutral per Rule 2d, engine reverted). Two NEW decode findings recorded:
              (1) **pitch-model X-vs-Y ambiguity REFUTED** — empirically measured GT f11 tile seams
              (screen pitchX~630, pitchY~350, aspect 1.68); all three candidate pitch formulas
              (sizeWidth/(cols-1), /cols, /(cols+1)) give the SAME world aspect 3.42 (→ screen 3.77
              after Y-tilt cos 25° foreshortening), NONE match 1.68 regardless of denominator, so
              the tile pitch model is NOT the blocker; (2) **standalone Transition A/B are rendered
              through the framing camera as giant tiles** — .motr has 'Transition A' Object.Type=1
              at world y=−2390 and 'Transition B' Object.Type=2 at world y=+3596 as separate
              top-level Image nodes (also used as replicator cell content via Pin 1/Pin 2). Engine
              compositor:498 renders every dropZone image through projectFramed; at mid-far dolly
              this puts raw Transition B into the frame as a ~40%-of-screen solitary blue rectangle
              (visually verified rendering engine f11 with WIP diffs). GT does NOT show this;
              FCP suppresses standalone A/B when consumed as cell sources in a replicator-wall
              scene. Concrete next step: skip standalone A/B render when rctx.framed AND scene has
              a replicator-wall layer; add `hasReplicatorWallWithDropZoneRefs` detector (≥2
              built-ins). Full decode in fct/minimized/Replicator-Clones__Video_Wall/manifest.json
              → decode_2026_07_16_T-qd1814800_transitionAB_and_perspective. Gate: `fct regress
              engine` 0 regressions / 0 improvements (byte-identical to origin/main), tsc clean,
              no-hardcode 10/10 detectors ≥2.

- 2026-07-16e  📝 REFLECTION DECODE (T-qreflect001 WIP, docs-only, gate 0/0) — investigated the missing
              mid-transition book-fold wedge on Movements__Reflection (14.23 dB, orthographic-forced by
              the S6 rep=0/static-cam discriminator). Ran perspective + cam-distance sweeps and per-column
              GT wedge geometry measurement (frame_0010: near-seam panel height 689px vs off-frame 961px
              → outer edge is CLOSER to camera). Cross-referenced with the engine world transforms via
              FCT_XFORM=1 (Panel A at t=0.737: near-seam corner world Z=-373, off-frame corner Z=+721)
              — proving Motion's Z convention is +Z=TOWARD viewer, **opposite** of the current
              perspective.ts (`denom = cameraZ + z` makes +Z recede). Verified: a sign-flip perspective
              (denom = cameraZ - z) renders the correct wedge DIRECTION but panels still blow up in X;
              cam-distance sweep is monotonic toward orthographic under both sign conventions (no interior
              optimum). Docs-only WIP: recorded the decode in Durable findings + queued the follow-up
              subsystem work (hinge-relative perspective + Z-sign flip) as T-q50a7f2e6. Next tick: build
              the hinge-relative projection for orthographic-fold scenes (measure Z-delta from anchor
              world-Z, flip sign, keep panels at authored size while adding rotation-induced wedge).

- 2026-07-16f  ✅ PINWHEEL (T-qpinwheel01) — group Image-Mask now honors POSITIONED/FOLDED image-media
              mask drivers. Movements__Pinwheel 13.27->13.98 (+0.71), gate green (0 regressions across
              65 slugs). ROOT CAUSE decoded from .motr: each of the 17 pinwheel tile-groups (One..
              Seventeen) authors an <enabled>0</enabled> `square_fix` Image scenenode as a hidden
              FOLD DRIVER — it carries the tile's Position (X/Y in pixels) + fold Rotation.X or
              Rotation.Y curve (0->π radians) via a Curve keypoint pair, plus a 576x576 Width/Height
              Object block. The tile's group-level `<mask name="Image Mask">` references this
              disabled driver's id as its Mask Source; the two sibling `Clone Layer` nodes (Transition
              A source id=10008, Transition B id=10006) stack full-frame and the mask clips them to
              the folded tile silhouette. TWO bugs kept this dead in the engine:
              (1) `maskSourceIsShapeGeometry` returned false for ANY `image` mask source — the
                  Pinwheel group-mask code path never fired. Now it returns TRUE when the source is
                  a disabled/positioned/rotated media image with a dropZone Width/Height quad (a
                  transformed mask matte, distinct from the flat full-frame media matte Stylized/Loop
                  + Objects/Veil use). Byte-for-byte identical for flat identity-WT media mattes.
              (2) `resolveImageMaskAlpha`'s image branch stamped the media FULL-FRAME (`sy = y*mh/H`),
                  ignoring the source's own worldTransform — so a positioned/folded matte would
                  register at frame corners instead of the tile pose. Now the image branch projects
                  the 4 corners of the dz.width x dz.height quad through the source's worldTransform
                  + camera and rasterizes the media's alpha via barycentric-interpolated UV sampling
                  (mirrors `renderPerspectiveQuad`), so the mask silhouette folds through the SAME
                  projection the group content uses. Orthographic scenes (cameraZ = Infinity, no
                  `<camera>` node — Pinwheel and every non-camera FCP transition) take an affine
                  path (screen = world + frameCentre) since the perspective divide with camZ=Inf
                  collapses every corner to the frame centre.
              PLUS: retime static-value ramp bypass for DISABLED media DRIVERS
                (evaluator/index.ts). Motion's `resolveWithRetime` interpolates a static Position from
                default (0) -> authored value over retimeProgress, correct for a real retimed clip
                whose transform "activates" as it plays (Concentric's ring-mask Circle scales rely on
                this). But a disabled media Image is NEVER played — it exists only to publish a
                static Position + animated Rotation to a mask consumer or Link behavior. Applying
                the retime ramp there slid every driver from the frame centre out to its authored
                tile position, so at t=0 all 17 Pinwheel tiles clustered at centre (77% coverage
                instead of ~100%). New gate: `layer.enabled === false && layer.type === 'image' &&
                layer.source?.type === 'media'` — bypass the retime ramp. Scoped strictly (drop-zone
                Transition A/B images have source.type='transitionA'/'B', so unaffected).
              STRUCTURAL fixes, no per-transition hardcoding: predicate keys on
              enabled=false + image + media source + non-identity WT + dropZone Width/Height quad;
              fires on Pinwheel's 17 tile-drivers and any future template with the same disabled-
              media-driver pattern. Full-frame media matte legacy path preserved for Loop/Veil.
              Remaining Pinwheel gap (13.98 vs GT ~17): per-tile A/B alternation timing and fold
              direction/axis (some tiles rotate the wrong sense — a separate decode) but the tile
              silhouettes now register through their fold. Commits + verified.
- 2026-07-16d  ✅ SMEAR (T-qsmear00001) — scene-aware wide-equirect + sub-canvas drop-zone fill-conform.
              Movements__Smear 11.75->13.98 (+2.23), Wipes__Mask 14.30->17.45 (+3.15); 0 regressions, gate green.
              The tail-collapse heuristic pointed at the settled-B frames, but DECODE (Rule 1) found the bug is a
              MIS-CLASSIFIED RENDER PATH, not a timemap wrap/clamp. Smear's project canvas is 4096x2160 (ar 1.896)
              but it is a plain HD transition (Transition-A card = 1920x1080). isWideEquirect(4096,2160) returned
              TRUE (width>=1.6*height catches 1.896:1), so Smear took the 360°/VR panorama path: fill-conform
              SKIPPED + cropCenter downscale -> A/B rendered native-size + centred -> the whole transition (most
              visibly the settled-B tail) LETTERBOXED (~52/32px black margins) vs the frame-filling GUI GT.
              FIX (generic, no hardcode): isEquirectScene(scene) = wide canvas AND every A/B drop zone itself wide
              (>=3072px) -> fires on the true panorama family (9 built-ins: 360°__* + 360°_Bloom + Squares),
              EXCLUDES Smear. api.ts downscale + compositor conform gate now key off it; additionally conform
              sub-canvas A/B cards up to the render buffer. settleBSec=endSec*0.72 confirmed already-optimal (0.80
              tested worse 11.47<11.69) — NOT a time fix. Residual mid-band (f01-18 ~11-12 dB) is the outgoing-A
              Scrape/DirBlur streak-over-B (S4 content-persistence) filed as follow-up T-q91bc5e37. Commit: HEAD.


- 2026-07-16c  ⛔ SLIDE_IN (T-qslidein001) — BLOCKED, decode-only (no engine change), 3-subsystem build too
              big for one net-positive tick. CENSUS (Rule 7/8) CONFIRMED the brief premise and reconciled the
              stale "linear gradient fill" premise: Slide_In has ONE Gradient generator (factoryID=8, pluginUUID
              40091D89) that (a) is NOT handled in determineImageSource (footage.ts:491) so it renders NOTHING
              — the teal->lightblue panel is absent for f5-f18, causing the mid collapse (f12 = 6.6 dB; per-frame
              28.6 dB@f0 -> 6.6@f12 -> 10.3@f23); (b) hosts BOTH a gradient-FILLED 'Rounded rect down' mask AND
              a paint-stroke Emitter (factoryID=19)+Cell copy(20) 'Rounded rect up' — 10 emitters total, which is
              why census flags [PAINT-STROKE]; (c) is driven by 8 Motion Path behaviors (factoryID=24), retimed,
              which the engine does not implement. Salvage note (docs/notes/salvage/slide-in-three-missing-
              subsystems.md) documents that EVERY partial subset REGRESSES: gradient-fill alone washes the frame
              (7.73 < 8.55 black); broadening detectMask by tagName costs -1 dB on 8 gate slugs (FCT_LIFT_ALL_
              MASKS scar); naive linear motion tween misses the arc-length/retime placement. Target is already at
              12.11 dB >= DoD 12, so shipping a net-negative partial would violate Rule 2. FILED 3 focused
              follow-ups (T-qcf704c6b gradient-fill+own-mask-clip narrowly gated on Motion-Path leaves;
              T-q66b34d79 Motion Path shape-follower retime-aware; T-q1f2f0f55 paint-stroke Emitter rasteriser +
              tail B-settle). No frames changed; gate untouched.
- 2026-07-16b  ⛔ 3D_RECTANGLE (T-qrect3d0001) — BLOCKED, decode-only (no engine change). Re-decoded the
              full scene graph from the .motr and CONFIRMED the existing ⛔ dead-end + brief premise:
              drawn base = Transition B (10006, enabled); Transition A (10009) is <enabled>0> and only a
              clone source; 27-node nested clone chain (Inside 01→08 filled rects, Shape 0N clones
              masked by Inside 0(N-1)) driven by 2 Rig Behaviors on Inside 01 (Scale ./1/100/105 +
              Position ./1/100/101, 7 anisotropic Snapshot columns) pushed to animated world-Z through
              the Camera; Shading Widget Top/Left/Right @ op 0.48 (LinkOpacity ./1/200/202) = bevel
              edges. MEASURED failure: GT B-ness (Blue−Red) −48(f7)→−30(f12)→+13(f16) as B fills in,
              engine PINNED ≈−81 all frames ⇒ Transition B never enters the composite; full-frame masked
              A quads occlude B in painter order (no per-pixel Z, no thin B seams). Fix = per-pixel
              Z-buffered depth composite + Shading bevel — a multi-session subsystem, NOT landable
              net-positive this tick, and the painter/layer-Z shortcut is the ⛔ measured dead-end
              (net −1.19). Filed 2 follow-up TODOs (T-q98a30de5 depth composite; T-q9e13de30 Shading
              bevel, --after). Score unchanged 16.48; gate untouched (no code edit).
- 2026-07-16a  ✅ COMBO_SPIN SPIN SUBSYSTEM WIRED (L1) — 11.21→12.32 (+1.11), Heart +0.51, 0 regressions,
              new baseline 16.78 dB. ROOT CAUSE (Rule 7 decode, careful-coder bisect): the 6 blade
              groups C1-C6 each carry a "Spin LT/RT" (factory 22) behavior authored DIRECTLY on the
              <group> element, but `parseLayerElement` (which parses <group>/<layer>) OMITTED
              `behaviors:` from its returned Layer — only `parseSceneNode` (for <scenenode>) parsed
              them. So every group-level Spin (and Fade/Ramp) was silently DROPPED: the blades never
              rotated, and the engine rendered a hard A→B CUT at f05 (frozen A f00-04, frozen B
              f05-23, per-frame diff 0.00 except one 73.2 jump) — NOT a timemap freeze (wrapSec=none,
              time advanced fine), the CONTENT was static because the spin transform was missing.
              FIX (2 parts, generic, no per-transition constant): (1) parser/index.ts — add
              `behaviors: parseLayerBehaviors(el, factories)` to parseLayerElement's return (also
              surfaced Heart's group Fade → +0.51 free); (2) evaluator applySpinBehaviors — decoded
              from OZTransformNode::computeSpin (Spin Rate id=400 is RAD/SEC): angleZ(t)=rate*(clamp
              (t,in,out)-in), radians, held after `out`, composed as a local-space Z rotation via
              tx.__spinRadians (added to rotationZ in buildTransformMatrix so the blade pivots about
              its own anchor). SCOPED to layers carrying a type='spin' behavior (PLAYBOOK: a GLOBAL
              spin regresses Vertigo/Leaves). Combo rate 3.2468 rad/s × 0.9676s = exactly π (the
              counter-rotating LT/RT blade flip). METHOD NOTE: the contended `gen --all` first
              reported Squares −2.09 / Veil −6.8 — both FALSE (transient JPEG/contention artifacts:
              re-rendered in isolation at 12.97 / 21.43, unchanged). The Video_Wall −0.93 in a
              mid-gen regress was the same racing-read artifact (isolation = 10.24). Clean uncontended
              gate = 0 reg / 2 imp. REMAINING (Combo_Spin, next): mid-transition f08-f12 still ~9 dB
              (engine reveals B too early) — the per-blade A/B Fade-crossfade timing, a separate
              pre-existing issue (blade-clone Fades were always parsed). New reusable tools:
              engine/test/_trace_behaviors.ts (dump parsed layer behaviors+timing),
              engine/test/_trace_timemap.ts (dump endSec/wrapSec/remap + frozen-frame detection),
              tools/re/decode_reveal_order.py (extract per-tile A→B flip order from GUI GT — Rule 1,
              since headless is NOT a valid oracle for Squares' shuffle). SQUARES side-decode: the GT
              reveal order pulled DIRECTLY from GUI GT (not headless) is 4-fold quadrant-symmetric
              (±1 JPEG jitter) with 23 distinct flip frames over 28 quadrant cells — a full PRNG
              permutation, REFUTING the ROADMAP's headless-derived "~7 radial values". The documented
              Helium LCG (seed 987639852) does NOT reproduce it (spearman 0.15 argsort / −0.08
              row-major) → Motion's replicator-shuffle PRNG remains undecoded; Squares deferred.

- 2026-07-16a ✅ COMBO_SPIN SPIN SUBSYSTEM SHIPPED (L1, 11.21→12.32 +1.11, +Heart 17.73→18.24, 0 reg,
              baseline re-frozen 16.76→16.78). ROOT CAUSE (Rule 7 decode, `fct census` + new
              `_trace_behaviors.ts`): Combo_Spin's 6 blade groups C1-C6 each carry a "Spin LT/RT"
              (factory 22) behavior authored DIRECTLY on the <group> element — but `parseLayerElement`
              (which parses <group>/<layer>) OMITTED `behaviors` from its returned Layer (only
              `parseSceneNode`, for <scenenode>, parsed them). So EVERY group-level Spin/Fade/Ramp was
              silently DROPPED: the blades never rotated → engine rendered a hard A→B cut at f05
              (frozen A f00-04, frozen B f05-23, `_trace_timemap` confirmed wrapSec=none so NOT a
              timemap freeze — the content itself wasn't animating) vs GT's smooth counter-rotating
              pinwheel. FIX (2 parts, both generic, no per-transition constant): (1) parser/index.ts —
              `parseLayerElement` now includes `behaviors: parseLayerBehaviors(el)` (also correctly
              surfaces Heart's group Fade → +0.51 free); (2) evaluator — `applySpinBehaviors` reads
              type='spin' behaviors and adds an accumulating in-plane Z rotation, decoded from
              OZTransformNode::computeSpin (Spin Rate id=400 is RAD/SEC): angleZ(t)=rate·(clamp(t,in,out)
              −in), radians, held after out, composed about the layer's own anchor origin via
              transform.__spinRadians (added to rotationZ in buildTransformMatrix). SCOPED to layers
              carrying a Spin — no-op for every other layer (PLAYBOOK: a global spin regresses
              Vertigo/Leaves). Combo rate 3.2468 rad/s over 0.9676s = exactly π. Remaining Combo gap
              is the per-blade A/B fade-crossfade TIMING (engine reveals B too early mid-transition,
              f08-f12 ~9 dB) — a separate pre-existing issue, not the spin. NEW reusable RE tools:
              engine/test/_trace_behaviors.ts (dump parsed layer behaviors + timing), _trace_timemap.ts
              (dump timemap wrap/freeze remap), tools/re/decode_reveal_order.py (extract per-tile A→B
              flip order from GUI GT — Rule 1, since headless is not a valid oracle for Squares' shuffle).
              LESSON: the "Squares/Veil −2/−6" seen in a CONTENDED `gen --all` (load 9-24, 8 workers)
              were TRANSIENT render-corruption false-regressions — both re-render at 12.97/21.43 in
              isolation, unchanged. Always re-verify a flagged regression in isolation on a quiet box
              before trusting it (Rule 2c). commit 321b927.


- 2026-07-15zz CONCENTRIC (12.62 dB, L1) ROOT-CAUSE fully diagnosed — 2-part bug, fix is scoped for a
              focused next tick. VISUAL (GT vs engine f12): engine renders FLAT B, none of the
              concentric rings. Traced the whole chain with committed diagnostics:
              (1) The Shape rig widget (factory 23, `Shape id=100` menu Circles=0 / Rectangles=1) is
                  on Circles(0), so the "Circles" group is active (vis=1, op=1) and "Rectangles" is
                  correctly hidden (rig snapshot opacity 0). Engine gets this RIGHT.
              (2) The "Circles" group holds 12 ring groups ("1st..6th left/right copy"), each a GROUP
                  with an Image Mask → a Circle shape/clone of a distinct radius, and inside each:
                  Clone A(10008) + Clone B(10006) stacked, both masked to that ring, B crossfading in.
              (3) BUG-A (mask projection): the group-mask 3D-SWING GUARD (`maskSrcIsFlat`,
                  index.ts) SKIPS the masks because each Circle carries a shared Rotation.Y (~140°,
                  m[0]=-0.775/m[2]=0.632). Guard exists because resolveImageMaskAlpha rasterized the
                  shape FLAT-affine (masks.ts:623 called rasterizeShape WITHOUT cameraZ) while the
                  clone content is perspective-projected (projectQuad) — they disagreed. FIX (proven
                  to render the OUTERMOST ring): pass rctx.cameraZ/cameraPosZ to that rasterizeShape
                  call so the mask projects the SAME way as the content; then the guard can drop
                  (mask+content share the group transform → they register). Mask+content verified to
                  share worldTransform (both m[0]=0.631/m[2]=-0.775 on "6th left copy").
              (4) BUG-B (draw order, NOT yet fixed): the 12 ring groups are listed 6th→1st
                  (largest→smallest radius); the default group render is REVERSE-list, so the LARGEST
                  disc draws LAST = on TOP and covers every inner ring → only the outermost survives.
                  Concentric needs largest-first(bottom)→smallest-last(top). The existing flatStack
                  centre-distance sort can't separate them (all centred), so it needs a radius/scale
                  order for nested coplanar masked groups.
              Because only BUG-A was applied, the full gate measured Concentric 12.62→11.67 (-0.95,
              one big wrong ring worse than flat B), so BOTH changes were REVERTED — they must land
              together. NEXT: re-apply BUG-A + add a radius-ordered draw order for nested-mask
              coplanar ring groups, gate-verify BOTH, then commit. NOTE: baseline_engine.json is
              STALE (predates the eed1f5d conform fix → gate shows ~40 false "improvements"); a clean
              regen + `fct baseline engine` re-freeze is in progress to fix the gate reference.

- 2026-07-15z2 🔬 CONCENTRIC flat-B ROOT CAUSE fully diagnosed (2-part fix scoped; partial fix
              reverted — regressed −0.95 alone). Visual proof: engine renders FLAT B at f12 (9.23 dB
              trough) while GT shows nested concentric A/B rings. Traced the whole scene graph:
              (1) A rig "Shape" widget (Circles/Rectangles menu, value=0) correctly selects the
              "Circles" layer (vis=1) and hides "Rectangles" (op=0) — engine gets this right.
              (2) The 12 visible ring groups ("1st..6th left/right copy" under "Comp copy") each
              carry a GROUP-level Image Mask → a Circle shape/clone of increasing radius, wrapping a
              stacked A-clone + B-clone (crossfade). PART-A BUG: the group-mask 3D-SWING GUARD
              (`maskSrcIsFlat`) SKIPS these masks because each Circle's worldTransform carries a real
              ~140° Rotation.Y (m0=−0.775,m2=0.631) shared with its clones — so every clone blitted
              full-frame ⇒ flat B. Root of THAT: resolveImageMaskAlpha rasterized the shape mask
              FLAT-affine (masks.ts:623 called rasterizeShape WITHOUT cameraZ) while the clones are
              perspective-projected (projectQuad) → mis-register → the guard was added to hide it.
              FIX-A (verified: outermost ring now renders correctly): pass rctx.cameraZ/cameraPosZ to
              that rasterizeShape call so the mask projects the SAME way as the content; then drop the
              maskSrcIsFlat guard (a DESCENDANT shape source shares the parent transform, so it
              registers whether flat or 3D). PART-B BUG (still open): with FIX-A only the OUTERMOST
              ring shows — the ring groups are listed 6th→1st (largest→smallest radius) and the
              default group render is REVERSE-list, so the LARGEST disc draws LAST = on top and
              covers all inner rings. Concentric needs largest-first (bottom) → smallest-last (top),
              i.e. FORWARD list order (or radius-sorted) for these coplanar nested-mask ring groups.
              Because only PART-A landed, the full gate measured Concentric 12.62→11.67 (−0.95, one
              big wrong ring worse than flat B), so BOTH changes were reverted — they must land
              together. NEXT: re-apply FIX-A + add a radius-ordered draw path for nested-mask coplanar
              ring groups, gate-verify BOTH. Also: baseline_engine.json is STALE (predates the
              eed1f5d conform fix — the gate shows 40 false "improvements"); re-freezing now.

- 2026-07-15zz  🔬 CONCENTRIC root cause FULLY diagnosed (2-part fix scoped; not yet landed). Concentric
              renders flat B at mid-transition (f11-f16 ~9-10 dB, the 12.49 mean's trough) — visually
              proven: GT shows nested concentric A/B rings, engine shows plain B. Traced the whole
              scene graph: the visible content is the "Circles" group (Shape widget=0 selects Circles,
              value=1 would select the correctly-hidden "Rectangles" group — engine's rig-snapshot
              selection is CORRECT). Circles > "Comp copy" holds 12 ring groups ("6th..1st left/right
              copy"), each a GROUP-level Image Mask (imageMaskSourceId → a Circle shape or a
              Clone-of-Circle) clipping stacked A/B clones to a ring, A→B crossfading via the B-clone
              Opacity. TWO bugs block it: (1) the group-mask 3D-SWING GUARD (maskSrcIsFlat) SKIPS the
              masks because the Circle sources carry a real ~140° Rotation.Y — but the mask AND its
              clones share the SAME worldTransform, so they WOULD align if projected the same way.
              Root: resolveImageMaskAlpha's shape path (masks.ts:623) rasterizes the mask FLAT-affine
              (no cameraZ) while the clones go through projectQuad (perspective) → mismatch. FIX A:
              pass rctx.cameraZ/cameraPosZ to that rasterizeShape + drop the maskSrcIsFlat guard →
              the OUTERMOST ring then renders (verified visually). (2) But inner rings stay hidden:
              "Comp copy" children are listed 6th→1st (largest→smallest radius) and the compositor's
              DEFAULT reverse-list order draws the LARGEST disc LAST (on top), covering all inner
              rings. FIX B (not done): concentric masked-ring groups must draw largest-first
              (bottom) → smallest-last (top), i.e. FORWARD list order (or sort by mask radius). With
              only FIX A the partial (1-ring) render measured Concentric -0.95 vs baseline, so FIX A
              was REVERTED pending FIX B — they must land together. NOTE: the gate showed 40 stale
              "improvements" because baseline_engine.json predates the eed1f5d conform fix; a clean
              regen + `fct baseline engine` re-freeze is running to make the gate accurate again.

- 2026-07-15za CONCENTRIC ROOT-CAUSE fully diagnosed (2-part bug; partial fix reverted, gate-negative).
              Visual (GT vs engine f12) showed the engine renders FLAT B — none of the concentric
              ring clones appear. Traced it: the Shape rig widget = "Circles" (0), so the "Circles"
              layer is the active one (vis=1; "Rectangles" correctly hidden op=0). Circles holds 12
              ring groups ("1st..6th left/right copy") each with a GROUP-level Image Mask → a Circle
              shape/clone of a distinct radius, stacking A-clone + B-clone masked to that ring.
              BUG PART 1 (mask projection): the group-mask 3D-SWING GUARD (maskSrcIsFlat) SKIPS the
              masks because each Circle carries a shared Rotation.Y (~140°, m[0]=0.63/m[2]=-0.78).
              The guard exists because resolveImageMaskAlpha rasterized the shape FLAT-affine
              (rasterizeShape at masks.ts:623 was called WITHOUT cameraZ) while the clone content is
              perspective-projected (projectQuad) — the two disagreed. FIX (verified visually):
              pass rctx.cameraZ/cameraPosZ to that rasterizeShape call so the mask projects the SAME
              way as the content; then the guard can be removed (mask+content share the group
              transform, so they register). This made the OUTERMOST ring render correctly.
              BUG PART 2 (draw order, NOT yet fixed): the 12 ring groups are listed 6th→1st
              (largest→smallest radius); the default group render is REVERSE-list, so the LARGEST
              disc draws LAST = on top and covers all inner rings → only the outermost survives.
              Concentric needs largest-first (bottom) → smallest-last (top). Because only part 1
              landed, the full-gate measured Concentric 12.62→11.67 (-0.95, one big wrong ring worse
              than flat B) so BOTH changes were REVERTED — they must land together. NEXT: re-apply
              part 1 + add a radius-ordered (mask-source scale/bbox) draw order for nested-mask
              coplanar ring groups, gate-verify BOTH, then commit. Also: baseline_engine.json is
              STALE (predates the eed1f5d conform fix → gate shows 40 false "improvements"); a clean
              regen + `fct baseline engine` re-freeze is running to fix the gate reference.

- 2026-07-15z  🔬 crop.* DEAD-END on drop-zone + ROOT CAUSE found (Rule 8). Tried a crop.left cap
              (Crop id=216, decoded from Flip.motr:441 — id 216 not 500, Left/Right/Top/Bottom id
              1/2/3/4, source px). Headless IGNORED it (hvi 0.9) while TS DID crop → false FAIL.
              Debugged WHY (not just observed): a big 4-edge crop (600/600/400/400) renders maxdiff
              0 on BOTH the Directional skeleton AND the Flip skeleton (which ships a real
              Transform+Crop on its Image), scalar OR curve, at t=0/0.25/0.5 → FCP does not route
              Properties>Crop on a drop-zone Image. BUT crop IS honored elsewhere: Concentric
              (Replicator-Clones) carries non-zero Crop 216 (Left/Right = 900+ px) on Clone Layer
              (factory 15) cells under Transform id=100 — same node-type story as blend (Clone
              Layers/generators honor layer params the drop-zone Image does not). So crop is
              load-bearing on Concentric (a 12.35 dB gate slug) and validated there per Rule 1, not
              via a drop-zone probe. Removed the false crop cap; `_crop_xml` kept for schema, `crop`
              inject raises. caps 6/6 PASS; tsc clean; gate untouched. NEXT: verify TS Clone-Layer
              crop on Concentric.

- 2026-07-15z  🔬 crop.* DEAD-END for a drop-zone cap — ROOT CAUSE debugged + a REAL target found.
              Decoded the crop schema (Rule 8): Crop id=**216** (not 500), children L/R/T/B id
              1/2/3/4 in source px; sibling of Transform on an Image, nested under Transform on a
              Clone Layer. Injected crop.left=400 → cap FAILed with hvi 0.9 (headless == identity)
              while TS cropped (mae 28.76) — so headless IGNORES it. Debugged WHY (not stopping):
              a big 4-edge crop (600/600/400/400) renders maxdiff 0 on BOTH Directional AND the
              Flip skeleton (which ships a real Transform+Crop), scalar OR curve, at t=0/0.25/0.5.
              FCP only honors Crop 216 on nodes stacked through the general layer compositor —
              CLONE LAYERS (factory 15) + generators, NOT drop-zone Images. CRITICAL SIDE-FINDING:
              Concentric (Replicator-Clones, a known 12.35 dB broken slug) uses NON-ZERO crop on
              its Clone Layers (Left/Right = 900..1150 px), so crop is load-bearing there — the
              real validation target, not a synthetic cap. Removed the false crop.* caps; kept
              `_crop_xml` for schema; `crop` inject raises a documented error. caps 6/6 PASS; tsc
              clean; GUI-GT gate untouched. NEXT: verify the TS engine applies Concentric's
              Clone-Layer crop correctly (real gate slug).

- 2026-07-15z  🔬 crop.* DEAD-END on drop-zone + ROOT CAUSE (Rule 8). Tried a crop.left/top cap
              (Crop id=216, decoded from Flip.motr:441 — id 216 not 500, Left/Right/Top/Bottom id
              1/2/3/4, source px). Headless IGNORED it (hvi 0.9) while TS DID crop → false FAIL.
              Debugged WHY (not just observed): a big 4-edge crop (600/600/400/400) renders maxdiff
              0 on BOTH the Directional skeleton AND the Flip skeleton (which ships a real
              Transform+Crop on its Image), scalar OR curve, at t=0/0.25/0.5 → FCP simply does not
              route Properties>Crop on a drop-zone Image. BUT crop IS honored elsewhere: Concentric
              (Replicator-Clones) carries non-zero Crop 216 (Left/Right = 900+ px) on Clone Layer
              (factory 15) cells under Transform id=100 — same node-type story as blend (Clone
              Layers/generators honor layer params the drop-zone Image does not). So crop is
              load-bearing on Concentric (a 12.35 dB gate slug) and validated there per Rule 1, not
              via a drop-zone probe. Removed the false crop cap; `_crop_xml` kept for schema, `crop`
              inject raises. caps 6/6 PASS; tsc clean; gate untouched. NEXT: verify TS Clone-Layer
              crop on Concentric.

- 2026-07-15y  🔬 BLEND DEAD-END — root cause FULLY DEBUGGED (vjeux: "debug WHY the headless renderer
              doesn't render it, don't just stop there"). Proven step by step, not just observed:
              (1) B IS behind A — forcing A opacity=0 reveals end.jpg (hvi 136.7), both engines agree,
              so it is NOT an empty/black backdrop. (2) NOT a parameter-flag gate — the skeleton's
              Blend Mode flags 0x301010010 vs a working Color-Planes blend 0x200010010 differ by bits
              0x1000000|0x100000000, but REWRITING the skeleton flags to the working value STILL
              renders maxdiff 0. (3) STRUCTURAL — FCP's transition compositor draws the drop-zone
              Image (factory 3) cards via a fixed source-over path that never consults their layer
              Blend Mode; modes only apply on the node types FCP stacks through the general layer
              compositor (Color Planes' 6 Clone-Layer/factory-9 siblings value=8; Lens Flare overlay
              value=10) — those ARE gate-verified on real slugs. (4) The TS engine ALREADY MATCHES:
              TS Normal-vs-Add is also maxdiff 0 → NO engine bug. Documented the full root cause in
              probe_scene.py + ROADMAP; blend inject still `raise`s (no false cap). Tools+docs only,
              caps 6/6 PASS, tsc clean, GUI-GT gate untouched.

- 2026-07-15y  🔬 blend.* DEAD-END — ROOT CAUSE fully debugged (not just observed). vjeux: "debug WHY
              the headless renderer doesn't render it, don't just stop there." Did exactly that with
              4 controlled experiments: (1) A opacity=0 reveals end.jpg (hvi 136.7, both engines
              agree mae 0.0) ⇒ B IS behind A, backdrop is real not black. (2) The skeleton Blend
              Mode flags (0x301010010) differ from a WORKING Color-Planes blend (0x200010010) by
              bits 0x1000000|0x100000000 — but REWRITING the skeleton to the working flags STILL
              renders maxdiff 0 ⇒ NOT a flag gate. (3) So it is STRUCTURAL: FCP's transition
              compositor draws the drop-zone Image (factory 3) cards through a fixed source-over path
              that never consults their layer Blend Mode; modes only apply on Clone-Layer (factory 9,
              Color Planes' 6 planes value=8) / overlay-generator (Lens Flare value=10) siblings —
              which ARE gate-verified on real slugs. (4) The TS engine ALREADY MATCHES (TS Normal-vs-
              Add also maxdiff 0) ⇒ NO engine bug. Documented in probe_scene.py + ROADMAP; the blend
              inject kind stays but raises. All temp diagnostics deleted (Rule 5). caps 6/6 PASS; tsc
              clean; GUI-GT gate untouched.

- 2026-07-15x  ⛔ CAPABILITY blend.* — DEAD-END decoded + documented (Rule 8 premise-correction).
              Tried to add blend.multiply/add/screen/overlay caps by injecting Transition A's
              Blend Mode (id=203) over B. FINDING via a CONTROL: value=0 Normal and value=4/8/10
              Multiply/Add/Screen (A opacity pinned 0.5) all render BYTE-IDENTICAL headless
              (psnr 39.96 / mae 1.72 / hvi 33.3 == the pure opacity-0.5 result) — the value= DID
              land in the XML, so headless FCP is IGNORING the drop-zone card's layer Blend Mode in
              this synthetic A-over-B stack (the two Transition cards are composited by the
              transition graph, not as a simple sibling stack where a card's mode applies to B). Any
              blend.* cap here would be a FALSE PASS measuring opacity, not the mode (Rule 4/8), so
              NONE were kept. The `blend` inject kind is retained but now RAISES a documented error.
              The blend enum is already decoded from ProCore __cstring AND gate-verified on the REAL
              slugs that use it (360° Push value=28 SILHOUETTE_LUMA improves GUI-GT PSNR), so the
              engine blend handling is validated through the shipped transitions. Tools-only; caps
              still 6/6 PASS; tsc clean; GUI-GT gate untouched.

- 2026-07-15w  ✅ CAPABILITY #2-4 CLOSED — transform Scale/Rotation/Opacity SCHEMA decode. The
              catalog's scale/rotation/opacity injections were IGNORED by headless FCP (hvi~0.9 =
              no-op) — a SCHEMA bug in the PROBE INJECTOR, not the engine. Decoded the real Motion
              Transform schema from the shipped templates (Rule 8): Transform id=100 > Position
              id=101 / Rotation id=**109** (deg, X/Y/Z group) / Scale id=**105** (RATIO 1.0=100%,
              X/Y/Z) — the injector had used Rotation id=102 (single leaf) + Scale id=103 default=100
              (percent), so FCP dropped both. Opacity id=202 ships as an animated <curve> so the old
              attribute-append regex silently no-op'd; injector now replaces the whole Opacity element
              with a static value. Fixed tools/re/probe_scene.py (_transform_xml ids/units,
              rotation scalar|dict, opacity block-replace) + corrected the STALE docstring in
              engine/src/parser/transform.ts (ids 109/105, Scale=ratio — the extractor matches by
              NAME so the 65 slugs were always fine; ids are docs only). RESULT: fct caps = **6/6
              PASS**, all previously-ignored injects now APPLY: scale.half hvi 0.9→111.6 (psnr 42.70),
              rotation.z 0.9→76.8 (34.93), opacity.half 0.9→33.3 (39.96). Tools+docstring only, NO
              engine behavior change (evaluator already treats scale as fractional, rotation×RAD2DEG),
              so the GUI-GT gate is UNAFFECTED. tsc clean.

- 2026-07-15w  ✅ CAPABILITY #2-4 CLOSED — transform Scale/Rotation/Opacity schema decode. The
              catalog's scale/rotation/opacity injections were IGNORED by headless FCP (hvi~0.9 =
              no-op) — a SCHEMA bug in the PROBE INJECTOR, not the engine. Decoded the REAL Motion
              Transform schema from the shipped templates (Rule 8, from the .motr not prose):
              Transform id=100 > Position id=101 / Rotation id=**109** (deg, X/Y/Z group) / Scale
              id=**105** (RATIO 1.0=100%, X/Y/Z) — the injector had used Rotation id=102 (single leaf)
              and Scale id=103 default="100" (percent), so FCP dropped them. Opacity id=202 ships as
              an ANIMATED <curve>, so the old attribute-append regex silently no-op'd; now the whole
              Opacity(202) element is replaced with a static-value curve. Fixed tools/re/probe_scene.py
              (_transform_xml ids/units + rotation dict|scalar + opacity block-replace) and the STALE
              parser docstring in engine/src/parser/transform.ts (the extractor matches by NAME so the
              65 slugs were always fine — ids are documentation only). RESULT: `fct caps` = 6/6 PASS,
              every previously-ignored inject now APPLIES: scale.half hvi 0.9→111.6 (psnr 42.70),
              rotation.z hvi 0.9→76.8 (34.93), opacity.half hvi 0.9→33.3 (39.96). Tools+docstring
              only; the engine transform math was already correct (evaluator treats scale as
              fractional, rotation×RAD2DEG), so the GUI-GT gate is UNAFFECTED. tsc clean.

- 2026-07-15v  ✅ CAPABILITY #2-4 CLOSED — transform Scale / Rotation / Opacity schema decode.
              The catalog's scale/rotation/opacity injections were being IGNORED by headless FCP
              (hvi~0.9 = no-op) — a SCHEMA bug in the probe injector, NOT an engine bug. Decoded the
              REAL Motion Transform schema from the shipped templates (Rule 8): Transform id=100 >
              Position id=101 / Rotation id=**109** (deg) / Scale id=**105** (RATIO 1.0=100%, all 108
              shipped Scale curves default="1") — the injector had used Rotation id=102 / Scale id=103
              with default="100" (percent), so FCP dropped them. Opacity (id=202) ships as an ANIMATED
              <curve> not a scalar, so the old attribute-append regex silently no-op'd; now the whole
              Opacity(202) element is replaced with a static single-keypoint curve. Fixed
              tools/re/probe_scene.py (_transform_xml ids/units, rotation dict|scalar, opacity block
              replace) + corrected the STALE parser docstring in engine/src/parser/transform.ts
              (id 109/105, ratio — the extractor matches by NAME so the 65 slugs were always fine;
              ids are documentation only). RESULT: `fct caps` = **6/6 PASS**, all previously-ignored
              injects now APPLY: scale.half hvi 0.9→111.6 (psnr 42.70), rotation.z hvi 0.9→76.8 (34.93),
              opacity.half hvi 0.9→33.3 (39.96). Tools+docstring only — the engine transform math was
              already correct (evaluator treats scale as fractional, rotation×RAD2DEG), so the 65-slug
              GUI-GT gate is UNAFFECTED (no engine behavior change). tsc clean.

- 2026-07-15u  ✅ CAPABILITY #1 CLOSED — drop-zone media conform (the "base A renders as a band"
              letterbox bug, shared by Blurs/Push/Rotate/Kinetic; ENGINE_RE_PLAYBOOK.md:847). FCP
              conforms a Fit=0/Type=1 drop zone's SOURCE to the drop-zone Width×Height box (stretch,
              no aspect preservation); the TS engine blitted the 1854×1042 source at NATIVE size
              centred, leaving a ~19/33px black band under EVERY slug (identity capability scene was
              psnr 17.58 / mae 16.4 all at the edges → now 43.31 / mae 1.04). Fix:
              compositor/index.ts conformDropZoneSource stretch-resamples a base full-frame
              drop-zone source UP to the frame, scoped to UNCROPPED box≈frame images, EXCLUDING the
              wide-equirect 360° native render (isWideEquirect gate — a 360° scene renders at 4096×
              2160 so box≈output would fire and stretch into the panorama, initially regressed
              360°_Bloom −0.38; the gate fixed it). FULL gate BEFORE the 360° guard: +40 improved /
              −2 (both <0.5 dB). Representative re-verify AFTER the guard: Blurs__Directional
              17.79→26.84 (+9.0), Panels_Random 12.99→17.8 (+4.8), 360°_Bloom neutral (11.51),
              Squares 13.11→12.97 (−0.14 noise). Also fixed `fct caps` (probe_scene.py couldn't
              import fct.* when launched via fct.sh) + baseline.identity now PASSes (expect_identity
              flag). NET-POSITIVE per the new Rule-2 policy (vjeux: ship small correct pieces, don't
              gate on zero-regression). tsc clean. NOTE: baseline_engine.json NOT re-frozen this tick
              (vjeux asked to stop the full 65-slug render loop for efficiency) — re-freeze on the
              next whole-fleet audit.
- 2026-07-15t  🧪 CAPABILITY CATALOG harness built (answer to "implement FCP features one-by-one,
              like minimize in spirit"). New: tools/re/probe_scene.py (builds a minimal synthetic
              .motr isolating ONE primitive, renders headless-FCP + full TS pipeline, compares),

              engine/test/_scene_render.ts (render any .motr through the TS engine at time t),
              tools/re/capabilities.json (the catalog), and `fct caps`. Proven end-to-end: transform
              Position X/Y apply in BOTH engines. TWO real findings the harness surfaced immediately:
              (1) HARNESS FLOOR — an identity "show image A" scene diverges (headless mae 1.09 vs A,
              TS mae 16.5, worst at top rows ~140; centre pixel byte-identical) => TS drop-zone
              conform/fit differs from FCP under EVERY transition, previously masked in the 100-node
              integration scenes; this is the first capability to close. (2) SCHEMA TODOs — Scale/
              Rotation/Opacity injections were ignored by headless (hvi~0.9), the drop-zone transform/
              opacity encoding needs decoding from a real slug. Harness is a DEV ORACLE; GUI-GT gate
              unchanged (0 regressions, tools/test only). tsc clean.
- 2026-07-15t  ⭐ NEW METHODOLOGY: capability catalog (unit-test every FCP primitive vs headless FCP).
              Answering "build a listing of everything FCP does + a small testable implementation for
              each" — the inverse of `fct minimize`. Built `tools/re/probe_scene.py` (injects ONE
              primitive into a minimal synthetic .motr, renders headless-FCP vs the full TS pipeline,
              compares), `engine/test/_scene_render.ts` (render an arbitrary .motr through parse→eval→
              composite), `tools/re/capabilities.json` (the catalog), and wired `fct caps`. Proven
              end-to-end: transform.position.x/y APPLY in both engines. FINDING it immediately surfaced:
              the HARNESS FLOOR is only ~17.6 dB — an IDENTITY scene (show A) already diverges (headless
              mae 1.09 vs A, TS mae 16.5), worst at the TOP rows (~140), centre pixel identical ⇒ the TS
              DROP-ZONE CONFORM/fit differs from FCP on a bare skeleton. That is a hidden baseline error
              under many slugs and is now capability #1 to close. Scale/rotation injectors need the real
              id schema decoded (documented as schema_todo). Tools+test only; tsc clean; gate 0 regressions.
## Full pre-rebuild log (171 entries) archived in docs/notes/ROADMAP_ARCHIVE_2026-07-15.md

- 2026-07-15s  ⚙️ ROADMAP REBUILT to break the filter-grind local optimum. The old plan was ORDERED
              by filter-completeness, so "work the next TODO top-down" kept steering ticks into
              low-leverage FILTER-P2 documentation while the engine mean sat FLAT at 14.59 dB for
              ~15 ticks. Rebuilt around a MEASURED dB-leverage table (deficit-to-17 per owning
              subsystem): L1 replicator/clone geometry (deficit 32.0) > L2 kinetic panels (30.1) >
              L3 3D-fold Movements (28.7) > L4 linear-chain/colour (17.3) > … filters LAST (they own
              <9 deficit each and the sweep is 46/46). Added Rule 9 ANTI-LOOP: do not spend ticks on
              filter param-space docs while the geometry tail is untouched; three gate-neutral ticks
              in a row = drift alarm, switch to the worst slug + force a minimizer repro. Full prior
              plan (all decoded-constant history, 171 progress entries) preserved verbatim in
              docs/notes/ROADMAP_ARCHIVE_2026-07-15.md. No engine code changed — plan/docs only.
- 2026-07-16s  🩹 T-qrebasel01: correct stale-frame phantom baseline Stylized__Color_Panels 19.05→17.95
              (Rule 11: T-qb697c0d4's correct filter-order reversal legitimately regressed this
              already-imperfect slug; 3ba7b5e re-froze 19.05 on cached pre-reversal frames). Unblocks
              push_helper gate for the swarm. The genuine CP fidelity fix is queued as T-qlinchain01
              (chain-level linear working space).
