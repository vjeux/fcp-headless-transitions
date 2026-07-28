// shlMix.ts — Helium HGNode that linearly interpolates ("mixes") between two
// float32x4 sources A and B using a per-node vec4 weight, producing
//   out = A + w * (B - A)
// per pixel, over a rectangular HGTile.  Faithful transcription of the
// x86_64 disassembly from Helium.framework.
//
// Source (Helium.framework, x86_64 slice):
//   __ZN6shlMixC1Ev                          @0x0014c800  base ctor
//                                                          (C2 is ICF-folded
//                                                           to the same body:
//                                                           C1==C2==0x14c800)
//   __ZN6shlMix6GetDODEP10HGRendereri6HGRect  @0x0014c820
//   __ZN6shlMix6GetROIEP10HGRendereri6HGRect  @0x0014c840
//   __ZN6shlMix10GetProgramEP10HGRenderer     @0x0014c860
//   __ZN6shlMix10RenderTileEP6HGTile          @0x0014c870
//   __ZN6shlMixD1Ev                           @0x0014e040  base dtor
//   __ZN6shlMixD0Ev                           @0x0014e050  deleting dtor
//
// vtable pointer install (from C1 @0x14c80e leaq + 7-byte fixup + 0x8d23a3):
//   0x14c80e + 7 + 0x8d23a3 = 0xa1ebb8  — the payload start of shlMix's
//   vtable (i.e. `vtable + 0x10`).  This class overrides GetDOD, GetROI,
//   GetProgram, and RenderTile relative to HGNode.  All other slots
//   inherit HGNode's implementation (undecoded frontier).
//
// FIELD OFFSETS observed:
//   0x00  vptr           (installed by C1 @0x14c815 -> vtable+0x10 @0xa1ebb8)
//   0x30  HGRef<...>*    param buffer holding a 16-byte weight vec4 at offset 0
//         (RenderTile: `movq 0x30(%rdi), %rdi ; movaps (%rdi), %xmm0`)
//
// HGTile field offsets observed (rsi in RenderTile) — this class reads MORE
// offsets than shlRGB2YIQ because it has TWO source buffers (A and B):
//   0x00  int32 x0
//   0x04  int32 y0
//   0x08  int32 x1
//   0x0c  int32 y1
//   0x10  float32x4* dstBase          (destination row-0 pointer)
//   0x18  int32      dstStride16      (destination row stride in 16-byte units)
//   0x50  float32x4* srcABase         (source A row-0 pointer)     @0x14c890
//   0x58  int32      srcAStride16     (A row stride, 16-byte units) @0x14c88c
//   0x60  float32x4* srcBBase         (source B row-0 pointer)     @0x14c898
//   0x68  int32      srcBStride16     (B row stride, 16-byte units) @0x14c894
//
// External symbols consumed:
//   _HGRectNull            — Helium global, 16-byte "empty" HGRect POD.
//   shlMix_fragmentString  — Helium __TEXT/__cstring, Metal fragment shader
//                            source blob for this node.  Both are referenced
//                            here by their linker names (opaque payloads).
//
// UNDECODED FRONTIERS cited by throwing stubs:
//   HGNode::HGNode(), HGNode::~HGNode(), HGObject::operator delete —
//   consumed via the tiny import stubs below (matches the pattern used
//   by shlRGB2YIQ.ts / HGSWRenderer.ts / HGObject_stub.ts).

import { HGObject_dtor } from '../render/HGObject_stub';

/**
 * HGNode::HGNode() — undecoded frontier.
 * Referenced from shlMix::shlMix() @Helium 0x0014c809.
 */
function HGNode_ctor(_self: object): void {
  throw new Error(
    'HGNode::HGNode() not yet transcribed ' +
    '(called from shlMix C1 @Helium 0x0014c809)'
  );
}

/**
 * HGNode::~HGNode() — undecoded frontier.
 * Referenced from shlMix dtors @Helium 0x0014e045 (D1 tail-jmp),
 * 0x0014e059 (D0 call).
 */
function HGNode_dtor(_self: object): void {
  throw new Error(
    'HGNode::~HGNode() not yet transcribed ' +
    '(called from shlMix D1 @Helium 0x0014e045, D0 @Helium 0x0014e059)'
  );
}

