#!/bin/bash
# test_slot_liveness.sh — LOCKED test for "is anybody still holding this slot".
#
# THE INCIDENT (2026-08-11). The swarm kept shrinking while the roster read full. `swarm_doctor`
# printed `16 slot(s) beating` about a fleet that contained a corpse: worker-5's agent had filed an
# exit report 44 minutes earlier and its lock was still held, so nothing refilled the slot. The check
# only complained past 90 minutes — which is also when the lock reclaims itself, so it could only
# ever report a problem at the moment the problem was already resolving.
#
# THE TRAP THIS ALSO PINS. The lock's second field used to be `pid-$$`: the pid of the
# `slot_lock.sh` shell, which exits milliseconds later. An agent here is a model session; nothing on
# this box outlives a single `bash -c`. Measured across all 16 slots, every recorded pid was dead —
# including a slot that had beaten 2 seconds earlier. Anyone "completing" the liveness check by
# testing that pid would have freed the entire swarm mid-unit. Case 5 and case 6 make that
# unrepeatable, because the code no longer records something that looks answerable.
#
# Offline: a fixture $FCT_STATE_DIR and `swarm_doctor.py --only heartbeats`, which touches nothing
# but the filesystem.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
DOC="${1:-$HERE/swarm_doctor.py}"
LOCK="${2:-$HERE/slot_lock.sh}"
R="$(mktemp -d)"; trap 'rm -rf "$R"' EXIT
fails=0

mkslot () { # mkslot <name> <age-minutes>
  mkdir -p "$R/state/slots/$1"
  echo "$(date +%s) agent-$1 vjeux-mac" > "$R/state/slots/$1/held"
  [ "$2" -gt 0 ] && touch -t "$(date -v-"$2"M +%Y%m%d%H%M 2>/dev/null || date -d "$2 minutes ago" +%Y%m%d%H%M)" \
      "$R/state/slots/$1/held"
  return 0
}
doctor () { FCT_STATE_DIR="$R/state" python3 "${1:-$DOC}" --only heartbeats 2>&1; }
say () { if [ "$1" = ok ]; then echo "  OK    $2"; else echo "  FAIL  $2"; [ -n "${3:-}" ] && echo "        $3"; fails=$((fails+1)); fi; }

# 1. THE INCIDENT: a slot that has not beaten in half an hour is a corpse, and must be named as one
#    long before the lock would free itself.
rm -rf "$R/state"; mkslot worker-5 30; mkslot worker-1 2
out="$(doctor)"
case "$out" in *"FAIL heartbeats"*worker-5*) say ok "a 30m-silent slot is reported as dead";;
  *) say bad "a 30m-silent slot is reported as dead" "$out";; esac
case "$out" in *worker-1*) say bad "...and a live slot is not accused" "$out";; *) say ok "...and a live slot is not accused";; esac

# 2. The report has to tell the operator what to do about it; "FAIL" alone is a puzzle, and the
#    remedy (clear the lock, respawn the slot) is not guessable from the check's name.
case "$out" in *"respawn"*) say ok "...and it names the remedy";; *) say bad "...and it names the remedy" "$out";; esac

# 3. A healthy fleet must stay quiet, or the check gets ignored exactly when it matters.
rm -rf "$R/state"; for i in 1 2 3; do mkslot "worker-$i" $i; done
out="$(doctor)"
case "$out" in *"FAIL heartbeats"*) say bad "a fleet beating within minutes is OK" "$out";; *) say ok "a fleet beating within minutes is OK";; esac
case "$out" in *"oldest beat"*) say ok "...and the oldest beat is always reported, pass or fail";;
  *) say bad "...and the oldest beat is always reported, pass or fail" "$out";; esac

# 4. THE ORIGINAL BUG AS AN INVARIANT: the doctor must complain BEFORE the lock self-reclaims.
#    Equal thresholds mean the check can only ever fire on a problem that is already resolving,
#    which is what "16 slot(s) beating" over a corpse actually was.
dead_min=$(grep -o 'SLOT_DEAD_MIN", "[0-9]*"' "$DOC" | grep -o '[0-9]*' | head -1)
stale_min=$(grep -o 'SLOT_STALE_MIN:-[0-9]*' "$LOCK" | grep -o '[0-9]*' | head -1)
if [ -n "$dead_min" ] && [ -n "$stale_min" ] && [ "$dead_min" -lt "$stale_min" ]; then
  say ok "the doctor's dead threshold (${dead_min}m) fires before the lock reclaims (${stale_min}m)"
else
  say bad "the doctor's dead threshold (${dead_min:-?}m) must be BELOW the reclaim window (${stale_min:-?}m)"
fi

# 5. The lock must not record a pid — see the header. A fresh acquire, read back.
rm -rf "$R/state"; mkdir -p "$R/state"
FCT_STATE_DIR="$R/state" bash "$LOCK" acquire worker 7 >/dev/null 2>&1
body="$(cat "$R/state/slots/worker-7/held" 2>/dev/null)"
case "$body" in *pid-*) say bad "the lock records no pid" "recorded: $body";;
  *) say ok "the lock records no pid (it records who holds it: $body)";; esac

# 6. ...and nothing in the tool tests one. Code only, comments stripped — the header of this very
#    file discusses pids at length, and so does the tool's.
code="$(grep -v '^[[:space:]]*#' "$LOCK")"
if printf '%s' "$code" | grep -qE 'ps -p|kill -0'; then
  say bad "slot_lock tests a pid for liveness" "every recorded pid is a dead shell — this frees live slots"
else
  say ok "no pid-liveness test in slot_lock (that check would free the whole swarm)"
fi

# 7. TEETH ON THE LOCK ITSELF: fresh = BUSY, past the window = reclaimed. Without this, case 4 is
#    just arithmetic about two numbers nobody uses.
out="$(FCT_STATE_DIR="$R/state" bash "$LOCK" acquire worker 7 2>&1)"
case "$out" in *BUSY*) say ok "a fresh lock is BUSY for a second run of the same slot";;
  *) say bad "a fresh lock is BUSY for a second run of the same slot" "$out";; esac
touch -t "$(date -v-60M +%Y%m%d%H%M 2>/dev/null || date -d '60 minutes ago' +%Y%m%d%H%M)" "$R/state/slots/worker-7/held"
out="$(FCT_STATE_DIR="$R/state" bash "$LOCK" acquire worker 7 2>&1)"
case "$out" in *"reclaimed stale"*) say ok "a lock past the reclaim window is taken over";;
  *) say bad "a lock past the reclaim window is taken over" "$out";; esac

# 8. MUTATION. Put the old 90-minute threshold back and case 1 must go red — otherwise every
#    assertion above is about a fixture, not about the check.
MUT="$R/swarm_doctor_mutated.py"
sed 's/SLOT_DEAD_MIN", "20"/SLOT_DEAD_MIN", "90"/' "$DOC" > "$MUT"
rm -rf "$R/state"; mkslot worker-5 30; mkslot worker-1 2
out="$(doctor "$MUT")"
# The summary line says "0 FAIL, 0 UNKNOWN" on a clean run, so matching bare FAIL matches a PASS.
# The first version of this file did exactly that and case 3 failed against a healthy fleet.
case "$out" in
  *"FAIL heartbeats"*) say bad "mutation: with the 90m threshold restored the corpse was still reported" "$out";;
  *)      say ok "mutation: at 90m the corpse goes unreported again (case 1 has teeth)";;
esac

echo
if [ "$fails" = 0 ]; then echo "test_slot_liveness: PASS"; else echo "test_slot_liveness: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
