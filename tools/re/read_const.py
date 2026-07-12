#!/usr/bin/env python3
"""tools/re/read_const.py — read constants (floats/doubles/ints) at a virtual address
out of a Mach-O binary, correctly handling FAT (universal) binaries.

⚠️ THE FAT-SLICE BUG (why this tool exists): FCP's frameworks are universal
(x86_64 + arm64). `otool -arch arm64 -l` reports each section's `offset` RELATIVE TO
THE arm64 SLICE, not the whole file. Reading `open(bin).read()[offset+...]` without
adding the arm64 slice's fat offset yields GARBAGE — which silently pushed earlier RE
into curve-fitting the CPU constants instead of decoding them. This tool adds the slice
base so `adrp x8,<page>; ldr d1,[x8,#<off>]` constants read correctly.

USAGE:
  read_const.py <binary> <vaddr-hex> [type]      type in {d,f,2f,4f,i,q}  (default d)
  e.g. read_const.py ".../ProAppsFxSupport" 0x117d18 d      -> 1.3
"""
import sys, struct, subprocess, re

def slice_base(path):
    """Return the arm64 slice's file offset in a fat binary (0 if thin/arm64-only)."""
    try:
        fat = subprocess.check_output(["otool", "-f", "-arch", "arm64", path]).decode("utf-8", "replace")
    except subprocess.CalledProcessError:
        return 0
    # cputype 16777228 = CPU_TYPE_ARM64; find its offset
    off = 0
    for blk in re.split(r'architecture \d+', fat):
        if "16777228" in blk:
            m = re.search(r'offset (\d+)', blk)
            if m:
                off = int(m.group(1))
    return off

def sections(path):
    out = subprocess.check_output(["otool", "-arch", "arm64", "-l", path]).decode("utf-8", "replace")
    secs = []
    for m in re.finditer(r'sectname (\S+)\n\s+segname (\S+)\n\s+addr 0x([0-9a-f]+)\n\s+size 0x([0-9a-f]+)\n\s+offset (\d+)', out):
        secs.append((m.group(1), m.group(2), int(m.group(3), 16), int(m.group(4), 16), int(m.group(5))))
    return secs

FMT = {"d": ("<d", 8), "f": ("<f", 4), "2f": ("<2f", 8), "4f": ("<4f", 16),
       "i": ("<i", 4), "q": ("<q", 8), "2d": ("<2d", 16)}

def read_const(path, vaddr, typ="d"):
    data = open(path, "rb").read()
    base = slice_base(path)
    fmt, n = FMT[typ]
    for name, seg, a, s, o in sections(path):
        if a <= vaddr < a + s:
            fo = base + o + (vaddr - a)
            return struct.unpack(fmt, data[fo:fo + n]), f"{seg},{name}"
    return None, None

def main(argv):
    if len(argv) < 2:
        print(__doc__); return
    path, vaddr = argv[0], int(argv[1], 16)
    typ = argv[2] if len(argv) > 2 else "d"
    val, sec = read_const(path, vaddr, typ)
    print(f"{argv[1]} [{sec}] {typ} = {val}")

if __name__ == "__main__":
    main(sys.argv[1:])
