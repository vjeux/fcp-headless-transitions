// FFScopedEffect.ts — Flexo scoped-effect helper (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This file adds the FIRST decoded FFScopedEffect method: `Bottom() const`
// (@Flexo 0x12386c0), a by-value getter that returns a 32-byte result struct
// built from the object's field at +0x10. Every future FFScopedEffect method
// is a separate ledger entry and must be ADDED to this file (additive
// extension only) — never a rewrite / drop of a landed method.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only from the Bottom() disasm)
// -----------------------------------------------------------------------------
// FFScopedEffect {
//   ...                               // fields 0x00..0x0f not decoded here
//   +0x10  void*  slotAt10            // 8-byte field copied verbatim into the
//                                     //   result's first qword by Bottom()
//                                     //   (@0x12386c7 movq 0x10(%rsi),%rcx).
//   ...                               // fields >0x18 not decoded here
// }
//
// The Bottom() RESULT is a 32-byte value returned by hidden-pointer (sret):
//   result {
//     +0x00  void*   ptr   = this->slotAt10   ; @0x12386cb movq %rcx,(%rdi)
//     +0x08  uint32  n     = 0                 ; @0x12386ce movl $0x0,0x8(%rdi)
//     +0x10  16 bytes      = 0 (two zero qwords); @0x12386d8 movups %xmm0,0x10(%rdi)
//   }
// The result's exact C++ type name is not recovered here (no sibling method or
// ctor decoded yet to name it), so it is modeled by its decoded offsets rather
// than an invented type name, per PORTING_SPEC Rule 5 (model structs by their
// offsets, don't fabricate names). The shape (a pointer + a zeroed count + a
// zeroed 16-byte tail) is faithfully reproduced.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZNK14FFScopedEffect6BottomEv.s — 15 lines)
// -----------------------------------------------------------------------------
//   __ZNK14FFScopedEffect6BottomEv:
//     0x12386c0  pushq  %rbp
//     0x12386c1  movq   %rsp, %rbp
//     0x12386c4  movq   %rdi, %rax                 ; rax = sret ptr (returned in rax)
//     0x12386c7  movq   0x10(%rsi), %rcx           ; rcx = this->slotAt10  (this = rsi)
//     0x12386cb  movq   %rcx, (%rdi)               ; result[+0x00] = this->slotAt10
//     0x12386ce  movl   $0x0, 0x8(%rdi)            ; result[+0x08] = 0 (u32)
//     0x12386d5  xorps  %xmm0, %xmm0               ; xmm0 = 0 (16 zero bytes)
//     0x12386d8  movups %xmm0, 0x10(%rdi)          ; result[+0x10..0x1f] = 0
//     0x12386dc  popq   %rbp
//     0x12386dd  retq                              ; return rax (= sret ptr)
//     0x12386de  nop
//
// ABI: SysV x86_64, const member returning a >16-byte aggregate by value ->
//   hidden sret pointer in %rdi, `this` shifted to %rsi. The method returns
//   the sret pointer in %rax (standard ABI).
//
// FRONTIER CALLEES: none (no callq, no indirect call). Zero in-scope
// dependencies, zero externs — pure field read + struct fill.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK14FFScopedEffect6BottomEv
//       — FFScopedEffect::Bottom() const @Flexo 0x12386c0
//         (raw-port/re/disasm/Flexo.__ZNK14FFScopedEffect6BottomEv.s — 15 lines)

/**
 * The 32-byte value `FFScopedEffect::Bottom()` returns (sret). Modeled by its
 * decoded offsets — the C++ type name is not yet recovered, so we don't
 * fabricate one (PORTING_SPEC Rule 5). The `ptr` qword is a verbatim copy of
 * FFScopedEffect's +0x10 field; the remaining slots are zero-initialized by
 * the method.
 */
export interface FFScopedEffectBottomResult {
  /** result +0x00 — verbatim copy of FFScopedEffect.slotAt10 (@0x12386cb). */
  ptrAt0: object | null;
  /** result +0x08 — zeroed u32 (@0x12386ce movl $0x0). */
  nAt8: number;
  /** result +0x10 — first zeroed qword of the 16-byte tail (@0x12386d8). */
  zeroAt10: number;
  /** result +0x18 — second zeroed qword of the 16-byte tail (@0x12386d8). */
  zeroAt18: number;
}

/**
 * `FFScopedEffect` — instance shape decoded from `Bottom()` alone. Only the
 * +0x10 field read by Bottom() is decoded; the rest of the object is OPAQUE
 * and intentionally NOT modeled — future ports will add fields as their
 * addresses are read.
 */
export class FFScopedEffect {
  /**
   * (this+0x10) — an 8-byte field (pointer-width) copied verbatim into the
   * first qword of `Bottom()`'s result (@0x12386c7 movq 0x10(%rsi),%rcx ->
   * @0x12386cb movq %rcx,(%rdi)). Its concrete type is not decoded here (no
   * writer/reader beyond Bottom() ported yet); modeled as an opaque
   * pointer-width slot.
   */
  slotAt10: object | null = null;

  /**
   * `FFScopedEffect::Bottom() const` @Flexo 0x12386c0
   *   — __ZNK14FFScopedEffect6BottomEv
   *
   * Faithful line-for-line transcription of the 15-line disassembly. Returns
   * (by value / sret) a 32-byte struct whose first qword is a verbatim copy of
   * this->slotAt10 and whose remaining slots (a u32 at +0x8 and a 16-byte tail
   * at +0x10) are zero-initialized.
   *
   *   0x12386c4  movq   %rdi, %rax        ; rax = sret ptr (returned)
   *   0x12386c7  movq   0x10(%rsi), %rcx  ; rcx = this->slotAt10
   *   0x12386cb  movq   %rcx, (%rdi)      ; result.ptrAt0 = this->slotAt10
   *   0x12386ce  movl   $0x0, 0x8(%rdi)   ; result.nAt8 = 0
   *   0x12386d5  xorps  %xmm0, %xmm0      ; xmm0 = 0
   *   0x12386d8  movups %xmm0, 0x10(%rdi) ; result.zeroAt10 = result.zeroAt18 = 0
   *   0x12386dd  retq                     ; return rax (sret ptr)
   *
   * SEMANTICS: builds a fresh result whose "ptr" slot is the FFScopedEffect's
   * +0x10 field and whose other three slots are zero. In TS we return a fresh
   * object (the sret buffer is caller-allocated per call), copying the field
   * reference verbatim (movq copies the pointer bits, not the pointee).
   *
   * Zero in-scope callees, zero externs, no indirect calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Flexo.__ZNK14FFScopedEffect6BottomEv.s (15 lines)
   */
  Bottom(this: FFScopedEffect): FFScopedEffectBottomResult {
    // @0x12386c7 movq 0x10(%rsi),%rcx ; @0x12386cb movq %rcx,(%rdi)
    //   result.ptrAt0 = this->slotAt10 (verbatim pointer copy).
    // @0x12386ce movl $0x0,0x8(%rdi)   -> result.nAt8 = 0
    // @0x12386d5/@0x12386d8 xorps+movups -> result.zeroAt10 = result.zeroAt18 = 0
    return {
      ptrAt0: this.slotAt10,
      nAt8: 0,
      zeroAt10: 0,
      zeroAt18: 0,
    };
  }
}
