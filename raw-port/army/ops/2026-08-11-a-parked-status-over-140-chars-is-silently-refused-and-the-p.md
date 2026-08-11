# A parked status over 140 characters is silently refused, and the PR stays invisible

**Reported 2026-08-11 by reviewer 6.** Hit live while parking PR #600.

`AGENT_ENTRY.md` §6b tells a reviewer to park a green-but-conflicted PR by hand-posting a status
whose description starts with `JUDGED:` and still matches `rebase_claim`'s grep, and every worked
example in this log is a full sentence: the wording has to carry the marker, the queue keyword, and
the *why*. **GitHub's commit-status `description` is capped at 140 characters**, and over it the
POST fails:

    gh_as.sh reviewer api -X POST repos/<slug>/statuses/<sha> -f state=failure \
      -f context=faithfulness-gate \
      -f description='JUDGED: regression (rebase needed): DIRTY on pr_gate/rework_claim/prove_all; content APPROVED by reviewer 6 — union rebase, keep both prove_all layers'
    {"message":"Validation Failed",
     "errors":"Validation failed: Description is too long (maximum is 140 characters)","status":"422"}

That description is 155 characters — the natural length for one that names the files, the verdict
and the remedy, which is exactly what §6b asks for.

**Why this is worse than an ordinary error.** The park is the ONLY thing that makes a conflicted
non-src PR visible to any queue (`pr_gate` posts `no raw-port/src ports to gate` SUCCESS on it, so
`rebase_claim` cannot see it and `review_claim` sees a fresh verdict). When the POST is refused, the
green status STAYS, and the PR is exactly as stranded as it was before the reviewer acted — while
the reviewer, having just posted a signed APPROVE in the same breath, believes they routed it. The
failure is loud only if you are reading stderr at that moment; I saw it because I had chained a
read-back into the same command, and the read-back is what showed the description still said
`no raw-port/src ports to gate (infra/tooling PR)`.

It is also a trap for the *careful* reviewer specifically: the more precisely you describe the
reason — which every entry in this log asks for — the more likely you cross 140.

**What I did:** shortened to 116 characters, keeping the marker and the queue keyword and dropping
the file list (which lives in the review body anyway):

    JUDGED: regression (rebase needed): DIRTY; content APPROVED by reviewer 6 — union rebase, keep both prove_all layers

**FIX,** in rough order of value:

1. Give the park a tool — `park_pr.sh <PR#> "<why>"` — that composes
   `JUDGED: regression (rebase needed): <why>`, truncates to 140 with an ellipsis, posts, and READS
   THE STATUS BACK to prove it landed. Every reviewer is hand-rolling this `gh api` line today, and
   a hand-rolled POST has no read-back.
2. Failing that, `AGENT_ENTRY.md` §6b should say "≤140 characters" beside the example, and the
   example itself should be a short one. The current examples are shorter than what a real reason
   needs, so they do not warn anybody.
3. Anywhere the swarm posts a status, check the response: `pr_gate.sh` builds descriptions
   programmatically (`7 G5 flag(s): reviewer must re-derive disasm, then rerun --reviewed` is 62,
   fine) but nothing stops a future reason string from growing past the cap and silently not
   posting at all — which for `pr_gate` would mean a PR with NO verdict, not merely a stale one.

## Smaller, same shape: the lease tag the pool PRINTS is not the tag it will ACCEPT

`wt_pool.sh acquire-at <SHA>` logs

    wt_pool: leased slot 8 -> /Users/vjeux/.fct-pool/wt/8 (gate/c6106d78f233)

— a TRUNCATED tag — but the holder file records the full `gate/<40-char sha>`, and the ownership
guard added by the release-ownership fix compares them literally. So a reviewer who releases with
the tag the tool just printed gets it REFUSED:

    wt_pool: slot 8 is held by 'gate/c6106d78f233c2efa9fb48f0c71d56c520406e52',
             not 'gate/c6106d78f233' — NOT resetting /Users/vjeux/.fct-pool/wt/8

I hit this twice in one shift and it is self-inflicted-looking both times: the refusal is correct,
the guard is doing its job, and the string I passed came from the tool's own output line. Cost is a
leaked pool slot for anyone who does not read the refusal (the #12 POOL_FULL endgame). FIX: print
the full tag in the lease line, or accept an unambiguous prefix, or — best — have `acquire`/
`acquire-at` print the exact `release` command it will accept. Note the guard is worth keeping
exactly as strict as it is; the defect is that the tool advertises a string it will reject.

## Two corroborations, not new findings

* The corp-TLS flake is frequent enough to plan for: three times in this shift a `gh` call failed
  with `tls: failed to verify certificate: x509: certificate signed by unknown authority` or
  `pr_review: cannot read head SHA`, and succeeded on an immediate retry. `pr_gate` handled its own
  instance correctly and conservatively — it printed
  `WITHHOLDING success on <sha> — could not read this PR's reviews` and posted nothing, which is the
  right behaviour and reads as alarming until you know it. A withheld status is the tool being
  careful; re-run it.
* The G5 `NO-DISASM` flag's printed address was wrong on **7 of 7** flags I cleared today (three of
  the seven named `0xca4c0`, which is a literal-pool DATA slot, not code at all). The existing entry
  says this happens; this is one more sample, and the recipe in it works: take the flagged EXPORT's
  own mangled symbol out of `army/inventory/<FW>.syms.txt` and derive that, never the printed
  address.
