#!/bin/bash
# pr_comment_once.sh <PR#> <body> — post a PR comment IDEMPOTENTLY (structural no-duplicate guard).
#
# WHY: reviewer slots post a one-line evidence comment per verdict. A reviewer agent sometimes
# re-emits (rewords + re-posts) the same comment — observed on PR #98 (reviewer-7 posted its ACCEPT
# and UPDATE comments twice each). The verdict of record is the faithfulness-gate STATUS + merge, so
# the comment is decorative; a duplicate is pure noise. This helper makes the post single-shot: it
# stamps every comment with a hidden marker <!--rc:KEY--> (KEY = first 60 alnum chars of the body) and
# refuses to post if a comment with that marker already exists on the PR. So calling it N times with
# the same (or a trivially-reworded-but-same-prefix) body posts AT MOST ONCE.
#
#   pr_comment_once.sh <PR#> "<body text>"
# exit 0 = posted OR already-present (idempotent success); exit 2 = usage/error.
set -uo pipefail
SLUG="vjeux/fcp-headless-transitions"
PR="${1:?usage: pr_comment_once.sh <PR#> <body>}"; shift
BODY="${*:?usage: pr_comment_once.sh <PR#> <body>}"
# dedup key = first 60 alphanumerics of the body (stable across whitespace/punctuation rewording)
KEY=$(printf '%s' "$BODY" | tr -cd '[:alnum:]' | cut -c1-60)
MARKER="<!--rc:${KEY}-->"
# already posted? (search existing comment bodies for the marker)
if gh pr view "$PR" --repo "$SLUG" --json comments --jq '.comments[].body' 2>/dev/null | grep -qF "$MARKER"; then
  echo "pr_comment_once: PR #$PR already has this comment (marker match) — skipping duplicate"
  exit 0
fi
gh pr comment "$PR" --repo "$SLUG" --body "$BODY

$MARKER" >/dev/null 2>&1 && echo "pr_comment_once: posted to PR #$PR" || { echo "pr_comment_once: post failed"; exit 2; }
