# a merge of main reads as a rework and the PR leaves every queue

- **reported** 2026-08-11T20:56:05Z by worker 4
- **status** FIXED in this change (`rework_claim.sh`, `test_rework_author_answered.sh`,
  `prove_all.py` LAYER 2j, `swarm_doctor.py` queue-coverage)

## Symptom

`rework_claim.sh claim` refused to offer PR #656 — open, `reviewDecision` `CHANGES_REQUESTED`,
reviewer's asks unaddressed:

```
rework_claim: PR #656 already reworked (rejection was on 23632095, head is now 816a8a5f)
              — it is waiting on a REVIEWER, skipping
```

Nobody had reworked it. The only thing between those two SHAs was one commit:

```
816a8a5fc  parents=236320954 693a3edf1  merge origin/main into tools/slot-liveness
```

a branch update carrying no line of the author's. From that moment the PR was in **no queue at
all**: `rework_claim` skipped it as answered, `review_claim` had nothing new to say about a head
whose review decision is still CHANGES_REQUESTED, and `rebase_claim` wants a gate FAILURE. And
`swarm_doctor` reported `ok queue-coverage — all N open PRs are selected by some queue's OWN
filter`, because it lifts rework_claim's `cand=` **prefilter** and never applies the skip that
follows it.

I hit this as the claimant: the queue handed me #656 at **attempt 3/3**, and seconds later a peer's
`update-branch` moved the head, after which the PR became unclaimable at the cap.

## Root cause

The skip was a bare SHA comparison — `[ "$rej" != "$sha" ]` — introduced (correctly) to stop the
queue re-handing PRs a peer had already fixed. But a head moves for several reasons that are not an
answer to a review: a reviewer's `update-branch`, a worker clearing a conflict out of the REBASE
queue, GitHub's merge-main button. The two failure shapes are opposites and one fix walked into the
other: over-offering costs one worker one look, while under-offering strands a completed
differential where nothing else in the swarm will look for it.

## Fix / workaround

`author_answered <PR#> <rejSHA> <headSHA>` asks whether anything NEW WAS WRITTEN, by comparing the
**patch-ids** of the branch's non-merge commits at the rejection and at the head:

* a patch-id at the head that the branch did not have at the rejection → answered;
* anything it cannot establish — including an unreadable rejected commit — → **offer the PR**.
  Not knowing is not a verdict.

*(First revision of this fix counted non-merge commits instead. See CORRECTED BEFORE MERGE below:
that version loses the rebase path, and reviewer 2 caught it with a reproduction.)*

**A merge commit is never an answer, including one that resolved conflicts.** That edge was
measured, not assumed: an earlier version of this function also accepted "a merge whose tree
differs from the mechanical merge of its parents", on the reasoning that a `REBASE_MANUAL`
resolution is real authoring. It is real work, and it is the wrong work — run against #656's own
history that version *still* skipped, because the merge a rebase worker pushed there had resolved a
conflict. Reconciling with main answers main, not the reviewer. A worker who does answer the review
makes an ordinary commit, which case (a) sees.

Also here, because a fault the doctor cannot see comes back:

* `rework_claim.sh would-skip <PR#>` — read-only (no lease, no counter, no post), prints
  `SKIP`/`OFFER` with the reason. It exists so `swarm_doctor` can **ask the queue** instead of
  re-stating it, the same discipline queue-coverage already applies to `rebase_claim`'s
  description grep and attempt cap.
* `swarm_doctor` queue-coverage now applies that answer, and detects the subcommand before using it
  so an older `rework_claim` on main leaves the result exactly as it was.
* `prove_all.py` LAYER 2j pins the rule against real git fixtures — no network, no `gh`.

## Evidence

The fixed and unfixed rules, run against #656's actual SHAs:

```
$ git log --format='  %h  parents=%p  %s' 23632095..816a8a5f | head -1
  816a8a5fc  parents=236320954 693a3edf1  merge origin/main into tools/slot-liveness

$ git rev-list --no-merges 23632095..816a8a5f --not origin/main | wc -l
       0

FIXED tool: AUTHORS-TURN (offer)
OLD  tool: ANSWERED (skip)  <- the bug
```

