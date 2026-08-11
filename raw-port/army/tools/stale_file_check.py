#!/usr/bin/env python3
"""stale_file_check.py — refuse to silently DELETE work that is on main, outside raw-port/src.

THE GAP THIS CLOSES
-------------------
`raw-port/src/**.ts` is protected three ways: G6 (add-only), `regression_check` (no dropped symbols)
and `dup_check`. **Every other file in the repo is protected by nothing.** Tools, gates, verifiers,
OPS_LOG — the machinery the swarm runs on — can be reverted by an ordinary, well-intentioned commit.

The mechanism is not a git conflict, which is why nothing catches it. An agent reads a tool, prepares
a fixed copy (often in /tmp, which the briefs recommend for other good reasons), and writes the WHOLE
FILE back. Git sees one clean modification. If a peer landed a different fix to that same file in the
meantime, the whole-file write deletes it, the merge is clean, the gate is green, and the loss
surfaces only when someone notices the behaviour is gone.

Measured 2026-08-11: two workers reworking one tool reverted each other's fixes, and one of them
reverted a swarm_doctor rework 40 minutes after it was pushed. Both were doing exactly what they were
asked to do.

WHAT IT MEASURES, AND WHY THE FIRST VERSION MEASURED THE WRONG THING
--------------------------------------------------------------------
The first version of this file asked *"did main gain commits on this file after I forked, and am I
missing their lines?"* Reviewer 2 measured that and it is **inverted** — it passed the incident it
was written for and rejected changes that provably delete nothing:

  * the incident's branch is based on a main that ALREADY CONTAINS the peer's fix, so that commit is
    an ancestor of the merge base, `git log mb..base -- path` is empty, and the file was skipped.
    The fresher the branch, the blinder the check — and fresh is the normal case;
  * a stale branch that only APPENDS was rejected, because "my branch does not contain main's newer
    lines" is a TWO-dot fact about staleness, not a THREE-dot fact about what a merge deletes. A line
    main gained after the fork point is on neither side of the merge base, so a merge cannot remove
    it. Ten of the fifteen open non-src PRs failed that way, two of them pure `+119/-0` and `+596/-0`
    appends.

So this version asks the question G6 already asks about `raw-port/src`, which is the only one that
matters and is independent of when you forked:

    **does the delta a merge would apply REMOVE lines that are on main right now?**

    removed  = lines whose count drops from the MERGE BASE blob to the HEAD blob   (three dots:
               exactly what a merge applies)
    loss     = those of them that are still present in main's CURRENT blob         (if main already
               deleted the line, your merge removes nothing)

Counting multisets rather than diff hunks means a pure MOVE of a line inside a file is not a loss,
and a file deletion is correctly the loss of every line in it.

AN INSERTION IS NOT A DELETION (the second thing this got wrong)
-----------------------------------------------------------------
Git reports an edit INSIDE a line as one `-` and one `+`, so the first version of the rule above
charged every in-place edit as deleting a peer's landed line. That is not a corner case here: the
two edits this repo REQUIRES of any swarm-level fix — registering a name in `swarm_doctor.py`'s
`CHECKS` list, and extending `prove_all.py`'s `return ok and ok2 and …` chain — are both insertions
into one line. Measured on the live queue: 8 of 24 open PRs red, two of them APPROVED and waiting to
land, and the remedy the guard offered was a `reverts-ok:` on the two hottest shared files in the
tree, i.e. a standing waiver exactly where the guard should be strong.

So a removed line is NOT a loss when every one of its tokens still appears, IN ORDER, in one line
the same change adds — or in a run of adjacent added lines, for an insertion that wrapped
(`survives_in_added`). Order is the discriminator: without it, a large rewrite clears a real revert
by scattering its tokens. The shrink direction stays a loss too: `foo(); bar();` cut down to
`foo();` drops a token and is still reported.

INTENT IS NOT MECHANICALLY DECIDABLE — SO THE AUTHOR ACKNOWLEDGES
------------------------------------------------------------------
Plenty of honest changes delete on purpose (removing a condition, replacing an `echo`). No test
separates an intended deletion from an accidental one, and a guard that hard-fails ten honest PRs is
switched off within the hour and then protects nothing. So this reports the exact lines the merge
would remove, and asks the author to say they meant it — in the commit message:

    reverts-ok: raw-port/army/tools/pr_gate.sh      # this path only
    reverts-ok: all                                 # every path in this change

(`#` in front is fine; any commit in BASE..HEAD counts.) Locally you can pass `--ack <path>` or
`--ack-all` instead. Unacknowledged deletions are exit 2; acknowledged ones print and pass, so the
record still names what went and who is answerable for it.

    python3 raw-port/army/tools/stale_file_check.py <BASE> <HEAD> [--ack PATH]... [--ack-all]
                                                    [--no-blame] [paths...]

EXIT: 0 clean or acknowledged · 2 unacknowledged deletion of work on main · 1 usage/setup error
"""
import re
import subprocess
import sys
from collections import Counter

