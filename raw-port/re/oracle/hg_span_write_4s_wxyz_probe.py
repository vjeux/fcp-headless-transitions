#!/usr/bin/env python3
"""hg_span_write_4s_wxyz_probe.py — LIVE differential for
`hg_span_write_4s_wxyz(void*, int, float4 const*, int)` @Helium 0x1ea660
(`__ZL21hg_span_write_4s_wxyzPviPKDv4_fi` — a LOCAL `t` symbol, so it is called BY ADDRESS at
`_dyld_get_image_vmaddr_slide(Helium) + 0x1ea660`, after asserting the bytes there).

Run:  arch -x86_64 /usr/bin/python3 <this file>

x86_64 IS REQUIRED and the self-check is not decoration: every address here is from the x86_64
slice, the arm64 slice of Helium is a different image with different offsets, and an address-based
differential that lands on the wrong function fails silently TOWARD agreement.

WHAT IT MEASURES
  A. the 16 opcode bytes at the call address are the ones the port transcribes;
  B. the constant at 0x3cb250 read out of the LIVE image (the port cites it as 65535.0f x4);
  C. 44 calls of the real function over a poisoned destination buffer, comparing the WHOLE buffer
     byte for byte — so an over-write past the span is a failure, not an invisible;
  D. the same 44 cases replayed through raw-port/src/render/hg_span_write_4s_wxyz.ts by
     hg_span_write_4s_wxyz_driver.mts, compared byte for byte against the live buffers;
  E. four negative controls, each a plausible misreading of the disassembly, evaluated over the
     same corpus — a differential no wrong port fails is not evidence.

THE CORPUS IS BUILT AROUND THE THREE THINGS THAT ARE EASY TO GET WRONG:
  * the alignment peel (`testb $0xf,%dil`), so every count is run at BOTH a 16-byte aligned and a
    misaligned destination;
  * the unrolled trip counts (peel / 2-block / 4-loop / 1-tail), so counts 0..12 and 16/17 are all
    present rather than a round number;
  * the lane values: exact rounding ties (x.5 both even and odd), NaN, +/-Inf, negatives, values
    above 1.0, denormals, and 1.0 — the machine answers 0 for NaN, and ties go to EVEN.
"""
import ctypes, json, os, platform, struct, subprocess, sys
# A driver that does not terminate is a mutant that was KILLED, not a pending result (#719).
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FCP = "/Applications/Final Cut Pro.app/Contents"
HELIUM = FCP + "/Frameworks/Helium.framework/Versions/A/Helium"
VA_FN = 0x1EA660
VA_K = 0x3CB250

# testl %esi,%esi / setle %al / testb $0xf,%dil / sete %cl / orb %al,%cl / jne
PROLOGUE = bytes([0x85, 0xF6, 0x0F, 0x9E, 0xC0, 0x40, 0xF6, 0xC7,
                  0x0F, 0x0F, 0x94, 0xC1, 0x08, 0xC1, 0x75, 0x2B])

if platform.machine() != "x86_64":
    sys.exit("REFUSING: running as %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          "/Applications/Final Cut Pro.app/Contents/PlugIns", FCP + "/Frameworks/ProApps"]


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True, timeout=DRIVER_TIMEOUT).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        tail = name[len("@rpath/"):]
        for r in RPATHS:
            p = os.path.join(r, tail)
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


loaded, failed = set(), []


def preload(path, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e)[-60:]))


preload(HELIUM)
ctypes.CDLL(HELIUM, mode=ctypes.RTLD_GLOBAL)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Helium"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break

checks = []


def check(name, ok, detail=""):
    checks.append((name, bool(ok), detail))
    print("  %-56s %s  %s" % (name, "PASS" if ok else "FAIL", detail))


check("A Helium is mapped and its slide is known", slide is not None, hex(slide or 0))
if slide is None:
    sys.exit("Helium not in the image list")

addr = slide + VA_FN
live_bytes = ctypes.string_at(addr, len(PROLOGUE))
check("A opcode self-check at slide+0x1ea660", live_bytes == PROLOGUE,
      "%s vs %s" % (live_bytes.hex(), PROLOGUE.hex()))
if live_bytes != PROLOGUE:
    sys.exit("refusing to call an address whose bytes are not the transcribed ones")

kbytes = ctypes.string_at(slide + VA_K, 16)
kfloats = struct.unpack("<4f", kbytes)
check("B the constant @0x3cb250 is 65535.0f x4", kfloats == (65535.0,) * 4,
      "%s = %s" % (kbytes.hex(), kfloats))

FN = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_int32, ctypes.c_void_p, ctypes.c_int32)(addr)

POISON = 0xCD


def aligned_buffer(nbytes):
    """A buffer whose usable base is 16-byte aligned, so `dst+align` has the low nibble we mean.
    ctypes gives no alignment guarantee, so take a bigger block and step forward into it."""
    raw = ctypes.create_string_buffer(nbytes + 32)
    base = ctypes.addressof(raw)
    pad = (-base) % 16
    return raw, base + pad, pad


