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


def estimate_working_gamma(gamut=0):
    """Return FCP's OWN working-space gamma for a gamut via chained ProCore calls:
    PCGetWorkingColorSpaceGammaEquivalent(gamut) -> CGColorSpace*, then
    PCEstimateGamma(CGColorSpace*) -> float. gamut 0 = Rec.709, 1 = Rec.2020.

    This is a two-call oracle (the gamma function needs a colorspace OBJECT, not an enum),
    so it lives here rather than in the generic single-symbol build_callable. Verified: the
    Rec.709 working gamma is 1.9609375 — the authoritative source for the colour subsystem's
    gamma-1.958 working space (engine iv=0.51117 -> 1.9563, equal within 8-bit quantisation).
    PCEstimateGamma returns FLOAT (s0), not double.
    """
    lib = load_framework("ProCore")
    getcs = lib["PCGetWorkingColorSpaceGammaEquivalent"]
    getcs.restype = ctypes.c_void_p
    getcs.argtypes = [ctypes.c_int]
    cs = getcs(int(gamut))
    if not cs:
        raise OracleError("PCGetWorkingColorSpaceGammaEquivalent(%d) returned NULL" % gamut)
    est = lib["_Z15PCEstimateGammaP12CGColorSpace"]  # nm __Z... -> dlsym one underscore fewer
    est.restype = ctypes.c_float
    est.argtypes = [ctypes.c_void_p]
    return float(est(cs))


def read_helium_const_matrix(symbol, framework="Helium"):
    """Read a 4x4 float32 colour-space matrix stored as a DATA symbol in an FCP framework's
    __TEXT,__const (e.g. HGColorMatrix::sRGBtoYCbCr). These are BINARY CONSTANTS (the authoritative
    values FCP's colour ops use), not callable functions — so we resolve the symbol's file offset
    from the Mach-O arm64 slice and unpack 16 little-endian float32s. Returns the 4x4 as a list of
    4 rows. This is the exact-oracle equivalent of estimate_working_gamma for a matrix constant.

    Used to VERIFY the engine's hardcoded Rec.709 sRGB<->YCbCr matrix (the HSV-hue rotation basis,
    decoded 2026-07-23) against FCP's OWN stored matrix, bit-for-bit at the binary level."""
    import subprocess, struct
    binpath = FRAMEWORKS.get(framework)
    if not binpath or not os.path.exists(binpath):
        raise OracleError("framework binary not found for %s" % framework)
    # nm -> vmaddr of the demangled symbol
    out = subprocess.check_output(["nm", "-n", binpath], text=True, stderr=subprocess.DEVNULL)
    dem = subprocess.check_output(["c++filt"], input="\n".join(
        l.split()[2] for l in out.splitlines() if len(l.split()) >= 3), text=True).splitlines()
    addr = None
    for line, name in zip([l for l in out.splitlines() if len(l.split()) >= 3], dem):
        if name == symbol:
            try: addr = int(line.split()[0], 16)
            except Exception: pass
            break
    if addr is None:
        raise OracleError("symbol %r not found in %s" % (symbol, framework))
    # arm64 slice offset (fat binary) + section mapping
    lipo = subprocess.check_output(["lipo", "-detailed_info", binpath], text=True, stderr=subprocess.DEVNULL)
    arm_off = None
    cur_arm = False
    for l in lipo.splitlines():
        s = l.strip()
        if s.startswith("architecture arm64"): cur_arm = True
        elif s.startswith("architecture "): cur_arm = False
        elif cur_arm and s.startswith("offset "): arm_off = int(s.split()[1]); break
    if arm_off is None:
        raise OracleError("no arm64 slice in %s" % framework)
    otool = subprocess.check_output(["otool", "-arch", "arm64", "-l", binpath], text=True, stderr=subprocess.DEVNULL)
    secs = []; cur = {}
    for l in otool.splitlines():
        s = l.strip()
        if s.startswith("sectname"): cur = {"sect": s.split()[1]}
        elif s.startswith("addr "): cur["addr"] = int(s.split()[1], 16)
        elif s.startswith("size "): cur["size"] = int(s.split()[1], 16)
        elif s.startswith("offset ") and "addr" in cur:
            cur["offset"] = int(s.split()[1]); secs.append(cur); cur = {}
    foff = None
    for sec in secs:
        if "addr" in sec and sec["addr"] <= addr < sec["addr"] + sec.get("size", 0):
            foff = arm_off + sec["offset"] + (addr - sec["addr"]); break
    if foff is None:
        raise OracleError("could not map vmaddr %#x to file offset" % addr)
    with open(binpath, "rb") as f:
        f.seek(foff); raw = f.read(64)
    vals = struct.unpack_from("<16f", raw, 0)
    return [[vals[r * 4 + c] for c in range(4)] for r in range(4)]


