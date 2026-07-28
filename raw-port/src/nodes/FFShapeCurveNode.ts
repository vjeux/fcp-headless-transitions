// FFShapeCurveNode.ts — Flexo.framework's FFShape-owned curve-processing node. Delegates
// solve/getUFor/etc. to its parent FFShape (via the FFShape*+OZChannel* pair stored in the
// ctor). Faithful transcription of x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.FFShapeCurveNode.s   (C1/C2 via llvm-objdump)  @0x65a860
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.cloneNode.s                                     @0x65a950
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.compare.s                                       @0x65a9f0
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.getNeededRange.s                                @0x65a9a0
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.getUForValue.s                                  @0x65aa00
//   raw-port/re/disasm/Flexo.FFShapeCurveNode.solveNode.s (OZCurveNodeParam&)                 @0x65a930
//   (solveNode(CMTime,double,double) @0x65a910 — decoded inline from llvm-objdump)
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x65a860  T FFShapeCurveNode::FFShapeCurveNode(FFShape*, OZChannel*)     (C1 == C2, single body)
//   0x65a8a0  T FFShapeCurveNode::FFShapeCurveNode(FFShapeCurveNode const&)   (copy C1 == C2)
//   0x65a8d0  T FFShapeCurveNode::~FFShapeCurveNode()                        (D2 — tail-jmp to base D2)
//   0x65a8e0  T FFShapeCurveNode::~FFShapeCurveNode()                        (D1 — identical to D2)
//   0x65a8f0  T FFShapeCurveNode::~FFShapeCurveNode()                        (D0 — deleting dtor)
//   0x65a910  T FFShapeCurveNode::solveNode(CMTime const&, double, double)   (tail-jmp to FFShape)
//   0x65a930  T FFShapeCurveNode::solveNode(OZCurveNodeParam&)               (tail-jmp to FFShape)
//   0x65a950  T FFShapeCurveNode::cloneNode()
//   0x65a9a0  T FFShapeCurveNode::getNeededRange(OZCurveNodeParam*)
//   0x65a9f0  T FFShapeCurveNode::compare(OZCurveNode const*) const           (returns 0 — no-op)
//   0x65aa00  T FFShapeCurveNode::getUForValue(...)                           (returns 0 — no-op)
//
// CLASS ROLE: FFShapeCurveNode is a thin OZCurveNode-derived shim that holds a (FFShape*,
// OZChannel*) pair; all real work is forwarded to FFShape's static-dispatch overloads. The
// class exists so an OZChannel can carry a "compute this shape's parameter for me" callback
// through the standard OZCurveNode vtable without FFShape needing to derive from OZCurveNode.
//
// FIELD LAYOUT (24 bytes; recovered from the ctor + cloneNode's 0x18 alloc size at 0x65a95a):
//   +0x00  vtable ptr        (installed @Flexo 0x1901108; leaq 0x12a6889(%rip) @0x65a878)
//   +0x08  FFShape*  shape   (@0x65a882: movq %r14, 0x8(%r15))
//   +0x10  OZChannel* chan   (@0x65a886: movq %rbx, 0x10(%r15))
//
// Base class: OZCurveNode (C2 called at @0x65a873, D2 at @0x65a8d5). OZCurveNode base is not
// yet transcribed; the derived class only reads the two pointer fields, so we can port fully.
//
// Called symbols (all resolved via llvm-objdump comments):
//   __ZN11OZCurveNodeC2Ev                     OZCurveNode::OZCurveNode()          @0x65a873 (base ctor)
//   __ZN11OZCurveNodeC2ERKS_                  OZCurveNode::OZCurveNode(const&)    @0x65a8ad, @0x65a96d
//   __ZN11OZCurveNodeD2Ev                     OZCurveNode::~OZCurveNode()         @0x65a8d5, @0x65a8e5, @0x65a8f9
//   __Znwm                                     operator new(size_t)                @0x65a95f (0x18=24)
//   __ZdlPv                                    operator delete(void*)              @0x65a907
//   __Unwind_Resume                            (EH resume; cloneNode landing pad)  @0x65a99b
//   __ZN7FFShape9solveNodeEP13OZChannelBaseRK6CMTimedd
//                                              FFShape::solveNode(CMTime,double,double)   @0x65a923 tail
//   __ZN7FFShape9solveNodeEP13OZChannelBaseR16OZCurveNodeParam
//                                              FFShape::solveNode(OZCurveNodeParam&)      @0x65a943 tail
//
// Vtable installed @Flexo 0x1901108 (from `leaq 0x12a6889(%rip), %rax` at 0x65a878, next-instr
// @0x65a87f → 0x65a87f + 0x12a6889 = 0x1901108). The vtable slots that dispatch to the six
// method bodies above are populated at this vtable address; not further probed here.
//
// NOTES ON getNeededRange @0x65a9a0 (the most interesting method):
//   The disasm SHOWS `rsi -> rax` and then does 8 loads/stores at offsets ON THE SAME buffer:
//     movq  0x70(rsi), rcx    ;    movq rcx, 0x28(rsi)
//     movups 0x60(rsi), xmm0  ;    movups xmm0, 0x18(rsi)
//     movups 0x78(rsi), xmm0  ;    movups xmm0, 0x30(rsi)
//     movq  0x88(rsi), rcx    ;    movq rcx, 0x40(rsi)
//     movl  0x90(rsi), ecx    ;    movl ecx, 0x48(rsi)
//     movb  $0x0, 0x58(rsi)
//     movq  0x98(rsi), rcx    ;    movq rcx, 0x50(rsi)
//   THE READS AND WRITES ARE ON THE SAME OBJECT `rsi = OZCurveNodeParam*` — they COPY the
//   OZCurveNodeParam's "want range" fields (+0x60..+0x9c) into its own "needed range" fields
//   (+0x18..+0x58), unchanged. In effect: "needed range = wanted range as-is (identity copy);
//   +0x58 flag = 0 (no adjustment)." This is the base-case override for a shape that has no
//   opinion on its own needed range (defers to the caller's request).
//
// The OZCurveNodeParam layout (see raw-port/src/nodes/OZCurveNodeParam.ts) confirms the
// +0x60 / +0x78 CMTime slots are the "requested range low/high" and +0x18/+0x30 are the
// "needed range low/high" fields (also CMTimes). Byte at +0x58 is a needed-adjustment flag.

