// shlRGB2YIQ.ts — Helium HGNode that maps RGBA into (Y, I, Q, A) in
// sqrt-companded space, applying a per-node gain read from a HGRef held at
// offset 0x30 of the node.  Faithful transcription of the x86_64 disassembly.
//
// Source (Helium.framework, x86_64 slice):
//   __ZN10shlRGB2YIQC2Ev              @0x0014c360  base ctor
//   __ZN10shlRGB2YIQ10GetProgramEP10HGRenderer  @0x0014c380
//   __ZN10shlRGB2YIQ10RenderTileEP6HGTile       @0x0014c390
//   __ZN10shlRGB2YIQD1Ev              @0x0014dfe0  base dtor
//   __ZN10shlRGB2YIQD0Ev              @0x0014dff0  deleting dtor
//
// The Itanium C1 slot points to the same code as C2 for this class (no
// virtual bases).  Only C2 has its own body in the binary; that body is
// the transcription target here.
//
// vtable @0xa1e728 (installed vptr @0xa1e738 by C2 @0x14c36e).  Slots:
//   0x00/0x08 -> ::~shlRGB2YIQ (D1/D0)
//   0x10/0x18 -> HGObject::Retain/Release
//   0x20-...  -> HGNode base implementations (debugDescription, dotLabel,
//                  label_A/B, info, shaderDescription, GetParameterCount,
//                  GetParameterName, SetParameter, GetParameter,
//                  GetNumInputs, SetInput, GetInput, SetFlags, ClearFlags,
//                  ...) — verified via
//                  `raw-port/army/tools/resolve.py Helium vtable shlRGB2YIQ`.
// Two overrides in this class relative to HGNode: GetProgram (returns the
// Metal fragment shader source pointer) and RenderTile (the CPU fallback).
//
// FIELD OFFSETS observed (from RenderTile & C2):
//   0x00  vptr           (installed by C2 @0x14c36e -> vtable+0x10 @0xa1e738)
//   0x30  HGRef<...>*    param buffer holding a 16-byte gain vec4 at offset 0
//         (RenderTile: `movq 0x30(%rdi), %rdi ; movaps (%rdi), %xmm0`)
//
// HGTile field offsets observed (rsi in RenderTile — the tile parameter):
//   0x00  int32 x0
//   0x04  int32 y0
//   0x08  int32 x1
//   0x0c  int32 y1
//   0x10  float32x4* dstBase          (destination row0 pointer)
//   0x18  int32      dstStride16      (destination stride in units of 16 B)
//   0x50  float32x4* srcBase          (source row0 pointer)
//   0x58  int32      srcStride16      (source stride in units of 16 B)
//
// UNDECODED FRONTIERS cited by throwing stubs:
//   HGNode::HGNode(), HGNode::~HGNode(), HGObject::operator delete —
//   all consumed via the tiny import stubs below (matches the pattern used
//   by HGSWRenderer.ts / HGObject_stub.ts).

import { HGObject_dtor } from '../render/HGObject_stub';

/**
 * HGNode::HGNode() — undecoded frontier.
 * Referenced from shlRGB2YIQ::shlRGB2YIQ() @Helium 0x0014c369.
 */
function HGNode_ctor(_self: object): void {
  throw new Error(
    'HGNode::HGNode() not yet transcribed ' +
    '(called from shlRGB2YIQ C2 @Helium 0x0014c369)'
  );
}

/**
 * HGNode::~HGNode() — undecoded frontier.
 * Referenced from shlRGB2YIQ dtors @Helium 0x0014dfe5 (D1),
 * 0x0014dff9 (D0).
 */
function HGNode_dtor(_self: object): void {
  throw new Error(
    'HGNode::~HGNode() not yet transcribed ' +
    '(called from shlRGB2YIQ D1 @Helium 0x0014dfe5, D0 @Helium 0x0014dff9)'
  );
}

