#!/usr/bin/env python3
"""test_callonce_cheat.py — LOCKED regression test for the G5 call_once-singleton cheat detector.

CHEAT INCIDENT 2026-07-29: dep-worker-05 fabricated `new <Class>()` in getInstance() with a
corrupted `!== 1` sentinel; reach-fuzz couldn't catch it (no throw). The _callonce_singleton_cheat
rule in g5_impl_gate.py catches the disasm/body mismatch. This test asserts:
  1. the KNOWN cheat (OZChannelPositionPercent3D_Factory, on main) is REJECTED
  2. a synthetic honest Style-B body (sentinel -1n, std_call_once boundary) is ACCEPTED
  3. a synthetic cheat body (fabricated new + sentinel 1) is REJECTED
against the SAME real call_once disasm shape. Run from repo root.
"""
import os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import g5_impl_gate as g

DIS = os.path.join(g.ROOT, "re", "disasm")
# a real call_once-singleton getInstance disasm (cmpq $-0x1 + __call_once, no __Znwm)
SEED_DISASM = os.path.join(DIS, "ProChannel.OZChannelPositionPercent3D_Factory.getInstance.s")

HONEST = '''export class Foo {
  private static _instanceOnce: bigint = 0n;
  static getInstance(): Foo {
    if (Foo._instanceOnce !== -1n) {
      std_call_once({get:()=>Foo._instanceOnce,set:(v)=>{Foo._instanceOnce=v;}}, null, proxy);
    }
    return Foo._instance!;
  }
}'''
CHEAT = '''export class Foo {
  private static _instanceOnce: 0|1 = 0;
  static getInstance(): Foo {
    if (Foo._instanceOnce !== 1) {
      Foo._instance = new Foo();
      Foo._instanceOnce = 1;
    }
    return Foo._instance!;
  }
}'''

def main():
    if not os.path.exists(SEED_DISASM):
        print("test_callonce_cheat: SKIP (no seed disasm; run disasm.sh --sym "
              "__ZN34OZChannelPositionPercent3D_Factory11getInstanceEv ProChannel)")
        return 0
    ok = True
    # 1. known on-main cheat file must be rejected
    seed_ts = os.path.join(g.ROOT, "src", "channels", "OZChannelPositionPercent3D_Factory.ts")
    if os.path.exists(seed_ts):
        errs, _ = g.check_file(seed_ts)
        hit = any("CALLONCE-CHEAT" in e for e in errs)
        print(f"   {'OK' if hit else 'FAIL'}  known-cheat OZChannelPositionPercent3D_Factory -> {'REJECT' if hit else 'PASS'}")
        ok = ok and hit
    # 2/3. synthetic honest vs cheat against the real disasm shape
    for label, body, want_reject in (("honest-styleB", HONEST, False), ("synthetic-cheat", CHEAT, True)):
        r = g._callonce_singleton_cheat(SEED_DISASM, "Foo::getInstance", body, "Foo")
        got_reject = r is not None
        good = got_reject == want_reject
        print(f"   {'OK' if good else 'FAIL'}  {label} -> {'REJECT' if got_reject else 'ACCEPT'} (want {'REJECT' if want_reject else 'ACCEPT'})")
        ok = ok and good
    print("test_callonce_cheat:", "PASS" if ok else "FAIL")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
