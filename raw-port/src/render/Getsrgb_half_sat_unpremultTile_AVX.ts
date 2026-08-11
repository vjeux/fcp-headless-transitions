// raw-port: Getsrgb_half_sat_unpremultTile_AVX (Helium.framework) — one of the
// static per-form tile kernels HGToneCurve dispatches to on the AVX CPU path.
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this commit)
// -----------------------------------------------------------------------------
//   * Getsrgb_half_sat_unpremultTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)
//     @Helium 0x29d450  —  __ZL34Getsrgb_half_sat_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode
//     (`__ZL` = internal linkage: a file-static kernel, reached only through the
//      HGToneCurve program table, never exported. `nm` lists it as `t`.)
//     re/disasm:
//       raw-port/re/disasm/Helium.__ZL34Getsrgb_half_sat_unpremultTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode.s
//       (118 lines, @0x29d450..@0x29d6ab — every line is accounted for below)
//
// This is a FREE FUNCTION, not a class member, so per the porting spec's naming
// rule it lives in a file named after the function itself.
//
// -----------------------------------------------------------------------------
// WHAT THE KERNEL DOES (structure, read straight off the disasm)
// -----------------------------------------------------------------------------
// Three copies of one arithmetic body, exactly as the compiler emitted them:
//
//   A. @0x29d4c0  the 256-bit main loop — 8 floats = TWO RGBA pixels per pass,
//                 taken while at least 2 pixels of the row remain.
//   B. @0x29d56f  a 128-bit tail — ONE leftover pixel when the row width is odd.
//   C. @0x29d610  a separate 128-bit row loop used when the tile is exactly ONE
//                 pixel wide (`width < 2` at @0x29d47a, then `width != 1`
//                 returns at @0x29d601).
//
// The per-lane math is identical in all three; they are transcribed separately
// (rather than through a shared helper) because the binary really does contain
// three unrolled copies with three distinct instruction orders, and each one's
// @0xADDR citations must stay attached to the instructions they came from.
//
// The lane math is the sRGB-style split transfer function:
//
//   x    = source lane
//   lin  = x * S[+0x13e0]                                  ; the linear segment
//   t    = min(max(x, S[+0x940]), S[+0xa0])                ; clamp to the curve domain
//   s    = sqrt(t)
//   poly = (((s*S[+0x14a0] + S[+0x14c0])*t + (s*S[+0x14e0] + S[+0x1500]))*t
//            + (s*S[+0x1520] + S[+0x1540])) * s + S[+0x1560]
//   out  = (t < S[+0x1400]) ? lin : poly                   ; vblendvps
//   lane 3 (and lane 7 in the 256-bit body) keeps the ORIGINAL x — vblendps
//   $0x88 / $0x8 — i.e. ALPHA IS PASSED THROUGH UNTOUCHED.
//
// -----------------------------------------------------------------------------
// AT&T OPERAND-ORDER DERIVATIONS (the spec's cheat-sheet applied line by line)
// -----------------------------------------------------------------------------
//   `vmaxps 0x940(%rsi), %ymm0, %ymm2`   = Intel VMAXPS ymm2, ymm0, [rsi+0x940]
//        -> dst = (src1 > src2) ? src1 : src2  =  (x > S[+0x940]) ? x : S[+0x940]
//   `vminps 0xa0(%rsi), %ymm2, %ymm2`    = Intel VMINPS ymm2, ymm2, [rsi+0xa0]
//        -> dst = (src1 < src2) ? src1 : src2  =  (t < S[+0xa0]) ? t : S[+0xa0]
//   `vcmpltps 0x1400(%rsi), %ymm2, %ymm4`= Intel VCMPLTPS ymm4, ymm2, [rsi+0x1400]
//        -> mask lane = (t < S[+0x1400])
//   `vblendvps %ymm4, %ymm1, %ymm2, %ymm1` = Intel VBLENDVPS ymm1, ymm2, ymm1, ymm4
//        -> DEST = mask ? SRC2 : SRC1 = mask ? ymm1(lin) : ymm2(poly)
//   `vblendps $0x88, %ymm0, %ymm1, %ymm0`  = Intel VBLENDPS ymm0, ymm1, ymm0, 0x88
//        -> imm bit i set picks SRC2 (=ymm0, the untouched source): bits 3 and 7.
//   `vmulps %ymm5, %ymm2, %ymm5`         -> ymm5 = ymm2 * ymm5 (dst is the LEFT
//        operand in Intel order; multiplication is commutative here, but the
//        ADD/SUB forms below are not, so the same reading is used throughout).
//
// -----------------------------------------------------------------------------
// ONE DISASSEMBLER ARTIFACT YOU MUST NOT COPY BLINDLY
// -----------------------------------------------------------------------------
// `otool -tV` prints the `+0x14c0` displacement of three instructions as a
// SYMBOL NAME:
//
//   0x29d4f3  vaddps __ZN17HGParamBufferDesc8addFieldE5HGRefI12HGParamFieldE(%rsi), %ymm5, %ymm5
//
// There is no call and no relocation there — HGParamBufferDesc::addField merely
// happens to sit at image address 0x14c0, so otool symbolizes the raw disp32.
// The instruction bytes prove it is a plain `[rsi+0x14c0]` memory operand:
//
//   @0x29d4f3   c5 d4 58 ae c0 14 00 00    VEX.256 ADDPS ymm5, ymm5, [rsi+0x14c0]
//   @0x29d5a2   c5 d0 58 ae c0 14 00 00    VEX.128 ADDPS xmm5, xmm5, [rsi+0x14c0]
//   @0x29d630   c5 e0 58 9e c0 14 00 00    VEX.128 ADDPS xmm3, xmm3, [rsi+0x14c0]
//
// (modrm `ae`/`9e` = mod 10, base %rsi, disp32 `c0 14 00 00` = 0x14c0; bytes read
// with `otool -arch x86_64 -t Helium`.) It also fits the constant-slot stride:
// the polynomial reads 0x14a0/0x14c0, 0x14e0/0x1500, 0x1520/0x1540 — pairs on a
// regular 0x20 grid. Treating it as a call to addField would be a fabrication.
//
// -----------------------------------------------------------------------------
// HGToneCurve::State CONSTANT SLOTS (offsets are the ground truth; the names
// below describe the ROLE each slot plays in THIS kernel's arithmetic)
// -----------------------------------------------------------------------------
// The State object is the 32-byte-over-aligned uniform block HGToneCurve owns at
// its +0x1b0 (see raw-port/src/render/HGToneCurve.ts, which deliberately leaves
// the State layout opaque). Every access here is a 32-byte (ymm) or 16-byte
// (xmm) load of a splatted f32 constant vector, so this port indexes the State
// as an f32 array and reads LANE j of the slot for lane j — never a broadcast
// of lane 0, which would be an assumption the binary does not make.
//
//   +0x00a0  domain high clamp   vminps    @0x29d4d6 / @0x29d585 / @0x29d61c
//   +0x0940  domain low clamp    vmaxps    @0x29d4ce / @0x29d57d / @0x29d614
//   +0x13e0  linear-segment gain vmulps    @0x29d4c6 / @0x29d575 / @0x29d65c
//   +0x1400  linear/curve split  vcmpltps  @0x29d4e2 / @0x29d58d / @0x29d66c
//   +0x14a0  poly coeff a (·s)   vmulps    @0x29d4eb / @0x29d59a / @0x29d628
//   +0x14c0  poly coeff b (+)    vaddps    @0x29d4f3 / @0x29d5a2 / @0x29d630
//   +0x14e0  poly coeff c (·s)   vmulps    @0x29d4fb / @0x29d5aa / @0x29d638
//   +0x1500  poly coeff d (+)    vaddps    @0x29d503 / @0x29d5b2 / @0x29d640
//   +0x1520  poly coeff e (·s)   vmulps    @0x29d50b / @0x29d5ba / @0x29d648
//   +0x1540  poly coeff f (+)    vaddps    @0x29d513 / @0x29d5c2 / @0x29d650
//   +0x1560  poly bias  g (+)    vaddps    @0x29d52f / @0x29d5de / @0x29d67d
//
// -----------------------------------------------------------------------------
// HGTile FIELDS READ (contract file: raw-port/src/render/HGTile.ts)
// -----------------------------------------------------------------------------
//   +0x00 left / +0x04 top / +0x08 right / +0x0c bottom  @0x29d457..@0x29d467
//   +0x10 outSlot  (dst pixels)                          @0x29d46e
//   +0x18 outStride (pixels/row, then `shlq $0x4` = ×16 bytes) @0x29d472/@0x29d488
//   +0x50 texPlanes[0].pixels (src)                      @0x29d46a
//   +0x58 texPlanes[0].stride (pixels/row, then `shlq $0x4`)   @0x29d476/@0x29d484
// The third parameter (`HGNode*`, %rdx) is NEVER read: %rdx is overwritten with
// the output pointer at @0x29d46e before any use. It is kept in the signature
// because it is part of the kernel's ABI slot in HGToneCurve's program table.
//
// NUMERICS: every lane op is single-precision (`vmulps`/`vaddps`/`vsqrtps`/…),
// so every TS expression is wrapped in Math.fround per the spec's Rule 4.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE — bit-exact differential against the LIVE x86_64 kernel
// -----------------------------------------------------------------------------
// The symbol has internal linkage, so it cannot be dlsym'd; it was called
// directly at `_dyld_get_image_vmaddr_slide(Helium) + 0x29d450`, with the slide
// arithmetic validated first by requiring
// `dlsym("__ZN17HGParamBufferDesc8addFieldE5HGRefI12HGParamFieldE") == slide + 0x14c0`
// (the same 0x14c0 the otool artifact above names — which is exactly why it can
// serve as the probe). The harness runs under Rosetta —
// `arch -x86_64 /usr/bin/python3` — and refuses to run when
// `platform.machine() != "x86_64"`, because on the native arm64 slice the
// comparison would be against code this port did not transcribe (OPS_LOG.md
// open item #1: a silent false VERIFIED).
//
// Inputs: a synthetic `HGToneCurve::State` whose 11 slots are filled per lane
// (never broadcast from lane 0, so a lane-indexing error cannot hide), plus
// random f32 source pixels; 48 cases over widths {0,1,2,3,4,5,7,8,9} × heights
// {0,1,2,3,4,5} × two stride paddings × {sRGB-like, wide-fuzz} constants, which
// covers all three copies (A: even runs, B: odd tail, C: width==1) and both
// early-return paths.
//
// RESULT: 2,992 output f32 compared as raw uint32 bit patterns, 0 divergences.
// 2,096 of those were actually written by FCP; the remaining 896 are the
// stride padding outside the tile, which both the binary and this port leave
// untouched (so the match is not vacuous).