import { OZChannel } from "../channels/OZChannel.js";
import type { CMTime } from "../infra/CMTime.js";

// Opaque forward: FFShape is a Flexo class not yet transcribed. Delegated solveNode calls
// throw-stub (per PORTING_SPEC Rule 3) citing the FFShape entry addr.
export interface FFShape { readonly __brand: "FFShape" }
export interface OZCurveNode { readonly __brand: "OZCurveNode" }

// Opaque OZCurveNodeParam. The full class is transcribed in raw-port/src/nodes/OZCurveNodeParam.ts;
// but for THIS file we only touch specific byte offsets (via a typed view). Import as an alias.
export interface OZCurveNodeParamRef {
  // Byte-typed accessors so getNeededRange can copy raw bytes. We model this as a mutable
  // record with the offsets the disasm touches; the caller-side (FFShape.registerFor) MUST
  // supply a param object shaped like this. Any mismatch surfaces as a type error, not a
  // silent memcpy failure.
  __brand: "OZCurveNodeParam";
  /** +0x18 CMTime — "needed range low" (write-target).  Also read at +0x60. */
  neededRangeLow: CMTime;
  /** +0x30 CMTime — "needed range high" (write-target). Also read at +0x78. */
  neededRangeHigh: CMTime;
  /** +0x40 uint64 — flags/epoch trailer (write-target). Also read at +0x88. */
  neededRangeTrailer: bigint;
  /** +0x48 int32  — count (write-target). Also read at +0x90. */
  neededRangeCount: number;
  /** +0x50 uint64 — trailing block (write-target). Also read at +0x98. */
  neededRangeExtra: bigint;
  /** +0x58 uint8  — "needs adjustment" flag (write-target, set to 0 by this impl). */
  neededAdjustmentFlag: number;

