#!/usr/bin/env python3
"""Differential oracle for
HGTextureManager::getTotalTextureMemory(HGTextureManager::SizeRequestLocation) @Helium 0x44c20.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/HGTextureManager_getTotalTextureMemory_oracle.py

The symbol is EXPORTED (`nm` type `T`), and it is reached through ozone_loader.py so the
"refuse to run outside x86_64" guard applies — the port cites x86_64 offsets.

WHAT IS BEING PROVED, beyond "it returns +0x90":

  * the load is 8 BYTES WIDE at +0x90. A poisoned object makes a narrower or wider read visible:
    a 4-byte load would return the low half with the high half zero, and a read at +0x88 or +0x98
    would return a different poison word. Both are run as NEGATIVE CONTROLS and both must fail.
  * the SizeRequestLocation argument is DEAD. The body has no instruction that reads %esi, so
    every value of it must give the same answer; the sweep varies it over the small enum range
    plus both int32 extremes.
  * the call MUTATES NOTHING — a getter that writes would be a different function. The whole
    0x200-byte object is compared byte for byte afterwards.
"""
import ctypes, os, random, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

VA = 0x44C20
OBJ = 0x200
FIELD = 0x90
POISON = 0xEE
PROLOGUE = bytes.fromhex("554889e5488b8790000000")  # push rbp; mov rbp,rsp; mov 0x90(%rdi),%rax


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    slide, image = L.image_slide("Helium")
    print(f"image={image}\nslide=0x{slide:x} target=0x{slide + VA:x}")

    # Self-check the address before trusting a single number out of it.
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    if got != PROLOGUE:
        print(f"PROLOGUE MISMATCH: {got.hex()} != {PROLOGUE.hex()} — refusing to report a result")
        return 1
    print(f"prologue at target matches the transcription: {got.hex()}")

    fn = ctypes.cast(slide + VA,
                     ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p, ctypes.c_uint32))

    rng = random.Random(20260811)
    values = [0, 1, 0xFFFFFFFFFFFFFFFF, 0x7FFFFFFFFFFFFFFF, 0x8000000000000000,
              0xDEADBEEFCAFEBABE, 1 << 32, (1 << 32) - 1]
    values += [rng.getrandbits(64) for _ in range(40)]
    locations = [0, 1, 2, 3, 0x7FFFFFFF, 0xFFFFFFFF]

    total = wrong = mutated = 0
    for v in values:
        for loc in locations:
            obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
            struct.pack_into("<Q", obj, FIELD, v)
            before = bytes(obj.raw)
            real = fn(ctypes.cast(obj, ctypes.c_void_p), loc)
            total += 1
            if real != v:                                  # the port: `return this.field_0x90`
                wrong += 1
                if wrong <= 5:
                    print(f"  MISMATCH v=0x{v:016x} loc={loc}: live=0x{real:016x}")
            if bytes(obj.raw) != before:
                mutated += 1
    print(f"{total - wrong}/{total} agree with the live symbol; {mutated} calls mutated the object")

    # NEGATIVE CONTROLS — each is a plausible mis-transcription and each MUST fail.
    controls = []
    obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
    struct.pack_into("<Q", obj, FIELD, 0xDEADBEEFCAFEBABE)
    real = fn(ctypes.cast(obj, ctypes.c_void_p), 0)
    controls.append(("32-bit load at +0x90", real == 0xCAFEBABE))
    controls.append(("load at +0x88 instead", real == struct.unpack_from("<Q", obj, 0x88)[0]))
    controls.append(("load at +0x98 instead", real == struct.unpack_from("<Q", obj, 0x98)[0]))
    for name, fired in controls:
        print(f"  negative control [{name}]: {'MATCHED — the oracle cannot tell them apart' if fired else 'correctly differs'}")

    bad = wrong or mutated or any(f for _, f in controls)
    print("getTotalTextureMemory oracle: " + ("DIVERGED" if bad else "VERIFIED"))
    return 2 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
