// HgcAVATemporalAverage.ts — raw transcription of Helium
// `HgcAVATemporalAverage`, the inner COMPUTE sub-node of the "AVA (Anti Video
// Aliasing) Temporal Average" pair. The outer wrapper HGNode is a separate,
// already-landed class (`HGAVATemporalAverage` @Helium 0x212c70 — see
// HGAVATemporalAverage.ts, which allocates this object, fills its +0x198
// coefficient buffer with 8 × float32 0.5f and connects its two inputs).
//
// ONE symbol is transcribed in this file:
//
//   @0x2125c0  HgcAVATemporalAverage::RenderTile_AVX(HGTile*)
//                __ZN21HgcAVATemporalAverage14RenderTile_AVXEP6HGTile
//
// Every OTHER member of the class is a SEPARATE ledger unit and is NOT ported
// here — do not add them without their own disassembly and address citations:
//   0x2121d0 GetProgram        0x212850 RenderTile        0x2124f0 BindTexture
//   0x212c50 GetParameter      0x212c40 SetParameter      0x2125a0 Bind
//   0x212a10 GetDOD            0x212a30 GetROI            0x212c60 GetOutput
//   0x212a50/0x212ad0 C2/C1    0x212b50/0x212ba0/0x212bf0 D2/D1/D0
//   0x2124a0 shaderDescription 0x212200 InitProgramDescriptor
//   0xa2f698 __ZTV21HgcAVATemporalAverage (vtable)
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Re-derive with:
//   raw-port/tools/disasm.sh --sym \
//     __ZN21HgcAVATemporalAverage14RenderTile_AVXEP6HGTile Helium
//   raw-port/re/disasm/Helium.__ZN21HgcAVATemporalAverage14RenderTile_AVXEP6HGTile.s (158 lines)
//
// ── WHO CALLS IT ────────────────────────────────────────────────────────────
// `HgcAVATemporalAverage::RenderTile(HGTile*)` @0x212850 is the SSE sibling and
// the dispatcher: it calls HGTile::Renderer() @0x212864, HGRenderer::GetTarget(0)
// @0x21286e, compares the target class code against 0x4700000 @0x212873 and, when
// it is >= that threshold, calls THIS function @0x212880 and returns its result.
// (That dispatch head is part of the RenderTile unit, not this one.)
//
// ── WHAT IT COMPUTES ────────────────────────────────────────────────────────
// For every RGBA float32 pixel of the tile rectangle:
//
//     out[x] = (texPlanes[0][x] + texPlanes[1][x]) * coeff
//
// with `coeff` read lane-wise from the 32-byte buffer at `this+0x198` (the outer
// wrapper fills it with 0.5f, making this the arithmetic mean of the two input
// planes — the "temporal average" of the previous and current field). The body
// is pure vector arithmetic: it has NO callq at all, no in-scope callee, no
// extern, no allocation, and no indirect or virtual dispatch
// (`depgraph.py deps __ZN21HgcAVATemporalAverage14RenderTile_AVXEP6HGTile`
// lists nothing).
//
// ── THREE PIXEL LOOPS, ONE FORMULA ──────────────────────────────────────────
// The compiler emitted three shapes of the same arithmetic; all three are
// transcribed below because they are the real, distinguishable code paths:
//   A. width >= 6  — @0x2126a0: 6 pixels per iteration as three vmovups/vaddps/
//                    vmulps triples on 32-byte ymm registers (2 pixels each),
//                    multiplied by all EIGHT coefficient lanes.
//   B. the row tail of A — @0x212730: one pixel per iteration on 16-byte xmm,
//                    multiplied by the FIRST FOUR coefficient lanes.
//   C. width < 6   — @0x2127c0: two pixels per iteration on 16-byte xmm, plus a
//                    one-pixel odd tail @0x212812, and a special width==1 entry
//                    @0x2127aa that jumps straight to the odd tail.
// Note the coefficient pointer is RE-LOADED from this+0x198 before every single
// vmulps (@0x2126d3, @0x21273a, @0x2127cd, @0x2127eb, @0x21281d) — the compiler
// could not prove the store-to-`out` did not alias it. The port re-reads it in
// the same places rather than hoisting, so a caller that aliases the coefficient
// buffer with the output plane observes what the machine observes.
//
// ── ALIGNMENT TELL ──────────────────────────────────────────────────────────
// Path A uses `vmovups` (UNaligned) while B and C use `vmovaps` (aligned, faults
// on a misaligned address). That is a property of the emitted code, not of the
// data model, and has no observable effect on a faithful value port; it is noted
// only so the difference is not read as a decode error.

