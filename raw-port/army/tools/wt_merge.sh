#!/bin/bash
# wt_merge.sh <agentTag> — SERIALIZED merge-queue step. Safe to run from ANYWHERE (main checkout OR
# inside an agent worktree). Takes ONE agent's branch port/<tag>, runs the faithfulness gate on ITS
# changed files, and if green merges it into main and pushes. A global lock serializes merges so
# there's never a push race. This is the ONLY place that writes to main — agents never touch main.
set -euo pipefail
TAG="${1:?usage: wt_merge.sh <agentTag>}"
BR="port/$TAG"

# --- Resolve the MAIN worktree explicitly (NOT via this script's path) -------------------------
# When invoked from inside an agent worktree, dirname-of-$0 would point at the worktree and
# `git checkout main` would fail ('main' is already used by worktree <main>). The shared .git lives
# at <mainWorktree>/.git for ALL worktrees, so derive the main worktree from --git-common-dir.
COMMON_GIT="$(cd "$(git rev-parse --git-common-dir)" && pwd)"   # -> <main>/.git (absolute)
REPO="$(dirname "$COMMON_GIT")"                                 # -> <main> worktree
cd "$REPO"
LOCKDIR="$REPO/raw-port/army/worktrees/.merge.lock.d"

# SCALING (vjeux 2026-07-29): the EXPENSIVE gate (gate.sh + G5 + tsgo, ~20-25s) and the reviewer
# sidecar check operate on BRANCH content + the <file>.review.json — NOT on main state — so they do
# NOT need the global lock. Running them inside the lock serialized ALL merges at ~0.5/min (one gate
# at a time) regardless of reviewer count. We now gate OUTSIDE the lock (parallel across reviewers,
# 10 idle cores) and take the lock ONLY for the ~2s git merge+push critical section. Ceiling ~10x.

git fetch -q origin
git show-ref --verify -q "refs/heads/$BR" || { echo "no branch $BR"; exit 1; }

# what did this branch change under raw-port/src vs origin/main?
# what did THIS BRANCH change under raw-port/src vs the MERGE-BASE with origin/main?
# 3-dot (origin/main...BR) = only commits unique to the branch. 2-dot would also list files that
# origin/main added since the branch point (they appear as deletions from the branch's side), which
# the G0 existence gate would then wrongly reject even though this branch never touched them.
CHANGED="$(git diff --name-only origin/main...$BR -- 'raw-port/src/**/*.ts' | sed "s#^#$REPO/#")"
echo "== gating $BR changed files: =="; echo "$CHANGED" | sed 's/^/  /'
if [ -n "$CHANGED" ]; then
  # gate runs against the BRANCH content in a throwaway gate-worktree so tsc sees its files.
  # PID suffix ($$) makes the gate-worktree unique per reviewer process: two concurrent reviewers
  # gating the SAME branch/TAG no longer collide on `fatal: '.gate-<TAG>' already exists`, and the
  # stale-removal below can no longer nuke another reviewer's in-flight gate-worktree.
  GW="$REPO/raw-port/army/worktrees/.gate-$TAG.$$"
  git worktree remove --force "$GW" 2>/dev/null || true   # clear any stale gate-worktree
  git worktree add -q --force "$GW" "$BR"
  ln -sfn "$REPO/engine/node_modules"    "$GW/engine/node_modules"    2>/dev/null || true
  ln -sfn "$REPO/raw-port/node_modules"  "$GW/raw-port/node_modules"  2>/dev/null || true
  GCHANGED="$(echo "$CHANGED" | sed "s#$REPO/#$GW/#")"
  RC=0; ( cd "$GW" && bash raw-port/army/gate/gate.sh $GCHANGED ) || RC=$?
  git worktree remove --force "$GW" 2>/dev/null || true
  [ "$RC" = 0 ] || { echo "GATE FAILED for $BR — NOT merging"; exit 2; }

  # --- REVIEWER SIGN-OFF GATE (worker cannot self-merge a real body) ---------------------------
  # G5 (in gate.sh) blocks the mechanical cheat (REAL disasm + throw-only body). The adversarial
  # reviewer (REVIEWER_BRIEF.md) covers what G5 can't: a throw-free body that is WRONG. Before merge,
  # every changed src file must carry an ACCEPT verdict in <file>.review.json (verdict in
  # {VERIFIED,LIKELY_REAL,TRAP,EMPTY} AND merge_allowed==true), written by the reviewer sub-agent.
  # Escape hatch for the closely-watched pilot: WT_MERGE_SKIP_REVIEW=1 (logged, must be justified).
  if [ "${WT_MERGE_SKIP_REVIEW:-0}" != "1" ]; then
    REVIEW_FAIL=0
    for f in $CHANGED; do
      case "$f" in *.ts) ;; *) continue ;; esac
      rev="${f}.review.json"
      if [ ! -f "$rev" ]; then
        echo "  REVIEW MISSING: $rev — reviewer (REVIEWER_BRIEF.md) must sign off before merge"; REVIEW_FAIL=1; continue
      fi
      ok=$(python3 -c "import json,sys;d=json.load(open('$rev'));print('1' if (d.get('merge_allowed') is True and d.get('verdict') in ('VERIFIED','LIKELY_REAL','TRAP','EMPTY')) else '0')" 2>/dev/null)
      if [ "$ok" != "1" ]; then
        echo "  REVIEW REJECTED/INVALID: $rev (verdict must be VERIFIED/LIKELY_REAL/TRAP/EMPTY + merge_allowed=true)"; REVIEW_FAIL=1
      else
        echo "  review OK: $(basename "$f")"
      fi
    done
    [ "$REVIEW_FAIL" = 0 ] || { echo "REVIEWER GATE FAILED for $BR — NOT merging (set WT_MERGE_SKIP_REVIEW=1 to bypass in a watched pilot)"; exit 3; }
  else
    echo "  (reviewer gate BYPASSED via WT_MERGE_SKIP_REVIEW=1 — pilot mode)"
  fi
