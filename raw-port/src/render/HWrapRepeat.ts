// raw-port/src/render/HWrapRepeat.ts
//
// FCP `HWrapRepeat` — Ozone render-graph facade for the HgcWrapRepeat
// texture-wrap-repeat compositor kernel. HWrapRepeat is a thin subclass
// of `HgcWrapRepeat` (an HGNode-derived compositor node) that owns a
// mask rect + forward/inverse 4×4 double matrices and forwards them
// down as float uniforms through the base class's `SetParameter(int,
// float, float, float, float)` vtable slot (HGNode vtable +0x60).
//
// GetROI / GetDOD implement the render-graph tile bounds; they consult
// the input `HGRect` and the stored matrices to compute the region of
// interest that the sampler needs, then clamp with HGRectInfinite /
// HGRectNull and integralize via HGRectMake4i.
//
// HWrapRepeat is BYTE-IDENTICAL in opcode structure to HWrapMirror (see
// raw-port/src/render/HWrapMirror.ts): only the RIP-relative displacement
// operands differ (they resolve to the SAME external symbols and the
// SAME __TEXT.__const doubles).  This mirrors the fact that WrapRepeat
// and WrapMirror are two shader-only variants of the same node family
// on FCP's side — the outer ROI/DOD math is shared.  We port them as
// two separate files per the "one class = one file" rule (PORTING_SPEC
// rule 6), and re-verify each RIP-rel target on the HWrapRepeat side.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; file
//             offset 0x0 for __TEXT; VAs below are unadjusted VM
//             addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/HWrapRepeat.~HWrapRepeat.s    @0x470730 (D1) / @0x470740 (D0)
//   raw-port/re/disasm/HWrapRepeat.GetDOD.s          @0x470760
//   raw-port/re/disasm/HWrapRepeat.GetROI.s          @0x4707b0
//   raw-port/re/disasm/HWrapRepeat.setMaskRect.s     @0x470890
//   raw-port/re/disasm/HWrapRepeat.setMatrix.s       @0x4708e0
//   raw-port/re/disasm/HWrapRepeat.setInvMatrix.s    @0x470ab0
//
// Ledger addresses (raw-port/army/ledger/Ozone.ledger.json → "HWrapRepeat"):
//   0x470730  HWrapRepeat::~HWrapRepeat()   [D1 complete dtor — tail-jmp to HgcWrapRepeat::~HgcWrapRepeat (D2)]
//   0x470740  HWrapRepeat::~HWrapRepeat()   [D0 deleting dtor — D2 + HGObject::operator delete]
//   0x470760  HWrapRepeat::GetDOD(HGRenderer*, int index, HGRect)
//   0x4707b0  HWrapRepeat::GetROI(HGRenderer*, int index, HGRect)
//   0x470890  HWrapRepeat::setMaskRect(PCRect<double> const&)
//   0x4708e0  HWrapRepeat::setMatrix(PCMatrix44Tmpl<double> const&)
//   0x470ab0  HWrapRepeat::setInvMatrix(PCMatrix44Tmpl<double> const&)
//
// EXTERNAL FUNCTIONS REFERENCED (undecoded — throwing stubs cite their addrs):
//   * HgcWrapRepeat::~HgcWrapRepeat() [D2]       @Ozone 0x6d0040
//     (tail-called by HWrapRepeat::~HWrapRepeat D1 @0x470735; also by D0 @0x470749)
//   * HGObject::operator delete(void*)            @Ozone __stubs 0x6def6a
//     (tail-jmp'd by HWrapRepeat::~HWrapRepeat D0 @0x470757 to free the object)
//   * HGRectIsNull(HGRect)                        @Ozone __stubs 0x6dcc9c
//     (called by GetDOD @0x47077d on the input rect: rdi=x/y quad, rsi=w/h quad)
//   * HGRectMake4i(int, int, int, int)            @Ozone __stubs 0x6dcca8
//     (called by GetROI @0x47086a after computing floor/ceil integer corners)
//   * PCMatrix44Tmpl<double>::transformRect<double>(
//         PCRect<double> const&, PCRect<double>&) const
//                                                 @Ozone (Ozone-local; local
//                                                  callq at 0x4707e7 target
//                                                  __ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_)
//   * Base-class vtable slot 0x60 (HGNode-inherited via HgcWrapRepeat):
//        HgcWrapRepeat::SetParameter(int idx, float, float, float, float)
//                                                 @Ozone 0x6d00e0
//     Reached at call sites:
//        setMaskRect     @0x4708d6 (idx=0, tail-jmpq)
//        setMatrix       @0x470a0a (idx=1), @0x470a3c (idx=2),
//                        @0x470a6e (idx=3), @0x470aa8 (idx=4)  [tail-jmpq]
//        setInvMatrix    @0x470bda (idx=5), @0x470c0c (idx=6),
//                        @0x470c3e (idx=7), @0x470c78 (idx=8)  [tail-jmpq]
//
// DATA symbols read from Ozone __TEXT.__const (bit-exact bytes read
// through `lipo -thin x86_64 -output /tmp/Ozone_slice.x86_64` and
// unpacked as little-endian doubles):
//   _HGRectNull       @Ozone   16 bytes = { .x=0, .y=0, .right=0, .bottom=0 }
//                     (loaded by GetDOD @0x470764 as fall-through result;
//                      also @0x470789/0x470875 as the "not-null / on-fail"
//                      fallback in GetDOD / GetROI.)
//   _HGRectInfinite   @Ozone   16 bytes = { INT_MIN, INT_MIN, INT_MAX, INT_MAX }
//                     (loaded by GetDOD @0x470782 as the "input rect IS null"
//                      result — HGRectIsNull(rect) → true.)
//   const double pair @Ozone 0x7053c0  = [-1.0, -1.0]
//                     (movaps loaded into xmm0 by GetROI @0x4707ca — used as
//                      the initial stack scratch rect's upper 16 bytes; only
//                      the lower 16 bytes are then overwritten by
//                      transformRect's output.  Value only reaches the actual
//                      output rect if transformRect returns false — but that
//                      path branches to the HGRectNull return @0x470875 and
//                      never uses these bytes.  Faithfully preserved here
//                      for provenance.)
//   const double      @Ozone 0x70e180  = -1.1
//                     (movsd xmm0 @0x4707f4; margin subtracted from the low
//                      corner of the transformed rect before floor.)
//   const double      @Ozone 0x70e188  = +2.2
//                     (movsd xmm2 @0x47080a; margin added to the high corner
//                      of the transformed rect before ceil.  Note 0x70e188 =
//                      0x70e180 + 8, so this is a paired constant.)
//   const double      @Ozone 0x706ed0  = 1e-07
//                     (movsd xmm4 @0x470820; epsilon nudge added before each
//                      of the four floor/ceil roundsd operations.)
//
// STRUCT LAYOUT (recovered from setMaskRect/setMatrix/setInvMatrix
// stores; base HgcWrapRepeat subobject not yet decoded here — it is a
// standard HGNode-derived compositor so occupies 0x000..≥0x1a0):
//   HWrapRepeat {
//     +0x000..+0x19f  HgcWrapRepeat subobject (vptr, HGNode base, plus
//                     the compositor-kernel fields the base class owns)
//     +0x1a0  double   maskRect.x     (setMaskRect stores rsi[+0x00])
//     +0x1a8  double   maskRect.y     (setMaskRect stores rsi[+0x08])
//     +0x1b0  double   maskRect.w     (setMaskRect stores rsi[+0x10])
//     +0x1b8  double   maskRect.h     (setMaskRect stores rsi[+0x18])
//     +0x1c0  double[16] matrix       (setMatrix copies row-major, elt-by-elt)
//     +0x240  double[16] invMatrix    (setInvMatrix copies row-major, elt-by-elt)
//   }
//   GetROI reads:
//     r14 (this) + 0x240   → invMatrix   (arg 0 to transformRect: `this`)
//     r14 (this) + 0x1a0   → maskRect    (arg 1 to transformRect: `input rect`)
//
// The `PCRect<double>` layout is confirmed by setMaskRect's 4 double
// loads at offsets {0x00, 0x08, 0x10, 0x18} (i.e. {x, y, w, h}) and by
// GetROI's use of the 4 doubles at {-0x20, -0x18, -0x10, -0x08}(%rbp)
// after transformRect (also {x, y, w, h}).
//
// DECODE-DON'T-FIT: every method here mirrors its asm; the base-class
// vtable dispatch to `SetParameter` is expressed as a virtual call on
// the compositor object.  Undecoded external callees are declared as
// throwing stubs that CITE THEIR ADDRESSES (per PORTING_SPEC rule 3).