import type { HGTile } from "./HGTile.js";

/**
 * `HgcAVATemporalAverage` instance state — only the ONE field this unit reads.
 *
 * The class is a 0x1a0-byte HGNode subclass (sizeof and the +0x00 vtable /
 * +0x10 flags members are documented in HGAVATemporalAverage.ts, which
 * allocates and initializes it); everything below +0x198 is the opaque HGNode
 * base as far as RenderTile_AVX is concerned — the body never touches it.
 *
 * @Helium 0x2125c0
 */
export interface HgcAVATemporalAverageState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — `float* coefBuf`, a 32-byte-aligned pointer into a `new float[]`
   * block. Loaded by `movq 0x198(%rdi),%rsi` @0x2126d3 (and again @0x21273a,
   * @0x2127cd, @0x2127eb, @0x21281d) and then read as 32 bytes (`vmovups
   * (%rsi),%ymm3` @0x2126da — 8 float32 lanes) or as 16 bytes (`vmulps
   * (%rsi),%xmm0` @0x212741 / @0x2127d4 / @0x2127f2 / @0x212824 — the first 4
   * lanes). HGAVATemporalAverage's ctor writes 0.5f into all 8 lanes with two
   * 128-bit stores @0x212cdc/@0x212ce1.
   *
   * Modelled as a Float32Array of at least 8 elements (same treatment as
   * HgcAVASpatialAverageAdaptive_LowerField's `paramBlock`).
   */
  coefBuf: Float32Array | null;
}

