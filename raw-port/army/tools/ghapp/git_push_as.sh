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

# REFUSE A FORCE-PUSH THAT WOULD REPLACE REAL WORK WITH NOTHING.
#
# A worker's ad-hoc script ran `set -uo pipefail` WITHOUT -e, its heredoc python3 raised, and the
# `git push -f` on the next line ran anyway — publishing an EMPTY branch over an APPROVED PR, which
# was then closed. 92 reviewer-verified lines were gone. Every command in between printed something
# that read like success, which is what made it invisible.
#
# No gate can catch this: the destruction happens at the push, before any gate sees the head. But it
# has one unmistakable signature — the remote branch has commits against origin/main and the ref we
# are about to force over it has NONE. That is never a legitimate rebase; it is a prepare step that
# failed silently. Refuse, and say what to check.
#
# Deliberately narrow: only force pushes, only when the remote genuinely has content and the local
# genuinely has none. A branch that legitimately becomes empty (work landed, so it merged out) is
# rare and can pass FCT_ALLOW_EMPTY_PUSH=1 deliberately.
if [ "${FCT_ALLOW_EMPTY_PUSH:-}" != "1" ]; then
  _forced=0; _refspec=""; _remote=""
  for _a in "$@"; do
    case "$_a" in
      -f|--force|--force-with-lease|--force-with-lease=*) _forced=1 ;;
      -*) ;;
      *) if [ -z "$_remote" ]; then _remote="$_a"; else [ -z "$_refspec" ] && _refspec="$_a"; fi ;;
    esac
  done
  if [ "$_forced" = 1 ] && [ -n "$_refspec" ]; then
    _src="${_refspec%%:*}"; _dst="${_refspec#*:}"; [ "$_dst" = "$_refspec" ] && _dst="$_src"
    _dst="${_dst#refs/heads/}"
    if git rev-parse --verify -q "$_src" >/dev/null 2>&1 \
       && git rev-parse --verify -q "origin/$_dst" >/dev/null 2>&1 \
       && git rev-parse --verify -q "origin/main" >/dev/null 2>&1; then
      _remote_n=$(git rev-list --count "origin/main..origin/$_dst" 2>/dev/null || echo 0)
      _local_n=$(git rev-list --count "origin/main..$_src" 2>/dev/null || echo 0)
      if [ "${_remote_n:-0}" -gt 0 ] && [ "${_local_n:-0}" -eq 0 ]; then
        cat >&2 <<EOM
git_push_as: REFUSING to force-push $_src over origin/$_dst.
  The remote branch has $_remote_n commit(s) beyond origin/main; what you are pushing has NONE.
  This force-push would REPLACE REAL WORK WITH AN EMPTY BRANCH. It destroyed 92 reviewer-verified
  lines on an APPROVED PR today, when a prepare step raised inside \`set -uo pipefail\` (no -e) and
  the push on the next line ran regardless.
  Check the step before this one actually succeeded:
      git log --oneline origin/main..$_src     # should not be empty
      git status
  If the branch is genuinely meant to be empty, re-run with FCT_ALLOW_EMPTY_PUSH=1.
EOM
        exit 9
      fi
    fi
  fi
fi

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
