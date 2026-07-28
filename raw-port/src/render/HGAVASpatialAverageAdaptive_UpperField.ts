// HGAVASpatialAverageAdaptive_UpperField.ts — Helium "AVA (Anti Video
// Aliasing) Spatial-Average Adaptive, upper-field variant" node.
//
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_UpperField.~HGAVASpatialAverageAdaptive_UpperField.D1.s
//                                                              @0x00000000000222010
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_UpperField.~HGAVASpatialAverageAdaptive_UpperField.D0.s
//                                                              @0x00000000000222060
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_UpperField.GetDOD.s
//                                                              @0x000000000002220b0
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_UpperField.GetROI.s
//                                                              @0x000000000002220d0
//
// Frontier symbols referenced (kept as throwing stubs, citing @0xADDR):
//   HGNode::~HGNode()  __ZN6HGNodeD2Ev
//     — reached from D1 @0x222024 / @0x222031 / @0x222051 (tail-call / je),
//       and from D0 @0x222090 (callq).
//   HGObject::operator delete(void*)  __ZN8HGObjectdlEPv
//     — reached from D0 @0x22209e (tail-call jmp).
//   ::operator delete(void*)   __ZdlPv  (global, not the HGObject overload)
//     — reached from D1 @0x222043 and D0 @0x222088 (callq via symbol stub
//       at 0x3c4fa0). This is the *global* Itanium `operator delete(void*)`,
//       used to free the buffer nested at offset -8 from this->[0x198].
//
// DATA symbol read directly from the Helium __DATA_CONST section:
//   vtable-for-HgcAVASpatialAverageAdaptive_UpperField (base class vtable)
//     — resolved via resolve.py sym on the D1 lea target
//       (@0x222010 leaq 0x80ed11(%rip),%rax  =>  0x222017 + 0x80ed11 = 0xa30d28)
//       and on the D0 lea target
//       (@0x222069 leaq 0x80ecb8(%rip),%rax  =>  0x222070 + 0x80ecb8 = 0xa30d28).
//     Both destructors install the SAME vptr (offset +0x10 into the vtable
//     symbol — the standard Itanium C++ ABI "vptr = vtable + 2*ptrsize"
//     offset that skips the RTTI/offset-to-top slots). Because the vtable
//     is that of the *base* class `HgcAVASpatialAverageAdaptive_UpperField`,
//     `HGAVASpatialAverageAdaptive_UpperField` adds no new virtuals — it
//     is a wrapper subclass, and its destructors reinstall the base vptr
//     as they walk down the destructor chain.
//
// Reused ports (imported, not re-stubbed):
//   HGRect, HGRectNull, HGRectMake4i, HGRectGrow — from ./HGRect.js.
//
// ---------------------------------------------------------------------------

import {
  HGRect,
  HGRectNull as HGRectNullConst,
  HGRectMake4i,
  HGRectGrow,
} from "./HGRect.js";
export { HGRect };

/**
 * Opaque handle for Helium `HGRenderer*`. GetDOD/GetROI of this class do
 * NOT dereference the renderer — they only forward-return the caller's
 * `inRect` or `_HGRectNull`. Kept typed for signature parity with the
 * other node ports (e.g. HGLensGDC_BL).
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Opaque handle for Helium `HGNode*`. `HGAVASpatialAverageAdaptive_UpperField`
 * IS-A HGNode (single inheritance through `HgcAVASpatialAverageAdaptive_UpperField`
 * -> ... -> HGNode). The destructor chain terminates in HGNode::~HGNode.
 */
export type HGNodePtr = { readonly __brand: "HGNode" };

/**
 * Un-transcribed callee: `HGNode::~HGNode()` (`__ZN6HGNodeD2Ev`).
 * Reached from every HGAVASpatialAverageAdaptive_UpperField destructor path.
 */
function HGNode_dtor(_self: HGAVASpatialAverageAdaptive_UpperField): void {
  throw new Error(
    "HGNode::~HGNode (__ZN6HGNodeD2Ev @Helium tail-call @0x222024/@0x222031/@0x222051/@0x222090) not yet transcribed",
  );
}

