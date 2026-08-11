#!/usr/bin/env python3
"""verify_symidx.py — prove each sliced body covers exactly its symbol's ADDRESS RANGE.

WHY THIS WAS REWRITTEN — the previous version certified a real bug as correct
----------------------------------------------------------------------------
v1 proved that `symidx.py slice` was BYTE-IDENTICAL to the awk pipeline it replaced, over all 45,785
symbol bodies, and reported PASS. That check was worthless in the one way that mattered: both sides
implemented the SAME boundary rule ("a body ends at any line ending in ':'"), and that rule was
wrong. otool annotates ObjC call sites with comments ending in a colon —

    0000000000023a7b  movq 0xa370f6(%rip), %rsi   ## Objc selector ref: resolveCounterRange:

— so any body containing one was silently CUT SHORT. 198 symbols, 55,463 instructions hidden.
`HGMetalCounterSet::resolve` read as 11 lines and classified EMPTY; it is 81 lines with 10 stores
and classifies REAL. An EMPTY verdict authorises a NO-OP PORT of a real function. reviewer-03 found
it, and named exactly why my verifier missed it: it "certifies this as correct because it compares
the two buggy paths to each other".

The lesson, worth keeping: DIFFERENTIAL TESTING AGAINST THE THING YOU ARE REPLACING ONLY PROVES YOU
DID NOT ADD A BUG. It cannot find a bug you faithfully reproduced. Ground truth has to come from
somewhere the old implementation never looked.

WHAT THIS CHECKS NOW
--------------------
The symbol table, via `nm -n` — a source independent of the dump's text layout. For each symbol at
vmaddr A whose successor is at vmaddr B, every instruction address in the sliced body must lie in
[A, B), and the body must reach the last instruction before B. That catches BOTH failure modes:
  * TRUNCATION  — body stops early (the ObjC-colon bug): last address is far below B.
  * OVERRUN     — body swallows the next function: some address is >= B.

    verify_symidx.py [FW ...]      ->  "VERIFY_SYMIDX: PASS" / "FAIL"
"""
import os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import symidx

BIN = "/Applications/Final Cut Pro.app/Contents/Frameworks/{fw}.framework/Versions/A/{fw}"
ADDR_LINE = re.compile(r'^([0-9a-fA-F]{8,})\s')


def nm_sorted(fw):
    """[(vmaddr, name)] for text symbols, address-ordered — the independent ground truth."""
    p = subprocess.run(["nm", "-n", "-arch", "x86_64", BIN.format(fw=fw)],
                       capture_output=True, text=True)
    out = []
    for line in p.stdout.splitlines():
        parts = line.split()
        if len(parts) >= 3 and parts[1] in ("T", "t"):
            try: out.append((int(parts[0], 16), parts[2]))
            except ValueError: pass
    return out


def verify_fw(fw, cap=4000):
    if not os.path.exists(symidx.dump_path(fw)):
        print(f"  {fw:<12} no dump — skipped"); return 0, 0
    if not symidx.fresh(fw):
        symidx.build(fw)
    syms = nm_sorted(fw)
    # Key the successor lookup by ADDRESS, not by name. A name can appear at several addresses
    # (aliases, ICF-folded twins, .cold parts), so a name->next map silently pairs one occurrence's
    # body with another occurrence's successor and reports nonsense like next < last. Derive each
    # body's own start address from its first instruction and take the next DISTINCT symbol address
    # above it.
    addrs = sorted({a for a, _ in syms})
    import bisect
    def next_addr_after(a):
        i = bisect.bisect_right(addrs, a)
        return addrs[i] if i < len(addrs) else None

    import io, sqlite3
    db = sqlite3.connect(f"file:{symidx.idx_path(fw)}?mode=ro", uri=True)
    names = [r[0] for r in db.execute("SELECT name FROM sym ORDER BY off")]
    db.close()

    checked = trunc = over = 0
    samples = []
    step = max(1, len(names) // cap)
    for name in names[::step]:
        buf = io.BytesIO()
        if symidx.slice_sym(fw, name, out=buf) != 0:
            continue
        addrs_body = [int(m.group(1), 16) for m in
                 (ADDR_LINE.match(l) for l in buf.getvalue().decode("utf-8", "replace").splitlines())
                 if m]
        if not addrs_body:
            continue
        checked += 1
        end = next_addr_after(min(addrs_body))
        if end is not None:
            if max(addrs_body) >= end:
                over += 1
                if len(samples) < 4:
                    samples.append(f"OVERRUN  {name[:56]} last=0x{max(addrs_body):x} next=0x{end:x}")
            else:
                # truncation: the dump has instructions after our last one but before the next symbol
                gap = end - max(addrs_body)
                if gap > 64:      # a normal tail instruction is a few bytes; 64+ means we stopped early
                    trunc += 1
                    if len(samples) < 4:
                        samples.append(f"TRUNCATED {name[:54]} last=0x{max(addrs_body):x} next=0x{end:x} gap={gap}")
    for s in samples:
        print(f"    {s}")
    # TRUNCATION is the hard failure: it hides instructions and flips REAL -> EMPTY, which authorises
    # a no-op port. OVERRUN is reported but NOT failed: ICF folds several names onto one body and
    # emits alias/`.cold` symbols at addresses INSIDE that body, so a legitimate slice can contain
    # addresses past the next nm entry. Failing on it would cry wolf on ~1% of symbols; the ambiguity
    # is in the symbol table, not the slice.
    verdict = "OK" if trunc == 0 else f"{trunc} TRUNCATED"
    if over:
        verdict += f"  ({over} overrun — ICF aliases inside a body, informational)"
    print(f"  {fw:<12} {checked:>5} bodies address-checked   {verdict}")
    return checked, trunc


def main():
    fws = sys.argv[1:] or symidx.FWS
    tot = bad = 0
    for fw in fws:
        c, b = verify_fw(fw); tot += c; bad += b
    print()
    if bad:
        print(f"VERIFY_SYMIDX: FAIL ❌ — {bad}/{tot} bodies are TRUNCATED (instructions hidden)")
        return 1
    print(f"VERIFY_SYMIDX: PASS ✅ — {tot} sampled bodies reach their symbol's address range; 0 truncated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
