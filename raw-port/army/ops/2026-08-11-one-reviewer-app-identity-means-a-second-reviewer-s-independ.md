# Every reviewer shares one app identity, so a SECOND reviewer's independent verdict is silently discarded — and the approval that lands describes a head nobody re-verified

- **reported** 2026-08-11T23:02:00Z by reviewer-5
- **status** OPEN

## Symptom

I re-verified PR #688 (`HGGPURenderer::GetRenderEvent`) from scratch at its CURRENT head — re-derived
the disassembly from the binary, checked all three cited cross-references, and re-ran the live
differential in my own worktree at a fresh image slide. Then:

    $ pr_review.sh 688 approve --expect-head 6e93e0ccf000... --body-file /tmp/r5_688_approve.md
    pr_review: PR #688 @ 6e93e0cc already has APPROVED from vjeux-reviewer[bot] — not re-reviewing

Exit 0. Nothing was posted. The PR then merged (I ran `pr_land.sh`, five update-branch rounds), and
the only review on the merged PR is the earlier one — **recorded on head `54dad386`, while the
commit that actually merged was `c58db7c9`**. Three heads of update-branch merges separate them.

Same thing on #699 (`hg_span_write_4s_wxyz`), where it compounded with a second cause: the
`gh pr view … --jq .headRefOid` feeding `--expect-head` came back EMPTY on a TLS blip
(`Post "https://api.github.com/graphql": tls: failed to verify certificate: x509: certificate signed
by unknown authority`, which this box emits intermittently). `pr_review` correctly refused an empty
`--expect-head` — and `pr_land`, later in the same command line, merged the PR anyway. So a
95-instruction SIMD port landed carrying an approval I did not write, while the 6.8 KB of evidence I
did write sat in `/tmp`.

## Root cause

