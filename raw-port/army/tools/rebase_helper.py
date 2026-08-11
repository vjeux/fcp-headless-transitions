#!/usr/bin/env python3
"""rebase_helper.py <Class> — rebase a stale-base port branch onto current origin/main by
3-way UNION-merging each changed .ts file, WITHOUT touching main.

WHY: stale-base branches (cut before a sibling landed on a shared class file) fail the
regression gate (regression_check.py, run inside pr_gate.sh) because a naive 3-way git merge would
drop main's later
siblings. But the branch's added symbols and main's added symbols are DISJOINT sets (verified:
OZRenderParams_setRenderQuality adds setRenderQuality/... ; main added setWidth/setHeight/...),
so the correct rebase is deterministic: main's current file + the branch's added lines. A
`git merge-file --union` (ours=main, base=merge-base, theirs=branch) produces exactly that with
NO conflict markers and NO dropped symbols. The full gate + dup_check + regression_check then
run on the result, so a wrong union can only produce a branch that FAILS the gate — it can
NEVER corrupt main. This tool PRODUCES a rebased branch `port/<Class>_rebased` and pushes it for
a normal reviewer merge. It NEVER merges to main and NEVER pushes to main.

SAFETY GUARANTEES:
  - Only reads origin/main + origin/port/<Class>; writes a NEW branch; never main.
  - BAILS if branch-adds ∩ main-adds != ∅ on any file (would need human semantic merge).
  - BAILS if union result DROPS any symbol main has (regression_check on the result).
  - BAILS if union result adds NO new symbol (dup_check on the result).
  - Runs gate.sh on the result; only pushes if GATE: PASS.

Usage: rebase_helper.py <Class>
  exit 0 = pushed port/<Class>_rebased (ready for reviewer)
  exit 3 = not stale / nothing to do (branch already merges clean or is a pure dup)
  exit 4 = BAIL: overlapping symbol edits, needs human
  exit 5 = BAIL: union result still regresses or dups or fails gate
  exit 6 = NEEDS_WORKER_REBASE: add/add on a shared class body — not mechanically unionable;
           a WORKER must re-apply the branch's net-new methods onto main's current class
           (rebase_pr.sh <PR#>, pulled from the rebase queue via rebase_claim.sh). NOT a failure — an escalation.
  exit 1 = usage / setup error
"""
import sys, os, re, json, subprocess, tempfile, shutil

SLUG = os.environ.get("FCT_REPO", "vjeux/fcp-headless-transitions")

# NO `.` in the class. It was there so a `Fw.__ZN…` disasm key would match, but the match starts at
# `__Z`, so the prefix never needed it — while the TRAILING `.` swallowed the extension of a cited
# FILENAME. A header comment naming `re/disasm/Helium.__ZN….s` therefore produced a phantom symbol
# `__ZN….s` that no other side had, and rebase_helper BAILed exit 4 on a provably disjoint union
# (#392: branch added isExternal, main added isBuiltin). A false BAIL downgrades a reviewer-safe
# union into a worker rebase that the attempt cap can discard.
# MERGE NOTE (rebase of #514 onto main): main and this branch fixed the SAME trailing-dot bug two
# different ways. Main allowed internal dots but forbade ENDING on one — which still matches
# `__ZN…Ev.s`, because `.s` ends in a letter, so it did not actually stop the phantom. This
# branch's form stops at the first dot, which does stop it (and is what test_rebase_tools locks),
# but also drops the genuine `.cold`/`.eh` suffixes main was protecting. Keeping BOTH intents: the
# base symbol, plus ONLY the known compiler suffixes, and never a file extension.
MANGLED = re.compile(r'__Z[A-Za-z0-9_$]+(?:\.(?:cold|eh|stub|part|constprop)(?:\.\d+)?)*')
EXPORT  = re.compile(r'^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)', re.M)
# libc++ / STL boundary externs (std::__1::…) are SHARED references, not port symbols. Two branches
# that both use call_once BOTH cite __ZNSt3__1…__call_once[_proxy] — that is NOT an overlapping edit,
# it is the same extern boundary. Excluding them from the OVERLAP check (only) prevents a false
# "branch AND main both add" BAIL. They are still counted for drop/dup checks below.
STL = re.compile(r'^__ZN?St3__1|__call_once')

def run(args, cwd=None, timeout=180):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=timeout)

def repo_root():
    r = run(["git","rev-parse","--show-toplevel"])
    return r.stdout.strip() or os.getcwd()

def show(ref, path, cwd):
    r = run(["git","show",f"{ref}:{path}"], cwd=cwd)
    return r.stdout if r.returncode == 0 else None

