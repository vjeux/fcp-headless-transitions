#!/usr/bin/env python3
"""ozone_loader — load Ozone (or Flexo) outside the FCP app bundle, and resolve
LOCAL (`nm` type `t`) symbols by address.

Two OPS_LOG findings are baked in here so no future harness has to rediscover them:

1. "Ozone/Flexo cannot be dlopen'd outside the bundle" is FALSE. The only blocker is
   `@rpath` resolution, and `DYLD_FRAMEWORK_PATH` genuinely cannot fix it because
   /usr/bin/python3 is hardened and dyld strips every DYLD_* variable from it. What
   works with no env vars at all: walk the `@rpath/...` entries of `otool -L`
   DEPTH-FIRST, `CDLL(<absolute path>, RTLD_GLOBAL)` each dependency, then load the
   target — once an image with the right install name is in the process, dyld
   satisfies the `@rpath` reference from it.

2. `nm` without `-arch` reports the ARM64 slice even from a Rosetta process, so an
   address resolved that way is (arm64 vmaddr + x86_64 slide) — inside the mapped
   image but pointing at some other function, and it fails SILENTLY. Every address
   here comes from `nm -n -arch x86_64`, and the slide comes from dyld itself.
"""
import ctypes, ctypes.util, os, platform, re, subprocess

FRAMEWORKS = "/Applications/Final Cut Pro.app/Contents/Frameworks"
FW_PATH = {
    "Ozone": f"{FRAMEWORKS}/Ozone.framework/Versions/A/Ozone",
    "Flexo": f"{FRAMEWORKS}/Flexo.framework/Versions/A/Flexo",
    "Helium": f"{FRAMEWORKS}/Helium.framework/Versions/A/Helium",
    "ProCore": f"{FRAMEWORKS}/ProCore.framework/Versions/A/ProCore",
    "ProChannel": f"{FRAMEWORKS}/ProChannel.framework/Versions/A/ProChannel",
}

_libc = ctypes.CDLL(None)
_libc._dyld_image_count.restype = ctypes.c_uint32
_libc._dyld_get_image_name.restype = ctypes.c_char_p
_libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
_libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_long
_libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]


def require_x86_64():
    if platform.machine() != "x86_64":
        raise SystemExit(
            "REFUSING TO RUN: this process is %s. Every @0xADDR in the port is an "
            "x86_64 offset; run under `arch -x86_64 /usr/bin/python3`."
            % platform.machine())


def _deps(path):
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    return [m.group(1) for m in re.finditer(r"^\t(\S+)", out, re.M)]


def load_framework(fw, _seen=None, _depth=0):
    """Depth-first preload of the @rpath chain, then the target. Returns the CDLL."""
    path = FW_PATH.get(fw, fw)
    seen = _seen if _seen is not None else set()
    if path in seen or _depth > 6:
        return None
    seen.add(path)
    for dep in _deps(path):
        if not dep.startswith("@rpath/"):
            continue
        cand = os.path.join(FRAMEWORKS, dep[len("@rpath/"):])
        if os.path.exists(cand):
            try:
                load_framework(cand, seen, _depth + 1)
            except OSError:
                pass  # a missing/failing dependency is fine: lazily-bound symbols
                      # are irrelevant to a leaf call (OPS_LOG, verified).
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def image_slide(fw):
    """The ASLR slide dyld actually applied to the loaded image (never inferred)."""
    want = os.path.basename(FW_PATH.get(fw, fw))
    for i in range(_libc._dyld_image_count()):
        name = _libc._dyld_get_image_name(i).decode()
        if os.path.basename(name) == want:
            return _libc._dyld_get_image_vmaddr_slide(i), name
    raise SystemExit(f"{want} is not in the loaded image list")


def nm_addr(fw, symbol):
    """x86_64 vmaddr of a symbol, INCLUDING local (`t`) ones. `-arch x86_64` is not
    optional — without it nm answers from the arm64 slice."""
    path = FW_PATH.get(fw, fw)
    out = subprocess.run(["nm", "-n", "-arch", "x86_64", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[2] == symbol:
            return int(parts[0], 16)
    raise SystemExit(f"{symbol} not found in the x86_64 slice of {path}")


def local_fn(fw, symbol, restype, argtypes):
    """A callable for a symbol dlsym cannot reach, at slide + x86_64 vmaddr."""
    require_x86_64()
    load_framework(fw)
    slide, _ = image_slide(fw)
    addr = nm_addr(fw, symbol)
    proto = ctypes.CFUNCTYPE(restype, *argtypes)
    return proto(slide + addr), addr, slide
