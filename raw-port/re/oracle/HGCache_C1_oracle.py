#!/usr/bin/env python3
"""Differential oracle for HGCache::HGCache() [C1] @Helium 0x8b960.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGCache_C1_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

A constructor's observable output is the MEMORY IMAGE it leaves behind, so that is what this
compares: the real ctor runs on a 0x100-byte object poisoned with 0xEE, and every claim the TS
port makes about the object is checked against the bytes — including the claims about what is NOT
written, which is where a plausible-looking port goes wrong (a 64-bit store for the 32-bit field
at +0x08 would zero four bytes the machine leaves alone).

The TS side is read from the port itself (raw-port/re/oracle/HGCache_C1_driver.ts) so this is a
differential and not a restatement of the disassembly: the driver reports the constructed object's
field values, and each is matched to the bytes the live ctor produced.
"""
import ctypes
import glob
import json
import os
import platform
import struct
import subprocess
import sys

FW = "Helium"
SYM = "_ZN7HGCacheC1Ev"                 # dlsym: no leading underscore
VTABLE_SYM = "__ZTV7HGCache"            # nm spelling
OBJ_SIZE = 0x100
POISON = 0xEE
MUTEX_OFF, MUTEX_LEN = 0x28, 64         # pthread_mutex_t on x86_64 macOS
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "HGCache_C1_driver.ts")


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def symbol_table(fw, path):
    """{name: (type, vmaddr)}. The inventory cache first — running `nm` on the 78 MB fat binary
    costs a core for a minute under the corp security stack (swarm perf directive). The fallback
    is `nm -n -arch x86_64` on the THIN slice disasm.sh already produced, never the fat original;
    the explicit -arch matters because a bare `nm` reports ARM64 even under Rosetta (OPS_LOG).
    The cache holds functions only, so the vtable DATA symbol comes from the thin-slice path."""
    out = {}
    cache = os.path.join(REPO, "raw-port", "army", "inventory", fw + ".syms.txt")
    text = ""
    if os.path.exists(cache):
        text = open(cache, encoding="utf-8", errors="replace").read()
    thin = "/tmp/%s.x86_64" % fw
    if not os.path.exists(thin):
        subprocess.run(["lipo", "-thin", "x86_64", path, "-output", thin], check=True)
    text += subprocess.run(["nm", "-n", "-arch", "x86_64", thin],
                           capture_output=True, text=True).stdout
    for line in text.splitlines():
        p = line.split(None, 2)
        if len(p) == 3 and p[0].strip():
            try:
                out.setdefault(p[2], (p[1], int(p[0], 16)))
            except ValueError:
                pass
    return out


