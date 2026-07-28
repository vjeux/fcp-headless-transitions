// raw-port: RandMersenne — ProCore framework (channels layer)
//
// A thin wrapper around the dSFMT (double-precision SIMD-oriented Fast
// Mersenne Twister) library. All six published methods are decoded here
// from ProCore's x86_64 slice:
//
//   0x0000000000003042  RandMersenne::RandMersenne()           (C2 base)
//   0x0000000000003068  RandMersenne::RandMersenne()           (C1 complete)
//   0x000000000000308e  RandMersenne::~RandMersenne()          (D2 base)
//   0x00000000000030b4  RandMersenne::~RandMersenne()          (D1 complete)
//   0x00000000000030da  RandMersenne::~RandMersenne()          (D0 deleting)
//   0x00000000000030e4  RandMersenne::SetSeed(unsigned long)
//
// The C2/C1/D2/D1 bodies are IDENTICAL, differing only in the vtable
// address they store (three sibling vtable relocations at rip+0x1458e3,
// +0x1458bd, +0x145897, +0x145871). Each of these six-instruction
// prologue-vtable-clear-tail-epilogue routines does exactly:
//     *(void**)this          = &vtable_for_RandMersenne;   // @0x304d/0x3073/0x3099/0x30bf
//     *(u128*)(this + 0xC10) = 0;                          // xorps xmm0,xmm0 ; movups
//     *(u64*)(this + 0xC20)  = 0;                          // movq $0, [rbx+0xc20]
// D0 (deleting dtor @0x30da) is a bare tail-jmp to `operator delete`
// (@0xde6c0 __ZdlPv), reached only through the vtable when destroying
// a heap-allocated instance. No dSFMT teardown is performed — the
// state has no heap allocations of its own (it's an inline u128-aligned
// blob owned by the object).
//
// SetSeed (@0x30e4) is the only non-trivial method:
//     rdi = this
//     lea  rdi, [rdi + 0x08]               ; @0x30ed  -- pointer to dSFMT state
//     mov  edx, 0x4DE1                     ; @0x30f1  -- MEXP = 19937
//     call _dsfmt_chk_init_gen_rand        ; @0x30f6  -- (state*, seed=rsi, mexp=0x4DE1)
//     xorps xmm0, xmm0                     ; @0x30fb
//     movups [rbx+0xC10], xmm0             ; @0x30fe  -- clear cached-double pair
//     movq  $0, [rbx+0xC20]                ; @0x3105  -- clear index/counter
//
// Object layout (proven by field-offset stores across all six methods):
//   +0x0000 (void*)  vtable pointer          — one of four RTTI-siblings
//                                              @rip+0x145871..0x1458e3
//   +0x0008 (dSFMT)  state[0xC08 bytes]      — a `dsfmt_t` struct
//                                              (period 2^19937-1, 156-lane
//                                              array of __m128d + status).
//                                              Passed to
//                                              `dsfmt_chk_init_gen_rand`
//                                              at @0x30f6.
//   +0x0C10 (f64)    cachedDouble0           — cleared by every ctor/dtor
//                                              and by SetSeed (@0x30fe).
//   +0x0C18 (f64)    cachedDouble1           — cleared with the same
//                                              16-byte SSE store as
//                                              cachedDouble0.
//   +0x0C20 (u64)    counter                 — cleared by every ctor/dtor
//                                              and by SetSeed (@0x3105).
//                                              Used by outbound draw
//                                              methods (not published in
//                                              this class's exported
//                                              symbol set, hence not
//                                              transcribed here).
//
// The dSFMT library itself is a THIRD-PARTY C module — it is not part of
// the FCP object files that this port covers. Its state initializer
// (`dsfmt_chk_init_gen_rand`) is called across a shared-library boundary
// and is not decoded in this port. Per Rule 3 of PORTING_SPEC.md, the
// wrapper transcribes the FCP call site faithfully and RAISES on the
// undecoded external routine rather than approximating it.

/**
 * RandMersenne — FCP's dSFMT-19937 wrapper.
 *
 * Owns a `dsfmt_t` state (offset +0x08 in the C++ object) plus two
 * cached doubles (+0xC10, +0xC18) and a 64-bit counter (+0xC20). All
 * ctors leave the state uninitialized (raw storage); a subsequent
 * `SetSeed(seed)` call is required before any draw. This mirrors the
 * asm: the ctor at 0x3042 does not touch bytes [+0x08 .. +0xC10), only
 * the trailing cache/counter.
 */
export class RandMersenne {
  /**
   * dSFMT state blob (raw bytes as a Uint8Array of length 0xC08).
   *
   * This mirrors the object's [+0x08 .. +0xC10) region. The layout of
   * the interior — a `dsfmt_t` — is defined by the third-party dSFMT
   * library, not by ProCore. It is NOT decoded here; only its address
   * relative to `this` is (@0x30ed: `lea rdi, [rdi+0x8]`).
   */
  private state: Uint8Array;

  /**
   * Cached double at object offset +0xC10.
   *
   * Cleared to +0.0 by every ctor/dtor (@0x3053, 0x3079, 0x309f, 0x30c5)
   * and by SetSeed (@0x30fe) via a 16-byte `xorps`/`movups` pair that
   * spans BOTH cachedDouble0 and cachedDouble1.
   */
  private cachedDouble0: number;

  /**
   * Cached double at object offset +0xC18.
   *
   * Cleared to +0.0 alongside `cachedDouble0` by the same 16-byte
   * SSE store described above.
   */
  private cachedDouble1: number;

