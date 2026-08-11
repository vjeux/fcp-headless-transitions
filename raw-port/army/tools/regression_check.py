#!/usr/bin/env python3
"""regression_check.py — block stale-base FILE-LEVEL REGRESSIONS at merge time.

THE PROBLEM: a squash/3-way merge of a stale-base branch (GitHub's PR merge, screened by
pr_gate.sh before the required status goes green). A branch cut BEFORE a file landed treats
that file as a fresh "add"; if the branch's version is older/shorter than what is now on
origin/main, merge-tree merges it as an add with NO conflict — silently REPLACING a richer
landed file with a stubbier one. Reviewers caught these by hand (OZChannelBase dropping 5
methods, OZAudioMixer dropping initMixer+isPlaying, HGProfilerGuardMode0 dropping D2). Nothing
mechanical caught them. This does.

THE CHECK (per file that exists on BOTH origin/main and the branch): the branch's version must
retain EVERY symbol the main version has. "symbol" = union of:
  - cited mangled C++ symbols  (__Z...)  — each ported fn/method cites its @0xADDR + mangled
  - exported TS identifiers     (export function|class|const|interface|type|enum NAME)
If the branch DROPS any symbol main has -> REGRESSION -> exit 2 (block the merge). The fix is to
rebase the branch onto current origin/main (which is the correct thing to do anyway).

Bias: a false positive only blocks a merge (fix = rebase, always correct); a false negative
corrupts main. So we bias toward catching drops.

Usage: regression_check.py <mainRef> <branchRef> <path> [<path> ...]
       exit 0 = clean, exit 2 = regression (prints the dropped symbols), exit 0 for new files.
"""
import sys, re, subprocess

MANGLED = re.compile(r'__Z[A-Za-z0-9_$.]*[A-Za-z0-9_$]')   # may contain '.' (.cold/.eh/.1)
                                                          # but may NOT END on one: a token
                                                          # like `...D0Ev.` is a mangled name
                                                          # followed by a full stop in prose.
EXPORT  = re.compile(r'^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)', re.M)

def _show(ref, path):
    r = subprocess.run(["git","show",f"{ref}:{path}"], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None   # None = file absent at that ref

def symbols(text):
    if text is None: return None
    return set(MANGLED.findall(text)) | set(EXPORT.findall(text))

def main(argv):
    if len(argv) < 3:
        print("usage: regression_check.py <mainRef> <branchRef> <path> [...]", file=sys.stderr); return 1
    main_ref, br_ref, paths = argv[0], argv[1], argv[2:]
    regressed = False
    for path in paths:
        m = _show(main_ref, path)
        if m is None:
            continue                       # file is NEW on the branch (not on main) — no regression possible
        b = _show(br_ref, path)
        if b is None:
            # branch DELETES a file that exists on main -> definite regression
            print(f"  REGRESSION {path}: branch DELETES a file present on {main_ref}")
            regressed = True; continue
        dropped = symbols(m) - symbols(b)
        # ignore bare-mangled tokens that are substrings of a retained longer symbol (ICF/thunk noise)
        bset = symbols(b)
        dropped = {s for s in dropped if not any(s in x for x in bset if x != s)}
        if dropped:
            regressed = True
            print(f"  REGRESSION {path}: branch DROPS {len(dropped)} symbol(s) present on {main_ref}:")
            for s in sorted(dropped)[:15]:
                print(f"      - {s}")
            if len(dropped) > 15: print(f"      … +{len(dropped)-15} more")
    return 2 if regressed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
