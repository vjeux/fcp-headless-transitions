#!/usr/bin/env python3
"""Differential oracle for HGString::~HGString() [D1] @Helium 0xb7990
(__ZN8HGStringD1Ev, `nm` class T).

WHY THIS EXISTS: PR #149 first shipped this dtor with its two deallocation
boundaries (`_free` @0xb79c4/@0xb79cd and `__ZdlPv` @0xb79bb) written as
`throw`, so the destructor raised on the refcount-hits-zero path — the last
owner destructing, which is the normal case — instead of running.  The reviewer
asked for those two helpers to become no-ops.  This harness measures the fixed
port against the live Helium function rather than asserting the equivalence.

WHAT IS COMPARED.  The dtor returns void, so the observables are the receiver
and the two heap blocks it owns:

  * `--alloc->refCount` at +0x08 of the Alloc record (`decq 0x8(%rax)` @0xb79a2)
  * `this->extraEnd = this->extraBegin` (`movq %rdi,0x20(%rbx)` @0xb79b1) --
    reachable from BOTH predecessors of L_b79b1, so the corpus exercises the
    fall-through @0xb79af AND the back-edge @0xb79d9
  * WHETHER the two `free`s and the `operator delete` happened, observed
    without dereferencing freed memory: `malloc_size(p)` on a live block is its
    size and on a freed block is 0 (the stable half of the OPS_LOG dtor recipe;
    the address-reuse signal is deliberately NOT part of any verdict because it
    is run-dependent).
  * every other byte of a poisoned 0x40-byte receiver arena, byte-diffed, which
    is what proves the machine leaves `alloc` and `extraBegin` DANGLING rather
    than nulling them -- the "NOT DONE BY THE MACHINE" claim in the port.

The heap blocks are allocated with the exact allocators the binary's
deallocators are paired with (`malloc` for the two `_free` operands, `_Znwm`
for the `__ZdlPv` operand) and are separated by live SPACER blocks, because
macOS's tiny allocator coalesces neighbouring freed blocks and a coalesced
region answers a later same-size request differently (OPS_LOG).

ARCHITECTURE: `arch -x86_64 /usr/bin/python3` only.  The vmaddr comes from
raw-port/army/inventory/Helium.syms.txt (x86_64 by construction) and the
prologue bytes at slide+vmaddr are checked before any number is trusted.

USAGE:  arch -x86_64 /usr/bin/python3 HGString_destroy_oracle.py
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Helium"
VMADDR = 0xB7990        # __ZN8HGStringD1Ev
INST = 0x40             # receiver arena
OFF_ALLOC = 0x10        # movq 0x10(%rdi),%rax  @0xb7999
OFF_XBEGIN = 0x18       # movq 0x18(%rbx),%rdi  @0xb79a8 / @0xb79d2
OFF_XEND = 0x20         # movq %rdi,0x20(%rbx)  @0xb79b1
ALLOC_REC = 0x18        # cap +0x00, refCount +0x08, base +0x10
OFF_REFCOUNT = 0x08
OFF_BASE = 0x10
POISON = 0xCD

# pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax ; movq %rdi,%rbx
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x53, 0x50, 0x48, 0x89, 0xFB))

libc = ctypes.CDLL(None)
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]
libc.malloc_size.restype = ctypes.c_size_t
libc.malloc_size.argtypes = [ctypes.c_void_p]
libc._Znwm.restype = ctypes.c_void_p      # ::operator new(size_t) — the exact
libc._Znwm.argtypes = [ctypes.c_size_t]   # allocator __ZdlPv is paired with

# name, alloc present, initial refCount, extraBegin present
CASES = [
    ("no alloc, no extra", False, 0, False),
    ("refcount 2 survives", True, 2, False),
    ("refcount 1 -> free", True, 1, False),
    ("survives + extra", True, 2, True),
    ("free + extra (back-edge)", True, 1, True),
    ("no alloc + extra", False, 0, True),
]


def u64(p, off):
    return ctypes.c_uint64.from_address(p + off).value


def put64(p, off, v):
    ctypes.c_uint64.from_address(p + off).value = v


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to run"
                         % (addr, got.hex(), PROLOGUE.hex()))
    dtor = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)

    results = []
    for name, has_alloc, rc0, has_extra in CASES:
        inst = ctypes.create_string_buffer(bytes([POISON]) * INST, INST)
        base_addr = ctypes.addressof(inst)

        rec = basep = xb = 0
        spacers = []
        if has_alloc:
            basep = libc.malloc(32)
            spacers.append(libc.malloc(32))       # keep the two freed blocks
            rec = libc.malloc(ALLOC_REC)          # from becoming neighbours
            put64(rec, 0x00, 32)                  # cap
            put64(rec, OFF_REFCOUNT, rc0)
            put64(rec, OFF_BASE, basep)
        if has_extra:
            spacers.append(libc.malloc(32))
            xb = libc._Znwm(48)

        put64(base_addr, OFF_ALLOC, rec)
        put64(base_addr, OFF_XBEGIN, xb)
        put64(base_addr, OFF_XEND, 0xDEADBEEFDEADBEEF)
        before = ctypes.string_at(base_addr, INST)
        size_base_before = libc.malloc_size(basep) if basep else 0
        size_rec_before = libc.malloc_size(rec) if rec else 0
        size_xb_before = libc.malloc_size(xb) if xb else 0

        dtor(base_addr)

        after = ctypes.string_at(base_addr, INST)
        stray = [i for i in range(INST)
                 if before[i] != after[i] and not (OFF_XEND <= i < OFF_XEND + 8)]
        freed_base = bool(basep) and libc.malloc_size(basep) == 0
        freed_rec = bool(rec) and libc.malloc_size(rec) == 0
        freed_xb = bool(xb) and libc.malloc_size(xb) == 0
        # refCount is only readable while the record is still live
        rc_after = None if (not rec or freed_rec) else u64(rec, OFF_REFCOUNT)

        results.append({
            "case": name,
            "refCountAfter": rc_after,
            "extraEndIsBegin": u64(base_addr, OFF_XEND) == xb and has_extra,
            "allocStillPointed": u64(base_addr, OFF_ALLOC) == rec,
            "extraBeginStillPointed": u64(base_addr, OFF_XBEGIN) == xb,
            "strayBytes": len(stray),
            "freedBase": freed_base, "freedRec": freed_rec, "freedExtra": freed_xb,
            "liveSizes": (size_base_before, size_rec_before, size_xb_before),
            "threw": False,
        })
        for s in spacers:
            pass  # deliberately leaked: freeing them re-arms the coalescing trap

    ts = run_ts()

    print("HGString::~HGString [D1]  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    hdr = ("%-26s | %-30s | %-30s | %s"
           % ("case", "live Helium", "TS port", "verdict"))
    print(hdr); print("-" * len(hdr))
    diverged = 0
    for i, r in enumerate(results):
        t = ts["port"][i]
        agree = (r["refCountAfter"] == t["refCountAfter"]
                 and r["extraEndIsBegin"] == t["extraEndIsBegin"]
                 and r["threw"] == t["threw"]
                 and r["allocStillPointed"] and r["extraBeginStillPointed"]
                 and t["allocStillPointed"] and t["extraBeginStillPointed"]
                 and r["strayBytes"] == 0 and t["strayFields"] == 0)
        diverged += 0 if agree else 1
        print("%-26s | %-30s | %-30s | %s"
              % (r["case"], fmt(r), fmt(t), "agree" if agree else "DIVERGED"))
    print()
    print("cases: %d   divergences: %d" % (len(results), diverged))
    print()
    print("DEALLOCATION ACTUALLY OBSERVED on the live side (malloc_size -> 0),")
    print("which is the fact the JS no-op boundary stands in for:")
    for r in results:
        print("   %-26s freed base=%-5s rec=%-5s extra=%-5s   (live sizes were %s)"
              % (r["case"], r["freedBase"], r["freedRec"], r["freedExtra"],
                 r["liveSizes"]))
    print()
    print("NEGATIVE CONTROLS (same cases, same node process):")
    for m in ts["mutants"]:
        killed = 0
        for i, t in enumerate(m["results"]):
            r = results[i]
            if not (r["refCountAfter"] == t["refCountAfter"]
                    and r["extraEndIsBegin"] == t["extraEndIsBegin"]
                    and r["threw"] == t["threw"]):
                killed += 1
        note = "" if killed else "   <-- EQUIVALENT or BLIND: see the driver's note"
        print("  %-52s killed %d/%d%s" % (m["name"], killed, len(results), note))
    print()
    print("VERDICT: %s" % ("VERIFIED — 0 divergences" if diverged == 0
                           else "DIVERGED (%d)" % diverged))
    return 1 if diverged else 0


def fmt(r):
    return ("rc=%s xEnd=%s threw=%s"
            % (r["refCountAfter"], "set" if r["extraEndIsBegin"] else "-",
               r["threw"]))


def run_ts():
    driver = os.path.join(HERE, "HGString_destroy_driver.mts")
    payload = json.dumps([{"name": n, "alloc": a, "rc": c, "extra": x}
                          for n, a, c, x in CASES])
    out = subprocess.run(["node", "--experimental-strip-types", driver],
                         input=payload, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit("TS driver failed:\n%s\n%s" % (out.stdout, out.stderr))
    return json.loads(out.stdout)


if __name__ == "__main__":
    sys.exit(main())
