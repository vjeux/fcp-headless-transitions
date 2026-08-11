#!/usr/bin/env python3
"""PCSerializerReadStream_currentHandlerElement_oracle.py — differential for

    PCSerializerReadStream::currentHandlerElement() const   @ProCore 0x264f6
    __ZNK22PCSerializerReadStream21currentHandlerElementEv  (nm class T, exported)

WHAT IT COMPARES. The live ProCore function against the SHIPPED TypeScript, not against a Python
restatement of it: the TS half runs through
`PCSerializerReadStream_currentHandlerElement_driver.mts`, which imports the real
`raw-port/src/infra/PCSerializerReadStream.ts`. A Python model would share any misreading of the
disassembly with the port and agree enthusiastically.

HOW THE LIVE SIDE IS DRIVEN. The function is pure memory arithmetic over a
`std::deque<PCSerializerReadStream::HandlerInfo>` living at `this+0x38`, so the harness BUILDS one
in ctypes memory — a real block map, real 40-byte HandlerInfo records — and calls the real symbol
on it. Every HandlerInfo at global index g carries a distinct element pointer 0x2000000000+g at
+0x20 and a distinct HANDLER pointer 0x3000000000+g at +0x18, so a port that reads the sibling
field (`currentHandler`'s +0x18) diverges instead of coincidentally agreeing. Nothing dereferences
those pointers: this function only returns one.

MUST RUN UNDER ROSETTA — `arch -x86_64 /usr/bin/python3`. Every citation in the port is an x86_64
offset; the arm64 slice lays this class out for a different ABI and an address-based differential
run there fails SILENTLY TOWARD VERIFIED. The harness refuses to run natively rather than trusting
the caller, and self-checks the prologue bytes at slide+0x264f6 before it believes any number.

NEGATIVE CONTROLS. Five mutants, each produced by a single textual substitution in a COPY of the
port's own source (never in the worktree), plus M0 — the same copy with no substitution — which
must kill 0. M0 is what makes the other five mean something: without it, a table of non-zero kills
cannot be distinguished from a harness that is measuring its own bug (OPS_LOG: "an inflated control
is as bad as a dead one").
"""
import ctypes
import json
import os
import platform
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(REPO, "raw-port", "src", "infra")
PORT = os.path.join(SRC, "PCSerializerReadStream.ts")
DRIVER = os.path.join(HERE, "PCSerializerReadStream_currentHandlerElement_driver.mts")
SYM = "_ZNK22PCSerializerReadStream21currentHandlerElementEv"   # dlsym: no leading underscore
VMADDR = 0x264F6            # from raw-port/army/inventory/ProCore.syms.txt (x86_64 by construction)
PER_BLOCK = 102             # imulq $0x66 @0x26529
ELEM_BASE = 0x2000000000
HAND_BASE = 0x3000000000
# movq 0x60(%rdi),%rax ; testq %rax,%rax ; je — the first three instructions, as bytes.
PROLOGUE = bytes([0x48, 0x8B, 0x47, 0x60, 0x48, 0x85, 0xC0, 0x74])

sys.path.insert(0, HERE)
from ozone_loader import load_framework, image_slide            # noqa: E402


def require_rosetta():
    if platform.machine() != "x86_64":
        sys.exit("REFUSING: run under `arch -x86_64 /usr/bin/python3` — the port is transcribed "
                 "from the x86_64 slice and an arm64 differential fails toward VERIFIED")


CASES = [
    # (start, size) — chosen so the corpus crosses every boundary the arithmetic has.
    (0, 0),        # empty -> the je at 0x264fd, the only early exit
    (0, 1),        # first element of the first block
    (0, 2),
    (0, 101),      # last slot of block 0
    (0, 102),      # ...and the first slot of block 1 (the /102 boundary)
    (0, 103),
    (1, 101),      # __start_ pushes the back index across the boundary on its own
    (101, 1),      # back index 101: still block 0
    (101, 2),      # back index 102: block 1, offset 0
    (102, 1),
    (203, 1),      # block 2
    (204, 1),
    (50, 300),     # spans three blocks
    (1000, 5),     # block 9
    (10000, 1),    # block 98 — far enough that a wrong shift (>>9, the element deque's) is visible
    (10403, 1),    # back index 10403 = 102*102 - 1: last slot of block 101
    (10404, 1),    # ...and the first of block 102
]


