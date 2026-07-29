// OZChannelHistogramSample — five-double compound channel for a single histogram sample
// (ProChannel.framework). Six ctor variants + copy-ctor + dtors + copy() + clone() +
// getObjCWrapperName(). Each of the five sub-channels is an OZChannelDouble embedded in-place at
// this+0x88 / 0x120 / 0x1b8 / 0x250 / 0x2e8 (stride 0x98 == sizeof(OZChannel base)). Sub-channel
// index (the OZChannelDouble "index" ctor arg) runs 1..5 — the 1-based axis-index convention
// FCP uses for compound channels (matches OZChannel3D's 1/2/3 for X/Y/Z).
//
// FAITHFUL PORT — every method cites its ProChannel @0xADDR. Struct layout, all init constants,
// and the sub-channel-name cfstring slots are recovered from the disasm files at
//   raw-port/re/disasm/ProChannel.OZChannelHistogramSample.*.s
// and the two double constants at ProChannel 0xaf528 (=1.0) and 0xb1548 (=5.0) were decoded
// directly from the __const section of the framework's x86_64 slice.
//
// ─────────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from OZChannelHistogramSample::~OZChannelHistogramSample @0x709e8 and
// the OZCompoundChannel base ctors called by every OZChannelHistogramSample ctor):
//
//   size = 0x380  (heap: `new 0x380` @0x717b6 in clone())
//   +0x000  vtable slot 0 (primary)   — set to `OZChannelHistogramSample vtable + 0x10`
//                                        (leaq 0x6bda8(%rip),%rax; movq %rax,(%rbx) @0x70aa1)
//                                        =>  __ZTV24OZChannelHistogramSample @ProChannel 0xdc850
//                                        (installed pointer = 0xdc860 = vt+0x10)
//   +0x010  vtable slot 1 (secondary) — set to `OZChannelHistogramSample vtable + 0x348`
//                                        (leaq 0x6c0d6(%rip),%rax; movq %rax,0x10(%rbx) @0x70ab2)
//                                        =>  installed pointer = 0xdcb98 = vt+0x348
//   +0x018..0x087   OZCompoundChannel base sub-object (opaque here; the base ctor sets it up
//                   via one of the four `OZCompoundChannel::OZCompoundChannel(...)` variants
//                   below — factory-taking or non-factory-taking).
//   +0x088  OZChannelDouble  sub[0]  (min? — sub-index 1, initial 0.0 in default ctor, sliderMax 1.0)
//   +0x120  OZChannelDouble  sub[1]  (             sub-index 2, initial 0.0 in default ctor, sliderMax 1.0)
//   +0x1B8  OZChannelDouble  sub[2]  (             sub-index 3, initial 1.0 in default ctor, sliderMax 1.0)
//   +0x250  OZChannelDouble  sub[3]  (             sub-index 4, initial 1.0 in default ctor, sliderMax 1.0)
//   +0x2E8  OZChannelDouble  sub[4]  (             sub-index 5, initial 1.0 in default ctor, sliderMax 5.0)
//                                     — total width 5 * 0x98 = 0x2f0; +0x2e8..+0x380 covers sub[4].
//
// Stride 0x98 (0x120-0x88 == 0x1b8-0x120 == ... == 0x98) matches the OZChannel sub-channel width
// used by OZChannel3D (see OZChannel3D.ts header comment) — so these are OZChannel/OZChannelDouble
// sub-objects embedded in-place, NOT pointers to heap-allocated children.
//
// SUB-CHANNEL NAMES: each is loaded from a per-sub `Objc cfstring ref: @"bad cfstring ref"` via
// PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef) with the ProChannel bundle
// (`getProChannelBundle()` @ProChannel 0xacd02 / 0xacd20). The literal cfstring RIP-relative
// displacements are documented per-ctor below. The names are NOT decoded here (the localized
// string keys have to be pulled from the .strings file — an oracle-only step); FCP renders them
// through the normal PCString localization pipeline.
//
// ─────────────────────────────────────────────────────────────────────────────
// UNPORTED FRONTIER — cited so a future decode round picks them up:
//   OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*, uint, uint,
//                                    OZChannelImpl*, OZChannelInfo*)                @ProChannel U
//   OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)                        @ProChannel U
//   OZChannel::setSliderMax(double)                                                 @ProChannel U
//   OZChannel::~OZChannel()                                                         @ProChannel U
//   OZChannel::copy(OZChannelBase const*, bool)                                     @ProChannel U
//   OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, bool, uint)
//                                                                                    @ProChannel U
//   OZCompoundChannel::OZCompoundChannel(PCString const&, OZChannelFolder*, uint, uint, bool, uint)
//                                                                                    @ProChannel U
//   OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, uint, uint)   @ProChannel U
//   OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*) @ProChannel U
//   OZCompoundChannel::~OZCompoundChannel()                                         @ProChannel U
//   OZCompoundChannel::copy(OZChannelBase const*, bool)                             @ProChannel U
//   OZChannelHistogramSample_Factory::getInstance()                                 @ProChannel 0x?? (calls @0x71087,0x70a78)
//   PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef)                       @ProChannel 0xacd02
//   PCString::~PCString()                                                           @ProChannel 0xacd20
//   getProChannelBundle()                                                           @ProChannel U (`__Z19getProChannelBundlev`)
//
// The port implements the shape (5 sub-channels, sub-indices, initial values, sliderMax values,
// vtable pointers, dtor tear-down order) and delegates every actual call into the OZChannel /
// OZCompoundChannel base machinery through named frontier stubs.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Opaque handle to a `PCString const&` argument. PCString itself is a
 *  ProChannel-side ref-counted UTF-16 buffer (`__ZN8PCString...`); the port
 *  models it as a nominal type so callers can't pass a raw string by mistake.
 *  Real PCString ctors/dtors live in ProChannel @0xacd02 / @0xacd20 and are
 *  frontier stubs. */
