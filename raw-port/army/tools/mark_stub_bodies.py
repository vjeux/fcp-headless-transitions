#!/usr/bin/env python3
"""mark_stub_bodies.py — force every THROW-ONLY function body to ledger status `stub` (not `ported`),
by matching the DEFINITION ITSELF to its ledger entry — never by symbols/addresses it merely cites.

WHY the naive approach fails: a throw-stub's JSDoc/message names its UNRESOLVED CALLEES ("frontier:
OZChannel", "called from @0x53869", the mangled sym it defers to). Extracting those as the stub's
identity wrongly flips REAL functions that share that symbol/address. So we IGNORE cited ids and
instead match by (class, leaf-method-name) — the def's own name — resolving the class from the file
and the ledger's demangled name. This is the same reliable signal the census used.

Mapping rule (per throw-only def found by strip_stubs' body detector):
  - the def is a class method NAME in file F. The file basename (minus .ts) is the class C
    (one-class-per-file rule). We flip the ledger entry whose demangled == "C::NAME(...)" or whose
    demangled leaf == NAME within class C, in the framework that owns C. Free-function defs and
    local helper stubs (objc_release_stub, etc.) have no ledger entry -> skipped.

Idempotent; dry-run by default.  --apply writes.  Re-run depgraph.py build/order afterwards.
"""
import sys, os, re, glob, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC  = os.path.join(ROOT, "src"); LED = os.path.join(ROOT, "army", "ledger")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import strip_stubs as ss
import srcsource

def _throwonly_methods(ref=None):
    """Return {(fileClass, leafName)} for every CLASS-MEMBER throw-only def. (fileClass = basename)."""
    out=set()
    cache=srcsource.FileCache("throwonly_methods", version=1)
    seen=set()
    for p, blob_key, text in srcsource.iter_src(ref):
        seen.add(blob_key)
        for leaf in cache.get_or_compute(blob_key, p, text, _throwonly_in_file):
            out.add((os.path.basename(p)[:-3], leaf))
    cache.save(keep_keys=seen)
    return out


def _throwonly_in_file(path, text):
    """Leaf names of this file's throw-only CLASS-MEMBER defs. Content-addressed and cached.

    PERFORMANCE: the depth/enclosing-class tests are answered for every def in ONE linear pass
    (`strip_stubs._scan_brace_context`). Calling `_structural_depth` and `_enclosing_brace_is_class`
    per def re-walked the file from character 0 each time — quadratic, and measured at 95 of
    mark_ported's 142 seconds (0.73 BILLION char-steps over the corpus, 27x a single pass).
    `verifier/test_brace_context.py` pins the batch scanner to the per-def originals.
    """
    out=[]
    defs=[m for m in ss.DEF.finditer(text)
          if m.group('mname') and not m.group('fname')
          and m.group('mname') not in ('if','for','while','switch','catch','return','function','constructor')]
    if not defs: return out
    ctx=ss._scan_brace_context(text, [m.start() for m in defs])
    for m,(depth,is_class) in zip(defs, ctx):
        if depth!=1 or not is_class: continue
        name=m.group('mname')
        paren=text.find('(',m.start()); pd=0;j=paren;se=-1
        while j<len(text):
            if text[j]=='(':pd+=1
            elif text[j]==')':
                pd-=1
                if pd==0:se=j;break
            j+=1
        if se<0:continue
        br=text.find('{',se)
        if br<0:continue
        end=ss._match_brace(text,br)
        if end<0:continue
        if ss._body_is_incomplete_throw(text[br+1:end-1]):
            out.append(name)
    return out

def main():
    apply='--apply' in sys.argv
    throwset=_throwonly_methods()
    print(f"class-member throw-only bodies (by file-class + leaf name): {len(throwset)}")
    flipped=0; samp=[]
    for fw in ["ProChannel","ProCore","Ozone","Flexo","Helium"]:
        lp=os.path.join(LED,f"{fw}.ledger.json")
        if not os.path.exists(lp):continue
        led=json.load(open(lp)); changed=False
        for cls,ms in led.items():
            if not isinstance(ms,dict):continue
            for k,v in ms.items():
                if not isinstance(v,dict) or v.get("status")!="ported":continue
                dem=v.get("demangled","")
                leaf=dem.split("(")[0].split("::")[-1].strip()
                # the class the port file would be named after = last C++ scope before the method
                scope=dem.split("(")[0]
                cppcls=scope.split("::")[-2] if "::" in scope else cls
                # match on (fileclass==cppcls OR fileclass==ledger cls) AND leaf name
                if ((cppcls,leaf) in throwset) or ((cls,leaf) in throwset):
                    v["status"]="stub"; changed=True; flipped+=1
                    if len(samp)<12: samp.append(f"{fw} {cls}::{leaf}")
        if changed and apply:
            # ATOMIC write-temp+os.replace (see mark_ported.py): bare json.dump(open(lp,"w"))
            # truncates then streams, so a concurrent `depgraph.py deps` reader gets a partial
            # file -> JSONDecodeError. os.replace is atomic on POSIX.
            _tmp=f"{lp}.tmp.{os.getpid()}"
            with open(_tmp,"w") as _f: json.dump(led,_f)
            os.replace(_tmp,lp)
    print(f"  ported -> stub: {flipped}")
    for s in samp: print("   ",s)
    print(f"  {'APPLIED' if apply else 'DRY-RUN (use --apply)'}")

if __name__=="__main__": main()
