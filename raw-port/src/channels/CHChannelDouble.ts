// CHChannelDouble — ObjC facade over an OZChannel* scalar-double animatable channel
// (ProChannel.framework). Every instance holds a `_pOZChannel: OZChannelBase*` ivar
// (inherited from `CHChannelBase`) and forwards each getter/setter/keyframe query to
// the underlying `OZChannel` (recovered via `___dynamic_cast(OZChannelBase* -> OZChannel*)`).
//
// FAITHFUL PORT. Every function cites its `@ProChannel 0xADDR` from the linear-sweep of
// ProChannel's x86_64 slice. Every offset (ivar offset via `_OBJC_IVAR_$_CHChannelBase._pOZChannel`,
// info-descriptor field offsets at 0x10/0x18/0x20, impl-slot offset 0x70, info-slot offset 0x80,
// vtable offsets 0x100/0x108/0x120/0x1f0/0x200/0x328/0x338/0x340) is documented at the address it
// was read from. Undecoded OZChannel base methods throw citing their `@ProChannel 0xADDR` per Rule 3.
//
// FRAMEWORK: ProChannel  (nm __ZTI15CHChannelDouble not exported — this is a pure ObjC class
//   registered in the __objc_classlist section; the methods below are all `-`/`+` ObjC-messenger
//   entry points, not C++ mangled functions).
//
// STRUCT LAYOUT (CHChannelDouble is an ObjC subclass of CHChannelBase; it does NOT introduce new
// ivars — every method looks up `_pOZChannel` on the *parent* class):
//   +0x00              isa                                (ObjC standard)
//   +0x08              (ObjC parent-class ivars ...)
//   +[_OBJC_IVAR_$_CHChannelBase._pOZChannel]  OZChannelBase*  pOZChannel
//                                                        ; loaded @0x950a9-b3, @0x95112-1c,
//                                                          @0x9515f-69, @0x951d8-e2, @0x95224-2e,
//                                                          @0x952c3-cd, @0x95310-1a, @0x9535e-6e,
//                                                          @0x953b1-bb, @0x95403-0d, @0x95434-42,
//                                                          @0x95482-90, @0x954b6-c0, @0x95504-12,
//                                                          @0x95539-47, @0x9558b-95, @0x955bc-ca,
//                                                          @0x95617-21, @0x95666-70, @0x956bc-c6,
//                                                          @0x9571b-25, @0x95785-8f, @0x957f4-fe.
//                                                        ; PATTERN: `leaq _OBJC_IVAR_..., %rax ;
//                                                          movq (%rax),%rax ; movq (%rdi,%rax),%rdi`
//                                                          (self, ivar-offset -> OZChannelBase*).
//
// FRONTIER — undecoded OZChannel base methods JUMP'd or CALL'd from this file
//   (each has a throw-stub below that cites its ProChannel address):
//     OZChannel::getValueAsDouble(CMTime const&, double) const              (called @0x950f8)
//     OZChannel::getCurveValue(CMTime const&, bool)                          (called @0x95146)
//     OZChannel::getDefaultValue() const                                     (jmp'd @0x95208/@0x9520f)
//     OZChannel::setDefaultValue(double)                                     (called @0x95271/@0x9529a)
//     OZChannel::setMin(double)                                              (jmp'd @0x95352/@0x95359)
//     OZChannel::setMax(double)                                              (jmp'd @0x953f3/@0x953fa)
//     OZChannel::setSliderMin(double)                                        (jmp'd @0x95476/@0x9547d)
//     OZChannel::setSliderMax(double)                                        (jmp'd @0x954f8/@0x954ff)
//     OZChannel::setCoarseDelta(double)                                      (jmp'd @0x9557b/@0x95582)
//     OZChannel::setFineDelta(double)                                        (jmp'd @0x955fe/@0x95605)
//     OZChannel::getFirstKeyframe(CMTime*, double*)                          (called @0x9564c)
//     OZChannel::getLastKeyframe(CMTime*, double*)                           (called @0x9569b)
//     OZChannel::getNextKeyframe(CMTime const&, CMTime*, double*) const     (called @0x956f4)
//     OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const (called @0x95753)
//     OZChannel::getSamples(CMTime const&, CMTime const&, unsigned int&,
//         vector<CMTime>*, vector<double>*)                                  (called @0x957c7)
//     OZChannelBase::setKeyframesWithChannelRef(CMTime const&, CMTime const&,
//         map<OZChannelRef, vector<_OZKeyframeInfo>>&, bool)                (called @0x95832)
//   Non-CH-owned virtual dispatches through the OZChannel vtable — vtable slot targets are
//   undecoded here (they need vtable dumping of __ZTV9OZChannel):
//     *0x100  — read min (info->min) via impl->info descriptor            (called @0x95305 setup, @0x9539d..3a0)
//                          [minCurveDoubleValue actually calls vtable slot 0x108, see @0x952ff]
//     *0x108  — read min via impl->info                                   (called @0x952ff)
//     *0x120  — post-setDefaultValue notify slot                          (jmpq'd @0x952bb via +0x120)
//     *0x150  — get CMTime for a query                                    (called @0x950e9)
//     *0x1f0  — begin-mutation notify (record==false path)                (called @0x95289)
//     *0x200  — begin-mutation predicate (returns %al=needs-record)       (called @0x95250)
//     *0x328  — read slider-max (maxUIDoubleValue vtable slot)            (jmp'd @0x954b0)
//     *0x338  — get-extrema virtual                                       (called @0x95196)
//     *0x340  — commit mutation via full record path                       (called @0x95260)
//
// SELECTOR-SWAP FORWARDERS (three methods rewrite the selector and objc_msgSend-tail-call):
//   setCurveDoubleValue:atTime:options:   -> selref @0xe9538 = "setCurveValueWithDouble:atTime:options:"
//     (loaded @0x951a6 rel; final selref addr = 0x951a6 + 7 + 0x5438b = 0xe9538 — objc_msgSend
//      via got entry @0x951ae rel = 0x951ae + 6 + 0x353bc = 0xe8570).
//   initialCurveDoubleValue                -> selref @0xe9540 = "initialCurveValueAsDouble"
//     (loaded @0x951b8 rel; final selref addr = 0x951b8 + 7 + 0x54381 = 0xe9540).
//   setInitialCurveDoubleValue:            -> selref @0xe9548 = "setInitialCurveValueWithDouble:"
//     (loaded @0x951ca rel; final selref addr = 0x951ca + 7 + 0x54377 = 0xe9548).
//   These forwarders are RUNTIME dispatch — decoding them is purely a re-message that lands in
//   a sibling method (e.g. from `-[CHChannelInt setCurveIntValue:atTime:options:]`) that we haven't
//   yet ported. Model them as throwing stubs that cite BOTH the selref addr and the original addr.
//
// OZ CHANNEL INFO LAYOUT (partial — recovered from the direct field reads in this file):
//   OZChannel + 0x70 -> OZChannelImpl*    impl               ; read @0x952f1/@0x95392
//     OZChannelImpl + 0x08 -> OZChannelInfo* info-primary    ; read @0x952f5/@0x95396
//   OZChannel + 0x80 -> OZChannelInfo*    info-secondary     ; read @0x95426/@0x9552b/@0x955ae
//   OZChannelInfo (as read via OZChannel+0x80):
//     +0x10 : double  sliderMin (UI min)                     ; read @0x9542d (minUIDoubleValue)
//     +0x18 : double  fineDelta                              ; read @0x955b5 (fineDeltaDoubleValue)
//     +0x20 : double  coarseDelta                            ; read @0x95532 (coarseDeltaDoubleValue)
//
// import { OZChannel } from "./OZChannel.js";
// The concrete OZChannel class exists; but every OZChannel method we invoke is undecoded, so we
// keep OZChannel usage opaque (as `OZChannelBaseHandle`) — that avoids taking a hard structural
// dependency on OZChannel while it still lacks the methods we throw-stub below. The typeinfo cast
// operation (`___dynamic_cast` @0xacea0) is modeled as identity because in TS every subclass
// handle is already the base handle (there is no multiple-inheritance layout to compensate for).

