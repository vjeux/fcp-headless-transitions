DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
#!/usr/bin/env python3
"""HGArray<float vector[4],(HGFormat)28>::~HGArray @Helium 0xdc0f0 — live differential.

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/HGArray_float_vector4_HGFormat28_oracle.py

WHAT THIS SETTLES. Review blocked PR #112 because both deallocation boundaries —
`operator delete[]` (__ZdaPv, called @0xdc10c) and `operator delete` (__ZdlPv,
TAIL-jumped @0xdc11a) — were modelled as THROWS while sitting on the ORDINARY
last-reference path: the branch the machine takes whenever `lock decl (%rbx)`
@0xdc0ff brings the refcount to 0, which is what a destructor exists to do. So
the port raised instead of completing on exactly the input a destructor is for.

The symbol is `t` (LOCAL), so it is called at `slide + 0xdc0f0` from the cached
x86_64 inventory — never from a bare `nm`, which answers from the arm64 slice
even under Rosetta (OPS_LOG) — and the call is self-checked against the
prologue bytes the transcription was taken from before any number is reported.

WHAT IS MEASURED, per case, on real memory:
  * the atomic decrement @0xdc0ff — the refcount word after the call;
  * WHETHER each free happened, via `malloc_size(p) == 0` on the freed block.
    That predicate is stable (OPS_LOG: address REUSE is run-dependent and must
    not enter a verdict; malloc_size is not);
  * that the 24 bytes of the object arena past the +0x00 slot are untouched;
  * the two early-exit paths: a NULL dataRef @0xdc0fc and a still-shared
    refcount @0xdc101 must free NOTHING.

The buffer and the control block are allocated NON-ADJACENTLY, with a live
spacer between them: macOS's tiny allocator coalesces two neighbouring freed
blocks, and the coalesced region then answers a same-size request, which reads
as "nothing was freed" on the one case where both frees happen (OPS_LOG).

The TypeScript side is the REAL port, imported by
`HGArray_float_vector4_HGFormat28_driver.mts` (no Python restatement of it).
The two boundaries are `private static` — TypeScript-private only, ordinary
static properties at runtime — so the driver replaces them with recorders and
reports the free ORDER, which is what makes the two sides comparable.

NEGATIVE CONTROL: the driver also runs the pre-fix "throwing" model, in the
same node process, on the same cases.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as OZ

SYM = "__ZN7HGArrayIDv4_fL8HGFormat28EED1Ev"
# The prologue the transcription was taken from: pushq %rbp; movq %rsp,%rbp;
# pushq %rbx; pushq %rax  (0xdc0f0..0xdc0f5).
PROLOGUE = bytes([0x55, 0x48, 0x89, 0xE5, 0x53, 0x50])

libc = ctypes.CDLL(None)
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]
libc.malloc_size.restype = ctypes.c_size_t
libc.malloc_size.argtypes = [ctypes.c_void_p]
libc.free.argtypes = [ctypes.c_void_p]

CB_SIZE = 0x20     # control block: refCount +0x00 (32-bit), buffer +0x10
BUF_SIZE = 0x40
ARENA = 32         # the HGArray object: url-sized slot at +0x00, poisoned tail


def build(refcount, with_buffer):
    """Allocate a control block (+ optional element buffer, non-adjacent) and the
    object arena that points at it. Returns (arena, cb, buf, spacer)."""
    cb = libc.malloc(CB_SIZE)
    spacer = libc.malloc(BUF_SIZE)          # keeps cb and buf apart (no coalescing)
    buf = libc.malloc(BUF_SIZE) if with_buffer else None
    ctypes.memset(cb, 0, CB_SIZE)
    ctypes.c_int32.from_address(cb).value = refcount          # +0x00 refcount
    ctypes.c_uint64.from_address(cb + 0x10).value = buf or 0  # +0x10 buffer
    arena = ctypes.create_string_buffer(b"\xCD" * ARENA, ARENA)  # explicit size: no +1 NUL
    ctypes.c_uint64.from_address(ctypes.addressof(arena)).value = cb
    return arena, cb, buf, spacer


def freed(p):
    """True when the block has been handed back to the allocator."""
    return p is not None and libc.malloc_size(ctypes.c_void_p(p)) == 0


def main():
    dtor, vmaddr, slide = OZ.local_fn("Helium", SYM, None, [ctypes.c_void_p])
    got = ctypes.string_at(slide + vmaddr, len(PROLOGUE))
    print("HGArray<float vector[4],(HGFormat)28>::~HGArray @Helium 0x%x — live differential" % vmaddr)
    print("  slide 0x%x   prologue %s  (expected %s)"
          % (slide, got.hex(), PROLOGUE.hex()))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH — refusing to report a number from the wrong address")

    cases = [
        ("null-dataRef",          None, False),
        ("rc3-shared",               3, True),
        ("rc2-shared",               2, True),
        ("rc1-last-with-buffer",     1, True),
        ("rc1-last-null-buffer",     1, False),
    ]

    native = {}
    print()
    for name, rc, with_buf in cases:
        if rc is None:
            arena = ctypes.create_string_buffer(b"\xCD" * ARENA, ARENA)
            ctypes.c_uint64.from_address(ctypes.addressof(arena)).value = 0
            before = bytes(arena)
            dtor(ctypes.cast(arena, ctypes.c_void_p))
            native[name] = {"refCountAfter": None, "frees": [],
                            "tail_clean": bytes(arena)[8:] == before[8:]}
            print("  %-22s -> nothing freed (early exit @0xdc0fc), arena tail clean=%s"
                  % (name, native[name]["tail_clean"]))
            continue

        arena, cb, buf, spacer = build(rc, with_buf)
        before = bytes(arena)
        dtor(ctypes.cast(arena, ctypes.c_void_p))
        cb_freed, buf_freed = freed(cb), freed(buf)
        # Reading the refcount word of a FREED block is undefined, so only read it
        # while the block is still live.
        rc_after = None if cb_freed else ctypes.c_int32.from_address(cb).value
        frees = ([ "delete[]" ] if buf_freed else []) + ([ "delete" ] if cb_freed else [])
        native[name] = {"refCountAfter": rc_after, "frees": frees,
                        "tail_clean": bytes(arena)[8:] == before[8:]}
        print("  %-22s -> refcount %s   freed: %-20s arena tail clean=%s"
              % (name, rc_after if rc_after is not None else "(block freed)",
                 ",".join(frees) or "(none)", native[name]["tail_clean"]))
        libc.free(ctypes.c_void_p(spacer))
        if not cb_freed:
            libc.free(ctypes.c_void_p(cb))
            if buf and not buf_freed:
                libc.free(ctypes.c_void_p(buf))

    # ---------------------------------------------------------------- TS side
    driver = os.path.join(HERE, "HGArray_float_vector4_HGFormat28_driver.mts")
    proc = subprocess.run(["node", "--experimental-strip-types", driver],
                          capture_output=True, text=True, cwd=HERE, timeout=DRIVER_TIMEOUT)
    if proc.returncode != 0:
        raise SystemExit("TS driver failed:\n" + proc.stderr[-2000:])
    ts = {(r["model"], r["case"]): r for r in json.loads(proc.stdout)}

    print("\nSHIPPED PORT vs LIVE")
    agree = diverge = 0
    for name, _rc, _b in cases:
        t = ts[("shipped", name)]
        n = native[name]
        same_frees = t["frees"] == n["frees"]
        # The refcount is only readable natively while the block is live; where it
        # was freed, the TS value is checked against the 0 that made the branch
        # taken in the first place.
        same_rc = (t["refCountAfter"] == n["refCountAfter"]) if n["refCountAfter"] is not None \
            else (t["refCountAfter"] in (0, None))
        ok = same_frees and same_rc and t["threw"] is None and n["tail_clean"]
        agree += ok
        diverge += (not ok)
        print("  %-22s live frees=%-20s TS frees=%-20s rc live=%-5s TS=%-5s %s"
              % (name, ",".join(n["frees"]) or "(none)", ",".join(t["frees"]) or "(none)",
                 n["refCountAfter"], t["refCountAfter"], "OK" if ok else "DIVERGED"))

    print("\nNEGATIVE CONTROL — the pre-fix model (both boundaries throw)")
    killed = 0
    for name, _rc, _b in cases:
        t = ts[("throwing", name)]
        n = native[name]
        bad = (t["threw"] is not None) or (t["frees"] != n["frees"])
        killed += bad
        print("  %-22s threw=%-42s frees=%s"
              % (name, (t["threw"] or "no")[:42], ",".join(t["frees"]) or "(none)"))

    print("\nRESULT")
    print("  cases agreeing with the live destructor : %d/%d" % (agree, agree + diverge))
    print("  divergences                             : %d" % diverge)
    print("  negative control killed                 : %d/%d cases"
          " (every case whose refcount reaches 0)" % (killed, len(cases)))
    if killed == 0:
        print("  WARNING: a control that kills nothing means the harness is blind, not that")
        print("           the mutant is correct — treat this run as failed.")
    return 0 if (diverge == 0 and killed > 0) else 1


if __name__ == "__main__":
    sys.exit(main())
