
> HISTORICAL RECORD (not active instructions). References to wt_merge/wt_setup/`git worktree add`
> below describe the OLD local-merge process, DELETED 2026-08-10. The swarm now uses a WARM WORKTREE
> POOL (`raw-port/army/tools/wt_pool.sh`) + GitHub PR flow (PR_FLOW.md). Kept for context only.

## 2026-07-29 scaled-pool systemic findings (from reviewer-29/30 reports)
- REVIEWER-TAG COLLISION: coordinator increments reviewer-NN from highest existing, but concurrent ticks can assign the same NN to two live agents. They then write conflicting sidecars on the same file (observed: two reviewer-29 wrote LIKELY_REAL then REJECT on OZChannelGammaFootage_Factory). FIX: label reviewers reviewer-NN-<uuid4> so sidecar `reviewer` field is unique; or coordinator hands out a monotonic slot from a lock file.
- FALSE-POSITIVE FILE-REGRESSION: a branch cut from an OLD merge-base (before N later files landed on main) shows spurious deletions under 2-dot `git diff origin/main..branch`. Reviewers MUST use 3-dot `origin/main...branch` (merge-base aware). The add/add MERGE CONFLICT in wt_merge is the real backstop — a genuine regression hard-fails the merge (exit 3), so stale-green sidecars cannot actually delete a landed method. Confirmed: PCIsUsableNCLCCode.ts sidecar is stale LIKELY_REAL but main still has operator_lt because the eq-branch merge would conflict.
- DISCOVERY QUEUE: `git rev-list --count origin/main..$BR == 0` branches (already reachable via merge commit) should be pre-filtered from the reviewer queue — most candidates were already-merged noise.

## 2026-07-29 22:47 — ORPHANED MERGE_HEAD blocked all merges (RESOLVED)
- ROOT CAUSE: wt_merge runs `git merge` on the SHARED main worktree inside the global lock. If the agent process dies mid-merge (context end, provider error, timeout) AFTER `git merge` starts a conflict but BEFORE resolve, it leaves main with MERGE_HEAD + a UU conflicted file and releases the lock. Every subsequent reviewer's `git checkout main` then fails -> merges stall fleet-wide.
- OBSERVED: interrupted merge of port/PCNCLCCode_operator_eq (840e6222) left `UU raw-port/src/infra/PCIsUsableNCLCCode.ts`. No wt_merge running, no lock held -> orphaned. Coordinator cleared with `git merge --abort` (non-destructive; HEAD 3342eeee already on origin/main, operator_lt intact).
- FIX for wt_merge.sh: (1) wrap the merge critical section with a trap that runs `git merge --abort || git reset --hard origin/main` on ERR/EXIT if MERGE_HEAD remains; (2) at START of the critical section, if `.git/MERGE_HEAD` exists AND no other wt_merge is running, auto-abort the stale merge before starting (self-healing); (3) prefer merging in a DETACHED worktree, not the shared main checkout, so a dead agent can't wedge main.
- COORDINATOR STEP to add: STEP 0.5 self-heal — if `[ -f .git/MERGE_HEAD ]` and `! pgrep -f wt_merge` and lock dir absent -> `git merge --abort` before the tick proceeds.

## 2026-07-29 — ORPHANED MERGE ON SHARED MAIN (throughput killer, RECURRING)
- ROOT CAUSE: wt_merge.sh does `git checkout main` + `git merge` on the SHARED main worktree. If a reviewer process is interrupted (provider error, timeout, kill) mid-merge, main is left with MERGE_HEAD + a UU conflicted file. Since ALL reviewers `git checkout main` on that same worktree, one stuck merge BLOCKS EVERY OTHER REVIEWER'S MERGE. Observed: interrupted merge of 840e6222 (PCNCLCCode_operator_eq, an add/add conflict on PCIsUsableNCLCCode.ts) left main stuck; coordinator cleared it with `git merge --abort` (safe — HEAD was already the clean pushed 3342eeee).
- SAFE MANUAL CLEAR: verify no wt_merge running + no lock held + HEAD==origin/main, then `git merge --abort`. Non-destructive (discards only the half-applied merge; the rejected/conflicting branch stays unmerged).
- FIX OPTIONS (tooling, not hot-patch under load): (a) wt_merge should `trap`-cleanup `git merge --abort` on ANY exit/signal, not just conflict; (b) or merge in a DEDICATED ephemeral worktree instead of the shared main checkout, so an interrupted merge can't poison main for peers; (c) coordinator tick should detect+auto-abort a stuck MERGE_HEAD (no wt_merge running, no lock) as a maintenance step. Option (c) is the cheapest — add to STEP 1 maintenance.

