// HGMetalCommandBufferRef.ts — Helium's ARC-holder for a Metal command
// buffer plus instrumentation-wrapped wait vfns. Structurally identical to
// the many other "ObjC pointer holder" wrappers in Helium: the whole class
// is 8 bytes wide (a single retained `id<MTLCommandBuffer>` at offset 0x0);
// the ctor takes an unretained MTLCommandBuffer-typed handle, stores it,
// and calls `_objc_retain`; the dtor calls `_objc_release` and clears the
// slot. The two wait vfns forward the corresponding ObjC selectors on the
// stored handle, but wrap them in an HGTraceGuard scope and a pair of
// `_kdebug_trace` calls that flank the underlying `objc_msgSend`.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice at file
//             offset 0x4000 + text VA).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.C2E22HGMTLCommandBufferType.s      @0x1d5330
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.C1E22HGMTLCommandBufferType.s      @0x1d5350
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.D2Ev.s                             @0x1d5370
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.D1Ev.s                             @0x1d53a0
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.18waitUntilScheduledEv.s           @0x1d53d0
//   raw-port/re/disasm/Helium.HGMetalCommandBufferRef.18waitUntilCompletedEv.s           @0x1d5480
//
// STRUCT LAYOUT (recovered from C2/D2 which both index only *(this+0x0)):
//   HGMetalCommandBufferRef {
//     +0x000  id<MTLCommandBuffer>  (retained; set by C2 @0x1d5334, released
//                                    and nulled by D1/D2 @0x1d537c/@0x1d5382
//                                    and @0x1d53ac/@0x1d53b2)
//   }
// No vtable — this class has no virtual functions. C2 does not write a vptr
// slot; the ObjC-holder pattern here is a plain POD wrapper.
//
// The "HGMTLCommandBufferType" mangling on the ctor parameter (`22HGMTL...`)
// is Helium's typedef for the underlying MTLCommandBuffer id; the argument
// is passed as %rsi in the SysV ABI and stored verbatim into *(this+0).
//
// ─── C2 @Helium 0x1d5330 (base-object ctor) ─────────────────────────────────
//   Arguments: %rdi = this, %rsi = raw MTLCommandBuffer id
//   __ZN23HGMetalCommandBufferRefC2E22HGMTLCommandBufferType:
//     0x1d5330 pushq %rbp / movq %rsp,%rbp
//     0x1d5334 movq  %rsi, (%rdi)                ; this->buffer = raw
//     0x1d5337 movq  %rsi, %rdi                  ; arg1 = raw for retain
//     0x1d533a popq  %rbp
//     0x1d533b jmpq  *0x82ce87(%rip)             ; tail-jmp to _objc_retain
//                                                ; (via __DATA_CONST GOT slot
//                                                ;  0x1d5341 + 0x82ce87
//                                                ;  = 0xa021c8 — the lazy
//                                                ;  binding entry for
//                                                ;  __ZL13_objc_retain / rept
//                                                ;  _objc_retain stub).
//
//   Semantics: install the raw id into slot 0, then retain it. Because the
//   jmp is a tail call, the return value of _objc_retain (the retained id)
//   propagates to the caller; per the Itanium ABI a ctor's return value is
//   unused, so this is safe. In TS we split the two ops: store, then call
//   through the throwing objc_retain frontier.
//
// ─── C1 @Helium 0x1d5350 (complete-object ctor) ─────────────────────────────
//   __ZN23HGMetalCommandBufferRefC1E22HGMTLCommandBufferType:
//     0x1d5350 pushq %rbp / movq %rsp,%rbp
//     0x1d5354 movq  %rsi, (%rdi)                ; identical body
//     0x1d5357 movq  %rsi, %rdi
//     0x1d535a popq  %rbp
//     0x1d535b jmpq  *0x82ce67(%rip)             ; tail-jmp to _objc_retain
//
//   Note: C1 and C2 are *literally* the same instructions with the sole
//   difference being the RIP delta in the final `jmpq *0x82ce??(%rip)` (the
//   PC differs by 32 bytes, so the same __DATA_CONST slot 0xa021c8 is
//   reached via a smaller displacement). This is normal Itanium C1/C2
//   aliasing — a class with no virtual bases has identical bodies.
//
// ─── D2 @Helium 0x1d5370 (base-object dtor) ─────────────────────────────────
//   Arguments: %rdi = this
//   __ZN23HGMetalCommandBufferRefD2Ev:
//     0x1d5370 pushq %rbp/rsp/rbx/rax
//     0x1d5376 movq  %rdi, %rbx                  ; save this
//     0x1d5379 movq  (%rdi), %rdi                ; arg1 = this->buffer
//     0x1d537c callq *0x82ce3e(%rip)             ; _objc_release
//     0x1d5382 movq  $0x0, (%rbx)                ; this->buffer = null
//     0x1d5389..0x1d538f  epilogue / retq
//     0x1d5390..0x1d5398  exception landing pad: __clang_call_terminate
//
// ─── D1 @Helium 0x1d53a0 (complete-object dtor) ─────────────────────────────
//   Byte-identical body to D2 (only the RIP delta differs on the
//   `callq *0x82ce??(%rip)` for _objc_release). Same behavior; both
//   entry points map to the same release-and-null semantics.
//
// ─── waitUntilScheduled @Helium 0x1d53d0 ────────────────────────────────────
//   __ZN23HGMetalCommandBufferRef18waitUntilScheduledEv:
//     0x1d53d0 pushq %rbp / movq %rsp,%rbp / pushq %rbx / subq $0x18,%rsp
//     0x1d53d9 movq  %rdi, %rbx                       ; save this
//     0x1d53dc leaq  0x72158b(%rip), %rsi             ; %rsi = "gpu"
//     0x1d53e3 leaq  0x721588(%rip), %rcx             ; %rcx = "HGMetalCommandBufferRef::waitUntilScheduled"
//     0x1d53ea leaq  -0x20(%rbp), %rdi                ; %rdi = &guard (32-byte stack slot)
//     0x1d53ee movl  $0x1, %edx                       ; %edx = level = 1
//     0x1d53f3 callq __ZN12HGTraceGuardC1EPKciS1_     ; HGTraceGuard::HGTraceGuard("gpu", 1, "...::waitUntilScheduled")
//     0x1d53f8 movl  $0x1220, -0xc(%rbp)              ; SignPost EventScopeGuard tag = 0x1220 (undecoded)
//     0x1d53ff movl  $0x2b794880, %edi                ; kdebug code = 0x2b794880 (enter)
//     0x1d5404 xor edi..r8d                            ; args 2..5 = 0
//     0x1d540d callq _kdebug_trace                    ; enter probe
//     0x1d5412 movq  (%rbx), %rdi                     ; arg1 = self->buffer
//     0x1d5415 movq  0x885f0c(%rip), %rsi             ; %rsi = @selector(waitUntilScheduled)
//     0x1d541c callq *0x82cd96(%rip)                  ; objc_msgSend
//     0x1d5422 movl  $0x2b794884, %edi                ; kdebug code = 0x2b794884 (exit)
//     0x1d5427 xor edi..r8d                            ; args 2..5 = 0
//     0x1d5430 callq _kdebug_trace                    ; exit probe
//     0x1d5435 leaq  -0x20(%rbp), %rdi                ; &guard
//     0x1d5439 callq __ZN12HGTraceGuardD1Ev           ; ~HGTraceGuard
//     0x1d543e add $0x18,%rsp / pop rbx/rbp / retq
//     0x1d5445..0x1d547e  exception landing pads
//
//   The kdebug codes 0x2b794880 (enter) and 0x2b794884 (exit) differ by 4
//   (the DBG_FUNC_END bit-flip); this is the standard Darwin kdebug
//   START/END pairing. The 0x1220 stored to -0xc(%rbp) is the SignPost
//   scope tag that a stack-allocated `HGSignPost::EventScopeGuard` reads
//   during unwind cleanup at 0x1d5450 (only reached on exception).
//
//   Semantics: brackets the underlying `[buffer waitUntilScheduled]` with
//   a Helium HGTraceGuard log-and-time scope and Darwin kdebug enter/exit
//   probes. The wait call itself is a plain ObjC method send on the
//   retained MTLCommandBuffer id.
//
// ─── waitUntilCompleted @Helium 0x1d5480 ────────────────────────────────────
//   __ZN23HGMetalCommandBufferRef18waitUntilCompletedEv:
//     0x1d5480 pushq %rbp / movq %rsp,%rbp / pushq %rbx / subq $0x18,%rsp
//     0x1d5489 movq  %rdi, %rbx
//     0x1d548c leaq  0x7214db(%rip), %rsi             ; %rsi = "gpu"
//     0x1d5493 leaq  0x721504(%rip), %rcx             ; %rcx = "HGMetalCommandBufferRef::waitUntilCompleted"
//     0x1d549a leaq  -0x20(%rbp), %rdi
//     0x1d549e movl  $0x1, %edx                       ; level = 1
//     0x1d54a3 callq HGTraceGuard::C1
//     0x1d54a8 movl  $0x1222, -0xc(%rbp)              ; SignPost tag = 0x1222
//     0x1d54af movl  $0x2b794888, %edi                ; kdebug enter = 0x2b794888
//     0x1d54b4 xor .. / callq _kdebug_trace
//     0x1d54c2 movq  (%rbx), %rdi                     ; self->buffer
//     0x1d54c5 movq  0x885a94(%rip), %rsi             ; @selector(waitUntilCompleted)
//     0x1d54cc callq *0x82cce6(%rip)                  ; objc_msgSend
//     0x1d54d2 movl  $0x2b79488c, %edi                ; kdebug exit  = 0x2b79488c
//     0x1d54d7 xor .. / callq _kdebug_trace
//     0x1d54e5 leaq  -0x20(%rbp), %rdi
//     0x1d54e9 callq ~HGTraceGuard
//     0x1d54ee add $0x18,%rsp / pop rbx/rbp / retq
//     0x1d54f5..0x1d552e  exception landing pads
//
//   Identical shape to waitUntilScheduled with three distinct constants:
//     SignPost tag              0x1220 -> 0x1222
//     kdebug enter code         0x2b794880 -> 0x2b794888
//     kdebug exit  code         0x2b794884 -> 0x2b79488c
//   (both kdebug codes still differ by 4 = DBG_FUNC_END).
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   _objc_retain                  @0x1d533b jmpq  (C2) / @0x1d535b jmpq (C1)
//   _objc_release                 @0x1d537c callq (D2) / @0x1d53ac callq (D1)
//   _kdebug_trace                 @0x1d540d/@0x1d5430 (scheduled) / @0x1d54bd/@0x1d54e0 (completed)
//   objc_msgSend                  @0x1d541c (waitUntilScheduled) / @0x1d54cc (waitUntilCompleted)
//   HGSignPost::EventScopeGuard::~EventScopeGuard()  @0x1d5454 (unwind only) / @0x1d5504 (unwind only)
//   ___clang_call_terminate       @0x1d5393/@0x1d53c3/@0x1d5448/@0x1d54f8
//   __Unwind_Resume               @0x1d5465/@0x1d5479/@0x1d5515/@0x1d5529
//   HGTraceGuard::HGTraceGuard    @0x1d53f3/@0x1d54a3   — already ported
//                                                         in HGTraceGuard.ts
//   HGTraceGuard::~HGTraceGuard   @0x1d5439/@0x1d54e9   — already ported
//                                                         in HGTraceGuard.ts
//
// Numerics: none. All operations are pointer/id shuffling and integer
// constants. Math.fround is not needed.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGTraceGuard } from "./HGTraceGuard.js";

