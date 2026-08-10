#!/usr/bin/env python3
"""addonly_gate.py — refuse a change that DELETES an already-landed ported symbol.

WHY THIS EXISTS (it fired for real)
-----------------------------------
The porting rules say extending an existing class file is ADD-ONLY: you append your method, you
never regenerate the file. That was a convention with nothing enforcing it, and it failed in
production — worker-01, 2026-08-10:

    commit ef8ffc72 (HGRenderContext::GetComputeDevice) rewrote the whole file and deleted my
    landed IsGPU. I restored it additively in the same PR.

Two workers touched one class; the second regenerated the file from its own understanding and
silently dropped a method that was already merged on main. It was caught only because a human-ish
reviewer happened to notice. Nothing in G0-G5 looks for it: the file still typechecks, the new
method is a faithful transcription, and the gate has no notion of "main used to have more".

There is a related loss mode with the same signature: `wt_pool.sh acquire` will stack onto a stale
PR-less `port/<Class>` branch whose file predates landed methods, so simply committing there deletes
them.

WHAT THIS CHECKS
----------------
For every changed .ts under raw-port/src, compare the set of ported symbols in the BASE version
(origin/main) with the set in the WORKING version. Any symbol present in base and absent now is a
REGRESSION -> exit 2. Pure additions and body edits are fine.

A "ported symbol" is identified two ways, union'd (a file may use either convention):
  * an exported/class member declaration    `  foo(...)` / `export function foo(`
  * an @0xADDR provenance citation          the addresses are the ground truth this repo ports by

Addresses are the stronger signal: a method can be renamed legitimately, but a dropped @0xADDR means
a transcribed function is gone. Both are reported.

USAGE
    addonly_gate.py <file.ts> [more.ts ...]      # exit 0 ok, 2 regression, 3 usage
    addonly_gate.py --base <ref> <file.ts>       # compare against <ref> instead of origin/main

Wired into gate.sh as G6 so it runs on every worker commit and every reviewer pr_gate.
"""
import re, subprocess, sys, os

ADDR = re.compile(r'@0x([0-9a-fA-F]{4,})')
# a class-member or exported function declaration (deliberately loose; false members are harmless
# because we only ever compare base-vs-now on the SAME extractor)
MEMBER = re.compile(r'^\s{2,4}(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+|async\s+)*'
                    r'([A-Za-z_][A-Za-z0-9_]*)\s*(?:<[^>]*>)?\s*\(', re.M)
EXPORTFN = re.compile(r'^export\s+(?:async\s+)?function\s+([A-Za-z_][A-Za-z0-9_]*)', re.M)

SKIP_NAMES = {"if", "for", "while", "switch", "catch", "return", "constructor", "function"}


def symbols(text):
    addrs = {a.lower() for a in ADDR.findall(text)}
    names = {m for m in MEMBER.findall(text) if m not in SKIP_NAMES}
    names |= set(EXPORTFN.findall(text))
    return addrs, names


def base_version(path, base):
    """File content at <base>, or None when the file is new there."""
    rel = path
    try:
        top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True,
                             text=True, cwd=os.path.dirname(os.path.abspath(path)) or ".")
        root = top.stdout.strip()
        if root:
            rel = os.path.relpath(os.path.abspath(path), root)
        p = subprocess.run(["git", "show", f"{base}:{rel}"], capture_output=True, text=True,
                           cwd=root or None)
        return p.stdout if p.returncode == 0 else None
    except Exception:
        return None


def main():
    args = sys.argv[1:]
    base = "origin/main"
    if args and args[0] == "--base":
        if len(args) < 2: print("usage: addonly_gate.py [--base REF] <file.ts>...", file=sys.stderr); return 3
        base = args[1]; args = args[2:]
    files = [a for a in args if a.endswith(".ts")]
    if not files:
        print("  (addonly: no .ts files to check)")
        return 0

    bad = 0
    for f in files:
        if not os.path.exists(f):
            continue
        old = base_version(f, base)
        if old is None:
            print(f"  ok (new file): {os.path.basename(f)}")
            continue
        new = open(f, encoding="utf-8", errors="replace").read()
        o_addr, o_name = symbols(old)
        n_addr, n_name = symbols(new)
        lost_addr = sorted(o_addr - n_addr)
        lost_name = sorted(o_name - n_name)
        if lost_addr or lost_name:
            bad = 1
            print(f"  ADD-ONLY VIOLATION: {os.path.basename(f)}")
            if lost_addr:
                print(f"    dropped {len(lost_addr)} landed @0xADDR citation(s): "
                      + ", ".join("@0x" + a for a in lost_addr[:8])
                      + (" ..." if len(lost_addr) > 8 else ""))
            if lost_name:
                print(f"    dropped {len(lost_name)} declaration(s): "
                      + ", ".join(lost_name[:8]) + (" ..." if len(lost_name) > 8 else ""))
        else:
            print(f"  ok (add-only): {os.path.basename(f)} "
                  f"(+{len(n_addr - o_addr)} addr, +{len(n_name - o_name)} decl)")

    if bad:
        print()
        print("  This change REMOVES work that is already merged on " + base + ".")
        print("  Extending a class file is ADD-ONLY: `git show " + base + ":<path>` first, then APPEND.")
        print("  If you stacked on a stale PR-less port/<Class> branch, re-base on origin/main instead.")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
