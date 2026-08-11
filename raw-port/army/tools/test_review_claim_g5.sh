#!/bin/bash
# test_review_claim_g5.sh — LOCKED test for the queue that owns a G5-FLAGGED PR.
#
# THE BUG (2026-08-11, PR #645). G5 flags are NO-DISASM blind spots the gate cannot clear by itself.
# It posts FAILURE saying, in these words, `16 G5 flag(s): reviewer must re-derive disasm, then rerun
# --reviewed`, and REVIEWER_BRIEF tells reviewers to do exactly that. Yet:
#   * review_claim excluded EVERY gate FAILURE (a failure is normally the author's to fix),
#   * rebase_claim takes only failures whose reason is regression/rebase,
#   * rework_claim takes only CHANGES_REQUESTED.
# So a PR the gate had explicitly handed BACK TO A REVIEWER was claimable by nothing. swarm_doctor's
# queue-coverage check found it 15 minutes in: `1 open PR(s) NO queue can claim ... #645 (review=none
# gate=FAILURE merge=BEHIND)`. Normally the reviewer who ran the gate carries straight on to the
# re-derivation, which is why this went unnoticed for so long — it only strands when that slot dies,
# and slots die.
#
# THE DISCRIMINATION THAT MATTERS. Not every failure mentioning G5 is reviewer work. Live sample of
# the six failing PRs at the time, all correctly classified by the matcher pinned here:
#   #645  `16 G5 flag(s): reviewer must re-derive disasm, ...`     -> REVIEWER (this fix)
#   #644  `JUDGED: G5 SKELETON — operator== @0x2a34e is ...`       -> author: a hard reject
#   #642  `JUDGED: dropped mangled once-flag citation ...`         -> author
#   #629 #600 #571  `JUDGED: regression (rebase needed) ...`       -> rebase queue
# Case 3 uses #644's real text, because "G5 SKELETON" contains "G5" and a lazier matcher routes a
# hard reject to a reviewer as if it were a blind spot.
#
# Offline: `gh` is stubbed on PATH and FCT_STATE_DIR points at a tempdir, so no lease and no call
# ever reaches GitHub. The descriptions in the fixtures are the real ones, copied from the statuses
# API that day.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
RC="${1:-$HERE/review_claim.sh}"
R="$(mktemp -d)"
trap 'rm -rf "$R"' EXIT
fails=0
mkdir -p "$R/bin"

# --- the stub -----------------------------------------------------------------------------------
# review_claim asks gh three things: the open-PR rollup (already reduced by --jq to TSV), the
# per-head status descriptions, and (for CHANGES_REQUESTED) the sha a rejection was recorded against.
# The stub answers from files the cases write, so a case is a fixture, not a mock script.
cat > "$R/bin/gh" <<'STUB'
#!/bin/bash
# Applies the caller's OWN --jq program to fixture JSON. The first version of this stub returned
# pre-reduced TSV, which meant the jq program — the thing this test changes — was never executed:
# the mutation that strips `FAILURE` out of the selector still "passed", because nothing was
# selecting anything. A stub that answers the question instead of running the query makes every case
# above it unfalsifiable.
prog=""; prev=""
for a in "$@"; do [ "$prev" = "--jq" ] && prog="$a"; prev="$a"; done
case "$*" in
  *"pr list"*)                 jq -r "$prog" < "$FIXTURE_ROWS" ;;
  *statuses*)                  jq -r "$prog" < "$FIXTURE_DESC" 2>/dev/null ;;
  *"pr view"*reviewDecision*)  cat "$FIXTURE_DECISION" 2>/dev/null ;;
  *reviews*)                   cat "$FIXTURE_REJSHA" 2>/dev/null ;;
  *) : ;;
esac
STUB
chmod +x "$R/bin/gh"
export PATH="$R/bin:$PATH"
export FIXTURE_ROWS="$R/rows" FIXTURE_DESC="$R/desc" FIXTURE_DECISION="$R/decision" FIXTURE_REJSHA="$R/rejsha"

# rows <PR> <sha> <gate-state> -> the GraphQL shape `gh pr list --json ...` returns
rows () { printf '[{"number":%s,"headRefOid":"%s","reviewDecision":null,"statusCheckRollup":[{"context":"faithfulness-gate","state":"%s"}]}]' "$1" "$2" "$3"; }
# desc <text> -> the REST shape `commits/<sha>/statuses` returns, NEWEST FIRST. The older `pending`
# the gate posts when it starts is included so the query's `first` is pinned to mean "newest": if it
# ever meant "oldest", every re-gated PR would be judged on the reason for the PREVIOUS run.
desc () { if [ -z "$1" ]; then printf '[]'; else
  printf '[{"context":"faithfulness-gate","state":"failure","description":"%s"},{"context":"faithfulness-gate","state":"pending","description":"gate running on vjeux-mac"}]' "$1"; fi; }

