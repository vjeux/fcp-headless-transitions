#!/usr/bin/env python3
"""tools/re/extract_shader.py — pull embedded Metal shader source out of FCP's
Filters Mach-O binary (Phase-1 reverse-engineering engine).

FCP compiles each Hgc<Name> fragment program to Metal and ALSO embeds the full
pretty-printed shader source as a C-string in __TEXT,__cstring of the Filters
binary. This tool locates `<Name>_hgc_visible(` inside that string table and
prints the verbatim source — the ground-truth algorithm for a filter's per-pixel
math. Pair it with `nm`/`otool -arch arm64 -tV` for the CPU-side param wiring.

Usage:
  extract_shader.py --list [substr]     list all embedded Hgc*_hgc_visible names
  extract_shader.py HgcGlow [HgcTint..] print verbatim source for each shader
"""
import sys, re

BIN = ("/Applications/Final Cut Pro.app/Contents/PlugIns/InternalFiltersXPC.pluginkit/"
       "Contents/PlugIns/Filters.bundle/Contents/MacOS/Filters")


def _data():
    return open(BIN, "rb").read()


def list_shaders(data, substr=None):
    names = sorted(set(m.decode() for m in re.findall(rb"Hgc[A-Za-z0-9]+(?=_hgc_visible)", data)))
    if substr:
        names = [n for n in names if substr.lower() in n.lower()]
    return names


def extract(data, name):
    needle = f"{name}_hgc_visible(".encode()
    for m in re.finditer(re.escape(needle), data):
        s = m.start()
        lo = data.rfind(b"\x00", 0, s) + 1
        hi = data.find(b"\x00", s)
        chunk = data[lo:hi]
        if b"[[ visible ]]" in chunk or b"FragmentOut" in chunk:
            return chunk.decode("utf-8", "replace")
    return None


def main(argv):
    data = _data()
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__)
        return
    if argv[0] == "--list":
        substr = argv[1] if len(argv) > 1 else None
        for n in list_shaders(data, substr):
            print(n)
        return
    for name in argv:
        src = extract(data, name)
        print(f"===== {name} =====")
        print(src if src else "(not found as embedded source)")
        print()


if __name__ == "__main__":
    main(sys.argv[1:])
