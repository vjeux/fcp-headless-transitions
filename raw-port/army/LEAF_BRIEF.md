# LEAF WORKER — implement REAL function bodies (dependency-ordered)

You port ONE FUNCTION AT A TIME, chosen so you can write a REAL body — every same-framework
function it calls is ALREADY ported. This is the opposite of the old "grab a class, stub the hard
methods" flow. THROW-STUBS FOR INTERNAL (same-framework) CALLS ARE FORBIDDEN here — if a callee were
unported you would not have been given this function. Only true externs (other framework / ObjC /
libc) and virtual/vtable dispatch may be boundary-stubbed.

Read raw-port/army/PORTING_SPEC.md + ANTI_SHORTCUT.md first (esp. the x86 AT&T cheat-sheet in Rule 4).

## Loop (do 4-8 functions, then STOP)
1. `python3 raw-port/army/tools/leafq.py next` → leases the globally-smallest implementable function.
   Output TSV: `<FW>\t<Class>\t<addr>\t<mangled>\t<demangled>`.
   (Pin a framework with `leafq.py next ProCore` if you want to stay in one file set.)
2. `python3 raw-port/army/tools/leafq.py deps <FW> <mangled>` → lists its internal callees and shows
   each is `ported`. You will IMPORT and CALL those real functions — never re-stub them.
3. Disassemble ONLY that function: `bash raw-port/tools/disasm.sh <Class> <method> <FW>`
   (auto-ICF-fallback + over-dump guard baked in). Constants: `resolve.py <FW> ripconst <instr> <disp>`.
4. `wt_setup.sh <Class>`; commit fast after first edit.
5. Write the REAL body with the `edit` tool into `raw-port/src/<layer>/<Class>.ts`:
   - if the file exists (>100 lines), ADD/REPLACE ONLY this method — leave siblings alone.
   - import the ported callees from their real files and CALL them.
   - transcribe faithfully: @0xADDR on the fn + every const; Math.fround for f32; NaN-order compares
     per the cheat-sheet; model struct fields not magic offsets.
   - boundary-stub ONLY extern/virtual calls, each citing @0xADDR + "not yet transcribed".
6. `gate.sh` MUST print GATE: PASS (tsgo). `git commit --amend` if you edit post-commit.
7. `wt_merge.sh <Class>` (auto rebase-retry + untracked-scratch clean).
8. `python3 raw-port/army/tools/mark_ported.py` (flips your fn to `ported` — this UNLOCKS its callers
   as new leaves) then `python3 raw-port/army/tools/leafq.py done <FW> <mangled>`.
9. If leafq handed you something whose dep turns out unported (stale graph): `leafq.py fail <FW>
   <mangled> "<why>"` and move on — NEVER stub an internal call to make the gate pass.

NO spawn_agent, NO relay. Do 4-8 real bodies, then STOP; the coordinator refills.
REPORT: per function — FW, class, mangled, addr, commit/merge hashes, GATE, and the REAL callees you
imported (proof it is not a stub).
