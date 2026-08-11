#!/usr/bin/env python3
"""PCQuat_double_setRotation_oracle.py — differential for
`PCQuat<double>::setRotation(const PCVector3<double>&, const PCVector3<double>&, double)`
@Ozone 0x7bd30 (`__ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d`) against live FCP.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCQuat_double_setRotation_oracle.py

WHY A SECOND HARNESS FOR A PR THAT ALREADY HAD ONE. Reviewer-1 found the inverted branch
with a differential and verified their own one-line fix at 106/106 — that work is the
reason this PR is correct, and this harness reproduces it rather than replacing it. It
exists because of HOW that run reached the binary: it called `slide + 0x6c704`, which
their own note names as "the arm64 address". Every `@0xADDR` in this port is an x86_64
offset (the branch under dispute is `jbe` @0x7be04), so that run compared the port
against the ARM64 implementation of the same source — the exact "the executable oracle
calls the wrong architecture, and fails toward ACCEPT" hazard in OPS_LOG. For pure
double math the two slices usually agree, but two things can differ and BOTH are live
here: arm64 may contract a multiply-add that x86_64 does not (last-ulp), and the two
architectures produce DIFFERENT DEFAULT NaNs.

So this run calls the x86_64 slice: vmaddr 0x7bd30 straight from
raw-port/army/inventory/Ozone.syms.txt, plus `_dyld_get_image_vmaddr_slide`, under
`arch -x86_64`, with a prologue-byte self-check at the call target.

THE NaN RESULT, AND WHY 106/106 IS NOT THE RIGHT TARGET ON THIS SLICE. x86's `divsd` on
0/0 produces the QNaN floating-point indefinite `0xfff8000000000000` — SIGN BIT SET —
while JavaScript canonicalises every arithmetic NaN to `0x7ff8000000000000` and offers
no way to produce the other one. The inputs that exposed the branch defect are exactly
the ones that make cosθ NaN, so on the x86_64 slice those lanes differ in the NaN sign
bit and NO TypeScript port can ever match them. That is classified as NAN_PAYLOAD and
reported next to the divergence count, never hidden inside it and never "fixed" with a
special case that would be a rewrite of `divsd` rather than a transcription. A NaN where
the machine produces a finite number would still be a real divergence, and the
classification is what preserves that distinction.
"""
import ctypes, json, math, os, random, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ozone_loader import local_fn, require_x86_64  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

require_x86_64()

SYM = "__ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d"     # @Ozone 0x7bd30
PROLOGUE = bytes.fromhex("554889e5")                        # push %rbp ; mov %rsp,%rbp

fcp, VMADDR, SLIDE = local_fn(
    "Ozone", SYM, ctypes.c_void_p,
    [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_double])

_got = ctypes.string_at(SLIDE + VMADDR, len(PROLOGUE))
if _got != PROLOGUE:
    raise SystemExit(
        f"SELF-CHECK FAILED at vmaddr {VMADDR:#x} (slide {SLIDE:#x}): expected prologue "
        f"{PROLOGUE.hex()}, found {_got.hex()}. Note {VMADDR:#x} is the X86_64 vmaddr from "
        f"the inventory — if this fires under a native arm64 python, that is the bug this "
        f"harness exists to avoid.")
print(f"self-check ok: x86_64 vmaddr {VMADDR:#x} + slide {SLIDE:#x}, prologue {_got.hex()}")

INF, NAN = float("inf"), float("nan")