// -----------------------------------------------------------------------------
// SIMD constant pool — read directly from Helium __TEXT_CONST/__const at the
// RIP-relative addresses cited by RenderTile.  Two identical banks appear
// because the main loop @0x14c3cb-0x14c3e0 and the height==1 tail
// @0x14c533-0x14c548 each re-load them; both resolve to the same 64 bytes
// starting at Helium file offset 0x858f70.
//
// Layout (each row is a 16-byte movaps aligned load, little-endian):
//   0x858f70  xmm1 = ( FLT_MIN, FLT_MIN, FLT_MIN, 0 )        eps floor
//   0x858f80  xmm2 = (  0.587, -0.2755, -0.523,   0 )        G column
//   0x858f90  xmm3 = (  0.299,  0.596,   0.212,   0 )        R column
//   0x858fa0  xmm4 = (  0.114, -0.321,   0.311,   0 )        B column
//
// The three "row" vectors are the columns of the NTSC RGB→YIQ (BT.601-flavour)
// matrix as stored by the compiler for the shuffled MAC chain; RenderTile
// applies them as:  out.xyz = R'*R_col + G'*G_col + B'*B_col,
// where R'/G'/B' = sqrt( max(gain*RGB, FLT_MIN) ) — i.e. the matrix is
// applied in sqrt-companded space, matching Helium's linearised-for-shading
// convention.  The alpha lane (index 3 of xmm5) is preserved unmodified
// via `blendps $0x8` and written as `max(gain*a, FLT_MIN)` — NOT sqrt'd.
// -----------------------------------------------------------------------------

/** FLT_MIN clamp floor — xmm1 lane values @0x858f70. */
const EPS = Math.fround(1.1754943508222875e-38);

/** G column of the RGB→YIQ matrix @0x858f80. */
const GCOL_X = Math.fround(0.587);
const GCOL_Y = Math.fround(-0.2755);
const GCOL_Z = Math.fround(-0.523);

/** R column of the RGB→YIQ matrix @0x858f90. */
const RCOL_X = Math.fround(0.299);
const RCOL_Y = Math.fround(0.596);
const RCOL_Z = Math.fround(0.212);

/** B column of the RGB→YIQ matrix @0x858fa0. */
const BCOL_X = Math.fround(0.114);
const BCOL_Y = Math.fround(-0.321);
const BCOL_Z = Math.fround(0.311);

/**
 * shlRGB2YIQ — Helium HGNode that converts sqrt(gain·RGB) into a YIQ-space
 * triple using the NTSC matrix (BT.601-flavour), preserving alpha as a
 * plain gain·A lane.  See file header for the full ABI story.
 */
export class shlRGB2YIQ {
  /** vptr @ offset 0x00 — installed by C2 to point at vtable+0x10 @0xa1e738. */
  vptr: string = '';

  /**
   * `HGRef<HGParamBuffer>` at object offset 0x30 whose 16-byte payload is a
   * float32x4 gain vector applied per-pixel in RenderTile.  Stored as a
   * length-4 Float32Array to preserve single-precision semantics.
   * Layout at 0x30(%rdi) → (%rdi) after chase: xmm0 = (gainR, gainG, gainB, gainA).
   */
  paramGain: Float32Array = new Float32Array(4);

