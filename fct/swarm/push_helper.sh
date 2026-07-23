#!/usr/bin/env bash
# fct swarm push-helper — commit+push a swarm sub-agent's work to origin/main.
#
# Swarm sub-agents work in a git WORKTREE under ~/fct-swarm/worktrees/<id>. This helper commits
# the agent's changes IN ITS WORKTREE, rebases onto the latest origin/main, re-runs the gate,
# and pushes (retrying if another agent pushed meanwhile).
#
# Rebase replays ONLY the agent's committed diff onto current origin, so files the agent never
# touched come from origin unchanged. Staging is scoped to the agent's own domain — everything
# EXCEPT the swarm harness (fct/swarm/*.py, *.sh, *.md), plus the append-only fct/swarm/todo/
# queue — so harness files are never staged or pushed by an agent.
#
# Usage: push_helper.sh <agent-id> <commit-msg-file>
set -euo pipefail
ID="${1:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
MSGFILE="${2:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
WT="$HOME/fct-swarm/worktrees/$ID"

[ -d "$WT" ] || { echo "push_helper: no worktree $WT" >&2; exit 2; }
[ -f "$MSGFILE" ] || { echo "push_helper: no commit-msg file $MSGFILE" >&2; exit 2; }
[ -s "$MSGFILE" ] || { echo "push_helper: commit-msg file $MSGFILE is empty" >&2; exit 2; }

cd "$WT"

# 1. Stage the agent's work: everything EXCEPT the harness, plus the append-only todo queue.
#    ':(exclude)fct/swarm' keeps harness code out of the commit; `add fct/swarm/todo`
#    re-includes the one path agents legitimately extend.
git add -A -- . ':(exclude)fct/swarm'
git add -- fct/swarm/todo 2>/dev/null || true

# 2. Nothing staged? Then the worktree has no landable (non-harness) change vs its base.
if git diff --cached --quiet; then
  echo "push_helper: no non-harness changes staged — nothing to push"
  exit 0
fi

# 3. Commit in the worktree.
git commit --quiet -F "$MSGFILE"

# 4. Push with rebase-retry. Re-run the gate after each rebase (origin may have changed the engine).
export FCT_FRAMES_DIR="$HOME/fct-swarm/frames/$ID" FCT_LOCK="$HOME/fct-swarm/locks/$ID-push.lock" FCT_JOBS=1
for attempt in 1 2 3 4 5; do
  git fetch --quiet origin
  if ! git rebase --quiet origin/main 2>/tmp/fct-swarm-rebase-$ID.err; then
    git rebase --abort 2>/dev/null || true
    echo "push_helper: rebase conflict onto origin/main — agent must re-do edit on latest main" >&2
    cat /tmp/fct-swarm-rebase-$ID.err >&2 || true
    exit 6
  fi
  # GATE (updated 2026-07-23): the 65-slug full-frame `regress engine` gate was DISABLED
  # by vjeux on 2026-07-22 (geometry-dominated, misleads node decode) — it now exits 2
  # unconditionally, which the old `|| exit 5` mis-read as "gate red", so NO agent could
  # ever push (swarm-wide blocker, hit by every subswarm agent). The sanctioned truth is
  # now per-node (each agent verifies with its own subsystem/parity tests BEFORE calling
  # this helper). Here we gate on the two things a push must never break globally:
  #   (1) the TS build compiles (tsc --noEmit) — a broken build breaks every agent;
  #   (2) the function-level parity self-test still passes (the pure-math node oracle).
  # A subsystem correctness change is validated by the agent's `fct subswarm test <s>` /
  # `fct min-score`, not re-run here (that would be the slow, race-prone full suite).
  echo "push_helper: gate — tsc --noEmit"
  if ! ( cd engine && node_modules/.bin/tsc --noEmit ); then
    echo "push_helper: GATE RED — tsc errors after rebase, refusing to push" >&2; exit 5
  fi
  echo "push_helper: gate — fct parity selftest"
  if ! ./fct.sh parity selftest >/tmp/fct-swarm-parity-$ID.log 2>&1; then
    echo "push_helper: GATE RED — parity selftest failed after rebase, refusing to push" >&2
    tail -20 /tmp/fct-swarm-parity-$ID.log >&2 || true; exit 5
  fi
  if git push --quiet origin HEAD:main 2>/tmp/fct-swarm-push-$ID.err; then
    echo "push_helper: pushed $(git rev-parse --short HEAD) to origin/main (attempt $attempt)"
    exit 0
  fi
  echo "push_helper: push rejected (attempt $attempt) — another agent pushed; retrying" >&2
done
echo "push_helper: exhausted push retries" >&2
exit 7
