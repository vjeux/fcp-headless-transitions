// PCRenderAbortedException.ts — ProCore's PCRenderAbortedException. The
// two decoded methods on this class in ProCore are not instance methods
// at all — they are the getter/setter pair for a SINGLE module-scope
// global `bool _abortRender` (@ProCore data 0x15ad20). Neither method
// touches `this`; both operate exclusively on that global. The class-
// scoping is a C++ style choice (a "namespace by class"), not a runtime
// dependency on any instance.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
//
// DECODE. Both methods below are transcribed one-for-one from the ASM.
// Every method cites its @0xADDR in ProCore; the global's address is
// resolved by name from ProCore's `nm` symbol table.
//
// NAMING NOTE on the getter: the symbol is named `enableAbortRender`
// (with no leading `get`), but its body only READS the global — it
// returns the current value in %al and does not modify anything. This
// is faithful to the shipped binary; do NOT rename to `getAbortRender`
// or "correct" the name (the mangled symbol carries the exported name).
//
// DATA (recovered from `nm -n` on the ProCore binary):
//   `_abortRender` @ProCore data 0x15ad20 — a single-byte C `bool`
//   (accessed by `movb`), mutable (segment tag `d`). No initializer
//   value is decoded from these two methods; the module-scope default
//   is 0 unless overwritten (ProCore's CRT init would supply that but
//   is not in scope here). We model the field as `false` (the standard
//   BSS-zero default) at TS module-load time.

/**
 * `_abortRender` @ProCore 0x15ad20 — module-scope global `bool` shared
 * by both methods below. Modelled here as a live TS module variable.
 * Reads and writes must both go through `getAbortRenderFlag` /
 * `setAbortRenderFlag` so all field-touch sites are visible.
 */
let _abortRender = false;

/** Internal accessor for the `_abortRender` global — used by the
 *  class's two static methods and by any future decoder that wants to
 *  cite the same 0x15ad20 field. Kept as a free function so the
 *  module-scope storage is not exposed on the class itself. */
function getAbortRenderFlag(): boolean {
  return _abortRender;
}
function setAbortRenderFlag(v: boolean): void {
  _abortRender = v;
}

/**
 * `PCRenderAbortedException` — ProCore's abort-render exception class.
 * The two decoded methods are static accessors for the module-scope
 * `_abortRender` global. Any other behaviour (ctors, what(), etc.) is
 * FRONTIER for this file.
 */
export class PCRenderAbortedException {
  /**
   * `PCRenderAbortedException::enableAbortRender()` @ProCore 0x2efe.
   *
   * NOTE: despite the imperative name, this function is a pure GETTER —
   * it returns the current value of the `_abortRender` global and
   * performs no modification.
   *
   * Disasm (all @ProCore):
   *   0x2efe  push rbp / mov rbp, rsp
   *   0x2f02  mov  al, [rip+_abortRender]       ; al = _abortRender  (byte load @0x15ad20)
   *   0x2f08  pop  rbp
   *   0x2f09  ret
   *
   * The return convention: %al is the C++ ABI return register for
   * `bool`, so the returned value is exactly the byte read at
   * @ProCore 0x15ad20.
   */
  static enableAbortRender(): boolean {
    // @0x2f02: read the +0x15ad20 byte and return it.
    return getAbortRenderFlag();
  }

  /**
   * `PCRenderAbortedException::setEnableAbortRender(bool)` @ProCore
   * 0x2ef0.
   *
   * Disasm (all @ProCore):
   *   0x2ef0  push rbp / mov rbp, rsp
   *   0x2ef4  mov  [rip+_abortRender], dil      ; _abortRender = (bool)arg
   *                                             ;   (dil = low byte of rdi,
   *                                             ;    which is the first
   *                                             ;    integer/bool arg in
   *                                             ;    the SysV x86_64 ABI)
   *   0x2efb  pop  rbp
   *   0x2efc  ret
   *   0x2efd  nop                               ; padding
   *
   * The arg convention: %dil is the low byte of %rdi (arg0), so the
   * store is `_abortRender = (bool)arg`. Only bit 0 of the argument
   * byte is meaningful in C++'s `bool` model, but the store writes
   * the entire low byte verbatim.
   */
  static setEnableAbortRender(v: boolean): void {
    // @0x2ef4: write the +0x15ad20 byte with the arg's low byte.
    setAbortRenderFlag(v);
  }
}