fi

# --- Merge into main and push (from the MAIN worktree) -----------------------------------------
# CRITICAL SECTION: acquire the global lock ONLY now (gate + review already passed OUTSIDE the lock).
# Only ONE merge+push touches main at a time; everything expensive already ran in parallel.
for i in $(seq 1 900); do mkdir "$LOCKDIR" 2>/dev/null && break; sleep 1; done
trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT
# RETRY LOOP: even under the merge lock, origin can advance between our pull and push if a push
# landed from elsewhere (or the lock was contended). A bare `push` then rejects with "cannot lock
# ref 'refs/heads/main': is at X but expected Y". Re-pull (--no-edit) + re-push up to 5x instead of
# failing the whole merge. Each iteration re-integrates the newest origin/main before pushing.
BEFORE="$(git rev-parse origin/main)"
BR_TIP="$(git rev-parse "$BR")"
git checkout -q main
# AUTO-CLEAN untracked disasm scratch in the MAIN tree before merging. A peer session that ran
# disasm.sh/disasm_class.sh with cwd=main (or dropped a *.s here) leaves untracked re/disasm/*.s;
# if the incoming branch ADDS the same tracked path, `git merge` aborts with "untracked working
# tree files would be overwritten by merge". These .s are fully regenerable from the binary, so
# removing untracked ones under re/disasm is safe and unblocks the merge (workers keep their own
# copies in their worktrees — this only touches MAIN's untracked scratch).
git clean -fdq -- raw-port/re/disasm 2>/dev/null || true
PUSHED=0
for attempt in 1 2 3 4 5; do
  git pull -q --no-edit origin main
  # merge is idempotent — if $BR is already contained, this is a no-op and returns 0.
  git merge -q --no-edit "$BR" || { echo "MERGE CONFLICT on $BR — needs manual resolve"; exit 3; }
  if git push -q origin main 2>/dev/null; then PUSHED=1; break; fi
  echo "  push rejected (origin advanced) — re-pull+retry ($attempt/5)"
  git fetch -q origin
  sleep 1
done
[ "$PUSHED" = 1 ] || { echo "PUSH FAILED after 5 retries for $BR — origin kept advancing; re-run wt_merge"; exit 5; }

# VERIFY the push actually advanced origin AND that the branch tip is now reachable from origin/main.
git fetch -q origin
AFTER="$(git rev-parse origin/main)"
if git merge-base --is-ancestor "$BR_TIP" "$AFTER"; then
  if [ "$AFTER" = "$BEFORE" ]; then
    # branch tip already in main before we started (nothing new) — report honestly, don't fake a land.
    echo "NOOP: $BR already contained in origin/main ($AFTER) — nothing merged"
  else
    echo "MERGED + PUSHED $BR -> main ($BEFORE -> $AFTER)"
  fi
  git worktree remove --force "$REPO/raw-port/army/worktrees/$TAG" 2>/dev/null || true
  git branch -q -d "$BR" 2>/dev/null || true
else
  echo "PUSH DID NOT LAND $BR into origin/main (origin=$AFTER, tip=$BR_TIP) — investigate"; exit 4
fi
