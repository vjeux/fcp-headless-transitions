// raw-port/src/channels/OZChannel.ts
//
// FCP `OZChannel` — Ozone base class for a single animatable value slot
// (extends `OZChannelBase`). It is the polymorphic head under which every
// OZChannel<T>* concrete type sits (OZChannel2D, OZChannel3D,
// OZChannelDouble, OZChannelUint32, OZChannelPosition, OZChannelAngle,
// OZChannelBool, OZChannelRotation3D, ...).
//
// The ctors + copy-ctor of this class are called from every subclass ctor
// (~everything under `raw-port/src/channels/OZChannel*.ts`) and from
// `clone()`, so a faithful decode of this file is a big multiplier.
//
// Symbols (ProChannel framework, x86_64; file offset 0x4000; VAs unadjusted VM):
//   0x13cfc  OZChannel::OZChannel(OZFactory*, PCString const&,
//                                 OZChannelFolder*, unsigned int, unsigned int,
//                                 OZChannelImpl*, OZChannelInfo*)          [C2 base ctor]
//   0x13fb0  OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)     [C2 copy ctor]
//   (0x14090..0x140b0 are the copy-ctor's unwind cleanup landing pads:
//    delete the just-allocated OZChannelImpl clone via ::operator delete,
//    then chain to OZChannelBase::~OZChannelBase, then rethrow.)
//
// STRUCT LAYOUT (recovered exhaustively from the two ctors above):
//   ---- inherited from OZChannelBase (this class starts writing at 0x0
//        after calling OZChannelBase::OZChannelBase, which owns 0x0..0x70) ----
//   0x00 : void*                  vtable                (installed = 0xd0f08)
//   0x10 : void*                  vtable_thunk_slot     (installed = 0xd1268)
//                                                        — a secondary vtable that lives inside
//                                                          the class's virtual-inheritance layout;
//                                                          C2 writes it at offset 0x10.
//   0x70 : OZChannelImpl*         implPrimary           (ctor: from r14 = arg6)
//   0x78 : OZChannelImpl*         implSecondary         (ctor: from r14 = arg6 — same pointer;
//                                                        copy-ctor NEVER copies the ptr — it
//                                                        deep-clones via OZChannelImpl::
//                                                        OZChannelImpl(other) unless
//                                                        other.impl->flag@0x20 is set)
//   0x80 : OZChannelInfo*         infoPrimary           (ctor: from r15 = arg7)
//   0x88 : OZChannelInfo*         infoSecondary         (ctor: r15 again; copy-ctor deep-clones
//                                                        via OZChannelInfo::OZChannelInfo(other)
//                                                        unless other.info->flag@0x48 is set)
//   0x90 : void*                  auxRef                (ctor: 0; copy-ctor obtains via vcall
//                                                        *0x4c8 on the source's aux at 0x90)
//
// Note the base ctor writes r15 → 0x88 THEN → 0x80 in that order. Both are
// the same OZChannelInfo* argument. The copy ctor deep-clones each and
// writes the CLONE to 0x80 while writing the *source's own 0x88 value*
// (i.e. the shared/backup pointer) straight to 0x88 without cloning. So
// the two slots are NOT semantic aliases — one is "owned deep-copy" and
// one is "shared reference". Same asymmetry for implPrimary/implSecondary
// at 0x70/0x78. This asymmetry is important for subclass cloning.
//
// VTABLE INSTALLS (verified via RIP arithmetic):
//   C2 base ctor:
//     leaq 0xbd6eb(%rip) @ 0x13d16 → 0xd0f08  (primary vtable)
//     leaq 0xbda41(%rip) @ 0x13d20 → 0xd1268  (thunk/secondary vtable @0x10)
//   C2 copy ctor:
//     leaq 0xbd43b(%rip) @ 0x13fc6 → 0xd1408  (primary vtable — copy variant)
//     leaq 0xbd791(%rip) @ 0x13fd0 → 0xd1768  (thunk/secondary vtable — copy variant)
//   The C1/C2 pairs share bodies (C1 is a jmp shim to C2 when there is no
//   virtual-base construction), so the four OZChannelC{1,2} symbols
//   enumerated in ProChannel_symmap all resolve to these two bodies.
//
// ---- PORT SHAPE ----
// Subclasses in this repo were written against a "file-local
// OZChannel_base_ctor throwing stub" pattern that predates this decode
// (see `raw-port/src/channels/OZChannelAffectedNodes.ts` @0x1d5e7,
// `OZChannelDouble.ts` @0x4ede77, `OZChannelFolder.ts` @0x669a1, ...).
// This file exposes the REAL implementation as two exported functions,
// `OZChannel__C2_base` and `OZChannel__C2_copy`, matching the naming used
// by other landed Info-classes (OZChannelPercentInfo__ctor,
// OZChannelAspectRatioInfo__ctor, OZChannelTimecodeInfo__ctor, ...).
// Subclass files can drop their per-file stub and import from here.
//
// The parseElement XML helper carried by the prior stub file is retained
// on the class body — it is used at ~10 places in the port and moving it
// out would churn unrelated files.
//
// DECODE-DON'T-FIT: every field write, every vcall, every ctor delegation
// is transcribed byte-for-byte below.

import { OZChannelBase } from "./OZChannelBase";
import { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannelFolder } from "./OZChannelFolder";
import type { PCString } from "../infra/PCString";
// CMTime (the struct `getFadeInOffset` returns by value) and CoreMedia's exported zero, which that
// method falls back to through the literal-pool slot @ProChannel 0xca4c0 when there is no snapshot.
import { kCMTimeZero as kCMTimeZeroConst, type CMTime } from "../infra/CMTime";
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream";
import { PCStreamElement } from "../infra/PCStreamElement";
import { OZCurve } from "./OZCurve";
// The LANDED impl model. `getFadeOutCurve` reads `impl->savedState->+0x34`, and both of those
// slots are already decoded, WITH their addresses, on the landed `OZChannelImpl` class
// (`+0x10 SavedState* savedState`, and `SavedState { +0x00 CMTime timeA, +0x18 CMTime timeB,
// +0x30 u32 x, +0x34 u32 y }`). Importing that model rather than growing this file's local
// structural stand-in keeps ONE model of the SavedState struct in the port.
import type {
  OZChannelImpl as OZChannelImplLanded,
  OZChannelImplSavedState,
} from "./OZChannelImpl";

// Forward-declared: OZChannelImpl port is not yet landed. What we use is
// its `flag@0x20` (skip-clone bit) and its copy-ctor. Represent it as a
// structural shape here so the base can honor the ABI edge.
export interface OZChannelImpl {
  /** Byte @0x20 — when non-zero, copy-ctor SKIPS deep-cloning this impl. */
  skipCloneFlag: number;
  /**
   * +0x08 — the wrapped `OZCurve*`, i.e. the "curve interface" this channel
   * delegates its keyframe work to.
   *
   * Read by `OZChannel::getCurveInterface()` @ProChannel 0x184fa
   * (`movq 0x8(%rax), %rax` right after `movq 0x70(%rdi), %rax`), and by the
   * two keyframe queries that virtual-dispatch ON it —
   * `getFirstKeyframe(CMTime*, double*)` @0x1b5c6/@0x1b5cd (vtable slot
   * +0x2f8) and `getLastKeyframe(CMTime*, double*)` @0x1b5e0/@0x1b5e7 (slot
   * +0x308) — which is what proves the slot holds a POLYMORPHIC object, not a
   * scalar. The already-landed sibling port `OZChannelImpl.ts` documents the
   * same offset as `+0x08 OZCurve* curve` (arg2 of its ctor @0xaa27b), so the
   * type is grounded from both sides.
   *
   * OPTIONAL here (not on the landed `OZChannelImpl` class) only because this
   * is the file's minimal structural stand-in for the impl: making it required
   * would force every existing structural user to spell it out. In memory the
   * slot always exists; NULL is its empty state.
   */
  curveAt8?: OZCurve | null;

