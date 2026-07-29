// raw-port/src/channels/OZSoftGradientGenerator.ts
//
// FCP `OZSoftGradientGenerator` — Ozone.framework subclass of
// `OZImageGenerator`. It exposes a "soft" gradient (two colors with a
// softness-controlled feathered edge) as an Ozone scene node, and hands
// the actual pixel work off to `OZHeSoftGradientGenerator` (the Helium
// HGNode already ported in raw-port/src/render/OZHeSoftGradientGenerator.ts).
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                  Ozone.framework/Versions/A/Ozone).
//
// Ported symbols (all @Ozone, x86_64 slice; VAs verbatim from
// otool -tV / nm -n on the thin slice at /tmp/Ozone.x86_64):
//
//   @0x00000000004d7140  OZSoftGradientGenerator::OZSoftGradientGenerator(
//                          OZFactory*, PCString const&, unsigned int)  [C2]
//                        __ZN23OZSoftGradientGeneratorC2EP9OZFactoryRK8PCStringj
//   @0x00000000004d7310  OZSoftGradientGenerator::OZSoftGradientGenerator(
//                          OZFactory*, PCString const&, unsigned int)  [C1]
//                        __ZN23OZSoftGradientGeneratorC1EP9OZFactoryRK8PCStringj
//                        (C1 tail-jumps to C2 at @0x4d7315 — an 11-byte
//                         function that is a plain thunk on top of C2.)
//   @0x00000000004d7320  OZSoftGradientGenerator::OZSoftGradientGenerator(
//                          OZSoftGradientGenerator const&, unsigned int) [C2]
//                        __ZN23OZSoftGradientGeneratorC2ERKS_j
//   @0x00000000004d7400  OZSoftGradientGenerator::OZSoftGradientGenerator(
//                          OZSoftGradientGenerator const&, unsigned int) [C1]
//                        __ZN23OZSoftGradientGeneratorC1ERKS_j
//   @0x00000000004d74e0  OZSoftGradientGenerator::~OZSoftGradientGenerator() [D2]
//                        __ZN23OZSoftGradientGeneratorD2Ev
//   @0x00000000004d75d0  OZSoftGradientGenerator::~OZSoftGradientGenerator() [D1]
//                        __ZN23OZSoftGradientGeneratorD1Ev
//   @0x00000000004d79c0  OZSoftGradientGenerator::~OZSoftGradientGenerator() [D0]
//                        __ZN23OZSoftGradientGeneratorD0Ev
//   @0x00000000004d7dc0  OZSoftGradientGenerator::operator=(OZSceneNode const&)
//                        __ZN23OZSoftGradientGeneratoraSERK11OZSceneNode
//   @0x00000000004d7dd0  OZSoftGradientGenerator::getOriginalBounds(
//                          PCRect<double>*, OZRenderState const&)
//                        __ZN23OZSoftGradientGenerator17getOriginalBoundsEP6PCRectIdERK13OZRenderState
//   @0x00000000004d7e20  OZSoftGradientGenerator::getHelium(
//                          LiAgent&, OZRenderParams const&)
//                        __ZN23OZSoftGradientGenerator9getHeliumER7LiAgentRK14OZRenderParams
//   @0x00000000004d8170  OZSoftGradientGenerator::filteredEdges()
//                        __ZN23OZSoftGradientGenerator13filteredEdgesEv
//   @0x00000000004d8180  OZSoftGradientGenerator::pixelTransformSupport(
//                          LiRenderParameters const&, OZRenderParams&)
//                        __ZN23OZSoftGradientGenerator21pixelTransformSupportERK18LiRenderParametersR14OZRenderParams
//
// Ozone also emits three multi-inheritance thunk dtor pairs (secondary
// base subobjects at +0x10, +0x28, +0x1978); these are pure
// this-adjustment thunks that unconditionally tail-call the primary
// D1/D0 body and are not first-class API — they are documented for
// completeness but need no separate TS entry point:
//   @0x00000000004d76c0  __ZThn16_N23OZSoftGradientGeneratorD1Ev
//   @0x00000000004d77c0  __ZThn40_N23OZSoftGradientGeneratorD1Ev
//   @0x00000000004d78c0  __ZThn6520_N23OZSoftGradientGeneratorD1Ev
//   @0x00000000004d7ab0  __ZThn16_N23OZSoftGradientGeneratorD0Ev
//   @0x00000000004d7bb0  __ZThn40_N23OZSoftGradientGeneratorD0Ev
//   @0x00000000004d7cb0  __ZThn6520_N23OZSoftGradientGeneratorD0Ev
//
// Data / vtable references discovered by walking the disasm:
//   @Ozone  __ZTV23OZSoftGradientGenerator  main vtable  @0x875a08 (nm S).
//   @Ozone  __ZTS23OZSoftGradientGenerator  typeinfo str @0x711178 (nm S).
//   @Ozone data literals (rip-relative doubles read from the __const
//   section of the thin slice):
//     @0x0000000000704fe0 = pair (1.7872e-318 -- but real reads via
//        `resolve.py const 0x706e20` show 1e-7,1e-7 in the same 16-byte
//        block; the two rounddown/roundup epsilons.)
//     @0x0000000000705428 double 100.0
//                          (softness channel default value, id=0x137)
//     @0x00000000007053e0 double 1.0
//                          (color-channel color default AND
//                          1.0/softness inversion constant in getHelium.)
//     @0x0000000000706e20 pair (1e-7, 1e-7)
//                          (movapd 16-byte, used to nudge the rect before
//                          floor()/ceil() in getHelium's DOD compute.)
//     @0x0000000000707560 pair (-0.0, -0.0)
//                          (xorpd sign-flip constant used to negate the
//                          xy corner of the rect for translation, in
//                          both getOriginalBounds and getHelium.)
//
// Callees (direct + stubs) walked:
//   direct  __ZN16OZImageGeneratorC2EP9OZFactoryRK8PCStringj
//           OZImageGenerator::OZImageGenerator(OZFactory*, PCString const&,
//                                              unsigned int)
//   direct  __ZN16OZImageGeneratorD2Ev
//           OZImageGenerator::~OZImageGenerator()
//   direct  __ZN25OZHeSoftGradientGeneratorC1Ev
//           OZHeSoftGradientGenerator::OZHeSoftGradientGenerator()
//           (see raw-port/src/render/OZHeSoftGradientGenerator.ts)
//   direct  __ZN25OZHeSoftGradientGenerator6setDODERK6HGRect
//           OZHeSoftGradientGenerator::setDOD(HGRect const&)
//   direct  __ZNK14OZRenderParams20getWorkingColorSpaceEv
//           OZRenderParams::getWorkingColorSpace() const
//   direct  __ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
//           bool PCMatrix44Tmpl<double>::transformRect<double>(
//                    PCRect<double> const&, PCRect<double>&) const
//   direct  __ZN14OZChannelColorD1Ev
//           OZChannelColor::~OZChannelColor()
//   direct  __ZN7PCColorD1Ev  PCColor::~PCColor()
//   direct  __ZN14PCWorkingColorD1Ev  PCWorkingColor::~PCWorkingColor()
//   direct  __ZN15OZChannelDoubleC2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//           OZChannelDouble::OZChannelDouble(double, PCString const&,
//                                             OZChannelFolder*, unsigned int,
//                                             unsigned int, OZChannelImpl*,
//                                             OZChannelInfo*)
//   stub    __ZN14OZChannelColorC1EddddRK8PCStringP15OZChannelFolderjjj
//           OZChannelColor::OZChannelColor(double,double,double,double,
//                                          PCString const&, OZChannelFolder*,
//                                          unsigned int, unsigned int,
//                                          unsigned int)                @0x6ddc86
//   stub    __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
//           PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef)     @0x6df08a
//   stub    __ZN8PCStringD1Ev  PCString::~PCString()                     @0x6df0c6
//   stub    __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
//           OZChannel::getValueAsDouble(CMTime const&, double) const     @0x6dfa9e
//   stub    __ZNK14OZChannelColor8getColorERK6CMTimeR7PCColor
//           OZChannelColor::getColor(CMTime const&, PCColor&) const      @0x6df5ee
//   stub    __ZN7PCColorC1Ev  PCColor::PCColor()                         @0x6deeb0
//   stub    __ZN14PCWorkingColorC1ERK7PCColorP12CGColorSpace
//           PCWorkingColor::PCWorkingColor(PCColor const&, CGColorSpace*) @0x6ddde2
//   stub    __ZNK7LiAgent24getInversePixelTransformEd
//           LiAgent::getInversePixelTransform(double) const              @0x6df924
//   stub    __ZN8HGObjectnwEm  HGObject::operator new(size_t)            @0x6def70
//   stub    __ZN8HGObjectdlEPv HGObject::operator delete(void*)          @0x6def6a
//   stub    __ZNK7LiAgent7haveROIEv  LiAgent::haveROI() const            @0x6df960
//   stub    __ZNK7LiAgent6getROIEv   LiAgent::getROI() const             @0x6df954
//   stub    _HGRectMake4i  HGRectMake4i(int,int,int,int)                 @0x6dcca8
//   stub    _HGRectInfinite  data pointer (literal pool @0x4d809e)
//   stub    __ZN13OZChannelBase7setFlagEyb
//           OZChannelBase::setFlag(unsigned long long, bool)             @0x6dd914
//   stub    __ZN13OZChannelBase18saveStateAsDefaultEv
//           OZChannelBase::saveStateAsDefault()                          @0x6dd8c6
//   stub    __ZN9OZChannelD2Ev  OZChannel::~OZChannel()                  @0x6df480
//   stub    __ZN13OZChannelEnumD1Ev OZChannelEnum::~OZChannelEnum()      @0x6dd9d4
//   stub    __ZN17OZCompoundChannelD2Ev OZCompoundChannel::~OZCompoundChannel() @0x6de2b6
//   stub    __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
//           PCCFRefTraits<CGColorSpace*>::release(CGColorSpace*)         @0x6dda9a
//   stub    __ZdlPv  operator delete(void*)                              @0x6dfc36
//   stub    __Unwind_Resume                                              @0x6dd07a
//   stub    ___clang_call_terminate  (compiler-generated)
//
// Vptr installs (ctor writes four vptr slots; dtors re-install the
// same four before proceeding to teardown, per the Itanium ABI):
//   this+0x0000  ← RIP+0x39e8ba  (from @0x4d7157 in C2 factory ctor;
//                                  and @0x4d79ca in D0)   — primary vtable.
//   this+0x0010  ← RIP+0x39f1e8  (from @0x4d7161 / @0x4d79d4)
//   this+0x0028  ← RIP+0x39f435  (from @0x4d716c / @0x4d79df)
//   this+0x1978  ← RIP+0x39f482  (from @0x4d7177 / @0x4d79ea)
//
// Instance layout (recovered from ctor + dtor):
//   +0x0000  primary vtable ptr
//   +0x0010  secondary vtable ptr  (multi-inheritance base #1)
//   +0x0028  secondary vtable ptr  (multi-inheritance base #2)
//   +0x1978  secondary vtable ptr  (multi-inheritance base #3)
//   +0x49d0  OZChannelBase (subobject inherited from OZImageGenerator;
//            the ctor re-flags it with setFlag(2,false)+saveStateAsDefault)
//   +0x4a68  OZChannelBase (same treatment)
//   +0x4b00  OZChannelBase (same treatment)
//   +0x4b98..+0x4bb0  padding / OZChannel sub-object header
//   +0x4bb0  OZChannelColor  "color1"   id=0x136, folder=0, ord=0, kind=6
//            (default RGBA=(1.0,1.0,1.0,1.0) — the xmm0/1/2/3 arg values
//             at @0x4d71b3..@0x4d71dc)
//   +0x4bc0  OZChannelColor vtable slot #2 (secondary base of the color
//            channel; set to OZChannelColor's `.+0x370` slot at @0x4d7a1d
//            during D0 teardown before being switched to
//            OZChannelColorNoAlpha at @0x4d7a3d.)
//   +0x4c38  OZChannel (dtor step)
//   +0x4cd0  OZChannel (dtor step)
//   +0x4d68  OZChannel (dtor step)
//   +0x4e00  OZChannel (dtor step)
//   +0x4e98  OZChannelEnum (dtor step)
//   +0x4fa0  OZChannel — auxiliary/derived color2 slot; the D0 ~ChannelD2
//            call at @0x4d7a31 walks this address.
//   +0x5038  OZChannelDouble  "softness"  id=0x137, folder=0, ord=0,
//            default value = 100.0 (loaded from @0x705428, and clamped
//            via getValueAsDouble at @0x4d7e6d during getHelium).
//   size    ≥ 0x5040+sizeof(OZChannelDouble) (the C2 ctor never reads
//            past +0x5038 explicitly; the total object size is fixed by
//            the base class OZImageGenerator + the tail padding it
//            reserves for these two typed channels.)
//
// STATUS: The class body reads FIVE OZChannel* subobjects living inside
// the OZImageGenerator base, plus builds two owned typed channels
// (OZChannelColor at +0x4bb0 and OZChannelDouble at +0x5038). Only the
// four small leaf methods have bodies decodable WITHOUT porting
// OZImageGenerator / OZChannel / OZChannelColor / OZChannelDouble /
// PCMatrix44Tmpl / LiAgent / OZHeSoftGradientGenerator first; those four
// are transcribed below with real math, and the remaining bodies
// (ctors, dtors, operator=, getHelium's dispatch chain) are wired
// through throwing stubs that CITE the addresses the frontier still
// needs to decode.

