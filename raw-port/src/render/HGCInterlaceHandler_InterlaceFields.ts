// HGCInterlaceHandler_InterlaceFields.ts — Helium's tile-geometry (DOD/ROI)
// half-height interlace node, transcribed faithfully from the x86_64 disassembly
// of /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_InterlaceFields.GetDOD.s   @0x93440
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_InterlaceFields.GetROI.s   @0x93490
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_InterlaceFields.~HGCInterlaceHandler_InterlaceFields.s @0x93420 (D0)
//   (D1 @0x93410 is ICF-folded in this binary — no body line in `otool -tV`; the
//    vtable entry for the base-object destructor is a pure return + delete-none.)
//
// Class role (recovered from GetDOD/GetROI + the sibling _HGRectNull symbol):
// this is the pure geometry-transform pair of an "InterlaceFields" filter node —
// given a caller-supplied HGRect in the current field-slot's coordinate space,
// it maps that rect into the DOD (Domain-Of-Definition) or ROI (Region-Of-Interest)
// of the OTHER (full-frame, non-interlaced) representation of the same image.
//
// The geometry, exactly as decoded from the two functions:
//   - DOD: full-frame rect has EACH FIELD DOUBLED IN HEIGHT (shll on both
//     the height component -0xC(%rbp) and the vertical-anchor / bottom
//     component -0x4(%rbp)); the horizontal components are UNCHANGED.
//   - ROI: full-frame rect has BOTH VERTICAL components HALVED
//     (sarl-with-rounding-toward-zero via the classic  `mov edx,eax; shr
//     edx,31; add eax,edx; sar edx` idiom for `x >> 1`), and ROI's `y` also
//     gets a -1 (`decl %edx`) shim after halving. Horizontal untouched.
//
// Both paths GATE on:
//   1. the incoming `int fieldSlot` parameter (%edx) being 0 or 1 —
//      `cmpl $0x1, %edx ; ja skip` — any other value skips the transform and
//      returns _HGRectNull verbatim (the ja treats %edx as unsigned so a
//      negative fieldSlot ALSO takes the skip branch).
//   2. HGRect::IsInfinite(inputRect) being FALSE — if the input rect is the
//      sentinel HGRectInfinite the code skips the transform.
//
// Non-obvious details that a naive port would miss:
//   - The return-value staging area at -0x10(%rbp) is INITIALIZED FROM
//     _HGRectNull BEFORE the input rect is even loaded — but ONLY the
//     fieldSlot-invalid early-out actually returns HGRectNull. Once
//     fieldSlot is valid, the slot is overwritten with inputRect and the
//     IsInfinite early-out returns THAT (unmutated input) rect, not
//     HGRectNull. This matches the raw asm control-flow bit-for-bit.
//   - The vertical field-slot argument is NOT USED to alter which lanes
//     we scale — GetDOD unconditionally doubles both vertical components,
//     and GetROI unconditionally halves both. The `cmpl $1,%edx` is a
//     validity gate, not a lane selector.
//   - The `decl %edx` in GetROI @0x934CF applies ONLY to the y component
//     (-0xC(%rbp) which is +0x04 in the returned HGRect — this HGRect
//     layout is {x@+0x00, y@+0x04, right@+0x08, bottom@+0x0C}). GetROI
//     shrinks y by one pixel post-halving so the fetched full-frame
//     region has a one-row safety guard for the vertical interpolator
//     upstream.
//   - `shll` in GetDOD is a 1-bit left-shift on a signed 32-bit int
//     (unchecked `<<1`) — no clamp; a very large y or bottom would wrap.
//     This mirrors the raw asm.
//   - `sarl` in GetROI is signed arithmetic right-shift; the surrounding
//     `mov edx,eax; shr edx,31; add eax,edx; sar` idiom converts the
//     shift to "round toward zero" semantics (Math.trunc(x/2)), which
//     differs from a plain `x >> 1` when x is negative and odd.
//
// Layout / relationships (from D0's tail-call chain, resolved via nm +
// `raw-port/army/tools/resolve.py`):
//   HGCInterlaceHandler_InterlaceFields is the "channel" front-end
//   companion to the sibling render-side class
//   HgcInterlaceHandler_InterlaceFields (lowercase 'gc') — D0 first
//   invokes the sibling's D2 destructor, then tail-calls HGObject::
//   operator delete. This class carries no owned fields of its own beyond
//   what HgcInterlaceHandler_InterlaceFields owns.
//
// Frontier callees (not ported here):
//   HgcInterlaceHandler_InterlaceFields::~HgcInterlaceHandler_InterlaceFields()  @Helium 0x93429
//   HGObject::operator delete(void*)                                              @Helium 0x93437

