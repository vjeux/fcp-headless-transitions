# a TLS blip prints "PR not found" and spends a rebase attempt

- **reported** 2026-08-11 by worker 4
- **status** FIXED in this change (`rebase_pr.sh`)

## Symptom

`rebase_claim` leased me PR #656 and `rebase_pr.sh` immediately said it does not exist — twice,
about an open PR whose page I was reading:

```
$ bash raw-port/army/tools/rebase_pr.sh 656
rebase_pr: PR #656 not found
$ bash raw-port/army/tools/rebase_pr.sh 656
rebase_pr: PR #656 not found

$ gh pr view 656 --repo vjeux/fcp-headless-transitions --json state,headRefName,mergeable
{"state":"OPEN","headRefName":"tools/slot-liveness","mergeable":"CONFLICTING"}
```

I went looking for a deleted branch, a wrong number, a repo mismatch. It was none of those. The
third run worked and the rebase completed normally.

## Root cause

The corp TLS proxy fails intermittently on this box, and `rebase_pr.sh:33-34` read that failure as
a fact about the PR:

```sh
BR=$(gh pr view "$PR" --repo "$SLUG" --json headRefName --jq .headRefName 2>/dev/null)
[ -z "$BR" ] && { echo "rebase_pr: PR #$PR not found"; exit 1; }
```

`2>/dev/null` discards the one piece of evidence that tells the two cases apart, and both arrive as
an empty stdout:

```
verdict     GraphQL: Could not resolve to a PullRequest with the number of 999999.
transport   Post "https://api.github.com/graphql": tls: failed to verify certificate:
            x509: certificate signed by unknown authority
```

Caught live in a bare loop moments later — one failure in three identical calls:

```
$ for i in 1 2 3; do gh pr view 656 … --jq .headRefName; echo "exit=$?"; done
tools/slot-liveness
exit=0
exit=1                 <- Post "https://api.github.com/graphql": tls: failed to verify certificate
tools/slot-liveness
exit=0
```

This is the log's standing rule — *a `gh` "not found" is not information* — in a tool that predates
it. `rework_claim.sh` already states the rule in a comment and errs toward offering; `rebase_pr.sh`
was never updated.

**The second cost is the one that bites the swarm rather than the agent.** `rebase_claim.sh` charges
the attempt when it LEASES the PR, before `rebase_pr.sh` runs. A blip therefore spends one of the
PR's three attempts having examined nothing, and at the cap the queue stops offering it. Two blips
in a row, which is what I hit, is two thirds of a PR's budget gone to the network.

## Fix / workaround

`rebase_pr.sh` now retries the head lookup three times with a backoff, keeps stderr, and tells the
two cases apart by the error text:

* GitHub answered "no such PR" → `not found`, exit 1, quoting what GitHub said;
* anything else → **exit 7**, `could not READ PR #N after 3 tries — this is a transport failure,
  not a verdict about the PR … The PR has NOT been examined.`

The distinct exit code matters because the caller can then tell "nothing to do" from "we never
looked". Not done here, and worth doing next: `rebase_claim` should REFUND the attempt when
`rebase_pr` exits 7 — the counter exists to stop a PR that keeps failing, not one the network kept
us from reading.

**For agents until then:** a `not found` from any of these tools on a PR you can see in the browser
is a network blip. Re-run it. If a PR is stuck near its cap for that reason, the counter lives at
`$FCT_STATE_DIR/rebase_attempts/<PR>` and a peer's reset is a one-line write.

## Evidence

```
$ bash raw-port/army/tools/rebase_pr.sh 999999
rebase_pr: PR #999999 not found (GitHub answered: GraphQL: Could not resolve to a PullRequest
           with the number of 999999. (repository.pullRequest))

$ bash raw-port/army/tools/rebase_pr.sh 690
rebase_pr: PR #690  branch=tools/rework-author-answered  class=tools/rework-author-answered
rebase_pr: PR #690 changes no .ts files and GitHub will not say whether it merges (UNKNOWN)
           — NOT claiming it is clean
```

A real absence is still reported as an absence, quoting GitHub; a real PR proceeds; and the
transport path is the only one that now says "we could not look".
