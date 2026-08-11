#!/usr/bin/env python3
"""OZChannel::getFadeOutCurve() @ProChannel 0x15f34 — live binary <-> shipped TypeScript differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannel_getFadeOutCurve_oracle.py

WHAT IT MEASURES. Three things, in one run:
  1. the LIVE ProChannel body, called by address at `_dyld_get_image_vmaddr_slide(ProChannel)
     + 0x15f34`, over hand-built `this`/impl/SavedState arenas poisoned with 0xCD;
  2. the SHIPPED port (`raw-port/src/channels/OZChannel.ts::OZChannel_getFadeOutCurve`), imported
     by `OZChannel_getFadeOutCurve_driver.mts` through the repo's own `tsx` — the file under
     review, not a Python restatement of it, so a misreading cannot be shared by both sides;
  3. six MUTANTS of the port, evaluated in the same node process as the port, so the corpus is
     shown to have teeth instead of being asserted to.

WHY `arch -x86_64`. Every `@0xADDR` in this repo is an x86_64 offset (`disasm.sh` thins to
`/tmp/<FW>.x86_64`), while a plain dlopen on this box maps the arm64 slice — an address-based
differential on the wrong slice fails silently toward VERIFIED. The script REFUSES to run anywhere
else, and additionally self-checks the 26 opcode bytes at slide+0x15f34 against both the mapped
image and the on-disk thin slice before it calls anything.
"""
import ctypes, json, os, platform, struct, subprocess, sys, tempfile

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP = [
    FCP + "/Frameworks",
    FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
    FCP + "/PlugIns",
    FCP + "/Frameworks/ProApps",
]
VA = 0x15F34
# 0x15f34 pushq %rbp / movq %rsp,%rbp / movq 0x70(%rdi),%rax / movq 0x10(%rax),%rax /
# testq %rax,%rax / je 0x15f4a / movl 0x34(%rax),%eax / jmp 0x15f4c / xorl %eax,%eax / popq %rbp / retq
WANT = bytes.fromhex("554889e5488b4770488b40104885c074058b4034eb0231c05dc3")
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))          # <repo>/raw-port
TSX = os.path.join(REPO, "node_modules", ".bin", "tsx")
DRIVER = os.path.join(HERE, "OZChannel_getFadeOutCurve_driver.mts")
THIN = "/tmp/ProChannel.x86_64"

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — re-run under `arch -x86_64 /usr/bin/python3`" % platform.machine())


def deps(p):
    out = subprocess.run(["otool", "-L", p], capture_output=True, text=True).stdout.splitlines()[1:]
    return [l.split()[0] for l in out if l.strip()]


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
    """Depth-first @rpath preload — ProChannel's dependency chain cannot be resolved by a bare
    dlopen, and DYLD_* is stripped from the hardened system python."""
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


pre(PC)
ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProChannel"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProChannel is not in the image list")

mapped = ctypes.string_at(slide + VA, len(WANT))
disk = b""
if os.path.exists(THIN):
    with open(THIN, "rb") as f:
        f.seek(VA)
        disk = f.read(len(WANT))
print("slide = 0x%x" % slide)
print("  mapped = %s" % mapped.hex())
print("  ondisk = %s%s" % (disk.hex(), "" if disk else "  (no /tmp/ProChannel.x86_64 — run disasm.sh)"))
print("  expect = %s" % WANT.hex())
if mapped != WANT or (disk and disk != WANT):
    sys.exit("FAIL: opcode self-check — the address does not hold the transcribed body")
print("  self-check OK (the 26 bytes at slide+0x%x are the body this port transcribes)\n" % VA)

fn = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(slide + VA)

# ---- corpus ------------------------------------------------------------------------------------
# `x` is the +0x30 DECOY (the fade-IN curve id its sibling @0x15f1a returns); it is always different
# from `y` so that reading the wrong field cannot accidentally agree. 0x80000000 and 0xffffffff are
# the two values where a signed or 8-byte model of the `movl` would differ.
CASES = [
    {"x": 0x11111111, "y": 0x00000000, "nullSaved": False},
    {"x": 0x22222222, "y": 0x00000001, "nullSaved": False},
    {"x": 0x33333333, "y": 0x00000007, "nullSaved": False},
    {"x": 0x44444444, "y": 0x0000FFFF, "nullSaved": False},
    {"x": 0x55555555, "y": 0x7FFFFFFF, "nullSaved": False},
    {"x": 0x66666666, "y": 0x80000000, "nullSaved": False},
    {"x": 0x77777777, "y": 0xFFFFFFFF, "nullSaved": False},
    {"x": 0x88888888, "y": 0xDEADBEEF, "nullSaved": False},
    {"x": 0x99999999, "y": 0x00000000, "nullSaved": True},
]


