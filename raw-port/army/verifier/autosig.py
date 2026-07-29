#!/usr/bin/env python3
"""autosig.py — parse a demangled C++ signature into an oracle ctypes plan, when it is SAFE to.

The executable oracle (Layer 1) needs a typed signature: which args are scalar-in, which are
array-in (T const*), which are out-params (T* written). We can auto-derive this ONLY for signatures
composed of ABI-simple types — scalars (double/float/int/uint/long/bool) and pointers to those
(double*, double const*, ...). Anything with a class/struct/template/ref-to-object arg is NOT
auto-oracle-able in isolation (needs a constructed object) -> return None (falls to Tier-2/3).

This is deliberately CONSERVATIVE: a False "not auto-oracle-able" just routes to the reviewer; a
False "auto-oracle-able" with a wrong marshalling could mis-verify, so we only accept signatures we
can marshal unambiguously. Array LENGTHS are unknown from the signature alone; we mark array args
`in_array` with len=None and the caller must supply a length (from the disasm/port) or skip.
"""
import re

SCALAR = {
    "double": "double", "float": "float",
    "int": "int", "unsigned int": "uint", "unsigned": "uint",
    "long": "long", "unsigned long": "ulong", "long long": "long",
    "bool": "bool", "char": "int", "unsigned char": "uint",
    "short": "int", "unsigned short": "uint",
    "size_t": "ulong", "int32_t": "int", "uint32_t": "uint",
    "int64_t": "long", "uint64_t": "ulong", "float const": "float", "double const": "double",
}

def _split_args(argstr):
    args, depth, cur = [], 0, ""
    for ch in argstr:
        if ch in "<([": depth += 1
        elif ch in ">)]": depth -= 1
        if ch == "," and depth == 0:
            args.append(cur.strip()); cur = ""
        else:
            cur += ch
    if cur.strip(): args.append(cur.strip())
    return args

def parse_demangled(demangled, allow_static=False):
    """Return {"name","args":[{kind,ctype,[len]}],"ret"} or None if not ABI-simple/auto-safe.

    allow_static=True accepts Class::method(...) signatures whose args are all ABI-simple — these are
    oracle-callable IFF the method is STATIC (no implicit `this`). The caller must confirm static-ness
    from the disasm (does not deref rdi as this); autosig only checks the arg types are marshalable.
    """
    demangled = demangled.strip()
    if "(anonymous namespace)" in demangled: return None
    m = re.match(r'^([\w:]+(?:<[^>]*>)?)\s*\((.*)\)\s*(const)?\s*$', demangled)
    if not m: return None
    name, argstr = m.group(1), m.group(2).strip()
    if argstr in ("", "void"):
        raw_args = []
    else:
        raw_args = _split_args(argstr)
    is_method = "::" in name
    # A non-static METHOD has an implicit `this` we can't fabricate -> not auto-oracle-able.
    # Free functions are always safe; methods only when the caller opts in (allow_static) AND later
    # confirms static-ness from the disasm.
    if is_method and not allow_static:
        return None
    # ctors/dtors are never pure oracle targets (they mutate `this`).
    leaf = name.split("::")[-1]
    cls = name.split("::")[-2] if "::" in name else ""
    if leaf.startswith("~") or (cls and leaf == cls):
        return None
    out = []
    for a in raw_args:
        a2 = a.replace("const", "").strip()
        is_ptr = "*" in a2
        is_ref = "&" in a2
        base = a2.replace("*", "").replace("&", "").strip()
        if base not in SCALAR:
            return None  # class/struct/template/unknown -> not auto-safe
        ct = SCALAR[base]
        if is_ref:
            return None  # ref-to-scalar: could be in or out; ambiguous -> skip (reviewer)
        if is_ptr:
            out.append({"kind": "in_array", "ctype": ct, "len": None})
        else:
            out.append({"kind": "in", "ctype": ct})
    if not out:
        return None  # zero-arg fns have nothing to fuzz meaningfully
    ret = "double"  # default; many pure-math return double. Caller can refine from disasm/TS.
    return {"name": name, "args": out, "ret": ret, "auto": True,
            "needs_static_check": is_method}

if __name__ == "__main__":
    import sys, json
    for d in sys.argv[1:]:
        print(d, "->", json.dumps(parse_demangled(d)))