/**
 * Opaque handle to an OZChannelBase pointer / OZChannel pointer (they are the same object in TS since OZChannelBase
 * is the head of a single-inheritance chain in the abstract port).
 *
 * The runtime ObjC entry points read `_pOZChannel` from the calling `-` method's `self`, and every
 * method below performs the same guarded `___dynamic_cast<OZChannelBase*, OZChannel*>` that the
 * disasm shows at @0xacea0. In TS this is identity: any handle that *is* an OZChannel is one.
 */
export interface OZChannelHandle {
  readonly __brand: "OZChannel";
  /** OZChannel + 0x70 -> OZChannelImpl* impl (see layout note @0x952f1/@0x95392). */
  readonly implSlot: { readonly infoPrimary: OZChannelInfoLayout } | null;
  /** OZChannel + 0x80 -> OZChannelInfo* info-secondary (see layout note @0x95426/@0x9552b/@0x955ae). */
  readonly infoSecondary: OZChannelInfoLayout;
}

/** OZChannelInfo layout — only the three fields this file reads (verified @0x9542d/@0x955b5/@0x95532). */
export interface OZChannelInfoLayout {
  /** +0x10 — slider min (UI min).       Read @0x9542d in minUIDoubleValue. */
  sliderMin: number;
  /** +0x18 — fine step delta.           Read @0x955b5 in fineDeltaDoubleValue. */
  fineDelta: number;
  /** +0x20 — coarse step delta.         Read @0x95532 in coarseDeltaDoubleValue. */
  coarseDelta: number;
}

/** The `self` shape for a `-[CHChannelDouble ...]` invocation. `_pOZChannel` is the parent-class
 *  (CHChannelBase) ivar that every method resolves via `_OBJC_IVAR_$_CHChannelBase._pOZChannel`
 *  (@0x950a9 leaq; @0x950b0 movq (%rax),%rax => the runtime ivar-offset dword). We model that as
 *  a direct field. Nullable — every method has a `testq %rdi,%rdi ; je <nil-path>` guard except
 *  the ones that guarantee the OZChannel is present (e.g. minCurveDoubleValue @0x952bd assumes
 *  non-nil — it's a bug in the FCP binary too, but faithful to what the code does). */
export interface CHChannelDoubleSelf {
  /** _pOZChannel — ivar defined on CHChannelBase (parent class). */
  pOZChannel: OZChannelHandle | null;
}

// ---------------------------------------------------------------------------------------------
// Frontier stubs for every undecoded OZChannel base method. Rule 3: every throw cites the
// ProChannel address where the caller invokes it, PLUS the callee's own symbol address if known.
// ---------------------------------------------------------------------------------------------

/** OZChannel::getValueAsDouble(CMTime const&, double) const — ProChannel — called @0x950f8. */
function OZChannel__getValueAsDouble(_ch: OZChannelHandle, _cmTimeOut: CMTimeSlot, _def: number): number {
  throw new Error(
    "OZChannel::getValueAsDouble(CMTime const&, double) const @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble doubleValueAtTime:] @0x950f8)",
  );
}

/** OZChannel::getCurveValue(CMTime const&, bool) — ProChannel — called @0x95146. */
function OZChannel__getCurveValue(_ch: OZChannelHandle | null, _cmTime: CMTimeSlot, _b: boolean): number {
  throw new Error(
    "OZChannel::getCurveValue(CMTime const&, bool) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble curveDoubleValueAtTime:] @0x95146)",
  );
}

/** OZChannel::getDefaultValue() const — ProChannel — tail-jmp'd @0x95208 (rdi=OZChannel*) and
 *  @0x9520f (rdi=nullptr). */
function OZChannel__getDefaultValue(_ch: OZChannelHandle | null): number {
  throw new Error(
    "OZChannel::getDefaultValue() const @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble defaultCurveDoubleValue] @0x95208/@0x9520f)",
  );
}

/** OZChannel::setDefaultValue(double) — ProChannel — called @0x95271 and @0x9529a. */
function OZChannel__setDefaultValue(_ch: OZChannelHandle, _v: number): void {
  throw new Error(
    "OZChannel::setDefaultValue(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setDefaultCurveDoubleValue:] @0x95271/@0x9529a)",
  );
}

/** OZChannel::setMin(double) — ProChannel — tail-jmp'd @0x95352/@0x95359. */
function OZChannel__setMin(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setMin(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setMinCurveDoubleValue:] @0x95352/@0x95359)",
  );
}

/** OZChannel::setMax(double) — ProChannel — tail-jmp'd @0x953f3/@0x953fa. */
function OZChannel__setMax(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setMax(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setMaxCurveDoubleValue:] @0x953f3/@0x953fa)",
  );
}

/** OZChannel::setSliderMin(double) — ProChannel — tail-jmp'd @0x95476/@0x9547d. */
function OZChannel__setSliderMin(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setSliderMin(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setMinUIDoubleValue:] @0x95476/@0x9547d)",
  );
}

/** OZChannel::setSliderMax(double) — ProChannel — tail-jmp'd @0x954f8/@0x954ff. */
function OZChannel__setSliderMax(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setSliderMax(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setMaxUIDoubleValue:] @0x954f8/@0x954ff)",
  );
}

/** OZChannel::setCoarseDelta(double) — ProChannel — tail-jmp'd @0x9557b/@0x95582. */
function OZChannel__setCoarseDelta(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setCoarseDelta(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setCoarseDeltaDoubleValue:] @0x9557b/@0x95582)",
  );
}

/** OZChannel::setFineDelta(double) — ProChannel — tail-jmp'd @0x955fe/@0x95605. */
function OZChannel__setFineDelta(_ch: OZChannelHandle | null, _v: number): void {
  throw new Error(
    "OZChannel::setFineDelta(double) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setFineDeltaDoubleValue:] @0x955fe/@0x95605)",
  );
}

/** OZChannel::getFirstKeyframe(CMTime*, double*) — ProChannel — called @0x9564c.
 *  Returns bool (%al @0x95651 zero-extended). The two out-pointers are `time` and `value`. */
function OZChannel__getFirstKeyframe(
  _ch: OZChannelHandle | null,
  _timeOut: CMTimeSlot,
  _valueOut: DoubleSlot,
): boolean {
  throw new Error(
    "OZChannel::getFirstKeyframe(CMTime*, double*) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble getFirstKeyframeTime:curveDoubleValue:] @0x9564c)",
  );
}

/** OZChannel::getLastKeyframe(CMTime*, double*) — ProChannel — called @0x9569b.
 *  Returns bool (%al @0x956a0 zero-extended). */
function OZChannel__getLastKeyframe(
  _ch: OZChannelHandle | null,
  _timeOut: CMTimeSlot,
  _valueOut: DoubleSlot,
): boolean {
  throw new Error(
    "OZChannel::getLastKeyframe(CMTime*, double*) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble getLastKeyframeTime:curveDoubleValue:] @0x9569b)",
  );
}

