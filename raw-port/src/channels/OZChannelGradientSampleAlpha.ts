// raw-port/src/channels/OZChannelGradientSampleAlpha.ts
//
// FCP `OZChannelGradientSampleAlpha` (ProChannel framework) — a channel-
// tree class that adds a scalar alpha (percent) sub-channel to a base
// gradient-sample channel. It is a subclass of `OZChannelGradientSample`
// and holds an `OZChannelPercent` sub-object at this+0x2b0 (recovered
// from every C2 ctor body: `leaq 0x2b0(%rbx), %rdi` immediately followed
// by an `OZChannelPercent::OZChannelPercent(...)` call — e.g. C2 5-arg
// @0x6e8e6..0x6e90a).
//
// Framework: ProChannel (/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework)
// The x86_64 slice is a plain Mach-O so file offsets == VAs — every
// @0xADDR below refers to both the on-disk file offset AND the runtime
// VA relative to __TEXT.
//
// Faithful transcription of the class's exported symbols
// (see raw-port/re/disasm/ProChannel.OZChannelGradientSampleAlpha.*.s):
//   @0x6e8a4  OZChannelGradientSampleAlpha(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)  [C2 5-arg factory+folder]
//   @0x6e942  OZChannelGradientSampleAlpha(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)  [C1 wrapper -> C2]
//   @0x6e94c  OZChannelGradientSampleAlpha(OZFactory*, PCString const&, u32)                         [C2 3-arg factory]
//   @0x6e9ea  OZChannelGradientSampleAlpha(OZFactory*, PCString const&, u32)                         [C1 wrapper -> C2]
//   @0x6e9f4  OZChannelGradientSampleAlpha(PCString const&, OZChannelFolder*, u32, u32)              [C2 4-arg no-factory: looks up singleton]
//   @0x6eac2  OZChannelGradientSampleAlpha(PCString const&, OZChannelFolder*, u32, u32)              [C1 wrapper -> C2]
//   @0x6eacc  OZChannelGradientSampleAlpha(PCString const&, double, double, double, int, OZChannelFolder*, u32, u32) [C2 preset]
//   @0x6ebbe  OZChannelGradientSampleAlpha(PCString const&, double, double, double, int, OZChannelFolder*, u32, u32) [C1 wrapper -> C2]
//   @0x6ebc8  OZChannelGradientSampleAlpha(OZChannelGradientSampleAlpha const&, OZChannelFolder*)    [C2 copy]
//   @0x6ec1e  OZChannelGradientSampleAlpha(OZChannelGradientSampleAlpha const&, OZChannelFolder*)    [C1 wrapper -> C2]
//   @0x6ec28  ~OZChannelGradientSampleAlpha()  [D2 base dtor]
//   @0x6ec60  ~OZChannelGradientSampleAlpha()  [D1 complete dtor — reinstalls vtables, chains to parent]
//   @0x6ecd2  ~OZChannelGradientSampleAlpha()  [D0 deleting dtor — D1 body then op delete]
//   @0x6ed20  clone() const
//   @0x6ed60  copy(OZChannelBase const*, bool)
//   @0x6edae  getObjCWrapperName()
//
// VTABLE installed pointers (both derived from C2 @0x6e8a4):
//   primary   vtable+0x10  installed at this+0x00  = 0xdbd28
//     (from @0x6e8b7 `leaq 0x6d46a(%rip), %rax` -> next_insn 0x6e8be + 0x6d46a = 0xdbd28)
//   secondary vtable+0x2f0 installed at this+0x10  = 0xdc000
//     (from @0x6e8c1 `leaq 0x6d738(%rip), %rax` -> next_insn 0x6e8c8 + 0x6d738 = 0xdc000)
// The 3-arg C2 @0x6e94c reinstalls the same pair via disps 0x6d3c2 (+0x6e966 = 0xdbd28)
// and 0x6d690 (+0x6e970 = 0xdc000). The 4-arg C2 @0x6e9f4 uses 0x6d2f1/0x6d5bf and the
// preset C2 @0x6eacc uses 0x6d1f7/0x6d4c5 — all resolve to the same 0xdbd28 / 0xdc000 pair.
// D1 @0x6ec60 re-installs via 0x6d0b8/0x6d386, D0 @0x6ecd2 via 0x6d046/0x6d314, D2 @0x6ec28
// via 0x6d0f0/0x6d3be — all pointing to the same 0xdbd28 / 0xdc000 pair.
//
// STRUCT LAYOUT (recovered from D1 @0x6ec60, D0 @0x6ecd2, and C2 @0x6e8a4):
//   +0x000  primary vptr                  (= 0xdbd28)
//   +0x010  secondary vptr                (= 0xdc000)
//   +0x018..+0x2af                        OZChannelGradientSample base subobject (opaque)
//   +0x2b0  OZChannelPercent              scalar alpha sub-channel (percent scalar)
//   size = 0x348 (from clone @0x6ed2a `movl $0x348, %edi`)
//
// The secondary vptr slot at +0x10 belongs to a non-primary base of size 0x10 that lives
// at this offset (base thunks `_ZThn16_...D0Ev` @0x6ed12 / `_ZThn16_...D1Ev` @0x6ec98
// subtract 0x10 to reach the object). Ports of the base classes (OZChannelBase family)
// already document this multi-inheritance shape.
//
// Wrapper strings (decoded from /tmp/ProChannel.x86_64):
//   @0xe56b0  __CFConstantString  ptr->@0xbcdae len=28 -> "Channel GradientSample Alpha"
//     (referenced by every C2 ctor as the localization key passed to
//      PCString(CFStringRef, CFBundleRef, CFBundleRef) -- e.g. @0x6e8d1
//      `leaq 0x76dd8(%rip), %rsi` -> 0x6e8d8+0x76dd8 = 0xe56b0.)
//   @0xe56d0  __CFConstantString  ptr->@0xbcdcb len=28 -> "CHChannelGradientSampleAlpha"
//     (returned constant of getObjCWrapperName @0x6edae:
//      `leaq 0x76917(%rip), %rax` -> 0x6edb9+0x76917 = 0xe56d0.)
//
// This class is the alpha-sample sibling of `OZChannelGradientSampleRGB` — same shape,
// but the sub-channel is a scalar `OZChannelPercent` (not `OZChannelColorNoAlpha`) and
// the class size is 0x348 (not 0x6a0). All non-thunk ctors initialize the sub-channel
// with `OZChannelPercent(0.0, "Channel GradientSample Alpha", this /* folder */, 3, 0,
// nullptr, nullptr)` — that is, xmm0=0.0 (the initial percent), ecx=3 (u32 arg #4),
// r8d=0 (u32 arg #5), r9d=0 (OZChannelImpl* arg #6), and stack arg (OZChannelInfo*)=0.
// The preset ctor @0x6eacc still passes 0.0 as the sub-object's initial percent —
// the preset doubles are consumed by the BASE ctor @0x6eb25 (which takes 3 doubles
// + an int), not by the sub-channel.

