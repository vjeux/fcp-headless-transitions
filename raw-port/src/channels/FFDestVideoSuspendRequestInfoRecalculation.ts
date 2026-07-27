// FFDestVideoSuspendRequestInfoRecalculation.ts — RAII scope guard that brackets a
// -suspendRequestInfoRecalc / -resumeRequestInfoRecalc pair on an FFDestVideo delegate. On
// construction, if the target conforms to `@protocol(FFDestVideoSuspendRequestInfoRecalcProtocol)`,
// the ctor retains it, stores it, and sends -suspendRequestInfoRecalc (tail-called). On destruction,
// if a delegate was stored the dtor sends -resumeRequestInfoRecalc, releases, and nils the slot.
// Faithfully transcribed from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly grep-visible in /tmp/Flexo_tV.txt at addresses 0xd422c0 / 0xd42320 / 0xd42360.
//
// Class has NO vtable, ONE instance field, and three methods (matching the Itanium ABI's
// duplicate-dtor convention D1 / D2 which are byte-identical here modulo the RIP offsets used to
// reach the selref and _objc_release lazy-stub slot):
//   @Flexo 0x0000000000d422c0  FFDestVideoSuspendRequestInfoRecalculation::FFDestVideoSuspendRequestInfoRecalculation(FFDestVideo*)   (C1 aliased to C2)
//   @Flexo 0x0000000000d42320  FFDestVideoSuspendRequestInfoRecalculation::~FFDestVideoSuspendRequestInfoRecalculation()              (D2 base)
//   @Flexo 0x0000000000d42360  FFDestVideoSuspendRequestInfoRecalculation::~FFDestVideoSuspendRequestInfoRecalculation()              (D1 complete)
// nm -a reports both C1 and C2 mangled names but they point to the same offset; the linker aliases
// C1 -> C2. D1 and D2 are two distinct but structurally identical bodies.
//
// STRUCT LAYOUT (recovered from the ctor stores and dtor loads at (%rbx) / (%rdi)):
//   +0x00  delegate  FFDestVideo* (id, retained; owning strong ref; nil if the target did not
//                    conform to FFDestVideoSuspendRequestInfoRecalcProtocol)
// Total sizeof = 8 bytes.  (Only one qword slot is written by the ctor and read by the dtors.)
//
// CONFORMS-TO-PROTOCOL GATE — precise semantics recovered from the asm:
//   Ctor:  this->delegate = nil;                                                                  // movq $0x0,(%rdi) @0xd422cd
//          if ([target conformsToProtocol: @protocol(FFDestVideoSuspendRequestInfoRecalcProtocol)]){
//              this->delegate = objc_retain(target);                                              // callq *stub @0xd422f2
//              [this->delegate suspendRequestInfoRecalc];                                         // jmpq  *stub @0xd42309 (TAIL)
//          }
//          // else: return with this->delegate still nil.
//   Dtor:  id d = this->delegate;
//          if (d) {
//              [d resumeRequestInfoRecalc];                                                       // callq *stub @0xd42338 / 0xd42378
//              objc_release(d);                                                                   // callq *stub @0xd42341 / 0xd42381
//              this->delegate = nil;                                                              // movq $0x0,(%rbx) @0xd42347 / 0xd42387
//          }
// The protocol reference is loaded from the __objc_protorefs slot
// __OBJC_PROTOCOL_REFERENCE_$_FFDestVideoSuspendRequestInfoRecalcProtocol (RIP-relative at
// 0xd422d4 in the ctor) and passed as the 3rd arg (rdx) to
// -[NSObject conformsToProtocol:] (selref @VA 0x1bbb5c8 -> "conformsToProtocol:").
//
// SELECTORS (resolved from selref VAs -> __objc_methname cstrings in /tmp/Flexo.x86_64):
//   VA 0x1bbb5c8 -> "conformsToProtocol:"      (ctor gate, @0xd422db)
//   VA 0x1bf1740 -> "suspendRequestInfoRecalc" (ctor tail, @0xd422fb)
//   VA 0x1bf1748 -> "resumeRequestInfoRecalc"  (D2 @0xd42331, D1 @0xd42371)
//
// Exception path: both dtors have an unwind landing pad at 0xd42355 (D2) / 0xd42395 (D1) that
// calls ___clang_call_terminate — i.e. if -resumeRequestInfoRecalc throws, the process aborts
// (noexcept dtor convention). We surface that by letting any throw propagate out of dispose();
// the JS host has no ___clang_call_terminate equivalent to emulate faithfully.

