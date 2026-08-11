#!/usr/bin/env python3
"""PCSerializerReadStream_processElement_oracle.py — live TS-vs-binary differential for
`PCSerializerReadStream::processElement(PCStreamElement&)` @ProCore 0x2681c
(__ZN22PCSerializerReadStream14processElementER15PCStreamElement — an EXPORTED `T` symbol, so it
is reached with dlsym; the inventory line is
`000000000002681c T __ZN22PCSerializerReadStream14processElementER15PCStreamElement`).

WHAT MAKES THIS ONE INTERESTING. The function ends in a VIRTUAL dispatch —
`movq (%rdi),%rax ; movq 0x38(%rax),%rax ; jmpq *%rax` — so the thing worth measuring is not a
return value but the DISPATCH: which vtable slot is entered, and which value arrives in each
argument register. That is measurable without owning a real PCSerializer subclass: build a
SYNTHETIC vtable in ctypes memory whose twelve slots hold twelve DISTINCT Python callbacks, point
a fake object's vptr at it, and let the live function jump into whichever one it chooses. The
callback records the slot index and the three pointers it was handed.

WHY UNDER ROSETTA. Every port here is transcribed from the x86_64 slice while a plain dlopen maps
arm64; an address-based differential run natively fails silently TOWARD verified. This script
REFUSES to run natively.

WHY THE TYPESCRIPT IS EXECUTED RATHER THAN RESTATED. The expected observations come from running
the REAL `raw-port/src/infra/PCSerializerReadStream.ts` (and `PCStreamElement.ts`) through
`PCSerializerReadStream_processElement_driver.mts`. A Python restatement would share any
misreading of the disassembly with the port and then agree with it.

WHAT IT MEASURES, against the live x86_64 ProCore image:
  A. the dlsym'd address IS slide+0x2681c and the 37 mapped opcode bytes there are the ones the
     port was transcribed from (through the trailing `retq` at 0x26840)
  B. DISPATCH IDENTITY: with a synthetic 12-slot vtable, the live function enters SLOT 7
     (vptr+0x38) and no other slot — the fact the port's virtual call depends on
  C. ARGUMENT SHUFFLE: the callback is entered with %rdi = the element's +0x18 object,
     %rsi = the stream `this`, %rdx = the element — the three-way move at 0x26820..0x26826
  D. THE +0xc STORE: the byte at element+0xc is 1 after a dispatching call and UNTOUCHED on the
     NULL-serializer path; both arenas are otherwise byte-identical (0xCD poison, so "untouched"
     is distinguishable from "wrote zeros")
  E. THE TAIL-JMP: the callee's `bool` comes back unchanged (both 0 and 1 are exercised), and the
     NULL path returns 0
  F. DIFFERENTIAL: the TypeScript port produces the same observation for every scenario
  G. NEGATIVE CONTROLS: seven deliberately wrong variants of the method, evaluated by the same tsx
     process on the same scenarios, must EACH diverge from the live observations — otherwise the
     scenarios are too weak for F to mean anything, and this script FAILS rather than passing.

WHAT IT CANNOT SHOW: that slot 7 is *named* `parseElement`. That comes from reading the real
vtables of instantiated subclasses out of the live images and naming each entry with dladdr
(`__ZTV7OZScene`/`__ZTV10OZDocument` slot 7 = `…::parseElement(PCSerializerReadStream&,
PCStreamElement&)`, with `PCSerializer::readSignificantWhiteSpace` un-overridden at slot 8) —
recorded in the port's doc comment. This script measures the slot INDEX, which is what the
transcription depends on.

Run: arch -x86_64 /usr/bin/python3 -u \
       raw-port/re/oracle/PCSerializerReadStream_processElement_oracle.py
     (no arguments; paths resolve relative to this file, so it runs in any worktree)
"""
import ctypes
import json
import os
import platform
import subprocess
import sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProCore.framework/Versions/A/ProCore"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

