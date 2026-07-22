"""
fct.parity.oracle — call INDIVIDUAL real FCP functions directly (function-level oracle).

This is the foundation of the SUBSYSTEM PARITY program (see README.md). Unlike
fct/faithful/ (which renders whole primitives through the pipeline and scores frame
PSNR), this calls one exported C++ symbol out of FCP's own frameworks via dlsym and
reads its exact numeric output — so we can prove our TypeScript port of that ONE
function is bit-for-bit (or tol-for-tol) equivalent to Apple's, in isolation.

PROVEN CAPABILITY (2026-07-22): the pure-math frameworks (ProCore, ProChannel, Helium,
Lithium) dlopen and dlsym cleanly WITHOUT the Ozone engine boot and WITHOUT
DYLD_FRAMEWORK_PATH — they have no unresolved sibling deps at load. So a function-level
oracle is cheap (no ~1.3s engine cold-boot, no GL context, no venv/pyobjc). Verified
that easeInOut / HGLinearFilter::gaussian / CIToHGBlurRadius / OZBezierEval / PCMath::cubic
return values matching this repo's TS port exactly.

ABI notes (arm64 AAPCS64):
  - `double`/`float` args go in the SIMD/FP registers (d0.. / s0..); ctypes handles this
    when argtypes are c_double / c_float.
  - `int` args go in x0.. ; ctypes c_int handles it.
  - A `T*` (pointer / array / out-param) goes in the next general register; ctypes
    POINTER(...) handles it. We allocate arrays for `in_array` and read-back cells for
    `out`.
  - dlsym strips exactly ONE leading underscore vs `nm` output: nm shows `__ZN6PCMath9...`,
    dlsym wants `_ZN6PCMath9...` (drop one underscore). We normalize automatically.

A registry entry (registry.json) declares each function's framework, mangled symbol,
typed signature, and which named outputs to compare. This module turns that spec into a
live callable and returns a dict of named outputs.
"""
import ctypes
import os

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"

# Framework short-name -> absolute dylib path inside the FCP bundle.
FRAMEWORKS = {
    "ProCore":    FW + "/ProCore.framework/Versions/A/ProCore",
    "ProChannel": FW + "/ProChannel.framework/Versions/A/ProChannel",
    "Helium":     FW + "/Helium.framework/Versions/A/Helium",
    "Lithium":    FW + "/Lithium.framework/Versions/A/Lithium",
    "Ozone":      FW + "/Ozone.framework/Versions/A/Ozone",
    "ProGL":      FW + "/ProGL.framework/Versions/A/ProGL",
}

# ctype-name -> (ctypes scalar type). The signature language uses these names.
_CTYPES = {
    "double": ctypes.c_double,
    "float":  ctypes.c_float,
    "int":    ctypes.c_int,
    "uint":   ctypes.c_uint,
    "long":   ctypes.c_longlong,
    "ulong":  ctypes.c_ulonglong,
    "bool":   ctypes.c_bool,
    "void":   None,
}

_loaded = {}  # framework short-name -> ctypes.CDLL (cached; process-global, idempotent)


class OracleError(Exception):
    pass


# FCP frameworks reference each other by @rpath (e.g. ProChannel depends on
# @rpath/ProCore.framework). Loaded standalone WITHOUT DYLD_FRAMEWORK_PATH, dyld can't
# resolve those @rpath deps, so a dependent framework fails to load UNLESS its dependency
# is already resident in the process. That made load order matter (ProChannel worked only
# after ProCore was loaded). To be load-order-independent we eagerly load the base
# dependency chain first, and on any residual "@rpath/X.framework" miss we recursively load
# X and retry. This keeps the oracle bootable from any entry point (no re-exec, no DYLD).
import re as _re

# Absolute-path map for any framework we might need to satisfy an @rpath miss.
_RPATH_MAP = {os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(p)))): p
              for p in FRAMEWORKS.values()}
# ^ e.g. "ProCore.framework" -> .../ProCore.framework/Versions/A/ProCore

# Base dependency chain most math frameworks pull in; load first so @rpath resolves.
_BASE_DEPS = ["ProCore"]


def _dlopen_path(path):
    return ctypes.CDLL(path)


def load_framework(name):
    """dlopen an FCP framework (cached), resolving @rpath deps so load order doesn't matter.

    No DYLD/engine boot needed for pure-math libs; we satisfy inter-framework @rpath deps
    by pre-loading the base chain and recursively loading any framework dyld reports missing.
    """
    if name in _loaded:
        return _loaded[name]
    path = FRAMEWORKS.get(name)
    if path is None:
        raise OracleError("unknown framework %r (add it to oracle.FRAMEWORKS)" % name)
    if not os.path.exists(path):
        raise OracleError("framework dylib missing: %s (is FCP installed?)" % path)
    # Pre-load base deps (idempotent, cached) so @rpath references resolve.
    for dep in _BASE_DEPS:
        if dep != name and dep not in _loaded and os.path.exists(FRAMEWORKS.get(dep, "")):
            try:
                _loaded[dep] = _dlopen_path(FRAMEWORKS[dep])
            except OSError:
                pass
    for _attempt in range(6):
        try:
            lib = _dlopen_path(path)
            _loaded[name] = lib
            return lib
        except OSError as e:
            msg = str(e)
            m = _re.search(r"@rpath/([A-Za-z0-9_]+\.framework)", msg)
            if not m:
                raise OracleError("dlopen(%s) failed: %s" % (path, msg))
            missing_fw = m.group(1)
            dep_path = _RPATH_MAP.get(missing_fw)
            if not dep_path or not os.path.exists(dep_path):
                raise OracleError("dlopen(%s) needs %s which is not in oracle.FRAMEWORKS: %s"
                                  % (path, missing_fw, msg))
            try:
                _dlopen_path(dep_path)  # bring the dep resident, then retry `path`
            except OSError as de:
                raise OracleError("failed to preload dep %s for %s: %s"
                                  % (missing_fw, path, de))
    raise OracleError("dlopen(%s) failed after resolving @rpath deps" % path)


