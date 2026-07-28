// FFPlaybackMemoryMonitor.ts — Flexo framework's FFPlaybackMemoryMonitor: a
// small state machine that tracks system memory pressure and reports a
// recommended "pre-image count" (playback lookahead frame count) for the
// FFPlaybackController. Wraps a FFMemoryPressureTracker on a dedicated serial
// dispatch queue and exposes two query paths:
//   - calculatePreImageFromMemoryPressureData(&changed) — reads the tracker's
//     current+prior state; returns the max pre-image and flips *changed=true
//     when the cached preImage differs from a fresh calculation.
//   - adjustPreImageForMemoryPressure(int) — dispatch_sync's the above onto the
//     internal queue and returns max(callerRequested, computed).
//
// Method dispatch:
//   @Flexo 0x0000000000da5910  FFPlaybackMemoryMonitor::FFPlaybackMemoryMonitor()  [C2 base ctor]
//   @Flexo 0x0000000000da5a30  FFPlaybackMemoryMonitor::FFPlaybackMemoryMonitor()  [C1 complete ctor — thunk to C2]
//   @Flexo 0x0000000000da5a40  FFPlaybackMemoryMonitor::~FFPlaybackMemoryMonitor()
//   @Flexo 0x0000000000da5a70  FFPlaybackMemoryMonitor::getMaxSizeForState(unsigned long)
//   @Flexo 0x0000000000da5aa0  FFPlaybackMemoryMonitor::calculatePreImageFromMemoryPressureData(bool&)
//   @Flexo 0x0000000000da5b50  FFPlaybackMemoryMonitor::adjustPreImageForMemoryPressure(int)
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.FFPlaybackMemoryMonitor.s     (@0xda5910..0xda5cf2, full class body incl. block invokes)
//
// STRUCT LAYOUT (recovered from the C2 ctor's field stores at @0xda5923..0xda595e,
// the destructor at @0xda5a40..0xda5a61, calculatePreImage... at @0xda5ab9..0xda5b3a,
// and the adjust... block invoke at @0xda5c41..0xda5ce0):
//   +0x00  queue           dispatch_queue_t          (serial queue "com.apple.flexo.ffplayHM.cb",
//                                                     dispatch_queue_create @0xda598a; released
//                                                     via _dispatch_release in dtor @0xda5a61)
//   +0x08  tracker         FFMemoryPressureTracker*  (heap-alloc'd via operator new (0xc0 bytes)
//                                                     @0xda59c8 then FFMemoryPressureTracker ctor
//                                                     @0xda59e2; deleted via virtual destructor
//                                                     *(vtable+0x8) @0xda5a55)
//   +0x10  currentState    unsigned long             ("state" half of FFMemoryPressureStateInfo #1;
//                                                     first written from raw memory-state fetch
//                                                     @0xda5945: `movq %rax, 0x10(%rbx)`)
//   +0x18  currentTs       double                    ("timestamp" half of state #1; written from
//                                                     xmm0 @0xda5949: `movsd %xmm0, 0x18(%rbx)`)
//   +0x20  priorState      unsigned long             (state #2; @0xda5952 the ctor mirrors #1 →
//                                                     `movq %rax, 0x20(%rbx)` so both slots start
//                                                     identical; later overwritten by the tracker's
//                                                     callback block — see block_invoke @0xda5a10)
//   +0x28  priorTs         double                    (@0xda595a: `movq %rax, 0x28(%rbx)`)
//   +0x30  cachedPreImage  int32                     (initialized to 0xe = 14 @0xda595e:
//                                                     `movl $0xe, 0x30(%rbx)`; updated in place
//                                                     by calculatePreImageFromMemoryPressureData
//                                                     @0xda5b36 and the adjust block @0xda5cd4)
//   sizeof ≥ 0x34; the compiler pads to 0x38.
//
// The two FFMemoryPressureStateInfo slots (#1 at +0x10..+0x1F and #2 at
// +0x20..+0x2F) are laid out as {state:u64, timestamp:double}. Confirmed by the
// FFMemoryPressureStateInfo(unsigned long) ctor call @0xda5937 which returns a
// two-word aggregate in (rax, xmm0) that gets stored back into +0x10/+0x18, and
// by the block_invoke at @0xda5a10..0xda5a28 which the tracker installs as its
// state-change callback: it shifts the current pair (+0x10..+0x1F) into the
// prior pair (+0x20..+0x2F) and writes the incoming pair into +0x10..+0x1F.
//
// The chosen field names are STRUCTURAL — the actual C++ member identifiers are
// not recoverable from the stripped binary. Naming is anchored to how the
// fields are consumed:
//   - queue / tracker: standard Apple pattern for a dispatch-queue-guarded
//     helper; tracker holds the callback pointer that mutates the state pair.
//   - currentState / currentTs vs priorState / priorTs: the block_invoke at
//     @0xda5a10 does `mem[+0x20..+0x2F] = mem[+0x10..+0x1F]; mem[+0x10..+0x1F] =
//     *incoming;` — i.e. "shift current → prior, install new as current".
//   - cachedPreImage: only ever holds an i32 result of getMaxSizeForState-style
//     lookups (0x6/0x8/0xe) and is the value returned by
//     calculatePreImageFromMemoryPressureData; it's a memoized last-decision.
//
// Numerics: the const at rip-relative @0x156f9a0 (decoded via Python
// `open(FCP,'rb').seek(0x4000 + 0x156f9a0); read(8)` on the FAT x86_64 slice,
// bytes `00 00 00 00 00 00 2e 40` → IEEE-754 double `15.0`) is used at
// @0xda5b16 and @0xda5cb3 as the divisor of `(now - currentTs) / 15.0` to
// convert elapsed seconds since the last state transition into an integer
// "hysteresis step count" (via cvttsd2si — C-style truncation toward zero).
// That value is added to the "current-state max" pre-image and clamped against
// the "prior-state max" to gradually re-approach the higher pre-image budget
// after the memory-pressure state improves.
//
// The state code → max pre-image mapping (@0xda5a70 getMaxSizeForState and its
// two inlined copies @0xda5abd..0xda5b03 and @0xda5c59..0xda5c9f) is a nested
// cmov chain that materializes exactly four values:
//     state == 1 (normal)     → 14   (0xe)
//     state == 2 (warn)       →  8   (0x8)
//     state == 4 (urgent)     →  6   (0x6)
//     state <  2 (unknown/0)  → 14   (0xe)  (bypass on cmovb — unsigned below)
// The cmov sequence is: start ecx=8, edx=0xe; ecx = (sMS == 2) ? 8 : 0xe;
// eax=6; eax = (sMS == 4) ? 6 : ecx; eax = (sMS < 2) ? 0xe : eax. Any state
// value other than {1, 2, 4} that is ≥ 2 falls through to the ecx value (0xe).
// (In particular state==3 returns 0xe. This is a raw transcription of the asm;
// it is not a heuristic — the FCP binary chose this exact cmov chain.)
//
// FRONTIER DEPENDENCIES (raise on entry — not yet ported):
//   - FFMemoryPressureTracker (Flexo, @Flexo 0x????) — objc/dispatch-heavy
//     class whose ctor takes (block, dispatch_queue_t, double timeoutSec).
//     Called @0xda59e2 with double 0.0 (xmm0 loaded from rip+0x7c95fc).
//   - FFMemoryPressureStateInfo::FFMemoryPressureStateInfo(unsigned long)
//     (Flexo, @Flexo 0x????) — trivial (state, timestamp) constructor called
//     @0xda5937.
//   - FFMemoryPressureTracker::getCurrentRawMemoryState(unsigned long) (Flexo,
//     @Flexo 0x????) — static-like helper called with arg=1 @0xda592b to seed
//     the initial state.
//   - FFGetHostTimeSeconds() (Flexo, @Flexo 0x????) — used @0xda5b0c and
//     @0xda5ca8; returns wall-clock seconds as a double.
//   - libdispatch: _dispatch_queue_create, _dispatch_queue_attr_make_with_*,
//     _dispatch_assert_queue$V2, _dispatch_sync, _dispatch_release. These are
//     objc/GCD primitives outside the raw-port scope; direct TS mapping uses a
//     small shim interface (dispatchQueueCreate / dispatchSync / etc.) that
//     must be provided by the runtime host — raise from the stubs below.
//
// TIMELINE VALUE: this class is not on the render/animation timeline. It is
// invoked lazily by FFPlaybackController @0xd741f3 (the only callq to its C1
// ctor found in Flexo). Porting it enables faithful reproduction of the
// playback controller's memory-adaptive lookahead budget when we ever route
// that path through the TS engine; until then, the frontier stubs raise on
// entry so any accidental caller is surfaced immediately.
//
// This file is a raw transcription of the x86_64 disassembly; every function
// cites its @0xADDR and every non-trivial numeric literal is either decoded
// from the binary (see the divisor above) or reproduced bit-identically from
// the asm (0xe / 0x8 / 0x6, dispatch-queue attribute constants 0x1 / 0x21 /
// 0x0, block-descriptor flags 0xc0000000 / 0xc2000000 / 0x2020000000).

