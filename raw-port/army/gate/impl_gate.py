#!/usr/bin/env python3
"""impl_gate.py — SEMANTIC completeness gate (G5). REJECT a "port" whose body implements nothing.

The existing gate checks provenance (cites @0xADDR), typecheck (compiles), and — only for the ~65
transition parity nodes — bit-exact oracle. NONE of that catches the cheat vjeux flagged
(7385eb01 OZDynamicSpline::setVertexSmooth): a function whose entire body is `throw`-stubs (or calls
to local throwing stubs) yet cites addresses and compiles. It "passes" while implementing NOTHING.

This gate answers the ONE question the others don't: **does the TS body actually do work, or does it
just throw?** — measured against the decoded disassembly so a worker cannot satisfy it by writing an
all-throw shell.

METHOD (per exported function that carries an @0xADDR provenance line):
  1. Find its disassembly (re/disasm/<...>.s matching the cited addr / mangled sym).
  2. Classify the disasm:
       - TRAP    : contains `ud2`            -> the faithful port IS a throw. ACCEPT.
       - EMPTY   : only prologue+ret (push/mov rsp/pop/ret, <=2 real ops) -> no-op. ACCEPT.
       - REAL    : has arith/simd/mov-with-offset/cmp/convert/loop = genuine work to transcribe.
  3. Classify the TS function body (the statements between its `{` and matching `}`):
       - throwing = the body's only executable statements are `throw` or calls to local functions
         whose own body only throws (a "throw-stub"), plus trivial `return <const>`/early-exit.
       - real     = has >=1 field read/write, arithmetic op, indexing, real conditional on decoded
         data, or a call to a symbol that is NOT a throw-stub (a genuinely ported/extern-modeled fn).
  4. REJECT (exit 2) if disasm==REAL and TS body==throwing. That is the cheat: real machine work,
     zero transcribed work. TRAP/EMPTY disasm always pass (throw/empty is faithful there).

This is intentionally conservative: it only fires on the clear cheat (REAL disasm + all-throw body).
It does NOT try to prove numerical equivalence (that's G4/oracle's job where a symbol is callable).
"""
import re, sys, os, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
DISASM = os.path.join(ROOT, "re", "disasm")

# disasm instruction classes
RE_UD2      = re.compile(r'\bud2\b')
RE_REALWORK = re.compile(r'\b(add|sub|mul|div|imul|idiv|and|or|xor|shl|shr|sar|sal|inc|dec|neg|'
                         r'addsd|subsd|mulsd|divsd|sqrtsd|addss|mulss|divss|sqrtss|addpd|subpd|mulpd|'
                         r'minpd|maxpd|minsd|maxsd|haddpd|unpck|cvt|pinsr|pextr|paddq|paddd|psub|'
                         r'movups|movupd|movaps|movapd|movsd|movss|movdqu|movdqa|pand|por|pxor|'
                         r'cmp|test|ucomis|comis|sete|setne|seta|setb|setae|setbe|setg|setl|'
                         r'sar|rol|ror|lea)\b')
# a `mov <reg>, <offset>(<reg>)` (field read) or `mov ...(reg), reg` = real struct access
RE_FIELD    = re.compile(r'\b(mov[a-z]*)\b.*0x[0-9a-f]+\(%r')

def disasm_for(fw, addr_hex, mangled=None):
    """Find the .s file for a function by mangled sym or by fw+addr in the filename/content."""
    cands = []
    if mangled:
        san = re.sub(r'[^A-Za-z0-9_]', '', mangled)
        cands += glob.glob(os.path.join(DISASM, f"*{san}*.s"))
    # fall back: any .s whose body contains the address label
    if not cands and addr_hex:
        a = addr_hex.lstrip("0x").lstrip("0")
        for p in glob.glob(os.path.join(DISASM, "*.s")):
            try:
                head = open(p, errors="replace").read(4000)
            except Exception: continue
            if a and a in head.lower():
                cands.append(p)
    return cands[0] if cands else None

def classify_disasm(path):
    if not path or not os.path.exists(path): return "UNKNOWN"
    text = open(path, errors="replace").read()
    if RE_UD2.search(text): return "TRAP"
    lines = [l for l in text.splitlines() if re.match(r'^[0-9a-f]{6,}\s', l.strip()) or "\t" in l]
    real = 0
    for l in lines:
        ins = l.split("\t")[-1] if "\t" in l else l
        if RE_REALWORK.search(ins) or RE_FIELD.search(l):
            # ignore the bare prologue movs (mov %rsp,%rbp) — those aren't "work"
            if re.search(r'mov[q]?\s+%rsp,\s*%rbp', l): continue
            real += 1
    return "REAL" if real >= 3 else "EMPTY"

