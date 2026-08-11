// c2y.ts — Helium's internal-linkage free function `c2y`.
//
//   @0x163820  c2y(HGTile const*, float vector[4] const*, int)
//                __ZL3c2yPK6HGTilePKDv4_fi        ("__ZL" = static, file-local)
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.__ZL3c2yPK6HGTilePKDv4_fi.s  (119 lines)
//            (re-derive with `raw-port/tools/disasm.sh --sym
//             __ZL3c2yPK6HGTilePKDv4_fi Helium`)
//
// The file is named after the function because it is a FREE function with no
// owning class (PORTING_SPEC's naming rule). Its translation-unit twin is
// `c2x` @0x161850 (__ZL3c2xPK6HGTilePKDv4_fi) — the same two-tap filter along
// the OTHER axis: c2x reads its neighbour one PIXEL away inside a row (it
// pre-subtracts the width from both strides @0x16188b/@0x16188e), while c2y
// reads one ROW away (its inner loop advances by whole strides @0x163926..
// @0x16392c). c2x is a separate ledger unit and is NOT ported here.
//
// ── WHAT IT COMPUTES ────────────────────────────────────────────────────────
// A vertical 2-tap, per-lane weighted blend over the tile, from input plane 0
// to the output plane, with a horizontal source-only pixel offset:
//
//   dst[y][x] = coef[0] * src[y][x + xOffset] + coef[1] * src[y+1][x + xOffset]
//
// where dst/src pixels are float4 RGBA (16 bytes) and the two coefficients are
// float4s applied LANE-WISE (`mulps`), not scalars. Note the last row reads
// src[height], one row past the tile's own height — that is what the machine
// does (the pooled plane carries the extra row); it is transcribed, not
// clamped.
//
// The return value is the constant 2 (`movl $0x2,%eax` @0x1639af) on EVERY
// path, including both early exits.
//
// ── TILE FIELDS USED (the shared HGTile.ts contract) ────────────────────────
//   +0x00 left / +0x08 right   width  = right - left     @0x16382d/@0x163830
//   +0x04 top  / +0x0c bottom  height = bottom - top     @0x163838/@0x16383c
//   +0x10 outSlot              dst base      @0x1638b4 / @0x163980
//   +0x18 outStride            dst row pitch @0x16385c
//   +0x50 texPlanes[0].pixels  src base      @0x1638b8 / @0x163984
//   +0x58 texPlanes[0].stride  src row pitch @0x163847
// Strides are PIXEL counts that the body immediately `shlq $0x4`s into byte
// pitches (@0x163874..@0x163890, @0x163964..@0x16396f); this port indexes
// Float32Array in float32 ELEMENTS, so the same conversion is `* 4`.
//
// CALLEES: none — the body has no `callq` at all. No in-scope dependency, no
// extern, no allocation, no indirect or virtual dispatch (`depgraph.py deps`
// lists nothing).

import type { HGTile } from "./HGTile.js";

