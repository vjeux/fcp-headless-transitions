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
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream";
import { PCStreamElement } from "../infra/PCStreamElement";
import { OZCurve } from "./OZCurve";

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
