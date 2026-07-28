/**
 * HGStackStateGuard — RAII snapshot/restore of an HGExecutionUnit's two-stack + counter state.
 *
 * Transcribed from Helium.framework (macOS x86_64).
 *
 * NATIVE LAYOUT (sizeof == 0x2c bytes, from the ctor's store pattern @0x1440f0-0x14412a):
 *   +0x00  execUnit           HGExecutionUnit*    (this[0] = arg's *(rsi+0x90); see ctor)
 *   +0x08  page0              HGStackPage*        (snapshot of execUnit->*(this-space+0x88))
 *   +0x10  page1              HGStackPage*        (snapshot of execUnit->*(this-space+0x90))
 *   +0x18  page0Top           void* (uintptr)     (snapshot of page0->[0x10])
 *   +0x20  page1Top           void* (uintptr)     (snapshot of page1->[0x10])
 *   +0x28  counter            uint32_t            (snapshot of execUnit->[0x98])
 *
 * NOTE: The ctor takes an HGExecutionUnit* in %rsi and immediately indirects through
 * (execUnitArg+0x90) to reach what is effectively an inner "stack owner" object; that pointer
 * is stored at this[0x00] and is the receiver that the dtor calls rewindStack() on. Every
 * subsequent field-of-field is read off THAT pointer, not the raw arg. See @0x1440f4 and
 * @0x1441e2 (rewindStack call receives this[0x00] in %rdi).
 *
 * CONTRACT: ctor snapshots the execUnit's current two-page stack state; dtor RESTORES the
 * two page pointers + counter (via a movups xmm0 pair-copy back into execUnit[0x88..0x98]),
 * then calls HGExecUnitStack::rewindStack(0, savedPage0) and rewindStack(1, currentPage1)
 * to unwind allocations that occurred inside the guarded scope, and finally repatches each
 * page's current-top pointer (page->[0x10]) by ADDING the saved delta back — mirroring
 * @0x1441fb-0x14420d verbatim.
 *
 * We CANNOT actually run rewindStack from TypeScript — HGExecUnitStack is an FCP-internal
 * heap manager with no port yet. Per PORTING_SPEC Rule 3, calling release() on a guard whose
 * host has not installed a real HGExecutionUnit bridge MUST throw loudly rather than silently
 * no-op (a silent no-op would leak native memory semantics into downstream ports). A host
 * that wires up the execUnit bridge can register a driver via setHGStackStateGuardDriver()
 * to make the guard functional.
 *
 * @classAddr Helium 0x00000000001440b0 (C2), 0x00000000001440f0 (C1),
 *            0x0000000000144130 (D2), 0x00000000001441b0 (D1).
 */

/**
 * Opaque HGStackPage-like handle. Native layout accessed by this class:
 *   +0x10  currentTop : uintptr_t   — the bump-allocator top pointer @0x1441fb,0x1441c1
 *
 * We keep it as a duck-typed slot bag so a host bridge can back it with whatever memory model
 * it likes; the guard only reads/writes the +0x10 field.
 */
export interface HGStackPageLike {
  /** Native +0x10 slot: current allocation top. Read at ctor @0x144114/@0x14411c;
   *  bumped back at dtor @0x144202/@0x14420d. */
  currentTop: number;
}

/**
 * Opaque HGExecutionUnit-like handle. Native layout accessed by this class (via *(rsi+0x90)
 * → the inner stack-owner; all subsequent offsets are on THAT owner):
 *   +0x88  page0     : HGStackPage*   (ctor @0x1440fe; dtor movups @0x1441cc/@0x1441d0)
 *   +0x90  page1     : HGStackPage*   (ctor @0x144109; dtor @0x1441e7)
 *   +0x98  counter   : uint32_t       (ctor @0x144124; dtor @0x1441d7)
 * The receiver passed to HGExecUnitStack::rewindStack is this same inner-owner pointer
 * (i.e. this[0x00] in the guard) — see @0x1441dd (movq %rbx, %rdi).
 */
export interface HGExecutionUnitLike {
  /** Native offset 0x90 on the outer HGExecutionUnit: inner "stack owner" pointer @0x1440f4. */
  stackOwner: HGExecUnitStackLike;
}

/**
 * The "stack owner" side of HGExecutionUnit — receiver of HGExecUnitStack::rewindStack.
 * All offsets below are relative to this owner (i.e. what @0x1440fb stores at this[0x00]).
 */
export interface HGExecUnitStackLike {
  /** +0x88 — HGStackPage* for stack 0. Ctor @0x1440fe. */
  page0: HGStackPageLike;
  /** +0x90 — HGStackPage* for stack 1. Ctor @0x144109. */
  page1: HGStackPageLike;
  /** +0x98 — uint32_t counter. Ctor @0x144124 (movl, so u32). */
  counter: number;
}

