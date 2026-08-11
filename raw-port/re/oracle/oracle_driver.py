#!/usr/bin/env python3
"""oracle_driver — run a TypeScript driver under a BOUND, and score a hang as a kill.

WHY THIS EXISTS (2026-08-11). Two `node`/`tsx` driver processes were found spinning at ~98% CPU,
one of them for **2h31m** (66 CPU-minutes). Both were mutants of
`OZChannelBase::isDescendantOf`, and the mutant was this:

    for (;;) {
      // MUTANT: compare before the load
      if (false) cur = cur.__parent_folder_at_0x30 as OZChannelBase | null;
      if ((cur as unknown) === (folder as unknown)) break;
      if (cur === null) break;
    }

Disabling the pointer advance makes the loop compare the same `cur` forever: neither `break` can
ever fire. That is CORRECT behaviour for a mutant — the whole point is that a mutant must fail. The
defect was in the harness: "fail" had been taken to mean *returns a wrong answer*, when it can
equally mean **never returns at all**, and nothing was watching for the second kind.

    69 of 69 driver-spawning subprocess calls in this repo passed NO timeout.

So the parent blocked forever on `subprocess.run`, the agent that started it finished its shift
hours earlier, and the orphan kept a core hot indefinitely. At the peak these two plus two wedged
crash reporters were four cores of pure waste on a ten-core box, and the load they produced was
initially blamed on the swarm doing real work.

THE RULE THIS ENCODES: **a driver that does not terminate is a mutant that was killed.** A hang is
evidence — the strongest kind, since a mutant that cannot even finish plainly does not compute what
the original computed. Scoring it as a kill is not a convenience; treating it as "no result" is what
let an infinite loop read as a pending measurement for two and a half hours.

USAGE

    from oracle_driver import run_driver
    r = run_driver(["node", "--experimental-strip-types", driver], input=payload)
    if r.timed_out:
        ...                      # for a MUTANT: a kill. for the BASE MODEL (M0): a harness fault.
    data = json.loads(r.stdout)

`timeout` defaults to FCT_DRIVER_TIMEOUT (env) or 120s, which is ~100x the slowest healthy driver
measured in this repo; a legitimate long corpus should pass its own bound explicitly rather than
raising the default for everyone.
"""
import os
import signal
import subprocess

DEFAULT_TIMEOUT = int(os.environ.get("FCT_DRIVER_TIMEOUT", "120"))


class DriverResult:
    """A CompletedProcess, plus the one bit subprocess cannot tell you afterwards."""

    __slots__ = ("returncode", "stdout", "stderr", "timed_out", "seconds")

    def __init__(self, returncode, stdout, stderr, timed_out, seconds):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr
        self.timed_out = timed_out
        self.seconds = seconds

    def __bool__(self):
        return self.returncode == 0 and not self.timed_out


def run_driver(cmd, input=None, timeout=None, cwd=None, env=None):
    """Run a driver with a hard bound. Never raises TimeoutExpired; reports it instead.

    KILLS THE WHOLE PROCESS GROUP, not just the child. `subprocess.run(timeout=...)` kills only the
    direct child, and `tsx` runs the real work in a grandchild — so the bound would return while the
    thing actually burning the CPU kept going, which is exactly the orphan this module exists to
    prevent, arriving through the fix for it. start_new_session puts the child in its own group so
    one killpg reaches all of it.
    """
    t = DEFAULT_TIMEOUT if timeout is None else timeout
    import time as _time
    t0 = _time.time()
    p = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE if input is not None else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd,
        env=env,
        start_new_session=True,
    )
    try:
        out, err = p.communicate(input=input, timeout=t)
        return DriverResult(p.returncode, out, err, False, _time.time() - t0)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(os.getpgid(p.pid), signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            p.kill()
        # Reap, so the harness does not leave a zombie behind on the way out.
        try:
            out, err = p.communicate(timeout=10)
        except Exception:
            out, err = "", ""
        return DriverResult(124, out, err, True, _time.time() - t0)


def score_mutant(result, label=""):
    """-> (killed: bool, why: str) for one mutant run.

    A hang is a kill. So is a crash, and so is a non-zero exit: each means the mutated port did not
    produce the original's answer. The caller still has to compare OUTPUT for the mutants that do
    finish — this only settles the ones that never get that far.
    """
    if result.timed_out:
        return True, f"{label}KILLED (hang: no result in {result.seconds:.0f}s)"
    if result.returncode != 0:
        return True, f"{label}KILLED (exit {result.returncode})"
    return False, f"{label}ran to completion — compare its output"
