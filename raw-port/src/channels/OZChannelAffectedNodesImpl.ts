// OZChannelAffectedNodesImpl — the "impl" sidecar for OZChannelAffectedNodes.
//
// Framework: Ozone
//
// Provenance (raw-port/re/disasm/OZChannelAffectedNodesImpl.*.s):
//   OZChannelAffectedNodesImpl::OZChannelAffectedNodesImpl()   @0x0001d890  (C2, ctor)
//     mangled __ZN26OZChannelAffectedNodesImplC2Ev
//   OZChannelAffectedNodesImpl::~OZChannelAffectedNodesImpl()  @0x0001d9d0  (D1, base dtor)
//     mangled __ZN26OZChannelAffectedNodesImplD1Ev
//   OZChannelAffectedNodesImpl::~OZChannelAffectedNodesImpl()  @0x0001d9f0  (D0, deleting dtor)
//     mangled __ZN26OZChannelAffectedNodesImplD0Ev
//
// The ledger lists exactly these three T-symbols under `__ZN26OZChannelAffectedNodesImpl*`.
// The class extends OZChannelImpl and installs its own vtable.
//
// STRUCT LAYOUT (from the ctor + D1/D0 disasm):
//   +0x00  vptr     — set to `__ZTV26OZChannelAffectedNodesImpl + 0x10` @0x1d978 (ctor).
//                    OZChannelImpl base ctor also stores the base vptr first (see
//                    OZChannelImpl::OZChannelImpl(OZCurve*,double,uint,bool)); this line
//                    overrides it.
//   +0x28  PCSingleton  member — ctor-initialised via `PCSingleton::PCSingleton(uint)` with
//                    argument 0x64 @0x1d968. Destroyed unconditionally by BOTH D1 (@0x1d9dd)
//                    and D0 (@0x1d9fd) via `PCSingleton::~PCSingleton()`.
//                    (Also gets a second vptr `__ZTV26OZChannelAffectedNodesImpl + 0x30`
//                    written at (this+0x28) @0x1d97f *after* the PCSingleton ctor — so the
//                    PCSingleton subobject also carries a virtual dispatch pointer.)
//   [everything else inherited from OZChannelImpl; not touched by these three methods.]
//
// OZChannelImpl base sub-structure touched by the ctor:
//   OZChannelImpl base ctor writes many fields (see OZChannelImpl::OZChannelImpl signature —
//   a heap-allocated OZCurve*, a double, a uint, and a bool). Its output layout is not
//   modelled here (frontier). But the ctor DOES read `(this+0xa0)` @0x1d92d off the
//   *heap-allocated OZCurve* it built — so OZCurve has a member pointer at +0xa0 whose
//   +0x20 slot is written to 0 (an int) @0x1d934 and +0x2 slot to 0 (a byte) @0x1d93b.
//   This is captured verbatim in the ctor transcription; it's an OZCurve concern, not this
//   class's own storage.
//
// Callees / RIP-relative refs (resolve.py Ozone stubs / consts / vtable syms):
//   __Znwm                                              (@0x1d8a5 stub 0x6dfca2) — operator new(size_t)
//                                                        with 0xb0 bytes (=176 = sizeof(OZCurveEnum)).
//   __ZN7OZCurveC2Edddd                                 (@0x1d8c6 stub 0x6dec16) — OZCurve base ctor
//                                                        with (min=0.0, max=4294967295.0, step=1.0, init=0.0).
//                                                        Doubles read from RIP-relative literal pool:
//                                                          @0x1d8ad -> 0x705c80 = 4294967295.0
//                                                              (u64=0x41efffffffe00000; the exact
//                                                              double for u32 max)
//                                                          @0x1d8b5 -> 0x7053e0 = 1.0
//                                                              (u64=0x3ff0000000000000)
//                                                          xmm0/xmm3 zeroed via xorps.
//   __ZTV11OZCurveEnum                                  (@0x1d8cb literal pool sym addr; +0x10 primary
//                                                        vptr, installed @0x1d8d6 into (%r14)).
//   __ZN22OZCurveEnumSplineState13_instanceOnceE        (@0x1d8d9/@0x1d8f9 once-flag data addr).
//   __ZNSt3__117__call_once_proxyB9nqe210106<...OZCurveEnumSplineState::getInstance...lambda...>Pv
//                                                        (@0x1d900 proxy fn) — bound one-shot init
//                                                        of the SplineState singleton.
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                (@0x1d90b stub 0x6dfb2e).
//   __ZN22OZCurveEnumSplineState9_instanceE             (@0x1d910 sym addr) — the singleton pointer.
//   __ZN7OZCurve14setSplineStateEP13OZSplineState       (@0x1d928 stub 0x6debfe) — installs the
//                                                        SplineState singleton on the new OZCurve.
//   __ZN13OZChannelImplC2EP7OZCurvedjb                  (@0x1d95a stub 0x6dd9f8) — OZChannelImpl base
//                                                        ctor (OZCurve*, double=0.0 via xmm0, uint=0,
//                                                        bool=1). Note the "1" is passed via ecx.
//   __ZN11PCSingletonC2Ej                               (@0x1d968 stub 0x6dd638) — PCSingleton member
//                                                        ctor at (this+0x28) with u32 arg 0x64=100.
//   __ZTV26OZChannelAffectedNodesImpl                   (@0x1d96d literal pool sym addr; +0x10 primary
//                                                        vptr @0x1d978 -> (this+0); +0x30 secondary
//                                                        vptr @0x1d97f -> (this+0x28)).
//   __ZN11PCSingletonD2Ev                               (D1 @0x1d9dd, D0 @0x1d9fd) — stub 0x6dd63e.
//   __ZN13OZChannelImplD2Ev                             (ctor unwind @0x1d994; D1 tail @0x1d9eb;
//                                                        D0 call @0x1da05) — stub 0x6dd9fe.
//   __ZN7OZCurveD2Ev                                    (ctor unwind @0x1d9ba) — stub 0x6dec1c.
//   __ZdlPv  (operator delete)                          (ctor unwind @0x1d9a7, @0x1d9c2; D0 tail
//                                                        @0x1da13) — stub 0x6dfc36.
//   __Unwind_Resume                                     (ctor unwind @0x1d99c, @0x1d9af, @0x1d9ca)
//                                                        — stub 0x6dd07a.

