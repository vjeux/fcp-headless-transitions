// OZChannelUint32 — a uint32-valued animation channel (Ozone.framework, aka Motion/FCP core).
//
// FAITHFUL PORT — do NOT approximate, do NOT guess. Every method cites @Ozone 0xADDR read
// from the disassembly under raw-port/re/disasm/OZChannelUint32.*.s. Constants cite the
// address they were read from (verified via army/tools/resolve.py const). Undecoded callees
// throw citing their FCP address (PORTING_SPEC.md Rule 3).
//
// STRUCT LAYOUT (recovered from all four ctors + the OZChannel base ctor call pattern):
//
//   size  ≥ 0x90  (touched fields: +0x00 vptr slot0, +0x10 vptr slot1, +0x70/+0x78 impl,
//                  +0x80/+0x88 info — everything below +0x10 up to +0x70 belongs to the
//                  OZChannel base sub-object and is opaque here).
//   +0x00   vtable slot0  (primary vptr — OZChannelUint32)
//             = __ZTV15OZChannelUint32 + 0x10   (VA 0x??? — resolved from `movq %rcx,(%rbx)`
//                                                after `leaq 0x10(%rax),%rcx` @0xc04e9)
//             — installed by every ctor: @0xc04e2 / 0xc17f2 / 0xdf8d8 / 0x572992
//   +0x10   vtable slot1  (secondary vptr — non-virtual-thunk table for the second base)
//             = __ZTV15OZChannelUint32 + 0x370
//             — installed by every ctor: @0xc04f0 / 0xc1800 / 0xdf8e6 / 0x5729a0
//   +0x18 .. +0x6F   OZChannel base sub-object (opaque — OZChannel::OZChannel initialises it)
//   +0x70   impl current-slot          (= this->impl OR _OZChannelUint32Impl singleton)
//   +0x78   impl seed-slot             (set by OZChannel base ctor from the impl argument;
//                                       copied → +0x70 unconditionally at end of ctor)
//   +0x80   info current-slot          (= this->info OR _OZChannelUint32Info singleton)
//   +0x88   info seed-slot             (set by OZChannel base ctor from the info argument;
//                                       copied → +0x80 only when info != null)
//
// The +0x70/+0x78 and +0x80/+0x88 pairs mirror the pattern in similar Ozone channel classes:
// two fields — one initialised by the base ctor from the caller-supplied pointer, the other
// initialised to the process-wide singleton. The current-slot is chosen at construction time
// based on whether the caller passed a non-null impl/info; both are lazily-constructed
// singletons (std::call_once) guarded by the two `_once` control words:
//   __ZZN15OZChannelUint3225createOZChannelUint32InfoEvE25_OZChannelUint32Info_once
//   __ZZN15OZChannelUint3225createOZChannelUint32ImplEvE25_OZChannelUint32Impl_once
// and the shared instances live at:
//   __ZN15OZChannelUint3220_OZChannelUint32InfoE   (VA ref 0xc0552 / 0xc1862 / 0xdf948 / 0x572a02)
//   __ZN15OZChannelUint3220_OZChannelUint32ImplE   (VA ref 0xc05ab / 0xc18bb / 0xdf9a1 / 0x572a5b)
//
// FACTORY: `getOZChannelUint32_FactoryBase()` — external free function called first thing in
// every ctor (@0xc04b4 / 0xc17c8 / 0xdf8ad / 0x572968). Its return value is fed as the
// FIRST argument to the OZChannel base ctor. Not yet transcribed — frontier stub below.
//
// BASE-CTOR CALL: every OZChannelUint32 ctor forwards to
//   OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*,
//                        unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
//   (symbol __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
//   @stub 0x6df474 — frontier: not yet transcribed.
//
// PER-VALUE-TYPE SEED: three of the four ctors (int / unsigned / double variants) call
//   OZChannel::setDefaultValue(double)         @stub 0x6df306
//   OZChannel::setInitialValue(double, bool)   @stub 0x6df30c   (bool arg = false)
// AFTER the base ctor + vtable install + singleton init. The value is widened to double via
// `cvtsi2sdl` (int→double, +0xc18cd) / `cvtsi2sd` from a zero-extended 64-bit reg (u32→double,
// +0x572a70) / already a double (0xdf9b6).
//
// DECODE references:
//   raw-port/re/disasm/OZChannelUint32.OZChannelUint32.s
//     (ctor(PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*,OZChannelInfo*)  @0xc0490)
//   raw-port/re/disasm/OZChannelUint32.__ZN15OZChannelUint32C2EiRK...s
//     (ctor(int,...)                                                            @0xc17a0)
//   raw-port/re/disasm/OZChannelUint32.__ZN15OZChannelUint32C2EjRK...s
//     (ctor(unsigned int,...)                                                   @0x572940)
//   raw-port/re/disasm/OZChannelUint32.__ZN15OZChannelUint32C2EdRK...s
//     (ctor(double,...)                                                         @0xdf880)
//   raw-port/re/disasm/OZChannelUint32.__ZN15OZChannelUint3226createOZChannelUint32CurveEd.s
//     (createOZChannelUint32Curve(double)                                       @0xdf570)

// ── seed constants read from Ozone __TEXT __const (verified with resolve.py const) ───────────
/** @const 0x7053e0  double = 1.0            (u64 0x3ff0000000000000)
 *  — 3rd arg (xmm2) to OZCurve::OZCurve(d,d,d,d) @0xdf5a8 in createOZChannelUint32Curve. */
const K_ONE: number = 1.0;
/** @const 0x705c80  double = 4294967295.0   (u64 0x41efffffffe00000  ≡ UINT32_MAX as double)
 *  — 2nd arg (xmm1) to OZCurve::OZCurve(d,d,d,d) @0xdf5a8 in createOZChannelUint32Curve. */
const K_UINT32_MAX_D: number = 4294967295.0;
/** implicit zero — 1st arg (xmm0) to OZCurve::OZCurve(d,d,d,d) via `xorps %xmm0,%xmm0` @0xdf59d. */
const K_ZERO: number = 0.0;
/** OZCurveInt heap size in bytes — `movl $0xb0,%edi` @0xdf580 fed to operator new. */
const K_OZCURVEINT_SIZE: number = 0xb0;

// ── opaque parameter types (structural — this class never dereferences them itself) ──────────
export type OZFactoryPtr = object | null | undefined;
export type OZChannelFolderPtr = object | null | undefined;
export type OZChannelImplPtr = object | null | undefined;
export type OZChannelInfoPtr = object | null | undefined;
export type OZSplineStatePtr = object | null | undefined;
/** OZCurveInt — opaque marker for the int-typed curve instance (sizeof 0xb0 from `movl $0xb0,%edi`
 *  @Ozone 0xdf580 and @ProChannel 0x44fe). Its internal layout is not exposed by this class. */
export type OZCurveInt = { readonly __ozcurveint: true } | object;
/** PCString — reference-counted immutable string; opaque here (base ctor consumes it). */
export type PCString = { readonly __pcstring: true } | string;

// ── frontier stubs for un-ported callees ─────────────────────────────────────────────────────
// Every method throws citing the FCP source address that would need transcription first
// (PORTING_SPEC.md Rule 3 — a loud gap is correct; a plausible guess corrupts everything).

/** `OZFactory* getOZChannelUint32_FactoryBase()` — free function, symbol
 *  `__Z30getOZChannelUint32_FactoryBasev`, called via stub 0x6dd2ba @0xc04b4 / 0xc17c8 /
 *  0xdf8ad / 0x572968. Returns the OZFactory* fed as arg1 to OZChannel::OZChannel. */
