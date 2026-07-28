#!/usr/bin/env python3
"""
coordinator_scan.py — one-shot health + work-planning snapshot for the raw-port swarm.
Prints a report the refill cron uses to decide what to spawn (pool fill + systemic unlocks).
"""
import os, re, subprocess, glob
from collections import Counter

REPO = "/Users/vjeux/random/final-cut-pro-transitions"
SRC  = os.path.join(REPO, "raw-port", "src")

def sh(cmd):
    try:
        return subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=25).stdout.strip()
    except Exception:
        return ""

load1 = (sh("uptime | sed 's/.*averages: //' | awk '{print $1}'") or "0").rstrip(",")
freegb = sh("df -g /System/Volumes/Data | tail -1 | awk '{print $4}'") or "0"
ported = sh(f"find {SRC} -name '*.ts' | wc -l").strip() or "0"
sh(f"cd {REPO} && git checkout -- raw-port/army/ledger/shaders.ledger.json 2>/dev/null")
stats = sh(f"cd {REPO} && timeout 20 python3 raw-port/army/tools/claim.py stats 2>&1 | head -1")

ts_files = glob.glob(os.path.join(SRC, "**", "*.ts"), recursive=True)
ported_classes = {os.path.splitext(os.path.basename(f))[0] for f in ts_files}

CAND = re.compile(r'\b(HGNode::ClearBits|PCMatrix44Tmpl|PCGenVector|PCGenBlockRef|'
                  r'__emplace_back_slow_path|HGTile|HGProgramDescriptor|HGBinding|'
                  r'HGHandler|HGRenderer|OZChannelImpl|OZCurve::OZCurve|'
                  r'PCSerializerReadStream|PCSerializerWriteStream|OZBehaviorCurveNode|'
                  r'HGTransform|HGTransformUtils|OZCompoundChannel|'
                  r'PCEvaluator|PCSingleton|HGGPURenderer|LiMaterial)\b')

fc = Counter()
for f in ts_files:
    base = os.path.splitext(os.path.basename(f))[0]
    try:
        txt = open(f, encoding="utf-8", errors="ignore").read()
    except Exception:
        continue
    for h in set(CAND.findall(txt)):
        cls = h.split("::")[0]
        if base == cls or base == h.replace("::", "_"):
            continue
        fc[h] += 1

def is_unported(cand):
    if "::" in cand:
        cls, meth = cand.split("::", 1)
        matches = glob.glob(os.path.join(SRC, "**", f"{cls}.ts"), recursive=True)
        if not matches:
            return True
        for m in matches:
            t = open(m, encoding="utf-8", errors="ignore").read()
            for line in t.splitlines():
                if re.search(rf'\b{re.escape(meth)}\s*\(', line) and "throw" not in line and "not yet" not in line:
                    return False
        return True
    return cand not in ported_classes

cands = [(c, n) for c, n in fc.most_common() if n >= 4 and is_unported(c)]

print(f"LOAD1={load1}")
print(f"FREEGB={freegb}")
print(f"PORTED_TS={ported}")
print(f"CLAIM_STATS={stats}")
print("UNLOCK_CANDIDATES:")
if cands:
    for c, n in cands[:8]:
        print(f"  {c}\tstubbed_in={n}\tlabel=unlock-{c.replace('::','-')}")
else:
    print("  (none >=4 stubs unported)")