/** External `__Znwm` — `operator new(size_t)`. Not yet transcribed. */
function operator_new(_size: number): OZCurveEnumHandle {
  throw new Error(
    'operator new(unsigned long) @Ozone stub 0x6dfca2 ' +
      '(__Znwm) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl ctor @0x0001d8a5 with size=0xb0',
  );
}

/** External `__ZN7OZCurveC2Edddd` — `OZCurve::OZCurve(double,double,double,double)`. Base ctor.
 *  Not yet transcribed. */
function OZCurve_ctor(
  _self: OZCurveEnumHandle,
  _min: number,
  _max: number,
  _step: number,
  _init: number,
): void {
  throw new Error(
    'OZCurve::OZCurve(double,double,double,double) @Ozone stub 0x6dec16 ' +
      '(__ZN7OZCurveC2Edddd) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl ctor @0x0001d8c6 with ' +
      '(min=0.0, max=4294967295.0 [0x41efffffffe00000], step=1.0 [0x3ff0000000000000], init=0.0)',
  );
}

/** External `__ZNSt3__111__call_onceERVmPvPFvS2_E` — `std::call_once`. Not yet transcribed. */
function std_call_once(
  _flagAddr: unknown,
  _tupleAddr: unknown,
  _proxyFn: unknown,
): void {
  throw new Error(
    'std::__1::call_once @Ozone stub 0x6dfb2e ' +
      '(__ZNSt3__111__call_onceERVmPvPFvS2_E) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl ctor @0x0001d90b for ' +
      '__ZN22OZCurveEnumSplineState13_instanceOnceE',
  );
}

