#!/usr/bin/env python3
"""Differential oracle for
HGExecutionUnit::CommitStack(float vector[4]*, unsigned long) @Helium 0x1445b0.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGExecutionUnit_CommitStack_vec4_oracle.py

The method walks three levels of pointer before it does anything, so the differential BUILDS THE
REAL STRUCTURE in ctypes memory — an execution unit, the state object at +0x90, and a stack
object reachable through the +0x88 pointer table at the index in +0x98 — and then checks the two
things the body actually decides:

  * THE IDENTITY GUARD. The commit happens only when the caller's pointer is EXACTLY the current
    top, base + count*16. The sweep runs the matching pointer, and also base + (count-1)*16,
    base + (count+1)*16, base itself, null and a foreign address, and requires the count to move
    for the first and NOT to move for any of the others.
  * THE INDEX. The stack is picked out of a TABLE at +0x88 by the u32 at +0x98, so the sweep puts
    a DIFFERENT stack object behind each index — which is what would catch a port that ignored the
    index or scaled it wrong (the table stride is 8, from `0x88(%rax,%rcx,8)`).

    ONLY INDICES 0 AND 1 ARE EXERCISED, and that is a fact about the structure rather than a
    convenience: the index field lives at +0x98, which is exactly where table entry 2 would be
    (0x88 + 2*8), so an index of 2 or more would read the index word itself as a pointer. This
    harness segfaulted on the first attempt for exactly that reason — with a 6-entry table the
    later entries overlapped the index field and the callee dereferenced garbage. The two-entry
    reading (a current/pending pair selected by a 0/1 word) is the only one consistent with the
    addressing.

  * THE 64-BIT WIDTH of the top computation, which is the ONE thing a live-versus-model harness
    cannot see: the model and the machine agree about it, and only a port can differ. `shlq $0x4`
    (REX.W, `48 c1 e7 04`) and `addq (%rax), %rdi` (`48 03 38`) both wrap mod 2^64, so at
    count = 2^60 the product count*16 is exactly 2^64 and the top comes back around to the base
    itself — the live function commits for a pointer equal to the base. The WRAP block therefore
    runs the SHIPPED TypeScript through HGExecutionUnit_CommitStack_vec4_driver.mts and compares
    the port against the live symbol case by case. It carries its own controls: three
    ordinary-count cases (so a driver that is not really reaching the port cannot pass) and a wrap
    case that must NOT commit (so a port that commits unconditionally cannot pass). Measured
    against a body whose top is computed with unbounded bigints, the block kills 5 of 9.

Everything else is a poisoned arena compared byte for byte, so a stray write anywhere in the
execution unit, the state object or the untouched stacks fails the run.
"""
import ctypes, json, os, random, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as L  # noqa: E402

TS_DRIVER = os.path.join(HERE, "HGExecutionUnit_CommitStack_vec4_driver.mts")

