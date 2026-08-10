// raw-port/src/channels/OZChannelPercent.ts
//
// FCP `OZChannelPercent` — namespace/class in Ozone.framework whose sole
// public entry is the free static factory `createOZChannelPercentCurve(double)`.
// It allocates + initialises an `OZCurvePercent` (percent-clamped OZCurve) and
// wires its shared spline state singleton, returning the base `OZCurve*`.
//
// Framework: Ozone (x86_64 slice; slice offset 0x4000).
// Provenance: raw-port/re/disasm/OZChannelPercent.createOZChannelPercentCurve.s
//   (extracted via raw-port/tools/disasm.sh OZChannelPercent createOZChannelPercentCurve Ozone).
//
// Only method:
//   createOZChannelPercentCurve(double)  @Ozone 0x000a9ff0
//     (__ZN16OZChannelPercent27createOZChannelPercentCurveEd)
//
// Cross-framework references (all resolved from the disasm — see
// nm -arch x86_64 outputs quoted in the port body):
//   __Znwm                                         @ Ozone stub 0x6dfca2  -- operator new
//   __ZN7OZCurveC2Edddd                            @ Ozone stub 0x6dec16  -- OZCurve::OZCurve(double,double,double,double)  [resolves into ProChannel base ctor at ProChannel 0x1e494]
//   __ZTV14OZCurvePercent                          @ Ozone 0x835de8       -- vtable for Ozone-local OZCurvePercent (distinct from ProChannel's __ZTV14OZCurvePercent). Vptr stored = base + 0x10.
//   __ZN25OZCurvePercentSplineState13_instanceOnceE @ ProChannel 0xec3a0  -- std::call_once flag (U-extern in Ozone)
//   __ZN25OZCurvePercentSplineState9_instanceE      @ ProChannel 0xec398  -- singleton OZCurvePercentSplineState* (U-extern in Ozone)
//   __ZNSt3__117__call_once_proxyB9nqe210106I…OZCurvePercentSplineState::getInstance::lambda…Pv
//                                                   @ Ozone 0xaa240      -- the local call_once proxy
//   __ZNSt3__111__call_onceERVmPvPFvS2_E             @ Ozone stub 0x6dfb2e -- std::__1::__call_once
//   __ZN7OZCurve14setSplineStateEP13OZSplineState   @ Ozone stub 0x6debfe -- OZCurve::setSplineState  [resolves into ProChannel 0x1ea66]
//   __ZdlPv                                         @ Ozone stub 0x6dfc36 -- operator delete (unwind path)
//   __ZN7OZCurveD2Ev                                @ Ozone stub 0x6dec1c -- OZCurve::~OZCurve()  (unwind path)
//   __Unwind_Resume                                 @ Ozone stub 0x6dd07a
//
// RIP-relative constants (raw doubles read out of Ozone's __TEXT):
//   @Ozone 0x7053e0  : double 1.0     (u64 0x3ff0000000000000)   -- movsd 0x65b3cb(%rip),%xmm1 @0xaa00d
//   @Ozone 0x707b58  : double 0.0001  (u64 0x3f1a36e2eb1c432d)   -- movsd 0x65db3b(%rip),%xmm2 @0xaa015
//   min bound        : double 0.0                                 -- xorps %xmm0,%xmm0 @0xaa01d (inline, no rodata slot)
//
// This function does NOT call `OZCurvePercent::OZCurvePercent(double)` from
// ProChannel (that ctor lives at ProChannel 0xabae4). Instead it INLINES the
// same body directly: allocates a fresh 176-byte OZCurvePercent, invokes the
// OZCurve base ctor with the very same three literal bounds (0.0, 1.0, 0.0001)
// plus the caller's initial value `x`, then patches the vtable to Ozone's own
// `__ZTV14OZCurvePercent` (an independent copy from the one in ProChannel), and
// finally wires the shared spline-state singleton exactly as the ProChannel
// ctor does. See raw-port/src/channels/OZCurvePercent.ts for the ProChannel
// mirror.

import { OZCurve } from "./OZCurve.js";
import { OZCurvePercentSplineState } from "./OZCurvePercentSplineState.js";

