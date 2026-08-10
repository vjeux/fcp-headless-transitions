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
dirty=$(git status --porcelain 2>/dev/null | grep -vE 'raw-port/army/ledger/|raw-port/\.gate\.tsbuildinfo|raw-port/army/depgraph/' | head -1)
if [ -n "$dirty" ] && ! pgrep -f 'pr_gate.sh|pr_submit.sh|pr_land.sh|rebase_pr.sh' >/dev/null 2>&1; then
  git reset --hard origin/main >/dev/null 2>&1 || true
  git clean -fdq -- 'raw-port/re/disasm/*.s' 2>/dev/null || true
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
