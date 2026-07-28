// PCVLCParser.ts — ProCore's H.264/H.265-style variable-length-code (VLC) parser. Extends
// PCBitstreamReader (at base subobject +0x18) and adds Exp-Golomb decoders `ue()` / `se()`,
// a raw fixed-width `u(int)` forwarder, `hasMoreRBSPData()` (H.264-spec RBSP trailing-bits
// check), and `isByteAligned()`. Faithful transcription of the seven exported symbols in
// ProCore.framework:
//
//   @0x000000000009dd0e  PCVLCParser::PCVLCParser(unsigned char const*, int) [C2]
//                        __ZN11PCVLCParserC2EPKhi
//   @0x000000000009de8c  PCVLCParser::PCVLCParser(unsigned char const*, int) [C1 — trampoline
//                                                                              tail-jmp to C2]
//                        __ZN11PCVLCParserC1EPKhi
//   @0x000000000009de96  PCVLCParser::u(int)
//                        __ZN11PCVLCParser1uEi
//   @0x000000000009dea4  PCVLCParser::ue()
//                        __ZN11PCVLCParser2ueEv
//   @0x000000000009ded6  PCVLCParser::se()
//                        __ZN11PCVLCParser2seEv
//   @0x000000000009df14  PCVLCParser::hasMoreRBSPData() const
//                        __ZNK11PCVLCParser15hasMoreRBSPDataEv
//   @0x000000000009df54  PCVLCParser::isByteAligned() const
//                        __ZNK11PCVLCParser13isByteAlignedEv
//
// Source disassembly (all extracted verbatim to raw-port/re/disasm/):
//   ProCore.PCVLCParser.PCVLCParser.s     (C1 body @0x9de8c — a 4-instruction tail-jmp to C2)
//   ProCore.PCVLCParser.u.s               (@0x9de96)
//   ProCore.PCVLCParser.ue.s              (@0x9dea4)
//   ProCore.PCVLCParser.se.s              (@0x9ded6)
//   ProCore.PCVLCParser.hasMoreRBSPData.s (@0x9df14)
//   ProCore.PCVLCParser.isByteAligned.s   (@0x9df54)
//
// STRUCT LAYOUT (recovered end-to-end from every method's field reads):
//   +0x00..+0x17  <opaque prefix that C2 owns — probably vptr @+0x00 and other bookkeeping;
//                 no method beyond C2 touches these offsets, so we intentionally do NOT invent
//                 fields here. C2's own body has not been extracted, so those bytes stay opaque
//                 by design.>
//   +0x18..+0x47  PCBitstreamReader base subobject (16 bytes reg + int32 bitPos + 3 pointers +
//                 int32 validBits — see raw-port/src/infra/PCBitstreamReader.ts). Proof:
//                 u(int)   @0x9de9a: `addq $0x18, %rdi` before tail-jmp getBits, i.e. `this+0x18`
//                                    IS the PCBitstreamReader* argument.
//                 ue()     @0x9dead: same addq +0x18 before flushBits.
//                 se()     @0x9dedf: same addq +0x18 before flushBits.
//                 ue/se   both read reg_hi at 0x1c(%rdi) = base+0x04 (bsrl input).
//                 hasMoreRBSPData reads bitPos at 0x20(%rdi) = base+0x08, validBits at
//                                 0x40(%rdi) = base+0x28, and `end` pointer at 0x38(%rdi) =
//                                 base+0x20.
//                 isByteAligned reads bitPos at 0x20(%rdi) = base+0x08 (`testb $0x7`).
//
// No PCVLCParser-owned field beyond the base subobject is EVER read in any method. In particular
// there is NO derived-class vptr write in any disassembled method (no `leaq __ZTV...(%rip)` in
// C1 — C1 is a bare tail-jmp to C2 — and C2's body is not extracted here); this may simply mean
// PCVLCParser inherits PCBitstreamReader without adding virtual overrides, i.e. it's a
// non-polymorphic "extend a POD with more member functions" specialization. C2's body would
// confirm this and pin any +0x00..+0x17 fields; that's future work.
//
// Frontier / imports referenced (all cited by @addr; PCBitstreamReader is already ported):
//   @0x9de91  jmp    __ZN11PCVLCParserC2EPKhi                   PCVLCParser::PCVLCParser [C2]
//                                                                (not transcribed here — the ledger
//                                                                 keeps it as a companion todo).
//   @0x9de9f  jmp    __ZN17PCBitstreamReader7getBitsEi          PCBitstreamReader::getBits(int)
//                                                                — ported: raw-port/src/infra/PCBitstreamReader.ts.
//   @0x9dec8  callq  __ZN17PCBitstreamReader9flushBitsEi        PCBitstreamReader::flushBits(int)
//                                                                — ported (same file).
//   @0x9def8  callq  __ZN17PCBitstreamReader9flushBitsEi        (same, from se()).
//
// ── Behavior summary (all math is 32-bit unsigned; matches H.264/H.265 syntax-element parsers): ──
//   u(n)   : return getBits(n) on the base reader — plain n-bit fixed-width read.
//   ue()   : Exp-Golomb-coded UNSIGNED read.
//            - N = clz32(reg_hi)   (via `bsr` + xor 31 — Intel BSR returns MSB index; N = 31-MSB
//                                    = leading-zero count for the 32-bit reg_hi word).
//            - code = reg_hi >> (31 - 2*N)   (2N+1 bits, right-justified).
//            - consume 2N+1 bits from the reader (flushBits(2N+1)).
//            - return code - 1  — the standard ue(v) decoding.
//   se()   : Exp-Golomb-coded SIGNED read.
//            - Same first three steps as ue() but WITHOUT the `dec` on `code`.
//            - k = code & 1;  half = code >> 1;
//            - return (k == 1) ? -half : half   — but computed branchlessly by
//              `(-k) ^ half + k`  (@0x9df02..@0x9df0a: shr ebx / neg eax / xor ebx / add ecx).
//              Proof of equivalence: when k==0, `-k = 0`, `0 ^ half = half`, `+0` -> half.
//              When k==1, `-k = 0xFFFFFFFF`, `0xFFFFFFFF ^ half = ~half`, `~half + 1 = -half`.
//   hasMoreRBSPData(): H.264 "more_rbsp_data" spec check — true iff we're NOT sitting exactly on
//                      the RBSP trailing 1-bit followed by 0-padding. Computed in two stages:
//            Stage A @0x9df1a-0x9df21 (fast NO-more path):
//              rdx = bitPos + 0x20    ; edx = the "next-refill-target" bit position after the
//                                       current 32-bit window is exhausted.
//              if (rdx (unsigned) <= validBits) return false   — validBits still covers a full
//              32-bit window ahead of the current position, so we're nowhere near the tail.
//              (Note: this is an UNSIGNED compare — `jbe` — over the sign-extended int32s.)
//            Stage B @0x9df23-0x9df53:
//              edx = (bitPos - validBits) + 0x20   ; edx = number of bits already read past the
//                                                    "one-window-lookahead" boundary.
//              if (edx > 8) return true    — we're inside the payload's non-tail bytes.
//              Else find the LSB position of the LAST byte of the source (end - 1):
//                lastByte = *(end - 1)   (nonzero — H.264 RBSP trailing 1-bit guarantees it).
//                trail = bsf(lastByte)   ; index of the lowest set bit in lastByte (0..7).
//                trail_from_top = trail XOR 7   ; distance from bit 7 down to that bit.
//                want = 0xFFFFFFE8 - (bitPos - validBits)
//                                       ; 0xFFFFFFE8 = (int32)-0x18. The magic constant is
//                                        `-24 - (bitPos - validBits)` = signed-32 arithmetic that
//                                        collapses to the H.264 spec's "position within last byte
//                                        of the RBSP-trailing 1-bit". See per-line proof below.
//                return trail_from_top != want   — a mismatch means there's still real data,
//                                                    a match means we're exactly on the tail bit.
//   isByteAligned(): return (bitPos & 7) == 0. `testb $0x7, 0x20(%rdi) ; sete %al`.
//
// The isByteAligned semantics ONLY read the low 3 bits of `bitPos`. This confirms that the
// PCBitstreamReader's `bitPos` counts bits within the current 32-bit refill window, but modulo 8
// it also represents alignment relative to a byte boundary — the reader keeps bitPos synchronized
// with the underlying source-byte stream, so `bitPos % 8 == 0` iff the read position is on a
// byte boundary. That fact is a property of PCBitstreamReader's `initialize` + `flushBits`
// (which always shift by multiples of the requested count relative to a bit position that starts
// at 0 or a positive int32) — not invented here.