  /** +0x60 CMTime — "wanted range low" (read source). */
  wantedRangeLow: CMTime;
  /** +0x78 CMTime — "wanted range high" (read source). */
  wantedRangeHigh: CMTime;
  /** +0x88 uint64 — wanted-range trailer. */
  wantedRangeTrailer: bigint;
  /** +0x90 int32  — wanted-range count. */
  wantedRangeCount: number;
  /** +0x98 uint64 — wanted-range extra. */
  wantedRangeExtra: bigint;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// FFShape delegation stubs — the derived class solveNode overloads just tail-jmp to these.
// Both bodies not yet decoded (FFShape internals @Flexo); each stub cites its own addr below.
// ────────────────────────────────────────────────────────────────────────────────────────
/** FFShape::solveNode(OZChannelBase*, CMTime const&, double, double)   @Flexo 0x53f1e0 (approx —
 *  computed from tail-jmp target of solveNode(CMTime,double,double) at 0x65a923). Actual body
 *  not yet transcribed. */
function FFShape_solveNode_CMTime(
  _shape: FFShape, _chan: OZChannel, _t: CMTime, _a: number, _b: number,
): void {
  throw new Error(
    "FFShape::solveNode(OZChannelBase*, CMTime const&, double, double) @Flexo not yet " +
      "transcribed — called from FFShapeCurveNode::solveNode(CMTime,double,double) @0x65a923.",
  );
}

/** FFShape::solveNode(OZChannelBase*, OZCurveNodeParam&)   @Flexo (tail-jmp target of
 *  solveNode(OZCurveNodeParam&) @0x65a943). Not yet transcribed. */
function FFShape_solveNode_Param(
  _shape: FFShape, _chan: OZChannel, _param: OZCurveNodeParamRef,
): void {
  throw new Error(
    "FFShape::solveNode(OZChannelBase*, OZCurveNodeParam&) @Flexo not yet transcribed — " +
      "called from FFShapeCurveNode::solveNode(OZCurveNodeParam&) @0x65a943.",
  );
}

/** OZCurveNode::OZCurveNode() @Flexo (stub 0x1495fbe -> __ZN11OZCurveNodeC2Ev). Base ctor
 *  body not yet transcribed. Called from FFShapeCurveNode C1/C2 @0x65a873. */
function OZCurveNode_ctor(_self: FFShapeCurveNode): void {
  throw new Error(
    "OZCurveNode::OZCurveNode() @Flexo (__ZN11OZCurveNodeC2Ev, stub 0x1495fbe) not yet " +
      "transcribed — base ctor call from FFShapeCurveNode C2 @0x65a873.",
  );
}

/** OZCurveNode::OZCurveNode(OZCurveNode const&) @Flexo (stub 0x1495fb8 -> __ZN11OZCurveNodeC2ERKS_).
 *  Base copy ctor body not yet transcribed. Called from copy ctor @0x65a8ad and cloneNode @0x65a96d. */
function OZCurveNode_copy_ctor(_self: FFShapeCurveNode, _src: FFShapeCurveNode): void {
  throw new Error(
    "OZCurveNode::OZCurveNode(OZCurveNode const&) @Flexo (__ZN11OZCurveNodeC2ERKS_, stub " +
      "0x1495fb8) not yet transcribed — base copy ctor from FFShapeCurveNode copy-C2 @0x65a8ad " +
      "and cloneNode @0x65a96d.",
  );
}

/**
 * FFShapeCurveNode — extends OZCurveNode. Holds a (FFShape*, OZChannel*) pair and forwards
 * curve-node operations to the underlying FFShape.
 *
 * ctor @Flexo 0x65a860 (C1 == C2, single body):
 *   pushq %rbp ; movq %rsp,%rbp ; pushq %r15 ; pushq %r14 ; pushq %rbx ; pushq %rax
 *   movq %rdx, %rbx        ; rbx = chan  (arg3)
 *   movq %rsi, %r14        ; r14 = shape (arg2)
 *   movq %rdi, %r15        ; r15 = this  (arg1)
 *   callq __ZN11OZCurveNodeC2Ev             ; base OZCurveNode ctor
 *   leaq  0x12a6889(%rip), %rax             ; rax = &vtable[0] @Flexo 0x1901108
 *   movq  %rax, (%r15)                      ; this->vtable = ...
 *   movq  %r14, 0x8(%r15)                   ; this->shape = shape
 *   movq  %rbx, 0x10(%r15)                  ; this->chan  = chan
 *   addq $0x8,%rsp ; popq %rbx ; popq %r14 ; popq %r15 ; popq %rbp ; retq
 *
 * copy ctor @Flexo 0x65a8a0 (C1 == C2):
 *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
 *   movq %rsi, %rbx  ; movq %rdi, %r14
 *   callq __ZN11OZCurveNodeC2ERKS_          ; base copy ctor
 *   leaq  0x12a684f(%rip), %rax             ; rax = &vtable[0] @Flexo 0x1901108
 *   movq  %rax, (%r14)                      ; this->vtable = ...
 *   movups 0x8(%rbx), %xmm0                 ; xmm0 = (src.shape, src.chan)  (packed 16B)
 *   movups %xmm0, 0x8(%r14)                 ; this->shape/chan = src.shape/chan
 *   popq %rbx ; popq %r14 ; popq %rbp ; retq
 */
export class FFShapeCurveNode {
  /** @0x65a882 (ctor) / @0x65a8c0 (copy ctor) / @0x65a981 (cloneNode). +0x08. */
  shape: FFShape;
  /** @0x65a886 (ctor) / (copy via movups xmm0) / +0x10. */
  chan: OZChannel;

