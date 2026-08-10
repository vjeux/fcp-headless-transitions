#!/bin/bash
# wt_pool.sh — WARM worktree pool for the FCP raw-port swarm.
#
# WHY: the OLD flow did `git worktree add` (materialize ~2,579 files = 79MB) + `worktree remove`
# PER UNIT / PER PR. git itself is fast (~0.4s) but the file-write VOLUME is what corp Microsoft
# Defender (MDM-locked — CANNOT be excluded, verified) scans on every write; that scan storm is what
# pegged the box to load 52 with ~20 agents. This pool keeps a FIXED set of long-lived worktrees and,
# per unit, only `git reset --hard <ref>` + writes the ONE changed file. Reuses the checked-out tree
# AND a warm tsgo .gate.tsbuildinfo (typecheck ~1.2s -> ~0.2s). Net: ~1 file-write per unit instead of
# ~2,579, and NO per-unit add/remove churn — so Defender has ~2,500x fewer writes to scan.
#
# USAGE:
#   wt_pool.sh init [N]            -> pre-create N warm worktrees (default WT_POOL_SIZE or 8).
#   wt_pool.sh acquire <Class>     -> lease a warm wt, reset to origin/main, cut branch port/<Class>.
#                                     Prints the wt path on stdout (all logs go to stderr). WORKERS.
#   wt_pool.sh acquire-at <SHA>    -> lease a warm wt, detached-checkout at <SHA> (a PR head).
#                                     Prints the wt path. REVIEWERS (pr_gate).
#   wt_pool.sh release <path>      -> reset to origin/main, drop branch, free the lease. Reuses the checkout.
#   wt_pool.sh gc                  -> reset all IDLE pool worktrees to origin/main (refresh warm cache).
#   wt_pool.sh status              -> show slots, lease holder, age.
#
# Pool under ~/.fct-pool/wt/NN (Spotlight-excluded via .metadata_never_index; Defender is MDM-locked so
# we cannot exclude it — the whole point is to minimize writes, not to exclude the dir). Leases are
# atomic mkdir locks in ~/.fct-pool/leases/NN (mkdir is atomic, so two concurrent agents can't grab the
# same slot). acquire BLOCK-WAITS up to WT_POOL_WAIT sec (default 120) for a free slot.
set -uo pipefail
CANON="$HOME/random/final-cut-pro-transitions"
POOL="$HOME/.fct-pool"; WTDIR="$POOL/wt"; LEASES="$POOL/leases"
NPOOL="${WT_POOL_SIZE:-8}"; WAIT="${WT_POOL_WAIT:-120}"
mkdir -p "$WTDIR" "$LEASES"
touch "$POOL/.metadata_never_index" 2>/dev/null

log () { echo "$@" >&2; }   # never pollute stdout (callers read the wt path from stdout)

link_deps () {
  local wt="$1"
  for d in raw-port/node_modules venv; do
    [ -e "$CANON/$d" ] && ln -sfn "$CANON/$d" "$wt/$d" 2>/dev/null
  done
}

make_wt () { # create pool worktree #N if missing; echo its path
  local n="$1"; local wt="$WTDIR/$n"
  [ -e "$wt/.git" ] || git -C "$CANON" worktree add -q --detach "$wt" origin/main 2>/dev/null
  link_deps "$wt"
  echo "$wt"
}

# atomically claim a free slot (mkdir lock). reclaims a lease older than WT_POOL_STALE min (agent died).
claim_slot () {
  local tag="$1"; local deadline=$(( $(date +%s) + WAIT )); local stale="${WT_POOL_STALE:-120}"
  while :; do
    for i in $(seq 1 "$NPOOL"); do
      local lk="$LEASES/$i"
      if mkdir "$lk" 2>/dev/null; then echo "$tag $(date +%s)" > "$lk/holder"; echo "$i"; return 0; fi
      # reclaim stale lease
      if [ -n "$(find "$lk/holder" -mmin +$stale 2>/dev/null)" ]; then
        echo "$tag $(date +%s)" > "$lk/holder"; log "wt_pool: reclaimed stale slot $i"; echo "$i"; return 0
      fi
    done
    [ "$(date +%s)" -ge "$deadline" ] && { log "POOL_FULL: no free slot after ${WAIT}s"; return 3; }
    sleep 3
  done
}