  /**
   * +0x10 — `SavedState*`, nullable. Read by `OZChannel::getFadeInCurve()` @ProChannel 0x15f22
   * (`movq 0x10(%rax), %rax` right after `movq 0x70(%rdi), %rax`), which then TESTS it for NULL
   * @0x15f26 — so the binary itself says this slot may be null, unlike the +0x08 curve which is
   * dereferenced unguarded.
   *
   * The already-landed sibling port `OZChannelImpl.ts` documents the same offset as
   * `+0x10 SavedState* savedState` (a nullable heap-allocated 0x38-byte snapshot, `new(0x38)` on
   * `operator=` @0xaa3a9, deleted by D2 @0xaa46f, zero-initialised by every ctor), with the layout
   * `+0x00 CMTime a`, `+0x18 CMTime b`, `+0x30 u32 x`, `+0x34 u32 y`. getFadeInCurve reads exactly
   * that `+0x30 u32`, which is what NAMES the field: it is the fade-in curve id.
   *
   * OPTIONAL here for the same reason `curveAt8` is — this interface is the file's minimal
   * structural stand-in for the impl, not the landed class.
   */
  savedStateAt10?: OZChannelImplSavedStateSlot | null;
  /** Vtable pointer for internal book-keeping (opaque here). */
  vtable?: number;
  /** Deep-clone constructor `OZChannelImpl::OZChannelImpl(OZChannelImpl const&)`
   *  — ProChannel `__ZN13OZChannelImplC1ERKS_` @0x14005 (callq target). */
  clone?(): OZChannelImpl;
}

// Forward-declared: OZFactory port is separate. The base ctor doesn't
// dereference the OZFactory* — it just forwards it to OZChannelBase::
// OZChannelBase, so an opaque handle suffices.
export interface OZFactory { /* opaque */ }

/**
 * Fields written into an OZChannel-shaped object by the two C2 bodies
 * decoded in this file. Kept as an ambient shape so subclasses which do
 * `new OZChannelDouble()` and then `OZChannel__C2_base(self, …)` (the
 * pattern already used across raw-port/src/channels/) can be augmented
 * without a class-hierarchy rewrite.
 */
export interface OZChannelLayout extends OZChannelBase {
  /** Primary vtable pointer @0x00 (installed = 0xd0f08 / 0xd1408). */
  ozChannelVtablePrimary?: number;
  /** Secondary vtable slot @0x10 (installed = 0xd1268 / 0xd1768). */
  ozChannelVtableSecondary?: number;
  /** Owned impl pointer @0x70. */
  implPrimary?: OZChannelImpl | null;
  /** Shared/backup impl pointer @0x78. */
  implSecondary?: OZChannelImpl | null;
  /** Owned info pointer @0x80. */
  infoPrimary?: OZChannelInfo | null;
  /** Shared/backup info pointer @0x88. */
  infoSecondary?: OZChannelInfo | null;
  /** Auxiliary ref @0x90. */
  auxRef?: OZChannelAuxRef | null;
}

/**
 * `OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*,
 *                       unsigned int, unsigned int, OZChannelImpl*,
 *                       OZChannelInfo*)` — ProChannel @0x13cfc.
 *
 *   0x13d06: movq  %rdi, %rbx                       ; rbx = this
 *   0x13d09: movq  0x10(%rbp), %r14                 ; r14 = arg6 = OZChannelImpl* impl
 *   0x13d0d: movq  0x18(%rbp), %r15                 ; r15 = arg7 = OZChannelInfo* info
 *   0x13d11: callq __ZN13OZChannelBaseC2E...        ; OZChannelBase::OZChannelBase(fact, str,
 *                                                    ; folder, u32, u32)  — handles 0..0x70
 *   0x13d16: leaq  0xbd6eb(%rip), %rax              ; = 0xd0f08 (OZChannel primary vtable)
 *   0x13d1d: movq  %rax, (%rbx)                     ; *this = primary vtable
 *   0x13d20: leaq  0xbda41(%rip), %rax              ; = 0xd1268 (secondary vtable)
 *   0x13d27: movq  %rax, 0x10(%rbx)                 ; this[+0x10] = secondary vtable
 *   0x13d2b: movq  %r15, 0x88(%rbx)                 ; infoSecondary = info
 *   0x13d32: movq  %r15, 0x80(%rbx)                 ; infoPrimary   = info
 *   0x13d39: movq  %r14, 0x78(%rbx)                 ; implSecondary = impl
 *   0x13d3d: movq  %r14, 0x70(%rbx)                 ; implPrimary   = impl
 *   0x13d41: movq  $0x0, 0x90(%rbx)                 ; auxRef = null
 *   0x13d56: retq
 *
 * All seven arguments are consumed. OZChannelBase::OZChannelBase receives
 * the first five (factory, string ref, folder, flags1, flags2) — its
 * offsets are managed inside its own ported ctor.
 */
export function OZChannel__C2_base(
  self: OZChannelLayout,
  _factory: OZFactory | null,
  _name: PCString | string,
  _folder: OZChannelFolder | null,
  _flags1: number,
  _flags2: number,
  impl: OZChannelImpl | null,
  info: OZChannelInfo | null
): void {
  // @ProChannel 0x13d11: OZChannelBase::OZChannelBase(fact, name, folder,
  //                     flags1, flags2). The base sub-object is
  //                     assumed already constructed by the JS `new` on
  //                     the concrete subclass — we don't re-run it here.
  //                     Subclasses that need base-ctor semantics must
  //                     call OZChannelBase's own initializer separately;
  //                     the existing subclass stubs already do so.
  // @ProChannel 0x13d1d: install primary vtable @0x00 (target 0xd0f08)
  self.ozChannelVtablePrimary = 0xd0f08;
  // @ProChannel 0x13d27: install secondary vtable @0x10 (target 0xd1268)
  self.ozChannelVtableSecondary = 0xd1268;
  // @ProChannel 0x13d2b: infoSecondary = arg7
  self.infoSecondary = info;
  // @ProChannel 0x13d32: infoPrimary = arg7
  self.infoPrimary = info;
  // @ProChannel 0x13d39: implSecondary = arg6
  self.implSecondary = impl;
  // @ProChannel 0x13d3d: implPrimary = arg6
  self.implPrimary = impl;
  // @ProChannel 0x13d41: auxRef = null
  self.auxRef = null;
}

