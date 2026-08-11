#!/usr/bin/env python3
"""test_doctor_layer_labels.py — lock `swarm_doctor`'s duplicate-layer-label check against the
shape of `prove_all.py`, in BOTH shapes, and against the way it failed.

WHY THIS EXISTS. `check_layer_letters` was written when `prove_all.layer2()` was thirteen
hand-numbered blocks, and it found its labels with `print("LAYER 2<letter>`. When main turned the
layers into a `LAYER2 = [(label, desc, cmd, token), …]` table — the fix three ops entries had asked
for — that pattern matched nothing, and the check reported

    ??   layer-letters  found no LAYER labels in prove_all.py on origin/main — the label format
                        changed, or this check's pattern is stale; it is not evidence of anything

on every run. The message is honest and the UNKNOWN is the correct verdict for "could not run", but
no state of a healthy repo could ever clear it: the check had stopped checking while still occupying
a line in the report. Measured 2026-08-11 by reviewer 2 against a main whose fifteen labels were all
distinct.

The lesson generalises past this one regex, and is what the cases below encode: a check that
IDENTIFIES its subject by matching source text can be retired by a legitimate refactor of that
subject, silently, and the only thing that notices is a suite that feeds it both shapes.

SELF-CONTAINED: no network, no `gh`, no pool, no `~/.fct-pool`. It reads `prove_all.py` from
`origin/main` through `git show` (falling back to the working tree) and drives the extractor with
in-memory source text.

    bash/python3 raw-port/army/tools/test_doctor_layer_labels.py
    DOCTOR_BIN=<path to a mutated copy> python3 …    # what the mutation runs below use
"""
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
DOCTOR = os.environ.get("DOCTOR_BIN", os.path.join(HERE, "swarm_doctor.py"))

PASS = 0
FAIL = 0


def ok(label):
    global PASS
    PASS += 1
    print(f"  ok   — {label}")


def bad(label, detail):
    global FAIL
    FAIL += 1
    print(f"  FAIL — {label}\n         {detail}")


