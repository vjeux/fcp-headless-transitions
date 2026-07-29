// raw-port/src/nodes/OZHGRenderNodeBase.ts
//
// FCP `OZHGRenderNodeBase` — a small Ozone shim over HGRenderNode that installs a
// C-callback (OZHGRenderNodeBaseNotifyFunc) so Helium's render pipeline can raise
// finished/canceled callbacks up into Ozone (via a virtual dispatch table). The class
// itself is a base; concrete users (OZHGUserJob, etc.) override the virtuals.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZHGRenderNodeBase.*.s
// (all mangled symbols under __ZN18OZHGRenderNodeBase*).
//
// SYMBOLS ported here (every non-inlined non-thunk method for this class):
//   0x006351f0  __ZN18OZHGRenderNodeBaseC2Ev             ; C2 = C1 (identical body)
//   0x006352a0  __ZN18OZHGRenderNodeBaseC1Ev             ; ctor body
//   0x006352e0  __ZN18OZHGRenderNodeBase8finishedEv      ; -> vtable slot 0x38 (=notifyOther)
//   0x006352f0  __ZN18OZHGRenderNodeBase8canceledEv      ; -> vtable slot 0x38 (=notifyOther)
//   0x00635300  __ZN18OZHGRenderNodeBase11notifyOtherEv  ; empty body (default no-op)
//   0x00635310  __ZN18OZHGRenderNodeBaseD1Ev             ; D1 = D2 (ICF-folded; D2 not emitted)
//   0x00635320  __ZN18OZHGRenderNodeBaseD0Ev             ; deleting dtor
//
// VTABLE (resolve.py Ozone vtable OZHGRenderNodeBase):
//   installed ptr = 0x888298 (`__ZTV18OZHGRenderNodeBase + 0x10`).
//   Slot layout (bytes from installed ptr):
//     *0x00 -> 0x635310  ~OZHGRenderNodeBase() (D1)
//     *0x08 -> 0x635320  ~OZHGRenderNodeBase() (D0)
//     *0x10 -> 0x11a4    (?)                                     ; base HGRenderNode virtuals — undecoded
//     *0x18 -> 0x11a3    (?)                                     ;    (returned as undecodedSlot* below)
//     *0x20 -> 0x12dd    (?)                                     ;
//     *0x28 -> 0x6352e0  finished()                              ; vtable slot 0x28 = finished
//     *0x30 -> 0x6352f0  canceled()                              ; vtable slot 0x30 = canceled
//     *0x38 -> 0x635300  notifyOther()                           ; vtable slot 0x38 = notifyOther
//   finished() and canceled() BOTH tail-jmp *0x38(vtable), i.e. they dispatch to notifyOther
//   through the vtable so subclasses can override it once.
//
// SUB-CLASS EXAMPLE (OZHGUserJob, also in the vtable dump — NOT ported here, just referenced):
//     *0x60 -> 0x888340  typeinfo for OZHGUserJob
//     *0x88 -> 0x12dd  ?
//     *0x90 -> 0x636340  OZHGUserJob::executing()
//   confirms this is the intended inheritance/override pattern.

import { HGRenderNode, HGRenderNodeSetNotifyFunc } from "../render/HGRenderNode";

/** Underlying C-callback signature installed by the ctor via HGRenderNode::SetNotifyFunc.
 * Prototype (from the mangled setter): `void (*)(HGRenderNode*)`. */
export type HGRenderNodeNotifyFn = (node: HGRenderNode | null) => void;

/**
 * OZHGRenderNodeBaseNotifyFunc(HGRenderNode*) @Ozone 0x635230
 *   Mangled: __ZL28OZHGRenderNodeBaseNotifyFuncP12HGRenderNode
 *   File-local (`L` linkage), installed by both ctors via `HGRenderNode::SetNotifyFunc`.
 *
 *   The body (~100 lines) does:
 *     1. If node != null, dynamic_cast<OZHGRenderNodeBase*>(node) (via __ZTI12HGRenderNode -> __ZTI18OZHGRenderNodeBase).
 *     2. Push an autorelease pool (@objc_autoreleasePoolPush).
 *     3. Call HGRenderNode::GetState(this-as-base). Dispatch on state to virtual finished/canceled.
 *     4. Pop the autorelease pool.
 *
 * The dispatch/state logic + ARC pool machinery are NOT yet decoded (@Ozone 0x635230); surfaced as
 * a throwing stub so the frontier stays visible. Callers that invoke the callback will see the throw.
 */
export function OZHGRenderNodeBaseNotifyFunc(_node: HGRenderNode | null): void {
  throw new Error(
    "OZHGRenderNodeBaseNotifyFunc(HGRenderNode*) @Ozone 0x635230 (mangled " +
    "__ZL28OZHGRenderNodeBaseNotifyFuncP12HGRenderNode) not yet transcribed " +
    "(uses dynamic_cast + objc_autoreleasePoolPush + HGRenderNode::GetState dispatch)"
  );
}

