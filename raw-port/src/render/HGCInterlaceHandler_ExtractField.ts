// HGCInterlaceHandler_ExtractField.ts — Helium
// HGCInterlaceHandler_ExtractField: DOD / ROI virtuals for the "extract field"
// interlace handler. This is a two-vfn node whose entire job is to map between
// full-height and half-height rects on the Y axis: GetDOD halves the y/bottom
// coordinates (interlaced full-frame -> single-field domain-of-definition),
// GetROI doubles them (single-field ROI -> full-frame region-of-interest).
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_ExtractField.GetDOD.s
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_ExtractField.GetROI.s
//   raw-port/re/disasm/Helium.HGCInterlaceHandler_ExtractField.~HGCInterlaceHandler_ExtractField.s
//
// Helium symbols transcribed:
//   @0x093340  HGCInterlaceHandler_ExtractField::~HGCInterlaceHandler_ExtractField()  (D0 — base dtor + HGObject::operator delete)
//   @0x093360  HGCInterlaceHandler_ExtractField::GetDOD(HGRenderer*, int, HGRect)
//   @0x0933c0  HGCInterlaceHandler_ExtractField::GetROI(HGRenderer*, int, HGRect)
//
// (The D1 dtor at 0x093330 is a 16-byte pad in the same VA range; its body was
// ICF-folded so disasm.sh returns 0 lines for that symbol. GetDOD/GetROI + the
// D0 wrapper carry the full class behaviour, and D1 conventionally tail-jmps
// to the same base HgcInterlaceHandler_ExtractField D2 dtor that D0 calls at
// @0x093349 below — we surface D1 only via the D0 wrapper's callee citation.)
//
// DECODE evidence:
//   * ABI mapping for these virtuals (matches sibling handler classes):
//       %rdi = self (HGCInterlaceHandler_ExtractField*)   — unused by these two fns
//       %rsi = HGRenderer*                                — unused
//       %edx = index ("which"; only tested for ==0 vs !=0)
//       %rcx = incoming HGRect.lo   (x | y<<32)
//       %r8  = incoming HGRect.hi   (right | bottom<<32)
//     The return value is 16 bytes in (rax, rdx), rax=lo, rdx=hi — the same
//     packed HGRect return convention used by HMaskCompFirstPass::GetDOD/GetROI
//     (see raw-port/src/render/HMaskCompFirstPass.ts) and HGRectMake4i
//     (see raw-port/src/render/HGRect.ts @0x107710).
//
//   * `HGRect` corner layout: {x:i32, y:i32, right:i32, bottom:i32}. The
//     halve-Y / double-Y operations only touch the two Y-axis int32 fields
//     (offsets +0x04 and +0x0c in the packed HGRect). See:
//       @0x09338f  movl -0xc(%rbp), %eax   ; load rect.y
//       @0x093392  movl -0x4(%rbp), %ecx   ; load rect.bottom
//         (Note the frame layout: local rect is at -0x10(%rbp), so
//          -0x10=x, -0xc=y, -0x8=right, -0x4=bottom. Y-fields are the ones
//          rewritten; X-fields are untouched.)
//
//   * Called stubs / data (all Helium, addresses are __stubs / literal-pool
//     refs, per otool -tV "symbol stub for:" / RIP-relative loads):
//       @0x093368  _HGRectNull                              literal-pool load
//                                                          (Helium data symbol
//                                                           — same 16 zero bytes
//                                                           as raw-port/src/
//                                                           render/HGRect.ts
//                                                           HGRectNull @0x3d2284)
//       @0x093386  __ZNK6HGRect10IsInfiniteEv               HGRect::IsInfinite()
//                                                          const — implemented
//                                                          as HGRectIsInfinite
//                                                          in HGRect.ts
//                                                          @0x107ae0
//       @0x093349  __ZN32HgcInterlaceHandler_ExtractFieldD2Ev
//                                                          base-class dtor
//                                                          (frontier — cited in
//                                                          the D0 stub below)
//       @0x093357  __ZN8HGObjectdlEPv                        HGObject::operator
//                                                          delete(void*) —
//                                                          frontier stub
//                                                          (see HGObject_stub.ts)
//
// Frontier callees / classes (not-yet-transcribed):
//   - HgcInterlaceHandler_ExtractField (base class, ~D2 @0x093349)
//   - HGRenderer (opaque handle — unused by these fns)
//
// -----------------------------------------------------------------------------

