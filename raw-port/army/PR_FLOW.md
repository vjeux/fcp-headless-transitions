# PR_FLOW.md — the GitHub-Pull-Request swarm flow (supersedes wt_merge/wt_setup/sidecars)

**As of 2026-08-10, merging happens through GitHub PRs, not the custom local merge machinery.**
This fixes the perpetually-dirty tree, the 125-worktree explosion, and the stale-base stall.
`wt_merge.sh`, `wt_setup.sh`, and the old `brief.py` were DELETED (2026-08-10, infra/ws6-teardown),
along with the `.review.<sha>.json` sidecar convention. `gate.sh`, `regression_check.py`,
`dup_check.py`, `depclaim.py`, `depgraph.py`, `rebase_helper.py` are KEPT (reused below).

## Why not GitHub Actions?
The faithfulness oracle (`fct/parity`) dlsym's the REAL Final Cut Pro binary — only works on
vjeux-mac. A self-hosted Actions runner there is SIGKILLed by corp Defender. So the **reviewer agent
IS the CI**: it runs the gate locally and posts the verdict as a GitHub commit status
(`faithfulness-gate`). Branch protection on `main` requires that status + up-to-date + linear history.

## Worker flow (one queue-driven slot — full brief in DEP_WORKER_BRIEF.md)
0. `slot_lock.sh acquire worker <N>` — single-flight this slot; exit if BUSY. Release at the end.
1. `rebase_claim.sh claim` → if it leases a rebase task (`CLAIMED <PR#> <br>`), do REBASE-TASK MODE
   (`rebase_pr.sh <PR#>`), release the lease + slot lock, STOP. Else (`NONE`) fall through to port.
2. `depclaim.py next` → get a ready unit (append-only claim; unchanged).
3. Port in a **WARM POOL worktree**: `WT=$(raw-port/army/tools/wt_pool.sh acquire <Class>); cd "$WT"`.
   NEVER edit the canonical checkout, and do NOT `git worktree add` per unit — materializing ~2,579
   files per unit is what triggered the corp Defender scan-storm / load-52 meltdown. The pool leases a
   pre-materialized worktree reset to origin/main with `port/<Class>` cut and node_modules symlinked,
   and reuses it (+ a warm tsgo cache) across units.
4. Write the real body (anti-cheat rules UNCHANGED — see DEP_WORKER_BRIEF.md: @0xADDR provenance,
   no in-scope throw-stubs, call_once sentinel, ADD-only, one-symbol-one-file).
5. `raw-port/army/tools/pr_submit.sh <Class>` — rebases onto origin/main, pushes port/<Class>,
   opens a PR. Then `wt_pool.sh release "$WT"` to free the slot. (A fast local `gate.sh` pre-check is
   encouraged; the reviewer runs the authoritative gate.) Do 4-8 units, release the slot lock, STOP.
   **Never call spawn_agent.**

## Reviewer flow (replaces: sidecar + wt_merge)
0. `slot_lock.sh acquire reviewer <N>` — single-flight this slot; exit if BUSY. Release at the end.
1. `review_claim.sh claim` → leases ONE PR (`CLAIMED <PR#> <sha>`, keyed by head SHA so two reviewer
   slots never gate the same head) or `NONE`. Handle exactly that PR, then
   `review_claim.sh release <PR#> <sha>`. May claim 2-4 PRs per tick (claim→handle→release, serially).
   Release the slot lock and STOP at the end. **Never call spawn_agent.**
