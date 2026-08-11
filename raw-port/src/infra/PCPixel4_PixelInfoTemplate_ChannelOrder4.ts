// raw-port/src/infra/PCPixel4_PixelInfoTemplate_ChannelOrder4.ts
//
// FCP `PCPixel4<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)4>>` — the
// 4-byte, 8-bit-per-channel, ALPHA-FIRST pixel (ChannelOrder 4 = `kBGRA8` in the enum
// raw-port/src/infra/PCPixelFormat.ts decodes: bpp 32, bpc 8, bytes 4, RGB, alpha,
// hasAlphaLast 0, 4 channels).
//
// File name: the template instantiation joined with underscores, following the landed
// `PCMatrix44Tmpl_double.ts` precedent — one C++ class per file, named after the class.
//
// THIS UNIT PORTS ONE SYMBOL: `unpremultiply()` @ProCore 0x4806a. The other members of the
// template are separate queue units and are not declared here.
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProApps/ProCore.framework/Versions/A/ProCore
//   (x86_64 slice; every @0xADDR below is an x86_64 vmaddr)
//
// Source disassembly:
//   raw-port/re/disasm/
//     ProCore.__ZN8PCPixel4IN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE4EEEE13unpremultiplyEv.s
//     (77 lines)
//
// ── OBJECT LAYOUT ───────────────────────────────────────────────────────────
// The object IS four bytes; `%rdi` points straight at them and the body addresses
// them as `(%rdi)`, `0x1(%rdi)`, `0x2(%rdi)`, `0x3(%rdi)`:
//   +0x00  u8  alpha     read first (`movzbl (%rdi), %eax`) and never written
//   +0x01  u8  channel1  written last  @0x48183
//   +0x02  u8  channel2  written second @0x48142
//   +0x03  u8  channel3  written first  @0x48104
// Alpha-first is what ChannelOrder 4 says, and the code agrees: the byte at +0x00 is the
// divisor and the only byte the routine leaves alone.
//
// ── DECODED RIP-RELATIVE CONSTANTS ──────────────────────────────────────────
// Each was read out of the LIVE image at slide + the resolved address, not inferred from
// its use:
//   K_1_OVER_255 = 0.00392156862745098  (f64) @ProCore 0x124028
//                  movsd @0x4808e; 0x48096 + 0xdbf92. Bytes 101010101010703f — the f64
//                  nearest 1/255.
//   K_ONE_F      = 1.0f                 (f32) @ProCore 0xe1f70
//                  movss @0x4809e; 0x480a6 + 0x99eca. Bytes 0000803f.
//   K_255_F      = 255.0f               (f32) @ProCore 0xe1fbc
//                  movss @0x480c1; 0x480c9 + 0x99ef3. Bytes 00007f43.
//   K_HALF       = 0.5                  (f64) @ProCore 0x122890
//                  movsd @0x480d1; 0x480d9 + 0xda7b7. Bytes 000000000000e03f.
//   K_1E_7       = 1e-07                (f64) @ProCore 0x122880
//                  movsd @0x480dd; 0x480e5 + 0xda79b. Bytes 48afbc9af2d77a3e.
//
// ── WHAT IT COMPUTES, AND WHY THE PRECISION LADDER MATTERS ──────────────────
// Per colour channel c, with a = alpha:
//   inv   = 1.0f / (float)((double)a * 1/255)            @0x4808a-0x480a6
//   f     = (float)((double)c * 1/255) * inv * 255.0f    @0x480ae-0x480c9
//   d     = (double)f + 0.5 + 1e-07                      @0x480cd-0x480e5
//   out   = clamp(trunc(floor(d)), 0, 255)               @0x480e9-0x48104
// The round trips through f32 are NOT decoration: each `cvtsd2ss` / `cvtss2sd` pair rounds
// the value to single precision and back, and dropping one changes the result at the
// rounding boundary, which is exactly where the `+ 0.5 + 1e-07` sits. They are transcribed
// with `Math.fround` at each conversion.
//
// The two additions are separate instructions on separate constants and are kept separate:
// `(d + 0.5) + 1e-07` is not `d + 0.500...1` in f64.
//
// `roundsd $0x9` is round-toward-negative-infinity with the precision exception suppressed
// (imm8 bits 0..1 = 01 "round down", bit 3 = 1 "suppress"), i.e. floor. `cvttsd2si` then
// truncates, which is exact on an already-integral value — except for NaN and for anything
// outside int32, where x86 yields the "integer indefinite" 0x80000000. That is negative, so
// the clamp below turns it into 0; the port writes that path out rather than relying on a
// JS coincidence (OPS_LOG #13 is the same shape).
//
// ── THE TWO EARLY EXITS ─────────────────────────────────────────────────────
//   alpha == 255 -> return immediately, nothing written  @0x48072
//   alpha == 0   -> write 0 to +0x03 (`movb $0x0`) and 0 to +0x01..+0x02 as ONE 16-bit store
//                   (`movw $0x0, 0x1(%rdi)`), then return  @0x48078-0x48082
// Note the order and the widths: the byte at +0x03 first, then a single word covering +0x01
// and +0x02. Only the three colour bytes are touched, and only below the frame — neither
// early exit sets up a stack frame at all (`pushq %rbp` is at 0x48083, after them).