/** OZChannel::getNextKeyframe(CMTime const&, CMTime*, double*) const — ProChannel — called @0x956f4.
 *  Returns bool (%al @0x956f9 zero-extended). */
function OZChannel__getNextKeyframe(
  _ch: OZChannelHandle | null,
  _time: CMTimeSlot,
  _timeOut: CMTimeSlot,
  _valueOut: DoubleSlot,
): boolean {
  throw new Error(
    "OZChannel::getNextKeyframe(CMTime const&, CMTime*, double*) const @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble getKeyframeAfterTime:time:curveDoubleValue:] @0x956f4)",
  );
}

/** OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const — ProChannel — called @0x95753. */
function OZChannel__getPreviousKeyframe(
  _ch: OZChannelHandle | null,
  _time: CMTimeSlot,
  _timeOut: CMTimeSlot,
  _valueOut: DoubleSlot,
): boolean {
  throw new Error(
    "OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble getKeyframeBeforeTime:time:curveDoubleValue:] @0x95753)",
  );
}

/** OZChannel::getSamples(CMTime const&, CMTime const&, unsigned int&, vector<CMTime>*, vector<double>*) —
 *  ProChannel — called @0x957c7. Writes the count back through the `unsigned int&` (r13, @0x957cc). */
function OZChannel__getSamples(
  _ch: OZChannelHandle | null,
  _time: CMTimeSlot,
  _delta: CMTimeSlot,
  _countInOut: Uint32Slot,
  _samplesX: unknown /* vector<CMTime>* */,
  _samplesY: unknown /* vector<double>* */,
): void {
  throw new Error(
    "OZChannel::getSamples(CMTime const&, CMTime const&, unsigned int&, vector<CMTime>*, vector<double>*) " +
      "@ProChannel not yet transcribed (called from -[CHChannelDouble getCurveSamples:delta:numberOfSamples:samplesX:samplesY:] @0x957c7)",
  );
}

/** OZChannelBase::setKeyframesWithChannelRef(CMTime const&, CMTime const&,
 *      map<OZChannelRef, vector<_OZKeyframeInfo>>&, bool) — ProChannel — called @0x95832. */
function OZChannelBase__setKeyframesWithChannelRef(
  _ch: OZChannelHandle | null,
  _time: CMTimeSlot,
  _delta: CMTimeSlot,
  _map: unknown,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannelBase::setKeyframesWithChannelRef(CMTime const&, CMTime const&, map<OZChannelRef, vector<_OZKeyframeInfo>>&, bool) " +
      "@ProChannel not yet transcribed (called from -[CHChannelDouble setKeyframesFromTime:fromMap:frameDuration:] @0x95832)",
  );
}

/** OZChannel virtual dispatch — slot *0x100 through the primary vtable. Called @0x9539d..a0 in
 *  maxCurveDoubleValue: reads impl->info descriptor and virtual-calls it with an out-double.
 *  Target symbol is undecoded (vtable slot 0x100 of __ZTV9OZChannel not yet dumped). */
function OZChannel__vtable_0x100(_desc: unknown, _out: DoubleSlot): void {
  throw new Error(
    "OZChannel vtable *0x100 (impl->info descriptor getter) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble maxCurveDoubleValue] @0x953a0)",
  );
}

/** OZChannel virtual dispatch — slot *0x108. Called @0x952ff in minCurveDoubleValue. */
function OZChannel__vtable_0x108(_desc: unknown, _out: DoubleSlot): void {
  throw new Error(
    "OZChannel vtable *0x108 (impl->info descriptor getter) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble minCurveDoubleValue] @0x952ff)",
  );
}

/** OZChannel virtual dispatch — slot *0x120. Called @0x952bb via `jmpq *%rax` after
 *  `movq 0x120(%rax),%rax` @0x952a7 in setDefaultCurveDoubleValue's completion tail. */
function OZChannel__vtable_0x120(_ch: OZChannelHandle, _b: boolean): void {
  throw new Error(
    "OZChannel vtable *0x120 (post-mutation notify) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setDefaultCurveDoubleValue:] tail @0x952bb)",
  );
}

/** OZChannel virtual dispatch — slot *0x150. Called @0x950e9 in doubleValueAtTime:. Writes a
 *  CMTime through the out-pointer at %r15/-0x30(%rbp); reads a CMTime through %rdx at %rbx. */
function OZChannel__vtable_0x150(_ch: OZChannelHandle, _cmOut: CMTimeSlot, _cmIn: CMTimeSlot): void {
  throw new Error(
    "OZChannel vtable *0x150 (get-query-CMTime) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble doubleValueAtTime:] @0x950e9)",
  );
}

/** OZChannel virtual dispatch — slot *0x1f0. Called @0x95289 in setDefaultCurveDoubleValue with
 *  esi=1 (a boolean "record" flag). Returns %eax (used as bool in the following branch). */
function OZChannel__vtable_0x1f0(_ch: OZChannelHandle, _record: number): number {
  throw new Error(
    "OZChannel vtable *0x1f0 (begin-mutation with record=true) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setDefaultCurveDoubleValue:] @0x95289)",
  );
}

/** OZChannel virtual dispatch — slot *0x200. Called @0x95250 in setDefaultCurveDoubleValue.
 *  Returns %al (a bool: "needs full record"). Steers the branch @0x9525e. */
function OZChannel__vtable_0x200(_ch: OZChannelHandle): number {
  throw new Error(
    "OZChannel vtable *0x200 (needs-record predicate) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setDefaultCurveDoubleValue:] @0x95250)",
  );
}

/** OZChannel virtual dispatch — slot *0x328. Tail-jmp'd @0x954b0 in maxUIDoubleValue. Returns
 *  a double through xmm0. Target reads whatever the primary vtable's slider-max accessor is. */
function OZChannel__vtable_0x328(_ch: OZChannelHandle): number {
  throw new Error(
    "OZChannel vtable *0x328 (slider-max getter) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble maxUIDoubleValue] @0x954b0)",
  );
}

/** OZChannel virtual dispatch — slot *0x338. Called @0x95196 in getExtremaBetweenStart:end:...:.
 *  Reads two CMTime inputs (rsi=0x10(rbp), rdx=0x28(rbp)) and writes two doubles (rcx=r14=minOut,
 *  r8=rbx=maxOut). */
function OZChannel__vtable_0x338(
  _ch: OZChannelHandle,
  _start: CMTimeSlot,
  _end: CMTimeSlot,
  _minOut: DoubleSlot,
  _maxOut: DoubleSlot,
): void {
  throw new Error(
    "OZChannel vtable *0x338 (getExtremaBetween) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble getExtremaBetweenStart:end:minDoubleValue:maxDoubleValue:] @0x95196)",
  );
}

/** OZChannel virtual dispatch — slot *0x340. Called @0x95260 in setDefaultCurveDoubleValue via
 *  the "no record needed" branch (when *0x200 returns 0). Returns %eax (also used as bool). */
function OZChannel__vtable_0x340(_ch: OZChannelHandle): number {
  throw new Error(
    "OZChannel vtable *0x340 (begin-mutation without record) @ProChannel not yet transcribed " +
      "(called from -[CHChannelDouble setDefaultCurveDoubleValue:] @0x95260)",
  );
}

