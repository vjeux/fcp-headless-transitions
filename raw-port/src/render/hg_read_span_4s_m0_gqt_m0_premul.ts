// hg_read_span_4s_m0_gqt_m0_premul.ts — raw transcription of Helium's
// `hg_read_span_4s_m0_gqt_m0_premul(void*, int, void const*, hgColorGammaTransformData const*, int)`.
//
// One free function per file, named after the function (PORTING_SPEC naming
// rule; the same treatment as the landed raw-port/src/infra/invert_anon.ts).
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x18d200  hg_read_span_4s_m0_gqt_m0_premul(void*, int, void const*,
//                                               hgColorGammaTransformData const*, int)
//     __Z32hg_read_span_4s_m0_gqt_m0_premulPviPKvPK25hgColorGammaTransformDatai
//
// Source disassembly (re-derived with `raw-port/tools/disasm.sh --sym ... Helium`):
//   raw-port/re/disasm/Helium.__Z32hg_read_span_4s_m0_gqt_m0_premulPviPKvPK25hgColorGammaTransformDatai.s
//   (191 lines)
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IT DOES
// ─────────────────────────────────────────────────────────────────────────────
// Reads a span of `count` RGBA pixels stored as four UNSIGNED 16-BIT samples
// ("4s"), converts each to float, applies a gamma-quotient curve ("gqt") to the
// colour lanes, and writes float32 RGBA out — with the colour lanes PREMULTIPLIED
// by alpha and the alpha lane passed through. Per pixel, with `bias` the four
// floats at `data+0x100`:
//
//   v = (float4)samples - bias                     scaled by 1/65535
//   a = v.w                                        (broadcast to all lanes)
//   t = v / max(EPS, a)
//   curve = (E*t² + C*t + D) * (t² / (B*t² + A*t + 1))
//   out   = (curve * a) * (1,1,1,0)  +  v * (0,0,0,1)
//
// i.e. out.rgb = a * curve.rgb (the premultiply) and out.a = v.w, with the
// division by `a` inside `t` and the multiplication by `a` outside — the
// unpremultiply/curve/premultiply sandwich, done in one expression.
//
// The SAME arithmetic is written out THREE times in the binary — an unaligned
// head loop, a software-pipelined 2-pixels-per-iteration main loop, and a
// 1-pixel tail — and all three read the SAME ten constants (verified: each
// constant's VA has exactly three use sites, listed below). The split exists
// only so the main loop can use ALIGNED 16-byte loads; it does not change a
// single result. All three are transcribed below rather than collapsed, because
// PORTING_SPEC Rule 1 asks for the control flow the machine has — and because
// the head loop's exit condition is the one genuinely subtle piece of the
// function.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANT POOL — every rip-relative operand, resolved and read from the binary
// ─────────────────────────────────────────────────────────────────────────────
// Each was computed as (address of the NEXT instruction) + displacement, then the
// 16 bytes at that VA were read out of __TEXT,__const. All ten are 4-lane splats
// except the two masks.
//
//   @0x3ccf70  1.5259021893143654e-05  (0x37800080) = 1/65535   — SCALE
//              used @0x18d227 (head), @0x18d342 (main), @0x18d4c0 (tail)
//   @0x3ccf10  1.0000000116860974e-07  (0x33d6bf95) = 1e-7      — EPS
//              used @0x18d22e, @0x18d39c, @0x18d4ce
//   @0x3cce90  10.74770736694336       (0x412bf69c)             — A
//              used @0x18d235, @0x18d349, @0x18d4e4
//   @0x3c7c40  1.0                     (0x3f800000)             — ONE
//              used @0x18d23c, @0x18d350, @0x18d4ee
//   @0x3ccea0  5.684783458709717       (0x40b5e9bf)             — B
//              used @0x18d243, @0x18d358, @0x18d4f5
//   @0x3cceb0  11.123847961425781      (0x4131fb48)             — C
//              used @0x18d24a, @0x18d360, @0x18d505
//   @0x3ccec0  1.1961687803268433      (0x3f991c0f)             — D
//              used @0x18d251, @0x18d368, @0x18d50c
//   @0x3cced0  5.11247444152832        (0x40a39964)             — E
//              used @0x18d258, @0x18d370, @0x18d516
//   @0x3c9fe0  (0, 0, 0, 1)                                     — ALPHA_MASK
//              used @0x18d260, @0x18d3ea, @0x18d526
//   @0x3ca9c0  (1, 1, 1, 0)                                     — RGB_MASK
//              used @0x18d268, @0x18d3f5/@0x18d46a, @0x18d52d
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — head loop (the unaligned prologue), @0x18d200..@0x18d325
// ─────────────────────────────────────────────────────────────────────────────
//   0x18d200  testl %esi,%esi           ; count
//   0x18d202  jle   0x18d53b            ; count <= 0 -> return immediately
//                                       ; (SIGNED jle: a negative count is a
//                                       ;  no-op, not a huge loop)
//   0x18d208  pushq %rbp / movq %rsp,%rbp
//   0x18d20c  movaps 0x100(%rcx),%xmm0  ; the BIAS vector, from data+0x100
//   0x18d213  movaps %xmm0,-0x10(%rbp)  ; spilled; re-read by every subps below
//   0x18d217  testb $0xf,%dl            ; is the SOURCE pointer 16-byte aligned?
//   0x18d21a  je    0x18d32a            ; aligned -> skip the head loop
//   0x18d220  leaq  0x8(%rdx),%rcx      ; rcx = src + 8 (the alignment cursor)
//   0x18d224  xorl  %r8d,%r8d           ; r8 = byte offset into src
//   0x18d227..0x18d268                  ; hoist the ten constants into xmm0..xmm10
//   0x18d270  movq  %rdi,%rax           ; rax = dst cursor
//  L(0x18d280):
//   0x18d280  pmovzxwd (%rdx,%r8),%xmm11 ; 4 u16 -> 4 u32 (ZERO-extended)
//   0x18d287  cvtdq2ps %xmm11,%xmm11     ; -> 4 float
//   0x18d28b  subps -0x10(%rbp),%xmm11   ; v = samples - bias
//   0x18d290  mulps %xmm0,%xmm11         ; v *= SCALE
//   0x18d294  movaps %xmm11,%xmm12
//   0x18d298  shufps $0xff,%xmm11,%xmm12 ; a = broadcast(v.w)
//   0x18d29d  movaps %xmm2,%xmm13        ; xmm2 = EPS
//   0x18d2a1  maxps %xmm12,%xmm13        ; max(EPS, a)   [dst=EPS, src=a]
//   0x18d2a5  movaps %xmm11,%xmm14
//   0x18d2a9  divps %xmm13,%xmm14        ; t = v / max(EPS,a)
//   0x18d2ad  movaps %xmm14,%xmm13
//   0x18d2b1  mulps %xmm14,%xmm13        ; t2 = t*t
//   0x18d2b5  movaps %xmm14,%xmm15
//   0x18d2b9  mulps %xmm3,%xmm15         ; A*t
//   0x18d2bd  addps %xmm4,%xmm15         ; A*t + ONE
//   0x18d2c1  movaps %xmm13,%xmm1
//   0x18d2c5  mulps %xmm5,%xmm1          ; B*t2
//   0x18d2c8  addps %xmm15,%xmm1         ; den = B*t2 + A*t + ONE
//   0x18d2cc  movaps %xmm13,%xmm15
//   0x18d2d0  divps %xmm1,%xmm15         ; q = t2 / den
//   0x18d2d4  mulps %xmm6,%xmm14         ; C*t
//   0x18d2d8  addps %xmm7,%xmm14         ; C*t + D
//   0x18d2dc  mulps %xmm8,%xmm13         ; E*t2
//   0x18d2e0  addps %xmm14,%xmm13        ; num = E*t2 + C*t + D
//   0x18d2e4  mulps %xmm15,%xmm13        ; num * q
//   0x18d2e8  mulps %xmm12,%xmm13        ; * a          (the PREMULTIPLY)
//   0x18d2ec  mulps %xmm9,%xmm11         ; v * (0,0,0,1)
//   0x18d2f0  mulps %xmm10,%xmm13        ; curve * (1,1,1,0)
//   0x18d2f4  addps %xmm11,%xmm13        ; combine rgb + a
//   0x18d2f8  movaps %xmm13,(%rdi,%r8,2) ; store 4 floats; dst byte = 2 * src byte
//   0x18d2fd  addq  $0x10,%rax
//   0x18d301  leaq  0x8(%r8),%r9         ; r9 = next src byte offset
//   0x18d305  cmpl  $0x1,%esi
//   0x18d308  leal  -0x1(%rsi),%esi      ; count--  [leal does NOT set flags]
//   0x18d30b  je    0x18d31d             ; the cmp ABOVE decided: last pixel -> out
//   0x18d30d  addl  %ecx,%r8d
//   0x18d310  andl  $0xf,%r8d            ; ((src+8) + off) & 15 == 0 ?
//   0x18d314  movq  %r9,%r8              ; r8 = r9   [movq does NOT set flags]
//   0x18d317  jne   0x18d280             ; keep going while NOT yet 16-aligned
//   0x18d31d  addq  %r9,%rdx             ; src += consumed bytes
//   0x18d320  cmpl  $0x2,%esi
//   0x18d323  jae   0x18d336             ; >= 2 left -> main loop
//   0x18d325  jmp   0x18d4ac             ; else -> tail
//
// TWO flag subtleties in that loop tail, both of the kind PORTING_SPEC warns
// about: `leal -0x1(%rsi),%esi` @0x18d308 and `movq %r9,%r8` @0x18d314 do NOT
// touch flags, so `je` @0x18d30b reads the `cmpl $0x1,%esi` from BEFORE the
// decrement (i.e. "was this the last pixel?"), and `jne` @0x18d317 reads the
// `andl` @0x18d310 (i.e. "is the next source address still unaligned?").
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — main loop (2 pixels/iteration, software-pipelined),
//               @0x18d32a..@0x18d4a7
// ─────────────────────────────────────────────────────────────────────────────
//   0x18d32a  movq  %rdi,%rax            ; (aligned entry) dst cursor
//   0x18d32d  cmpl  $0x2,%esi ; jb 0x18d4ac   ; fewer than 2 -> tail
//   0x18d336  movdqa (%rdx),%xmm13       ; ALIGNED load of 8 u16 = 2 pixels
//   0x18d33b  xorps %xmm0,%xmm0 ; movaps %xmm0,-0x20(%rbp)  ; pipeline slot = 0
//   0x18d342..0x18d370                   ; hoist SCALE/B/ONE/C/D/E (EPS is
//                                        ; re-loaded INSIDE the body @0x18d39c
//                                        ; because @0x18d424 destroys it)
//   0x18d378  jmp   0x18d48f             ; enter at the loop CONTROL, so the
//                                        ; first iteration also preloads
//  L(0x18d380): first pixel — pmovzxwd %xmm13 (low 4 u16), then the identical
//   0x18d386..0x18d403 arithmetic as the head loop, stored to (%rax)
//  second pixel — punpckhwd %xmm1(=0),%xmm13 @0x18d409 takes the HIGH 4 u16,
//   0x18d40e..0x18d475 the same arithmetic again, stored to 0x10(%rax)
//   0x18d479  addq $0x10,%rdx ; addq $0x20,%rax ; addl $-0x2,%esi
//   0x18d484  movdqa -0x20(%rbp),%xmm13  ; the PRELOADED next 16 bytes
//   0x18d48a  cmpl $0x1,%esi ; jbe 0x18d4ac   ; <=1 left -> tail
//  L(0x18d48f):
//   0x18d48f  cmpl $0x2,%esi ; je 0x18d380    ; exactly 2 left -> no preload
//   0x18d498  movaps 0x10(%rdx),%xmm0 ; movaps %xmm0,-0x20(%rbp)  ; preload next
//   0x18d4a0  prefetcht0 0x80(%rdx)    ; a pure cache hint — no semantics
//   0x18d4a7  jmp 0x18d380
//
// The pipelining is invisible in the results: `-0x20(%rbp)` only ever holds a
// copy of the 16 bytes the next iteration would load anyway. It is transcribed
// as a plain read of the same elements, and the `prefetcht0` has no counterpart
// because it has no architectural effect.
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — tail (one pixel), @0x18d4ac..@0x18d53b
// ─────────────────────────────────────────────────────────────────────────────
//   0x18d4ac  testl %esi,%esi ; je 0x18d53a   ; nothing left -> return
//   0x18d4b4  pmovzxwd (%rdx),%xmm1 ; cvtdq2ps ; subps -0x10(%rbp) ; mulps SCALE
//   0x18d4c7..0x18d534                        ; the same expression, this time
//                                             ; with the constants as memory
//                                             ; operands instead of hoisted regs
//   0x18d537  movaps %xmm2,(%rax)             ; store the last pixel
//   0x18d53a  popq %rbp ; retq
//
// ─────────────────────────────────────────────────────────────────────────────
// NUMERICS
// ─────────────────────────────────────────────────────────────────────────────
// Every operation is a 4-wide SINGLE-precision SSE op (`subps`/`mulps`/`divps`/
// `maxps`/`addps`), so every intermediate is rounded to float32 — hence
// `Math.fround` on each step (PORTING_SPEC Rule 4). Doing the arithmetic in
// double and rounding once at the end is a DIFFERENT function; the oracle below
// measures that (2,929 of 4,000 lanes differ). Two further details:
//   * `maxps %xmm12,%xmm13` has EPS as the destination and `a` as the source,
//     so it is max(EPS, a) — with SSE's NaN rule (maxps returns the SOURCE
//     operand when either is NaN), which for this operand order means a NaN `a`
//     propagates. Inputs are zero-extended u16s minus a bias, so `a` is NaN only
//     if the bias is; the port uses the same operand order regardless.
//   * `pmovzxwd` ZERO-extends: samples are UNSIGNED 16-bit, so 0xFFFF is 65535,
//     never -1.
//
// CALLEES: none — no callq anywhere, no extern, no indirect call. A pure leaf
// kernel (`depgraph.py deps` lists nothing).
//
// ─────────────────────────────────────────────────────────────────────────────
// ORACLE
// ─────────────────────────────────────────────────────────────────────────────
// raw-port/re/oracle/hg_read_span_4s_m0_gqt_m0_premul_oracle.py calls the LIVE
// function (a LOCAL `nm` type `t` symbol, so it is reached at dyld slide +
// 0x18d200 through ozone_loader.py) and pipes the identical inputs through THIS
// TypeScript with tsx, comparing the float32 outputs as RAW u32 BIT PATTERNS.
// See the file's committed results: every pixel of every span matched, across
// spans that exercise all three loops (counts 0..9 plus larger, and source
// buffers deliberately offset so the head loop runs for 0..7 pixels first).

/** SCALE — 1/65535 @Helium 0x3ccf70 (0x37800080), splat x4. */
const SCALE = Math.fround(1.5259021893143654e-5); // @Helium 0x3ccf70
/** EPS — 1e-7 @Helium 0x3ccf10 (0x33d6bf95), splat x4; the max() floor on alpha. */
const EPS = Math.fround(1.0000000116860974e-7); // @Helium 0x3ccf10
/** A — 10.74770736694336 @Helium 0x3cce90 (0x412bf69c); the t coefficient of the denominator. */
const A = Math.fround(10.74770736694336); // @Helium 0x3cce90
/** ONE — 1.0 @Helium 0x3c7c40 (0x3f800000); the denominator's constant term. */
const ONE = Math.fround(1.0); // @Helium 0x3c7c40
/** B — 5.684783458709717 @Helium 0x3ccea0 (0x40b5e9bf); the t² coefficient of the denominator. */
const B = Math.fround(5.684783458709717); // @Helium 0x3ccea0
/** C — 11.123847961425781 @Helium 0x3cceb0 (0x4131fb48); the t coefficient of the numerator. */
const C = Math.fround(11.123847961425781); // @Helium 0x3cceb0
/** D — 1.1961687803268433 @Helium 0x3ccec0 (0x3f991c0f); the numerator's constant term. */
const D = Math.fround(1.1961687803268433); // @Helium 0x3ccec0
/** E — 5.11247444152832 @Helium 0x3cced0 (0x40a39964); the t² coefficient of the numerator. */
const E = Math.fround(5.11247444152832); // @Helium 0x3cced0
/** ALPHA_MASK — (0,0,0,1) @Helium 0x3c9fe0; selects v's alpha lane. */
const ALPHA_MASK: readonly number[] = [0, 0, 0, 1]; // @Helium 0x3c9fe0
/** RGB_MASK — (1,1,1,0) @Helium 0x3ca9c0; clears the curve's alpha lane. */
const RGB_MASK: readonly number[] = [1, 1, 1, 0]; // @Helium 0x3ca9c0

/**
 * `hgColorGammaTransformData` — only the one field this kernel reads is
 * modelled (PORTING_SPEC Rule 5: no invented fields).
 */
export interface hgColorGammaTransformData {
  /**
   * +0x100 — the four-lane BIAS subtracted from the raw samples, loaded once
   * with `movaps 0x100(%rcx), %xmm0` @0x18d20c and spilled to `-0x10(%rbp)`
   * @0x18d213, from where all three loops re-read it. The `movaps` is a
   * 16-byte ALIGNED load, which is what fixes both the size (4 x float32) and
   * the alignment of the field.
   */
  bias_at_0x100: Float32Array;
}

/**
 * `hg_read_span_4s_m0_gqt_m0_premul(void* dst, int count, void const* src,
 *  hgColorGammaTransformData const* data, int)` — @Helium 0x18d200.
 *
 * Converts `count` RGBA pixels of four UNSIGNED 16-bit samples into float32
 * RGBA, applying the gamma-quotient curve to the colour lanes and premultiplying
 * them by alpha; the alpha lane is passed through unchanged (scaled and
 * de-biased). See the file header for the full instruction-by-instruction
 * decode of all three loops and for every constant's address.
 *
 * @param dst   destination, 4 float32 per pixel (SysV %rdi).
 * @param count number of pixels (SysV %esi). Zero or NEGATIVE returns
 *              immediately — `jle` @0x18d202 is the SIGNED test.
 * @param src   source, 4 uint16 per pixel (SysV %rdx).
 * @param data  the transform data whose +0x100 vector is the bias (SysV %rcx).
 * @param _unused the fifth argument (SysV %r8d) — never read by this body; it
 *              is kept because it is part of the ABI signature this unit ports.
 */
export function hg_read_span_4s_m0_gqt_m0_premul( // @Helium 0x18d200
  dst: Float32Array,
  count: number,
  src: Uint16Array,
  data: hgColorGammaTransformData,
  _unused: number,
): void {
  // @0x18d200/@0x18d202 — testl %esi,%esi ; jle : SIGNED, so count <= 0 returns
  //   without touching dst. `| 0` models the 32-bit int argument.
  if ((count | 0) <= 0) return;

  // @0x18d20c/@0x18d213 — movaps 0x100(%rcx),%xmm0 ; movaps %xmm0,-0x10(%rbp)
  const bias = data.bias_at_0x100;
  const b0 = bias[0];
  const b1 = bias[1];
  const b2 = bias[2];
  const b3 = bias[3];

  let remaining = count | 0;
  let srcPix = 0; // pixel cursor into src (the machine's %rdx + %r8, in bytes)
  let dstPix = 0; // pixel cursor into dst (the machine's %rax / (%rdi,%r8,2))

  /**
   * One pixel of the kernel — the arithmetic block the binary writes out three
   * times, byte-identically, at @0x18d280 (head), @0x18d386 and @0x18d40e
   * (main), and @0x18d4b9 (tail). It is expressed once here because the three
   * copies are the SAME instruction sequence on the same constants, not three
   * behaviours; the loop STRUCTURE that surrounds them is preserved below.
   * Every step is `Math.fround`-rounded because every machine op is a 4-wide
   * SINGLE-precision SSE op.
   */
  const pixel = (sp: number, dp: number): void => {
    // @0x18d280 pmovzxwd — 4 u16, ZERO-extended; @0x18d287 cvtdq2ps -> float.
    // @0x18d28b subps -0x10(%rbp) — minus the bias.
    // @0x18d290 mulps SCALE.
    const v0 = Math.fround(Math.fround(src[sp + 0] - b0) * SCALE);
    const v1 = Math.fround(Math.fround(src[sp + 1] - b1) * SCALE);
    const v2 = Math.fround(Math.fround(src[sp + 2] - b2) * SCALE);
    const v3 = Math.fround(Math.fround(src[sp + 3] - b3) * SCALE);

    // @0x18d298 shufps $0xff — broadcast lane 3 (alpha) to all four lanes.
    const a = v3;
    // @0x18d2a1 maxps %xmm12,%xmm13 — dst=EPS, src=a, so max(EPS, a).
    const den0 = Math.max(EPS, a);

    // The four lanes are independent from here; lane 3 is computed too (the
    // machine computes it and then discards it via RGB_MASK), so the port does
    // the same rather than special-casing it.
    for (let lane = 0; lane < 4; lane++) {
      const v = lane === 0 ? v0 : lane === 1 ? v1 : lane === 2 ? v2 : v3;

      // @0x18d2a9 divps — t = v / max(EPS,a)
      const t = Math.fround(v / den0);
      // @0x18d2b1 mulps — t2 = t*t
      const t2 = Math.fround(t * t);
      // @0x18d2b9/@0x18d2bd — A*t + ONE
      const at1 = Math.fround(Math.fround(A * t) + ONE);
      // @0x18d2c5/@0x18d2c8 — den = B*t2 + (A*t + ONE)
      const den = Math.fround(Math.fround(B * t2) + at1);
      // @0x18d2d0 — q = t2 / den
      const q = Math.fround(t2 / den);
      // @0x18d2d4/@0x18d2d8 — C*t + D
      const ctd = Math.fround(Math.fround(C * t) + D);
      // @0x18d2dc/@0x18d2e0 — num = E*t2 + (C*t + D)
      const num = Math.fround(Math.fround(E * t2) + ctd);
      // @0x18d2e4 — num * q ; @0x18d2e8 — * a (the premultiply)
      const curve = Math.fround(Math.fround(num * q) * a);

      // @0x18d2ec mulps ALPHA_MASK ; @0x18d2f0 mulps RGB_MASK ; @0x18d2f4 addps
      const keptAlpha = Math.fround(v * ALPHA_MASK[lane]);
      const keptRgb = Math.fround(curve * RGB_MASK[lane]);
      // @0x18d2f8 movaps %xmm13,(%rdi,%r8,2) — the store.
      dst[dp + lane] = Math.fround(keptRgb + keptAlpha);
    }
  };

  // ── HEAD LOOP @0x18d217..@0x18d31d ────────────────────────────────────────
  // @0x18d217 testb $0xf,%dl — is the SOURCE 16-byte aligned? A Uint16Array
  //   carries the same information in `byteOffset`, so the same test applies to
  //   the same bytes; when the view happens to be aligned this loop is skipped
  //   exactly as the machine skips it.
  let srcByte = src.byteOffset + srcPix * 2;
  if ((srcByte & 0xf) !== 0) {
    // @0x18d220 leaq 0x8(%rdx),%rcx — the alignment cursor is src + 8.
    for (;;) {
      pixel(srcPix, dstPix); // @0x18d280..@0x18d2f8
      srcPix += 4; // @0x18d301 leaq 0x8(%r8),%r9 : +8 BYTES = 4 samples
      dstPix += 4; // @0x18d2fd addq $0x10,%rax   : +16 bytes = 4 floats
      // @0x18d305/@0x18d308/@0x18d30b — the cmp is against the count BEFORE the
      //   decrement (leal sets no flags), i.e. "was that the last pixel?".
      const wasLast = remaining === 1;
      remaining -= 1;
      if (wasLast) break;
      // @0x18d30d/@0x18d310/@0x18d317 — loop while the NEXT source address is
      //   still not 16-byte aligned (movq sets no flags, so the jne reads the andl).
      srcByte = src.byteOffset + srcPix * 2;
      if ((srcByte & 0xf) === 0) break;
    }
  }

  // ── MAIN LOOP @0x18d32d..@0x18d4a7 (2 pixels per iteration) ───────────────
  // @0x18d320/@0x18d323 (from the head) and @0x18d32d/@0x18d330 (aligned entry):
  //   both fall through to the tail when fewer than 2 pixels remain.
  while (remaining >= 2) {
    // @0x18d380..@0x18d403 — first pixel, from the LOW 4 u16 of the 16-byte load.
    pixel(srcPix, dstPix);
    // @0x18d409..@0x18d475 — second pixel, from the HIGH 4 u16 (punpckhwd).
    pixel(srcPix + 4, dstPix + 4);
    // @0x18d479/@0x18d47d/@0x18d481 — advance 16 source bytes, 32 dest bytes,
    //   count -= 2. (@0x18d484's reload of the pipelined `-0x20(%rbp)` slot and
    //   the @0x18d4a0 prefetcht0 have no architectural effect: the slot only ever
    //   holds a copy of the very elements the next iteration reads, and a
    //   prefetch is a cache hint.)
    srcPix += 8;
    dstPix += 8;
    remaining -= 2;
  }

  // ── TAIL @0x18d4ac..@0x18d537 (at most one pixel) ─────────────────────────
  // @0x18d4ac/@0x18d4ae — testl %esi,%esi ; je : nothing left, return.
  if (remaining !== 0) {
    // @0x18d4b4..@0x18d537 — the same expression once more, with the constants
    //   as memory operands rather than hoisted registers, then one store.
    pixel(srcPix, dstPix);
  }
  // @0x18d53a/@0x18d53b — popq %rbp ; retq.
}
