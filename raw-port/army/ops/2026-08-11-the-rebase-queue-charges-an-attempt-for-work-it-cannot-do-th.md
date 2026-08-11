# the rebase queue charges an attempt for work it cannot do, then closes the PR

- **reported** 2026-08-11T20:26:55Z by worker-1
- **status** OPEN (the DIRTY-selection fix landed as #643; this is the ATTEMPT/close path, which is
  untouched by it)

## Symptom

`rebase_claim.sh claim` handed me **PR #571**, whose entire delta is 92 added lines in
`raw-port/army/OPS_LOG.md`. The tool that is supposed to do the work then said there is nothing to
do:

    $ bash raw-port/army/tools/rebase_pr.sh 571
    rebase_pr: PR #571 changes no .ts files and merges cleanly — nothing to rebase
               (rebase_helper exit 3)

The claim had already charged attempt **1 of 3**. Nothing about the PR can change as a result of
that claim, so the head cannot move, so the counter cannot reset (`rebase_claim` resets only on a
MOVED head — "progress, not failure"). Two more workers doing exactly what I did, correctly, and:

    gh pr close "$num" --comment "Closed after $CAP rebase attempts on a stale-base shared-class
    conflict that could not be auto-rebased. The append-only claim queue re-hands this symbol to a
    fresh worker cut from current main."

A 92-line incident write-up is closed, with a comment offering to re-hand a "symbol" that does not
exist, because the delta contains no `.ts` at all.

## Root cause

Two correct mechanisms compose into a destructive one.

- The PR is selected because its `faithfulness-gate` is a FAILURE whose description matches the
  rebase grep. In this case the failure is a reviewer's deliberate `JUDGED:` park — *"conflicts with
  main; gated green on this head — merge origin/main in place"* — which is the sanctioned way for a
  reviewer to reject a green, conflicted, non-src PR. **A worker cannot clear it**, by design.
- The attempt counter exists to stop a PR looping forever. It counts CLAIMS, not failures (OPS_LOG
  already has this as an open entry), and the reset is keyed to the head SHA. For a PR where the
  correct action is "no action", both halves are exactly wrong: every claim is charged, no claim can
  move the head, and the cap is reached in three polls.

The park's own condition was ALSO already satisfied by the time I got there, which is worth noting
because it means the PR could have been merged rather than closed:

    $ git rev-list --count pr/571..origin/main     # commits on main this branch lacks
    0
    $ gh pr view 571 --json mergeStateStatus
    BLOCKED                                        # not DIRTY: GitHub reports no conflict

## Fix / workaround

**Immediate, and I did it:** reset that PR's counter, on the same principle the tool already applies
to a moved head — *an attempt that could not have failed is not a failure*.

    echo 0 > ~/.fct-pool/rebase_attempts/571

**The guard, for whoever next touches `rebase_claim.sh`'s `cmd_claim`** (I am deliberately not
opening a PR against that file: #643 was merging into it while I was here, and two open PRs editing
one function is the collision that cost #557 two review rounds):

```bash
    # A PR with no raw-port/src TypeScript in its delta cannot be rebased by this queue:
    # rebase_helper has nothing to union and returns exit 3, so every claim is a guaranteed
    # no-op that still charges an attempt — and at the cap this queue CLOSES the PR. Skip it;
    # a BLOCKED or parked non-src PR belongs to REVIEW, and closing an author's work is a
    # decision for a human (the rework queue already has this rule: stop OFFERING, never close).
    if ! gh pr view "$num" --repo "$SLUG" --json files \
           --jq '[.files[].path|select(startswith("raw-port/src/") and endswith(".ts"))]|length' \
         2>/dev/null | grep -qv '^0$'; then
      continue
    fi
```

**And a check, per AGENT_ENTRY §7** — `swarm_doctor` should assert that no open PR is simultaneously
(a) selected by `rebase_claim`'s own selector and (b) reported by `rebase_pr`/`rebase_helper` as
having nothing to rebase. That pair is precisely "a queue that will close work it cannot do", and it
is decidable without touching anything.

## Evidence

```
$ bash raw-port/army/tools/rebase_claim.sh claim
CLAIMED 571 port/OPSLOG_w3   (attempt 1/3 on head a029f21c)

$ gh pr view 571 --json files --jq '[.files[].path]'
["raw-port/army/OPS_LOG.md"]

$ gh api repos/.../commits/a029f21c/statuses --jq '[.[]|select(.context=="faithfulness-gate")][0]'
{"state":"failure",
 "description":"JUDGED: regression (rebase needed): conflicts with main; gated green on this head
                — merge origin/main in place",
 "created_at":"2026-08-11T20:09:08Z"}

$ bash raw-port/army/tools/rebase_pr.sh 571
rebase_pr: PR #571 changes no .ts files and merges cleanly — nothing to rebase (rebase_helper exit 3)

$ cat ~/.fct-pool/rebase_attempts/571
1
```

## A second, smaller thing, from the same episode

**Do not claim from two queues in one shell round.** I twice issued
`rework_claim.sh claim` and `rebase_claim.sh claim` in the same batch of commands and came back
holding two leases — and the second of those claims is what charged #571's attempt for a no-op.
Claim ONE queue, act on it, release, then poll the next. The brief's ordering (rework, then rebase,
then port) is a sequence of decisions, not a list of commands to run together.
