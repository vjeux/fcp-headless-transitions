// HGAntiAliasLUTEntryFactory.ts — Helium framework's factory-object that manufactures
// HGAntiAliasLUTEntry instances on behalf of HGLUTCache. This class is a stateless
// polymorphic factory: a vtable-only trampoline whose single virtual method
// `createLUTEntry` news-up a heap HGAntiAliasLUTEntry and returns it to the cache
// (which then owns the returned pointer).
//
// Verbatim from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// THREE EXPORTED SYMBOLS (only member functions of the class):
//   @Helium 0x0000000000211300  HGAntiAliasLUTEntryFactory::~HGAntiAliasLUTEntryFactory()   (D1)
//   @Helium 0x0000000000211310  HGAntiAliasLUTEntryFactory::~HGAntiAliasLUTEntryFactory()   (D0)
//   @Helium 0x0000000000211320  HGAntiAliasLUTEntryFactory::createLUTEntry(
//                                    HGLUTCache::LUTInfo*, HGRenderer*)
// No ctor is exported (so it is inline in a header — likely `= default`; the vtable pointer
// is installed by whichever owner constructs the factory, using __ZTV26HGAntiAliasLUTEntry
// Factory. That vtable is not touched by any of the three bodies below.)
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Helium.HGAntiAliasLUTEntryFactory.~HGAntiAliasLUTEntryFactory.s  (D0 body @0x211310..0x21131a)
// (D1 body @0x211300..0x211306 was recovered directly from /tmp/Helium_tV.txt — a plain
//  frame-set-up-and-retq. See the /*!D1!*/ comment on `D1_destructor` below.)
//   Helium.HGAntiAliasLUTEntryFactory.createLUTEntry.s               (@0x211320..0x21136c)
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// Neither destructor touches any field, so the only observable member of the class
// is its vtable slot. The class allocates NO heap resources on its own account and
// consequently has NO field-level teardown to do:
//
//   offset  size  field           comments
//   ------  ----  --------------  --------------------------------------------------
//   +0x00   0x08  vptr : void*    vtable pointer for HGAntiAliasLUTEntryFactory.
//                                 Installed by external ctor (not exported); read by
//                                 the compiler-generated virtual-call thunks that
//                                 route through D0/D1/createLUTEntry.
//
// Since no other field is ever accessed by any exported member function, sizeof is
// AT LEAST 8 (the vtable) and CANNOT be constrained further from this class in
// isolation. HGLUTCache may embed the factory as a field, but that decision lives
// in HGLUTCache's ctor which is not in scope here.
//
// ── FRONTIER CALLEES ────────────────────────────────────────────────────────
//   @Helium 0x21335 __Znwm         operator new(size_t)   — libSystem/libc++ heap alloc.
//   @Helium 0x21346 __ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
//                   HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
//                   — the C2 (base-object) ctor of the ENTRY class. NOT ported yet;
//                   reserved for its own task queue entry. We call it through a
//                   throwing-stub adaptor so any caller that reaches this path
//                   surfaces the exact frontier callee it needs.
//   @Helium 0x21315 __ZdlPv        operator delete(void*)  — libSystem/libc++ heap free (D0).
//   @Helium 0x2135f __ZdlPv        operator delete(void*)  — unwind cleanup path in
//                                  createLUTEntry (called when the HGAntiAliasLUTEntry
//                                  ctor throws before it returns — the allocated block
//                                  is freed and the exception is re-raised).
//   @Helium 0x21367 __Unwind_Resume — re-raise the in-flight exception after cleanup.
//
// Reused ports:
//   None — HGAntiAliasLUTEntry, HGLUTCache::LUTInfo, and HGRenderer are all separate
//          Helium classes with their own future task-queue entries. We forward-
//          declare each as an opaque nominal type so this file compiles without
//          drawing them in.
//
// ── OPAQUE FORWARD-DECLARATIONS ─────────────────────────────────────────────
// All three referenced Helium types are ported separately; we surface them here as
// nominally-typed opaque handles so the factory's method signature is legible without
// forcing a cross-file dependency that hasn't been created yet.

