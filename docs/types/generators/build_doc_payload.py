#!/usr/bin/env python3
"""Fuse corrected corpus data + repo ground-truth into a per-filter doc payload.
- Merge CJK-localized param rows into English canonicals (dictionary + drop unresolved CJK-only rows into a 'localizedOnly' note).
- Attach: PAE class, impl status, shader evidence file, engine module.
Writes doc_payload.json consumed by the human-authored doc generator."""
import json, os, re, glob
DATA=json.load(open(os.path.expanduser('~/motr-collection/filter_data.json')))
REPO=os.path.expanduser('~/random/final-cut-pro-transitions')

CJK={'数量':'Amount','水平':'Horizontal','垂直':'Vertical','混合':'Mix','裁剪':'Crop','翻转':'Flip',
 '输入点':'Input Points','中心':'Center','角度':'Angle','半径':'Radius','缩放':'Scale','强度':'Intensity',
 '不透明度':'Opacity','颜色':'Color','大小':'Size','比例':'Scale','360° 识别':'360° Aware','发布 OSC':'Publish OSC',
 '色相':'Hue','饱和度':'Saturation','灰度系数':'Gamma','曝光':'Exposure','随机种子':'Random Seed','渐变':'Gradient',
 '柔和度':'Softness','平滑':'Smoothness','颗粒':'Grain','胶卷':'Film','层':'Layer','深色':'Darken',
 '重复边缘':'Repeat Edges','剪辑到白色':'Clip to White','纠正 Alpha':'Correct Alpha','拉伸以适合':'Stretch to Fit',
 '将黑色重新映射到':'Remap Black To','将白色重新映射到':'Remap White To','光旋转':'Light Rotation',
 '仅亮度':'Luminance Only','垂直偏移':'Vertical Offset','水平偏移':'Horizontal Offset','震中':'Epicenter',
 '闪光大小':'Flash Size','闪光角度':'Flash Angle','高光亮度':'Highlight Brightness','扫描线亮度':'Scanline Brightness',
 '扫描线数量':'Scanline Count'}

# repo ground truth
impl={}  # uuid -> engine module basename
for f in glob.glob(os.path.join(REPO,'engine/src/compositor/filters/*.ts')):
    txt=open(f).read()
    for m in re.finditer(r"uuid:\s*['\"]([0-9A-Fa-f-]{36})['\"]", txt):
        impl[m.group(1).upper()]=os.path.basename(f)
# UUID->PAE from FILTER_UNIVERSE
uuid_pae={}
fu=os.path.join(REPO,'docs/FILTER_UNIVERSE.md')
if os.path.exists(fu):
    for m in re.finditer(r'(PAE[A-Za-z0-9]+)\s*\|\s*([0-9A-Fa-f-]{36})', open(fu).read()):
        uuid_pae[m.group(2).upper()]=m.group(1)
# shader evidence available
shaders=set(os.path.splitext(x)[0] for x in os.listdir(os.path.join(REPO,'engine/src/compositor/filters/evidence/shaders')) if x.endswith('.metal'))

def merge_localized(params):
    out={}; localized_only=[]
    for nm,p in params.items():
        canon=CJK.get(nm)
        key=canon if canon else nm
        if any(ord(c)>0x2e00 for c in nm) and not canon:
            localized_only.append(nm); continue  # drop unresolved CJK-only, note count
        if key in out:
            # merge counts/ranges into existing English canonical
            e=out[key]
            e['seen']+=p['seen']; e['keyframed']+=p['keyframed']
            if p['min'] is not None: e['min']=p['min'] if e['min'] is None else min(e['min'],p['min'])
            if p['max'] is not None: e['max']=p['max'] if e['max'] is None else max(e['max'],p['max'])
            e['fractional']=e['fractional'] or p['fractional']
        else:
            out[key]=dict(p)
    return out, len(localized_only)

payload={}
for u,v in DATA['filters'].items():
    merged, loc_dropped = merge_localized(v['params'])
    pae = v['pae'] or uuid_pae.get(u)
    # guess shader by PAE name (HgcX) or display name
    shader=None
    for cand in [pae and ('Hgc'+pae.replace('PAE','')), v['display_names'] and ('Hgc'+re.sub(r'[^A-Za-z]','',v['display_names'][0][0]))]:
        if cand and cand in shaders: shader=cand; break
    real={k:x for k,x in merged.items() if not x['plumbing']}
    plumb=[k for k,x in merged.items() if x['plumbing']]
    payload[u]={
        'uuid':u,'pae':pae,
        'display_names':v['display_names'],'files':v['files'],'instances':v['instances'],
        'implemented':u in impl,'engine_module':impl.get(u),
        'shader':shader,'localized_rows_dropped':loc_dropped,
        'real_params':real,'plumbing_params':plumb,
    }
json.dump({'meta':DATA['meta'],'filters':payload}, open(os.path.expanduser('~/motr-collection/doc_payload.json'),'w'), indent=1)
print('filters:',len(payload),'implemented:',sum(1 for x in payload.values() if x['implemented']),
      'with shader evidence:',sum(1 for x in payload.values() if x['shader']))
