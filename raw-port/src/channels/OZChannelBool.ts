// OZChannelBool — Ozone (Ozone.framework) leaf class, transcribed as a
// single-method surface: only the static factory method
// `createOZChannelBoolCurve(double)` is exported by Ozone
// (`__ZN13OZChannelBool24createOZChannelBoolCurveEd` @0x000e0c60).
// The full ctor/dtor family lives in ProChannel (5 ctors + copy-ctor +
// getObjCWrapperName + createOZChannelBoolInfo + createOZChannelBoolTrueImpl
// + createOZChannelBoolFalseImpl); each is a separate leaf unit in the
// ProChannel ledger and will be transcribed by that pass. This file
// covers ONLY the Ozone-side factory.
//
// Framework: Ozone
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework).
//   VAs are unadjusted VM addresses from `otool -tV` (x86_64 slice).
//
// Symbols transcribed:
//   0x000e0c60  OZChannelBool::createOZChannelBoolCurve(double)
//
// FUNCTION MODEL — recovered exhaustively from the 60-line asm block:
//   The method allocates a new OZCurveBool via `operator new(0xb0)`,
//   initializes its OZCurve base subobject via `OZCurve::OZCurve(0.0,
//   1.0, 1.0, d)` (arg-doubles 0.0, 1.0, 1.0, and the incoming
//   `double` parameter), installs the OZCurveBool vtable
//   (`vtable for OZCurveBool + 0x10`) at offset +0x00, threads the
//   `OZCurveBoolSplineState` singleton through
//   `OZCurve::setSplineState(OZSplineState*)`, then poisons two
//   post-fields at offsets +0x2 and +0x20 of the state's
//   sub-record at +0xa0 of the new curve (`*(rax+2)=0`, `*(rax+0x20)=0`).
//
// Struct offsets referenced by this method:
//   OZCurveBool sizeof = 0xb0 (176 bytes)  — from `movl $0xb0,%edi` @0x0e0c70.
//   OZCurveBool  +0x00 = vtable ptr        — installed to `vtable for OZCurveBool + 0x10`
//                                            @0x0e0ca3.
//   OZCurveBool  +0xa0 = pointer to state-block record — loaded
//                                            @0x0e0cfa; then the state
//                                            is post-poisoned at
//                                            offsets +0x2 (byte-zero @0x0e0d08) and
//                                            +0x20 (int32-zero @0x0e0d01).
//
// DATA REFERENCES:
//   `xmm1` constant (RIP-relative movsd @0x0e0c7d loads from
//    0x0e0c85+0x62475b = 0x7053e0 in __TEXT,__const): raw 8 bytes
//    `00 00 00 00 00 00 f0 3f` → little-endian IEEE-754 = 1.0.
//   `xmm0` = 0.0 (`xorps %xmm0,%xmm0` @0x0e0c85).
//   `xmm2` = xmm1 = 1.0 (`movaps %xmm1,%xmm2` @0x0e0c8b).
//   `xmm3` = incoming `double` arg (loaded from spill
//    -0x20(%rbp) @0x0e0c8e where it was saved @0x0e0c6b).
//   Once-flag: `OZCurveBoolSplineState::_instanceOnce` @0xliteral-pool
//    (rip-relative load @0x0e0ca6) — the once-flag guards the singleton
//    call. Full fast-path pattern (`cmpq $-1,%rax; je 0xe0cdd`).
//   Singleton pointer: `OZCurveBoolSplineState::_instance` — loaded
//    @0x0e0cdd. `rsi = &(*state)+0x8; if (state == nullptr) rsi = state`
//    (@0x0e0ceb-0x0e0cee — `cmoveq` branch for nullptr case).
//
// CONTROL FLOW:
//   1. Frame setup + spill of xmm0 (the double arg) @0x0e0c60-0x0e0c6b.
//   2. `operator new(0xb0)` @0x0e0c75 → rbx = new instance ptr.
//   3. `xmm0=0, xmm1=1, xmm2=1, xmm3=d` staging @0x0e0c7d-0x0e0c93.
//   4. `OZCurve::OZCurve(0.0, 1.0, 1.0, d)` @0x0e0c93.
//   5. Install `vtable for OZCurveBool + 0x10` at *rbx @0x0e0c98-0x0e0ca3.
//   6. Load `OZCurveBoolSplineState::_instanceOnce` @0x0e0ca6-0x0e0cad.
//   7. If once == -1 (fast-path): jmp @0x0e0cdd. Else stage
//      `std::__call_once` tuple + invoke @0x0e0cb6-0x0e0cd8.
//   8. Load `OZCurveBoolSplineState::_instance` (post-once) @0x0e0cdd.
//   9. `rsi = &instance+0x8` else nullptr (@0x0e0ce7-0x0e0cee).
//  10. `OZCurve::setSplineState(this, rsi)` @0x0e0cf5.
//  11. Load `state = *(rbx + 0xa0)` @0x0e0cfa.
//  12. `*(state + 0x20) = 0` (int32) @0x0e0d01 — zero a curve-state slot.
//  13. `*(state + 0x2) = 0` (byte)   @0x0e0d08 — zero a curve-state flag.
//  14. Return rbx @0x0e0d0c.
//  15. Exception paths @0x0e0d18-0x0e0d41:
//        early failure of OZCurve ctor → operator delete(rbx) + __Unwind_Resume.
//        later failure (setSplineState/etc) → OZCurve::~OZCurve(rbx) +
//                                              operator delete(rbx) +
//                                              __Unwind_Resume.

