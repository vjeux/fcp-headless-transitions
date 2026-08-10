#!/bin/bash
# gh_as.sh <role> <gh args...> — run `gh` as the swarm's WORKER or REVIEWER GitHub App.
#
# The swarm used to do everything as one identity (vjeux), which is why reviewers could not use
# GitHub's review system: an account cannot review its own PR. With the worker app authoring PRs and
# the reviewer app judging them, APPROVE / REQUEST_CHANGES become available and branch protection can
# require a reviewer-app approval server-side.
#
#   gh_as.sh reviewer pr review 123 --approve -b "..."
#   gh_as.sh worker   pr create --base main --head port/Foo --title ...
#
# FALLBACK IS THE POINT: if the app for <role> is not configured (app_token.sh exits 7), this runs
# plain `gh` with the operator's own auth — byte-for-byte today's behavior. So every caller can be
# switched over before the apps exist, and nothing breaks while they are being set up.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
ROLE="${1:?usage: gh_as.sh <worker|reviewer> <gh args...>}"; shift

TOK="$("$ROOT/app_token.sh" "$ROLE" 2>/dev/null)"; rc=$?
if [ "$rc" != 0 ] || [ -z "$TOK" ]; then
  # 7 = role not configured (expected before setup); anything else is a real failure worth surfacing.
  [ "$rc" != 7 ] && echo "gh_as: app token for '$ROLE' failed (rc=$rc) — falling back to operator auth" >&2
  exec gh "$@"
fi
# GH_TOKEN overrides the keyring account for this one invocation only.
GH_TOKEN="$TOK" GITHUB_TOKEN="$TOK" exec gh "$@"