/**
 * Opaque handle for the underlying `id<MTLCommandBuffer>` — Helium's
 * `HGMTLCommandBufferType` in the mangled ctor argument (the leading
 * `22HGMTL...` is the length prefix; the underlying type is a typedef
 * over Metal's opaque command-buffer ObjC id). Only three operations are
 * performed on it in this class: retain (C2 @0x1d533b), release
 * (D1/D2 @0x1d537c/@0x1d53ac), and `objc_msgSend` for the two wait
 * selectors (@0x1d541c, @0x1d54cc). We brand it here without a structural
 * type; downstream ports of Metal wrappers can share this brand.
 */
export type HGMTLCommandBufferType = {
  readonly __brand: "HGMTLCommandBufferType";
};

/**
 * Frontier: `_objc_retain(id)` — invoked via GOT-indirected
 * `jmpq *0x82ce??(%rip)` tail-call from C2/C1 @0x1d533b/@0x1d535b. Not yet
 * transcribed here (ObjC runtime bridge is out of scope for the raw port).
 * In TS the returned id is bit-identical to the input.
 */
function objc_retain(_id: HGMTLCommandBufferType): HGMTLCommandBufferType {
  // @0x1d533b jmpq *0x82ce87(%rip)  (C2)
  // @0x1d535b jmpq *0x82ce67(%rip)  (C1)
  throw new Error(
    "_objc_retain @Helium @0x1d533b/@0x1d535b not yet transcribed",
  );
}

