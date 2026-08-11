DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
#!/usr/bin/env python3
"""HGPool::registerPool @Helium 0x8c850 / unregisterPool @0x8c9d0 — live differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGPool_registry_oracle.py

WHAT IS MEASURED. Both symbols are exported (`nm` class T), and neither
dereferences its `BasePool*` argument — registerPool only STORES it (@0x8c8bf /
@0x8c94b) and unregisterPool only COMPARES it (@0x8ca10). So the live functions
can be driven with opaque, never-dereferenced pointer values, and the whole
observable is the registry's `std::vector<BasePool*>` at +0x00..+0x18:

    +0x00 __begin_   +0x08 __end_   +0x10 __end_cap_

which this harness reads out of the live process after every call. That gives
the three things the port had to get right, from the machine itself:
  * the CAPACITY GROWTH POLICY inlined @0x8c8ce..@0x8c98c — the doubling, the
    max(2*cap, size+1) `cmovbe` @0x8c90c, and the fast path @0x8c8bd;
  * the ORDER of the stored elements, i.e. that a push appends;
  * the erase semantics of unregisterPool — first match only, capacity
    unchanged, absent pool a no-op.

WHY THE call_once IS DELIBERATELY BYPASSED. The initializer @0x8d860 starts a
DETACHED thread running `poolsObserverThreadFunction` @0x8d8e0, and that
function's first cycle walks the registry and issues `callq *0x58(%rax)` — a
VIRTUAL call on every registered pool (@0x8d97c-@0x8d983). With opaque test
pointers that faults, on a thread this process does not control. So the harness
does what the machine does on every call after the first: it presets the
once_flag @0xadcf40 to ~0UL and installs a registry of its own at @0xadcf48, so
`cmpq $-0x1` @0x8c86b takes the `je` @0x8c86f and no thread is ever created.
The registry it installs is byte-for-byte what the initializer builds: 0x58
bytes, the three vector pointers zero, and a default-initialised
`pthread_mutex_t` whose signature word is 0x32aaaba7 — the same constant the
initializer stores @0x8d87e. The initializer path itself is therefore verified
by reading, not by execution, and this file says so rather than implying the
oracle covered it.

ADDRESSES come from the cached x86_64 inventory and from the instruction bytes
themselves (0x8c86b + disp32 0xa506d5 = 0xadcf40 for the once_flag; the
`_registry` load @0x8c898 resolves the same way to 0xadcf48) — never from a bare
`nm`, which reports the arm64 slice even under Rosetta (OPS_LOG).
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as OZ

ONCE_FLAG_VA = 0xADCF40
REGISTRY_VA = 0xADCF48
PTHREAD_MUTEX_SIG_INIT = 0x32AAABA7
REG_BYTES = 0x58            # 0x18 vector + 0x40 pthread_mutex_t (@0x8d866)

libc = ctypes.CDLL(None)
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]


def main():
    reg_fn, reg_va, slide = OZ.local_fn(
        "Helium", "__ZN6HGPool12registerPoolEPNS_8BasePoolE", None, [ctypes.c_void_p])
    unreg_fn, unreg_va, _ = OZ.local_fn(
        "Helium", "__ZN6HGPool14unregisterPoolEPNS_8BasePoolE", None, [ctypes.c_void_p])

    # Self-check both entry points against the prologue bytes the transcription
    # was taken from, before any number is reported.
    want = bytes([0x55, 0x48, 0x89, 0xE5, 0x41, 0x57])   # pushq %rbp; movq %rsp,%rbp; pushq %r15
    for name, va in (("registerPool", reg_va), ("unregisterPool", unreg_va)):
        got = ctypes.string_at(slide + va, len(want))
        print("  %-16s @0x%x  prologue %s %s" % (name, va, got.hex(),
                                                 "OK" if got == want else "MISMATCH"))
        if got != want:
            raise SystemExit("PROLOGUE MISMATCH — refusing to report a number")

    # Install a registry exactly as the initializer @0x8d860 builds one, and mark
    # the once_flag done so the call_once (and its thread) never runs.
    reg = libc.malloc(REG_BYTES)
    ctypes.memset(reg, 0, REG_BYTES)
    ctypes.c_uint64.from_address(reg + 0x18).value = PTHREAD_MUTEX_SIG_INIT
    ctypes.c_uint64.from_address(slide + ONCE_FLAG_VA).value = 0xFFFFFFFFFFFFFFFF
    ctypes.c_uint64.from_address(slide + REGISTRY_VA).value = reg
    print("  registry installed at 0x%x, once_flag @0x%x = ~0UL (no observer thread)\n"
          % (reg, ONCE_FLAG_VA))

    def state():
        begin = ctypes.c_uint64.from_address(reg + 0x00).value
        end = ctypes.c_uint64.from_address(reg + 0x08).value
        cap = ctypes.c_uint64.from_address(reg + 0x10).value
        size = (end - begin) // 8 if begin else 0
        capacity = (cap - begin) // 8 if begin else 0
        elems = [ctypes.c_uint64.from_address(begin + 8 * i).value for i in range(size)]
        return {"size": size, "capacity": capacity, "elems": elems}

    # Opaque, never-dereferenced pool handles. Distinct malloc'd addresses so
    # pointer identity behaves the way the machine's `cmpq` does.
    pools = [libc.malloc(16) for _ in range(6)]
    live = []

    # 6 distinct pools, then pool #2 a SECOND time: the machine allows a
    # duplicate registration, and unregisterPool removes only the FIRST match
    # (@0x8ca13), so the duplicate is what makes that decision measurable.
    for i, p in enumerate(pools + [pools[2]]):
        reg_fn(ctypes.c_void_p(p))
        st = state()
        live.append({"op": "register", "i": i, **st})
        print("  register #%d%s -> size=%d capacity=%d"
              % (i + 1, " (DUPLICATE of #3)" if i == len(pools) else "",
                 st["size"], st["capacity"]))

    for label, victim in (("erase-dup", pools[2]), ("erase-middle", pools[1]),
                          ("erase-last", pools[-1]), ("erase-absent", libc.malloc(16)),
                          ("erase-first", pools[0])):
        unreg_fn(ctypes.c_void_p(victim))
        st = state()
        live.append({"op": label, **st})
        print("  %-13s -> size=%d capacity=%d order=%s"
              % (label, st["size"], st["capacity"],
                 [pools.index(e) if e in pools else "?" for e in st["elems"]]))

    # ------------------------------------------------------------------ TS side
    driver = os.path.join(HERE, "HGPool_registry_driver.mts")
    proc = subprocess.run(["node", "--experimental-strip-types", driver],
                          capture_output=True, text=True, cwd=HERE, timeout=DRIVER_TIMEOUT)
    if proc.returncode != 0:
        raise SystemExit("TS driver failed:\n" + proc.stderr[-2000:])
    ts = json.loads(proc.stdout)

    print("\nSHIPPED PORT vs LIVE")
    diverged = 0
    for a, b in zip(live, ts):
        # Compare the SHAPE — size, capacity and the order of the surviving
        # elements as INDICES into the pool list, since the two sides cannot
        # share addresses.
        live_order = [pools.index(e) if e in pools else -1 for e in a["elems"]]
        ok = (a["size"] == b["size"] and a["capacity"] == b["capacity"]
              and live_order == b["order"])
        diverged += (not ok)
        print("  %-13s live size=%d cap=%d order=%-18s TS size=%d cap=%d order=%-18s %s"
              % (a.get("op"), a["size"], a["capacity"], live_order,
                 b["size"], b["capacity"], b["order"], "OK" if ok else "DIVERGED"))

    # ------------------------------------------------------- negative controls
    print("\nNEGATIVE CONTROLS (each is the port with ONE decision changed)")
    ctl = ts[-1]["controls"]
    for name, kills in ctl.items():
        print("  %-34s disagrees with the live sequence on %d step(s)" % (name, kills))
    dead = [k for k, v in ctl.items() if v == 0]

    print("\nRESULT")
    print("  steps agreeing with the live registry : %d/%d" % (len(live) - diverged, len(live)))
    print("  divergences                           : %d" % diverged)
    print("  call_once initializer @0x8d860        : NOT executed (see the header) —"
          " verified by reading")
    if dead:
        print("  WARNING: %s killed nothing. A dead control means the harness is blind to"
              " that decision, not that the mutant is equivalent." % ", ".join(dead))
    # Restore the BSS cells so a later harness in this process starts clean.
    ctypes.c_uint64.from_address(slide + REGISTRY_VA).value = 0
    ctypes.c_uint64.from_address(slide + ONCE_FLAG_VA).value = 0
    return 0 if (diverged == 0 and not dead) else 1


if __name__ == "__main__":
    sys.exit(main())