/**
 * Byte offsets of the `HGToneCurve::State` constant slots this kernel reads.
 * Each value is the literal disp32 of the instruction cited beside it.
 *
 * @0xADDR Helium 0x29d450
 */
/** State +0xa0 — upper clamp of the curve domain (`vminps`). @0xADDR Helium 0x29d4d6 */
export const SRGB_HALF_SAT_STATE_DOMAIN_HI = 0xa0 as const;
/** State +0x940 — lower clamp of the curve domain (`vmaxps`). @0xADDR Helium 0x29d4ce */
export const SRGB_HALF_SAT_STATE_DOMAIN_LO = 0x940 as const;
/** State +0x13e0 — gain of the linear segment (`vmulps`). @0xADDR Helium 0x29d4c6 */
export const SRGB_HALF_SAT_STATE_LINEAR_GAIN = 0x13e0 as const;
/** State +0x1400 — linear/curve split point (`vcmpltps`). @0xADDR Helium 0x29d4e2 */
export const SRGB_HALF_SAT_STATE_SPLIT = 0x1400 as const;
/** State +0x14a0 — polynomial coefficient a, multiplied by sqrt(t). @0xADDR Helium 0x29d4eb */
export const SRGB_HALF_SAT_STATE_POLY_A = 0x14a0 as const;
/** State +0x14c0 — polynomial coefficient b, added to a·sqrt(t). @0xADDR Helium 0x29d4f3 */
export const SRGB_HALF_SAT_STATE_POLY_B = 0x14c0 as const;
/** State +0x14e0 — polynomial coefficient c, multiplied by sqrt(t). @0xADDR Helium 0x29d4fb */
export const SRGB_HALF_SAT_STATE_POLY_C = 0x14e0 as const;
/** State +0x1500 — polynomial coefficient d, added to c·sqrt(t). @0xADDR Helium 0x29d503 */
export const SRGB_HALF_SAT_STATE_POLY_D = 0x1500 as const;
/** State +0x1520 — polynomial coefficient e, multiplied by sqrt(t). @0xADDR Helium 0x29d50b */
export const SRGB_HALF_SAT_STATE_POLY_E = 0x1520 as const;
/** State +0x1540 — polynomial coefficient f, added to e·sqrt(t). @0xADDR Helium 0x29d513 */
export const SRGB_HALF_SAT_STATE_POLY_F = 0x1540 as const;
/** State +0x1560 — polynomial bias g, added last. @0xADDR Helium 0x29d52f */
export const SRGB_HALF_SAT_STATE_POLY_G = 0x1560 as const;

