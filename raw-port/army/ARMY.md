# Operation Faithful Port — Army Plan

Decompile FCP's rendering code and port it 1:1 to TypeScript, using many parallel agents, WITHOUT
inventing anything. This industrializes the per-function workflow already proven on the interpolator
subsystem (CMTime, OZLinear/SCurve/Convex/Concave transcribed + verified from disassembly).

## 0. Non-negotiable law (why the earlier eval layer was deleted)
A port is a TRANSCRIPTION of the disassembly, never a behavior-equivalent rewrite. If a function is
not yet decoded, the port THROWS ("not yet transcribed") — it never approximates. Every ported
function MUST cite the address it was transcribed from (`@0xADDR`), which is how the ledger detects
completion and how reviewers audit faithfulness. Guessing = the work is rejected.

## 1. Scope is THE ENTIRE ENGINE — every function in every framework
GOAL (authoritative, per vjeux 2026-07-28): port the COMPLETE FCP engine to TypeScript — ALL
~131.8K defined functions across Flexo (86.6K), Ozone (33.2K), ProChannel (6.4K), ProCore (5.5K),
plus Helium (12.5K) and every Metal shader. There is NO "dead code" exclusion. The 65 shipped
transitions are the VERIFICATION CORPUS (a sample to test parity against real FCP), NOT the scope
boundary. Every function gets a faithful, gate-passing, @0xADDR-cited TS port.

  - The demand-driven call-closure (throw-at-un-ported-callee = frontier signal) is still the
    ORDERING HEURISTIC — it front-loads what the 65 transitions exercise so we can verify early —
    but it is NOT the stopping condition. When the reachable frontier drains, we keep going: pull
    EVERY remaining class/shader leaf from the ledger until the whole binary is transcribed.
  - `army/ledger/CLASSES.tsv` enumerates ALL classes (7,232 class leaves seeded so far); the shader
    ledger enumerates all metallib functions. These are the real denominators. "Done" = every leaf
    in every framework ledger is status=ported (and ideally verified).
  - `depgraph.py` computes dependency-readiness for prioritization, but `depclaim.py next`
    hands out ALL ready leaves, not just those reachable from the 65. A leaf being "not reachable
    from the 65" is NOT a reason to skip it — it just means it's lower priority than reachable work,
    port it later.

CORRECTION LOG: earlier revisions of this file said "we do NOT port them all / never port dead code."
That was WRONG and contradicted the stated goal. The entire engine is in scope. (Fixed 2026-07-28.)

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
- Workers claim a unit via `depclaim.py next` (append-only claim ledger, `depgraph/claims.jsonl`).
  A claim, once handed out, is permanent — the queue never re-hands it, so two workers can't collide.
- Classes are independent files -> no merge conflicts. Cross-class refs go through imports only.
- Base classes are decoded FIRST (an agent porting OZImageElement needs OZElement/OZTransformNode/
  OZSceneNode already ported or stubbed-with-throw). `depgraph.py` topologically orders by
  dependency-readiness (every in-scope callee ported, 0 unresolved indirect) so `depclaim.py next`
  only ever hands out a unit whose deps are ready.

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

## 6. Dispatch — QUEUE-DRIVEN CRON SLOTS (Model B, 2026-08-10; no agent spawns agents)
There is NO "general" agent that spawns sub-agents. That design (a parent agent spawning N children
per tick) was retired because an agent that spawns agents can explode the population on the box. The
scheduler (cron) is now the ONLY thing that creates a session. See PR_FLOW.md "Dispatch model" and
SWARM_RESTART.md for the authoritative description. In brief:
- A SCRIPT cron (`swarm_maint.sh`) refreshes the ledger, warm pool, and (via `depgraph reconcile` +
  `depclaim seed`) the frontier/queue — the headless plumbing, no agent involved.
- Fixed `swarm-worker-N` / `swarm-reviewer-N` PROMPT crons each PULL from disk-backed queues
  (`depclaim.py next` for ports, `rebase_claim.sh` for rebases, `review_claim.sh` for reviews), do a
  bounded batch, and STOP. Each is a single self-scheduled slot guarded by `slot_lock.sh`.
- Concurrency is bounded by (#worker + #reviewer slots) ∩ the 8-lease warm pool — to scale you enable
  MORE cron slots (a human decision), never have an agent spawn more agents.
- mark_ported + the oracle gate run inside the reviewer's per-PR flow; the frontier re-computes on the
  next `swarm_maint` tick. The loop continues purely by scheduler ticks until the closure is ported.

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

## 9. ANTI-SHORTCUT: method-level chunking for big classes (2026-07-28)
A class with >24 methods is NEVER handed to one agent whole — that forces stub-to-finish shortcuts
(no one can faithfully transcribe 1,471 methods in one context). claim.py splits it into 20-method
CHUNKS, each its own claimable unit.
WORKER FLOW for a chunk (claim.py next prints "...\tCHUNK=<k>"):
  1. `python3 raw-port/army/tools/claim.py chunk <FW> <Class> <k>` → prints the EXACT ≤20 methods
     (index, @0xADDR, kind, demangled) you must port, and the target file src/<layer>/<Class>.m<k>.ts.
  2. Port ONLY those methods into <Class>.m<k>.ts (one file per chunk — distinct files never conflict
     on merge). Each method fully decoded + @0xADDR cited; gate as usual. Undecoded callee → throw-stub
     citing its addr (that's the frontier signal, NOT a shortcut).
  3. EXPORT CONVENTION (so the auto-assembler can wire parts): each <Class>.m<k>.ts exports
       export const <Class>_m<k>_methods = { "<methodKeyFromClaimChunk>": (self, ...args) => { /* @0xADDR body */ }, ... };
     (per-class name so the auto-assembler can import it: <Class>_m<k>_methods. Keys are the exact
      demangled/selector strings printed by `claim.py chunk`.)
     using the EXACT method key strings printed by `claim.py chunk` (the demangled '-[Class sel]' or
     C++ 'Class::meth' form). ctor/dtor/layout go in chunk 0 (or the whole-class base pass).
  4. ASSEMBLY IS AUTOMATED: after chunks land, `python3 raw-port/army/tools/assemble_class.py <FW> <Class>`
     generates <Class>.ts importing every present chunk and merging their maps into <Class>_METHODS
     (what H1 objc_msgSend / C++ dispatch reads). It reports MISSING chunk indices. Idempotent — re-run
     as more chunks land. You do NOT hand-write <Class>.ts. Land your .m<k>.ts, gate it, merge it; the
     assembler stitches. Partial (some chunks missing) is fine — <Class>_METHODS just has fewer entries.
  4. `claim.py done <FW> <Class> <k>` (chunk index as 4th arg). fail/release also take the chunk index.
DEDUP: a chunk is skipped once <Class>.m<k>.ts exists on disk. Big-class chunks sort AFTER whole small
classes (tier 3) so quick wins still drain first, but the heavies now MAKE PROGRESS instead of bouncing.
The point: an agent is only ever asked for ≤20 named methods — bounded, gate-checked, no shortcut pressure.
