// raw-port: FFAudioRenderTimeOffsetHook — Flexo framework
//
// Faithful transcription of the three published entry points on the class:
//   0x00d37610  FFAudioRenderTimeOffsetHook::AdjustTime(double, unsigned int)
//   0x00d3ca30  FFAudioRenderTimeOffsetHook::~FFAudioRenderTimeOffsetHook()  (D1 — non-deleting base dtor)
//   0x00d3ca40  FFAudioRenderTimeOffsetHook::~FFAudioRenderTimeOffsetHook()  (D0 — deleting dtor, tail-calls operator delete)
//
// The class is a small render-time bookkeeping hook: an audio unit calls
// AdjustTime(sample-time double, sample-count uint32) once per render pass. The
// hook lazily caches a constant offset the first time a real time comes through
// on an enabled hook, then re-uses that offset to keep the pipeline's advancing
// "time" value phase-locked with the underlying transport (so tiny drifts in
// the caller's `addend` don't accumulate). The offset is invalidated and
// re-locked whenever `offset + addend` no longer round-trips to `time`.
//
// STRUCT LAYOUT (decoded from AdjustTime memory operands; no ctor symbol
// visible in Flexo — the object is presumably zero-constructed and populated
// via other member functions not on this class's decoded surface):
//   +0x00 .. +0x17  <opaque header>  (vptr + inherited state; not touched by AdjustTime)
//   +0x18  double   time            (advancing "current" sample-time)
//   +0x20  uint8    enabled         (gate: AdjustTime is a pass-through when != 1)
//   +0x28  double   offset          (cached offset: offset + addend == time when locked)
//   +0x30  uint8    hasOffset       (offset is populated / valid)
//
// The D1 dtor is 3 bytes of prologue/epilogue with nothing in-between (no
// members with non-trivial dtors, and no vtable-writing thunk observed for
// this class beyond the standard entry sequence). The D0 dtor is the classic
// clang "tail-call operator delete" shape: it does not call D1 first, which
// means either (a) D1 is empty (as it visibly is here) and clang optimized
// D0 into a bare delete, or (b) D1 was inlined at all callers. Either way
// the observed body is a straight `operator delete(this)`.
//
// FRONTIER (undecoded, intentionally NOT stubbed):
//   - The vtable and any owner (probably an AudioUnit render callback) are
//     outside this class's transcribed surface. If they land later they will
//     bring the constructor and any state-initialization path.
//   - `operator delete` (Flexo symbol stub @0x1497404, imported __ZdlPv) is
//     the host libc++ deallocator; the JS mirror simply drops the object.

/**
 * FFAudioRenderTimeOffsetHook — a render-time "phase-lock" for a sample-time
 * pipeline. Owns a cached offset that is (re)computed on demand so that
 * `offset + addend == time` holds at every call.
 *
 * Ported entry point: AdjustTime (@0xd37610). Both dtors (@0xd3ca30 D1,
 * @0xd3ca40 D0) are trivial and modelled as JS-side no-ops / GC-managed
 * destruction; the D0 tail-call to `operator delete` is not user-visible
 * in the port.
 */
export class FFAudioRenderTimeOffsetHook {
  /** @+0x18 — advancing sample-time (double). Zero-initialized by convention. */
  public time: number = 0;

  /** @+0x20 — enable gate (uint8 in native; boolean in the port). */
  public enabled: boolean = false;

  /** @+0x28 — cached offset (double). Only meaningful when hasOffset is true. */
  public offset: number = 0;

  /** @+0x30 — whether `offset` currently holds a valid value. */
  public hasOffset: boolean = false;

