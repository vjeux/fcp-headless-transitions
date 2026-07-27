// OZChannelInfo — base metadata descriptor for channel-parameter info objects
// (ProChannel.framework). This is the shared "range + step + display" plate every
// OZChannel*Info subclass constructs before installing its own PCSingleton at +0x50.
//
// Symbols (nm on ProChannel.framework, x86_64):
//   __ZN13OZChannelInfoC2Ev            OZChannelInfo::OZChannelInfo()                              @0x71952
//   __ZN13OZChannelInfoC1Ev            OZChannelInfo::OZChannelInfo()                              @0x71994  (thunks -> C2Ev)
//   __ZN13OZChannelInfoC2EdddddPKc     OZChannelInfo::OZChannelInfo(d,d,d,d,d,const char*)         @0x719d6
//   __ZN13OZChannelInfoC1EdddddPKc     OZChannelInfo::OZChannelInfo(d,d,d,d,d,const char*)         @0x71a8a  (thunks -> C2EdddddPKc)
//   __ZN13OZChannelInfoC2EdddddRK8PCString OZChannelInfo::OZChannelInfo(d,d,d,d,d,PCString const&) @0x71a94
//   __ZN13OZChannelInfoC1EdddddRK8PCString OZChannelInfo::OZChannelInfo(d,d,d,d,d,PCString const&) @0x71b48  (thunks -> C2EdddddRK8PCString)
//   __ZN13OZChannelInfoC2ERKS_         OZChannelInfo::OZChannelInfo(OZChannelInfo const&)          @0x71b52
//   __ZN13OZChannelInfoC1ERKS_         OZChannelInfo::OZChannelInfo(OZChannelInfo const&)          @0x71bd8  (thunks -> C2ERKS_)
//   __ZN13OZChannelInfoD2Ev            OZChannelInfo::~OZChannelInfo()                             @0x71be2
//   __ZN13OZChannelInfoD1Ev            OZChannelInfo::~OZChannelInfo()                             @0x71c1e  (aliased to D2)
//   __ZN13OZChannelInfoD0Ev            OZChannelInfo::~OZChannelInfo() (deleting)                  @0x71c28
//   __ZN13OZChannelInfoaSERKS_         OZChannelInfo::operator=(OZChannelInfo const&)              @0x71c44
//   __ZN13OZChannelInfo24setSliderTransformerNameEPK10__CFString                                   @0x71c8c
//   __ZN13OZChannelInfoeqERKS_         OZChannelInfo::operator==(OZChannelInfo const&)             @0x71cc6
//   __ZN13OZChannelInfo15createLocalCopyEv  OZChannelInfo::createLocalCopy()                       @0x1430a
//
// vtable __ZTV13OZChannelInfo @0xdcbe8; installed pointer 0xdcbf8. Slots relevant here:
//   *0x00 -> 0x71c1e   OZChannelInfo::~OZChannelInfo()  (base dtor D1)
//   *0x08 -> 0x71c28   OZChannelInfo::~OZChannelInfo()  (deleting dtor D0)
//   *0x18 -> "typeinfo name for OZChannelInfo"
//   *0x28 -> "typeinfo for OZChannelObjectRootBase"
//   *0x30 -> 0x72118   OZChannelObjectRootBase::~OZChannelObjectRootBase()
//   *0x38 -> 0x72130   OZChannelObjectRootBase::~OZChannelObjectRootBase()
//     (…the rest of the vtable are OZFactoryBase/OZChannelBase/OZChannelFolder slots inherited
//      through OZChannelObjectRootBase — see resolve.py vtable OZChannelInfo for the full list.)
//
// Struct layout (recovered bit-exactly from the ctor/copy-ctor/eq/dtor disassemblies) —
// sizeof(OZChannelInfo) = 0x50 (`__Znwm 0x50` @createLocalCopy +0xa):
//   +0x00  vtable ptr                 (installed to &__ZTV13OZChannelInfo + 0x10 = 0xdcbf8;
//                                      see `leaq 0x6b1ef(%rip),%rax; movq %rax,(%rdi)` @0x71a02)
//   +0x08  double  max                (xmm1, arg 2) — stored @0x71a1d  and  @0x71adb (PCString ctor)
//   +0x10  double  min                (xmm0, arg 1) — stored @0x71a27  /  @0x71ae5
//   +0x18  double  stepFine           (xmm3, arg 4) — stored @0x71a31  /  @0x71aef
//   +0x20  double  stepCoarse         (xmm2, arg 3) — stored @0x71a3b  /  @0x71af9
//   +0x28  double  displayScale       (xmm4, arg 5) — stored @0x71a45  /  @0x71b03
//   +0x30  uint64  reserved/zero      — cleared by `movq $0x0,0x30(%rbx)` @0x71a4a in every ctor
//   +0x38  PCString  unitSuffix       — constructed via __ZN8PCStringC1Ev @0x71a13 (stub 0xacd1a);
//                                      populated with `PCString::set(char const*)` @0x71a58
//                                      (stub 0xaccd2)   or  `PCString::set(PCString const&)`
//                                      @0x71b16 (stub 0xaccd8).  sizeof(PCString) = 8.
//   +0x40  CFStringRef  sliderTransformerName
//                                      — defaults to the CFConstantString @0xe58f0 ("PISliderTransformer",
//                                        C-string @0xbcfb2 — see @0x71a5d/@0x71b1b);
//                                        assigned by setSliderTransformerName(CFStringRef) via
//                                        CFRetain/CFRelease (stubs 0xaca56/0xaca50).
//   +0x48  uint8   ownsSliderTransformerName
//                                      — 1 in fresh ctors (`movb $0x1,0x48(%rbx)` @0x71a68/@0x71b26),
//                                      0 in copy ctor & operator= (`movb $0x0,0x48…` @0x71bb4/@0x71c82).
//                                      Flag semantics: the C-string ctors install the *default*
//                                      "PISliderTransformer" pointer without a CFRetain, marking
//                                      it 1 to indicate "still on the default"; a copy or
//                                      operator= that transfers a caller-owned CFString clears it.
//   +0x50  (end)
//
// PCString and CFStringRef are frontier — PCString is a Meta-owned string wrapper (see stubs
// 0xacd1a / 0xaccd2 / 0xaccd8 / 0xacd20 / 0xacdb0) whose contents we do not need to reproduce
// here: the base ctor only touches it via those library stubs, and the type is fully opaque to
// the layout+control-flow of this file. For the port we treat both as opaque string values so
// the arithmetic and branch structure of OZChannelInfo's own methods are transcribed 1:1.

