#!/usr/bin/env python3
"""Differential oracle for OZImageMask::isSegmentationOperationInverted().

Run under Rosetta because the port cites the x86_64 Ozone body:

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/OZImageMask_isSegmentationOperationInverted_oracle.py

The body at @Ozone 0x325580 is a single `movzbl 0xf79(%rdi), %eax`.
The corpus deliberately includes non-canonical bool bytes to distinguish the
instruction's raw zero-extension from a plausible `!= 0` normalization.
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
SYM = "__ZN11OZImageMask31isSegmentationOperationInvertedEv"
VMADDR = 0x325580
FIELD = 0xF79
OBJ_SIZE = 0x1000
POISON = 0x5A
PROLOGUE = bytes.fromhex("55 48 89 e5 0f b6 87 79 0f 00 00")
VALUES = [0, 1, 2, 3, 0x7F, 0x80, 0xFE, 0xFF]


def main():
    L.require_x86_64()
    fn, vmaddr, slide = L.local_fn(
        FW, SYM, ctypes.c_uint32, [ctypes.c_void_p]
    )
    if vmaddr != VMADDR:
        raise SystemExit(f"symbol moved: inventory={vmaddr:#x}, expected={VMADDR:#x}")
    got = ctypes.string_at(slide + vmaddr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit(
            f"PROLOGUE MISMATCH at {slide + vmaddr:#x}: {got.hex()} != {PROLOGUE.hex()}"
        )

    live = []
    writes = 0
    for value in VALUES:
        obj = (ctypes.c_ubyte * OBJ_SIZE)(*([POISON] * OBJ_SIZE))
        obj[FIELD] = value
        before = bytes(obj)
        live.append(int(fn(ctypes.cast(obj, ctypes.c_void_p))))
        writes += bytes(obj) != before

    driver = os.path.join(
        HERE, "OZImageMask_isSegmentationOperationInverted_driver.mts"
    )
    proc = subprocess.run(
        ["node", "--experimental-strip-types", driver],
        input=json.dumps({"values": VALUES}),
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        raise SystemExit("TS driver failed:\n" + proc.stdout + proc.stderr)
    reply = json.loads(proc.stdout)
    diverged = sum(a != b for a, b in zip(live, reply["port"]))

    print(
        f"OZImageMask::isSegmentationOperationInverted @Ozone {VMADDR:#x} "
        f"slide={slide:#x}"
    )
    print(f"prologue={got.hex()} OK")
    print(f"cases={len(VALUES)} live={live} port={reply['port']} divergences={diverged}")
    print(f"collateral writes={writes}")
    controls_ok = True
    for mutant in reply["mutants"]:
        killed = sum(a != b for a, b in zip(live, mutant["values"]))
        controls_ok &= killed > 0
        print(f"NEGATIVE CONTROL {mutant['name']}: killed {killed}/{len(VALUES)}")

    ok = diverged == 0 and writes == 0 and controls_ok
    print("ORACLE: " + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