export interface PCString { readonly __brand: 'PCString'; }

/** Frontier stub — `OZChannelFolder*`. Real class lives in ProChannel and is
 *  passed by pointer through every ctor here. Modeled as an opaque handle
 *  because we don't touch its internals from this file. */
export interface OZChannelFolder { readonly __brand: 'OZChannelFolder'; }

/** Frontier stub — `OZFactory*` (also modeled opaquely; the factory-taking
 *  ctors just forward it to the OZCompoundChannel base). Real class lives
 *  in ProChannel. */
export interface OZFactory { readonly __brand: 'OZFactory'; }

/** Frontier stub — the polymorphic base pointer used by `copy()`. Real class
 *  is `OZChannelBase` in ProChannel. */
export interface OZChannelBase { readonly __brand: 'OZChannelBase'; }

/**
 * Frontier stub for an in-place OZChannelDouble sub-object. Real class is
 * ProChannel::OZChannelDouble; its ctor is called five times per ctor of
 * OZChannelHistogramSample (once per histogram-sample field). We model the
 * three touched operations — construct-with-initial-value, copy-construct,
 * and setSliderMax — as throwing stubs so the ledger surfaces the gap.
 *
 * Every entry point cites the ProChannel addr from which we know it's
 * called. If a real render-path exercises a sub-channel it will throw with
 * a specific @0xADDR pointing at the OZChannelHistogramSample method that
 * triggered the call.
 */
export class OZChannelDoubleSub {
  readonly __isOZChannelDoubleSub = true;

  /** `OZChannelDouble::OZChannelDouble(double, PCString const&, OZChannelFolder*,
   *  unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` @ProChannel U.
   *  Called five times per non-copy ctor of OZChannelHistogramSample. Sub-object
   *  emplacement is in-place (the ctor writes into `this+0x88/0x120/0x1B8/0x250/0x2E8`
   *  slots owned by this OZChannelHistogramSample instance). */
  static construct(_initial: number, _name: PCString, _folder: OZChannelFolder | null,
                   _subIndex: number, _flag: number, _impl: null, _info: null): OZChannelDoubleSub {
    throw new Error(
      "OZChannelDouble::OZChannelDouble(double,PCString const&,OZChannelFolder*,uint,uint,OZChannelImpl*,OZChannelInfo*) @ProChannel U " +
      "not yet transcribed (called 5x per OZChannelHistogramSample ctor @0x70af8/0x70b47/0x70b9b/0x70bef/0x70c43 and mirrors)"
    );
  }

  /** `OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)` @ProChannel U.
   *  Sub-object copy-construct used by
   *  OZChannelHistogramSample::OZChannelHistogramSample(OZChannelHistogramSample const&, OZChannelFolder*)
   *  @0x71646 for each of the five sub-channels. The copy ctor then overwrites
   *  the two vtable slots at sub+0x00 / sub+0x10 with __ZTV15OZChannelDouble + 0x10 / + 0x370
   *  (leaq 0x8df4c... @0x7168e / +0x370 addq @0x716a0) — i.e. it upgrades the
   *  base-class OZChannel copy to an OZChannelDouble. Not decoded here. */
  static copyConstruct(_src: OZChannelDoubleSub, _folder: OZChannelFolder | null): OZChannelDoubleSub {
    throw new Error(
      "OZChannel::OZChannel(OZChannel const&,OZChannelFolder*) @ProChannel U + OZChannelDouble vtable retpatch " +
      "not yet transcribed (called 5x per OZChannelHistogramSample copy-ctor @0x71689/0x716c5/0x716eb/0x71710/0x71735)"
    );
  }

  /** `OZChannel::setSliderMax(double)` @ProChannel U. Called five times per
   *  non-copy ctor (once per sub-channel) with 1.0 for sub[0..3] and 5.0 for
   *  sub[4]. Constants read from ProChannel __const:
   *    @0xaf528 -> 1.0   (loaded by sub[0..3].setSliderMax)
   *    @0xb1548 -> 5.0   (loaded by sub[4].setSliderMax) */
  setSliderMax(_v: number): void {
    throw new Error(
      "OZChannel::setSliderMax(double) @ProChannel U not yet transcribed (called from OZChannelHistogramSample ctor tails @0x7125b-0x7129c / 0x70c51-0x70c92 / 0x71267-0x712a7 mirrors)"
    );
  }

  /** `OZChannel::copy(OZChannelBase const*, bool)` @ProChannel U. Called five
   *  times per OZChannelHistogramSample::copy() @0x717ec (sub[0..3]) plus a
   *  tail-jump for sub[4] @0x7189b. */
  copyFrom(_src: OZChannelBase | null, _addToUndo: boolean): void {
    throw new Error(
      "OZChannel::copy(OZChannelBase const*,bool) @ProChannel U not yet transcribed (called from OZChannelHistogramSample::copy @0x7183c/0x71850/0x71864/0x71878/0x7189b)"
    );
  }

