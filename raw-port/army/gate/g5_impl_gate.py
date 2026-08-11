#!/usr/bin/env python3
"""g5_impl_gate.py — the SEMANTIC-completeness gate (G5).

For each `export function NAME(params): ret` in a changed .ts file that carries an @<FW> 0xADDR
provenance, G5:
  1. finds NAME's disassembly (re/disasm/*.s by symbol/class match near the provenance),
  2. classifies it (verifier/classify_disasm.py): TRAP | EMPTY | DISPATCH_ONLY | REAL,
  3. for REAL/DISPATCH_ONLY/EMPTY, runs the reachability fuzzer on the ACTUAL exported fn
     (verifier/reach_check.py) using param TYPES parsed from the TS signature,
  4. maps the verdict to a gate decision:

       ACCEPT_AS_TRAP / ACCEPT_AS_EMPTY / LIKELY_REAL  -> PASS (real or faithfully-trivial)
       SKELETON (DISPATCH_ONLY)                        -> REJECT (exit 2). A pure dispatch shell is a
                                                          false completion; port the concrete callee.
       REJECT_CHEAT (REAL disasm + reachable throw)    -> REJECT (exit 2). The class-C/D cheat.
       REVIEW_NEEDED (REAL, fuzz unavailable)          -> REJECT: the adversarial reviewer must
                                                          re-derive from the binary and sign off
                                                          (pr_gate.sh <PR#> --reviewed).
       NO-DISASM for cited provenance                 -> FLAG: reviewer re-derives and clears it
                                                          via pr_gate.sh <PR#> --reviewed.

This is NOT gameable by adding a token `if`/`return`: the verdict comes from CALLING the port
(reach fuzz) or CALLING the real FCP symbol (oracle, Layer 1 via gate.sh G4). A throw on any reached
input fails; a wrong number diverges. Writing more throw-free-looking text does not help.
"""
import re, os, sys, json, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
VERIFIER = os.path.join(ROOT, "army", "verifier")
sys.path.insert(0, VERIFIER)
from classify_disasm import classify, find_disasm
import reach_check

FW_RE = re.compile(r'@(ProCore|ProChannel|Helium|Ozone|Flexo)\s+0x([0-9a-fA-F]+)')
ADDR_RE = re.compile(r'@0x([0-9a-fA-F]{3,})')
# a mangled symbol cited in a comment (best disasm key)
SYM_RE = re.compile(r'\b(_{1,2}Z[NK]?[0-9A-Za-z_]+)\b')

# --- G5 call_once-singleton fabricated-construction detector -------------------------------------
# CHEAT INCIDENT 2026-07-29: workers passed G5 by fabricating `new <Class>()` inside a getInstance
# whose disasm actually walls allocation behind libc++ __call_once (the only in-frame callq) with a
# `cmpq $-0x1` sentinel. reach-fuzz can't catch it (no throw). This structural check does.
#
# A getInstance disasm of the call_once-singleton shape has ALL of:
#   - a `cmpq $-0x1` guard on _instanceOnce   (sentinel is -1, NOT 1)
#   - an in-frame `callq` targeting the libc++ __call_once stub
#   - NO in-frame `callq __Znwm` (operator new) — allocation is in the proxy lambda (separate unit)
# A FAITHFUL port therefore models the __call_once boundary (call a std_call_once(...) helper, or
# throw at that libc++ boundary). It must NOT fabricate `new <SameClass>()` (no such instruction is
# in-frame), and its sentinel literal must be -1 / -1n, never 1.
def _find_getinstance_disasm(file_class):
    """Locate the class's OWN getInstance .s. Disasm files are named `<FW>.<Class>.<method>.s`
    (find_disasm's punctuation-stripping glob can't match that dotted form). Prefer the exact
    `.<Class>.getInstance.s`; fall back to a mangled-symbol file if present."""
    import glob as _glob
    disasm_dir = os.path.join(ROOT, "re", "disasm")
    # exact method file: <FW>.<Class>.getInstance.s (exclude .cold / block-invoke)
    for pat in (f"*.{file_class}.getInstance.s",
                f"*{file_class}*getInstance*.s"):
        hits = sorted(_glob.glob(os.path.join(disasm_dir, pat)))
        hits = [h for h in hits if ".cold" not in h and "invoke" not in h and "proxy" not in h]
        if hits:
            return hits[0]
    return None


