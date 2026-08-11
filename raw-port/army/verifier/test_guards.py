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
  G  pr_gate must not post success over a reviewer's PARKED failure        (a verdict erased by a peer)
  H  pr_gate's verdict guards must WITHHOLD when gh does not answer       (a hiccup erases the verdict)
  I  a queue lease may be released only by the agent holding it            (a peer's cleanup frees it)

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


def gh_did_not_answer(r):
    """Did the PROCESS fail, rather than the query returning nothing?

    This used to be `"tls:" in r.stderr.lower()`, i.e. a guess at the text of one failure mode. A
    server-side GraphQL 502 does not contain "tls:", so it fell through to the accusing branch and
    printed `test_guards: FAIL — review_claim's query returned NO ROWS` about a filter that was
    handing out PRs a minute earlier and a minute later. Measured: 1 failure in 4 consecutive runs,
    nothing changed in between. Since this suite is LAYER 2f of prove_all and every reviewer runs
    prove_all before signing anything, an intermittent GitHub error read as "the verifier is broken"
    at the start of every shift.

    So attribute it from the process, which cannot be wrong about itself: a non-zero exit, or
    anything at all on stderr, means gh did not answer and the case DID NOT RUN. Only a clean exit
    with empty stdout is the filter's fault.
    """
    return r.returncode != 0 or bool(r.stderr.strip())


# --offline: every case except E runs without the network by design (C and F use a stubbed
# gh_as.sh in a tempdir). A reviewer running prove_all at the start of a shift should be able to
# get a verdict that does not depend on GitHub being up at that second.
OFFLINE = "--offline" in sys.argv or os.environ.get("FCT_TEST_GUARDS_OFFLINE") == "1"


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

    # RUN THE TOOL'S OWN reset_clean, not a hand-written copy of what it is believed to run.
    # The previous version of this block executed an inline shell string, so it asserted that
    # `rm -rf` removes a directory — it could not fail unless coreutils did, and because the inline
    # copy did something the tool does not (`rm -rf .git/rebase-merge`, which was NOT in
    # reset_clean), it specifically could not see the gap it looked like it was covering. The
    # function is extracted verbatim from wt_pool.sh and executed here, so a change to the tool
    # changes what this case runs.
    wt_sh = os.path.join(TOOLS, "wt_pool.sh")
    fn = re.search(r'^reset_clean \(\) \{.*?^\}', open(wt_sh).read(), re.S | re.M)
    if not fn:
        fails.append("A+B. could not extract reset_clean() from wt_pool.sh")
    else:
        sh(f"cd {repo} && git branch -f origin/main main 2>/dev/null; true")
        r = sh(fn.group(0) + f'\nreset_clean "{repo}"')
        if os.path.isdir(os.path.join(gitdir, "rebase-merge")):
            fails.append("A. an interrupted rebase survived the tool's own reset_clean "
                         f"(stderr: {r.stderr.strip()[:120]})")
        if os.path.exists(os.path.join(repo, "raw-port/re/disasm/Stale.s")):
            fails.append("B. leftover disasm scratch survived the tool's own reset_clean")

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
_pr_count = sh("gh pr list --repo vjeux/fcp-headless-transitions --state open --limit 100 "
               "--json number --jq 'length'") if not OFFLINE else None
open_prs = _pr_count.stdout.strip() if _pr_count is not None else ""
if OFFLINE:
    skipped.append("E — --offline: the only case that needs the network")
elif not open_prs.isdigit():
    skipped.append(f"E — gh did not answer (exit {_pr_count.returncode}): "
                   f"{_pr_count.stderr.strip()[:120]}")
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
        if r.stdout.strip() == "" and gh_did_not_answer(r):
            # The corp proxy AND GitHub itself fail intermittently, and OPS_LOG already records a
            # transport error being read as a verdict. Retry once, then SAY the case did not run —
            # an empty result this case cannot attribute is not evidence either way.
            r = sh(probe + '\nprintf "%s" "$rows"')
        if r.stdout.strip() == "" and gh_did_not_answer(r):
            skipped.append(f"E — gh did not answer (exit {r.returncode}): {r.stderr.strip()[:120]}")
        elif r.stdout.strip() == "":
            fails.append("E. review_claim's query returned NO ROWS while "
                         f"{open_prs} PRs are open — the filter matches nothing "
                         f"(stderr: {r.stderr.strip()[:160]})")

# ── G: pr_gate must not post success over a reviewer's PARKED failure ───────────────────────────
# The citation becomes a test, which is what reviewer 2 asked for. The incident (#550) could not be
# caught by the CHANGES_REQUESTED guard because that PR never had one: it was a DIRTY non-src PR
# whose content was already APPROVED, so the reviewer's only available rejection was a hand-posted
# rebase-flavoured `failure` status — and another agent's gate posted `success` over it twice, six
# seconds and four minutes later. Overwriting it also hides the PR from `rebase_claim`, which finds
# work by grepping the status DESCRIPTION.
#
# Runs OFFLINE against a stubbed gh_as.sh, and drives the tool's own functions, extracted verbatim.
with tempfile.TemporaryDirectory() as td:
    src_pg = open(os.path.join(TOOLS, "pr_gate.sh")).read()
    m = re.search(r'^PARK_MARKERS=.*?^\}', src_pg, re.S | re.M)
    if not m:
        fails.append("G. could not extract parked_failure_on_this_head() from pr_gate.sh")
    else:
        stub = os.path.join(td, "gh_as.sh")

        def guard_says(state, desc):
            open(stub, "w").write('#!/bin/bash\nprintf "%s\\t%s" ' + f'"{state}" "{desc}"\n')
            os.chmod(stub, 0o755)
            script = (m.group(0) + f'\nGHAPP_G={td}; REPO_SLUG=x/y; HEAD_SHA=deadbeef\n'
                      'if parked="$(parked_failure_on_this_head)"; then echo REFUSE; else echo POST; fi')
            return sh(script).stdout.strip()

        # the incident itself, and the other park phrasing the log uses
        if guard_says("failure", "regression (rebase needed): DIRTY on OPS_LOG.md; content APPROVED by reviewer 4") != "REFUSE":
            fails.append("G. success would be posted over the #550 reviewer park")
        if guard_says("failure", "BLOCKED ON A TOOL BUG: G4 harness broken") != "REFUSE":
            fails.append("G. success would be posted over a tool-bug park")
        # ...and the three states that must NOT be blocked, or the guard wedges every PR it touches
        if guard_says("failure", "G5 cheat: 3 cheat(s)") != "POST":
            fails.append("G. an ordinary mechanical failure is treated as a reviewer park")
        if guard_says("success", "gate PASS (G0-G5 clean, 0 flags)") != "POST":
            fails.append("G. an existing green status is treated as a park")
        # THE REAL SHAPE OF "no status at all". `last` of an empty array is null, and jq renders
        # "\(.state)" on null as the literal string "null", so the tool sees "null\tnull" — not the
        # empty string this case used to feed. Both must reach POST; feeding the real one makes the
        # case right on purpose rather than by luck (reviewer 1).
        if guard_says("", "") != "POST":
            fails.append("G. a head with no status at all is treated as a park")
        if guard_says("null", "null") != "POST":
            fails.append("G. a head whose status list is EMPTY (jq emits null\tnull) is treated as a park")

        # NO STRING pr_gate CAN POST MAY LOOK LIKE A PARK — the collision that made this rework
        # necessary. `PARK_MARKERS` used to contain `regression` and `rebase needed`, which match the
        # script's own `regression (rebase needed)` and `regression_check errored rc=$rc`, so the
        # gate parked its own message and no later run could clear that head — including the re-run
        # that is the documented response to a transient regression_check error. The previous
        # version of this case probed `G5 cheat: 3 cheat(s)`, a string the tool cannot produce, so it
        # tested the right property against a value drawn from outside the tool's vocabulary and
        # passed while the collision was live (§3 of the earlier rejection, landing one file over).
        # So take the DESCRIPTIONS FROM THE TOOL: every REASON and every literal handed to
        # post_status/post_success_unless_rejected. A future collision then fails here, when it is
        # written, instead of stranding a PR.
        markers = re.search(r"^PARK_MARKERS='([^']+)'", src_pg, re.M)
        own = set(re.findall(r'REASON="([^"]*)"', src_pg))
        own |= set(re.findall(r'post_success_unless_rejected "([^"]*)"', src_pg))
        own |= set(re.findall(r'post_status\s+\w+\s+"([^"]*)"', src_pg))
        probes = []
        for d in sorted(own):
            d = (d.replace("$rc", "1").replace("${rc}", "1")
                  .replace("$FLAGS", "2").replace("${FLAGS}", "2"))
            if not d or '"' in d or "$" in d or "`" in d:
                continue                      # not a literal we can safely stand up in a probe
            probes.append(d)
        if not markers:
            fails.append("G. could not read PARK_MARKERS out of pr_gate.sh")
        elif len(probes) < 4:
            fails.append(f"G. only found {len(probes)} postable descriptions in pr_gate.sh — the "
                         "extraction has drifted from the script and is no longer evidence")
        else:
            for d in probes:
                if re.search(markers.group(1), d, re.I):
                    fails.append(f"G. pr_gate's OWN status description {d!r} matches PARK_MARKERS — "
                                 "the gate parks its own message and no later run can clear that head")
                elif guard_says("failure", d) != "POST":
                    fails.append(f"G. pr_gate's own mechanical failure {d!r} is treated as a "
                                 "reviewer park")

# ── H: pr_gate's verdict guards must WITHHOLD when gh does not answer ───────────────────────────
# Reviewer 1 drove both guards with a stub `gh_as.sh` that exits 7 and prints nothing: both answered
# "no rejection here" and the caller posted success. That is the exact outcome the guards exist to
# prevent — a green required check over a live rejection — produced by a transport hiccup, and the
# incident rate is not hypothetical: a server-side GraphQL error hit 1 in 4 consecutive runs on this
# box today. The asymmetry decides the direction: withholding a green status costs a re-run, erasing
# a verdict is permanent. So each guard must report "could not determine" (exit 2) distinctly from
# "determined: nothing there" (exit 1), and the caller must refuse on both.
# Offline, against extracted copies of the tool's own functions — same technique as G.
with tempfile.TemporaryDirectory() as td:
    src_pg = open(os.path.join(TOOLS, "pr_gate.sh")).read()
    rev_fn = re.search(r'^reviewer_rejected_this_head \(\) \{.*?^\}', src_pg, re.S | re.M)
    park_fn = re.search(r"^PARK_MARKERS='[^']+'\nparked_failure_on_this_head \(\) \{.*?^\}",
                        src_pg, re.S | re.M)
    if not rev_fn or not park_fn:
        fails.append("H. could not extract the two verdict guards from pr_gate.sh")
    else:
        stub = os.path.join(td, "gh_as.sh")

        def guards_say(stub_body):
            open(stub, "w").write(stub_body)
            os.chmod(stub, 0o755)
            script = (rev_fn.group(0) + "\n" + park_fn.group(0) +
                      f'\nGHAPP_G={td}; REPO_SLUG=x/y; PR=1; HEAD_SHA=deadbeef\n'
                      'reviewer_rejected_this_head >/dev/null; echo "REV=$?"\n'
                      'parked_failure_on_this_head >/dev/null; echo "PARK=$?"')
            return sh(script).stdout.split()

        dead = guards_say('#!/bin/bash\necho "server error" >&2\nexit 7\n')
        if "REV=2" not in dead:
            fails.append(f"H. reviewer_rejected_this_head reports 'no rejection' when gh FAILS "
                         f"(got {dead}) — a hiccup then posts success over a live rejection")
        if "PARK=2" not in dead:
            fails.append(f"H. parked_failure_on_this_head reports 'no park' when gh FAILS "
                         f"(got {dead}) — same erasure, through the park door")
        # CONTROL: with gh answering normally the same functions must say "nothing there" (1), or
        # the case above would pass on a guard that withholds unconditionally — which would wedge
        # every PR in the swarm and is the failure mode of the fix, not of the bug.
        live = guards_say('#!/bin/bash\ncase "$*" in *reviews*) echo "[]";; *) printf "success\\tgate PASS";; esac\n')
        if "REV=1" not in live or "PARK=1" not in live:
            fails.append(f"H. with gh answering normally the guards must report 'nothing there', "
                         f"not withhold (got {live}) — a guard that always withholds is not a guard")

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

# ---------------------------------------------------------------- I. a release frees only YOUR lease
# Incident 2026-08-11: a worker's end-of-run cleanup sweep ran `rework_claim.sh release 557` on a
# lease ANOTHER agent had taken 39 seconds earlier, and the release was an unconditional `rm -rf`.
# The peer went on working a PR it no longer held while the queue was free to hand the same PR to a
# third agent — the duplicate-work race the leases exist to prevent, reintroduced by the cleanup
# path. `wt_pool.sh release` had already closed this exact hole for worktree slots; the two queue
# leases still had it. Worker 5 self-reported it, which is the only reason it was found at all.
#
# Runs fully offline: `release` never touches gh, and FCT_STATE_DIR relocates the lease root, so the
# case cannot reach the live leases in ~/.fct-pool no matter how it breaks. The observable is the
# lease DIRECTORY, not the exit code — a refusal deliberately exits 0 so that a cleanup sweep is not
# hard-failed by a lease it does not own, which means the exit code cannot distinguish the two.
def _lease_release_case(script, subdir, mutate=None):
    """-> list of failures for one claim script. mutate: text->text applied to the script first."""
    out = []
    src = open(os.path.join(TOOLS, script)).read()
    if mutate:
        src = mutate(src)
    with tempfile.TemporaryDirectory() as td:
        path = os.path.join(td, script)
        open(path, "w").write(src)
        os.chmod(path, 0o755)
        state = os.path.join(td, "state")

        def lease(pr, owner):
            d = os.path.join(state, subdir, str(pr))
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "held"), "w").write("1786478000")
            if owner is not None:
                open(os.path.join(d, "owner"), "w").write(owner + "\n")
            return d

        def release(pr, as_agent):
            env = f"FCT_STATE_DIR={state} "
            env += f"FCT_AGENT_ID={as_agent} " if as_agent else "FCT_AGENT_ID= "
            return sh(f"{env}bash {path} release {pr}")

        # 1. a FOREIGN lease must survive the release
        d = lease(101, "worker-9")
        release(101, "worker-5")
        if not os.path.isdir(d):
            out.append(f"I. {script}: released a lease owned by ANOTHER agent — this is the #557 "
                       "incident, a peer's lease deleted by someone else's cleanup sweep")
        # 2. your OWN lease must still go away — a guard that blocks everything is not a guard
        d = lease(102, "worker-5")
        release(102, "worker-5")
        if os.path.isdir(d):
            out.append(f"I. {script}: refused to release the caller's OWN lease — the queue would "
                       "strand every PR until the stale reclaim")
        # 3. a legacy lease with NO owner file (claimed before this landed) must still be releasable
        d = lease(103, None)
        release(103, "worker-5")
        if os.path.isdir(d):
            out.append(f"I. {script}: an unowned legacy lease could not be released — a lease no "
                       "one can free is worse than the double-free it replaces")
        # 4. ...and so must one whose owner is the literal 'unknown' the first cut of this patch
        #    wrote for callers with no FCT_AGENT_ID. That version failed CLOSED: no identified agent
        #    could ever free it. Pinned because the bug was in the shipped text, not hypothetical.
        d = lease(104, "unknown")
        release(104, "worker-5")
        if os.path.isdir(d):
            out.append(f"I. {script}: a lease owned by the literal 'unknown' could not be released")
        # 5. a releaser with no identity of its own must fail OPEN, exactly like review_claim's skip
        d = lease(105, "worker-9")
        release(105, None)
        if os.path.isdir(d):
            out.append(f"I. {script}: with FCT_AGENT_ID unset the release must fail OPEN — a "
                       "cleanup path that cannot name itself must still be able to free a lease")
        # 6. and the claim side must actually RECORD an owner, or every check above is vacuous
        if "owner" not in src.split("lease_free", 1)[-1].split("\n}", 1)[0]:
            out.append(f"I. {script}: lease_free() does not write an owner file — the release "
                       "guard can never fire, which reads as protection while providing none")
    return out


for _script, _subdir in (("rework_claim.sh", "rework_leases"), ("rebase_claim.sh", "rebase_leases")):
    fails += _lease_release_case(_script, _subdir)
    # MUTATION: with the ownership test stripped out of the release branch, case 1 must go red.
    # Without this the whole case would pass just as happily against the unconditional `rm -rf` it
    # exists to forbid — five green assertions about a guard that was never there.
    _mutated = _lease_release_case(
        _script, _subdir,
        mutate=lambda s: re.sub(r'if \[ -n "\$_own" \].*?\n    fi\n', "", s, flags=re.S))
    if not any("released a lease owned by ANOTHER agent" in m for m in _mutated):
        fails.append(f"I. {_script}: the mutation check did not go red — removing the ownership "
                     "test from the release branch left this case passing, so it is not evidence")


# A run in which cases never executed must not read like a full pass — prove_all prints a child's
# output only on failure, so a silent skip is invisible exactly when it matters.
print(f"test_guards: {'FAIL' if fails else 'PASS'}"
      + (f"  ({len(skipped)} case(s) SKIPPED: {'; '.join(skipped)})" if skipped else ""))
for f in fails:
    print("   ", f)
sys.exit(1 if fails else 0)
