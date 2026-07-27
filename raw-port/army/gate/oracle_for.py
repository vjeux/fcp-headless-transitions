#!/usr/bin/env python3
"""oracle_for.py <changed.ts ...> — print the parity node ids to sweep for the changed files."""
import json,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
m=json.load(open(os.path.join(ROOT,"army","gate","oracle_map.json")))
ids=[]
for p in sys.argv[1:]:
    base=os.path.basename(p).replace(".ts","")
    for key,nodeids in m.items():
        if key!="_comment" and (key==base or key in p): ids+=nodeids
print(" ".join(sorted(set(ids))))
