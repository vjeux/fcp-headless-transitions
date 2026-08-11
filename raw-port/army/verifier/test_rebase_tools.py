#!/usr/bin/env python3
"""test_rebase_tools.py — pin the rebase-path failures that destroyed or misrouted work.

Each case is a real incident from 2026-08-11, reproduced on a scratch repo:
  1. a cited .s FILENAME must not read as an added symbol (false BAIL, #392)
  2. a class with several open PRs must NOT be resolved by guessing (#390 got #396's content)
  3. a rebase must carry the branch's NON-src files (#449 lost an oracle harness to a force-push)
  4. the union rebase must LAND on a `port/<Class>__slot<N>` PR (#660: rebase_pr.sh looked for a
     rebased branch under a name rebase_helper never pushes, and refused its own completed work)

EVERY CASE MUST BE ABLE TO FAIL. Case 3's first version compared a hand-built set against itself:
deleting the entire carry block from rebase_helper left it green, so it locked nothing while three
places claimed it did. It now builds a real repo with a real remote and calls `rebase_helper.main()`,
stubbing only `gh` and the gate (there is no TS toolchain in a scratch repo). Verified by mutation:
remove the carry loop, leaving valid code, and case 3 reports the dropped harness by name.
If you change these tools, re-run that mutation — a lock that cannot fail is not a lock.
"""
import json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(os.path.dirname(HERE), "tools")
sys.path.insert(0, TOOLS)
import rebase_helper as rh  # noqa: E402

def run(args, cwd):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True)

fails = []

# ── 1. filename-vs-symbol ───────────────────────────────────────────────────────────────────────
src_with_filename_cite = '''
// derived from re/disasm/Helium.__ZN9HGFoo3barEv.s
export function HGFoo_bar() { return 1; }  // @Helium 0x1234
'''
got = rh.syms(src_with_filename_cite)
if any(s.endswith(".s") for s in got):
    fails.append(f"1. a cited .s filename still yields a phantom symbol: {sorted(got)}")
if "__ZN9HGFoo3barEv" not in got:
    fails.append(f"1. the real mangled symbol was lost: {sorted(got)}")

# a genuinely disjoint pair must not overlap
a = rh.syms("// @0x1 __ZN3Foo10isExternalEv\nexport function Foo_isExternal() {}")
b = rh.syms("// @0x2 __ZN3Foo9isBuiltinEv\nexport function Foo_isBuiltin() {}")
if a & b:
    fails.append(f"1. disjoint branches reported an overlap: {sorted(a & b)}")

# ── 2. ambiguous class resolution ───────────────────────────────────────────────────────────────
class FakeRun:
    """Stub `gh pr list` so the test needs no network and no repo state."""
    def __init__(self, prs): self.prs = prs
    def __call__(self, args, cwd=None, timeout=180):
        import json as _j
        class R: pass
        r = R(); r.returncode = 0; r.stderr = ""
        r.stdout = _j.dumps(self.prs) if args[:2] == ["gh", "pr"] else ""
        return r

real_run = rh.run
try:
    rh.run = FakeRun([{"number": 390, "headRefName": "port/HGRenderJob__slot9"},
                      {"number": 396, "headRefName": "port/HGRenderJob"}])
    br, err = rh.resolve_branch("HGRenderJob", "/tmp", pr=None)
    if not err or "AMBIGUOUS" not in err:
        fails.append(f"2. six-PRs-on-one-class did not refuse: branch={br} err={err}")
    rh.run = FakeRun([{"number": 401, "headRefName": "port/OZOnly__slot2"}])
    br, err = rh.resolve_branch("OZOnly", "/tmp", pr=None)
    if err or br != "origin/port/OZOnly__slot2":
        fails.append(f"2. a single unambiguous slot branch was not resolved: {br} {err}")
finally:
    rh.run = real_run

