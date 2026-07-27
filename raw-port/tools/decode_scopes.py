#!/usr/bin/env python3
import subprocess, re, json, os
OZ="/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone"
def otool(seg,sect):
    return subprocess.run(["otool","-v","-s",seg,sect,"-arch","x86_64",OZ],capture_output=True,text=True).stdout
cstr={}
for line in otool("__TEXT","__cstring").splitlines():
    m=re.match(r'^([0-9a-f]{16})\s+(.*)$',line)
    if m: cstr[int(m.group(1),16)]=m.group(2)
print("cstrings:",len(cstr))
databytes={}
for line in otool("__DATA","__data").splitlines():
    m=re.match(r'^([0-9a-f]{16})\t(.*)$',line)
    if not m: continue
    addr=int(m.group(1),16)
    bs=[int(x,16) for x in m.group(2).split() if re.fullmatch(r'[0-9a-f]{2}',x)]
    for i,b in enumerate(bs): databytes[addr+i]=b
print("data bytes:",len(databytes))
def u(addr,n):
    v=0
    for i in range(n):
        if addr+i not in databytes: return None
        v|=databytes[addr+i]<<(8*i)
    return v
rows=[]
addrs=sorted(databytes.keys())
lo,hi=addrs[0],addrs[-1]
for a in range(lo-(lo%16),hi,16):
    raw=u(a,8)
    if raw is None: continue
    namePtr=raw & 0xFFFFFFFFFFFF  # low 48 bits
    flags=(raw>>48)&0xFFFF
    tag=u(a+8,4); attrId=u(a+12,4)
    if tag is None or attrId is None: continue
    nm=cstr.get(namePtr)
    if nm and flags in (0x20,0x40,0x60,0x10) and 0<=(tag&0xffff)<0x400 and attrId<0x100000:
        rows.append({"addr":hex(a),"tag":tag&0xffff,"id":attrId,"flags":flags,"name":nm})
os.makedirs("raw-port/re",exist_ok=True)
json.dump(rows,open("raw-port/re/scope_rows.json","w"),indent=0)
idname={}
for r in rows: idname[r["id"]]=r["name"]
json.dump({hex(k):idname[k] for k in sorted(idname)},open("raw-port/re/attr_names.json","w"),indent=1)
print("descriptor rows:",len(rows),"distinct ids:",len(idname))
print("sample:", {hex(k):idname[k] for k in sorted(idname)[:24]})
