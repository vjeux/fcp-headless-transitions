// HMaskCompSubtract.ts — Ozone HMaskCompSubtract: DOD / ROI for the mask-comp
// "Subtract" operator. Faithful transcription from the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Source disassembly:  raw-port/re/disasm/HMaskCompSubtract.GetDOD.s
//                      raw-port/re/disasm/HMaskCompSubtract.GetROI.s
//                      raw-port/re/disasm/HMaskCompSubtract.~HMaskCompSubtract.s
//
// Ozone symbols transcribed:
//   @0x436bc0  HMaskCompSubtract::~HMaskCompSubtract()  (D0/D1 both point here)
//   @0x436be0  HMaskCompSubtract::GetDOD(HGRenderer*, int, HGRect)
//   @0x436e30  HMaskCompSubtract::GetROI(HGRenderer*, int, HGRect)
//
// DECODE evidence:
//   * `HGRect` layout is (x1, y1, x2, y2) as two packed qwords: rax = x1|y1<<32,
//     rdx = x2|y2<<32. This is deduced from HMaskCompSubtract::GetDOD's clamp
//     pattern (0x436c6b/0x436c82: first pair clamped to a NEGATIVE lower
//     bound 0xC0000001; 0x436c8b/0x436ca4: second pair clamped to a POSITIVE
//     upper bound 0x3FFFFFFE) and from the final HGRectMake4i call at 0x436d8e
//     receiving (x1, y1, x2, y2) exactly (see 0x436d7f-0x436d8e).
//   * HGRect coordinate clamp bounds are read directly from the disasm:
//        MIN_COORD_CMP  = 0xC0000002 (signed -1073741822)  @0x436c6b, 0x436c82, 0x436cfb, 0x436d15
//        MIN_COORD_SAT  = 0xC0000001 (signed -1073741823)  @0x436c71, 0x436c76, 0x436d02, 0x436d07
//        MAX_COORD_CMP  = 0x3FFFFFFE (signed  1073741822)  @0x436c8b, 0x436ca4, 0x436d20, 0x436d38
//        MAX_COORD_SAT  = 0x3FFFFFFE (signed  1073741822)  @0x436c92, 0x436c97, 0x436d26, 0x436d2c
//        The clamp is: v_out = (v >= 0xC0000002 ? v : 0xC0000001) for lo corners,
//                      v_out = (v <  0x3FFFFFFE ? v : 0x3FFFFFFE) for hi corners.
//   * Threshold constant compared against |amount|:
//        @0x707BE0 (const, float32) = 0x3727C5AC = 1e-5f  (see resolve.py const)
//     used at 0x436d6c `movss 0x2d0e6c(%rip), %xmm1` and 0x436d74 `ucomiss xmm0, xmm1`.
//   * Sign-mask constant used to fabs a float:
//        @0x707BC0 (const, packed) = 0x7FFFFFFF_7FFFFFFF ... = single-precision fabs mask
//     used at 0x436d65 `andps 0x2d0e54(%rip), %xmm0`.
//   * Vtable slot *0x68 on rax (loaded from *r15 at 0x436d4e) is
//        HgcMaskCompSubtract::GetParameter(int index, float* out)  @Ozone 0x6a9880
//     (see vtable.py Ozone HgcMaskCompSubtract). Called with esi=1, rdx=&out.
//   * Called stubs (all Ozone imports):
//        __ZN10HGRenderer8GetInputEP6HGNodei     @0x6dd37a  HGRenderer::GetInput(HGNode*, int)
//        __ZN10HGRenderer6GetDODEP6HGNode        @0x6dd36e  HGRenderer::GetDOD(HGNode*)
//        _HGRectIsNull                           @0x6dcc9c
//        _HGRectMake4i                           @0x6dcca8  (takes 4 ints, returns HGRect)
//        _HGRectNull  (data)                     literal-pool ref @0x436c03 / @0x436e3c
//        __ZN19HgcMaskCompSubtractD2Ev           HgcMaskCompSubtract base dtor @0x6a96...
//        __ZN8HGObjectdlEPv                      HGObject::operator delete(void*) stub @0x6def6a

