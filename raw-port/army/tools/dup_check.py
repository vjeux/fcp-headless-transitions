#!/usr/bin/env python3
"""dup_check.py — detect DUP-LEDGER branches at merge/review time (closes the "faithfulness != new
port" blind spot). A branch is a DUP if, for every changed .ts file that ALREADY EXISTS on main,
the branch adds ZERO new cited symbols beyond what main already has.

WHY: regression_check.py only catches DROPS (branch removes a symbol main has). It passes (exit 0) a
branch that merely RE-PORTS an already-landed symbol (same symbol set, cosmetically-different body) or
REWRITES a landed body (0 new symbols) — both are non-mergeable per the ADD-only rule, and reviewers
kept mis-ACCEPTing them (reviewer-136/140 self-corrected on convertFromS15Fixed16, applyHLG, PCMutex).
This catches them mechanically.

"symbol" = union of cited mangled C++ symbols (__Z...) and exported TS identifiers, IDENTICAL to
regression_check.py so the two agree on what a "symbol" is.

A branch is NEW (not a dup) iff it adds >=1 symbol to an existing file OR touches a file that does
not yet exist on main (a genuinely new class file). Otherwise it is a DUP.

Usage: dup_check.py <mainRef> <branchRef> <path> [<path> ...]
  exit 0 = at least one NEW symbol (or a new file) -> genuine port, mergeable
  exit 5 = DUP (0 new symbols across all pre-existing changed files) -> not a new port
  exit 1 = usage error
"""
import sys, re, subprocess

MANGLED = re.compile(r'__Z[A-Za-z0-9_$.]+')
EXPORT  = re.compile(r'^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)', re.M)

def _show(ref, path):
    r = subprocess.run(["git","show",f"{ref}:{path}"], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None   # None = file absent at that ref

def symbols(text):
    if text is None: return set()
    return set(MANGLED.findall(text)) | set(EXPORT.findall(text))

def main(argv):
    if len(argv) < 3:
        print("usage: dup_check.py <mainRef> <branchRef> <path> [...]", file=sys.stderr); return 1
    main_ref, br_ref, paths = argv[0], argv[1], argv[2:]
    total_new = 0
    saw_new_file = False
    per_file = []
    for path in paths:
        m = _show(main_ref, path)
        if m is None:
            saw_new_file = True
            per_file.append((path, "NEW-FILE", None))
            continue
        b = _show(br_ref, path)
        if b is None:
            per_file.append((path, "DELETES", None))
            continue
        new_syms = symbols(b) - symbols(m)
        total_new += len(new_syms)
        per_file.append((path, f"+{len(new_syms)} new", sorted(new_syms)[:6]))
    if saw_new_file or total_new > 0:
        return 0
    print(f"  DUP-LEDGER: branch {br_ref} adds 0 new cited symbols to files already on {main_ref}:")
    for path, tag, _ in per_file:
        print(f"      {tag}  {path}")
    print("  -> every cited symbol is already on main (re-port / body-rewrite). Not a new port; ADD-only violation.")
    return 5

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