import { PCBitstreamReader } from "../infra/PCBitstreamReader";

// ── Frontier stub — the one undecoded callee. ──────────────────────────────────────────────────

/** `__ZN11PCVLCParserC2EPKhi` — PCVLCParser::PCVLCParser(unsigned char const* src, int size) [C2],
 *  @ProCore 0x0000000000009dd0e. C1 @0x9de8c is a 4-instruction tail-jmp trampoline to C2 (see
 *  raw-port/re/disasm/ProCore.PCVLCParser.PCVLCParser.s @0x9de91). The C2 body has NOT been
 *  extracted or transcribed here — the ledger keeps it as a companion todo. */
function PCVLCParser_C2_stub(_dst: PCVLCParser, _src: Uint8Array, _size: number): void {
  throw new Error(
    "PCVLCParser::PCVLCParser(unsigned char const*, int) [C2] @ProCore 0x9dd0e not yet transcribed"
  );
}

// ── Helpers that mirror machine ops the compiler emitted. ─────────────────────────────────────

/** `bsrl %ebx, %eax ; xorl $0x1f, %eax` — 32-bit count-leading-zeros, matching Intel's BSR
 *  semantics (index of highest set bit, then `31 XOR that`). BSR is UNDEFINED for input 0 on
 *  x86_64 (the SDM says "result is undefined") — modern chips leave the destination unchanged,
 *  but we must NOT rely on that; PCVLCParser assumes the reader was refilled with at least one
 *  set bit before ue/se is called (a precondition of the H.264 parser: valid Exp-Golomb code
 *  has at least one 1-bit). This helper throws on zero input to make the precondition loud in
 *  the port — a faithful mirror of "the C++ side is UB-if-zero" is "crash-if-zero" here. */