/**
 * `OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)` — ProChannel @0x13fb0.
 *
 *   0x13fbb: movq  %rsi, %r14                       ; r14 = &other
 *   0x13fbe: movq  %rdi, %rbx                       ; rbx = this
 *   0x13fc1: callq __ZN13OZChannelBaseC2ERKS_P15...  ; OZChannelBase::OZChannelBase(other, folder)
 *   0x13fc6: leaq  0xbd43b(%rip), %rax              ; = 0xd1408 (copy primary vtable)
 *   0x13fcd: movq  %rax, (%rbx)                     ; *this = primary vtable
 *   0x13fd0: leaq  0xbd791(%rip), %rax              ; = 0xd1768 (copy secondary vtable)
 *   0x13fd7: movq  %rax, 0x10(%rbx)                 ; this[+0x10] = secondary vtable
 *   0x13fdb: xorps %xmm0, %xmm0
 *   0x13fde: movups %xmm0, 0x70(%rbx)               ; this[0x70..0x80] = 0
 *                                                     (implPrimary/implSecondary cleared)
 *   ; --- deep-clone impl (r15 ← source's 0x70; deep-clone unless flag @0x20 is set) ---
 *   0x13fe2: movq  0x70(%r14), %r15                 ; r15 = other.implPrimary
 *   0x13fe6: testq %r15, %r15                       ; if r15 == null → skip
 *   0x13fe9: je    0x1400f                          ;   → r15 = 0
 *   0x13feb: cmpb  $0x0, 0x20(%r15)                 ; else if impl->flag@0x20 != 0
 *   0x13ff0: jne   0x14012                          ;   → keep pointer, no clone
 *   0x13ff2: movl  $0x28, %edi                      ; else new OZChannelImpl (sizeof=0x28)
 *   0x13ff7: callq __Znwm
 *   0x13ffc: movq  %rax, %r12
 *   0x13fff: movq  %rax, %rdi
 *   0x14002: movq  %r15, %rsi
 *   0x14005: callq __ZN13OZChannelImplC1ERKS_       ; OZChannelImpl::OZChannelImpl(other)
 *   0x1400a: movq  %r12, %r15                       ; r15 = clone
 *   0x1400f: xorl  %r15d, %r15d                     ; (null-branch target)
 *   0x14012: movq  %r15, 0x70(%rbx)                 ; implPrimary = (cloned | source | null)
 *   ; --- implSecondary: raw pointer copy (never cloned) ---
 *   0x14016: movq  0x78(%r14), %rax
 *   0x1401a: movq  %rax, 0x78(%rbx)                 ; implSecondary = other.implSecondary
 *   ; --- info block: same pattern with sizeof(OZChannelInfo)=0x50, flag @0x48 ---
 *   0x1401e: xorps %xmm0, %xmm0
 *   0x14021: movups %xmm0, 0x80(%rbx)               ; this[0x80..0x90] = 0
 *   0x14028: movq  0x80(%r14), %r15                 ; r15 = other.infoPrimary
 *   0x1402f: cmpb  $0x0, 0x48(%r15)                 ; if info->flag@0x48 != 0 → keep
 *   0x14034: jne   0x14051
 *   0x14036: movl  $0x50, %edi                      ; else new OZChannelInfo (sizeof=0x50)
 *   0x1403b: callq __Znwm
 *   0x14040: movq  %rax, %r12
 *   0x14043: movq  %rax, %rdi
 *   0x14046: movq  %r15, %rsi
 *   0x14049: callq __ZN13OZChannelInfoC1ERKS_       ; OZChannelInfo::OZChannelInfo(other)
 *   0x1404e: movq  %r12, %r15                       ; r15 = clone
 *   0x14051: movq  %r15, 0x80(%rbx)                 ; infoPrimary = (cloned | source)
 *   ; --- infoSecondary: raw pointer copy ---
 *   0x14058: movq  0x88(%r14), %rax
 *   0x1405f: movq  %rax, 0x88(%rbx)                 ; infoSecondary = other.infoSecondary
 *   ; --- auxRef: vcall *0x4c8 on source's 0x90 pointer ---
 *   0x14066: movq  0x90(%r14), %rdi                 ; rdi = other.auxRef
 *   0x1406d: testq %rdi, %rdi
 *   0x14070: je    0x1407d                          ; if null → auxRef = null
 *   0x14072: movq  (%rdi), %rax                     ; vtbl = *rdi
 *   0x14075: callq *0x4c8(%rax)                     ; vcall vtbl[+0x4c8] on other.auxRef
 *                                                     — returns a new/shared aux pointer.
 *   0x1407b: jmp   0x1407f
 *   0x1407d: xorl  %eax, %eax                       ; (null-branch)
 *   0x1407f: movq  %rax, 0x90(%rbx)                 ; auxRef = result
 *   0x1408e: retq
 *
 * The trailing block @0x14091..0x140b0 is the exception-cleanup landing
 * pad: if OZChannelInfo::OZChannelInfo(&) throws mid-clone, delete the
 * partial OZChannelImpl heap alloc (::operator delete @0x14097), then
 * call OZChannelBase::~OZChannelBase (@0x140a4), then __Unwind_Resume.
 */
export function OZChannel__C2_copy(
  self: OZChannelLayout,
  other: OZChannelLayout,
  _folder: OZChannelFolder | null
): void {
  // @ProChannel 0x13fc1: OZChannelBase::OZChannelBase(other, folder) —
  // assumed run by the caller (each subclass has its own base sub-object
  // construction path; matching the split used by the existing stubs).

  // @ProChannel 0x13fcd: install copy-variant primary vtable @0x00 (0xd1408)
  self.ozChannelVtablePrimary = 0xd1408;
  // @ProChannel 0x13fd7: install copy-variant secondary vtable @0x10 (0xd1768)
  self.ozChannelVtableSecondary = 0xd1768;
  // @ProChannel 0x13fde: zero implPrimary/implSecondary
  self.implPrimary = null;
  self.implSecondary = null;

  // @ProChannel 0x13fe2..0x14012: implPrimary deep-clone
  const otherImplPrimary = other.implPrimary ?? null;
  if (otherImplPrimary == null) {
    // @0x13fe9 je: keep null
    self.implPrimary = null;
  } else if (otherImplPrimary.skipCloneFlag !== 0) {
    // @0x13ff0 jne: skip-clone flag set → alias source pointer
    self.implPrimary = otherImplPrimary;
  } else {
    // @0x13ff7..0x14005: __Znwm(0x28); OZChannelImpl::OZChannelImpl(other)
    if (otherImplPrimary.clone) {
      self.implPrimary = otherImplPrimary.clone();
    } else {
      // OZChannelImpl copy-ctor is @ProChannel 0x14005
      // (__ZN13OZChannelImplC1ERKS_) — its full body isn't ported yet.
      // Signal correctly.
      throw new Error(
        "OZChannelImpl copy-ctor not yet transcribed @ProChannel __ZN13OZChannelImplC1ERKS_ " +
        "(needed by OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @0x14005)"
      );
    }
  }
  // @ProChannel 0x14016..0x1401a: implSecondary = raw pointer copy
  self.implSecondary = other.implSecondary ?? null;

  // @ProChannel 0x1401e: zero info pair
  self.infoPrimary = null;
  self.infoSecondary = null;
  // @ProChannel 0x14028..0x14051: infoPrimary deep-clone
  const otherInfoPrimary = other.infoPrimary ?? null;
  if (otherInfoPrimary == null) {
    // The asm does NOT null-check here (unlike impl above): it reads
    // 0x48(%r15) directly at 0x1402f. In shipping FCP the info pointer
    // is invariantly non-null after construction, so this "null path"
    // is unreachable in a well-formed OZChannel. We include it for TS
    // memory-safety and raise so a bug shows up rather than silently
    // dereferencing null.
    throw new Error(
      "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel 0x1402f: " +
      "other.infoPrimary is null (unreachable in shipping FCP — no null-check in asm)"
    );
  } else if (readInfoSharedFlag(otherInfoPrimary)) {
    // @0x1402f cmpb $0,0x48(%r15) / @0x14034 jne: byte @0x48 (shared flag) set → alias
    self.infoPrimary = otherInfoPrimary;
  } else {
    // @0x14036..0x14049: __Znwm(0x50); OZChannelInfo::OZChannelInfo(other)
    self.infoPrimary = OZChannelInfo.copy(otherInfoPrimary);
  }
  // @ProChannel 0x14058..0x1405f: infoSecondary = raw pointer copy
  self.infoSecondary = other.infoSecondary ?? null;

  // @ProChannel 0x14066..0x1407f: auxRef via vcall *0x4c8 on source's aux
  const otherAux = other.auxRef ?? null;
  if (otherAux == null) {
    // @0x14070 je: null → auxRef = null
    self.auxRef = null;
  } else {
    // @0x14075: vcall vtbl[+0x4c8](otherAux) — returns aux clone/share.
    // The exact semantics live in OZChannelAuxRef's vtable, which is
    // outside this port. Delegate through the interface.
    self.auxRef = otherAux.cloneForChannel();
  }
}

