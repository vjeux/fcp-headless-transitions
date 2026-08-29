#!/usr/bin/env python3
"""Differential oracle for OZChannelFolder_Factory::getIconIDInternal().

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/OZChannelFolder_Factory_getIconIDInternal_oracle.py

The local Ozone symbol at 0x558d70 returns -1 without reading `this`. A libc
getpid call through the same return ABI proves the instrument can distinguish
another value, while a prologue check binds the result to the intended body.
"""
import ctypes
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as L  # noqa: E402

FW = "Ozone"
SYM = "__ZN23OZChannelFolder_Factory17getIconIDInternalEv"
VMADDR = 0x558D70
PROLOGUE = bytes.fromhex("55 48 89 e5 b8 ff ff ff ff")
CALLS = 64


def main():
    L.require_x86_64()
    fn, vmaddr, slide = L.local_fn(FW, SYM, ctypes.c_int32, [ctypes.c_void_p])
    if vmaddr != VMADDR:
        raise SystemExit(f"symbol moved: inventory={vmaddr:#x}, expected={VMADDR:#x}")
    got = ctypes.string_at(slide + vmaddr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit(
            f"PROLOGUE MISMATCH at {slide + vmaddr:#x}: {got.hex()} != {PROLOGUE.hex()}"
        )

    proto = ctypes.CFUNCTYPE(ctypes.c_int32)
    libc = ctypes.CDLL(None)
    control = proto(ctypes.cast(libc.getpid, ctypes.c_void_p).value)
    fake_this = ctypes.addressof(ctypes.create_string_buffer(b"\xCD" * 16))
    live = []
    control_values = []
    for _ in range(CALLS):
        control_values.append(control())
        live.append(int(fn(fake_this)))

    driver = os.path.join(HERE, "OZChannelFolder_Factory_getIconIDInternal_driver.mts")
    proc = subprocess.run(
        ["node", "--experimental-strip-types", driver],
        input=json.dumps({"calls": CALLS}),
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        raise SystemExit("TS driver failed:\n" + proc.stdout + proc.stderr)
    reply = json.loads(proc.stdout)
    diverged = sum(a != b for a, b in zip(live, reply["port"]))
    sensitive = all(value != -1 for value in control_values)

    print(
        f"OZChannelFolder_Factory::getIconIDInternal @Ozone {VMADDR:#x} "
        f"slide={slide:#x}"
    )
    print(f"prologue={got.hex()} OK")
    print(f"calls={CALLS} live={sorted(set(live))} port={sorted(set(reply['port']))} divergences={diverged}")
    print(f"SENSITIVITY getpid through same return ABI: {sorted(set(control_values))}")
    controls_ok = True
    for mutant in reply["mutants"]:
        killed = sum(a != b for a, b in zip(live, mutant["values"]))
        controls_ok &= killed > 0
        print(f"NEGATIVE CONTROL {mutant['name']}: killed {killed}/{CALLS}")

    ok = diverged == 0 and sensitive and controls_ok
    print("ORACLE: " + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
