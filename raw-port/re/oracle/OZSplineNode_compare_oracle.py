#!/usr/bin/env python3
"""Differential oracle for OZSplineNode::compare(OZCurveNode const*) const
   @ProChannel 0x2a26e  (__ZNK12OZSplineNode7compareEPK11OZCurveNode)
   — and, through it, for OZSplineNode::operator== @0x2a34e, which tail-jumps to it.

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/OZSplineNode_compare_oracle.py

WHY THIS EXISTS AND WHAT IT ADDS TO THE PROBE NEXT TO IT.
`OZSplineNode_operatorEquals_probe.py` measures the MACHINE (which register goes where through a
tail-jump) and never imports the shipped TypeScript, so it cannot detect a defect in the file. That
is the shape reviewer 1 flagged on #644, and it is the shape 66 of the 117 harnesses on main have.
This one drives `raw-port/src/nodes/OZSplineNode.ts` itself, through `tsx`, and compares its return
value against the live ProChannel function on identical objects in real process memory.

Rosetta is required and enforced: every @0xADDR here is an x86_64 offset.

HOW THE OBJECTS ARE BUILT. `compare` is not a leaf — it goes through `___dynamic_cast`, so the
objects it is handed must carry REAL RTTI or the cast decides nothing. Each fake node is a 0x40-byte
buffer whose +0x00 is set to the class's INSTALLED VTABLE POINTER in the mapped image
(OZSplineNode 0xd4fe0, from the ctor's `leaq 0xab30e(%rip)` @0x29ccb; OZConstantNode 0xd4e28, from
its own ctor @0x029962) — so libc++abi walks the real type_info and the cast answers for real. The
remaining fields are the ones the two compares read: +0x08 `value` and +0x10 `defaultValue`
(doubles, the OZConstantNode base sub-object at offset 0) and +0x18 the `OZSpline*`.

WHAT IS NOT COVERED, said out loud. The both-splines-non-null case reaches
`OZSpline::operator==` @0x2d5b2, which on the TS side is a LANDED THROW-STUB
(raw-port/src/channels/OZSpline.m0.ts). There is nothing to compare there yet, and feeding the live
function two fabricated 0xb0-byte OZSplines would be measuring a crash, so those cases are excluded
BY CONSTRUCTION rather than silently absent — 5 of the function's 6 outcomes are covered, and the
6th is named here and in the port. The `spline`-pointer arithmetic that DECIDES between them
(`sete`/`orb`/`orq`+`sete` @0x2a2b9..0x2a2d1) is fully covered.
"""
import ctypes
import json
import os
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

SYM = "__ZNK12OZSplineNode7compareEPK11OZCurveNode"
ADDR = 0x2A26E
# pushq %rbp ; movq %rsp,%rbp ; pushq %r15 ; pushq %r14 ; pushq %r12 ; pushq %rbx ;
# movq %rdi,%r14 ; testq %rsi,%rsi ; je
BODY = bytes([0x55, 0x48, 0x89, 0xE5, 0x41, 0x57, 0x41, 0x56, 0x41, 0x54, 0x53,
              0x49, 0x89, 0xFE, 0x48, 0x85, 0xF6, 0x74])
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle", "OZSplineNode_compare_driver.ts")

VT_SPLINENODE = 0xD4FE0     # installed vtable ptr, ctor @0x29ccb `leaq 0xab30e(%rip)`
VT_CONSTNODE = 0xD4E28      # installed vtable ptr, OZConstantNode ctor @0x029962
OBJ = 0x40
O_VPTR, O_VALUE, O_DEFAULT, O_SPLINE = 0x00, 0x08, 0x10, 0x18

NAN = float("nan")

