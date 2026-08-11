#!/usr/bin/env python3
"""check_duplicate_classes.py — CI guard: reject two .ts files with the same class basename across
layers (violates 'one C++ class = one .ts'). Prepared offline 2026-07-28 (found OZScene split-brain).
Exit 2 if any duplicate. Run in gate.sh / pre-commit."""
import glob,os,collections,sys,re

def _norm(b):
    """Normalize a class basename so NAMING-CONVENTION variants of the SAME C++ class collide.

    Comparing raw basenames only caught identical names in different directories. It could not see
    the nested-class separator split, so BOTH of these landed on main for the same class:

        OZOpticalFlow_Private_CacheFileHeader.ts      (single underscore)
        OZOpticalFlow__Private__CacheFileHeader.ts    (double underscore, the landed convention)

    Two files modelling one C++ class means two struct layouts that can silently DRIFT — and here
    they already had: the pair shares 16 addresses and each holds addresses the other lacks. The
    landed convention is Outer__Inner (see PCBezierNamespace__SampledContour.ts); this collapses
    runs of underscores so the variant cannot slip past, whichever spelling is used.
    """
    b = re.sub(r'_+', '_', b)      # Outer__Inner__Leaf == Outer_Inner_Leaf
    return b.lower()

paths=collections.defaultdict(list)
for p in glob.glob('raw-port/src/**/*.ts',recursive=True):
    b=os.path.basename(p)[:-3]
    if b.endswith('_stub') or '.vtable' in b: continue   # explicit stub/vtable side-files are allowed
    paths[_norm(b)].append(os.path.relpath(p))
dups={k:v for k,v in paths.items() if len(v)>1}
for k,v in sorted(dups.items()):
    print(f"DUPLICATE class '{k}': {v}")
    if len({os.path.basename(x) for x in v}) > 1:
        print("    ^ same class under DIFFERENT naming conventions — the landed convention is")
        print("      Outer__Inner (double underscore). Merge them; do not delete blindly, each copy")
        print("      may hold addresses the other lacks.")
print(f"\ncheck_duplicate_classes: {len(dups)} duplicate(s) -> {'REJECT' if dups else 'PASS'}")
sys.exit(2 if dups else 0)
