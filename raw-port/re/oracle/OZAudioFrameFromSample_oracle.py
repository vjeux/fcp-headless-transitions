#!/usr/bin/env python3
"""OZAudioFrameFromSample_oracle.py — differential for
`OZAudioFrameFromSample(double, float, int, bool, double*)` @Ozone 0x23c950
(`__Z22OZAudioFrameFromSampledfibPd`) against the live Ozone binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZAudioFrameFromSample_oracle.py

WHY. Reviewer-2 rejected PR #337 for the ONE callee this function has: `_modf`
@0x23cad6. `value - Math.trunc(value)` is exactly modf for a finite value and wrong for
a non-finite one — C modf(+-inf) gives the integral part the infinity and returns +-0.0,
while `inf - inf` is NaN. Their measurement was against libc modf plus IEEE arithmetic;
this harness measures the WHOLE FCP function instead, so the claim is settled end to end
rather than at the callee.

The symbol is exported (`T`), so it is reached by dlsym after the depth-first @rpath
preload, under `arch -x86_64` because every @0xADDR here is an x86_64 offset.

BOTH OUTPUTS ARE COMPARED AS RAW BIT PATTERNS, which is the only way to see the two
things this unit can get wrong: the return value AND `*outRemainder`, including the
distinction between +0.0 and -0.0. That matters twice over here — the whole rejection is
about a lane that should be a signed zero, and the reviewer's SECONDARY note (that a
negative value with no fractional part should yield -0.0, which they did not block on
because the project's own oracle compares absolute differences) is a signed-zero
question that only a bit-exact comparison can answer. It is answered below rather than
assumed in either direction.

NaN classification, per the standing rule: when both sides are NaN the case is counted
as NAN_PAYLOAD and kept out of the verdict, because x86 and JS disagree on the NaN sign
bit and no transcription can fix that. A NaN where the machine produces a finite number
is still a real divergence — which is precisely the defect under repair.
"""
import ctypes, json, os, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ozone_loader import load_framework, require_x86_64  # noqa: E402

require_x86_64()

SYM = "_Z22OZAudioFrameFromSampledfibPd"      # dlsym: no leading underscore
oz = load_framework("Ozone")
fcp = getattr(oz, SYM)
fcp.restype = ctypes.c_double
fcp.argtypes = [ctypes.c_double, ctypes.c_float, ctypes.c_int, ctypes.c_bool,
                ctypes.POINTER(ctypes.c_double)]

INF, NAN = float("inf"), float("nan")

CASES = []


def add(sample, rate, fps, ntsc=False, tag=""):
    CASES.append({"sample": sample, "rate": rate, "fps": fps, "ntsc": ntsc, "tag": tag})


# --- the three the review measured -------------------------------------------------
add(1, 0.0, 30, tag="review: rate 0 -> +inf -> modf gives +0")
add(-1, 0.0, 30, tag="review: rate 0, negative -> modf gives -0")
add(1e308, 1e-45, 24, tag="review: subnormal rate frounds to 0")
# --- the rest of the non-finite family ---------------------------------------------
for s in (0, 1, -1, 0.5, -0.5, 1e300, -1e300):
    add(s, 0.0, 30, tag="rate 0")
    add(s, 1e-46, 30, tag="subnormal rate -> fround 0")
add(INF, 48000.0, 30, tag="sample +inf")
add(-INF, 48000.0, 30, tag="sample -inf")
add(NAN, 48000.0, 30, tag="sample NaN")
add(1e308, 1e-45, 30, ntsc=True, tag="non-finite + ntsc")
add(1e308, 1.0, 30, tag="sample*fps overflow")
# --- the SECONDARY note: negative value, no fractional part ------------------------
# value = sample*fps/rate; pick exact integers so frac is exactly zero.
for s in (-2.0, -1.0, -10.0, -48000.0):
    add(s, 48000.0, 1, tag="negative, exact frame boundary (the -0 question)")
add(2.0, 48000.0, 1, tag="positive, exact frame boundary")
add(-0.0, 48000.0, 30, tag="negative zero sample")
# --- ordinary, incl. the exact-table paths -----------------------------------------
for rate in (32000.0, 44100.0, 48000.0, 22050.0):
    for fps in (24, 25, 30, 60):
        for ntsc in (False, True):
            for s in (0, 1, 1000, 48000, 1234567, -1000, -48000):
                add(s, rate, fps, ntsc, tag="ordinary")
for s in (0.5, 1.5, -0.5, 1e-300, 1e15):
    add(s, 48000.0, 30, tag="fractional / extreme sample")


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def is_nan_bits(u):
    return (u & 0x7FF0000000000000) == 0x7FF0000000000000 and (u & 0x000FFFFFFFFFFFFF) != 0


def machine_side():
    out = []
    for c in CASES:
        rem = ctypes.c_double(-1.5e300)          # poisoned, so "did it write" is visible
        ret = fcp(float(c["sample"]), ctypes.c_float(c["rate"]), int(c["fps"]),
                  bool(c["ntsc"]), ctypes.byref(rem))
        out.append({"ret": bits(ret), "rem": bits(rem.value)})
    return out


