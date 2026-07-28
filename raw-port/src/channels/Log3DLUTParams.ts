// Log3DLUTParams — Flexo params struct holding two virtually-owned handles.
// FAITHFUL PORT — do NOT approximate. Every method cites @0xADDR (Flexo).
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbols owned by this class (from `nm | c++filt` on Flexo T-table):
//   __ZN14Log3DLUTParamsD1Ev   Log3DLUTParams::~Log3DLUTParams()   @0x75cc10
//
// Related private / linker-scope symbols observed at call sites in Flexo
// (NOT part of the T-table export set for this class, so they show up only
// as references from `Log3DLUTParams::lazyInit()` block invocations at
// e.g. 0x75b5eb, 0x75b655, 0x75b6a8, 0x75b6fb):
//   __ZN14Log3DLUTParams4predE                    Log3DLUTParams::pred (dispatch_once_t)
//   ____ZN14Log3DLUTParams8lazyInitEv_block_invoke  block trampoline for lazyInit()
//   __ZL32sBMDFilmGen5WideGamut3DLUTParams          static config (BMD Film Gen5 Wide Gamut)
//   __ZL32sCanonLog3CinemaGamut3DLUTParams          static config (Canon Log3 Cinema Gamut)
//   __ZL26sAppleLogBT20203DLUTParams                static config (Apple Log BT.2020)
//   __ZL30sFujifilmFLogBT20203DLUTParams            static config (Fujifilm F-Log BT.2020)
//   (and additional log-space presets, one per callsite)
// These are not decoded here: `lazyInit` has no exported symbol we can
// disassemble (it lives as a linker-private helper) and the block invoke
// is another undecoded body. We ONLY port the destructor.
//
// STRUCT LAYOUT (recovered from the destructor @0x75cc10):
//   Log3DLUTParams {
//     +0x00  member0 : Owned<Polymorphic>*   (pointer; if non-null, callq *0x18(vtbl))
//     +0x08  member1 : Owned<Polymorphic>*   (pointer; if non-null, callq *0x18(vtbl))
//   }
//   sizeof(Log3DLUTParams) >= 0x10 (only +0x00 and +0x08 are read by the dtor;
//   the full size is not decodable from this method alone — additional fields
//   may exist beyond +0x10 that are populated by lazyInit / the static configs).
//
// The two members are pointers to POLYMORPHIC objects. The destructor calls
// `callq *0x18(%rax)` where `%rax = *member` (i.e. the vtable pointer). Slot
// 0x18 (= 3rd 8-byte entry) is by Itanium C++ ABI the "deleting destructor"
// slot for a class with no multiple inheritance. So each member is HELD BY
// OWNING POINTER and destroyed-and-freed by its own virtual deleting dtor.
//
// The concrete runtime types are one of the shipped static Log3D LUT preset
// pointers (BMD/Canon/Apple/Fujifilm log-space configurations initialised by
// the `lazyInit` dispatch_once path @0x75b5eb..0x75b71d and its siblings) —
// but this class itself does not know their static type; it only knows the
// vtable slot to call. We model that with an interface `HasDeletingDtor`
// carrying a `deletingDtor()` method that mirrors the vtable-slot-0x18 call.
//
// DECODE reference:
//   Flexo.Log3DLUTParams.~Log3DLUTParams.s     @0x75cc10 (23 lines)

/**
 * Interface for the polymorphic objects held at Log3DLUTParams's +0x00 / +0x08
 * pointer slots. Their C++ vtable slot 0x18 (deleting destructor) is invoked
 * by the containing Log3DLUTParams destructor. Concrete implementations are
 * defined outside this file — this interface exists solely so the destructor
 * transcription mirrors the shipped `callq *0x18(%rax)` semantics.
 *
 * Frontier: the concrete types populating these slots (see lazyInit references
 * at 0x75b5eb / 0x75b655 / 0x75b6a8 / 0x75b6fb) are not yet transcribed.
 */
export interface HasDeletingDtor {
  /**
   * @vtable slot 0x18 (3rd entry) — Itanium C++ ABI "deleting destructor":
   * runs the destructor chain, then `operator delete`s the storage.
   * Named `deletingDtor` here (not `destroy`, not `dispose`) so that its
   * meaning maps 1:1 to the shipped `callq *0x18(vptr)` call site at
   * @Flexo 0x75cc24 and @Flexo 0x75cc33.
   */
  deletingDtor(): void;
}