import { HGRect, HGRectNull, HGRectInfinite, HGRectMake4i } from "./HGRect";

/** IEEE-754 32-bit single precision projection (mirrors cvtsd2ss).
 *  Used by every setMatrix / setMaskRect / setInvMatrix demote before
 *  the SetParameter uniform call. */
const f32 = Math.fround;

// ---------------------------------------------------------------------------
// Opaque external types (not decoded here).
// ---------------------------------------------------------------------------

/** HGRenderer — Helium render-graph runner; opaque here. GetDOD/GetROI take
 *  it as their first arg but do not dereference it. */
export type HGRenderer = unknown;

/** PCRect<double> — the {x, y, w, h} rectangle passed to setMaskRect and
 *  the input/output of PCMatrix44Tmpl<double>::transformRect<double>.
 *  Byte layout: 4 packed doubles at offsets 0x00, 0x08, 0x10, 0x18. */
export interface PCRectD {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** PCMatrix44Tmpl<double> — 16 packed doubles (row-major, 128 bytes). Byte
 *  layout confirmed by setMatrix/setInvMatrix stores at offsets 0x00..0x78
 *  step 0x08.  The class is not yet independently ported (@Ozone contains
 *  its transformRect method used below); we model it as a fixed 16-elt
 *  array to preserve field addressing exactly. */
export type PCMatrix44Double = readonly [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

// ---------------------------------------------------------------------------
// Undecoded external callees — throwing stubs.  These MUST cite their
// address so `frontier.py` can see the gap.  A loud gap is correct per
// PORTING_SPEC rule 3.
// ---------------------------------------------------------------------------

/** PCMatrix44Tmpl<double>::transformRect<double>(
 *      PCRect<double> const& in, PCRect<double>& out) const
 *  — mangled __ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_.
 *  Called from GetROI @0x4707e7.  Body unported: the transform math
 *  isn't yet decoded from the Ozone binary. */
function PCMatrix44Tmpl_double__transformRect(
  _self: PCMatrix44Double,
  _inRect: PCRectD,
  _outRect: PCRectD,
): boolean {
  throw new Error(
    "PCMatrix44Tmpl<double>::transformRect<double>(PCRect const&, PCRect&) const " +
      "@Ozone (call site 0x4707e7) not yet transcribed",
  );
}

/** HgcWrapRepeat::~HgcWrapRepeat() [D2 base dtor] — @Ozone 0x6d0040.
 *  Tail-called by both HWrapRepeat::~HWrapRepeat overloads (D1 @0x470735,
 *  D0 @0x470749).  Body unported. */
function HgcWrapRepeat_D2(_self: HWrapRepeat): void {
  throw new Error(
    "HgcWrapRepeat::~HgcWrapRepeat() [D2] @Ozone 0x6d0040 not yet transcribed " +
      "(called from HWrapRepeat dtors @0x470735 / @0x470749)",
  );
}

/** HGObject::operator delete(void*) — @Ozone __stubs 0x6def6a (resolves to
 *  the runtime allocator's `free`).  Tail-jmp'd by HWrapRepeat::~HWrapRepeat
 *  D0 @0x470757 after D2. */
function HGObject_operator_delete(_p: HWrapRepeat): void {
  throw new Error(
    "HGObject::operator delete(void*) @Ozone stub 0x6def6a " +
      "not yet transcribed (called from HWrapRepeat D0 @0x470757)",
  );
}

/** HGRectIsNull(HGRect) — @Ozone __stubs 0x6dcc9c.  Reads the 16-byte
 *  HGRect passed by value in (rdi, rsi) and returns bool in eax.
 *  Called from GetDOD @0x47077d. */
function HGRectIsNull(_r: HGRect): boolean {
  throw new Error(
    "HGRectIsNull(HGRect) @Ozone stub 0x6dcc9c not yet transcribed " +
      "(called from HWrapRepeat::GetDOD @0x47077d)",
  );
}

// ---------------------------------------------------------------------------
// HWrapRepeat.
// ---------------------------------------------------------------------------

/** Instance of HWrapRepeat.  Full 0x000..0x1a0 base subobject is opaque
 *  and threaded through the base-class SetParameter vcall; only the
 *  HWrapRepeat-added fields (maskRect / matrix / invMatrix) are named. */
export class HWrapRepeat {
  /** Mask rect stored in the class (this+0x1a0..0x1c0), 4 packed doubles. */
  maskRect: PCRectD = { x: 0, y: 0, w: 0, h: 0 };

  /** Forward matrix stored in the class (this+0x1c0..0x240), 16 packed doubles. */
  matrix: number[] = new Array<number>(16).fill(0);

  /** Inverse matrix stored in the class (this+0x240..0x2c0), 16 packed doubles. */
  invMatrix: number[] = new Array<number>(16).fill(0);

  /** Base-class vtable slot 0x60 dispatch target.  Concrete override is
   *  HgcWrapRepeat::SetParameter @Ozone 0x6d00e0 (undecoded).  The four
   *  args are always single-precision floats (cvtsd2ss'd from doubles at
   *  each call site). */
  SetParameter(
    _idx: number,
    _p0: number,
    _p1: number,
    _p2: number,
    _p3: number,
  ): void {
    throw new Error(
      "HgcWrapRepeat::SetParameter(int, float, float, float, float) @Ozone 0x6d00e0 " +
        "not yet transcribed (base vtable slot 0x60 reached from HWrapRepeat::" +
        "setMaskRect/setMatrix/setInvMatrix)",
    );
  }

  // -------------------------------------------------------------------------
  // ~HWrapRepeat @0x470730 [D1 complete dtor]  /  @0x470740 [D0 deleting dtor]
  // -------------------------------------------------------------------------
  //
  // D1 @0x470730:  pushq %rbp; movq %rsp, %rbp; popq %rbp;
  //                jmp __ZN13HgcWrapRepeatD2Ev
  //   → pure tail-jmp: run the base class D2 dtor on `this`.
  //
  // D0 @0x470740:  pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax;
  //                movq %rdi, %rbx;
  //                callq __ZN13HgcWrapRepeatD2Ev            @0x470749
  //                movq %rbx, %rdi;
  //                addq $0x8, %rsp; popq %rbx; popq %rbp;
  //                jmp <__stub HGObject::operator delete>   @0x470757
  //   → run base D2 then tail-jmp HGObject::operator delete on `this`.

  /** HWrapRepeat::~HWrapRepeat() [D1 complete dtor] — @0x470730.
   *  Tail-jmp to HgcWrapRepeat::~HgcWrapRepeat (D2).  Does NOT free `this`. */
  dtor_D1(): void {
    // @0x470735: jmp __ZN13HgcWrapRepeatD2Ev
    HgcWrapRepeat_D2(this);
  }

  /** HWrapRepeat::~HWrapRepeat() [D0 deleting dtor] — @0x470740.
   *  Runs D2 then tail-jmps HGObject::operator delete on `this`. */
  dtor_D0(): void {
    // @0x470749: callq __ZN13HgcWrapRepeatD2Ev
    HgcWrapRepeat_D2(this);
    // @0x470757: jmp <__stubs HGObject::operator delete>
    HGObject_operator_delete(this);
  }

  // -------------------------------------------------------------------------
  // GetDOD @0x470760
  //   HGRect GetDOD(HGRenderer* renderer, int index, HGRect rect)
  // -------------------------------------------------------------------------
  //
  //   testl %edx, %edx                         ; index == 0?
  //   je    0x470773                           ; → check-rect branch
  //   movq  <_HGRectNull>, %rcx                ; index != 0 : return HGRectNull
  //   movq  (%rcx), %rax                       ;   (returned as {rax, rdx})
  //   movq  0x8(%rcx), %rdx
  //   retq
  // 0x470773:                                   ; index == 0
  //   pushq %rbp; movq %rsp, %rbp
  //   movq  %rcx, %rdi                          ; rcx/r8 hold the incoming
  //   movq  %r8,  %rsi                          ; HGRect quads → move to (rdi,rsi)
  //                                             ; for the HGRectIsNull call
  //   callq <__stub HGRectIsNull>               @0x47077d
  //   movq  <_HGRectInfinite>, %rcx
  //   movq  <_HGRectNull>,     %rdx
  //   leaq  0x8(%rcx), %rsi                     ; = &_HGRectInfinite.right (hi 8 bytes)
  //   leaq  0x8(%rdx), %rdi                     ; = &_HGRectNull.right
  //   testl %eax, %eax
  //   cmoveq %rcx, %rdx                         ; if isNull==0 (rect NOT null): rdx = &Infinite
  //                                             ; else                       rdx unchanged  = &Null
  //   movq  (%rdx), %rax                        ; rax = lo 8 bytes  (x/y)
  //   cmoveq %rsi, %rdi                         ; if isNull==0: rdi = &Infinite.right
  //                                             ; else         rdi = &Null.right
  //   movq  (%rdi), %rdx                        ; rdx = hi 8 bytes  (right/bottom)
  //   popq  %rbp; retq
  //
  // Semantics: for output port 0, if the *input* rect is null, the DOD is the
  // infinite rect (the wrap-repeat is defined everywhere on a degenerate
  // input); otherwise the DOD is HGRectNull.  Any other output port returns
  // HGRectNull immediately.  Same policy as HWrapMirror.

  GetDOD(_renderer: HGRenderer, index: number, rect: HGRect): HGRect {
    // @0x470760-0x470772: index != 0 path.
    if ((index | 0) !== 0) {
      // returns _HGRectNull by value.
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }
    // @0x470773-0x4707a9: index == 0 path.
    const isNull = HGRectIsNull(rect); // @0x47077d
    // cmove picks &_HGRectInfinite when eax==0 (isNull false).  x86 return-
    // value convention is: rax = lo qword (x,y), rdx = hi qword (right,bottom).
    // Both halves are chosen coherently from the SAME source rect.
    const src = isNull ? HGRectNull : HGRectInfinite;
    return { x: src.x, y: src.y, right: src.right, bottom: src.bottom };
  }

  // -------------------------------------------------------------------------
  // GetROI @0x4707b0
  //   HGRect GetROI(HGRenderer* renderer, int index, HGRect rect)
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp; subq $0x20,%rsp     ; 32-byte stack scratch
  //   testl %edx,%edx                                 ; index == 0?
  //   jne   0x470875                                  ; else → return HGRectNull
  //   movq  %rdi, %rsi                                ; save this in rsi
  //   xorps %xmm0,%xmm0
  //   movaps %xmm0, -0x20(%rbp)                       ; zero stack rect [0..15]
  //   movaps @0x7053c0(%rip), %xmm0                   ; = [-1.0, -1.0] pair
  //   movaps %xmm0, -0x10(%rbp)                       ; scratch rect [16..31]
  //   addq  $0x240, %rdi                              ; rdi = &this->invMatrix
  //   addq  $0x1a0, %rsi                              ; rsi = &this->maskRect
  //   leaq  -0x20(%rbp), %rdx                         ; rdx = &stack rect (out)
  //   callq PCMatrix44Tmpl<double>::transformRect<double>  @0x4707e7
  //           ( invMatrix,  maskRect,  &stackRect )   → bool eax
  //   testb %al,%al
  //   je    0x470875                                  ; on false → HGRectNull
  //
  //   ; success: read stackRect = { x, y, w, h } as 4 doubles and
  //   ; integralize as follows:
  //   movsd  @0x70e180(%rip), %xmm0   ; xmm0 = -1.1
  //   movsd  -0x20(%rbp),    %xmm1    ; xmm1 = stackRect.x
  //   addsd  %xmm0, %xmm1              ; xmm1 = x - 1.1
  //   addsd  -0x18(%rbp), %xmm0        ; xmm0 = -1.1 + stackRect.y
  //   movsd  @0x70e188(%rip), %xmm2   ; xmm2 = +2.2
  //   movsd  -0x10(%rbp),    %xmm3    ; xmm3 = stackRect.w
  //   addsd  %xmm2, %xmm3              ; xmm3 = w + 2.2
  //   addsd  -0x8(%rbp), %xmm2         ; xmm2 = 2.2 + stackRect.h
  //   movsd  @0x706ed0(%rip), %xmm4   ; xmm4 = 1e-7
  //   movapd %xmm1, %xmm5              ; xmm5 = x - 1.1
  //   addsd  %xmm4, %xmm5              ; xmm5 = x - 1.1 + 1e-7
  //   roundsd $0x9, %xmm5, %xmm5       ; floor()
  //   cvttsd2si %xmm5, %edi            ; edi = new_x
  //   addsd  %xmm0, %xmm4              ; xmm4 = (-1.1+y) + 1e-7
  //   roundsd $0x9, %xmm4, %xmm4       ; floor()
  //   cvttsd2si %xmm4, %esi            ; esi = new_y
  //   addsd  %xmm1, %xmm3              ; xmm3 = (w+2.2) + (x-1.1)  = x_right_ish
  //   xorps  %xmm1, %xmm1
  //   roundsd $0xa, %xmm3, %xmm1       ; ceil()
  //   cvttsd2si %xmm1, %edx            ; edx = right
  //   addsd  %xmm0, %xmm2              ; xmm2 = (2.2+h) + (-1.1+y) = y_bot_ish
  //   xorps  %xmm0, %xmm0
  //   roundsd $0xa, %xmm2, %xmm0       ; ceil()
  //   cvttsd2si %xmm0, %ecx            ; ecx = bottom
  //   callq <__stub HGRectMake4i>                   @0x47086a
  //   addq $0x20,%rsp; popq %rbp; retq
  //
  // 0x470875:  ; the "index != 0 OR transformRect failed" branch
  //   movq <_HGRectNull>, %rcx
  //   movq (%rcx), %rax; movq 0x8(%rcx), %rdx
  //   addq $0x20,%rsp; popq %rbp; retq
  //
  // Semantics: for output port 0, transform the mask rect through the
  // stored inverse matrix, then expand-and-integralize with the paired
  // (-1.1, +2.2) margin and 1e-7 rounding-tie epsilon.  For all other
  // ports, or if transformRect returns false, return HGRectNull.  This
  // is identical to HWrapMirror::GetROI in every respect except the
  // RIP-relative displacements (all targets verified above).

  GetROI(_renderer: HGRenderer, index: number, _rect: HGRect): HGRect {
    // @0x4707b8: index == 0?
    if ((index | 0) !== 0) {
      // @0x470875: return HGRectNull.
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }

    // @0x4707c3-0x4707e3: prepare a scratch PCRect on the stack.
    // The scratch's lower 16 bytes (x,y) are zero-initialized; the upper
    // 16 bytes (w,h) are preloaded from the pair-const [-1.0, -1.0] at
    // Ozone 0x7053c0.  These pre-values are only observable if
    // transformRect writes fewer than 32 bytes.  We faithfully mirror the
    // preload so the field is defined before the call.
    const stackRect: PCRectD = { x: 0, y: 0, w: -1.0, h: -1.0 };

    // @0x4707e7: transformRect(this->invMatrix, this->maskRect, &stackRect).
    const ok = PCMatrix44Tmpl_double__transformRect(
      this.invMatrix as unknown as PCMatrix44Double,
      this.maskRect,
      stackRect,
    );
    // @0x4707ec-0x4707ee:
    if (!ok) {
      return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
    }

    // Integralize the transformed rect with the (-1.1, +2.2, 1e-7) recipe.
    const kLo = -1.1;   // @Ozone 0x70e180
    const kHi = 2.2;    // @Ozone 0x70e188
    const kEps = 1e-7;  // @Ozone 0x706ed0

    // @0x470801: xmm1 = x + (-1.1)
    const xLo = stackRect.x + kLo;
    // @0x470805: xmm0 = (-1.1) + y      (starts from xmm0 = kLo)
    const yLo = kLo + stackRect.y;
    // @0x470817: xmm3 = w + 2.2
    const wHi = stackRect.w + kHi;
    // @0x47081b: xmm2 = 2.2 + h         (starts from xmm2 = kHi)
    const hHi = kHi + stackRect.h;

    // @0x47082c-0x470836: floor(x_lo + eps) → new_x
    const new_x = truncToI32(Math.floor(xLo + kEps));
    // @0x47083a-0x470844: floor((−1.1+y) + eps) → new_y
    //   (xmm4 was kEps; xmm4 += xmm0 (=yLo); then floor)
    const new_y = truncToI32(Math.floor(kEps + yLo));
    // @0x470848-0x470855: ceil((w+2.2) + (x-1.1)) → right
    //   (xmm3 += xmm1; roundsd mode 0xa = ceil)
    const right = truncToI32(Math.ceil(wHi + xLo));
    // @0x470859-0x470866: ceil((2.2+h) + (-1.1+y)) → bottom
    //   (xmm2 += xmm0; roundsd mode 0xa = ceil)
    const bottom = truncToI32(Math.ceil(hHi + yLo));

    // @0x47086a: return HGRectMake4i(new_x, new_y, right, bottom).
    return HGRectMake4i(new_x, new_y, right, bottom);
  }

  // -------------------------------------------------------------------------
  // setMaskRect @0x470890
  //   void setMaskRect(PCRect<double> const& r)
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp
  //   movups (%rsi),  %xmm0                ; xmm0 = { r.x, r.y }        (16B)
  //   movups 0x10(%rsi),%xmm1              ; xmm1 = { r.w, r.h }        (16B)
  //   movups %xmm1, 0x1b0(%rdi)            ; this->maskRect.{w,h} = ...
  //   movups %xmm0, 0x1a0(%rdi)            ; this->maskRect.{x,y} = ...
  //   movsd  (%rsi),   %xmm0               ; xmm0 = r.x (double)
  //   movsd  0x8(%rsi),%xmm1               ; xmm1 = r.y
  //   cvtsd2ss %xmm0, %xmm0                ; float(r.x)
  //   cvtsd2ss %xmm1, %xmm1                ; float(r.y)
  //   movsd  0x10(%rsi),%xmm2              ; xmm2 = r.w
  //   cvtsd2ss %xmm2, %xmm2                ; float(r.w)
  //   movsd  0x18(%rsi),%xmm3              ; xmm3 = r.h
  //   cvtsd2ss %xmm3, %xmm3                ; float(r.h)
  //   movq  (%rdi),%rax                    ; vtable
  //   movq  0x60(%rax),%rax                ; vtable[+0x60] = SetParameter
  //   xorl  %esi,%esi                      ; idx = 0
  //   popq  %rbp
  //   jmpq  *%rax                          ; tail: SetParameter(0, fx, fy, fw, fh)

  setMaskRect(r: PCRectD): void {
    // Store the 4 doubles into this->maskRect at +0x1a0..+0x1b8.
    // The asm order is: [w,h] pair first, then [x,y] pair, but the net
    // effect is the same 4-field copy; we mirror the observable state.
    this.maskRect.x = r.x;
    this.maskRect.y = r.y;
    this.maskRect.w = r.w;
    this.maskRect.h = r.h;

    // Demote to float and dispatch base SetParameter(idx=0, x, y, w, h).
    const fx = f32(r.x);
    const fy = f32(r.y);
    const fw = f32(r.w);
    const fh = f32(r.h);
    this.SetParameter(0, fx, fy, fw, fh);
  }

  // -------------------------------------------------------------------------
  // setMatrix @0x4708e0
  //   void setMatrix(PCMatrix44Tmpl<double> const& m)
  // -------------------------------------------------------------------------
  //
  //   ; save r14=this, rbx=&m
  //   leaq 0x1c0(%rdi), %rax          ; rax = &this->matrix
  //   cmpq %rax, %rsi                 ; is caller passing our own field?
  //   je   0x4709dc                   ; → self-assign: skip the 16 stores
  //   ; 16× (movsd 0xN(%rbx),%xmm0; movsd %xmm0, 0x1c0+N(%r14))  for
  //   ; N in 0x00..0x78 step 0x08.  Copies all 128 bytes elementwise.
  // 0x4709dc:  ; both paths converge here
  //   ; Column 1 (idx=1) : m[0][0], m[1][0], m[2][0], m[3][0]
  //   movsd (%rbx),%xmm0;  movsd 0x20(%rbx),%xmm1
  //   cvtsd2ss %xmm0,%xmm0; cvtsd2ss %xmm1,%xmm1
  //   movsd 0x40(%rbx),%xmm2; cvtsd2ss %xmm2,%xmm2
  //   movsd 0x60(%rbx),%xmm3; cvtsd2ss %xmm3,%xmm3
  //   movq (%r14),%rax; movq %r14,%rdi; movl $0x1,%esi
  //   callq *0x60(%rax)              ; SetParameter(1, ...)
  //   ; Column 2 (idx=2) : m[0][1], m[1][1], m[2][1], m[3][1]  at +0x8/+0x28/+0x48/+0x68
  //   callq *0x60(%rax)              ; SetParameter(2, ...)
  //   ; Column 3 (idx=3) : +0x10/+0x30/+0x50/+0x70
  //   callq *0x60(%rax)              ; SetParameter(3, ...)
  //   ; Column 4 (idx=4) : +0x18/+0x38/+0x58/+0x78 — tail-jmp
  //   movq 0x60(%rax),%rax; movl $0x4,%esi
  //   popq %rbx; popq %r14; popq %rbp
  //   jmpq *%rax                     ; tail: SetParameter(4, ...)
  //
  // The matrix is stored in row-major order (16 doubles).  The uniform
  // dispatch fetches COLUMNS: for column c ∈ {0..3}, it reads m[r][c]
  // = m[r*4 + c] for r ∈ {0..3}.  Byte-offset math: m[r][c] lives at
  // 8*(4*r + c) = 32r + 8c ⇒ 0x20*r + 0x8*c, matching the disasm.

  setMatrix(m: readonly number[]): void {
    // @0x4708ed-0x4708f7: self-assignment guard.  In JS/TS we can't
    // literally compare "is this the same field slot", but we mirror
    // the "identity → skip copy" semantic: if the caller passes our own
    // .matrix array by reference, we skip the elementwise copy.
    if (m !== (this.matrix as readonly number[])) {
      // @0x4708fd-0x4709d3: 16× movsd copy (row-major, elt by elt).
      for (let i = 0; i < 16; i++) {
        this.matrix[i] = m[i];
      }
    }

    // Send 4 columns via SetParameter(1..4, m[r*4 + c] for r in 0..3).
    for (let c = 0; c < 4; c++) {
      const p0 = f32(m[0 * 4 + c]);
      const p1 = f32(m[1 * 4 + c]);
      const p2 = f32(m[2 * 4 + c]);
      const p3 = f32(m[3 * 4 + c]);
      this.SetParameter(1 + c, p0, p1, p2, p3);
    }
  }

  // -------------------------------------------------------------------------
  // setInvMatrix @0x470ab0
  //   void setInvMatrix(PCMatrix44Tmpl<double> const& m)
  // -------------------------------------------------------------------------
  //
  // Structurally identical to setMatrix: self-assignment guard against
  // this+0x240, elementwise 16-double copy into this->invMatrix, then
  // four SetParameter dispatches with indices 5, 6, 7, 8 (columns 0..3).

  setInvMatrix(m: readonly number[]): void {
    // @0x470abd-0x470ac7: self-assignment guard against this->invMatrix.
    if (m !== (this.invMatrix as readonly number[])) {
      // @0x470acd-0x470ba3: 16× movsd copy.
      for (let i = 0; i < 16; i++) {
        this.invMatrix[i] = m[i];
      }
    }

    // Send 4 columns via SetParameter(5..8, m[r*4 + c] for r in 0..3).
    for (let c = 0; c < 4; c++) {
      const p0 = f32(m[0 * 4 + c]);
      const p1 = f32(m[1 * 4 + c]);
      const p2 = f32(m[2 * 4 + c]);
      const p3 = f32(m[3 * 4 + c]);
      this.SetParameter(5 + c, p0, p1, p2, p3);
    }
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** cvttsd2si — truncate a double to a 32-bit signed integer (rounds toward
 *  zero on the mantissa, saturates on overflow to INT_MIN via x86 "indefinite
 *  integer" 0x80000000).  Mirrors the x86 instruction.  Used by GetROI on
 *  each of the 4 corner values after floor()/ceil(). */
function truncToI32(v: number): number {
  // Overflow / NaN → 0x80000000 (INT_MIN), matching x86 cvttsd2si.
  if (!Number.isFinite(v) || v >= 2147483648 || v < -2147483648) {
    return -2147483648;
  }
  // Truncate toward zero.  Note that Math.trunc() plus |0 both truncate
  // toward zero for values in the i32 range.
  return v | 0;
}