// ---------------------------------------------------------------------------------------------
// C++ RTTI helper — `___dynamic_cast(rdi=obj, rsi=srctypeinfo, rdx=dsttypeinfo, rcx=hint=0)`.
// The disasm shows @0xacea0 as the symbol stub for `___dynamic_cast`. In the TS port we model
// this as identity: our channel objects are already typed at the OZChannel level (there's no
// multi-inheritance layout shift to compensate for). If the input is null (the ObjC method
// guards `testq %rdi,%rdi ; je <nil>`) we return null; else the same handle.
// This mirrors the observed behavior (@0x950d1 & @0x950d6 in doubleValueAtTime: — `movq %rax,%r14`
// when rdi non-null; `xorl %r14d,%r14d` when nil), but names the abstraction so every method can
// use it without repeating the same three lines of provenance comment.
// ---------------------------------------------------------------------------------------------
/** ___dynamic_cast<OZChannelBase*, OZChannel*>(p) — @0xacea0 stub in the disasm. Identity in TS. */
function dynamic_cast_OZChannel(p: OZChannelHandle | null): OZChannelHandle | null {
  // NOTE: `___dynamic_cast` @0xacea0 with typeinfo srct=__ZTI13OZChannelBase, dstt=__ZTI9OZChannel,
  // hint=0. For an object that is-a OZChannel this returns %rax=this-ptr (no offset — OZChannel
  // is at the head of the base subobject); for a non-OZChannel it returns 0. The TS port has no
  // structural notion of multiple inheritance so the identity mapping is faithful for the shapes
  // we actually pass through this function.
  return p;
}

// ---------------------------------------------------------------------------------------------
// Out-parameter slot helpers — the ObjC methods take pointers (from `%rbp + 0x10..`, the
// register-save area where 5th+ args live on x86_64 System-V) and write CMTime / double / uint32
// into caller-provided slots. TS models each as a 1-element object.
// ---------------------------------------------------------------------------------------------
/** A caller-provided CMTime out-parameter — the ObjC methods write the query time here. */
export interface CMTimeSlot {
  value?: bigint;
  timescale?: number;
  flags?: number;
  epoch?: bigint;
}
/** A caller-provided `double*` out-parameter. */
export interface DoubleSlot { value: number; }
/** A caller-provided `unsigned int*` (numberOfSamples in/out) parameter. */
export interface Uint32Slot { value: number; }

// ---------------------------------------------------------------------------------------------
// Class methods (`+`) — factory / class-side.
// ---------------------------------------------------------------------------------------------

/**
 * +[CHChannelDouble _isOZChannelClassOK:]  @ProChannel 0x94fbd
 *
 * Faithful transcription:
 *   testq  %rdx, %rdx           ; if (arg == nullptr)
 *   je     0x94fea               ;   goto ret-false
 *   pushq  %rbp / movq %rsp,%rbp
 *   leaq   __ZTI13OZChannelBase(%rip), %rsi   ; @0x94fc6
 *   leaq   __ZTI15OZChannelDouble(%rip), %rax ; @0x94fcd
 *   movq   %rdx, %rdi
 *   movq   %rax, %rdx
 *   xorl   %ecx, %ecx                         ; hint=0
 *   callq  ___dynamic_cast                    ; @0x94fdc -> stub 0xacea0
 *   testq  %rax, %rax
 *   setne  %al                                ; return (cast != nullptr)
 *   popq   %rbp
 *   jmp    0x94fec
 *   xorl   %eax, %eax                         ; nil-path returns 0
 *   movzbl %al, %eax
 *   retq
 *
 * NOTE: the ObjC arg convention here is `+ (BOOL)_isOZChannelClassOK:(OZChannelBase*)ch` — self
 * lives in %rdi, _cmd in %rsi, and the first user arg in %rdx (hence `testq %rdx,%rdx`).
 * TS port receives the OZChannel handle directly.
 */
export function CHChannelDouble_isOZChannelClassOK(ch: OZChannelHandle | null): boolean {
  // testq %rdx,%rdx ; je 0x94fea  — @0x94fbd-c0
  if (ch === null) return false;
  // ___dynamic_cast<OZChannelBase*, OZChannelDouble*>(ch, hint=0)  — @0x94fdc
  // (We use dynamic_cast_OZChannel as our stand-in; the src typeinfo is OZChannelBase, the dst is
  // OZChannelDouble — a stricter check than the generic OZChannel path used elsewhere. In TS we
  // rely on the caller to have handed us an OZChannel; the port's cast is identity, so the only
  // way we return false is the null-guard above. That's a faithful outcome mod the identity
  // assumption logged above dynamic_cast_OZChannel.)
  const cast = dynamic_cast_OZChannel(ch);
  // testq %rax,%rax ; setne %al  — @0x94fe1-e4
  return cast !== null;
}

// ---------------------------------------------------------------------------------------------
// Instance methods (`-`) — every method loads _pOZChannel from self, casts to OZChannel*, and
// dispatches to a base method or vtable slot. See disasm citations inside each function.
// ---------------------------------------------------------------------------------------------

/**
 * -[CHChannelDouble doubleValueAtTime:]  @ProChannel 0x95098
 *
 * Faithful transcription:
 *   push saves; %rbx = &arg-CMTime (0x10(%rbp))                                   ; @0x950a5
 *   %rdi = _pOZChannel = (self + IVAR_pOZChannel)                                 ; @0x950a9-b3
 *   if (%rdi != nullptr) {
 *     %r14 = ___dynamic_cast(%rdi, &OZChannelBase_ti, &OZChannel_ti, 0)          ; @0x950bc-d1
 *   } else {
 *     %r14 = 0                                                                    ; @0x950d6
 *   }
 *   %rax = *%r14                              ; vtable ptr
 *   %r15 = -0x30(%rbp)                        ; out CMTime slot
 *   (*(%rax+0x150))(%r14 [this], %r15 [out], %rbx [in])                          ; @0x950e9
 *   xorps %xmm0,%xmm0                         ; def=0.0
 *   OZChannel::getValueAsDouble(%r14 [this], %r15 [CMTime const&], def=0.0)      ; @0x950f8
 *   return xmm0
 */
export function CHChannelDouble_doubleValueAtTime(self: CHChannelDoubleSelf, time: CMTimeSlot): number {
  // Load & cast — @0x950a9-b3, @0x950bc-d1 / @0x950d6.
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  // NOTE: the disasm branches on the raw pointer BEFORE the cast (testq %rdi,%rdi @0x950b7-ba
  // guards WHICH BRANCH we take for the cast) — the vtable dereference at @0x950d9 (`movq (%r14),%rax`)
  // assumes non-nullptr and will fault on a nil OZChannel. That's a genuine binary behavior; TS
  // reproduces it with a null-deref-equivalent throw so the machine's precondition is preserved.
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble doubleValueAtTime:] @0x950d9 dereferences vtable of a nil OZChannel " +
        "(matches FCP binary — this call requires a non-null _pOZChannel)",
    );
  }
  // %r15 = out-CMTime slot at -0x30(%rbp) — a 24-byte stack scratch. Model as a fresh slot.
  const cmScratch: CMTimeSlot = {};
  // *0x150 dispatch — @0x950e9
  OZChannel__vtable_0x150(oz, cmScratch, time);
  // xorps %xmm0,%xmm0 => def = 0.0 (single-precision zero-extended is 0.0 in double)  — @0x950ef
  const def = 0.0;
  // OZChannel::getValueAsDouble — @0x950f8
  return OZChannel__getValueAsDouble(oz, cmScratch, def);
}