/**
 * The `HGTile*` (%rdi) view this kernel needs, in the same shape the landed
 * RenderTile ports use: typed array + element offset + row stride in f32
 * elements. One RGBA pixel is 4 f32 (16 bytes), which is why the disasm turns a
 * pixel stride into a byte stride with `shlq $0x4` (@0x29d484/@0x29d488).
 *
 * Field-by-field provenance is in the header block; the authoritative layout is
 * raw-port/src/render/HGTile.ts.
 *
 * @0xADDR Helium 0x29d457
 */
export interface Getsrgb_half_sat_unpremultTileView {
  /** HGTile +0x00 `left`. @0xADDR Helium 0x29d467 */
  x0: number;
  /** HGTile +0x04 `top`. @0xADDR Helium 0x29d45a */
  y0: number;
  /** HGTile +0x08 `right`. @0xADDR Helium 0x29d463 */
  x1: number;
  /** HGTile +0x0c `bottom`. @0xADDR Helium 0x29d457 */
  y1: number;
  /** HGTile +0x10 `outSlot` — destination pixels. @0xADDR Helium 0x29d46e */
  dstPtr: Float32Array;
  /** Element index of the tile's first destination pixel within `dstPtr`. */
  dstOffset: number;
  /** HGTile +0x18 `outStride`, in PIXELS per row (×4 f32 here). @0xADDR Helium 0x29d472 */
  dstRowStride: number;
  /** HGTile +0x50 `texPlanes[0].pixels` — source pixels. @0xADDR Helium 0x29d46a */
  srcPtr: Float32Array;
  /** Element index of the tile's first source pixel within `srcPtr`. */
  srcOffset: number;
  /** HGTile +0x58 `texPlanes[0].stride`, in PIXELS per row. @0xADDR Helium 0x29d476 */
  srcRowStride: number;
}

