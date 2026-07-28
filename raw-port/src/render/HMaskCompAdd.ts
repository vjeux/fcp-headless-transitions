// HMaskCompAdd.ts — Ozone
//
// HMaskCompAdd: the mask-composite "add" (union) DOD/ROI computation.
// Companion to HMaskCompIntersect (raw-port/src/render/HMaskCompIntersect.ts)
// — same structural pattern (two-input mask node whose GetDOD queries both
// inputs' DODs via HGRenderer::GetInput/GetDOD, clamps their corner
// coordinates into a bounded int32 range, then combines them per an
// operator-specific rule), but with two important semantic differences:
//
//   1) GetDOD's early-out on `|f0| >= 1e-5f` returns **HGRectInfinite**
//      (union of masked+unmasked = unbounded) — NOT HGRectNull like
//      HMaskCompIntersect. Evidence: the literal-pool load @0x436ade is
//      `_HGRectInfinite`, not `_HGRectNull`.
//   2) The "real math" branch computes a corner-form UNION (min-x, min-y,
//      max-right, max-bottom) of the two clamped input rects, NOT an
//      intersection. Evidence: the cmov mnemonics @0x436b2d-@0x436b5a are
//      `cmovll` (`< → src`) for the top-left corner (giving min) and
//      `cmovgl` (`> → src`) for the bottom-right (giving max) — the
//      opposite polarity of HMaskCompIntersect's @0x4371ec/@0x4371f8/etc.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Source disassembly:
//   raw-port/re/disasm/HMaskCompAdd.GetDOD.s               (@0x436920)
//   raw-port/re/disasm/HMaskCompAdd.GetROI.s               (@0x436b90)
//   raw-port/re/disasm/HMaskCompAdd.~HMaskCompAdd.s        (D0 @0x436900)
//   (D1 @0x4368f0 read directly via `otool -tV`; body inlined below.)
//
// Ozone symbols transcribed:
//   @Ozone 0x4368f0  HMaskCompAdd::~HMaskCompAdd()   [D1]
//   @Ozone 0x436900  HMaskCompAdd::~HMaskCompAdd()   [D0]
//   @Ozone 0x436920  HMaskCompAdd::GetDOD(HGRenderer*, int, HGRect)
//   @Ozone 0x436b90  HMaskCompAdd::GetROI(HGRenderer*, int, HGRect)
//
// -----------------------------------------------------------------------------
// External callees cited (all Ozone; addresses are __stubs / literal-pool refs):
//
//   GetDOD @0x436920:
//     @0x436931  ___stack_chk_guard (Ozone data symbol)
//     @0x436943  _HGRectNull        (Ozone data symbol; same 16 zero bytes as
//                                     raw-port/src/render/HGRect.ts HGRectNull)
//     @0x436964  __ZN10HGRenderer8GetInputEP6HGNodei   HGRenderer::GetInput(HGNode*, int)
//                                                     [call #1: which=0]
//     @0x43696f  __ZN10HGRenderer6GetDODEP6HGNode      HGRenderer::GetDOD(HGNode*)
//     @0x436980  _HGRectIsNull                          HGRect predicate
//     @0x436a05  __ZN10HGRenderer8GetInputEP6HGNodei   [call #2: which=1]
//     @0x436a10  __ZN10HGRenderer6GetDODEP6HGNode
//     @0x436a21  _HGRectIsNull
//     @0x436a98  *0x68(%rax) on HGRenderer*             vtable slot 0x68 —
//                                                       reads two SP floats
//                                                       via &out at -0x40/-0x3c
//     @0x436aa0  ABS_MASK  (packed 4x 0x7FFFFFFF — the fabsf mask;
//                            RIP-relative literal-pool at @Ozone
//                            approximately +0x2d1119 from @0x436aa0)
//     @0x436aa7  EPS_1E5F  (0x3727C5AC low32 = 1e-5f;
//                            same @0x707BE0 as HMaskCompIntersect)
//     @0x436ad7  _HGRectMake4i
//     @0x436ade  _HGRectInfinite (Ozone data symbol; the {INT_MIN, INT_MIN,
//                                  INT_MAX, INT_MAX} sentinel — see
//                                  raw-port/src/render/HGRect.ts HGRectInfinite
//                                  @0x3d2294 pattern)
//     @0x436b80  ___stack_chk_fail
//     @0x436b88  __Unwind_Resume (via 0x6dd07a stub)
//
//   GetROI @0x436b90:
//     @0x436b9c  _HGRectNull (Ozone data symbol)
//
//   D1 dtor @0x4368f0:
//     @0x4368f5  __ZN14HgcMaskCompAddD2Ev  HgcMaskCompAdd::~HgcMaskCompAdd()   [base dtor tail-jmp]
//
//   D0 dtor @0x436900:
//     @0x436909  __ZN14HgcMaskCompAddD2Ev  HgcMaskCompAdd::~HgcMaskCompAdd()   [base dtor callq]
//     @0x436917  __ZN8HGObjectdlEPv        HGObject::operator delete(void*)   [tail-jmp]
//
// -----------------------------------------------------------------------------
// GetDOD DECODE (control-flow summary — used to justify the throw-stub
// citation body below; every branch cites its @0xADDR).
//
//   @0x43693f  testl %edx, %edx ; @0x436941 je 0x43694f
//               if (dir != 0) -> jump to @0x436943 (load HGRectNull) -> return via @0x436ae5.
//   @0x436952-@0x436969 (dir == 0 path): r1 = HGRenderer::GetDOD(HGRenderer::GetInput(node, 0)).
//   @0x43697d-@0x436985  is-null check on r1 → default (x=0, right=-1, bottom=-1, y=0).
//   @0x4369a4  jne  0x4369f1   ; skip clamp if isNull(r1) was true (eax != 0).
//   @0x4369a6-@0x4369ea  clamp r1 corners to [0xC0000001..] / [..0x3FFFFFFE]:
//                         x1_c    = max(r1.x, 0xC0000001)    ; cmovgel
//                         y1_c    = max(r1.y, 0xC0000001)    ; cmovgel
//                         w1      = min(r1.right,  0x3FFFFFFE) - x1_c  ; cmovll + subl
//                         h1      = min(r1.bottom, 0x3FFFFFFE) - y1_c  ; cmovll + subl
//                         -0x50=x1_c, -0x4c=y1_c, -0x4c(hi)/-0x48=w1?,
//                         -0x44=w1, -0x48=h1  (frame layout matches Intersect's
//                                              defaulted-then-overwritten slots)
//   @0x4369fa-@0x436a1b  (repeat for input 1): r2 = HGRenderer::GetDOD(GetInput(node, 1)); clamp.
//   @0x436a8c-@0x436a98  vfn: HGRenderer->vt[0x68](this, 1, &out_floats[2]).
//                         Reads out[0]=movss -0x40(%rbp), out[1]=-0x3c(%rbp).
//   @0x436a9b-@0x436ab2  ucomiss(EPS, |out[0]|); jbe → @0x436ade (load HGRectInfinite).
//                         "|f0| >= EPS" → union is unbounded → HGRectInfinite.
//   @0x436ab4-@0x436ac3  ucomiss(EPS, |out[1]|); jbe → @0x436b0f (union math).
//                         Fall-through here means "|f1| < EPS" — return HGRectNull.
//   @0x436b0f-@0x436b6b  UNION MATH (both f0 and f1 within EPS):
//                         if any of {w1, h1, w2, h2} < 0 (isNull-defaulted) use the other input
//                         alone via the @0x436b6d branch; otherwise:
//                           x_out    = min(x1_c, x2_c)              ; cmovll
//                           y_out    = min(y1_c, y2_c)              ; cmovll
//                           right_out= max(x1_c+w1, x2_c+w2)         ; cmovgl
//                           bottom_out= max(y1_c+h1, y2_c+h2)        ; cmovgl
//                           (encoded as `subl %eax,%edx` etc. at
//                            @0x436b5e/@0x436b60 to convert back to
//                            corner form for HGRectMake4i.)
//   @0x436acb-@0x436adc  HGRectMake4i(x, y, x+w, y+h)  — the final union corners.
//   @0x436ae5-@0x436b0e  common tail: stack-guard verify + return.
//
// -----------------------------------------------------------------------------
// GetROI DECODE:
//   @0x436b93  cmpl $0x2, %edx ; @0x436b96 jl 0x436bab
//               if (dir < 2) return incoming rect (rax=%rcx, rdx=%r8 unchanged).
//   @0x436b98-@0x436baa  else load _HGRectNull into (rax, r8) and return.
//   (Identical to HMaskCompIntersect::GetROI @0x437270 — both classes share
//    the "dir 0 or 1 pass-through, dir >= 2 null" ROI convention.)
// -----------------------------------------------------------------------------