def _dlsym_name(symbol):
    """nm prints `__ZN...`; dlsym wants one fewer leading underscore. Normalize."""
    if symbol.startswith("__Z") or symbol.startswith("__ZN") or symbol.startswith("__Z"):
        return symbol[1:]
    # C symbols nm-print as `_foo`; dlsym wants `foo`. C++ mangled `__Z...` -> `_Z...`.
    if symbol.startswith("_Z"):
        return symbol
    if symbol.startswith("_"):
        return symbol[1:]
    return symbol


def resolve(framework, symbol):
    """Return a ctypes function pointer for an exported symbol, or raise OracleError."""
    lib = load_framework(framework)
    name = _dlsym_name(symbol)
    try:
        return lib[name]
    except AttributeError:
        raise OracleError(
            "symbol not found: %s (dlsym name %r) in %s. Only EXPORTED (nm 'T') symbols "
            "are callable; local ('t') symbols are not." % (symbol, name, framework))


def build_callable(entry):
    """Turn a registry `entry` (dict) into a python callable + arg plan.

    Returns (fn, plan) where plan describes how to marshal a named-args dict and
    read back named outputs. `entry['signature']` is:
        {"args": [ {kind, ctype, name, [len]} ... ], "ret": "double"|"void"|...}
    arg kinds:
        "in"        scalar input   (value taken from args[name])
        "in_array"  array input    (value taken from args[name], a list; needs `len`)
        "out"       scalar output  (allocated; read back as outputs["out_"+name] or name)
        "out_array" array output   (allocated; read back as a list)
    Named comparison outputs come from entry['outputs'] (a list of names); "ret" is the
    function's return value; "<name>" pulls an out-param.
    """
    sig = entry["signature"]
    fn = resolve(entry["framework"], entry["symbol"])
    argtypes = []
    plan = []  # ordered: (kind, ctype_name, name, length)
    for a in sig["args"]:
        kind = a["kind"]; cname = a["ctype"]; nm = a.get("name")
        length = a.get("len")
        ct = _CTYPES[cname]
        if kind == "in":
            argtypes.append(ct)
        elif kind in ("out", "out_array", "in_array"):
            argtypes.append(ctypes.POINTER(ct))
        else:
            raise OracleError("bad arg kind %r" % kind)
        plan.append((kind, cname, nm, length))
    fn.argtypes = argtypes
    ret = sig.get("ret", "void")
    fn.restype = _CTYPES[ret]
    return fn, plan


def call(entry, args):
    """Invoke the real FCP function with a named-args dict. Returns an outputs dict
    keyed by the names in entry['outputs'] (subset of {'ret', <out-param names>})."""
    fn, plan = build_callable(entry)
    call_args = []
    out_cells = {}  # name -> (ctype_obj or array_obj, length_or_None)
    for (kind, cname, nm, length) in plan:
        ct = _CTYPES[cname]
        if kind == "in":
            v = args[nm]
            call_args.append(ct(v) if cname in ("int", "uint", "long", "ulong", "bool") else v)
        elif kind == "in_array":
            vals = args[nm]
            arr = (ct * length)(*vals)
            call_args.append(arr)
        elif kind == "out":
            cell = ct(0)
            out_cells[nm] = (cell, None)
            call_args.append(ctypes.byref(cell))
        elif kind == "out_array":
            arr = (ct * length)()
            out_cells[nm] = (arr, length)
            call_args.append(arr)
    ret = fn(*call_args)
    outputs = {}
    for name in entry["outputs"]:
        if name == "ret":
            outputs["ret"] = ret
        elif name in out_cells:
            cell, length = out_cells[name]
            outputs[name] = list(cell) if length is not None else cell.value
        else:
            raise OracleError("output %r is neither 'ret' nor an out-param of %s"
                              % (name, entry["id"]))
    return outputs


if __name__ == "__main__":
    # Smoke test: call PCMath::easeInOut directly and print.
    entry = {
        "id": "PCMath_easeInOut",
        "framework": "ProCore",
        "symbol": "__ZN6PCMath9easeInOutEdddddPdS0_",
        "signature": {
            "args": [
                {"kind": "in", "ctype": "double", "name": "t"},
                {"kind": "in", "ctype": "double", "name": "easeIn"},
                {"kind": "in", "ctype": "double", "name": "easeOut"},
                {"kind": "in", "ctype": "double", "name": "v0"},
                {"kind": "in", "ctype": "double", "name": "v1"},
                {"kind": "out", "ctype": "double", "name": "outVal"},
                {"kind": "out", "ctype": "double", "name": "outDeriv"},
            ],
            "ret": "double",
        },
        "outputs": ["outVal", "outDeriv"],
    }
    for t in (0.0, 0.25, 0.5, 0.75, 1.0):
        o = call(entry, {"t": t, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})
        print("easeInOut(%.2f) ->" % t, o)
