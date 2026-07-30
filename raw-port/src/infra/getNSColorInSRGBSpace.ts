// getNSColorInSRGBSpace(r, g, b, a) — free function in Ozone.framework.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/__Z21getNSColorInSRGBSpacedddd.s
//
// FULL DISASM (8 lines, tail-call to objc_msgSend):
//   0x4a8c00  pushq  %rbp
//   0x4a8c01  movq   %rsp, %rbp
//   0x4a8c04  movq   0x377dc5(%rip), %rdi   ; literal pool: _OBJC_CLASS_$_NSColor
//                                           ;  (target VA 0x8209d0)
//   0x4a8c0b  movq   0x460e06(%rip), %rsi   ; __objc_selrefs entry
//                                           ;  (target VA 0x909a18 →
//                                           ;   __objc_methname "colorWithSRGBRed:green:blue:alpha:"
//                                           ;   at Ozone TEXT VA 0x72c407)
//   0x4a8c12  popq   %rbp
//   0x4a8c13  jmpq   *0x37d40f(%rip)        ; __got tail-jmp _objc_msgSend
//   0x4a8c19  nopl   (%rax)
//
// SEMANTICS
// -------
// This is a bare 4-double-argument-forwarding trampoline. Xmm0..xmm3 already
// hold (r, g, b, a) on entry (System-V ABI, %xmm are unmodified across the
// prologue). The function overwrites %rdi with the NSColor Class pointer and
// %rsi with the selector, then TAIL-JUMPS to `_objc_msgSend`, which does:
//
//     +[NSColor colorWithSRGBRed:(CGFloat)xmm0
//                            green:(CGFloat)xmm1
//                             blue:(CGFloat)xmm2
//                            alpha:(CGFloat)xmm3]
//
// and returns an autoreleased `NSColor *` in %rax.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _OBJC_CLASS_$_NSColor
//       — AppKit/Foundation ObjC class object. Referenced via literal pool
//         @0x4a8c04 (target VA 0x8209d0, a __DATA,__objc_classrefs bind).
//         TRUE out-of-scope extern (AppKit runtime).
//
//   * @selector(colorWithSRGBRed:green:blue:alpha:)
//       — ObjC SEL constant. Referenced via __objc_selrefs @0x909a18
//         (target VA of the raw methname string is Ozone 0x72c407). The
//         selref bytes are patched by the ObjC runtime at image-init time
//         to a stable SEL pointer.
//
//   * _objc_msgSend
//       — libobjc.A.dylib. Tail-jumped @0x4a8c13 via __got. TRUE out-of-scope
//         extern. This is a VALUE-PRODUCING message send (returns NSColor*)
//         so per landed convention it is modelled as a THROW with @0xADDR
//         (contrast: lifetime primitives CFRelease/objc_retain/objc_release
//         are no-ops).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __Z21getNSColorInSRGBSpacedddd
//       — getNSColorInSRGBSpace(double,double,double,double) @Ozone 0x4a8c00
//

// ═════════════════════════════════════════════════════════════════════════
// Opaque handle for the NSColor* returned by the message send. We never
// inspect its bytes from JS; it exists only to model the ObjC boundary
// return type. Consumers pass it back through other ObjC extern calls.
// ═════════════════════════════════════════════════════════════════════════

/** Opaque AppKit `NSColor *`. The bytes are private to the ObjC runtime;
 *  the port only forwards this handle to other extern boundary stubs. */
export interface NSColorRef {
  readonly __ns_color_brand: unique symbol;
}

/**
 * `+[NSColor colorWithSRGBRed:green:blue:alpha:]` — AppKit factory method.
 * Value-producing ObjC extern (returns a fresh autoreleased NSColor*).
 *
 * Per the landed extern-boundary convention (docs/reviewer commit
 * f3e7e606 "resolve extern boundary model — lifetime primitives no-op,
 * value-producing externs throw"), a value-producing extern is modelled
 * as a raising boundary stub that cites the exact objc_msgSend call
 * site so a future parity harness can hook it.
 *
 * Boundary call site: Ozone 0x4a8c13 (tail-jmp `*__got:_objc_msgSend`),
 * with %rdi = _OBJC_CLASS_$_NSColor (@0x8209d0), %rsi = selref
 * @0x909a18, xmm0..xmm3 = (r, g, b, a).
 */
function objc_msgSend_NSColor_colorWithSRGBRed_green_blue_alpha(
  _r: number,
  _g: number,
  _b: number,
  _a: number,
): NSColorRef {
  throw new Error(
    "+[NSColor colorWithSRGBRed:green:blue:alpha:] (_objc_msgSend) " +
      "@Ozone 0x4a8c13 — value-producing ObjC extern (AppKit), not yet " +
      "wired to a parity harness. Class @0x8209d0, selref @0x909a18 " +
      "→ methname 'colorWithSRGBRed:green:blue:alpha:' @0x72c407.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The function
// ═════════════════════════════════════════════════════════════════════════

/**
 * `getNSColorInSRGBSpace(double r, double g, double b, double a)`
 *   — @Ozone 0x4a8c00
 *   — __Z21getNSColorInSRGBSpacedddd
 *
 * Faithful line-for-line transcription of the disassembly above. The
 * body is a bare argument-forwarding trampoline whose *only* real work
 * is a tail-call to `objc_msgSend` with class = NSColor and selector =
 * `colorWithSRGBRed:green:blue:alpha:`. No arithmetic; no in-scope
 * callees; no field reads.
 *
 * The prologue/epilogue (pushq/movq/popq %rbp @0x4a8c00-0x4a8c12) is
 * pure ABI bookkeeping (System-V frame chaining) with no observable
 * effect from JS. The two RIP-relative loads (@0x4a8c04, @0x4a8c0b)
 * fetch the NSColor Class pointer and the SEL for the message-send;
 * both are TRUE out-of-scope externs modelled by the boundary stub
 * above. xmm0..xmm3 are unmodified across the prologue and flow
 * directly into `objc_msgSend`.
 */
export function getNSColorInSRGBSpace(
  r: number,
  g: number,
  b: number,
  a: number,
): NSColorRef {
  // @0x4a8c00..0x4a8c01 — prologue (pushq %rbp ; movq %rsp,%rbp).
  // @0x4a8c04 — rdi = _OBJC_CLASS_$_NSColor (extern, boundary-modelled).
  // @0x4a8c0b — rsi = selref @0x909a18 (extern, boundary-modelled).
  // @0x4a8c12 — popq %rbp (epilogue).
  // @0x4a8c13 — jmpq *__got:_objc_msgSend (tail-call to value-producing
  //             ObjC extern; per landed convention, THROW with @0xADDR).
  return objc_msgSend_NSColor_colorWithSRGBRed_green_blue_alpha(r, g, b, a);
  // @0x4a8c19 — nopl (%rax): padding, no effect.
}