/**
 * `c2y(HGTile const* tile, float4 const* coef, int xOffset)` — @Helium 0x163820
 *   __ZL3c2yPK6HGTilePKDv4_fi
 *
 * Full transcription — every instruction, in order:
 *
 *   0x163820  pushq %rbp … 0x16382c pushq %rbx  ; frame + callee-saves (no TS counterpart)
 *   0x16382d  movl 0x8(%rdi),%eax                ; eax = right
 *   0x163830  subl (%rdi),%eax                   ; eax = right - left = width
 *   0x163832  je   0x1639af                      ; width == 0 -> return 2
 *   0x163838  movl 0xc(%rdi),%r8d                ; r8d = bottom
 *   0x16383c  subl 0x4(%rdi),%r8d                ; r8d = bottom - top = height
 *   0x163840  movaps (%rsi),%xmm0                ; xmm0 = coef[0]  (4 floats)
 *   0x163843  movaps 0x10(%rsi),%xmm1            ; xmm1 = coef[1]  (4 floats)
 *   0x163847  movslq 0x58(%rdi),%r10             ; src stride (pixels, sign-ext)
 *   0x16384b  movslq %edx,%rcx                   ; xOffset (sign-extended)
 *   0x16384e  cmpl $0x2,%r8d
 *   0x163852  jb   0x16395d                      ; UNSIGNED height < 2 -> tail path
 *   -- MAIN path setup (height >= 2) --
 *   0x163858  movl %r8d,-0x2c(%rbp)              ; spill height
 *   0x16385c  movslq 0x18(%rdi),%r11             ; dst stride (pixels)
 *   0x163860  leal (%r10,%r10),%edx              ; 2 * src stride
 *   0x163864  leal (%r11,%r11),%r8d              ; 2 * dst stride
 *   0x163868  movslq %edx,%rsi / 0x16386b movslq %r8d,%r9
 *   0x16386e  movl %eax,%eax                     ; ZERO-EXTEND width to 64 bits
 *   0x163870  movq %rax,-0x40(%rbp)              ; spill the column count
 *   0x163874  shlq $0x4,%r9                      ; 2*dstStride -> bytes
 *   0x163878  shlq $0x4,%r11 / 0x16387c spill    ; dstStride -> bytes
 *   0x163880  shlq $0x4,%rcx                     ; xOffset -> bytes
 *   0x163884  shlq $0x4,%rsi                     ; 2*srcStride -> bytes
 *   0x163888  leaq (%rcx,%rsi),%rax / 0x16388c spill ; xOffBytes + 2*srcStride
 *   0x163890  shlq $0x4,%r10                     ; srcStride -> bytes
 *   0x163894  leaq (%r10,%rcx),%rbx              ; srcStride + xOffBytes
 *   0x163898  xorl %r14d,%r14d                   ; column byte offset = 0
 *   0x16389b  xorl %r15d,%r15d                   ; col = 0
 *   0x16389e  jmp 0x1638b1                       ; enter the column do-while
 *   -- next column --
 *   0x1638a0  incq %r15                          ; ++col
 *   0x1638a3  addq $0x10,%r14                    ; column byte offset += 16
 *   0x1638a7  cmpq -0x40(%rbp),%r15
 *   0x1638ab  je   0x1639af                      ; col == width -> return 2
 *   -- per-column preamble --
 *   0x1638b1  movq %r10,%r11                     ; keep srcStrideBytes
 *   0x1638b4  movq 0x10(%rdi),%r12               ; dst base  (RE-LOADED per column)
 *   0x1638b8  movq 0x50(%rdi),%r10               ; src base  (RE-LOADED per column)
 *   0x1638bc  movq %r15,%rax / shlq $0x4 / addq %r10,%rax
 *   0x1638c6  movaps (%rcx,%rax),%xmm2           ; xmm2 = src[0][col + xOffset]
 *   0x1638ca  movq -0x48(%rbp),%rax / 0x1638ce leaq (%r12,%rax),%rdx
 *                                                ; rdx = dst + one row
 *   0x1638d2  leaq (%r10,%rcx),%r13              ; r13 = src + xOffBytes (no column yet)
 *   0x1638d6  movq -0x38(%rbp),%rax / addq %r10,%rax ; rax = src + xOff + 2 rows
 *   0x1638dd  addq %rbx,%r10                     ; r10 = src + xOff + 1 row
 *   0x1638e0  movl -0x2c(%rbp),%r8d              ; rows remaining = height
 *   -- inner loop: TWO rows per iteration --
 *   0x1638f0  movaps (%r10,%r14),%xmm3           ; xmm3 = src[y+1][col]
 *   0x1638f5  mulps %xmm0,%xmm2                  ; xmm2 = coef0 * src[y]
 *   0x1638f8  movaps %xmm1,%xmm4 / 0x1638fb mulps %xmm3,%xmm4  ; coef1 * src[y+1]
 *   0x1638fe  addps %xmm2,%xmm4
 *   0x163901  movaps (%rax,%r14),%xmm2           ; xmm2 = src[y+2][col]  (LOADED
 *                                                ;   BEFORE the store below)
 *   0x163906  movaps %xmm4,(%r12,%r14)           ; dst[y][col] = the sum
 *   0x16390b  mulps %xmm0,%xmm3                  ; coef0 * src[y+1]
 *   0x16390e  movaps %xmm1,%xmm4 / 0x163911 mulps %xmm2,%xmm4  ; coef1 * src[y+2]
 *   0x163914  addps %xmm3,%xmm4
 *   0x163917  movaps %xmm4,(%rdx,%r14)           ; dst[y+1][col] = the sum
 *   0x16391c  addl $-0x2,%r8d                    ; rows -= 2
 *   0x163920  addq %r9,%r12 / 0x163923 addq %r9,%rdx      ; dst += 2 rows
 *   0x163926  addq %rsi,%r13 / 0x163929 addq %rsi,%rax / 0x16392c addq %rsi,%r10
 *   0x16392f  cmpl $0x1,%r8d / 0x163933 ja 0x1638f0        ; UNSIGNED rows > 1
 *   -- odd-row tail --
 *   0x163935  testl %r8d,%r8d
 *   0x163938  movq %r11,%r10                     ; restore srcStrideBytes
 *   0x16393b  je   0x1638a0                      ; even height -> next column
 *   0x163941  addq %r14,%r13                     ; r13 += column byte offset
 *   0x163944  mulps %xmm0,%xmm2                  ; coef0 * the CARRIED src[y]
 *   0x163947  movaps (%r13,%r10),%xmm3           ; xmm3 = src[y+1][col]
 *   0x16394d  mulps %xmm1,%xmm3                  ; coef1 * src[y+1]
 *   0x163950  addps %xmm2,%xmm3
 *   0x163953  movaps %xmm3,(%r12,%r14)           ; dst[y][col] = the sum
 *   0x163958  jmp  0x1638a0                      ; next column
 *   -- TAIL path (height < 2) --
 *   0x16395d  testl %r8d,%r8d / 0x163960 je 0x1639af   ; height == 0 -> return 2
 *   0x163962  movl %eax,%eax                     ; zero-extend width
 *   0x163964  shlq $0x4,%rcx                     ; xOffset -> bytes
 *   0x163968  shlq $0x4,%r10 / 0x16396c addq %rcx,%r10  ; srcStride + xOffBytes
 *   0x16396f  shlq $0x4,%rax                     ; width -> bytes (the loop bound)
 *   0x163973  xorl %edx,%edx                     ; column byte offset = 0
 *   0x163980  movq 0x10(%rdi),%rsi               ; dst base (RE-LOADED per column)
 *   0x163984  movq 0x50(%rdi),%r8                ; src base (RE-LOADED per column)
 *   0x163988  leaq (%r8,%rcx),%r9                ; src + xOffBytes           (row 0)
 *   0x16398c  addq %r10,%r8                      ; src + srcStride + xOffBytes (row 1)
 *   0x16398f  movaps (%rdx,%r9),%xmm2 / 0x163994 mulps %xmm0,%xmm2
 *   0x163997  movaps (%rdx,%r8),%xmm3 / 0x16399c mulps %xmm1,%xmm3
 *   0x16399f  addps %xmm2,%xmm3
 *   0x1639a2  movaps %xmm3,(%rsi,%rdx)           ; dst[0][col]
 *   0x1639a6  addq $0x10,%rdx
 *   0x1639aa  cmpq %rdx,%rax / 0x1639ad jne 0x163980
 *   -- exit --
 *   0x1639af  movl $0x2,%eax                     ; the ONLY return value
 *   0x1639b4  popq … 0x1639bd popq %rbp          ; teardown (no TS counterpart)
 *   0x1639be  retq
 *   0x1639bf  nop                                ; alignment padding, not executed
 *
 * Decode notes:
 *   * THE CARRY IS OBSERVABLE. `xmm2` is loaded ONCE before the inner loop
 *     (@0x1638c6) and thereafter only from src[y+2] @0x163901, which happens
 *     BEFORE the dst[y] store @0x163906. A port that re-loaded src[y] at the
 *     top of each iteration would agree only while dst and src do not alias;
 *     this one carries the value exactly as the register does.
 *   * `cmpl $0x2,%r8d ; jb` @0x16384e and `cmpl $0x1,%r8d ; ja` @0x16392f are
 *     UNSIGNED, and `movl %eax,%eax` @0x16386e/@0x163962 ZERO-EXTENDS the
 *     width. A negative width or height therefore becomes a huge unsigned
 *     count rather than an early exit — only an EXACTLY zero width (@0x163832)
 *     or zero height (@0x163960) returns early. The port reproduces the same
 *     unsigned readings instead of adding guards the machine does not have.
 *   * the dst and src BASE pointers are re-read from the tile on every column
 *     (@0x1638b4/@0x1638b8, @0x163980/@0x163984) — the compiler could not
 *     prove the stores do not alias the tile struct — so the port re-reads
 *     them too.
 *   * the two coefficients are float4s multiplied LANE-WISE (`mulps`), so lane
 *     k of the output uses lane k of each coefficient; a scalar weight would
 *     be a different function.
 *   * the odd-row tail reads src[y+1] with y = height-1, i.e. one row past the
 *     tile height, just as the main loop's last `src[y+2]` does. Transcribed
 *     as-is.
 *
 * @param tile           %rdi — the tile (bounds, output plane, input plane 0).
 * @param coef           %rsi — at least 8 float32: coef[0..3] = the first
 *                       float4 (@0x163840), coef[4..7] = the second
 *                       (@0x163843).
 * @param xOffsetPixels  %edx — a SOURCE-only horizontal pixel offset.
 * @returns %eax — always 2 (@0x1639af).
 */
