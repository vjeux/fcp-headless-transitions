# A transient TLS failure hands a worker a rework that was already finished (fix in this change)

- **reported** 2026-08-11T21:20:00Z by worker-6
- **status** FIXED IN THIS CHANGE (rework_claim.sh + a mutation-tested case)

## Symptom

`rework_claim.sh` handed me PR #655 as `rework attempt 1/3 on head 998dfc5f`. Its author had
already answered the review — twice — and the guard from OPS_LOG #36 exists precisely to skip
that PR. It skipped four OTHER PRs in the same run, and offered this one:

```
$ bash raw-port/army/tools/rework_claim.sh claim
rework_claim: PR #683 already reworked (rejection was on 6b56ece1, head is now e2f6ca99) — …skipping
CLAIMED 655 port/commentonce_argv   (rework attempt 1/3 on head 998dfc5f)
```

The data the guard needs was correct and available the whole time:

```
$ gh api repos/…/pulls/655/reviews --jq '[.[]|select(.state=="CHANGES_REQUESTED")]|last|.commit_id'
dbeb23cce44d7d1ca012dba412b1b488ed3370b2      # …and three re-runs gave the same answer

$ git log --format="%h %ad %s" --date=iso-strict origin/main..998dfc5f
998dfc5f4 14:08:20  merge origin/main into port/commentonce_argv (keep BOTH LAYER 2j blocks)
fc300b0be 13:57:17  fix(tools): the three read-back items and a timeout priced for a loaded box
6303b6de9 13:42:27  merge origin/main into port/commentonce_argv + rework reviewer 4's two blockers
dbeb23cce 13:18:52  fix(tools): pr_comment_once.sh posted "--body-file <path>" AS the comment …
```

Rejection on `dbeb23cc`, head on `998dfc5f`, three commits later. I found out by rebasing the
branch and reading a conflict hunk that already contained the reviewer's requested fix.

## Root cause

The guard reads the rejection's commit with ONE `gh api` call and treats an empty answer as a
transport failure, deliberately failing OPEN so a flaky API cannot starve the queue. That
reasoning is right; the frequency assumption behind it is not. `gh` on this box intermittently
dies with

```
Post "https://api.github.com/graphql": tls: failed to verify certificate:
x509: certificate signed by unknown authority
```

and the identical call succeeds on the next attempt — I hit it three times in one session on
unrelated calls, and OPS_LOG already records `pr_comment_once` failing that way and working on
the retry. One such blip inside this guard turns "already answered" into "offer it", and the
cost is a full worker run: lease, rebase, read, discover, back out.

Note the shape: **the guard was not wrong about the world, it just never saw it** — and its
failure mode is silent, because a fail-open looks exactly like a real offer.

## Fix / workaround

IN THIS CHANGE:

* three attempts with a 2s sleep, breaking on the first real answer, and only then the
  fail-open — the same retry the log already prescribes for gh-backed helpers;
* when it does fail open after three tries it now SAYS SO on stderr, naming the risk, so the
  worker who receives the PR can check the head before redoing the work;
* a new case in `test_rework_claim_stale_rejection.sh` (CASE 5) whose fake `gh` fails the first
  reviews call the way the real one does — non-zero exit, empty stdout, TLS message — and then
  answers. **Mutation-tested**: remove the retry loop, leaving valid single-shot code, and the
  case goes red (5 passed, 1 failed); restore it and the suite is 6/6. The suite is in
  `prove_all`, so this runs at every reviewer's startup.

WORKAROUND for anyone on an older copy: before starting a rework, compare the rejection's
`commit_id` with the PR head yourself; if they differ, the author already answered — say so on
the PR, release the lease, and clear the attempt counter.

## Evidence

```
$ timeout 300 bash raw-port/army/tools/test_rework_claim_stale_rejection.sh
  ok   — one transient TLS failure does not defeat the already-reworked guard (it retries)
REWORK_CLAIM_STALE_REJECTION: 6 passed, 0 failed

# same suite, retry loop deleted (mutant, valid code):
  FAIL — a retryable transport failure must not fail open into handing out finished work
REWORK_CLAIM_STALE_REJECTION: 5 passed, 1 failed
```

## A second, smaller one — mine, and worth a line because the tooling cannot catch it

While fixing the above I edited `raw-port/army/tools/rework_claim.sh` **at a hardcoded pool
path** (`~/.fct-pool/wt/6/...`) instead of the path my lease had just returned (`wt/5`). Slot 6
had been mine minutes earlier for a different task; by then it belonged to a peer's
`port/OPSLOG_r1_g5class`. My edit landed in THEIR tree, and I only noticed because my tests kept
measuring the unfixed file — the mutation step then failed to find its own anchor, which is what
gave it away. No harm done (their next `reset_clean` wiped it, and `git status` there is empty),
but the same mistake one minute earlier would have been an unexplainable file change in someone
else's uncommitted work — OPS_LOG's "my file vanished" entries seen from the other side.

RULE: derive the worktree path from the value `wt_pool.sh acquire` returned for THIS unit, in
the same command; never re-use a path from an earlier step, and never type a slot number.
