#!/usr/bin/env python3
"""stale_file_check.py — reject a non-src change that DELETES work already on main.

WHAT THIS IS, AFTER BEING WRONG ONCE
------------------------------------
`raw-port/src/**.ts` is guarded three ways (G6 add-only, regression_check, dup_check). Every other
file — tools, gates, verifiers, OPS_LOG — is guarded by nothing, and a peer's landed tool fix has
twice been reverted by an ordinary commit. This closes that gap, using G6's discriminator.

THE FIRST VERSION OF THIS FILE WAS INVERTED, and the reason is worth keeping. It asked "did main
gain lines on this file that my branch's copy lacks?" — which is true of every honest branch that
simply forked before those lines landed, and git's three-way merge preserves them anyway. Measured
by reviewer 2 on the live queue: it would have rejected 10 of 15 open non-src PRs, including pure
`+119/-0` and `+596/-0` appends, while PASSING the exact incident it was written for.

The correct question is the one G6 already asks about src: **what does the merge actually APPLY?**
That is the three-dot delta (`main...HEAD`). A branch that merges cleanly and deletes nothing shows
no `-` lines there, no matter how old its base. A branch that would remove landed work shows them —
which is exactly what a force-pushed stale rebase produces, the real shape of both incidents.

    python3 raw-port/army/tools/stale_file_check.py <BASE> <HEAD> [paths...]

EXIT: 0 clean · 2 the change deletes landed work · 1 usage error
"""
import subprocess
import sys


def git(*a):
    return subprocess.run(["git"] + list(a), capture_output=True, text=True)


def main(argv):
    if len(argv) < 2:
        print("usage: stale_file_check.py <BASE> <HEAD> [paths...]", file=sys.stderr)
        return 1
    base, head, paths = argv[0], argv[1], argv[2:]
    if not paths:
        paths = [p for p in git("diff", "--name-only", f"{base}...{head}").stdout.split() if p]
    paths = [p for p in paths if not p.startswith("raw-port/src/")]   # src is already covered
    if not paths:
        print("stale_file_check: no non-src files changed -> PASS")
        return 0

    offenders = []
    for p in paths:
        # THREE dots: what the merge applies, relative to the merge base. Two dots would report
        # every line main gained since the fork as a "deletion" — the inversion described above.
        d = git("diff", f"{base}...{head}", "--", p).stdout
        dels = [l[1:] for l in d.splitlines()
                if l.startswith("-") and not l.startswith("---") and len(l.strip()) > 12]
        if dels:
            offenders.append((p, dels))

    if not offenders:
        print(f"stale_file_check: {len(paths)} non-src file(s), no deletions in the merge -> PASS")
        return 0

    print("stale_file_check: REJECT — this change DELETES lines that are on main.\n")
    for p, dels in offenders:
        print(f"  {p}: removes {len(dels)} line(s), e.g.")
        for x in dels[:3]:
            print(f"      - {x.strip()[:110]}")
    print("\n  If the deletion is deliberate, say so in the PR body and a reviewer can override.")
    print("  If it is not, you are almost certainly writing a whole file back from a stale copy:")
    print("      git fetch origin && git diff HEAD origin/main -- <file>")
    print("      # re-apply your change on top of main's current version, then re-gate")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
