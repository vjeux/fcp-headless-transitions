// OZChannelCurveInfo — descriptor/metadata object for OZChannelCurve values.
// Faithful transcription from ProChannel.framework. Every field, constant, and
// method cites its @ProChannel 0xADDR read from the disassembly under
// re/disasm/ProChannel.OZChannelCurveInfo.*.s.
//
// This class is a small "info" descriptor with no state of its own beyond its
// two base subobjects. It is a two-base multiple-inheritance layout:
//
//   size    unknown-but-≥0x58 (has PCSingleton subobject at +0x50)
//   +0x00   OZChannelInfo base subobject (primary):
//             ctor call @0x61203:
//               OZChannelInfo::OZChannelInfo(double, double, double, double,
//                                            double, char const*)
//             invoked with:
//               arg1(xmm0)=0.0       (xorps xmm0,xmm0 @0x611f7)
//               arg2(xmm1)=0.0       (xorps xmm1,xmm1 @0x611fa)
//               arg3(xmm2)=1.0       (movsd 0x4e331(%rip),%xmm2 @0x611ef -> const @0xaf528 = 1.0)
//               arg4(xmm3)=1.0       (movaps xmm2,xmm3 @0x611fd)
//               arg5(xmm4)=1.0       (movaps xmm2,xmm4 @0x61200)
//               arg6(rsi)=""         (leaq 0x5b209(%rip),%rsi @0x611e8 -> empty c-string
//                                     in literal pool)
//   +0x50   PCSingleton base subobject:
//             ctor call @0x61211:
//               PCSingleton::PCSingleton(unsigned int)   (stub 0xacb46)
//             invoked with:
//               arg2(esi)=0x64=100   (movl 0x64,%esi @0x6120c)
//             dtor: PCSingleton::~PCSingleton()          (stub 0xacb4c)
//
// After the two base ctors, the ctor installs the derived vtable at both slots:
//   *(this+0x00) = OZChannelCurveInfo_vtable + 0x10     (@0x61221) — primary vptr
//   *(this+0x50) = OZChannelCurveInfo_vtable + 0x30     (@0x61228) — MI-thunks vptr
//
// vtable @ProChannel 0xd9810 (raw-port/army/tools/resolve.py ProChannel vtable
// OZChannelCurveInfo). Installed ptrs are vtable+0x10 (primary) and vtable+0x30
// (secondary/thunks). Slots 0 / 0x8 are the D1 / D0 destructors; slots 0x20 /
// 0x28 are the non-virtual-thunk destructors for the secondary vptr; typeinfo
// for the base is at slot 0x48 (typeinfo for OZChannelInfo). The interior
// slots reference OZFactoryBase / OZChannelBase methods (getIconName,
// getIconID, getInstanceID, getSerializer, description, ...) — all inherited,
// NOT overridden by OZChannelCurveInfo itself.
//
// Construction site: this class is a singleton produced by
//   OZChannelCurve::createOZChannelCurveInfo()
// (symbol __ZN14OZChannelCurve24createOZChannelCurveInfoEv in
// ProChannel_symmap.tsv) which is invoked exactly once via std::call_once
// (proxy symbol __ZNSt3__117__call_once_proxy...). The '100' passed to
// PCSingleton is presumably the singleton slot/type id.
//
// FRONTIER — un-decoded callees this class depends on:
//   OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)  @ProChannel  (external body)
//   OZChannelInfo::~OZChannelInfo()                      @ProChannel  (external body)
//   PCSingleton::PCSingleton(unsigned int)               (stub @0xacb46 in ProChannel;
//                                                        body lives outside ProChannel)
//   PCSingleton::~PCSingleton()                          (stub @0xacb4c in ProChannel;
//                                                        body lives outside ProChannel)
//   __ZdlPv (operator delete)                            (stub @0xace04 in ProChannel;
//                                                        libc++ABI)

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Opaque handle for the OZChannelInfo base subobject.  The full class is not
 * yet transcribed — its ctor / dtor are external to this file. See
 * `OZChannelInfo::OZChannelInfo(double, double, double, double, double,
 * char const*)` @ProChannel (mangled __ZN13OZChannelInfoC2EdddddPKc).
 */