// ── Opaque forward types (Objective-C runtime classes / Flexo internals on the frontier) ─────
// FFDestVideo is a Flexo Objective-C class; from TypeScript we can only model it as an opaque
// pointer-typed handle. FFDestVideoSuspendRequestInfoRecalcProtocol is an @protocol declared in
// the same framework — same treatment. objc_retain / objc_release are the ARC runtime primitives
// that would balance the reference count in the real binary. Since the JS host has no Objective-C
// runtime, they are throwing stubs (Rule 3): any code path that actually reaches this class must
// supply concrete implementations.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFDestVideo {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFDestVideoSuspendRequestInfoRecalcProtocol {}

// ── Objective-C protocol reference (frontier). ────────────────────────────────
// Loaded RIP-relative at 0xd422d4 from __OBJC_PROTOCOL_REFERENCE_$_FFDestVideoSuspendRequestInfoRecalcProtocol.
// In the running binary this is a `Protocol *` pointer bound at load time by dyld. We expose it as
// a throwing stub — the JS host has no ObjC runtime, so any caller must supply a real handle.
export function OBJC_PROTOCOL_REFERENCE_FFDestVideoSuspendRequestInfoRecalcProtocol(): FFDestVideoSuspendRequestInfoRecalcProtocol {
  // @Flexo __OBJC_PROTOCOL_REFERENCE_$_FFDestVideoSuspendRequestInfoRecalcProtocol (loaded @0xd422d4). not yet transcribed.
  throw new Error(
    "OBJC_PROTOCOL_REFERENCE_$_FFDestVideoSuspendRequestInfoRecalcProtocol (load site @0xd422d4) not yet transcribed",
  );
}

// ── ObjC runtime callees (frontier). Cited call sites in Flexo. ────────────────
// callq *0xbab418(%rip)  @0xd422f2  — dispatched via the lazy stub table (literal pool symbol
// address: _objc_retain). The `*` indicates an indirect call through a GOT/lazy-bind slot.
export function objc_retain(_obj: FFDestVideo): FFDestVideo {
  // @Flexo _objc_retain (called via indirect stub @0xd422f2). not yet transcribed.
  throw new Error("objc_retain (callsite @0xd422f2) not yet transcribed");
}
// callq *0xbab3c1(%rip)  @0xd42341  (D2)  — _objc_release via indirect stub.
// callq *0xbab381(%rip)  @0xd42381  (D1)  — _objc_release via indirect stub.
export function objc_release(_obj: FFDestVideo): void {
  // @Flexo _objc_release (call sites @0xd42341 and @0xd42381). not yet transcribed.
  throw new Error("objc_release (callsites @0xd42341 / @0xd42381) not yet transcribed");
}

// ── Objective-C message sends (frontier). ─────────────────────────────────────
// The FCP binary dispatches these via `callq *0xbab3d5(%rip)` etc., which are all indirect stubs
// resolving to `_objc_msgSend`. We split them by selector so the throwing stubs cite the specific
// call site and selref that were decoded from the asm.

// callq *0xbab3d5(%rip)  @0xd422e5  — _objc_msgSend for selector "conformsToProtocol:"
//   selref VA 0x1bbb5c8 -> __objc_methname "conformsToProtocol:"
// Returns BOOL (only %al is tested at 0xd422eb: `testb %al,%al`).
export function objc_msgSend_conformsToProtocol(
  _receiver: FFDestVideo,
  _protocol: FFDestVideoSuspendRequestInfoRecalcProtocol,
): boolean {
  // @Flexo _objc_msgSend (callsite @0xd422e5, selref @VA 0x1bbb5c8 = "conformsToProtocol:"). not yet transcribed.
  throw new Error(
    'objc_msgSend[-conformsToProtocol:] (callsite @0xd422e5, selref @0x1bbb5c8) not yet transcribed',
  );
}