// ---------------------------------------------------------------------------
// Frontier types (undecoded C++ types surfaced as opaque handles).
// ---------------------------------------------------------------------------

/** HGRect — Ozone's rectangle type, stored as (x1, y1, x2, y2) int32 corners
 *  packed into two qwords. Source: layout deduced from GetDOD clamp pattern
 *  and HGRectMake4i arg passing (see file header). */
export interface HGRect {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** HGRenderer* — opaque; only the two methods below are used from this file. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) @Ozone 0x6dd37a — returns the input
   *  node bound at slot `index` on `node`. Not yet transcribed. */
  GetInput(node: HGNode, index: number): HGNode;
  /** HGRenderer::GetDOD(HGNode*) @Ozone 0x6dd36e — Domain-Of-Definition of
   *  the given node's output. Not yet transcribed. */
  GetDOD(node: HGNode): HGRect;
  /** Vtable slot *0x0 through *0x68 of this HMaskCompSubtract's Hgc base.
   *  Slot *0x68 = HgcMaskCompSubtract::GetParameter(int, float*) @0x6a9880.
   *  The parameter object is `this` (r15); we surface it as a callback the
   *  caller supplies so we don't have to instantiate the full HgcMaskComp*
   *  hierarchy here. Not yet transcribed. */
  // (No direct method — vtable dispatch happens via HGNodeVTable below.)
}

/** HGNode* — opaque handle. Not yet transcribed. */
export interface HGNode {}

/** The vtable of an HGNode (of which HMaskCompSubtract is a subclass, through
 *  its HgcMaskCompSubtract base). Only slot *0x68 (GetParameter) is used
 *  from GetDOD; the full vtable is documented in raw-port/re/disasm and by
 *  `python3 raw-port/army/tools/vtable.py Ozone HgcMaskCompSubtract`. */
export interface HGNodeVTable {
  /** *0x68 — HgcMaskCompSubtract::GetParameter(int index, float* out)
   *  @Ozone 0x6a9880. `index=1` in HMaskCompSubtract::GetDOD reads the
   *  "amount" scalar. Writes to `out[0]`. Return value in %eax is ignored
   *  by the caller (0x436d5d). Not yet transcribed here. */
  slot_0x68_GetParameter(self: HMaskCompSubtract, index: number, out: Float32Array): void;
}

/** HgcMaskCompSubtract — Ozone base class of HMaskCompSubtract. Only its
 *  vtable (via `vtable`) and its destructor are referenced from this file. */
export interface HgcMaskCompSubtract {
  readonly vtable: HGNodeVTable;
  /** HgcMaskCompSubtract::~HgcMaskCompSubtract() @Ozone 0x6a96... — base
   *  destructor called from HMaskCompSubtract::~HMaskCompSubtract() at
   *  0x436bc9. Not yet transcribed. */
  __dtor_base(): void;
}

/** HMaskCompSubtract — the class this file transcribes. It inherits from
 *  HgcMaskCompSubtract; DOD/ROI are the only methods overridden here. */
export interface HMaskCompSubtract extends HgcMaskCompSubtract {}

// ---------------------------------------------------------------------------
// _HGRectNull   — Ozone data symbol (see literal-pool ref @0x436c03).
// ---------------------------------------------------------------------------

/** _HGRectNull — Ozone's "null rectangle" sentinel. Read at 0x436c03/0x436e3c
 *  as two qwords (rax=lo, r8/rdx=hi). Its exact bit pattern is defined in
 *  Ozone's data segment; a fully faithful port must read those 16 bytes at
 *  runtime. Documented as an undecoded frontier data symbol. */
export function HGRectNull(): HGRect {
  // @Ozone _HGRectNull data symbol — value not yet transcribed.
  throw new Error("HGRectNull @Ozone _HGRectNull (data symbol referenced at 0x436c03 / 0x436e3c) not yet transcribed");
}

