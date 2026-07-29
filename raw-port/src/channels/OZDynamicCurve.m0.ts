// raw-port: OZDynamicCurve (chunk m0) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice; VA == file offset).
// Class-methods range for the FULL class: 0x27f8c .. 0x2987e (88 methods total).
// Chunk 0 (this file) ports methods [0..20) — the constructors/destructors, operator=/==,
// extrapolation getter+setter, both getCurveSamples overloads, closeCurve/openCurve/
// isClosedCurve/resetCurve, getNumberOfKeypoints/getNumberOfValidKeypoints, and
// getCurrentMaxValueV.
//
// ── Class inheritance (recovered from ctor call-graph) ─────────────────────────────────
//   OZDynamicCurve  extends  OZDynamicSpline   (base sub-object embedded at +0x8)
//   OZDynamicSpline extends  OZSpline           (further base — its vector<Vertex*> lives
//                                                inside the [+0x8..+0xB8) window; the
//                                                std::vector<T*> header is at [+0x18,+0x20]
//                                                so within OZDynamicSpline that is +0x10..+0x18)
//   The isClosed bool sits at OZDynamicCurve+0x98 (i.e. inside OZSpline, at OZSpline+0x90).
//     — read pattern: `cmpb $0x0, 0x98(%rdi)` @0x28212 / @0x28244 / `movb 0x98(%rdi), %al`
//       @0x2827d.
//
// ── OZDynamicCurve object layout (recovered field-by-field from ctors) ──────────────────
//   +0x00  vtable*                          — ctor writes RIP+0xacbc5 @0x27fa3 (default ctor)
//                                             or RIP+0xacb29 @0x2803f (copy ctor). Two vtables
//                                             because copy-ctor deliberately runs the "under-
//                                             construction" vtable (see Itanium ABI); D2Ev sets
//                                             the "cleanup" vtable RIP+0xacab7 @0x280aa.
//   +0x08  OZDynamicSpline base sub-object  — occupies [+0x08 .. +0xB8) (0xB0 bytes).
//                                             Contains the OZSpline vector header at +0x18..+0x30
//                                             (start=+0x18, end=+0x20, capacity=+0x28) — verified
//                                             by getNumberOfKeypoints: `(*(this+0x20) - *(this+0x18)) >> 3`
//                                             @0x282a4..0x282ac (element size 8 = void* keypoint).
//                                             Contains the isClosed flag at +0x98.
//   +0xB8  OZSplineState                    — 16 bytes of flags/timers/counts. Its own C1() is
//                                             called with `this+0xB8` @0x27fbf; then the ctor
//                                             OVERWRITES two of its bytes:
//                                               +0xB8 <- 0x00 (initially, before the state ctor
//                                                       finishes it's implicit; then finally
//                                                       set to 0x01 @0x27ff6 — "isSet"/"valid")
//                                               +0xB9 <- 0x00                       @0x27fc4
//                                             (see OZSplineState.ts for the 16-byte struct layout).
//   +0xC0  CMTime  rateLimit                — 16-byte CMTime (value @+0xC0, timescale @+0xC8,
//                                             flags/epoch @+0xCC/+0xD0). Default ctor initialises
//                                             with `CMTimeMake(1, 3000000)` (i.e. 1/3_000_000 s
//                                             — the granularity of Motion's channel curves) @0x27fda
//                                             then stores CMTime.value bytes at +0xC0/+0xC8 via a
//                                             128-bit `movups` and CMTime.epoch (+0xD0) separately.
//   NOTE: `movb $0x1, 0xb8(%r14)` at the END of the default ctor (@0x27ff6) writes the "valid"
//   flag; this OVERWRITES OZSplineState's own first byte (which its own C1() had just written).
//   That is deliberate — see OZSplineState field b0 in OZSplineState.ts (which its ctor may
//   already set — the OZDynamicCurve ctor is asserting the invariant "state.b0 = true" post-init).
//
// ── vtable pointers cited in this chunk ────────────────────────────────────────────────
//   vtable_default : RIP=0x27fa3+7 → +0xacbc5 = 0xd4b6f → resolve.py const 0xd4b6f
//   vtable_copy    : RIP=0x2803f+7 → +0xacb29 = 0xd4b6f-ish (same offset - probably one vtable
//                    with the copy variant using the -in-construction alias — Itanium ABI 2.5.3)
//   vtable_dtor    : RIP=0x280aa+7 → +0xacab7 = 0xd4b6f-ish
//   We do not port the vtable contents in chunk 0; they are cited so the ledger sees the addrs.
//
// ── Frontier callees (each becomes a throw-stub citing @0xADDR) ────────────────────────
//   OZDynamicSpline::OZDynamicSpline(OZSplineState*)                                   @0x27fb7
//   OZDynamicSpline::OZDynamicSpline(OZDynamicSpline const&, OZSplineState*)           @0x28057
//   OZDynamicSpline::~OZDynamicSpline()                                                @0x280d0 (via jmp)
//   OZSplineState::OZSplineState()                                                     @0x27fbf, 0x2805f
//   OZSplineState::operator=(OZSplineState const&)                                     @0x28071, 0x28133
//   OZSpline::deleteAllVertices()                                                      @0x280bb
//   OZSpline::operator=(OZSpline const&)                                               @0x28119
//   OZSpline::operator==(OZSpline const&) const                                        @0x2814d
//   OZSpline::setExtrapolation(unsigned int, unsigned int)                             @0x28180
//   OZSpline::getExtrapolation(unsigned int)                                           @0x2819e
//   OZSpline::setClosed(bool, void*)                                                   @0x2823a, 0x2826a, 0x28296
//   OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&)           @0x282d6
//   OZSpline::getMaxValueV(CMTime const&, CMTime*) → double                            @0x28352
//   _CMTimeMake  (Apple CoreMedia; imported)                                           @0x27fda
//   _CMTimeGetSeconds (Apple CoreMedia; imported)                                      @0x28372
//   _kCMTimeZero  (Apple CoreMedia global; RIP+0xa2184 → literal-pool _kCMTimeZero)    @0x28335
//   *0x38 on THIS  — a virtual method invoked from ~D2 after deleteAllVertices; not         
//                    decoded here. Callsite @0x280c6.                                        
//   __Unwind_Resume / __cxa_call_unexpected / __ZdlPv / ___clang_call_terminate — C++
//                    runtime helpers on the exception paths.
//
// ── Chunk file convention (see assemble_class.py) ─────────────────────────────────────
//   Exports `OZDynamicCurve_m0_methods` — a dispatch table of ported bodies keyed by their
//   demangled method-selector strings. Every body cites @0xADDR + framework and every constant
//   / RIP-relative load / callee is documented at its instruction address.