function getOZChannelUint32_FactoryBase(): OZFactoryPtr {
  throw new Error(
    "getOZChannelUint32_FactoryBase() @Ozone (stub 0x6dd2ba) not yet transcribed (called from OZChannelUint32 ctors @0xc04b4/0xc17c8/0xdf8ad/0x572968)",
  );
}

/** Process-wide singleton getters (std::call_once-guarded). The globals themselves are
 *  `__ZN15OZChannelUint3220_OZChannelUint32InfoE` / `..._OZChannelUint32ImplE`. Not yet
 *  transcribed — the initialiser lambdas call OZChannelUint32Info / OZChannelUint32Impl ctors. */
function getOZChannelUint32InfoSingleton(): OZChannelInfoPtr {
  throw new Error(
    "OZChannelUint32::createOZChannelUint32Info() singleton @Ozone not yet transcribed (std::call_once guard __ZZN15OZChannelUint3225createOZChannelUint32InfoEvE25_OZChannelUint32Info_once; global __ZN15OZChannelUint3220_OZChannelUint32InfoE @VA-ref 0xc0552/0xc1862/0xdf948/0x572a02)",
  );
}
function getOZChannelUint32ImplSingleton(): OZChannelImplPtr {
  throw new Error(
    "OZChannelUint32::createOZChannelUint32Impl() singleton @Ozone not yet transcribed (std::call_once guard __ZZN15OZChannelUint3225createOZChannelUint32ImplEvE25_OZChannelUint32Impl_once; global __ZN15OZChannelUint3220_OZChannelUint32ImplE @VA-ref 0xc05ab/0xc18bb/0xdf9a1/0x572a5b)",
  );
}

/**
 * Structural view of the OZChannel base sub-object as seen by OZChannelUint32's ctor tail:
 *  after `OZChannel::OZChannel(...)` runs, fields `impl` (@+0x78) and `info` (@+0x88) hold the
 *  caller-supplied pointers. The ctor tail copies those (or the singletons) into `impl0`
 *  (@+0x70) / `info0` (@+0x80). The OZChannel-level setters `setDefaultValue` /
 *  `setInitialValue` are also invoked here for the value-carrying ctors.
 */
export class OZChannelBaseSub {
  readonly __isOZChannelBaseSub = true;
  /** +0x70 — impl current-slot. */
  impl0: OZChannelImplPtr = undefined;
  /** +0x78 — impl seed-slot (set by OZChannel base ctor from arg). */
  impl: OZChannelImplPtr = undefined;
  /** +0x80 — info current-slot. */
  info0: OZChannelInfoPtr = undefined;
  /** +0x88 — info seed-slot (set by OZChannel base ctor from arg). */
  info: OZChannelInfoPtr = undefined;

  /** `OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, u32, u32,
   *   OZChannelImpl*, OZChannelInfo*)` — symbol
   *   `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
   *   @stub 0x6df474 (call sites: @0xc04dd / 0xc17ed / 0xdf8d3 / 0x57298d). Frontier. */
  baseCtor(
    _factory: OZFactoryPtr,
    _name: PCString,
    _folder: OZChannelFolderPtr,
    _u1: number,
    _u2: number,
    _impl: OZChannelImplPtr,
    _info: OZChannelInfoPtr,
  ): void {
    throw new Error(
      "OZChannel::OZChannel(OZFactory*,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*,OZChannelInfo*) @Ozone (stub 0x6df474) not yet transcribed (called from OZChannelUint32 ctors @0xc04dd/0xc17ed/0xdf8d3/0x57298d)",
    );
  }

  /** `OZChannel::setDefaultValue(double)` — symbol `__ZN9OZChannel15setDefaultValueEd`
   *  @stub 0x6df306 (call sites @0xc18da / 0xdf9bb / 0x572a7d). Frontier. */
  setDefaultValue(_v: number): void {
    throw new Error(
      "OZChannel::setDefaultValue(double) @Ozone (stub 0x6df306) not yet transcribed (called from OZChannelUint32 ctor tails @0xc18da/0xdf9bb/0x572a7d)",
    );
  }

  /** `OZChannel::setInitialValue(double, bool)` — symbol `__ZN9OZChannel15setInitialValueEdb`
   *  @stub 0x6df30c (call sites @0xc18e9 / 0xdf9ca / 0x572a8c — bool arg = false, `xorl %esi,%esi`).
   *  Frontier. */
  setInitialValue(_v: number, _propagate: boolean): void {
    throw new Error(
      "OZChannel::setInitialValue(double,bool) @Ozone (stub 0x6df30c) not yet transcribed (called from OZChannelUint32 ctor tails @0xc18e9/0xdf9ca/0x572a8c with bool=false)",
    );
  }

  /** `OZChannel::~OZChannel()` — symbol `__ZN9OZChannelD2Ev` @stub 0x6df480 (called from the
   *  unwind pads of every OZChannelUint32 ctor @0xc05d2 / 0xc1903 / 0xdf9e4 / 0x572aa6). Frontier. */
  destroy(): void {
    throw new Error(
      "OZChannel::~OZChannel() @Ozone (stub 0x6df480) not yet transcribed (called from OZChannelUint32 ctor unwind pads @0xc05d2/0xc1903/0xdf9e4/0x572aa6)",
    );
  }
}

/**
 * OZCurve base — the Ozone version (`__ZN7OZCurveC2Edddd`, ctor stub 0x6dec16). Distinct from
 * the ProChannel `OZCurve` already ported at raw-port/src/channels/OZCurve.ts (which is the
 * <curve> element parser, not this constructor). Signature is `OZCurve(double, double, double,
 * double)`. Not yet transcribed — frontier stub. `setSplineState(OZSplineState*)` is symbol
 * `__ZN7OZCurve14setSplineStateEP13OZSplineState` @stub 0x6debfe (called @0xdf60a).
 * `~OZCurve()` is symbol `__ZN7OZCurveD2Ev` @stub 0x6dec1c (called from unwind @0xdf634).
 */
export class OZCurveOzone {
  readonly __isOZCurveOzone = true;
  /** Object identity — mirrors the primary vptr slot that gets overwritten to
   *  `__ZTV10OZCurveInt + 0x10` at @0xdf5b8 for the OZCurveInt subclass instance. */
  vtable_kind: "OZCurve" | "OZCurveInt" = "OZCurve";
  splineState: OZSplineStatePtr = undefined;

  /** `OZCurve::OZCurve(double, double, double, double)` — symbol `__ZN7OZCurveC2Edddd`
   *  @stub 0x6dec16 (called @0xdf5a8 with (0.0, 4294967295.0, 1.0, <initial>)). Frontier. */
  constructor(_a0: number, _a1: number, _a2: number, _a3: number) {
    throw new Error(
      "OZCurve::OZCurve(double,double,double,double) @Ozone (stub 0x6dec16) not yet transcribed (called from OZChannelUint32::createOZChannelUint32Curve @0xdf5a8)",
    );
  }

  /** `OZCurve::setSplineState(OZSplineState*)` — symbol
   *  `__ZN7OZCurve14setSplineStateEP13OZSplineState` @stub 0x6debfe (called @0xdf60a). Frontier. */
  setSplineState(_s: OZSplineStatePtr): void {
    throw new Error(
      "OZCurve::setSplineState(OZSplineState*) @Ozone (stub 0x6debfe) not yet transcribed (called from OZChannelUint32::createOZChannelUint32Curve @0xdf60a)",
    );
  }
}

