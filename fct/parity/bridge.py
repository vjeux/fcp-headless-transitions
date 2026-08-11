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
                if isinstance(args, dict):
                    names = [a.get("name") for a in
                             (((node or {}).get("oracle") or {}).get("signature") or {}).get("args", [])
                             if a.get("kind") == "in"]
                    pos = [args[n] for n in names if n in args] if names else list(args.values())
                else:
                    pos = args
                req = json.dumps({"modulePath": os.path.join(_REPO, mod),
                                  "exportName": fn_id, "args": pos}) + "\n"
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
            return obj.get("outputs", obj)
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