# ── 3. non-src files must survive a rebase ──────────────────────────────────────────────────────
# This case INVOKES rebase_helper.main() against a real scratch repo, because the first version of
# it did not: it compared a hand-built set against itself, so deleting the entire carry block left
# it green. Reviewer 8 caught that on #514 and was right — a lock that cannot fail is not a lock,
# and #25 (the dropped oracle harness) is the most destructive entry in the table.
#
# Fixture: base commit has src/x/C.ts. main then adds a SIBLING method; the branch adds a DIFFERENT
# method plus an oracle harness under raw-port/re/. Disjoint symbol adds, so the union path runs —
# which is exactly the path that used to write back only the merged .ts and drop the harness.
def _git(args, cwd, check=True):
    r = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {r.stderr[:200]}")
    return r


def case3_carry(tmp):
    """Run the real rebase_helper on a scratch repo; return the file list of the rebased branch."""
    bare = os.path.join(tmp, "origin.git")
    work = os.path.join(tmp, "work")
    _git(["init", "-q", "--bare", "-b", "main", bare], tmp)
    _git(["init", "-q", "-b", "main", work], tmp)
    for k, v in (("user.email", "t@t"), ("user.name", "t"), ("commit.gpgsign", "false")):
        _git(["config", k, v], work)
    _git(["remote", "add", "origin", bare], work)

    os.makedirs(os.path.join(work, "raw-port/src/x"), exist_ok=True)
    csrc = "export class C {\n  base() {}  // @Helium 0x100 __ZN1C4baseEv\n}\n"
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(csrc)
    _git(["add", "-A"], work); _git(["commit", "-qm", "base"], work)
    _git(["push", "-q", "origin", "main"], work)

    # branch: a net-new method + an oracle harness (a NON-src file — the thing that was dropped)
    _git(["checkout", "-qb", "port/C__slot1"], work)
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(
        csrc.replace("}\n", "  fromBranch() {}  // @Helium 0x200 __ZN1C10fromBranchEv\n}\n"))
    os.makedirs(os.path.join(work, "raw-port/re/oracle"), exist_ok=True)
    harness = os.path.join(work, "raw-port/re/oracle/C_oracle.py")
    open(harness, "w").write("# the oracle harness #449 lost to a force-push\n")
    _git(["add", "-A"], work); _git(["commit", "-qm", "port + oracle"], work)
    _git(["push", "-q", "origin", "port/C__slot1"], work)

    # main moves: a DIFFERENT method lands (disjoint adds -> the union path)
    _git(["checkout", "-q", "main"], work)
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(
        csrc.replace("}\n", "  fromMain() {}  // @Helium 0x300 __ZN1C8fromMainEv\n}\n"))
    _git(["add", "-A"], work); _git(["commit", "-qm", "sibling on main"], work)
    _git(["push", "-q", "origin", "main"], work)
    _git(["fetch", "-q", "origin"], work)

    # Run the REAL tool. Stub only the two things that need a network: `gh pr view/list`, and the
    # gate (there is no TypeScript toolchain in a scratch repo — the gate is not what case 3 tests).
    real_run, real_root = rh.run, rh.repo_root
    calls = []
    def fake_run(args, cwd=None, timeout=180):
        calls.append(args)
        if args[:2] == ["gh", "pr"]:
            class R: pass
            r = R(); r.returncode = 0; r.stderr = ""
            if args[2] == "view":
                r.stdout = "port/C__slot1"
            else:
                r.stdout = json.dumps([{"number": 1, "headRefName": "port/C__slot1"}])
            return r
        if args and args[0] == "bash" and "gate.sh" in " ".join(args):
            class R: pass
            r = R(); r.returncode = 0; r.stdout = "GATE: PASS"; r.stderr = ""
            return r
        return real_run(args, cwd=cwd if cwd else work, timeout=timeout)
    try:
        rh.run = fake_run
        rh.repo_root = lambda: work
        rc = rh.main(["--pr", "1"])
    finally:
        rh.run, rh.repo_root = real_run, real_root
    if rc != 0:
        return rc, set()
    _git(["fetch", "-q", "origin"], work)
    out = _git(["ls-tree", "-r", "--name-only", "origin/port/C_rebased"], work).stdout.split()
    return rc, set(out)