MUTATIONS = {
    # M1 is the code this PR shipped before the rework, verbatim.
    "m1_rejected_modf": (
        """    const frac = Number.isFinite(value)
      ? rawFrac === 0
        ? Math.sign(value) * 0
        : rawFrac
      : Number.isNaN(value)
        ? NaN
        : value > 0
          ? 0
          : -0;""",
        "    const frac = value - integralPart;"),
    # M2 keeps the non-finite fix but drops the signed-zero half, which is the state the
    # review explicitly did not block on — so its kill count measures exactly how much
    # that half is worth.
    "m2_no_signed_zero": (
        """      ? rawFrac === 0
        ? Math.sign(value) * 0
        : rawFrac""",
        "      ? rawFrac"),
    "m3_trunc_as_floor": ("    const integralPart = Math.trunc(value);",
                          "    const integralPart = Math.floor(value);"),
}


def materialise_mutants(tmpdir):
    port = os.path.abspath(os.path.join(HERE, "..", "..", "src", "nodes",
                                        "OZAudioFrameFromSample.ts"))
    src = open(port).read()
    out = {}
    for name, (old, new) in MUTATIONS.items():
        if src.count(old) != 1:
            raise SystemExit(f"mutant {name}: anchor appears {src.count(old)} times, "
                             f"expected 1 — refusing to claim a mutation not made.")
        p = os.path.join(tmpdir, f"mutant_{name}.ts")
        open(p, "w").write(src.replace(old, new))
        out[name] = p
    return out, port


def ts_side():
    import tempfile
    tmpdir = tempfile.mkdtemp(prefix="ozaudio_mutants_")
    mutants, port = materialise_mutants(tmpdir)
    req = {"cases": [{"sample": str(bits(float(c["sample"]))),
                      # the rate is narrowed to float32 by the ABI before the callee
                      # ever sees it, so narrow it HERE too and send the exact double.
                      "rate": str(bits(struct.unpack("<f", struct.pack("<f", c["rate"]))[0])),
                      "fps": c["fps"], "ntsc": c["ntsc"]} for c in CASES],
           "port": port, "mutants": mutants}
    p = subprocess.run(
        ["node", "--experimental-strip-types",
         os.path.join(HERE, "OZAudioFrameFromSample_driver.mts")],
        input=json.dumps(req), capture_output=True, text=True)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def compare(machine, side):
    exact = nanp = 0
    diffs = []
    for i, (m, t_) in enumerate(zip(machine, side)):
        t = {"ret": int(t_["ret"]), "rem": int(t_["rem"])}
        bad, nan_only = [], 0
        for k in ("ret", "rem"):
            if m[k] == t[k]:
                continue
            if is_nan_bits(m[k]) and is_nan_bits(t[k]):
                nan_only += 1
            else:
                bad.append(k)
        if bad:
            diffs.append((i, m, t, bad))
        elif nan_only:
            nanp += 1
        else:
            exact += 1
    return exact, nanp, diffs


def main():
    print("=" * 78)
    print("OZAudioFrameFromSample @Ozone 0x23c950 — vs the live Ozone x86_64 slice")
    print(f"{len(CASES)} cases; return value AND *outRemainder compared as raw bit patterns")
    print("=" * 78)

    machine = machine_side()
    ts = ts_side()
    ok = True

    exact, nanp, diffs = compare(machine, ts["port"])
    print(f"\n-- THE PORT --")
    print(f"   bit-exact (both outputs):  {exact}/{len(CASES)}")
    print(f"   NaN-on-both-sides only:    {nanp}/{len(CASES)}")
    print(f"   REAL divergences:          {len(diffs)}/{len(CASES)}")
    for i, m, t, bad in diffs[:10]:
        c = CASES[i]
        print(f"      [{c['tag']}] sample={c['sample']} rate={c['rate']} fps={c['fps']} "
              f"ntsc={c['ntsc']} fields={bad}")
        for k in bad:
            print(f"         {k}: binary={m[k]:#018x}  port={t[k]:#018x}")
    ok &= not diffs

    print("\n-- the three cases the review measured --")
    for i in range(3):
        m, t = machine[i], {k: int(v) for k, v in ts["port"][i].items()}
        print(f"   {CASES[i]['tag']}: rem binary={m['rem']:#018x} port={t['rem']:#018x} "
              f"{'OK' if m['rem'] == t['rem'] else 'DIVERGE'}")

    print("\n-- the SECONDARY question: negative value, no fractional part --")
    for i, c in enumerate(CASES):
        if c["tag"].startswith("negative, exact") or c["tag"] == "negative zero sample":
            m, t = machine[i], {k: int(v) for k, v in ts["port"][i].items()}
            sign = "-0.0" if m["rem"] == 0x8000000000000000 else (
                "+0.0" if m["rem"] == 0 else hex(m["rem"]))
            print(f"   sample={c['sample']:>10} rate={c['rate']} fps={c['fps']}: "
                  f"binary *out = {sign}, port = "
                  f"{'-0.0' if t['rem'] == 0x8000000000000000 else ('+0.0' if t['rem'] == 0 else hex(t['rem']))}"
                  f"   {'OK' if m['rem'] == t['rem'] else 'DIVERGE (signed zero)'}")

    print("\n-- NEGATIVE CONTROLS (mutations of the real file) --")
    for label, key in (("M1 the REJECTED modf model (value - trunc(value))", "m1_rejected_modf"),
                       ("M2 non-finite fixed but signed zero NOT (the review's secondary)",
                        "m2_no_signed_zero"),
                       ("M3 modf's truncation read as floor", "m3_trunc_as_floor")):
        e, n, d = compare(machine, ts["mutants"][key])
        print(f"   {label}: killed {len(d)}/{len(CASES)}  (bit-exact {e}, nan-only {n})")
        if not d:
            print("   !! killed 0 — say which: a BLIND harness, or an EQUIVALENT mutant. "
                  "Not a clean run.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