/** External `__ZN7OZCurve14setSplineStateEP13OZSplineState` —
 *  `OZCurve::setSplineState(OZSplineState*)`. Not yet transcribed. */
function OZCurve_setSplineState(
  _curve: OZCurveEnumHandle,
  _splineState: unknown,
): void {
  throw new Error(
    'OZCurve::setSplineState(OZSplineState*) @Ozone stub 0x6debfe ' +
      '(__ZN7OZCurve14setSplineStateEP13OZSplineState) not yet transcribed — ' +
      'invoked by OZChannelAffectedNodesImpl ctor @0x0001d928',
  );
}

/** External `__ZN13OZChannelImplC2EP7OZCurvedjb` —
 *  `OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool)`. Base class ctor.
 *  Not yet transcribed. */
function OZChannelImpl_ctor(
  _self: OZChannelAffectedNodesImpl,
  _curve: OZCurveEnumHandle,
  _d: number,
  _u: number,
  _b: boolean,
): void {
  throw new Error(
    'OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool) @Ozone stub 0x6dd9f8 ' +
      '(__ZN13OZChannelImplC2EP7OZCurvedjb) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl ctor @0x0001d95a with ' +
      '(curve=newOZCurveEnum, d=0.0 [xmm0 xored], u=0 [edx xored], b=true [ecx=1])',
  );
}

/** External `__ZN11PCSingletonC2Ej` — `PCSingleton::PCSingleton(unsigned int)`. Member ctor at
 *  `this + 0x28`. Not yet transcribed. */
function PCSingleton_ctor(_addrOfMember: unknown, _u: number): void {
  throw new Error(
    'PCSingleton::PCSingleton(unsigned int) @Ozone stub 0x6dd638 ' +
      '(__ZN11PCSingletonC2Ej) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl ctor @0x0001d968 with u=0x64 on `this + 0x28`',
  );
}

/** External `__ZN11PCSingletonD2Ev` — `PCSingleton::~PCSingleton()`. Not yet transcribed. */
function PCSingleton_dtor(_addrOfMember: unknown): void {
  throw new Error(
    'PCSingleton::~PCSingleton() @Ozone stub 0x6dd63e ' +
      '(__ZN11PCSingletonD2Ev) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl D1 @0x0001d9dd and D0 @0x0001d9fd on `this + 0x28`',
  );
}

/** External `__ZN13OZChannelImplD2Ev` — `OZChannelImpl::~OZChannelImpl()`. Not yet transcribed. */
function OZChannelImpl_dtor(_self: OZChannelAffectedNodesImpl): void {
  throw new Error(
    'OZChannelImpl::~OZChannelImpl() @Ozone stub 0x6dd9fe ' +
      '(__ZN13OZChannelImplD2Ev) not yet transcribed — invoked by ' +
      'OZChannelAffectedNodesImpl D1 tail-jmp @0x0001d9eb and D0 direct call @0x0001da05',
  );
}

/** Virtual-dispatch call in the ctor @0x0001d947: `callq *0x50(%rax)` where `rax = *(%r14)`
 *  is the OZCurveEnum's PRIMARY vptr (`__ZTV11OZCurveEnum + 0x10`). Slot +0x50 into that vtable
 *  is the target method. Not yet resolved via `resolve.py vtable OZCurveEnum 0x50`; frontier. */
function OZCurveEnum_vt50(_self: OZCurveEnumHandle, _arg0: number): void {
  throw new Error(
    'OZCurveEnum vtable slot *0x50 @Ozone (called via `callq *0x50(%rax)`) ' +
      'not yet transcribed — invoked by OZChannelAffectedNodesImpl ctor @0x0001d947 ' +
      'with esi=0 (arg is zero-int); slot in `__ZTV11OZCurveEnum` (loaded @0x1d8cb)',
  );
}