# The 8 cases reviewer-1's table named, first and by name, then the rest.
NAMED = [
    ((0, 0, 0), (1, 0, 0), 1e-6),
    ((1, 0, 0), (0, 0, 0), 1e-6),
    ((0, 0, 0), (0, 0, 0), 1e-6),
    ((NAN, 0, 0), (1, 0, 0), 1e-6),
    ((1, 0, 0), (NAN, 1, 1), 1e-6),
    ((INF, 0, 0), (1, 0, 0), 1e-6),
    ((1e-300, 0, 0), (-1e-300, 0, 0), 1e-6),
    ((1, 2, 3), (3, 2, 1), NAN),
]
STRUCTURED = [
    ((1, 0, 0), (1, 0, 0), 1e-6),          # aligned -> identity
    ((1, 0, 0), (-1, 0, 0), 1e-6),         # antiparallel -> CASE 2
    ((0, 1, 0), (0, -1, 0), 1e-6),         # antiparallel, axis-retry path
    ((1, 2, 3), (3, 2, 1), 1e-6),          # general
    ((1, 0, 0), (-1, 0, 0), 0.0),
    ((1, 0, 0), (-1, 0, 0), 1.0),
    ((1, 0, 0), (-1, 0, 0), 2.0),
    ((1, 0, 0), (-1, 0, 0), -1.0),
    ((1, 2, 3), (3, 2, 1), 0.0),
    ((1, 2, 3), (3, 2, 1), 2.0),
    ((5e-324, 0, 0), (1, 0, 0), 1e-6),     # denormal
    ((1e-8, 0, 0), (-1e-8, 0, 0), 1e-6),   # trips the |len| < 1e-7 blendvpd
    ((INF, INF, INF), (1, 1, 1), 1e-6),
    ((1, 0, 0), (1 - 1e-15, 1e-8, 0), 1e-6),   # near-aligned
    ((1, 0, 0), (-1 + 1e-15, 1e-8, 0), 1e-6),  # near-antiparallel
]
rng = random.Random(0x5E7207)
RANDOM = [((rng.uniform(-9, 9), rng.uniform(-9, 9), rng.uniform(-9, 9)),
           (rng.uniform(-9, 9), rng.uniform(-9, 9), rng.uniform(-9, 9)),
           rng.choice([1e-6, 1e-9, 1e-3])) for _ in range(60)]
NEAR = []
for _ in range(20):
    ax, ay, az = rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)
    eps = rng.choice([1e-16, 1e-12, 1e-9])
    sign = rng.choice([1.0, -1.0])
    NEAR.append(((ax, ay, az), (sign * ax + eps, sign * ay, sign * az), 1e-6))

CASES = NAMED + STRUCTURED + RANDOM + NEAR


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def is_nan_bits(u):
    return (u & 0x7FF0000000000000) == 0x7FF0000000000000 and (u & 0x000FFFFFFFFFFFFF) != 0


def machine_side():
    out = []
    for a, b, tol in CASES:
        # POISON the receiver so "did it write all four lanes" is observable.
        q = (ctypes.c_double * 4)(*[float("-1.5e300")] * 4)
        va = (ctypes.c_double * 3)(*[float(v) for v in a])
        vb = (ctypes.c_double * 3)(*[float(v) for v in b])
        fcp(ctypes.byref(q), ctypes.byref(va), ctypes.byref(vb), float(tol))
        out.append([bits(q[i]) for i in range(4)])
    return out


# MUTANTS BY MUTATION, NOT BY RESTATEMENT. Each control is the REAL ported file with one
# token changed, written to a temp dir and imported as its own module — so a control can
# never drift from the port, and M1 is literally the predicate this PR was rejected for.
PORT_TS = os.path.abspath(os.path.join(HERE, "..", "..", "src", "infra", "PCQuat_double.ts"))
MUTATIONS = {
    "m1_rejected": ("  if (negOneMinusTol > cosTheta) {",
                    "  if (!(negOneMinusTol <= cosTheta)) {"),
    "m2_twosqrt": ("const denom = Math.sqrt(lenSqA * lenSqB);",
                   "const denom = Math.sqrt(lenSqA) * Math.sqrt(lenSqB);"),
    "m3_divsqrt": ("const s = Math.sqrt(sinHalfSq / crossLenSq);",
                   "const s = Math.sqrt(sinHalfSq) / Math.sqrt(crossLenSq);"),
    "m4_ge": ("  if (cosTheta > oneMinusTol) {", "  if (cosTheta >= oneMinusTol) {"),
}


