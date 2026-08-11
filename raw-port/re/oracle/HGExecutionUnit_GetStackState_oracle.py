#!/usr/bin/env python3
"""Differential oracle for HGExecutionUnit::GetStackState() @Helium 0x1444c0
(__ZN15HGExecutionUnit13GetStackStateEv, `nm` class T).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGExecutionUnit_GetStackState_oracle.py

THE THING THIS ORACLE EXISTS TO PIN is the ABI shape. The method returns a 0x24-byte struct, which
is larger than the 16 bytes SysV returns in registers, so the caller passes a hidden out-pointer in
%rdi and the RECEIVER arrives in %rsi. A transcription that reads %rdi as `this` decodes every field
from the wrong object and still produces plausible-looking code. So the harness:

  * passes a POISONED out-buffer and a POISONED receiver, and byte-diffs BOTH afterwards — the
    receiver must be untouched, and only the first 0x24 bytes of the out-buffer may change;
  * checks the returned %rax equals the out-pointer that was passed in (the sret contract);
  * fills the state and the two stack objects with distinct values per case, so a field copied from
    the wrong offset cannot coincide with the right one.

Prologue bytes at slide+vmaddr are verified before any number is reported. The TS side is the REAL
port, executed through node.
"""
import ctypes, json, os, random, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "Helium"
VMADDR = 0x1444C0
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x48, 0x89, 0xF8))   # ... movq %rdi,%rax
ARENA = 0x100
OUT_SIZE = 0x24
POISON = 0xCD


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report"
                         % (addr, got.hex(), PROLOGUE.hex()))
    fn = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p)(addr)

    rng = random.Random(0x1444C0)
    cases = []
    for i in range(24):
        cases.append({
            "aAt10": rng.getrandbits(64),
            "bAt10": rng.getrandbits(64),
            "index": rng.choice([0, 1, 2, -1, 0x7FFFFFFF, -0x80000000, rng.randint(-1 << 31, (1 << 31) - 1)]),
        })

    live, stray, sret_ok = [], 0, True
    for c in cases:
        state = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        sa = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        sbuf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        recv = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        out = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        st, A, B, R, O = (ctypes.addressof(x) for x in (state, sa, sbuf, recv, out))
        ctypes.c_uint64.from_address(R + 0x90).value = st
        ctypes.c_uint64.from_address(st + 0x88).value = A
        ctypes.c_uint64.from_address(st + 0x90).value = B
        ctypes.c_int32.from_address(st + 0x98).value = c["index"]
        ctypes.c_uint64.from_address(A + 0x10).value = c["aAt10"]
        ctypes.c_uint64.from_address(B + 0x10).value = c["bAt10"]
        before_r = ctypes.string_at(R, ARENA)
        before_o = ctypes.string_at(O, ARENA)
        ret = fn(O, R)
        if (ret or 0) != O:
            sret_ok = False
        after_r = ctypes.string_at(R, ARENA)
        after_o = ctypes.string_at(O, ARENA)
        stray += sum(1 for i in range(ARENA) if before_r[i] != after_r[i])
        stray += sum(1 for i in range(OUT_SIZE, ARENA) if before_o[i] != after_o[i])
        live.append({
            "stackA": ctypes.c_uint64.from_address(O + 0x00).value == A,
            "stackB": ctypes.c_uint64.from_address(O + 0x08).value == B,
            "aAt10": "%016x" % ctypes.c_uint64.from_address(O + 0x10).value,
            "bAt10": "%016x" % ctypes.c_uint64.from_address(O + 0x18).value,
            "index": ctypes.c_int32.from_address(O + 0x20).value,
        })

    wire = [{"aAt10": "%016x" % c["aAt10"], "bAt10": "%016x" % c["bAt10"], "index": c["index"]}
            for c in cases]
    driver = os.path.join(HERE, "HGExecutionUnit_GetStackState_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(wire), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    def score(rows):
        return sum(1 for i, r in enumerate(rows) if r != live[i])

    diverged = score(reply["port"])
    print("HGExecutionUnit::GetStackState  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("cases=%d  divergences=%d" % (len(cases), diverged))
    print("  sret contract (returned %%rax == the out-pointer passed in): %s" % sret_ok)
    print("  stray bytes written (the whole RECEIVER, and the out-buffer past 0x24): %d" % stray)
    print("  -> the receiver being untouched is what proves `this` is read from %rsi and the")
    print("     result written through %rdi, not the other way round")
    print()
    print("NEGATIVE CONTROLS (wrong TS models, same node process):")
    for m in reply["mutants"]:
        killed = score(m["rows"])
        note = "" if killed else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-52s killed %d/%d%s" % (m["name"], killed, len(cases), note))
    print()
    ok = diverged == 0 and stray == 0 and sret_ok
    print("VERDICT: %s" % ("VERIFIED — 0 divergences, 0 stray writes, sret honoured"
                           if ok else "DIVERGED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
