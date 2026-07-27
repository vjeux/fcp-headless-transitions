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
