#!/bin/bash
# test_swarm_maint_ff.sh [path-to-swarm_maint.sh] — lock the canonical-tree hygiene block of
# swarm_maint.sh (sections 2 and 2b: reset-if-dirty, fast-forward-if-clean).
#
# WHY. That block decides whether every agent on this box runs current tools or 45-commit-old ones,
# and it failed CLOSED for a reason no one could see from the outside: `dirty` counted a TRACKED,
# machine-generated cache (raw-port/army/cache/stubscan_cites.v1.json, rewritten every few minutes
# by stubscan.py) as local work. So the fast-forward never ran — and the reset --hard that would
# have cleaned the file is gated on no gate/submit process being live, which on a busy swarm is
# never true. Two guards, each individually reasonable, deadlocked the tree into permanently stale.
# The cost was not theoretical: agents ran a rework_claim without its "already reworked" skip and
# drove four PRs to the attempt cap for nothing.
#
# HOW. The tool is one long maintenance tick (ledger guard, warm pool, seed, reconcile) and cannot
# run against a scratch repo, so this test EXTRACTS sections (2) and (2b) from the shipped file by
# their comment markers and runs that text in throwaway git repos. It is the shipped logic, not a
# paraphrase — if the markers ever stop matching, the test fails rather than passing vacuously.
#
# Point it at another copy to watch it fail:
#   bash test_swarm_maint_ff.sh /path/to/an/older/swarm_maint.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOL="${1:-$HERE/swarm_maint.sh}"
[ -r "$TOOL" ] || { echo "no such script: $TOOL" >&2; exit 2; }

SB="$(mktemp -d "${TMPDIR:-/tmp}/swarm_maint_ff.XXXXXX")"
trap 'rm -rf "$SB"' EXIT

# --- extract the block under test -------------------------------------------------------------
SECTION="$SB/section.sh"
awk '/^# \(2\) CLEAN TREE/{f=1} /^# \(3\) SEED/{f=0} f' "$TOOL" > "$SECTION"
grep -q 'merge --ff-only' "$SECTION" || {
  echo "test_swarm_maint_ff: could not extract sections 2/2b from $TOOL (markers changed?)" >&2; exit 2; }

CACHE=raw-port/army/cache/stubscan_cites.v1.json
pass=0; fail=0

new_repo () { # <name> <commits-behind> -> echoes the clone path
  local name="$1" behind="$2" i
  local up="$SB/$name.git" wt="$SB/$name"
  git init -q --bare "$up"
  git clone -q "$up" "$wt" 2>/dev/null
  (cd "$wt"
   git config user.email t@t; git config user.name t
   mkdir -p "$(dirname "$CACHE")" raw-port/src
   echo '{"cache":0}' > "$CACHE"; echo 'export const a = 1;' > raw-port/src/a.ts
   git add -A >/dev/null; git commit -qm base; git branch -M main; git push -q origin main
   for i in $(seq 1 "$behind"); do
     echo "line $i" >> raw-port/src/a.ts; git commit -qam "c$i"
   done
   if [ "$behind" -gt 0 ]; then
     git push -q origin main
     git reset -q --hard "HEAD~$behind"          # the clone is now N behind its own origin/main
   fi
   git fetch -q origin main) >/dev/null 2>&1
  echo "$wt"
}

# GATEBUSY IS CONTROLLED WITH A STUB `pgrep`, not with real processes. Two reasons, both learned
# the hard way here: `sh -c '<one command>'` EXECS the command, so a decoy sleeper loses the argv
# the tool greps for and the case silently tests nothing; and the REAL box is a busy swarm, so a
# genuine pr_gate is usually running and every "no gate live" case would flip with the weather.
# The stub also asserts the tool is still ASKING the question — if the pgrep pattern stops
# mentioning pr_gate.sh, the stub says so instead of quietly answering a different question.
mkdir -p "$SB/bin"
cat > "$SB/bin/pgrep" <<'STUB'
#!/bin/bash
case "$*" in *pr_gate.sh*) ;; *) echo "test stub: pgrep called without the pr_gate.sh pattern: $*" >&2; exit 3;; esac
[ "${FAKE_GATEBUSY:-0}" = "1" ] && { echo 4242; exit 0; }
exit 1
STUB
chmod +x "$SB/bin/pgrep"

run_block () { # <repo> [gatebusy 0|1] -> the block's stdout
  (cd "$1" && PATH="$SB/bin:$PATH" FAKE_GATEBUSY="${2:-0}" bash "$SECTION" 2>&1)
}

