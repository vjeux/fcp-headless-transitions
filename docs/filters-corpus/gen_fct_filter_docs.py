#!/usr/bin/env python3
"""Generate per-filter reference docs for the fcp-headless-transitions repo, keyed by
FxPlug pluginUUID (the repo's stable filter key; see docs/CATALOG.md and registry.ts).

For every filter UUID seen in the ~5,300-file Motion corpus, emit one markdown file with:
  - PAE class name (where known) + UUID + display names seen
  - implementation status (from engine/src/compositor/filters/registry)
  - every parameter: inferred TYPE, default, observed value RANGE, keyframe frequency, usage
Writes to docs/filters-corpus/<PAEName-or-uuid>.md and an index README.
"""
import json, os, re, glob
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter

REPO = os.path.expanduser('~/random/final-cut-pro-transitions')
OUT  = os.path.join(REPO, 'docs', 'filters-corpus')
MANIFEST = os.path.expanduser('~/motr-collection/manifest.jsonl')

def is_num(x):
    try: float(x); return True
    except: return False

# ---- build UUID -> PAE name and UUID -> impl status from the repo ----
uuid_pae = {}      # UUID -> PAEClassName
uuid_label = {}    # UUID -> engine label
impl_uuids = set() # UUIDs implemented in the TS engine

fu = os.path.join(REPO,'docs','FILTER_UNIVERSE.md')
if os.path.exists(fu):
    for m in re.finditer(r'(PAE[A-Za-z0-9]+)\s*\|\s*([0-9A-Fa-f-]{36})', open(fu).read()):
        uuid_pae[m.group(2).upper()] = m.group(1)

for f in glob.glob(os.path.join(REPO,'engine/src/compositor/filters/*.ts')):
    txt = open(f).read()
    for mm in re.finditer(r"uuid:\s*['\"]([0-9A-Fa-f-]{36})['\"]", txt):
        u = mm.group(1).upper(); impl_uuids.add(u)
        lm = re.search(r"label:\s*['\"]([^'\"]+)['\"]", txt)
        if lm: uuid_label[u] = lm.group(1)

# ---- scan corpus, aggregate per UUID ----
class FAgg:
    def __init__(self):
        self.files=0; self.instances=0; self.uuid=''
        self.pae=Counter(); self.dispnames=Counter(); self.params={}
    def param(self,pn):
        if pn not in self.params:
            self.params[pn]={'count':0,'kf':0,'min':None,'max':None,'nsamp':0,
                             'defaults':Counter(),'children':Counter(),'shapes':Counter()}
        return self.params[pn]

filters=defaultdict(FAgg)
files_parsed=0; files_failed=0

def note(agg, pel):
    pn=re.sub(r'\s+',' ',(pel.get('name') or '?').strip())
    pa=agg.param(pn); pa['count']+=1
    for s in pel.findall('parameter'): pa['children'][s.get('name') or '?']+=1
    v=pel.get('value'); d=pel.get('default')
    if d is not None: pa['defaults'][d]+=1
    if v is not None:
        parts=v.split(); pa['shapes']['scalar' if len(parts)==1 else f'{len(parts)}-tuple']+=1
        if is_num(v):
            f=float(v); pa['nsamp']+=1
            pa['min']=f if pa['min'] is None else min(pa['min'],f)
            pa['max']=f if pa['max'] is None else max(pa['max'],f)
    if pel.find('curve') is not None or pel.find('.//keypoint') is not None: pa['kf']+=1

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
        u=(flt.get('pluginUUID') or '').upper()
        if not u: 
            u='NO-UUID:'+ (flt.get('name') or '?')
        agg=filters[u]; agg.uuid=u; agg.instances+=1; local.add(u)
        pn=flt.get('pluginName')
        if pn: agg.pae[pn]+=1
        dn=flt.get('name')
        if dn: agg.dispnames[dn]+=1
        for p in flt.findall('parameter'): note(agg,p)
    for u in local: filters[u].files+=1

def infer_type(pa):
    ch=set(pa['children'])
    if {'Red','Green','Blue'} & ch: return 'color (RGB/RGBA)'
    if {'X','Y','Z'} <= ch: return 'vec3 (X,Y,Z)'
    if {'X','Y'} <= ch: return 'point2D (X,Y)'
    if pa['shapes']:
        top=pa['shapes'].most_common(1)[0][0]
        if top!='scalar': return f'{top} vector'
    if pa['nsamp']:
        lo,hi=pa['min'],pa['max']
        if lo==0.0 and hi in (0.0,1.0): return 'bool (0/1)' if hi==1.0 else 'float'
        if lo is not None and hi is not None and hi-lo<=20 and float(lo).is_integer() and float(hi).is_integer() and lo>=0:
            return 'menu/enum (int)'
        return 'float'
    if pa['children']:
        return 'group ('+', '.join(n for n,_ in pa['children'].most_common(6))+')'
    return 'float'