import { HGRect, HGRectNull, HGRectIsInfinite } from "./HGRect";

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGRenderer* — opaque handle. HGCInterlaceHandler_ExtractField::GetDOD /
 *  GetROI never dereference it (nothing reads %rsi after entry — the
 *  disassembly touches only %rdi/self, %edx/which, and %rcx/%r8/rect). */
export type HGRenderer = { readonly __brand: "HGRenderer" };

/** HGCInterlaceHandler_ExtractField instance handle. GetDOD/GetROI never
 *  read any field of `self` — the disassembly touches %rdi only to keep it
 *  as the ABI-first arg, which the frame then overwrites when it stores the
 *  incoming HGRect into -0x10(%rbp) via %rcx/%r8. So we surface `self` as an
 *  opaque handle here to preserve the C++ method signature without inventing
 *  any struct fields. */
export type HGCInterlaceHandler_ExtractField = {
  readonly __brand: "HGCInterlaceHandler_ExtractField";
};

// -----------------------------------------------------------------------------
// HGCInterlaceHandler_ExtractField::GetDOD(HGRenderer*, int, HGRect) @Helium 0x093360
//   @0x093360  pushq %rbp ; movq %rsp, %rbp ; subq $0x10, %rsp
//   @0x093368  leaq _HGRectNull(%rip), %rax
//   @0x09336f  movups (%rax), %xmm0
//   @0x093372  movaps %xmm0, -0x10(%rbp)    ; local = HGRectNull
//   @0x093376  testl %edx, %edx             ; which
//   @0x093378  jne   0x933ad                ; if (which != 0) -> return HGRectNull
//   @0x09337a  movq  %rcx, -0x10(%rbp)      ; local.lo = incoming.lo
//   @0x09337e  movq  %r8,  -0x8(%rbp)       ; local.hi = incoming.hi
//   @0x093382  leaq  -0x10(%rbp), %rdi
//   @0x093386  callq __ZNK6HGRect10IsInfiniteEv   ; HGRect::IsInfinite(local)
//   @0x09338b  testb %al, %al
//   @0x09338d  jne   0x933ad                ; if (IsInfinite) -> return local unchanged (= incoming)
//   @0x09338f  movl  -0xc(%rbp), %eax       ; eax = local.y  (int32)
//   @0x093392  movl  -0x4(%rbp), %ecx       ; ecx = local.bottom (int32)
//   @0x093395  movl  %eax, %edx
//   @0x093397  shrl  $0x1f, %edx            ; edx = (uint32)y >> 31 == sign bit
//   @0x09339a  addl  %eax, %edx             ; edx = y + (y>>>31)  (round-toward-zero bias)
//   @0x09339c  sarl  %edx                   ; edx = (y + (y>>>31)) >> 1  == y/2 (round toward 0)
//   @0x09339e  movl  %edx, -0xc(%rbp)       ; local.y = y/2
//   @0x0933a1  movl  %ecx, %eax
//   @0x0933a3  shrl  $0x1f, %eax            ; same round-toward-zero divide
//   @0x0933a6  addl  %ecx, %eax
//   @0x0933a8  sarl  %eax                   ; eax = bottom/2 (round toward 0)
//   @0x0933aa  movl  %eax, -0x4(%rbp)       ; local.bottom = bottom/2
//   @0x0933ad  movq  -0x10(%rbp), %rax      ; return.lo = local.lo
//   @0x0933b1  movq  -0x8(%rbp), %rdx       ; return.hi = local.hi
//   @0x0933b5  addq $0x10, %rsp ; popq %rbp ; retq
//
//   In plain English:
//     if (which != 0)                     return HGRectNull;
//     if (HGRectIsInfinite(rect))         return rect;                       // unchanged
//     else return { x: rect.x, y: rect.y/2, right: rect.right, bottom: rect.bottom/2 };
//                                          (division rounds toward zero, matches sarl-of-signed)
// -----------------------------------------------------------------------------