/**
 * `HgcAVATemporalAverage::RenderTile_AVX(HGTile* tile)` — @Helium 0x2125c0
 *   __ZN21HgcAVATemporalAverage14RenderTile_AVXEP6HGTile
 *
 * Register map established by the prologue (%rdi = this, %rsi = tile):
 *   eax  = tile[+0x0c] - tile[+0x04]  = bottom - top = HEIGHT   @0x2125cd/@0x2125d0
 *   r11d = tile[+0x08] - tile[+0x00]  = right - left  = WIDTH    @0x2125dc/@0x2125e0
 *   rdx  = tile[+0x50]  texPlanes[0].pixels  (input A)           @0x2125e3
 *   r8   = tile[+0x60]  texPlanes[1].pixels  (input B)           @0x2125e7
 *   r9   = tile[+0x10]  outSlot              (output)            @0x2125eb
 *   r15  = tile[+0x18]  outStride            (movslq, sign-ext)  @0x2125ef
 *   r12  = tile[+0x68]  texPlanes[1].stride  (movslq, sign-ext)  @0x2125f3
 *   r13  = tile[+0x58]  texPlanes[0].stride  (movslq, sign-ext)  @0x2125f7
 * Each stride is then `shlq $0x4` (@0x21260c..0x212614 on path A, @0x212778..
 * 0x212780 on path C) — pixels are 16-byte float4 RGBA, so a row step is
 * `stride * 16` BYTES, i.e. `stride * 4` float32 ELEMENTS in this port.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x2125c0  pushq %rbp ... 0x2125cc pushq %rbx    ; frame + callee-saves (no TS counterpart)
 *   0x2125cd  movl 0xc(%rsi),%eax                   ; eax = bottom
 *   0x2125d0  subl 0x4(%rsi),%eax                   ; eax = bottom - top = height
 *   0x2125d3  movl %eax,-0x2c(%rbp)                 ; spill height
 *   0x2125d6  jle 0x212833                          ; height <= 0 -> return 0
 *   0x2125dc  movl 0x8(%rsi),%r11d                  ; r11d = right
 *   0x2125e0  subl (%rsi),%r11d                     ; r11d = right - left = width
 *   0x2125e3  movq 0x50(%rsi),%rdx                  ; A = texPlanes[0].pixels
 *   0x2125e7  movq 0x60(%rsi),%r8                   ; B = texPlanes[1].pixels
 *   0x2125eb  movq 0x10(%rsi),%r9                   ; D = outSlot
 *   0x2125ef  movslq 0x18(%rsi),%r15                ; outStride      (sign-extended)
 *   0x2125f3  movslq 0x68(%rsi),%r12                ; B row stride   (sign-extended)
 *   0x2125f7  movslq 0x58(%rsi),%r13                ; A row stride   (sign-extended)
 *   0x2125fb  cmpl $0x6,%r11d                       ; width - 6
 *   0x2125ff  jl  0x212764                          ; width < 6 -> narrow path C
 *   -- path A setup --
 *   0x212605  movl %r11d,%ebx                       ; ebx = width
 *   0x212608  leaq -0x5(%rbx),%r14                  ; r14 = width - 5 (last 6-pixel start + 1)
 *   0x21260c  shlq $0x4,%r13                        ; A stride: pixels -> bytes
 *   0x212610  shlq $0x4,%r12                        ; B stride: pixels -> bytes
 *   0x212614  shlq $0x4,%r15                        ; D stride: pixels -> bytes
 *   0x212618  leaq 0x60(%rdx),%r10                  ; r10 = A row + 0x60  (tail cursor)
 *   0x21261c  leaq 0x60(%r8),%rax                   ; rax = B row + 0x60
 *   0x212620  leaq 0x60(%r9),%rsi                   ; rsi = D row + 0x60
 *   0x212624  xorl %ecx,%ecx                        ; row = 0
 *   0x212626..0x212632                              ; spill width / strides
 *   0x212636  jmp 0x212679                          ; enter the row do-while
 *   -- path A row body --
 *   0x212679  movq %rcx,-0x50(%rbp)                 ; spill row
 *   0x21267d  movl $0x50,%r15d                      ; byte cursor = 0x50 (biased by 0x50)
 *   0x212683..0x21268e                              ; spill the three +0x60 cursors
 *   0x212692  xorl %ecx,%ecx                        ; x = 0 (pixel index in the row)
 *   -- path A 6-pixel loop --
 *   0x2126a0  movq %r10,%r13 / %r11,%rax / %rsi,%r12 ; snapshot the tail cursors
 *   0x2126a9  vmovups -0x50(%rdx,%r15),%ymm0        ; A pixels x+0,x+1   (8 floats)
 *   0x2126b0  vmovups -0x30(%rdx,%r15),%ymm1        ; A pixels x+2,x+3
 *   0x2126b7  vmovups -0x10(%rdx,%r15),%ymm2        ; A pixels x+4,x+5
 *   0x2126be  vaddps  -0x50(%r8,%r15),%ymm0,%ymm0   ; + B pixels x+0,x+1
 *   0x2126c5  vaddps  -0x30(%r8,%r15),%ymm1,%ymm1   ; + B pixels x+2,x+3
 *   0x2126cc  vaddps  -0x10(%r8,%r15),%ymm2,%ymm2   ; + B pixels x+4,x+5
 *   0x2126d3  movq 0x198(%rdi),%rsi                 ; rsi = this->coefBuf   (re-loaded)
 *   0x2126da  vmovups (%rsi),%ymm3                  ; ymm3 = coefBuf[0..7]
 *   0x2126de  vmulps %ymm3,%ymm0,%ymm0              ; * coeff lanes 0..7
 *   0x2126e2  vmulps %ymm3,%ymm1,%ymm1
 *   0x2126e6  vmulps %ymm3,%ymm2,%ymm2
 *   0x2126ea  vmovups %ymm0,-0x50(%r9,%r15)         ; store D pixels x+0,x+1
 *   0x2126f1  vmovups %ymm1,-0x30(%r9,%r15)
 *   0x2126f8  vmovups %ymm2,-0x10(%r9,%r15)
 *   0x2126ff  addq $0x6,%rcx                        ; x += 6
 *   0x212703  addq $0x60,%r15                       ; byte cursor += 96
 *   0x212707  addq $0x60,%r10 / 0x21270b %r11 / 0x21270f rsi = r12+0x60
 *   0x212714  cmpq %r14,%rcx                        ; x - (width-5)
 *   0x212717  jl  0x2126a0                          ; signed: keep going while x < width-5
 *   -- path A row tail (one pixel at a time) --
 *   0x212719  movl -0x30(%rbp),%r11d                ; r11d = width
 *   0x21271d  cmpl %ecx,%r11d                       ; width - x
 *   0x212720  jle 0x212640                          ; no tail -> next row
 *   0x212730  vmovaps (%r13),%xmm0                  ; A pixel x   (4 floats)
 *   0x212736  vaddps  (%rax),%xmm0,%xmm0            ; + B pixel x
 *   0x21273a  movq 0x198(%rdi),%rsi                 ; re-load coefBuf
 *   0x212741  vmulps (%rsi),%xmm0,%xmm0             ; * coeff lanes 0..3
 *   0x212745  vmovaps %xmm0,(%r12)                  ; store D pixel x
 *   0x21274b  incq %rcx ; 0x21274e..0x212756 advance the three cursors by 0x10
 *   0x21275a  cmpq %rbx,%rcx ; 0x21275d jb 0x212730 ; UNSIGNED: while x < width
 *   0x21275f  jmp 0x212640
 *   -- path A next row --
 *   0x212640  movq -0x50(%rbp),%rcx ; 0x212644 incl %ecx    ; row += 1
 *   0x212646..0x21266d                              ; A/B/D row bases AND the three
 *                                                   ;   +0x60 cursors += their strides
 *   0x212670  cmpl -0x2c(%rbp),%ecx ; 0x212673 je 0x212833  ; row == height -> done
 *   -- path C (width < 6) --
 *   0x212764  testl %r11d,%r11d ; 0x212767 jle 0x212833     ; width <= 0 -> return 0
 *   0x21276d  movl %r11d,%eax                       ; eax = width
 *   0x212770  movl %eax,%ebx
 *   0x212772  andl $0x7ffffffe,%ebx                 ; ebx = width rounded DOWN to even
 *   0x212778..0x212780  shlq $0x4 on r13/r12/r15    ; strides: pixels -> bytes
 *   0x212784  xorl %r14d,%r14d                      ; row = 0
 *   0x212787  jmp 0x2127a6                          ; enter the row do-while
 *   0x2127a6  cmpl $0x1,%r11d ; 0x2127aa jne 0x2127b0
 *   0x2127ac  xorl %ecx,%ecx ; 0x2127ae jmp 0x21280a        ; width == 1 -> odd tail only
 *   0x2127b0  movl $0x10,%esi ; 0x2127b5 xorl %ecx,%ecx     ; byte cursor = 0x10, x = 0
 *   0x2127c0  vmovaps -0x10(%rdx,%rsi),%xmm0        ; A pixel x
 *   0x2127c6  vaddps  -0x10(%r8,%rsi),%xmm0,%xmm0   ; + B pixel x
 *   0x2127cd  movq 0x198(%rdi),%r10                 ; re-load coefBuf
 *   0x2127d4  vmulps (%r10),%xmm0,%xmm0             ; * coeff lanes 0..3
 *   0x2127d9  vmovaps %xmm0,-0x10(%r9,%rsi)         ; store D pixel x
 *   0x2127e0  vmovaps (%rdx,%rsi),%xmm0             ; A pixel x+1
 *   0x2127e5  vaddps  (%r8,%rsi),%xmm0,%xmm0        ; + B pixel x+1
 *   0x2127eb  movq 0x198(%rdi),%r10                 ; re-load coefBuf AGAIN
 *   0x2127f2  vmulps (%r10),%xmm0,%xmm0
 *   0x2127f7  vmovaps %xmm0,(%r9,%rsi)              ; store D pixel x+1
 *   0x2127fd  addq $0x2,%rcx ; 0x212801 addq $0x20,%rsi     ; x += 2
 *   0x212805  cmpq %rcx,%rbx ; 0x212808 jne 0x2127c0        ; until x == evenWidth
 *   0x21280a  testb $0x1,%al ; 0x21280c je 0x212790         ; width even -> next row
 *   0x21280e  shlq $0x4,%rcx                        ; byte offset of the last pixel
 *   0x212812  vmovaps (%rdx,%rcx),%xmm0             ; A pixel x
 *   0x212817  vaddps  (%r8,%rcx),%xmm0,%xmm0        ; + B pixel x
 *   0x21281d  movq 0x198(%rdi),%rsi                 ; re-load coefBuf
 *   0x212824  vmulps (%rsi),%xmm0,%xmm0
 *   0x212828  vmovaps %xmm0,(%r9,%rcx)              ; store D pixel x
 *   0x21282e  jmp 0x212790
 *   0x212790  addq %r13,%rdx / %r12,%r8 / %r15,%r9  ; A/B/D += their row strides
 *   0x212799  incl %r14d                            ; row += 1
 *   0x21279c  cmpl -0x2c(%rbp),%r14d ; 0x2127a0 je 0x212833 ; row == height -> done
 *   -- epilogue --
 *   0x212833  vzeroupper                            ; AVX/SSE transition (no TS counterpart)
 *   0x212836  xorl %eax,%eax                        ; return 0
 *   0x212838..0x212841  popq                        ; teardown (no TS counterpart)
 *   0x212842  retq
 *   0x212843  nopw                                  ; alignment padding, not executed
 *
 * Decode notes (AT&T order: `cmp %src,%dst` sets flags on `dst - src`):
 *   * @0x2125d6 the `jle` follows `subl 0x4(%rsi),%eax`, so it tests the SIGNED
 *     height directly: an empty or inverted rectangle returns 0 having touched
 *     no pixel — that is why the port's height guard precedes every pointer use.
 *   * @0x212714 `cmpq %r14,%rcx` is (x - (width-5)) and `jl` is SIGNED, while
 *     @0x21275a `cmpq %rbx,%rcx` is (x - width) with the UNSIGNED `jb`. Both
 *     operands are non-negative here, so the two agree; the port writes each
 *     comparison the way the machine performs it.
 *   * @0x212805 `cmpq %rcx,%rbx` is the REVERSE subtraction (evenWidth - x) with
 *     `jne` — an equality test, so the direction does not matter, but the pair
 *     loop therefore runs until x lands EXACTLY on evenWidth. Reaching it takes
 *     ceil steps of 2 from 0, which is why `width & 0x7ffffffe` (round down to
 *     even) is the right bound and why an odd width needs the @0x212812 tail.
 *   * the biased cursors (`r15` starting at 0x50 with -0x50/-0x30/-0x10
 *     displacements @0x2126a9, `rsi` starting at 0x10 with -0x10 @0x2127c0) are
 *     addressing-mode encoding tricks: they keep every displacement in one signed
 *     byte. They cancel exactly, so the port indexes from the unbiased pixel x.
 *   * path A's tail cursors r13/rax/r12 are snapshotted at the TOP of each
 *     6-pixel iteration @0x2126a0 while r10/r11/rsi advance at the BOTTOM, so on
 *     exit they lag by one step and point at exactly `rowBase + 0x60*(x/6)` —
 *     i.e. pixel x. The port indexes the tail by x directly.
 *   * `vzeroupper` @0x212833 is the mandatory AVX->SSE transition; it has no
 *     value semantics.
 *
 * @param self  %rdi — the HgcAVATemporalAverage instance.
 * @param tile  %rsi — the HGTile being rendered.
 * @returns the int in %eax, always 0 (@0x212836).
 */
