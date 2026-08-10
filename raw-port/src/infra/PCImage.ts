// PCImage — ProCore image container. This file starts with the single
// `setGuaranteeMemoryCallback` static setter — a 5-instruction store of a
// C-function-pointer into a class-static slot. Instance methods and other
// statics of PCImage are separate ledger units and will be added here when
// each of their units is claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProCore.framework/Versions/A/ProCore (x86_64 slice).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN7PCImage26setGuaranteeMemoryCallbackEPFbjE
//       — PCImage::setGuaranteeMemoryCallback(bool (*)(uint32_t))  @ProCore 0x4ae6e
//   * __ZN7PCImage18setIsPremultipliedEb
//       — PCImage::setIsPremultiplied(bool)  @ProCore 0x4af6c
//   * __ZN7PCImage18setIsPremultipliedEb
//       — PCImage::setIsPremultiplied(bool)  @ProCore 0x4af6c
//
// INSTANCE LAYOUT (recovered from accessor disasm)
//   this+0x38 : bool _isPremultiplied — a 1-byte flag written by
//     setIsPremultiplied via `movb %sil, 0x38(%rdi)`. Modelled below as the
//     instance field `_isPremultiplied`.
//
// STATIC DATA REFERENCED
//   __ZN7PCImage16_guaranteeMemoryE  = "PCImage::_guaranteeMemory" — the
//     class-static function-pointer slot that this setter writes. The
//     read side is a caller-facing accessor (not yet ported) that invokes
//     `_guaranteeMemory(size)` when PCImage needs to ask the host to
//     guarantee `size` bytes of image memory can be allocated. The
//     callback signature is `bool (*)(unsigned int size)`.

/**
 * Type of the guarantee-memory callback pointer.
 *
 * The FCP binary emits its mangled name as `PFbjE` (P=pointer, F=function,
 * b=bool return, j=unsigned int arg) — i.e. `bool (*)(unsigned int)`.
 * Callers pass a function that returns whether the requested byte count
 * can be guaranteed.
 */
export type PCImage_GuaranteeMemoryCallback =
  ((size: number) => boolean) | null;

/**
 * `PCImage::_guaranteeMemory` — the class-static function-pointer slot the
 * setter writes to. Symbol: `__ZN7PCImage16_guaranteeMemoryE` (a `bool
 * (*)(unsigned int)`).  A NULL value means "no callback registered — treat
 * the guarantee as trivially succeeding" (the typical accessor pattern is
 * `if (_guaranteeMemory) return _guaranteeMemory(size); else return true;`).
 *
 * We model the static as a module-local `let` bound to `null` initially,
 * which matches an uninitialised BSS pointer in the FCP binary. Ported
 * callers that read this static (when their units land) will import the
 * module-level `PCImage__guaranteeMemory` binding directly; no helper
 * accessor is defined here so we don't create a shadow "function" that
 * doesn't correspond to a real FCP symbol.
 */
export let PCImage__guaranteeMemory: PCImage_GuaranteeMemoryCallback = null;

/**
 * The FCP static class holding image ops. Only the `setGuaranteeMemoryCallback`
 * static is ported so far; instance layout will be filled in when ctor and
 * accessor units are claimed.
 */
export class PCImage {
  /**
   * `PCImage::setGuaranteeMemoryCallback(bool (*)(unsigned int))` — @ProCore 0x4ae6e
   *   __ZN7PCImage26setGuaranteeMemoryCallbackEPFbjE
   *
   * Faithful transcription of the 5-instruction body:
   *
   *   0x4ae6e  pushq  %rbp
   *   0x4ae6f  movq   %rsp, %rbp
   *   0x4ae72  movq   %rdi, __ZN7PCImage16_guaranteeMemoryE(%rip)
   *   0x4ae79  popq   %rbp
   *   0x4ae7a  retq
   *   0x4ae7b  nop
   *
   * Pure static setter: stores the callback pointer (arg %rdi — a C
   * function pointer is passed in the first integer arg slot on SysV
   * x86_64) into the class-static function-pointer slot. No branches, no
   * externs, no callees.
   *
   * NOTE ON ARG REGISTER: `%rdi` is arg 1 for a NON-member (static) function
   * — this is a class-static method, so there is no implicit `this`. The
   * mangled name `setGuaranteeMemoryCallback` has no `K` (const) or `E`
   * following an instance-implicit-this, confirming it's a static.
   */
  static setGuaranteeMemoryCallback(fn: PCImage_GuaranteeMemoryCallback): void {
    // @0x4ae72 movq %rdi, __ZN7PCImage16_guaranteeMemoryE(%rip)
    PCImage__guaranteeMemory = fn;
  }

  /**
   * `this+0x38` — the premultiplied-alpha flag. A 1-byte instance field
   * written by `setIsPremultiplied` (`movb %sil, 0x38(%rdi)`). Initialised
   * to `false` here; the true reset value is established by PCImage's ctor
   * (a separate ledger unit) — we start it `false` so the field exists and
   * is typed. Recovered offset: 0x38.
   */
  private _isPremultiplied: boolean = false;

  /**
   * `PCImage::setIsPremultiplied(bool)` — @ProCore 0x4af6c
   *   __ZN7PCImage18setIsPremultipliedEb
   *
   * Faithful transcription of the 6-instruction body:
   *
   *   0x4af6c  pushq  %rbp
   *   0x4af6d  movq   %rsp, %rbp
   *   0x4af70  movb   %sil, 0x38(%rdi)
   *   0x4af74  popq   %rbp
   *   0x4af75  retq
   *
   * Pure instance setter: `%rdi` is the implicit `this`, `%sil` is the low
   * byte of arg 1 (`%rsi` — the `bool` value). The single store writes that
   * byte into `this+0x38`. No branches, no callees, no externs.
   */
  setIsPremultiplied(value: boolean): void {
    // @0x4af70 movb %sil, 0x38(%rdi)
    this._isPremultiplied = value;
  }
}
