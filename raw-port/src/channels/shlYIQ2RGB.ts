/**
 * shlYIQ2RGB — Helium software renderer node that converts a YIQ f32×4-per-pixel
 * tile into an RGB f32×4-per-pixel tile with a per-node scale/gamma multiplier.
 *
 * Framework: Helium (macOS x86_64, FCP build).
 *
 * @classAddr Helium
 *   @0x000000000014c5b0  shlYIQ2RGB::shlYIQ2RGB()                 (C2 ctor)
 *   @0x000000000014c5d0  shlYIQ2RGB::GetProgram(HGRenderer*)      (returns shader-string ptr)
 *   @0x000000000014c5e0  shlYIQ2RGB::RenderTile(HGTile*)          (SIMD per-tile compute)
 *   @0x000000000014e010  shlYIQ2RGB::~shlYIQ2RGB()                (D1 dtor — tail-jmp base D2)
 *   @0x000000000014e020  shlYIQ2RGB::~shlYIQ2RGB()                (D0 deleting dtor)
 *
 * NATIVE HIERARCHY (proven by the dtors):
 *   shlYIQ2RGB inherits from HGNode (single inheritance). Evidence:
 *     - D1 @0x14e010..0x14e01a is exactly `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp
 *       HGNode::~HGNode()` — a plain tail-jmp to `__ZN6HGNodeD2Ev`. That is the classic
 *       thin-subclass D1 pattern: nothing to destruct here, just chain the base.
 *     - D0 @0x14e020..0x14e03c chains `HGNode::~HGNode()` (@0x14e029), then tail-jumps
 *       `HGObject::operator delete(void*)` (@0x14e037) — the object's memory is freed by
 *       the shared HGObject allocator/deleter used across the render graph.
 *     - The ctor @0x14c5b0 calls `HGNode::HGNode()` (@0x14c5b9) then stores a vtable
 *       pointer at (this+0x0): `leaq 0x8d23b3(%rip),%rax ; movq %rax,(%rbx)` — that RIP-
 *       relative destination resolves to 0xa1e978 in __DATA_CONST — the class's vtable.
 *
 * OWN-FIELD INVENTORY: NONE. RenderTile reads `0x30(%rdi)` (@0x14c600) — this field is
 * inherited from HGNode (the render-graph node's "constants block" / per-node scale
 * vector pointer), NOT owned by shlYIQ2RGB. GetProgram returns a static string ptr and
 * likewise touches no `this` state. So sizeof(shlYIQ2RGB) == sizeof(HGNode); we add no
 * fields here.
 *
 * -----------------------------------------------------------------------------
 * ── HGTile layout consumed by RenderTile (proven by the loads @0x14c5e5..0x14c604) ──
 *
 *   +0x00  int32  left          (Width() base — see raw-port/src/render/HGTile.ts)
 *   +0x04  int32  top
 *   +0x08  int32  right         (Width  = right - left, read @0x14c5e5..0x14c5e9)
 *   +0x0c  int32  bottom        (bottom lane, read into r8d @0x14c5f0)
 *   +0x10  ptr    dstPixels    (destination f32×4 pixel buffer, read into rdx @0x14c5fc)
 *   +0x18  int32  dstRowStride16 (row stride in units of 16-byte pixels, read via
 *                                 `movslq 0x18(%rsi),%r10 ; shlq $4,%r10` — the ×16 is
 *                                 the byte-stride multiplier for f32×4 pixels; see
 *                                 @0x14c643..0x14c647 and @0x14c7d9..0x14c7dd)
 *   +0x50  ptr    srcPixels    (source YIQ f32×4 pixel buffer, read into rcx @0x14c5f8)
 *   +0x58  int32  srcRowStride16 (source row stride in units of 16-byte pixels, read via
 *                                 `movslq 0x58(%rsi),%rax` @0x14c5f4 then `shlq $4,%rax`
 *                                 @0x14c617/@0x14c777 to make byte stride)
 *
 * The tile is scanned as a 2D grid: for `h = bottom - top` rows starting at `dst`/`src`,
 * each row processes `w = right - left` pixels of 16 bytes each, and after each row
 * `dst += dstRowStride16 * 16` (@0x14c643) and `src += srcRowStride16 * 16` (@0x14c640).
 *
 * -----------------------------------------------------------------------------
 * ── HGNode constants block layout consumed by RenderTile ──
 *
 *   this+0x30  ptr   HGNodeConstantsBlock*   (@0x14c600 `movq 0x30(%rdi),%rdi`)
 *   *(that+0)  f32×4 nodeScale               (@0x14c604 `movaps (%rdi),%xmm0`)
 *
 * The four floats at that pointer form the per-tile scale/gamma-scale vector that the
 * inner loops multiply the squared YIQ→RGB result by (see xmm0 mults @0x14c6d1/6d4/756/
 * 7cd). The lane 3 (alpha lane) of xmm0 is unused because the final `blendps $0x8` copies
 * the source alpha in verbatim. Concretely: the transform equation per pixel is
 *
 *   linRGB.xyz = nodeScale.xyz * max( YIQmatrixMul(y,i,q), FLT_MIN_broadcast )^2
 *   out.rgba   = { linRGB.x, linRGB.y, linRGB.z, srcAlpha }
 *
 * (The `max(., FLT_MIN)` clamp is a positive-normal floor before squaring — the standard
 * NTSC-YIQ→display trick to avoid signed values entering the gamma-2 curve. It is NOT a
 * clamp to 0: FLT_MIN = 1.1754943508e-38 is the smallest positive normal float, so any
 * negative pre-gamma value is clipped to +FLT_MIN, which squared is subnormal and rounds
 * to 0 on write — this is the direct TS mapping of `maxps xmm4` followed by squaring.)
 *
 * -----------------------------------------------------------------------------
 * ── YIQ→RGB matrix constants @ Helium __TEXT __const 0x858fb0..0x858fdf ──
 *
 * These four v4f32 constants (read verbatim from the shipped Helium binary's x86_64
 * slice) are the columns of the 3×3 YIQ→RGB conversion matrix, replicated to broadcast
 * shape (lane 3 always 0.0f, ignored on write via the final `blendps` from the source):
 *
 *   @Helium 0x858fb0  YIQ_I_COL = { +0.9555580020f, −0.2715449929f, −1.1080299616f, 0f }
 *                     (I-chroma column; the 2nd shufps($0x55) broadcast of the source's
 *                      Y-I-Q-A packed pixel yields the "I" lane replicated 4-wide, mul'd
 *                      by xmm1 @0x14c67b/@0x14c67e)
 *   @Helium 0x858fc0  YIQ_Y_COL = { +1.0004800558f, +0.9998639822f, +0.9994459748f, 0f }
 *                     (Y-luma column; the shufps($0x00) broadcast of lane 0 = "Y",
 *                      mul'd by xmm2 @0x14c694/@0x14c698)
 *   @Helium 0x858fd0  YIQ_Q_COL = { +0.6195489764f, −0.6467859745f, +1.7054200172f, 0f }
 *                     (Q-chroma column; the shufps($0xaa) broadcast of lane 2 = "Q",
 *                      mul'd by xmm3 @0x14c6b4/@0x14c6b7)
 *   @Helium 0x858f70  YIQ_MINPOS = { +1.1754943508e-38f, +1.1754943508e-38f,
 *                                    +1.1754943508e-38f, +0f }
 *                     (positive-normal floor, one bit above zero (0x00008000 per lane);
 *                      maxps @0x14c6c3/@0x14c6c6 clamps against it before squaring)
 *
 * Byte read from the shipped binary (x86_64 slice, file offset 0x4000 + VMA):
 *   0x858fb0: 73 9f 74 3f  f2 07 8b be  ed d3 8d bf  00 00 00 00
 *   0x858fc0: bb 0f 80 3f  16 f7 7f 3f  b1 db 7f 3f  00 00 00 00
 *   0x858fd0: c3 9a 1e 3f  c4 93 25 bf  34 4b da 3f  00 00 00 00
 *   0x858f70: 00 00 80 00  00 00 80 00  00 00 80 00  00 00 00 00
 *
 * -----------------------------------------------------------------------------
 * ── shlYIQ2RGB_fragmentString @ Helium __ZL25shlYIQ2RGB_fragmentString ──
 *
 * A file-scope (`ZL` mangling prefix ⇒ internal-linkage) C-string constant. It carries the
 * OpenGL/Metal FRAGMENT-SHADER SOURCE that a hardware renderer path uses when doing the
 * same YIQ→RGB conversion on the GPU (versus the software CPU path in RenderTile). The
 * bytes of that shader string are NOT disassembled here (data, not code) and would be a
 * separate shader-transcription task if needed for shader-parity work.
 *
 * -----------------------------------------------------------------------------
 */

