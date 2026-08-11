#!/bin/bash
# rebase_pr.sh <PR#> — WORKER-side conflict-rebase of a regression-failed PR, IN PLACE.
#
# OWNERSHIP (2026-08-10): rebasing splits by kind of work —
#   - "up-to-date"/BEHIND (fast-forwardable)   -> pr_land.sh update-branch      [reviewer, mechanical]
#   - shared file, DISJOINT top-level exports  -> rebase_helper.py (union)      [reviewer, automatic]
#   - shared CLASS BODY / real conflict        -> THIS TOOL, run by a WORKER    [author work]
# A conflict rebase requires deciding which code to keep = AUTHORING, so the WORKER (author) owns it,
# NOT the reviewer (adversary — must not gate its own edits). This tool sets up the rebase in a warm
# pool worktree, auto-resolves what it safely can, and for a shared-class-body conflict PREPARES the
# worktree (main's current file + the branch's net-new methods extracted) so the worker re-applies
# them with the edit tool, then re-gates and force-pushes the SAME branch (the PR updates in place;
# NO new PR). Never touches main.
#
# USAGE: rebase_pr.sh <PR#>
#   Prints one of:
#     REBASE_CLEAN   — git rebase onto origin/main applied with no conflict; force-pushed. Done.
#     REBASE_UNION   — rebase_helper unioned disjoint top-level exports; pushed. Done.
#     REBASE_MANUAL  — shared-class-body conflict. The worktree is prepared at $WT with:
#                        raw-port/src/<file>  = main's CURRENT version (findFirstChild/etc intact)
#                        /tmp/rebase_pr_<PR>_theirs/<file> = the branch's version (your net-new methods)
#                      RE-APPLY your net-new methods into main's class body with the edit tool, then:
#                        bash raw-port/army/gate/gate.sh <file>   # must PASS
#                        git -C "$WT" add -A && git -C "$WT" commit -m "rebase port/<Class> onto main"
#                        git -C "$WT" push -f origin HEAD:<branch>
#                        bash raw-port/army/tools/wt_pool.sh release "$WT"
#                      The worker AGENT completes this step (it needs judgment); the PR then re-gates.
set -uo pipefail
PR="${1:?usage: rebase_pr.sh <PR#>}"
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
git fetch -q origin main 2>/dev/null || true

BR=$(gh pr view "$PR" --repo "$SLUG" --json headRefName --jq .headRefName 2>/dev/null)
[ -z "$BR" ] && { echo "rebase_pr: PR #$PR not found"; exit 1; }
CLS="${BR#port/}"; CLS="${CLS%_rebased}"
echo "rebase_pr: PR #$PR  branch=$BR  class=$CLS"

# ---- Attempt 1: rebase_helper (handles up-to-date + disjoint-top-level-export union) ----
# --pr, not "$CLS": a class can have several open PRs on `port/<Class>__slot<N>` branches, and the
# class-keyed form resolved to whichever one held the bare name — handing back a DIFFERENT agent's
# content with exit 0. We know the PR number here, so there is no reason to guess.
python3 raw-port/army/tools/rebase_helper.py --pr "$PR" > /tmp/rebase_pr_${PR}_rh.log 2>&1; rc=$?
if [ "$rc" = 0 ]; then
  # rebase_helper pushed port/<Class>_rebased. Repoint: the SAME PR can't change head branch, so the
  # reviewer will gate the _rebased branch as its own PR. For in-place, force-push _rebased -> BR.
  git fetch -q origin "port/${CLS}_rebased" 2>/dev/null
  # LAST GUARD BEFORE AN IRREVERSIBLE FORCE-PUSH: compare the FILE LIST, not just the gate. A green
  # gate says nothing about a file the rebase dropped, because the gate only inspects the .ts files
  # handed to it (that is how #449 lost an oracle harness). rebase_helper now carries non-src files
  # and asserts they survived; this repeats the check at the push, where the damage would be done.
  MISSING=$(comm -23 \
    <(git diff --name-only "origin/main...origin/$BR" | sort) \
    <(git diff --name-only "origin/main...origin/port/${CLS}_rebased" | sort) | tr '\n' ' ')
  if [ -n "${MISSING// /}" ]; then
    echo "rebase_pr: REFUSING to force-push — the rebased branch is missing files the PR has: $MISSING"
    echo "REBASE_MANUAL"; exit 6
  fi
  git push -f origin "refs/remotes/origin/port/${CLS}_rebased:refs/heads/$BR" 2>/dev/null \
    && { echo "REBASE_UNION: force-pushed union result onto $BR (PR #$PR updates in place)"; \
         git push -q origin --delete "port/${CLS}_rebased" 2>/dev/null || true; exit 0; }
  echo "REBASE_UNION: pushed port/${CLS}_rebased (reviewer merges that)"; exit 0
