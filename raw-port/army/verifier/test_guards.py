#!/usr/bin/env python3
"""test_guards.py — pin the guards that stop a tool from overriding a person's judgement.

Each is a live incident from 2026-08-11. Every case is mutation-checked: the fix is reverted in a
scratch copy and the case must go red, because a guard you have never watched fail is not evidence
(OPS_LOG's own rule, learned the same day).

  A  wt_pool must abort an interrupted rebase before handing the slot on   (commit onto stale state)
  B  wt_pool must purge re/disasm/*.s on reset                            (G5 flag suppressed by residue)
  C  pr_review --expect-head must refuse a moved head                     (signature onto unread code)
  D  regression_check must not read a cited .s FILENAME as a symbol       (false regression, no rebase clears it)
  E  review_claim's queue query must still SELECT something                (a filter that matches nothing)
  F  review_claim's self-review skip must actually SKIP                    (a guard that cannot fire)

C and F run entirely offline against copies in a tempdir with a stubbed `gh_as.sh`. That is not
squeamishness: C used to drive the REAL `pr_review.sh` at the first open PR it could find, so its
FAILURE mode was posting a review body reading "evidence" onto an arbitrary peer's PR — a test that
writes to the permanent record when it breaks is a bad trade for a suite that runs at every reviewer
startup. Offline also means C and F cannot silently skip when GitHub is unreachable, which is the
other half of the same problem: a run where two cases never executed printed exactly like a full pass.
"""
import os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # raw-port/
TOOLS = os.path.join(os.path.dirname(HERE), "tools")
fails = []
skipped = []


def sh(cmd, cwd=None):
    return subprocess.run(["bash", "-c", cmd], cwd=cwd, capture_output=True, text=True)


# ── A + B: reset_clean, exercised for real on a scratch git tree ────────────────────────────────
with tempfile.TemporaryDirectory() as td:
    repo = os.path.join(td, "r")
    sh(f"git init -q -b main {repo} && cd {repo} && git config user.email t@t && git config user.name t "
       f"&& mkdir -p raw-port/src raw-port/re/disasm && echo x > raw-port/src/a.ts "
       f"&& git add -A && git commit -qm base && git branch -f origin-main-sim")
    # simulate the two states release must clean up
    gitdir = os.path.join(repo, ".git")
    os.makedirs(os.path.join(gitdir, "rebase-merge"), exist_ok=True)     # interrupted rebase
    open(os.path.join(repo, "raw-port/re/disasm/Stale.s"), "w").write("; leftover from a peer\n")

    # the two behaviours reset_clean must have, extracted as the shell it runs
    sh("for seq in rebase merge cherry-pick revert; do git rebase --abort >/dev/null 2>&1 || true; done; "
       "rm -rf .git/rebase-merge; rm -f raw-port/re/disasm/*.s", cwd=repo)
    if os.path.isdir(os.path.join(gitdir, "rebase-merge")):
        fails.append("A. an interrupted rebase survived the reset")
    if os.path.exists(os.path.join(repo, "raw-port/re/disasm/Stale.s")):
        fails.append("B. leftover disasm scratch survived the reset")

# The scratch shell above proves the COMMANDS work; these check the real script actually runs them.
# Both look inside reset_clean only, and both ignore comments — an earlier version of case B matched
# the word "re/disasm/*.s" anywhere in the file, so the explanatory COMMENT kept it green with the
# code deleted. That is the same unfalsifiable-test flaw this suite exists to avoid.
wt_src = open(os.path.join(TOOLS, "wt_pool.sh")).read()
m = re.search(r'^reset_clean \(\) \{(.*?)^\}', wt_src, re.S | re.M)
body = "" if not m else "\n".join(
    l for l in m.group(1).split("\n") if not l.strip().startswith("#"))
if not m:
    fails.append("A/B. could not find reset_clean() in wt_pool.sh")
else:
    if "--abort" not in body:
        fails.append("A. reset_clean does not abort an in-progress rebase/merge")
    if not re.search(r'rm\s+-f\s+.*re/disasm/\*\.s', body):
        fails.append("B. reset_clean does not purge re/disasm/*.s")
if "wt_sequence_in_progress" not in wt_src:
    fails.append("A. wt_pool.sh has no post-reset in-progress-sequence assertion")

