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

The queue is APPEND-ONLY: the instant `next` hands you a unit it is recorded as claimed forever and
will NEVER be handed to anyone else — so you can never collide with another worker, and you never
need to release, defer, or mark-done a claim. If you cannot complete a claimed unit, just STOP and
claim the next one; the abandoned unit is simply skipped (a coordinator can `depclaim.py reopen
<sym>` in the rare case it must be retried). libc++ template instantiations (`std::__1::…`) and
already-built symbols are filtered out automatically — every unit you get is real, fresh FCP work.

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
    one anyway, just STOP on that unit and claim the next — do not stub it (the queue won't re-hand it).

## Port
1. `python3 raw-port/army/tools/depgraph.py deps <mangled>` — confirm every dep is `ported`.
2. `bash raw-port/tools/disasm.sh --sym <mangled> <FW>` — get the exact body.
3. `bash raw-port/army/tools/wt_setup.sh <Class>`; commit fast after first edit.
4. Write the REAL body into raw-port/src/<layer>/<Class>.ts (edit tool). Import the ported callees
   from their real files and CALL them. Transcribe every instruction; @0xADDR on the fn + each const.
5. `bash raw-port/army/gate/gate.sh raw-port/src/<layer>/<Class>.ts` MUST print GATE: PASS. G5
   re-derives your disasm and REJECTS a throw where the machine does real work.
6. `bash raw-port/army/tools/wt_merge.sh <Class>` (reviewer sign-off gates the merge — REVIEWER_BRIEF.md).
7. `python3 raw-port/army/tools/mark_ported.py` — flips your merged symbol to `ported`, which
   UNLOCKS its callers as new ready units (the wavefront advances). No `depclaim.py done` needed:
   the claim was already recorded permanently at dispatch. `mark_ported` is what the queue reads
   for dependency-readiness, so run it after your merge lands.

Do 4-8 units, then STOP. Report per unit: FW, class, mangled, addr, deps (proof they were ported),
commit/merge hashes, GATE result.
