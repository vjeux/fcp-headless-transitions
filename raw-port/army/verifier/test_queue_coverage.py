#!/usr/bin/env python3
"""test_queue_coverage.py — lock `swarm_doctor.check_queue_coverage` against the tool it audits.

WHY THIS EXISTS. The coverage check is the doctor's most valuable assertion (every open PR must be
claimable by SOME queue) and also its most dangerous, because it is the one check that RE-STATES a
queue's behaviour: it lifts each selector, and then, for `rebase_claim` only, re-applies the status
DESCRIPTION grep that the loop performs after the prefilter. A re-statement that drifts from the
tool does not fail loudly — it accuses the wrong PRs, or certifies stranded ones, in a report agents
are told to trust. That has already happened once: the first version of this check reported two live
PRs backwards in a single run.

The drift these cases pin is the one `rebase_claim`'s DIRTY branch introduces. A conflicted PR is
selected on the conflict alone and NO description is read, because such a PR is usually gate-GREEN
with a description about something else ("no raw-port/src ports to gate (infra/tooling PR)"), which
is exactly why those PRs stranded with no queue. If the doctor re-applies the grep to them it
reports `rebase_claim=0` while the queue is handing them out.

  A  a DIRTY-selected PR whose description does not match is COVERED          (doctor follows the tool)
  B  a non-DIRTY FAILURE whose description does not match is still UNCOVERED  (not a blanket exemption)
  C  a DIRTY PR retired by rebase_claim's own attempt cap is UNCOVERED        (#28: state, not a filter)
  D  against an older rebase_claim with no DIRTY branch, nothing is exempt    (detected, not assumed)

EVERY CASE IS MUTATION-CHECKED: the fix is reverted in a scratch copy of `swarm_doctor.py` and the
case must go RED. A lock that cannot fail is not a lock, and a false "locked" is worse than an
honest "not locked" — that rule is itself an OPS_LOG entry, learned when a carry-check compared a
hand-built set against itself and passed with the entire carry block deleted.

Entirely OFFLINE: `gh_json`, `sh` and `from_main` are stubbed, so this suite makes no network call,
takes no lease, and posts nothing. It cannot silently skip when GitHub is unreachable.
"""
import importlib.util
import os
import re
import sys
import tempfile
import types

HERE = os.path.dirname(os.path.abspath(__file__))
DOCTOR = os.path.join(os.path.dirname(HERE), "tools", "swarm_doctor.py")
fails = []

SHA = {601: "a" * 40, 602: "b" * 40, 603: "c" * 40, 604: "d" * 40}

# One live-shaped situation, four PRs, each in a different queue state.
#   601  DIRTY, gate SUCCESS, APPROVED   — the class this whole fix exists for (claimable: yes)
#   602  gate FAILURE, description "1 G5 flag(s)" — a real strander (claimable: NO)
#   603  DIRTY, but its attempt counter is at the cap on THIS head (claimable: NO)
#   604  gate FAILURE, description "regression (rebase needed)" — the ordinary path (claimable: yes)
PRS = [
    {"number": 601, "reviewDecision": "APPROVED", "mergeStateStatus": "DIRTY",
     "statusCheckRollup": [{"context": "faithfulness-gate", "state": "SUCCESS"}]},
    {"number": 602, "reviewDecision": None, "mergeStateStatus": "BLOCKED",
     "statusCheckRollup": [{"context": "faithfulness-gate", "state": "FAILURE"}]},
    {"number": 603, "reviewDecision": None, "mergeStateStatus": "DIRTY",
     "statusCheckRollup": [{"context": "faithfulness-gate", "state": "SUCCESS"}]},
    {"number": 604, "reviewDecision": None, "mergeStateStatus": "BLOCKED",
     "statusCheckRollup": [{"context": "faithfulness-gate", "state": "FAILURE"}]},
]
DESC = {601: "no raw-port/src ports to gate (infra/tooling PR)",
        602: "1 G5 flag(s): OZFoo_bar",
        603: "",
        604: "regression (rebase needed): DIRTY on OPS_LOG.md"}