SRC_PREFIX = "raw-port/src/"
ACK_RE = re.compile(r"^\s*#?\s*reverts-ok:\s*(.+?)\s*$", re.IGNORECASE | re.MULTILINE)
MAX_REPORTED_LINES = 6
# Words, and each punctuation character on its own. Whitespace-splitting is too coarse
# (`[a,b]` -> `[a,c,b]` changes every token); raw substrings are too coarse the other way.
TOKEN_RE = re.compile(r"\w+|[^\w\s]")


def git(*args):
    return subprocess.run(["git"] + list(args), capture_output=True, text=True)


def blob_lines(rev, path):
    """The file's lines at <rev>, or [] when it does not exist there."""
    r = git("show", f"{rev}:{path}")
    if r.returncode != 0:
        return []
    return r.stdout.split("\n")


def acknowledged_paths(base, head, ack_flags, ack_all):
    """Paths the author has said they meant to delete from: --ack flags + commit-message tokens."""
    acks = set(ack_flags)
    if ack_all:
        acks.add("all")
    msgs = git("log", "--format=%B", f"{base}..{head}").stdout
    for m in ACK_RE.finditer(msgs):
        for tok in re.split(r"[,\s]+", m.group(1)):
            if tok:
                acks.add(tok)
    return acks


def is_subsequence(want, have):
    """Do all of `want`'s tokens appear in `have`, IN ORDER (insertions allowed between them)?"""
    it = iter(have)
    return all(tok in it for tok in want)


def added_runs(head_lines, added, max_run=3):
    """Token sequences of each added line, and of each run of up to `max_run` ADJACENT added lines.

    Runs exist for one reason: an insertion that makes a line too long is WRAPPED, so the edit
    arrives as one `-` and two `+`s. That is the shipped shape of the CHECKS registration this rule
    is built for (#719: `…check_layer_letters]` -> `…check_layer_letters,` + `check_orphan_drivers]`).
    Adjacency is in the HEAD file, so an unrelated added line elsewhere cannot join the run.
    """
    remaining = Counter(added)
    idx = []
    for i, l in enumerate(head_lines):
        if l.strip() and remaining[l] > 0:
            remaining[l] -= 1
            idx.append((i, TOKEN_RE.findall(l)))
    runs = []
    for a in range(len(idx)):
        seq = []
        for b in range(a, min(a + max_run, len(idx))):
            if b > a and idx[b][0] != idx[b - 1][0] + 1:
                break
            seq = seq + idx[b][1]
            runs.append(seq)
    return runs


