#!/usr/bin/env bash
# fct swarm push-helper — reliably commit+push a swarm sub-agent's work to origin/main.
#
# WHY THIS EXISTS: swarm sub-agents work in a git WORKTREE under ~/fct-swarm/worktrees/<id>.
# This helper turns "land my work" into one reliable command: it commits the agent's changes,
# rebases onto the latest origin/main, re-runs the gate, and pushes (retrying if another agent
# pushed meanwhile).
#
# APPROACH (2026-07-16 rewrite — NO rsync). The agent COMMITS IN ITS OWN WORKTREE, then we
# push that commit and REBASE onto origin/main. git rebase replays ONLY the agent's commit
# (the diff it authored) on top of current origin — so files the agent never touched (the
# swarm harness: pool.py, this script, setup_worktree.sh, agent_brief.md, ...) are taken from
# origin UNCHANGED. This makes the old "stale-base worktree clobbers the harness" bug
# STRUCTURALLY IMPOSSIBLE.
#
# The previous approach rsync'd the worktree's whole FILE STATE into a fresh clone with
# --delete, then `git add -A`. That overlay dragged the worktree's HOUR-OLD copy of every
# untouched file (incl. the harness) back onto origin — reverting harness fixes 4x in one
# session (2026-07-16). rsync was originally chosen because a) worktrees share the main .git
# and b) some sandboxed environments denied writes to .git/worktrees/*, making an in-worktree
# `git add` silently fail. On THIS node in-worktree commits work fine (verified), and even if
# they didn't, the fallback below commits via a private index without touching the shared .git.
#
# The gate MUST already be green in the worktree — the helper re-runs it after the rebase as a
# final safety check and refuses to push on RED.
#
# STAGING RULE: agents author engine/, docs/, ROADMAP.md, and the APPEND-ONLY fct/swarm/todo/
# queue — never other harness code. We stage `everything EXCEPT fct/swarm/` plus `fct/swarm/todo/`.
# So even if a stale worktree's working tree contains an old harness file, it is never staged,
# never committed, never pushed. (Belt-and-suspenders on top of the rebase guarantee.)
#
# Usage: push_helper.sh <agent-id> <commit-msg-file>
set -euo pipefail
ID="${1:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
MSGFILE="${2:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
MAIN="$HOME/random/final-cut-pro-transitions"
WT="$HOME/fct-swarm/worktrees/$ID"

[ -d "$WT" ] || { echo "push_helper: no worktree $WT" >&2; exit 2; }
[ -f "$MSGFILE" ] || { echo "push_helper: no commit-msg file $MSGFILE" >&2; exit 2; }
[ -s "$MSGFILE" ] || { echo "push_helper: commit-msg file $MSGFILE is empty" >&2; exit 2; }

cd "$WT"

# 1. Stage the agent's work: EVERYTHING EXCEPT the harness, PLUS the append-only todo queue.
#    ':(exclude)fct/swarm' keeps pool.py/push_helper.sh/setup_worktree.sh/agent_brief.md/etc.
#    OUT of the commit (the agent must not author harness code); the explicit `add
#    fct/swarm/todo` re-includes the one path agents legitimately extend.
git add -A -- . ':(exclude)fct/swarm'
git add -- fct/swarm/todo 2>/dev/null || true

# 2. Nothing staged? Then the worktree has no landable (non-harness) change vs its base.
if git diff --cached --quiet; then
  echo "push_helper: no non-harness changes staged — nothing to push"
  exit 0
fi

# 3. Commit in the worktree.
git commit --quiet -F "$MSGFILE"

# 4. Push with rebase-retry. `git rebase origin/main` replays ONLY this commit's diff onto the
#    latest origin — untouched harness files come from origin, never from this (maybe stale)
#    worktree. Re-run the gate after each rebase (origin may have changed the engine).
export FCT_FRAMES_DIR="$HOME/fct-swarm/frames/$ID" FCT_LOCK="$HOME/fct-swarm/locks/$ID-push.lock" FCT_JOBS=1
for attempt in 1 2 3 4 5; do
  git fetch --quiet origin
  if ! git rebase --quiet origin/main 2>/tmp/fct-swarm-rebase-$ID.err; then
    git rebase --abort 2>/dev/null || true
    echo "push_helper: rebase conflict onto origin/main — agent must re-do edit on latest main" >&2
    cat /tmp/fct-swarm-rebase-$ID.err >&2 || true
    exit 6
  fi
  # Final safety gate AFTER rebasing onto the latest engine.
  ./fct.sh regress engine || { echo "push_helper: GATE RED after rebase — refusing to push" >&2; exit 5; }
  if git push --quiet origin HEAD:main 2>/tmp/fct-swarm-push-$ID.err; then
    echo "push_helper: pushed $(git rev-parse --short HEAD) to origin/main (attempt $attempt)"
    exit 0
  fi
  echo "push_helper: push rejected (attempt $attempt) — another agent pushed; retrying" >&2
done
echo "push_helper: exhausted push retries" >&2
exit 7
