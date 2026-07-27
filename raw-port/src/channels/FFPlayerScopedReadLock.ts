// FFPlayerScopedReadLock.ts — Flexo's FFPlayerScopedReadLock RAII helper
// that grabs a read-lock on an FFPlayer-side FFSharedLock, optionally
// enforces a 165ms (0xa5/1000s) timeout deadline computed against the
// host-time clock, and stores the resulting _FFModelLocker into
// (this+0x00) so the compiler-generated ~FFPlayerScopedReadLock() can
// release it on scope exit.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo.  This file
// ports the two ledger-listed ctor variants for FFPlayerScopedReadLock:
//   * C1 (complete-object) @Flexo 0x0da7e60 — trivial trampoline to C2.
//   * C2 (base-object)     @Flexo 0x0da7bf0 — the real body (~150 lines).
//
// See re/disasm/Flexo.FFPlayerScopedReadLock.FFPlayerScopedReadLock.s
// for the C1 trampoline and /tmp/ffpsrl_c2.s (regeneratable via
// `awk`/`otool -tV`) for the C2 body.
//
// STRUCT LAYOUT (recovered from the ctor writes at @0xda7c18 / @0xda7cac):
//   +0x000  locker : *_FFModelLocker    // owned pointer to a
//                                       // _FFModelLocker allocated with
//                                       // `operator new(0x18)` at
//                                       // @0xda7c92/0xda7c97 (24 bytes,
//                                       // matches _FFModelLocker's own
//                                       // layout). Initialised to null
//                                       // at @0xda7c18 before the ObjC
//                                       // pre-lock probe.
//
// FRONTIER — all callees, cited by @Flexo 0xADDR, throw when reached:
//   * `_FFModelLocker::_FFModelLocker(FFSharedLock*, FFModelLockAction)`
//                                       @Flexo 0xda7ca7 (direct callq;
//                                       resolved by nm as
//                                       __ZN14_FFModelLockerC1EP12FFSharedLock17FFModelLockAction).
//   * `operator new(unsigned long)`     @Flexo 0x1497452 stub (__Znwm).
//   * `operator delete(void*)`          @Flexo 0x1497404 stub (__ZdlPv,
//                                       reached only from the unwind
//                                       cleanup pad @0xda7e49).
//   * `_CMClockGetHostTimeClock`        @Flexo 0x1494fb0 stub — Apple.
//   * `_CMSyncGetTime`                  @Flexo 0x14950dc stub — Apple.
//   * `_CMTimeMake`                     @Flexo 0x1495136 stub — Apple.
//   * `_CMTimeAdd`                      @Flexo 0x14950fa stub — Apple.
//   * `_CMTimeCompare`                  @Flexo 0x149511e stub — Apple.
//   * `_CMTimeSubtract`                 @Flexo 0x14951ba stub — Apple.
//   * `_CMTimeGetSeconds`               @Flexo 0x1495130 stub — Apple.
//   * `_kCMTimeInvalid`                 @Flexo 0xda7c1f (RIP-rel data,
//                                       Apple-owned CoreMedia const).
//   * `___stack_chk_guard`              @Flexo 0xda7c0a (Apple runtime).
//   * `___stack_chk_fail`               @Flexo 0x14974f4 stub (Apple).
//   * `__Unwind_Resume`                 @Flexo 0x1495d30 stub (libunwind).
//   * ObjC msg-send `-[NSObject SEL_A]` @Flexo 0xda7c50 (indirect callq
//                                       via `%r12 = objc_msgSend` loaded
//                                       from @0xda7c46; selector loaded
//                                       from RIP-rel @0xda7c3f — the
//                                       Objective-C cfstring reference
//                                       is not decoded in this file).
//   * ObjC msg-send `-[NSObject SEL_B]` @Flexo 0xda7c60 (same msg-send
//                                       trampoline; selector @0xda7c56).
//   * ObjC msg-send `-[NSObject SEL_C]` @Flexo 0xda7e16 (indirect callq
//                                       through the objc_msgSend stub
//                                       loaded RIP-rel; selector loaded
//                                       from @0xda7e07 — the actual
//                                       ObjC method that reports the
//                                       timeout via `d = elapsedSeconds`
//                                       and BOOL arg1 = true).
//
// The timeout arm (@0xda7cb3..@0xda7e1c) computes:
//     deadline = start + CMTimeMake(0xa5, 0x3e8)             // 165/1000s
//     if (CMTimeCompare(now, deadline) > 0) {
//       seconds = CMTimeGetSeconds(now - start)
//       [player SEL_C:seconds :true]                          // report
//     }
// Every operand of that arm goes through Apple CoreMedia stubs, which
// are unported. We faithfully model the shape but call the stubs so a
// real invocation loudly throws rather than silently short-circuits.

