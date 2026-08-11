#!/usr/bin/env python3
"""mark_ported.py — reconcile ledger status with src/ truth (4-way: ported/skeleton/stub/todo).

The @0xADDR citation (PORTING_SPEC rule 1) is the completion signal, BUT a throwing stub ALSO
cites its addr, AND a DISPATCH_ONLY vtable-shell (the 7385eb01 cheat) has a non-throwing body that
cites its addr yet implements NOTHING. The naive "addr cited anywhere => ported" rule OVERCOUNTS
both. This uses the shared `stubscan` oracle + the structural classifier to classify each addr:

  ported   = addr real-cited AND (not a DISPATCH_ONLY shell) — a genuine body.
  skeleton = addr real-cited BUT the function's disasm is DISPATCH_ONLY (whole body is virtual/vtable
             dispatch — real work IS its callees; the 7385eb01 shape). NOT counted as ported.
  stub     = addr appears ONLY on a throwing-stub line ("... not yet transcribed ...").
  todo     = addr never appears in src/.

Bidirectional + idempotent. Run after commits; then re-run build_ledger.py to refresh counts."""
import json, os, sys, glob
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LED=os.path.join(ROOT,"army","ledger")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stubscan import scan_src, norm, status_for as _stub_status_for
import srcsource
# structural classifier (verifier) for the DISPATCH_ONLY (skeleton) downgrade
sys.path.insert(0, os.path.join(ROOT,"army","verifier"))
try:
    from classify_disasm import classify as _classify_disasm
except Exception:
    _classify_disasm = None

# Fast DISPATCH_ONLY detection from the GLOBAL dependency graph (army/depgraph/graph.json, built by
# depgraph.py from the otool dumps; replaces the old per-fw army/graph/*.callgraph.json). A function
# with NO in-scope deps, NO out-of-scope externs, but >=1 indirect dispatch is the structural
# DISPATCH_ONLY candidate (the 7385eb01 shape). Confirmed by classify_disasm on the saved .s when
# available (else trust the structural signal — a vtable-only shell is not a real port regardless).
_dg = {}
def _load_depgraph():
    p = os.path.join(ROOT, "army", "depgraph", "graph.json")
    if os.path.exists(p):
        try:
            return json.load(open(p))
        except Exception:
            return {}
    return {}
_dg = _load_depgraph()

def _is_dispatch_only(fw, mangled):
    info = _dg.get(mangled)
    if not info: return False
    # new-graph schema: deps (in-scope), n_extern_oos (out-of-scope externs), indirect (vtable/*calls)
    if not (not info.get("deps") and info.get("n_extern_oos", 0) == 0 and info.get("indirect", 0) >= 1):
        return False
    # structural candidate; confirm with the saved disasm if we have it (do NOT disasm on-demand here
    # — mark_ported runs over the whole ledger and must stay fast; the structural signal is sound).
    import re as _re
    safe = _re.sub(r"[^A-Za-z0-9_]", "", mangled)
    pfx = "" if fw == "Ozone" else fw + "."
    dpath = os.path.join(ROOT, "re", "disasm", f"{pfx}{safe}.s")
    if _classify_disasm and os.path.exists(dpath) and os.path.getsize(dpath) > 0:
        return _classify_disasm(dpath)["class"] == "DISPATCH_ONLY"
    return True  # structural DISPATCH_ONLY candidate, no disasm to refute -> treat as skeleton

# WHICH TREE COUNTS AS "LANDED": `origin/main`, not the canonical working tree.
# Four agents independently reported this tool as a silent no-op. The cause was the source, not the
# logic: it scanned the canonical checkout's WORKING TREE, and nothing advances that tree during a
# swarm run (agents work in pool worktrees; swarm_maint only resets the canonical tree when it is
# dirty AND no gate process is live). It was measured 9, then 26, then 30 commits behind origin/main
# in one morning, so every reconcile printed a healthy `0 units changed` while ignoring every port
# that had actually landed. Reading a ref also needs no lock and cannot race an agent mid-write.
# `--ref WORKTREE` restores the old behaviour for one-off local analysis.
SRC_REF = None
for _i, _a in enumerate(sys.argv):
    if _a == "--ref" and _i + 1 < len(sys.argv):
        SRC_REF = sys.argv[_i + 1]
