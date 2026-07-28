// VlcParser.ts — Flexo framework's VlcParser: H.264-style Exp-Golomb VLC
// (Variable-Length Code) decoder built ON TOP of BitstreamReader. The parser
// carries NO additional state beyond the embedded BitstreamReader at +0x00
// (proven by every load in every observed method reading from BR's field
// offsets — see STRUCT LAYOUT), and exports four member functions:
//
//   @Flexo 0x0000000001421560  VlcParser::initialize(unsigned char const*, int)
//                                — ICF-FOLDED with another 5-byte trampoline;
//                                  the standalone body is NOT emitted in this
//                                  binary. Throw-stubbed with 0xADDR citation.
//   @Flexo 0x0000000001421570  VlcParser::ue()
//                                — unsigned Exp-Golomb decode.
//   @Flexo 0x00000000014215a0  VlcParser::se()
//                                — signed Exp-Golomb decode.
//   @Flexo 0x00000000014215e0  VlcParser::hasMoreRbspData()
//                                — H.264 RBSP trailing-bits probe.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.VlcParser.ue.s              (@0x1421570..0x142159b)
//   Flexo.VlcParser.se.s              (@0x14215a0..0x14215d6)
//   Flexo.VlcParser.hasMoreRbspData.s (@0x14215e0..0x1421620; the rest of the
//                                      dumped region is a different function
//                                      the boundary detector over-collected —
//                                      see the RBSP body analysis below.)
// initialize @0x1421560 has no standalone body in the disassembly (ICF-folded);
// its 5-byte address is present in the symbol table but resolves to shared
// stub bytes.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// VlcParser HAS-A (or IS-A) BitstreamReader at offset +0x00. Every observed
// method reads only from BitstreamReader's field offsets:
//   +0x00  buffer0        (ue @0x1421576: movl (%rdi), %ebx)
//   +0x08  bitsInBuffer1  (hasMoreRbspData @0x14215e0: movl 0x8(%rdi), %ecx)
//   +0x20  srcEnd         (hasMoreRbspData @0x14215ff: movq 0x20(%rdi), %rax)
//   +0x28  bitsAvailable  (hasMoreRbspData @0x14215e3: movl 0x28(%rdi), %eax)
//
// (These offsets match BitstreamReader.ts's decoded layout exactly — see
//  raw-port/src/channels/BitstreamReader.ts, "Object layout" header.)
//
// The class carries NO field beyond the BR sub-object. sizeof(VlcParser) ==
// sizeof(BitstreamReader) == 0x2c (44 bytes; +0x28 is a u32 = last field).
// We model this as composition (`br: BitstreamReader`) rather than TS-side
// inheritance so BitstreamReader remains a pure decoder without accidental
// method overrides.
//
// ── EXP-GOLOMB ALGEBRA (ue) ─────────────────────────────────────────────────
// ue() @0x1421570 recovers the unsigned Exp-Golomb integer encoded at the head
// of buffer0. The classic H.264 Exp-Golomb code:
//   - Prefix: N leading zero bits followed by a 1 bit
//   - Suffix: N information bits
//   - Codeword length = 2N + 1
//   - Value = 2^N + suffix - 1  == (codeword >> 0) - 1 when read into an N+1
//                                   bit result cleared of the prefix zeros.
//
// The assembly implements it in 4 arithmetic ops:
//
//   0x1421576  movl  (%rdi), %ebx                 ; ebx = buffer0 (top 32 bits)
//   0x1421578  movl  %ebx, -0xc(%rbp)             ; spill for `bsr` mem operand
//   0x142157b  bsrl  -0xc(%rbp), %ecx             ; ecx = MSB index of buffer0
//   0x142157f  addl  %ecx, %ecx                   ; ecx = 2 * bsr(buffer0)
//   0x1421581  xorl  $0x3e, %ecx                  ; ecx = 62 ^ (2*bsr) = 62 - 2*bsr
//                                                   (only correct when 2*bsr ≤ 62,
//                                                    which is guaranteed for a
//                                                    32-bit source)
//                                                   ecx = 2*leadingZeros(buffer0)
//   0x1421584  leal  0x1(%rcx), %esi              ; esi = 2*leadingZeros + 1
//                                                   = codeword length in bits
//   0x1421587  notb  %cl                          ; cl  = ~cl (byte)
//                                                   Combined with the next line's
//                                                   shrl mask-by-31, this yields a
//                                                   shift count of (31 - 2*lz)
//                                                   because ~(2*lz) & 31
//                                                   == (255 - 2*lz) & 31
//                                                   == (31 - 2*lz) mod 32.
//   0x1421589  shrl  %cl, %ebx                    ; ebx >>= (31 - 2*lz)
//                                                   = buffer0 >> (32 - codewordLen)
//   0x142158b  decl  %ebx                          ; ebx -= 1
//   0x142158d  callq BitstreamReader::flushBits(int)  ; flushBits(codewordLen)
//   0x1421592  movl  %ebx, %eax                    ; return ebx
//
// Result matches the standard Exp-Golomb ue():
//   value = (buffer0 >> (32 - codewordLen)) - 1
//
// ── EXP-GOLOMB ALGEBRA (se) ─────────────────────────────────────────────────
// se() @0x14215a0 is the SIGNED variant. It reads an unsigned Exp-Golomb
// codeword the same way (same bsr/addl/xor/lea/notb/shr sequence, ending @
// 0x14215b9), then applies the interleaved sign mapping:
//
//   Given the unsigned codeword ebx (call it k):
//     sign_bit = k & 1                  ; 0x14215c0..0x14215c2  (movl+andl)
//     magnitude = k >> 1                ; 0x14215c5           (shrl %ebx = shrl $1)
//     sign_mask = -sign_bit             ; 0x14215c9           (negl %eax)
//     abs_value = magnitude ^ sign_mask ; 0x14215cb           (xorl %ebx, %eax)
//     result = abs_value + sign_bit     ; 0x14215cd           (addl %ecx, %eax)
//     return %eax
//
// This is the well-known "unsigned-to-signed" mapping used by H.264's se(v):
//   se(k) =  (k + 1) / 2    if k is odd
//         = -(k / 2)        if k is even
// which can be written branch-free as
//   sign = k & 1
//   se(k) = ((k >> 1) ^ -sign) + sign
// exactly matching the four arithmetic ops above.
//
// NB: se() calls flushBits BEFORE the sign fold (@0x14215bb), one instruction
// earlier in the codestream than ue() does (which flushes AFTER the decl).
// The net effect is identical because the flush uses arg %esi (still holding
// codewordLen from the leal), which is written *before* the flush.
//
// ── H.264 RBSP TRAILING-BITS PROBE (hasMoreRbspData) ─────────────────────────
// hasMoreRbspData() @0x14215e0 answers "is there another syntax element after
// the current bit position, or is the stream at the RBSP trailing bits?"
//
// The trailing-bits marker in H.264 is a single `1` bit followed by 0..7
// `0` bits until byte alignment. The function returns true iff either:
//   (a) there are bytes past the current byte plus 4 (i.e. srcCursor+0x20
//       has not reached srcEnd), OR
//   (b) the byte before the current cursor position, taken byte-wise, has a
//       trailing-1 that is NOT at the exact expected boundary given the
//       current bitsInBuffer1 offset.
//
// Disassembly (main body 0x14215e0..0x1421620; anything past 0x1421620 is a
// DIFFERENT function that the disasm.sh boundary detector over-collected —
// see the raw file for the ObjC method that follows immediately after):
//
//   0x14215e0  movl  0x8(%rdi), %ecx        ; ecx = br.bitsInBuffer1
//   0x14215e3  movl  0x28(%rdi), %eax       ; eax = br.bitsAvailable
//   0x14215e6  leaq  0x20(%rcx), %rdx       ; rdx = bitsInBuffer1 + 0x20 (as u64)
//   0x14215ea  cmpq  %rax, %rdx             ; compare (bitsInBuffer1 + 32) vs bitsAvailable
//   0x14215ed  jbe   0x142161e              ; if (bitsInBuffer1 + 32) <= bitsAvailable → false
//   0x14215ef  subl  %eax, %ecx             ; ecx = bitsInBuffer1 - bitsAvailable
//   0x14215f1  leal  0x20(%rcx), %edx       ; edx = 32 + (bitsInBuffer1 - bitsAvailable)
//   0x14215f4  movb  $0x1, %al              ; al  = 1  (default TRUE)
//   0x14215f6  cmpl  $0x8, %edx             ; edx <= 8 ?
//   0x14215f9  jg    0x1421620              ; if edx > 8 → retq (with al=1, TRUE)
//   0x14215fb  pushq %rbp / movq %rsp,%rbp
//   0x14215ff  movq  0x20(%rdi), %rax       ; rax = srcEnd  (last byte + 1)
//   0x1421603  movzbl -0x1(%rax), %eax     ; eax = *(srcEnd - 1)  (last input byte)
//   0x1421607  tzcntl %eax, %eax            ; eax = trailing-zero count of last byte
//   0x142160b  xorb  $0x7, %al              ; al  = 7 XOR tzcnt = 7 - tzcnt (leadingZeros
//                                            ; of the last byte, positioned as a bit index
//                                            ; from the MSB of that byte).
//                                            ; Equivalently: the bit position of the
//                                            ; RBSP trailing-`1` within the last byte.
//   0x142160d  movzbl %al, %eax             ; zero-extend to 32-bit
//   0x1421610  movl  $0xffffffe8, %edx      ; edx = -24  (== 0 - 0x18)
//   0x1421615  subl  %ecx, %edx             ; edx = -24 - ecx
//                                            ;      = -24 - (bitsInBuffer1 - bitsAvailable)
//                                            ;      = -(24 + bitsInBuffer1 - bitsAvailable)
//                                            ; This is the expected trailing-1 bit position
//                                            ; if we ARE at the RBSP terminator.
//   0x1421617  cmpl  %eax, %edx             ; compare expected vs actual
//   0x1421619  setne %al                    ; al = (expected != actual) ? 1 : 0
//                                            ; → true means "still more data",
//                                            ; false means "at RBSP trailing bits".
//   0x142161c  popq  %rbp / retq            ; return al
//
//   0x142161e  xorl  %eax, %eax / retq      ; alternate exit: al=0 (no more data)
//   0x1421620  (already returning al=1 from the fast-path branch above)
//
// Return values:
//   * When (bitsInBuffer1 + 32) <= bitsAvailable: false — the buffer still holds
//     ≥ 32 unread bits so there's certainly more syntax data.  ...actually
//     WAIT — that's backwards. The `jbe` at 0x14215ed says "if
//     (bitsInBuffer1 + 32) <= bitsAvailable jump to 'xor eax,eax; retq'
//     (return false)". That branch is taken when the reader still has room
//     for at least 32 more bits. That's the exact case where you STILL HAVE
//     TIME BEFORE the trailing bits.  Hmm — the result being `false` in that
//     case would mean "no more data", which contradicts the name.  Reading
//     H.264 §7.2's more_rbsp_data() spec carefully: the function returns
//     TRUE when there IS more (non-trailing) data. So the jbe path returning
//     0 means "no more data".
//
//     Reconciling: `bitsInBuffer1 + 32 <= bitsAvailable` means the reader has
//     PLENTY of buffered bits (buffer1 has fully refilled). In that regime,
//     H.264 more_rbsp_data() returns based on comparing the current bit
//     position against the *end* — since we have plenty of buffer, the answer
//     defers to the byte-level check further downstream, and the
//     ~simplification here is "we're not near the end, so more_rbsp_data =
//     true" — but the code returns 0. That means either the semantics ARE
//     "we've buffered so much we're guaranteed past a syntax element and
//     therefore at the trailer" OR the reader's convention is inverted from
//     more_rbsp_data (i.e. this function is "hasReachedRbspTrailingBits").
//
//     We PORT THE ASM VERBATIM. Callers of VlcParser::hasMoreRbspData who
//     want H.264 semantics must apply whatever inversion FCP applies at
//     the call site. Our port returns exactly what the asm returns.
//
//   * If bitsInBuffer1 + 32 > bitsAvailable AND (32 + bitsInBuffer1 -
//     bitsAvailable) > 8: return true (fast path — enough room for more).
//   * If bitsInBuffer1 + 32 > bitsAvailable AND (32 + bitsInBuffer1 -
//     bitsAvailable) ≤ 8: compare the "expected trailing-1 position" of the
//     last byte against its actual trailing-1 position; return true iff they
//     differ.
//
// ── FRONTIER STUB: initialize (ICF-folded) ──────────────────────────────────
// The initialize @0x1421560 symbol has been ICF-folded with a byte-identical
// 5-byte trampoline; no distinct body is emitted in this build. Since we
// cannot decode it without the folded target (which we could not identify),
// we surface a throwing stub citing @0x1421560. Callers that hit this stub
// are the demand signal for a follow-up decoder pass.
//
// (One likely candidate for the fold target — inferred from the mangling
//  `initialize(unsigned char const*, int)` and the receiver being a
//  BitstreamReader-shaped object — is BitstreamReader::initialize itself
//  (@0x14203f0), but there is no proof in the observed bytes to confirm
//  the fold. We do NOT guess.)