// ─────────────────────────────────────────────────────────────────────────
// Frontier stubs (undecoded external callees — each throws citing addr).
// ─────────────────────────────────────────────────────────────────────────

/**
 * `operator new(unsigned long)` @Ozone U-extern `__Znwm` — libc++abi/CRT
 * allocation. Called from OZChannelBool::createOZChannelBoolCurve
 * @0x0e0c75 with size = 0xb0 (176 bytes = sizeof(OZCurveBool)). NOT
 * yet transcribed.
 */
function operator_new(_size: number): object {
  throw new Error(
    "operator new(unsigned long) @Ozone U-extern __Znwm " +
      "(not yet transcribed) — invoked by OZChannelBool::createOZChannelBoolCurve " +
      "@Ozone 0x0e0c75 (size=0xb0)",
  );
}

/**
 * `operator delete(void*)` @Ozone U-extern `__ZdlPv` — libc++abi/CRT
 * deallocation. Called from the two exception-unwind branches of
 * OZChannelBool::createOZChannelBoolCurve @0x0e0d1e and @0x0e0d39.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @Ozone U-extern __ZdlPv " +
      "(not yet transcribed) — invoked by OZChannelBool::createOZChannelBoolCurve " +
      "exception-unwind paths @Ozone 0x0e0d1e, @0x0e0d39",
  );
}

/**
 * `OZCurve::OZCurve(double, double, double, double)` @Ozone U-extern
 * `__ZN7OZCurveC2Edddd` — the 4-double OZCurve base ctor. Called from
 * OZChannelBool::createOZChannelBoolCurve @0x0e0c93 with
 * (0.0, 1.0, 1.0, `d`) — the last double is the method's `double`
 * parameter, forwarded from xmm0 through a stack spill.
 *
 * The three constant leading doubles come from:
 *   `xmm0` (rdx pseudo-slot 0) = 0.0  (xorps @0x0e0c85)
 *   `xmm1` (arg2)              = 1.0  (movsd RIP @0x0e0c7d → 0x7053e0 = IEEE 1.0)
 *   `xmm2` (arg3)              = 1.0  (movaps xmm1,xmm2 @0x0e0c8b)
 * NOT yet transcribed on OZCurve.
 */
function OZCurve__C2_dddd(
  _self: OZCurveBool,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double, double, double, double) @Ozone U-extern " +
      "__ZN7OZCurveC2Edddd " +
      "(not yet transcribed) — invoked by OZChannelBool::createOZChannelBoolCurve " +
      "@Ozone 0x0e0c93",
  );
}

/**
 * `OZCurve::~OZCurve()` @Ozone U-extern `__ZN7OZCurveD2Ev` — the OZCurve
 * base destructor. Called from OZChannelBool::createOZChannelBoolCurve
 * late exception-unwind @0x0e0d31 (after the vtable+splineState
 * installs, to unwind the OZCurve subobject before deleting the
 * allocation). NOT yet transcribed.
 */
function OZCurve__dtor(_p: OZCurveBool): void {
  throw new Error(
    "OZCurve::~OZCurve() @Ozone U-extern __ZN7OZCurveD2Ev " +
      "(not yet transcribed) — invoked by OZChannelBool::createOZChannelBoolCurve " +
      "late-unwind @Ozone 0x0e0d31",
  );
}