/**
 * Un-transcribed callee: `HGObject::operator delete(void*)`
 * (`__ZN8HGObjectdlEPv`). Reached from the D0 tail-call @0x22209e.
 *
 * Same treatment as elsewhere in the port (see HGLensGDC_BL,
 * OZHCopyMaskAlphaToMaskRGB): TS is GC'd, so at the language level the
 * free-storage step has no observable effect. Citation preserved.
 */
function HGObject_operator_delete(
  _p: HGAVASpatialAverageAdaptive_UpperField,
): void {
  // @Helium 0x22209e  jmp  __ZN8HGObjectdlEPv  ## HGObject::operator delete(void*)
  // TS is GC'd; no decoded side-effect.
}

/**
 * Un-transcribed callee: global `::operator delete(void*)` (`__ZdlPv`, the
 * plain non-Object overload — NOT `HGObject::operator delete`).
 *
 * Reached from D1 @0x222043 and D0 @0x222088. The pointer freed is
 * `*(this[0x198] - 8)` — i.e. some hidden allocation whose header the
 * enclosing member at offset +0x198 points *just past*. TS is GC'd; kept
 * as a no-op with the citation preserved.
 */
function global_operator_delete(_p: unknown): void {
  // @Helium 0x222043 callq 0x3c4fa0 ## symbol stub for: __ZdlPv
  // @Helium 0x222088 callq 0x3c4fa0 ## symbol stub for: __ZdlPv
  // TS is GC'd; no decoded side-effect.
}

/**
 * Vtable-install marker for
 *   `vtable for HgcAVASpatialAverageAdaptive_UpperField + 0x10`
 *
 * Both destructors reinstall the SAME base-class vptr as they walk down
 * the destructor chain — the classic Itanium C++ ABI pattern where each
 * D1/D0 stage rewrites `*this` to point at the vtable of the class whose
 * dtor is currently running (so any virtual calls dispatched *from* the
 * dtor resolve to the not-yet-destroyed base subobject).
 *
 * The move has no observable effect in TS (no vtable in the runtime), so
 * we keep it as a documented no-op with the citation preserved.
 *
 * @Helium 0x222010  leaq 0x80ed11(%rip), %rax   (D1) rax = &vtable+0x10, RIP=0x222017
 * @Helium 0x222017  movq %rax, (%rdi)           (D1) *this = vtable+0x10
 * @Helium 0x222069  leaq 0x80ecb8(%rip), %rax   (D0) rax = &vtable+0x10, RIP=0x222070
 * @Helium 0x222070  movq %rax, (%rdi)           (D0) *this = vtable+0x10
 * Both target absolute address 0xa30d28 =
 *   vtable-for-HgcAVASpatialAverageAdaptive_UpperField + 0x10.
 */
function install_base_vptr(_self: HGAVASpatialAverageAdaptive_UpperField): void {
  // @Helium 0xa30d28  vtable-for-HgcAVASpatialAverageAdaptive_UpperField + 0x10
  // TS has no runtime vtable; documented no-op.
}

/**
 * `HGAVASpatialAverageAdaptive_UpperField` — Helium "spatial-average
 * adaptive deinterlacer, upper-field" node. A thin wrapper on top of the
 * base class `HgcAVASpatialAverageAdaptive_UpperField`: it overrides only
 * the DOD/ROI queries (which are output-index/plane dependent) plus the
 * two destructor variants (which reinstall the base vptr, free a member
 * buffer, then chain into HGNode::~HGNode).
 *
 * Fields (recovered from the D1/D0 disasm):
 *   +0x00   vptr                  (Itanium-ABI virtual-table pointer)
 *   ...    (inherited HGNode fields, not enumerated here)
 *   +0x198  member (T*)           — an owned buffer/handle whose deletion
 *                                  target is `*(member - 8)` freed via
 *                                  global `::operator delete`.
 *
 * The +0x198 field is only *read* here (as a raw address) — its full
 * struct layout is not observable from the four emitted symbols.
 */