// -------------------------------- Frontier stubs -------------------------------
//
// Both OZCurve callees below are call-through symbol stubs @Ozone 0x6dec16 /
// 0x6debfe that resolve into ProChannel. The equivalent frontier stubs in
// raw-port/src/channels/OZCurvePercent.ts already document why we can't just
// call the runtime helpers OZCurveRuntime.make_bounds / .setSplineState here
// (they are static-factory shape / need runtime fields the base ctor never
// installed on `this`); we defer via a throwing stub that cites the addr, so
// frontier.py can see the gap. This mirrors OZCurvePercent's convention.

/** OZCurve::OZCurve(double, double, double, double) @Ozone 0x6dec16 (stub -> ProChannel 0x1e494;
 *  __ZN7OZCurveC2Edddd). Call site @0xaa028. Undecoded as an in-place initialiser — a decoded
 *  factory form exists in OZCurveRuntime.make_bounds but does NOT compose with the subclass's
 *  call shape (the C++ ctor mutates `this`, the runtime helper allocates a fresh object). */
function OZCurve_ctor_bounds(
  _self: OZCurve,
  _minVal: number,
  _maxVal: number,
  _step: number,
  _initVal: number,
): void {
  throw new Error("OZCurve::OZCurve(double,double,double,double) @Ozone 0x6dec16 stub -> ProChannel 0x1e494 (__ZN7OZCurveC2Edddd; call site @Ozone 0xaa028; runtime decoded in OZCurveRuntime.ts as static make_bounds — cannot delegate: static-factory shape does not initialise subclass `this` in place) not yet transcribed as an in-place initialiser");
}

/** OZCurve::setSplineState(OZSplineState*) @Ozone 0x6debfe (stub -> ProChannel 0x1ea66;
 *  __ZN7OZCurve14setSplineStateEP13OZSplineState). Call site @0xaa08a. */
function OZCurve_setSplineState(_self: OZCurve, _state: unknown): void {
  throw new Error("OZCurve::setSplineState(OZSplineState*) @Ozone 0x6debfe stub -> ProChannel 0x1ea66 (__ZN7OZCurve14setSplineStateEP13OZSplineState; call site @Ozone 0xaa08a; runtime decoded in OZCurveRuntime.ts as instance method `setSplineState` — cannot delegate: reads splineState + splineNode fields the throwing base ctor never installed on `this`) not yet reachable via this subclass");
}

/** OZCurve::~OZCurve() @Ozone 0x6dec1c (stub -> ProChannel 0x1e77a; __ZN7OZCurveD2Ev).
 *  Called only on the exception unwind path @0xaa0b4. */
function OZCurve_dtor(_self: OZCurve): void {
  throw new Error("OZCurve::~OZCurve() @Ozone 0x6dec1c stub -> ProChannel 0x1e77a (__ZN7OZCurveD2Ev; call site on unwind @Ozone 0xaa0b4; runtime decoded in OZCurveRuntime.ts as instance method `destruct` — cannot delegate: reads runtime fields (extraNodes, recordingNode, splineState) that the throwing base ctor never installed on `this`) not yet reachable via this subclass");
}

/** Ozone-local vtable base for OZCurvePercent. The vptr stored at (this+0x0) is
 *  `&vtable + 0x10`, i.e. it skips the 16-byte Itanium ABI header (offset-to-top +
 *  typeinfo*) and points at the first virtual slot. `__ZTV14OZCurvePercent` is
 *  Ozone-local at 0x835de8 (distinct from ProChannel's copy) — address-only sentinel. */
const OZCurvePercent_Ozone_vtable_plus_0x10: unique symbol = Symbol("Ozone::__ZTV14OZCurvePercent+0x10");

// -----------------------------------------------------------------------------

/**
 * `OZChannelPercent` — sole member is the static factory below.  This class
 * has NO C++ instance state; the mangled name `OZChannelPercent::…` is used
 * purely as a namespace for the free factory.
 */