fi
if [ "$rc" = 3 ]; then echo "rebase_pr: PR #$PR not stale / nothing to rebase (rebase_helper exit 3)"; exit 3; fi

# ---- Attempt 2: plain git rebase in a pool worktree (clean fast-forward / non-conflicting) ----
WT="$(bash raw-port/army/tools/wt_pool.sh acquire "$CLS")"
[ -z "$WT" ] && { echo "rebase_pr: pool busy, retry"; exit 3; }
cleanup_release () { bash raw-port/army/tools/wt_pool.sh release "$WT" >/dev/null 2>&1; }
git -C "$WT" fetch -q origin "$BR" 2>/dev/null
git -C "$WT" checkout -q -B "$BR" "origin/$BR" 2>/dev/null
if git -C "$WT" rebase -q origin/main >/tmp/rebase_pr_${PR}_reb.log 2>&1; then
  CHANGED=$(git -C "$WT" diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
  if [ -n "$CHANGED" ] && ! (cd "$WT" && bash raw-port/army/gate/gate.sh $CHANGED >/tmp/rebase_pr_${PR}_gate.log 2>&1); then
    echo "rebase_pr: clean rebase but gate FAILED — needs worker fix; worktree at $WT"; echo "REBASE_MANUAL"; exit 6
  fi
  git -C "$WT" push -f origin "HEAD:$BR" 2>/dev/null && { echo "REBASE_CLEAN: rebased $BR onto origin/main + gate PASS, force-pushed (PR #$PR in place)"; cleanup_release; exit 0; }
  echo "rebase_pr: push failed"; cleanup_release; exit 1
fi
# ---- Conflict: prepare the worktree for the WORKER AGENT to re-apply net-new methods ----
git -C "$WT" rebase --abort 2>/dev/null || true
CONFLICT_FILES=$(git -C "$WT" diff --name-only origin/main...origin/$BR -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
THEIRS="/tmp/rebase_pr_${PR}_theirs"; rm -rf "$THEIRS"; mkdir -p "$THEIRS"
# Re-fetch first: on a busy swarm main moves between the START of this script (rebase_helper +
# a full rebase attempt + a gate run, minutes) and here, and "CURRENT main" that is minutes stale
# is how a hand-merge ends up force-pushing a DELETION of everything that landed in between
# (seen on PR #478: three ports, their oracles and an OPS_LOG section). This narrows the window;
# the worker still has to re-check before committing, which step 3 below now says explicitly.
git -C "$WT" fetch -q origin main 2>/dev/null || true
git -C "$WT" checkout -q --detach origin/main 2>/dev/null
git -C "$WT" checkout -q -B "$BR" origin/main 2>/dev/null      # start from CURRENT main
for f in $CONFLICT_FILES; do
  mkdir -p "$THEIRS/$(dirname "$f")"
  git show "origin/$BR:$f" > "$THEIRS/$f" 2>/dev/null || true   # the branch's version (net-new methods)
done
cat <<MANUAL
REBASE_MANUAL: PR #$PR ($BR) has a shared-class-body / true conflict — WORKER AGENT must finish.
  Pool worktree (started from CURRENT origin/main):  $WT
  Files to reconcile:  $CONFLICT_FILES
  The branch's version of each (your net-new methods to RE-APPLY):  $THEIRS/<file>
  STEPS (in the worktree at \$WT):
    1. For each file: open $WT/<file> (= main's current class) and $THEIRS/<file> (= your branch).
       Add ONLY your net-new methods (the ones NOT already on main) into main's class body with the
       edit tool. Do NOT drop main's methods. Keep @0xADDR provenance.
    2. bash raw-port/army/gate/gate.sh $CONFLICT_FILES      # must print GATE: PASS
    3. git -C "$WT" diff origin/main --stat                 # ONLY the files you edited may appear!
       main moves while you merge; anything else listed would be DELETED by your force-push, and
       gate.sh/G6 cannot see it (they only inspect the file you hand them). If so:
         git -C "$WT" fetch origin main && git -C "$WT" reset --hard origin/main
       then re-apply your merge on top (copy your edited files aside first) and re-gate.
    4. git -C "$WT" add -A && git -C "$WT" commit -q -m "rebase $BR onto origin/main (re-apply net-new methods)"
    5. git -C "$WT" fetch origin main && git -C "$WT" rebase origin/main   # <- pr_submit.sh does
       this for a PORT commit, which is exactly why the port path never publishes a stale base;
       this path force-pushes what you wrote, so do it here by hand.
       git -C "$WT" push -f origin "HEAD:$BR"               # updates PR #$PR in place
    6. bash raw-port/army/tools/wt_pool.sh release "$WT"
MANUAL
exit 6
