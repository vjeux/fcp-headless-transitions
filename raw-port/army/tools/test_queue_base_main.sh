#!/bin/bash
# test_queue_base_main.sh — LOCKED test: no queue may offer a PR that does not target `main`.
#
# THE BUG (2026-08-11). `gh pr merge` merges into the PR's BASE. A PR based on a peer's feature
# branch therefore cannot put anything on main: the merge writes onto that branch (where main's
# protection does not apply) and MOVES the peer's head, staling any CHANGES_REQUESTED standing
# against it. No queue looked at `baseRefName`, so such a PR was offered as ordinary work:
#   * #650  base `tools/lease-ownership` (#649's head) — caught by reviewer 5 in review, one signature
#           away from a reviewer squashing it onto a rejected peer's branch;
#   * #656  base `tools/reap-dead-counters` (#651's head, four commits deep) — handed to a WORKER by
#           rebase_claim as a rebase task, whose DIRTY was a conflict with that peer branch and not
#           with main at all.
# Same family as #33: every component answered "does this PR need work?" correctly, and none asked
# "can the work be acted on?".
#
# WHAT IS PINNED: each of the three queue selectors drops a non-main-based PR and keeps an otherwise
# identical main-based one. Cases 4-6 are the MUTATION: the `.baseRefName=="main"` clause is stripped
# from a COPY of each tool and the same fixture must then produce the wrong answer. A case that
# cannot fail is not a lock (OPS_LOG, the #514 `sorted(set())` lesson).
#
# Offline: `gh` is stubbed on PATH and FCT_STATE_DIR is a tempdir, so nothing reaches GitHub and no
# live lease is touched. The stub applies the CALLER'S OWN --jq program to fixture JSON, so the jq
# selector — the thing this change edits — is what actually runs.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
R="$(mktemp -d)"
trap 'rm -rf "$R"' EXIT
fails=0
mkdir -p "$R/bin"

cat > "$R/bin/gh" <<'STUB'
#!/bin/bash
prog=""; prev=""
for a in "$@"; do [ "$prev" = "--jq" ] && prog="$a"; prev="$a"; done
case "$*" in
  *"pr list"*)
      # `--json number,mergeStateStatus` with no --jq is rebase_claim's warm-up call; answer it
      # with the raw fixture so the real query below is the one that matters.
      if [ -z "$prog" ]; then cat "$FIXTURE_ROWS"; else jq -r "$prog" < "$FIXTURE_ROWS"; fi ;;
  *statuses*)   jq -r "${prog:-.}" < "$FIXTURE_DESC" 2>/dev/null ;;
  *reviews*)    cat "$FIXTURE_REJSHA" 2>/dev/null ;;
  *"pr view"*)  echo "" ;;
  *) : ;;
esac
STUB
chmod +x "$R/bin/gh"
export PATH="$R/bin:$PATH"
export FIXTURE_ROWS="$R/rows" FIXTURE_DESC="$R/desc" FIXTURE_REJSHA="$R/rejsha"

SHA_OFF="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
SHA_ON="bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

