#!/usr/bin/env python3
"""mark_ported.py — reconcile ledger status with src/ truth (3-way: ported/stub/todo).

The @0xADDR citation (PORTING_SPEC rule 1) is the completion signal, BUT a throwing stub ALSO
cites its addr. The naive "addr cited anywhere => ported" rule OVERCOUNTS: it flips stub methods to
ported. This uses the shared `stubscan` oracle to classify HOW each addr is cited:

  ported  = addr appears in a real body / JSDoc / comment (real-cited)
  stub     = addr appears ONLY on a throwing-stub line ("... not yet transcribed ...")
  todo    = addr never appears in src/

Bidirectional + idempotent: promotes todo->ported AND demotes a previously-miscounted
ported->stub when the body is (still) just a throw. Run after commits; then re-run build_ledger.py
to refresh CLASSES.tsv / SUMMARY.json counts."""
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LED=os.path.join(ROOT,"army","ledger")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stubscan import scan_src, norm

real_cited, stub_cited = scan_src(ROOT)
def status_for(addr):
    a=norm(addr)
    return "ported" if a in real_cited else "stub" if a in stub_cited else "todo"

tot=port=stub=todo=changed=0
for fw in ["ProChannel","ProCore","Ozone","Flexo","Helium"]:
    lp=os.path.join(LED,f"{fw}.ledger.json")
    if not os.path.exists(lp): continue
    led=json.load(open(lp))
    for ms in led.values():
        for v in ms.values():
            tot+=1
            want=status_for(v["addr"])
            if v.get("status")!=want:
                v["status"]=want; changed+=1
            if want=="ported": port+=1
            elif want=="stub": stub+=1
            else: todo+=1
    json.dump(led,open(lp,"w"))
print(f"ported {port}/{tot}  stub {stub}  todo {todo}  (status changed on {changed} units)")
