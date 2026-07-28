// FFAudioGainChannelBuffer — the abstract base class for audio-gain "channel buffer"
// nodes in Flexo's audio rendering graph. It owns a std::vector<float> of gain samples,
// a CMTime start time, and an "indefinite" bool flag. Two concrete subclasses live in
// FFAudioGainChannelConstantValueBuffer.ts / FFAudioGainChannelIndefiniteConstantValueBuffer.ts
// / FFAudioGainChannelLinearInterpolatedBuffer.ts and override bufferType()/numSamples()/
// indefinite() with class-specific values (see their file headers).
//
// Verbatim from FCP's Flexo framework (x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly for all exported symbols saved at:
//   raw-port/re/disasm/Flexo.FFAudioGainChannelBuffer.*.s
//
// EXPORTED SYMBOLS (from `nm -arch x86_64` + `/tmp/Flexo_symmap.tsv`):
//   @Flexo 0xe607b0  __ZN24FFAudioGainChannelBufferC2E6CMTimeyb
//                     FFAudioGainChannelBuffer(CMTime, unsigned long long, bool) [C2 — base ctor]
//                     ICF-folded onto C1; disassembly at 0xe60850.
//   @Flexo 0xe60850  __ZN24FFAudioGainChannelBufferC1E6CMTimeyb
//                     FFAudioGainChannelBuffer(CMTime, unsigned long long, bool) [C1 — complete ctor]
//                                                                                  [file: this]
//   @Flexo 0xe63a10  __ZN24FFAudioGainChannelBufferD1Ev  ~FFAudioGainChannelBuffer  [D1]
//                                                                                  [vtable slot *0x00]
//   @Flexo 0xe63a40  __ZN24FFAudioGainChannelBufferD0Ev  ~FFAudioGainChannelBuffer  [D0]
//                                                                                  [vtable slot *0x08]
//   @Flexo 0xe63a80  __ZNK24FFAudioGainChannelBuffer10bufferTypeEv
//                     bufferType() const                             [vtable slot *0x10]
//   @Flexo 0xe63a90  __ZNK24FFAudioGainChannelBuffer10numSamplesEv
//                     numSamples() const                             [vtable slot *0x18]
//   @Flexo 0xe63ab0  __ZNK24FFAudioGainChannelBuffer10indefiniteEv
//                     indefinite() const                             [vtable slot *0x20]
//
// PRIMARY VTABLE (via `python3 raw-port/army/tools/resolve.py Flexo vtable
// FFAudioGainChannelBuffer`, vtable @0x1917eb0, installed-ptr 0x1917ec0):
//   *0x00 -> 0xe63a10  ~FFAudioGainChannelBuffer  [D1 — THIS FILE]
//   *0x08 -> 0xe63a40  ~FFAudioGainChannelBuffer  [D0 — THIS FILE]
//   *0x10 -> 0xe63a80  bufferType() const         [THIS FILE — abstract-tag = 2]
//   *0x18 -> 0xe63a90  numSamples() const         [THIS FILE — computed from vector span]
//   *0x20 -> 0xe63ab0  indefinite() const         [THIS FILE — always false in this base]
//   *0x28 -> 0x0       (unused slot / RTTI-adjacent).
//
// The three getter overrides all default to base-class values here. Subclasses (in the
// same on-disk vtable region at *0x30..) provide their own bufferType/numSamples where they
// diverge, and typically inherit *0x20 (indefinite=false) unchanged from this class — you can
// see FFAudioGainChannelLinearInterpolatedBuffer's *0x58 slot re-points at THIS file's
// indefinite() @0xe63ab0 unchanged.
//
// STRUCT LAYOUT (decoded from C1 @0xe60850 and both dtors — only offsets the six exported
// bodies read or write are documented; base-class fields owned by multiple-inheritance
// parents living in a subclass live BEYOND +0x40 and are the subclass's business).
//
//   +0x00  void* vtable        // set in C1 @0xe6085a-e60861 (leaq 0xab765f(%rip),%rax;
//                              //   movq %rax,(%rdi)); the RIP-relative address resolves
//                              //   to 0x1917ec0 = installed vtable ptr.
//                              // Overwritten by D1 @0xe63a14 and D0 @0xe63a40 with the
//                              //   SAME installed vtable ptr (leaq 0xab44a5(%rip)/0xab4479
//                              //   (%rip) both resolve to 0x1917ec0). C++ ABI: dtors re-install
//                              //   their own class's vtable before member-object destruction
//                              //   so that virtual calls during destruction dispatch to this
//                              //   class's overrides.
//
//   +0x08  float* __begin_     // std::vector<float>::__begin_
//   +0x10  float* __end_       // std::vector<float>::__end_
//   +0x18  float* __end_cap_   // std::vector<float>::__end_cap_
//                              // Set by C1 @0xe60864-e6086b (xorps %xmm0,%xmm0;
//                              //   movups %xmm0,0x8(%rdi); movq $0x0,0x18(%rdi)) —
//                              //   zero-initialise all three pointers before allocation.
//                              // Filled by C1 @0xe608af-e608b7 after operator new(size*4):
//                              //   movq %rax,0x8(%rbx)   ; __begin_ = data
//                              //   movq %rax,0x10(%rbx)  ; __end_   = data  (size==0 initially,
//                              //                                    end==begin so the vector's
//                              //                                    logical size is zero even
//                              //                                    though the capacity is size)
//                              //   movq %rcx,0x18(%rbx)  ; __end_cap_ = data + size*4
//                              // D1 @0xe63a1e / D0 @0xe63a4a both check the __begin_ pointer
//                              //   at +0x8; if non-null, they overwrite +0x10 with it
//                              //   (Clang libc++'s vector destructor "scratch" write — mirrors
//                              //   `__end_ = __begin_` before freeing to satisfy the vector
//                              //   invariant during __annotate_delete), then call operator
//                              //   delete on __begin_.
//
//   +0x20..0x37 CMTime start   // 24 bytes, laid out per CoreMedia's CMTime:
//                              //   +0x20 int64 value      (movaps 0x10(%rbp),%xmm0;
//                              //                            movups %xmm0,0x20(%rdi)  — writes
//                              //                            16 bytes covering value+timescale
//                              //                            +flags)
//                              //   +0x28 int32 timescale
//                              //   +0x2c uint32 flags
//                              //   +0x30 int64 epoch      (movq 0x20(%rbp),%rax;
//                              //                            movq %rax,0x30(%rdi))
//                              // The `movaps` load from 0x10(%rbp) reads the caller-copied
//                              // CMTime argument off the stack (SysV x86_64 passes a 24-byte
//                              // struct by value on the stack because it exceeds the two-reg
//                              // limit). We store it verbatim.
//
//   +0x38  bool  indefinite    // (movb %dl,0x38(%rdi)) — the 3rd argument (%dl = low byte of
//                              //   %rdx) is written as a single byte. Not read by any body
//                              //   here; indefinite() @0xe63ab0 hard-returns 0 regardless
//                              //   (`xorl %eax,%eax; ret`). Subclasses expose it via their
//                              //   own indefinite() overrides — the Indefinite* subclass in
//                              //   particular has an override that returns this stored bool.
//
// bufferType() @0xe63a80  — returns constant `2` (`movl $0x2,%eax`). The subclasses use
//   distinct tag values (Constant=0, LinearInterpolated=1, etc.). Base uses 2 to mean
//   "generic/unset gain buffer" — subclass overrides supersede.
//
// numSamples() @0xe63a90  — returns `(end - begin) / 4` (`movq 0x10(%rdi),%rax; subq 0x8(
//   %rdi),%rax; sarq $0x2,%rax`). Byte-count of the float vector divided by sizeof(float)=4
//   is exactly `std::vector<float>::size()`. The `sarq` is an ARITHMETIC right shift; the
//   value is always non-negative (end >= begin for a valid vector), so both `sar` and `shr`
//   produce the same result, but we mirror the arithmetic shift for fidelity.
//
// indefinite() @0xe63ab0 — hard-returns `false` (`xorl %eax,%eax`). The stored +0x38 bool
//   is NOT consulted by the base — see the note under `+0x38` above.
//
// D1 (complete-object destructor, non-deleting) @0xe63a10:
//   1. Install this class's vtable at (%rdi)              — see +0x00 note above.
//   2. Load __begin_ from +0x8; if null, return early.
//   3. Otherwise: scratch-write __begin_ to +0x10 (libc++ vector-dtor scratch), then
//      tail-jmp to __ZdlPv (`operator delete(void*)`) on __begin_.
//   Notice D1 does NOT call `delete this`; it leaves the object pointer intact for
//   whatever caller stack-allocated or otherwise owns it.
//
// D0 (deleting destructor) @0xe63a40:
//   1..3 identical to D1, PLUS a final tail-jmp to __ZdlPv on `this` (%rbx-saved rdi).
//   The three-arm branch shape in the raw asm is:
//     - vtable reinstall (+0x0 = vtable-ptr)
//     - load __begin_ from +0x8; if null → tail-jmp __ZdlPv(this)   [only frees the object]
//     - else: scratch +0x10, call __ZdlPv(__begin_), THEN tail-jmp __ZdlPv(this).
//   The Clang-generated prologue-elision means the null-null case is a single fallthrough
//   `jmp __ZdlPv` without pushing a frame at all (0xe63a51 je → 0x1497404 = symbol stub for
//   `__ZdlPv`). The non-null case pushes the frame, saves this in %rbx, deletes __begin_,
//   restores %rdi=this, pops the frame, and tail-jmps to __ZdlPv again.
//
// C1/C2 (constructor) @0xe60850 / 0xe607b0:
//   1. Install vtable at +0x0 (leaq 0xab765f(%rip),%rax; movq %rax,(%rdi) — target 0x1917ec0).
//   2. Zero the three vector pointers at +0x8/+0x10/+0x18.
//   3. Copy the CMTime argument (24 bytes) to +0x20..0x37.
//   4. Copy the bool argument to +0x38.
//   5. If numSamples == 0 (`testq %rsi,%rsi; je <ret>`) return without allocating.
//   6. Otherwise:
//      a. Overflow guard: `%rsi >> 62 != 0` → tail-call
//         `std::__1::vector<float, std::__1::allocator<float>>::__throw_length_error[abi:nqe210106]()`
//         @0x1497452 stub. This detects `numSamples * 4` byte-count overflow of size_t/ssize_t.
//         (Any `numSamples` whose top two bits are set would make `numSamples*4` overflow the
//         signed 64-bit range libc++ uses internally.)
//      b. Compute byte-size `numSamples * 4` via `leaq (,%r14,4),%rdi`; call
//         `operator new(size_t)` @0x1497452 stub (`__Znwm`).
//      c. Write the returned pointer to __begin_ (+0x8) AND __end_ (+0x10) — the vector's
//         logical size is zero (end == begin) even though the physical allocation covers
//         `numSamples` slots. This is `std::vector<float>` with capacity `numSamples` and
//         size 0.
//      d. Write `begin + numSamples*4` to __end_cap_ (+0x18).
//   The `.cfi` unwind info at 0xe608cd..0xe608e4 is the exception-handling landing pad:
//   if operator new throws, unwind into scratch-clear +0x10 and free the (never-set)
//   __begin_ pointer via __ZdlPv. Because we abort on the overflow check before
//   allocation, and JS has no operator-new exception, our port only mirrors the
//   overflow throw.
//
// FRONTIER (not decoded here — subclass business):
//   - The base class does not sample or fill the float buffer. Filling is done by the
//     Constant / Indefinite / LinearInterpolated subclass ctors (already ported) plus
//     runtime writers (renderControlBuffers @0xe4148 in FFAudioGainChannelChaser).
//   - Multiple-inheritance base sub-objects (FFLocklessQueue*/FFLocklessQueueElement*/
//     FFAudioMixBuss) live BEYOND +0x38 in the concrete subclass layout, not in this file.