// ---------------------------------------------------------------------------
// Frontier stubs — raise on entry. Every raise() cites the @0xADDR the caller
// dispatches to. Do not weaken; a demand signal here is how we prioritize the
// next port.

/**
 * FFMemoryPressureStateInfo — {state, timestamp} pair. Structural placeholder
 * mirroring the two-word aggregate the ctor at @Flexo 0xda5937 returns and
 * the block_invoke at @Flexo 0xda5a10 shifts.
 */
export interface FFMemoryPressureStateInfo {
  state: number; // unsigned long — 1=normal, 2=warn, 4=urgent (Mach memory-pressure levels)
  timestamp: number; // double — FFGetHostTimeSeconds() at transition
}

/**
 * Build an FFMemoryPressureStateInfo from a raw state value. Mirrors the
 * FFMemoryPressureStateInfo::FFMemoryPressureStateInfo(unsigned long) ctor
 * called @Flexo 0xda5937 from FFPlaybackMemoryMonitor's own ctor. The ctor is
 * not yet transcribed; its exact timestamp source is FFGetHostTimeSeconds()
 * but confirming that requires disassembling the ctor itself — raise until
 * that port lands so we do not fabricate the timestamp semantics.
 */
function makeFFMemoryPressureStateInfo(_state: number): FFMemoryPressureStateInfo {
  // @Flexo 0xda5937 callq __ZN25FFMemoryPressureStateInfoC2Em — not yet ported.
  throw new Error(
    "FFMemoryPressureStateInfo::FFMemoryPressureStateInfo(unsigned long) not yet ported (Flexo @0xda5937) — raise",
  );
}

