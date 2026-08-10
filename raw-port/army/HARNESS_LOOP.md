# HARNESS_LOOP.md — how to run the raw-port loop in ANY harness (self-continuing)

This is the authoritative, harness-agnostic spec for driving the FCP raw-port swarm. The porting
system is **fully self-contained shell/python in this repo** — it has ZERO dependency on Navi crons,
`spawn_agent`, or any specific scheduler. A "harness" is just: **N long-lived agent processes that
each loop `pull work → do it → repeat` until the queue drains.**

Repo: `~/random/final-cut-pro-transitions` on the box that has Final Cut Pro (the dlsym oracle needs
it). Merges go through GitHub PRs on `vjeux/fcp-headless-transitions`.

--------------------------------------------------------------------------------
## The five load-bearing invariants (a new harness MUST preserve all five)
--------------------------------------------------------------------------------
1. **No agent spawns another agent.** The live agent count is bounded solely by how many processes
   the harness starts. Self-CONTINUING (an agent loops on its own queue pulls) is required and good;
   self-SPAWNING (an agent creates child agents) is what caused the population explosion — forbidden.
2. **One fixed slot per process.** Each worker is `worker <N>`, each reviewer is `reviewer <N>`. On
   start it takes `slot_lock.sh acquire <role> <N>`; if BUSY, another process already owns that slot —
   exit. Release only on shutdown. This makes each slot single-flight.
3. **Never edit the canonical checkout.** Always lease a WARM POOL worktree (`wt_pool.sh acquire`),
   work there, release it. Per-unit `git worktree add` is FORBIDDEN — it materializes ~2,579 files and
   triggers the corp-Defender scan storm that pegged the box to load 52.