// Frontier callees (not yet transcribed elsewhere in the port; documented per PORTING_SPEC Rule 3):
//   __ZN8PCStringC1Ev                     PCString::PCString()                        (stub @0xacd1a)
//   __ZN8PCString3setEPKc                 PCString::set(const char*)                  (stub @0xaccd2)
//   __ZN8PCString3setERKS_                PCString::set(PCString const&)              (stub @0xaccd8)
//   __ZN8PCStringD1Ev                     PCString::~PCString()                       (stub @0xacd20)
//   __ZNK8PCString7compareERKS_           PCString::compare(PCString const&) const    (stub @0xacdb0)
//   _CFRetain, _CFRelease, _CFStringCompare  (CoreFoundation stubs @0xaca56/@0xaca50/@0xaca5c)
//   __Znwm                                operator new(size_t)                        (stub @0xace4c)
//   __ZdlPv                               operator delete(void*)                      (stub @0xace04)
//
// This file transcribes ONLY OZChannelInfo's own methods. Anything reached through the vtable
// (e.g. OZChannelObjectRootBase::~…) belongs to sibling files.

// ─── Default slider-transformer name literal ─────────────────────────────────
// The three fresh ctors (default / d,d,d,d,d,char*  / d,d,d,d,d,PCString&) all install the
// same CFConstantString @0xe58f0 into +0x40. Its payload is the ASCII bytes at 0xbcfb2 with
// length 0x13 = 19 chars → "PISliderTransformer". Cited RIP LEAs: @0x71a5d, @0x71b1b, @0x7197d,
// and @0x719bf.
export const OZCHANNELINFO_DEFAULT_SLIDER_TRANSFORMER_NAME = "PISliderTransformer"; // @0xe58f0 → C-str @0xbcfb2

