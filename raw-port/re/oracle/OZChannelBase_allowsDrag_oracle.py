#!/usr/bin/env python3
"""OZChannelBase::allowsDrag(OZChannelBase const*) @ProChannel 0x49f44 — live differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelBase_allowsDrag_oracle.py

A one-instruction body (`movb $0x1, %al`) is the easiest thing in the world to transcribe and the
easiest to be quietly wrong about, because "returns a constant" is also what a STUB looks like. So
the measurement is aimed at the two questions a constant can actually get wrong:

  1. is it really unconditional? — 49 (this, other) pairs, including NULL, poison, equal pointers
     and real arenas, must all return 1;
  2. does it read or write anything? — the arenas are 0xCD-filled and byte-compared afterwards, so a
     body that consulted a flag (and happened to return 1 anyway on this corpus) would still be
     visible as a READ only if it wrote; the stronger evidence for "no read" is the disassembly plus
     the fact that no probe pointer is even mapped in the NULL/poison cases, which would fault.

The result is read as a `c_ubyte`: `movb $0x1, %al` sets only the low byte, and the C++ bool ABI
says the caller reads `%al`. Declaring the restype `int` would compare bits this function never set.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz                                     # noqa: E402

SYM_NM = "__ZN13OZChannelBase10allowsDragEPKS_"   # as `nm` prints it
SYM_DL = SYM_NM[1:]                               # dlsym wants it without the Mach-O underscore
VA = 0x49F44
WANT = bytes.fromhex("554889e5b0015dc3")
TSX = os.path.join(HERE, "..", "..", "node_modules", ".bin", "tsx")
DRIVER = os.path.join(HERE, "OZChannelBase_allowsDrag_driver.mts")

oz.require_x86_64()
lib = oz.load_framework("ProChannel")
slide, _ = oz.image_slide("ProChannel")
addr = oz.nm_addr("ProChannel", SYM_NM)
if addr != VA:
    sys.exit(f"FAIL: inventory says 0x{addr:x}, the port cites 0x{VA:x}")

mapped = ctypes.string_at(slide + VA, len(WANT))
disk = b""
if os.path.exists("/tmp/ProChannel.x86_64"):
    with open("/tmp/ProChannel.x86_64", "rb") as f:
        f.seek(VA)
        disk = f.read(len(WANT))
print(f"slide = 0x{slide:x}  vmaddr = 0x{VA:x}")
print(f"  mapped = {mapped.hex()}\n  ondisk = {disk.hex() or '(no thin slice)'}\n  expect = {WANT.hex()}")
if mapped != WANT or (disk and disk != WANT):
    sys.exit("FAIL: opcode self-check — that address does not hold the transcribed body")
print("  self-check OK\n")

# `T` symbol: dlsym reaches it directly once the framework is loaded. (Belt and braces: compare the
# dlsym answer against slide+vmaddr, which is the only cross-check that the two agree.)
fn = ctypes.CFUNCTYPE(ctypes.c_ubyte, ctypes.c_void_p, ctypes.c_void_p)
try:
    resolved = ctypes.cast(getattr(lib, SYM_DL), ctypes.c_void_p).value
except AttributeError:
    resolved = None
if resolved is not None and resolved != slide + VA:
    sys.exit(f"FAIL: dlsym says 0x{resolved:x}, slide+vmaddr says 0x{slide + VA:x}")
call = fn(slide + VA)

a = ctypes.create_string_buffer(b"\xcd" * 0x100, 0x100)
b = ctypes.create_string_buffer(b"\xcd" * 0x100, 0x100)
PTRS = [0, 1, 0x4141414141414141, 0x7FFFFFFFFFFF0000, ctypes.addressof(a), ctypes.addressof(b),
        ctypes.addressof(a) + 0x80]
before = ctypes.string_at(ctypes.addressof(a), 0x100) + ctypes.string_at(ctypes.addressof(b), 0x100)
results = []
for p in PTRS:
    for q in PTRS:
        results.append(((p, q), call(ctypes.c_void_p(p), ctypes.c_void_p(q))))
after = ctypes.string_at(ctypes.addressof(a), 0x100) + ctypes.string_at(ctypes.addressof(b), 0x100)

bad = sum(1 for _, r in results if r != 1)
print(f"live(FCP): {len(results) - bad} / {len(results)} pairs returned 1 "
      f"(NULL, poison, 0x4141…, real arenas, and this == other)")
print(f"  {'0' if before == after else 'SOME'} of {2 * 0x100} arena bytes changed")
bad += 0 if before == after else 1

if not os.path.exists(TSX):
    print("\nINCONCLUSIVE: tsx not found"); sys.exit(2 if bad == 0 else 1)
proc = subprocess.run([TSX, DRIVER], capture_output=True, text=True, cwd=HERE)
if proc.returncode != 0:
    print(proc.stdout[-1200:], proc.stderr[-1200:])
    print("\nINCONCLUSIVE: the TypeScript driver did not run"); sys.exit(2 if bad == 0 else 1)
ts = json.loads(proc.stdout)
print("\nSHIPPED TypeScript (raw-port/src/channels/OZChannelBase.ts, via tsx). Its grid is its OWN —")
print("real objects cannot be a NULL pointer — so the counts below are per-mutant kill counts over")
print("49 TS pairs, not a case-by-case pairing with the C side's 49:")
print(f"  port agrees with live on {ts['port_agrees']} / {len(results)}")
bad += 0 if ts["port_agrees"] == len(results) else 1
print(f"  M0 unmutated restatement ...................... {ts['M0_kills']:2d} killed (expected 0)")
print(f"  M1 constant false ............................. {ts['M1_kills']:2d} killed / {len(results)}")
print(f"  M2 `return other !== null` .................... {ts['M2_kills']:2d} killed "
      f"(every pair whose argument is absent)")
bad += 1 if ts["M0_kills"] else 0
bad += 1 if ts["M1_kills"] == 0 or ts["M2_kills"] == 0 else 0

print("\nRESULT:", "PASS" if bad == 0 else "FAIL")
sys.exit(0 if bad == 0 else 1)
