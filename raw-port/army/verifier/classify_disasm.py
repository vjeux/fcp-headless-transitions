#!/usr/bin/env python3
"""classify_disasm.py — AUTHORITATIVE structural classifier for one function's disassembly.

Two un-gameable purposes:
  1. DISPENSER FILTER: never hand a worker a DISPATCH_ONLY function as an "implementable leaf".
     Its real work IS its callees; until those are ported a port can only be a shell (7385eb01).
  2. REVIEWER SIGNAL: an objective starting classification + the exact "real-work" counts a
     faithful TS body must reflect. A worker cannot satisfy a REAL classification with an
     all-throw body.

Classes (mutually exclusive, computed from AT&T `<hex>\\t<mnem> <ops>` disasm):
  TRAP          : contains `ud2`. The faithful port is a throw.
  EMPTY         : no stores, no arith/simd, no direct calls; at most arg-marshalling + <=1 field
                  load feeding the return (a trivial getter / no-op). A tiny body is faithful.
  DISPATCH_ONLY : the ONLY non-trivial work is INDIRECT dispatch (callq/jmpq *off(%reg)) — i.e.
                  the body loads a vtable ptr, marshals args, and calls through it, with ZERO
                  stores, ZERO arith/simd, ZERO DIRECT named calls, ZERO data compares beyond an
                  entry-arg guard. THE 7385eb01 CHEAT SHAPE. Not independently implementable;
                  at most `skeleton`, never `ported`, until callees land.
  REAL          : has genuine transcribable work — a memory STORE (writes a struct field),
                  arithmetic/SIMD on data, a DIRECT named call, or multiple data-dependent
                  loads/compares. An all-throw TS body here is a cheat (class C/D).

Discriminator rationale (why the naive versions FALSE-PASSED the cheat):
  - a memory LOAD is not "work"; only a memory STORE mutates state. (vtable loads are loads.)
  - the entry `testl %edx,%edx; jne` on a bool ARG is control flow to pick early-return vs
    dispatch — NOT transcribable compute. We only count compares that read a memory field
    or that are not the single entry guard.
  - `mov %reg,%reg` and `xorps %xmm,%xmm` are arg marshalling, not work.
"""
import re, sys, os, glob

DISASM = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "re", "disasm"))

RE_INSN_LINE = re.compile(r'^\s*[0-9a-fA-F]{4,}\s')
UD2 = re.compile(r'\bud2\b')

# arithmetic / SIMD-arith / conversion / shift on DATA (work the TS must reflect)
COMPUTE = re.compile(
    r'^(add|sub|imul|mul|idiv|div|inc|dec|neg|not|sbb|adc|abs|'
    r'adds[sd]|subs[sd]|muls[sd]|divs[sd]|sqrts[sd]|mins[sd]|maxs[sd]|'
    r'addp[sd]|subp[sd]|mulp[sd]|divp[sd]|minp[sd]|maxp[sd]|addss|mulss|divss|subss|'
    r'haddp[sd]|hsubp[sd]|shufp[sd]|blendp[sd]|dpp[sd]|unpckl|unpckh|'
    r'cvt[a-z0-9]+|rcpss|rsqrtss|sqrtp[sd]|'
    r'sar|sal|shl|shr|rol|ror|bsr|bsf|popcnt|'
    r'pmul|padd|psub|pand|por|pxor|pcmp|pmax|pmin|pshuf|pslld|psrld|psllq|psrlq|'
    r'andp[sd]|orp[sd])', re.I)

def _mnem_ops(line):
    line = re.split(r'\s##', line)[0].rstrip()
    if "\t" in line:
        body = line.split("\t", 1)[1].strip()
    else:
        # label or malformed
        return None, None
    parts = body.split(None, 1)
    if not parts:
        return None, None
    return parts[0].lower(), (parts[1] if len(parts) > 1 else "")

