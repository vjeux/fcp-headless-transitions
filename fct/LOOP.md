# fct engine-vs-FCP fix loop — standing instructions

GOAL: drive the from-scratch JS/TS Motion engine to match REAL headless FCP on ALL 65 shipped
transitions. NO TIME LIMIT. Big refactors, new subsystems, deep binary RE, and fixing wrong
FCP-port code are ALL in scope and EXPECTED. Repeat the loop below until every transition matches FCP.

## THREE HARD RULES (do not violate — these override any urge to move on)

### RULE 0 — NEVER STOP WORKING. The cron is a safety net, not a work trigger.
Do NOT "record findings and wait for the next cron tick." Do NOT "reach a good stopping point."
There is no stopping point. If you know what to do next, DO IT NOW. The 10-minute cron exists only
as a backup in case context is lost — it is NEVER permission to pause. If you have diagnosed a bug,
IMPLEMENT THE FIX immediately. If you have implemented a fix, VERIFY IT immediately. If you have
verified, COMMIT+PUSH and PICK THE NEXT immediately. Momentum is everything. Depth AND speed.
(A local-only commit is not done: always `git push` right after committing so no fix is stranded.)

### RULE 1 — A divergence is a bug, PERIOD. Minimize maximally, fix the tiny thing, repeat.
If a minimized case diverges from FCP-headless, that IS a real engine bug that must be
investigated and FIXED — even if it is "not the original transition's primary bug", even if the
minimizer "stripped context", even if an old note called it "secondary" or "a poor oracle".
The minimized .motr is a valid FCP document; FCP renders it a specific way; the engine MUST match
that exact output.

The WHOLE POINT of minimization is to shrink the document AS FAR AS POSSIBLE so that ONE tiny,
unambiguous defect remains — with as few confounding effects as you can get. This means:
  - SMALLER IS ALWAYS BETTER. A 30-line repro beats a 500-line one, always.
  - CHANGING THE FLAVOUR OF THE BUG IS A WIN, NOT A LOSS. If aggressive minimization turns a
    "16%-too-narrow plate" repro into an "engine renders black where FCP renders grey" repro,
    that is GREAT — the smaller repro isolates a simpler defect. Do NOT try to preserve the
    "same" bug the original transition showed. Do NOT reject a smaller repro because it "no longer
    captures the real bug" — there is no single "real bug", just a stack of defects, and the
    minimal repro hands you the easiest one to fix next.
  - Then the workflow is: minimize maximally → fix whatever the tiny repro shows → re-run the
    minimizer from source → fix the next tiny thing it reveals → repeat. Each pass peels off one
    small, cleanly-isolated defect. You never get lost debugging a pile of interacting effects.
"This repro doesn't capture the real bug" / "poor oracle" is NEVER a reason to skip a case — the
concept of "poor oracle" is RETIRED. Every minimal divergence is a real, fixable bug. Do NOT move
to a different transition because the current one is hard; finish the one in front of you first.


### RULE 2 — Fix thoroughly. No short-term hacks. Take all the time you need.

#### RULE 2.0 — DECODE BEFORE YOU EDIT. No guessed constants, values, or branches. (HARD GATE)
Before writing ANY engine change that introduces a specific value, default, threshold, ordering, or
conditional branch, you MUST have REVERSE-ENGINEERED what FCP's code actually does — from one of:
  (a) the FCP/Ozone/Filters binary (otool -tvV, air-objdump on metallib, __const constant reads),
  (b) the shader source (tools/re/extract_shader.py), OR
  (c) a CONTROLLED-INPUT PROBE of the real headless engine that isolates the exact law (vary ONE
      input through ozengine.render_frame, measure the output response, and confirm the relationship
      is deterministic and matches your model on values you did NOT fit).
A change is FORBIDDEN if its justification is "this value/branch makes the pixels match" without a
decoded source. Specifically BANNED (these are guesses, not decodes):
  • Inventing a default (e.g. "a shape with no Fill Color defaults to white (255,255,255)") because
    it happens to match — unless you have READ that default out of FCP (binary/param default=/probe
    that proves it). "Motion's Fill Color param default= is 1.0" IS a decode; "white looks right" is NOT.
  • Picking a magic threshold / count gate (e.g. `verticesX.length >= 3`) to make a case render.
  • Guessing how a degenerate/missing input is resolved (empty vertex = 0? = default? = dropped?)
    without PROBING the real engine to observe the actual rule.
  • Any "fits the observed pixels" constant with no independent verification.
If you CANNOT yet decode the mechanism (inert inputs, no binary symbol, probe inconclusive): STOP,
write the exact decode blocker to the AUDIT, and pick a case whose mechanism you CAN decode. Shipping
a plausible guess is WORSE than shipping nothing — it hides the real bug and rots the engine.
PROCESS for every fix: (1) reproduce, (2) DECODE the FCP mechanism from binary/shader/controlled
probe, (3) state the decoded law explicitly (what FCP does, and the evidence), (4) implement exactly
that, (5) verify on inputs you did NOT use to derive it. If step 2 or 3 can't be completed, do not edit.