# ── C: pr_review refuses a head that moved (offline, against a stubbed gh_as.sh) ────────────────
# The stub answers `pr view --json headRefOid` with a fixed SHA and RECORDS any POST to a file, so
# the case can assert the two things that matter: a mismatched --expect-head must refuse AND must
# not post, and a matching one must get through to the post. Nothing here touches GitHub.
STUB = """#!/bin/bash
shift                      # drop the role argument
if [ "${1:-}" = "pr" ] && [ "${2:-}" = "view" ]; then echo "%(sha)s"; exit 0; fi
if [ "${1:-}" = "api" ]; then
  case "$*" in
    *-X\ POST*) echo posted >> "$STUB_POSTS"; echo '{"id":1}'; exit 0 ;;
    *)          echo '[]'; exit 0 ;;                     # the reviews list: no prior verdict
  esac
fi
exit 0
"""
LIVE_SHA = "1111111111111111111111111111111111111111"
with tempfile.TemporaryDirectory() as td:
    import shutil
    shutil.copy(os.path.join(TOOLS, "ghapp", "pr_review.sh"), td)
    stub = os.path.join(td, "gh_as.sh")
    open(stub, "w").write(STUB % {"sha": LIVE_SHA})
    os.chmod(stub, 0o755)
    body = os.path.join(td, "body.md")
    open(body, "w").write("evidence\n")
    posts = os.path.join(td, "posts")
    env = f'STUB_POSTS={posts} FCT_STATE_DIR={td}/state '

    r = sh(env + f"bash {td}/pr_review.sh 1 comment --expect-head "
           f"0000000000000000000000000000000000000000 --body-file {body}")
    if r.returncode != 5 or "REFUSING" not in r.stdout + r.stderr:
        fails.append(f"C. a moved head was not refused (exit {r.returncode})")
    if os.path.exists(posts):
        fails.append("C. a refused verdict still POSTED — the refusal must come before the submit")

    r = sh(env + f"bash {td}/pr_review.sh 1 comment --expect-head {LIVE_SHA} --body-file {body}")
    if not os.path.exists(posts):
        fails.append("C. a MATCHING --expect-head was blocked — the guard must only refuse on drift")

# ── D: regression_check's symbol regex ──────────────────────────────────────────────────────────
sys.path.insert(0, TOOLS)
import regression_check as rc  # noqa: E402
cases = {
    "re/disasm/Helium.__ZN3Foo3barEv.s": ["__ZN3Foo3barEv"],       # filename, not a symbol
    "see __ZN3Foo3barEv. Next":          ["__ZN3Foo3barEv"],       # sentence-final period
    "__ZN3Foo3barEv.cold.1 slow":        ["__ZN3Foo3barEv.cold.1"],  # a REAL suffix survives
}
for text, want in cases.items():
    got = rc.MANGLED.findall(text)
    if got != want:
        fails.append(f"D. {text!r} -> {got}, want {want}")

# ── E: review_claim's query must actually MATCH SOMETHING (end-to-end) ──────────────────────────
# The bug class this case exists for: "the filter silently matches nothing". A first version of the
# self-review guard passed `--arg` to `gh ... --jq`, which gh does not accept — it printed "unknown
# arguments", exited 0, and wrote NOTHING, so every reviewer slot would have polled NONE forever
# against a non-empty queue while prove_all stayed green. Only an end-to-end assertion catches that,
# which is exactly why reviewer 1 asked for this case rather than a unit test of the jq program.
rc_sh = os.path.join(TOOLS, "review_claim.sh")
open_prs = sh("gh pr list --repo vjeux/fcp-headless-transitions --state open --limit 100 "
              "--json number --jq 'length'").stdout.strip()
if not open_prs.isdigit():
    skipped.append("E — cannot reach GitHub")
elif int(open_prs) == 0:
    skipped.append("E — no open PRs to select from")
else:
    # Run the same pipeline cmd_claim uses, WITHOUT taking a lease: extract the rows= assignment and
    # execute it. If the query is malformed, this is empty while open PRs exist.
    src = open(rc_sh).read()
    m = re.search(r'rows=\$\(gh pr list.*?\)\n', src, re.S)
    if not m:
        fails.append("E. could not find the rows= query in review_claim.sh")
    else:
        probe = m.group(0).replace('"$SLUG"', 'vjeux/fcp-headless-transitions')
        probe = probe.replace('2>/dev/null)', ')')   # do NOT hide the error this case hunts for
        r = sh(probe + '\nprintf "%s" "$rows"')
        if r.stdout.strip() == "" and "tls:" in r.stderr.lower():
            # The corp proxy fails intermittently and OPS_LOG already records gh transport errors
            # being read as verdicts. Retry once, then SAY the case did not run — an empty result
            # this case cannot attribute is not evidence either way.
            r = sh(probe + '\nprintf "%s" "$rows"')
        if r.stdout.strip() == "" and "tls:" in r.stderr.lower():
            skipped.append("E — gh transport error (TLS), not an empty filter")
        elif r.stdout.strip() == "":
            fails.append("E. review_claim's query returned NO ROWS while "
                         f"{open_prs} PRs are open — the filter matches nothing "
                         f"(stderr: {r.stderr.strip()[:160]})")

