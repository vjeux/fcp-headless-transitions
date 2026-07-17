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

## The ungameable oracle
`tools/ozengine.render_frame(doc, imgA, imgB, tsec, out)` renders ANY .motr through the
REAL FCP headless engine. For each Motion primitive (PAEGaussianBlur, PAEColorize,
PAEScrape, PAEBloom, PAEMinMax, the replicator, the retime engine, …) we generate MANY
synthetic single-filter .motr scenes with RANDOM parameter values, render each through
BOTH headless FCP (truth) and the TS engine, and compare. A shape-fingerprint discriminator
dies the instant a random scene has that fingerprint but shouldn't — overfitting becomes
mechanically impossible because the test set is effectively infinite and unseen.

## The rules this program enforces (see ROADMAP Rule 12 + Rule 13)
- Behavior may depend ONLY on node type + filter type + parameter values.
- NO scene-signature dispatch (no `has*Family` / `is*Curve` / `matches*Stack` predicates
  that gate behavior on a combination of unrelated scene attributes).
- "Done" is NOT "65 slugs green". "Done" is: every primitive in catalog.json is VERIFIED
  (headless-vs-TS >= PASS_DB across its fuzzed parameter space). The 65 GUI-GT transitions
  demote to acceptance tests.

## How it runs WITHOUT me (compaction-proof)
Everything is on disk. A scheduled clock ("faithful-tick") calls `driver.py step` every
interval. Each step:
  1. reads state.json (append-only progress ledger) — NOT agent memory
  2. picks the next primitive whose status != VERIFIED, in catalog priority order
  3. runs its fuzz sweep (oracle vs engine) -> writes a divergence report to reports/
  4. if diverged: files/updates a swarm todo (todo/T-faithful-<prim>.json) with the
     concrete divergence evidence, sets status=DIVERGED
  5. if converged across the whole sweep: sets status=VERIFIED
  6. commits+pushes state.json + reports (bookkeeping only, never engine code)
A fresh agent with ZERO context can run `python3 -m fct.faithful.driver status` and see
exactly what's done, what's diverged, and what's next. The driver is idempotent and
resumable: state lives in state.json, re-derived from disk every tick.

## Files
- catalog.json    — the durable brain: every primitive, its param schema, priority, status
- driver.py       — the resumable state machine (status / step / sweep <prim>)
- fuzz.py         — synthetic single-filter .motr generator + oracle-vs-engine comparator
- state.json      — append-only progress ledger (the source of truth for "where are we")
- reports/        — per-primitive divergence reports (evidence for swarm todos)
