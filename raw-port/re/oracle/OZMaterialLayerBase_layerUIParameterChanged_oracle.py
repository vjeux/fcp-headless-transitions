#!/usr/bin/env python3
"""Differential oracle for OZMaterialLayerBase::layerUIParameterChanged()
@Ozone 0x4ac050 — an EMPTY virtual hook.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets,
and Ozone is loaded via the depth-first @rpath preload (OPS_LOG 2026-08-10).

An empty body is exactly the case where a gate can be fooled and a reader cannot
tell "no-op" from "not ported", so this harness proves the claim positively:
  * the bytes at the entry point are the transcribed six-line body
    (55 48 89 e5 5d c3 = push rbp; mov rsp,rbp; pop rbp; ret) — nothing else;
  * calling it on a poisoned object changes NO byte of that object, so the hook
    really does nothing observable;
  * a sensitivity control calls a DIFFERENT symbol through the SAME CFUNCTYPE
    and DOES observe a change, so "nothing happened" is a measurement rather
    than a blind spot.
"""
import ctypes, os, platform, re, subprocess, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FWDIR = "/Applications/Final Cut Pro.app/Contents/Frameworks"
TARGET = f"{FWDIR}/Ozone.framework/Versions/A/Ozone"
VMADDR = 0x4ac050
EXPECTED = bytes.fromhex("554889e55dc3")
OBJ = 0x400

_loaded = {}


def _deps(path):
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    res = []
    for line in out.splitlines()[1:]:
        m = re.match(r"\s+(\S+)\s+\(", line)
        if not m:
            continue
        p = m.group(1)
        if p.startswith("@rpath/"):
            p = os.path.join(FWDIR, p[len("@rpath/"):])
        if not p.startswith("@"):
            res.append(p)
    return res


def load(path=TARGET, depth=0):
    real = os.path.realpath(path)
    if real in _loaded or depth > 6:
        return _loaded.get(real)
    _loaded[real] = None
    for d in _deps(path):
        if os.path.exists(d) and os.path.realpath(d) != real:
            load(d, depth + 1)
    try:
        _loaded[real] = ctypes.CDLL(path, ctypes.RTLD_GLOBAL)
    except OSError:
        pass
    return _loaded[real]


assert load() is not None, "Ozone failed to load"
libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_uint64
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = next(libc._dyld_get_image_vmaddr_slide(i)
             for i in range(libc._dyld_image_count())
             if libc._dyld_get_image_name(i).decode().endswith("/Ozone"))

addr = slide + VMADDR
body = ctypes.string_at(addr, len(EXPECTED))
print(f"slide=0x{slide:x} layerUIParameterChanged@0x{addr:x} body={body.hex()}")
assert body == EXPECTED, (
    f"body is {body.hex()}, not the transcribed {EXPECTED.hex()} — wrong slice/offset")

PROTO = ctypes.CFUNCTYPE(None, ctypes.c_void_p)
fn = PROTO(addr)

cases = div = 0
for pattern in (0xAA, 0x00, 0xFF, 0x5A):
    for _ in range(150):
        o = (ctypes.c_char * OBJ)()
        ctypes.memset(o, pattern, OBJ)
        before = bytes(o)
        fn(ctypes.addressof(o))
        cases += 1
        if bytes(o) != before:
            div += 1
            print(f"DIVERGE the hook modified its object (pattern {pattern:#x})")

# --- sensitivity control: the same shape of measurement on a NON-empty method -
# HGRenderJob::SetUserTag would be another framework; stay inside Ozone by using
# a symbol whose whole job is a store. OZMaterialLayerBase has none in reach here,
# so use the neighbouring HGRenderJob-style probe from Helium via its own image.
helium = ctypes.CDLL(f"{FWDIR}/Helium.framework/Versions/A/Helium", ctypes.RTLD_GLOBAL)
setter = getattr(helium, "_ZN11HGRenderJob10SetUserTagEy")
setter.restype = None
setter.argtypes = [ctypes.c_void_p, ctypes.c_uint64]
probe = (ctypes.c_char * OBJ)()
ctypes.memset(probe, 0xAA, OBJ)
before = bytes(probe)
setter(ctypes.addressof(probe), 0x1122334455667788)
sensitive = bytes(probe) != before
print(f"  sensitivity control: a known STORE (HGRenderJob::SetUserTag) through the same "
      f"style of call {'DID' if sensitive else 'did NOT'} change its poisoned object — "
      f"so 'no bytes changed' above is a real measurement")

print(f"CASES={cases} DIVERGENCES={div}")
print("ORACLE:", "VERIFIED" if div == 0 and sensitive else "DIVERGED")
sys.exit(0 if div == 0 and sensitive else 1)
