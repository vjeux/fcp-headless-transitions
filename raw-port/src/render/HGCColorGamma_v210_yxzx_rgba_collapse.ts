// HGCColorGamma_v210_yxzx_rgba_collapse.ts — Helium HGCColorGamma_v210_yxzx_rgba_collapse:
// render-graph node for the "color gamma over v210 (10-bit 4:2:2 YCbCr
// packed, 6-pixels-per-16-bytes) with y/x/z/x → rgba channel collapse"
// per-pixel op. Transcribed from the x86_64 slice of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// Method addresses (llvm-objdump -arch x86_64):
//   @0x000fd8d0  HGCColorGamma_v210_yxzx_rgba_collapse::~HGCColorGamma_v210_yxzx_rgba_collapse() [D1 thunk]
//   @0x000fd8e0  HGCColorGamma_v210_yxzx_rgba_collapse::~HGCColorGamma_v210_yxzx_rgba_collapse() [D0 body]
//   @0x000fd900  HGCColorGamma_v210_yxzx_rgba_collapse::GetOutput(HGRenderer*)
//   @0x000fd910  HGCColorGamma_v210_yxzx_rgba_collapse::GetDOD(HGRenderer*, int, HGRect)
//   @0x000fd950  HGCColorGamma_v210_yxzx_rgba_collapse::GetROI(HGRenderer*, int, HGRect)
//
// v210 packs 6 pixels of 4:2:2 10-bit YCbCr into 16 bytes (4× u32 words:
// each u32 holds three 10-bit samples in the low 30 bits). That 6-pixel
// macropixel is exactly what GetROI aligns to below — x snapped DOWN to
// the nearest multiple of 6, and right rounded UP to the next multiple
// of 6 (adding a full 6 if it was already aligned). This differs from the
// 2vuy / v216 siblings, which use 2-pixel alignment.
//
// Undecoded frontier callees (throwing stubs cite their callee addr):
//   HgcColorGamma_v210_yxzx_rgba_collapse::~HgcColorGamma_v210_yxzx_rgba_collapse [base D2] @Helium
//     direct-called from D0 @0xfd8e9
//   HGRenderer::GetInput(HGNode*, int)                                   @Helium
//     called from GetDOD @0xfd937 with slot=0
//   HGRenderer::GetDOD(HGNode*)                                          @Helium
//     tail-jumped from GetDOD @0xfd948
//   HGObject::operator delete(void*)                                     @Helium
//     tail-jumped from D0 @0xfd8f7
//
// Constants read from Helium __TEXT,__const (verified numerically):
//   @0x3cd320  6.0  (double)                — divisor in the x/6 math
//   @0x3c7cc4  6.0f (float32)               — multiplier snapping back to x = floor(x/6)*6
//   _HGRectNull @0x3d2284                   — the 16 zero bytes returned for slot != 0

import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

/** HGNode — opaque render-graph node handle; layout not decoded here. */
export interface HGNode {}
/** HGRenderer — the render context passed to every vfn; layout undecoded. */
export interface HGRenderer {}

/** `_HGRectNull` — Helium __DATA_CONST sentinel; imported from HGRect.ts. */
const HGRectNull: HGRect = HGRectNullConst;

/**
 * HgcColorGamma_v210_yxzx_rgba_collapse base dtor — direct-called from D0:
 *   @0xfd8e9  callq __ZN37HgcColorGamma_v210_yxzx_rgba_collapseD2Ev
 * The base compute-kernel class ("Hgc..." lowercase-c prefix) has not yet
 * been transcribed.
 */
function HgcColorGamma_v210_yxzx_rgba_collapse_dtor(
  _self: HGCColorGamma_v210_yxzx_rgba_collapse,
): void {
  // raise: undecoded base dtor. Cited: @0xfd8e9 (D0 direct call).
  throw new Error(
    "HgcColorGamma_v210_yxzx_rgba_collapse base dtor @Helium __ZN37HgcColorGamma_v210_yxzx_rgba_collapseD2Ev @0xfd8e9 not yet transcribed",
  );
}

/** HGObject::operator delete — tail-called from D0 @0xfd8f7 (jmp
 *  __ZN8HGObjectdlEPv). Not decoded here. */
function HGObject_operatorDelete(
  _p: HGCColorGamma_v210_yxzx_rgba_collapse,
): void {
  // raise: undecoded deallocator. Cited: @0xfd8f7.
  throw new Error(
    "HGObject::operator delete @Helium __ZN8HGObjectdlEPv @0xfd8f7 not yet transcribed",
  );
}

/** HGRenderer::GetInput(HGNode* self, int slot) — called from GetDOD
 *  @0xfd937 with slot=0. Not yet transcribed. */
