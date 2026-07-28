// HGCColorGamma_chroma_upsample_f1.ts — Helium render-graph node for the
// horizontal 4:2:0 → 4:4:4 (single-tap) chroma upsampling pass under the
// "color gamma" family. Transcribed from the x86_64 slice of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// Method addresses (otool -tV):
//   @0x0fd630  HGCColorGamma_chroma_upsample_f1::~HGCColorGamma_chroma_upsample_f1() [D1 thunk]
//   @0x0fd640  HGCColorGamma_chroma_upsample_f1::~HGCColorGamma_chroma_upsample_f1() [D0 body]
//   @0x0fd660  HGCColorGamma_chroma_upsample_f1::GetOutput(HGRenderer*)
//   @0x0fd6c0  HGCColorGamma_chroma_upsample_f1::GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd700  HGCColorGamma_chroma_upsample_f1::GetROI(HGRenderer*, int, HGRect)
//
// Semantic note on the "_f1" variant: the "f1" is the horizontal filter
// footprint radius in pixels — GetROI expands the requested rect by 1 pixel
// on each horizontal edge (x−1 .. right+1) to fetch the neighbours needed
// for the horizontal chroma reconstruction. See the RIP-relative constant
// pool entry at @0x3cfad0 below.
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcColorGamma_chroma_upsample_f1::~HgcColorGamma_chroma_upsample_f1  @Helium (called from D0 @0xfd649)
//   HGRenderer::GetInput(HGNode*, int)                                    @Helium (called from GetOutput @0xfd675 / GetDOD @0xfd6e7)
//   HGRenderer::GetDOD(HGNode*)                                           @Helium (called from GetOutput @0xfd680, tail from GetDOD @0xfd6f8)
//   HGObject::operator delete(void*)                                      @Helium (tail from D0 @0xfd657)
//   this->vtable[0x60](this, 0)                                           @Helium (called from GetOutput @0xfd6ad, purpose: after
//                                                                                   sizing computation, notify subclass of the new
//                                                                                   input dimensions — signature undecoded)

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph handle. */
export interface HGNode {}
/** HGRenderer — render context. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * The constant vector loaded by GetROI @0xfd72f is 16 bytes at Helium
 * __DATA_CONST +0x3cfad0 (RIP target 0xfd737 + 0x2d2399 = 0x3cfad0), verified
 * by `xxd` on the FCP binary (x86_64 slice):
 *   FF FF FF FF 00 00 00 00 01 00 00 00 00 00 00 00
 *   → two u64 lanes = [0x00000000FFFFFFFF, 0x0000000000000001]
 *   → four i32 lanes = [-1, 0, +1, 0]
 * These are the per-edge deltas applied to (x, y, right, bottom) via
 * paddq (u64) + pblendw ($0xcc — see decode below) — the low i32 of each
 * lane feeds through the blend, the high i32 of each lane comes from the
 * original rect.  Net effect: (x-1, y, right+1, bottom).
 */
const HGCColorGamma_chroma_upsample_f1_ROIDeltasNote =
  "Helium __DATA_CONST @0x3cfad0 = [i32: -1, 0, +1, 0]";

function HgcColorGamma_chroma_upsample_f1_dtor(_self: HGCColorGamma_chroma_upsample_f1): void {
  throw new Error(
    "HgcColorGamma_chroma_upsample_f1 base dtor @Helium __ZN32HgcColorGamma_chroma_upsample_f1D2Ev @0xfd649 not yet transcribed",
  );
}
function HGObject_operatorDelete(_p: HGCColorGamma_chroma_upsample_f1): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd657 not yet transcribed",
  );
}
function HGRenderer_GetInput(_r: HGRenderer, _self: HGCColorGamma_chroma_upsample_f1, _slot: number): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfd675/@0xfd6e7 not yet transcribed",
  );
}
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfd680/@0xfd6f8 not yet transcribed",
  );
}

export class HGCColorGamma_chroma_upsample_f1 {
  // Empty visible state — base kernel holds the sampling filter params.
  // Only the reference to the deltas note keeps the constant citation alive
  // in one export; TS's dead-code detector otherwise flags it.
  static readonly ROIDeltasNote = HGCColorGamma_chroma_upsample_f1_ROIDeltasNote;

