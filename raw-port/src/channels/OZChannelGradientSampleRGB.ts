// raw-port/src/channels/OZChannelGradientSampleRGB.ts
//
// FCP `OZChannelGradientSampleRGB` (ProChannel framework) — a channel-
// tree class that adds an RGB colour sub-channel to a base gradient-sample
// channel. It is a subclass of `OZChannelGradientSample` and holds an
// `OZChannelColorNoAlpha` sub-object at this+0x2b0 (recovered from the
// C2 factory ctor @0x6e3dc `leaq 0x2b0(%rbx), %rdi` — the temp PCString
// is stored there and then the sub-object ctor is called on it).
//
// Framework: ProChannel (/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework)
// The x86_64 slice is a plain Mach-O so file offsets == VAs — every
// @0xADDR below refers to both the on-disk file offset AND the runtime
// VA relative to __TEXT.
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/ProChannel.OZChannelGradientSampleRGB.*.s):
//   @0x6e39a  OZChannelGradientSampleRGB(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)  [C2 5-arg factory+folder]
//   @0x6e430  OZChannelGradientSampleRGB(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)  [C1 wrapper -> C2]
//   @0x6e43a  OZChannelGradientSampleRGB(OZFactory*, PCString const&, u32)                         [C2 3-arg factory]
//   @0x6e4d0  OZChannelGradientSampleRGB(OZFactory*, PCString const&, u32)                         [C1 wrapper -> C2]
//   @0x6e4da  OZChannelGradientSampleRGB(PCString const&, OZChannelFolder*, u32, u32)              [C2 4-arg no-factory]
//   @0x6e59c  OZChannelGradientSampleRGB(PCString const&, OZChannelFolder*, u32, u32)              [C1 wrapper -> C2]
//   @0x6e5a6  OZChannelGradientSampleRGB(PCString const&, double x5, int, OZChannelFolder*, u32, u32) [C2 10-arg presets]
//   @0x6e6a6  OZChannelGradientSampleRGB(PCString const&, double x5, int, OZChannelFolder*, u32, u32) [C1 wrapper -> C2]
//   @0x6e6b0  OZChannelGradientSampleRGB(OZChannelGradientSampleRGB const&, OZChannelFolder*)      [C2 copy]
//   @0x6e706  OZChannelGradientSampleRGB(OZChannelGradientSampleRGB const&, OZChannelFolder*)      [C1 wrapper -> C2]
//   @0x6e710  ~OZChannelGradientSampleRGB()  [D2 base dtor]
//   @0x6e748  ~OZChannelGradientSampleRGB()  [D1 complete dtor — reinstalls vtables, tail-calls parent]
//   @0x6e7ba  ~OZChannelGradientSampleRGB()  [D0 deleting dtor — D1 body then op delete]
//   @0x6e808  clone() const
//   @0x6e848  copy(OZChannelBase const*, bool)
//   @0x6e896  getObjCWrapperName()
//
// VTABLE installed pointers (both from C2 @0x6e39a):
//   primary   vtable+0x10  installed at this+0x00  = 0xdb9e0
//     (from @0x6e3ad `leaq 0x6d62c(%rip), %rax` -> next_insn 0x6e3b4 + 0x6d62c = 0xdb9e0)
//   secondary vtable+0x2f0 installed at this+0x10  = 0xdbcb8
//     (from @0x6e3b7 `leaq 0x6d8fa(%rip), %rax` -> next_insn 0x6e3be + 0x6d8fa = 0xdbcb8)
// D1 @0x6e748 re-installs the same pair via leaq disp 0x6d288 (+ 0x6e758 = 0xdb9e0)
// and 0x6d556 (+ 0x6e762 = 0xdbcb8) — matching the ctor exactly.
// D0 @0x6e7ba does the same via disps 0x6d216/0x6d4e4 for the identical target pair.
//
// STRUCT LAYOUT (recovered from D1 @0x6e748, D0 @0x6e7ba, and C2 @0x6e39a):
//   +0x000  primary vptr           (= 0xdb9e0)
//   +0x010  secondary vptr         (= 0xdbcb8)
//   +0x018..+0x2af                 OZChannelGradientSample base subobject (opaque)
//   +0x2b0  OZChannelColorNoAlpha  RGB colour sub-channel (0x3f0 bytes)
//   size = 0x6a0 (from clone @0x6e812 `movl $0x6a0, %edi`)
//
// Wrapper strings (decoded from /tmp/ProChannel.x86_64):
//   @0xe5670  __CFConstantString  ptr->@0xbcd76 len=28 -> "Channel GradientSample Color"
//   @0xe5690  __CFConstantString  ptr->@0xbcd93 len=26 -> "CHChannelGradientSampleRGB"