# The selector rows each queue's own query would print. rebase_claim emits a 4th field carrying
# mergeStateStatus; that field is the whole point of the branch under test.
ROWS = {
    "rebase_claim.sh": "\n".join(
        f"{n}\tport/x{n}\t{SHA[n]}\t{'DIRTY' if n in (601, 603) else 'BLOCKED'}"
        for n in (601, 602, 603, 604)),
    "review_claim.sh": "",
    "rework_claim.sh": "",
}

# Fake tool sources: only the shapes the doctor reads out of them have to be real — the `cand=`/
# `rows=` assignment it lifts, and (for rebase_claim) the description grep and the DIRTY branch.
SRC_NEW = """#!/bin/bash
cmd_claim () {
  cand=$(gh pr list --repo "$SLUG" --state open --limit 100 \\
      --json number,headRefName,headRefOid,statusCheckRollup,mergeStateStatus \\
      --jq 'REBASE_PROBE' 2>/dev/null)
  while IFS=$'\\t' read -r num br sha ms; do
    if [ "${ms:-}" = "DIRTY" ]; then continue; fi
    echo "$desc" | grep -qiE 'regression|rebase|add-only|G6|gate reject' || continue
  done <<< "$cand"
}
"""
SRC_OLD = """#!/bin/bash
cmd_claim () {
  cand=$(gh pr list --repo "$SLUG" --state open --limit 100 \\
      --json number,headRefName,headRefOid,statusCheckRollup \\
      --jq 'REBASE_PROBE' 2>/dev/null)
  while IFS=$'\\t' read -r num br sha; do
    echo "$desc" | grep -qiE 'regression|rebase|add-only|G6|gate reject' || continue
  done <<< "$cand"
}
"""
SRC_OTHER = {
    "review_claim.sh": '#!/bin/bash\n  rows=$(gh pr list --repo "$SLUG" --jq \'REVIEW_PROBE\')\n',
    "rework_claim.sh": '#!/bin/bash\n  cand=$(gh pr list --repo "$SLUG" --jq \'REWORK_PROBE\')\n',
}


def load(mutate=None):
    """Import swarm_doctor (optionally with one line mutated) as a fresh module object."""
    src = open(DOCTOR).read()
    if mutate:
        old, new = mutate
        if old not in src:
            raise AssertionError(f"mutation target not present in swarm_doctor.py: {old!r}")
        src = src.replace(old, new, 1)
    fd, path = tempfile.mkstemp(suffix="_doctor.py")
    with os.fdopen(fd, "w") as f:
        f.write(src)
    spec = importlib.util.spec_from_file_location("doctor_under_test", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    os.unlink(path)
    return mod


def run(doc, state_dir, old_tool=False):
    """Drive the REAL check_queue_coverage with GitHub and the tool sources stubbed."""
    doc.STATE = state_dir
    doc.time = types.SimpleNamespace(sleep=lambda *_a, **_k: None)
    doc.results.clear()
    doc.MAIN_SHA = "deadbeef"

    def gh_json(args, tries=3):
        if args.startswith("pr list"):
            return [dict(p) for p in PRS], None
        m = re.match(r"pr view (\d+)", args)
        n = int(m.group(1))
        pr = next(p for p in PRS if p["number"] == n)
        if "headRefOid" in args:
            return {"headRefOid": SHA[n]}, None
        return {"state": "OPEN", "reviewDecision": pr["reviewDecision"],
                "mergeStateStatus": pr["mergeStateStatus"],
                "statusCheckRollup": pr["statusCheckRollup"]}, None

    def from_main(relpath):
        name = os.path.basename(relpath)
        if name == "rebase_claim.sh":
            return SRC_OLD if old_tool else SRC_NEW
        return SRC_OTHER.get(name, "")

    class R:
        def __init__(self, out=""):
            self.returncode, self.stdout, self.stderr = 0, out, ""

    def sh(cmd, cwd=None, timeout=120):
        if "REBASE_PROBE" in cmd:
            return R(ROWS["rebase_claim.sh"])
        if "REVIEW_PROBE" in cmd:
            return R(ROWS["review_claim.sh"])
        if "REWORK_PROBE" in cmd:
            return R(ROWS["rework_claim.sh"])
        m = re.search(r"commits/([0-9a-f]{40})/statuses", cmd)
        if m:
            n = next(k for k, v in SHA.items() if v == m.group(1))
            return R(DESC[n])
        return R("")

    doc.gh_json, doc.from_main, doc.sh = gh_json, from_main, sh
    doc.check_queue_coverage()
    res = doc.results[-1]
    orphans = {int(x) for x in re.findall(r"#(\d+) \(review=", res["detail"])}
    sizes = dict(re.findall(r"(\w+)=(\d+)", res["detail"].split("[selectors consulted")[-1]))
    return res["status"], orphans, sizes


def state_with_cap(td):
    """rebase_attempts state: #603 is at 3/3 on its CURRENT head, so the queue will not offer it."""
    d = os.path.join(td, "rebase_attempts")
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "603"), "w").write("3\n")
    open(os.path.join(d, "603.sha"), "w").write(SHA[603] + "\n")
    return td