import { HGRect, HGRectNull, HGRectIsInfinite } from "./HGRect";

/** HGRenderer is a Helium node-graph runtime handle we do not yet decode; the
 *  DOD/ROI code paths read no fields off it (the %rsi arg is loaded but
 *  never dereferenced), so we accept an opaque token. */
export type HGRenderer = unknown;

/** HGCInterlaceHandler_InterlaceFields — pure geometry-transform channel node.
 *  Exposes GetDOD / GetROI. The destructor (D0 @0x93420) is not modeled as
 *  a JS method because it only chains to base-class cleanup + free. */
export class HGCInterlaceHandler_InterlaceFields {
  // No own fields recovered from D0 — the only work D0 does around the
  // base-destructor call is saving `this` in %rbx, so there is no owned
  // buffer or pointer to release on this class.

  /**
   * GetDOD — Domain-Of-Definition mapper, @Helium 0x93440.
   *
   * Faithful transcription of:
   *   sub    $0x10,%rsp
   *   lea    _HGRectNull(%rip),%rax          ; @0x93448
   *   movups (%rax),%xmm0                    ; xmm0 = HGRectNull bytes
   *   movaps %xmm0,-0x10(%rbp)               ; ret slot = HGRectNull
   *   cmp    $0x1,%edx                       ; if fieldSlot > 1 (unsigned)
   *   ja     0x93476                         ;   skip transform
   *   mov    %rcx,-0x10(%rbp)                ; ret slot .lo = inputRect.lo
   *   mov    %r8, -0x8 (%rbp)                ; ret slot .hi = inputRect.hi
   *   lea    -0x10(%rbp),%rdi
   *   call   HGRect::IsInfinite() const      ; @0x93467
   *   test   %al,%al
   *   jne    0x93476                         ; if IsInfinite skip
   *   shll   -0xc(%rbp)                      ; y      <<= 1
   *   shll   -0x4(%rbp)                      ; bottom <<= 1
   * 0x93476: return ret slot.
   *
   * @param renderer opaque HGRenderer* (unused; %rsi spilled but not deref'd).
   * @param fieldSlot int - must be 0 or 1; anything else returns HGRectNull.
   * @param inputRect  HGRect - per-field rect to expand to full-frame DOD.
   * @returns HGRect - full-frame DOD (y and bottom doubled).
   */
  GetDOD(renderer: HGRenderer, fieldSlot: number, inputRect: HGRect): HGRect {
    void renderer;
    // @0x93448 - 0x93452  ret slot pre-seeded with _HGRectNull
    // (Mirrors  lea _HGRectNull(%rip),%rax ; movups (%rax),%xmm0 ; movaps %xmm0,-0x10(%rbp))
    // @0x93456  cmpl $1,%edx  ;  ja  - unsigned compare rejects fieldSlot outside 0..1
    if ((((fieldSlot | 0) >>> 0)) > 1) {
      // @0x93476 fall-through with the pre-seeded HGRectNull
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0x9345B - 0x9345F  ret slot := inputRect (mov %rcx,-0x10 ; mov %r8,-0x8)
    const x = inputRect.x | 0;
    const yIn = inputRect.y | 0;
    const right = inputRect.right | 0;
    const bottomIn = inputRect.bottom | 0;
    // @0x93463 - 0x93467  callq HGRect::IsInfinite(&ret slot)  ; testb ; jne skip
    const staged: HGRect = { x, y: yIn, right, bottom: bottomIn };
    if (HGRectIsInfinite(staged)) {
      // @0x93476 return with ret slot still holding the (unmutated) input rect.
      return staged;
    }
    // @0x93470  shll -0xc(%rbp)  ; y      <<= 1
    // @0x93473  shll -0x4(%rbp)  ; bottom <<= 1
    // Mirror x86 32-bit signed <<1 via `| 0` to force int32 semantics.
    const yOut = ((yIn << 1) | 0);
    const bottomOut = ((bottomIn << 1) | 0);
    return { x, y: yOut, right, bottom: bottomOut };
  }

  /**
   * GetROI - Region-Of-Interest mapper, @Helium 0x93490.
   *
   * Faithful transcription of:
   *   sub    $0x10,%rsp
   *   lea    _HGRectNull(%rip),%rax          ; @0x93498
   *   movups (%rax),%xmm0
   *   movaps %xmm0,-0x10(%rbp)               ; ret slot = HGRectNull
   *   cmp    $0x1,%edx
   *   ja     0x934e0                         ; fieldSlot invalid -> skip
   *   mov    %rcx,-0x10(%rbp)
   *   mov    %r8, -0x8 (%rbp)
   *   lea    -0x10(%rbp),%rdi
   *   call   HGRect::IsInfinite() const      ; @0x934B7
   *   test   %al,%al
   *   jne    0x934e0                         ; infinite -> skip
   *   mov    -0xc(%rbp),%eax                 ; eax = y
   *   mov    -0x4(%rbp),%ecx                 ; ecx = bottom
   *   ;  --- edx = trunc(y/2) - 1 ---
   *   mov    %eax,%edx
   *   shr    $0x1f,%edx                      ; edx = (y<0) ? 1 : 0
   *   add    %eax,%edx                       ; edx = y + sign(y)
   *   sar    %edx                            ; edx = trunc(y/2)
   *   dec    %edx                            ; edx = trunc(y/2) - 1
   *   mov    %edx,-0xc(%rbp)                 ; y := trunc(y/2) - 1
   *   ;  --- eax = trunc(bottom/2) ---
   *   mov    %ecx,%eax
   *   shr    $0x1f,%eax                      ; eax = (bottom<0) ? 1 : 0
   *   add    %ecx,%eax                       ; eax = bottom + sign(bottom)
   *   sar    %eax                            ; eax = trunc(bottom/2)
   *   mov    %eax,-0x4(%rbp)                 ; bottom := trunc(bottom/2)
   * 0x934e0: return ret slot.
   *
   * The `mov %eax,%edx ; shr $0x1f,%edx ; add %eax,%edx ; sar %edx` sequence
   * is the compiler's canonical lowering of C signed `x / 2` (round toward
   * zero). In JS, `(x / 2) | 0` reproduces the same 32-bit trunc-toward-0
   * behavior for the value ranges the caller passes here (32-bit signed
   * ints, mirrored from asm using `| 0`).
   *
   * @param renderer opaque HGRenderer* (unused).
   * @param fieldSlot int - 0 or 1 only, else early-out to HGRectNull.
   * @param inputRect HGRect - per-field ROI request.
   * @returns HGRect - full-frame ROI, vertically halved with y guard row.
   */
  GetROI(renderer: HGRenderer, fieldSlot: number, inputRect: HGRect): HGRect {
    void renderer;
    // @0x93498 - 0x934A2  ret slot pre-seeded with _HGRectNull
    // @0x934A6  unsigned compare against 1
    if ((((fieldSlot | 0) >>> 0)) > 1) {
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0x934AB - 0x934AF  ret slot := inputRect
    const x = inputRect.x | 0;
    const yIn = inputRect.y | 0;
    const right = inputRect.right | 0;
    const bottomIn = inputRect.bottom | 0;
    // @0x934B7  IsInfinite check
    const staged: HGRect = { x, y: yIn, right, bottom: bottomIn };
    if (HGRectIsInfinite(staged)) {
      return staged;
    }
    // @0x934C0 - 0x934D1  y := trunc(y / 2) - 1
    // The `mov %eax,%edx ; shr $0x1f,%edx ; add %eax,%edx ; sar %edx` sequence
    // is signed div-by-2 rounding toward zero; JS `(x/2)|0` matches for int32.
    const yOut = (((yIn / 2) | 0) - 1) | 0;
    // @0x934D4 - 0x934DD  bottom := trunc(bottom / 2)
    const bottomOut = (bottomIn / 2) | 0;
    return { x, y: yOut, right, bottom: bottomOut };
  }

  /**
   * Destructor D0 @Helium 0x93420 - for reference only, not exposed as JS.
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi,%rbx                                        ; save this
   *   callq HgcInterlaceHandler_InterlaceFields::~HgcInterlaceHandler_InterlaceFields()  ; base D2, not yet transcribed @Helium 0x93429
   *   movq  %rbx,%rdi
   *   addq  $8,%rsp ; popq %rbx ; popq %rbp
   *   jmp   HGObject::operator delete(void*)                 ; not yet transcribed @Helium 0x93437
   *
   * D1 @Helium 0x93410 is ICF-folded (0-line body under otool -tV). No
   * observable state to release from this class beyond the base subobject.
   */
}
