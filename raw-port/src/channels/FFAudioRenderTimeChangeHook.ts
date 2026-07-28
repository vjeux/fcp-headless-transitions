// FFAudioRenderTimeChangeHook.ts — Flexo audio render-time hook. Its two
// real virtual methods (`PreRender` and `PostRender`) intercept the
// `AudioTimeStamp` on either side of a downstream audio render pass:
// PreRender stashes the incoming sample-time in `this->+0x8`, dispatches
// through vtable *0x20 to compute a transformed time, and writes that
// transformed time back into the AudioTimeStamp; PostRender restores the
// stashed sample-time so downstream stages see the original time again.
// Both destructor symbols are `ud2` traps (pure-virtual base — see below).
//
// Source disassembly:  raw-port/re/disasm/Flexo.FFAudioRenderTimeChangeHook.methods.s
// Framework: Final Cut Pro / Flexo.framework
//
// Flexo symbols transcribed:
//   @0xd375d0  FFAudioRenderTimeChangeHook::PreRender(unsigned int,
//                    AudioTimeStamp const&, unsigned int, unsigned int,
//                    AudioBufferList const&)
//   @0xd37600  FFAudioRenderTimeChangeHook::PostRender(unsigned int,
//                    AudioTimeStamp const&, unsigned int, unsigned int,
//                    AudioBufferList const&)
//   @0x14878f0 FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook()  (D1)
//   @0x1487900 FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook()  (D0)
//
// DECODE evidence:
//   * The PreRender/PostRender pair reads/writes exactly ONE field of
//     `this`: an 8-byte double at offset +0x08. Neither method touches
//     any other field. The read is `movsd 0x8(%rdi), %xmm0` (PostRender
//     @0xd37604); the write is `movsd %xmm0, 0x8(%rdi)` (PreRender
//     @0xd375e0). We name this field `stashedSampleTime` because:
//        - The stored value comes from `(rdx)` where rdx is the incoming
//          `AudioTimeStamp const&` argument, and CoreAudio's
//          AudioTimeStamp lays out `Float64 mSampleTime` as its first
//          8 bytes (see <CoreAudio/CoreAudioTypes.h>). The first
//          double at `(AudioTimeStamp&)` is therefore `mSampleTime`.
//        - PostRender writes it BACK to `(rdx)` unchanged, i.e. it
//          restores the sample-time that PreRender snapshotted.
//
//   * PreRender's virtual dispatch @0xd375e8 `callq *0x20(%rax)` reads
//     the callee's vtable at +0x20. Signature: takes `this` in %rdi
//     (unchanged) and %esi (the previously-copied 4th arg from %r8d);
//     returns a Float64 in %xmm0. We call this the "time-transform"
//     slot: it maps a stashed sample-time + a lane-integer to a new
//     sample-time that PreRender writes into the AudioTimeStamp for
//     the downstream render. The subclass `FFAudioRenderTimeOffsetHook`
//     visible at @Flexo 0xd37610 (`FFAudioRenderTimeOffsetHook::AdjustTime`)
//     is a plausible implementation of this slot; the same file also
//     shows AdjustTime doing floating-point math on this->+0x18/+0x28
//     and toggling a bool at +0x30 — but that state belongs to the
//     subclass, not to THIS class.
//
//   * The two dtors are byte-for-byte `pushq %rbp; movq %rsp,%rbp; ud2;
//     nopw ...` (see raw-port/src/channels/FFAudioGainChannelIndefiniteConstantValueBuffer.ts
//     and raw-port/src/channels/OZChannelLabelComponent.ts for identical
//     `ud2`-trap analyses). This is the standard clang emission for a
//     pure-virtual base's destructor slots: the frontend has statically
//     proven them unreachable because concrete subclasses (e.g.
//     FFAudioRenderTimeOffsetHook) install their own dtor slots that
//     shadow these.
//
// The 4th argument (an unsigned int copied to %esi at PreRender @0xd375d6)
// is passed to the virtual "time-transform" callee. From the mangled
// signature the four unsigned-int arguments are, in order, positional
// arguments 1, 3, 4, and (5? no — there are only 4 primitives + 2
// references). Reading the mangled name:
//   Signature: PreRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
//     arg0 = %edi(→this)  — implicit `this`
//     arg1 = %esi         — unsigned int
//     arg2 = %rdx         — AudioTimeStamp const& (pointer)
//     arg3 = %ecx         — unsigned int
//     arg4 = %r8d         — unsigned int    ← copied into %esi at 0xd375d6
//     arg5 = %r9          — AudioBufferList const&
// So the virtual slot *0x20 is called with (%rdi=this, %esi=arg4). The
// AudioBufferList (%r9) and the two unsigned ints in %ecx/%esi-original
// are NOT consulted by this method (only arg2 and arg4 are, plus the
// virtual dispatch).

