// OZChannelEnum — the "enum" channel factory in FCP's OZChannel family. This class only
// exposes a static factory `createOZChannelEnumCurve(double)` that builds an `OZCurveEnum`
// wired up to the shared `OZCurveEnumSplineState` singleton. Ctors are not present in the
// exports (the enum channel is constructed elsewhere via OZChannelEnumInfo/…).
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelEnum.createOZChannelEnumCurve.s):
//   createOZChannelEnumCurve(double)   @0x000ab460  (__ZN13OZChannelEnum24createOZChannelEnumCurveEd)
//
// Callees / RIP-relative refs (resolved via raw-port/army/tools/resolve.py Ozone ...):
//   __Znwm                                          // operator new(unsigned long)
//   __ZN7OZCurveC2Edddd                             // OZCurve::OZCurve(double,double,double,double)
//   __ZTV11OZCurveEnum                              // vtable for OZCurveEnum (installed at +0x10)
//   __ZN22OZCurveEnumSplineState13_instanceOnceE    // std::once_flag for the SplineState singleton
//   __ZN22OZCurveEnumSplineState9_instanceE         // singleton instance pointer
//   __ZNSt3__117__call_once_proxyB9nqe210106<lambda> // std::__call_once_proxy stub
//   __ZNSt3__111__call_onceERVmPvPFvS2_E            // std::__1::__call_once entry point
//   __ZN7OZCurve14setSplineStateEP13OZSplineState   // OZCurve::setSplineState
//   __ZdlPv                                          // operator delete(void*) (unwind paths)
//   __ZN7OZCurveD2Ev                                // OZCurve::~OZCurve() (unwind paths)
//   __Unwind_Resume
//
// FAITHFUL PORT — every function cites its @Ozone 0xADDR. Every numeric constant cites the
// address it was read from (via resolve.py const, thin x86_64 slice). Undecoded callees throw
// citing their FCP address (PORTING_SPEC.md Rule 3). No approximations, no invented helpers,
// no cross-file reach-ins beyond named imports.

// ── opaque parameter types (structural — no ObjC/C++ layout is peeked at here) ────────────
export type OZSplineStatePtr = object | null | undefined;

/**
 * Structural shape of the newly-allocated `OZCurveEnum` prior to the vptr write. The C++
 * layout is a 0xb0-byte struct fully initialised by `OZCurve::OZCurve(double,double,double,
 * double)` (@stub 0x6dec16). We only touch the parts named here; every other byte belongs
 * to the OZCurve base ctor and stays opaque.
 */
export interface OZCurveEnumShape {
  /** +0x00 vptr — assigned to `__ZTV11OZCurveEnum + 0x10` at @0xab49d..0xab4a8. */
  vtable_kind: "OZCurve" | "OZCurveEnum";
  /** splineState pointer written by `OZCurve::setSplineState` @0xab4fa (after the +0x8
   *  sub-object adjust — see the doc-comment on `createOZChannelEnumCurve` below). */
  splineState: OZSplineStatePtr;
}

// ── seed constants read from Ozone __TEXT __const (verified with resolve.py const) ─────────
/** @const 0x7053e0  double = 1.0            (u64 0x3ff0000000000000)
 *  — 3rd arg (xmm2) to OZCurve::OZCurve(d,d,d,d) @0xab498 in createOZChannelEnumCurve.
 *    Loaded @0xab485: `movsd 0x659f53(%rip),%xmm2` -> RIP=0xab48d + 0x659f53 = 0x7053e0. */
const K_ONE: number = 1.0;
/** @const 0x705c80  double = 4294967295.0   (u64 0x41efffffffe00000  ≡ UINT32_MAX as double)
 *  — 2nd arg (xmm1) to OZCurve::OZCurve(d,d,d,d) @0xab498 in createOZChannelEnumCurve.
 *    Loaded @0xab47d: `movsd 0x65a7fb(%rip),%xmm1` -> RIP=0xab485 + 0x65a7fb = 0x705c80. */
const K_UINT32_MAX_D: number = 4294967295.0;
/** implicit zero — 1st arg (xmm0) to OZCurve::OZCurve(d,d,d,d) via `xorps %xmm0,%xmm0`
 *  @0xab48d. */
const K_ZERO: number = 0.0;
/** OZCurveEnum heap size in bytes — `movl $0xb0,%edi` @0xab470 fed to operator new. */
const K_OZCURVEENUM_SIZE: number = 0xb0;

