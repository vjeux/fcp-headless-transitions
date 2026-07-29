// raw-port/src/render/HGGSqTens.ts
//
// FCP `HGGSqTens` — Helium render-graph node: a "structure-tensor / sum-of-squares"
// per-pixel filter that consumes TWO RGBA input tiles (A, B) and writes a single
// RGBA output tile whose channels are the tensor components used by downstream
// motion / edge / cross-correlation analysis:
//
//     out.r = A·A     (|A_rgb|² — the squared magnitude of the RGB triplet in A)
//     out.g = A·B     (A_rgb · B_rgb — the dot product of the two RGB triplets)
//     out.b = B·B     (|B_rgb|² — the squared magnitude of the RGB triplet in B)
//     out.a = 1.0     (fixed weight/count lane; used by downstream summation)
//
// This mapping is doubly-attested:
//   (1) The ARB-fragment-program string in the GetProgram helper (data-only string
//       constant `HGGSqTens_fragmentString` at Helium file offset 0x85e410) is
//       literally the shader:
//          TEX r0.xyz,$f0,texture[0],RECT   ; r0 = A.rgb
//          TEX r1.xyz,$f1,texture[1],RECT   ; r1 = B.rgb
//          DP3 $o0.y,r1,r0                  ; out.g = A·B
//          DP3 $o0.z,r1,r1                  ; out.b = |B|²
//          DP3 $o0.x,r0,r0                  ; out.r = |A|²
//          END                               ; out.a = default = 1.0
//   (2) The CPU-fallback SSE loop in RenderTile @0x1c29d0 recomputes exactly the
//       same four output lanes via a sequence of mulps + haddps + blend (see the
//       full annotated transcription below).
//
// Framework: Helium (/Applications/Final Cut Pro.app/Contents/Frameworks/
//            Helium.framework/Versions/A/Helium; x86_64 fat sub-arch; fat-slice
//            offset 0x4000. All VAs below are unadjusted VM addresses from
//            `otool -tV`/`llvm-objdump`).
//
// FCP method addresses (from nm | c++filt):
//   0x001c2960  HGGSqTens::HGGSqTens()            [C1 == C2, single body]
//   0x001c2980  HGGSqTens::GetProgram(HGRenderer*)
//   0x001c2990  HGGSqTens::GetDOD(HGRenderer*, int, HGRect)
//   0x001c29b0  HGGSqTens::GetROI(HGRenderer*, int, HGRect)
//   0x001c29d0  HGGSqTens::RenderTile(HGTile*)           [PURE math body — ported]
//   0x001c3bf0  HGGSqTens::~HGGSqTens()           [D1: tail-jmp HGNode::~HGNode()]
//   0x001c3c00  HGGSqTens::~HGGSqTens()           [D0: chain to HGObject::operator delete]
//   (Symbol `HGGSqTens_fragmentString` is a static-linkage cstring @0x85e410.)
//
// VTABLE and struct layout:
//   The ctor @0x1c296e writes `leaq 0x865b13(%rip),%rax; movq %rax,(%rbx)` which
//   resolves to vtable address 0x1c2975 + 0x865b13 = 0xa28488 (Helium file offset;
//   this is the HGGSqTens-specific vtable that carries GetProgram/GetDOD/GetROI/
//   RenderTile slots). The class only has the HGNode base subobject and no
//   additional data members (the ctor never writes past offset 0), so:
//     HGGSqTens {
//       +0x000  vptr = 0xa28488
//       +0x008..sizeof(HGNode)  HGNode base subobject
//     }
//
// HGTile struct layout (recovered from the offset reads in RenderTile @0x1c29d0):
//   +0x00  int32   x0 (left);  +0x04  int32   y0 (top)
//   +0x08  int32   x1 (right); +0x0c  int32   y1 (bottom)   ; width = x1-x0, height = y1-y0
//   +0x10  void*   dstBase       (destination RGBA pixel base pointer)
//   +0x18  int32   dstRowStride  (in float32-quad rows; shlq $4 → bytes)
//   +0x50  void*   src0Base      (input A base pointer, 4-float RGBA per pixel)
//   +0x58  int32   src0RowStride (in float32-quad rows; shlq $4 → bytes)
//   +0x60  void*   src1Base      (input B base pointer)
//   +0x68  int32   src1RowStride (in float32-quad rows; shlq $4 → bytes)
//   Each pixel is FOUR float32s (RGBA), 16 bytes wide — the `shlq $0x4, %rdi/rdx/rcx`
//   at @0x1c2a0d-15 converts row-strides from "pixel columns" to "byte strides",
//   confirming this layout.
//
// HGRectNull symbol (linked from GetDOD/GetROI @0x1c299c/@0x1c29bc): a 16-byte
// "null / empty" HGRect written to the (rax, r8) return-value register pair when
// the filter is asked about a non-existent input port (edx >= 2). Its actual byte
// contents live in an unported translation unit (linker-defined _HGRectNull), so
// we route through a throwing stub for that specific case.