def dsfmt_sequence(seed=0, n=16):
    """Return the first `n` close1_open2 doubles (in [1,2)) of FCP's OWN dSFMT (MEXP=19937)
    seeded with `seed`, via ProCore's RandMersenne. This is the exact RNG that PAENoise's
    Stage-1 white-noise gradient texture is filled from (byte = trunc((raw-1)*255)).

    RandMersenne is a C++ object; from the SetSeed disasm (ProCore 0x3388) the dsfmt_t lives
    at instance offset +0x8 and SetSeed(this,seed) calls dsfmt_chk_init_gen_rand(this+8, seed,
    19937). After seeding, idx==N64 (382) so the first draw regenerates; dsfmt_gen_rand_all
    fills status[0..381] which, reinterpreted as f64, IS the close1_open2 sequence (psfmt64).
    We drive it directly: allocate a >=0xc28-byte object, SetSeed, gen_rand_all, read doubles.
    Load-order-independent (ProCore only). No engine boot, no DYLD.
    """
    lib = load_framework("ProCore")
    set_seed = lib["_ZN12RandMersenne7SetSeedEm"]     # nm __ZN.. -> dlsym one fewer underscore
    set_seed.argtypes = [ctypes.c_void_p, ctypes.c_ulong]; set_seed.restype = None
    gen_all = lib["dsfmt_gen_rand_all"]                # nm _dsfmt.. -> dlsym drops one underscore
    gen_all.argtypes = [ctypes.c_void_p]; gen_all.restype = None
    obj = (ctypes.c_char * 0x2000)()                   # RandMersenne is ~0xc28 bytes; over-allocate
    base = ctypes.addressof(obj)
    set_seed(base, int(seed) & 0xffffffffffffffff)
    out = []
    dsfmt = base + 0x8                                 # dsfmt_t at instance +0x8
    # status[] holds N64=382 doubles per generation; regenerate as needed for n>382.
    while len(out) < n:
        gen_all(dsfmt)
        block = (ctypes.c_double * 382).from_address(dsfmt)
        out.extend(block[i] for i in range(min(382, n - len(out))))
    return out[:n]



def dsfmt_sequence(seed, n):
    """Return the first `n` close1_open2 doubles [1,2) of FCP's OWN dSFMT (the RNG behind
    PAENoise / PAECloudsV) seeded with `seed`, via ProCore's RandMersenne.

    This is the deterministic Stage-1 white-noise generator: -[PAENoise canThrowRenderOutput]
    calls RandMersenne::SetSeed(seed) then pulls dsfmt_gen_rand_all() to fill an RGBA texture
    with byte = trunc((raw-1.0)*255). Verifying our TS DSFMT port against this proves the
    seeded byte sequence is bit-exact (the per-FRAME reseed schedule is a separate, host-side,
    unrecoverable concern; this oracle covers the reproducible core).

    ABI (from -[RandMersenne::SetSeed] disasm @ ProCore 0x3388): the RandMersenne object holds
    its dsfmt_t at offset +0x8; SetSeed calls dsfmt_chk_init_gen_rand(this+8, seed, mexp=19937)
    and zeroes the cached-double cursor. dsfmt_t = { w128_t status[N+1]; int idx; } with N=191,
    so status is 192*16=3072 bytes at +0x8 and the [1,2) doubles alias status[0..N64-1] (N64=382)
    after a gen_rand_all pass. We allocate a generous buffer, SetSeed, gen_rand_all, then read
    the leading `n` doubles. (n must be <= 382, the block size.)
    """
    if n > 382:
        raise OracleError("dsfmt_sequence: n must be <= 382 (one gen_rand_all block); got %d" % n)
    lib = load_framework("ProCore")
    set_seed = lib["_ZN12RandMersenne7SetSeedEm"]  # RandMersenne::SetSeed(unsigned long)
    set_seed.argtypes = [ctypes.c_void_p, ctypes.c_ulong]
    set_seed.restype = None
    gen_all = lib["dsfmt_gen_rand_all"]            # dsfmt_gen_rand_all(dsfmt_t*)
    gen_all.argtypes = [ctypes.c_void_p]
    gen_all.restype = None
    obj = (ctypes.c_char * 0x2000)()               # >= sizeof(RandMersenne) ~0xc28
    base = ctypes.addressof(obj)
    dsfmt_ptr = base + 0x8                          # dsfmt_t lives at +0x8
    set_seed(base, int(seed) & 0xFFFFFFFFFFFFFFFF)
    gen_all(dsfmt_ptr)                              # fill one block of 382 close1_open2 doubles
    arr = (ctypes.c_double * n).from_address(dsfmt_ptr)
    return [float(arr[i]) for i in range(n)]



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
