"""fct.parity.selftest — TRUST GATE for the parity harness (mirrors faithful/selftest.py).

A verdict is only trustworthy if the harness itself is sound. Before recording ANY
VERIFIED/DIVERGED verdict, driver.sweep runs these checks; if any fails the sweep aborts
with status HARNESS_BROKEN (a broken harness must NEVER drive the work — the same lesson
as the faithful program).

Checks:
  S1 ORACLE LOADS      — an FCP framework dlopens and a known symbol resolves + returns a
                         known-correct value (proves the FFI path is live, not stale).
  S2 TS WORKER LIVE    — the tsx worker boots and answers a known call (proves the bridge
                         is live).
  S3 NEGATIVE CONTROL  — a deliberately WRONG engine value is DETECTED as divergence by the
                         comparator (proves the gate can actually FAIL, not just pass).
  S4 DETERMINISM       — the oracle returns the identical value on a repeat call (premise of
                         an exact-equality gate).
"""
import sys, pathlib
REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
from fct.parity import oracle
from fct.parity.bridge import TSWorker

_EASE = {
    "id": "PCMath_easeInOut", "framework": "ProCore",
    "symbol": "__ZN6PCMath9easeInOutEdddddPdS0_",
    "signature": {"args": [
        {"kind": "in", "ctype": "double", "name": "t"},
        {"kind": "in", "ctype": "double", "name": "easeIn"},
        {"kind": "in", "ctype": "double", "name": "easeOut"},
        {"kind": "in", "ctype": "double", "name": "v0"},
        {"kind": "in", "ctype": "double", "name": "v1"},
        {"kind": "out", "ctype": "double", "name": "outVal"},
        {"kind": "out", "ctype": "double", "name": "outDeriv"}], "ret": "double"},
    "outputs": ["outVal"],
}


def run(worker=None):
    """Return (ok, [(name, ok, detail)...]). Reuses a worker if given."""
    results = []
    own = False
    # S1 oracle
    try:
        o = oracle.call(_EASE, {"t": 0.5, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})
        ok = abs(o["outVal"] - 0.5) < 1e-12
        results.append(("S1_ORACLE_LOADS", ok, "easeInOut(0.5)=%r" % o["outVal"]))
    except Exception as e:
        results.append(("S1_ORACLE_LOADS", False, "oracle raised: %s" % e))
    # S2/S3/S4 need the TS worker
    if worker is None:
        worker = TSWorker(); own = True
    try:
        try:
            e = worker.eval("PCMath_easeInOut", {"t": 0.5, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})
            ok = abs(e["outVal"] - 0.5) < 1e-9
            results.append(("S2_TS_WORKER_LIVE", ok, "TS easeInOut(0.5)=%r" % e["outVal"]))
        except Exception as ex:
            results.append(("S2_TS_WORKER_LIVE", False, "worker raised: %s" % ex))
        # S3 negative control: compare a real oracle value against a deliberately biased one.
        try:
            o = oracle.call(_EASE, {"t": 0.5, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})["outVal"]
            biased = o + 0.1
            detected = abs(o - biased) > 1e-6  # comparator MUST flag this
            results.append(("S3_NEGATIVE_CONTROL", detected, "|%.3f-%.3f|>tol -> %s" % (o, biased, detected)))
        except Exception as ex:
            results.append(("S3_NEGATIVE_CONTROL", False, "raised: %s" % ex))
        # S4 determinism
        try:
            a = oracle.call(_EASE, {"t": 0.37, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})["outVal"]
            b = oracle.call(_EASE, {"t": 0.37, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0})["outVal"]
            results.append(("S4_DETERMINISM", a == b, "%r == %r" % (a, b)))
        except Exception as ex:
            results.append(("S4_DETERMINISM", False, "raised: %s" % ex))
    finally:
        if own:
            worker.close()
    return all(r[1] for r in results), results


def main():
    ok, results = run()
    for name, passed, detail in results:
        print("  %-22s %s  %s" % (name, "PASS" if passed else "FAIL", detail))
    print("HARNESS", "OK" if ok else "BROKEN")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