export function c2y(
  tile: HGTile,
  coef: Float32Array,
  xOffsetPixels: number,
): number {
  // @0x16382d..@0x163832  width = right - left; only an exact zero exits.
  const widthSigned = (tile.right - tile.left) | 0;
  if (widthSigned === 0) {
    return 2; // @0x1639af
  }
  // @0x16386e / @0x163962  `movl %eax,%eax` — the loop bound is the ZERO-EXTENDED
  // 32-bit difference, not the signed one.
  const width = widthSigned >>> 0;

  // @0x163838..@0x16383c  height = bottom - top.
  const height = (tile.bottom - tile.top) | 0;

  // @0x163840/@0x163843  the two float4 coefficients.
  const a0 = coef[0];
  const a1 = coef[1];
  const a2 = coef[2];
  const a3 = coef[3];
  const b0 = coef[4];
  const b1 = coef[5];
  const b2 = coef[6];
  const b3 = coef[7];

  // @0x163847/@0x16384b  src stride (pixels) and the source x offset, both
  // sign-extended. Strides become BYTE pitches via `shlq $0x4`; in float32
  // elements that is `* 4`.
  const srcStrideF = (tile.texPlanes[0].stride | 0) * 4;
  const xOffF = (xOffsetPixels | 0) * 4;

  const src = tile.texPlanes[0].pixels;
  const dst = tile.outSlot;
  if (src === null || dst === null) {
    // The disassembly dereferences both planes unconditionally once the
    // width/height guards pass (@0x1638c6 / @0x163906, @0x16398f / @0x1639a2),
    // so a null plane faults inside this function. That is a fault, not a
    // decoded path, and no pixel value is defined for it.
    throw new Error(
      "c2y @Helium 0x163820: null tile plane (outSlot @+0x10 / texPlanes[0] " +
        "@+0x50) — the binary dereferences these unconditionally and faults",
    );
  }

  // @0x16384e..@0x163852  cmpl $0x2,%r8d ; jb — UNSIGNED.
  if ((height >>> 0) >= 2) {
    // @0x16385c  dst stride (pixels) -> float32 elements.
    const dstStrideF = (tile.outStride | 0) * 4;

    // @0x163898..@0x16389e  the column do-while.
    for (let col = 0; col < width; col++) {
      // @0x1638b4/@0x1638b8  bases re-read from the tile every column.
      const colF = col * 4;
      // @0x1638c6  xmm2 = src[0][col + xOffset] — the carried value.
      let c0 = src[0 * srcStrideF + xOffF + colF + 0];
      let c1 = src[0 * srcStrideF + xOffF + colF + 1];
      let c2v = src[0 * srcStrideF + xOffF + colF + 2];
      let c3 = src[0 * srcStrideF + xOffF + colF + 3];

      // @0x1638e0  rows remaining = height; y walks the rows two at a time.
      let rows = height;
      let y = 0;
      do {
        const s1 = (y + 1) * srcStrideF + xOffF + colF; // @0x1638f0  src[y+1]
        const s2 = (y + 2) * srcStrideF + xOffF + colF; // @0x163901  src[y+2]
        const d0 = y * dstStrideF + colF; // @0x163906  dst[y]
        const d1 = (y + 1) * dstStrideF + colF; // @0x163917  dst[y+1]

        // @0x1638f0..@0x1638fe  coef0*src[y] + coef1*src[y+1], lane-wise.
        const n0 = src[s1 + 0];
        const n1 = src[s1 + 1];
        const n2 = src[s1 + 2];
        const n3 = src[s1 + 3];
        const o00 = Math.fround(Math.fround(a0 * c0) + Math.fround(b0 * n0));
        const o01 = Math.fround(Math.fround(a1 * c1) + Math.fround(b1 * n1));
        const o02 = Math.fround(Math.fround(a2 * c2v) + Math.fround(b2 * n2));
        const o03 = Math.fround(Math.fround(a3 * c3) + Math.fround(b3 * n3));

        // @0x163901  load src[y+2] BEFORE storing dst[y] — order matters when
        // the planes alias.
        const m0 = src[s2 + 0];
        const m1 = src[s2 + 1];
        const m2 = src[s2 + 2];
        const m3 = src[s2 + 3];

        // @0x163906  store dst[y].
        dst[d0 + 0] = o00;
        dst[d0 + 1] = o01;
        dst[d0 + 2] = o02;
        dst[d0 + 3] = o03;

        // @0x16390b..@0x163914  coef0*src[y+1] + coef1*src[y+2], lane-wise.
        // @0x163917  store dst[y+1].
        dst[d1 + 0] = Math.fround(Math.fround(a0 * n0) + Math.fround(b0 * m0));
        dst[d1 + 1] = Math.fround(Math.fround(a1 * n1) + Math.fround(b1 * m1));
        dst[d1 + 2] = Math.fround(Math.fround(a2 * n2) + Math.fround(b2 * m2));
        dst[d1 + 3] = Math.fround(Math.fround(a3 * n3) + Math.fround(b3 * m3));

        // src[y+2] stays in xmm2 as the next iteration's src[y].
        c0 = m0;
        c1 = m1;
        c2v = m2;
        c3 = m3;

        // @0x16391c  rows -= 2 (32-bit), y advances two rows.
        rows = (rows - 2) | 0;
        y += 2;
        // @0x16392f..@0x163933  cmpl $0x1,%r8d ; ja — UNSIGNED rows > 1.
      } while ((rows >>> 0) > 1);

      // @0x163935..@0x16393b  testl ; je — an even height has no tail.
      if (rows !== 0) {
        // @0x163941..@0x163953  dst[y][col] = coef0*carried + coef1*src[y+1].
        const s1 = (y + 1) * srcStrideF + xOffF + colF;
        const d0 = y * dstStrideF + colF;
        dst[d0 + 0] = Math.fround(Math.fround(a0 * c0) + Math.fround(b0 * src[s1 + 0]));
        dst[d0 + 1] = Math.fround(Math.fround(a1 * c1) + Math.fround(b1 * src[s1 + 1]));
        dst[d0 + 2] = Math.fround(Math.fround(a2 * c2v) + Math.fround(b2 * src[s1 + 2]));
        dst[d0 + 3] = Math.fround(Math.fround(a3 * c3) + Math.fround(b3 * src[s1 + 3]));
      }
    }

    // @0x1639af  movl $0x2,%eax ; retq
    return 2;
  }

  // -- TAIL path @0x16395d (height < 2 read unsigned) --
  // @0x16395d..@0x163960  testl %r8d,%r8d ; je.
  if (height === 0) {
    return 2; // @0x1639af
  }

  // @0x163973..@0x1639ad  one row, every column: dst[0][col] =
  // coef0*src[0][col+xOffset] + coef1*src[1][col+xOffset].
  for (let col = 0; col < width; col++) {
    const colF = col * 4;
    const s0 = xOffF + colF; // @0x163988  src + xOffBytes
    const s1 = srcStrideF + xOffF + colF; // @0x16398c  + one row
    const d0 = colF; // @0x1639a2  dst base + column
    dst[d0 + 0] = Math.fround(Math.fround(a0 * src[s0 + 0]) + Math.fround(b0 * src[s1 + 0]));
    dst[d0 + 1] = Math.fround(Math.fround(a1 * src[s0 + 1]) + Math.fround(b1 * src[s1 + 1]));
    dst[d0 + 2] = Math.fround(Math.fround(a2 * src[s0 + 2]) + Math.fround(b2 * src[s1 + 2]));
    dst[d0 + 3] = Math.fround(Math.fround(a3 * src[s0 + 3]) + Math.fround(b3 * src[s1 + 3]));
  }

  // @0x1639af  movl $0x2,%eax ; retq
  return 2;
}