/** HGRect — {x0, y0, x1, y1} in int32. Layout deduced from HGTile offsets +0..+0xc. */
export type HGRect = { x0: number; y0: number; x1: number; y1: number };

/** HGTile — the per-tile state the RenderTile body reads. Only the fields listed
 *  are touched by HGGSqTens::RenderTile. The `dstBase / src0Base / src1Base` fields
 *  are opaque pointers; we model them as `Float32Array` (RGBA-interleaved, 4 floats
 *  per pixel, `*RowStride * 4` = float-lane stride between rows). */
export interface HGTile {
  /** +0x00 int32  x0 (inclusive left)  */ x0: number;
  /** +0x04 int32  y0 (inclusive top)   */ y0: number;
  /** +0x08 int32  x1 (exclusive right) */ x1: number;
  /** +0x0c int32  y1 (exclusive bottom)*/ y1: number;
  /** +0x10 float32* destination RGBA base — 4 floats per pixel; row = dstRowStride
   *  pixels wide (i.e. `4 * dstRowStride` float-lanes). */
  dstBase: Float32Array;
  /** +0x18 int32  destination row-stride, in whole PIXELS (4 floats each). The
   *  disasm loads this and multiplies by 16 (shlq $4) to get byte-strides — mirror
   *  that by using `4 * dstRowStride` when advancing the Float32Array row pointer. */
  dstRowStride: number;
  /** +0x50 float32* input-A base (RGBA) */ src0Base: Float32Array;
  /** +0x58 int32  A row-stride (pixels) */ src0RowStride: number;
  /** +0x60 float32* input-B base (RGBA) */ src1Base: Float32Array;
  /** +0x68 int32  B row-stride (pixels) */ src1RowStride: number;
}

/** HGRenderer / HGProgram / HGNode — opaque forwards used only by the render-graph
 *  binding methods. Not touched by RenderTile. */
export type HGRenderer = unknown;
export type HGProgram = unknown;
export type HGNode = unknown;

// ============================================================================================
//   Callee stubs — unported base-class and linker-defined helpers touched by the class body.
// ============================================================================================

/** HGNode::HGNode() @Helium 0x11baf0 (reached via `callq __ZN6HGNodeC2Ev` at
 *  0x1c2969). Not yet transcribed — the HGGSqTens ctor delegates to it. */
function HGNode_ctor(_this: unknown): void {
  throw new Error(
    "HGNode::HGNode() @Helium 0x11baf0 not yet transcribed " +
    "(reached from HGGSqTens::HGGSqTens @0x1c2969)"
  );
}

/** HGNode::~HGNode() @Helium (destination of the tail-jmp at 0x1c3bf5 and the
 *  callq at 0x1c3c09). Not yet transcribed. */
function HGNode_dtor(_this: unknown): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
    "(reached from HGGSqTens::~HGGSqTens D1 @0x1c3bf5 / D0 @0x1c3c09)"
  );
}

/** HGObject::operator delete(void*) @Helium (destination of the tail-jmp at
 *  0x1c3c17 inside the D0 deleting destructor). Not yet transcribed. */
