# a push to the wrong branch name reports `* [new branch]` and reads as success

- **reported** 2026-08-11T21:18:29Z by worker-7
- **status** OPEN

## Symptom

Reworking PR #661, I pushed to `OPSLOG_r2_staleref` — the branch name as the queue printed it,
without the `port/` prefix the real head branch carries. Git created a NEW remote branch and said
so, at exit 0:

    To https://github.com/vjeux/fcp-headless-transitions.git
     * [new branch]          HEAD -> OPSLOG_r2_staleref

Nothing failed. The PR was untouched: it still showed the old head, still carried the standing
`CHANGES_REQUESTED`, and a reviewer looking at it a minute later would have seen a rework that had
supposedly been pushed and was not there. I noticed only because I read the push output instead of
skimming it — `* [new branch]` on a push you meant as an UPDATE is the whole tell, and it looks
exactly like the `abc1234..def5678` line you were expecting.

## Root cause

Two spellings of one thing, and the queue prints the one that is not a ref. `rebase_claim.sh` /
`rework_claim.sh` print `CLAIMED <PR#> <branch>`, and I used that token verbatim. In this case the
queue's token and the PR's `headRefName` agreed — the mistake was mine, dropping the prefix while
retyping it — but the class is general: **git will happily create any branch name you hand it, and
a create is indistinguishable from an update in the exit status.** The same shape as this log's
standing rule about reading a command's STATUS rather than its output, except here the status is
genuinely 0 and only the words differ.

It is also the reason the failure is quiet at the PR level: GitHub reports nothing about a branch
nobody is watching, the rework lease is released as normal, and the queue's own skip
("already reworked — the head has moved") does not fire, so the PR is re-offered later as if no
work had been done.

## Fix / workaround

Take the branch name from the PR, never from the queue line or from memory:

    BR=$(gh pr view <N> --repo <slug> --json headRefName --jq .headRefName)
    git push origin "HEAD:refs/heads/$BR"

and after any push you meant as an update, assert it moved the PR's head rather than trusting the
line:

    [ "$(gh pr view <N> --json headRefOid --jq .headRefOid)" = "$(git rev-parse HEAD)" ] || echo "the PR did NOT move"

Recovery is one command (`git push origin --delete <the stray name>`), and it is worth doing
immediately: a stray `port/`-less branch is invisible to every queue but still shows up in
`git ls-remote`, and the next agent to see it has to work out whether it is someone's live work.

TOOL FIX worth making, cheap: have `pr_submit.sh`'s sibling paths — and the rework/rebase queue
lines — print the FULL ref (`port/<Class>`), and have any push helper refuse to CREATE a branch
when the caller passed `--update`-style intent. `ghapp/git_push_as.sh` already refuses a force-push
that would replace real work with nothing; refusing an accidental create is the same family.

## Evidence

```
$ bash raw-port/army/tools/rework_claim.sh claim
CLAIMED 661 port/OPSLOG_r2_staleref   (rework attempt 1/3 on head 8c9060d4)

$ git push origin HEAD:refs/heads/OPSLOG_r2_staleref     # the prefix dropped
 * [new branch]          HEAD -> OPSLOG_r2_staleref      # exit 0
$ gh pr view 661 --json headRefOid --jq .headRefOid
8c9060d42bb939af60d3601a729a58cdfddc578e                 # unchanged: the PR never saw it

$ gh pr view 661 --json headRefName --jq .headRefName
port/OPSLOG_r2_staleref
$ git push origin --delete OPSLOG_r2_staleref
 - [deleted]             OPSLOG_r2_staleref
$ git push origin HEAD:refs/heads/port/OPSLOG_r2_staleref
   8c9060d42..fe265a5c7  HEAD -> port/OPSLOG_r2_staleref  # what an update looks like
```

## Also, corroborating an existing rule with a fresh instance

`assert src.count(old) == 1` when generating a mutant caught a real one this shift. Oracling
`PCSerializerReadStream::currentHandlerElement` @ProCore 0x264f6, the mutant "drop the empty-stack
early exit" anchored on `if (size === 0) {` — which appears TWICE in that file, because the sibling
`currentElement()` has the same guard. Without the count assertion the mutant would have patched
the OTHER method and scored like a real control while proving nothing about the one under test.
Anchoring on the cited comment line above the branch made it unique. The rule is already in this
log; this is the second measured instance, and it cost nothing because the assertion was there.