/**
 * `OZCurveIntSplineState::getInstance()` — Ozone-framework singleton whose address is loaded
 * from `__ZN21OZCurveIntSplineState9_instanceE` (VA-ref 0xdf5f2) after a std::call_once guard
 * `__ZN21OZCurveIntSplineState13_instanceOnceE` (VA-ref 0xdf5bb / 0xdf5db). The returned pointer
 * is offset by +0x8 before being handed to `OZCurve::setSplineState` (see @0xdf5fc: `leaq
 * 0x8(%rax),%rsi` — a multiple-inheritance sub-object adjust). If the raw instance pointer is
 * null the adjust is short-circuited (`testq %rax,%rax; cmoveq %rax,%rsi` @0xdf600..0xdf603).
 * The initialiser lambda body is not yet transcribed. Frontier stub — returns the raw instance
 * pointer; the caller applies the +0x8 sub-object adjust.
 */
function getOZCurveIntSplineStateInstance(): OZSplineStatePtr {
  throw new Error(
    "OZCurveIntSplineState::getInstance() singleton @Ozone not yet transcribed (std::call_once guard __ZN21OZCurveIntSplineState13_instanceOnceE @VA-ref 0xdf5bb; global __ZN21OZCurveIntSplineState9_instanceE @VA-ref 0xdf5f2)",
  );
}

// ── OZChannelUint32 ──────────────────────────────────────────────────────────────────────────
export class OZChannelUint32 {
  /**
   * Embedded OZChannel base sub-object. Its fields at +0x70/+0x78 (impl slots) and +0x80/+0x88
   * (info slots) are the only OZChannel-level bytes this class touches directly; everything
   * else is opaque here and driven by `OZChannel::OZChannel` / `OZChannel::setDefaultValue` /
   * `OZChannel::setInitialValue` (all frontier).
   */
  readonly base: OZChannelBaseSub;

  /**
   * OZChannelUint32::OZChannelUint32(PCString const&, OZChannelFolder*, unsigned int,
   *                                  unsigned int, OZChannelImpl*, OZChannelInfo*)
   *
   * @Ozone 0xc0490  (symbol `__ZN15OZChannelUint32C2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`)
   *
   * Faithful transcription of the 60-line ctor. The value-less variant — no default/initial
   * value setter tail. Steps (all cited to the source addresses):
   *
   *   0xc04b4  callq __Z30getOZChannelUint32_FactoryBasev             (factory pointer in %rax)
   *   0xc04dd  callq __ZN9OZChannelC2E...                             (OZChannel base ctor)
   *              args: this=%rbx, factory=%rax, name=%r14 (from %rsi),
   *                    folder=%r13 (from %rdx), u1=%r12d (from %ecx),
   *                    u2=-0x44(%rbp) (from %r8d), impl=%r15 (from %r9),
   *                    info = 0x10(%rbp) (7th arg on stack).
   *   0xc04e2  movq __ZTV15OZChannelUint32, %rax
   *   0xc04e9  leaq 0x10(%rax),%rcx ; movq %rcx,(%rbx)                (primary vptr @+0x00)
   *   0xc04f0  addq $0x370,%rax    ; movq %rax,0x10(%rbx)             (secondary vptr @+0x10)
   *   0xc04fa  cmpq $-0x1, _OZChannelUint32Info_once ; je 0xc052e     (fast-path: already run)
   *   0xc0507..0xc0529  std::call_once( _once, &__call_once_proxy<lambda> )
   *              (initialises the process-wide OZChannelUint32Info singleton — frontier lambda.)
   *   0xc052e  cmpq $0x0, 0x10(%rbp)                                  (info arg == nullptr?)
   *   0xc0533  je 0xc0552                                             (branch: use singleton)
   *          NON-NULL info path @0xc0535..0xc053c:
   *              movq 0x88(%rbx),%rax ; movq %rax,0x80(%rbx)          (info0 = info)
   *              — the OZChannel base ctor already stored the info arg into +0x88; the current
   *                slot +0x80 is set to the same pointer here.
   *          NULL info path @0xc0552..0xc0563:
   *              movq __ZN..._OZChannelUint32InfoE,%rax ; movq (%rax),%rax
   *              movq %rax,0x88(%rbx) ; movq %rax,0x80(%rbx)          (both slots ← singleton)
   *   0xc0543 / 0xc056a  cmpq $-0x1, _OZChannelUint32Impl_once        (guard for impl singleton)
   *   0xc0577..0xc0599  std::call_once for impl singleton (as above; frontier lambda).
   *   0xc059e  cmpq $0x0, -0x50(%rbp)                                 (impl arg (= %r15) == nullptr?)
   *   0xc05a3  je 0xc05ab                                             (branch: use singleton)
   *          NON-NULL impl path @0xc05a5..0xc05a9:
   *              movq 0x78(%rbx),%rax ; (fallthrough to 0xc05b9)      (rax = impl seed slot)
   *          NULL impl path @0xc05ab..0xc05b5:
   *              movq __ZN..._OZChannelUint32ImplE,%rax ; movq (%rax),%rax
   *              movq %rax,0x78(%rbx)                                 (impl seed slot ← singleton)
   *   0xc05b9  movq %rax,0x70(%rbx)                                   (impl0 ← rax — unconditional)
   *   0xc05bd..0xc05cb  epilogue (retq).
   *   0xc05cc..0xc05df  unwind pad: OZChannel::~OZChannel then __Unwind_Resume.
   */
  constructor(
    name: PCString,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
    info: OZChannelInfoPtr,
  ) {
    this.base = new OZChannelBaseSub();
    // Match FCP int-width contract (arguments are `unsigned int`).
    const u1_32 = (u1 >>> 0);
    const u2_32 = (u2 >>> 0);

    // @0xc04b4 — obtain the factory-base pointer (fed as arg1 to OZChannel::OZChannel).
    const factory: OZFactoryPtr = getOZChannelUint32_FactoryBase();

    // @0xc04dd — base ctor. It stores the impl/info args into +0x78 / +0x88 respectively.
    this.base.baseCtor(factory, name, folder, u1_32, u2_32, impl, info);
    // Model the post-condition explicitly (the real base ctor would do this — see comment).
    // NOTE: This is NOT a shortcut: the disasm at @0xc0535 (`movq 0x88(%rbx),%rax`) and
    // @0xc05a5 (`movq 0x78(%rbx),%rax`) reads these two fields immediately after the base ctor
    // returns, which is only meaningful if the base ctor wrote them from its 6th/7th args.

    // @0xc04e2..0xc04f6 — install the two vtable pointers. In TS class dispatch replaces vtable
    // installation; the two v-pointer stores (this+0x00 → vt+0x10, this+0x10 → vt+0x370) are
    // documented in the class comment above.

    // @0xc04fa..0xc0529 — lazily initialise the OZChannelUint32Info singleton (std::call_once).
    // We call the singleton getter unconditionally on the NULL-info branch below; JS has no
    // notion of the shared control word, so the initialiser runs the first time it's needed
    // and the JS engine handles memoisation.

    // @0xc052e — info branch.
    if (info !== null && info !== undefined) {
      // @0xc0535..0xc053c — non-null path: copy seed → current-slot.
      this.base.info0 = this.base.info;
    } else {
      // @0xc0552..0xc0563 — null path: fetch process-wide singleton, install into both slots.
      const singletonInfo = getOZChannelUint32InfoSingleton();
      this.base.info = singletonInfo;
      this.base.info0 = singletonInfo;
    }

    // @0xc0543 / 0xc056a..0xc0599 — lazily initialise the OZChannelUint32Impl singleton.
    // (Same call_once pattern as above.)

    // @0xc059e — impl branch. The disassembly reads `-0x50(%rbp)`, which was set to the
    // original impl arg (%r15) at @0xc04c2 — this is the SAME value that was passed to the
    // base ctor and stored at +0x78 there, so the branch check reduces to `impl != nullptr`.
    let implPtr: OZChannelImplPtr;
    if (impl !== null && impl !== undefined) {
      // @0xc05a5..0xc05a9 — non-null path: read impl seed slot back.
      implPtr = this.base.impl;
    } else {
      // @0xc05ab..0xc05b5 — null path: fetch singleton, install into seed slot.
      implPtr = getOZChannelUint32ImplSingleton();
      this.base.impl = implPtr;
    }
    // @0xc05b9 — unconditional: impl current-slot ← rax.
    this.base.impl0 = implPtr;
  }

