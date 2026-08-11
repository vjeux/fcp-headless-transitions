#!/usr/bin/env python3
"""Differential oracle for PCAtomBoxFile::closeOutputFile() @ProCore 0x24d64
(__ZN13PCAtomBoxFile15closeOutputFileEv, `nm` class T).

WHY THIS EXISTS: PR #105 first shipped closeOutputFile() with both of its
boundary helpers (`_fclose` @0xde864, `operator delete[]` __ZdaPv @0xde6ba)
written as `throw`, which made both of the function's stores — the two field
nullings at 0x24d7b and 0x24d91 — UNREACHABLE on exactly the paths where they
matter.  The reviewer asked for the fix to be PROVEN rather than asserted.  This
harness does that against the live ProCore binary.

WHAT IS COMPARED.  closeOutputFile returns void; its entire observable effect is
on the receiver, so the differential is an ARENA SNAPSHOT DIFF (the technique
OPS_LOG records for memory-mutating methods):

  * a 0x100-byte receiver arena is poisoned with 0xCD,
  * +0x50 (outputFile, FILE*) and +0x58 (outputBuffer, operator new[] pointer)
    are set per case,
  * the live function is called,
  * every byte of the arena is compared against the pre-call snapshot.

That proves both "the two intended qwords became 0" AND "nothing else moved",
which a return-value comparison could never show.

ARCHITECTURE.  Runs only under `arch -x86_64 /usr/bin/python3` (ozone_loader
refuses otherwise): every @0xADDR in the port is an x86_64 offset, the vmaddr
comes from raw-port/army/inventory/ProCore.syms.txt (x86_64 by construction),
and the prologue bytes at slide+vmaddr are checked against the bytes of the
transcribed disassembly before any number is trusted.

THE TS SIDE runs in one `node --experimental-strip-types` subprocess
(PCAtomBoxFile_closeOutputFile_driver.mts), which imports the REAL port file —
not a Python restatement of it — and evaluates the port plus three mutants on
the same cases, so the controls are apples-to-apples with the port.

USAGE:  arch -x86_64 /usr/bin/python3 PCAtomBoxFile_closeOutputFile_oracle.py
"""
import ctypes, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "ProCore"
VMADDR = 0x24D64          # __ZN13PCAtomBoxFile15closeOutputFileEv, from the inventory
OFF_FILE = 0x50           # this->outputFile   (movq 0x50(%rdi),%rdi @0x24d6d)
OFF_BUF = 0x58            # this->outputBuffer (movq 0x58(%rbx),%rdi @0x24d83)
ARENA = 0x100
POISON = 0xCD

# pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax  — the frame the
# transcription's FULL DISASM block opens with at 0x24d64..0x24d6a.
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x53, 0x50))


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR

    # SELF-CHECK: the wrong-slice trap fails silently toward VERIFIED, so refuse
    # to report a number until the bytes at the address are the function we
    # transcribed.
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to run"
                         % (addr, got.hex(), PROLOGUE.hex()))

    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p)(addr)

    libc = ctypes.CDLL(None)
    libc.fopen.restype = ctypes.c_void_p
    libc.fopen.argtypes = [ctypes.c_char_p, ctypes.c_char_p]
    libc._Znam.restype = ctypes.c_void_p      # operator new[](size_t) — the exact
    libc._Znam.argtypes = [ctypes.c_size_t]   # allocator __ZdaPv is paired with

    cases = [
        ("neither open",      False, False),
        ("file only",         True,  False),
        ("buffer only",       False, True),
        ("both open",         True,  True),
    ]

    results = []
    for name, want_file, want_buf in cases:
        arena = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        base = ctypes.addressof(arena)

        fp = 0
        if want_file:
            path = ("/tmp/pcatomboxfile_oracle_%d_%s.tmp"
                    % (os.getpid(), name.replace(" ", "_"))).encode()
            fp = libc.fopen(path, b"w") or 0
            if not fp:
                raise SystemExit("fopen failed for %s" % path)
        buf = libc._Znam(64) if want_buf else 0

        ctypes.memmove(base + OFF_FILE, ctypes.byref(ctypes.c_uint64(fp)), 8)
        ctypes.memmove(base + OFF_BUF, ctypes.byref(ctypes.c_uint64(buf)), 8)
        before = ctypes.string_at(base, ARENA)

        fn(base)

        after = ctypes.string_at(base, ARENA)
        f_after = int.from_bytes(after[OFF_FILE:OFF_FILE + 8], "little")
        b_after = int.from_bytes(after[OFF_BUF:OFF_BUF + 8], "little")
        # every byte OUTSIDE the two fields must be untouched
        stray = [i for i in range(ARENA)
                 if before[i] != after[i]
                 and not (OFF_FILE <= i < OFF_FILE + 8)
                 and not (OFF_BUF <= i < OFF_BUF + 8)]
        results.append({
            "case": name,
            "fileWasSet": want_file, "bufWasSet": want_buf,
            "fileNulled": f_after == 0,
            "bufNulled": b_after == 0,
            "strayBytes": len(stray),
            "threw": False,
        })

    ts = run_ts(cases)

    print("PCAtomBoxFile::closeOutputFile  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    hdr = "%-14s | %-34s | %-34s | %s" % ("case", "live ProCore", "TS port", "verdict")
    print(hdr); print("-" * len(hdr))

    diverged = 0
    for i, r in enumerate(results):
        t = ts["port"][i]
        agree = (r["fileNulled"] == t["fileNulled"]
                 and r["bufNulled"] == t["bufNulled"]
                 and r["threw"] == t["threw"]
                 and r["strayBytes"] == 0 and t["strayFields"] == 0)
        diverged += 0 if agree else 1
        print("%-14s | %-34s | %-34s | %s"
              % (r["case"], fmt_bin(r), fmt_ts(t), "agree" if agree else "DIVERGED"))

    print()
    print("cases: %d   divergences: %d" % (len(results), diverged))
    print()
    print("NEGATIVE CONTROLS (same cases, same node process, evaluated against the")
    print("live results above — a control that kills 0 is reported as such):")
    for m in ts["mutants"]:
        killed = 0
        for i, t in enumerate(m["results"]):
            r = results[i]
            if not (r["fileNulled"] == t["fileNulled"]
                    and r["bufNulled"] == t["bufNulled"]
                    and r["threw"] == t["threw"]):
                killed += 1
        note = "" if killed else "   <-- EQUIVALENT or BLIND: see the note in the driver"
        print("  %-46s killed %d/%d%s" % (m["name"], killed, len(results), note))

    print()
    print("VERDICT: %s" % ("VERIFIED — 0 divergences" if diverged == 0
                           else "DIVERGED (%d)" % diverged))
    return 1 if diverged else 0


def fmt_bin(r):
    return ("file=%s buf=%s stray=%d"
            % ("null" if r["fileNulled"] else "SET",
               "null" if r["bufNulled"] else "SET", r["strayBytes"]))


def fmt_ts(t):
    return ("file=%s buf=%s threw=%s"
            % ("null" if t["fileNulled"] else "SET",
               "null" if t["bufNulled"] else "SET", t["threw"]))


def run_ts(cases):
    driver = os.path.join(HERE, "PCAtomBoxFile_closeOutputFile_driver.mts")
    payload = json.dumps([{"name": n, "file": f, "buf": b} for n, f, b in cases])
    out = subprocess.run(["node", "--experimental-strip-types", driver],
                         input=payload, capture_output=True, text=True)
    if out.returncode != 0:
        raise SystemExit("TS driver failed:\n%s\n%s" % (out.stdout, out.stderr))
    return json.loads(out.stdout)


if __name__ == "__main__":
    sys.exit(main())
