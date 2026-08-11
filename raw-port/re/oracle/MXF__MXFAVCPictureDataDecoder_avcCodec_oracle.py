#!/usr/bin/env python3
"""Differential oracle for
MXF::MXFAVCPictureDataDecoder::avcCodec(MXPictureDescriptor const*, u8, u8, u32, u8, u8, u8)
@Flexo 0x1434bc0.

MUST run under `arch -x86_64 /usr/bin/python3`. The symbol is LOCAL (`t`), so the
harness calls it BY ADDRESS at slide+0x1434bc0 after preloading Flexo's @rpath
chain depth-first (OPS_LOG 2026-08-10); an address call in the wrong slice would
land in unrelated code, so the harness refuses to run unless the process is
x86_64 AND the first bytes at the target match the transcribed prologue.

The three callees live in MXFExportSDK.framework (out of scope for the port, so
the TS models them as boundary stubs) and are all safe to drive live:
  * MXF::MXPictureDescriptor::getDisplayFrameHeight() @MXFExportSDK 0x53850
        eax = desc->0x78 ; cl = (desc->0x60 == 1) ; eax <<= cl
  * CTMRatioIdentical(a, b) @MXFExportSDK 0x2511c   — a literal 64-bit `a == b`
  * MXF::MXKLV::getItemSimpleType(const u64*) @MXFExportSDK 0x4ccb0 — walks the
        std::map at klv->0x18; a ZEROED MXKLV returns null, so componentDepth = 0.
Because a zeroed KLV always yields componentDepth 0, this harness covers the
componentDepth==0 world (451 of the 453 table rows have the wildcard 0 in that
column; only two rows, depth 8 and 10, need a populated KLV and are exercised
by the model only).
"""
import ctypes, hashlib, importlib.util, platform, random, struct, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

spec = importlib.util.spec_from_file_location(
    "mxfavctable_dump",
    __file__.replace("_avcCodec_oracle.py", "_MXFAVCTable_dump.py"))
dump = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dump)

AVCCODEC_VMADDR = 0x1434bc0
PROLOGUE = bytes.fromhex("554157415641554154")   # push rbp; mov rsp,rbp is next; push r15..r12
NOT_FOUND = 0x294

raw, TABLE = dump.read_table()
print(f"table: {len(TABLE)} entries sha256={hashlib.sha256(raw).hexdigest()[:16]}…")

slide = dump.flexo_slide()
addr = slide + AVCCODEC_VMADDR
head = ctypes.string_at(addr, 9)
assert head[:4] == bytes.fromhex("554889e5"), (
    f"code at 0x{addr:x} starts {head.hex()} — not the transcribed prologue")

PROTO = ctypes.CFUNCTYPE(ctypes.c_uint32,      # returns u32 in EAX
                         ctypes.c_void_p,      # this   (never read)
                         ctypes.c_void_p,      # MXPictureDescriptor*
                         ctypes.c_uint8, ctypes.c_uint8, ctypes.c_uint32,
                         ctypes.c_uint8, ctypes.c_uint8, ctypes.c_uint8)
avcCodec = PROTO(addr)

EMPTY_KLV = (ctypes.c_char * 0x100)()
ctypes.memset(EMPTY_KLV, 0, 0x100)             # map root at +0x18 is null -> returns null


def make_desc(stored_width, stored_height, interlaced_flag, frame_rate):
    d = (ctypes.c_char * 0x100)()
    ctypes.memset(d, 0, 0x100)
    struct.pack_into("<Q", d, 0x18, frame_rate)                       # CTMRatio, by value
    struct.pack_into("<Q", d, 0x20, ctypes.addressof(EMPTY_KLV))      # MXKLV*
    struct.pack_into("<B", d, 0x60, interlaced_flag)                  # << shift selector
    struct.pack_into("<I", d, 0x74, stored_width)                     # compared to +0x00
    struct.pack_into("<I", d, 0x78, stored_height)                    # feeds the height getter
    return d