/** Round-toward-zero signed 32-bit halve. Matches the
 *  `edx = y >>> 31 ; edx += y ; edx = (int32)edx >> 1` idiom at
 *  @0x093397-@0x09339c (and @0x0933a3-@0x0933a8 for `bottom`). For a positive
 *  y this is (y >> 1); for a negative y this is ((y+1) >> 1) which rounds
 *  toward zero — the C `y/2` behaviour for int32. */
function half_rtz_i32(v: number): number {
  const y = v | 0;
  // edx = (uint32)y >>> 31  (sign bit)
  const sign = (y >>> 31) | 0;
  // edx = y + sign
  const biased = (y + sign) | 0;
  // sarl -> arithmetic shift right by 1
  return biased >> 1;
}

/** HGCInterlaceHandler_ExtractField::GetDOD(renderer, which, rect) @Helium 0x093360.
 *  Halves the Y axis of the incoming rect (rounding toward zero) when
 *  `which == 0` and the rect is finite. `which != 0` returns HGRectNull;
 *  an infinite input rect passes through unchanged. `renderer` and `self`
 *  are unused. */
export function HGCInterlaceHandler_ExtractField_GetDOD(
  _self: HGCInterlaceHandler_ExtractField,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x093376 testl %edx, %edx ; @0x093378 jne 0x933ad
  //   Any non-zero which returns HGRectNull unchanged from the frame init.
  if ((which | 0) !== 0) {
    // Frame local was seeded from _HGRectNull at @0x093368-@0x093372 and
    // never rewritten on this path.
    return HGRectNull;
  }
  // @0x09337a-@0x09337e local = incoming rect (both qwords).
  // @0x093386 callq HGRect::IsInfinite(local).
  if (HGRectIsInfinite(rect)) {
    // @0x09338d jne 0x933ad — skip the halving; local (= incoming rect) is
    // returned unmodified.
    return rect;
  }
  // @0x09338f-@0x0933aa: rewrite local.y and local.bottom via the
  // round-toward-zero halve idiom; local.x and local.right are untouched.
  const y2      = half_rtz_i32(rect.y | 0);
  const bottom2 = half_rtz_i32(rect.bottom | 0);
  return { x: rect.x | 0, y: y2, right: rect.right | 0, bottom: bottom2 };
}

// -----------------------------------------------------------------------------
// HGCInterlaceHandler_ExtractField::GetROI(HGRenderer*, int, HGRect) @Helium 0x0933c0
//   @0x0933c0  pushq %rbp ; movq %rsp, %rbp ; subq $0x10, %rsp
//   @0x0933c8  leaq _HGRectNull(%rip), %rax
//   @0x0933cf  movups (%rax), %xmm0
//   @0x0933d2  movaps %xmm0, -0x10(%rbp)    ; local = HGRectNull
//   @0x0933d6  testl %edx, %edx
//   @0x0933d8  jne   0x933f5                ; if (which != 0) -> return HGRectNull
//   @0x0933da  movq  %rcx, -0x10(%rbp)      ; local.lo = incoming.lo
//   @0x0933de  movq  %r8,  -0x8(%rbp)       ; local.hi = incoming.hi
//   @0x0933e2  leaq  -0x10(%rbp), %rdi
//   @0x0933e6  callq __ZNK6HGRect10IsInfiniteEv   ; HGRect::IsInfinite(local)
//   @0x0933eb  testb %al, %al
//   @0x0933ed  jne   0x933f5                ; if (IsInfinite) -> return local unchanged
//   @0x0933ef  shll  -0xc(%rbp)             ; local.y      <<= 1  (signed doubling with wrap)
//   @0x0933f2  shll  -0x4(%rbp)             ; local.bottom <<= 1
//   @0x0933f5  movq  -0x10(%rbp), %rax
//   @0x0933f9  movq  -0x8(%rbp), %rdx
//   @0x0933fd  addq $0x10, %rsp ; popq %rbp ; retq
//
//   In plain English:
//     if (which != 0)                     return HGRectNull;
//     if (HGRectIsInfinite(rect))         return rect;
//     else return { x: rect.x, y: rect.y<<1, right: rect.right, bottom: rect.bottom<<1 };
//                                          (signed <<1 wraps on overflow — matches shll)
// -----------------------------------------------------------------------------

