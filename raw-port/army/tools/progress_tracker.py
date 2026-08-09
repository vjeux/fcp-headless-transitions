#!/usr/bin/env python3
"""progress_tracker.py — git-driven raw-port progress, reconstructable after the fact.

Git is the source of truth (immune to the cosmetic claims.json ledger resets). Every metric
is derived from origin/main commit history + timestamps, so running this at ANY time yields an
accurate representation of progress over the whole project life.

USAGE
  progress_tracker.py snapshot                 # current totals + per-framework/layer breakdown
  progress_tracker.py timeline [--bucket hour|day] [--since ISO]   # cumulative curve over time
  progress_tracker.py timeline --csv           # machine-readable (for charting)
  progress_tracker.py log                       # append a timestamped snapshot row to progress_log.csv

METRICS (all from git):
  merges       = merge commits 'Merge branch port/<Class>' on origin/main  (TRUE progress signal)
  ported_ts    = distinct *.ts files under raw-port/src present at HEAD
  src_lines    = total lines across those .ts files
  fn_cited     = distinct @0xADDR citations across all ported .ts (function-level coverage proxy)
"""
import subprocess, sys, os, re, json, collections, datetime

ROOT = subprocess.run(["git","rev-parse","--show-toplevel"],capture_output=True,text=True).stdout.strip() or "."
SRC  = "raw-port/src"
REF  = "origin/main"

def git(*a):
    return subprocess.run(["git","-C",ROOT,*a],capture_output=True,text=True).stdout

def _bucket(iso, mode):
    # iso like 2026-07-29T08:00:00+01:00 -> normalize to UTC bucket key
    try:
        dt = datetime.datetime.fromisoformat(iso)
        dt = dt.astimezone(datetime.timezone.utc)
    except Exception:
        return iso[:13]
    return dt.strftime("%Y-%m-%d" if mode=="day" else "%Y-%m-%dT%H:00")

# ---- file-add timeline: first time each raw-port/src/*.ts file was Added ----
def ts_add_events():
    """Return list of (iso, path) for each .ts file first-added under raw-port/src."""
    out = git("log", REF, "--reverse", "--diff-filter=A", "--pretty=format:@@%cI",
              "--name-only", "--", SRC)
    events=[]; cur=None; seen=set()
    for line in out.splitlines():
        if line.startswith("@@"):
            cur=line[2:]
        elif line.strip().endswith(".ts") and line.startswith(SRC):
            p=line.strip()
            if p not in seen:
                seen.add(p); events.append((cur,p))
    return events

def merge_events(since=None):
    """(iso, class) for each port/ merge commit."""
    args=["log", REF, "--merges", "--reverse", "--pretty=format:%cI|%s"]
    if since: args.insert(2, f"--since={since}")
    out=git(*args); ev=[]
    for l in out.splitlines():
        if "|" not in l: continue
        iso,subj=l.split("|",1)
        m=re.search(r"port/([A-Za-z0-9_:.<>-]+)", subj)
        if m: ev.append((iso, m.group(1)))
    return ev

def cmd_timeline(bucket="hour", since=None, csv=False):
    adds=ts_add_events()
    mrg=merge_events(since)
    if since:
        adds=[(i,p) for (i,p) in adds if i>=since]
    # cumulative baseline = files added BEFORE 'since'
    base_files = len(ts_add_events()) - len(adds) if since else 0
    per=collections.OrderedDict()
    fcum=base_files
    # merge-count baseline
    base_m = len(merge_events()) - len(mrg) if since else 0
    for iso,p in adds:
        k=_bucket(iso,bucket); per.setdefault(k,{"files":0,"merges":0})
        per[k]["files"]+=1
    for iso,c in mrg:
        k=_bucket(iso,bucket); per.setdefault(k,{"files":0,"merges":0})
        per[k]["merges"]+=1
    keys=sorted(per)
    if csv:
        print("bucket,files_added,merges,cum_files,cum_merges")
    else:
        print(f"{'bucket':<17} {'+ts':>5} {'+merge':>7} {'cumTS':>7} {'cumMerge':>9}")
        print("-"*50)
    fc=base_files; mc=base_m
    for k in keys:
        fc+=per[k]["files"]; mc+=per[k]["merges"]
        if csv:
            print(f"{k},{per[k]['files']},{per[k]['merges']},{fc},{mc}")
        else:
            print(f"{k:<17} {per[k]['files']:>5} {per[k]['merges']:>7} {fc:>7} {mc:>9}")

def _framework_of(path):
    # infer framework from ledger membership is expensive; use src layer dir as proxy label
    parts=path.split("/")
    return parts[2] if len(parts)>2 else "?"

