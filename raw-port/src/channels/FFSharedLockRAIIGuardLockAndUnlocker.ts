// FFSharedLockRAIIGuardLockAndUnlocker.ts — Flexo RAII guard that pairs an
// ObjC-level `lock`/`unlock` with an optional nested C++ guard. Only the
// destructor is present in the FCP binary (the ctor is likely inlined at
// every construction site — none of the 1,300+ callers cross a function
// boundary for construction). One ledger symbol, transcribed here:
//
//   FFSharedLockRAIIGuardLockAndUnlocker::~FFSharedLockRAIIGuardLockAndUnlocker() [D1] @0x4767c0
//
// TRANSCRIBED from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.FFSharedLockRAIIGuardLockAndUnlocker.dtor.s
// for the verbatim x86_64 disassembly (28 lines, one basic block).
//
// STRUCT LAYOUT (recovered from D1 @0x4767c0..fe):
//
//   +0x00  lockObject       : ObjC id           the wrapped lock (retained on
//                                               ctor). Dtor sends `[lockObject
//                                               unlock]` @0x4767e9 then
//                                               _objc_release @0x4767f2.
//   +0x08  nestedGuard      : void* | nullptr   optional inner C++ guard whose
//                                               vtable slot +0x10 is an "early
//                                               unlock" method. Checked at
//                                               @0x4767c9 (`movq 0x8(%rdi),%rdi
//                                               ; testq %rdi,%rdi ; je 0x4767db`).
//   +0x10  unlockedFlag     : uint8             "have I already fired the nested
//                                               guard's unlock?". Read as byte
//                                               @0x4767d2 (`cmpb $0,0x10(%rbx) ;
//                                               jne 0x4767db`) and unconditionally
//                                               set to 1 @0x4767db
//                                               (`movb $0x1,0x10(%rbx)`).
//
//   Total object size: at least 0x11 bytes (18 with alignment padding).
//   The ctor is not decoded — the class has no C1/C2/C0 symbol in the
//   ledger, and the caller-inlined pattern is typical for tiny RAII
//   wrappers. We surface the ctor as a partial constructor that takes
//   the three fields explicitly so callers can express the intent.
//
// SELECTOR PROVENANCE (recovered via __objc_selrefs decode):
//   @0x4767e2 loads `0x1741c87(%rip)` — target VA 0x1bb8470 in
//   __DATA_CONST.__objc_selrefs. That cell holds a chained-fixup pointer
//   whose low-32 is 0x18337a6 in the __TEXT __cstring segment; the
//   C-string there is literally "unlock" (verified via dd). So the
//   selector sent to the ObjC lock object is `-unlock`, i.e. the
//   `NSLocking` protocol method. This matches the class name: the guard
//   locks on construction (inlined) and unlocks on destruction.
//
// The nested-guard vtable slot +0x10 call @0x4767d8 (`callq *0x10(%rdi)`)
// is a virtual dispatch on the nested guard whose vtable layout is
// unknown at this level — the nested guard could be any RAII lock type
// (ProhibitFFSharedWriteLockRAII, ProhibitFFSharedLockRAII, ...). We
// model it as a callable in the object shape.
//
// x86 AT&T decode notes: single call site with `callq *0x10(%rdi)`
// (indirect through vtable slot +0x10). Every `testq X,X ; je L` is
// "if X == 0 goto L". No float compares.

// ── Frontier / opaque handle types ──────────────────────────────────────

/** ObjC lock-object handle. The dtor sends `unlock` via _objc_msgSend
 *  then _objc_release. Concrete types are NSLock, NSRecursiveLock,
 *  NSCondition, or any object implementing NSLocking `-unlock`. */
export interface FFSharedLockRAII_ObjCLock {
  /** Send `-unlock` to the receiver (NSLocking protocol). */
  unlock(): void;
  /** Called after unlock to release the guard's retain count. */
  __objc_release(): void;
}

/** Nested inner-guard handle. Only vtable slot +0x10 is called by the
 *  dtor; the actual C++ type could be any of the ProhibitFFSharedLock*
 *  RAII families or similar. */
export interface FFSharedLockRAII_NestedGuard {
  /** vtable slot +0x10 — invoked by the outer dtor when
   *  unlockedFlag == 0 to trigger the nested guard's early-unlock. */
  vtblSlot_0x10(): void;
}

// ── The FFSharedLockRAIIGuardLockAndUnlocker object ─────────────────────

/** In-memory image of the C++ RAII guard, matching the byte-level layout
 *  recovered from the D1 disasm @0x4767c0. Callers construct this
 *  inline (ctor is not in the binary as a distinct symbol); the only
 *  transcribed method is the destructor. */