export class HGAVASpatialAverageAdaptive_UpperField {
  /**
   * Modelled as `unknown` because the enclosing owner (the nested "raw
   * heap pointer with an 8-byte backing-pointer prefix") layout is not
   * decoded from this class's disasm alone. Kept only so the destructor
   * transcription reads exactly like the asm.
   */
  private readonly member0x198: { backingPtr: unknown } | null = null;

  /**
   * @see FCP Helium `HGAVASpatialAverageAdaptive_UpperField::GetDOD(HGRenderer*, int, HGRect)`
   *      @0x00000000002220b0
   *
   * Disassembly (verbatim, System V AMD64 ABI):
   *   rdi = this
   *   rsi = HGRenderer*
   *   edx = outputIndex (signed int; only the low 32 bits are used)
   *   rcx = inRect.lo   (low 8 bytes of the HGRect argument)
   *   r8  = inRect.hi   (high 8 bytes of the HGRect argument)
   *   Return: HGRect in (rax, rdx)
   *
   *   0x2220b0  movq  %rcx, %rax                ; rax = inRect.lo   (default return.lo)
   *   0x2220b3  cmpl  $0x2, %edx                ; outputIndex vs 2
   *   0x2220b6  jb    0x2220cb                  ; UNSIGNED < 2 -> passthrough branch
   *   0x2220b8  pushq %rbp                      ; else (outputIndex u>= 2)
   *   0x2220b9  movq  %rsp, %rbp
   *   0x2220bc  leaq  _HGRectNull(%rip), %rcx   ; rcx = &_HGRectNull
   *   0x2220c3  movq  (%rcx), %rax              ; rax = _HGRectNull.lo   (override lo)
   *   0x2220c6  movq  0x8(%rcx), %r8            ; r8  = _HGRectNull.hi
   *   0x2220ca  popq  %rbp
   *   0x2220cb  movq  %r8, %rdx                 ; return.hi = r8 (inRect.hi OR null.hi)
   *   0x2220ce  retq
   *
   * Control flow: exactly ONE branch.
   *
   *   outputIndex u< 2 (i.e. 0 or 1, treating edx as unsigned):
   *     return inRect  (passthrough — the deinterlacer's per-output DOD
   *     is the same as its input DOD for outputs 0 and 1).
   *   outputIndex u>= 2 (2, 3, ..., or any negative — since jb is unsigned
   *     and a negative signed int has bit 31 set so it's a huge unsigned):
   *     return _HGRectNull.
   *
   * The renderer/renderer-context pointer is never dereferenced on either
   * path — this override is purely per-output-index.
   */
  GetDOD(
    _renderer: HGRendererPtr,
    outputIndex: number,
    inRect: HGRect,
  ): HGRect {
    // @0x2220b0 movq %rcx,%rax        (default return.lo = inRect.lo)
    // @0x2220b3 cmpl $0x2,%edx        (compare outputIndex to 2)
    // @0x2220b6 jb 0x2220cb           (UNSIGNED < 2 -> passthrough)
    // Mirror the asm's unsigned comparison exactly: coerce to unsigned 32-bit.
    if ((outputIndex >>> 0) < 2) {
      // ---- @0x2220cb..0x2220ce — passthrough branch ----
      // @0x2220cb movq %r8,%rdx       (return.hi = inRect.hi)
      // @0x2220ce retq
      return inRect;
    }
    // ---- @0x2220b8..0x2220ce — override with _HGRectNull ----
    // @0x2220bc leaq _HGRectNull(%rip),%rcx
    // @0x2220c3 movq  (%rcx),%rax        (return.lo = null.lo)
    // @0x2220c6 movq 0x8(%rcx),%r8       (r8 = null.hi)
    // @0x2220cb movq %r8,%rdx            (return.hi = null.hi)
    return HGRectNullConst;
  }

