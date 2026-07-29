#!/usr/bin/env python3
"""stubscan.py — the shared "is this @0xADDR really ported, or just a throw-stub?" oracle.

The porting convention (PORTING_SPEC rule 1) requires every method — REAL or STUB — to cite its
`@0xADDR`. A throwing stub cites the addr inside a `throw new Error("... @0xADDR ... not yet
transcribed")` line. So the naive "addr cited anywhere in src/ => ported" rule that build_ledger.py
and mark_ported.py used OVERCOUNTS: it flips stub methods to `ported`.

This module classifies each addr by HOW it is cited, FILE-AWARE:

  stub-cited(F)  = addr appears in file F on a `throw new ...` line that ALSO carries a stub phrase
                   (`not yet transcribed|ported|decoded|implemented`, `deferred stub`, `un-transcribed`)
  real-cited(F)  = addr appears in file F on ANY other line — real executable body, JSDoc header
                   (`// @0xADDR`), or an inline comment inside a genuinely-ported method.

Classification (FILE-AWARE — a method's own file usually documents its addr in a JSDoc header AND,
if unimplemented, throws citing the same addr; the header alone must NOT count as "ported"):

  ported  = SOME file real-cites the addr WITHOUT also stub-citing it in that same file.
            (a real port references the addr in a comment/body and does not pair it with a throw;
             a cross-file real body — e.g. HGNode ctor ported in HGNode.ts but stubbed as a callee
             in HgcBT2100.ts — still counts, because HGNode.ts real-cites-without-stubbing.)
  stub     = addr is cited somewhere but NO file real-cites-it-without-stubbing (every real cite is a
             JSDoc header in the same file that also throws) -> placeholder body, unfinished.
  todo    = addr never appears in src/ at all.

Why file-aware: the earlier "real-cited wins any collision" GLOBAL rule marked `determinant()`
`ported` because its own JSDoc header (`* 0x514bc determinant() — defer`) real-cites the addr even
though the body throws. File-aware sees that the ONLY file citing it both header-documents AND
throw-stubs it -> correctly `stub`. Global found 3 stubs; file-aware finds the real ~360.

NOTE on runtime-guard throws: a fully-ported method may legitimately `throw new Error("... called
before ctor")`. Those carry NO stub phrase, so they are NOT stub-cited — the method's addr is
real-cited by its own body/header and correctly stays `ported`.

Usage as a module:
    from stubscan import scan_src
    real, stub = scan_src(root)   # both are sets of normalized (0x-stripped, no leading-0) addrs
    def status_for(addr):
        a = norm(addr)
        return "ported" if a in real else "stub" if a in stub else "todo"

Usage as a CLI (report only, read-only):
    python3 stubscan.py [SRC_DIR]
"""
import os, re, sys, subprocess

STUB_PHRASE = re.compile(
    r'not yet (?:transcribed|ported|decoded|implemented)'
    r'|deferred stub'
    r'|un-?transcribed',
    re.I,
)
THROW = re.compile(r'\bthrow\s+new\b')
ADDR  = re.compile(r'0x([0-9a-fA-F]{3,})')


def norm(a):
    """Normalize an address token to a canonical key: strip a leading 0x and leading zeros."""
    return re.sub(r'^0x', '', str(a).lower()).lstrip('0') or '0'


def scan_src(root):
    """Scan every raw-port/src/*.ts under `root`. Return (real_cited, stub_cited) addr-key sets.

    `root` is the raw-port dir (the one containing src/ and army/).

    FILE-SCOPED rule (correct for both failure modes):
      - An addr is 'ported' iff SOME file real-cites it WITHOUT also stubbing it in that same file.
        This makes the cross-file STALE-CALLEE case correct: HGNode::HGNode is a real body in
        HGNode.ts (real, no stub there) even though HgcBT2100.ts names it in a throw-stub as an
        un-ported callee -> ported.
      - It also makes the same-file SELF-DOCUMENTED-STUB case correct: PCMatrix44Tmpl::determinant
        cites its addr in the class-header JSDoc (real-cited) AND throws in its body (stub-cited) in
        the SAME file -> that file does not "cleanly" port it, so it stays 'stub'. A naive global
        `stub -= real` wrongly promoted these ~360 placeholders to ported.
    """
    src = os.path.join(root, "src")
    # per-file real / stub citation sets, keyed by file
    real_in = {}   # file -> set(addr)
    stub_in = {}   # file -> set(addr)
    files = subprocess.run(
        ["find", src, "-name", "*.ts"], capture_output=True, text=True
    ).stdout.split()
    for f in files:
        try:
            lines = open(f, encoding="utf-8", errors="ignore").read().splitlines()
        except Exception:
            continue
        r, s = set(), set()
        for ln in lines:
            found = ADDR.findall(ln)
            if not found:
                continue
            addrs = {norm(a) for a in found}
            if THROW.search(ln) and STUB_PHRASE.search(ln):
                s |= addrs
            else:
                r |= addrs
        if r:
            real_in[f] = r
        if s:
            stub_in[f] = s
    # 'ported' = real-cited in at least one file that does NOT also stub it (clean real cite).
    real = set()
    for f, r in real_in.items():
        real |= (r - stub_in.get(f, set()))
    # 'stub' = stub-cited anywhere and NOT cleanly ported by any file.
    stub = set()
    for s in stub_in.values():
        stub |= s
    stub -= real
    return real, stub


def _root_from_here():
    # tools/ -> army/ -> raw-port/
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else _root_from_here()
    if os.path.basename(root) == "src":
        root = os.path.dirname(root)
    real, stub = scan_src(root)
    print(f"real-cited addrs (ported) : {len(real)}")
    print(f"stub-cited addrs (stub)   : {len(stub)}")
    print(f"(a stub addr is a placeholder body that throws + cites its @0xADDR)")
