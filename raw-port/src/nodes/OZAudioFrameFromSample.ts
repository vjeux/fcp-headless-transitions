// OZAudioFrameFromSample.ts — Ozone free function.
//
//   @Ozone 0x23c950  OZAudioFrameFromSample(double, float, int, bool, double*)
//                      __Z22OZAudioFrameFromSampledfibPd
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// DECODE:    raw-port/re/disasm/__Z22OZAudioFrameFromSampledfibPd.s  (112 lines)
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __Z22OZAudioFrameFromSampledfibPd Ozone`)
//
// This is the SAMPLE -> FRAME direction. Its neighbour in the binary,
// OZAudioSampleTimeFromFrameTime @0x23cb00, is already ported in
// raw-port/src/nodes/OZAudioSampleTimeFromFrameTime.ts; this file follows that
// one's conventions (free function, file named after the symbol, Math.fround
// on the float32 argument).
//
// ── SIGNATURE (SysV x86-64) ─────────────────────────────────────────────────
//   %xmm0  double sample        — the audio sample position being converted
//   %xmm1  float  sampleRate    — 32000 / 44100 / 48000 … (float32 on the wire)
//   %edi   int    fps           — the integer frame rate (30 / 24 / …)
//   %sil   bool   ntsc          — use the 1000/1001 ("NTSC") sample grid
//   %rdx   double* outRemainder — optional; receives the SAMPLES-INTO-FRAME
//                                 remainder. Null-checked @0x23ca93 / @0x23caba.
//   returns %xmm0 = the fractional frame position.
//
// ── TWO PATHS ───────────────────────────────────────────────────────────────
// EXACT-TABLE path — taken only when `ntsc` is true (@0x23c960) AND the
// (fps, sampleRate) pair is one of four hard-coded combinations. Each has a
// static int32 table of CUMULATIVE SAMPLE BOUNDARIES for one repeating cycle
// of frames, so the port lands on the same integer sample boundary FCP does
// instead of accumulating 1.001 rounding drift:
//
//   fps  rate    table symbol (@Ozone)                framesPerCycle  cycle samples
//   30   32000   __ZL22gFrameToSample30fps32k 0x70ab40      15            16016
//   30   44100   __ZL22gFrameToSample30fps44k 0x70ab80     100           147147
//   30   48000   __ZL22gFrameToSample30fps48k 0x70ad20       5             8008
//   24   48000   __ZL22gFrameToSample24fps48k 0x70ad38       1             2002
//
// Each table holds framesPerCycle + 1 int32 entries: entry 0 is 0 and the last
// entry IS the cycle length, which is also the `movsd` period constant the
// same branch loads. (Cross-check: 32000 * 1.001 / 30 * 15 = 16016;
// 44100 * 1.001 / 30 * 100 = 147147; 48000 * 1.001 / 30 * 5 = 8008;
// 48000 * 1.001 / 24 * 1 = 2002. The entries themselves are NOT reproducible
// by one rounding rule — index 1 of the 44100 table is 1472 where nearest
// rounding gives 1471 — so they are transcribed VERBATIM from the binary's
// __TEXT __const, never recomputed.)
//
// GENERIC path @0x23ca9a — everything else (including `ntsc` false, and any
// unlisted fps/rate pair): a plain rate conversion, dividing the sample by
// 1.001 first when `ntsc` is set.
//
// ── CONSTANT POOL (every RIP-relative operand, resolved) ────────────────────
//   @0x23c96d  ucomiss 0x4ce1c4(%rip) -> 0x70ab38 = 32000.0f
//   @0x23c97f  movsd   0x4ce189(%rip) -> 0x70ab10 = 16016.0
//   @0x23c994  ucomiss 0x4ce199(%rip) -> 0x70ab34 = 48000.0f
//   @0x23c9b2  movsd   0x4ce14e(%rip) -> 0x70ab08 = 2002.0
//   @0x23c9c1  ucomiss 0x4ce174(%rip) -> 0x70ab3c = 44100.0f
//   @0x23c9d3  movsd   0x4ce13d(%rip) -> 0x70ab18 = 147147.0
//   @0x23c9e2  ucomiss 0x4ce14b(%rip) -> 0x70ab34 = 48000.0f  (same slot as above)
//   @0x23c9fc  movsd   0x4ce11c(%rip) -> 0x70ab20 = 8008.0
//   @0x23ca9f  divsd   0x4ce081(%rip) -> 0x70ab28 = 1.001
// (Each target = the displacement plus the address of the FOLLOWING
// instruction; the values are the little-endian float32/float64 at those
// addresses in the x86_64 slice's __TEXT __const, section addr 0x705380.)
//
// CALLEES: one, and it is a TRUE out-of-scope extern — libc `_modf` through
// the Ozone symbol stub @0x6dff9c (`callq 0x6dff9c` @0x23cad6), used only on
// the generic path and only when `outRemainder` is non-null. `depgraph.py deps`
// lists no in-scope dependency; there is no allocation and no indirect or
// virtual dispatch. `modf` is modelled inline by its C definition (integral
// part truncated toward zero, fractional part keeps the sign), the same
// boundary treatment the landed ports give `_memcmp`.

/**
 * `__ZL22gFrameToSample30fps32k` — @Ozone 0x70ab40, 16 × int32.
 * Cumulative sample boundaries of a 15-frame NTSC cycle at 32 kHz; the final
 * entry 16016 is the cycle length loaded as the period @0x23c97f.
 * Transcribed verbatim from __TEXT __const.
 */
export const OZ_G_FRAME_TO_SAMPLE_30FPS_32K: readonly number[] = [
  0, 1068, 2135, 3203, 4271, 5339, 6406, 7474, 8542, 9610, 10677, 11745,
  12813, 13881, 14948, 16016,
];

/**
 * `__ZL22gFrameToSample30fps44k` — @Ozone 0x70ab80, 101 × int32.
 * Cumulative sample boundaries of a 100-frame NTSC cycle at 44.1 kHz; the
 * final entry 147147 is the cycle length loaded as the period @0x23c9d3.
 * Transcribed verbatim from __TEXT __const.
 */
export const OZ_G_FRAME_TO_SAMPLE_30FPS_44K: readonly number[] = [
  0, 1472, 2943, 4415, 5886, 7358, 8829, 10301, 11772, 13244, 14715, 16187,
  17658, 19130, 20601, 22073, 23544, 25016, 26487, 27959, 29430, 30902, 32373,
  33844, 35315, 36787, 38258, 39730, 41201, 42673, 44144, 45616, 47087, 48559,
  50030, 51502, 52973, 54445, 55916, 57388, 58859, 60331, 61802, 63274, 64745,
  66217, 67688, 69159, 70630, 72102, 73573, 75045, 76516, 77988, 79459, 80931,
  82402, 83874, 85345, 86817, 88288, 89760, 91231, 92703, 94174, 95646, 97117,
  98589, 100060, 101532, 103003, 104474, 105945, 107417, 108888, 110360,
  111831, 113303, 114774, 116246, 117717, 119189, 120660, 122132, 123603,
  125075, 126546, 128018, 129489, 130961, 132432, 133904, 135375, 136847,
  138318, 139790, 141261, 142733, 144204, 145676, 147147,
];

/**
 * `__ZL22gFrameToSample30fps48k` — @Ozone 0x70ad20, 6 × int32.
 * Cumulative sample boundaries of a 5-frame NTSC cycle at 48 kHz; the final
 * entry 8008 is the cycle length loaded as the period @0x23c9fc.
 * Transcribed verbatim from __TEXT __const.
 */
export const OZ_G_FRAME_TO_SAMPLE_30FPS_48K: readonly number[] = [
  0, 1602, 3203, 4805, 6406, 8008,
];

/**
 * `__ZL22gFrameToSample24fps48k` — @Ozone 0x70ad38, 2 × int32.
 * The degenerate 1-frame cycle at 24 fps / 48 kHz; the final entry 2002 is the
 * cycle length loaded as the period @0x23c9b2.
 * Transcribed verbatim from __TEXT __const.
 */
export const OZ_G_FRAME_TO_SAMPLE_24FPS_48K: readonly number[] = [0, 2002];

/** 32000.0f — @Ozone 0x70ab38, the `ucomiss` operand @0x23c96d. */
const RATE_32K = 32000;
/** 44100.0f — @Ozone 0x70ab3c, the `ucomiss` operand @0x23c9c1. */
const RATE_44K = 44100;
/** 48000.0f — @Ozone 0x70ab34, the `ucomiss` operand @0x23c994 / @0x23c9e2. */
const RATE_48K = 48000;
/** 1.001 — @Ozone 0x70ab28, the NTSC divisor `divsd` @0x23ca9f. */
const NTSC_DIVISOR = 1.001;
/** 16016.0 — @Ozone 0x70ab10, the 30fps/32k cycle period `movsd` @0x23c97f. */
const PERIOD_30FPS_32K = 16016;
/** 147147.0 — @Ozone 0x70ab18, the 30fps/44.1k cycle period `movsd` @0x23c9d3. */
const PERIOD_30FPS_44K = 147147;
/** 8008.0 — @Ozone 0x70ab20, the 30fps/48k cycle period `movsd` @0x23c9fc. */
const PERIOD_30FPS_48K = 8008;
/** 2002.0 — @Ozone 0x70ab08, the 24fps/48k cycle period `movsd` @0x23c9b2. */
const PERIOD_24FPS_48K = 2002;

/**
 * `OZAudioFrameFromSample(double sample, float sampleRate, int fps, bool ntsc,
 *                         double* outRemainder)` — @Ozone 0x23c950
 *   __Z22OZAudioFrameFromSampledfibPd
 *
 * Full transcription — every instruction, in order:
 *
 *   0x23c950  pushq %rbp / movq %rsp,%rbp / pushq %rbx / subq $0x28,%rsp
 *                                          ; frame + spill area (no TS counterpart)
 *   0x23c959  movq   %rdx,%rbx             ; rbx = outRemainder
 *   0x23c95c  movapd %xmm0,%xmm4           ; xmm4 = the working value = sample
 *   0x23c960  testl  %esi,%esi             ; ntsc == 0 ?
 *   0x23c962  je     0x23ca9a              ;   -> GENERIC path
 *   0x23c968  cmpl   $0x1e,%edi            ; fps == 30 ?
 *   0x23c96b  jne    0x23c98e              ;   no -> try the 24 fps pair
 *   0x23c96d  ucomiss 0x4ce1c4(%rip),%xmm1 ; sampleRate vs 32000.0f
 *   0x23c974  jne    0x23c9c1              ;   (jne+jp = "not equal or unordered",
 *   0x23c976  jp     0x23c9c1              ;    so a NaN rate falls through too)
 *   0x23c978  leaq   gFrameToSample30fps32k(%rip),%rax
 *   0x23c97f  movsd  0x4ce189(%rip),%xmm0  ; period = 16016.0
 *   0x23c987  movl   $0xf,%ecx             ; framesPerCycle = 15
 *   0x23c98c  jmp    0x23ca09
 *   0x23c98e  cmpl   $0x18,%edi            ; fps == 24 ?
 *   0x23c991  setne  %al                   ;   al = (fps != 24)
 *   0x23c994  ucomiss 0x4ce199(%rip),%xmm1 ; sampleRate vs 48000.0f
 *   0x23c99b  setp   %cl                   ;   cl = unordered
 *   0x23c99e  setne  %dl                   ;   dl = not equal
 *   0x23c9a1  orb    %cl,%dl
 *   0x23c9a3  orb    %al,%dl               ; dl = any mismatch
 *   0x23c9a5  jne    0x23ca9a              ;   -> GENERIC path
 *   0x23c9ab  leaq   gFrameToSample24fps48k(%rip),%rax
 *   0x23c9b2  movsd  0x4ce14e(%rip),%xmm0  ; period = 2002.0
 *   0x23c9ba  movl   $0x1,%ecx             ; framesPerCycle = 1
 *   0x23c9bf  jmp    0x23ca09
 *   0x23c9c1  ucomiss 0x4ce174(%rip),%xmm1 ; sampleRate vs 44100.0f
 *   0x23c9c8  jne    0x23c9e2
 *   0x23c9ca  jp     0x23c9e2
 *   0x23c9cc  leaq   gFrameToSample30fps44k(%rip),%rax
 *   0x23c9d3  movsd  0x4ce13d(%rip),%xmm0  ; period = 147147.0
 *   0x23c9db  movl   $0x64,%ecx            ; framesPerCycle = 100
 *   0x23c9e0  jmp    0x23ca09
 *   0x23c9e2  ucomiss 0x4ce14b(%rip),%xmm1 ; sampleRate vs 48000.0f
 *   0x23c9e9  jne    0x23ca9a
 *   0x23c9ef  jp     0x23ca9a
 *   0x23c9f5  leaq   gFrameToSample30fps48k(%rip),%rax
 *   0x23c9fc  movsd  0x4ce11c(%rip),%xmm0  ; period = 8008.0
 *   0x23ca04  movl   $0x5,%ecx             ; framesPerCycle = 5
 *   -- EXACT-TABLE path --
 *   0x23ca09  leal   0x1(%rcx),%esi        ; hi = framesPerCycle + 1
 *   0x23ca0c  movapd %xmm4,%xmm1
 *   0x23ca10  divsd  %xmm0,%xmm1           ; xmm1 = sample / period
 *   0x23ca14  roundsd $0x9,%xmm1,%xmm1     ; cycles = floor(that)   (mode 9 =
 *                                          ;   round-toward--inf, exceptions off)
 *   0x23ca1a  mulsd  %xmm1,%xmm0           ; xmm0 = cycles * period
 *   0x23ca1e  subsd  %xmm0,%xmm4           ; rem  = sample - cycles*period
 *   0x23ca22  xorl   %edx,%edx             ; lo = 0
 *   0x23ca24  jmp    0x23ca39              ; enter the search (no pre-check)
 *   0x23ca30  movl   %edi,%edx             ; (hit)  lo = mid
 *   0x23ca32  leal   -0x1(%rsi),%edi
 *   0x23ca35  cmpl   %edi,%edx
 *   0x23ca37  jge    0x23ca59              ;        lo >= hi-1 -> done
 *   0x23ca39  leal   (%rdx,%rsi),%edi      ; mid = lo + hi
 *   0x23ca3c  sarl   %edi                  ;     = (lo + hi) >> 1  (arithmetic)
 *   0x23ca3e  movslq %edi,%r8
 *   0x23ca41  xorps  %xmm0,%xmm0
 *   0x23ca44  cvtsi2sdl (%rax,%r8,4),%xmm0 ; xmm0 = (double)table[mid]  (int32)
 *   0x23ca4a  ucomisd %xmm4,%xmm0          ; AT&T: table[mid] - rem
 *   0x23ca4e  jbe    0x23ca30              ; table[mid] <= rem -> raise lo
 *   0x23ca50  movl   %edi,%esi             ; (miss) hi = mid
 *   0x23ca52  leal   -0x1(%rsi),%edi
 *   0x23ca55  cmpl   %edi,%edx
 *   0x23ca57  jl     0x23ca39              ;        lo < hi-1 -> keep searching
 *   0x23ca59  xorps  %xmm0,%xmm0
 *   0x23ca5c  cvtsi2sd %ecx,%xmm0          ; xmm0 = (double)framesPerCycle
 *   0x23ca60  mulsd  %xmm0,%xmm1           ; xmm1 = cycles * framesPerCycle
 *   0x23ca64  movslq %edx,%rcx             ; idx = lo
 *   0x23ca67  movl   (%rax,%rcx,4),%esi    ; esi = table[idx]
 *   0x23ca6a  xorps  %xmm0,%xmm0
 *   0x23ca6d  cvtsi2sd %esi,%xmm0          ; xmm0 = (double)table[idx]
 *   0x23ca71  cvtsi2sd %edx,%xmm2          ; xmm2 = (double)idx
 *   0x23ca75  movl   0x4(%rax,%rcx,4),%eax ; eax = table[idx+1]
 *   0x23ca79  subl   %esi,%eax             ; eax = frame length in samples
 *   0x23ca7b  cvtsi2sd %eax,%xmm3
 *   0x23ca7f  subsd  %xmm0,%xmm4           ; rem -= table[idx]
 *   0x23ca83  movapd %xmm4,%xmm0           ; xmm0 = the REMAINDER out-value
 *   0x23ca87  divsd  %xmm3,%xmm4           ; fraction within the frame
 *   0x23ca8b  addsd  %xmm2,%xmm4           ; + idx
 *   0x23ca8f  addsd  %xmm1,%xmm4           ; + cycles*framesPerCycle
 *   0x23ca93  testq  %rbx,%rbx
 *   0x23ca96  jne    0x23caea              ; outRemainder != null -> store xmm0
 *   0x23ca98  jmp    0x23caee
 *   -- GENERIC path --
 *   0x23ca9a  testb  %sil,%sil             ; ntsc ?
 *   0x23ca9d  je     0x23caa7
 *   0x23ca9f  divsd  0x4ce081(%rip),%xmm4  ;   sample /= 1.001
 *   0x23caa7  xorps  %xmm0,%xmm0
 *   0x23caaa  cvtsi2sd %edi,%xmm0          ; xmm0 = (double)fps
 *   0x23caae  mulsd  %xmm0,%xmm4           ; value *= fps
 *   0x23cab2  cvtss2sd %xmm1,%xmm1         ; xmm1 = (double)sampleRate
 *   0x23cab6  divsd  %xmm1,%xmm4           ; value /= sampleRate  -> frames
 *   0x23caba  testq  %rbx,%rbx
 *   0x23cabd  je     0x23caee              ; no out pointer -> just return
 *   0x23cabf  leaq   -0x28(%rbp),%rdi      ; &integralPart (discarded)
 *   0x23cac3  movsd  %xmm0,-0x18(%rbp)     ; spill fps
 *   0x23cac8  movapd %xmm4,%xmm0           ; modf's argument = frames
 *   0x23cacc  movsd  %xmm4,-0x20(%rbp)     ; spill frames
 *   0x23cad1  movsd  %xmm1,-0x10(%rbp)     ; spill sampleRate
 *   0x23cad6  callq  0x6dff9c              ; xmm0 = _modf(frames, &ip)  [libc]
 *   0x23cadb  movsd  -0x20(%rbp),%xmm4     ; restore frames (the return value)
 *   0x23cae0  mulsd  -0x10(%rbp),%xmm0     ; frac * sampleRate
 *   0x23cae5  divsd  -0x18(%rbp),%xmm0     ;      / fps   -> samples into frame
 *   0x23caea  movsd  %xmm0,(%rbx)          ; *outRemainder = that
 *   0x23caee  movapd %xmm4,%xmm0           ; return the frame position
 *   0x23caf2  addq $0x28,%rsp / popq %rbx / popq %rbp   ; teardown
 *   0x23caf8  retq
 *   0x23caf9  nopl (%rax)                  ; alignment padding, not executed
 *
 * Decode notes:
 *   * the `jne`+`jp` PAIRS (@0x23c974/@0x23c976, @0x23c9c8/@0x23c9ca,
 *     @0x23c9e9/@0x23c9ef) and the `setp`+`setne` OR (@0x23c99b..@0x23c9a3)
 *     both mean "equal AND ordered": a NaN sampleRate matches no table and
 *     falls to the generic path. A strict `===` in TS has exactly that
 *     behaviour for NaN, so no explicit unordered test is needed.
 *   * `ucomisd %xmm4,%xmm0 ; jbe` @0x23ca4a is (table[mid] - rem) in AT&T
 *     order with the CF/ZF pair, i.e. the branch is taken when
 *     `table[mid] <= rem`. Reading it in Intel order inverts the search.
 *   * BOTH search branches then test the SAME exit condition `lo >= hi-1`
 *     (@0x23ca35/@0x23ca37 and @0x23ca55/@0x23ca57, one as `jge` to leave and
 *     one as `jl` to continue), so the loop settles on the largest index with
 *     `table[idx] <= rem`. Because the last table entry equals the period and
 *     `rem < period`, `idx` can never reach the last entry and the
 *     `table[idx+1]` read @0x23ca75 is always in bounds.
 *   * `roundsd $0x9` is FLOOR (round toward -inf), not truncation — the two
 *     differ for a negative `sample`, and the port uses Math.floor to match.
 *   * the search runs at least once (`jmp 0x23ca39` @0x23ca24 enters the body
 *     unconditionally), which matters for the 1-frame 24fps table where
 *     hi = 2: mid = 1, table[1] = 2002 > rem, so hi = 1, lo = 0 and the loop
 *     exits with idx = 0.
 *   * the out-value differs per path but means the same thing — samples into
 *     the current frame: `rem - table[idx]` on the table path (@0x23ca83,
 *     BEFORE the division by the frame length) and `frac(frames) * rate / fps`
 *     on the generic path (@0x23cae0/@0x23cae5).
 *   * the return value is NOT rounded to an integer frame: both paths return a
 *     fractional frame position.
 *
 * @param sample        %xmm0 — the audio sample position.
 * @param sampleRate    %xmm1 — float32 sample rate.
 * @param fps           %edi  — integer frame rate.
 * @param ntsc          %sil  — use the 1000/1001 grid.
 * @param outRemainder  %rdx  — optional out-slot for the samples-into-frame
 *                      remainder; pass `null` for the `NULL` the body tests.
 * @returns %xmm0 — the fractional frame position.
 */
export function OZAudioFrameFromSample(
  sample: number,
  sampleRate: number,
  fps: number,
  ntsc: boolean,
  outRemainder: { value: number } | null,
): number {
  // @0x23c95c  movapd %xmm0,%xmm4 — the working value.
  let value = sample;
  // The rate arrives in %xmm1 as a float32 (`f` in the mangled name) and is
  // compared with `ucomiss`, i.e. in single precision. Narrow once, as
  // OZAudioSampleTimeFromFrameTime.ts does for the same ABI slot.
  const rate32 = Math.fround(sampleRate);

  // @0x23c960..@0x23c962  testl %esi,%esi ; je — a false `ntsc` skips the
  // whole table dispatch.
  if (ntsc) {
    // Table selection: @0x23c968..@0x23ca04. `table` stays null when no
    // combination matches, which is the `jne 0x23ca9a` fall-through.
    let table: readonly number[] | null = null;
    let period = 0;
    let framesPerCycle = 0;

    if (fps === 0x1e) {
      // @0x23c96d  sampleRate vs 32000.0f
      if (rate32 === RATE_32K) {
        table = OZ_G_FRAME_TO_SAMPLE_30FPS_32K; // @0x23c978
        period = PERIOD_30FPS_32K; // @0x23c97f
        framesPerCycle = 0xf; // @0x23c987
      } else if (rate32 === RATE_44K) {
        // @0x23c9c1  sampleRate vs 44100.0f
        table = OZ_G_FRAME_TO_SAMPLE_30FPS_44K; // @0x23c9cc
        period = PERIOD_30FPS_44K; // @0x23c9d3
        framesPerCycle = 0x64; // @0x23c9db
      } else if (rate32 === RATE_48K) {
        // @0x23c9e2  sampleRate vs 48000.0f
        table = OZ_G_FRAME_TO_SAMPLE_30FPS_48K; // @0x23c9f5
        period = PERIOD_30FPS_48K; // @0x23c9fc
        framesPerCycle = 0x5; // @0x23ca04
      }
    } else if (fps === 0x18 && rate32 === RATE_48K) {
      // @0x23c98e..@0x23c9a5  the fps==24 && rate==48000 conjunction, built
      // from setne/setp/setne + two `orb`.
      table = OZ_G_FRAME_TO_SAMPLE_24FPS_48K; // @0x23c9ab
      period = PERIOD_24FPS_48K; // @0x23c9b2
      framesPerCycle = 0x1; // @0x23c9ba
    }

    if (table !== null) {
      // -- EXACT-TABLE path @0x23ca09 --
      // @0x23ca09  hi = framesPerCycle + 1.
      let hi = framesPerCycle + 1;
      // @0x23ca10..@0x23ca14  cycles = floor(value / period)  (roundsd $0x9).
      const cycles = Math.floor(value / period);
      // @0x23ca1a..@0x23ca1e  rem = value - cycles*period.
      let rem = value - period * cycles;

      // @0x23ca22  lo = 0; @0x23ca24 the search body is entered directly.
      let lo = 0;
      for (;;) {
        // @0x23ca39..@0x23ca3c  mid = (lo + hi) >> 1.
        const mid = (lo + hi) >> 1;
        // @0x23ca44..@0x23ca4e  cvtsi2sdl table[mid] ; ucomisd ; jbe.
        if (table[mid] <= rem) {
          lo = mid; // @0x23ca30
        } else {
          hi = mid; // @0x23ca50
        }
        // @0x23ca32..@0x23ca37 / @0x23ca52..@0x23ca57 — the same exit test on
        // both arms.
        if (lo >= hi - 1) {
          break;
        }
      }

      // @0x23ca5c..@0x23ca60  cycles * framesPerCycle.
      const cycleFrames = cycles * framesPerCycle;
      // @0x23ca67  table[idx] and @0x23ca75..@0x23ca79 the frame's length.
      const boundary = table[lo];
      const frameLength = table[lo + 1] - boundary;
      // @0x23ca7f  rem -= table[idx]; @0x23ca83 keep it as the out-value.
      rem = rem - boundary;
      const remainder = rem;
      // @0x23ca87..@0x23ca8f  idx + rem/frameLength + cycles*framesPerCycle.
      value = rem / frameLength + lo + cycleFrames;

      // @0x23ca93..@0x23ca96  store only when the pointer is non-null.
      if (outRemainder !== null) {
        outRemainder.value = remainder; // @0x23caea
      }
      // @0x23caee  return xmm4.
      return value;
    }
  }

  // -- GENERIC path @0x23ca9a --
  // @0x23ca9a..@0x23ca9f  testb %sil,%sil ; divsd 1.001.
  if (ntsc) {
    value = value / NTSC_DIVISOR;
  }
  // @0x23caaa  xmm0 = (double)fps.
  const fpsD = fps;
  // @0x23caae  value *= fps.
  value = value * fpsD;
  // @0x23cab2  cvtss2sd — the float32 rate widened to double.
  const rateD = rate32;
  // @0x23cab6  value /= sampleRate.
  value = value / rateD;

  // @0x23caba..@0x23cabd  testq %rbx,%rbx ; je — no out pointer, no modf call.
  if (outRemainder !== null) {
    // @0x23cad6  _modf(value, &integralPart) — libc extern @0x6dff9c, modelled
    // by its C definition: the integral part is truncated TOWARD ZERO and the
    // returned fractional part carries the sign of the argument. The integral
    // part goes to -0x28(%rbp) and is never read again.
    const integralPart = Math.trunc(value);
    // `value - Math.trunc(value)` IS modf for a FINITE value, and is wrong for a
    // non-finite one: C modf(+-inf) hands the infinity to the integral part and
    // returns +-0.0 as the fraction, while inf - inf is NaN. `value` really can be
    // non-finite here — the `divsd` @0x23cab6 divides by the float32 rate, so any
    // sampleRate of 0 (or a subnormal that frounds to 0, i.e. the degenerate or
    // uninitialised metadata case) produces an infinity, as does an overflowing
    // sample*fps. FCP then writes 0 through the out pointer and the port would write
    // NaN, which propagates into the caller's arithmetic — the silent-wrong-answer
    // class. NaN in -> NaN out already matches modf, so only the infinities branch.
    //
    // The SIGN OF ZERO is load-bearing and is the second half of this. C modf returns a
    // fraction carrying the SIGN OF THE ARGUMENT, so modf(-30.0) yields -0.0, while
    // `value - Math.trunc(value)` yields +0.0 for every negative whole value. It then
    // survives the tail: -0.0 * rate / fps is -0.0, so `*outRemainder` differs from FCP
    // in the sign bit. This is NOT an exotic input — measured against the live symbol,
    // it fires on plain sample=-48000 at rate 32000/48000 and fps 24/30/60, i.e. an
    // exact frame boundary at a negative timeline position.
    const rawFrac = value - integralPart;
    const frac = Number.isFinite(value)
      ? rawFrac === 0
        ? Math.sign(value) * 0
        : rawFrac
      : Number.isNaN(value)
        ? NaN
        : value > 0
          ? 0
          : -0;
    // @0x23cae0..@0x23cae5  frac * sampleRate / fps.
    // @0x23caea  *outRemainder = that.
    outRemainder.value = (frac * rateD) / fpsD;
  }

  // @0x23caee..@0x23caf8  return xmm4 (restored from the spill @0x23cadb, so
  // the modf detour does not change it).
  return value;
}
