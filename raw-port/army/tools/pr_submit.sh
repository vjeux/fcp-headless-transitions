#!/bin/bash
# pr_submit.sh <Class> — worker-side: push the current worktree's port branch and open a PR.
# Run from inside the worker's leased WARM POOL worktree (cwd = the worktree for branch
# port/<Class>). Idempotent: if a PR already exists it just prints it.
set -uo pipefail
CLASS="${1:?usage: pr_submit.sh <Class>}"
REPO_SLUG="vjeux/fcp-headless-transitions"
# Act as the WORKER GitHub App so the PR author is a different principal from the reviewer that
# judges it — that separation is what makes GitHub's Approve/Request-changes usable at all. Both
# helpers fall back to the operator's own auth when the app is not configured.
GHAPP="$(cd "$(dirname "$0")" && pwd)/ghapp"
BR="port/$CLASS"
# must be on the branch with commits
CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
# REFUSE a class/branch mismatch instead of pushing anyway. The old behavior ("pushing $CUR anyway")
# put a port on someone else's class branch — worker-01's MinMax port opened as port/OZDynamicSpline
# (#338) because it kept the lease after a `depclaim drop` and the worktree was still on the dropped
# class's branch. That is worse than a mislabelled PR: wt_pool stacks onto any branch with an OPEN
# PR, so the next `acquire OZDynamicSpline` would inherit an unrelated file — the stale-base
# work-deletion shape re-entering through the branch NAME.
# Refuse only for a genuine class mismatch; a deliberate suffix (port/<Class>__w1, __slot3,
# _rebased) is how workers legitimately avoid collisions, so allow those.
if [ "$CUR" != "$BR" ]; then
  case "$CUR" in
    "$BR"__*|"$BR"_*)
      echo "note: on '$CUR' (a variant of $BR) — pushing that" ;;
    main|master|HEAD|"")
      echo "REFUSING: worktree is on '$CUR', not a port branch for $CLASS." >&2
      echo "  Run pr_submit.sh with cwd INSIDE your leased worktree, on the branch holding your commits." >&2
      exit 5 ;;
    *)
      echo "REFUSING: worktree is on '$CUR' but you asked to submit '$CLASS'." >&2
      echo "  Pushing anyway would file your work on another class's branch (see #338)." >&2
      echo "  If you kept the lease after a depclaim drop, release the worktree and re-acquire," >&2
      echo "  or cut a fresh branch:  git checkout -B $BR origin/main" >&2
      exit 5 ;;
  esac
fi
BR="$CUR"

# rebase onto latest main so the PR is not stale-base (branch protection requires up-to-date anyway)
git fetch -q origin main 2>&1 | tail -1
# Drop remote-tracking refs for branches that were deleted server-side after their PR merged. Without
# this, the next push to a REUSED class branch name fails with "! [rejected] (stale info)" — reported
# by 3 separate workers, each of whom debugged it from scratch.
git remote prune origin >/dev/null 2>&1 || true
git rebase -q origin/main 2>&1 | tail -2 || { echo "REBASE CONFLICT on $BR — resolve or use rebase_helper.py"; exit 4; }

bash "$GHAPP/git_push_as.sh" worker -q -u origin "$BR" --force-with-lease 2>&1 | tail -2

# open (or find) the PR
EXIST=$(bash "$GHAPP/gh_as.sh" worker pr list --repo "$REPO_SLUG" --head "$BR" --json number --jq '.[0].number' 2>/dev/null)
if [ -n "$EXIST" ]; then
  echo "PR already open: #$EXIST"
  bash "$GHAPP/gh_as.sh" worker pr view "$EXIST" --repo "$REPO_SLUG" --json url --jq .url
else
  bash "$GHAPP/gh_as.sh" worker pr create --repo "$REPO_SLUG" --base main --head "$BR" --fill \
    --title "port: $CLASS" \
    --body "Automated raw-port unit for \`$CLASS\`. Faithfulness gate (G0-G5 + regression + dup) runs via pr_gate.sh on vjeux-mac; adversarial reviewer approves. See PR_MIGRATION_PLAN.md." 2>&1 | tail -3
fi
