// raw-port/src/channels/OZChannelGradientSample.ts
//
// FCP `OZChannelGradientSample` (ProChannel framework) — a channel-tree
// class that models one "sample" (colour stop) inside a gradient. The
// class extends `OZChannelFolder` and holds THREE per-instance
// sub-channels:
//
//   +0x080  offset         : OZChannelPercent  ("Channel GradientSample Offset")
//   +0x118  middle         : OZChannelPercent  ("Channel GradientSample Middle")
//   +0x1b0  interpolation  : OZChannelEnum     ("Channel GradientSample Interpolation")
//
// The interpolation enum is driven by the singleton `interpolationImpl`
// nested type (a subclass of OZChannelImpl+PCSingleton), which supplies:
//   - the underlying curve created via
//     `OZChannelEnum::createOZChannelEnumCurve(2.0)`
//     (i.e. an int-valued curve with range parameter 2.0),
//   - a default value of 2.0 (interpretation = "linear" enum #2, matching
//     the `movl $0x2, %esi` argument to `OZChannelEnum::OZChannelEnum` in
//     every ctor's enum-construction path),
//   - min = 0.0, max = 4294967295.0 (i.e. UINT32_MAX as an inclusive
//     upper bound for the enum's numeric field),
//   - a PCSingleton "class id" of 0x32 (50).
//
// Framework: ProChannel
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
// The x86_64 slice was extracted to /tmp/ProChannel.x86_64; because the file
// is a plain Mach-O without slide, on-disk offsets equal runtime VAs — every
// @0xADDR below refers to both the on-disk offset AND the runtime VA.
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/ProChannel.OZChannelGradientSample.*.s):
//
//   @0x6d944  C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32)             [5-arg factory + folder]
//   @0x6db2a  C1(OZFactory*, PCString&, OZChannelFolder*, u32, u32)             [C1 wrapper — ICF-aliases the C2 body]
//   @0x6db34  C2(OZFactory*, PCString&, u32)                                    [3-arg factory, no folder]
//   @0x6dd16  C1(OZFactory*, PCString&, u32)                                    [C1 wrapper]
//   @0x6dd20  C2(PCString&, OZChannelFolder*, u32, u32)                         [4-arg no-factory — looks up singleton factory]
//   @0x6df28  C1(PCString&, OZChannelFolder*, u32, u32)                         [C1 wrapper]
//   @0x6df32  C2(OZFactory*, PCString&, double, double, int, OZChannelFolder*, u32, u32) [10-arg preset — offset/middle from xmm0/xmm1, enum-tag from int arg]
//   @0x6e13e  C1(OZFactory*, PCString&, double, double, int, OZChannelFolder*, u32, u32) [C1 wrapper]
//   @0x6e148  C2(OZChannelGradientSample const&, OZChannelFolder*)              [copy body — chains base copy + copies each sub-channel]
//   @0x6e1ee  C1(OZChannelGradientSample const&, OZChannelFolder*)              [C1 wrapper]
//   @0x6e1f8  ~OZChannelGradientSample()  [D2 base dtor — reinstalls vtables and destroys each sub-channel in reverse order]
//   @0x6e248  ~OZChannelGradientSample()  [D1 complete dtor — thin wrapper that tail-jumps to D2 (ICF-alias)]
//   @0x6e260  ~OZChannelGradientSample()  [D0 deleting dtor — D2 body then op delete]
//   @0x6e2a0  clone() const                                                     [operator new(0x2b0) + copy ctor with folder=null]
//   @0x6e2e0  copy(OZChannelBase const*, bool)                                  [chain base + OZChannel::copy x3 (offset/middle/enum)]
//   @0x6e36c  getObjCWrapperName()                                              [return CFStringRef @0xe5650 = "CHChannelGradientSample"]
//   @0x6e37a  parseEnd(PCSerializerReadStream&)                                 [clear bit0 of this+0x3a then tail-jmp to OZChannelFolder::parseEnd]
//
//   @0x6edbc  interpolationImpl::getInstance()                                  [thread-safe static init + return static ptr]
//   @0x6ee58  interpolationImpl::interpolationImpl()  [C2 body]                 [build curve + configure singleton min/max/id]
//   @0x6ef1a  interpolationImpl::~interpolationImpl()  [D0]                     [PCSingleton::~ + OZChannelImpl::~ + operator delete]
//
// VTABLE addresses (constant across ALL ctors — verified below in comments):
//   vtable_primary   installed at this+0x00  = @0xdb698   (= &vtable+0x10 from the RIP-relative leaq)
//   vtable_secondary installed at this+0x10  = @0xdb970   (= &vtable+0x2f0)
//
//   Verifications:
//     C2 5-arg  (@0x6d964..0x6d975): 0x6d96b + 0x6dd2d = 0xdb698 ;  0x6d975 + 0x6dffb = 0xdb970
//     C2 3-arg  (@0x6db50..0x6db61): 0x6db57 + 0x6db41 = 0xdb698 ;  0x6db61 + 0x6de0f = 0xdb970
//     C2 4-arg  (@0x6dd63..0x6dd74): 0x6dd6a + 0x6d92e = 0xdb698 ;  0x6dd74 + 0x6dbfc = 0xdb970
//     C2 10-arg (@0x6df6c..0x6df7d): 0x6df73 + 0x6d725 = 0xdb698 ;  0x6df7d + 0x6d9f3 = 0xdb970
//     C2 copy   (@0x6e15e..0x6e16f): 0x6e165 + 0x6d533 = 0xdb698 ;  0x6e16f + 0x6d801 = 0xdb970
//     D2        (@0x6e201..0x6e212): 0x6e208 + 0x6d490 = 0xdb698 ;  0x6e212 + 0x6d75e = 0xdb970
//
// STRUCT LAYOUT (recovered from C2 ctors + D2 dtor + copy):
// ---------------------------------------------------------------------------
//   +0x000  vptr_primary            — installed by every ctor; value = 0xdb698.
//   +0x010  vptr_secondary          — installed by every ctor; value = 0xdb970.
//   +0x018..+0x07f                  — inherited OZChannelFolder base subobject (opaque here).
//   +0x03a  (byte)  parseEnd flag   — parseEnd @0x6e37a executes `andb $-0x2, 0x3a(%rdi)`,
//                                     i.e. clear bit 0 of the byte at this+0x3a. The bit
//                                     lives inside the OZChannelFolder base and represents
//                                     an as-yet-undecoded parse-time state flag.
//   +0x080  offset : OZChannelPercent           — ctor arg (percent-index 1, no impl/info).
//                                     Constructed via `OZChannelPercent::C1(double, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*)`
//                                     with default value in xmm0 (0.0 for the 4/5-arg ctors,
//                                     `arg1_double` for the 10-arg ctor), name from the
//                                     bundle-localised CFString "Channel GradientSample Offset"
//                                     (@0xbccd3), folder=this, u32a=1, u32b=0, impl=null, info=null.
//                                     Verified size: 0x118 - 0x80 = 0x98 bytes.
//   +0x118  middle : OZChannelPercent           — ctor arg (percent-index 2, no impl/info).
//                                     Same call shape as `offset`; xmm0=0.0 (4/5-arg) or
//                                     `arg2_double` (10-arg); name = "Channel GradientSample Middle"
//                                     (@0xbccf1); u32a=2, u32b=0; impl=null; info=null.
//                                     Verified size: 0x1b0 - 0x118 = 0x98 bytes.
//   +0x1b0  interpolation : OZChannelEnum       — ctor arg (enum-tag 2, impl=singleton,
//                                     u32a=0x64=100, u32b=0, info=null).
//                                     `OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&,
//                                     OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*)`
//                                     is called with:
//                                       arg1_u32 = 2 (except in the 10-arg ctor where the
//                                                   `int` C++ argument is passed through — the
//                                                   caller may pass any small tag; the singleton
//                                                   getInstance() is only used when this arg == 2,
//                                                   otherwise the impl pointer is null — see
//                                                   `cmpl $0x2, %r15d ; jne` at @0x6e057..@0x6e05b
//                                                   in the 10-arg body),
//                                       name1    = "Channel GradientSample Interpolation Enum" (@0xbcd0f),
//                                       name2    = "Channel GradientSample Interpolation"      (@0xbcd39),
//                                       folder   = this,
//                                       u32a     = 0x64,
//                                       u32b     = 0,
//                                       impl     = interpolationImpl::getInstance()  (or null),
//                                       info     = null.
//                                     Verified size: 0x2b0 - 0x1b0 = 0x100 bytes
//                                     (matches the parent-subobject size of
//                                      OZChannelGradientSampleRGB, whose own member starts at +0x2b0).
//   +0x2b0..end                     — end of this class's own storage; subclasses (e.g.
//                                     OZChannelGradientSampleRGB) extend from here.
//
// clone() @0x6e2a0 allocates 0x2b0 bytes (`movl $0x2b0, %edi ; callq __Znwm`) then invokes the
// copy ctor with folder=null — which corroborates the class size as 0x2b0.
//
// interpolationImpl STRUCT LAYOUT (recovered from C2 @0x6ee58 + D0 @0x6ef1a):
// ---------------------------------------------------------------------------
//   +0x000  OZChannelImpl base subobject          — first field is the vtable pointer
//                                                    (installed @0x6eea8 to
//                                                    &vtable_interpolationImpl+0x10).
//   +0x028  PCSingleton base-secondary subobject  — second base; ctor at @0x6ee98 with id=0x32.
//                                                    Second-base vptr @0x6eeaf installed to
//                                                    &vtable+0x30.
//   min = 0.0                                     — setMin @0x6eeb9 (xorps %xmm0,%xmm0).
//   max = 4294967295.0                            — setMax @0x6eec9 (movsd @ProChannel 0xaf540).
//
// The static `_OZChannelGradientSample_interpolation` slot at
// `__ZN23OZChannelGradientSample41OZChannelGradientSample_interpolationImpl38_OZChannelGradientSample_interpolationE`
// is populated lazily by the lambda body of getInstance() (accessed @0x6edfb after
// `std::__1::__call_once`), and returned as an `OZChannelImpl*`.
// ---------------------------------------------------------------------------
//
// Wrapper string (decoded from /tmp/ProChannel.x86_64, verified with a small python
// unpack of the __CFConstantString at file offset 0xe5650):
//   __CFConstantString @0xe5650  isa=0x802000000000020a  flag=0x7c8
//     ptr = 0xbcd5e (low-32)  len = 23  ->  "CHChannelGradientSample"
//
// The four localisable name CFStrings referenced by every non-copy ctor:
//   @0xe55d0 -> str@0xbccd3 (len 29)  "Channel GradientSample Offset"
//   @0xe55f0 -> str@0xbccf1 (len 29)  "Channel GradientSample Middle"
//   @0xe5610 -> str@0xbcd0f (len 41)  "Channel GradientSample Interpolation Enum"
//   @0xe5630 -> str@0xbcd39 (len 36)  "Channel GradientSample Interpolation"
//

