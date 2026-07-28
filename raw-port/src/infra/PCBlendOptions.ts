// PCBlendOptions.ts — Ozone's PCBlendOptions, an options record derived
// (via multiple inheritance) from BOTH a primary base whose vtable is at
// __ZTV14PCBlendOptions +0x18 AND a secondary PCShared_base subobject
// whose vtable is at __ZTV14PCBlendOptions +0x48 (rewritten by these
// dtors to __ZTV13PCShared_base +0x10 to reinstall the base's vtable
// before the base subobject's teardown). Only the two Itanium-ABI
// destructor bodies (D1/D0) are emitted in ProCore for this class in
// the FCP binary.
//
// Source disassembly:  raw-port/re/disasm/Ozone.PCBlendOptions.dtors.s
// Framework: Final Cut Pro / Ozone.framework.
//
// Ozone symbols transcribed:
//   @0xacc10  PCBlendOptions::~PCBlendOptions()   (D1 — non-deleting / base subobject)
//   @0xacc70  PCBlendOptions::~PCBlendOptions()   (D0 — deleting)
//
// STRUCT LAYOUT (recovered from both dtors — every offset is a byte
// offset read directly out of the assembly):
//   +0x00  vptr_primary : *const void            // primary vtable slot
//                                                //   D1 @0xacc19..@0xacc24, D0 @0xacc79..@0xacc84
//                                                //   Written to `__ZTV14PCBlendOptions + 0x18`
//                                                //   (i.e. vtable-symbol base + 0x18 header).
//   +0x08..+0x17  ... unpinned base-subobject bytes (NOT touched by these
//                                                    two dtors — frontier).
//   +0x18  PCSharedCount base subobject          // D1 @0xacc2f..@0xacc33, D0 @0xacc8f..@0xacc93
//                                                //   `addq $0x18, %rdi ; callq __ZN13PCSharedCountD1Ev`
//                                                //   — invokes PCSharedCount::~PCSharedCount() D1
//                                                //   on the +0x18 embedded subobject.
//   +0x20  vptr_secondary : *const void          // secondary vtable slot for PCShared_base subobject
//                                                //   D1 @0xacc27..@0xacc2b writes `__ZTV14PCBlendOptions + 0x48`
//                                                //   FIRST (setting the derived-class secondary vptr,
//                                                //   Itanium-ABI prologue for the derived dtor).
//                                                //   D1 @0xacc38..@0xacc43 then REWRITES it to
//                                                //   `__ZTV13PCShared_base + 0x10` (installing the
//                                                //   base-class vptr just before the base subobject
//                                                //   is destroyed — standard C++ ABI dtor sequencing).
//                                                //   D0 mirrors this at @0xacc87..@0xacc8b and
//                                                //   @0xacc98..@0xacca3.
//   +0x28  spCountedBasePtr : PC_Sp_counted_base*  // D1 @0xacc47..@0xacc50, D0 @0xacca7..@0xaccb0
//                                                  //   `movq 0x28(%rbx), %rdi ; testq %rdi,%rdi ;
//                                                  //    je +7 ; callq __ZN18PC_Sp_counted_base12weak_releaseEv`
//                                                  //   Load the counted-base pointer and, if non-NULL,
//                                                  //   issue weak_release. Guarded by a NULL check.
//
// The dtors DO invoke a base-class subobject destructor (PCSharedCount at
// +0x18) but do NOT invoke a "PCBlendOptions primary base" dtor —
// consistent with a trivially destructible primary base (or a base
// contained entirely in bytes +0x00..+0x17 with no owned resources).
//
// EXCEPTION HANDLING. Both dtors end with a landing pad at
// @0xacc5c/@0xaccc3 that calls `__clang_call_terminate` on unwind —
// standard clang C++ hardening: destructors must not throw. If
// PCSharedCount::~PCSharedCount() or PC_Sp_counted_base::weak_release()
// throws while we're already unwinding, terminate. TS has no direct
// equivalent; in this port a throw from the stubs propagates naturally.
//
// D0 additionally tail-jmps to `operator delete(this)` @Ozone stub 0x6dfc36
// (`_ZdlPv`) at @0xaccbe.
//
// Non-tv0 thunk aliases:
//   @0xaccd0  __ZTv0_n24_N14PCBlendOptionsD1Ev  (virtual-thunk to D1)
//   @0xacd40  __ZTv0_n24_N14PCBlendOptionsD0Ev  (virtual-thunk to D0)
// These are NOT part of the queued 2-method transcription; they thunk
// through slot -0x18 in a secondary-vtable-derived object back to the
// primary D1/D0 above. Documenting for completeness; a future port that
// requires them can add them.
//
// ── Frontier: undecoded companion classes & runtime hooks ───────────────
// PCShared_base — already ported at raw-port/src/infra/PCShared_base.ts.
// The vtable symbol __ZTV13PCShared_base referenced by the +0x20 rewrite
// is the same vtable that PCShared_base's own ctor installs. We reuse
// PCShared_base's vtable-install symbolically here.

