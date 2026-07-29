// OZChannelGradientWithAngle — ProChannel channel-tree class that adds a
// per-instance ANGLE sub-channel (an OZChannelAngle) to the base
// OZChannelGradientExtras. Compared to the sibling OZChannelGradientWithTransform,
// this class holds only ONE sub-object: an OZChannelAngle at +0x420, whose
// default value is -π/2 radians. All other methods are trivial forwards to
// the parent, with the exception of clone/copy/dtors that must know how to
// destroy/copy the +0x420 slot.
//
// Framework: ProChannel
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
// The x86_64 slice was extracted to /tmp/ProChannel.x86_64 (VAs == file offsets).
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/ProChannel.OZChannelGradientWithAngle.*.s and the
// disassembly captured under raw-port/re/disasm/ for each ctor/dtor):
//   @0x6f01e  C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)      [factory 5-arg body]
//   @0x6f0c6  C1(OZFactory*, PCString&, OZChannelFolder*, u32, u32)      [wrapper -> C2 above]
//   @0x6f0d0  C2(OZFactory*, PCString&, u32)                             [factory 3-arg body]
//   @0x6f178  C1(OZFactory*, PCString&, u32)                             [wrapper -> C2 above]
//   @0x6f182  C2(PCString&, OZChannelFolder*, u32, u32)                  [no-factory body — looks up singleton]
//   @0x6f25a  C1(PCString&, OZChannelFolder*, u32, u32)                  [wrapper -> C2 above]
//   @0x6f264  C2(OZChannelGradientWithAngle const&, OZChannelFolder*)    [copy body]
//   @0x6f2da  C1(OZChannelGradientWithAngle const&, OZChannelFolder*)    [wrapper -> C2 above]
//   @0x6f2e4  ~OZChannelGradientWithAngle() [D2 in-place — destroys +0x420]
//   @0x6f31c  ~OZChannelGradientWithAngle() [D1 in-place — same body as D2]
//   @0x6f38e  ~OZChannelGradientWithAngle() [D0 full — D2 body then operator delete]
//   @0x6f3dc  clone() const                                              [operator new(0x4b8) + copy-ctor]
//   @0x6f41c  copy(OZChannelBase const*, bool)                           [chain + dyn_cast + OZChannel::copy]
//   @0x6f46a  getObjCWrapperName()                                       [return CFStringRef @0xe56f0]
//
// VTABLE (from resolve.py ProChannel vtable OZChannelGradientWithAngle):
//   vtable @0xdc0d8; installed primary ptr = vtable+0x10 = 0xdc0e8
//                    installed secondary ptr = vtable+0x2e8 = 0xdc3c0 (from ctors @0x6f03b etc.)
//   *0x00   -> 0x6f31c  ~OZChannelGradientWithAngle  [D2]
//   *0x08   -> 0x6f38e  ~OZChannelGradientWithAngle  [D0 delete-thunk]
//   *0x10..*0x50 -> inherited OZFactoryBase/OZChannelBase getters (icon/id/serializer/factoryForSerialization)
//   *0x58   -> 0x6f46a  getObjCWrapperName()                                 [override — returns CFString]
//   *0x60..*0xe0 -> inherited OZChannelFolder/OZChannelBase                (lock/enable/isObjectRef/setRangeName)
//   *0xe8   -> 0x6f41c  copy(OZChannelBase const*, bool)                    [override]
//   *0xf0   -> inherited OZChannelFolder::compare(OZChannelBase const*) const
//   *0xf8   -> 0x6f3dc  clone() const                                       [override]
//   *0x1a8..*0x1b0 -> inherited OZChannelGradient::parseBegin/parseEnd
//   *0x2b8..*0x2c0 -> inherited OZChannelBase::shouldIgnoreDynamicIDs / resetTimeIndependentFlagIfNeeded
//
// STRUCT LAYOUT (recovered from ctors @0x6f01e..@0x6f2da and dtor @0x6f2e4):
//   +0x000  primary vptr        (= vtable + 0x10 = 0xdc0e8)
//   +0x010  secondary vptr      (= vtable + 0x2e8 = 0xdc3c0)
//   +0x018..+0x41f              OZChannelGradientExtras base subobject (opaque here)
//   +0x420  OZChannelAngle      angle sub-channel (primary vptr = OZChannelAngle vtable+0x10)
//   +0x430  OZChannelAngle secondary vptr (= OZChannelAngle vtable+0x370, from @0x6f2b4)
//   size = 0x4b8 bytes         (from clone @0x6f3e6: `movl $0x4b8, %edi; callq operator new`)