// ---------------------------------------------------------------------------
// Opaque handles for FCP types that this class refers to but that are not yet
// individually ported. Each carries its own brand so callers cannot accidentally
// substitute one for another.
// ---------------------------------------------------------------------------

/** Opaque FCP `OZFactory*` — first arg to every 5/3/10-arg C2 ctor. */
export interface OZFactoryLike { readonly __ozFactory: true; }

/** Opaque FCP `PCString&` — every C2 ctor takes the channel-tree name here. */
export interface PCStringLike { readonly __pcString: true; }

/** Opaque FCP `OZChannelFolder*` — parent folder pointer; may be null. */
export interface OZChannelFolderLike { readonly __ozChannelFolder: true; }

/** Opaque FCP `OZChannelImpl*` — impl pointer stored inside the enum sub-channel. */
export interface OZChannelImplLike { readonly __ozChannelImpl: true; }

/** Opaque FCP `OZChannelInfo*` — always null at every call site in this class. */
export interface OZChannelInfoLike { readonly __ozChannelInfo: true; }

/** Opaque FCP `OZChannelBase*` — parameter to `copy(OZChannelBase*, bool)`. */
export interface OZChannelBaseLike { readonly __ozChannelBase: true; }

/** Opaque FCP `PCSerializerReadStream&` — parameter to `parseEnd`. */
export interface PCSerializerReadStreamLike { readonly __pcSerializerReadStream: true; }