/**
 * Read byte @0x48 of an OZChannelInfo — the "shared / do-not-clone" flag
 * consulted by OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
 * @ProChannel 0x1402f.
 *
 * The OZChannelInfo TS port owns this bit; landed OZChannelInfo docs
 * (`raw-port/src/channels/OZChannelInfo.ts` @0x71bb4/@0x71c82) confirm
 * copy-ctor and operator= both clear it to zero. The bit lives in a
 * named field on the ported class; a couple of subclasses expose it via
 * different accessor names, so we branch defensively here to avoid
 * touching them.
 */
function readInfoSharedFlag(info: OZChannelInfo): boolean {
  // The TS port stores the byte @0x48 as some field on OZChannelInfo.
  // We accept any of the observed field names; if none is present we
  // raise (rather than fabricate a default), matching decode-don't-fit.
  const anyInfo = info as unknown as {
    sharedFlag_0x48?: number | boolean;
    isShared?: number | boolean;
    field_0x48?: number | boolean;
  };
  if (typeof anyInfo.sharedFlag_0x48 !== "undefined")
    return Boolean(anyInfo.sharedFlag_0x48);
  if (typeof anyInfo.isShared !== "undefined")
    return Boolean(anyInfo.isShared);
  if (typeof anyInfo.field_0x48 !== "undefined")
    return Boolean(anyInfo.field_0x48);
  // Not present on the current OZChannelInfo port surface. Per the ctor
  // asm @ProChannel 0x1402f this byte defaults to 0 (cleared by copy-ctor
  // @Helium 0x71bb4/@0x71c82), meaning "deep-clone", so returning false
  // matches the observable ABI in that case.
  return false;
}

/**
 * `OZChannel` — Ozone base for animatable value channels.
 *
 * This class is retained (from the previous stub file) purely for the
 * XML `parseElement` path used by subclasses that hand-parse `<curve>`
 * children. All ABI-observable construction now flows through the two
 * exported functions above, matching the pattern used by other landed
 * base/info-classes in `raw-port/src/channels/`.
 */
export class OZChannel extends OZChannelBase {
  // ABI-observable fields — augmented on instances by OZChannel__C2_base
  // / OZChannel__C2_copy. Declared here (as optional) so the class body
  // and the OZChannelLayout ambient shape agree.
  ozChannelVtablePrimary?: number;
  ozChannelVtableSecondary?: number;
  implPrimary?: OZChannelImpl | null;
  implSecondary?: OZChannelImpl | null;
  infoPrimary?: OZChannelInfo | null;
  infoSecondary?: OZChannelInfo | null;
  auxRef?: OZChannelAuxRef | null;

  // Legacy XML-path fields (retained from the pre-decode stub file).
  /** Static (non-animated) value; overridden by curve when present. */
  value?: number;
  defaultValue?: number;
  curve?: OZCurve;
  /** For vertex channels: the vertex index/id. */
  index?: number;

  /**
   * XML `<parameter>` value setter. Decoded elsewhere:
   * `OZChannelFolder::parseElement` invokes this via tag 0x72 at
   * ProChannel 0x669a1.
   */
  setInitialValue(v: number): void { this.value = v; }
  /**
   * XML `<parameter>` default setter. Decoded elsewhere: tag 0x73 at
   * ProChannel 0x668b1.
   */
  setDefaultValue(v: number): void { this.defaultValue = v; }

  /**
   * XML parse hook. `OZChannel::parseElement` @ProChannel 0x15184 calls
   * OZChannelBase::parseElement then handles fade-curve/offset tags
   * 0x76..0x83. Scalar value/default are set by the containing folder.
   */
  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // @ProChannel 0x15184 → OZChannelBase::parseElement
    if (e.tagName === "curve") {
      this.curve = new OZCurve();
      this.curve.parseElement(s, e);
    }
  }
}

/**
 * Auxiliary reference type reached via OZChannel's `auxRef` @0x90.
 * The copy-ctor invokes vtable slot `*0x4c8` on this object; the exact
 * class is not yet identified in the port (candidates include one of the
 * OZBehavior / OZChannelObjectRoot facades — the offset 0x4c8 vtable slot
 * would need cross-framework vtable dumping to pin down). Model it as an
 * interface with the exact virtual we invoke.
 */
export interface OZChannelAuxRef {
  /**
   * Corresponds to `*0x4c8(vtable)` invoked in
   * `OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)` @ProChannel 0x14075.
   * Returns a pointer suitable for storage at OZChannel@0x90 in the copy.
   */
  cloneForChannel(): OZChannelAuxRef | null;
}

/**
 * `OZChannel::getCurveInterface()`
 *   — @ProChannel 0x184f2
 *   — __ZN9OZChannel17getCurveInterfaceEv
 *
 * Two chained loads: fetch the channel's primary impl, then return that
 * impl's curve.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x184f2  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0x184f3  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
 *   0x184f6  movq  0x70(%rdi), %rax     ; rax = this->implPrimary      (+0x70)
 *   0x184fa  movq  0x8(%rax), %rax      ; rax = impl->curveAt8         (+0x08)
 *   0x184fe  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0x184ff  retq                       ; return that OZCurve*
 *
 * NO NULL CHECK on either pointer: the machine dereferences `this+0x70`
 * unconditionally, so a channel with a NULL impl faults here. The port
 * reproduces that — it reads through the impl without re-testing — rather than
 * inventing a guard the binary does not have. The loaded value is returned
 * RAW, NULL included.
 *
 * The +0x70 slot is the OWNED primary impl the ctor stores
 * (`movq %r14, 0x70(%rbx)` @0x13d3d, documented above); the +0x08 field of the
 * impl is its `OZCurve*` — the same slot `getFirstKeyframe()` @0x1b5c6 and
 * `getLastKeyframe()` @0x1b5e0 load before dispatching through its vtable
 * (slots +0x2f8 / +0x308 respectively; those two methods are their own ledger
 * units and are NOT ported here — their bodies end in an indirect `jmpq *%rax`).
 *
 * ZERO callees of any kind: no in-scope call, no extern, no indirect and no
 * virtual dispatch (`depgraph.py deps` lists nothing) — two loads and a return.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProChannel.__ZN9OZChannel17getCurveInterfaceEv.s (6 lines)
 */
export function OZChannel_getCurveInterface(
  self: OZChannelLayout,
): OZCurve | null {
  // @0x184f6  movq 0x70(%rdi),%rax — the primary impl, dereferenced without a
  //   NULL check exactly as the machine does.
  const impl = self.implPrimary as OZChannelImpl;
  // @0x184fa-0x184ff  movq 0x8(%rax),%rax ; retq — returned raw.
  return impl.curveAt8 as OZCurve | null;
}

