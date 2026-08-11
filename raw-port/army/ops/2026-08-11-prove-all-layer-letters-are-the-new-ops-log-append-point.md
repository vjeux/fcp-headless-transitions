# prove_all's layer letters are the new OPS_LOG append point

- **reported** 2026-08-11T20:56:00Z by reviewer-4
- **status** OPEN (a detection check lands with this entry; the naming scheme itself is unfixed)

## Symptom

**One PR needed three different layer letters in one hour, and each collision cost a full reviewer
round.** PR #650 adds a `prove_all.py` layer. I reviewed and approved it three times today:

    20:35  head de52eccf  labelled LAYER 2i   -> main had landed its own 2i (queue coverage)
                                                 while the branch waited. Parked for rebase.
    20:46  head 804614e7  renumbered to 2j    -> verified the rebase, approved it, ran prove_all
                                                 (5m48s, PASS), went to land it...
    20:54  ...and in those eight minutes main landed #670, which took **2j**
                                                 (`a PR's base must be main`). Parked again: 2k.

`pr_land` refused correctly both times (`main and the approved commit 804614e7 CONFLICT — NOT
carrying`), so nothing bad merged. The cost is the loop: gate, re-verify the contribution, re-sign,
re-park, and a worker rebase in between, twice, for a change nobody disagreed with.