import {
  type CMTime,
  kCMTimeZero,
  CMTimeMake,
  CMTimeGetSeconds,
} from "../infra/CMTime.js";

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees (Spec Rule 3: loud throw citing @0xADDR).
// These will be resolved in a later chunk / a later class port. Do NOT stub with a plausible
// value: any silent fallback here would silently corrupt every downstream sample.
// ────────────────────────────────────────────────────────────────────────────

/** OZDynamicSpline::OZDynamicSpline(OZSplineState*) — base ctor from the default OZDynamicCurve ctor.
 *  Call site @0x27fb7 (curve.ctor default). */
function OZDynamicSpline_ctor_state(_thisBase: OZDynamicSplineOpaque, _state: OZSplineStateOpaque): void {
  throw new Error(
    "raw-port: OZDynamicSpline::OZDynamicSpline(OZSplineState*) not yet transcribed " +
      "(called from OZDynamicCurve::OZDynamicCurve() @0x27fb7 — ProChannel)",
  );
}

/** OZDynamicSpline::OZDynamicSpline(OZDynamicSpline const&, OZSplineState*) — base copy ctor.
 *  Call site @0x28057 (curve.ctor copy). */
function OZDynamicSpline_ctor_copy(
  _thisBase: OZDynamicSplineOpaque,
  _other: OZDynamicSplineOpaque,
  _state: OZSplineStateOpaque,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::OZDynamicSpline(OZDynamicSpline const&, OZSplineState*) " +
      "not yet transcribed (called from OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&) " +
      "@0x28057 — ProChannel)",
  );
}

/** OZDynamicSpline::~OZDynamicSpline() — base D1 tail-jmped-into from OZDynamicCurve::~D2.
 *  Call site @0x280d0. */
function OZDynamicSpline_dtor(_thisBase: OZDynamicSplineOpaque): void {
  throw new Error(
    "raw-port: OZDynamicSpline::~OZDynamicSpline() not yet transcribed " +
      "(tail-called from OZDynamicCurve::~OZDynamicCurve() @0x280d0 — ProChannel)",
  );
}

/** OZSplineState::OZSplineState() — sub-object ctor. Call sites @0x27fbf / @0x2805f. */
function OZSplineState_ctor(_thisState: OZSplineStateOpaque): void {
  throw new Error(
    "raw-port: OZSplineState::OZSplineState() not yet transcribed " +
      "(called from OZDynamicCurve::OZDynamicCurve() @0x27fbf and " +
      "OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&) @0x2805f — ProChannel)",
  );
}

/** OZSplineState::operator=(OZSplineState const&). Call sites @0x28071 (copy-ctor) and
 *  @0x28133 (operator= on curve). */
function OZSplineState_assign(
  _thisState: OZSplineStateOpaque,
  _rhs: OZSplineStateOpaque,
): OZSplineStateOpaque {
  throw new Error(
    "raw-port: OZSplineState::operator=(OZSplineState const&) not yet transcribed " +
      "(called from OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&) @0x28071 and " +
      "OZDynamicCurve::operator=(OZDynamicCurve const&) @0x28133 — ProChannel)",
  );
}

/** OZSpline::deleteAllVertices() — clears the vertex vector. Called from ~D2 @0x280bb. */
function OZSpline_deleteAllVertices(_thisSpline: OZSplineOpaque): void {
  throw new Error(
    "raw-port: OZSpline::deleteAllVertices() not yet transcribed " +
      "(called from OZDynamicCurve::~OZDynamicCurve() @0x280bb — ProChannel)",
  );
}

/** OZSpline::operator=(OZSpline const&). Call site @0x28119 (operator= on curve). */
function OZSpline_assign(_thisSpline: OZSplineOpaque, _rhs: OZSplineOpaque): OZSplineOpaque {
  throw new Error(
    "raw-port: OZSpline::operator=(OZSpline const&) not yet transcribed " +
      "(called from OZDynamicCurve::operator=(OZDynamicCurve const&) @0x28119 — ProChannel)",
  );
}

/** OZSpline::operator==(OZSpline const&) const. Call site @0x2814d (op== on curve). */
function OZSpline_eq(_thisSpline: OZSplineOpaque, _rhs: OZSplineOpaque): boolean {
  throw new Error(
    "raw-port: OZSpline::operator==(OZSpline const&) const not yet transcribed " +
      "(called from OZDynamicCurve::operator==(OZDynamicCurve const&) const @0x2814d — ProChannel)",
  );
}

/** OZSpline::setExtrapolation(unsigned int, unsigned int). Call site @0x28180. */
function OZSpline_setExtrapolation(_thisSpline: OZSplineOpaque, _a: number, _b: number): void {
  throw new Error(
    "raw-port: OZSpline::setExtrapolation(unsigned int, unsigned int) not yet transcribed " +
      "(called from OZDynamicCurve::setCurveExtrapolation(unsigned int, unsigned int) " +
      "@0x28180 — ProChannel)",
  );
}

/** OZSpline::getExtrapolation(unsigned int) → unsigned int. Call site @0x2819e. */
function OZSpline_getExtrapolation(_thisSpline: OZSplineOpaque, _which: number): number {
  throw new Error(
    "raw-port: OZSpline::getExtrapolation(unsigned int) not yet transcribed " +
      "(called from OZDynamicCurve::getCurveExtrapolation(unsigned int*, unsigned int) " +
      "@0x2819e — ProChannel)",
  );
}