/**
 * _HGRectNull — undecoded frontier.
 *
 * Helium global HGRect POD referenced from shlMix::GetDOD @0x14c82c and
 * shlMix::GetROI @0x14c84c.  It lives at binary VA 0x3d2284 in the
 * Helium framework (verified via `nm _HGRectNull`), but the raw 16 bytes
 * there decode as { 196611, 256, 0, 0 } which is NOT the {0,0,0,0} POD
 * one might guess — so its structural meaning is genuinely un-decoded
 * here.  Rather than fabricate a value, GetDOD/GetROI throw when they
 * reach the null-rect branch.  Callers that only hit index<2 are
 * unaffected.
 */
function loadHGRectNull(): HGRect {
  throw new Error(
    '_HGRectNull not yet transcribed ' +
    '(referenced from shlMix::GetDOD @Helium 0x0014c82c, ' +
    'shlMix::GetROI @Helium 0x0014c84c)'
  );
}

// -----------------------------------------------------------------------------
// shlMix
// -----------------------------------------------------------------------------

/**
 * shlMix — Helium HGNode that linearly interpolates between two float32x4
 * source buffers A and B on a per-tile basis, using a per-node vec4 weight
 * held in a HGRef at object offset 0x30.  See file header for the full ABI
 * story.
 */
export class shlMix {
  /** vptr @ offset 0x00 — installed by C1 to point at vtable+0x10 @0xa1ebb8. */
  vptr: string = '';

  /**
   * `HGRef<HGParamBuffer>` at object offset 0x30 whose 16-byte payload is
   * a float32x4 weight vector applied per-pixel in RenderTile (one lane
   * per RGBA channel).  Stored as a length-4 Float32Array to preserve
   * single-precision semantics.
   *
   * Layout at 0x30(%rdi) → (%rdi) after chase (@Helium 0x14c8a0/a4):
   *   xmm0 = (wR, wG, wB, wA).
   */
  paramWeight: Float32Array = new Float32Array(4);

  /**
   * shlMix::shlMix() — Helium base ctor.
   * __ZN6shlMixC1Ev @0x0014c800  (C2 is ICF-folded to C1: same body).
   *
   * Disassembly (verbatim, otool -tV):
   *   0x14c800  pushq  %rbp
   *   0x14c801  movq   %rsp, %rbp
   *   0x14c804  pushq  %rbx
   *   0x14c805  pushq  %rax                      ; 16-byte alignment
   *   0x14c806  movq   %rdi, %rbx                ; save `this`
   *   0x14c809  callq  __ZN6HGNodeC2Ev           ; HGNode::HGNode()
   *   0x14c80e  leaq   0x8d23a3(%rip), %rax      ; &vtable+0x10 @0xa1ebb8
   *   0x14c815  movq   %rax, (%rbx)              ; this->vptr = vtable+0x10
   *   0x14c818  addq   $0x8, %rsp
   *   0x14c81c  popq   %rbx
   *   0x14c81d  popq   %rbp
   *   0x14c81e  retq
   *
   * RIP-relative vptr install:
   *   0x14c80e + 7 + 0x8d23a3 = 0xa1ebb8  == &vtable[2] (payload start).
   *
   * Chains into HGNode::HGNode() (undecoded — raises via HGNode_ctor).
   */
  static C1(self: shlMix): void {
    // @Helium 0x0014c809 — HGNode::HGNode() on `this`.
    HGNode_ctor(self);
    // @Helium 0x0014c80e..0x14c815 — install vptr @0xa1ebb8.
    self.vptr = 'shlMix_vtable@0xa1ebb8';
  }