/**
 * Opaque `OZFactory` forward — real type lives in `OZFactory.ts` (not yet ported).
 * Referenced as arg to the 5- and 3-arg factory ctors (e.g. C2 @0x6e8a4).
 */
export interface OZFactoryLike { readonly __ozFactory: true; }

/**
 * Opaque `OZChannelFolder` forward. Passed as `folder` to base ctor + copy ctor.
 */
export interface OZChannelFolderLike { readonly __ozChannelFolder: true; }

/**
 * Opaque `PCString` forward — real type is `PCString.ts` (not fully ported).
 * All ctors accept a `PCString const&` name.
 */
export interface PCStringLike { readonly __pcString: true; }

/**
 * Opaque `OZChannelBase` forward — real type is the polymorphic root of the
 * OZChannel* hierarchy. Used by `copy(OZChannelBase const*, bool)` @0x6ed60.
 */
export interface OZChannelBaseLike { readonly __ozChannelBase: true; }

/**
 * OZChannelGradientSampleAlpha — alpha-scalar subclass of the base gradient-
 * sample channel. Adds an `OZChannelPercent` sub-object at +0x2b0.
 */
export class OZChannelGradientSampleAlpha {
  /**
   * this+0x2b0 — the `OZChannelPercent` scalar-alpha sub-channel. Its storage
   * begins at &this[+0x2b0] and its size is `0x348 - 0x2b0 = 0x98` bytes
   * (the class size is 0x348 from `clone` @0x6ed2a `movl $0x348, %edi`).
   * Opaque here because `OZChannelPercent`'s runtime shape is owned by
   * `OZChannelPercent.ts`.
   */
  private _alphaSubChannel: unknown = null;