// ---------------------------------------------------------------------------
// Frontier callees — each throws with its exact source address so the frontier
// tool can see the outstanding gap (Rule 3: throw on undecoded).
// ---------------------------------------------------------------------------

/**
 * OZChannelFolder base ctor. Two overloads are used by this class:
 *   - 4-arg  (OZFactory*, PCString&, u32, u32)              @ProChannel  (@0x6db4b call site — from the 3-arg C2)
 *   - 6-arg  (OZFactory*, PCString&, OZChannelFolder*, u32, u32, u32) @ProChannel
 *            (@0x6d95f, @0x6dd5e, @0x6df67 call sites)
 *   - copy   (OZChannelFolder const&, OZChannelFolder*)     @ProChannel  (@0x6e159 call site)
 * @frontier ProChannel OZChannelFolder
 */
export function OZChannelFolder_ctor(_this: unknown, ..._args: unknown[]): void {
  throw new Error(
    "OZChannelFolder::OZChannelFolder ctor @ProChannel called from " +
      "OZChannelGradientSample @0x6d95f / @0x6db4b / @0x6dd5e / @0x6df67 / @0x6e159 " +
      "not yet transcribed",
  );
}

/** OZChannelFolder base dtor @ProChannel (call site @0x6e243 — jmp from D2). */
export function OZChannelFolder_dtor(_this: unknown): void {
  throw new Error(
    "OZChannelFolder::~OZChannelFolder @ProChannel (jmp @0x6e243) not yet transcribed",
  );
}

/**
 * OZChannelFolder::copy(OZChannelBase const*, bool) @ProChannel
 * (call site @0x6e2f3 — chained from OZChannelGradientSample::copy).
 * @frontier ProChannel OZChannelFolder
 */
export function OZChannelFolder_copy(_this: unknown, _src: unknown, _b: boolean): void {
  throw new Error(
    "OZChannelFolder::copy @ProChannel (call @0x6e2f3) not yet transcribed",
  );
}

/**
 * OZChannelFolder::parseEnd(PCSerializerReadStream&) @ProChannel
 * (tail-jmp target from parseEnd @0x6e383).
 * @frontier ProChannel OZChannelFolder
 */
export function OZChannelFolder_parseEnd(_this: unknown, _stream: PCSerializerReadStreamLike): void {
  throw new Error(
    "OZChannelFolder::parseEnd @ProChannel (tail-jmp @0x6e383) not yet transcribed",
  );
}

/**
 * getProChannelBundle() @ProChannel — a bare CFBundle accessor called once
 * per CFString-localisation site.
 * @frontier ProChannel getProChannelBundle
 */
export function getProChannelBundle(): unknown {
  throw new Error(
    "getProChannelBundle @ProChannel (call sites @0x6d979 / @0x6d9c8 / @0x6da17 / @0x6da31 " +
      "and mirrored in every other ctor) not yet transcribed",
  );
}

/**
 * `PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef)` @ProChannel — the
 * bundle-localised name ctor called for each of the four label CFStrings.
 * @frontier ProChannel PCString
 */
export function PCString_ctor_cf(
  _this: unknown,
  _cfstr: unknown,
  _bundle1: unknown,
  _bundle2: unknown,
): void {
  throw new Error(
    "PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef) @ProChannel " +
      "(call sites @0x6d98e / @0x6d9dd / @0x6da2c / @0x6da46 in the 5-arg C2, mirrored in " +
      "every other ctor) not yet transcribed",
  );
}

/** `PCString::~PCString()` @ProChannel — dtor for the temporary name strings. */
export function PCString_dtor(_this: unknown): void {
  throw new Error(
    "PCString::~PCString @ProChannel (call sites @0x6d9c3 / @0x6da12 / @0x6da8e / @0x6da97 " +
      "in the 5-arg C2, mirrored in every other ctor) not yet transcribed",
  );
}

/**
 * OZChannelPercent::OZChannelPercent(double, PCString&, OZChannelFolder*, u32, u32,
 *   OZChannelImpl*, OZChannelInfo*) @ProChannel — 7-arg C1 (call sites
 *   @0x6d9ba / @0x6da09 in the 5-arg C2, mirrored in every other ctor).
 * @frontier ProChannel OZChannelPercent
 */
export function OZChannelPercent_ctor(
  _this: unknown,
  _defaultValue: number,
  _name: PCStringLike,
  _folder: unknown,
  _u32a: number,
  _u32b: number,
  _impl: OZChannelImplLike | null,
  _info: OZChannelInfoLike | null,
): void {
  throw new Error(
    "OZChannelPercent::OZChannelPercent(double, PCString&, OZChannelFolder*, u32, u32, " +
      "OZChannelImpl*, OZChannelInfo*) @ProChannel not yet transcribed",
  );
}

/**
 * OZChannelPercent::OZChannelPercent(OZChannelPercent const&, OZChannelFolder*)
 * @ProChannel — copy ctor (call sites @0x6e185 / @0x6e19c in the copy C2).
 * @frontier ProChannel OZChannelPercent
 */
export function OZChannelPercent_copy_ctor(
  _this: unknown,
  _src: unknown,
  _folder: unknown,
): void {
  throw new Error(
    "OZChannelPercent::OZChannelPercent(OZChannelPercent const&, OZChannelFolder*) " +
      "@ProChannel (call @0x6e185 / @0x6e19c) not yet transcribed",
  );
}

/**
 * OZChannelPercent::~OZChannelPercent() @ProChannel — dtor (call sites
 *   @0x6e229 / @0x6e235 in D2, plus the landing-pad chain in every C2).
 * @frontier ProChannel OZChannelPercent
 */
export function OZChannelPercent_dtor(_this: unknown): void {
  throw new Error(
    "OZChannelPercent::~OZChannelPercent @ProChannel (calls @0x6e229 / @0x6e235) not yet transcribed",
  );
}