/** OZSpline::setClosed(bool, void*). Call sites @0x2823a, @0x2826a, @0x28296. */
function OZSpline_setClosed(_thisSpline: OZSplineOpaque, _closed: boolean, _tok: unknown): void {
  throw new Error(
    "raw-port: OZSpline::setClosed(bool, void*) not yet transcribed " +
      "(called from OZDynamicCurve::closeCurve()/openCurve()/resetCurve() " +
      "@0x2823a, @0x2826a, @0x28296 — ProChannel)",
  );
}

/** OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&). Call site @0x282d6. */
function OZSpline_getAllValidVerticesHandles(
  _thisSpline: OZSplineOpaque,
  _out: unknown[],
  _t: CMTime,
): void {
  throw new Error(
    "raw-port: OZSpline::getAllValidVerticesHandles(std::vector<void*>&, CMTime const&) " +
      "not yet transcribed (called from OZDynamicCurve::getNumberOfValidKeypoints(CMTime const&) " +
      "@0x282d6 — ProChannel)",
  );
}

/** OZSpline::getMaxValueV(CMTime const&, CMTime*) → double (sret-less: xmm0 return).
 *  Call site @0x28352. The second arg is a caller-provided CMTime OUT slot: the callee fills
 *  it with the CMTime AT WHICH the max value occurred. */
function OZSpline_getMaxValueV(
  _thisSpline: OZSplineOpaque,
  _t: CMTime,
  _outAtTime: { time: CMTime },
): number {
  throw new Error(
    "raw-port: OZSpline::getMaxValueV(CMTime const&, CMTime*) not yet transcribed " +
      "(called from OZDynamicCurve::getCurrentMaxValueV(CMTime const&, double*, double*) " +
      "@0x28352 — ProChannel)",
  );
}

/** Virtual *0x38(vtable) on `this` — invoked from ~D2 @0x280c6 AFTER OZSpline::deleteAllVertices
 *  and BEFORE the tail-jmp to OZDynamicSpline::~D1. The vtable slot is not yet resolved. */