/**
 * Minimal HGNode-facade surface `shlYIQ2RGB` touches. We do NOT model the real HGNode's
 * vtable here — the ctor's `movq %rax,(%rbx)` (@0x14c5c5) which installs shlYIQ2RGB's
 * vtable at offset 0x0 is a native-ABI detail invisible to TS. We only care about the
 * ONE field the class reads: `this+0x30` → the constants block, whose first 16 bytes are
 * the {r,g,b,_} node scale vector consumed by RenderTile.
 */
export interface HGNodeLikeForYIQ2RGB {
  /**
   * `this+0x30` — inherited HGNode field. Points at a 16-byte-aligned f32×4 block whose
   * first vector is the per-node scale multiplier applied post-gamma. Read at @0x14c600
   * (`movq 0x30(%rdi),%rdi`) then `movaps (%rdi),%xmm0` @0x14c604.
   */
  constantsBlockScaleRGB: readonly [number, number, number, number];
}

/** HGTile fields RenderTile touches. See the ASCII layout in the class banner. */
export interface HGTileLikeForYIQ2RGB {
  /** @field +0x00  int32  left       — read via `movl (%rsi),...` inside the width sub */
  left: number;
  /** @field +0x04  int32  top        — read at @0x14c5ec  `movl 0x4(%rsi),%r10d` */
  top: number;
  /** @field +0x08  int32  right      — read at @0x14c5e5  `movl 0x8(%rsi),%r9d` */
  right: number;
  /** @field +0x0c  int32  bottom     — read at @0x14c5f0  `movl 0xc(%rsi),%r8d` */
  bottom: number;
  /**
   * @field +0x10  ptr    dstPixels  — read at @0x14c5fc  `movq 0x10(%rsi),%rdx`.
   * A tightly-packed row-major f32×4-per-pixel buffer (BGRA/RGBA lane order — the port
   * treats lanes as {r,g,b,a} in vector-index order because that is how the maths
   * assemble the columns; see the "column mul" section below).
   */
  dstPixels: Float32Array;
  /** Byte offset within `dstPixels` where the tile origin lives (native uses the raw
   * pointer; JS needs an explicit index because Float32Arrays don't do pointer arithmetic).
   * Native semantic: `dst = *(f32x4*)(dstPixels + 0)` at the origin, so this defaults to 0.
   */
  dstOffsetFloats: number;
  /** @field +0x18  int32  dstRowStride16  — row stride in 16-byte (=4-float) units.
   *  Native: `movslq 0x18(%rsi),%r10 ; shlq $4,%r10` @0x14c643-0x14c647 makes byte stride. */
  dstRowStride16: number;
  /**
   * @field +0x50  ptr    srcPixels  — read at @0x14c5f8  `movq 0x50(%rsi),%rcx`.
   * The tile's source YIQ f32×4 buffer, packed identically to dstPixels.
   */
  srcPixels: Float32Array;
  /** Byte-offset analogue of dstOffsetFloats — the origin of the source tile inside
   * `srcPixels`. Defaults to 0 (native passes the raw pointer). */
  srcOffsetFloats: number;
  /** @field +0x58  int32  srcRowStride16 — read at @0x14c5f4  `movslq 0x58(%rsi),%rax`,
   *  then `shlq $4,%rax` @0x14c617/@0x14c777 to make byte stride. */
  srcRowStride16: number;
}

