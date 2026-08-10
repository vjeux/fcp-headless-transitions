# Anti-Shortcut System — why agents CAN'T take shortcuts anymore

Shortcuts happened because "be faithful" was advice. Advice loses under pressure. This turns
faithfulness into a mechanical GATE that blocks the commit and the PR. An agent physically cannot
land a shortcut; the only way forward is to do the transcription properly.

## The gate (raw-port/army/gate/gate.sh) — 4 checks, any failure REJECTS
G1 PROVENANCE (provenance_gate.py): every exporting file cites its source `@0xADDR`; ungrounded
   files may not invent hex/magic numbers; banned shortcut LANGUAGE (approximate/roughly/guess/
   heuristic/hack/fudge) and CODE (Math.random, swallowed catch, Date.now-as-value); a throwing
   "not yet transcribed" stub MUST cite the addr it's deferring (so depgraph.py can see the gap).
G2 TYPECHECK: tsc --noEmit clean.
(No .motr-parse gate: leaf math classes aren't in parseScene's import graph, so re-parsing
   after e.g. a PCMath change is a provable no-op; tsc already catches import-graph breakage. The
   65-transition corpus is used for end-to-end scoring once render classes land, not per-commit.)
G4 ORACLE (the un-fakeable one): for every changed file mapped in oracle_map.json, run the parity
   driver — it fuzzes inputs, calls the REAL FCP symbol via dlsym, and compares to the TS port. If
   the driver says DIVERGED/FAILED, the commit is rejected. You cannot fake matching Apple's own
   running code on random inputs; the only way to pass is a correct transcription.

## Enforcement points (defense in depth)
1. Pre-commit hook (install once: `bash raw-port/army/gate/install_hook.sh`) runs the gate on staged
   raw-port/src/*.ts. A shortcut never even reaches a commit. `--no-verify` bypass is logged and must
   be justified in review (and CI still catches it).
2. CI runs the same gate.sh on the PR diff. The reviewer agent will not merge a red gate.
3. mark_ported.py only flips a unit to "ported" from its @0xADDR citation; "verified" requires the
   oracle node to be green. The ledger cannot show progress for un-transcribed work.

## Why this specifically kills the observed shortcut patterns
- "hand-rolled Newton solver instead of FCP's recursive spline sampling" -> G4 diverges on
  curve.interp.bezier.eval (a correct-looking but different algorithm fails the bit-exact fuzz).
- "collapse the vtable dispatch into a string enum" -> P2/P1: the offsets aren't grounded to a
  decode reference / the file lacks address provenance.
- "silent fallback ?? 0 / approximate when unsure" -> P3/P5 banned tokens + P4 throw-must-cite.
- "invent a plausible constant" -> P2 ungrounded numeric literal in a file with no decode evidence.

## 1-to-1 mapping is structural, not aspirational
- ONE C++ class = ONE src/<layer>/<Class>.ts (the ledger is keyed by class; a file that doesn't map
  to a real FCP class fails review — the "invent-a-helper" smell).
- ONE C++ method = ONE exported function citing its @0xADDR. build_ledger.py enumerates every method
  address; a method with no citing function stays "todo" forever — you can't skip it silently.
- ONE data structure = ONE typed interface with every field's byte offset documented (`u  // +0x10`),
  recovered from the ctor + accessor disassembly. Magic offsets without that mapping fail G1/P2.

## Grow the oracle coverage as you port
Every pure-math class you port should get an oracle_map.json entry pointing at its registry.json
node (add the node if missing — declare framework + mangled symbol + typed signature). The more of
the port that is oracle-gated, the less any agent can drift. Pixel-producing paths that can't be
function-oracled are PSNR-gated against headless FCP instead (fct/faithful/).
