"""fct.parity.bridge — the TS half of the parity oracle.

Boots ONE persistent `tsx test/_parity_worker.ts` node process and serves many
function-evaluation requests over stdin (avoids ~2s tsx cold-start per call — same
pattern as fct/faithful/render.py's EngineWorker and fct/minimize.py). Each request names
a registry `fn` id and an args dict; the worker calls the REAL ported engine function and
returns its numeric outputs.
"""
import json
import os
import subprocess
import threading

_REPO = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
# WHY THIS MOVED. #63 ("raw-port standalone: delete engine/, docs/, tools/") removed the engine tree,
# but this still spawned its TS worker with cwd=<repo>/engine. Every spawn raised ENOENT, the driver
# reported HARNESS_BROKEN — and gate.sh did not grep for that string, so G4, the only UN-FAKEABLE
# gate, silently checked nothing while the gate printed PASS. It had been dead for months and no
# gate ever failed because of it. Found by worker-02.
ENGINE_DIR = os.path.join(_REPO, "raw-port")
WORKER_TS = os.environ.get("FCT_PARITY_WORKER", "army/verifier/generic_worker.ts")
CALL_TIMEOUT_S = float(os.environ.get("FCT_PARITY_TIMEOUT", "20"))


def _normalize_outputs(reply, node):
    """Map generic_worker's reply into the ORACLE's output-name space.

    `driver._sweep_curve` looks up `e_out[name]` for each name in the node's `compare_outputs`,
    which are the ORACLE's names: "ret" for the C return value and the out-parameter names from
    the signature (e.g. "outVal"). generic_worker, by contrast, answers
    {"ok":true,"ret":<the TS function's return>,"outArgs":{"arg<i>":[...]}} — it cannot know
    those names. Without this mapping the driver raised KeyError('outVal') (or compared a float
    against None), which surfaced as "ORACLE DIVERGENCE" on a file whose port was never even
    called — i.e. the gate failing for a harness reason, the #6 shape.

    Rules, in order:
      * "ret" is always the TS return value as-is (scalar or array).
      * a TS port that returns an OBJECT (because the C function wrote through out-pointers)
        exposes its keys directly, and `node["ts_outputs"]` renames them into the oracle's names
        ({"<oracle name>": "<ts key>"}). Declaring the mapping in registry.json keeps it explicit
        instead of guessing by position.
      * anything the worker allocated for an out_array is exposed under its argN key too.
    """
    out = {"ret": reply.get("ret")}
    ret = reply.get("ret")
    if isinstance(ret, dict):
        out.update(ret)
    out.update(reply.get("outArgs") or {})
    for oracle_name, ts_key in ((node or {}).get("ts_outputs") or {}).items():
        if isinstance(ret, dict) and ts_key in ret:
            out[oracle_name] = ret[ts_key]
        elif ts_key in out:
            out[oracle_name] = out[ts_key]
    return out


class TSWorker:
    def __init__(self):
        self.proc = None

    def _spawn(self):
        self.proc = subprocess.Popen(
            ["node_modules/.bin/tsx", WORKER_TS],
            cwd=ENGINE_DIR,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, bufsize=1, start_new_session=True,
        )
        line = self.proc.stdout.readline() or ""
        if line.strip() != "READY":
            self._kill()
            raise RuntimeError("TS parity worker failed to boot (no READY): %r" % line)

    def _kill(self):
        if self.proc is not None:
            import signal
            try:
                os.killpg(os.getpgid(self.proc.pid), signal.SIGKILL)
            except Exception:
                try: self.proc.kill()
                except Exception: pass
            try: self.proc.wait(timeout=5)
            except Exception: pass
            self.proc = None

    def _readline_timeout(self, timeout):
        result = [None]
        def _read():
            try: result[0] = self.proc.stdout.readline()
            except Exception: result[0] = None
        th = threading.Thread(target=_read, daemon=True)
        th.start(); th.join(timeout)
        if th.is_alive():
            return None
        return result[0]

    def eval(self, fn_id, args, node=None):
        """Return the TS port's outputs dict. Retries once on crash.

        generic_worker.ts is module-addressed ({modulePath, exportName}) rather than name-keyed
        ({fn}) like the deleted engine worker, because it dynamically imports the ACTUAL ported
        module instead of maintaining a hand-written table of wrappers — that is what lets the
        oracle scale past a handful of nodes. `node` carries ts_module/ts_fn from registry.json.
        """
        mod = (node or {}).get("ts_module")
        for _attempt in range(2):
            if self.proc is None or self.proc.poll() is not None:
                self._spawn()
            if mod:
                # generic_worker takes POSITIONAL args; the registry's signature gives their order.
                # The old engine worker took a name->value dict because each wrapper was hand-written
                # and could destructure. Marshal here rather than changing the worker, which is the
                # scalable side (it dynamically imports the real port instead of a wrapper table).
                # INPUT kinds, in signature order. `in_array` must be included: it is an input
                # the port takes as a real argument (generic_worker documents the kind and passes
                # it straight through). Filtering to kind == "in" alone silently DROPPED every
                # array argument, so e.g. OZBezierEval(ctrl[4], u) was called as OZBezierEval(u)
                # and returned undefined -> the driver compared a float against None and G4 died
                # with `unsupported operand type(s) for -: 'float' and 'NoneType'`. argKinds is
                # sent too, so the worker knows which positions are arrays.
                sig_args = (((node or {}).get("oracle") or {}).get("signature") or {}).get("args", [])
                in_args = [a for a in sig_args if a.get("kind") in ("in", "in_array")]
                if isinstance(args, dict):
                    names = [a.get("name") for a in in_args]
                    pos = [args[n] for n in names if n in args] if names else list(args.values())
                    kinds = [a.get("kind") for a in in_args if a.get("name") in args] if names else []
                else:
                    pos = args
                    kinds = [a.get("kind") for a in in_args]
                payload = {"modulePath": os.path.join(_REPO, mod), "exportName": fn_id, "args": pos}
                if kinds and len(kinds) == len(pos):
                    payload["argKinds"] = kinds
                req = json.dumps(payload) + "\n"
            else:
                req = json.dumps({"fn": fn_id, "args": args}) + "\n"
            try:
                self.proc.stdin.write(req); self.proc.stdin.flush()
                reply = self._readline_timeout(CALL_TIMEOUT_S)
            except (BrokenPipeError, ValueError, OSError):
                reply = None
            if reply is None:
                self._kill(); continue
            reply = reply.strip()
            if not reply:
                self._kill(); continue
            obj = json.loads(reply)
            if not obj.get("ok"):
                raise RuntimeError("TS parity error for %s: %s" % (fn_id, obj.get("error")))
            if "outputs" in obj:
                return obj["outputs"]
            if mod:
                return _normalize_outputs(obj, node)
            return obj
        raise RuntimeError("TS parity worker crashed/hung evaluating %s" % fn_id)

    def close(self):
        if self.proc is not None:
            try:
                self.proc.stdin.write("QUIT\n"); self.proc.stdin.flush()
            except Exception:
                pass
            self._kill()


if __name__ == "__main__":
    w = TSWorker()
    try:
        for t in (0.0, 0.25, 0.5, 0.75, 1.0):
            print("TS easeInOut(%.2f) ->" % t,
                  w.eval("PCMath_easeInOut", {"t": t, "easeIn": 0.25, "easeOut": 0.25, "v0": 0.0, "v1": 1.0}))
    finally:
        w.close()
