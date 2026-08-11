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

So this version asks the only question that matters, and it is directly observable and independent of
when you forked:

    **does the delta a merge would apply REMOVE lines that are on main right now?**

    removed  = lines whose count drops from the MERGE BASE blob to the HEAD blob   (three dots:
               exactly what a merge applies)
    loss     = those of them that are still present in main's CURRENT blob         (if main already
               deleted the line, your merge removes nothing)

Counting multisets rather than diff hunks means a pure MOVE of a line inside a file is not a loss,
and a file deletion is correctly the loss of every line in it.

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
            print(f"stale_file_check: unknown flag {a}", file=sys.stderr)
            return 1
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
    for p in paths:
        mb_c = Counter(l for l in blob_lines(mb, p) if l.strip())
        head_c = Counter(l for l in blob_lines(head, p) if l.strip())
        main_c = Counter(l for l in blob_lines(base, p) if l.strip())
        if not main_c:
            continue                      # not on main any more: nothing of main's to lose
        removed = mb_c - head_c           # what the merge applies as deletions (three dots)
        lost = removed & main_c           # ...of lines main still has
        n = sum(lost.values())
        if n:
            losses.append((p, n, list(lost.elements())))

    if not losses:
        print(f"stale_file_check: {len(paths)} non-src file(s) checked, "
              f"the merge removes no line that is on main -> PASS")
        return 0

    acks = acknowledged_paths(base, head, ack_flags, ack_all)
    unacked = [x for x in losses if not ("all" in acks or x[0] in acks)]

    verdict = "REJECT" if unacked else "ACKNOWLEDGED"
    print(f"stale_file_check: {verdict} — this change removes lines that are on main.\n")
    for p, n, lines in losses:
        state = "acknowledged by the commit message" if ("all" in acks or p in acks) else "NOT acknowledged"
        print(f"  {p}: the merge deletes {n} line(s) main has  [{state}]")
        for line in lines[:MAX_REPORTED_LINES]:
            print(f"      - {line.strip()[:104]}")
            if blame:
                who = attribute(base, p, line)
                if who:
                    print(f"        landed by {who}")
        if n > MAX_REPORTED_LINES:
            print(f"      … and {n - MAX_REPORTED_LINES} more")
        print()

    if not unacked:
        print("  Every deletion above is declared in the commit message -> PASS")
        return 0

    print("  A whole-file write from a stale copy merges CLEANLY and gates GREEN — that is how a")
    print("  peer's landed fix disappears without anyone seeing an error. If you did not mean to")
    print("  remove these lines, reconcile against main's current copy:")
    print("      git fetch origin && git diff HEAD origin/main -- <file>")
    print("      # re-apply YOUR change on top of main's version, then re-run the gate")
    print("  If you DID mean it, say so in the commit message and this passes:")
    for p, _, _ in unacked:
        print(f"      reverts-ok: {p}")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