/**
 * Host-installable driver. FCP's HGExecUnitStack lives in the framework binary; from TS we
 * only invoke its rewindStack via a host-provided bridge. If none is installed the guard
 * throws on release() — a loud gap per PORTING_SPEC Rule 3 (HGExecUnitStack::rewindStack
 * @0x1441e2 not yet transcribed).
 */
export type HGStackStateGuardDriver = {
  /** Mirrors HGExecUnitStack::rewindStack @0x1441e2 / @0x1441f6. */
  rewindStack(owner: HGExecUnitStackLike, which: number, page: HGStackPageLike): void;
};

let g_driver: HGStackStateGuardDriver | null = null;

/**
 * Install a host-provided driver so the guard's dtor can actually rewind the native stacks.
 * With no driver installed the guard's ctor still snapshots state (pure reads) but release()
 * refuses to run — silently skipping rewindStack would corrupt subsequent allocations.
 */
export function setHGStackStateGuardDriver(d: HGStackStateGuardDriver | null): void {
  g_driver = d;
}

export class HGStackStateGuard {
  // Layout mirrors native +0x00..+0x28 exactly (see LAYOUT block above).
  /** +0x00 execUnit stack-owner ptr @0x1440fb */
  private readonly execUnit: HGExecUnitStackLike;
  /** +0x08 saved page0 @0x144105 */
  private readonly savedPage0: HGStackPageLike;
  /** +0x10 saved page1 @0x144110 */
  private readonly savedPage1: HGStackPageLike;
  /** +0x18 saved page0.currentTop @0x144118 */
  private readonly savedPage0Top: number;
  /** +0x20 saved page1.currentTop @0x144120 */
  private readonly savedPage1Top: number;
  /** +0x28 saved counter (u32) @0x14412a */
  private readonly savedCounter: number;

  /** Whether the dtor has already run — mirrors C++ RAII once-only semantics. */
  private released = false;

  /**
   * HGStackStateGuard::HGStackStateGuard(HGExecutionUnit*) — @0x1440f0 (C1) / @0x1440b0 (C2).
   *
   * Line-by-line transcription of the ctor:
   *   @0x1440f4  movq 0x90(%rsi), %rax        ; rax = execUnitArg->stackOwner
   *   @0x1440fb  movq %rax, (%rdi)            ; this->execUnit = rax
   *   @0x1440fe  movq 0x88(%rax), %rcx        ; rcx = execUnit->page0
   *   @0x144105  movq %rcx, 0x8(%rdi)         ; this->savedPage0 = rcx
   *   @0x144109  movq 0x90(%rax), %rdx        ; rdx = execUnit->page1
   *   @0x144110  movq %rdx, 0x10(%rdi)        ; this->savedPage1 = rdx
   *   @0x144114  movq 0x10(%rcx), %rcx        ; rcx = page0->currentTop
   *   @0x144118  movq %rcx, 0x18(%rdi)        ; this->savedPage0Top = rcx
   *   @0x14411c  movq 0x10(%rdx), %rcx        ; rcx = page1->currentTop
   *   @0x144120  movq %rcx, 0x20(%rdi)        ; this->savedPage1Top = rcx
   *   @0x144124  movl 0x98(%rax), %eax        ; eax = execUnit->counter (u32)
   *   @0x14412a  movl %eax, 0x28(%rdi)        ; this->savedCounter = eax
   * No calls; ctor is pure snapshot. C2 @0x1440b0 is the identical base-object variant used
   * by non-most-derived subobjects — for a leaf class with no virtual base it's the same body.
   */
  constructor(execUnitArg: HGExecutionUnitLike) {
    // @0x1440f4 : rax = execUnitArg->stackOwner
    const owner = execUnitArg.stackOwner;
    // @0x1440fb : this[0x00] = owner
    this.execUnit = owner;
    // @0x1440fe/@0x144105 : this[0x08] = owner.page0
    this.savedPage0 = owner.page0;
    // @0x144109/@0x144110 : this[0x10] = owner.page1
    this.savedPage1 = owner.page1;
    // @0x144114/@0x144118 : this[0x18] = page0.currentTop
    this.savedPage0Top = this.savedPage0.currentTop;
    // @0x14411c/@0x144120 : this[0x20] = page1.currentTop
    this.savedPage1Top = this.savedPage1.currentTop;
    // @0x144124/@0x14412a : this[0x28] = owner.counter (u32 — movl, so mask to 32-bit)
    this.savedCounter = owner.counter >>> 0;
  }