// jmpq *0xbab3b1(%rip)  @0xd42309  — TAIL-called _objc_msgSend for "suspendRequestInfoRecalc"
//   selref VA 0x1bf1740 -> __objc_methname "suspendRequestInfoRecalc"
// Zero-arg selector; return value is discarded (tail-called into the delegate).
export function objc_msgSend_suspendRequestInfoRecalc(_receiver: FFDestVideo): void {
  // @Flexo _objc_msgSend (callsite @0xd42309 [tail], selref @VA 0x1bf1740 = "suspendRequestInfoRecalc"). not yet transcribed.
  throw new Error(
    'objc_msgSend[-suspendRequestInfoRecalc] (callsite @0xd42309, selref @0x1bf1740) not yet transcribed',
  );
}

// callq *0xbab382(%rip)  @0xd42338  (D2)  — _objc_msgSend for "resumeRequestInfoRecalc"
// callq *0xbab342(%rip)  @0xd42378  (D1)  — _objc_msgSend for "resumeRequestInfoRecalc"
//   selref VA 0x1bf1748 -> __objc_methname "resumeRequestInfoRecalc"
// Zero-arg selector; return value discarded.
export function objc_msgSend_resumeRequestInfoRecalc(_receiver: FFDestVideo): void {
  // @Flexo _objc_msgSend (callsites @0xd42338 [D2] / @0xd42378 [D1], selref @VA 0x1bf1748 = "resumeRequestInfoRecalc"). not yet transcribed.
  throw new Error(
    'objc_msgSend[-resumeRequestInfoRecalc] (callsites @0xd42338 / @0xd42378, selref @0x1bf1748) not yet transcribed',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FFDestVideoSuspendRequestInfoRecalculation — RAII scope guard.
//
// C++ usage in FCP is stack-scoped (`{ FFDestVideoSuspendRequestInfoRecalculation g(dv); ... }`).
// TypeScript has no destructor; the faithful equivalent is a manual `dispose()` (called via
// try/finally or the `using` declaration) that runs the exact ~ctor body. We do NOT auto-run it
// in a finalizer — that would be a semantic invention (GC timing ≠ scope exit).
// ─────────────────────────────────────────────────────────────────────────────
export class FFDestVideoSuspendRequestInfoRecalculation {
  /**
   * +0x00  delegate — retained FFDestVideo* installed by the ctor at (%rbx).
   * `null` when the ctor's -conformsToProtocol: gate returned false, in which case the dtor is
   * a no-op past the null-check.
   */
  delegate: FFDestVideo | null;

  /**
   * FFDestVideoSuspendRequestInfoRecalculation::FFDestVideoSuspendRequestInfoRecalculation(FFDestVideo*)
   * @Flexo 0x00000000d422c0  (C1 aliased to C2 at the same address).
   *
   * Disassembly (verbatim, 0xd422c0..0xd42313):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx           // frame + save %r14,%rbx
   *   movq  %rsi,%r14                                                 // r14 = destVideo (arg1)
   *   movq  %rdi,%rbx                                                 // rbx = this
   *   movq  $0x0,(%rdi)                                               // this->delegate = nil (+0x00)
   *   movq  __OBJC_PROTOCOL_REFERENCE_$_FFDestVideoSuspendRequestInfoRecalcProtocol(%rip),%rdx
   *   movq  0xe792e6(%rip),%rsi   ## selref -> "conformsToProtocol:"
   *   movq  %r14,%rdi
   *   callq *0xbab3d5(%rip)       ## _objc_msgSend  (BOOL)[destVideo conformsToProtocol:@protocol(...)]
   *   testb %al,%al
   *   je    0xd4230f                                                   // if !conforms -> epilogue
   *   movq  %r14,%rdi
   *   callq *0xbab418(%rip)       ## _objc_retain(destVideo)
   *   movq  %rax,(%rbx)                                               // this->delegate = rax   (+0x00)
   *   movq  0xeaf43e(%rip),%rsi   ## selref -> "suspendRequestInfoRecalc"
   *   movq  %rax,%rdi                                                 // rdi = this->delegate
   *   popq  %rbx ; popq %r14 ; popq %rbp                              // epilogue (tail-call restore)
   *   jmpq  *0xbab3b1(%rip)       ## _objc_msgSend  [delegate suspendRequestInfoRecalc]  (TAIL)
   *   // no-conform branch:
   *   0xd4230f: popq %rbx ; popq %r14 ; popq %rbp ; retq
   */
  constructor(destVideo: FFDestVideo) {
    // 0xd422cd : this->delegate = nil
    this.delegate = null;
    // 0xd422d4..0xd422e5 : rdx = @protocol(FFDestVideoSuspendRequestInfoRecalcProtocol);
    //                      rax = [destVideo conformsToProtocol:rdx]
    const conforms = objc_msgSend_conformsToProtocol(
      destVideo,
      OBJC_PROTOCOL_REFERENCE_FFDestVideoSuspendRequestInfoRecalcProtocol(),
    );
    // 0xd422eb..0xd422ed : testb %al,%al ; je 0xd4230f
    if (!conforms) {
      // 0xd4230f: fall through to epilogue with this->delegate still nil.
      return;
    }
    // 0xd422f2 + 0xd422f8 : this->delegate = objc_retain(destVideo)
    this.delegate = objc_retain(destVideo);
    // 0xd422fb..0xd42309 : TAIL `jmpq _objc_msgSend` -> [this->delegate suspendRequestInfoRecalc]
    objc_msgSend_suspendRequestInfoRecalc(this.delegate);
  }

  /**
   * FFDestVideoSuspendRequestInfoRecalculation::~FFDestVideoSuspendRequestInfoRecalculation()
   * Faithful transcription of BOTH the D2 body @0x00000000d42320 and the D1 body @0x00000000d42360 —
   * they are byte-identical modulo the different RIP offsets used to reach the selref for
   * "resumeRequestInfoRecalc" (D2: 0xeaf410(%rip) ; D1: 0xeaf3d0(%rip) — both resolve to the same
   * selref VA 0x1bf1748) and the indirect-stub slot for _objc_msgSend/_objc_release.
   * TypeScript has one class dtor equivalent, so we expose ONE dispose() method that reproduces
   * the shared body.
   *
   * Disassembly (verbatim, D1 at 0xd42360..0xd42394; D2 mirror at 0xd42320..0xd42354):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax     // frame + save %rbx (this)
   *   movq  %rdi,%rbx                                           // rbx = this
   *   movq  (%rdi),%rdi                                         // rdi = this->delegate
   *   testq %rdi,%rdi
   *   je    0xd4238e                                            // if !delegate -> epilogue
   *   movq  0xeaf3d0(%rip),%rsi     ## selref -> "resumeRequestInfoRecalc"
   *   callq *0xbab342(%rip)         ## _objc_msgSend  [delegate resumeRequestInfoRecalc]
   *   movq  (%rbx),%rdi                                         // rdi = this->delegate (re-read)
   *   callq *0xbab381(%rip)         ## _objc_release(delegate)
   *   movq  $0x0,(%rbx)                                         // this->delegate = nil
   *   0xd4238e: addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   // unwind landing pad @0xd42395:
   *   movq  %rax,%rdi ; callq ___clang_call_terminate           // noexcept: abort on msgSend throw
   */
  dispose(): void {
    // 0xd42369 / 0xd42329 : d = this->delegate ; testq d,d ; je epilogue
    const d = this.delegate;
    if (d === null) return;
    // 0xd42371..0xd42378 / 0xd42331..0xd42338 : [d resumeRequestInfoRecalc]
    objc_msgSend_resumeRequestInfoRecalc(d);
    // 0xd4237e..0xd42381 / 0xd4233e..0xd42341 : rdi = this->delegate (RE-READ from (%rbx) after
    // msgSend) ; objc_release(rdi)
    // The FCP asm re-reads (%rbx) here instead of reusing the already-in-%rdi value — faithful
    // transcription preserves that (in the ObjC runtime the value cannot change under a well-
    // behaved -resumeRequestInfoRecalc, but the compiler emitted a reload and we honor it).
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    objc_release(this.delegate!);
    // 0xd42387 / 0xd42347 : this->delegate = nil
    this.delegate = null;
  }
}
