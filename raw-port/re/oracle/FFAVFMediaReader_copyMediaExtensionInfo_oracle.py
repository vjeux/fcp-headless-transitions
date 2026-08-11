#!/usr/bin/env python3
"""Differential oracle for FFAVFMediaReader::copyMediaExtensionInfo() const
@Flexo 0xdf61d0.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets and
the symbol is LOCAL (`t`), so the harness calls it BY ADDRESS at slide+0xdf61d0
after preloading Flexo's @rpath chain depth-first (OPS_LOG 2026-08-10). The
harness refuses to run unless the process is x86_64 AND the bytes at the target
match the transcribed prologue — an address call into the arm64 slice would land
in unrelated code and fail silently toward VERIFIED.

Body: rdi = this->+0x1d8 ; tail-jmp objc_retain. So the answer is "the ObjC
object at +0x1d8, retained once", and objc_retain(nil) is nil.
"""
import ctypes, os, platform, random, re, struct, subprocess, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FWDIR = "/Applications/Final Cut Pro.app/Contents/Frameworks"
TARGET = f"{FWDIR}/Flexo.framework/Versions/A/Flexo"
VMADDR = 0xdf61d0
FIELD = 0x1d8
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
    if real in _loaded or depth > 3:
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


assert load() is not None, "Flexo failed to load"
libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_uint64
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = next(libc._dyld_get_image_vmaddr_slide(i)
             for i in range(libc._dyld_image_count())
             if libc._dyld_get_image_name(i).decode().endswith("/Flexo"))

addr = slide + VMADDR
head = ctypes.string_at(addr, 4)
assert head == bytes.fromhex("554889e5"), (
    f"code at 0x{addr:x} starts {head.hex()} — not the transcribed prologue")
print(f"slide=0x{slide:x} copyMediaExtensionInfo@0x{addr:x}")

PROTO = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p)
fn = PROTO(addr)

# --- the ObjC runtime, for real objects and a retain-count read ---------------
objc = ctypes.CDLL("/usr/lib/libobjc.A.dylib")
objc.objc_getClass.restype = ctypes.c_void_p
objc.objc_getClass.argtypes = [ctypes.c_char_p]
objc.sel_registerName.restype = ctypes.c_void_p
objc.sel_registerName.argtypes = [ctypes.c_char_p]
msg = objc.objc_msgSend
msg.restype = ctypes.c_void_p
msg.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
msg_n = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p, ctypes.c_void_p)(
    ctypes.cast(objc.objc_msgSend, ctypes.c_void_p).value)
objc.objc_release.restype = None
objc.objc_release.argtypes = [ctypes.c_void_p]

NSObject = objc.objc_getClass(b"NSObject")
sel_new = objc.sel_registerName(b"new")
sel_rc = objc.sel_registerName(b"retainCount")


def make_obj(field_value):
    o = (ctypes.c_char * OBJ)()
    o.raw = bytes(random.randrange(256) for _ in range(OBJ))   # poison everything
    struct.pack_into("<Q", o, FIELD, field_value)
    return o


rng = random.Random(20260811)
random.seed(20260811)
cases = div = 0

# --- A: a NIL field must answer nil (objc_retain(nil) == nil) -----------------
for _ in range(300):
    o = make_obj(0)
    got = fn(ctypes.addressof(o)) or 0
    cases += 1
    if got != 0:                      # the TS port: return objc_retain(this.field)
        div += 1
        print(f"DIVERGE nil case returned {got:#x}")

# --- B: a REAL ObjC object — identity returned, retain count grows ------------
objects = [msg(NSObject, sel_new) for _ in range(20)]
for i in range(300):
    target = objects[i % len(objects)]
    before = msg_n(target, sel_rc)
    o = make_obj(target)
    got = fn(ctypes.addressof(o)) or 0
    after = msg_n(target, sel_rc)
    cases += 1
    if got != target:
        div += 1
        if div < 5:
            print(f"DIVERGE identity: got {got:#x} want {target:#x}")
    if after != before + 1:
        div += 1
        if div < 5:
            print(f"DIVERGE retain count {before} -> {after} (expected +1)")
    objc.objc_release(target)         # balance the +1 this call took
    # the getter is const: nothing in the caller's object may change
    if struct.unpack_from("<Q", bytes(o), FIELD)[0] != target:
        div += 1
        print("DIVERGE the const getter modified the field")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"reads a neighbouring slot (+0x1d0) instead of +0x1d8": 0,
       "returns nil regardless of the field": 0,
       "reads the field but forgets the retain (no count change)": 0}
NEG_N = 200
for i in range(NEG_N):
    target = objects[i % len(objects)]
    o = make_obj(target)
    neighbour = struct.unpack_from("<Q", bytes(o), FIELD - 8)[0]
    before = msg_n(target, sel_rc)
    got = fn(ctypes.addressof(o)) or 0
    after = msg_n(target, sel_rc)
    if neighbour != got:
        neg["reads a neighbouring slot (+0x1d0) instead of +0x1d8"] += 1
    if 0 != got:
        neg["returns nil regardless of the field"] += 1
    # this mutant PREDICTS an unchanged count; it is caught whenever live bumped it
    if after != before:
        neg["reads the field but forgets the retain (no count change)"] += 1
    objc.objc_release(target)

print(f"CASES={cases} DIVERGENCES={div}")
print("negative controls (higher = the wrong port would have been caught):")
for k, v in neg.items():
    print(f"   {v:4d}/{NEG_N}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
