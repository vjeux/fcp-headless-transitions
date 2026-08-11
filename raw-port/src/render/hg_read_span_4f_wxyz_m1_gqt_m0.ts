// hg_read_span_4f_wxyz_m1_gqt_m0.ts — raw transcription of Helium's
// `hg_read_span_4f_wxyz_m1_gqt_m0(void*, int, void const*,
//                                 hgColorGammaTransformData const*, int)`.
//
// One free function per file, named after the function (PORTING_SPEC naming
// rule; the same treatment as the landed sibling
// raw-port/src/render/hg_read_span_4s_m0_gqt_m0_premul.ts).
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x83fa0  hg_read_span_4f_wxyz_m1_gqt_m0(void*, int, void const*,
//                                            hgColorGammaTransformData const*, int)
//     __Z30hg_read_span_4f_wxyz_m1_gqt_m0PviPKvPK25hgColorGammaTransformDatai
//
//   It is a LOCAL (`nm` type `t`) symbol, NOT an export — the requeue note that
//   handed this unit over says "The function is EXPORTED, so it is directly
//   dlsym-able", and that is wrong:
//     $ grep hg_read_span_4f_wxyz_m1_gqt_m0 raw-port/army/inventory/Helium.syms.txt
//     0000000000083fa0 t __Z30hg_read_span_4f_wxyz_m1_gqt_m0PviPKvPK...
//   `dlsym` cannot see it. It is still fully oracle-able by ADDRESS at
//   `_dyld_get_image_vmaddr_slide(Helium) + 0x83fa0`, which is what the oracle
//   below does (and it self-checks the prologue bytes there before believing
//   the address, see ORACLE).
//
// Source disassembly (re-derived with `raw-port/tools/disasm.sh --sym ... Helium`):
//   raw-port/re/disasm/Helium.__Z30hg_read_span_4f_wxyz_m1_gqt_m0PviPKvPK25hgColorGammaTransformDatai.s
//   (69 lines)
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IT DOES
// ─────────────────────────────────────────────────────────────────────────────
// Reads a span of `count` pixels stored as four FLOAT32 samples in WXYZ order
// ("4f_wxyz"), rotates them into XYZW, subtracts a bias, applies a 3x4 colour
// MATRIX ("m1"), runs the gamma-quotient curve ("gqt") on the result, and
// writes float32 XYZW out with the alpha lane passed through un-curved ("m0" —
// no second matrix, and no premultiply, unlike the `_premul` sibling at
// @0x84210). Per pixel:
//
//   v     = src.yzwx - bias                    (the wxyz -> xyzw rotate)
//   dot   = (row0·v, row1·v, row2·v, row2·v)   (haddps, so summed PAIRWISE)
//   t     = min(|dot|, 1.32)
//   curve = (E*t² + C*t + D) * (t² / (B*t² + A*t + 1))
//   out   = (sign(dot) | curve) * (1,1,1,0)  +  v * (0,0,0,1)
//
// The sign is re-attached with a bitwise `andps`/`orps` splice rather than a
// multiply, because the curve is evaluated on |dot|; lane 3 computes row2·v a
// second time and is then discarded by the (1,1,1,0) mask, which is why the
// alpha that survives is v.w and not a curved value.
//
// Unlike the 4s sibling there is only ONE arithmetic path: the source is
// float4, so every load is naturally 16-byte-sized and the binary needs no
// unaligned head loop and no 2-pixel main loop. What it does instead is
// software-pipeline the source load one pixel ahead (`%xmm4`), which has no
// architectural effect — the slot only ever holds the very bytes the next
// iteration reads.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONSTANT POOL — every rip-relative operand, resolved and read from the
// MAPPED IMAGE (`ctypes.string_at(slide + va, 16)` under `arch -x86_64`, not
// from an otool operand: `-tV` symbolises displacements, OPS_LOG). Each was
// computed as (address of the NEXT instruction) + displacement.
// ─────────────────────────────────────────────────────────────────────────────
//   @0x3c7c30  7fffffff x4                       — ABS_MASK   (andps @0x8402d)
//   @0x3cce80  1.32 (0x3fa8f5c3) x4              — CLAMP      (minps @0x84034)
//   @0x3cce90  10.74770736694336 (0x412bf69c) x4 — A          (mulps @0x84047)
//   @0x3c7c40  1.0 (0x3f800000) x4               — ONE        (addps @0x8404f)
//   @0x3ccea0  5.684783458709717 (0x40b5e9bf) x4 — B          (mulps @0x8405b)
//   @0x3cceb0  11.123847961425781 (0x4131fb48) x4— C          (mulps @0x8406f)
//   @0x3ccec0  1.1961687803268433 (0x3f991c0f) x4— D    hoisted into %xmm12 @0x83fcd
//   @0x3cced0  5.11247444152832 (0x40a39964) x4  — E    hoisted into %xmm13 @0x83fd5
//   @0x3ca0d0  80000000 x4                       — SIGN_MASK  %xmm14 @0x83fdd
//   @0x3c9fe0  (0,0,0,1)                         — ALPHA_MASK %xmm15 @0x83fe5
//   @0x3ca9c0  (1,1,1,0)                         — RGB_MASK   %xmm5  @0x83fed
//
// A,B,C,D,E, ONE, ALPHA_MASK and RGB_MASK are the SAME eight addresses the
// landed `hg_read_span_4s_m0_gqt_m0_premul` cites, and the values read back
// today match that file's recorded values bit for bit — the gamma-quotient
// curve is one shared constant table across the read_span family. ABS_MASK
// @0x3c7c30, CLAMP @0x3cce80 and SIGN_MASK @0x3ca0d0 are new here (the 4s
// variant has no abs/clamp/sign splice because its input cannot be negative).
//
// ─────────────────────────────────────────────────────────────────────────────
// FULL DISASM — @0x83fa0..@0x840c4, all 69 lines
// ─────────────────────────────────────────────────────────────────────────────
//   0x83fa0  testl %esi,%esi
//   0x83fa2  jle   0x840c4              ; count <= 0 (SIGNED) -> return, no store
//   0x83fa8  pushq %rbp ; movq %rsp,%rbp
//   0x83fac  movaps (%rcx),%xmm6        ; data +0x00  matrix row 0
//   0x83faf  movaps 0x10(%rcx),%xmm7    ; data +0x10  matrix row 1
//   0x83fb3  movaps 0x20(%rcx),%xmm2    ; data +0x20  matrix row 2
//   0x83fb7  movaps 0x100(%rcx),%xmm3   ; data +0x100 bias
//   0x83fbe  movaps (%rdx),%xmm8        ; pixel 0, read BEFORE %rdx advances
//   0x83fc2  incl  %esi                 ; the loop counter is count+1
//   0x83fc4  addq  $0x40,%rdx           ; source cursor biased by +0x40
//   0x83fc8  xorps %xmm4,%xmm4          ; pipeline slot = 0
//   0x83fcb  xorl  %eax,%eax            ; byte offset = 0
//   0x83fcd  movaps 0x348eeb(%rip),%xmm12   ; 0x83fd5+0x348eeb = 0x3ccec0  D
//   0x83fd5  movaps 0x348ef3(%rip),%xmm13   ; 0x83fdd+0x348ef3 = 0x3cced0  E
//   0x83fdd  movaps 0x3460eb(%rip),%xmm14   ; 0x83fe5+0x3460eb = 0x3ca0d0  SIGN_MASK
//   0x83fe5  movaps 0x345ff3(%rip),%xmm15   ; 0x83fed+0x345ff3 = 0x3c9fe0  ALPHA_MASK
//   0x83fed  movaps 0x3469cc(%rip),%xmm5    ; 0x83ff4+0x3469cc = 0x3ca9c0  RGB_MASK
//   0x83ff4  jmp   0x840ac              ; enter at the loop CONTROL
//  L(0x84000) the body:
//   0x84000  shufps $0x39,%xmm8,%xmm8   ; xmm8 = xmm8[1,2,3,0]  (wxyz -> xyzw)
//   0x84005  subps %xmm3,%xmm8          ; v = shuffled - bias
//   0x84009  movaps %xmm6,%xmm0 ; mulps %xmm8,%xmm0     ; row0 * v
//   0x84010  movaps %xmm7,%xmm1 ; mulps %xmm8,%xmm1     ; row1 * v
//   0x84017  haddps %xmm1,%xmm0         ; xmm0 = [r0.0+r0.1, r0.2+r0.3,
//                                        ;         r1.0+r1.1, r1.2+r1.3]
//   0x8401b  movaps %xmm2,%xmm1 ; mulps %xmm8,%xmm1     ; row2 * v
//   0x84022  haddps %xmm1,%xmm1         ; xmm1 = [r2.0+r2.1, r2.2+r2.3, (same x2)]
//   0x84026  haddps %xmm1,%xmm0         ; xmm0 = (row0·v, row1·v, row2·v, row2·v)
//   0x8402a  movaps %xmm0,%xmm1
//   0x8402d  andps  ABS_MASK,%xmm1      ; 0x84034+0x343bfc = 0x3c7c30 -> |dot|
//   0x84034  minps  CLAMP,%xmm1         ; 0x8403b+0x348e45 = 0x3cce80 -> t
//   0x8403b  movaps %xmm1,%xmm9 ; mulps %xmm1,%xmm9     ; t2 = t*t
//   0x84043  movaps %xmm1,%xmm10
//   0x84047  mulps  A,%xmm10            ; 0x8404f+0x348e41 = 0x3cce90
//   0x8404f  addps  ONE,%xmm10          ; 0x84057+0x343be9 = 0x3c7c40  -> A*t+1
//   0x84057  movaps %xmm9,%xmm11
//   0x8405b  mulps  B,%xmm11            ; 0x84063+0x348e3d = 0x3ccea0
//   0x84063  addps  %xmm10,%xmm11       ; den = B*t2 + (A*t+1)
//   0x84067  movaps %xmm9,%xmm10
//   0x8406b  divps  %xmm11,%xmm10       ; q = t2 / den
//   0x8406f  mulps  C,%xmm1             ; 0x84076+0x348e3a = 0x3cceb0
//   0x84076  addps  %xmm12,%xmm1        ; C*t + D
//   0x8407a  mulps  %xmm13,%xmm9        ; E*t2
//   0x8407e  addps  %xmm1,%xmm9         ; num = E*t2 + (C*t+D)
//   0x84082  mulps  %xmm10,%xmm9        ; curve = num * q
//   0x84086  andps  %xmm14,%xmm0        ; sign bits of the DOT (xmm0 still holds it)
//   0x8408a  orps   %xmm9,%xmm0         ; sign |= curve  (the splice)
//   0x8408e  mulps  %xmm15,%xmm8        ; v * (0,0,0,1)
//   0x84092  mulps  %xmm5,%xmm0         ; curve * (1,1,1,0)
//   0x84095  addps  %xmm8,%xmm0
//   0x84099  movaps %xmm0,(%rdi,%rax)   ; store the pixel
//   0x8409d  decl  %esi
//   0x8409f  addq  $0x10,%rax
//   0x840a3  movaps %xmm4,%xmm8         ; take the pipelined next pixel
//   0x840a7  cmpl  $0x1,%esi ; jle 0x840c3   ; <=1 left -> done
//  L(0x840ac) the control:
//   0x840ac  cmpl  $0x2,%esi
//   0x840af  je    0x84000              ; exactly one pixel left -> NO preload
//   0x840b5  movaps -0x30(%rdx,%rax),%xmm4  ; %rdx = src+0x40, so this reads
//                                        ; src + 0x10 + %rax = the NEXT pixel
//   0x840ba  prefetcht0 (%rdx,%rax)     ; cache hint, no architectural effect
//   0x840be  jmp   0x84000
//   0x840c3  popq  %rbp
//   0x840c4  retq
//
// The `%esi == 2` test is what keeps the kernel from reading one pixel past the
// end of the span: on the last iteration the preload is skipped entirely, so a
// `count`-pixel span touches exactly `count` source pixels (verified by
// construction in the oracle, which allocates the source with no slack).
//
// ─────────────────────────────────────────────────────────────────────────────
// NUMERICS
// ─────────────────────────────────────────────────────────────────────────────
// Every operation is a 4-wide SINGLE-precision SSE op, so every intermediate is
// rounded to float32 — hence `Math.fround` on each step (PORTING_SPEC Rule 4).
// Three details are NOT expressible as ordinary JS arithmetic and are
// transcribed as the instructions they are:
//   * `haddps` sums PAIRWISE: (a+b)+(c+d) with three roundings, which is not
//     the same float as ((a+b)+c)+d. The port keeps the pairing.
//   * `andps`/`orps` are BITWISE. `Math.abs` happens to agree with the ABS_MASK
//     for every input, but the sign splice `(dot & 0x80000000) | curve` does
//     not correspond to any JS operator at all — a `curve * Math.sign(dot)`
//     would differ on a zero or NaN `dot` — so both are done on the u32 bit
//     patterns through a 4-byte scratch view.
//   * `minps CLAMP,%xmm1` is Intel `MINPS xmm1, m128`, defined as
//     `dst = (src1 < src2) ? src1 : src2` — it returns the SECOND operand (the
//     memory one, CLAMP) whenever either input is NaN, where `Math.min` would
//     return NaN. Written as the conditional the ISA specifies. (Confirmed
//     against the live kernel: a NaN dot product comes back with the MAGNITUDE
//     of the curve at t = 1.32, not as a NaN.)
//
// ONE THING THIS PORT CANNOT REPRODUCE, and it is a property of the JS number
// type rather than of the transcription. When an intermediate is NaN, x86's
// default QNaN from an invalid operation (inf-inf, 0*inf) is 0xffc00000 — sign
// bit SET — and the `orps` splice @0x8408a copies that sign onto the curve, so
// a NaN-fed lane comes out of the machine as a NEGATIVE finite number
// (0xbfdc5211 in the oracle's corpus) where this port produces the positive one
// (0x3fdc5211). A JS `number` cannot carry a NaN's sign at all: V8 canonicalises
// every NaN to 0x7fc00000, so `bits(d) & SIGN_MASK` is always 0 for a NaN `d`.
// Reproducing it would mean re-writing the whole matrix multiply in the integer
// domain with x86's NaN-propagation rules, which is a different (and much
// larger) unit of work than this kernel; it is measured and quantified rather
// than hidden — see ORACLE below.
//
// CALLEES: none — no `callq` anywhere, no extern, no indirect call. A pure leaf
// kernel (`depgraph.py deps` on the mangled name lists nothing).
//
// ─────────────────────────────────────────────────────────────────────────────
// ORACLE
// ─────────────────────────────────────────────────────────────────────────────
// raw-port/re/oracle/hg_read_span_4f_wxyz_m1_gqt_m0_oracle.py calls the LIVE
// kernel at dyld slide + 0x83fa0 under `arch -x86_64 /usr/bin/python3` (the
// slice every address here is transcribed from) and pipes the identical inputs
// through THIS TypeScript file with tsx — the shipped module, not a restatement
// of it — comparing the float32 outputs as RAW u32 BIT PATTERNS. It self-checks
// the 12 prologue bytes at slide + 0x83fa0 against the disassembly before it
// reports any number. Measured on 2026-08-11:
//
//   SPANS=120 LANES=3360  EXACT=3279  SIGN_ONLY(NaN-fed)=81  DIVERGED=0
//   FINITE-INPUT SUBSET:  SPANS=79 LANES=1528 EXACT=1528 SIGN_ONLY=0 DIVERGED=0
//
// i.e. over every span containing no NaN and no infinity the port is bit-exact,
// and all 81 remaining lanes are the NaN-sign class described under NUMERICS —
// the oracle asserts that they differ in the sign bit ALONE and that each comes
// from a span with a NaN/Inf input, so the class cannot absorb a real defect.
//
// Mutation controls, applied to a /tmp COPY of this shipped module (never into
// raw-port/src) and run through the same driver:
//
//   M0 unmutated copy through the pipeline .......................    0 killed
//   M1 shufps $0x39 dropped (no wxyz->xyzw rotate) ...............  959 killed
//   M2 haddps pairing -> left-to-right accumulation ..............   11 killed
//   M3 minps NaN rule -> Math.min ................................  186 killed
//   M4 orps sign splice dropped ..................................  288 killed
//   M5 preload guard `esi !== 2` removed .........................    0 killed
//   M5v the same preload reading pixel+2 instead of pixel+1 ...... 1469 killed
//
// M5 is a genuinely EQUIVALENT mutant rather than a blind spot, and M5v is what
// says so: the preloaded pixel is only ever consumed on an iteration that runs,
// so dropping the guard changes no output — the guard exists to keep the
// machine from touching a page past the span, not to change a result. M2's 11
// is small because the pairing only shows up where the four products differ
// enough in magnitude for the rounding to land differently, which is exactly
// the corpus's large-matrix rows.
/* eslint-disable @typescript-eslint/naming-convention */

/** ABS_MASK — 0x7fffffff splat @Helium 0x3c7c30; `andps` @0x8402d gives |dot|. */
const ABS_MASK = 0x7fffffff; // @Helium 0x3c7c30
/** SIGN_MASK — 0x80000000 splat @Helium 0x3ca0d0; `andps` @0x84086 keeps dot's sign. */
const SIGN_MASK = 0x80000000; // @Helium 0x3ca0d0
/** CLAMP — 1.32 (0x3fa8f5c3) splat @Helium 0x3cce80; the `minps` ceiling on |dot|. */
const CLAMP = Math.fround(1.3200000524520874); // @Helium 0x3cce80 (0x3fa8f5c3)
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
/** ALPHA_MASK — (0,0,0,1) @Helium 0x3c9fe0; selects v's alpha lane (`mulps` @0x8408e). */
const ALPHA_MASK: readonly number[] = [0, 0, 0, 1]; // @Helium 0x3c9fe0
/** RGB_MASK — (1,1,1,0) @Helium 0x3ca9c0; clears the curve's alpha lane (`mulps` @0x84092). */
const RGB_MASK: readonly number[] = [1, 1, 1, 0]; // @Helium 0x3ca9c0

// A 4-byte aliasing window, the only way to express `andps`/`orps` on a float
// in TypeScript. Not an invented FCP helper: `bits`/`fromBits` are the two
// halves of one register reinterpretation, used exactly where the machine uses
// an integer-domain SSE op on a float register (@0x8402d, @0x84086, @0x8408a).
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
 * `hgColorGammaTransformData` — the four 16-byte-aligned float4 fields THIS
 * kernel reads, at the offsets its own prologue names (PORTING_SPEC Rule 5: no
 * invented fields, and no fields the body never touches).
 *
 * The landed `hg_read_span_4s_m0_gqt_m0_premul.ts` declares the same C++ struct
 * with only `bias_at_0x100`, because that kernel reads only that field. Both
 * are deliberately PARTIAL models of one struct and they agree on the offset
 * they share; a full layout belongs in a `re/<Struct>_LAYOUT.md` recovered from
 * the struct's writers, which no unit in this family has decoded yet.
 */
export interface hgColorGammaTransformData {
  /** +0x00 — matrix row 0; `movaps (%rcx),%xmm6` @0x83fac. */
  row0_at_0x00: Float32Array;
  /** +0x10 — matrix row 1; `movaps 0x10(%rcx),%xmm7` @0x83faf. */
  row1_at_0x10: Float32Array;
  /** +0x20 — matrix row 2; `movaps 0x20(%rcx),%xmm2` @0x83fb3. */
  row2_at_0x20: Float32Array;
  /** +0x100 — the bias subtracted from the rotated samples; `movaps 0x100(%rcx),%xmm3` @0x83fb7. */
  bias_at_0x100: Float32Array;
}

/**
 * `hg_read_span_4f_wxyz_m1_gqt_m0(void* dst, int count, void const* src,
 *  hgColorGammaTransformData const* data, int)` — @Helium 0x83fa0.
 *
 * Converts `count` pixels of four float32 samples in WXYZ order into float32
 * XYZW, applying the +0x00/+0x10/+0x20 colour matrix and the gamma-quotient
 * curve to the result, with the alpha lane passed through un-curved. See the
 * file header for the instruction-by-instruction decode and every constant's
 * address.
 *
 * @param dst   destination, 4 float32 per pixel (SysV %rdi). Written with
 *              `movaps`, so it is 16-byte aligned in the caller.
 * @param count number of pixels (SysV %esi). Zero or NEGATIVE returns
 *              immediately — `jle` @0x83fa2 is the SIGNED test.
 * @param src   source, 4 float32 per pixel in WXYZ order (SysV %rdx). Read with
 *              `movaps`, so it too is 16-byte aligned.
 * @param data  the transform data (SysV %rcx).
 * @param _unused the fifth argument (SysV %r8d) — never read by this body; it
 *              is kept because it is part of the ABI signature this unit ports.
 */
export function hg_read_span_4f_wxyz_m1_gqt_m0( // @Helium 0x83fa0
  dst: Float32Array,
  count: number,
  src: Float32Array,
  data: hgColorGammaTransformData,
  _unused: number,
): void {
  // @0x83fa0/@0x83fa2 — testl %esi,%esi ; jle : SIGNED, so count <= 0 returns
  //   without touching dst. `| 0` models the 32-bit int argument.
  if ((count | 0) <= 0) return;

  // @0x83fac/@0x83faf/@0x83fb3/@0x83fb7 — the four float4 fields, hoisted once.
  const row0 = data.row0_at_0x00;
  const row1 = data.row1_at_0x10;
  const row2 = data.row2_at_0x20;
  const bias = data.bias_at_0x100;

  // @0x83fbe movaps (%rdx),%xmm8 — pixel 0 is loaded BEFORE %rdx is advanced.
  let cur0 = src[0];
  let cur1 = src[1];
  let cur2 = src[2];
  let cur3 = src[3];
  // @0x83fc2 incl %esi — the loop counter runs at count+1, so the `cmpl $0x2`
  //   at the control means "exactly one pixel left".
  let esi = (count | 0) + 1;
  // @0x83fc8 xorps %xmm4,%xmm4 — the pipeline slot starts at zero. (It is read
  //   at @0x840a3 on the final iteration, where the value is then discarded.)
  let nxt0 = 0;
  let nxt1 = 0;
  let nxt2 = 0;
  let nxt3 = 0;
  // @0x83fcb xorl %eax,%eax — the destination byte offset, +0x10 per pixel.
  let rax = 0;

  // @0x83ff4 jmp 0x840ac — the loop is entered at its CONTROL, so the first
  //   iteration also preloads.
  for (;;) {
    // @0x840ac/@0x840af — cmpl $0x2,%esi ; je 0x84000 : one pixel left, skip
    //   the preload (this is what stops the kernel reading past the span).
    if (esi !== 2) {
      // @0x840b5 movaps -0x30(%rdx,%rax),%xmm4 — %rdx was advanced by 0x40
      //   @0x83fc4, so this addresses src + 0x10 + %rax: the NEXT pixel.
      //   (@0x840ba prefetcht0 (%rdx,%rax) is a cache hint and has no
      //   counterpart — it has no architectural effect.)
      const p = (rax >> 2) + 4;
      nxt0 = src[p];
      nxt1 = src[p + 1];
      nxt2 = src[p + 2];
      nxt3 = src[p + 3];
    }

    // ── the body @0x84000..@0x8409b ─────────────────────────────────────────
    // @0x84000 shufps $0x39,%xmm8,%xmm8 — xmm8 = xmm8[1,2,3,0]: the WXYZ source
    //   order rotated one lane left into XYZW.
    // @0x84005 subps %xmm3,%xmm8 — minus the +0x100 bias.
    const v0 = Math.fround(cur1 - bias[0]);
    const v1 = Math.fround(cur2 - bias[1]);
    const v2 = Math.fround(cur3 - bias[2]);
    const v3 = Math.fround(cur0 - bias[3]);

    // @0x84009..@0x84026 — the 3x4 matrix multiply. Each row is multiplied
    //   lane-wise and reduced by `haddps`, which sums PAIRWISE: the two
    //   `haddps` @0x84017/@0x84026 produce (l0+l1)+(l2+l3), NOT a left-to-right
    //   accumulation, and the difference is a real float32 difference.
    const dot = (r: Float32Array): number =>
      Math.fround(
        Math.fround(Math.fround(r[0] * v0) + Math.fround(r[1] * v1)) +
          Math.fround(Math.fround(r[2] * v2) + Math.fround(r[3] * v3)),
      );
    // @0x84026 leaves xmm0 = (row0·v, row1·v, row2·v, row2·v): lane 3 is a
    //   SECOND copy of row2·v (haddps %xmm1,%xmm1 duplicated it @0x84022), and
    //   it is computed and then discarded by RGB_MASK.
    const dot2 = dot(row2);
    const dots = [dot(row0), dot(row1), dot2, dot2];
    const vs = [v0, v1, v2, v3];

    const dp = rax >> 2;
    for (let lane = 0; lane < 4; lane++) {
      const d = dots[lane];

      // @0x8402a/@0x8402d — movaps %xmm0,%xmm1 ; andps ABS_MASK : |dot|,
      //   bitwise (the machine clears the sign bit; it does not call fabs).
      const absd = fromBits(bits(d) & ABS_MASK);
      // @0x84034 minps CLAMP,%xmm1 — Intel MINPS is (src1 < src2) ? src1 : src2,
      //   so a NaN |dot| yields CLAMP, not NaN. Math.min would return NaN.
      const t = absd < CLAMP ? absd : CLAMP;
      // @0x8403b/@0x8403f — movaps %xmm1,%xmm9 ; mulps %xmm1,%xmm9
      const t2 = Math.fround(t * t);
      // @0x84047/@0x8404f — mulps A ; addps ONE
      const at1 = Math.fround(Math.fround(A * t) + ONE);
      // @0x8405b/@0x84063 — mulps B,%xmm11 ; addps %xmm10,%xmm11
      const den = Math.fround(Math.fround(B * t2) + at1);
      // @0x8406b divps %xmm11,%xmm10 — q = t2 / den
      const q = Math.fround(t2 / den);
      // @0x8406f/@0x84076 — mulps C,%xmm1 ; addps %xmm12(D),%xmm1
      const ctd = Math.fround(Math.fround(C * t) + D);
      // @0x8407a/@0x8407e — mulps %xmm13(E),%xmm9 ; addps %xmm1,%xmm9
      const num = Math.fround(Math.fround(E * t2) + ctd);
      // @0x84082 mulps %xmm10,%xmm9 — curve = num * q
      const curve = Math.fround(num * q);

      // @0x84086/@0x8408a — andps %xmm14(SIGN_MASK),%xmm0 ; orps %xmm9,%xmm0.
      //   The sign of the ORIGINAL dot is OR-ed onto the curve's bits: the
      //   curve was evaluated on |dot|, and this is how the machine puts the
      //   sign back. Bitwise, so a negative-zero dot signs the result too.
      const signed = fromBits((bits(d) & SIGN_MASK) | bits(curve));

      // @0x8408e mulps %xmm15,%xmm8 ; @0x84092 mulps %xmm5,%xmm0 ; @0x84095 addps
      const keptAlpha = Math.fround(vs[lane] * ALPHA_MASK[lane]);
      const keptRgb = Math.fround(signed * RGB_MASK[lane]);
      // @0x84099 movaps %xmm0,(%rdi,%rax) — the store.
      dst[dp + lane] = Math.fround(keptRgb + keptAlpha);
    }

    // @0x8409d decl %esi ; @0x8409f addq $0x10,%rax
    esi -= 1;
    rax += 0x10;
    // @0x840a3 movaps %xmm4,%xmm8 — the pipelined pixel becomes the current one.
    cur0 = nxt0;
    cur1 = nxt1;
    cur2 = nxt2;
    cur3 = nxt3;
    // @0x840a7/@0x840aa cmpl $0x1,%esi ; jle 0x840c3 — <= 1 left, we are done.
    if (esi <= 1) break;
  }
  // @0x840c3/@0x840c4 — popq %rbp ; retq.
}