function HGObject_operator_delete(_this: unknown): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
    "(reached from HGGSqTens::~HGGSqTens D0 @0x1c3c17)"
  );
}

/** Address of the linker-defined `_HGRectNull` global — a 16-byte HGRect returned
 *  by GetDOD/GetROI when the input-port index is out of range (edx >= 2). Its
 *  concrete byte values live in an unported TU. */
function loadHGRectNull(): HGRect {
  throw new Error(
    "_HGRectNull @Helium (linker-defined) not yet transcribed " +
    "(reached from HGGSqTens::GetDOD @0x1c299c / GetROI @0x1c29bc)"
  );
}

// ============================================================================================
//   Class body
// ============================================================================================

/** Static-linkage string constant `HGGSqTens_fragmentString` @Helium 0x85e410.
 *  548 bytes of ARB fragment program — verbatim from the binary. Returned by
 *  GetProgram unchanged. */
// @0x85e410  HGGSqTens_fragmentString  (548-byte C-string constant)
export const HGGSqTens_fragmentString: string =
  "!!ARBfp1.0     \n" +
  "##LEN=0000000224\n" +
  "##                          \n" +
  "##                            \n" +
  "##                                \n" +
  "##                                     \n" +
  "##$\n" +
  "OUTPUT $o0=result.color;\n" +
  "ATTRIB $f0=fragment.texcoord[0];\n" +
  "ATTRIB $f1=fragment.texcoord[1];\n" +
  "##%\n" +
  "TEMP r0,r1;\n" +
  "##@\n" +
  "##0\n" +
  "TEX r0.xyz,$f0,texture[0],RECT;\n" +
  "##1\n" +
  "TEX r1.xyz,$f1,texture[1],RECT;\n" +
  "DP3 $o0.y,r1,r0;\n" +
  "DP3 $o0.z,r1,r1;\n" +
  "DP3 $o0.x,r0,r0;\n" +
  "END\n" +
  "##MD5=b00fceaf:a02645d1:870ffb36:a3cc7fa5\n" +
  "##SIG=00000000:00000003:00000003:00000000:0000:0000:0002:0000:0000:0000:0000:0000:0002:02:0:1:0\n";

/** HGGSqTens — Helium render-graph node that produces the per-pixel structure-
 *  tensor / sum-of-squares tuple (|A|², A·B, |B|², 1.0). All virtual methods
 *  live in this class; there are no instance fields beyond the HGNode base. */
export class HGGSqTens {
  /** vptr installed by ctor — leaq 0x865b13(%rip) @0x1c296e resolves to 0xa28488. */
  static readonly VTABLE_ADDR = 0xa28488;

  /** HGGSqTens::HGGSqTens() — @0x1c2960 (C1==C2, same 32-byte body).
   *  Full disasm:
   *    0x1c2960  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *    0x1c2966  movq  %rdi, %rbx                     ; rbx = this
   *    0x1c2969  callq __ZN6HGNodeC2Ev                 ; HGNode::HGNode()
   *    0x1c296e  leaq  0x865b13(%rip), %rax           ; rax = vtable @ 0xa28488
   *    0x1c2975  movq  %rax, (%rbx)                    ; this->vptr = vtable
   *    0x1c2978..0x1c297e  addq $8,%rsp / popq %rbx / popq %rbp / retq
   *  No extra fields are written — the class carries no owned state.  */
  constructor() {
    HGNode_ctor(this);          // @0x1c2969 — throws (HGNode unported).
    // this.vptr = HGGSqTens.VTABLE_ADDR;   // @0x1c2975 — provenance-only in TS.
  }

  /** HGGSqTens::GetProgram(HGRenderer*) — @0x1c2980. Returns the pointer to the
   *  static ARB-fragment-program string. Full disasm:
   *    0x1c2980  pushq %rbp / movq %rsp,%rbp
   *    0x1c2984  leaq  __ZL24HGGSqTens_fragmentString(%rip), %rax
   *    0x1c298b  popq %rbp / retq
   *  Note the parameter (`HGRenderer* renderer`, rdi) is completely ignored. */
  GetProgram(_renderer: HGRenderer): string {
    // @0x1c2984 — return the address of the static fragmentString constant.
    return HGGSqTens_fragmentString;
  }