/** _HGRectIsNull(HGRect) — stub for the imported predicate @Ozone 0x6dcc9c.
 *  Not yet transcribed (leaf helper — needs the HGRectNull bit pattern to
 *  compare against). */
export function HGRectIsNull(_r: HGRect): boolean {
  throw new Error("HGRectIsNull @Ozone 0x6dcc9c not yet transcribed");
}

/** _HGRectMake4i(x1, y1, x2, y2) — stub for the imported constructor
 *  @Ozone 0x6dcca8. This file's HMaskCompSubtract::GetDOD passes (x1, y1,
 *  x2, y2) exactly (see 0x436d7f-0x436d8e), i.e. corners rather than
 *  (x, y, w, h). Not yet transcribed. */
export function HGRectMake4i(x1: number, y1: number, x2: number, y2: number): HGRect {
  // @Ozone 0x6dcca8 — the storage form of an HGRect. Deferred.
  // We keep the transcription faithful by NOT synthesizing a struct here,
  // and forcing whoever ports 0x6dcca8 to decide the (x1,y1,x2,y2) vs
  // (x,y,w,h) representation once, in one place.
  void x1; void y1; void x2; void y2;
  throw new Error("HGRectMake4i @Ozone 0x6dcca8 not yet transcribed (called from HMaskCompSubtract::GetDOD @0x436d8e)");
}

// ---------------------------------------------------------------------------
// HMaskCompSubtract::~HMaskCompSubtract() @Ozone 0x436bc0
//   Faithful to raw-port/re/disasm/HMaskCompSubtract.~HMaskCompSubtract.s:
//     0x436bc9  callq  HgcMaskCompSubtract::~HgcMaskCompSubtract()
//     0x436bd7  jmp    HGObject::operator delete(void*)      (tail-call)
//   D0Ev and D1Ev both alias this address (per /tmp/Ozone_symmap.tsv).
// ---------------------------------------------------------------------------

/** HMaskCompSubtract::~HMaskCompSubtract() @Ozone 0x436bc0.
 *  Calls the base HgcMaskCompSubtract destructor then tail-calls
 *  HGObject::operator delete on the object pointer. In TS we don't manage
 *  raw memory; we surface the base-dtor call so callers can chain cleanup. */
export function HMaskCompSubtract_dtor(self: HMaskCompSubtract): void {
  // @0x436bc9 callq __ZN19HgcMaskCompSubtractD2Ev
  self.__dtor_base();
  // @0x436bd7 jmp __ZN8HGObjectdlEPv  — HGObject::operator delete(void*).
  // In TypeScript there is no manual free; the JS GC handles it. Documented
  // for parity with the disassembly.
}

// ---------------------------------------------------------------------------
// HMaskCompSubtract::GetROI(HGRenderer*, int, HGRect) @Ozone 0x436e30
//   Faithful to raw-port/re/disasm/HMaskCompSubtract.GetROI.s:
//     if (edx < 2) return the incoming HGRect argument (rcx, r8).
//     else         return _HGRectNull.
//   The incoming HGRect is passed in %rcx (low qword = x1|y1<<32) and %r8
//   (high qword = x2|y2<<32); the fn just moves them to (%rax, %rdx).
//   Documented at 0x436e33 `cmpl $0x2, %edx` and 0x436e36 `jl 0x436e4b`.
// ---------------------------------------------------------------------------

/** HMaskCompSubtract::GetROI(renderer, index, rect) @Ozone 0x436e30.
 *  For `index < 2`, ROI equals the passed-in rect. For `index >= 2`, ROI
 *  is the null rect. `renderer` is passed but unused (only rdi holds it). */
export function HMaskCompSubtract_GetROI(
  _renderer: HGRenderer,
  index: number,
  rect: HGRect,
): HGRect {
  // @0x436e33 cmpl $0x2, %edx ; @0x436e36 jl 0x436e4b
  if (index >= 2) {
    // @0x436e3c movq _HGRectNull(%rip), %rcx ; @0x436e43 movq (%rcx), %rax ; @0x436e46 movq 0x8(%rcx), %r8
    return HGRectNull();
  }
  // @0x436e4b movq %r8, %rdx ; @0x436e4e retq   — return the incoming rect.
  return rect;
}