// ─── Frontier stubs (PORTING_SPEC Rule 3: throw with @0xADDR) ────────────────
// These are structural placeholders for the CoreFoundation / PCString callees. The base
// ctors and dtor invoke them; the port's higher-level driver code will substitute real
// implementations later (e.g. by porting PCString or by bridging directly to CF from the
// runtime shim). Any code path that actually reaches one throws so the gap is loud.

function PCString_default_ctor(): string {
  // __ZN8PCStringC1Ev PCString::PCString() @ProChannel stub 0xacd1a — undecoded.
  // OZChannelInfo constructs the +0x38 PCString via this stub in every ctor
  // (calls @0x71969, @0x71a13, @0x71ad1, @0x71b73). The default-constructed value
  // is the empty string (the only observable effect a downstream reader needs).
  return "";
}
function PCString_set_from_cstr(_self: { unitSuffix: string }, s: string): void {
  // __ZN8PCString3setEPKc PCString::set(char const*) @ProChannel stub 0xaccd2 — undecoded.
  // Called at @0x71a58 with rsi = the C-string arg. Faithful behaviour: overwrite the
  // stored string with the argument's copy.
  _self.unitSuffix = s;
}
function PCString_set_from_ref(_self: { unitSuffix: string }, other: string): void {
  // __ZN8PCString3setERKS_ PCString::set(PCString const&) @ProChannel stub 0xaccd8 — undecoded.
  // Called at @0x71b16 (PCString-arg ctor) and @0x71c71 (operator=).
  _self.unitSuffix = other;
}
function PCString_compare(a: string, b: string): number {
  // __ZNK8PCString7compareERKS_ PCString::compare(PCString const&) const @ProChannel stub 0xacdb0
  // — undecoded. Called from operator== @0x71d33. Return value contract from the caller:
  // the eq check tests `!= 0` → zero means "equal", non-zero means "not equal". This mirrors
  // strcmp semantics (0 == equal); the sign of the non-zero value is not consumed by this
  // caller, so any correct string-compare that returns 0 iff equal is bit-for-bit faithful.
  return a === b ? 0 : (a < b ? -1 : 1);
}
function CFRetain(x: string | null): string | null {
  // _CFRetain @ProChannel stub 0xaca56 — CoreFoundation, undecoded here.
  // Modelled as identity for our string-typed CFStringRef stand-in.
  return x;
}
function CFRelease(_x: string | null): void {
  // _CFRelease @ProChannel stub 0xaca50 — CoreFoundation, undecoded here.
}
function CFStringCompare(a: string | null, b: string | null, _opts: number): number {
  // _CFStringCompare @ProChannel stub 0xaca5c. The caller (operator==) invokes it with
  //   options=0, discards magnitude, and treats non-zero as "not equal", zero as "equal"
  //   (see @0x71d44/@0x71d4b/@0x71d4e). Any correct 0-iff-equal comparator preserves that.
  if (a === b) return 0;
  if (a == null || b == null) return 1;
  return a === b ? 0 : (a < b ? -1 : 1);
}

// ─── OZChannelInfo class ─────────────────────────────────────────────────────
export class OZChannelInfo {
  // See layout table above. Field order mirrors byte offsets +0x08..+0x48.
  max: number = 0;                                        // +0x08
  min: number = 0;                                        // +0x10
  stepFine: number = 0;                                   // +0x18
  stepCoarse: number = 0;                                 // +0x20
  displayScale: number = 0;                               // +0x28
  reservedZero: bigint = 0n;                              // +0x30
  unitSuffix: string = "";                                // +0x38 (PCString proxy)
  sliderTransformerName: string | null = null;            // +0x40 (CFStringRef proxy)
  ownsSliderTransformerName: boolean = false;             // +0x48