  /**
   * shlRGB2YIQ::shlRGB2YIQ() — Helium base ctor
   * __ZN10shlRGB2YIQC2Ev @0x0014c360.
   *
   * Disassembly (verbatim, otool -tV):
   *   0x14c360  pushq  %rbp
   *   0x14c362  movl   %esp, %ebp                ; frame setup (otool encoding
   *                                              ; artefact — real instruction
   *                                              ; is `movq %rsp,%rbp`).
   *   0x14c364  pushq  %rbx
   *   0x14c365  pushq  %rax                      ; 16-byte alignment
   *   0x14c366  movq   %rdi, %rbx                ; save `this`
   *   0x14c369  callq  __ZN6HGNodeC2Ev           ; HGNode::HGNode()
   *   0x14c36e  leaq   0x8d23c3(%rip), %rax      ; &vtable+0x10 @0xa1e738
   *   0x14c375  movq   %rax, (%rbx)              ; this->vptr = vtable[0..]
   *   0x14c378  addq   $0x8, %rsp
   *   0x14c37c  popq   %rbx
   *   0x14c37d  popq   %rbp
   *   0x14c37e  retq
   *
   * RIP-relative vptr install:
   *   0x14c36e + 7 + 0x8d23c3 = 0xa1e738  == &vtable[2] (payload start).
   *   (resolve.py: `shlRGB2YIQ vtable @0xa1e728; installed ptr 0xa1e738`).
   *
   * Chains into HGNode::HGNode() (undecoded — raises via HGNode_ctor).
   */
  static C2(self: shlRGB2YIQ): void {
    // @Helium 0x0014c369 — HGNode::HGNode() on `this`.
    HGNode_ctor(self);
    // @Helium 0x0014c36e..0x14c375 — install vptr @0xa1e738.
    self.vptr = 'shlRGB2YIQ_vtable@0xa1e738';
  }

  /**
   * shlRGB2YIQ::GetProgram(HGRenderer*) — Helium override
   * __ZN10shlRGB2YIQ10GetProgramEP10HGRenderer @0x0014c380.
   *
   * Disassembly (verbatim):
   *   0x14c380  pushq %rbp
   *   0x14c381  movq  %rsp, %rbp
   *   0x14c384  leaq  __ZL25shlRGB2YIQ_fragmentString(%rip), %rax
   *   0x14c38b  popq  %rbp
   *   0x14c38c  retq
   *
   * Returns a pointer to the file-scope `shlRGB2YIQ_fragmentString`
   * constant (the pre-compiled Metal fragment shader source blob embedded
   * in Helium's __TEXT __cstring; its exact byte offset varies with linker
   * layout but resolve.py reports it as the linker-name symbol
   * `shlRGB2YIQ_fragmentString`).  The `HGRenderer*` argument is
   * unused (the function does not touch %rsi/%rdi except for frame
   * spillover).
   */
  static GetProgram(_self: shlRGB2YIQ, _renderer: object | null): string {
    // @Helium 0x0014c384 — leaq shlRGB2YIQ_fragmentString(%rip), %rax
    // We return the string-symbol name here, not the compiled shader
    // payload — the payload is an opaque Metal source blob that lives in
    // Helium's own __cstring and would need a separate transcription pass
    // to inline (undecoded frontier).
    return 'shlRGB2YIQ_fragmentString@Helium';
  }