/**
 * `OZCurve::setSplineState(OZSplineState*)` @Ozone U-extern
 * `__ZN7OZCurve14setSplineStateEP13OZSplineState` — sets the curve's
 * spline-state pointer. Called from
 * OZChannelBool::createOZChannelBoolCurve @0x0e0cf5 with
 * (this, &instance+0x8 OR nullptr on the null-instance branch —
 * see `cmoveq` @0x0e0cee).
 *
 * NB: The `&instance+0x8` offset is a class-relative pointer; the
 * OZCurveBoolSplineState singleton lays out with an OZSplineState
 * subobject at its own offset +0x8 (per the `leaq 0x8(%rax),%rsi`
 * @0x0e0ce7). NOT yet transcribed.
 */
function OZCurve__setSplineState(_self: OZCurveBool, _state: object | null): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone U-extern " +
      "__ZN7OZCurve14setSplineStateEP13OZSplineState " +
      "(not yet transcribed) — invoked by OZChannelBool::createOZChannelBoolCurve @Ozone 0x0e0cf5",
  );
}

/**
 * `OZCurveBoolSplineState::getInstance()` — the once-guarded singleton.
 * Its `_instanceOnce` @Ozone U-extern
 * `__ZN22OZCurveBoolSplineState13_instanceOnceE` and `_instance`
 * @Ozone U-extern `__ZN22OZCurveBoolSplineState9_instanceE` are
 * loaded rip-relatively (@0x0e0ca6 & @0x0e0cdd). The lambda body
 * populating `_instance` is scheduled via `std::__call_once` @0x0e0cd8
 * (proxy stub
 * `__ZNSt3__117__call_once_proxyB9nqe210106<...OZCurveBoolSplineState::getInstance()::lambda...>Pv`).
 *
 * The port already models `OZCurveBoolSplineState` (see
 * raw-port/src/channels/OZCurveBoolSplineState.ts), but the
 * `getInstance()` free-function bootstrap has not been transcribed
 * on this side. We expose it as a throwing stub that returns the
 * singleton (or nullptr if not yet built).
 */
