#!/usr/bin/env python3
"""Unit test for desymbolize_disp.py — run it directly:

    python3 raw-port/tools/test_desymbolize_disp.py     # -> DESYMBOLIZE_DISP: PASS

Self-contained: inline fixtures only, no framework binary and no /tmp dump, so
it runs in a fresh pool worktree (the state OPS_LOG #16 exists about).

What it pins, in both directions:
  * a symbolized NON-%rip disp32 is restored to its number (this is the bug);
  * a %rip-relative symbol reference is LEFT ALONE (there the symbolization is
    correct and load-bearing — it is how callees and literals are identified);
  * an already-numeric displacement is untouched;
  * a `## symbol stub for:` call annotation is untouched;
  * an unresolvable name is NOT guessed — the line is kept and marked.
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import desymbolize_disp as D  # noqa: E402

# A stand-in inventory: name -> address, in the same spelling the real
# `<addr> <T|t> <name>` cache uses.
SYMS = {
    "-[OZMagnifyTool setSpacebarMode:zoomOut:]": 0x4290,
    "__ZN17HGParamBufferDesc8addFieldE5HGRefI12HGParamFieldE": 0x14C0,
    "___clang_call_terminate": 0x1230,
}

CASES = [
    # (input line, expected instruction text after repair, expect_repaired)
    # 1. the real Ozone case: an ObjC selector standing in for +0x4290
    ('000000000061b2e4\tleaq\t"-[OZMagnifyTool setSpacebarMode:zoomOut:]"(%rdi), %rax\n',
     '000000000061b2e4\tleaq\t0x4290(%rdi), %rax', True),
    # 2. the real Helium case: a mangled name standing in for +0x14c0, with the
    #    misleading `## demangled` comment otool appends
    ('000000000029d4f3\tvaddps\t__ZN17HGParamBufferDesc8addFieldE5HGRefI12HGParamFieldE(%rsi), %ymm5, %ymm5 ## HGParamBufferDesc::addField(HGRef<HGParamField>)\n',
     '000000000029d4f3\tvaddps\t0x14c0(%rsi), %ymm5, %ymm5', True),
    # 3. a C symbol with the leading-underscore spelling difference
    ('000000000024a707\tmovaps\t%xmm0, ___clang_call_terminate(%rdi)\n',
     '000000000024a707\tmovaps\t%xmm0, 0x1230(%rdi)', True),
    # 4. %rip-relative symbolization is CORRECT — must survive untouched
    ('00000000004b2824\tleaq\t__ZN13OZApplicationD2Ev(%rip), %rax ## OZApplication::~OZApplication()\n',
     None, False),
    # 5. an already-numeric displacement
    ('000000000061b2f4\tleaq\t0x720(%rdi), %rax\n', None, False),
    # 6. a negative frame offset
    ('000000000029d457\tmovl\t-0x30(%rbp), %eax\n', None, False),
    # 7. a call with otool's stub annotation — no (%reg) operand at all
    ('0000000000029bb9\tcallq\t0x6df0c0 ## symbol stub for: __ZN8PCStringC1Ev\n', None, False),
    # 8. plain indirect, no displacement
    ('0000000000029b30\tmovq\t(%rdi), %rax\n', None, False),
]

UNRESOLVABLE = ('000000000061b2e4\tleaq\t"-[NoSuchClass noSuchMethod]"(%rdi), %rax\n')


def main():
    failures = []

    for i, (line, expect_text, expect_repaired) in enumerate(CASES, 1):
        out, r, u = D.repair_line(line, SYMS)
        if expect_repaired:
            if r != 1:
                failures.append(f"case {i}: expected a repair, got r={r} u={u}")
                continue
            got = out.partition("##")[0].rstrip()
            if got != expect_text:
                failures.append(f"case {i}: got {got!r}, want {expect_text!r}")
            if "STRUCT FIELD OFFSET" not in out:
                failures.append(f"case {i}: repaired line lost its explanatory note")
        else:
            if r or u:
                failures.append(f"case {i}: line must be untouched, got r={r} u={u}: {out!r}")
            elif out != line:
                failures.append(f"case {i}: line changed: {out!r}")

    # unresolvable: keep the line, mark it, never invent a number
    out, r, u = D.repair_line(UNRESOLVABLE, SYMS)
    if r != 0 or u != 1:
        failures.append(f"unresolvable: expected r=0 u=1, got r={r} u={u}")
    if "NoSuchClass" not in out or "WARNING" not in out:
        failures.append("unresolvable: the original operand and a WARNING must both survive")

    # file-level: a file with nothing to repair must not be rewritten at all
    with tempfile.NamedTemporaryFile("w", suffix=".s", delete=False) as f:
        clean = ("__ZN3FooC2Ev:\n"
                 "0000000000001000\tpushq\t%rbp\n"
                 "0000000000001001\tmovq\t0x10(%rdi), %rax\n")
        f.write(clean)
        path = f.name
    before = os.stat(path).st_mtime_ns
    r, u = D.repair_file(path, "NoSuchFramework")
    after = open(path).read()
    if (r, u) != (0, 0) or after != clean or os.stat(path).st_mtime_ns != before:
        failures.append("clean file was rewritten (must be a no-op)")
    os.unlink(path)

    if failures:
        for msg in failures:
            print("FAIL:", msg)
        print(f"DESYMBOLIZE_DISP: FAIL ({len(failures)} failure(s))")
        return 1
    print(f"DESYMBOLIZE_DISP: PASS ({len(CASES)} operand cases + unresolvable + clean-file no-op)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