def load_doctor(path):
    """Import swarm_doctor from an explicit path (the mutants are copies elsewhere)."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("swarm_doctor_under_test", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def prove_all_source():
    """prove_all.py as it is ON MAIN — the same source the check itself reads."""
    r = subprocess.run(["git", "show", "origin/main:raw-port/army/verifier/prove_all.py"],
                       cwd=REPO, capture_output=True, text=True)
    if r.returncode == 0 and r.stdout.strip():
        return r.stdout
    with open(os.path.join(REPO, "raw-port/army/verifier/prove_all.py")) as f:
        return f.read()


LEGACY = '''
def layer2():
    r9 = run([sys.executable, "test_queue_coverage.py"])
    ok9 = "test_queue_coverage: PASS" in r9.stdout
    print("LAYER 2i (queue coverage):", "PASS" if ok9 else "FAIL")
    r10 = run(["bash", "test_pr_base_is_main.sh"])
    ok10 = "test_pr_base_is_main: PASS" in r10.stdout
    print("LAYER 2j (a PR's base must be main):", "PASS" if ok10 else "FAIL")
    return ok9 and ok10
'''

UNRECOGNISABLE = '''
def layer2():
    """A shape nobody has written yet."""
    return all(run_layer(x) for x in discover("verifier/layers/*.py"))
'''


def main():
    doc = load_doctor(DOCTOR)
    labels_of = doc.prove_all_layer_labels
    src = prove_all_source()

    # ── 1. THE REGRESSION ITSELF: the CURRENT shape must be readable ────────────────────────────
    got = labels_of(src)
    if len(got) >= 5:
        ok(f"1  main's LAYER2 table is read ({len(got)} labels: {' '.join(got[:6])}…)")
    else:
        bad("1  main's LAYER2 table must be read", f"got {got!r} — this is the blind check, back")

    # ── 2. …and main must be CLEAN by it, or the check is a red nobody can clear ────────────────
    dupes = sorted({l for l in got if got.count(l) > 1})
    if not dupes:
        ok("2  main's labels are all distinct, so the check reports OK rather than a stuck FAIL")
    else:
        bad("2  main must be clean", f"duplicate label(s) on main: {dupes}")

    # ── 3. A PLANTED DUPLICATE MUST BE SEEN. The whole point of the check. ──────────────────────
    victim = got[-1]
    planted = src.replace(f'    ("{victim}",', f'    ("{got[0]}",', 1)
    if planted == src:
        bad("3  the duplicate case must be applicable", "could not plant a duplicate row")
    else:
        pl = labels_of(planted)
        if pl.count(got[0]) > 1:
            ok(f"3  a duplicated row label is detected ({got[0]} x{pl.count(got[0])})")
        else:
            bad("3  a duplicated row label must be detected", f"got {pl!r}")

    # ── 4. BACK-COMPAT: the legacy print() shape still reads, so a revert cannot blind it ───────
    leg = labels_of(LEGACY)
    if leg == ["2i", "2j"]:
        ok("4  the legacy print(\"LAYER 2x\") shape still reads")
    else:
        bad("4  the legacy shape must still read", f"got {leg!r}")

    # ── 5. AND "I DON'T RECOGNISE THIS" MUST STAY EMPTY, so the caller says UNKNOWN, never OK ───
    unk = labels_of(UNRECOGNISABLE)
    if unk == []:
        ok("5  an unrecognisable shape returns nothing (the caller's UNKNOWN, never a false OK)")
    else:
        bad("5  an unrecognisable shape must return nothing", f"got {unk!r} — a false OK")

    # ── 6. The rows must come from the TABLE, not from any tuple that looks like one ────────────
    decoy = src + '\n\nSOMETHING_ELSE = [\n    ("2b",\n     "a decoy that is not a layer"),\n]\n'
    if labels_of(decoy) == got:
        ok("6  a look-alike tuple outside the LAYER2 table is not counted as a layer")
    else:
        bad("6  only the LAYER2 table counts", f"decoy changed the labels: {labels_of(decoy)!r}")

    print(f"BASELINE (M0): {PASS} passed, {FAIL} failed")
    if FAIL:
        print("test_doctor_layer_labels: FAIL")
        return 1

    # ── mutants: the suite must go RED when the repair is removed ───────────────────────────────
    if os.environ.get("DOCTOR_MUT_CHILD"):
        return 0
    with open(DOCTOR) as f:
        doctor_src = f.read()
    mutants = [
        ("no_table_branch",
         lambda s: re.sub(r"    table = re\.search\(r'\^LAYER2.*?\n            return rows\n",
                          "    table = None\n", s, flags=re.S),
         "reading the LAYER2 table — this IS the blind check that shipped"),
        ("no_legacy_branch",
         lambda s: s.replace("""    return re.findall(r'print\\(\\s*"LAYER (\\d+[a-z])\\b', src)""",
                             "    return []"),
         "reading the legacy print() shape"),
    ]
    mfail = 0
    tmp = tempfile.mkdtemp()
    # M0 CONTROL FIRST: an unmutated copy through the same pipeline must PASS. Without it a mutant
    # killed by a broken harness (a bad path, an import error) is indistinguishable from a catch —
    # the failure this repo files most often.
    for name, mutate, what, expect_survive in (
            [("M0", lambda s: s, "nothing — this is the control", True)]
            + [(n, m, w, False) for n, m, w in mutants]):
        p = os.path.join(tmp, f"swarm_doctor_{name}.py")
        mutated = mutate(doctor_src)
        if not expect_survive and mutated == doctor_src:
            print(f"  MUTANT {name} — NOT APPLIED (the pattern moved); treat as no evidence")
            mfail += 1
            continue
        with open(p, "w") as f:
            f.write(mutated)
        env = dict(os.environ, DOCTOR_BIN=p, DOCTOR_MUT_CHILD="1")
        rc = subprocess.run([sys.executable, os.path.abspath(__file__)],
                            env=env, capture_output=True, text=True).returncode
        survived = rc == 0
        if expect_survive and survived:
            print(f"  control {name} survived, as it must (the mutation pipeline perturbs nothing)")
        elif expect_survive and not survived:
            print(f"  CONTROL {name} WAS KILLED — the harness is measuring itself, not the check")
            mfail += 1
        elif survived:
            print(f"  MUTANT {name} SURVIVED — the suite is blind to {what}")
            mfail += 1
        else:
            print(f"  mutant {name} killed (would break {what})")
    if mfail:
        print("test_doctor_layer_labels: FAIL (a mutant survived, or a control died)")
        return 1
    print(f"test_doctor_layer_labels: PASS ({PASS} cases, {len(mutants)} mutants killed + the M0 control)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
