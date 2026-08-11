#!/bin/bash
# swarm_maint.sh — headless maintenance tick for the queue-driven swarm (Model B).
#
# This is a SCRIPT cron (no agent, no spawn_agent). It does every non-judgement plumbing task
# headlessly, so the worker/reviewer PROMPT crons can stay tiny and
# purely pull-driven. Runs on cli:vjeux-mac against the canonical checkout. Prints ONE status line.
#
# Does: (0) ledger guard, (1) warm-pool init+gc, (2) clean the canonical tree if no gate/submit proc
# is live, (3) periodic depclaim seed (catch up newly-merged/branch symbols), (4) depgraph reconcile,
# (5) disk-guard signal + a snapshot line. It NEVER spawns agents and NEVER merges PRs.
set -uo pipefail
CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
T="raw-port/army/tools"

# (0) LEDGER GUARD — must succeed or we refuse (empty queue otherwise)
if ! bash "$T/ensure_ledger.sh" >/tmp/swarm_maint_ledger.log 2>&1; then
  echo "swarm_maint: FATAL ledger missing/unrestorable — see /tmp/swarm_maint_ledger.log"; exit 1
fi

# (1) WARM POOL — idempotent init + refresh idle worktrees to origin/main
bash "$T/wt_pool.sh" init "${WT_POOL_SIZE:-16}" >/dev/null 2>&1 || true
bash "$T/wt_pool.sh" gc >/dev/null 2>&1 || true

# (2) CLEAN TREE — PR flow never dirties the canonical tree; if it's dirty AND no worker/reviewer/gate
# proc is running, reset it. Ignore gitignored runtime state (ledger/, .gate.tsbuildinfo).
git fetch -q origin main 2>/dev/null || true
# MACHINE-GENERATED STATE IS NOT "DIRTY". Everything in this list is regenerable output that
# ordinary swarm activity rewrites in this tree, so counting it as local work is what pinned the
# checkout: `raw-port/army/cache/stubscan_cites.v1.json` is a TRACKED 1.5 MB cache that
# `stubscan.py` (FileCache("stubscan_cites")) rewrites every few minutes, so `dirty` was never
# empty, so the fast-forward below could never run — while the reset --hard path that would have
# cleaned it is itself held shut by `gatebusy`, which on a busy swarm is always set. The two
# branches deadlocked against each other and the tree sat 45 commits behind, permanently.
MACHINE_STATE='raw-port/army/ledger/|raw-port/\.gate\.tsbuildinfo|raw-port/army/depgraph/|raw-port/army/cache/'
dirty=$(git status --porcelain 2>/dev/null | grep -vE "$MACHINE_STATE" | head -1)
gatebusy=$(pgrep -f 'pr_gate.sh|pr_submit.sh|pr_land.sh|rebase_pr.sh' >/dev/null 2>&1 && echo 1 || echo "")
if [ -n "$dirty" ] && [ -z "$gatebusy" ]; then
  git reset --hard origin/main >/dev/null 2>&1 || true
  git clean -fdq -- 'raw-port/re/disasm/*.s' 2>/dev/null || true