/** `PCSharedCount::~PCSharedCount()` (D1) @Ozone stub 0x6ddaee
 *  (`__ZN13PCSharedCountD1Ev`). Called from D1 @0xacc33 and D0 @0xacc93
 *  on `this + 0x18` (the embedded PCSharedCount subobject). Undecoded
 *  here — the PCSharedCount port pins the field layout. */
function PCSharedCount_dtor_stub(_p: unknown): void {
  throw new Error(
    "PCSharedCount::~PCSharedCount() D1 @Ozone stub 0x6ddaee " +
      "(__ZN13PCSharedCountD1Ev) not yet transcribed — called from " +
      "PCBlendOptions D1 @0xacc33 and D0 @0xacc93 on the +0x18 " +
      "embedded PCSharedCount subobject.",
  );
}

/** `PC_Sp_counted_base::weak_release()` @Ozone stub 0x6de4fc
 *  (`__ZN18PC_Sp_counted_base12weak_releaseEv`). Called from D1 @0xacc50
 *  and D0 @0xaccb0, in each case only when `this->+0x28` is non-NULL.
 *  Undecoded here. */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone stub 0x6de4fc " +
      "(__ZN18PC_Sp_counted_base12weak_releaseEv) not yet transcribed",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) @Ozone stub 0x6dfc36.
 *  Tail-jmp target from the deleting destructor D0 @0xaccbe. Modeled as
 *  a no-op in a GC'd runtime, but expressed here so the control flow
 *  matches the disasm exactly. */
function operator_delete_stub(_self: PCBlendOptions): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0xaccbe (`jmp 0x6dfc36  ## symbol stub for: __ZdlPv`).
}

// ── Vtable install-value symbolic tags ─────────────────────────────────
// The two writes at +0x00 and +0x20 store the ADDRESS of a slot within a
// vtable symbol (Itanium ABI). We keep them as opaque tagged strings so
// the "which vtable is currently installed" side-effect is observable
// from TS without pretending to model the runtime pointer values.
//
//   VPTR_PRIMARY_DERIVED = __ZTV14PCBlendOptions + 0x18
//     Written by D1 @0xacc24 / D0 @0xacc84  → the derived-class primary
//     vtable's first virtual-slot address. (Standard Itanium ABI: the
//     +0x10 header holds offset-to-top + typeinfo; the actual vptr the
//     runtime writes is the address of the first virtual slot at +0x10
//     for a single-inheritance vtable, or +0x18/+... for multi-inheritance
//     with a secondary vtable region. PCBlendOptions is multi-inheritance:
//     primary at +0x18, secondary at +0x48 within the same __ZTV symbol.)
//
//   VPTR_SECONDARY_DERIVED = __ZTV14PCBlendOptions + 0x48
//     Written by D1 @0xacc2b / D0 @0xacc8b  → the derived-class secondary
//     vtable's first virtual-slot address.
//
//   VPTR_SECONDARY_BASE = __ZTV13PCShared_base + 0x10
//     Written by D1 @0xacc43 / D0 @0xacca3  → the base-class (PCShared_base)
//     vtable's first virtual-slot address, i.e. the "installed vptr" that
//     PCShared_base's own ctor would produce.
const VPTR_PRIMARY_DERIVED = "__ZTV14PCBlendOptions+0x18";
const VPTR_SECONDARY_DERIVED = "__ZTV14PCBlendOptions+0x48";
const VPTR_SECONDARY_BASE = "__ZTV13PCShared_base+0x10";

// ── The class ──────────────────────────────────────────────────────────

/** `PCBlendOptions` — Ozone options record with multiple-inheritance
 *  layout. Only the destructor pair is recovered from the framework's
 *  symbol table. */
export class PCBlendOptions {
  /** +0x00 vptr_primary — primary vtable slot. Written by both dtors on
   *  entry (Itanium ABI: reinstall derived vptr before running teardown). */
  vptr_primary: string = "";

  /** +0x18 pcSharedCount — embedded PCSharedCount subobject. Its D1 dtor
   *  is invoked on `this + 0x18` by both dtors. Modeled as `unknown` so
   *  downstream code sees an opaque handle. */
  pcSharedCount_at_0x18: unknown = null;

  /** +0x20 vptr_secondary — secondary vtable slot for the PCShared_base
   *  subobject. Written TWICE by each dtor: first to the derived-class
   *  secondary vptr (Itanium ABI reinstall), then rewritten to the base
   *  PCShared_base vptr just before the base subobject teardown. */
  vptr_secondary: string = "";

  /** +0x28 spCountedBasePtr — nullable `PC_Sp_counted_base*`. If non-NULL
   *  at destruction, `weak_release` is invoked on it. Modeled as
   *  `unknown`; NULL is `null`. */
  spCountedBasePtr: unknown = null;