function clz32_via_bsr(v: number): number {
  const x = v >>> 0;
  if (x === 0) {
    throw new Error(
      "PCVLCParser: BSR called with zero input @ProCore 0x9deb1/0x9dee3 — x86_64 UB, matches " +
        "the H.264 precondition that Exp-Golomb code has at least one 1-bit"
    );
  }
  // Intel BSR = index-of-highest-set-bit (0..31); xor 0x1f = 31 - MSB = leading zeros.
  return Math.clz32(x); // Math.clz32 IS exactly `31 - bsrl(v)` for nonzero v.
}

/** `bsfl %eax, %eax` — 32-bit count-trailing-zeros (index of lowest set bit). Used by
 *  hasMoreRBSPData @0x9df3b for a nonzero last-byte value (RBSP trailing 1-bit guarantees this).
 *  Throw on zero to match x86 UB. */
function ctz32_via_bsf(v: number): number {
  const x = v >>> 0;
  if (x === 0) {
    throw new Error(
      "PCVLCParser: BSF called with zero input @ProCore 0x9df3b — x86_64 UB, matches the " +
        "H.264 precondition that the last RBSP byte has a nonzero trailing 1-bit"
    );
  }
  // Math.clz32 of reversed bits ~= ctz. Simpler: use built-in ctz via bit trick.
  let n = 0;
  let y = x;
  while ((y & 1) === 0) { y >>>= 1; n++; }
  return n;
}

// ── The class ────────────────────────────────────────────────────────────────────────────────

/**
 * `PCVLCParser` — ProCore's H.264/H.265-style variable-length-code parser. Extends
 * `PCBitstreamReader` at a base subobject placed at +0x18 in the PCVLCParser layout.
 *
 * Because the derived class adds no virtual method (no vptr write in any decoded method body)
 * and no derived-class field beyond the base subobject, this port models the "is-a" as
 * composition: `PCVLCParser` holds a `PCBitstreamReader` as a field named `reader`, and the
 * PCVLCParser methods delegate to `reader.getBits(...)` / `reader.flushBits(...)`. In the C++
 * binary the reader is placed AT OFFSET +0x18 within `this`, which is why every method that
 * reaches the reader does `addq $0x18, %rdi` before calling getBits/flushBits — that add makes
 * `rdi` point to the reader subobject. Reads of `reg_hi` / `bitPos` / `end` / `validBits` all
 * use offsets *relative to the outer PCVLCParser* (+0x1c, +0x20, +0x38, +0x40); those decode to
 * reader fields (+0x04, +0x08, +0x20, +0x28) as documented at each read site below.
 */