// ── Frontier stubs — each cites its @Flexo 0xADDR ─────────────────────

/** `_FFModelLocker::_FFModelLocker(FFSharedLock*, FFModelLockAction)`
 *  @Flexo 0xda7ca7  (nm-resolved __ZN14_FFModelLockerC1EP12FFSharedLock17FFModelLockAction).
 *  Called with rdi = fresh 0x18-byte allocation, rsi = the SharedLock
 *  pointer returned by the first ObjC msg-send (SEL_A), rdx = 0 (i.e.
 *  the FFModelLockAction enum value 0 = "read-lock"). Not yet transcribed. */
function _FFModelLocker_C1(_self: unknown, _lock: unknown, _action: number): void {
  throw new Error("_FFModelLocker::_FFModelLocker @Flexo 0xda7ca7 not yet transcribed");
}

/** `operator new(unsigned long)` — imported __Znwm via stub @Flexo 0x1497452.
 *  Called at @0xda7c97 with edi = 0x18 to allocate a _FFModelLocker. Not yet transcribed. */
function operator_new(_bytes: number): unknown {
  throw new Error("operator new @Flexo 0x1497452 not yet transcribed");
}

/** `operator delete(void*)` — imported __ZdlPv via stub @Flexo 0x1497404.
 *  Only reachable on the C++ unwind cleanup pad @0xda7e49, not on the
 *  normal C2 path. Not yet transcribed. */
function operator_delete(_p: unknown): void {
  throw new Error("operator delete @Flexo 0x1497404 not yet transcribed");
}

/** Apple `_kCMTimeInvalid` — sentinel CMTime constant. Referenced as
 *  RIP-relative data at @Flexo 0xda7c1f and read field-by-field into
 *  the local `deadlineSample : CMTime` (8-byte value + 4-byte scale +
 *  4-byte flags + 8-byte epoch). Its layout is the standard CoreMedia
 *  one; its numeric contents are Apple-defined and not read here. */
function loadKCMTimeInvalid(): { value: bigint; timescale: number; flags: number; epoch: bigint } {
  throw new Error("_kCMTimeInvalid @Flexo 0xda7c1f (Apple CoreMedia const) not yet transcribed");
}

/** `_CMClockGetHostTimeClock` — Apple, stub @Flexo 0x1494fb0.
 *  Called at @0xda7c67 and @0xda7cb9 and @0xda7d91 with no argument;
 *  returns an opaque CMClockRef in rax. Not yet transcribed. */
function CMClockGetHostTimeClock(): unknown {
  throw new Error("_CMClockGetHostTimeClock @Flexo 0x1494fb0 (Apple) not yet transcribed");
}

/** `_CMSyncGetTime` — Apple, stub @Flexo 0x14950dc. Fills a CMTime
 *  at `rdi` from the given clock in `rsi`. Called at @0xda7c73,
 *  @0xda7cc5, @0xda7da0. Not yet transcribed. */
function CMSyncGetTime(_clock: unknown): { value: bigint; timescale: number; flags: number; epoch: bigint } {
  throw new Error("_CMSyncGetTime @Flexo 0x14950dc (Apple) not yet transcribed");
}

/** `_CMTimeMake` — Apple, stub @Flexo 0x1495136. Called at @0xda7cd8
 *  and @0xda7d76 with esi=0xa5 (=165) and edx=0x3e8 (=1000). Produces
 *  the 165ms timeout constant used as the read-lock deadline slack. */
function CMTimeMake(_value: number, _timescale: number): { value: bigint; timescale: number; flags: number; epoch: bigint } {
  throw new Error("_CMTimeMake @Flexo 0x1495136 (Apple) not yet transcribed");
}

/** `_CMTimeAdd` — Apple, stub @Flexo 0x14950fa. Called at @0xda7d2d
 *  computing `deadline = now + CMTimeMake(0xa5, 0x3e8)`. Not yet transcribed. */