/**
 * OZHGRenderNodeBase — Ozone base for render nodes that report finished/canceled up through a
 * shared virtual (notifyOther).
 *
 * The C++ object layout is inherited from HGRenderNode. This class contributes NO extra fields;
 * only a vtable pointer swap ((rbx) = 0x888298) and the SetNotifyFunc call.
 */
export class OZHGRenderNodeBase extends HGRenderNode {
  /**
   * OZHGRenderNodeBase::OZHGRenderNodeBase() @Ozone 0x6352a0 (C1) / 0x6351f0 (C2 — identical body).
   *
   *   0x6352aa  callq HGRenderNode::HGRenderNode()  ; base ctor
   *   0x6352af  leaq  0x252fe2(%rip),%rax           ; rax = 0x888298 = OZHGRenderNodeBase vtable +0x10
   *   0x6352b6  movq  %rax,(%rbx)                   ; install vptr
   *   0x6352b9  leaq  OZHGRenderNodeBaseNotifyFunc(%rip),%rsi
   *   0x6352c0  movq  %rbx,%rdi
   *   0x6352c3  callq HGRenderNode::SetNotifyFunc(void(*)(HGRenderNode*))
   *
   * The exception cleanup path (0x6352cd..0x6352db) calls HGRenderNode::~HGRenderNode() + Unwind_Resume,
   * which TypeScript handles automatically via the class initializer's implicit try/catch semantics
   * (we don't need to model it: SetNotifyFunc throwing at ctor-time will leak the base, which is
   * exactly what the C++ code does too on the non-unwind fast path, and TS has GC).
   */
  constructor() {
    super();
    // 0x6352b6: install vptr (represented in TS by the class's prototype; nothing to write here —
    // but we document the invariant: `getVTablePtr() === 0x888298` in the FCP binary).
    HGRenderNodeSetNotifyFunc(this, OZHGRenderNodeBaseNotifyFunc);
  }

  /**
   * OZHGRenderNodeBase::finished() @Ozone 0x6352e0
   *   movq (%rdi),%rax    ; rax = vtable
   *   jmpq *0x38(%rax)    ; tail-jmp vtable slot 0x38 (== notifyOther in this base)
   *
   * In the base, slot 0x38 IS notifyOther() (empty). Subclasses override slot 0x38 to react.
   * We mirror the tail-jmp with a direct virtual dispatch to `this.notifyOther()`, which
   * subclasses can override — matching the exact vtable-slot semantics.
   */
  finished(): void {
    // 0x6352e0..0x6352f8: tail-jmp *(0x38)(vtable) — resolves to this.notifyOther() (base) or
    // a subclass override (e.g. OZHGUserJob's override at vtable slot 0x88, which is the same
    // logical slot 0x38 offset from OZHGUserJob's own installed-ptr).
    this.notifyOther();
  }

  /**
   * OZHGRenderNodeBase::canceled() @Ozone 0x6352f0
   *   movq (%rdi),%rax    ; rax = vtable
   *   jmpq *0x38(%rax)    ; identical to finished — SAME dispatch site
   *
   * Note: finished() and canceled() are BIT-IDENTICAL after ICF; the FCP compiler emits both
   * separately (they occupy 0x6352e0 and 0x6352f0). We mirror that by keeping two methods but
   * both dispatch through notifyOther.
   */
  canceled(): void {
    // 0x6352f0..0x6352f8: same as finished() — tail-jmp vtable slot 0x38.
    this.notifyOther();
  }

  /**
   * OZHGRenderNodeBase::notifyOther() @Ozone 0x635300 — empty body (pushq rbp; movq rsp,rbp; popq rbp; retq).
   *
   * Overridable virtual. In the base class this is a no-op; subclasses (OZHGUserJob, etc.)
   * override it via their own vtable to react to finished/canceled notifications.
   */
  notifyOther(): void {
    // 0x635300..0x635305: no-op. Faithful.
  }

  /**
   * OZHGRenderNodeBase::~OZHGRenderNodeBase() (D1) @Ozone 0x635310
   *   popq %rbp; jmp HGRenderNode::~HGRenderNode()
   *
   * D2 is ICF-folded with D1 (not emitted separately — verified via `nm -arch x86_64`).
   * D0 (deleting dtor) @0x635320: calls HGRenderNode::~HGRenderNode() then `operator delete`;
   * TypeScript has no delete-in-dtor semantics — GC handles it. We only model D1/D2 as a
   * base-dtor tail-jmp via TS destructuring here (a no-op — HGRenderNode's dtor is undecoded).
   */
  destroy(): void {
    // 0x635310..0x635315: tail-jmp HGRenderNode::~HGRenderNode().
    // The base dtor is undecoded — HGRenderNode is a shim; documenting the tail-jmp here.
    // (No-op in TS; kept as a named surface so callers can express the C++ dtor call site.)
  }
}