// ── frontier stubs for un-ported callees ────────────────────────────────────────────────────

/** `OZCurve::OZCurve(double, double, double, double)` — symbol `__ZN7OZCurveC2Edddd`
 *  @stub 0x6dec16 (called @0xab498 with (0.0, 4294967295.0, 1.0, <input>)). Frontier. */
function OZCurve_ctor4d(
  _obj: OZCurveEnumShape,
  _a0: number,
  _a1: number,
  _a2: number,
  _a3: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @Ozone (stub 0x6dec16) not yet transcribed (called from OZChannelEnum::createOZChannelEnumCurve @0xab498)",
  );
}

/** `OZCurve::setSplineState(OZSplineState*)` — symbol
 *  `__ZN7OZCurve14setSplineStateEP13OZSplineState` @stub 0x6debfe (called @0xab4fa). Frontier. */
function OZCurve_setSplineState(_obj: OZCurveEnumShape, _s: OZSplineStatePtr): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone (stub 0x6debfe) not yet transcribed (called from OZChannelEnum::createOZChannelEnumCurve @0xab4fa)",
  );
}

/**
 * `OZCurveEnumSplineState::getInstance()` — Ozone-framework singleton whose raw pointer is
 * loaded from `__ZN22OZCurveEnumSplineState9_instanceE` (VA-ref @0xab4e2) after a
 * `std::call_once` guard on `__ZN22OZCurveEnumSplineState13_instanceOnceE` (VA-ref @0xab4ab /
 * @0xab4cb). The returned pointer is offset by +0x8 before being handed to
 * `OZCurve::setSplineState` (see @0xab4ec: `leaq 0x8(%rax),%rsi` — a multiple-inheritance
 * sub-object adjust). If the raw instance pointer is null the adjust is short-circuited
 * (`testq %rax,%rax; cmoveq %rax,%rsi` @0xab4f0..0xab4f3).
 *
 * The initialiser lambda body (in OZCurveEnumSplineState.ts) is not yet transcribed —
 * frontier stub. Returns the raw instance pointer; the caller applies the +0x8 sub-object
 * adjust exactly as the compiler emitted it.
 */
function OZCurveEnumSplineState_getInstance(): OZSplineStatePtr {
  throw new Error(
    "OZCurveEnumSplineState::getInstance() singleton @Ozone not yet transcribed (std::call_once guard __ZN22OZCurveEnumSplineState13_instanceOnceE @VA-ref 0xab4ab; global __ZN22OZCurveEnumSplineState9_instanceE @VA-ref 0xab4e2)",
  );
}

// ── OZChannelEnum ───────────────────────────────────────────────────────────────────────────
export class OZChannelEnum {
  /**
   * (+0xc0) `unsigned long*` — the base of the ENABLED-STATE BITSET: a flat array of 64-bit words,
   * bit `i` of word `i >> 6` being the enabled state of index `i`.
   *
   * Recovered from `getEnabledState` below and from nothing else, so only the fact that +0xc0 holds
   * a pointer to 64-bit words is decoded here — not the array's length (the accessor reads it with
   * no bound), not who allocates it, and not who sets the bits. Modelled as `bigint[]` because the
   * loaded element is a full 64-bit word that the `btq` then tests; a `number[]` could not hold bit
   * 63 exactly. @ProChannel 0x6366e is the load.
   */
  enabledStateWords_at_0xc0: bigint[] | null = null;