SYM = "_ZN22PCSerializerReadStream14processElementER15PCStreamElement"  # no leading underscore
VA = 0x2681c
# 0x2681c..0x26840 inclusive — the whole body, up to and including `retq`.
EXPECT = bytes.fromhex(
    "55"            # pushq %rbp
    "4889e5"        # movq %rsp, %rbp
    "4889f2"        # movq %rsi, %rdx
    "4889fe"        # movq %rdi, %rsi
    "488b7a18"      # movq 0x18(%rdx), %rdi
    "4885ff"        # testq %rdi, %rdi
    "740e"          # je 0x2683d
    "c6420c01"      # movb $0x1, 0xc(%rdx)
    "488b07"        # movq (%rdi), %rax
    "488b4038"      # movq 0x38(%rax), %rax
    "5d"            # popq %rbp
    "ffe0"          # jmpq *%rax
    "31c0"          # xorl %eax, %eax
    "5d"            # popq %rbp
    "c3"            # retq
)
SLOT_UNDER_TEST = 7          # vptr+0x38
NSLOTS = 12
ARENA = 0x100

HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "PCSerializerReadStream_processElement_driver.mts")
TSX = os.path.abspath(os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx"))

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

# ------------------------------------------------------- load the live image


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        for r in RPATHS:
            p = os.path.join(r, name[len("@rpath/"):])
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


loaded, failed = set(), []


def preload(path, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e).split(":")[-1].strip()[:60]))


preload(PC)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
for f in failed[:5]:
    print("   failed:", f)
lib = ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProCore"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("ProCore image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProCore not in the image list")

addr = ctypes.cast(getattr(lib, SYM), ctypes.c_void_p).value
fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — address and bytes.
check("A dlsym address == slide+0x%x" % VA, addr == slide + VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (addr, VA, slide + VA))
got = ctypes.string_at(addr, len(EXPECT))
check("A opcode self-check (%d bytes)" % len(EXPECT), got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))

fn = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_void_p)(addr)

# --------------------------------------------------- the synthetic receiver
# A 12-slot vtable of DISTINCT callbacks. Whichever slot the live function chooses is the one that
# records — so "it entered slot 7" is observed, not assumed.
CB = ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)
observed = {}
callee_ret = [0]


def make_cb(slot):
    def impl(rdi, rsi, rdx):
        observed.setdefault("hits", []).append(
            {"slot": slot, "rdi": rdi or 0, "rsi": rsi or 0, "rdx": rdx or 0})
        return callee_ret[0]
    return CB(impl)


callbacks = [make_cb(i) for i in range(NSLOTS)]          # kept alive for the process's lifetime
vtable = (ctypes.c_uint64 * NSLOTS)(
    *[ctypes.cast(cb, ctypes.c_void_p).value for cb in callbacks])

stream_arena = ctypes.create_string_buffer(b"\xCD" * ARENA, ARENA)
element_arena = ctypes.create_string_buffer(b"\xCD" * ARENA, ARENA)
target_arena = ctypes.create_string_buffer(b"\xCD" * ARENA, ARENA)
STREAM = ctypes.addressof(stream_arena)
ELEMENT = ctypes.addressof(element_arena)
TARGET = ctypes.addressof(target_arena)
ctypes.c_uint64.from_address(TARGET).value = ctypes.addressof(vtable)   # the fake object's vptr


def tag_ptr(p):
    return {TARGET: "target", STREAM: "stream", ELEMENT: "element"}.get(p, "?0x%x" % p)


SCENARIOS = [
    {"name": "no serializer at +0x18", "hasTarget": False, "calleeReturns": 0},
    {"name": "serializer present, callee returns true", "hasTarget": True, "calleeReturns": 1},
    {"name": "serializer present, callee returns false", "hasTarget": True, "calleeReturns": 0},
]