/** Opaque handle to Helium's HGLUTCache::LUTInfo (nested class inside HGLUTCache). Ported
 *  separately when its symbols hit the queue. */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

/** Opaque handle to Helium's HGRenderer. Ported separately. */
export interface HGRenderer {
  readonly __brand_HGRenderer: unique symbol;
}

/** Opaque handle to Helium's HGAntiAliasLUTEntry. Ported separately (its 4 exported
 *  symbols — C2, D0, D1, GetBitmap — live in a dedicated task-queue entry). Consumers
 *  of `createLUTEntry` should treat the returned value as a heap-owned pointer. */
export interface HGAntiAliasLUTEntry {
  readonly __brand_HGAntiAliasLUTEntry: unique symbol;
}

/**
 * Frontier stub for __ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
 * @Helium 0x21346  HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
 *
 * This is the C2 (base-object) constructor of HGAntiAliasLUTEntry. It has not been
 * ported yet — it is its own task-queue entry. Any code path that would `new
 * HGAntiAliasLUTEntry(info, renderer)` in FCP funnels through this ctor; in the port,
 * calling `createLUTEntry` therefore throws until the entry is decoded. Throwing (as
 * opposed to guessing an implementation) is the demand signal that this frontier
 * needs decoding — do NOT weaken this to a stub value.
 */
function HGAntiAliasLUTEntry_C2_stub(
  _self: HGAntiAliasLUTEntry,
  _info: HGLUTCache_LUTInfo,
  _renderer: HGRenderer,
): void {
  // Faithful decode-don't-fit stub. See raw-port/army/PORTING_SPEC.md rule 3.
  throw new Error(
    "HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*) " +
      "@Helium 0x211346 is not yet ported. This throw is the demand signal — port the " +
      "HGAntiAliasLUTEntry C2/D0/D1/GetBitmap symbols in its own task entry.",
  );
}

/**
 * HGAntiAliasLUTEntryFactory — stateless polymorphic factory that produces
 * HGAntiAliasLUTEntry heap objects for HGLUTCache.
 *
 * This is a plain OO factory: the single interesting method (`createLUTEntry`) does
 * `new HGAntiAliasLUTEntry(info, renderer)` and returns the pointer; the caller owns
 * the returned object. Both destructors are no-ops (D1 is completely empty; D0 is a
 * single tail-call to `operator delete`).
 */
export class HGAntiAliasLUTEntryFactory {
  /**
   * D1 — complete-object destructor.
   *   @Helium 0x0000000000211300..0x0000000000211306
   *
   * Disassembly:
   *   0x211300  pushq %rbp
   *   0x211301  movq  %rsp, %rbp
   *   0x211304  popq  %rbp
   *   0x211305  retq
   *   0x211306  nopw  %cs:(%rax,%rax)      ; alignment padding
   *
   * The body is a pure frame-set-up / frame-tear-down / return — the compiler
   * emitted a defaulted destructor. No field is touched, no callee invoked. In TS
   * there is likewise nothing to do; we retain the method entry point (matching
   * the ABI) as an empty function so external code that dispatches through
   * `factory.D1_destructor()` behaves the same as FCP's virtual-D1 thunk.
   */
  D1_destructor(): void {
    // Mirror the asm: pure return. No side effects.
  }

  /**
   * D0 — deleting destructor (virtual-delete thunk).
   *   @Helium 0x0000000000211310..0x000000000021131a
   *
   * Disassembly:
   *   0x211310  pushq %rbp
   *   0x211311  movq  %rsp, %rbp
   *   0x211314  popq  %rbp
   *   0x211315  jmp   __ZdlPv               ; tail-call: operator delete(this)
   *   0x21131a  nopw  (%rax,%rax)           ; alignment padding
   *
   * D0 does NOT tail-call D1 first — the compiler noticed D1 is empty (no field
   * teardown) and inlined the "run D1 then delete this" sequence down to just the
   * `delete this`. In JS there is no `operator delete`; releasing the reference is
   * the closest equivalent. Callers of this method must not use the instance
   * afterwards. We still invoke `D1_destructor()` explicitly here so the observable
   * call order matches the abstract Itanium ABI (D0 is defined as "D1 then delete"),
   * even though FCP's compiler collapsed the sequence into a single `jmp __ZdlPv`.
   */
  D0_deleting_destructor(): void {
    // Semantic step: run D1 (a no-op) then release. Mirrors ABI, matches asm's
    // observable effect (D1 is empty, so this is exactly the collapsed sequence).
    this.D1_destructor();
    // `jmp __ZdlPv` at 0x211315 — no TS-side equivalent; GC reclaims when the
    // caller drops its reference.
  }

