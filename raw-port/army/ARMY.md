# Operation Faithful Port — Army Plan

Decompile FCP's rendering code and port it 1:1 to TypeScript, using many parallel agents, WITHOUT
inventing anything. This industrializes the per-function workflow already proven on the interpolator
subsystem (CMTime, OZLinear/SCurve/Convex/Concave transcribed + verified from disassembly).

## 0. Non-negotiable law (why the earlier eval layer was deleted)
A port is a TRANSCRIPTION of the disassembly, never a behavior-equivalent rewrite. If a function is
not yet decoded, the port THROWS ("not yet transcribed") — it never approximates. Every ported
function MUST cite the address it was transcribed from (`@0xADDR`), which is how the ledger detects
completion and how reviewers audit faithfulness. Guessing = the work is rejected.

## 1. Scope is DEMAND-DRIVEN, not "port all 131,792 functions"
The four frameworks hold ~131.8K defined functions (Flexo 86.6K, Ozone 33.2K, ProChannel 6.4K,
ProCore 5.5K). We do NOT port them all. We port the TRANSITIVE CALL-CLOSURE of what actually runs
when rendering the 65 shipped transitions, expanded lazily:
  - Seed = the entry points already exercised: readScene, the parse{Begin,Element,End} chain, the
    channel/curve/interpolator subsystem, and (next) the render/compositor entry.
  - A unit enters the frontier when a TRANSCRIBED function calls it (the `throw` at an un-ported
    callee is the demand signal). Agents pull the next frontier unit, decode it, port it, which
    reveals its callees -> new frontier. BFS outward from real execution, so we never port dead code.
  - `army/tools/frontier.py` computes the current frontier from src/ throws + call-sites.

## 2. The work ledger (source of truth for "what's left")
`army/inventory/<FW>.syms.txt`  — `nm -n` defined-symbol dump per framework (regenerate: tools/dump_syms.sh).
`army/ledger/<FW>.ledger.json`  — {class: {method@addr: {addr, mangled, demangled, status}}}.
`army/ledger/CLASSES.tsv`       — class sizes, for partitioning + progress.
Status: todo -> claimed(agent,ts) -> ported(addr cited in src) -> verified(oracle-checked).
`army/tools/build_ledger.py` regenerates the ledger; `army/tools/mark_ported.py` flips status by
scanning src/ for `@0xADDR` citations (idempotent; run after every batch).

## 3. Partitioning (collision-free parallelism)
Unit of assignment = ONE C++ CLASS = ONE TypeScript file `src/<layer>/<Class>.ts` (mirrors FCP's
class hierarchy, one class per file — already the convention: OZChannel.ts, OZScene.ts, ...).
- Agents claim a class by writing `army/claims/<FW>.<Class>.claim` (contains agent id + UTC ts).
  A claim file is an advisory lock; the coordinator rejects double-claims.
- Classes are independent files -> no merge conflicts. Cross-class refs go through imports only.
- Base classes are decoded FIRST (an agent porting OZImageElement needs OZElement/OZTransformNode/
  OZSceneNode already ported or stubbed-with-throw). The coordinator topologically orders by
  inheritance depth (from the base-call trace in each parseBegin) and by the frontier BFS.

## 4. Per-unit agent recipe (what each agent runs)
1. Claim the class (write claim file). Read army/PORTING_SPEC.md.
2. For each method (addr) in the class ledger:
   a. `tools/disasm.sh <Class> <method> <FW>` -> re/disasm/<FW>.<Class>.<method>.s
   b. Resolve every callee/stub/vtable slot via `tools/resolve.py <addr>` (dyld_info -fixups +
      nm map + chained-fixup decode — the exact tooling used for the interpolators).
   c. Transcribe to src/<layer>/<Class>.ts, one function, citing @0xADDR + the callee addresses.
      Un-ported callees are called through the throwing stub (adds them to the frontier).
   d. Model any struct offsets used (vertex+0x10 etc.) as documented constants, never magic numbers.
3. `tsc --noEmit` must pass. Add a micro-verification (see §5). Commit + push (one class per commit).
4. Update the class ledger status; drop the claim.

## 5. Verification gate (proves faithful, not just compiling)
Two levels, both required before a unit is "verified":
- STATIC: tsc clean; every function cites @0xADDR; no silent fallback (throw on undecoded).
- ORACLE: run the ported function against the REAL FCP function via the dlsym oracle
  (fct/parity/ harness) OR against known .motr-derived values. Bit-exact for pure-math (CMTime,
  interpolators, color, matrix); PSNR-gated for pixel-producing paths. The parity harness is the
  same one that VERIFIED the colour-transfer nodes. A unit that can't be oracle-checked yet is
  marked "ported" (not "verified") and flagged for the oracle backlog.

## 6. Coordinator (the "general")
A parent agent (or the scheduled loop) that: refreshes the ledger + frontier, topologically orders
ready units, spawns N sub-agents each assigned a disjoint set of classes from the frontier, collects
their commits, re-runs mark_ported + the oracle gate, and re-computes the frontier. Loops until the
render closure is fully ported + verified. Batch size tuned to keep each sub-agent under its context
budget (≈1 class or a few tiny classes per sub-agent).

## 7. Layers (directory layout under src/)
  infra/     PC* : PCSerializerReadStream, PCStreamElement, PCString, CMTime, PCColor, PCMatrix44 ...
  channels/  OZChannel*, OZCurve, OZSpline, OZ*Interpolator, OZInterpolators ...
  nodes/     OZSceneNode, OZElement, OZTransformNode, OZGroup, OZImageElement, OZScene, OZCamera ...
  render/    the compositor / rasterizer / framing (next frontier after parse+channels)
  (each file = one C++ class; free functions grouped by their translation unit .mm/.cpp)

## 8. Milestones
  M1 Parser closure       — every parse{Begin,Element,End} on the 65 .motr reachable set (in progress).
  M2 Channel/curve eval   — CMTime + all interpolators + OZSpline sampler (5/10 interpolators done).
  M3 Transform/matrix     — OZTransformNode::getTransformMatrix + PCMatrix44 compose (decoded, TODO).
  M4 Render/compositor    — the pixel pipeline (largest; Flexo-heavy).
  M5 Full parity          — every reachable unit oracle-verified against dlsym FCP.