// ── WHAT THE DIFFERENTIAL MEASURED ──────────────────────────────────────────
// raw-port/re/oracle/PCPixel4_PixelInfoTemplate_ChannelOrder4_unpremultiply_oracle.py, under
// `arch -x86_64 /usr/bin/python3`. The symbol is LOCAL (`t`), so it is called at
// slide + 0x4806a with the ten bytes there checked against the encoding of its own first
// three instructions (0fb6073dff000000740e).
//
// The output byte at +0x0k depends only on (alpha, b[k]) — `inv` is a function of alpha
// alone and the channels never interact — so 256 x 256 EXHAUSTS the input domain:
//   exhaustive alpha x value      65,536 pixels   262,144/262,144 bytes exact
//   independent random channels   20,000 pixels    80,000/80,000  bytes exact
//   both early exits              512 pixels        2,048/2,048   bytes exact
//   pixels where the routine wrote outside +0x01..+0x03, alpha included: 0
//     (each pixel was called inside a poisoned 16-byte neighbourhood and the whole
//      neighbourhood diffed, which is how "it writes nothing else" is shown at all)
//
// Eight mutants of this file; six killed — no f32 round trip (421 bytes), round instead of
// floor (64,244), clamp high 254 (127,646), alpha 0 leaving +0x03 alone (606), alpha read
// from +0x01 (135,813), scale 256 instead of 255 (61,939). TWO SURVIVED, and because the
// domain is exhausted they are EQUIVALENT rather than evidence of a blind harness:
//   * dropping `+ 1e-07` changes nothing: it can only matter when (value + 0.5) lands
//     within 1e-07 below an integer, and over the whole domain it never does. The bias the
//     compiler emitted is inert for this pixel type.
//   * removing the `alpha == 255` early exit changes nothing: inv is then exactly 1.0f and
//     the ladder returns each channel unchanged, so the `je` @0x48072 is a fast path, not a
//     special case.
// Both were predicted from the code and then confirmed, and the oracle fails if a survivor
// is NOT on that list — a surviving mutant is otherwise a hole in the measurement.
//

/** `Math.fround` — the f32 rounding each `cvtsd2ss` / `movss` performs. */
const f32 = Math.fround;

/** @const 1/255 as f64 @ProCore 0x124028 (movsd @0x4808e). */
const K_1_OVER_255 = 0.00392156862745098;
/** @const 1.0f @ProCore 0xe1f70 (movss @0x4809e). */
const K_ONE_F = f32(1.0);
/** @const 255.0f @ProCore 0xe1fbc (movss @0x480c1). */
const K_255_F = f32(255.0);
/** @const 0.5 as f64 @ProCore 0x122890 (movsd @0x480d1). */
const K_HALF = 0.5;
/** @const 1e-07 as f64 @ProCore 0x122880 (movsd @0x480dd). */
const K_1E_7 = 1e-7;

/**
 * `cvttsd2si` to int32 — truncation toward zero, with the x86 "integer indefinite"
 * result 0x80000000 (-2147483648) for NaN and for anything outside the int32 range.
 * Cited @0x480ef, @0x48134, @0x48175. A bare `| 0` in JS does NOT reproduce that, so it
 * is written out (the OPS_LOG #13 failure class: a plausible wrong number, no throw).
 */
function cvttsd2si(x: number): number {
  const t = Math.trunc(x);
  if (!Number.isFinite(t) || t < -2147483648 || t > 2147483647) {
    return -2147483648;
  }
  return t;
}

/**
 * `PCPixel4<PixelInfoTemplate<(ChannelOrder)4>>` — the 4-byte alpha-first 8-bit pixel.
 * See the file header for the layout and for what is and is not ported here.
 */
export class PCPixel4_PixelInfoTemplate_ChannelOrder4 {
  /**
   * The four bytes the object consists of, in memory order: alpha at +0x00 then the three
   * colour channels at +0x01..+0x03. A `Uint8Array` because the C++ object is exactly these
   * four bytes and the body addresses them individually.
   */
  public bytes: Uint8Array = new Uint8Array(4);

