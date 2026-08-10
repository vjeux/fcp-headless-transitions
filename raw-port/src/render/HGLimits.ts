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
// SYMBOLS PORTED IN THIS FILE
// -----------------------------------------------------------------------------
//   * HGLimits::isfragment() const                 @Helium 0xa7960
//     __ZNK8HGLimits10isfragmentEv
//   * HGLimits::isarb() const                      @Helium 0xa79c0
//     __ZNK8HGLimits5isarbEv
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK8HGLimits10isfragmentEv.s
//   raw-port/re/disasm/Helium.__ZNK8HGLimits5isarbEv.s
//
// Layout evidence (read for grounding, NOT ported here — each is its own
// ledger unit and stays `todo`):
//   raw-port/re/disasm/Helium.__ZNK8HGLimits8isvertexEv.s     @0xa7940
//   raw-port/re/disasm/Helium.__ZNK8HGLimits10isgeometryEv.s  @0xa7920
//   raw-port/re/disasm/Helium.__ZNK8HGLimits7isarbfpEv.s      @0xa79f0
//   raw-port/re/disasm/Helium.__ZNK8HGLimits7isarbvpEv.s      @0xa7a10
//   raw-port/re/disasm/Helium.__ZNK8HGLimits5isasmEv.s        @0xa79a0
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
// FULL DISASM (11 lines, @0xa79c0..@0xa79e6; @0xa79e7 is alignment padding)
// -----------------------------------------------------------------------------
//   __ZNK8HGLimits5isarbEv:
//     0xa79c0  pushq  %rbp
//     0xa79c1  movq   %rsp, %rbp
//     0xa79c4  movl   (%rdi), %ecx          ; ecx = *(u32*)(this+0x00) = fc
//     0xa79c6  movl   %ecx, %edx            ; edx = fc
//     0xa79c8  andl   $0xff00, %edx         ## imm = 0xFF00  ; edx = language byte
//     0xa79ce  addl   $0xfffffd00, %edx     ## imm = 0xFFFFFD00 ; edx -= 0x300 (wraps)
//     0xa79d4  andl   $0xf0000, %ecx        ## imm = 0xF0000 ; ecx = stage nibble
//     0xa79da  xorl   %eax, %eax            ; eax = 0 (the "not ARB" result)
//     0xa79dc  cmpl   $0x101, %edx          ## imm = 0x101   ; edx - 0x101
//     0xa79e2  cmovbl %ecx, %eax            ; CF=1 (edx < 0x101 unsigned) -> eax = ecx
//     0xa79e5  popq   %rbp
//     0xa79e6  retq
//     0xa79e7  nopw   (%rax,%rax)           ; padding, not code
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
// `isarb` pins a SECOND bit-field: the `0xff00` mask @0xa79c8 isolates BITS
// 8..15, the shader LANGUAGE byte. Because that field is a multiple of 0x100,
// the `edx -= 0x300; edx < 0x101 (unsigned)` idiom @0xa79ce/@0xa79dc is an
// exact two-value membership test:
//   * language >= 0x300 -> edx = language - 0x300, itself a multiple of 0x100,
//     so `edx < 0x101` admits only edx = 0x000 and edx = 0x100;
//   * language <  0x300 -> the subtract wraps to ~0xffffff00 and fails.
//   => taken iff (fc & 0xff00) == 0x300 or (fc & 0xff00) == 0x400.
// So languages 3 and 4 are the two ARB assembly dialects. Corroborated by the
// two dialect-specific siblings, which mask the WHOLE low 20 bits
// (`movl $0xfffff,%ecx ; andl (%rdi),%ecx`) and range-test stage+language+
// version together with the same `cmovb` shape:
//   @0xa79fb  isarbfp: (fc & 0xfffff) - 0x60310 < 0x131 -> [0x60310,0x60440]
//   @0xa7a1b  isarbvp: (fc & 0xfffff) - 0x50310 < 0x131 -> [0x50310,0x50440]
// Both windows start at language 0x03 and end inside language 0x04 — the same
// pair `isarb` accepts — with stage 6 (fragment) for fp and stage 5 (vertex)
// for vp, matching the stage table above. `isasm` @0xa79a4 masks 0xfe00 and
// tests `< 0x600`, i.e. the ARB languages are a subset of the "assembly"
// languages, exactly as the names imply.
//
// -----------------------------------------------------------------------------
// RETURN TYPE OF isarb
// -----------------------------------------------------------------------------
// `isarb` does NOT return a 0/1 boolean: on the taken side `cmovbl %ecx,%eax`
// @0xa79e2 moves the whole masked STAGE value (0x00000..0xf0000) into %eax.
// The declared C++ type therefore cannot be `bool` — a bool return is read
// from %al alone, and every possible value of `fc & 0xf0000` has a ZERO low
// byte, which would make the predicate unconditionally false. It is an
// integer return (`unsigned int`), nonzero exactly when the limits describe an
// ARB program, and carrying the stage nibble as the nonzero payload. The two
// dialect siblings @0xa7a09/@0xa7a29 use the identical `cmovbl %ecx,%eax`
// shape with an even wider payload, confirming the convention.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero for both. `isfragment` is a leaf: one masked 32-bit load, one compare,
// one `sete`. `isarb` is a leaf: one 32-bit load, two masks, one add, one
// compare, one `cmovb`. `depgraph.py deps` for
// __ZNK8HGLimits10isfragmentEv and __ZNK8HGLimits5isarbEv both report nothing
// at all (0 in-scope callees, 0 externs, 0 indirect) — wave-0 leaves.
//
// Numerics: integer only. Every compare here is a 32-bit UNSIGNED compare
// (`jb`/`cmovb` read CF); `Math.fround` does not apply.

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
 * The language bit-field mask, `andl $0xff00,%edx` @0xa79c8. Selects bits
 * 8..15 of `HGLimits.formatCode`.
 */
