#!/usr/bin/env python3
"""dup_check.py v2 — detect DUP-LEDGER branches, INCLUDING cross-file dups (a symbol re-ported under a
DIFFERENT filename). Closes "faithfulness != new port".

A branch is a DUP if NONE of the MANGLED C++ symbols it introduces are genuinely new to
origin/main -- every symbol it "adds" already exists somewhere on main, possibly under another file.

WHY v2 (reviewer-150 gap, 2026-08-09): v1 compared per-file symbols and returned NEW (exit 0) for
ANY whole-new file, so a dup under a new filename slipped through -- e.g. a branch adds
anon_multiply_3x3.ts re-porting __ZN12_GLOBAL__N_18multiplyEPKdS1_Pd, ALREADY landed as
procore_anon_multiply_3x3.ts. reviewer-150 caught 3 such dups by hand that v1 (exit 0) passed.

v2: collect every MANGLED symbol the branch introduces (new-file symbols + new-vs-main symbols in
existing files). For each, ask git whether it ALREADY exists ANYWHERE in origin/main's raw-port/src.
If ALL introduced mangled symbols already exist on main => DUP (exit 5). If >=1 is genuinely absent
=> NEW (exit 0). A branch introducing NO new mangled symbol at all is a DUP (a port's unit of
work is a cited @0xADDR mangled symbol).

Usage: dup_check.py <mainRef> <branchRef> <path> [<path> ...]
  exit 0 = >=1 introduced mangled symbol is genuinely new to main  -> real port, mergeable
  exit 5 = DUP (every introduced mangled symbol already exists on main, maybe under another file)
  exit 1 = usage error

v3 (2026-08-10) -- STOP CONDEMNING REAL PORTS. A false DUP destroys transcription work: #108, #110
and #197 each carried an "already on main" status and were one click from being closed. Two
reviewers flagged it and DISAGREED about #197 -- one closed it as a true dup, the other called it a
false positive. When two careful reviewers read the same evidence oppositely, it is not evidence.

Root cause, reproduced on #110: v2 harvested `__Z*` TOKENS from file TEXT and treated "introduced 0
new mangled symbols" as proof of duplication. OZPasteEntry does not exist on main in ANY form, yet
it was condemned -- the file cites its methods only by @0xADDR and so contains ZERO mangled tokens.
Where files do cite `__Z*` names, the tokens are often just libc++ externs (__Znwm, __ZdlPv) which
trivially "already exist".

The asymmetry that drives v3: a MISSED dup is cheap (a reviewer notices; dedup is cleanup), a FALSE
dup destroys work. So v3 biases hard toward NEW:
  * compiler/libc++ runtime externs excluded -- never a unit of porting work;
  * "no units found" is DUP-INCONCLUSIVE (exit 0), never DUP;
  * v2's cross-file dup detection is preserved intact for files that cite mangled names (the norm).
"""
import sys, re, subprocess

MANGLED = re.compile(r'__Z[A-Za-z0-9_$.]+')

# Compiler / libc++ / libc++abi runtime symbols. They appear in almost every ported file as
# out-of-scope externs, are never a unit of porting work, and always "already exist on main" --
# which is exactly how they manufactured false DUP verdicts.
# Use the FULL operator discriminator, not a 2-char prefix. "__Zn"/"__Zd" also swallow every free
# operator whose mangling starts with those letters — __Zdv (operator/), __Zng (unary minus),
# __Zne (operator!=) — which are REAL port targets, not runtime externs. reviewer-01 counted 15 such
# exported symbols in ProCore alone, including all four CMTime::operator/ overloads (issue #254).
EXTERN_PREFIXES = (
    "__Znw", "__Zna",   # operator new / new[]
    "__Zdl", "__Zda",   # operator delete / delete[]
    "__ZSt", "__ZNSt", "__ZNKSt",   # std::
    "__ZTI", "__ZTS", "__ZTV",      # typeinfo / typeinfo-name / vtable
    "__ZGV",     # guard variables
)

