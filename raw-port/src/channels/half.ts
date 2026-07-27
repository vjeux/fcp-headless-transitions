/**
 * half — ProCore framework (OpenEXR's ILM `half` float16 helper)
 *
 * Transcribed from ProCore's disassembly:
 *   - x86_64: only `half::convert(int)` @0x0000000000007f8a is exported;
 *     `half::overflow()` is INLINED inside convert (0x8033..0x8063).
 *   - arm64:  `half::overflow()` exists as a standalone symbol @0x7d4c.
 *
 * This port follows the x86_64 disasm literally, including the inlined
 * overflow() body. Both `overflow()` and `convert(i)` are exposed as static
 * methods since they are ABI-static (no `this`).
 */

export class half {
  /**
   * @0x0000000000007d4c (arm64) / inlined into convert on x86_64
   *   __ZN4half8overflowEv
   *
   * Faithful transcription:
   *   sp -= 16
   *   w8 = 0x501502F9         ; float bit pattern (~1.0016e+10)
   *   [sp+12] = w8
   *   loop_count = 10
   *   do {
   *     s0 = load [sp+12]
   *     s1 = load [sp+12]
   *     s0 = fmul s0, s1     ; single-precision multiply
   *     [sp+12] = s0
   *     loop_count -= 1
   *   } while (loop_count != 0)
   *   return s0
   *
   * Purpose: force IEEE FE_OVERFLOW by squaring a large float 10x → +inf.
   * The return value is a float (in %xmm0 / s0). In JS/TS we cannot raise the
   * host FE_OVERFLOW flag — Math.fround gives correct value semantics.
   */
  static overflow(): number {
    // 0x501502F9 as a float32 bit pattern.
    const buf = new ArrayBuffer(4);
    const u = new Uint32Array(buf);
    const f = new Float32Array(buf);
    u[0] = 0x501502f9;
    let x = f[0];
    // 10 iterations of x = fround(x * x).
    for (let i = 0; i < 10; i++) {
      x = Math.fround(x * x);
    }
    return x;
  }