- Diagnose to the ROOT CAUSE. Reproduce, instrument, decode from the binary/shader/scene — never
  guess, never curve-fit a constant (decode-don't-fit), never special-case a single slug to move a
  number. A fix must be the CORRECT general mechanism, verified against FCP.
- The 10-minute cron is ONLY a heartbeat so the work continues across turns. It is NOT a deadline
  and NOT permission to ship a partial/quick fix to "make the tick productive". If a fix needs a
  large subsystem, a deep refactor, hours of binary RE across many ticks — DO THAT. It is fine and
  expected for a single bug to span many cron ticks. Depth over breadth. Correctness over score.
- NO FEATURE FLAGS. Never add an `FCT_*` env gate / opt-in flag to guard a fix. There is exactly
  ONE behavior: the decoded-correct one, always on. If a fix is the decoded-faithful FCP mechanism,
  ship it as the unconditional default. (All prior FCT_* flags were removed 2026-07-24 — do not
  reintroduce the pattern. The only surviving FCT_* env vars are the render harness inputs
  FCT_RENDER_MOTR/A_PNG/B_PNG/T/OUT and the gen/slug driver vars — never behavior toggles.)
- Do not gate a fix to avoid a regression it exposes. If the correct fix regresses something else,
  that "something else" was relying on wrong behavior — but you do NOT need to fix or even measure
  that other case now. Ship the decoded-correct fix and move on; the other case is its own separate
  bug you'll reach later. Never chase regressions or hold a correct fix hostage to another slug's
  score.

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

3. MINIMIZE MAXIMALLY, then re-minimize after every fix. The `fct minimize` tool now shrinks
   BOTH structure AND file content (struct-node removal + boilerplate/param/generic-element removal
   + value simplification), gated only on "engine still renders AND still diverges >= target" — it
   has NO upper bound and does NOT try to preserve the original bug's identity, so it drives to the
   smallest possible repro of SOME divergence. Let it. A tiny repro (a few dozen lines showing ONE
   defect) is the goal; if it shows a different/simpler defect than the full transition did, that is
   a WIN (RULE 1). The workflow is: `fct minimize <slug>` → fix the one tiny thing it shows →
   `fct minimize <slug>` again from source → fix the next tiny thing → repeat until 99 dB.
   - If the automated minimizer leaves something still too complex to reason about (two wavefronts,
     a feather, an animated sweep AND a gradient all at once), HAND-CUT further on a COPY. Render
     each edit through BOTH engines and diff, keeping a cut only if the engine STILL diverges:
       FCP:    (venv) python3 -c "import tools.ozengine as z; z.init_engine(); d=z.load_doc('/tmp/m.motr'); z.render_frame(d, IMG_A, IMG_B, T, '/tmp/h.png')"
       engine: (cwd engine/) FCT_RENDER_MOTR=/tmp/m.motr FCT_RENDER_A_PNG=/tmp/A.png FCT_RENDER_B_PNG=/tmp/B.png FCT_RENDER_T=<t> FCT_RENDER_OUT=/tmp/e.png node_modules/.bin/tsx test/_fct_render_motr.ts
   - Hand-cut moves (one at a time; keep only if divergence survives):
       * DELETE nodes: whole layers/groups/scenenodes/masks/behaviors/filters, sibling by sibling.
       * FREEZE animation → statics: replace an animated <curve> with a single static `value=` at the
         divergent frame's time. If the still frame still diverges, the bug is geometric/compositing,
         NOT timing; if it only diverges while moving, the bug is the sweep/write-on.
       * FLATTEN params: Feather→0, Roundness→0, Aspect→1, collapse a bezier to a rect/quad,
         Opacity→1, remove blend modes, set colours to pure black/white so the defect is unambiguous.
       * COLLAPSE timing: in=0, out=huge, offset=0 to remove timing-out/visibility-window effects.
       * PICK ONE FRAME: the single time T where engine-vs-FCP is worst; debug only that.
   - Save the reduced case as fct/minimized/<slug>[_<tag>]/case.motr with its headless/ + manifest so
     it is a permanent regression repro. THEN diagnose that. Every distinct minimal divergence is its
     own bug (RULE 1) — fix them one at a time, re-minimizing between fixes.

4. FIX the root cause in engine/src (rig/movement/3D/compositing/geometry/subsystem/parser/…).
   - If the FCP-port code is wrong, fix it. If a subsystem is missing, BUILD it. If it needs a big
     refactor, do it. Correct general mechanism only — verified on the hyper-minimal repro first.

5. VERIFY (keep it fast and LOCAL to the bug you fixed — do NOT chase regressions):
   - `npm --prefix engine run build` (tsc clean); remove any debug instrumentation.
   - `python3 fct/cli.py min-gen <case> && python3 fct/cli.py min-score <case>` → confirm the
     case you targeted reaches ~99 dB (or is materially fixed and you understand the residual).
   - Do NOT run min-regress, do NOT re-score other minimized cases, do NOT re-render or score the
     full 65-slug suite. Other slugs/cases have their OWN unrelated bugs; watching their scores
     move wastes time and confuses diagnosis. If a fix is the correct decoded FCP mechanism
     (verified against headless on the case in front of you), it is right — SHIP IT. If it happens
     to move another case, that other case is its own separate bug to fix when you get to it.
   - `npm --prefix engine run test:node` → golden colour NODE tests should stay green (these are
     fast, isolated per-node oracles — the one broad check worth keeping). If a decoded fix
     genuinely changes a node's correct behavior, update the golden, don't fight it.
   - `python3 fct/cli.py min-baseline` to freeze the improved score for the case you fixed.

6. COMMIT + PUSH (re(...)/fix(...) prefix): decoded root cause + before→after dB. Update
   fct/AUDIT_2026-07-24.md and MEMORY/daily notes with the durable lesson.
   - ALWAYS `git push` immediately after committing — a commit that only lives locally is
     NOT done. Push every fix as soon as it is committed so work is never stranded on the Mac
     (the box can recycle). Standard: `git add -A && git commit -m ... && git push`.
   - If push is rejected (remote moved), `git pull --rebase origin main` then push again; if the
     rebase conflicts, resolve surgically (never `git checkout`/reset away local work) and push.

7. RE-MINIMIZE, THEN pick the next. After the fix, run `fct minimize <slug>` again from source:
   the defect you fixed is gone, so the minimizer now drives to the NEXT tiny divergence (often a
   smaller/different repro). Fix that. Repeat until the slug reaches 99 dB, then pick the next-worst
   slug. Keep going. Never stop.

## Guardrails
- decode-don't-fit: read constants from the binary or a clean probe; never force-fit a guess.
- NO MINIMIZER "PROTECTIONS" (policy 2026-07-26). The minimizer strips EVERYTHING — it has NO
  always-on guards that keep a node/attr/tag "because FCP depends on it" (the old referenced-source
  / Rig-Behavior / drop-zone-binding / <enabled>0</enabled> / scene-geometry / <factory> / vertex-
  index protections are ALL removed). The goal is to MATCH FCP on every input, INCLUDING degenerate
  / error / stripped cases. When a strip makes the engine diverge from FCP-headless, that is a REAL
  bug: reverse-engineer what FCP renders for that stripped input (placeholder glyph, default 1920×1080
  coordinate space, index-keyed vertex pairing, a disabled node still driving a clone, …) and make
  the ENGINE reproduce it — then the minimized case no longer diverges and you move to the next.
  NEVER re-add a protection to "keep the repro faithful"; that only hides the mismatch. The only
  non-semantic exclusions are the explicit `--protect <type>` opt-in, unparseable-envelope tags, and
  the id/factoryID/value/uuid parse-identity attrs.
- SMALLER-AND-DIFFERENT IS THE GOAL. `fct minimize` shrinks maximally and does NOT preserve the
  original bug's identity — expect the reduced repro to sometimes show a simpler/different defect
  than the full transition. That is correct and desirable (RULE 1). "Poor oracle" is a RETIRED
  concept: never reject or de-prioritize a minimal case because it "isn't the real bug". Fix what
  the tiny repro shows, then re-minimize from source and fix the next thing.
- A minimize run that ABORTS at ~99 dB headless = engine-vs-GUI (colour-management), a DIFFERENT
  class. Still a real divergence to understand, but tracked separately; note it and keep it distinct
  from engine-vs-FCP-headless bugs. (This is the ONE case where "not this loop's target" is valid,
  and even then you record WHY.)
- Never `git checkout`/revert a file without asking (loses uncommitted work).
- Keep tsc green; all existing tests stay green.
- Careful-coder: measure twice. Reproduce, instrument, verify. Change one thing at a time.

## Handy commands
  python3 fct/cli.py min-score [case|--all]
  python3 fct/cli.py minimize <slug> [--frames N] [--frame I] [--slack F] [--name NAME] [--protect T,…]
  #   minimize shrinks structure AND file content (boilerplate/param/generic-element removal +
  #   value simplification), always on — no flag needed. It drives to the SMALLEST doc that still
  #   diverges, with NO upper bound (a smaller/different defect is a win). --protect keeps a named
  #   Motion subsystem's whole subtree intact. (--params is accepted but a no-op; line passes are
  #   unconditional now.)
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