live = []
for sc in SCENARIOS:
    element_arena.raw = b"\xCD" * ARENA
    stream_arena.raw = b"\xCD" * ARENA
    ctypes.c_uint64.from_address(ELEMENT + 0x18).value = TARGET if sc["hasTarget"] else 0
    ctypes.c_uint8.from_address(ELEMENT + 0x0c).value = 0     # the ctor's zero @0x286f3
    observed.clear()
    callee_ret[0] = sc["calleeReturns"]

    ret = fn(STREAM, ELEMENT)

    hits = observed.get("hits", [])
    obs = {
        "ret": 1 if ret else 0,
        "flag": ctypes.c_uint8.from_address(ELEMENT + 0x0c).value,
        "callee": ("slot%d" % hits[0]["slot"]) if hits else "none",
        "a1": tag_ptr(hits[0]["rdi"]) if hits else "-",
        "a2": tag_ptr(hits[0]["rsi"]) if hits else "-",
        "a3": tag_ptr(hits[0]["rdx"]) if hits else "-",
        "calls": len(hits),
    }
    live.append(obs)
    print("  live %-42s -> %s" % (sc["name"], json.dumps(obs)))

    # B/C/E per-scenario assertions on the live side.
    if sc["hasTarget"]:
        check("B slot %d entered (%s)" % (SLOT_UNDER_TEST, sc["name"]),
              obs["callee"] == "slot%d" % SLOT_UNDER_TEST and obs["calls"] == 1, obs["callee"])
        check("C args (%%rdi,%%rsi,%%rdx) = (target,stream,element) (%s)" % sc["name"],
              (obs["a1"], obs["a2"], obs["a3"]) == ("target", "stream", "element"),
              "(%s,%s,%s)" % (obs["a1"], obs["a2"], obs["a3"]))
        check("D +0xc == 1 after dispatch (%s)" % sc["name"], obs["flag"] == 1,
              "0x%02x" % obs["flag"])
        check("E callee's bool returned unchanged (%s)" % sc["name"],
              obs["ret"] == sc["calleeReturns"], "%d" % obs["ret"])
    else:
        check("E NULL serializer -> returns 0", obs["ret"] == 0, "%d" % obs["ret"])
        check("D +0xc untouched on the NULL path", obs["flag"] == 0, "0x%02x" % obs["flag"])
        check("B no dispatch on the NULL path", obs["calls"] == 0, "%d call(s)" % obs["calls"])

    # D — nothing else in either arena moved.
    expect_el = bytearray(b"\xCD" * ARENA)
    expect_el[0x18:0x20] = (TARGET if sc["hasTarget"] else 0).to_bytes(8, "little")
    expect_el[0x0c] = obs["flag"]
    check("D element arena otherwise byte-identical (%s)" % sc["name"],
          bytes(element_arena.raw) == bytes(expect_el),
          "%d byte(s) differ" % sum(a != b for a, b in zip(bytes(element_arena.raw), bytes(expect_el))))
    check("D stream arena untouched (%s)" % sc["name"],
          bytes(stream_arena.raw) == b"\xCD" * ARENA,
          "%d byte(s) differ" % sum(a != 0xCD for a in bytes(stream_arena.raw)))

# ------------------------------------------------- run the TypeScript port
if not os.path.exists(TSX):
    sys.exit("INCONCLUSIVE: tsx not found at %s (run npm install in raw-port/)" % TSX)
proc = subprocess.run([TSX, DRIVER], input=json.dumps({"scenarios": SCENARIOS}),
                      capture_output=True, text=True)
if proc.returncode != 0:
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:])
    sys.exit("INCONCLUSIVE: the TS driver did not run (exit %d)" % proc.returncode)
reply = json.loads(proc.stdout)

KEYS = ("ret", "flag", "callee", "a1", "a2", "a3", "calls")


def same(a, b):
    return all(a[k] == b[k] for k in KEYS)


# F — the differential.
for i, sc in enumerate(SCENARIOS):
    ts = reply["port"][i]
    check("F TS == live (%s)" % sc["name"], same(ts, live[i]),
          "ts=%s live=%s" % (json.dumps({k: ts[k] for k in KEYS}),
                             json.dumps({k: live[i][k] for k in KEYS})))

# G — every negative control must be caught by these scenarios.
for name in sorted(reply["mutants"]):
    rows = reply["mutants"][name]
    n = sum(0 if same(rows[i], live[i]) else 1 for i in range(len(SCENARIOS)))
    check("G mutant '%s' DIVERGES from the live function" % name, n > 0,
          "%d of %d scenarios differ" % (n, len(SCENARIOS)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails),
                                           len(fails)))
sys.exit(0 if not fails else 1)