export class OZChannelPercent {
  /**
   * `OZChannelPercent::createOZChannelPercentCurve(double x)` — @Ozone 0x000a9ff0
   * (__ZN16OZChannelPercent27createOZChannelPercentCurveEd).
   *
   * Faithful transcription (see raw-port/re/disasm/OZChannelPercent.createOZChannelPercentCurve.s):
   *
   *   Prologue (@0xa9ff0..0xa9ffb):
   *     pushq  %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx; subq $0x20,%rsp
   *     movsd  %xmm0, -0x20(%rbp)                 ; spill `x`
   *
   *   Allocate (@0xaa000..0xaa00a):
   *     movl   $0xb0, %edi                         ; sizeof(OZCurvePercent) = 176
   *     callq  __Znwm                              ; rax = ::operator new(176)
   *     movq   %rax, %rbx                          ; rbx = new'd OZCurvePercent*
   *
   *   Set up OZCurve base-ctor arguments (@0xaa00d..0xaa023):
   *     movsd  0x65b3cb(%rip), %xmm1               ; xmm1 = *(0x7053e0) = 1.0    (max)
   *     movsd  0x65db3b(%rip), %xmm2               ; xmm2 = *(0x707b58) = 0.0001 (step)
   *     xorps  %xmm0, %xmm0                         ; xmm0 = 0.0                  (min)
   *     movq   %rax, %rdi                          ; rdi = this (the new'd object)
   *     movsd  -0x20(%rbp), %xmm3                  ; xmm3 = `x` (initial value)
   *
   *   Call OZCurve base ctor (@0xaa028):
   *     callq  __ZN7OZCurveC2Edddd                  ; OZCurve::OZCurve(this, 0.0, 1.0, 0.0001, x)
   *
   *   Install Ozone-local vptr (@0xaa02d..0xaa038):
   *     leaq   __ZTV14OZCurvePercent(%rip), %rax    ; rax = &Ozone::__ZTV14OZCurvePercent (0x835de8)
   *     addq   $0x10, %rax                          ; skip Itanium ABI header
   *     movq   %rax, (%rbx)                         ; (this+0x00) = &vtable + 0x10
   *
   *   std::call_once — init the OZCurvePercentSplineState singleton (@0xaa03b..0xaa072):
   *     movq   0x77810e(%rip), %rax                 ; rax = &_instanceOnceE (ProChannel 0xec3a0)
   *     movq   (%rax), %rax                         ; deref -> current flag value
   *     cmpq   $-0x1, %rax                          ; already ran? (once_flag == -1 => done)
   *     je     0xaa072                              ; skip to consumer if already done
   *     leaq   -0x11(%rbp), %rax                    ; scratch tuple slot A
   *     movq   %rax, -0x30(%rbp)                    ; tuple<lambda&&>[0] = &scratch
   *     leaq   -0x30(%rbp), %rax
   *     movq   %rax, -0x28(%rbp)                    ; tuple[1] = &tuple[0]
   *     movq   0x7780ee(%rip), %rdi                 ; rdi = &_instanceOnceE
   *     leaq   __ZNSt3__117__call_once_proxyB9nqe210106I…lambda…Pv(%rip), %rdx  ; proxy fn @Ozone 0xaa240
   *     leaq   -0x28(%rbp), %rsi                    ; rsi = &tuple[1]
   *     callq  __ZNSt3__111__call_onceERVmPvPFvS2_E ; std::__1::__call_once(flag, tuple, proxy)
   *
   *   Wire the resulting spline state onto `this` (@0xaa072..0xaa08a):
   *     movq   0x7780df(%rip), %rax                 ; rax = &_instanceE (ProChannel 0xec398)
   *     movq   (%rax), %rax                         ; rax = _instanceE (singleton*)
   *     leaq   0x8(%rax), %rsi                      ; rsi = &singleton->field_at_0x8
   *     testq  %rax, %rax
   *     cmoveq %rax, %rsi                            ; if (singleton == NULL) rsi = NULL
   *     movq   %rbx, %rdi                           ; rdi = this
   *     callq  __ZN7OZCurve14setSplineStateEP13OZSplineState  ; this->setSplineState(rsi)
   *
   *   Return (@0xaa08f..0xaa09a):
   *     movq   %rbx, %rax                           ; return this
   *     addq   $0x20,%rsp; popq %rbx; popq %r14; popq %rbp; retq
   *
   *   Unwind path A (@0xaa09b..0xaa0a9) — thrown by OZCurve base ctor before vptr write:
   *     r14 = exc; %rdi = %rbx; callq __ZdlPv (operator delete); callq __Unwind_Resume
   *   Unwind path B (@0xaa0ae..0xaa0c4) — thrown after vptr write (e.g. by setSplineState):
   *     r14 = exc; callq __ZN7OZCurveD2Ev (OZCurve::~OZCurve); callq __ZdlPv; __Unwind_Resume
   *
   * The two unwind edges have distinct entry addresses because the vptr write
   * @0xaa038 is the "transition point": before it, the object is only "raw
   * bytes from operator new" and only operator delete is required; after it,
   * the OZCurve base subobject is fully constructed and must be destructed
   * before the memory is released.  We model both edges in a single try/catch;
   * TS's GC makes the operator delete a no-op but the base-dtor call is
   * observable (it currently throws a frontier error, so the ctor propagates
   * whatever exception it raised — the underlying error from the base ctor is
   * still what surfaces via `e`).
   *
   * Returns: the new OZCurve* (typed as OZCurve because C++ code holds it that
   * way at call sites; the runtime type is OZCurvePercent thanks to the vptr
   * write). If any callee stub throws, this factory propagates the throw and
   * the newly-allocated instance is unreachable (GC'd in TS).
   */
  static createOZChannelPercentCurve(x: number): OZCurve {
    // @0xaa000..0xaa00a: operator new(0xb0) = sizeof(OZCurvePercent) = 176.
    // In TS we materialise the class shape directly; GC owns the memory.
    // We use OZCurve as the base class (the caller-visible return type). The
    // vptr assignment further below records the Ozone-local OZCurvePercent
    // identity, mirroring the C++ leaq/addq/movq write.
    const self: OZCurve & { __vptr?: symbol } = new OZCurve();

    try {
      // @0xaa00d..0xaa028: OZCurve::OZCurve(this, 0.0, 1.0, 0.0001, x).
      //   xmm1 = 1.0    (rodata @Ozone 0x7053e0, u64 0x3ff0000000000000)
      //   xmm2 = 0.0001 (rodata @Ozone 0x707b58, u64 0x3f1a36e2eb1c432d)
      //   xmm0 = 0.0    (inline via xorps %xmm0,%xmm0 @0xaa01d — no rodata slot)
      //   xmm3 = x      (spilled to -0x20(%rbp) @0xaa9ffb, reloaded @0xaa023)
      const MIN_VAL = 0.0;
      const MAX_VAL = 1.0;
      const STEP = 0.0001;
      OZCurve_ctor_bounds(self, MIN_VAL, MAX_VAL, STEP, x); // frontier throw

      // @0xaa02d..0xaa038: install the Ozone-local OZCurvePercent vptr.
      //   __ZTV14OZCurvePercent + 0x10 -> (this+0x00).
      // In TS the vtable identity is opaque (dispatch is done by prototype),
      // so we record it as a Symbol on the object. The Ozone-local and
      // ProChannel-local `__ZTV14OZCurvePercent` symbols are DIFFERENT
      // addresses (0x835de8 vs its ProChannel counterpart); this file uses
      // the Ozone-local one.
      self.__vptr = OZCurvePercent_Ozone_vtable_plus_0x10;

      // @0xaa03b..0xaa06d: std::call_once — initialise the shared
      // OZCurvePercentSplineState singleton (imported from ProChannel).
      // The transcribed helper OZCurvePercentSplineState.getInstance()
      // performs the same one-time init lazily; calling it here mirrors the
      // C++ semantics that the singleton MUST be initialised before the
      // setSplineState call below.
      const s = OZCurvePercentSplineState.getInstance();

      // @0xaa072..0xaa087: compute rsi = (s != NULL) ? &s->field_at_0x8 : NULL.
      //   leaq  0x8(%rax), %rsi   ; rsi = &singleton + 0x8
      //   testq %rax, %rax         ; if (singleton == NULL)
      //   cmoveq %rax, %rsi        ;   rsi = NULL
      // The `s.addr + 0x8` computation is opaque here (the caller —
      // OZCurve::setSplineState — is a frontier throw that never inspects
      // the numeric value); once setSplineState becomes a real in-place
      // initialiser, the +0x8 should be replaced by returning
      // s.splineState_at_0x8 directly. See OZCurvePercent.ts for the same
      // convention.
      const spline = s !== null ? { addr: 0x8 } : null;

      // @0xaa087..0xaa08a: this->setSplineState(spline). Frontier throw.
      OZCurve_setSplineState(self, spline);
    } catch (e) {
      // @0xaa0ae..0xaa0c4 (post-vptr unwind edge): OZCurve::~OZCurve(this)
      // then operator delete + _Unwind_Resume.  In TS the operator delete
      // is a no-op (GC).  Note: if the base-ctor call ABOVE threw before
      // the vptr was installed, the shorter unwind path @0xaa09b..0xaa0a9
      // would run — that skips OZCurve::~OZCurve and only calls operator
      // delete. We collapse both into the same try/catch here: the
      // base-dtor stub will itself throw a frontier error, which we
      // swallow so the caller sees the ORIGINAL error `e` rather than a
      // secondary frontier throw. This preserves the observable failure
      // mode (the caller can't tell whether the operator new completed and
      // the base ctor threw, vs. later stages threw — both surface as
      // "OZCurve::OZCurve @0x… not yet transcribed" today, and the swallow
      // here just prevents that message from being replaced).
      try {
        OZCurve_dtor(self); // frontier throw; both unwind edges converge here in TS.
      } catch (dtorErr) {
        // Base-dtor stub is itself a frontier throw. Preserve `e` — the
        // original ctor / setSplineState failure — as the propagated
        // exception. The `dtorErr` value is intentionally discarded (the
        // C++ unwinder would `std::terminate` on a nested exception, which
        // is a stricter behaviour we cannot faithfully reproduce without a
        // decoded base dtor; the throw stub's very existence records this
        // limitation for frontier.py).
        void dtorErr;
      }
      throw e;
    }

    return self;
  }