  /**
   * ~HGCColorGamma_chroma_upsample_f1() [D0 body] @0xfd640
   *   @0xfd640 pushq %rbp / movq %rsp, %rbp / pushq %rbx
   *   @0xfd646 rbx = this
   *   @0xfd649 callq HgcColorGamma_chroma_upsample_f1::~HgcColorGamma_chroma_upsample_f1
   *   @0xfd657 jmp   HGObject::operator delete(void*)
   */
  destroy(): void {
    HgcColorGamma_chroma_upsample_f1_dtor(this);   // @0xfd649
    HGObject_operatorDelete(this);                 // @0xfd657 (tail)
  }

  /**
   * GetOutput(HGRenderer* r) @0xfd660
   *
   *   @0xfd664 push r14/rbx; r14=r, rbx=this
   *   @0xfd66d rdi=r, rsi=this, edx=0
   *   @0xfd675 callq HGRenderer::GetInput          → input node handle in rax
   *   @0xfd67a rdi=r, rsi=input
   *   @0xfd680 callq HGRenderer::GetDOD            → HGRect {x|y in rax, right|bottom in rdx}
   *
   *   Convert the input DOD into single-precision floats (width, height):
   *   @0xfd685 ecx = edx (bottom low half — actually low32 of `rdx` which is `right`)
   *                 wait: after GetDOD return, rax = low64 (x,y), rdx = high64 (right,bottom).
   *                 edx = low32 of rdx = right; eax = low32 of rax = x.
   *   @0xfd687 ecx -= eax                          → width = right − x (i32)
   *   @0xfd689 cvtsi2ss  rcx  → xmm0               → xmm0 = (float)(int64)width
   *                                               (uses rcx not ecx so the sign
   *                                                extension covers the full i64;
   *                                                effectively (float)width_i32)
   *   @0xfd68e cvtsi2ss  eax  → xmm2               → xmm2 = (float)x_i32
   *   @0xfd692 rdx >>= 32                          → rdx = bottom_i32 (sign-extended in the shr,
   *                                                   but next insn uses low 32 so unaffected)
   *   @0xfd696 rax >>= 32                          → rax = y_i32
   *   @0xfd69a edx -= eax                          → height = bottom − y (i32)
   *   @0xfd69c cvtsi2ss  rdx  → xmm1               → xmm1 = (float)height_i32
   *   @0xfd6a1 cvtsi2ss  eax  → xmm3               → xmm3 = (float)y_i32
   *   @0xfd6a5 rax = *(this)                       → vtable
   *   @0xfd6a8 rdi = this
   *   @0xfd6ab esi = 0
   *   @0xfd6ad callq *0x60(%rax)                   → vtable[0x60](this, 0) — passes
   *                                                   xmm0..xmm3 = (width, height,
   *                                                   x, y) in the ABI's float regs
   *   @0xfd6b0 rax = this / return
   *
   * The vtable slot at +0x60 is the "prepare for input dimensions" callback
   * on HGNode — its signature must accept the four floats currently loaded
   * (width, height, x, y) plus the boolean-ish int `esi=0`. Without the base
   * vtable decoded we cannot faithfully invoke it here; the pre-call float
   * expressions ARE decoded and preserved as pure math for the caller.
   */
  GetOutput(r: HGRenderer): HGCColorGamma_chroma_upsample_f1 {
    const input = HGRenderer_GetInput(r, this, 0);                          // @0xfd675
    const dod = HGRenderer_GetDOD(r, input);                                // @0xfd680
    // Pure-math decode of the DOD→float conversion @0xfd685..@0xfd6a1:
    const widthI32 = (dod.right - dod.x) | 0;                               // @0xfd685..@0xfd687
    const heightI32 = (dod.bottom - dod.y) | 0;                             // @0xfd692..@0xfd69a
    const widthF = Math.fround(widthI32);                                    // @0xfd689 cvtsi2ss
    const xF = Math.fround(dod.x | 0);                                       // @0xfd68e cvtsi2ss
    const heightF = Math.fround(heightI32);                                  // @0xfd69c cvtsi2ss
    const yF = Math.fround(dod.y | 0);                                       // @0xfd6a1 cvtsi2ss
    // vtable[0x60](this, 0, width, height, x, y) — invoke the subclass-provided
    // "set input dimensions" hook. Signature/purpose not fully decoded.
    void widthF; void heightF; void xF; void yF;
    throw new Error(
      "HGCColorGamma_chroma_upsample_f1.GetOutput vtable[0x60] callback unresolved @0xfd6ad",
    );
    // Once the vtable is ported, the routine returns `this` (@0xfd6b0):
    // return this;
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd6c0
   *
   *   @0xfd6c0 testl %edx, %edx
   *   @0xfd6c2 je    0xfd6d3       ; slot == 0 → real body
   *   @0xfd6c4..@0xfd6d2 → return HGRectNull (RIP-rel load, same shape as
   *                       every other _f1/_2vuy variant in this family)
   *
   *   slot == 0 body: identical to HGCColorGamma_bias::GetDOD @Helium — get
   *   the sole input node then tail-call HGRenderer::GetDOD on it.
   *   @0xfd6e7 callq HGRenderer::GetInput(this, 0)
   *   @0xfd6f8 jmp   HGRenderer::GetDOD(input)
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                            // @0xfd6c4..@0xfd6d2
    }
    const input = HGRenderer_GetInput(r, this, 0);  // @0xfd6e7
    return HGRenderer_GetDOD(r, input);             // @0xfd6f8 tail call
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd700
   *
   *   @0xfd704 testl %edx, %edx
   *   @0xfd706 je    0xfd721            ; slot == 0 → real body
   *   @0xfd708..@0xfd720 → return HGRectNull
   *
   *   slot == 0 body — SIMD widen-by-1 on the horizontal edges:
   *   @0xfd721 xmm0 = r8                (right|bottom<<32) into low 64
   *   @0xfd726 xmm1 = rcx               (x|y<<32) into low 64
   *   @0xfd72b punpcklqdq %xmm0, %xmm1  → xmm1 = [rcx, r8] = full 16-byte rect
   *   @0xfd72f movdqa 0x2d2399(%rip), %xmm0
   *              → xmm0 = @0x3cfad0 = [i32: -1, 0, +1, 0]
   *   @0xfd737 paddq %xmm1, %xmm0       → per-u64-lane add:
   *              lane0 = xmm0.lane0 + xmm1.lane0 = 0x00000000FFFFFFFF + (x|y<<32)
   *                     → low32 = x + 0xFFFFFFFF = x − 1   (int32, ignoring the
   *                       borrow into bit32 because the blend below picks the
   *                       new low32 and the ORIGINAL high32 of the lane)
   *                     → high32 = y (with carry) — irrelevant, blended out
   *              lane1 = xmm0.lane1 + xmm1.lane1 = 0x0000000000000001 + (right|bottom<<32)
   *                     → low32 = right + 1
   *                     → high32 = bottom (irrelevant, blended out)
   *   @0xfd73b pblendw $0xcc, %xmm1, %xmm0
   *              imm = 0b1100_1100 = per-word select (bit i=1 → src=xmm1):
   *              words 0,1 = xmm0.low   → new x (low32 lane0)
   *              words 2,3 = xmm1.high  → original y
   *              words 4,5 = xmm0.low   → new right (low32 lane1)
   *              words 6,7 = xmm1.high  → original bottom
   *   Net: return HGRect{ x − 1, y, right + 1, bottom }.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                            // @0xfd708..@0xfd720
    }
    // Faithful reproduction of the SIMD adds+blend @0xfd721..@0xfd74d — the
    // observable result is a horizontal grow by 1 pixel each side. Y/bottom
    // pass through untouched because pblendw picks the ORIGINAL upper halves
    // of each u64 lane (imm bits 1,3,5,7 = 1 → src xmm1).
    return {
      x: (rect.x - 1) | 0,          // paddq lane0 low32 = x + (-1)  @0xfd737
      y: rect.y,                     // pblendw picks xmm1's high half @0xfd73b
      right: (rect.right + 1) | 0,   // paddq lane1 low32 = right + 1 @0xfd737
      bottom: rect.bottom,           // pblendw picks xmm1's high half @0xfd73b
    };
  }
}