  /**
   * OZChannelGradientSampleAlpha(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)
   * C2 @0x6e8a4 (C1 @0x6e942 tail-jmps here).
   *
   * Body walkthrough:
   *   @0x6e8af movq  %rdi, %rbx                       — save this.
   *   @0x6e8b2 callq OZChannelGradientSample::C2(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)  — base ctor.
   *   @0x6e8b7 leaq  0x6d46a(%rip), %rax
   *   @0x6e8be movq  %rax, (%rbx)                     — install primary vptr @0xdbd28.
   *   @0x6e8c1 leaq  0x6d738(%rip), %rax
   *   @0x6e8c8 movq  %rax, 0x10(%rbx)                 — install secondary vptr @0xdc000.
   *   @0x6e8cc callq getProChannelBundle()            — CFBundle* for localization.
   *   @0x6e8d1 leaq  0x76dd8(%rip), %rsi              — CFString @0xe56b0 ("Channel GradientSample Alpha").
   *   @0x6e8d8 leaq  -0x18(%rbp), %rdi                — temp PCString slot on stack.
   *   @0x6e8dc movq  %rax, %rdx                       — bundle from prev call.
   *   @0x6e8df xorl  %ecx, %ecx                       — 4th arg (bundle2) = null.
   *   @0x6e8e1 callq PCString::C1(CFStringRef, CFBundleRef, CFBundleRef).
   *   @0x6e8e6 leaq  0x2b0(%rbx), %rdi                — sub-object slot.
   *   @0x6e8ed movq  $0, (%rsp)                       — 7th arg to Percent ctor = OZChannelInfo* null.
   *   @0x6e8f5 leaq  -0x18(%rbp), %rsi                — sub-object arg 2 = temp PCString&.
   *   @0x6e8f9 xorps %xmm0, %xmm0                     — sub-object arg 1 = 0.0 (initial percent).
   *   @0x6e8fc movq  %rbx, %rdx                       — sub-object arg 3 = this (used as folder).
   *   @0x6e8ff movl  $0x3, %ecx                       — sub-object arg 4 = 3.
   *   @0x6e904 xorl  %r8d, %r8d                       — sub-object arg 5 = 0.
   *   @0x6e907 xorl  %r9d, %r9d                       — sub-object arg 6 = OZChannelImpl* null.
   *   @0x6e90a callq OZChannelPercent::C1(double, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*).
   *   @0x6e913 callq PCString::~PCString() on the temp.
   *
   * Per Rule 3 the ctor @0x6e8a4 throws pending decode of the base ctor / bundle
   * lookup / PCString construction / OZChannelPercent construction.
   */
  constructor(
    _factory: OZFactoryLike,
    _name: PCStringLike,
    _folder: OZChannelFolderLike | null,
    _u32a: number,
    _u32b: number,
  ) {
    throw new Error(
      "OZChannelGradientSampleAlpha::OZChannelGradientSampleAlpha(OZFactory*, PCString&, " +
        "OZChannelFolder*, u32, u32) @ProChannel 0x6e8a4 not yet transcribed — requires " +
        "OZChannelGradientSample::C2(OZFactory*,PCString&,OZChannelFolder*,u32,u32) @0x6e8b2, " +
        "getProChannelBundle @0x6e8cc, PCString::C1(CFStringRef,CFBundleRef,CFBundleRef) @0x6e8e1, " +
        "and OZChannelPercent::C1(double,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*,OZChannelInfo*) @0x6e90a.",
    );
  }