  /**
   * `PCPixel4<ProCore::Private::PixelInfoTemplate<(PCPixelFormat::ChannelOrder)4>>::unpremultiply()`
   *   — @ProCore 0x4806a
   *   — __ZN8PCPixel4IN7ProCore7Private17PixelInfoTemplateILN13PCPixelFormat12ChannelOrderE4EEEE13unpremultiplyEv
   *
   * Line-for-line transcription of the 77-line body. No callees, no externs, no indirect
   * calls; the routine returns void and writes only +0x01..+0x03.
   *
   *   0x4806a  movzbl (%rdi), %eax            ; eax = alpha
   *   0x4806d  cmpl   $0xff, %eax
   *   0x48072  je     0x48082                 ; alpha == 255 -> return, untouched
   *   0x48074  testl  %eax, %eax
   *   0x48076  jne    0x48083                 ; alpha != 0 -> the divide path
   *   0x48078  movb   $0x0, 0x3(%rdi)         ; alpha == 0 -> zero +0x03 ...
   *   0x4807c  movw   $0x0, 0x1(%rdi)         ; ... and +0x01..+0x02 as ONE word
   *   0x48082  retq
   *   0x48083  pushq  %rbp                    ; the frame starts only on the divide path
   *   0x48087  movzbl %al, %eax
   *   0x4808a  cvtsi2sd %eax, %xmm1           ; (double)alpha
   *   0x4808e  movsd  0x124028(%rip), %xmm0   ; 1/255
   *   0x48096  mulsd  %xmm0, %xmm1            ; alpha/255 in f64
   *   0x4809a  cvtsd2ss %xmm1, %xmm2          ; -> f32
   *   0x4809e  movss  0xe1f70(%rip), %xmm1    ; 1.0f
   *   0x480a6  divss  %xmm2, %xmm1            ; inv = 1.0f / (alpha/255)   [f32 divide]
   *   then, for +0x03 (@0x480aa..0x48104), +0x02 (@0x48107..0x48142) and +0x01
   *   (@0x48145..0x48183), the identical five-step ladder:
   *   movzbl c ; cvtsi2sd ; mulsd 1/255 ; cvtsd2ss ; mulss inv ; mulss 255.0f ;
   *   cvtss2sd ; addsd 0.5 ; addsd 1e-07 ; roundsd $0x9 (floor) ; cvttsd2si ;
   *   clamp <=0 -> 0 (`cmovle` against the zeroed %eax @0x480f3) and >=255 -> 255
   *   (`cmovge` against %ecx = 0xff @0x480fa) ; movb into the channel.
   *   0x48186  popq %rbp ; 0x48187 retq
   *
   * The third channel's clamp is spelled with the registers swapped
   * (`testl %edx,%edx ; cmovgl %edx,%eax` @0x48179 — %eax is still the zero from
   * @0x480f3, so it selects max(0, edx)) and is the same clamp; it is written the same way
   * here rather than mirroring the register allocation.
   *
   * ORACLED against the live binary: see
   * raw-port/re/oracle/PCPixel4_PixelInfoTemplate_ChannelOrder4_unpremultiply_oracle.py.
   */
  unpremultiply(): void {
    const b = this.bytes;

    // @0x4806a movzbl (%rdi), %eax — alpha, zero-extended.
    const alpha = b[0]! & 0xff;

    // @0x4806d-0x48072 — fully opaque: nothing to undo, return with nothing written.
    if (alpha === 0xff) {
      return;
    }

    // @0x48074-0x48082 — fully transparent: the three colour bytes are zeroed (+0x03 by a
    // byte store, +0x01..+0x02 by one 16-bit store) and the routine returns.
    if (alpha === 0) {
      b[3] = 0; // @0x48078 movb $0x0, 0x3(%rdi)
      b[1] = 0; // @0x4807c movw $0x0, 0x1(%rdi) — the low  byte of the word
      b[2] = 0; //                                 the high byte of the word
      return;
    }

    // @0x4808a-0x480a6 — inv = 1.0f / (float)(alpha * 1/255). The multiply is f64, the
    // reciprocal is a single-precision DIVIDE (`divss`), not an estimate.
    const alphaScaled = f32(alpha * K_1_OVER_255); // cvtsi2sd ; mulsd ; cvtsd2ss
    const inv = f32(K_ONE_F / alphaScaled); //        divss

    // @0x480aa..0x48183 — the three colour channels, in the machine's order: +0x03, then
    // +0x02, then +0x01.
    for (const off of [3, 2, 1] as const) {
      // movzbl c ; cvtsi2sd ; mulsd 1/255 ; cvtsd2ss
      const scaled = f32((b[off]! & 0xff) * K_1_OVER_255);
      // mulss inv ; mulss 255.0f — two separate f32 multiplies, in this order
      const unpremul = f32(f32(scaled * inv) * K_255_F);
      // cvtss2sd ; addsd 0.5 ; addsd 1e-07 — two separate f64 adds, in this order
      const rounded = unpremul + K_HALF + K_1E_7;
      // roundsd $0x9 (round toward -inf) ; cvttsd2si
      let v = cvttsd2si(Math.floor(rounded));
      // testl ; cmovle 0   /   cmpl $0xff ; cmovge 0xff
      if (v <= 0) {
        v = 0;
      }
      if (v >= 255) {
        v = 255;
      }
      b[off] = v; // movb %dl, off(%rdi)
    }
  }
}