  /**
   * shlRGB2YIQ::RenderTile(HGTile*) — Helium CPU fallback path
   * __ZN10shlRGB2YIQ10RenderTileEP6HGTile @0x0014c390.
   *
   * Body: iterates over `height` rows of a rectangular tile, pairs pixels
   * two at a time for the main loop (SSE unroll ×2) and finishes any
   * odd trailing pixel with a scalar-lane tail; then a separate
   * height==1 fallback handles the single-row degenerate.
   *
   * PER-PIXEL:
   *   src4 = load4f(src)                                            @0x14c410
   *   src4 = src4 * gain                                            @0x14c416
   *   src4 = max(src4, EPS)                                         @0x14c421
   *   rs   = 1/sqrt(src4)  (SSE rsqrtps, hardware reciprocal-sqrt)  @0x14c427
   *   sq   = src4 * rs     (i.e. sqrt(src4))                        @0x14c42e
   *   G'   = sq.y broadcast * GCOL                                  @0x14c439/47
   *   R'   = sq.x broadcast * RCOL                                  @0x14c453/61
   *   RG   = R' + G'                                                @0x14c465
   *   B'   = sq.z broadcast * BCOL                                  @0x14c471/7a
   *   out.xyz = RG + B'                                             @0x14c47d
   *   out.w   = src4.w  (max(gain*a, EPS), NOT sqrt-companded)      @0x14c489
   *   store4f(dst, out)                                             @0x14c496
   *
   * The disassembly's `rsqrtps + mul` is the standard "fast sqrt" idiom;
   * we transcribe it as `Math.sqrt` here.  The runtime bit-parity gap
   * between rsqrtps-based and IEEE sqrt is documented but out of scope
   * for the raw port (would require a full 12-bit reciprocal-sqrt LUT
   * decode of the SSE micro-architecture — not present in Helium).
   *
   * CONTROL FLOW MIRROR (from asm):
   *   width = tile.x1 - tile.x0             @0x14c395/99  -> r9d
   *   y0    = tile.y0                       @0x14c39c    -> r10d
   *   height= tile.y1                       @0x14c3a0    -> r8d
   *   srcStride16 = tile.stride @0x58       @0x14c3a4    -> rax (i64)
   *   src   = tile.srcBase @0x50            @0x14c3a8    -> rcx
   *   dst   = tile.dstBase @0x10            @0x14c3ac    -> rdx
   *   gainPtr = self->[0x30]                @0x14c3b0    -> rdi
   *   gain  = load4f(gainPtr)               @0x14c3b4    -> xmm0
   *   if (width < 2) goto tail1  ; jb       @0x14c3b7/bb
   *   height -= y0                          @0x14c3c1
   *   // main row loop:
   *   //   pair loop while width_remaining > 1 (SSE ×2 unroll)
   *   //   scalar tail while width_remaining > 0
   *   //   advance src by srcStride16*16 and dst by dstStride16*16
   *   //   decrement `height`; loop until it hits zero.
   *   tail1: if (width == 1) do one-column loop instead;
   *          else fall through to return 0.
   *
   * The scalar tail lanes @0x14c4d0-0x14c51f (main-loop odd pixel) and
   * @0x14c550-0x14c59f (height==1 degenerate) use the exact same
   * mul/max/rsqrt/mul/shuffle/mac chain as the paired body, applied to a
   * single pixel — they exist so the SSE ×2 unroll can commit whole
   * lanes without OOB'ing on odd widths.
   *
   * @returns 0 (matches `xorl %eax, %eax` at 0x14c5a1 just before retq).
   */
  static RenderTile(self: shlRGB2YIQ, tile: HGTile): number {
    // @Helium 0x14c395/99 — width = tile.x1 - tile.x0
    const width = (tile.x1 | 0) - (tile.x0 | 0);
    // @Helium 0x14c39c — y0 = tile.y0
    const y0 = tile.y0 | 0;
    // @Helium 0x14c3a0 — height field (pre-subtract).
    let heightRem = tile.y1 | 0;
    // @Helium 0x14c3a4 — srcStride16 = tile[0x58] (int32 -> sign-extended).
    const srcStride16 = tile.srcStride16 | 0;
    // @Helium 0x14c3a8 — src base.
    let src = tile.srcBase;
    let srcOff = 0;
    // @Helium 0x14c3ac — dst base.
    let dst = tile.dstBase;
    let dstOff = 0;
    // @Helium 0x14c3b0/b4 — gain vec4 loaded from self[0x30] payload.
    const g = self.paramGain;
    const gainR = Math.fround(g[0]);
    const gainG = Math.fround(g[1]);
    const gainB = Math.fround(g[2]);
    const gainA = Math.fround(g[3]);

    // @Helium 0x14c3b7/bb — if (width < 2) goto tail-branch for width in {0,1}.
    if (width < 2) {
      // @Helium 0x14c526/2a — width==1 handled by dedicated loop;
      //                     any other value returns immediately.
      if (width !== 1) {
        // @Helium 0x14c5a1 — return 0.
        return 0;
      }
      // shlqAX by 4 @0x14c52c (srcStride16 -> srcStride bytes/16), then
      // r10 = -(height - y0) counter that increments toward zero.
      // We iterate `heightRem - y0` rows of one pixel each.
      const rows1 = heightRem - y0;
      for (let ry = 0; ry < rows1; ry++) {
        // @Helium 0x14c550-0x14c58b — 1-pixel version of the pair-loop
        // body, applied at src[0]/dst[0] of this row.
        const s0 = Math.fround(Math.fround(src[srcOff + 0]) * gainR);
        const s1 = Math.fround(Math.fround(src[srcOff + 1]) * gainG);
        const s2 = Math.fround(Math.fround(src[srcOff + 2]) * gainB);
        const s3 = Math.fround(Math.fround(src[srcOff + 3]) * gainA);
        const c0 = Math.fround(Math.max(s0, EPS));
        const c1 = Math.fround(Math.max(s1, EPS));
        const c2 = Math.fround(Math.max(s2, EPS));
        const c3 = Math.fround(Math.max(s3, EPS));
        // sqrt via rsqrtps*x @0x14c559-5c; here we transcribe as
        // Math.sqrt (IEEE — see comment above).
        const q0 = Math.fround(Math.sqrt(c0));
        const q1 = Math.fround(Math.sqrt(c1));
        const q2 = Math.fround(Math.sqrt(c2));
        // Matrix-mul chain @0x14c562-0x14c581: same as the pair body.
        const yx = Math.fround(
          Math.fround(q0 * RCOL_X)
          + Math.fround(q1 * GCOL_X)
          + Math.fround(q2 * BCOL_X)
        );
        const yy = Math.fround(
          Math.fround(q0 * RCOL_Y)
          + Math.fround(q1 * GCOL_Y)
          + Math.fround(q2 * BCOL_Y)
        );
        const yz = Math.fround(
          Math.fround(q0 * RCOL_Z)
          + Math.fround(q1 * GCOL_Z)
          + Math.fround(q2 * BCOL_Z)
        );
        // @0x14c585 blendps $8 — preserve alpha lane from src4.
        dst[dstOff + 0] = yx;
        dst[dstOff + 1] = yy;
        dst[dstOff + 2] = yz;
        dst[dstOff + 3] = c3;
        // @0x14c58e-0x14c599 — advance dst by dstStride16*16 (float32 units),
        // src by srcStride16*16.  (Strides are already scaled by 16 in the
        // asm via `shlq $4`; we index in float32-units so *4 per stride16.)
        dstOff += (tile.dstStride16 | 0) * 4;
        srcOff += srcStride16 * 4;
      }
      // @Helium 0x14c5a1 — return 0.
      return 0;
    }

    // @Helium 0x14c3c1 — height -= y0 (loop counter is remaining rows).
    heightRem -= y0;

    // Row loop.  Each iteration processes one row of `width` pixels using
    // an SSE ×2 unroll for pairs and a 1-pixel scalar tail for any odd
    // trailing pixel, then advances dst by dstStride16 and src by
    // srcStride16 (both scaled to bytes/16 in the asm).
    while (heightRem > 0) {
      // Pair loop mirror @0x14c407-0x14c4b5 — reset r10 (signed pixel
      // counter) and r11 (byte offset seed at 16).  We iterate over
      // pixel indices, doing 2 per step.
      let px = 0;
      while (px + 1 < width) {
        // Load two consecutive pixels @0x14c410 / 0x14c419.
        // xmm5 = pixel[px], xmm6 = pixel[px+1] (in float4 lanes).
        const b = (px * 4);
        const c = ((px + 1) * 4);
        // Multiply by gain @0x14c416/1e.
        const s0a = Math.fround(Math.fround(src[srcOff + b + 0]) * gainR);
        const s1a = Math.fround(Math.fround(src[srcOff + b + 1]) * gainG);
        const s2a = Math.fround(Math.fround(src[srcOff + b + 2]) * gainB);
        const s3a = Math.fround(Math.fround(src[srcOff + b + 3]) * gainA);
        const s0b = Math.fround(Math.fround(src[srcOff + c + 0]) * gainR);
        const s1b = Math.fround(Math.fround(src[srcOff + c + 1]) * gainG);
        const s2b = Math.fround(Math.fround(src[srcOff + c + 2]) * gainB);
        const s3b = Math.fround(Math.fround(src[srcOff + c + 3]) * gainA);
        // maxps EPS @0x14c421/24.
        const c0a = Math.fround(Math.max(s0a, EPS));
        const c1a = Math.fround(Math.max(s1a, EPS));
        const c2a = Math.fround(Math.max(s2a, EPS));
        const c3a = Math.fround(Math.max(s3a, EPS));
        const c0b = Math.fround(Math.max(s0b, EPS));
        const c1b = Math.fround(Math.max(s1b, EPS));
        const c2b = Math.fround(Math.max(s2b, EPS));
        const c3b = Math.fround(Math.max(s3b, EPS));
        // sqrt via rsqrtps*x @0x14c427-31 — see class-level note.
        const q0a = Math.fround(Math.sqrt(c0a));
        const q1a = Math.fround(Math.sqrt(c1a));
        const q2a = Math.fround(Math.sqrt(c2a));
        const q0b = Math.fround(Math.sqrt(c0b));
        const q1b = Math.fround(Math.sqrt(c1b));
        const q2b = Math.fround(Math.sqrt(c2b));
        // Broadcast + column MAC chain @0x14c439-0x14c485.
        //   xmm9  = q.y broadcast; *= GCOL              (@shufps $0x55 + mulps xmm2)
        //   xmm11 = q.x broadcast; *= RCOL; += xmm9     (@shufps $0x00 + mulps xmm3 + addps)
        //   xmm7  = q.z broadcast; *= BCOL; += xmm11    (@shufps $0xaa + mulps xmm4 + addps)
        const yxA = Math.fround(
          Math.fround(q0a * RCOL_X)
          + Math.fround(q1a * GCOL_X)
          + Math.fround(q2a * BCOL_X)
        );
        const yyA = Math.fround(
          Math.fround(q0a * RCOL_Y)
          + Math.fround(q1a * GCOL_Y)
          + Math.fround(q2a * BCOL_Y)
        );
        const yzA = Math.fround(
          Math.fround(q0a * RCOL_Z)
          + Math.fround(q1a * GCOL_Z)
          + Math.fround(q2a * BCOL_Z)
        );
        const yxB = Math.fround(
          Math.fround(q0b * RCOL_X)
          + Math.fround(q1b * GCOL_X)
          + Math.fround(q2b * BCOL_X)
        );
        const yyB = Math.fround(
          Math.fround(q0b * RCOL_Y)
          + Math.fround(q1b * GCOL_Y)
          + Math.fround(q2b * BCOL_Y)
        );
        const yzB = Math.fround(
          Math.fround(q0b * RCOL_Z)
          + Math.fround(q1b * GCOL_Z)
          + Math.fround(q2b * BCOL_Z)
        );
        // blendps $0x8 — keep alpha from src4 (pre-sqrt).  @0x14c489/8f
        dst[dstOff + b + 0] = yxA;
        dst[dstOff + b + 1] = yyA;
        dst[dstOff + b + 2] = yzA;
        dst[dstOff + b + 3] = c3a;
        dst[dstOff + c + 0] = yxB;
        dst[dstOff + c + 1] = yyB;
        dst[dstOff + c + 2] = yzB;
        dst[dstOff + c + 3] = c3b;
        px += 2;
      }
      // Scalar tail @0x14c4bb-0x14c521 — if there's a lone pixel left
      // (width is odd) run the single-pixel body once.  The asm computes
      // negl r10 / cmp r10, r9 to detect the leftover count; we simply
      // check `px < width` here (an equivalent invariant).
      while (px < width) {
        const b = (px * 4);
        const s0 = Math.fround(Math.fround(src[srcOff + b + 0]) * gainR);
        const s1 = Math.fround(Math.fround(src[srcOff + b + 1]) * gainG);
        const s2 = Math.fround(Math.fround(src[srcOff + b + 2]) * gainB);
        const s3 = Math.fround(Math.fround(src[srcOff + b + 3]) * gainA);
        const c0 = Math.fround(Math.max(s0, EPS));
        const c1 = Math.fround(Math.max(s1, EPS));
        const c2 = Math.fround(Math.max(s2, EPS));
        const c3 = Math.fround(Math.max(s3, EPS));
        const q0 = Math.fround(Math.sqrt(c0));
        const q1 = Math.fround(Math.sqrt(c1));
        const q2 = Math.fround(Math.sqrt(c2));
        const yx = Math.fround(
          Math.fround(q0 * RCOL_X)
          + Math.fround(q1 * GCOL_X)
          + Math.fround(q2 * BCOL_X)
        );
        const yy = Math.fround(
          Math.fround(q0 * RCOL_Y)
          + Math.fround(q1 * GCOL_Y)
          + Math.fround(q2 * BCOL_Y)
        );
        const yz = Math.fround(
          Math.fround(q0 * RCOL_Z)
          + Math.fround(q1 * GCOL_Z)
          + Math.fround(q2 * BCOL_Z)
        );
        dst[dstOff + b + 0] = yx;
        dst[dstOff + b + 1] = yy;
        dst[dstOff + b + 2] = yz;
        dst[dstOff + b + 3] = c3;
        px += 1;
      }
      // @Helium 0x14c3f0-0x14c401 — advance dst by dstStride16*16
      // (in float32 units: multiply by 4), src by srcStride16*16.
      srcOff += srcStride16 * 4;
      dstOff += (tile.dstStride16 | 0) * 4;
      heightRem -= 1;
    }

    // @Helium 0x14c5a1 — xor eax,eax ; retq.
    return 0;
  }