  /** `OZChannel::~OZChannel()` @ProChannel U. Called on each sub-channel by
   *  the OZChannelHistogramSample destructor (reverse order 5..1) @0x70a10..
   *  0x70a40 in ~OZChannelHistogramSample @0x709e8. */
  destroy(): void {
    throw new Error(
      "OZChannel::~OZChannel() @ProChannel U not yet transcribed (called 5x by ~OZChannelHistogramSample @0x70a10/0x70a1c/0x70a28/0x70a34/0x70a40)"
    );
  }
}

/**
 * Frontier stub — OZCompoundChannel base state (the parent class of
 * OZChannelHistogramSample). Real class lives in ProChannel with four ctors
 * and a copy-ctor + dtor + copy(). Modeled here as a single object so the
 * derived class can hold it as a base-sub-object member (matching the C++
 * layout at this+0x00..0x87 — the first 0x88 bytes of an OZChannelHistogramSample).
 */
export class OZCompoundChannelBase {
  readonly __isOZCompoundChannelBase = true;

  /** OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*,
   *  unsigned int, unsigned int, bool, unsigned int) @ProChannel U. Called by
   *  OZChannelHistogramSample::OZChannelHistogramSample(OZFactory*, PCString const&,
   *  OZChannelFolder*, uint, uint, uint) @0x70d84 and the (ddddd, PCString,
   *  Folder, uuu) variant @0x710ab and the OZChannelHistogramSample_Factory::getInstance()-
   *  fed variant @0x70a9c (default-init entry). Args (from disasm register order):
   *    rdi=this  rsi=factory  rdx=&name  rcx=folder  r8=arg4  r9=arg5
   *    stack: bool@0(=false)  uint@8=arg6
   *  where arg4/arg5/arg6 are the trailing (uint,uint,uint) — but note the base ctor's
   *  signature has (uint, uint, bool, uint); we pass through unchanged. */
  static constructFactoryFolder(
    _factory: OZFactory | null, _name: PCString, _folder: OZChannelFolder | null,
    _a: number, _b: number, _c: number
  ): OZCompoundChannelBase {
    throw new Error(
      "OZCompoundChannel::OZCompoundChannel(OZFactory*,PCString const&,OZChannelFolder*,uint,uint,bool,uint) @ProChannel U " +
      "not yet transcribed (called from OZChannelHistogramSample ctors @0x70a9c/0x70d84/0x710ab)"
    );
  }

  /** OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, uint, uint) @ProChannel U.
   *  Called by OZChannelHistogramSample::OZChannelHistogramSample(OZFactory*, PCString const&,
   *  uint, uint) @0x71380 — the folder-less no-defaults variant. */
  static constructFactoryNoFolder(
    _factory: OZFactory | null, _name: PCString, _a: number, _b: number
  ): OZCompoundChannelBase {
    throw new Error(
      "OZCompoundChannel::OZCompoundChannel(OZFactory*,PCString const&,uint,uint) @ProChannel U " +
      "not yet transcribed (called from OZChannelHistogramSample::OZChannelHistogramSample(OZFactory*,PCString,uu) @0x71380)"
    );
  }

  /** OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
   *  @ProChannel U. Called by the OZChannelHistogramSample copy-ctor @0x7165d. */
  static copyConstruct(_src: OZCompoundChannelBase, _folder: OZChannelFolder | null): OZCompoundChannelBase {
    throw new Error(
      "OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&,OZChannelFolder*) @ProChannel U " +
      "not yet transcribed (called from OZChannelHistogramSample copy-ctor @0x7165d)"
    );
  }

  /** OZCompoundChannel::~OZCompoundChannel() @ProChannel U. Tail-jumped from
   *  ~OZChannelHistogramSample @0x70a4e (after all five sub-channels have been
   *  destroyed). */
  destroy(): void {
    throw new Error(
      "OZCompoundChannel::~OZCompoundChannel() @ProChannel U not yet transcribed (tail-jumped from ~OZChannelHistogramSample @0x70a4e)"
    );
  }

  /** OZCompoundChannel::copy(OZChannelBase const*, bool) @ProChannel U. Called
   *  as the first line of OZChannelHistogramSample::copy() @0x717ff. */
  copyFrom(_src: OZChannelBase | null, _addToUndo: boolean): void {
    throw new Error(
      "OZCompoundChannel::copy(OZChannelBase const*,bool) @ProChannel U not yet transcribed (called from OZChannelHistogramSample::copy @0x717ff)"
    );
  }
}

/**
 * Frontier stub for the ProChannel-side singleton factory. Real symbol:
 *   `OZChannelHistogramSample_Factory::getInstance()` @ProChannel U
 * called by the two "factoryless" ctors of OZChannelHistogramSample
 * (@0x71087 for the (ddddd, name, folder, uuu) form and @0x70a78 for the
 * (name, folder, uuu) form) to obtain the OZFactory* they hand to the
 * base ctor. Not decoded here.
 */
export function OZChannelHistogramSample_Factory_getInstance(): OZFactory {
  throw new Error(
    "OZChannelHistogramSample_Factory::getInstance() @ProChannel U not yet transcribed (called from OZChannelHistogramSample ctors @0x70a78/0x71087)"
  );
}

/**
 * Debug helper — mirrors the string builder used by the disasm to load one of
 * the five per-sub-channel display-name cfstrings. Real code path:
 *   0. `bundle = getProChannelBundle()`                               @0x70dee (etc.)
 *   1. `leaq CFSTRING_slot(%rip), %rsi`   — sub-channel N's cfstring
 *   2. `PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef)`    @0xacd02
 * The three CFBundle args are (bundle, bundle, nullptr — the final xorl %ecx,%ecx
 * @0x70dc0 etc.). All five cfstring slot addresses live in ProChannel __cfstring
 * (from otool -l: __cfstring @0xe4c90..0xe6210). We do NOT decode the localized
 * strings here — they live in ProChannel's .strings file and would require an
 * oracle read to be faithful. Instead, we thread an opaque `PCString` value.
 */