def _is_frame(mn, ops):
    if mn in ("push","pushq","pop","popq","leave","ret","retq","nop","nopl","nopw","endbr64","hint","int3","ud2"):
        return True
    if mn.startswith("mov") and re.search(r'%rsp,\s*%rbp\s*$', ops): return True
    if mn.startswith("mov") and re.search(r'%rbp,\s*%rsp\s*$', ops): return True
    if mn in ("sub","subq","add","addq") and re.search(r'\$0x[0-9a-f]+,\s*%rsp\s*$', ops): return True
    return False

# memory dest (STORE): last operand is `off(%reg)` or `(%reg)`; reg not rsp/rbp/rip.
RE_STORE_DEST = re.compile(r',\s*-?(0x[0-9a-fA-F]+)?\((%r[a-z0-9]+)(?:,[^)]*)?\)\s*$')
# memory src (LOAD): first operand is `off(%reg)`; dest is a register.
RE_LOAD_SRC  = re.compile(r'^\s*-?(0x[0-9a-fA-F]+)?\((%r[a-z0-9]+)(?:,[^)]*)?\),\s*%[a-z0-9]+\s*$')
def _mem_kind(ops):
    m = RE_STORE_DEST.search(ops)
    if m and m.group(2) not in ("%rsp", "%rbp", "%rip"):
        return "store"
    m = RE_LOAD_SRC.match(ops)
    if m and m.group(2) not in ("%rip",):
        return "load"
    return None

RE_INDIRECT = re.compile(r'^(call|callq|jmp|jmpq)\b.*\*')          # callq *0x48(%rax)
RE_DIRECTCALL = re.compile(r'^(call|callq)\b(?!.*\*)')             # callq <named/abs>
RE_REGREG = re.compile(r'^%[a-z0-9]+,\s*%[a-z0-9]+\s*$')           # mov %rax,%rdi (marshalling)
RE_XORZERO = re.compile(r'^(xorps|xorpd|pxor|xor|xorl|xorq)\s+%([a-z0-9]+),\s*%\2\s*$')
RE_CMP = re.compile(r'^(cmp|test|ucomis[sd]|comis[sd])', re.I)

