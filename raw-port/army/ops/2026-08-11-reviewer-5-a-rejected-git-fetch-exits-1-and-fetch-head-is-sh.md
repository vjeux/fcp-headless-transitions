# A rejected `git fetch` exits 1 — the `0` comes from the pipe; and `FETCH_HEAD` is a file every agent shares

**Reported 2026-08-11 by reviewer 5. Both measured on this box today, `git version 2.50.1 (Apple Git-155)`.**

Two ways a git read in the *canonical* checkout hands a reviewer the wrong commit. The first is a
correction to a claim currently in review; the second I hit myself and nearly reviewed the wrong
head over.

## 1. The non-fast-forward fetch DOES report failure — unless you pipe it

An open ops report (#661) states, in bold, that
`git fetch origin pull/<N>/head:pr<N>` refuses the update on a force-pushed PR and **exits 0**, and
concludes that *"`set -e`, `&&` chaining and any `if git fetch …` all read it as done"*. The
rejection is real; the exit status is not. With a local branch ref parked on a commit that is
genuinely not an ancestor:

    $ git fetch origin pull/647/head:rev5tmp_pr647probe
     ! [rejected]            refs/pull/647/head -> rev5tmp_pr647probe  (non-fast-forward)
    $ echo $?
    1

    same form with 2>/dev/null                      -> 1
    same form plus a SECOND, succeeding refspec     -> 1
    inside an && chain                              -> the chain STOPS
    with -f                                         -> + 8c9060d42...ada5b6b76 (forced update), 0

**Where the `0` comes from** — I reproduced it, on my own first attempt at measuring this:

    $ git fetch origin pull/647/head:rev5tmp_probe2 2>&1 | tail -1
     ! [rejected]            refs/pull/647/head -> rev5tmp_probe2  (non-fast-forward)
    $ echo $?
    0        <- tail's status, not git's

That is this repo's existing gate rule — *"check the exit status directly, never pipe a gate into
`tail`, because a pipeline returns `tail`'s status and a REJECT then looks like success"* — biting a
second tool. It is worth stating as the general form: **any command whose output an agent routes
through a pipe has no exit status as far as that agent is concerned.** Agents pipe constantly, to
keep tool output short.

So the hazard is real and the `-f` fix is right; the reason it hides is the pipe, not git. This
matters in the direction that removes a defence: an agent told that `set -e` cannot see a rejected
fetch will not bother adding the check that does work.

## 2. `FETCH_HEAD` in the canonical checkout is shared mutable state

Reviewing #647 I ran, in `~/random/final-cut-pro-transitions`:

    git fetch -q origin 23c36f05… && git rev-parse FETCH_HEAD
      305b120b…            <- NOT the SHA I had just fetched

`305b120b` is nothing to do with that PR. Re-running the fetch alone printed the right SHA. The
canonical checkout is shared by every agent on the box, and `pr_gate.sh`, `pr_land.sh`,
`pr_submit.sh` and `rebase_pr.sh` all run git against it constantly — `.git/FETCH_HEAD` is one file,
rewritten by whichever process fetched last. My `rev-parse` read a peer's fetch.

The failure direction is the expensive one: had I not checked, I would have read another PR's tree
and reviewed the wrong code, with every downstream command agreeing with me.

**Do not name `FETCH_HEAD` in a shared checkout.** Fetch the SHA and then verify the object itself:

    git fetch -q origin <sha> && git cat-file -t <sha>     # or: git rev-parse <sha>^{commit}

which is exact, is a no-op if a peer already fetched it, and cannot be written out from under you.
Better still, and what the reviewer flow already provides: read inside the worktree you leased with
`wt_pool.sh acquire-at <sha>` and print `git rev-parse HEAD` once — that ref is yours.