# Two PRs that differ in ONE field: the first is based on a peer's branch, the second on main.
# Everything else about them is identical, so a queue that does not read `baseRefName` must offer
# both and a queue that reads it must offer exactly the main-based one. The rest of each row is
# written per-tool, because each queue keys on a different state and a fixture that is claimable by
# one queue is deliberately invisible to the others (a FAILURE gate is rebase/rework work and is
# exactly what review_claim declines).
fixture () { # fixture <tool> [only-off-main]
  case "$1" in
    review_claim)   # claimable by a reviewer: no gate yet, no verdict yet
      gate='[]'; dec='null'; ms='"BLOCKED"' ;;
    rework_claim)   # the author's turn: a standing rejection
      gate='[]'; dec='"CHANGES_REQUESTED"'; ms='"BLOCKED"' ;;
    rebase_claim)   # a conflicted branch, which this queue takes on the conflict alone
      gate='[{"context":"faithfulness-gate","state":"FAILURE"}]'; dec='null'; ms='"DIRTY"' ;;
  esac
  local off_row main_row
  off_row=$(cat <<JSON
 {"number":656,"baseRefName":"tools/reap-dead-counters","headRefName":"tools/slot-liveness",
  "headRefOid":"$SHA_OFF","reviewDecision":$dec,"updatedAt":"2026-08-11T10:00:00Z",
  "mergeStateStatus":$ms,"statusCheckRollup":$gate}
JSON
)
  main_row=$(cat <<JSON
 {"number":660,"baseRefName":"main","headRefName":"port/Example",
  "headRefOid":"$SHA_ON","reviewDecision":$dec,"updatedAt":"2026-08-11T11:00:00Z",
  "mergeStateStatus":$ms,"statusCheckRollup":$gate}
JSON
)
  # The mutation cases use the off-main row ALONE. With both rows and the guard removed, a queue
  # sees two claimable PRs and review_claim `sort -R`s them, so the assertion "the mutant claims
  # #656" would pass or fail by coin toss — a flaky lock is worse than no lock, and this one flaked
  # on its first prove_all run.
  if [ "${2:-}" = "only-off-main" ]; then
    printf '[\n%s\n]\n' "$off_row" > "$FIXTURE_ROWS"
  else
    printf '[\n%s,\n%s\n]\n' "$off_row" "$main_row" > "$FIXTURE_ROWS"
  fi
}
# rebase_claim reads the status DESCRIPTION for a non-DIRTY row; both of its rows are DIRTY, but
# keep the fixture honest anyway.
printf '[{"context":"faithfulness-gate","state":"failure","description":"regression (rebase needed)"}]\n' > "$FIXTURE_DESC"
# rework_claim asks which commit the standing rejection was recorded against. An EMPTY answer is
# treated as a transport failure and the PR is still offered — which is the state this fixture wants,
# because it isolates the base filter from the already-reworked skip.
printf '\n' > "$FIXTURE_REJSHA"

claim () { # claim <tool-path> [extra env]
  rm -rf "$R/state"; mkdir -p "$R/state"
  FCT_STATE_DIR="$R/state" FCT_AGENT_ID=worker-test bash "$1" claim 2>&1
}

ok () { # ok <name> <condition-result>
  if [ "$2" = 0 ]; then printf '  OK    %s\n' "$1"; else printf '  FAIL  %s\n' "$1"; fails=$((fails+1)); fi
}

for tool in review_claim rework_claim rebase_claim; do
  fixture "$tool"
  out=$(claim "$HERE/$tool.sh")
  case "$out" in
    *"CLAIMED 656"*) ok "$tool does not offer #656 (base is a peer branch)" 1 ;;
    *)               ok "$tool does not offer #656 (base is a peer branch)" 0 ;;
  esac
  case "$out" in
    *"CLAIMED 660"*) ok "$tool still offers #660 (base is main)" 0 ;;
    *)               ok "$tool still offers #660 (base is main)" 1
                     printf '        got: %s\n' "$(printf '%s' "$out" | tail -2 | tr '\n' ' ')" ;;
  esac
done

# ---- MUTATION: remove the guard and the same fixtures must go wrong --------------------------
# The grep looks for the jq CLAUSE, not the bare field name: every one of these tools also mentions
# `.baseRefName=="main"` in the comment that explains the clause, and a mutation check satisfied by
# a comment is the "a lock that cannot fail" shape this suite exists to refuse.
for tool in review_claim rework_claim rebase_claim; do
  fixture "$tool" only-off-main
  sed 's/select(\.baseRefName=="main") | //' "$HERE/$tool.sh" > "$R/$tool.mut.sh"
  if ! grep -q 'select(\.baseRefName=="main")' "$R/$tool.mut.sh"; then
    out=$(claim "$R/$tool.mut.sh")
    case "$out" in
      *"CLAIMED 656"*) ok "mutation: without the guard $tool DOES offer #656 (the case has teeth)" 0 ;;
      *)               ok "mutation: without the guard $tool DOES offer #656 (the case has teeth)" 1
                       printf '        got: %s\n' "$(printf '%s' "$out" | tail -2 | tr '\n' ' ')" ;;
    esac
  else
    ok "mutation: the guard could be removed from $tool" 1
  fi
done

echo
if [ "$fails" = 0 ]; then echo "test_queue_base_main: PASS"; else echo "test_queue_base_main: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
