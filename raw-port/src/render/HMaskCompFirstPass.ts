// HMaskCompFirstPass.ts — Flexo HMaskCompFirstPass: DOD / ROI for the mask-comp
// "First Pass" node (a mask-composite passthrough that surfaces a rectangle
// stored on the instance at offset 0x1a0..0x1b0). Faithful transcription of
// the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// Source disassembly:  raw-port/re/disasm/Flexo.HMaskCompFirstPass.~HMaskCompFirstPass.s
//                      raw-port/re/disasm/Flexo.HMaskCompFirstPass.GetDOD.s
//                      raw-port/re/disasm/Flexo.HMaskCompFirstPass.GetROI.s
//
// Flexo symbols transcribed:
//   @0x601fe0  HMaskCompFirstPass::~HMaskCompFirstPass()   (D1 — tail-jmp to base dtor)
//   @0x601ff0  HMaskCompFirstPass::~HMaskCompFirstPass()   (D0 — base dtor + HGObject::operator delete)
//   @0x602010  HMaskCompFirstPass::GetDOD(HGRenderer*, int, HGRect)
//   @0x602070  HMaskCompFirstPass::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * ABI mapping for these virtuals (matches sibling HMaskComp* nodes):
//       %rdi = self (HMaskCompFirstPass*)
//       %rsi = HGRenderer* (unused by this fn; nothing reads it)
//       %edx = index ("which" in the signature-visible arg list)
//       %rcx = incoming HGRect.lo   (x1 | y1<<32)
//       %r8  = incoming HGRect.hi   (x2 | y2<<32)
//   * `HGRect` is a 16-byte struct stored as (x1, y1, x2, y2) int32 corners
//     packed into two qwords: lo = x1|y1<<32, hi = x2|y2<<32. This layout is
//     used by the sibling HMaskComp* classes and by _HGRectIsNull (see
//     raw-port/src/render/HMaskCompSubtract.ts for the fully-decoded evidence
//     at @Ozone 0x436be0).
//   * `self` stores an HGRect at offset 0x1a0..0x1b0. Evidence:
//       @0x602034  movq 0x1a0(%rdi), %rax     ; loads the low qword of a rect
//       @0x60203e  movq 0x1a8(%rdi), %rsi     ; loads the high qword of a rect
//       @0x602045  movq %rax, %rdi            ; passes them as an HGRect arg
//       @0x602048  callq _HGRectIsNull        ; predicate on that HGRect
//       @0x602051  movq 0x1a0(%r15), %rbx     ; reload lo for return
//       @0x602058  movq 0x1a8(%r15), %r14     ; reload hi for return
//   * `_HGRectNull` (Flexo data symbol) — literal-pool ref @0x60201e / @0x60207b.
//     Its exact bit pattern is defined in Flexo's data segment; we surface it
//     as a throwing frontier stub (matches HMaskCompSubtract policy).
//   * Called stubs (all Flexo imports; addresses are __stubs, per otool -tV
//     "symbol stub for:" comments):
//       0x149568e  _HGRectIsNull                                    HGRect predicate
//       0x1496d8c  __ZN8HGObjectdlEPv   HGObject::operator delete(void*)
//       (implicit) __ZN20HgcMaskCompFirstPassD2Ev
//         HgcMaskCompFirstPass::~HgcMaskCompFirstPass() — the base-class dtor,
//         called from both D1 (@0x601fe5 tail-jmp) and D0 (@0x601ff9 callq).
//
// Frontier callees / data (not-yet-transcribed):
//   - HGRectNull    (Flexo _HGRectNull data symbol)
//   - HGRectIsNull  (Flexo 0x149568e stub -> framework impl)
//   - HgcMaskCompFirstPass::~HgcMaskCompFirstPass()  (Flexo base dtor)
//   - HGObject::operator delete(void*)               (Flexo 0x1496d8c stub)