import {
  HGRect,
  HGRectNull,
} from "./HGRect";

// -----------------------------------------------------------------------------
// Frontier types (same as HMaskCompIntersect — the Ozone frameworks share them).
// -----------------------------------------------------------------------------

/** HGRenderer — opaque handle. Its vtable slot @+0x68 is the "mask
 *  composite parameters" query used at @0x436a98 to read two SP floats. */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGNode — opaque render-graph node. */
export type HGNode = { readonly __brand: "HGNode" };

/** HMaskCompAdd instance — no decoded fields (GetDOD/GetROI never read
 *  self@+N for any N; the dtors only pass self through to the base dtor). */
export type HMaskCompAdd = { readonly __brand: "HMaskCompAdd" };

// -----------------------------------------------------------------------------
// HMaskCompAdd::GetROI(HGRenderer*, int, HGRect) @Ozone 0x436b90
//
//   @0x436b90  movq %rcx, %rax
//   @0x436b93  cmpl $0x2, %edx
//   @0x436b96  jl   0x436bab            ; if (dir < 2) skip to return incoming
//   @0x436b98  pushq %rbp ; movq %rsp,%rbp
//   @0x436b9c  movq _HGRectNull(%rip), %rcx
//   @0x436ba3  movq (%rcx), %rax        ; rax = HGRectNull.lo
//   @0x436ba6  movq 0x8(%rcx), %r8      ; r8  = HGRectNull.hi
//   @0x436baa  popq %rbp
//   @0x436bab  movq %r8, %rdx
//   @0x436bae  retq
// -----------------------------------------------------------------------------