const HGLIMITS_LANGUAGE_MASK = 0xff00;

/**
 * The bias `isarb` adds before its unsigned window test,
 * `addl $0xfffffd00,%edx` @0xa79ce — i.e. subtract 0x300, the first ARB
 * language value.
 */
const HGLIMITS_ISARB_BIAS = 0xfffffd00;

/**
 * The exclusive width of `isarb`'s unsigned window, `cmpl $0x101,%edx`
 * @0xa79dc. Since the biased value is always a multiple of 0x100, this admits
 * exactly the two languages 0x300 and 0x400.
 */
const HGLIMITS_ISARB_WINDOW = 0x101;

/**
 * `HGLimits` — Helium's packed shader/device capability descriptor.
 *
 * Only the 32-bit `formatCode` at +0x00 (the sole field both `isfragment` and
 * `isarb` read) is decoded here. The remaining ~26 accessors listed in the
 * header comment are separate ledger units and must be ADDED to this class as
 * they land.
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

  /**
   * `HGLimits::isarb() const` — @Helium 0xa79c0 (__ZNK8HGLimits5isarbEv).
   *
   * Faithful transcription of the 11-line disassembly quoted in the header:
   *
   *   0xa79c4  movl   (%rdi), %ecx        ; ecx = fc
   *   0xa79c6  movl   %ecx, %edx          ; edx = fc
   *   0xa79c8  andl   $0xff00, %edx       ; edx = language byte
   *   0xa79ce  addl   $0xfffffd00, %edx   ; edx -= 0x300  (32-bit wrapping)
   *   0xa79d4  andl   $0xf0000, %ecx      ; ecx = stage nibble
   *   0xa79da  xorl   %eax, %eax          ; eax = 0
   *   0xa79dc  cmpl   $0x101, %edx        ; edx - 0x101
   *   0xa79e2  cmovbl %ecx, %eax          ; if edx < 0x101 (unsigned) eax = ecx
   *
   * Returns the STAGE nibble (`fc & 0xf0000`) when the language byte
   * (`fc & 0xff00`) is one of the two ARB dialects 0x300 / 0x400, and 0
   * otherwise — NOT a 0/1 boolean; see the "RETURN TYPE OF isarb" note in the
   * header for why `bool` is ruled out by the `cmovbl` payload.
   *
   * Both the add and the compare are 32-bit and the branch condition is
   * `cmovb` = CF, an UNSIGNED compare, so the subtract deliberately WRAPS for
   * languages below 0x300 and the window rejects them. That wrap is load
   * bearing and is reproduced here with `>>> 0` on the biased value rather
   * than being simplified into a two-way equality test.
   *
   * No in-scope callees, no externs, no indirect calls. The `const` qualifier
   * matches the `__ZNK...` mangling; the body only reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK8HGLimits5isarbEv.s
   *
   * @returns the stage nibble when the format code names an ARB program,
   *          else 0.
   */
  isarb(): number {
    // @0xa79c4: ecx = *(u32*)(this+0x00)
    const fc = this.formatCode_at_0x00 >>> 0;
    // @0xa79c6-@0xa79c8: edx = fc & 0xff00
    let edx = (fc & HGLIMITS_LANGUAGE_MASK) >>> 0;
    // @0xa79ce: edx += 0xfffffd00 (i.e. -0x300), wrapping at 32 bits
    edx = (edx + HGLIMITS_ISARB_BIAS) >>> 0;
    // @0xa79d4: ecx = fc & 0xf0000
    const ecx = (fc & HGLIMITS_STAGE_MASK) >>> 0;
    // @0xa79da: eax = 0
    let eax = 0;
    // @0xa79dc-@0xa79e2: cmpl $0x101,%edx ; cmovbl %ecx,%eax  (CF => edx < 0x101)
    if (edx < HGLIMITS_ISARB_WINDOW) eax = ecx;
    // @0xa79e6: retq — %eax
    return eax;
  }
}
