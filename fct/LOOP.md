# fct engine-vs-FCP fix loop — standing instructions

GOAL: drive the from-scratch JS/TS Motion engine to match REAL headless FCP on ALL 65 shipped
transitions. No time limit. Big refactors, new subsystems, deep binary RE, and fixing wrong
FCP-port code are ALL in scope. Repeat the loop below until every transition matches FCP.

## The loop (one iteration)
1. PICK the worst-diverging target.
   - `python3 fct/cli.py min-score` → per-minimized-case engine-vs-FCP PSNR (99 dB = fixed).
     Lowest `worst` dB first. These are already reduced to tiny repros.
   - If a needed transition has no minimized case yet: `python3 fct/cli.py minimize <slug>`
     (writes fct/minimized/<slug>/case.motr + headless/ + engine/ + manifest.json).
   - Whole-transition ranking (context): fct/AUDIT_2026-07-24.md task list + `fct baseline`
     scores in fct/baseline_engine.json.
   - Subsystem view: `python3 fct/cli.py subswarm list` (perspective/replicator/panels by deficit).

2. DIAGNOSE against the minimized repro. NEVER guess.
   - Structure: parse fct/minimized/<slug>/case.motr (layers/groups/scenenodes/mask/behavior/filter).
   - Visual: side-by-side headless vs engine at the worst frame (manifest.worst_frame).
       he=fct/minimized/<slug>/headless/*.png ; en=.../engine/*.png ; stack + view.
   - Decode the real FCP scene/params: `python3 fct/cli.py census <slug>`.
   - Deep RE when needed: otool -arch arm64 -tvV on the Filters.bundle / framework binary;
     extract_shader.py <HgcName>; read constants from __TEXT,__const (see fct/parity/oracle.py
     read_helium_const_matrix for the offset-mapping technique). air-objdump -d <metallib> for
     Metal shaders (Metal Toolchain installed).

3. FIX the root cause in engine/src (rig/movement/3D-transform/compositing/geometry/subsystem).
   - If the FCP-port code is wrong, fix it. If a subsystem is missing, build it.
   - Env-gate risky changes if they might regress, but PREFER a correct default once verified.

4. VERIFY (must all hold before moving on):
   - `npm --prefix engine run build` (tsc clean).
   - `python3 fct/cli.py min-gen <case> && python3 fct/cli.py min-score <case>` → the case PSNR rose.
   - `npm --prefix engine run test:node` → golden colour tests stay 0-diverge (no colour regression).
   - `python3 fct/cli.py min-regress` → NO other minimized case got worse.
   - Optional broad check: re-gen + score the affected slug(s) and neighbors; watch for regressions.
   - Then `python3 fct/cli.py min-baseline` to freeze the new (better) min-scores if improved.

5. COMMIT with a re(...)/fix(...) prefix describing the decoded root cause + before→after dB.
   Update fct/AUDIT_2026-07-24.md (check off / re-note the task). Update MEMORY/daily notes with
   the durable lesson.

6. REPEAT. Pick the next-worst. Keep going.

## Guardrails (from MEMORY.md)
- decode-don't-fit: never force-fit a guessed constant; read it from the binary or a clean probe.
- A minimize run that ABORTS at ~99 dB headless means the discrepancy is engine-vs-GUI
  (colour-management), NOT engine-vs-FCP — DIFFERENT class; note it, deprioritize vs real
  engine-vs-headless divergences.
- Never `git checkout`/revert a file without asking (loses uncommitted work).
- Run `arc f` equivalent / keep tsc green; all existing tests stay green.
- Careful-coder: measure twice. Reproduce, instrument, verify. Change one thing at a time.

## Current state (update as you go)
- Baseline: 65 transitions mean 17.83 dB, only 6/65 >25 dB (2026-07-24).
- Minimized cases still broken (min-score worst dB): Wipes__Diagonal, Replicator-Clones__*,
  Movements__Switch, Perspective__3D_Rectangle_cam, Stylized__Slide_In. See `fct/cli.py min-score`.
- Subsystem deficits: perspective 27.7, replicator 23.1, panels 21.0.

## Handy commands
  python3 fct/cli.py min-score [case|--all]
  python3 fct/cli.py minimize <slug> [--frames N] [--slack F] [--name NAME] [--params]
  python3 fct/cli.py census <slug>
  python3 fct/cli.py probe <slug> [frame]        # fast single-frame engine-vs-GUI PSNR
  python3 fct/cli.py gen engine <slug>           # re-render engine frames for a full slug
  python3 fct/cli.py score <slug> --source engine
  npm --prefix engine run build                   # tsc
  npm --prefix engine run test:node               # golden colour node tests