  /**
   * @see FCP Helium `HGAVASpatialAverageAdaptive_UpperField::GetROI(HGRenderer*, int, HGRect)`
   *      @0x00000000002220d0
   *
   * Disassembly (verbatim, System V AMD64 ABI):
   *   rdi = this
   *   rsi = HGRenderer*
   *   edx = outputIndex (signed int)
   *   rcx = inRect.lo
   *   r8  = inRect.hi
   *   Return: HGRect in (rax, rdx)
   *
   *   0x2220d0  pushq %rbp
   *   0x2220d1  movq  %rsp, %rbp
   *   0x2220d4  pushq %r14
   *   0x2220d6  pushq %rbx
   *   0x2220d7  movq  %r8, %rbx                 ; rbx = inRect.hi   (save)
   *   0x2220da  movq  %rcx, %r14                ; r14 = inRect.lo   (save)
   *   0x2220dd  testl %edx, %edx                ; outputIndex == 0 ?
   *   0x2220df  je    0x2220f9                  ; yes -> path A (index==0)
   *   0x2220e1  cmpl  $0x1, %edx                ; outputIndex == 1 ?
   *   0x2220e4  jne   0x222127                  ; else -> return _HGRectNull
   *   ; ---- path B: outputIndex == 1 ----
   *   0x2220e6  movl  $0xfffffffc, %edi         ; edi = -4    (arg1 x0)
   *   0x2220eb  xorl  %esi, %esi                ; esi =  0    (arg2 y0)
   *   0x2220ed  movl  $0x4, %edx                ; edx =  4    (arg3 x1)
   *   0x2220f2  movl  $0x1, %ecx                ; ecx =  1    (arg4 y1)
   *   0x2220f7  jmp   0x22210d                  ; skip path-A ctor
   *   ; ---- path A: outputIndex == 0 ----
   *   0x2220f9  movl  $0xfffffffc, %edi         ; edi = -4    (arg1 x0)
   *   0x2220fe  movl  $0xffffffff, %esi         ; esi = -1    (arg2 y0)
   *   0x222103  movl  $0x4, %edx                ; edx =  4    (arg3 x1)
   *   0x222108  movl  $0x2, %ecx                ; ecx =  2    (arg4 y1)
   *   ; ---- shared tail: build the kernel rect, then grow inRect by it ----
   *   0x22210d  callq _HGRectMake4i             ; (rax, rdx) = kernelRect
   *   0x222112  movq  %rdx, %rcx                ; rcx = kernel.hi  (arg4 of HGRectGrow)
   *   0x222115  movq  %r14, %rdi                ; rdi = inRect.lo  (arg1)
   *   0x222118  movq  %rbx, %rsi                ; rsi = inRect.hi  (arg2)
   *   0x22211b  movq  %rax, %rdx                ; rdx = kernel.lo  (arg3)
   *   0x22211e  popq  %rbx
   *   0x22211f  popq  %r14
   *   0x222121  popq  %rbp
   *   0x222122  jmp   _HGRectGrow               ; tail-call HGRectGrow(inRect, kernel)
   *   ; ---- path C: outputIndex not in {0, 1} -> _HGRectNull ----
   *   0x222127  leaq  _HGRectNull(%rip), %rcx
   *   0x22212e  movq  (%rcx), %rax              ; rax = _HGRectNull.lo
   *   0x222131  movq  0x8(%rcx), %rdx           ; rdx = _HGRectNull.hi
   *   0x222135  popq  %rbx
   *   0x222136  popq  %r14
   *   0x222138  popq  %rbp
   *   0x222139  retq
   *
   * ROI ("region-of-input") reports the input footprint required to
   * satisfy one output line. For a spatial-average adaptive deinterlacer
   * the horizontal span is fixed (±4 samples: `x in [-4, 4)`) while the
   * vertical span differs per output plane:
   *   outputIndex==0 -> `y in [-1, 2)`   (needs one line above and below)
   *   outputIndex==1 -> `y in [ 0, 1)`   (only the current line)
   *   otherwise     -> `_HGRectNull`
   * The final result is `inRect` GROWN by that kernel rect (see
   * HGRectGrow — per-corner saturating int32 add).
   *
   * NOTE: HGRectMake4i normalises the corners so `x <= right` and
   * `y <= bottom` — the negative-corner values here (-4, -1) become the
   * `x` and `y` fields of the returned kernel rect.
   */
  GetROI(
    _renderer: HGRendererPtr,
    outputIndex: number,
    inRect: HGRect,
  ): HGRect {
    // @0x2220dd testl %edx,%edx / @0x2220df je 0x2220f9
    if ((outputIndex | 0) === 0) {
      // ---- path A: outputIndex == 0 ----
      // @0x2220f9 movl $-4,%edi ; movl $-1,%esi ; movl $4,%edx ; movl $2,%ecx
      const kernel = HGRectMake4i(-4, -1, 4, 2);
      // @0x222122 jmp _HGRectGrow (tail-call)
      return HGRectGrow(inRect, kernel);
    }
    // @0x2220e1 cmpl $0x1,%edx / @0x2220e4 jne 0x222127
    if ((outputIndex | 0) === 1) {
      // ---- path B: outputIndex == 1 ----
      // @0x2220e6 movl $-4,%edi ; xorl %esi,%esi ; movl $4,%edx ; movl $1,%ecx
      const kernel = HGRectMake4i(-4, 0, 4, 1);
      // @0x222122 jmp _HGRectGrow (tail-call)
      return HGRectGrow(inRect, kernel);
    }
    // ---- path C: outputIndex not in {0, 1} ----
    // @0x222127 leaq _HGRectNull(%rip),%rcx
    // @0x22212e movq (%rcx),%rax
    // @0x222131 movq 0x8(%rcx),%rdx
    // @0x222139 retq
    return HGRectNullConst;
  }