/**
 * OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32,
 *   OZChannelImpl*, OZChannelInfo*) @ProChannel — 8-arg C1 (call sites
 *   @0x6da85 / @0x6dc71 / @0x6de84 / @0x6e099 in the four non-copy C2 bodies).
 * @frontier ProChannel OZChannelEnum
 */
export function OZChannelEnum_ctor(
  _this: unknown,
  _tag: number,
  _name1: PCStringLike,
  _name2: PCStringLike,
  _folder: unknown,
  _u32a: number,
  _u32b: number,
  _impl: OZChannelImplLike | null,
  _info: OZChannelInfoLike | null,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, " +
      "OZChannelImpl*, OZChannelInfo*) @ProChannel not yet transcribed",
  );
}

/**
 * OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) @ProChannel —
 * copy ctor (call site @0x6e1b3 in the copy C2).
 * @frontier ProChannel OZChannelEnum
 */
export function OZChannelEnum_copy_ctor(
  _this: unknown,
  _src: unknown,
  _folder: unknown,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) @ProChannel " +
      "(call @0x6e1b3) not yet transcribed",
  );
}

/**
 * OZChannelEnum::~OZChannelEnum() @ProChannel — dtor (call site @0x6e21d in D2, plus
 * the enum landing-pad in every C2).
 * @frontier ProChannel OZChannelEnum
 */
export function OZChannelEnum_dtor(_this: unknown): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum @ProChannel (call @0x6e21d and landing pads) not yet transcribed",
  );
}

/**
 * OZChannelEnum::copy(OZChannelBase const*, bool) @ProChannel — tail-jmp target
 * of OZChannelGradientSample::copy @0x6e367.
 * @frontier ProChannel OZChannelEnum
 */
export function OZChannelEnum_copy(_this: unknown, _src: unknown, _b: boolean): void {
  throw new Error(
    "OZChannelEnum::copy @ProChannel (tail-jmp @0x6e367 from OZChannelGradientSample::copy) " +
      "not yet transcribed",
  );
}

/**
 * OZChannel::copy(OZChannelBase const*, bool) @ProChannel — the two non-final
 * sub-channel copy calls at @0x6e330 (offset @+0x80) and @0x6e344 (middle @+0x118).
 * Both re-use `OZChannel::copy` on the base OZChannelPercent subobjects.
 * @frontier ProChannel OZChannel
 */
export function OZChannel_copy(_this: unknown, _src: unknown, _b: boolean): void {
  throw new Error(
    "OZChannel::copy @ProChannel (calls @0x6e330 / @0x6e344 from OZChannelGradientSample::copy) " +
      "not yet transcribed",
  );
}

/**
 * OZChannelEnum::createOZChannelEnumCurve(double) @ProChannel — factory called
 * once at @0x6ee6d with xmm0 = 2.0 to seed the interpolation-impl curve.
 * Returns an `OZCurve*`.
 * @frontier ProChannel OZChannelEnum
 */
export function OZChannelEnum_createOZChannelEnumCurve(_v: number): unknown {
  throw new Error(
    "OZChannelEnum::createOZChannelEnumCurve @ProChannel (call @0x6ee6d) not yet transcribed",
  );
}

/**
 * OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) @ProChannel —
 * base ctor of the singleton impl (call site @0x6ee87 with xmm0=2.0, edx=0, ecx=1).
 * @frontier ProChannel OZChannelImpl
 */
export function OZChannelImpl_ctor(
  _this: unknown,
  _curve: unknown,
  _defaultValue: number,
  _u32: number,
  _bool: boolean,
): void {
  throw new Error(
    "OZChannelImpl::OZChannelImpl(OZCurve*, double, u32, bool) @ProChannel " +
      "(call @0x6ee87) not yet transcribed",
  );
}

/** OZChannelImpl::~OZChannelImpl() @ProChannel — call site @0x6eef4 (interp D0 unwind) and @0x6ef2f (interp D0 tail). */
export function OZChannelImpl_dtor(_this: unknown): void {
  throw new Error(
    "OZChannelImpl::~OZChannelImpl @ProChannel (calls @0x6eef4 / @0x6ef2f) not yet transcribed",
  );
}

/** OZChannelImpl::setMin(double) @ProChannel — call site @0x6eeb9 with xmm0=0.0. */
export function OZChannelImpl_setMin(_this: unknown, _v: number): void {
  throw new Error(
    "OZChannelImpl::setMin @ProChannel (call @0x6eeb9) not yet transcribed",
  );
}

/** OZChannelImpl::setMax(double) @ProChannel — call site @0x6eec9 with xmm0=4294967295.0. */
export function OZChannelImpl_setMax(_this: unknown, _v: number): void {
  throw new Error(
    "OZChannelImpl::setMax @ProChannel (call @0x6eec9) not yet transcribed",
  );
}

/**
 * PCSingleton::PCSingleton(u32) @ProChannel — second-base ctor called at
 * @0x6ee98 with esi=0x32 (id=50).
 * @frontier ProChannel PCSingleton
 */
export function PCSingleton_ctor(_this: unknown, _id: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(u32) @ProChannel (call @0x6ee98) not yet transcribed",
  );
}

/** PCSingleton::~PCSingleton() @ProChannel — call site @0x6eee4 (interp landing pad) and @0x6ef27 (interp D0). */
export function PCSingleton_dtor(_this: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton @ProChannel (calls @0x6eee4 / @0x6ef27) not yet transcribed",
  );
}

/**
 * OZChannelGradientSample_Factory::getInstance() @ProChannel — invoked by the
 * 4-arg no-factory C2 @0x6dd40 to fetch the singleton factory that then feeds
 * OZChannelFolder's ctor. `OZFactory*` return.
 * @frontier ProChannel OZChannelGradientSample_Factory
 */
export function OZChannelGradientSample_Factory_getInstance(): OZFactoryLike {
  throw new Error(
    "OZChannelGradientSample_Factory::getInstance @ProChannel (call @0x6dd40) not yet transcribed",
  );
}