fi
# (2b) CLEAN BUT BEHIND — fast-forward. THE RESET ABOVE ONLY FIRES ON A DIRTY TREE, so a tree that
# is merely stale was never advanced at all, and the canonical checkout is normally clean: measured
# 2026-08-11 at **85 commits behind** origin/main with a single ignored untracked file. That is not
# cosmetic. The ledger lives in this checkout (raw-port/army/ledger/), so `mark_ported.py` must run
# HERE — which means agents execute the 85-commit-old copy of the tool. #506 fixed mark_ported to
# read origin/main instead of the stale tree, and the fix could not take effect, because the fix is
# delivered THROUGH the tree it is trying to stop trusting. `--ff-only` cannot lose work: it refuses
# rather than rewriting, and it runs only when the tree is clean and no gate process is live.
# NOTE THE MISSING $gatebusy CONDITION — it is deliberate, and removing it is the fix.
#
# The fast-forward used to require "no gate/submit/land process running", copied from the reset
# --hard path above where it is essential. On a busy swarm that condition is NEVER satisfied: gates
# run continuously, so the FF never fired and the canonical checkout drifted to 38 commits behind
# while an agent watched the window fail to open 12 times in 120 seconds. That is not a theoretical
# staleness — every agent invokes `raw-port/army/tools/*` FROM THIS TREE, so they ran a rework_claim
# that lacked its own "already reworked" skip and drove four PRs to the attempt cap for no reason.
#
# The condition is also unnecessary HERE, which is why dropping it is safe rather than a trade:
# pr_gate/pr_submit/pr_land never check out into the canonical tree — they lease a POOL worktree
# (`wt_pool.sh acquire-at`) and only ever read the canonical tree's git DIR. A `--ff-only` merge of a
# CLEAN tree writes no new content those readers can see mid-operation: it refuses rather than
# rewriting, and the `-z "$dirty"` guard above already ensures nothing local is at risk.
# The destructive path (reset --hard) keeps the gate guard, because that one can genuinely discard.
if [ -z "$dirty" ]; then
  behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "${behind:-0}" -gt 0 ]; then
    if git merge --ff-only origin/main >/dev/null 2>&1; then
      echo "swarm_maint: fast-forwarded canonical tree $behind commit(s) to origin/main"
    elif [ -n "$(git status --porcelain -- raw-port/army/cache/ 2>/dev/null)" ]; then
      # The tree is clean apart from the machine-generated state excluded above, so the only thing
      # that can refuse a fast-forward is an incoming commit touching one of those same files —
      # today that means the tracked stubscan cache. Discarding a regenerable cache is free (the
      # next stubscan run rewrites it), and NOT discarding it re-creates the deadlock the moment
      # any commit carries a new copy: the reset --hard path cannot clean it while a gate is live,
      # which is always. Scoped to that one directory, and only after a real FF failure.
      git checkout -- raw-port/army/cache/ >/dev/null 2>&1 || true
      git merge --ff-only origin/main >/dev/null 2>&1 \
        && echo "swarm_maint: fast-forwarded canonical tree $behind commit(s) to origin/main (discarded the regenerable stubscan cache first)" \
        || echo "swarm_maint: canonical tree is $behind behind and NOT fast-forwardable — needs a human"
    else
      echo "swarm_maint: canonical tree is $behind behind and NOT fast-forwardable — needs a human"
    fi
  fi
fi

# (3) SEED — catch up symbols merged/pushed outside depclaim so `next` never re-hands them. Cheap-ish
# (~30-90s); throttle to roughly every ~30min via a stamp so back-to-back maint ticks don't repeat it.
STAMP="${FCT_STATE_DIR:-$HOME/.fct-pool}/last_seed"; now=$(date +%s)
last=$(cat "$STAMP" 2>/dev/null || echo 0)
if [ $(( now - last )) -ge 1800 ]; then
  timeout 150 python3 "$T/depclaim.py" seed >/tmp/swarm_maint_seed.log 2>&1 && echo "$now" > "$STAMP" || true
fi

# (4) RECONCILE the ledger status against current origin/main src
timeout 120 python3 "$T/depgraph.py" reconcile >/tmp/swarm_maint_reconcile.log 2>&1 || true

# (5) SNAPSHOT line
FREEGB=$(df -g /System/Volumes/Data | tail -1 | awk '{print $4}')
LOAD1=$(uptime | sed 's/.*averages: //' | awk '{print $1}')
# stats can take >90s under load; a 0 here means TIMEOUT-killed, not drained (workers pull from
# depclaim.py next directly, so this line is informational only). Give it room, mark ? on timeout.
READY=$(timeout 150 python3 "$T/depgraph.py" stats 2>/dev/null | grep "READY NOW" | grep -oE '[0-9]+' | head -1)
BACKLOG=$(gh pr list --repo vjeux/fcp-headless-transitions --state open --limit 100 --json number --jq 'length' 2>/dev/null)
echo "swarm_maint: freeGB=$FREEGB load1=$LOAD1 ready=${READY:-timeout} openPRs=${BACKLOG:-?} pool=$(bash "$T/wt_pool.sh" status 2>&1 | grep -c LEASED)/${WT_POOL_SIZE:-16} leased"
