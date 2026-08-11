#!/usr/bin/env python3
"""OZMaterialSpecularLayer::specularShininessImageDeprecatedChannel() — the NON-VIRTUAL THUNK
@Ozone 0x497dc0 (`__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv`)
— live differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZMaterialSpecularLayer_thunk1224_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it: the harness loads Ozone through
`ozone_loader` (depth-first @rpath preload — Ozone does load outside the app bundle) and calls the
body at `dyld slide + 0x497dc0`, under Rosetta so the process runs the same x86_64 slice the port
was transcribed from. The opcode bytes at that address are checked against the transcription BEFORE
anything is called, which is what makes "we called the right function" a measurement rather than an
assumption.

WHAT IT PROVES, beyond "the number matches":
  * the returned value is `this + 0x2f18` for every probe pointer, including NULL and poison —
    `leaq` computes an ADDRESS, so the answer depends on nothing but the pointer;
  * the object is byte-identical afterwards, so the body reads and writes no memory;
  * six NEGATIVE CONTROLS, each of which the corpus must kill — in particular +0x33e0, the
    displacement of the PRIMARY-vtable body @0x497b50, which is the one plausible wrong answer here
    (0x33e0 - 0x2f18 = 0x4c8 = the 1224 in the symbol name);
  * the SHIPPED TypeScript agrees, driven through the repo's own `tsx`, with its own mutants.
"""
import ctypes, json, os, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz                                    # noqa: E402

SYM = "__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv"
VA = 0x497DC0
DISP = 0x2F18
# 55 pushq %rbp / 48 89 e5 movq %rsp,%rbp / 48 8d 87 <disp32> leaq disp(%rdi),%rax / 5d popq / c3 retq
WANT = bytes.fromhex("554889e5488d87") + struct.pack("<i", DISP) + bytes.fromhex("5dc3")
TSX = os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx")
DRIVER = os.path.join(HERE, "OZMaterialSpecularLayer_thunk1224_driver.mts")

oz.require_x86_64()
fn, addr, slide = oz.local_fn("Ozone", SYM, ctypes.c_void_p, [ctypes.c_void_p])
if addr != VA:
    sys.exit(f"FAIL: the inventory puts {SYM} at 0x{addr:x}, this port cites 0x{VA:x}")

mapped = ctypes.string_at(slide + VA, len(WANT))
disk = b""
if os.path.exists("/tmp/Ozone.x86_64"):
    with open("/tmp/Ozone.x86_64", "rb") as f:
        f.seek(VA)
        disk = f.read(len(WANT))
print(f"slide = 0x{slide:x}   vmaddr = 0x{VA:x}")
print(f"  mapped = {mapped.hex()}")
print(f"  ondisk = {disk.hex() or '(no /tmp/Ozone.x86_64)'}")
print(f"  expect = {WANT.hex()}")
if mapped != WANT or (disk and disk != WANT):
    sys.exit("FAIL: opcode self-check — that address does not hold the transcribed body")
print(f"  self-check OK — and the disp32 reads back as 0x{struct.unpack('<i', mapped[7:11])[0]:x}, "
      f"which is what refutes any `otool -tV` symbolisation of that operand\n")

# ---- the probe pointers ------------------------------------------------------------------------
# A real allocation (poisoned, so a write is visible), plus values no allocator would return: the
# body must not care.
ARENA = 0x4000
buf = ctypes.create_string_buffer(b"\xcd" * ARENA, ARENA)
base = ctypes.addressof(buf)
probes = [0, 1, 8, 0x1000, 0x4141414141414141, 0x7FFFFFFFFFFF0000]
probes += [base + off for off in range(0, ARENA, 0x200)]

before = ctypes.string_at(base, ARENA)
live = [(p, fn(ctypes.c_void_p(p)) or 0) for p in probes]
after = ctypes.string_at(base, ARENA)

CONTROLS = {
    "the PRIMARY body's displacement +0x33e0 (@0x497b50)": lambda p: (p + 0x33E0) & 0xFFFFFFFFFFFFFFFF,
    "the thunk adjustment applied the other way (+0x2f18+0x4c8+0x4c8)": lambda p: (p + 0x2F18 + 0x990) & 0xFFFFFFFFFFFFFFFF,
    "off by 8": lambda p: (p + 0x2F10) & 0xFFFFFFFFFFFFFFFF,
    "off by one byte": lambda p: (p + 0x2F17) & 0xFFFFFFFFFFFFFFFF,
    "returns `this` (no displacement)": lambda p: p,
    "the displacement read as decimal 2918 rather than hex": lambda p: (p + 2918) & 0xFFFFFFFFFFFFFFFF,
}

bad = 0
print("live(FCP) vs `this + 0x2f18`:")
for p, got in live:
    want = (p + DISP) & 0xFFFFFFFFFFFFFFFF
    if (got or 0) != want:
        bad += 1
        print(f"  DIVERGED this=0x{p:x} -> 0x{got:x}, expected 0x{want:x}")
print(f"  {len(live) - bad} / {len(live)} agree "
      f"(NULL, 1, 8, 0x1000, 0x41414141…, 0x7fff…, and every 0x200 step through a {ARENA:#x}-byte object)")
poison = sum(1 for a, b in zip(before, after) if a != b)
print(f"  {poison} of {ARENA} poison bytes modified — the body reads and writes no memory"
      if poison == 0 else f"  !! {poison} poison bytes CHANGED")
bad += 1 if poison else 0

print("\nNEGATIVE CONTROLS (each must be killed by the corpus; a 0 here would mean a blind harness):")
for label, wrong in CONTROLS.items():
    killed = sum(1 for p, got in live if (got or 0) != wrong(p))
    print(f"  {killed:3d} / {len(live)}  {label}")
    if killed == 0:
        bad += 1
        print("      ^^ DEAD CONTROL — this corpus cannot tell that model apart from the port")

# ---- the shipped TypeScript ----------------------------------------------------------------------
# The port models the object structurally (a named field at +0x2f18), so the TS side is driven over
# an object whose every candidate field carries a DISTINCT sentinel: picking the wrong member is
# then exactly as visible as picking the wrong displacement is on the C side above.
if not os.path.exists(TSX):
    print("\nINCONCLUSIVE: tsx not found — the TypeScript half did not run")
    sys.exit(2 if bad == 0 else 1)
proc = subprocess.run([TSX, DRIVER], capture_output=True, text=True, cwd=HERE)
if proc.returncode != 0:
    print(proc.stdout[-1500:], proc.stderr[-1500:])
    print("\nINCONCLUSIVE: the TypeScript driver did not run")
    sys.exit(2 if bad == 0 else 1)
ts = json.loads(proc.stdout)
print("\nSHIPPED TypeScript (raw-port/src/channels/OZMaterialSpecularLayer.ts, via tsx):")
print(f"  port returns the +0x2f18 member: {ts['port']}")
if ts["port"] != "chan@0x2f18":
    bad += 1
    print("      ^^ the port returned another member")
for name, (got, desc) in ts["mutants"].items():
    killed = got != "chan@0x2f18"
    print(f"  {name:4s} {'killed' if killed else 'SURVIVED'}  ({desc}) -> {got}")
    if not killed and name != "M0":
        bad += 1
    if name == "M0" and killed:
        bad += 1

print("\nRESULT:", "PASS" if bad == 0 else "FAIL")
sys.exit(0 if bad == 0 else 1)