def snapshot():
    files=git("ls-tree","-r","--name-only",REF,"--",SRC).splitlines()
    ts=[f for f in files if f.endswith(".ts")]
    merges=len(merge_events())
    # lines + @0xADDR citations — read working-tree files directly (fast; main tracks origin/main)
    lines=0; addrs=set()
    for f in ts:
        fp=os.path.join(ROOT,f)
        try:
            blob=open(fp,encoding="utf-8",errors="ignore").read()
        except Exception:
            blob=git("show", f"{REF}:{f}")
        lines+=blob.count("\n")
        for a in re.findall(r"@0x([0-9a-fA-F]+)", blob):
            addrs.add(a.lower())
    by_layer=collections.Counter(_framework_of(f) for f in ts)
    first=git("log",REF,"--reverse","--pretty=format:%cI","--",SRC).splitlines()
    start=first[0] if first else "?"
    now=git("log",REF,"-1","--pretty=format:%cI")
    # ledger function totals (scope denominator)
    ledtot=0
    ldir=os.path.join(ROOT,"raw-port/army/ledger")
    for lf in (os.listdir(ldir) if os.path.isdir(ldir) else []):
        if not lf.endswith(".ledger.json") or lf.startswith("shaders"): continue
        try:
            led=json.load(open(os.path.join(ldir,lf)))
            for ms in led.values():
                if isinstance(ms,dict): ledtot+=sum(1 for v in ms.values() if isinstance(v,dict))
        except: pass
    print("=== raw-port progress snapshot (git source of truth) ===")
    print(f"  first src commit : {start}")
    print(f"  head commit      : {now}")
    print(f"  port/ merges     : {merges}")
    print(f"  ported .ts files : {len(ts)}")
    print(f"  total src lines  : {lines:,}")
    print(f"  distinct @0xADDR : {len(addrs):,}  (raw citation tokens — NOT coverage; ~35 per fn: entry+consts+offsets+instr sites. Real coverage = ledger `ported` below.)")
    # --- ledger-truth 3-way split: real ports vs throw-stubs vs todo (via stubscan classifier) ---
    real=stubn=todon=0
    for lf in (os.listdir(ldir) if os.path.isdir(ldir) else []):
        if not lf.endswith(".ledger.json") or lf.startswith("shaders"): continue
        try:
            led=json.load(open(os.path.join(ldir,lf)))
        except Exception:
            continue
        for ms in led.values():
            if not isinstance(ms,dict): continue
            for v in ms.values():
                if not isinstance(v,dict): continue
                s=v.get("status")
                if s=="ported": real+=1
                elif s=="stub": stubn+=1
                else: todon+=1
    if real+stubn+todon:
        print(f"  ledger status    : ported={real:,}  stub={stubn:,}  todo={todon:,}"
              f"  (stub = addr-cited throw placeholder, NOT real math)")
    print(f"  by src layer:")
    for k,v in by_layer.most_common():
        print(f"     {k:<12} {v:>5}")

def _ledger_ported_count():
    """GROUND-TRUTH coverage: count ledger units with status=='ported'. This is the number that
    matters (a genuine ported body), NOT the @0xADDR token count (fn_cited), which over-counts ~6x
    because one function cites ~35 addresses (its entry + every constant/field-offset/instr site).
    Reflects the last mark_ported reconcile; run mark_ported first for a fresh value."""
    ldir=os.path.join(ROOT,"raw-port/army/ledger")
    p=0
    for lf in (os.listdir(ldir) if os.path.isdir(ldir) else []):
        if not lf.endswith(".ledger.json") or lf.startswith("shaders"): continue
        try: led=json.load(open(os.path.join(ldir,lf)))
        except Exception: continue
        for ms in led.values():
            if isinstance(ms,dict):
                for v in ms.values():
                    if isinstance(v,dict) and v.get("status")=="ported": p+=1
    return p

def cmd_log():
    """Append one timestamped row to progress_log.csv for a persistent forward record."""
    files=git("ls-tree","-r","--name-only",REF,"--",SRC).splitlines()
    ts=[f for f in files if f.endswith(".ts")]
    merges=len(merge_events())
    lines=0; addrs=set()
    for f in ts:
        fp=os.path.join(ROOT,f)
        try:
            blob=open(fp,encoding="utf-8",errors="ignore").read()
        except Exception:
            blob=git("show", f"{REF}:{f}")
        lines+=blob.count("\n")
        for a in re.findall(r"@0x([0-9a-fA-F]+)", blob): addrs.add(a.lower())
    ported_real=_ledger_ported_count()
    head=git("log",REF,"-1","--pretty=format:%H")[:12]
    row=f"{datetime.datetime.now(datetime.timezone.utc).isoformat()},{head},{merges},{len(ts)},{lines},{len(addrs)},{ported_real}"
    p=os.path.join(ROOT,"raw-port/army/progress_log.csv")
    new=not os.path.exists(p)
    with open(p,"a") as fh:
        if new: fh.write("utc_time,head,merges,ported_ts,src_lines,fn_cited,ported_real\n")
        fh.write(row+"\n")
    print("logged:",row)
    print("-> raw-port/army/progress_log.csv")

if __name__=="__main__":
    a=sys.argv[1:] or ["snapshot"]
    cmd=a[0]
    if cmd=="timeline":
        bucket="day" if "--bucket" in a and a[a.index("--bucket")+1]=="day" else ("hour" if "--bucket" in a else "hour")
        since=a[a.index("--since")+1] if "--since" in a else None
        cmd_timeline(bucket=bucket, since=since, csv="--csv" in a)
    elif cmd=="log":
        cmd_log()
    else:
        snapshot()