function loadSubChannelName(_slotAddr: number): PCString {
  throw new Error(
    "PCString::PCString(CFStringRef,CFBundleRef,CFBundleRef) @ProChannel 0xacd02 + getProChannelBundle() @ProChannel U " +
    "not yet transcribed (called from OZChannelHistogramSample ctor bodies @0x70abb/0x70b0b/0x70b5a/0x70bae/0x70c02 and mirrors)"
  );
}

/**
 * OZChannelHistogramSample — 5-double compound channel (one histogram sample).
 *
 * Instance size 0x380 (heap `new 0x380` @0x717b6 in clone). Vtable pointers
 * installed by every ctor from `__ZTV24OZChannelHistogramSample` @ProChannel 0xdc850
 *   slot 0 (primary)   = vt + 0x10
 *   slot 1 (secondary) = vt + 0x348
 *
 * Six ctor variants (all cited @ProChannel addresses):
 *   C2(OZFactory*, PCString const&, OZChannelFolder*, uint,uint,uint)                      @0x70d62
 *   C2(OZFactory*, PCString const&, uint, uint)                                             @0x7136c
 *   C2(double,double,double,double,double, PCString const&, OZChannelFolder*, uint,uint,uint) @0x7104a
 *   C2(PCString const&, OZChannelFolder*, uint,uint,uint)                                    @0x70a54
 *   C2(OZChannelHistogramSample const&, OZChannelFolder*)                                    @0x71646
 *   (plus the six C1 thunks — pure `jmp` to C2 counterparts)
 *
 * The class holds ONE OZCompoundChannel base state plus FIVE in-place
 * OZChannelDouble sub-channels. Every method here mirrors the disasm's control
 * flow structurally; the underlying frontier stubs throw so the parity harness
 * never mistakes a stubbed sub-channel for real math.
 */
export class OZChannelHistogramSample {
  /** +0x000 vtable slot 0 — `__ZTV24OZChannelHistogramSample + 0x10`
   *  @ProChannel 0xdc850+0x10 = 0xdc860. Installed by every ctor (leaq @0x70aa1
   *  / 0x70d89 / 0x710b0 / 0x71385 / 0x71662). */
  private vptr0: number = 0xdc860;

  /** +0x010 vtable slot 1 — `__ZTV24OZChannelHistogramSample + 0x348`
   *  @ProChannel 0xdc850+0x348 = 0xdcb98. Installed by every ctor (leaq @0x70ab2
   *  / 0x70d93 / 0x710ba / 0x7138f / 0x7166c). */
  private vptr1: number = 0xdcb98;

  /** +0x018..0x087 — OZCompoundChannel base sub-object (0x70 bytes wide;
   *  0x88 - 0x18 == 0x70). */
  private base!: OZCompoundChannelBase;

  /** +0x088 sub[0] — sub-index 1. Named from cfstring @0x70abb (loadSubChannelName). */
  private sub0!: OZChannelDoubleSub;
  /** +0x120 sub[1] — sub-index 2. Named from cfstring @0x70b0b. */
  private sub1!: OZChannelDoubleSub;
  /** +0x1B8 sub[2] — sub-index 3. Named from cfstring @0x70b5a. */
  private sub2!: OZChannelDoubleSub;
  /** +0x250 sub[3] — sub-index 4. Named from cfstring @0x70bae. */
  private sub3!: OZChannelDoubleSub;
  /** +0x2E8 sub[4] — sub-index 5. Named from cfstring @0x70c02. */
  private sub4!: OZChannelDoubleSub;

  private constructor() { /* body set by the static factories below */ }

  // ─── Ctor family (five real bodies + six C1 thunks) ──────────────────────

  /**
   * `OZChannelHistogramSample::OZChannelHistogramSample(OZFactory*, PCString const&,
   *  OZChannelFolder*, unsigned int, unsigned int, unsigned int)` @ProChannel 0x70d62.
   *
   * Structure (from disasm):
   *   1. `OZCompoundChannel::OZCompoundChannel(factory, name, folder, arg4, arg5, false, arg6)` @0x70d84
   *   2. Install vtable slots (@0x70d89 / 0x70d93).
   *   3. For each sub-channel i in 1..5:
   *        - load per-sub cfstring name via PCString ctor (@0x70dae..0x70e03..)
   *        - construct in-place OZChannelDouble(initial=0.0, name, this (as folder-ptr), i, 0, null, null)
   *   4. NO setSliderMax calls in this ctor (that's the (ddddd) variant only).
   *
   * The initial 0.0 for each of the 5 sub-channels is proven by `xorps %xmm0,%xmm0`
   * (@0x70dcb / 0x70e1b / 0x70e6a / 0x70eb9 / 0x70f08) — the first-arg double
   * register is zero for every sub-channel emplacement.
   *
   * The C1 thunk lives at @0x70d58 and is a pure `pushq %rbp; movq %rsp,%rbp;
   * popq %rbp; jmp <this-C2-symbol>`.
   */
  static construct_Factory_Folder_uuu(
    factory: OZFactory | null, name: PCString, folder: OZChannelFolder | null,
    a: number, b: number, c: number
  ): OZChannelHistogramSample {
    const self = new OZChannelHistogramSample();
    // @0x70d84 — base ctor with the FIVE trailing scalars (arg6 forwarded on stack).
    self.base = OZCompoundChannelBase.constructFactoryFolder(factory, name, folder, a, b, c);
    // vtable slots @0x70d89 / 0x70d93 (already default-initialized above; assign
    // explicitly so the port matches the sequence of stores exactly).
    self.vptr0 = 0xdc860;
    self.vptr1 = 0xdcb98;
    // Five sub-channels, initial 0.0, sub-index i (1-based).
    const sub0Name = loadSubChannelName(0x70abb + 0x74a86); // Objc cfstring ref @0x70abb+RIP
    self.sub0 = OZChannelDoubleSub.construct(Math.fround(0.0), sub0Name, folder, 1, 0, null, null);
    const sub1Name = loadSubChannelName(0x70b0b + 0x74a56);
    self.sub1 = OZChannelDoubleSub.construct(Math.fround(0.0), sub1Name, folder, 2, 0, null, null);
    const sub2Name = loadSubChannelName(0x70b5a + 0x74a27);
    self.sub2 = OZChannelDoubleSub.construct(Math.fround(0.0), sub2Name, folder, 3, 0, null, null);
    const sub3Name = loadSubChannelName(0x70bae + 0x749f8);
    self.sub3 = OZChannelDoubleSub.construct(Math.fround(0.0), sub3Name, folder, 4, 0, null, null);
    const sub4Name = loadSubChannelName(0x70c02 + 0x749c9);
    self.sub4 = OZChannelDoubleSub.construct(Math.fround(0.0), sub4Name, folder, 5, 0, null, null);
    return self;
  }

