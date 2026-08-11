#!/usr/bin/env python3
"""MXF::FileReader::hasMultipleEssenceContainers() @Flexo 0x14467b0 — live differential.

Calls the REAL function out of the running Flexo image over a hand-built receiver, and compares it
with the REAL TypeScript port (imported by the .mts driver under `node --experimental-strip-types`,
so nothing here restates the port in Python — a Python restatement shares any misreading with the
port it is supposed to check).

The symbol is LOCAL (`t`), so there is no dlsym: it is called at
`_dyld_get_image_vmaddr_slide(Flexo) + 0x14467b0`, and the 17 opcode bytes at that address are
asserted against BOTH the mapped image and the on-disk thin slice first — assert the BYTES, not
otool's text.

Run under `arch -x86_64 /usr/bin/python3` (every address is from the x86_64 slice; the natively
loaded image would be arm64).
"""
import ctypes, json, os, platform, subprocess, sys
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FCP = "/Applications/Final Cut Pro.app/Contents"
FLEXO = FCP + "/Frameworks/Flexo.framework/Versions/A/Flexo"
RP = [FCP + "/Frameworks",
      FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
      FCP + "/PlugIns",
      FCP + "/Frameworks/ProApps"]
VA = 0x14467b0
WANT = bytes.fromhex("554889e54883bfe8000000020f93c05dc3")
HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "MXF__FileReader_hasMultipleEssenceContainers_driver.mts")
OFF_COUNT, OFF_BEGIN, OFF_ROOT = 0xe8, 0xd8, 0xe0

if platform.machine() != "x86_64":
    sys.exit("INCONCLUSIVE: running as %s — re-run under `arch -x86_64 /usr/bin/python3`"
             % platform.machine())


def deps(p):
    out = subprocess.run(["otool", "-L", p], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def res(n):
    if n.startswith("@rpath/"):
        for r in RP:
            q = os.path.join(r, n[7:])
            if os.path.exists(q):
                return q
        return None
    return n if os.path.exists(n) else None


seen = set()


def pre(p, d=0):
    if p in seen or d > 6:
        return
    seen.add(p)
    for x in deps(p):
        r = res(x)
        if r and r != p:
            pre(r, d + 1)
    try:
        ctypes.CDLL(p, mode=ctypes.RTLD_GLOBAL)
    except OSError:
        pass


pre(FLEXO)
ctypes.CDLL(FLEXO, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Flexo"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Flexo is not loaded")

got = ctypes.string_at(slide + VA, len(WANT))
disk = open("/tmp/Flexo.x86_64", "rb").read()[VA:VA + len(WANT)]
print("slide=0x%x" % slide)
print("  opcode mapped = %s" % got.hex())
print("  opcode ondisk = %s" % disk.hex())
print("  opcode expect = %s -> %s" % (WANT.hex(), "OK" if got == WANT == disk else "MISMATCH"))
if not (got == WANT == disk):
    sys.exit("FAIL: the bytes at slide+0x%x are not the ones transcribed" % VA)

CASES = [0, 1, 2, 3, 0x7fffffff, 0x80000000, 0x100000000,
         0x7fffffffffffffff, 0xffffffffffffffff]

fn = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p)(slide + VA)
POISON = b"\xCD" * 0x200
live = []
writes = []
for n in CASES:
    obj = ctypes.create_string_buffer(POISON, 0x200)
    a = ctypes.addressof(obj)
    ctypes.c_uint64.from_address(a + OFF_COUNT).value = n
    # THE OFFSET CONTROL: the two neighbouring words of the same std::map are given values that
    # would flip the answer if the body read one of them instead of +0xe8.
    ctypes.c_uint64.from_address(a + OFF_BEGIN).value = 0 if n >= 2 else 7
    ctypes.c_uint64.from_address(a + OFF_ROOT).value = 0 if n >= 2 else 7
    before = ctypes.string_at(a, 0x200)
    r = fn(a)
    after = ctypes.string_at(a, 0x200)
    if before != after:
        writes.append(n)
    live.append(bool(r))
    if r not in (0, 1):
        print("  NOTE: %%al was 0x%x, not a canonical bool, for count=%d" % (r, n))

proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                      input=json.dumps({"cases": [str(c) for c in CASES]}),
                      capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
if proc.returncode != 0:
    print(proc.stdout[-800:], proc.stderr[-800:])
    sys.exit("FAIL: the TypeScript driver did not run")
out = json.loads(proc.stdout)
port, mutants = out["port"], out["mutants"]

bad = 0
print("  count (u64)                live   port   agree   (+0xd8/+0xe0 set to flip the answer if"
      " the wrong word were read)")
for i, n in enumerate(CASES):
    ok = live[i] == port[i]
    bad += 0 if ok else 1
    print("   0x%016x  %-5s  %-5s  %s" % (n, live[i], port[i], "OK" if ok else "DIVERGED"))
print("  receiver arena (0x200 bytes, 0xCD-poisoned): %s"
      % ("unchanged in all %d cases — the method stores nothing" % len(CASES) if not writes
         else "CHANGED for counts %s" % writes))
if writes:
    bad += 1

print("  mutants (evaluated in the SAME node process, over the same %d cases):" % len(CASES))
kills = {}
for name, vals in mutants.items():
    k = sum(1 for i in range(len(CASES)) if vals[i] != live[i])
    kills[name] = k
    where = [hex(CASES[i]) for i in range(len(CASES)) if vals[i] != live[i]]
    print("   M %-8s %2d killed   %s" % (name, k, ", ".join(where[:4]) if where else "(EQUIVALENT)"))
# M0: the port itself, through the same pipeline, must kill 0 — a baseline proving the comparison
# is not simply reporting everything as different.
print("   M %-8s %2d killed   (expected 0)" % ("0-port", sum(1 for i in range(len(CASES))
                                                             if port[i] != live[i])))
if min(kills.values()) == 0:
    print("   CONTROL FAILURE: a mutant survived — say which, and why it is equivalent, or the"
          " corpus is too weak to distinguish it")
    bad += 1

print("RESULT:", "PASS" if bad == 0 else "FAIL")
sys.exit(0 if bad == 0 else 1)