def model(desc_width, desc_height_field, interlaced_flag, frame_rate,
          p1, p2, p3, p4, p5, p6, component_depth=0):
    """The TypeScript port's semantics, instruction for instruction."""
    # @0x1434bd7..0x1434bfc — reject: any of p1/p2/p3 zero, or (u8)(p4-3) < 0xfe
    if p1 == 0 or p2 == 0 or p3 == 0 or ((p4 - 3) & 0xff) < 0xfe:
        return NOT_FOUND
    # @0x1434c0b..0x1434c33 — componentDepth from the KLV (0 when absent)
    # @0x1434c33 — isKind1 = (p4 == 1)
    is_kind1 = 1 if (p4 & 0xff) == 1 else 0
    # @0x1434c61.. — linear scan of the 453-entry table
    display_height = (desc_height_field << (1 if interlaced_flag == 1 else 0)) & 0xffffffff
    for e in TABLE:
        if e["storedWidth"] != desc_width:                    # @0x1434c66
            continue
        if e["displayHeight"] != display_height:              # @0x1434c75
            continue
        if e["frameRate"] != frame_rate:                      # @0x1434c86 CTMRatioIdentical
            continue
        if e["arg1"] != (p1 & 0xff):                          # @0x1434c8f
            continue
        if e["arg2"] != (p2 & 0xff):                          # @0x1434c96
            continue
        if e["bitRate"] != p3:                                # @0x1434ca0
            continue
        if e["isKind1"] != is_kind1:                          # @0x1434cab
            continue
        # @0x1434cb2..0x1434cf6 — wildcard-or-equal on depth, then arg6, then arg5
        if not (e["componentDepth"] == 0 or component_depth == e["componentDepth"]):
            continue
        if not (e["arg6"] == 0 or (p6 & 0xff) == e["arg6"]):
            continue
        if not (e["arg5"] == 0 or (p5 & 0xff) == e["arg5"]):
            continue
        return e["codec"]                                     # @0x1434d0d
    return NOT_FOUND                                          # @0x1434d14


rng = random.Random(20260811)
cases = div = 0
hits = 0


def run(desc_w, desc_h, inter, rate, p1, p2, p3, p4, p5, p6):
    global cases, div, hits
    d = make_desc(desc_w, desc_h, inter, rate)
    live = avcCodec(0, ctypes.addressof(d), p1, p2, p3, p4, p5, p6)
    want = model(desc_w, desc_h, inter, rate, p1, p2, p3, p4, p5, p6)
    cases += 1
    if live != NOT_FOUND:
        hits += 1
    if live != want:
        div += 1
        if div < 6:
            print(f"DIVERGE w={desc_w} h={desc_h} inter={inter} rate={rate:#x} "
                  f"p=({p1},{p2},{p3},{p4},{p5},{p6}) live={live} want={want}")


# --- A: exact table rows (every one of the 453), progressive + interlaced ------
for e in TABLE:
    for inter in (0, 1):
        h = e["displayHeight"] >> 1 if inter == 1 else e["displayHeight"]
        if inter == 1 and (e["displayHeight"] & 1):
            continue
        p4 = 1 if e["isKind1"] else 2
        run(e["storedWidth"], h, inter, e["frameRate"], e["arg1"], e["arg2"],
            e["bitRate"], p4, e["arg5"], e["arg6"])

# --- B: near-misses — perturb one field of a real row at a time ---------------
for _ in range(600):
    e = rng.choice(TABLE)
    w, h, rate = e["storedWidth"], e["displayHeight"], e["frameRate"]
    p1, p2, p3 = e["arg1"], e["arg2"], e["bitRate"]
    p4 = 1 if e["isKind1"] else 2
    p5, p6 = e["arg5"], e["arg6"]
    which = rng.randrange(8)
    if which == 0:   w += rng.choice([-1, 1, 16])
    elif which == 1: h += rng.choice([-1, 1, 8])
    elif which == 2: rate ^= 1 << rng.randrange(64)
    elif which == 3: p1 = rng.randrange(256)
    elif which == 4: p2 = rng.randrange(256)
    elif which == 5: p3 ^= 1 << rng.randrange(32)
    elif which == 6: p4 = rng.randrange(256)
    else:            p5, p6 = rng.randrange(256), rng.randrange(256)
    run(w & 0xffffffff, h & 0xffffffff, 0, rate & 0xffffffffffffffff,
        p1 & 0xff, p2 & 0xff, p3 & 0xffffffff, p4 & 0xff, p5 & 0xff, p6 & 0xff)