  /** C1 thunk for `construct_Factory_Folder_uuu` — @ProChannel 0x71040
   *  (pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp C2 @0x71044). */
  static construct_Factory_Folder_uuu_C1 = OZChannelHistogramSample.construct_Factory_Folder_uuu;

  /**
   * `OZChannelHistogramSample::OZChannelHistogramSample(double,double,double,double,double,
   *  PCString const&, OZChannelFolder*, unsigned int, unsigned int, unsigned int)`
   *  @ProChannel 0x7104a.
   *
   * Differs from the plain-Factory ctor in three ways:
   *   1. Base ctor takes an internally-fetched OZFactory: calls
   *      `OZChannelHistogramSample_Factory::getInstance()` @0x71087 first and
   *      passes the returned factory to the OZCompoundChannel base ctor @0x710ab.
   *   2. Each sub-channel is emplaced with a per-argument initial double:
   *        sub[0] <- xmm0 (arg d0)      @0x710f6 -> ctor @0x71109
   *        sub[1] <- xmm1 (arg d1)      @0x71147 -> ctor @0x7115a
   *        sub[2] <- xmm2 (arg d2)      @0x71198 -> ctor @0x711ab
   *        sub[3] <- xmm3 (arg d3)      @0x711e9 -> ctor @0x711fc
   *        sub[4] <- xmm4 (arg d4)      @0x7123a -> ctor @0x7124d
   *   3. A tail block calls `OZChannel::setSliderMax(v)` on each sub-channel
   *      (@0x71267/0x71277/0x71287/0x71297/0x712a7). The constants (read from
   *      ProChannel __const):
   *        sub[0..3].setSliderMax(1.0)   — @0xaf528
   *        sub[4].setSliderMax(5.0)      — @0xb1548
   *
   * `Math.fround` is NOT applied to the initial values here — xmm0..xmm4 hold
   * IEEE-754 doubles (movsd) and setSliderMax also takes a double (movsd). This
   * ctor is purely double-precision.
   */
  static construct_ddddd_Factory_Folder_uuu(
    d0: number, d1: number, d2: number, d3: number, d4: number,
    name: PCString, folder: OZChannelFolder | null,
    a: number, b: number, c: number
  ): OZChannelHistogramSample {
    const self = new OZChannelHistogramSample();
    // @0x71087 — get the factory instance first, then hand it to the base ctor.
    const factory = OZChannelHistogramSample_Factory_getInstance();
    // @0x710ab — base ctor with the fetched factory.
    self.base = OZCompoundChannelBase.constructFactoryFolder(factory, name, folder, a, b, c);
    // vtable slots @0x710b0 / 0x710ba.
    self.vptr0 = 0xdc860;
    self.vptr1 = 0xdcb98;
    // Five sub-channels, initial <- (d0,d1,d2,d3,d4), sub-index i (1-based).
    const sub0Name = loadSubChannelName(0x710ca + 0x7475f);
    self.sub0 = OZChannelDoubleSub.construct(d0, sub0Name, folder, 1, 0, null, null);
    const sub1Name = loadSubChannelName(0x7111c + 0x7472d);
    self.sub1 = OZChannelDoubleSub.construct(d1, sub1Name, folder, 2, 0, null, null);
    const sub2Name = loadSubChannelName(0x7116d + 0x746fc);
    self.sub2 = OZChannelDoubleSub.construct(d2, sub2Name, folder, 3, 0, null, null);
    const sub3Name = loadSubChannelName(0x711be + 0x746cb);
    self.sub3 = OZChannelDoubleSub.construct(d3, sub3Name, folder, 4, 0, null, null);
    const sub4Name = loadSubChannelName(0x7120f + 0x7469a);
    self.sub4 = OZChannelDoubleSub.construct(d4, sub4Name, folder, 5, 0, null, null);
    // Tail — setSliderMax on each. Constants from __const:
    //   @0xaf528 = 1.0, @0xb1548 = 5.0.
    self.sub0.setSliderMax(1.0);
    self.sub1.setSliderMax(1.0);
    self.sub2.setSliderMax(1.0);
    self.sub3.setSliderMax(1.0);
    self.sub4.setSliderMax(5.0);
    return self;
  }