def survives_in_added(runs, line):
    """Does this removed line survive, in full and IN ORDER, inside what the change ADDS?

    Reviewer 6's discriminator, and the reason it exists: as a hard gate, the previous version
    reddened the two edits this repo REQUIRES of every swarm-level fix — registering a name in
    `swarm_doctor.py`'s CHECKS list, and extending `prove_all.py`'s `return ok and ok2 and …`
    chain. Both are INSERTIONS into one line, which git reports as one `-` and one `+`, and the `-`
    was charged as deleting a peer's landed line. Measured on the live queue at the time: 8 of 24
    open PRs red, two of them APPROVED and waiting to land, and the remedy the guard prescribed was
    a `reverts-ok:` on the two hottest shared files in the tree — a standing blanket waiver exactly
    where the guard is supposed to be strong.

    The rule: **a removed line loses nothing if every one of its tokens still appears, IN ORDER, in
    one line this change adds** (or in a run of adjacent added lines, for an insertion that wrapped).

      - `… and ok11`                        -> `… and ok11 and ok12`                    survives
      - `check_leases, check_heartbeats,`   -> `check_leases, check_no_dl, check_heart…` survives
      - `…check_layer_letters]`             -> `…check_layer_letters,` + `check_new]`    survives
      - `foo(); bar();`                     -> `foo();`                                  LOST (bar)
      - a whole-file write over a peer's fix: its tokens are in no added line            LOST

    ORDER is what makes this safe, and it is not decoration — it is the whole discriminator, so it
    has its own case (L). Ask only "do the tokens appear SOMEWHERE in what I added" and a large
    rewrite clears a real revert by coincidence: measured on the shape that landed today, a rework
    wraps a `gh api` call in a retry loop from a stale copy and drops the peer's
    `[ -n "$rej" ] && [ "$rej" != "null" ] && break` guard, while the loop it adds spends every one
    of those tokens across its own lines — unordered says `no line that is on main`, exit 0, GREEN,
    on the exact incident this file exists to catch. In order, the `break` lands before the `null`
    test instead of after it and the line is correctly reported. A false positive costs a look; a
    false negative costs the work.
    """
    t = line.strip()
    if len(t) < 8:                     # a brace or a blank matches everything; say nothing
        return False
    want = TOKEN_RE.findall(t)
    return any(is_subsequence(want, r) for r in runs)


def rewritten_in_place(added_lines, line):
    """Is this removed line a partial rewrite rather than a clean drop?

    Only a LABEL, and only for lines that are still counted as losses. `survives_in_an_added_line`
    above clears the lines that provably keep every token; what is left here is the SHRINK
    direction — `foo(); bar();` shortened to `foo();` satisfies plain substring containment and IS
    a real loss — so the author still has to say they meant it. The label buys the reader the
    difference at a glance instead of opening the diff.
    """
    t = line.strip()
    if len(t) < 8:
        return False
    for a in added_lines:
        b = a.strip()
        if len(b) < 8:
            continue
        if t in b or b in t:           # either direction: text kept, or text kept and trimmed
            return True
    return False


def attribute(base, path, line):
    """Which commit put this line on main? Named so a revert can be judged, not just counted."""
    r = git("log", "-1", "--format=%h %an, %ar — %s", "-S", line, base, "--", path)
    out = r.stdout.strip().splitlines()
    return out[0][:100] if out else ""


