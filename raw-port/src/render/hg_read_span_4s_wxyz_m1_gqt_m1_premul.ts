// hg_read_span_4s_wxyz_m1_gqt_m1_premul.ts — raw transcription of Helium's
// `hg_read_span_4s_wxyz_m1_gqt_m1_premul(void*, int, void const*,
//                                        hgColorGammaTransformData const*, int)`.
//
// One free function per file, named after the function (PORTING_SPEC naming
// rule; the same treatment as the landed siblings
// raw-port/src/render/hg_read_span_4s_m0_gqt_m0_premul.ts and
// raw-port/src/render/hg_read_span_4f_wxyz_m1_gqt_m0.ts).
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x18adf0  hg_read_span_4s_wxyz_m1_gqt_m1_premul(void*, int, void const*,
//                                                    hgColorGammaTransformData const*, int)
//     __Z37hg_read_span_4s_wxyz_m1_gqt_m1_premulPviPKvPK25hgColorGammaTransformDatai
//
//   A LOCAL (`nm` type `t`) symbol — `dlsym` cannot reach it. It is oracled by
//   ADDRESS at `_dyld_get_image_vmaddr_slide(Helium) + 0x18adf0`, with the
//   prologue bytes there checked against the disassembly first.
//
// Source disassembly (re-derived with `raw-port/tools/disasm.sh --sym ... Helium`):
//   raw-port/re/disasm/Helium.__Z37hg_read_span_4s_wxyz_m1_gqt_m1_premulPviPKvPK25hgColorGammaTransformDatai.s
//   (292 lines)
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IT DOES
// ─────────────────────────────────────────────────────────────────────────────
// Reads a span of `count` pixels stored as four UNSIGNED 16-BIT samples in WXYZ
// order (alpha first), and writes float32 XYZW with the colour lanes
// unpremultiplied, matrixed, curved, re-premultiplied and matrixed again. Per
// pixel, with A the matrix at data+0x00/+0x10/+0x20 and B the matrix at
// data+0x40/+0x50/+0x60:
//
//   w      = (float4)samples[1,2,3,0] - bias        bias = data+0x100
//   dotA   = (A0·w, A1·w, A2·w, A2·w)               haddps, so summed PAIRWISE
//   alpha  = w.w * (1/65535)                        broadcast to all four lanes
//   t      = dotA / max(EPS, alpha)                 the UNPREMULTIPLY
//   t'     = min(|t|, 1.32)
//   curve  = (E*t'² + C*t' + D) * (t'² / (B*t'² + A*t' + 1))
//   pm     = (sign(t) | curve) * alpha              the RE-PREMULTIPLY
//   dotB   = (B0·pm, B1·pm, B2·pm, B2·pm)
//   out    = dotB * (1,1,1,0) + (0,0,0,alpha)
//
// So the two `m1`s in the name are two different matrices, one on each side of
// the curve, and `gqt` is the same gamma-quotient curve the rest of the
// read_span family uses. The alpha lane of the OUTPUT is the normalised alpha
// (`w.w / 65535`), not a curved value: it arrives through the `(0,0,0,1/65535)`
// vector @0x85c4f0 and is added back after the (1,1,1,0) mask clears lane 3.
//
// The arithmetic block above is written out THREE times in the binary — an
// unaligned head loop @0x18ae90, a 2-pixels-per-iteration main loop @0x18afd0
// and a 1-pixel tail @0x18b208 — on the SAME constants, differing only in
// whether those constants sit in hoisted registers or in memory operands. The
// split exists so the main loop can use an ALIGNED 16-byte source load
// (`movdqa`); it changes no result. The loop STRUCTURE is transcribed below;
// the arithmetic is written once, as in the landed 4s sibling.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANT POOL — every rip-relative operand, resolved as (address of the NEXT
// instruction) + displacement and read from the MAPPED IMAGE with
// `ctypes.string_at(slide + va, 16)` under `arch -x86_64` (never from an otool
// operand: `-tV` symbolises displacements, OPS_LOG).
// ─────────────────────────────────────────────────────────────────────────────
//   @0x85c4f0  (0, 0, 0, 1.5259021893143654e-05)  — ALPHA_SCALE (0,0,0,1/65535)
//              hoisted @0x18ae46 (head) / @0x18afba (main); memory @0x18b231 (tail)
//   @0x3ccf10  1.0000000116860974e-07 (0x33d6bf95) — EPS, the maxps floor
//              @0x18ae4d, @0x18b01f, @0x18b129, @0x18b247
//   @0x3c7c30  7fffffff x4                         — ABS_MASK
//              @0x18ae54, @0x18b02f, @0x18b13a, @0x18b254
//   @0x3cce80  1.32 (0x3fa8f5c3)                   — CLAMP, the minps ceiling
//              @0x18ae5b, @0x18b039, @0x18b141, @0x18b25e
//   @0x3cce90  10.74770736694336 (0x412bf69c)      — A  @0x18ae62, @0x18b04f,
//                                                        @0x18b154, @0x18b26b
//   @0x3c7c40  1.0 (0x3f800000)                    — ONE @0x18ae69, @0x18b05a,
//                                                        @0x18b15c, @0x18b275
//   @0x3ccea0  5.684783458709717 (0x40b5e9bf)      — B  @0x18ae71, @0x18b069,
//                                                        @0x18b168, @0x18b27c
//   @0x3cceb0  11.123847961425781 (0x4131fb48)     — C  @0x18af17, @0x18b080,
//                                                        @0x18b17c, @0x18b28c
//   @0x3ccec0  1.1961687803268433 (0x3f991c0f)     — D  @0x18af1f, @0x18b08a,
//                                                        @0x18b183, @0x18b293
//   @0x3cced0  5.11247444152832 (0x40a39964)       — E  @0x18af27, @0x18b094,
//                                                        @0x18b18a, @0x18b29a
//   @0x3ca0d0  80000000 x4                         — SIGN_MASK @0x18ae79,
//                                              @0x18b0a7, @0x18b19a, @0x18b2a7
//   @0x3ca9c0  (1,1,1,0)                           — RGB_MASK @0x18ae81,
//                                              @0x18b100, @0x18b2d8
//
// Eight of these (EPS, ABS_MASK, CLAMP, A, ONE, B, C, D, E, SIGN_MASK, RGB_MASK)
// are the same addresses the two landed siblings cite; they read back identical
// today. `ALPHA_SCALE` @0x85c4f0 is new here — note it is the SAME 1/65535 as
// the 4s sibling's SCALE @0x3ccf70, but placed in lane 3 only, because this
// kernel scales the alpha alone while its matrices carry the colour scaling.
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — prologue @0x18adf0..@0x18ae39
// ─────────────────────────────────────────────────────────────────────────────
//   0x18adf0  testl %esi,%esi ; jle 0x18b2e6   ; count <= 0 (SIGNED) -> return
//   0x18adf8  pushq %rbp ; movq %rsp,%rbp
//   0x18adfc  movaps (%rcx),%xmm0     ; movaps %xmm0,-0x10(%rbp)   A row 0
//   0x18ae03  movaps 0x10(%rcx),%xmm0 ; movaps %xmm0,-0x30(%rbp)   A row 1
//   0x18ae0b  movaps 0x20(%rcx),%xmm0 ; movaps %xmm0,-0x20(%rbp)   A row 2
//   0x18ae13  movaps 0x40(%rcx),%xmm0 ; movaps %xmm0,-0x50(%rbp)   B row 0
//   0x18ae1b  movaps 0x50(%rcx),%xmm0 ; movaps %xmm0,-0x70(%rbp)   B row 1
//   0x18ae23  movaps 0x60(%rcx),%xmm0 ; movaps %xmm0,-0x60(%rbp)   B row 2
//   0x18ae2b  movaps 0x100(%rcx),%xmm0; movaps %xmm0,-0x40(%rbp)   bias
//   0x18ae36  testb $0xf,%dl ; je 0x18af9e   ; SOURCE 16-byte aligned? -> skip head
//
// HEAD LOOP @0x18ae3f..@0x18af99 (one pixel per iteration, until the source is
// 16-byte aligned or the span runs out)
//   0x18ae3f  leaq 0x8(%rdx),%rcx     ; the alignment cursor is src + 8
//   0x18ae43  xorl %r8d,%r8d          ; byte offset into the source
//   0x18ae46..0x18ae81                ; hoist ALPHA_SCALE, EPS, ABS_MASK, CLAMP,
//                                     ; A, ONE, B, SIGN_MASK, RGB_MASK
//   0x18ae89  movq %rdi,%rax          ; the destination cursor
//  L(0x18ae90):
//   0x18ae90  pmovzxwd (%rdx,%r8),%xmm0 ; 4 u16, ZERO-extended
//   0x18ae97  cvtdq2ps %xmm0,%xmm0
//   0x18ae9a  shufps $0x39,%xmm0,%xmm0  ; xmm0 = xmm0[1,2,3,0] (wxyz -> xyzw)
//   0x18ae9e  subps -0x40(%rbp),%xmm0   ; w = rotated - bias
//   0x18aea2  movaps -0x10(%rbp),%xmm11 ; mulps %xmm0,%xmm11        A0 * w
//   0x18aeab  movaps -0x30(%rbp),%xmm12 ; mulps %xmm0,%xmm12        A1 * w
//   0x18aeb4  haddps %xmm12,%xmm11
//   0x18aeb9  movaps -0x20(%rbp),%xmm12 ; mulps %xmm0,%xmm12        A2 * w
//   0x18aec2  mulps %xmm2,%xmm0         ; w * (0,0,0,1/65535)  <- destroys w
//   0x18aec5  haddps %xmm12,%xmm12
//   0x18aeca  haddps %xmm12,%xmm11      ; dotA = (A0·w, A1·w, A2·w, A2·w)
//   0x18aecf  movaps %xmm0,%xmm12 ; shufps $0xff,%xmm0,%xmm12  ; alpha, splat
//   0x18aed8  movaps %xmm3,%xmm13 ; maxps %xmm12,%xmm13        ; max(EPS, alpha)
//   0x18aee0  divps %xmm13,%xmm11       ; t = dotA / max(EPS, alpha)
//   0x18aee4  movaps %xmm11,%xmm13 ; andps %xmm4,%xmm13        ; |t|
//   0x18aeec  minps %xmm5,%xmm13        ; t' = min(|t|, 1.32)
//   0x18aef0  movaps %xmm13,%xmm1 ; mulps %xmm13,%xmm1         ; t'²
//   0x18aef8  movaps %xmm13,%xmm15 ; mulps %xmm6,%xmm15 ; addps %xmm10,%xmm15
//                                                              ; A*t' + 1
//   0x18af04  movaps %xmm1,%xmm7 ; mulps %xmm14,%xmm7 ; addps %xmm15,%xmm7
//                                                              ; den = B*t'² + …
//   0x18af0f  movaps %xmm1,%xmm15 ; divps %xmm7,%xmm15         ; q = t'² / den
//   0x18af17  mulps C,%xmm13 ; addps D,%xmm13                  ; C*t' + D
//   0x18af27  mulps E,%xmm1  ; addps %xmm13,%xmm1              ; num
//   0x18af32  mulps %xmm15,%xmm1                               ; curve = num * q
//   0x18af36  andps %xmm9,%xmm11 ; orps %xmm1,%xmm11           ; sign(t) | curve
//   0x18af3e  mulps %xmm12,%xmm11                              ; * alpha (premul)
//   0x18af42  movaps -0x50(%rbp),%xmm1 ; mulps %xmm11,%xmm1    ; B0 * pm
//   0x18af4a  movaps -0x70(%rbp),%xmm7 ; mulps %xmm11,%xmm7    ; B1 * pm
//   0x18af52  haddps %xmm7,%xmm1
//   0x18af56  mulps -0x60(%rbp),%xmm11 ; haddps %xmm11,%xmm11  ; B2 * pm
//   0x18af60  haddps %xmm11,%xmm1       ; dotB
//   0x18af65  mulps %xmm8,%xmm1         ; * (1,1,1,0)
//   0x18af69  addps %xmm0,%xmm1         ; + (0,0,0,alpha)
//   0x18af6c  movaps %xmm1,(%rdi,%r8,2) ; 2 source bytes per 4 destination bytes
//   0x18af71  addq $0x10,%rax
//   0x18af75  leaq 0x8(%r8),%r9         ; the NEXT source offset (+8 bytes)
//   0x18af79  cmpl $0x1,%esi ; leal -0x1(%rsi),%esi ; je 0x18af91
//                                       ; the cmp is against the count BEFORE
//                                       ; the decrement (leal sets no flags)
//   0x18af81  addl %ecx,%r8d ; andl $0xf,%r8d ; movq %r9,%r8 ; jne 0x18ae90
//                                       ; loop while the NEXT source address
//                                       ; (src + 8 + offset) is still unaligned
//   0x18af91  addq %r9,%rdx ; cmpl $0x2,%esi ; jae 0x18afaa ; jmp 0x18b200
//   0x18af9e  movq %rdi,%rax ; cmpl $0x2,%esi ; jb 0x18b200   ; the aligned entry
//
// MAIN LOOP @0x18afaa..@0x18b1fb (2 pixels per iteration, software-pipelined)
//   0x18afaa  movdqa (%rdx),%xmm9       ; 16 bytes = 8 u16 = 2 pixels
//   0x18afaf  xorps %xmm0,%xmm0 ; movaps %xmm0,-0x80(%rbp)  ; pipeline slot = 0
//   0x18afb6  movaps -0x40(%rbp),%xmm5  ; bias, ALPHA_SCALE, B row 2 hoisted
//   0x18afc7  jmp 0x18b1e3              ; enter at the loop CONTROL
//  L(0x18afd0): first pixel — pmovzxwd %xmm9 (low 4 u16), then @0x18afd6..
//   0x18b0d8 the identical arithmetic, result left in %xmm0
//  second pixel — punpckhwd %xmm1(=0),%xmm9 @0x18b0df takes the HIGH 4 u16,
//   @0x18b0e4..0x18b1c5 the same arithmetic again
//   0x18b1bb  movaps %xmm0,(%rax)       ; store pixel 1
//   0x18b1c9  movaps %xmm6,0x10(%rax)   ; store pixel 2
//   0x18b1cd  addq $0x10,%rdx ; addq $0x20,%rax ; addl $-0x2,%esi
//   0x18b1d8  movdqa -0x80(%rbp),%xmm9  ; the PRELOADED next 16 bytes
//   0x18b1de  cmpl $0x1,%esi ; jbe 0x18b200        ; <=1 left -> tail
//  L(0x18b1e3):
//   0x18b1e3  cmpl $0x2,%esi ; je 0x18afd0         ; exactly 2 left -> no preload
//   0x18b1ec  movaps 0x10(%rdx),%xmm0 ; movaps %xmm0,-0x80(%rbp)  ; preload
//   0x18b1f4  prefetcht0 0x80(%rdx)                ; cache hint, no semantics
//   0x18b1fb  jmp 0x18afd0
//
// TAIL @0x18b200..@0x18b2e6 (at most one pixel)
//   0x18b200  testl %esi,%esi ; je 0x18b2e5        ; nothing left -> return
//   0x18b208..0x18b2df                             ; the same expression once
//                                                  ; more, constants in memory
//   0x18b2e2  movaps %xmm2,(%rax)                  ; store the last pixel
//   0x18b2e5  popq %rbp ; retq
//
// The pipelining is invisible in the results: `-0x80(%rbp)` only ever holds a
// copy of the 16 bytes the next iteration would load anyway, and `prefetcht0`
// has no architectural effect, so neither has a counterpart below.
//
// ─────────────────────────────────────────────────────────────────────────────
// NUMERICS
// ─────────────────────────────────────────────────────────────────────────────
// Every operation is a 4-wide SINGLE-precision SSE op, so every intermediate is
// rounded to float32 — hence `Math.fround` on each step (PORTING_SPEC Rule 4).
// Four details are not ordinary JS arithmetic and are transcribed as the
// instructions they are:
//   * `pmovzxwd` ZERO-extends: samples are UNSIGNED 16-bit, so 0xffff is 65535,
//     never -1.
//   * `haddps` sums PAIRWISE: (a+b)+(c+d) with three roundings, which is a
//     different float32 from ((a+b)+c)+d. Both matrices keep the pairing.
//   * `maxps %xmm12,%xmm13` has EPS as the DESTINATION and alpha as the source,
//     so it is Intel `MAXPS xmm13(EPS), xmm12(alpha)` = `(EPS > alpha) ? EPS :
//     alpha` — it returns the SOURCE operand when either is NaN, i.e. a NaN
//     alpha propagates. `minps %xmm5,%xmm13` is the mirror image: `(|t| < CLAMP)
//     ? |t| : CLAMP`, so a NaN `|t|` yields CLAMP. `Math.max`/`Math.min` would
//     return NaN in both cases; the conditionals the ISA specifies are written
//     out instead.
//   * `andps`/`orps` are BITWISE. The sign splice `(t & 0x80000000) | curve`
//     corresponds to no JS operator — `curve * Math.sign(t)` differs on a zero
//     or NaN `t` — so it is done on u32 bit patterns through a 4-byte scratch
//     view, as is the `andps` that takes |t|.
//
// The same NaN-sign limitation the landed hg_read_span_4f_wxyz_m1_gqt_m0 file
// documents applies here and for the same reason: x86's default QNaN from an
// invalid operation is 0xffc00000 (sign SET), the `orps` @0x18af3a copies that
// sign onto the curve, and a JS `number` cannot carry a NaN's sign at all (V8
// canonicalises to 0x7fc00000). It is measured rather than hidden — see ORACLE.
//
// CALLEES: none — no `callq` anywhere, no extern, no indirect call. A pure leaf
// kernel (`depgraph.py deps` on the mangled name lists nothing).
//
// ─────────────────────────────────────────────────────────────────────────────
// ORACLE
// ─────────────────────────────────────────────────────────────────────────────
// raw-port/re/oracle/hg_read_span_4s_wxyz_m1_gqt_m1_premul_oracle.py calls the
// LIVE kernel at dyld slide + 0x18adf0 under `arch -x86_64 /usr/bin/python3`
// (the slice every address here is transcribed from), self-checks the prologue
// bytes, and pipes the identical spans through THIS TypeScript file with tsx —
// the shipped module, not a restatement — comparing float32 outputs as RAW u32
// BIT PATTERNS. The corpus places the source at every 2-byte misalignment 0..14
// so the head loop runs for a different number of pixels each time (at
// src%16 == 2, 6, 10, 14 the alignment test can never succeed and the WHOLE
// span goes through the head loop), and sweeps counts 0..9 plus 16/17/31/32 so
// every combination of head / 2-pixel main / tail occurs. Measured 2026-08-11:
//
//   SPANS=112 LANES=5408 EXACT=5408 DIVERGED=0
//
// Every lane of every span is bit-exact. (Unlike the 4f sibling there is no
// NaN-sign class to separate: the samples are u16 and the matrices finite, so
// no invalid operation occurs and x86's negative default QNaN never appears.)
//
// Mutation controls, applied to a /tmp COPY of this shipped module (never into
// raw-port/src) and run through the same driver:
//
//   M0 unmutated copy through the pipeline .......................    0 killed
//   M1 shufps $0x39 dropped (no wxyz->xyzw rotate) ............... 3789 killed
//   M2 haddps pairing -> left-to-right accumulation ..............    0 killed
//     M2v the same reduction, dropping the 4th product ...........   75 killed
//   M3 maxps operand order -> (alpha > EPS) ? alpha : EPS ........    0 killed
//     M3v the same floor, EPS -> 1e30 ........................... 2505 killed
//   M4 minps clamp removed (t' = |t|) ............................ 2494 killed
//   M5 orps sign splice dropped ..................................  858 killed
//   M6 the re-premultiply dropped (pm = signed) .................. 2571 killed
//   M7 head-loop alignment test inverted .........................    0 killed
//     M7v the same head loop, cursor advanced by 8 not 4 ........ 3300 killed
//
// The three dead controls are EQUIVALENT MUTANTS, not blind spots, and each
// violent variant is what says so (OPS_LOG's rule for a control that kills 0):
//   * M2 — with lane 3 of most corpus matrices zero, the pairwise and
//     left-to-right sums round identically; dropping a product outright still
//     kills 75 lanes, so the reduction IS observed.
//   * M3 — `(EPS > alpha) ? EPS : alpha` and `(alpha > EPS) ? alpha : EPS`
//     differ only on a NaN or on a signed-zero tie, and u16 samples produce
//     neither. Raising the floor to 1e30 kills 2505.
//   * M7 — the three code paths compute the SAME expression, so mutating the
//     path SELECTION cannot change an output at all and no output-comparing
//     oracle can see it. What matters is that the head loop is REACHED, which
//     M7v (corrupting the head loop's own cursor advance) proves at 3300 lanes.
/* eslint-disable @typescript-eslint/naming-convention */

/** EPS — 1e-7 @Helium 0x3ccf10 (0x33d6bf95); the `maxps` floor under alpha. */
const EPS = Math.fround(1.0000000116860974e-7); // @Helium 0x3ccf10
/** ALPHA_SCALE — (0,0,0,1/65535) @Helium 0x85c4f0; lane 3 is 0x37800080. */
const ALPHA_SCALE: readonly number[] = [0, 0, 0, Math.fround(1.5259021893143654e-5)]; // @Helium 0x85c4f0
/** ABS_MASK — 0x7fffffff splat @Helium 0x3c7c30; `andps` gives |t|. */
const ABS_MASK = 0x7fffffff; // @Helium 0x3c7c30
/** SIGN_MASK — 0x80000000 splat @Helium 0x3ca0d0; `andps` keeps t's sign. */
const SIGN_MASK = 0x80000000; // @Helium 0x3ca0d0
/** CLAMP — 1.32 (0x3fa8f5c3) splat @Helium 0x3cce80; the `minps` ceiling. */
const CLAMP = Math.fround(1.3200000524520874); // @Helium 0x3cce80
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
/** RGB_MASK — (1,1,1,0) @Helium 0x3ca9c0; clears lane 3 of the second matrix's output. */
const RGB_MASK: readonly number[] = [1, 1, 1, 0]; // @Helium 0x3ca9c0

// A 4-byte aliasing window, the only way to express `andps`/`orps` on a float
// in TypeScript. Not an invented FCP helper: the two functions are the halves
// of one register reinterpretation, used exactly where the machine applies an
// integer-domain SSE op to a float register (@0x18aee8, @0x18af36, @0x18af3a).
const SCRATCH = new ArrayBuffer(4);
const SCRATCH_F32 = new Float32Array(SCRATCH);
const SCRATCH_U32 = new Uint32Array(SCRATCH);
/** The u32 bit pattern of `x` rounded to float32 — the register, read as an integer. */
function bits(x: number): number {
  SCRATCH_F32[0] = x;
  return SCRATCH_U32[0];
}
/** The float32 whose bit pattern is `b` — the register, read back as a float. */
function fromBits(b: number): number {
  SCRATCH_U32[0] = b >>> 0;
  return SCRATCH_F32[0];
}

/**
 * `hgColorGammaTransformData` — the seven 16-byte-aligned float4 fields THIS
 * kernel reads, at the offsets its own prologue names (PORTING_SPEC Rule 5: no
 * invented fields, and no fields the body never touches). The two landed
 * siblings declare the same C++ struct with the subsets THEY read; all three
 * are deliberately partial models and they agree on every offset they share.
 */
export interface hgColorGammaTransformData {
  /** +0x00 — matrix A row 0; `movaps (%rcx),%xmm0` @0x18adfc. */
  matrixA_row0_at_0x00: Float32Array;
  /** +0x10 — matrix A row 1; `movaps 0x10(%rcx),%xmm0` @0x18ae03. */
  matrixA_row1_at_0x10: Float32Array;
  /** +0x20 — matrix A row 2; `movaps 0x20(%rcx),%xmm0` @0x18ae0b. */
  matrixA_row2_at_0x20: Float32Array;
  /** +0x40 — matrix B row 0; `movaps 0x40(%rcx),%xmm0` @0x18ae13. */
  matrixB_row0_at_0x40: Float32Array;
  /** +0x50 — matrix B row 1; `movaps 0x50(%rcx),%xmm0` @0x18ae1b. */
  matrixB_row1_at_0x50: Float32Array;
  /** +0x60 — matrix B row 2; `movaps 0x60(%rcx),%xmm0` @0x18ae23. */
  matrixB_row2_at_0x60: Float32Array;
  /** +0x100 — the bias subtracted from the rotated samples; @0x18ae2b. */
  bias_at_0x100: Float32Array;
}

/**
 * `hg_read_span_4s_wxyz_m1_gqt_m1_premul(void* dst, int count, void const* src,
 *  hgColorGammaTransformData const* data, int)` — @Helium 0x18adf0.
 *
 * Converts `count` pixels of four UNSIGNED 16-bit samples in WXYZ order into
 * float32 XYZW: matrix A, the gamma-quotient curve on the unpremultiplied
 * colour, re-premultiply by alpha, matrix B, with the normalised alpha added
 * back into lane 3. See the file header for the instruction-by-instruction
 * decode of all three loops and for every constant's address.
 *
 * @param dst   destination, 4 float32 per pixel (SysV %rdi). Stored with
 *              `movaps`, so it is 16-byte aligned in the caller.
 * @param count number of pixels (SysV %esi). Zero or NEGATIVE returns
 *              immediately — `jle` @0x18adf2 is the SIGNED test.
 * @param src   source, 4 uint16 per pixel in WXYZ order (SysV %rdx). Its
 *              16-byte alignment is TESTED @0x18ae36, not assumed.
 * @param data  the transform data (SysV %rcx).
 * @param _unused the fifth argument (SysV %r8d) — never read by this body; it
 *              is kept because it is part of the ABI signature this unit ports.
 */
export function hg_read_span_4s_wxyz_m1_gqt_m1_premul( // @Helium 0x18adf0
  dst: Float32Array,
  count: number,
  src: Uint16Array,
  data: hgColorGammaTransformData,
  _unused: number,
): void {
  // @0x18adf0/@0x18adf2 — testl %esi,%esi ; jle : SIGNED, so count <= 0 returns
  //   without touching dst. `| 0` models the 32-bit int argument.
  if ((count | 0) <= 0) return;

  // @0x18adfc..@0x18ae32 — the seven float4 fields, spilled to the frame once.
  const a0 = data.matrixA_row0_at_0x00;
  const a1 = data.matrixA_row1_at_0x10;
  const a2 = data.matrixA_row2_at_0x20;
  const b0 = data.matrixB_row0_at_0x40;
  const b1 = data.matrixB_row1_at_0x50;
  const b2 = data.matrixB_row2_at_0x60;
  const bias = data.bias_at_0x100;

  let remaining = count | 0;
  let srcPix = 0; // u16 cursor into src (the machine's %rdx + %r8, in bytes)
  let dstPix = 0; // float cursor into dst (the machine's %rax / (%rdi,%r8,2))

  /**
   * One pixel of the kernel — the arithmetic block the binary writes out three
   * times, on the same constants, at @0x18ae90 (head), @0x18afd0/@0x18b0df
   * (main) and @0x18b208 (tail). It is expressed once here because the copies
   * are the SAME instruction sequence, not three behaviours; the loop STRUCTURE
   * that surrounds them is preserved below. Every step is `Math.fround`-rounded
   * because every machine op is a 4-wide SINGLE-precision SSE op.
   */
  const pixel = (sp: number, dp: number): void => {
    // @0x18ae90 pmovzxwd — 4 u16, ZERO-extended; @0x18ae97 cvtdq2ps -> float;
    // @0x18ae9a shufps $0x39 — [1,2,3,0], the WXYZ -> XYZW rotate;
    // @0x18ae9e subps -0x40(%rbp) — minus the bias.
    const w0 = Math.fround(src[sp + 1] - bias[0]);
    const w1 = Math.fround(src[sp + 2] - bias[1]);
    const w2 = Math.fround(src[sp + 3] - bias[2]);
    const w3 = Math.fround(src[sp + 0] - bias[3]);
    const ws = [w0, w1, w2, w3];

    // @0x18aea2..@0x18aeca — matrix A, each row reduced by `haddps`, which sums
    //   PAIRWISE: the two haddps produce (l0+l1)+(l2+l3), not a left-to-right
    //   accumulation. @0x18aeca leaves (A0·w, A1·w, A2·w, A2·w) — lane 3 is a
    //   SECOND copy of A2·w (haddps %xmm12,%xmm12 duplicated it @0x18aec5).
    const dot = (r: Float32Array, v: readonly number[]): number =>
      Math.fround(
        Math.fround(Math.fround(r[0] * v[0]) + Math.fround(r[1] * v[1])) +
          Math.fround(Math.fround(r[2] * v[2]) + Math.fround(r[3] * v[3])),
      );
    const dotA2 = dot(a2, ws);
    const dotA = [dot(a0, ws), dot(a1, ws), dotA2, dotA2];

    // @0x18aec2 mulps %xmm2,%xmm0 — w * (0,0,0,1/65535). Lanes 0..2 become
    //   w*0 (a signed zero, or NaN if w is infinite) and lane 3 the normalised
    //   alpha; this vector is BOTH the alpha source and the value added back at
    //   @0x18af69, so it is computed once here exactly as the machine does.
    const scaled = [
      Math.fround(w0 * ALPHA_SCALE[0]),
      Math.fround(w1 * ALPHA_SCALE[1]),
      Math.fround(w2 * ALPHA_SCALE[2]),
      Math.fround(w3 * ALPHA_SCALE[3]),
    ];
    // @0x18aecf/@0x18aed3 shufps $0xff — broadcast lane 3 to all four lanes.
    const alpha = scaled[3];
    // @0x18aed8/@0x18aedc — movaps %xmm3(EPS),%xmm13 ; maxps %xmm12(alpha):
    //   Intel MAXPS dst=EPS, src=alpha, i.e. (EPS > alpha) ? EPS : alpha, which
    //   returns alpha when either is NaN. Math.max would return NaN.
    const den0 = EPS > alpha ? EPS : alpha;

    // The four lanes are independent from here; lane 3 is computed too (the
    // machine computes it and then discards it via RGB_MASK), so the port does
    // the same rather than special-casing it.
    const pm: number[] = [0, 0, 0, 0];
    for (let lane = 0; lane < 4; lane++) {
      // @0x18aee0 divps — t = dotA / max(EPS, alpha): the UNPREMULTIPLY.
      const t = Math.fround(dotA[lane] / den0);
      // @0x18aee8 andps ABS_MASK — |t|, bitwise (the machine clears the sign
      //   bit; it does not call fabs).
      const absT = fromBits(bits(t) & ABS_MASK);
      // @0x18aeec minps CLAMP — Intel MINPS is (src1 < src2) ? src1 : src2, so
      //   a NaN |t| yields CLAMP, not NaN.
      const tc = absT < CLAMP ? absT : CLAMP;
      // @0x18aef4 — t'²
      const t2 = Math.fround(tc * tc);
      // @0x18aefc/@0x18af00 — A*t' + ONE
      const at1 = Math.fround(Math.fround(A * tc) + ONE);
      // @0x18af07/@0x18af0b — den = B*t'² + (A*t' + ONE)
      const den = Math.fround(Math.fround(B * t2) + at1);
      // @0x18af13 — q = t'² / den
      const q = Math.fround(t2 / den);
      // @0x18af17/@0x18af1f — C*t' + D
      const ctd = Math.fround(Math.fround(C * tc) + D);
      // @0x18af27/@0x18af2e — num = E*t'² + (C*t' + D)
      const num = Math.fround(Math.fround(E * t2) + ctd);
      // @0x18af32 — curve = num * q
      const curve = Math.fround(num * q);
      // @0x18af36/@0x18af3a — andps SIGN_MASK,%xmm11 ; orps %xmm1,%xmm11: the
      //   sign of the UNCLAMPED quotient is OR-ed onto the curve's bits.
      const signed = fromBits((bits(t) & SIGN_MASK) | bits(curve));
      // @0x18af3e mulps %xmm12 — * alpha: the RE-PREMULTIPLY.
      pm[lane] = Math.fround(signed * alpha);
    }

    // @0x18af42..@0x18af60 — matrix B over the premultiplied vector, same
    //   pairwise haddps reduction, lane 3 again a duplicate of B2·pm.
    const dotB2 = dot(b2, pm);
    const dotB = [dot(b0, pm), dot(b1, pm), dotB2, dotB2];

    for (let lane = 0; lane < 4; lane++) {
      // @0x18af65 mulps %xmm8 — * (1,1,1,0) ; @0x18af69 addps %xmm0 — plus the
      //   scaled vector, whose lane 3 is the normalised alpha.
      const keptRgb = Math.fround(dotB[lane] * RGB_MASK[lane]);
      // @0x18af6c movaps %xmm1,(%rdi,%r8,2) — the store.
      dst[dp + lane] = Math.fround(keptRgb + scaled[lane]);
    }
  };

  // ── HEAD LOOP @0x18ae3f..@0x18af99 ────────────────────────────────────────
  // @0x18ae36 testb $0xf,%dl — is the SOURCE 16-byte aligned? A Uint16Array
  //   carries the same information in `byteOffset`, so the same test applies to
  //   the same bytes; when the view happens to be aligned this loop is skipped
  //   exactly as the machine skips it.
  let srcByte = src.byteOffset + srcPix * 2;
  if ((srcByte & 0xf) !== 0) {
    // @0x18ae3f leaq 0x8(%rdx),%rcx — the alignment cursor is src + 8.
    for (;;) {
      pixel(srcPix, dstPix); // @0x18ae90..@0x18af6c
      srcPix += 4; // @0x18af75 leaq 0x8(%r8),%r9 : +8 BYTES = 4 samples
      dstPix += 4; // @0x18af71 addq $0x10,%rax   : +16 bytes = 4 floats
      // @0x18af79/@0x18af7c — the cmp is against the count BEFORE the
      //   decrement (leal sets no flags), i.e. "was that the last pixel?".
      const wasLast = remaining === 1;
      remaining -= 1;
      if (wasLast) break;
      // @0x18af81/@0x18af84/@0x18af8b — loop while the NEXT source address is
      //   still not 16-byte aligned (movq sets no flags, so the jne reads the
      //   andl).
      srcByte = src.byteOffset + srcPix * 2;
      if ((srcByte & 0xf) === 0) break;
    }
  }

  // ── MAIN LOOP @0x18afaa..@0x18b1fb (2 pixels per iteration) ───────────────
  // @0x18af94/@0x18af97 (from the head) and @0x18afa1/@0x18afa4 (aligned entry):
  //   both fall through to the tail when fewer than 2 pixels remain.
  while (remaining >= 2) {
    // @0x18afd0..@0x18b0d8 — first pixel, from the LOW 4 u16 of the 16-byte load.
    pixel(srcPix, dstPix);
    // @0x18b0df..@0x18b1c5 — second pixel, from the HIGH 4 u16 (punpckhwd).
    pixel(srcPix + 4, dstPix + 4);
    // @0x18b1cd/@0x18b1d1/@0x18b1d5 — advance 16 source bytes, 32 dest bytes,
    //   count -= 2. (@0x18b1d8's reload of the pipelined `-0x80(%rbp)` slot and
    //   the @0x18b1f4 prefetcht0 have no architectural effect: the slot only
    //   ever holds a copy of the very elements the next iteration reads, and a
    //   prefetch is a cache hint.)
    srcPix += 8;
    dstPix += 8;
    remaining -= 2;
  }

  // ── TAIL @0x18b200..@0x18b2e2 (at most one pixel) ─────────────────────────
  // @0x18b200/@0x18b202 — testl %esi,%esi ; je : nothing left, return.
  if (remaining !== 0) {
    // @0x18b208..@0x18b2e2 — the same expression once more, with the constants
    //   as memory operands rather than hoisted registers, then one store.
    pixel(srcPix, dstPix);
  }
  // @0x18b2e5/@0x18b2e6 — popq %rbp ; retq.
}
