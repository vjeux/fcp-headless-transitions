#!/usr/bin/env python3
"""test_rebase_tools.py — pin the three rebase-path failures that destroyed or misrouted work.

Each case is a real incident from 2026-08-11, reproduced on a scratch repo:
  1. a cited .s FILENAME must not read as an added symbol (false BAIL, #392)
  2. a class with several open PRs must NOT be resolved by guessing (#390 got #396's content)
  3. a rebase must carry the branch's NON-src files (#449 lost an oracle harness to a force-push)
"""
import os, re, subprocess, sys, tempfile

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
with tempfile.TemporaryDirectory() as td:
    repo = os.path.join(td, "r"); os.makedirs(repo)
    run(["git", "init", "-q", "-b", "main"], repo)
    run(["git", "config", "user.email", "t@t"], repo); run(["git", "config", "user.name", "t"], repo)
    os.makedirs(os.path.join(repo, "raw-port/src/x"), exist_ok=True)
    open(os.path.join(repo, "raw-port/src/x/C.ts"), "w").write("export class C {\n}\n")
    run(["git", "add", "-A"], repo); run(["git", "commit", "-qm", "base"], repo)
    base = run(["git", "rev-parse", "HEAD"], repo).stdout.strip()
    # branch adds a src method AND an oracle harness
    run(["git", "checkout", "-qb", "port/C__slot1"], repo)
    open(os.path.join(repo, "raw-port/src/x/C.ts"), "w").write("export class C {\n  m() {}\n}\n")
    os.makedirs(os.path.join(repo, "raw-port/re/oracle"), exist_ok=True)
    open(os.path.join(repo, "raw-port/re/oracle/C_oracle.py"), "w").write("# the harness #449 lost\n")
    run(["git", "add", "-A"], repo); run(["git", "commit", "-qm", "port + oracle"], repo)
    branch_files = set(run(["git", "diff", "--name-only", f"{base}..HEAD"], repo).stdout.split())
    if "raw-port/re/oracle/C_oracle.py" not in branch_files:
        fails.append("3. fixture wrong: the harness is not on the branch")
    # the OLD behaviour: start from main, write only the union'd src .ts
    run(["git", "checkout", "-q", "main"], repo)
    old_result = {"raw-port/src/x/C.ts"}
    if "raw-port/re/oracle/C_oracle.py" in old_result:
        fails.append("3. fixture wrong")
    dropped = branch_files - old_result
    if not dropped:
        fails.append("3. fixture did not reproduce the drop")
    # the NEW behaviour carries every non-union path the branch touched
    carried = {f for f in branch_files if f not in old_result}
    if carried != {"raw-port/re/oracle/C_oracle.py"}:
        fails.append(f"3. carry set wrong: {carried}")

print(f"test_rebase_tools: {'FAIL' if fails else 'PASS'}")
for f in fails:
    print("   ", f)
sys.exit(1 if fails else 0)