/**
 * The shader-source string returned by GetProgram is a symbol pointer to a `.rodata`
 * C-string (`__ZL25shlYIQ2RGB_fragmentString`, @0x14c5d4 lea). We do not disassemble
 * the string contents; we surface a getter/setter so a host can register the real
 * shipped shader text if needed for GPU-path parity work. The default is null (the
 * software RenderTile path is fully implemented and does NOT need the string).
 */
let g_fragmentString: string | null = null;
export function setShlYIQ2RGBFragmentString(s: string | null): void {
  g_fragmentString = s;
}

// ── YIQ→RGB matrix constants (verbatim byte-read from Helium __TEXT __const). ──
// Each is stored as an f32-precision literal; we wrap in Math.fround at every consumer
// (Math.fround(x*y) etc.) so the SSE ps-lane semantics are byte-faithful. See class
// banner for the raw hex bytes and their VMAs.
const YIQ_I_COL: readonly [number, number, number, number] = [
  Math.fround(0.9555580019950867),   // @0x858fb0 lane 0 — hex 0x3f749f73
  Math.fround(-0.2715449929237366),  // @0x858fb4 lane 1 — hex 0xbe8b07f2
  Math.fround(-1.1080299615859985),  // @0x858fb8 lane 2 — hex 0xbf8dd3ed
  Math.fround(0.0),                  // @0x858fbc lane 3 — hex 0x00000000
];
const YIQ_Y_COL: readonly [number, number, number, number] = [
  Math.fround(1.000480055809021),    // @0x858fc0 lane 0 — hex 0x3f800fbb
  Math.fround(0.9998639822006226),   // @0x858fc4 lane 1 — hex 0x3f7ff716
  Math.fround(0.9994459748268127),   // @0x858fc8 lane 2 — hex 0x3f7fdbb1
  Math.fround(0.0),                  // @0x858fcc lane 3 — hex 0x00000000
];
const YIQ_Q_COL: readonly [number, number, number, number] = [
  Math.fround(0.6195489764213562),   // @0x858fd0 lane 0 — hex 0x3f1e9ac3
  Math.fround(-0.6467859745025635),  // @0x858fd4 lane 1 — hex 0xbf2593c4
  Math.fround(1.7054200172424316),   // @0x858fd8 lane 2 — hex 0x3fda4b34
  Math.fround(0.0),                  // @0x858fdc lane 3 — hex 0x00000000
];
/**
 * FLT_MIN broadcast — the positive-normal floor `maxps` clamps against before squaring.
 * Native bytes 0x00008000 per lane = 1.1754943508222875e-38f (smallest positive-normal
 * f32). Any pre-gamma channel below this gets snapped up to it; that squared is a
 * subnormal that rounds to 0 on the f32 write, which is the direct TS mapping of the
 * `maxps xmm4 ; mulps ; mulps xmm0` sequence @0x14c6c3..0x14c6d4.
 */
