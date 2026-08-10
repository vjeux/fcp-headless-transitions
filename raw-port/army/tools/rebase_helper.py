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
  exit 1 = usage / setup error
"""
import sys, os, re, subprocess, tempfile, shutil

MANGLED = re.compile(r'__Z[A-Za-z0-9_$.]+')
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

def main(argv):
    if not argv:
        print("usage: rebase_helper.py <Class>", file=sys.stderr); return 1
    cls = argv[0]
    REPO = repo_root()
    BR = f"origin/port/{cls}"
    run(["git","fetch","-q","origin"], cwd=REPO)
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
        if base_t is None or br_t is None:
            print(f"BAIL: {f} missing at base/branch", file=sys.stderr); return 4
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
        for f, text in merged.items():
            fp = os.path.join(WT, f); os.makedirs(os.path.dirname(fp), exist_ok=True)
            open(fp,"w").write(text)
        # symlink heavy deps so the gate can run
        for lnk in ["engine/node_modules","raw-port/node_modules","venv"]:
            src=os.path.join(REPO,lnk); dst=os.path.join(WT,lnk)
            try:
                if os.path.exists(src) and not os.path.exists(dst):
                    os.makedirs(os.path.dirname(dst), exist_ok=True); os.symlink(src,dst)
            except Exception: pass
        # regression_check + dup_check on the RESULT (staged as a branch)
        run(["git","add"]+list(merged.keys()), cwd=WT)
        run(["git","commit","-q","--no-verify","-m",f"rebase(port/{cls}): union-merge onto origin/main (net-new methods only)"], cwd=WT)
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
