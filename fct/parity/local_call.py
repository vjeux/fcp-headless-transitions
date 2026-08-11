"""fct.parity.local_call — call LOCAL (non-exported) FCP functions via dyld slide + static vmaddr.

WHY THIS EXISTS (decoded 2026-07-28): the existing oracle (oracle.resolve / dlsym) can only reach
GLOBAL-exported symbols (nm `T`). But the vast majority of FCP's pure-math methods — e.g. every
HG*LinearizationLUTInfo::colorAtIndex, HG*ToneCurve*::colorAtIndex — are LOCAL symbols (nm `t`):
dlsym CANNOT find them ("symbol not found"). PROVEN: nm -gU Helium | grep colorAtIndex -> 0 results,
yet nm -n shows them as lowercase `t` at fixed vmaddrs.

The fix: a local function's RUNTIME address = its static vmaddr (from `nm -n`) + the image's ASLR
slide (from dyld `_dyld_get_image_vmaddr_slide`). Once the framework is dlopen'd (load_framework),
we read the slide for that image and build a ctypes CFUNCTYPE pointer straight at vmaddr+slide.

VALIDATED 2026-07-28 on HGBMDFilmGen5/HGCanonLog2/HGAYCC LinearizationLUTInfo::colorAtIndex — all
three return deterministic Log->linear curve values (e.g. CanonLog2(0.5,0.5,0.5)->0.49943). This is
the exact-oracle equivalent for CALLABLE local math, complementing read_helium_const_matrix (which
only reads DATA constants) and resolve (which only reaches exported functions).

USAGE:
    from fct.parity.local_call import local_fn
    ctor = local_fn("Helium", "_ZN33HGBMDFilmGen5LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE",
                     None, [c_void_p, c_ulong, c_float, c_float, c_int])
    cai  = local_fn("Helium", "_ZNK33HGBMDFilmGen5LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_",
                     None, [c_void_p, c_float, c_float, c_float, c_void_p, c_void_p, c_void_p, c_void_p])

The mangled `symbol` may be given WITHOUT the leading Itanium underscore that nm prints on Mach-O;
we match both `symbol` and `_symbol`.
"""
import ctypes, subprocess, os
from .oracle import load_framework, FRAMEWORKS, OracleError

# ── ARCH GUARD (reviewer-2, 2026-08-10, OPS_LOG "oracle calls the wrong architecture") ──────────
# Every port in this repo is transcribed from the x86_64 slice (disasm.sh thins to /tmp/<FW>.x86_64
# and every @0xADDR is an x86_64 offset), but on Apple silicon this process is arm64, so dlopen maps
# the ARM64 slice and `nm -n` reports ARM64 vmaddrs. Where the two slices disagree — libc++'s
# std::string SSO layout is the flagship, FMA contraction another — the differential silently
# compares the port against code it did not transcribe, and it fails TOWARD "equal"/VERIFIED. A
# false VERIFIED is worse than no oracle, because a reviewer signs on it. Say so, loudly, once.
# Re-run under Rosetta to oracle the slice the port was actually transcribed from:
#     arch -x86_64 /usr/bin/python3 <your harness>.py
import platform as _platform, sys as _sys
_ARCH_WARNED = []
def _warn_arch_once():
    if _ARCH_WARNED or _platform.machine() == "x86_64":
        return
    _ARCH_WARNED.append(1)
    print("WARNING [fct.parity]: this process is %s, but every port is transcribed from the x86_64 "
          "slice. dlopen/nm are resolving the ARM64 slice, so any symbol whose layout or codegen "
          "differs between slices (libc++ std::string SSO, FMA contraction) will be compared against "
          "code the port did not transcribe — and it fails toward VERIFIED. Re-run under "
          "`arch -x86_64 /usr/bin/python3` to oracle the x86_64 slice." % _platform.machine(),
          file=_sys.stderr)


_slide_cache = {}   # framework -> image ASLR slide
_vmaddr_cache = {}  # framework -> {mangled: vmaddr}


def _image_slide(framework):
    """ASLR slide for the dlopen'd framework image (matched by trailing '/<framework>')."""
    if framework in _slide_cache:
        return _slide_cache[framework]
    load_framework(framework)  # ensure the image is mapped + cached
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_long
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    suffix = "/" + framework
    slide = None
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode().endswith(suffix):
            slide = int(libc._dyld_get_image_vmaddr_slide(i))
            break
    if slide is None:
        raise OracleError("image for framework %r not found in dyld image list" % framework)
    _slide_cache[framework] = slide
    return slide


def _vmaddr(framework, mangled):
    """Static vmaddr of a (possibly LOCAL) symbol via `nm -n`. Matches `mangled` or `_mangled`."""
    _warn_arch_once()
    binpath = FRAMEWORKS.get(framework)
    if not binpath or not os.path.exists(binpath):
        raise OracleError("framework binary not found for %s" % framework)
    tbl = _vmaddr_cache.get(framework)
    if tbl is None:
        tbl = {}
        out = subprocess.check_output(["nm", "-n", binpath], text=True, stderr=subprocess.DEVNULL)
        for l in out.splitlines():
            p = l.split()
            if len(p) >= 3:
                try:
                    tbl[p[2]] = int(p[0], 16)
                except ValueError:
                    pass
        _vmaddr_cache[framework] = tbl
    for key in (mangled, "_" + mangled):
        if key in tbl:
            return tbl[key]
    raise OracleError("symbol %r (or _%r) not found in %s nm table" % (mangled, mangled, framework))


def local_fn(framework, mangled, restype, argtypes):
    """Return a callable ctypes function pointer to a LOCAL or global FCP symbol.

    framework: short name (key of FRAMEWORKS, e.g. 'Helium').
    mangled:   Itanium C++ mangled symbol (with or without the Mach-O leading '_').
    restype:   ctypes result type or None (void).
    argtypes:  list of ctypes arg types.
    """
    fp = _vmaddr(framework, mangled) + _image_slide(framework)
    proto = ctypes.CFUNCTYPE(restype, *argtypes)
    return proto(fp)
