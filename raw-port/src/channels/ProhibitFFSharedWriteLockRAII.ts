// ProhibitFFSharedWriteLockRAII — an RAII (scope-guard) type whose ctor/dtor pair is
// intended to install and then release a "no shared-write lock allowed on this thread"
// guard around a lexical scope. In the shipped Final Cut Pro binary, however, ALL FOUR
// exported symbols (C1 / C2 / D1 / D2) are LITERAL NO-OPS: `push rbp / mov rsp,rbp /
// pop rbp / ret`. The compiler has evidently stripped every body except the calling
// convention prologue/epilogue. That is a deliberate release-build behavior: the class
// only carries side-effects in DEBUG builds (an assertion-time-only guard against a
// thread that already holds an FFSharedLock in read mode trying to escalate to write).
// In production the compiler proves the debug macro away and emits nothing.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly for all 4 symbols saved at:
//   raw-port/re/disasm/Flexo.ProhibitFFSharedWriteLockRAII.<mangled>.s
//
// FOUR EXPORTED SYMBOLS (all identical trivial bodies, differing only by address):
//   @Flexo 0x4781a0  __ZN29ProhibitFFSharedWriteLockRAIIC2EP12FFSharedLockPK10__CFString
//                     ProhibitFFSharedWriteLockRAII::ProhibitFFSharedWriteLockRAII
//                       (FFSharedLock*, __CFString const*)   [C2: base ctor]
//   @Flexo 0x4781b0  __ZN29ProhibitFFSharedWriteLockRAIIC1EP12FFSharedLockPK10__CFString
//                     same signature                          [C1: complete ctor]
//   @Flexo 0x4781c0  __ZN29ProhibitFFSharedWriteLockRAIID2Ev
//                     ~ProhibitFFSharedWriteLockRAII()        [D2: base dtor]
//   @Flexo 0x4781d0  __ZN29ProhibitFFSharedWriteLockRAIID1Ev
//                     ~ProhibitFFSharedWriteLockRAII()        [D1: complete dtor]
//
// EVERY function body is:
//   pushq  %rbp
//   movq   %rsp, %rbp
//   popq   %rbp
//   retq
//   nopw   %cs:(%rax,%rax)     ; alignment padding
//
// No fields are read, no fields are written, no callees are invoked, no exceptions can
// be thrown. There is no vtable (no leaq __ZTV*(%rip) anywhere in any of the four
// bodies), so the class has no virtual methods; it is a plain trivial POD-shape RAII.
// The parameters (FFSharedLock*, __CFString const*) are accepted but never used.
//
// FIELD LAYOUT is UNRECOVERABLE from these bodies (none of the ctor stores exist), so
// this port models the class as an empty guard object. When (if) a DEBUG-build binary
// becomes available and its ctor stores emerge, this file must be re-decoded — until
// then, the release-build ground truth IS "does nothing".
//
// A downstream caller instantiating this class will get an object that does nothing on
// scope entry AND exit, exactly matching the FCP release-build observable behaviour.

/**
 * Forward-declared frontier types — only participate as constructor arguments. Neither
 * type is dereferenced by any of the four release-build bodies.
 */
export type FFSharedLock = object;
/** Objective-C bridged CFString / NSString. Passed as a "debug label" for the guard. */
export type CFString = string;

/**
 * ProhibitFFSharedWriteLockRAII — a no-op-in-release scope guard.
 *
 * @param _lock    - the FFSharedLock the guard would (in DEBUG) enforce write-prohibit on.
 * @param _label   - a CFString identifying the guarded scope in debug logs.
 *
 * Constructor mirrors both C1 (@0x4781b0) and C2 (@0x4781a0) — same body, both empty.
 * Destructor via `release()` mirrors both D1 (@0x4781d0) and D2 (@0x4781c0).
 *
 * We expose no public fields because the release-build class stores none.
 */
export class ProhibitFFSharedWriteLockRAII {
  /**
   * C1 @0x4781b0 / C2 @0x4781a0 — both are `push rbp / mov rsp,rbp / pop rbp / ret`.
   * No stores are performed on `this`, on `_lock`, or on `_label`. The arguments are
   * accepted to match the mangled signature but are otherwise ignored.
   */
  constructor(_lock: FFSharedLock | null, _label: CFString | null) {
    // @0x4781a0 / @0x4781b0 — empty body: pushq %rbp; movq %rsp,%rbp; popq %rbp; retq.
    // Nothing stored, nothing checked. Deliberate release-build no-op.
  }

  /**
   * D1 @0x4781d0 / D2 @0x4781c0 — again `push rbp / mov rsp,rbp / pop rbp / ret`.
   * No fields read/written; no lock is released (nothing was acquired).
   *
   * Named `release` because JS syntax forbids `~ProhibitFFSharedWriteLockRAII`, and
   * because that verb matches the RAII intent. This method IS the destructor — call it
   * at scope exit if you need to observe the (empty) destructor's return-flow.
   */
  release(): void {
    // @0x4781c0 / @0x4781d0 — empty body. Nothing to do in release builds.
  }
}
