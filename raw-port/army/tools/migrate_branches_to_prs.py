#!/usr/bin/env python3
"""migrate_branches_to_prs.py [--apply] — WS-5: migrate the existing origin/port/* branches to PRs.

Triage each branch vs CURRENT origin/main using the same tools the gate uses:
  - MERGED    : branch tip is an ancestor of origin/main -> content already landed -> delete branch.
  - DUP       : dup_check.py exit 5 (every cited symbol already on main) -> delete branch (no new port).
  - EMPTY     : no raw-port/src/*.ts diff vs main -> delete branch.
  - STALE     : regression_check exit 2 (drops a landed sibling) -> needs rebase; leave for rebase_helper.
  - CLEAN     : real new symbols, no regression, no dup -> open a PR.

DRY-RUN by default: prints the triage table + counts. --apply performs deletes + PR creation.
Never force-pushes; never touches main. Deletes only remote port/* branches classified MERGED/DUP/EMPTY.
"""
import subprocess, sys, json, os

REPO="/Users/vjeux/random/final-cut-pro-transitions"
SLUG="vjeux/fcp-headless-transitions"
APPLY = "--apply" in sys.argv

def sh(args, t=120):
    return subprocess.run(args, cwd=REPO, capture_output=True, text=True, timeout=t)

def branches():
    r = sh(["git","for-each-ref","--format=%(refname:short)","refs/remotes/origin/port/*"])
    return [b.strip() for b in r.stdout.splitlines() if b.strip() and not b.strip().endswith("_rebased")]

def main():
    sh(["git","fetch","-q","origin"])
    bs = branches()
    print(f"# {len(bs)} origin/port/* branches to triage (apply={APPLY})\n")
    counts = {"MERGED":0,"DUP":0,"EMPTY":0,"STALE":0,"CLEAN":0,"ERR":0}
    actions = []
    for b in bs:
        cls = b.split("origin/port/",1)[-1]
        # merged?
        if sh(["git","merge-base","--is-ancestor",b,"origin/main"]).returncode == 0:
            counts["MERGED"]+=1; actions.append(("MERGED",cls,b,"delete")); continue
        files = sh(["git","diff","--name-only",f"origin/main...{b}","--","raw-port/src"]).stdout.split()
        files = [f for f in files if f.endswith(".ts")]
        if not files:
            counts["EMPTY"]+=1; actions.append(("EMPTY",cls,b,"delete")); continue
        dup = sh(["python3","raw-port/army/tools/dup_check.py","origin/main",b]+files).returncode
        if dup == 5:
            counts["DUP"]+=1; actions.append(("DUP",cls,b,"delete")); continue
        reg = sh(["python3","raw-port/army/tools/regression_check.py","origin/main",b]+files).returncode
        if reg == 2:
            counts["STALE"]+=1; actions.append(("STALE",cls,b,"rebase-needed")); continue
        counts["CLEAN"]+=1; actions.append(("CLEAN",cls,b,"open-PR"))

    for verdict,cls,b,act in actions:
        print(f"  {verdict:7} {act:14} {cls}")
    print("\n# counts:", json.dumps(counts))

    if not APPLY:
        print("\n# DRY-RUN. Re-run with --apply to: delete MERGED/DUP/EMPTY branches, open PRs for CLEAN.")
        print("# STALE branches: run rebase_helper.py <Class> then this script re-classes them CLEAN.")
        return

    print("\n# APPLYING...")
    for verdict,cls,b,act in actions:
        rb = b.split("origin/",1)[-1]  # port/<Class>
        if act == "delete":
            r = sh(["git","push","origin","--delete",rb]); print(f"  deleted {rb}: rc={r.returncode}")
        elif act == "open-PR":
            ex = sh(["gh","pr","list","--repo",SLUG,"--head",rb,"--json","number","--jq",".[0].number"]).stdout.strip()
            if ex:
                print(f"  PR already open for {rb}: #{ex}")
            else:
                r = sh(["gh","pr","create","--repo",SLUG,"--base","main","--head",rb,"--fill",
                        "--title",f"port: {cls}",
                        "--body",f"Migrated raw-port branch for `{cls}`. Gate via pr_gate.sh; reviewer approves."])
                print(f"  PR create {rb}: {(r.stdout or r.stderr).strip().splitlines()[-1] if (r.stdout or r.stderr) else r.returncode}")
    print("# done. STALE branches left for rebase_helper.py.")

if __name__=="__main__":
    main()