  /**
   * @0x0000000000007f8a  __ZN4half7convertEi
   *
   * IEEE-754 single (float32 bit pattern in `i`) → half (uint16 bit pattern),
   * returned as signed 16-bit int (matches asm's terminal `movswl %cx, %eax`).
   *
   * Faithful transcription of the disasm at raw-port/re/disasm/
   *   ProCore.half.convert.s :
   *
   *   sign  = (i >> 16) & 0x8000           ; @0x7f8c-0x7f8f
   *   exp   = ((i >> 23) & 0xff) as u8→u32 ; @0x7f97-0x7f9b  (movzbl %r8b,%esi)
   *   mant  = i & 0x7FFFFF                 ; @0x7fa1
   *
   *   if (exp > 0x70) goto biased_exp;     ; @0x7fa7-0x7faa (cmpl 0x70; ja)
   *   if (exp >= 0x66) goto denorm_path;   ; @0x7fac-0x7faf (cmpl 0x66; jae)
   *   ecx = 0; goto ret_short              ; @0x7fb1-0x7fb3 (underflow → +0)
   *
   * biased_exp: (exp > 0x70)
   *   ecx = exp - 0x70                     ; @0x7fb8
   *   if (ecx != 0x8F) goto normal_path    ; @0x7fbb-0x7fc1 (i.e. exp != 0xff)
   *   ; --- Inf/NaN branch (exp == 0xff) ---
   *   if (mant == 0) goto inf_result       ; @0x7fc3-0x7fc5
   *     ; NaN: preserve payload
   *     ecx = mant >> 13
   *     esi = (mant < 0x2000) ? 1 : 0      ; @0x7fd2-0x7fd8 (cmp 0x2000; setb)
   *     ecx |= sign
   *     ecx |= esi
   *     ecx |= 0x7C00
   *     goto ret_short                     ; @0x7fe6
   *
   * denorm_path: (0x66 <= exp <= 0x70)     ; @0x7feb
   *   mant |= 0x800000                     ; add implicit leading 1
   *   cl = 0x71 - exp                      ; shift amount
   *   mant >>= cl                          ; @0x7ff6 (shrl %cl, %edx)
   *   ecx = mant & 0x1000                  ; round bit
   *   ecx = mant + ecx * 2                 ; @0x8000 (leal (rdx, rcx, 2))
   *   ecx >>= 13
   *   ecx |= sign
   *   goto ret_short                       ; @0x8008
   *
   * normal_path:                           ; @0x800a  bt $0xC, %edi
   *   if ((i >> 12) & 1) {                 ; rounding decision
   *     tmp_mant = mant + 0x2000
   *     tmp_exp  = exp - 0x6F              ; @0x8016 (addl $-0x6f, %esi)
   *     tmp_r8   = 0
   *     if (mant < 0x7FE000) {             ; @0x801c-0x8025 cmovbl
   *        exp = tmp_exp                   ; else keep exp (as %esi)
   *        r8  = tmp_r8
   *     } else {
   *        exp = (unchanged %esi = biased_exp - 0x70 result… hmm)
   *     }
   *     ; NOTE: careful reading below — see truth-table justification.
   *     mant = r8
   *   }
   *   ; @0x802e cmpl $0x1f, %ecx  — but %ecx at this point is …
   *   ; (see below — the algorithm collapses to standard f32→f16 with round-
   *   ;  half-to-even & overflow-to-inf via inlined overflow())
   *
   * The block at @0x8033..0x8063 is the INLINED body of half::overflow():
   *   pushq %rbp / movq %rsp, %rbp
   *   [rbp-4] = 0x501502F9
   *   loop_count = 10
   *   do {
   *     xmm0 = [rbp-4]; xmm0 *= [rbp-4]; [rbp-4] = xmm0
   *   } while (--loop_count)
   *   xmm0 = [rbp-4]                      ; discard (side effect only in FP env)
   *   eax |= 0x7C00                        ; set half-exp to 0x1F (inf|nan)
   *   ecx = eax
   *   goto ret_short
   *
   * Final tail @0x807a:  movswl %cx, %eax; retq   ; sign-extend cx → eax
   *
   * ⚠ DECODE-DON'T-FIT: the "normal_path" (exp in 0x71..0x8E) rounding block
   *   is a delicate cmovb reshuffle. We transcribe the effect literally by
   *   mirroring each branch below, matching the asm register moves.
   */
  static convert(i: number): number {
    // Force u32 semantics on the input.
    const edi = i >>> 0;

    // @0x7f8c-0x7f8f
    const sign = ((edi >>> 16) & 0x8000) >>> 0;      // %eax after masking
    // @0x7f97-0x7f9b (movzbl %r8b)
    const r8b = (edi >>> 23) & 0xff;                  // low 8 bits of exponent
    const exp = r8b >>> 0;                            // %esi
    // @0x7fa1
    const mant = (edi & 0x7fffff) >>> 0;              // %edx

    // @0x7fa7-0x7fb3
    if (exp <= 0x70) {
      if (exp < 0x66) {
        // @0x7fb1-0x7fb3: xorl %ecx,%ecx; jmp 0x807a
        // Tail is `movswl %cx, %eax` → sign-extends cx=0 → 0.
        return 0;
      }
      // 0x66 <= exp <= 0x70 : denorm path @0x7feb
      let m = (mant | 0x800000) >>> 0;
      const cl = (0x71 - exp) & 0xff;                 // subb %r8b,%cl (cl was 0x71)
      m = (m >>> cl) >>> 0;                            // shrl %cl,%edx
      const round = (m & 0x1000) >>> 0;                // andl $0x1000,%ecx
      // leal (%rdx,%rcx,2) → ecx = m + round*2
      let ecx = (m + round * 2) >>> 0;
      ecx = (ecx >>> 13) >>> 0;                        // shrl $0xd,%ecx
      ecx = (ecx | sign) >>> 0;                        // orl %eax,%ecx
      return (((ecx & 0xffff) << 16) >> 16);           // movswl %cx,%eax
    }

    // exp > 0x70 : biased_exp @0x7fb8
    const ecxBias = (exp - 0x70) >>> 0;                // leal -0x70(%rsi),%ecx
    if (ecxBias === 0x8f) {
      // exp == 0xff : Inf/NaN branch @0x7fc3
      if (mant === 0) {
        // Inf result @0x8073: ecx = eax | 0x7C00
        const ecx = (sign | 0x7c00) >>> 0;
        return (((ecx & 0xffff) << 16) >> 16);
      }
      // NaN payload preservation @0x7fcb-0x7fe6
      let ecx = (mant >>> 13) >>> 0;
      const esiNan = (mant < 0x2000) ? 1 : 0;          // setb
      ecx = (ecx | sign) >>> 0;                        // orl %eax,%ecx
      ecx = (ecx | esiNan) >>> 0;                      // orl %esi,%ecx
      ecx = (ecx | 0x7c00) >>> 0;                      // orl $0x7C00,%ecx
      return (((ecx & 0xffff) << 16) >> 16);
    }

    // Normal path @0x800a : bt $0xC, %edi
    //   Register state entering this block (per asm):
    //     %eax = sign
    //     %edi = original i
    //     %edx = mant
    //     %esi = exp (biased_exp before subtract; actually still original exp
    //                 because 0x7fb8's leal used %rsi as source; %esi unchanged)
    //     %ecx = ecxBias = exp - 0x70
    //     %r8d = r8b (low byte of exp) — unused past this point until cmov
    //
    // NOTE (careful): after 0x7fb8 `leal -0x70(%rsi),%ecx` %esi is UNCHANGED,
    // so %esi = exp at this point. Then 0x8016 `addl $-0x6F, %esi` makes
    //   tmp_esi = exp - 0x6F  (the target half exponent bias).
    //
    // @0x800a-0x800e : if bit 12 of i is set, take the round-up sub-path
    let esi = exp;                                     // %esi still = exp
    let edx = mant;                                    // %edx still = mant
    let r8d = 0;                                       // will be assigned below
    if ((edi >>> 12) & 1) {
      // @0x8010 : leal 0x2000(%rdx),%edi  — use tmpEdi as candidate mantissa
      const tmpEdi = (mant + 0x2000) >>> 0;
      // @0x8016 : addl $-0x6F,%esi  → tmp_esi = exp - 0x6F
      const tmpEsi = (exp + ((-0x6f) >>> 0)) >>> 0;
      // @0x8019 : xorl %r8d,%r8d
      // Then:
      //   cmp   $0x7FE000,%edx
      //   cmovb %ecx,%esi     (if mant <  0x7FE000: esi = ecx = ecxBias)
      //   cmovb %edi,%r8d     (if mant <  0x7FE000: r8d = tmpEdi)
      // i.e. if (mant < 0x7FE000): esi = ecxBias; r8d = tmpEdi
      //      else                 : esi = tmpEsi; r8d = 0        (no cmov taken)
      //
      // Wait — cmovb takes the branch when CF=1 i.e. src<dst on unsigned cmp.
      // Here `cmpl $0x7FE000,%edx` computes edx - 0x7FE000; CF=1 when edx <
      // 0x7FE000. So "b" = "mant < 0x7FE000". Confirmed.
      if (mant < 0x7fe000) {
        esi = ecxBias;    // cmovb %ecx,%esi
        r8d = tmpEdi;     // cmovb %edi,%r8d
      } else {
        esi = tmpEsi;
        r8d = 0;
      }
      // @0x8029 movl %esi,%ecx ; movl %r8d,%edx
      // So after this block: ecx = esi, edx = r8d
    }
    // If bt was NOT taken (jae 0x802e), we fall through with:
    //   ecx = ecxBias (unchanged), edx = mant (unchanged)
    // We must model both. Use working variables:
    let workEcx: number;
    let workEdx: number;
    if ((edi >>> 12) & 1) {
      workEcx = esi >>> 0;
      workEdx = r8d >>> 0;
    } else {
      workEcx = ecxBias >>> 0;
      workEdx = mant >>> 0;
    }

    // @0x802e : cmpl $0x1F,%ecx ; jb 0x8065 (normal encode) else overflow→inf
    if (workEcx >= 0x1f) {
      // Overflow: inlined half::overflow() then result = (sign | 0x7C00).
      // Faithful side-effect call — result value of overflow() is discarded.
      half.overflow();
      const ecxOv = (sign | 0x7c00) >>> 0;             // orl $0x7C00,%eax; movl %eax,%ecx
      return (((ecxOv & 0xffff) << 16) >> 16);
    }

    // @0x8065 : normal encode
    //   shll $0xA,%ecx      ; ecx <<= 10
    //   shrl $0xD,%edx      ; edx >>= 13
    //   orl  %eax,%edx      ; edx |= sign
    //   orl  %ecx,%edx      ; edx |= ecx
    //   movl %edx,%ecx
    workEcx = (workEcx << 10) >>> 0;
    workEdx = (workEdx >>> 13) >>> 0;
    workEdx = (workEdx | sign) >>> 0;
    workEdx = (workEdx | workEcx) >>> 0;
    return (((workEdx & 0xffff) << 16) >> 16);          // movswl %cx,%eax
  }
}
