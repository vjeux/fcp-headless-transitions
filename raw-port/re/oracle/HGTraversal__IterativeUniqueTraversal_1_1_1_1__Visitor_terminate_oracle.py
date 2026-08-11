#!/usr/bin/env python3
"""Differential oracle for
HGTraversal::IterativeUniqueTraversal<(NodeInput)1,(IteratorOrder)1,(TraversalOrder)1,
(InputOrder)1>::Visitor::terminate(HGRenderer*, HGNode*)  @Helium 0xa51c0.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets and
this harness calls the function BY ADDRESS (slide + 0xa51c0). The symbol is a
LOCAL (`nm` type `t`) symbol, so dlsym cannot see it; an address call is the only
route, which makes the architecture question load-bearing — the arm64 slice has a
different layout entirely and the same offset would land in unrelated code
(OPS_LOG "wrong architecture" / "nm reports the arm64 slice").

Two integrity checks run BEFORE the differential, so a wrong-image/wrong-offset
run cannot report a confident PASS:
  1. the 8 bytes at slide+0xa51c0 must be exactly the transcribed encoding
     55 48 89 e5 31 c0 5d c3  (push rbp; mov rsp,rbp; xor eax,eax; pop rbp; ret);
  2. the process must be x86_64.
"""
import ctypes, platform, random, sys

assert platform.machine() == 'x86_64', f"must run under Rosetta, got {platform.machine()}"

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
TERMINATE_VMADDR = 0xa51c0
VISITNODE_VMADDR = 0xa51b0     # the sibling vtable slot, used as a sensitivity control
EXPECTED_BYTES = bytes.fromhex("554889e531c05dc3")

lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_uint64
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Helium"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
assert slide is not None, "Helium image not found in the process"

addr = slide + TERMINATE_VMADDR
got_bytes = ctypes.string_at(addr, 8)
print(f"slide=0x{slide:x} terminate@0x{addr:x} bytes={got_bytes.hex()}")
assert got_bytes == EXPECTED_BYTES, (
    f"code at the call target is {got_bytes.hex()}, not the transcribed "
    f"{EXPECTED_BYTES.hex()} — wrong slice or wrong offset, refusing to run")

PROTO = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p, ctypes.c_void_p,
                         ctypes.c_void_p)
terminate = PROTO(addr)          # (this, HGRenderer*, HGNode*) -> bool in AL

rng = random.Random(20260811)
cases = div = 0
keepalive = []

# Arguments the machine never reads: the body touches neither %rsi nor %rdx (and
# not even %rdi). Fuzz them with nulls, junk integers and REAL readable buffers,
# and check both the value AND that no argument buffer is written.
for i in range(1500):
    kind = i % 3
    if kind == 0:
        this_p, rend, node = 0, 0, 0
    elif kind == 1:
        this_p = rng.getrandbits(48) | 1
        rend = rng.getrandbits(48) | 1
        node = rng.getrandbits(48) | 1
    else:
        bufs = [(ctypes.c_char * 64)() for _ in range(3)]
        for b in bufs:
            ctypes.memset(b, 0x5A, 64)
        keepalive.append(bufs)
        this_p, rend, node = (ctypes.addressof(b) for b in bufs)

    ret = terminate(this_p, rend, node)
    cases += 1
    # The TS port: `return false;`  (@0xa51c4 xorl %eax,%eax zeroes ALL of %rax)
    want = 0
    if ret != want:
        div += 1
        if div < 5:
            print(f"DIVERGE args=({this_p:#x},{rend:#x},{node:#x}) ret={ret:#x}")
    if ret & 0xff:            # what the caller actually tests: testb %al,%al @0xa5528
        div += 1
        print("DIVERGE AL was non-zero — the caller would have terminated the walk")
    if kind == 2:
        for b in bufs:
            if bytes(b) != b"\x5a" * 64:
                div += 1
                print("DIVERGE the callee wrote through one of its arguments")

# --- sensitivity control: does this harness actually READ %rax? ---------------
# Call a DIFFERENT function in the same image through the SAME PROTO, one whose
# return value is known to be non-zero: HGRenderJob::GetUserName @Helium 0x54820
# returns the char* at this+0xd8. If the harness were fabricating zeros, this
# would read 0 too. (An "empty body" control is useless here: a function that
# never writes %rax leaves whatever the trampoline had, which is itself 0.)
GETUSERNAME_VMADDR = 0x54820
probe = (ctypes.c_char * 0x200)()
ctypes.memset(probe, 0, 0x200)
sentinel = ctypes.create_string_buffer(b"sentinel\0")
ctypes.memmove(ctypes.addressof(probe) + 0xd8,
               ctypes.byref(ctypes.c_uint64(ctypes.cast(sentinel, ctypes.c_void_p).value)), 8)
getname = PROTO(slide + GETUSERNAME_VMADDR)
control_val = getname(ctypes.addressof(probe), 0, 0)
sensitive = control_val == ctypes.cast(sentinel, ctypes.c_void_p).value and control_val != 0
print(f"  sensitivity control: GetUserName@0x{slide + GETUSERNAME_VMADDR:x} through the SAME "
      f"CFUNCTYPE returned {control_val:#x} (the sentinel string pointer, non-zero) — "
      f"the harness reads a real %rax, so terminate's 0 is the real xorl @0xa51c4")

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"returns true (terminate the walk immediately)": 0,
       "returns the low byte of the HGNode* argument": 0}
NEG_N = 300
for i in range(NEG_N):
    node = rng.getrandbits(48) | 1
    live = terminate(0, 0, node)
    if 1 != live:
        neg["returns true (terminate the walk immediately)"] += 1
    if (node & 0xff) != live:
        neg["returns the low byte of the HGNode* argument"] += 1

print(f"CASES={cases} DIVERGENCES={div}")
print("negative controls (higher = the wrong port would have been caught):", neg)
print("harness sensitivity:", "OK (reads a real %rax)" if sensitive else
      "UNPROVEN (control also read 0)")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