const YIQ_MINPOS: readonly [number, number, number, number] = [
  Math.fround(1.1754943508222875e-38), // @0x858f70 lane 0 — hex 0x00800000
  Math.fround(1.1754943508222875e-38), // @0x858f74 lane 1 — hex 0x00800000
  Math.fround(1.1754943508222875e-38), // @0x858f78 lane 2 — hex 0x00800000
  Math.fround(0.0),                    // @0x858f7c lane 3 — hex 0x00000000
];

/**
 * shlYIQ2RGB — Helium HGNode subclass: software YIQ→RGB per-tile converter.
 *
 * @classAddr Helium @0x14c5b0 (ctor), @0x14e010/@0x14e020 (dtors).
 */
export class shlYIQ2RGB {
  /**
   * The HGNode subobject we borrow the `constantsBlockScaleRGB` field from. The native
   * class embeds an HGNode at offset 0x0; we hold a facade reference instead of trying
   * to model the C++ inheritance layout — the ONLY field RenderTile reads through the
   * base is `this+0x30`, so this is complete.
   */
  private node: HGNodeLikeForYIQ2RGB;

  /**
   * shlYIQ2RGB::shlYIQ2RGB() — @0x14c5b0 (C2). Body:
   *   0x14c5b6  movq %rdi,%rbx                    ; this
   *   0x14c5b9  callq __ZN6HGNodeC2Ev              ; HGNode::HGNode()  — base ctor
   *   0x14c5be  leaq 0x8d23b3(%rip),%rax          ; &shlYIQ2RGB::vtable @ 0xa1e978 (__DATA_CONST)
   *   0x14c5c5  movq %rax,(%rbx)                  ; (this+0x0) = vtable
   *   0x14c5cd  ret
   * In TS the vtable-install is invisible — the class methods on this object ARE the
   * vtable. All we do here is remember the HGNode-like facade the caller wired up.
   */
  constructor(node: HGNodeLikeForYIQ2RGB) {
    this.node = node;
  }