def syms(text):
    if text is None: return set()
    return set(MANGLED.findall(text)) | set(EXPORT.findall(text))

def _open_pr_branches(cls, repo):
    """Open-PR head branches that belong to <Class>: `port/<Class>`, `port/<Class>__slotN`, …"""
    r = run(["gh","pr","list","--repo",SLUG,"--state","open","--limit","200",
             "--json","number,headRefName"], cwd=repo)
    try:
        prs = json.loads(r.stdout or "[]")
    except Exception:
        return []
    pat = re.compile(rf'^port/{re.escape(cls)}(?:__slot\d+|_[A-Za-z0-9]+)?$')
    return [(p["number"], p["headRefName"]) for p in prs if pat.match(p.get("headRefName",""))]


def resolve_branch(cls, repo, pr=None):
    """(branch, error) — WHICH branch this rebase is about.

    A class no longer has one branch. OPS_LOG #1's fix (#240) made `wt_pool acquire` fall back to
    `port/<Class>__slot<N>` under contention, so HGRenderJob had SIX open PRs at once. This function
    used to be the line `BR = f"origin/port/{cls}"`, which meant a reviewer holding #390
    (`__slot9`) ran the helper and got exit 0 plus "ready for reviewer" for **#396's content** —
    +61 lines of GetType instead of their +284. Two harms, both silent: the reviewer merges another
    agent's unverified port under their own APPROVE (the gate cannot catch it, because the wrong
    content is itself gate-clean), and the PR they actually hold is never rebased. Reported
    independently by three agents in one morning (#400, #403, and reviewer 8's exit report).

    So: prefer an explicit PR number, and when given only a class name REFUSE rather than guess if
    more than one open PR could be meant.
    """
    if pr:
        r = run(["gh","pr","view",str(pr),"--repo",SLUG,"--json","headRefName","--jq",".headRefName"], cwd=repo)
        br = r.stdout.strip()
        if not br:
            return None, f"cannot resolve head branch for PR #{pr}"
        return f"origin/{br}", None
    cands = _open_pr_branches(cls, repo)
    if len(cands) > 1:
        listing = ", ".join(f"#{n} {b}" for n, b in sorted(cands))
        return None, ("AMBIGUOUS: %d open PRs match class %s (%s). Re-run as "
                      "`rebase_helper.py --pr <PR#>` — guessing here has merged one agent's work "
                      "under another's review." % (len(cands), cls, listing))
    if len(cands) == 1:
        return f"origin/{cands[0][1]}", None
    return f"origin/port/{cls}", None   # no open PR matched: fall back to the historic name


