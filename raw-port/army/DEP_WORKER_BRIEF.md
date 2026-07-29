# DEP WORKER — port ONE ready unit from the strict dependency queue

You are handed a function (or a small cycle) whose EVERY in-scope callee is ALREADY PORTED. This is
the whole point of the dependency queue: there is NO unresolved internal dependency, so you have NO
excuse to write a throw for one. If your disasm shows a call to another FCP function, that function
is already ported — you IMPORT it and CALL it. A throw-stub for an in-scope callee is a REJECTED cheat.

## Claim
    cd <repo> && python3 raw-port/army/tools/depclaim.py next
Prints `CLAIMED_UNIT` then one or more TSV rows `<FW>\t<Class>\t<mangled>\t<demangled>`. Usually ONE
function. If MULTIPLE rows, it's a dependency CYCLE (mutual recursion) — port them together in one
branch (they call each other; neither can be done alone).

## The only legitimate throw
A throw is allowed ONLY for a TRUE OUT-OF-SCOPE extern — libc (`operator new`/`delete`,
`_Unwind_Resume`), ObjC runtime (`_objc_*`), CoreFoundation/Foundation, pthread, Metal/CoreVideo/
CoreGraphics/AVFoundation. These are outside the 5-framework port scope and are modelled as boundary
stubs by policy (like the CGColorSpace externs already in-tree). Each such throw cites its @0xADDR.
  - An in-scope callee (any `__ZN...` that is in ProCore/ProChannel/Helium/Ozone/Flexo and thus in a
    ledger) is NOT allowed to be a throw. `depclaim` only gave you this function because every one of
    those is already ported. Run `python3 raw-port/army/tools/depgraph.py deps <mangled>` to see them
    all with status `ported` — import and call them.
  - Indirect/virtual calls (`callq *off(reg)`): you will NOT be handed a function that still has
    unresolved indirect calls (those are held in the `virtual-blocked` tier until tools/vtable.py
    pins the slot to a concrete method, which then becomes a normal dependency). If your disasm has
    one anyway, `depclaim.py fail <sym> "indirect unresolved"` — do not stub it.

## Port
1. `python3 raw-port/army/tools/depgraph.py deps <mangled>` — confirm every dep is `ported`.
2. `bash raw-port/tools/disasm.sh --sym <mangled> <FW>` — get the exact body.
3. `bash raw-port/army/tools/wt_setup.sh <Class>`; commit fast after first edit.
4. Write the REAL body into raw-port/src/<layer>/<Class>.ts (edit tool). Import the ported callees
   from their real files and CALL them. Transcribe every instruction; @0xADDR on the fn + each const.
5. `bash raw-port/army/gate/gate.sh raw-port/src/<layer>/<Class>.ts` MUST print GATE: PASS. G5
   re-derives your disasm and REJECTS a throw where the machine does real work.
6. `bash raw-port/army/tools/wt_merge.sh <Class>` (reviewer sign-off gates the merge — REVIEWER_BRIEF.md).
7. `python3 raw-port/army/tools/mark_ported.py` then `python3 raw-port/army/tools/depclaim.py done <mangled>`.
   Marking it ported UNLOCKS its callers as new ready units — the wavefront advances.

Do 4-8 units, then STOP. Report per unit: FW, class, mangled, addr, deps (proof they were ported),
commit/merge hashes, GATE result.