def materialise_mutants(tmpdir):
    src = open(PORT_TS).read()
    paths = {}
    for name, (old, new) in MUTATIONS.items():
        n = src.count(old)
        if n != 1:
            raise SystemExit(
                f"mutant {name}: anchor appears {n} times, expected exactly 1 — the harness "
                f"cannot claim a one-token mutation it did not make.")
        p = os.path.join(tmpdir, f"mutant_{name}.ts")
        open(p, "w").write(src.replace(old, new))
        paths[name] = p
    return paths


def ts_side():
    import tempfile
    driver = os.path.join(HERE, "PCQuat_double_setRotation_driver.mts")
    tmpdir = tempfile.mkdtemp(prefix="pcquat_mutants_")
    # As STRINGS: a u64 bit pattern exceeds 2^53, so a JSON number would be silently
    # rounded by JSON.parse — the corruption-in-the-harness failure mode this whole file
    # is careful about. The driver rebuilds each one through a DataView.
    req = {"cases": [{"a": [str(bits(float(v))) for v in a],
                      "b": [str(bits(float(v))) for v in b],
                      "tol": str(bits(float(tol)))} for a, b, tol in CASES],
           "port": PORT_TS,
           "mutants": materialise_mutants(tmpdir)}
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(req), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def compare(machine, port):
    """-> (exact, nan_payload, real_divergences). The TS side sends u64s as strings."""
    exact = nanp = 0
    diffs = []
    for i, (m, t_) in enumerate(zip(machine, port)):
        t = [int(v) for v in t_]
        lane_nan = 0
        bad = []
        for lane in range(4):
            if m[lane] == t[lane]:
                continue
            if is_nan_bits(m[lane]) and is_nan_bits(t[lane]):
                lane_nan += 1        # NaN on BOTH sides: payload/sign only
            else:
                bad.append(lane)
        if bad:
            diffs.append((i, m, t, bad))
        elif lane_nan:
            nanp += 1
        else:
            exact += 1
    return exact, nanp, diffs


def main():
    print("=" * 78)
    print("PCQuat<double>::setRotation @Ozone 0x7bd30 — vs the X86_64 slice under Rosetta")
    print(f"{len(CASES)} cases, all four lanes compared as raw 64-bit patterns")
    print("=" * 78)

    machine = machine_side()
    ts = ts_side()
    ok = True

    exact, nanp, diffs = compare(machine, ts["port"])
    print(f"\n-- THE PORT --")
    print(f"   bit-exact:                 {exact}/{len(CASES)}")
    print(f"   NaN-on-both-sides only:    {nanp}/{len(CASES)}   "
          f"(x86 indefinite 0xfff8… vs JS 0x7ff8…; unfixable in TS, see the header)")
    print(f"   REAL divergences:          {len(diffs)}/{len(CASES)}")
    for i, m, t, bad in diffs[:8]:
        a, b, tol = CASES[i]
        print(f"      case {i} a={a} b={b} tol={tol} lanes={bad}")
        print(f"        binary={[hex(x) for x in m]}")
        print(f"        port  ={[hex(x) for x in t]}")
    ok &= not diffs

    print("\n-- NEGATIVE CONTROLS (same node process as the port) --")
    for label, key in (
            ("M1 the REJECTED predicate  !(negOneMinusTol <= cosTheta)", "m1_rejected"),
            ("M2 two sqrts: sqrt(|a|²)*sqrt(|b|²) instead of sqrt(|a|²·|b|²)", "m2_twosqrt"),
            ("M3 s = sqrt(sinHalfSq)/sqrt(crossLenSq) instead of sqrt(quotient)", "m3_divsqrt"),
            ("M4 first branch >= instead of >", "m4_ge")):
        e, n, d = compare(machine, ts["mutants"][key])
        print(f"   {label}\n      killed {len(d)}/{len(CASES)}  "
              f"(bit-exact {e}, nan-only {n})")
        if not d:
            print("   !! killed 0 — say which it is: a BLIND harness, or an EQUIVALENT "
                  "mutant. Not a clean run.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED on the x86_64 slice "
                  "(0 real divergences; NaN-payload cases classified, not hidden)"
                  if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
