// HGCColorGamma_v210_yxzx_rgba_expand.ts — Helium HGCColorGamma_v210_yxzx_rgba_expand:
// render-graph node for the "color gamma over v210 (10-bit 4:2:2 packed
// YCbCr) with yxzx→RGBA channel expand" per-pixel op. Transcribed from the
// x86_64 slice of /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium.
//
// Method addresses (otool -tV):
//   @0x0fcfe0  HGCColorGamma_v210_yxzx_rgba_expand::~HGCColorGamma_v210_yxzx_rgba_expand() [D1: tail-jmp to D2]
//   @0x0fcff0  HGCColorGamma_v210_yxzx_rgba_expand::~HGCColorGamma_v210_yxzx_rgba_expand() [D0: call D2, then jmp HGObject::operator delete]
//   @0x0fd010  HGCColorGamma_v210_yxzx_rgba_expand::GetOutput(HGRenderer*)
//   @0x0fd020  HGCColorGamma_v210_yxzx_rgba_expand::GetDOD(HGRenderer*, int, HGRect)
//   @0x0fd060  HGCColorGamma_v210_yxzx_rgba_expand::GetROI(HGRenderer*, int, HGRect)
//
// Notes on the operation: Apple's v210 is a 10-bit 4:2:2 packed YCbCr
// format where 6 pixels pack into 16 bytes (4×32-bit words). Any renderer
// producing v210 must operate on rects whose left/right edges are aligned
// to 6-pixel macroblocks — that horizontal-6 alignment is exactly what
// GetROI @0xfd060 imposes (see the decoded arithmetic below).
//
// Undecoded frontier (throwing stubs cite their callee addr):
//   HgcColorGamma_v210_yxzx_rgba_expand::~HgcColorGamma_v210_yxzx_rgba_expand [base D2]
//       @Helium (tail-jmped by D1 @0xfcfe5; called by D0 @0xfcff9)
//   HGRenderer::GetInput(HGNode*, int)         @Helium (called from GetDOD @0xfd047)
//   HGRenderer::GetDOD(HGNode*)                @Helium (tail-jmp from GetDOD @0xfd058)
//   HGObject::operator delete(void*)           @Helium (tail-jmp from D0 @0xfd007)
//
// The tail-call chains match the pattern already used by
// HGCColorGamma_2vuy_xyxz_collapse.ts (with the important twist that HERE
// D1 tail-jmps into D2 rather than into D0).

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcColorGamma_v210_yxzx_rgba_expand base dtor — the D2 (base-object)
 * variant. Tail-jmped from D1 @0xfcfe5 and directly called from D0
 * @0xfcff9. Base compute-kernel class not yet transcribed.
 * @frontier Helium HgcColorGamma_v210_yxzx_rgba_expand::~HgcColorGamma_v210_yxzx_rgba_expand (D2)
 *   __ZN35HgcColorGamma_v210_yxzx_rgba_expandD2Ev
 */
function HgcColorGamma_v210_yxzx_rgba_expand_D2(
  _self: HGCColorGamma_v210_yxzx_rgba_expand,
): void {
  throw new Error(
    "HgcColorGamma_v210_yxzx_rgba_expand base D2 dtor @Helium " +
    "__ZN35HgcColorGamma_v210_yxzx_rgba_expandD2Ev not yet transcribed " +
    "(cited call sites: D1 @0xfcfe5 (jmp), D0 @0xfcff9 (call))",
  );
}

/**
 * HGObject::operator delete(void*) — tail-jmped from D0 @0xfd007.
 * @frontier Helium HGObject::operator delete __ZN8HGObjectdlEPv
 */
function HGObject_operatorDelete(
  _p: HGCColorGamma_v210_yxzx_rgba_expand,
): void {
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd007 " +
    "not yet transcribed",
  );
}

/**
 * HGRenderer::GetInput(HGNode* self, int slot) — called from GetDOD
 * @0xfd047 with slot=0.
 * @frontier Helium HGRenderer::GetInput __ZN10HGRenderer8GetInputEP6HGNodei
 */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCColorGamma_v210_yxzx_rgba_expand,
  _slot: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei " +
    "@0xfd047 not yet transcribed",
  );
}

/**
 * HGRenderer::GetDOD(HGNode*) — tail-jmped from GetDOD @0xfd058.
 * @frontier Helium HGRenderer::GetDOD __ZN10HGRenderer6GetDODEP6HGNode
 */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode " +
    "@0xfd058 not yet transcribed",
  );
}