def f32bits(x):
    return "%08x" % struct.unpack("<I", struct.pack("<f", x))[0]


# ── the corpus ──────────────────────────────────────────────────────────────────────────────────
# Lane values chosen so that each is interesting AFTER the *65535 scale:
TIE_EVEN = 0.5 / 65535.0        # scaled = 0.5  -> ties-to-even gives 0, Math.round gives 1
TIE_ODD = 1.5 / 65535.0         # scaled = 1.5  -> ties-to-even gives 2 (same as round-half-up)
TIE_2_5 = 2.5 / 65535.0         # scaled = 2.5  -> ties-to-even gives 2, Math.round gives 3
VALUES = [0.0, 1.0, 0.25, 0.5, TIE_EVEN, TIE_ODD, TIE_2_5, 1.0000305, 2.0, -0.5, -1e-9,
          float("nan"), float("inf"), float("-inf"), 1e-30, 0.999999]


def make_src(nsamples, seed):
    """Deterministic, and deliberately not random: each sample walks the interesting values so a
    failing case names a value rather than a seed."""
    vals = []
    for s in range(nsamples):
        for lane in range(4):
            vals.append(VALUES[(seed + 4 * s + lane) % len(VALUES)])
    return vals


CASES = []
for count in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, -1, -3]:
    for align in (0, 8):
        n = max(count, 0)
        CASES.append({
            "name": "count=%d align=%d" % (count, align),
            "count": count,
            "align": align,
            # 8 bytes per sample written, plus 32 bytes of poison to catch an over-write, plus the
            # alignment offset itself.
            "dstBytes": align + 8 * max(n, 1) + 32,
            "poison": POISON,
            "src": [f32bits(v) for v in make_src(max(n, 1) + 4, count + align)],
        })

live = {}
keep = []
for c in CASES:
    raw, base, pad = aligned_buffer(c["dstBytes"])
    keep.append(raw)                                   # keep the buffers alive for the whole run
    ctypes.memset(ctypes.addressof(raw), POISON, len(raw))
    # The SOURCE must be 16-byte aligned too: the body loads it with `movaps`, which faults
    # otherwise — one of the two alignment requirements this function's head peel exists to serve.
    payload = b"".join(struct.pack("<I", int(h, 16)) for h in c["src"])
    src_raw = ctypes.create_string_buffer(len(payload) + 32)
    keep.append(src_raw)
    src_base = ctypes.addressof(src_raw)
    src_base += (-src_base) % 16
    ctypes.memmove(src_base, payload, len(payload))
    FN(base + c["align"], c["count"], src_base, 0x7FFFFFFF)
    live[c["name"]] = ctypes.string_at(base, c["dstBytes"]).hex()

check("C %d live calls completed" % len(CASES), len(live) == len(CASES))

# ── D. the TypeScript port ──────────────────────────────────────────────────────────────────────
DRIVER = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      "hg_span_write_4s_wxyz_driver.mts")
ts = {}
if os.path.exists(DRIVER):
    r = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=json.dumps(CASES), capture_output=True, text=True,
                       timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        check("D the TypeScript port runs", False, (r.stderr or "")[-300:])
    else:
        rows = json.loads(r.stdout)
        ts = {row["name"]: row for row in rows}
        errs = [row["name"] for row in rows if row["error"]]
        check("D the TypeScript port runs", not errs,
              "%d cases%s" % (len(rows), "" if not errs else "; threw on " + ", ".join(errs[:3])))
else:
    check("D the TypeScript port runs", False, "driver not found")

diverged = []
if ts:
    for c in CASES:
        got = ts.get(c["name"], {}).get("dst", "<missing>")
        if got != live[c["name"]]:
            diverged.append(c["name"])
    check("D live vs TypeScript, all %d cases byte-identical" % len(CASES), not diverged,
          "0 divergences" if not diverged else "%d differ: %s" % (len(diverged), diverged[:4]))

