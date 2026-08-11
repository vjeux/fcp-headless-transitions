// raw-port/src/render/HgcBilateralFilterInterpSC_InterpolatorLastZ.ts
//
// FCP `HgcBilateralFilterInterpSC_InterpolatorLastZ` — Helium HGNode subclass
// implementing the FINAL / LAST-Z bin of a single-channel bilateral-filter
// interpolator. The sibling class `HgcBilateralFilterInterpSC_InterpolatorLastX`
// (raw-port/src/render/HgcBilateralFilterInterpSC_InterpolatorLastX.ts) is the
// same filter operating on channel .x; this one operates on channel .z, and the
// difference is visible in the machine code as the blend immediate (0x44 / 0x4
// selects lane 2 of each 4-float pixel) and in the indicator constant its ctor
// installs ({0,0,1,0} rather than {1,0,0,0}).
//
// THIS UNIT PORTS ONE SYMBOL: `RenderTile_AVX(HGTile*)` @Helium 0x312fb0, the
// 142-line AVX (VEX.256) tile kernel. The class's other members
// (ctor/dtor/RenderTile/GetProgram/SetParameter/...) are separate queue units and
// are NOT declared here — this file claims only what it transcribes.
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//   (x86_64 slice; every @0xADDR below is an x86_64 vmaddr)
//
// Source disassembly:
//   raw-port/re/disasm/
//     Helium.__ZN44HgcBilateralFilterInterpSC_InterpolatorLastZ14RenderTile_AVXEP6HGTile.s
//     (142 lines)
//
// ── STRUCT LAYOUT: the params block at this+0x198 ───────────────────────
// Recovered from the C2 ctor @Helium 0x3134f0 (NOT ported here — read only to
// ground the offsets this kernel loads). The ctor allocates 0xc7 = 199 raw bytes
// via `__Znam` @0x31350e, aligns to 32 bytes, stores the aligned pointer at
// this+0x198 @0x31357f, and fills TEN vec4 slots — each constant written TWICE,
// into adjacent slots, which is what lets this AVX kernel read them as 32-byte
// operands:
//
//   slot 0 @+0x00 : {p.x, p.y, p.z, p.w}   zeroed by the ctor @0x31352b; SetParameter's target
//   slot 1 @+0x10 : duplicate of slot 0    @0x313530
//   slot 2 @+0x20 : {0, 0, 1.0f, 0}        @0x313541, from rodata @Helium 0x3caa70
//   slot 3 @+0x30 : duplicate of slot 2    @0x31353c
//   slot 4 @+0x40 : {1e-6f ×4}             @0x313552, from rodata @Helium 0x3cb0b0
//   slot 5 @+0x50 : duplicate of slot 4    @0x31354d
//   slot 6 @+0x60 : {1.0002442598f ×4}     @0x313563, from rodata @Helium 0x85fed0
//   slot 7 @+0x70 : duplicate of slot 6    @0x31355e
//   slot 8 @+0x80 : {0, 0, 0xffffffff, 0}  @0x31356f, from rodata @Helium 0x88d620
//   slot 9 @+0x90 : duplicate of slot 8    @0x313577
//
// The four rodata blocks were read out of the LIVE image rather than inferred:
//   0x3caa70  00000000 00000000 0000803f 00000000   -> {0, 0, 1.0, 0}
//   0x3cb0b0  bd378635 ×4                           -> {1e-6, 1e-6, 1e-6, 1e-6}
//   0x85fed0  0108803f ×4                           -> {1.0002442598, ...} = 1 + 2^-12 + 2^-23
//   0x88d620  00000000 00000000 ffffffff 00000000   -> lane mask keeping .z
// This kernel reads slots 0/1 (as one 32-byte operand @0x3130db), 2/3 (@0x313098),
// 4/5 (@0x3130a9) and 6/7 (@0x3130af). Slots 8/9 are used by other members.
//
// ── TILE MEMORY LAYOUT (the fields this kernel reads from HGTile*) ──────
//   +0x00 int    left        window is [left,right) × [top,bottom)
//   +0x04 int    top
//   +0x08 int    right
//   +0x0c int    bottom
//   +0x10 void*  destBase    output, 16 bytes per pixel (4×f32)
//   +0x18 int    destStride  in PIXELS; the kernel shifts it left by 4 to get bytes
//   +0x50 void*  tex0Base    source pixel                 (+0x58 stride)
//   +0x60 void*  tex1Base    neighbour bin A, premultiplied (+0x68 stride)
//   +0x70 void*  tex2Base    neighbour bin B, premultiplied (+0x78 stride)
//   +0x80 void*  tex3Base    running accumulator          (+0x88 stride)
// Identical to the map the LastX port recovered from its own RenderTile.
//
// ── PIXEL MATH ──────────────────────────────────────────────────────────
// Per pixel, with p = params slot 0 and t0..t3 the four textures:
//   clampedZ  = MIN(p.y, t0.z)                       ; vminps + vblendps (lane 2)
//   inBin     = (p.x <= clampedZ) ? 1.0f : 0.0f      ; vcmpleps + vandps {0,0,1,0}
//   unpremulA = t1.z * (1.0002442598 * RCP(MAX(t1.w, 1e-6)))
//   unpremulB = t2.z * (1.0002442598 * RCP(MAX(t2.w, 1e-6)))
//   weight    = clampedZ * p.z + p.w
//   mixed     = unpremulA + (unpremulB - unpremulA) * weight
//   out.z     = t3.z + mixed * inBin
//   out.xyw   = t0.xyw                               ; the blend keeps lane 2 only
// which is the .z-channel form of the shader the sibling class documents.
//
// ── WHAT RCP() IS, AND WHAT THE PORT DOES ABOUT IT ──────────────────────
// `vrcpps` @0x3130b9 / @0x3130d3 (and @0x313193 / @0x3131a7 in the tail) is the
// hardware reciprocal ESTIMATE: its only architectural guarantee is
// |relative error| <= 1.5*2^-12, and the exact bit pattern is
// implementation-defined, so it cannot be reproduced portably. This port computes
// the IEEE-754 reciprocal instead — the same modelling choice, for the same
// instruction, that the landed `Gettype1_half_satTile_AVX` port made and recorded.
// Note what sits next to it: the multiply by 1.0002442598 = 1 + 2^-12 + 2^-23
// @0x3130bd is the compiler compensating for the estimate's error bound, not a
// term of the filter, and there is no Newton step anywhere in this body to refine
// it. The size of the resulting deviation is MEASURED, not asserted, in
// raw-port/re/oracle/HgcBilateralFilterInterpSC_InterpolatorLastZ_RenderTile_AVX_oracle.py.
//
// ── WHAT THE DIFFERENTIAL MEASURED ──────────────────────────────────────
// The kernel was CALLED, not read: the local (`t`) symbol is reached at
// slide + 0x312fb0 with the first fourteen bytes checked against the encoding of
// its own first three instructions, under `arch -x86_64 /usr/bin/python3`.
//
//   whole tiles, 72 of them, widths 1..9 x heights 1..2, compared as u32 BIT
//   PATTERNS: 2,160 lanes, 2,046 bit-exact, 0 differences outside the .z lane
//   class norcp (t1.z = t2.z = 0, so the reciprocal cannot reach the output):
//     540 / 540 bit-exact — the whole kernel except the estimate is exact
//   class dupslots (the params duplicates given DIFFERENT values): the port
//     tracks the machine, which is what proves the 32-byte operands are read as
//     32 contiguous bytes rather than one broadcast slot
//   the machine's own `vrcpps`, measured directly by setting the correction slot
//     to 1.0: worst relative error 2.442e-04 against the VRCPPS guarantee of
//     1.5*2^-12 = 3.662e-04, every estimate with its low mantissa bits cleared
//   five mutants of this file, all killed: blend lane 0 instead of lane 2 (64/72
//     tiles), correction constant dropped (23/72), vmovshdup reading .z instead
//     of .w (24/72), vminps operands swapped (18/72), the 32-byte operand folded
//     to one 16-byte slot (5/72)
//
// So the 114 differing lanes are the reciprocal estimate and nothing else, and
// they are confined to the one channel this filter writes.
//
// ── PORT STATUS ─────────────────────────────────────────────────────────
// FULL TRANSCRIPTION of RenderTile_AVX @0x312fb0: every instruction of the
// prologue, the row loop, the 2-pixel VEX.256 body, the 1-pixel VEX.128 tail and
// the epilogue has a counterpart below. No stubs, no externs, no indirect calls —
// the body calls nothing at all.

