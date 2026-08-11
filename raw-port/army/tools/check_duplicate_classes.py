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

# --new-only <BASE>: judge ONLY the duplicates this change INTRODUCES.
#
# WHY. This guard works and has never once been invoked: its own docstring and PORTING_SPEC call it a
# CI guard, but no gate, no pr_gate and no prove_all runs it — so it reported into the void while 7
# duplicates accumulated on main (5 classes filed twice across layer directories; OPS_LOG had
# recorded only one of them). Wiring the ABSOLUTE check in today would red-gate every PR in the repo
# for a mess none of them created, which is presumably why nobody ever wired it. So gate on the
# DELTA: a PR that adds no new duplicate passes even while main is dirty, and plain mode still
# reports the existing ones for someone to merge deliberately — never blindly, since each copy may
# hold addresses the other lacks.
NEW_ONLY = None
if "--new-only" in sys.argv:
    NEW_ONLY = sys.argv[sys.argv.index("--new-only") + 1]

def _dupes_at(ref):
    """{normalized class -> [paths]} for duplicates present at a git ref."""
    import subprocess
    out = subprocess.run(["git", "ls-tree", "-r", "--name-only", ref, "--", "raw-port/src"],
                         capture_output=True, text=True).stdout.split()
    m = collections.defaultdict(list)
    for q in out:
        if q.endswith(".ts"):
            b = os.path.basename(q)[:-3]
            if b.endswith('_stub') or '.vtable' in b: continue
            m[_norm(b)].append(q)
    return {k: v for k, v in m.items() if len(v) > 1}

paths=collections.defaultdict(list)
for p in glob.glob('raw-port/src/**/*.ts',recursive=True):
    b=os.path.basename(p)[:-3]
    if b.endswith('_stub') or '.vtable' in b: continue   # explicit stub/vtable side-files are allowed
    paths[_norm(b)].append(os.path.relpath(p))
dups={k:v for k,v in paths.items() if len(v)>1}
pre = _dupes_at(NEW_ONLY) if NEW_ONLY else {}
judged = {k: v for k, v in dups.items() if k not in pre} if NEW_ONLY else dups
for k,v in sorted(dups.items()):
    tag = "" if (not NEW_ONLY or k not in pre) else f"   [pre-existing at {NEW_ONLY} — not judged]"
    print(f"DUPLICATE class '{k}': {v}{tag}")
    if len({os.path.basename(x) for x in v}) > 1:
        print("    ^ same class under DIFFERENT naming conventions — the landed convention is")
        print("      Outer__Inner (double underscore). Merge them; do not delete blindly, each copy")
        print("      may hold addresses the other lacks.")
if NEW_ONLY:
    print(f"\ncheck_duplicate_classes: {len(dups)} duplicate(s) present, {len(judged)} NEW vs {NEW_ONLY}"
          f" -> {'REJECT' if judged else 'PASS'}")
else:
    print(f"\ncheck_duplicate_classes: {len(dups)} duplicate(s) -> {'REJECT' if dups else 'PASS'}")
sys.exit(2 if judged else 0)
