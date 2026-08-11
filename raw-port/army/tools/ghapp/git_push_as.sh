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
# ARGV PARSE, HOISTED. Both guards below need "is this forced, and at what branch", and the two
# used to be computed inside the first guard's `if` — so the second one read unset variables and
# could never fire. A guard that cannot fire reads as protection while providing none (OPS_LOG #44),
# and this file is the last thing standing between a bad step and an irreversible push.
_forced=0; _refspec=""; _remote=""; _src=""; _dst=""
for _a in "$@"; do
  case "$_a" in
    -f|--force|--force-with-lease|--force-with-lease=*) _forced=1 ;;
    -*) ;;
    *) if [ -z "$_remote" ]; then _remote="$_a"; else [ -z "$_refspec" ] && _refspec="$_a"; fi ;;
  esac
done
if [ -n "$_refspec" ]; then
  _src="${_refspec%%:*}"; _dst="${_refspec#*:}"; [ "$_dst" = "$_refspec" ] && _dst="$_src"
  _dst="${_dst#refs/heads/}"
else
  # No refspec at all (`git push -f origin`, or bare `git push -f`): git resolves the target from
  # push.default, which for `current` is the checked-out branch. Resolve it the same way rather
  # than treating the absent refspec as "nothing to check" — OPS_LOG already records a force-push
  # going somewhere unintended precisely because the refspec was implicit.
  _dst="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"; _src="HEAD"
fi

if [ "${FCT_ALLOW_EMPTY_PUSH:-}" != "1" ]; then
  if [ "$_forced" = 1 ] && [ -n "$_refspec" ]; then
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

# ─────────────────────────────────────────────────────────────────────────────────────────────────
# REFUSE TO FORCE-PUSH A BRANCH THAT AN OPEN PR IS POINTING AT.
#
# The rule, in one line: a PR head may only ever GAIN commits.
#
# Nothing in this repo needs a rewritten PR head. `pr_land.sh` ends in `gh pr merge --squash`, so
# main's linear history comes from the SQUASH — the shape of the feature branch is discarded at
# merge time and no force-push was ever buying it. What the force-push bought instead was three
# destructive incidents and a guard apiece:
#
#   * #449 — a force-push dropped files the PR had (an oracle harness). rebase_helper needed a
#     file-list post-condition to notice.
#   * 92 reviewer-verified lines on an APPROVED PR replaced by an EMPTY branch when a prepare step
#     raised inside `set -uo pipefail` and the next line pushed anyway. That is the check below this
#     one, and its own comment concedes the general case is uncatchable: "the destruction happens at
#     the push, before any gate sees the head."
#   * A force-push onto a commit that is already on main CLOSES the PR — `head_ref_force_pushed` and
#     `closed` in the same second — and restoring the branch does not reopen it. That is a live
#     mechanism for the below-cap PR closures OPS_LOG had recorded as unexplained.
#
# Each guard is narrow because each was written after one specific incident. This is the general
# form, and it is the one the callers can now satisfy: every tool that used to force here MERGES
# current main in and fast-forwards instead (rebase_pr.sh's clean, union and manual paths;
# pr_submit.sh). A merge can only add commits, so it cannot do any of the three.
#
# SCOPE, deliberately: only a branch with an OPEN PR. A scratch ref a tool owns and deletes
# (rebase_helper's `port/<Class>_rebased`) is not a PR head and is not covered — rewriting your own
# throwaway hurts nobody. FCT_ALLOW_PR_FORCE=1 is the escape hatch for a human who has read this and
# decided anyway; it prints what it is doing, because a silent override is how a rule stops existing.
if [ "${FCT_ALLOW_PR_FORCE:-}" != "1" ] && [ "${_forced:-0}" = 1 ] && [ -n "${_dst:-}" ]; then
  _slug="${FCT_REPO:-vjeux/fcp-headless-transitions}"
  # One call, and its failure is NOT a verdict: if gh cannot answer we allow the push rather than
  # block a worker on a TLS blip. A refusal that fires on a network hiccup gets disabled by whoever
  # it blocks, and then it protects nothing (this repo has already learned that twice today).
  _pr_json=$("$ROOT/gh_as.sh" "$ROLE" pr list --repo "$_slug" --state open --head "$_dst" \
               --json number,reviewDecision --jq '.[0] | "\(.number) \(.reviewDecision // "-")"' 2>/dev/null)
  _pr_num="${_pr_json%% *}"
  if [ -n "$_pr_num" ] && [ "$_pr_num" != "null" ]; then
    cat >&2 <<EOM
git_push_as: REFUSING to force-push origin/$_dst — PR #$_pr_num is open on it (review: ${_pr_json#* }).

  A PR head may only GAIN commits. A force-push rewrites it, and this repo has paid for that three
  times: files silently dropped (#449), 92 reviewer-verified lines replaced by an empty branch, and
  a PR CLOSED outright by forcing onto a commit already on main (restoring the branch does not
  reopen it).

  Nothing needs the rewrite — pr_land squashes, so main stays linear either way. Merge instead:

      git fetch origin main && git merge --no-edit origin/main
      git push origin "HEAD:$_dst"          # fast-forwards; no -f

  If the plain push is rejected, a PEER moved the branch. Merge their head too, do not force:

      git fetch origin $_dst && git merge --no-edit origin/$_dst

  Deliberate exception, having read the above: FCT_ALLOW_PR_FORCE=1
EOM
    exit 10
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
