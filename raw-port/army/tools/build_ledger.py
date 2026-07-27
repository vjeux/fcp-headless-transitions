#!/usr/bin/env python3
"""build_ledger.py [FW...] — canonical work-ledger builder for Operation Faithful Port.

Unit of work = one C++ CLASS = one src/<layer>/<Class>.ts. This groups every defined function by
class and records status. Idempotent; re-run any time (also calls mark_ported logic inline).

Input : army/inventory/<FW>.syms.txt   (nm -n: "<addr> T <mangled>")
Output: army/ledger/<FW>.ledger.json   {class:{ "method@addr":{addr,mangled,demangled,status} }}
        army/ledger/CLASSES.tsv        fw <tab> class <tab> nMethods <tab> nPorted
        army/ledger/SUMMARY.json       {fw:{functions,classes,ported}}
"""
import json, os, re, subprocess, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
INV=os.path.join(ROOT,"army","inventory"); LED=os.path.join(ROOT,"army","ledger")
os.makedirs(LED,exist_ok=True)

def ported_addrs():
    txt=""
    for f in subprocess.run(["find",os.path.join(ROOT,"src"),"-name","*.ts"],capture_output=True,text=True).stdout.split():
        try: txt+=open(f).read()
        except: pass
    return set(x.lower() for x in re.findall(r'@0x([0-9a-fA-F]+)',txt))

def class_method(dem):
    depth=0; cut=len(dem)
    for i,c in enumerate(dem):
        if c=='<': depth+=1
        elif c=='>': depth-=1
        elif c=='(' and depth==0: cut=i; break
    head=dem[:cut]
    return head.rsplit("::",1) if "::" in head else ("(free)",head)

def main():
    fws=sys.argv[1:] or ["ProChannel","ProCore","Ozone","Flexo"]
    ported=ported_addrs(); summary={}; rows=[]
    for fw in fws:
        p=os.path.join(INV,f"{fw}.syms.txt")
        if not os.path.exists(p): continue
        mang=[]
        for line in open(p):
            m=re.match(r'^([0-9a-f]+)\s+[Tt]\s+(__Z\S+)',line)
            if m: mang.append((m.group(1),m.group(2)))
        dem=subprocess.run(["c++filt"],input="\n".join(s for _,s in mang),capture_output=True,text=True).stdout.splitlines()
        ledger={}
        for (addr,mg),d in zip(mang,dem):
            cls,meth=class_method(d)
            st="ported" if addr.lower() in ported else "todo"
            ledger.setdefault(cls,{})[f"{meth}@0x{addr}"]={"addr":"0x"+addr,"mangled":mg,"demangled":d,"status":st}
        json.dump(ledger,open(os.path.join(LED,f"{fw}.ledger.json"),"w"))
        nport=sum(1 for c in ledger.values() for u in c.values() if u["status"]=="ported")
        summary[fw]={"functions":len(mang),"classes":len([c for c in ledger if c!="(free)"]),"ported":nport}
        for cls,ms in ledger.items():
            rows.append((fw,cls,len(ms),sum(1 for u in ms.values() if u["status"]=="ported")))
        print(f"{fw:12} {len(mang):6} fns  {summary[fw]['classes']:5} classes  {nport} ported")
    rows.sort(key=lambda r:-r[2])
    with open(os.path.join(LED,"CLASSES.tsv"),"w") as f:
        f.write("fw\tclass\tnMethods\tnPorted\n")
        for r in rows: f.write("\t".join(map(str,r))+"\n")
    json.dump(summary,open(os.path.join(LED,"SUMMARY.json"),"w"),indent=2)
    print("wrote CLASSES.tsv + SUMMARY.json")

if __name__=="__main__": main()