def classify(path):
    if not path or not os.path.exists(path):
        return {"class": "UNKNOWN", "reason": "no disasm file"}
    text = open(path, errors="replace").read()
    # A ZERO-BYTE .s IS NOT EVIDENCE OF AN EMPTY FUNCTION. It means the disassembly could not be
    # produced — usually the wrong framework was passed to disasm.sh (the symbol lives elsewhere),
    # or an ICF blowup was truncated. Falling through would count 0 stores / 0 calls / 0 instrs and
    # classify EMPTY, which is INDISTINGUISHABLE from a genuinely empty body — so a no-op TS port of
    # a REAL function would be accepted as faithful. reviewer-03 hit this on #276. Audited when this
    # guard was added: 197 zero-byte .s files existed in the cache and 24 of them named symbols with
    # a real body in a DIFFERENT framework, i.e. 24 live opportunities for that false verdict.
    if not text.strip():
        return {"class": "UNKNOWN",
                "reason": "empty disasm file — could not disassemble (wrong framework? ICF?); "
                          "NOT evidence of an empty body"}
    if UD2.search(text):
        return {"class":"TRAP","stores":0,"compute":0,"direct_calls":0,"indirect_calls":0,
                "loads":0,"cmp_data":0,"instrs":0,"reason":"ud2 present"}
    stores = compute = direct_calls = indirect_calls = loads = cmp_data = cmp_guard = n = 0
    for line in text.splitlines():
        if not RE_INSN_LINE.match(line):
            continue
        mn, ops = _mnem_ops(line)
        if mn is None:
            continue
        n += 1
        if _is_frame(mn, ops):
            continue
        if RE_INDIRECT.match(mn + " " + ops):
            indirect_calls += 1; continue
        if RE_DIRECTCALL.match(mn + " " + ops):
            direct_calls += 1; continue
        if RE_XORZERO.match(mn + " " + ops):
            continue  # zero a reg (arg setup / return-0 idiom)
        if COMPUTE.match(mn) and mn != "lea":
            compute += 1; continue
        if mn == "lea":
            # lea is address math; count as compute only if it's not a trivial stack/rip form
            if not re.search(r'\(%r(sp|bp|ip)\)', ops):
                compute += 1
            continue
        if RE_CMP.match(mn):
            # a compare that reads a memory field is data logic; a bare reg/imm compare is a guard.
            if re.search(r'\(%r[a-z0-9]+\)', ops):
                cmp_data += 1
            else:
                cmp_guard += 1
            continue
        if mn.startswith("mov") or mn in ("movaps","movups","movsd","movss","movdqa","movdqu"):
            k = _mem_kind(ops)
            if k == "store": stores += 1; continue
            if k == "load":  loads += 1;  continue
            # reg-reg mov = marshalling; imm->reg = const load (light) — neither is "work"
            continue
        # set*/cmov/other -> light control, ignore
    real = stores + compute + direct_calls
    # DISPATCH_ONLY: indirect dispatch present, but no store/arith/direct-call and no data compare.
    if indirect_calls >= 1 and real == 0 and cmp_data == 0:
        cls = "DISPATCH_ONLY"
    elif real >= 1 or cmp_data >= 1 or loads >= 2:
        cls = "REAL"
    else:
        cls = "EMPTY"
    return {"class":cls,"stores":stores,"compute":compute,"direct_calls":direct_calls,
            "indirect_calls":indirect_calls,"loads":loads,"cmp_data":cmp_data,
            "cmp_guard":cmp_guard,"instrs":n,
            "reason":"stores=%d compute=%d direct=%d indirect=%d loads=%d cmpdata=%d"
                     % (stores,compute,direct_calls,indirect_calls,loads,cmp_data)}

def _pick(cands):
    """Deterministic choice among candidate .s files.

    `glob` returns readdir order, so `c[0]` picked a DIFFERENT file on different machines/runs —
    i.e. the same PR could be classified REAL on one gate run and EMPTY on the next. Sort, and
    prefer the SHORTEST basename: the exact `<FW>.<sym>.s` always sorts ahead of decorated
    siblings (`.cold`, `.part`, template instantiations that merely contain the key).
    """
    cands = [c for c in cands if os.path.basename(c).endswith(".s")]
    return sorted(cands, key=lambda p: (len(os.path.basename(p)), os.path.basename(p)))[0] if cands else None


def _is_mangled(key):
    """True for an Itanium mangled symbol (`_Z...` / `__Z...`), false for a bare Class/method name."""
    return re.match(r'_+Z', key) is not None


def _ident_matches(ident):
    """Files that name IDENT as a WHOLE name component — never as a loose substring.

    WRONG-CLASS COLLISION (reviewer-2, 2026-08-10): the plain `*<ident>*.s` glob below is safe for a
    full mangled symbol but catastrophic for a bare CLASS name, because a class name is very often a
    substring of ANOTHER class's name. `find_disasm("HGRenderNode")` returned
    `__ZN18OZHGRenderNodeBase8finishedEv.s` — a different class, classified DISPATCH_ONLY — so G5
    hard-rejected an honest two-store port (PR #253) as "a pure dispatch shell". Measured over the
    1,564 class files in raw-port/src: 83 (5.3%) resolved their class-key fallback to a DIFFERENT
    class's disassembly — 1 DISPATCH_ONLY (false REJECT) and, far worse, 19 EMPTY: an EMPTY verdict
    on the wrong class's body is how an empty-body-for-REAL-work port passes G5 silently, which is
    exactly the OZChannelBase::parseElement cheat (CHEAT_INCIDENT_2026-07-29) coming back through a
    second door. The class-key fallback only fires when the exact symbol's .s is missing — the
    NORMAL state in a freshly leased pool worktree, since re/disasm is gitignored (OPS_LOG #16).

    Whole-component means either:
      * the Itanium length-prefixed form `<len><ident>` inside a mangled name, not preceded by
        another digit — `12HGRenderNode` matches `__ZN12HGRenderNode...` and can NOT match
        `__ZN18OZHGRenderNodeBase...`; or
      * a whole dot-delimited component of the human form `<FW>.<Class>.<method>.s`.
    """
    hits = set()
    for pat in (f"*.{ident}.s", f"*.{ident}.*.s", f"{ident}.*.s"):
        hits.update(glob.glob(os.path.join(DISASM, pat)))
    rx = re.compile(r'(?<![0-9])%d%s' % (len(ident), re.escape(ident)))
    for p in glob.glob(os.path.join(DISASM, f"*{ident}*.s")):
        if rx.search(os.path.basename(p)):
            hits.add(p)
    return {h for h in hits if ".cold" not in h and "invoke" not in h and "proxy" not in h}


