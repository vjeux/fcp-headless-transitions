#!/usr/bin/env python3
"""OZSceneNode_hitCheck_oracle.py — differential for
`OZSceneNode::hitCheck(PCVector2<float> const&, OZRenderState const&, LiCamera const*,
PCVector3<double>&, unsigned int)` @Ozone 0x90e70 against the LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZSceneNode_hitCheck_oracle.py

Why this is worth running for a five-instruction function: the claim the port makes is not only
"it returns false", it is "it returns false FOR EVERY INPUT and writes nothing" — a base-class
virtual that silently touched its PCVector3<double> out-parameter, or answered from the receiver,
would be indistinguishable on reading. So every caller-owned buffer is poisoned to 0xCD, handed to
the real function, and byte-compared afterwards.

What it does:
  1. Loads Ozone from OUTSIDE the app bundle by walking `otool -L` depth-first and CDLL'ing each
     dependency by absolute path (OPS_LOG, worker 1) — Ozone resolves its @rpath chain only when
     its dependencies are already in the process. Requires x86_64: every address here is x86_64,
     and the arm64 slice is a different function body (the OPS_LOG slice trap).
  2. SELF-CHECK: reads the eight opcode bytes at the resolved address and requires
     `55 48 89 e5 31 c0 5d c3` = pushq %rbp / movq %rsp,%rbp / xorl %eax,%eax / popq %rbp / retq.
     A dlsym that resolved to something else, or a slice whose body differs, fails here rather than
     agreeing enthusiastically with the port.
  3. Calls it on 200 randomised argument sets, capturing the full 32-bit %eax and the post-call
     bytes of all five arenas.
  4. Runs the SAME cases through the real ported TypeScript (OZSceneNode.ts) via the vendored tsx,
     and compares return value AND out-parameter bit patterns.
  5. NEGATIVE CONTROLS, evaluated in the same TS process as the port: mutant A returns true,
     mutant B writes the hit point. The run FAILS unless both are caught — a harness that cannot
     fail proves nothing (OPS_LOG: "a lock that cannot fail is not a lock").

Exit 0 = VERIFIED, 1 = DIVERGED, 2 = INCONCLUSIVE (could not run — never read as a pass).
"""
import ctypes
import json
import os
import platform
import random
import struct
import subprocess
import sys

FCP = "/Applications/Final Cut Pro.app/Contents"
OZONE = FCP + "/Frameworks/Ozone.framework/Versions/A/Ozone"
SYM = "_ZN11OZSceneNode8hitCheckERK9PCVector2IfERK13OZRenderStatePK8LiCameraR9PCVector3IdEj"
ADDR = 0x90E70
# pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
EXPECT_BYTES = bytes([0x55, 0x48, 0x89, 0xE5, 0x31, 0xC0, 0x5D, 0xC3])

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))  # raw-port/
TSX = os.path.join(REPO, "node_modules", ".bin", "tsx")
DRIVER = os.path.join(HERE, "OZSceneNode_hitCheck_driver.mts")

N_CASES = 200
POISON = 0xCD
ARENA = 0x400  # receiver / render state / camera scratch, all poisoned
VEC3 = 24      # PCVector3<double>: x,y,z at +0x00/+0x08/+0x10

RPATHS = [
    FCP + "/Frameworks",
    FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
    FCP + "/PlugIns",
    FCP + "/Frameworks/ProApps",
]


def die(code, msg):
    print(msg)
    print("OZSceneNode::hitCheck @Ozone 0x90e70 -> " +
          {0: "VERIFIED", 1: "DIVERGED", 2: "INCONCLUSIVE"}[code])
    sys.exit(code)


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
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


def preload(path, loaded, failed, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, loaded, failed, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e).split(":")[-1].strip()[:60]))


