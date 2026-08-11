# the doctor counts review_claim's selector as coverage, but its loop skips half of what the selector admits

- **reported** 2026-08-11T23:41:00Z by the operator (found by reviewer 6, confirmed by reviewer 8)
- **status** OPEN — the defect is live on `origin/main` right now. This entry ships the account and
  the recipe; the fix needs re-deriving against main's current shape (see "why this is not a patch").

## Symptom

`swarm_doctor`'s `queue-coverage` check certifies as *"some queue will take it"* PRs that
`review_claim` will never hand to anyone. It fails **silently toward GREEN**, in the one alarm that
found the #645 orphan — so the next orphan goes unreported and nothing else is watching.

## Mechanism

`check_queue_coverage` lifts each queue's selector out of the tool and counts the PRs it returns.
For `rebase_claim` it correctly applies the *second* half of that tool's filter too — the status
description grep that runs inside the claim loop. For `review_claim` it stops at the selector.

That was harmless until **#650** landed. Before it, `review_claim`'s `rows=` query excluded every
gate `FAILURE`, so selector and loop agreed. #650 taught the selector to admit **every** FAILURE and
put the discrimination in the loop:

    rows=$(gh pr list ... | select(.s=="NONE" or ... or .s=="FAILURE" or ...))   # admits all
    case "$gdesc" in
      *"G5 flag"*|*"re-derive disasm"*) : ;;   # the gate is asking for a reviewer -> ours
      "") ... skip, loudly ;;                  # unreadable reason
      *) continue ;;                           # a MECHANICAL failure: the AUTHOR fixes it
    esac

So every mechanically-failing PR is now counted as covered by `review_claim` and is claimable by
nobody. Reviewer 8 measured it live at 21:47Z with main's own selector and main's own `case`:

    selector rows: 16, of which FAILURE: 2
    #696  "JUDGED: regression (rebase needed): CONFLICTING on prove_all.py ..."   -> loop SKIPS
    #649  "JUDGED: regression (rebase needed): DIRTY on prove_all.py ..."         -> loop SKIPS

Both were counted covered. Both happened to match `rebase_claim`'s `regression|rebase` grep that
minute, so nothing was stranded *at that instant* — which is exactly why this is filed as a
mechanism rather than an incident. The two states that would strand are a `dup-ledger (already on
main)` park and a `JUDGED:` park worded so it also dodges the rebase grep; this project has produced
both.

## Why this is not a patch

A working fix existed on `tools/slot-liveness` as commit `df1309e7a` — two helpers
(`review_claim_case_patterns`, `review_claim_covered`) that LIFT the `case` patterns out of
`review_claim.sh` rather than re-modelling them, plus 51 lines of new cases in
`test_review_claim_g5.sh`. It was verified: the lifted patterns come back as
`['G5 flag', 're-derive disasm']`, straight from the tool.

That commit is **on main's history but its content is not on main**: #656 was rebuilt on current
main rather than merged (most of its diff would have reverted main), and only the slot-liveness
delta was carried. Lifting `df1309e7a`'s helpers onto main afterwards does not apply — main's
`check_queue_coverage` has since been restructured and no longer contains the `gate_description`
helper the call site attaches to, and the old suite's fixtures are stale against `review_claim`'s
current selector (it now also filters on `baseRefName`, from #696). Applying the old test against
current main gives `test_review_claim_g5: FAIL (5)`.

Half-landing a lift that cannot be verified is worse than filing it, so it is filed.

## Fix

Give `review_claim` the treatment `rebase_claim` already gets: read the tool's `case` arms out of
its source and apply them to the same status DESCRIPTION field, for each FAILURE row the selector
returned.

    rc_src = from_main("raw-port/army/tools/review_claim.sh")
    m = re.search(r'case "\$gdesc" in\s*\n\s*([^)]+)\)', rc_src)   # -> *"G5 flag"*|*"re-derive disasm"*

Four things the previous attempt got right and a re-derivation should keep:

1. **Lift, never re-model.** A second statement of a queue's rule is a second source of truth, and
   #20/#21/#26 are all that drifting. The whole design of this check is "the selector IS the filter".
2. **Read the description with raw `sh()`, not `gh_json`.** `--jq '….description'` prints a BARE
   string, which is not JSON; a JSON-parsing wrapper reads a good answer as a failure and the PR
   drops out of the covered set silently. That is already written into the rebase side.
3. **Use the sha from the selector's OWN row**, so the question is about the head the queue just
   saw rather than a second, colder snapshot of GitHub.
4. **A row that cannot be read stays IN.** Cannot check → do not accuse.

## How to know it worked

Before: `review_claim=N` counts every FAILURE row. After: it counts only the G5-flagged ones, and
`queue-coverage` starts reporting the mechanical ones as uncovered whenever no other queue takes
them. Reviewer 8's live A/B was `review_claim=16` (main) vs `14` (fixed) on the same minute; a
re-derivation should reproduce that shape, not that number.
