// FFAudioPerfRenderHook.ts — Flexo audio-render perf-measurement hook.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo  (macOS FCP, x86_64 slice).
//
// This class is an FFAudioRenderHook subclass that measures the wall-clock
// duration of each audio-render callback pair (PreRender/PostRender) into a
// bounded ring buffer, then on Stop() aggregates the samples through a
// FFRunningStatistics helper and (if the FFPMR logging gflags are on) hands
// the stats to Objective-C `FFPMRLoggingFunnels` via a stack block.
//
// Symbols ported:
//   * FFAudioPerfRenderHook::PreRender(...)                        @0xd02b10
//   * FFAudioPerfRenderHook::PostRender(...)                       @0xd02b30
//   * FFAudioPerfRenderHook::Start()                                @0xd02b80
//   * FFAudioPerfRenderHook::Stop()                                 @0xd02bc0
//   * FFAudioPerfRenderHook::~FFAudioPerfRenderHook() [D1]         @0xd04230
//   * FFAudioPerfRenderHook::~FFAudioPerfRenderHook() [D0]         @0xd04270
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (deduced from load/store offsets in the five methods)
// -----------------------------------------------------------------------------
//   0x00  vptr_primary       — FFAudioRenderHook virtual dispatch table.
//                              Reset on dtor entry @0xd04240 (D1) /
//                              @0xd04277 (D0) from `RIP + 0xc0ca10` /
//                              `RIP + 0xc0c9d9` respectively.  D1 installs
//                              the base-D1 vtable slot, D0 installs a slot
//                              8 bytes earlier — the standard "base vtable"
//                              vs "deleting vtable" Itanium ABI pair.
//   0x08  vptr_secondary     — reset from `RIP + 0xc0cb4e` (D1) /
//                              `RIP + 0xc0cb17` (D0).  Second-base
//                              multi-inherit slot.
//   0x10  uint64_t*  ringBuf — heap `new uint64_t[capacity]` array of
//                              per-render nanosecond deltas.  Freed with
//                              `operator delete[]` (__ZdaPv) in both dtors
//                              @0xd04257 / @0xd0429e.
//   0x20  uint64_t  capacity — ring buffer capacity (in slots).  Used as
//                              the divisor in the `mod` step of both
//                              PostRender (@0xd02b50) and Stop
//                              (@0xd02c6a).
//   0x28  atomic<uint64_t>  writeCursor  — post-render increment counter.
//                              Fetched via `lock xaddq` @0xd02b4b.
//                              Zeroed by Start via `xchgq %rax, 0x28(%rdi)`
//                              @0xd02b8c.
//   0x30  atomic<uint64_t>  readCursor  — set by Stop @0xd02c0f to the
//                              write-cursor's high-water mark.  Zeroed by
//                              Start via `xchgq %rax, 0x30(%rdi)` @0xd02b86.
//                              During Stop's aggregation loop it's atomic-
//                              incremented @0xd02c65 (`lock xaddq`).
//   0x38  uint64_t  preRenderTicks — mach_absolute_time() captured at
//                              PreRender entry @0xd02b1e.  Read at
//                              PostRender @0xd02b41 to compute the delta.
//
// The layout is 64 bytes total (0x40).
//
// -----------------------------------------------------------------------------
// UNPORTED FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   * mach_absolute_time() — libSystem stub @0x1497848.
//   * FFRunningStatistics::reset()   — Flexo symbol; small helper is ported
//     separately, but the linkage here uses the base class we haven't fully
//     ported yet.
//   * FFRunningStatistics::addData(double)  — likewise.
//   * FFConvertHostTimeToSeconds(uint64_t) — Flexo helper @0xd02c3d.
//   * objc_autoreleasePoolPush / Pop  — libobjc stubs.
//   * `_gFFPMR_ENABLED` / `_gFFPMR_ENABLED_all` / `_gFFPMR_ENABLED_audio` —
//     global u8 gflags.
//   * `-[FFPMRLoggingFunnels _notifyOfFirstDrawing:]`,
//     `-[... setPMRLogString:]` (the RIP-loaded selectors), plus a stack-
//     block invoke of `__ZN21FFAudioPerfRenderHook4StopEv_block_invoke`
//     that consumes the FFRunningStatistics snapshot.
//   * operator delete[]  (__ZdaPv @0x14973fe).
//   * operator delete    (__ZdlPv @0x1497404).
//
// None of the Flexo-side helpers or the Objective-C messages are ported;
// Start / PostRender do have a decoded semantic body but they touch atomic
// state we can't safely emulate in a synchronous TS interpreter.
//
// -----------------------------------------------------------------------------