  /**
   * OZChannelGradientSampleAlpha(OZFactory*, PCString const&, u32)
   * C2 @0x6e94c (C1 @0x6e9ea tail-jmps here).
   *
   * Identical to the 5-arg ctor except:
   *   @0x6e95a callq OZChannelGradientSample::C2(OZFactory*, PCString&, u32)  — the 3-arg base.
   *   @0x6e95f/@0x6e969 install the same vtable pair (disps 0x6d3c2 + 0x6d690 -> 0xdbd28/0xdc000).
   *   Localization / sub-object construction bodies are byte-identical (same CFString @0xe56b0,
   *   same OZChannelPercent init: 0.0 / temp& / this / 3 / 0 / nullptr / nullptr).
   *
   * Not exposed as a distinct TypeScript ctor (only one ctor per class in TS); documented
   * here for provenance and enumerated in the header @0x6e94c.
   */

  /**
   * OZChannelGradientSampleAlpha(PCString const&, OZChannelFolder*, u32, u32)
   * C2 @0x6e9f4 (C1 @0x6eac2 tail-jmps here). No factory arg — the ctor looks
   * up the class factory itself:
   *   @0x6ea14 callq OZChannelGradientSampleAlpha_Factory::getInstance()  — factory singleton.
   *   @0x6ea19..@0x6ea2b re-marshals (this, factory, name, folder, u32, u32) and
   *   calls OZChannelGradientSample::C2(OZFactory*, PCString&, OZChannelFolder*, u32, u32).
   *   Vtable install @0x6ea30/@0x6ea3a via disps 0x6d2f1/0x6d5bf -> 0xdbd28/0xdc000.
   *   Sub-object construction identical to the other ctors (0.0 / 3 / 0 / null / null).
   *
   * Documented here for provenance; see @0x6e9f4.
   */

  /**
   * OZChannelGradientSampleAlpha(PCString const&, double, double, double, int, OZChannelFolder*, u32, u32)
   * C2 @0x6eacc (C1 @0x6ebbe tail-jmps here). "Preset" ctor:
   *   @0x6eaff callq OZChannelGradientSampleAlpha_Factory::getInstance()  — factory singleton.
   *   @0x6eb25 callq OZChannelGradientSample::C2(OZFactory*, PCString&, double, double, int, OZChannelFolder*, u32, u32)  — 8-arg base preset ctor consuming the doubles + int.
   *   Vtable install via disps 0x6d1f7/0x6d4c5 -> 0xdbd28/0xdc000.
   *   Sub-object OZChannelPercent is seeded with the FIRST preset double (`%xmm0`
   *   as the ctor entered): the spills at @0x6eaea/@0x6eaef/@0x6eaf4 store `%xmm2`,
   *   `%xmm1`, `%xmm0` at -0x50/-0x48/-0x40 respectively, and the sub-object call
   *   site @0x6eb6c reloads `-0x40(%rbp)` — the original first double. The other
   *   two doubles are consumed by the base ctor @0x6eb25 (which reloads -0x48 to
   *   `%xmm0` at @0x6eb11 and -0x50 to `%xmm1` at @0x6eb16). Vtable pair install
   *   is identical to the other ctors (disps 0x6d1f7/0x6d4c5 -> 0xdbd28/0xdc000).
   *
   * Documented here for provenance; see @0x6eacc.
   */

