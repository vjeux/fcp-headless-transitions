#!/usr/bin/env python3
"""check_duplicate_classes.py — CI guard: reject two .ts files with the same class basename across
layers (violates 'one C++ class = one .ts'). Prepared offline 2026-07-28 (found OZScene split-brain).
Exit 2 if any duplicate. Run in gate.sh / pre-commit."""
import glob,os,collections,sys
paths=collections.defaultdict(list)
for p in glob.glob('raw-port/src/**/*.ts',recursive=True):
    b=os.path.basename(p)[:-3]
    if b.endswith('_stub') or '.vtable' in b: continue   # explicit stub/vtable side-files are allowed
    paths[b].append(os.path.relpath(p))
dups={k:v for k,v in paths.items() if len(v)>1}
for k,v in dups.items(): print(f"DUPLICATE class basename '{k}': {v}")
print(f"\ncheck_duplicate_classes: {len(dups)} duplicate(s) -> {'REJECT' if dups else 'PASS'}")
sys.exit(2 if dups else 0)