function HGRenderer_GetInput(
  _r: HGRenderer,
  _self: HGCColorGamma_v210_yxzx_rgba_collapse,
  _slot: number,
): HGNode | null {
  // raise: undecoded renderer input lookup. Cited: @0xfd937.
  throw new Error(
    "HGRenderer::GetInput @Helium __ZN10HGRenderer8GetInputEP6HGNodei @0xfd937 not yet transcribed",
  );
}

/** HGRenderer::GetDOD(HGNode*) — tail-called from GetDOD @0xfd948. Not
 *  yet transcribed. */
function HGRenderer_GetDOD(_r: HGRenderer, _n: HGNode | null): HGRect {
  // raise: undecoded renderer DOD accessor. Cited: @0xfd948.
  throw new Error(
    "HGRenderer::GetDOD @Helium __ZN10HGRenderer6GetDODEP6HGNode @0xfd948 not yet transcribed",
  );
}

export class HGCColorGamma_v210_yxzx_rgba_collapse {
  /**
   * ~HGCColorGamma_v210_yxzx_rgba_collapse() [D0 body] @0xfd8e0
   *
   *   @0xfd8e0 pushq %rbp
   *   @0xfd8e4 pushq %rbx
   *   @0xfd8e6 movq  %rdi, %rbx           ; save `this`
   *   @0xfd8e9 callq HgcColorGamma_v210_yxzx_rgba_collapse::~... (base D2)
   *   @0xfd8ee movq  %rbx, %rdi           ; restore this for the tail
   *   @0xfd8f7 jmp   HGObject::operator delete(void*)
   *
   * Standard "base-dtor + operator-delete" deleting dtor. The extra
   * pushq/pushq/subq/popq shuffle around the call is 16-byte stack
   * alignment; no observable state.
   *
   * (The D1 thunk at @0xfd8d0 — a bare tail-call to base D2 — is exposed
   * only via the vtable; its body is identical to the base dtor helper
   * with no HGObject delete step, so we simply do not model it separately
   * here to keep the ported surface minimal. See @0xfd8d0.)
   */
  destroy(): void {
    HgcColorGamma_v210_yxzx_rgba_collapse_dtor(this); // @0xfd8e9
    HGObject_operatorDelete(this); // @0xfd8f7 (tail)
  }

  /**
   * GetOutput(HGRenderer*) @0xfd900
   *
   *   @0xfd900 pushq %rbp
   *   @0xfd901 movq  %rsp, %rbp
   *   @0xfd904 movq  %rdi, %rax   ; rax = this
   *   @0xfd907 popq  %rbp
   *   @0xfd908 retq
   *
   * Trivially returns `this` — the node IS its own output slot. Same
   * one-instruction body as the 2vuy / v216 siblings' GetOutput.
   */
  GetOutput(_r: HGRenderer): HGCColorGamma_v210_yxzx_rgba_collapse {
    return this; // @0xfd904
  }