export interface OZChannelInfoBase {
  /** Zeroed slot representing the base ctor having run with args
   *  (0.0, 0.0, 1.0, 1.0, 1.0, ""). Actual fields decoded when
   *  OZChannelInfo.ts is transcribed. */
  readonly _placeholder: never;
}

/**
 * Opaque handle for the PCSingleton base subobject.  External to ProChannel
 * (ctor/dtor are dylib symbol stubs @0xacb46 / @0xacb4c in ProChannel). The
 * runtime state is a singleton-registry slot indexed by an unsigned int
 * (0x64 = 100 for OZChannelCurveInfo — see ctor @0x6120c).
 */
export interface PCSingletonBase {
  readonly _placeholder: never;
}

/**
 * OZChannelCurveInfo — value/metadata descriptor for OZChannelCurve.
 *
 * Faithful mirror of the C++ two-base multiple-inheritance object. TS has no
 * multiple inheritance, so the base subobjects are modelled as named fields at
 * their documented byte offsets. The ctor and dtors below mirror the FCP
 * assembly line-for-line.
 */
export class OZChannelCurveInfo {
  /** +0x00 — OZChannelInfo base subobject. Primary vptr = vtable+0x10 lives at
   *  &this[+0x00] in the C++ layout (@0x61221). */
  readonly channelInfo: OZChannelInfoBase;

  /** +0x50 — PCSingleton base subobject. Secondary vptr = vtable+0x30 lives at
   *  &this[+0x50] in the C++ layout (@0x61228). */
  readonly singleton: PCSingletonBase;

  /**
   * OZChannelCurveInfo::OZChannelCurveInfo()  @ProChannel 0x611de
   *   __ZN18OZChannelCurveInfoC2Ev
   *
   * Disasm:
   *   0x611e8  leaq 0x5b209(%rip),%rsi          ; empty c-string ""
   *   0x611ef  movsd 0x4e331(%rip),%xmm2        ; const @0xaf528 = 1.0
   *   0x611f7  xorps %xmm0,%xmm0                ; arg1 = 0.0
   *   0x611fa  xorps %xmm1,%xmm1                ; arg2 = 0.0
   *   0x611fd  movaps %xmm2,%xmm3               ; arg4 = 1.0
   *   0x61200  movaps %xmm2,%xmm4               ; arg5 = 1.0
   *   0x61203  callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)
   *   0x61208  leaq 0x50(%rbx),%rdi             ; &this[+0x50]
   *   0x6120c  movl $0x64,%esi                  ; arg2 = 100
   *   0x61211  callq PCSingleton::PCSingleton(unsigned int)   ; stub @0xacb46
   *   0x61216  leaq OZChannelCurveInfo_vtable(%rip),%rax      ; @0xd9810
   *   0x6121d  leaq 0x10(%rax),%rcx             ; primary installed vptr
   *   0x61221  movq %rcx,(%rbx)                 ; *(this+0x00) = vtable+0x10
   *   0x61224  addq $0x30,%rax                  ; secondary installed vptr
   *   0x61228  movq %rax,0x50(%rbx)             ; *(this+0x50) = vtable+0x30
   *   0x61230  retq
   *
   * Landing pad (@0x61231): on exception from PCSingleton ctor, unwind the
   * already-constructed OZChannelInfo base via OZChannelInfo::~OZChannelInfo()
   * @0x61237, then __Unwind_Resume @0x6123f (stub 0xacaf2). TypeScript handles
   * partial-construction cleanup via GC/finalizers, so no explicit code here.
   */
  constructor() {
    // Constructing the two base subobjects requires transcriptions of
    // OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) and
    // PCSingleton::PCSingleton(unsigned int). Neither is decoded yet in this
    // port — matching Rule 3 (throw on undecoded, never approximate).
    // Fields are captured for downstream introspection when those classes
    // land.
    this.channelInfo = OZChannelCurveInfo._constructChannelInfoBase();
    this.singleton   = OZChannelCurveInfo._constructPCSingletonBase(0x64);
  }

