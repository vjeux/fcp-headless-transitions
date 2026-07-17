# Faithful Reimplementation Program (compaction-proof)

## Why this exists
The old process (per-slug dB on 65 fixed GUI-GT transitions + a MIN_FIRES=2 no-hardcode
gate) STRUCTURALLY rewards overfitting: agents write scene-signature discriminators
(`isAnimatedZeroPeakZeroCurve`, `hasNestedMaskedCloneCameraStack`, the whole
`capabilities.ts` genre) that separate "the 1-2 slugs I'm assigned" from the rest and
dress it up as "structural." The real Motion engine has NONE of these — it runs ~20
generic filter plugins driven by their published parameters.

This program replaces the fitting target with an **ungameable per-primitive oracle** and
is driven ENTIRELY from disk so it survives context compaction / agent death / relaunch.

## The metric: DELTA RESPONSE (not absolute PSNR) — the core of the hardening
The old sweep compared `PSNR(oracle(θ), engine(θ))` on a FULL transition. That measures the
WHOLE pipeline (masks / retime / compositor / JPEG-vs-PNG source offset), NOT one filter —
so a bug ANYWHERE pinned the primitive to DIVERGED forever and the number was unattributable
(that's still per-slug fitting in disguise). Instead we measure how each engine RESPONDS to a
parameter change:

    delta_o = oracle(θ) − oracle(θ0)      # how FCP's output moves when the param moves
    delta_e = engine(θ) − engine(θ0)      # how our output moves
    ddb     = PSNR(delta_o, delta_e)      # do the two responses agree?

θ0 = authored params. Any pipeline error CONSTANT across θ (background render error, source
offset) CANCELS in the delta, so ddb isolates the FILTER's parameter response even inside a
full transition. Measured facts that make this trustworthy (see `driver selftest`):
- oracle & engine are both perfectly DETERMINISTIC (99 dB re-render), so every delta is real
  signal, not noise.
- the IDENTITY delta (θ0 vs θ0) noise floor is **99 dB** — a faithful engine scores ~99.
- `pass_db = 40` therefore flags only REAL parameter-response divergence, never quantization.

Why it's ungameable:
- engine ignores the param (no-op) → delta_e≈0, delta_o large → ddb LOW → FAIL
- engine overfit to θ0 → fuzz θ far away → engine wrong → ddb LOW → FAIL
- engine faithfully implements P(θ) → delta_e≈delta_o → ddb HIGH → PASS (regardless of const bg)

## The second anti-overfitting lever: STRUCTURAL VARIATION
Each primitive is swept across ALL its host slugs (PAEColorize: 7 hosts, PAELevels: 5, …),
not one. A scene-signature discriminator keyed to slug X's structure won't fire on host Y,
so a faithful engine passes on every host while an overfit one diverges on the others. The
primitive verdict is the **worst ddb across all (host, param, θ, time)**.

## SIGNAL GATING
Only score a sample where the ORACLE actually responded (`rms(delta_o) ≥ SIGNAL_FLOOR`). If
FCP's output doesn't move for that param in that host at that time, the param is inert there
and there's nothing to verify — skip it (don't reward or punish). `NO_SIGNAL` status means no
host produced a scorable response (needs a better host or a synthetic scene).

## The rules this program enforces (see ROADMAP Rule 12 + Rule 13)
- Behavior may depend ONLY on node type + filter type + parameter values.
- NO scene-signature dispatch (no `has*Family` / `is*Curve` / `matches*Stack` predicates).
- "Done" is NOT "65 slugs green". "Done" is: every primitive in catalog.json is VERIFIED
  (worst ddb ≥ pass_db across all hosts + its fuzzed continuous-param space). The 65 GUI-GT
  transitions demote to acceptance tests.

## Trust discipline: the harness self-test GATES every verdict
`driver.sweep_one` runs `selftest.main()` (T1..T5) FIRST and refuses to record a verdict or
file a todo if it fails (status `HARNESS_BROKEN`). A broken harness must NEVER drive the work.
- T1 ROUND-TRIP IDENTITY: zero-change mutate renders byte-identical (mutator + mirror ok).
- T2 MUTATION IS REAL: an extreme param actually changes the oracle output.
- T3 DETERMINISM: oracle(θ0) rendered twice is identical (delta metric premise).
- T4 DELTA-SELF SANITY: a real param has oracle signal AND delta-vs-itself ≈ 99 dB.
- T5 NEGATIVE CONTROL: a deliberately-biased engine response drops below pass_db — PROVES the
  gate can actually catch a divergence, not just pass everything.

## How it runs WITHOUT me (compaction-proof)
Everything is on disk. `driver.py step` (or a scheduled clock) each tick:
  1. reads state.json (append-only progress ledger) — NOT agent memory
  2. runs the selftest (T1..T5); aborts recording if the harness is broken
  3. picks the next primitive whose status != VERIFIED, in catalog priority order
  4. runs its DELTA sweep across all hosts × continuous params → divergence report in reports/
  5. worst ddb ≥ pass_db → VERIFIED; else DIVERGED + files a swarm todo with the exact
     diverging (host, param, θ) evidence; no oracle signal anywhere → NO_SIGNAL
  6. persists state.json + reports/<prim>.json (bookkeeping only, never engine code)
A fresh agent with ZERO context runs `python3 -m fct.faithful.driver status` and sees exactly
what's done, diverged, and next. Idempotent + resumable; state re-derived from disk every tick.

## dyld / SIP launch note (root-caused 2026-07-17)
The driver re-execs itself ONCE into the venv python with DYLD_FRAMEWORK_PATH set, gated only
by the private sentinel `_FCT_FAITHFUL_REEXEC`. This is required because: (a) macOS dyld
STRIPS DYLD_* when bash launches the adhoc-signed Homebrew python DIRECTLY (even though
os.environ still SHOWS the value) but PRESERVES it across an os.execv from a running python;
and (b) venv-python and base-Homebrew-python share the SAME realpath, so gating the re-exec on
`realpath(sys.executable)` never fired and the driver silently ran under base python (no
`objc` → every render errored → false DIVERGED −1.0). The sentinel gate fixes both.

## Files
- catalog.json    — durable brain: every primitive, real plugin_name, node_type, hosts, status
- driver.py       — resumable state machine (status / step / sweep <prim> / selftest / reset)
- fuzz.py         — DELTA-response sweep (oracle-vs-engine param response across hosts)
- schema.py       — real param schema + CONTINUOUS/FLAG/ENUM classifier (only continuous fuzzed)
- mutate.py       — byte-preserving mutator + primitive locator (filters AND generator scenenodes)
- render.py       — mirror-dir oracle + engine render (surfaces engine errors, not swallowed)
- selftest.py     — T1..T5 harness trust gate (identity / mutation / determinism / delta / neg-control)
- state.json      — append-only progress ledger (source of truth for "where are we")
- reports/        — per-primitive divergence reports (evidence for swarm todos)