  /**
   * FFAudioRenderTimeOffsetHook::AdjustTime(double addend, unsigned int frames)
   * @Flexo 0x00d37610  (see raw-port/re/disasm/Flexo.FFAudioRenderTimeOffsetHook.AdjustTime.s)
   *
   * Returns the "adjusted" sample-time to feed downstream: either the raw
   * `addend` (when the hook is disabled) or `offset + addend` (when enabled,
   * with `offset` lazily locked and re-locked as needed so the identity
   * `offset + addend == time` always holds on the returned value).
   *
   * Also, on the enabled path, advances the internal `time` cursor by
   * `frames` samples: `this->time = (offset + addend) + frames`.
   *
   * Control flow (mirrors the asm branch-for-branch):
   *
   *   @0xd37614  if (!this->enabled)                        [cmpb $1, 0x20(rdi); jne .ret]
   *   @0xd37618      -> return addend unchanged             [xmm0 in = xmm0 out]
   *
   *   @0xd3761a  else if (!this->hasOffset)                 [cmpb $1, 0x30(rdi); jne .compute]
   *   @0xd3761e      goto compute-offset branch
   *
   *   @0xd37620  else {                                     [hasOffset == true]
   *   @0xd37625      xmm2 = this->time     ; @+0x18        [movsd 0x18(rdi), xmm2]
   *                  xmm1 = this->offset   ; @+0x28        [movsd 0x28(rdi), xmm1]
   *   @0xd3762a      xmm1 = xmm1 + xmm0    ; check          [addsd xmm0, xmm1]
   *   @0xd3762e      if (xmm1 != xmm2 || isNaN(xmm1,xmm2))  [ucomisd + jne + jp]
   *                    goto .refix                          [both jump to 0xd3765a]
   *   @0xd37636      goto .advance                          [jmp 0xd3766b]
   *              }
   *
   * .compute:
   *   @0xd37638      xmm2 = this->time                      [movsd 0x18(rdi), xmm2]
   *   @0xd3763d      xmm1 = xmm2                            [movapd xmm2, xmm1]
   *   @0xd37641      xmm1 = xmm1 - xmm0    ; new offset     [subsd xmm0, xmm1]
   *   @0xd37645      this->offset = xmm1   ; @+0x28         [movsd xmm1, 0x28(rdi)]
   *   @0xd3764a      this->hasOffset = true; @+0x30 = 0x1   [movb $0x1, 0x30(rdi)]
   *   @0xd3764e      xmm1 = xmm1 + xmm0    ; sanity round-trip  [addsd xmm0, xmm1]
   *   @0xd37652      if (xmm1 != xmm2)                      [ucomisd + jne .refix]
   *                    goto .refix
   *   @0xd37658      if (!isNaN(xmm1,xmm2))                 [jnp .advance]
   *                    goto .advance
   *                  ; else (unordered/NaN) fall through to .refix
   *
   * .refix:  (recompute offset once more using original xmm2 = time,
   *           accepting whatever finite/inf result comes out, no more checks)
   *   @0xd3765a      xmm2 = xmm2 - xmm0                     [subsd xmm0, xmm2]
   *   @0xd3765e      this->offset = xmm2                    [movsd xmm2, 0x28(rdi)]
   *   @0xd37663      xmm2 = xmm2 + xmm0                     [addsd xmm0, xmm2]
   *   @0xd37667      xmm1 = xmm2                            [movapd xmm2, xmm1]
   *
   * .advance:
   *   @0xd3766b      rax = (uint64) esi                     [movl esi, eax — zero-extends]
   *   @0xd3766d      xmm0 = 0                               [xorps xmm0, xmm0]
   *   @0xd37670      xmm0 = (double)(int64) rax             [cvtsi2sd rax, xmm0]
   *   @0xd37675      xmm0 = xmm0 + xmm1                     [addsd xmm1, xmm0]
   *   @0xd37679      this->time = xmm0     ; @+0x18         [movsd xmm0, 0x18(rdi)]
   *   @0xd3767e      xmm0 = xmm1                            [movapd xmm1, xmm0]
   *
   * .ret:
   *   @0xd37682      popq rbp; retq                         ; return xmm0
   *
   * Notes on ucomisd + jne/jp/jnp pairing:
   *   - `jne` after ucomisd fires when the compare is *not-equal* (ZF=0),
   *     which covers "less" / "greater" *and* "unordered" (NaN sets PF=1 too).
   *   - The first branch (`jne + jp` together) sends BOTH the not-equal case
   *     and the NaN/unordered case to the refix path.
   *   - The second branch (`jne + jnp` together) sends the not-equal case
   *     to refix, and the "equal AND not-unordered" case to .advance —
   *     unordered/NaN falls through to refix.
   * In JS these translate to `Number.isNaN` checks alongside strict equality;
   * because JS floats round-trip identically for the same operations, the
   * `!==` catches non-equal fine and `Number.isNaN(x) || Number.isNaN(y)`
   * covers the unordered case.
   *
   * IMPORTANT — precision: the native code uses SSE2 scalar-double (`movsd`,
   * `addsd`, `subsd`, `ucomisd`) throughout. JS `number` is IEEE-754 double,
   * so no Math.fround anywhere: single-precision is not involved. The
   * `cvtsi2sd rax, xmm0` conversion is exact for the 32-bit `frames` value
   * (`unsigned int` zero-extended to 64-bit before conversion), which JS
   * mirrors with `(frames >>> 0)` widening into a `number`.
   *
   * @param addend  the incoming sample-time delta (native `%xmm0` on entry)
   * @param frames  the incoming sample count (native `%esi` on entry;
   *                treated as unsigned 32-bit — must be a nonnegative int)
   * @returns       the adjusted sample-time (native `%xmm0` on exit)
   */
  AdjustTime(addend: number, frames: number): number {
    // @0xd37614  cmpb $0x1, 0x20(%rdi); jne .ret
    if (!this.enabled) {
      return addend; // xmm0 in == xmm0 out
    }

    // Coerce frames to unsigned-32 for exact match to the `unsigned int` arg
    // and the `movl %esi, %eax; cvtsi2sd %rax, %xmm0` sequence at 0xd3766b.
    const uframes = frames >>> 0;

    // xmm2 is loaded from this.time in BOTH branches below, so read once.
    const time = this.time; // @0xd37620 / @0xd37638

    let xmm1: number;
    let doRefix = false;

    // @0xd3761a  cmpb $0x1, 0x30(%rdi); jne .compute
    if (this.hasOffset) {
      // hasOffset == true path (@0xd37620..0xd37636)
      xmm1 = this.offset + addend; // xmm1 = offset + addend  (@0xd37625, 0xd3762a)
      // @0xd3762e  ucomisd xmm2, xmm1;  jne .refix ; jp .refix
      if (xmm1 !== time || Number.isNaN(xmm1) || Number.isNaN(time)) {
        doRefix = true;
      }
      // else fall through with xmm1 unchanged to .advance (@0xd37636 jmp)
    } else {
      // .compute path (@0xd37638..0xd37658)
      xmm1 = time - addend; // xmm1 = time - addend  (@0xd3763d, 0xd37641)
      this.offset = xmm1; // @0xd37645  movsd xmm1, 0x28(rdi)
      this.hasOffset = true; // @0xd3764a  movb $1, 0x30(rdi)
      xmm1 = xmm1 + addend; // xmm1 = offset + addend  (@0xd3764e)
      // @0xd37652  ucomisd xmm2, xmm1
      // @0xd37656  jne .refix          -> not-equal (or unordered) -> refix
      // @0xd37658  jnp .advance        -> equal AND not-unordered  -> advance
      //   fall through (unordered) -> refix
      if (xmm1 !== time) {
        doRefix = true;
      } else if (Number.isNaN(xmm1) || Number.isNaN(time)) {
        doRefix = true;
      }
      // else fall through to .advance
    }

    if (doRefix) {
      // .refix (@0xd3765a..0xd37669) — recompute using original xmm2==time
      let xmm2 = time - addend; // @0xd3765a  subsd xmm0, xmm2
      this.offset = xmm2; // @0xd3765e  movsd xmm2, 0x28(rdi)
      xmm2 = xmm2 + addend; // @0xd37663  addsd xmm0, xmm2
      xmm1 = xmm2; // @0xd37667  movapd xmm2, xmm1
    }

    // .advance (@0xd3766b..0xd3767e)
    //   xmm0 = (double)uframes + xmm1
    //   this.time = xmm0
    //   return xmm1
    const newTime = uframes + xmm1; // @0xd3766d..0xd37675
    this.time = newTime; // @0xd37679  movsd xmm0, 0x18(rdi)
    return xmm1; // @0xd3767e  movapd xmm1, xmm0
  }