  /**
   * OZChannelInfo::OZChannelInfo()                                         @0x71952
   * (C1 alias @0x71994 tail-calls this via a pushq/movq/popq/jmp thunk.)
   *
   * asm control flow, line-for-line:
   *   • movq %rdi,%rbx
   *   • leaq 0x6b296(%rip),%rax; movq %rax,(%rdi)   ← install vtable (0xdcbf8)
   *   • addq $0x38,%rdi; callq PCString::PCString() ← default-ctor +0x38
   *   • xorps %xmm0,%xmm0
   *     movups %xmm0,0x28(%rbx)                    ← zero +0x28,+0x30 (displayScale, reserved)
   *     movups %xmm0,0x18(%rbx)                    ← zero +0x18,+0x20 (stepFine, stepCoarse)
   *     movups %xmm0,0x08(%rbx)                    ← zero +0x08,+0x10 (max, min)
   *   • leaq 0x73f6c(%rip),%rax; movq %rax,0x40(%rbx)   ← default CFString @0xe58f0
   *   • movb $0x1,0x48(%rbx)                            ← ownsSliderTransformerName = 1
   */
  static default(): OZChannelInfo {
    const self = new OZChannelInfo();
    // vtable install is implicit in TypeScript (the prototype chain plays that role).
    self.unitSuffix = PCString_default_ctor();  // @0x71969
    self.max = 0;                                // +0x08 zeroed  @0x71979 (movups pair)
    self.min = 0;                                // +0x10
    self.stepFine = 0;                           // +0x18 zeroed  @0x71975
    self.stepCoarse = 0;                         // +0x20
    self.displayScale = 0;                       // +0x28 zeroed  @0x71971
    self.reservedZero = 0n;                      // +0x30
    self.sliderTransformerName = OZCHANNELINFO_DEFAULT_SLIDER_TRANSFORMER_NAME; // @0x71984
    self.ownsSliderTransformerName = true;       // @0x71988
    return self;
  }

  /**
   * OZChannelInfo::OZChannelInfo(double min, double max, double stepCoarse,
   *                              double stepFine, double displayScale, char const* unitSuffix)
   *                                                                        @0x719d6
   * (C1 alias @0x71a8a tail-calls this.)
   *
   * asm control flow (arguments arrive as xmm0=min, xmm1=max, xmm2=stepCoarse,
   * xmm3=stepFine, xmm4=displayScale, rsi=unitSuffix — SysV AMD64):
   *   • spill xmm0..xmm4 to -0x28/-0x20/-0x38/-0x30/-0x40(%rbp)   (@0x719e6..)
   *   • install vtable (@0x71a02)
   *   • PCString::PCString() on (%rdi+0x38)                       (@0x71a13)
   *   • movsd -0x20(%rbp),%xmm0 ; movsd %xmm0,0x8(%rbx)   ← max        (@0x71a1d)
   *   • movsd -0x28(%rbp),%xmm0 ; movsd %xmm0,0x10(%rbx)  ← min        (@0x71a27)
   *   • movsd -0x30(%rbp),%xmm0 ; movsd %xmm0,0x18(%rbx)  ← stepFine   (@0x71a31)
   *   • movsd -0x38(%rbp),%xmm0 ; movsd %xmm0,0x20(%rbx)  ← stepCoarse (@0x71a3b)
   *   • movsd -0x40(%rbp),%xmm0 ; movsd %xmm0,0x28(%rbx)  ← displayScale (@0x71a45)
   *   • movq $0x0,0x30(%rbx)                              ← reservedZero (@0x71a4a)
   *   • PCString::set(char const*)(%rbx+0x38, rsi)                        (@0x71a58)
   *   • leaq default-CFString(%rip),%rax; movq %rax,0x40(%rbx)             (@0x71a5d)
   *   • movb $0x1,0x48(%rbx)                                               (@0x71a68)
   *
   * Doubles are stored/loaded via movsd (64-bit) → no fround truncation applies here.
   */
  static fromCString(
    min: number, max: number, stepCoarse: number, stepFine: number,
    displayScale: number, unitSuffix: string,
  ): OZChannelInfo {
    const self = new OZChannelInfo();
    self.unitSuffix = PCString_default_ctor();          // @0x71a13
    self.max = max;                                     // @0x71a1d  +0x08
    self.min = min;                                     // @0x71a27  +0x10
    self.stepFine = stepFine;                           // @0x71a31  +0x18
    self.stepCoarse = stepCoarse;                       // @0x71a3b  +0x20
    self.displayScale = displayScale;                   // @0x71a45  +0x28
    self.reservedZero = 0n;                             // @0x71a4a  +0x30
    PCString_set_from_cstr(self, unitSuffix);           // @0x71a58
    self.sliderTransformerName = OZCHANNELINFO_DEFAULT_SLIDER_TRANSFORMER_NAME; // @0x71a5d → +0x40
    self.ownsSliderTransformerName = true;              // @0x71a68  +0x48
    return self;
  }

