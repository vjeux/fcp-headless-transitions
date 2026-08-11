#!/usr/bin/env python3
"""Differential oracle for GetHgcMaskCompAddVisibleProgram() @Ozone 0x6d5550.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/GetHgcMaskCompAddVisibleProgram_oracle.py

The symbol is `__ZL...` — translation-unit-local, so `nm` reports it `t` and dlsym cannot find it.
It is reached at dyld slide + 0x6d5550 through ozone_loader.py, which preloads Ozone's @rpath chain
and refuses to run unless the process is x86_64 (every address in the port is an x86_64 offset, and
an address-based differential on the arm64 slice fails SILENTLY TOWARD VERIFIED).

Four checks, all against the live image, and one negative control that is not a restatement:

  1. ADDRESS — the returned pointer minus the slide is exactly 0x7ff42b, the address the port's
     `leaq` arithmetic computes. This is what catches the one arithmetic mistake available in a
     5-instruction function: measuring the RIP-relative displacement from the leaq's own address
     instead of from the NEXT instruction lands 7 bytes early, on a different string.
  2. BYTES — the 763 bytes there are compared to what the EXECUTED port returns (through
     `node --experimental-strip-types`, importing the shipped .ts), byte for byte, as raw bytes
     rather than as decoded text.
  3. SELF-CONSISTENCY — the string's own embedded `//LEN=00000002fb` header says 0x2fb = 763,
     which must equal the byte count actually read.
  4. INVARIANCE — 16 calls return the same pointer and the same bytes, so the answer is a property
     of the binary rather than of this run.

NEGATIVE CONTROL, and it differs deliberately from the landed sibling's. That one flips a byte of
the LIVE string and re-compares it against the same expectation, which is the "implied control"
this project has now recorded four variants of: it restates the measurement three lines above and
prints "correctly differs" no matter what the port does. This one MUTATES THE PORT — writes a copy
of the shipped .ts with one byte of the constant changed, and with the `//LEN=` header rewritten to
match so the mutant is not caught by check 3 instead of check 2 — points the driver at it, and
requires the differential to DIVERGE. If it does not, the comparison is blind and the run is not
evidence, so the verdict is NOT VERIFIED.
"""
import ctypes, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Ozone"
VMADDR = 0x6D5550
LITERAL_VA = 0x7FF42B
# pushq %rbp / movq %rsp,%rbp / leaq 0x129ed0(%rip),%rax — the whole prologue, displacement included,
# so a rebuilt framework that moved the literal cannot pass this check silently.
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x48, 0x8D, 0x05, 0xD0, 0x9E, 0x12, 0x00))
CALLS = 16
PORT = os.path.join(HERE, "..", "..", "src", "render", "GetHgcMaskCompAddVisibleProgram.ts")
DRIVER = os.path.join(HERE, "GetHgcMaskCompAddVisibleProgram_driver.mts")


def run_driver(module_path=None):
    env = dict(os.environ)
    if module_path:
        env["GETHGCMASKCOMPADD_TS"] = module_path
    p = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       capture_output=True, text=True, env=env)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return bytes.fromhex(json.loads(p.stdout)["hex"])


def make_mutant(tmpdir):
    """The shipped port with ONE byte of the shader text changed, and the //LEN= header kept
    consistent so the mutant is rejected by the BYTE comparison rather than by the length check."""
    src = open(os.path.abspath(PORT)).read()
    old = '"    return output;\\n" +'
    if src.count(old) != 1:
        raise SystemExit("mutant anchor %r occurs %d times — a mutant that patches the wrong text "
                         "scores like a real one and proves nothing" % (old, src.count(old)))
    path = os.path.join(tmpdir, "Mutant.ts")
    open(path, "w").write(src.replace(old, '"    return outpuT;\\n" +'))
    return path


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report a number computed "
                         "at an address that does not hold this function"
                         % (addr, got.hex(), PROLOGUE.hex()))

    fn = ctypes.CFUNCTYPE(ctypes.c_void_p)(addr)
    ptrs, bodies = [], []
    for _ in range(CALLS):
        p = fn()
        ptrs.append(p)
        bodies.append(ctypes.string_at(p))

    live = bodies[0]
    ts_bytes = run_driver()
    same_ptr = all(x == ptrs[0] for x in ptrs)
    same_body = all(b == live for b in bodies)
    at_expected_va = (ptrs[0] - slide) == LITERAL_VA
    at_va_bytes = ctypes.string_at(slide + LITERAL_VA) == live
    len_header = live.split(b"\n")[1] if b"\n" in live else b""
    declared = int(len_header.split(b"=")[1], 16) if len_header.startswith(b"//LEN=") else -1
    len_ok = declared == len(live)
    bytes_ok = ts_bytes == live

    with tempfile.TemporaryDirectory() as td:
        mutant_bytes = run_driver(make_mutant(td))
    control_fires = mutant_bytes != live and len(mutant_bytes) == len(live)

    print("GetHgcMaskCompAddVisibleProgram  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("1. ADDRESS      returned pointer - slide = %#x, expected %#x -> %s   (bytes at that VA "
          "identical to the returned string: %s)"
          % (ptrs[0] - slide, LITERAL_VA, "OK" if at_expected_va else "MISMATCH", at_va_bytes))
    print("2. BYTES        live %d bytes vs the EXECUTED TS port -> %s"
          % (len(live), "byte-for-byte identical" if bytes_ok else "DIFFER"))
    print("3. SELF-CHECK   embedded %s says %d, read %d -> %s"
          % (len_header.decode("ascii", "replace"), declared, len(live),
             "OK" if len_ok else "INCONSISTENT"))
    print("4. INVARIANCE   %d calls: same pointer %s, same bytes %s" % (CALLS, same_ptr, same_body))
    print()
    print("NEGATIVE CONTROL  the PORT mutated by one byte (same length) -> differential DIVERGES: %s"
          % control_fires)
    ok = all((at_expected_va, at_va_bytes, bytes_ok, len_ok, same_ptr, same_body, control_fires))
    print()
    print("VERDICT: %s" % ("VERIFIED — the port returns the exact literal this accessor returns"
                           if ok else "NOT VERIFIED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