/* eslint-disable @typescript-eslint/no-unused-vars */

//
// ─── Undecoded base-class / infrastructure stubs (each throws with its
// ─── @0xADDR citation so raw-port/army/tools/frontier.py can see the
// ─── remaining gap explicitly).
//

/**
 * OZImageGenerator base subobject. Fields owned by the base include the
 * five OZChannel* slots at +0x49d0/+0x4a68/+0x4b00/+0x4b98/+0x4c38 that
 * this class's C2 ctor re-flags, and the vtable structure this class's
 * ctor overwrites at +0x0/+0x10/+0x28/+0x1978.
 *
 * Not yet transcribed — see @Ozone 0x00000000004d7152 (call to
 * `__ZN16OZImageGeneratorC2EP9OZFactoryRK8PCStringj`).
 */
export function OZImageGenerator_ctor_factory_stub(
  _self: unknown,
  _factory: unknown,
  _plugUUID: unknown,
  _plugFlags: number,
): void {
  throw new Error(
    "OZImageGenerator::OZImageGenerator(OZFactory*, PCString const&, unsigned int) " +
      "@0x?? not yet transcribed (called from OZSoftGradientGenerator C2 @Ozone 0x4d7152)",
  );
}

/**
 * Not yet transcribed — see @Ozone 0x00000000004d72c6 (call to
 * `__ZN16OZImageGeneratorD2Ev` from the ctor landing pad) and
 * @Ozone 0x00000000004d7a9c (call from D0 body).
 */
