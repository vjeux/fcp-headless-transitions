#!/usr/bin/env python3
"""CMTime_coremedia_oracle.py — large-corpus differential for the four CoreMedia CMTime functions
in raw-port/src/infra/CMTime.ts, against the LIVE system framework.

WHY A SECOND ONE, NEXT TO army/gate/coremedia_oracle.py
-------------------------------------------------------
The gate's oracle runs a FIXED grid of 341 calls. That grid is what a port is merged against, so
it is also exactly what a wrong model can be fitted to. This one generates a randomized corpus of
whatever size you ask for, over the domain the port claims, and prints the per-class counts — so
"it passes the gate" and "it agrees with Apple's implementation" can be checked separately.

It reproduces every number quoted in CMTime.ts's header, and it is how the current bodies of
CMTimeGetSeconds / CMTimeAdd / CMTimeSubtract / CMTimeMultiplyByFloat64 were derived, which was
necessary because those four are the CoreMedia system ABI: there is no FCP disassembly to
transcribe, the framework has no on-disk binary since the dyld shared cache, and the only ground
truth available is the running code. The three rules it pinned down:

  1. a common timescale is negotiated and then REDUCED BY TRUNCATED HALVING until everything fits
     in int64 (CMTimeAdd from lcm(ts1,ts2), else 1e9; CMTimeMultiplyByFloat64 from the input's own
     timescale for an integral multiplier, else max(timescale, 1e9));
  2. operands are CONVERTED INTO that timescale FIRST, rounding half away from zero, in exact
     integer arithmetic — only the multiply by the Float64 goes through a double;
  3. HasBeenRounded means "a conversion rounded, or the timescale was reduced, or (multiply only)
     |result| > 2^51" — the 2^51 threshold bisected on the live framework and independent of the
     timescale.

SELF-CHECKS THIS SCRIPT PERFORMS, so a green run is evidence rather than assertion:
  * --mutate runs a deliberately broken copy of the port (the pre-rework model: value*multiplier
    with the timescale preserved) and REQUIRES it to diverge. A differential that cannot fail is
    not a differential.
  * every Float64 crosses the process boundary as a raw IEEE754 bit pattern in hex, never as a
    JSON number: JSON cannot express NaN or +/-Infinity, and CMTimeGetSeconds returns those for
    the invalid / indefinite / infinite inputs that are the whole point of testing it.
  * the framework is probed by LOADING it, never by os.path.exists() — since the dyld shared cache
    there is no file at that path even though dlopen resolves it.

DOMAIN. Positive timescales and finite multipliers: CMTime.h requires a positive timescale, and no
ported FCP caller can construct anything else. `--out-of-domain` adds non-positive timescales and
non-finite multipliers and reports them as a SEPARATE count; the two known-unmodelled classes are
listed in CMTime.ts's header with measured examples. Do not "fix" the port against that count
without reading them first.

ARCHITECTURE. Verified identical under `arch -x86_64 /usr/bin/python3` and native arm64 (341/341
grid + 16,000 randomized cases each), so unlike an address-based FCP differential this one is not
slice-sensitive. It is still worth running both ways if you are re-deriving anything.

USAGE
    python3 CMTime_coremedia_oracle.py [--cases N] [--seed S] [--out-of-domain] [--mutate]
                                       [--src <path to CMTime.ts>]
    exit 0 = agrees with the live framework over the whole corpus, 2 = DIVERGED, 1 = harness broken
"""
import argparse, ctypes, json, math, os, random, struct, subprocess, sys, tempfile

CM_PATH = "/System/Library/Frameworks/CoreMedia.framework/CoreMedia"
HERE = os.path.dirname(os.path.abspath(__file__))
RAWPORT = os.path.abspath(os.path.join(HERE, "..", ".."))
DEFAULT_SRC = os.path.join(RAWPORT, "src", "infra", "CMTime.ts")
I64_MAX = 2**63 - 1


class CMTime(ctypes.Structure):
    _fields_ = [("value", ctypes.c_int64), ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32), ("epoch", ctypes.c_int64)]


