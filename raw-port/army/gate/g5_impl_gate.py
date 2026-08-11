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
try:
    from classify_disasm import names_class as _names_class
except ImportError:  # a checkout whose verifier/ predates #322 (local pre-commit hook path)
    import re as _re
    def _names_class(basename, ident):
        """Fallback copy of classify_disasm.names_class — keep the two in sync."""
        if _re.search(r'(?<![0-9])%d%s' % (len(ident), _re.escape(ident)), basename):
            return True
        return (".%s." % ident) in basename or basename.startswith(ident + ".")
import reach_check

# Itanium spellings of the members a TS export name can never contain literally: a `_ctor` export's
# symbol is `...C2Ev`, a `_dtor`'s is `...D1Ev`, `_assign`'s is `...aSERKS_`, `_equals`'s is
# `...eqERKS_`. Requiring a literal method-name match without these would drop the special members
# to NO-DISASM flags across the corpus (29 ctor + 61 dtor/D0/D1/D2 exports alone) and cost G5 real
# teeth on exactly the plumbing that gets stubbed. Each pattern still has to appear in a symbol that
# NAMES THIS CLASS — the class anchor is checked separately by the caller and is never optional.
_METHOD_ALIASES = {
    "ctor":     (r'C[123]E',), "copyctor": (r'C[123]E',), "c1": (r'C1E',), "c2": (r'C2E',),
    "c2_copy":  (r'C2E',),     "c1_copy":  (r'C1E',),     "c3": (r'C3E',),
    "ctor_c1":  (r'C1E',),     "ctor_c2":  (r'C2E',),
    "dtor":     (r'D[012]E',), "d0": (r'D0E',), "d1": (r'D1E',), "d2": (r'D2E',),
    "dtor_d0":  (r'D0E',),     "dtor_d1": (r'D1E',), "dtor_d2": (r'D2E',),
    "assign":   (r'aSE',),     "equals": (r'eqE',),  "notequals": (r'neE',),
    "lessthan": (r'ltE',),     "greaterthan": (r'gtE',),
    "index":    (r'ixE',),     "call": (r'clE',),    "deref": (r'deE',),
}


def _itanium_components(sym):
    """The name components of a mangled symbol, in order, ignoring the PARAMETER types.

    `__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime` -> ['OZDynamicSpline', 'setVertexSmooth'].

    Position matters, and getting it wrong is not theoretical: `find_disasm("CMTime")` returns that
    very symbol, because `RK6CMTime` — a PARAMETER TYPE — contains the Itanium component `6CMTime`,
    and a whole-component test that ignores position cannot tell the two apart. That single
    `.s` was the judge for ALL TWELVE exports of src/infra/CMTime.ts (12 fabricated
    "SKELETON: DISPATCH_ONLY" rejects on a file whose own disasm was never in the cache). So the
    method test walks the nested-name sequence and compares against its LAST component only.
    """
    # A non-virtual/virtual THUNK carries its adjustment between `_Z` and the real nested name
    # (`_ZThn328_NK32OZ3DEngineScenePlacementBehavior12getLockingIDEv`); strip it so the thunk
    # resolves to the same components as the function it adjusts.
    sym = re.sub(r'_ZT[hv]n?\d+_(?:n?\d+_)?', '_Z', sym)
    # `L` = internal linkage (`__ZL25Gettype3_nice_satTile_AVX...`), `N` = a nested name.
    m = re.search(r'_ZL?(N[VKRO]*)?', sym)
    if not m:
        return []
    nested = bool(m.group(1))
    i, comps = m.end(), []
    while i < len(sym):
        mm = re.match(r'(\d+)', sym[i:])
        if mm:
            n = int(mm.group(1)); i += mm.end()
            comps.append(sym[i:i + n]); i += n
            continue
        mm = re.match(r'([CD][0-3])', sym[i:])          # ctor/dtor variants
        if mm:
            comps.append(mm.group(1)); i += 2
            continue
        mm = re.match(r'(aS|eq|ne|lt|gt|le|ge|ix|cl|de|pl|mi|ml|dv|rm|co|nt|aa|oo)', sym[i:])
        if mm:                                            # operator names
            comps.append(mm.group(1)); i += 2
            continue
        break                                             # 'E' / return type / params — done
    if not nested:
        # A plain `_Z<len><name>...` free function has no `E` terminator, so a following PARAMETER
        # that happens to be a class type would look like another component. Only the first counts.
        comps = comps[:1]
    return comps


