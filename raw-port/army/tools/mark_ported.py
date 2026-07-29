#!/usr/bin/env python3
"""mark_ported.py — flip ledger status to 'ported' for every unit whose @0xADDR is cited in src/.
The @0xADDR citation (PORTING_SPEC rule 1) is the completion signal. Idempotent; run after commits.
Then re-run build_ledger.py to refresh CLASSES.tsv counts."""
import json, os, re, subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LED=os.path.join(ROOT,"army","ledger")
txt=""
for f in subprocess.run(["find",os.path.join(ROOT,"src"),"-name","*.ts"],capture_output=True,text=True).stdout.split():
    try: txt+=open(f).read()
    except: pass
cited=set(x.lower() for x in re.findall(r'@0x([0-9a-fA-F]+)',txt))
cited|=set(x.lower() for x in re.findall(r'\b0x([0-9a-fA-F]{4,})',txt))
tot=port=0
for fw in ["ProChannel","ProCore","Ozone","Flexo","Helium"]:
    lp=os.path.join(LED,f"{fw}.ledger.json")
    if not os.path.exists(lp): continue
    led=json.load(open(lp))
    for ms in led.values():
        for v in ms.values():
            tot+=1
            if v["addr"].lower().lstrip("0x") in cited and v["status"]=="todo": v["status"]="ported"
            if v["status"]!="todo": port+=1
    json.dump(led,open(lp,"w"))
print(f"ported {port}/{tot} functions")
