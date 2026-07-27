#!/usr/bin/env python3
"""frontier.py — the demand queue: which classes to port NEXT.

Two signals:
 (A) throw-stubs in src/ that name an un-transcribed callee -> immediate demand.
 (B) callees of already-ported functions that are still 'todo' in the ledger (BFS outward).
Prints ready-to-claim classes with method counts, so the coordinator can assign them.
Usage: frontier.py [FW]   (default: all)
"""
import json, os, re, subprocess, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LED=os.path.join(ROOT,"army","ledger")
# (A) explicit throws naming an addr/symbol
src=""
for f in subprocess.run(["find",os.path.join(ROOT,"src"),"-name","*.ts"],capture_output=True,text=True).stdout.split():
    try: src+=open(f).read()
    except: pass
throw_addrs=set(x.lower() for x in re.findall(r'not yet transcribed[^\n]*@0x([0-9a-fA-F]+)',src))
fws=sys.argv[1:] or ["ProChannel","ProCore","Ozone","Flexo"]
print("=== explicit frontier (throw-stubs naming an un-ported addr) ===")
hits=0
for fw in fws:
    lp=os.path.join(LED,f"{fw}.ledger.json")
    if not os.path.exists(lp): continue
    led=json.load(open(lp))
    for cls,ms in led.items():
        for v in ms.values():
            if v["addr"].lower().lstrip("0x") in throw_addrs:
                print(f"  {fw} {cls}  {v['addr']}  {v['demangled']}"); hits+=1
if not hits: print("  (none — add throwing stubs that cite @0xADDR to grow the frontier)")
print("\n=== next-tier ready classes (todo classes with most methods, by fw) ===")
for fw in fws:
    lp=os.path.join(LED,f"{fw}.ledger.json")
    if not os.path.exists(lp): continue
    led=json.load(open(lp))
    todo=[(cls,len(ms)) for cls,ms in led.items() if cls!="(free)" and all(v["status"]=="todo" for v in ms.values())]
    todo.sort(key=lambda x:-x[1])
    print(f"  [{fw}] "+", ".join(f"{c}({n})" for c,n in todo[:8]))
