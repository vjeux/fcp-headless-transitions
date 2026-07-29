// raw-port/src/channels/FFPMRNoOpInstrument.ts
//
// FCP `FFPMRNoOpInstrument` — Flexo Performance Measurement / Reporting
// (FFPMR) null-object instrument. Every `doLog` overload is a literal
// no-op (`push rbp; mov rsp,rbp; pop rbp; ret`) and the two destructors
// delegate to the base class `FFPMRInstrument` (which is not yet
// ported — a boundary throw-stub is exposed below with the call-site
// @0xADDR per PORTING_SPEC Rule 3).
//
// This class is used across FCP as the default instrument passed to
// timers when logging is disabled — every call is meant to be as close
// to zero-cost as possible, which is why every method is an empty
// prologue/epilogue in the shipped binary. Faithfully transcribed:
// each TS `doLog` returns immediately without side effects.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.FFPMRNoOpInstrument.~FFPMRNoOpInstrument.s
//   raw-port/re/disasm/Flexo.FFPMRNoOpInstrument.doLog.s
// (Note: the batch-disasm tool consolidates all `doLog` overloads into
//  a single filename; individual bodies were recovered by direct index
//  of /tmp/Flexo_tV.txt at their ledger @0xADDRs — see the per-method
//  addresses below. All six 3-arg overloads share the same trivial
//  prologue-only body.)
//
// Ledger addresses (raw-port/army/ledger/Flexo.ledger.json):
//   0xcfda70  FFPMRNoOpInstrument::~FFPMRNoOpInstrument()                       [D1]
//   0xcfda80  FFPMRNoOpInstrument::~FFPMRNoOpInstrument()                       [D0]
//   0xcfdaa0  FFPMRNoOpInstrument::doLog(__CFString*, __CFString*, __CFString*)
//   0xcfdab0  FFPMRNoOpInstrument::doLog(__CFString*, double, __CFString*)
//   0xcfdac0  FFPMRNoOpInstrument::doLog(__CFString*, unsigned int, __CFString*)
//   0xcfdad0  FFPMRNoOpInstrument::doLog(__CFString*, int, __CFString*)
//   0xcfdae0  FFPMRNoOpInstrument::doLog(__CFString*, unsigned long long, __CFString*)
//   0xcfdaf0  FFPMRNoOpInstrument::doLog(__CFString*, long long, __CFString*)
//   0xcfdb00  FFPMRNoOpInstrument::doLog(__CFString*, signed char, __CFString*)
//
// Full method bodies (verbatim from otool -tV at each ledger addr):
//
// D1 dtor @0xcfda70 (5 lines):
//   0xcfda70  pushq %rbp
//   0xcfda71  movq  %rsp, %rbp
//   0xcfda74  popq  %rbp
//   0xcfda75  jmp   __ZN15FFPMRInstrumentD2Ev       ; tail-call FFPMRInstrument::~FFPMRInstrument (D2)
//   0xcfda7a  nopw  (%rax,%rax)
//
// D0 dtor @0xcfda80 (12 lines):
//   0xcfda80  pushq %rbp
//   0xcfda81  movq  %rsp, %rbp
//   0xcfda84  pushq %rbx
//   0xcfda85  pushq %rax                            ; align stack
//   0xcfda86  movq  %rdi, %rbx                      ; save this
//   0xcfda89  callq __ZN15FFPMRInstrumentD2Ev       ; base D2
//   0xcfda8e  movq  %rbx, %rdi                      ; this back into arg
//   0xcfda91  addq  $0x8, %rsp
//   0xcfda95  popq  %rbx
//   0xcfda96  popq  %rbp
//   0xcfda97  jmp   0x1497404                       ; symbol stub for: __ZdlPv (operator delete)
//   0xcfda9c  nopl  (%rax)
//
// Each `doLog(CFStringRef, T, CFStringRef)` @0xcfdaa0..0xcfdb00 (5 lines each):
//   XX+0  pushq %rbp
//   XX+1  movq  %rsp, %rbp
//   XX+4  popq  %rbp
//   XX+5  retq
//   XX+6  nopw  %cs:(%rax,%rax)     ; alignment padding (last overload uses `addb %al,(%rax)` fillers)
//
// The no-op prologue is present so the compiler emits a debuggable
// stack frame; the observable effect is nothing — the argument tuple
// is discarded. That matches this class's contract: an instrument that
// records nothing.

// ─── Frontier callees (undecoded → throw-stubs per PORTING_SPEC Rule 3) ──────

