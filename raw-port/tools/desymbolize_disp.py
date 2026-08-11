#!/usr/bin/env python3
"""desymbolize_disp.py — undo otool -tV's symbolization of STRUCT FIELD OFFSETS.

`otool -tV` resolves the disp32 of a memory operand against the symbol table.
For `%rip`-relative operands that is correct and useful. For any OTHER base
register the displacement is a STRUCT FIELD OFFSET, not an address, and
symbolizing it produces a line that reads like a completely different program:

    0x61b2e4  leaq  "-[OZMagnifyTool draw]"(%rdi), %rax            # WRONG
    0x61b2e4  leaq  0x4290(%rdi), %rax                             # what it is

    0x29d4f3  vaddps __ZN17HGParamBufferDesc8addFieldE...(%rsi), %ymm5, %ymm5
    0x29d4f3  vaddps 0x14c0(%rsi), %ymm5, %ymm5

`disasm.sh` caches `otool -tV` output, so the .s files every worker transcribes
from — and that G5 classifies — inherit the false rendering. Measured over the
five framework dumps: 354 instructions in 150 functions, concentrated in exactly
the places that hurt most, ctors (HGToneCurve::State::C2 alone has 26, i.e. its
whole field layout) and the Get*Tile_AVX kernels' parameter-block reads.

The repair is exact and reversible: the symbol otool named IS the number, so we
look its address up in the cached inventory and put the number back. A line we
could not resolve is left alone and marked, never guessed.

Usage:  desymbolize_disp.py <file.s> <Framework>
Exit 0 always (a repair failure must not fail a disassembly); prints a one-line
summary to stderr when it changed something.
"""
import os
import re
import sys

# An operand of the form NAME(%reg) where reg is NOT %rip. otool quotes ObjC
# method names; C++ mangled names appear bare. A numeric displacement (0x…, -0x…,
# or decimal) is already correct and must not match.
OPERAND = re.compile(
    r'(?P<pre>[\t ,])'
    r'(?P<name>"[^"]*"|[A-Za-z_$][A-Za-z0-9_$.]*)'
    r'\((?P<reg>%r(?!ip\b)[a-z0-9]+)\)'
)


def _inventory(fw):
    here = os.path.dirname(os.path.abspath(__file__))
    for base in (
        os.path.abspath(os.path.join(here, "..", "army", "inventory")),
        os.path.expanduser(
            "~/random/final-cut-pro-transitions/raw-port/army/inventory"),
    ):
        cand = os.path.join(base, f"{fw}.syms.txt")
        if os.path.exists(cand):
            return cand
    return None


def load_syms(fw):
    """name -> address, from the cached `<addr> <T|t> <name>` inventory.

    ObjC entries are `-[Class method]`, which otool prints quoted; C++ entries
    are the bare mangled name. Both are keyed here exactly as the inventory
    spells them.
    """
    path = _inventory(fw)
    if not path:
        return {}
    out = {}
    with open(path) as f:
        for line in f:
            parts = line.split(None, 2)
            if len(parts) == 3:
                out.setdefault(parts[2].strip(), int(parts[0], 16))
    return out


def repair_line(line, syms):
    """Return (line, n_repaired, n_unresolved)."""
    repaired = unresolved = 0

    def sub(m):
        nonlocal repaired, unresolved
        name = m.group("name")
        key = name[1:-1] if name.startswith('"') else name
        addr = syms.get(key)
        if addr is None:
            # otool prints ObjC names without the leading underscore that the
            # symbol table carries for C symbols; try that one alternative, then
            # give up rather than guess.
            addr = syms.get("_" + key)
        if addr is None:
            unresolved += 1
            return m.group(0)
        repaired += 1
        return f'{m.group("pre")}0x{addr:x}({m.group("reg")})'

    body, sep, comment = line.partition("##")
    new_body = OPERAND.sub(sub, body)
    if repaired:
        # The trailing `## <demangled>` otool wrote describes the symbol it
        # wrongly named, so it is worse than no comment. Replace it.
        note = ("## [disasm.sh restored a disp32 that otool -tV symbolized: "
                "this is a STRUCT FIELD OFFSET, not an address]")
        return new_body.rstrip() + "  " + note + "\n", repaired, unresolved
    if unresolved:
        note = ("## [WARNING: otool -tV symbolized this disp32 and disasm.sh "
                "could not resolve it back to a number — the operand is a "
                "STRUCT FIELD OFFSET, not an address. Re-derive with "
                "`otool -arch x86_64 -tv` before transcribing.]")
        return line.rstrip("\n") + "  " + note + "\n", repaired, unresolved
    return line, 0, 0


def repair_file(path, fw):
    with open(path) as f:
        lines = f.readlines()
    if not any(OPERAND.search(ln.partition("##")[0]) for ln in lines):
        return 0, 0
    syms = load_syms(fw)
    total_r = total_u = 0
    out = []
    for ln in lines:
        new, r, u = repair_line(ln, syms)
        out.append(new)
        total_r += r
        total_u += u
    if total_r or total_u:
        with open(path, "w") as f:
            f.writelines(out)
    return total_r, total_u


def main():
    if len(sys.argv) != 3:
        print(__doc__.strip().splitlines()[-3], file=sys.stderr)
        return 0
    path, fw = sys.argv[1], sys.argv[2]
    if not os.path.exists(path):
        return 0
    try:
        r, u = repair_file(path, fw)
    except Exception as exc:                                    # never fail hard
        print(f"desymbolize_disp: skipped ({exc})", file=sys.stderr)
        return 0
    if r or u:
        print(f"desymbolize_disp: restored {r} symbolized displacement(s)"
              + (f", {u} UNRESOLVED (marked in the .s)" if u else "")
              + f" in {os.path.basename(path)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