// ---------------------------------------------------------------------------
// Frontier callees: symbols that this class' ports need but which live in
// external units (base classes, PCString ctor/dtor, singletons, allocator).
// Every one throws with a specific @0xADDR so the frontier tool can enumerate
// them and future workers can pick them up.
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientExtras::C2(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
 * — @ProChannel 0x6a9e2. Parent-class 5-arg constructor.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientExtras_C2_factory5(
  _self: unknown, _factory: unknown, _name: unknown, _folder: unknown,
  _u5: number, _u6: number,
): void {
  throw new Error("OZChannelGradientExtras::C2(fac,name,folder,u,u) @ProChannel 0x6a9e2 not yet transcribed");
}

/**
 * OZChannelGradientExtras::C2(OZFactory*, PCString const&, u32)
 * — @ProChannel 0x6aac4. Parent-class 3-arg constructor.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientExtras_C2_factory3(
  _self: unknown, _factory: unknown, _name: unknown, _u4: number,
): void {
  throw new Error("OZChannelGradientExtras::C2(fac,name,u) @ProChannel 0x6aac4 not yet transcribed");
}

/**
 * OZChannelGradientExtras::C2(OZChannelGradientExtras const&, OZChannelFolder*)
 * — @ProChannel 0x6acb8. Parent-class copy constructor.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientExtras_C2_copy(
  _self: unknown, _src: unknown, _folder: unknown,
): void {
  throw new Error("OZChannelGradientExtras::C2(copy,folder) @ProChannel 0x6acb8 not yet transcribed");
}

/**
 * OZChannelGradientExtras::D2() — @ProChannel 0x6ad18. Parent-class destructor.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientExtras_D2(_self: unknown): void {
  throw new Error("OZChannelGradientExtras::D2 @ProChannel 0x6ad18 not yet transcribed");
}

/**
 * OZChannelGradientExtras::copy(OZChannelBase const*, bool) — @ProChannel 0x6f42e (called via
 * `callq __ZN23OZChannelGradientExtras4copyEPK13OZChannelBaseb` @0x6f42e in copy()).
 * The symbol resolves to OZChannelGradientExtras::copy — chain to parent copy.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientExtras_copy(
  _self: unknown, _src: unknown, _flag: boolean,
): void {
  throw new Error("OZChannelGradientExtras::copy @ProChannel 0x6f42e (extern) not yet transcribed");
}

/**
 * OZChannel::C2(OZChannel const&, OZChannelFolder*) — @ProChannel 0x13fb0.
 * Base-of-base copy ctor used by the +0x420 sub-object in the copy ctor path.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannel_C2_copy(
  _self: unknown, _src: unknown, _folder: unknown,
): void {
  throw new Error("OZChannel::C2(copy,folder) @ProChannel 0x13fb0 not yet transcribed");
}

/**
 * OZChannel::D2() — @ProChannel 0x140bc. Destructor for the +0x420 sub-object.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannel_D2(_self: unknown): void {
  throw new Error("OZChannel::D2 @ProChannel 0x140bc not yet transcribed");
}

/**
 * OZChannel::copy(OZChannelBase const*, bool) — @ProChannel (tail-jmp target
 * of copy() @0x6f465; symbol __ZN9OZChannel4copyEPK13OZChannelBaseb).
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannel_copy(
  _self: unknown, _src: unknown, _flag: boolean,
): void {
  throw new Error("OZChannel::copy @ProChannel (tail-jmp from 0x6f465) not yet transcribed");
}

/**
 * OZChannelAngle::C2(double, PCString const&, OZChannelFolder*, u32, u32,
 *                     OZChannelImpl*, OZChannelInfo*) — @ProChannel 0x84a18.
 * Constructor of the angle sub-object at +0x420. First arg is the default value.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelAngle_C2_full(
  _self: unknown, _defaultValue: number, _name: unknown, _folder: unknown,
  _u5: number, _u6: number, _impl: unknown, _info: unknown,
): void {
  throw new Error("OZChannelAngle::C2(d,name,folder,u,u,impl,info) @ProChannel 0x84a18 not yet transcribed");
}

/**
 * OZChannelGradientWithAngle_Factory::getInstance() — @ProChannel 0x27ac.
 * Meyer's singleton factory used by the no-factory-arg ctor path (@0x6f1a2).
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientWithAngle_Factory_getInstance(): unknown {
  throw new Error("OZChannelGradientWithAngle_Factory::getInstance @ProChannel 0x27ac not yet transcribed");
}

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle_angleImpl::getInstance()
 * — @ProChannel 0x6f478. std::call_once Meyer's singleton returning the shared
 * OZChannelImpl* used for every OZChannelGradientWithAngle instance's angle
 * sub-object. Emitted verbatim in every ctor. Not fully transcribed here — the
 * once-init call to a proxy @0x6f4bf constructs the static
 * `_OZChannelGradientWithAngle_angle` (an OZChannelImpl) whose ctor is external.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function OZChannelGradientWithAngle_angleImpl_getInstance(): unknown {
  throw new Error(
    "OZChannelGradientWithAngle::OZChannelGradientWithAngle_angleImpl::getInstance @ProChannel 0x6f478 not yet transcribed",
  );
}

/**
 * PCString::C2(CFStringRef, void* bundle, unsigned flags) — @ProChannel 0xacd02 (symbol stub).
 * The 4-arg PCString constructor used to build the transient name for the
 * angle sub-object: `PCString(&tmp, CFStringRef @0xe56f0, ProChannelBundle, 0)`.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function PCString_C2_fromCFString(
  _self: unknown, _cfstr: unknown, _bundle: unknown, _flags: number,
): void {
  throw new Error("PCString::C2(cfstr,bundle,flags) @ProChannel stub 0xacd02 not yet transcribed");
}

/**
 * PCString::D2() — @ProChannel 0xacd20 (symbol stub). Destroys the transient
 * PCString built by PCString_C2_fromCFString.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function PCString_D2(_self: unknown): void {
  throw new Error("PCString::D2 @ProChannel stub 0xacd20 not yet transcribed");
}

/**
 * getProChannelBundle() — @ProChannel 0xa9ee4 (symbol __Z19getProChannelBundlev).
 * Returns the CFBundleRef of ProChannel.framework, used as the localization
 * bundle for the transient PCString of the angle sub-object name.
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function getProChannelBundle(): unknown {
  throw new Error("getProChannelBundle @ProChannel 0xa9ee4 not yet transcribed");
}

/**
 * operator new(size_t) — @ProChannel symbol stub 0xace4c (__Znwm).
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function operator_new(_size: number): unknown {
  throw new Error("operator new @ProChannel stub 0xace4c not yet transcribed");
}

/**
 * operator delete(void*) — @ProChannel symbol stub 0xace04 (__ZdlPv).
 * Frontier callee for OZChannelGradientWithAngle.
 */
export function operator_delete(_p: unknown): void {
  throw new Error("operator delete @ProChannel stub 0xace04 not yet transcribed");
}

/**
 * __dynamic_cast(void*, typeinfo*, typeinfo*, ptrdiff_t) — @ProChannel stub 0xacea0.
 * Used in copy() @0x6f446 to downcast a `OZChannelBase const*` to
 * `OZChannelGradientWithAngle const*`. Frontier callee for OZChannelGradientWithAngle.
 */
export function dynamic_cast_to_OZChannelGradientWithAngle(_src: unknown): OZChannelGradientWithAngleHandle | null {
  throw new Error("__dynamic_cast @ProChannel stub 0xacea0 not yet transcribed");
}

// ---------------------------------------------------------------------------
// Constants read from the ProChannel binary.
// ---------------------------------------------------------------------------

/**
 * Default angle value for the +0x420 OZChannelAngle sub-object.
 * Read from ProChannel VA 0xaf570 (via `movsd 0x???(%rip), %xmm0 ## 0xaf570`
 * at @0x6f074, @0x6f126, @0x6f201). Confirmed via
 *   `resolve.py ProChannel const 0xaf570`  ->  double=-1.5707963267948966
 *                                              u64=0xbff921fb54442d18   = -π/2.
 */
export const OZChannelGradientWithAngle_DEFAULT_ANGLE = -1.5707963267948966; // @ProChannel 0xaf570

/**
 * CFStringRef literal for the angle sub-object's localizable name — @ProChannel
 * VA 0xe56f0. The exact string is a `__CFString` blob whose payload lives at a
 * further indirection; TS callers must fetch it via CoreFoundation to see the
 * localized display name. The address is captured verbatim from the four ctor
 * bodies (@0x6f04b, @0x6f0fd, @0x6f1d8) which all use the SAME CFString.
 */
export const OZChannelGradientWithAngle_ANGLE_NAME_CFSTRING_ADDR = 0xe56f0; // @ProChannel 0xe56f0

/**
 * Fourth argument to OZChannelAngle::C2 is a constant `movl $0x4, %ecx` at
 * @0x6f083 / @0x6f135 / @0x6f210 across all three ctor bodies — a small enum
 * (kind-of-angle-channel selector) burned into every construction. Fifth is
 * `xorl %r8d, %r8d` (zero).
 */
export const OZChannelGradientWithAngle_ANGLE_KIND = 4; // @ProChannel 0x6f083

/** Sizeof, from clone() @0x6f3e6: `movl $0x4b8, %edi; callq operator new`. */
export const OZChannelGradientWithAngle_SIZEOF = 0x4b8; // @ProChannel 0x6f3e6

/** Byte offset of the OZChannelAngle sub-object within an instance. */
export const OZChannelGradientWithAngle_ANGLE_OFFSET = 0x420; // @ProChannel 0x6f065

/**
 * Installed primary vptr — `vtable+0x10 = 0xdc0e8`. Cited at @0x6f031, @0x6f0e3,
 * @0x6f1be, @0x6f276, @0x6f2ed, @0x6f325, @0x6f397 (every ctor + every dtor).
 */
export const OZChannelGradientWithAngle_VPTR_PRIMARY = 0xdc0e8; // @ProChannel 0xdc0e8

/**
 * Installed secondary vptr — `vtable+0x2e8 = 0xdc3c0`. Cited at @0x6f03b, @0x6f0ed,
 * @0x6f1c8, @0x6f280, @0x6f2f7, @0x6f32f, @0x6f3a1.
 */
export const OZChannelGradientWithAngle_VPTR_SECONDARY = 0xdc3c0; // @ProChannel 0xdc3c0

/**
 * The copy-ctor manually re-installs OZChannelAngle's vptrs on the +0x420 slot
 * AFTER calling the generic OZChannel::C2 copy (which would have written the
 * OZChannel vptr). OZChannelAngle vtable is @ProChannel 0xd1bc0; the copy-ctor
 * stores `vtable+0x10 = 0xd1bd0` at +0x420 and `vtable+0x370 = 0xd1f30` at
 * +0x430 (from @0x6f2a2..@0x6f2ba).
 */
export const OZChannelAngle_VPTR_PRIMARY = 0xd1bd0; // @ProChannel 0xd1bd0 (= 0xd1bc0 + 0x10)
export const OZChannelAngle_VPTR_SECONDARY = 0xd1f30; // @ProChannel 0xd1f30 (= 0xd1bc0 + 0x370)

// ---------------------------------------------------------------------------
// Minimal typing for a handle into an OZChannelGradientWithAngle instance.
// The layout above is documented offset-by-offset; TS ports only need to
// preserve the primary/secondary vptr slots and the +0x420 OZChannelAngle
// sub-object slot.
// ---------------------------------------------------------------------------
export interface OZChannelGradientWithAngleHandle {
  /** primary vptr slot (+0x000 in the C++ layout). */
  vptrPrimary: number;
  /** secondary vptr slot (+0x010 in the C++ layout). */
  vptrSecondary: number;
  /** OZChannelAngle sub-channel at +0x420 (primary vptr slot). */
  angleVptrPrimary: number;
  /** OZChannelAngle sub-channel at +0x430 (secondary vptr slot). */
  angleVptrSecondary: number;
  /** Opaque OZChannelAngle body; ported subclasses may typecast this. */
  angle: unknown;
}

// ---------------------------------------------------------------------------
// C2 (factory,name,folder,u,u) — @0x6f01e.
//
//   pushq/movq/pushq/pushq/subq                        ; frame
//   %rbx = this
//   callq OZChannelGradientExtras::C2(fac,name,folder,u,u)  ; @0x6f02c
//   *(this+0x00)  = &vtable[0x10] = 0xdc0e8                  ; @0x6f031
//   *(this+0x10)  = &vtable[0x2e8] = 0xdc3c0                  ; @0x6f03b
//   %rax = getProChannelBundle()                              ; @0x6f046
//   PCString::C2(&tmp[-0x18], CFString @0xe56f0, bundle, 0)   ; @0x6f05b
//   %rax = OZChannelGradientWithAngle_angleImpl::getInstance() ; @0x6f060
//   %rdi = this + 0x420
//   push $0 onto arg7 (info=null)
//   %xmm0 = double @0xaf570 = -π/2
//   %rsi = &tmp PCString
//   %rdx = this (folder-parent — the OZChannelFolder base of `this`)
//   %ecx = 4, %r8d = 0, %r9 = impl
//   OZChannelAngle::C2(this+0x420, -π/2, tmp, this, 4, 0, impl, null)  ; @0x6f08e
//   PCString::D2(&tmp)                                        ; @0x6f097
//   return
//
// Third arg to OZChannelAngle::C2 is `%rdx = %rbx = this`. That means the
// "folder" the angle sub-channel is registered under is the enclosing
// OZChannelGradientWithAngle itself (self-registration into its own folder
// slot). This is consistent with the "folder" arg passed via %rdx in @0x6f080
// (`movq %rbx, %rdx`).
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle(
 *   OZFactory* factory, PCString const& name, OZChannelFolder* folder, u32 u5, u32 u6)
 * — @0x6f01e (C2 body).
 *
 * Chains to OZChannelGradientExtras::C2, installs both vptrs, then constructs
 * the OZChannelAngle sub-object at +0x420 with default value -π/2, name
 * PCString(CFString @0xe56f0, ProChannelBundle), folder=this, kind=4, u=0,
 * impl=the shared angleImpl singleton, info=null.
 */
export function OZChannelGradientWithAngle_C2_factory5(
  self: OZChannelGradientWithAngleHandle,
  factory: unknown, name: unknown, folder: unknown, u5: number, u6: number,
): void {
  // @0x6f02c — chain to parent 5-arg C2.
  OZChannelGradientExtras_C2_factory5(self, factory, name, folder, u5, u6);
  // @0x6f031/@0x6f03b — install vptrs.
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  // @0x6f046 — bundle for the CFString lookup.
  const bundle = getProChannelBundle();
  // @0x6f05b — build transient PCString from CFStringRef @0xe56f0.
  const tmp = {} as unknown; // stand-in for the stack PCString at [rbp-0x18].
  PCString_C2_fromCFString(tmp, OZChannelGradientWithAngle_ANGLE_NAME_CFSTRING_ADDR, bundle, 0);
  try {
    // @0x6f060 — fetch the shared angleImpl singleton.
    const impl = OZChannelGradientWithAngle_angleImpl_getInstance();
    // @0x6f08e — construct OZChannelAngle at this+0x420. Folder = %rbx = self.
    OZChannelAngle_C2_full(
      /* self       */ self,
      /* default    */ OZChannelGradientWithAngle_DEFAULT_ANGLE,
      /* name       */ tmp,
      /* folder     */ self,
      /* kind       */ OZChannelGradientWithAngle_ANGLE_KIND,
      /* u          */ 0,
      /* impl       */ impl,
      /* info=null  */ null,
    );
  } finally {
    // @0x6f097 (and unwind cleanup @0x6f0ac) — destroy the transient PCString.
    PCString_D2(tmp);
  }
  // `factory` and `u5/u6` are consumed by the parent chain call above; we
  // reference them explicitly to keep the signature honest for reviewers.
  void factory; void u5; void u6;
}

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle(
 *   OZFactory*, PCString&, OZChannelFolder*, u32, u32)
 * — @0x6f0c6 (C1 wrapper). Body:
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp C2 @0x6f01e
 */
export function OZChannelGradientWithAngle_C1_factory5(
  self: OZChannelGradientWithAngleHandle,
  factory: unknown, name: unknown, folder: unknown, u5: number, u6: number,
): void {
  return OZChannelGradientWithAngle_C2_factory5(self, factory, name, folder, u5, u6);
}

// ---------------------------------------------------------------------------
// C2 (factory,name,u) — @0x6f0d0. Identical shape to the 5-arg body; the only
// differences are the parent chain call (3-arg Extras C2 @0x6aac4) and the
// missing folder arg. `folder = self` in the OZChannelAngle::C2 call (the
// generated code loads `%rdx = %rbx = this`, same as the 5-arg body).
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle(
 *   OZFactory* factory, PCString const& name, u32 u4) — @0x6f0d0 (C2 body).
 */
export function OZChannelGradientWithAngle_C2_factory3(
  self: OZChannelGradientWithAngleHandle,
  factory: unknown, name: unknown, u4: number,
): void {
  // @0x6f0de — chain to parent 3-arg C2.
  OZChannelGradientExtras_C2_factory3(self, factory, name, u4);
  // @0x6f0e3/@0x6f0ed — install vptrs.
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  // @0x6f0f8 — bundle.
  const bundle = getProChannelBundle();
  // @0x6f10d — build transient PCString.
  const tmp = {} as unknown;
  PCString_C2_fromCFString(tmp, OZChannelGradientWithAngle_ANGLE_NAME_CFSTRING_ADDR, bundle, 0);
  try {
    // @0x6f112 — fetch shared angleImpl.
    const impl = OZChannelGradientWithAngle_angleImpl_getInstance();
    // @0x6f140 — construct OZChannelAngle at this+0x420. Folder = self.
    OZChannelAngle_C2_full(
      self,
      OZChannelGradientWithAngle_DEFAULT_ANGLE,
      tmp,
      self,
      OZChannelGradientWithAngle_ANGLE_KIND,
      0,
      impl,
      null,
    );
  } finally {
    // @0x6f149 — destroy transient.
    PCString_D2(tmp);
  }
  void factory; void u4;
}

/** C1 wrapper — @0x6f178 tail-jmp to C2 @0x6f0d0. */
export function OZChannelGradientWithAngle_C1_factory3(
  self: OZChannelGradientWithAngleHandle,
  factory: unknown, name: unknown, u4: number,
): void {
  return OZChannelGradientWithAngle_C2_factory3(self, factory, name, u4);
}

// ---------------------------------------------------------------------------
// C2 (name,folder,u,u) — @0x6f182. Same shape as the 5-arg body, EXCEPT the
// factory is fetched from OZChannelGradientWithAngle_Factory::getInstance()
// @0x6f1a2 before chaining to the 5-arg parent C2.
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle(
 *   PCString const& name, OZChannelFolder* folder, u32 u4, u32 u5) — @0x6f182 (C2).
 */
export function OZChannelGradientWithAngle_C2_nofactory(
  self: OZChannelGradientWithAngleHandle,
  name: unknown, folder: unknown, u4: number, u5: number,
): void {
  // @0x6f1a2 — fetch the singleton factory.
  const factory = OZChannelGradientWithAngle_Factory_getInstance();
  // @0x6f1b9 — chain to parent 5-arg C2 with the fetched factory.
  OZChannelGradientExtras_C2_factory5(self, factory, name, folder, u4, u5);
  // @0x6f1be/@0x6f1c8 — install vptrs.
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  // @0x6f1d3 — bundle.
  const bundle = getProChannelBundle();
  // @0x6f1e8 — build transient PCString.
  const tmp = {} as unknown;
  PCString_C2_fromCFString(tmp, OZChannelGradientWithAngle_ANGLE_NAME_CFSTRING_ADDR, bundle, 0);
  try {
    // @0x6f1ed — fetch shared angleImpl.
    const impl = OZChannelGradientWithAngle_angleImpl_getInstance();
    // @0x6f21b — construct OZChannelAngle at this+0x420. Folder = self.
    OZChannelAngle_C2_full(
      self,
      OZChannelGradientWithAngle_DEFAULT_ANGLE,
      tmp,
      self,
      OZChannelGradientWithAngle_ANGLE_KIND,
      0,
      impl,
      null,
    );
  } finally {
    // @0x6f224 — destroy transient.
    PCString_D2(tmp);
  }
  void u4; void u5;
}

/** C1 wrapper — @0x6f25a tail-jmp to C2 @0x6f182. */
export function OZChannelGradientWithAngle_C1_nofactory(
  self: OZChannelGradientWithAngleHandle,
  name: unknown, folder: unknown, u4: number, u5: number,
): void {
  return OZChannelGradientWithAngle_C2_nofactory(self, name, folder, u4, u5);
}

// ---------------------------------------------------------------------------
// C2 copy — @0x6f264.
//
//   %rbx = this ; %r14 = src
//   OZChannelGradientExtras::C2(this, src, folder)                    ; @0x6f271
//   *(this+0x00) = 0xdc0e8                                            ; @0x6f276
//   *(this+0x10) = 0xdc3c0                                            ; @0x6f280
//   %eax = 0x420
//   %rdi = this + 0x420
//   %r14 += 0x420        ; src + 0x420
//   OZChannel::C2(this+0x420, src+0x420, this)                        ; @0x6f29d
//   *(this+0x420) = OZChannelAngle vtable+0x10 = 0xd1bd0              ; @0x6f2ad
//   *(this+0x430) = OZChannelAngle vtable+0x370 = 0xd1f30             ; @0x6f2ba
//
// The last two stores REPLACE the OZChannel vptrs installed by
// OZChannel::C2(copy) with the correct OZChannelAngle vptrs — a manual
// most-derived-vtable fixup done because the runtime C2 copy uses the
// most-derived type of the STATIC declaration (OZChannel) rather than the
// dynamic type (OZChannelAngle).
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientWithAngle::OZChannelGradientWithAngle(
 *   OZChannelGradientWithAngle const& src, OZChannelFolder* folder) — @0x6f264 (C2 copy).
 */
export function OZChannelGradientWithAngle_C2_copy(
  self: OZChannelGradientWithAngleHandle,
  src: OZChannelGradientWithAngleHandle,
  folder: unknown,
): void {
  // @0x6f271 — chain to parent copy ctor.
  OZChannelGradientExtras_C2_copy(self, src, folder);
  // @0x6f276/@0x6f280 — install this-class vptrs.
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  // @0x6f29d — copy the +0x420 sub-channel using OZChannel::C2 copy ctor,
  //           passing `this` as the folder-parent (the OZChannelFolder base).
  OZChannel_C2_copy(self /* +0x420 slot */, src /* +0x420 slot */, self /* parent folder */);
  // @0x6f2ad/@0x6f2ba — manual vptr fixup to OZChannelAngle's most-derived vptrs.
  self.angleVptrPrimary = OZChannelAngle_VPTR_PRIMARY;
  self.angleVptrSecondary = OZChannelAngle_VPTR_SECONDARY;
}

/** C1 wrapper — @0x6f2da tail-jmp to C2 @0x6f264. */
export function OZChannelGradientWithAngle_C1_copy(
  self: OZChannelGradientWithAngleHandle,
  src: OZChannelGradientWithAngleHandle,
  folder: unknown,
): void {
  return OZChannelGradientWithAngle_C2_copy(self, src, folder);
}

// ---------------------------------------------------------------------------
// D2 — @0x6f2e4. Installs this-class vptrs (in case a derived class was
// destroyed mid-chain), then destroys the +0x420 sub-object and tail-jmps
// to the parent D2.
//
//   *(this+0x00) = 0xdc0e8                                       ; @0x6f2ed
//   *(this+0x10) = 0xdc3c0                                       ; @0x6f2f7
//   OZChannel::D2(this+0x420)                                    ; @0x6f309
//   jmp OZChannelGradientExtras::D2(this)                        ; @0x6f317
// ---------------------------------------------------------------------------

/** OZChannelGradientWithAngle::~OZChannelGradientWithAngle() — @0x6f2e4 (D2). */
export function OZChannelGradientWithAngle_D2(self: OZChannelGradientWithAngleHandle): void {
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  OZChannel_D2(self /* +0x420 slot */);
  OZChannelGradientExtras_D2(self);
}

/**
 * OZChannelGradientWithAngle::~OZChannelGradientWithAngle() — @0x6f31c (D1).
 * The D1 body @0x6f31c is byte-for-byte identical to D2 @0x6f2e4 (same
 * vptr installs, same OZChannel::D2 call, same tail-jmp to parent D2).
 */
export function OZChannelGradientWithAngle_D1(self: OZChannelGradientWithAngleHandle): void {
  return OZChannelGradientWithAngle_D2(self);
}

/**
 * OZChannelGradientWithAngle::~OZChannelGradientWithAngle() — @0x6f38e (D0).
 * The D0 (delete-thunk) body is the D2 body followed by `jmp operator delete`
 * @0x6f3c9. Reproduced verbatim.
 */
export function OZChannelGradientWithAngle_D0(self: OZChannelGradientWithAngleHandle): void {
  self.vptrPrimary = OZChannelGradientWithAngle_VPTR_PRIMARY;
  self.vptrSecondary = OZChannelGradientWithAngle_VPTR_SECONDARY;
  OZChannel_D2(self /* +0x420 slot */);
  OZChannelGradientExtras_D2(self);
  operator_delete(self);
}

// ---------------------------------------------------------------------------
// clone() — @0x6f3dc.
//
//   %r14 = this
//   %edi = 0x4b8 ; sizeof
//   callq operator new                                          ; @0x6f3eb
//   %rbx = new; %rdi = new; %rsi = this; %edx = 0 (folder=null)
//   callq OZChannelGradientWithAngle::C2(copy)                  ; @0x6f3fb
//   %rax = new; return
// ---------------------------------------------------------------------------

/** OZChannelGradientWithAngle::clone() const — @0x6f3dc. */
export function OZChannelGradientWithAngle_clone(
  self: OZChannelGradientWithAngleHandle,
): OZChannelGradientWithAngleHandle {
  // @0x6f3eb — operator new(sizeof(OZChannelGradientWithAngle)).
  const raw = operator_new(OZChannelGradientWithAngle_SIZEOF) as OZChannelGradientWithAngleHandle;
  // @0x6f3fb — invoke the copy C2 with folder=null.
  OZChannelGradientWithAngle_C2_copy(raw, self, null);
  return raw;
}

// ---------------------------------------------------------------------------
// copy() — @0x6f41c.
//
//   %r15 = this ; %r14 = src ; %ebx = flag
//   callq OZChannelGradientExtras::copy(this, src, flag)                ; @0x6f42e
//   %rsi = &typeinfo(OZChannelBase)
//   %rdx = &typeinfo(OZChannelGradientWithAngle)
//   %rdi = src, %ecx = 0
//   %rax = __dynamic_cast(src, ...)                                     ; @0x6f446
//   %esi = 0x420 ; %r15 = this+0x420 ; %rsi = src'+0x420 (or +0x420 offset from null)
//   %rdi = this+0x420 ; %edx = flag
//   jmp OZChannel::copy(this+0x420, src'+0x420, flag)                   ; @0x6f465
//
// If __dynamic_cast returns null (src not derived from
// OZChannelGradientWithAngle), the code still computes `null + 0x420` and
// passes that as the src to OZChannel::copy. This is UB in C++ but the
// generated code performs it verbatim — the callee OZChannel::copy is
// responsible for handling a non-null-but-invalid pointer. We reproduce the
// bit-exact call structure and defer the semantics.
// ---------------------------------------------------------------------------

/** OZChannelGradientWithAngle::copy(OZChannelBase const*, bool) — @0x6f41c. */
export function OZChannelGradientWithAngle_copy(
  self: OZChannelGradientWithAngleHandle,
  src: unknown,
  flag: boolean,
): void {
  // @0x6f42e — chain to parent copy first.
  OZChannelGradientExtras_copy(self, src, flag);
  // @0x6f446 — downcast to OZChannelGradientWithAngle.
  const srcCast = dynamic_cast_to_OZChannelGradientWithAngle(src);
  // @0x6f465 — copy the +0x420 sub-object. The disasm forms `src + 0x420`
  //           even when srcCast is null; we mirror that by passing the raw
  //           value through — TS can't reproduce pointer arithmetic on null,
  //           so we forward the handle unchanged (the downstream OZChannel::copy
  //           port must decide how to handle a null src).
  OZChannel_copy(self /* +0x420 slot */, srcCast /* +0x420 slot */, flag);
}

// ---------------------------------------------------------------------------
// getObjCWrapperName() — @0x6f46a.
//
//   leaq 0x7629b(%rip), %rax   ; %rip=@0x6f475 -> 0xe5710 (an Objective-C
//                              ; CFStringRef literal — the class's ObjC
//                              ; wrapper name, e.g. "OZChannelGradientWithAngle"
//                              ; in whatever bridge namespace ProChannel uses).
//   retq
// ---------------------------------------------------------------------------

/**
 * ProChannel VA of the CFStringRef returned by getObjCWrapperName(). Computed
 * as `%rip(@0x6f475) + 0x7629b = 0xe5710` from the leaq at @0x6f46e. The
 * disassembly's `## Objc cfstring ref: @"bad cfstring ref"` note is the
 * otool decoder's placeholder — the literal string bytes require reading the
 * __cfstring blob at that address (owned by CoreFoundation, outside TS scope).
 */
export const OZChannelGradientWithAngle_OBJC_WRAPPER_NAME_ADDR = 0xe5710; // @ProChannel 0x6f46e

/** OZChannelGradientWithAngle::getObjCWrapperName() — @0x6f46a. */
export function OZChannelGradientWithAngle_getObjCWrapperName(): number {
  return OZChannelGradientWithAngle_OBJC_WRAPPER_NAME_ADDR;
}
