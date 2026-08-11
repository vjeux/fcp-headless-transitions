// Json_Value.ts — raw transcription of ProCore `Json::Value`.
//
// FCP links a copy of jsoncpp inside ProCore; `Json::Value` is its variant
// node. ONE symbol is transcribed in this file — `swapPayload(Json::Value&)`,
// the half-swap `Value::swap` uses (payload only: the value union, the type and
// the allocated bit — deliberately NOT the comments/offset members). Every
// other member of the class is a SEPARATE ledger unit and is NOT ported here;
// do not add them without their own disassembly and address citations.
//
// Provenance (ProCore framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Symbol ported in this file:
//   @0xc762e  Json::Value::swapPayload(Json::Value&)
//               __ZN4Json5Value11swapPayloadERS0_
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN4Json5Value11swapPayloadERS0_ ProCore`):
//   raw-port/re/disasm/ProCore.__ZN4Json5Value11swapPayloadERS0_.s (27 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT — exactly the three things this body touches
// ---------------------------------------------------------------------------
//   struct Json::Value {
//     ValueHolder value_;      // +0x00, 8 bytes — swapped whole with two
//                              //   `movq` loads and two stores
//                              //   (@0xc763e..@0xc7647). The union holds an
//                              //   int/uint/double/bool/char*/map*, all 8
//                              //   bytes wide, and this body moves the RAW
//                              //   8 bytes without looking at the type.
//     uint8_t  typeByte;       // +0x08, ONE byte — swapped with the `movb`
//                              //   quartet @0xc7632..@0xc763b. jsoncpp
//                              //   declares this `ValueType type_ : 8`.
//     // +0x09 bit 0           — the `allocated_ : 1` bitfield, i.e. bit 8 of
//                              //   the 16-bit word at +0x08. Swapped SEPARATELY
//                              //   by the mask dance @0xc764a..@0xc7675 with
//                              //   the constants 0x100 (select) and 0xfeff /
//                              //   0xfffffeff (clear). The other seven bits of
//                              //   the +0x09 byte are NOT touched — they belong
//                              //   to neighbouring bitfields this unit must
//                              //   leave alone, which is why the swap is a
//                              //   masked read-modify-write and not a second
//                              //   byte swap.
//     ...                      // comments_/start_/limit_ follow; untouched.
//   };
//
// The port models the +0x08 word as its two bytes — `typeByte` at +0x08 and the
// raw `flagsByte` at +0x09 — because that is the granularity the instructions
// address: a byte swap at +0x08, then a masked bit-8 swap. Modelling
// `allocated_` as a lone boolean would silently drop the other seven bits of
// +0x09 that the read-modify-write is careful to preserve.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `Json::Value` — the jsoncpp variant node as `swapPayload` addresses it.
 *
 * @ProCore 0xc762e
 */
export class Json_Value {
  /**
   * +0x00 — the 8-byte `ValueHolder` union, carried as its raw 64-bit content
   * (`movq (%rdi),%rax` @0xc763e). `swapPayload` never interprets it; neither
   * does this model.
   */
  valueBits_at_0x00 = 0n;

  /**
   * +0x08 — `ValueType type_ : 8`, the whole byte the `movb` swap moves
   * (@0xc7632/@0xc7635/@0xc7638/@0xc763b).
   */
  typeByte_at_0x08 = 0;

  /**
   * +0x09 — the raw byte holding `allocated_ : 1` in its BIT 0 (bit 8 of the
   * 16-bit word at +0x08, the `0x100` the mask dance selects @0xc7655) plus the
   * neighbouring bitfields in bits 1..7, which this unit preserves.
   */
  flagsByte_at_0x09 = 0;

  /**
   * `Json::Value::swapPayload(Json::Value&)` — @ProCore 0xc762e
   *   __ZN4Json5Value11swapPayloadERS0_
   *
   * Full transcription — every instruction, in order:
   *
   *   0xc762e  pushq  %rbp                ; frame setup (no TS counterpart)
   *   0xc762f  movq   %rsp,%rbp           ; frame setup (no TS counterpart)
   *   0xc7632  movb   0x8(%rdi),%al       ; al = this.typeByte
   *   0xc7635  movb   0x8(%rsi),%cl       ; cl = other.typeByte
   *   0xc7638  movb   %cl,0x8(%rdi)       ; this.typeByte  = other's
   *   0xc763b  movb   %al,0x8(%rsi)       ; other.typeByte = this's
   *   0xc763e  movq   (%rdi),%rax         ; rax = this.value_
   *   0xc7641  movq   (%rsi),%rcx         ; rcx = other.value_
   *   0xc7644  movq   %rcx,(%rdi)         ; this.value_  = other's
   *   0xc7647  movq   %rax,(%rsi)         ; other.value_ = this's
   *   0xc764a  movzwl 0x8(%rdi),%eax      ; eax = this's 16-bit word at +0x08
   *                                       ;   (ALREADY carrying the swapped
   *                                       ;   type byte from above)
   *   0xc764e  movl   $0x100,%ecx         ; the allocated_ bit selector
   *   0xc7653  movl   %eax,%edx
   *   0xc7655  andl   %ecx,%edx           ; edx = this's allocated_ bit
   *   0xc7657  movzwl 0x8(%rsi),%r8d      ; other's word
   *   0xc765c  andl   %ecx,%r8d           ; r8d = other's allocated_ bit
   *   0xc765f  andl   $0xfeff,%eax        ; clear this's allocated_ bit
   *   0xc7664  orl    %r8d,%eax           ;   … and take other's
   *   0xc7667  movw   %ax,0x8(%rdi)       ; store back 16 bits
   *   0xc766b  movl   $0xfffffeff,%eax
   *   0xc7670  andl   0x8(%rsi),%eax      ; other's word (32-bit LOAD) minus its
   *                                       ;   allocated_ bit
   *   0xc7673  orl    %edx,%eax           ;   … plus this's saved bit
   *   0xc7675  movw   %ax,0x8(%rsi)       ; store back only 16 bits
   *   0xc7679  popq   %rbp                ; frame teardown (no TS counterpart)
   *   0xc767a  retq                       ; returns void
   *   0xc767b  nop                        ; alignment padding, not executed
   *
   * Decode notes:
   *   * the type byte is swapped FIRST with plain `movb`, and only then is the
   *     16-bit word re-read (@0xc764a) — so the bitfield dance operates on the
   *     already-swapped low byte and must not disturb it. It does not: `0xfeff`
   *     clears exactly bit 8 and the `orl` puts exactly bit 8 back.
   *   * @0xc7670 loads THIRTY-TWO bits from other+0x08 (`andl` with a memory
   *     operand) but the store @0xc7675 is a `movw` — the upper 16 bits are
   *     read and discarded, so bytes +0x0a/+0x0b are untouched. The port
   *     reproduces the WRITTEN state, which is the observable one; it does not
   *     model the wider read because nothing depends on it.
   *   * the value union moves as raw bytes, with no type dispatch and no
   *     ownership transfer — that is precisely why jsoncpp needs the
   *     `allocated_` bit to travel with it, and why this function exists.
   *   * NO comment/offset member is touched: `swapPayload` is the PAYLOAD-only
   *     half of `Value::swap`, which swaps the rest separately.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param other the `Json::Value&` in %rsi.
   */
  swapPayload(other: Json_Value): void {
    // @0xc7632..@0xc763b  the four `movb` — swap the whole +0x08 type byte.
    const thisType = this.typeByte_at_0x08 & 0xff;
    const otherType = other.typeByte_at_0x08 & 0xff;
    this.typeByte_at_0x08 = otherType;
    other.typeByte_at_0x08 = thisType;

    // @0xc763e..@0xc7647  the four `movq` — swap the 8-byte value union.
    const thisValue = this.valueBits_at_0x00;
    const otherValue = other.valueBits_at_0x00;
    this.valueBits_at_0x00 = otherValue;
    other.valueBits_at_0x00 = thisValue;

    // @0xc764a..@0xc7675  swap ONLY bit 8 of the 16-bit word at +0x08, i.e.
    //   bit 0 of the +0x09 byte (`allocated_`), preserving bits 1..7.
    const thisAllocated = this.flagsByte_at_0x09 & 0x01; // andl $0x100 @0xc7655
    const otherAllocated = other.flagsByte_at_0x09 & 0x01; // andl $0x100 @0xc765c
    // andl $0xfeff ; orl — this keeps everything but bit 8, then takes other's.
    this.flagsByte_at_0x09 = ((this.flagsByte_at_0x09 & 0xfe) | otherAllocated) & 0xff;
    // andl $0xfffffeff ; orl — the mirror for `other`.
    other.flagsByte_at_0x09 = ((other.flagsByte_at_0x09 & 0xfe) | thisAllocated) & 0xff;
    // @0xc767a  retq
  }
}