/** HMaskCompAdd::GetROI(renderer, dir, roi) @Ozone 0x436b90.
 *  For dir in {0, 1} returns the incoming rect unchanged; for dir >= 2
 *  returns HGRectNull. Same convention as HMaskCompIntersect::GetROI. */
export function HMaskCompAdd_GetROI(
  _self: HMaskCompAdd,
  _renderer: HGRenderer,
  dir: number,
  roi: HGRect,
): HGRect {
  // @0x436b93 cmpl $0x2, %edx ; @0x436b96 jl 0x436bab
  if ((dir | 0) < 2) {
    return roi;
  }
  // @0x436b98-@0x436baa: load _HGRectNull.
  return HGRectNull;
}

// -----------------------------------------------------------------------------
// HMaskCompAdd::GetDOD(HGRenderer*, int, HGRect) @Ozone 0x436920 — kept as a
// citation-heavy throw-stub because its 171-line body:
//   * Calls HGRenderer::GetInput @0x436964/@0x436a05 (undecoded frontier —
//     see HMaskCompIntersect.ts HGRenderer_GetInput @Ozone 0x6dd37a).
//   * Calls HGRenderer::GetDOD  @0x43696f/@0x436a10 (undecoded frontier).
//   * Calls HGRenderer->vt[0x68] @0x436a98 (undecoded frontier vfn — reads
//     two mask-parameter SP floats into &out).
//   * Uses HGRectMake4i @0x436ad7 (ported) and HGRectInfinite @0x436ade
//     (ported) and HGRectNull @0x436943 (ported).
//
// The union math (@0x436b2a-@0x436b6b) is decoded in the comment above but
// executing it requires the three HGRenderer callees to return real values;
// without an oracle for this class the union transcription cannot be
// bit-verified, so we surface the frontier as a throw-stub citing every
// callee address instead of fitting a plausible-looking body.
// -----------------------------------------------------------------------------

/** HMaskCompAdd::GetDOD(renderer, dir, _roi) @Ozone 0x436920.
 *  Kept as a citation stub: 171-line body that depends on undecoded frontier
 *  callees HGRenderer::GetInput @Ozone 0x6dd37a, HGRenderer::GetDOD @Ozone
 *  0x6dd36e, and HGRenderer vtable slot @+0x68 @Ozone 0x436a98 (mask-parameter
 *  SP-float query). The union math and clamp helpers are documented in this
 *  file's header comment @0x436a9b-@0x436b6b for the eventual full port. */