if SRC_REF is None:
    SRC_REF = srcsource.DEFAULT_REF

real_cited, stub_cited = scan_src(ROOT, ref=SRC_REF)

# SYMBOL-KEYED class-C override. Some throw-stubs cite CALL-SITE / callee addresses in their message
# (e.g. OZChannelBool3D::setValue throws citing @0x53869/... not its own @0x537c6), so the
# address-citation reconcile cannot link the throw to the method and miscounts it `ported`. The
# exhaustive method-body census (census_final) confirms these by reading the actual TS body; they
# are recorded by MANGLED symbol here and always demoted, independent of address matching.
_CLASSC_OVERRIDE = {}
_ov = os.path.join(LED, "CLASS_C_OVERRIDES.json")
if os.path.exists(_ov):
    try:
        _CLASSC_OVERRIDE = json.load(open(_ov))
    except Exception:
        _CLASSC_OVERRIDE = {}

# BODY-BASED throw-only override (authoritative): a method whose committed body is only a throw
# is NOT ported, regardless of what addresses its JSDoc cites. This makes status STABLE (mark_ported
# and mark_stub_bodies agree in one pass instead of oscillating). Keyed by (fileClass, leaf).
try:
    from mark_stub_bodies import _throwonly_methods as _tom
    _THROWONLY = _tom(ref=SRC_REF)
except Exception:
    _THROWONLY = set()

def status_for(addr, fw=None, mangled=None, demangled=None):
    # Body-based throw-only override (authoritative over any address citation).
    if demangled and _THROWONLY:
        leaf=demangled.split("(")[0].split("::")[-1].strip()
        scope=demangled.split("(")[0]
        cppcls=scope.split("::")[-2] if "::" in scope else None
        if (cppcls and (cppcls,leaf) in _THROWONLY):
            return "stub"
    # Confirmed class-C (real disasm, throw/stub-only body) — demote regardless of address citation.
    if mangled and mangled in _CLASSC_OVERRIDE:
        return "stub"
    # FRAMEWORK-AWARE (fixes the cross-fw addr-collision bug: @ProCore 0x41b8 stub was masked by
    # @Ozone 0x41b8 real). stubscan.status_for gives fw-specific keys precedence over the wildcard.
    base = _stub_status_for(fw, addr, real_cited, stub_cited)
    if base == "ported":
        # a real-cited body that is structurally a vtable shell is a SKELETON, not ported.
        if fw and mangled and _is_dispatch_only(fw, mangled):
            return "skeleton"
        return "ported"
    return base

tot=port=skel=stub=todo=changed=0
for fw in ["ProChannel","ProCore","Ozone","Flexo","Helium"]:
    lp=os.path.join(LED,f"{fw}.ledger.json")
    if not os.path.exists(lp): continue
    led=json.load(open(lp))
    for ms in led.values():
        for v in ms.values():
            tot+=1
            want=status_for(v["addr"], fw, v.get("mangled"), v.get("demangled"))
            if v.get("status")!=want:
                v["status"]=want; changed+=1
            if want=="ported": port+=1
            elif want=="skeleton": skel+=1
            elif want=="stub": stub+=1
            else: todo+=1
    # ATOMIC WRITE (write-temp + os.replace): a bare json.dump(open(lp,"w")) truncates lp
    # immediately then streams, so a CONCURRENT reader (workers running `depgraph.py deps`,
    # which loads these ledgers) sees a half-written/empty file -> JSONDecodeError. All 4
    # dep-workers this session hit exactly that race. os.replace is atomic on POSIX, so a
    # reader always sees either the old complete file or the new complete file, never a partial.
    _tmp = f"{lp}.tmp.{os.getpid()}"
    with open(_tmp, "w") as _f:
        json.dump(led, _f)
    os.replace(_tmp, lp)
print(f"ported {port}/{tot}  skeleton {skel}  stub {stub}  todo {todo}  "
      f"(status changed on {changed} units)  [src={SRC_REF}]")

