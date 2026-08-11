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

# REBASE ONLY WHAT NOBODY HAS SEEN. On a branch with no remote counterpart, a rebase rewrites
# commits that exist only here, and the push that follows is a plain create — nothing to force.
# On a branch that IS already published, the same rebase rewrites the PUBLISHED head, and the push
# then has to force. That is the whole source of the force-push in the worker path, and it is the
# one that hurts most: re-pushing a reworked PR is exactly when a reviewer has already signed the
# old head. Merging instead keeps the rejected commit in the history where the review trail can
# still point at it, and makes the push a fast-forward.
#
# (A force-push onto a commit that is already on main also CLOSES the PR outright — observed today,
# and restoring the branch does not reopen it.)
if git rev-parse --verify -q "refs/remotes/origin/$BR" >/dev/null; then
  git merge --no-edit origin/main 2>&1 | tail -2 || {
    echo "MERGE CONFLICT on $BR — resolve it here, or use rebase_helper.py"; exit 4; }
else
  git rebase -q origin/main 2>&1 | tail -2 || {
    echo "REBASE CONFLICT on $BR — resolve or use rebase_helper.py"; exit 4; }
fi

# NO --force-with-lease. Either the branch is new (nothing to overwrite) or we merged (a
# descendant, so it fast-forwards). A rejection here means a peer moved the branch, which is
# something to read rather than something to overpower.
if ! bash "$GHAPP/git_push_as.sh" worker -q -u origin "$BR" 2>/tmp/pr_submit_push.log; then
  if grep -qE "non-fast-forward|fetch first|rejected" /tmp/pr_submit_push.log 2>/dev/null; then
    echo "pr_submit: push REJECTED — a peer has pushed to $BR since you branched."
    echo "  Do NOT force. Bring their work in and re-run:"
    echo "      git fetch origin $BR && git merge --no-edit origin/$BR"
    exit 4
  fi
  tail -2 /tmp/pr_submit_push.log
  echo "pr_submit: push failed"; exit 4
fi

# open (or find) the PR
# RECORD WHO OPENED IT. GitHub cannot tell one agent from another here — every PR is authored by the
# worker app, and the operator login is shared by the whole swarm — so a reviewer slot has no way to
# know it is about to review its own work (it happened; the lease and the verification were wasted,
# and GitHub then refuses the verdict). The authoring agent is the only party that knows, so it
# writes the fact down: $STATE/authored/<PR> = the agent id. review_claim skips its own.
# The id must be one a REVIEWER process can also hold, which rules out the obvious default: this
# function used to fall back to `$(hostname -s)-$$`, the pid of THIS pr_submit run, and no other
# process can ever equal that — so the marker was written, looked healthy, and could never match.
# A marker that cannot match is worse than no marker: it makes a dormant guard look wired. With no
# id, write nothing and say why (absent marker => "not mine" => review_claim proceeds, which is the
# fail-open behaviour it documents).
note_authored () { # <PR#>
  [ -n "${1:-}" ] || return 0
  if [ -z "${FCT_AGENT_ID:-}" ]; then
    echo "pr_submit: FCT_AGENT_ID unset — not recording who authored PR #$1, so a reviewer slot" >&2
    echo "           cannot skip its own PR. (run: export FCT_AGENT_ID=worker-<N>)" >&2
    return 0
  fi
  local d="${FCT_STATE_DIR:-$HOME/.fct-pool}/authored"
  mkdir -p "$d" 2>/dev/null || return 0
  echo "$FCT_AGENT_ID" > "$d/$1" 2>/dev/null || true
}

EXIST=$(bash "$GHAPP/gh_as.sh" worker pr list --repo "$REPO_SLUG" --head "$BR" --json number --jq '.[0].number' 2>/dev/null)
if [ -n "$EXIST" ]; then
  echo "PR already open: #$EXIST"
  note_authored "$EXIST"
  bash "$GHAPP/gh_as.sh" worker pr view "$EXIST" --repo "$REPO_SLUG" --json url --jq .url
else
  bash "$GHAPP/gh_as.sh" worker pr create --repo "$REPO_SLUG" --base main --head "$BR" --fill \
    --title "port: $CLASS" \
    --body "Automated raw-port unit for \`$CLASS\`. Faithfulness gate (G0-G5 + regression + dup) runs via pr_gate.sh on vjeux-mac; adversarial reviewer approves. See PR_MIGRATION_PLAN.md." 2>&1 | tail -3
  note_authored "$(bash "$GHAPP/gh_as.sh" worker pr list --repo "$REPO_SLUG" --head "$BR" --json number --jq '.[0].number' 2>/dev/null)"
fi