def check(name, cond, detail):
    if not cond:
        fails.append(f"{name}: {detail}")


with tempfile.TemporaryDirectory() as td:
    state = state_with_cap(td)

    # ── the fixed doctor, against the fixed tool ────────────────────────────────────────────────
    doc = load()
    status, orphans, sizes = run(doc, state)
    check("A", 601 not in orphans,
          "a DIRTY PR the queue selects on the conflict alone was reported as claimable by nobody "
          f"(orphans={sorted(orphans)}) — the doctor re-applied a grep the queue skips")
    check("A", sizes.get("rebase_claim") == "2",
          "rebase_claim coverage should be exactly #601 (conflict) + #604 (regression description) "
          f"= 2 — #603 is selected but retired by its own cap, got {sizes}")
    check("B", 602 in orphans,
          "a non-DIRTY FAILURE whose description matches nothing must still be UNCOVERED — the "
          f"exemption has become blanket (orphans={sorted(orphans)})")
    check("B", 604 not in orphans,
          f"the ordinary regression path stopped being covered (orphans={sorted(orphans)})")
    check("C", 603 in orphans,
          "a DIRTY PR sitting at its attempt cap is offered by NO queue, and must be named as "
          f"uncovered rather than counted (orphans={sorted(orphans)})")
    check("A/B/C", status == doc.FAIL, f"expected FAIL with #602/#603 stranded, got {status}")

    # ── D: an OLDER rebase_claim, with no DIRTY branch, must get the old behaviour ───────────────
    status_o, orphans_o, _ = run(load(), state, old_tool=True)
    check("D", 601 in orphans_o,
          "against a rebase_claim that cannot select a conflict, a green DIRTY PR is genuinely "
          f"claimable by nobody — the exemption must be detected, not assumed (orphans={sorted(orphans_o)})")

    # ── MUTATIONS: each case must go RED when its fix is reverted ────────────────────────────────
    MUTS = [
        ("A", ("if dirty_bypass and dirty_selected(n):", "if False:"),
         lambda o: 601 in o, "reverting the DIRTY exemption did not strand #601"),
        ("B", ("if dirty_bypass and dirty_selected(n):", "if True:"),
         lambda o: 602 not in o, "a blanket exemption did not wrongly cover #602"),
        ("C", ("if not retired_by_cap(n):", "if True:"),
         lambda o: 603 not in o, "ignoring the attempt cap did not wrongly cover #603"),
        ("D", ('dirty_bypass = "DIRTY" in rebase_src', "dirty_bypass = True"),
         None, "assuming the bypass did not wrongly cover #601 against the OLD tool"),
    ]
    for name, mut, pred, why in MUTS:
        try:
            m = load(mut)
        except AssertionError as e:
            fails.append(f"{name} mutation: {e}")
            continue
        if name == "D":
            _s, o, _z = run(m, state, old_tool=True)
            ok = 601 not in o
        else:
            _s, o, _z = run(m, state)
            ok = pred(o)
        check(f"{name} mutation", ok, f"{why} (orphans={sorted(o)}) — the case cannot fail, so it "
                                      f"is not evidence")

print(f"test_queue_coverage: {'FAIL' if fails else 'PASS'}"
      + ("" if not fails else "\n  " + "\n  ".join(fails)))
sys.exit(1 if fails else 0)