/**
 * `FFPMRInstrument::~FFPMRInstrument()` — base-class D2 destructor,
 * mangled `__ZN15FFPMRInstrumentD2Ev`. Called from:
 *   - `FFPMRNoOpInstrument::~FFPMRNoOpInstrument` D1 @Flexo 0xcfda75 (tail-jmp)
 *   - `FFPMRNoOpInstrument::~FFPMRNoOpInstrument` D0 @Flexo 0xcfda89 (callq)
 *
 * Not yet transcribed here — the FFPMRInstrument class port will land
 * separately (ledger @0x1487500 lists its D2). Until then, invoking
 * either destructor path throws with the call-site address so the gap
 * is visible per PORTING_SPEC Rule 3.
 */
function FFPMRInstrument_D2_dtor(_this: FFPMRNoOpInstrument): void {
  throw new Error(
    "FFPMRInstrument::~FFPMRInstrument (D2, __ZN15FFPMRInstrumentD2Ev) not yet transcribed " +
      "— called from FFPMRNoOpInstrument::~FFPMRNoOpInstrument D1 @Flexo 0xcfda75 and D0 @Flexo 0xcfda89",
  );
}

/**
 * `operator delete(void*)` — mangled `__ZdlPv`, reached via Flexo's
 * `__stubs` at 0x1497404. Called from
 * `FFPMRNoOpInstrument::~FFPMRNoOpInstrument` D0 @Flexo 0xcfda97 (tail-jmp).
 *
 * A runtime-boundary stub — libc++ heap deallocation isn't reproduced
 * by the port. The TS D0 path calls this stub to model the C++ ABI's
 * "delete after destruction", but at the port level the D0 destructor
 * is the end-of-object handoff to the JS GC. We throw here to make it
 * explicit that user code invoking `destructDelete()` is asking for a
 * native heap free that TS cannot faithfully perform.
 */
function operator_delete(_p: FFPMRNoOpInstrument): void {
  throw new Error(
    "operator delete (__ZdlPv) not modelled in the port — reached from " +
      "FFPMRNoOpInstrument::~FFPMRNoOpInstrument D0 @Flexo 0xcfda97 (via __stubs 0x1497404)",
  );
}

// ─── The class ────────────────────────────────────────────────────────────────

/**
 * `FFPMRNoOpInstrument` — the null-object instrument in the FFPMR
 * hierarchy. Subclass of `FFPMRInstrument` (see the tail-jmp in D1
 * @0xcfda75 to `__ZN15FFPMRInstrumentD2Ev`); the base class holds
 * whatever state the class carries. This subclass adds NO fields of
 * its own — the D1 body only calls the base dtor without touching any
 * this-relative offset — and its `doLog` overrides are all no-ops.
 *
 * The constructor is NOT in the Flexo ledger for this class — like
 * FFPMRAutoTimer's ctor, it's inlined into every caller (release
 * builds inline all-empty-body ctors). Direct construction is
 * therefore blocked with a throw; the class is only ever materialised
 * via a factory returning a base-typed pointer, and callers only ever
 * exercise the virtual `doLog` dispatch.
 */
export class FFPMRNoOpInstrument {
  /**
   * `FFPMRNoOpInstrument::FFPMRNoOpInstrument(...)` — no external
   * symbol in Flexo (inline-defined at every construction site in
   * release builds). Per PORTING_SPEC Rule 3 we throw rather than
   * invent a body; the class exists to be routed to via a base-class
   * factory.
   *
   * D1 @Flexo 0xcfda70 confirms the class has no own state to init
   * (the dtor only forwards to the base), so any real ctor would also
   * be trivial — but we still won't ship an unwritten body.
   */
  constructor() {
    throw new Error(
      "FFPMRNoOpInstrument::FFPMRNoOpInstrument() has no external symbol in Flexo " +
        "(inline-defined; not in ledger — the paired D1 dtor is @0xcfda70). Cannot ship " +
        "a ctor body without a decoded call site. Recover the construction pattern from an " +
        "inlined caller (any factory function that heap-allocates an FFPMRNoOpInstrument and " +
        "returns it typed as FFPMRInstrument*) before filling this in.",
    );
  }

