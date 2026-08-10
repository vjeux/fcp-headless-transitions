#!/bin/bash
# git_push_as.sh <role> <git push args...> — push as the WORKER (or reviewer) GitHub App.
#
# Run from inside the worktree you want to push. Falls back to the operator's own git credentials
# when the app is not configured, so this is safe to land before the apps exist.
#
#   git_push_as.sh worker -u origin port/Foo --force-with-lease
#
# The token is passed to git through an inline credential helper that reads it from the ENVIRONMENT
# (FCT_GH_TOKEN) rather than from argv — a token in a command line is visible to every process on the
# box via `ps`, and this box runs a dozen concurrent agents.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
ROLE="${1:?usage: git_push_as.sh <worker|reviewer> <git push args...>}"; shift

TOK="$("$ROOT/app_token.sh" "$ROLE" 2>/dev/null)"; rc=$?
if [ "$rc" != 0 ] || [ -z "$TOK" ]; then
  [ "$rc" != 7 ] && echo "git_push_as: app token for '$ROLE' failed (rc=$rc) — using operator git auth" >&2
  exec git push "$@"
fi
export FCT_GH_TOKEN="$TOK"
exec git \
  -c credential.helper= \
  -c credential.helper='!f() { echo username=x-access-token; echo "password=$FCT_GH_TOKEN"; }; f' \
  push "$@"