  /**
   * shlYIQ2RGB::GetProgram(HGRenderer*) — @0x14c5d0. Byte-for-byte:
   *   0x14c5d4  leaq __ZL25shlYIQ2RGB_fragmentString(%rip),%rax
   *   0x14c5db  popq %rbp
   *   0x14c5dc  ret
   * Returns a `const char*` to the internal-linkage fragment shader source; the
   * `HGRenderer*` argument is IGNORED (no read of %rsi). We mirror by returning the
   * registered fragment-string (or null if none installed).
   *
   * @methodAddr Helium @0x14c5d0
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  GetProgram(_renderer: unknown): string | null {
    // @0x14c5d4  leaq __ZL25shlYIQ2RGB_fragmentString(%rip),%rax  — internal-linkage sym
    return g_fragmentString;
  }

  /**
   * shlYIQ2RGB::RenderTile(HGTile* tile) — @0x14c5e0. The SIMD hot loop that transforms
   * one tile of YIQ f32×4 pixels into RGB f32×4 pixels. Returns 0 (`xorl %eax,%eax`
   * @0x14c7ec — a plain "success/no error" int return).
   *
   * ── Control-flow map (mirrors the asm exactly) ──
   *
   *   prologue @0x14c5e0..0x14c604:
   *       w  = (int32) tile.right  - tile.left            ; @0x14c5e5..0x14c5e9  r9d
   *       h0 = (int32) tile.bottom - tile.top             ; edx=tile.top not needed alone
   *       h  = tile.bottom - tile.top                     ; @0x14c611 subl r10d,r8d
   *       (r10d holds `top`, r8d holds `bottom` — the difference is the row count)
   *       srcStrideBytes = ((int64)tile.srcRowStride16) << 4  ; @0x14c5f4/@0x14c617/@0x14c777
   *       src            = tile.srcPixels                    ; @0x14c5f8  rcx
   *       dst            = tile.dstPixels                    ; @0x14c5fc  rdx
   *       nodeScale      = *(f32x4*)(this+0x30 → +0x0)       ; @0x14c600..0x14c604  xmm0
   *
   *   dispatch @0x14c607..0x14c60b: `cmpl $2,%r9d ; jb 0x14c771`
   *     if w  < 2  → jump to the "narrow" tail  @0x14c771
   *     else (w ≥ 2) fall into the two-at-a-time main loop
   *
   *   MAIN LOOP  (w ≥ 2)  @0x14c611..0x14c76c:
   *     Iterates over `h` rows. Per row scans left→right two pixels at a time (unrolled
   *     ×2 SIMD) then a scalar tail for the final pixel if `w` is odd.
   *     Row-advance @0x14c640..0x14c651: `src += srcStrideBytes ; dst += (dstStride16<<4)`;
   *     `--h` and if zero jump to the epilogue @0x14c7ec.
   *
   *     Two-at-a-time SIMD inner loop @0x14c657..0x14c704:
   *       xmm6 = load 16 bytes of src[k-1]  (offset -0x10(%rcx,%r11))   ; @0x14c660
   *       xmm5 = load 16 bytes of src[k]    (offset (%rcx,%r11))         ; @0x14c666
   *
   *       ; --- compute for xmm6 (pixel A) ---
   *       xmm7 = shufps(xmm6, 0x55) = xmm6.lane1 broadcast (= "I")       ; @0x14c66b/6e
   *       xmm7 *= xmm1 (YIQ_I_COL)                                        ; @0x14c67b
   *       xmm9 = shufps(xmm6, 0x00) = xmm6.lane0 broadcast (= "Y")       ; @0x14c682/86
   *       xmm9 *= xmm2 (YIQ_Y_COL); xmm9 += xmm7                          ; @0x14c694/98
   *       xmm7 = shufps(xmm6, 0xaa) = xmm6.lane2 broadcast (= "Q")       ; @0x14c6a4/a7
   *       xmm7 *= xmm3 (YIQ_Q_COL); xmm7 += xmm9                          ; @0x14c6b4/b7
   *       (⇒ xmm7 = Y*Y_COL + I*I_COL + Q*Q_COL)
   *
   *       ; --- compute for xmm5 (pixel B), same shape --- @0x14c672..0x14c6bf
   *
   *       xmm7 = maxps(xmm7, xmm4=YIQ_MINPOS)                             ; @0x14c6c3
   *       xmm8 = maxps(xmm8, xmm4=YIQ_MINPOS)                             ; @0x14c6c6
   *       xmm7 *= xmm7                                                    ; @0x14c6ca  (gamma 2)
   *       xmm8 *= xmm8                                                    ; @0x14c6cd
   *       xmm7 *= xmm0=nodeScale                                          ; @0x14c6d1
   *       xmm8 *= xmm0                                                    ; @0x14c6d4
   *       xmm7 = blendps(xmm7, xmm6, 0x8) → lane3 from source-A alpha     ; @0x14c6d8
   *       xmm8 = blendps(xmm8, xmm5, 0x8) → lane3 from source-B alpha     ; @0x14c6de
   *       store xmm7 → dst[k-1]  (offset -0x10(%rdx,%r11))                 ; @0x14c6e5
   *       store xmm8 → dst[k]    (offset (%rdx,%r11))                      ; @0x14c6eb
   *       r11 += 0x20; loop counters: `r10 -= 2, r10+w-2 > 1 → keep going` @0x14c6f0..0x14c704
   *
   *     After the unrolled body, if `-r10 (= number remaining) < w`, run a scalar tail
   *     loop @0x14c716..0x14c76a that does the final one-pixel step with the same math
   *     but no unroll: load xmm5 = src[k], compute Y*Y+I*I+Q*Q (using xmm1/2/3), maxps
   *     against xmm4, square, mul by nodeScale, blend source alpha into lane 3, store.
   *
   *   NARROW-PATH  (w == 1) @0x14c771..0x14c7ea:
   *     `cmpl $1,%r9d ; jne 0x14c7ec` — if w == 0 exit; if w == 1 run the "one pixel per
   *     row for `h` rows" loop @0x14c7a0..0x14c7ea. The math per pixel is IDENTICAL to
   *     the scalar tail above; the constants (xmm1/2/3/4) are re-loaded because they got
   *     clobbered on the dispatch path (this branch does not fall through the main
   *     loop's earlier setup). Rows are advanced via
   *        `dst += (dstStride16<<4) ; src += (srcStride16<<4) ; ++r10d ; jne loop`
   *     with r10d = (-h) so incrementing to zero terminates.
   *
   *   epilogue @0x14c7ec..0x14c7f0: `xorl %eax,%eax ; pop rbx ; pop rbp ; ret`  — return 0.
   *
   * We fold all three inner shapes (2-wide unroll, scalar tail after unroll, narrow-path
   * scalar) into ONE per-pixel routine `perPixel()`. That is a direct TS mapping — the
   * unroll in native is an optimization, not a semantic; both the unrolled and the two
   * scalar paths compute the identical (nodeScale * max(matmul,FLT_MIN)^2, srcAlpha)
   * function on a single pixel. Rolling to one routine collapses zero behavioural
   * difference AND makes each pixel's `Math.fround` chain audit-trivial (see the oracle
   * gate — bit-exact against the shipped FCP symbol).
   *
   * @methodAddr Helium @0x14c5e0
   */
  RenderTile(tile: HGTileLikeForYIQ2RGB): number {
    // @0x14c5e5..0x14c5e9  w  = tile.right - tile.left
    const w = (tile.right | 0) - (tile.left | 0);
    // @0x14c611  h  = tile.bottom - tile.top    (top is @0x14c5ec r10d, bottom @0x14c5f0 r8d)
    const h = (tile.bottom | 0) - (tile.top | 0);

    // @0x14c5f4/@0x14c617/@0x14c777  srcRowStride16 sign-extended, then <<4 gives byte
    // stride. In Float32Array-index units, byte-stride/4 = srcRowStride16 * 4 floats.
    const srcRowStrideFloats = (tile.srcRowStride16 | 0) * 4;
    // @0x14c643..0x14c647  dstRowStride16 * 16 → same conversion.
    const dstRowStrideFloats = (tile.dstRowStride16 | 0) * 4;

    // @0x14c600/@0x14c604  xmm0 = *(f32x4*)(this+0x30 -> +0x0)  = nodeScale
    const ns = this.node.constantsBlockScaleRGB;
    const nsR = Math.fround(ns[0]);
    const nsG = Math.fround(ns[1]);
    const nsB = Math.fround(ns[2]);
    // ns[3] is READ into xmm0 lane 3 but IGNORED downstream (final blendps re-copies the
    // source alpha into lane 3), so we do not consume it.

    // @0x14c607..0x14c60b  cmpl $2,%r9d ; jb 0x14c771 (=> narrow)  — but note also
    // @0x14c771..0x14c775  `cmpl $1,%r9d ; jne epilogue` — so w == 0 exits with a zero-
    // pixel no-op, w == 1 runs the narrow loop, w >= 2 runs the main loop. All three
    // shapes share the SAME per-pixel maths (unroll vs no-unroll only).
    if (w <= 0 || h <= 0) {
      // @0x14c7ec  xorl %eax,%eax ; ret
      return 0;
    }

    // Per-pixel routine (direct TS mapping of the SIMD inner body @0x14c66b..0x14c6eb,
    // @0x14c72c..0x14c75f, @0x14c7a3..0x14c7d6 — all three are the identical function).
    const dst = tile.dstPixels;
    const src = tile.srcPixels;

    let rowSrc = tile.srcOffsetFloats | 0;
    let rowDst = tile.dstOffsetFloats | 0;

    for (let y = 0; y < h; y++) {
      let sOff = rowSrc;
      let dOff = rowDst;
      for (let x = 0; x < w; x++) {
        // Load the source YIQA quad. Native `movaps (%rcx,%r11),%xmm5` @0x14c666/etc.
        // Lane 0 = Y, lane 1 = I, lane 2 = Q, lane 3 = A (alpha) — the shufps masks
        // 0x00/0x55/0xaa broadcast lanes 0/1/2 respectively.
        const Y = Math.fround(src[sOff + 0]);
        const I = Math.fround(src[sOff + 1]);
        const Q = Math.fround(src[sOff + 2]);
        const A = Math.fround(src[sOff + 3]);

        // matmul: out = Y*Y_COL + I*I_COL + Q*Q_COL   (@0x14c67b..0x14c6bf)
        // Each mul/add is single-precision — Math.fround around each op keeps SSE-ps
        // rounding semantics bit-faithful. Order:  I first, then Y+=I, then Q+=(Y+I).
        // Native does the I mul first (@0x14c67b `mulps xmm1,xmm7`), then the Y mul
        // (@0x14c694), then adds Y onto I result (@0x14c698 `addps xmm7,xmm9`), then
        // the Q mul (@0x14c6b4), then adds Q onto the running sum (@0x14c6b7 `addps
        // xmm9,xmm7`). We match that operand order lane-by-lane below to preserve
        // rounding down to the LSB.
        const iR = Math.fround(I * YIQ_I_COL[0]);
        const iG = Math.fround(I * YIQ_I_COL[1]);
        const iB = Math.fround(I * YIQ_I_COL[2]);
        const yR = Math.fround(Y * YIQ_Y_COL[0]);
        const yG = Math.fround(Y * YIQ_Y_COL[1]);
        const yB = Math.fround(Y * YIQ_Y_COL[2]);
        // "Y + I" in the same lane order as the SSE addps
        const yiR = Math.fround(yR + iR);
        const yiG = Math.fround(yG + iG);
        const yiB = Math.fround(yB + iB);
        const qR = Math.fround(Q * YIQ_Q_COL[0]);
        const qG = Math.fround(Q * YIQ_Q_COL[1]);
        const qB = Math.fround(Q * YIQ_Q_COL[2]);
        // "sum = Q + (Y+I)"  matching @0x14c6b7  `addps xmm9,xmm7`  (xmm7 was the Q
        // result; the ADD wrote xmm7 = xmm7 + xmm9  — i.e. Q_result + YI_result). Since
        // SSE addps is fully associative-under-round for two operands, the order of the
        // + does not change the f32 result — but we preserve the exact operand order
        // (Q on the LEFT of the +) to mirror the encoding one-to-one.
        let sR = Math.fround(qR + yiR);
        let sG = Math.fround(qG + yiG);
        let sB = Math.fround(qB + yiB);

        // @0x14c6c3  maxps xmm4  — clamp against FLT_MIN broadcast (positive-normal floor)
        sR = sR > YIQ_MINPOS[0] ? sR : YIQ_MINPOS[0];
        sG = sG > YIQ_MINPOS[1] ? sG : YIQ_MINPOS[1];
        sB = sB > YIQ_MINPOS[2] ? sB : YIQ_MINPOS[2];

        // @0x14c6ca  mulps xmm7,xmm7 — square (gamma 2)
        sR = Math.fround(sR * sR);
        sG = Math.fround(sG * sG);
        sB = Math.fround(sB * sB);

        // @0x14c6d1  mulps xmm0,xmm7 — multiply by per-node scale
        sR = Math.fround(sR * nsR);
        sG = Math.fround(sG * nsG);
        sB = Math.fround(sB * nsB);

        // @0x14c6d8  blendps $0x8 — lane 3 taken from source (alpha passthrough)
        dst[dOff + 0] = sR;
        dst[dOff + 1] = sG;
        dst[dOff + 2] = sB;
        dst[dOff + 3] = A;

        sOff += 4;
        dOff += 4;
      }
      // @0x14c640..0x14c64b  src += srcStrideBytes ; dst += (dstStride16<<4)
      rowSrc += srcRowStrideFloats;
      rowDst += dstRowStrideFloats;
    }

    // @0x14c7ec  xorl %eax,%eax ; ret  — return 0
    return 0;
  }