  // Two overloaded ctors — we model as a single TS ctor with a discriminant. Both C1 and C2
  // share the SAME body (nm shows C1==C2), so no "vtable-in-progress" partial-init tension.
  constructor(arg: FFShape | FFShapeCurveNode, chan?: OZChannel) {
    if (arg instanceof FFShapeCurveNode) {
      // Copy constructor path @0x65a8a0.
      OZCurveNode_copy_ctor(this, arg);       // @0x65a8ad — throws (base ctor undecoded)
      this.shape = arg.shape;                  // movups 0x8(src) -> 0x8(this)
      this.chan  = arg.chan;
    } else {
      // (FFShape*, OZChannel*) ctor path @0x65a860.
      OZCurveNode_ctor(this);                  // @0x65a873 — throws (base ctor undecoded)
      this.shape = arg;                        // movq r14, 0x8(r15)
      this.chan  = chan!;                      // movq rbx, 0x10(r15) — non-null per signature
    }
  }

  /**
   * FFShapeCurveNode::~FFShapeCurveNode() @Flexo 0x65a8d0 (D2) / 0x65a8e0 (D1) — both bodies are:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp __ZN11OZCurveNodeD2Ev                ; tail-jmp to base dtor
   *
   * D0 @0x65a8f0 (deleting dtor):
   *   ... same base D2 call, then operator delete(void*) @0x65a907.
   *
   * Our port doesn't manage lifetimes explicitly (JS GC), so this method is a placeholder for
   * the vtable slot; the base dtor at __ZN11OZCurveNodeD2Ev @Flexo (stub 0x1495fc4) is not
   * a documented no-op since JS never actually calls it.
   */
  destruct(): void {
    // @0x65a8d5: tail-jmp OZCurveNode::~OZCurveNode(). Base dtor not yet transcribed.
    // No-op in JS — we do NOT throw here because the base dtor's absence would only matter
    // for a real deleting-dtor call (D0) which JS never emits. If a future direct call to
    // destruct() lands, this is the moment to throw citing __ZN11OZCurveNodeD2Ev @stub 0x1495fc4.
  }