/**
 * -[CHChannelDouble curveDoubleValueAtTime:]  @ProChannel 0x95108
 *
 * Faithful transcription:
 *   %rbx = &arg-CMTime (0x10(%rbp))                                              ; @0x9510e
 *   %rdi = _pOZChannel                                                            ; @0x95112-1c
 *   if (%rdi != 0) %rdi = ___dynamic_cast(...OZChannel_ti); else %rdi = 0        ; @0x95125-3d/0x9513f
 *   %rsi = %rbx (CMTime*), %rdx = 0 (bool=false)                                  ; @0x95141-46
 *   OZChannel::getCurveValue(this, CMTime const&, bool=false)                    ; @0x95146
 *   return xmm0
 */
export function CHChannelDouble_curveDoubleValueAtTime(
  self: CHChannelDoubleSelf,
  time: CMTimeSlot,
): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  // xorl %edx,%edx => the bool arg is false  — @0x95144
  return OZChannel__getCurveValue(oz, time, false);
}

/**
 * -[CHChannelDouble getExtremaBetweenStart:end:minDoubleValue:maxDoubleValue:]  @ProChannel 0x95152
 *
 * Faithful transcription:
 *   %rbx = %rcx (max out),  %r14 = %rdx (min out)                                 ; @0x95159-5c
 *   %rdi = _pOZChannel                                                            ; @0x9515f-69
 *   %rdi = ___dynamic_cast(%rdi, &OZChannelBase_ti, &OZChannel_ti, 0)             ; @0x9516d-82
 *   %r9  = *%rdi (vtable), %rsi = &startCMTime (0x10(%rbp)), %rdx = &endCMTime (0x28(%rbp))
 *   (*(vtable+0x338))(%rdi [this], &start, &end, %r14 [min], %rbx [max])         ; @0x95196
 *
 * NOTE: this method has NO null-guard on _pOZChannel (unlike doubleValueAtTime:). The cast at
 * @0x9517d dereferences whatever's loaded; the vtable read at @0x95182 (`movq (%rax),%r9`) will
 * fault on a nil OZChannel. Faithful to the FCP binary — TS throws to preserve that precondition.
 */
export function CHChannelDouble_getExtremaBetween(
  self: CHChannelDoubleSelf,
  start: CMTimeSlot,
  end: CMTimeSlot,
  minOut: DoubleSlot,
  maxOut: DoubleSlot,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble getExtremaBetween...] @0x95182 dereferences vtable of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  OZChannel__vtable_0x338(oz, start, end, minOut, maxOut);
}

/**
 * -[CHChannelDouble setCurveDoubleValue:atTime:options:]  @ProChannel 0x951a2
 *
 * Faithful transcription — selector-swap forwarder:
 *   pushq %rbp / movq %rsp,%rbp
 *   movq  0x5438b(%rip), %rsi          ; load selref @0xe9538 = "setCurveValueWithDouble:atTime:options:"
 *   popq  %rbp
 *   jmpq  *0x353bc(%rip)               ; tail-jmp through _objc_msgSend's got entry
 *
 * The runtime effect is `[self setCurveValueWithDouble:atTime:options:...]` — the same `self`,
 * same args (xmm0=value, r8=time, ecx=options), a different selector. The receiving method is
 * NOT in this class — decoding it requires knowing which class (CHChannelBase, or a category)
 * actually implements `setCurveValueWithDouble:atTime:options:`. Not yet transcribed.
 */
export function CHChannelDouble_setCurveDoubleValue_atTime_options(
  _self: CHChannelDoubleSelf,
  _value: number,
  _time: CMTimeSlot,
  _options: number,
): void {
  throw new Error(
    "-[CHChannelDouble setCurveDoubleValue:atTime:options:] @0x951a2 is a selector-swap forwarder " +
      "to `-setCurveValueWithDouble:atTime:options:` (selref @0xe9538). Receiver method not yet " +
      "transcribed — decode `-setCurveValueWithDouble:atTime:options:` on CHChannelBase (or a " +
      "category) first, then wire the tail dispatch here.",
  );
}

/**
 * -[CHChannelDouble initialCurveDoubleValue]  @ProChannel 0x951b4
 *
 * Faithful transcription — selector-swap forwarder:
 *   pushq %rbp / movq %rsp,%rbp
 *   movq  0x54381(%rip), %rsi          ; load selref @0xe9540 = "initialCurveValueAsDouble"
 *   popq  %rbp
 *   jmpq  *0x353aa(%rip)               ; tail-jmp through _objc_msgSend
 */
export function CHChannelDouble_initialCurveDoubleValue(_self: CHChannelDoubleSelf): number {
  throw new Error(
    "-[CHChannelDouble initialCurveDoubleValue] @0x951b4 is a selector-swap forwarder to " +
      "`-initialCurveValueAsDouble` (selref @0xe9540). Receiver method not yet transcribed.",
  );
}

/**
 * -[CHChannelDouble setInitialCurveDoubleValue:]  @ProChannel 0x951c6
 *
 * Faithful transcription — selector-swap forwarder:
 *   pushq %rbp / movq %rsp,%rbp
 *   movq  0x54377(%rip), %rsi          ; load selref @0xe9548 = "setInitialCurveValueWithDouble:"
 *   popq  %rbp
 *   jmpq  *0x35398(%rip)               ; tail-jmp through _objc_msgSend
 */
export function CHChannelDouble_setInitialCurveDoubleValue(
  _self: CHChannelDoubleSelf,
  _value: number,
): void {
  throw new Error(
    "-[CHChannelDouble setInitialCurveDoubleValue:] @0x951c6 is a selector-swap forwarder to " +
      "`-setInitialCurveValueWithDouble:` (selref @0xe9548). Receiver method not yet transcribed.",
  );
}

/**
 * -[CHChannelDouble defaultCurveDoubleValue]  @ProChannel 0x951d8
 *
 * Faithful transcription:
 *   %rax = _pOZChannel = *(self + IVAR_pOZChannel)                                ; @0x951d8-e2
 *   if (%rdi == 0) {
 *     xorl %edi,%edi ; jmp OZChannel::getDefaultValue                             ; @0x9520d/@0x9520f
 *   }
 *   pushq %rbp / movq %rsp,%rbp
 *   %rdi = ___dynamic_cast(%rdi, OZChannelBase_ti, OZChannel_ti, 0)               ; @0x951ef-204
 *   popq %rbp ; jmp OZChannel::getDefaultValue                                    ; @0x95208
 */
export function CHChannelDouble_defaultCurveDoubleValue(self: CHChannelDoubleSelf): number {
  // Note the ordering of the null-check: it guards the CAST but not the CALL — even the null path
  // tail-jumps into `OZChannel::getDefaultValue` with %rdi=0. Faithful to FCP.
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  return OZChannel__getDefaultValue(oz);
}

