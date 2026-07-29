#!/usr/bin/env python3
"""test_classify.py — LOCKED fixture test for classify_disasm.py. Exit 0 iff every fixture matches.

Pins the cheat-detection contract so no future edit silently regresses it. (Two earlier drafts BOTH
mis-called the 7385eb01 cheat 'REAL' — which would let the dispenser serve it as an implementable
leaf; another draft wrongly expected an empty dtor to be TRAP.) This test is the guardrail; run it
in prove_all.py and before any swarm restart.

Ground truth verified against the actual saved disasm (see the note per fixture).
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from classify_disasm import classify

D = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "re", "disasm"))

# (disasm filename, expected class, note verified against the real .s)
FIX = [
  ("ProChannel.__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime.s", "DISPATCH_ONLY",
   "THE 7385eb01 CHEAT: body is only two vtable dispatches (indirect=2, stores/compute/direct=0)"),
  ("Helium.HGColorGamma.ScaleParams.s", "REAL",
   "genuine math: 70+ stores, 70+ compute, 160+ direct calls"),
  ("FactoryParser.~FactoryParser.s", "TRAP",
   "ud2-abort dtor (push;mov;ud2) — a throwing port IS faithful"),
  ("Helium.HGColorGammaLUTEntryFactory.D1.s", "EMPTY",
   "empty dtor (push;mov rsp,rbp;pop;ret) — NO ud2 — tiny body is faithful"),
  ("Flexo.FFAudioSignal.isIndefiniteSignal.s", "EMPTY",
   "return 0 (xorl eax,eax;ret) — trivial constant getter"),
  ("Flexo.FFSingleToneAudioSignal.isIndefiniteSignal.s", "EMPTY",
   "return true (movb $1,al;ret) — trivial constant getter"),
  ("ProCore.PCRenderModel.getType.s", "EMPTY",
   "return this->field (single load;ret) — trivial accessor"),
  ("Flexo.FFScaledAudioSignal.isIndefiniteSignal.s", "DISPATCH_ONLY",
   "pure forwarding thunk (load;load;jmpq *vtable) — no work of its own"),
]

def main():
    fails = 0; skips = 0
    for fn, expect, note in FIX:
        p = os.path.join(D, fn)
        if not os.path.exists(p):
            print("  SKIP (missing): %s" % fn); skips += 1; continue
        got = classify(p)["class"]
        ok = got == expect
        fails += (0 if ok else 1)
        print("  %-6s expect=%-14s got=%-14s %s" % ("OK" if ok else "FAIL", expect, got, fn))
        if not ok:
            print("         GROUND TRUTH: %s" % note)
    print()
    print("test_classify:", "PASS ✅" if fails == 0 else "FAIL ❌ (%d fail, %d skip)" % (fails, skips))
    return 1 if fails else 0

if __name__ == "__main__":
    sys.exit(main())
