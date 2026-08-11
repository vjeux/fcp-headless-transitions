#!/usr/bin/env python3
"""Differential oracle for OZSpline::getValidVertexIter(void*) @ProChannel 0x2fdac.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZSpline_getValidVertexIter_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The method touches five slots — the +0x48/+0x50 range whose iterator it returns and whose linear
fallback it scans, the +0x58/+0x60 range its three cached-index fast paths compare against, and
the memoised index at +0x80 — so a synthetic object is a complete stand-in. The object is
poisoned with 0xEE so a port reading any other field would show up as a divergence.

BOTH observable outputs are compared: the returned iterator (converted back to an index by
`(ret - resultBegin) / 8`) AND the value the call leaves in +0x80. Checking only the return value
would miss the write-back asymmetry the port is careful about (the exact-hint hit @0x2fe4c does
not store; the neighbour hits @0x2fe43 do).
"""
import ctypes
import glob
import json
import os
import platform
import random
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

SYM = "_ZN8OZSpline18getValidVertexIterEPv"     # dlsym: no leading underscore
OBJ_SIZE = 0x100
POISON = 0xEE
OFF_RESULT_BEGIN, OFF_RESULT_END = 0x48, 0x50
OFF_SEARCH_BEGIN, OFF_SEARCH_END = 0x58, 0x60
OFF_HINT = 0x80
POOL_N = 6                                       # distinct pointer identities
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "OZSpline_getValidVertexIter_driver.ts")


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def build_cases():
    """Structured edge cases first, then seeded-random ones."""
    cases = []
    # --- structured: every combination that lands on a distinct branch --------------------
    for rn in range(0, 4):                       # result-array length
        for sn in range(0, 4):                   # search-array length
            result = list(range(rn))
            search = list(range(100, 100 + sn))  # disjoint ids: the two arrays disagree
            same = list(range(rn))               # or identical content
            for arr in ({"search": search}, {"search": same[:sn]}):
                for hint in (-3, -1, 0, 1, 2, 3, sn - 1, sn, sn + 1, 1 << 40):
                    for v in (0, 1, 2, 100, 101, 999):
                        cases.append({"result": result, "search": arr["search"],
                                      "hint": hint, "v": v})
    # --- seeded random --------------------------------------------------------------------
    rng = random.Random(0x0FDAC)
    for _ in range(4000):
        rn = rng.randint(0, 5)
        sn = rng.randint(0, 5)
        cases.append({
            "result": [rng.randrange(POOL_N) for _ in range(rn)],
            "search": [rng.randrange(POOL_N) for _ in range(sn)],
            "hint": rng.choice([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 1 << 31]),
            "v": rng.randrange(POOL_N),
        })
    return cases


def run_native(cases, fn, pool):
    out = []
    obj = ctypes.create_string_buffer(OBJ_SIZE)
    for c in cases:
        keep = []
        ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)

        def emit(ids, off_begin, off_end):
            if not ids:
                struct.pack_into("<Q", obj, off_begin, 0)
                struct.pack_into("<Q", obj, off_end, 0)
                return 0
            buf = ctypes.create_string_buffer(8 * len(ids))
            keep.append(buf)
            for i, pid in enumerate(ids):
                struct.pack_into("<Q", buf, 8 * i, pool[pid])
            base = ctypes.addressof(buf)
            struct.pack_into("<Q", obj, off_begin, base)
            struct.pack_into("<Q", obj, off_end, base + 8 * len(ids))
            return base

        result_base = emit(c["result"], OFF_RESULT_BEGIN, OFF_RESULT_END)
        emit(c["search"], OFF_SEARCH_BEGIN, OFF_SEARCH_END)
        struct.pack_into("<q", obj, OFF_HINT, c["hint"])

        ret = fn(ctypes.addressof(obj), ctypes.c_void_p(pool[c["v"]]))
        ret = ret or 0
        hint_after = struct.unpack_from("<q", obj, OFF_HINT)[0]
        # The machine returns resultBegin + k*8, so k = (ret - resultBegin) / 8. With an empty
        # result range resultBegin is NULL and the fast paths can still return NULL + k*8, which
        # this same formula recovers correctly.
        idx = (ret - result_base) // 8
        out.append([idx, hint_after])
    return out


def run_ts(cases):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(cases), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


# --- negative controls: plausible mis-transcriptions of THIS body -------------------------
def model(c, *, search_is_result=False, notfound_returns_end=False, no_neighbour_probes=False,
          no_store_on_neighbour=False, signed_guard_on_next=False, bound_uses_result_count=False):
    """The port's logic, with one deliberate mis-read switched on."""
    hint, result = c["hint"], c["result"]
    search = result if search_is_result else c["search"]
    v = c["v"]
    rn = len(result)
    bound = rn if bound_uses_result_count else len(search)

    def probe(i):
        return 0 <= i < bound and i < len(search) and search[i] == v

    if probe(hint):
        return [hint, hint]                       # @0x2fe4c: no write-back (already this value)
    if not no_neighbour_probes:
        if hint > 0 and probe(hint - 1):
            return [hint - 1, hint if no_store_on_neighbour else hint - 1]
        if (not signed_guard_on_next or hint > 0) and probe(hint + 1):
            return [hint + 1, hint if no_store_on_neighbour else hint + 1]
    if rn == 0:
        return [0, 0]
    for i in range(rn):
        if result[i] == v:
            return [i, i]
    return [rn if notfound_returns_end else 0, rn]


CONTROLS = [
    ("fast paths search the +0x48 array instead of +0x58", dict(search_is_result=True)),
    ("hint bounded by the +0x48 count instead of the +0x58 one", dict(bound_uses_result_count=True)),
    ("not-found returns the END iterator instead of begin", dict(notfound_returns_end=True)),
    ("neighbour probes dropped (hint-1 / hint+1)", dict(no_neighbour_probes=True)),
    ("neighbour hits do NOT write back +0x80", dict(no_store_on_neighbour=True)),
    ("hint+1 probe also gated by the SIGNED hint > 0 test", dict(signed_guard_on_next=True)),
]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, "ProChannel.framework", "ProChannel"))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_void_p
    fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    # Distinct, stable pointer identities for the pool (never dereferenced by the method).
    pool_bufs = [ctypes.create_string_buffer(8) for _ in range(1000)]
    pool = {}
    for pid in list(range(POOL_N)) + [100, 101, 102, 103, 999]:
        pool[pid] = ctypes.addressof(pool_bufs[pid % len(pool_bufs)]) + pid

    cases = build_cases()
    native = run_native(cases, fn, pool)
    ts = run_ts(cases)
    bad = [(i, native[i], ts[i]) for i in range(len(cases)) if native[i] != ts[i]]
    print(f"cases={len(cases)}  divergences={len(bad)}  (each case compares BOTH the returned "
          f"index and the +0x80 write-back)")
    for i, nv, tv in bad[:10]:
        print(f"  case {i}: native={nv} ts={tv}  {cases[i]}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; a good corpus must reject all):")
    for name, kw in CONTROLS:
        wrong = sum(1 for c, v in zip(cases, native) if model(c, **kw) != v)
        print(f"  {wrong:5d}/{len(cases)} wrong — {name}")

    print("VERIFIED vs live ProChannel" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
