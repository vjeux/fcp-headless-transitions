#!/bin/bash
# slot_lock.sh — per-slot overlap guard for the queue-driven swarm (Model B).
#
# WHY: each swarm-worker-N / swarm-reviewer-N is a PROMPT cron that revives the SAME session
# every tick. If a tick's real work outlasts the cron interval, the next tick could start a
# second concurrent run of the SAME slot. This lock makes each slot single-flight: a tick that
# finds its slot already busy exits immediately (the busy run keeps going). It ALSO caps global
# concurrency structurally — there are exactly N worker + M reviewer locks, so no more than N+M
# slots can ever be doing work at once, independent of the warm pool.
#
# This is NOT the worktree lease (wt_pool leases). It's a coarser "is slot K of role R already
# mid-tick" guard, held for the whole tick. Atomic mkdir; auto-reclaims a lock older than
# SLOT_STALE_MIN (default 45) minutes (a dead agent).
#
#   slot_lock.sh acquire <role> <n>   -> mkdir lock; exit 0 = acquired (you own the tick),
#                                        exit 1 = BUSY (another run of this slot is live; you must exit)
#   slot_lock.sh release <role> <n>   -> free it (always run at end of tick, even on error)
#   slot_lock.sh heartbeat <role> <n> -> refresh the lock's mtime (run after every verdict/unit,
#                                        so the stale-reclaim measures IDLENESS, not tick age)
#   slot_lock.sh status               -> list held slot locks
#
# `acquire` also prints the `export FCT_AGENT_ID=<role>-<N>` line every slot should run: that
# variable is what lets pr_submit's authored-marker and review_claim's self-review skip agree on
# who you are. Unset, the skip is inert and both tools say so out loud rather than pretending.
set -uo pipefail
POOL="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LKDIR="$POOL/slots"; mkdir -p "$LKDIR"
# 90 minutes was a guess made before there was any data. Measured across a full 16-slot swarm:
# every LIVE slot had beaten within 6 minutes (median ~100s, max 343s), while the one slot whose
# agent had exited sat at 44 minutes. The two populations do not overlap anywhere near 45, and at 90
# a dead agent held its slot for an hour and a half — the swarm shrank while the roster still read
# full, which is precisely how "we keep losing agents" stayed invisible.
STALE="${SLOT_STALE_MIN:-45}"
role="${2:-}"; n="${3:-}"
case "${1:-}" in
  acquire)
    [ -z "$role" ] || [ -z "$n" ] && { echo "usage: slot_lock.sh acquire <role> <n>" >&2; exit 2; }
    lk="$LKDIR/${role}-${n}"
    if mkdir "$lk" 2>/dev/null; then
      # NOT A PID. This used to record `pid-$$`, which is the pid of THIS `slot_lock.sh` shell —
      # a process that exits milliseconds later. An agent here is a model session, not a local
      # process; nothing on this box outlives a single `bash -c`. Measured: all 16 slots recorded a
      # DEAD pid, including one that had beaten 2 seconds earlier. So the field was not merely
      # useless, it was an invitation — any reader who "fixed" the missing liveness check by testing
      # that pid would have freed every slot in the swarm at once, mid-unit. The honest fields are
      # who holds it and when it last beat; liveness comes from the mtime and nowhere else.
      echo "$(date +%s) agent-${role}-${n} $(hostname -s 2>/dev/null)" > "$lk/held"
      echo "${role}-${n}" > "$lk/agent_id"
      echo "ACQUIRED ${role}-${n}"
      # TELL THE AGENT ITS ID, HERE, because this is the one command every slot runs first and
      # because the id cannot be discovered any other way. `pr_submit.sh` stamps
      # $STATE/authored/<PR> with FCT_AGENT_ID and `review_claim.sh` skips a PR whose stamp matches
      # its own — a mechanism that is switched OFF unless both halves see the same value, and
      # nothing in the OS links two short-lived `bash -c` invocations of the same agent. So the id
      # travels in the environment, and the instruction is printed at the moment it is needed
      # rather than left in a brief:
      echo "  export FCT_AGENT_ID=${role}-${n}   # so pr_submit/review_claim can tell your own PRs apart"
      exit 0
    fi
    # reclaim a stale lock (holder died mid-tick)
    if [ -n "$(find "$lk/held" -mmin +$STALE 2>/dev/null)" ]; then
      echo "$(date +%s) reclaimed" > "$lk/held"; echo "ACQUIRED ${role}-${n} (reclaimed stale)"; exit 0
    fi
    echo "BUSY ${role}-${n} (held $(cat "$lk/held" 2>/dev/null))"; exit 1
    ;;
  heartbeat|touch)
    # HEARTBEAT — run this after every verdict / every unit.
    # The stale-reclaim below measures the AGE OF THE `held` FILE, and that file was written once at
    # acquire. So it measured TICK AGE, not idleness: a healthy reviewer 91 minutes into a long
    # oracle differential was indistinguishable from a corpse, and equally, a lock whose holder died
    # 5 minutes in stayed BUSY for the full 90. Touching it turns the mtime into a real liveness
    # signal, which is what SLOT_STALE_MIN was always assumed to be reading.
    [ -z "$role" ] || [ -z "$n" ] && { echo "usage: slot_lock.sh heartbeat <role> <n>" >&2; exit 2; }
    lk="$LKDIR/${role}-${n}"
    [ -d "$lk" ] || { echo "NOLOCK ${role}-${n}"; exit 1; }
    touch "$lk/held" 2>/dev/null; echo "BEAT ${role}-${n}"; exit 0
    ;;
  release)
    [ -z "$role" ] || [ -z "$n" ] && { echo "usage: slot_lock.sh release <role> <n>" >&2; exit 2; }
    rm -rf "$LKDIR/${role}-${n}" 2>/dev/null; echo "RELEASED ${role}-${n}"; exit 0
    ;;
  status)
    ls -1 "$LKDIR" 2>/dev/null | while read -r s; do
      _h="$LKDIR/$s/held"; _b="$(cat "$_h" 2>/dev/null)"
      _age=$(( ( $(date +%s) - $(stat -f %m "$_h" 2>/dev/null || stat -c %Y "$_h" 2>/dev/null || date +%s) ) / 60 ))
      # The beat age is the only liveness signal there is, so print it rather than making every
      # reader compute it from an epoch.
      echo "  $s  held $_b  (last beat ${_age}m ago${_age:+$([ "$_age" -ge "$STALE" ] && echo " — RECLAIMABLE")})"; done
    [ -z "$(ls -A "$LKDIR" 2>/dev/null)" ] && echo "  (no slot locks held)"
    ;;
  *) echo "usage: slot_lock.sh {acquire <role> <n>|release <role> <n>|status}" >&2; exit 2;;
esac