// ---------------------------------------------------------------------------
// HMaskCompSubtract::GetDOD(HGRenderer*, int, HGRect) @Ozone 0x436be0
//
// Signature: %rdi=renderer(HGRenderer*), %rsi=self(HMaskCompSubtract*),
//            %edx=which(int), %rcx=rect.lo(x1|y1<<32), %r8=rect.hi(x2|y2<<32).
// The `rect` argument (rcx, r8) is present in the ABI but NEVER read by this
// method — nothing in 0x436be0-0x436db1 references either register before the
// vtable call, and the vtable call takes rdi/esi/rdx only.
//
// Algorithm (faithful to the assembly):
//   1. @0x436bff testl %edx, %edx ; je 0x436c16 — if `which != 0`, return _HGRectNull.
//   2. Fetch input0 = renderer.GetInput(self, 0)     @0x436c2b
//      dod0 = renderer.GetDOD(input0)                @0x436c36
//      Test HGRectIsNull(dod0)                       @0x436c47
//      Pre-load defaults edi=esi=-1 edx=ecx=0 (for the null case) @0x436c53-0x436c67.
//      If NOT null: clamp corners into (edi=x2-x1, esi=y2-y1, edx=x1, ecx=y1). The
//      clamps read literally from the asm are:
//          lo (x1,y1): v_out = (v >= 0xC0000002) ? v : 0xC0000001
//          hi (x2,y2): v_out = (v <  0x3FFFFFFE) ? v : 0x3FFFFFFE
//      Then edi -= edx, esi -= ecx (so slot holds width/height, not x2/y2).
//      Store: -0x58(rbp) = edi (in0.w), -0x44 = esi (in0.h),
//             -0x48     = edx (in0.x1), -0x4c = ecx (in0.y1).
//   3. Same again for input1 = renderer.GetInput(self, 1); dod1 = renderer.GetDOD(input1).
//      Pre-load defaults r13=0, r12=-1 for the null case.
//      If NOT null: clamp corners into (r13=x1, eax=y1, ecx=x2, r12=y2).
//      Then ecx -= r13 (width), r12 -= eax (height).
//      Store -0x50 = ecx (in1.w), -0x54 = eax (in1.y1).
//      After this block, live values are: r13 = in1.x1, r12 = in1.h.
//   4. @0x436d4e vtable *0x68 call = HgcMaskCompSubtract::GetParameter(1, &tmpFloat).
//      Load tmpFloat, fabs via andps 0x7FFFFFFF mask, ucomiss against 1e-5f.
//   5. If |amount| >= 1e-5f  → union branch (0x436db2):
//        If in0.w < 0 or in0.h < 0        → jump to "small" path (return in1)
//        Else if in1.w < 0 or in1.h < 0   → return in0 (0x436e08)
//        Else union the two rects: (min_x1, min_y1, max_x2, max_y2)
//        Fall into HGRectMake4i(x1, y1, x2, y2).
//      If |amount| <  1e-5f  → return in1 directly (0x436d7f fall-through).
//   6. @0x436d8e HGRectMake4i(edi, esi, edx, ecx) — corners.
// ---------------------------------------------------------------------------

/** Clamp signed-int32 lower corner.
 *  @0x436c6b-c7b, @0x436c82-c88, @0x436cfb-d0d, @0x436d15-d1c.
 *  `if (v >= 0xC0000002) keep v else return 0xC0000001`. Note the JS ternary
 *  is one instruction: the asm's cmov-with-preload pattern is equivalent. */
function clampLo(v: number): number {
  // signed compare in 32-bit — v arrives already truncated to int32 by caller.
  return v >= -0x3FFFFFFE ? v | 0 : -0x3FFFFFFF;
}

/** Clamp signed-int32 upper corner.
 *  @0x436c8b-cab, @0x436c92-c97, @0x436d20-d3e, @0x436d26-d2c.
 *  `if (v < 0x3FFFFFFE) keep v else return 0x3FFFFFFE`. */