  /** HGGSqTens::GetDOD(HGRenderer*, int inputIdx, HGRect inputDOD) — @0x1c2990.
   *  "DOD" (Domain of Definition): the region a filter can produce output for
   *  given an input's DOD. For HGGSqTens the DOD of output-0 equals the DOD of
   *  each of the two inputs (both inputs must supply the same rect). Faithful:
   *    if (inputIdx < 2)   → return inputDOD    (pass-through, small path)
   *    else                → return _HGRectNull (out-of-range: no output area)
   *  ABI: HGRect is passed by value in the (rcx = {x0,y0}, r8 = {x1,y1}) pair;
   *  the small-path just moves `%rcx, %rax` and `%r8, %rdx` as return values. */
  GetDOD(_renderer: HGRenderer, inputIdx: number, inputDOD: HGRect): HGRect {
    // @0x1c2993  cmpl $0x2,%edx ; jb 0x1c29ab
    if (inputIdx < 2) {
      // @0x1c29ab-ae: return the incoming HGRect unchanged.
      return { x0: inputDOD.x0, y0: inputDOD.y0, x1: inputDOD.x1, y1: inputDOD.y1 };
    }
    // @0x1c299c  leaq _HGRectNull(%rip),%rcx ; movq (%rcx),%rax ; movq 8(%rcx),%r8
    return loadHGRectNull();
  }

  /** HGGSqTens::GetROI(HGRenderer*, int inputIdx, HGRect outputROI) — @0x1c29b0.
   *  "ROI" (Region of Interest): the region each input needs to supply given a
   *  requested output region. Body is byte-for-byte identical to GetDOD (same
   *  small-path pass-through, same _HGRectNull fallback for edx >= 2). This is
   *  the map "output pixel P depends on the SAME pixel P from both inputs" —
   *  which matches a point-local filter (no neighborhood taps). */
  GetROI(_renderer: HGRenderer, inputIdx: number, outputROI: HGRect): HGRect {
    // @0x1c29b3  cmpl $0x2,%edx ; jb 0x1c29cb
    if (inputIdx < 2) {
      // @0x1c29cb-ce: return outputROI unchanged.
      return { x0: outputROI.x0, y0: outputROI.y0, x1: outputROI.x1, y1: outputROI.y1 };
    }
    // @0x1c29bc  leaq _HGRectNull(%rip),%rcx ; movq (%rcx),%rax ; movq 8(%rcx),%r8
    return loadHGRectNull();
  }