# (name, thisValue, thisDefault, thisSplineNonNull, otherKind, otherValue, otherDefault,
#  otherSplineNonNull)
#   otherKind: "null" | "spline" | "const"   ("const" = an OZConstantNode, i.e. the dynamic_cast
#   to OZSplineNode must FAIL while the base compare succeeds)
CASES = [
    ("other=NULL",                    1.5, 2.5, False, "null",   0.0, 0.0, False),
    ("other=NULL, this has spline",   1.5, 2.5, True,  "null",   0.0, 0.0, False),
    ("other is OZConstantNode, equal",1.5, 2.5, False, "const",  1.5, 2.5, False),
    ("other is OZConstantNode, diff", 1.5, 2.5, False, "const",  9.0, 2.5, False),
    ("spline node, both splines null",1.5, 2.5, False, "spline", 1.5, 2.5, False),
    ("spline node, value differs",    1.5, 2.5, False, "spline", 1.5000001, 2.5, False),
    ("spline node, default differs",  1.5, 2.5, False, "spline", 1.5, -2.5, False),
    ("spline node, this spline set",  1.5, 2.5, True,  "spline", 1.5, 2.5, False),
    ("spline node, other spline set", 1.5, 2.5, False, "spline", 1.5, 2.5, True),
    ("NaN value both sides",          NAN, 2.5, False, "spline", NAN, 2.5, False),
    ("NaN default this side",         1.5, NAN, False, "spline", 1.5, 2.5, False),
    ("-0.0 vs +0.0 value",            -0.0, 2.5, False, "spline", 0.0, 2.5, False),
    ("both zero, both splines null",  0.0, 0.0, False, "spline", 0.0, 0.0, False),
    ("huge values equal",             1e308, -1e308, False, "spline", 1e308, -1e308, False),
    ("inf equal",         float("inf"), 2.5, False, "spline", float("inf"), 2.5, False),
]


def build(slide, vt, value, default, spline_ptr):
    buf = ctypes.create_string_buffer(OBJ)
    struct.pack_into("<Q", buf, O_VPTR, slide + vt)
    struct.pack_into("<d", buf, O_VALUE, value)
    struct.pack_into("<d", buf, O_DEFAULT, default)
    struct.pack_into("<Q", buf, O_SPLINE, spline_ptr)
    return buf


def run_native(fn, slide):
    out = []
    # A stand-in for an OZSpline: on the paths this harness covers `compare` only ever tests these
    # pointers for NULL-ness, so a distinct non-null address is all the machine needs. Allocated
    # once, outside the loop, so the buffers cannot be collected while a call is in flight.
    fake_a = ctypes.create_string_buffer(0xB0)
    fake_b = ctypes.create_string_buffer(0xB0)
    for (_name, tv, td, tsp, kind, ov, od, osp) in CASES:
        this = build(slide, VT_SPLINENODE, tv, td, ctypes.addressof(fake_a) if tsp else 0)
        other = None
        if kind != "null":
            vt = VT_SPLINENODE if kind == "spline" else VT_CONSTNODE
            other = build(slide, vt, ov, od, ctypes.addressof(fake_b) if osp else 0)
        other_addr = ctypes.addressof(other) if other is not None else 0
        out.append(fn(ctypes.addressof(this), other_addr))
    return out


PORT_SRC = os.path.join(REPO, "raw-port", "src", "nodes", "OZSplineNode.ts")
MUTANT_DIR = "/tmp/fct_ozsplinenode_mutants"

# EACH MUTANT IS A TEXTUAL EDIT OF THE SHIPPED FILE, not of a restatement of it inside this harness:
# a control that mutates the harness's own copy of the logic proves nothing about what ships.
MUTATIONS = {
    "drop-cast": ("    if (cast === null) return 0;\n", ""),
    "drop-base": ("    if (base === 0) return 0;\n", ""),
    "both-null-inverted": ("    if (eitherNull) return bothNull ? 1 : 0;",
                           "    if (eitherNull) return bothNull ? 0 : 1;"),
}


def mutate_port(key):
    """Write a mutated copy of the SHIPPED file and return its path.

    The copy lives outside src/ so no gate or tsconfig ever sees it; its two relative imports are
    rewritten to absolute paths so it still binds to the same landed siblings.
    """
    old, new = MUTATIONS[key]
    src = open(PORT_SRC).read()
    if src.count(old) != 1:
        raise SystemExit(f"mutation '{key}' does not apply to the shipped file "
                         f"({src.count(old)} matches) — the harness is stale, which would show up "
                         f"as a dead mutant and must not be read as one")
    src = src.replace(old, new)
    nodes = os.path.join(REPO, "raw-port", "src", "nodes")
    channels = os.path.join(REPO, "raw-port", "src", "channels")
    src = src.replace('from "./OZConstantNode.js"', f'from "{nodes}/OZConstantNode.js"')
    src = src.replace('from "../channels/OZSpline.m0.js"', f'from "{channels}/OZSpline.m0.js"')
    os.makedirs(MUTANT_DIR, exist_ok=True)
    path = os.path.join(MUTANT_DIR, f"OZSplineNode.{key}.ts")
    with open(path, "w") as f:
        f.write(src)
    return path