def rng(pa):
    if not pa['nsamp']: return '—'
    def f(x):
        if x is None: return '?'
        return str(int(x)) if float(x).is_integer() else f'{x:.4g}'
    return f"[{f(pa['min'])} … {f(pa['max'])}]"

def deflt(pa):
    return pa['defaults'].most_common(1)[0][0] if pa['defaults'] else '—'

def name_for(u, agg):
    if agg.pae: return agg.pae.most_common(1)[0][0]
    if u in uuid_pae: return uuid_pae[u]
    if u in uuid_label: return uuid_label[u]
    if agg.dispnames: return agg.dispnames.most_common(1)[0][0]
    return u

def slug(s): return re.sub(r'[^A-Za-z0-9]+','-',s).strip('-') or 'x'

os.makedirs(OUT, exist_ok=True)
written=[]
for u,agg in filters.items():
    nm=name_for(u,agg)
    status = '✅ implemented' if u in impl_uuids else '❌ not implemented'
    L=[f'# {nm}','']
    L.append(f'- **pluginUUID:** `{u}`')
    if agg.pae: L.append(f'- **PAE class:** `{agg.pae.most_common(1)[0][0]}`')
    dn=', '.join(f'{n} ({c})' for n,c in agg.dispnames.most_common(5))
    if dn: L.append(f'- **Display names seen:** {dn}')
    L.append(f'- **Engine status:** {status}')
    L.append(f'- **Corpus usage:** {agg.instances} instances across {agg.files} files')
    L.append('')
    if agg.params:
        L.append('## Parameters')
        L.append('')
        L.append('| Parameter | Type | Default | Observed range | Keyframed | Seen |')
        L.append('|---|---|---|---|---|---|')
        for pn,pa in sorted(agg.params.items(), key=lambda kv:-kv[1]['count']):
            L.append(f"| {pn.replace('|','\\|')} | {infer_type(pa).replace('|','\\|')} | `{deflt(pa)}` | {rng(pa)} | {pa['kf'] or '—'} | {pa['count']} |")
        L.append('')
    L.append('---')
    L.append('_Auto-generated from the Motion corpus (`~/motr-collection`) by `docs/filters-corpus/gen_fct_filter_docs.py`. '
             'Ranges/defaults are EMPIRICAL (observed in real templates), not Apple-documented limits. '
             'Keyed by FxPlug pluginUUID per `engine/src/compositor/filters/registry.ts`._')
    open(os.path.join(OUT, slug(nm)+'.md'),'w').write('\n'.join(L))
    written.append((nm,u,agg,status))

# index
written.sort(key=lambda x:-x[2].instances)
idx=['# Corpus Filter Reference (per pluginUUID)','',
     f'Every FxPlug filter observed in the ~{files_parsed}-file Motion corpus ({files_parsed} parsed, {files_failed} failed), '
     'keyed by pluginUUID — the stable identifier used by `engine/src/compositor/filters/registry.ts`. '
     'Each linked file lists every parameter with inferred **type**, **default**, empirical **value range**, and '
     '**keyframe frequency**. Complements `docs/FILTER_UNIVERSE.md` (the RE/shader map) with the full parameter surface.','',
     f'**{len(written)} distinct filter UUIDs.** '
     f"Implemented in engine: {sum(1 for w in written if w[3].startswith('✅'))}. "
     f"Not yet implemented: {sum(1 for w in written if w[3].startswith('❌'))}.",'',
     '| Filter | PAE class | Files | Instances | Params | Status |',
     '|---|---|---|---|---|---|']
for nm,u,agg,status in written:
    pae=agg.pae.most_common(1)[0][0] if agg.pae else (uuid_pae.get(u,'—'))
    idx.append(f'| [{nm}]({slug(nm)}.md) | {pae} | {agg.files} | {agg.instances} | {len(agg.params)} | {status.split()[0]} |')
open(os.path.join(OUT,'README.md'),'w').write('\n'.join(idx))
print(f'parsed={files_parsed} failed={files_failed} filters={len(written)}')
print(f'implemented={sum(1 for w in written if w[3].startswith("✅"))}')
print(f'wrote {OUT}')
