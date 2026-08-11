#!/bin/bash
# publish_guard.sh — the two checks that must pass before a rebase tool FORCE-PUSHES over a PR's
# branch. Split out of rebase_pr.sh so they can be tested offline, with git only and no `gh`.
#
# WHY THIS EXISTS. Measured 2026-08-11 on PR #690 (`tools/rework-author-answered`, 5 files, 382
# lines). `rebase_pr.sh` leased a pool worktree, ran
#
#     git -C "$WT" checkout -q -B "$BR" "origin/$BR" 2>/dev/null
#
# and carried on. That checkout FAILED — a peer worker held the same branch in another pool
# worktree, and git refuses to check one branch out twice — but the error went to /dev/null, so the
# worktree stayed on the branch `wt_pool acquire` had cut for it (`port/tools/rework-author-answered`
# off current main, because `CLS="${BR#port/}"` leaves a non-`port/` branch name unchanged and
# wt_pool prefixes `port/`). The tool then rebased THAT onto main (nothing to replay), gated it
# (trivially green — no ports changed), and force-pushed it over the PR's branch:
#
#     REBASE_CLEAN: rebased tools/rework-author-answered onto origin/main + gate PASS, force-pushed
#     git diff --name-status origin/main...<new head>   ->   (empty — the PR published NOTHING)
#
# The author's five files were gone from the branch until the head was force-pushed back. Every line
# of output read like success, the gate was green, and the deletion guards are silent because from
# the pushed head's point of view nothing was deleted — it simply never contained the work.
#
# This is OPS_LOG #1 (a swallowed `checkout -B` error leaves the worktree somewhere else) meeting
# the force-push, and #4's work-deletion shape arriving through the branch NAME rather than through
# content. Two checks close it, and both are cheap:
#
#   1. ON-THE-RIGHT-BRANCH — the worktree's HEAD must actually BE the branch we are about to
#      overwrite, at the commit the remote says it is.
#   2. PUBLISHES-SOMETHING — the head we are about to push must still carry a non-empty three-dot
#      delta against main whenever the CURRENT remote head has one. A push that turns a PR with
#      content into a PR with none is never a rebase; it is a loss.
#
# USAGE
#   publish_guard.sh on-branch     <worktree> <branch>
#   publish_guard.sh publishes     <worktree> <branch> [<base-ref>]      (default base: origin/main)
#   publish_guard.sh both          <worktree> <branch> [<base-ref>]
# Exit 0 = safe to push. Exit 4 = refused, with the reason on stdout. Exit 2 = usage/could not run
# (never read as "safe": the caller must treat it as a refusal too).
set -uo pipefail

cmd="${1:-}"
[ -n "$cmd" ] || { echo "usage: publish_guard.sh on-branch|publishes|both <worktree> <branch> [<base>]"; exit 2; }
WT="${2:-}"
BR="${3:-}"
[ -n "$WT" ] && [ -n "$BR" ] || { echo "usage: publish_guard.sh $cmd <worktree> <branch> [<base>]"; exit 2; }
BASE="${4:-origin/main}"

[ -d "$WT" ] || { echo "publish_guard: no such worktree: $WT"; exit 2; }

on_branch () {
  local head ref
  head=$(git -C "$WT" rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [ "$head" != "$BR" ]; then
    echo "publish_guard: REFUSING — the worktree is on '${head:-<unknown>}', not on '$BR'."
    echo "  A force-push from here would overwrite '$BR' with a branch that is not it. The usual"
    echo "  cause is a swallowed 'checkout -B' failure: git refuses to check out a branch that"
    echo "  another pool worktree already holds, and the caller carried on regardless (OPS_LOG #1)."
    local holder
    holder=$(git -C "$WT" worktree list 2>/dev/null | grep "\[$BR\]" | awk '{print $1}')
    [ -n "$holder" ] && echo "  '$BR' is currently checked out at: $holder"
    return 4
  fi
  # DELIBERATELY NOT AN ANCESTRY TEST. "HEAD must contain origin/<branch>" is the obvious second
  # check and it is wrong here: a rebase REWRITES the commits, so a correct rebase force-push never
  # contains the ref it replaces. (Caught by case 5 of the suite, which is what that case is for.)
  # The rebase-safe form of the same question is about CONTENT, and it lives in `publishes` below.
  return 0
}

publishes () {
  local remote here there
  remote=$(git -C "$WT" rev-parse -q --verify "origin/$BR" 2>/dev/null)
  here=$(git -C "$WT" diff --name-only "$BASE...HEAD" 2>/dev/null | grep -c . )
  if [ -z "$remote" ]; then
    [ "$here" -gt 0 ] && return 0
    echo "publish_guard: REFUSING — this head adds nothing over $BASE and there is no remote branch"
    echo "  to compare against, so the push would create an empty PR branch."
    return 4
  fi
  there=$(git -C "$WT" diff --name-only "$BASE...$remote" 2>/dev/null | grep -c . )
  if [ "$there" -gt 0 ] && [ "$here" -eq 0 ]; then
    echo "publish_guard: REFUSING — this push would publish NOTHING."
    echo "  origin/$BR currently carries $there changed file(s) against $BASE; the head about to"
    echo "  replace it carries 0. A rebase never empties a PR — this is the #690 shape, where the"
    echo "  tool rebased a branch it had accidentally cut from main and force-pushed it over the"
    echo "  author's work while printing REBASE_CLEAN."
    return 4
  fi
  # The general form of the same question, and the one that survives a rebase: every file the
  # REMOTE head changes must still be changed here, UNLESS main has since taken that content (in
  # which case the file legitimately drops out of the delta). Compares file NAMES, so it cannot
  # object to a legitimate re-application of the same edit onto a moved base.
  local lost=""
  local f
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if ! git -C "$WT" diff --name-only "$BASE...HEAD" 2>/dev/null | grep -qxF "$f"; then
      # is the remote's version of this file already on the base? then nothing is being lost
      if [ -n "$(git -C "$WT" diff --name-only "$BASE" "$remote" -- "$f" 2>/dev/null)" ]; then
        lost="$lost $f"
      fi
    fi
  done <<< "$(git -C "$WT" diff --name-only "$BASE...$remote" 2>/dev/null)"
  if [ -n "${lost// /}" ]; then
    echo "publish_guard: REFUSING — this push DROPS file(s) that origin/$BR changes and $BASE does"
    echo "  not have:$lost"
    echo "  A rebase carries the branch's files forward; a push that loses one is the #25/#449 shape"
    echo "  (the union rebase that silently destroyed an oracle harness), and it is irreversible"
    echo "  once the old head is unreferenced."
    return 4
  fi
  return 0
}

case "$cmd" in
  on-branch) on_branch; exit $? ;;
  publishes) publishes; exit $? ;;
  both)      on_branch || exit 4; publishes || exit 4
             echo "publish_guard: OK — on '$BR', and the push keeps the PR's content"; exit 0 ;;
  *) echo "publish_guard: unknown command '$cmd'"; exit 2 ;;
esac