2. `raw-port/army/tools/pr_gate.sh <PR#>` — leases a WARM POOL worktree (`wt_pool.sh acquire-at <head-sha>`)
   and runs gate.sh G0-G5 + regression_check + dup_check in it, with the GATE TOOLS TAKEN FROM
   origin/main (a PR can't ship its own gate), posts commit status `faithfulness-gate` = success/failure,
   then releases the pool worktree. Never dirties the canonical tree; never does a per-PR worktree add.
3. If gate FAIL → `gh pr review <PR#> --request-changes -b "<reason>"` (or comment) and move on.
   Regression fail → run `rebase_helper.py <Class>` (exit 0 = it pushed a rebased branch, gate+merge;
   exit 6 = NEEDS_WORKER_REBASE → leave the FAILURE status; the PR sits in the REBASE queue for a
   worker slot to pull via `rebase_claim.sh`). Dup fail → `gh pr close <PR#>` (symbol already on main).
4. If gate PASS → do the SEMANTIC adversarial review (re-derive disasm independently, line-by-line,
   confirm every real-work instr has a TS counterpart, throws are true externs). If genuinely faithful:
   `gh pr merge <PR#> --squash --auto --delete-branch`. GitHub merges SERVER-SIDE once the required
   status is green → the local tree is NEVER touched. (Auto-merge waits for the status if still pending.)
   NOTE: same gh token opened the PR, so a GitHub "approving review" is blocked (self-approve) — the
   required check is the STATUS, and the reviewer's judgment is enforced by only merging what they've
   verified. Do NOT merge a PR whose faithfulness-gate status is not success.
5. After merge, `mark_ported.py` (updates the ledger — now in $FCT_STATE_DIR, untracked).

## Dispatch model (2026-08-10, Model B) — QUEUE-DRIVEN, no agent ever spawns an agent
There is **no coordinator agent** and **no `spawn_agent` anywhere in the swarm**. Concurrency is
bounded structurally by a fixed set of self-scheduled cron slots + the warm worktree pool. The
scheduler (cron) is the ONLY thing that ever creates a session — so the agent population can never
explode, because agents don't reproduce.

Three kinds of cron:
- **`swarm-maint`** — a SCRIPT cron (no agent): `raw-port/army/tools/swarm_maint.sh`. Every tick it
  does all the non-judgement plumbing the old coordinator did in-agent: ledger guard, warm-pool
  init/gc, clean the canonical tree (only if no gate/submit proc is live), periodic `depclaim.py seed`,
  `depgraph.py reconcile`, and a one-line snapshot. It NEVER spawns and NEVER merges.
- **`swarm-worker-1..4`** — PROMPT crons, each a fixed slot. Every tick: take its slot lock
  (`slot_lock.sh acquire worker <N>`; exit if BUSY), pull ONE rebase task (`rebase_claim.sh claim`) or
  else a batch of 4-8 port units (`depclaim.py next`), open PRs, release the slot lock, STOP.
- **`swarm-reviewer-1..4`** — PROMPT crons, each a fixed slot. Every tick: take its slot lock, claim
  PRs from the review queue (`review_claim.sh claim`), gate/review/merge/reject, release, STOP.

Why this can't explode: a worker/reviewer tick does bounded work and stops; the only way more work
starts is the next cron tick. Max in-flight = (#worker slots + #reviewer slots), further gated by the
8-lease warm pool and the per-slot single-flight lock. Raising throughput = add cron slots (a human
decision), never an agent spawning more agents.

### The three queues (all atomic, all disk-backed under $FCT_STATE_DIR / claims.jsonl)
- **PORT queue** = `depclaim.py` (append-only claim ledger). Workers pull `next`.
- **REBASE queue** = open PRs whose latest `faithfulness-gate` is a regression/rebase FAILURE. Workers
  pull `rebase_claim.sh claim` (atomic lease + per-PR attempt cap 3; past cap the PR is auto-closed and
  its symbol re-queued to the append-only PORT queue). This REPLACES the old push-dispatch
  (`rebase_dispatch.sh --apply` + coordinator spawning a rebase worker).
- **REVIEW queue** = open PRs without a fresh verdict for their current head SHA. Reviewers pull
  `review_claim.sh claim` (atomic lease keyed by PR#+head-SHA so two reviewers never gate the same head).

## Stale-base is now automatic
Branch protection "require branches up to date" forces every PR to be rebased onto current main before
it can merge — GitHub shows "update branch". `pr_submit.sh` already rebases on submit; `rebase_helper.py`
handles the shared-file union-rebase for the setter-family branches.

## Rebase ownership (2026-08-10) — three kinds, three owners; nothing loops
Rebasing splits by how much judgment it needs, so it has three owners:
1. BEHIND / up-to-date only (fast-forwardable) → `pr_land.sh` does it at merge time via GitHub
   `update-branch`. Mechanical, reviewer-side. `pr_submit.sh` also rebases every PR on submit.
2. Shared file, DISJOINT top-level exports → `rebase_helper.py <Class>` unions them mechanically
   (empty-base diff3), gates, pushes. Exit 0 = done (reviewer gate+merges). Safe for the reviewer.
3. Shared CLASS BODY / real conflict (both branch and main added methods inside one `class X {}`) →
   `rebase_helper.py` returns exit 6 NEEDS_WORKER_REBASE. Re-applying net-new methods into main's
   class body is AUTHORING, so a WORKER owns it (the reviewer is the adversary and must not gate its
   own edits). The reviewer just leaves the PR's `faithfulness-gate` at FAILURE (regression reason); the
   PR then sits in the REBASE queue. A worker slot pulls it via `rebase_claim.sh claim` (atomic lease +
   per-PR attempt cap 3), runs `rebase_pr.sh <PR#>` — prepares a pool worktree from CURRENT main + the
   branch's version, re-applies the net-new methods, re-gates, force-pushes the SAME branch in place.
   After the cap the PR is auto-closed and the symbol re-handed to a fresh worker via the PORT queue.
The reviewer NEVER re-gates the same stale head every tick — it escalates (union or worker-queue) or
skips just that tick. This is what stops #12/#14-style PRs from looping forever.

## Migration of the 399 pre-existing port/* branches
`raw-port/army/tools/migrate_branches_to_prs.py` (dry-run default; `--apply` to execute):
MERGED/DUP/EMPTY → delete branch; STALE → rebase_helper then re-triage; CLEAN → open PR.