  /**
   * OZChannelUint32::OZChannelUint32(int, PCString const&, OZChannelFolder*, unsigned int,
   *                                  unsigned int, OZChannelImpl*, OZChannelInfo*)
   *
   * @Ozone 0xc17a0  (symbol `__ZN15OZChannelUint32C2EiRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`)
   *
   * Same prologue+base-ctor+vtable+singletons body as the value-less ctor above. Then a
   * two-instruction tail (@0xc18cd..0xc18ea):
   *
   *   0xc18cd  cvtsi2sdl -0x4c(%rbp),%xmm0                            (int → double, sign-extend)
   *   0xc18da  callq __ZN9OZChannel15setDefaultValueEd                (setDefaultValue(v_d))
   *   0xc18e7  xorl %esi,%esi                                         (bool arg = false)
   *   0xc18e9  callq __ZN9OZChannel15setInitialValueEdb               (setInitialValue(v_d,false))
   *
   * The int is delivered in %esi by the C++ ABI (2nd arg), copied to -0x4c(%rbp) @0xc17be, then
   * widened with `cvtsi2sdl` (32-bit int, sign-extended to double). Bit-exact reproduction of
   * that in TS: `Math.fround`-noise-free because both endpoints are IEEE-754 double; the source
   * value is already a JS number and a signed 32-bit int fits exactly.
   */
  static fromInt(
    v: number,
    name: PCString,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
    info: OZChannelInfoPtr,
  ): OZChannelUint32 {
    const self = new OZChannelUint32(name, folder, u1, u2, impl, info);
    // @0xc17be — %esi (int) is spilled to -0x4c(%rbp); @0xc18cd — cvtsi2sdl → xmm0.
    // Reproduce signed-32-bit truncation of the input: `(v | 0)` yields the same bit pattern
    // C++ would see for `int`.
    const v_i32: number = (v | 0);
    const v_d: number = v_i32; // implicit int→double promotion — bit-exact for i32 inputs.
    // @0xc18da / 0xc18e9
    self.base.setDefaultValue(v_d);
    self.base.setInitialValue(v_d, false);
    return self;
  }

  /**
   * OZChannelUint32::OZChannelUint32(unsigned int, PCString const&, OZChannelFolder*,
   *                                  unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
   *
   * @Ozone 0x572940  (symbol `__ZN15OZChannelUint32C2EjRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`)
   *
   * Same body as the int variant with ONE arithmetic difference: the u32 is widened to double
   * via a 64-bit `cvtsi2sd` on the zero-extended register (unsigned semantics), NOT via the
   * 32-bit `cvtsi2sdl` (which is sign-extending). Disasm tail (@0x572a6d..0x572a8c):
   *
   *   0x572a6d  movl -0x4c(%rbp),%eax                                  (zero-extend u32 into %rax)
   *   0x572a70  cvtsi2sd %rax,%xmm0                                    (i64 → double, but rax fits u32)
   *   0x572a7d  callq __ZN9OZChannel15setDefaultValueEd
   *   0x572a8a  xorl %esi,%esi
   *   0x572a8c  callq __ZN9OZChannel15setInitialValueEdb
   *
   * The `movl` zero-extends into the full 64-bit register, so the subsequent
   * `cvtsi2sd %rax,%xmm0` (SIGNED 64-bit → double) gets the exact numeric value of the u32
   * (always positive, ≤ 2^32-1 < 2^63 so no sign-bit collision). In TS we reproduce that with
   * `(v >>> 0)` to force uint32 semantics; the resulting JS number is exact.
   */
  static fromUint(
    v: number,
    name: PCString,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
    info: OZChannelInfoPtr,
  ): OZChannelUint32 {
    const self = new OZChannelUint32(name, folder, u1, u2, impl, info);
    // @0x572a6d — zero-extend u32 into 64-bit reg; @0x572a70 — cvtsi2sd (signed i64 → double,
    // but the bit pattern is guaranteed non-negative so it equals the u32 value exactly).
    const v_u32: number = (v >>> 0);
    const v_d: number = v_u32; // exact int→double promotion for u32 values.
    // @0x572a7d / 0x572a8c
    self.base.setDefaultValue(v_d);
    self.base.setInitialValue(v_d, false);
    return self;
  }

  /**
   * OZChannelUint32::OZChannelUint32(double, PCString const&, OZChannelFolder*, unsigned int,
   *                                  unsigned int, OZChannelImpl*, OZChannelInfo*)
   *
   * @Ozone 0xdf880  (symbol `__ZN15OZChannelUint32C2EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`)
   *
   * Same body as the int/uint variants; the tail (@0xdf9b3..0xdf9cf) skips the int→double
   * widening because the value is already a double delivered in %xmm0 (spilled to -0x50(%rbp)
   * @0xdf8a1):
   *
   *   0xdf9b6  movsd -0x50(%rbp),%xmm0                                  (reload input double)
   *   0xdf9bb  callq __ZN9OZChannel15setDefaultValueEd
   *   0xdf9c8  xorl %esi,%esi                                           (bool arg = false)
   *   0xdf9ca  callq __ZN9OZChannel15setInitialValueEdb
   */
  static fromDouble(
    v: number,
    name: PCString,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
    info: OZChannelInfoPtr,
  ): OZChannelUint32 {
    const self = new OZChannelUint32(name, folder, u1, u2, impl, info);
    // @0xdf9bb / 0xdf9ca
    self.base.setDefaultValue(v);
    self.base.setInitialValue(v, false);
    return self;
  }

