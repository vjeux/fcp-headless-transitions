#!/usr/bin/env python3
"""autoreg.py — auto-generate executable-oracle descriptors for PURE NUMERIC exported symbols.

The Layer-1 oracle (diff_oracle.py) is the strongest, un-gameable proof but today covers only the
few hand-written registry.json nodes. This scales it: it scans the ledgers for `ported` methods
whose DEMANGLED signature is PURE NUMERIC — args are only scalars (double/float/int/uint/bool) and
`double*`/`float*` arrays (const = input, non-const = in/out), return is a scalar or void — AND that
are EXPORTED (dlsym-callable, nm 'T'). For each, it emits a diff_oracle descriptor:
  {framework, symbol(mangled), signature{args:[{kind,ctype,name,[len]}], ret}, outputs, module, export}

A worker then MUST make the TS port bit/tol-exact vs the live FCP symbol — the un-gameable Tier-1
completion gate. Functions that AREN'T pure-numeric-exported are left to Tier-3 (classify+reach+reviewer).

This is deliberately CONSERVATIVE about what it calls "pure": pointer/ref to a CLASS, template args,
ObjC, variadic, or unknown scalar => SKIP (not oracle-able here; Tier-3). No guessing of array
lengths for opaque pointers — only `double*`/`float*` whose length we can bound are marshalled, and
those default to a small fixed probe length flagged for the worker to confirm from the disasm.
"""
import json, os, re, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
LED = os.path.join(REPO, "raw-port", "army", "ledger")
FW_BIN = {
  "ProCore":    "/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore",
  "ProChannel": "/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel",
  "Helium":     "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium",
  "Ozone":      "/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone",
}

SCALAR = {
  "double": "double", "float": "float",
  "int": "int", "unsigned int": "uint", "unsigned": "uint",
  "long": "long", "unsigned long": "ulong", "long long": "long",
  "bool": "bool",
}
# pointer-to-scalar array types we can marshal (const = input; non-const = in/out)
PTR_SCALAR = re.compile(r'^(double|float)\s*(const)?\s*\*$|^(double|float)\s+const\s*\*$')

_DISASM_SH = os.path.join(REPO, "raw-port", "tools", "disasm.sh")
_static_cache = {}

def _is_self_contained(fw, sym, demangled):
    """True iff the function is oracle-callable in isolation WITHOUT a constructed object.

    SAFE RULE: only FREE functions (no '::' in the demangled name) qualify. A method — even a static
    one — cannot be reliably distinguished from an instance method by demangle or disasm (both deref
    %rdi: an instance method derefs `this`, a free fn derefs a pointer ARG). Emitting a descriptor for
    an instance method makes the oracle call it with a fuzzed scalar as `this` -> SEGFAULT / fabricated
    values (proven: PCException::report -> exit 139), which POISONS the oracle. Conservative is correct:
    a false "unsafe" just routes to Tier-3 (the reviewer can hand-build a static-method descriptor).
    """
    if "::" in (demangled or ""):
        return False
    # extra guard: reject ObjC/blocks/anonymous just in case
    if demangled.startswith(("-[", "+[")) or "anonymous namespace" in demangled:
        return False
    return True

_exported_cache = {}
def _exported_syms(fw):
    if fw in _exported_cache: return _exported_cache[fw]
    b = FW_BIN.get(fw)
    s = set()
    if b and os.path.exists(b):
        out = subprocess.run(["nm","-arch","x86_64",b], capture_output=True, text=True).stdout
        for line in out.splitlines():
            parts = line.split()
            if len(parts) >= 3 and parts[1] == "T":
                s.add(parts[2])  # __ZN... (nm form with two leading underscores)
    _exported_cache[fw] = s
    return s

def _split_args(argstr):
    """Split 'double const*, double' honoring template/paren nesting."""
    args=[]; depth=0; cur=""
    for ch in argstr:
        if ch in "<([": depth+=1
        elif ch in ">)]": depth-=1
        if ch=="," and depth==0:
            args.append(cur.strip()); cur=""
        else: cur+=ch
    if cur.strip(): args.append(cur.strip())
    return [a for a in args if a and a!="void"]

DISASM_SH = os.path.join(REPO, "raw-port", "tools", "disasm.sh")