# The driver is written to a TEMP DIR, never into the repo: a harness left inside a pool worktree
# is picked up by the next agent leasing that slot (OPS_LOG). It answers in the same shape as
# army/gate/coremedia_worker.ts, plus `nbits` for scalars.
DRIVER = r"""
import readline from 'node:readline';
const SRC = process.argv[2];
const mod = await import('file://' + SRC);
const toTS = (o) => ({ value: BigInt(o.value), timescale: Number(o.timescale),
                       flags: Number(o.flags), epoch: BigInt(o.epoch ?? 0) });
const bits = (x) => { const d = new DataView(new ArrayBuffer(8)); d.setFloat64(0, x, true);
                      return [...new Uint8Array(d.buffer)].map(v => v.toString(16).padStart(2,'0')).join(''); };
// The multiplier arrives as a bit pattern for the same reason the answer leaves as one: JSON has
// no NaN and no Infinity, and `JSON.stringify(NaN)` produces the invalid token `NaN`.
const unbits = (h) => { const d = new DataView(new ArrayBuffer(8));
                        for (let i = 0; i < 8; i++) d.setUint8(i, parseInt(h.substr(i*2,2),16));
                        return d.getFloat64(0, true); };
process.stdout.write('READY\n');
const rl = readline.createInterface({ input: process.stdin });
for await (const line of rl) {
  if (!line.trim()) continue;
  let out;
  try {
    const q = JSON.parse(line);
    const f = mod[q.fn];
    if (typeof f !== 'function') throw new Error('export ' + q.fn + ' not found');
    const a = toTS(q.t);
    const r = q.b !== undefined ? f(a, toTS(q.b))
            : q.argbits !== undefined ? f(a, unbits(q.argbits)) : f(a);
    out = (r && typeof r === 'object')
        ? { ok: true, r: { value: String(r.value), timescale: Number(r.timescale),
                           flags: Number(r.flags), epoch: String(r.epoch ?? 0) } }
        : { ok: true, nbits: bits(r) };
  } catch (e) { out = { ok: false, error: String(e && e.message ? e.message : e) }; }
  process.stdout.write(JSON.stringify(out) + '\n');
}
"""

# The pre-rework body, kept as a MUTANT so the differential can be watched failing: it is the
# `round(value * multiplier)` model that passed every static gate and was wrong on 175 of the
# gate oracle's 341 calls.
MUTANT_FROM = "  const integral = Number.isInteger(multiplier) &&"
MUTANT_BODY = """  {
    const secs = Number(t.value) * multiplier;
    const r = Math.round(secs);
    return { value: BigInt(r), timescale: t.timescale,
             flags: kCMTimeFlags_Valid | (Number(BigInt(r)) !== secs ? kCMTimeFlags_HasBeenRounded : 0),
             epoch: t.epoch };
  }
  const integral = Number.isInteger(multiplier) &&"""


def load_cm():
    cm = ctypes.CDLL(CM_PATH)              # probe by LOADING; the file does not exist on disk
    cm.CMTimeMultiplyByFloat64.argtypes = [CMTime, ctypes.c_double]
    cm.CMTimeMultiplyByFloat64.restype = CMTime
    for n in ("CMTimeAdd", "CMTimeSubtract"):
        f = getattr(cm, n); f.argtypes = [CMTime, CMTime]; f.restype = CMTime
    cm.CMTimeGetSeconds.argtypes = [CMTime]; cm.CMTimeGetSeconds.restype = ctypes.c_double
    return cm


def d(t):
    # int64 fields cross as STRINGS: a JSON number is a double and would round exactly the
    # overflow cases this exists to check.
    return {"value": str(t[0]), "timescale": t[1], "flags": t[2], "epoch": str(t[3])}


GRID_TIMES = [(100, 600, 1, 0), (0, 600, 1, 0), (-100, 600, 1, 0), (1, 1, 1, 0), (600, 600, 1, 0),
              (7, 3, 1, 0), (100, 600, 0, 0), (100, 600, 1, 5), (2**62, 600, 1, 0),
              (-(2**62), 600, 1, 0), (2**31, 30000, 1, 0)]
GRID_MULTS = [0.0, 1.0, 2.0, -1.0, 0.5, 4.0, 1e6, -3.25]


def grid_cases():
    out = []
    for t in GRID_TIMES:
        out += [("mul", t, m) for m in GRID_MULTS]
        out += [(k, t, b) for b in GRID_TIMES for k in ("add", "sub")]
        out.append(("secs", t, None))
    return out


def random_cases(n, seed, out_of_domain):
    rng = random.Random(seed)
    val = lambda: rng.choice([rng.randint(-1000, 1000), rng.randint(-10**9, 10**9),
                              rng.randint(-2**62, 2**62),
                              rng.choice([0, 1, -1, I64_MAX, -I64_MAX - 1, 2**53, 2**51, 2**31])])
    ts = lambda: rng.choice([600, 30000, 1, 3, 7, 44100, 48000, 1000, 1024, 90000, 10**9,
                             2**31 - 1, rng.randint(1, 10**6), rng.randint(1, 2**31 - 1)] +
                            ([0, -600, -1, -rng.randint(1, 10**6)] if out_of_domain else []))
    fl = lambda: rng.choice([1, 1, 1, 1, 1, 3, 0, 5, 9, 0x11, 0x1d])
    ep = lambda: rng.choice([0, 0, 0, 0, 5, -3, 7])
    mul = lambda: rng.choice([0.0, -0.0, 1.0, -1.0, 2.0, 0.5, -3.25, 1e6, 2.0**63, 9.3e18,
                              2.0**51, 2.0**51 + 1, 1e-9, 1 / 3, rng.uniform(-10, 10),
                              rng.uniform(-1e6, 1e6), float(rng.randint(-10**6, 10**6)),
                              rng.choice([1e15, 1e18, 2.0**53])] +
                             ([float("nan"), float("inf"), float("-inf")] if out_of_domain else []))
    out = []
    for _ in range(n):
        a = (val(), ts(), fl(), ep()); b = (val(), ts(), fl(), ep())
        out += [("mul", a, mul()), ("add", a, b), ("sub", a, b), ("secs", a, None)]
    return out


