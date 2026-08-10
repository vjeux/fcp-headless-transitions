
> HISTORICAL RECORD (not active instructions). The worktree/merge machinery described below
> (shared tree → per-agent `git worktree add` → serialized wt_merge) was SUPERSEDED on 2026-08-10:
> the swarm now uses a WARM WORKTREE POOL (`raw-port/army/tools/wt_pool.sh`) + GitHub PR flow. See
> PR_FLOW.md. Kept for the debugging journey only.

## Audit 2026-07-27 (~16:40 PDT) — process gaps found (agents fine, infra broken)

WHAT WORKED (keep):
- Faithfulness discipline held under the gate. Standout finds proving no shortcuts:
  * OZCatmullRom = Cardinal-computes-tangents -> Bezier-evaluates (NOT textbook basis); agent THREW
    citing both upstream addrs rather than substitute the textbook formula.
  * PCMath::inverseEaseInOut is NOT the algebraic inverse; agent probed the live dlsym symbol
    (y=0.5 -> 0.625) and transcribed Apple's actual math.
  * PCColor::mix() intentionally does NOT mix alpha (decl %eax -> loop n-1).
- Landed clean + gate-verified: PCColor, PCMath, OZCatmullRom, CMTime free-fns.

WHAT BROKE (fix before scaling past ~3 concurrent):
1. SHARED WORKING TREE = the killer. All agents share ONE checkout on cli:vjeux-mac. One agent's
   `git reset`/`git checkout`/`git pull` resets EVERYONE's index and clobbers peers' unstaged files.
   Observed: OZChannel2D/3D/Position .ts written then WIPED; index cross-contaminated (Bool3D.ts +
   PCBlend.claim + PCColorUtil.claim all staged together -> next commit sweeps up wrong files).
   FIX: git worktree per agent (git worktree add ../wt/<agent> -b port/<class>), agent works+commits
   in its OWN worktree+branch, a serialized merge-queue reaper merges green branches to main. No
   shared index, no push races.
2. CLAIMS staged into git (should be local-only or in the worktree) — they collide like any file.
3. Agents that finished a FILE but never COMMITTED (2D/3D/Position) — likely stalled on push
   contention or died mid-gate. With worktrees each commit is independent -> no contention.