  /**
   * @see FCP Helium `HGAVASpatialAverageAdaptive_UpperField::~HGAVASpatialAverageAdaptive_UpperField()`
   *      (D1 — complete-object in-place destructor, does NOT free storage)
   *      @0x0000000000222010
   *
   * Disassembly (verbatim):
   *   0x222010  leaq  0x80ed11(%rip), %rax        ; rax = &vtable-for-Hgc..._UpperField + 0x10
   *                                              ;       (absolute 0xa30d28; RIP=0x222017)
   *   0x222017  movq  %rax, (%rdi)                ; *this = new vptr (base subobject)
   *   0x22201a  movq  0x198(%rdi), %rax           ; rax = this->member0x198
   *   0x222021  testq %rax, %rax                  ; member == NULL ?
   *   0x222024  je    __ZN6HGNodeD2Ev             ; yes -> tail-call HGNode::~HGNode()
   *   0x22202a  movq  -0x8(%rax), %rax            ; rax = *(member - 8)   (backing ptr)
   *   0x22202e  testq %rax, %rax                  ; backing == NULL ?
   *   0x222031  je    __ZN6HGNodeD2Ev             ; yes -> tail-call HGNode::~HGNode()
   *   0x222037  pushq %rbp                        ; else -> both non-NULL
   *   0x222038  movq  %rsp, %rbp
   *   0x22203b  pushq %rbx
   *   0x22203c  pushq %rax                        ; align stack (also holds backing)
   *   0x22203d  movq  %rdi, %rbx                  ; rbx = this  (save across call)
   *   0x222040  movq  %rax, %rdi                  ; rdi = backing  (arg to operator delete)
   *   0x222043  callq 0x3c4fa0                    ; ::operator delete(backing) (__ZdlPv stub)
   *   0x222048  movq  %rbx, %rdi                  ; rdi = this  (arg to HGNode::~HGNode)
   *   0x22204b  addq  $0x8, %rsp
   *   0x22204f  popq  %rbx
   *   0x222050  popq  %rbp
   *   0x222051  jmp   __ZN6HGNodeD2Ev             ; tail-call HGNode::~HGNode()
   *
   * Sequence: reinstall base vptr; if `this->member0x198` is non-NULL
   * AND its 8-byte-prefixed backing pointer is non-NULL, free that
   * backing pointer via the global `::operator delete`; then in all
   * cases chain into HGNode::~HGNode.
   */
  destroyInPlace(): void {
    // @0x222010/0x222017 install_base_vptr(this)
    install_base_vptr(this);

    // @0x22201a movq 0x198(%rdi),%rax ; testq %rax,%rax ; je HGNode::~HGNode
    const member = this.member0x198;
    if (member !== null) {
      // @0x22202a movq -0x8(%rax),%rax ; testq %rax,%rax ; je HGNode::~HGNode
      const backing = member.backingPtr;
      if (backing !== null && backing !== undefined) {
        // @0x222043 callq __ZdlPv  (::operator delete(backing))
        global_operator_delete(backing);
      }
    }

    // @0x222051 jmp __ZN6HGNodeD2Ev (tail-call)
    HGNode_dtor(this);
  }