def _callonce_singleton_cheat(dpath, name, body_text, file_class):
    """Return an error string if this is a call_once-singleton getInstance whose TS body fabricates
    construction / corrupts the sentinel; else None. Conservative: only fires on the exact shape."""
    try:
        d = open(dpath, errors="replace").read()
    except Exception:
        return None
    if "cmpq\t$-0x1" not in d and "cmpq $-0x1" not in d:
        return None  # not the -1-sentinel singleton shape
    if "__call_once" not in d:
        return None  # not a call_once dispatch
    if "__Znwm" in d:
        return None  # in-frame operator new would legitimize a `new` — don't fire
    m = re.search(r'getInstance\s*\([^)]*\)\s*:[^{]*\{(.*?)\n\s{0,4}\}', body_text, re.S)
    if not m:
        return None
    gbody = m.group(1)
    fabricated = re.search(r'\bnew\s+' + re.escape(file_class) + r'\s*\(', gbody)
    bad_sentinel = re.search(r'_instanceOnce\s*(?:!==|===)\s*1\b', gbody)
    if fabricated or bad_sentinel:
        why = []
        if fabricated:
            why.append("fabricates `new %s()` (disasm has NO in-frame alloc; allocation is walled "
                       "behind libc++ __call_once + proxy lambda)" % file_class)
        if bad_sentinel:
            why.append("corrupted sentinel (compares _instanceOnce to 1; disasm is `cmpq $-0x1`)")
        return ("G5 CALLONCE-CHEAT — %s: call_once-singleton getInstance but the port %s. A faithful "
                "port models the __call_once boundary (std_call_once helper or a throw at the libc++ "
                "callq), never a fabricated construction." % (name, "; ".join(why)))
    return None
def _ts_functions(text):
    """Yield (name, params:[(pname,ptype)], ret, start_index) for each exported function."""
    out = []
    for m in re.finditer(r'export\s+function\s+(\w+)\s*\(', text):
        name = m.group(1)
        # capture the param list up to the matching close paren
        i = m.end(); depth = 1; j = i
        while j < len(text) and depth:
            if text[j] == '(': depth += 1
            elif text[j] == ')': depth -= 1
            j += 1
        params_src = text[i:j-1]
        # ret type after ): up to {
        k = text.find('{', j)
        ret = text[j:k].lstrip(': ').strip() if k > 0 else ""
        params = _parse_params(params_src)
        out.append((name, params, ret, m.start()))
    return out

def _parse_params(src):
    params = []
    depth = 0; cur = ""
    for ch in src:
        if ch in "<([{": depth += 1
        elif ch in ">)]}": depth -= 1
        if ch == "," and depth == 0:
            params.append(cur); cur = ""
        else:
            cur += ch
    if cur.strip(): params.append(cur)
    out = []
    for p in params:
        p = p.strip()
        if not p: continue
        mm = re.match(r'(\w+)\s*:\s*(.+)', p)
        if mm:
            out.append((mm.group(1), mm.group(2).strip()))
        else:
            out.append((p, "unknown"))
    return out

def _ts_type_to_grid(t):
    t = t.lower().replace("readonly", "").strip()
    if t.startswith(("boolean",)): return "boolean"
    if t.startswith(("number",)) and "[]" not in t: return "number"
    if "number[]" in t or "float64array" in t or "float32array" in t or "array<number>" in t: return "number[]"
    if t.startswith("string"): return "string"
    return "unknown"