function OZDynamicCurve_vtable_slot38_dtor_extra(_self: OZDynamicCurve): void {
  throw new Error(
    "raw-port: virtual *0x38 called from OZDynamicCurve::~OZDynamicCurve() @0x280c6 " +
      "(vtable slot not yet resolved) — ProChannel",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Opaque handles for base sub-objects we cannot fully model until their own classes are ported.
// The RIGHT thing to model here is the C++ layout as a Uint8Array plus typed views; but since
// we never READ any field of the base directly (all field reads in chunk 0 are already isolated
// to `+0x18/+0x20` — the OZSpline vector — and `+0x98` — the isClosed flag), we use nominal
// brands to keep tsgo strict without inventing internal fields.
// ────────────────────────────────────────────────────────────────────────────

export type OZDynamicSplineOpaque = { readonly __brand: "OZDynamicSpline" };
export type OZSplineOpaque        = { readonly __brand: "OZSpline" };
export type OZSplineStateOpaque   = { readonly __brand: "OZSplineState" };

/**
 * OZDynamicCurve — model of the whole object. Fields we DO transcribe (chunk 0) are named;
 * the base sub-objects are held as opaque brands until their own ports land.
 *
 * The struct is 0xD8 bytes total (last write is CMTime.epoch at +0xD0 → 8 bytes → end at +0xD8).
 */
export interface OZDynamicCurve {
  /** +0x00 vtable — modelled as a symbolic tag; we only need to know it's WRITTEN in the ctor
   *  (Itanium ABI). We cite the RIP-relative address so provenance is preserved. */
  vtable: "OZDynamicCurve_vtable_default@RIP+0xacbc5"
        | "OZDynamicCurve_vtable_copy@RIP+0xacb29"
        | "OZDynamicCurve_vtable_dtor@RIP+0xacab7";
  /** +0x08 .. +0xB8 — OZDynamicSpline base sub-object (opaque until ported). */
  base: OZDynamicSplineOpaque;
  /** +0xB8 .. +0xC0 — OZSplineState (opaque; see OZSplineState.ts for its 16-byte layout). */
  state: OZSplineStateOpaque;
  /** +0xC0 .. +0xD0 — CMTime (rateLimit-like; default = 1/3_000_000 s). */
  rateLimit: CMTime;
  /** +0xD0 .. +0xD8 — CMTime.epoch (the +0x10 spill of the CMTime struct). Modelled as part of
   *  `rateLimit` above; retained here as a comment for the LEDGER-ADDR map. */
}

/**
 * Read the isClosed flag at OZDynamicCurve+0x98 — which lives INSIDE the OZDynamicSpline/OZSpline
 * base sub-object. Until OZSpline is ported we cannot store this typed; we surface it through a
 * pair of accessor closures the caller injects.
 */
export interface BaseAccessors {
  /** Read byte at OZDynamicCurve+0x98 (== OZSpline's isClosed field). */
  readIsClosed(base: OZDynamicSplineOpaque): boolean;
  /** Read the OZSpline vertex-vector length: (*(this+0x20) - *(this+0x18)) >> 3. */
  readNumKeypoints(base: OZDynamicSplineOpaque): number;
}

// ────────────────────────────────────────────────────────────────────────────
// Ported bodies (chunk 0 — 20 methods).
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZDynamicCurve::OZDynamicCurve() — default ctor. @0x27f8c (C2Ev).
 * @0x27f8c prologue; @0x27fa3 store vtable(default) into +0x00; @0x27fb7 call base ctor
 * with (this+0x08, this+0xB8); @0x27fbf call OZSplineState ctor on (this+0xB8); @0x27fc4
 * write 0x00 to +0xB9; @0x27fd0..0x27fda call `_CMTimeMake(1, 3_000_000)` (esi=0x1, edx=0x2DC6C0=3000000)
 * writing the result to the stack; @0x27fdf load +0x10 of the stack CMTime (the epoch) into +0xD0;
 * @0x27fea..0x27fee 128-bit `movups`/`movups` copies bytes [0..0x10) of the stack CMTime into
 * +0xC0..+0xD0; @0x27ff6 store 0x01 to +0xB8 (state.b0 "valid"); return.
 *
 * @param self  fresh 0xD8-byte object to initialise.
 */
export function ozDynamicCurve_ctor_default(self: OZDynamicCurve): void {
  // @0x27fa3  vtable
  self.vtable = "OZDynamicCurve_vtable_default@RIP+0xacbc5";
  // @0x27fb7  OZDynamicSpline::OZDynamicSpline(OZSplineState*)  — takes (base_ptr, &self.state)
  OZDynamicSpline_ctor_state(self.base, self.state);
  // @0x27fbf  OZSplineState::OZSplineState()  — on &self.state
  OZSplineState_ctor(self.state);
  // @0x27fc4  movb $0, 0xb9(this)   — state.b1 = 0    (see OZSplineState.ts for the byte grid;
  //                                   we cannot express this cleanly without OZSplineState fields.
  //                                   The gap is real; the assign is queued for the OZSplineState
  //                                   port to reconcile — until then we THROW so a code path that
  //                                   depends on this bit fails loudly rather than silently
  //                                   defaulting to whatever OZSplineState_ctor happened to write.)
  // @0x27fd0..27fda  _CMTimeMake(value=1, timescale=3_000_000)  — build rateLimit CMTime.
  self.rateLimit = CMTimeMake(1, 0x2DC6C0);        // 0x2DC6C0 == 3_000_000
  // @0x27fea..27fee  movups xmm0, +0xC0(this) ; movq [+0xD0], xmm.high    — stored via 16-byte
  //   xmm copy + separate epoch write. Our CMTime object above IS the fully-populated struct.
  // @0x27ff6  movb $1, 0xB8(this)  — state.b0 (isValid) := 1. Deferred to OZSplineState port.
  //           We intentionally do NOT touch self.state here (opaque); a follow-up chunk that
  //           lands OZSplineState will surface the field name and this ctor will assign it then.
}

/**
 * OZDynamicCurve::OZDynamicCurve() — C1 alias. @0x2801e.
 * `push rbp ; mov rsp,rbp ; pop rbp ; jmp C2Ev` — pure tail-call to C2. Structurally identical.
 */
export function ozDynamicCurve_ctor_default_C1(self: OZDynamicCurve): void {
  ozDynamicCurve_ctor_default(self);
}

/**
 * OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&) — copy ctor. @0x28028 (C2ERKS_).
 * @0x2803f store vtable(copy) into +0x00; @0x28046 addq $0x8,%rsi → &rhs.base;
 * @0x2804a addq $0xB8,%r15 → &self.state (r15 was `this`, then +0xB8 → state); @0x28057 call
 * OZDynamicSpline::OZDynamicSpline(rhs.base, &self.state); @0x2805f call OZSplineState::C1() on
 * &self.state (again — the base ctor didn't touch it); @0x28064 addq $0xB8,%r14 → &rhs.state;
 * @0x2806b..0x28071 OZSplineState::operator=(&self.state, &rhs.state).
 *
 * NOTE: no CMTime copy — the "rateLimit" (+0xC0/+0xD0) is NOT written here. Presumably it's
 * either (a) copied inside OZDynamicSpline::C1(const&) or (b) initialised elsewhere. The
 * disassembly at @0x28028..0x28093 contains no store to [+0xC0..+0xD0]; we mirror that gap.
 * If a downstream client actually reads rateLimit off a copy-constructed curve, that dependency
 * will surface when the OZDynamicSpline port lands.
 */
export function ozDynamicCurve_ctor_copy(self: OZDynamicCurve, rhs: OZDynamicCurve): void {
  // @0x2803f  vtable  (Itanium-ABI "under-construction" alias)
  self.vtable = "OZDynamicCurve_vtable_copy@RIP+0xacb29";
  // @0x28057  OZDynamicSpline::OZDynamicSpline(base_of_this, base_of_rhs, &state_of_this)
  OZDynamicSpline_ctor_copy(self.base, rhs.base, self.state);
  // @0x2805f  OZSplineState::OZSplineState()
  OZSplineState_ctor(self.state);
  // @0x28071  OZSplineState::operator=(&state_of_this, &state_of_rhs)
  OZSplineState_assign(self.state, rhs.state);
  // (no CMTime write — see NOTE in doc)
}

/** OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&) — C1 alias. @0x28096. Tail-jmp to C2. */
export function ozDynamicCurve_ctor_copy_C1(self: OZDynamicCurve, rhs: OZDynamicCurve): void {
  ozDynamicCurve_ctor_copy(self, rhs);
}

/**
 * OZDynamicCurve::~OZDynamicCurve() — D2. @0x280a0.
 * @0x280aa store vtable(dtor) into +0x00; @0x280bb call OZSpline::deleteAllVertices() on base;
 * @0x280c0..0x280c6 vtable-load-and-call *0x38(vtable) on `this` (an extra virtual sweep);
 * @0x280d0 jmp OZDynamicSpline::~D1  (tail-call — no D1 body of our own to run after).
 *
 * NOTE: no explicit OZSplineState destructor call — either OZSplineState has a trivial dtor
 * (its own ~D2 would have been called just before ~D1 via a normal implicit destructor list),
 * or it's inlined into OZDynamicSpline::~D1. We mirror the raw asm exactly and do NOT invent a
 * missing destructor call.
 */
export function ozDynamicCurve_dtor_D2(self: OZDynamicCurve): void {
  // @0x280aa  vtable (dtor variant)
  self.vtable = "OZDynamicCurve_vtable_dtor@RIP+0xacab7";
  // @0x280bb  OZSpline::deleteAllVertices() — clears the vertex vector inside the OZSpline base.
  //   The `leaq 0x8(%rdi), %rbx` at @0x280b4 shows the callee gets `this+0x08` — i.e. the
  //   OZDynamicSpline base — but the SYMBOL called is OZSpline::deleteAllVertices, so the
  //   Itanium ABI is dispatching through the OZSpline sub-sub-object; we call the opaque helper.
  OZSpline_deleteAllVertices(self.base as unknown as OZSplineOpaque);
  // @0x280c0..0x280c6  virtual *0x38 on `this` — an extra cleanup slot.
  OZDynamicCurve_vtable_slot38_dtor_extra(self);
  // @0x280d0  jmp OZDynamicSpline::~D1  — base destructor.
  OZDynamicSpline_dtor(self.base);
}

/**
 * OZDynamicCurve::~OZDynamicCurve() — D1. @0x280de.
 * Bytes at 0x280de: `55 48 89 e5 5d e9 b8 ff ff ff` = `push rbp ; mov rsp,rbp ; pop rbp ; jmp -72`.
 * -72 from the end-of-jmp (0x280e8) = 0x280a0 = D2. So D1 tail-jmps to D2. Structurally identical.
 * (This entry is NOT emitted as a labelled body in the .s dump because otool -tV collapsed the
 * 5-byte jmp into the D2 predecessor's fall-through; we recover it from `nm -n` and the raw slice
 * bytes: see the header comment on this file.)
 */
export function ozDynamicCurve_dtor_D1(self: OZDynamicCurve): void {
  ozDynamicCurve_dtor_D2(self);
}

/**
 * OZDynamicCurve::~OZDynamicCurve() — D0 (deleting dtor). @0x280e8.
 * @0x280f1 call D2; @0x280ff jmp `operator delete`. In JS we don't `operator delete`; we mirror
 * the D2 call and leave the object to GC — but we cite the addr so provenance holds.
 */
export function ozDynamicCurve_dtor_D0(self: OZDynamicCurve): void {
  // @0x280f1  OZDynamicCurve::~D2()
  ozDynamicCurve_dtor_D2(self);
  // @0x280ff  jmp __ZdlPv (operator delete)  — no-op in JS (GC).
}

/**
 * OZDynamicCurve::operator=(OZDynamicCurve const&). @0x28104.
 * @0x28119 OZSpline::operator= on (base+0, rhs.base+0)     — mind: the callee gets `this+0x8`
 *   (a `addq $0x8,%rdi` before the call), i.e. the OZSpline sub-sub-object address.
 * @0x2811e..0x28133 OZSplineState::operator= on (this+0xB8, rhs+0xB8) — tail-jmp.
 *
 * Returns `this`. (The tail-jmp `jmp OZSplineState::operator=` returns whatever that returns;
 * OZSplineState::operator= is a `T&` returning function so this is the standard chained-assign
 * "return *this" idiom.)
 */
export function ozDynamicCurve_op_assign(self: OZDynamicCurve, rhs: OZDynamicCurve): OZDynamicCurve {
  // @0x28119
  OZSpline_assign(self.base as unknown as OZSplineOpaque, rhs.base as unknown as OZSplineOpaque);
  // @0x28133 (tail)
  OZSplineState_assign(self.state, rhs.state);
  return self;
}

/**
 * OZDynamicCurve::operator==(OZDynamicCurve const&) const. @0x28138.
 * @0x2814d  OZSpline::operator==(this.base, rhs.base)  — if false, return 0.
 * @0x2816c  jmp OZSplineState::operator==(this.state, rhs.state)  — else defer to state eq.
 *
 * (The tail block after the branch: @0x28170 `xorl %eax, %eax ; pop ... ; retq`. So structure is
 *   if (!OZSpline_eq) return false;  else return OZSplineState_eq;.)
 *
 * NOTE: OZSplineState::operator== is a SEPARATE symbol; the disasm shows it's the same "add 0xB8,
 * jmp" tail-call pattern used everywhere else. We treat it as another opaque helper.
 */
export function ozDynamicCurve_op_eq(self: OZDynamicCurve, rhs: OZDynamicCurve): boolean {
  // @0x2814d
  if (!OZSpline_eq(self.base as unknown as OZSplineOpaque, rhs.base as unknown as OZSplineOpaque)) {
    // @0x28170..0x28175   xorl %eax, %eax ; retq  — return false
    return false;
  }
  // @0x28167..0x2816c  tail-jmp to OZSplineState::operator==(&self.state, &rhs.state).
  //   Helper undecoded (@0x2816c); we throw a loud gap rather than a plausible-but-wrong answer.
  return OZSplineState_eq(self.state, rhs.state);
}

/** OZSplineState::operator==(OZSplineState const&) const — tail-jmp target from op== on curve.
 *  Call site @0x2816c. */
function OZSplineState_eq(_a: OZSplineStateOpaque, _b: OZSplineStateOpaque): boolean {
  throw new Error(
    "raw-port: OZSplineState::operator==(OZSplineState const&) const not yet transcribed " +
      "(tail-called from OZDynamicCurve::operator==(OZDynamicCurve const&) const @0x2816c — ProChannel)",
  );
}

/**
 * OZDynamicCurve::setCurveExtrapolation(unsigned int, unsigned int). @0x28178.
 * @0x2817c `addq $0x8,%rdi` → &self.base (i.e. OZSpline sub-sub-object).
 * @0x28180 `callq OZSpline::setExtrapolation(unsigned int, unsigned int)`.
 * @0x28185 `movb $0x1, %al` — return true (bool-in-al).
 * Semantics: forward (kind, which) unchanged; return true unconditionally.
 */
export function ozDynamicCurve_setCurveExtrapolation(
  self: OZDynamicCurve,
  a: number,
  b: number,
): boolean {
  // @0x28180
  OZSpline_setExtrapolation(self.base as unknown as OZSplineOpaque, a >>> 0, b >>> 0);
  // @0x28185
  return true;
}

/**
 * OZDynamicCurve::getCurveExtrapolation(unsigned int* out, unsigned int which). @0x2818a.
 * @0x2818a  testq %rsi,%rsi   ;   je 0x281ab   — if out == nullptr, skip write.
 * @0x28198  addq $0x8,%rdi                    — &self.base.
 * @0x2819c  movl %edx, %esi                   — which → esi (arg 2 of callee).
 * @0x2819e  callq OZSpline::getExtrapolation(unsigned int) — returns u32 in %eax.
 * @0x281a3  movl %eax, (%rbx)                 — *out = returned value.
 * @0x281ab  movb $0x1, %al                    — return true unconditionally.
 *
 * In JS `unsigned int*` is a length-1 Uint32Array (or a nullable object with `.value`).
 * We use the `{ value: number }` convention consistent with keyframe out-params elsewhere
 * (see the fct/ port's PMErr pattern). If the caller passes `null`/`undefined`, we skip the
 * store — bit-exact with the C++ null-check.
 */
export function ozDynamicCurve_getCurveExtrapolation(
  self: OZDynamicCurve,
  out: { value: number } | null,
  which: number,
): boolean {
  if (out !== null && out !== undefined) {
    // @0x2819e
    const v = OZSpline_getExtrapolation(self.base as unknown as OZSplineOpaque, which >>> 0);
    // @0x281a3   *(u32*)out = v
    out.value = v >>> 0;
  }
  // @0x281ab
  return true;
}

/**
 * OZDynamicCurve::getCurveSamples(CMTime const& t, double u0, double u1, unsigned int& nOut,
 *                                 double* xs, double* ys). @0x281ae.
 * @0x281b5..0x281c3  eax = (*(this+0x20) - *(this+0x18)) >> 3 → #keypoints. If zero, return 0.
 * @0x281c5..0x281d6  else tail-jmp `OZDynamicSpline::sampleSpline(this+0x8, u0, u1, nOut, xs, ys, t)`
 *   with the argument shuffle: rdi=this+0x8, rsi=u0, rdx=u1, rcx=nOut, r8=xs, r9=ys, and a stack
 *   arg for t (well — the call is a jmp, and the callee signature reads t from rax stashed in the
 *   original rsi register moved into r8. Concretely: original t (rsi in ABI slot 2) moved to rax
 *   @0x281b2; then just before the jmp, that rax → r8; but the callee signature
 *   `sampleSpline(double, double, unsigned int&, double*, double*, CMTime const&)` places t in
 *   slot 6 which by SysV ABI is r9 for a pointer — WAIT — recheck: it's a JMP tail-call so the
 *   register layout coming in is preserved as-is. The C++ signature declared in the mangled name
 *   is `sampleSpline(double, double, unsigned int&, double*, double*, CMTime const&)`, which in
 *   SysV maps to: xmm0=u0, xmm1=u1, rdi=&this, rsi=&nOut, rdx=xs, rcx=ys, r8=&t. So the shuffle
 *   @0x281c5..0x281d2 sets exactly that: `rdi = this+0x8`, `rsi = &nOut (was rcx)`, `rdx = xs
 *   (was r8)`, `rcx = ys (was r9)`, `r8 = &t (was in rax, originally rsi in slot 2)`.
 *   And note xmm0/xmm1 (u0, u1) are already in place from the CALLER's stack frame.
 *
 * Return: 0 if empty; else the return value of sampleSpline (in %eax — a boolean-in-int).
 */
export function ozDynamicCurve_getCurveSamples_arrays(
  self: OZDynamicCurve,
  base: BaseAccessors,
  t: CMTime,
  u0: number,
  u1: number,
  nOut: { value: number },
  xs: Float64Array,
  ys: Float64Array,
): boolean {
  // @0x281b5..0x281c3  early-out on empty keypoint vector
  if (base.readNumKeypoints(self.base) === 0) {
    // @0x281db  xorl %eax,%eax ; retq
    return false;
  }
  // @0x281d6  tail-jmp OZDynamicSpline::sampleSpline(u0, u1, nOut, xs, ys, t)  on self.base.
  return OZDynamicSpline_sampleSpline_arrays(self.base, u0, u1, nOut, xs, ys, t);
}

/** OZDynamicSpline::sampleSpline(double, double, unsigned int&, double*, double*, CMTime const&).
 *  Tail-called from OZDynamicCurve::getCurveSamples(..double*..) @0x281d6. Undecoded. */
function OZDynamicSpline_sampleSpline_arrays(
  _self: OZDynamicSplineOpaque,
  _u0: number,
  _u1: number,
  _nOut: { value: number },
  _xs: Float64Array,
  _ys: Float64Array,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::sampleSpline(double,double,unsigned int&,double*,double*,CMTime const&) " +
      "not yet transcribed (tail-called from " +
      "OZDynamicCurve::getCurveSamples(CMTime const&,double,double,unsigned int&,double*,double*) " +
      "@0x281d6 — ProChannel)",
  );
}

/**
 * OZDynamicCurve::getCurveSamples(CMTime const& t, double u0, double u1, unsigned int& nOut,
 *                                 std::vector<double>* xs, std::vector<double>* ys). @0x281e0.
 * Structurally identical to the array overload — same empty-check, same tail-jmp with the vector
 * variant of OZDynamicSpline::sampleSpline (@0x28208).
 */
export function ozDynamicCurve_getCurveSamples_vectors(
  self: OZDynamicCurve,
  base: BaseAccessors,
  t: CMTime,
  u0: number,
  u1: number,
  nOut: { value: number },
  xs: number[],
  ys: number[],
): boolean {
  // @0x281e7..0x281f5
  if (base.readNumKeypoints(self.base) === 0) {
    // @0x2820d  xorl %eax,%eax ; retq
    return false;
  }
  // @0x28208  tail-jmp vector overload of sampleSpline.
  return OZDynamicSpline_sampleSpline_vectors(self.base, u0, u1, nOut, xs, ys, t);
}

/** Vector overload of OZDynamicSpline::sampleSpline. Tail-called @0x28208. Undecoded. */
function OZDynamicSpline_sampleSpline_vectors(
  _self: OZDynamicSplineOpaque,
  _u0: number,
  _u1: number,
  _nOut: { value: number },
  _xs: number[],
  _ys: number[],
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::sampleSpline(double,double,unsigned int&,std::vector<double>*," +
      "std::vector<double>*,CMTime const&) not yet transcribed (tail-called from " +
      "OZDynamicCurve::getCurveSamples(...,std::vector<double>*,std::vector<double>*) " +
      "@0x28208 — ProChannel)",
  );
}

/**
 * OZDynamicCurve::closeCurve(). @0x28212.
 * @0x28212  cmpb $0x0, 0x98(%rdi) ; jne 0x28240      — if already closed, return true.
 * @0x2821b  eax = (*(this+0x20) - *(this+0x18)) >> 3
 * @0x28227  testl %eax,%eax  ; je  0x28240           — if zero keypoints, return true.
 * @0x2822b..0x2823a  OZSpline::setClosed(true, nullptr)   — arg2 is nullptr (edx zeroed @0x28238).
 * @0x28240  movb $0x1, %al ; retq                    — return true.
 */
export function ozDynamicCurve_closeCurve(self: OZDynamicCurve, base: BaseAccessors): boolean {
  // @0x28212
  if (base.readIsClosed(self.base)) return true;
  // @0x2821b..0x28229
  if (base.readNumKeypoints(self.base) === 0) return true;
  // @0x2823a  OZSpline::setClosed(&self.base_spline, true, nullptr)
  OZSpline_setClosed(self.base as unknown as OZSplineOpaque, true, null);
  return true;
}

/**
 * OZDynamicCurve::openCurve(void* tok). @0x28244.
 * @0x28244  cmpb $0x1, 0x98(%rdi) ; jne 0x28270       — if NOT closed, return true (nothing to do).
 * @0x2824d  eax = keypointCount; if 0, return true.
 * @0x2825d..0x2826a  OZSpline::setClosed(false, tok)  — arg2 forwarded from rsi (the `void*`).
 * @0x28270  movb $0x1, %al ; retq                    — return true.
 */
export function ozDynamicCurve_openCurve(
  self: OZDynamicCurve,
  base: BaseAccessors,
  tok: unknown,
): boolean {
  // @0x28244
  if (!base.readIsClosed(self.base)) return true;
  // @0x2824d
  if (base.readNumKeypoints(self.base) === 0) return true;
  // @0x2826a
  OZSpline_setClosed(self.base as unknown as OZSplineOpaque, false, tok);
  return true;
}

/**
 * OZDynamicCurve::isClosedCurve(bool* out). @0x28274.
 * @0x28278  testq %rsi,%rsi ; je 0x28285  — if out==null, skip write.
 * @0x2827d  *out = *(uint8*)(this+0x98)   — load the byte flag verbatim.
 * @0x28285  movb $0x1, %al ; retq         — return true.
 *
 * Note: the callee stores the RAW byte, not a normalized 0/1 — if the field held any nonzero
 * value it would be forwarded as-is. We mirror that exactly (`readIsClosed` returns a boolean,
 * so we normalize; if the physical byte is important, callers should read the base object
 * directly).
 */
export function ozDynamicCurve_isClosedCurve(
  self: OZDynamicCurve,
  base: BaseAccessors,
  out: { value: boolean } | null,
): boolean {
  if (out !== null && out !== undefined) {
    // @0x2827d
    out.value = base.readIsClosed(self.base);
  }
  // @0x28285
  return true;
}

/**
 * OZDynamicCurve::resetCurve(). @0x2828a.
 * @0x2828e  addq $0x8, %rdi ; xorl %esi,%esi ; xorl %edx,%edx ; call OZSpline::setClosed(false, nullptr).
 * @0x2829b  movb $0x1, %al ; retq  — return true.
 *
 * NOTE: despite the name "resetCurve", the disasm does ONLY the setClosed(false, nullptr) call —
 * it does NOT clear vertices, does NOT reset extrapolation, does NOT touch the CMTime rateLimit.
 * Faithful port: mirror exactly.
 */
export function ozDynamicCurve_resetCurve(self: OZDynamicCurve): boolean {
  // @0x28296
  OZSpline_setClosed(self.base as unknown as OZSplineOpaque, false, null);
  // @0x2829b
  return true;
}

/**
 * OZDynamicCurve::getNumberOfKeypoints(). @0x282a0.
 * Body @0x282a4..0x282ac:
 *   rax = *(this+0x20)
 *   rax -= *(this+0x18)
 *   rax >>= 3
 *   return (uint32) rax
 *
 * i.e. `(end - begin) / 8` — the length of the std::vector<void*> vertex table inside OZSpline.
 * Return type in the mangled name is `unsigned int` (E→u32), so we truncate to 32 bits.
 */
export function ozDynamicCurve_getNumberOfKeypoints(
  self: OZDynamicCurve,
  base: BaseAccessors,
): number {
  // (readNumKeypoints returns the u32 already)
  return base.readNumKeypoints(self.base) >>> 0;
}

/**
 * OZDynamicCurve::getNumberOfValidKeypoints(CMTime const& t). @0x282b2.
 *
 * Body:
 *   std::vector<void*> handles;                            // local (rbp-0x30 .. rbp-0x18)
 *   handles.begin = 0; handles.end = 0; handles.cap = 0;   // @0x282c0..0x282ca (xorps + zero)
 *   OZSpline::getAllValidVerticesHandles(&handles, t);     // @0x282d6 (this+0x8, &handles, &t)
 *   r14 = handles.begin;
 *   rbx = handles.end;
 *   if (r14 != 0) { handles.end = r14; ::operator delete(r14); }  // @0x282e3..0x282f0 (dtor)
 *   count = (rbx - r14) >> 3;                              // @0x282f4..0x282fa
 *   return (uint32) count;
 *
 * The extra `handles.end = r14` store BEFORE `operator delete(r14)` is the standard std::vector
 * dtor pattern (mark the vector as "empty" before freeing its buffer so a re-entrant unwinder
 * sees a consistent object). We reflect that in-comment; in JS there's no unwind window.
 *
 * Semantically: forward the CMTime, count the returned handles, and return the count.
 */
export function ozDynamicCurve_getNumberOfValidKeypoints(
  self: OZDynamicCurve,
  t: CMTime,
): number {
  // @0x282c0..0x282ca  fresh empty vector — we use a JS array.
  const handles: unknown[] = [];
  // @0x282d6
  OZSpline_getAllValidVerticesHandles(self.base as unknown as OZSplineOpaque, handles, t);
  // @0x282f4..0x282fa  count = (end - begin) / 8 = handles.length in JS terms.
  return handles.length >>> 0;
}

/**
 * OZDynamicCurve::getCurrentMaxValueV(CMTime const& t, double* outValue, double* outTimeSec).
 * @0x28324.
 *
 * Body:
 *   CMTime zeroCopy = *(CMTime const*)_kCMTimeZero;        // @0x28335..0x2834b — literal-pool
 *                                                            copy of _kCMTimeZero into a local
 *                                                            (rbp-0x30). The 16-byte body is
 *                                                            copied by `movups` and the +0x10
 *                                                            (epoch) is copied separately.
 *   xmm0 = OZSpline::getMaxValueV(&self.base_spline, t, &zeroCopy);   // @0x28352 (outAtTime = &zeroCopy)
 *   *outValue = xmm0;                                                    // @0x28357
 *   if (outTimeSec) {                                                    // @0x2835c
 *     // The CMTime `zeroCopy` local now holds the CMTime AT WHICH the max occurred.
 *     // Push it onto the stack as a by-value CMTime and call _CMTimeGetSeconds.
 *     _CMTimeGetSeconds(zeroCopy);                                       // @0x28372
 *     *outTimeSec = xmm0;                                                // @0x28377
 *   }
 *   return true;
 *
 * IMPORTANT: OZSpline::getMaxValueV is undecoded; its OUT-parameter semantics ("fill this CMTime
 * with the time-of-max") are inferred from the calling pattern (the local is initialised to
 * kCMTimeZero and read back after the call). Until the callee is decoded we cannot verify the
 * OUT semantics — but our port structurally matches the CFG regardless.
 */
export function ozDynamicCurve_getCurrentMaxValueV(
  self: OZDynamicCurve,
  t: CMTime,
  outValue: { value: number },
  outTimeSec: { value: number } | null,
): boolean {
  // @0x28335..0x2834b  local = kCMTimeZero
  const local: { time: CMTime } = { time: { ...kCMTimeZero } };
  // @0x28352
  const maxV = OZSpline_getMaxValueV(self.base as unknown as OZSplineOpaque, t, local);
  // @0x28357
  outValue.value = maxV;
  // @0x2835c
  if (outTimeSec !== null && outTimeSec !== undefined) {
    // @0x28372
    outTimeSec.value = CMTimeGetSeconds(local.time);
  }
  // @0x2837b
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// Keys are demangled method-selector strings; values are the ported bodies.
// Every value carries its @0xADDR in the doc-comment above.
// ────────────────────────────────────────────────────────────────────────────

export const OZDynamicCurve_m0_methods = {
  // ctors / dtors / assign / eq
  "OZDynamicCurve::OZDynamicCurve()@C2":                          ozDynamicCurve_ctor_default,       // @0x27f8c
  "OZDynamicCurve::OZDynamicCurve()@C1":                          ozDynamicCurve_ctor_default_C1,    // @0x2801e
  "OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&)@C2":     ozDynamicCurve_ctor_copy,          // @0x28028
  "OZDynamicCurve::OZDynamicCurve(OZDynamicCurve const&)@C1":     ozDynamicCurve_ctor_copy_C1,       // @0x28096
  "OZDynamicCurve::~OZDynamicCurve()@D2":                         ozDynamicCurve_dtor_D2,            // @0x280a0
  "OZDynamicCurve::~OZDynamicCurve()@D1":                         ozDynamicCurve_dtor_D1,            // @0x280de
  "OZDynamicCurve::~OZDynamicCurve()@D0":                         ozDynamicCurve_dtor_D0,            // @0x280e8
  "OZDynamicCurve::operator=(OZDynamicCurve const&)":             ozDynamicCurve_op_assign,          // @0x28104
  "OZDynamicCurve::operator==(OZDynamicCurve const&) const":      ozDynamicCurve_op_eq,              // @0x28138
  // extrapolation
  "OZDynamicCurve::setCurveExtrapolation(unsigned int, unsigned int)":
                                                                  ozDynamicCurve_setCurveExtrapolation, // @0x28178
  "OZDynamicCurve::getCurveExtrapolation(unsigned int*, unsigned int)":
                                                                  ozDynamicCurve_getCurveExtrapolation, // @0x2818a
  // sampling
  "OZDynamicCurve::getCurveSamples(CMTime const&, double, double, unsigned int&, double*, double*)":
                                                                  ozDynamicCurve_getCurveSamples_arrays, // @0x281ae
  "OZDynamicCurve::getCurveSamples(CMTime const&, double, double, unsigned int&, std::vector<double>*, std::vector<double>*)":
                                                                  ozDynamicCurve_getCurveSamples_vectors, // @0x281e0
  // closed-curve state
  "OZDynamicCurve::closeCurve()":                                 ozDynamicCurve_closeCurve,         // @0x28212
  "OZDynamicCurve::openCurve(void*)":                             ozDynamicCurve_openCurve,          // @0x28244
  "OZDynamicCurve::isClosedCurve(bool*)":                         ozDynamicCurve_isClosedCurve,      // @0x28274
  "OZDynamicCurve::resetCurve()":                                 ozDynamicCurve_resetCurve,         // @0x2828a
  // keypoint counts + max value
  "OZDynamicCurve::getNumberOfKeypoints()":                       ozDynamicCurve_getNumberOfKeypoints,      // @0x282a0
  "OZDynamicCurve::getNumberOfValidKeypoints(CMTime const&)":     ozDynamicCurve_getNumberOfValidKeypoints, // @0x282b2
  "OZDynamicCurve::getCurrentMaxValueV(CMTime const&, double*, double*)":
                                                                  ozDynamicCurve_getCurrentMaxValueV,       // @0x28324
} as const;
