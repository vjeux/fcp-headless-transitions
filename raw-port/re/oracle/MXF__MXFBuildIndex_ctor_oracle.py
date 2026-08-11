#!/usr/bin/env python3
"""Faithfulness oracle for MXF::MXFBuildIndex::MXFBuildIndex(MXF::FileReader*, unsigned, unsigned)
@Flexo 0x1440250 (__ZN3MXF13MXFBuildIndexC2EPNS_10FileReaderEjj).

Calls the REAL function inside a live Final Cut Pro image and compares, byte for byte, with the
REAL TypeScript port (imported by the .mts driver under `node --experimental-strip-types`, so the
comparison is TypeScript-against-binary rather than binary-against-a-Python-restatement).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/MXF__MXFBuildIndex_ctor_oracle.py

MUST be x86_64. The port is transcribed from the x86_64 slice; the natively loaded image is arm64,
and an address-based differential on the wrong slice fails silently TOWARD "verified".

Exit 0 = VERIFIED (port matches on every case AND every mutant is killed), 1 = DIVERGED, 2 = the
harness could not run (never read as a pass).
"""
import ctypes, json, os, platform, struct, subprocess, sys
# A driver that does not terminate is a mutant that was KILLED, not a pending result (#719).
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

if platform.machine() != "x86_64":
    sys.exit("HARNESS: refusing to run on %s — re-run under `arch -x86_64 /usr/bin/python3`"
             % platform.machine())

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "MXF__MXFBuildIndex_ctor_driver.mts")
FCP = "/Applications/Final Cut Pro.app"
FW = FCP + "/Contents/Frameworks/Flexo.framework/Versions/A/Flexo"
RPATHS = [FCP + "/Contents/Frameworks",
          FCP + "/Contents/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/Contents/PlugIns",
          FCP + "/Contents/Frameworks/ProApps"]

CTOR_VA = 0x1440250
VTAB_VA = 0x192B718
ARENA = 0x80
POISON = 0xCD

# The exact bytes of the function this port was transcribed from, read out of
# /tmp/Flexo.x86_64 (__TEXT vmaddr 0 == fileoff 0). Asserted against the mapped image before
# anything is called, so a moved or replaced symbol is a refusal rather than a wrong answer.
EXPECT = bytes.fromhex(
    "554889e5"                  # pushq %rbp ; movq %rsp,%rbp
    "488d05bdb44e00"            # leaq 0x4eb4bd(%rip),%rax
    "488907"                    # movq %rax,(%rdi)
    "895708"                    # movl %edx,0x8(%rdi)
    "894f0c"                    # movl %ecx,0xc(%rdi)
    "48897710"                  # movq %rsi,0x10(%rdi)
    "0f57c0"                    # xorps %xmm0,%xmm0
    "0f114718"                  # movups %xmm0,0x18(%rdi)
    "48c7472800000000"          # movq $0x0,0x28(%rdi)
    "5d"                        # popq %rbp
    "c3")                       # retq

CASES = [
    ("0", 0, 0),
    ("956397711104", 1, 2),                     # 0xdeadbeef00
    ("140737488355327", 0xFFFFFFFF, 0xFFFFFFFF),  # 0x7fffffffffff
    ("1234605616436508552", 0x80000000, 0x7FFFFFFF),  # 0x1122334455667788
    ("14829735431805717965", 0x12345678, 0x9ABCDEF0),  # 0xcdcdcdcdcdcdcdcd — EQUALS the poison, so
                                                       # this case is the control for the control:
                                                       # a byte-diff cannot see this store, and the
                                                       # comparison still has to come out right.
    ("1", 0x9ABCDEF0, 0x12345678),
]

# ---------------------------------------------------------------------------------------------
# 1. load Flexo (walk otool -L depth first; DYLD_* is stripped from hardened python)
# ---------------------------------------------------------------------------------------------
_seen, _loaded = set(), []


def _resolve(dep):
    if dep.startswith("@rpath/"):
        for r in RPATHS:
            p = os.path.join(r, dep[len("@rpath/"):])
            if os.path.exists(p):
                return p
        return None
    if dep.startswith("@"):
        return None
    return dep if os.path.exists(dep) else None