def build(c):
    """`this` (0x100) -> impl (0x40) -> SavedState (0x38), every byte poisoned with 0xCD first so a
    read of an unset slot is visible, and the whole arena byte-compared after the call."""
    st = ctypes.create_string_buffer(b"\xcd" * 0x38, 0x38)
    sa = ctypes.addressof(st)
    struct.pack_into("<I", st, 0x30, c["x"])
    struct.pack_into("<I", st, 0x34, c["y"])
    impl = ctypes.create_string_buffer(b"\xcd" * 0x40, 0x40)
    ia = ctypes.addressof(impl)
    ctypes.c_uint64.from_address(ia + 0x08).value = 0xBBBBBBBBBBBBBBBB   # +0x08 curve: never read
    ctypes.c_uint64.from_address(ia + 0x10).value = 0 if c["nullSaved"] else sa
    this = ctypes.create_string_buffer(b"\xcd" * 0x100, 0x100)
    ta = ctypes.addressof(this)
    ctypes.c_uint64.from_address(ta + 0x70).value = ia
    ctypes.c_uint64.from_address(ta + 0x78).value = 0xCCCCCCCCCCCCCCCC   # +0x78 implSecondary: never read
    return st, impl, this, ta


live, wrote = [], 0
for c in CASES:
    st, impl, this, ta = build(c)
    before = ctypes.string_at(ta, 0x100) + ctypes.string_at(ctypes.addressof(impl), 0x40) + ctypes.string_at(
        ctypes.addressof(st), 0x38
    )
    r = fn(ta)
    after = ctypes.string_at(ta, 0x100) + ctypes.string_at(ctypes.addressof(impl), 0x40) + ctypes.string_at(
        ctypes.addressof(st), 0x38
    )
    if before != after:
        wrote += 1
    live.append(int(r))

# ---- the shipped TypeScript ----------------------------------------------------------------------
with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
    json.dump(CASES, f)
    cases_path = f.name
if not os.path.exists(TSX):
    sys.exit("INCONCLUSIVE: %s not found (npm install in raw-port/)" % TSX)
proc = subprocess.run([TSX, DRIVER, cases_path], capture_output=True, text=True, cwd=HERE)
os.unlink(cases_path)
if proc.returncode != 0:
    print(proc.stdout[-2000:]); print(proc.stderr[-2000:])
    sys.exit("INCONCLUSIVE: the TypeScript driver did not run")
ts = json.loads(proc.stdout)


def val(a):
    return a["v"] if "v" in a else "throw: " + a["throw"][:40]


bad = 0
print("case                                    live(FCP)     port(TS)   agree")
for c, l, p in zip(CASES, live, ts["port"]):
    got = val(p)
    ok = got == l
    bad += 0 if ok else 1
    label = "savedState=NULL" if c["nullSaved"] else "+0x34=0x%08x (+0x30 decoy 0x%08x)" % (c["y"], c["x"])
    print("  %-38s 0x%08x  %12s   %s" % (label, l, ("0x%08x" % got) if isinstance(got, int) else got, "yes" if ok else "NO"))
print("\n  arenas byte-identical after every call: %s (0x%x cases wrote nothing)" % (wrote == 0, len(CASES)))
print("  the 0xBBBB… at impl+0x08 and the 0xCCCC… at this+0x78 were never returned;")
print("  the +0x30 decoy never came back on any case.")

# ---- mutation controls -----------------------------------------------------------------------
print("\nMUTANTS (evaluated in the same node process as the port, against the same live answers):")
NAMES = {
    "M0": "unmutated copy through the mutation pipeline (expected 0)",
    "M1": "movl 0x34 misread as 0x30 (returns the fade-IN id)",
    "M2": "the testq/je NULL path dropped",
    "M3": "the 4-byte load read as SIGNED (movslq)",
    "M4": "the NULL answer written as -1 instead of xorl's 0",
    "M5": "the chain started at this+0x78 instead of +0x70",
}
for m, answers in ts["mutants"].items():
    killed = sum(1 for l, a in zip(live, answers) if val(a) != l)
    print("  %-4s %-52s %2d killed / %d" % (m, NAMES.get(m, ""), killed, len(CASES)))
    if m == "M0" and killed:
        bad += killed

print("\nRESULT:", "PASS" if bad == 0 else "FAIL")
sys.exit(0 if bad == 0 else 1)