// ---------------------------------------------------------------------------
// Frontier types (undecoded C++ types surfaced as opaque handles).
// ---------------------------------------------------------------------------

// HGRect is the canonical Helium type — corner-form int32 {x, y, right, bottom}.
// See raw-port/src/render/HGRect.ts. The `_HGRectNull` symbol referenced by
// this file at 0x60201e / 0x60207b is the same 16-zero-bytes _HGRectNull
// decoded there (Helium and Flexo share the sentinel). The bit-layout note in
// the file header (rcx = x1|y1<<32, r8 = x2|y2<<32) is the SAME corner form —
// the old field names {x1,y1,x2,y2} map 1:1 to canonical {x,y,right,bottom}.
import { HGRect, HGRectNull as HGRectNullConst, HGRectIsNull as HGRectIsNullCanonical } from "./HGRect.js";
export { HGRect };

/** HGRenderer* — opaque handle. HMaskCompFirstPass::GetDOD / GetROI ignore it
 *  (no callq/mov via %rsi in either method). */
export interface HGRenderer {}

/** HgcMaskCompFirstPass — the Flexo base class of HMaskCompFirstPass; only
 *  its destructor is referenced from this file. */
export interface HgcMaskCompFirstPass {
  /** HgcMaskCompFirstPass::~HgcMaskCompFirstPass() @Flexo — base destructor
   *  called from HMaskCompFirstPass::~HMaskCompFirstPass() (D1 tail-jmp
   *  @0x601fe5, D0 callq @0x601ff9). Not yet transcribed. */
  __dtor_base(): void;
}

/** HMaskCompFirstPass — the class this file transcribes. It inherits from
 *  HgcMaskCompFirstPass and stores an HGRect at offset 0x1a0..0x1b0 (see
 *  @0x602034 / @0x60203e / @0x602051 / @0x602058 in the GetDOD disasm). */
export interface HMaskCompFirstPass extends HgcMaskCompFirstPass {
  /** Instance HGRect at offset 0x1a0..0x1b0. Populated by upstream code
   *  (not this class). GetDOD returns it (or the incoming rect when this
   *  rect isNull). */
  readonly rect_at_0x1a0: HGRect;
}

// ---------------------------------------------------------------------------
// _HGRectNull   — Flexo data symbol (see literal-pool ref @0x60201e / @0x60207b).
// ---------------------------------------------------------------------------

/** _HGRectNull — Flexo's "null rectangle" sentinel. Read at 0x60201e/0x60207b
 *  as two qwords (rax=lo, r14/r8=hi). Delegates to the canonical Helium
 *  HGRectNull decoded in HGRect.ts (same _HGRectNull data symbol across
 *  Flexo/Helium/Ozone). */
export function HGRectNull(): HGRect {
  // @Flexo _HGRectNull (data symbol; RIP-loaded at 0x60201e / 0x60207b)
  //   -> canonical Helium _HGRectNull @0x3d2284 = {0,0,0,0}.
  return HGRectNullConst;
}

/** _HGRectIsNull(HGRect) — predicate for the null-sentinel returned by Flexo
 *  APIs. Delegates to the canonical Helium HGRectIsNull decoded in HGRect.ts
 *  (Helium _HGRectIsNull @0x107b20: `r.right <= r.x || r.bottom <= r.y`). The
 *  Flexo call site @0x149568e is a symbol stub for the same predicate. */
export function HGRectIsNull(r: HGRect): boolean {
  // @Flexo 0x149568e -> canonical Helium _HGRectIsNull @0x107b20.
  return HGRectIsNullCanonical(r);
}