  /**
   * shlRGB2YIQ::~shlRGB2YIQ() — Helium base dtor
   * __ZN10shlRGB2YIQD1Ev @0x0014dfe0.
   *
   * Disassembly (verbatim):
   *   0x14dfe0  pushq %rbp
   *   0x14dfe1  movq  %rsp, %rbp
   *   0x14dfe4  popq  %rbp
   *   0x14dfe5  jmp   __ZN6HGNodeD2Ev      ; tail-call HGNode::~HGNode()
   */
  static D1(self: shlRGB2YIQ): void {
    // @Helium 0x0014dfe5 — jmp HGNode::~HGNode(); tail-call form.
    HGNode_dtor(self);
  }

  /**
   * shlRGB2YIQ::~shlRGB2YIQ() — Helium deleting dtor
   * __ZN10shlRGB2YIQD0Ev @0x0014dff0.
   *
   * Disassembly (verbatim):
   *   0x14dff0  pushq %rbp
   *   0x14dff1  movq  %rsp, %rbp
   *   0x14dff4  pushq %rbx
   *   0x14dff5  pushq %rax
   *   0x14dff6  movq  %rdi, %rbx
   *   0x14dff9  callq __ZN6HGNodeD2Ev              ; HGNode::~HGNode()
   *   0x14dffe  movq  %rbx, %rdi                   ; this -> arg0
   *   0x14e001  addq  $0x8, %rsp
   *   0x14e005  popq  %rbx
   *   0x14e006  popq  %rbp
   *   0x14e007  jmp   __ZN8HGObjectdlEPv           ; HGObject::operator delete
   */
  static D0(self: shlRGB2YIQ): void {
    // @Helium 0x0014dff9 — HGNode::~HGNode() on `this`.
    HGNode_dtor(self);
    // @Helium 0x0014e007 — tail-jmp HGObject::operator delete(this).
    HGObject_dtor(self);
  }
}

// -----------------------------------------------------------------------------
// HGTile POD — minimum structural surface used by RenderTile above.  Fields
// are named after the offsets observed in the asm; only these are read.
// -----------------------------------------------------------------------------

/**
 * HGTile — POD describing a rectangular tile of a source and destination
 * float4 buffer.  Only the fields consumed by shlRGB2YIQ::RenderTile are
 * modelled; the real HGTile at Helium runtime carries additional bookkeeping
 * beyond offset 0x60 that has not been decoded yet.
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
  /** @0x50 float32[] — source row-0 base (indexed in float32 units). */
  srcBase: Float32Array;
  /** @0x58 int32 — source row stride, measured in 16-byte units. */
  srcStride16: number;
}
