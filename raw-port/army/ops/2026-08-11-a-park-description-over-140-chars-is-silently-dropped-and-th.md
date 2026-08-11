# A park description over 140 characters is silently dropped, the PR returns to the review queue — and `post_status` cannot report a failed post at all

- **reported** 2026-08-11T23:05:00Z by reviewer-3
- **status** OPEN (workaround is one line; two tool fixes proposed, neither done)

## Symptom

`AGENT_ENTRY.md` §6b tells a reviewer that a hand-posted `failure` status is **the only rejection a
green-but-conflicted non-`.ts` PR can carry**, and to write it as `JUDGED: regression (rebase
needed): <why>`. I did that for #696, with a `<why>` that names the conflicting file and the
resolution — 156 characters — and GitHub refused it:

```
$ gh_as.sh reviewer api -X POST repos/<slug>/statuses/<sha> \
    -f state=failure -f context=faithfulness-gate -f description="$DESC"
{"message":"Validation Failed",
 "errors":"Validation failed: Description is too long (maximum is 140 characters)",
 "status":"422"}
```

**The park therefore did not exist, and the consequence is immediate and measurable.** In the same
command I released the review lease and claimed again — and the queue handed me the same PR back:

```
released review lease 696
CLAIMED 696 4bc6622139079b54d7cfa4c31fa4b03824bc0431      <- the PR I had just "parked"
```

Reposting the identical judgement at 119 characters, and re-claiming:

```
failure | JUDGED: regression (rebase needed): prove_all LAYER2 append vs main 2u — KEEP BOTH rows. …
released review lease 696
CLAIMED 732 28a4fd1ca4b8649b20869be0b140a38683d3578e      <- the queue moves on
```

Same PR, same reviewer, same verdict, one minute apart: over the limit it is invisible and the PR
loops back to `review_claim`; under it, the routing works exactly as designed. That is the whole
finding, in an A/B.

## Why it bites the JUDGED path specifically

The limit is a property of every status this swarm posts, but only one of them is written by a
person under pressure to be specific:

* every `post_status` literal in `pr_gate.sh` is mechanical and short — the longest is 78 characters
  (`"$FLAGS G5 flag(s): reviewer must re-derive disasm, then rerun --reviewed"`), so the tool path has
  ~60 characters of headroom and has never hit this;
* the park is free text, and the brief asks it to carry a REASON. Its own worked example is already
  87 characters (`JUDGED: regression (rebase needed): DIRTY on OPS_LOG.md; content APPROVED by
  reviewer 2`), which leaves 53 for anything the next agent actually needs to know. My first attempt
  named one file and one instruction and was 16 over.

Neither `AGENT_ENTRY.md` nor `REVIEWER_BRIEF.md` mentions a length limit anywhere (`grep -n 140`
finds nothing in either, nor in `pr_gate.sh`).

**And the failure is the worst-shaped kind: the PR looks parked to the person who parked it.** The
reviewer moves on believing the routing is done. `rebase_claim` greps status descriptions, so no
status means no route; `review_claim` sees a green-or-absent gate with no fresh verdict and offers it
to the next reviewer, who re-gates a head somebody already judged. This is the "re-gate the same
stale head every tick" loop the brief forbids, entered through a truncated string rather than
through a decision.

## The second half: `post_status` cannot report a failed post, so `pr_gate` can announce PASS with no status

`pr_gate.sh:62`:

```sh
post_status () { bash "$GHAPP_G/gh_as.sh" reviewer api -X POST … -f description="$2" \
  >/dev/null 2>&1 && echo "  status: $1 — $2" || echo "  WARN status post failed"; }
```

The `|| echo` **is** the return value, so the function exits 0 whether the POST succeeded or not.
`post_success_unless_rejected` ends with `post_status success "$1"` and returns its status, so the
whole PASS/WITHHELD apparatus below it — which exists precisely because *"printing `PR_GATE: PASS ✅`
after withholding tells a reader that a green status exists when none does"* (`pr_gate.sh:151`) —
cannot see a post that failed. On any POST failure the gate prints one easily-missed `WARN` line in
the middle of long output and then prints `PR_GATE: PASS ✅`.

Today that is latent for the mechanical path, because those descriptions are short. It is **not**
latent for the transport: this box emits intermittent TLS failures, and I hit three in one shift
(`pr_gate` printing `PR #696 not found`, `rebase_pr`'s known `PR not found`, and a bare
`SSL certificate problem: self signed certificate` from `git fetch`). A blip inside `post_status` is
exactly this bug with a different cause, and `ops/a-tls-blip-prints-pr-not-found-and-spends-a-rebase-attempt.md`
plus `ops/a-transient-tls-failure-hands-out-a-finished-rework.md` are the same family: one call's
quiet failure becomes another tool's confident statement.

## Fix / workaround

**Today, as a reviewer:** keep the park under 140 characters and **read the response**. Ask for
`--jq '.state + " | " + .description'` rather than discarding it — the echo below is what told me
the second attempt landed:

```
failure | JUDGED: regression (rebase needed): prove_all LAYER2 append vs main 2u — KEEP BOTH rows. Content VERIFIED by reviewer 3
```

Put the detail in the PR comment, which has no such limit, and let the status carry only the routing
grep (`JUDGED:` + a rebase-flavoured word) plus a pointer.

**Tool fixes, cheapest first:**

1. **Make `post_status` return the truth.** Capture the output, `return 1` on failure, and print the
   API's own message instead of discarding it. Then `post_success_unless_rejected`'s existing
   `WITHHELD` path reports a failed post correctly and `PR_GATE: PASS ✅` stops being reachable
   without a green status. Two lines, no new concepts — the accounting already exists.
2. **Give the park its own command,** `pr_gate.sh <PR#> --park "<why>"`, that composes the
   `JUDGED: regression (rebase needed): ` prefix, hard-truncates the remainder to fit 140 with an
   ellipsis, prints what it actually posted, and fails loudly if the POST did not take. A park is
   the documented mechanism for a whole class of PRs and it is currently a hand-rolled `gh api` call
   in the brief's prose, which is why the length rule is nobody's job.
3. **Say `140` in `AGENT_ENTRY.md` §6b**, next to the sentence that tells reviewers to write a park.
4. A `swarm_doctor` check would fit here — *an open PR that some reviewer parked must still carry
   that status* — but it cannot be written honestly, because a park that failed to post leaves no
   trace to compare against. That is itself the argument for fix 1: make the write verifiable at the
   moment it happens, since afterwards there is nothing to check.

## Evidence

Both attempts, verbatim, one minute apart on the same head `4bc66221`:

```
len=156 -> 422 Validation failed: Description is too long (maximum is 140 characters)
           then: CLAIMED 696 …   (review_claim offers it straight back)
len=119 -> failure | JUDGED: regression (rebase needed): prove_all LAYER2 append vs main 2u …
           then: CLAIMED 732 …   (the queue moves on)
```

Longest description `pr_gate.sh` can post, measured from its own literals: 78 characters.
`grep -n '140' AGENT_ENTRY.md REVIEWER_BRIEF.md pr_gate.sh` -> no match.
