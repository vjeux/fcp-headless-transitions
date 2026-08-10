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

## Worker flow (replaces: port → push → wt_setup done)
1. `depclaim.py next` → get a ready unit (unchanged).
2. Port in an **ISOLATED clone or worktree OUTSIDE the canonical checkout** (never edit the canonical
   tree; the shared .git contention that wedged worktree-add is why workers should use a private clone:
   `git clone <canon> ~/.fct-clones/<Class>` or a worktree under /tmp).
3. Write the real body (anti-cheat rules UNCHANGED — see DEP_WORKER_BRIEF.md: @0xADDR provenance,
   no in-scope throw-stubs, call_once sentinel, ADD-only, one-symbol-one-file).
4. `raw-port/army/tools/pr_submit.sh <Class>` — rebases onto origin/main, pushes port/<Class>,
   opens a PR. STOP. (No local gate needed; the reviewer runs it. A fast local `tsgo` pre-check is
   encouraged to save a round-trip.)

## Reviewer flow (replaces: sidecar + wt_merge)
1. `gh pr list --repo vjeux/fcp-headless-transitions --state open` → pick a PR without a fresh verdict.
2. `raw-port/army/tools/pr_gate.sh <PR#>` — runs gate.sh G0-G5 + regression_check + dup_check in an
   isolated worktree, with the GATE TOOLS TAKEN FROM origin/main (a PR can't ship its own gate), and
   posts commit status `faithfulness-gate` = success/failure. Never dirties the canonical tree.
3. If gate FAIL → `gh pr review <PR#> --request-changes -b "<reason>"` (or comment) and move on.
   Regression fail → tell author to rebase (or run `rebase_helper.py <Class>` and re-push).
   Dup fail → `gh pr close <PR#>` (symbol already on main).
4. If gate PASS → do the SEMANTIC adversarial review (re-derive disasm independently, line-by-line,
   confirm every real-work instr has a TS counterpart, throws are true externs). If genuinely faithful:
   `gh pr merge <PR#> --squash --auto --delete-branch`. GitHub merges SERVER-SIDE once the required
   status is green → the local tree is NEVER touched. (Auto-merge waits for the status if still pending.)
   NOTE: same gh token opened the PR, so a GitHub "approving review" is blocked (self-approve) — the
   required check is the STATUS, and the reviewer's judgment is enforced by only merging what they've
   verified. Do NOT merge a PR whose faithfulness-gate status is not success.
5. After merge, `mark_ported.py` (updates the ledger — now in $FCT_STATE_DIR, untracked).

## Coordinator flow (replaces: wt_merge orchestration)
- Spawn workers + reviewers only. NO wt_merge, NO sidecar bookkeeping, NO merge lock.
- Monitor via `gh pr list`. Backlog = open PRs. "Merged" = closed-merged PRs.
- Workers use pr_submit; reviewers use pr_gate + gh pr merge. Coordinator never merges.

## Stale-base is now automatic
Branch protection "require branches up to date" forces every PR to be rebased onto current main before
it can merge — GitHub shows "update branch". `pr_submit.sh` already rebases on submit; `rebase_helper.py`
handles the shared-file union-rebase for the setter-family branches.

## Migration of the 399 pre-existing port/* branches
`raw-port/army/tools/migrate_branches_to_prs.py` (dry-run default; `--apply` to execute):
MERGED/DUP/EMPTY → delete branch; STALE → rebase_helper then re-triage; CLEAN → open PR.