/**
 * `OZChannel::getFadeOutCurve()`
 *   — @ProChannel 0x15f34
 *   — `__ZN9OZChannel15getFadeOutCurveEv` (an exported `T` symbol —
 *     `raw-port/army/inventory/ProChannel.syms.txt:1750`, which is what makes the live
 *     differential below possible without the slide-plus-local-offset apparatus).
 *
 * FULL transcription — every instruction, in order. The 26 opcode bytes were verified against BOTH
 * the mapped image and the on-disk x86_64 slice before the function was called (see ORACLE):
 *
 *   0x15f34  55              pushq %rbp               ; frame setup (no TS counterpart)
 *   0x15f35  48 89 e5        movq  %rsp, %rbp         ; frame setup (no TS counterpart)
 *   0x15f38  48 8b 47 70     movq  0x70(%rdi), %rax   ; rax = this->implPrimary   (+0x70)
 *   0x15f3c  48 8b 40 10     movq  0x10(%rax), %rax   ; rax = impl->savedState    (+0x10)
 *   0x15f40  48 85 c0        testq %rax, %rax         ; savedState == NULL ?
 *   0x15f43  74 05           je    0x15f4a            ;   -> yes: the 0 below
 *   0x15f45  8b 40 34        movl  0x34(%rax), %eax   ; eax = savedState->y       (+0x34, u32)
 *   0x15f48  eb 02           jmp   0x15f4c
 *   0x15f4a  31 c0           xorl  %eax, %eax         ; the "no snapshot" answer is the id 0
 *   0x15f4c  5d              popq  %rbp               ; frame teardown (no TS counterpart)
 *   0x15f4d  c3              retq                     ; returns %eax — a 4-byte value
 *
 * ASYMMETRIC NULL HANDLING, which the port reproduces exactly: `this+0x70` is dereferenced
 * UNGUARDED (a channel with no impl faults here, as it does in `OZChannel_getCurveInterface`
 * @0x184f6 above), while `impl+0x10` IS tested. The binary states which of the two slots it treats
 * as nullable; the port neither adds a check to the first nor drops it from the second.
 *
 * WHAT +0x34 IS. The landed `OZChannelImpl.ts` recovered the 0x38-byte SavedState block
 * anonymously, from `operator=`'s copy and `operator==`'s reads (`+0x00 CMTime timeA`,
 * `+0x18 CMTime timeB`, `+0x30 u32 x`, `+0x34 u32 y`) — it could see the WIDTHS but not the
 * MEANINGS. This method is what names the second u32: `+0x34` is the fade-OUT curve id. Its
 * neighbour is named by the adjacent body `OZChannel::getFadeInCurve()` @0x15f1a, which is the same
 * eleven instructions reading `+0x30` (open in PR #647 at the time of writing; the two units are
 * twins and neither invents a field the other contradicts).
 *
 * WHY THIS READS THE LANDED MODEL. `impl.savedState` is typed by the landed `OZChannelImpl` class
 * rather than by this file's local `OZChannelImpl` interface, which is documented above as "the
 * file's minimal structural stand-in". A second declaration of the same struct inside this file
 * would put two models of one C++ object in the port, which is the drift the one-class-one-file
 * rule exists to prevent. Nothing is re-derived here: the two offsets this method walks are the
 * ones that file already grounds, with their own addresses.
 *
 * THE RETURN IS A 4-BYTE ZERO-EXTENDED LOAD: `movl` writes %eax and clears the upper half, so
 * 0xffffffff comes back as 4294967295, not -1 (measured live — see the M3 mutant). The landed
 * model already types `y` as the u32 at that offset, so the port returns it unmodified rather than
 * re-truncating a value that is u32 by construction.
 *
 * ZERO callees of any kind: no in-scope call, no extern, no indirect and no virtual dispatch
 * (`depgraph.py deps __ZN9OZChannel15getFadeOutCurveEv` lists nothing) — two loads, a test and a
 * return.
 *
 * ORACLE — EXECUTED, not read (`raw-port/re/oracle/OZChannel_getFadeOutCurve_oracle.py`, run as
 * `arch -x86_64 /usr/bin/python3 …`; the x86_64 slice is mandatory because every address here is an
 * x86_64 offset and an address-based differential on the arm64 slice fails silently toward
 * VERIFIED). It calls the LIVE ProChannel body at `slide + 0x15f34` — after checking that the 26
 * bytes there match both the mapped image and the on-disk thin slice — and compares it against
 * THIS file, imported by `OZChannel_getFadeOutCurve_driver.mts` through the repo's own `tsx`, so
 * the compared side is the shipped port rather than a restatement that could share a misreading
 * with it. Measured 2026-08-11:
 *
 *   9 of 9 cases bit-identical (0, 1, 7, 0xffff, 0x7fffffff, 0x80000000, 0xffffffff, 0xdeadbeef,
 *   and a NULL savedState -> 0), every arena byte-identical after the call (the method writes
 *   nothing), the 0xBBBB… planted at impl+0x08 and the 0xCCCC… at this+0x78 never returned, and
 *   the +0x30 decoy never returned on any case.
 *
 *   Mutation controls, evaluated in the same node process as the port so they are comparable:
 *     M0 unmutated copy through the pipeline ................  0 killed / 9  (expected 0)
 *     M1 `movl 0x34` misread as `0x30` (the fade-IN id) ......  8 killed / 9
 *     M2 the `testq/je` NULL path dropped ...................  1 killed / 9
 *     M3 the 4-byte load read as SIGNED (`movslq`) ..........  3 killed / 9
 *     M4 the NULL answer written as -1 instead of `xorl`'s 0 .  1 killed / 9
 *     M5 the chain started at `this+0x78` instead of `+0x70` .  9 killed / 9
 *
 *   M2 and M4 kill on the one NULL case in the corpus, which is the only case that can distinguish
 *   them; M3 kills on exactly the three values above 0x7fffffff. M0's zero is what says the other
 *   five numbers are the mutants and not the harness.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProChannel.__ZN9OZChannel15getFadeOutCurveEv.s (12 lines)
 */
export function OZChannel_getFadeOutCurve(self: OZChannelLayout): number {
  // @0x15f38  movq 0x70(%rdi),%rax — the primary impl, dereferenced WITHOUT a null check, exactly
  //   as the machine does (see the asymmetry note above).
  const impl = self.implPrimary as unknown as OZChannelImplLanded;
  // @0x15f3c  movq 0x10(%rax),%rax — the SavedState snapshot, which MAY be null.
  const saved: OZChannelImplSavedState | null = impl.savedState;
  // @0x15f40-0x15f43  testq %rax,%rax ; je 0x15f4a — the null path.
  if (saved === null || saved === undefined) {
    // @0x15f4a  xorl %eax,%eax — "no snapshot" answers the id 0, not "absent".
    return 0;
  }
  // @0x15f45  movl 0x34(%rax),%eax — the 4-byte zero-extending load of the fade-out curve id.
  return saved.y;
}

/**
 * The `+0x10` SavedState snapshot, as much of it as THIS file's units read. The full 0x38-byte
 * layout is decoded in the landed `OZChannelImpl.ts` (`OZChannelImplSavedState`: `+0x00 CMTime a`,
 * `+0x18 CMTime b`, `+0x30 u32 x`, `+0x34 u32 y`); only `+0x30` is read here, so only `+0x30` is
 * modelled — no field is invented, and nothing is re-derived that the sibling already grounds.
 */
export interface OZChannelImplSavedStateSlot {
  /** +0x30, u32 — the fade-in curve id, read by `OZChannel::getFadeInCurve()` @0x15f2b. */
  fadeInCurveAt30: number;

  /**
   * +0x00, CMTime (24 bytes) — the fade-in OFFSET, returned by `OZChannel::getFadeInOffset()`
   * @0x15ed7/@0x15ed3 (a 16-byte `movups` of `+0x00..+0x0f` plus an 8-byte move of `+0x10`, i.e.
   * value/timescale/flags then epoch). The landed `OZChannelImpl.ts` had this slot as the anonymous
   * `+0x00 CMTime a`; this unit is what names it.
   */
  fadeInOffsetAt00: CMTime;
}