export class HGCColorGamma_v210_yxzx_rgba_expand {
  /**
   * ~HGCColorGamma_v210_yxzx_rgba_expand() [D1 complete-object dtor] @0xfcfe0
   *
   *   @0xfcfe0  pushq %rbp
   *   @0xfcfe1  movq  %rsp, %rbp
   *   @0xfcfe4  popq  %rbp
   *   @0xfcfe5  jmp   HgcColorGamma_v210_yxzx_rgba_expand::~D2   ; TAIL-JMP
   *
   * Note: D1 tail-jmps into D2 (unlike the 2vuy variant where D1 is a
   * thunk to D0). This means the "complete-object dtor" for this class is
   * just its base D2 body — the derived layer has no fields of its own.
   */
  destroy_D1(): void {
    // @0xfcfe5  jmp base D2
    HgcColorGamma_v210_yxzx_rgba_expand_D2(this);
  }

  /**
   * ~HGCColorGamma_v210_yxzx_rgba_expand() [D0 deleting dtor body] @0xfcff0
   *
   *   @0xfcff0  pushq %rbp
   *   @0xfcff1  movq  %rsp, %rbp
   *   @0xfcff4  pushq %rbx
   *   @0xfcff5  pushq %rax                                  ; stack align
   *   @0xfcff6  movq  %rdi, %rbx                            ; save this
   *   @0xfcff9  callq HgcColorGamma_v210_yxzx_rgba_expand::~D2   ; base dtor
   *   @0xfcffe  movq  %rbx, %rdi                            ; rdi = this
   *   @0xfd001  addq  $0x8, %rsp
   *   @0xfd005  popq  %rbx
   *   @0xfd006  popq  %rbp
   *   @0xfd007  jmp   HGObject::operator delete(void*)      ; TAIL-JMP
   */
  destroy_D0(): void {
    HgcColorGamma_v210_yxzx_rgba_expand_D2(this);       // @0xfcff9
    HGObject_operatorDelete(this);                       // @0xfd007 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd010
   *
   *   @0xfd010  pushq %rbp
   *   @0xfd011  movq  %rsp, %rbp
   *   @0xfd014  movq  %rdi, %rax     ; rax = this  (SysV ABI: rdi is this)
   *   @0xfd017  popq  %rbp
   *   @0xfd018  retq
   *
   * The node IS its own output slot — trivially returns `this`. Same shape
   * as HGCColorGamma_2vuy_xyxz_collapse::GetOutput.
   */
  GetOutput(_r: HGRenderer): HGCColorGamma_v210_yxzx_rgba_expand {
    return this;                                          // @0xfd014
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd020
   *
   * NOTE: unusual — this is the ONLY method in the class whose PROLOGUE
   * comes AFTER the slot!=0 fast return. The `slot!=0 → HGRectNull` early
   * exit runs entirely on the caller's frame (no push %rbp), then the
   * slot==0 body sets up its own frame.
   *
   *   @0xfd020  testl %edx, %edx
   *   @0xfd022  je    0xfd033                    ; slot == 0 → real body
   *   @0xfd024  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd02b  movq  (%rcx), %rax               ; HGRectNull low half
   *   @0xfd02e  movq  0x8(%rcx), %rdx            ; HGRectNull high half
   *   @0xfd032  retq                             ; slot != 0 → HGRectNull
   *
   *   slot == 0 body (@0xfd033):
   *   @0xfd033  pushq %rbp
   *   @0xfd034  movq  %rsp, %rbp
   *   @0xfd037  pushq %rbx
   *   @0xfd038  pushq %rax                       ; align
   *   @0xfd039  movq  %rdi, %rax                 ; save this
   *   @0xfd03c  movq  %rsi, %rdi                 ; rdi = renderer  (arg1 to GetInput)
   *   @0xfd03f  movq  %rsi, %rbx                 ; rbx = renderer  (kept for tail-call)
   *   @0xfd042  movq  %rax, %rsi                 ; rsi = this  (arg2 to GetInput)
   *   @0xfd045  xorl  %edx, %edx                 ; edx = 0  (slot 0)
   *   @0xfd047  callq HGRenderer::GetInput(this, 0)
   *   @0xfd04c  movq  %rbx, %rdi                 ; rdi = renderer
   *   @0xfd04f  movq  %rax, %rsi                 ; rsi = input node
   *   @0xfd052  addq  $0x8, %rsp
   *   @0xfd056  popq  %rbx
   *   @0xfd057  popq  %rbp
   *   @0xfd058  jmp   HGRenderer::GetDOD(input)  ; TAIL-JMP
   *
   * Delegates DOD to the sole input's DOD for slot 0; returns null for all
   * other slots — same shape as HGCColorGamma_bias / _2vuy_xyxz_collapse.
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                                   // @0xfd024-fd032
    }
    // @0xfd047  input = HGRenderer::GetInput(renderer, this, 0)
    const input = HGRenderer_GetInput(r, this, 0);
    // @0xfd058  tail: return HGRenderer::GetDOD(renderer, input)
    return HGRenderer_GetDOD(r, input);
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd060
   *
   *   @0xfd060  pushq %rbp
   *   @0xfd061  movq  %rsp, %rbp
   *   @0xfd064  testl %edx, %edx
   *   @0xfd066  je    0xfd078                    ; slot == 0 → real body
   *   @0xfd068  leaq  _HGRectNull(%rip), %rcx
   *   @0xfd06f  movq  (%rcx), %rax               ; HGRectNull low half
   *   @0xfd072  movq  0x8(%rcx), %rdx            ; HGRectNull high half
   *   @0xfd076  popq  %rbp
   *   @0xfd077  retq                             ; slot != 0 → HGRectNull
   *
   *   slot == 0 body — snap x DOWN to a multiple of 6 and right UP to a
   *   multiple of 6 (v210 packs 6 pixels per 16-byte macroblock).
   *
   *   HGRect args live in rcx (low 32=x, high 32=y) and r8 (low 32=right,
   *   high 32=bottom) per SysV amd64.
   *
   *   Divisibility-by-6 test (compiler idiom using inv(3) mod 2^32 with
   *   a ror-1 to also fold in the low-bit-cleared check):
   *   @0xfd078  imull $0xaaaaaaab, %ecx, %eax    ; eax = x * inv3
   *                                              ; (0xAAAAAAAB * 3 ≡ 1 mod 2^32)
   *   @0xfd07e  addl  $0x2aaaaaaa, %eax          ; bias so that (rem 6 == 0)
   *                                              ; lands in the low-count bucket
   *   @0xfd083  rorl  %eax                       ; ror by 1: fuses the low-bit
   *                                              ; test into the compare below
   *   @0xfd085  cmpl  $0x2aaaaaab, %eax          ; 0x2AAAAAAB ≈ 2^32/6
   *   @0xfd08a  jb    0xfd0b0                    ; if x % 6 == 0: skip FP path
   *
   *   FP path (x % 6 != 0):
   *   @0xfd08c  cvtsi2sd %ecx, %xmm0             ; xmm0 = (double)x
   *   @0xfd090  divsd 0x2d0288(%rip), %xmm0      ; xmm0 = x / 6.0
   *                                              ; RIP-const @0x3cd320 = double 6.0
   *                                              ; (bytes 00 00 00 00 00 00 18 40)
   *   @0xfd098  cvtsd2ss %xmm0, %xmm0            ; narrow to float32
   *   @0xfd09c  roundss  $0x9, %xmm0, %xmm0      ; $0x9 = 0b1001
   *                                              ;  = round-to-neg-inf (floor),
   *                                              ;    precision-exception masked
   *   @0xfd0a2  mulss 0x2cac1a(%rip), %xmm0      ; *= 6.0f
   *                                              ; RIP-const @0x3c7cc4 = float 6.0f
   *                                              ; (bytes 00 00 c0 40)
   *   @0xfd0aa  cvttss2si %xmm0, %eax            ; eax = (int)(floor(x/6.0f) * 6.0f)
   *   @0xfd0ae  jmp   0xfd0b2
   *
   *   Fast path (x % 6 == 0):
   *   @0xfd0b0  movl  %ecx, %eax                 ; eax = x (already a multiple of 6)
   *
   *   ---- eax now holds alignedX = 6 * floor(x / 6) ----
   *
   *   Now compute alignedRight = smallest multiple of 6 ≥ right such that
   *   (alignedRight - alignedX) is a multiple of 6 (which, since alignedX
   *   is a multiple of 6, is equivalent to alignedRight being a multiple
   *   of 6):
   *
   *   @0xfd0b2  movl  %r8d, %edx                 ; edx = right
   *   @0xfd0b5  subl  %eax, %edx                 ; edx = right - alignedX
   *   @0xfd0b7  movslq %edx, %rsi                ; rsi = sign_extend(edx)
   *                                              ;     = right - alignedX (as i64)
   *   @0xfd0ba  imulq $0x2aaaaaab, %rsi, %rdx    ; rdx = rsi * 0x2AAAAAAB (64-bit signed)
   *                                              ; 0x2AAAAAAB / 2^33 ≈ 1/6 (magic for div-by-6)
   *   @0xfd0c1  movq  %rdx, %rdi
   *   @0xfd0c4  shrq  $0x3f, %rdi                ; rdi = sign bit of rdx (0 or 1)
   *   @0xfd0c8  shrq  $0x20, %rdx                ; rdx = high 32 bits (unsigned) of product
   *   @0xfd0cc  addl  %edi, %edx                 ; edx = high32 + sign
   *                                              ;     = floor((right-alignedX) / 6)   [signed]
   *   @0xfd0ce  addl  %edx, %edx                 ; edx = 2 * floor(diff / 6)
   *   @0xfd0d0  leal  (%rdx,%rdx,2), %edx        ; edx = 3 * edx_prev = 6 * floor(diff / 6)
   *   @0xfd0d3  subl  %edx, %esi                 ; esi = diff - 6*floor(diff/6)
   *                                              ;     = diff mod 6   [signed remainder,
   *                                              ;      truncated toward -inf via floor-div]
   *   @0xfd0d5  movl  %r8d, %edx                 ; edx = right (fresh)
   *   @0xfd0d8  subl  %esi, %edx                 ; edx = right - (diff mod 6)
   *   @0xfd0da  addl  $0x6, %edx                 ; edx = right - (diff mod 6) + 6
   *   @0xfd0dd  testl %esi, %esi
   *   @0xfd0df  cmovel %r8d, %edx                ; if (diff mod 6) == 0: edx = right
   *
   *   ---- edx now holds alignedRight ----
   *
   *   Reassemble the (x, y, right, bottom) HGRect. y and bottom pass
   *   through unchanged (they're in the high 32 bits of rcx and r8):
   *
   *   @0xfd0e3  movabsq $-0x100000000, %rsi      ; rsi = 0xFFFFFFFF_00000000 (high-32 mask)
   *   @0xfd0ed  andq  %rsi, %r8                  ; r8 = bottom << 32 (masks off `right`)
   *   @0xfd0f0  andq  %rsi, %rcx                 ; rcx = y << 32 (masks off `x`)
   *   @0xfd0f3  movl  %eax, %eax                 ; rax = alignedX zero-extended (low 32 = alignedX, high 32 = 0)
   *   @0xfd0f5  orq   %rcx, %rax                 ; rax = alignedX | (y << 32)   = new {x,y}
   *   @0xfd0f8  orq   %r8, %rdx                  ; rdx = alignedRight | (bottom << 32) = new {right,bottom}
   *   @0xfd0fb  popq  %rbp
   *   @0xfd0fc  retq
   *
   * Net semantic: snap `rect.x` DOWN to the nearest multiple of 6, snap
   * `rect.right` UP to the nearest multiple of 6, pass y/bottom through.
   * This is the horizontal 6-pixel alignment required by v210's 6-pixel
   * macroblock layout.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull;                                   // @0xfd064-fd077
    }

    // ---- alignedX = 6 * floor(x / 6)   @0xfd078-fd0b0 ----
    // JS `Math.floor(x / 6) * 6` naturally implements the signed
    // floor-division-then-multiply — same result as the divisibility test
    // + FP path in the asm (which is just an optimization of the same
    // math). `rect.x` is int32 so `Math.floor(rect.x / 6) * 6` stays in
    // int32 range.
    const alignedX = Math.floor(rect.x / 6) * 6;           // @0xfd0aa / @0xfd0b0

    // ---- alignedRight = round `right` UP to next multiple of 6 that
    //                     leaves (alignedRight - alignedX) a mult of 6.
    // Since alignedX is a mult of 6, this reduces to: alignedRight is the
    // smallest multiple of 6 that is ≥ right AND coincides with `right`
    // when `(right - alignedX) mod 6 == 0`.  @0xfd0b2-fd0df
    // The asm uses signed floor-mod: `diff mod 6` with `diff = right -
    // alignedX`. When `right >= alignedX` (the normal case for a well-
    // formed rect), signed-floor-mod matches JS `((diff % 6) + 6) % 6`.
    // We follow the asm literally to preserve behaviour on malformed
    // rects too:
    const diff = (rect.right - alignedX) | 0;              // @0xfd0b5 subl (32-bit)
    // signed floor-division remainder: diff - 6 * floor(diff / 6)
    const floorDiv6 = Math.floor(diff / 6);                // @0xfd0cc (signed div-by-6)
    const mod6 = (diff - 6 * floorDiv6) | 0;               // @0xfd0d3 subl %edx, %esi
    let alignedRight: number;
    if (mod6 === 0) {
      // @0xfd0dd..fd0df  cmovel: if remainder is 0, right is already aligned
      alignedRight = rect.right;
    } else {
      // @0xfd0d8..fd0da  edx = right - mod6 + 6
      alignedRight = (rect.right - mod6 + 6) | 0;
    }

    return {
      x: alignedX,                                          // @0xfd0f5 orq → low 32
      y: rect.y,                                            // @0xfd0f0 andq high-32 mask, passthrough
      right: alignedRight,                                  // @0xfd0f8 orq → low 32
      bottom: rect.bottom,                                  // @0xfd0ed andq high-32 mask, passthrough
    };
  }
}
