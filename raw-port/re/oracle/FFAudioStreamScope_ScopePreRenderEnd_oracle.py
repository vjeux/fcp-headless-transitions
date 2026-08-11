#!/usr/bin/env python3
"""Differential oracle for FFAudioStreamScope::ScopePreRenderEnd() @Flexo 0xe6cc50
(__ZN18FFAudioStreamScope17ScopePreRenderEndEv, `nm` class t — file-local, so dlsym cannot see it).

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/FFAudioStreamScope_ScopePreRenderEnd_oracle.py

THE CLAIM UNDER TEST IS "IT CHANGES NOTHING", which is the most vacuous-able claim in this repo: a
harness that cannot see a change agrees with it perfectly. So the run asserts four things, and only
the first is about the function:

  1. calling the live symbol on a poisoned receiver changes ZERO bytes of it, 32 times over;
  2. the differ is NOT BLIND — one byte flipped in the same buffer by the same comparison path is
     detected (if this control ever stops firing, claim 1 means nothing);
  3. the BYTES at the address are exactly `55 48 89 e5 5d c3`, i.e. prologue + epilogue + ret with
     nothing between them. This is what separates "empty body" from "the decode lost the body" —
     the failure mode OPS_LOG records as having cost 198 symbols;
  4. the SIBLING override is NOT empty: `FFAudioStreamObjectScope::ScopePreRenderEnd` @0xe6c6d0
     begins `55 48 89 e5 48 8b bf` (it loads this->+0xa0 before tail-jumping into ObjC). Its bytes
     are only READ, never called — calling it would dispatch an ObjC selector on a poisoned pointer
     — and it is here because it turns "this hook is empty" into "this CLASS opts out of a hook
     other classes implement", which is a much stronger statement.

The x86_64 vmaddr comes from raw-port/army/inventory/Flexo.syms.txt; Flexo loads outside the app
bundle once its @rpath chain is preloaded depth-first, which ozone_loader does.
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FW = "Flexo"
VMADDR = 0xE6CC50
BODY = bytes((0x55, 0x48, 0x89, 0xE5, 0x5D, 0xC3))          # the WHOLE function
SIBLING_VMADDR = 0xE6C6D0
SIBLING_HEAD = bytes((0x55, 0x48, 0x89, 0xE5, 0x48, 0x8B, 0xBF))
ARENA = 0x200
POISON = 0xCD
CALLS = 32


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR

    got = ctypes.string_at(addr, len(BODY))
    body_ok = got == BODY
    sib = ctypes.string_at(slide + SIBLING_VMADDR, len(SIBLING_HEAD))
    sibling_differs = sib == SIBLING_HEAD
    if not body_ok:
        raise SystemExit("BODY MISMATCH at %#x: %s != %s — refusing to report"
                         % (addr, got.hex(), BODY.hex()))

    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)
    changed = 0
    for _ in range(CALLS):
        recv = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        base = ctypes.addressof(recv)
        before = ctypes.string_at(base, ARENA)
        fn(base)
        after = ctypes.string_at(base, ARENA)
        changed += sum(1 for i in range(ARENA) if before[i] != after[i])

    # The control: the SAME buffer, the SAME comparison, one byte written by us.
    probe = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    pbase = ctypes.addressof(probe)
    pre = ctypes.string_at(pbase, ARENA)
    ctypes.c_uint8.from_address(pbase + ARENA // 2).value = 0x01
    post = ctypes.string_at(pbase, ARENA)
    differ_sees = sum(1 for i in range(ARENA) if pre[i] != post[i])

    driver = os.path.join(HERE, "FFAudioStreamScope_ScopePreRenderEnd_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps({"calls": CALLS}), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    print("FFAudioStreamScope::ScopePreRenderEnd  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print()
    print("1. EFFECT      %d calls on a 0x%x-byte poisoned receiver -> %d byte(s) changed"
          % (CALLS, ARENA, changed))
    print("   TS port     %d calls -> threw=%s, own properties changed=%d"
          % (CALLS, reply["threw"], reply["changed"]))
    print("2. NOT BLIND   one byte written by hand into the same buffer, compared the same way "
          "-> %d detected" % differ_sees)
    print("3. BYTES       the whole function is %s -> %s"
          % (got.hex(), "prologue + epilogue + ret, nothing between" if body_ok else "UNEXPECTED"))
    print("4. SIBLING     FFAudioStreamObjectScope::ScopePreRenderEnd @0x%x starts %s -> %s"
          % (SIBLING_VMADDR, sib.hex(),
             "NOT empty (it loads this->+0xa0), so this class OPTS OUT of a hook others implement"
             if sibling_differs else "unexpected shape — re-derive before trusting claim 3"))
    print()
    ok = (changed == 0 and body_ok and differ_sees == 1 and sibling_differs
          and not reply["threw"] and reply["changed"] == 0)
    print("VERDICT: %s" % ("VERIFIED — the machine changes nothing, the port changes nothing, and "
                           "the instrument can see a change" if ok else "NOT VERIFIED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