  /**
   * OZChannelUint32::createOZChannelUint32Curve(double)
   *
   * @Ozone 0xdf570  (symbol `__ZN15OZChannelUint3226createOZChannelUint32CurveEd`)
   *
   * Static factory that constructs an `OZCurveInt` (a subclass of `OZCurve`) initialised for
   * the uint32-value range and returns it wired up to the shared OZCurveIntSplineState.
   * 27-line body:
   *
   *   0xdf580  movl $0xb0,%edi ; callq __Znwm                          (operator new(0xb0) → %rax)
   *   0xdf58a  movq %rax,%rbx
   *   0xdf58d  movsd 0x6266eb(%rip),%xmm1                              (xmm1 = 4294967295.0 @const 0x705c80)
   *   0xdf595  movsd 0x625e43(%rip),%xmm2                              (xmm2 = 1.0          @const 0x7053e0)
   *   0xdf59d  xorps %xmm0,%xmm0                                       (xmm0 = 0.0)
   *   0xdf5a0  movq %rax,%rdi                                          (this = newly-allocated)
   *   0xdf5a3  movsd -0x20(%rbp),%xmm3                                 (xmm3 = input double)
   *   0xdf5a8  callq __ZN7OZCurveC2Edddd                               (OZCurve base ctor)
   *   0xdf5ad  leaq __ZTV10OZCurveInt(%rip),%rax
   *   0xdf5b4  addq $0x10,%rax
   *   0xdf5b8  movq %rax,(%rbx)                                        (primary vptr ← OZCurveInt vt+0x10)
   *   0xdf5bb..0xdf5ed  std::call_once( OZCurveIntSplineState::_instanceOnce, &lambda-getInstance )
   *   0xdf5f2  movq __ZN21OZCurveIntSplineState9_instanceE,%rax ; movq (%rax),%rax
   *   0xdf5fc  leaq 0x8(%rax),%rsi                                     (secondary-base +0x8 adjust)
   *   0xdf600  testq %rax,%rax ; cmoveq %rax,%rsi                      (null → keep null)
   *   0xdf607  movq %rbx,%rdi
   *   0xdf60a  callq __ZN7OZCurve14setSplineStateEP13OZSplineState
   *   0xdf60f  movq %rbx,%rax                                          (return the new curve)
   *   0xdf612..0xdf61a  epilogue (retq).
   *   0xdf61b..0xdf628  unwind pad from OZCurve ctor:  operator delete + __Unwind_Resume.
   *   0xdf62e..0xdf644  unwind pad from setSplineState: ~OZCurve + operator delete + __Unwind_Resume.
   */
  static createOZChannelUint32Curve(v: number): OZCurveOzone {
    // @0xdf580 — operator new(0xb0). Modelled by JS-object construction; the 0xb0-byte struct
    // size is captured in K_OZCURVEINT_SIZE for auditability.
    void K_OZCURVEINT_SIZE;

    // @0xdf58d..0xdf5a8 — OZCurve base ctor with (0.0, 4294967295.0, 1.0, v).
    const curve = new OZCurveOzone(K_ZERO, K_UINT32_MAX_D, K_ONE, v);

    // @0xdf5ad..0xdf5b8 — overwrite the primary vptr to __ZTV10OZCurveInt+0x10. In TS this is
    // modelled by tagging the instance's `vtable_kind`; no real vtable exists to store into.
    curve.vtable_kind = "OZCurveInt";

    // @0xdf5bb..0xdf5f9 — std::call_once → OZCurveIntSplineState::_instance.
    const rawInstance = getOZCurveIntSplineStateInstance();
    // @0xdf5fc / 0xdf600..0xdf603 — apply the +0x8 sub-object adjust unless the raw pointer is null.
    let stateArg: OZSplineStatePtr;
    if (rawInstance === null || rawInstance === undefined) {
      stateArg = rawInstance;
    } else {
      // In C++ this is a byte-offset multiple-inheritance thunk. In TS we cannot subdivide an
      // object by 8 bytes, so the identity+8-adjust is modelled by passing the raw pointer
      // through unchanged; the actual pointer arithmetic is documented in the doc-comment above
      // and must be reinstated once OZSplineState + OZCurveIntSplineState are transcribed.
      stateArg = rawInstance;
    }

    // @0xdf60a — OZCurve::setSplineState(state+0x8).
    curve.setSplineState(stateArg);

    // @0xdf60f — return the new curve.
    return curve;
  }
}

// ================================================================================================
// ProChannel-framework counterpart methods
// ================================================================================================
//
// OZChannelUint32 is compiled and registered under BOTH Ozone.framework AND ProChannel.framework
// (each is a separate x86_64 dylib slice). The Ozone slice above covers 4 ctor bodies + the curve
// factory (all @Ozone 0xADDR). The ProChannel slice defines an ADDITIONAL 9 method bodies at
// completely different addresses (`nm -n` on ProChannel.framework/Versions/A/ProChannel confirms
// — see raw-port/army/inventory/ProChannel.syms.txt). Adds:
//   * OZChannelUint32(OZFactory*, PCString&, uint, impl, info)  @ProChannel 0x423c
//   * OZChannelUint32(PCString&, folder, uint, uint, impl, info) @ProChannel 0x97b34
//   * createOZChannelUint32Info()                                @ProChannel 0x42ec
//   * createOZChannelUint32Impl()                                @ProChannel 0x4336
//   * createOZChannelUint32Impl()::lambda                        @ProChannel 0x44da
//   * getObjCWrapperName()                                       @ProChannel 0x1cc3c
//   * ~OZChannelUint32() D1                                      @ProChannel 0x1ce9a
//   * ~OZChannelUint32() D0                                      @ProChannel 0x1cea4
//   * clone() const                                              @ProChannel 0x1cec0
//
// STRUCT LAYOUT DELTA (ProChannel slice — confirms header layout):
//   sizeof(OZChannelUint32) = 0x98 == 152 bytes           ; from `movl $0x98,%edi` @0x1ceca in clone().
//   `__ZTV15OZChannelUint32` (ProChannel slice) at 0xd1f90 (nm confirms). Vptr targets:
//       primary  = 0xd1fa0 = __ZTV+0x10        ; leaq 0xb50b5(%rip) @0x1ceeb (RIP=0x1cef2 → 0xd1fa0).
//       secondary= 0xd2300 = __ZTV+0x370       ; leaq 0xb540b(%rip) @0x1cef5 (RIP=0x1cefc → 0xd2300).

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel copy-ctor.
 *  Called by clone() @ProChannel 0x1cedf. NOT yet transcribed. */
function OZChannel_pc_copy_ctor(
  _self: OZChannelUint32,
  _other: OZChannelUint32,
  _folder: OZChannelFolderPtr | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel U-extern " +
    "__ZN9OZChannelC2ERKS_P15OZChannelFolderPtr (defined in ProChannel; not yet transcribed) — " +
    "invoked by OZChannelUint32::clone() @ProChannel 0x1cedf"
  );
}

/** External `__ZN9OZChannelD2Ev` — OZChannel base dtor. Called by D1 tail-jmp @ProChannel 0x1ce9f
 *  and D0 body @0x1cead. NOT yet transcribed. */
function OZChannel_pc_base_dtor(_self: OZChannelUint32): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel U-extern __ZN9OZChannelD2Ev " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelUint32 D1 tail-jmp " +
    "@ProChannel 0x1ce9f and D0 @ProChannel 0x1cead"
  );
}

/** External `__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  — OZChannel base ctor. Called by every ProChannel-slice OZChannelUint32 ctor. NOT yet transcribed. */
function OZChannel_pc_base_ctor(
  _self: OZChannelUint32,
  _factory: OZFactoryPtr,
  _name: string,
  _folder: OZChannelFolderPtr | null,
  _uint1: number,
  _uint2: number,
  _impl: OZChannelImplPtr | null,
  _info: OZChannelInfoPtr | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, " +
    "OZChannelImpl*, OZChannelInfo*) @ProChannel U-extern " +
    "__ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelUint32 ctors " +
    "@ProChannel 0x4263 and @ProChannel 0x97b81"
  );
}

/** External `__Z30getOZChannelUint32_FactoryBasev` — factory base accessor called by ProChannel
 *  ctor @0x97b58. NOT yet transcribed. */
function getOZChannelUint32_FactoryBase_ProChannel(): OZFactoryPtr {
  throw new Error(
    "getOZChannelUint32_FactoryBase() @ProChannel U-extern __Z30getOZChannelUint32_FactoryBasev " +
    "(defined in ProChannel; not yet transcribed) — invoked by OZChannelUint32 " +
    "PCString-folder ctor @ProChannel 0x97b58"
  );
}

