// OZChannelGradientWithTransform — Ozone channel-tree class that adds a
// per-key TRANSFORM to a positioned gradient channel. It is a subclass of
// OZChannelGradientPositioned (which itself extends OZChannelGradient), and
// holds three OZChannelEnum sub-object slots at +0x9a8, +0xaa8 and +0xba8
// (recovered from the D0 destructor D0 @0x499270 which trivially destroys
// them in reverse order). parseEnd's job is small and local: after the base
// OZChannelGradient::parseEnd finishes, if the first enum sub-object
// (+0x9a8) reads as value "2" at kCMTimeZero, the second enum sub-object
// (+0xaa8) is initialised to 1.0 (else 0.0); it then marks the sub-object
// dirty by setting OZChannelBase flag 0x2. All other overrides are trivial
// forwards.
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework)
// The x86_64 slice is a plain Mach-O so VAs equal file offsets here.
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/OZChannelGradientWithTransform.*.s):
//   @0x498950  OZChannelGradientWithTransform(PCString&, OZChannelFolder*, u32, u32)   [C1 wrapper -> C2 folder-taking, not extracted here]
//   @0x498ba0  OZChannelGradientWithTransform(PCString&, OZChannelFolder*, u32, u32)   [C2 folder-taking]
//   @0x498bb0  OZChannelGradientWithTransform(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C1 folder+factory]
//   @0x498e00  OZChannelGradientWithTransform(OZFactory*, PCString&, OZChannelFolder*, u32, u32) [C1 wrapper -> C2]
//   @0x498e10  OZChannelGradientWithTransform(OZFactory*, PCString&, u32)              [C2 3-arg factory]
//   @0x499060  OZChannelGradientWithTransform(OZFactory*, PCString&, u32)              [C1 wrapper -> C2]
//   @0x499070  OZChannelGradientWithTransform(OZChannelGradientWithTransform&, OZChannelFolder*)  [C2 copy]
//   @0x499160  OZChannelGradientWithTransform(OZChannelGradientWithTransform&, OZChannelFolder*)  [C1 wrapper -> C2]
//   @0x499170  ~OZChannelGradientWithTransform()  [D2]
//   @0x4991c0  ~OZChannelGradientWithTransform()  [D0 full — dtor+delete]
//   @0x499270  ~OZChannelGradientWithTransform()  [D1 in-place — destroys the three sub-objects]
//   @0x499330  clone() const
//   @0x499370  copy(OZChannelBase const*, bool)
//   @0x499410  compare(OZChannelBase const*)  — trivial tail-jmp to OZChannelFolder::compare
//   @0x499420  parseEnd(PCSerializerReadStream&)
//
// VTABLE (resolve.py Ozone vtable OZChannelGradientWithTransform):
//   vtable @0x86c7d8; installed primary ptr = vtable+0x10 = 0x86c7e8
//                     installed secondary ptr = vtable+0x2f0 = 0x86cac8 (from D0 @0x499289)
//   *0x00   -> 0x4991c0  ~OZChannelGradientWithTransform  [D2]
//   *0x08   -> 0x499270  ~OZChannelGradientWithTransform  [D0 delete-thunk]
//   *0x10..*0x40 -> inherited OZFactoryBase/OZChannelBase getters (icon/id/serializer)
//   *0xe8   -> 0x499370  copy(OZChannelBase const*, bool)   [override]
//   *0xf8   -> 0x499330  clone() const                       [override]
//   *0x1b0  -> 0x499420  parseEnd(PCSerializerReadStream&)   [override]
//   *0x2c8  -> 0x499410  compare(OZChannelBase const*)       [override]
// (Remaining slots point to short ICF-folded stubs shared across the
//  OZChannel family — they are inherited behaviour, not overrides in this
//  class. See raw-port/re/disasm/OZChannelGradientWithTransform.*.s and
//  resolve.py Ozone vtable OZChannelGradientWithTransform for the raw dump.)
//
// STRUCT LAYOUT (recovered from D0 @0x499270 and parseEnd @0x499420):
//   +0x000  primary vptr        (= vtable + 0x10 = 0x86c7e8)
//   +0x010  secondary vptr      (= vtable + 0x2f0 = 0x86cac8)
//   +0x018..+0x9a7             OZChannelGradientPositioned base subobject (opaque here)
//   +0x9a8  OZChannelEnum       gradient-shape-or-orientation enum sub-channel
//   +0xaa8  OZChannelEnum       gradient-transform-flag enum sub-channel (default set by parseEnd)
//   +0xba8  OZChannelEnum       third enum sub-channel (opaque semantics, destroyed by D0)
//   size = 0xca8 bytes         (from clone @0x49933a: `movl $0xca8, %edi; callq operator new`)

