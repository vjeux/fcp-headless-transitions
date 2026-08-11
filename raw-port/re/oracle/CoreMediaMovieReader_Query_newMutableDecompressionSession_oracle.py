#!/usr/bin/env python3
"""Differential for
`CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() const`
@Flexo 0xdee040.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/\
CoreMediaMovieReader_Query_newMutableDecompressionSession_oracle.py

WHAT CAN AND CANNOT BE MEASURED, stated up front, because this port's callee is out of scope and a
harness that blurred the line would be the "implied control" failure this project keeps paying for:

  MEASURED, against the live Flexo image
    * the early-exit path (+0x58 non-NULL -> return NULL, no frame, nothing written);
    * the FIELD OFFSET, via a second function — `hasValidDecompressionSession()` @0xdecb90 is
      `cmpq $0x0, 0x58(%rdi) ; setne %al`, so calling it on the same arenas confirms that +0x58 is
      the field this port cites, and it discriminates (0 vs 1) on the identical CFUNCTYPE;
    * the create path with a NULL format description, executed IN A FORKED CHILD because it calls
      into VideoToolbox: the call fails, leaves the out-parameter NULL, and the function returns
      NULL. That is the `andb %cl,%dl` fall-through, run rather than reasoned about. A child that
      dies is reported INCONCLUSIVE — never as a pass.

  NOT MEASURED, and not claimed
    * the release branch (`create failed AND still produced a session`) needs a real decoder to
      reach. It is transcribed from the instructions and left for a reviewer to re-derive.

The TypeScript port raises at the VideoToolbox boundary by policy, so the value-for-value
comparison covers the early-exit path; the port is also asserted to THROW on the create path,
because the alternative failure — inventing a session and returning it — is exactly what a
boundary stub exists to prevent.
"""
import ctypes
import json
import os
import signal
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Flexo"
SYM = "__ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv"
SIB = "__ZNK26CoreMediaMovieReader_Query28hasValidDecompressionSessionEv"
ADDR, SIB_ADDR = 0xDEE040, 0xDECB90
THIS_SIZE = 0x300
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, ctypes.c_void_p, [ctypes.c_void_p])
sib, sib_va, _ = oz.local_fn(FW, SIB, ctypes.c_uint8, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}  sibling vmaddr=0x{sib_va:x}")
check("addresses", va == ADDR and sib_va == SIB_ADDR,
      f"0x{va:x} == the port's @0x{ADDR:x}; the field control is at @0x{sib_va:x}")

body = ctypes.string_at(slide + va, 7)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes", body[0:5] == b"\x48\x83\x7f\x58\x00" and body[5] == 0x74,
      "48 83 7f 58 00 | 74 — `cmpq $0x0, 0x58(%rdi)` then `je`: the null test on +0x58 is the "
      "FIRST instruction, before any frame is built")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 5) != b"\x48\x83\x7f\x58\x00",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

# ── the early-exit path, and the field-offset control ─────────────────────────────────────────
def arena(session_value, fmt_value=0):
    a = (ctypes.c_char * THIS_SIZE)(*([0xCD] * THIS_SIZE))
    ctypes.memmove(ctypes.byref(a, 0x08), ctypes.byref(ctypes.c_uint64(fmt_value)), 8)
    ctypes.memmove(ctypes.byref(a, 0x58), ctypes.byref(ctypes.c_uint64(session_value)), 8)
    return a


occupied = arena(0xBEEF0000)          # +0x58 non-NULL -> the early exit
before = bytes(occupied)
rc = fn(ctypes.byref(occupied))
check("an object that already has a session returns NULL", rc is None or rc == 0,
      f"the live function returned {rc!r} when +0x58 held 0xbeef0000 — the `new…` name "
      "notwithstanding, an occupied slot is declined")
check("the early exit writes nothing", bytes(occupied) == before,
      "the 0xCD-poisoned 0x300-byte receiver is byte-identical after the call")

empty = arena(0)
check("FIELD CONTROL: the sibling agrees about +0x58",
      sib(ctypes.byref(occupied)) == 1 and sib(ctypes.byref(empty)) == 0,
      "hasValidDecompressionSession() @0xdecb90 — an independent function reading the same "
      "offset — answers 1 for the occupied arena and 0 for the empty one, so +0x58 is confirmed "
      "by a second symbol and the harness can tell the two apart")

# ── the create path, in a forked child (it calls VideoToolbox) ────────────────────────────────
r, w = os.pipe()
pid = os.fork()
if pid == 0:
    try:
        got = fn(ctypes.byref(arena(0, 0)))          # NULL format description
        os.write(w, str(0 if got is None else got).encode())
        os._exit(0)
    except BaseException:
        os._exit(4)
os.close(w)
_, status = os.waitpid(pid, 0)
child_out = os.read(r, 64).decode()
if os.WIFSIGNALED(status):
    inconclusive("the create path runs",
                 f"the forked child died with signal {os.WTERMSIG(status)} calling into "
                 "VideoToolbox — the path was NOT measured")
elif os.WEXITSTATUS(status) != 0:
    inconclusive("the create path runs",
                 f"the forked child exited {os.WEXITSTATUS(status)} — the path was NOT measured")
else:
    check("the create path returns NULL when VideoToolbox refuses", child_out == "0",
          f"with the format description NULL, the live function returned {child_out} — "
          "VTDecompressionSessionCreate failed and left the out-parameter NULL, so the `andb` "
          "fall-through returns it unchanged rather than releasing anything")

# ── the TypeScript side ───────────────────────────────────────────────────────────────────────
PORT = os.path.join(REPO, "src", "infra", "CoreMediaMovieReader_Query.ts")
DRIVER = """
const mod = await import(process.argv[2]);
const occupied = new mod.CoreMediaMovieReader_Query();
occupied.sessionAt0x58 = { marker: "already here" };
const early = occupied.newMutableDecompressionSessionForCapabilityTesting();
const empty = new mod.CoreMediaMovieReader_Query();
let threw = null;
try { empty.newMutableDecompressionSessionForCapabilityTesting(); }
catch (e) { threw = String((e as Error).message); }
process.stdout.write(JSON.stringify({
  early, threw,
  source: mod.CoreMediaMovieReader_Query.prototype
            .newMutableDecompressionSessionForCapabilityTesting.toString(),
}));
"""
drv = os.path.join(HERE, ".rq_driver.mts")
open(drv, "w").write(DRIVER)
try:
    p = subprocess.run(["node", "--experimental-strip-types", drv, PORT],
                       capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        check("the TS port runs", False, f"node failed: {p.stderr[-600:]}")
    else:
        ts = json.loads(p.stdout)
        check("TS == live on the early-exit path", ts["early"] is None,
              "the port returns null for an object that already has a session, matching the live "
              "function's NULL")
        check("TS raises at the VideoToolbox boundary rather than inventing a session",
              ts["threw"] is not None and "VTDecompressionSessionCreate" in ts["threw"]
              and "0xdee073" in ts["threw"],
              f"create path throws: {(ts['threw'] or '')[:120]}")
        print("  the method the driver actually ran (first line): "
              + ts["source"].strip().splitlines()[0][:100])
finally:
    os.unlink(drv)

print()
print("CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() "
      "@Flexo 0xdee040 — "
      + ("VERIFIED as far as an out-of-scope callee allows: the early exit and the "
         "VideoToolbox-refused create path are executed against the live image and agree with the "
         "port, the +0x58 offset is confirmed by an independent sibling function, and the port "
         "raises at the boundary instead of fabricating a session. The release branch needs a real "
         "decoder and is explicitly NOT claimed."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