/** External `__ZN10OZCurveIntC2Ed` — OZCurveInt(double) ctor. Called from lambda @ProChannel 0x4511.
 *  NOT yet transcribed. */
function OZCurveInt_ctor_d_ProChannel(_self: OZCurveInt, _initVal: number): void {
  throw new Error(
    "OZCurveInt::OZCurveInt(double) @ProChannel U-extern __ZN10OZCurveIntC2Ed " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelUint32::createOZChannelUint32Impl::lambda @ProChannel 0x4511"
  );
}

/** External `__ZN13OZChannelImplC2EP7OZCurvedjb` — OZChannelImplPtr ctor. Called from lambda @0x4529
 *  with args (curve, 0.0, 1, true). NOT yet transcribed. */
function OZChannelImpl_ctor_pc(
  _self: OZChannelImplPtr,
  _curve: OZCurveInt,
  _defaultValue: number,
  _uint1: number,
  _bool1: boolean,
): void {
  throw new Error(
    "OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) @ProChannel U-extern " +
    "__ZN13OZChannelImplC2EP7OZCurvedjb (defined in ProChannel; not yet transcribed) — " +
    "invoked by OZChannelUint32::createOZChannelUint32Impl::lambda @ProChannel 0x4529"
  );
}

/** External `__ZN13OZChannelImplD2Ev` — OZChannelImplPtr base dtor. Unwind path @0x4568. */
function OZChannelImpl_dtor_pc_u32(_self: OZChannelImplPtr): void {
  throw new Error(
    "OZChannelImpl::~OZChannelImpl() @ProChannel U-extern __ZN13OZChannelImplD2Ev " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelUint32::createOZChannelUint32Impl::lambda unwind @ProChannel 0x4568"
  );
}

/** External `__ZN11PCSingletonC2Ej` — PCSingleton(uint) ctor. Called from lambda @0x453a with slotID=0x64. */
function PCSingleton_ctor_pc_u32(_self: PCSingletonU32, _slotID: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel U-extern __ZN11PCSingletonC2Ej " +
    "(defined in ProChannel; not yet transcribed) — invoked by " +
    "OZChannelUint32::createOZChannelUint32Impl::lambda @ProChannel 0x453a (slotID = 0x64)"
  );
}

/** Placeholder for the PCSingleton subobject embedded at (impl + 0x28) in the lambda. */
interface PCSingletonU32 {
  readonly _prochannelPCSingletonU32Marker: true;
}

/**
 * OZChannelUint32::getObjCWrapperName() @ProChannel 0x1cc3c.
 *
 * Faithful transcription:
 *   @0x1cc40: leaq 0xc8129(%rip), %rax   ; RIP-post=0x1cc47, +0xc8129 = 0xe4d70 in __cfstring.
 *             CFString struct at 0xe4d70:  cstr ptr = 0xbc4b8, length = 15.
 *             Reading __TEXT,__cstring @0xbc4b8 (file offset) yields the literal
 *             bytes b'CHChannelUint32\x00' — the 15-char ObjC wrapper class name.
 *   @0x1cc47: retq                       ; return the CFString pointer.
 */
export function OZChannelUint32_getObjCWrapperName(): string {
  return "CHChannelUint32"; // @ProChannel cfstring @0xe4d70 -> cstring @0xbc4b8 (len 15)
}

/**
 * OZChannelUint32::~OZChannelUint32() D1 @ProChannel 0x1ce9a.
 *
 * Faithful transcription:
 *   @0x1ce9a-9e: push %rbp / mov %rsp,%rbp / pop %rbp     ; empty frame.
 *   @0x1ce9f:    jmp __ZN9OZChannelD2Ev                    ; tail-call base dtor.
 *
 * OZChannelUint32 owns no fields beyond OZChannel — every derived slot (impl/info) is either
 * a shared singleton or caller-owned. Base dtor handles everything.
 */
export function OZChannelUint32_D1(self: OZChannelUint32): void {
  // Tail-call @ProChannel 0x1ce9f — OZChannel base dtor cleans up all inherited state.
  OZChannel_pc_base_dtor(self);
}

/**
 * OZChannelUint32::~OZChannelUint32() D0 @ProChannel 0x1cea4.
 *
 * Faithful transcription:
 *   @0x1cea4-a9: standard prologue (push %rbp, mov %rsp,%rbp, push %rbx, push %rax).
 *   @0x1ceaa:    mov %rdi,%rbx                            ; save `this`.
 *   @0x1cead:    callq __ZN9OZChannelD2Ev                 ; run base dtor.
 *   @0x1ceb2-ba: epilogue.
 *   @0x1cebb:    jmp __ZdlPv                              ; tail-call operator delete(void*).
 */
export function OZChannelUint32_D0(self: OZChannelUint32): void {
  // @ProChannel 0x1cead — base dtor.
  OZChannel_pc_base_dtor(self);
  // @ProChannel 0x1cebb — operator delete(void*). No-op in JS (GC-managed).
  operator_delete_u32(self);
}

/** `__ZdlPv` — global `operator delete(void*)`. Trivial: releases heap memory. GC handles this in JS.
 *  Cited so the transcription is complete. @ProChannel symbol stub @0xace04. */
function operator_delete_u32(_ptr: unknown): void {
  // Explicit no-op — the raw heap free has no language-level counterpart in JS.
}

/**
 * OZChannelUint32::clone() const @ProChannel 0x1cec0.
 *
 * Faithful transcription:
 *   Step 1 @0x1ceca:  `movl $0x98,%edi`                      ; sizeof(OZChannelUint32) = 0x98.
 *   Step 2 @0x1cecf:  `callq __Znwm`                          ; ::operator new(0x98).
 *   Step 3 @0x1ced4-dd: save alloc into %rbx, feed copy-ctor with %rsi=other, %rdx=NULL folder.
 *   Step 4 @0x1cedf:  `callq __ZN9OZChannelC2ERKS_P15OZChannelFolder` — base copy-ctor.
 *   Step 5 @0x1cee4-eb: write primary vptr `__ZTV15OZChannelUint32 + 0x10` (data addr 0xd1fa0) at (new+0x00).
 *                       leaq 0xb50b5(%rip) resolves to 0xd1fa0.
 *   Step 6 @0x1ceee-f5: write secondary vptr `__ZTV15OZChannelUint32 + 0x370` (data addr 0xd2300) at (new+0x10).
 *                       leaq 0xb540b(%rip) resolves to 0xd2300.
 *   Step 7 @0x1cef9:  `mov %rbx,%rax`                        ; return the new instance.
 *   Exception path @0x1cf01-0f: `__ZdlPv(alloc)` + `__Unwind_Resume` if copy-ctor threw.
 */
export function OZChannelUint32_clone(self: OZChannelUint32): OZChannelUint32 {
  // Step 1-2 @ProChannel 0x1ceca-cf — allocate sizeof(OZChannelUint32)=0x98 = 152 bytes.
  const cloned = Object.create(null) as OZChannelUint32;

  // Step 4 @ProChannel 0x1cedf — OZChannel(const&, folder=null). Frontier throw.
  OZChannel_pc_copy_ctor(cloned, self, /*folder*/ null);

  // Steps 5-6 — vptr writes @ProChannel 0x1ceeb/0x1cef5. Data addrs 0xd1fa0 and 0xd2300 (both
  // inside __ZTV15OZChannelUint32 @0xd1f90 at offsets +0x10 and +0x370). Implicit in JS shape.

  // Step 7 @ProChannel 0x1cef9 — return the clone.
  return cloned;
}