  /**
   * GetDOD(HGRenderer* r, int slot, HGRect rect) @0xfd910
   *
   *   @0xfd910 testl %edx, %edx
   *   @0xfd912 je    0xfd923            ; slot == 0 → real body
   *   @0xfd914 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd91b rax = *(rcx)             ; low  half = HGRectNull.x, HGRectNull.y
   *   @0xfd91e rdx = *(rcx+8)           ; high half = HGRectNull.right, HGRectNull.bottom
   *   @0xfd922 retq                     ; return HGRectNull for any slot != 0
   *
   *   slot == 0 body (@0xfd923):
   *   @0xfd923 pushq %rbp
   *   @0xfd929 rax = rdi (this)
   *   @0xfd92c rdi = rsi (renderer)
   *   @0xfd92f rbx = rsi                ; keep renderer for tail call
   *   @0xfd932 rsi = rax (this)         ; HGRenderer::GetInput(this, 0)
   *   @0xfd935 edx = 0                  ; slot 0
   *   @0xfd937 callq HGRenderer::GetInput
   *   @0xfd93c rdi = rbx (renderer)
   *   @0xfd93f rsi = rax (input node)
   *   @0xfd948 jmp   HGRenderer::GetDOD(input)
   *
   * DOD = input's DOD for slot 0, HGRectNull otherwise. Same shape as
   * the 2vuy / v216 siblings.
   */
  GetDOD(r: HGRenderer, slot: number, _rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfd914..@0xfd922
    }
    const input = HGRenderer_GetInput(r, this, 0); // @0xfd937 (edx=0)
    return HGRenderer_GetDOD(r, input); // @0xfd948 tail call
  }

  /**
   * GetROI(HGRenderer* r, int slot, HGRect rect) @0xfd950
   *
   *   @0xfd950 pushq %rbp
   *   @0xfd954 testl %edx, %edx
   *   @0xfd956 je    0xfd968            ; slot == 0 → real body
   *   @0xfd958 leaq  _HGRectNull(%rip), %rcx
   *   @0xfd95f rax = *(rcx)             ; low half
   *   @0xfd962 rdx = *(rcx+8)           ; high half
   *   @0xfd966 popq  %rbp
   *   @0xfd967 retq                     ; slot != 0 → HGRectNull
   *
   *   slot == 0 body (@0xfd968): 6-pixel align the horizontal edges.
   *   rcx (arg4) low 32 = x, high 32 = y.  r8 (arg5) low 32 = right, high 32 = bottom.
   *
   *   --- test "is x divisible by 6?" via the standard multiply-by-inverse trick ---
   *   @0xfd968 imull  $0xAAAAAAAB, %ecx, %eax       ; eax = x * 0xAAAAAAAB (mod 2^32)
   *   @0xfd96e addl   $0x2AAAAAAA, %eax             ; +bias
   *   @0xfd973 rorl   %eax                          ; ror by 1
   *   @0xfd975 cmpl   $0x2AAAAAAB, %eax             ; if eax < 0x2AAAAAAB then x%6 == 0
   *   @0xfd97a jb     0xfd9a0                       ; already aligned → skip float path
   *
   *   --- x is NOT divisible by 6 → alignedX = floor(x/6)*6 via double/float math ---
   *   @0xfd97c cvtsi2sd  %ecx, %xmm0                ; xmm0 = (double)x
   *   @0xfd980 divsd     [rip+0x2cf998], %xmm0      ; xmm0 = x / 6.0     (const @0x3cd320 = 6.0)
   *   @0xfd988 cvtsd2ss  %xmm0, %xmm0               ; xmm0 = (float)(x/6.0)
   *   @0xfd98c roundss   $9, %xmm0, %xmm0           ; mode 9 = round-down (floor) + suppress
   *   @0xfd992 mulss     [rip+0x2ca32a], %xmm0      ; xmm0 *= 6.0f       (const @0x3c7cc4 = 6.0f)
   *   @0xfd99a cvttss2si %xmm0, %eax                ; eax = (int32)floor(x/6.0)*6.0f
   *   @0xfd99e jmp       0xfd9a2
   *   @0xfd9a0 movl      %ecx, %eax                 ; alignedX = x (already ≡ 0 mod 6)
   *
   *   --- right-edge alignment: round `right` UP to the next multiple of 6 ---
   *   @0xfd9a2 movl   %r8d, %edx                    ; edx = right
   *   @0xfd9a5 subl   %eax, %edx                    ; edx = right - alignedX  (= "width" from aligned x)
   *   @0xfd9a7 movslq %edx, %rsi                    ; rsi = sign-extend edx
   *   @0xfd9aa imulq  $0x2AAAAAAB, %rsi, %rdx       ; signed magic mul for /6 (high-half in rdx)
   *   @0xfd9b1 movq   %rdx, %rdi                    ; rdi = product
   *   @0xfd9b4 shrq   $0x3F, %rdi                   ; rdi = sign bit of product  (0 or 1)
   *   @0xfd9b8 shrq   $0x20, %rdx                   ; rdx = hi32 of product
   *   @0xfd9bc addl   %edi, %edx                    ; edx = signed(width / 6)
   *   @0xfd9be addl   %edx, %edx                    ; edx = 2*q
   *   @0xfd9c0 leal   (%rdx,%rdx,2), %edx           ; edx = 6*q
   *   @0xfd9c3 subl   %edx, %esi                    ; esi = width - 6*q = width % 6
   *   @0xfd9c5 movl   %r8d, %edx                    ; edx = right
   *   @0xfd9c8 subl   %esi, %edx                    ; edx = right - (width % 6)
   *   @0xfd9ca addl   $0x6, %edx                    ; edx = right - (width%6) + 6
   *   @0xfd9cd testl  %esi, %esi
   *   @0xfd9cf cmovel %r8d, %edx                    ; if (width%6 == 0) edx = right (unchanged)
   *
   *   --- repack: rax = alignedX | (y << 32), rdx = newRight | (bottom << 32) ---
   *   @0xfd9d3 movabsq $0xFFFFFFFF00000000, %rsi
   *   @0xfd9dd andq   %rsi, %r8                     ; r8  = bottom << 32
   *   @0xfd9e0 andq   %rsi, %rcx                    ; rcx = y      << 32
   *   @0xfd9e3 movl   %eax, %eax                    ; zero-ext alignedX into rax
   *   @0xfd9e5 orq    %rcx, %rax                    ; rax = alignedX | (y << 32)
   *   @0xfd9e8 orq    %r8, %rdx                     ; rdx = newRight | (bottom << 32)
   *   @0xfd9eb popq   %rbp
   *   @0xfd9ec retq
   *
   * Semantics: x → floor(x/6)*6 ; right → ceil((right - alignedX)/6)*6 + alignedX,
   * with the special case that if (right - alignedX) is already a positive
   * multiple of 6, `right` is passed through unchanged (the cmovel arm).
   * Equivalently, when (right - alignedX) mod 6 != 0 we bump right up to
   * the next multiple of 6 above `right`; when it IS a multiple of 6 we
   * leave it alone. y and bottom pass through untouched.
   *
   * Notes:
   *   - The float path is only taken when x % 6 != 0. That branch is
   *     mathematically equivalent to `Math.floor(x/6)*6` for the range of
   *     int32 values FCP will pass here (rect coordinates are small
   *     enough that (double)x/6.0 is exact well before the cvtsd2ss
   *     narrowing — the mode-9 roundss then floors the float toward -∞).
   *     We mirror the exact code path to keep semantics identical, in
   *     particular the negative-x behaviour (floor toward -∞).
   *   - The magic-mul divisibility test at @0xfd968..@0xfd97a is a standard
   *     "is n % 6 == 0" recognition (Hacker's Delight §10-17): x * inv(6)
   *     + bias, rotate right by tzcnt, compare to floor(2^32/6). The
   *     compiler emits this shortcut so aligned rects skip the FP dance.
   */
  GetROI(_r: HGRenderer, slot: number, rect: HGRect): HGRect {
    if (slot !== 0) {
      return HGRectNull; // @0xfd958..@0xfd967
    }

    // 32-bit int semantics — treat coords as signed int32.
    const x = rect.x | 0;
    const y = rect.y | 0;
    const right = rect.right | 0;
    const bottom = rect.bottom | 0;

    // --- align x DOWN to a multiple of 6 (mirrors @0xfd968..@0xfd9a0) ---
    // The divisibility test at @0xfd968..@0xfd97a is equivalent to `x % 6 == 0`
    // over signed int32. Use JS's native modulo for the fast path.
    let alignedX: number;
    if (x % 6 === 0) {
      alignedX = x; // @0xfd9a0 movl %ecx, %eax
    } else {
      // Float path: (int32) (Math.floor(((float)(x / 6.0))) * 6.0f).
      // divsd then cvtsd2ss then roundss(mode 9 = floor) then mulss then cvttss2si.
      // For the int32 coordinate values used by FCP rects, this is exactly
      // Math.floor(x/6)*6 — we compute it that way and narrow through
      // Math.fround to match the single-precision mulss step at @0xfd992.
      const asDouble = x / 6.0;                 // @0xfd980 divsd
      const asFloat = Math.fround(asDouble);    // @0xfd988 cvtsd2ss
      const floored = Math.floor(asFloat);      // @0xfd98c roundss $9
      const scaled = Math.fround(floored * 6.0); // @0xfd992 mulss (float32 op)
      // cvttss2si truncates toward zero into int32. Math.floor result is
      // already an integer; multiplying by 6.0f keeps it representable in
      // int32 for realistic rect widths. Truncate via |0 to snap to int32.
      alignedX = scaled | 0;                    // @0xfd99a cvttss2si
    }

    // --- align right UP to the next multiple of 6 above `right` (mirrors
    //     @0xfd9a2..@0xfd9cf) — unless (right - alignedX) is already a
    //     positive multiple of 6, in which case pass right through. ---
    const width = (right - alignedX) | 0;      // @0xfd9a5
    // Signed magic-mul divides `width` by 6 with round-toward-zero-then-
    // corrected-for-sign, which is the C99 `/` semantics for signed ints.
    // JS lacks that directly; `Math.trunc(width/6)` matches bit-for-bit.
    const q = Math.trunc(width / 6);           // @0xfd9aa..@0xfd9bc combined
    const mul6q = (q + q + q + q + q + q) | 0; // @0xfd9be..@0xfd9c0: 6*q
    const widthMod6 = (width - mul6q) | 0;     // @0xfd9c3 subl → esi
    let newRight: number;
    if (widthMod6 === 0) {
      newRight = right;                        // @0xfd9cf cmovel %r8d, %edx
    } else {
      newRight = (right - widthMod6 + 6) | 0;  // @0xfd9c5..@0xfd9ca
    }

    // --- repack (@0xfd9d3..@0xfd9e8) — y and bottom pass through ---
    return {
      x: alignedX | 0,
      y: y,
      right: newRight | 0,
      bottom: bottom,
    };
  }
}