def run_ts(mutant=""):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    wire = [{"name": n, "thisValue": tv, "thisDefault": td, "thisSpline": tsp,
             "otherKind": k, "otherValue": ov, "otherDefault": od, "otherSpline": osp}
            for (n, tv, td, tsp, k, ov, od, osp) in CASES]
    # floats cross as raw bit patterns: json.dump emits bare NaN/Infinity, which JSON.parse rejects
    for w in wire:
        for key in ("thisValue", "thisDefault", "otherValue", "otherDefault"):
            w[key] = "%016x" % struct.unpack("<Q", struct.pack("<d", w[key]))[0]
    env = dict(os.environ)
    if mutant:
        env["FCT_PORT_PATH"] = mutate_port(mutant)
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"), env=env, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        if mutant:
            # A MUTANT THAT CRASHES IS A DIVERGENCE, NOT A BROKEN HARNESS. `drop-cast` deletes the
            # null test guarding `cast.spline`, so the mutated port throws where the machine
            # returns 0 — "produced no answer" is as divergent as "produced the wrong answer", and
            # treating it as a harness failure would have hidden a live control behind an abort.
            return None
        raise SystemExit("TS driver failed:\n" + p.stdout[-4000:] + p.stderr[-4000:])
    return json.loads(p.stdout.strip().splitlines()[-1])


def main():
    ozone_loader.require_x86_64()
    fn, addr, slide = ozone_loader.local_fn(
        "ProChannel", SYM, ctypes.c_int, [ctypes.c_void_p, ctypes.c_void_p])
    live = ctypes.string_at(slide + ADDR, len(BODY))
    ident = (addr == ADDR) and live == BODY
    print(f"identity: nm addr 0x{addr:x} == 0x{ADDR:x}; opcodes {live.hex()} "
          f"expected {BODY.hex()}  match={ident}")

    native = run_native(fn, slide)
    ts = run_ts()
    bad = 0
    print(f"{'case':34s} {'live':>5s} {'ts':>5s}")
    for (name, *_), a, b in zip(CASES, native, ts):
        mark = "" if a == b else "   <-- DIVERGED"
        if a != b:
            bad += 1
        print(f"  {name:32s} {a:5d} {b:5d}{mark}")

    print("HARNESS LIVENESS (M0 is the unmutated port and must be 0; the rest MUST diverge):")
    m0 = sum(1 for a, b in zip(native, run_ts()) if a != b)
    print(f"  M0 {m0:3d} divergent cases — the port as shipped, re-run through the same wire")
    muts = {
        "drop-cast": "the dynamic_cast<OZSplineNode*> null check @0x2a2b3 removed",
        "drop-base": "the OZConstantNode::compare result @0x2a2ae ignored",
        "both-null-inverted": "the both-null result @0x2a2d1 negated",
    }
    live_ok = m0 == 0
    for key, why in muts.items():
        got = run_ts(key)
        if got is None:
            print(f"  {key:18s} CRASHED — {why} (the mutated port throws where the machine returns "
                  f"a value; that is a divergence on every case)")
            continue
        n = sum(1 for a, b in zip(native, got) if a != b)
        print(f"  {key:18s} {n:3d} divergent cases — {why}")
        if n == 0:
            live_ok = False
            print(f"     !! DEAD MUTANT: '{key}' changed nothing the corpus can see. Either the "
                  f"mutant is equivalent on these cases or the comparison is blind — here it is "
                  f"the CORPUS: add a case that reaches it.")

    ok = ident and bad == 0 and live_ok
    print("NOT COVERED, by construction: both splines non-null -> OZSpline::operator== @0x2d5b2, "
          "a landed throw-stub on the TS side. 5 of 6 outcomes covered; the pointer arithmetic "
          "that selects between them is.")
    print("VERIFIED vs live ProChannel" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