/**
 * -[CHChannelDouble setDefaultCurveDoubleValue:]  @ProChannel 0x95214
 *
 * Faithful transcription:
 *   push saves; sub $0x10 ; %xmm0 -> -0x18(%rbp) (spill new default)              ; @0x95214-1f
 *   %rdi = _pOZChannel                                                            ; @0x95224-2e
 *   %rbx = ___dynamic_cast(...OZChannel_ti)                                       ; @0x95232-47
 *   %rax = *%rbx (vtable) ; call *(%rax+0x200)(this)                              ; @0x9524a-52   -> vtable_0x200
 *   %rcx = *(%rbx)      ; if (%al == 0) goto zero-branch                          ; @0x95256-5e
 *   call *(%rcx+0x340)(this)                                                      ; @0x95260   -> vtable_0x340
 *   %r14d = %eax                                                                  ; @0x95266
 *   %xmm0 = spill                                                                 ; @0x9526c
 *   call OZChannel::setDefaultValue(this, %xmm0)                                  ; @0x95271
 *   if (%r14d == 0) goto join                                                      ; @0x95276-79
 *   epilogue ret                                                                  ; @0x9527b-83
 *
 *   zero-branch @0x95284:
 *     %esi = 1
 *     call *(%rcx+0x1f0)(this, 1)                                                 ; @0x95289   -> vtable_0x1f0
 *     %r14d = %eax
 *     %xmm0 = spill ; call OZChannel::setDefaultValue(this, %xmm0)                ; @0x9529a
 *     if (%r14b != 0) goto epilogue                                                ; @0x952a2
 *
 *   join @0x952a4:
 *     %rax = *(this[0])  ; %rax = *(rax + 0x120) ; %rdi=this ; %rsi=0 ; jmpq *%rax ; @0x952bb -> vtable_0x120
 *
 * So the logic is:
 *   needsFull = *0x200(this);
 *   if (needsFull) {
 *     r14 = *0x340(this);         // returns bool
 *     setDefaultValue(v);
 *     if (r14 == 0) *0x120(this, 0);  // tail
 *   } else {
 *     r14 = *0x1f0(this, 1);
 *     setDefaultValue(v);
 *     if (r14 != 0) return;
 *     *0x120(this, 0);            // tail (via jmpq)
 *   }
 * The `r14` boolean, when TRUE, SKIPS the *0x120 tail call. TS mirrors this control flow exactly.
 */
export function CHChannelDouble_setDefaultCurveDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble setDefaultCurveDoubleValue:] @0x95232 dereferences vtable of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  // needsFull = *0x200(this)  — @0x95250
  const needsFull = OZChannel__vtable_0x200(oz);
  // testb %al,%al ; je 0x95284  — @0x9525c-5e
  if (needsFull !== 0) {
    // %r14d = *0x340(this)  — @0x95260
    const r14 = OZChannel__vtable_0x340(oz);
    // reload spilled xmm0; OZChannel::setDefaultValue(this, value)  — @0x95271
    OZChannel__setDefaultValue(oz, value);
    // testl %r14d,%r14d ; je 0x952a4  — @0x95276-79
    if (r14 === 0) {
      // fall through to join at @0x952a4 -> tail vtable_0x120(this, 0)
      OZChannel__vtable_0x120(oz, false);
    }
    // else: return (@0x9527b epilogue)
    return;
  }
  // zero-branch @0x95284: %esi = 1 ; call *(vtable+0x1f0)(this, 1)  — @0x95289
  const r14 = OZChannel__vtable_0x1f0(oz, 1);
  // reload spilled xmm0; OZChannel::setDefaultValue(this, value)  — @0x9529a
  OZChannel__setDefaultValue(oz, value);
  // testb %r14b,%r14b ; jne 0x9527b (epilogue)  — @0x9529f-a2
  if (r14 !== 0) return;
  // join @0x952a4: tail-jmp vtable_0x120(this, false)  — @0x952bb
  OZChannel__vtable_0x120(oz, false);
}

/**
 * -[CHChannelDouble minCurveDoubleValue]  @ProChannel 0x952bd
 *
 * Faithful transcription:
 *   %rdi = _pOZChannel                                                            ; @0x952c3-cd
 *   %rax = ___dynamic_cast(%rdi, OZChannelBase_ti, OZChannel_ti, 0)               ; @0x952d1-e1
 *   %rbx = -0x10(%rbp)                                                            ; @0x952e6
 *   *%rbx = 0.0  (movq $0, (%rbx))                                                ; @0x952ea
 *   %rax = *(this + 0x70)   (impl pointer)                                        ; @0x952f1
 *   %rdi = *(impl + 0x08)   (info-primary pointer)                                ; @0x952f5
 *   %rax = *(*info)         (vtable of info)                                      ; @0x952f9
 *   %rsi = %rbx (out double slot)
 *   call *(vtable+0x108)(info, out)                                               ; @0x952ff  -> vtable_0x108
 *   %xmm0 = *(%rbx)                                                               ; @0x95305
 *   return xmm0
 */
export function CHChannelDouble_minCurveDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble minCurveDoubleValue] @0x952f1 dereferences impl of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  // out slot at -0x10(%rbp) — @0x952e6, initialised to 0.0 @0x952ea.
  const out: DoubleSlot = { value: 0.0 };
  // *(this + 0x70) — impl — @0x952f1
  const impl = oz.implSlot;
  if (impl === null) {
    throw new Error(
      "-[CHChannelDouble minCurveDoubleValue] @0x952f1 read impl (this+0x70) but got null " +
        "(matches FCP binary — no null-guard on impl)",
    );
  }
  // *(impl + 0x08) — infoPrimary — @0x952f5 ; dispatch vtable *0x108 — @0x952ff
  OZChannel__vtable_0x108(impl.infoPrimary, out);
  // *(%rbx) — @0x95305
  return out.value;
}

/**
 * -[CHChannelDouble setMinCurveDoubleValue:]  @ProChannel 0x95310
 *
 * Faithful transcription:
 *   %rax = _pOZChannel                                                            ; @0x95310-1a
 *   if (%rdi == 0) { xorl %edi,%edi ; jmp OZChannel::setMin }                    ; @0x95357/@0x95359
 *   push saves; sub $0x10 ; spill %xmm0 -> -0x8(%rbp)                             ; @0x95327-3b
 *   %rax = ___dynamic_cast(...OZChannel_ti)                                       ; @0x95340
 *   %xmm0 = reload ; %rdi = %rax ; jmp OZChannel::setMin                          ; @0x95345-52
 */
export function CHChannelDouble_setMinCurveDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setMin(oz, value);
}

/**
 * -[CHChannelDouble maxCurveDoubleValue]  @ProChannel 0x9535e
 *
 * Faithful transcription — mirror of minCurveDoubleValue but reads vtable *0x100 (not *0x108):
 *   %rax = ___dynamic_cast(...OZChannel_ti)                                       ; @0x95382
 *   out = 0.0 at -0x10(%rbp)                                                      ; @0x95387-8b
 *   %rax = *(this + 0x70)   (impl)                                                ; @0x95392
 *   %rdi = *(impl + 0x08)   (info-primary)                                        ; @0x95396
 *   %rax = *(*info)                                                               ; @0x9539a
 *   %rsi = %rbx (out) ; call *(vtable+0x100)                                      ; @0x953a0  -> vtable_0x100
 *   xmm0 = *(out) ; return
 */
export function CHChannelDouble_maxCurveDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble maxCurveDoubleValue] @0x95392 dereferences impl of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  const out: DoubleSlot = { value: 0.0 };
  const impl = oz.implSlot;
  if (impl === null) {
    throw new Error(
      "-[CHChannelDouble maxCurveDoubleValue] @0x95392 read impl (this+0x70) but got null " +
        "(matches FCP binary — no null-guard on impl)",
    );
  }
  OZChannel__vtable_0x100(impl.infoPrimary, out);
  return out.value;
}