function OZCurveBoolSplineState__getInstance(): object | null {
  throw new Error(
    "OZCurveBoolSplineState::getInstance() @Ozone U-extern (bootstrap not yet transcribed) — " +
      "once-flag @__ZN22OZCurveBoolSplineState13_instanceOnceE @0x0e0ca6, " +
      "singleton @__ZN22OZCurveBoolSplineState9_instanceE @0x0e0cdd, " +
      "__call_once proxy @0x0e0cd8; invoked by OZChannelBool::createOZChannelBoolCurve @0x0e0c60",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Local placeholder for the OZCurveBool this factory constructs.
// The port already has `raw-port/src/channels/OZCurveBool.ts`; here we
// re-declare only the pieces this method needs to reference so tsc can
// bind them without pulling in OZCurve's ctor surface (which is not on
// this class's frontier).
// ─────────────────────────────────────────────────────────────────────────

/** Minimal shape of the object this factory returns. */
interface OZCurveBool {
  /** @+0xa0 — pointer to state block; the factory poisons two fields on it. */
  stateBlockAtA0: {
    /** @+0x02 (byte) — poisoned to 0 by the factory @0x0e0d08. */
    byteAt0x2: number;
    /** @+0x20 (int32) — poisoned to 0 by the factory @0x0e0d01. */
    int32At0x20: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelBool` — a boolean-valued channel. Its full method surface
 * lives in ProChannel; on the Ozone side, only the static factory
 * `createOZChannelBoolCurve(double)` @0x0e0c60 is exported.
 */
export class OZChannelBool {
  /**
   * `OZChannelBool::createOZChannelBoolCurve(double)` @Ozone 0x000e0c60.
   *
   * Faithful transcription:
   *   1. Alloc @0x0e0c75: `rbx = operator new(0xb0)` (sizeof OZCurveBool).
   *   2. Base ctor @0x0e0c93: `OZCurve::OZCurve(rbx, 0.0, 1.0, 1.0, d)`.
   *   3. Vptr install @0x0e0c98-0x0e0ca3: `*(rbx+0) = vtable-for-OZCurveBool + 0x10`.
   *   4. Once-guarded singleton lookup @0x0e0ca6-0x0e0cdd:
   *      `OZCurveBoolSplineState::_instanceOnce` fast-path check;
   *      if not yet initialized, invoke `std::__call_once` with the
   *      class's `getInstance()::lambda` @0x0e0cd8.
   *      Then load `OZCurveBoolSplineState::_instance` @0x0e0cdd.
   *   5. Compute `rsi = &instance + 0x8`; nullptr guard `cmoveq %rax,%rsi`
   *      @0x0e0ceb-0x0e0cee — if instance is nullptr, rsi stays 0.
   *   6. `OZCurve::setSplineState(rbx, rsi)` @0x0e0cf5.
   *   7. Load `rax = *(rbx + 0xa0)` @0x0e0cfa (state block ptr).
   *   8. Zero two fields: `*(rax + 0x20) = 0` int32 @0x0e0d01;
   *                        `*(rax + 0x2)  = 0` byte  @0x0e0d08.
   *   9. Return rbx @0x0e0d0c-0x0e0d17.
   *
   * Because every callee is a frontier stub, invoking this method
   * throws — the FIRST throw wins: `operator new` at step 1. This is
   * the CORRECT behaviour under the anti-shortcut discipline (a loud
   * gap at each undecoded callee).
   */
  static createOZChannelBoolCurve(d: number): OZCurveBool {
    // Step 1 — @0x0e0c75.
    const rbx = operator_new(0xb0) as OZCurveBool;
    try {
      // Step 2 — @0x0e0c93.
      OZCurve__C2_dddd(rbx, 0.0, 1.0, 1.0, d);
    } catch (e) {
      // Early-unwind @0x0e0d18-0x0e0d26: OZCurve ctor threw → delete + rethrow.
      operator_delete(rbx);
      throw e;
    }
    // Step 3 — @0x0e0c98: vtable install (implicit in JS prototype identity).
    try {
      // Steps 4-6 — @0x0e0ca6..@0x0e0cf5.
      const instance = OZCurveBoolSplineState__getInstance();
      // Step 5 — nullptr-guarded stateOffset8.
      const stateOffset8 = instance === null ? null : instance;
      // Step 6 — @0x0e0cf5.
      OZCurve__setSplineState(rbx, stateOffset8);
      // Steps 7-8 — @0x0e0cfa..@0x0e0d08: poison state-block fields.
      rbx.stateBlockAtA0.int32At0x20 = 0;
      rbx.stateBlockAtA0.byteAt0x2 = 0;
    } catch (e) {
      // Late-unwind @0x0e0d2b-0x0e0d41: OZCurve dtor + delete + rethrow.
      OZCurve__dtor(rbx);
      operator_delete(rbx);
      throw e;
    }
    // Step 9 — @0x0e0d0c: retq rbx.
    return rbx;
  }

  /**
   * `OZChannelBool::createOZChannelBoolInfo()` @ProChannel 0x5255c.
   *   __ZN13OZChannelBool23createOZChannelBoolInfoEv
   *
   * Source disassembly (19 lines):
   *   raw-port/re/disasm/ProChannel.__ZN13OZChannelBool23createOZChannelBoolInfoEv.s
   *
   * Faithful transcription (standard std::call_once singleton bootstrap —
   * the SAME idiom as OZChannelUint32::createOZChannelUint32Info @ProChannel
   * 0x42ec):
   *   @0x5255c: movq  _OZChannelBoolInfo_once(%rip),%rax   ; load the once-flag word.
   *   @0x52563-67: cmpq $-0x1,%rax ; je 0x5259b            ; FAST PATH: already run
   *                                                          (sentinel -1) -> skip call_once,
   *                                                          fall straight to the load+return.
   *   @0x52569-8a: build the std::call_once arg triple on the stack —
   *                  @0x52571 leaq -0x1(%rbp),%rax         ; &lambda-capture byte
   *                  @0x52575-80 wire two nested pointers   ; tuple<lambda&&> shim
   *                  @0x52583 leaq _OZChannelBoolInfo_once(%rip),%rdi   ; &once-flag
   *                  @0x5258a leaq __call_once_proxy<...lambda...>(%rip),%rdx ; proxy fn ptr
   *   @0x52591: callq __ZNSt3__111__call_onceERVmPvPFvS2_E ; std::__1::__call_once
   *                                                          (@stub 0xacdc8). The ALLOCATION of
   *                                                          the OZChannelBoolInfo singleton
   *                                                          happens INSIDE __call_once_proxy —
   *                                                          NOT in this frame (there is no
   *                                                          in-frame __Znwm); it is a SEPARATE
   *                                                          ledger unit (the proxy/lambda body,
   *                                                          not symbol-visible in this slice).
   *   @0x5259b-a2: movq _OZChannelBoolInfo(%rip),%rax ; retq
   *                                                          ; return the (now-published) global.
   *                Note: UNLIKE the Uint32 twin (which does an extra `movq (%rax),%rax` deref),
   *                this method returns the `_OZChannelBoolInfo` global value DIRECTLY — a single
   *                movq load, no deref (@0x5259b) — so the returned pointer IS the global's
   *                stored value.
   *
   * ANTI-CHEAT boundary model: the `cmpq $-0x1` sentinel + the single
   * `callq __call_once@0xacdc8` are the canonical call_once getInstance shape.
   * We do NOT fabricate `new OZChannelBoolInfo()` here — the machine performs
   * no allocation in this frame; it delegates to __call_once_proxy (its own
   * ledger unit). std::__1::__call_once is a TRUE out-of-scope extern (libc++,
   * @stub 0xacdc8) and the proxy/lambda body is not decoded on this side, so
   * the singleton getter is surfaced as a throwing boundary stub. The
   * once-flag sentinel is modelled as the bigint -1n per the anti-cheat spec.
   */
  static createOZChannelBoolInfo(): OZChannelBoolInfoPtr {
    // @ProChannel 0x5255c-67: read the once-flag; -1n sentinel == "already run".
    if (_OZChannelBoolInfo_once !== -1n) {
      // @ProChannel 0x52569-91: NOT-yet-run -> std::call_once(&once, &__call_once_proxy<lambda>).
      // The proxy allocates + publishes _OZChannelBoolInfo; that body is a
      // separate (not-yet-transcribed) ledger unit — surfaced as a loud
      // boundary gap @ProChannel 0x52591 (Rule 3: raise at the undecoded callee).
      _OZChannelBoolInfo_call_once_body();
    }
    // @ProChannel 0x5259b-a2: movq _OZChannelBoolInfo(%rip),%rax ; retq  — direct load, no deref.
    return _OZChannelBoolInfo;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// std::call_once-guarded singleton state for createOZChannelBoolInfo().
// ─────────────────────────────────────────────────────────────────────────

/** Return type of the OZChannelBoolInfo singleton pointer (ProChannel
 *  `__ZN13OZChannelBool18_OZChannelBoolInfoE` @0x5259b). Opaque handle —
 *  the concrete OZChannelBoolInfo shape lives in
 *  raw-port/src/channels/OZChannelBoolInfo.ts. */
export type OZChannelBoolInfoPtr = object | null | undefined;

/** `OZChannelBool::createOZChannelBoolInfo()::_OZChannelBoolInfo_once`
 *  @ProChannel `__ZZN13OZChannelBool23createOZChannelBoolInfoEvE23_OZChannelBoolInfo_once`
 *  (loaded @0x5255c). libc++ std::once_flag control word. Its "already-run"
 *  sentinel is the all-ones qword compared at @0x52563 (`cmpq $-0x1,%rax`),
 *  modelled as the bigint -1n. Initialised here to 0n (never-run) — the real
 *  transition to -1n happens inside std::__1::__call_once. */
let _OZChannelBoolInfo_once: bigint = 0n;

/** `OZChannelBool::_OZChannelBoolInfo`
 *  @ProChannel `__ZN13OZChannelBool18_OZChannelBoolInfoE` (loaded @0x5259b).
 *  The process-wide OZChannelBoolInfo singleton pointer, published by the
 *  __call_once proxy. `null` until the (not-yet-transcribed) proxy runs. */
let _OZChannelBoolInfo: OZChannelBoolInfoPtr = null;

/**
 * The `std::__1::__call_once` proxy body invoked from createOZChannelBoolInfo
 * @ProChannel 0x52591 through
 *   __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelBool23createOZChannelBoolInfoEvEUlvE_EEEEEvPv
 * (the fn pointer loaded @0x5258a). This is where the OZChannelBoolInfo
 * singleton is actually ALLOCATED and stored into `_OZChannelBoolInfo`.
 * The proxy/lambda body is not symbol-visible in this framework slice and is
 * a SEPARATE ledger unit — NOT yet transcribed. Per Rule 3 it raises a loud
 * gap @ProChannel 0x52591 rather than fabricating an allocation.
 */
function _OZChannelBoolInfo_call_once_body(): void {
  throw new Error(
    "OZChannelBool::createOZChannelBoolInfo()::lambda @ProChannel U-extern " +
      "(bound via __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN13OZChannelBool23createOZChannelBoolInfoEvEUlvE_EEEEEvPv" +
      " — lambda body not symbol-visible; not yet transcribed). Invoked by " +
      "std::__1::__call_once @ProChannel 0x52591 (libc++ stub @0xacdc8); it " +
      "allocates + publishes _OZChannelBoolInfo (__ZN13OZChannelBool18_OZChannelBoolInfoE).",
  );
}