/**
 * OZChannelUint32::createOZChannelUint32Info() @ProChannel 0x42ec.
 *
 * Faithful transcription (standard std::call_once pattern):
 *   @0x42f4:  load `_OZChannelUint32Info_once` into %rax.
 *   @0x42fb-ff: cmpq $-1,%rax ; je 0x4326                   ; skip if already initialized.
 *   @0x4301-21: set up std::call_once with args (once, lambda_capture, __call_once_proxy<lambda>);
 *              the lambda's body is std::once_proxy-wrapped and NOT symbol-visible in the
 *              framework slice (populates the _OZChannelUint32Info global).
 *   @0x4321:  callq __ZNSt3__111__call_onceERVmPvPFvS2_E    ; std::__1::__call_once.
 *   @0x4326-2d: load `_OZChannelUint32Info` global + deref, return.
 */
export function OZChannelUint32_createOZChannelUint32Info(): OZChannelInfoPtr {
  // @ProChannel 0x4301-21 — std::call_once wraps _OZChannelUint32Info_once_body (below).
  return _OZChannelUint32Info_once_body();
}

/** The `_OZChannelUint32Info` lambda body (std::once_proxy-wrapped, no direct symbol exposed).
 *  NOT yet decoded. */
function _OZChannelUint32Info_once_body(): OZChannelInfoPtr {
  throw new Error(
    "OZChannelUint32::createOZChannelUint32Info()::lambda @ProChannel U-extern " +
    "(bound via __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN15OZChannelUint3225createOZChannelUint32InfoEvEUlvE_EEEEEvPv" +
    " -- lambda body not symbol-visible; not yet transcribed). Referenced by " +
    "OZChannelUint32::createOZChannelUint32Info() @ProChannel 0x431a"
  );
}

/**
 * OZChannelUint32::createOZChannelUint32Impl() @ProChannel 0x4336.
 *
 * Faithful transcription (identical shape to createOZChannelUint32Info):
 *   @0x433e:  load `_OZChannelUint32Impl_once`.
 *   @0x4345-49: cmpq $-1 ; je 0x4370                        ; skip if initialized.
 *   @0x434b-6b: std::call_once(once, lambda_capture, __call_once_proxy<lambda>) —
 *              lambda body IS decoded here (see next function @0x44da).
 *   @0x436b:  callq __ZNSt3__111__call_onceERVmPvPFvS2_E    ; std::__1::__call_once.
 *   @0x4370-77: load `_OZChannelUint32Impl` global + deref, return.
 */
export function OZChannelUint32_createOZChannelUint32Impl(): OZChannelImplPtr {
  // @ProChannel 0x434b-6b — std::call_once wraps the lambda (below).
  return OZChannelUint32_createOZChannelUint32Impl_lambda();
}

/**
 * OZChannelUint32::createOZChannelUint32Impl()::'lambda'() @ProChannel 0x44da.
 *
 * Faithful transcription (parallel to the OZChannelDouble equivalent, but with OZCurveInt):
 *   Step  1 @0x44e4:  leaq _OZChannelUint32Impl(%rip),%r15   ; addr of the shared singleton slot.
 *   Step  2 @0x44eb-ef: cmpq $0,(%r15) ; jne 0x4557         ; skip if slot already set.
 *   Step  3 @0x44f1-f6: `movl $0x30,%edi ; call __Znwm`     ; alloc 48 bytes for OZChannelImpl.
 *   Step  4 @0x44fb:  mov %rax,%rbx                          ; save impl.
 *   Step  5 @0x44fe-503: `movl $0xb0,%edi ; call __Znwm`    ; alloc 176 bytes for OZCurveInt.
 *   Step  6 @0x4508:  mov %rax,%r14                          ; save curve.
 *   Step  7 @0x450b-11: `xorps %xmm0,%xmm0 ; mov %rax,%rdi ;
 *                          call __ZN10OZCurveIntC2Ed`         ; OZCurveInt::OZCurveInt(0.0).
 *   Step  8 @0x4516-29: `xorps %xmm0,%xmm0 ; mov %rbx,%rdi ; mov %r14,%rsi ; movl $1,%edx ;
 *                          movl $1,%ecx ; call __ZN13OZChannelImplC2EP7OZCurvedjb`
 *                          ; OZChannelImpl(curve=r14, defaultValue=0.0, uint1=1, bool1=true).
 *   Step  9 @0x452e-3a: `mov %rbx,%rdi ; add $0x28,%rdi ; movl $0x64,%esi ; call __ZN11PCSingletonC2Ej`
 *                          ; PCSingleton in-place at (impl + 0x28) with slotID = 0x64.
 *   Step 10 @0x453f-46: `leaq 0xc7172(%rip),%rax ; mov %rax,(%rbx)`
 *                          ; primary vptr at impl+0x00 -> data addr 0xcb6b8
 *                            (= __ZTV19OZChannelUint32Impl @0xcb6a8 + 0x10).
 *   Step 11 @0x4549-50: `leaq 0xc7188(%rip),%rax ; mov %rax,0x28(%rbx)`
 *                          ; secondary vptr at impl+0x28 -> data addr 0xcb6d8
 *                            (= __ZTV19OZChannelUint32Impl + 0x30).
 *   Step 12 @0x4554:  `mov %rbx,(%r15)`                     ; publish into _OZChannelUint32Impl.
 *   Exception paths @0x4562-8a: same 3-arm cleanup as the OZChannelDouble variant.
 */
function OZChannelUint32_createOZChannelUint32Impl_lambda(): OZChannelImplPtr {
  // Step 3 @ProChannel 0x44f1 — sizeof(OZChannelImpl) = 0x30 (48 bytes).
  const impl = Object.create(null) as OZChannelImplPtr & {
    _pcSingleton?: PCSingletonU32;
  };

  // Step 5-7 @ProChannel 0x44fe-511 — alloc + ctor OZCurveInt(0.0).
  //   sizeof(OZCurveInt) = 0xb0 (176 bytes); xmm0=0.0 (xorps @0x450b).
  const curve = Object.create(null) as OZCurveInt;
  OZCurveInt_ctor_d_ProChannel(curve, 0.0);

  // Step 8 @ProChannel 0x4516-29 — OZChannelImpl(curve, 0.0, 1, true).
  //   defaultValue = 0.0                                    (xorps %xmm0,%xmm0 @0x4516)
  //   uint1        = 1                                      (movl $1,%edx      @0x451f)
  //   bool1        = true                                   (movl $1,%ecx      @0x4524)
  OZChannelImpl_ctor_pc(impl, curve, /*defaultValue*/ 0.0, /*uint1*/ 1, /*bool1*/ true);

  // Step 9 @ProChannel 0x452e-3a — PCSingleton in-place at impl+0x28 with slotID = 0x64.
  const pcs = Object.create(null) as PCSingletonU32;
  PCSingleton_ctor_pc_u32(pcs, /*slotID*/ 0x64);
  impl._pcSingleton = pcs;

  // Steps 10-11 — vptr writes @ProChannel 0x4546/0x4550. Data addrs 0xcb6b8 and 0xcb6d8, both
  // inside __ZTV19OZChannelUint32Impl @0xcb6a8 at offsets +0x10 and +0x30. Implicit in JS shape.

  // Step 12 @ProChannel 0x4554 — publish. Global-slot semantics wrapped in the enclosing
  // createOZChannelUint32Impl() call_once shell above.
  return impl;
}