check () { # <label> <repo> <expect-behind-after> <expect-substring-or-EMPTY> [gatebusy]
  local label="$1" repo="$2" want_behind="$3" want_out="$4" busy="${5:-0}"
  local out behind why=""
  out=$(run_block "$repo" "$busy")
  behind=$(cd "$repo" && git rev-list --count HEAD..origin/main 2>/dev/null)
  [ "$behind" = "$want_behind" ] || why="behind=$behind (want $want_behind)"
  if [ "$want_out" = "EMPTY" ]; then
    [ -z "$out" ] || why="$why; printed '$out'"
  else
    case "$out" in *"$want_out"*) ;; *) why="$why; output '$out' lacks '$want_out'";; esac
  fi
  if [ -z "$why" ]; then pass=$((pass+1)); printf '  ok   %s\n' "$label"
  else fail=$((fail+1)); printf '  FAIL %s -- %s\n' "$label" "$why"; fi
}

echo "test_swarm_maint_ff: $TOOL"

# A — the plain case: nothing local, behind. Must fast-forward.
A=$(new_repo clean 3)
check "clean tree, 3 behind -> fast-forwards" "$A" 0 "fast-forwarded"

# A2 — the condition this change removes: a CLEAN tree, behind, with a gate process live. On a busy
# swarm a gate is essentially always running, so this is the ordinary state of the box and the FF
# must fire anyway. pr_gate/pr_submit/pr_land never check out into the canonical tree — they lease a
# pool worktree — so a --ff-only of a clean tree cannot disturb them.
A2=$(new_repo cleanbusy 3)
check "clean tree + gate live -> fast-forwards" "$A2" 0 "fast-forwarded" 1

# B — THE BUG: the tracked machine-generated cache is modified, and a gate process is live (the
# normal state of this box). Must STILL fast-forward.
B=$(new_repo cachedirty 3)
echo '{"cache":1}' > "$B/$CACHE"
check "cache dirty + gate live -> fast-forwards" "$B" 0 "fast-forwarded" 1

# C — the cache is modified locally AND an incoming commit carries a new copy, so --ff-only refuses.
# Must recover by discarding the regenerable cache, not by giving up (giving up re-deadlocks: the
# reset path cannot clean it while a gate is live).
C=$(new_repo cachecollide 0)
(cd "$C" && echo '{"cache":9}' > "$CACHE" && git commit -qam "upstream rewrites the cache" && git push -q origin main && git reset -q --hard HEAD~1 && git fetch -q origin main) >/dev/null 2>&1
echo '{"cache":5}' > "$C/$CACHE"
check "cache collides with an incoming commit" "$C" 0 "fast-forwarded" 1

# D — REAL local work + a live gate: neither path may fire, and the work must survive.
D=$(new_repo realwork 3)
echo 'export const mine = 2;' > "$D/raw-port/src/inprogress.ts"
check "real work + gate live -> no FF, no reset" "$D" 3 "EMPTY" 1
if [ -f "$D/raw-port/src/inprogress.ts" ]; then
  pass=$((pass+1)); printf '  ok   %s\n' "in-progress file survived"
else
  fail=$((fail+1)); printf '  FAIL %s\n' "in-progress file was DESTROYED"
fi

# E — real local work, no gate live: the reset --hard path still fires (unchanged behaviour).
E=$(new_repo resetpath 3)
echo 'LOCALLY MANGLED' > "$E/raw-port/src/a.ts"          # a modified TRACKED file
mkdir -p "$E/raw-port/re/disasm"; echo x > "$E/raw-port/re/disasm/scratch.s"
echo 'export const mine = 4;' > "$E/raw-port/src/inprogress.ts"   # untracked work
run_block "$E" 0 >/dev/null
if grep -q MANGLED "$E/raw-port/src/a.ts" 2>/dev/null; then
  fail=$((fail+1)); printf '  FAIL %s\n' "reset path did not restore a modified tracked file"
else
  pass=$((pass+1)); printf '  ok   %s\n' "reset path still resets a dirty tree"
fi
if [ -f "$E/raw-port/src/inprogress.ts" ]; then
  pass=$((pass+1)); printf '  ok   %s\n' "reset path leaves untracked in-progress work alone"
else
  fail=$((fail+1)); printf '  FAIL %s\n' "reset path DELETED untracked in-progress work"
fi

echo "test_swarm_maint_ff: $pass passed, $fail failed"
[ "$fail" = 0 ] || exit 1