## 2026-07-29 ~23:22 — FRONTIER-FILE blocks sibling extension (throughput friction, NOT a cheat)
- OBSERVED: workers claiming a method on a class whose file ALREADY contains a legitimate frontier-throw function (e.g. OZConstantNode.cloneNode, which throws only because its real work = the unported OZCurveNode base copy ctor — documented, accepted as TRAP) hit a wall: adding a clean sibling method re-runs the FILE-LEVEL gate, reach_check fuzzes the frontier fn, hits its throw -> REJECT_CHEAT on the WHOLE file. Worker correctly depclaim.py-fails and moves on, but burned a cycle, and the unit stays un-portable until the frontier callee lands.
- This is the dependency queue working IN PRINCIPLE (can't fully port OZConstantNode until OZCurveNode lands) but the DISPENSER doesn't know it — it keeps handing out methods in frontier-blocked files.
- NOT a correctness issue: main's cloneNode is an honest documented frontier (isolated local stub), NOT a fabricated-new cheat. No remediation needed.
- FIX OPTIONS (tooling, not hot-patch): (a) depclaim should mark units whose target FILE contains a reach_check-throwing fn as blocked-until-<frontier-callee>-lands, and not dispense them; (b) OR gate.sh should reach_check ONLY the functions CHANGED by the branch (per-function), not the whole file, so a clean ADD isn't rejected by a pre-existing accepted frontier. Option (b) is more general and also speeds the gate. Either way: land as a reviewed tooling change, test both a clean-add and a real-cheat fixture first.

## 2026-07-29 ~23:25 — WORKER FILE-CREATION FOOTGUN (dep-worker-29 burned full context)
- SYMPTOM: a worker creating a NEW class .ts file (not extending) fell back to bash heredoc / base64 chunking because the `edit` tool needs an existing file. It then thrashed for its entire context on base64 display artifacts, ARG_MAX fears, chunk-append bugs — produced nothing.
- ROOT CAUSE: brief step 5 says "write REAL body ... with edit tool" but doesn't say HOW to create a NEW file. edit tool = replace-in-existing; for a fresh file the worker improvises badly.
- FIX (brief wording, cheap): step 5 should say: "To create a NEW file: FIRST `printf '' > raw-port/src/<layer>/<Class>.ts` (or `: > file`) to make an empty file, THEN use the edit tool to fill it (edit works on the now-existing empty file). NEVER hand-stream file content through bash heredocs/base64 — that wastes your whole context. For a file that already exists on main, `git show origin/main:<path> > <path>` into the worktree then edit-append."
- Also: wt_setup could optionally pre-create an empty target file, but the brief wording fix is enough and safer.

## 2026-07-29 ~23:44 — STALE-LEDGER / IN-FLIGHT-BRANCH dispenser race (efficiency, not correctness)
- SYMPTOM: workers repeatedly claim units that are ALREADY PORTED on a pushed-but-unmerged branch (seen 4x in one dep-worker session: OZChannelBase_Factory, OZChannelGradientSampleRGB_Factory, PCCFRef destructBase, HGFormatUtils). Each wastes a claim cycle; worker discovers the .ts already exists, runs mark_ported, moves on. Reviewers also see duplicate branches (ProCore_Private_getUInt32Number had two: _alt + original).
- ROOT CAUSE: `mark_ported.py` (run by depgraph reconcile every coordinator tick) scans MERGED src on origin/main. A symbol ported on a branch that is pushed-but-not-yet-merged is still `todo` in the ledger, so `depclaim.py next` dispenses it again. depclaim has no knowledge of open `origin/port/*` branches.
- NOT a correctness issue: duplicate ports are caught (reviewers see "already landed / empty 3-dot diff"; wt_merge NOOPs). Pure wasted worker cycles + reviewer dedup work.
- FIX (dispenser logic, needs design+test, NOT a hot-patch): `depclaim.py next` should also exclude any symbol that has an open `origin/port/<tag>` branch whose src diff is non-empty vs main (i.e. work already in flight). Build the in-flight set once per `next` from `git for-each-ref refs/remotes/origin/port/*` (cache ~60s). Alternatively: a lightweight `in_flight.json` that reviewers/workers update on push/merge. Either way it's a coordination-state change to the claim queue — land as a reviewed tooling change with a test that a pushed-unmerged symbol is NOT re-dispensed.
- Interim mitigation already in place: coordinator STEP reconcile runs mark_ported each tick (keeps MERGED status fresh); workers correctly detect+release stale claims. Acceptable churn at current scale.

## TOOLING: G5 DISPATCH_ONLY false-positive on SIMD matvec (2026-07-30)
dep-worker-32 hit G5 raising `FLAG: DISPATCH_ONLY (7385eb01)` on `(anonymous)::transform(double const*, PCXYZColor&, PCXYZColor&)` — a bit-faithful 3×mulpd/3×addpd matvec, NOT a dispatch shell. If G5's DISPATCH_ONLY heuristic keys on a small-instruction SIMD-only shape (no branches, ends in stores), it will false-positive on the whole class of leaf SIMD math (color matvecs, 3x3/4x4 transforms) and silently block honest ports (worker demotes to depclaim.py fail). ACTION for tooling pass: audit g5_impl_gate.py DISPATCH_ONLY detector — exempt bodies whose only "calls" are register-to-register SIMD arithmetic with no tail-jmp/callq to another ledger unit. Deferred unit noted; do not chase individually.

## TOOLING TODO (2026-07-30, dedicated session — do NOT hot-patch under live fleet)
### depclaim dispenser race (highest-frequency worker friction; EFFICIENCY not correctness)
Symptom (reported by dep-worker-40/43, reviewer-52 on 2026-07-30): `depclaim.py next` hands out units
that are ALREADY pushed-but-unmerged on origin as `port/<TAG>` branches (ledger still `todo`, not in the
local claimed/done cache because a DIFFERENT session pushed them). Two workers then race the same branch:
one commits over the other's reused worktree (wt_setup line 62 preserves it — no data lost, but wasted work),
or both collide at the shared setup lock. Reviewers catch resulting duplicates/cheats; reconcile self-corrects.
NOT a correctness bug — no corrupt/lost work reaches main (verified: 0 corrupt .ts on recent merges).
SAFE FIX (for a dedicated session, NOT a live hot-patch — a bug here stalls the whole fleet via NO_READY_UNIT):
  - In cmd_next(), do ONE `git for-each-ref --format='%(refname:short)' refs/remotes/origin/port/*` (single
    git call per `next`, NOT per-candidate — per-candidate ls-remote would worsen the .git contention that is
    already the throughput cap under ~15 workers).
  - Build an in-flight TAG set. For each candidate mangled symbol, compute its sanitized class TAG using the
    SAME sanitizer as wt_setup.sh (must be byte-identical — factor the bash sanitizer into a shared python
    helper to avoid divergence). Skip candidates whose TAG is in-flight.
  - Guard: if skipping would empty the ready set, fall through to dispensing (never stall the fleet).
### Secondary (lower priority):
  - reap_worktrees.py stale-CLAIM reaper: auto-release claims >900s with no origin branch push (depclaim reap
    already does age>90m; tighten + cross-check origin).
  - depclaim `next` STL-tier: heavy libc++ templates (__tree/__hash_table/__for_each_segment/__move_backward_impl)
    dominate the top of queue; a --no-stl filter or dedicated STL-porter tier lets workers reach real math faster.
  - depgraph.py deps <sym>: always echo "OK: N in-scope deps, M externs, K indirect" (currently prints nothing
    for a 0-dep leaf, so workers can't tell the tool ran).

## EVIDENCE (2026-07-30 01:07 tick): git-index serialization is the throughput WALL
Reported independently by reviewer-49, reviewer-40, dep-worker-43, dep-worker-46 this tick: with ~24-41
concurrent wt_merge processes, `git worktree add` (inside both wt_merge.sh gate-worktree AND wt_setup.sh)
serializes on the single shared .git index -> `fatal: Could not write new index file`, stalled merges, and
one CORRUPTED worker worktree index (dep-worker-43's unordered_map worktree, cleaned this tick). This is NOT
disk (33GB free), NOT load (irrelevant per vjeux), NOT reviewer shortage. The bottleneck has SHIFTED to the
shared git index. Merges still land (main advanced 619711b7->c0cb9f11->4d91d0ce) but slowly; adding MORE
agents strictly worsens it. COORDINATOR RESPONSE: hold reviewer scale-up when wt_merge live > ~15; the extra
reviewers just pile retrying `git worktree add` onto the contended index. SAFE FIX (dedicated session, not a
live hot-patch): wrap `git worktree add` in wt_merge.sh AND wt_setup.sh with a jittered-backoff retry loop
(3-5 tries, sleep $((RANDOM%3+1))s) on non-zero exit / "Could not write new index" — reviewer-49's rec.

## QUIESCED-WINDOW FIXES (diagnosed by dep-worker-75 2026-07-30; DO NOT hot-patch mid-swarm)
Three infra inefficiencies cause wasted worker cycles (NOT correctness bugs — every affected
worker correctly deferred via `depclaim.py fail`; zero bad merges resulted). Apply ONLY when the
fleet is quiesced (no live workers claiming), because depgraph.py/depclaim.py/sccs.json are
load-bearing shared state read+mutated by every agent.

1. **depgraph DIRECT regex misses C-symbol internal callees.**
   `DIRECT = re.compile(r'\t(?:callq|jmp)\t(__Z[A-Za-z0-9_$.]+)\b')` only matches `__Z*` C++-mangled
   targets. Internal extern-"C" functions like `_PC_CMTimeMultiply64Divide64` @ProCore 0x8fab2 are
   dropped from deps -> `operator/(CMTime,CMTime)` and peers get dispensed "ready" while an in-scope
   callee is still unported. Concrete: `__ZdvRK6CMTimeS1_` @0x582a8 calls `_PC_CMTimeMultiply64Divide64`
   (222-line in-scope body, defined T-symbol, absent from depgraph).
   ⚠️ DANGER: the worker's proposed fix (broaden regex to `_[A-Za-z]`) is WRONG/unsafe — it would also
   match every TRUE out-of-scope extern (`_CFHash`, `_pthread_self`, `_CGColorSpaceCreateWithName`,
   `_objc_*`), making every function depend on unresolvable externs and DEADLOCKING the entire ready
   queue for all agents. Correct fix: match `_[A-Za-z]` C-symbol callees BUT intersect against the set
   of DEFINED internal symbols (nm -U on each framework binary => the "T" symbols), so only in-scope
   C-symbols (like `_PC_*` defined inside ProCore) count as deps; genuine externs (undefined/U) stay
   non-blocking. Build the defined-symbol set once in `_ledger_symbols()`-adjacent code and add to the
   in-scope test in `build()`.

2. **Stale-dispenser branch-existence race.** `depclaim.py cmd_next` re-hands units whose `port/<tag>`
   branch already exists (pushed-but-unmerged) until the merge lands => constant collisions in a
   ~20-agent swarm. Fix: in `cmd_next`, skip any candidate whose derived `port/<tag>` exists on
   `refs/heads/` or `refs/remotes/origin/` (reuse wt_setup.sh's tag-derivation). Recorded earlier as
   "stale-ledger dispenser race"; now confirmed as a top throughput sink.

3. **`.setup.lock.d` is a single global mutex.** wt_setup worktree-add serializes with wt_merge gate
   ops for UNRELATED tags; under ~20-30 agents individual waits exceed practical timeouts (worker
   reported >15min stalls). Fix: per-tag lock (worktree-add for tag X need not serialize with an
   unrelated tag Y). Lower priority than #1/#2.

STATUS: recorded, not applied. Loop remains correctness-healthy (ported 8074, no cheat on main,
reviewers self-correcting). These are throughput optimizations for the next quiesced window.
