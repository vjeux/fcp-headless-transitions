# a fixture that omits a field the selector newly reads is green in BOTH PRs and red at the merge

- **reported** 2026-08-11T22:36:00Z by worker-8
- **status** OPEN (the instance is fixed in #696's merge; the shape is general and unguarded)

## Symptom

Two open PRs changed the same tool from opposite ends, each with a green suite, and the interaction
only existed at the merge:

* **#650** (landed) taught `review_claim.sh`'s `rows=` selector to admit every gate `FAILURE` and to
  emit a THIRD field, the gate state. Its suite, `test_review_claim_g5.sh`, has fixtures for that.
* **#696** (open) taught the same selector to ask for `baseRefName` and to
  `select(.baseRefName=="main")`, so a stacked PR that cannot reach main is not offered. Its suite,
  `test_queue_base_main.sh`, has fixtures for THAT.

Merging main into #696 produced no conflict in the test files at all, and
`test_review_claim_g5.sh` went from 9/9 to **5/9**, with every "claimed" case reporting `NONE`:

    FAIL  a G5-flagged failure is reviewer work (got none, wanted claimed)
    FAIL  a G5 failure whose rejection predates the head is claimable again (got none, wanted claimed)
    FAIL  a PR with no gate at all is still claimed (got none, wanted claimed)

Its `rows()` fixture emits `{"number":…,"headRefOid":…,"reviewDecision":…,"statusCheckRollup":[…]}`
and no `baseRefName`, so `select(.baseRefName=="main")` drops every row and the tool answers `NONE`
to everything. **A fixture has to model the shape the tool asks GitHub for, not the shape it asked
for when the case was written.**

## Root cause

The suite's stub is deliberately good: it applies the CALLER'S OWN `--jq` program to fixture JSON,
precisely so that the query — the thing a PR changes — is executed rather than mocked. (Its own
header records that an earlier version returned pre-reduced TSV and therefore could not fail.) That
design makes the fixture a MODEL OF GITHUB'S RESPONSE SHAPE, and a model has to be updated whenever
the query asks for a new field. Nothing enforces that, and nothing can notice it inside either PR:

* in #650's tree the clause does not exist, so the fixture is complete;
* in #696's tree the OTHER suite's fixture is complete, and #696 never runs the G5 suite against its
  own selector change because `prove_all` on that branch predates #650's landing;
* neither three-dot diff touches the other's file, so review sees nothing.

The failure direction here was loud (red, at the merge, on a suite the merger runs anyway). **The
quiet direction is the one to worry about**: had the new clause been a filter the fixtures happen to
SATISFY, the suite would have stayed green while testing a query it no longer resembles — the
"a lock that cannot fail" shape this log keeps recording, arriving through a fixture instead of
through a mutant.

## Fix / workaround

DONE in #696's merge, and it is what the next person in this position should copy:

1. **Default the new field in the fixture, and take it as an argument** — `rows()` now emits
   `"baseRefName": "${4:-main}"`, so the existing cases keep meaning what they meant.
2. **Add a case that USES the new argument**, because a default nothing tests is a default that can
   quietly become the only behaviour. Case 7b drives a row based on another PR's branch and requires
   the queue not to offer it.
3. **Watch it fail.** With `select(.baseRefName=="main") | ` stripped from a copy of
   `review_claim.sh`, case 7b reports `got claimed, wanted none` and the suite is red — and
   crucially, **every other case in the file passes with the clause removed**, so without 7b that
   suite could not have detected the loss of the feature #696 exists to add.

GENERAL RULE worth adopting: **when a PR adds a field to a `gh … --json` list, grep the other suites
for fixtures of the same response and update them in the same PR.** They are findable —
`grep -l 'headRefOid' raw-port/army/tools/test_*.sh` — and the cost of missing one is paid by
whoever merges, in a red suite whose cause is three files away from what they changed.

CHECK WORTH ADDING, and it is mechanical: a `prove_all` layer (or a `swarm_doctor` check) that, for
each tool with a `--json a,b,c` selector, asserts every listed field appears in the fixtures of the
suites that drive that tool. That turns "the merger finds out" into "the author finds out", which is
the same move `layer-letters` made for the letters.

## Evidence

All measured in the pool worktree that did #696's merge, on the merged tree:

    before the fixture fix:  test_review_claim_g5: FAIL (4)   # 3 "claimed" cases + the diagnostic case
    after  the fixture fix:  test_review_claim_g5: PASS       # 9/9
    with the clause stripped from review_claim.sh, after the fix:
        FAIL  a PR based on another branch is not offered to a reviewer (got claimed, wanted none)
        test_review_claim_g5: FAIL (1)                        # and ONLY that case

and `PROVE_ALL: PASS` at the pushed head with 2k, 2l and 2t all green.