// ---------------------------------------------------------------------------
// HMaskCompFirstPass::~HMaskCompFirstPass()  D1 @Flexo 0x601fe0
//   Faithful to raw-port/re/disasm/Flexo.HMaskCompFirstPass.~HMaskCompFirstPass.s
//   (D0 body is dumped there; the D1 body @0x601fe0 immediately precedes it in
//   /tmp/Flexo_tV.txt):
//     @0x601fe0  pushq %rbp ; movq %rsp, %rbp ; popq %rbp
//     @0x601fe5  jmp    __ZN20HgcMaskCompFirstPassD2Ev   (tail-call base dtor)
//   Pure tail-call to the base destructor; no `operator delete`.
// ---------------------------------------------------------------------------

/** HMaskCompFirstPass::~HMaskCompFirstPass() (D1) @Flexo 0x601fe0.
 *  Tail-jumps to HgcMaskCompFirstPass::~HgcMaskCompFirstPass(). */
export function HMaskCompFirstPass_dtor_D1(self: HMaskCompFirstPass): void {
  // @0x601fe5 jmp __ZN20HgcMaskCompFirstPassD2Ev
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// HMaskCompFirstPass::~HMaskCompFirstPass()  D0 @Flexo 0x601ff0
//   Faithful to raw-port/re/disasm/Flexo.HMaskCompFirstPass.~HMaskCompFirstPass.s:
//     @0x601ff6  movq %rdi, %rbx
//     @0x601ff9  callq __ZN20HgcMaskCompFirstPassD2Ev   (base dtor)
//     @0x601ffe  movq %rbx, %rdi
//     @0x602007  jmp   0x1496d8c   (tail-call HGObject::operator delete(void*))
// ---------------------------------------------------------------------------

/** HMaskCompFirstPass::~HMaskCompFirstPass() (D0) @Flexo 0x601ff0.
 *  Calls the base HgcMaskCompFirstPass destructor, then tail-calls
 *  HGObject::operator delete(void*) on the object pointer. In TS we don't
 *  manage raw memory; we surface the base-dtor call so callers can chain
 *  cleanup. */
export function HMaskCompFirstPass_dtor_D0(self: HMaskCompFirstPass): void {
  // @0x601ff9 callq __ZN20HgcMaskCompFirstPassD2Ev
  self.__dtor_base();
  // @0x602007 jmp 0x1496d8c   - HGObject::operator delete(void*).
  // In TypeScript there is no manual free; the JS GC handles it. Documented
  // for parity with the disassembly.
}

// ---------------------------------------------------------------------------
// HMaskCompFirstPass::GetDOD(HGRenderer*, int, HGRect) @Flexo 0x602010
//   Signature (ABI): %rdi=self, %rsi=renderer(unused), %edx=which,
//                    %rcx=inRect.lo, %r8=inRect.hi.
//
//   @0x60201a  testl %edx, %edx
//   @0x60201c  jle   0x60202e            ; if (which <= 0) go to stored-rect path
//   @0x60201e  movq  _HGRectNull(%rip), %rax
//   @0x602025  movq  (%rax), %rbx        ; rbx = HGRectNull.lo
//   @0x602028  movq  0x8(%rax), %r14     ; r14 = HGRectNull.hi
//   @0x60202c  jmp   0x60205f            ; return HGRectNull
//   ---
//   @0x60202e  movq %r8,  %r14           ; preserve incoming inRect.hi
//   @0x602031  movq %rcx, %rbx           ; preserve incoming inRect.lo
//   @0x602034  movq 0x1a0(%rdi), %rax    ; rax = self.rect.lo
//   @0x60203b  movq %rdi, %r15           ; r15 = self
//   @0x60203e  movq 0x1a8(%rdi), %rsi    ; rsi = self.rect.hi
//   @0x602045  movq %rax, %rdi           ; rdi = self.rect.lo   (args for HGRectIsNull)
//   @0x602048  callq _HGRectIsNull       ; eax = HGRectIsNull(self.rect)
//   @0x60204d  testl %eax, %eax
//   @0x60204f  jne   0x60205f            ; if isNull, jump to return with (rbx,r14) held from
//                                          @0x602031/@0x60202e -- i.e. return the INCOMING
//                                          rect argument.
//   @0x602051  movq 0x1a0(%r15), %rbx    ; else rbx = self.rect.lo
//   @0x602058  movq 0x1a8(%r15), %r14    ; and r14 = self.rect.hi
//   @0x60205f  movq %rbx, %rax           ; return low  qword
//   @0x602062  movq %r14, %rdx           ; return high qword
//   @0x60206f  retq
//
//   In plain English:
//     if (which > 0)                       return HGRectNull;
//     if (HGRectIsNull(self.rect_0x1a0))   return incoming rect argument;
//     else                                 return self.rect_0x1a0;
// ---------------------------------------------------------------------------

/** HMaskCompFirstPass::GetDOD(renderer, which, rect) @Flexo 0x602010.
 *  Returns the instance rect stored at self[0x1a0..0x1b0] when `which <= 0`
 *  and that rect is non-null; the incoming rect argument when `which <= 0`
 *  but self's stored rect isNull; and HGRectNull otherwise. */
export function HMaskCompFirstPass_GetDOD(
  self: HMaskCompFirstPass,
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x60201a testl %edx, %edx ; @0x60201c jle 0x60202e
  //   "jle" is signed <=0: fall-through (which > 0) returns HGRectNull;
  //    the (which <= 0) branch does the isNull check on self.rect_0x1a0.
  if (which > 0) {
    // @0x60201e-@0x60202c: load _HGRectNull, return it (via 0x60205f).
    return HGRectNull();
  }
  // @0x602034/@0x60203e read the HGRect at self[0x1a0..0x1b0]...
  const stored = self.rect_at_0x1a0;
  // @0x602048 callq _HGRectIsNull(stored)
  if (HGRectIsNull(stored)) {
    // @0x60204f jne 0x60205f - return (rbx,r14) which hold the INCOMING rect
    // from @0x602031/@0x60202e (rbx=%rcx=inRect.lo, r14=%r8=inRect.hi).
    return rect;
  }
  // @0x602051/@0x602058 reload rbx,r14 from self.rect_0x1a0 and fall to return.
  return stored;
}

// ---------------------------------------------------------------------------
// HMaskCompFirstPass::GetROI(HGRenderer*, int, HGRect) @Flexo 0x602070
//   @0x602070  movq %rcx, %rax            ; rax = inRect.lo (default return.lo)
//   @0x602073  testl %edx, %edx
//   @0x602075  jle   0x60208a             ; if (which <= 0) return incoming rect
//   @0x602077  pushq %rbp ; movq %rsp, %rbp
//   @0x60207b  movq  _HGRectNull(%rip), %rcx
//   @0x602082  movq  (%rcx), %rax         ; rax = HGRectNull.lo
//   @0x602085  movq  0x8(%rcx), %r8       ; r8  = HGRectNull.hi
//   @0x602089  popq  %rbp
//   @0x60208a  movq  %r8, %rdx            ; return.hi = r8
//   @0x60208d  retq
//
//   In plain English:
//     if (which > 0)  return HGRectNull;
//     else            return the incoming rect argument unchanged.
// ---------------------------------------------------------------------------

/** HMaskCompFirstPass::GetROI(renderer, which, rect) @Flexo 0x602070.
 *  For `which <= 0`, ROI equals the passed-in rect. For `which > 0`, ROI is
 *  the null rect. `renderer` is passed but unused. */
export function HMaskCompFirstPass_GetROI(
  _renderer: HGRenderer,
  which: number,
  rect: HGRect,
): HGRect {
  // @0x602073 testl %edx, %edx ; @0x602075 jle 0x60208a
  if (which > 0) {
    // @0x60207b-@0x602085: load _HGRectNull as return value.
    return HGRectNull();
  }
  // @0x60208a movq %r8, %rdx ; @0x60208d retq - return the incoming rect.
  return rect;
}
