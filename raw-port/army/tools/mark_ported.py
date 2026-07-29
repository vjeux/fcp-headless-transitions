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
GRAPH=os.path.join(ROOT,"army","graph")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stubscan import scan_src, norm, status_for as _stub_status_for
# structural classifier (verifier) for the DISPATCH_ONLY (skeleton) downgrade
sys.path.insert(0, os.path.join(ROOT,"army","verifier"))
try:
    from classify_disasm import classify as _classify_disasm
except Exception:
    _classify_disasm = None

# Fast DISPATCH_ONLY detection from the callgraph (keyed by mangled): a function with NO internal
# callees, NO external named calls, but >=1 indirect dispatch is the structural DISPATCH_ONLY
# candidate. Confirmed by classify_disasm on the saved .s when available (else trust the structural
# signal — conservative: a vtable-only shell is not a real port regardless).
_cg = {}
def _load_callgraphs():
    for f in glob.glob(os.path.join(GRAPH, "*.callgraph.json")):
        try: _cg[os.path.basename(f).split(".")[0]] = json.load(open(f))
        except Exception: pass
_load_callgraphs()

def _is_dispatch_only(fw, mangled):
    g = _cg.get(fw, {})
    info = g.get(mangled)
    if not info: return False
    if not (not info.get("callees") and info.get("ext",0)==0 and info.get("ind",0)>=1):
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

real_cited, stub_cited = scan_src(ROOT)

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
    _THROWONLY = _tom()
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
    json.dump(led,open(lp,"w"))
print(f"ported {port}/{tot}  skeleton {skel}  stub {stub}  todo {todo}  (status changed on {changed} units)")