/** Opaque FFRunningStatistics handle — the class exists in raw-port but its
 *  interface isn't imported here to avoid cross-module coupling for a hook. */
export type FFRunningStatistics = { readonly _fFRunningStatisticsTag: unique symbol };

/** AudioTimeStamp / AudioBufferList are CoreAudio types — untouched by any
 *  of the six methods (they're just forwarded as `const&`), so we don't
 *  bother modeling them. */
export type AudioTimeStamp = object;
export type AudioBufferList = object;

export class FFAudioPerfRenderHook {
  /** @+0x00 — FFAudioRenderHook primary vtable pointer.  Reset in dtors. */
  vptrPrimary: unknown = null;

  /** @+0x08 — secondary vtable pointer (second-base MI slot).  Reset in
   *  dtors from `RIP + 0xc0cb4e` (D1) / `RIP + 0xc0cb17` (D0). */
  vptrSecondary: unknown = null;

  /** @+0x10 — heap ring buffer of per-render nanosecond deltas.  Zero
   *  means "not allocated"; both dtors branch on nonzero before delete[]. */
  ringBuf: BigUint64Array | null = null;

  /** @+0x20 — capacity of the ring buffer, in u64 slots. */
  capacity: bigint = 0n;

  /** @+0x28 — atomic write-cursor incremented on each PostRender. */
  writeCursor: bigint = 0n;

  /** @+0x30 — atomic read-cursor.  Post-freeze water-mark set by Stop. */
  readCursor: bigint = 0n;

  /** @+0x38 — mach_absolute_time snapshot from the most recent PreRender. */
  preRenderTicks: bigint = 0n;

  /**
   * `FFAudioPerfRenderHook::PreRender(uint32_t, AudioTimeStamp const&,
   *      uint32_t, uint32_t, AudioBufferList const&)` — @0xd02b10.
   *
   * Body verbatim:
   *   pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
   *   this = rdi = rbx                                @0xd02b16
   *   callq _mach_absolute_time                        @0xd02b19
   *   this[+0x38] = rax                                @0xd02b1e
   *   addq $0x8, %rsp; popq %rbx; popq %rbp; retq
   *
   * Ignores every arg — captures the host tick counter for later diffing.
   */
  PreRender(
    _busNumber: number,
    _timestamp: AudioTimeStamp,
    _numFrames: number,
    _channels: number,
    _bufferList: AudioBufferList,
  ): void {
    // @0xd02b19: mach_absolute_time() — not portable in TS; the closest
    // deterministic analog is a monotonic tick counter.  We surface the
    // dependency and raise so callers know this hook needs a host clock.
    // @0xd02b10
    throw new Error(
      "FFAudioPerfRenderHook::PreRender: requires mach_absolute_time() " +
        "(_mach_absolute_time libSystem stub @0x1497848) — not ported. " +
        "@0xd02b10",
    );
  }