/** Handle for a heap-allocated `OZCurveEnum` instance built by the ctor. Represents the
 *  pointer stored on the stack (rax → r14) at @0x1d8aa. The layout of `OZCurveEnum` itself is
 *  not modelled here — the ctor treats it as an opaque C++ object it hands off to
 *  `OZChannelImpl::OZChannelImpl(OZCurve*, …)`, except for two reads it performs on the
 *  contained OZCurve base: `(curve+0xa0)` @0x1d92d (deref → some struct), then writing zero
 *  to `+0x20` (int) @0x1d934 and zero to `+0x2` (byte) @0x1d93b of that struct.
 *
 *  These writes are transcribed on the handle-holder object below to preserve the exact
 *  execution order; they are NOT properties of this class. */
export interface OZCurveEnumHandle {
  /** The struct reachable via `*(curve+0xa0)`. Its byte layout is unknown; we only touch two
   *  fields the ctor writes.  @Ozone read: 0x1d92d. */
  fieldA0?: {
    /** int32 at struct offset +0x20. Written to 0 by ctor @0x0001d934. */
    plus20?: number;
    /** int8 at struct offset +0x02. Written to 0 by ctor @0x0001d93b. */
    plus02?: number;
  };
}

/**
 * OZChannelAffectedNodesImpl — the per-channel Impl sidecar for OZChannelAffectedNodes.
 *
 * TS does NOT extend an `OZChannelImpl` base class here (see the analogous note in
 * OZChannelAspectRatioImpl.ts): the base's fields are un-decoded, so extending would
 * fabricate empty slots that make the ctor's mirror/init pattern unfaithful. Only the
 * fields both dtors and the ctor prove are modelled: +0x28 PCSingleton, and the vptr.
 */
export class OZChannelAffectedNodesImpl {
  /** `PCSingleton` member at C++ offset +0x28. Ctor-initialised with arg 0x64 @0x0001d968;
   *  destroyed unconditionally by D1 (@0x0001d9dd) and D0 (@0x0001d9fd).
   *  The ctor also writes a SECOND vptr slot `__ZTV26OZChannelAffectedNodesImpl + 0x30` to
   *  (this+0x28) @0x0001d97f *after* the PCSingleton ctor — so the PCSingleton subobject
   *  carries its own vtable pointer that overrides the one PCSingleton::PCSingleton wrote. */
  singletonMember!: unknown;

