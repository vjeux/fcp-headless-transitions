#!/usr/bin/env python3
"""Differential oracle for HgcToneParamCurve1AntiSymmetric::GetParameter(int, float*)
@Helium 0x34da60.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/HgcToneParamCurve1AntiSymmetric_GetParameter_oracle.py

LOCAL symbol (`nm` type `t`), so dlsym cannot reach it: called at dyld slide + its
x86_64 vmaddr via raw-port/re/oracle/ozone_loader.py (address from the cached
inventory, hard refusal to run outside an x86_64 process — the port cites x86_64
offsets and the arm64 body would be different code).

No constructor is needed: the body reads exactly one field (`movq 0x198(%rdi),%rax`)
and then four floats at `[rax + (index << 5) + 0/4/8/0xc]`, so a synthetic object with
a pool pointer planted at +0x198 is a complete stand-in.

Checked against the live function:
  1. the RETURN CODE for every index in -8..15 (the guard is `cmpl $3,%esi ; ja`, an
     UNSIGNED compare, so every negative index must fail too);
  2. the four floats written to the out buffer, BIT-EXACTLY (compared as raw u32, so
     a NaN payload or a signed zero cannot be smeared by float equality);
  3. that the out buffer is untouched past 16 bytes, and that the object and the pool
     are not modified (it is a pure read + a 16-byte copy);
  4. the 32-byte STRIDE: the pool is filled with a distinct value per cell, so a port
     using a 16-byte stride reads a different record.
"""
import ctypes, os, random, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN31HgcToneParamCurve1AntiSymmetric12GetParameterEiPf"
VA = 0x34DA60
OBJ = 0x200
POOL_OFF = 0x198
RECORDS = 6          # more than the 4 the guard admits, so an over-read is visible
STRIDE_F32 = 8       # 32 bytes = 8 float32 cells
OUT_GUARD = 0xCC


def make_pool(seed):
    rnd = random.Random(seed)
    cells = []
    for rec in range(RECORDS):
        for k in range(STRIDE_F32):
            # a distinct, recognisable value per cell: record and cell index encoded
            cells.append(struct.unpack('<f', struct.pack('<I', 0x3F000000 + rec * 0x10000 + k * 0x100 + rnd.getrandbits(6)))[0])
    return (ctypes.c_float * len(cells))(*cells)


def port(pool_u32, index):
    """The TS port: unsigned guard, 32-byte stride, four float copies."""
    if (index & 0xFFFFFFFF) > 3:
        return -1, None
    base = index * STRIDE_F32
    return 0, [pool_u32[base + 0], pool_u32[base + 1], pool_u32[base + 2], pool_u32[base + 3]]


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Helium", SYM, ctypes.c_int,
                                 [ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    n = rc_bad = val_bad = mutated = 0
    fails = []
    for trial in range(40):
        pool = make_pool(trial)
        pool_u32 = list(struct.unpack(f"<{len(pool)}I", bytes(pool)))
        obj = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(b'\x7E' * OBJ))
        ctypes.memmove(ctypes.byref(obj, POOL_OFF),
                       ctypes.byref(ctypes.c_void_p(ctypes.cast(pool, ctypes.c_void_p).value)), 8)
        obj_before, pool_before = bytes(obj), bytes(pool)

        for index in range(-8, 16):
            out = (ctypes.c_ubyte * 32).from_buffer(bytearray(bytes([OUT_GUARD]) * 32))
            rc = fn(ctypes.cast(ctypes.byref(obj), ctypes.c_void_p), index,
                    ctypes.cast(ctypes.byref(out), ctypes.c_void_p))
            exp_rc, exp_vals = port(pool_u32, index)
            n += 1
            if rc != exp_rc:
                rc_bad += 1
                if len(fails) < 8:
                    fails.append((index, f"rc {rc} != {exp_rc}"))
            got = list(struct.unpack('<4I', bytes(out)[:16]))
            if exp_vals is None:
                # the out buffer must be COMPLETELY untouched on the reject path
                if bytes(out) != bytes([OUT_GUARD]) * 32:
                    val_bad += 1
                    if len(fails) < 8:
                        fails.append((index, "out written on the reject path"))
            else:
                if got != exp_vals:
                    val_bad += 1
                    if len(fails) < 8:
                        fails.append((index, f"{[hex(x) for x in got]} != {[hex(x) for x in exp_vals]}"))
                if bytes(out)[16:] != bytes([OUT_GUARD]) * 16:
                    val_bad += 1
                    if len(fails) < 8:
                        fails.append((index, "wrote past 16 bytes"))
        if bytes(obj) != obj_before or bytes(pool) != pool_before:
            mutated += 1

    print(f"CASES={n} RETURN_CODE_DIVERGED={rc_bad} VALUE_DIVERGED={val_bad} "
          f"OBJECT_OR_POOL_MUTATED={mutated}/40")
    for f in fails:
        print("  FAIL index=%d %s" % f)

    # ---- negative controls, measured on the same corpus ----
    # Collect the live answers once, then score each plausible mis-read against them.
    live = []
    for trial in range(40):
        pool = make_pool(trial)
        pool_u32 = list(struct.unpack(f"<{len(pool)}I", bytes(pool)))
        obj = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(b'\x7E' * OBJ))
        ctypes.memmove(ctypes.byref(obj, POOL_OFF),
                       ctypes.byref(ctypes.c_void_p(ctypes.cast(pool, ctypes.c_void_p).value)), 8)
        for index in range(-8, 16):
            out = (ctypes.c_ubyte * 32).from_buffer(bytearray(bytes([OUT_GUARD]) * 32))
            rc = fn(ctypes.cast(ctypes.byref(obj), ctypes.c_void_p), index,
                    ctypes.cast(ctypes.byref(out), ctypes.c_void_p))
            live.append((pool_u32, index, rc, bytes(out)))

    UNTOUCHED = bytes([OUT_GUARD]) * 32

    def score(name, model):
        wrong = sum(1 for pool_u32, index, rc, out in live if model(pool_u32, index) != (rc, out))
        print(f"  NEGATIVE CONTROL {name}: {wrong}/{len(live)} wrong")

    def truth(pool_u32, index, stride=STRIDE_F32, count=4, signed_guard=False):
        rejected = (index > 3) if signed_guard else ((index & 0xFFFFFFFF) > 3)
        if rejected:
            return (-1, UNTOUCHED)
        base = index * stride
        if base < 0 or base + count > len(pool_u32):
            # A wrong model that accepts this index would read outside the pool —
            # in the machine that is a wild read; here it simply cannot match.
            return ("OUT-OF-POOL-READ", index)
        buf = bytearray(UNTOUCHED)
        for k in range(count):
            buf[k * 4:(k + 1) * 4] = struct.pack('<I', pool_u32[base + k])
        return (0, bytes(buf))

    score("SIGNED index guard (index <= 3) instead of the unsigned `ja`",
          lambda p_, i: truth(p_, i, signed_guard=True))
    score("16-byte stride instead of 32 (shlq $4, not $5)",
          lambda p_, i: truth(p_, i, stride=4))
    score("copies only 2 floats instead of 4",
          lambda p_, i: truth(p_, i, count=2))
    score("returns 0 on the reject path instead of -1",
          lambda p_, i: (0, UNTOUCHED) if (i & 0xFFFFFFFF) > 3 else truth(p_, i))

    ok = rc_bad == 0 and val_bad == 0 and mutated == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