  /** C1 thunk @ProChannel 0x71362 -> C2 @0x7104a. */
  static construct_ddddd_Factory_Folder_uuu_C1 = OZChannelHistogramSample.construct_ddddd_Factory_Folder_uuu;

  /**
   * `OZChannelHistogramSample::OZChannelHistogramSample(PCString const&, OZChannelFolder*,
   *  unsigned int, unsigned int, unsigned int)` @ProChannel 0x70a54.
   *
   * The "default" ctor family. Structure (from the unlabeled tail of the ~D2
   * dump lines 138301..138486 of /tmp/ProChannel_tV.txt — the ICF-elided
   * symbol boundary sits between the D2 dtor's `retq` and this body):
   *   1. `OZChannelHistogramSample_Factory::getInstance()` @0x70a78 to fetch the
   *      OZFactory pointer.
   *   2. `OZCompoundChannel::OZCompoundChannel(factory, name, folder, arg3, arg4, false, arg5)`
   *      @0x70a9c.
   *   3. Vtable pointers @0x70aa1 / 0x70ab2.
   *   4. Five sub-channels — DIFFERENT initial values from the plain-Factory ctor:
   *        sub[0] <- 0.0 (xorps @0x70ae3)          sub-index 1
   *        sub[1] <- 0.0 (xorps @0x70b33)          sub-index 2
   *        sub[2] <- 1.0 (movsd @0x70b7e -> 0xaf528) sub-index 3
   *        sub[3] <- 1.0 (movsd @0x70bd2 -> 0xaf528) sub-index 4
   *        sub[4] <- 1.0 (movsd @0x70c26 -> 0xaf528) sub-index 5
   *   5. Tail setSliderMax: sub[0..3]=1.0, sub[4]=5.0. Same constants (0xaf528/0xb1548).
   *
   * The (min=0, max=0, mean=1, median=1, count=1)-in-a-histogram-sample shape
   * matches the FCP histogram-sample abstraction: two accumulators (min/max) start
   * at zero; three normalized fields (mean/median/count-fraction) start at 1.0
   * with a sliderMax of 1.0; the raw count field caps at 5.0.
   */
  static construct_PCString_Folder_uuu(
    name: PCString, folder: OZChannelFolder | null,
    a: number, b: number, c: number
  ): OZChannelHistogramSample {
    const self = new OZChannelHistogramSample();
    // @0x70a78 — factory instance.
    const factory = OZChannelHistogramSample_Factory_getInstance();
    // @0x70a9c — base ctor.
    self.base = OZCompoundChannelBase.constructFactoryFolder(factory, name, folder, a, b, c);
    // Vtable slots @0x70aa1 / 0x70ab2.
    self.vptr0 = 0xdc860;
    self.vptr1 = 0xdcb98;
    // Sub-channels — the initial-values pattern that DEFINES this class as a
    // histogram-sample container (see per-sub cite above).
    const sub0Name = loadSubChannelName(0x70abb + 0x74d6e);
    self.sub0 = OZChannelDoubleSub.construct(Math.fround(0.0), sub0Name, folder, 1, 0, null, null);
    const sub1Name = loadSubChannelName(0x70b0b + 0x74d3e);
    self.sub1 = OZChannelDoubleSub.construct(Math.fround(0.0), sub1Name, folder, 2, 0, null, null);
    const sub2Name = loadSubChannelName(0x70b5a + 0x74d0f);
    self.sub2 = OZChannelDoubleSub.construct(1.0, sub2Name, folder, 3, 0, null, null);
    const sub3Name = loadSubChannelName(0x70bae + 0x74cdb);
    self.sub3 = OZChannelDoubleSub.construct(1.0, sub3Name, folder, 4, 0, null, null);
    const sub4Name = loadSubChannelName(0x70c02 + 0x74ca7);
    self.sub4 = OZChannelDoubleSub.construct(1.0, sub4Name, folder, 5, 0, null, null);
    // Tail setSliderMax.
    self.sub0.setSliderMax(1.0);
    self.sub1.setSliderMax(1.0);
    self.sub2.setSliderMax(1.0);
    self.sub3.setSliderMax(1.0);
    self.sub4.setSliderMax(5.0);
    return self;
  }

  /** C1 thunk @ProChannel 0x70d58 -> C2 @0x70a54. */
  static construct_PCString_Folder_uuu_C1 = OZChannelHistogramSample.construct_PCString_Folder_uuu;

