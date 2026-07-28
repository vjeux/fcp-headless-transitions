// raw-port: MotionROIFrame — Helium framework (channels layer)
//
// A vestigial ObjC/C++ class that exists solely as a namespace for a
// single lazy-initialized process-wide int32:
//
//     static int32_t* MotionROIFrame::_pThis;   // starts null
//
// initialized to -1 (0xFFFFFFFF) on first call to `MotionROIFrame::get()`.
// Instance state does not exist — both dtors are stub-empty.
//
// Public surface (3 methods):
//   0x00147db0  MotionROIFrame::~MotionROIFrame()   (D2 base) — empty
//   0x00147dc0  MotionROIFrame::~MotionROIFrame()   (D1)      — empty
//   0x00147dd0  MotionROIFrame::get()               — the actual work
//
// GLOBAL STATE
// ------------
//     _pThis   symbol __ZN14MotionROIFrame6_pThisE (Helium, RIP-rel'd
//              from @0x147dd0 and @0x147df1).
//              Type: pointer to int32 (`operator new(4)` @0x147de6 and
//              `movl $-1, (%rax)` @0x147deb say so).
//              Initial value in the binary: 0 (nullptr) — never set at
//              construction time, only lazily on first get() call.
//
// `MotionROIFrame::get()` is a leaf getter/lazy-init pair. It does NOT
// take a `this`; the D2/D1 dtors are the only reason to think there is
// ever an instance. Given the empty dtors, calling code either never
// constructs one or constructs and drops it purely for the ObjC lifetime
// side effects (of which there are none). We model this as a static
// namespace with a `get()` classmethod.
//
// This is one of those tiny binary artifacts where the meaningful
// behavior is just the lazy-init of a single -1 sentinel. Portable
// callers hold on to the returned pointer and read/write the int32.

/**
 * A one-slot int32 box, initialized to -1. Its identity (pointer)
 * matters, not the enclosing class.
 */
export interface MotionROIFrameSlot {
  /**
   * The 4-byte value at (*_pThis). Initialized to -1 (0xFFFFFFFF as
   * unsigned; -1 as int32) — see @0x147deb.
   */
  value: number;
}

/**
 * MotionROIFrame — namespace-only class. Instances are inert; all state
 * lives in the static `_pThis` slot managed by `get()`.
 */
export class MotionROIFrame {
  /**
   * Process-wide, lazily-allocated int32 slot. Mirrors the C++ global
   *   `MotionROIFrame::_pThis`  (symbol __ZN14MotionROIFrame6_pThisE)
   * which starts as nullptr (BSS zero-init) and is filled in by the
   * first call to `get()`.
   */
  private static _pThis: MotionROIFrameSlot | null = null;

  /**
   * MotionROIFrame::~MotionROIFrame()  @0x00147db0  (D2, base non-deleting)
   *
   * Faithful asm mirror:
   *   @0x147db0  pushq %rbp; movq %rsp,%rbp
   *   @0x147db4  popq  %rbp; retq
   *
   * Zero-op. There are no instance fields to release, and the static
   * _pThis is not touched (its lifetime is the process, not the object).
   */
  destroyBase(): void {
    // Empty — matches asm.
  }

  /**
   * MotionROIFrame::~MotionROIFrame()  @0x00147dc0  (D1)
   *
   * Faithful asm mirror:
   *   @0x147dc0  pushq %rbp; movq %rsp,%rbp
   *   @0x147dc4  popq  %rbp; retq
   *
   * Also empty. D0 (the deleting variant) is not exported for this
   * class — the caller must own storage.
   */
  destroy(): void {
    // Empty — matches asm.
  }

  /**
   * MotionROIFrame::get()  @0x00147dd0
   *
   * Lazy-initialized getter for the class-static `_pThis` slot. If not
   * yet allocated, allocates a 4-byte int32 (via `operator new(4)`,
   * @0x147de6 __Znwm), stores -1 into it (@0x147deb), publishes the
   * pointer to the static (@0x147df1), and returns it. Otherwise (fast
   * path) returns the existing pointer.
   *
   * Faithful asm mirror:
   *   @0x147dd0  movq  _pThis(%rip), %rax     ; load static
   *   @0x147dd7  testq %rax, %rax
   *   @0x147dda  je    0x147ddd               ; if null → slow path
   *   @0x147ddc  retq                          ; fast: return _pThis (in rax)
   *   0x147ddd:  ; slow-path
   *   @0x147ddd  pushq %rbp; movq %rsp,%rbp
   *   @0x147de1  movl  $4, %edi
   *   @0x147de6  callq __Znwm                  ; rax = operator new(4)
   *   @0x147deb  movl  $0xFFFFFFFF, (%rax)     ; *rax = -1  (int32)
   *   @0x147df1  movq  %rax, _pThis(%rip)      ; publish
   *   @0x147df8  popq  %rbp; retq              ; return rax
   *
   * NB: the fast path does NOT touch the frame pointer (leaf-return
   * before the prologue), which is why the slow path re-does the
   * prologue. Semantics-wise, both paths return the same pointer.
   *
   * Note on the sentinel value: -1 as int32 is 0xFFFFFFFF (unsigned).
   * The asm writes 32 bits and treats them as signed on read (typical
   * for `int` in this codebase); we mirror that with the signed value
   * -1.
   */
  static get(): MotionROIFrameSlot {
    // @0x147dd0..0x147ddc — fast path.
    if (MotionROIFrame._pThis !== null) {
      return MotionROIFrame._pThis;
    }
    // @0x147ddd..0x147df8 — slow path: allocate, init to -1, publish.
    // Note: this is the ONLY allocation site; `operator new` cannot
    // return null per the C++ ABI (it throws instead), and the asm
    // does not check for null — so we don't either.
    const slot: MotionROIFrameSlot = { value: -1 }; // @0x147deb  movl $-1, (%rax)
    MotionROIFrame._pThis = slot;                    // @0x147df1  movq %rax, _pThis
    return slot;
  }
}
