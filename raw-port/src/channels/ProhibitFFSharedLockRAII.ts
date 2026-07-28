// ProhibitFFSharedLockRAII.ts — Flexo framework's ProhibitFFSharedLockRAII, a
// scope-guard RAII object that (semantically) marks the current thread as
// PROHIBITED from acquiring an FFSharedLock while it exists. In release builds
// its four exported methods are ALL degenerate frame-set-up/tear-down stubs
// (5-byte `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq`) — every observable
// side-effect of the guard has been compiled away.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FOUR EXPORTED SYMBOLS — the complete API of the class (Itanium C1/C2 + D1/D2 aliases):
//   @Flexo 0x0000000000478160  ProhibitFFSharedLockRAII::ProhibitFFSharedLockRAII(FFSharedLock*, __CFString const*)  (C2 — base)
//   @Flexo 0x0000000000478170  ProhibitFFSharedLockRAII::ProhibitFFSharedLockRAII(FFSharedLock*, __CFString const*)  (C1 — complete)
//   @Flexo 0x0000000000478180  ProhibitFFSharedLockRAII::~ProhibitFFSharedLockRAII()  (D2 — base)
//   @Flexo 0x0000000000478190  ProhibitFFSharedLockRAII::~ProhibitFFSharedLockRAII()  (D1 — complete)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.ProhibitFFSharedLockRAII.ProhibitFFSharedLockRAII.s  (C1 body @0x478170)
//   raw-port/re/disasm/Flexo.ProhibitFFSharedLockRAII.~ProhibitFFSharedLockRAII.s (D1 body @0x478190)
// (C2 @0x478160 and D2 @0x478180 recovered directly from /tmp/Flexo_tV.txt; see the
//  disasm blocks reproduced inline on each method below.)
//
// ── EVERY BODY IS A NO-OP ────────────────────────────────────────────────────
// All four functions have the identical 5-byte body:
//   pushq %rbp
//   movq  %rsp, %rbp
//   popq  %rbp
//   retq
//   nopw  %cs:(%rax,%rax)   ; padding
// No field is read, no field is written, no callee is invoked. The class ALSO
// has no observable state — none of the four methods touches (this) beyond
// receiving it in %rdi and immediately discarding.
//
// This is the classic pattern of an ASSERT-ONLY / DEBUG-ONLY RAII guard whose
// body has been macro-guarded out of release builds. In FCP's debug build the
// ctor would call something like FFSharedLock::pushProhibition(self, tag) and
// the dtor FFSharedLock::popProhibition(self); in release, the whole scope
// evaporates but the ctor/dtor symbols must still exist so ABI-stable callers
// that were compiled against the debug header link.
//
// We do not INVENT a debug-body: the four bodies as observed are correct —
// they do exactly nothing, and any "faithful" TypeScript port must match
// that. Callers who need the debug-time prohibition semantics will find them
// in FFSharedLock (a separate port) or in an FFSharedLock RAII decoded from
// the debug build — neither of which is in scope here.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// Because none of the four exported bodies READS OR WRITES any (this) offset,
// sizeof and layout are not recoverable from this class in isolation. The
// class MAY hold two pointer-sized fields (the FFSharedLock* and the
// __CFString* the ctor received) so that the dtor could restore them — the
// caller-side stack-slot alignment (16 bytes) is consistent with sizeof=16 —
// but we cannot confirm this from the observed asm. We keep the two ctor
// arguments as fields to preserve the semantic hand-off; in a debug build
// the dtor would read them. In this release-build port they are simply held.
//
//   +0x00   0x08  lock : FFSharedLock*        (arg #1 of ctor; released observed no read)
//   +0x08   0x08  tag  : __CFString*          (arg #2 of ctor; released observed no read)
//   sizeof ≥ 16   (unconfirmed by asm — RAII guard body is fully elided).
//
// ── FRONTIER TYPES ───────────────────────────────────────────────────────────
// FFSharedLock and __CFString are opaque handles from callers' perspective;
// we forward-declare each as a nominal opaque interface. FFSharedLock is a
// Flexo framework class ported separately; __CFString is CoreFoundation's
// CFStringRef (opaque to callers).

/** Opaque handle to Flexo's FFSharedLock. Ported separately when its symbols hit
 *  the queue. Used only as an argument type here — no field of it is accessed
 *  by any of the four observed methods. */
export interface FFSharedLock {
  readonly __brand_FFSharedLock: unique symbol;
}

