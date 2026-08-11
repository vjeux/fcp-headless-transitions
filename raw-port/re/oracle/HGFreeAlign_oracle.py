#!/usr/bin/env python3
"""HGFreeAlign_oracle.py — executable differential for `HGFreeAlign(void*)`
@Ozone 0x688ea0 (`__ZL11HGFreeAlignPv`) against the LIVE Ozone binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGFreeAlign_oracle.py

WHY THIS EXISTS. Reviewer-1 rejected PR #180 not for the transcription — which they
re-derived instruction by instruction — but for the MEMORY MODEL: the port invented a
parallel handle type instead of reading the word its landed sibling
`infra/HGAllocAlign.ts` actually writes, so the transcribed load at @0x688eb8 resolved
to nothing the transcribed store at @0x688e48 ever wrote and the allocator pair could
not compose. That is a claim about a relationship between two functions, so this
harness measures that relationship on the real binary and then on the real ports.

BOTH SYMBOLS ARE LOCAL (`nm` type `t`), so dlsym cannot see either. They are called by
address: the x86_64 vmaddr from raw-port/army/inventory/Ozone.syms.txt plus
`_dyld_get_image_vmaddr_slide`, through `ozone_loader.local_fn` — the OPS_LOG recipe.
Everything runs under `arch -x86_64` because those vmaddrs are x86_64 offsets and the
box is arm64; the loader refuses to run natively.

WHAT THIS CAN AND CANNOT OBSERVE — read this before trusting the numbers.
  * On the BINARY it observes everything that matters: which word the free reads, that
    the freed pointer is the STASHED base rather than the argument, that the `je`
    polarity is the way round the listing says, and that nothing else is released.
    "Was it freed" is measured with `malloc_size(base) == 0`, which OPS_LOG records as
    the stable half of that trick (the address-reuse half is run-dependent and is
    deliberately NOT in the verdict here).
  * On the TYPESCRIPT side the `operator delete` call is a modelled NO-OP under the
    RESOLVED lifetime-extern ruling, so the CALL ITSELF is not externally observable
    from the port. That is a property of the ruling, not a blind spot in this harness,
    and it is why the null-branch polarity is scored on the binary only. What the TS
    side is compared on is the part that is observable and is exactly what the
    rejection was about: which address the load recovers, and whether the pair composes.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

require_x86_64()

ALLOC_SYM = "__ZL12HGAllocAlignm"      # @Ozone 0x688df0
FREE_SYM = "__ZL11HGFreeAlignPv"       # @Ozone 0x688ea0
HEADER = 8
ALIGN_MASK = 0x1F

load_framework("Ozone")
libc = ctypes.CDLL(None)
libc.malloc_size.restype = ctypes.c_size_t
libc.malloc_size.argtypes = [ctypes.c_void_p]

fcp_alloc, ALLOC_ADDR, SLIDE = local_fn("Ozone", ALLOC_SYM, ctypes.c_uint64, [ctypes.c_uint64])
fcp_free, FREE_ADDR, _ = local_fn("Ozone", FREE_SYM, None, [ctypes.c_uint64])

# SELF-CHECK for a local symbol called by address: confirm the bytes actually AT the
# call target are the prologue this unit was transcribed from. Without this, a wrong
# vmaddr (the arm64-vs-x86_64 trap) calls some other function and fails toward a
# confident verdict. `55 48 89 e5` = push %rbp ; mov %rsp,%rbp, then `48 83 ec <n>`
# = sub $n,%rsp — 0x20 for HGFreeAlign @0x688ea4, 0x30 for HGAllocAlign @0x688df4.
_PROLOGUES = {
    "HGFreeAlign": (FREE_ADDR, bytes.fromhex("554889e54883ec20")),
    "HGAllocAlign": (ALLOC_ADDR, bytes.fromhex("554889e54883ec30")),
}
for _name, (_vmaddr, _want) in _PROLOGUES.items():
    _got = ctypes.string_at(SLIDE + _vmaddr, len(_want))
    if _got != _want:
        raise SystemExit(
            f"SELF-CHECK FAILED for {_name} at vmaddr {_vmaddr:#x} (slide {SLIDE:#x}): "
            f"expected prologue {_want.hex()}, found {_got.hex()} — the address does not "
            f"point at the transcribed function, so every number below would be fiction."
        )


SIZES = [0, 1, 7, 8, 9, 15, 16, 17, 31, 32, 33, 64, 100, 255, 4096]


def u64_at(addr):
    return ctypes.c_uint64.from_address(addr).value


def write_u64(addr, val):
    ctypes.c_uint64.from_address(addr).value = val


def machine_side():
    """Call the REAL allocator, then the REAL deallocator, and record what happened."""
    rows = []
    for size in SIZES:
        aligned = fcp_alloc(size)
        base = u64_at(aligned - HEADER)          # the word @0x688e48 wrote / @0x688eb8 reads
        p = base + HEADER
        pad = (-p) & ALIGN_MASK
        row = {
            "size": size,
            "aligned": aligned,
            "base": base,
            # the alignment contract the stash relies on
            "aligned_is_32b": aligned % 32 == 0,
            "aligned_eq_model": aligned == p + pad,
            "live_before": libc.malloc_size(ctypes.c_void_p(base)) != 0,
        }
        # A CANARY the free must not touch. Allocated through the same allocator so it
        # is the same size class, and kept live across the call.
        canary_aligned = fcp_alloc(size)
        canary_base = u64_at(canary_aligned - HEADER)

        fcp_free(aligned)                        # <- the unit under test

        row["freed"] = libc.malloc_size(ctypes.c_void_p(base)) == 0
        row["canary_survived"] = libc.malloc_size(ctypes.c_void_p(canary_base)) != 0
        fcp_free(canary_aligned)
        rows.append(row)
    return rows


def null_branch_side():
    """The `cmpq $0x0 ; je` polarity, on the binary.

    A block whose stashed header is overwritten with 0 must be released by NOTHING —
    if the branch were inverted, the live base would be freed instead.
    """
    aligned = fcp_alloc(64)
    base = u64_at(aligned - HEADER)
    live_before = libc.malloc_size(ctypes.c_void_p(base)) != 0
    write_u64(aligned - HEADER, 0)               # header = NULL -> take the je
    fcp_free(aligned)
    still_live = libc.malloc_size(ctypes.c_void_p(base)) != 0
    # put it back and release it properly, so the harness leaks nothing
    write_u64(aligned - HEADER, base)
    fcp_free(aligned)
    return {"live_before": live_before, "still_live_after_null_header": still_live}


def ts_side(rows):
    driver = os.path.join(HERE, "HGFreeAlign_driver.mts")
    req = {"sizes": [r["size"] for r in rows]}
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def main():
    print("=" * 78)
    print("HGFreeAlign(void*) @Ozone 0x688ea0  —  differential vs live Ozone")
    print("both halves are LOCAL (t) symbols, called by vmaddr + dyld slide under Rosetta")
    print("=" * 78)

    rows = machine_side()
    nb = null_branch_side()
    ts = ts_side(rows)
    ok = True

    print("\n-- BINARY: the stash contract, %d sizes --" % len(rows))
    bad = [r for r in rows if not (r["aligned_is_32b"] and r["aligned_eq_model"]
                                   and r["live_before"])]
    for r in bad:
        print(f"   size={r['size']}: aligned={r['aligned']:#x} base={r['base']:#x} "
              f"32b={r['aligned_is_32b']} model={r['aligned_eq_model']} "
              f"live={r['live_before']}")
    print(f"   {len(rows) - len(bad)}/{len(rows)}: *(aligned-8) is a LIVE allocation, "
          f"aligned is 32-byte aligned, and aligned == base+8+((-(base+8))&31)")
    ok &= not bad

    print("\n-- BINARY: HGFreeAlign releases THE STASHED BASE, and only it --")
    nf = [r for r in rows if not r["freed"]]
    nc = [r for r in rows if not r["canary_survived"]]
    print(f"   freed the stashed base:        {len(rows) - len(nf)}/{len(rows)}")
    print(f"   canary block left untouched:   {len(rows) - len(nc)}/{len(rows)}")
    ok &= not nf and not nc

    print("\n-- BINARY: the `cmpq $0x0 ; je` @0x688ec0/0x688ec4 polarity --")
    print(f"   header zeroed -> base still live afterwards: {nb['still_live_after_null_header']}"
          f"  (an inverted branch would have freed it)")
    ok &= nb["live_before"] and nb["still_live_after_null_header"]

    print("\n-- TYPESCRIPT: the landed HGAllocAlign + this port, same %d sizes --" % len(rows))
    print(f"   pair composes, no throw:                       {ts['composed']}/{len(rows)}")
    print(f"   port's load recovers the stashed base:         {ts['recovered_ok']}/{len(rows)}")
    n_inv = sum(1 for t in ts["pads"] if t["invariant_ok"])
    print(f"   obeys aligned == base+8+((-(base+8))&31), 32b:  {n_inv}/{len(rows)}")
    print("   (the binary's pad and the model's pad are NOT compared to each other: the pad\n"
          "    is a function of the address, and the modelled heap's base is an explicit free\n"
          "    parameter of the landed sibling — comparing them would measure that choice and\n"
          "    nothing about either transcription. Each side is checked against the same RULE\n"
          "    using its own base instead.)")
    ok &= (ts["composed"] == len(rows) and ts["recovered_ok"] == len(rows)
           and n_inv == len(rows))

    print("\n-- NEGATIVE CONTROLS on the load offset (TS, same process as the port) --")
    for label, key in (("M1 read *(p)     instead of *(p-8)", "m1_read_p"),
                       ("M2 read *(p-16)  instead of *(p-8)", "m2_read_pm16"),
                       ("M3 read *(p+8)   instead of *(p-8)", "m3_read_pp8")):
        k = ts["mutants"][key]
        print(f"   {label}: killed {k}/{len(rows)}")
        if k == 0:
            print("   !! scored 0 — say which: a BLIND harness, or an EQUIVALENT mutant. "
                  "Not a clean run.")
            ok = False

    print("\nNOT OBSERVABLE FROM TYPESCRIPT, stated rather than skipped: the port's "
          "`operator delete` is a modelled no-op under the RESOLVED lifetime-extern "
          "ruling, so the CALL cannot be observed from outside the module. The null "
          "branch is therefore scored on the binary only (above), not on the port.")

    print("\n" + ("VERDICT: VERIFIED" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