/**
 * Frontier: `_objc_release(id)` — invoked via GOT-indirected
 * `callq *0x82ce??(%rip)` from D1/D2 @0x1d53ac/@0x1d537c. Not yet transcribed.
 */
function objc_release(_id: HGMTLCommandBufferType | null): void {
  // @0x1d537c callq *0x82ce3e(%rip)  (D2)
  // @0x1d53ac callq *0x82ce0e(%rip)  (D1)
  throw new Error("_objc_release @Helium @0x1d537c/@0x1d53ac not yet transcribed");
}

/**
 * Frontier: Darwin `_kdebug_trace(code, arg1, arg2, arg3, arg4)` — invoked
 * with 4 zero args at @0x1d540d/@0x1d5430 (scheduled) and
 * @0x1d54bd/@0x1d54e0 (completed). The `code` argument encodes the class,
 * subclass, code, and START/END bit per the standard kdebug ABI. Not yet
 * transcribed; on a non-Darwin runtime this is a no-op.
 */
function kdebug_trace(
  _code: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  // @0x1d540d callq _kdebug_trace  (waitUntilScheduled enter, code=0x2b794880)
  // @0x1d5430 callq _kdebug_trace  (waitUntilScheduled exit,  code=0x2b794884)
  // @0x1d54bd callq _kdebug_trace  (waitUntilCompleted enter, code=0x2b794888)
  // @0x1d54e0 callq _kdebug_trace  (waitUntilCompleted exit,  code=0x2b79488c)
  throw new Error(
    "_kdebug_trace @Helium @0x1d540d/@0x1d5430/@0x1d54bd/@0x1d54e0 not yet transcribed",
  );
}

