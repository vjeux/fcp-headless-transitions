#!/usr/bin/env python3
"""Differential oracle for HGRenderUtils::BufferCopier::finish() @Helium 0x603b0.

MUST run under `arch -x86_64 /usr/bin/python3`: every @0xADDR the port cites is an
x86_64 offset, and dlopening the native arm64 slice would compare the port against
code it did not transcribe (OPS_LOG "wrong architecture", fails silently toward
VERIFIED).

WHAT CHANGED IN THIS VERSION, AND WHY IT MATTERS. The first version of this
harness compared the live symbol against a PYTHON restatement of the port
(`ts_port`, invoked with `wait=lambda g: None`). That model no-op'd the wait
while the shipped TypeScript threw in it, so 1,004 cases and three negative
controls all attested to something that was not the code under review, and the
one real divergence — `finish()` raising instead of clearing the flag on the
`flag == 1` path, i.e. the whole function — was invisible. **The TS side is now
the REAL port, executed**: every case is run through
`node --experimental-strip-types HGRenderUtils_BufferCopier_finish_driver.mts`,
which imports `raw-port/src/render/HGRenderUtils_BufferCopier.ts` and calls
`finish()` on it. A restatement of a port cannot review that port.

The unit is a real libdispatch synchroniser, so the live side builds a REAL
dispatch_group_t with libSystem and drives the three behaviours the
disassembly claims:
  A. flag(+0x48) == 1 with an idle group  -> waits (returns at once), clears the flag.
  B. flag != 1 (0, 2, 3, 0xff, random)    -> returns immediately, touches NOTHING.
  C. flag == 1 with an ENTERED group      -> genuinely BLOCKS until dispatch_group_leave
                                             (timed: proves DISPATCH_TIME_FOREVER).
Every case runs on a 0xAA-poisoned 0x50-byte Impl so a stray store is visible.

Case C is the measurement behind the port's no-op boundary: the wait's result is
never read by the machine (@0x603c9 is followed directly by the @0x603ce store),
and on an idle group the real call returns immediately — which is the state a
single-threaded JS realm is always in. C proves the timeout really is
DISPATCH_TIME_FOREVER rather than a poll, so the boundary is being modelled
where it is genuinely unobservable, not where it was inconvenient.
"""
import ctypes, json, os, platform, random, subprocess, sys, threading, time

assert platform.machine() == 'x86_64', f"must run under Rosetta, got {platform.machine()}"

HERE = os.path.dirname(os.path.abspath(__file__))
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

# pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax ; movq (%rdi),%rbx
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x53, 0x50, 0x48, 0x8B, 0x1F))
_got = ctypes.string_at(ctypes.cast(finish, ctypes.c_void_p).value, len(PROLOGUE))
assert _got == PROLOGUE, ("PROLOGUE MISMATCH: %s != %s — refusing to run"
                          % (_got.hex(), PROLOGUE.hex()))


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


def untouched_except_flag(impl):
    """Every byte other than the group at +0x00 and the flag at +0x48 must still be 0xAA."""
    raw = bytes(impl)
    if raw[8:FLAG_OFF] != b"\xaa" * (FLAG_OFF - 8):
        return False
    return raw[FLAG_OFF + 1:] == b"\xaa" * (IMPL_SIZE - FLAG_OFF - 1)


def run_ts(flags):
    """Execute the SHIPPED TypeScript on every case, in one node process."""
    driver = os.path.join(HERE, "HGRenderUtils_BufferCopier_finish_driver.mts")
    out = subprocess.run(["node", "--experimental-strip-types", driver],
                         input=json.dumps(flags), capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit("TS driver failed:\n%s\n%s" % (out.stdout, out.stderr))
    return json.loads(out.stdout)


rng = random.Random(20260811)
group = libc.dispatch_group_create()
assert group

# ---- build the corpus -------------------------------------------------------
flags = [1] * 500
for i in range(500):
    flags.append([0, 2, 3, 0x7f, 0x80, 0xff][i % 6] if i % 2 else
                 rng.choice([v for v in range(256) if v != 1]))

# ---- live side --------------------------------------------------------------
live = []
stray = 0
group_moved = 0
for flag in flags:
    handle, impl = make_object(flag, group)
    finish(ctypes.addressof(handle))
    live.append(impl[FLAG_OFF][0])
    if not untouched_except_flag(impl):
        stray += 1
    if ctypes.c_uint64.from_buffer(impl, GROUP_OFF).value != group:
        group_moved += 1

# ---- TS side: the real port, executed ---------------------------------------
ts = run_ts(flags)

div = 0
for i, flag in enumerate(flags):
    t = ts["port"][i]
    if t["threw"] or t["flag"] != live[i] or not t["groupIntact"]:
        div += 1
        if div <= 5:
            print("DIVERGE flag_in=%d: live -> %d ; TS -> %s"
                  % (flag, live[i], "THREW" if t["threw"] else t["flag"]))
if stray:
    div += stray
    print("DIVERGE: the live call wrote outside +0x48 in %d case(s)" % stray)
if group_moved:
    div += group_moved
    print("DIVERGE: the group pointer at +0x00 was modified in %d case(s)" % group_moved)

# --- C: flag == 1 on an ENTERED group -> must BLOCK until the leave -----------
DELAY = 0.25
timed_ok = 0
for _ in range(4):
    g2 = libc.dispatch_group_create()
    libc.dispatch_group_enter(g2)
    handle, impl = make_object(1, g2)
    threading.Timer(DELAY, lambda gg=g2: libc.dispatch_group_leave(gg)).start()
    t0 = time.monotonic()
    finish(ctypes.addressof(handle))          # blocks in dispatch_group_wait(-1)
    elapsed = time.monotonic() - t0
    if elapsed < DELAY * 0.8:
        div += 1
        print(f"DIVERGE(C) returned in {elapsed*1000:.0f}ms — it did not wait FOREVER")
    elif impl[FLAG_OFF][0] != 0:
        div += 1
        print("DIVERGE(C) flag not cleared after the wait")
    else:
        timed_ok += 1
    libc.dispatch_release(g2)

# --- negative controls: WRONG TS models, run in the same node process --------
neg = []
for m in ts["mutants"]:
    killed = sum(1 for i in range(len(flags))
                 if m["results"][i]["threw"] or m["results"][i]["flag"] != live[i])
    neg.append((m["name"], killed))

libc.dispatch_release(group)

print("HGRenderUtils::BufferCopier::finish  @Helium 0x603b0")
print("prologue self-check: %s OK" % PROLOGUE.hex())
print("TS side: the SHIPPED port, executed via node --experimental-strip-types")
print()
print("CASES=%d  DIVERGENCES=%d   (500 x flag==1, 500 x flag!=1)" % (len(flags), div))
print("  stray stores outside +0x48: %d ; group pointer perturbed: %d" % (stray, group_moved))
print("  (C) blocked until dispatch_group_leave in %d/4 timed runs (~%dms each),"
      % (timed_ok, DELAY * 1000))
print("      then cleared the flag — the timeout is DISPATCH_TIME_FOREVER, and an")
print("      IDLE group returns at once, which is what the no-op boundary models.")
print()
print("NEGATIVE CONTROLS (wrong TS models, same node process, scored against live):")
for name, killed in neg:
    note = "" if killed else "   <-- EQUIVALENT or BLIND, not a control that fired"
    print("  %-46s killed %d/%d%s" % (name, killed, len(flags), note))
print()
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