def _is_degenerate(sym):
    """Too short to be a real Itanium symbol. A bare `__ZL` token was being 'found' on main and
    counted as a duplicate of everything."""
    return len(sym) < 8


def _is_extern(sym):
    return sym.startswith(EXTERN_PREFIXES) or "__cxa" in sym or "__cxxabi" in sym

def _show(ref, path):
    r = subprocess.run(["git","show",f"{ref}:{path}"], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None

def _mangled(text):
    if text is None: return set()
    return {m[:-2] if m.endswith(".s") else m for m in MANGLED.findall(text)}

def _exists_on_main(main_ref, sym):
    """Is `sym` genuinely IMPLEMENTED on main — not merely mentioned in a comment?

    v3 still used a plain text grep, so a symbol named in a PROVENANCE COMMENT counted as "already
    landed". That is not an edge case: every ported file cites sibling mangled names in its
    documentation. It produced real false DUP verdicts on work that exists nowhere on main —
    #180 (HGFreeAlign: main's only match is a `//   raw-port/re/disasm/__ZL11HGFreeAlignPv.s` line
    inside HGAllocAlign.ts) and #197 (matched a sibling's evidence comment). Two reviewers
    independently warned that closing those as dups would have destroyed real work.

    So: look for the symbol OUTSIDE comments. Block comments are handled crudely but
    conservatively — when in doubt we treat a mention as a comment, biasing toward NEW, because a
    missed dup is cheap cleanup while a false dup destroys a real port.
    """
    r = subprocess.run(["git","grep","-l","--fixed-strings",sym,main_ref,"--","raw-port/src"],
                       capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.strip():
        return False
    for path in r.stdout.split():
        path = path.split(":", 1)[-1]
        txt = _show(main_ref, path)
        if txt is None: continue
        in_block = False
        for line in txt.splitlines():
            st = line.strip()
            if in_block:
                if "*/" in st:
                    in_block = False; st = st.split("*/", 1)[1]
                else:
                    continue
            if st.startswith("//") or st.startswith("*"):
                continue
            if "/*" in st and "*/" not in st:
                in_block = True; st = st.split("/*", 1)[0]
            if sym in st.split("//", 1)[0]:
                return True      # a real code reference: genuinely on main
    return False

def main(argv):
    if len(argv) < 3:
        print("usage: dup_check.py <mainRef> <branchRef> <path> [...]", file=sys.stderr); return 1
    main_ref, br_ref, paths = argv[0], argv[1], argv[2:]
    introduced = set()
    for path in paths:
        b = _mangled(_show(br_ref, path))
        m = _mangled(_show(main_ref, path))   # empty set if file absent on main (new file)
        introduced |= (b - m)
    # Runtime externs are not units of work; counting them is what made libc++ noise look like
    # "everything here already exists on main".
    introduced = {s for s in introduced if not _is_extern(s) and not _is_degenerate(s)}
    if not introduced:
        # v2 called this a DUP. It is not: it means the file cites its methods by @0xADDR only,
        # which is common and legal -- #110's OZPasteEntry does not exist on main in any form and
        # was condemned by this branch of the logic. Absence of a mangled citation is absence of
        # evidence, so say so and let the reviewer decide.
        print(f"  DUP-INCONCLUSIVE: branch {br_ref} cites no mangled port symbols in its changed "
              f"files (address-only provenance).")
        print("  -> cannot determine duplication mechanically. NOT treated as a dup; the reviewer")
        print("     must confirm the class exists on main before closing anything.")
        return 0
    genuinely_new = [s for s in sorted(introduced) if not _exists_on_main(main_ref, s)]
    if genuinely_new:
        return 0
    print(f"  DUP-LEDGER: branch {br_ref} introduces {len(introduced)} mangled symbol(s), but ALL "
          f"already exist on {main_ref} (cross-file re-port):")
    for s in sorted(introduced)[:8]:
        print(f"      DUP  {s}")
    print("  -> already-landed symbols re-ported (possibly under a new filename). Not a new port.")
    return 5

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
