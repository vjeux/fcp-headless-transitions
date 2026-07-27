#!/usr/bin/env python3
"""Generate raw-port/src/infra/scopes.ts from re/scopes.json — the per-scope attrId<->name schema."""
import json
scopes=json.load(open("raw-port/re/scopes.json"))
lines=["// AUTO-GENERATED from re/scopes.json by tools/gen_scopes_ts.py — DO NOT EDIT BY HAND.",
       "// Per-scope attribute-id -> XML-attribute-name tables, decoded from Ozone's PCScope",
       "// descriptor arrays (__DATA __data). Each scenenode class's parseElement reads attributes",
       "// by integer id within its own scope; this maps those ids back to the real XML names.",
       "",
       "export type ScopeTable = Record<number, string>;",
       "export const SCOPES: Record<string, ScopeTable> = {"]
for sc in sorted(scopes):
    entries=", ".join(f"{k}: {json.dumps(v)}" for k,v in sorted(scopes[sc].items(), key=lambda kv:int(kv[0],16)))
    lines.append(f"  {json.dumps(sc)}: {{ {entries} }},")
lines.append("};")
lines.append("")
lines.append("/** Look up an attribute name by (scope, id). */")
lines.append("export function attrName(scope: string, id: number): string | undefined {")
lines.append("  return SCOPES[scope]?.[id];")
lines.append("}")
open("raw-port/src/infra/scopes.ts","w").write("\n".join(lines)+"\n")
print("wrote raw-port/src/infra/scopes.ts  (",len(scopes),"scopes )")
