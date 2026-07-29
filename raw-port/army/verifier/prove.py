#!/usr/bin/env python3
"""prove.py — reproducible proof that the executable differential oracle is UN-GAMEABLE.

Runs four cases against the LIVE FCP OZBezierEval symbol (@ProChannel 0xa549c):
  1. REAL   port  -> must VERIFIED  (bit-exact, abs_err 0)
  2. SHELL  (throw, the 7385eb01 cheat pattern) -> must FAILED
  3. WRONG  (linear lerp instead of cubic Bernstein) -> must DIVERGED
  4. NOOP   (returns constant) -> must DIVERGED

Exit 0 iff all four verdicts are as expected. This is the gate that had to pass BEFORE any swarm
restart. Fixtures are written fresh each run under _mutants/ so the proof is self-contained.
"""
import json, os, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
MUT = os.path.join(HERE, "_mutants")
os.makedirs(MUT, exist_ok=True)

SIG = {"args": [{"kind":"in_array","ctype":"double","name":"ctrl","len":4},
                {"kind":"in","ctype":"double","name":"u"}], "ret":"double"}
SYM = "__Z12OZBezierEvalPKdd"

FIXTURES = {
  "real": ("raw-port/src/channels/OZBezierInterpolator.js", None, "VERIFIED"),
  "shell": ("raw-port/army/verifier/_mutants/shell.ts",
            'export function OZBezierEval(_ctrl: number[], _u: number): number {\n'
            '  throw new Error("OZBezierEval @ProChannel 0xa549c not yet transcribed");\n}\n',
            "FAILED"),
  "wrong": ("raw-port/army/verifier/_mutants/wrong.ts",
            '// @ProChannel 0xa549c linear lerp (WRONG vs cubic Bernstein)\n'
            'export function OZBezierEval(ctrl: number[], u: number): number {\n'
            '  return ctrl[0] + (ctrl[3] - ctrl[0]) * u;\n}\n',
            "DIVERGED"),
  "noop": ("raw-port/army/verifier/_mutants/noop.ts",
           '// @ProChannel 0xa549c no-op constant (cheat)\n'
           'export function OZBezierEval(_ctrl: number[], _u: number): number { return 0; }\n',
           "DIVERGED"),
}

sys.path.insert(0, HERE)
from diff_oracle import verify

def run():
    allok = True
    for name, (mod, src, expect) in FIXTURES.items():
        if src is not None:
            open(os.path.join(REPO, mod), "w").write(src)
        desc = {"framework":"ProChannel","symbol":SYM,"signature":SIG,
                "outputs":["ret"],"module":mod,"export":"OZBezierEval"}
        r = verify(desc, tol_abs=1e-9, tol_rel=1e-9, n=64)
        got = r["verdict"]
        ok = (got == expect)
        allok = allok and ok
        extra = ""
        if got in ("VERIFIED","DIVERGED"):
            extra = " abs=%.3e rel=%.3e n=%d" % (r.get("max_abs_err",-1), r.get("max_rel_err",-1), r.get("n",0))
        elif got == "FAILED":
            extra = " reason=%s" % r.get("reason","")[:50]
        print("%-6s expect=%-9s got=%-9s %s%s" % (name, expect, got, "OK " if ok else "MISMATCH", extra))
    print()
    print("PROVE:", "PASS ✅ (oracle is un-gameable: real VERIFIES, shell FAILS, wrong/noop DIVERGE)"
          if allok else "FAIL ❌")
    return 0 if allok else 1

if __name__ == "__main__":
    sys.exit(run())
