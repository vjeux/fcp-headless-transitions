#!/usr/bin/env python3
"""static_check.py — decide if an exported symbol is SAFE to call via dlsym with NO constructed object.

A C++ INSTANCE method receives `this` in rdi (System V AMD64 / the x86_64 slice we disassemble). If
we call it via dlsym and pass only the declared args, rdi holds garbage and any `this` deref
segfaults or returns garbage — a FALSE oracle (proven: PCException::report() @ProCore segfaults).

A symbol is SELF-CONTAINED (safe to oracle without an object) iff its body NEVER uses rdi as a base
pointer for a memory access before rdi is overwritten by a real arg. Heuristic, conservative:
  - FREE function (no `::` in demangled)                    -> SAFE (no this).
  - method whose disasm never dereferences rdi/edi/dil as a pointer (no `(%rdi)`, `off(%rdi)`,
    and rdi isn't moved into another reg that is then dereferenced) BEFORE any arg clobbers it -> SAFE.
  - `const` method or any `(%rdi)` deref -> UNSAFE (needs a real object).

We return (safe: bool, reason). Deliberately biased toward UNSAFE: a wrong SAFE creates a crashing/
fake oracle, which is worse than routing to Tier-3.
"""
import re, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
DISASM_SH = os.path.join(HERE, "..", "..", "tools", "disasm.sh")
DISASM_DIR = os.path.join(HERE, "..", "..", "re", "disasm")

def _disasm(sym, fw):
    safe = re.sub(r'[^A-Za-z0-9_]', '', sym)
    pfx = "" if fw == "Ozone" else fw + "."
    p = os.path.join(DISASM_DIR, f"{pfx}{safe}.s")
    if not (os.path.exists(p) and os.path.getsize(p) > 0):
        try:
            subprocess.run(["bash", DISASM_SH, "--sym", sym, fw],
                           capture_output=True, text=True, timeout=120)
        except Exception:
            return None
    return p if (os.path.exists(p) and os.path.getsize(p) > 0) else None

# rdi/edi/di/dil used as a MEMORY BASE: (%rdi), 0x..(%rdi), or after mov %rdi,%rX then (%rX)
RE_RDI_DEREF = re.compile(r'\(%rdi\)|0x[0-9a-f]+\(%rdi\)|-?0x[0-9a-f]+\(%rdi\)')
RE_MOV_RDI_TO = re.compile(r'^\s*mov[a-z]*\s+%rdi,\s*%(r[a-z0-9]+)\b')
RE_RDI_WRITTEN = re.compile(r',\s*%rdi\s*$|,\s*%edi\s*$')  # rdi overwritten by something (arg no longer this)

def is_self_contained(demangled, sym, fw):
    if "::" not in (demangled or ""):
        return True, "free function (no this)"
    # const instance methods always read this; unsafe.
    if re.search(r'\)\s*const\s*$', demangled or ""):
        return False, "const instance method (reads this)"
    p = _disasm(sym, fw)
    if not p:
        return False, "no disasm to confirm static-ness (conservative unsafe)"
    text = open(p, errors="replace").read()
    lines = [l.split("\t",1)[1].strip() if "\t" in l else l.strip()
             for l in text.splitlines() if re.match(r'^\s*[0-9a-f]{4,}\s', l)]
    tracked = {"rdi"}   # regs currently holding `this` (or a copy)
    for ins in lines:
        # any deref of a tracked reg = uses this
        for r in list(tracked):
            if re.search(r'\(%' + r + r'\)|0x[0-9a-f]+\(%' + r + r'\)', ins):
                return False, f"derefs {r} (this) at: {ins[:50]}"
        # mov %rdi,%rX propagates this-tracking
        m = RE_MOV_RDI_TO.match(ins)
        if m:
            tracked.add(m.group(1))
        # if rdi is overwritten by a non-this value, stop tracking it
        if RE_RDI_WRITTEN.search(ins) and not RE_MOV_RDI_TO.match(ins):
            tracked.discard("rdi")
    return True, "no this deref found (static-like)"

if __name__ == "__main__":
    import sys, json
    # args: <mangled> <fw> <demangled...>
    sym, fw = sys.argv[1], sys.argv[2]
    dem = " ".join(sys.argv[3:])
    print(json.dumps(dict(zip(("safe","reason"), is_self_contained(dem, sym, fw)))))
