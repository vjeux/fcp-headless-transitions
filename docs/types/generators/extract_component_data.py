#!/usr/bin/env python3
"""Corpus-wide data for COMPONENT types (factory descriptions) and BEHAVIORS,
paralleling filter_data.json. Components are <factory description=...> node types
(Channel, Replicator, Rig, Shape, Generator, Image Mask, Clone Layer, Camera, Text...).
Behaviors are built-in animation behaviors (Link, Rig Behavior, Clamp, Ramp...)."""
import xml.etree.ElementTree as ET, json, os
from collections import defaultdict, Counter
MANIFEST=os.path.expanduser('~/motr-collection/manifest.jsonl')

KNOWN_BEHAVIORS={'Rig Behavior','Link','Clamp','Ramp','Rate','Oscillate','Randomize','Align To',
 'Throw','Spin','Grow/Shrink','Fade In/Fade Out','Motion Path','Wriggle','Vortex','Attractor',
 'Repel','Orbit Around','Random Motion','Snap Alignment','Track','Stop','Negate','Reverse',
 'Overshoot','Custom','Sequence','Gravity','Edge Collision','Drag','Rotational Drag','Spring',
 'Sequence Text','Type On','Scale To','Point'}
import re
def normb(s):
    s=' '.join((s or '').split()); base=s; prev=None
    while prev!=base:
        prev=base
        base=re.sub(r'\s+copy$','',base); base=re.sub(r'\s+\d+$','',base)
        base=re.sub(r'\s+(PX|PY|PZ|SX|SY|SZ|RX|RY|RZ|Scale|Rotation|Position|Opacity)$','',base)
    for k in sorted(KNOWN_BEHAVIORS,key=len,reverse=True):
        if base==k or base.startswith(k+' '): return k
    return base

comp=defaultdict(lambda:{'files':0,'instances':0})
beh=defaultdict(lambda:{'files':0,'instances':0,'params':Counter()})
files=0; failed=0
for line in open(MANIFEST):
    line=line.strip()
    if not line: continue
    try: d=json.loads(line)
    except: continue
    st=d.get('stored')
    if not st or not os.path.isfile(st): continue
    try: root=ET.fromstring(open(st,'rb').read().decode('utf-8','replace'))
    except: failed+=1; continue
    files+=1
    lc=set(); lb=set()
    for e in root.iter():
        if e.tag=='factory':
            de=e.find('description')
            if de is not None and de.text:
                c=' '.join(de.text.split()); comp[c]['instances']+=1; lc.add(c)
        elif e.tag in ('behavior','parameterBehavior'):
            nm=normb(e.get('name') or e.tag)
            if nm not in KNOWN_BEHAVIORS: continue
            beh[nm]['instances']+=1; lb.add(nm)
            for p in e.findall('parameter'): beh[nm]['params'][' '.join((p.get('name') or '?').split())]+=1
    for c in lc: comp[c]['files']+=1
    for b in lb: beh[b]['files']+=1
out={'meta':{'files':files,'failed':failed},
     'components':{k:v for k,v in sorted(comp.items(),key=lambda kv:-kv[1]['instances'])},
     'behaviors':{k:{'files':v['files'],'instances':v['instances'],'params':dict(v['params'].most_common(24))}
                  for k,v in sorted(beh.items(),key=lambda kv:-kv[1]['instances'])}}
json.dump(out, open(os.path.expanduser('~/motr-collection/component_data.json'),'w'), indent=1)
print('components:',len(comp),'behaviors:',len(beh),'files:',files)