reset_clean () { # bring a worktree back to a pristine origin/main
  local wt="$1"
  git -C "$wt" checkout -q --detach 2>/dev/null || true
  git -C "$wt" reset -q --hard origin/main 2>/dev/null || true
  git -C "$wt" clean -fdq -- raw-port/src raw-port/re 2>/dev/null || true
}

cmd_init () {
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local n="${1:-$NPOOL}"
  for i in $(seq 1 "$n"); do make_wt "$i" >/dev/null; log "  pool wt-$i ready"; done
  log "wt_pool: $n warm worktrees under $WTDIR"
}

cmd_acquire () { # <Class> — worker: cut branch port/<Class> at origin/main
  local cls="${1:?usage: wt_pool.sh acquire <Class>}"
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local slot; slot="$(claim_slot "port/$cls")" || return 3
  local wt; wt="$(make_wt "$slot")"
  log "wt_pool: leased slot $slot -> $wt (port/$cls)"
  reset_clean "$wt"
  git -C "$wt" checkout -q -B "port/$cls" origin/main 2>/dev/null
  link_deps "$wt"
  echo "$wt"
}

cmd_acquire_at () { # <SHA> — reviewer: detached checkout at a PR head for gating
  local sha="${1:?usage: wt_pool.sh acquire-at <SHA>}"
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  local slot; slot="$(claim_slot "gate/$sha")" || return 3
  local wt; wt="$(make_wt "$slot")"
  log "wt_pool: leased slot $slot -> $wt (gate/${sha:0:12})"
  reset_clean "$wt"
  # ensure the sha is present, then detached-checkout it
  git -C "$wt" fetch -q "$CANON" "$sha" 2>/dev/null || git -C "$CANON" fetch -q origin 2>/dev/null || true
  git -C "$wt" checkout -q --detach "$sha" 2>/dev/null || { log "acquire-at: sha $sha not found"; cmd_release "$wt" >/dev/null 2>&1; return 4; }
  link_deps "$wt"
  echo "$wt"
}

cmd_release () {
  local wt="${1:?usage: wt_pool.sh release <path>}"
  local slot; slot="$(basename "$wt")"
  reset_clean "$wt"
  rm -rf "$LEASES/$slot" 2>/dev/null
  log "released $wt"
}

cmd_gc () {
  for i in $(seq 1 "$NPOOL"); do
    local wt="$WTDIR/$i"; [ -e "$wt/.git" ] || continue
    [ -e "$LEASES/$i" ] && continue
    reset_clean "$wt"
  done
  log "wt_pool: idle worktrees refreshed to origin/main"
}

cmd_status () {
  git -C "$CANON" fetch -q origin main 2>/dev/null || true
  log "wt_pool: $NPOOL slots under $WTDIR (origin/main $(git -C "$CANON" rev-parse --short origin/main 2>/dev/null))"
  for i in $(seq 1 "$NPOOL"); do
    local wt="$WTDIR/$i"; local present="no"; [ -e "$wt/.git" ] && present="yes"
    if [ -e "$LEASES/$i/holder" ]; then
      log "  slot $i: LEASED  $(cat "$LEASES/$i/holder" 2>/dev/null)  (wt=$present)"
    else log "  slot $i: free  (wt=$present)"; fi
  done
}

case "${1:-}" in
  init)       shift; cmd_init "$@";;
  acquire)    shift; cmd_acquire "$@";;
  acquire-at) shift; cmd_acquire_at "$@";;
  release)    shift; cmd_release "$@";;
  gc)         cmd_gc;;
  status)     cmd_status;;
  *) echo "usage: wt_pool.sh {init [N]|acquire <Class>|acquire-at <SHA>|release <path>|gc|status}" >&2; exit 1;;
esac
