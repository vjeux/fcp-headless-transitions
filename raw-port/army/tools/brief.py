#!/usr/bin/env python3
"""brief.py <FW> <Class> — print the self-contained task prompt to spawn ONE port-agent."""
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
fw,cls=sys.argv[1],sys.argv[2]
led=json.load(open(os.path.join(ROOT,"army","ledger",f"{fw}.ledger.json")))
ms=led.get(cls) or sys.exit(f"no class {cls} in {fw}")
short=cls.split("::")[-1]
import re as _re
fname=_re.sub(r"[<>,: ]+","_",cls.split("::")[-1]).strip("_")  # template/namespace-safe filename
lst="\n".join(f"  {v['addr']:12} {v['demangled']}" for v in sorted(ms.values(),key=lambda x:x['addr']))
print(f"""TASK: faithfully transcribe FCP class {cls} ({fw}) to TypeScript — {len(ms)} methods.
Repo /Users/vjeux/random/final-cut-pro-transitions (work in raw-port/).
READ FIRST (mandatory): raw-port/army/PORTING_SPEC.md — cite @0xADDR on every fn, NEVER invent,
THROW on undecoded, Math.fround single-precision, one class per file. Violations rejected.
ISOLATE FIRST (no shared-tree collisions): run `bash raw-port/army/tools/wt_setup.sh {short}` — it makes an isolated git worktree+branch port/{short} at raw-port/army/worktrees/{short}. cd into THAT worktree and do ALL work there. Never edit/commit in the main checkout.
TARGET FILE: raw-port/src/<layer>/{fname}.ts  (layer = infra | channels | nodes | render).

METHODS:
{lst}

FOR EACH METHOD:
  1. raw-port/tools/disasm.sh {short} <method> {fw}
  2. python3 raw-port/army/tools/resolve.py {fw} <callee-addr>    (every callq / __stub / RIP const)
     python3 raw-port/army/tools/vtable.py {fw} <ClassOfThisPtr>   (every *0xNN(rax) vtable call)
  3. Transcribe to TS; doc-comment cites @0xADDR + each callee/const/vtable-slot by name+addr.
     Mirror asm control flow (each branch -> if/else). Un-ported callees -> a THROWing stub.
GATE (MANDATORY — a shortcut cannot land): before committing, run
   bash raw-port/army/gate/gate.sh <your changed .ts files>
   It must print "GATE: PASS". It enforces: provenance (@0xADDR cited, no invented magic numbers, no
   shortcut language/code), tsc clean, AND the ORACLE — your ported pure-math fn
   is fuzzed against the REAL FCP symbol via dlsym and must match bit-for-bit. You cannot fake that;
   the only way to pass is a correct transcription. If your class maps to a parity node, add it to
   raw-port/army/gate/oracle_map.json so the oracle covers it.
COMMIT to YOUR branch inside YOUR worktree ("raw-port: transcribe {cls} @<addrs>") citing addrs + the gate result. Do NOT push to main and do NOT touch the main checkout. Then run `bash raw-port/army/tools/wt_merge.sh {short}` — the serialized merge queue re-gates your branch and fast-forwards it into main (rejecting it if the gate fails). Report: completed addresses, gate result, and any new frontier callee classes you hit.""")