  /**
   * shlMix::GetDOD(HGRenderer*, int index, HGRect r) — Helium override.
   * __ZN6shlMix6GetDODEP10HGRendereri6HGRect @0x0014c820.
   *
   * "DOD" is the Domain Of Definition of the given input index.  For a
   * 2-input mix node, inputs 0 and 1 are the two sources; any index >= 2
   * has no DOD and returns _HGRectNull.
   *
   * ABI: 16-byte HGRect POD passed and returned via the Itanium/x86_64
   * split-pair convention:
   *   in:  rdi=this, rsi=HGRenderer*, edx=index, rcx=r.lo8, r8=r.hi8
   *   out: rax=result.lo8, rdx=result.hi8
   *
   * Disassembly (verbatim):
   *   0x14c820  movq  %rcx, %rax                  ; default rax = r.lo8
   *   0x14c823  cmpl  $0x2, %edx                  ; if (index < 2)
   *   0x14c826  jb    0x14c83b                    ;   goto tail (pass-through)
   *   0x14c828  pushq %rbp
   *   0x14c829  movq  %rsp, %rbp
   *   0x14c82c  leaq  _HGRectNull(%rip), %rcx     ; &_HGRectNull
   *   0x14c833  movq  (%rcx), %rax                ; result.lo8 = null.lo8
   *   0x14c836  movq  0x8(%rcx), %r8              ; r8         = null.hi8
   *   0x14c83a  popq  %rbp
   *   0x14c83b  movq  %r8, %rdx                   ; result.hi8 = r8
   *   0x14c83e  retq
   *
   * Faithful transcription: for index in {0, 1} we pass `r` through
   * unmodified; for index >= 2 we return _HGRectNull (undecoded here, so
   * a throwing stub — matches Rule 3 of PORTING_SPEC.md).
   */
  static GetDOD(
    _self: shlMix,
    _renderer: object | null,
    index: number,
    r: HGRect,
  ): HGRect {
    // @Helium 0x14c823/26 — unsigned-compare index vs 2 (jb == unsigned).
    // Faithful to `cmpl $0x2,%edx ; jb <tail>` — the pass-through branch
    // fires for index in {0,1}; every other value takes the null path.
    if ((index >>> 0) < 2) {
      // @Helium 0x14c820/3b/3e — return `r` unchanged (rax=r.lo8, rdx=r.hi8).
      return r;
    }
    // @Helium 0x14c82c-0x14c836 — load _HGRectNull.
    return loadHGRectNull();
  }

  /**
   * shlMix::GetROI(HGRenderer*, int index, HGRect r) — Helium override.
   * __ZN6shlMix6GetROIEP10HGRendereri6HGRect @0x0014c840.
   *
   * "ROI" is the Region Of Interest — the portion of an input needed to
   * compute a given output region.  For shlMix this is BYTE-IDENTICAL to
   * GetDOD (same body, same _HGRectNull tail), and unsurprisingly ICF
   * has NOT folded them because they are exported under distinct
   * symbols; but the instruction stream at 0x14c840 is a byte-for-byte
   * copy of the one at 0x14c820, differing only in the branch offset:
   *
   *   0x14c840  movq  %rcx, %rax
   *   0x14c843  cmpl  $0x2, %edx
   *   0x14c846  jb    0x14c85b
   *   0x14c848  pushq %rbp
   *   0x14c849  movq  %rsp, %rbp
   *   0x14c84c  leaq  _HGRectNull(%rip), %rcx
   *   0x14c853  movq  (%rcx), %rax
   *   0x14c856  movq  0x8(%rcx), %r8
   *   0x14c85a  popq  %rbp
   *   0x14c85b  movq  %r8, %rdx
   *   0x14c85e  retq
   *
   * We port both faithfully as separate methods (per Rule 1 of
   * PORTING_SPEC.md — "you port THIS one", not "a function that
   * behaves the same").
   */
  static GetROI(
    _self: shlMix,
    _renderer: object | null,
    index: number,
    r: HGRect,
  ): HGRect {
    // @Helium 0x14c843/46 — unsigned-compare index vs 2.
    if ((index >>> 0) < 2) {
      // @Helium 0x14c840/5b/5e — return `r` unchanged.
      return r;
    }
    // @Helium 0x14c84c-0x14c856 — load _HGRectNull.
    return loadHGRectNull();
  }

  /**
   * shlMix::GetProgram(HGRenderer*) — Helium override.
   * __ZN6shlMix10GetProgramEP10HGRenderer @0x0014c860.
   *
   * Disassembly (verbatim):
   *   0x14c860  pushq %rbp
   *   0x14c861  movq  %rsp, %rbp
   *   0x14c864  leaq  __ZL21shlMix_fragmentString(%rip), %rax
   *   0x14c86b  popq  %rbp
   *   0x14c86c  retq
   *
   * Returns a pointer to the file-scope `shlMix_fragmentString` constant
   * (Helium __TEXT/__cstring, verified via
   * `nm __ZL21shlMix_fragmentString` -> 0x859750).  The `HGRenderer*`
   * argument is unused.
   *
   * The shader payload itself is an opaque Metal-source blob that lives
   * in Helium's __cstring; inlining its bytes is a separate transcription
   * pass — we surface the symbol name here.
   */
  static GetProgram(_self: shlMix, _renderer: object | null): string {
    // @Helium 0x14c864 — leaq shlMix_fragmentString(%rip), %rax
    return 'shlMix_fragmentString@Helium';
  }