def _derefs_this(fw, mangled):
    """True if the function reads its FIRST integer arg register as a `this` pointer — i.e. it is a
    NON-STATIC member fn that would segfault when called via dlsym with no object. We re-derive the
    disasm from the binary and look for a dereference of the incoming `this` register before it is
    overwritten. x86_64 SysV: first int arg = %rdi. A member fn's `this` is %rdi on entry; a deref is
    `mov/movzx/... N(%rdi), ...` or `... (%rdi) ...` or passing %rdi as an object to a call. Free/
    static fns use %rdi as their first REAL arg — but a PURE-NUMERIC signature (our filter) puts the
    first real arg in %rdi only if it is an INTEGER/POINTER param; a pure fn taking only doubles uses
    %xmm0.., so ANY %rdi deref in a pure-double sig is a `this` deref. Conservative: on ANY doubt,
    return True (skip -> Tier-3), never emit a crashing oracle descriptor."""
    try:
        import subprocess as _sp
        _sp.run(["bash", DISASM_SH, "--sym", mangled, fw], cwd=REPO,
                capture_output=True, text=True, timeout=120)
    except Exception:
        return True
    safe = re.sub(r"[^A-Za-z0-9_]", "", mangled)
    pfx = "" if fw == "Ozone" else fw + "."
    dpath = os.path.join(REPO, "raw-port", "re", "disasm", f"{pfx}{safe}.s")
    if not (os.path.exists(dpath) and os.path.getsize(dpath) > 0):
        return True  # can't verify -> assume unsafe
    text = open(dpath, errors="replace").read()
    # If %rdi (or its 32-bit %edi) is dereferenced or moved into another reg that is then dereferenced
    # / passed, treat as `this` use. Simplest robust signal: a memory operand using %rdi, or %rdi
    # copied to %rXX and that reg dereferenced. We do the direct check + the common `mov %rdi,%rNN`
    # alias then `(%rNN)` deref.
    lines = [l.split("##")[0] for l in text.splitlines() if "	" in l]
    # direct deref of rdi
    for l in lines:
        if re.search(r'\((%rdi)\)', l) or re.search(r'0x[0-9a-f]+\(%rdi\)', l):
            return True
    # alias: mov %rdi,%rXX ; then any deref of %rXX
    aliases = set()
    for l in lines:
        m = re.search(r'mov[q]?\s+%rdi,\s*%(r[a-z0-9]+)', l)
        if m: aliases.add("%"+m.group(1))
    for al in aliases:
        for l in lines:
            if re.search(r'\(' + re.escape(al) + r'\)', l) or re.search(r'0x[0-9a-f]+\(' + re.escape(al) + r'\)', l):
                return True
    return False

def parse_pure(demangled):
    """Return (arg_specs, ret_ctype) if the signature is PURE NUMERIC and oracle-able, else None.
    arg_specs is a list of dicts {kind,ctype,name,[len]}. Only free functions / static-like sigs
    with pure scalar/scalar-array params qualify. Anything with a class ptr/ref, template, ObjC,
    or `this` (a non-static member) is rejected (Tier-3)."""
    # must look like `name(args)` possibly with `const` suffix; strip trailing qualifiers
    m = re.match(r'^(.*?)\((.*)\)\s*(const)?\s*$', demangled)
    if not m: return None
    name = m.group(1).strip()
    # reject ObjC / anonymous / operator / dtor / template on the NAME
    if name.startswith(("-[","+[")) or "anonymous namespace" in demangled or "operator" in name:
        return None
    argstr = m.group(2).strip()
    args = _split_args(argstr)
    specs = []
    for i,a in enumerate(args):
        a = a.strip()
        base = a.replace("const","").strip()
        if a in SCALAR:
            specs.append({"kind":"in","ctype":SCALAR[a],"name":f"a{i}"})
        elif base in SCALAR and "const" in a and "*" not in a and "&" not in a:
            specs.append({"kind":"in","ctype":SCALAR[base],"name":f"a{i}"})
        elif PTR_SCALAR.match(a):
            elem = "double" if "double" in a else "float"
            is_const = "const" in a
            # const scalar* = input array; non-const = in/out (treat as in_array probe, worker confirms len)
            specs.append({"kind":"in_array","ctype":elem,"name":f"a{i}","len":4,"_needs_len":True})
        else:
            return None  # a class ptr/ref/template/unknown -> not pure -> Tier-3
    return specs, name

def scan(limit=None):
    out = []
    for fw in ["ProCore","ProChannel","Helium","Ozone"]:
        p = f"{LED}/{fw}.ledger.json"
        if not os.path.exists(p): continue
        led = json.load(open(p))
        exp = _exported_syms(fw)
        for cls, ms in led.items():
            for k, v in ms.items():
                if v.get("status") != "ported": continue
                d = v.get("demangled"); m = v.get("mangled")
                if not d or not m: continue
                if m not in exp:  # not dlsym-callable
                    continue
                parsed = parse_pure(d)
                if not parsed: continue
                specs, fnname = parsed
                # SAFETY: a member fn (Class::method) called via dlsym with no object segfaults or
                # returns garbage (proven: PCException::report() -> SIGSEGV). Only emit a descriptor
                # when the fn does NOT dereference `this`. Free fns (no ::) are always safe.
                if "::" in fnname and _derefs_this(fw, m):
                    continue
                # CRITICAL: an instance method needs a constructed `this` — calling it via dlsym with
                # a fuzzed scalar this SEGFAULTS / fabricates values (proven: PCException::report ->
                # exit 139). Only emit a descriptor when the disasm proves the fn never derefs rdi.
                if not _is_self_contained(fw, m, d):
                    continue
                out.append({"framework":fw,"symbol":m,"demangled":d,"class":cls,
                            "signature":{"args":specs,"ret":"double"},  # ret assumed scalar; worker/oracle refines
                            "outputs":["ret"]})
                if limit and len(out)>=limit: return out
    return out

if __name__ == "__main__":
    res = scan(limit=int(sys.argv[1]) if len(sys.argv)>1 else None)
    print(f"# {len(res)} PURE-NUMERIC exported ported symbols oracle-able (Tier-1 candidates)")
    for r in res[:40]:
        na = len(r["signature"]["args"])
        print(f"  {r['framework']:10} {r['demangled'][:70]}")
