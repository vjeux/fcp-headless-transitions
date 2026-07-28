#!/usr/bin/env python3
"""resweep_landed_bases.py — find ports that still throw-stub a base class whose .ts NOW EXISTS.
Prepared offline 2026-07-28. Run from repo root. These are 'rework' items: after a base landed,
its subclasses were never re-opened to import/extend the real base. Highest-leverage cleanup
(Part 4 found 30+ files still stub HGObject/HGNode though those bases landed)."""
import os,re,glob
ported={os.path.basename(p)[:-3] for p in glob.glob('raw-port/src/**/*.ts',recursive=True)}
mark=re.compile(r'not yet|pending|unimpl|transcrib|frontier|undecoded|hasn.t been|not ported',re.I)
rework=[]
for p in glob.glob('raw-port/src/**/*.ts',recursive=True):
    base_self=os.path.basename(p)[:-3]
    for i,l in enumerate(open(p,errors="replace"),1):
        if 'throw' in l and mark.search(l):
            # which class does this stub cite?
            for cls in re.findall(r'\b(HG[A-Z]\w+|OZ[A-Z]\w+|PC[A-Z]\w+|FF[A-Z]\w+|Li[A-Z]\w+)\b', l):
                if cls in ported and cls!=base_self:
                    rework.append((os.path.relpath(p,'raw-port/src'), i, cls))
                    break
import collections
by_base=collections.Counter(c for _,_,c in rework)
print(f"REWORK items: {len(rework)} stub-lines across {len(set(f for f,_,_ in rework))} files "
      f"cite a base class that is ALREADY PORTED — re-open to wire the real base.")
print("\nMost-cited already-landed bases (finish wiring these first):")
for cls,n in by_base.most_common(20): print(f"  {n:3}  {cls}")
print("\nSample rework sites:")
for f,i,c in rework[:30]: print(f"  {f}:{i}  stubs landed base {c}")