import { BitstreamReader } from "./BitstreamReader";

/**
 * VlcParser — Exp-Golomb decoder over a BitstreamReader source.
 *
 * The class embeds a BitstreamReader at offset +0x00 (proven by every load
 * across the four exported methods reading from BR's field offsets — see
 * STRUCT LAYOUT). We model this as composition rather than inheritance so
 * BitstreamReader's decoded semantics remain isolated.
 */
export class VlcParser {
  /** @+0x00..+0x2b  Embedded BitstreamReader sub-object. All four VlcParser
   *  methods reach through this — ue()/se() via `movl (%rdi), %ebx` reading
   *  `br.buffer0`, and hasMoreRbspData() via `br.bitsInBuffer1` / `br.srcEnd`
   *  / `br.bitsAvailable`. */
  br: BitstreamReader = new BitstreamReader();

  /**
   * VlcParser::initialize(unsigned char const*, int) — ICF-folded stub.
   *   @Flexo 0x0000000001421560 (5-byte trampoline; distinct body not emitted)
   *
   * The standalone body for this symbol is not present in the shipped Flexo
   * binary. Both `raw-port/tools/disasm.sh` and a direct address grep of
   * /tmp/Flexo_tV.txt confirm no matching function-start line at 0x1421560 —
   * the linker (ld64) folded this 5-byte prologue with another byte-identical
   * trampoline elsewhere in the binary. Since we cannot recover the folded
   * target without more decoder work, we surface a throwing stub citing
   * @0x1421560. Callers who need the initializer must either:
   *   (a) construct a BitstreamReader via `parser.br.initialize(...)` directly,
   *       which is what FCP's initialize almost certainly forwards to, but
   *       we do NOT confirm without a real disassembly, or
   *   (b) decode the ICF fold target in a follow-up port pass.
   */
  initialize(_buffer: Uint8Array, _bufferLenBytes: number): void {
    throw new Error(
      "VlcParser::initialize @Flexo 0x1421560 — ICF-folded 5-byte trampoline; distinct body not emitted in this Flexo build; decode ICF fold target in a follow-up port pass",
    );
  }

