#!/usr/bin/env python3
"""getCodecGroup_oracle.py — differential: the SHIPPED TypeScript port vs the
LIVE Flexo function, over every reachable window offset.

  arch -x86_64 /usr/bin/python3 raw-port/re/oracle/getCodecGroup_oracle.py

WHAT THIS PROVES, AND WHY IT EXISTS
-----------------------------------
`getCodecGroup` @Flexo 0xe42290 (`__Z13getCodecGroupj`) is a `nm` type `t`
LOCAL symbol, so `dlsym` cannot see it. It is still callable: OPS_LOG's
recipe (inventory vmaddr + `_dyld_get_image_vmaddr_slide`, through
`ozone_loader.local_fn`) reaches it, so "the symbol is local" is not a reason
to sign this port on reading alone.

The defect this harness was written for was found by a REVIEWER of PR #82 who
compared the port against a Python model written from the same disassembly.
That is a real check, but a model and a port can share a misreading. This one
compares against the MACHINE.

THE DEFECT (fixed in the same commit as this file):
  @0xe4236e movl $0x18,%ecx ; @0xe42373 btq %rax,%rcx ; @0xe42377 jae 0xe423af
  `btq` tests bit (rax mod 64) of a 64-bit register, and the only guard above
  is `cmpl $0x3f,%eax ; ja` @0xe4231b, so eax 32..63 reaches it. The port
  wrote that as `(0x18 >>> eax) & 1`; JS masks a `>>>` COUNT to 5 bits, so it
  answered bit (eax & 31) instead. Four inputs diverge.

CONTROLS (a verdict with no dead controls — OPS_LOG "a dead negative control
means your harness is blind or your mutant is equivalent"): each mutant is
produced by an exact string substitution on the SHIPPED source, so it is
provably one token away from what ships, and each is reported with its own
divergence count. M1 is the pre-fix line and MUST diverge on exactly the four
inputs the reviewer named; a 0 there means this harness is not looking.

BIT PATTERNS, NOT LANGUAGE VALUES: everything crossing the wire here is a
uint32 (a FourCC), exchanged as a JSON integer, so there is no float/NaN
round-trip hazard. `>>> 0` on the TS side and `& 0xffffffff` here keep both
sides in the same unsigned domain.
"""
import ctypes, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # raw-port/
sys.path.insert(0, HERE)
import ozone_loader                                     # noqa: E402

FW, SYM, VMADDR = "Flexo", "__Z13getCodecGroupj", 0xE42290
PORT_TS = os.path.join(ROOT, "src", "channels", "getCodecGroup.ts")
DRIVER = os.path.join(HERE, "getCodecGroup_driver.mts")
SLICE = "/tmp/Flexo.x86_64"

# The first 16 bytes of the function, read straight out of the thin x86_64
# slice at file offset 0xe42290 (VA == file offset there). The harness refuses
# to trust a call whose target does not start with these — the self-check
# OPS_LOG asks for when calling a LOCAL symbol by computed address.
def expected_prologue():
    with open(SLICE, "rb") as f:
        f.seek(VMADDR)
        return f.read(16)


def corpus():
    """Every reachable offset of every window, plus the constants and the
    tree's comparison boundaries. The point is total coverage of the branch
    structure, not volume."""
    xs = set()
    windows = [
        0x61693132,  # 'ai12' — 64-wide window @0xe42315 (the btq pair)
        0x61693532,  # 'ai52' — 64-wide window @0xe422b0 (same shared tail)
        0x61707268,  # 'aprh' — 17-wide, mask 0x108c1
        0x61706368,  # 'apch' — 12-wide, mask 0x8c1
        0x64766832,  # 'dvh2' — 5-wide
    ]
    for base in windows:
        for off in range(-2, 67):          # past both ends of every window
            xs.add((base + off) & 0xFFFFFFFF)
    for c in (0x61707267, 0x61693531, 0x61703467, 0x61693532, 0x6D78336D,
              0x61707268, 0x6D78346F, 0x6D78336E, 0x6D783370, 0x6D78346E,
              0x61693132, 0x61693570, 0x61706368, 0x61703468, 0x64766832,
              0x64766836, 0x61693536, 0x6D783470, 0x6D78356E, 0x6D783570,
              0x61703478):
        for d in (-1, 0, 1):
            xs.add((c + d) & 0xFFFFFFFF)
    # the four the reviewer named, explicitly, so they can never fall out
    for c in (0x61693155, 0x61693156, 0x61693555, 0x61693556):
        xs.add(c)
    xs.update((0, 1, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF))
    import random
    random.seed(0xC0DEC)                    # deterministic corpus
    xs.update(random.getrandbits(32) for _ in range(2000))
    return sorted(xs)


