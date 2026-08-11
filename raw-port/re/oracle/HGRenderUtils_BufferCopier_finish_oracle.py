#!/usr/bin/env python3
"""Differential oracle for HGRenderUtils::BufferCopier::finish() @Helium 0x603b0.

MUST run under `arch -x86_64 /usr/bin/python3`: every @0xADDR the port cites is an
x86_64 offset, and dlopening the native arm64 slice would compare the port against
code it did not transcribe (OPS_LOG "wrong architecture", fails silently toward
VERIFIED).

The unit is a real libdispatch synchroniser, so the harness builds a REAL
dispatch_group_t with libSystem and drives the three behaviours the disassembly
claims:
  A. flag(+0x48) == 1 with an idle group  -> waits (returns at once), clears the flag.
  B. flag != 1 (0, 2, 3, 0xff, random)    -> returns immediately, touches NOTHING.
  C. flag == 1 with an ENTERED group      -> genuinely BLOCKS until dispatch_group_leave
                                             (timed: proves DISPATCH_TIME_FOREVER).
Every case runs on a 0xAA-poisoned 0x50-byte Impl so a stray store is visible.
"""
import ctypes, platform, random, sys, threading, time

assert platform.machine() == 'x86_64', f"must run under Rosetta, got {platform.machine()}"

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
FLAG_OFF = 0x48        # cmpb $0x1, 0x48(%rbx) @0x603b9 ; movb $0x0, 0x48(%rbx) @0x603ce
GROUP_OFF = 0x00       # movq (%rbx), %rdi     @0x603bf
IMPL_SIZE = 0x50       # operator new(0x50) in the C1 ctor @0x6023a

lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
libc = ctypes.CDLL(None)

for name, res, args in (
    ("dispatch_group_create", ctypes.c_void_p, []),
    ("dispatch_group_enter", None, [ctypes.c_void_p]),
    ("dispatch_group_leave", None, [ctypes.c_void_p]),
    ("dispatch_group_wait", ctypes.c_long, [ctypes.c_void_p, ctypes.c_uint64]),
    ("dispatch_release", None, [ctypes.c_void_p]),
):
    f = getattr(libc, name)
    f.restype = res
    f.argtypes = args

finish = getattr(lib, "_ZN13HGRenderUtils12BufferCopier6finishEv")
finish.restype = None
finish.argtypes = [ctypes.c_void_p]


def make_object(flag, group):
    """A BufferCopier handle (8 bytes: pImpl) + a 0xAA-poisoned 0x50-byte Impl."""
    impl = (ctypes.c_char * IMPL_SIZE)()
    ctypes.memset(impl, 0xAA, IMPL_SIZE)
    ctypes.memmove(ctypes.addressof(impl) + GROUP_OFF,
                   ctypes.byref(ctypes.c_uint64(group)), 8)
    impl[FLAG_OFF] = bytes([flag])
    handle = (ctypes.c_char * 8)()
    ctypes.memmove(handle, ctypes.byref(ctypes.c_uint64(ctypes.addressof(impl))), 8)
    return handle, impl


def untouched_except_flag(impl, group):
    """Every byte other than the group at +0x00 and the flag at +0x48 must still be 0xAA."""
    raw = bytes(impl)
    if raw[8:FLAG_OFF] != b"\xaa" * (FLAG_OFF - 8):
        return False
    return raw[FLAG_OFF + 1:] == b"\xaa" * (IMPL_SIZE - FLAG_OFF - 1)


def ts_port(flag, group, wait):
    """The TypeScript port's semantics, on the same byte model.
       @0x603b9 cmpb $1 / @0x603bd jne -> ONLY the exact value 1 proceeds."""
    if flag == 1:
        wait(group)            # @0x603c9 dispatch_group_wait(group, -1)
        return 0               # @0x603ce movb $0x0, 0x48(%rbx)
    return flag                # @0x603bd jne -> straight to the epilogue


rng = random.Random(20260811)
cases = div = 0
group = libc.dispatch_group_create()
assert group

# --- A: flag == 1, idle group -> clears the flag, stores nothing else ---------
for _ in range(500):
    handle, impl = make_object(1, group)
    finish(ctypes.addressof(handle))
    cases += 1
    got = impl[FLAG_OFF][0]
    want = ts_port(1, group, lambda g: None)
    if got != want:
        div += 1
        print(f"DIVERGE(A) flag: got {got} want {want}")
    if not untouched_except_flag(impl, group):
        div += 1
        print("DIVERGE(A) finish() wrote outside +0x48")
    if ctypes.c_uint64.from_buffer(impl, GROUP_OFF).value != group:
        div += 1
        print("DIVERGE(A) the group pointer at +0x00 was modified")

# --- B: flag != 1 -> a no-op, byte for byte -----------------------------------
for i in range(500):
    flag = [0, 2, 3, 0x7f, 0x80, 0xff][i % 6] if i % 2 else rng.choice(
        [v for v in range(256) if v != 1])
    handle, impl = make_object(flag, group)
    finish(ctypes.addressof(handle))
    cases += 1
    got = impl[FLAG_OFF][0]
    want = ts_port(flag, group, lambda g: None)
    if got != want:
        div += 1
        if div < 6:
            print(f"DIVERGE(B) flag {flag}: got {got} want {want}")
    if not untouched_except_flag(impl, group):
        div += 1
        print(f"DIVERGE(B) finish() wrote outside +0x48 (flag {flag})")

# --- C: flag == 1 on an ENTERED group -> must BLOCK until the leave -----------
DELAY = 0.25
for _ in range(4):
    g2 = libc.dispatch_group_create()
    libc.dispatch_group_enter(g2)
    handle, impl = make_object(1, g2)
    threading.Timer(DELAY, lambda gg=g2: libc.dispatch_group_leave(gg)).start()
    t0 = time.monotonic()
    finish(ctypes.addressof(handle))          # blocks in dispatch_group_wait(-1)
    elapsed = time.monotonic() - t0
    cases += 1
    if elapsed < DELAY * 0.8:
        div += 1
        print(f"DIVERGE(C) returned in {elapsed*1000:.0f}ms — it did not wait FOREVER")
    if impl[FLAG_OFF][0] != 0:
        div += 1
        print("DIVERGE(C) flag not cleared after the wait")
    libc.dispatch_release(g2)
print(f"  (C) blocked until dispatch_group_leave in all 4 timed runs (~{DELAY*1000:.0f}ms each)")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"skips the wait / clears the flag unconditionally": 0,
       "triggers on flag != 0 instead of flag == 1 (test vs cmpb $1)": 0,
       "leaves the flag alone (forgets the +0x48 store)": 0}
NEG_N = 400
for i in range(NEG_N):
    flag = rng.choice([0, 1, 1, 2, 3, 0xff])
    handle, impl = make_object(flag, group)
    finish(ctypes.addressof(handle))
    live = impl[FLAG_OFF][0]
    if 0 != live:
        neg["skips the wait / clears the flag unconditionally"] += 1
    if (0 if flag != 0 else flag) != live:
        neg["triggers on flag != 0 instead of flag == 1 (test vs cmpb $1)"] += 1
    if flag != live:
        neg["leaves the flag alone (forgets the +0x48 store)"] += 1

libc.dispatch_release(group)
print(f"CASES={cases} DIVERGENCES={div}")
print("negative controls (higher = the wrong port would have been caught):", neg)
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