def in_domain(kind, x, y):
    if x[1] <= 0: return False
    if kind in ("add", "sub") and y[1] <= 0: return False
    if kind == "mul" and not math.isfinite(y): return False
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cases", type=int, default=5000)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--out-of-domain", action="store_true")
    ap.add_argument("--mutate", action="store_true",
                    help="run the pre-rework model and REQUIRE it to diverge")
    args = ap.parse_args()

    try:
        cm = load_cm()
    except OSError as e:
        print(f"CoreMedia unavailable: {e}"); return 1
    tsx = os.path.join(RAWPORT, "node_modules", ".bin", "tsx")
    if not os.path.exists(tsx):
        print(f"tsx not found at {tsx}"); return 1

    tmp = tempfile.mkdtemp(prefix="cmtime_oracle_")
    drv = os.path.join(tmp, "driver.mts")
    open(drv, "w").write(DRIVER)
    src = os.path.abspath(args.src)
    if args.mutate:
        body = open(src).read()
        if MUTANT_FROM not in body:
            print("MUTANT anchor not found — the port changed shape; update MUTANT_FROM."); return 1
        src = os.path.join(tmp, "CMTime.ts")
        open(src, "w").write(body.replace(MUTANT_FROM, MUTANT_BODY, 1))

    p = subprocess.Popen([tsx, drv, src], cwd=RAWPORT, stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE, text=True, bufsize=1)
    if (p.stdout.readline() or "").strip() != "READY":
        print("driver failed to start"); p.kill(); return 1

    def call(req):
        p.stdin.write(json.dumps(req) + "\n"); p.stdin.flush()
        try: return json.loads(p.stdout.readline() or "{}")
        except Exception: return {"ok": False, "error": "bad driver reply"}

    cases = grid_cases() + random_cases(args.cases, args.seed, args.out_of_domain)
    counts = {}
    samples = []
    for kind, x, y in cases:
        bucket = kind if in_domain(kind, x, y) else kind + " (out-of-domain)"
        c = counts.setdefault(bucket, [0, 0])
        c[0] += 1
        req = {"fn": {"mul": "CMTimeMultiplyByFloat64", "add": "CMTimeAdd",
                      "sub": "CMTimeSubtract", "secs": "CMTimeGetSeconds"}[kind], "t": d(x)}
        if kind == "mul": req["argbits"] = struct.pack("<d", y).hex()
        elif kind in ("add", "sub"): req["b"] = d(y)
        got = call(req)
        A = CMTime(*x)
        if kind == "mul":   R = cm.CMTimeMultiplyByFloat64(A, y)
        elif kind == "add": R = cm.CMTimeAdd(A, CMTime(*y))
        elif kind == "sub": R = cm.CMTimeSubtract(A, CMTime(*y))
        else:               R = cm.CMTimeGetSeconds(A)
        if not got.get("ok"):
            ok, desc = False, f"THREW: {got.get('error','')[:90]}"
        elif kind == "secs":
            have = struct.unpack("<d", bytes.fromhex(got["nbits"]))[0]
            ok = (have == R) or (have != have and R != R)     # exact, or NaN on both sides
            desc = f"real={R!r} port={have!r}"
        else:
            g = got.get("r", {})
            want = (R.value, R.timescale, R.flags, R.epoch)
            have = (int(g.get("value", 0)), int(g.get("timescale", 0)),
                    int(g.get("flags", 0)), int(g.get("epoch", 0)))
            ok, desc = want == have, f"real={want} port={have}"
        if not ok:
            c[1] += 1
            if len(samples) < 10:
                samples.append(f"{kind}{x}{'' if y is None else ' ' + repr(y)}: {desc}")
    p.stdin.close(); p.kill()

    for s in samples:
        print(f"  {s}")
    bad = dom = 0
    for k in sorted(counts):
        n, b = counts[k]
        print(f"  {k:22} {n - b}/{n} agree" + (f"   ({b} DIVERGED)" if b else "  ok"))
        bad += b
        if "out-of-domain" not in k: dom += b
    if args.mutate:
        if bad == 0:
            print("MUTANT SURVIVED — the differential cannot fail, so a green run proves nothing.")
            return 2
        print(f"MUTANT KILLED by {bad} divergences — the differential has teeth.")
        return 0
    if dom:
        print(f"CMTime CoreMedia oracle: DIVERGED on {dom} in-domain calls")
        return 2
    print("CMTime CoreMedia oracle: every in-domain call agrees with the live framework")
    return 0


if __name__ == "__main__":
    sys.exit(main())