export function HMaskCompAdd_GetDOD(
  _self: HMaskCompAdd,
  _renderer: HGRenderer,
  dir: number,
  _roi: HGRect,
): HGRect {
  // @0x43693f testl %edx, %edx ; @0x436941 je 0x43694f
  //   The dir!=0 fast path IS fully decoded (loads _HGRectNull and returns).
  //   We honor it here so callers who only ever pass dir!=0 get correct
  //   behaviour without triggering the frontier.
  if ((dir | 0) !== 0) {
    // @0x436943 movq _HGRectNull(%rip), %rcx ; jmp 0x436ae5 (return).
    return HGRectNull;
  }
  // dir == 0 path @0x43694f-@0x436b6b: two HGRenderer queries + vtable-0x68
  // read + union math. Untranscribed pending decoded HGRenderer methods.
  throw new Error(
    "HMaskCompAdd::GetDOD @Ozone 0x436920 (dir==0 path) not yet transcribed: 171-line body depends on undecoded frontier callees HGRenderer::GetInput @Ozone 0x6dd37a (called at @0x436964/@0x436a05), HGRenderer::GetDOD @Ozone 0x6dd36e (called at @0x43696f/@0x436a10), and HGRenderer vtable slot @+0x68 mask-parameter query @Ozone 0x436a98. Decoded structure documented in file-header comment; union math at @0x436b2a-@0x436b6b uses cmovll (min) + cmovgl (max) on clamped corners; early-outs return HGRectInfinite @0x436ade (|f0|>=1e-5) or HGRectNull @0x436ade fallthrough (|f1|<1e-5).",
  );
}

// -----------------------------------------------------------------------------
// HMaskCompAdd::~HMaskCompAdd() (D1) @Ozone 0x4368f0
//   @0x4368f0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
//   @0x4368f5  jmp   __ZN14HgcMaskCompAddD2Ev   ; HgcMaskCompAdd::~HgcMaskCompAdd()
// -----------------------------------------------------------------------------

/** HMaskCompAdd::~HMaskCompAdd() (D1) @Ozone 0x4368f0.
 *  Trivial forwarding dtor — tail-jmps to the base HgcMaskCompAdd::~HgcMaskCompAdd
 *  @0x4368f5, an undecoded frontier. */
export function HMaskCompAdd_dtor_D1(_self: HMaskCompAdd): void {
  throw new Error(
    "HMaskCompAdd::~HMaskCompAdd (D1) @Ozone 0x4368f0 not yet transcribed: tail-jmps to HgcMaskCompAdd::~HgcMaskCompAdd @Ozone 0x4368f5 which is an undecoded frontier symbol.",
  );
}

// -----------------------------------------------------------------------------
// HMaskCompAdd::~HMaskCompAdd() (D0) @Ozone 0x436900
//   @0x436900-@0x436906  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax ; movq %rdi,%rbx
//   @0x436909  callq __ZN14HgcMaskCompAddD2Ev   ; base dtor
//   @0x43690e  movq  %rbx, %rdi                  ; restore self
//   @0x436917  jmp   __ZN8HGObjectdlEPv          ; tail-jmp to HGObject::operator delete
// -----------------------------------------------------------------------------

/** HMaskCompAdd::~HMaskCompAdd() (D0) @Ozone 0x436900.
 *  Base dtor + operator delete. Kept as a citation stub because both callees
 *  (HgcMaskCompAdd::~HgcMaskCompAdd @0x436909 and HGObject::operator delete
 *  @0x436917) are undecoded frontier symbols. */
export function HMaskCompAdd_dtor_D0(_self: HMaskCompAdd): void {
  throw new Error(
    "HMaskCompAdd::~HMaskCompAdd (D0) @Ozone 0x436900 not yet transcribed: base dtor HgcMaskCompAdd::~HgcMaskCompAdd @Ozone 0x436909 and HGObject::operator delete @Ozone 0x436917 are undecoded frontier symbols.",
  );
}