  /**
   * FFShapeCurveNode::solveNode(CMTime const& t, double a, double b)  @Flexo 0x65a910.
   * Body: tail-jmp `FFShape::solveNode(this->chan, t, a, b)` with this->shape as the receiver.
   *
   *   movq %rsi, %rdx           ; rdx = t   (was 2nd arg)
   *   movq 0x8(%rdi), %rax      ; rax = this->shape
   *   movq 0x10(%rdi), %rsi     ; rsi = this->chan
   *   movq %rax, %rdi           ; rdi = this->shape (new receiver)
   *   jmp  FFShape::solveNode(OZChannelBase*, CMTime const&, double, double)
   *
   * The (double a, double b) args (xmm0, xmm1) pass through unchanged in the register ABI.
   */
  solveNodeAt(t: CMTime, a: number, b: number): void {
    FFShape_solveNode_CMTime(this.shape, this.chan, t, a, b);  // @0x65a923 tail-jmp
  }

  /**
   * FFShapeCurveNode::solveNode(OZCurveNodeParam& param)  @Flexo 0x65a930.
   * Body: same shape as solveNodeAt but tail-jmps to the OZCurveNodeParam overload:
   *
   *   movq %rsi, %rdx           ; rdx = &param
   *   movq 0x8(%rdi), %rax      ; rax = this->shape
   *   movq 0x10(%rdi), %rsi     ; rsi = this->chan
   *   movq %rax, %rdi           ; rdi = this->shape
   *   jmp  FFShape::solveNode(OZChannelBase*, OZCurveNodeParam&)
   */
  solveNodeParam(param: OZCurveNodeParamRef): void {
    FFShape_solveNode_Param(this.shape, this.chan, param);      // @0x65a943 tail-jmp
  }

  /**
   * FFShapeCurveNode::cloneNode()  @Flexo 0x65a950.
   *
   * Body (verbatim):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
   *   movq %rdi, %r14                 ; r14 = this
   *   movl $0x18, %edi                ; alloc size = 24 bytes
   *   callq __Znwm                    ; rax = operator new(24)
   *   movq %rax, %rbx ; movq %rax, %rdi ; movq %r14, %rsi
   *   callq __ZN11OZCurveNodeC2ERKS_  ; base copy ctor
   *   leaq  0x12a678f(%rip), %rax     ; rax = &vtable[0] @Flexo 0x1901108
   *                                     (0x65a972+7 + 0x12a678f = 0x1901108, same as ctor)
   *   movq  %rax, (%rbx)              ; new->vtable = ...
   *   movups 0x8(%r14), %xmm0         ; xmm0 = (this->shape, this->chan)
   *   movups %xmm0, 0x8(%rbx)         ; new->shape/chan = this->shape/chan
   *   movq  %rbx, %rax                ; return new
   *
   * EH landing pad @0x65a98d: if the base copy ctor throws, delete the raw allocation and
   * unwind — we model this via the natural JS throw propagation (no explicit delete needed).
   */
  cloneNode(): FFShapeCurveNode {
    // Match the "operator new + placement copy-ctor" idiom via the copy-ctor path.
    return new FFShapeCurveNode(this);  // shape+chan copied byte-for-byte via movups
  }

  /**
   * FFShapeCurveNode::compare(OZCurveNode const*) const  @Flexo 0x65a9f0.
   *
   * Body (verbatim, 7 lines):
   *   pushq %rbp ; movq %rsp,%rbp
   *   xorl %eax, %eax           ; return 0 (int32)
   *   popq %rbp ; retq
   *
   * All FFShapeCurveNode instances compare "equal" (returns 0 = equivalent) regardless of the
   * argument. This is likely a placeholder for the OZCurveNode virtual and effectively disables
   * dedup for shape-derived curve nodes.
   */
  compare(_other: OZCurveNode | null): number {
    return 0;                       // xorl %eax, %eax @0x65a9f4
  }

  /**
   * FFShapeCurveNode::getUForValue(double value, vector<CMTime>& times, PCTimeRange& range,
   *                                CMTime& u, unsigned int flags)  @Flexo 0x65aa00.
   *
   * Body (verbatim, 7 lines):
   *   pushq %rbp ; movq %rsp,%rbp
   *   xorl %eax, %eax           ; return 0
   *   popq %rbp ; retq
   *
   * Empty override — always returns 0 (no U values produced). FFShape does not support inverse
   * value→U lookup through this path; the caller falls back to the OZCurveNode base default
   * (empty times vector, u unchanged). Both output params (times, u) are LEFT UNTOUCHED — the
   * body does no writes.
   */
  getUForValue(
    _value: number,
    _times: CMTime[],
    _range: unknown,      // PCTimeRange — not yet transcribed
    _u: CMTime,
    _flags: number,
  ): number {
    return 0;                        // xorl %eax, %eax @0x65aa04
  }