// ── Frontier: the CoreAudio types & the virtual time-transform slot ────

/** CoreAudio `AudioTimeStamp` — first 8 bytes = `Float64 mSampleTime`.
 *  We model just that field here since the transcribed methods only
 *  read/write `(&ts)` as a raw double. Full CoreAudio layout is at
 *  <CoreAudio/CoreAudioTypes.h> and not needed for parity. */
export interface AudioTimeStamp {
  /** Byte offset +0x00: `Float64 mSampleTime`. Both PreRender and
   *  PostRender treat `(rdx)` as this Float64 (SSE `movsd`). */
  mSampleTime: number;
}

/** CoreAudio `AudioBufferList` — opaque here; PreRender and PostRender
 *  receive it as %r9 but neither method reads it. */
export interface AudioBufferList {}

/** Vtable of FFAudioRenderTimeChangeHook subclasses. PreRender dispatches
 *  through slot *0x20 to obtain the transformed sample-time. Subclass
 *  implementations (e.g. FFAudioRenderTimeOffsetHook::AdjustTime @Flexo
 *  0xd37610) are NOT transcribed here — this port only surfaces the base
 *  method's dispatch. */
export interface FFAudioRenderTimeChangeHookVTable {
  /** Slot *0x20 — "time-transform" virtual. Called with (this,
   *  laneOrBufferIndex: unsigned int) and returns a Float64. The
   *  concrete implementation reads its own state and returns the
   *  sample-time to substitute into the downstream render's
   *  AudioTimeStamp.
   *
   *  ABI: %rdi = this, %esi = laneOrBufferIndex; returns Float64 in
   *  %xmm0. Corresponds to PreRender @0xd375e8. */
  slot_0x20_timeTransform(
    self: FFAudioRenderTimeChangeHook,
    laneOrBufferIndex: number,
  ): number;
}

// ── The class ─────────────────────────────────────────────────────────

/** `FFAudioRenderTimeChangeHook` — Flexo audio render-time hook base.
 *  Object layout (partial, recovered from these two methods):
 *    +0x00  vptr (Itanium ABI) — read by PreRender @0xd375e5.
 *    +0x08  stashedSampleTime : Float64
 *              PreRender @0xd375e0 writes it (from incoming AudioTimeStamp).
 *              PostRender @0xd37604 reads it.
 *
 *  This class is ABSTRACT: both dtor slots are `ud2` traps meant to be
 *  overridden by concrete subclasses (e.g. FFAudioRenderTimeOffsetHook). */
export class FFAudioRenderTimeChangeHook {
  /** +0x08 stashedSampleTime — the sample-time PreRender snapshots and
   *  PostRender restores. Type: Float64 (`movsd` = SSE scalar double). */
  stashedSampleTime: number = 0;

  /** Subclasses supply the virtual "time-transform" callable via the
   *  vtable slot at +0x20. Modeled as an owned reference here so
   *  PreRender's dispatch can be faithfully invoked. Base itself has no
   *  implementation (the base's dtor is `ud2`, so it can never be
   *  instantiated concretely). */
  vtable!: FFAudioRenderTimeChangeHookVTable;

