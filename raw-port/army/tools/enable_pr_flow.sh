#!/bin/bash
# enable_pr_flow.sh — one-time repo config for the PR-based flow (WS-3 branch protection).
# Requires admin (vjeux has it). Idempotent.
set -uo pipefail
REPO_SLUG="vjeux/fcp-headless-transitions"

echo "=== enable auto-merge + squash + delete-branch-on-merge ==="
gh api -X PATCH "repos/$REPO_SLUG" \
  -F allow_auto_merge=true -F allow_squash_merge=true -F delete_branch_on_merge=true \
  --jq '{allow_auto_merge,allow_squash_merge,delete_branch_on_merge}'

echo "=== branch protection on main: require faithfulness-gate status + 1 review + up-to-date ==="
# Using the classic branch-protection API (require status contexts + PR reviews + strict/up-to-date).
gh api -X PUT "repos/$REPO_SLUG/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["faithfulness-gate"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "dismiss_stale_reviews": true },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo "=== verify ==="
gh api "repos/$REPO_SLUG/branches/main/protection" --jq '{strict:.required_status_checks.strict, contexts:.required_status_checks.contexts, reviews:.required_pull_request_reviews.required_approving_review_count, linear:.required_linear_history.enabled}'
