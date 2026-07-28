import subprocess
def sh(*a): return subprocess.run(a,capture_output=True,text=True)
sh('git','fetch','-q','origin')
origin=sh('git','rev-parse','origin/main').stdout.strip()
wt=sh('git','worktree','list','--porcelain').stdout
# parse worktree path + branch pairs
entries=[]; cur={}
for l in wt.splitlines():
    if l.startswith('worktree '): cur={'path':l.split(' ',1)[1]}
    elif l.startswith('branch '): cur['branch']=l.split('refs/heads/',1)[-1]; entries.append(cur)
reaped=[]; safe_fresh=[]; safe_unmerged=[]
for e in entries:
    p=e['path']; 
    if 'army/worktrees/' not in p: continue
    name=p.split('worktrees/')[1]; br=e.get('branch','')
    if name.startswith('.gate-'):
        sh('git','worktree','remove','--force','-f',p); reaped.append(name); continue
    if not br: continue
    tip=sh('git','rev-parse',br).stdout.strip()
    # FRESH (0 commits): tip == origin  -> DO NOT REAP (worker may be mid-port, uncommitted)
    if tip==origin: safe_fresh.append(name); continue
    # has commits: are they ALL in origin/main? (fully merged)
    merged = sh('git','merge-base','--is-ancestor',br,'origin/main').returncode==0
    # clean worktree? (no uncommitted changes -> safe to remove)
    dirty = bool(sh('git','-C',p,'status','--porcelain').stdout.strip())
    if merged and not dirty:
        sh('git','worktree','remove','--force',p); sh('git','branch','-D',br); reaped.append(name)
    else:
        safe_unmerged.append(name)
sh('git','worktree','prune')
out=f"reaped(merged+clean/gate): {len(reaped)} {reaped}\nKEPT fresh(0-commit,at-risk): {len(safe_fresh)} {safe_fresh[:20]}\nKEPT unmerged/dirty: {len(safe_unmerged)} {safe_unmerged[:20]}\n"
open('/tmp/reap_safe_out.txt','w').write(out); print(out)