/**
 * `__dynamic_cast(src, &typeinfo<OZChannelBase>, &typeinfo<OZChannelGradientSample>, 0)`
 * @ProChannel — the src-side down-cast performed inside `copy` @0x6e310.
 * @frontier ProChannel __dynamic_cast
 */
export function dynamic_cast_OZChannelBase_to_OZChannelGradientSample(_src: unknown): unknown {
  throw new Error(
    "__dynamic_cast<OZChannelGradientSample>(OZChannelBase*) @ProChannel (call @0x6e310) " +
      "not yet transcribed",
  );
}

/**
 * `operator new(size_t)` @ProChannel — called by clone @0x6e2af with rdi=0x2b0.
 * Returns a raw allocation of exactly `size` bytes.
 */
export function operator_new(_size: number): object {
  throw new Error(
    "operator new @ProChannel (call @0x6e2af, size=0x2b0) not yet transcribed",
  );
}

/**
 * The vtable-slot-0x80 virtual call executed by every non-copy ctor at the end
 * of its body:
 *   `movq (%rbx), %rax ; movq %rbx, %rdi ; callq *0x80(%rax)`
 * This is a virtual member function invoked on the just-constructed instance
 * via the primary vtable at offset 0x80. Because the primary vtable @0xdb698 has
 * not yet been decoded, this call site is deferred.
 * @frontier ProChannel OZChannelGradientSample_vtable
 */
export function OZChannelGradientSample_vtable_slot80_call(_this: unknown): void {
  throw new Error(
    "vtable[0x80] virtual call @ProChannel (invoked at end of every non-copy C2 body — " +
      "@0x6daa2 / @0x6dc8e / @0x6dea1 / @0x6e0b6) not yet transcribed — requires primary " +
      "vtable @0xdb698 decode",
  );
}

// ---------------------------------------------------------------------------
// OZChannelGradientSample — the class itself.
// ---------------------------------------------------------------------------

/**
 * `OZChannelGradientSample` — one colour stop inside a gradient. Extends
 * OZChannelFolder with THREE sub-channels: offset, middle, and an
 * interpolation enum backed by a singleton `interpolationImpl`.
 *
 * Class size = 0x2b0 bytes (from clone @0x6e2aa: `movl $0x2b0, %edi`).
 *
 * VTables (both installed at every C2 entry — see the header):
 *   this+0x00  -> @0xdb698  (primary)
 *   this+0x10  -> @0xdb970  (secondary)
 */
export class OZChannelGradientSample {
  /** @0x080  Sub-channel: "Channel GradientSample Offset". */
  private _offset: unknown = null;
  /** @0x118  Sub-channel: "Channel GradientSample Middle". */
  private _middle: unknown = null;
  /** @0x1b0  Sub-channel: "Channel GradientSample Interpolation" (enum). */
  private _interpolation: unknown = null;

  /**
   * OZChannelGradientSample(OZFactory*, PCString&, OZChannelFolder*, u32, u32)
   * C2 @0x6d944  (C1 @0x6db2a tail-jmps here).
   *
   * Body walkthrough (line-for-line):
   *   @0x6d955 movq  %rdi, %rbx                               — save this.
   *   @0x6d958 movl  $0x0, (%rsp)                              — clear stack slot used as u32 arg 6.
   *   @0x6d95f callq OZChannelFolder::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32, u32)
   *                                                           — base ctor; the trailing 0-slot
   *                                                             from (%rsp) is the u32 arg 6.
   *   @0x6d964 leaq  0x6dd2d(%rip), %rax
   *   @0x6d96b movq  %rax, (%rbx)                              — install primary vptr @0xdb698.
   *   @0x6d96e leaq  0x6dffb(%rip), %rax
   *   @0x6d975 movq  %rax, 0x10(%rbx)                          — install secondary vptr @0xdb970.
   *
   *   [offset sub-channel — this+0x80]
   *   @0x6d979 callq getProChannelBundle()                     — CFBundle*.
   *   @0x6d97e leaq  0x77c4b(%rip), %rsi                       — CFString @0xe55d0 ("Channel GradientSample Offset").
   *   @0x6d98e callq PCString::PCString(CFStringRef, CFBundle*, CFBundle*).
   *   @0x6d993 leaq  0x80(%rbx), %r14                          — r14 = &this[+0x80].
   *   @0x6d99a movq  $0x0, (%rsp)                              — impl arg (last stack slot) = null.
   *   @0x6d9a6 xorps %xmm0, %xmm0                              — defaultValue = 0.0.
   *   @0x6d9af movl  $0x1, %ecx                                — u32a (percent-index) = 1.
   *   @0x6d9b4 xorl  %r8d,  %r8d                               — u32b = 0.
   *   @0x6d9b7 xorl  %r9d,  %r9d                               — info = null.
   *   @0x6d9ba callq OZChannelPercent::C1(double, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*)
   *   @0x6d9c3 callq PCString::~PCString().
   *
   *   [middle sub-channel — this+0x118]
   *   @0x6d9c8 callq getProChannelBundle().
   *   @0x6d9cd leaq  0x77c1c(%rip), %rsi                       — CFString @0xe55f0 ("Channel GradientSample Middle").
   *   @0x6d9dd callq PCString::PCString(...).
   *   @0x6d9e2 leaq  0x118(%rbx), %r15                         — r15 = &this[+0x118].
   *   @0x6d9fb movl  $0x2, %ecx                                — u32a (percent-index) = 2.
   *   @0x6da09 callq OZChannelPercent::C1(...).
   *   @0x6da12 callq PCString::~PCString().
   *
   *   [interpolation sub-channel — this+0x1b0]
   *   @0x6da17 callq getProChannelBundle().
   *   @0x6da1c leaq  0x77bed(%rip), %rsi                       — CFString @0xe5610 ("Channel GradientSample Interpolation Enum").
   *   @0x6da2c callq PCString::PCString(...).
   *   @0x6da31 callq getProChannelBundle().
   *   @0x6da36 leaq  0x77bf3(%rip), %rsi                       — CFString @0xe5630 ("Channel GradientSample Interpolation").
   *   @0x6da46 callq PCString::PCString(...).
   *   @0x6da4b callq interpolationImpl::getInstance()          — impl pointer.
   *   @0x6da50 leaq  0x1b0(%rbx), %r13                         — r13 = &this[+0x1b0].
   *   @0x6da57 movq  %rax, 0x8(%rsp)                           — impl arg on stack.
   *   @0x6da5c movq  $0x0, 0x10(%rsp)                          — info arg on stack = null.
   *   @0x6da65 movl  $0x0, (%rsp)                              — trailing u32 slot = 0.
   *   @0x6da77 movl  $0x2, %esi                                — tag = 2.
   *   @0x6da7f movl  $0x64, %r9d                               — u32a = 0x64.
   *   @0x6da85 callq OZChannelEnum::C1(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*).
   *   @0x6da8e callq PCString::~PCString() (name2).
   *   @0x6da97 callq PCString::~PCString() (name1).
   *
   *   [trailing virtual call]
   *   @0x6da9c movq  (%rbx), %rax                              — load primary vptr.
   *   @0x6da9f movq  %rbx, %rdi                                — this.
   *   @0x6daa2 callq *0x80(%rax)                               — vtable[0x80]. Deferred.
   *   @0x6daa8 ret.
   *
   * Per Rule 3 the ctor @0x6d944 throws pending decode of its callees.
   */
  constructor(
    _factory: OZFactoryLike,
    _name: PCStringLike,
    _folder: OZChannelFolderLike | null,
    _u32a: number,
    _u32b: number,
  ) {
    throw new Error(
      "OZChannelGradientSample::OZChannelGradientSample(OZFactory*, PCString&, OZChannelFolder*, u32, u32) " +
        "@ProChannel 0x6d944 not yet transcribed — requires OZChannelFolder base ctor @0x6d95f, " +
        "getProChannelBundle @0x6d979, PCString(CFStringRef,...) @0x6d98e, " +
        "OZChannelPercent::C1 @0x6d9ba (+0x80) and @0x6da09 (+0x118), " +
        "interpolationImpl::getInstance @0x6da4b, OZChannelEnum::C1 @0x6da85 (+0x1b0), " +
        "and vtable[0x80] @0x6daa2.",
    );
  }