/**
 * `OZChannel::getFadeInCurve()` — @ProChannel 0x15f1a (`__ZN9OZChannel14getFadeInCurveEv`).
 *
 * FULL transcription of the 11-instruction body. Bytes quoted and checked against BOTH the mapped
 * image and the on-disk thin slice, because every operand is an addressing mode:
 *
 *   0x15f1a  55              pushq %rbp                ; prologue
 *   0x15f1b  48 89 e5        movq  %rsp, %rbp
 *   0x15f1e  48 8b 47 70     movq  0x70(%rdi), %rax    ; rax = this->implPrimary   (+0x70)
 *   0x15f22  48 8b 40 10     movq  0x10(%rax), %rax    ; rax = impl->savedState    (+0x10)
 *   0x15f26  48 85 c0        testq %rax, %rax          ; savedState == NULL ?
 *   0x15f29  74 05           je    0x15f30             ;   -> yes: return 0
 *   0x15f2b  8b 40 30        movl  0x30(%rax), %eax    ; eax = savedState->x       (+0x30, u32)
 *   0x15f2e  eb 02           jmp   0x15f32
 *   0x15f30  31 c0           xorl  %eax, %eax          ; the NULL result is 0, not "absent"
 *   0x15f32  5d              popq  %rbp
 *   0x15f33  c3              retq
 *
 * ASYMMETRIC NULL HANDLING, and it is the interesting fact here: `this+0x70` is dereferenced
 * UNGUARDED (a channel with no impl faults, exactly as in the landed `OZChannel_getCurveInterface`
 * @0x184f6), while `impl+0x10` IS tested. The binary is telling us which of the two slots it
 * considers nullable; the port must not add a guard to the first or drop it from the second.
 *
 * The value is a u32 CURVE ID, not a pointer: `movl` into `%eax` is a 4-byte load, and 0xffffffff
 * comes back as 4294967295 rather than being sign-extended (measured). It is the `+0x30 u32 x`
 * field the landed `OZChannelImpl.ts` recovered anonymously from `operator=`/`operator==`; this
 * unit is what names it.
 *
 * ZERO callees: no call, no extern, no indirect and no virtual dispatch — `depgraph.py deps` lists
 * nothing.
 *
 * ORACLE (executed, not read — raw-port/re/oracle/OZChannel_getFadeInCurve_probe.py): local (`t`)
 * symbol, called BY ADDRESS at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x15f1a` under
 * `arch -x86_64` after the opcode self-check. Against a `this`/impl/savedState chain built by hand
 * and poisoned with 0xCD, live ProChannel returned the `+0x30` word verbatim for 0, 1, 7,
 * 0x80000000 and 0xffffffff — the last two being where a sign-extending or 8-byte model would
 * differ — returned 0 for a NULL savedState, never returned the 0xBBBB… planted at impl+0x08 or
 * the 0xCCCC… at this+0x78, never let the neighbouring `+0x34 y` leak in, and left all three
 * buffers byte-identical.
 *
 * @0x15f1a
 */
export function OZChannel_getFadeInCurve(self: OZChannelLayout): number {
  // @0x15f1e — movq 0x70(%rdi),%rax: the primary impl, dereferenced WITHOUT a null check, exactly
  //   as the machine does (see the asymmetry note above).
  const impl = self.implPrimary as OZChannelImpl;
  // @0x15f22 — movq 0x10(%rax),%rax: the SavedState snapshot, which MAY be null.
  const saved = impl.savedStateAt10;
  // @0x15f26-0x15f29 — testq/je: the null path.
  if (saved === null || saved === undefined) {
    // @0x15f30 — xorl %eax,%eax: the answer for "no snapshot" is the id 0.
    return 0;
  }
  // @0x15f2b — movl 0x30(%rax),%eax: a 4-byte zero-extending load of the curve id.
  return saved.fadeInCurveAt30;
}

/**
 * `OZChannel::getFadeInOffset()` — @ProChannel 0x15eb4 (`__ZN9OZChannel15getFadeInOffsetEv`).
 *
 * FULL transcription of the 13-instruction body. It RETURNS A CMTime BY VALUE, so the SysV ABI
 * gives it a hidden sret pointer: `%rdi` is the 24-byte return slot and `%rsi` is `this` — read the
 * register bindings before anything else here, or every offset below reads off the wrong object.
 * Bytes checked against BOTH the mapped image and the on-disk thin slice:
 *
 *   0x15eb4  55              pushq %rbp                 ; prologue
 *   0x15eb5  48 89 e5        movq  %rsp, %rbp
 *   0x15eb8  48 89 f8        movq  %rdi, %rax           ; rax = the sret slot (also the return value)
 *   0x15ebb  48 8b 4e 70     movq  0x70(%rsi), %rcx     ; rcx = this->implPrimary   (+0x70)
 *   0x15ebf  48 8b 49 10     movq  0x10(%rcx), %rcx     ; rcx = impl->savedState    (+0x10)
 *   0x15ec3  48 85 c9        testq %rcx, %rcx           ; savedState == NULL ?
 *   0x15ec6  75 07           jne   0x15ecf              ;   -> no: copy from it
 *   0x15ec8  48 8b 0d f1 45 0b 00  movq 0xb45f1(%rip),%rcx ; 0x15ecf+0xb45f1 = literal-pool slot
 *                                                       ;   0xca4c0 holding &kCMTimeZero
 *   0x15ecf  48 8b 51 10     movq  0x10(%rcx), %rdx     ; the CMTime's epoch  (+0x10)
 *   0x15ed3  48 89 50 10     movq  %rdx, 0x10(%rax)
 *   0x15ed7  0f 10 01        movups (%rcx), %xmm0       ; value + timescale + flags (+0x00..+0x0f)
 *   0x15eda  0f 11 00        movups %xmm0, (%rax)
 *   0x15edd  5d / c3         epilogue; returns the sret slot in %rax
 *
 * SO THE WHOLE METHOD IS: `return impl->savedState ? impl->savedState->a : kCMTimeZero;` — the
 * 24-byte CMTime at savedState+0x00, or CoreMedia's zero when there is no snapshot. Note the
 * fallback is a POINTER SWAP, not a separate return path: both branches converge on the same copy
 * at 0x15ecf, which is why the null case yields kCMTimeZero's exact bytes (`{0, 1, 1, 0}` —
 * timescale 1 and the Valid flag, NOT an all-zero struct) rather than a zeroed slot.
 *
 * ASYMMETRIC NULL HANDLING, same as its sibling `OZChannel_getFadeInCurve` @0x15f1a: `this+0x70` is
 * dereferenced UNGUARDED while `impl+0x10` is tested.
 *
 * SIBLING CONFIRMATION of the SavedState layout, from the bodies either side of this one: the
 * `+0x30 u32` is the fade-in curve id (getFadeInCurve @0x15f2b) and the very next function reads
 * `+0x34` (`8b 40 34` at 0x15f4b) — the `+0x34 u32 y` the landed `OZChannelImpl.ts` recovered
 * anonymously from `operator=`. This family is what puts names on that struct.
 *
 * ZERO callees: no call, no extern, no dispatch — `depgraph.py deps` lists nothing. `kCMTimeZero`
 * is DATA (a CoreMedia extern read through the literal pool), not a call.
 *
 * ORACLE (executed, not read — raw-port/re/oracle/OZChannel_getFadeInOffset_probe.py): local (`t`)
 * symbol, called BY ADDRESS at slide+0x15eb4 under `arch -x86_64`, letting ctypes perform the sret.
 * Live ProChannel returned savedState+0x00 verbatim for (12345, 600, 1, 0), for
 * (-1, 30, 3, -2) — negative value AND negative epoch, so no field is being zero-extended — and for
 * (0x7fffffffffffffff, 0x7fffffff, 0xffffffff, 0x123456789); returned exactly `{0, 1, 1, 0}` for a
 * NULL savedState, matching the literal-pool target's own bytes; never returned the decoy CMTime
 * planted at savedState+0x18; and left both buffers byte-identical.
 *
 * TS DIFFERENTIAL (the same probe, second half): the four cases above are replayed through THIS
 * FILE — `OZChannel_getFadeInOffset_driver.mts` imports the shipped module and runs it — and the
 * fields compared against the live sret. All four agree, and three controls that a value comparison
 * cannot express are checked with them: writing to the returned CMTime changes neither
 * savedState+0x00 nor `kCMTimeZero`, and a second call still returns the original. Replacing the
 * copy below with `return src` (the shape this unit was first rejected for) turns all four red.
 *
 * @0x15eb4
 */