/**
 * Static-like helper: return the current OS memory-pressure level as a raw
 * unsigned long (1=normal / 2=warn / 4=urgent per libsystem's dispatch source
 * flags). Called @Flexo 0xda592b with fixed arg=1 (initial-state query mode).
 */
function ffMemoryPressureTrackerGetCurrentRawMemoryState(_mode: number): number {
  // @Flexo 0xda592b callq __ZN23FFMemoryPressureTracker24getCurrentRawMemoryStateEm — not yet ported.
  throw new Error(
    "FFMemoryPressureTracker::getCurrentRawMemoryState(unsigned long) not yet ported (Flexo @0xda592b) — raise",
  );
}

/**
 * Wall-clock seconds as a double. Called @Flexo 0xda5b0c and @Flexo 0xda5ca8.
 * Distinct from any host wall-clock — FCP uses mach_absolute_time
 * scaled by the host timebase, which is not the same origin as Unix epoch.
 * Raise until FFGetHostTimeSeconds is ported so callers see the missing dep.
 */
function ffGetHostTimeSeconds(): number {
  // @Flexo 0xda5b0c / 0xda5ca8 callq _FFGetHostTimeSeconds — not yet ported.
  throw new Error("FFGetHostTimeSeconds() not yet ported (Flexo @0xda5b0c, @0xda5ca8) — raise");
}

// libdispatch shim — the raw class uses dispatch_queue_create /
// dispatch_queue_attr_make_with_* / dispatch_sync / dispatch_release /
// dispatch_assert_queue$V2. In a TS host these must be provided; raise from
// the wrappers so an accidental call surfaces the missing runtime capability.
type DispatchQueue = { readonly __dispatchQueueBrand: unique symbol };

function dispatchQueueCreate(_label: string, _attr: unknown): DispatchQueue {
  // @Flexo 0xda598a callq _dispatch_queue_create — objc/GCD primitive, out of scope.
  throw new Error("dispatch_queue_create not available in TS host (Flexo @0xda598a) — raise");
}
function dispatchQueueAttrMakeWithAutoreleaseFrequency(_attr: unknown, _freq: number): unknown {
  // @Flexo 0xda596c — freq=1 (DISPATCH_AUTORELEASE_FREQUENCY_WORK_ITEM).
  throw new Error("dispatch_queue_attr_make_with_autorelease_frequency not available (Flexo @0xda596c) — raise");
}
function dispatchQueueAttrMakeWithQosClass(_attr: unknown, _qos: number, _rel: number): unknown {
  // @Flexo 0xda597b — qos=0x21 (QOS_CLASS_USER_INITIATED), rel=0.
  throw new Error("dispatch_queue_attr_make_with_qos_class not available (Flexo @0xda597b) — raise");
}
function dispatchAssertQueue(_q: DispatchQueue): void {
  // @Flexo 0xda5ab4 / 0xda5c50 callq _dispatch_assert_queue$V2 — enforces
  // that the caller is on the given serial queue. In TS we do not model
  // multi-threaded queue ownership; raise so accidental cross-thread callers
  // are made visible rather than silently accepted.
  throw new Error("dispatch_assert_queue$V2 not available in TS host (Flexo @0xda5ab4, @0xda5c50) — raise");
}
function dispatchSync(_q: DispatchQueue, _block: () => void): void {
  // @Flexo 0xda5be7 callq _dispatch_sync — synchronous block dispatch onto q.
  throw new Error("dispatch_sync not available in TS host (Flexo @0xda5be7) — raise");
}
function dispatchRelease(_q: DispatchQueue): void {
  // @Flexo 0xda5a61 jmp _dispatch_release — dtor tail-jump to release the queue.
  throw new Error("dispatch_release not available in TS host (Flexo @0xda5a61) — raise");
}