def main():
    if platform.machine() != "x86_64":
        die(2, "REFUSING: running as %s — rerun under `arch -x86_64 /usr/bin/python3` "
               "(every address here is x86_64)" % platform.machine())
    if not os.path.exists(OZONE):
        die(2, "Ozone not found at %s" % OZONE)

    loaded, failed = set(), []
    preload(OZONE, loaded, failed)
    print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
    oz = ctypes.CDLL(OZONE, mode=ctypes.RTLD_GLOBAL)
    try:
        fn = getattr(oz, SYM)
    except AttributeError:
        die(2, "dlsym could not resolve %s" % SYM)

    # ---- self-check: are we really calling 0x90e70's body? -----------------------------------
    fn_addr = ctypes.cast(fn, ctypes.c_void_p).value
    got = ctypes.string_at(fn_addr, len(EXPECT_BYTES))
    slide = ctypes.CDLL(None)
    slide.dlsym.restype = ctypes.c_void_p
    print("resolved %s at 0x%x" % (SYM, fn_addr))
    print("opcode bytes: %s (expected %s)" % (got.hex(" "), EXPECT_BYTES.hex(" ")))
    if got != EXPECT_BYTES:
        die(2, "SELF-CHECK FAILED: the bytes at the resolved address are not the transcribed body")
    if (fn_addr & 0xFFFFF) != (ADDR & 0xFFFFF):
        print("note: image slide applied; low 20 bits of the address match 0x%x" % ADDR)

    fn.restype = ctypes.c_uint32  # the FULL %eax, not just %al — xorl clears all 32 bits
    fn.argtypes = [ctypes.c_void_p] * 5 + [ctypes.c_uint32]

    rnd = random.Random(0x90E70)
    cases, live = [], []
    for i in range(N_CASES):
        recv = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        state = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        cam = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        pt = ctypes.create_string_buffer(8)
        hp = ctypes.create_string_buffer(bytes([POISON]) * VEC3, VEC3)

        px = rnd.choice([0.0, -0.0, 1.0, -1.0, 0.5, 1e30, -1e30, float("inf"), float("nan"),
                         rnd.uniform(-4000.0, 4000.0)])
        py = rnd.choice([0.0, -0.0, 1.0, -1.0, 960.0, -540.0, float("nan"),
                         rnd.uniform(-4000.0, 4000.0)])
        struct.pack_into("<ff", pt, 0, px, py)
        flags = rnd.choice([0, 1, 2, 3, 0x7FFFFFFF, 0xFFFFFFFF, rnd.getrandbits(32)])
        pass_null_camera = (i % 7 == 0)

        before = (recv.raw, state.raw, cam.raw, pt.raw, hp.raw)
        ret = fn(ctypes.addressof(recv), ctypes.addressof(pt), ctypes.addressof(state),
                 None if pass_null_camera else ctypes.addressof(cam),
                 ctypes.addressof(hp), flags)
        after = (recv.raw, state.raw, cam.raw, pt.raw, hp.raw)

        live.append({
            "ret": ret,
            "arenas_unchanged": before == after,
            "hitPoint": [struct.unpack_from("<Q", hp, 8 * k)[0] for k in range(3)],
        })
        cases.append({
            "i": i,
            # the two float32 as they now sit in memory, so both sides see the same value
            "point": {"x": struct.unpack_from("<f", pt, 0)[0],
                      "y": struct.unpack_from("<f", pt, 4)[0]},
            "camera": not pass_null_camera,
            "flags": flags,
            "hitPoint": ["%016x" % struct.unpack_from("<Q", hp, 8 * k)[0] for k in range(3)],
        })

    n_nonzero = sum(1 for r in live if r["ret"] != 0)
    n_touched = sum(1 for r in live if not r["arenas_unchanged"])
    print("live: %d calls, %d returned non-zero, %d touched a caller-owned buffer"
          % (len(live), n_nonzero, n_touched))

    # ---- the TypeScript half: the REAL ported file, through tsx ------------------------------
    if not os.path.exists(TSX):
        die(2, "tsx not vendored at %s" % TSX)
    proc = subprocess.run([TSX, DRIVER], input=json.dumps(cases), capture_output=True, text=True)
    if proc.returncode != 0:
        die(2, "TS driver failed (exit %d):\n%s" % (proc.returncode, proc.stderr[-2000:]))
    ts = [json.loads(l) for l in proc.stdout.splitlines() if l.strip().startswith("{")]
    if len(ts) != len(cases):
        die(2, "TS driver returned %d rows for %d cases" % (len(ts), len(cases)))

    diverged, caught_a, caught_b = [], 0, 0
    for c, l, t in zip(cases, live, ts):
        live_hp = ["%016x" % v for v in l["hitPoint"]]
        if bool(l["ret"]) != bool(t["ret"]) or l["ret"] != (1 if t["ret"] else 0):
            diverged.append((c["i"], "ret live=%d ts=%s" % (l["ret"], t["ret"])))
        elif live_hp != t["hitPoint"]:
            diverged.append((c["i"], "hitPoint live=%s ts=%s" % (live_hp, t["hitPoint"])))
        elif not l["arenas_unchanged"]:
            diverged.append((c["i"], "live wrote into a poisoned caller-owned arena"))
        # negative controls: the SAME comparison must reject both mutants
        if (1 if t["mutA"]["ret"] else 0) != l["ret"]:
            caught_a += 1
        if t["mutB"]["hitPoint"] != live_hp:
            caught_b += 1

    print("mutation controls: mutant A (returns true) caught on %d/%d cases; "
          "mutant B (writes the hit point) caught on %d/%d cases"
          % (caught_a, len(cases), caught_b, len(cases)))
    if caught_a != len(cases) or caught_b != len(cases):
        die(2, "NEGATIVE CONTROL FAILED: the comparison did not reject a deliberately wrong port, "
               "so a PASS from it would mean nothing")

    if diverged:
        for i, why in diverged[:10]:
            print("  case %d: %s" % (i, why))
        die(1, "%d of %d cases diverged" % (len(diverged), len(cases)))

    print("%d/%d cases agree: live returns 0, TS returns false, and the PCVector3<double> "
          "out-parameter is byte-identical on both sides" % (len(cases), len(cases)))
    die(0, "")


if __name__ == "__main__":
    main()