/** HGCInterlaceHandler_ExtractField::GetROI(renderer, which, rect) @Helium 0x0933c0.
 *  Doubles the Y axis of the incoming rect (signed left-shift-by-1, which
 *  wraps on int32 overflow) when `which == 0` and the rect is finite.
 *  `which != 0` returns HGRectNull; an infinite input rect passes through
 *  unchanged. `renderer` and `self` are unused. */
export function HGCInterlaceHandler_ExtractField_GetROI(
  _self: HGCInterlaceHandler_ExtractField,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x0933d6 testl %edx, %edx ; @0x0933d8 jne 0x933f5
  if ((which | 0) !== 0) {
    return HGRectNull;
  }
  // @0x0933da-@0x0933de local = incoming rect.
  // @0x0933e6 callq HGRect::IsInfinite(local).
  if (HGRectIsInfinite(rect)) {
    // @0x0933ed jne 0x933f5 — skip the doubling.
    return rect;
  }
  // @0x0933ef shll -0xc(%rbp)  ; y      <<= 1
  // @0x0933f2 shll -0x4(%rbp)  ; bottom <<= 1
  //   `shll` on a 32-bit slot is `(v << 1) | 0` in JS — the `| 0` re-narrows
  //   to signed int32, matching the on-stack int32 write plus the eventual
  //   int32 reload at @0x0933f5.
  const y2      = ((rect.y      | 0) << 1) | 0;
  const bottom2 = ((rect.bottom | 0) << 1) | 0;
  return { x: rect.x | 0, y: y2, right: rect.right | 0, bottom: bottom2 };
}

// -----------------------------------------------------------------------------
// HGCInterlaceHandler_ExtractField::~HGCInterlaceHandler_ExtractField() (D0) @Helium 0x093340
//   @0x093340  pushq %rbp ; movq %rsp, %rbp
//   @0x093344  pushq %rbx ; pushq %rax
//   @0x093346  movq  %rdi, %rbx                                ; save self
//   @0x093349  callq __ZN32HgcInterlaceHandler_ExtractFieldD2Ev ; base dtor
//   @0x09334e  movq  %rbx, %rdi                                ; restore self
//   @0x093351  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
//   @0x093357  jmp   __ZN8HGObjectdlEPv                        ; tail-jmp to
//                                                                HGObject::
//                                                                operator delete(void*)
//
// In plain English: run the base-class destructor on `self`, then hand `self`
// off to HGObject::operator delete. Both callees are undecoded frontier
// symbols; we surface this dtor as a throwing stub that cites its address
// and both callees rather than fabricate a delete-path.
// -----------------------------------------------------------------------------

/** HGCInterlaceHandler_ExtractField::~HGCInterlaceHandler_ExtractField() (D0) @Helium 0x093340.
 *  The deleting-destructor wrapper: base dtor + operator delete. Kept as a
 *  throwing stub because both callees are undecoded frontier symbols
 *  (`HgcInterlaceHandler_ExtractField::~HgcInterlaceHandler_ExtractField()` @0x093349
 *  and `HGObject::operator delete(void*)` @0x093357). */
export function HGCInterlaceHandler_ExtractField_dtor_D0(
  _self: HGCInterlaceHandler_ExtractField,
): void {
  throw new Error(
    "HGCInterlaceHandler_ExtractField::~HGCInterlaceHandler_ExtractField (D0) @Helium 0x093340 not yet transcribed: base dtor HgcInterlaceHandler_ExtractField::~HgcInterlaceHandler_ExtractField @0x093349 and HGObject::operator delete(void*) @0x093357 are undecoded frontier symbols.",
  );
}