# ── E. negative controls ────────────────────────────────────────────────────────────────────────
# Each mutant is the port's own algorithm with ONE clause changed, evaluated here rather than in the
# driver so that a mutant cannot accidentally be the thing under test.
def model(count, align, srcvals, dstBytes, mutant=""):
    buf = bytearray([POISON] * dstBytes)

    def cvt(x):
        if not (-2147483648.0 <= x <= 2147483647.0):
            return -2147483648
        import math
        fl = math.floor(x)
        frac = x - fl
        if mutant == "round-half-up":
            return int(fl + 1) if frac >= 0.5 else int(fl)
        if frac > 0.5:
            return int(fl) + 1
        if frac < 0.5:
            return int(fl)
        return int(fl) if int(fl) % 2 == 0 else int(fl) + 1

    def one(dst_off, s_idx):
        order = [3, 0, 1, 2] if mutant != "no-shuffle" else [0, 1, 2, 3]
        for lane, pick in enumerate(order):
            v = srcvals[s_idx + pick]
            scaled = struct.unpack("<f", struct.pack("<f", v * 65535.0))[0]
            if mutant == "clamp-nan-to-max":
                clamped = 65535.0 if (scaled != scaled or 65535.0 < scaled) else scaled
            else:
                clamped = 65535.0 if 65535.0 < scaled else scaled
            iv = cvt(clamped)
            w = 0 if iv < 0 else (0xFFFF if iv > 0xFFFF else iv)
            struct.pack_into("<H", buf, dst_off + 2 * lane, w)

    dst_off, s_idx = align, 0
    esi = count
    aligned = (align & 0xF) == 0
    if mutant == "peel-on-odd":
        do_peel = esi > 0 and (esi & 1) == 1
    else:
        do_peel = not (esi <= 0 or aligned)
    if do_peel:
        one(dst_off, s_idx)
        dst_off += 8
        s_idx += 4
        esi -= 1
    if esi < 2:
        eax = esi
    else:
        eax = esi - 2
        if (eax & 2) == 0:
            one(dst_off, s_idx)
            one(dst_off + 8, s_idx + 4)
            dst_off += 16
            s_idx += 8
            esi = eax
        if (eax & 0xFFFFFFFF) >= 2:
            while True:
                one(dst_off, s_idx)
                one(dst_off + 8, s_idx + 4)
                one(dst_off + 16, s_idx + 8)
                one(dst_off + 24, s_idx + 12)
                dst_off += 32
                s_idx += 16
                nxt = esi - 4
                tested = (esi - 6) & 0xFFFFFFFF
                esi = nxt
                eax = nxt
                if not (tested < 0xFFFFFFFC):
                    break
    if eax == 1:
        one(dst_off, s_idx)
    return bytes(buf).hex()

for mut in ("no-shuffle", "round-half-up", "clamp-nan-to-max"):
    killed = []
    for c in CASES:
        srcvals = [struct.unpack("<f", struct.pack("<I", int(h, 16)))[0] for h in c["src"]]
        if model(c["count"], c["align"], srcvals, c["dstBytes"], mut) != live[c["name"]]:
            killed.append(c["name"])
    check("E negative control '%s' is killed" % mut, bool(killed),
          "%d of %d cases disagree with the live binary" % (len(killed), len(CASES)))

# ── E' — THE ONE CONTROL THIS DIFFERENTIAL CANNOT KILL, REPORTED RATHER THAN DROPPED ────────────
# `peel-on-odd` mis-reads the head branch as an odd/even peel instead of an alignment peel. It is
# reported as a NOTE and not as a check, because it is UNKILLABLE BY CONSTRUCTION and that is a
# property of the function rather than a hole in the corpus: whichever way the head branches, the
# same `count` samples are written, in order, to the same offsets — the peel changes only the STORE
# WIDTHS (an 8-byte `movq` versus the 16/32-byte `movntdq` stores) and therefore the alignment the
# non-temporal stores need, never the bytes that end up in the destination.
# So the transcription of `testb $0xf,%dil` rests on reading plus the ABI (a misaligned `movntdq`
# faults), and NOT on this measurement. Said out loud because a mutant quietly deleted from a
# harness is how a corpus comes to look stronger than it is.
peel_diff = []
for c in CASES:
    srcvals = [struct.unpack("<f", struct.pack("<I", int(h, 16)))[0] for h in c["src"]]
    if model(c["count"], c["align"], srcvals, c["dstBytes"], "peel-on-odd") != live[c["name"]]:
        peel_diff.append(c["name"])
print("  %-56s %s  %s" % ("E' control 'peel-on-odd' (unkillable by output)",
                          "NOTE",
                          "%d of %d cases differ — the head branch changes store widths, not bytes"
                          % (len(peel_diff), len(CASES))))

# The un-mutated model must AGREE, or the mutation results above measure nothing but a broken model.
model_diff = [c["name"] for c in CASES
              if model(c["count"], c["align"],
                       [struct.unpack("<f", struct.pack("<I", int(h, 16)))[0] for h in c["src"]],
                       c["dstBytes"]) != live[c["name"]]]
check("E the un-mutated control model agrees (so E means something)", not model_diff,
      "0 divergences" if not model_diff else "%d differ: %s" % (len(model_diff), model_diff[:4]))

with open("/tmp/hg_span_write_4s_wxyz_live.json", "w") as f:
    json.dump({"symbol": "__ZL21hg_span_write_4s_wxyzPviPKDv4_fi", "va": hex(VA_FN),
               "slide": hex(slide), "k": kbytes.hex(),
               "cases": [{"name": c["name"], "live": live[c["name"]],
                          "ts": ts.get(c["name"], {}).get("dst", "")} for c in CASES]}, f, indent=1)

nfail = sum(1 for _, ok, _ in checks if not ok)
print("\nRESULT: %s (%d failed of %d)" % ("PASS" if nfail == 0 else "FAIL", nfail, len(checks)))
print("live trace -> /tmp/hg_span_write_4s_wxyz_live.json")
sys.exit(1 if nfail else 0)
