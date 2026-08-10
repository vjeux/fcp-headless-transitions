#!/bin/bash
# pr_submit.sh <Class> — worker-side: push the current worktree's port branch and open a PR.
# Run from inside the worker's leased WARM POOL worktree (cwd = the worktree for branch
# port/<Class>). Idempotent: if a PR already exists it just prints it.
set -uo pipefail
CLASS="${1:?usage: pr_submit.sh <Class>}"
REPO_SLUG="vjeux/fcp-headless-transitions"
BR="port/$CLASS"
# must be on the branch with commits
CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
[ "$CUR" != "$BR" ] && echo "WARN: on '$CUR', expected '$BR' — pushing $CUR anyway"
BR="$CUR"

# rebase onto latest main so the PR is not stale-base (branch protection requires up-to-date anyway)
git fetch -q origin main 2>&1 | tail -1
git rebase -q origin/main 2>&1 | tail -2 || { echo "REBASE CONFLICT on $BR — resolve or use rebase_helper.py"; exit 4; }

git push -q -u origin "$BR" --force-with-lease 2>&1 | tail -2

# open (or find) the PR
EXIST=$(gh pr list --repo "$REPO_SLUG" --head "$BR" --json number --jq '.[0].number' 2>/dev/null)
if [ -n "$EXIST" ]; then
  echo "PR already open: #$EXIST"
  gh pr view "$EXIST" --repo "$REPO_SLUG" --json url --jq .url
else
  gh pr create --repo "$REPO_SLUG" --base main --head "$BR" --fill \
    --title "port: $CLASS" \
    --body "Automated raw-port unit for \`$CLASS\`. Faithfulness gate (G0-G5 + regression + dup) runs via pr_gate.sh on vjeux-mac; adversarial reviewer approves. See PR_MIGRATION_PLAN.md." 2>&1 | tail -3
fi