# --- C: the early-out guard, exhaustively over p4 and the zero arguments ------
for p4 in range(256):
    run(1920, 1080, 0, 0x0000000100000019, 100, 40, 13153320, p4, 0, 0)
for zero_which in range(3):
    for _ in range(60):
        p1, p2, p3 = 100, 40, 13153320
        if zero_which == 0: p1 = 0
        if zero_which == 1: p2 = 0
        if zero_which == 2: p3 = 0
        run(1920, 1080, 0, 0x0000000100000019, p1, p2, p3,
            rng.choice([1, 2]), 0, 0)

# --- D: pure random noise -----------------------------------------------------
for _ in range(800):
    run(rng.choice([0, 1280, 1920, 2048, 3840, 4096, rng.randrange(1 << 16)]),
        rng.choice([720, 1080, 540, 2160, rng.randrange(1 << 16)]),
        rng.randrange(2), rng.choice([0, 0x0000000100000019,
                                      0x000003e900007530, rng.getrandbits(64)]),
        rng.randrange(256), rng.randrange(256),
        rng.choice([0, 13153320, 88866816, rng.getrandbits(32)]),
        rng.randrange(256), rng.randrange(256), rng.randrange(256))

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"treats (u8)(p4-3)<0xfe as the ACCEPT test (guard inverted)": 0,
       "compares the frame rate as 32-bit, not 64-bit": 0,
       "ignores the isKind1 (p4==1) column": 0,
       "requires arg5/arg6 to match exactly (drops the 0 wildcard)": 0}
NEG_N = 0
for e in TABLE[:150]:
    for p5x, p6x in ((e["arg5"], e["arg6"]), (0x11, 0x22)):
        d = make_desc(e["storedWidth"], e["displayHeight"], 0, e["frameRate"])
        p4 = 1 if e["isKind1"] else 2
        live = avcCodec(0, ctypes.addressof(d), e["arg1"], e["arg2"], e["bitRate"],
                        p4, p5x, p6x)
        NEG_N += 1
        if (NOT_FOUND if not ((p4 - 3) & 0xff) < 0xfe else
                model(e["storedWidth"], e["displayHeight"], 0, e["frameRate"],
                      e["arg1"], e["arg2"], e["bitRate"], p4, p5x, p6x)) != live:
            neg["treats (u8)(p4-3)<0xfe as the ACCEPT test (guard inverted)"] += 1
        m32 = model(e["storedWidth"], e["displayHeight"], 0,
                    e["frameRate"] & 0xffffffff, e["arg1"], e["arg2"],
                    e["bitRate"], p4, p5x, p6x)
        if m32 != live:
            neg["compares the frame rate as 32-bit, not 64-bit"] += 1
        mk = model(e["storedWidth"], e["displayHeight"], 0, e["frameRate"],
                   e["arg1"], e["arg2"], e["bitRate"], 1 if p4 == 2 else 2, p5x, p6x)
        if mk != live:
            neg["ignores the isKind1 (p4==1) column"] += 1
        strict = NOT_FOUND
        for t in TABLE:
            if (t["storedWidth"] == e["storedWidth"] and t["displayHeight"] == e["displayHeight"]
                    and t["frameRate"] == e["frameRate"] and t["arg1"] == e["arg1"]
                    and t["arg2"] == e["arg2"] and t["bitRate"] == e["bitRate"]
                    and t["isKind1"] == (1 if p4 == 1 else 0)
                    and t["componentDepth"] == 0
                    and t["arg6"] == (p6x & 0xff) and t["arg5"] == (p5x & 0xff)):
                strict = t["codec"]
                break
        if strict != live:
            neg["requires arg5/arg6 to match exactly (drops the 0 wildcard)"] += 1

print(f"CASES={cases} (table hits: {hits}) DIVERGENCES={div}")
print(f"negative controls over {NEG_N} cases (higher = the wrong port would be caught):")
for k, v in neg.items():
    print(f"   {v:4d}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