export function HgcAVATemporalAverage_RenderTile_AVX(
  self: HgcAVATemporalAverageState,
  tile: HGTile,
): number {
  // @0x2125cd..@0x2125d6  height = bottom - top; `jle` -> nothing to render.
  const height = (tile.bottom - tile.top) | 0;
  if (height <= 0) {
    return 0; // @0x212836 xorl %eax,%eax
  }

  // @0x2125dc..@0x2125e0  width = right - left.
  const width = (tile.right - tile.left) | 0;

  // @0x2125e3..@0x2125eb  the three pixel planes.
  const planeA = tile.texPlanes[0].pixels; // rdx — tile[+0x50]
  const planeB = tile.texPlanes[1].pixels; // r8  — tile[+0x60]
  const planeD = tile.outSlot; // r9  — tile[+0x10]

  // @0x2125ef..@0x2125f7  strides, sign-extended (movslq) — they may be
  // negative for a bottom-up plane, which the accumulate-per-row form below
  // reproduces exactly.
  //
  // `shlq $0x4` @0x21260c..0x212614 / @0x212778..0x212780 converts the
  // pixel-count strides into BYTE strides; this port indexes Float32Array in
  // float32 ELEMENTS, and one 16-byte RGBA pixel is 4 of them, so the same
  // conversion is `* 4`.
  const strideAf = (tile.texPlanes[0].stride | 0) * 4; // r13
  const strideBf = (tile.texPlanes[1].stride | 0) * 4; // r12
  const strideDf = (tile.outStride | 0) * 4; // r15

  if (planeA === null || planeB === null || planeD === null) {
    // The disassembly does NOT null-check the three plane pointers — it
    // dereferences them the moment height > 0 (@0x2126a9 / @0x212730 /
    // @0x2127c0), so a null plane faults inside this function. That is a fault,
    // not a decoded code path, and no pixel value is defined for it, so the port
    // refuses loudly here rather than inventing one. Reached only for a torn
    // HGTile; a zero-height tile has already returned 0 above, exactly as
    // @0x2125d6 does before any pointer is loaded.
    throw new Error(
      "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x2125c0: null tile plane " +
        "(outSlot @+0x10 / texPlanes[0] @+0x50 / texPlanes[1] @+0x60) — the " +
        "binary dereferences these unconditionally and faults",
    );
  }

  // Row bases, in float32 elements. The machine keeps three pointers (rdx, r8,
  // r9) and ADDS the row stride each row (@0x21264a..0x212658, @0x212790);
  // accumulating the same way keeps negative strides faithful.
  let aRow = 0;
  let bRow = 0;
  let dRow = 0;

  // @0x2125fb..@0x2125ff  cmpl $0x6,%r11d ; jl 0x212764
  if (width >= 6) {
    // ── PATH A ──────────────────────────────────────────────────────────────
    // @0x212608  r14 = width - 5.
    const lastSixStart = width - 5;

    // @0x212624 row = 0; the row loop is a do-while entered via `jmp 0x212679`.
    let row = 0;
    for (;;) {
      // @0x212692  x = 0.
      let x = 0;

      // @0x2126a0..@0x212717  six pixels (24 float32) per iteration. Entered
      // unconditionally: width >= 6 makes lastSixStart >= 1 > x.
      do {
        // @0x2126d3..@0x2126da  re-load this->coefBuf and take 8 lanes.
        const coef = self.coefBuf;
        if (coef === null) {
          throw new Error(
            "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x2126d3: null " +
              "coefBuf (+0x198) — the binary loads 32 bytes through it and faults",
          );
        }
        const aBase = aRow + x * 4;
        const bBase = bRow + x * 4;
        const dBase = dRow + x * 4;
        // Three 32-byte groups: ymm0 = pixels x+0..1, ymm1 = x+2..3,
        // ymm2 = x+4..5 (@0x2126a9/@0x2126b0/@0x2126b7). Each is added to the
        // matching B group (@0x2126be/@0x2126c5/@0x2126cc) and multiplied by the
        // SAME ymm3 = coefBuf[0..7] (@0x2126de/@0x2126e2/@0x2126e6), so the
        // coefficient lane for float k of a group is k, i.e. lane (i % 8) of the
        // 24-float run.
        for (let g = 0; g < 3; g++) {
          for (let k = 0; k < 8; k++) {
            const i = g * 8 + k;
            // vaddps then vmulps, both single-precision.
            const sum = Math.fround(planeA[aBase + i] + planeB[bBase + i]);
            planeD[dBase + i] = Math.fround(sum * coef[k]);
          }
        }
        // @0x2126ff  x += 6.
        x += 6;
        // @0x212714..@0x212717  cmpq %r14,%rcx ; jl — signed x < width - 5.
      } while (x < lastSixStart);

      // @0x212719..@0x212720  cmpl %ecx,%r11d ; jle 0x212640 — skip the tail
      // when width <= x; else @0x212730..@0x21275d walks ONE pixel per
      // iteration with the unsigned `jb` bound x < width.
      while (x < width) {
        // @0x21273a  re-load coefBuf (again, per pixel).
        const coef = self.coefBuf;
        if (coef === null) {
          throw new Error(
            "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x21273a: null " +
              "coefBuf (+0x198) — the binary loads 16 bytes through it and faults",
          );
        }
        const aBase = aRow + x * 4;
        const bBase = bRow + x * 4;
        const dBase = dRow + x * 4;
        // @0x212730..@0x212745  one 16-byte pixel: (A + B) * coefBuf[0..3].
        for (let k = 0; k < 4; k++) {
          const sum = Math.fround(planeA[aBase + k] + planeB[bBase + k]);
          planeD[dBase + k] = Math.fround(sum * coef[k]);
        }
        // @0x21274b  incq %rcx.
        x += 1;
      }

      // @0x212640..@0x212673  row += 1; advance the three row bases; stop when
      // the row counter reaches height.
      row += 1;
      if (row === height) {
        break;
      }
      aRow += strideAf;
      bRow += strideBf;
      dRow += strideDf;
    }

    // @0x212833..@0x212842  vzeroupper ; xorl %eax,%eax ; retq
    return 0;
  }

  // ── PATH C (width < 6) ────────────────────────────────────────────────────
  // @0x212764..@0x212767  testl %r11d,%r11d ; jle 0x212833.
  if (width <= 0) {
    return 0;
  }

  // @0x212772  ebx = width & 0x7ffffffe — width rounded DOWN to even, the exact
  // stopping point of the two-pixel loop.
  const evenWidth = width & 0x7ffffffe;

  // @0x212784  row = 0; do-while over rows entered via `jmp 0x2127a6`.
  let row = 0;
  for (;;) {
    // @0x2127b5 / @0x2127ac  x = 0 on both entries.
    let x = 0;

    // @0x2127a6..@0x2127ae  cmpl $0x1,%r11d ; jne 0x2127b0 — a width of exactly
    // 1 skips the pair loop entirely and falls into the odd tail.
    if (width !== 1) {
      // @0x2127c0..@0x212808  two pixels per iteration.
      do {
        // @0x2127cd  re-load coefBuf for the FIRST pixel of the pair.
        const coef0 = self.coefBuf;
        if (coef0 === null) {
          throw new Error(
            "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x2127cd: null " +
              "coefBuf (+0x198) — the binary loads 16 bytes through it and faults",
          );
        }
        // @0x2127c0..@0x2127d9  pixel x.
        const a0 = aRow + x * 4;
        const b0 = bRow + x * 4;
        const d0 = dRow + x * 4;
        for (let k = 0; k < 4; k++) {
          const sum = Math.fround(planeA[a0 + k] + planeB[b0 + k]);
          planeD[d0 + k] = Math.fround(sum * coef0[k]);
        }
        // @0x2127eb  re-load coefBuf AGAIN for the second pixel — the machine
        // really does issue a second load here.
        const coef1 = self.coefBuf;
        if (coef1 === null) {
          throw new Error(
            "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x2127eb: null " +
              "coefBuf (+0x198) — the binary loads 16 bytes through it and faults",
          );
        }
        // @0x2127e0..@0x2127f7  pixel x+1.
        const a1 = aRow + (x + 1) * 4;
        const b1 = bRow + (x + 1) * 4;
        const d1 = dRow + (x + 1) * 4;
        for (let k = 0; k < 4; k++) {
          const sum = Math.fround(planeA[a1 + k] + planeB[b1 + k]);
          planeD[d1 + k] = Math.fround(sum * coef1[k]);
        }
        // @0x2127fd  addq $0x2,%rcx.
        x += 2;
        // @0x212805..@0x212808  cmpq %rcx,%rbx ; jne — until x == evenWidth.
      } while (evenWidth !== x);
    }

    // @0x21280a..@0x21280c  testb $0x1,%al — the low byte of the width; an odd
    // width leaves one pixel at x.
    if ((width & 1) !== 0) {
      // @0x21281d  re-load coefBuf.
      const coef = self.coefBuf;
      if (coef === null) {
        throw new Error(
          "HgcAVATemporalAverage::RenderTile_AVX @Helium 0x21281d: null " +
            "coefBuf (+0x198) — the binary loads 16 bytes through it and faults",
        );
      }
      // @0x21280e..@0x212828  the final pixel: (A + B) * coefBuf[0..3].
      const aBase = aRow + x * 4;
      const bBase = bRow + x * 4;
      const dBase = dRow + x * 4;
      for (let k = 0; k < 4; k++) {
        const sum = Math.fround(planeA[aBase + k] + planeB[bBase + k]);
        planeD[dBase + k] = Math.fround(sum * coef[k]);
      }
    }

    // @0x212790..@0x2127a0  advance the row bases, row += 1, stop at height.
    aRow += strideAf;
    bRow += strideBf;
    dRow += strideDf;
    row += 1;
    if (row === height) {
      break;
    }
  }

  // @0x212833..@0x212842  vzeroupper ; xorl %eax,%eax ; retq
  return 0;
}