/** `Math.fround` — every value below is an f32, as in the machine. */
const f32 = Math.fround;

/**
 * `HGTile` — the kernel's argument (%rsi). Only the fields this body reads are
 * modelled; see the TILE MEMORY LAYOUT map in the header for the offsets.
 *
 * The four texture bases and the destination are `Float32Array`s because a pixel
 * is 16 bytes = 4 f32s; the strides stay in PIXELS, exactly as the struct holds
 * them, and are converted where the machine converts them (`shlq $0x4`).
 */
export interface HGTile {
  readonly left: number; //         @+0x00 int
  readonly top: number; //          @+0x04 int
  readonly right: number; //        @+0x08 int
  readonly bottom: number; //       @+0x0c int
  readonly destBase: Float32Array; //  @+0x10 void*
  readonly destStride: number; //      @+0x18 int (pixels)
  readonly tex0Base: Float32Array; //  @+0x50 void*
  readonly tex0Stride: number; //      @+0x58 int (pixels)
  readonly tex1Base: Float32Array; //  @+0x60 void*
  readonly tex1Stride: number; //      @+0x68 int (pixels)
  readonly tex2Base: Float32Array; //  @+0x70 void*
  readonly tex2Stride: number; //      @+0x78 int (pixels)
  readonly tex3Base: Float32Array; //  @+0x80 void*
  readonly tex3Stride: number; //      @+0x88 int (pixels)
}

