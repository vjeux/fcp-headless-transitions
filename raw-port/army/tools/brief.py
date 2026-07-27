#!/usr/bin/env python3
"""brief.py <FW> <Class> — print the self-contained task prompt to spawn ONE port-agent."""
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
fw,cls=sys.argv[1],sys.argv[2]
led=json.load(open(os.path.join(ROOT,"army","ledger",f"{fw}.ledger.json")))
ms=led.get(cls) or sys.exit(f"no class {cls} in {fw}")
short=cls.split("::")[-1]
lst="\n".join(f"  {v['addr']:12} {v['demangled']}" for v in sorted(ms.values(),key=lambda x:x['addr']))
print(f"""TASK: faithfully transcribe FCP class {cls} ({fw}) to TypeScript — {len(ms)} methods.
Repo /Users/vjeux/random/final-cut-pro-transitions (work in raw-port/).
READ FIRST (mandatory): raw-port/army/PORTING_SPEC.md — cite @0xADDR on every fn, NEVER invent,
THROW on undecoded, Math.fround single-precision, one class per file. Violations rejected.
CLAIM before editing: write raw-port/army/claims/{fw}.{cls.replace('::','_')}.claim (agent id + UTC).
TARGET FILE: raw-port/src/<layer>/{short}.ts  (layer = infra | channels | nodes | render).

METHODS:
{lst}

FOR EACH METHOD:
  1. raw-port/tools/disasm.sh {short} <method> {fw}
  2. python3 raw-port/army/tools/resolve.py {fw} <callee-addr>    (every callq / __stub / RIP const)
     python3 raw-port/army/tools/vtable.py {fw} <ClassOfThisPtr>   (every *0xNN(rax) vtable call)
  3. Transcribe to TS; doc-comment cites @0xADDR + each callee/const/vtable-slot by name+addr.
     Mirror asm control flow (each branch -> if/else). Un-ported callees -> a THROWing stub.
VERIFY: engine/node_modules/.bin/tsc --noEmit -p raw-port/tsconfig.json clean;
        cd raw-port && node_modules/.bin/tsx test/parse_all.ts -> 65/65 OK; micro-check pure math.
COMMIT+PUSH one class per commit ("raw-port: transcribe {cls} @<addrs>") citing addrs + verification.
Delete your claim file. Report completed addresses + any new frontier callees you hit.""")
