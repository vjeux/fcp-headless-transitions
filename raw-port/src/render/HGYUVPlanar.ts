// HGYUVPlanar.ts — Helium HGYUVPlanar (the two static helpers that pick
// per-range/per-format Y'CbCr scale/bias vectors and precision flags used by
// the planar-YUV nodes HGYUVPlanarToRGBA and HGYUVPlanarTo444).
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:  raw-port/re/disasm/Helium.HGYUVPlanar.GetScaleBiasForRange.s (@0xe48f0,
//                                extracted via `llvm-objdump --disassemble-symbols` because the
//                                otool -tV bulk dump used by disasm.sh doesn't emit a label for
//                                this symbol at the fat-binary x86_64 slice boundary; the guard
//                                in disasm.sh triggers, and llvm-objdump gives the exact body.)
//                      raw-port/re/disasm/Helium.HGYUVPlanar.GetPrecisionForRange.s (@0xe49b0)
//
// Helium symbols transcribed:
//   @0xe48f0  HGYUVPlanar::GetScaleBiasForRange(HGYUVPlanar::YCbCrRange, int, HGFormatCompression,
//                                               float (&) [4], float (&) [4])
//   @0xe49b0  HGYUVPlanar::GetPrecisionForRange(HGYUVPlanar::YCbCrRange, int, HGFormatPrecisionFlags&)
//
// DECODE evidence — GetScaleBiasForRange:
//   ABI (static method, no `this`):  edi=range, esi=int, edx=compression,
//                                    rcx=&scale[4], r8=&bias[4]
//   Output layout (four f32 stored to *rcx and *r8):
//     @0xe497d  movlps  %xmm2, (%rcx)                 ; scale[0..1] = xmm2.f32[0..1]
//     @0xe4980  extractps $0x1, %xmm2, 0x8(%rcx)      ; scale[2]    = xmm2.f32[1]
//     @0xe4987  movl    $0x3f800000, 0xc(%rcx)        ; scale[3]    = 1.0f
//     @0xe498e  movlps  %xmm0, (%r8)                  ; bias[0..1]  = xmm0.f32[0..1]
//     @0xe4992  movss   %xmm1, 0x8(%r8)               ; bias[2]     = xmm1.f32[0]
//     @0xe4998  movl    $0x0, 0xc(%r8)                ; bias[3]     = 0.0f
//
//   Data literals — all read from the Helium binary (VA -> file offset = VA + 0x4000
//   for the x86_64 slice of the FAT binary). Full raw bytes captured in-line
//   below; decodes verified by struct.unpack("<f"/"<d"):
//
//     @0x3cf190  8B (movsd @0xe4928):  00 00 00 00 00 00 00 bf
//                as 2xf32 -> ( 0.0,  -0.5)        [SECOND-PATH bias[0..1]]
//     @0x3c7ccc  4B (movss @0xe4930):  00 00 00 bf
//                as   f32 -> -0.5                 [SECOND-PATH bias[2]]
//     @0x3cf1a0  8B (movsd @0xe48fc):  25 a0 95 bd  25 49 12 bf
//                as 2xf32 -> (-0.07305935770273209, -0.5714285969734192)
//                            (~= -16/219, == -128/224)     [FIRST-PATH bias[0..1]]
//     @0x3cf1d0  4B (movss @0xe4904):  25 49 12 bf
//                as   f32 -> -0.5714285969734192   [FIRST-PATH bias[2] == -128/224]
//     @0x3cf1b0  8B (movsd @0xe491e):  85 0a 95 3f  db b6 91 3f
//                as 2xf32 -> ( 1.1643835306167603,  1.1383928060531616 )
//                            ( == 255/219, == 255/224 )     [FIRST-PATH narrow-default scale]
//     @0x3cf1d8  8B (leaq @0xe4944, indexed by (%rdx,%rax,4) @0xe494b):
//                    00 00 80 3f  88 1f 80 3f
//                as 2xf32 -> ( 1.0, 1.000962257385254 )     [SECOND-PATH range==1 scale table]
//                (comp==0 -> al=1 -> picks 1.000962...; comp!=0 -> al=0 -> picks 1.0)
//     @0x3ca0b0 16B (movaps @0xe4956): 00 00 80 3f  00 00 80 3f  00 00 00 00  00 00 00 00
//                as 4xf32 -> ( 1.0, 1.0, 0.0, 0.0 )         [SECOND-PATH default (identity) scale]
//     @0x3cf1e0  8B (leaq @0xe4966, indexed by (%rdx,%rax,4) @0xe496d):
//                    00 c0 7f 47  00 ff 7f 47
//                as 2xf32 -> ( 65472.0, 65535.0 )           [SCALE_COMP_BRANCH numerator table]
//                (comp==0 -> al=1 -> picks 65535.0; comp!=0 -> al=0 -> picks 65472.0)
//     @0x3cf1c0 16B (divps @0xe4976):  00 00 5b 47  00 00 60 47  00 00 00 00  00 00 00 00
//                as 4xf32 -> ( 56064.0, 57344.0, 0.0, 0.0 ) [SCALE_COMP_BRANCH divisor]
//
//   Control flow (from disasm):
//     @0xe48f4  leal -3(%rdi), %eax
//     @0xe48fa  ja 0xe4928           ; if (unsigned)(range - 3) > 3  -> SECOND PATH
//                                    ; i.e. if range in {0,1,2} OR range >= 7
//     FIRST PATH (range in {3,4,5,6}):
//       load xmm0 = @0x3cf1a0 (-0.07306, -0.57143), xmm1 = @0x3cf1d0 (-0.57143)
//       if esi == 2                                        -> SCALE_COMP_BRANCH (@0xe495f)
//       else if edi == 6                                   -> SCALE_COMP_BRANCH
//       else if (edi & 6) == 4  (i.e. range in {4,5})      -> SCALE_COMP_BRANCH
//       else load xmm2 = @0x3cf1b0 (1.16438, 1.13839)      -> STORE
//     SECOND PATH (range in {0,1,2, >=7}):
//       load xmm0 = @0x3cf190 (0.0, -0.5), xmm1 = @0x3c7ccc (-0.5)
//       if edi == 1:
//         al = (comp == 0) ? 1 : 0
//         xmm2 = @0x3cf1d8[al]  (comp==0 -> 1.000962, else 1.0)
//         movsldup -> xmm2 = { that, that, ?, ? }
//         -> STORE
//       else:
//         xmm2 = @0x3ca0b0  (1.0, 1.0, 0.0, 0.0)
//         -> STORE
//     SCALE_COMP_BRANCH @0xe495f:
//       al = (comp == 0) ? 1 : 0
//       xmm2 = @0x3cf1e0[al]  (comp==0 -> 65535.0, else 65472.0)
//       movsldup -> xmm2 = { that, that, ?, ? }
//       divps @0x3cf1c0 (56064, 57344, 0, 0) -> xmm2 = { that/56064, that/57344, NaN, NaN }
//       -> STORE
//
//   Store semantics (all paths converge on @0xe497d..@0xe4998):
//     scale[0] = xmm2.f32[0]
//     scale[1] = xmm2.f32[1]   (via movlps: writes 2 f32)
//     scale[2] = xmm2.f32[1]   (via extractps $1)
//     scale[3] = 1.0f
//     bias[0]  = xmm0.f32[0]
//     bias[1]  = xmm0.f32[1]   (via movlps)
//     bias[2]  = xmm1.f32[0]   (via movss)
//     bias[3]  = 0.0f
//
//   Video-engineering interpretation (for provenance sanity, not the decode itself):
//     - FIRST PATH narrow-default (range == 3, i != 2): scale (255/219, 255/224) is
//       exactly the Rec.601/709 8-bit narrow-range "code-value to unity" scale.
//       Bias (-16/219, -128/224) is the standard black-level / chroma-center offset.
//     - SCALE_COMP_BRANCH: numerator 65472 = 219*256*(1 + 63/56064) ≈ 219<<8 with a
//       10-bit-in-16-bit tweak; 65535 is the plain 16-bit full range. Denominators
//       56064 = 219*256 (Y range in 10-bit-shifted-to-16-bit code space) and
//       57344 = 224*256 (chroma). So the picked scale is (16-bit-full / 10-bit-legal),
//       the 10-bit equivalent of FIRST PATH's narrow scale, selected when the caller
//       wants 10-bit-in-16-bit-container units.
//     - SECOND PATH range==1: 1.000962... ≈ 1024/1023 — the "1-code" precision offset
//       between 10-bit range 0..1023 (1024 codes) and 0..1023 as a scale.
//   The exact semantics of the YCbCrRange enum values are not exposed by symbols in
//   Helium; we keep the enum as an opaque narrow-int alias.
//
// DECODE evidence — GetPrecisionForRange:
//   ABI: edi=range, esi=int, rdx=&HGFormatPrecisionFlags
//     @0xe49b4  cmpl $0x2, %esi
//     @0xe49b7  je 0xe49c8                    ; if (i == 2) write flag
//     @0xe49b9  cmpl $0x6, %edi
//     @0xe49bc  ja 0xe49ce                    ; if (range > 6) return without write
//     @0xe49be  movl $0x76, %eax              ; bitmask 0x76 = 0b0111_0110
//     @0xe49c3  btl %edi, %eax
//     @0xe49c6  jae 0xe49ce                   ; if bit(range) NOT SET in mask -> no write
//     @0xe49c8  movl $0x8, (%rdx)             ; *out = 8
//     @0xe49ce  popq %rbp / retq
//
//   The bitmask 0x76 = 0b01110110 has bits set at positions {1,2,4,5,6}. So the
//   "write $0x8" branch fires iff (i == 2) OR range ∈ {1,2,4,5,6}. In particular,
//   range ∈ {0, 3, 7+} with i != 2 leaves *out untouched (caller-provided value
//   preserved).

// ---------------------------------------------------------------------------
// Frontier types (undecoded enums surfaced as narrow int aliases).
// ---------------------------------------------------------------------------

/** HGYUVPlanar::YCbCrRange — undecoded enum from Helium. Only its INTEGER
 *  VALUE MATTERS for this file, via the following comparisons in the disasm:
 *    @0xe48f4-@0xe48fa   range-3 unsigned <= 3   (range in {3,4,5,6})
 *    @0xe4911            range == 6
 *    @0xe4916-@0xe491c   (range & 6) == 4         (range in {4,5,6,7} intersected
 *                                                  with FIRST-PATH: {4,5})
 *    @0xe4938            range == 1
 *    @0xe49b9-@0xe49bc   range <= 6
 *    @0xe49c3            bit(range) in mask 0x76 (positions {1,2,4,5,6})
 *  So the enum has AT LEAST integer values in {0,1,2,3,4,5,6}; higher values
 *  are possible but treated as "second path" / "no write". We keep this as a
 *  narrow-int alias to avoid inventing names. */
export type YCbCrRange = number;

/** HGFormatCompression — undecoded enum from Helium. Only `== 0` is
 *  distinguished in this file (twice, at @0xe463f and @0xe4961), so we surface
 *  it as a narrow-int alias. */
export type HGFormatCompression = number;

/** HGFormatPrecisionFlags — undecoded C++ type from Helium. The disassembly
 *  writes ONE 4-byte value (0x8) at offset 0 of the referenced object:
 *    @0xe49c8  movl $0x8, (%rdx)
 *  so we model it as an object with a single int32 field at offset 0. Nothing
 *  else in the two ported functions reads or writes anywhere else. */
export interface HGFormatPrecisionFlags {
  /** The int32 written at offset 0 by GetPrecisionForRange when the "write"
   *  branch fires. Only the value 0x8 is ever stored here by this function. */
  value: number;
}

// ---------------------------------------------------------------------------
// Numeric constants — VERBATIM decodes of the Helium data-segment literals
// listed in the header. Kept as `const` so the transcription and its evidence
// stay together in one file.
// ---------------------------------------------------------------------------

/** @Helium 0x3cf190  (8 bytes: 00 00 00 00 00 00 00 bf)
 *  Loaded at @0xe4928 with `movsd`; used as bias[0..1] on the SECOND PATH
 *  (range in {0,2,>=7}) — decoded as 2xf32 == (0.0, -0.5). */
const BIAS_SECOND_PATH_LO_HI: readonly [number, number] = [
  Math.fround(0.0),
  Math.fround(-0.5),
];

/** @Helium 0x3c7ccc  (4 bytes: 00 00 00 bf)
 *  Loaded at @0xe4930 with `movss`; used as bias[2] on the SECOND PATH —
 *  decoded as f32 == -0.5. */
const BIAS_SECOND_PATH_2: number = Math.fround(-0.5);

/** @Helium 0x3cf1a0  (8 bytes: 25 a0 95 bd 25 49 12 bf)
 *  Loaded at @0xe48fc with `movsd`; used as bias[0..1] on the FIRST PATH
 *  (range in {3,4,5,6}) — decoded as 2xf32:
 *    ( -0.07305935770273209,  -0.5714285969734192 )
 *  i.e. approximately (-16/219, -128/224). */
const BIAS_FIRST_PATH_LO_HI: readonly [number, number] = [
  Math.fround(-0.07305935770273209),
  Math.fround(-0.5714285969734192),
];

/** @Helium 0x3cf1d0  (4 bytes: 25 49 12 bf)
 *  Loaded at @0xe4904 with `movss`; used as bias[2] on the FIRST PATH — decoded
 *  as f32 == -0.5714285969734192 (i.e. -128/224). */
const BIAS_FIRST_PATH_2: number = Math.fround(-0.5714285969734192);

/** @Helium 0x3cf1b0  (8 bytes: 85 0a 95 3f db b6 91 3f)
 *  Loaded at @0xe491e with `movsd`; the DEFAULT scale on the FIRST PATH
 *  (range == 3, i != 2) — decoded as 2xf32:
 *    ( 1.1643835306167603, 1.1383928060531616 )   ≡ (255/219, 255/224). */
const SCALE_FIRST_PATH_NARROW: readonly [number, number] = [
  Math.fround(1.1643835306167603),
  Math.fround(1.1383928060531616),
];

/** @Helium 0x3cf1d8  (8 bytes: 00 00 80 3f 88 1f 80 3f)
 *  Referenced by `leaq` at @0xe4944 and indexed by `(%rdx,%rax,4)` at
 *  @0xe494b. Table of 2 f32:
 *    entry 0 = 1.0
 *    entry 1 = 1.000962257385254   (~= 1024/1023)
 *  Selected index `al = (compression == 0) ? 1 : 0` — so compression==0 picks
 *  1.000962..., otherwise 1.0. */
const TABLE_SECOND_PATH_RANGE1_SCALE: readonly [number, number] = [
  Math.fround(1.0),
  Math.fround(1.000962257385254),
];

/** @Helium 0x3ca0b0  (16 bytes: 00 00 80 3f 00 00 80 3f 00 00 00 00 00 00 00 00)
 *  Loaded at @0xe4956 with `movaps`; used as xmm2 (all 4 lanes) on the
 *  SECOND-PATH default (range in {0, 2, >=7}) — decoded as 4xf32:
 *    ( 1.0, 1.0, 0.0, 0.0 ). Only the low 2 lanes are consumed by the
 *  subsequent `movlps` + `extractps $1`. */
const SCALE_SECOND_PATH_IDENTITY: readonly [number, number] = [
  Math.fround(1.0),
  Math.fround(1.0),
];

/** @Helium 0x3cf1e0  (8 bytes: 00 c0 7f 47 00 ff 7f 47)
 *  Referenced by `leaq` at @0xe4966 and indexed by `(%rdx,%rax,4)` at
 *  @0xe496d. Table of 2 f32:
 *    entry 0 = 65472.0    (10-bit range 0..1023 shifted <<6 -> 0..65472)
 *    entry 1 = 65535.0    (full 16-bit range)
 *  Selected index `al = (compression == 0) ? 1 : 0`. */
const TABLE_SCALE_COMP_NUMERATOR: readonly [number, number] = [
  Math.fround(65472.0),
  Math.fround(65535.0),
];

/** @Helium 0x3cf1c0  (16 bytes: 00 00 5b 47 00 00 60 47 00 00 00 00 00 00 00 00)
 *  Loaded at @0xe4976 as the DIVISOR of `divps` — 4xf32:
 *    ( 56064.0, 57344.0, 0.0, 0.0 )   ≡ (219*256, 224*256, 0, 0).
 *  Lane 0 (Y) divides by 56064; lane 1 (Cb/Cr) divides by 57344. Lanes 2 and
 *  3 divide zero-by-zero producing NaN, but those lanes are never observed
 *  because the store uses only `movlps` (lanes 0..1) + `extractps $1` (lane 1). */
const SCALE_COMP_DENOMINATOR: readonly [number, number] = [
  Math.fround(56064.0),
  Math.fround(57344.0),
];

// ---------------------------------------------------------------------------
// HGYUVPlanar::GetScaleBiasForRange(YCbCrRange, int, HGFormatCompression,
//                                   float(&)[4], float(&)[4])  @Helium 0xe48f0
//
//   Pure output-into-arrays function. See the top-of-block comment for the
//   full asm mapping. The two output arrays MUST have length 4; we write all
//   four elements of each.
// ---------------------------------------------------------------------------

/** HGYUVPlanar::GetScaleBiasForRange @Helium 0xe48f0.
 *  Fills `scale[0..3]` and `bias[0..3]` based on the tuple (range, i,
 *  compression). See the block comment above the function for the full
 *  branch-by-branch mapping. */
export function HGYUVPlanar_GetScaleBiasForRange(
  range: YCbCrRange,
  i: number,
  compression: HGFormatCompression,
  scale: Float32Array | number[],
  bias: Float32Array | number[],
): void {
  // The two output arrays are `float(&)[4]`. Enforce that shape.
  if (scale.length < 4 || bias.length < 4) {
    // No asm addr — this is a TS-side sanity check. The C++ ABI passes a
    // pointer to a stack-allocated `float[4]` so an out-of-bounds write in
    // the original would be UB; we refuse instead.
    throw new Error(
      "HGYUVPlanar_GetScaleBiasForRange @Helium 0xe48f0: scale/bias must have length >= 4",
    );
  }

  // The two f32 registers xmm0 (bias[0..1]) and xmm1 (bias[2]) are chosen by
  // the FIRST-vs-SECOND-PATH branch. The single f32 xmm2 (scale[0..2]) is
  // chosen by up to two nested sub-branches. We mirror that exactly.
  let bias0: number;
  let bias1: number;
  let bias2: number;
  let scale0: number;
  let scale1: number;

  // @0xe48f4-@0xe48fa: `leal -3(%rdi), %eax ; cmpl $3, %eax ; ja 0xe4928`
  //   Unsigned compare of (range-3) with 3 -> "FIRST PATH" when range ∈ {3,4,5,6}.
  //   (range < 3 OR range > 6) -> SECOND PATH.
  //
  //   Unsigned semantics: `range` reaches this function via the 32-bit %edi
  //   register; the C++ enum is passed zero-extended. Negative inputs (if the
  //   enum were signed) would be treated as huge unsigned values and thus
  //   fall into SECOND PATH. We mirror that with `>>> 0`.
  const rangeU32 = range >>> 0;

  if (rangeU32 - 3 <= 3) {
    // -------- FIRST PATH  (range in {3,4,5,6}) --------
    // @0xe48fc / @0xe4904 preload bias regs.
    bias0 = BIAS_FIRST_PATH_LO_HI[0];
    bias1 = BIAS_FIRST_PATH_LO_HI[1];
    bias2 = BIAS_FIRST_PATH_2;

    // @0xe490c-@0xe491c  three OR-ed conditions that all lead to SCALE_COMP_BRANCH:
    //   * i == 2                             (@0xe490c-@0xe490f)
    //   * range == 6                         (@0xe4911-@0xe4914)
    //   * (range & 6) == 4  -> range ∈ {4,5} (@0xe4916-@0xe491c)
    // Otherwise (i.e. range == 3 with i != 2): xmm2 = SCALE_FIRST_PATH_NARROW.
    const goToScaleCompBranch =
      i === 2 || rangeU32 === 6 || (rangeU32 & 6) === 4;

    if (!goToScaleCompBranch) {
      // @0xe491e-@0xe4926
      scale0 = SCALE_FIRST_PATH_NARROW[0];
      scale1 = SCALE_FIRST_PATH_NARROW[1];
    } else {
      // Fallthrough to SCALE_COMP_BRANCH (@0xe495f).
      [scale0, scale1] = computeScaleCompBranch(compression);
    }
  } else {
    // -------- SECOND PATH  (range in {0,1,2, >=7}) --------
    // @0xe4928 / @0xe4930 preload bias regs.
    bias0 = BIAS_SECOND_PATH_LO_HI[0];
    bias1 = BIAS_SECOND_PATH_LO_HI[1];
    bias2 = BIAS_SECOND_PATH_2;

    // @0xe4938-@0xe493b  if range == 1 -> table_B1 path, else -> movaps identity.
    if (rangeU32 === 1) {
      // @0xe493d-@0xe4954
      //   al = (compression == 0) ? 1 : 0
      //   xmm2 = TABLE_SECOND_PATH_RANGE1_SCALE[al]   (then movsldup broadcasts)
      // NOTE on the sete idiom: `testl %edx, %edx ; sete %al` — sete ONLY
      //   fires when all 32 bits of edx are zero. We mirror with
      //   `compression === 0` (strict-equal to 0).
      const al = compression === 0 ? 1 : 0;
      const s = TABLE_SECOND_PATH_RANGE1_SCALE[al];
      // movsldup: {a,b,c,d} -> {a,a,c,c}. Loading a single f32 via movss puts
      // it into lane 0; the other lanes are undefined -> we only care about
      // lanes 0 and 1. movsldup makes lane 1 == lane 0 == `s`.
      scale0 = s;
      scale1 = s;
    } else {
      // @0xe4956-@0xe495d  xmm2 = SCALE_SECOND_PATH_IDENTITY = (1.0, 1.0, 0.0, 0.0).
      scale0 = SCALE_SECOND_PATH_IDENTITY[0];
      scale1 = SCALE_SECOND_PATH_IDENTITY[1];
    }
  }

  // -------- STORE  (@0xe497d-@0xe4998) --------
  //   scale[0] = xmm2.f32[0]              (movlps low half)
  //   scale[1] = xmm2.f32[1]              (movlps high half)
  //   scale[2] = xmm2.f32[1]              (extractps $1)
  //   scale[3] = 1.0f                     (movl $0x3f800000)
  //   bias[0]  = xmm0.f32[0]              (movlps low half)
  //   bias[1]  = xmm0.f32[1]              (movlps high half)
  //   bias[2]  = xmm1.f32[0]              (movss)
  //   bias[3]  = 0.0f                     (movl $0)
  //
  //   All stores are single-precision; we apply Math.fround at the final
  //   store site to guarantee bit-identical outputs when the caller reads
  //   the values back as f32.
  scale[0] = Math.fround(scale0);
  scale[1] = Math.fround(scale1);
  scale[2] = Math.fround(scale1);
  scale[3] = Math.fround(1.0);
  bias[0] = Math.fround(bias0);
  bias[1] = Math.fround(bias1);
  bias[2] = Math.fround(bias2);
  bias[3] = Math.fround(0.0);
}

/** Helper for the SCALE_COMP_BRANCH @0xe495f-@0xe497b.
 *   al = (compression == 0) ? 1 : 0
 *   xmm2 = TABLE_SCALE_COMP_NUMERATOR[al]     (broadcast via movsldup)
 *   xmm2 = xmm2 / SCALE_COMP_DENOMINATOR       (via `divps`)
 *  Only lanes 0 and 1 of the result matter (lanes 2..3 are NaN in the asm and
 *  are never read by the store). Returns [scale0, scale1]. */
function computeScaleCompBranch(
  compression: HGFormatCompression,
): [number, number] {
  // @0xe495f-@0xe4963  al = (compression == 0) ? 1 : 0
  const al = compression === 0 ? 1 : 0;
  // @0xe4966-@0xe4972  xmm2 = { table[al], table[al], ?, ? } after movsldup.
  const num = TABLE_SCALE_COMP_NUMERATOR[al];
  // @0xe4976  divps 0x3cf1c0(%rip), %xmm2
  //   xmm2.f32[0] = num / 56064
  //   xmm2.f32[1] = num / 57344
  //   xmm2.f32[2..3] = num/0 = NaN (unread)
  //
  //   Divisions are single-precision `divps`; fround the result to f32.
  const s0 = Math.fround(num / SCALE_COMP_DENOMINATOR[0]);
  const s1 = Math.fround(num / SCALE_COMP_DENOMINATOR[1]);
  return [s0, s1];
}

// ---------------------------------------------------------------------------
// HGYUVPlanar::GetPrecisionForRange(YCbCrRange, int, HGFormatPrecisionFlags&)
//   @Helium 0xe49b0
//
//   Signature (ABI): edi=range, esi=i, rdx=&out
//
//   @0xe49b0  pushq %rbp / movq %rsp, %rbp
//   @0xe49b4  cmpl $0x2, %esi
//   @0xe49b7  je 0xe49c8                    ; i == 2 -> WRITE
//   @0xe49b9  cmpl $0x6, %edi
//   @0xe49bc  ja 0xe49ce                    ; range > 6 (unsigned) -> NO-WRITE / return
//   @0xe49be  movl $0x76, %eax              ; eax = 0b01110110 (bits {1,2,4,5,6})
//   @0xe49c3  btl %edi, %eax                ; CF = eax >> (range % 32) & 1
//   @0xe49c6  jae 0xe49ce                   ; CF == 0 -> NO-WRITE / return
//   @0xe49c8  movl $0x8, (%rdx)             ; *out.value = 8
//   @0xe49ce  popq %rbp / retq
//
//   Semantics:
//     - If i == 2 OR (range ≤ 6 AND range ∈ {1,2,4,5,6}), write 8 to *out.
//     - Otherwise leave *out untouched.
//   (Note that i == 2 fires the write regardless of range — even for range >
//    6, because the `cmpl $0x2, %esi ; je` short-circuits BEFORE the range
//    check.)
// ---------------------------------------------------------------------------

/** HGYUVPlanar::GetPrecisionForRange @Helium 0xe49b0.
 *  Conditionally writes `out.value = 8`; otherwise leaves `out.value`
 *  untouched. See the block comment above the function for the full
 *  branch-by-branch mapping. */
export function HGYUVPlanar_GetPrecisionForRange(
  range: YCbCrRange,
  i: number,
  out: HGFormatPrecisionFlags,
): void {
  // @0xe49b4-@0xe49b7  if (i == 2) -> WRITE.
  if (i === 2) {
    // @0xe49c8 movl $0x8, (%rdx)
    out.value = 8;
    return;
  }

  // @0xe49b9-@0xe49bc  if (range > 6, unsigned) -> NO-WRITE.
  //   Same unsigned rationale as GetScaleBiasForRange: enum was zero-extended
  //   into %edi. We mirror with `>>> 0`.
  const rangeU32 = range >>> 0;
  if (rangeU32 > 6) {
    return;
  }

  // @0xe49be-@0xe49c6  test bit `range` of the mask 0x76 (bits {1,2,4,5,6}).
  //   `btl %edi, %eax` on x86 reads the bit at (edi mod 32) of eax. Because
  //   we already handled range > 6 above, `rangeU32 & 31 == rangeU32` here.
  //   CF = (0x76 >> rangeU32) & 1. `jae` == "jump if CF == 0" -> no-write.
  const mask = 0x76;
  const bit = (mask >>> rangeU32) & 1;
  if (bit === 0) {
    return;
  }

  // @0xe49c8 movl $0x8, (%rdx)
  out.value = 8;
}
