#!/usr/bin/env python3
"""reach_check.py — Tier-3 (non-callable) verdict = structural class + reachability fuzz.

For a function the executable oracle can't call in isolation, the un-gameable question is:
"does the port implement its behavior, or defer to throw-stubs on reachable paths?"

Combines two objective signals:
  1. classify_disasm.classify(disasm) -> TRAP | EMPTY | DISPATCH_ONLY | REAL.
  2. reach_worker.ts fuzzes the port's params; counts inputs that hit an incompleteness throw.

Verdict:
  TRAP  disasm            -> throwing port is FAITHFUL          -> ACCEPT_AS_TRAP
  EMPTY disasm            -> tiny/no-op port is faithful        -> ACCEPT_AS_EMPTY (needs 0 incomplete hits)
  DISPATCH_ONLY disasm    -> real work is the callees; a port   -> SKELETON (never `ported`);
                             that stubs them is a skeleton         if callees are ported it can be REAL
  REAL disasm + incompleteHits==0  -> port has no unimplemented reachable path -> LIKELY_REAL
                                      (reviewer still signs; oracle would be stronger if callable)
  REAL disasm + incompleteHits>0   -> CHEAT: real machine work, port throws on reachable input -> REJECT

This is what the ADVERSARIAL REVIEWER runs first to get an objective starting verdict; a worker
cannot satisfy REAL+0-incomplete without actually writing the transcription (throws are detectable).
"""
import json, os, sys, subprocess, threading, re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
RAWPORT = os.path.join(REPO, "raw-port")
sys.path.insert(0, HERE)
from classify_disasm import classify, find_disasm

RW = os.path.join(HERE, "reach_worker.ts")

def _reach(module_path, export_name, params, cap=256):
    proc = subprocess.Popen(["node_modules/.bin/tsx", RW], cwd=RAWPORT,
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        text=True, bufsize=1, start_new_session=True)
    if (proc.stdout.readline() or "").strip() != "READY":
        raise RuntimeError("reach worker no READY")
    req = json.dumps({"modulePath": module_path, "exportName": export_name,
                      "params": params, "cap": cap}) + "\n"
    proc.stdin.write(req); proc.stdin.flush()
    res = [None]
    def r():
        try: res[0] = proc.stdout.readline()
        except Exception: res[0] = None
    th = threading.Thread(target=r, daemon=True); th.start(); th.join(20)
    try:
        proc.stdin.write("QUIT\n"); proc.stdin.flush()
    except Exception: pass
    try: proc.wait(timeout=3)
    except Exception:
        import signal
        try: os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except Exception: pass
    if res[0] is None:
        raise RuntimeError("reach worker timeout")
    return json.loads(res[0].strip())

def check(disasm_path, module_path, export_name, params, cap=256):
    dcls = classify(disasm_path)["class"]
    reach = None
    if dcls in ("REAL", "DISPATCH_ONLY", "EMPTY"):
        try:
            reach = _reach(module_path, export_name, params, cap=cap)
        except Exception as e:
            reach = {"ok": False, "error": str(e)}
    hits = (reach or {}).get("incompleteHits", 0) if reach and reach.get("ok") else None
    if dcls == "TRAP":
        return {"verdict": "ACCEPT_AS_TRAP", "disasm_class": dcls, "reach": reach}
    if dcls == "EMPTY":
        v = "ACCEPT_AS_EMPTY" if (hits in (0, None)) else "REJECT_INCOMPLETE_EMPTY"
        return {"verdict": v, "disasm_class": dcls, "reach": reach}
    if dcls == "DISPATCH_ONLY":
        # not independently implementable; a stub is expected — flag as skeleton, never `ported`.
        return {"verdict": "SKELETON", "disasm_class": dcls, "reach": reach,
                "note": "real work is callees; status must be skeleton until callees land"}
    if dcls == "REAL":
        if hits is None:
            return {"verdict": "REVIEW_NEEDED", "disasm_class": dcls, "reach": reach,
                    "note": "REAL disasm; reach fuzz unavailable — reviewer must sign"}
        if hits > 0:
            return {"verdict": "REJECT_CHEAT", "disasm_class": dcls, "reach": reach,
                    "note": "REAL machine work but port throws incompleteness on %d reachable inputs" % hits}
        return {"verdict": "LIKELY_REAL", "disasm_class": dcls, "reach": reach,
                "note": "REAL disasm, no reachable incompleteness throw; reviewer signs / oracle if callable"}
    return {"verdict": "UNKNOWN", "disasm_class": dcls, "reach": reach}

if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    dpath = spec.get("disasm") or find_disasm(spec.get("symbol") or spec.get("class") or "")
    print(json.dumps(check(dpath, os.path.join(REPO, spec["module"]), spec["export"],
                           spec.get("params", []), cap=spec.get("cap", 256)), indent=2, default=str))