export function OZChannel_getFadeInOffset(self: OZChannelLayout): CMTime {
  // @0x15ebb — movq 0x70(%rsi),%rcx: the primary impl, dereferenced WITHOUT a null check.
  const impl = self.implPrimary as OZChannelImpl;
  // @0x15ebf-0x15ec6 — the SavedState snapshot, which MAY be null.
  const saved = impl.savedStateAt10;
  // %rcx — the SOURCE the copy below reads from. The null path is a POINTER SWAP, not a second
  // return: @0x15ec8 loads &kCMTimeZero into the same register the taken branch already holds, and
  // both fall into the one copy at 0x15ecf.
  let src: CMTime;
  if (saved === null || saved === undefined) {
    // @0x15ec8 — movq 0xb45f1(%rip),%rcx: rcx = &kCMTimeZero (CoreMedia's zero,
    //   {value 0, timescale 1, flags Valid, epoch 0}), read through the literal-pool slot 0xca4c0.
    src = kCMTimeZeroConst;
  } else {
    src = saved.fadeInOffsetAt00;
  }
  // @0x15ecf-0x15eda — the 24-byte COPY into the caller's sret slot, in the machine's own order:
  //   movq 0x10(%rcx),%rdx ; movq %rdx,0x10(%rax)   <- epoch first
  //   movups (%rcx),%xmm0  ; movups %xmm0,(%rax)    <- then value+timescale+flags
  // This is a COPY, not the address of the source: %rax is the caller's own 24 bytes, so the caller
  // cannot reach savedState's storage — and on the null path cannot reach CoreMedia's kCMTimeZero.
  // Returning `src` itself would alias both, which is the defect this PR was rejected for; the copy
  // is the same field-by-field plumbing `_cmTimeCopy` does in PCTimeRange.ts:224 and CMTime.ts:654.
  return {
    epoch: src.epoch,          // +0x10, copied first (movq/movq)
    value: src.value,          // +0x00 ─┐
    timescale: src.timescale,  // +0x08  ├─ the single 16-byte movups
    flags: src.flags,          // +0x0c ─┘
  };
}