  /**
   * `PCBlendOptions::~PCBlendOptions()` @Ozone 0xacc10 (D1, non-deleting
   * / base-subobject dtor).
   *
   * Body (all @Ozone):
   *   0xacc10  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0xacc16  movq  %rdi, %rbx                                   ; rbx = this
   *   0xacc19  leaq  __ZTV14PCBlendOptions(%rip), %rax            ; rax = &vtable
   *   0xacc20  leaq  0x18(%rax), %rcx                             ; rcx = installed primary vptr
   *   0xacc24  movq  %rcx, (%rdi)                                 ; this->+0x00 = primary vptr
   *   0xacc27  addq  $0x48, %rax                                  ; rax = &vtable + 0x48
   *   0xacc2b  movq  %rax, 0x20(%rdi)                             ; this->+0x20 = secondary vptr (derived)
   *   0xacc2f  addq  $0x18, %rdi                                  ; rdi = this + 0x18
   *   0xacc33  callq __ZN13PCSharedCountD1Ev                      ; PCSharedCount::~PCSharedCount() D1
   *   0xacc38  leaq  __ZTV13PCShared_base(%rip), %rax             ; rax = &PCShared_base vtable
   *   0xacc3f  addq  $0x10, %rax                                  ; rax = installed base vptr
   *   0xacc43  movq  %rax, 0x20(%rbx)                             ; this->+0x20 = base vptr (rewrite!)
   *   0xacc47  movq  0x28(%rbx), %rdi                             ; rdi = this->+0x28 spCountedBasePtr
   *   0xacc4b  testq %rdi, %rdi
   *   0xacc4e  je    0xacc55                                      ; if (rdi == NULL) skip
   *   0xacc50  callq __ZN18PC_Sp_counted_base12weak_releaseEv     ; weak_release(spCountedBasePtr)
   *   0xacc55  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   *
   * Cleanup landing pad @0xacc5c..@0xacc5f calls `__clang_call_terminate`
   * on unwind (i.e. if a destructor callee throws — undefined behaviour
   * in C++ dtors, so we abort). */
  destroy_D1(): void {
    // @0xacc19..@0xacc24: install derived primary vptr at +0x00.
    this.vptr_primary = VPTR_PRIMARY_DERIVED;
    // @0xacc27..@0xacc2b: install derived secondary vptr at +0x20.
    this.vptr_secondary = VPTR_SECONDARY_DERIVED;
    // @0xacc33: run PCSharedCount::~PCSharedCount() D1 on the +0x18 subobject.
    PCSharedCount_dtor_stub(this.pcSharedCount_at_0x18);
    // @0xacc38..@0xacc43: rewrite +0x20 to PCShared_base's installed vptr.
    this.vptr_secondary = VPTR_SECONDARY_BASE;
    // @0xacc47..@0xacc50: NULL-guarded weak_release on +0x28.
    const p = this.spCountedBasePtr;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
  }

  /**
   * `PCBlendOptions::~PCBlendOptions()` @Ozone 0xacc70 (D0, deleting
   * dtor). Identical body to D1 above, plus a tail-jmp to
   * `operator delete(this)`.
   *
   * Body (all @Ozone):
   *   0xacc70  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0xacc76  movq  %rdi, %rbx                                   ; rbx = this
   *   0xacc79  leaq  __ZTV14PCBlendOptions(%rip), %rax            ; rax = &vtable
   *   0xacc80  leaq  0x18(%rax), %rcx                             ; rcx = installed primary vptr
   *   0xacc84  movq  %rcx, (%rdi)                                 ; this->+0x00 = primary vptr
   *   0xacc87  addq  $0x48, %rax                                  ; rax = &vtable + 0x48
   *   0xacc8b  movq  %rax, 0x20(%rdi)                             ; this->+0x20 = secondary vptr (derived)
   *   0xacc8f  addq  $0x18, %rdi                                  ; rdi = this + 0x18
   *   0xacc93  callq __ZN13PCSharedCountD1Ev                      ; PCSharedCount::~PCSharedCount() D1
   *   0xacc98  leaq  __ZTV13PCShared_base(%rip), %rax             ; rax = &PCShared_base vtable
   *   0xacc9f  addq  $0x10, %rax                                  ; rax = installed base vptr
   *   0xacca3  movq  %rax, 0x20(%rbx)                             ; this->+0x20 = base vptr (rewrite!)
   *   0xacca7  movq  0x28(%rbx), %rdi                             ; rdi = this->+0x28
   *   0xaccab  testq %rdi, %rdi / je 0xaccb5
   *   0xaccb0  callq __ZN18PC_Sp_counted_base12weak_releaseEv     ; weak_release(spCountedBasePtr)
   *   0xaccb5  movq  %rbx, %rdi                                   ; rdi = this
   *   0xaccb8  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   0xaccbe  jmp   0x6dfc36                                     ; tail-jmp operator delete(this)
   *
   * Cleanup landing pad @0xaccc3..@0xaccc6 calls `__clang_call_terminate`
   * on unwind. */
  destroy_D0(): void {
    // Same body as D1:
    this.vptr_primary = VPTR_PRIMARY_DERIVED;
    this.vptr_secondary = VPTR_SECONDARY_DERIVED;
    PCSharedCount_dtor_stub(this.pcSharedCount_at_0x18);
    this.vptr_secondary = VPTR_SECONDARY_BASE;
    const p = this.spCountedBasePtr;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0xaccbe: tail-jmp to operator delete(this).
    operator_delete_stub(this);
  }
}