// ---------------------------------------------------------------------------
// Sub-object handles used by parseEnd. The FCP symbols are external and
// deferred in this repo — declared as raising stubs so the gate can see the
// deferred addresses and the frontier tool can enumerate them. The
// addresses are the symbol-stub entry points inside Ozone.
// ---------------------------------------------------------------------------

/**
 * OZChannel::getValueAsInt(CMTime const&) const — @Ozone stub 0x6dfa80.
 * Reads the enum sub-channel's integer value at the given time.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannel_getValueAsInt(_channel: unknown, _time: unknown): number {
  throw new Error("OZChannel::getValueAsInt @Ozone 0x6dfa80 not yet transcribed");
}

/**
 * OZChannel::setValue(CMTime const&, double, bool) — @Ozone stub 0x6df456.
 * Sets the enum/scalar sub-channel's value at the given time.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannel_setValue(_channel: unknown, _time: unknown, _v: number, _flag: boolean): void {
  throw new Error("OZChannel::setValue @Ozone 0x6df456 not yet transcribed");
}

/**
 * OZChannelBase::setFlag(u64, bool) — @Ozone stub 0x6dd914.
 * Sets a bit-flag on the base OZChannelBase substruct.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannelBase_setFlag(_channel: unknown, _flag: bigint, _v: boolean): void {
  throw new Error("OZChannelBase::setFlag @Ozone 0x6dd914 not yet transcribed");
}

/**
 * OZChannelGradient::parseEnd(PCSerializerReadStream&) — @Ozone stub 0x6de244.
 * Parent-class parseEnd hook; drives the base positioned-gradient parse.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannelGradient_parseEnd(_self: unknown, _stream: unknown): number {
  throw new Error("OZChannelGradient::parseEnd @Ozone 0x6de244 not yet transcribed");
}

/**
 * OZChannelEnum::copy(OZChannelBase const*, bool) — @Ozone stub 0x6dd980.
 * Copies one OZChannelEnum sub-object into another.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannelEnum_copy(_dst: unknown, _src: unknown, _flag: boolean): void {
  throw new Error("OZChannelEnum::copy @Ozone 0x6dd980 not yet transcribed");
}

/**
 * OZChannelGradientPositioned::copy(OZChannelBase const*, bool) — @Ozone stub 0x6de8aa.
 * Base-class copy hook.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannelGradientPositioned_copy(_dst: unknown, _src: unknown, _flag: boolean): void {
  throw new Error("OZChannelGradientPositioned::copy @Ozone 0x6de8aa not yet transcribed");
}

/**
 * OZChannelFolder::compare(OZChannelBase const*) const — @Ozone stub 0x6df636.
 * Base-class comparator; compare() forwards directly to it.
 * Frontier callee (not yet transcribed) for OZChannelGradientWithTransform.
 */
export function OZChannelFolder_compare(_self: unknown, _other: unknown): number {
  throw new Error("OZChannelFolder::compare @Ozone 0x6df636 not yet transcribed");
}

// ---------------------------------------------------------------------------
// Minimal typing for a handle into a real OZChannelGradientWithTransform.
// The struct layout is documented above; TS ports only need to preserve the
// three enum sub-object slots + primary/secondary vptrs.
// ---------------------------------------------------------------------------
export interface OZChannelGradientWithTransformHandle {
  /** primary vptr slot (+0x000 in the C++ layout). */
  vptrPrimary: unknown;
  /** secondary vptr slot (+0x010 in the C++ layout). */
  vptrSecondary: unknown;
  /** OZChannelEnum sub-channel at +0x9a8 (gradient-shape/orientation). */
  channelEnumAt9a8: unknown;
  /** OZChannelEnum sub-channel at +0xaa8 (transform-enabled default). */
  channelEnumAtAa8: unknown;
  /** OZChannelEnum sub-channel at +0xba8 (opaque). */
  channelEnumAtBa8: unknown;
}

// Class footprint — from clone() @0x49933a (`movl $0xca8, %edi`).
export const OZChannelGradientWithTransform_SIZEOF = 0xca8;