  /**
   * `OZChannelEnum::getEnabledState(unsigned long) const` — @ProChannel 0x6366a
   * (`__ZNK13OZChannelEnum15getEnabledStateEm`).
   *
   * FULL transcription of the 9-instruction body. Bytes quoted and checked against BOTH the mapped
   * image and the on-disk thin slice, because every operand here is an addressing mode and otool
   * renders those through its symbolizer:
   *
   *   0x6366a  55                    pushq %rbp                  ; prologue
   *   0x6366b  48 89 e5              movq  %rsp, %rbp
   *   0x6366e  48 8b 87 c0 00 00 00  movq  0xc0(%rdi), %rax      ; rax = this->words  (no null check)
   *   0x63675  48 89 f1              movq  %rsi, %rcx            ; rcx = index
   *   0x63678  48 c1 e9 06           shrq  $0x6, %rcx            ; REX.W LOGICAL shift: word = index >> 6
   *   0x6367c  48 8b 04 c8           movq  (%rax,%rcx,8), %rax   ; rax = words[word]  (no bound check)
   *   0x63680  48 0f a3 f0           btq   %rsi, %rax            ; CF = bit (index mod 64) of rax
   *   0x63684  0f 92 c0              setb  %al                   ; al = CF -> the bool result
   *   0x63687  5d                    popq  %rbp
   *   0x63688  c3                    retq
   *
   * TWO THINGS THE ENCODING DECIDES, and neither is visible in the mnemonic text:
   *  1. `shrq` is REX.W (`48 c1 e9 06`) and LOGICAL, so the word index is the UNSIGNED index >> 6
   *     over the full 64-bit register — not a 32-bit shift and not an arithmetic one.
   *  2. `btq %rsi, %rax` (`48 0f a3 f0`) takes its bit offset from a REGISTER against a REGISTER
   *     destination, and in that form the CPU masks the offset to the operand size, i.e. bit =
   *     index mod 64. THAT is why no explicit `andl $0x3f` appears anywhere in the body. A port
   *     that reads the mnemonic and writes `bit = index` gets every index >= 64 wrong.
   *
   * NO BOUNDS CHECK and NO NULL CHECK: the machine dereferences +0xc0 and indexes the word array
   * unconditionally, so an out-of-range index reads whatever memory follows. This port raises at
   * both points instead of inventing a value, which keeps the gap loud (and keeps G7's
   * silent-wrong-answer class out of it).
   *
   * ORACLE (executed, not read — raw-port/re/oracle/OZChannelEnum_getEnabledState_probe.py): local
   * (`t`) symbol, called BY ADDRESS at `_dyld_get_image_vmaddr_slide(ProChannel) + 0x6366a` under
   * `arch -x86_64`, with `this` poisoned 0xCD and +0xc0 pointing at five known words
   * (0x1, 0x8000000000000000, 0xAAAAAAAAAAAAAAAA, 0, 0xFFFFFFFFFFFFFFFF). 14 indices spanning
   * words 0..4 (0, 1, 63, 64, 65, 127, 128, 129, 130, 131, 255, 256, 257, 319) all matched this
   * port's model bit-for-bit, and the arena was byte-identical afterwards (the method is `const`).
   * Eight of those indices are ones where a model that forgot the word select answers the OPPOSITE
   * bit — that is the negative control, and it is why the two encoding facts above are measured
   * rather than argued.
   */
  getEnabledState(index: bigint): boolean {
    // %rsi is a 64-bit register: model its width explicitly rather than trusting the caller.
    const idx: bigint = BigInt.asUintN(64, index);
    // @0x6366e — movq 0xc0(%rdi), %rax. Unconditional; a null here faults in the machine.
    const words = this.enabledStateWords_at_0xc0;
    if (words === null) {
      throw new Error(
        "OZChannelEnum::getEnabledState @ProChannel 0x6366a — the word array (+0xc0) is null; " +
          "the load @0x6366e is unconditional, so the machine would fault here.",
      );
    }
    // @0x63675-0x63678 — movq %rsi,%rcx ; shrq $0x6,%rcx: the LOGICAL 64-bit word index.
    const wordIndex: bigint = idx >> 6n;
    // @0x6367c — movq (%rax,%rcx,8), %rax. The machine applies no bound; JS would hand back
    // `undefined` and turn the test below into a silent `false`, so refuse instead.
    const word = words[Number(wordIndex)];
    if (word === undefined) {
      throw new Error(
        "OZChannelEnum::getEnabledState @ProChannel 0x6366a — word index " +
          wordIndex.toString() +
          " is past the modelled array (" +
          words.length.toString() +
          " words). The load @0x6367c is unbounded in the machine and would read adjacent memory; " +
          "this port refuses rather than inventing a bit.",
      );
    }
    // @0x63680-0x63684 — btq %rsi,%rax ; setb %al: CF = bit (index mod 64), returned as the bool.
    return ((word >> (idx & 63n)) & 1n) === 1n;
  }

