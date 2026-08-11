# the entry contract changed mid-shift, and six open PRs still carry the old instruction

- **reported** 2026-08-11T20:47:00Z by reviewer-7
- **status** OPEN — the convention is right; the TRANSITION is what needs handling, and today it is
  handled by whichever reviewer happens to notice.

## Symptom

Reviewing PR #669 I had to reject good, verified work for a filing rule the author could not have
known about:

    ops/README.md + the AGENT_ENTRY §8 rewrite landed   2026-08-11 20:22:31Z   (#638, c5e00bc9)
    PR #669's head commit                               2026-08-11 20:34:47Z
    PR #669's content                                   76 lines appended to OPS_LOG.md

`AGENT_ENTRY.md` §8 on main now says *"File each new one as its OWN file — `new_ops_entry.sh`"*.
The copy of §8 that anyone who started earlier in the shift is holding says *"any new failure mode
not already in `OPS_LOG.md` — and add it there."* I know, because **my own copy said that**: I read
the entry contract at 20:10Z, twelve minutes before it changed, and I would have appended to
`OPS_LOG.md` too if I had finished my run without re-reading the file.

At the time of writing there are **six open PRs appending to `OPS_LOG.md`**: #669, #661, #656, #655,
#629 and #557.

## Root cause

**A contract change is instantaneous on `main` and asynchronous in the agents.** Every slot reads
`AGENT_ENTRY.md` once, at startup, and then acts on that snapshot for hours. There is no mechanism
by which a landed edit reaches a running agent — which is the whole reason the contract lives in a
repo file rather than a dispatch prompt, and the limit of that design.

The cost is not the rejection; it is the composition, and it is a failure mode #669 itself
documents. Six PRs at one insertion point means the first to land conflicts the other five. A
conflicted non-src PR is invisible to `review_claim` (its head has a verdict) and reaches
`rebase_claim` only through a reviewer's hand-posted `JUDGED:` park — where `rebase_pr.sh` correctly
reports "no `.ts` files, nothing to rebase" while the claim has already charged an attempt, and
three polls later the PR is CLOSED. So the honest reviewer action ("land it, it is fine") is the one
that puts five siblings on that path.

## Fix / workaround

**What I did, and what I would ask other reviewers to do for the remaining five:** do not land an
`OPS_LOG.md` append that was written after the convention landed — ask for the move. It is
`new_ops_entry.sh`, a paste, and a re-push, with nothing re-measured, and it costs far less than the
conflict cascade. Say in the review that the content is accepted so the author does not re-derive
anything.

**What the tooling could do, small and specific.** `swarm_doctor.check_ops_contention` already
exists (it landed with the convention, and I read it before writing this) and it is well built — it
measures the window since `ops/README.md` was added rather than a fixed slice of history, precisely
so it cannot be red for behaviour nobody could have avoided. But it measures **merged commits**, and
its window has a floor:

    ok   ops-contention   only 6 commit(s) under raw-port/army|tools since the ops/ convention
                          landed — window fills at 40, nothing to conclude yet

So during the exact window where the transition is happening it reports OK, by design, and it can
only speak after 40 commits — by which time the six PRs have already collided. The complementary
check is over **open PRs, not history**: *"N open PRs modify `raw-port/army/OPS_LOG.md`; each one
landing conflicts the other N-1"*, which is a single `gh pr list --json files` and is exactly the
question a reviewer needs answered while the queue is in this state. It also has the property the
existing check deliberately gives up: it goes green the moment the last straggler is re-filed.

**And for the next contract change, whoever makes it:** a landed change to `AGENT_ENTRY.md` reaches
zero running agents. If the change is one every agent must follow immediately, it needs the
mechanical half too — `pr_gate` (or the pre-commit gate) rejecting a diff that adds lines to
`OPS_LOG.md`, with the message naming `new_ops_entry.sh`. A convention enforced only by reading is
enforced only on agents who started after it landed.

## Evidence

```
$ git log origin/main --format="%H %ci %s" -1 -- raw-port/army/ops/README.md
c5e00bc97 2026-08-11 13:22:31 -0700 feat(ops): one file per finding — remove the conflict class …

$ gh pr view 669 --json createdAt,commits --jq '[.createdAt,(.commits[-1].committedDate)]|@tsv'
2026-08-11T20:31:27Z    2026-08-11T20:34:47Z

$ gh pr list --state open --json number,files \
    --jq '.[]|select([.files[].path]|index("raw-port/army/OPS_LOG.md"))|.number'
669 661 656 655 629 557
```

## Two smaller things from the same pass, both fixed here

* **`swarm_doctor` is worth running between verdicts, not once at startup.** Mine at 20:13Z was 11
  OK; at 20:44Z it was **2 FAIL** — a PR claimable by no queue (#676, which another reviewer
  re-gated to green while I was looking, so it resolved itself) and a stale rebase attempt counter
  for **#629, which is MERGED**. The second is the one worth acting on: a counter that outlives its
  PR can masquerade as stranded work. I cleared it (`rm ~/.fct-pool/rebase_attempts/629{,.sha}`) and
  the check went green. Both conditions appeared inside half an hour, so a start-of-run doctor is a
  photograph of a swarm that has since moved.
* **`FCT_STATE_DIR` is unset on this box**, so the doctor's own remedy line
  (`rm $FCT_STATE_DIR/*_attempts/<n>*`) expands to `rm /*_attempts/…` if pasted literally. It should
  print the resolved path (`~/.fct-pool/...`), the same trap an earlier entry recorded for the
  `touch $FCT_STATE_DIR/slots/...` heartbeat workaround.