/**
 * FFMemoryPressureTracker — heap-allocated tracker constructed with a block
 * callback, a dispatch queue, and a double (0.0 in the sole callsite). Its
 * virtual destructor is invoked through the vtable *(vtable+0x8) at
 * @Flexo 0xda5a55. Fully out of scope for now.
 */
class FFMemoryPressureTracker {
  // @Flexo 0xda59e2 callq __ZN23FFMemoryPressureTrackerC1E... — 0xc0-byte object.
  // (Sizeof recovered from operator new(0xc0) @0xda59c8.)
  constructor(_cb: (info: FFMemoryPressureStateInfo) => void, _queue: DispatchQueue, _timeoutSec: number) {
    throw new Error(
      "FFMemoryPressureTracker::FFMemoryPressureTracker(block, dispatch_queue_t, double) not yet ported (Flexo @0xda59e2) — raise",
    );
  }
  /** Virtual dtor slot — @Flexo 0xda5a55 `callq *0x8(%rax)`. */
  destroy(): void {
    throw new Error("FFMemoryPressureTracker::~FFMemoryPressureTracker (vtable+0x8) not yet ported (Flexo @0xda5a55) — raise");
  }
}

// ---------------------------------------------------------------------------
// FFPlaybackMemoryMonitor — the class itself.

export class FFPlaybackMemoryMonitor {
  // Layout mirrors the x86_64 struct at offsets 0x00/0x08/0x10/0x18/0x20/0x28/0x30.
  private queue: DispatchQueue | null = null; // +0x00
  private tracker: FFMemoryPressureTracker | null = null; // +0x08
  private currentState = 0; // +0x10 (unsigned long)
  private currentTs = 0.0; // +0x18 (double)
  private priorState = 0; // +0x20 (unsigned long)
  private priorTs = 0.0; // +0x28 (double)
  private cachedPreImage = 0; // +0x30 (i32)