  /**
   * VlcParser::ue() — unsigned Exp-Golomb decode.
   *   @Flexo 0x0000000001421570..0x000000000142159b
   *
   * Reads the head of br.buffer0 as an Exp-Golomb prefix + suffix, decodes to
   * (value = codeword - 1), then flushes the codeword. Full disassembly and
   * algebra breakdown in the file-level EXP-GOLOMB ALGEBRA (ue) section.
   *
   * Bit-exact TS transcription of the 4 arithmetic ops:
   *   ecx = 2 * bsr(buffer0)        // @0x142157b + 0x142157f
   *   ecx = 62 ^ (2*bsr) = 62 - 2*bsr = 2 * leadingZeros(buffer0)  // @0x1421581
   *   esi = ecx + 1 = codewordLen   // @0x1421584
   *   cl  = ~cl (byte)              // @0x1421587
   *   ebx = buffer0 >> (cl & 31) = buffer0 >> (31 - 2*lz)          // @0x1421589
   *   ebx -= 1                      // @0x142158b
   *   flushBits(codewordLen)        // @0x142158d
   *   return ebx
   */
  ue(): number {
    // 0x1421576: %ebx = buffer0. We treat as uint32.
    const buffer0 = this.br.buffer0 >>> 0;

    // bsr on ebx: highest set bit position (0..31). Undefined when buffer0
    // == 0 in x86 (the flag ZF is set but eax is unchanged); the caller
    // MUST ensure buffer0 != 0 (H.264 spec guarantees at least one non-zero
    // bit before EOF). We surface an explicit throw for the zero case
    // rather than let a silent 0 propagate: the asm's zero case would read
    // whatever %ecx held on entry, which is not decodable from just this
    // method (compiler-dependent scratch), so we refuse rather than fake.
    if (buffer0 === 0) {
      throw new Error(
        "VlcParser::ue() @Flexo 0x142157b — bsrl on buffer0==0 is undefined; asm relies on caller invariant that a non-zero prefix bit exists",
      );
    }

    // 0x142157b bsrl: MSB index. Compute portably as 31 - Math.clz32.
    const bsr = (31 - Math.clz32(buffer0)) | 0;
    // 0x142157f addl,%ecx,%ecx: ecx = 2*bsr.
    // 0x1421581 xorl $0x3e,%ecx: ecx = 62 XOR (2*bsr). For 2*bsr in [0,62]
    //   this equals 62 - 2*bsr (verified by inspection of the codomain).
    const ecx = (62 ^ (2 * bsr)) >>> 0; // = 2 * leadingZeros
    // 0x1421584 leal 0x1(%rcx),%esi: codewordLen = ecx + 1.
    const codewordLen = (ecx + 1) | 0;
    // 0x1421587 notb %cl: byte-not of low 8 bits of ecx.
    const notCl = (~ecx) & 0xff;
    // 0x1421589 shrl %cl,%ebx: shift uses low 5 bits of cl.
    const shift = notCl & 0x1f; // == (31 - ecx) mod 32 == 31 - 2*lz
    const shifted = (buffer0 >>> shift) >>> 0;
    // 0x142158b decl %ebx: (shifted - 1) as uint32.
    const value = (shifted - 1) >>> 0;

    // 0x142158d callq BitstreamReader::flushBits(codewordLen).
    this.br.flushBits(codewordLen);

    // 0x1421592 movl %ebx, %eax: return the pre-flush value.
    return value >>> 0;
  }