def main(argv):
    pr = None
    args = []
    i = 0
    while i < len(argv):
        if argv[i] == "--pr" and i+1 < len(argv):
            pr = argv[i+1]; i += 2; continue
        args.append(argv[i]); i += 1
    if not args and not pr:
        print("usage: rebase_helper.py <Class> | rebase_helper.py --pr <PR#>", file=sys.stderr); return 1
    REPO = repo_root()
    run(["git","fetch","-q","origin"], cwd=REPO)
    cls = args[0] if args else None
    if pr and not cls:
        r = run(["gh","pr","view",str(pr),"--repo",SLUG,"--json","headRefName","--jq",".headRefName"], cwd=REPO)
        head = r.stdout.strip()
        cls = re.sub(r'^port/', '', head)
        cls = re.sub(r'(__slot\d+|_rebased)$', '', cls)
    BR, err = resolve_branch(cls, REPO, pr)
    if err:
        print(f"BAIL: {err}", file=sys.stderr); return 4
    print(f"rebase_helper: class={cls} branch={BR}" + (f" (from PR #{pr})" if pr else ""), file=sys.stderr)
    if run(["git","rev-parse","--verify","-q",BR], cwd=REPO).returncode != 0:
        print(f"no branch {BR}", file=sys.stderr); return 1
    # already merged?
    if run(["git","merge-base","--is-ancestor",BR,"origin/main"], cwd=REPO).returncode == 0:
        print(f"{BR} already on main"); return 3
    mb = run(["git","merge-base",BR,"origin/main"], cwd=REPO).stdout.strip()
    # changed .ts files on the branch vs merge-base
    diff = run(["git","diff","--name-only",f"{mb}..{BR}","--","raw-port/src/**/*.ts"], cwd=REPO)
    files = [f for f in diff.stdout.split("\n") if f.strip().endswith(".ts")]
    if not files:
        print(f"{BR}: no .ts changes"); return 3
    # verify DISJOINT symbol adds per file, and build union results
    merged = {}   # path -> merged text
    any_new = False
    for f in files:
        base_t = show(mb, f, REPO)
        br_t   = show(BR, f, REPO)
        main_t = show("origin/main", f, REPO)
        if br_t is None:
            print(f"BAIL: {f} missing on branch", file=sys.stderr); return 4
        if base_t is None and main_t is not None:
            # ADD/ADD: the file was created INDEPENDENTLY on both the branch and main after they
            # forked (no version at the merge-base). If BOTH versions define members INSIDE one
            # shared `class X { ... }` body (the PCAtomBox case), a text union is unsafe — it would
            # duplicate the class declaration + any shared method. That is AUTHOR work: a worker must
            # re-apply the branch's net-new methods onto main's current class body. Signal that
            # cleanly with exit 6 (NEEDS_WORKER_REBASE) so a worker slot pulls the rebase from the
            # rebase queue (rebase_claim.sh) instead of looping. Only a file of DISJOINT TOP-LEVEL exports (no shared class body) is
            # union-safe here; detect the shared-class-body case and escalate.
            def _class_bodies(t):
                import re as _r
                return set(_r.findall(r'export\s+(?:default\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)', t or ""))
            shared_classes = _class_bodies(br_t) & _class_bodies(main_t)
            if shared_classes:
                print(f"NEEDS_WORKER_REBASE: {f} — add/add on shared class body {sorted(shared_classes)} "
                      f"(branch + main both define methods inside it; a worker must re-apply the "
                      f"branch's net-new methods onto main's current class). Not mechanically unionable.",
                      file=sys.stderr)
                return 6
            base_t = ""   # disjoint top-level exports: empty base -> diff3 unions both sides


        if base_t is None:
            print(f"BAIL: {f} missing at base and not on main", file=sys.stderr); return 4
        if main_t is None:
            # file is new on the branch (not on main) -> just take branch version, no union needed
            merged[f] = br_t
            if syms(br_t): any_new = True
            continue
        br_adds   = syms(br_t)   - syms(base_t)
        main_adds = syms(main_t) - syms(base_t)
        # ignore shared libc++/STL boundary externs (std::__1, __call_once) — both files legitimately
        # cite the same extern; it is not a semantic edit collision.
        overlap = {s for s in (br_adds & main_adds) if not STL.match(s)}
        if overlap:
            print(f"BAIL: {f} — branch AND main both add {sorted(overlap)[:4]} (needs human semantic merge)", file=sys.stderr)
            return 4
        # 3-way merge ours=main, base=merge-base, theirs=branch. We do NOT use --union
        # (line-level, splices method fragments -> broken TS). Instead run a NORMAL merge
        # which isolates divergence to whole conflict regions, then resolve each conflict by
        # KEEPING BOTH complete blocks (ours-then-theirs). Because br_adds ∩ main_adds == ∅
        # (checked above), each conflict side is a complete, disjoint set of members, so
        # concatenating them preserves both with no splicing and no loss.
        with tempfile.TemporaryDirectory() as td:
            po=os.path.join(td,"ours"); pb=os.path.join(td,"base"); pt=os.path.join(td,"theirs")
            open(po,"w").write(main_t); open(pb,"w").write(base_t); open(pt,"w").write(br_t)
            u = run(["git","merge-file","-p","--diff3",po,pb,pt])
            out = u.stdout
            # resolve conflicts: <<<<<<< ours ||||||| base ======= theirs >>>>>>> -> ours + theirs
            resolved=[]; state=0; ours_buf=[]; theirs_buf=[]
            for line in out.split("\n"):
                if line.startswith("<<<<<<<"): state=1; ours_buf=[]; theirs_buf=[]; continue
                if state==1 and line.startswith("|||||||"): state=2; continue   # base section (discard)
                if state in (1,2) and line.startswith("======="): state=3; continue
                if state==3 and line.startswith(">>>>>>>"):
                    resolved.extend(ours_buf); resolved.extend(theirs_buf); state=0; continue
                if state==1: ours_buf.append(line)
                elif state==2: pass
                elif state==3: theirs_buf.append(line)
                else: resolved.append(line)
            merged[f] = "\n".join(resolved)
        # sanity: merged must retain every symbol main has (no drop) AND every branch add
        m = syms(merged[f])
        dropped_main = syms(main_t) - m
        dropped_br   = br_adds - m
        if dropped_main:
            print(f"BAIL: union dropped main symbols on {f}: {sorted(dropped_main)[:4]}", file=sys.stderr); return 5
        if dropped_br:
            print(f"BAIL: union dropped branch adds on {f}: {sorted(dropped_br)[:4]}", file=sys.stderr); return 5
        if br_adds: any_new = True
    if not any_new:
        print(f"{BR}: adds no new symbol vs main (pure dup) — nothing to rebase"); return 3
    # Build the rebased branch in an isolated worktree off current origin/main
    WT = f"/tmp/rebase_{cls}_{os.getpid()}"
    run(["git","worktree","remove","--force",WT], cwd=REPO); shutil.rmtree(WT, ignore_errors=True)
    add = run(["git","worktree","add","-q","--detach",WT,"origin/main"], cwd=REPO)
    if add.returncode != 0:
        print(f"BAIL: worktree add failed: {add.stderr[:200]}", file=sys.stderr); return 1
    try:
        # CARRY EVERY OTHER FILE THE BRANCH TOUCHED. The rebased branch starts from origin/main and
        # then writes only the union-merged `raw-port/src/**.ts` — so ANY other file the branch added
        # was silently dropped, and the force-push back onto the PR head made the loss permanent. On
        # #449 that destroyed an oracle harness which had to be recovered from a commit the
        # force-push had already orphaned. Nothing catches it: the gate only inspects the .ts files
        # handed to it, and the deleted file is not part of the port.
        # These files are outside the union by construction (the union is src .ts only), so taking
        # the branch's version is exactly "rebase onto main" for them. A file the branch DELETED is
        # left alone deliberately: this tool re-applies work, it does not replay removals.
        carried = []
        ns = run(["git","diff","--name-status",f"{mb}..{BR}"], cwd=REPO)
        for line in ns.stdout.splitlines():
            parts = line.split("\t")
            if len(parts) < 2:
                continue
            st, path = parts[0], parts[-1]
            if path in merged or st.startswith("D"):
                continue
            co = run(["git","checkout",BR,"--",path], cwd=WT)
            if co.returncode == 0:
                carried.append(path)
            else:
                print(f"BAIL: could not carry {path} from {BR}: {co.stderr[:160]}", file=sys.stderr)
                return 5
        for f, text in merged.items():
            fp = os.path.join(WT, f); os.makedirs(os.path.dirname(fp), exist_ok=True)
            open(fp,"w").write(text)
        if carried:
            print(f"rebase_helper: carried {len(carried)} non-union file(s) from the branch: "
                  f"{', '.join(carried[:6])}{' …' if len(carried) > 6 else ''}", file=sys.stderr)
        # symlink heavy deps so the gate can run
        for lnk in ["engine/node_modules","raw-port/node_modules","venv"]:
            src=os.path.join(REPO,lnk); dst=os.path.join(WT,lnk)
            try:
                if os.path.exists(src) and not os.path.exists(dst):
                    os.makedirs(os.path.dirname(dst), exist_ok=True); os.symlink(src,dst)
            except Exception: pass
        # regression_check + dup_check on the RESULT (staged as a branch)
        run(["git","add","-A"], cwd=WT)
        run(["git","commit","-q","--no-verify","-m",f"rebase(port/{cls}): union-merge onto origin/main (net-new methods only)"], cwd=WT)
        # POST-CONDITION: every path the branch added or modified must still be present, with the
        # branch's content for the carried ones. Asserted rather than trusted — a silent file drop
        # is the failure this whole block exists to prevent, so it must not be able to return 0.
        lost = []
        for line in ns.stdout.splitlines():
            parts = line.split("\t")
            if len(parts) < 2:
                continue
            st, path = parts[0], parts[-1]
            if st.startswith("D"):
                continue
            if not os.path.exists(os.path.join(WT, path)):
                lost.append(path)
        if lost:
            print(f"BAIL: rebase result is MISSING {len(lost)} file(s) the branch has: {lost[:6]}",
                  file=sys.stderr)
            return 5
        # gate
        gp = run(["bash","raw-port/army/gate/gate.sh"]+list(merged.keys()), cwd=WT, timeout=300)
        if "GATE: PASS" not in (gp.stdout+gp.stderr):
            print(f"BAIL: gate did not PASS on rebased {cls}:\n{(gp.stdout+gp.stderr)[-800:]}", file=sys.stderr); return 5
        # push rebased branch (NOT main)
        RB = f"port/{cls}_rebased"
        pr = run(["git","push","-f","origin",f"HEAD:refs/heads/{RB}"], cwd=WT, timeout=180)
        if pr.returncode != 0:
            print(f"BAIL: push failed: {pr.stderr[:300]}", file=sys.stderr); return 1
        print(f"PUSHED origin/{RB} (rebased onto origin/main; GATE PASS; {len(merged)} file(s), new symbols present). Ready for reviewer.")
        return 0
    finally:
        run(["git","worktree","remove","--force",WT], cwd=REPO)
        shutil.rmtree(WT, ignore_errors=True)
        run(["git","worktree","prune","--expire=1.hour.ago"], cwd=REPO)

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
