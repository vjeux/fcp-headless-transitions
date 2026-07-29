# Leaf-Worker Brief — implement REAL function bodies (no throw-stubs for internal calls)

You are a raw-port LEAF worker on cli:vjeux-mac, repo /Users/vjeux/random/final-cut-pro-transitions.
Your ONE job: turn UNPORTED functions into REAL, faithful TypeScript bodies — not throw-stubs.

Read raw-port/army/PORTING_SPEC.md + raw-port/army/ANTI_SHORTCUT.md FIRST (esp. the x86 AT&T
compare/branch cheat-sheet under Rule 4).

## Why leaf-first
A function is only handed to you when EVERY same-framework function it calls is ALREADY ported
(real). So you can — and MUST — write the real body: call the real ported helpers (import them),
transcribe the arithmetic/control-flow, and throw-stub ONLY genuine boundary calls (other-framework
/ ObjC / libc externs, and virtual/vtable `callq *` dispatch that is resolved at runtime). If you
find yourself throw-stubbing a *same-framework named* callee, STOP — that means the dep wasn't ready
and you should `leafq.py fail` it, not stub it.

## Loop (do 3-6 functions, then STOP)
1. `python3 raw-port/army/tools/leafq.py next` → leases the smallest implementable function. Output:
   `<FW>\t<Class>\t<addr>\t<mangled>\t<demangled>` and the ready callees to import.
   (Or `leafq.py next <FW>` to pin a framework.)
2. `python3 raw-port/army/tools/leafq.py deps <FW> <mangled>` → shows each internal callee + its
   ported status + demangled name, so you know exactly what to import as a REAL call.
3. Disassemble the ONE function: `bash raw-port/tools/disasm.sh <Class> <method> <FW>` (or
   `disasm_class.sh <Class> <FW>` if you need siblings). resolve.py <FW> ripconst <instr> <disp> [len]
   for RIP-relative constants.
4. wt_setup.sh <Class>  (isolate). If the class file already exists on origin/main, ADD/REPLACE only
   THIS method's body — do not touch other methods.
5. Write the REAL body with the edit tool:
   - import the already-ported callees from their src files and CALL them (do NOT re-stub).
   - transcribe faithfully; @0xADDR on the function + every constant; Math.fround for f32; NaN-order
     comparisons per the cheat-sheet; model struct fields, not magic offsets.
   - throw-stub ONLY extern/virtual boundary calls, each citing its @0xADDR + "not yet transcribed".
6. gate.sh MUST print GATE: PASS (tsgo). Fix + `git commit --amend` before merge if needed.
7. wt_merge.sh <Class> (auto-rebase-retry + auto-clean).
8. `python3 raw-port/army/tools/leafq.py done <FW> <mangled>`. Also run
   `python3 raw-port/army/tools/mark_ported.py` so the ledger flips this fn to `ported` — that
   UNLOCKS its callers as new leaves for the next worker.
9. If a function turns out to genuinely need an unported internal dep (graph was stale):
   `python3 raw-port/army/tools/leafq.py fail <FW> <mangled> "<why>"` and move on — never stub it.

NO spawn_agent, NO relay. Do 3-6 real bodies and STOP; the coordinator refills.
REPORT each function: FW, class, mangled, addr, commit/merge hashes, GATE, and which real callees
you imported (proof it's not a stub).