/** Opaque handle to CoreFoundation's CFStringRef (`__CFString*`), used only as a
 *  tag argument to the ctor. Modeled as `string` in TS would be lossy (a real
 *  CFString has retain/release semantics); we keep an opaque brand and let a
 *  future CFString bridge produce instances. */
export interface CFStringRef {
  readonly __brand_CFStringRef: unique symbol;
}

/**
 * ProhibitFFSharedLockRAII — release-build empty scope guard whose four
 * exported members are all pure 5-byte returns. In a debug build the ctor
 * would flag the current thread as prohibited from acquiring `lock`, and
 * the dtor would clear that flag; in the shipped FCP binary both operations
 * are elided.
 *
 * The class is provided so downstream callers that construct it via the
 * observed C1/C2 aliases have a real target. Calling either destructor is
 * likewise a no-op.
 */
export class ProhibitFFSharedLockRAII {
  /** +0x00 (unconfirmed — see STRUCT LAYOUT note). The FFSharedLock the guard
   *  would prohibit in a debug build. Never read by any observed method. */
  lock: FFSharedLock;

  /** +0x08 (unconfirmed). The debug-tag CFString the ctor received. Never
   *  read by any observed method. */
  tag: CFStringRef;

  /**
   * ProhibitFFSharedLockRAII::ProhibitFFSharedLockRAII(FFSharedLock*, __CFString const*)
   *   — the C2 (base) ctor. Also serves as C1 (they are byte-identical, both empty).
   *   @Flexo 0x0000000000478160..0x0000000000478166 (C2)
   *   @Flexo 0x0000000000478170..0x0000000000478176 (C1)
   *
   * Disassembly (C2 body — C1 is byte-for-byte identical):
   *   0x478160  pushq %rbp
   *   0x478161  movq  %rsp, %rbp
   *   0x478164  popq  %rbp
   *   0x478165  retq
   *   0x478166  nopw  %cs:(%rax,%rax)     ; alignment padding
   *
   * The two arguments are received in %rsi (lock) and %rdx (tag) and never
   * stored to (this) — no `movq %rsi, 0x?(%rdi)` appears. In the release
   * build the ctor is a pure return. We still hold the arguments as fields
   * so the class-shape carries the debug-build semantics forward for callers
   * that inspect the object; this write is INVISIBLE to FCP (FCP's binary
   * never reads them back), so it does not violate faithfulness.
   */
  constructor(lock: FFSharedLock, tag: CFStringRef) {
    // C2 @0x478160 / C1 @0x478170 — release-build no-op. We record the
    // arguments in fields as a purely TS-side courtesy; the asm makes no
    // observable use of them.
    this.lock = lock;
    this.tag = tag;
  }

  /**
   * ProhibitFFSharedLockRAII::~ProhibitFFSharedLockRAII() — D2 (base) destructor.
   *   @Flexo 0x0000000000478180..0x0000000000478186
   *
   * Disassembly:
   *   0x478180  pushq %rbp
   *   0x478181  movq  %rsp, %rbp
   *   0x478184  popq  %rbp
   *   0x478185  retq
   *   0x478186  nopw  %cs:(%rax,%rax)     ; alignment padding
   *
   * Empty body. No field is read; no callee is invoked. In the debug build
   * this would clear the prohibition flag set by the ctor; in release it is
   * a pure return.
   */
  destroy_D2(): void {
    // 0x478180 — release-build no-op. Kept as an entry point so the
    // ~ProhibitFFSharedLockRAII @0x478180 symbol has a TS-side landing site.
  }

  /**
   * ProhibitFFSharedLockRAII::~ProhibitFFSharedLockRAII() — D1 (complete-object)
   * destructor. Byte-identical to D2 (both empty).
   *   @Flexo 0x0000000000478190..0x0000000000478196
   *
   * Disassembly:
   *   0x478190  pushq %rbp
   *   0x478191  movq  %rsp, %rbp
   *   0x478194  popq  %rbp
   *   0x478195  retq
   *   0x478196  nopw  %cs:(%rax,%rax)     ; alignment padding
   *
   * The Itanium ABI defines D1 as "run D2 then finalize any virtual bases".
   * This class has no virtual bases, so D1 is byte-identical to D2 — the
   * compiler didn't even bother emitting a jmp. In TS both are equivalent
   * no-op methods.
   */
  destroy_D1(): void {
    // 0x478190 — release-build no-op. Byte-identical to D2. Kept as a
    // distinct entry point so both @0x478180 (D2) and @0x478190 (D1) have
    // TS-side landing sites.
    this.destroy_D2();
  }
}