  // ===========================================================================
  // OZChannelPercent::createOZChannelPercent0Impl() — @ProChannel 0xab4b4
  // (__ZN16OZChannelPercent27createOZChannelPercent0ImplEv)
  //
  // FULL DISASM
  // (raw-port/re/disasm/ProChannel.__ZN16OZChannelPercent27createOZChannelPercent0ImplEv.s):
  //   0xab4b4  movq  _OZChannelPercent0Impl_once(%rip), %rax
  //   0xab4bb  cmpq  $-0x1, %rax                  ; libc++ complete sentinel
  //   0xab4bf  je    0xab4f3                       ; fast path -> return
  //   0xab4c1  pushq %rbp / movq %rsp,%rbp
  //   0xab4c5  subq  $0x20, %rsp                   ; tuple<lambda&&> frame
  //   0xab4c9  leaq  -0x1(%rbp), %rax              ; &captureless-lambda slot
  //   0xab4cd  leaq  -0x18(%rbp), %rcx / movq %rax,(%rcx)  ; tuple.head=&lambda
  //   0xab4d4  leaq  -0x10(%rbp), %rsi / movq %rcx,(%rsi)  ; *arg=&tuple
  //   0xab4db  leaq  _OZChannelPercent0Impl_once(%rip), %rdi ; arg0=&once
  //   0xab4e2  leaq  __call_once_proxy<...>(%rip), %rdx      ; arg2=&proxy
  //   0xab4e9  callq std::__call_once               ; libc++ stub @0xacdc8
  //   0xab4ee  addq  $0x20,%rsp / popq %rbp
  //   0xab4f3  movq  _OZChannelPercent0Impl(%rip), %rax     ; return the singleton
  //   0xab4fa  retq
  //
  // Standard libc++ std::call_once singleton (same __call_once function + tuple
  // ABI as createOZChannelPercentCurve's spline-state init; sentinel -1n). The
  // allocation/ctor that produces _OZChannelPercent0Impl lives INSIDE the init
  // lambda (dispatched by the proxy) — a SEPARATE ledger unit — so no `new` is
  // fabricated here. BSS slots + proxy stub follow the class below.
  // ===========================================================================