// ── Buffer-type tag (from bufferType() overrides across the family) ────────────
// @const FFAudioGainChannelBuffer::bufferType() @Flexo 0xe63a80
// Base class returns 2. Concrete subclasses override:
//   - FFAudioGainChannelConstantValueBuffer::bufferType() = 0 @0xe63d20
//   - FFAudioGainChannelLinearInterpolatedBuffer::bufferType() = 1 @0xe63b30
//   - FFAudioGainChannelIndefiniteConstantValueBuffer -> inherits FFAudioGainChannelConstantValueBuffer's 0
export const FF_AUDIO_GAIN_BUFFER_TYPE_BASE = 2;

/**
 * A CMTime value transcribed verbatim from the caller's stack argument.
 * Layout mirrors CoreMedia CMTime (see raw-port/src/infra/CMTime.ts).
 */
export interface CMTimeStruct {
  value: bigint;      // int64 CMTimeValue      @+0x20
  timescale: number;  // int32 CMTimeScale      @+0x28
  flags: number;      // uint32 CMTimeFlags     @+0x2c
  epoch: bigint;      // int64 CMTimeEpoch      @+0x30
}

/**
 * FFAudioGainChannelBuffer — abstract base for audio-gain sample buffers in Flexo.
 *
 * Faithful fp32/ptr transcription of the six exported x86_64 bodies. The stored
 * `Float32Array` models the libc++ `std::vector<float>` at +0x8/+0x10/+0x18: `.length`
 * equals the vector's capacity in floats (= constructor's `numSamples` argument), and
 * `end - begin` in the raw asm corresponds to `length * 4` bytes.
 *
 * NOTE: In the FCP binary, `std::vector<float>` is a *capacity* container — the ctor
 * allocates `numSamples` slots but leaves the logical size at zero (end == begin) until
 * something appends samples. The C++ `numSamples()` accessor computes `(end-begin)/4`,
 * which is the *size*, not the *capacity*. We faithfully model this: `numSamples()`
 * returns the number of appended floats, which is zero immediately after construction.
 * Subclasses that fill the buffer in their own ctor bump `end_` accordingly (see e.g.
 * FFAudioGainChannelConstantValueBuffer which stores its count at +0x40 instead —
 * that override bypasses this base's `(end-begin)/4` computation).
 */