  /**
   * `FFAudioRenderTimeChangeHook::PreRender(unsigned int, AudioTimeStamp
   * const&, unsigned int, unsigned int, AudioBufferList const&)`
   * @Flexo 0xd375d0.
   *
   * Body:
   *   0xd375d0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0xd375d6  movl  %r8d, %esi                    ; esi = arg4 (unsigned int)
   *   0xd375d9  movq  %rdx, %rbx                    ; rbx = arg2 (AudioTimeStamp&)
   *   0xd375dc  movsd (%rdx), %xmm0                 ; xmm0 = ts.mSampleTime
   *   0xd375e0  movsd %xmm0, 0x8(%rdi)              ; this->+0x08 = stashedSampleTime
   *   0xd375e5  movq  (%rdi), %rax                  ; rax = this->vptr
   *   0xd375e8  callq *0x20(%rax)                   ; xmm0 = vtable[+0x20](this, esi)
   *   0xd375eb  movsd %xmm0, (%rbx)                 ; ts.mSampleTime = xmm0
   *   0xd375ef  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   *
   * The `AudioBufferList const&` argument (%r9) is not read. Neither is
   * arg1 (%esi original — clobbered at 0xd375d6) nor arg3 (%ecx). Only
   * arg2 (the AudioTimeStamp reference), arg4 (the unsigned int the
   * subclass slot wants), and `this` are consulted.
   *
   * Faithful TS mirror: mutates the passed AudioTimeStamp in place
   * (matches the `movsd %xmm0, (%rbx)` at 0xd375eb).
   */
  PreRender(
    _arg1: number,
    ts: AudioTimeStamp,
    _arg3: number,
    arg4: number,
    _abl: AudioBufferList,
  ): void {
    // @0xd375dc `movsd (%rdx), %xmm0` — read incoming mSampleTime.
    // @0xd375e0 `movsd %xmm0, 0x8(%rdi)` — stash it at this->+0x08.
    this.stashedSampleTime = ts.mSampleTime;
    // @0xd375e5..@0xd375e8 — virtual dispatch: call this->vtable[+0x20](this, arg4).
    //   ABI: %rdi=this, %esi=arg4 (already loaded at 0xd375d6); returns Float64 in %xmm0.
    const transformed = this.vtable.slot_0x20_timeTransform(this, arg4);
    // @0xd375eb `movsd %xmm0, (%rbx)` — write transformed time back into the
    //           AudioTimeStamp (rbx = arg2, the caller's ts&).
    ts.mSampleTime = transformed;
  }

  /**
   * `FFAudioRenderTimeChangeHook::PostRender(unsigned int, AudioTimeStamp
   * const&, unsigned int, unsigned int, AudioBufferList const&)`
   * @Flexo 0xd37600.
   *
   * Body:
   *   0xd37600  pushq %rbp / movq %rsp,%rbp
   *   0xd37604  movsd 0x8(%rdi), %xmm0                ; xmm0 = this->+0x08 stashedSampleTime
   *   0xd37609  movsd %xmm0, (%rdx)                   ; ts.mSampleTime = xmm0
   *   0xd3760d  popq  %rbp / retq
   *
   * Restore the sample-time that PreRender stashed. Ignores arg1, arg3,
   * arg4, and the AudioBufferList. `this` is only used to read +0x08.
   */
  PostRender(
    _arg1: number,
    ts: AudioTimeStamp,
    _arg3: number,
    _arg4: number,
    _abl: AudioBufferList,
  ): void {
    // @0xd37604 `movsd 0x8(%rdi), %xmm0` — reload stashed sample-time.
    // @0xd37609 `movsd %xmm0, (%rdx)` — write back to ts.mSampleTime.
    ts.mSampleTime = this.stashedSampleTime;
  }

  /**
   * `FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook()` (D1
   * — non-deleting) @Flexo 0x14878f0.
   *
   * Body:
   *   0x14878f0  pushq %rbp
   *   0x14878f1  movq  %rsp, %rbp
   *   0x14878f4  ud2                                  ; trap — never returns
   *   0x14878f6  nopw  %cs:(%rax,%rax)                ; 16-byte alignment padding
   *
   * `ud2` unconditionally raises #UD (Invalid Opcode). Concrete subclasses
   * (e.g. FFAudioRenderTimeOffsetHook) override this vtable slot. */
  destroy_D1(): void {
    throw new Error(
      "FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook() (D1) " +
        "@Flexo 0x14878f0 is a `ud2` trap — the abstract-base dtor slot " +
        "must never execute; a concrete subclass overrides this vtable entry.",
    );
  }

  /**
   * `FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook()` (D0
   * — deleting) @Flexo 0x1487900.
   *
   * Body byte-for-byte identical to D1 above (`pushq %rbp; movq %rsp,%rbp;
   * ud2; nopw %cs:(%rax,%rax)`), just at the next 16-byte-aligned address.
   * The D0 slot is the one the vtable dispatches through when the object
   * is being `delete`-freed; making it a `ud2` prevents any callers from
   * reaching it on this abstract base. */
  destroy_D0(): void {
    throw new Error(
      "FFAudioRenderTimeChangeHook::~FFAudioRenderTimeChangeHook() (D0/deleting) " +
        "@Flexo 0x1487900 is a `ud2` trap — the abstract-base deleting-dtor " +
        "slot must never execute; a concrete subclass overrides this vtable entry.",
    );
  }
}