  /**
   * `OZChannelPercent::createOZChannelPercent0Impl()` — @ProChannel 0xab4b4.
   * Faithful transcription of the disassembly above:
   *   1. Read _OZChannelPercent0Impl_once; if == -1n (complete), skip to 3.
   *   2. Set up the libc++ tuple<lambda&&> ABI slots and call
   *      std::__call_once(&once, arg, &proxy); the proxy dispatches the init
   *      lambda that allocates/constructs the singleton and writes it into
   *      _OZChannelPercent0Impl.
   *   3. Return _OZChannelPercent0Impl.
   * The @0xab4c9..0xab4d8 tuple + captureless-lambda dance is a libc++-ABI
   * artefact (a stable void* for the proxy to dispatch through); in the
   * single-threaded JS model the proxy is invoked directly so the intermediate
   * slots have no observable effect (documented for provenance only).
   */
  static createOZChannelPercent0Impl(): unknown {
    // @0xab4b4..0xab4bf — if (_OZChannelPercent0Impl_once == -1) goto return.
    if (_OZChannelPercent0Impl_once !== -1n) {
      // @0xab4c1..0xab4e9 — libc++ tuple ABI setup + callq std::__call_once.
      std_call_once_percent0Impl(
        {
          get: (): bigint => _OZChannelPercent0Impl_once, // movq _once(%rip),%rax @0xab4b4
          set: (v: bigint): void => {
            _OZChannelPercent0Impl_once = v;
          },
        },
        null, // ABI void* — real disasm passes &tuple; our proxy ignores it.
        __call_once_proxy_createOZChannelPercent0Impl_lambda, // @0xab4e2 rdx=&proxy
      );
    }
    // @0xab4f3..0xab4fa — rax = _OZChannelPercent0Impl; retq.
    return _OZChannelPercent0Impl;
  }
}