/**
 * Opaque forward reference to Helium's `HGNode` — the third parameter, which
 * this kernel never dereferences (%rdx is clobbered at @0x29d46e).
 *
 * @0xADDR Helium 0x29d46e
 */
export interface HGNodeRef {
  readonly __hgNode: unique symbol;
}

/**
 * `Getsrgb_half_sat_unpremultTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)`
 * @Helium 0x29d450.
 *
 * @param tile   %rdi — the tile whose bounds/planes drive the loops.
 * @param state  %rsi — `HGToneCurve::State*`, read as an f32 array of splatted
 *               constant slots (element index = byte offset / 4).
 * @param _node  %rdx — never read; see the header note.
 *
 * Returns void: the epilogue @0x29d6a3 is `vzeroupper; popq %rbx; popq %r14;
 * popq %rbp; retq` with no value placed in %eax on any path (the %eax uses
 * inside are the row counter, not a result).
 *
 * @0xADDR Helium 0x29d450
 */
export function Getsrgb_half_sat_unpremultTile_AVX(
  tile: Getsrgb_half_sat_unpremultTileView,
  state: Float32Array,
  _node: HGNodeRef | null,
): void {
  // @0x29d457 movl 0xc(%rdi),%eax ; @0x29d45a subl 0x4(%rdi),%eax  -> height
  const height = (tile.y1 - tile.y0) | 0;
  // @0x29d45d jle 0x29d6a3 — empty tile falls straight to the epilogue.
  if (height <= 0) return;

  // @0x29d463 movl 0x8(%rdi),%r9d ; @0x29d467 subl (%rdi),%r9d     -> width
  const width = (tile.x1 - tile.x0) | 0;

  // @0x29d46a movq 0x50(%rdi),%rcx  -> src pixel cursor (%rcx)
  let srcRow = tile.srcOffset;
  // @0x29d46e movq 0x10(%rdi),%rdx  -> dst pixel cursor (%rdx); this is the
  // instruction that discards the HGNode* argument.
  let dstRow = tile.dstOffset;
  // @0x29d472 movslq 0x18(%rdi),%r8  then @0x29d488/@0x29d60b shlq $0x4,%r8
  //   -> destination row stride: pixels ×16 bytes = ×4 f32 elements.
  const dstRowElems = ((tile.dstRowStride | 0) * 4) | 0;
  // @0x29d476 movslq 0x58(%rdi),%rdi then @0x29d484/@0x29d607 shlq $0x4,%rdi
  const srcRowElems = ((tile.srcRowStride | 0) * 4) | 0;

  // Element indices of the State constant slots (byte offset / 4).
  const kDomainHi = SRGB_HALF_SAT_STATE_DOMAIN_HI >> 2;
  const kDomainLo = SRGB_HALF_SAT_STATE_DOMAIN_LO >> 2;
  const kLinearGain = SRGB_HALF_SAT_STATE_LINEAR_GAIN >> 2;
  const kSplit = SRGB_HALF_SAT_STATE_SPLIT >> 2;
  const kPolyA = SRGB_HALF_SAT_STATE_POLY_A >> 2;
  const kPolyB = SRGB_HALF_SAT_STATE_POLY_B >> 2;
  const kPolyC = SRGB_HALF_SAT_STATE_POLY_C >> 2;
  const kPolyD = SRGB_HALF_SAT_STATE_POLY_D >> 2;
  const kPolyE = SRGB_HALF_SAT_STATE_POLY_E >> 2;
  const kPolyF = SRGB_HALF_SAT_STATE_POLY_F >> 2;
  const kPolyG = SRGB_HALF_SAT_STATE_POLY_G >> 2;

  // @0x29d47a cmpl $0x2,%r9d ; @0x29d47e jl 0x29d5fd — widths 0/1 take the
  // separate one-pixel-wide row loop (COPY C) below.
  if (width >= 2) {
    // @0x29d48c xorl %r10d,%r10d — row counter; the row body is entered by the
    // `jmp 0x29d4b2` @0x29d48f and re-entered from @0x29d4a0..@0x29d4ac.
    for (let row = 0; row < height; row += 1) {
      // @0x29d4b2 xorl %ebx,%ebx ; @0x29d4b4 xorl %r11d,%r11d
      let elem = 0; // %r11 as a byte offset, kept here in f32 elements
      let pixelsDone = 0; // -%ebx

      // ── COPY A — 256-bit body @0x29d4c0..@0x29d55e, 8 lanes = 2 pixels ────
      // A do/while: width >= 2 guarantees the first pass, and the back-edge
      // @0x29d55e re-enters while at least 2 more pixels remain.
      do {
        for (let j = 0; j < 8; j += 1) {
          // @0x29d4c0 vmovups (%rcx,%r11),%ymm0 — 8 source lanes (unaligned).
          const x = Math.fround(tile.srcPtr[srcRow + elem + j]);
          // @0x29d4c6 vmulps 0x13e0(%rsi),%ymm0,%ymm1 — the linear segment.
          const lin = Math.fround(x * Math.fround(state[kLinearGain + j]));
          // @0x29d4ce vmaxps 0x940(%rsi),%ymm0,%ymm2 -> (x > lo) ? x : lo
          const lo = Math.fround(state[kDomainLo + j]);
          let t = x > lo ? x : lo;
          // @0x29d4d6 vminps 0xa0(%rsi),%ymm2,%ymm2 -> (t < hi) ? t : hi
          const hi = Math.fround(state[kDomainHi + j]);
          t = t < hi ? t : hi;
          // @0x29d4de vsqrtps %ymm2,%ymm3
          const s = Math.fround(Math.sqrt(t));
          // @0x29d4e2 vcmpltps 0x1400(%rsi),%ymm2,%ymm4 -> t < split
          const takeLinear = t < Math.fround(state[kSplit + j]);
          // @0x29d4eb vmulps 0x14a0(%rsi),%ymm3,%ymm5
          // @0x29d4f3 vaddps 0x14c0(%rsi),%ymm5,%ymm5   (see the otool note)
          let acc = Math.fround(
            Math.fround(s * Math.fround(state[kPolyA + j])) + Math.fround(state[kPolyB + j]),
          );
          // @0x29d4fb vmulps 0x14e0(%rsi),%ymm3,%ymm6
          // @0x29d503 vaddps 0x1500(%rsi),%ymm6,%ymm6
          const cd = Math.fround(
            Math.fround(s * Math.fround(state[kPolyC + j])) + Math.fround(state[kPolyD + j]),
          );
          // @0x29d50b vmulps 0x1520(%rsi),%ymm3,%ymm7
          // @0x29d513 vaddps 0x1540(%rsi),%ymm7,%ymm7
          const ef = Math.fround(
            Math.fround(s * Math.fround(state[kPolyE + j])) + Math.fround(state[kPolyF + j]),
          );
          // @0x29d51b vmulps %ymm5,%ymm2,%ymm5 ; @0x29d51f vaddps %ymm6,%ymm5,%ymm5
          acc = Math.fround(Math.fround(t * acc) + cd);
          // @0x29d523 vmulps %ymm5,%ymm2,%ymm2 ; @0x29d527 vaddps %ymm7,%ymm2,%ymm2
          acc = Math.fround(Math.fround(t * acc) + ef);
          // @0x29d52b vmulps %ymm2,%ymm3,%ymm2 ; @0x29d52f vaddps 0x1560(%rsi),%ymm2,%ymm2
          acc = Math.fround(Math.fround(s * acc) + Math.fround(state[kPolyG + j]));
          // @0x29d537 vblendvps %ymm4,%ymm1,%ymm2,%ymm1 -> mask ? lin : poly
          const blended = takeLinear ? lin : acc;
          // @0x29d53d vblendps $0x88,%ymm0,%ymm1,%ymm0 -> lanes 3 and 7 keep x.
          const outLane = j === 3 || j === 7 ? x : blended;
          // @0x29d543 vmovups %ymm0,(%rdx,%r11)
          tile.dstPtr[dstRow + elem + j] = outLane;
        }
        // @0x29d549 addq $0x20,%r11 — advance 32 bytes = 8 f32 = 2 pixels.
        elem += 8;
        // @0x29d54d..@0x29d556 the loop counter: %r14d = %ebx + width - 2 with
        // %ebx decremented by 2 each pass, i.e. %r14d = pixels still to do.
        pixelsDone += 2;
        // @0x29d55a cmpl $0x1,%r14d ; @0x29d55e jg 0x29d4c0
      } while (width - pixelsDone > 1);

      // @0x29d564 negl %ebx ; @0x29d566 cmpl %ebx,%r9d ; @0x29d569 jle 0x29d4a0
      //   -> `width <= pixelsDone` skips the tail and advances the row.
      if (width > pixelsDone) {
        // ── COPY B — 128-bit odd-pixel tail @0x29d56f..@0x29d5f8, 4 lanes ──
        for (let j = 0; j < 4; j += 1) {
          // @0x29d56f vmovaps (%rcx,%r11),%xmm0 (aligned load)
          const x = Math.fround(tile.srcPtr[srcRow + elem + j]);
          // @0x29d575 vmulps 0x13e0(%rsi),%xmm0,%xmm1
          const lin = Math.fround(x * Math.fround(state[kLinearGain + j]));
          // @0x29d57d vmaxps 0x940(%rsi),%xmm0,%xmm2
          const lo = Math.fround(state[kDomainLo + j]);
          let t = x > lo ? x : lo;
          // @0x29d585 vminps 0xa0(%rsi),%xmm2,%xmm2
          const hi = Math.fround(state[kDomainHi + j]);
          t = t < hi ? t : hi;
          // @0x29d58d vcmpltps 0x1400(%rsi),%xmm2,%xmm3 (mask computed BEFORE
          // the sqrt in this copy — no arithmetic consequence, noted for the
          // line-by-line diff).
          const takeLinear = t < Math.fround(state[kSplit + j]);
          // @0x29d596 vsqrtps %xmm2,%xmm4
          const s = Math.fround(Math.sqrt(t));
          // @0x29d59a vmulps 0x14a0(%rsi),%xmm4,%xmm5
          // @0x29d5a2 vaddps 0x14c0(%rsi),%xmm5,%xmm5
          let acc = Math.fround(
            Math.fround(s * Math.fround(state[kPolyA + j])) + Math.fround(state[kPolyB + j]),
          );
          // @0x29d5aa vmulps 0x14e0(%rsi),%xmm4,%xmm6 ; @0x29d5b2 vaddps 0x1500(%rsi),%xmm6,%xmm6
          const cd = Math.fround(
            Math.fround(s * Math.fround(state[kPolyC + j])) + Math.fround(state[kPolyD + j]),
          );
          // @0x29d5ba vmulps 0x1520(%rsi),%xmm4,%xmm7 ; @0x29d5c2 vaddps 0x1540(%rsi),%xmm7,%xmm7
          const ef = Math.fround(
            Math.fround(s * Math.fround(state[kPolyE + j])) + Math.fround(state[kPolyF + j]),
          );
          // @0x29d5ca vmulps %xmm5,%xmm2,%xmm5 ; @0x29d5ce vaddps %xmm6,%xmm5,%xmm5
          acc = Math.fround(Math.fround(t * acc) + cd);
          // @0x29d5d2 vmulps %xmm5,%xmm2,%xmm2 ; @0x29d5d6 vaddps %xmm7,%xmm2,%xmm2
          acc = Math.fround(Math.fround(t * acc) + ef);
          // @0x29d5da vmulps %xmm2,%xmm4,%xmm2 ; @0x29d5de vaddps 0x1560(%rsi),%xmm2,%xmm2
          acc = Math.fround(Math.fround(s * acc) + Math.fround(state[kPolyG + j]));
          // @0x29d5e6 vblendvps %xmm3,%xmm1,%xmm2,%xmm1
          const blended = takeLinear ? lin : acc;
          // @0x29d5ec vblendps $0x8,%xmm0,%xmm1,%xmm0 -> lane 3 keeps x (alpha).
          const outLane = j === 3 ? x : blended;
          // @0x29d5f2 vmovaps %xmm0,(%rdx,%r11)
          tile.dstPtr[dstRow + elem + j] = outLane;
        }
        // @0x29d5f8 jmp 0x29d4a0 — fall into the row advance.
      }

      // @0x29d4a0 incl %r10d ; @0x29d4a3 addq %rdi,%rcx ; @0x29d4a6 addq %r8,%rdx
      // @0x29d4a9 cmpl %eax,%r10d ; @0x29d4ac je 0x29d6a3
      srcRow += srcRowElems;
      dstRow += dstRowElems;
    }
    return;
  }

  // @0x29d5fd cmpl $0x1,%r9d ; @0x29d601 jne 0x29d6a3 — width 0 (or negative)
  // returns without touching a pixel; only width == 1 runs COPY C.
  if (width !== 1) return;

  // ── COPY C — one-pixel-wide tile, 128-bit row loop @0x29d610..@0x29d69d ────
  // @0x29d607 shlq $0x4,%rdi ; @0x29d60b shlq $0x4,%r8 (same stride scaling).
  for (let row = 0; row < height; row += 1) {
    for (let j = 0; j < 4; j += 1) {
      // @0x29d610 vmovaps (%rcx),%xmm0
      const x = Math.fround(tile.srcPtr[srcRow + j]);
      // @0x29d614 vmaxps 0x940(%rsi),%xmm0,%xmm1
      const lo = Math.fround(state[kDomainLo + j]);
      let t = x > lo ? x : lo;
      // @0x29d61c vminps 0xa0(%rsi),%xmm1,%xmm1
      const hi = Math.fround(state[kDomainHi + j]);
      t = t < hi ? t : hi;
      // @0x29d624 vsqrtps %xmm1,%xmm2
      const s = Math.fround(Math.sqrt(t));
      // @0x29d628 vmulps 0x14a0(%rsi),%xmm2,%xmm3 ; @0x29d630 vaddps 0x14c0(%rsi),%xmm3,%xmm3
      let acc = Math.fround(
        Math.fround(s * Math.fround(state[kPolyA + j])) + Math.fround(state[kPolyB + j]),
      );
      // @0x29d638 vmulps 0x14e0(%rsi),%xmm2,%xmm4 ; @0x29d640 vaddps 0x1500(%rsi),%xmm4,%xmm4
      const cd = Math.fround(
        Math.fround(s * Math.fround(state[kPolyC + j])) + Math.fround(state[kPolyD + j]),
      );
      // @0x29d648 vmulps 0x1520(%rsi),%xmm2,%xmm5 ; @0x29d650 vaddps 0x1540(%rsi),%xmm5,%xmm5
      const ef = Math.fround(
        Math.fround(s * Math.fround(state[kPolyE + j])) + Math.fround(state[kPolyF + j]),
      );
      // @0x29d658 vmulps %xmm3,%xmm1,%xmm3
      acc = Math.fround(t * acc);
      // @0x29d65c vmulps 0x13e0(%rsi),%xmm0,%xmm6 — the linear segment (hoisted
      // between the polynomial steps in this copy; same value as COPY A/B).
      const lin = Math.fround(x * Math.fround(state[kLinearGain + j]));
      // @0x29d664 vaddps %xmm4,%xmm3,%xmm3
      acc = Math.fround(acc + cd);
      // @0x29d668 vmulps %xmm3,%xmm1,%xmm3
      acc = Math.fround(t * acc);
      // @0x29d66c vcmpltps 0x1400(%rsi),%xmm1,%xmm1 — t < split (t is dead after
      // this point in the binary, which reuses %xmm1 for the mask).
      const takeLinear = t < Math.fround(state[kSplit + j]);
      // @0x29d675 vaddps %xmm5,%xmm3,%xmm3
      acc = Math.fround(acc + ef);
      // @0x29d679 vmulps %xmm3,%xmm2,%xmm2 ; @0x29d67d vaddps 0x1560(%rsi),%xmm2,%xmm2
      acc = Math.fround(Math.fround(s * acc) + Math.fround(state[kPolyG + j]));
      // @0x29d685 vblendvps %xmm1,%xmm6,%xmm2,%xmm1 -> mask ? lin : poly
      const blended = takeLinear ? lin : acc;
      // @0x29d68b vblendps $0x8,%xmm0,%xmm1,%xmm0 -> lane 3 keeps x (alpha).
      const outLane = j === 3 ? x : blended;
      // @0x29d691 vmovaps %xmm0,(%rdx)
      tile.dstPtr[dstRow + j] = outLane;
    }
    // @0x29d695 addq %rdi,%rcx ; @0x29d698 addq %r8,%rdx ; @0x29d69b decl %eax
    srcRow += srcRowElems;
    dstRow += dstRowElems;
    // @0x29d69d jne 0x29d610 — loop until the row counter hits zero.
  }
  // @0x29d6a3 vzeroupper ; @0x29d6a6..@0x29d6aa epilogue ; retq
}