  /**
   * shlYIQ2RGB::~shlYIQ2RGB() — D1 @0x14e010. Native body is exactly
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZN6HGNodeD2Ev
   * i.e. "chain the base HGNode dtor" — this class has no own destructible members.
   * D2 (base-object dtor) has the same shape by convention; the exported symbols are
   * both stubbed to the same behaviour by ICF in shipped Clang builds.
   *
   * @dtorAddr Helium D1 @0x14e010
   *
   * In TS we have no destructor semantics tied to malloc lifetimes; this method exists
   * only to model the observable "chain to HGNode's dtor" for callers that hold an
   * explicit disposal contract. It is a no-op body — HGNode's dtor is likewise a
   * no-op at the TS layer (see HGPagePullTexturesGuard.ts for the same convention).
   */
  destroy(): void {
    // @0x14e015  jmp __ZN6HGNodeD2Ev  — chain base dtor (no observable JS effect).
  }

  /**
   * shlYIQ2RGB::~shlYIQ2RGB() — D0 @0x14e020 (deleting dtor). Native body:
   *   0x14e029  callq __ZN6HGNodeD2Ev            ; HGNode::~HGNode()
   *   0x14e037  jmp   __ZN8HGObjectdlEPv         ; HGObject::operator delete(void*)
   * i.e. chain base dtor then free the object via HGObject's shared deleter. In TS the
   * "operator delete" is unmodelable (GC does that); we only preserve the observable
   * "chain to HGNode's dtor" — after which the JS object becomes eligible for GC once
   * the caller drops it, which is the direct TS mapping of the native free.
   *
   * @dtorAddr Helium D0 @0x14e020
   */
  deletingDestroy(): void {
    // @0x14e029  callq HGNode::~HGNode()
    this.destroy();
    // @0x14e037  jmp HGObject::operator delete(void*) — no TS analog (GC handles free).
  }
}
