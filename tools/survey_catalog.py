#!/usr/bin/env python3
"""
Regenerate the .motr implementation catalog data (factories, filters by UUID,
parameter vocabulary, per-transition feature matrix). Prints to stdout; the
curated writeup lives in docs/CATALOG.md.

Usage: ./venv/bin/python tools/survey_catalog.py
"""
import os, re, glob, collections
TR = os.path.expanduser("~/random/motion-renderer/examples/PETemplates.localized/Transitions.localized")
motrs = sorted(glob.glob(TR + "/**/*.motr", recursive=True))

fac = collections.Counter()
uuid2names = collections.defaultdict(set)
params = collections.Counter()
FEATURES = [
    ('Replicator', r'description>Replicator<'), ('SeqRepl', r'description>Sequence Replicator<'),
    ('Shape', r'description>Shape<'), ('ImageMask', r'description>Image Mask<'),
    ('Camera', r'description>Camera<'), ('Emitter', r'description>Emitter<'),
    ('Clone', r'description>Clone Layer<'), ('Link', r'description>Link<'),
    ('Gradient', r'description>Gradient<'), ('Rig', r'description>Rig<'),
    ('Ramp', r'description>Ramp<'), ('Fade', r'description>Fade In/Fade Out<'),
    ('Oscillate', r'description>Oscillate<'), ('Spin', r'description>Spin<'),
    ('MotionPath', r'description>Motion Path<'), ('AlignTo', r'description>Align To<'),
    ('Gravity', r'description>Gravity<'), ('360Reorient', r'360° Reorient'),
]
matrix = []
for m in motrs:
    txt = open(m, encoding='utf-8', errors='ignore').read()
    for d in re.findall(r'<description>([^<]+)</description>', txt):
        fac[d] += 1
    for uu, nm in re.findall(r'pluginUUID="([^"]+)"[^>]*pluginName="([^"]+)"', txt):
        uuid2names[uu].add(nm)
    for p in re.findall(r'<parameter name="([^"]+)"', txt):
        params[p] += 1
    name = os.path.basename(os.path.dirname(m)).replace('.localized', '')
    cat = m[len(TR)+1:].split('/')[0].replace('.localized', '')
    feats = [f for f, pat in FEATURES if re.search(pat, txt)]
    matrix.append((cat, name, feats))

print(f"# {len(motrs)} transitions surveyed\n")
print("## Factory types (instances across all files)")
for d, c in fac.most_common():
    print(f"  {c:5d}  {d}")
print("\n## Filters by UUID")
for uu, names in sorted(uuid2names.items()):
    print(f"  {uu}  {' / '.join(sorted(names))}")
print("\n## Top 60 parameter names")
for p, c in params.most_common(60):
    print(f"  {c:5d}  {p}")
print("\n## Feature matrix")
for cat, name, feats in matrix:
    print(f"  {cat:<16}{name:<20}{','.join(feats)}")