def poke64(buf, off, val):
    """Write a little-endian u64 into a ctypes buffer. Kept as one helper so every field write goes
    through the same code — a hand-rolled memmove with a temporary as its SOURCE is the ctypes
    footgun that makes a harness corrupt its own case and then blame the port."""
    src = ctypes.c_uint64(val)
    ctypes.memmove(ctypes.byref(buf, off), ctypes.byref(src), 8)


def build_arena(start, size):
    """A fake PCSerializerReadStream whose handler deque is real memory. Returns (obj, keepalive)."""
    back = start + size - 1
    nblocks = (back // PER_BLOCK) + 1 if size else 1
    keep = []
    blocks = (ctypes.c_void_p * nblocks)()
    for b in range(nblocks):
        # POISON the block, then write the two pointers. Poison, not zeros: with a zeroed arena a
        # port that reads the wrong offset returns NULL, and "untouched" is then indistinguishable
        # from "read the wrong field".
        blk = ctypes.create_string_buffer(b"\xCD" * (PER_BLOCK * 40), PER_BLOCK * 40)
        for o in range(PER_BLOCK):
            g = b * PER_BLOCK + o
            poke64(blk, o * 40 + 0x18, HAND_BASE + g)
            poke64(blk, o * 40 + 0x20, ELEM_BASE + g)
        keep.append(blk)
        blocks[b] = ctypes.cast(blk, ctypes.c_void_p)
    keep.append(blocks)
    obj = ctypes.create_string_buffer(b"\xCD" * 0x100, 0x100)   # explicit length: no +1 NUL trap
    poke64(obj, 0x40, ctypes.cast(blocks, ctypes.c_void_p).value)   # __map_.__begin_
    poke64(obj, 0x58, start)                                        # __start_
    poke64(obj, 0x60, size)                                         # __size_
    keep.append(obj)
    return obj, keep, nblocks


def run_driver(module_path=None):
    payload = {"cases": [{"start": s, "size": n, "nblocks": nb} for (s, n, nb) in CASE_SHAPES]}
    cmd = ["node", "--experimental-strip-types", DRIVER]
    if module_path:
        cmd.append(module_path)
    p = subprocess.run(cmd, input=json.dumps(payload), capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        sys.exit("driver failed (%s):\n%s\n%s" % (p.returncode, p.stdout[-2000:], p.stderr[-2000:]))
    return json.loads(p.stdout)


MUTANTS = [
    # Every one of these is a slip a transcriber of THIS function can actually make, and four of the
    # five are visible in the sibling currentElement() @0x2647a, which is 512-per-block, shifts by 9
    # and returns the element pointer directly.
    ("M0 unmutated copy through the same pipeline (must kill 0)", None, None),
    ("M1 drop the decq @0x2650a — index = start+size, not the LAST record",
     "BigInt(start) + BigInt(size) - 1n", "BigInt(start) + BigInt(size) - 0n"),
    ("M2 shift 9 instead of 6 — the ELEMENT deque's 512-per-block on the HANDLER deque",
     ">> 64n) >> 6n)", ">> 64n) >> 9n)"),
    ("M3 read +0x18 (currentHandler's field @0x264ae) instead of +0x20",
     "blockRecords[record].element", "blockRecords[record].handler"),
    # The anchor carries the cited line above it: `if (size === 0) {` alone appears TWICE in this
    # file (currentElement has the same guard), and the count assertion below caught it — a mutant
    # that patches the sibling method scores like a real one and proves nothing about this one.
    ("M4 drop the empty-stack early exit @0x264fd",
     "// @0x264fa  testq %rax, %rax  /  @0x264fd  je 0x2653b\n    if (size === 0) {",
     "// @0x264fa  testq %rax, %rax  /  @0x264fd  je 0x2653b\n    if (false) {"),
    ("M5 ignore __start_ @0x26503 — index from the front of the map",
     "BigInt(start) + BigInt(size)", "0n + BigInt(size)"),
]


def make_mutant(mutdir, name, old, new, idx):
    src = open(PORT).read()
    if old is not None:
        if src.count(old) != 1:
            sys.exit("mutant %r: anchor %r occurs %d times — a mutant that patches the wrong text "
                     "scores like a real one and proves nothing" % (name, old, src.count(old)))
        src = src.replace(old, new)
    path = os.path.join(mutdir, "Mut%d.ts" % idx)
    open(path, "w").write(src)
    return path


def main():
    require_rosetta()
    lib = load_framework("ProCore")
    if lib is None:
        sys.exit("could not load ProCore")
    slide, image = image_slide("ProCore")

    got = ctypes.string_at(slide + VMADDR, len(PROLOGUE))
    if got != PROLOGUE:
        sys.exit("PROLOGUE MISMATCH at slide+0x%x: %s != %s — refusing to report a number computed "
                 "at an address that does not hold the function this port transcribes"
                 % (VMADDR, got.hex(), PROLOGUE.hex()))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_void_p
    fn.argtypes = [ctypes.c_void_p]
    dl = ctypes.cast(fn, ctypes.c_void_p).value
    print("ProCore image  : %s" % image)
    print("slide          : 0x%x   symbol via dlsym: 0x%x   slide+0x%x: 0x%x %s"
          % (slide, dl, VMADDR, slide + VMADDR,
             "MATCH" if dl == slide + VMADDR else "*** MISMATCH ***"))
    print("prologue       : %s  (matches the disassembly at 0x264f6)" % got.hex())

    live = []
    for (start, size) in CASES:
        obj, keep, nblocks = build_arena(start, size)
        before = bytes(obj)
        r = fn(ctypes.cast(obj, ctypes.c_void_p))
        if bytes(obj) != before:
            sys.exit("the callee WROTE to the receiver — a const accessor must not")
        live.append(None if r in (None, 0) else "0x%x" % r)
        CASE_SHAPES.append((start, size, nblocks))
        del keep

    ts = run_driver()
    rows = []
    diverged = 0
    for i, (start, size) in enumerate(CASES):
        l, t, err = live[i], ts["values"][i], ts["errors"][i]
        ok = (l == t) and err is None
        if not ok:
            diverged += 1
        rows.append((start, size, l, t, err, ok))

    print("\n  start    size   live ProCore        shipped TS          ")
    for (start, size, l, t, err, ok) in rows:
        print("  %6d %6d   %-18s %-18s %s%s" % (start, size, l or "NULL", t or "NULL",
                                                "ok" if ok else "DIVERGED",
                                                "  [TS threw: %s]" % err if err else ""))
    print("\n%d/%d agree -> %s" % (len(CASES) - diverged, len(CASES),
                                   "VERIFIED" if diverged == 0 else "DIVERGED"))

    # ---- negative controls -------------------------------------------------------------------
    mutdir = os.path.join("/tmp", "w7_pcsrs_mutants")
    os.makedirs(mutdir, exist_ok=True)
    for f in os.listdir(SRC):
        if f.endswith(".ts"):
            link = os.path.join(mutdir, f)
            if not os.path.exists(link):
                os.symlink(os.path.join(SRC, f), link)
    print("\nnegative controls (each mutant is the port's OWN source with one substitution):")
    dead = []
    for idx, (name, old, new) in enumerate(MUTANTS):
        path = make_mutant(mutdir, name, old, new, idx)
        out = run_driver(path)
        killed = sum(1 for i in range(len(CASES))
                     if out["values"][i] != live[i] or out["errors"][i] is not None)
        print("  %-72s killed %3d/%d" % (name, killed, len(CASES)))
        if idx == 0 and killed != 0:
            sys.exit("M0 (unmutated) killed %d — the mutation pipeline itself perturbs the port, so "
                     "every number below it is that bug plus a little signal" % killed)
        if idx > 0 and killed == 0:
            dead.append(name)
    if dead:
        print("\n  DEAD CONTROLS (a mutant that kills 0 means a blind harness OR an equivalent "
              "mutant — say which):")
        for d in dead:
            print("    - %s" % d)

    sys.exit(0 if diverged == 0 else 1)


CASE_SHAPES = []

if __name__ == "__main__":
    main()