  /**
   * OZChannelEnum::createOZChannelEnumCurve(double)
   *
   * @Ozone 0x000ab460  (symbol `__ZN13OZChannelEnum24createOZChannelEnumCurveEd`)
   *
   * Static factory: allocates an OZCurveEnum on the heap, initialises it via `OZCurve::OZCurve
   * (0.0, 4294967295.0, 1.0, v)` (matches the u32-range OZCurve variants used by
   * OZChannelUint32::createOZChannelUint32Curve @0xdf570 — same three seed doubles), rewrites
   * the primary vptr to `__ZTV11OZCurveEnum + 0x10`, lazily obtains the shared
   * `OZCurveEnumSplineState` instance, and wires it in.
   *
   * Disasm (raw-port/re/disasm/OZChannelEnum.createOZChannelEnumCurve.s), instruction-by-
   * instruction:
   *
   *   0xab460..0xab46a  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x20,%rsp
   *   0xab46b           movsd %xmm0, -0x20(%rbp)                            (spill input `v`)
   *   0xab470           movl $0xb0,%edi                                     (heap size 176 = 0xb0)
   *   0xab475           callq __Znwm                                        (operator new)
   *   0xab47a           movq %rax,%rbx                                      (rbx = new_obj)
   *   0xab47d           movsd 0x65a7fb(%rip),%xmm1                          (xmm1 = *0x705c80 = 4294967295.0)
   *   0xab485           movsd 0x659f53(%rip),%xmm2                          (xmm2 = *0x7053e0 = 1.0)
   *   0xab48d           xorps %xmm0,%xmm0                                   (xmm0 = 0.0)
   *   0xab490           movq %rax,%rdi                                      (this  = new_obj)
   *   0xab493           movsd -0x20(%rbp),%xmm3                             (xmm3 = v)
   *   0xab498           callq __ZN7OZCurveC2Edddd                           (OZCurve base ctor)
   *   0xab49d           leaq __ZTV11OZCurveEnum(%rip),%rax
   *   0xab4a4           addq $0x10,%rax
   *   0xab4a8           movq %rax,(%rbx)                                    (primary vptr write)
   *   0xab4ab           movq __ZN22OZCurveEnumSplineState13_instanceOnceE,%rax
   *   0xab4b2           movq (%rax),%rax
   *   0xab4b5           cmpq $-0x1,%rax                                     (once-flag "done" sentinel)
   *   0xab4b9           je 0xab4e2                                          (fast-path: already run)
   *          @0xab4bb..0xab4dd  build the std::__1::tuple<...&&> lambda-arg on the stack
   *                              (leaq -0x11(%rbp),%rax  — a 1-byte "arg" for the lambda) and
   *                              call __ZNSt3__111__call_onceERVmPvPFvS2_E with
   *                                rdi = &once, rsi = &tuple, rdx = &__call_once_proxy<lambda>.
   *   0xab4e2           movq __ZN22OZCurveEnumSplineState9_instanceE,%rax    (load instance slot addr)
   *   0xab4e9           movq (%rax),%rax                                    (deref -> raw instance ptr)
   *   0xab4ec           leaq 0x8(%rax),%rsi                                 (rsi = raw + 0x8 sub-object)
   *   0xab4f0           testq %rax,%rax
   *   0xab4f3           cmoveq %rax,%rsi                                    (null -> keep null)
   *   0xab4f7           movq %rbx,%rdi                                      (this = new_obj)
   *   0xab4fa           callq __ZN7OZCurve14setSplineStateEP13OZSplineState
   *   0xab4ff..0xab506  movq 0xa0(%rbx),%rax ; movl $0x0,0x20(%rax)          (post-init side-effect)
   *   0xab50d           movb $0x0,0x2(%rax)                                 (post-init side-effect)
   *   0xab511..0xab519  vt-slot 0x50 dispatch on new_obj:
   *                       movq (%rbx),%rax ; movq %rbx,%rdi ; xorl %esi,%esi ; callq *0x50(%rax)
   *                       (calls new_obj->vt[0x50/8=10](this, 0)  — a virtual method on OZCurveEnum
   *                        whose slot resolves via the freshly-installed __ZTV11OZCurveEnum+0x10 —
   *                        deferred to postInitializeOZCurveEnum() below @0xab519.)
   *   0xab51c..0xab527  epilogue (return new_obj).
   *   0xab528..0xab536  unwind pad #1: before the vptr install completed
   *                     -> operator delete(new_obj) + __Unwind_Resume.
   *   0xab53b..0xab551  unwind pad #2: after OZCurve ctor completed
   *                     -> OZCurve::~OZCurve(new_obj) + operator delete + __Unwind_Resume.
   *
   * The two post-init writes @0xab4ff..0xab50d are into `*(new_obj + 0xa0)` (a struct pointer
   * stored inside the freshly-built OZCurveEnum). Since the OZCurve/OZCurveEnum layout is not
   * yet decoded here, we surface the write as a call into the OZCurveEnum instance itself and
   * let the un-ported class handle the byte semantics — but the +0xa0 field, the u32-zero at
   * +0x20 of that inner struct, and the u8-zero at +0x2 are FRONTIER: the callee that would
   * decode them belongs in OZCurveEnum.ts. To avoid a silent gap we throw from the frontier
   * stub `postInitializeOZCurveEnum` below.
   */
  static createOZChannelEnumCurve(v: number): OZCurveEnumShape {
    // @0xab470 — operator new(0xb0). Modelled as a plain-object shape (the 0xb0 byte-size is
    // captured in K_OZCURVEENUM_SIZE for auditability). No implicit zeroing — every field
    // is set by the ctor call below.
    void K_OZCURVEENUM_SIZE;
    const curve: OZCurveEnumShape = {
      // seed to the C++ pre-ctor state; OZCurve ctor is the one that "installs" the base vptr
      // (which is then overwritten @0xab4a8 to the OZCurveEnum vptr).
      vtable_kind: "OZCurve",
      splineState: undefined,
    };

    // @0xab47d..0xab498 — OZCurve base ctor with (0.0, 4294967295.0, 1.0, v).
    OZCurve_ctor4d(curve, K_ZERO, K_UINT32_MAX_D, K_ONE, v);

    // @0xab49d..0xab4a8 — overwrite the primary vptr to `__ZTV11OZCurveEnum + 0x10`.
    curve.vtable_kind = "OZCurveEnum";

    // @0xab4ab..0xab4dd — lazily initialise the OZCurveEnumSplineState singleton
    // (std::call_once). JS memoisation of the getInstance() call handles this implicitly.
    const rawInstance: OZSplineStatePtr = OZCurveEnumSplineState_getInstance();

    // @0xab4ec / 0xab4f0..0xab4f3 — apply the +0x8 sub-object adjust unless the raw pointer is
    // null. C++ uses byte-offset multiple-inheritance thunks; JS cannot subdivide an object
    // pointer by 8 bytes, so identity+8-adjust is modelled by passing the raw pointer through
    // unchanged. The exact pointer arithmetic is preserved in this comment and must be
    // reinstated once OZSplineState + OZCurveEnumSplineState are transcribed.
    let stateArg: OZSplineStatePtr;
    if (rawInstance === null || rawInstance === undefined) {
      stateArg = rawInstance;
    } else {
      stateArg = rawInstance;
    }

    // @0xab4fa — OZCurve::setSplineState(this, state+0x8).
    OZCurve_setSplineState(curve, stateArg);

    // @0xab4ff..0xab519 — post-init side-effects on `*(new_obj + 0xa0)` and a virtual dispatch
    // through `new_obj->vt[0x50]`. Both belong to OZCurveEnum, whose full ctor tail is not
    // decoded here. Surface as a frontier throw so the gap is loud.
    postInitializeOZCurveEnum(curve);

    // @0xab51c — return new_obj.
    return curve;
  }
}

