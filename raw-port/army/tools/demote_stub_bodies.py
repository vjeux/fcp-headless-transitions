#!/usr/bin/env python3
"""demote_stub_bodies.py — ensure the dependency traversal NEVER counts a throw-only body as done.

vjeux (2026-07-29): don't delete the throw-stubs, just make sure they're marked NOT done so their
callers stay blocked and they stay claimable. This sweeps every ledger `ported` (and `skeleton`)
entry, finds its actual committed TS method body (matched by class-file + leaf name, the reliable
census approach — NOT by citation address, which cites call-sites), and if that body is THROW-ONLY
(only a `throw new Error(...)` with an incompleteness phrase, no real work) demotes it to `stub`.

`stub` (not `todo`): the source still has the placeholder; it isn't un-started. depgraph/depclaim
treat anything != `ported` as unresolved, so a caller with a `stub` dependency stays dep-blocked and
the stub itself remains claimable. Idempotent; run after mark_ported. Prints a summary + writes the
demoted symbol set to army/ledger/STUB_BODY_DEMOTIONS.json for audit.

  demote_stub_bodies.py            dry-run: report how many ported/skeleton entries are throw-only
  demote_stub_bodies.py --apply    write status=stub for them in the ledgers
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
LED  = os.path.join(ROOT, "army", "ledger")
SRC  = os.path.join(ROOT, "src")
FWS  = ["ProCore", "ProChannel", "Helium", "Ozone", "Flexo"]

INCOMPLETE = re.compile(
    r'not yet (?:transcribed|ported|decoded|implemented|materialized|wired|transcri)'
    r'|not (?:transcribed|decoded)|pending transcription|deferred stub|un-?transcribed'
    r'|\bundecoded\b|\bunimplemented\b|\bunimpl\b|frontier callee|stub not', re.I)
# a call to a local throwing stub-shim also = no real work of this function's own
STUBCALL = re.compile(r'_stub\b|_not_transcribed\b|not_transcribed')
REALSTMT = re.compile(r'[+\-*/%&|^<>]|Math\.|fround|\breturn\b\s+\S|=\s|\bnew\b|\.[a-zA-Z]')

# index src by class-file basename
_srctext = {f: open(f, errors="replace").read() for f in glob.glob(os.path.join(SRC, "**", "*.ts"), recursive=True)}
_byname = {}
for f in _srctext:
    _byname.setdefault(os.path.basename(f)[:-3], []).append(f)

def _match_brace(text, i):
    depth = 0; n = len(text)
    while i < n:
        c = text[i]
        if c in '"\'`':
            q=c; i+=1
            while i<n and text[i]!=q:
                if text[i]=='\\': i+=1
                i+=1
        elif c=='/' and i+1<n and text[i+1]=='/':
            while i<n and text[i]!='\n': i+=1
        elif c=='/' and i+1<n and text[i+1]=='*':
            i+=2
            while i+1<n and not(text[i]=='*' and text[i+1]=='/'): i+=1
            i+=1
        elif c=='{': depth+=1
        elif c=='}':
            depth-=1
            if depth==0: return i+1
        i+=1
    return -1

def body_is_throwonly(cls, leaf):
    """Return True if the TS method (cls-file, leaf name) body is throw-only w/ incompleteness phrase.
    None if not found (ctor/dtor/inlined/name-mismatch — left as-is, conservative)."""
    files = _byname.get(cls) or _byname.get(cls.replace("::", "_")) or []
    pat = re.compile(r'(?:^|\s)' + re.escape(leaf) + r'\s*\([^;{)]*\)\s*(?::[^\{;]+)?\{')
    for f in files:
        t = _srctext[f]
        for m in pat.finditer(t):
            bi = t.find("{", m.end()-1)
            if bi < 0: continue
            end = _match_brace(t, bi)
            if end < 0: continue
            body = t[bi:end]
            if re.match(r'^\{\s*[a-zA-Z_]\w*\s*:', body.strip()): return None  # type-decl brace
            # strip comments
            b = re.sub(r'/\*.*?\*/', '', body, flags=re.S); b = re.sub(r'//[^\n]*', '', b)
            stmts = [s.strip() for s in re.split(r'[;\n]', b) if s.strip() and s.strip() not in "{}"]
            if not stmts: return None
            has_throw = any(s.startswith("throw") for s in stmts)
            if not has_throw: return False
            if not INCOMPLETE.search(body): return False   # ud2/runtime-guard throw -> keep
            real = 0
            for s in stmts:
                if s.startswith("throw"): continue
                if STUBCALL.search(s): continue
                if s.startswith(("void ", "return sret", "return;", "return this", "const ", "let ")) \
                   and not re.search(r'[+\-*/]|Math\.|\bnew\b', s): continue
                if REALSTMT.search(s): real += 1
            return real == 0
    return None

def main():
    apply = "--apply" in sys.argv
    demoted = []; checked = 0; notfound = 0
    for fw in FWS:
        lp = os.path.join(LED, f"{fw}.ledger.json")
        if not os.path.exists(lp): continue
        led = json.load(open(lp)); changed = False
        for cls, ms in led.items():
            if not isinstance(ms, dict): continue
            for k, v in ms.items():
                if not (isinstance(v, dict) and v.get("status") in ("ported", "skeleton")): continue
                dem = v.get("demangled", "")
                leaf = dem.split("(")[0].split("::")[-1].strip()
                if not re.match(r'^[A-Za-z_]\w*$', leaf): continue  # ctor/dtor/operator: skip name-match
                checked += 1
                to = body_is_throwonly(cls, leaf)
                if to is None: notfound += 1; continue
                if to:
                    demoted.append((fw, cls, v.get("addr"), dem[:55], v.get("status"), v.get("mangled")))
                    if apply and v.get("status") != "stub":
                        v["status"] = "stub"; changed = True
        if apply and changed:
            json.dump(led, open(lp, "w"))
    print(f"checked {checked} name-matchable ported/skeleton entries ({notfound} not name-matched, left as-is)")
    print(f"{'DEMOTED' if apply else 'DRY-RUN would demote'} {len(demoted)} throw-only bodies -> stub")
    json.dump([{"fw":d[0],"class":d[1],"addr":d[2],"demangled":d[3],"was":d[4],"mangled":d[5]} for d in demoted],
              open(os.path.join(LED, "STUB_BODY_DEMOTIONS.json"), "w"), indent=1)
    # DURABLE: record each throw-only body by MANGLED symbol in the override mark_ported always honors
    # (immune to short-address cross-file collisions — the PCDelaunay::insertSegment @0x56456 bug).
    if apply:
        ovp = os.path.join(LED, "CLASS_C_OVERRIDES.json")
        ov = json.load(open(ovp)) if os.path.exists(ovp) else {}
        for d in demoted:
            if d[5] and d[5] not in ov:
                ov[d[5]] = {"fw": d[0], "addr": d[2], "demangled": d[3],
                            "reason": "throw-only body (demote_stub_bodies); symbol-keyed"}
        json.dump(ov, open(ovp, "w"), indent=1)
        print(f"  recorded {len(demoted)} in CLASS_C_OVERRIDES.json (symbol-keyed, durable)")
    from collections import Counter
    byfw = Counter(d[0] for d in demoted)
    print(f"  by framework: {dict(byfw)}")
    for d in demoted[:12]: print(f"    {d[0]} {d[3]}")

if __name__ == "__main__":
    main()