/**
 * Address of the FCP `OZFactory` type — opaque. Ctor arg @0x6e39a.
 */
export interface OZFactoryLike { readonly __ozFactory: true; }

/**
 * Address of the FCP `OZChannelFolder` type — opaque. Ctor arg @0x6e39a.
 */
export interface OZChannelFolderLike { readonly __ozChannelFolder: true; }

/**
 * Address of the FCP `PCString` type — opaque. Ctor arg @0x6e39a.
 */
export interface PCStringLike { readonly __pcString: true }

/**
 * Address of the FCP `OZChannelBase` type — opaque. Used by copy @0x6e848.
 */
export interface OZChannelBaseLike { readonly __ozChannelBase: true; }

/**
 * OZChannelGradientSampleRGB — RGB colour-sample subclass of the base
 * OZChannelGradientSample gradient-sample channel. Adds an
 * OZChannelColorNoAlpha sub-object at +0x2b0.
 */
export class OZChannelGradientSampleRGB {
  /**
   * @0x2b0 colourSubChannel — the OZChannelColorNoAlpha sub-object.
   * Layout: 0x3f0 bytes starting at this+0x2b0. Opaque here.
   */
  private _colourSubChannel: unknown = null;

  /**
   * OZChannelGradientSampleRGB(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
   * C2 @0x6e39a (C1 @0x6e430 tail-jmps here).
   *
   * Body walkthrough:
   *   @0x6e3a5 movq  %rdi, %rbx                       — save this.
   *   @0x6e3a8 callq OZChannelGradientSample::OZChannelGradientSample(...)  — base ctor.
   *   @0x6e3ad leaq  0x6d62c(%rip), %rax
   *   @0x6e3b4 movq  %rax, (%rbx)                     — install primary vptr @0xdb9e0.
   *   @0x6e3b7 leaq  0x6d8fa(%rip), %rax
   *   @0x6e3be movq  %rax, 0x10(%rbx)                 — install secondary vptr @0xdbcb8.
   *   @0x6e3c2 callq getProChannelBundle()            — CFBundle*.
   *   @0x6e3c7 leaq  0x772a2(%rip), %rsi              — CFString @0xe5670.
   *   @0x6e3d7 callq PCString(CFStringRef, CFBundleRef, CFBundleRef).
   *   @0x6e3dc leaq  0x2b0(%rbx), %rdi                — rdi = &this[+0x2b0].
   *   @0x6e3ea movl  $0x3, %ecx ; xorl %r8d,%r8d ; movl $0x5, %r9d  — (3, 0, 5).
   *   @0x6e3f8 callq OZChannelColorNoAlpha::OZChannelColorNoAlpha(...).
   *   @0x6e401 callq PCString::~PCString().
   *
   * Per Rule 3 the ctor @0x6e39a throws pending decode of base + sub-object ctors.
   */
  constructor(
    _factory: OZFactoryLike,
    _name: PCStringLike,
    _folder: OZChannelFolderLike | null,
    _u32a: number,
    _u32b: number,
  ) {
    throw new Error(
      "OZChannelGradientSampleRGB::OZChannelGradientSampleRGB(OZFactory*, PCString&, " +
        "OZChannelFolder*, u32, u32) @ProChannel 0x6e39a not yet transcribed — requires " +
        "base ctor @0x6e3a8, getProChannelBundle @0x6e3c2, PCString(CFStringRef,...) @0x6e3d7, " +
        "and OZChannelColorNoAlpha 5-arg C1 @0x6e3f8.",
    );
  }

