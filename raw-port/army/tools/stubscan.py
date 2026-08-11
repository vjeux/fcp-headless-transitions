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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import srcsource as _srcsource  # corpus source (origin/main, not the stale working tree) + per-file cache

STUB_PHRASE = re.compile(
    # Incompleteness markers a throw-stub uses to say "the real body is not here yet". Aligned with
    # verifier/reach_worker.ts's INCOMPLETE vocab + the variants actually observed in src (census
    # 2026-07-29: 'not yet transcribed' x422, 'unimplemented' x54, 'frontier callee' x26,
    # 'not yet decoded' x18, 'pending' x8, 'not yet ported' x8, 'not yet materialized' x3,
    # 'undecoded' x2, 'not yet wired' x1). Deliberately specific so a real runtime-guard throw
    # (e.g. "called before ctor") is NOT mistaken for an incompleteness stub.
    r'not yet (?:transcribed|ported|decoded|implemented|materialized|wired|transcri)'
    r'|not (?:transcribed|decoded|yet)'
    r'|pending transcription'
    r'|deferred stub'
    r'|un-?transcribed'
    r'|\bundecoded\b'
    r'|\bunimplemented\b'
    r'|\bunimpl\b'
    r'|frontier callee'
    r'|stub not',
    re.I,
)
THROW = re.compile(r'\bthrow\s+new\b')
ADDR  = re.compile(r'0x([0-9a-fA-F]{3,})')
# FRAMEWORK-AWARE key. Short addresses collide across the 5 frameworks (3205 addrs appear in >1 fw):
# e.g. @ProCore 0x41b8 (PCColorUtil::applyHLGToPQ, a throw stub) and @Ozone 0x41b8
# (vertexShaderViewer, a real body) share the bare key '41b8', so the real Ozone cite made the
# ProCore stub count as `ported`. We now key on (framework, addr) when a framework tag is on the
# line, and fall back to a wildcard '*|addr' only when no framework is present. status_for() gives
# a framework-SPECIFIC classification precedence over the wildcard, so a fw-specific stub can never
# be masked by a wildcard real from a DIFFERENT framework.
_FW = r'(?:ProCore|ProChannel|Helium|Ozone|Flexo)'
FW_PAIR = re.compile(r'@?(' + _FW + r')\b[^\n]{0,40}?0x([0-9a-fA-F]{3,})')


def norm(a):
    """Normalize an address token to a canonical key: strip a leading 0x and leading zeros."""
    return re.sub(r'^0x', '', str(a).lower()).lstrip('0') or '0'


def scan_src(root=None, ref=None):
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
    # per-file real / stub citation sets, keyed by file
    real_in = {}   # file -> set(addr)
    stub_in = {}   # file -> set(addr)
    # SOURCE + CACHE (srcsource.py): read the corpus from `origin/main` rather than the canonical
    # working tree — which the swarm never advances, so every reconcile silently ignored the ports
    # that had landed — and skip re-parsing a file whose CONTENT we have already scanned. The
    # citation rule below is FILE-SCOPED, so a per-file cache is exactly the right granularity: the
    # aggregate is a pure function of the per-file (real, stub) pairs.
    cache = _srcsource.FileCache("stubscan_cites", version=1)
    seen_keys = set()
    for f, blob_key, text in _srcsource.iter_src(ref):
        seen_keys.add(blob_key)
        rs = cache.get_or_compute(blob_key, f, text, _scan_one_file)
        if rs[0]:
            real_in[f] = set(rs[0])
        if rs[1]:
            stub_in[f] = set(rs[1])
    cache.save(keep_keys=seen_keys)
    return _combine(real_in, stub_in)


def _scan_one_file(path, text):
    """(sorted real-cited keys, sorted stub-cited keys) for ONE file. Content-addressed and cached.

    Lists rather than sets so the value round-trips through JSON unchanged.
    """
    lines = text.splitlines()
    r, s = set(), set()
    n = len(lines)
    # Precompute stub-window: a line is "stub context" if it is part of a `throw new ...`
    # statement whose message carries a stub phrase — even across line breaks (a multi-line
    # throw where "not yet transcribed" is on a continuation line). We scan each `throw new`
    # and, if a stub phrase appears within the next STUB_WINDOW lines before the statement's
    # terminating `);`, mark that whole span as stub context. Fixes the cc_rgb::hsl @0x9667e
    # miss (throw opened on one line, stub phrase + addr on the next).
    STUB_WINDOW = 6
    stub_ctx = [False] * n
    for i, ln in enumerate(lines):
        if not THROW.search(ln):
            continue
        span = "\n".join(lines[i:i + STUB_WINDOW])
        # cut the span at the statement terminator to avoid bleeding into the next statement
        term = span.find(");")
        if term != -1:
            span = span[:term + 2]
        if STUB_PHRASE.search(span):
            # mark the lines actually covered by this throw statement
            covered = span.count("\n") + 1
            for j in range(i, min(i + covered, n)):
                stub_ctx[j] = True
    for i, ln in enumerate(lines):
        pairs = FW_PAIR.findall(ln)
        if pairs:
            keys = {f"{fw}|{norm(a)}" for fw, a in pairs}
        else:
            found = ADDR.findall(ln)
            if not found:
                continue
            keys = {f"*|{norm(a)}" for a in found}   # no framework on the line -> wildcard
        if stub_ctx[i]:
            s |= keys
        else:
            r |= keys
    return sorted(r), sorted(s)


def _combine(real_in, stub_in):
    """Aggregate the per-file citation sets into (real, stub). Unchanged logic, lifted out of
    scan_src so the per-file half can be cached independently of it."""
    # 'ported' = real-cited in at least one file that does NOT also stub it (clean real cite).
    # WITHIN A FILE, a stub of an address invalidates a real cite of the SAME bare address even when
    # the framework tags differ (the throw line often uses a bare `@0x..` while the JSDoc header uses
    # `@Fw 0x..`; without this, the header's `Fw|addr` real cite masks the body's `*|addr` throw and
    # the stub is miscounted `ported` — the cc_rgb::hsl @0x9667e bug).
    def _bare(key):
        return key.split("|", 1)[1]
    real = set()
    for f, r in real_in.items():
        stubbed_bare = {_bare(k) for k in stub_in.get(f, set())}
        real |= {k for k in r if _bare(k) not in stubbed_bare}
    # 'stub' = stub-cited anywhere and NOT cleanly ported by any file. (Cross-file: a real BODY in
    # another file legitimately ports an addr even if a caller stubs it as a callee — HGNode case —
    # so we only subtract exact `real` keys here, not by bare addr.)
    stub = set()
    for s in stub_in.values():
        stub |= s
    stub -= real
    return real, stub


def status_for(fw, addr, real, stub):
    """Framework-aware status. A framework-SPECIFIC classification always beats the wildcard, so a
    fw-specific stub cannot be masked by a wildcard `real` from a DIFFERENT framework (the bug that
    made @ProCore 0x41b8 count `ported` because @Ozone 0x41b8 was real)."""
    a = norm(addr)
    if fw and f"{fw}|{a}" in real:
        return "ported"
    if fw and f"{fw}|{a}" in stub:
        return "stub"
    if f"*|{a}" in real:
        return "ported"
    if f"*|{a}" in stub:
        return "stub"
    return "todo"


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