  /**
   * OZChannelAffectedNodesImpl::OZChannelAffectedNodesImpl() @0x0001d890.
   *
   * Faithful transcription (raw-port/re/disasm/OZChannelAffectedNodesImpl.OZChannelAffectedNodesImpl.s):
   *   @0x1d890 pushq %rbp                                — frame setup
   *   @0x1d891 movq  %rsp, %rbp
   *   @0x1d894 pushq %r15                                — save callee-saved regs
   *   @0x1d896 pushq %r14
   *   @0x1d898 pushq %rbx
   *   @0x1d899 subq  $0x18, %rsp                         — 24-byte scratch (tuple for call_once)
   *   @0x1d89d movq  %rdi, %rbx                          — this -> rbx
   *   @0x1d8a0 movl  $0xb0, %edi                         — new(0xb0) = new(176 bytes = sizeof OZCurveEnum)
   *   @0x1d8a5 callq operator new(size_t)                — heap-alloc the OZCurveEnum
   *   @0x1d8aa movq  %rax, %r14                          — save the raw pointer (curve)
   *   @0x1d8ad movsd (rip+0x6e83cb), %xmm1               — xmm1 = *(pc+0x6e83cb) = 4294967295.0
   *   @0x1d8b5 movsd (rip+0x6e7b23), %xmm2               — xmm2 = *(pc+0x6e7b23) = 1.0
   *   @0x1d8bd xorps %xmm0, %xmm0                        — xmm0 = 0.0
   *   @0x1d8c0 xorps %xmm3, %xmm3                        — xmm3 = 0.0
   *   @0x1d8c3 movq  %rax, %rdi                          — arg0 = curve
   *   @0x1d8c6 callq OZCurve::OZCurve(d,d,d,d)           — construct in-place: (0, u32max, 1, 0)
   *   @0x1d8cb leaq  __ZTV11OZCurveEnum(%rip), %rax
   *   @0x1d8d2 addq  $0x10, %rax                         — rax = OZCurveEnum vtable + 0x10 (installed ptr)
   *   @0x1d8d6 movq  %rax, (%r14)                        — install vptr on the new OZCurve → OZCurveEnum
   *   @0x1d8d9-@0x1d90b std::call_once(OZCurveEnumSplineState::_instanceOnce, lambda) —
   *                    with -1 sentinel "already-done" fast-path skip (@0x1d8e3 cmpq $-0x1;
   *                    @0x1d8e7 je 0x1d910); tuple is built on the stack at -0x30/-0x28(%rbp)
   *                    and passed as `rsi` to __call_once.
   *   @0x1d910 movq  __ZN22OZCurveEnumSplineState9_instanceE(%rip), %rax   — load singleton addr
   *   @0x1d917 movq  (%rax), %rax                                          — deref singleton pointer
   *   @0x1d91a leaq  0x8(%rax), %rsi                                       — rsi = singleton + 0x8
   *   @0x1d91e testq %rax, %rax
   *   @0x1d921 cmoveq %rax, %rsi                                           — if singleton == NULL: rsi = NULL
   *   @0x1d925 movq  %r14, %rdi                                            — arg0 = curve
   *   @0x1d928 callq OZCurve::setSplineState(splineState)                  — install SplineState
   *   @0x1d92d movq  0xa0(%r14), %rax                                      — rax = curve+0xa0 (some struct*)
   *   @0x1d934 movl  $0x0, 0x20(%rax)                                      — struct->+0x20 = 0 (int)
   *   @0x1d93b movb  $0x0, 0x2(%rax)                                       — struct->+0x02 = 0 (byte)
   *   @0x1d93f movq  (%r14), %rax                                          — rax = curve->vptr
   *   @0x1d942 movq  %r14, %rdi                                            — arg0 = curve
   *   @0x1d945 xorl  %esi, %esi                                            — arg1 = 0
   *   @0x1d947 callq *0x50(%rax)                                           — virtual dispatch vt[+0x50]
   *   @0x1d94a xorps %xmm0, %xmm0                                          — xmm0 = 0.0
   *   @0x1d94d movq  %rbx, %rdi                                            — arg0 = this
   *   @0x1d950 movq  %r14, %rsi                                            — arg1 = curve
   *   @0x1d953 xorl  %edx, %edx                                            — arg3 = 0 (uint)
   *   @0x1d955 movl  $0x1, %ecx                                            — arg4 = 1 (bool true)
   *   @0x1d95a callq OZChannelImpl::OZChannelImpl(this,curve,0.0,0,true)   — base ctor
   *   @0x1d95f leaq  0x28(%rbx), %rdi                                      — rdi = this + 0x28
   *   @0x1d963 movl  $0x64, %esi                                           — arg1 = 100
   *   @0x1d968 callq PCSingleton::PCSingleton(u=100)                       — construct +0x28 member
   *   @0x1d96d leaq  __ZTV26OZChannelAffectedNodesImpl(%rip), %rax
   *   @0x1d974 leaq  0x10(%rax), %rcx                                      — vt + 0x10 (primary installed)
   *   @0x1d978 movq  %rcx, (%rbx)                                          — (this+0)  = primary vptr
   *   @0x1d97b addq  $0x30, %rax                                           — vt + 0x30 (secondary installed)
   *   @0x1d97f movq  %rax, 0x28(%rbx)                                      — (this+0x28) = secondary vptr
   *   @0x1d983-@0x1d98d  epilogue: undo 0x18 scratch, pop rbx/r14/r15/rbp, ret.
   *
   *   Exception unwinds (not on the normal path):
   *     @0x1d98e-@0x1d99c  after PCSingleton ctor throws: dtor OZChannelImpl base then _Unwind_Resume.
   *     @0x1d9a1-@0x1d9af  after OZChannelImpl ctor throws: `operator delete(curve)` then Unwind_Resume.
   *     @0x1d9b4-@0x1d9ca  after OZCurve::setSplineState (or earlier post-OZCurveCtor path) throws:
   *                        OZCurve::~OZCurve, `operator delete(curve)`, Unwind_Resume.
   *   These paths are documented but NOT modelled in TS — none of our frontier stubs unwind
   *   cleanly, and the port is a straight-line transcription of the happy path.
   */
  static newDefault(): OZChannelAffectedNodesImpl {
    const self = new OZChannelAffectedNodesImpl();

    // @0x1d8a0-@0x1d8a5 — heap-alloc the OZCurveEnum backing storage.
    const curve: OZCurveEnumHandle = operator_new(0xb0);

    // @0x1d8ad-@0x1d8c6 — construct OZCurve(0.0, 4294967295.0, 1.0, 0.0).
    // Constants read from Ozone .rodata: 0x705c80 = 4294967295.0 (u64=0x41efffffffe00000),
    // 0x7053e0 = 1.0 (u64=0x3ff0000000000000). Doubles NOT rounded to f32 (movsd, not movss).
    OZCurve_ctor(curve, 0.0, 4294967295.0, 1.0, 0.0);

    // @0x1d8cb-@0x1d8d6 — install `__ZTV11OZCurveEnum + 0x10` at (curve+0). Implicit in TS
    // (we treat the handle as already-typed OZCurveEnum).

    // @0x1d8d9-@0x1d90b — std::call_once(OZCurveEnumSplineState::_instanceOnce, lambda).
    // The lambda populates the `_instance` singleton pointer. Modeled as a frontier throw
    // that runs even on the "already-done" path (guard omitted in TS — an already-done
    // once flag has no observable effect on the singleton read that follows, so we can call
    // the frontier stub either way; when the stub is decoded it can implement the sentinel
    // fast-path itself).
    std_call_once(
      /* &_instanceOnce */ '__ZN22OZCurveEnumSplineState13_instanceOnceE',
      /* tuple pointer built at -0x28(%rbp) */ curve,
      /* proxy fn */ '__ZNSt3__117__call_once_proxy...OZCurveEnumSplineState::getInstance::lambda...',
    );

    // @0x1d910-@0x1d928 — read `_instance` (nullable), pass (instance ? instance+0x8 : NULL)
    // to OZCurve::setSplineState(curve, ptr). Frontier throw; the getInstance singleton read
    // is folded into the stub (the port has no data model for the singleton yet).
    OZCurve_setSplineState(curve, /* singleton+0x8, NULL-guarded */ null);

    // @0x1d92d-@0x1d93b — read *(curve+0xa0), write 0 to its +0x20 (int) and +0x2 (byte).
    // We record these on the handle so the ordering is preserved when the OZCurveEnum
    // structure is later modelled.
    curve.fieldA0 = { plus20: 0, plus02: 0 };

    // @0x1d93f-@0x1d947 — virtual dispatch (curve->vptr[+0x50])(curve, 0).
    OZCurveEnum_vt50(curve, 0);

    // @0x1d94a-@0x1d95a — base ctor: OZChannelImpl(this, curve, 0.0, 0, true).
    OZChannelImpl_ctor(self, curve, 0.0, 0, true);

    // @0x1d95f-@0x1d968 — construct +0x28 PCSingleton with u32 arg 0x64 (=100).
    PCSingleton_ctor(/* &this.singletonMember (this + 0x28) */ self, 0x64);

    // @0x1d96d-@0x1d97f — install the derived class's vtable:
    //   primary   vptr = __ZTV26OZChannelAffectedNodesImpl + 0x10 -> (this + 0x00)
    //   secondary vptr = __ZTV26OZChannelAffectedNodesImpl + 0x30 -> (this + 0x28)
    // Both are implicit in TS.

    return self;
  }

