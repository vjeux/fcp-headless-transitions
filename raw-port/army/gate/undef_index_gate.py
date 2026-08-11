#!/usr/bin/env python3
"""undef_index_gate.py — G7: flag NEW non-null-asserted table reads (the silent-wrong-answer class).

WHY THIS EXISTS
---------------
PR #154 (`HGFormatUtils::RGBtoRGBA`) passed EVERY mechanical gate — G1 provenance, G2 typecheck,
G5 semantic completeness, dup, regression — and was still wrong. It returned 24 where live FCP
returns 232. Only a differential oracle against the running app caught it, and only because a
reviewer went looking.

The mechanism is specific to porting C++ into TypeScript, and it will recur:

    // C++: an out-of-range index reads garbage; the port faithfully models the mod-64 aliasing
    // that lets fmt >= 64 reach the table at all.
    const sel = FORMAT_INFOS_COMPONENT_SEL[s]!;   // s=232 -> undefined
    return (sel - 1) & 0xffffffff;                // undefined-1 = NaN;  NaN & mask = 0  -> "24"

`undefined - 1` is `NaN`, and `NaN & 0xffffffff` is **0** — so the port silently produces a
plausible-looking wrong number instead of failing. Nothing throws, nothing typechecks wrong, and
G5's reachability fuzz sees no incompleteness throw because there is no throw at all. The `!`
non-null assertion is the tell: it asserts to the compiler exactly the thing that is false at
runtime.

WHAT THIS DOES (and deliberately does not do)
---------------------------------------------
Flags every NEWLY ADDED line that reads an array/table at a COMPUTED index with a `!` assertion and
no visible bounds check. It reports FLAGs, not rejections:

  * There are already ~68 such sites in landed code; most are probably fine (the index is bounded by
    a mask or a prior guard). A blocking gate would stop the swarm to relitigate all of them.
  * FLAGs are not free-passes: pr_gate.sh holds the faithfulness-gate status at FAILURE while any
    flag stands, so a reviewer must re-derive and clear it. That is exactly the attention this class
    needs — a human-grade check of "can this index actually go out of range, and what does the
    machine do when it does?"
  * Only ADDED lines are considered, so a PR is never punished for pre-existing sites.

USAGE
    undef_index_gate.py [--base REF] <file.ts> ...     # always exit 0; prints "  FLAG: ..." lines
"""
import os, re, subprocess, sys

# ident[ ...expr... ]!   where the index is not a plain integer literal
# `]!` must be ADJACENT and not the start of a comparison. The first version allowed whitespace
# before `!` and did not exclude `!=`, so `buf[i] !== other[i]` — the byte-compare idiom that
# transcriptions use constantly — was read as a non-null assertion `buf[i]!`. That is not
# cosmetic: pr_gate holds faithfulness-gate at FAILURE while a flag stands, so my own gate was
# mechanically blocking correct ports (worker-01 hit it on its first unit).
IDX_BANG = re.compile(r'([A-Za-z_$][\w$.]*)\s*\[\s*([^\]]+?)\s*\]!(?!=)')
LITERAL = re.compile(r'^(?:0[xX][0-9a-fA-F]+|\d+)$')
# a bounds check mentioning .length, a clamp, or an explicit range throw on the same/near line
GUARDY = re.compile(r'\.length|\bMath\.min\b|\bMath\.max\b|\bclamp\b|throw\b|\?\?')


def added_lines(path, base):
    """(lineno, text) for lines this change ADDS relative to base. Whole file when new/untracked."""
    root = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                          cwd=os.path.dirname(os.path.abspath(path)) or ".").stdout.strip()
    rel = os.path.relpath(os.path.abspath(path), root) if root else path
    d = subprocess.run(["git", "diff", "-U0", base, "--", rel], capture_output=True, text=True,
                       cwd=root or None)
    if d.returncode != 0 or not d.stdout.strip():
        exists = subprocess.run(["git", "cat-file", "-e", f"{base}:{rel}"],
                                capture_output=True, cwd=root or None).returncode == 0
        if exists:
            return []
        try:
            return list(enumerate(open(path, encoding="utf-8", errors="replace").read().splitlines(), 1))
        except OSError:
            return []
    out, ln = [], 0
    for line in d.stdout.splitlines():
        if line.startswith("@@"):
            m = re.search(r'\+(\d+)', line)
            ln = int(m.group(1)) if m else 0
            continue
        if line.startswith("+") and not line.startswith("+++"):
            out.append((ln, line[1:]))
            ln += 1
    return out


def main():
    args = sys.argv[1:]
    base = "origin/main"
    if args and args[0] == "--base":
        base, args = args[1], args[2:]
    files = [a for a in args if a.endswith(".ts")]
    flags = 0
    for f in files:
        if not os.path.exists(f):
            continue
        for lineno, text in added_lines(f, base):
            s = text.strip()
            if s.startswith("*") or s.startswith("//"):
                continue          # provenance comments quote disasm; not code
            for m in IDX_BANG.finditer(text):
                table, idx = m.group(1), m.group(2).strip()
                if LITERAL.match(idx):
                    continue      # constant index into a fixed table is fine
                if GUARDY.search(text):
                    continue      # a bounds check / clamp / ?? fallback is visible right here
                flags += 1
                print(f"  FLAG: {os.path.basename(f)}:{lineno} non-null-asserted table read "
                      f"`{table}[{idx}]!` — if the index can go out of range, TS yields undefined and "
                      f"arithmetic silently becomes NaN -> 0 (the #154 RGBtoRGBA class: returned 24 "
                      f"where live FCP returns 232). Reviewer: prove the index is in range, or make "
                      f"the out-of-range path match the machine.")
    if flags:
        print(f"\nundef_index_gate: {flags} flag(s) — reviewer must clear (not a mechanical reject)")
    else:
        print("  (no new non-null-asserted computed table reads)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
