#!/bin/bash
# test_reap_dead_counters.sh — LOCKED test for the self-heal that clears attempt counters whose PR
# has already merged or closed.
#
# THE BUG (2026-08-11). An attempt counter is the authority to STOP OFFERING a PR, so a counter that
# outlives its PR is dead state that reads exactly like stranded work. `reap_dead_counters` exists to
# clear it — and it only ever looked at counters ALREADY AT THE CAP, to bound the number of API
# calls. But `swarm_doctor`'s dead-counters check flags ANY counter whose PR merged or closed, so the
# tool that REPORTS the fault and the tool that FIXES it disagreed by construction:
#
#   FAIL dead-counters  1 attempt counter(s) for PRs that are already merged/closed —
#                       clear them (`rm ...`) ... : rebase/554
#
# #554 sat at 1/3 and had merged. The doctor asked a human to `rm` it on every run, forever, while
# the reaper was coded to skip it. Every dead counter cleared by hand that day was under the cap.
#
# The cap filter is gone and all counters go in ONE aliased GraphQL query (measured: 6 counters,
# 0.575s, one round trip), so the bound it provided is not needed — case 6 pins the batching, since
# a per-counter loop would quietly reintroduce the cost the filter was there to avoid.
#
# Offline: the function is extracted and run against a stub `gh` on PATH, so no call leaves the box.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
R="$(mktemp -d)"; trap 'rm -rf "$R"' EXIT
fails=0
mkdir -p "$R/bin"

cat > "$R/bin/gh" <<'STUB'
#!/bin/bash
echo "$*" >> "$GH_CALLS"
[ -f "$GH_ANSWER" ] && cat "$GH_ANSWER"
STUB
chmod +x "$R/bin/gh"
export PATH="$R/bin:$PATH" GH_CALLS="$R/calls" GH_ANSWER="$R/answer"

# Extract the function from the shipped file — never a copy of it. A test that pins its own
# transcription of the code passes while the tool is broken.
extract () { awk '/^reap_dead_counters \(\) \{/,/^\}/' "$1"; }

run_reap () { # run_reap <script> <answer-lines> <counters...>  -> leftover counter names
  local script="$1" answer="$2"; shift 2
  rm -rf "$R/att" "$R/calls"; mkdir -p "$R/att"
  local spec n v
  for spec in "$@"; do n="${spec%%=*}"; v="${spec##*=}"; echo "$v" > "$R/att/$n"; echo "sha-$n" > "$R/att/$n.sha"; done
  printf '%s' "$answer" > "$GH_ANSWER"
  ATT="$R/att" SLUG="vjeux/fcp-headless-transitions" CAP=3 \
    bash -c "$(extract "$script"); reap_dead_counters" 2>/dev/null
  ls -1 "$R/att" 2>/dev/null | tr '\n' ' '
}

check () { # check <label> <got> <want>
  if [ "$(echo "$2" | xargs)" = "$(echo "$3" | xargs)" ]; then echo "  OK    $1"
  else echo "  FAIL  $1"; echo "        got [$(echo "$2" | xargs)] want [$(echo "$3" | xargs)]"; fails=$((fails+1)); fi
}

for SCRIPT in "$HERE/rework_claim.sh" "$HERE/rebase_claim.sh"; do
  NAME="$(basename "$SCRIPT")"
  echo "── $NAME"

  # 1. THE BUG: a counter BELOW the cap whose PR has merged is still garbage.
  check "$NAME: a below-cap counter for a MERGED PR is reaped" \
        "$(run_reap "$SCRIPT" 'p554 MERGED
p642 OPEN' 554=1 642=1)" "642 642.sha"

  # 2. ...and the at-cap case the old filter did handle must keep working.
  check "$NAME: an at-cap counter for a MERGED PR is still reaped" \
        "$(run_reap "$SCRIPT" 'p387 MERGED' 387=3)" ""

  # 3. A live PR's counter is the whole point of the cap — never touch it.
  check "$NAME: a counter for an OPEN PR is kept" \
        "$(run_reap "$SCRIPT" 'p642 OPEN' 642=3)" "642 642.sha"

  # 4. CLOSED counts as dead too, and the .sha companion goes with it (a counter whose .sha survives
  #    is re-keyed against a head that no longer exists).
  check "$NAME: a CLOSED PR's counter and its .sha both go" \
        "$(run_reap "$SCRIPT" 'p100 CLOSED' 100=2)" ""

  # 5. SILENCE IS NOT A VERDICT. Reaping on an unanswered query would clear a LIVE counter and
  #    re-offer work the cap is deliberately holding back — the exact failure the cap prevents.
  check "$NAME: an unanswered query reaps nothing" \
        "$(run_reap "$SCRIPT" '' 554=1 642=3)" "554 554.sha 642 642.sha"

  # 6. ONE call for all of them. The cap filter existed to bound per-counter API calls; removing it
  #    is only safe because the query is batched, so the batching is part of the fix, not a detail.
  run_reap "$SCRIPT" 'p1 OPEN
p2 OPEN
p3 OPEN
p4 OPEN' 1=1 2=1 3=1 4=1 >/dev/null
  n_calls=$(wc -l < "$R/calls" | tr -d ' ')
  if [ "$n_calls" = 1 ]; then echo "  OK    $NAME: 4 counters cost exactly 1 API call"
  else echo "  FAIL  $NAME: 4 counters cost $n_calls API calls — the batching is gone"; fails=$((fails+1)); fi

  # 7. MUTATION: put the cap filter back and case 1 must go red. Without this the whole file passes
  #    against the code it exists to forbid.
  MUT="$R/$NAME.mutated"
  awk '{ print; if ($0 ~ /nums="\$nums \$b"/) print "    [ \"$(cat \"$f\" 2>/dev/null || echo 0)\" -ge \"$CAP\" ] || { nums=\"${nums% *}\"; continue; }" }' \
      "$SCRIPT" > "$MUT"
  left="$(run_reap "$MUT" 'p554 MERGED
p642 OPEN' 554=1 642=1)"
  case "$(echo "$left" | xargs)" in
    "642 642.sha") echo "  FAIL  $NAME: the mutant reaped the below-cap counter anyway — case 1 pins nothing"
                   fails=$((fails+1));;
    *)             echo "  OK    $NAME: mutation — restoring the cap filter strands #554 again";;
  esac
done

echo
if [ "$fails" = 0 ]; then echo "test_reap_dead_counters: PASS"; else echo "test_reap_dead_counters: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
