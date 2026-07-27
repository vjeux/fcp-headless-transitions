#!/usr/bin/env python3
"""Generic per-scope attrId<->name decoder for a given framework binary.
Usage: decode_scopes_fw.py <Framework>  (e.g. ProChannel, Ozone, ProCore)
Writes re/scopes_<fw>.json + re/scope_symbols_<fw>.txt
Scope descriptor rows are 16 bytes in __DATA __data (or __const): [namePtr:48][flags:16][tag:32][attrId:32].
"""
import subprocess, re, json, os, sys, bisect
fw=sys.argv[1]
BIN=f"/Applications/Final Cut Pro.app/Contents/Frameworks/{fw}.framework/Versions/A/{fw}"
def otool(seg,sect):
    return subprocess.run(["otool","-v","-s",seg,sect,"-arch","x86_64",BIN],capture_output=True,text=True).stdout
cstr={}
for line in otool("__TEXT","__cstring").splitlines():
    m=re.match(r'^([0-9a-f]{16})\s+(.*)$',line)
    if m: cstr[int(m.group(1),16)]=m.group(2)
databytes={}
for seg,sect in [("__DATA","__data"),("__DATA","__const"),("__TEXT","__const"),("__DATA_CONST","__const")]:
    for line in otool(seg,sect).splitlines():
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
# scope symbols
scopes=[]
sy=subprocess.run(["bash","-c",f'nm -arch x86_64 "{BIN}" 2>/dev/null | c++filt | grep -iE " [dD] .*Scope"'],capture_output=True,text=True).stdout
open(f"raw-port/re/scope_symbols_{fw}.txt","w").write(sy)
for line in sy.splitlines():
    m=re.match(r'^([0-9a-f]{16}) [dD] _?(\S+)',line)
    if m: scopes.append((int(m.group(1),16),m.group(2)))
scopes.sort(); addrs=[a for a,_ in scopes]
def scope_of(a):
    i=bisect.bisect_right(addrs,a)-1
    return scopes[i][1] if i>=0 else "?"
out={}; rows=[]
if databytes:
    lo=min(databytes); hi=max(databytes)
    for a in range(lo-(lo%16),hi,16):
        raw=u(a,8)
        if raw is None: continue
        namePtr=raw&0xFFFFFFFFFFFF; flags=(raw>>48)&0xFFFF
        tag=u(a+8,4); attrId=u(a+12,4)
        if tag is None or attrId is None: continue
        nm=cstr.get(namePtr)
        if nm and flags in (0x10,0x20,0x40,0x60) and (tag&0xffff)<0x400 and attrId<0x100000:
            sc=scope_of(a); out.setdefault(sc,{})[hex(attrId)]=nm
            rows.append({"scope":sc,"tag":tag&0xffff,"id":attrId,"name":nm})
json.dump(out,open(f"raw-port/re/scopes_{fw}.json","w"),indent=1,sort_keys=True)
print(fw,"scopes:",len(out),"rows:",len(rows))
for s in ["OZChannelScope","OZChannelBaseScope","OZCurveScope","OZChannelFolderScope","OZChannelObjectRootBaseScope"]:
    if s in out: print("--",s,out[s])
