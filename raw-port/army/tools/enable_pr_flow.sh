#!/bin/bash
# enable_pr_flow.sh — one-time repo config for the PR-based flow (WS-3). Requires admin. Idempotent.
#
# NOTE on the review requirement: the worker and reviewer agents both authenticate as the same gh
# token (vjeux), and GitHub blocks approving your OWN PR. So we do NOT require a GitHub "approving
# review" (it'd be unsatisfiable). Instead the merge gate is the required STATUS CHECK
# 'faithfulness-gate' (posted by the reviewer's pr_gate.sh) + up-to-date + linear history. The
# reviewer's SEMANTIC judgment is enforced procedurally: only the reviewer runs pr_gate.sh (posting
# green) and only then merges. A future dedicated reviewer bot account could re-add required reviews.
set -uo pipefail
REPO_SLUG="vjeux/fcp-headless-transitions"

echo "=== enable auto-merge + squash + delete-branch-on-merge ==="
gh api -X PATCH "repos/$REPO_SLUG" \
  -F allow_auto_merge=true -F allow_squash_merge=true -F delete_branch_on_merge=true \
  --jq '{allow_auto_merge,allow_squash_merge,delete_branch_on_merge}'

echo "=== branch protection on main: require 'faithfulness-gate' status + up-to-date + linear ==="
gh api -X PUT "repos/$REPO_SLUG/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["faithfulness-gate"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
gh api -X POST "repos/$REPO_SLUG/branches/main/protection/enforce_admins" >/dev/null 2>&1 || true
echo "enforce_admins: $(gh api repos/$REPO_SLUG/branches/main/protection/enforce_admins --jq .enabled)"
echo "=== verify ==="
gh api "repos/$REPO_SLUG/branches/main/protection" --jq '{strict:.required_status_checks.strict, contexts:.required_status_checks.contexts, linear:.required_linear_history.enabled, force:.allow_force_pushes.enabled}'