  /**
   * OZChannelGradientSample::~OZChannelGradientSample()
   *
   *   D2 @0x6e1f8 (base dtor — the substantive body):
   *     @0x6e201 leaq  0x6d490(%rip), %rax ; movq %rax, (%rdi)    — reinstall primary vptr @0xdb698.
   *     @0x6e20b leaq  0x6d75e(%rip), %rax ; movq %rax, 0x10(%rdi) — reinstall secondary vptr @0xdb970.
   *     @0x6e216 addq  $0x1b0, %rdi
   *     @0x6e21d callq OZChannelEnum::~OZChannelEnum()             — destroy interp @+0x1b0.
   *     @0x6e222 leaq  0x118(%rbx), %rdi
   *     @0x6e229 callq OZChannelPercent::~OZChannelPercent()       — destroy middle @+0x118.
   *     @0x6e22e leaq  0x80(%rbx), %rdi
   *     @0x6e235 callq OZChannelPercent::~OZChannelPercent()       — destroy offset @+0x80.
   *     @0x6e23a movq  %rbx, %rdi
   *     @0x6e243 jmp   OZChannelFolder::~OZChannelFolder           — chain to base D2.
   *
   *   D1 @0x6e248: `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp D2` — ICF-alias wrapper for D2.
   *
   *   D0 @0x6e260 (deleting dtor):
   *     @0x6e269 callq OZChannelGradientSample::D2() (this).
   *     @0x6e277 jmp   __ZdlPv — operator delete(this).
   */
  destroy(): void {
    // @0x6e21d — destroy interp @+0x1b0.
    OZChannelEnum_dtor(this._interpolation);
    this._interpolation = null;
    // @0x6e229 — destroy middle @+0x118.
    OZChannelPercent_dtor(this._middle);
    this._middle = null;
    // @0x6e235 — destroy offset @+0x80.
    OZChannelPercent_dtor(this._offset);
    this._offset = null;
    // @0x6e243 jmp OZChannelFolder::~OZChannelFolder.
    OZChannelFolder_dtor(this);
    // @0x6e277 (D0 only) jmp __ZdlPv — handled by GC at JS layer.
  }

  /**
   * OZChannelGradientSample::clone() const @0x6e2a0
   *
   *   @0x6e2aa movl  $0x2b0, %edi                               — new-expression size = 0x2b0.
   *   @0x6e2af callq __Znwm                                     — operator new(0x2b0).
   *   @0x6e2b4..@0x6e2bd rbx = allocation; rdi = allocation; rsi = this; rdx = 0 (folder=null).
   *   @0x6e2bf callq OZChannelGradientSample::C2(OZChannelGradientSample const&, OZChannelFolder*).
   *   @0x6e2c4..@0x6e2cb epilogue: rax = allocation, restore, ret.
   *
   *   Landing pad @0x6e2cc..0x6e2df: on throw during copy, operator delete + Unwind_Resume.
   */
  clone(): OZChannelGradientSample {
    throw new Error(
      "OZChannelGradientSample::clone @ProChannel 0x6e2a0 not yet transcribed — " +
        "requires operator new @0x6e2af (size=0x2b0) and copy ctor @0x6e2bf.",
    );
  }