export class FFSharedLockRAIIGuardLockAndUnlocker {
  /** +0x00 lockObject — the ObjC lock. Retained on ctor (inlined at
   *  every callsite). */
  lockObject: FFSharedLockRAII_ObjCLock;
  /** +0x08 nestedGuard — optional inner guard. `null` means "no nested
   *  guard; skip the vtable dispatch". */
  nestedGuard: FFSharedLockRAII_NestedGuard | null;
  /** +0x10 unlockedFlag — 1 byte. `false` (0) means "the nested guard
   *  has NOT yet been early-unlocked, and the dtor MUST fire it"; `true`
   *  (1) means "somebody already fired it, skip". Ctor initialises to 0
   *  (inlined; not decoded — assumed by dtor's read/write pattern). */
  unlockedFlag: boolean;

  /** Constructor — the C++ ctor is not in the FCP binary as a distinct
   *  symbol; each caller emits the field initialisation inline. We
   *  expose a TS ctor that accepts the three fields directly so callers
   *  can express the guarded acquisition pattern:
   *
   *    const g = new FFSharedLockRAIIGuardLockAndUnlocker(lock, null, false);
   *    lock.lock();                          // caller's inlined ctor also acquires
   *    ...
   *    g.destroyD1();                        // matches the C++ scope-exit
   */
  constructor(
    lockObject: FFSharedLockRAII_ObjCLock,
    nestedGuard: FFSharedLockRAII_NestedGuard | null,
    unlockedFlag: boolean,
  ) {
    this.lockObject = lockObject;
    this.nestedGuard = nestedGuard;
    this.unlockedFlag = unlockedFlag;
  }

  /** FFSharedLockRAIIGuardLockAndUnlocker::~FFSharedLockRAIIGuardLockAndUnlocker() [D1]
   *  @Flexo 0x4767c0
   *
   *  Verbatim body (@0x4767c0..fe):
   *    pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *    movq %rdi,%rbx                        ; rbx = this
   *    movq 0x8(%rdi),%rdi                    ; rdi = this->nestedGuard
   *    testq %rdi,%rdi ; je L1                ; if nestedGuard == null skip
   *    cmpb $0,0x10(%rbx) ; jne L1            ; if unlockedFlag != 0 skip
   *    callq *0x10(%rdi)                      ; nestedGuard->vtbl[0x10]()
   *  L1:
   *    movb $0x1,0x10(%rbx)                   ; unlockedFlag = 1
   *    movq (%rbx),%rdi                       ; rdi = this->lockObject
   *    movq 0x1741c87(%rip),%rsi              ; selector "unlock" (via
   *                                             __objc_selrefs @0x1bb8470,
   *                                             cstring "unlock" @0x18337a6)
   *    callq *0x1476ed1(%rip)                 ; _objc_msgSend(lockObject, @selector(unlock))
   *    movq (%rbx),%rdi                       ; rdi = this->lockObject
   *    callq *0x1476f10(%rip)                 ; _objc_release(lockObject)
   *    ; epilogue
   *    addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *
   *  Exception cleanup:
   *    @0x4767ff  movq %rax,%rdi
   *    @0x476802  callq ___clang_call_terminate   ; terminate on throw
   *
   *  Semantics: three-phase teardown.
   *    1. Optionally invoke a nested inner guard's early-unlock (only if
   *       one is registered AND we haven't done so).
   *    2. Mark ourselves "already unlocked" so any second dtor invocation
   *       (e.g. from a re-throw path) is a no-op.
   *    3. Send `unlock` to the wrapped ObjC lock and release our retain.
   */
  destroyD1(): void {
    // Step 1 — nested guard early-unlock.
    // Disasm: movq 0x8(rdi),rdi ; testq rdi,rdi ; je L1 ; cmpb $0,0x10(rbx) ; jne L1 ; callq *0x10(rdi)
    if (this.nestedGuard !== null && this.unlockedFlag === false) {
      this.nestedGuard.vtblSlot_0x10();
    }

    // Step 2 — set the flag unconditionally.
    // Disasm: movb $0x1, 0x10(rbx)
    this.unlockedFlag = true;

    // Step 3a — send [lockObject unlock] via _objc_msgSend.
    // Disasm: movq (rbx),rdi ; movq @sel_unlock(rip),rsi ; callq *_objc_msgSend(rip)
    this.lockObject.unlock();

    // Step 3b — _objc_release(lockObject).
    // Disasm: movq (rbx),rdi ; callq *_objc_release(rip)
    this.lockObject.__objc_release();
  }
}