# ── F: review_claim's self-review skip must actually SKIP ───────────────────────────────────────
# Reviewer 2 measured this guard as DORMANT at the previous head: nothing sets FCT_AGENT_ID, so its
# first condition was false on every real invocation and it could not fire — while OPS_LOG recorded
# it as fixed. Case E asserts the QUERY selects something; only this asserts the SKIP skips. It runs
# the tool's OWN skip condition, lifted verbatim out of review_claim.sh, against a stub row set, so
# deleting that condition from the tool makes this case go red.
rc_src = open(rc_sh).read()
skip_cond = re.search(
    r'^\s*if \[ -n "\$\{FCT_AGENT_ID:-\}" \].*?\n\s*&& \[ "\$\(cat "\$mine_dir/\$num".*?\n',
    rc_src, re.S | re.M)
if not skip_cond:
    fails.append("F. review_claim.sh has no self-review skip condition (searched for the "
                 "FCT_AGENT_ID + authored-marker test)")
else:
    with tempfile.TemporaryDirectory() as td:
        authored = os.path.join(td, "authored")
        os.makedirs(authored, exist_ok=True)
        open(os.path.join(authored, "4242"), "w").write("reviewer-9\n")
        harness = os.path.join(td, "h.sh")
        with open(harness, "w") as fh:
            fh.write("#!/bin/bash\nmine_dir=%s\nnum=4242\n" % authored)
            # the tool's own `if ...; then` line, with a body of our own so the case observes the
            # DECISION rather than re-stating it
            fh.write(skip_cond.group(0))
            fh.write("  echo SKIPPED; exit 0\nfi\necho CLAIMED\n")
        mine = sh("FCT_AGENT_ID=reviewer-9 bash " + harness)
        theirs = sh("FCT_AGENT_ID=reviewer-1 bash " + harness)
        unset = sh("bash " + harness)
        if "SKIPPED" not in mine.stdout:
            fails.append("F. the skip did not fire for a PR this slot authored "
                         f"(out: {mine.stdout.strip()!r} {mine.stderr.strip()[:80]!r})")
        if "CLAIMED" not in theirs.stdout:
            fails.append("F. the skip fired for a PR ANOTHER slot authored — it must not")
        if "CLAIMED" not in unset.stdout:
            fails.append("F. with FCT_AGENT_ID unset the skip must fail OPEN (claim), not skip")

# The guard is only useful if the two halves can ever agree on an id, and only honest if its dormant
# state is visible. Both were the substance of the rejection, so both are pinned here.
if "self-review skip is INACTIVE" not in rc_src:
    fails.append("F. review_claim does not announce that the skip is inactive when FCT_AGENT_ID is "
                 "unset — a dormant guard must not be silent")
ps_src = open(os.path.join(TOOLS, "pr_submit.sh")).read()
if "FCT_AGENT_ID unset" not in ps_src:
    fails.append("F. pr_submit does not refuse to stamp authored/<PR> when FCT_AGENT_ID is unset — "
                 "a hostname+pid marker can never match a reviewer's id, which is what made the "
                 "guard look wired while it was dormant")
# CODE ONLY, comments stripped — the first version of this check passed with the line deleted
# because slot_lock's own explanatory comment contains the same words. That is case B's flaw
# repeating itself two files later, which is why every check in this suite that greps a script
# strips comments first.
sl_code = "\n".join(l for l in open(os.path.join(TOOLS, "slot_lock.sh")).read().split("\n")
                     if not l.strip().startswith("#"))
if "export FCT_AGENT_ID" not in sl_code:
    fails.append("F. slot_lock.sh acquire does not print the export line that gives an agent its id")

# A run in which cases never executed must not read like a full pass — prove_all prints a child's
# output only on failure, so a silent skip is invisible exactly when it matters.
print(f"test_guards: {'FAIL' if fails else 'PASS'}"
      + (f"  ({len(skipped)} case(s) SKIPPED: {'; '.join(skipped)})" if skipped else ""))
for f in fails:
    print("   ", f)
sys.exit(1 if fails else 0)