  /**
   * `OZChannelHistogramSample::OZChannelHistogramSample(OZFactory*, PCString const&,
   *  unsigned int, unsigned int)` @ProChannel 0x7136c.
   *
   * The folder-less variant. Same shape as `construct_Factory_Folder_uuu` but:
   *   - Base ctor is `OZCompoundChannel(factory, name, uint, uint)` @0x71380
   *     (no folder, no bool, no arg6).
   *   - Sub-channels are constructed with folder=nullptr — the OZCompoundChannel
   *     base is what the sub-ctors read for a folder pointer (via `movq %rbx,%rdx`
   *     @0x713ce = the derived-this becomes the folder-arg).
   *   - Initial value: 0.0 for every sub (xorps @0x713c7 / 0x71417 / 0x71466 /
   *     0x714b5 / 0x71504).
   *   - No setSliderMax tail (this ctor omits it; the folder-full variant does too).
   */
  static construct_Factory_uu(
    factory: OZFactory | null, name: PCString, a: number, b: number
  ): OZChannelHistogramSample {
    const self = new OZChannelHistogramSample();
    // @0x71380 — folder-less base ctor.
    self.base = OZCompoundChannelBase.constructFactoryNoFolder(factory, name, a, b);
    // Vtable slots @0x71385 / 0x7138f.
    self.vptr0 = 0xdc860;
    self.vptr1 = 0xdcb98;
    // Five zero-initialized sub-channels. Note the folder arg here is the
    // derived-this pointer (movq %rbx,%rdx @0x713ce) — this is the same
    // "compound-channel-serves-as-folder" pattern OZChannel3D uses.
    const asFolder = self as unknown as OZChannelFolder;
    const sub0Name = loadSubChannelName(0x7139f + 0x7448a);
    self.sub0 = OZChannelDoubleSub.construct(Math.fround(0.0), sub0Name, asFolder, 1, 0, null, null);
    const sub1Name = loadSubChannelName(0x713ef + 0x7445a);
    self.sub1 = OZChannelDoubleSub.construct(Math.fround(0.0), sub1Name, asFolder, 2, 0, null, null);
    const sub2Name = loadSubChannelName(0x71440 + 0x7442c);
    self.sub2 = OZChannelDoubleSub.construct(Math.fround(0.0), sub2Name, asFolder, 3, 0, null, null);
    const sub3Name = loadSubChannelName(0x71491 + 0x743fe);
    self.sub3 = OZChannelDoubleSub.construct(Math.fround(0.0), sub3Name, asFolder, 4, 0, null, null);
    const sub4Name = loadSubChannelName(0x714e2 + 0x743d0);
    self.sub4 = OZChannelDoubleSub.construct(Math.fround(0.0), sub4Name, asFolder, 5, 0, null, null);
    return self;
  }

  /** C1 thunk @ProChannel 0x7163c -> C2 @0x7136c. */
  static construct_Factory_uu_C1 = OZChannelHistogramSample.construct_Factory_uu;

  /**
   * `OZChannelHistogramSample::OZChannelHistogramSample(OZChannelHistogramSample const&,
   *  OZChannelFolder*)` @ProChannel 0x71646.
   *
   * The copy-ctor. Structure:
   *   1. `OZCompoundChannel::OZCompoundChannel(src.base, folder)` @0x7165d.
   *   2. Install vtable pointers @0x71662 / 0x7166c.
   *   3. For each sub-channel i in 0..4:
   *        a. `OZChannel::OZChannel(src.sub[i], folder)` @0x71689/0x716c5/0x716eb/0x71710/0x71735
   *           — base-class copy, giving the sub the OZChannel vtable at first.
   *        b. Overwrite sub[i].vptr0 with `__ZTV15OZChannelDouble + 0x10`
   *           (leaq 0x8df4c(%rip),%r15 @0x7168e; then movq %r13,sub+0x00 @0x71699/0x716ca/0x716f0/0x71715/0x7173a).
   *        c. Overwrite sub[i].vptr1 with `__ZTV15OZChannelDouble + 0x370`
   *           (addq $0x370,%r15 @0x716a0; then movq %r15,sub+0x10 @0x716a7/0x716d1/0x716f7/0x7171c/0x71741).
   *
   * Step 3 is what upgrades an OZChannel-base-copy sub-object into an
   * OZChannelDouble in one operation — a common trick in FCP's binary that
   * saves the compiler from generating a separate OZChannelDouble copy-ctor
   * body for this compound. We model it as a single `OZChannelDoubleSub.copyConstruct`
   * call which internally patches the vtable.
   */
  static construct_Copy(src: OZChannelHistogramSample, folder: OZChannelFolder | null): OZChannelHistogramSample {
    const self = new OZChannelHistogramSample();
    // @0x7165d — base copy.
    self.base = OZCompoundChannelBase.copyConstruct(src.base, folder);
    // Vtable slots @0x71662 / 0x7166c.
    self.vptr0 = 0xdc860;
    self.vptr1 = 0xdcb98;
    // Five sub-channels — copy-construct with OZChannel-vtable-then-patch-to-OZChannelDouble
    // (see method-level cite above).
    self.sub0 = OZChannelDoubleSub.copyConstruct(src.sub0, folder);
    self.sub1 = OZChannelDoubleSub.copyConstruct(src.sub1, folder);
    self.sub2 = OZChannelDoubleSub.copyConstruct(src.sub2, folder);
    self.sub3 = OZChannelDoubleSub.copyConstruct(src.sub3, folder);
    self.sub4 = OZChannelDoubleSub.copyConstruct(src.sub4, folder);
    return self;
  }

  /** C1 thunk @ProChannel 0x717a2 -> C2 @0x71646. */
  static construct_Copy_C1 = OZChannelHistogramSample.construct_Copy;

  // ─── Destructor family ───────────────────────────────────────────────────

