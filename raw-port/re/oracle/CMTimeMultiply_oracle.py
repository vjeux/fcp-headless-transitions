#!/usr/bin/env python3
"""CMTimeMultiply_oracle.py — differential for the `CMTimeMultiply` model that
`operator*(CMTime const&, int)` @ProCore 0x581b8 (`__ZmlRK6CMTimei`) depends on, against
the LIVE CoreMedia symbol.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/CMTimeMultiply_oracle.py

WHY. Reviewer-1 rejected PR #114 not for the operator — which is a faithful marshal-and-
call of the stub at 0xde3d2 — but for the hand-written CoreMedia model behind it, which
was written from Apple's prose and diverged from the real function on ordinary inputs.
`CMTimeMultiply` is exported and directly dlsym-able, so its contract is a measurable
fact rather than a documentation question, and this harness is what makes every clause
of the rewritten model a measurement.

WHAT IS CHECKED
  * the four rules the model reproduces exactly (invalid, indefinite, ±infinity with the
    negative-multiplier sign flip, and the in-range product with timescale/flags/epoch
    carried), field by field on all four fields;
  * the EXACT in-range boundary — |value*multiplier| <= INT64_MAX-1 is returned verbatim
    and INT64_MAX itself is not, which is the off-by-one a "saturate at INT64_MAX" model
    would get wrong;
  * that out of range the port THROWS rather than answering, and, next to it, what
    CoreMedia actually returns there — so the harness records the size of the deliberate
    gap instead of hiding it.

The controls are MUTATIONS of the real ported file (one token each, imported as their
own modules), so a control cannot drift from the port.
"""
import ctypes, json, os, random, subprocess, sys, tempfile
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

HERE = os.path.dirname(os.path.abspath(__file__))
PORT_TS = os.path.abspath(os.path.join(HERE, "..", "..", "src", "infra", "CMTime.ts"))

CM = ctypes.CDLL("/System/Library/Frameworks/CoreMedia.framework/CoreMedia")


class CMTime(ctypes.Structure):
    _fields_ = [("value", ctypes.c_int64), ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32), ("epoch", ctypes.c_int64)]


CM.CMTimeMultiply.restype = CMTime
CM.CMTimeMultiply.argtypes = [CMTime, ctypes.c_int32]

VALID, ROUNDED, POSINF, NEGINF, INDEF = 1, 2, 4, 8, 16
I64_MAX = 2**63 - 1
I64_MIN = -(2**63)
MAX_ABS = I64_MAX - 1          # the measured verbatim boundary

rng = random.Random(0xC471)

CASES = []


def add(v, ts, fl, m, ep=0, tag=""):
    CASES.append({"value": v, "timescale": ts, "flags": fl, "epoch": ep,
                  "multiplier": m, "tag": tag})


# --- the three divergences named in the review -------------------------------------
add(4611686018427387904, 600, VALID, 4, tag="review#1 overflow->timescale reduction")
add(I64_MAX, 600, VALID, 2, tag="review#2 saturation + HasBeenRounded")
add(100, 600, 0, 3, tag="review#3 invalid -> fully zeroed")
# --- specials ----------------------------------------------------------------------
for m in (3, -3, 0, 1):
    add(100, 600, VALID | POSINF, m, ep=5, tag="+inf")
    add(100, 600, VALID | NEGINF, m, ep=5, tag="-inf")
    add(100, 600, VALID | INDEF, m, ep=5, tag="indefinite")
    add(100, 600, VALID | POSINF | INDEF, m, ep=5, tag="indefinite outranks +inf")
    add(100, 600, 0, m, ep=5, tag="invalid")
    add(100, 600, ROUNDED, m, ep=5, tag="invalid+rounded")