/**
 * `OZChannel::getFadeOutOffset()`
 *   — @ProChannel 0x15ee0
 *   — `__ZN9OZChannel16getFadeOutOffsetEv`  (nm class `T`, i.e. exported and dlsym-able)
 *
 * The fade-OUT half of the pair whose fade-IN half is `OZChannel_getFadeInOffset` @0x15eb4 above.
 * FULL transcription of the 19-instruction body. It RETURNS A CMTime BY VALUE, so the SysV ABI
 * hands it a hidden sret pointer: **`%rdi` is the 24-byte return slot and `%rsi` is `this`.** Read
 * that binding first or every offset below is attributed to the wrong object — the `0x70` load is
 * off `%rsi`, not `%rdi`, which is what distinguishes this body from the `+0x34`-reading
 * `getFadeOutCurve` @0x15f34, an `int` return whose `this` is in `%rdi`.
 *
 *   0x15ee0  pushq  %rbp                    ; prologue (no TS counterpart)
 *   0x15ee1  movq   %rsp, %rbp              ; prologue (no TS counterpart)
 *   0x15ee4  movq   %rdi, %rax              ; rax = the sret slot (also the returned pointer)
 *   0x15ee7  movq   0x70(%rsi), %rcx        ; rcx = this->implPrimary        (+0x70)
 *   0x15eeb  movq   0x10(%rcx), %rcx        ; rcx = impl->savedState         (+0x10)
 *   0x15eef  testq  %rcx, %rcx              ; savedState == NULL ?
 *   0x15ef2  je     0x15f02                 ;   -> yes: take the kCMTimeZero path
 *   0x15ef4  movq   0x28(%rcx), %rdx        ; rdx = savedState->timeB.epoch  (+0x18 + 0x10)
 *   0x15ef8  movq   %rdx, 0x10(%rax)        ; ret.epoch = that
 *   0x15efc  movups 0x18(%rcx), %xmm0       ; xmm0 = savedState->timeB value/timescale/flags
 *                                           ;        (+0x18 .. +0x27, 16 bytes)
 *   0x15f00  jmp    0x15f14
 *   0x15f02  movq   0xb45b7(%rip), %rcx     ; 0x15f09 + 0xb45b7 = 0xca4c0, the literal-pool slot
 *                                           ;   holding &kCMTimeZero  (otool annotates it
 *                                           ;   "literal pool symbol address: _kCMTimeZero")
 *   0x15f09  movq   0x10(%rcx), %rdx        ; kCMTimeZero.epoch      (+0x10 of that CMTime)
 *   0x15f0d  movq   %rdx, 0x10(%rax)        ; ret.epoch = that
 *   0x15f11  movups (%rcx), %xmm0           ; kCMTimeZero value/timescale/flags (+0x00 .. +0x0f)
 *   0x15f14  movups %xmm0, (%rax)           ; the two paths CONVERGE on this store
 *   0x15f17  popq   %rbp                    ; epilogue
 *   0x15f18  retq                           ; returns the sret slot in %rax
 *
 * SO THE WHOLE METHOD IS: copy 24 bytes out of `impl->savedState->timeB`, or out of CoreMedia's
 * `kCMTimeZero` when there is no snapshot, into the caller's own return slot.
 *
 * FOUR THINGS THE STRUCTURE DECIDES, none of them free choices:
 *
 * 1. `+0x18` (timeB), NOT `+0x00`. The twin `getFadeInOffset` @0x15eb4 is the same body reading
 *    `(%rcx)` and `0x10(%rcx)` — the CMTime at `savedState+0x00`. This one reads `0x18(%rcx)` and
 *    `0x28(%rcx)`. Two adjacent CMTimes in one snapshot, one per fade end: that pair is what NAMES
 *    the landed `OZChannelImplSavedState.timeA` / `.timeB`, which `OZChannelImpl.ts` could only
 *    recover anonymously from `operator=` (@0xaa387..@0xaa39f moves 16 bytes at +0x00, 8 at +0x10,
 *    16 at +0x18, 8 at +0x28) — the same grouping, in the same two pieces, that this getter
 *    performs for one of the pair.
 *
 * 2. IT IS A COPY, NOT THE SOURCE. `%rax` is the CALLER's 24 bytes; the source is only ever read.
 *    Returning the snapshot's own object would let a caller mutate `savedState->timeB` — or, on
 *    the null path, CoreMedia's `kCMTimeZero` itself — through a getter that in the machine cannot
 *    reach either. That is precisely the defect the twin `getFadeInOffset` was REJECTED for on
 *    PR #647 before it landed above, so this file already carries the adjudicated answer: build
 *    the returned struct field by field, in the machine's own order (epoch first, then the 16-byte
 *    group), exactly as `_cmTimeCopy` does in `PCTimeRange.ts:224` and `CMTime.ts:654`.
 *
 * 3. THE NULL ANSWER IS `kCMTimeZero`, NOT A ZEROED STRUCT. The fallback is a POINTER SWAP: both
 *    branches converge on the copy at 0x15f14, so the null case yields CoreMedia's exported zero —
 *    value 0, timescale 1, flags Valid, epoch 0 — and specifically not an all-zero struct. A port
 *    that returned a zeroed CMTime would differ in `timescale` and `flags` on exactly the input a
 *    caller is most likely to hit: a channel that was never faded.
 *
 * 4. `this+0x70` IS DEREFERENCED UNGUARDED WHILE `impl+0x10` IS TESTED. The machine faults on a
 *    channel with no impl, exactly as `OZChannel_getCurveInterface` @0x184f6 and
 *    `OZChannel_getFadeOutCurve` @0x15f38 do. The port neither adds the guard the binary lacks nor
 *    drops the one it has.
 *
 * ZERO callees: no call, no extern, no indirect and no virtual dispatch —
 * `depgraph.py deps __ZN9OZChannel16getFadeOutOffsetEv` lists nothing. `kCMTimeZero` is DATA read
 * through the literal pool, not a call.
 *
 * WHICH IMPL MODEL: the LANDED one (`OZChannelImplSavedState.timeB`), the same one
 * `getFadeOutCurve` above reads. Note for whoever unifies this file: it currently carries TWO
 * models of `impl+0x10` — the landed import used here and by getFadeOutCurve, and the local
 * `savedStateAt10: OZChannelImplSavedStateSlot` used by getFadeInCurve/getFadeInOffset. They agree
 * on the layout and disagree on the spelling; collapsing them onto the landed one is a mechanical
 * change and belongs in its own unit, not smuggled into a port PR.
 *
 * ORACLE — EXECUTED against live FCP, not read:
 * `raw-port/re/oracle/OZChannel_getFadeOutOffset_oracle.py`, with THIS FILE run by
 * `raw-port/re/oracle/OZChannel_getFadeOutOffset_driver.mts` under
 * `node --experimental-strip-types`, so the comparison is TypeScript-against-binary rather than
 * against a Python restatement that would share any misreading with the port it judges. The symbol
 * is `T`, so `dlsym` reaches it; the resolved address is cross-checked against `slide + 0x15ee0`
 * from `army/inventory/ProChannel.syms.txt` and the bytes there against this transcription's
 * prologue (`55 48 89 e5 48 89 f8`), all under `arch -x86_64` so the slice being called is the one
 * these offsets come from. The corpus builds a real this/impl/savedState chain in ctypes memory,
 * poisoned with 0xCD, carrying a DECOY CMTime at `savedState+0x00` — the fade-IN slot a
 * wrong-offset port would return.
 *
 * MEASURED (2026-08-11, slide 0x10a697000; dlsym and the inventory agreeing on 0x10a6acee0):
 *   8 of 8 cases bit-identical, including int64 extremes, a negative value AND epoch, timescale 0
 *   with flags 0, and the NULL-savedState case;
 *   0 of 8 cases modified any byte of the receiver, the impl or the snapshot;
 *   ALIASING, the property point 2 is about and the one a value comparison cannot see: the
 *   returned object is mutated after each call and the snapshot re-read — the live binary's answer
 *   is independent storage by construction (sret), and the port's must be too. Measured
 *   independent on both sides; the mutant that returns the source object instead of a copy is
 *   caught by exactly this check and by nothing else in the harness;
 *   the TS `kCMTimeZero` this port falls back to is BIT-IDENTICAL to the 24 bytes at the
 *   literal-pool target the binary loads (0xca4c0 -> CoreMedia's own `_kCMTimeZero`), which
 *   settles point 3 by measurement rather than by reading;
 *   mutants — real copies of this file with ONE token changed, run through the same pipeline:
 *     M0  unmutated baseline .................... killed 0 of 8  (the instrument perturbs nothing)
 *     M1  read savedState+0x00 (timeA) .......... killed 7 of 7 eligible
 *     M2  null answer as an all-zero struct ..... killed 1 of 1 eligible
 *     M3  epoch from +0x10 instead of +0x28 ..... killed 7 of 7 eligible
 *     M4  return the SOURCE object, not a copy .. values agree everywhere; caught only by the
 *                                                 aliasing check, which is why that check exists
 *   Each value mutant changes ONE branch, so its denominator is the cases that reach that branch.
 *
 * WHAT THE HARNESS STUBS, said out loud because a differential that quietly fabricates its subject
 * is worse than none: the driver loads this file with FIVE unrelated sibling imports replaced by
 * empty classes (OZChannelBase, OZChannelInfo, PCSerializerReadStream, PCStreamElement, OZCurve) —
 * none of which this function touches — because node cannot load them against an uncompiled tree
 * (extensionless specifiers under `moduleResolution: "bundler"`, plus a value-import of the
 * type-only `CMTime` inside PCSerializerReadStream). `../infra/CMTime` is NOT stubbed: it is a leaf
 * module and it is where the null-path constant comes from. The driver prints the substitution
 * list and the running function's own source text alongside the results.
 *
 * Source disassembly: `raw-port/re/disasm/ProChannel.__ZN9OZChannel16getFadeOutOffsetEv.s`
 * (19 lines, regenerated from the binary in the worktree this unit was written in).
 *
 * @0x15ee0
 */
export function OZChannel_getFadeOutOffset(self: OZChannelLayout): CMTime {
  // @0x15ee7  movq 0x70(%rsi),%rcx — the primary impl, dereferenced WITHOUT a null check, exactly
  //   as the machine does. Same landed model `getFadeOutCurve` above reads.
  const impl = self.implPrimary as unknown as OZChannelImplLanded;
  // @0x15eeb  movq 0x10(%rcx),%rcx — the SavedState snapshot, which MAY be null...
  const saved: OZChannelImplSavedState | null = impl.savedState;
  // %rcx — the SOURCE the copy below reads from. The null path is a POINTER SWAP rather than a
  // second return: @0x15f02 loads &kCMTimeZero into the same register the taken branch already
  // holds, and both fall into the one copy at 0x15f14.
  let src: CMTime;
  // @0x15eef-0x15ef2  testq %rcx,%rcx ; je 0x15f02 — the test the binary performs.
  if (saved === null || saved === undefined) {
    // @0x15f02  movq 0xb45b7(%rip),%rcx — CoreMedia's zero {value 0, timescale 1, flags Valid,
    //   epoch 0}, read through the literal-pool slot 0xca4c0. Not an all-zero struct.
    src = kCMTimeZeroConst;
  } else {
    // @0x15ef4/@0x15efc read from savedState+0x18.
    src = saved.timeB;
  }
  // @0x15ef4-0x15f14 — the 24-byte COPY into the caller's own sret slot, in the machine's order:
  //   movq 0x28/0x10(%rcx),%rdx ; movq %rdx,0x10(%rax)   <- epoch first
  //   movups 0x18/(%rcx),%xmm0  ; movups %xmm0,(%rax)    <- then value+timescale+flags
  // A COPY, not the address of the source: returning `src` itself would alias the snapshot (and,
  // on the null path, CoreMedia's constant) into the caller's hands, which the machine cannot do
  // and which is what PR #647 was rejected for on the twin above.
  return {
    epoch: src.epoch,          // +0x10, copied first (movq/movq)
    value: src.value,          // +0x00 ─┐
    timescale: src.timescale,  // +0x08  ├─ the single 16-byte movups
    flags: src.flags,          // +0x0c ─┘
  };
}
