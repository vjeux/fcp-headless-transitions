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

ENGINE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "engine")
CALL_TIMEOUT_S = float(os.environ.get("FCT_PARITY_TIMEOUT", "20"))


class TSWorker:
    def __init__(self):
        self.proc = None

    def _spawn(self):
        self.proc = subprocess.Popen(
            ["node_modules/.bin/tsx", "test/_parity_worker.ts"],
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

    def eval(self, fn_id, args):
        """Return the TS port's outputs dict for (fn_id, args). Retries once on crash."""
        for _attempt in range(2):
            if self.proc is None or self.proc.poll() is not None:
                self._spawn()
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
            return obj["outputs"]
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