/**
 * -[CHChannelDouble setMaxCurveDoubleValue:]  @ProChannel 0x953b1
 *
 * Faithful transcription — parallel to setMinCurveDoubleValue: tail-jmp to OZChannel::setMax
 * with nil-forgiving forwarding at @0x953f8/@0x953fa.
 */
export function CHChannelDouble_setMaxCurveDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setMax(oz, value);
}

/**
 * -[CHChannelDouble minUIDoubleValue]  @ProChannel 0x953ff
 *
 * Faithful transcription:
 *   %rax = ___dynamic_cast(...OZChannel_ti)                                       ; @0x95421
 *   %rax = *(this + 0x80)          (info-secondary pointer)                       ; @0x95426
 *   %xmm0 = *(info + 0x10)          (sliderMin double)                            ; @0x9542d
 *   return xmm0
 */
export function CHChannelDouble_minUIDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble minUIDoubleValue] @0x95426 dereferences info-secondary of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  // info-secondary is OZChannel + 0x80 — @0x95426
  // sliderMin is info + 0x10 — @0x9542d
  return oz.infoSecondary.sliderMin;
}

/**
 * -[CHChannelDouble setMinUIDoubleValue:]  @ProChannel 0x95434
 *
 * Tail-jmp to OZChannel::setSliderMin — same shape as setMinCurveDoubleValue.
 */
export function CHChannelDouble_setMinUIDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setSliderMin(oz, value);
}

/**
 * -[CHChannelDouble maxUIDoubleValue]  @ProChannel 0x95482
 *
 * Faithful transcription:
 *   %rdi = _pOZChannel ; %rdi = ___dynamic_cast(...OZChannel_ti)                  ; @0x95486-a4
 *   %rcx = *(%rax)                    (vtable)                                    ; @0x954a9
 *   %rdi = %rax                                                                   ; @0x954ac
 *   popq %rbp ; jmpq *(vtable+0x328)                                              ; @0x954b0  -> vtable_0x328
 *
 * NOTE: maxUIDoubleValue is NOT symmetric with minUIDoubleValue (which reads info+0x10). Instead
 * it dispatches through the OZChannel primary vtable at *0x328. That vtable slot is presumably
 * OZChannel::getSliderMax() (mirroring the setSliderMax path), but the target is undecoded.
 */
export function CHChannelDouble_maxUIDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble maxUIDoubleValue] @0x954a9 dereferences vtable of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  return OZChannel__vtable_0x328(oz);
}

/**
 * -[CHChannelDouble setMaxUIDoubleValue:]  @ProChannel 0x954b6
 *
 * Tail-jmp to OZChannel::setSliderMax — nil-forgiving as usual.
 */
export function CHChannelDouble_setMaxUIDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setSliderMax(oz, value);
}

/**
 * -[CHChannelDouble coarseDeltaDoubleValue]  @ProChannel 0x95504
 *
 * Faithful transcription:
 *   %rax = ___dynamic_cast(...OZChannel_ti)                                       ; @0x95526
 *   %rax = *(this + 0x80)          (info-secondary)                               ; @0x9552b
 *   %xmm0 = *(info + 0x20)          (coarseDelta double)                          ; @0x95532
 *   return xmm0
 */
export function CHChannelDouble_coarseDeltaDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble coarseDeltaDoubleValue] @0x9552b dereferences info-secondary of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  return oz.infoSecondary.coarseDelta;
}

/**
 * -[CHChannelDouble setCoarseDeltaDoubleValue:]  @ProChannel 0x95539
 *
 * Tail-jmp to OZChannel::setCoarseDelta.
 */
export function CHChannelDouble_setCoarseDeltaDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setCoarseDelta(oz, value);
}

/**
 * -[CHChannelDouble fineDeltaDoubleValue]  @ProChannel 0x95587
 *
 * Faithful transcription:
 *   %rax = ___dynamic_cast(...OZChannel_ti)                                       ; @0x955a9
 *   %rax = *(this + 0x80)          (info-secondary)                               ; @0x955ae
 *   %xmm0 = *(info + 0x18)          (fineDelta double)                            ; @0x955b5
 *   return xmm0
 */
export function CHChannelDouble_fineDeltaDoubleValue(self: CHChannelDoubleSelf): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  if (oz === null) {
    throw new Error(
      "-[CHChannelDouble fineDeltaDoubleValue] @0x955ae dereferences info-secondary of a nil OZChannel " +
        "(matches FCP binary — no null-guard here)",
    );
  }
  return oz.infoSecondary.fineDelta;
}

/**
 * -[CHChannelDouble setFineDeltaDoubleValue:]  @ProChannel 0x955bc
 *
 * Tail-jmp to OZChannel::setFineDelta.
 */
export function CHChannelDouble_setFineDeltaDoubleValue(
  self: CHChannelDoubleSelf,
  value: number,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  OZChannel__setFineDelta(oz, value);
}

/**
 * -[CHChannelDouble getFirstKeyframeTime:curveDoubleValue:]  @ProChannel 0x9560a
 *
 * Faithful transcription:
 *   %rbx = %rcx (out double*), %r14 = %rdx (out CMTime*)                          ; @0x95611-14
 *   %rdi = _pOZChannel                                                            ; @0x95617-21
 *   if (%rdi != 0) %rdi = ___dynamic_cast(...OZChannel_ti); else %rdi = 0        ; @0x95625-3f/@0x95644
 *   %rsi = %r14 ; %rdx = %rbx                                                    ; @0x95646-49
 *   call OZChannel::getFirstKeyframe(this, %rsi, %rdx)                            ; @0x9564c
 *   return (uint8_t) %al
 */
export function CHChannelDouble_getFirstKeyframeTime_curveDoubleValue(
  self: CHChannelDoubleSelf,
  timeOut: CMTimeSlot,
  valueOut: DoubleSlot,
): boolean {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  return OZChannel__getFirstKeyframe(oz, timeOut, valueOut);
}

/**
 * -[CHChannelDouble getLastKeyframeTime:curveDoubleValue:]  @ProChannel 0x95659
 *
 * Faithful transcription — parallel to getFirstKeyframeTime:curveDoubleValue:, calls
 * OZChannel::getLastKeyframe @0x9569b.
 */
export function CHChannelDouble_getLastKeyframeTime_curveDoubleValue(
  self: CHChannelDoubleSelf,
  timeOut: CMTimeSlot,
  valueOut: DoubleSlot,
): boolean {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  return OZChannel__getLastKeyframe(oz, timeOut, valueOut);
}

/**
 * -[CHChannelDouble getKeyframeAfterTime:time:curveDoubleValue:]  @ProChannel 0x956a8
 *
 * Faithful transcription:
 *   %rbx = %rcx (out double*), %r14 = %rdx (out CMTime*)                          ; @0x956b2-b5
 *   %r15 = &argCMTime (0x10(%rbp))                                                 ; @0x956b8
 *   %rdi = _pOZChannel ; conditional-cast to OZChannel*                            ; @0x956bc-e9
 *   %rsi = %r15 ; %rdx = %r14 ; %rcx = %rbx                                       ; @0x956eb-f1
 *   call OZChannel::getNextKeyframe(this, CMTime const&, CMTime*, double*) const  ; @0x956f4
 *   return (uint8_t) %al
 */
export function CHChannelDouble_getKeyframeAfterTime_time_curveDoubleValue(
  self: CHChannelDoubleSelf,
  time: CMTimeSlot,
  timeOut: CMTimeSlot,
  valueOut: DoubleSlot,
): boolean {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  return OZChannel__getNextKeyframe(oz, time, timeOut, valueOut);
}