run () { # run <rows-json> <desc-json> [decision] [rejsha] -> stdout+stderr of one claim
  printf '%s\n' "$1" > "$FIXTURE_ROWS"
  printf '%s\n' "$2" > "$FIXTURE_DESC"
  printf '%s\n' "${3:-}" > "$FIXTURE_DECISION"
  printf '%s\n' "${4:-}" > "$FIXTURE_REJSHA"
  rm -rf "$R/state"; mkdir -p "$R/state"
  FCT_STATE_DIR="$R/state" FCT_AGENT_ID=reviewer-test bash "$RC" claim 2>&1
}

want () { # want <claimed|none> <label> <output>
  local w="$1" label="$2" out="$3" got=none
  case "$out" in *CLAIMED*) got=claimed;; esac
  if [ "$got" = "$w" ]; then echo "  OK    $label"; else
    echo "  FAIL  $label (got $got, wanted $w)"; echo "        ${out//$'\n'/ | }"; fails=$((fails+1)); fi
}

SHA=4aa1b87aaa7a3f624fca834750a4d90ce5a7996c
G5="16 G5 flag(s): reviewer must re-derive disasm, then rerun --reviewed"

# 1. THE INCIDENT: the gate asked for a reviewer, so a reviewer must be able to claim it.
want claimed "a G5-flagged failure is reviewer work" "$(run "$(rows 645 $SHA FAILURE)" "$(desc "$G5")")"

# 2. A mechanical failure stays with its author — this queue must not start handing out broken PRs.
want none "a regression failure is not offered to a reviewer" \
     "$(run "$(rows 629 $SHA FAILURE)" "$(desc "JUDGED: regression (rebase needed): conflicts with main; gate not run")")"

# 3. THE DISCRIMINATOR: #644's real text. A hard G5 reject is a verdict, not a blind spot.
want none "a 'G5 SKELETON' hard reject is not mistaken for G5 flags" \
     "$(run "$(rows 644 $SHA FAILURE)" "$(desc "JUDGED: G5 SKELETON — operator== @0x2a34e is DISPATCH_ONLY; body is a shell")")"

# 4. An unanswered description query must SKIP, not offer. Offering on an unknown reason hands every
#    reviewer the same mechanically-failing rows to re-gate forever; skipping costs one poll and
#    leaves the orphan for queue-coverage to see.
out="$(run "$(rows 645 $SHA FAILURE)" "$(desc "")")"
want none "an unreadable failure reason is skipped, not guessed" "$out"
case "$out" in *"could not read why its gate failed"*) echo "  OK    ...and it says so out loud";;
  *) echo "  FAIL  the skip was silent — a dormant-looking queue with no reason printed"; fails=$((fails+1));; esac

# 5. Whose turn: a G5 failure REJECTED on this very head belongs to the author (rework queue). The
#    head-SHA discriminator is shared with rework_claim so the two queues cannot disagree.
want none "a G5 failure rejected on the current head goes to rework, not review" \
     "$(run "$(rows 645 $SHA FAILURE)" "$(desc "$G5")" "CHANGES_REQUESTED" "$SHA")"

# 6. ...but once the author has answered (rejection recorded against an OLDER head), it is a
#    reviewer's again. Without this the fix would starve the very queue it is widening.
want claimed "a G5 failure whose rejection predates the head is claimable again" \
     "$(run "$(rows 645 $SHA FAILURE)" "$(desc "$G5")" "CHANGES_REQUESTED" "0000000000000000000000000000000000000000")"

# 7. UNCHANGED BEHAVIOUR: an ungated PR is still the ordinary case this queue exists for.
want claimed "a PR with no gate at all is still claimed" "$(run "$(rows 646 $SHA NONE)" "$(desc "")")"

# 8. MUTATION. Cases 2-5 are all "none", so a selector that admits NOTHING would pass most of this
#    file. Drop FAILURE back out of the rollup filter and case 1 must go red.
MUT="$R/review_claim_mutated.sh"
sed 's/ or .s=="FAILURE"//' "$RC" > "$MUT"
if ! grep -q 'or .s=="FAILURE"' "$RC" || ! bash -n "$MUT" 2>/dev/null; then
  echo "  FAIL  could not build the mutant — case 8 proves nothing"; fails=$((fails+1))
else
  printf '%s\n' "$(rows 645 $SHA FAILURE)" > "$FIXTURE_ROWS"
  printf '%s\n' "$(desc "$G5")" > "$FIXTURE_DESC"
  : > "$FIXTURE_DECISION"; : > "$FIXTURE_REJSHA"
  rm -rf "$R/state"; mkdir -p "$R/state"
  out="$(FCT_STATE_DIR="$R/state" FCT_AGENT_ID=reviewer-test bash "$MUT" claim 2>&1)"
  case "$out" in
    *CLAIMED*) echo "  FAIL  with FAILURE removed from the selector the PR was still claimed —"
               echo "        case 1 is passing for some other reason and pins nothing"; fails=$((fails+1));;
    *) echo "  OK    mutation: without the selector change #645 falls out of the queue (case 1 has teeth)";;
  esac
fi

echo
if [ "$fails" = 0 ]; then echo "test_review_claim_g5: PASS"; else echo "test_review_claim_g5: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