def find_disasm(sym_or_class):
    san = re.sub(r'[^A-Za-z0-9_]', '', sym_or_class)
    # A BARE identifier (class or method name) must match a whole name component — see
    # _ident_matches. Only a full mangled symbol may use the loose substring glob. Either way we
    # fall through to the dotted-form fallback below when nothing matches, so the reviewer-08
    # `<FW>.<Class>.<method>.s` fix keeps working.
    if not _is_mangled(san) and re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', san):
        p = _pick(_ident_matches(san))
        if p:
            return p
    else:
        c = glob.glob(os.path.join(DISASM, f"*{san}*.s"))
        if c:
            return _pick(c)
    # FILENAME LENGTH CAP (mirrors disasm.sh): names >200 chars are written as
    # "<prefix>.<san[:200]>__H<sha1(san)[:16]>.s" because the full sanitized mangled overflows the
    # 255-byte filename limit (318 STL __tree/__hash_table instantiations). Recompute the capped
    # form here so those files ARE found (else classify returns UNKNOWN and G5 silently passes).
    if len(san) > 200:
        import hashlib
        h = hashlib.sha1(san.encode()).hexdigest()[:16]
        capped = san[:200] + "__H" + h
        c = glob.glob(os.path.join(DISASM, f"*{capped}*.s"))
        if c:
            return _pick(c)
    # CHEAT INCIDENT 2026-07-29 (reviewer-08): workers/reviewers save disasm in the human-friendly
    # dotted form `<FW>.<Class>.<method>.s`, but the sanitized-mangled glob above strips the dots so
    # e.g. "OZChannelBase.parseElement" -> "OZChannelBaseparseElement" never matches
    # "ProChannel.OZChannelBase.parseElement.s". Fall back to a dotted-form glob keyed on the last
    # two dotted components (Class.method) so those files ARE found -> classify no longer returns
    # UNKNOWN -> G5 no longer silently passes an empty-body-for-REAL-work port.
    parts = [p for p in re.split(r'[^A-Za-z0-9_]+', sym_or_class) if p]
    if len(parts) >= 2:
        cls, meth = parts[-2], parts[-1]
        for pat in (f"*.{cls}.{meth}.s", f"*.{cls}.{meth}.*.s"):
            c = [h for h in glob.glob(os.path.join(DISASM, pat))
                 if ".cold" not in h and "invoke" not in h and "proxy" not in h]
            if c:
                return _pick(c)
    elif len(parts) == 1:
        for pat in (f"*.{parts[0]}.s",):
            c = glob.glob(os.path.join(DISASM, pat))
            if c:
                return _pick(c)
    return None

if __name__ == "__main__":
    import json
    for a in sys.argv[1:]:
        p = a if os.path.exists(a) else find_disasm(a)
        print("%-14s %s" % (classify(p)["class"], a), "->", json.dumps(classify(p)))