/**
 * -[CHChannelDouble getKeyframeBeforeTime:time:curveDoubleValue:]  @ProChannel 0x95707
 *
 * Faithful transcription — mirror of getKeyframeAfterTime:..., calling
 * OZChannel::getPreviousKeyframe @0x95753.
 */
export function CHChannelDouble_getKeyframeBeforeTime_time_curveDoubleValue(
  self: CHChannelDoubleSelf,
  time: CMTimeSlot,
  timeOut: CMTimeSlot,
  valueOut: DoubleSlot,
): boolean {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  return OZChannel__getPreviousKeyframe(oz, time, timeOut, valueOut);
}

/**
 * -[CHChannelDouble getCurveSamples:delta:numberOfSamples:samplesX:samplesY:]  @ProChannel 0x95766
 *
 * Faithful transcription:
 *   %rbx = %r8 (samplesY vector<double>*)                                          ; @0x95774
 *   %r14 = %rcx (numberOfSamples uint*  -- passed BY REFERENCE via 3rd arg)         ; @0x95777
 *
 *   NOTE: the disasm at @0x95782 writes `%edx` into `-0x2c(%rbp)` — that is the numberOfSamples
 *   VALUE, spilled to a 4-byte local so that its ADDRESS can be passed as `unsigned int&`. Then
 *   @0x957b4 loads `-0x2c(%rbp)` into %r13 as the pointer that becomes the C++ `unsigned int&`
 *   argument. After the call @0x957cc reads it back and returns it via %eax.
 *
 *   So the ObjC signature is really:
 *     - (unsigned int)getCurveSamples:(CMTime)at delta:(CMTime)delta
 *                    numberOfSamples:(unsigned int)initialCount
 *                            samplesX:(vector<CMTime>*)xs samplesY:(vector<double>*)ys;
 *   with the returned count being whatever OZChannel::getSamples wrote back through the reference.
 *
 *   %r12 = 0x10(%rbp)   (arg CMTime at time)                                       ; @0x9577e
 *   %r15 = 0x28(%rbp)   (arg CMTime delta)                                          ; @0x9577a
 *   %rdi = _pOZChannel ; conditional-cast                                          ; @0x95785-b2
 *   %rsi = %r12 (at) ; %rdx = %r15 (delta) ; %rcx = %r13 (&count) ;
 *   %r8 = %r14 (samplesX) ; %r9 = %rbx (samplesY)                                  ; @0x957b8-c4
 *
 *   NOTE — argument ORDER: the disasm loads r14=r14 (rcx) at @0x95777 (samplesY), r8=r8 (rbx) at
 *   @0x95774. But r14/r8 get re-shuffled: at @0x957c1 `movq %r14,%r8` (samplesX from ObjC's rcx?)
 *   and @0x957c4 `movq %rbx,%r9` (samplesY from ObjC's r8). The ObjC ordering is:
 *     rdi=self, rsi=_cmd, rdx=at(struct-ptr), rcx=delta(struct-ptr), r8=numberOfSamples(u32),
 *     r9=samplesX(vec*), stack=samplesY(vec*).
 *   Wait — the disasm shows `movq %rcx, %r14` @0x95777 and `movq %r8, %rbx` @0x95774. So:
 *     ObjC rdi=self, rsi=_cmd, rdx=at, rcx=delta, r8=numberOfSamples, r9=samplesX, stack=samplesY.
 *   Then at @0x9577a `leaq 0x28(%rbp),%r15` — that's the STACK arg at rbp+0x28, which is samplesY.
 *   At @0x9577e `leaq 0x10(%rbp),%r12` — that's stack arg at rbp+0x10, which is samplesX.
 *   Cross-checking: samplesX and samplesY are C++ vector pointers, but the FCP compiler pushed
 *   them via the register-save area, so ObjC's r9 and stack args are re-loaded from rbp+0x10..0x18
 *   and rbp+0x28..0x30 respectively. `%r14 = %rcx` @0x95777 is the OBJC delta from the msgSend
 *   register call convention, but it's not used after because @0x957bb `movq %r15,%rdx` overrides
 *   it with samplesY... no, wait — %rdx is being set to the SECOND CMTime arg (delta), which was
 *   read from rcx into r14 at @0x95777 and moved into %rdx via %r15 = &(rbp+0x28) at @0x9577a.
 *
 * The safest faithful transcription is: pass the same 6 arguments in the same order the disasm
 * hands to OZChannel::getSamples @0x957c7. The count-in-out semantics is exactly what
 * OZChannel::getSamples writes back through its `unsigned int&` argument.
 */
export function CHChannelDouble_getCurveSamples(
  self: CHChannelDoubleSelf,
  at: CMTimeSlot,
  delta: CMTimeSlot,
  initialCount: number,
  samplesX: unknown /* vector<CMTime>* */,
  samplesY: unknown /* vector<double>* */,
): number {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  // Spill initialCount to a stack slot so its ADDRESS can serve as `unsigned int&`  — @0x95782/@0x957b4
  const countSlot: Uint32Slot = { value: initialCount | 0 };
  // Dispatch — @0x957c7
  OZChannel__getSamples(oz, at, delta, countSlot, samplesX, samplesY);
  // Return the (possibly updated) count — @0x957cc reads (%r13) and returns via %eax.
  return countSlot.value | 0;
}

/**
 * -[CHChannelDouble setKeyframesFromTime:fromMap:frameDuration:]  @ProChannel 0x957df
 *
 * Faithful transcription:
 *   %rbx = %rdx (map<OZChannelRef, vector<_OZKeyframeInfo>>&)                     ; @0x957e9
 *   %r14 = 0x28(%rbp)  (arg CMTime frameDuration, at rbp+0x28 stack slot)          ; @0x957ec
 *   %r15 = 0x10(%rbp)  (arg CMTime fromTime,       at rbp+0x10 stack slot)          ; @0x957f0
 *   %rdi = _pOZChannel ; conditional-cast to OZChannel* (which is-a OZChannelBase) ; @0x957f4-21
 *   %rsi = %r15 (fromTime), %rdx = %r14 (frameDuration), %rcx = %rbx (map),
 *   %r8d = 1     (bool flag = true — @0x9582c `movl $0x1, %r8d`)                    ; @0x95823-32
 *   call OZChannelBase::setKeyframesWithChannelRef(this, fromTime, frameDuration,
 *                                                   map, true)                     ; @0x95832
 *
 * NOTE: OZChannelBase::setKeyframesWithChannelRef is a base-class method (not OZChannel's), and
 * the ObjC method dispatches to it via a NON-cast `this` (except the ___dynamic_cast lifts the
 * OZChannelBase* to OZChannel*, then the C++ call treats it as OZChannelBase* again — the RTTI
 * cast is redundant here in the binary; TS just uses the handle as-is).
 */
export function CHChannelDouble_setKeyframesFromTime_fromMap_frameDuration(
  self: CHChannelDoubleSelf,
  fromTime: CMTimeSlot,
  fromMap: unknown /* map<OZChannelRef, vector<_OZKeyframeInfo>>& */,
  frameDuration: CMTimeSlot,
): void {
  const oz = dynamic_cast_OZChannel(self.pOZChannel);
  // r8d = 1 -> hard-coded true flag  — @0x9582c
  OZChannelBase__setKeyframesWithChannelRef(oz, fromTime, frameDuration, fromMap, true);
}
