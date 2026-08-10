#!/usr/bin/env python3
"""diff_oracle.py — the UN-GAMEABLE executable differential oracle.

Given a symbol descriptor {framework, symbol (mangled), signature, module (TS .js), export (TS fn)},
this calls BOTH:
  - the REAL FCP function via dlsym (fct.parity.oracle.call) — ground truth, Apple's own code;
  - the ported TS function via a generic dynamic-import worker (verifier/generic_worker.ts);
on a batch of FUZZED inputs, and reports VERIFIED / DIVERGED / FAILED.

WHY THIS IS UN-GAMEABLE: the worker CALLS the real port. A throw-shell throws => FAILED. A wrong
body returns the wrong number => DIVERGED. Only a body whose output equals Apple's on every fuzzed
input passes. There is no static text a worker can write to fake this — the number must be right.

Verdicts:
  VERIFIED : max_abs_err <= tol_abs OR max_rel_err <= tol_rel across ALL cases, no worker errors.
  DIVERGED : some case exceeds tolerance (real work, wrong result).
  FAILED   : the TS port threw / crashed / returned non-numeric (a shell or broken port).
  NO_ORACLE: the real symbol isn't dlsym-callable (local/hidden) — Tier-3, reviewer's job.
"""
import json, os, sys, subprocess, threading, random, math

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, REPO)
from fct.parity import oracle

RAWPORT = os.path.join(REPO, "raw-port")
WORKER = os.path.join(REPO, "raw-port", "army", "verifier", "generic_worker.ts")


class GenericTSWorker:
    def __init__(self):
        self.proc = subprocess.Popen(
            ["node_modules/.bin/tsx", WORKER], cwd=RAWPORT,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, bufsize=1, start_new_session=True)
        line = self.proc.stdout.readline()
        if line.strip() != "READY":
            raise RuntimeError("generic worker failed to boot: %r" % line)

    def _readline_timeout(self, t):
        res = [None]
        def r():
            try: res[0] = self.proc.stdout.readline()
            except Exception: res[0] = None
        th = threading.Thread(target=r, daemon=True); th.start(); th.join(t)
        return None if th.is_alive() else res[0]

    def call(self, module_path, export_name, args, arg_kinds):
        req = json.dumps({"modulePath": module_path, "exportName": export_name,
                          "args": args, "argKinds": arg_kinds}) + "\n"
        self.proc.stdin.write(req); self.proc.stdin.flush()
        reply = self._readline_timeout(20)
        if reply is None:
            raise RuntimeError("worker timeout/crash")
        return json.loads(reply.strip())

    def close(self):
        try:
            self.proc.stdin.write("QUIT\n"); self.proc.stdin.flush()
        except Exception: pass
        try: self.proc.wait(timeout=3)
        except Exception:
            import signal
            try: os.killpg(os.getpgid(self.proc.pid), signal.SIGKILL)
            except Exception: pass


def _fuzz_cases(signature, n=64, seed=0xF00D):
    """Generate n fuzzed arg dicts covering the signature's `in`/`in_array` inputs."""
    rng = random.Random(seed)
    interesting = [0.0, 1.0, -1.0, 0.5, -0.5, 2.0, 100.0, -100.0, 1e-9, 1e9]
    cases = []
    for k in range(n):
        args = {}
        for a in signature["args"]:
            if a["kind"] == "in":
                if k < len(interesting):
                    args[a["name"]] = interesting[k]
                else:
                    args[a["name"]] = rng.uniform(-50, 50)
            elif a["kind"] == "in_array":
                L = a["len"]
                args[a["name"]] = [rng.uniform(-10, 10) for _ in range(L)]
        cases.append(args)
    return cases


def _marshal_ts(signature, args):
    """Build (positional args, arg_kinds) for the generic worker from a named-args dict."""
    ts_args, kinds = [], []
    for a in signature["args"]:
        if a["kind"] == "in":
            ts_args.append(args[a["name"]]); kinds.append("in")
        elif a["kind"] == "in_array":
            ts_args.append(args[a["name"]]); kinds.append("in_array")
        elif a["kind"] == "out_array":
            ts_args.append(a["len"]); kinds.append("out_array")
        # scalar out params: TS ports return them via `ret` or an out array; skip here
    return ts_args, kinds


def verify(desc, tol_abs=1e-9, tol_rel=1e-9, n=64, verbose=False):
    sig = desc["signature"]
    # real symbol callable?
    try:
        oracle.build_callable(desc)
    except oracle.OracleError as e:
        return {"verdict": "NO_ORACLE", "reason": str(e)}
    cases = _fuzz_cases(sig, n=n)
    w = GenericTSWorker()
    worst_abs = 0.0; worst_rel = 0.0; worst_case = None; n_cmp = 0; fail = None
    try:
        for args in cases:
            real = oracle.call(desc, args)   # dict of named outputs
            ts_args, kinds = _marshal_ts(sig, args)
            r = w.call(os.path.join(REPO, desc["module"]), desc["export"], ts_args, kinds)
            if not r.get("ok"):
                fail = {"case": args, "error": r.get("error")}
                break
            # compare the primary output. `outputs` names which real output to compare;
            # the TS side returns it as `ret` (return value) by convention.
            out_name = desc["outputs"][0]
            rv = real.get(out_name)
            tv = r.get("ret")
            if isinstance(rv, (list, tuple)):
                tv = r.get("ret")
            if not isinstance(tv, (int, float)) or (isinstance(tv, float) and math.isnan(tv)):
                # allow list compare
                if isinstance(tv, list) and isinstance(rv, (list, tuple)):
                    for a1, b1 in zip(tv, rv):
                        ae = abs(a1 - b1); re_ = ae / (abs(b1) + 1e-300)
                        if ae > worst_abs: worst_abs = ae; worst_case = args
                        worst_rel = max(worst_rel, re_); n_cmp += 1
                    continue
                fail = {"case": args, "error": "non-numeric TS ret: %r" % tv}
                break
            ae = abs(tv - rv); re_ = ae / (abs(rv) + 1e-300)
            if ae > worst_abs: worst_abs = ae; worst_case = args
            worst_rel = max(worst_rel, re_); n_cmp += 1
            if verbose:
                print("  case=%s real=%s ts=%s ae=%.3e" % (args, rv, tv, ae))
    finally:
        w.close()
    if fail is not None:
        return {"verdict": "FAILED", "reason": fail["error"], "case": fail["case"]}
    if n_cmp == 0:
        return {"verdict": "NO_ORACLE", "reason": "no comparable outputs"}
    passed = (worst_abs <= tol_abs) or (worst_rel <= tol_rel)
    return {"verdict": "VERIFIED" if passed else "DIVERGED",
            "max_abs_err": worst_abs, "max_rel_err": worst_rel, "n": n_cmp,
            "worst_case": worst_case}


if __name__ == "__main__":
    desc = json.load(open(sys.argv[1]))
    print(json.dumps(verify(desc, verbose=("-v" in sys.argv)), indent=2, default=str))