function CMTimeAdd(_a: unknown, _b: unknown): { value: bigint; timescale: number; flags: number; epoch: bigint } {
  throw new Error("_CMTimeAdd @Flexo 0x14950fa (Apple) not yet transcribed");
}

/** `_CMTimeCompare` — Apple, stub @Flexo 0x149511e. Called at @0xda7d5b
 *  comparing `now` (from the second CMSyncGetTime at @0xda7c73) to the
 *  `deadline` computed by CMTimeAdd. Non-zero, positive => now > deadline
 *  => the pre-lock wait timed out => run the report arm. Not yet transcribed. */
function CMTimeCompare(_a: unknown, _b: unknown): number {
  throw new Error("_CMTimeCompare @Flexo 0x149511e (Apple) not yet transcribed");
}

/** `_CMTimeSubtract` — Apple, stub @Flexo 0x14951ba. Called at @0xda7dec
 *  computing `elapsed = now - start` for the timeout report. Not yet transcribed. */
function CMTimeSubtract(_a: unknown, _b: unknown): { value: bigint; timescale: number; flags: number; epoch: bigint } {
  throw new Error("_CMTimeSubtract @Flexo 0x14951ba (Apple) not yet transcribed");
}

/** `_CMTimeGetSeconds` — Apple, stub @Flexo 0x1495130. Called at @0xda7d8c
 *  (to get the deadline slack in seconds — that intermediate value's use
 *  is dead in this control flow) and at @0xda7e02 to convert `elapsed`
 *  to a double before the ObjC report call. Not yet transcribed. */
function CMTimeGetSeconds(_t: unknown): number {
  throw new Error("_CMTimeGetSeconds @Flexo 0x1495130 (Apple) not yet transcribed");
}

/** ObjC msg-send `-[NSObject<FFPlayerLockInteractions> SEL_A]` via the
 *  `_objc_msgSend` stub @Flexo 0xda7c46 (loaded RIP-rel into `%r12`),
 *  called at @Flexo 0xda7c50 with rdi=player, rsi=selector-A (loaded
 *  RIP-rel at @0xda7c3f). Returns the FFSharedLock* used later as the
 *  first argument of _FFModelLocker's ctor. Selector identity is not
 *  decoded in this file (would require reading the __objc_selrefs
 *  section entry at that RIP-relative address). */
function objcSelectorA_returnLock(_player: unknown): unknown {
  throw new Error("[player SEL_A] @Flexo 0xda7c50 (ObjC msg-send) not yet transcribed");
}

/** ObjC msg-send `-[NSObject<FFPlayerLockInteractions> SEL_B]` via the
 *  same trampoline, called at @Flexo 0xda7c60. Selector loaded RIP-rel
 *  at @0xda7c56. Returns a BOOL (tested by `testb %al,%al` @0xda7c63)
 *  that gates whether to sample the "start time" for the timeout arm.
 *  Selector identity is not decoded. */
function objcSelectorB_shouldSampleStart(_player: unknown): boolean {
  throw new Error("[player SEL_B] @Flexo 0xda7c60 (ObjC msg-send) not yet transcribed");
}

/** ObjC msg-send `-[NSObject<FFPlayerLockInteractions> SEL_C:elapsed :true]`
 *  via the same trampoline, called at @Flexo 0xda7e16 with rdi=player,
 *  rsi=selector-C (loaded RIP-rel at @0xda7e07), xmm0=elapsedSeconds,
 *  edx=1 (BOOL true). This is the "read-lock timed out; report it"
 *  callback into the player. Selector identity is not decoded. */
function objcSelectorC_reportTimeout(
  _player: unknown,
  _elapsedSeconds: number,
  _flag: boolean,
): void {
  throw new Error("[player SEL_C] @Flexo 0xda7e16 (ObjC msg-send) not yet transcribed");
}

// ── The class itself ──────────────────────────────────────────────────

/** FFPlayerScopedReadLock — Flexo's RAII wrapper that acquires a read
 *  lock on an FFPlayer's SharedLock, optionally reporting a 165ms
 *  timeout via an ObjC callback if the pre-lock wait took too long.
 *  Only the two ctor variants listed in the ledger are transcribed. */
export class FFPlayerScopedReadLock {
  /** (this+0x00) — owned pointer to the _FFModelLocker that actually
   *  holds the read lock for our lifetime. The two ctor variants set
   *  it; the (not-yet-transcribed) ~FFPlayerScopedReadLock releases it. */
  locker: unknown = null;