/**
 * `Log3DLUTParams` — Flexo container for a pair of virtually-owned Log-space
 * 3D LUT handles. Populated by the class's `lazyInit()` dispatch_once helper
 * (frontier — not exported to the T-table, so undecodable from disasm alone).
 *
 * Only the destructor is present in Flexo's exported T-table for this class.
 */
export class Log3DLUTParams {
  /**
   * @Flexo +0x00 — first owned polymorphic pointer. Read by the dtor at
   * @Flexo 0x75cc19 (`movq (%rdi), %rdi`). May be null; if null, the vtable
   * dispatch at 0x75cc24 is skipped (the `je 0x75cc27` branch).
   */
  member0: HasDeletingDtor | null = null;

  /**
   * @Flexo +0x08 — second owned polymorphic pointer. Read by the dtor at
   * @Flexo 0x75cc27 (`movq 0x8(%rbx), %rdi`). Same null-guard pattern as
   * member0 (`testq %rdi, %rdi; je 0x75cc36`).
   */
  member1: HasDeletingDtor | null = null;

  /**
   * Log3DLUTParams::~Log3DLUTParams()  @Flexo 0x75cc10.
   *
   *   0x75cc10 pushq %rbp
   *   0x75cc11 movq  %rsp, %rbp
   *   0x75cc14 pushq %rbx
   *   0x75cc15 pushq %rax                        ; align + scratch slot
   *   0x75cc16 movq  %rdi, %rbx                  ; %rbx = this
   *   0x75cc19 movq  (%rdi), %rdi                ; %rdi = this->member0
   *   0x75cc1c testq %rdi, %rdi
   *   0x75cc1f je    0x75cc27                    ; if member0 == null, skip
   *   0x75cc21 movq  (%rdi), %rax                ; %rax = member0->vptr
   *   0x75cc24 callq *0x18(%rax)                 ; vtable[0x18] = deletingDtor
   *   0x75cc27 movq  0x8(%rbx), %rdi             ; %rdi = this->member1
   *   0x75cc2b testq %rdi, %rdi
   *   0x75cc2e je    0x75cc36                    ; if member1 == null, skip
   *   0x75cc30 movq  (%rdi), %rax                ; %rax = member1->vptr
   *   0x75cc33 callq *0x18(%rax)                 ; vtable[0x18] = deletingDtor
   *   0x75cc36 addq  $0x8, %rsp
   *   0x75cc3a popq  %rbx
   *   0x75cc3b popq  %rbp
   *   0x75cc3c retq
   *   ── landing pad (exception path from either callq) ──────────────────
   *   0x75cc3d movq  %rax, %rdi
   *   0x75cc40 callq ___clang_call_terminate     ; std::terminate if a dtor threw
   *   0x75cc45 nopw  %cs:(%rax,%rax)
   *
   * The dtor destroys members in FIELD order (0x00 first, 0x08 second) — the
   * normal C++ reverse-order rule is INVERTED here compared to typical
   * ctor/dtor pairing; this matches what the shipped binary does. Both
   * destructor calls are wrapped by the same landing pad, so if either
   * `deletingDtor()` throws, control jumps to `___clang_call_terminate`.
   * We mirror that by NOT swallowing exceptions — TypeScript has no
   * `std::terminate`, so the closest faithful behaviour is to let the
   * exception propagate (which will abort under an unhandled-rejection /
   * uncaught-exception handler — the platform equivalent).
   *
   * IMPORTANT: JavaScript has no explicit `delete`. In C++, the vtable slot
   * at 0x18 is the "deleting destructor" which BOTH runs the dtor AND frees
   * the memory. In TS/JS, the GC frees objects once unreferenced — but the
   * dtor SIDE-EFFECTS (releasing OS handles, cache invalidation, etc.) are
   * carried by whatever `deletingDtor()` does on the concrete subclass.
   */
  destroy(): void {
    // @0x75cc19..0x75cc24 — member0 null-guarded virtual call.
    const m0 = this.member0;
    if (m0 !== null) {
      // @0x75cc21..0x75cc24 — callq *0x18(vptr) = deletingDtor.
      m0.deletingDtor();
    }
    // @0x75cc27..0x75cc33 — member1 null-guarded virtual call.
    const m1 = this.member1;
    if (m1 !== null) {
      // @0x75cc30..0x75cc33 — callq *0x18(vptr) = deletingDtor.
      m1.deletingDtor();
    }
    // @0x75cc36..0x75cc3c — epilogue (stack teardown, no return value).
    // The landing pad @0x75cc3d..0x75cc40 (___clang_call_terminate) is the
    // C++ std::terminate handler for a throwing dtor — we let exceptions
    // propagate rather than swallow them, which is the closest faithful
    // analogue in TS.
  }
}