/**
 * `vminps` lane semantics, Intel operand order: `MIN(SRC1, SRC2)` is
 * `SRC1 < SRC2 ? SRC1 : SRC2`, so SRC2 is returned when the two are equal and
 * whenever either is NaN. The AT&T text at @0x313084 is
 * `vminps %ymm0, %ymm1, %ymm1`, i.e. SRC1 = ymm1 (the broadcast p.y) and
 * SRC2 = ymm0 (the source pixel) — the operand order matters for -0.0 and NaN
 * and is preserved at the call site.
 */
function minps(src1: number, src2: number): number {
  return f32(src1) < f32(src2) ? f32(src1) : f32(src2);
}

/**
 * `vmaxps` lane semantics, Intel operand order: `MAX(SRC1, SRC2)` is
 * `SRC1 > SRC2 ? SRC1 : SRC2` — again SRC2 on ties and on NaN. Cited
 * @0x3130b5 / @0x3130cf (wide path) and @0x31318f / @0x3131a3 (tail).
 */
function maxps(src1: number, src2: number): number {
  return f32(src1) > f32(src2) ? f32(src1) : f32(src2);
}

/**
 * `vrcpps` — the hardware reciprocal ESTIMATE, cited @0x3130b9 / @0x3130d3
 * (wide) and @0x313193 / @0x3131a7 (tail).
 *
 * This is NOT the instruction. `VRCPPS` guarantees only
 * |relative error| <= 1.5*2^-12 and its exact result is implementation-defined,
 * so this computes the IEEE-754 f32 reciprocal — the same choice, for the same
 * instruction, recorded in the landed `Gettype1_half_satTile_AVX` port. There is
 * no Newton step at either call site to refine the estimate: the next
 * instruction is the multiply by the 1 + 2^-12 + 2^-23 correction constant
 * @0x3130bd, which is the compiler compensating for the estimate rather than a
 * term of the filter.
 *
 * The deviation this introduces is measured lane by lane against the live kernel
 * in the oracle named in the file header, and it is confined to lanes downstream
 * of these four call sites.
 */
function rcpps(x: number): number {
  return f32(1.0 / f32(x));
}

/**
 * `vcmpleps` + `vandps <mem>` as one lane operation, cited @0x313093 + @0x313098
 * (wide) and @0x313177 + @0x31317c (tail).
 *
 * `CMPLEPS` is the ORDERED comparison: the lane mask is all-ones when
 * `SRC1 <= SRC2` and all-zeroes otherwise, including whenever either operand is
 * NaN. `vandps` then ANDs that mask with the constant, so the lane yields the
 * constant or +0.0 — a bitwise AND with an all-ones mask reproduces the constant
 * exactly, which is why this can be written as a select rather than as bit
 * arithmetic.
 */
function cmpleAnd(src1: number, src2: number, constant: number): number {
  return f32(src1) <= f32(src2) ? f32(constant) : 0;
}

/**
 * `HgcBilateralFilterInterpSC_InterpolatorLastZ` — see the file header.
 *
 * The class extends HGNode in FCP (the base occupies 0x198 bytes, which is why
 * the params pointer sits at +0x198). The base and every other member are
 * separate units; this file declares only the state this kernel reads.
 */