  /** FFPlayerScopedReadLock(player, contextTag, wantsTimeoutTracking) —
   *  C2 base-object ctor.
   *  Symbol __ZN22FFPlayerScopedReadLockC2EPU35objcproto24FFPlayerLockInteractions8NSObjectPKcb.
   *  @Flexo 0xda7bf0.
   *
   *  Args in the ABI:
   *    rdi = this                                      (self, +0x000)
   *    rsi = player  : NSObject<FFPlayerLockInteractions>*  (unowned)
   *    rdx = tag     : char const*                     (debug/context)
   *    ecx = flag    : bool  (wantsTimeoutTracking, spilled into r13)
   *
   *  Body (mirroring the asm one-for-one):
   *    @0xda7c18  this->locker = nullptr;
   *    @0xda7c1f  deadlineSample := _kCMTimeInvalid;      // load Apple const
   *    @0xda7c50  lock := [player SEL_A];                 // via objc_msgSend
   *    @0xda7c60  if ([player SEL_B]) {                   // objc_msgSend
   *    @0xda7c67    startClock := CMClockGetHostTimeClock();
   *    @0xda7c73    deadlineSample := CMSyncGetTime(startClock);
   *               }
   *    @0xda7c97  raw := operator new(0x18);
   *    @0xda7ca7  _FFModelLocker::_FFModelLocker(raw, lock, 0);
   *    @0xda7cac  this->locker = raw;
   *    @0xda7caf  if (flag & 1) {                        // wantsTimeoutTracking
   *    @0xda7cb9    nowClock  := CMClockGetHostTimeClock();
   *    @0xda7cc5    now       := CMSyncGetTime(nowClock);
   *    @0xda7cd8    slack     := CMTimeMake(0xa5, 0x3e8);
   *    @0xda7d2d    deadline  := CMTimeAdd(deadlineSample, slack);
   *    @0xda7d5b    if (CMTimeCompare(now, deadline) > 0) {
   *    @0xda7d76      slack2   := CMTimeMake(0xa5, 0x3e8);  // dead alias
   *    @0xda7d8c      (void)   CMTimeGetSeconds(slack2);
   *    @0xda7d91      now2Clock := CMClockGetHostTimeClock();
   *    @0xda7da0      now2      := CMSyncGetTime(now2Clock);
   *    @0xda7dec      elapsed   := CMTimeSubtract(now2, deadlineSample);
   *    @0xda7e02      d         := CMTimeGetSeconds(elapsed);
   *    @0xda7e16      [player SEL_C:d :true];
   *                 }
   *               }
   *    @0xda7c1c/@0xda7e1c  stack-canary check, standard return.
   *
   *  The `___stack_chk_fail` and `__Unwind_Resume` epilogues at
   *  @0xda7e3e and @0xda7e51/@0xda7e59 are compiler-emitted cleanup pads
   *  that trigger only under stack corruption or an in-flight C++
   *  exception; the unwind pad also frees the freshly-allocated
   *  _FFModelLocker via operator delete at @0xda7e49.
   *
   *  In this TS port we call each Apple / ObjC stub literally — none of
   *  them are implemented yet, so any real invocation of this ctor with
   *  the timeout branch active will loudly throw at the first stub
   *  boundary rather than silently no-op'ing. That is intentional
   *  frontier surfacing; do NOT swap in a substitute deadline math. */
  static C2(
    self: FFPlayerScopedReadLock,
    player: unknown,
    _tag: unknown,
    flag: boolean,
  ): void {
    // @0xda7c18 — this->locker = nullptr.
    self.locker = null;

    // @0xda7c1f..@0xda7c3b — load _kCMTimeInvalid field-by-field into
    // the local `deadlineSample`. We preserve that shape by calling
    // the loader stub. (The individual field-move offsets 0x08/0x0c/
    // 0x10 correspond to the CMTime.value/timescale/flags/epoch layout.)
    let deadlineSample = loadKCMTimeInvalid();

    // @0xda7c3f/@0xda7c46/@0xda7c50 — lock := [player SEL_A].
    const lock = objcSelectorA_returnLock(player);

    // @0xda7c56/@0xda7c60/@0xda7c63/@0xda7c65 — if ([player SEL_B]) ...
    if (objcSelectorB_shouldSampleStart(player)) {
      // @0xda7c67  startClock := CMClockGetHostTimeClock().
      const startClock = CMClockGetHostTimeClock();
      // @0xda7c70..@0xda7c73  deadlineSample := CMSyncGetTime(startClock).
      // The move-outs @0xda7c78..@0xda7c8e reload the same fields back
      // into `deadlineSample` — semantically an assignment.
      deadlineSample = CMSyncGetTime(startClock);
    }

    // @0xda7c92/@0xda7c97  raw := operator new(0x18)   (24 bytes).
    const raw = operator_new(0x18);
    // @0xda7ca7  _FFModelLocker::_FFModelLocker(raw, lock, 0).
    _FFModelLocker_C1(raw, lock, 0);
    // @0xda7cac  this->locker = raw.
    self.locker = raw;

    // @0xda7caf/@0xda7cb3 — if (flag & 1) i.e. wantsTimeoutTracking...
    if (flag) {
      // @0xda7cb9  nowClock := CMClockGetHostTimeClock().
      const nowClock = CMClockGetHostTimeClock();
      // @0xda7cc5  now := CMSyncGetTime(nowClock).
      const now = CMSyncGetTime(nowClock);
      // @0xda7cd8  slack := CMTimeMake(0xa5, 0x3e8)   // 165ms.
      const slack = CMTimeMake(0xa5, 0x3e8);
      // @0xda7d2d  deadline := CMTimeAdd(deadlineSample, slack).
      const deadline = CMTimeAdd(deadlineSample, slack);
      // @0xda7d5b/@0xda7d60/@0xda7d62 — if (CMTimeCompare(now, deadline) > 0) ...
      if (CMTimeCompare(now, deadline) > 0) {
        // @0xda7d76  (dead-alias) slack2 := CMTimeMake(0xa5, 0x3e8).
        const slack2 = CMTimeMake(0xa5, 0x3e8);
        // @0xda7d8c  CMTimeGetSeconds(slack2) — value dropped by compiler.
        void CMTimeGetSeconds(slack2);
        // @0xda7d91  now2Clock := CMClockGetHostTimeClock().
        const now2Clock = CMClockGetHostTimeClock();
        // @0xda7da0  now2 := CMSyncGetTime(now2Clock).
        const now2 = CMSyncGetTime(now2Clock);
        // @0xda7dec  elapsed := CMTimeSubtract(now2, deadlineSample).
        const elapsed = CMTimeSubtract(now2, deadlineSample);
        // @0xda7e02  d := CMTimeGetSeconds(elapsed).
        const d = CMTimeGetSeconds(elapsed);
        // @0xda7e07/@0xda7e0e/@0xda7e11/@0xda7e16 —
        //   [player SEL_C:d :true]  (edx = 1, i.e. BOOL true).
        objcSelectorC_reportTimeout(player, d, true);
      }
    }
    // @0xda7c1c/@0xda7e1c..@0xda7e3d — stack-canary check + epilogue.
    // The canary path is a runtime safety hook that we cannot model
    // meaningfully in TS; the unwind pad @0xda7e43..@0xda7e59 fires
    // only when a C++ exception unwinds through here, freeing `raw`
    // via `operator delete` and re-raising via __Unwind_Resume. Both
    // are compiler-emitted and out of scope for this port.
    // (Referencing the pads keeps _tag/raw live for provenance.)
    void _tag;
    void raw;
  }

  /** FFPlayerScopedReadLock(player, tag, flag) — C1 complete-object
   *  ctor.  Symbol __ZN22FFPlayerScopedReadLockC1EPU35objcproto24FFPlayerLockInteractions8NSObjectPKcb.
   *  @Flexo 0xda7e60. Body is a trivial trampoline:
   *      @0xda7e60  pushq %rbp
   *      @0xda7e61  movq  %rsp, %rbp
   *      @0xda7e64  popq  %rbp
   *      @0xda7e65  jmp   __ZN...C2E...           ; tail-call C2
   *  We mirror that by delegating to C2. */
  static C1(
    self: FFPlayerScopedReadLock,
    player: unknown,
    tag: unknown,
    flag: boolean,
  ): void {
    // @0xda7e65 — tail-jmp to C2 with the same arguments.
    FFPlayerScopedReadLock.C2(self, player, tag, flag);
  }
}