/**
 * Frontier: `objc_msgSend(id, SEL)` — the ObjC runtime dispatch primitive.
 * Called at @0x1d541c with @selector(waitUntilScheduled) and at @0x1d54cc
 * with @selector(waitUntilCompleted). Selector loads come from the
 * `__objc_selrefs` section via RIP-relative loads (@0x1d5415 loads slot
 * 0x885f0c(%rip); @0x1d54c5 loads slot 0x885a94(%rip)); resolving those
 * against `dyld_info -fixups` reveals the two selectors named above.
 * Not yet transcribed.
 */
function objc_msgSend_waitUntilScheduled(
  _target: HGMTLCommandBufferType | null,
): void {
  // @0x1d541c callq *0x82cd96(%rip)  with %rsi = @selector(waitUntilScheduled)
  throw new Error(
    "objc_msgSend @Helium @0x1d541c (waitUntilScheduled) not yet transcribed",
  );
}
function objc_msgSend_waitUntilCompleted(
  _target: HGMTLCommandBufferType | null,
): void {
  // @0x1d54cc callq *0x82cce6(%rip)  with %rsi = @selector(waitUntilCompleted)
  throw new Error(
    "objc_msgSend @Helium @0x1d54cc (waitUntilCompleted) not yet transcribed",
  );
}

/**
 * `HGMetalCommandBufferRef` — Helium's ARC-holding wrapper for a Metal
 * command buffer. Two-slot class (single retained id, no vtable).
 *
 * @Helium symbols owned by this class:
 *   C2                  @0x1d5330   store + retain
 *   C1                  @0x1d5350   identical body to C2
 *   D2                  @0x1d5370   release + null slot
 *   D1                  @0x1d53a0   identical body to D2
 *   waitUntilScheduled  @0x1d53d0   traced ObjC forward
 *   waitUntilCompleted  @0x1d5480   traced ObjC forward
 */
export class HGMetalCommandBufferRef {
  /**
   * The retained MTLCommandBuffer id at offset 0x0.
   * Stored by C2 @0x1d5334; released and nulled by D1/D2 (@0x1d537c/@0x1d5382
   * and @0x1d53ac/@0x1d53b2).
   */
  buffer: HGMTLCommandBufferType | null;

  /**
   * `HGMetalCommandBufferRef::HGMetalCommandBufferRef(HGMTLCommandBufferType)`
   * — @Helium 0x1d5330 (C2) / 0x1d5350 (C1).
   *
   *   @0x1d5334 movq  %rsi, (%rdi)          // this->buffer = raw
   *   @0x1d533b jmp   *_objc_retain          // retain(raw)  (tail-jmp)
   */
  constructor(raw: HGMTLCommandBufferType) {
    // @0x1d5334
    this.buffer = raw;
    // @0x1d533b _objc_retain(raw). Returns the retained id; the tail-jmp
    // discards the return value at the C++ level (ctor returns void), so
    // we ignore it here.
    objc_retain(raw);
  }