export class HgcBilateralFilterInterpSC_InterpolatorLastZ {
  /**
   * @Helium +0x198 — the 32-byte-aligned params block, loaded by this kernel at
   * @0x313077 (wide path, re-loaded on every iteration) and @0x31315b (tail).
   *
   * Ten vec4 slots = 40 f32s; see the STRUCT LAYOUT map in the file header. The
   * ctor @0x3134f0 is a separate unit and is not ported here, so the slots start
   * zeroed rather than carrying the constants that ctor installs.
   */
  public params: Float32Array = new Float32Array(40);

  /**
   * `HgcBilateralFilterInterpSC_InterpolatorLastZ::RenderTile_AVX(HGTile*)`
   *   — @Helium 0x312fb0
   *   — __ZN44HgcBilateralFilterInterpSC_InterpolatorLastZ14RenderTile_AVXEP6HGTile
   *
   * Line-for-line transcription of the 142-line body. Returns `int` 0
   * (`xorl %eax, %eax` @0x3131f5).
   *
   * PROLOGUE / SETUP
   *   0x312fb0  movl   0xc(%rsi), %r11d       ; r11d = tile.bottom
   *   0x312fb4  subl   0x4(%rsi), %r11d       ; r11d = bottom - top  = rows
   *   0x312fb8  jle    0x3131f2               ; rows <= 0 -> vzeroupper, return 0
   *   0x312fbe..0x312fca  push rbp/r15/r14/r13/r12/rbx
   *   0x312fcb  movl   0x8(%rsi), %ecx        ; ecx = tile.right
   *   0x312fce  subl   (%rsi), %ecx           ; ecx = right - left   = cols
   *   0x312fd0  movslq 0x18(%rsi), %r14       ; destStride  (pixels)
   *   0x312fd4  movq   0x10(%rsi), %r8        ; destBase
   *   0x312fd8  movq   0x50(%rsi), %r9        ; tex0Base
   *   0x312fdc  movq   0x80(%rsi), %r10       ; tex3Base
   *   0x312fe3  movslq 0x88(%rsi), %r12       ; tex3Stride
   *   0x312fea  movq   0x70(%rsi), %rbx       ; tex2Base
   *   0x312fee  movslq 0x78(%rsi), %rax       ; tex2Stride
   *   0x312ff2  movq   0x60(%rsi), %r15       ; tex1Base
   *   0x312ff6  movslq 0x68(%rsi), %rdx       ; tex1Stride
   *   0x312ffa  movslq 0x58(%rsi), %rsi       ; tex0Stride
   *   0x312ffe/0x313002/0x313006/0x31300e/0x313016  shlq $0x4, ...
   *                                            ; every stride PIXELS -> BYTES
   *   0x31301a  xorl   %r13d, %r13d           ; row = 0
   *   0x313021  jmp    0x31304d               ; enter the row body
   *
   * ROW ADVANCE (0x313030..0x313047), executed after each row:
   *   addq the five byte strides into their five base pointers, incl %r13d,
   *   and `cmpl %r11d, %r13d ; je 0x3131e8` — i.e. loop while row != rows.
   *
   * Each stride is `pixels << 4` bytes = `pixels * 4` f32 elements, which is the
   * `* 4` on the JS side; the pointers are modelled as element offsets into the
   * corresponding Float32Array.
   */
  RenderTile_AVX(tile: HGTile): number {
    // @0x312fb0-0x312fb8 — rows = bottom - top; a non-positive height returns
    // immediately, before the frame is even set up.
    const rows = (tile.bottom | 0) - (tile.top | 0);
    if (rows <= 0) {
      // @0x3131f2 vzeroupper ; @0x3131f5 xorl %eax,%eax ; @0x3131f7 retq
      return 0;
    }

    // @0x312fcb-0x312fce — cols = right - left.
    const cols = (tile.right | 0) - (tile.left | 0);

    // @0x312fd0-0x313016 — bases, and strides converted from pixels to bytes
    // (`shlq $0x4`) which is 4 f32 elements per pixel on this side.
    const dst = tile.destBase;
    const t0 = tile.tex0Base;
    const t1 = tile.tex1Base;
    const t2 = tile.tex2Base;
    const t3 = tile.tex3Base;
    const dstStride = (tile.destStride | 0) * 4; // %r14 @0x312ffe
    const t0Stride = (tile.tex0Stride | 0) * 4; //  %rsi @0x313016
    const t1Stride = (tile.tex1Stride | 0) * 4; //  %rdx @0x31300e
    const t2Stride = (tile.tex2Stride | 0) * 4; //  %rax @0x313006
    const t3Stride = (tile.tex3Stride | 0) * 4; //  %r12 @0x313002

    // The five moving base pointers (%r8, %r9, %r15, %rbx, %r10), as element
    // offsets. @0x31301a — the row counter %r13d.
    let dstOff = 0;
    let t0Off = 0;
    let t1Off = 0;
    let t2Off = 0;
    let t3Off = 0;

    for (let row = 0; row < rows; row++) {
      // @0x31304d  movl $0x0, %edx — the pixel cursor for this row.
      let px = 0;

      // @0x313052-0x313055  cmpl $0x2, %ecx ; jl 0x31313c — fewer than two
      // pixels in the row skips the VEX.256 body entirely.
      if (cols >= 2) {
        // @0x313064-0x313069  %rax = 0x10, %edx = 0. The loads below are written
        // `-0x10(%reg,%rax)`, so the first pair sits at byte offset 0; %rax
        // advances by 0x20 = 32 bytes = 2 pixels per iteration @0x313112.
        do {
          const p = this.params; // @0x313077 movq 0x198(%rdi), %r11 — re-loaded every iteration

          // The 32-byte operands the duplicated slots make possible:
          //   (%r11)      slots 0|1 -> {p.x,p.y,p.z,p.w, p.x,p.y,p.z,p.w}   @0x3130db
          //   0x20(%r11)  slots 2|3 -> {0,0,1,0, 0,0,1,0}                   @0x313098
          //   0x40(%r11)  slots 4|5 -> {1e-6 ×8}                            @0x3130a9
          //   0x60(%r11)  slots 6|7 -> {1.0002442598 ×8}                    @0x3130af
          const pX = f32(p[0]); // @0x31308e vbroadcastss (%r11)
          const pY = f32(p[1]); // @0x31307e vbroadcastss 0x4(%r11)
          const pW = f32(p[3]); // @0x3130e0 vbroadcastss 0xc(%r11)

          // Eight lanes = two pixels. Lane L belongs to pixel L>>2 and channel
          // L&3; the machine's lane indices are used directly so that the blend
          // immediates and `vmovshdup`'s [1,1,3,3,5,5,7,7] pattern read the same
          // here as in the disassembly.
          const base0 = t0Off + px * 4;
          const base1 = t1Off + px * 4;
          const base2 = t2Off + px * 4;
          const base3 = t3Off + px * 4;
          const baseD = dstOff + px * 4;

          for (let lane = 0; lane < 8; lane++) {
            // @0x313070  vmovups -0x10(%r9,%rax), %ymm0   ; ymm0 = t0
            const ymm0 = f32(t0[base0 + lane]);

            // @0x313084  vminps %ymm0, %ymm1, %ymm1       ; MIN(p.y, t0)
            // @0x313088  vblendps $0x44, %ymm1, %ymm0, %ymm1
            //            ; lanes 2 and 6 take the min, every other lane keeps t0
            const isZ = (lane & 3) === 2;
            const ymm1Blend = isZ ? minps(pY, ymm0) : ymm0;

            // @0x313093  vcmpleps %ymm1, %ymm2, %ymm2     ; p.x <= lane
            // @0x313098  vandps 0x20(%r11), %ymm2, %ymm2  ; & {0,0,1,0, 0,0,1,0}
            // The operand is 32 CONTIGUOUS bytes, i.e. slot 2 for lanes 0..3 and
            // slot 3 for lanes 4..7 — indexed as written rather than folded to
            // `lane & 3`, so the port reads the duplicate the way the machine does.
            const slot23Lane = f32(p[8 + lane]);
            const ymm2 = cmpleAnd(pX, ymm1Blend, slot23Lane);

            // @0x31309e  vmovups -0x10(%r15,%rax), %ymm3  ; ymm3 = t1
            // @0x3130a5  vmovshdup %ymm3, %ymm4           ; lane L takes lane L|1
            const ymm3 = f32(t1[base1 + lane]);
            const shdup3 = f32(t1[base1 + (lane | 1)]);

            // @0x3130a9  vmovups 0x40(%r11), %ymm5        ; 1e-6
            // @0x3130af  vmovups 0x60(%r11), %ymm6        ; 1.0002442598
            const eps = f32(p[16 + lane]); //  slots 4|5, 32 contiguous bytes
            const corr = f32(p[24 + lane]); // slots 6|7, 32 contiguous bytes

            // @0x3130b5  vmaxps %ymm5, %ymm4, %ymm4       ; MAX(shdup(t1), 1e-6)
            // @0x3130b9  vrcpps %ymm4, %ymm4
            // @0x3130bd  vmulps %ymm6, %ymm4, %ymm4       ; * correction
            // @0x3130c1  vmulps %ymm4, %ymm3, %ymm3       ; t1 * that
            const rcpA = f32(rcpps(maxps(shdup3, eps)) * corr);
            const unpremulA = f32(ymm3 * rcpA);

            // @0x3130c5  vmovups -0x10(%rbx,%rax), %ymm4  ; ymm4 = t2
            // @0x3130cb  vmovshdup %ymm4, %ymm7
            // @0x3130cf  vmaxps %ymm5, %ymm7, %ymm5
            // @0x3130d3  vrcpps %ymm5, %ymm5
            // @0x3130d7  vmulps %ymm5, %ymm6, %ymm5       ; correction * rcp
            // @0x3130e6  vmulps %ymm5, %ymm4, %ymm4       ; t2 * that
            const ymm4 = f32(t2[base2 + lane]);
            const shdup4 = f32(t2[base2 + (lane | 1)]);
            const rcpB = f32(corr * rcpps(maxps(shdup4, eps)));
            const unpremulB = f32(ymm4 * rcpB);

            // @0x3130db  vmulps (%r11), %ymm1, %ymm1      ; lane * p[lane&3]
            // @0x3130ea  vaddps %ymm6, %ymm1, %ymm1       ; + p.w
            const slot01Lane = f32(p[lane]); // slots 0|1, 32 contiguous bytes
            const weight = f32(f32(ymm1Blend * slot01Lane) + pW);

            // @0x3130ee  vsubps %ymm3, %ymm4, %ymm4       ; B - A
            // @0x3130f2  vmulps %ymm1, %ymm4, %ymm1       ; (B - A) * weight
            // @0x3130f6  vaddps %ymm1, %ymm3, %ymm1       ; A + that
            // @0x3130fa  vmulps %ymm1, %ymm2, %ymm1       ; * the in-bin indicator
            const mixed = f32(unpremulA + f32(f32(unpremulB - unpremulA) * weight));
            const gated = f32(mixed * ymm2);

            // @0x3130fe  vaddps -0x10(%r10,%rax), %ymm1, %ymm1   ; + accumulator
            const acc = f32(gated + f32(t3[base3 + lane]));

            // @0x313105  vblendps $0x44, %ymm1, %ymm0, %ymm0     ; keep lanes 2,6
            // @0x31310b  vmovups %ymm0, -0x10(%r8,%rax)
            dst[baseD + lane] = isZ ? acc : ymm0;
          }

          // @0x313112  addq $0x20, %rax                   ; advance two pixels
          px += 2;

          // @0x313116-0x313127
          //   movl %edx,%r11d ; addl $-0x2,%edx ; addl %ecx,%r11d
          //   addl $-0x2,%r11d ; cmpl $0x1,%r11d ; jg 0x313070
          // %edx counts DOWN by two per iteration, so with `px = -edx` the test
          // `cols + edx_old - 2 > 1` is `cols - px > 1`: keep going while at
          // least two pixels remain. The loop therefore leaves 0 or 1 pixel.
        } while (cols - px > 1);
        // @0x31312d  negl %edx — %edx becomes the pixel count just processed.
      }

      // @0x31313c-0x31313e  cmpl %ecx, %edx ; jge 0x313030 — the VEX.128 tail
      // runs for the single remaining pixel, if there is one.
      if (px < cols) {
        const p = this.params; // @0x31315b movq 0x198(%rdi), %rdx
        const pX = f32(p[0]); //  @0x313172 vbroadcastss (%rdx)
        const pY = f32(p[1]); //  @0x313162 vbroadcastss 0x4(%rdx)
        const pW = f32(p[3]); //  @0x3131b7 vbroadcastss 0xc(%rdx)

        // @0x313144-0x313146  movl %edx,%eax ; shlq $0x4,%rax — the byte offset
        // of the remaining pixel. The tail's loads and its store are `vmovaps`,
        // i.e. 16-byte ALIGNED accesses, unlike the wide path's `vmovups`.
        const base0 = t0Off + px * 4; // @0x31314a vmovaps (%r9,%rax), %xmm0
        const base1 = t1Off + px * 4; // @0x313150 vmovaps (%r15,%rax), %xmm1
        const base2 = t2Off + px * 4; // @0x313156 vmovaps (%rbx,%rax), %xmm2
        const base3 = t3Off + px * 4; // @0x3131d1 vaddps  (%r10,%rax), %xmm1
        const baseD = dstOff + px * 4; // @0x3131dd vmovaps %xmm0, (%r8,%rax)

        for (let lane = 0; lane < 4; lane++) {
          const xmm0 = f32(t0[base0 + lane]);

          // @0x313168  vminps %xmm0, %xmm3, %xmm3
          // @0x31316c  vblendps $0x4, %xmm3, %xmm0, %xmm3   ; lane 2 only
          const isZ = lane === 2;
          const xmm3Blend = isZ ? minps(pY, xmm0) : xmm0;

          // @0x313177  vcmpleps %xmm3, %xmm4, %xmm4
          // @0x31317c  vandps 0x20(%rdx), %xmm4, %xmm4
          const slot2Lane = f32(p[8 + lane]);
          const xmm4Mask = cmpleAnd(pX, xmm3Blend, slot2Lane);

          // @0x313181  vmovshdup %xmm1, %xmm5
          // @0x313185  vmovaps 0x40(%rdx), %xmm6            ; 1e-6
          // @0x31318a  vmovaps 0x60(%rdx), %xmm7            ; 1.0002442598
          // @0x31318f  vmaxps %xmm6, %xmm5, %xmm5
          // @0x313193  vrcpps %xmm5, %xmm5
          // @0x313197  vmulps %xmm7, %xmm5, %xmm5
          // @0x31319b  vmulps %xmm5, %xmm1, %xmm1
          const xmm1 = f32(t1[base1 + lane]);
          const shdup1 = f32(t1[base1 + (lane | 1)]);
          const eps = f32(p[16 + lane]);
          const corr = f32(p[24 + lane]);
          const unpremulA = f32(xmm1 * f32(rcpps(maxps(shdup1, eps)) * corr));

          // @0x31319f  vmovshdup %xmm2, %xmm5
          // @0x3131a3  vmaxps %xmm6, %xmm5, %xmm5
          // @0x3131a7  vrcpps %xmm5, %xmm5
          // @0x3131ab  vmulps %xmm5, %xmm7, %xmm5
          // @0x3131af  vmulps %xmm5, %xmm2, %xmm2
          const xmm2 = f32(t2[base2 + lane]);
          const shdup2 = f32(t2[base2 + (lane | 1)]);
          const unpremulB = f32(xmm2 * f32(corr * rcpps(maxps(shdup2, eps))));

          // @0x3131b3  vmulps (%rdx), %xmm3, %xmm3
          // @0x3131bd  vaddps %xmm5, %xmm3, %xmm3
          const weight = f32(f32(xmm3Blend * f32(p[lane])) + pW);

          // @0x3131c1  vsubps %xmm1, %xmm2, %xmm2
          // @0x3131c5  vmulps %xmm3, %xmm2, %xmm2
          // @0x3131c9  vaddps %xmm2, %xmm1, %xmm1
          // @0x3131cd  vmulps %xmm1, %xmm4, %xmm1
          // @0x3131d1  vaddps (%r10,%rax), %xmm1, %xmm1
          const mixed = f32(unpremulA + f32(f32(unpremulB - unpremulA) * weight));
          const acc = f32(f32(mixed * xmm4Mask) + f32(t3[base3 + lane]));

          // @0x3131d7  vblendps $0x4, %xmm1, %xmm0, %xmm0
          // @0x3131dd  vmovaps %xmm0, (%r8,%rax)
          dst[baseD + lane] = isZ ? acc : xmm0;
        }
        // @0x3131e3  jmp 0x313030 — straight to the row advance; the tail is
        // reached at most once per row.
      }

      // @0x313030-0x313041 — advance every base pointer by its byte stride and
      // increment the row counter.
      t0Off += t0Stride;
      t1Off += t1Stride;
      t2Off += t2Stride;
      t3Off += t3Stride;
      dstOff += dstStride;
    }

    // @0x3131e8-0x3131f1 pops, @0x3131f2 vzeroupper, @0x3131f5 xorl %eax,%eax.
    return 0;
  }
}
