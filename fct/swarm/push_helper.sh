#!/usr/bin/env bash
# fct swarm push-helper — reliably commit+push a swarm sub-agent's work to origin/main.
#
# WHY THIS EXISTS: swarm sub-agents work in a git WORKTREE under ~/fct-swarm/worktrees/<id>.
# Committing + pushing directly from a worktree is fragile: (a) a worktree shares the main
# repo's .git and can race other sub-agents' index/ref writes, and (b) some sandboxed
# execution environments deny writes to the shared ".git/worktrees/*" metadata, so even
# `git add` (which writes `.git/worktrees/<id>/index.lock`) can silently fail — leaving the
# real work stranded on disk while the push "succeeds" with an empty diff. This helper makes
# landing work a single reliable command instead of each sub-agent re-improvising it.
#
# APPROACH: rsync the worktree's FILE STATE (working tree, untracked files included)
# into a fresh /tmp clone of origin/main, then `git add -A` + commit + push from
# there. This is isolated from the shared .git and captures the sub-agent's changes even
# when an in-worktree `git add` was blocked. (Prior in-worktree approach used `git add -A`
# + `git diff --cached origin/main`; when the add silently failed the empty diff made
# push_helper falsely report "nothing to push" while the real work sat uncommitted on disk.)
#
# The gate MUST already be green in the worktree — the script re-runs the gate in
# the /tmp clone as a final safety check before pushing, and refuses to push on RED.
# It rebase-retries (up to 5 rounds) if another sub-agent pushes to origin/main meanwhile.
#
# Usage: push_helper.sh <agent-id> <commit-msg-file>
set -euo pipefail
ID="${1:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
MSGFILE="${2:?usage: push_helper.sh <agent-id> <commit-msg-file>}"
MAIN="$HOME/random/final-cut-pro-transitions"
WT="$HOME/fct-swarm/worktrees/$ID"
CLONE="/tmp/fct-swarm-push-$ID"

[ -d "$WT" ] || { echo "push_helper: no worktree $WT" >&2; exit 2; }
[ -f "$MSGFILE" ] || { echo "push_helper: no commit-msg file $MSGFILE" >&2; exit 2; }
[ -s "$MSGFILE" ] || { echo "push_helper: commit-msg file $MSGFILE is empty" >&2; exit 2; }

# 1. Fresh /tmp clone of the CURRENT origin/main (isolated from the shared .git).
# --no-hardlinks is REQUIRED: `git clone --local` defaults to hardlinking object
# files across dirs, but a sandboxed execution environment can deny hardlinks between
# ~/random/... and /tmp/... (macOS SIP/com.apple.provenance), so the clone fails at
# the first object with `failed to create link ... Operation not permitted`
# (observed 2026-07-13). --no-hardlinks copies the objects instead — always safe.
rm -rf "$CLONE"
git clone --quiet --local --no-hardlinks --no-checkout "$MAIN" "$CLONE"
cd "$CLONE"
git remote set-url origin "$(git -C "$MAIN" remote get-url origin)"
git fetch --quiet origin
git checkout --quiet -B main origin/main

# 2. Overlay the worktree's file state onto the clone. Excludes:
#    - .git         : keep the clone's own git dir
#    - engine/node_modules, venv : symlinks re-created below
#    - .swarm_*     : per-worktree scratch (brief, runner script)
#    - .fctcache    : per-worktree render thumbnail caches
#    Using --delete so the clone tracks the worktree state exactly (files the agent
#    deleted in the worktree are also removed in the clone). node_modules and venv
#    are the two exceptions because they're gitignored symlinks — deleting them in
#    the clone would leave `./fct.sh regress` unable to run.
# --filter='protect .git' is belt-and-suspenders: `--exclude='.git'/.git/` should
# already keep rsync out of the destination's `.git`, but 2026-07-13 T-B1's harvest
# died with `rsync error: .git: unlinkat: Directory not empty` on this same call
# (see pool.log around 02:41), which STRANDED gate-verified work until a later run
# re-derived it. `protect` is a hard "never delete" instruction on the destination
# side, independent of the include/exclude machinery — it can't be tripped by an edge
# case where source has `.git` as a file (worktree gitlink) and dest has it as a dir.
rsync -a --delete \
  --filter='protect /.git' \
  --filter='protect /.git/**' \
  --exclude='.git/' \
  --exclude='.git' \
  --exclude='engine/node_modules' \
  --exclude='venv' \
  --exclude='.swarm_*' \
  --exclude='.fctcache/' \
  "$WT/" "$CLONE/"

# 3. Re-establish the shared-heavy symlinks the gate needs.
[ -e engine/node_modules ] || ln -s "$MAIN/engine/node_modules" engine/node_modules
[ -e venv ] || ln -s "$MAIN/venv" venv

# 4. Stage everything from the overlay (a plain /tmp git dir, no worktree metadata).
git add -A

# 5. Guard against no-op overlays (worktree happened to match origin/main).
if git diff --cached --quiet; then
  echo "push_helper: worktree contents match origin/main after rsync — nothing to push"
  rm -rf "$CLONE"
  exit 0
fi

# 6. Final safety gate in the clone (private frames dir + lock; reuse the agent's).
export FCT_FRAMES_DIR="$HOME/fct-swarm/frames/$ID" FCT_LOCK="$HOME/fct-swarm/locks/$ID-push.lock" FCT_JOBS=2
./fct.sh regress engine || { echo "push_helper: GATE RED in clone — refusing to push" >&2; exit 5; }

# 7. Commit + push with rebase-retry (up to 5 rounds if others push meanwhile).
git commit --quiet -F "$MSGFILE"
for attempt in 1 2 3 4 5; do
  if git push origin HEAD:main 2>/tmp/fct-swarm-push-$ID.err; then
    echo "push_helper: pushed $(git rev-parse --short HEAD) to origin/main (attempt $attempt)"
    rm -rf "$CLONE"
    exit 0
  fi
  echo "push_helper: push rejected (attempt $attempt) — rebasing onto origin/main" >&2
  git fetch --quiet origin && git rebase origin/main || { echo "push_helper: rebase conflict — agent must resolve" >&2; exit 6; }
done
echo "push_helper: exhausted push retries" >&2
exit 7