export function OZImageGenerator_dtor_stub(_self: unknown): void {
  throw new Error(
    "OZImageGenerator::~OZImageGenerator() @0x?? not yet transcribed " +
      "(called from OZSoftGradientGenerator dtors @Ozone 0x4d72c6/0x4d7a9c)",
  );
}

/**
 * Not yet transcribed — see @Ozone 0x00000000004d71a0 (call to
 * `__ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_` for building the
 * two channel-name PCStrings in the C2 factory ctor).
 */
export function PCString_ctor_from_CFStringRef_stub(
  _self: unknown,
  _cfStringRef: unknown,
  _bundleA: unknown,
  _bundleB: unknown,
): void {
  throw new Error(
    "PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef) @Ozone stub 0x6df08a " +
      "not yet transcribed (called from OZSoftGradientGenerator @0x4d71a0/0x4d71fe)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6df0c6 (called from
 * @Ozone 0x00000000004d71e5 and 0x00000000004d7238 to destroy the
 * transient CFString-derived PCString wrappers before the second and
 * final channel installs.)
 */
export function PCString_dtor_stub(_self: unknown): void {
  throw new Error(
    "PCString::~PCString() @Ozone stub 0x6df0c6 not yet transcribed " +
      "(called from OZSoftGradientGenerator @0x4d71e5/0x4d7238)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6ddc86 (called from
 * @0x00000000004d71dc to construct the color1 channel at +0x4bb0 with
 * RGBA=(1.0,1.0,1.0,1.0) via `movsd 0x22e225(%rip),%xmm0` +
 * `movaps %xmm0,%xmm{1,2,3}` broadcast).
 */
export function OZChannelColor_ctor_stub(
  _self: unknown,
  _r: number,
  _g: number,
  _b: number,
  _a: number,
  _name: unknown,
  _folder: unknown,
  _folderOrd: number,
  _flags: number,
  _id: number,
): void {
  throw new Error(
    "OZChannelColor::OZChannelColor(double,double,double,double,PCString const&," +
      "OZChannelFolder*,unsigned,unsigned,unsigned) @Ozone stub 0x6ddc86 not yet " +
      "transcribed (called from OZSoftGradientGenerator @0x4d71dc)",
  );
}

/**
 * Not yet transcribed — see @Ozone direct call at
 * @0x00000000004d722f (the softness channel at +0x5038, default 100.0,
 * id=0x137).
 */
export function OZChannelDouble_ctor_stub(
  _self: unknown,
  _def: number,
  _name: unknown,
  _folder: unknown,
  _folderOrd: number,
  _flags: number,
  _impl: unknown,
  _info: unknown,
): void {
  throw new Error(
    "OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, " +
      "unsigned, unsigned, OZChannelImpl*, OZChannelInfo*) @Ozone direct 0x4d722f " +
      "not yet transcribed (called from OZSoftGradientGenerator ctor)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6dd914 (called three times
 * from @0x00000000004d724e / 0x4d726c / 0x4d728a to force-clear flag bit
 * 2 on the base-class channels at +0x49d0 / +0x4a68 / +0x4b00, then
 * @0x4d7256 / 0x4d7274 / 0x4d7292 saves the new default state).
 */
export function OZChannelBase_setFlag_stub(
  _self: unknown,
  _bit: bigint,
  _value: boolean,
): void {
  throw new Error(
    "OZChannelBase::setFlag(unsigned long long, bool) @Ozone stub 0x6dd914 " +
      "not yet transcribed (called from OZSoftGradientGenerator ctor at 0x4d724e/0x4d726c/0x4d728a)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6dd8c6 (called from
 * @0x4d7256/0x4d7274/0x4d7292 in the OZSoftGradientGenerator ctor).
 */
export function OZChannelBase_saveStateAsDefault_stub(_self: unknown): void {
  throw new Error(
    "OZChannelBase::saveStateAsDefault() @Ozone stub 0x6dd8c6 not yet transcribed " +
      "(called from OZSoftGradientGenerator ctor at 0x4d7256/0x4d7274/0x4d7292)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6df480 (called from D0 body
 * at @0x4d79ff, 0x4d7a31, 0x4d7a68, 0x4d7a6d, 0x4d7a74, 0x4d7a80,
 * 0x4d7a85 to walk down the 7 owned OZChannel subobjects).
 */
export function OZChannel_dtor_stub(_self: unknown): void {
  throw new Error(
    "OZChannel::~OZChannel() @Ozone stub 0x6df480 not yet transcribed " +
      "(called from OZSoftGradientGenerator dtors at 0x4d79ff/0x4d7a31/etc.)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6dd9d4 (called from D0 body
 * at @0x4d7a5c on the OZChannelEnum subobject at +0x4e98).
 */
export function OZChannelEnum_dtor_stub(_self: unknown): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() @Ozone stub 0x6dd9d4 not yet transcribed " +
      "(called from OZSoftGradientGenerator D0 at 0x4d7a5c)",
  );
}

/**
 * Not yet transcribed — see @Ozone direct call at @0x4d72f4 (in the
 * ctor landing pad) and @Ozone stub 0x6de2b6 (called from D0 at
 * @0x4d7a94 to destroy the OZChannelColor sub-object at +0x4bb0 that
 * was masqueraded as OZChannelColorNoAlpha via vtable swap at
 * @0x4d7a3d/0x4d7a4e).
 */
export function OZChannelColor_dtor_stub(_self: unknown): void {
  throw new Error(
    "OZChannelColor::~OZChannelColor() @Ozone direct 0x4d72f4 not yet transcribed " +
      "(also OZCompoundChannel::~OZCompoundChannel @Ozone stub 0x6de2b6 called at 0x4d7a94)",
  );
}

/**
 * Not yet transcribed — see @Ozone direct call at @0x4d7e9e (called
 * from getHelium to read the working color space that
 * PCWorkingColor's ctor will re-project the sampled PCColor into).
 */
export function OZRenderParams_getWorkingColorSpace_stub(_self: unknown): unknown {
  throw new Error(
    "OZRenderParams::getWorkingColorSpace() const @Ozone direct 0x4d7e9e " +
      "not yet transcribed (called from OZSoftGradientGenerator::getHelium)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6df924 (called from getHelium
 * at @0x4d7ec7 to project the four float uniforms `-0x140`..`-0xa8`
 * against the LiAgent's inverse pixel transform).
 */
export function LiAgent_getInversePixelTransform_stub(
  _self: unknown,
  _t: number,
): unknown {
  throw new Error(
    "LiAgent::getInversePixelTransform(double) const @Ozone stub 0x6df924 " +
      "not yet transcribed (called from OZSoftGradientGenerator::getHelium at 0x4d7ec7)",
  );
}

/**
 * Not yet transcribed — see @Ozone direct call at @0x4d800f (the
 * PCMatrix44Tmpl<double>::transformRect<double> call that projects the
 * bounds rectangle from render-params-space into DOD-space).
 */
export function PCMatrix44Tmpl_transformRect_stub(
  _self: unknown,
  _src: unknown,
  _dst: unknown,
): boolean {
  throw new Error(
    "PCMatrix44Tmpl<double>::transformRect<double>(PCRect<double> const&, " +
      "PCRect<double>&) const @Ozone direct 0x4d800f not yet transcribed " +
      "(called from OZSoftGradientGenerator::getHelium)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6dfa9e (called from
 * getOriginalBounds at @0x4d7de7 to read the softness channel value
 * at CMTime = 0 (xmm0 cleared by xorpd), and again from getHelium at
 * @0x4d7e6d with the caller-supplied CMTime).
 */
export function OZChannel_getValueAsDouble_stub(
  _self: unknown,
  _cmTime: unknown,
  _defaultValue: number,
): number {
  throw new Error(
    "OZChannel::getValueAsDouble(CMTime const&, double) const @Ozone stub 0x6dfa9e " +
      "not yet transcribed (called from OZSoftGradientGenerator::getOriginalBounds " +
      "@0x4d7de7 and ::getHelium @0x4d7e6d)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6df5ee (called from getHelium
 * at @0x4d7e96 to read the "color1" channel's PCColor value).
 */
export function OZChannelColor_getColor_stub(
  _self: unknown,
  _cmTime: unknown,
  _outColor: unknown,
): void {
  throw new Error(
    "OZChannelColor::getColor(CMTime const&, PCColor&) const @Ozone stub 0x6df5ee " +
      "not yet transcribed (called from OZSoftGradientGenerator::getHelium @0x4d7e96)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6deeb0 (PCColor default ctor,
 * called in getHelium at @0x4d7e81).
 */
export function PCColor_ctor_stub(_self: unknown): void {
  throw new Error(
    "PCColor::PCColor() @Ozone stub 0x6deeb0 not yet transcribed " +
      "(called from OZSoftGradientGenerator::getHelium @0x4d7e81)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6ddde2 (PCWorkingColor
 * copy-project ctor, called in getHelium at @0x4d7eb4 to lift the
 * PCColor into the working-color-space representation the HG shader
 * will consume).
 */
export function PCWorkingColor_ctor_stub(
  _self: unknown,
  _color: unknown,
  _colorSpace: unknown,
): void {
  throw new Error(
    "PCWorkingColor::PCWorkingColor(PCColor const&, CGColorSpace*) @Ozone stub 0x6ddde2 " +
      "not yet transcribed (called from OZSoftGradientGenerator::getHelium @0x4d7eb4)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6def70 (HGObject::operator new,
 * called from getHelium at @0x4d7ed1 to allocate the HGNode).
 */
export function HGObject_operator_new_stub(_size: number): unknown {
  throw new Error(
    "HGObject::operator new(size_t) @Ozone stub 0x6def70 not yet transcribed " +
      "(called from OZSoftGradientGenerator::getHelium @0x4d7ed1 with size=0x1b0)",
  );
}

/**
 * Not yet transcribed — see @Ozone stub 0x6dcca8 (called from getHelium
 * at @0x4d8083 to build a 4-int HGRect from the ROI corners after
 * pextrd unpacks the xmm0 sib pair).
 */
export function HGRectMake4i_stub(
  _x: number,
  _y: number,
  _w: number,
  _h: number,
): unknown {
  throw new Error(
    "HGRectMake4i(int,int,int,int) @Ozone stub 0x6dcca8 not yet transcribed " +
      "(called from OZSoftGradientGenerator::getHelium @0x4d8083)",
  );
}

//
// ─── Real ported methods ─────────────────────────────────────────────
//

/**
 * `OZSoftGradientGenerator::filteredEdges()` @Ozone 0x00000000004d8170
 * — 7 instructions. Loads `%al = 1` and returns; this method is a
 * pure constant getter that answers "the class filters its own edges,
 * so the pixel pipeline does NOT need to insert an edge filter."
 *
 * Disasm (verbatim):
 *   0x4d8170  pushq %rbp
 *   0x4d8171  movq %rsp, %rbp
 *   0x4d8174  movb $0x1, %al
 *   0x4d8176  popq %rbp
 *   0x4d8177  retq
 *
 * Return: `true` (bool via %al).
 */
export function OZSoftGradientGenerator_filteredEdges(): boolean {
  // @0x4d8174 movb $0x1, %al
  return true;
}

/**
 * `OZSoftGradientGenerator::pixelTransformSupport(LiRenderParameters
 *  const&, OZRenderParams&)` @Ozone 0x00000000004d8180 — 7 instructions.
 * Loads `%eax = 6` and returns; this is a pure constant getter that
 * advertises which OZ pixel-transform features this scene node can
 * consume. The value 6 = 0b0110 in the OZImageGenerator base's feature
 * bitset.
 *
 * Disasm (verbatim):
 *   0x4d8180  pushq %rbp
 *   0x4d8181  movq %rsp, %rbp
 *   0x4d8184  movl $0x6, %eax
 *   0x4d8189  popq %rbp
 *   0x4d818a  retq
 *
 * Return: `6` (unsigned int / int32 via %eax).
 */
export function OZSoftGradientGenerator_pixelTransformSupport(
  _params: unknown,
  _oz: unknown,
): number {
  // @0x4d8184 movl $0x6, %eax
  return 6;
}

/**
 * `OZSoftGradientGenerator::getOriginalBounds(PCRect<double>*,
 *  OZRenderState const&)` @Ozone 0x00000000004d7dd0 — 21 instructions.
 *
 * Reads the softness channel (at `this+0x5038`) via
 * `OZChannel::getValueAsDouble(CMTime const&, double)` with default 0.0,
 * then emits a PCRect<double> whose corner is `(-r, -r)` and whose
 * width/height are both `2r`, where `r` is the queried softness value.
 *
 * Disasm (verbatim):
 *   0x4d7dd0  pushq %rbp
 *   0x4d7dd1  movq %rsp, %rbp
 *   0x4d7dd4  pushq %rbx
 *   0x4d7dd5  pushq %rax
 *   0x4d7dd6  movq %rsi, %rbx                     ; save out-pointer
 *   0x4d7dd9  addq $0x5038, %rdi                  ; &this->softnessChannel
 *   0x4d7de0  xorpd %xmm0, %xmm0                  ; CMTime default arg = 0.0
 *   0x4d7de4  movq %rdx, %rsi                     ; CMTime const& arg (OZRenderState)
 *   0x4d7de7  callq __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
 *   0x4d7dec  movddup %xmm0, %xmm1                ; xmm1 = (r, r)
 *   0x4d7df0  xorpd 0x22f768(%rip), %xmm1         ; xmm1 ^= (-0.0,-0.0) -> (-r,-r)
 *   0x4d7df8  addsd %xmm0, %xmm0                  ; xmm0 = 2r  (scalar)
 *   0x4d7dfc  movupd %xmm1, (%rbx)                ; out->{x,y} = (-r,-r)
 *   0x4d7e00  movsd %xmm0, 0x10(%rbx)             ; out->w = 2r
 *   0x4d7e05  movsd %xmm0, 0x18(%rbx)             ; out->h = 2r
 *   0x4d7e0a  addq $0x8, %rsp
 *   0x4d7e0e  popq %rbx
 *   0x4d7e0f  popq %rbp
 *   0x4d7e10  retq
 *
 * The rip-relative operand at @0x4d7df0 resolves to Ozone/__const at
 *   VA 0x707560 = (u64 0x8000000000000000, u64 0x8000000000000000)
 *      = 128-bit constant (-0.0, -0.0).
 * The xorpd of that constant with `(r, r)` toggles the sign bit of both
 * lanes, yielding (-r, -r) in one instruction — the classic SSE idiom
 * for `PCPoint2D<double>::operator-()`.
 *
 * PCRect<double> layout at `%rbx` (matches PCRect<T> already ported in
 * raw-port/src/infra/PCRect.ts):
 *   +0x00  double x     (top-left corner .x = -r)
 *   +0x08  double y     (top-left corner .y = -r)
 *   +0x10  double w     (width  = 2r)
 *   +0x18  double h     (height = 2r)
 *
 * Return: none (out-parameter). The disasm's `%rax` return value is not
 * consumed by the caller; C++ callers reference `*out`.
 */
export interface PCRectD_out {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function OZSoftGradientGenerator_getOriginalBounds(
  out: PCRectD_out,
  _renderState: unknown,
  softnessChannel: unknown,
  cmTime: unknown,
): void {
  // @0x4d7de7: r = softnessChannel.getValueAsDouble(cmTime, 0.0)
  const r = OZChannel_getValueAsDouble_stub(softnessChannel, cmTime, 0.0);
  // @0x4d7dec..@0x4d7df0: neg = (-r, -r)  (movddup + xorpd(-0.0,-0.0))
  const negR = -r;
  // @0x4d7df8: twoR = 2r  (addsd %xmm0, %xmm0 — a scalar self-add)
  const twoR = r + r;
  // @0x4d7dfc: write (x,y)
  out.x = negR;
  out.y = negR;
  // @0x4d7e00: write w
  out.w = twoR;
  // @0x4d7e05: write h
  out.h = twoR;
}

/**
 * `OZSoftGradientGenerator::OZSoftGradientGenerator(OZFactory*,
 *   PCString const&, unsigned int)` [C1] @Ozone 0x00000000004d7310.
 *
 * The C1 body at @0x4d7310..@0x4d731a is a plain 11-byte thunk that
 * tail-jumps to the C2 body at @0x4d7140:
 *
 *   0x4d7310  pushq %rbp
 *   0x4d7311  movq %rsp, %rbp
 *   0x4d7314  popq %rbp
 *   0x4d7315  jmp __ZN23OZSoftGradientGeneratorC2EP9OZFactoryRK8PCStringj
 *
 * We route through the C2 factory ctor stub below.
 */
export function OZSoftGradientGenerator_ctor_C1_factory(
  self: unknown,
  factory: unknown,
  plugUUID: unknown,
  plugFlags: number,
): void {
  // @0x4d7315  jmp C2
  OZSoftGradientGenerator_ctor_C2_factory(self, factory, plugUUID, plugFlags);
}

/**
 * `OZSoftGradientGenerator::OZSoftGradientGenerator(OZFactory*,
 *   PCString const&, unsigned int)` [C2] @Ozone 0x00000000004d7140.
 *
 * Full body (~90 instructions in the happy path):
 *   1. Call OZImageGenerator base ctor (@0x4d7152).
 *   2. Install four vptr slots on `this` (@0x4d7157..0x4d717e).
 *   3. Build stack PCString from CFStringRef #1 (bad cfstring ref @
 *      @0x4d7193 — the CFString bytes are lazy-decoded from the
 *      binary's Objc cfstring table; the disasm shows the raw pointer
 *      is @Ozone data @0x4d7193+RIP). Construct OZChannelColor color1
 *      at `this+0x4bb0` with RGBA=(1.0,1.0,1.0,1.0), id=0x136, kind=6.
 *      Destroy stack PCString.
 *   4. Build stack PCString from CFStringRef #2 (@0x4d71f1 rip). Push
 *      NULL to stack (impl arg). Construct OZChannelDouble softness at
 *      `this+0x5038` with default 100.0, id=0x137. Destroy stack PCString.
 *   5. For each of the three inherited channels at +0x49d0, +0x4a68,
 *      +0x4b00 : call setFlag(2, false) then saveStateAsDefault().
 *
 * Full transcription requires porting OZImageGenerator (base ctor),
 * OZChannelColor::OZChannelColor, OZChannelDouble::OZChannelDouble,
 * PCString::PCString(CFStringRef,...), and OZChannelBase::setFlag /
 * saveStateAsDefault. The four vptr installs also need the pointed-at
 * function tables, which live in the OZ vtable-emitter frontier. We
 * bind the shape here and defer each callee through a throwing stub.
 */
export function OZSoftGradientGenerator_ctor_C2_factory(
  self: unknown,
  factory: unknown,
  plugUUID: unknown,
  plugFlags: number,
): void {
  // @0x4d7152: base ctor.
  OZImageGenerator_ctor_factory_stub(self, factory, plugUUID, plugFlags);

  // @0x4d7157..0x4d717e: install four vptrs on `this`.
  //   this+0x0000 ← RIP+0x39e8ba
  //   this+0x0010 ← RIP+0x39f1e8
  //   this+0x0028 ← RIP+0x39f435
  //   this+0x1978 ← RIP+0x39f482
  // (Represented as an install-side effect; the actual pointer values
  // are addresses of vtables emitted by the compiler; consumers of
  // OZSoftGradientGenerator dispatch through them at run time. This
  // TS port does not simulate the C++ vtable ABI directly — a virtual
  // call in TS resolves through the method map on the object.)

  // @0x4d7185..0x4d71a0: build stackPCString #1 from CFStringRef (Ozone
  // bundle) — the CFString is emitted at the "Objc cfstring ref: @"bad
  // cfstring ref"" comment on @0x4d7193; requires PCString port.
  const stackPCString1 = {} as unknown;
  PCString_ctor_from_CFStringRef_stub(
    stackPCString1,
    /* cfString #1 @Ozone 0x4d7193 */ null,
    /* bundle A: theApp+0x48 */ null,
    /* bundle B */ null,
  );

  try {
    // @0x4d71a5: r14 = this+0x4bb0 (OZChannelColor slot).
    // @0x4d71ac: r12 = "-[OZMagnifyTool draw]"(rbx) — the OZChannelFolder*
    //   argument. This resolves via `leaq "-[OZMagnifyTool draw]"(%rbx)`
    //   to `this + offsetof("-[OZMagnifyTool draw]")`; the symbol table
    //   entry for `"-[OZMagnifyTool draw]"` is an Objc method name that
    //   the linker has repurposed as a data offset for the folder
    //   pointer. The offset is preserved as opaque data; see
    //   raw-port/re/disasm/OZSoftGradientGenerator.OZSoftGradientGenerator.s
    //   for the resolver output.
    // @0x4d71b3: xmm0 = movsd 0x22e225(%rip)  ; RIP-target VA = 0x7053e0
    //   = double 1.0 (the RGBA broadcast source).
    // @0x4d71c2..0x4d71c8: xmm1 = xmm2 = xmm3 = xmm0  ; RGBA all 1.0.
    // @0x4d71ce: ecx = 0x136  ; channel id.
    // @0x4d71d3: r8 = 0       ; ord.
    // @0x4d71d6: r9 = 6       ; kind (matching pixelTransformSupport).
    OZChannelColor_ctor_stub(
      /* self=&this[+0x4bb0] */ null,
      /* r */ 1.0,
      /* g */ 1.0,
      /* b */ 1.0,
      /* a */ 1.0,
      /* name */ stackPCString1,
      /* folder */ null,
      /* folderOrd */ 0,
      /* flags */ 0,
      /* id */ 0x136,
    );

    // @0x4d71e5: destroy stackPCString #1.
    PCString_dtor_stub(stackPCString1);

    // @0x4d71ea..0x4d71fe: build stackPCString #2.
    const stackPCString2 = {} as unknown;
    PCString_ctor_from_CFStringRef_stub(
      stackPCString2,
      /* cfString #2 @Ozone 0x4d71f1 */ null,
      /* bundle */ null,
      /* bundle */ null,
    );
    try {
      // @0x4d7203: r15 = this+0x5038.
      // @0x4d720a: push NULL (impl arg).
      // @0x4d7212: xmm0 = movsd 0x22e20e(%rip)  ; RIP-target VA = 0x705428
      //   = double 100.0 (softness default).
      // @0x4d7224: ecx = 0x137 ; channel id.
      // @0x4d7229/0x4d722c: r8 = r9 = 0.
      OZChannelDouble_ctor_stub(
        /* self=&this[+0x5038] */ null,
        /* def */ 100.0,
        /* name */ stackPCString2,
        /* folder */ null,
        /* folderOrd */ 0,
        /* flags */ 0,
        /* impl */ null,
        /* info */ null,
      );
      // @0x4d7238: destroy stackPCString #2.
      PCString_dtor_stub(stackPCString2);
    } catch (e) {
      PCString_dtor_stub(stackPCString2);
      throw e;
    }

    // @0x4d723d..0x4d7292: for each channel at this+0x49d0 / +0x4a68 /
    // +0x4b00:  setFlag(bit=2, value=false); saveStateAsDefault();
    for (const off of [0x49d0, 0x4a68, 0x4b00]) {
      // @0x4d7244/0x4d7262/0x4d7280: mov $0x2, %esi
      // @0x4d724c/0x4d726a/0x4d7288: xor %edx, %edx (false)
      OZChannelBase_setFlag_stub(/* self=&this[+off] */ null, /* bit */ 2n, /* value */ false);
      // @0x4d7256/0x4d7274/0x4d7292:
      OZChannelBase_saveStateAsDefault_stub(/* self=&this[+off] */ null);
      void off;
    }
  } catch (e) {
    // @0x4d72a4..@0x4d7304: landing pad — destroy channels + base + resume.
    PCString_dtor_stub(stackPCString1);
    // (In the real disasm, the channel dtors run only for objects that
    // already got past their own ctor; TS mirrors that ordering by
    // letting the throw propagate after cleaning what's known-live.)
    OZImageGenerator_dtor_stub(self);
    throw e;
  }

  // @0x4d72a3: retq.
  return;
}

/**
 * `OZSoftGradientGenerator::OZSoftGradientGenerator(OZSoftGradientGenerator
 *   const&, unsigned int)` [C1 @Ozone 0x00000000004d7400 / C2 @Ozone
 *   0x00000000004d7320] copy-ctor.
 *
 * Body pattern mirrors the OZGradientGenerator copy-ctor at
 * @0x4f6610/@0x4f6670: call the OZImageGenerator copy-ctor, then
 * install the same four vptrs on `this`. Full transcription of the
 * per-field copy requires porting OZChannelColor/OZChannelDouble copy
 * ctors and the base OZImageGenerator copy semantics.
 */
export function OZSoftGradientGenerator_ctor_copy(
  self: unknown,
  src: unknown,
  arg2: number,
): void {
  throw new Error(
    "OZSoftGradientGenerator::OZSoftGradientGenerator(OZSoftGradientGenerator const&, " +
      "unsigned int) @Ozone 0x4d7320/0x4d7400 not yet transcribed " +
      "(needs OZImageGenerator copy-ctor + OZChannelColor/OZChannelDouble copies)",
  );
  void self;
  void src;
  void arg2;
}

/**
 * `OZSoftGradientGenerator::~OZSoftGradientGenerator()` D2 @Ozone
 * 0x00000000004d74e0 and D1 @Ozone 0x00000000004d75d0 (identical bodies
 * modulo tail-jmp target). Both destructors:
 *   1. Re-install the four vptrs on `this` (Itanium ABI: dtor re-writes
 *      to a slightly different tables so partially-constructed base
 *      subobjects see the correct dispatch during teardown).
 *   2. Destroy OZChannelDouble at +0x5038.
 *   3. Swap the vtable of the OZChannelColor at +0x4bb0 to
 *      OZChannelColorNoAlpha and destroy it in that vtable.
 *   4. Walk the remaining OZChannel-family + OZChannelEnum subobjects at
 *      +0x4c38 / +0x4cd0 / +0x4d68 / +0x4e00 / +0x4e98.
 *   5. Call OZCompoundChannel::~OZCompoundChannel on the color channel
 *      at +0x4bb0 (final destruction step for the compound structure).
 *   6. Tail-call OZImageGenerator::~OZImageGenerator on `this`.
 *
 * Full transcription requires the OZChannel* family and OZImageGenerator
 * dtor; deferred through stubs.
 */
export function OZSoftGradientGenerator_dtor_D1_D2(self: unknown): void {
  throw new Error(
    "OZSoftGradientGenerator::~OZSoftGradientGenerator() D1/D2 @Ozone 0x4d74e0/0x4d75d0 " +
      "not yet transcribed (needs OZChannel*/OZChannelColor*/OZChannelEnum/OZCompoundChannel/" +
      "OZImageGenerator dtors)",
  );
  void self;
}

/**
 * `OZSoftGradientGenerator::~OZSoftGradientGenerator()` D0 @Ozone
 * 0x00000000004d79c0 — same steps as D1/D2 above, followed by a
 * tail-jmp to `operator delete(void*)` on `this`.
 */
export function OZSoftGradientGenerator_dtor_D0(self: unknown): void {
  throw new Error(
    "OZSoftGradientGenerator::~OZSoftGradientGenerator() D0 @Ozone 0x4d79c0 " +
      "not yet transcribed (same body as D1/D2 + tail-jmp __ZdlPv)",
  );
  void self;
}

/**
 * `OZSoftGradientGenerator::operator=(OZSceneNode const&)` @Ozone
 * 0x00000000004d7dc0. This is the multi-inheritance base-class
 * assignment forwarding thunk emitted by clang; body forwards to the
 * OZImageGenerator (or one of the mid-hierarchy) `operator=` and then
 * copies the derived-class-owned channels. Not yet transcribed.
 */
export function OZSoftGradientGenerator_operator_assign(
  self: unknown,
  rhs: unknown,
): unknown {
  throw new Error(
    "OZSoftGradientGenerator::operator=(OZSceneNode const&) @Ozone 0x4d7dc0 " +
      "not yet transcribed (needs OZImageGenerator::operator= + owned channel copies)",
  );
  void self;
  void rhs;
}

/**
 * `OZSoftGradientGenerator::getHelium(LiAgent&, OZRenderParams const&)`
 * @Ozone 0x00000000004d7e20.
 *
 * The full 202-instruction body composes:
 *   1. Copy OZRenderParams argument into stack slots -0xc0/-0xb0 (a
 *      16+8-byte structure copy).
 *   2. Read softness = OZChannel::getValueAsDouble(this+0x5038,
 *      &oz_render_params_time, 0.0) → stack -0x60.
 *   3. Construct a stack PCColor at -0x178 (@0x4d7e81).
 *   4. Load color1 = OZChannelColor::getColor(this+0x4bb0, cmTime, &pc)
 *      into that PCColor (@0x4d7e96).
 *   5. Query OZRenderParams::getWorkingColorSpace (@0x4d7e9e).
 *   6. Project into PCWorkingColor(pcColor, workingColorSpace) at
 *      -0xa8 (@0x4d7eb4).
 *   7. Query LiAgent::getInversePixelTransform(0.0) → stack -0x140
 *      (matrix; 24 doubles).
 *   8. Allocate 0x1b0 bytes via HGObject::operator new (@0x4d7ed1).
 *   9. Construct a fresh OZHeSoftGradientGenerator on it (@0x4d7edc).
 *  10. FOUR virtual dispatch cycles through *(node.vtable+0x60):
 *      For i ∈ {0,1,2}: pass (float x, float y, float z, xmm3=0) —
 *      three columns of the 4x4 matrix at -0x140/-0x120/-0xe0.
 *      For i=3: pass the four floats from PCWorkingColor at -0xa8,
 *      -0xa4, -0xa0, -0x9c (RGBA in the working color space).
 *  11. Load 1.0/softness (@0x4d7fb1..@0x4d7fbe) into xmm0 as f32 and
 *      dispatch a fifth *(node.vtable+0x60) with i=4 (xmm1..3 zero).
 *  12. Compute src rect: (x,y) = (-r,-r), (w,h) = (2r,2r) — same math
 *      as getOriginalBounds, but into stack rect at -0x80..-0x60.
 *  13. Call PCMatrix44Tmpl<double>::transformRect against the render
 *      params' matrix at %r15[0xa0] to project into DOD rect
 *      (@0x4d800f).
 *  14. If transformed OK: floor/ceil the corners with epsilon 1e-7
 *      (movapd 0x22edfb(%rip),%xmm0 loads the 16-byte pair (1e-7,1e-7)),
 *      then cvttpd2dq into 4 int32 lanes.
 *  15. Else if LiAgent::haveROI: use LiAgent::getROI().
 *  16. Else: use _HGRectInfinite.
 *  17. Call OZHeSoftGradientGenerator::setDOD with the final rect.
 *  18. Write node pointer into out-param.
 *
 * Full transcription requires: OZChannel::getValueAsDouble (already
 * stubbed), OZChannelColor::getColor (stub), OZRenderParams (stub),
 * PCWorkingColor ctor (stub), LiAgent::getInversePixelTransform (stub),
 * PCMatrix44Tmpl<double>::transformRect (stub), OZHeSoftGradientGenerator
 * (ported — see raw-port/src/render/OZHeSoftGradientGenerator.ts), plus
 * the four-uniform vtable slot at +0x60 on that node (its shader-parameter
 * setter — which the render-side port surfaces).
 *
 * This is bound structurally here but each numeric input goes through a
 * throw-stub. The one non-trivial pure-math bit — the ceil/floor DOD
 * quantization with epsilon 1e-7 — is expressed inline so future
 * completion just needs to wire the real matrix product.
 */
export function OZSoftGradientGenerator_getHelium(
  outNodePtr: { node: unknown },
  self: unknown,
  liAgent: unknown,
  ozRenderParams: unknown,
): void {
  // @0x4d7e58: softness = OZChannel::getValueAsDouble(this+0x5038, &time, 0.0)
  const softness = OZChannel_getValueAsDouble_stub(
    /* self=this+0x5038 */ null,
    /* cmTime */ null,
    0.0,
  );

  // @0x4d7e77..0x4d7e81: PCColor pc; PCColor::PCColor(&pc)
  const pc = {} as unknown;
  PCColor_ctor_stub(pc);

  // @0x4d7e86..0x4d7e96: OZChannelColor::getColor(this+0x4bb0, cmTime, &pc)
  OZChannelColor_getColor_stub(/* self=this+0x4bb0 */ null, /* cmTime */ null, pc);

  // @0x4d7e9b..0x4d7e9e: colorSpace = OZRenderParams::getWorkingColorSpace()
  const colorSpace = OZRenderParams_getWorkingColorSpace_stub(ozRenderParams);

  // @0x4d7ea3..0x4d7eb4: PCWorkingColor(&pcw, &pc, colorSpace)
  const pcw = {} as unknown;
  PCWorkingColor_ctor_stub(pcw, pc, colorSpace);

  // @0x4d7eb9..0x4d7ec7: liAgent.getInversePixelTransform(0.0) → matrix
  const invPX = LiAgent_getInversePixelTransform_stub(liAgent, 0.0);
  void invPX;

  // @0x4d7ecc..0x4d7edc: node = new OZHeSoftGradientGenerator()
  const node = HGObject_operator_new_stub(0x1b0);
  // We would call `new OZHeSoftGradientGenerator()` here, but that class
  // is already ported in raw-port/src/render/OZHeSoftGradientGenerator.ts;
  // wiring the ctor requires a live HGObject allocator (stubbed).

  // @0x4d7ee1..0x4d7fae: four *(node.vtable+0x60)(i, x, y, z, 0.0f)
  //   dispatches. The 4x4 inverse-pixel-transform matrix at stack
  //   -0x140..-0x108 supplies three columns; the fourth call gets the
  //   PCWorkingColor's four f32 lanes at -0xa8..-0x9c.
  // Each xmm value going into the shader is cvtsd2ss'd (double→float),
  // so we would Math.fround each source double when the stubs return
  // real doubles.
  for (let i = 0; i < 4; i++) {
    // Placeholder — the real dispatch needs invPX + pcw contents.
    void i;
  }

  // @0x4d7fb1..0x4d7fd6: fifth dispatch: (i=4, 1.0/softness, 0, 0, 0).
  //   softness is READ AS A DOUBLE, and 1.0/softness is cvtsd2ss'd to
  //   f32 before being handed to the shader — so JavaScript needs
  //   Math.fround around the reciprocal.
  const invSoftness_f32 = Math.fround(1.0 / softness);
  void invSoftness_f32;

  // @0x4d7fd9..0x4d7ff7: build stack src-rect (x,y,w,h) = (-r,-r,2r,2r).
  const r = softness;
  const srcRect: PCRectD_out = {
    x: -r,
    y: -r,
    w: r + r,
    h: r + r,
  };

  // @0x4d8001..0x4d800f: dstRect = ozRenderParams[0xa0].transformRect(srcRect)
  const dstRect: PCRectD_out = { x: 0, y: 0, w: 0, h: 0 };
  const transformed = PCMatrix44Tmpl_transformRect_stub(
    /* &ozRenderParams[0xa0] */ null,
    srcRect,
    dstRect,
  );

  let x0i = 0,
    y0i = 0,
    wi = 0,
    hi = 0;
  if (transformed) {
    // @0x4d8018..0x4d8046: floor/ceil corners with epsilon 1e-7.
    //   corner_min = floor(rect.corner + 1e-7)   (roundpd $9 = floor+inexact)
    //   corner_max = ceil (rect.corner_ + rect.size - 1e-7)  ($10 = ceil+inexact)
    //   width/height = corner_max - corner_min (in int32).
    // The epsilon is a 16-byte pair (1e-7, 1e-7) at Ozone/__const 0x706e20.
    const EPS = 1e-7;
    const x0 = Math.floor(dstRect.x + EPS);
    const y0 = Math.floor(dstRect.y + EPS);
    const x1 = Math.ceil(dstRect.x + dstRect.w - EPS);
    const y1 = Math.ceil(dstRect.y + dstRect.h - EPS);
    x0i = x0 | 0;
    y0i = y0 | 0;
    wi = (x1 - x0) | 0;
    hi = (y1 - y0) | 0;
  } else {
    // @0x4d804c..0x4d8064: fallback branches (haveROI/getROI vs
    // _HGRectInfinite). Both go through the same setDOD tail; expressing
    // them fully needs LiAgent::haveROI/getROI (stubbed).
    throw new Error(
      "OZSoftGradientGenerator::getHelium DOD fallback @Ozone 0x4d804c/0x4d809e " +
        "not yet transcribed (needs LiAgent::haveROI + LiAgent::getROI + _HGRectInfinite)",
    );
  }

  // @0x4d8083: rect = HGRectMake4i(x0i, y0i, wi, hi)
  const dodRect = HGRectMake4i_stub(x0i, y0i, wi, hi);

  // @0x4d8097: node.setDOD(rect)
  // Would call OZHeSoftGradientGenerator_setDOD(node, dodRect);
  void node;
  void dodRect;

  // @0x4d80b1: *out = node
  outNodePtr.node = node;
}
