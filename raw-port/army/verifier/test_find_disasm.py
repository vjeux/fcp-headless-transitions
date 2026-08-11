#!/usr/bin/env python3
"""test_find_disasm.py — LOCKED fixture test for classify_disasm.find_disasm's RESOLUTION rule.

test_classify.py pins "given the right .s, is the verdict right?". This pins the question one step
earlier and just as load-bearing: **is it even the right .s?** A verdict computed from another
function's disassembly is not a weaker verdict, it is a fabricated one.

THE BUG THIS LOCKS OUT (reviewer-2, 2026-08-10, found on PR #253 — HGRenderNode):
  find_disasm fell back to a bare CLASS name and globbed `*HGRenderNode*.s`, which matched
  `__ZN18OZHGRenderNodeBase8finishedEv.s` — a DIFFERENT class, whose body is a forwarding thunk.
  G5 classified that as DISPATCH_ONLY and hard-rejected an honest two-store port as "a pure
  dispatch shell". Measured across the 1,564 class files in raw-port/src, 83 (5.3%) resolved their
  class-key fallback to a different class; 19 of those landed on an EMPTY body — and an EMPTY
  verdict on the wrong class's disasm is precisely how an empty-body-for-REAL-work port passes G5
  in silence (the OZChannelBase::parseElement cheat, CHEAT_INCIDENT_2026-07-29, via a second door).
  So the collision cuts BOTH ways: false REJECT of real work, false ACCEPT of a cheat.

The fallback only fires when the exact symbol's .s is absent — the normal state in a freshly leased
pool worktree, because re/disasm is gitignored (OPS_LOG #16). That is where the gate actually runs.

Fixtures are written into a temp DISASM dir, so this test needs no binary and no cache.
"""
import os, sys, tempfile, importlib

HERE = os.path.dirname(os.path.abspath(__file__))

BODY_THUNK = ("__ZN18OZHGRenderNodeBase8finishedEv:\n"
              "0000000000006a10\tmovq\t(%rdi), %rax\n"
              "0000000000006a13\tjmpq\t*0x40(%rax)\n")
BODY_STORE = ("__ZN12HGRenderNode11SetRendererEP10HGRenderer:\n"
              "00000000000dcca0\tpushq\t%rbp\n"
              "00000000000dcca1\tmovq\t%rsp, %rbp\n"
              "00000000000dcca4\tmovq\t%rsi, 0xb0(%rdi)\n"
              "00000000000dccab\tpopq\t%rbp\n"
              "00000000000dccac\tretq\n")

# (files to create, lookup key, expected basename or None)
CASES = [
    # THE REGRESSION: the class's own disasm is absent; a longer class merely CONTAINS its name.
    ({"__ZN18OZHGRenderNodeBase8finishedEv.s": BODY_THUNK},
     "HGRenderNode", None,
     "bare class key must NOT match a different class that contains it as a substring"),
    # the same directory, once the class's own disasm IS present -> it must be found
    ({"__ZN18OZHGRenderNodeBase8finishedEv.s": BODY_THUNK,
      "Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s": BODY_STORE},
     "HGRenderNode", "Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s",
     "bare class key resolves through the Itanium length prefix 12HGRenderNode"),
    # a full mangled symbol still resolves exactly (the common path)
    ({"Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s": BODY_STORE},
     "__ZN12HGRenderNode11SetRendererEP10HGRenderer",
     "Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s",
     "exact mangled lookup unaffected"),
    # reviewer-08's dotted human form still resolves (that fix must not regress)
    ({"ProChannel.OZChannelBase.parseElement.s": BODY_STORE},
     "OZChannelBase.parseElement", "ProChannel.OZChannelBase.parseElement.s",
     "dotted <FW>.<Class>.<method>.s fallback still works"),
    # ...and a dotted lookup must not be satisfied by a different class either
    ({"ProChannel.OZChannelBaseExtra.parseElement.s": BODY_STORE},
     "OZChannelBase", None,
     "dotted form of a LONGER class name must not answer for the shorter one"),
    # determinism: several candidates, the exact/shortest one wins regardless of readdir order
    ({"Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s": BODY_STORE,
      "Helium.__ZN12HGRenderNode11SetRendererEP10HGRendererXXXXXXXX.s": BODY_THUNK},
     "__ZN12HGRenderNode11SetRendererEP10HGRenderer",
     "Helium.__ZN12HGRenderNode11SetRendererEP10HGRenderer.s",
     "ambiguous glob resolves deterministically to the shortest (exact) basename"),
]


def main():
    fails = 0
    for files, key, expect, note in CASES:
        with tempfile.TemporaryDirectory() as d:
            for name, body in files.items():
                open(os.path.join(d, name), "w").write(body)
            sys.path.insert(0, HERE)
            import classify_disasm as C
            importlib.reload(C)
            C.DISASM = d                      # point the resolver at the fixture dir
            got = C.find_disasm(key)
            got = os.path.basename(got) if got else None
        ok = got == expect
        fails += (0 if ok else 1)
        print("  %-6s key=%-46s got=%-58s %s" % ("OK" if ok else "FAIL", key, got, note))
        if not ok:
            print("         EXPECTED: %s" % expect)
    print()
    print("test_find_disasm:", "PASS ✅" if fails == 0 else "FAIL ❌ (%d fail)" % fails)
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