  /**
   * `FFAudioPerfRenderHook::PostRender(uint32_t, AudioTimeStamp const&,
   *      uint32_t, uint32_t, AudioBufferList const&)` — @0xd02b30.
   *
   * Body verbatim:
   *   pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
   *   this = rdi = rbx                                @0xd02b36
   *   callq _mach_absolute_time                        @0xd02b39
   *   rcx  = rax - this[+0x38]        // elapsed ticks   @0xd02b41
   *   eax  = 1                        // atomic delta                @0xd02b45
   *   lock xaddq %rax, this[+0x28]    // idx = writeCursor++          @0xd02b4b
   *   rsi  = this[+0x20]              // capacity                     @0xd02b50
   *
   *   rdx  = rax | rsi
   *   if ((rdx >> 32) != 0) { xorl edx,edx; divq rsi; }  // 64-bit mod
   *   else                  { xorl edx,edx; divl esi; }  // 32-bit mod
   *   rax = this[+0x10]               // ringBuf                      @0xd02b6b
   *   *(u64*)(rax + rdx*8) = rcx      // ringBuf[idx % cap] = elapsed  @0xd02b6f
   *   ret
   *
   * Semantically: `ringBuf[fetch_add(&writeCursor, 1) % capacity] =
   *                mach_absolute_time() - preRenderTicks`.
   */
  PostRender(
    _busNumber: number,
    _timestamp: AudioTimeStamp,
    _numFrames: number,
    _channels: number,
    _bufferList: AudioBufferList,
  ): void {
    // @0xd02b30
    throw new Error(
      "FFAudioPerfRenderHook::PostRender: requires mach_absolute_time() " +
        "(_mach_absolute_time libSystem stub @0x1497848) — not ported. " +
        "@0xd02b30",
    );
  }

  /**
   * `FFAudioPerfRenderHook::Start()` — @0xd02b80.
   *
   * Body verbatim (5 insns + prologue/epilogue):
   *   pushq %rbp; movq %rsp, %rbp
   *   xorl  %eax, %eax                                 @0xd02b84
   *   xchgq %rax, 0x30(%rdi)          // readCursor  = 0             @0xd02b86
   *   xorl  %eax, %eax                                 @0xd02b8a
   *   xchgq %rax, 0x28(%rdi)          // writeCursor = 0             @0xd02b8c
   *   popq %rbp; retq
   *
   * Two atomic-store-zero operations to reset the ring cursors.  The
   * `xchgq` instruction implicitly locks the bus (x86 memory model), so
   * these are release stores.
   */
  Start(): void {
    // @0xd02b86: readCursor  = 0  (atomic release store)
    this.readCursor = 0n;
    // @0xd02b8c: writeCursor = 0  (atomic release store)
    this.writeCursor = 0n;
  }

  /**
   * `FFAudioPerfRenderHook::Stop()` — @0xd02bc0.
   *
   * The full body (see raw-port/re/disasm/Flexo.FFAudioPerfRenderHook.Stop.s)
   * follows this control flow:
   *
   *   @0xd02bc0-0xd02bcb  if (writeCursor <= readCursor) return; (fast exit)
   *
   *   @0xd02bd1-0xd02bfe  build a 48-byte FFRunningStatistics on stack
   *          via three xorpd + movapd stores @[-0x40..-0x11], then
   *          FFRunningStatistics::reset(&stats).
   *
   *   @0xd02bfe-0xd02c1e  freeze the range:
   *          endCursor = writeCursor - preLoggingBase(readCursor?)   ; @0xd02c02
   *          if (endCursor < 0) endCursor = 0                         ; cmovg
   *          xchgq readCursor, endCursor       ; atomic swap-in       ; @0xd02c0f
   *
   *   @0xd02c1e-0xd02c7e  aggregation loop:
   *          for (i = readCursor; i < writeCursor; ) {
   *              // atomic fetch_add(&readCursor, 1) → i
   *              // idx = i % capacity      (same 32/64 divide branch as
   *              //                          PostRender)
   *              t = ringBuf[idx]                                     ; @0xd02c39
   *              seconds = FFConvertHostTimeToSeconds(t)              ; @0xd02c3d
   *              seconds *= *(f64*)&(rip + 0x86c63e)  // ns→ms scale? ; @0xd02c42
   *              FFRunningStatistics::addData(&stats, seconds)         ; @0xd02c4d
   *          }
   *
   *   @0xd02c80-0xd02c85  if (stats.count == 0) skip logging.
   *
   *   @0xd02c8b-0xd02d4f  wrap the remaining logic in an
   *          objc_autoreleasePool:
   *              if (!gFFPMR_ENABLED) skip
   *              if (!gFFPMR_ENABLED_all && !gFFPMR_ENABLED_audio) skip
   *              call `-[FFPMRLoggingFunnels _notifyOfFirstDrawing:]`
   *                  then a second Obj-C send (selector at
   *                  RIP+0xeb66bc)
   *              build a stack-block:
   *                  descriptor slot = 0xC6000000_00000000 (block flags)
   *                  invoke = ___ZN21FFAudioPerfRenderHook4StopEv_block_invoke
   *                  block descriptor: 80 bytes, e8 signature "e8_32c25_ZTS19FFRunningStatistics_e9_v16?0^v8l"
   *                  captured payload = the 48-byte FFRunningStatistics
   *                  (three xmm copies @[-0x70..-0x50])
   *              send third Obj-C selector (RIP+0xeb662e) with the block.
   *              objc_autoreleasePoolPop
   *
   *   @0xd02d57-0xd02d62  epilogue.
   *
   * The whole body requires FFRunningStatistics (partially ported),
   * FFConvertHostTimeToSeconds, three global u8 gflags, four Obj-C
   * selectors, a stack block descriptor, and mach_absolute_time — none
   * end-to-end ported.
   */
  Stop(): void {
    // @0xd02bc0
    throw new Error(
      "FFAudioPerfRenderHook::Stop: requires FFRunningStatistics + " +
        "FFConvertHostTimeToSeconds + Objective-C messaging to " +
        "FFPMRLoggingFunnels + stack-block invoke (StopEv_block_invoke) " +
        "+ gFFPMR_ENABLED gflags — none ported. @0xd02bc0",
    );
  }