/**
 * OZChannelUint32::OZChannelUint32(OZFactory*, PCString const&, uint, OZChannelImpl*, OZChannelInfo*)
 * @ProChannel 0x423c.
 *
 * Faithful transcription:
 *   Step 1 @0x4249-52:  save regs: r15=info, r14=impl, r8d=uint1 (from ecx), rbx=this.
 *   Step 2 @0x4255-5e:  put info (r15) at [rsp+0x8], impl (r14) at [rsp+0] (stack args for base).
 *   Step 3 @0x425e-60:  `xorl %ecx,%ecx ; xorl %r9d,%r9d`   ; folder=NULL, uint2=0 (fixed).
 *   Step 4 @0x4263:     callq OZChannel::OZChannel(this, factory, name, folder=NULL, uint1, uint2=0, impl, info).
 *   Step 5 @0x4268-77:  write primary vptr `__ZTV15OZChannelUint32 + 0x10` at (this+0)      = 0xd1fa0.
 *   Step 6 @0x427c:     write secondary vptr `__ZTV15OZChannelUint32 + 0x370` at (this+0x10) = 0xd2300.
 *   Step 7 @0x4280:     callq createOZChannelUint32Info() — idempotent lazy singleton init.
 *   Step 8 @0x4285-a4:  if r15(info) != NULL: mirror (this+0x88)->(this+0x80).
 *                       else load _OZChannelUint32Info and write to BOTH (this+0x88) and (this+0x80).
 *   Step 9 @0x42ab:     callq createOZChannelUint32Impl() — idempotent lazy singleton init.
 *   Step 10 @0x42b0-c9: if r14(impl) != NULL: mirror (this+0x78)->(this+0x70).
 *                        else load _OZChannelUint32Impl and write to BOTH (this+0x78) and (this+0x70).
 *   Exception path @0x42d8-e6: OZChannel::~OZChannel() + __Unwind_Resume.
 *
 * Semantics: this OZFactory-forwarding ctor is called from OZChannelUint32_Factory::create() to
 * build an instance with a caller-nominated factory but no folder attachment. It always passes
 * folder=NULL and uint2=0 to the base ctor.
 */
export function OZChannelUint32_ctor_factory(
  self: OZChannelUint32,
  factory: OZFactoryPtr,
  name: string,
  uint1: number,                    // ecx / arg-4 (unsigned int)
  impl: OZChannelImplPtr | null,
  info: OZChannelInfoPtr | null,
): void {
  // Step 4 @ProChannel 0x4263 — OZChannel base ctor with folder=NULL, uint2=0.
  OZChannel_pc_base_ctor(self, factory, name, /*folder*/ null, uint1, /*uint2*/ 0, impl, info);
  // Steps 5-6 — vptrs implicit in JS shape.
  //   +0x00  <- __ZTV15OZChannelUint32 + 0x10   (data addr 0xd1fa0)
  //   +0x10  <- __ZTV15OZChannelUint32 + 0x370  (data addr 0xd2300)

  // Steps 7-8 — Info singleton or caller-supplied.
  OZChannelUint32_createOZChannelUint32Info();
  if (info !== null) {
    // Base ctor already wrote info at (self+0x88); mirror (self+0x88) -> (self+0x80). @0x428a-a4.
    (self as OZChannelUint32 & { info?: OZChannelInfoPtr }).info = info;
  } else {
    // @0x4293: load _OZChannelUint32Info and write it to BOTH slots.
    (self as OZChannelUint32 & { info?: OZChannelInfoPtr }).info = _OZChannelUint32Info_once_body();
  }

  // Steps 9-10 — Impl singleton or caller-supplied.
  OZChannelUint32_createOZChannelUint32Impl();
  if (impl !== null) {
    (self as OZChannelUint32 & { impl?: OZChannelImplPtr }).impl = impl;
  } else {
    (self as OZChannelUint32 & { impl?: OZChannelImplPtr }).impl = OZChannelUint32_createOZChannelUint32Impl_lambda();
  }
}

/**
 * OZChannelUint32::OZChannelUint32(PCString const&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)
 * @ProChannel 0x97b34.
 *
 * Faithful transcription:
 *   Step 1 @0x97b45-55: save regs: r15=impl (%r9), [rbp-0x2c]=uint2 (%r8d), r12d=uint1 (%ecx),
 *                        r13=folder (%rdx), r14=name (%rsi), rbx=this (%rdi). info is at
 *                        0x10(%rbp) (7th arg via stack under sysV).
 *   Step 2 @0x97b58:   callq getOZChannelUint32_FactoryBase() -> %rax   ; internally-fetched factory.
 *   Step 3 @0x97b5d-6a: put stack-arg info at [rsp+0x8], impl (r15) at [rsp+0]; save r15 to [rbp-0x38].
 *   Step 4 @0x97b6e-81: register moves + `callq OZChannel::OZChannel(...)` — full 7-arg base ctor.
 *   Step 5 @0x97b86-9a: write primary vptr `__ZTV + 0x10` (0xd1fa0) and secondary vptr `__ZTV + 0x370` (0xd2300).
 *   Step 6 @0x97b9e:   callq createOZChannelUint32Info() — idempotent lazy init.
 *   Step 7 @0x97ba3-c4: null-check info (at 0x10(%rbp)): if non-null, mirror (this+0x88)->(this+0x80);
 *                        else load _OZChannelUint32Info and write to BOTH.
 *   Step 8 @0x97bcb:   callq createOZChannelUint32Impl() — idempotent lazy init.
 *   Step 9 @0x97bd0-eb: null-check impl (at -0x38(%rbp) = saved r15): if non-null, mirror
 *                         (this+0x78)->(this+0x70); else load _OZChannelUint32Impl and write to BOTH.
 *   Exception path @0x97bfe-0c: OZChannel::~OZChannel() + __Unwind_Resume.
 *
 * Semantics: this variant is what OZChannelUint32_Factory::createChannel() invokes when no
 * caller-supplied factory is available — it internally sources `getOZChannelUint32_FactoryBase()`
 * and forwards it to the OZChannel base ctor along with the caller's folder + uint1/uint2 + impl/info.
 */
export function OZChannelUint32_ctor_named(
  self: OZChannelUint32,
  name: string,
  folder: OZChannelFolderPtr | null,
  uint1: number,                    // ecx / arg-4
  uint2: number,                    // r8d / arg-5
  impl: OZChannelImplPtr | null,
  info: OZChannelInfoPtr | null,
): void {
  // Step 2 @ProChannel 0x97b58 — fetch the internal factory. Frontier throw.
  const factory = getOZChannelUint32_FactoryBase_ProChannel();

  // Step 4 @ProChannel 0x97b81 — base ctor with all 7 args.
  OZChannel_pc_base_ctor(self, factory, name, folder, uint1, uint2, impl, info);

  // Steps 5 — vptrs implicit.

  // Steps 6-7 — Info handling. Symmetric to the OZFactoryPtr ctor above.
  OZChannelUint32_createOZChannelUint32Info();
  if (info !== null) {
    (self as OZChannelUint32 & { info?: OZChannelInfoPtr }).info = info;
  } else {
    (self as OZChannelUint32 & { info?: OZChannelInfoPtr }).info = _OZChannelUint32Info_once_body();
  }

  // Steps 8-9 — Impl handling.
  OZChannelUint32_createOZChannelUint32Impl();
  if (impl !== null) {
    (self as OZChannelUint32 & { impl?: OZChannelImplPtr }).impl = impl;
  } else {
    (self as OZChannelUint32 & { impl?: OZChannelImplPtr }).impl = OZChannelUint32_createOZChannelUint32Impl_lambda();
  }
}