  /**
   * OZChannelGradientSampleAlpha(OZChannelGradientSampleAlpha const&, OZChannelFolder*)
   * C2 @0x6ebc8 (C1 @0x6ec1e tail-jmps here). Copy ctor:
   *   @0x6ebd5 callq OZChannelGradientSample::C2(OZChannelGradientSample const&, OZChannelFolder*)  — base copy.
   *   Vtable install via disps 0x6d147/0x6d415 -> 0xdbd28/0xdc000.
   *   @0x6ebef movl  $0x2b0, %eax
   *   @0x6ebf4 leaq  (%rbx,%rax), %rdi                — dst = &this[+0x2b0].
   *   @0x6ebf8 addq  %rax, %r14                       — src = &source[+0x2b0].
   *   @0x6ebfb movq  %r14, %rsi                       — sub-object arg 1 = src&.
   *   @0x6ebfe movq  %rbx, %rdx                       — sub-object arg 2 = this (as folder).
   *   @0x6ec01 callq OZChannelPercent::C1(OZChannelPercent const&, OZChannelFolder*).
   *
   * Documented here for provenance; see @0x6ebc8.
   */

  /**
   * OZChannelGradientSampleAlpha::~OZChannelGradientSampleAlpha()
   *
   *   D2 @0x6ec28 (base dtor):
   *     @0x6ec31 leaq 0x6d0f0(%rip), %rax ; movq %rax, (%rdi)   — reinstall primary @0xdbd28.
   *     @0x6ec3b leaq 0x6d3be(%rip), %rax ; movq %rax, 0x10(%rdi)  — reinstall secondary @0xdc000.
   *     @0x6ec46 addq $0x2b0, %rdi
   *     @0x6ec4d callq OZChannelPercent::~OZChannelPercent()  — destroy sub-object.
   *     @0x6ec5b jmp OZChannelGradientSample::~OZChannelGradientSample.
   *
   *   D1 @0x6ec60 (complete dtor): byte-identical to D2 except vtable disps
   *     0x6d0b8 / 0x6d386 (also resolve to the 0xdbd28 / 0xdc000 pair).
   *
   *   D0 @0x6ecd2 (deleting dtor): same body as D2, but does not tail-jmp;
   *     it explicitly calls the base dtor @0x6ecff and then falls into
   *     `jmp __ZdlPv` @0x6ed0d (operator delete).
   *
   *   Non-primary base thunks: `_ZThn16_..._D1Ev` @0x6ec98 and `_ZThn16_..._D0Ev`
   *   @0x6ed12 subtract 0x10 from `%rdi` to reach the primary base pointer, then
   *   fall through to the primary D1 / D0.
   */
  destroy(): void {
    // @0x6ec4d (D2) / @0x6ec85 (D1) / @0x6ecf7 (D0) — destroy the +0x2b0 sub-object.
    const sub = this._alphaSubChannel as { destroy?: () => void } | null;
    if (sub !== null && sub !== undefined) {
      sub.destroy?.();
    }
    this._alphaSubChannel = null;
    // @0x6ec5b (D2) / @0x6ec93 (D1) jmp OZChannelGradientSample::~D2 — base dtor stub.
    OZChannelGradientSample_destroy(this);
    // @0x6ed0d (D0 only) jmp __ZdlPv — handled by GC at JS layer.
  }

  /**
   * OZChannelGradientSampleAlpha::clone() const @0x6ed20
   *
   *   @0x6ed2a movl  $0x348, %edi                     — new-expression size = 0x348 bytes.
   *   @0x6ed2f callq __Znwm                            — operator new(0x348).
   *   @0x6ed3f callq OZChannelGradientSampleAlpha::C2(source, folder=nullptr)  — the copy ctor @0x6ebc8.
   *
   * Landing pad @0x6ed4c..0x6ed57 (unwind cleanup: delete on ctor throw) — not modeled.
   */
  clone(): OZChannelGradientSampleAlpha {
    throw new Error(
      "OZChannelGradientSampleAlpha::clone @ProChannel 0x6ed20 not yet transcribed — " +
        "requires copy ctor @0x6ebc8 (base copy + OZChannelPercent copy of sub-object).",
    );
  }

