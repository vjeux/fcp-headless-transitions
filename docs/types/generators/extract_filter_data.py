#!/usr/bin/env python3
"""Accurate per-filter data extraction for fcp-headless-transitions docs.
Fixes the naive version: types are inferred from values aggregated across the WHOLE corpus
(so 'Mix' with any fractional value anywhere -> float, not bool); FxPlug plumbing params are
flagged; child structure (point/color) detected. Output: filter_data.json (structured, keyed
by pluginUUID) for the human doc authoring pass."""
import xml.etree.ElementTree as ET, json, os
from collections import defaultdict, Counter

MANIFEST = os.path.expanduser('~/motr-collection/manifest.jsonl')
OUT = os.path.expanduser('~/motr-collection/filter_data.json')

# FxPlug boilerplate params present on (almost) every ProPlugin filter — not the filter's
# real creative knobs. Documented once globally, hidden from per-filter "real param" tables.
PLUMBING = {
    'Flip','Input Points','Publish OSC','OSC Center','Crop','360° Aware',
    'HDR In Rec. 709','Clip to White','Clip to Black','Prescale Input',
}

def is_num(x):
    try: float(x); return True
    except: return False

class P:
    __slots__=('count','kf','vmin','vmax','nsamp','frac','defaults','children','shapes','distinct')
    def __init__(s):
        s.count=0; s.kf=0; s.vmin=None; s.vmax=None; s.nsamp=0; s.frac=False
        s.defaults=Counter(); s.children=Counter(); s.shapes=Counter(); s.distinct=set()

class F:
    def __init__(s):
        s.files=0; s.instances=0; s.pae=Counter(); s.disp=Counter(); s.params=defaultdict(P)

filters=defaultdict(F)
files_parsed=0; files_failed=0

def note(agg, pel):
    nm=' '.join((pel.get('name') or '?').split())
    pa=agg.params[nm]; pa.count+=1
    for s in pel.findall('parameter'): pa.children[' '.join((s.get('name') or '?').split())]+=1
    v=pel.get('value'); d=pel.get('default')
    if d is not None: pa.defaults[d]+=1
    if v is not None:
        parts=v.split()
        pa.shapes['scalar' if len(parts)==1 else f'{len(parts)}-tuple']+=1
        if is_num(v):
            fv=float(v); pa.nsamp+=1
            if len(pa.distinct)<64: pa.distinct.add(round(fv,4))
            if fv!=int(fv): pa.frac=True
            pa.vmin=fv if pa.vmin is None else min(pa.vmin,fv)
            pa.vmax=fv if pa.vmax is None else max(pa.vmax,fv)
    if pel.find('curve') is not None or pel.find('.//keypoint') is not None: pa.kf+=1

for line in open(MANIFEST):
    line=line.strip()
    if not line: continue
    try: d=json.loads(line)
    except: continue
    st=d.get('stored')
    if not st or not os.path.isfile(st): continue
    try: root=ET.fromstring(open(st,'rb').read().decode('utf-8','replace'))
    except: files_failed+=1; continue
    files_parsed+=1
    local=set()
    for flt in root.iter('filter'):
        u=(flt.get('pluginUUID') or '').upper() or ('NAME:'+(flt.get('name') or '?'))
        agg=filters[u]; agg.instances+=1; local.add(u)
        if flt.get('pluginName'): agg.pae[flt.get('pluginName')]+=1
        if flt.get('name'): agg.disp[flt.get('name')]+=1
        for p in flt.findall('parameter'): note(agg,p)
    for u in local: filters[u].files+=1

def ptype(pa):
    ch=set(pa.children)
    if {'Red','Green','Blue'} & ch: return 'color'
    if {'X','Y','Z'} <= ch: return 'vec3'
    if {'X','Y'} <= ch: return 'point2D'
    if pa.shapes and pa.shapes.most_common(1)[0][0]!='scalar':
        return pa.shapes.most_common(1)[0][0]
    if pa.nsamp==0:
        return 'group' if pa.children else 'unknown'
    vals=pa.distinct
    # bool ONLY if every observed value is 0/1 AND never fractional AND there are ≥2 distinct... 
    if not pa.frac and vals and vals <= {0.0,1.0}:
        return 'bool'
    if not pa.frac and vals and max(vals)<=12 and min(vals)>=0 and len(vals)<=10:
        return 'enum(int)'
    return 'float'

out={}
for u,agg in filters.items():
    params={}
    for nm,pa in sorted(agg.params.items(), key=lambda kv:-kv[1].count):
        params[nm]={
            'type':ptype(pa),
            'default':(pa.defaults.most_common(1)[0][0] if pa.defaults else None),
            'min':pa.vmin,'max':pa.vmax,'fractional':pa.frac,
            'keyframed':pa.kf,'seen':pa.count,
            'plumbing':nm in PLUMBING,
            'children':[n for n,_ in pa.children.most_common(8)] if pa.children else [],
            'distinct_sample':sorted(pa.distinct)[:16],
        }
    out[u]={
        'uuid':u,
        'pae':(agg.pae.most_common(1)[0][0] if agg.pae else None),
        'display_names':[[n,c] for n,c in agg.disp.most_common(6)],
        'files':agg.files,'instances':agg.instances,
        'params':params,
    }
json.dump({'meta':{'files_parsed':files_parsed,'files_failed':files_failed,'plumbing':sorted(PLUMBING)},
           'filters':out}, open(OUT,'w'), indent=1)
print(f'parsed={files_parsed} failed={files_failed} filters={len(out)}')
print('wrote', OUT)