  /**
   * OZChannelInfo::OZChannelInfo(double, double, double, double, double,
   *                              char const*)  @ProChannel (external body,
   *   symbol __ZN13OZChannelInfoC2EdddddPKc) — called with args
   *   (0.0, 0.0, 1.0, 1.0, 1.0, "") from OZChannelCurveInfo ctor @0x61203.
   */
  private static _constructChannelInfoBase(): OZChannelInfoBase {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*) @ProChannel " +
      "(__ZN13OZChannelInfoC2EdddddPKc) not yet transcribed — called from " +
      'OZChannelCurveInfo::OZChannelCurveInfo() @0x61203 with args (0.0, 0.0, 1.0, 1.0, 1.0, "").',
    );
  }

  /**
   * PCSingleton::PCSingleton(unsigned int)  — stub @ProChannel 0xacb46
   *   (body lives outside ProChannel.framework). Called with slot id 0x64=100
   *   from OZChannelCurveInfo ctor @0x61211.
   */
  private static _constructPCSingletonBase(_slotId: number): PCSingletonBase {
    throw new Error(
      "PCSingleton::PCSingleton(unsigned int) @ProChannel stub 0xacb46 not yet transcribed — " +
      "called from OZChannelCurveInfo::OZChannelCurveInfo() @0x61211 with slot=0x64 (100).",
    );
  }

  /**
   * OZChannelCurveInfo::~OZChannelCurveInfo()  @ProChannel 0x61244
   *   __ZN18OZChannelCurveInfoD1Ev   (base destructor / D1)
   *
   * Disasm:
   *   0x6124d  addq $0x50,%rdi                  ; &this[+0x50]
   *   0x61251  callq PCSingleton::~PCSingleton()  ; stub @0xacb4c
   *   0x61256  movq %rbx,%rdi                   ; this
   *   0x6125f  jmp OZChannelInfo::~OZChannelInfo()  ; tail-call
   *
   * i.e. tears down bases in reverse construction order:
   *   1) PCSingleton base at +0x50
   *   2) OZChannelInfo base at +0x00
   */
  destroy(): void {
    // Mirror the C++ base-dtor sequence. Each throws until the base classes
    // are transcribed.
    OZChannelCurveInfo._destroyPCSingletonBase(this.singleton);
    OZChannelCurveInfo._destroyChannelInfoBase(this.channelInfo);
  }

  /**
   * OZChannelCurveInfo::~OZChannelCurveInfo()  @ProChannel 0x61264
   *   __ZN18OZChannelCurveInfoD0Ev   (deleting destructor / D0)
   *
   * Disasm:
   *   0x6126d  addq $0x50,%rdi                  ; &this[+0x50]
   *   0x61271  callq PCSingleton::~PCSingleton()  ; stub @0xacb4c
   *   0x61276  movq %rbx,%rdi                   ; this
   *   0x61279  callq OZChannelInfo::~OZChannelInfo()  ; @ProChannel
   *   0x6127e  movq %rbx,%rdi                   ; this
   *   0x61287  jmp __ZdlPv                      ; operator delete — stub @0xace04
   *
   * Same as D1 followed by `operator delete(this)`. In TS the "delete" step
   * is a no-op (GC-managed); the base-teardown sequence is otherwise
   * identical to `destroy()`.
   */
  deleteThis(): void {
    OZChannelCurveInfo._destroyPCSingletonBase(this.singleton);
    OZChannelCurveInfo._destroyChannelInfoBase(this.channelInfo);
    // operator delete(this) — stub @0xace04. GC-managed in TS: no-op.
  }

  /**
   * PCSingleton::~PCSingleton()  — stub @ProChannel 0xacb4c (external body).
   */
  private static _destroyPCSingletonBase(_s: PCSingletonBase): void {
    throw new Error(
      "PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c not yet transcribed — " +
      "called from OZChannelCurveInfo::~OZChannelCurveInfo() @0x61251 / @0x61271.",
    );
  }

  /**
   * OZChannelInfo::~OZChannelInfo()  @ProChannel (external body, symbol
   *   __ZN13OZChannelInfoD2Ev) — called from D1 @0x6125f (tail-jump) and D0
   *   @0x61279, and from the ctor unwind landing pad @0x61237.
   */
  private static _destroyChannelInfoBase(_c: OZChannelInfoBase): void {
    throw new Error(
      "OZChannelInfo::~OZChannelInfo() @ProChannel (__ZN13OZChannelInfoD2Ev) not yet transcribed — " +
      "called from OZChannelCurveInfo::~OZChannelCurveInfo() @0x6125f / @0x61279 and unwind @0x61237.",
    );
  }
}