  /**
   * @see FCP Helium `HGAVASpatialAverageAdaptive_UpperField::~HGAVASpatialAverageAdaptive_UpperField()`
   *      (D0 — deleting destructor, cleans up AND frees) @0x0000000000222060
   *
   * Disassembly (verbatim):
   *   0x222060  pushq %rbp
   *   0x222061  movq  %rsp, %rbp
   *   0x222064  pushq %rbx
   *   0x222065  pushq %rax                        ; align stack
   *   0x222066  movq  %rdi, %rbx                  ; rbx = this (save)
   *   0x222069  leaq  0x80ecb8(%rip), %rax        ; rax = &vtable-for-Hgc..._UpperField + 0x10
   *                                              ;       (absolute 0xa30d28; RIP=0x222070)
   *   0x222070  movq  %rax, (%rdi)                ; *this = new vptr
   *   0x222073  movq  0x198(%rdi), %rax           ; rax = this->member0x198
   *   0x22207a  testq %rax, %rax                  ; member == NULL ?
   *   0x22207d  je    0x22208d                    ; skip the ::operator delete
   *   0x22207f  movq  -0x8(%rax), %rdi            ; rdi = *(member - 8)  (backing ptr)
   *   0x222083  testq %rdi, %rdi                  ; backing == NULL ?
   *   0x222086  je    0x22208d                    ; skip
   *   0x222088  callq 0x3c4fa0                    ; ::operator delete(backing) (__ZdlPv stub)
   *   0x22208d  movq  %rbx, %rdi                  ; rdi = this  (join point)
   *   0x222090  callq __ZN6HGNodeD2Ev             ; HGNode::~HGNode()
   *   0x222095  movq  %rbx, %rdi                  ; rdi = this  (for op delete)
   *   0x222098  addq  $0x8, %rsp
   *   0x22209c  popq  %rbx
   *   0x22209d  popq  %rbp
   *   0x22209e  jmp   __ZN8HGObjectdlEPv          ; tail-call HGObject::operator delete(this)
   *
   * Same first three stages as D1 (reinstall base vptr; conditional
   * ::operator delete of backing; HGNode::~HGNode), then a fourth stage:
   * `HGObject::operator delete(this)` via tail-jmp.
   *
   * NOTE: unlike some node D0s that collapse into D1 as a pure tail-call,
   * this D0 has D1's body inlined. The two are literal copies plus the
   * extra op-delete tail.
   */
  destroyAndDelete(): void {
    // @0x222069/0x222070 install_base_vptr(this)
    install_base_vptr(this);

    // @0x222073 movq 0x198(%rdi),%rax ; testq %rax,%rax ; je 0x22208d
    const member = this.member0x198;
    if (member !== null) {
      // @0x22207f movq -0x8(%rax),%rdi ; testq %rdi,%rdi ; je 0x22208d
      const backing = member.backingPtr;
      if (backing !== null && backing !== undefined) {
        // @0x222088 callq __ZdlPv  (::operator delete(backing))
        global_operator_delete(backing);
      }
    }

    // @0x222090 callq __ZN6HGNodeD2Ev
    HGNode_dtor(this);
    // @0x22209e jmp __ZN8HGObjectdlEPv (tail-call)
    HGObject_operator_delete(this);
  }
}