  /**
   * VlcParser::se() — signed Exp-Golomb decode.
   *   @Flexo 0x00000000014215a0..0x00000000014215d6
   *
   * Same Exp-Golomb prefix decode as ue() (0x14215a6..0x14215b9), followed by
   * the H.264 sign-fold branch-free at 0x14215c0..0x14215cd:
   *   sign  = k & 1
   *   mag   = k >> 1
   *   value = (mag ^ (-sign)) + sign
   *          == (k+1)/2  if k is odd
   *          == -(k/2)   if k is even
   *
   * Note: se() calls flushBits at 0x14215bb (BEFORE the sign fold), one
   * instruction earlier in codestream order than ue() does. The observable
   * effect is identical (flushBits' argument %esi is fixed by the leal at
   * 0x14215b4, which runs before either flush site).
   */
  se(): number {
    // 0x14215a6..0x14215b9: same Exp-Golomb prefix decode as ue().
    const buffer0 = this.br.buffer0 >>> 0;
    if (buffer0 === 0) {
      throw new Error(
        "VlcParser::se() @Flexo 0x14215ab — bsrl on buffer0==0 is undefined; asm relies on caller invariant that a non-zero prefix bit exists",
      );
    }
    const bsr = (31 - Math.clz32(buffer0)) | 0;
    const ecx = (62 ^ (2 * bsr)) >>> 0;
    const codewordLen = (ecx + 1) | 0;
    const notCl = (~ecx) & 0xff;
    const shift = notCl & 0x1f;
    const k = (buffer0 >>> shift) >>> 0;

    // 0x14215bb: flushBits(codewordLen). Note the ORDERING — se flushes
    // BEFORE the sign fold; ue flushes AFTER the decl. Both are correct.
    this.br.flushBits(codewordLen);

    // 0x14215c0..0x14215cd: branch-free sign fold.
    const sign = k & 1; // ecx = k & 1
    const mag = k >>> 1; // ebx = k >> 1 (shrl %ebx == shrl $1)
    const signMask = -sign | 0; // negl %eax → -(k&1) as int32 (0 or -1)
    // signed xor + add: mag ^ signMask + sign  (all as int32)
    const abs = mag ^ signMask; // xorl %ebx,%eax
    const value = (abs + sign) | 0; // addl %ecx,%eax  → signed int32 result

    // 0x14215d5 retq — return as signed int32.
    return value | 0;
  }