  /**
   * shlMix::RenderTile(HGTile*) — Helium CPU fallback path.
   * __ZN6shlMix10RenderTileEP6HGTile @0x0014c870.
   *
   * Body: computes `out = A + w * (B - A)` per pixel over a rectangular
   * tile.  Uses an SSE ×2 unroll for pairs of pixels (main loop), a
   * scalar-lane tail for odd trailing pixels, and a dedicated
   * width==1 / height==1 degenerate path.
   *
   * PER-PIXEL:
   *   a4  = load4f(A)                                          @0x14c8f0
   *   b4  = load4f(B)                                          @0x14c8fb
   *   d4  = b4 - a4                                            @0x14c906
   *   d4  = d4 * w        (w = self->[0x30] payload)           @0x14c90c
   *   out = a4 + d4                                            @0x14c912
   *   store4f(dst, out)                                        @0x14c918
   *
   * This is a straight fused-lerp — NO sqrt companding, NO matrix — the
   * simplest possible two-input SIMD kernel.
   *
   * CONTROL FLOW MIRROR (from asm):
   *   width = tile.x1 - tile.x0             @0x14c879/7d  -> r11d
   *   y0    = tile.y0                       @0x14c880    -> ebx
   *   y1    = tile.y1                       @0x14c883    -> r14d
   *   rows  = y1 - y0                       @0x14c887/8a -> eax
   *   sAStr = tile.srcAStride16 @0x58       @0x14c88c    -> rcx (sxtd i64)
   *   srcA  = tile.srcABase     @0x50       @0x14c890    -> rdx
   *   sBStr = tile.srcBStride16 @0x68       @0x14c894    -> r8  (sxtd i64)
   *   srcB  = tile.srcBBase     @0x60       @0x14c898    -> r9
   *   dst   = tile.dstBase      @0x10       @0x14c89c    -> r10
   *   wPtr  = self->[0x30]                  @0x14c8a0    -> rdi
   *   w     = load4f(wPtr)                  @0x14c8a4    -> xmm0
   *   if (width < 2) goto degenerate       @0x14c8a7/ab
   *   width_u = (uint32)width               @0x14c8b1
   *   sAStr <<= 4                           @0x14c8b4  ; bytes = stride16*16
   *   sBStr <<= 4                           @0x14c8b8
   *   goto row-head                         @0x14c8bc
   *
   * The main path (width >= 2) then:
   *   - pair-processes pixels 2 at a time using unrolled SSE loads,
   *   - handles an odd trailing pixel via the scalar tail
   *     (@0x14c950-0x14c975),
   *   - advances srcA/srcB/dst by their respective strides,
   *   - decrements the row counter and loops until zero.
   *
   * The width==1 degenerate path (@0x14c986-0x14ca2b) has its own
   * odd/even split on `rows` so it can process 2 rows per iteration for
   * cache locality — this is a proper SSE micro-optimisation, NOT
   * decorative code, and we transcribe both halves faithfully.
   *
   * @returns 0 (matches `xorl %eax,%eax` at 0x14ca2d just before retq).
   */
  static RenderTile(self: shlMix, tile: HGTile): number {
    // @Helium 0x14c879/7d — width = tile.x1 - tile.x0
    const width = ((tile.x1 | 0) - (tile.x0 | 0)) | 0;
    // @Helium 0x14c880 — y0 = tile.y0
    const y0 = tile.y0 | 0;
    // @Helium 0x14c883 — y1 = tile.y1
    const y1 = tile.y1 | 0;
    // @Helium 0x14c887/8a — rows = y1 - y0
    let rows = (y1 - y0) | 0;
    // @Helium 0x14c88c — srcAStride16 = tile[0x58] (int32 -> sxtd).
    const sAStride16 = tile.srcAStride16 | 0;
    // @Helium 0x14c890 — srcA base.
    const srcA = tile.srcABase;
    let srcAOff = 0;
    // @Helium 0x14c894 — srcBStride16 = tile[0x68].
    const sBStride16 = tile.srcBStride16 | 0;
    // @Helium 0x14c898 — srcB base.
    const srcB = tile.srcBBase;
    let srcBOff = 0;
    // @Helium 0x14c89c — dst base.
    const dst = tile.dstBase;
    let dstOff = 0;
    // @Helium 0x14c8a0/a4 — weight vec4 loaded from self[0x30] payload.
    const w = self.paramWeight;
    const wR = Math.fround(w[0]);
    const wG = Math.fround(w[1]);
    const wB = Math.fround(w[2]);
    const wA = Math.fround(w[3]);

    // @Helium 0x14c8a7/ab — if (width < 2) branch into the degenerate handler.
    if (width < 2) {
      // @Helium 0x14c97c/80 — the only accepted degenerate is width == 1;
      // width == 0 (or negative in the underlying signed subtraction)
      // exits immediately with 0.
      if (width !== 1) {
        // @Helium 0x14ca2d — xor eax,eax ; retq.
        return 0;
      }

      // Width==1 path.  This half is a "process 2 rows per loop step"
      // SSE micro-optimisation with a pre-loop odd-row shim.
      //
      //   ebx  <- (was tile.y0 above); incl %ebx @0x14c986 -> ebx = y0+1
      //   testb $1, %al @0x14c988: if `rows` is odd, do one row first
      //     (@0x14c98c-0x14c9bf), decrement rows.  Otherwise skip.
      //   @0x14c9c1: if (r14d==ebx) goto exit — this is a NO-more-rows
      //     check comparing the (incremented) ebx against y1 (r14d).
      //   Otherwise fall into the 2-rows-per-iter loop @0x14c9e0-0x14ca2b.
      //
      // In TS the same effect is achieved by processing `rows` rows one
      // at a time (single-pixel body); we KEEP the odd/even split so the
      // stride advancement order matches the asm bit-for-bit for the
      // 2-per-iter case.

      // @Helium 0x14c986 — ebx = y0 + 1  (used only for the ebx==y1 exit).
      let rowsRem = rows;

      // @Helium 0x14c988/8a — if rows is odd, execute one leading row.
      if ((rowsRem & 1) !== 0) {
        // @Helium 0x14c98c-0x14c99f — one-pixel lerp on the current row.
        const a0 = Math.fround(srcA[srcAOff + 0]);
        const a1 = Math.fround(srcA[srcAOff + 1]);
        const a2 = Math.fround(srcA[srcAOff + 2]);
        const a3 = Math.fround(srcA[srcAOff + 3]);
        const b0 = Math.fround(srcB[srcBOff + 0]);
        const b1 = Math.fround(srcB[srcBOff + 1]);
        const b2 = Math.fround(srcB[srcBOff + 2]);
        const b3 = Math.fround(srcB[srcBOff + 3]);
        // d = B - A ; d *= w ; out = A + d.
        const d0 = Math.fround(Math.fround(b0 - a0) * wR);
        const d1 = Math.fround(Math.fround(b1 - a1) * wG);
        const d2 = Math.fround(Math.fround(b2 - a2) * wB);
        const d3 = Math.fround(Math.fround(b3 - a3) * wA);
        dst[dstOff + 0] = Math.fround(a0 + d0);
        dst[dstOff + 1] = Math.fround(a1 + d1);
        dst[dstOff + 2] = Math.fround(a2 + d2);
        dst[dstOff + 3] = Math.fround(a3 + d3);

        // @Helium 0x14c9a0-0x14c9bc — advance srcA/srcB/dst by ONE stride
        // (stride16 * 16 bytes == stride16 * 4 float32 lanes).
        srcAOff += sAStride16 * 4;
        srcBOff += sBStride16 * 4;
        dstOff  += (tile.dstStride16 | 0) * 4;
        // @Helium 0x14c9bf — decl %eax  (rows -= 1).
        rowsRem -= 1;
      }

      // @Helium 0x14c9c1/c4 — if (rows == 0) exit.
      // (In the asm this is `cmpl %ebx,%r14d ; je exit` where ebx==y0+1
      //  after the incl and r14d==y1; the difference is exactly rowsRem
      //  after any shim decrement.)
      if (rowsRem === 0) {
        // @Helium 0x14ca2d — return 0.
        return 0;
      }

      // 2-rows-per-iter loop (@0x14c9e0-0x14ca2b).  Each iteration
      // processes the SAME single pixel on TWO consecutive rows, then
      // advances srcA/srcB by 2·stride and dst by 2·stride.  Faithful
      // structure preserved so the memory access pattern matches.
      while (rowsRem > 0) {
        // Row N (@0x14c9e0-0x14c9f0).
        {
          const a0 = Math.fround(srcA[srcAOff + 0]);
          const a1 = Math.fround(srcA[srcAOff + 1]);
          const a2 = Math.fround(srcA[srcAOff + 2]);
          const a3 = Math.fround(srcA[srcAOff + 3]);
          const b0 = Math.fround(srcB[srcBOff + 0]);
          const b1 = Math.fround(srcB[srcBOff + 1]);
          const b2 = Math.fround(srcB[srcBOff + 2]);
          const b3 = Math.fround(srcB[srcBOff + 3]);
          const d0 = Math.fround(Math.fround(b0 - a0) * wR);
          const d1 = Math.fround(Math.fround(b1 - a1) * wG);
          const d2 = Math.fround(Math.fround(b2 - a2) * wB);
          const d3 = Math.fround(Math.fround(b3 - a3) * wA);
          dst[dstOff + 0] = Math.fround(a0 + d0);
          dst[dstOff + 1] = Math.fround(a1 + d1);
          dst[dstOff + 2] = Math.fround(a2 + d2);
          dst[dstOff + 3] = Math.fround(a3 + d3);
        }
        // Advance dst to row N+1 for the second pixel of this iteration
        // (@0x14c9f4-0x14c9fc: r14 = r10 + dstStride16*16).
        const dstNext = dstOff + (tile.dstStride16 | 0) * 4;

        // Row N+1 (@0x14ca00-0x14ca12), reading (srcA + sAStride16*16)
        // and (srcB + sBStride16*16).
        {
          const aOff = srcAOff + sAStride16 * 4;
          const bOff = srcBOff + sBStride16 * 4;
          const a0 = Math.fround(srcA[aOff + 0]);
          const a1 = Math.fround(srcA[aOff + 1]);
          const a2 = Math.fround(srcA[aOff + 2]);
          const a3 = Math.fround(srcA[aOff + 3]);
          const b0 = Math.fround(srcB[bOff + 0]);
          const b1 = Math.fround(srcB[bOff + 1]);
          const b2 = Math.fround(srcB[bOff + 2]);
          const b3 = Math.fround(srcB[bOff + 3]);
          const d0 = Math.fround(Math.fround(b0 - a0) * wR);
          const d1 = Math.fround(Math.fround(b1 - a1) * wG);
          const d2 = Math.fround(Math.fround(b2 - a2) * wB);
          const d3 = Math.fround(Math.fround(b3 - a3) * wA);
          dst[dstNext + 0] = Math.fround(a0 + d0);
          dst[dstNext + 1] = Math.fround(a1 + d1);
          dst[dstNext + 2] = Math.fround(a2 + d2);
          dst[dstNext + 3] = Math.fround(a3 + d3);
        }

        // @Helium 0x14ca17-0x14ca25 — advance all three by TWO strides
        // (dst gets `dstStride16*16` added twice via r14 then r10; srcA
        //  gets r11=sAStride16<<5 (i.e. 2×), srcB gets rdi=sBStride16<<5).
        srcAOff += sAStride16 * 4 * 2;
        srcBOff += sBStride16 * 4 * 2;
        dstOff  += (tile.dstStride16 | 0) * 4 * 2;

        // @Helium 0x14ca28/2b — rows -= 2 ; jne loop.
        rowsRem -= 2;
      }
      // @Helium 0x14ca2d — return 0.
      return 0;
    }

    // Main path: width >= 2.
    // @Helium 0x14c8b1 — width_u = (uint32)width (used as the pair-loop bound).
    // (`shlq $4,%rcx` and `shlq $4,%r8` @0x14c8b4/b8 pre-scale strides to
    //  bytes; we index in float32 lanes so we multiply strides by 4 at use
    //  sites — same net offset, more readable.)

    // Row loop.
    while (rows > 0) {
      // @Helium 0x14c8d9-0x14c93a — SSE ×2 pair loop.  Each iteration
      // consumes TWO consecutive pixels; loops while the remaining pixel
      // count is > 1 (unsigned).
      let px = 0;
      while (px + 1 < width) {
        // Load two pixels of A (@0x14c8f0/f6) and B (@0x14c8fb/0x14c901).
        // The asm addresses them as `-0x10(base,r14)` and `(base,r14)`
        // with r14 pre-advanced by 0x10 (16 bytes) each iteration —
        // canonical "two-lane" indexing.  We use plain px/px+1 offsets.
        const bA = px * 4;
        const cA = (px + 1) * 4;

        // xmm1 = A[px], xmm2 = A[px+1]
        const a0a = Math.fround(srcA[srcAOff + bA + 0]);
        const a1a = Math.fround(srcA[srcAOff + bA + 1]);
        const a2a = Math.fround(srcA[srcAOff + bA + 2]);
        const a3a = Math.fround(srcA[srcAOff + bA + 3]);
        const a0b = Math.fround(srcA[srcAOff + cA + 0]);
        const a1b = Math.fround(srcA[srcAOff + cA + 1]);
        const a2b = Math.fround(srcA[srcAOff + cA + 2]);
        const a3b = Math.fround(srcA[srcAOff + cA + 3]);
        // xmm3 = B[px], xmm4 = B[px+1]
        const b0a = Math.fround(srcB[srcBOff + bA + 0]);
        const b1a = Math.fround(srcB[srcBOff + bA + 1]);
        const b2a = Math.fround(srcB[srcBOff + bA + 2]);
        const b3a = Math.fround(srcB[srcBOff + bA + 3]);
        const b0b = Math.fround(srcB[srcBOff + cA + 0]);
        const b1b = Math.fround(srcB[srcBOff + cA + 1]);
        const b2b = Math.fround(srcB[srcBOff + cA + 2]);
        const b3b = Math.fround(srcB[srcBOff + cA + 3]);

        // subps xmm1,xmm3 @0x14c906  ; xmm3 = B - A
        // subps xmm2,xmm4 @0x14c909
        const d0a = Math.fround(b0a - a0a);
        const d1a = Math.fround(b1a - a1a);
        const d2a = Math.fround(b2a - a2a);
        const d3a = Math.fround(b3a - a3a);
        const d0b = Math.fround(b0b - a0b);
        const d1b = Math.fround(b1b - a1b);
        const d2b = Math.fround(b2b - a2b);
        const d3b = Math.fround(b3b - a3b);

        // mulps xmm0,xmm3 @0x14c90c  ; xmm3 = (B-A)*w
        // mulps xmm0,xmm4 @0x14c90f
        const m0a = Math.fround(d0a * wR);
        const m1a = Math.fround(d1a * wG);
        const m2a = Math.fround(d2a * wB);
        const m3a = Math.fround(d3a * wA);
        const m0b = Math.fround(d0b * wR);
        const m1b = Math.fround(d1b * wG);
        const m2b = Math.fround(d2b * wB);
        const m3b = Math.fround(d3b * wA);

        // addps xmm1,xmm3 @0x14c912  ; xmm3 = A + (B-A)*w
        // addps xmm2,xmm4 @0x14c915
        // movaps xmm3,dst[px] @0x14c918
        // movaps xmm4,dst[px+1] @0x14c91e
        dst[dstOff + bA + 0] = Math.fround(a0a + m0a);
        dst[dstOff + bA + 1] = Math.fround(a1a + m1a);
        dst[dstOff + bA + 2] = Math.fround(a2a + m2a);
        dst[dstOff + bA + 3] = Math.fround(a3a + m3a);
        dst[dstOff + cA + 0] = Math.fround(a0b + m0b);
        dst[dstOff + cA + 1] = Math.fround(a1b + m1b);
        dst[dstOff + cA + 2] = Math.fround(a2b + m2b);
        dst[dstOff + cA + 3] = Math.fround(a3b + m3b);

        // @Helium 0x14c923-0x14c938 — advance by 2 pixels; unsigned
        // continue-while-remaining>1.
        px += 2;
      }

      // Scalar tail (@0x14c950-0x14c975) — if width was odd, one leftover
      // pixel remains.  The asm computes `negl %ebx ; cmp %ebx,%r11d ;
      // jbe pair-loop-again` (which is the loop-back for the pair path)
      // and only falls into this tail when the leftover count is > 0.
      while (px < width) {
        const b = px * 4;
        const a0 = Math.fround(srcA[srcAOff + b + 0]);
        const a1 = Math.fround(srcA[srcAOff + b + 1]);
        const a2 = Math.fround(srcA[srcAOff + b + 2]);
        const a3 = Math.fround(srcA[srcAOff + b + 3]);
        const b0 = Math.fround(srcB[srcBOff + b + 0]);
        const b1 = Math.fround(srcB[srcBOff + b + 1]);
        const b2 = Math.fround(srcB[srcBOff + b + 2]);
        const b3 = Math.fround(srcB[srcBOff + b + 3]);
        const d0 = Math.fround(Math.fround(b0 - a0) * wR);
        const d1 = Math.fround(Math.fround(b1 - a1) * wG);
        const d2 = Math.fround(Math.fround(b2 - a2) * wB);
        const d3 = Math.fround(Math.fround(b3 - a3) * wA);
        dst[dstOff + b + 0] = Math.fround(a0 + d0);
        dst[dstOff + b + 1] = Math.fround(a1 + d1);
        dst[dstOff + b + 2] = Math.fround(a2 + d2);
        dst[dstOff + b + 3] = Math.fround(a3 + d3);
        px += 1;
      }

      // @Helium 0x14c8c0-0x14c8d1 — advance srcA by sAStride, srcB by
      // sBStride, dst by dstStride16, then rows -= 1.
      srcAOff += sAStride16 * 4;
      srcBOff += sBStride16 * 4;
      dstOff  += (tile.dstStride16 | 0) * 4;
      rows -= 1;
    }

    // @Helium 0x14ca2d — xor eax,eax ; retq.
    return 0;
  }