/**
 * Frontier stub covering the tail @0xab4ff..0xab519:
 *
 *   0xab4ff  movq 0xa0(%rbx),%rax
 *   0xab503  movl $0x0, 0x20(%rax)                  // *(newObj+0xa0)+0x20 = 0u32
 *   0xab50d  movb $0x0, 0x2(%rax)                   // *(newObj+0xa0)+0x2  = 0u8
 *   0xab511  movq (%rbx),%rax                       // rax = vptr
 *   0xab514  movq %rbx,%rdi                         // arg0 = this
 *   0xab517  xorl %esi,%esi                         // arg1 = 0
 *   0xab519  callq *0x50(%rax)                      // vt-slot 0x50 (index 10) on OZCurveEnum
 *
 * The vtable slot at offset 0x50 resolves via `__ZTV11OZCurveEnum + 0x10 + 0x50`. Its method
 * identity is recoverable via `raw-port/army/tools/resolve.py Ozone vtable OZCurveEnum 0x50`
 * once we open OZCurveEnum.ts for decode — leaving as a frontier throw here preserves the
 * @0xADDR trail without inventing a body.
 */
function postInitializeOZCurveEnum(_curve: OZCurveEnumShape): void {
  throw new Error(
    "OZCurveEnum post-init tail @Ozone 0xab4ff..0xab519 not yet transcribed (writes *(this+0xa0)+0x20=0u32, *(this+0xa0)+0x2=0u8, then dispatches this->vt[0x50](this,0) via __ZTV11OZCurveEnum)",
  );
}