def _sym_names_method(text_, method):
    """Does TEXT_ (a mangled symbol or a `.s` basename) name METHOD *in the method position*?

    The method-level twin of classify_disasm.names_class, and load-bearing for the same reason: a
    verdict computed from a SIBLING METHOD's disassembly is fabricated, not merely weaker. Unlike
    names_class this is POSITIONAL — see _itanium_components for why a whole-component test is not
    enough — and it also accepts a whole dotted component of the human `<FW>.<Class>.<method>.s`
    form and the special-member spellings in _METHOD_ALIASES.
    """
    if not method:
        return False
    if (".%s." % method) in text_ or text_.startswith(method + "."):
        return True
    aliases = _METHOD_ALIASES.get(method.lower(), ())
    for tok in re.findall(r'_{0,2}_Z[A-Za-z0-9_]+', text_):
        comps = _itanium_components(tok)
        if not comps:
            continue
        last = comps[-1]
        if last == method:
            return True
        for pat in aliases:
            if re.fullmatch(pat.rstrip("E"), last):
                return True
    return False


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
# A class METHOD body. G5 only ever looked for `export function`, so for a file whose bodies live in
# a class it analysed NOTHING and reported "0 cheats, 0 flags -> PASS". Measured over raw-port/src:
# 946 of 1603 files (59%) contain ONLY class methods, so for the majority of the codebase the
# anti-cheat gate was inert while printing green. reviewer-03 demonstrated it: the IDENTICAL
# Pattern-C body is `G5 CHEAT / exit 2` as an export function and `0 cheats, 0 flags / PASS` wrapped
# in `class X {}`.
INCOMPLETE_RE = re.compile(r'not yet transcribed|pending transcription|unimplemented|\\bunimpl\\b|\\bTODO\\b|not transcribed|frontier callee', re.I)

_METHOD_RE = re.compile(
    r'^[ \t]{2,4}(?!(?:if|for|while|switch|catch|return|function|constructor)\b)'
    r'(?:public\s+|private\s+|protected\s+|static\s+|readonly\s+|async\s+|get\s+|set\s+)*'
    r'([A-Za-z_]\w*)\s*\(', re.M)