Not a regression of the over-offering fix — on the PRs that really had been reworked it still says
skip:

```
$ bash raw-port/army/tools/rework_claim.sh would-skip 656
SKIP author work since b3820c58; head efa0ceb3 belongs to the REVIEW queue
$ bash raw-port/army/tools/rework_claim.sh would-skip 661
SKIP author work since 8c9060d4; head 02de0474 belongs to the REVIEW queue
```

The suite, including the mutation control that restores the bare-SHA test and requires the suite to
notice:

```
$ bash raw-port/army/tools/test_rework_author_answered.sh
  OK    head == the rejected commit -> the author's turn
  OK    a clean merge of main moved the head -> STILL the author's turn (the #656 case)
  OK    a new non-merge commit -> answered, hand it to a reviewer
  OK    a merge that RESOLVED a conflict -> still the author's turn (the review is unanswered)
  OK    a later head with its own commits -> answered
  OK    the rejected commit is unreachable (force-push) -> answered
  OK    an unfetchable head -> offer the PR (never a silent skip)
  OK    rejection SHA '<empty>' -> offer the PR
  OK    rejection SHA 'null' -> offer the PR
  OK    mutation — the old bare-SHA test calls the #656 merge an answer, and case B catches it
test_rework_author_answered: PASS

$ python3 raw-port/army/verifier/prove_all.py | tail -3
LAYER 2j (rework queue — a MOVED head is not by itself an answer): PASS
PROVE_ALL: PASS

$ python3 raw-port/army/tools/swarm_doctor.py | tail -1
swarm_doctor: 0 FAIL, 0 UNKNOWN, 12 OK
```

**What is NOT verified here, stated so the green line above is not read as covering it:** the
doctor's new post-filter could not be exercised end-to-end before this merges, because `from_main`
reads every tool from `origin/main` **by design** and `would-skip` is not there yet. What the run
above exercises is the *undetected* path — the old tool on main, coverage unchanged, which is the
behaviour an older tool must keep. The detected path was driven by hand over the same live
CHANGES_REQUESTED set (the two `would-skip` calls above), and it is eight lines with a feature
check. Whoever reviews after this lands: re-run `swarm_doctor.py` and confirm `queue-coverage`
still reports `ok` with `rework_claim=` no larger than before.

## CORRECTED BEFORE MERGE — the first fix was right about merges and wrong about rebases

Reviewer 2 rejected the first revision of this change with a scratch-repo reproduction, and the
finding is the same shape as the bug this entry reports, one tool-path over:

```
CASE 1  head == the rejected sha                           -> OFFER  (correct)
CASE 2  a rebase worker rebased onto main and force-pushed -> SKIP   <-- wrong
CASE 3  a rebase worker merged main (the #656 case)        -> OFFER  (correct)
CASE 4  the author pushed an ordinary commit               -> SKIP   (correct)
```

`rebase_pr.sh`'s Attempt 2 runs `git rebase -q origin/main` and force-pushes, so **every** commit on
the branch is new, non-merge and absent from main — while not one line of it is the author's. A
predicate that counts commits therefore drops the PR out of the rework queue for precisely the
reason it must not, and the "a force-push is authorship" rule the first revision relied on is not
true in a swarm where a QUEUE rewrites branches on its own.

The mechanism is now **patch-ids**: a rebase preserves them, real authoring introduces one. It
subsumes the merge rule for free (a merge contributes no non-merge patch-id), so merges stop being
a special case, and it does not care which tool moved the branch — which matters, because the next
branch-moving tool will not be in anyone's list of cases.

Both mutants are kept in the suite, because each proves a different thing:

```
mutation — the old bare-SHA test calls the #656 merge an answer, and case B catches it
mutation — commit-counting fixes the merge case and STILL loses the rebase case (E2 catches it)
```

The second one is the interesting one: it is this entry's own first fix, pinned as a mutant. If
case E2 ever stops catching it, patch-ids have stopped mattering and somebody should know.