# --- the exact boundary ------------------------------------------------------------
add(MAX_ABS, 600, VALID, 1, tag="boundary |p| == INT64_MAX-1 (verbatim)")
add(-MAX_ABS, 600, VALID, 1, tag="boundary -(INT64_MAX-1) (verbatim)")
add(I64_MAX, 600, VALID, 1, tag="boundary |p| == INT64_MAX (reduces!)")
add(I64_MIN, 600, VALID, 1, tag="INT64_MIN (reduces)")
add(MAX_ABS // 2, 600, VALID, 2, tag="boundary via multiplier (verbatim)")
add(MAX_ABS // 2 + 1, 600, VALID, 2, tag="boundary via multiplier (reduces)")
# --- ordinary + odd-but-legal ------------------------------------------------------
for v, ts, m in [(1, 600, 2), (100, 600, 3), (-100, 600, 3), (7, 30, 5), (0, 600, 5),
                 (100, 600, 0), (100, 600, -1), (-100, 600, -3), (100, 0, 3),
                 (100, -600, 3), (100, 1, 7), (100, 2147483647, 3)]:
    add(v, ts, VALID, m, tag="ordinary")
    add(v, ts, VALID | ROUNDED, m, ep=9, tag="ordinary, rounded flag + epoch carried")
# --- random in-range ---------------------------------------------------------------
# Pick the multiplier FIRST and then bound the value by MAX_ABS/|m|, so these really are
# in range. (The first version of this corpus drew both independently and 272 of 400
# "in-range" cases silently fell out of range and hit the throw, which would have left
# rule 4 barely exercised while the summary line still looked healthy.)
for _ in range(400):
    m = rng.randint(-10**5, 10**5)
    lim = MAX_ABS if m == 0 else MAX_ABS // abs(m)
    v = rng.randint(-lim, lim)
    ts = rng.randint(1, 2**31 - 1)
    add(v, ts, VALID, m, ep=rng.randint(-3, 3), tag="random in-range")
# Random cases pressed right up against the boundary, where an off-by-one lives.
for _ in range(60):
    m = rng.choice([1, 2, 3, 5, 7, 600, -1, -2, -7])
    lim = MAX_ABS // abs(m)
    v = rng.choice([lim, lim - 1, lim - 2, -lim, -lim + 1])
    add(v, rng.choice([1, 30, 600, 44100]), VALID, m, tag="random near-boundary")
# --- random out-of-range (the deliberate gap) --------------------------------------
for _ in range(40):
    v = rng.randint(2**60, I64_MAX)
    add(rng.choice([v, -v]), rng.choice([1, 7, 30, 600, 44100]), VALID,
        rng.randint(2, 1000), tag="out of range")


def call_real(c):
    g = CM.CMTimeMultiply(
        CMTime(c["value"], c["timescale"], c["flags"], c["epoch"]), c["multiplier"])
    return {"value": str(g.value), "timescale": g.timescale,
            "flags": g.flags, "epoch": str(g.epoch)}


MUTATIONS = {
    "m1_invalid_propagates": (
        "    return { value: 0n, timescale: 0, flags: 0, epoch: 0n };",
        "    return { value: time.value, timescale: time.timescale, "
        "flags: time.flags, epoch: time.epoch };"),
    "m2_no_infinity_flip": ("    const flip = m < 0;", "    const flip = false;"),
    "m3_boundary_off_by_one": ("const CMTIME_MULTIPLY_MAX_ABS = 9223372036854775806n;",
                               "const CMTIME_MULTIPLY_MAX_ABS = 9223372036854775807n;"),
    "m4_epoch_dropped": ("      epoch: time.epoch,\n    };\n  }\n  // (5) Out of range",
                         "      epoch: 0n,\n    };\n  }\n  // (5) Out of range"),
}


def materialise_mutants(tmpdir):
    src = open(PORT_TS).read()
    out = {}
    for name, (old, new) in MUTATIONS.items():
        if src.count(old) != 1:
            raise SystemExit(f"mutant {name}: anchor appears {src.count(old)} times, "
                             f"expected 1 — refusing to claim a mutation not made.")
        p = os.path.join(tmpdir, f"mutant_{name}.ts")
        open(p, "w").write(src.replace(old, new))
        out[name] = p
    return out


def ts_side():
    tmpdir = tempfile.mkdtemp(prefix="cmtime_mutants_")
    req = {
        # int64 fields as STRINGS: they exceed 2^53 and a JSON number would be rounded.
        "cases": [{"value": str(c["value"]), "timescale": c["timescale"],
                   "flags": c["flags"], "epoch": str(c["epoch"]),
                   "multiplier": c["multiplier"]} for c in CASES],
        "port": PORT_TS,
        "mutants": materialise_mutants(tmpdir),
    }
    p = subprocess.run(
        ["node", "--experimental-strip-types", os.path.join(HERE, "CMTime_driver.mts")],
        input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def classify(real, got):
    """-> 'match' | 'threw' | 'diverge'"""
    if got.get("threw"):
        return "threw"
    r = got["result"]
    return "match" if (r["value"] == real["value"] and r["timescale"] == real["timescale"]
                       and r["flags"] == real["flags"] and r["epoch"] == real["epoch"]) \
        else "diverge"


def main():
    print("=" * 78)
    print("CMTimeMultiply — model vs the LIVE CoreMedia symbol   (%d cases)" % len(CASES))
    print("=" * 78)

    real = [call_real(c) for c in CASES]
    ts = ts_side()
    ok = True

    in_range = [i for i, c in enumerate(CASES)
                if c["tag"] not in ("out of range",) ]
    match = diverge = threw = 0
    bad = []
    for i, (c, r) in enumerate(zip(CASES, real)):
        k = classify(r, ts["port"][i])
        if k == "match":
            match += 1
        elif k == "threw":
            threw += 1
        else:
            diverge += 1
            bad.append((i, c, r, ts["port"][i]))

    print(f"\n-- THE PORT --")
    print(f"   field-exact against CoreMedia:  {match}/{len(CASES)}")
    print(f"   threw (out-of-range, by design): {threw}/{len(CASES)}")
    print(f"   DIVERGED (answered, wrongly):    {diverge}/{len(CASES)}")
    for i, c, r, g in bad[:10]:
        print(f"      [{c['tag']}] v={c['value']} ts={c['timescale']} fl={c['flags']:#x} "
              f"m={c['multiplier']}\n         real={r}\n         port={g}")
    ok &= diverge == 0

    print("\n-- the three divergences the review named --")
    for i in range(3):
        k = classify(real[i], ts["port"][i])
        print(f"   {CASES[i]['tag']}: {k}"
              + ("" if k != "match" else f"  real={real[i]}"))

    print("\n-- the exact in-range boundary --")
    for i, c in enumerate(CASES):
        if c["tag"].startswith("boundary") or c["tag"].startswith("INT64_MIN"):
            k = classify(real[i], ts["port"][i])
            print(f"   {c['tag']}: port {k}, CoreMedia -> "
                  f"v={real[i]['value']} ts={real[i]['timescale']} fl={real[i]['flags']:#x}")

    print("\n-- the deliberate gap: what CoreMedia does where the port throws --")
    gap = [i for i, c in enumerate(CASES) if c["tag"] == "out of range"]
    all_threw = all(ts["port"][i].get("threw") for i in gap)
    print(f"   {sum(1 for i in gap if ts['port'][i].get('threw'))}/{len(gap)} out-of-range "
          f"cases threw (none answered with a fabricated number)")
    i0 = gap[0]
    print(f"   e.g. v={CASES[i0]['value']} ts={CASES[i0]['timescale']} m={CASES[i0]['multiplier']}"
          f" -> CoreMedia v={real[i0]['value']} ts={real[i0]['timescale']} "
          f"fl={real[i0]['flags']:#x} (timescale reduced, rounded bit set)")
    ok &= all_threw

    print("\n-- NEGATIVE CONTROLS (mutations of the real file, same node process) --")
    for label, key in (
            ("M1 invalid propagates instead of zeroing (the REJECTED model)",
             "m1_invalid_propagates"),
            ("M2 no infinity sign flip on a negative multiplier", "m2_no_infinity_flip"),
            ("M3 boundary INT64_MAX instead of INT64_MAX-1", "m3_boundary_off_by_one"),
            ("M4 epoch dropped on the in-range path", "m4_epoch_dropped")):
        killed = sum(1 for i in range(len(CASES))
                     if classify(real[i], ts["mutants"][key][i]) != classify(real[i], ts["port"][i]))
        print(f"   {label}: killed {killed}/{len(CASES)}")
        if killed == 0:
            print("   !! killed 0 — say which: a BLIND harness, or an EQUIVALENT mutant. "
                  "Not a clean run.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — 0 divergences; every out-of-range case refuses to "
                  "answer rather than answering wrongly" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