4. **Concurrency ≤ pool size.** (#workers + #reviewers) must be ≤ WT_POOL_SIZE (default 16). Disk is
   the only hard constraint. Load is NOT a hold condition, but keep total agents ≤ pool slots.
5. **Workers never merge. Reviewers are the only merge authority.** (Branch protection enforces it
   server-side regardless: faithfulness-gate green + up-to-date + linear + enforce_admins.)

--------------------------------------------------------------------------------
## Preconditions — run ONCE before starting any agent
--------------------------------------------------------------------------------
    cd ~/random/final-cut-pro-transitions
    git fetch -q origin main && git checkout -q main && git reset -q --hard origin/main

    # 1. Ledgers present (else the queue is empty and workers do nothing)
    bash raw-port/army/tools/ensure_ledger.sh            # -> "all 6 ledgers present"

    # 2. Warm pool materialized — one worktree per concurrent agent (default 16)
    bash raw-port/army/tools/wt_pool.sh init 16

    # 3. Queue has ready work
    python3 raw-port/army/tools/depgraph.py stats | grep "READY NOW"   # >0 (~16k)

    # 4. Gate toolchain present + anti-cheat verifier proven
    ls raw-port/node_modules/.bin/tsgo                   # must exist
    python3 raw-port/army/verifier/prove_all.py          # -> PROVE_ALL: PASS

--------------------------------------------------------------------------------
## The three queues (atomic, disk-backed — nothing to stand up)
--------------------------------------------------------------------------------
- **PORT**   = `depclaim.py next` — append-only claim ledger (`army/depgraph/claims.jsonl`).
- **REBASE** = `rebase_claim.sh claim` — open PRs stuck on a regression faithfulness-gate FAILURE
               (atomic lease + per-PR attempt cap 3; past cap auto-closed and re-queued to PORT).
- **REVIEW** = `review_claim.sh claim` — open PRs without a fresh verdict for their current head SHA
               (atomic lease keyed by PR#+head-SHA so two reviewers never gate the same head).
State (locks/leases/attempts) lives under `~/.fct-pool/` (override with `FCT_STATE_DIR`).

--------------------------------------------------------------------------------
## WORKER loop (self-continuing — the key change from the old cron model)
--------------------------------------------------------------------------------
Full rules: read `DEP_WORKER_BRIEF.md` + `PR_FLOW.md` + `PORTING_SPEC.md`. Behavior per slot N:

    slot_lock.sh acquire worker N            # exit if BUSY
    LOOP forever:
      # (a) rebase queue first
      R = rebase_claim.sh claim
      if R startswith "CLAIMED <PR#> <branch>":
          rebase_pr.sh <PR#>                 # re-apply net-new methods, gate, force-push SAME branch
          rebase_claim.sh release <PR#>
          continue
      # (b) else a fresh port unit
      U = depclaim.py next
      if U == "NO_READY_UNIT":  sleep 60; continue     # queue momentarily empty — poll, don't exit
      parse <FW> <Class> <mangled> from the CLAIMED_UNIT tsv rows
      depgraph.py deps <mangled>             # confirm every in-scope callee is ported
      raw-port/tools/disasm.sh --sym <mangled> <FW>    # exact body (bg if slow)
      WT=$(wt_pool.sh acquire <Class>); cd "$WT"       # NEVER git worktree add
      <write the REAL TS body with an EDITOR into raw-port/src/<layer>/<Class>.ts:
        import+call ported callees; @0xADDR on fn+consts; Math.fround for f32;
        ADD-only when extending a class file (git show origin/main:<path> first)>
      raw-port/army/gate/gate.sh "$WT/raw-port/src/<layer>/<Class>.ts"   # must print GATE: PASS
      git -C "$WT" add -A && git -C "$WT" commit -q -m "port: <Class>::<method> @<FW> 0x<addr>"
      raw-port/army/tools/pr_submit.sh <Class>         # rebases onto main, pushes port/<Class>, opens PR
      wt_pool.sh release "$WT"
      # DO NOT STOP — go back to top of LOOP. (This is the self-continuing behavior.)
    on shutdown: slot_lock.sh release worker N

If a dep is unported or an indirect/virtual call is unresolved: release the worktree, do NOT stub it,
just claim the next unit. A throw is allowed ONLY for a true out-of-scope extern (libc/ObjC/CF/Metal/
CoreVideo/AVFoundation) citing @0xADDR — an in-scope throw-stub is a REJECTED cheat.

--------------------------------------------------------------------------------
## REVIEWER loop (self-continuing)
--------------------------------------------------------------------------------
Full rules: read `REVIEWER_BRIEF.md` + `PR_FLOW.md` (honor the RESOLVED cheat rulings verbatim).

    slot_lock.sh acquire reviewer N          # exit if BUSY
    prove_all.py                             # once, must PASS before signing anything
    LOOP forever:
      C = review_claim.sh claim
      if C == "NONE":  sleep 60; continue
      parse <PR#> <headSHA>
      pr_gate.sh <PR#>                       # G0-G5 + regression_check + dup_check; posts faithfulness-gate
      if regression FAILURE:  rebase_helper.py <Class>
            exit 0 -> it pushed a rebased branch; gate+merge that
            exit 6 -> NEEDS_WORKER_REBASE; leave the FAILURE status (a worker slot pulls it via rebase_claim)
      elif dup FAILURE (exit 5):  gh pr close <PR#>
      elif gate PASS:
            re-derive disasm INDEPENDENTLY from the binary (disasm.sh --sym <mangled> <FW>, NOT the
            committed .s), classify + reach + LINE-BY-LINE; oracle where callable.
            if genuinely faithful:
                pr_land.sh <PR#>             # handles behind/update-branch -> merge server-side
                pr_comment_once.sh <PR#> "<one-line evidence>"   # idempotent; ONE comment, no re-post
                mark_ported.py
            else:
                gh pr review <PR#> --request-changes -b "<exactly which instruction the TS omits>"
      review_claim.sh release <PR#> <headSHA>
      # keep looping
    on shutdown: slot_lock.sh release reviewer N

NEVER merge a PR whose faithfulness-gate is not `success`; NEVER merge a REJECT/CHEAT/SKELETON.

--------------------------------------------------------------------------------
## Liveness / crash recovery (what the harness owns)
--------------------------------------------------------------------------------
A process runs until it dies (context exhaustion, crash, box recycle). The harness is responsible for
**restarting a dead slot** — that is the ONLY thing the old cron was legitimately for. On restart, the
new process for slot N re-acquires its slot lock (auto-reclaimed after SLOT_STALE_MIN=90min if the old
holder died) and resumes the loop. Because every claim is append-only and every merge is server-side,
a mid-unit crash loses at most one in-flight unit's local work (the worktree is reset on next lease).

Periodic maintenance (optional, run by the harness or a plain script — NOT an agent):
    bash raw-port/army/tools/wt_pool.sh gc               # refresh idle worktrees to origin/main
    python3 raw-port/army/tools/depclaim.py seed         # catch symbols merged outside depclaim (~30-90s)
    python3 raw-port/army/tools/depgraph.py reconcile     # recompute ported status from origin/main

--------------------------------------------------------------------------------
## Recommended rollout
--------------------------------------------------------------------------------
Start 2 workers + 2 reviewers, watch `uptime` (load stayed ~4-7 at that size; melts near 52) and
`gh pr list --repo vjeux/fcp-headless-transitions --state open` merge rate for ~30 min, then widen
toward 8 workers + 8 reviewers (the 16-slot pool ceiling). To go past 16, raise WT_POOL_SIZE and
`wt_pool.sh init <bigger>` FIRST, then add slots.

--------------------------------------------------------------------------------
## Tool reference (all under raw-port/army/tools/ unless noted)
--------------------------------------------------------------------------------
  depclaim.py next            claim next dependency-ready PORT unit (append-only)
  depgraph.py deps <mangled>  show a symbol's deps + ported status
  depgraph.py stats           READY NOW / ported / blocked tiers
  disasm.sh --sym <m> <FW>    (raw-port/tools/) exact disassembly for a mangled symbol
  wt_pool.sh acquire <Class>  lease a warm worktree on branch port/<Class> (stacks on an open same-class PR)
  wt_pool.sh acquire-at <SHA> lease a warm worktree detached at a PR head (reviewers/pr_gate)
  wt_pool.sh release <path>   reset to origin/main + free the lease
  slot_lock.sh acquire/release <role> <N>   per-slot single-flight guard
  gate/gate.sh <file.ts>      G0-G5 faithfulness gate (must print GATE: PASS)
  pr_submit.sh <Class>        rebase onto main, push port/<Class>, open PR   (WORKER)
  rebase_claim.sh claim       pull a regression-stuck PR to rebase           (WORKER)
  rebase_pr.sh <PR#>          re-apply net-new methods onto current main, force-push same branch (WORKER)
  review_claim.sh claim       pull a PR needing a fresh verdict              (REVIEWER)
  pr_gate.sh <PR#>            run gate as CI, post faithfulness-gate status  (REVIEWER)
  pr_land.sh <PR#>            update-branch -> re-gate -> merge server-side  (REVIEWER)
  pr_comment_once.sh <PR#> "" idempotent PR comment (no duplicate)           (REVIEWER)
  mark_ported.py              flip merged symbols to ported (unlock callers) (REVIEWER, post-merge)
  ensure_ledger.sh            restore the 6 gitignored ledgers on fresh checkout