  /** HGGSqTens::RenderTile(HGTile*) — @0x1c29d0. Full CPU-fallback body.
   *
   *  High-level: for each row, for each pixel P in [x0,x1) × [y0,y1):
   *      A = src0[P] as 4-float RGBA (only .rgb read)
   *      B = src1[P] as 4-float RGBA (only .rgb read)
   *      dst[P] = { |A_rgb|², A_rgb·B_rgb, |B_rgb|², 1.0 }
   *
   *  Faithful SSE transcription — the compiled loop uses horizontal-add /
   *  blend / OR tricks so that a single 16-byte movaps loads a 4-float RGBA
   *  and a single 16-byte movaps stores the 4-float output, with the top
   *  (alpha) lane set to +1.0 via a bitwise OR with the constant
   *  [0.0, 0.0, 0.0, 1.0] at @Helium 0x3c9fe0 (raw bytes = 00 00 00 00 00 00
   *  00 00 00 00 00 00 00 00 80 3f). The full lane-by-lane derivation:
   *
   *      xmm4 = A * B                               [a0b0, a1b1, a2b2, a3b3]
   *      blendps $0x8 xmm0(0), xmm4                 [a0b0, a1b1, a2b2, 0]
   *      haddps xmm4, xmm4                          [a0b0+a1b1, a2b2, a0b0+a1b1, a2b2]
   *      haddps xmm0(0), xmm4                       [(a0b0+a1b1)+a2b2, ...+..., 0, 0]
   *                                                = [dotAB, dotAB, 0, 0]
   *      orps  xmm1(=[0,0,0,1]), xmm4               [dotAB, dotAB, 0, 1.0]
   *      xmm3 = B * B                               [b0², b1², b2², b3²]
   *      blendps $0x8 xmm0, xmm3                    [b0², b1², b2², 0]
   *      haddps xmm3, xmm3                          [b0²+b1², b2², b0²+b1², b2²]
   *      haddps xmm3, xmm3                          [|B|², |B|², |B|², |B|²]
   *      xmm2 = A * A                               [a0², a1², a2², a3²]
   *      blendps $0x8 xmm0, xmm2                    [a0², a1², a2², 0]
   *      haddps xmm2, xmm2                          [a0²+a1², a2², a0²+a1², a2²]
   *      blendps $0xb (1011) xmm4, xmm3             [dotAB, dotAB, |B|², 1.0]
   *      haddps xmm2, xmm2                          [|A|², |A|², |A|², |A|²]
   *      blendps $0xe (1110) xmm3, xmm2             [|A|², dotAB, |B|², 1.0]
   *      movaps xmm2, dst                            store 4 floats
   *
   *  The "3-lane sum" is what shakes out because the compiler is only
   *  computing DP3 (RGB dot) — matching the ARB shader exactly. The alpha
   *  lane of the inputs is ignored (killed by blendps $0x8 with the zero
   *  register); the alpha lane of the output is set to 1.0 by the orps.
   *
   *  Tile-empty guard at @0x1c29e5: if `width == 0 || height == 0`, the
   *  function returns immediately (`xorl %eax,%eax; retq` at 0x1c2aad-af). */
  RenderTile(tile: HGTile): void {
    // @0x1c29d0-e0: compute width & height from tile bounds.
    //   movl 0xc(%rsi),%r10d ; subl 0x4(%rsi),%r10d   → height = y1 - y0
    //   movl 0x8(%rsi),%eax  ; subl (%rsi),%eax        → width  = x1 - x0
    const height = tile.y1 - tile.y0;
    const width = tile.x1 - tile.x0;

    // @0x1c29db-e5: the two `sete` bits are OR'd; jne skips to the return.
    //   Interpretation: if EITHER dimension is zero, produce no output.
    //   (Note: negative width/height would fall through the SETE-equals-zero
    //   test — the disasm doesn't guard against them. We preserve that.)
    if (width === 0 || height === 0) {
      return; // @0x1c2aad-af — xorl %eax,%eax ; retq
    }

    // @0x1c29f0-15: precompute byte-strides (row-strides * 16 = 4 floats * 4 B).
    // We work in FLOAT-lane strides (= pixel-stride * 4 floats/pixel) instead of
    // byte-strides since Float32Array indexing is in float-lanes.
    const dstRowFloats = tile.dstRowStride * 4;    // @0x1c29fa/@0x1c2a0d
    const src0RowFloats = tile.src0RowStride * 4;  // @0x1c29f2/@0x1c2a15
    const src1RowFloats = tile.src1RowStride * 4;  // @0x1c29f6/@0x1c2a11

    // Row loop base pointers — start at the top-left of the tile subregion.
    // The disasm reads dstBase/src0Base/src1Base directly (no x0/y0 offset
    // computation is visible in the body), i.e. the caller has already advanced
    // the base pointers to the tile's (x0, y0) corner. We mirror that literally.
    let dstRowBase = 0;
    let src0RowBase = 0;
    let src1RowBase = 0;

    const dst = tile.dstBase;
    const s0 = tile.src0Base;
    const s1 = tile.src1Base;

    // Outer loop: `decq %r10 ; jne 0x1c2a30`  — @0x1c2aa6-a9. Height rows.
    for (let row = 0; row < height; row++) {
      // Inner loop: `decq %rbx ; jne 0x1c2a40`  — @0x1c2a98-9b. Width pixels.
      // %r11 advances by 0x10 (16 bytes = 4 floats = 1 RGBA pixel) each iter.
      for (let col = 0; col < width; col++) {
        const iA = src0RowBase + col * 4;
        const iB = src1RowBase + col * 4;
        // xmm2 = movaps (%r9,%r11)  — @0x1c2a40 : A = src0[pixel]
        // xmm3 = movaps (%rsi,%r11) — @0x1c2a45 : B = src1[pixel]
        const a0 = s0[iA + 0]; // r
        const a1 = s0[iA + 1]; // g
        const a2 = s0[iA + 2]; // b
        // A[3] ignored (blendps $0x8 xmm0 zeros lane 3 of A/B/AB)          @0x1c2a50 / @0x1c2a6a / @0x1c2a7b
        const b0 = s1[iB + 0]; // r
        const b1 = s1[iB + 1]; // g
        const b2 = s1[iB + 2]; // b
        // B[3] ignored likewise.

        // xmm4 = A * B ; sum RGB lanes → dotAB    (@0x1c2a4d..2a5a)
        const dotAB = Math.fround(
          Math.fround(Math.fround(a0 * b0) + Math.fround(a1 * b1)) + Math.fround(a2 * b2)
        );
        // xmm3 = B * B ; sum RGB lanes → normB2   (@0x1c2a61..2a6e)
        const normB2 = Math.fround(
          Math.fround(Math.fround(b0 * b0) + Math.fround(b1 * b1)) + Math.fround(b2 * b2)
        );
        // xmm2 = A * A ; sum RGB lanes → normA2   (@0x1c2a72..2a85)
        const normA2 = Math.fround(
          Math.fround(Math.fround(a0 * a0) + Math.fround(a1 * a1)) + Math.fround(a2 * a2)
        );

        // movaps xmm2, (%r8,%r11)   — @0x1c2a8f : store [|A|², A·B, |B|², 1.0].
        // The `orps xmm1,xmm4` at 0x1c2a5e sets the alpha lane of the intermediate
        // to 1.0 (from const @Helium 0x3c9fe0 = [0.0f, 0.0f, 0.0f, 1.0f]); the
        // final blendps sequence propagates that 1.0 into lane 3 of the output.
        const iDst = dstRowBase + col * 4;
        dst[iDst + 0] = normA2;
        dst[iDst + 1] = dotAB;
        dst[iDst + 2] = normB2;
        dst[iDst + 3] = 1.0;
      }
      // @0x1c2a9d-a3: advance each base pointer by ONE row.
      //   addq %rdi,%r8  ; addq %rdx,%rsi ; addq %rcx,%r9
      dstRowBase += dstRowFloats;
      src0RowBase += src0RowFloats;
      src1RowBase += src1RowFloats;
    }
  }
}