This is worker 2's `OPS_LOG.md` finding — *"every pair of ops reports conflicted by construction,
because the two sides are ADJACENT APPENDS"* — arriving in a second file. `raw-port/army/ops/`
(#638, landed today) removed the class for FINDINGS. Nothing removed it for GUARDS, and guards are
what this swarm has been producing all day: main's layer list went `2h` -> `2i` -> `2j` in about
ninety minutes, and there are at least two more in flight (#655's suite wants a letter too).

## Root cause

Every new suite is wired by appending three things to one function in one file:

    r9  = run([...])                      # a hand-numbered variable
    ok9 = "..." in r9.stdout              # a hand-numbered flag
    print("LAYER 2i (...)")               # a hand-chosen letter
    return ok and ok2 and ... and ok9     # ONE line every layer must edit

The `return` line is the serialisation point — two PRs cannot both extend it without conflicting —
and the letter is a hand-picked label with no allocator, so two authors pick the same one while
neither can see the other's branch. The three-dot diff looks clean on both sides right up to the
merge, which is why the collision is only ever discovered at rebase time.

Worse than a conflict: the tempting resolution is wrong. "Take mine" on that hunk **reverts the
peer's landed layer** — the file still parses, `bash -n`'s equivalent is silent, the suite still
passes with a layer missing, and G6 add-only cannot see it because it only inspects the `.ts` file
handed to `gate.sh`. Both of my parks on #650 had to spell out "keep main's 2i, renumber yours,
and-on the flag rather than replacing the return line", and the worker got it exactly right — but
that instruction should not have to be written by a reviewer.

## Fix

**Landed with this entry (detection only):** `swarm_doctor.py` gains `layer-letters`, which reads
`prove_all.py` from `origin/main` and FAILs if any `LAYER <n><letter>` label appears twice. It is
the check AGENT_ENTRY §7b asks for — the one that turns this collision from a reviewer's afternoon
into a line in the doctor's report — and it FAILs against a deliberately duplicated letter and
passes against main as it stands.

**Not fixed, and the real fix:** stop hand-numbering. Either

* discover suites from a directory (`verifier/layers/*.sh|*.py`), run them in sorted order and
  print each one's own name, so adding a suite is adding a FILE and two authors touch two paths —
  the same move `ops/` just made for findings; or
* keep the explicit list but make it a **list**: `LAYERS = [(name, cmd), ...]` and
  `all(run_layer(*l) for l in LAYERS)`, so a new entry is one line appended to a list literal and
  the `return` line never changes. That does not remove the conflict, but it removes the
  *dangerous* half — a take-mine on a list literal drops a line visibly, where a take-mine on
  `return ok and ... and ok9` silently drops a layer.

Letters are worth abandoning either way: they carry no information, they are allocated by hand, and
`2i` has now meant two different suites on two different heads within one hour.

## Evidence

    # main's letters moved twice while one PR waited
    20:35  git show origin/main:raw-port/army/verifier/prove_all.py | grep -o 'LAYER 2[a-z]' | sort -u
           2b 2c 2d 2e 2f 2g 2h 2i
    20:54  same command
           2b 2c 2d 2e 2f 2g 2h 2i 2j        # 2j taken by #670 in the interval

    # the refusal that caught it (correct behaviour, quoted so nobody "fixes" it)
    $ bash raw-port/army/tools/pr_land.sh 650
    pr_land round 1: state=OPEN mergeState=DIRTY
      carry: main and the approved commit 804614e7 CONFLICT — NOT carrying
    pr_land: REFUSING to merge PR #650 — the approval does NOT cover the merged content.

    # the new check, all four branches watched (a guard is not evidence until you have watched it
    # fail — and watching it PASS is how I caught it failing against a healthy main, below)
    main as it stands                       ok      layer-letters  9 layer label(s), all distinct
    '2j' relabelled '2i' (the collision)    FAIL    layer-letters  duplicate prove_all LAYER
                                                    label(s): 2i (x2) — two suites are claiming
                                                    one letter; the second to land silently
                                                    replaces the first
    prove_all.py unreadable                 UNKNOWN could not read prove_all.py from origin/main
    labels renamed away                     UNKNOWN found no LAYER labels ... it is not evidence

**The first version of this check FAILed against a healthy main, and only running it caught that.**
My pattern made the letter optional (`LAYER (\d+[a-z]?)`), and `LAYER 3` is legitimately printed
TWICE on main — once as a heading before the per-fixture rows, once as its verdict — so the check
reported `duplicate ... 3 (x2)` against a tree with nothing wrong with it. That is precisely the
defect #638 was rejected for two hours ago (a red that correct behaviour cannot clear), reproduced
by me in the check I wrote to enforce the lesson. The letter is now mandatory in the pattern, with
the reason in the code. Worth adding to the standing rule: **watch a new check PASS on a healthy
input too — "it went red when I broke it" only covers one of the two ways to be wrong.**

## Two smaller things found in the same run

**1. `swarm_doctor`'s `tests-can-fail` FAIL message cannot name a case past `H`.** The message is
built from `l.strip().startswith(("A.", ..., "H."))` — a literal tuple that stops where main's
suite stopped. `test_guards` gained a case `J` today (#557). Replaying the doctor's own expression
against the real output of a mutant I ran:

    J-shaped failure -> 'guard suite FAILED: '                                    <- names nothing
    H-shaped control -> 'guard suite FAILED: H. pr_gate posted success when ...'

The doctor still goes red, so this is cosmetic in direction and not in cost: the one line an agent
reads names no case, for the suite that guards the only path in the swarm that merges without
re-gating. **Fixed in the same change** — the prefix test is now `re.match(r"^[A-Z]\. ", …)`, so the
next case is free. Same family as the entry above: a literal that has to be maintained in lockstep
with a list somewhere else.

**2. `pr_comment_once.sh --body-file` destroyed a reviewer's comment 15 minutes after that reviewer
reviewed the PR that fixes it.** Corroborating #655 (worker 7) from the other side, because a second
measurement is what turns an anecdote into a property, and because this one shows the hazard
surviving an agent who KNEW about it:

    $ bash raw-port/army/tools/pr_comment_once.sh 650 --body-file /tmp/r4_650_c2.txt
    pr_comment_once: posted to PR #650
    $ gh api repos/<slug>/issues/650/comments --jq '.[-1]|"len=\(.body|length)"'
    len=63                       # the file was 1,302 bytes
    # posted body:   --body-file /tmp/r4_650_c2.txt
    # dedup marker:  <!--rc:bodyfiletmpr4650c2txt-->     <- computed from the flag text

The content lost was the rebase instruction the next worker needs (which letter to renumber to).
**The recovery worth copying, because it beats delete-and-repost:** `PATCH` the comment in place —

    gh api -X PATCH repos/<slug>/issues/comments/<id> --field body=@/tmp/fixed.md

— which keeps the comment's position in the thread, keeps its permalink, and lets you append a short
note saying what happened instead of burying it. Recompute the `<!--rc:...-->` marker from the
INTENDED body when you do, or the tool's idempotence will not recognise its own comment later.

## Addendum, 21:18Z — a third and a fourth collision, both after this entry was written

The entry above was filed at 20:56Z on two collisions. Two more happened in the next twenty-two
minutes, so the rate is not an artefact of one bad afternoon:

* **#651 needed three letters too.** Reviewed at `3332cd72` as `2j` -> collided with main's `2j`
  (#670) -> parked -> a worker rebased it to `2k` -> I re-verified and re-signed at `aa652eaf`
  (`prove_all` PASS, `2i`/`2j`/`2k` all green) -> `pr_land` ran four rounds while **#650 merged at
  21:14:09Z carrying `2k`**, and refused: *"main and the approved commit CONFLICT — NOT carrying"*.
  It now needs `2l`. Two PRs, six approvals, four collisions, ninety minutes, and not one letter was
  wrong when it was chosen.
* **The letter that unblocked one PR is what blocked the other.** #650 and #651 were both told `2k`
  by two different reviews, correctly, because neither could see the other's branch. There is no
  advice that fixes this — an allocator with no allocator is the whole problem — which is why the
  fix section above is about removing the letter, not about choosing it more carefully.

`pr_land`'s tree-identity refusal is what kept all four of these honest, and it is worth saying
plainly since this entry is otherwise a complaint: **the guard works, it fired every time, and it
never once let an approval walk onto a merge it did not cover.** The cost is reviewer rounds, not
correctness.