export class FFAudioGainChannelBuffer {
  /** @field +0x08..+0x18  std::vector<float> — the gain-sample buffer. */
  protected _begin: Float32Array; // physical backing store (capacity == constructor numSamples)
  protected _end: number;         // logical size in FLOATS (= (end - begin) / 4 in raw asm)

  /** @field +0x20..+0x37  CMTime start (24 bytes). */
  protected _startTime: CMTimeStruct;

  /** @field +0x38  bool — the ctor's 3rd arg. Not read by any base body; see file header. */
  protected _indefiniteFlag: boolean;

  /**
   * FFAudioGainChannelBuffer::FFAudioGainChannelBuffer(CMTime, unsigned long long, bool)
   * @0xe60850 (C1) / @0xe607b0 (C2, ICF-folded).
   *
   * @param startTime    CMTime — copied verbatim (24 bytes) to +0x20..0x37.
   * @param numSamples   unsigned long long — vector capacity in floats. If `0`, no
   *                     allocation is performed (vector left with all three pointers null).
   *                     If `numSamples >> 62 != 0`, throws (matches the
   *                     std::vector<float>::__throw_length_error tail-call at 0xe608c6).
   * @param indefinite   bool — copied to +0x38. Only read by the *Indefinite* subclass's
   *                     indefinite() override; the base's indefinite() @0xe63ab0 ignores it.
   */
  constructor(startTime: CMTimeStruct, numSamples: bigint, indefinite: boolean) {
    // @0xe6085a-e60861  install vtable at +0x0 — implicit in JS class dispatch.
    // @0xe60864-e6086b  zero-initialise vector pointers at +0x8/+0x10/+0x18.
    this._begin = new Float32Array(0);
    this._end = 0;
    // @0xe60873-e6087f  copy CMTime (24 bytes) argument to +0x20..0x37.
    this._startTime = {
      value: startTime.value,
      timescale: startTime.timescale | 0,
      flags: startTime.flags >>> 0,
      epoch: startTime.epoch,
    };
    // @0xe60883         copy bool argument to +0x38.
    this._indefiniteFlag = indefinite;

    // @0xe60886  testq %rsi,%rsi; je <ret>  — no allocation on numSamples == 0.
    if (numSamples === 0n) {
      return;
    }
    // @0xe60898  shrq $0x3e,%rax; jne overflow  — the top-two-bits guard:
    //             numSamples >> 62 != 0 → throw length_error. This is exactly libc++'s
    //             `numSamples * sizeof(float) > SSIZE_MAX` guard collapsed for
    //             `sizeof(float) == 4` (== `1 << 2`).
    if ((numSamples >> 62n) !== 0n) {
      // @0xe608c6  callq __ZNSt3__16vectorIfNS_9allocatorIfEEE20__throw_length_errorB9nqe210106Ev
      throw new RangeError(
        "FFAudioGainChannelBuffer: numSamples exceeds std::vector<float>::max_size() — @0xe608c6",
      );
    }
    // @0xe6089e  leaq (,%r14,4),%rdi  — compute byte-size = numSamples * 4.
    // @0xe608a6  callq __Znwm         — operator new(size).
    // In JS we back the vector with a Float32Array of `numSamples` slots, which is the
    // same physical capacity (4 * numSamples bytes) as the native allocation.
    // Downcasting bigint -> number is safe here: we've already rejected values
    // whose top two bits are set, so numSamples < 2^62 < Number.MAX_SAFE_INTEGER
    // fails only above 2^53; Float32Array can't back that anyway (browser cap ~2^30),
    // so we let TypedArray's own constructor throw for pathological huge sizes.
    const nsNum = Number(numSamples);
    this._begin = new Float32Array(nsNum);
    // @0xe608af  movq %rax,0x8(%rbx)   ; __begin_ = data
    // @0xe608b3  movq %rax,0x10(%rbx)  ; __end_   = data (logical size == 0)
    // @0xe608b7  movq %rcx,0x18(%rbx)  ; __end_cap_ = data + numSamples*4
    // JS side: _end is a numeric offset in FLOATS from the start of _begin. We initialise
    // it to 0 (== __end_ == __begin_ in the raw asm).
    this._end = 0;
  }