  /**
   * FFPlaybackMemoryMonitor::FFPlaybackMemoryMonitor()
   * @Flexo 0xda5910 (C2 base ctor). The C1 ctor @0xda5a30 is a naked
   *   push %rbp; mov %rsp,%rbp; pop %rbp; jmp C2 — same body.
   *
   * Sequence transcribed from @0xda5910..0xda59f5:
   *   xorps xmm0,xmm0; movups xmm0,(rdi)     ; zero the first 16 bytes (queue+tracker slots).
   *   mov  edi, 1                            ; arg=1
   *   callq FFMemoryPressureTracker::getCurrentRawMemoryState(1)   ; @0xda592b
   *   lea  rdi, [rbp-0x28]                   ; stack tmp for a FFMemoryPressureStateInfo
   *   mov  rsi, rax                          ; state = returned raw memory-state
   *   callq FFMemoryPressureStateInfo::FFMemoryPressureStateInfo(unsigned long)   ; @0xda5937
   *   ; copy tmp {state, ts} into +0x10/+0x18:
   *   mov  rax, [rbp-0x28]; mov  [rbx+0x10], rax
   *   movsd xmm0,[rbp-0x20]; movsd [rbx+0x18], xmm0
   *   ; mirror +0x10/+0x18 into +0x20/+0x28 (prior := current):
   *   mov  rax, [rbx+0x10]; mov  [rbx+0x20], rax
   *   mov  rax, [rbx+0x18]; mov  [rbx+0x28], rax
   *   ; init cachedPreImage = 0xe (14):
   *   mov  dword ptr [rbx+0x30], 0xe        ; @0xda595e
   *   ; build serial dispatch queue "com.apple.flexo.ffplayHM.cb" with
   *   ; QOS_CLASS_USER_INITIATED (0x21) + autorelease-per-workitem (freq=1):
   *   xor  edi,edi; mov esi,1                ; @0xda596a — attr=NULL, freq=1
   *   callq _dispatch_queue_attr_make_with_autorelease_frequency   ; @0xda596c
   *   mov  rdi, rax; mov esi, 0x21; xor edx,edx  ; qos=0x21, rel=0
   *   callq _dispatch_queue_attr_make_with_qos_class               ; @0xda597b
   *   lea  rdi, "com.apple.flexo.ffplayHM.cb"    ; @0xda5980 (literal pool)
   *   mov  rsi, rax
   *   callq _dispatch_queue_create                                  ; @0xda598a
   *   mov  [rbx], rax                        ; +0x00 = queue
   *   ; build a stack block { isa=_NSConcreteStackBlock, flags=0xc0000000,
   *   ;                       invoke=block_invoke_C2, desc=..., self=rbx };
   *   ; heap-allocate a 0xc0-byte FFMemoryPressureTracker; construct it with
   *   ; (block, queue, 0.0) — the double 0.0 comes from rip+0x7c95fc.
   *   mov  edi, 0xc0; callq __Znwm                                  ; @0xda59c8 — operator new(0xc0)
   *   movsd xmm0, [rip+0x7c95fc]              ; timeoutSec = 0.0 (all-zero double)
   *   callq FFMemoryPressureTracker::FFMemoryPressureTracker(block, dispatch_queue_t, double) ; @0xda59e2
   *   mov  [rbx+0x8], r14                     ; +0x08 = tracker
   *   ret
   *
   * The tracker's callback block (@0xda5a10 ____ZN23FFPlaybackMemoryMonitorC2Ev_block_invoke)
   * receives an FFMemoryPressureStateInfo const& and does exactly:
   *     mov r_self, [block+0x20]                ; captured `this`
   *     mov  xmm0, [r_self+0x10]; mov [r_self+0x20], xmm0  ; prior := current pair (16 bytes)
   *     mov  xmm0, [incoming]; mov  [r_self+0x10], xmm0    ; current := incoming
   * i.e. it shifts current → prior and installs the new pair as current. It
   * does NOT touch cachedPreImage — that's updated only by the two query paths.
   */
  constructor() {
    // Zero-init already handled by the class field initializers above; the
    // xorps/movups pair at @0xda5920..0xda5923 zeroes only the first 16 bytes
    // (queue and tracker slots) before the tracker+queue construction stores
    // their real values, which matches our null-init.

    // @0xda592b: seed the initial raw memory-pressure state.
    const rawState = ffMemoryPressureTrackerGetCurrentRawMemoryState(1);

    // @0xda5937: wrap it in an FFMemoryPressureStateInfo (timestamp is
    // assigned by that ctor).
    const info = makeFFMemoryPressureStateInfo(rawState);

    // Store as current (+0x10/+0x18) and mirror into prior (+0x20/+0x28).
    this.currentState = info.state;
    this.currentTs = info.timestamp;
    this.priorState = info.state;
    this.priorTs = info.timestamp;

    // @0xda595e: cachedPreImage = 14.
    this.cachedPreImage = 0xe;

    // @0xda596c..0xda598a: build the serial queue.
    const attr0 = dispatchQueueAttrMakeWithAutoreleaseFrequency(null, 1);
    const attr1 = dispatchQueueAttrMakeWithQosClass(attr0, 0x21, 0);
    this.queue = dispatchQueueCreate("com.apple.flexo.ffplayHM.cb", attr1);

    // @0xda59a9..0xda59e7: heap-alloc + construct the tracker with the
    // state-shift callback bound to this and timeoutSec=0.0. The block
    // captures `this` at descriptor offset +0x20 and, when invoked, executes
    // the shift-and-install logic transcribed from @0xda5a10..0xda5a28.
    this.tracker = new FFMemoryPressureTracker(
      (incoming: FFMemoryPressureStateInfo) => {
        // @0xda5a14..0xda5a23 — shift current → prior, then current := incoming.
        this.priorState = this.currentState;
        this.priorTs = this.currentTs;
        this.currentState = incoming.state;
        this.currentTs = incoming.timestamp;
      },
      this.queue,
      0.0,
    );
  }

  /**
   * FFPlaybackMemoryMonitor::~FFPlaybackMemoryMonitor()
   * @Flexo 0xda5a40 (D1 dtor).
   *
   * Sequence transcribed from @0xda5a40..0xda5a61:
   *   mov  rdi, [rbx+0x8]                    ; tracker
   *   test rdi, rdi; je skip                 ; skip if null
   *   mov  rax, [rdi]                        ; vtable
   *   callq *0x8(%rax)                       ; virtual dtor slot (delete this)
   * skip:
   *   mov  rdi, [rbx]                        ; queue
   *   jmp  _dispatch_release                 ; tail-call release
   */
  destroy(): void {
    if (this.tracker !== null) {
      // @0xda5a55: virtual dtor via vtable+0x8.
      this.tracker.destroy();
      this.tracker = null;
    }
    if (this.queue !== null) {
      // @0xda5a61: dispatch_release(queue).
      dispatchRelease(this.queue);
      this.queue = null;
    }
  }

