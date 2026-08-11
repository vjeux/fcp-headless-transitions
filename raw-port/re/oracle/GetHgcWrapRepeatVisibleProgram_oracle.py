#!/usr/bin/env python3
"""Differential oracle for GetHgcWrapRepeatVisibleProgram() @Ozone 0x6c6720.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/GetHgcWrapRepeatVisibleProgram_oracle.py

LOCAL symbol (`__ZL...`, internal linkage, `nm` type `t`), so dlsym cannot reach
it: called at dyld slide + 0x6c6720 through ozone_loader.py, which preloads
Ozone's @rpath chain and refuses to run outside an x86_64 process.

Two claims are checked, and the first is the one that matters: not merely "the
string looks right" but that the function returns THE LITERAL THIS PORT
IDENTIFIED — pointer minus slide == 0x7fe183, the address the `leaq` displacement
computes from the NEXT instruction. Then the 1,729 bytes there are compared to the
TypeScript constant BYTE-FOR-BYTE (raw bytes, not decoded text).
"""
import ctypes, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZL30GetHgcWrapRepeatVisibleProgramv"
VA = 0x6C6720
LITERAL_VA = 0x7FE183
TS = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                  "..", "..", "src", "render", "GetHgcWrapRepeatVisibleProgram.ts")


def ts_constant():
    """Reassemble the string literal out of the TS source, so the comparison is
    against what the port actually ships rather than against a copy of it."""
    src = open(TS, encoding="utf-8").read()
    start = src.index("export const kHgcWrapRepeat_MetalVisible_Program: string =")
    body = src[src.index("\n", start):src.index(";\n", start)]
    parts = re.findall(r'"((?:[^"\\]|\\.)*)"', body)
    out = []
    for p in parts:
        out.append(p.encode().decode("unicode_escape"))
    return "".join(out)


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Ozone", SYM, ctypes.c_void_p, [])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    ptrs = [fn() for _ in range(8)]
    wrong_addr = sum(1 for p in ptrs if p - slide != LITERAL_VA)
    invariant = len(set(ptrs)) == 1

    live = ctypes.string_at(ctypes.c_void_p(ptrs[0]))
    want = ts_constant().encode("utf-8")

    print(f"CALLS={len(ptrs)} WRONG_LITERAL_ADDR={wrong_addr} INVARIANT={invariant}")
    print(f"  returned pointer - slide = {ptrs[0] - slide:#x} (expected {LITERAL_VA:#x})")
    print(f"  live length = {len(live)} bytes, TS constant length = {len(want)} bytes")
    if live != want:
        for i, (a, b) in enumerate(zip(live, want)):
            if a != b:
                print(f"  FIRST DIFF at byte {i}: live={live[max(0,i-30):i+30]!r} "
                      f"ts={want[max(0,i-30):i+30]!r}")
                break
    # the embedded self-check: //LEN=<hex> must equal the byte count
    m = re.search(rb"//LEN=([0-9a-f]+)", live)
    len_ok = m is not None and int(m.group(1), 16) == len(live)
    print(f"  embedded //LEN={m.group(1).decode() if m else '?'} matches the byte count: {len_ok}")

    print(f"  NEGATIVE CONTROL the NEXT cstring in the section is different: "
          f"{ctypes.string_at(ctypes.c_void_p(ptrs[0] + len(live) + 1))[:40]!r}")

    ok = wrong_addr == 0 and invariant and live == want and len_ok
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
