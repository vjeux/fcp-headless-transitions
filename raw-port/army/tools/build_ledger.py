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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))   # tools/ on path for stubscan
from stubscan import scan_src, norm as _norm   # shared "real body vs throw-stub" oracle

def status_sets():
    """Return (real_cited, stub_cited) normalized-addr sets from src/ (via stubscan).
    real_cited => a real body/JSDoc/comment names the addr (ported).
    stub_cited => addr appears ONLY on a throwing-stub line (placeholder; status=stub)."""
    return scan_src(ROOT)

def class_method(dem):
    depth=0; cut=len(dem)
    for i,c in enumerate(dem):
        if c=='<': depth+=1
        elif c=='>': depth-=1
        elif c=='(' and depth==0: cut=i; break
    head=dem[:cut]
    return head.rsplit("::",1) if "::" in head else ("(free)",head)

# ObjC symbol: "-[Class sel]" / "+[Class sel]" / "-[Class(Category) sel]". Class is the port unit;
# the '-'/'+' prefix + selector is the method key. Categories fold into the base Class.
OBJC_RE = re.compile(r'^([0-9a-f]+)\s+[Tt]\s+([-+])\[([^\]\s]+?)(?:\(([^)]*)\))?\s+([^\]]+)\]')

def main():
    # Full engine scope (per ARMY.md §1): ALL frameworks, C++ AND ObjC symbols.
    fws=sys.argv[1:] or ["ProChannel","ProCore","Ozone","Flexo","Helium"]
    real_cited, stub_cited = status_sets(); summary={}; rows=[]
    def _status(addr):
        a=_norm(addr)
        return "ported" if a in real_cited else "stub" if a in stub_cited else "todo"
    for fw in fws:
        p=os.path.join(INV,f"{fw}.syms.txt")
        if not os.path.exists(p): continue
        mang=[]        # C++ (addr, mangled)
        objc=[]        # ObjC (addr, cls, methkey, full)
        for line in open(p):
            m=re.match(r'^([0-9a-f]+)\s+[Tt]\s+(__Z\S+)',line)
            if m: mang.append((m.group(1),m.group(2))); continue
            o=OBJC_RE.match(line)
            if o:
                addr,pm,cls,cat,sel=o.groups()
                methkey=f"{pm}[{cls}{('('+cat+')') if cat else ''} {sel}]"
                objc.append((addr,cls,methkey,o.group(0).split(None,2)[2]))
        dem=subprocess.run(["c++filt"],input="\n".join(s for _,s in mang),capture_output=True,text=True).stdout.splitlines()
        ledger={}
        for (addr,mg),d in zip(mang,dem):
            cls,meth=class_method(d)
            st=_status(addr)
            ledger.setdefault(cls,{})[f"{meth}@0x{addr}"]={"addr":"0x"+addr,"mangled":mg,"demangled":d,"status":st,"kind":"cpp"}
        for addr,cls,methkey,full in objc:
            st=_status(addr)
            ledger.setdefault(cls,{})[f"{methkey}@0x{addr}"]={"addr":"0x"+addr,"mangled":full,"demangled":full,"status":st,"kind":"objc"}
        _lp=os.path.join(LED,f"{fw}.ledger.json")
        # ATOMIC write-temp+os.replace: concurrent workers read these ledgers via depgraph.py;
        # a bare json.dump(open(,"w")) truncates+streams -> partial-read JSONDecodeError.
        _tmp=f"{_lp}.tmp.{os.getpid()}"
        with open(_tmp,"w") as _f: json.dump(ledger,_f)
        os.replace(_tmp,_lp)
        nfns=len(mang)+len(objc)
        nport=sum(1 for c in ledger.values() for u in c.values() if u["status"]=="ported")
        nstub=sum(1 for c in ledger.values() for u in c.values() if u["status"]=="stub")
        summary[fw]={"functions":nfns,"cpp":len(mang),"objc":len(objc),"classes":len([c for c in ledger if c!="(free)"]),"ported":nport,"stub":nstub}
        for cls,ms in ledger.items():
            rows.append((fw,cls,len(ms),sum(1 for u in ms.values() if u["status"]=="ported")))
        print(f"{fw:12} {nfns:6} fns ({len(mang)} cpp + {len(objc)} objc)  {summary[fw]['classes']:5} classes  {nport} ported  {nstub} stub")
    rows.sort(key=lambda r:-r[2])
    with open(os.path.join(LED,"CLASSES.tsv"),"w") as f:
        f.write("fw\tclass\tnMethods\tnPorted\n")
        for r in rows: f.write("\t".join(map(str,r))+"\n")
    json.dump(summary,open(os.path.join(LED,"SUMMARY.json"),"w"),indent=2)
    print("wrote CLASSES.tsv + SUMMARY.json")

if __name__=="__main__": main()