  /**
   * FFAudioRenderTimeOffsetHook::~FFAudioRenderTimeOffsetHook()  D1 (base)
   * @Flexo 0x00d3ca30 (see raw-port/re/disasm/Flexo.FFAudioRenderTimeOffsetHook.~FFAudioRenderTimeOffsetHook.s).
   *
   * Disassembly (6 lines):
   *   d3ca30  pushq %rbp
   *   d3ca31  movq  %rsp, %rbp
   *   d3ca34  popq  %rbp
   *   d3ca35  retq
   *   d3ca36  nopw  %cs:(%rax,%rax)
   *
   * Body: empty. No member destructors, no vtable rewrite for a base-in-place
   * teardown. In JS this is a plain no-op — the class holds only value-typed
   * fields and is GC-managed.
   */
  dispose(): void {
    /* @0xd3ca30 — empty body. */
  }

  /**
   * FFAudioRenderTimeOffsetHook::~FFAudioRenderTimeOffsetHook()  D0 (deleting)
   * @Flexo 0x00d3ca40.
   *
   * Disassembly (5 lines):
   *   d3ca40  pushq %rbp
   *   d3ca41  movq  %rsp, %rbp
   *   d3ca44  popq  %rbp
   *   d3ca45  jmp   0x1497404   ## symbol stub for: __ZdlPv (operator delete(void*))
   *   d3ca4a  nopw  (%rax,%rax)
   *
   * Body: tail-calls `operator delete(this)`. No user-visible effect in JS —
   * memory reclamation is handled by the GC. Modelled as an alias to dispose()
   * for callers that want the D0 shape.
   */
  destroy(): void {
    // @0xd3ca40 — tail-calls operator delete. Empty in JS (GC-managed).
    this.dispose();
  }
}