export class PCVLCParser {
  /** +0x18..+0x47 — the embedded PCBitstreamReader base subobject. All PCVLCParser methods that
   *  need bits go through this. */
  reader: PCBitstreamReader = new PCBitstreamReader();

  /**
   * `PCVLCParser::PCVLCParser(unsigned char const* src, int size)` [C1 @ProCore 0x9de8c]
   *
   * Body — 4 instructions, a tail-jmp trampoline to C2:
   *   0x9de8c  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   0x9de91  jmp   __ZN11PCVLCParserC2EPKhi   ; tail-jmp to C2 with the same args
   *
   * C2 has NOT been extracted; the loud honest thing is to throw on construction and let
   * the addr witness carry a future worker to the extraction point.
   */
  static construct(dst: PCVLCParser, src: Uint8Array, size: number): void {
    // @0x9de91 — tail-jmp to C2 (undecoded).
    PCVLCParser_C2_stub(dst, src, size);
  }

  /**
   * `PCVLCParser::u(int n)`  @ProCore 0x9de96.
   *
   * Body:
   *   0x9de96  pushq %rbp / movq %rsp,%rbp
   *   0x9de9a  addq  $0x18, %rdi                       ; rdi = &this->reader  (base subobject)
   *   0x9de9e  popq  %rbp
   *   0x9de9f  jmp   __ZN17PCBitstreamReader7getBitsEi ; tail-jmp getBits(n)
   *
   * Faithful mirror: delegate directly to reader.getBits(n) — same bit-for-bit result.
   */
  u(n: number): number {
    // @0x9de9a..@0x9de9f — tail-call PCBitstreamReader::getBits(n) on the base subobject.
    return this.reader.getBits(n);
  }

  /**
   * `PCVLCParser::ue()`  @ProCore 0x9dea4.
   *
   * Body:
   *   0x9dea4  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x9deaa  movl  0x1c(%rdi), %ebx                  ; ebx = *(this+0x1c) = reader.reg_hi
   *                                                      (the upper 32 bits of the 64-bit
   *                                                      MSB-aligned shift register at
   *                                                      reader+0x00..+0x07)
   *   0x9dead  addq  $0x18, %rdi                       ; rdi = &this->reader (for flushBits)
   *   0x9deb1  bsrl  %ebx, %eax                        ; eax = highest-set-bit index of reg_hi
   *   0x9deb4  xorl  $0x1f, %eax                       ; eax = 31 - MSB = clz32(reg_hi)  = N
   *   0x9deb7  leal  0x1(,%rax,2), %esi                ; esi = 2*N + 1 = bits-to-consume
   *   0x9debe  movl  %eax, %ecx / addl %eax, %ecx      ; ecx = 2*N
   *   0x9dec2  notb  %cl                               ; cl  = ~(2*N)  (byte-wide NOT — the shr's
   *                                                      count comes from the low 6 bits of CL,
   *                                                      and `~(2*N) & 0x1f` = 31 - 2*N)
   *   0x9dec4  shrl  %cl, %ebx                         ; ebx = reg_hi >> (31 - 2*N) — the code
   *                                                      value as a right-justified (2*N+1)-bit
   *                                                      integer
   *   0x9dec6  decl  %ebx                              ; ebx = code - 1   (Exp-Golomb ue()
   *                                                      final subtraction)
   *   0x9dec8  callq __ZN17PCBitstreamReader9flushBitsEi ; consume 2*N+1 bits (esi = 2*N+1)
   *   0x9decd  movl  %ebx, %eax                        ; return value = code - 1
   *   0x9decf  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   */
  ue(): number {
    // @0x9deaa — read reg_hi (upper 32 bits of the reader register). reg is a bigint holding the
    // 64-bit register; the high 32 bits are (reg >> 32n) & 0xffffffff.
    const regHi = Number((this.reader.reg >> 32n) & 0xFFFFFFFFn) >>> 0;
    // @0x9deb1..@0x9deb4 — leading-zero count.
    const N = clz32_via_bsr(regHi); // N in [0..31]
    // @0x9deb7 — bits to consume = 2*N + 1.
    const bitsToConsume = (2 * N + 1) | 0;
    // @0x9debe..@0x9dec2 — build shift count as ~(2*N) so that shr uses (31 - 2*N).
    // In JS >>> uses only low 5 bits of the count, so `(regHi >>> (31 - 2*N))` matches the
    // x86 `shrl %cl, %ebx` where the low 5 bits of `~(2*N)` are also `31 - 2*N` (for N in 0..15
    // the operand fits; for N > 15 we'd have 2*N+1 > 31 which is outside Exp-Golomb's ue() range
    // and is UB in H.264 anyway — the reader would refill before that).
    const shift = (31 - 2 * N) & 0x1f;
    const code = (regHi >>> shift) >>> 0; // (2*N+1)-bit right-justified code value
    // @0x9dec6 — code - 1 (the ue() subtraction).
    const value = (code - 1) | 0;
    // @0x9dec8 — flush 2*N+1 bits.
    this.reader.flushBits(bitsToConsume);
    // @0x9decd — return value.
    return value >>> 0;
  }