  /**
   * `FFAudioPerfRenderHook::~FFAudioPerfRenderHook()` — D1 @0xd04230.
   *
   * Body verbatim:
   *   pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
   *   this = rdi = rbx                                          @0xd04236
   *   this[+0x00] = &RIP+0xc0ca10   // FFAudioRenderHook D1 vptr @0xd04240
   *   this[+0x08] = &RIP+0xc0cb4e   // secondary D1 vptr         @0xd0424a
   *   rdi = this[+0x10]              // ringBuf                   @0xd0424e
   *   if (ringBuf == nullptr) skip                                @0xd04255
   *   __ZdaPv(ringBuf)              // operator delete[]          @0xd04257
   *   this[+0x10] = 0                                             @0xd0425c
   *   epilogue; retq
   */
  static destroy_D1(self: FFAudioPerfRenderHook): void {
    // @0xd04240: install base D1 vtable (nominal)
    self.vptrPrimary = null;
    // @0xd0424a: install secondary D1 vtable (nominal)
    self.vptrSecondary = null;
    // @0xd04255-0xd0425c: free ringBuf if non-null (GC in TS)
    self.ringBuf = null;
  }

  /**
   * `FFAudioPerfRenderHook::~FFAudioPerfRenderHook()` — D0 @0xd04270
   * (deleting destructor).
   *
   * Body verbatim (starts without a prologue — the compiler inlined the
   * fast-path "no allocation" branch):
   *   this[+0x00] = &RIP+0xc0c9d9    // deleting-D0 vptr slot    @0xd04277
   *   this[+0x08] = &RIP+0xc0cb17    // secondary D0 vptr        @0xd04281
   *   rax = this[+0x10]              // ringBuf                   @0xd04285
   *   if (ringBuf == nullptr) tail-jmp __ZdlPv(this)              @0xd0428c
   *   // else: full frame
   *   push rbp; mov rsp,rbp; push rbx; push rax
   *   this = rbx
   *   __ZdaPv(ringBuf)               // operator delete[]         @0xd0429e
   *   tail-jmp __ZdlPv(this)          // operator delete           @0xd042ac
   */
  static destroy_D0(self: FFAudioPerfRenderHook): void {
    // @0xd04277: install D0 vtable (nominal)
    self.vptrPrimary = null;
    // @0xd04281: install secondary D0 vtable (nominal)
    self.vptrSecondary = null;
    // @0xd0428c or @0xd0429e: free ringBuf if non-null (GC in TS)
    self.ringBuf = null;
    // @0xd042ac (or @0xd0428c fast-path): __ZdlPv(this)  — GC in TS.
  }
}
