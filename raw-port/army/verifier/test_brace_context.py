#!/usr/bin/env python3
"""test_brace_context.py — pin `strip_stubs._scan_brace_context` to the per-def originals.

`_scan_brace_context` answers "what is the brace depth here, and is the enclosing brace a class
body?" for every def in ONE linear pass. It replaced two functions that each re-walked the file from
character 0 per def — quadratic, and 95 of `mark_ported.py`'s 142 seconds. The originals remain in
the tree and remain the REFERENCE: this test asserts the fast path agrees with them exactly.

That matters because the answer decides whether a throw-only body demotes a ledger unit from
`ported` to `stub`. A drift here would move the project's headline number silently and in the
flattering direction, which is the whole failure class `mark_stub_bodies` exists to prevent.

Default run samples the corpus (fast enough for `prove_all`); `--full` checks every file — 1,651
files / 19,039 defs, ~4 minutes, dominated by the quadratic reference side.
"""
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
import strip_stubs as ss  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
SAMPLE = 60

# Hand-written cases for the shapes the batch scanner could plausibly get wrong: the object-literal
# and Proxy-handler methods that sit at depth 1 but are NOT class members (deleting one structurally
# is the HGPrefilterUtils bug), a method after a string containing braces, and one after a comment
# containing an unbalanced brace.
FIXTURES = [
    ("plain class", "class A {\n  m() { throw new Error('x'); }\n}\n"),
    ("object literal", "const o = {\n  m() { return 1; }\n};\n"),
    ("proxy handler", "const p = new Proxy({}, {\n  get() { throw new Error('x'); }\n});\n"),
    ("brace in string", "class A {\n  m() { const s = '}{'; return s; }\n}\n"),
    ("brace in comment", "class A {\n  // }\n  m() { return 1; }\n}\n"),
    ("brace in block comment", "class A {\n  /* } { */\n  m() { return 1; }\n}\n"),
    ("nested class in fn", "function f() {\n  class B {\n    m() { return 1; }\n  }\n}\n"),
    ("extends header", "class A extends B {\n  m() { return 1; }\n}\n"),
    ("template literal", "class A {\n  m() { return `a}{b`; }\n}\n"),
]


def check(text, label, failures):
    defs = [m for m in ss.DEF.finditer(text) if m.group("mname") and not m.group("fname")]
    if not defs:
        return 0
    positions = [m.start() for m in defs]
    batch = ss._scan_brace_context(text, positions)
    ref = [(ss._structural_depth(text, p), ss._enclosing_brace_is_class(text, p)) for p in positions]
    for pos, b, r in zip(positions, batch, ref):
        if b != r:
            failures.append(f"{label} @{pos}: batch={b} reference={r}")
    return len(defs)


def main():
    full = "--full" in sys.argv
    failures = []
    ndefs = 0

    for label, text in FIXTURES:
        ndefs += check(text, f"fixture[{label}]", failures)

    files = []
    for dirpath, _d, filenames in os.walk(os.path.join(ROOT, "src")):
        files += [os.path.join(dirpath, f) for f in filenames if f.endswith(".ts")]
    files.sort()
    if not full:
        # Deterministic sample, plus the largest files — the quadratic blow-up and the trickiest
        # nesting both live in the big multi-class ones.
        files.sort(key=lambda p: -os.path.getsize(p))
        pick = files[:10]
        rest = files[10:]
        random.Random(0).shuffle(rest)
        files = pick + rest[: max(0, SAMPLE - len(pick))]

    for p in files:
        try:
            text = open(p, encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        ndefs += check(text, os.path.relpath(p, ROOT), failures)

    print(f"checked {len(files)} files + {len(FIXTURES)} fixtures, {ndefs} defs"
          f"{' (FULL corpus)' if full else f' (sample of {SAMPLE})'}")
    if failures:
        print(f"BRACE_CONTEXT: FAIL — {len(failures)} disagreement(s)")
        for f in failures[:20]:
            print("   ", f)
        return 1
    print("BRACE_CONTEXT: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