def run_driver(module_path, inputs):
    p = subprocess.run(
        ["node", "--experimental-strip-types", DRIVER, module_path],
        input=json.dumps({"inputs": inputs}), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("driver failed for %s:\n%s\n%s"
                         % (module_path, p.stdout[-2000:], p.stderr[-2000:]))
    return json.loads(p.stdout)["out"]


# (name, what it breaks, exact substitution on the shipped source)
MUTANTS = [
    ("M1 pre-fix 32-bit shift (the reviewed defect)",
     "((0x18n >> BigInt(eax)) & 1n) === 0n", "((0x18 >>> eax) & 1) === 0"),
    ("M2 the OTHER btq narrowed to 32 bits",
     "((MASK >> BigInt(eax)) & 1n) === 0n",
     "((Number(MASK & 0xffffffffn) >>> eax) & 1) === 0"),
    ("M3 window bound 0x3f -> 0x1f",
     "if (eax > 0x3f) return edi;", "if (eax > 0x1f) return edi;"),
    ("M4 bit-test polarity flipped",
     "((0x18n >> BigInt(eax)) & 1n) === 0n",
     "((0x18n >> BigInt(eax)) & 1n) !== 0n"),
]


def main():
    ozone_loader.require_x86_64()
    fn, addr, slide = ozone_loader.local_fn(
        FW, SYM, ctypes.c_uint32, [ctypes.c_uint32])
    assert addr == VMADDR, "inventory moved: %#x != %#x" % (addr, VMADDR)

    want = expected_prologue()
    got = ctypes.string_at(slide + addr, 16)
    if got != want:
        raise SystemExit("SELF-CHECK FAILED — bytes at slide+%#x are %s, the "
                         "slice has %s. Refusing to report a differential "
                         "against an unknown function."
                         % (addr, got.hex(), want.hex()))
    print("self-check OK: %s @ slide %#x + %#x, prologue %s"
          % (SYM, slide, addr, got.hex()))

    xs = corpus()
    live = [fn(x) & 0xFFFFFFFF for x in xs]
    print("live Flexo: %d cases" % len(xs))

    src = open(PORT_TS).read()
    results = {}
    with tempfile.TemporaryDirectory() as td:
        shipped = os.path.join(td, "shipped.ts")
        open(shipped, "w").write(src)          # byte-identical to what ships
        results["SHIPPED"] = run_driver(shipped, xs)
        for name, old, new in MUTANTS:
            if old not in src:
                raise SystemExit("mutant %r no longer applies — the line it "
                                 "edits has changed; fix the harness rather "
                                 "than reporting a control that cannot fire."
                                 % name)
            mp = os.path.join(td, "m%d.ts" % len(results))
            open(mp, "w").write(src.replace(old, new, 1))
            results[name] = run_driver(mp, xs)

    def diffs(got):
        return [(x, g, l) for x, g, l in zip(xs, got, live) if g != l]

    ok = True
    for name, got in results.items():
        d = diffs(got)
        tag = "VERIFIED" if not d else "DIVERGED"
        print("%-46s %s  %d/%d cases, %d divergences"
              % (name, tag, len(xs) - len(d), len(xs), len(d)))
        for x, g, l in d[:6]:
            print("      in %#010x  port %#010x  live %#010x" % (x, g, l))
        if name == "SHIPPED":
            ok = not d
        elif not d:
            print("      ^^ DEAD CONTROL: this mutant is either equivalent or "
                  "the harness is blind. Do not read the VERIFIED above as "
                  "evidence until this is explained.")
            ok = False
    print("\nVERDICT: %s" % ("VERIFIED — the shipped port is bit-exact against "
                             "live Flexo on every case, and every control "
                             "fired" if ok else "FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