  /**
   * OZChannelAffectedNodesImpl::~OZChannelAffectedNodesImpl() @0x0001d9d0 (D1 — base dtor).
   *
   * Faithful transcription (raw-port/re/disasm/OZChannelAffectedNodesImpl.D1.s):
   *   @0x1d9d0 pushq %rbp
   *   @0x1d9d1 movq  %rsp, %rbp
   *   @0x1d9d4 pushq %rbx
   *   @0x1d9d5 pushq %rax                                — align push
   *   @0x1d9d6 movq  %rdi, %rbx                          — this -> rbx
   *   @0x1d9d9 addq  $0x28, %rdi                         — rdi = this + 0x28
   *   @0x1d9dd callq PCSingleton::~PCSingleton()         — destroy +0x28 member
   *   @0x1d9e2 movq  %rbx, %rdi                          — rdi = this
   *   @0x1d9e5 addq  $0x8, %rsp
   *   @0x1d9e9 popq  %rbx
   *   @0x1d9ea popq  %rbp
   *   @0x1d9eb jmp   OZChannelImpl::~OZChannelImpl()     — tail-jmp base dtor
   */
  destroyBase(): void {
    // @0x1d9d9 + @0x1d9dd
    PCSingleton_dtor(this);
    // @0x1d9eb — tail-jmp
    OZChannelImpl_dtor(this);
  }