VA = 0x1445B0
PROLOGUE = bytes.fromhex("554889e5488b8790000000")   # push rbp; mov rbp,rsp; mov 0x90(%rdi),%rax
EU, ST, STACK = 0x100, 0x200, 0x40                   # arena sizes
POISON = 0xEE
NSTACK = 2   # see the note below: index 2 would alias the index field itself
M64 = (1 << 64) - 1   # every quantity this body computes lives in a 64-bit register


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    slide, _ = L.image_slide("Helium")
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    print(f"prologue: {got.hex()}  expected: {PROLOGUE.hex()}")
    if got != PROLOGUE:
        print("PROLOGUE MISMATCH — refusing to report a result")
        return 1
    fn = ctypes.cast(slide + VA, ctypes.CFUNCTYPE(
        None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint64))

    rng = random.Random(5)
    bad = mut = 0
    total = 0
    for trial in range(60):
        idx = rng.randrange(NSTACK)
        count = rng.choice([0, 1, 2, 7, 1000, 1 << 20])
        n = rng.choice([0, 1, 2, 5, 1 << 16])
        # arenas
        eu = ctypes.create_string_buffer(bytes([POISON]) * EU, EU)
        st = ctypes.create_string_buffer(bytes([POISON]) * ST, ST)
        stacks = [ctypes.create_string_buffer(bytes([POISON]) * STACK, STACK) for _ in range(NSTACK)]
        taps = ctypes.create_string_buffer(1 << 12)
        base = ctypes.cast(taps, ctypes.c_void_p).value
        for k, s in enumerate(stacks):
            struct.pack_into("<Q", s, 0x00, base + k * 16)      # each stack has its own base
            struct.pack_into("<Q", s, 0x10, count + k)          # ...and its own count
        for k, s in enumerate(stacks):
            struct.pack_into("<Q", st, 0x88 + k * 8, ctypes.cast(s, ctypes.c_void_p).value)
        struct.pack_into("<I", st, 0x98, idx)
        struct.pack_into("<Q", eu, 0x90, ctypes.cast(st, ctypes.c_void_p).value)

        chosen = stacks[idx]
        cbase = struct.unpack_from("<Q", bytes(chosen.raw), 0x00)[0]
        ccount = struct.unpack_from("<Q", bytes(chosen.raw), 0x10)[0]
        top = (cbase + ((ccount << 4) & M64)) & M64   # shlq/addq both wrap — see WRAP below
        for label, ptr, should_commit in (
            ("top", top, True),
            ("top-16", top - 16, False),
            ("top+16", top + 16, False),
            ("base", cbase, ccount == 0),
            ("null", 0, False),
            ("foreign", base + 0x800, False),
        ):
            before = [bytes(x.raw) for x in stacks] + [bytes(eu.raw), bytes(st.raw)]
            for k, s in enumerate(stacks):                       # reset counts each sub-case
                struct.pack_into("<Q", s, 0x10, count + k)
            fn(ctypes.cast(eu, ctypes.c_void_p), ctypes.c_void_p(ptr), n)
            after = struct.unpack_from("<Q", bytes(chosen.raw), 0x10)[0]
            want = ((ccount + n) & M64) if should_commit else ccount
            total += 1
            if after != want:
                bad += 1
                if bad <= 5:
                    print(f"  MISMATCH idx={idx} count={ccount} n={n} ptr={label}: "
                          f"count is {after}, expected {want}")
            # nothing but the chosen stack's +0x10 may change
            if bytes(eu.raw) != before[NSTACK] or bytes(st.raw) != before[NSTACK + 1]:
                mut += 1
            for k, s in enumerate(stacks):
                raw = bytes(s.raw)
                if k != idx and raw != before[k]:
                    mut += 1
                if k == idx and (raw[:0x10] != before[k][:0x10] or raw[0x18:] != before[k][0x18:]):
                    mut += 1
    sweep_total, sweep_bad = total, bad

    # ---- WRAP: the counts the randomized sweep can never reach, measured against the PORT -------
    # (label, index, count, n, which pointer the caller passes, must the count advance?)
    wrap_cases = [
        # CONTROLS: ordinary counts on both table entries. If the driver is not really reaching the
        # port, or the port does nothing at all, these fail — so the hard cases below cannot be
        # passed by an instrument that measures nothing.
        ("control idx0 top",            0, 3,            5, "top",    True),
        ("control idx1 top",            1, 7,            2, "top",    True),
        ("control idx1 top+16",         1, 7,            2, "top+16", False),
        # count*16 == 2^64 exactly -> shlq leaves 0 -> the top IS the base
        ("count=2^60, ptr=base",        0, 1 << 60,      1, "top",    True),
        # ...and one 16 past it must still be refused, so a port that commits unconditionally at
        # the wrap cannot pass either.
        ("count=2^60, ptr=base+16",     0, 1 << 60,      1, "top+16", False),
        ("count=2^63, ptr=base",        1, 1 << 63,      3, "top",    True),
        ("count=2^60+1, ptr=base+16",   0, (1 << 60) + 1, 7, "top",   True),
        ("count=2^60-1, ptr=base-16",   1, (1 << 60) - 1, 1, "top",   True),
        # count + n wraps at the store: 2^64-1 + 3 -> 2
        ("count=2^64-1, store wraps",   0, M64,          3, "top",    True),
    ]
    wrap_bad = wrap_mut = 0
    fed = []
    for label, idx, count, n, kind, should_commit in wrap_cases:
        eu = ctypes.create_string_buffer(bytes([POISON]) * EU, EU)
        st = ctypes.create_string_buffer(bytes([POISON]) * ST, ST)
        stacks = [ctypes.create_string_buffer(bytes([POISON]) * STACK, STACK) for _ in range(NSTACK)]
        taps = ctypes.create_string_buffer(1 << 12)
        base = ctypes.cast(taps, ctypes.c_void_p).value
        other = (base + 0x800) & M64          # the unchosen entry carries different values
        for k, sbuf in enumerate(stacks):
            struct.pack_into("<Q", sbuf, 0x00, base if k == idx else other)
            struct.pack_into("<Q", sbuf, 0x10, count if k == idx else other)
            struct.pack_into("<Q", st, 0x88 + k * 8, ctypes.cast(sbuf, ctypes.c_void_p).value)
        struct.pack_into("<I", st, 0x98, idx)
        struct.pack_into("<Q", eu, 0x90, ctypes.cast(st, ctypes.c_void_p).value)

        top = (base + ((count << 4) & M64)) & M64
        ptr = top if kind == "top" else (top + 16) & M64
        before = [bytes(x.raw) for x in stacks] + [bytes(eu.raw), bytes(st.raw)]
        fn(ctypes.cast(eu, ctypes.c_void_p), ctypes.c_void_p(ptr), n)
        after = struct.unpack_from("<Q", bytes(stacks[idx].raw), 0x10)[0]
        want = ((count + n) & M64) if should_commit else count
        total += 1
        if after != want:
            wrap_bad += 1
            print(f"  WRAP MODEL MISMATCH {label}: live count is {after:#x}, model wanted {want:#x}")
        if bytes(eu.raw) != before[NSTACK] or bytes(st.raw) != before[NSTACK + 1]:
            wrap_mut += 1
            print(f"  WRAP STRAY WRITE (eu/state) {label}")
        for k, sbuf in enumerate(stacks):
            raw = bytes(sbuf.raw)
            if k != idx and raw != before[k]:
                wrap_mut += 1
                print(f"  WRAP STRAY WRITE (untouched stack) {label}")
            if k == idx and (raw[:0x10] != before[k][:0x10] or raw[0x18:] != before[k][0x18:]):
                wrap_mut += 1
                print(f"  WRAP STRAY WRITE (chosen stack outside +0x10) {label}")
        fed.append({"label": label, "index": idx, "base": f"{base:016x}", "other": f"{other:016x}",
                    "count": f"{count:016x}", "n": f"{n:016x}", "ptr": f"{ptr:016x}",
                    "live": f"{after:016x}"})

    # the SHIPPED port, over the same inputs
    proc = subprocess.run(["node", "--experimental-strip-types", TS_DRIVER],
                          input=json.dumps(fed), capture_output=True, text=True)
    if proc.returncode != 0:
        print("TS driver failed:\n" + proc.stdout + proc.stderr)
        return 3
    ts = {r["label"]: r for r in json.loads(proc.stdout)}
    ts_bad = 0
    for c in fed:
        got = ts.get(c["label"])
        if got is None or got["threw"] or got["count"] != c["live"]:
            ts_bad += 1
            shown = "threw" if (got and got["threw"]) else f"0x{got['count']}" if got else "MISSING"
            print(f"  WRAP TS DIVERGENCE {c['label']}: live 0x{c['live']}  port {shown}")

    bad += wrap_bad; mut += wrap_mut
    # Per-class counts, so a class that collapsed to nothing is visible instead of hiding inside a
    # healthy-looking total.
    print(f"  randomized sweep (live vs model): {sweep_total - sweep_bad}/{sweep_total} agree")
    print(f"  64-bit wrap      (live vs model): {len(fed) - wrap_bad}/{len(fed)} agree")
    print(f"  64-bit wrap      (live vs PORT):  {len(fed) - ts_bad}/{len(fed)} agree")
    print(f"{total - bad}/{total} agree with the live symbol; {mut} stray writes")
    print("HGExecutionUnit::CommitStack(float4*, unsigned long) oracle: "
          + ("VERIFIED" if not (bad or mut or ts_bad) else "DIVERGED"))
    return 2 if (bad or mut or ts_bad) else 0


if __name__ == "__main__":
    sys.exit(main())
