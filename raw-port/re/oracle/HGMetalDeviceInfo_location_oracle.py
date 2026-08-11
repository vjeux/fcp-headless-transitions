#!/usr/bin/env python3
"""HGMetalDeviceInfo location trio @Helium 0x1c55a0 / 0x1c55b0 / 0x1c55c0 —
live differential for isSlotted, and the reproduction of the aliasing defect
review found.

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/HGMetalDeviceInfo_location_oracle.py

All three predicates read the SAME u32 at this+0x28:

    isBuiltin  @0x1c55a0  cmpl $0x0, 0x28(%rdi) ; sete %al
    isSlotted  @0x1c55b0  cmpl $0x1, 0x28(%rdi) ; sete %al
    isExternal @0x1c55c0  cmpl $0x2, 0x28(%rdi) ; sete %al

so they are mutually exclusive by construction. The first version of the
isSlotted port declared a SECOND TypeScript field over that one dword and read
that, which throws the exclusion away and is invisible to every static gate.
This harness therefore measures two things at once: that the shipped port
matches the live symbols, and that the aliased arrangement does not.

Addresses come from the cached x86_64 inventory; the symbols are `T`, so plain
dlsym reaches them. Rosetta is mandatory — an arm64 image would be a different
body from the one transcribed (OPS_LOG).
"""
import ctypes, json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as OZ

DRIVER = os.path.join(HERE, "HGMetalDeviceInfo_location_driver.mts")
SYMS = {"isBuiltin": "__ZNK17HGMetalDeviceInfo9isBuiltinEv",
        "isSlotted": "__ZNK17HGMetalDeviceInfo9isSlottedEv",
        "isExternal": "__ZNK17HGMetalDeviceInfo10isExternalEv"}
OBJ_BYTES = 0x200
LOC_OFF = 0x28
FILL = 0x5A


def corpus():
    random.seed(0x1C55B0)
    vals = [0, 1, 2, 3, 4, 5, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF, 0xFFFFFFFE]
    # width probes: low byte / low 16 bits are 1 while the upper half is not —
    # these are what catch a narrower compare than the machine's 32-bit cmpl.
    vals += [0x00000101, 0x00010001, 0xFFFF0001, 0x12340001, 0x00FF0001, 0xDEAD0001]
    vals += [random.getrandbits(32) for _ in range(200)]
    vals += [random.choice([0, 1, 2, 3]) for _ in range(200)]
    return vals


def main():
    fns = {}
    for name, sym in SYMS.items():
        fn, va, slide = OZ.local_fn("Helium", sym, ctypes.c_bool, [ctypes.c_void_p])
        fns[name] = (fn, va)
    slide = OZ.image_slide("Helium")[0]
    for name, (_fn, va) in fns.items():
        got = ctypes.string_at(slide + va, 8)
        print("  %-11s @0x%x  bytes %s" % (name, va, got.hex()))
        # pushq %rbp ; movq %rsp,%rbp ; cmpl $imm, 0x28(%rdi)
        if got[:6] != bytes([0x55, 0x48, 0x89, 0xE5, 0x83, 0x7F]):
            raise SystemExit("prologue mismatch at %s — refusing to report a number" % name)
        if got[6] != 0x28:
            raise SystemExit("%s does not read +0x28 — refusing to report a number" % name)

    vals = corpus()
    obj = ctypes.create_string_buffer(bytes([FILL]) * OBJ_BYTES, OBJ_BYTES)
    live = []
    mutated = 0
    for v in vals:
        ctypes.memset(obj, FILL, OBJ_BYTES)
        ctypes.c_uint32.from_address(ctypes.addressof(obj) + LOC_OFF).value = v
        before = bytes(obj)
        row = {n: bool(fns[n][0](ctypes.cast(obj, ctypes.c_void_p))) for n in SYMS}
        after = bytes(obj)
        if before != after:
            mutated += 1
        live.append(row)

    proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                          input=json.dumps({"values": vals}), capture_output=True,
                          text=True, cwd=HERE)
    if proc.returncode != 0:
        raise SystemExit("TS driver failed:\n" + proc.stderr[-2000:])
    ts = json.loads(proc.stdout)

    n = len(vals)
    print("\nSHIPPED PORT vs LIVE  (%d cases, object pre-filled 0x%02X)" % (n, FILL))
    agree = {k: 0 for k in SYMS}
    for a, b in zip(live, ts["shipped"]):
        for k in SYMS:
            agree[k] += (a[k] == b[k])
    for k in SYMS:
        print("  %-11s %d/%d identical" % (k, agree[k], n))
    excl = sum(1 for a in live if sum(a.values()) > 1)
    print("  objects mutated by the calls : %d" % mutated)
    print("  cases where >1 predicate was true (live) : %d" % excl)

    print("\nTHE DEFECT REVIEW FOUND, reproduced: a SECOND TS field over +0x28")
    alias = ts["aliased"]
    d_landed = sum(1 for a, b in zip(live, alias["writeLandedOnly"]) if a["isSlotted"] != b["isSlotted"])
    d_alias = sum(1 for a, b in zip(live, alias["writeAliasOnly"]) if a["isBuiltin"] != b["isBuiltin"])
    d_both = sum(1 for a, b in zip(live, alias["writeBoth"])
                 if a["isSlotted"] != b["isSlotted"] or a["isBuiltin"] != b["isBuiltin"])
    print("  caller writes the LANDED field only : isSlotted diverges on %d/%d" % (d_landed, n))
    print("  caller writes the ALIAS field only  : isBuiltin diverges on %d/%d" % (d_alias, n))
    print("  caller writes BOTH, same value      : diverges on %d/%d  (the only driving that passes)"
          % (d_both, n))

    print("\nNEGATIVE CONTROLS for isSlotted (same %d cases)" % n)
    for name, wrong in ts["controls"].items():
        k = sum(1 for a, w in zip(live, wrong) if a["isSlotted"] != w)
        print("  %-42s %d wrong" % (name, k))
        if k == 0:
            print("      WARNING: this control kills nothing — the harness is blind to that")
            print("               decision, it does not mean the mutant is equivalent.")

    ok = all(agree[k] == n for k in SYMS) and excl == 0 and mutated == 0
    print("\nRESULT: %s" % ("all three predicates match the live symbols on every case"
                            if ok else "DIVERGENCES PRESENT"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