  /**
   * shlMix::~shlMix() — Helium base dtor.
   * __ZN6shlMixD1Ev @0x0014e040.
   *
   * Disassembly (verbatim):
   *   0x14e040  pushq %rbp
   *   0x14e041  movq  %rsp, %rbp
   *   0x14e044  popq  %rbp
   *   0x14e045  jmp   __ZN6HGNodeD2Ev      ; tail-call HGNode::~HGNode()
   */
  static D1(self: shlMix): void {
    // @Helium 0x0014e045 — jmp HGNode::~HGNode(); tail-call form.
    HGNode_dtor(self);
  }

  /**
   * shlMix::~shlMix() — Helium deleting dtor.
   * __ZN6shlMixD0Ev @0x0014e050.
   *
   * Disassembly (verbatim):
   *   0x14e050  pushq %rbp
   *   0x14e051  movq  %rsp, %rbp
   *   0x14e054  pushq %rbx
   *   0x14e055  pushq %rax
   *   0x14e056  movq  %rdi, %rbx
   *   0x14e059  callq __ZN6HGNodeD2Ev              ; HGNode::~HGNode()
   *   0x14e05e  movq  %rbx, %rdi                   ; this -> arg0
   *   0x14e061  addq  $0x8, %rsp
   *   0x14e065  popq  %rbx
   *   0x14e066  popq  %rbp
   *   0x14e067  jmp   __ZN8HGObjectdlEPv           ; HGObject::operator delete
   */
  static D0(self: shlMix): void {
    // @Helium 0x0014e059 — HGNode::~HGNode() on `this`.
    HGNode_dtor(self);
    // @Helium 0x0014e067 — tail-jmp HGObject::operator delete(this).
    HGObject_dtor(self);
  }
}

