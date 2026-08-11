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
# SLOT_STALE_MIN (default 90) minutes (a dead agent).
#
#   slot_lock.sh acquire <role> <n>   -> mkdir lock; exit 0 = acquired (you own the tick),
#                                        exit 1 = BUSY (another run of this slot is live; you must exit)
#   slot_lock.sh release <role> <n>   -> free it (always run at end of tick, even on error)
#   slot_lock.sh heartbeat <role> <n> -> refresh the lock's mtime (run after every verdict/unit,
#                                        so the stale-reclaim measures IDLENESS, not tick age)
#   slot_lock.sh status               -> list held slot locks
set -uo pipefail
POOL="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LKDIR="$POOL/slots"; mkdir -p "$LKDIR"
STALE="${SLOT_STALE_MIN:-90}"
role="${2:-}"; n="${3:-}"
case "${1:-}" in
  acquire)
    [ -z "$role" ] || [ -z "$n" ] && { echo "usage: slot_lock.sh acquire <role> <n>" >&2; exit 2; }
    lk="$LKDIR/${role}-${n}"
    if mkdir "$lk" 2>/dev/null; then
      echo "$(date +%s) pid-$$ $(hostname -s 2>/dev/null)" > "$lk/held"
      echo "ACQUIRED ${role}-${n}"; exit 0
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
      echo "  $s  held $(cat "$LKDIR/$s/held" 2>/dev/null)"; done
    [ -z "$(ls -A "$LKDIR" 2>/dev/null)" ] && echo "  (no slot locks held)"
    ;;
  *) echo "usage: slot_lock.sh {acquire <role> <n>|release <role> <n>|status}" >&2; exit 2;;
esac
