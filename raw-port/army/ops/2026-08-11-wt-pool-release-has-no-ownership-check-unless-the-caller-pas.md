# `wt_pool.sh release` has no ownership check unless the caller passes a tag it cannot know

- **reported** 2026-08-11 by reviewer 2
- **status** OPEN (hit live; nothing was lost this time, and the reason it was not is luck)

## Symptom

I ran, as a reviewer, on a slot I had **never acquired**:

    $ bash raw-port/army/tools/wt_pool.sh release /Users/vjeux/.fct-pool/wt/1
    released /Users/vjeux/.fct-pool/wt/1

`wt/1` was not mine. It was the disposable lease `pr_gate.sh` had taken for its own gate run
(`wt_pool: leased slot 1 -> /Users/vjeux/.fct-pool/wt/1 (gate/3dbf47d99f23)`), and `pr_gate` releases
that itself. My command reset the tree and `rm -rf`'d the lease directory anyway — and `released`,
rather than a refusal, is how I learned the guard had not fired. Two seconds later the pool showed

    slot 1: LEASED  gate/0856647573fb9b69915fe3f34e25b583c6f7bd2c 1786488312  (wt=yes)

a *different* gate holding the slot I had just freed. Whether my reset landed on the old holder or
the new one is not determinable after the fact, which is its own problem.

Nothing was lost: a `gate/<sha>` lease is disposable by design (#258) and its tree was clean. The
same keystroke against a worker's slot is OPS_LOG #240 verbatim — the incident where a reviewer's
late cleanup wiped worker 1's just-written `.ts` while `git status` stayed clean.

## Root cause

The ownership guard in `cmd_release` is **opt-in**, and its own comment says so:

    #   A caller that knows which tag it leased passes it here and gets refused when it no longer
    #   holds it. Callers that pass nothing behave exactly as before, so this is additive.
    if [ -n "$expect" ]; then ... fi

So `release <path>` — the form in HARNESS_LOOP, in REVIEWER_BRIEF, in DEP_WORKER_BRIEF and in every
worked example in this repo — performs **no ownership check at all**. What stands between it and a
peer's work is `wt_has_work`, which is a check on the *tree's content*, not on who owns it: a holder
whose tree is momentarily clean (a `gate/<sha>` lease, a worker between `reset` and its first write)
is unprotected, and `--force` skips even that.

Three things make the opt-in guard unusable in practice rather than merely optional. The first is
the one that matters, and it is not the one I originally filed:

1. **The documented-looking safe form does not arm the guard at all.** `cmd_release`'s positionals
   are `$1`=path, `$2`=force, `$3`=expect, so a tag passed as the SECOND argument lands in `$2` and
   `expect` stays empty. `release <wt> <tag>` therefore performs no ownership check — silently, with
   no warning, and printing `released` exactly as a matching tag would. **The check exists only on
   the `--force` path**: `release <wt> --force <tag>`. Anyone who passes a tag without `--force`
   believing they are protected is not, and the tool tells them nothing. (I did this on five
   releases this shift, and the first version of this entry documented it as the checked form —
   which is how a wrong line in an ops entry becomes the next agent's copy-paste.)
2. **The tool prints a tag it will not accept.** `wt_pool.sh:310` logs `gate/${sha:0:12}` while the
   holder file records the full 40-char tag and the comparison is literal, so the string the tool
   just showed you is refused. (Reported independently by reviewer 6 in the entry filed with PR
   #697; this is the same defect meeting the release path.) Real, and worth fixing — but note the
   order: widening the printed tag while the argument is still swallowed by `$2` would leave every
   careful caller unprotected *and* newly confident, because they would now be copying a tag that
   looks right into a slot that is never read.
3. **Nobody's habit supplies it.** The obvious release argument is the path, and the path is the
   only thing the brief asks for. I have been reviewing all shift and passed a tag for the first
   time *after* this happened.

`rebase_claim`/`rework_claim`/`review_claim` are having exactly this hole closed right now in PR
#649 (`a lease may only be released by the agent holding it`), whose comment says of the queue
leases: *"It is the same hole `wt_pool.sh release` had and closed."* It did not close it — it made
closing it the caller's option.

## Fix

* **Make it the default, not the argument.** `stamp_holder` already writes the holder; `FCT_AGENT_ID`
  is already exported by every agent and is already the key #649 uses for the queue leases. Record
  the agent id alongside the tag and refuse a release from a different id — fail OPEN on an unowned
  lease, exactly as #649 does, so pre-existing leases and unidentified callers still work.
* **Take the tag by NAME, not by position.** `release <wt> --expect <tag>` (and accept a bare tag in
  `$2` as well, since that is what everyone types). A value silently landing in the force slot is
  the whole reason three of us "passed a tag" and were never protected. Positional `[--force]
  [expect]` cannot be used correctly by anyone who has not read the function.
* **Print the command you will accept.** `acquire`/`acquire-at` should end with the literal
  `release` line, full tag included, instead of a truncated cosmetic one. This kills reviewer 6's
  finding and mine with one change — but do it *after* the argument is actually read, or it
  manufactures confidence without protection.
* Until then, in a brief: **never release a slot you did not acquire** — including one whose path
  you read out of another tool's log line, which is what I did. Passing a tag is NOT a substitute:
  it does nothing unless `--force` precedes it.

## Evidence

    # the guard, as it stands on main (raw-port/army/tools/wt_pool.sh)
    force="${2:-}"                        # second positional
    expect="${3:-}"                       # THIRD positional, optional
    if [ -n "$expect" ]; then ... fi      # -> no third argument, no check

    # mine, on a slot pr_gate owned
    $ wt_pool.sh release /Users/vjeux/.fct-pool/wt/1
    released /Users/vjeux/.fct-pool/wt/1          # not "slot 1 is held by ... — NOT resetting"

    # and the form that LOOKS checked and is not — a tag without --force lands in $2 (force),
    # so `expect` is empty and the comparison never runs. Four cases, one fake $HOME-scoped pool,
    # holder tag gate/5ca13cc1a376b2f0d1e5a7c9b34e8f210d6a4c88 (full 40 chars):
    release <wt> <WRONG tag>            -> released                                    # guard never ran
    release <wt> <CORRECT tag>          -> released                                    # also never ran
    release <wt> --force <WRONG tag>    -> slot 7 is held by 'gate/5ca1…', not 'gate/0000…' — NOT resetting
    release <wt> --force <CORRECT tag>  -> released

The first row is the proof: a deliberately WRONG tag still releases, resets the tree and `rm -rf`s
the lease. `released` after passing a tag is therefore not confirmation of anything.

(Measured by reviewer 1 during review of PR #727 and re-run independently by worker 4 against
`origin/main`'s `wt_pool.sh` before this line was written. The earlier version of this entry cited
`release <wt> gate/5ac63f0b…` -> `released` as the guard accepting a correct tag; it was a third
instance of the same bug.)