  /**
   * OZChannelAffectedNodesImpl::~OZChannelAffectedNodesImpl() @0x0001d9f0 (D0 — deleting dtor).
   *
   * Faithful transcription (raw-port/re/disasm/OZChannelAffectedNodesImpl.D0.s):
   *   @0x1d9f0 pushq %rbp
   *   @0x1d9f1 movq  %rsp, %rbp
   *   @0x1d9f4 pushq %rbx
   *   @0x1d9f5 pushq %rax
   *   @0x1d9f6 movq  %rdi, %rbx
   *   @0x1d9f9 addq  $0x28, %rdi
   *   @0x1d9fd callq PCSingleton::~PCSingleton()         — destroy +0x28 member
   *   @0x1da02 movq  %rbx, %rdi
   *   @0x1da05 callq OZChannelImpl::~OZChannelImpl()     — DIRECT call (not tail-jmp)
   *   @0x1da0a movq  %rbx, %rdi
   *   @0x1da0d addq  $0x8, %rsp
   *   @0x1da11 popq  %rbx
   *   @0x1da12 popq  %rbp
   *   @0x1da13 jmp   operator delete(void*)              — tail-jmp free
   */
  destroyAndFree(): void {
    // @0x1d9f9 + @0x1d9fd
    PCSingleton_dtor(this);
    // @0x1da05 — DIRECT call (base dtor runs to completion first)
    OZChannelImpl_dtor(this);
    // @0x1da13 — tail-jmp operator delete
    operator_delete_free(this);
  }
}

/** External `__ZdlPv` — `operator delete(void*)`. Not yet transcribed. Named
 *  `operator_delete_free` to avoid the `delete` reserved word. */
function operator_delete_free(_self: OZChannelAffectedNodesImpl): void {
  throw new Error(
    'operator delete(void*) @Ozone stub 0x6dfc36 ' +
      '(__ZdlPv) not yet transcribed — tail-jmp by ' +
      'OZChannelAffectedNodesImpl D0 @0x0001da13',
  );
}