  /**
   * VlcParser::hasMoreRbspData() — H.264 RBSP trailing-bits probe.
   *   @Flexo 0x00000000014215e0..0x0000000000000000  (body ends at 0x1421620)
   *
   * Faithful transcription of the four-branch decision tree at 0x14215e0..
   * 0x1421620. See the file-level H.264 RBSP TRAILING-BITS PROBE section for
   * the full disassembly and algebra.
   *
   * Return value semantics (as observed — NOT re-normalised to H.264 spec):
   *   - (bitsInBuffer1 + 32) <= bitsAvailable  →  0 (false)
   *   - remaining = 32 + bitsInBuffer1 - bitsAvailable
   *     - remaining > 8                        →  1 (true)  [fast path]
   *     - remaining ≤ 8                        →  compare expected-trailer bit
   *                                             position vs actual last-byte
   *                                             trailing-1 position; return
   *                                             (expected != actual).
   */
  hasMoreRbspData(): boolean {
    // 0x14215e0: ecx = br.bitsInBuffer1 (u32).
    const bitsInBuffer1 = this.br.bitsInBuffer1 >>> 0;
    // 0x14215e3: eax = br.bitsAvailable (u32).
    const bitsAvailable = this.br.bitsAvailable >>> 0;

    // 0x14215e6..0x14215ed: if (bitsInBuffer1 + 32) <= bitsAvailable → false.
    // The `leaq 0x20(%rcx),%rdx` and `cmpq %rax,%rdx` use 64-bit compare, but
    // both values were zero-extended from 32-bit loads, so this is exactly a
    // 32-bit unsigned compare.
    if ((bitsInBuffer1 + 32) >>> 0 <= bitsAvailable) {
      // 0x142161e: xorl %eax,%eax / retq  → return false.
      return false;
    }

    // 0x14215ef: ecx = bitsInBuffer1 - bitsAvailable (32-bit signed subtract).
    const cxDiff = ((bitsInBuffer1 - bitsAvailable) | 0);
    // 0x14215f1: edx = cxDiff + 32.
    const remaining = (cxDiff + 32) | 0;
    // 0x14215f4: al = 1 (default true).
    // 0x14215f6/0x14215f9: if (remaining > 8) → retq with al=1.
    if (remaining > 8) return true;

    // Slow path: compare expected trailing-1 bit position vs actual last-byte
    // trailing-1 position.
    //
    // 0x14215ff: rax = br.srcEnd (byte-pointer past the last valid byte).
    // 0x1421603: eax = *(u8*)(srcEnd - 1) — the LAST byte of the input.
    const lastByte = this._readLastByteAtSrcEnd();

    // 0x1421607: tzcntl eax, eax — trailing zero count (0..7 for a non-zero
    //   last byte). The H.264 RBSP trailing-bits byte is guaranteed to have
    //   a set bit (the trailing-1 marker), so tzcnt is well-defined for
    //   valid RBSP input.
    const tz = lastByte === 0 ? 32 : (Math.log2(lastByte & -lastByte) | 0);

    // 0x142160b: al = 7 XOR tz. For tz in [0,7] this is 7-tz — the bit
    //   position of the trailing-1 counted from the MSB of the byte.
    const actualTrailing1FromMsb = (7 ^ tz) & 0xff;

    // 0x1421610..0x1421615: edx = 0xFFFFFFE8 - cxDiff  = (-24) - cxDiff
    //   as int32. This is the "expected" bit position of the RBSP trailing-1.
    const expectedTrailing1 = ((-24) - cxDiff) | 0;

    // 0x1421617..0x1421619: setne %al  → al = (expected != actual).
    // The int32 comparison is used verbatim (edx may be negative for some
    // states — we compare with the u32 actualTrailing1FromMsb using the same
    // int32 == u32 mixing the asm does).
    return expectedTrailing1 !== actualTrailing1FromMsb;
  }