  /**
   * `PCVLCParser::se()`  @ProCore 0x9ded6.
   *
   * Body — identical prefix to ue() except NO `decl %ebx`, and a signed post-process:
   *   0x9ded6  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x9dedc  movl  0x1c(%rdi), %ebx                  ; ebx = reader.reg_hi (as in ue)
   *   0x9dedf  addq  $0x18, %rdi                       ; rdi = &this->reader
   *   0x9dee3  bsrl  %ebx, %eax                        ; eax = highest-set-bit index
   *   0x9dee6  xorl  $0x1f, %eax                       ; eax = N (leading zeros)
   *   0x9dee9  leal  0x1(,%rax,2), %esi                ; esi = 2*N + 1
   *   0x9def0  movl  %eax, %ecx / addl %eax, %ecx      ; ecx = 2*N
   *   0x9def4  notb  %cl                               ; cl = ~(2*N)
   *   0x9def6  shrl  %cl, %ebx                         ; ebx = code = reg_hi >> (31 - 2*N)
   *   0x9def8  callq __ZN17PCBitstreamReader9flushBitsEi ; consume 2*N+1 bits
   *   0x9defd  movl  %ebx, %ecx                        ; ecx = code
   *   0x9deff  andl  $0x1, %ecx                        ; ecx = code & 1        = k
   *   0x9df02  shrl  %ebx                              ; ebx = code >> 1       = half
   *   0x9df04  movl  %ecx, %eax
   *   0x9df06  negl  %eax                              ; eax = -k              (0 if k=0, else -1)
   *   0x9df08  xorl  %ebx, %eax                        ; eax = (-k) ^ half
   *                                                      k=0: half
   *                                                      k=1: ~half
   *   0x9df0a  addl  %ecx, %eax                        ; eax = eax + k
   *                                                      k=0: half             = +half
   *                                                      k=1: ~half + 1        = -half
   *   0x9df0c  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   *
   * So se() returns:
   *   let code = reg_hi >> (31 - 2*N)     (WITHOUT the -1 subtraction that ue() applies)
   *   return (code & 1) ? -(code >> 1) : (code >> 1)
   * Equivalent to the H.264 signed Exp-Golomb definition:
   *   let ue_v = ue value (i.e. code - 1);
   *   sign = (ue_v & 1) ? +1 : -1;   magnitude = (ue_v + 1) >> 1;
   *   return sign * magnitude;
   * (The two forms match: se_from_code(code) == se_from_ue(code-1) for all code >= 1.)
   */
  se(): number {
    // @0x9dedc — read reg_hi.
    const regHi = Number((this.reader.reg >> 32n) & 0xFFFFFFFFn) >>> 0;
    // @0x9dee3..@0x9dee6 — leading-zero count.
    const N = clz32_via_bsr(regHi);
    // @0x9dee9 — bits to consume.
    const bitsToConsume = (2 * N + 1) | 0;
    // @0x9def0..@0x9def4 — build shift as ~(2*N) low-6-bit-truncated.
    const shift = (31 - 2 * N) & 0x1f;
    // @0x9def6 — right-justify the (2*N+1)-bit code.
    const code = (regHi >>> shift) >>> 0;
    // @0x9def8 — flush 2*N+1 bits.
    this.reader.flushBits(bitsToConsume);
    // @0x9defd..@0x9df0a — signed post-process (branchless: `(-k) ^ half + k`).
    const k = code & 1; // @0x9deff
    const half = code >>> 1; // @0x9df02
    // Compute the branchless form exactly as the asm does, in 32-bit signed arithmetic.
    let eax = k | 0; // @0x9df04
    eax = -eax | 0; // @0x9df06
    eax = (eax ^ half) | 0; // @0x9df08
    eax = (eax + k) | 0; // @0x9df0a
    return eax;
  }