  /**
   * Draw counter / index at object offset +0xC20.
   *
   * Cleared to 0 by every ctor/dtor (@0x305a, 0x3080, 0x30a6, 0x30cc)
   * and by SetSeed (@0x3105). Consumed by draw methods that are not
   * part of this class's exported six-symbol set, hence not decoded
   * here.
   */
  private counter: bigint;

  /**
   * RandMersenne::RandMersenne() — C2 base ctor @0x3042
   *                                 C1 complete ctor @0x3068
   *
   * Both ctors are byte-identical apart from the vtable relocation
   * they store at *(this+0). In TS we have no vtable slot, so the
   * ctor here only performs the trailing-field zeroing that both
   * asm bodies do at @0x3053/0x3079 (xorps xmm0,xmm0 ; movups
   * xmm0, [rdi+0xC10]) and @0x305a/0x3080 (movq $0, [rdi+0xC20]).
   *
   * The dSFMT state region [+0x08 .. +0xC10) is NOT touched by the
   * ctor — its 0xC08 bytes are left in whatever raw storage state
   * they came in. A subsequent `SetSeed(seed)` call is required
   * before any draw. This is exactly what the asm does: neither
   * @0x3042 nor @0x3068 references [+0x08 .. +0xC10) at all.
   */
  constructor() {
    this.state = new Uint8Array(0xc08); // zero-init; asm leaves this raw
    this.cachedDouble0 = 0; // @0x3053 / @0x3079 (xorps + movups low half)
    this.cachedDouble1 = 0; // @0x3053 / @0x3079 (xorps + movups high half)
    this.counter = 0n; // @0x305a / @0x3080 (movq $0, [rbx+0xc20])
  }

  /**
   * RandMersenne::SetSeed(unsigned long seed) @0x30e4
   *
   * Asm body:
   *     pushq %rbp                                @0x30e4
   *     movq  %rsp, %rbp                          @0x30e5
   *     pushq %rbx                                @0x30e8
   *     pushq %rax                                @0x30e9
   *     movq  %rdi, %rbx                          @0x30ea  save `this`
   *     addq  $0x8, %rdi                          @0x30ed  &this->state (dsfmt_t*)
   *     movl  $0x4DE1, %edx                       @0x30f1  MEXP = 19937
   *     callq _dsfmt_chk_init_gen_rand            @0x30f6  ; seed already in %rsi
   *     xorps %xmm0, %xmm0                        @0x30fb
   *     movups %xmm0, 0xc10(%rbx)                 @0x30fe  cachedDouble0/1 <- 0
   *     movq  $0x0, 0xc20(%rbx)                   @0x3105  counter <- 0
   *
   * The library callee is a shared-library C symbol not decoded by
   * this port. Per Rule 3 we RAISE at the call site instead of
   * emitting a substitute dSFMT-19937 init. The trailing cache/counter
   * clears (@0x30fb..@0x3105) are transcribed literally, but they
   * are unreachable in practice because the raise above them fires
   * first — this mirrors the asm's linear order and keeps the
   * post-init store cited at its true source address for whenever
   * the dSFMT callee lands.
   *
   * @param seed 64-bit unsigned seed (asm passes it via `%rsi`).
   */
  SetSeed(seed: bigint): void {
    // @0x30ed: lea rdi, [rdi+0x8] — pointer arithmetic to reach the
    //          dsfmt_t inside `this`. In TS this is `this.state`.
    // @0x30f1: mov edx, 0x4DE1     — MEXP = 19937 (dSFMT-19937 variant).
    // @0x30f6: call _dsfmt_chk_init_gen_rand(dsfmt_t*, u64 seed, i32 mexp)
    //          Third-party dSFMT library entry point; not decoded in
    //          this port.
    const _dsfmt_state = this.state;
    const _mexp = 0x4de1;
    const _seed = seed;
    void _dsfmt_state;
    void _mexp;
    void _seed;
    // raise: external dSFMT init routine not yet transcribed.
    throw new Error(
      "RandMersenne.SetSeed: _dsfmt_chk_init_gen_rand @0x30f6 (external dSFMT-19937 C library) not yet transcribed",
    );

    // Post-init clears are transcribed for provenance, though
    // unreachable behind the raise above. When the external callee
    // lands, remove the throw and these stores execute unchanged.
    // @0x30fb + @0x30fe: xorps xmm0,xmm0 ; movups xmm0, [rbx+0xc10]
    // this.cachedDouble0 = 0;
    // this.cachedDouble1 = 0;
    // @0x3105: movq $0, [rbx+0xc20]
    // this.counter = 0n;
  }

  /**
   * RandMersenne::~RandMersenne() — D2 base dtor @0x308e
   *                                  D1 complete dtor @0x30b4
   *
   * Both bodies are byte-identical to each other and structurally
   * identical to the ctors: store the vtable slot, then clear the
   * same trailing +0xC10/+0xC18/+0xC20 fields. No heap teardown
   * (the state blob is inline, not allocated). In TS the vtable
   * store has no equivalent; the trailing clears are transcribed.
   *
   * D0 (deleting dtor @0x30da) is a bare `pushq %rbp ; movq %rsp,%rbp ;
   * popq %rbp ; jmp __ZdlPv` — it delegates to `operator delete` after
   * the vtable-invoked D1 has run. There is no JS analogue; the
   * runtime handles object reclamation.
   */
  dispose(): void {
    // @0x309f/@0x30c5: xorps xmm0,xmm0 ; movups xmm0, [rdi+0xc10]
    this.cachedDouble0 = 0;
    this.cachedDouble1 = 0;
    // @0x30a6/@0x30cc: movq $0, [rdi+0xc20]
    this.counter = 0n;
  }
}