with tempfile.TemporaryDirectory() as td:
    try:
        rc, files = case3_carry(td)
        if rc != 0:
            fails.append(f"3. rebase_helper returned {rc}, expected 0 (union path should succeed)")
        elif "raw-port/re/oracle/C_oracle.py" not in files:
            fails.append("3. THE REBASE DROPPED THE BRANCH'S ORACLE HARNESS "
                         "(raw-port/re/oracle/C_oracle.py absent from the rebased branch) — this is #25")
        else:
            # and the union itself must still be right: both methods present, neither side lost
            src = subprocess.run(["git", "show", "origin/port/C_rebased:raw-port/src/x/C.ts"],
                                 cwd=os.path.join(td, "work"), capture_output=True, text=True).stdout
            for want in ("fromBranch", "fromMain"):
                if want not in src:
                    fails.append(f"3. union lost {want} from the rebased file")
    except Exception as e:
        fails.append(f"3. harness error: {type(e).__name__}: {e}")


CASE4_PR = "999001"   # a number the live swarm cannot be using; this case writes /tmp/rebase_pr_<PR>_*


def case4_slot_branch(tmp):
    """Run the REAL rebase_pr.sh end-to-end on a `port/<Class>__slot<N>` PR.

    #660: rebase_helper strips `__slot<N>` to get the class and pushes `port/<Class>_rebased`;
    rebase_pr.sh re-derived that name from the BRANCH (stripping only `_rebased`), looked for
    `port/<Class>__slot<N>_rebased`, found nothing, and its file-list guard — reading an empty side
    of a `comm` — refused the push as "missing files the PR has". The union was complete and
    gate-green on the remote; the PR went back to the queue, one attempt closer to being auto-closed.

    Nothing short of running the tool catches this: every part is individually correct, and the two
    spellings coincide on the `port/<Class>` branches everyone tested with. So this case invokes the
    script, with a scratch $HOME as the canonical checkout and only the network stubbed:
      * `gh` — a shell stub answering the two queries these tools make;
      * `gate.sh` — a stub printing GATE: PASS (there is no TypeScript toolchain in a scratch repo,
        and the gate is not what this case tests; case 3 makes the same trade).
    Returns (CompletedProcess, files on the PR branch, that branch's C.ts, remote branch names).
    """
    home = os.path.join(tmp, "home")
    work = os.path.join(home, "random", "final-cut-pro-transitions")
    bare = os.path.join(tmp, "origin4.git")
    os.makedirs(work)
    _git(["init", "-q", "--bare", "-b", "main", bare], tmp)
    _git(["init", "-q", "-b", "main", work], tmp)
    for k, v in (("user.email", "t@t"), ("user.name", "t"), ("commit.gpgsign", "false")):
        _git(["config", k, v], work)
    _git(["remote", "add", "origin", bare], work)

    # the real tools under test, plus a stub gate
    os.makedirs(os.path.join(work, "raw-port/army/tools"))
    os.makedirs(os.path.join(work, "raw-port/army/gate"))
    for t in ("rebase_pr.sh", "rebase_helper.py"):
        shutil.copy(os.path.join(TOOLS, t), os.path.join(work, "raw-port/army/tools", t))
    gate = os.path.join(work, "raw-port/army/gate/gate.sh")
    open(gate, "w").write('#!/bin/bash\necho "GATE: PASS"\n')
    os.chmod(gate, 0o755)

    os.makedirs(os.path.join(work, "raw-port/src/x"))
    csrc = "export class C {\n  base() {}  // @Helium 0x100 __ZN1C4baseEv\n}\n"
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(csrc)
    _git(["add", "-A"], work); _git(["commit", "-qm", "base"], work)
    _git(["push", "-q", "origin", "main"], work)

    # THE SHAPE THAT BREAKS IT: a __slot<N> branch (what #240 cuts whenever a class is contended)
    _git(["checkout", "-qb", "port/C__slot7"], work)
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(
        csrc.replace("}\n", "  fromBranch() {}  // @Helium 0x200 __ZN1C10fromBranchEv\n}\n"))
    os.makedirs(os.path.join(work, "raw-port/re/oracle"))
    open(os.path.join(work, "raw-port/re/oracle/C_oracle.py"), "w").write("# harness\n")
    _git(["add", "-A"], work); _git(["commit", "-qm", "port + oracle"], work)
    _git(["push", "-q", "origin", "port/C__slot7"], work)

    _git(["checkout", "-q", "main"], work)
    open(os.path.join(work, "raw-port/src/x/C.ts"), "w").write(
        csrc.replace("}\n", "  fromMain() {}  // @Helium 0x300 __ZN1C8fromMainEv\n}\n"))
    _git(["add", "-A"], work); _git(["commit", "-qm", "sibling on main"], work)
    _git(["push", "-q", "origin", "main"], work)
    _git(["fetch", "-q", "origin"], work)

    bindir = os.path.join(tmp, "bin4"); os.makedirs(bindir)
    gh = os.path.join(bindir, "gh")
    open(gh, "w").write(
        '#!/bin/bash\n'
        '# the only two queries rebase_pr.sh / rebase_helper.py make\n'
        'if [ "$1" = pr ] && [ "$2" = view ]; then echo "port/C__slot7"; exit 0; fi\n'
        'if [ "$1" = pr ] && [ "$2" = list ]; then\n'
        '  echo \'[{"number":%s,"headRefName":"port/C__slot7"}]\'; exit 0\n'
        'fi\n'
        'exit 1\n' % CASE4_PR)
    os.chmod(gh, 0o755)

    env = dict(os.environ)
    env["HOME"] = home
    env["PATH"] = bindir + os.pathsep + env.get("PATH", "")
    r = subprocess.run(["bash", os.path.join(work, "raw-port/army/tools/rebase_pr.sh"), CASE4_PR],
                       cwd=work, env=env, capture_output=True, text=True, timeout=300)
    _git(["fetch", "-q", "--prune", "origin"], work)
    files = set(_git(["ls-tree", "-r", "--name-only", "origin/port/C__slot7"], work).stdout.split())
    src = _git(["show", "origin/port/C__slot7:raw-port/src/x/C.ts"], work, check=False).stdout
    refs = _git(["for-each-ref", "--format=%(refname:short)", "refs/remotes/origin"],
                work).stdout.split()
    return r, files, src, refs


with tempfile.TemporaryDirectory() as td:
    try:
        r, files, src, refs = case4_slot_branch(td)
        out = r.stdout + r.stderr
        if "REBASE_UNION" not in out or r.returncode != 0:
            fails.append("4. rebase_pr.sh did not land the union on a `__slot<N>` PR branch "
                         f"(rc={r.returncode}): {out.strip()[-300:]}")
        else:
            if "fromMain" not in src or "fromBranch" not in src:
                fails.append(f"4. the PR branch does not carry both methods after the rebase: {src!r}")
            if "raw-port/re/oracle/C_oracle.py" not in files:
                fails.append("4. the rebase dropped the branch's oracle harness (#25) on the "
                             "__slot path")
            leftover = [x for x in refs if x.endswith("_rebased")]
            if leftover:
                fails.append(f"4. the temporary union branch was left on the remote: {leftover}")
    except Exception as e:
        fails.append(f"4. harness error: {type(e).__name__}: {e}")


print(f"test_rebase_tools: {'FAIL' if fails else 'PASS'}")
for f in fails:
    print("   ", f)
sys.exit(1 if fails else 0)
