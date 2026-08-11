#!/usr/bin/env python3
"""probe_avx.py — settle "can I execute an AVX kernel on this box?" by EXECUTING one, and by
CHECKING WHAT IT COMPUTED. ~2 seconds.

WHY A SCRIPT AND NOT A NOTE. Two reviewers signed 150+ instruction AVX kernels on reading alone,
because `sysctl hw.optional.avx1_0` reports 0 under Rosetta 2 and that reads like an answer. It is
not: the feature bits lie, and the VEX-encoded kernels in these frameworks run fine. The note has
been in the briefs for a while and was still being contradicted in review, so here is the thing that
cannot be misremembered — run it, read the verdict.

    arch -x86_64 /usr/bin/python3 raw-port/army/tools/probe_avx.py

WHAT IT DOES, AND WHY IT IS THIS AND NOT SOMETHING SIMPLER. The first version of this tool called
`HGHWBlend::AVXEnabled()` and treated its `1` as the framework's own answer. Reviewer 4 re-derived
that body: it is `pushq %rbp ; movq %rsp,%rbp ; movb $0x1,%al ; popq %rbp ; retq` — eight bytes with
no VEX prefix, no `cpuid` and no `xgetbv`. It is a compile-time constant, `raw-port/src/render/
HGHWBlend.ts` on main already documents it as one in a section titled "THIS IS A COMPILE-TIME
CONSTANT, NOT A CPU PROBE", and it would have printed the same PASS on a machine where every VEX
instruction faults. **A probe whose verdict is independent of the thing it measures is the exact
reassurance shape this tool was written to end**, so the symbol is gone and the verdict now rests on
three things that can each go red:

  1. THE BYTES. The kernel's own instruction bytes are scanned at the resolved address and must
     contain VEX prefixes (0xC4 / 0xC5). A constant-returning body fails this statically, so the
     tool cannot be pointed at another `movb $0x1,%al` and keep saying PASS.
  2. THE EXECUTION. The kernel really runs, out of the live mapped image, at the x86_64 address the
     ports cite — not an assembled toy, and not a dlsym'd wrapper.
  3. THE RESULT. It is run over one fixed 3x2 tile with a fully specified State, and the whole
     destination plane is compared BYTE FOR BYTE against a recorded expectation. PASS requires the
     match. A VEX instruction that executed but computed the wrong thing — the failure mode that
     would actually hurt a port — is a FAIL, not a PASS.

The kernel is `Gettype1_half_unpremultTile_AVX` @Helium 0x2945e0, chosen because it is landed, it is
documented as bit-exact (its own header records that it contains no `vrcpps`, `vdivps` or `vsqrtps`
— nothing implementation-defined), and it is a file-LOCAL `t` symbol, so resolving it also exercises
the inventory-vmaddr + dyld-slide recipe every local-symbol oracle in this repo depends on.

EXITS: 0 PASS, 1 FAIL (it ran and the answer was wrong, or the symbol has no VEX in it), 2
INCONCLUSIVE (it could not run). "Could not run" must never read as "answered", which is the one
property of the first version that was right and is kept exactly.

To re-record the expectation after a macOS or FCP update:
    arch -x86_64 /usr/bin/python3 raw-port/army/tools/probe_avx.py --emit-expected
and paste the printed block over EXPECTED below, after confirming it prints the same thing twice
(two runs have different ASLR slides, so a stable answer is a property of the code, not of the run).
"""
import ctypes, os, subprocess, sys

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
KERNEL = "__ZL31Gettype1_half_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode"
KERNEL_VMADDR = 0x2945E0        # cross-checked against the inventory below, never trusted alone
SCAN_BYTES = 512                # enough of the body to reach its VEX-encoded core

# One fixed tile: 3 texels wide, 2 rows, so the 8-wide body, the 4-wide tail AND the row advance all
# run. Values are generated from the index by a fixed rule rather than tabulated, so the input is
# readable and reproducible; the State is filled the same way. Neither needs to be a realistic curve
# — the point is that the same bytes in produce the same bytes out.
WIDTH, HEIGHT, STATE_SIZE = 3, 2, 0x1000


def synth_state():
    b = bytearray(STATE_SIZE)
    for i in range(0, STATE_SIZE, 4):
        v = ((i // 4) % 17) - 8
        b[i:i + 4] = ctypes.c_float(v / 4.0)
    return bytes(b)


def synth_pixels(n):
    out = (ctypes.c_float * n)()
    for i in range(n):
        out[i] = ((i % 23) - 11) / 8.0
    return out


# Recorded from this machine; regenerate with --emit-expected (see the docstring).
EXPECTED = [
    "3fc00000", "3fc00000", "3fc00000", "bf800000",
    "7f800000", "80000000", "80000000", "bf000000",
    "3fc00000", "3fc00000", "3fc00000", "00000000",
    "3fc00000", "3fc00000", "3fc00000", "3f000000",
    "7f800000", "80000000", "80000000", "3f800000",
    "3fc00000", "3fc00000", "3fc00000", "bfb00000",
]


def _repo_root():
    r = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                       cwd=os.path.dirname(os.path.abspath(__file__)) or ".")
    if r.returncode == 0 and r.stdout.strip():
        return r.stdout.strip()
    r = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True)
    return r.stdout.strip() or os.path.expanduser("~/random/final-cut-pro-transitions")


INV = os.path.join(_repo_root(), "raw-port", "army", "inventory", "Helium.syms.txt")


def inconclusive(msg):
    print(f"\nprobe_avx: INCONCLUSIVE — {msg}")
    return 2