def _ts_methods(text):
    """Yield (name, params, ret, start) for class methods — same tuple shape as _ts_functions."""
    out = []
    for m in _METHOD_RE.finditer(text):
        name = m.group(1)
        i = m.end(); depth = 1; j = i
        while j < len(text) and depth:
            if text[j] == '(': depth += 1
            elif text[j] == ')': depth -= 1
            j += 1
        k = text.find('{', j)
        ret = text[j:k].lstrip(': ').strip() if k > 0 else ""
        out.append((name, _parse_params(text[i:j-1]), ret, m.start()))
    return out


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
    # CLASS-METHOD SWEEP. The per-fn loop below only ever saw `export function`, so in a file whose
    # bodies live in a class it examined nothing and the gate printed "0 cheats, 0 flags -> PASS".
    # 946 of 1603 landed files (59%) are exactly that shape.
    #
    # Scope, deliberately: the reach FUZZ cannot run on a method (it would have to construct the
    # instance), so this does the half that needs no instance — classify the disasm and look for the
    # Pattern-C shape: a REAL body whose TS throws incompleteness. Reachability is unproven, so this
    # FLAGS (reviewer must clear) rather than hard-rejecting. Flagging all 946 files instead would
    # cry wolf on the whole codebase and teach agents to ignore G5 — the failure mode G7 already
    # showed. This catches the cheat while staying quiet on honest ports.
    for mname, _mp, _mr, mstart in _ts_methods(text):
        if mname in ("super", "constructor", "this"):
            continue                      # a call, not a method declaration
        body = text[mstart:mstart + 4000]
        if not INCOMPLETE_RE.search(body):
            continue                      # no incompleteness throw -> nothing for this check to say
        pre = text[:mstart][-4000:]
        msyms = SYM_RE.findall(pre) or file_syms
        mdpath = None
        # The symbol MUST relate to this method, and its disasm MUST name this class. Without both
        # guards this re-introduces exactly the disease #307/#322 fixed: a method resolves to the
        # first symbol cited anywhere in the file and gets a confident verdict about a DIFFERENT
        # function. Measured while writing this — without the guards, 5 landed files flagged and all
        # five resolved to the same unrelated "9 instrs, 3 stores" body, including a match on the
        # `super(` call in a constructor. Unresolvable is the honest answer; the NO-DISASM flag
        # already covers it.
        for sym in sorted(set(msyms), key=lambda x: (0 if mname.lower() in x.lower() else 1, x)):
            if mname.lower() not in sym.lower():
                continue                  # not this method's symbol — do not guess
            cand = find_disasm(sym)
            if cand and (_names_class(os.path.basename(cand), file_class)
                         or mname.lower() in os.path.basename(cand).lower()):
                mdpath = cand
                break
        if not mdpath:
            continue                      # no disasm to judge against; the NO-DISASM flag covers it
        mcls = classify(mdpath)
        if mcls.get("class") == "REAL":
            flags.append(f"{path}: G5 CLASS-METHOD — {mname}: disasm classifies REAL "
                         f"({mcls.get('instrs')} instrs, {mcls.get('stores')} stores) but the method "
                         f"body throws incompleteness. Reachability is NOT proven here (the fuzz "
                         f"cannot construct the instance), so the reviewer must decide: transcribe "
                         f"the real instructions, or show the throw is unreachable.")

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
        # rank cited symbols by whether they mention this method name. The tie-break on the symbol
        # itself is load-bearing: `sorted(set(...))` with an equal key preserves SET iteration order,
        # which Python randomizes per process (PYTHONHASHSEED) — so which cited symbol's disasm got
        # classified for a given export changed from gate run to gate run, and with it the verdict.
        # A verdict must be reproducible; sort fully.
        ranked = sorted(set(symm), key=lambda s: (0 if method.lower() in s.lower() else 1, s))
        # ...AND THE CITED SYMBOL MUST BE *THIS EXPORT'S* SYMBOL (worker 1, 2026-08-11).
        # The rank above only PREFERS a symbol that mentions the method; the loop then took the first
        # cited symbol that resolved to any `.s` at all. So one sibling symbol cited anywhere in the
        # preceding 4,000 characters became the disasm for EVERY export in the file — the #307/#322
        # disease surviving in its largest room. Measured over raw-port/src: of 2,317 exported
        # functions, 1,453 (63%) have NO cited symbol that relates to their own method, so every one
        # of them takes an arbitrary sibling's body the moment any of the file's symbols is cached.
        # It is masked today only because the disasm cache was purged in #368 — and it un-masks
        # itself exactly when a worker follows the brief and derives the class's disassembly.
        # Observed live on channels/OZ3DEngineScenePlacementBehavior.ts: the token `_ZThn328_`
        # written in an explanatory comment resolved for all 9 unrelated exports.
        #
        # A candidate is accepted only if it NAMES THIS METHOD (whole-component, or one of the
        # Itanium special-member spellings a TS export name can never contain) and NAMES THIS CLASS.
        # The one exception is a genuinely unambiguous file: exactly one export and exactly one
        # cached candidate that names the class — the shape of nearly every fresh port unit, where
        # losing the verdict would cost real teeth. Everything else falls through to the NO-DISASM
        # FLAG: "the reviewer must re-derive this one from the binary", which is what the gate
        # already does when nothing resolves at all, and is the only honest answer.
        cands = [(s, find_disasm(s)) for s in ranked]
        cands = [(s, d) for (s, d) in cands if d]
        export_class = name.split("_", 1)[0] if "_" in name else file_class
        for s, d in cands:
            base = os.path.basename(d)
            if not (_names_class(base, export_class) or _names_class(base, file_class)
                    or _names_class(s, export_class) or _names_class(s, file_class)):
                continue                      # another class's body — never
            if _sym_names_method(s, method) or _sym_names_method(base, method):
                dpath = d
                break
        if not dpath and len(fns) == 1 and len({d for _s, d in cands}) == 1:
            s, d = cands[0]
            base = os.path.basename(d)
            if (_names_class(base, export_class) or _names_class(base, file_class)
                    or _names_class(s, export_class) or _names_class(s, file_class)):
                dpath = d                     # one export, one candidate, right class: unambiguous
        # The `name` / `<Class>.<method>` keys must clear the SAME bar. When the export has no
        # underscore, `name` IS the bare method (`interpolate`), and this loop assigned it with no
        # class check at all — which is how `channels/OZBSplineInterpolator.ts: interpolate` was
        # hard-rejected as a CHEAT against `ProChannel.OZBezierInterpolator.interpolate.s`, a
        # DIFFERENT interpolator class. Route every key through the same guard.
        for key in (name, f"{file_class}.{method}"):
            if dpath: break
            cand = find_disasm(key)
            if not cand:
                continue
            cbase = os.path.basename(cand)
            if ((_names_class(cbase, export_class) or _names_class(cbase, file_class))
                    and _sym_names_method(cbase, method)):
                dpath = cand
        # A BARE key (`method` or `file_class` alone) is not a symbol — it is a guess, and a guess
        # that lands on ANOTHER CLASS produces a confident verdict about a function this file does
        # not contain. Measured across the 2,298 exported functions in raw-port/src: of the 1,745
        # that resolved to a disasm, 924 resolved via a bare key and 476 of those — 27% of ALL
        # resolutions — named a DIFFERENT class. `AUPassThrough_D1` was judged against
        # `LiMaterialLayer::D1` (TRAP), `AdvanceScopingWindowTask_performTask` against
        # `UpdateScrubRateTask::performTask` (EMPTY), and every `*_ctor` export in the repo against
        # one arbitrary framework's constructor. Both directions are wrong: a wrong EMPTY/TRAP waves
        # an empty-body-for-REAL-work port through (the parseElement cheat), and a wrong REAL
        # condemns an honest @0xADDR-cited sibling stub as a class-C cheat.
        #
        # So a bare-key hit must still NAME THE CLASS being ported. The class is the export's own
        # prefix when it has one (`OZChannelImpl_setMin` -> OZChannelImpl, which is how a file that
        # carries helpers for several classes still resolves correctly), else the file's class.
        # A hit that names neither is discarded and falls through to the NO-DISASM FLAG below —
        # "the reviewer must re-derive this from the binary" is the honest answer, and it is the
        # answer this gate already has for the unresolvable case. #307 fixed the same disease for
        # the class key alone; this closes the method key, which is 5x larger.
        #
        # ...AND IT MUST NAME THE METHOD TOO (worker 1, 2026-08-11). Anchoring the bare key on the
        # CLASS alone left the whole disease intact one level down: `find_disasm(file_class)` returns
        # SOME method of the right class — whichever `.s` happens to sit in the cache — and that one
        # body then became the verdict for EVERY export in the file. Measured on the landed
        # channels/OZ3DEngineScenePlacementBehavior.ts: with only
        # `__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv.s` present (a 6-instruction
        # trivial getter, classified EMPTY because it has 0 stores / 0 compute / 1 load), all ELEVEN
        # exports in the file — distance, alignment, shouldFaceCamera, shouldFixY, targetObject,
        # getLockDependencies, the ctor/copyCtor/dtor/assign plumbing — were judged against that
        # getter and hard-REJECTED as "EMPTY disasm but port throws incompleteness", i.e. eleven
        # fabricated cheat verdicts on honest @0xADDR-citing deferral stubs. Both directions of harm
        # again: an EMPTY verdict borrowed from a sibling getter also waves through an empty-bodied
        # port of a REAL 200-instruction method in the same class.
        #
        # The trigger is *following the worker brief*: it tells you to run `disasm.sh --sym` inside
        # your leased worktree before gating (so G5 classifies instead of only flagging). Doing that
        # writes exactly one same-class `.s` and flips the file from "0 cheats, 12 flags -> PASS" to
        # "11 cheats -> REJECT". Deriving the evidence you were told to derive must not manufacture
        # cheat verdicts, and which method's `.s` is warm in a shared cache must never decide them.
        #
        # So a bare-key hit must name the class AND the method, as whole name components. When the
        # key IS the method, find_disasm's own `_ident_matches` already guarantees the second half;
        # this makes it explicit and kills the class-key-only resolution, which cannot be right for
        # a per-method verdict. A hit that names only the class is discarded and falls through to
        # the NO-DISASM FLAG below — "the reviewer must re-derive this one from the binary".
        bare_dpath = None
        for key in (method, file_class):
            if bare_dpath: break
            bare_dpath = find_disasm(key)
        if bare_dpath and not dpath:
            export_class = name.split("_", 1)[0] if "_" in name else file_class
            base = os.path.basename(bare_dpath)
            if ((_names_class(base, export_class) or _names_class(base, file_class))
                    and _sym_names_method(base, method)):
                dpath = bare_dpath
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