  /**
   * `FFPMRNoOpInstrument::~FFPMRNoOpInstrument()` @Flexo 0xcfda70 (D1).
   *
   * Body (5 lines): prologue, tail-jmp `FFPMRInstrument::~FFPMRInstrument()`
   * (D2 base). The subclass adds nothing; the base dtor is the only
   * real work.
   */
  destruct(): void {
    // @Flexo 0xcfda75: jmp __ZN15FFPMRInstrumentD2Ev  (tail-call base D2)
    FFPMRInstrument_D2_dtor(this);
  }

  /**
   * `FFPMRNoOpInstrument::~FFPMRNoOpInstrument()` @Flexo 0xcfda80 (D0).
   *
   * The deleting-destructor variant clang emits for virtual-dtor
   * dispatch through the vtable. Body:
   *   - call base D2 (`FFPMRInstrument::~FFPMRInstrument`) @0xcfda89
   *   - tail-jmp `operator delete(void*)` @0xcfda97 (via __stubs 0x1497404)
   *
   * D0 is the "destruct and free" path — it's what `delete p;` on a
   * base-typed pointer resolves to via the vtable. TS doesn't have an
   * explicit heap-free step (GC handles it), so `operator_delete` is
   * a runtime-boundary throw-stub: the base D2 is the meaningful step.
   */
  destructDelete(): void {
    // @Flexo 0xcfda89: callq __ZN15FFPMRInstrumentD2Ev  (base D2)
    FFPMRInstrument_D2_dtor(this);
    // @Flexo 0xcfda97: jmp __stubs[0x1497404] = __ZdlPv  (operator delete)
    operator_delete(this);
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, __CFString*, __CFString*)`
   * @Flexo 0xcfdaa0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringS2_S2_`).
   *
   * Body @0xcfdaa0..0xcfdaa5: pushq %rbp / movq %rsp,%rbp / popq %rbp
   * / retq. Literal no-op — all three CFStringRef arguments are
   * discarded.
   */
  doLog_ccc(_a: unknown, _b: unknown, _c: unknown): void {
    // @Flexo 0xcfdaa0..0xcfdaa5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, double, __CFString*)`
   * @Flexo 0xcfdab0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringdS2_`).
   *
   * Body @0xcfdab0..0xcfdab5: identical no-op prologue/epilogue.
   */
  doLog_cdc(_a: unknown, _b: number, _c: unknown): void {
    // @Flexo 0xcfdab0..0xcfdab5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, unsigned int, __CFString*)`
   * @Flexo 0xcfdac0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringjS2_`).
   *
   * Body @0xcfdac0..0xcfdac5: identical no-op prologue/epilogue.
   */
  doLog_cjc(_a: unknown, _b: number, _c: unknown): void {
    // @Flexo 0xcfdac0..0xcfdac5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, int, __CFString*)`
   * @Flexo 0xcfdad0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringiS2_`).
   *
   * Body @0xcfdad0..0xcfdad5: identical no-op prologue/epilogue.
   */
  doLog_cic(_a: unknown, _b: number, _c: unknown): void {
    // @Flexo 0xcfdad0..0xcfdad5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, unsigned long long, __CFString*)`
   * @Flexo 0xcfdae0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringyS2_`).
   *
   * Body @0xcfdae0..0xcfdae5: identical no-op prologue/epilogue.
   * (uint64 → bigint per PORTING_SPEC Rule 4; value is unused anyway.)
   */
  doLog_cyc(_a: unknown, _b: bigint, _c: unknown): void {
    // @Flexo 0xcfdae0..0xcfdae5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, long long, __CFString*)`
   * @Flexo 0xcfdaf0 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringxS2_`).
   *
   * Body @0xcfdaf0..0xcfdaf5: identical no-op prologue/epilogue.
   * (int64 → bigint per PORTING_SPEC Rule 4; value is unused anyway.)
   */
  doLog_cxc(_a: unknown, _b: bigint, _c: unknown): void {
    // @Flexo 0xcfdaf0..0xcfdaf5 — empty body.
  }

  /**
   * `FFPMRNoOpInstrument::doLog(__CFString*, signed char, __CFString*)`
   * @Flexo 0xcfdb00 (mangled `__ZN19FFPMRNoOpInstrument5doLogEPK10__CFStringaS2_`).
   *
   * Body @0xcfdb00..0xcfdb05: identical no-op prologue/epilogue
   * (trailing 0-byte fillers `addb %al,(%rax)` are alignment only,
   *  not executed).
   */
  doLog_cac(_a: unknown, _b: number, _c: unknown): void {
    // @Flexo 0xcfdb00..0xcfdb05 — empty body.
  }
}