def _load(path, depth=0):
    if path in _seen or depth > 6:
        return
    _seen.add(path)
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        if line.startswith("\t"):
            r = _resolve(line.split()[0])
            if r and r != path:
                _load(r, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
        _loaded.append(path)
    except OSError:
        pass


_load(FW)
if FW not in _loaded:
    sys.exit(2)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode() == FW:
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    print("HARNESS: Flexo is loaded but absent from the image list")
    sys.exit(2)
print("Flexo loaded (%d images), slide = 0x%x" % (len(_loaded), slide))

# ---------------------------------------------------------------------------------------------
# 2. the bytes at the address must be the bytes the port was transcribed from
# ---------------------------------------------------------------------------------------------
got = ctypes.string_at(slide + CTOR_VA, len(EXPECT))
if got != EXPECT:
    print("HARNESS: opcode bytes at 0x%x do not match the transcription\n  live %s\n  want %s"
          % (CTOR_VA, got.hex(), EXPECT.hex()))
    sys.exit(2)
disp = struct.unpack("<i", EXPECT[7:11])[0]
if CTOR_VA + 4 + 7 + disp != VTAB_VA:
    print("HARNESS: the leaq resolves to 0x%x, not 0x%x" % (CTOR_VA + 11 + disp, VTAB_VA))
    sys.exit(2)
print("opcode bytes @0x%x match (%d bytes); leaq -> vtable+0x10 = 0x%x" % (CTOR_VA, len(EXPECT), VTAB_VA))

# ---------------------------------------------------------------------------------------------
# 3. call the binary on a poisoned arena
# ---------------------------------------------------------------------------------------------
proto = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint32)
fn = proto(slide + CTOR_VA)

live = []
for reader, a, b in CASES:
    buf = (ctypes.c_ubyte * ARENA)(*([POISON] * ARENA))
    fn(ctypes.byref(buf), ctypes.c_void_p(int(reader)), a, b)
    live.append(bytes(buf))

# ---------------------------------------------------------------------------------------------
# 4. the TypeScript side — the REAL module, in its own process
# ---------------------------------------------------------------------------------------------
req = json.dumps({"cases": [[r, a, b] for r, a, b in CASES], "slide": str(slide)})
proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                      input=req, capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
if proc.returncode != 0 or not proc.stdout.strip():
    print("HARNESS: the TypeScript driver did not run\n%s" % proc.stderr[-2000:])
    sys.exit(2)
ts = json.loads(proc.stdout)

print("\nTHE CODE THAT WAS RUN (constructor source as loaded from the committed module):")
for line in ts["src"].splitlines():
    print("    " + line)


def fields_of(img):
    return {
        "vtable": str(struct.unpack_from("<Q", img, 0x00)[0] - slide),
        "streamID": struct.unpack_from("<I", img, 0x08)[0],
        "indexSID": struct.unpack_from("<I", img, 0x0C)[0],
        "fileReader": str(struct.unpack_from("<Q", img, 0x10)[0]),
        "entriesBegin": str(struct.unpack_from("<Q", img, 0x18)[0]),
        "entriesEnd": str(struct.unpack_from("<Q", img, 0x20)[0]),
        "entriesEndCap": str(struct.unpack_from("<Q", img, 0x28)[0]),
    }


def compare(results, label):
    """returns (image_mismatches, field_mismatches)"""
    imgs, flds = 0, 0
    for i, (want, got) in enumerate(zip(live, results)):
        if want.hex() != got["image"]:
            imgs += 1
            if label == "port":
                print("  case %d IMAGE DIVERGED\n    live %s\n    port %s"
                      % (i, want.hex(), got["image"]))
        if fields_of(want) != got["fields"]:
            flds += 1
            if label == "port":
                print("  case %d FIELDS DIVERGED\n    live %s\n    port %s"
                      % (i, fields_of(want), got["fields"]))
    return imgs, flds


print("\nPORT vs LIVE FLEXO — %d cases, 0x%x-byte arena poisoned with 0x%02x:" % (len(CASES), ARENA, POISON))
for i, (reader, a, b) in enumerate(CASES):
    f = fields_of(live[i])
    print("  [%d] reader=0x%x a=0x%08x b=0x%08x -> vtable vmaddr 0x%s  +0x08=0x%08x  +0x0c=0x%08x"
          % (i, int(reader), a, b, format(int(f["vtable"]), "x"), f["streamID"], f["indexSID"]))
    tail = live[i][0x30:]
    if tail != bytes([POISON]) * (ARENA - 0x30):
        print("      !! bytes [0x30,0x80) were modified: %s" % tail.hex())
pi, pf = compare(ts["port"], "port")
print("  image mismatches: %d/%d      field mismatches: %d/%d" % (pi, len(CASES), pf, len(CASES)))

print("\nMUTANTS (each evaluated in the SAME node process, over the same cases):")
alive = []
for name, res in ts["mutants"].items():
    mi, mf = compare(res, name)
    killed = mi > 0 or mf > 0
    print("  %-14s killed=%-5s  (image %d/%d, fields %d/%d)"
          % (name, str(killed), mi, len(CASES), mf, len(CASES)))
    if not killed:
        alive.append(name)

ok = (pi == 0 and pf == 0 and not alive)
print("\n%s" % ("VERIFIED: port == live Flexo on every case, and every mutant dies."
                if ok else
                "DIVERGED: port mismatches=%d/%d, mutants still alive: %s"
                % (pi + pf, 2 * len(CASES), alive or "none")))
sys.exit(0 if ok else 1)
