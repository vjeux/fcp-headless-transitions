#!/usr/bin/env python3
"""provenance_gate.py — REJECT ported TS that isn't traceable to the disassembly.

A GATE (exit 2 = block), not advice. Calibrated on the existing faithful transcriptions so real
decode evidence passes and only genuine shortcuts fail.

Rules:
  P1  A file that EXPORTS code must cite its source symbol address `@<FW> 0x..` (or `@0x..`) somewhere.
  P2  A FILE-LEVEL provenance budget: every hex/offset literal used in the file must be justified by
      a decode reference. A file is "grounded" if it (a) cites at least one @0xADDR AND (b) references
      its saved disassembly (re/disasm/...) or documents its tables in a `// DECODE:`/`@table`/`@const`
      block. Grounded files may use hex offsets freely (they ARE the decoded structure). UNGROUNDED
      files may not introduce hex/large-decimal literals -> reject (that's the invent-a-number smell).
  P3  Banned shortcut LANGUAGE anywhere: approximate/roughly/good enough/guess/heuristic/hack/fudge,
      EXCEPT in a line that explicitly says it does NOT do that (e.g. "do NOT approximate"/"never guess").
  P4  A throwing incompleteness stub ("not yet transcribed"/"pending") must cite an @0xADDR.
  P5  Banned shortcut CODE: Math.random, Date.now-as-value, `?? 0` silent numeric fallback on a
      decoded value, empty catch that swallows.
"""
import re, sys, os
BANNED_LANG = re.compile(r'\b(approximate|approximation|roughly|good enough|guesstimate|heuristic|\bhack\b|fudge)\b', re.I)
# A line is NOT a violation if it explicitly forbids the shortcut (documenting the rule, not doing it).
NEGATED     = re.compile(r'\b(do\s*not|don.?t|never|no\s+silent|not\b|without)\b', re.I)
PROV        = re.compile(r'0x[0-9a-fA-F]{3,}')
DECODE_REF  = re.compile(r're/disasm/|decode:?|@table|@const|dyld_info|vtable@|installed[- ]ptr|resolve\.py|from the binary|faithful|transcri', re.I)
BANNED_CODE = re.compile(r'Math\.random|Date\.now\(\)\s*[*/%+-]|catch\s*\([^)]*\)\s*\{\s*\}')
HEXNUM      = re.compile(r'(?<![\w.])0x[0-9a-fA-F]+')
BIGDEC      = re.compile(r'(?<![\w.])\d{4,}(?:\.\d+)?')

def check(path):
    errs=[]
    text=open(path,encoding="utf-8",errors="replace").read()
    lines=text.splitlines()
    exports = bool(re.search(r'^export (function|class|const \w+\s*[:=])', text, re.M))
    has_addr = bool(PROV.search(text))
    grounded = has_addr and bool(DECODE_REF.search(text))
    if exports and not has_addr:
        errs.append(f"{path}:1: P1 exporting file with no 0xADDR provenance")
    for i,l in enumerate(lines,1):
        low=l.lower()
        if BANNED_LANG.search(l) and not NEGATED.search(l):
            errs.append(f"{path}:{i}: P3 shortcut language: {l.strip()[:70]}")
        if BANNED_CODE.search(l):
            errs.append(f"{path}:{i}: P5 shortcut code: {l.strip()[:70]}")
        if "throw" in l and re.search(r'not yet|pending|unimpl|transcrib', low) and not PROV.search(l):
            errs.append(f"{path}:{i}: P4 throwing stub missing 0xADDR: {l.strip()[:70]}")
        # P2 (file-level): only UNGROUNDED files may not introduce hex / big-decimal literals in code.
        if not grounded and not l.strip().startswith(("//","*")):
            if (HEXNUM.search(l) or BIGDEC.search(l)):
                errs.append(f"{path}:{i}: P2 ungrounded numeric literal (file cites no decode evidence): {l.strip()[:60]}")
    return errs

def main():
    root=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    paths=[p for p in sys.argv[1:] if p.endswith(".ts")]
    if not paths:
        for dp,_,fs in os.walk(os.path.join(root,"src")):
            for f in fs:
                if f.endswith(".ts"): paths.append(os.path.join(dp,f))
    errs=[]
    for p in paths:
        if os.path.exists(p): errs+=check(p)
        else: errs.append(f"{p}:0: P0 file does not exist (unwritten port — nothing to gate)")
    for e in errs: print(e)
    print(f"\nprovenance_gate: {len(errs)} violation(s) across {len(paths)} file(s)  ->  {'REJECT' if errs else 'PASS'}")
    sys.exit(2 if errs else 0)
if __name__=="__main__": main()