  /**
   * OZChannelGradientSample::copy(OZChannelBase const*, bool) @0x6e2e0
   *
   *   @0x6e2ea movl  %edx, %r14d                                — save `bool` arg.
   *   @0x6e2ed movq  %rsi, %r15                                 — save src.
   *   @0x6e2f0 movq  %rdi, %rbx                                 — save this.
   *   @0x6e2f3 callq OZChannelFolder::copy(this, src, bool)     — chain to base copy
   *                                                              (the base takes the raw src
   *                                                              pointer, not the down-cast one).
   *   @0x6e2f8 testq %r15, %r15                                 — if (src == null) skip cast.
   *   @0x6e2fb je    0x6e31a                                    — jump to r15=0.
   *   @0x6e2fd leaq  __ZTI13OZChannelBase(%rip), %rsi
   *   @0x6e304 leaq  __ZTI23OZChannelGradientSample(%rip), %rdx
   *   @0x6e30b movq  %r15, %rdi
   *   @0x6e30e xorl  %ecx, %ecx                                 — hint = 0.
   *   @0x6e310 callq __dynamic_cast(src, &OZChannelBase_ti, &OZChannelGradientSample_ti, 0).
   *   @0x6e315 movq  %rax, %r15                                 — r15 = casted src or null.
   *   @0x6e318 jmp   0x6e31d.
   *   @0x6e31a xorl  %r15d, %r15d                               — casted = null.
   *
   *   @0x6e31d movl  $0x80, %esi
   *   @0x6e322 leaq  (%rbx,%rsi), %rdi                          — this + 0x80.
   *   @0x6e326 addq  %r15, %rsi                                 — src + 0x80 (bytes-only — casted+0x80).
   *   @0x6e329 movzbl %r14b, %r14d
   *   @0x6e330 callq OZChannel::copy(this+0x80, casted+0x80, bool)   — copy offset base.
   *
   *   @0x6e335 movl  $0x118, %esi
   *   @0x6e33a leaq  (%rbx,%rsi), %rdi                          — this + 0x118.
   *   @0x6e33e addq  %r15, %rsi                                 — src + 0x118.
   *   @0x6e344 callq OZChannel::copy(this+0x118, casted+0x118, bool) — copy middle base.
   *
   *   @0x6e349 movl  $0x1b0, %eax
   *   @0x6e34e addq  %rax, %rbx                                 — rbx = this + 0x1b0.
   *   @0x6e351 addq  %rax, %r15                                 — r15 = casted + 0x1b0.
   *   @0x6e354..@0x6e35d rdi = this+0x1b0, rsi = casted+0x1b0, rdx = bool.
   *   @0x6e367 jmp   OZChannelEnum::copy(this+0x1b0, casted+0x1b0, bool) — tail-call copy interp.
   *
   * NOTE: the first two sub-channel copies call `OZChannel::copy` (the shared
   * base of the OZChannel hierarchy), while the third calls `OZChannelEnum::copy`
   * (the most-derived override for the enum sub-object).
   */
  copy(_src: OZChannelBaseLike | null, _bool: boolean): void {
    throw new Error(
      "OZChannelGradientSample::copy @ProChannel 0x6e2e0 not yet transcribed — " +
        "requires OZChannelFolder::copy @0x6e2f3, __dynamic_cast @0x6e310, " +
        "OZChannel::copy @0x6e330 (+0x80) and @0x6e344 (+0x118), and " +
        "OZChannelEnum::copy @0x6e367 (+0x1b0).",
    );
  }

  /**
   * OZChannelGradientSample::getObjCWrapperName() @0x6e36c
   *
   *   @0x6e370 leaq 0x772d9(%rip), %rax    — rax = CFString @0xe5650.
   *   @0x6e377 popq %rbp ; retq
   *
   * Constant return: the ObjC-bridge class name "CHChannelGradientSample"
   * (decoded bit-exact from /tmp/ProChannel.x86_64 at file offset 0xe5650:
   *  __CFConstantString with str_ptr low-32 = 0xbcd5e and length = 23).
   *
   * Pure function @0x6e36c — transcribed verbatim; no throw stub required.
   */
  getObjCWrapperName(): string {
    // @0xe5650 __CFConstantString -> @0xbcd5e "CHChannelGradientSample"
    return "CHChannelGradientSample";
  }

  /**
   * OZChannelGradientSample::parseEnd(PCSerializerReadStream&) @0x6e37a
   *
   *   @0x6e37e andb $-0x2, 0x3a(%rdi)     — clear bit 0 of the byte at this+0x3a.
   *   @0x6e383 jmp  OZChannelFolder::parseEnd(PCSerializerReadStream&)   — tail-call base.
   *
   * The AND-with-0xFE writes back `(byte & 0xFE)` — i.e. it clears the low bit
   * while preserving bits 1..7. The affected byte lives in the inherited
   * OZChannelFolder subobject.
   */
  parseEnd(stream: PCSerializerReadStreamLike): void {
    // @0x6e37e — clear bit 0 of the parse-state byte at this+0x3a. The byte lives
    // in the OZChannelFolder base and its full semantics are not yet decoded.
    OZChannelGradientSample_clearParseEndFlag(this);
    // @0x6e383 — tail-call OZChannelFolder::parseEnd.
    OZChannelFolder_parseEnd(this, stream);
  }
}

/**
 * `OZChannelGradientSample::parseEnd` sets `(*(u8*)(this+0x3a)) &= 0xFE` — clearing
 * bit 0 of a byte in the inherited OZChannelFolder subobject. The exact semantics
 * of that bit and the surrounding byte are not yet decoded, so the write is stubbed
 * behind a citing throw (Rule 3).
 *
 * @param _this — the OZChannelGradientSample instance whose base byte is to be masked.
 */
export function OZChannelGradientSample_clearParseEndFlag(_this: unknown): void {
  throw new Error(
    "OZChannelGradientSample::parseEnd byte@this+0x3a &= 0xFE @ProChannel 0x6e37e — the " +
      "underlying OZChannelFolder byte and its bit 0 semantics are not yet decoded.",
  );
}

// ---------------------------------------------------------------------------
// OZChannelGradientSample::OZChannelGradientSample_interpolationImpl
// ---------------------------------------------------------------------------

/**
 * Singleton implementation supplying the interpolation-curve + numeric bounds
 * for OZChannelGradientSample's +0x1b0 enum sub-channel. Two-base layout
 * (OZChannelImpl + PCSingleton), populated once via `std::__1::__call_once`.
 *
 * VTABLE:
 *   +0x00 primary vptr   -> &vtable_interpolationImpl+0x10
 *   +0x28 secondary vptr -> &vtable_interpolationImpl+0x30
 * (both installed by C2 @0x6ee58; the primary vtable symbol is
 *  `__ZTVN23OZChannelGradientSample41OZChannelGradientSample_interpolationImplE`.)
 */