  /**
   * OZChannelGradientSampleRGB::~OZChannelGradientSampleRGB()
   *
   *   D2 @0x6e710 (base dtor): pushq/popq + tail-call parent D2.
   *
   *   D1 @0x6e748 (complete dtor):
   *     @0x6e751 leaq 0x6d288(%rip), %rax ; movq %rax, (%rdi)   — reinstall primary vptr @0xdb9e0.
   *     @0x6e75b leaq 0x6d556(%rip), %rax ; movq %rax, 0x10(%rdi)  — reinstall secondary vptr @0xdbcb8.
   *     @0x6e766 addq $0x2b0, %rdi
   *     @0x6e76d callq OZChannelColorNoAlpha::~OZChannelColorNoAlpha  — destroy sub-object.
   *     @0x6e77b jmp OZChannelGradientSample::~OZChannelGradientSample  — chain to base D2.
   *
   *   D0 @0x6e7ba (deleting dtor):
   *     Same as D1, then @0x6e7df sub-object dtor, @0x6e7e7 base dtor,
   *     @0x6e7f5 jmp __ZdlPv (operator delete).
   */
  destroy(): void {
    // @0x6e76d (D1) / @0x6e7df (D0) — destroy the +0x2b0 sub-object.
    const sub = this._colourSubChannel as { destroy?: () => void } | null;
    if (sub !== null && sub !== undefined) {
      sub.destroy?.();
    }
    this._colourSubChannel = null;
    // @0x6e77b (D1) jmp OZChannelGradientSample::~D2 — base dtor stub.
    OZChannelGradientSample_destroy(this);
    // @0x6e7f5 (D0 only) jmp __ZdlPv — handled by GC at JS layer.
  }

  /**
   * OZChannelGradientSampleRGB::clone() const @0x6e808
   *
   *   @0x6e812 movl  $0x6a0, %edi                     — new-expression size = 0x6a0 bytes.
   *   @0x6e817 callq __Znwm                            — operator new(0x6a0).
   *   @0x6e827 callq copy ctor @0x6e6b0 with folder=null.
   *
   * Landing pad @0x6e834..0x6e842 (unwind cleanup) — not modeled.
   */
  clone(): OZChannelGradientSampleRGB {
    throw new Error(
      "OZChannelGradientSampleRGB::clone @ProChannel 0x6e808 not yet transcribed — " +
        "requires copy ctor @0x6e6b0 (base copy + sub-object copy).",
    );
  }

  /**
   * OZChannelGradientSampleRGB::copy(OZChannelBase const*, bool) @0x6e848
   *
   *   @0x6e85a callq OZChannelGradientSample::copy(...)  — chain to base copy.
   *   @0x6e872 callq __dynamic_cast(src, OZChannelBase, OZChannelGradientSampleRGB, 0).
   *   @0x6e877..0x6e891 dst = &this[+0x2b0]; src = &casted[+0x2b0]; jmp OZChannelColorNoAlpha::copy.
   */
  copy(_source: OZChannelBaseLike, _bool: boolean): void {
    throw new Error(
      "OZChannelGradientSampleRGB::copy @ProChannel 0x6e848 not yet transcribed — " +
        "requires OZChannelGradientSample::copy @0x6e85a, __dynamic_cast @0x6e872, " +
        "OZChannelColorNoAlpha::copy @0x6e891.",
    );
  }

  /**
   * OZChannelGradientSampleRGB::getObjCWrapperName() @0x6e896
   *
   *   @0x6e89a leaq 0x76def(%rip), %rax                — rax = CFString @0xe5690.
   *   @0x6e8a1 popq %rbp ; retq
   *
   * Constant return: the ObjC-bridge class name "CHChannelGradientSampleRGB"
   * (decoded bit-exact from /tmp/ProChannel.x86_64 at file offset 0xe5690:
   *  __CFConstantString with str_ptr low-32 = 0xbcd93 and length = 26).
   *
   * Pure function @0x6e896 — transcribed verbatim; no throw stub required.
   */
  getObjCWrapperName(): string {
    // @0xe5690 __CFConstantString -> @0xbcd93 "CHChannelGradientSampleRGB"
    return "CHChannelGradientSampleRGB";
  }
}

// ---------------------------------------------------------------------------
// Undecoded call-site stub (Rule 3 — cite the address, throw on entry).
// ---------------------------------------------------------------------------

/**
 * OZChannelGradientSample::~OZChannelGradientSample() @ProChannel
 * (tail-called from OZChannelGradientSampleRGB's D1 @0x6e77b and D0
 * @0x6e7e7). Not yet transcribed.
 */
export function OZChannelGradientSample_destroy(_self: unknown): void {
  throw new Error(
    "OZChannelGradientSample::~OZChannelGradientSample @ProChannel call " +
      "@0x6e77b (from OZChannelGradientSampleRGB D1) / @0x6e7e7 (from D0) " +
      "not yet transcribed",
  );
}