  /**
   * `HGMetalCommandBufferRef::~HGMetalCommandBufferRef()` — @Helium 0x1d5370
   * (D2) / 0x1d53a0 (D1).
   *
   *   @0x1d5379 movq (%rdi), %rdi       // arg1 = this->buffer
   *   @0x1d537c callq *_objc_release     // release
   *   @0x1d5382 movq $0x0, (%rbx)       // this->buffer = null
   */
  destroy(): void {
    // @0x1d5379..@0x1d537c
    objc_release(this.buffer);
    // @0x1d5382
    this.buffer = null;
  }

  /**
   * `HGMetalCommandBufferRef::waitUntilScheduled()` — @Helium 0x1d53d0.
   *
   * Brackets `[buffer waitUntilScheduled]` with:
   *   * HGTraceGuard("gpu", level=1, "HGMetalCommandBufferRef::waitUntilScheduled")
   *   * SignPost EventScopeGuard tag 0x1220 (unwind-only cleanup)
   *   * kdebug_trace enter code 0x2b794880 (with 4 zero args)
   *   * kdebug_trace exit  code 0x2b794884 (with 4 zero args)
   *
   * The two kdebug codes differ by 4 = the DBG_FUNC_END bit-flip that pairs
   * an entry probe with its matching exit probe in the Darwin kernel trace.
   */
  waitUntilScheduled(): void {
    // @0x1d53dc..@0x1d53f3  HGTraceGuard guard("gpu", 1, "...::waitUntilScheduled")
    const guard = new HGTraceGuard(
      "gpu",
      1,
      "HGMetalCommandBufferRef::waitUntilScheduled",
    );
    try {
      // @0x1d53f8 store SignPost tag 0x1220 to -0xc(%rbp); the guard object
      //           itself is stack-live but only inspected during exception
      //           unwind at 0x1d5454. Modeling it as a comment-only note.
      // @0x1d53ff..@0x1d540d _kdebug_trace(0x2b794880, 0, 0, 0, 0)
      kdebug_trace(0x2b794880, 0, 0, 0, 0);
      // @0x1d5412..@0x1d541c  [buffer waitUntilScheduled]
      objc_msgSend_waitUntilScheduled(this.buffer);
      // @0x1d5422..@0x1d5430 _kdebug_trace(0x2b794884, 0, 0, 0, 0)
      kdebug_trace(0x2b794884, 0, 0, 0, 0);
    } finally {
      // @0x1d5435..@0x1d5439 ~HGTraceGuard(guard) — runs on both normal and
      //           exception paths in the x86 unwind tables. `finally`
      //           reproduces both paths.
      guard.destroy();
    }
  }

  /**
   * `HGMetalCommandBufferRef::waitUntilCompleted()` — @Helium 0x1d5480.
   *
   * Structurally identical to waitUntilScheduled with three constants
   * changed:
   *   SignPost tag              0x1222  (vs 0x1220)
   *   kdebug enter code         0x2b794888  (vs 0x2b794880)
   *   kdebug exit  code         0x2b79488c  (vs 0x2b794884)
   * Both kdebug codes still differ by 4 (DBG_FUNC_END).
   */
  waitUntilCompleted(): void {
    // @0x1d548c..@0x1d54a3  HGTraceGuard("gpu", 1, "...::waitUntilCompleted")
    const guard = new HGTraceGuard(
      "gpu",
      1,
      "HGMetalCommandBufferRef::waitUntilCompleted",
    );
    try {
      // @0x1d54a8  SignPost tag 0x1222 (unwind-only; comment-only note)
      // @0x1d54af..@0x1d54bd _kdebug_trace(0x2b794888, 0, 0, 0, 0)
      kdebug_trace(0x2b794888, 0, 0, 0, 0);
      // @0x1d54c2..@0x1d54cc  [buffer waitUntilCompleted]
      objc_msgSend_waitUntilCompleted(this.buffer);
      // @0x1d54d2..@0x1d54e0 _kdebug_trace(0x2b79488c, 0, 0, 0, 0)
      kdebug_trace(0x2b79488c, 0, 0, 0, 0);
    } finally {
      // @0x1d54e5..@0x1d54e9 ~HGTraceGuard
      guard.destroy();
    }
  }
}