  /**
   * Helper for hasMoreRbspData: read the last byte at br.srcEnd - 1. The
   * BitstreamReader port stores srcEnd as a numeric byte offset into its
   * internal `_src: Uint8Array`; we recover the last byte through that
   * (0x14215ff..0x1421603 — `movq 0x20(%rdi),%rax; movzbl -0x1(%rax),%eax`).
   *
   * The BR fields are typed as numeric offsets on the TS side (see
   * BitstreamReader.ts, `srcEnd: number = 0;`), and the source buffer is
   * held on `_src`. We do the equivalent lookup here.
   */
  private _readLastByteAtSrcEnd(): number {
    // Access the BR's private source buffer via a defined accessor. If the
    // BR wasn't initialised the srcEnd is 0 and this would underflow; we
    // surface the underflow as an explicit throw (matching what an FCP
    // debug-build would do when reading srcEnd-1 with srcEnd == start).
    const br = this.br as unknown as { _src: Uint8Array; srcEnd: number };
    const idx = (br.srcEnd | 0) - 1;
    if (idx < 0 || idx >= br._src.length) {
      throw new Error(
        "VlcParser::hasMoreRbspData @Flexo 0x1421603 — reading *(srcEnd-1) with srcEnd out of bounds; asm dereferences unconditionally",
      );
    }
    return br._src[idx] & 0xff;
  }
}