function clampHi(v: number): number {
  return v < 0x3FFFFFFE ? v | 0 : 0x3FFFFFFE;
}

/** Force to int32 (mirrors the asm's 32-bit register semantics). */
function i32(v: number): number { return v | 0; }

/** HMaskCompSubtract::GetDOD(renderer, which, rect) @Ozone 0x436be0. */
export function HMaskCompSubtract_GetDOD(
  self: HMaskCompSubtract,
  renderer: HGRenderer,
  which: number,
  _rect: HGRect,
): HGRect {
  // @0x436bff testl %edx, %edx ; @0x436c01 je 0x436c16
  if (which !== 0) {
    // @0x436c03 movq _HGRectNull(%rip), %rcx ; @0x436c0a-0d load (%rcx),(%rcx+8) into rax,rdx
    return HGRectNull();
  }

  // -------- input 0 --------
  // @0x436c23-c2b callq HGRenderer::GetInput(self, 0)  -> rax = HGNode* input0
  const input0 = renderer.GetInput(self, 0);
  // @0x436c30-c36 callq HGRenderer::GetDOD(input0)      -> (rax=lo, rdx=hi) = dod0
  const dod0 = renderer.GetDOD(input0);
  // @0x436c47 callq _HGRectIsNull(dod0)
  const in0IsNull = HGRectIsNull(dod0);

  // Pre-load defaults for the null case: @0x436c4c-c67 sets edi=esi=-1, edx=ecx=0.
  // (Then @0x436c69 `jne 0x436cb3` skips the clamp on null.)
  let in0_w: number, in0_h: number, in0_x1: number, in0_y1: number;
  if (in0IsNull) {
    // @0x436c53 movl $0x0, %edx ; @0x436c58 movl $0x0, %ecx
    // @0x436c5d movl $0xffffffff, %edi ; @0x436c62 movl $0xffffffff, %esi
    // Then @0x436cb3-cbc: stored to -0x58/-0x44/-0x48/-0x4c.
    in0_w = -1;   // -0x58
    in0_h = -1;   // -0x44
    in0_x1 = 0;   // -0x48
    in0_y1 = 0;   // -0x4c
  } else {
    // @0x436c6b clamp dod0.x1 (ebx low32) → edx
    const x1 = clampLo(i32(dod0.x1));
    // @0x436c7e shrq $0x20, %rbx ; @0x436c82 clamp dod0.y1 (ebx high32) → ecx
    const y1 = clampLo(i32(dod0.y1));
    // @0x436c8b clamp dod0.x2 (r13 low32) → edi
    const x2 = clampHi(i32(dod0.x2));
    // @0x436ca0 shrq $0x20, %r13 ; @0x436ca4 clamp dod0.y2 (r13 high32) → esi
    const y2 = clampHi(i32(dod0.y2));
    // @0x436caf subl %edx, %edi  ; @0x436cb1 subl %ecx, %esi
    in0_w = i32(x2 - x1);   // -0x58
    in0_h = i32(y2 - y1);   // -0x44
    in0_x1 = x1;            // -0x48
    in0_y1 = y1;            // -0x4c
  }

  // -------- input 1 --------
  // @0x436cbf-cca callq HGRenderer::GetInput(self, 1)
  const input1 = renderer.GetInput(self, 1);
  // @0x436ccf-cd5 callq HGRenderer::GetDOD(input1)
  const dod1 = renderer.GetDOD(input1);
  // @0x436ce6 callq _HGRectIsNull(dod1)
  const in1IsNull = HGRectIsNull(dod1);

  // Pre-load defaults: @0x436ceb movl $0x0, %r13d ; @0x436cf1 movl $0xffffffff, %r12d.
  // Note that -0x50 and -0x54 slots are read later in some paths WITHOUT being
  // written by this branch. -0x54 was zeroed at @0x436c1c `movl $0x0, -0x54(%rbp)`;
  // -0x50 is left with an indeterminate value when in1 is null. We seed both to
  // the same defaults FCP's stack happens to have (0 from the -0x54 init pattern);
  // this affects only the "|amount| < 1e-5 AND in1.dod is null" corner (below the
  // vtable threshold, so upstream rarely reaches it).
  let in1_w: number, in1_y1: number;
  let in1_x1_live: number;   // r13
  let in1_h_live: number;    // r12
  if (in1IsNull) {
    // Defaults from @0x436ceb-cf1:
    in1_x1_live = 0;         // r13d
    in1_h_live = -1;         // r12d = 0xffffffff (signed -1)
    // -0x54 was zeroed at @0x436c1c; -0x50 is left as-is by the null path.
    in1_y1 = 0;              // -0x54
    in1_w = 0;               // -0x50 (see note above)
  } else {
    // @0x436cfb clampLo(dod1.x1) → r13d
    const x1 = clampLo(i32(dod1.x1));
    // @0x436d15 clampLo(dod1.y1) → eax
    const y1 = clampLo(i32(dod1.y1));
    // @0x436d20 clampHi(dod1.x2) → ecx
    const x2 = clampHi(i32(dod1.x2));
    // @0x436d38 clampHi(dod1.y2) → r12d
    const y2 = clampHi(i32(dod1.y2));
    // @0x436d42 subl %r13d, %ecx  → w
    in1_w = i32(x2 - x1);            // -0x50
    // @0x436d48 movl %eax, -0x54(%rbp)
    in1_y1 = y1;                     // -0x54
    // @0x436d4b subl %eax, %r12d    → h (still live in r12d for the union code)
    in1_h_live = i32(y2 - y1);       // r12d
    in1_x1_live = x1;                // r13d
  }

  // -------- amount check via vtable *0x68 --------
  // @0x436d4e movq (%r15), %rax ; @0x436d51 leaq -0x40(%rbp), %rdx ;
  // @0x436d55 movq %r15, %rdi ; @0x436d58 movl $0x1, %esi ; @0x436d5d callq *0x68(%rax)
  // = HgcMaskCompSubtract::GetParameter(self, 1, &tmp) @Ozone 0x6a9880.
  const tmp = new Float32Array(1);
  self.vtable.slot_0x68_GetParameter(self, 1, tmp);
  // @0x436d60 movss -0x40(%rbp), %xmm0
  // @0x436d65 andps 0x2d0e54(%rip), %xmm0    ; sign-mask @0x707BC0 = 0x7FFFFFFF -> fabs
  // @0x436d6c movss 0x2d0e6c(%rip), %xmm1    ; @0x707BE0 = 0x3727C5AC = 1e-5f
  // @0x436d74 ucomiss %xmm0, %xmm1           ; flags of xmm1 - xmm0
  // @0x436d77-7a reload esi = -0x54, edi = -0x58
  // @0x436d7d jbe 0x436db2                   ; jump if xmm1 <= xmm0, i.e. 1e-5f <= |amount|
  const amt = Math.fround(tmp[0]);
  const absAmt = Math.fround(Math.abs(amt));
  const threshold = Math.fround(1e-5);
  const bigAmount = threshold <= absAmt;

  // The two branches converge at @0x436d82 with:
  //   edi = out.x1, esi = out.y1, edx = out.w (offset from x1), r13d = base x1,
  //   r12d = out.h, ecx = ... (recomputed below).
  // Then @0x436d82-8e does: edx += r13; r12 += esi; call HGRectMake4i(r13, esi, edx, r12+esi).
  // In OTHER words the final call receives corners (x1, y1, x2, y2).

  // "Small" path fall-through @0x436d7f-8e uses in1 only:
  //   edi = r13d (in1.x1_live)
  //   esi = -0x54 (in1.y1)
  //   edx = -0x50 (in1.w) + r13d (in1.x1_live) = in1.x2
  //   ecx = r12d  (in1.h_live) + esi (in1.y1) = in1.y2
  // Result: HGRectMake4i(in1.x1, in1.y1, in1.x2, in1.y2).

  // "Union" path @0x436db2 first re-tests in0.w/h vs 0 (signed):
  //   @0x436db2 testl %edi, %edi  ; edi still = in0.w from the @0x436d7a reload
  //   @0x436db4 js 0x436d82       ; if in0.w < 0 → fall through with in1 values (same as small path)
  //   @0x436db9 cmpl $0x0, -0x44 ; @0x436dbd js 0x436d82  ; if in0.h < 0 → same
  //   @0x436dbf testl %edx, %edx ; @0x436dc1 js 0x436e08  ; if in1.w < 0 → jump to in0-only
  //   @0x436dc3 testl %r12d, %r12d ; @0x436dc6 js 0x436e08 ; if in1.h < 0 → jump to in0-only
  // Then union:
  //   ecx = in0.x1 (from -0x48); eax = min(in0.x1, in1.x1_live)
  //   edi = in0.x1 + in0.w = in0.x2 ; edx = in1.x1_live + in1.w = in1.x2 ; edx = max(edi, edx)
  //   edi = in0.y1 (from -0x4c); ecx2 = min(in0.y1, in1.y1)
  //   r8d = in0.y1 + in0.h = in0.y2 ; r12d = in1.y1 + in1.h = in1.y2 ; r12d = max(r8d, r12d)
  //   edx -= eax     (union width)
  //   r12d -= ecx2   (union height)
  //   esi = ecx2 ; r13d = eax
  //   jmp 0x436d82
  // Post-@0x436d82:
  //   edx += r13d (min_x1) → back to max_x2
  //   r12d += esi (min_y1) → back to max_y2
  //   HGRectMake4i(min_x1, min_y1, max_x2, max_y2)  ← union rect

  // "in0-only" path @0x436e08:
  //   r12d = in0.h (from -0x44); edx = edi = in0.w (from earlier reload)
  //   esi = in0.y1 (from -0x4c); r13d = in0.x1 (from -0x48)
  //   jmp 0x436d82 → HGRectMake4i(in0.x1, in0.y1, in0.x2, in0.y2)

  let outX1: number, outY1: number, outW: number, outH: number;
  if (bigAmount) {
    if (in0_w < 0 || in0_h < 0) {
      // @0x436db4/@0x436dbd fall to small path (in1 only).
      outX1 = in1_x1_live;
      outY1 = in1_y1;
      outW  = in1_w;
      outH  = in1_h_live;
    } else if (in1_w < 0 || in1_h_live < 0) {
      // @0x436e08 → in0-only.
      outX1 = in0_x1;
      outY1 = in0_y1;
      outW  = in0_w;
      outH  = in0_h;
    } else {
      // @0x436dc8-dfb union.
      const in0x2 = i32(in0_x1 + in0_w);
      const in1x2 = i32(in1_x1_live + in1_w);
      const in0y2 = i32(in0_y1 + in0_h);
      const in1y2 = i32(in1_y1 + in1_h_live);
      const minX  = in0_x1 < in1_x1_live ? in0_x1 : in1_x1_live;   // @0x436dc8-d1: min
      const maxX2 = in0x2  > in1x2       ? in0x2  : in1x2;         // @0x436dd4-db: max
      const minY  = in0_y1 < in1_y1      ? in0_y1 : in1_y1;        // @0x436dde-e5: min
      const maxY2 = in0y2  > in1y2       ? in0y2  : in1y2;         // @0x436de8-f5: max
      outX1 = minX;
      outY1 = minY;
      outW  = i32(maxX2 - minX);
      outH  = i32(maxY2 - minY);
    }
  } else {
    // Small-|amount| fall-through: return in1.
    outX1 = in1_x1_live;
    outY1 = in1_y1;
    outW  = in1_w;
    outH  = in1_h_live;
  }

  // @0x436d82-8e: convert (x1, y1, w, h) back to corners and call HGRectMake4i.
  const outX2 = i32(outX1 + outW);
  const outY2 = i32(outY1 + outH);
  // @0x436d8e callq _HGRectMake4i
  return HGRectMake4i(outX1, outY1, outX2, outY2);
}