  /**
   * FFPlaybackMemoryMonitor::getMaxSizeForState(unsigned long)
   * @Flexo 0xda5a70..0xda5a99.
   *
   * Nested cmov chain:
   *   cmp rsi, 2;   ecx = (rsi == 2) ? 0x8  : 0xe
   *   cmp rsi, 4;   eax = (rsi == 4) ? 0x6  : ecx
   *   cmp rsi, 2;   eax = (rsi <  2) ? 0xe  : eax
   *   ret
   *
   * This is a `static` member function in C++ (no `this` — %rdi is unused
   * inside the body; only %rsi participates). Modeled as a TS static.
   *
   * Truth table (all four output paths reachable):
   *   rsi == 0        → 0xe  (via `rsi < 2` unsigned-below cmov)
   *   rsi == 1        → 0xe  (initial edx=0xe; none of the equals fire)
   *   rsi == 2        → 0x8
   *   rsi == 3        → 0xe  (falls through to ecx=0xe from the != 2 branch)
   *   rsi == 4        → 0x6
   *   rsi >= 5        → 0xe
   */
  static getMaxSizeForState(state: number): number {
    // Match the u64 comparisons the asm uses. Treat `state` as an unsigned
    // integer identifier; direct TS mapping to i32 arithmetic below is safe
    // because all comparators are small non-negative constants (2, 4).
    // @0xda5a74 cmp rsi, 2 / mov ecx, 0x8 / mov edx, 0xe / cmovne edx→ecx:
    let ecx = state === 2 ? 0x8 : 0xe;
    // @0xda5a85 cmp rsi, 4 / mov eax, 0x6 / cmovne ecx→eax:
    let eax = state === 4 ? 0x6 : ecx;
    // @0xda5a91 cmp rsi, 2 / cmovb edx→eax   (unsigned-below check):
    if (state < 2) eax = 0xe;
    return eax | 0;
  }