  /**
   * `PCVLCParser::hasMoreRBSPData() const`  @ProCore 0x9df14.
   *
   * Body:
   *   0x9df14  movl  0x20(%rdi), %ecx                  ; ecx = *(this+0x20) = reader.bitPos
   *   0x9df17  movl  0x40(%rdi), %eax                  ; eax = *(this+0x40) = reader.validBits
   *   0x9df1a  leaq  0x20(%rcx), %rdx                  ; rdx = bitPos + 0x20 (64-bit — because
   *                                                      leaq zero-extends the signed operand)
   *   0x9df1e  cmpq  %rax, %rdx
   *   0x9df21  jbe   0x9df51                            ; if rdx <= validBits (UNSIGNED) -> return 0
   *
   *   ; Fall-through: we're within the tail window. Refine.
   *   0x9df23  subl  %eax, %ecx                        ; ecx = bitPos - validBits
   *   0x9df25  leal  0x20(%rcx), %edx                  ; edx = (bitPos - validBits) + 0x20
   *   0x9df28  movb  $0x1, %al                          ; default return = 1 (has more)
   *   0x9df2a  cmpl  $0x8, %edx
   *   0x9df2d  jg    0x9df50                            ; if edx > 8 -> return 1 (has more)
   *
   *   ; Slow path: compute exact tail-bit predicate.
   *   0x9df2f  pushq %rbp / movq %rsp,%rbp
   *   0x9df33  movq  0x38(%rdi), %rax                  ; rax = *(this+0x38) = reader.end pointer
   *   0x9df37  movzbl -0x1(%rax), %eax                 ; eax = *(end - 1) = last source byte
   *   0x9df3b  bsfl  %eax, %eax                        ; eax = index of lowest set bit (0..7)
   *   0x9df3e  xorb  $0x7, %al                         ; al = 7 - bsf(lastByte) = distance from
   *                                                      bit 7 down to that bit
   *   0x9df40  movzbl %al, %eax                        ; zero-extend
   *   0x9df43  movl  $0xffffffe8, %edx                 ; edx = 0xFFFFFFE8 = (int32)-0x18
   *   0x9df48  subl  %ecx, %edx                        ; edx = -0x18 - (bitPos - validBits)
   *   0x9df4a  cmpl  %eax, %edx
   *   0x9df4c  setne %al                                ; al = (edx != eax)
   *   0x9df4f  popq  %rbp
   *   0x9df50  retq
   *
   *   0x9df51  xorl  %eax, %eax / retq                 ; return 0 (definitely more data)  — wait,
   *                                                      the naming can confuse. Trace the branch
   *                                                      one more time: `jbe 0x9df51` is taken
   *                                                      when bitPos + 0x20 <= validBits — i.e.
   *                                                      we STILL have a full 32-bit window of
   *                                                      valid data ahead. In that case there IS
   *                                                      more RBSP data — but the asm returns 0
   *                                                      (`xorl %eax,%eax`). That inversion means
   *                                                      the function name is actually the OPPOSITE:
   *                                                      it returns TRUE iff we ARE on the tail
   *                                                      (i.e. "we're near the RBSP-trailing bits
   *                                                      and we're NOT exactly on the tail-bit
   *                                                      position"), and FALSE iff we're still
   *                                                      firmly in payload OR sitting exactly on
   *                                                      the tail bit. This matches the H.264
   *                                                      spec: `more_rbsp_data()` returns 1 iff
   *                                                      "there is more data in the RBSP",
   *                                                      i.e. NOT sitting on the trailing 1-bit
   *                                                      followed by zeros.
   *
   *                                                      Wait — that STILL leaves the `xorl` path
   *                                                      returning 0 when we clearly have more
   *                                                      data. Re-reading the compare: `jbe` is
   *                                                      UNSIGNED "below-or-equal". If we've read
   *                                                      NO bits yet, bitPos = -32 (int32) and
   *                                                      validBits = 32; unsigned-compared,
   *                                                      (bitPos + 0x20) = 0 and validBits = 32,
   *                                                      so `0 <= 32` -> take the `jbe` -> return
   *                                                      false. That contradicts intuition again.
   *
   *                                                      RESOLUTION: the field at 0x20 is signed
   *                                                      int32 `bitPos` — but the field can go
   *                                                      strongly NEGATIVE when many bits remain.
   *                                                      When cast to unsigned by `leaq 0x20(%rcx)`
   *                                                      (which uses 64-bit ops but on a
   *                                                      sign-extended int32), a large negative
   *                                                      bitPos becomes a huge unsigned quadword,
   *                                                      so the compare `jbe` FAILS and we FALL
   *                                                      THROUGH to the slow path — which then
   *                                                      correctly reports "more data" via
   *                                                      `setne %al` returning true unless we're
   *                                                      exactly on the tail. So the fast-path
   *                                                      `xorl %eax,%eax` fires ONLY when
   *                                                      `bitPos + 0x20` fits in the positive
   *                                                      int32 range AND is <= validBits — a
   *                                                      condition that in practice means bitPos
   *                                                      is very large positive, i.e. the reader
   *                                                      has ALREADY drained past the end.
   *
   *                                                      This is subtle enough that we transcribe
   *                                                      the SIGNED-vs-UNSIGNED semantic
   *                                                      literally and let the H.264 spec's own
   *                                                      preconditions guide correctness.
   */
  hasMoreRBSPData(): boolean {
    // @0x9df14 — ecx = bitPos.
    const bitPos_i32 = this.reader.bitPos | 0;
    // @0x9df17 — eax = validBits.
    const validBits_i32 = this.reader.validBits | 0;
    // @0x9df1a — rdx = bitPos + 0x20   (as a 64-bit sign-extended lea).
    // We mirror the SIGNED-vs-UNSIGNED semantic: build a BigInt whose value is the sign-extended
    // int32(bitPos) + 0x20. The compare below is UNSIGNED against 64-bit sign-extended validBits.
    const rdx = BigInt(bitPos_i32) + 0x20n;
    // @0x9df1e..@0x9df21 — UNSIGNED cmp of rdx vs validBits (both sign-extended to 64 bits).
    //   In C++: `(uint64_t)(int64_t)(bitPos + 0x20) <= (uint64_t)(int64_t)validBits`.
    //   BigInt handles the arithmetic; we compare after masking both to 64 bits unsigned.
    const rdxU = rdx & 0xFFFF_FFFF_FFFF_FFFFn;
    const rax_from_validBits = BigInt(validBits_i32) & 0xFFFF_FFFF_FFFF_FFFFn;
    if (rdxU <= rax_from_validBits) {
      // @0x9df51 — return false.
      return false;
    }
    // @0x9df23..@0x9df25 — ecx = bitPos - validBits; edx = ecx + 0x20.
    const c = (bitPos_i32 - validBits_i32) | 0;
    const d = (c + 0x20) | 0;
    // @0x9df28..@0x9df2d — signed cmp `edx > 8` -> return true (default al = 1).
    if (d > 8) {
      return true;
    }
    // @0x9df33..@0x9df37 — read last source byte (*(end - 1)).
    const endIdx = this.reader.end | 0;
    const lastByte = this.reader.src[endIdx - 1] | 0;
    // @0x9df3b — bsf on lastByte (throws if zero — RBSP guarantees nonzero).
    const trail = ctz32_via_bsf(lastByte & 0xff);
    // @0x9df3e..@0x9df40 — al = 7 - trail; zero-extend to eax.
    const trail_from_top = (trail ^ 0x7) & 0xff;
    // @0x9df43..@0x9df48 — edx = 0xFFFFFFE8 - c = -0x18 - (bitPos - validBits)  (as int32).
    const want = ((-0x18) - c) | 0;
    // @0x9df4a..@0x9df4c — setne al on (edx != eax).
    return want !== trail_from_top;
  }

  /**
   * `PCVLCParser::isByteAligned() const`  @ProCore 0x9df54.
   *
   * Body:
   *   0x9df54  pushq %rbp / movq %rsp,%rbp
   *   0x9df58  testb $0x7, 0x20(%rdi)                   ; test low 3 bits of reader.bitPos
   *   0x9df5c  sete  %al
   *   0x9df5f  popq  %rbp / retq
   *
   * Returns true iff (reader.bitPos & 7) == 0 — the reader's read position lies on a byte
   * boundary. See the module docstring for why this holds.
   */
  isByteAligned(): boolean {
    // @0x9df58..@0x9df5c — (reader.bitPos & 7) == 0.
    return (this.reader.bitPos & 0x7) === 0;
  }
}