  /**
   * FFShapeCurveNode::getNeededRange(OZCurveNodeParam* param)  @Flexo 0x65a9a0.
   *
   * Body (verbatim, 20 lines):
   *   pushq %rbp ; movq %rsp,%rbp
   *   movq %rsi, %rax           ; rax = param      (also returned)
   *   movq  0x70(%rsi), %rcx    ; rcx = param->+0x70    (u64)
   *   movq  %rcx, 0x28(%rsi)    ; param->+0x28  = rcx
   *   movups 0x60(%rsi), %xmm0  ; xmm0 = param->+0x60 (16 bytes, CMTime low)
   *   movups %xmm0, 0x18(%rsi)  ; param->+0x18  = xmm0
   *   movups 0x78(%rsi), %xmm0  ; xmm0 = param->+0x78 (16 bytes, CMTime high tail)
   *   movups %xmm0, 0x30(%rsi)  ; param->+0x30  = xmm0
   *   movq  0x88(%rsi), %rcx    ; rcx = param->+0x88
   *   movq  %rcx, 0x40(%rsi)    ; param->+0x40 = rcx
   *   movl  0x90(%rsi), %ecx    ; ecx = param->+0x90 (i32)
   *   movl  %ecx, 0x48(%rsi)    ; param->+0x48 = ecx
   *   movb  $0x0, 0x58(%rsi)    ; param->+0x58 = 0 (u8; "no adjustment")
   *   movq  0x98(%rsi), %rcx    ; rcx = param->+0x98
   *   movq  %rcx, 0x50(%rsi)    ; param->+0x50 = rcx
   *   popq %rbp ; retq          ; return `rax` (= param)
   *
   * Semantics (in the OZCurveNodeParam field vocabulary — see raw-port/src/nodes/OZCurveNodeParam.ts):
   *   The method COPIES the "wanted range" fields (+0x60..+0x9c) into the "needed range" fields
   *   (+0x18..+0x58), byte-for-byte, and clears the "needs adjustment" flag at +0x58 to zero. This
   *   is the base-case override: the shape has no opinion; the needed range EQUALS the wanted range.
   *
   *   The two `movups` copies each move 16 bytes at once (a full CMTime up to its epoch — the
   *   CMTime layout is {i64 value, i32 timescale, u32 flags, i64 epoch} = 24 bytes; the +0x70/+0x88
   *   single-qword copies then complete the tail). We honour this by copying whole CMTime structs
   *   at once (raw-port CMTime is a JS object; assigning by field preserves value identity).
   *
   * Returns the same pointer it was given (the disasm does `movq %rsi, %rax` before doing any
   * writes, and never modifies %rax afterward — so the mutated `param` is the returned value).
   */
  getNeededRange(param: OZCurveNodeParamRef): OZCurveNodeParamRef {
    // +0x28 = +0x70  (a u64 field — CMTime.epoch or trailing scalar)
    // (Modelled via OZCurveNodeParamRef aggregate fields — see interface above.)
    param.neededRangeLow      = param.wantedRangeLow;      // +0x18 = +0x60 (CMTime low)
    param.neededRangeHigh     = param.wantedRangeHigh;     // +0x30 = +0x78 (CMTime high)
    param.neededRangeTrailer  = param.wantedRangeTrailer;  // +0x40 = +0x88 (u64)
    param.neededRangeCount    = param.wantedRangeCount;    // +0x48 = +0x90 (i32)
    param.neededRangeExtra    = param.wantedRangeExtra;    // +0x50 = +0x98 (u64)
    param.neededAdjustmentFlag = 0;                         // +0x58 = 0 (u8)
    return param;                                           // rax was set to rsi at entry
  }
}
