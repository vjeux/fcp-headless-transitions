# fct engine-vs-FCP fix loop — standing instructions

GOAL: drive the from-scratch JS/TS Motion engine to match REAL headless FCP on ALL 65 shipped
transitions. NO TIME LIMIT. Big refactors, new subsystems, deep binary RE, and fixing wrong
FCP-port code are ALL in scope and EXPECTED. Repeat the loop below until every transition matches FCP.

## TWO HARD RULES (do not violate — these override any urge to move on)

### RULE 1 — A divergence is a bug, PERIOD. Never dismiss a minimized case.
If a minimized case diverges from FCP-headless, that IS a real engine bug that must be
investigated and FIXED — even if it is "not the original transition's primary bug", even if the
minimizer "stripped context", even if a manifest note calls it "secondary" or "a poor oracle".
The minimized .motr is a valid FCP document; FCP renders it a specific way; the engine MUST match
that exact output. "This repro doesn't capture the real bug" is NEVER a reason to skip it — it just
means there are (at least) TWO bugs, and you fix the one in front of you first. Do NOT re-minimize
to dodge a hard case. Do NOT move to a different transition because the current one is hard. Finish
what you started before picking anything new.

### RULE 2 — Fix thoroughly. No short-term hacks. Take all the time you need.
- Diagnose to the ROOT CAUSE. Reproduce, instrument, decode from the binary/shader/scene — never
  guess, never curve-fit a constant (decode-don't-fit), never special-case a single slug to move a
  number. A fix must be the CORRECT general mechanism, verified against FCP.
- The 10-minute cron is ONLY a heartbeat so the work continues across turns. It is NOT a deadline
  and NOT permission to ship a partial/quick fix to "make the tick productive". If a fix needs a
  large subsystem, a deep refactor, hours of binary RE across many ticks — DO THAT. It is fine and
  expected for a single bug to span many cron ticks. Depth over breadth. Correctness over score.
- Do not env-gate a fix just to avoid dealing with a regression it exposes. If the correct fix
  regresses something else, that "something else" was relying on wrong behavior — chase THAT to its
  root too. Prefer a correct default; only gate when you have a decoded reason the two truly differ.

## The loop (one iteration)
1. PICK a target. If a fix is already in progress, CONTINUE it — do not switch.
   - `python3 fct/cli.py min-score` → per-minimized-case engine-vs-FCP PSNR (99 dB = fixed).
     Work the lowest `worst` dB. These are already reduced to tiny repros.
   - Only if a needed transition has no minimized case: `python3 fct/cli.py minimize <slug>`.
   - Context: fct/AUDIT_2026-07-24.md task list, fct/baseline_engine.json (engine-vs-headless),
     `python3 fct/cli.py subswarm list` (perspective/replicator/panels deficits).

2. DIAGNOSE against the minimized repro to the ROOT CAUSE. NEVER guess.
   - Structure: parse fct/minimized/<slug>/case.motr.
   - Visual: stack headless vs engine at the worst frame; SHOW it to yourself (read the image).
     Watch for background/alpha-flatten differences (transparent→white vs →black), scale, position,
     z-order, timing/visibility windows, missing subsystems.
   - Decode real FCP scene/params: `python3 fct/cli.py census <slug>`.
   - Instrument the engine (add a debug env flag + console.error, rebuild, render one frame with
     test/_fct_render_motr.ts via FCT_RENDER_MOTR/T/OUT). REMOVE debug before committing.
   - Deep RE when needed: otool -arch arm64 -tvV on Filters.bundle / framework binaries;
     tools/re/extract_shader.py <HgcName>; read __TEXT,__const constants (fct/parity/oracle.py
     read_helium_const_matrix); air-objdump -d <metallib> (Metal Toolchain installed).

3. MANUALLY HYPER-MINIMIZE until ONE frame shows ONE defect. (Do NOT skip this — it is the
   single most important debugging step. `fct minimize` only strips whole structural nodes; it
   stops while the repro still has MANY interacting effects. A repro with two wavefronts, a
   feather, an animated sweep, timing-outs, AND a gradient is TOO COMPLEX to reason about — keep
   cutting BY HAND until exactly one thing is wrong.)
   - Work on a COPY: `cp fct/minimized/<slug>/case.motr /tmp/m.motr` and edit /tmp/m.motr directly.
     Render each edit through BOTH engines and diff, to confirm the divergence SURVIVES the cut:
       FCP:    (venv) python3 -c "import tools.ozengine as z; z.init_engine(); d=z.load_doc('/tmp/m.motr'); z.render_frame(d, IMG_A, IMG_B, T, '/tmp/h.png')"
       engine: (cwd engine/) FCT_RENDER_MOTR=/tmp/m.motr FCT_RENDER_A_PNG=/tmp/A.png FCT_RENDER_B_PNG=/tmp/B.png FCT_RENDER_T=<t> FCT_RENDER_OUT=/tmp/e.png node_modules/.bin/tsx test/_fct_render_motr.ts
     (or add /tmp/m.motr to a slugmap and use min-gen-style rendering). KEEP a cut only if engine
     STILL diverges from FCP on the reduced doc; otherwise revert that cut.
   - Aggressive manual reductions to try, one at a time:
       * DELETE nodes: whole layers/groups/scenenodes/masks/behaviors/filters, sibling by sibling.
         Reduce to the SMALLEST set that still diverges (often 1 layer + 1 mask, or even 1 shape).
       * FREEZE animation → statics: replace an animated <curve> (Position/Rotation/Scale/vertex
         Value) with a single static `value=` at the divergent frame's time. A moving sweep becomes
         a STILL mask at one position — if the still frame still diverges, the bug is geometric/
         compositing, NOT timing. If it only diverges while moving, the bug is the sweep/write-on.
       * FLATTEN params: Feather→0, Roundness→0, Aspect→1, collapse a bezier to a simple rect/quad,
         Opacity→1, remove blend modes, set colours to pure black/white so the defect is unambiguous.
       * COLLAPSE timing: set in=0, out=huge, offset=0 to remove timing-out/visibility-window effects
         (isolate them SEPARATELY — a disappearing layer is its own distinct bug from a mask sweep).
       * PICK ONE FRAME: find the single time T where engine-vs-FCP is worst and debug only that.
   - GOAL: a handful-of-lines .motr where a single static frame shows exactly one wrong thing
     (e.g. "a still feathered quad at position P masks the wrong region" or "layer with out=X is
     black when FCP shows it"). Save it as fct/minimized/<slug>_<tag>/case.motr with its own
     headless/ + manifest so it becomes a permanent regression repro. THEN diagnose that.
   - If the original repro contains MULTIPLE independent bugs, split them into MULTIPLE hyper-minimal
     cases and fix each separately (RULE 1: every divergence is its own bug).

4. FIX the root cause in engine/src (rig/movement/3D/compositing/geometry/subsystem/parser/…).
   - If the FCP-port code is wrong, fix it. If a subsystem is missing, BUILD it. If it needs a big
     refactor, do it. Correct general mechanism only — verified on the hyper-minimal repro first.

5. VERIFY (all must hold before the bug is "done"):
   - `npm --prefix engine run build` (tsc clean); remove any debug instrumentation.
   - `python3 fct/cli.py min-gen <case> && python3 fct/cli.py min-score <case>` → the case reaches
     ~99 dB (or is materially fixed and you understand the exact remaining residual).
   - `npm --prefix engine run test:node` → golden colour tests stay 0-diverge.
   - `python3 fct/cli.py min-regress` → NO other minimized case got worse.
   - Re-gen + score the full affected slug(s): `python3 fct/cli.py gen engine <slug>` then
     `python3 fct/cli.py score <slug> --source headless` (engine-vs-headless). Watch neighbors.
   - `python3 fct/cli.py min-baseline` to freeze the improved min-scores.

6. COMMIT (re(...)/fix(...) prefix): decoded root cause + before→after dB. Update
   fct/AUDIT_2026-07-24.md and MEMORY/daily notes with the durable lesson.

7. Only THEN pick the next-worst. Keep going. Never stop.

## Guardrails
- decode-don't-fit: read constants from the binary or a clean probe; never force-fit a guess.
- A minimize run that ABORTS at ~99 dB headless = engine-vs-GUI (colour-management), a DIFFERENT
  class. Still a real divergence to understand, but tracked separately; note it and keep it distinct
  from engine-vs-FCP-headless bugs. (This is the ONE case where "not this loop's target" is valid,
  and even then you record WHY.)
- Never `git checkout`/revert a file without asking (loses uncommitted work).
- Keep tsc green; all existing tests stay green.
- Careful-coder: measure twice. Reproduce, instrument, verify. Change one thing at a time.

## Handy commands
  python3 fct/cli.py min-score [case|--all]
  python3 fct/cli.py minimize <slug> [--frames N] [--slack F] [--name NAME] [--params]
  python3 fct/cli.py census <slug>
  python3 fct/cli.py gen engine <slug>            # re-render engine frames for a full slug
  python3 fct/cli.py score <slug> --source headless
  # render one arbitrary .motr frame (engine): FCT_RENDER_MOTR=<abs.motr> FCT_RENDER_T=0..1 \
  #   FCT_RENDER_OUT=/tmp/x.png node_modules/.bin/tsx test/_fct_render_motr.ts   (cwd=engine/)
  npm --prefix engine run build                    # tsc
  npm --prefix engine run test:node                # golden colour node tests

## Current state (update as you go)
- Baseline: 65 transitions mean 17.83 dB, only 6/65 >25 dB (2026-07-24).
- IN PROGRESS: Replicator-Clones__Concentric — group Image Mask fires (2.2% ring, correct) but the
  masked-OUT region flattens to WHITE in the engine while FCP shows it BLACK (near-0 mean). Root
  cause under investigation = transparent/alpha background flatten (transparent→white vs →black),
  NOT the mask itself. FINISH THIS before anything else.
- Subsystem deficits: perspective 27.7, replicator 23.1, panels 21.0.