// ---------------------------------------------------------------------------
// clone() — @0x499330. Allocates OZChannelGradientWithTransform_SIZEOF via
// operator new, then invokes the copy-ctor C2 @0x499070 with (this, null).
// The null OZChannelFolder* corresponds to the `xorl %edx, %edx` at @0x49934d.
// ---------------------------------------------------------------------------
/**
 * OZChannelGradientWithTransform::clone() const — @0x499330.
 *
 * Mirrors:
 *   movl $0xca8, %edi              ; @0x49933a — sizeof
 *   callq operator new             ; @0x49933f — __Znwm
 *   movq %rax, %rbx                ; keep new object
 *   movq %rax, %rdi
 *   movq %r14, %rsi                ; source = this
 *   xorl %edx, %edx                ; folder = nullptr
 *   callq C2                       ; @0x49934f — copy-ctor @0x499070
 *   movq %rbx, %rax                ; return new object
 *
 * The C2 copy-ctor at @0x499070 is not yet transcribed.
 */
export function OZChannelGradientWithTransform_clone(
  self: OZChannelGradientWithTransformHandle
): OZChannelGradientWithTransformHandle {
  // Faithful call sequence: allocate 0xca8, invoke copy-ctor with folder=null.
  const raw = new Uint8Array(OZChannelGradientWithTransform_SIZEOF);
  void raw;
  void self;
  throw new Error(
    "OZChannelGradientWithTransform copy-ctor @0x499070 not yet transcribed"
  );
}

// ---------------------------------------------------------------------------
// compare() — @0x499410. Trivial tail-jmp: forwards to OZChannelFolder::compare
// (@0x6df636). Reproduced exactly.
// ---------------------------------------------------------------------------
/**
 * OZChannelGradientWithTransform::compare(OZChannelBase const*) — @0x499410.
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp OZChannelFolder::compare
 */
export function OZChannelGradientWithTransform_compare(
  self: OZChannelGradientWithTransformHandle,
  other: unknown
): number {
  return OZChannelFolder_compare(self, other);
}

// ---------------------------------------------------------------------------
// copy() — @0x499370. Structure of the ported call sequence:
//   1. Chain to OZChannelGradientPositioned::copy(this, src, flag)  [@0x499383 -> 0x6de8aa]
//   2. dynamic_cast src to OZChannelGradientWithTransform*
//      via __dynamic_cast(src, &typeinfo(OZChannelBase),
//                              &typeinfo(OZChannelGradientWithTransform), 0)  [@0x4993a0]
//   3. OZChannelEnum::copy(this+0x9a8, src'+0x9a8, flag)             [@0x4993c2 -> 0x6dd980]
//   4. OZChannelEnum::copy(this+0xaa8, src'+0xaa8, flag)             [@0x4993d8 -> 0x6dd980]
//   5. tail-jmp OZChannelEnum::copy(this+0xba8, src'+0xba8, flag)    [@0x4993fe -> 0x6dd980]
// The dyn_cast returns null if `src` is not a subclass; the code then uses a
// null pointer for `src'`, which means the three OZChannelEnum::copy calls
// receive src=nullptr. The base implementations of OZChannelEnum::copy are
// external and not yet transcribed.
// ---------------------------------------------------------------------------
/**
 * OZChannelGradientWithTransform::copy(OZChannelBase const*, bool) — @0x499370.
 * Deferred: relies on __dynamic_cast + OZChannelGradientPositioned::copy +
 * OZChannelEnum::copy, none yet transcribed.
 */
export function OZChannelGradientWithTransform_copy(
  self: OZChannelGradientWithTransformHandle,
  src: OZChannelGradientWithTransformHandle | null,
  flag: boolean
): void {
  OZChannelGradientPositioned_copy(self, src, flag);
  // dynamic_cast: if src is null, src' = null; else attempt downcast.
  // TS can't reproduce Itanium __dynamic_cast bit-for-bit; the effective
  // behaviour is a runtime type check. The dispatch/typing is deferred.
  const srcCast: OZChannelGradientWithTransformHandle | null = src;
  const srcEnum9a8 = srcCast ? srcCast.channelEnumAt9a8 : null;
  const srcEnumAa8 = srcCast ? srcCast.channelEnumAtAa8 : null;
  const srcEnumBa8 = srcCast ? srcCast.channelEnumAtBa8 : null;
  OZChannelEnum_copy(self.channelEnumAt9a8, srcEnum9a8, flag);
  OZChannelEnum_copy(self.channelEnumAtAa8, srcEnumAa8, flag);
  OZChannelEnum_copy(self.channelEnumAtBa8, srcEnumBa8, flag);
}