def ts_functions(text):
    """Yield (name, body) for each top-level `export function NAME(...) {...}` and helper `function`."""
    out = {}
    for m in re.finditer(r'\b(?:export\s+)?function\s+(\w+)\s*\(', text):
        name = m.group(1)
        # find the opening brace after the signature, then match to its close
        i = text.find("{", m.end())
        if i < 0: continue
        depth = 0; j = i
        while j < len(text):
            if text[j] == "{": depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0: break
            j += 1
        out[name] = text[i+1:j]
    return out

def body_is_throwing(body, all_fns):
    """True iff the body does NO real work — only throws / calls throw-stubs / trivial returns."""
    stmts = [s.strip() for s in re.split(r'[;\n]', body) if s.strip()
             and not s.strip().startswith(("//","*","/*"))]
    real = 0
    for s in stmts:
        if s.startswith(("throw","}","{","return true","return false","return;","return null",
                          "if (","} else","else","const ","let ")) and "throw" not in s:
            # a `const x = <expr>` that reads a field / does arith IS real work
            if s.startswith(("const ","let ")) and re.search(r'[.\[]|[+\-*/%&|^]|Math\.|fround|>>|<<', s):
                real += 1
            continue
        if s.startswith("throw"): continue
        # a call to a local throw-stub is NOT real work
        mcall = re.match(r'(\w+)\s*\(', s)
        if mcall and mcall.group(1) in all_fns and _fn_only_throws(all_fns[mcall.group(1)], all_fns):
            continue
        # anything else with an operator, indexing, field access, or a non-stub call = real
        if re.search(r'[.\[]|[+\-*/%&|^=]|Math\.|fround|>>|<<', s) or mcall:
            real += 1
    return real == 0

def _fn_only_throws(body, all_fns, _seen=None):
    _seen = _seen or set()
    stmts = [s.strip() for s in re.split(r'[;\n]', body) if s.strip()
             and not s.strip().startswith(("//","*","/*","}","{"))]
    for s in stmts:
        if s.startswith("throw"): continue
        if s.startswith(("return","if","else","const ","let ")) and "throw" not in s and \
           not re.search(r'[.\[]|[+\-*/%&|^]|Math\.', s): continue
        return False
    return True

def check(path):
    errs = []
    text = open(path, errors="replace").read()
    fns = ts_functions(text)
    # each exported function should have a provenance @<FW> 0xADDR near it
    for m in re.finditer(r'export\s+function\s+(\w+)', text):
        name = m.group(1)
        # find provenance addr in the 40 lines before the function
        pre = text[:m.start()]
        prov = re.findall(r'@(\w+)?\s*0x([0-9a-fA-F]{3,})', pre[-2000:])
        if not prov: continue   # provenance_gate handles the no-addr case
        fw = prov[-1][0] or "Ozone"; addr = "0x"+prov[-1][1]
        dpath = disasm_for(fw, addr, name)
        dclass = classify_disasm(dpath)
        if dclass != "REAL": continue          # TRAP/EMPTY/UNKNOWN -> not a cheat by this rule
        body = fns.get(name, "")
        if body_is_throwing(body, fns):
            errs.append(f"{path}: G5 CHEAT — {name} @{fw} {addr}: disasm has REAL work "
                        f"({os.path.basename(dpath) if dpath else '?'}) but TS body only throws/defers. "
                        f"Transcribe the actual instructions, don't stub the whole body.")
    return errs

def main():
    paths = [p for p in sys.argv[1:] if p.endswith(".ts")]
    if not paths:
        for dp,_,fs in os.walk(os.path.join(ROOT,"src")):
            for f in fs:
                if f.endswith(".ts"): paths.append(os.path.join(dp,f))
    errs=[]
    for p in paths:
        if os.path.exists(p): errs += check(p)
    for e in errs: print(e)
    print(f"\nimpl_gate: {len(errs)} cheat(s) across {len(paths)} file(s)  ->  {'REJECT' if errs else 'PASS'}")
    sys.exit(2 if errs else 0)

if __name__ == "__main__": main()
