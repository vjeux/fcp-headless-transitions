#!/bin/bash
# test_cross_queue_lease.sh — a PR must not be handed to two workers at once.
#
# THE INCIDENT (2026-08-11, worker 8): `rebase_claim` leased PR #656 at 13:32:36 and a peer was 43
# files into merging main in ~/.fct-pool/wt/3 when `rework_claim` handed the same PR to another
# worker 66 seconds later. Both queues select it legitimately — CHANGES_REQUESTED puts it in the
# rework queue, CONFLICTING puts it in the rebase queue — and neither consulted the other's lease
# directory. #643 made that combination common by teaching `rebase_claim` to see DIRTY branches.
#
# The cases run the REAL `lease_free` from each tool, extracted verbatim from the script (the
# discipline test_guards.py's A/B cases established: an inline copy of what the tool is believed to
# do cannot fail when the tool changes). Everything is $HOME-scoped through FCT_STATE_DIR, so the
# live swarm's 24 slots and its real leases are never touched, and no network call is made.
#
#   A  a FRESH peer lease blocks the claim                      (the collision that happened)
#   B  a STALE peer lease does NOT block                        (a dead peer cannot strand a PR)
#   C  no peer lease: unchanged — the claim is granted          (the guard is not a blanket refusal)
#   D  our OWN queue's fresh lease still blocks                 (the original guard survives)
#
# Every case is mutation-checked: the guard is stripped from a scratch copy and the case must go
# red, because a guard nobody has watched fail is not evidence.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
fails=()
TD="$(mktemp -d "${TMPDIR:-/tmp}/xqueue.XXXXXX")"
trap 'rm -rf "$TD"' EXIT

# Extract the tool's own lease_free and run it against a fake state dir.
# $1 tool, $2 our lease dir name, $3 state dir, $4 PR, $5 "mutate" to strip the guard
run_lease_free () {
  local tool="$1" ours="$2" state="$3" pr="$4" mutate="${5:-}"
  local src fn
  src="$HERE/$tool"
  fn="$(awk '/^lease_free \(\) \{/,/^\}/' "$src")"
  [ -z "$fn" ] && { echo "EXTRACT_FAILED"; return 9; }
  if [ "$mutate" = "mutate" ]; then
    # remove the cross-queue block: the `local peer=` line through its closing `fi`
    fn="$(printf '%s\n' "$fn" | awk '
      /^  local peer=/ {skip=1}
      skip && /^  fi$/  {skip=0; next}
      !skip {print}')"
  fi
  bash -c "
    set -uo pipefail
    STATE='$state'; LEAS=\"\$STATE/$ours\"; LEASE_MIN=90
    mkdir -p \"\$LEAS\"
    $fn
    if lease_free '$pr' 2>/dev/null; then echo GRANTED; else echo REFUSED; fi"
}

mk_lease () { # <state> <dir> <PR> <age-minutes>
  mkdir -p "$1/$2/$3"
  echo "$(date +%s)" > "$1/$2/$3/held"
  [ "${4:-0}" -gt 0 ] && touch -t "$(date -v-"$4"M +%Y%m%d%H%M 2>/dev/null || date -d "-$4 minutes" +%Y%m%d%H%M)" "$1/$2/$3/held"
  return 0
}

expect () { # <case> <want> <got> <why>
  if [ "$2" = "$3" ]; then
    echo "  ok   $1: $4 ($3)"
  else
    echo "  FAIL $1: $4 — wanted $2, got $3"
    fails+=("$1")
  fi
}

# ── A: a fresh peer lease blocks, in BOTH directions ────────────────────────────────────────────
s="$TD/a1"; mk_lease "$s" rebase_leases 700 0
expect "A rework<-rebase" REFUSED "$(run_lease_free rework_claim.sh rework_leases "$s" 700)" \
       "rework_claim must not take a PR the rebase queue is holding"
s="$TD/a2"; mk_lease "$s" rework_leases 701 0
expect "A rebase<-rework" REFUSED "$(run_lease_free rebase_claim.sh rebase_leases "$s" 701)" \
       "rebase_claim must not take a PR the rework queue is holding"

# ── B: a STALE peer lease must not strand the PR ────────────────────────────────────────────────
s="$TD/b"; mk_lease "$s" rebase_leases 702 200
expect "B stale peer" GRANTED "$(run_lease_free rework_claim.sh rework_leases "$s" 702)" \
       "a peer lease older than the staleness window is a corpse, not a holder"

# ── C: no peer lease at all — unchanged behaviour ───────────────────────────────────────────────
s="$TD/c"; mkdir -p "$s"
expect "C no peer" GRANTED "$(run_lease_free rework_claim.sh rework_leases "$s" 703)" \
       "the guard is not a blanket refusal"

# ── D: our own queue's fresh lease still blocks (the pre-existing guard) ────────────────────────
s="$TD/d"; mk_lease "$s" rework_leases 704 0
expect "D own lease" REFUSED "$(run_lease_free rework_claim.sh rework_leases "$s" 704)" \
       "the original single-queue guard survives the change"

# ── MUTATIONS: strip the cross-queue block and A must go red (B/C/D must not) ───────────────────
s="$TD/m1"; mk_lease "$s" rebase_leases 705 0
got="$(run_lease_free rework_claim.sh rework_leases "$s" 705 mutate)"
expect "A mutation (rework)" GRANTED "$got" \
       "without the guard the collision happens again, so case A can fail"
s="$TD/m2"; mk_lease "$s" rework_leases 706 0
got="$(run_lease_free rebase_claim.sh rebase_leases "$s" 706 mutate)"
expect "A mutation (rebase)" GRANTED "$got" \
       "without the guard the collision happens again, so case A can fail"
s="$TD/m3"; mk_lease "$s" rework_leases 707 0
got="$(run_lease_free rework_claim.sh rework_leases "$s" 707 mutate)"
expect "D unaffected by the mutation" REFUSED "$got" \
       "stripping the cross-queue block must not disturb the own-lease guard"

if [ ${#fails[@]} -eq 0 ]; then
  echo "TEST_CROSS_QUEUE_LEASE: PASS"
else
  echo "TEST_CROSS_QUEUE_LEASE: FAIL — ${fails[*]}"
  exit 1
fi