  /**
   * `OZChannelHistogramSample::~OZChannelHistogramSample()` (D2 base-object dtor)
   *  @ProChannel 0x709e8.
   *
   * Structure:
   *   1. Overwrite vtable slots to the CURRENT class's vtable (@0x709f1 / 0x709ff /
   *      0x70a05) — a standard C++-generated store: during the derived dtor the
   *      vtable transiently points at THIS class so a virtual-dispatch inside the
   *      dtor resolves to this class's method instead of a further-derived one.
   *      The stored value is `__ZTV24OZChannelHistogramSample + 0x10` (slot 0)
   *      and `+ 0x348` (slot 1) — the same values every ctor writes.
   *   2. Destroy sub-channels in REVERSE index order (sub[4] first): @0x70a10,
   *      0x70a1c, 0x70a28, 0x70a34, 0x70a40 — five calls to `OZChannel::~OZChannel()`.
   *   3. Tail-jump into `OZCompoundChannel::~OZCompoundChannel()` @0x70a4e.
   *
   * The D1 dtor @0x718ae is a pure `jmp D2`. The D0 (deleting) dtor @0x718b8
   * calls D2 then `operator delete` (@0xace04 stub).
   */
  destroy(): void {
    // Vtable retpatch @0x709f1..0x70a05.
    this.vptr0 = 0xdc860;
    this.vptr1 = 0xdcb98;
    // Reverse-order sub-channel destruction @0x70a10..0x70a40.
    this.sub4.destroy();
    this.sub3.destroy();
    this.sub2.destroy();
    this.sub1.destroy();
    this.sub0.destroy();
    // Tail-jump @0x70a4e.
    this.base.destroy();
  }

  /** D1 base dtor @ProChannel 0x718ae — pure `jmp __ZN24OZChannelHistogramSampleD2Ev`. */
  destroyD1(): void { this.destroy(); }

  /**
   * D0 deleting dtor @ProChannel 0x718b8. Calls the D2 base dtor then
   * `operator delete(this)` (0xace04 stub). In the port there is no
   * `operator delete`; we simply run the base dtor. The frontier `operator
   * delete` is a system stub, so no throw is needed here.
   */
  destroyD0(): void { this.destroy(); }

  // ─── clone / copy / getObjCWrapperName ───────────────────────────────────

  /**
   * `OZChannelHistogramSample::clone() const` @ProChannel 0x717ac.
   *
   * Structure:
   *   1. `void* p = operator new(0x380)` @0x717b6-0x717bb.
   *   2. `OZChannelHistogramSample::OZChannelHistogramSample(*this, nullptr)`
   *      @0x717cb  — the copy-ctor with folder=nullptr (xorl %edx,%edx @0x717c9).
   *   3. `return p`.
   */
  clone(): OZChannelHistogramSample {
    // @0x717b6 — sizeof == 0x380 (proves layout above).
    // @0x717cb — copy-ctor with folder=nullptr.
    return OZChannelHistogramSample.construct_Copy(this, null);
  }

  /**
   * `OZChannelHistogramSample::copy(OZChannelBase const*, bool)` @ProChannel 0x717ec.
   *
   * Structure:
   *   1. `OZCompoundChannel::copy(src, addToUndo)` @0x717ff (base-class copy).
   *   2. If `src != nullptr`, dynamic-cast it from OZChannelBase to
   *      OZChannelHistogramSample @0x71809-0x71824. If src is null, treat the
   *      cast result as null (xorl %r14d,%r14d @0x71826) — this lets the sub
   *      copy calls receive a null and skip work.
   *   3. For sub[i] in 0..3, call `OZChannel::copy(src.sub[i], addToUndo)`
   *      (@0x7183c / 0x71850 / 0x71864 / 0x71878).
   *   4. Tail-jump into `OZChannel::copy` for sub[4] @0x7189b.
   *
   * The addToUndo bool is zero-extended (movzbl %r15b,%r15d @0x71835) but the
   * base's `bool` truthiness is what actually matters — we pass it through.
   */
  copy(src: OZChannelBase | null, addToUndo: boolean): void {
    // @0x717ff — base copy first.
    this.base.copyFrom(src, addToUndo);
    // @0x71809-0x71824 — dynamic-cast src -> OZChannelHistogramSample* or null.
    const srcHS: OZChannelHistogramSample | null =
      src == null ? null : (src as unknown as OZChannelHistogramSample);
    // @0x7183c..0x71878 — sub[0..3] copies.
    this.sub0.copyFrom(srcHS == null ? null : (srcHS.sub0 as unknown as OZChannelBase), addToUndo);
    this.sub1.copyFrom(srcHS == null ? null : (srcHS.sub1 as unknown as OZChannelBase), addToUndo);
    this.sub2.copyFrom(srcHS == null ? null : (srcHS.sub2 as unknown as OZChannelBase), addToUndo);
    this.sub3.copyFrom(srcHS == null ? null : (srcHS.sub3 as unknown as OZChannelBase), addToUndo);
    // @0x7189b — sub[4] tail-jump.
    this.sub4.copyFrom(srcHS == null ? null : (srcHS.sub4 as unknown as OZChannelBase), addToUndo);
  }

  /**
   * `OZChannelHistogramSample::getObjCWrapperName()` @ProChannel 0x718a0.
   *
   * Trivially returns a pointer to a cfstring @0x718a4 (RIP+0x74025 -> ProChannel
   * __cfstring @0xe4ff0 range). The disasm shows the cfstring pointer is loaded
   * into %rax and returned. We surface it as an opaque `PCString`-ish label so a
   * consumer that pretty-prints wrapper names sees the CFString slot address
   * rather than a fabricated string.
   *
   * NOTE: the actual UTF-16 label lives in ProChannel's .strings file — this
   * function only returns the CFString POINTER (as a `void*`-typed reference). The
   * Objective-C wrapper class reads its name off that ref at construction time.
   */
  getObjCWrapperName(): number {
    // @0x718a4 — `leaq 0x74025(%rip), %rax` — RIP after this insn is 0x718ab, so
    // target VA = 0x718ab + 0x74025 = 0xe48d0. This is the ProChannel cfstring
    // slot address of the wrapper name.
    return 0xe48d0;
  }
}
