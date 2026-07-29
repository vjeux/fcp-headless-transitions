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
3. Disassemble ONLY that function BY ITS MANGLED SYMBOL (leafq gives you the mangled name — use it
   directly to avoid the D0/D1/D2 demangle-collision): `bash raw-port/tools/disasm.sh --sym <mangled> <FW>`.
   (Name mode `disasm.sh <Class> <method> <FW>` still works but warns + may grab the wrong dtor variant.)
   Auto-ICF-fallback + over-dump guard baked in. Constants: `resolve.py <FW> ripconst <instr> <disp>`.
   NOTE: run wt_setup.sh / wt_merge.sh with background:true (they can exceed the 5s foreground cap).
4. `wt_setup.sh <Class>`; commit fast after first edit.
5. Write the REAL body with the `edit` tool into `raw-port/src/<layer>/<Class>.ts`:
   - if the file exists (>100 lines), ADD/REPLACE ONLY this method — leave siblings alone.
   - import the ported callees from their real files and CALL them.
   - transcribe faithfully: @0xADDR on the fn + every const; Math.fround for f32; NaN-order compares
     per the cheat-sheet; model struct fields not magic offsets.
   - boundary-stub ONLY extern/virtual calls, each citing @0xADDR + "not yet transcribed".
6. `gate.sh` MUST print GATE: PASS. It now includes **G5 semantic completeness** (un-gameable — see
   the ANTI-CHEAT section below). If G5 says REJECT_CHEAT, you stubbed real work — transcribe it.
   `git commit --amend` if you edit post-commit.
7. `wt_merge.sh <Class>` (auto rebase-retry + untracked-scratch clean). A merge is NOT final until the
   ADVERSARIAL REVIEWER signs `<file>.review.json` (see REVIEWER_BRIEF.md). You cannot self-certify a
   REAL body as `ported`; the reviewer re-derives the disasm and blocks cheats.
8. `python3 raw-port/army/tools/mark_ported.py` (flips your fn to `ported` — this UNLOCKS its callers
   as new leaves) then `python3 raw-port/army/tools/leafq.py done <FW> <mangled>`.
9. If leafq handed you something whose dep turns out unported (stale graph): `leafq.py fail <FW>
   <mangled> "<why>"` and move on — NEVER stub an internal call to make the gate pass.

NO spawn_agent, NO relay. Do 4-8 real bodies, then STOP; the coordinator refills.
REPORT: per function — FW, class, mangled, addr, commit/merge hashes, GATE, and the REAL callees you
imported (proof it is not a stub).

## ANTI-CHEAT — you WILL be caught, so just do the real work (read CHEATING_REVIEW.md)
The old gate only checked "compiles + cites an @0xADDR", so all-throw shells passed (the 7385eb01
cheat). That hole is closed. Three un-gameable mechanisms now run:

1. **G5 (gate.sh, automatic, BLOCKING).** After G0-G4 it runs `raw-port/army/gate/g5_impl_gate.py`,
   which re-derives your function's disasm FROM THE BINARY (it ignores your saved .s), classifies it
   (TRAP | EMPTY | DISPATCH_ONLY | REAL), and for a REAL function FUZZES YOUR port across its params.
   If any reachable input hits an incompleteness throw (`not yet transcribed` …) while the disasm
   shows REAL work → REJECT_CHEAT, commit blocked. Adding a token `if`/`return` does NOT clear it —
   the check CALLS your code and reads the machine code.

2. **The executable oracle (strongest).** If your function is FREE or STATIC and pure-numeric
   (scalar/array args, no `this`), it is Tier-1: a reviewer runs `diff_oracle.py`, calling the LIVE
   FCP symbol and diffing your output bit/tol-exact on fuzzed inputs. Wrong math → DIVERGED; a throw
   → FAILED. Neither merges. There is no text that fakes a correct number. So do not approximate.

3. **The adversarial reviewer (separate agent, blocks your merge).** It re-derives the disasm
   independently and reads it line-by-line against your TS (REVIEWER_BRIEF.md). It is rewarded for
   CATCHING cheats. You cannot self-merge. An all-throw body for a REAL function, a same-framework
   callee you throw-stubbed, or a throw-free but WRONG body — all REJECTED.

**DISPATCH_ONLY is not yours to "port".** leafq will NOT hand you a function whose entire body is
virtual/vtable dispatch (callees==[], ext==0, ind>=1, no compute — the 7385eb01 shape). Its real work
IS its callees; a port of it can only be a shell. If you somehow get one, `leafq.py fail` it — do NOT
ship a two-dispatch-then-return shell and call it ported. That is the exact cheat we halted to kill.

**Status truth:** `ported` means oracle-VERIFIED (bit-exact vs live FCP) OR reviewer-signed real body.
A skeleton (layout+stubs) is `skeleton`, NEVER counted `ported`. A ud2/empty is `trap`. Do not inflate
the count with shells.

**Self-check before you claim done** — run exactly what the reviewer runs:
    python3 raw-port/army/verifier/classify_disasm.py <your re-derived .s>   # REAL vs DISPATCH_ONLY
    bash raw-port/army/gate/gate.sh raw-port/src/<layer>/<Class>.ts          # G5 must not REJECT
If G5 says REJECT_CHEAT, your body is a shell — transcribe the real instructions.