  /**
   * HGStackStateGuard::~HGStackStateGuard() — @0x1441b0 (D1) / @0x144130 (D2).
   *
   * Line-by-line transcription:
   *   @0x1441ba  movq (%rdi), %rbx            ; rbx = this->execUnit (stackOwner)
   *   @0x1441bd  movq 0x8(%rdi), %rdx         ; rdx = this->savedPage0        (arg2 for 1st rewind)
   *   @0x1441c1  movq 0x18(%rdi), %r15        ; r15 = this->savedPage0Top
   *   @0x1441c5  movq 0x20(%rdi), %r14        ; r14 = this->savedPage1Top
   *   @0x1441c9  movl 0x28(%rdi), %eax        ; eax = this->savedCounter
   *   @0x1441cc  movups 0x8(%rdi), %xmm0      ; xmm0 = [savedPage0, savedPage1]  (16 bytes)
   *   @0x1441d0  movups %xmm0, 0x88(%rbx)     ; execUnit->[page0,page1] = xmm0  (RESTORE ptrs)
   *   @0x1441d7  movl %eax, 0x98(%rbx)        ; execUnit->counter = savedCounter (u32)
   *   @0x1441dd  movq %rbx, %rdi              ; arg0 = execUnit
   *   @0x1441e0  xorl %esi, %esi              ; arg1 = 0
   *   @0x1441e2  callq HGExecUnitStack::rewindStack(0, savedPage0)   ; rdx already savedPage0
   *   @0x1441e7  movq 0x90(%rbx), %rdx        ; rdx = execUnit->page1 (post-restore == savedPage1)
   *   @0x1441ee  movq %rbx, %rdi              ; arg0 = execUnit
   *   @0x1441f1  movl $0x1, %esi              ; arg1 = 1
   *   @0x1441f6  callq HGExecUnitStack::rewindStack(1, page1)
   *   @0x1441fb  movq 0x88(%rbx), %rax        ; rax = execUnit->page0
   *   @0x144202  addq %r15, 0x10(%rax)        ; page0->currentTop += savedPage0Top
   *   @0x144206  movq 0x90(%rbx), %rax        ; rax = execUnit->page1
   *   @0x14420d  addq %r14, 0x10(%rax)        ; page1->currentTop += savedPage1Top
   *
   * The trailing @0x14421c-0x14421f cleanup lands at ___clang_call_terminate — the framework
   * elects std::terminate() on any exception unwinding through the dtor rather than
   * propagating (there is no user-visible catch handler). We mirror that by not catching
   * driver errors — they surface to the caller.
   *
   * IMPORTANT: The two rewindStack additions at @0x144202 / @0x14420d ADD the saved top
   * BACK onto the current top — this is NOT a "restore to saved value" (that would be a mov,
   * not an addq). Combined with the movups above that already restored the page POINTERS,
   * the net effect is: after rewindStack unwinds the guarded scope's allocations, the caller's
   * remembered top-of-stack is re-applied additively. Faithful transcription; a higher-level
   * reading of what this MEANS requires decoding HGExecUnitStack's rewind semantics, which is
   * not yet ported (HGExecUnitStack::rewindStack @0x1441e2 not yet transcribed).
   *
   * Idempotency: native C++ dtors run exactly once; we guard with `released` so double-calls
   * (e.g. from an explicit release() plus a Symbol.dispose) do not double-rewind.
   */
  release(): void {
    if (this.released) return;
    this.released = true;

    if (g_driver === null) {
      throw new Error(
        "HGStackStateGuard::~HGStackStateGuard @0x1441b0: no driver installed — " +
          "HGExecUnitStack::rewindStack @0x1441e2 not yet transcribed (install a host " +
          "bridge via setHGStackStateGuardDriver first)"
      );
    }

    const owner = this.execUnit;

    // @0x1441cc-0x1441d0 : restore page pointers (movups pair)
    owner.page0 = this.savedPage0;
    owner.page1 = this.savedPage1;
    // @0x1441d7 : restore counter (u32)
    owner.counter = this.savedCounter >>> 0;

    // @0x1441e2 : rewindStack(0, savedPage0)
    g_driver.rewindStack(owner, 0, this.savedPage0);
    // @0x1441e7-0x1441f6 : rdx = execUnit->page1 (== savedPage1 after the restore above),
    // then rewindStack(1, page1). We pass owner.page1 to mirror the reload — it is
    // observably identical to this.savedPage1 here, but the native code re-reads it and so
    // do we (a driver that mutates owner.page1 during the first rewind would be visible).
    g_driver.rewindStack(owner, 1, owner.page1);

    // @0x1441fb-0x144202 : execUnit->page0.currentTop += savedPage0Top
    owner.page0.currentTop = owner.page0.currentTop + this.savedPage0Top;
    // @0x144206-0x14420d : execUnit->page1.currentTop += savedPage1Top
    owner.page1.currentTop = owner.page1.currentTop + this.savedPage1Top;
  }

  /** ES-style disposable so `using` blocks mirror C++ scope semantics. */
  [Symbol.dispose](): void {
    this.release();
  }
}