def run_ts():
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    path = os.path.join(fwdir, FW + ".framework", FW)
    lib = load_with_rpath(path)
    table = symbol_table(FW, path)

    ctor = getattr(lib, SYM)
    ctor.restype = ctypes.c_void_p
    ctor.argtypes = [ctypes.c_void_p]
    probe = ctypes.cast(ctor, ctypes.c_void_p).value
    slide = probe - table["_" + SYM][1]
    print(f"image slide = {slide:#x}")

    ts = run_ts()
    print(f"TS port after `new HGCache()`: {json.dumps(ts, sort_keys=True)}")

    obj = ctypes.create_string_buffer(OBJ_SIZE)
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    ctor(ctypes.addressof(obj))
    raw = bytes(obj.raw)

    # A reference mutex built by libc itself in this same process, for the +0x28 comparison.
    libc = ctypes.CDLL(None)
    ref = ctypes.create_string_buffer(MUTEX_LEN)
    ctypes.memset(ctypes.addressof(ref), POISON, MUTEX_LEN)
    libc.pthread_mutex_init(ctypes.byref(ref), None)

    checks = []

    def check(name, ok, detail):
        checks.append((name, bool(ok), detail))

    vptr = struct.unpack_from("<Q", raw, 0)[0]
    want_vptr = table[VTABLE_SYM][1] + 0x10 + slide
    check("vptr@+0x00 == __ZTV7HGCache+0x10",
          vptr == want_vptr and ts["vptrAddr"] == table[VTABLE_SYM][1] + 0x10,
          f"live {vptr:#x} vs {want_vptr:#x} (unslid {vptr - slide:#x}); port says "
          f"{ts['vptrAddr']:#x}")
    check("+0x08 u32 == 0 (port countAt0x08)",
          struct.unpack_from("<I", raw, 0x08)[0] == 0 and ts["countAt0x08"] == 0,
          "live %d, port %r" % (struct.unpack_from("<I", raw, 0x08)[0], ts["countAt0x08"]))
    check("+0x0c..+0x0f UNTOUCHED (the store is 32-bit, not 64)",
          raw[0x0c:0x10] == bytes([POISON]) * 4,
          "live %s" % raw[0x0c:0x10].hex())
    check("+0x10 == null (port itemsHead)",
          struct.unpack_from("<Q", raw, 0x10)[0] == 0 and ts["itemsHead"] is None,
          "live %d, port %r" % (struct.unpack_from("<Q", raw, 0x10)[0], ts["itemsHead"]))
    check("+0x18 == null (port slotAt0x18)",
          struct.unpack_from("<Q", raw, 0x18)[0] == 0 and ts["slotAt0x18"] is None,
          "live %d, port %r" % (struct.unpack_from("<Q", raw, 0x18)[0], ts["slotAt0x18"]))
    check("+0x20 == null (port slotAt0x20)",
          struct.unpack_from("<Q", raw, 0x20)[0] == 0 and ts["slotAt0x20"] is None,
          "live %d, port %r" % (struct.unpack_from("<Q", raw, 0x20)[0], ts["slotAt0x20"]))
    # A freshly-initialised macOS pthread_mutex_t is byte-identical everywhere EXCEPT the qword at
    # +48, which is a SELF-RELATIVE pointer: value + &mutex == -1. So compare the other 56 bytes
    # literally and that one by its invariant — which is a strictly stronger check, because it
    # only holds if the mutex really lives at object+0x28.
    m_obj = raw[MUTEX_OFF:MUTEX_OFF + MUTEX_LEN]
    m_ref = bytes(ref.raw)
    SELF = slice(48, 56)
    body_same = (m_obj[:SELF.start] == m_ref[:SELF.start]
                 and m_obj[SELF.stop:] == m_ref[SELF.stop:])
    self_obj = struct.unpack("<q", m_obj[SELF])[0] + ctypes.addressof(obj) + MUTEX_OFF
    self_ref = struct.unpack("<q", m_ref[SELF])[0] + ctypes.addressof(ref)
    check("+0x28..+0x67 == a default-initialised pthread_mutex_t (port mutex.initialized)",
          body_same and self_obj == -1 and self_ref == -1 and ts["mutexInitialized"] is True,
          "56 fixed bytes %s; self-relative qword resolves to %d for the object at +0x28 and %d "
          "for libc's own (both must be -1); port %r"
          % ("match" if body_same else "DIFFER", self_obj, self_ref, ts["mutexInitialized"]))
    tail = MUTEX_OFF + MUTEX_LEN
    check("+0x68..+0xff UNTOUCHED (nothing else is written)",
          raw[tail:] == bytes([POISON]) * (OBJ_SIZE - tail),
          "%d of %d bytes still poison" % (sum(1 for b in raw[tail:] if b == POISON),
                                           OBJ_SIZE - tail))

    for name, ok, detail in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {name}\n          {detail}")

    # Negative controls: mis-models of this same ctor, checked against the SAME bytes.
    print("NEGATIVE CONTROLS (each is a plausible mis-read; the bytes must reject all):")
    print("  %s — the +0x08 store is 64-bit (would zero +0x0c..+0x0f)"
          % ("rejected" if raw[0x0c:0x10] != b"\x00" * 4 else "NOT REJECTED"))
    print("  %s — the mutex lives at +0x20 (would put libc's bytes there)"
          % ("rejected" if raw[0x20:0x20 + 8] != bytes(ref.raw)[:8] else "NOT REJECTED"))
    print("  %s — the mutex is at some other offset (its self-relative qword would not resolve "
          "to -1 for +0x28)" % ("rejected" if self_obj == -1 else "NOT REJECTED"))
    print("  %s — the ctor zeroes the whole object (tail would not be poison)"
          % ("rejected" if raw[tail:] != b"\x00" * (OBJ_SIZE - tail) else "NOT REJECTED"))
    print("  %s — the vptr is the vtable SYMBOL address (no +0x10)"
          % ("rejected" if vptr != table[VTABLE_SYM][1] + slide else "NOT REJECTED"))

    ok = all(c[1] for c in checks)
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
