#!/usr/bin/env python3
"""test_verifier_contention.py — offline test for swarm_doctor's verifier-contention counting.

WHY IT EXISTS. The check reports a NUMBER, and the number is the whole message: "8 concurrent
prove_all.py runs" is actionable, "20" (the naive `pgrep | wc -l`, which counts each run's
`/bin/sh -c` wrapper and its `timeout` as separate runs) is noise, and "1" when a run is live is a
false all-clear. A count nobody can reproduce is not evidence, so the counting is a function and
this drives it over CAPTURED `ps` output — the real lines from the incident, with the wrappers.

It also pins the two smaller things the first draft got wrong: the doctor must not count ITSELF
(it greps for the string it contains), and `ps` ELAPSED sorts as [[dd-]hh:]mm:ss, so a string max
ranks '59:59' above '1-02:03:04' and names the wrong run as the oldest.

MUTATION. Each case is followed by a mutant of the very rule it covers, and the mutant must make
the case fail — a control that cannot fail is not a control (OPS_LOG, repeatedly).

    python3 raw-port/army/tools/test_verifier_contention.py     -> test_verifier_contention: PASS
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import importlib.util

spec = importlib.util.spec_from_file_location("swarm_doctor", os.path.join(HERE, "swarm_doctor.py"))
doctor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(doctor)

HEADER = "  PID ELAPSED  %CPU COMMAND\n"

# The incident, as `ps` really printed it: eight runs, each wrapped in `/bin/sh -c`, two of them
# also wrapped in `timeout`, every one at 0.0% CPU.
INCIDENT = HEADER + "\n".join([
    " 8429   05:22   0.0 /bin/sh -c cd ~/random/final-cut-pro-transitions && python3 raw-port/army/verifier/prove_all.py",
    " 8430   05:22   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    " 9320   05:10   0.0 /bin/sh -c cd /Users/vjeux/.fct-pool/wt/7 && timeout 1500 python3 raw-port/army/verifier/prove_all.py",
    " 9321   05:10   0.0 /usr/bin/timeout 1500 python3 raw-port/army/verifier/prove_all.py",
    " 9322   05:10   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    # the two that make ELAPSED ordering matter: 26 hours vs 59 minutes, where a string max picks
    # the WRONG one ('5' > '1') and reports a stale run as the oldest of the pile-up
    "11423 1-02:03:04   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "11999   59:59   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "12317   04:24   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "16252   03:28   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "21084   01:43  98.2 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "22894   01:20   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "23488   01:07   0.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    "23499   00:04   1.2 /usr/bin/python3 raw-port/army/tools/swarm_doctor.py --checks prove_all.py",
]) + "\n"

ONE_RUN = HEADER + "\n".join([
    " 4242   00:31  96.0 /usr/bin/python3 raw-port/army/verifier/prove_all.py",
    " 4241   00:31   0.0 /bin/sh -c cd /Users/vjeux/.fct-pool/wt/2 && python3 raw-port/army/verifier/prove_all.py",
]) + "\n"

IDLE = HEADER + " 1001   00:09   0.4 /usr/bin/python3 raw-port/army/tools/swarm_doctor.py\n"

passed = failed = 0


def ok(msg):
    global passed
    passed += 1
    print(f"  OK    {msg}")


def bad(msg, detail=""):
    global failed
    failed += 1
    print(f"  FAIL  {msg}")
    if detail:
        print(f"        {detail}")


def check(desc, got, want):
    if got == want:
        ok(desc)
    else:
        bad(desc, f"got {got!r}, want {want!r}")


runs = doctor._prove_all_runs(INCIDENT)
check("the incident counts as 9 RUNS, not the 12 processes ps lists", len(runs), 9)
check("a live doctor does not count itself", [p for p, _, _ in runs if p == "23499"], [])
check("one run and its shell wrapper is ONE run", len(doctor._prove_all_runs(ONE_RUN)), 1)
check("no verifier running is zero", len(doctor._prove_all_runs(IDLE)), 0)

oldest = max((e for _, e, _ in runs), key=doctor._etime_secs)
check("the oldest run is the one that is really oldest (dd-hh:mm:ss, not string order)",
      oldest, "1-02:03:04")
stalled = sum(1 for _, _, c in runs if doctor._cpu(c) < 1.0)
check("the stalled count separates 'many running' from 'many starving'", stalled, 8)

# ── mutation: each rule, broken, must break the case above ──────────────────────────────────────
def mutate(desc, fn, want_break):
    try:
        got = fn()
    except Exception as e:                                    # a crash is a break too
        ok(f"mutant killed — {desc}")
        return
    if got == want_break:
        bad(f"MUTANT SURVIVED — {desc}", f"the broken rule still produced {got!r}")
    else:
        ok(f"mutant killed — {desc}")


# counting every matching line (the naive pgrep) must NOT produce 8
mutate("dropping the wrapper filter (a run would be counted three times)",
       lambda: len([l for l in INCIDENT.splitlines()[1:] if "prove_all.py" in l]), 9)
# string-max on ELAPSED must NOT produce the right oldest
mutate("sorting ELAPSED as text (59:59 would outrank 1-02:03:04)",
       lambda: max(e for _, e, _ in runs), "1-02:03:04")
# not excluding swarm_doctor's own line must NOT produce 8
mutate("counting the doctor's own process",
       lambda: len([l for l in INCIDENT.splitlines()[1:]
                    if "prove_all.py" in l
                    and not l.split(None, 3)[3].split()[0].endswith(("sh", "timeout"))]), 9)

print()
print(f"test_verifier_contention: {'PASS' if failed == 0 else 'FAIL'} ({passed} passed, {failed} failed)")
sys.exit(0 if failed == 0 else 1)