  /**
   * bufferType() const @0xe63a80.
   * @returns `2` — the base class's constant tag (see file header for subclass tags).
   */
  bufferType(): number {
    // @0xe63a84  movl $0x2,%eax; ret
    return FF_AUDIO_GAIN_BUFFER_TYPE_BASE;
  }

  /**
   * numSamples() const @0xe63a90.
   * @returns The logical size of the float vector — `(end_ - begin_) / 4` in the raw asm.
   *          Returned as a bigint (mirrors the `unsigned long long` return type in the
   *          demangled prototype; libc++ vector::size returns `size_t`).
   */
  numSamples(): bigint {
    // @0xe63a94  movq 0x10(%rdi),%rax  ; __end_
    // @0xe63a98  subq 0x8(%rdi),%rax   ; __end_ - __begin_    (byte count)
    // @0xe63a9c  sarq $0x2,%rax        ; >> 2                 (byte count / 4 = float count)
    return BigInt(this._end);
  }

  /**
   * indefinite() const @0xe63ab0.
   * @returns Always `false` — the base's body is `xorl %eax,%eax; ret`.
   *          Subclasses override to return the stored +0x38 flag (see the
   *          FFAudioGainChannelIndefiniteConstantValueBuffer override).
   */
  indefinite(): boolean {
    // @0xe63ab4  xorl %eax,%eax; ret
    return false;
  }

