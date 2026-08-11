#!/usr/bin/env python3
"""FFOZNullCurve::getKeypointNormal(void*, double*) @Flexo 0x12875a0 — differential against
the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/FFOZNullCurve_getKeypointNormal_oracle.py

WHY BOTHER ORACLING A SEVEN-LINE NULL BODY. Because the interesting claim is a NEGATIVE one,
and a negative claim is exactly what reading a listing establishes least well. The port says
the `double* out` at %rdx is never written — no `movsd %xmm0, (%rdx)`, no store of any kind —
and that leaving it untouched IS the transcription, because writing `*out = 0.0` would add a
store the machine does not perform. That is checkable in one call: hand the routine a poisoned
out-pointer and see whether the poison survives.

WHY ROSETTA: every @0xADDR in the port is an x86_64 vmaddr and `disasm.sh` thins to that slice,
while the box is arm64 — OPS_LOG's "the executable oracle calls the wrong architecture, and
fails toward ACCEPT".

THE SYMBOL IS LOCAL (`t`), so dlsym cannot reach it: it is called at slide + 0x12875a0 with the
seven bytes there checked against the encoding of the whole body,
`55 48 89 e5 31 c0 5d` = pushq %rbp ; movq %rsp,%rbp ; xorl %eax,%eax ; popq %rbp — the last
byte before `retq`. There is no room for anything else between them, which is itself part of
what is being shown.

NEGATIVE CONTROLS: the two mutated expectations that a "it returns 0" test would miss — that
the routine writes 0.0 through the out-pointer, and that it writes anything at all to the
receiver.
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Flexo"
VMADDR = 0x12875A0
PROLOGUE = bytes.fromhex("554889e531c05d")   # pushq rbp; movq rsp,rbp; xorl eax,eax; popq rbp

RECV = 0x80          # a poisoned receiver, larger than anything this class could touch
OUT_POISON = struct.pack("<d", -12345.6789)
HANDLE_POISON = 0xAA


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"body bytes   : {here.hex()}  expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — the bytes at the address are not the transcribed body.")
        return 1
    print("self-check   : OK — the whole body is those seven bytes plus `retq`\n")

    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(addr)

    ok = True
    kills = {"m1_writes_zero_through_out": 0, "m2_touches_the_receiver": 0}
    print(f"{'case':<34} {'ret':>5}  out-parameter          receiver")
    for i, out_val in enumerate([-12345.6789, 0.0, float("nan"), 1e308, -0.0]):
        recv = ctypes.create_string_buffer(bytes([(0xC0 + (k * 31) % 0x3F) for k in range(RECV)]), RECV)
        handle = ctypes.create_string_buffer(bytes([HANDLE_POISON]) * 32, 32)
        out = ctypes.create_string_buffer(struct.pack("<d", out_val), 8)
        recv_before = bytes(recv.raw)
        out_before = bytes(out.raw)
        ret = fn(ctypes.cast(recv, ctypes.c_void_p),
                 ctypes.cast(handle, ctypes.c_void_p),
                 ctypes.cast(out, ctypes.c_void_p))
        out_after = bytes(out.raw)
        recv_after = bytes(recv.raw)
        out_kept = out_after == out_before
        recv_kept = recv_after == recv_before
        ok &= (ret == 0) and out_kept and recv_kept
        print(f"out={out_val!r:<30} {ret:>5}  "
              f"{'untouched' if out_kept else 'WRITTEN — the port is wrong':<22} "
              f"{'untouched' if recv_kept else 'WRITTEN'}")
        if out_after != struct.pack("<d", 0.0):
            kills["m1_writes_zero_through_out"] += 1
        if recv_after != b"\x00" * RECV:
            kills["m2_touches_the_receiver"] += 1

    print("\n-- NEGATIVE CONTROLS (mutated expectations, same measurement) --")
    labels = {"m1_writes_zero_through_out": "M1 the routine writes 0.0 through the out-pointer",
              "m2_touches_the_receiver": "M2 the routine writes to the receiver"}
    for m, n in kills.items():
        print(f"   {labels[m]}: killed {n}/5")
        if n == 0:
            print("   !! killed 0 — say which: a BLIND harness, or an EQUIVALENT mutant.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — returns 0, and neither the out-parameter nor the receiver "
                 "is touched: the poison written before the call is byte-identical after it"
                 if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
