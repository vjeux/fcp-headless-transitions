#!/usr/bin/env python3
"""Decode Ozone PCScope tables into PER-SCOPE attribute-id<->name maps.
Scope descriptor rows are 16 bytes in __DATA __data: [namePtr:48][flags:16][tag:32][attrId:32].
Scope boundaries come from nm symbols (e.g. OZSceneNodeReadScope @ addr). Each scope = the run of
descriptor rows from its symbol addr to the next scope symbol addr.
Outputs:
  re/scopes.json          { "<Scope>": { "<attrId_hex>": "name", ... }, ... }
  re/attr_names.json      (kept: global best-effort, collisions collapsed)
"""
import subprocess, re, json, os
OZ="/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone"
def otool(seg,sect):
    return subprocess.run(["otool","-v","-s",seg,sect,"-arch","x86_64",OZ],capture_output=True,text=True).stdout
cstr={}
for line in otool("__TEXT","__cstring").splitlines():
    m=re.match(r'^([0-9a-f]{16})\s+(.*)$',line)
    if m: cstr[int(m.group(1),16)]=m.group(2)
databytes={}
for line in otool("__DATA","__data").splitlines():
    m=re.match(r'^([0-9a-f]{16})\t(.*)$',line)
    if not m: continue
    addr=int(m.group(1),16)
    for i,x in enumerate(m.group(2).split()):
        if re.fullmatch(r'[0-9a-f]{2}',x): databytes[addr+i]=int(x,16)
def u(a,n):
    v=0
    for i in range(n):
        if a+i not in databytes: return None
        v|=databytes[a+i]<<(8*i)
    return v
# scope symbols (addr -> name), sorted
scopes=[]
for line in open("raw-port/re/scope_symbols.txt"):
    m=re.match(r'^([0-9a-f]{16}) [dD] _?(\S+)',line)
    if m: scopes.append((int(m.group(1),16), m.group(2)))
scopes.sort()
addrs=[a for a,_ in scopes]
def scope_of(a):
    import bisect
    i=bisect.bisect_right(addrs,a)-1
    return scopes[i][1] if i>=0 else "?"
out={}
allrows=[]
lo=min(databytes); hi=max(databytes)
for a in range(lo-(lo%16),hi,16):
    raw=u(a,8)
    if raw is None: continue
    namePtr=raw & 0xFFFFFFFFFFFF; flags=(raw>>48)&0xFFFF
    tag=u(a+8,4); attrId=u(a+12,4)
    if tag is None or attrId is None: continue
    nm=cstr.get(namePtr)
    if nm and flags in (0x10,0x20,0x40,0x60) and (tag&0xffff)<0x400 and attrId<0x100000:
        sc=scope_of(a)
        out.setdefault(sc,{})[hex(attrId)]=nm
        allrows.append({"scope":sc,"addr":hex(a),"tag":tag&0xffff,"id":attrId,"name":nm})
json.dump(out,open("raw-port/re/scopes.json","w"),indent=1,sort_keys=True)
json.dump(allrows,open("raw-port/re/scope_rows.json","w"),indent=0)
print("scopes decoded:",len(out),"total rows:",len(allrows))
for s in ["OZSceneNodeReadScope","OZElementScope","OZTransformNodeScope","OZGroupScope","OZFootageScope"]:
    print(f"--- {s} ---", out.get(s,{}))
