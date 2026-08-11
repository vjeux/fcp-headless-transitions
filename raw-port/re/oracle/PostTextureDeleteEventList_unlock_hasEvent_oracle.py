#!/usr/bin/env python3
"""PostTextureDeleteEventList_unlock_hasEvent_oracle.py — executable differential for
PR #178 (rework), against the LIVE Helium binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PostTextureDeleteEventList_unlock_hasEvent_oracle.py

WHY THIS EXISTS. Reviewer-5 rejected PR #178 for a FABRICATED RETURN VALUE:
`unlock()` @Helium 0x42c30 is `popq %rbp ; jmp _pthread_mutex_unlock`, so the frame is
torn down BEFORE the transfer and the callee's %eax IS this function's %eax — while the
port returned a hard-coded 0, a constant no instruction produces. That is a claim about
the machine, so it is settled by executing the machine, not by re-reading the listing.

Both symbols are `T` (exported) in raw-port/army/inventory/Helium.syms.txt, so dlsym
reaches them directly once Helium is loaded through the depth-first @rpath preloader.

ARCHITECTURE. Everything runs under `arch -x86_64` because every @0xADDR in the port is
an x86_64 offset while this box is arm64 (OPS_LOG: "the executable oracle calls the wrong
architecture, and fails toward ACCEPT"). The module refuses to run natively.

WHAT IS AND IS NOT PROVEN. `unlock()` is one tail jmp into libSystem, so the property
under test is the ABI one: whatever `pthread_mutex_unlock` returns comes back out of
`unlock()` unchanged. Test 1 measures that on the DEFAULT mutex this class actually
constructs (attr = NULL @0x47f70). Test 2 forces a NON-ZERO return with an
ERRORCHECK mutex — that is not the mutex the class builds, and it is not claimed to be;
it is the only way to make the forwarding observable at all, and it is exactly the case
that separates "forwards the callee's %eax" from "returns 0". Read test 2 as a probe of
the calling convention, not as a claim about PostTextureDeleteEventList's own mutex.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, HERE)
from ozone_loader import load_framework, require_x86_64  # noqa: E402

require_x86_64()

UNLOCK_SYM = "_ZN16HGTextureManager26PostTextureDeleteEventList6unlockEv"    # no leading _
HASEVENT_SYM = "_ZN16HGTextureManager26PostTextureDeleteEventList8hasEventEv"
LOCK_SYM = "_ZN16HGTextureManager26PostTextureDeleteEventList4lockEv"

SIZEOF_MUTEX = 0x40          # +0x00..+0x3f, pinned by the next initialised member at +0x40
SIZEOF_OBJ = 0x58            # +0x40/+0x48/+0x50 vector triple
POISON = 0xCD

helium = load_framework("Helium")
libc = ctypes.CDLL(None)

for lib, name, restype, argtypes in (
    (helium, UNLOCK_SYM, ctypes.c_int, [ctypes.c_void_p]),
    (helium, HASEVENT_SYM, ctypes.c_ubyte, [ctypes.c_void_p]),
    (helium, LOCK_SYM, ctypes.c_int, [ctypes.c_void_p]),
    (libc, "pthread_mutex_init", ctypes.c_int, [ctypes.c_void_p, ctypes.c_void_p]),
    (libc, "pthread_mutex_lock", ctypes.c_int, [ctypes.c_void_p]),
    (libc, "pthread_mutex_unlock", ctypes.c_int, [ctypes.c_void_p]),
    (libc, "pthread_mutexattr_init", ctypes.c_int, [ctypes.c_void_p]),
    (libc, "pthread_mutexattr_settype", ctypes.c_int, [ctypes.c_void_p, ctypes.c_int]),
):
    fn = getattr(lib, name)
    fn.restype, fn.argtypes = restype, argtypes

fcp_unlock = getattr(helium, UNLOCK_SYM)
fcp_hasEvent = getattr(helium, HASEVENT_SYM)
fcp_lock = getattr(helium, LOCK_SYM)

PTHREAD_MUTEX_ERRORCHECK = 1     # /usr/include/pthread.h


def _obj():
    """A poisoned 0x58-byte receiver — every byte 0xCD, so any store the callee makes
    outside the words we set shows up in the after-diff."""
    return ctypes.create_string_buffer(bytes([POISON]) * SIZEOF_OBJ, SIZEOF_OBJ)


def _u64(buf, off):
    return int.from_bytes(bytes(buf)[off:off + 8], "little")


def _set_u64(buf, off, val):
    ctypes.memmove(ctypes.byref(buf, off), val.to_bytes(8, "little"), 8)


# ---------------------------------------------------------------------------------
# TEST 1 — unlock() on the DEFAULT mutex the class constructs (attr = NULL @0x47f70)
# ---------------------------------------------------------------------------------
def test_unlock_default():
    cases = []
    for state in ("held", "not-held"):
        m = _obj()                                   # `this` IS the mutex (offset +0x00)
        assert libc.pthread_mutex_init(ctypes.byref(m), None) == 0
        if state == "held":
            assert libc.pthread_mutex_lock(ctypes.byref(m)) == 0
        # ground truth: what does libSystem itself answer for this exact state?
        probe = _obj()
        assert libc.pthread_mutex_init(ctypes.byref(probe), None) == 0
        if state == "held":
            assert libc.pthread_mutex_lock(ctypes.byref(probe)) == 0
        native = libc.pthread_mutex_unlock(ctypes.byref(probe))
        got = fcp_unlock(ctypes.byref(m))
        cases.append({"state": state, "native": native, "fcp": got, "agree": native == got})
    return cases


# ---------------------------------------------------------------------------------
# TEST 2 — unlock() forced to return NON-ZERO (ERRORCHECK mutex).
# This is the case that discriminates "forwards %eax" from "returns 0".
# ---------------------------------------------------------------------------------
def test_unlock_nonzero():
    attr = ctypes.create_string_buffer(64)
    assert libc.pthread_mutexattr_init(ctypes.byref(attr)) == 0
    assert libc.pthread_mutexattr_settype(ctypes.byref(attr), PTHREAD_MUTEX_ERRORCHECK) == 0
    m = _obj()
    assert libc.pthread_mutex_init(ctypes.byref(m), ctypes.byref(attr)) == 0
    probe = _obj()
    assert libc.pthread_mutex_init(ctypes.byref(probe), ctypes.byref(attr)) == 0
    native = libc.pthread_mutex_unlock(ctypes.byref(probe))     # never locked -> EPERM
    got = fcp_unlock(ctypes.byref(m))
    return {"native": native, "fcp": got, "agree": native == got, "nonzero": got != 0}


# ---------------------------------------------------------------------------------
# TEST 3 — hasEvent(): the +0x40 / +0x48 comparison, and that NOTHING else is touched
# ---------------------------------------------------------------------------------
CORPUS = [
    (0x0000000000000000, 0x0000000000000000),   # freshly constructed: begin == end == 0
    (0x0000000000000000, 0x0000000000000008),   # one pending event
    (0x0000600000004000, 0x0000600000004000),   # equal, realistic heap addresses
    (0x0000600000004000, 0x0000600000004008),   # differ in the low byte only
    (0x0000600000004008, 0x0000600000004000),   # REVERSED: kills an ordering-compare mutant
    (0x00007fff00000000, 0x00007fff00000000),
    (0x00007fff00000000, 0x0000000000000001),
    (0x0000000000000001, 0x0000000000000000),   # begin > end, still just "not empty"
    (0x000000000000ff00, 0x000000000000ff01),
    (0x0001000000000000, 0x0001000000000000),
]


def test_hasEvent():
    cases, touched = [], []
    for begin, end in CORPUS:
        o = _obj()
        _set_u64(o, 0x40, begin)
        _set_u64(o, 0x48, end)
        before = bytes(o)
        got = fcp_hasEvent(ctypes.byref(o))
        after = bytes(o)
        diffs = [i for i in range(SIZEOF_OBJ) if before[i] != after[i]]
        touched.append(diffs)
        cases.append({"begin": begin, "end": end, "fcp": bool(got & 1), "raw_al": int(got)})
    return cases, touched


# ---------------------------------------------------------------------------------
# TS side — the REAL module, plus the mutants, in ONE node process
# ---------------------------------------------------------------------------------
def ts_side(unlock_codes, hasEvent_cases):
    req = {
        "unlock": [{"rc": rc} for rc in unlock_codes],
        "hasEvent": [{"begin": c["begin"], "end": c["end"]} for c in hasEvent_cases],
    }
    driver = os.path.join(HERE, "PostTextureDeleteEventList_unlock_hasEvent_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(req), capture_output=True, text=True)
    if p.returncode != 0:
        print("TS DRIVER FAILED:\n" + p.stderr, file=sys.stderr)
        sys.exit(2)
    return json.loads(p.stdout)


def main():
    print("=" * 78)
    print("PostTextureDeleteEventList::unlock @Helium 0x42c30 / ::hasEvent @Helium 0x48070")
    print("differential vs the live Helium binary, x86_64 slice under Rosetta")
    print("=" * 78)

    u_default = test_unlock_default()
    u_nonzero = test_unlock_nonzero()
    h_cases, h_touched = test_hasEvent()

    unlock_codes = [c["native"] for c in u_default] + [u_nonzero["native"]]
    ts = ts_side(unlock_codes, h_cases)

    ok = True

    print("\n-- TEST 1  unlock(), DEFAULT mutex (the one the ctor builds) --")
    for c in u_default:
        print(f"   {c['state']:9s}  pthread_mutex_unlock -> {c['native']}   "
              f"FCP unlock() -> {c['fcp']}   {'OK' if c['agree'] else 'DIVERGE'}")
        ok &= c["agree"]

    print("\n-- TEST 2  unlock(), ERRORCHECK mutex (forces a non-zero return) --")
    print(f"   never-locked  pthread_mutex_unlock -> {u_nonzero['native']}   "
          f"FCP unlock() -> {u_nonzero['fcp']}   "
          f"{'OK' if u_nonzero['agree'] else 'DIVERGE'}")
    ok &= u_nonzero["agree"]
    if not u_nonzero["nonzero"]:
        print("   !! the forced case still returned 0 — this run proves nothing about "
              "forwarding; the harness is blind here, do not read TEST 2 as evidence")
        ok = False

    print("\n-- TS port forwards the native code (same three codes) --")
    for rc, got in zip(unlock_codes, ts["unlock"]):
        agree = rc == got
        print(f"   native {rc:3d}  ->  port returns {got:3d}   {'OK' if agree else 'DIVERGE'}")
        ok &= agree

    print("\n-- TEST 3  hasEvent() over %d cases --" % len(h_cases))
    n_bad = 0
    for c, tsv, diffs in zip(h_cases, ts["hasEvent"], h_touched):
        agree = c["fcp"] == tsv and not diffs
        n_bad += (not agree)
        if not agree:
            print(f"   DIVERGE begin={c['begin']:#x} end={c['end']:#x} "
                  f"fcp={c['fcp']} ts={tsv} bytes_touched={diffs}")
    print(f"   {len(h_cases) - n_bad}/{len(h_cases)} bit-exact, and 0 bytes of the poisoned "
          f"0x58 arena modified in every case"
          if not any(h_touched) else f"   {len(h_cases) - n_bad}/{len(h_cases)} agree; "
          f"SOME CASE WROTE TO THE ARENA: {h_touched}")
    ok &= (n_bad == 0)

    print("\n-- NEGATIVE CONTROLS (a live control must be non-zero, or the harness is blind) --")
    m = ts["mutants"]
    k_m1 = sum(1 for rc, got in zip(unlock_codes, m["unlock_M1_constant_zero"]) if rc != got)
    k_m2 = sum(1 for rc, got in zip(unlock_codes, m["unlock_M2_negated"]) if rc != got)
    k_m3 = sum(1 for c, got in zip(h_cases, m["hasEvent_M3_inverted"]) if c["fcp"] != got)
    k_m4 = sum(1 for c, got in zip(h_cases, m["hasEvent_M4_lessthan"]) if c["fcp"] != got)
    n_u, n_h = len(unlock_codes), len(h_cases)
    print(f"   M1 unlock returns a constant 0  (== the code PR #178 shipped)  killed {k_m1}/{n_u}")
    print(f"   M2 unlock negates the code                                     killed {k_m2}/{n_u}")
    print(f"   M3 hasEvent reads `setne` as `sete`                            killed {k_m3}/{n_h}")
    print(f"   M4 hasEvent reads the ZF compare as `setb`                     killed {k_m4}/{n_h}")
    for label, k in (("M1", k_m1), ("M2", k_m2), ("M3", k_m3), ("M4", k_m4)):
        if k == 0:
            print(f"   !! {label} scored 0 — say which it is: a BLIND harness, or an "
                  f"EQUIVALENT mutant. Do not record this run as a clean one.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — every case bit-exact, every control live"
                  if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