  /**
   * FFPlaybackMemoryMonitor::calculatePreImageFromMemoryPressureData(bool& changed)
   * @Flexo 0xda5aa0..0xda5b45.
   *
   * Preconditions: the caller must be running on the queue at +0x00 (asserted
   * via dispatch_assert_queue$V2 @0xda5ab4).
   *
   * Sequence:
   *   dispatch_assert_queue(self.queue)
   *   // Inlined copy of getMaxSizeForState on priorState (+0x20) → r12d:
   *   rax = priorState
   *   r15d = 0x8; r12d = 0xe
   *   if (rax == 2) r12d = r15d(=8)
   *   if (rax == 4) r12d = 6
   *   if (rax <  2) r12d = 0xe
   *   // priorMax now in r12d.
   *   // Inlined copy of getMaxSizeForState on currentState (+0x10) → r15d:
   *   rax = currentState
   *   if (rax != 2) r15d = 0xe   // note: != , not the pair (==2)? style — see below
   *   if (rax == 4) r15d = 6
   *   if (rax <  2) r15d = 0xe
   *   // currentMax now in r15d.
   *
   *   // If current is *strictly better* (currentMax > priorMax), gradually
   *   // interpolate up over the elapsed seconds since the transition:
   *   if (r15d > r12d) {   // jbe skips this block — unsigned "current <= prior"
   *     xmm0 = FFGetHostTimeSeconds()
   *     xmm0 -= currentTs (+0x18)
   *     xmm0 /= 15.0                    ; the decoded rip const @0x156f9a0
   *     eax   = cvttsd2si(xmm0)         ; truncate-toward-zero to i32
   *     r12d += eax                     ; priorMax += elapsedSteps
   *     if (r12d < r15d) r15d = r12d    ; clamp currentMax down to priorMax+elapsed
   *   }
   *
   *   // Publish and detect a change vs cache:
   *   if (r15d != cachedPreImage) {
   *     *changed = true
   *     cachedPreImage = r15d
   *   }
   *   return r15d
   *
   * IMPORTANT — the "current" and "prior" inlined chains at @0xda5abd..0xda5b03
   * and @0xda5aeb..0xda5b03 differ subtly. The FIRST (on priorState via `rax =
   * [rbx+0x20]`) uses cmov*e* to load 0x8 into r12d when rax==2 (i.e. the same
   * table as getMaxSizeForState). The SECOND (on currentState via `rax =
   * [rbx+0x10]`) uses cmov*ne* to load 0xe into r15d whenever rax != 2 — this
   * inverted-polarity variant still yields the same truth table because r15d
   * was pre-loaded with 0x8 at @0xda5ac1 and gets overwritten to 0xe on any
   * state other than 2. Both paths are functionally identical to
   * getMaxSizeForState; the compiler just scheduled the cmov polarities to
   * pack tightly across the two chains sharing r15d as a scratch register.
   *
   * The bool& out-param is written via `movb $1, (%r14)` @0xda5b32; the ABI
   * stores it as one byte. In TS we surface it via a two-slot Object return
   * so the caller can read the flag without needing pointer semantics.
   */
  calculatePreImageFromMemoryPressureData(): { result: number; changed: boolean } {
    if (this.queue === null) {
      // Guard: matches the raw class's implicit assumption that queue is
      // non-null after construction — the ctor always installs it, and only
      // destroy() nulls it out. Reaching here means someone called after
      // destroy, which the raw code would crash on inside dispatch_assert_queue.
      throw new Error("FFPlaybackMemoryMonitor::calculatePreImageFromMemoryPressureData called after destroy — raise");
    }
    // @0xda5ab4: dispatch_assert_queue$V2(self.queue) — must run on the queue.
    dispatchAssertQueue(this.queue);

    // @0xda5ab9..0xda5ada: inlined getMaxSizeForState(priorState) → priorMax.
    const priorMax = FFPlaybackMemoryMonitor.getMaxSizeForState(this.priorState);
    // @0xda5aeb..0xda5b06: inlined getMaxSizeForState(currentState) → currentMax.
    let currentMax = FFPlaybackMemoryMonitor.getMaxSizeForState(this.currentState);

    // @0xda5b07..0xda5b28: if currentMax > priorMax, apply elapsed-time bump.
    // (The asm uses jbe = unsigned-below-or-equal; all our values here are in
    //  {6, 8, 14} so the unsigned/signed distinction is irrelevant.)
    if (currentMax > priorMax) {
      // @0xda5b0c callq _FFGetHostTimeSeconds
      const now = ffGetHostTimeSeconds();
      // @0xda5b11 subsd  xmm0, [rbx+0x18]           ; xmm0 = now - currentTs
      // @0xda5b16 divsd  xmm0, [rip+0x7c9e82]       ; xmm0 /= 15.0
      // @0xda5b1e cvttsd2si xmm0, eax               ; C-style truncation to i32
      const elapsedSteps = Math.trunc((now - this.currentTs) / 15.0) | 0;
      // @0xda5b22 add eax → r12d (which held priorMax); @0xda5b25..0xda5b28
      // then does `if (r12d < r15d) r15d = r12d;` — i.e. clamp currentMax down
      // to (priorMax + elapsedSteps) whenever that is smaller than currentMax.
      const clamped = (priorMax + elapsedSteps) | 0;
      if (clamped < currentMax) {
        currentMax = clamped;
      }
    }

    // @0xda5b2c..0xda5b3a: publish and detect change vs cachedPreImage (+0x30).
    let changed = false;
    if (currentMax !== this.cachedPreImage) {
      changed = true;
      this.cachedPreImage = currentMax;
    }
    // @0xda5b3a: return the (possibly clamped) currentMax as i32.
    return { result: currentMax | 0, changed };
  }