// ===========================================================================
// Process-global BSS slots for createOZChannelPercent0Impl() — one 8-byte
// word each. TS has no linker, so model as module-scope `let`s. BSS is
// zero-filled at load: _once = 0n, _value = null.
// ===========================================================================

/** @ProChannel BSS
 *  `__ZZN16OZChannelPercent27createOZChannelPercent0ImplEvE27_OZChannelPercent0Impl_once`
 *  libc++ std::once_flag word. 0n = not started; -1n = completed. Compared to
 *  $-1 @0xab4bb as the fast-path check. */
let _OZChannelPercent0Impl_once: bigint = 0n; // @ProChannel BSS 0xab4b4 read-site

/** @ProChannel BSS
 *  `__ZN16OZChannelPercent22_OZChannelPercent0ImplE`
 *  Singleton Impl pointer. Read @0xab4f3 (return). Written by the
 *  __call_once_proxy lambda (SEPARATE ledger unit). */
let _OZChannelPercent0Impl: unknown = null; // @ProChannel BSS 0xab4f3

/**
 * `std::__1::__call_once(flag&, void* arg, void(*)(void*))` — libc++.
 * Called from createOZChannelPercent0Impl @0xab4e9 via ProChannel stub
 * 0xacdc8. TRUE out-of-scope extern (libc++ runtime). Single-threaded JS
 * model: on first call with a non-complete flag invoke proxy(arg); on
 * success write -1n; on subsequent calls no-op. If the proxy throws, the
 * flag stays 0n and future calls retry — matching libc++'s ~0UL-on-success
 * semantics.
 */
function std_call_once_percent0Impl(
  once: { get(): bigint; set(v: bigint): void },
  arg: unknown,
  proxy: (arg: unknown) => void,
): void {
  if (once.get() === -1n) return; // libc++ fast-path (mirrors 0xab4bb)
  proxy(arg);
  once.set(-1n);
}

/**
 * `__ZNSt3__117__call_once_proxy<...OZChannelPercent::createOZChannelPercent0Impl()::lambda...>`
 * — libc++ template instantiation. NOT called directly — PASSED AS A DATA
 * REFERENCE (leaq @0xab4e2) to __call_once, which dispatches through it. Its
 * body dispatches into the createOZChannelPercent0Impl lambda, which allocates
 * a fresh OZChannelPercent0Impl via `operator new`, initialises it, and stores
 * the result into `_OZChannelPercent0Impl`. SEPARATE ledger entry — raises
 * with the exact call-site @0xADDR so downstream code cannot silently rely on
 * an un-ported singleton.
 */
function __call_once_proxy_createOZChannelPercent0Impl_lambda(_arg: unknown): void {
  throw new Error(
    "OZChannelPercent::createOZChannelPercent0Impl() __call_once init lambda " +
      "not yet transcribed — the lambda body allocates via operator new " +
      "(__Znwm ProChannel stub) and initialises the OZChannelPercent0Impl " +
      "(SEPARATE ledger entry, status: todo) then stores the result into " +
      "_OZChannelPercent0Impl. The proxy is invoked from std::__call_once at " +
      "ProChannel 0xab4e9.",
  );
}