  /**
   * ~FFAudioGainChannelBuffer() [D1 — complete-object destructor] @0xe63a10.
   *
   * Ports the C++ destructor's effects into an explicit method: reinstalls the vtable
   * (no-op in JS dispatch), frees the vector's backing store if non-empty, and returns
   * WITHOUT deleting `this` itself (D0 does that; D1 leaves the storage to its owner).
   *
   * We expose this as an explicit `_destroy_D1` method so subclass D0/D1 ports can
   * chain into base destruction the way C++ ABI expects.
   */
  _destroy_D1(): void {
    // @0xe63a14-e63a1b  install this class's vtable at (%rdi). No-op in JS.
    // @0xe63a1e  movq 0x8(%rdi),%rax; testq %rax,%rax; je <ret>
    //   If __begin_ is null (physical allocation was skipped in the ctor), return.
    if (this._begin.length === 0) {
      return;
    }
    // @0xe63a27  movq %rax,0x10(%rdi)  — scratch write __begin_ to +0x10 (libc++ dtor scratch).
    // @0xe63a2b-e63a2f  tail-jmp __ZdlPv on __begin_ — free the backing store.
    //   JS GC handles the actual free; we detach the reference so it can be collected.
    this._begin = new Float32Array(0);
    this._end = 0;
  }

  /**
   * ~FFAudioGainChannelBuffer() [D0 — deleting destructor] @0xe63a40.
   *
   * Same effects as D1, PLUS a final `operator delete(this)`. In JS there is no manual
   * object delete — the caller stops referencing the object and GC reclaims it. So D0
   * in this port is functionally identical to D1; we still expose it separately so
   * subclass ports can distinguish vtable slot *0x00 vs *0x08 dispatch.
   */
  _destroy_D0(): void {
    // The D0 body's raw asm sequence @0xe63a40..e63a75:
    //   leaq 0xab4479(%rip),%rax; movq %rax,(%rdi)  ; reinstall vtable  — no-op in JS.
    //   movq 0x8(%rdi),%rax; testq %rax,%rax
    //   je 0x1497404  ; if __begin_ null: tail-jmp __ZdlPv(this)  — GC handles it.
    //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
    //   movq %rax,0x10(%rdi)     ; scratch write __begin_ to +0x10
    //   movq %rdi,%rbx           ; save this
    //   movq %rax,%rdi           ; arg1 = __begin_
    //   callq 0x1497404          ; __ZdlPv(__begin_)
    //   movq %rbx,%rdi           ; restore this
    //   addq $0x8,%rsp; popq %rbx; popq %rbp
    //   jmp 0x1497404            ; tail-jmp __ZdlPv(this)
    this._destroy_D1();
    // No JS-level `delete this`; the caller drops its reference.
  }
}

