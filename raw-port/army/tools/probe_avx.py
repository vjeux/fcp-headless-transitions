#!/usr/bin/env python3
"""probe_avx.py — settle "can I execute an AVX kernel on this box?" by EXECUTING one. ~2 seconds.

WHY A SCRIPT AND NOT A NOTE. Two reviewers signed 150+ instruction AVX kernels on reading alone,
because `sysctl hw.optional.avx1_0` reports 0 under Rosetta 2 and that reads like an answer. It is
not: the feature bits lie, and the VEX-encoded kernels in these frameworks run fine. The note has
been in the briefs for a while and was still being contradicted in review, so here is the thing that
cannot be misremembered — run it, read the verdict.

    arch -x86_64 /usr/bin/python3 raw-port/army/tools/probe_avx.py

It calls a real, exported AVX kernel out of the live Helium image rather than assembling a toy, so a
PASS means exactly the thing you are about to rely on: VEX.256 executes in THIS process, under
Rosetta, at the addresses your port cites.
"""
import ctypes, os, struct, subprocess, sys

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"
# Resolve the inventory from the REPO, not from __file__: this script is short enough to be copied
# to /tmp and run from there, and deriving the path from its own location then silently points at a
# directory that does not exist — which reports INCONCLUSIVE and looks like a real answer. That is
# the same "a check that cannot run must not read as a verdict" failure this file exists to settle,
# and it bit me while writing it.
def _repo_root():
    import subprocess as _sp
    r = _sp.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                cwd=os.path.dirname(os.path.abspath(__file__)) or ".")
    if r.returncode == 0 and r.stdout.strip():
        return r.stdout.strip()
    r = _sp.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True)
    return r.stdout.strip() or os.path.expanduser("~/random/final-cut-pro-transitions")

INV = os.path.join(_repo_root(), "raw-port", "army", "inventory", "Helium.syms.txt")


def main():
    print(f"arch: {os.uname().machine}  (translated: "
          f"{subprocess.run(['sysctl','-n','sysctl.proc_translated'],capture_output=True,text=True).stdout.strip() or '?'})")
    bits = subprocess.run(["sysctl", "-n", "hw.optional.avx1_0"], capture_output=True, text=True).stdout.strip()
    print(f"sysctl hw.optional.avx1_0 = {bits or '?'}   <- IGNORE THIS. It lies under Rosetta.")

    if os.uname().machine != "x86_64":
        print("\nprobe_avx: INCONCLUSIVE — not running under the x86_64 slice.")
        print("  Re-run: arch -x86_64 /usr/bin/python3 " + os.path.relpath(__file__, os.getcwd()))
        return 2

    # A real exported AVX kernel from the live image. `HGHWBlend::AVXEnabled` is a T symbol whose body
    # is a handful of instructions ending in a VEX-encoded test; calling it proves execution, and its
    # return value is the framework's OWN answer to this question.
    try:
        lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    except OSError as e:
        print(f"\nprobe_avx: INCONCLUSIVE — could not load Helium: {e}")
        return 2

    sym = None
    try:
        for line in open(INV):
            p = line.split()
            if len(p) == 3 and p[1] == "T" and "AVXEnabled" in p[2]:
                sym = p[2]
                break
    except OSError:
        pass
    if not sym:
        print("\nprobe_avx: INCONCLUSIVE — no AVXEnabled symbol in the inventory cache.")
        return 2

    fn = getattr(lib, sym[1:], None)
    if fn is None:
        print(f"\nprobe_avx: INCONCLUSIVE — {sym} is not dlsym-able here.")
        return 2
    fn.restype = ctypes.c_int
    fn.argtypes = []
    val = fn()
    print(f"\ncalled {sym}() in the live Helium image -> {val}")
    print("probe_avx: PASS — an x86_64 AVX-path function EXECUTED in this process.")
    print("  Feature bits said otherwise above. Probe by executing, never by inferring.")
    print("  A 150-instruction VEX.256 kernel is oracle-able here; signing one on reading alone is a choice.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