export class OZChannelGradientSample_interpolationImpl {
  /**
   * OZChannelGradientSample_interpolationImpl() [C2 @0x6ee58]
   *
   *   @0x6ee65 movsd  0x41783(%rip), %xmm0            — xmm0 = 2.0  (double @ProChannel 0xb05f0).
   *   @0x6ee6d callq  OZChannelEnum::createOZChannelEnumCurve(2.0)   — returns OZCurve*.
   *   @0x6ee72 movq  %rbx, %rdi                                       — this.
   *   @0x6ee75 movq  %rax, %rsi                                       — curve.
   *   @0x6ee78 movsd  0x41770(%rip), %xmm0            — xmm0 = 2.0  (same const, second load).
   *   @0x6ee80 xorl  %edx, %edx                                       — u32 = 0.
   *   @0x6ee82 movl  $0x1, %ecx                                       — bool = true.
   *   @0x6ee87 callq OZChannelImpl::OZChannelImpl(OZCurve*, double, u32, bool).
   *   @0x6ee8c leaq  0x28(%rbx), %r14                                  — r14 = &this[+0x28] (PCSingleton subobject).
   *   @0x6ee93 movl  $0x32, %esi                                       — id = 50.
   *   @0x6ee98 callq PCSingleton::PCSingleton(u32).
   *   @0x6ee9d leaq  __ZTVN..._interpolationImplE(%rip), %rax          — rax = vtable start.
   *   @0x6eea4 leaq  0x10(%rax), %rcx                                  — rcx = vtable+0x10.
   *   @0x6eea8 movq  %rcx, (%rbx)                                      — install primary vptr.
   *   @0x6eeab addq  $0x30, %rax                                       — rax = vtable+0x30.
   *   @0x6eeaf movq  %rax, 0x28(%rbx)                                  — install secondary vptr.
   *   @0x6eeb3 xorps %xmm0, %xmm0                                      — xmm0 = 0.0.
   *   @0x6eeb9 callq OZChannelImpl::setMin(0.0).
   *   @0x6eebe movsd  0x4067a(%rip), %xmm0            — xmm0 = 4294967295.0  (double @ProChannel 0xaf540; = 2^32 - 1).
   *   @0x6eec9 callq OZChannelImpl::setMax(4294967295.0).
   *   @0x6eece..@0x6eed8 epilogue: restore + ret.
   *
   *   Landing pad @0x6eed9..0x6eef9: on throw, destroy the partially-constructed
   *   PCSingleton and OZChannelImpl bases then Unwind_Resume.
   */
  constructor() {
    throw new Error(
      "OZChannelGradientSample_interpolationImpl::OZChannelGradientSample_interpolationImpl " +
        "@ProChannel 0x6ee58 not yet transcribed — requires " +
        "OZChannelEnum::createOZChannelEnumCurve(2.0) @0x6ee6d, " +
        "OZChannelImpl::OZChannelImpl(curve, 2.0, 0, true) @0x6ee87, " +
        "PCSingleton::PCSingleton(0x32) @0x6ee98, " +
        "OZChannelImpl::setMin(0.0) @0x6eeb9, and " +
        "OZChannelImpl::setMax(4294967295.0) @0x6eec9.",
    );
  }

  /**
   * OZChannelGradientSample_interpolationImpl::~OZChannelGradientSample_interpolationImpl() [D0 @0x6ef1a]
   *
   *   @0x6ef20 movq  %rdi, %rbx                                        — save this.
   *   @0x6ef23 addq  $0x28, %rdi                                       — rdi = &this[+0x28].
   *   @0x6ef27 callq PCSingleton::~PCSingleton().
   *   @0x6ef2c movq  %rbx, %rdi                                        — this.
   *   @0x6ef2f callq OZChannelImpl::~OZChannelImpl().
   *   @0x6ef34 movq  %rbx, %rdi
   *   @0x6ef3d jmp   __ZdlPv                                            — operator delete(this).
   */
  destroy(): void {
    // @0x6ef27 — destroy PCSingleton subobject at this+0x28.
    PCSingleton_dtor(this);
    // @0x6ef2f — destroy OZChannelImpl base subobject at this.
    OZChannelImpl_dtor(this);
    // @0x6ef3d (D0 only) jmp __ZdlPv — handled by GC at JS layer.
  }

  /**
   * OZChannelGradientSample_interpolationImpl::getInstance() @0x6edbc
   *
   *   @0x6edbc movq  once_flag(%rip), %rax
   *   @0x6edc3 cmpq  $-0x1, %rax                                      — check "already initialized" sentinel (-1 == 0xFFFFFFFFFFFFFFFF).
   *   @0x6edc7 je    0x6edfb                                          — fast path: skip __call_once.
   *   @0x6edc9..@0x6edf1 : set up std::__1::__call_once(&once_flag, tuple(&lambda), &__call_once_proxy).
   *   @0x6edfb movq  _OZChannelGradientSample_interpolation(%rip), %rax
   *   @0x6ee02 retq                                                    — return the singleton pointer.
   *
   * i.e. this is a textbook Meyers/N4762 [stmt.dcl]/4-style local-static
   * initialisation implemented via `std::__1::__call_once` + a lambda that
   * populates the static `_OZChannelGradientSample_interpolation` slot with
   * a heap-allocated `OZChannelGradientSample_interpolationImpl*`, then
   * returns it.
   *
   * The initialiser lambda itself lives in the code-gen'd
   * `__call_once_proxy<tuple<lambda&&>>` symbol; its body has not been
   * disassembled yet (frontier).
   *
   * @frontier ProChannel OZChannelGradientSample_interpolationImpl_getInstance_lambda
   */
  static getInstance(): OZChannelImplLike {
    throw new Error(
      "OZChannelGradientSample_interpolationImpl::getInstance @ProChannel 0x6edbc not yet " +
        "transcribed — requires the __call_once lambda body that heap-allocates and stores " +
        "_OZChannelGradientSample_interpolation.",
    );
  }
}