// ============================================================================================
//   Destructors — provenance-only in TS. Bodies documented for the ledger.
// ============================================================================================

/** HGGSqTens::~HGGSqTens() — D1 complete-object destructor @0x1c3bf0.
 *  Body: pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN6HGNodeD2Ev.
 *  I.e. a bare thunk that tail-jumps to the base destructor — no members to
 *  release because the class has no owned data. */
export function HGGSqTens_dtor_D1(self: HGGSqTens): void {
  HGNode_dtor(self); // @0x1c3bf5 — throws (HGNode unported).
}

/** HGGSqTens::~HGGSqTens() — D0 deleting destructor @0x1c3c00.
 *  Body:
 *    pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *    movq  %rdi, %rbx                 ; rbx = this
 *    callq __ZN6HGNodeD2Ev             ; HGNode::~HGNode()
 *    movq  %rbx, %rdi
 *    addq  $8,%rsp / popq %rbx / popq %rbp
 *    jmp   __ZN8HGObjectdlEPv           ; HGObject::operator delete(this)
 *  I.e. run the base destructor then deallocate. Matches the standard Itanium
 *  "D0" pattern for a class without owned resources. */
export function HGGSqTens_dtor_D0(self: HGGSqTens): void {
  HGNode_dtor(self);              // @0x1c3c09 — throws.
  HGObject_operator_delete(self); // @0x1c3c17 — throws.
}