// ---------------------------------------------------------------------------
// parseEnd() — @0x499420. The one function with a real numeric decision.
//
//   callq OZChannelGradient::parseEnd(this, stream)   ; @0x49942e
//   store return in %r12d (kept for the return path)
//   testb $0x2, 0x9e0(this)                            ; @0x499433 — early-out flag on the
//                                                          OZChannelGradient parent subobject
//   jne .Lret                                          ; if flag bit 0x2 already set, just return %r12d
//   r14 = this + 0x9a8                                 ; first enum sub-channel
//   r15 = &_kCMTimeZero                                ; CoreMedia global CMTime value = zero time
//   xorps xmm0, xmm0                                   ; (unused — clears the arg register slot)
//   %eax = OZChannel::getValueAsInt(r14, r15)          ; @0x499456 — reads enum @+0x9a8
//   rbx += 0xaa8                                        ; rbx = this + 0xaa8 (second enum sub-channel)
//   cmp %eax, 2                                        ; @0x499462
//   je .Lone                                            ; if reading is 2 -> xmm0 = 1.0
//   xorps xmm0, xmm0                                    ; else xmm0 = 0.0
//   jmp .Lset
//  .Lone:
//   movsd 0x26bf6c(%rip), xmm0                          ; @0x49946c — load double 1.0 from
//                                                          Ozone __TEXT VA 0x7053e0 (verified via
//                                                          resolve.py Ozone const 0x7053e0 ->
//                                                          double=1.0 u64=0x3ff0000000000000)
//  .Lset:
//   OZChannel::setValue(rbx=this+0xaa8, r15=&_kCMTimeZero, xmm0, false)   ; @0x49947c
//   OZChannelBase::setFlag(r14=this+0x9a8, 2, false)                       ; @0x49948b
//   return %r12d (the value from OZChannelGradient::parseEnd)
// ---------------------------------------------------------------------------

/** RIP-relative double at Ozone VA 0x7053e0 (1.0) — from @0x499474+0x26bf6c. */
export const OZChannelGradientWithTransform_PARSE_END_ONE = 1.0; // @Ozone 0x7053e0

/** CMTime zero literal reference — @Ozone symbol _kCMTimeZero (via literal pool @0x499446). */
export interface CMTimeHandle {
  readonly _kCMTimeZeroRef: true;
}
export const kCMTimeZero: CMTimeHandle = Object.freeze({ _kCMTimeZeroRef: true } as const);

/**
 * OZChannelGradientWithTransform::parseEnd(PCSerializerReadStream&) — @0x499420.
 *
 * Reads the parent-class parseEnd, then, unless the parent flag bit 0x2 at
 * `+0x9e0` is already set, initialises the transform-enabled default at the
 * +0xaa8 enum sub-channel from the shape/orientation reading at +0x9a8.
 *
 * `parentFlagAt9e0Bit1` corresponds to the memory-mapped flag byte tested by
 * `testb $0x2, 0x9e0(this)` @0x499433; it lives on the OZChannelGradient
 * subobject and is not owned by this class. TS callers must project it out of
 * the parent state.
 */
export function OZChannelGradientWithTransform_parseEnd(
  self: OZChannelGradientWithTransformHandle,
  stream: unknown,
  parentFlagAt9e0Bit1: boolean
): number {
  const baseResult = OZChannelGradient_parseEnd(self, stream); // @0x49942e
  if (parentFlagAt9e0Bit1) {
    return baseResult; // @0x49943a jne .Lret
  }
  // r14 = +0x9a8 enum sub-channel; rbx post-add = +0xaa8 enum sub-channel.
  const shapeReading = OZChannel_getValueAsInt(self.channelEnumAt9a8, kCMTimeZero); // @0x499456
  // cmp $0x2 / je -> 1.0 else 0.0 (@0x499462..0x49946c).
  const defaultValue =
    shapeReading === 2 ? OZChannelGradientWithTransform_PARSE_END_ONE : 0.0;
  // setValue(this+0xaa8, kCMTimeZero, defaultValue, false)  @0x49947c
  OZChannel_setValue(self.channelEnumAtAa8, kCMTimeZero, defaultValue, false);
  // setFlag(this+0x9a8, 2, false)  @0x49948b
  OZChannelBase_setFlag(self.channelEnumAt9a8, 2n, false);
  return baseResult;
}