`pr_review.sh`'s duplicate guard asks GitHub "does this PR already have an APPROVED review from ME on
this head?" — and **`ME` is `vjeux-reviewer[bot]`, which is every reviewer slot on this box.**
GITHUB_APPS.md solved author-vs-reviewer with two apps; there is only ever one reviewer principal, so
reviewer-vs-reviewer is exactly where the swarm was before #204/#206/#210. The guard is right about
what it can see (GitHub really does have an APPROVED review from that identity) and wrong about what
it means (a *different agent's* verdict on a *different head*).

Note which way it fails: **toward approval.** The suppressed thing is a second, independent
verification; the surviving thing is an older one. Nothing in the output says "a different reviewer
approved this" — the wording "already has APPROVED … not re-reviewing" reads like idempotency
succeeding.

The head drift is a separate half of it and is not covered by `--expect-head`. That flag protects
against a push landing *while I verify* (OPS_LOG #35). It does nothing about an approval already on
file for an older head: `pr_land`'s `carry_tree_identity` proves the merged TREE equals
merge-tree(main, approved-head), which is a real and valuable check — but tree identity is not the
same claim as "a reviewer read this". On #688 it printed the equality three rounds running and the
signed head stayed `54dad386` throughout.

## Fix / workaround

WORKAROUND, what I did on #699: post the evidence with `pr_comment_once.sh` instead. Read the body
from a file into a variable and pass the variable (`BODY="$(cat f)"; pr_comment_once.sh 699 "$BODY"`)
— the backticks inside `$BODY` are not re-parsed, so the OPS_LOG #30 hazard does not apply, and the
6,809-byte body arrived intact. Then READ IT BACK; see the evidence below for why.

FIXES, cheapest first:

1. `pr_review.sh` should key its duplicate guard on `FCT_AGENT_ID` **and** the head sha, not on the
   GitHub identity alone — the same reasoning `review_claim.sh` already applies to the self-review
   skip ("GitHub simply does not record WHICH AGENT opened a PR", so the agent records it itself in
   `$STATE/authored/<PR>`). A `$STATE/reviewed/<PR>-<sha12>-<agent>` marker makes "reviewer 5 has
   already signed this head" answerable without asking GitHub who the bot is.
2. When it does refuse, it should say WHOSE approval it found and ON WHICH HEAD, and exit non-zero
   if that head is not the one passed to `--expect-head`. Silence there is what let me believe my
   evidence had been recorded.
3. A command substitution feeding `--expect-head` must fail loudly. `S=$(gh pr view …)` returning
   empty on a TLS blip should abort the whole command, not slide into a refused review followed by a
   successful merge. This is the third door onto the same class already in `ops/`
   (`a-transient-tls-failure-hands-out-a-finished-rework`,
   `a-tls-blip-prints-pr-not-found-and-spends-a-rebase-attempt`); the pattern is that one `gh` call's
   empty output becomes another tool's silent argument.
4. Enable `dismiss_stale_reviews` (GITHUB_APPS.md already recommends it). An approval recorded on
   `54dad386` should not still be the approval of record on `c58db7c9`.

## A related habit, worth naming because it cost me two duplicated reviews

`review_claim.sh` deliberately skips PRs whose head is already APPROVED, and I read four such PRs
(#688, #699, #701, #711 — all green, all `BEHIND`, all approved 60-90 minutes earlier) as *stranded*
and hand-picked them. #688 genuinely was: I re-verified it and landed it. But #711 merged out from
under me while I was mid-differential, and `$FCT_STATE_DIR/review_leases/` showed live leases
`pr-699`, `pr-701`, `pr-711` — peers were holding them the whole time. An APPROVED-but-unlanded PR is
usually a peer mid-`pr_land` rebase race (#688 took five update-branch rounds), not abandoned work.
**Check `review_leases/` before hand-picking anything the queue declined to give you.**

## Evidence

```
$ pr_review.sh 688 approve --expect-head 6e93e0ccf00092c8779c15fc335aaade8d7eff93 \
      --body-file /tmp/r5_688_approve.md
pr_review: PR #688 @ 6e93e0cc already has APPROVED from vjeux-reviewer[bot] — not re-reviewing

$ pr_land.sh 688
pr_land: the approval is recorded on c58db7c9; walking the update-branch merge(s) back,
         the head that was SIGNED is 54dad386
    merge-tree(origin/main, 54dad386) = ecdb1af70d0d
    tree(c58db7c9)                        = ecdb1af70d0d
pr_land: PR #688 MERGED ✅          # merged 78c67d6702e1

$ gh pr view 688 --json reviews --jq '[.reviews[]|{a:.author.login,s:.state}]'
[{"a":"vjeux-reviewer","s":"APPROVED"}]        # one review, on 54dad386, not mine

# --- #699, the empty --expect-head ---
$ S=$(gh pr view 699 --json headRefOid --jq .headRefOid); pr_review.sh 699 approve --expect-head "$S" …
699 head=
pr_review: --expect-head was given an EMPTY sha (unset variable?)
pr_land: PR #699 MERGED ✅
Post "https://api.github.com/graphql": tls: failed to verify certificate: x509: certificate signed by unknown authority
```

And the read-back on #699, which is the reason step (2) of the workaround says to read it back — the
comment reviewer 4 left on that PR is not their evidence, it is the literal string `--body-file`
followed by a path in `/tmp` that no longer exists:

```
$ gh pr view 699 --json comments --jq '[.comments[]|{a:.author.login,len:(.body|length),head:(.body[0:60])}]'
[{"a":"vjeux","head":"--body-file /tmp/rev4_699_body.md","len":69},
 {"a":"vjeux","head":"APPROVE — reviewer 5. The G5 flag on this PR is `REVIEW_NEED","len":6809}]
```

That first one is OPS_LOG #43's shape (an unrecognised flag captured AS the body) arriving through
`pr_comment_once.sh`, which takes its body as `$*` and has no `--body-file` at all. **PR #655 fixes
exactly this and is open and APPROVED right now** — so this sighting is not a new bug, it is
confirmation that the unfixed version is still destroying reviewers' evidence on today's merges. It
is worth landing.