  /**
   * createLUTEntry — factory method.
   *   @Helium 0x0000000000211320..0x000000000021136c
   *
   * Disassembly (main path):
   *   0x211320  pushq %rbp
   *   0x211321  movq  %rsp, %rbp
   *   0x211324  pushq %r15
   *   0x211326  pushq %r14
   *   0x211328  pushq %rbx
   *   0x211329  pushq %rax                                          ; align 16
   *   0x21132a  movq  %rdx, %r14                                    ; r14 = renderer
   *   0x21132d  movq  %rsi, %r15                                    ; r15 = info
   *   0x211330  movl  $0x28, %edi                                   ; size = 40 bytes
   *   0x211335  callq __Znwm                                        ; rax = operator new(40)
   *   0x21133a  movq  %rax, %rbx                                    ; save block pointer
   *   0x21133d  movq  %rax, %rdi                                    ; arg1 = this
   *   0x211340  movq  %r15, %rsi                                    ; arg2 = info
   *   0x211343  movq  %r14, %rdx                                    ; arg3 = renderer
   *   0x211346  callq __ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer
   *                                                                 ; construct in-place
   *   0x21134b  movq  %rbx, %rax                                    ; return the block
   *   0x21134e..0x211358  epilogue + retq
   *
   * Unwind path (@0x211359..0x211367, invoked if the ctor throws):
   *   0x211359  movq  %rax, %r14                                    ; save the exception
   *   0x21135c  movq  %rbx, %rdi                                    ; block pointer
   *   0x21135f  callq __ZdlPv                                       ; operator delete(block)
   *   0x211364  movq  %r14, %rdi                                    ; restore exception
   *   0x211367  callq __Unwind_Resume                               ; re-raise
   *
   * Semantically: `return new HGAntiAliasLUTEntry(info, renderer)`, where the two
   * arg pointers flow through unchanged (no offset, no null check — FCP trusts its
   * cache pipeline to pass valid pointers, matching the ABI-visible asm).
   *
   * SIZEOF NOTE: `movl $0x28, %edi` at 0x211330 reveals `sizeof(HGAntiAliasLUTEntry)
   * == 40 bytes`. This is a decoded fact about the ENTRY class (not the factory),
   * captured here so the future HGAntiAliasLUTEntry porter has the layout budget
   * up front.
   *
   * The port routes through the throwing stub of HGAntiAliasLUTEntry's C2 ctor:
   * that class is deliberately un-ported at this point, so any caller reaching this
   * factory surfaces the exact frontier they need decoded next.
   */
  createLUTEntry(info: HGLUTCache_LUTInfo, renderer: HGRenderer): HGAntiAliasLUTEntry {
    // 0x211335: __Znwm(0x28) — 40-byte allocation. In JS we let the runtime allocate
    //  the object literal; the "40 bytes" is a fact about the C++ layout of the
    //  ENTRY class (not observable here), captured in the SIZEOF NOTE above.
    const entry: HGAntiAliasLUTEntry = {} as HGAntiAliasLUTEntry;

    // 0x211346: HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(this, info, renderer).
    // The ctor is not yet ported — this is the demand signal. The unwind path
    // @0x211359 (delete + Unwind_Resume) is not modelled explicitly: the throw
    // from the stub propagates via JS's own exception machinery, and there is no
    // C++ heap block to free.
    HGAntiAliasLUTEntry_C2_stub(entry, info, renderer);

    // 0x21134b: return rbx (the allocated block, now fully constructed).
    return entry;
  }
}