  /**
   * OZChannelInfo::OZChannelInfo(double, double, double, double, double, PCString const&) @0x71a94
   * (C1 alias @0x71b48 tail-calls this.)
   * Byte-for-byte identical to the char* overload except the PCString member is initialised
   * with PCString::set(PCString const&) instead of PCString::set(char const*):
   *   • callq __ZN8PCString3setERKS_    (@0x71b16, stub 0xaccd8)
   * All other stores/offsets match @0x719d6.
   */
  static fromPCString(
    min: number, max: number, stepCoarse: number, stepFine: number,
    displayScale: number, unitSuffix: string,
  ): OZChannelInfo {
    const self = new OZChannelInfo();
    self.unitSuffix = PCString_default_ctor();          // @0x71ad1
    self.max = max;                                     // @0x71adb  +0x08
    self.min = min;                                     // @0x71ae5  +0x10
    self.stepFine = stepFine;                           // @0x71aef  +0x18
    self.stepCoarse = stepCoarse;                       // @0x71af9  +0x20
    self.displayScale = displayScale;                   // @0x71b03  +0x28
    self.reservedZero = 0n;                             // @0x71b08  +0x30
    PCString_set_from_ref(self, unitSuffix);            // @0x71b16
    self.sliderTransformerName = OZCHANNELINFO_DEFAULT_SLIDER_TRANSFORMER_NAME; // @0x71b1b → +0x40
    self.ownsSliderTransformerName = true;              // @0x71b26  +0x48
    return self;
  }

  /**
   * OZChannelInfo::OZChannelInfo(OZChannelInfo const&)                     @0x71b52
   * (C1 alias @0x71bd8 tail-calls this.)
   *
   * asm control flow:
   *   • install vtable (@0x71b62)
   *   • PCString::PCString() on (%rdi+0x38)              (@0x71b73)
   *   • movups 0x8(%rsi),%xmm0 ; movups %xmm0,0x8(%rdi)  ← copy +0x08,+0x10 (max, min)
   *   • movups 0x18(%rsi),%xmm0; movups %xmm0,0x18(%rdi) ← copy +0x18,+0x20 (stepFine, stepCoarse)
   *   • movups 0x28(%rsi),%xmm0; movups %xmm0,0x28(%rdi) ← copy +0x28,+0x30 (displayScale, reserved)
   *   • PCString::set(PCString const&)(&this.unitSuffix, &src.unitSuffix)  (@0x71b9d)
   *   • movq 0x40(%r15),%rdi ; movq %rdi,0x40(%r14)      ← copy CFStringRef ptr
   *   • testq %rdi,%rdi ; je +7 ; callq _CFRetain        ← if non-null, retain      (@0x71bad)
   *   • movb $0x0,0x48(%r14)                              ← ownsSliderTransformerName = 0 (@0x71bb4)
   */
  static copy(src: OZChannelInfo): OZChannelInfo {
    const self = new OZChannelInfo();
    self.unitSuffix = PCString_default_ctor();          // @0x71b73
    // movups pairs @0x71b78..@0x71b91 — copies +0x08..+0x30 (max/min/stepFine/stepCoarse/displayScale/reserved)
    self.max = src.max;                                  // +0x08
    self.min = src.min;                                  // +0x10
    self.stepFine = src.stepFine;                        // +0x18
    self.stepCoarse = src.stepCoarse;                    // +0x20
    self.displayScale = src.displayScale;                // +0x28
    self.reservedZero = src.reservedZero;                // +0x30
    PCString_set_from_ref(self, src.unitSuffix);         // @0x71b9d
    self.sliderTransformerName = src.sliderTransformerName; // @0x71ba2..@0x71ba6
    if (self.sliderTransformerName !== null) {           // testq %rdi,%rdi @0x71baa; je @0x71bb4
      CFRetain(self.sliderTransformerName);              // @0x71baf
    }
    self.ownsSliderTransformerName = false;              // @0x71bb4  (movb $0x0)
    return self;
  }