// -----------------------------------------------------------------------------
// HGRect / HGTile PODs — minimum structural surface used by shlMix.  Fields
// are named after the offsets observed in the asm; only these are read.
// -----------------------------------------------------------------------------

/**
 * HGRect — Helium 16-byte rectangle POD.  Its ACTUAL field layout is not
 * decoded here (referenced only as an opaque {lo8, hi8} pair via
 * `_HGRectNull`).  Structural bookkeeping for GetDOD/GetROI.
 */
export interface HGRect {
  /** low  8 bytes of the POD, as returned in rax  (@Helium GetDOD 0x14c820). */
  lo8: number;
  /** high 8 bytes of the POD, as returned in rdx  (@Helium GetDOD 0x14c83b). */
  hi8: number;
}

/**
 * HGTile — POD describing a rectangular tile of two source buffers (A, B)
 * and one destination buffer.  Only the fields consumed by
 * shlMix::RenderTile are modelled.  Fields >= 0x70 have not been decoded.
 */
export interface HGTile {
  /** @0x00 int32 — inclusive left column. */
  x0: number;
  /** @0x04 int32 — inclusive top row. */
  y0: number;
  /** @0x08 int32 — exclusive right column. */
  x1: number;
  /** @0x0c int32 — exclusive bottom row. */
  y1: number;
  /** @0x10 float32[] — destination row-0 base (indexed in float32 units). */
  dstBase: Float32Array;
  /** @0x18 int32 — destination row stride, measured in 16-byte units. */
  dstStride16: number;
  /** @0x50 float32[] — source A row-0 base (indexed in float32 units). */
  srcABase: Float32Array;
  /** @0x58 int32 — source A row stride, measured in 16-byte units. */
  srcAStride16: number;
  /** @0x60 float32[] — source B row-0 base (indexed in float32 units). */
  srcBBase: Float32Array;
  /** @0x68 int32 — source B row stride, measured in 16-byte units. */
  srcBStride16: number;
}