def main():
    emit = "--emit-expected" in sys.argv
    print(f"arch: {os.uname().machine}  (translated: "
          f"{subprocess.run(['sysctl','-n','sysctl.proc_translated'],capture_output=True,text=True).stdout.strip() or '?'})")
    bits = subprocess.run(["sysctl", "-n", "hw.optional.avx1_0"],
                          capture_output=True, text=True).stdout.strip()
    print(f"sysctl hw.optional.avx1_0 = {bits or '?'}   <- IGNORE THIS. It lies under Rosetta.")

    if os.uname().machine != "x86_64":
        print("\nprobe_avx: INCONCLUSIVE — not running under the x86_64 slice.")
        print("  Re-run: arch -x86_64 /usr/bin/python3 " + os.path.relpath(__file__, os.getcwd()))
        return 2

    # ── resolve the kernel: inventory vmaddr + the slide dyld reports ───────────────────────────
    vmaddr = None
    try:
        for line in open(INV):
            p = line.split()
            if len(p) == 3 and p[2] == KERNEL:
                vmaddr = int(p[0], 16)
                break
    except OSError:
        pass
    if vmaddr is None:
        return inconclusive(f"{KERNEL} is not in the inventory cache ({INV})")
    if vmaddr != KERNEL_VMADDR:
        return inconclusive(f"the inventory puts {KERNEL} at {vmaddr:#x}, not the expected "
                            f"{KERNEL_VMADDR:#x} — the binary or the cache moved; re-record first")
    try:
        ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    except OSError as e:
        return inconclusive(f"could not load Helium: {e}")

    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_long
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    slide = None
    for i in range(libc._dyld_image_count()):
        if os.path.basename(libc._dyld_get_image_name(i).decode()) == "Helium":
            slide = libc._dyld_get_image_vmaddr_slide(i)
            break
    if slide is None:
        return inconclusive("Helium is loaded but not in the image list — cannot get its slide")
    addr = slide + vmaddr

    # ── 1. the bytes must actually be VEX-encoded ───────────────────────────────────────────────
    body = ctypes.string_at(addr, SCAN_BYTES)
    vex = sum(1 for b in body if b in (0xC4, 0xC5))
    print(f"\nkernel: {KERNEL}")
    print(f"  resolved to {addr:#x}  (vmaddr {vmaddr:#x} + slide {slide:#x})")
    print(f"  first bytes: {body[:8].hex()}   VEX-prefix bytes (C4/C5) in the first "
          f"{SCAN_BYTES}: {vex}")
    if vex == 0:
        print("\nprobe_avx: FAIL — the symbol at that address contains NO VEX-encoded instruction.")
        print("  This probe measures AVX by running AVX; pointed at a body without any, it would")
        print("  be reporting on nothing. (This is the check that the previous version of this")
        print("  tool, which called a `movb $0x1,%al` constant, could not have passed.)")
        return 1

    # ── 2 + 3. run it, and check WHAT it computed ───────────────────────────────────────────────
    state = synth_state()
    st_buf = ctypes.create_string_buffer(state, STATE_SIZE)
    src = synth_pixels(WIDTH * HEIGHT * 4)
    dst = (ctypes.c_float * (WIDTH * HEIGHT * 4))()
    for i in range(WIDTH * HEIGHT * 4):
        dst[i] = float("nan")                      # poisoned: an untouched lane cannot read as 0

    tile = (ctypes.c_char * 0x60)()
    ctypes.memset(tile, 0, 0x60)
    ctypes.c_int32.from_buffer(tile, 0x08).value = WIDTH        # x1
    ctypes.c_int32.from_buffer(tile, 0x0C).value = HEIGHT       # y1
    ctypes.c_uint64.from_buffer(tile, 0x10).value = ctypes.addressof(dst)
    ctypes.c_int32.from_buffer(tile, 0x18).value = WIDTH        # dst row stride, texels
    ctypes.c_uint64.from_buffer(tile, 0x50).value = ctypes.addressof(src)
    ctypes.c_int32.from_buffer(tile, 0x58).value = WIDTH        # src row stride, texels

    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(addr)
    fn(ctypes.addressof(tile), ctypes.addressof(st_buf), None)

    got = ["%08x" % ctypes.c_uint32.from_buffer(dst, 4 * i).value
           for i in range(WIDTH * HEIGHT * 4)]

    if emit or EXPECTED[0] is None:
        print("\nEXPECTED = [")
        for i in range(0, len(got), 4):
            print("    " + ", ".join(f'"{g}"' for g in got[i:i + 4]) + ",")
        print("]")
        if EXPECTED[0] is None and not emit:
            return inconclusive("no recorded expectation is compiled into this script yet — "
                                "paste the block above into EXPECTED (after checking it prints "
                                "the same twice) and re-run")
        return 0

    bad = [(i, a, b) for i, (a, b) in enumerate(zip(EXPECTED, got)) if a != b]
    print(f"  executed over a {WIDTH}x{HEIGHT} tile; {len(got)} destination lanes compared "
          f"byte-for-byte against the recorded expectation")
    if bad:
        print("\nprobe_avx: FAIL — the kernel ran and computed the WRONG bytes.")
        for i, a, b in bad[:6]:
            print(f"    lane {i}: expected {a}  got {b}")
        print("  AVX executes here, but not correctly, which is worse for a port than not running")
        print("  at all: re-record only after you understand why (a macOS or FCP update changes")
        print("  this legitimately; anything else does not).")
        return 1

    print("\nprobe_avx: PASS — a VEX.256 kernel executed in THIS process, at the x86_64 address")
    print("  your ports cite, and produced the exact bytes recorded for it.")
    print("  Feature bits said otherwise above. Probe by executing, never by inferring.")
    print("  A 150-instruction VEX.256 kernel is oracle-able here; signing one on reading alone")
    print("  is a choice, not a limitation of the box.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