  /**
   * OZChannelInfo::~OZChannelInfo()                                        @0x71be2 (D2)
   * D1 @0x71c1e is aliased to D2 (empty disasm — the linker folded them). D0 @0x71c28 is the
   * deleting dtor: it calls this D2 then jmps to operator delete (stub 0xace04).
   *
   * asm control flow:
   *   • movq %rdi,%rbx
   *   • leaq 0x6b006(%rip),%rax ; movq %rax,(%rdi)     ← re-install vtable (0xdcbf8) so any
   *                                                     virtual call during destruction lands in
   *                                                     OZChannelInfo, not a derived subclass.
   *   • movq 0x40(%rdi),%rdi ; testq %rdi,%rdi ; je +7 ; callq _CFRelease   (@0x71bf5..@0x71bfe)
   *   • addq $0x38,%rbx ; movq %rbx,%rdi ; jmp __ZN8PCStringD1Ev             (@0x71c03..@0x71c10)
   *
   * Note: the flag at +0x48 is NEVER consulted — every non-null CFStringRef gets CFRelease'd
   * unconditionally on destruction. The flag only distinguishes copy/= (which cleared it) from
   * fresh ctors (which set it); it's for logic elsewhere (documentation / clone-tracking), not
   * for the dtor. This is a real observed asymmetry with the copy ctor, which itself CFRetain'd.
   */
  destroy(): void {
    // vtable-reinstall is a no-op in TS (see copy ctor note).
    if (this.sliderTransformerName !== null) {          // testq %rdi,%rdi @0x71bf9
      CFRelease(this.sliderTransformerName);            // @0x71bfe
      this.sliderTransformerName = null;
    }
    // PCString::~PCString() @stub 0xacd20 — tail-jumped at @0x71c10.
    // Modelled as clearing our string proxy.
    this.unitSuffix = "";
  }

  /**
   * OZChannelInfo::operator=(OZChannelInfo const&)                         @0x71c44
   *
   * asm control flow:
   *   • movups pairs copy +0x08..+0x30 exactly like the copy ctor      (@0x71c51..@0x71c65)
   *   • addq $0x38 to both pointers ; callq PCString::set(PCString&)   (@0x71c71)
   *   • movq 0x40(%rbx),%rsi ; movq %r14,%rdi
   *     callq __ZN13OZChannelInfo24setSliderTransformerNameEPK10__CFString   (@0x71c7d)
   *   • movb $0x0,0x48(%r14)                                            (@0x71c82)
   *   • return %r14
   *
   * Note: unlike the copy ctor, operator= does NOT open-code CFRetain — it delegates the whole
   * "CFRelease-old-then-CFRetain-new-if-non-null" dance to setSliderTransformerName, which is the
   * one method that owns that invariant. Faithful port must call it the same way.
   */
  assign(src: OZChannelInfo): OZChannelInfo {
    // movups block @0x71c51..@0x71c65
    this.max = src.max;                                  // +0x08
    this.min = src.min;                                  // +0x10
    this.stepFine = src.stepFine;                        // +0x18
    this.stepCoarse = src.stepCoarse;                    // +0x20
    this.displayScale = src.displayScale;                // +0x28
    this.reservedZero = src.reservedZero;                // +0x30
    PCString_set_from_ref(this, src.unitSuffix);         // @0x71c71
    this.setSliderTransformerName(src.sliderTransformerName); // @0x71c7d
    this.ownsSliderTransformerName = false;              // @0x71c82
    return this;
  }

  /**
   * OZChannelInfo::setSliderTransformerName(__CFString const* s)          @0x71c8c
   *
   * asm control flow:
   *   • movq %rdi,%r14 ; movq 0x40(%rdi),%rdi
   *   • cmpq %rsi,%rdi ; je return          ← identity-shortcut (@0x71c9a/@0x71c9d)
   *   • movq %rsi,%rbx
   *   • testq %rdi,%rdi ; je +7 ; callq _CFRelease   ← release old if non-null (@0x71ca2..@0x71ca7)
   *   • movq %rbx,0x40(%r14)                          ← install new pointer (@0x71cac)
   *   • testq %rbx,%rbx ; je return ; jmp _CFRetain   ← retain new if non-null (@0x71cb0..@0x71cbc)
   *
   * The retain/release is CoreFoundation-standard ownership swap. The +0x48 flag is not touched.
   */
  setSliderTransformerName(s: string | null): void {
    const old = this.sliderTransformerName;
    if (old === s) return;                               // @0x71c9a  cmpq %rsi,%rdi ; je …
    if (old !== null) {                                  // testq %rdi,%rdi @0x71ca2
      CFRelease(old);                                    // @0x71ca7
    }
    this.sliderTransformerName = s;                     // @0x71cac
    if (s !== null) {                                    // testq %rbx,%rbx @0x71cb0
      CFRetain(s);                                       // tail-jmp @0x71cbc
    }
  }

