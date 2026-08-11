#!/usr/bin/env python3
"""Dump the runtime contents of Flexo's BSS table __ZL11MXFAVCTable @0x1c921c0.

The table is `b` (BSS) — zero in the file image and filled by Flexo's static
initialisers — so the ONLY way to read it is from a loaded image. Flexo is
dlopen-able outside the app bundle by preloading its @rpath dependency chain
depth-first (OPS_LOG, 2026-08-10). Run under `arch -x86_64 /usr/bin/python3`:
the port cites x86_64 offsets and 0x1c921c0 is an x86_64 vmaddr.

Usage:  arch -x86_64 /usr/bin/python3 mxfavctable_dump.py [--ts]
        --ts prints the TypeScript table literal, otherwise a digest + summary.

Entry layout (0x20 bytes), recovered from the loop in
MXF::MXFAVCPictureDataDecoder::avcCodec @Flexo 0x1434bc0:
  +0x00 u32  storedWidth      cmpl 0x74(%r12)                       @0x1434c66
  +0x04 u32  displayHeight    cmpl vs getDisplayFrameHeight()       @0x1434c75
  +0x08 u64  frameRate        CTMRatio by value -> CTMRatioIdentical @0x1434c86
  +0x10 u32  bitRate          cmpl vs the u32 argument              @0x1434ca0
  +0x14 u8   arg1             cmpb vs %r15b                         @0x1434c8f
  +0x15 u8   arg2             cmpb vs %r14b                         @0x1434c96
  +0x16 u8   componentDepth   0 = wildcard                          @0x1434cb2
  +0x17 u8   isKind1          cmpb vs (arg4 == 1)                   @0x1434cab
  +0x18 u8   arg5             0 = wildcard                          @0x1434cb8
  +0x19 u8   arg6             0 = wildcard                          @0x1434cc9
  +0x1a..+0x1b padding (no instruction reads them)
  +0x1c u32  codec            the returned value                    @0x1434d0d
"""
import ctypes, hashlib, json, os, platform, re, struct, subprocess, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"
FWDIR = "/Applications/Final Cut Pro.app/Contents/Frameworks"
TARGET = f"{FWDIR}/Flexo.framework/Versions/A/Flexo"
TABLE_VMADDR = 0x1c921c0
STRIDE = 0x20
COUNT = (0x38bc - 0x1c) // STRIDE      # the loop bound: r13 0x1c -> 0x38bc step 0x20

_loaded = {}


def _deps(path):
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    res = []
    for line in out.splitlines()[1:]:
        m = re.match(r"\s+(\S+)\s+\(", line)
        if not m:
            continue
        p = m.group(1)
        if p.startswith("@rpath/"):
            p = os.path.join(FWDIR, p[len("@rpath/"):])
        if not p.startswith("@"):
            res.append(p)
    return res


def load_flexo(path=TARGET, depth=0):
    """Depth-first preload of the @rpath chain, then the target itself."""
    real = os.path.realpath(path)
    if real in _loaded or depth > 3:
        return _loaded.get(real)
    _loaded[real] = None
    for d in _deps(path):
        if os.path.exists(d) and os.path.realpath(d) != real:
            load_flexo(d, depth + 1)
    try:
        _loaded[real] = ctypes.CDLL(path, ctypes.RTLD_GLOBAL)
    except OSError:
        pass
    return _loaded[real]


def flexo_slide():
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_uint64
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode().endswith("/Flexo"):
            return libc._dyld_get_image_vmaddr_slide(i)
    raise RuntimeError("Flexo not loaded")


def read_table():
    assert load_flexo() is not None, "Flexo failed to load"
    raw = ctypes.string_at(flexo_slide() + TABLE_VMADDR, COUNT * STRIDE)
    rows = []
    for i in range(COUNT):
        e = raw[i * STRIDE:(i + 1) * STRIDE]
        w, h = struct.unpack_from("<II", e, 0x00)
        rate = struct.unpack_from("<Q", e, 0x08)[0]
        bitrate = struct.unpack_from("<I", e, 0x10)[0]
        a1, a2, depth, kind1, a5, a6 = struct.unpack_from("<6B", e, 0x14)
        codec = struct.unpack_from("<I", e, 0x1c)[0]
        rows.append(dict(storedWidth=w, displayHeight=h, frameRate=rate,
                         bitRate=bitrate, arg1=a1, arg2=a2, componentDepth=depth,
                         isKind1=kind1, arg5=a5, arg6=a6, codec=codec))
    return raw, rows


if __name__ == "__main__":
    raw, rows = read_table()
    digest = hashlib.sha256(raw).hexdigest()
    if "--ts" in sys.argv:
        print("export const MXFAVCTable: ReadonlyArray<MXFAVCTableEntry> = [")
        for i, r in enumerate(rows):
            num = r["frameRate"] & 0xffffffff
            den = r["frameRate"] >> 32
            print(f"  {{ storedWidth: {r['storedWidth']}, displayHeight: {r['displayHeight']},"
                  f" frameRate: 0x{r['frameRate']:016x}n, bitRate: {r['bitRate']},"
                  f" profileIdc: {r['arg1']}, levelIdc: {r['arg2']},"
                  f" componentDepth: {r['componentDepth']}, isKind1: {r['isKind1']},"
                  f" arg5: {r['arg5']}, arg6: {r['arg6']}, codec: {r['codec']} }},"
                  f" // [{i}] @0x1c921c0+0x{i*0x20:x} — {num}/{den}")
        print("];")
    else:
        print(f"entries={len(rows)} sha256={digest}")
        print(f"distinct codecs={len(set(r['codec'] for r in rows))} "
              f"widths={sorted(set(r['storedWidth'] for r in rows))[:8]}...")
        print(json.dumps(rows[:3], indent=1))