def check_file(path):
    """Return (errs, flags). errs => REJECT; flags => informational (skeleton must not be ported)."""
    errs, flags = [], []
    text = open(path, errors="replace").read()
    fns = _ts_functions(text)
    module_rel = os.path.relpath(path, os.path.dirname(ROOT))  # raw-port/src/...
    # module path the workers import is .js; on-disk is .ts. reach_worker imports the .ts directly.
    # symbols cited anywhere in the file (one class per file, per the strict rule) — used as a
    # fallback disasm key when the nearest-provenance window doesn't contain the mangled symbol.
    file_syms = SYM_RE.findall(text)
    # class name derived from the file (e.g. OZDynamicSpline.ts -> OZDynamicSpline) and from the
    # export prefix (OZDynamicSpline_setVertexSmooth -> OZDynamicSpline / setVertexSmooth).
    file_class = os.path.splitext(os.path.basename(path))[0]
    # FILE-LEVEL call_once-singleton cheat check (getInstance is a `static` class method, not an
    # `export function`, so the per-fn loop below never inspects it). Keyed on the class's OWN
    # getInstance disasm. Fires only on the exact -1-sentinel/__call_once/no-in-frame-new shape.
    if "getInstance" in text:
        gpath = _find_getinstance_disasm(file_class)
        if gpath:
            ce = _callonce_singleton_cheat(gpath, f"{file_class}::getInstance", text, file_class)
            if ce:
                errs.append(f"{path}: {ce}")
    for name, params, ret, start in fns:
        pre = text[:start][-4000:]
        fwm = FW_RE.search(pre) or FW_RE.search(text)
        symm = SYM_RE.findall(pre) or file_syms
        if not fwm and not symm:
            continue  # no provenance near this fn -> provenance_gate handles it
        # find disasm: prefer a mangled symbol whose name relates to THIS export; else file syms;
        # else class/name/method-derived keys.
        method = name.split("_", 1)[1] if "_" in name else name
        dpath = None
        # rank cited symbols by whether they mention this method name
        ranked = sorted(set(symm), key=lambda s: (0 if method.lower() in s.lower() else 1))
        for s in ranked:
            dpath = find_disasm(s)
            if dpath: break
        for key in (name, f"{file_class}.{method}", method, file_class):
            if dpath: break
            dpath = find_disasm(key)
        # BLIND-SPOT FIX (reviewer-08, 2026-07-29): find_disasm sanitizes away dots, so a disasm
        # saved in the human-friendly dotted form `<FW>.<Class>.<method>.s` was NEVER matched by the
        # mangled-name search -> dpath=None -> silent flag+pass -> OZChannelBase::parseElement (a REAL
        # 30-instr body ported EMPTY) merged. Directly glob the dotted forms the workers actually save.
        if not dpath:
            import glob as _g
            for pat in (f"*.{file_class}.{method}.s", f"*.{file_class}.{method}.*.s",
                        f"*{file_class}.{method}.s"):
                hits = [h for h in _g.glob(os.path.join(ROOT, "re", "disasm", pat))
                        if ".cold" not in h and "proxy" not in h]
                if hits:
                    dpath = hits[0]; break
        if not dpath:
            # can't classify. A method carrying @<FW> 0xADDR provenance claims to be a REAL decoded
            # function. We do NOT hard-block here: the .s disasm cache is transient (concurrent agents
            # regenerate/prune it constantly), so a legit port can momentarily lack its .s at commit
            # time — hard-blocking would false-reject honest work. Instead FLAG loudly; the real
            # backstop is merge time, where the reviewer re-derives from the binary (find_disasm now
            # resolves the dotted <FW>.<Class>.<method>.s form, closing the blind spot that let
            # OZChannelBase::parseElement's empty body land). The reviewer clears this flag by
            # re-running `pr_gate.sh <PR#> --reviewed` after re-deriving the disasm.
            if fwm:
                flags.append(f"{path}: {name}: NO-DISASM for @{fwm.group(1)} 0x{fwm.group(2)} "
                             f"provenance — reviewer MUST re-derive from the binary and verify the "
                             f"body matches (blind-spot guard; empty-body-for-REAL-work is a cheat).")
            else:
                flags.append(f"{path}: {name}: no disasm found to classify (reviewer must verify)")
            continue
        dcls = classify(dpath)["class"]
        if dcls == "TRAP":
            continue  # throwing port is faithful
        # build param grid types for the reach fuzzer
        pgrid = [{"type": _ts_type_to_grid(t)} for (_, t) in params]
        try:
            verdict = reach_check.check(dpath, path, name, pgrid, cap=256)
        except Exception as e:
            flags.append(f"{path}: {name}: reach check error ({e}); reviewer must verify")
            continue
        v = verdict["verdict"]
        if v == "REJECT_CHEAT":
            errs.append(f"{path}: G5 CHEAT — {name}: REAL disasm ({os.path.basename(dpath)}) but the "
                        f"port throws incompleteness on {verdict['reach'].get('incompleteHits')} "
                        f"reachable inputs. Transcribe the real instructions; don't stub the body.")
        elif v == "SKELETON":
            # DISPATCH_ONLY (7385eb01 shape): the body is a pure vtable/indirect dispatch shell — the
            # real work IS the callee, so this is NOT an implementable leaf and must NEVER count as
            # `ported` (that is a FALSE completion that lies about coverage). It is a HARD REJECT:
            # the concrete callee must be ported instead.
            errs.append(f"{path}: G5 SKELETON — {name}: DISPATCH_ONLY (7385eb01 shape), a pure "
                        f"dispatch shell whose real work is the callee. Counting it `ported` is a "
                        f"false completion — port the concrete callee instead.")
        elif v == "REVIEW_NEEDED":
            # A FLAG, NOT AN ERROR — and the distinction is load-bearing. REVIEW_NEEDED means exactly
            # "a human must judge this": the disasm is REAL but the symbol is not callable in
            # isolation, so no mechanical check can decide it. Filing that under `errs` made it a hard
            # gate REJECT, and --reviewed only ever bypassed `flags` — so the gate's OWN instruction
            # ("rerun --reviewed") could never work, and correct PRs were unmergeable by construction
            # (reviewer-03: "this silently blocks correct PRs (#228, #231, and likely much of the
            # G0-G5 gate reject backlog)"). It was doubly wrong while pr_gate passed relative paths,
            # since a merely-unavailable fuzz produced this same verdict (fixed in #234).
            # As a flag it still blocks a green status until a reviewer re-derives and signs — which
            # is the whole intent — but the sign-off now actually clears it.
            # A real cheat (REJECT_CHEAT / SKELETON / REJECT_INCOMPLETE_EMPTY) stays a hard error and
            # is NOT clearable by --reviewed.
            flags.append(f"{path}: G5 REVIEW_NEEDED — {name}: REAL disasm but not callable in "
                         f"isolation; the adversarial reviewer must re-derive from the binary and "
                         f"sign off (pr_gate.sh <PR#> --reviewed) before this can land.")
        elif v == "REJECT_INCOMPLETE_EMPTY":
            errs.append(f"{path}: G5 — {name}: EMPTY disasm but port throws incompleteness on a "
                        f"reachable input (a no-op must not throw).")
        # ACCEPT_AS_TRAP / ACCEPT_AS_EMPTY / LIKELY_REAL -> pass
    return errs, flags

def main():
    paths = [p for p in sys.argv[1:] if p.endswith(".ts")]
    all_errs, all_flags = [], []
    for p in paths:
        if not os.path.exists(p): continue
        e, f = check_file(p)
        all_errs += e; all_flags += f
    for f in all_flags: print("  FLAG:", f)
    for e in all_errs: print("  ", e)
    print(f"\ng5_impl_gate: {len(all_errs)} cheat(s), {len(all_flags)} flag(s) across {len(paths)} file(s)"
          f"  ->  {'REJECT' if all_errs else 'PASS'}")
    sys.exit(2 if all_errs else 0)

if __name__ == "__main__":
    main()
