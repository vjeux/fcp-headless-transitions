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

### 🔁 ORCHESTRATOR: the harness-clobber loop and its (now structural) fix (2026-07-16)
Symptom seen 4× in one session: an agent lands a real engine win but its push ALSO reverts the
swarm harness (pool.py/cli.py/todo.py/push_helper.sh/agent_brief.md) to an older form — silently
undoing orchestrator fixes. MECHANISM: `push_helper.sh` rsyncs the agent's WHOLE worktree over a
fresh origin/main clone. An agent whose worktree was branched off an OLD origin/main carries a
STALE copy of the harness; a plain `rsync --delete` overlay rolls the clone's fresh harness BACK
to that stale copy. It is NOT a git-history revert (the fix commits stay in ancestry) — it's a
FILE-CONTENT overlay, so `git merge-base --is-ancestor` says "already landed" while the files are
reverted. FIX (structural, all three layers now on origin/main): (1) push_helper excludes the
whole `fct/swarm/**` from the overlay except the append-only `todo/` (verified: dst harness
preserved, agent todo + engine changes still land). (2) setup_worktree branches fresh off
origin/main AND salvages/restores excluding `fct/swarm/*` (no harness in salvage → no feedback
loop). (3) For agents ALREADY in-flight with a stale push_helper, the orchestrator copies the
fixed push_helper.sh into their live worktrees. Once all pre-fix agents cycle out, every path
sources harness only from origin/main. If you see a 5th clobber: check whether a NEW pre-fix
worktree slipped in, and re-verify push_helper on origin has `--exclude='/fct/swarm/**'`.

### Oracle validity per slug (pick your method before you start)
Headless FCP (`fct score <slug> --source headless`) is a TRUSTWORTHY per-slug oracle for most
clone/replicator slugs (it scores 13–32 dB vs the GUI GT), so `headless − engine` measures the
FINDABLE engine gap. L1 ranking (decoded 2026-07-15):

| slug | headless | engine | gap | note |
|---|---|---|---|---|
| 3D_Rectangle | 32.25 | 16.79 | **15.46** | biggest gap; engine renders ~flat A (reveal missing) |
| Multi | 19.48 | 11.85 | 7.63 | ⚠️ **DEGENERATE GT** — do NOT target (below) |
| Squares | 17.70 | 13.11 | 4.59 | ⚠️ headless order does NOT match GT (corr 0.102) — NOT a valid oracle |
| Combo_Spin | 14.54 | 11.21 | 3.33 | 6-blade replicator spiral |
| Clone_Spin | 13.54 | 10.32 | 3.22 | framing camera |
| Video_Wall | 13.37 | 10.24 | **3.13** | SMALLEST gap — the 7 prior Video_Wall-only ticks were the Rule-9 drift trap |

Lesson: prefer the BIG-gap slugs (3D_Rectangle, Squares, Combo_Spin). Video_Wall has the
smallest findable headroom of the L1 group. **Exception: Squares** — headless does NOT
reproduce the GT reveal order (correlation 0.102), so for Squares the GUI GT is the ONLY
oracle (the symmetric-order decode below is from the GUI GT, not headless).

### ⛔ MULTI — DEGENERATE GUI GT, not a real target (decoded 2026-07-15)
Multi's `~/fct-gui-gt` capture shows FCP's EMPTY-DROP-ZONE PLACEHOLDER graphic (uniform gray
R=G=B≈106 with down-arrow glyphs; f10 meanRGB=[106,106,106] std 58) for the inner tiles, NOT
real photo content — captured with unfilled drop zones. Headless renders the same gray (mean
60). The TS engine CORRECTLY fills the tiles with the A/B photos, so it "diverges" from a
placeholder. Matching placeholder arrows is not reverse-engineering; the 7.63 "gap" is a
capture artifact. SKIP until the GT is re-captured with real media.

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
