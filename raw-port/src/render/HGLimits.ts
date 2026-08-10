// HGLimits.ts — Helium framework (render layer).
//
// FCP `HGLimits` — the packed shader/device capability descriptor that Helium
// threads through its shader emitters. Its first field is a 32-bit "format
// code" whose bit-fields are read by a long family of one-line `is*()`
// predicates (`family`, `type`, `arch`, `version`, `revision`, `isgpu`,
// `isprimitive`, `ispack`, `isgeometry`, `isvertex`, `isfragment`, `isunpack`,
// `isasm`, `isarb`, `isarbfp`, `isarbvp`, `isglfs`, `isglvs`, `ismetal`,
// `isdirect`, `issafe`, `isconcat`, `istexhalf`, `isenv`, `normalized`,
// `setnormalized`, `texturerect`, `test`) laid out contiguously at
// @0xa7870..@0xa7b50.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice; VAs unadjusted, as
//         printed by otool -tV).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * HGLimits::isfragment() const                 @Helium 0xa7960
//     __ZNK8HGLimits10isfragmentEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK8HGLimits10isfragmentEv.s
//
// Layout evidence (read for grounding, NOT ported here — each is its own
// ledger unit and stays `todo`):
//   raw-port/re/disasm/Helium.__ZNK8HGLimits8isvertexEv.s     @0xa7940
//   raw-port/re/disasm/Helium.__ZNK8HGLimits10isgeometryEv.s  @0xa7920
//
// -----------------------------------------------------------------------------
// FULL DISASM (8 lines, @0xa7960..@0xa7977; @0xa7978 is alignment padding)
// -----------------------------------------------------------------------------
//   __ZNK8HGLimits10isfragmentEv:
//     0xa7960  pushq %rbp
//     0xa7961  movq  %rsp, %rbp
//     0xa7964  movl  $0xf0000, %ecx    ## imm = 0xF0000 ; ecx = stage mask
//     0xa7969  andl  (%rdi), %ecx      ; ecx = *(u32*)(this+0x00) & 0xf0000
//     0xa796b  xorl  %eax, %eax        ; eax = 0 (the false result)
//     0xa796d  cmpl  $0x60000, %ecx    ## imm = 0x60000 ; ecx - 0x60000
//     0xa7973  sete  %al               ; al = ZF = (masked == 0x60000)
//     0xa7976  popq  %rbp
//     0xa7977  retq
//     0xa7978  nopl  (%rax,%rax)       ; padding, not code
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT
// -----------------------------------------------------------------------------
//   HGLimits {
//     +0x000  uint32_t  formatCode   // read as a 32-bit operand by `andl
//                                    // (%rdi),%ecx` @0xa7969
//   }
// Only +0x00 is touched by this method, so no other field is modelled
// (PORTING_SPEC Rule 5 — no fabricated fields).
//
// The `0xf0000` mask isolates BITS 16..19 of `formatCode` — a 4-bit shader
// STAGE selector. Three sibling predicates prove that reading: all three are
// byte-for-byte the same six instructions on the same field with the same
// mask, differing only in the compared stage value.
//
//   @0xa7924/0xa7929/0xa792d  isgeometry:  (fc & 0xf0000) == 0x30000  -> stage 3
//   @0xa7944/0xa7949/0xa794d  isvertex:    (fc & 0xf0000) == 0x50000  -> stage 5
//   @0xa7964/0xa7969/0xa796d  isfragment:  (fc & 0xf0000) == 0x60000  -> stage 6
//
// This is corroborated by the already-landed decode in
// raw-port/src/channels/glsl.ts, whose `begin` header table lists format code
// 0x50700 for the `//GLvs` (vertex-shader) header: 0x50700 & 0xf0000 = 0x50000,
// which is exactly the stage value `isvertex` tests for.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. `isfragment` is a leaf: one masked 32-bit load, one compare, one
// `sete`. `depgraph.py deps __ZNK8HGLimits10isfragmentEv` reports nothing at
// all (0 in-scope callees, 0 externs, 0 indirect) — a wave-0 leaf.
//
// Numerics: integer only. The `andl`/`cmpl` pair is a 32-bit unsigned compare;
// `Math.fround` does not apply.

/**
 * The stage bit-field mask, `movl $0xf0000,%ecx` @0xa7964 (and the identical
 * @0xa7944 in `isvertex`, @0xa7924 in `isgeometry`). Selects bits 16..19 of
 * `HGLimits.formatCode`.
 */
const HGLIMITS_STAGE_MASK = 0xf0000;

/**
 * The masked stage value that marks a FRAGMENT program, `cmpl $0x60000,%ecx`
 * @0xa796d.
 */
const HGLIMITS_STAGE_FRAGMENT = 0x60000;

/**
 * `HGLimits` — Helium's packed shader/device capability descriptor.
 *
 * Only the 32-bit `formatCode` at +0x00 (the sole field `isfragment` reads) is
 * decoded here. The remaining ~27 accessors listed in the header comment are
 * separate ledger units and must be ADDED to this class as they land.
 */
export class HGLimits {
  /**
   * @Helium offset +0x00 — the packed `uint32_t` format code.
   *
   * Read @0xa7969 via `andl (%rdi),%ecx`, a 32-bit operand, which is what
   * pins the field width at u32. Bits 16..19 hold the shader stage (see the
   * three-way sibling table in the header comment). Its writer lives in a
   * not-yet-ported HGLimits method and is out of scope for this unit — here
   * the field is only observed as a read.
   */
  formatCode_at_0x00: number = 0;

  /**
   * `HGLimits::isfragment() const` — @Helium 0xa7960
   * (__ZNK8HGLimits10isfragmentEv).
   *
   * Faithful transcription of the 8-line disassembly quoted in the header:
   *
   *   0xa7964  movl $0xf0000, %ecx    ; ecx = 0xf0000
   *   0xa7969  andl (%rdi), %ecx      ; ecx &= *(u32*)(this+0x00)
   *   0xa796d  cmpl $0x60000, %ecx    ; ecx - 0x60000
   *   0xa7973  sete %al               ; al = ZF = (ecx == 0x60000)
   *
   * Returns whether the stage nibble of `formatCode` selects the fragment
   * stage. STRICT equality on the MASKED value (`sete`, ZF) — not a bit test
   * and not a range check: the machine masks first, then compares the whole
   * masked word against 0x60000, so a code with extra bits set outside the
   * mask still matches, while one with a different stage nibble never does.
   *
   * No in-scope callees, no externs, no indirect calls. The `const` qualifier
   * matches the `__ZNK...` mangling; the body only reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK8HGLimits10isfragmentEv.s
   */
  isfragment(): boolean {
    // @0xa7964-@0xa7969: ecx = 0xf0000 & *(u32*)(this+0x00)
    const masked = ((this.formatCode_at_0x00 >>> 0) & HGLIMITS_STAGE_MASK) >>> 0;
    // @0xa796d-@0xa7973: cmpl $0x60000, %ecx ; sete %al
    return masked === HGLIMITS_STAGE_FRAGMENT;
  }
}