  /**
   * FFPlaybackMemoryMonitor::adjustPreImageForMemoryPressure(int requested)
   * @Flexo 0xda5b50..0xda5c27 (with its block_invoke @0xda5c30..0xda5cf2).
   *
   * Sequence:
   *   ; Stack-allocate two __block_byref-style slots:
   *   ;   slot A (16 bytes at [rbp-0x60..-0x50]): captures "int computed" — the
   *   ;     result of getMaxSizeForState reasoning inside the block; laid out
   *   ;     as {forwarding_ptr, flags=0x2020000000, value:i32 @ +0x18}.
   *   ;   slot B (16 bytes at [rbp-0x40..-0x30]): captures "bool changed";
   *   ;     value byte at +0x18.
   *   ; Build a __block_literal that captures {slotA, slotB, self} and points
   *   ; invoke at ____ZN...adjustPreImageForMemoryPressureEi_block_invoke.
   *   dispatch_sync(self.queue, block)                          ; @0xda5be7
   *   ; Post-block: read out the computed value and clamp against `requested`:
   *   r12d = slotA.value        ; movl 0x18(rax), r12d          ; @0xda5bf0
   *   if (r14d(=requested) > r12d) r12d = r14d                  ; cmovl @0xda5bf7
   *   Block_object_dispose(slotB)                               ; @0xda5c03
   *   Block_object_dispose(slotA)                               ; @0xda5c10
   *   return r12d
   *
   * The block_invoke body (@0xda5c30..0xda5cf2) is an inlined copy of
   * calculatePreImageFromMemoryPressureData: it does the same
   * dispatch_assert_queue, the same two inlined getMaxSizeForState chains, the
   * same "elapsed since currentTs / 15.0" adjustment, the same cachedPreImage
   * update path (with `changed = true` written into slotB.value +0x18), and
   * finally writes its computed result into slotA.value +0x18 (via `mov r12d,
   * 0x18(%rax)` @0xda5ce0 through the slot's forwarding pointer +0x8).
   *
   * The IN-BLOCK write to slotB is done via `movb $1, 0x18(%r15)` @0xda5ccf
   * where r15 is the SLOT'S forwarding pointer (loaded @0xda5c49 from the
   * block's captured slotA's +0x8 — but the compiler reused r15 to point at
   * slotB's forwarding target; both slots have the same {ptr, flags, value}
   * layout so the +0x18 index reaches the byte-sized `changed` flag).
   *
   * Semantics: "compute the memory-pressure-limited pre-image count on the
   * dedicated queue, then return max(callerRequested, computed)." In other
   * words the caller can request AT LEAST N frames; memory pressure may raise
   * the effective count but never lower it below what the caller asked for.
   */
  adjustPreImageForMemoryPressure(requested: number): number {
    // @0xda5b52: r14d = requested (sign-extended movl — an i32 argument).
    const requestedI32 = requested | 0;
    if (this.queue === null) {
      throw new Error("FFPlaybackMemoryMonitor::adjustPreImageForMemoryPressure called after destroy — raise");
    }

    // We model the two __block_byref stack slots directly. In C ABI they are
    // 16-byte {forwarding_ptr, flags, value:i32/bool} triples that let the
    // block heap-copy the containing storage on capture — irrelevant in TS.
    // A shared { computed, changed } object is the direct TS mapping.
    const slot = { computed: 0 as number, changed: false as boolean };

    // Build the block. It captures `this` (@0xda5bd1: movq %rdi, -0x68(%rbp))
    // and the two byref slots (@0xda5bd5/0xda5bd9), then when invoked runs the
    // full inlined calculatePreImageFromMemoryPressureData body against `this`.
    const block = () => {
      // @0xda5c50: dispatch_assert_queue$V2(self.queue).
      dispatchAssertQueue(this.queue!);

      // @0xda5c55..0xda5c9f: two inlined getMaxSizeForState chains, exactly
      // as in calculatePreImage... — see that method's per-line asm citations.
      const priorMax = FFPlaybackMemoryMonitor.getMaxSizeForState(this.priorState);
      let currentMax = FFPlaybackMemoryMonitor.getMaxSizeForState(this.currentState);

      // @0xda5ca3..0xda5cc5: elapsed-seconds hysteresis when currentMax > priorMax.
      if (currentMax > priorMax) {
        const now = ffGetHostTimeSeconds();
        // @0xda5cad subsd xmm0, [r14+0x18]      ; now - currentTs
        // @0xda5cb3 divsd xmm0, [rip+0x7c9ce5]  ; /= 15.0  (same const @0x156f9a0)
        // @0xda5cbb cvttsd2si xmm0, eax
        const elapsedSteps = Math.trunc((now - this.currentTs) / 15.0) | 0;
        const clamped = (priorMax + elapsedSteps) | 0;
        if (clamped < currentMax) {
          currentMax = clamped;
        }
      }

      // @0xda5cc9..0xda5cd4: publish to cachedPreImage; set slotB.changed on diff.
      if (currentMax !== this.cachedPreImage) {
        slot.changed = true;
        this.cachedPreImage = currentMax;
      }

      // @0xda5cd8..0xda5ce0: write the computed value into slotA (via its
      // forwarding pointer +0x8, then +0x18 for the i32 slot).
      slot.computed = currentMax | 0;
    };

    // @0xda5be7: dispatch_sync(self.queue, block) — synchronously runs the
    // block on the tracker's serial queue so the state reads are consistent.
    dispatchSync(this.queue, block);

    // @0xda5bf0..0xda5bf7: result = slotA.computed; result = max(result, requested).
    let result = slot.computed | 0;
    if (requestedI32 > result) result = requestedI32;

    // @0xda5c03/@0xda5c10 _Block_object_dispose — no-op in TS.

    return result | 0;
  }
}