  /**
   * OZChannelGradientSampleAlpha::copy(OZChannelBase const*, bool) @0x6ed60
   *
   *   @0x6ed72 callq OZChannelGradientSample::copy(OZChannelBase const*, bool)  — chain to base copy.
   *   @0x6ed77 leaq  0x00000000 __ZTI13OZChannelBase(%rip)                       — typeinfo(OZChannelBase).
   *   @0x6ed7e leaq  0x00000000 __ZTI28OZChannelGradientSampleAlpha(%rip)         — typeinfo(this class).
   *   @0x6ed85..@0x6ed8a callq __dynamic_cast(src, OZChannelBase, OZChannelGradientSampleAlpha, 0)
   *                                                    — cross-cast the src pointer.
   *   @0x6ed8f movl  $0x2b0, %esi
   *   @0x6ed94 addq  %rsi, %r15                        — this += 0x2b0 (dst of sub-object copy).
   *   @0x6ed97 addq  %rax, %rsi                        — src += 0x2b0 (src of sub-object copy).
   *   @0x6ed9a movq  %r15, %rdi                        — arg1 = dst sub-object &.
   *   @0x6ed9d movl  %ebx, %edx                        — arg3 = the original `bool`.
   *   @0x6eda9 jmp   OZChannel::copy(OZChannelBase const*, bool)  — sub-object copy through `OZChannel::copy`.
   *
   * The final tail-jmp lands in `OZChannel::copy`, NOT `OZChannelPercent::copy`;
   * `OZChannel::copy` is the virtual entry that dispatches to the sub-object's
   * runtime type via vtable. Address recovered verbatim from the disasm.
   */
  copy(_source: OZChannelBaseLike, _bool: boolean): void {
    throw new Error(
      "OZChannelGradientSampleAlpha::copy @ProChannel 0x6ed60 not yet transcribed — " +
        "requires OZChannelGradientSample::copy @0x6ed72, __dynamic_cast @0x6ed8a, " +
        "and OZChannel::copy @0x6eda9 (tail-jmp on sub-object).",
    );
  }

  /**
   * OZChannelGradientSampleAlpha::getObjCWrapperName() @0x6edae
   *
   *   @0x6edb2 leaq 0x76917(%rip), %rax                — rax = CFString @0xe56d0.
   *   @0x6edb9 popq %rbp ; retq
   *
   * Constant return: the ObjC-bridge class name "CHChannelGradientSampleAlpha"
   * (decoded bit-exact from /tmp/ProChannel.x86_64 at file offset 0xe56d0:
   *  __CFConstantString isa=0x802000000000020a flags=0x7c8 str_ptr low-32 = 0xbcdcb
   *  and length = 28).
   *
   * Pure function @0x6edae — transcribed verbatim; no throw stub required.
   */
  getObjCWrapperName(): string {
    // @0xe56d0 __CFConstantString -> @0xbcdcb "CHChannelGradientSampleAlpha"
    return "CHChannelGradientSampleAlpha";
  }
}

// ---------------------------------------------------------------------------
// Undecoded call-site stub (Rule 3 — cite the address, throw on entry).
// ---------------------------------------------------------------------------

/**
 * `OZChannelGradientSample::~OZChannelGradientSample()` @ProChannel — the
 * parent-class destructor tail-called from every dtor in this class:
 *   D2 @0x6ec5b (jmp), D1 @0x6ec93 (jmp), D0 @0x6ecff (call).
 * Not yet transcribed.
 */
export function OZChannelGradientSample_destroy(_self: unknown): void {
  throw new Error(
    "OZChannelGradientSample::~OZChannelGradientSample @ProChannel calls " +
      "@0x6ec5b (from GradientSampleAlpha D2) / @0x6ec93 (from D1) / @0x6ecff (from D0) " +
      "not yet transcribed",
  );
}
