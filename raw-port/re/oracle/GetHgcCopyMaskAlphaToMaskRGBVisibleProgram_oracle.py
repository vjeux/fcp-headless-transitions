#!/usr/bin/env python3
"""Differential oracle for GetHgcCopyMaskAlphaToMaskRGBVisibleProgram() @Ozone 0x6ab530.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/GetHgcCopyMaskAlphaToMaskRGBVisibleProgram_oracle.py

LOCAL symbol (`__ZL…`, internal linkage, `nm` type `t`), so dlsym cannot reach it: it is called at
dyld slide + 0x6ab530 through ozone_loader.py, which preloads Ozone's @rpath chain and refuses to
run outside an x86_64 process.

FOUR CLAIMS, because for a constant getter "the string looks right" is the weakest of them:

  1. ADDRESS — the returned pointer minus the slide is exactly 0x7fa87a, the address this port's
     `leaq` displacement computes FROM THE NEXT INSTRUCTION. Using the leaq's own address instead
     lands 7 bytes early on a different string, and that is the one arithmetic mistake a function
     this small offers; checking the pointer is what rules it out.
  2. BYTES — the 317 bytes there are compared to what the PORT returns, byte for byte, as raw
     bytes rather than decoded text. The TS side is obtained by EXECUTING the module
     (`node --experimental-strip-types`), not by re-parsing its source for a string literal: a
     source-scraping comparison cannot see an escape the runtime resolves differently.
  3. SELF-CONSISTENCY — the string's own embedded `//LEN=000000013d` header says 0x13d = 317, which
     must equal the length actually read. The literal carries its own length check; this uses it.
  4. INVARIANCE — the same pointer and the same bytes on every call.

Plus a negative control: one byte of the expectation is flipped and the comparison must reject it.
Without that, a comparison of a constant against a constant proves nothing about the comparison.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Ozone"
VMADDR = 0x6AB530
LITERAL_VA = 0x7FA87A
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x48))       # pushq %rbp / movq %rsp,%rbp / leaq…
CALLS = 16
DRIVER = os.path.join(HERE, "GetHgcCopyMaskAlphaToMaskRGBVisibleProgram_driver.mts")


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report"
                         % (addr, got.hex(), PROLOGUE.hex()))

    fn = ctypes.CFUNCTYPE(ctypes.c_void_p)(addr)
    ptrs, bodies = [], []
    for _ in range(CALLS):
        p = fn()
        ptrs.append(p)
        bodies.append(ctypes.string_at(p))

    p = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)
    ts_bytes = bytes.fromhex(reply["hex"])

    live = bodies[0]
    same_ptr = all(x == ptrs[0] for x in ptrs)
    same_body = all(b == live for b in bodies)
    at_expected_va = (ptrs[0] - slide) == LITERAL_VA
    len_header = live.split(b"\n")[1] if b"\n" in live else b""
    declared = int(len_header.split(b"=")[1], 16) if len_header.startswith(b"//LEN=") else -1
    len_ok = declared == len(live)
    bytes_ok = ts_bytes == live
    # negative control: the comparison must reject a single flipped byte
    mutant = bytearray(live); mutant[len(mutant) // 2] ^= 0x20
    control_fires = bytes(mutant) != live and not (bytes(mutant) == ts_bytes)

    print("GetHgcCopyMaskAlphaToMaskRGBVisibleProgram  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("1. ADDRESS      returned pointer - slide = %#x, expected %#x -> %s"
          % (ptrs[0] - slide, LITERAL_VA, "OK" if at_expected_va else "MISMATCH"))
    print("2. BYTES        live %d bytes vs the executed TS port -> %s"
          % (len(live), "byte-for-byte identical" if bytes_ok else "DIFFER"))
    print("3. SELF-CHECK   embedded %s says %d, read %d -> %s"
          % (len_header.decode("ascii", "replace"), declared, len(live),
             "OK" if len_ok else "INCONSISTENT"))
    print("4. INVARIANCE   %d calls: same pointer %s, same bytes %s"
          % (CALLS, same_ptr, same_body))
    print()
    print("NEGATIVE CONTROL  one byte of the live string flipped -> rejected: %s" % control_fires)
    ok = all((at_expected_va, bytes_ok, len_ok, same_ptr, same_body, control_fires))
    print()
    print("VERDICT: %s" % ("VERIFIED — the port returns the exact literal this accessor returns"
                           if ok else "NOT VERIFIED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