4. disasm.sh writes /tmp/<FW>_tV.txt shared cache — fine (read-only), but re/disasm/*.s writes to the
   shared tree collide too; move under the worktree.

DECISION: do NOT hand-rescue in-flight agent files. Rebuild the harness with worktree isolation +
merge queue, then re-dispatch the lost classes cleanly. That's the scaling unlock (10 -> many).

## Audit 2026-07-27 (~18:00 PDT) — swarm at ~25-30 workers, 3 infra holes fixed

CONTEXT: scaled to ~25-30 concurrent workers on the shared cli:vjeux-mac checkout. Load hit 70-81
on a 10-core Mac (~8x oversubscribed) — machine capacity, NOT queue depth, is the bottleneck. The
refill monitor now HOLDS (no spawn) whenever load1>30; target capped at 20. Do not push past that.

THREE DECODE-INTEGRITY / MERGE HOLES FOUND + FIXED (all landed on main):
1. GATE FALSE-PASS ON UNWRITTEN FILE (243278d). gate.sh returned "GATE: PASS" for a .ts that did
   NOT EXIST: G1 provenance did `if os.path.exists` (silent skip), G2 tsc is whole-project, G4 found
   no oracle node -> green. So a worker whose `ipython` write went to the WRONG NODE (workspace, not
   cli) "gated PASS" on nothing. FIX: added G0 existence+non-empty guard to gate.sh + a P0 hard-fail
   in provenance_gate.py. Missing/empty .ts now REJECTS.
2. disasm.sh SILENT EMPTY EXTRACTION (e267eff). otool -tV does a LINEAR SWEEP, so it DROPS a symbol's
   label when the fn was ICF-folded or the sweep straddled its true entry (mid-instruction). The old
   awk then wrote a 0-LINE .s and returned success -> worker GUESSED the body from surrounding bytes.
   Seen repeatedly (FFAudioStreamMonitoringAngleObjectScope::IsObjectPlayEnabled, PCArray_base::
   gnomesortImpl evidence .s was 0 bytes, LiLightingStyle::getLights, etc.). FIX: disasm.sh now fails
   LOUD (exit 2) on empty extraction and tells the worker to use
   `llvm-objdump --arch=x86_64 -d --disassemble-symbols='<SYM>' '<BIN>'` or throw-stub citing @0xADDR.
   NEVER fabricate a body otool dropped. (llvm-objdump per-symbol = exact boundary; full-dump is too
   slow under load to be the default backend.)
3. wt_merge.sh 2-DOT DIFF (e267eff). Used `git diff origin/main "$BR"` (2-dot) to list a branch's
   changed files. When a branch is behind, that ALSO lists files origin/main ADDED since the branch
   point (they look like deletions from the branch side) -> with the new G0 gate those "missing" files
   wrongly REJECTED the merge. FIX: 3-dot `origin/main...$BR` = only commits unique to the branch.
   Workers independently hit + confirmed this ("now uses 3-dot diff").

STILL-OPEN GAPS (not yet fixed):
- FILE-WRITING SWAMP (biggest worker-cycle waste): workers burn many turns writing the .ts via
  base64/heredoc chunking (dup chunks, `+`/backtick metachar fights, half-written files). RULE going
  forward: on a CLI node, WRITE THE .ts WITH THE `edit` TOOL (atomic, node-aware, no shell quoting) —
  create the file empty via `: > path` then `edit` in the content, OR edit-create directly. NEVER
  base64-heredoc. ipython defaults to the WORKSPACE node, not cli — do NOT use ipython to write ports.
- DEFERRED-STUB REVISIT QUEUE: ~19 landed files carry ~79 `throw ... @0x` stubs (form-1/2/3 branches,
  powf-heavy paths). No `claim.py next-stub` mode re-queues them when their deps land. Still TODO.
- SHADER LEDGER keeps getting DELETED from the working tree by stray worker `git checkout`s; the
  refill monitor now `git checkout -- shaders.ledger.json` every cycle to recover it. Real fix:
  gitignore-or-relocate live-state files (claims.json, ledger churn) out of the shared tree.
- PCShared-style CROSS-FRAMEWORK NAME COLLISIONS: same C++ class name in ProCore AND Flexo -> one
  PCShared.ts already exists, the second claim must `fail` as duplicate. claim.py should dedup by
  class name across frameworks (or namespace the filename by fw) so workers don't waste a claim.

## Audit 2026-07-27 (~17:25 PDT, session 2) — tooling integrity fixes landed (swarm @ ~25 workers)

CONTEXT: worktree isolation from session-1 held up. Scaled to ~25–30 concurrent on the 10-core Mac;
load1 ran 45–81 (≈8× oversubscribed). Refill monitor now HARD-GUARDS: if load1>30 it spawns nothing,
targets ≤20 workers. High load — not queue depth — is the bottleneck (751 class-leaves + 293 shaders
still available). Do NOT push past ~20 concurrent on this box.

THREE DECODE-INTEGRITY HOLES FOUND + FIXED (all landed on main):
1. GATE FALSE-PASS ON MISSING FILE (243278d). `gate.sh` returned "GATE: PASS ✅" for a .ts that was
   never written (worker's ipython wrote to the wrong node): provenance_gate.py `os.path.exists()`
   silently skipped it, G2 tsc is whole-project, G4 found no node. FIX: added G0 existence+non-empty
   check to gate.sh (rejects unwritten/empty up front) + provenance_gate.py now emits a P0 violation
   for a passed-but-absent .ts instead of skipping. This is what let a worker "gate PASS" on nothing.
2. disasm.sh SILENT EMPTY EXTRACTION (e267eff). otool -tV does a LINEAR SWEEP, so it DROPS a symbol's
   label when the fn was ICF-folded or the decode straddled its true (mid-insn) entry. disasm.sh then
   wrote a 0-line .s and returned SUCCESS — and workers GUESSED the body from surrounding bytes
   (observed repeatedly: PCArray_base::gnomesortImpl .s is 0 bytes; FFAudioStreamMonitoring...,
   OZLightingStyle::getLights, etc). FIX: disasm.sh now FAILS LOUDLY (exit 2, no file) on empty
   extraction and points to `llvm-objdump --arch=x86_64 -d --disassemble-symbols=<SYM>` for the exact
   per-symbol boundary. Never guess a body otool dropped. (Full llvm-objdump dump is too slow to be
   the swarm backend under load; use it by hand per-symbol when otool drops one.)
3. wt_merge.sh 2-dot DIFF (e267eff). Used `git diff origin/main $BR` (2-dot): when a branch is behind,
   files main ADDED show as deletions from the branch side, which the new G0 gate would then wrongly
   reject. FIX: 3-dot `git diff origin/main...$BR` = only what the branch actually changed. (A worker
   independently hit + confirmed this in the wild.)

SHARED-TREE HAZARD PERSISTS (recover, don't panic): workers' git ops in the shared main checkout keep
leaving deleted-but-in-HEAD files in the working tree (shaders.ledger.json, PCShared.ts,
OZHistogramDelegate.ts seen deleted). Danger: a stray `git add -A` in main would stage those deletions
and remove a widely-imported file from main. Refill monitor now `git checkout -- shaders.ledger.json`
every cycle. Periodically `git checkout --` any deleted-but-in-HEAD src/ledger file.

FILE-WRITING (biggest worker-cycle waste this session): workers burned enormous effort writing .ts via
bash base64/heredoc chunking (duplicates, `$`/backtick metachar fights, truncation). DO NOT DO THIS.
Use the `edit` tool (writes atomically to the node, no shell quoting). Write the whole file in ONE
edit. base64/heredoc is the slow, corruption-prone path.

GATE P4 FRICTION (4+ workers hit it): a throwing-stub line whose text says "not yet/pending/unimpl/
transcrib" must carry the @0xADDR ON THE SAME LINE. Put the address inline in the throw, e.g.
`throw new Error("PCFoo::bar not yet transcribed @0x1234")`. Comments nearby don't count.

STILL OPEN (not built this session):
- No deferred-stub revisit queue. 19 files / ~79 `@0x` throwing stubs (HGColorGammaLUTInfo forms 1/2/3,
  etc.) with no `claim.py next-stub` to re-dispatch them once deps land. Highest-value next infra.
- Shaders: pipeline works (shader_disasm.sh -> clean LLVM IR; verified on Hgc2CopyAlpha) but the
  293-shader ledger was DELETED from main's working tree earlier and 0 shaders are ported. Recovered
  it; `claim.py next-shader` now dispenses. metal-objdump --disassemble-all over 21 metallibs per call
  is uncached = a real CPU contributor; cache per-metallib next.