def main(argv):
    ack_flags, ack_all, blame, pos = [], False, True, []
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--ack" and i + 1 < len(argv):
            ack_flags.append(argv[i + 1]); i += 2; continue
        if a == "--ack-all":
            ack_all = True; i += 1; continue
        if a == "--no-blame":
            blame = False; i += 1; continue
        if a.startswith("--"):
            # A flag-shaped typo must not become a PATH and quietly check nothing. This is the
            # third instance of an unparsed argument silently changing behaviour in one day
            # (`pr_review.sh` folding --expect-head into the review body; `gh --jq` swallowing
            # jq flags), so it exits 2 — the code the caller already treats as a hard failure —
            # rather than 1, which pr_gate.sh would let through.
            print(f"stale_file_check: unrecognised flag {a} — refusing to run rather than "
                  f"treating it as a path and checking nothing", file=sys.stderr)
            return 2
        pos.append(a); i += 1
    if len(pos) < 2:
        print("usage: stale_file_check.py <BASE> <HEAD> [--ack PATH]... [--ack-all] [--no-blame] [paths...]",
              file=sys.stderr)
        return 1
    base, head, paths = pos[0], pos[1], pos[2:]

    mb = git("merge-base", base, head).stdout.strip()
    if not mb:
        print(f"stale_file_check: cannot find a merge base for {base}..{head}", file=sys.stderr)
        return 1

    if not paths:
        # THREE dots: the delta a merge applies. Added files (A) cannot delete anything.
        r = git("diff", "--name-status", "--diff-filter=MDRT", f"{base}...{head}")
        for row in r.stdout.splitlines():
            cols = row.split("\t")
            if len(cols) >= 2:
                paths.append(cols[-1])

    # src/ is already covered by G6 + regression_check + dup_check; this is about everything else.
    paths = [p for p in paths if p and not p.startswith(SRC_PREFIX)]
    if not paths:
        print("stale_file_check: no non-src files changed -> PASS")
        return 0

    losses = []
    cleared = []      # (path, n) — lines charged by the old rule that provably lose nothing
    for p in paths:
        mb_c = Counter(l for l in blob_lines(mb, p) if l.strip())
        head_c = Counter(l for l in blob_lines(head, p) if l.strip())
        main_c = Counter(l for l in blob_lines(base, p) if l.strip())
        if not main_c:
            continue                      # not on main any more: nothing of main's to lose
        removed = mb_c - head_c           # what the merge applies as deletions (three dots)
        lost = removed & main_c           # ...of lines main still has
        added = list((head_c - mb_c).elements())
        # ...minus the ones that survive whole inside a line this change ADDS. An insertion into a
        # list or a chain reads to git as one `-` and one `+`; charging that as a deletion is what
        # made this guard red on the repo's own mandated edits (see survives_in_an_added_line).
        runs = added_runs(blob_lines(head, p), head_c - mb_c)
        rewrites = Counter({l: c for l, c in lost.items() if survives_in_added(runs, l)})
        lost = lost - rewrites
        n = sum(lost.values())
        if n:
            losses.append((p, n, list(lost.elements()), added, sum(rewrites.values())))
        elif rewrites:
            cleared.append((p, sum(rewrites.values())))

    if not losses:
        print(f"stale_file_check: {len(paths)} non-src file(s) checked, "
              f"the merge removes no line that is on main -> PASS")
        for p, k in cleared:
            print(f"  ({p}: {k} line(s) rewritten in place — every token survives in a line this "
                  f"change adds, so nothing is lost)")
        return 0

    acks = acknowledged_paths(base, head, ack_flags, ack_all)
    unacked = [x for x in losses if not ("all" in acks or x[0] in acks)]

    verdict = "REJECT" if unacked else "ACKNOWLEDGED"
    print(f"stale_file_check: {verdict} — this change removes lines that are on main.\n")
    for p, n, lines, added, nrew in losses:
        state = "acknowledged by the commit message" if ("all" in acks or p in acks) else "NOT acknowledged"
        rew = sum(1 for line in lines if rewritten_in_place(added, line))
        shape = f"{rew} rewritten in place, {n - rew} removed outright" if rew else "removed outright"
        print(f"  {p}: the merge deletes {n} line(s) main has  [{state}]  ({shape})")
        if nrew:
            print(f"      (plus {nrew} line(s) not counted: every token survives in a line this change adds)")
        for line in lines[:MAX_REPORTED_LINES]:
            tag = "rewritten" if rewritten_in_place(added, line) else "removed  "
            print(f"      - [{tag}] {line.strip()[:92]}")
            if blame:
                who = attribute(base, p, line)
                if who:
                    print(f"        landed by {who}")
        if n > MAX_REPORTED_LINES:
            print(f"      … and {n - MAX_REPORTED_LINES} more")
        print()

    if not unacked:
        # `reverts-ok: all` is the one spelling that switches the guard off without naming what it
        # covers — and naming what went is the docstring's whole justification for the hatch. So a
        # blanket acknowledgement prints the per-path bill it just paid, which is what the record
        # needs when someone reads this run six PRs later (reviewer 2's note on #600).
        if "all" in acks and not all(p in acks for p, _, _, _, _ in losses):
            total = sum(n for _, n, _, _, _ in losses)
            print(f"  NOTE: this PASS rests on a blanket `reverts-ok: all`, which covers "
                  f"{len(losses)} file(s) and {total} deleted line(s):")
            for p, n, _, _, _ in losses:
                print(f"      reverts-ok: {p}      # {n} line(s) — the per-path form the blanket replaced")
        print("  Every deletion above is declared in the commit message -> PASS")
        return 0

    print("  A whole-file write from a stale copy merges CLEANLY and gates GREEN — that is how a")
    print("  peer's landed fix disappears without anyone seeing an error. If you did not mean to")
    print("  remove these lines, reconcile against main's current copy:")
    print("      git fetch origin && git diff HEAD origin/main -- <file>")
    print("      # re-apply YOUR change on top of main's version, then re-run the gate")
    print("  If you DID mean it, say so in the commit message and this passes:")
    for p, _, _, _, _ in unacked:
        print(f"      reverts-ok: {p}")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