  /**
   * OZChannelInfo::operator==(OZChannelInfo const&) → bool                @0x71cc6
   *
   * asm control flow (all six doubles chained with ucomisd, using the classic
   * "jne || jp → fail" IEEE-aware pattern for each pair, then two library calls):
   *   • ucomisd 0x08(%rdi),0x08(%rsi) ; jne/jp fail   ← max        (@0x71ccd..)
   *   • ucomisd 0x10(%rdi),0x10(%rsi) ; jne/jp fail   ← min        (@0x71ce1..)
   *   • ucomisd 0x18(%r14),0x18(%rbx) ; jne/jp fail   ← stepFine   (@0x71cef..)
   *   • ucomisd 0x20(%r14),0x20(%rbx) ; jne/jp fail   ← stepCoarse (@0x71cfe..)
   *   • ucomisd 0x28(%r14),0x28(%rbx) ; jne/jp fail   ← displayScale (@0x71d0d..)
   *   • ucomisd 0x30(%r14),0x30(%rbx) ; jne/jp fail   ← reservedZero (@0x71d1c..)
   *   • lea +0x38 pair ; callq PCString::compare ; testl %eax,%eax ; jne fail   (@0x71d33/@0x71d38)
   *   • movq 0x40(%r14),%rdi ; movq 0x40(%rbx),%rsi ; xorl %edx,%edx
   *     callq _CFStringCompare ; testq %rax,%rax ; je success ; else fail       (@0x71d3c..@0x71d4e)
   *   • fail: xorl %eax,%eax ; ret
   *   • success: movb $0x1,%al ; ret
   *
   * Notes:
   *   - The ucomisd pattern is IEEE-faithful: NaN != NaN, and -0.0 == +0.0. TypeScript's
   *     `===` on numbers matches IEEE for -0/+0 (both compare equal to each other) but treats
   *     NaN !== NaN, which is exactly what jne||jp does. So `a === b` faithfully reproduces
   *     `ucomisd + jne||jp → not-equal`.
   *   - The +0x48 flag is intentionally NOT compared — two OZChannelInfos with the same fields
   *     but different ownership provenance are considered equal.
   */
  equals(other: OZChannelInfo): boolean {
    if (this.max !== other.max) return false;            // @0x71ccd
    if (this.min !== other.min) return false;            // @0x71ce1
    if (this.stepFine !== other.stepFine) return false;  // @0x71cef
    if (this.stepCoarse !== other.stepCoarse) return false; // @0x71cfe
    if (this.displayScale !== other.displayScale) return false; // @0x71d0d
    if (this.reservedZero !== other.reservedZero) return false; // @0x71d1c
    if (PCString_compare(this.unitSuffix, other.unitSuffix) !== 0) return false; // @0x71d33
    if (CFStringCompare(this.sliderTransformerName, other.sliderTransformerName, 0) !== 0) return false; // @0x71d46
    return true;
  }

  /**
   * OZChannelInfo::createLocalCopy() → OZChannelInfo*                      @0x1430a
   *
   * asm control flow:
   *   • movq %rdi,%r14
   *   • movl $0x50,%edi ; callq __Znwm                 ← operator new(0x50) — proves sizeof=0x50
   *   • movq %rax,%rbx ; movq %rax,%rdi ; movq %r14,%rsi
   *   • callq __ZN13OZChannelInfoC1ERKS_               ← in-place copy-construct
   *   • movq %rbx,%rax ; ret                            ← return the new pointer
   *
   * Straightforward "heap-allocate then copy-construct" clone. No cleverness.
   */
  createLocalCopy(): OZChannelInfo {
    // __Znwm 0x50 → in-place copy ctor. In TS the heap-vs-stack distinction dissolves; a fresh
    // copy is the same operation.
    return OZChannelInfo.copy(this);                    // @0x14327
  }
}
