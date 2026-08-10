// OZAudioMixer.ts — Ozone audio-mixer state queries + mixer-lifecycle init.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// This ledger unit ports THREE ledger entries in one class file (per porting
// spec Rule 6, one class per file):
//
//   * OZAudioMixer::isScrubbing()  @Ozone 0x21c640   pure state query
//   * OZAudioMixer::initMixer()    @Ozone 0x2182d0   mixer-lifecycle init
//   * OZAudioMixer::isPlaying()    @Ozone 0x21bc20   pure state query
//   * OZAudioMixer::isScrubbing()      @Ozone 0x21c640   pure state query
//   * OZAudioMixer::initMixer()        @Ozone 0x2182d0   mixer-lifecycle init
//   * OZAudioMixer::postTrackPanRamp(STTrack*, int, double, double)
//                                      @Ozone 0x21b020   pan-ramp poster
//
// Every callee is a boundary extern in the ST* audio-transport family
// (STMixer* / STTransport* / NewSTTransport*NotifierUPP) — Apple/host audio
// subsystem, not part of the 5-framework FCP port. Same policy applied to
// every other ST*/Sound-Transport callee in this port: raise at the
// boundary rather than paper over.
//
// The disasm of `initMixer` references two file-local static callback
// functions via `leaq` (their ADDRESSES are handed to the ST notifier UPP
// factory) but never CALLs them directly:
//   * `__ZL16stopNotifierProcPv`      (stopNotifierProc, file-local)
//   * `__ZL20overloadNotifierProcPv`  (overloadNotifierProc, file-local)
// These are notifier callbacks the ST transport invokes later; the mixer
// simply hands their addresses to `NewSTTransport{Stopped,Overload}NotifierUPP`
// as opaque function pointers. We mirror that here with opaque
// "fptr-handle" sentinels — no in-scope call happens through them from
// this method, so no dependency violation.
//
// -----------------------------------------------------------------------------
// SHAPE — recovered from these two disasms only
// -----------------------------------------------------------------------------
//   OZAudioMixer (this):
//     +0x10   STMixer* handle                (opaque ST audio pointer;
//                                             out-param of STMixerCreate;
//                                             also `rax = this + 0x10` in
//                                             initMixer, and the read
//                                             target of `movq 0x10(%rdi),%rdi`
//                                             in isScrubbing.)
//     +0x48   NewSTTransportStoppedNotifierUPP handle (opaque fptr wrapper
//                                             stored so we can add-and-
//                                             re-add on retries without
//                                             leaking).
//     +0x58   NewSTTransportOverloadNotifierUPP handle (opaque fptr wrapper).
//     +0xdc   `startedPlayback` bool         (isScrubbing gates on it:
//                                             cmpb $0x1, 0xdc(%rdi) — if
//                                             not 1, return 0 immediately.)
//     +0x130  channel count (int32)          (STMixerSetMixFormat arg 2)
//     +0x140  sample rate (Float64)          (STMixerSetMixFormat arg 3)
//     +0x159  "enable stop/overload notifiers" bool (cmpb $0x1, 0x159(%rbx)
//                                             gates both notifier-install
//                                             passes in initMixer.)
//
// Every offset above is cited at the disasm line that reads/writes it.
//
// -----------------------------------------------------------------------------
// FULL DISASM — isScrubbing
//   (raw-port/re/disasm/__ZN12OZAudioMixer11isScrubbingEv.s)
// -----------------------------------------------------------------------------
//   __ZN12OZAudioMixer11isScrubbingEv:
//     0x21c640  cmpb    $0x1, 0xdc(%rdi)                     ; gate: this->flag_at_0xdc == 1 ?
//     0x21c647  jne     0x21c66e                             ;   no  -> return 0
//     0x21c649  pushq   %rbp                                 ; yes -> full check
//     0x21c64a  movq    %rsp, %rbp
//     0x21c64d  subq    $0x10, %rsp
//     0x21c651  movb    $0x0, -0x1(%rbp)                     ; stack bool out = false
//     0x21c655  movq    0x10(%rdi), %rdi                     ; rdi = this->STMixer_at_0x10
//     0x21c659  leaq    -0x10(%rbp), %rsi                    ; rsi = &STTransport out-slot
//     0x21c65d  callq   _STMixerGetTransport                 ; @stub 0x6dcf84
//     0x21c662  testl   %eax, %eax                           ; err ?
//     0x21c664  je      0x21c671                             ;   ok -> transport-is-playing path
//     0x21c666  xorl    %eax, %eax                           ; err  -> return 0
//     0x21c668  addq    $0x10, %rsp
//     0x21c66c  popq    %rbp
//     0x21c66d  retq
//     0x21c66e  xorl    %eax, %eax                           ; gate-fail: return 0
//     0x21c670  retq
//     0x21c671  movq    -0x10(%rbp), %rdi                    ; rdi = transport handle
//     0x21c675  leaq    -0x1(%rbp), %rsi                     ; rsi = &out-bool
//     0x21c679  callq   _STTransportIsPlaying                ; @stub 0x6dd01a
//     0x21c67e  testl   %eax, %eax                           ; err ?
//     0x21c680  sete    %cl                                  ; cl = (err == 0)
//     0x21c683  cmpb    $0x0, -0x1(%rbp)                     ; out-bool != 0 ?
//     0x21c687  setne   %al                                  ; al = (out-bool != 0)
//     0x21c68a  andb    %cl, %al                             ; al = err==0 && out!=0
//     0x21c68c  addq    $0x10, %rsp
//     0x21c690  popq    %rbp
//     0x21c691  retq
//
// -----------------------------------------------------------------------------
// FULL DISASM — initMixer
//   (raw-port/re/disasm/__ZN12OZAudioMixer9initMixerEv.s)
// -----------------------------------------------------------------------------
//   __ZN12OZAudioMixer9initMixerEv:
//     0x2182d0  pushq   %rbp
//     0x2182d1  movq    %rsp, %rbp
//     0x2182d4  pushq   %r15
//     0x2182d6  pushq   %r14
//     0x2182d8  pushq   %rbx
//     0x2182d9  pushq   %rax
//     0x2182da  movq    %rdi, %rbx                           ; rbx = this
//     0x2182dd  leaq    0x10(%rdi), %r15                     ; r15 = &this->STMixer_at_0x10
//     0x2182e1  movl    $0x5, %edi                           ; STMixerCreate arg 0 = 5
//     0x2182e6  movq    %r15, %rsi                           ; arg 1 = &STMixer out
//     0x2182e9  callq   _STMixerCreate                       ; @stub 0x6dcf36
//     0x2182ee  testl   %eax, %eax
//     0x2182f0  jne     0x21830d                             ; err -> return 0
//     0x2182f2  movq    0x10(%rbx), %rdi                     ; rdi = this->STMixer_at_0x10
//     0x2182f6  movl    0x130(%rbx), %esi                    ; esi = this->channels_at_0x130
//     0x2182fc  movsd   0x140(%rbx), %xmm0                   ; xmm0 = this->sampleRate_at_0x140
//     0x218304  callq   _STMixerSetMixFormat                 ; @stub 0x6dcfa2
//     0x218309  testl   %eax, %eax
//     0x21830b  je      0x21831e                             ; ok -> installNotifiers path
//     0x21830d  xorl    %r14d, %r14d                         ; err path: return-value = false
//     0x218310  movl    %r14d, %eax                          ; eax = r14d (return)
//     0x218313  addq    $0x8, %rsp
//     0x218317  popq    %rbx
//     0x218318  popq    %r14
//     0x21831a  popq    %r15
//     0x21831c  popq    %rbp
//     0x21831d  retq
//     ; --- success path: install stop-notifier if enabled -----------------
//     0x21831e  movb    $0x1, %r14b                          ; return-value = true (persists to ret)
//     0x218321  cmpb    $0x1, 0x159(%rbx)                    ; this->notifiersEnabled_at_0x159 == 1 ?
//     0x218328  jne     0x218310                             ;   no  -> return true
//     0x21832a  movq    (%r15), %rdi                         ; rdi = this->STMixer_at_0x10 (non-null?)
//     0x21832d  testq   %rdi, %rdi
//     0x218330  je      0x218310                             ;   null -> return true
//     0x218332  leaq    -0x20(%rbp), %rsi                    ; rsi = &STTransport out
//     0x218336  callq   _STMixerGetTransport                 ; @stub 0x6dcf84
//     0x21833b  testl   %eax, %eax
//     0x21833d  jne     0x218367                             ;   err -> skip stop-notifier
//     0x21833f  movq    0x48(%rbx), %rsi                     ; rsi = this->stopNotifierUPP_at_0x48
//     0x218343  testq   %rsi, %rsi
//     0x218346  jne     0x21835b                             ;   already installed? -> reuse
//     0x218348  leaq    __ZL16stopNotifierProcPv(%rip), %rdi ; rdi = &stopNotifierProc  (local)
//     0x21834f  callq   _NewSTTransportStoppedNotifierUPP    ; @stub 0x6dce22
//     0x218354  movq    %rax, %rsi                           ; rsi = new UPP handle
//     0x218357  movq    %rax, 0x48(%rbx)                     ; cache: this[0x48] = UPP
//     0x21835b  movq    -0x20(%rbp), %rdi                    ; rdi = transport
//     0x21835f  movq    %rbx, %rdx                           ; rdx = this (client refCon)
//     0x218362  callq   _STTransportAddStopNotifier          ; @stub 0x6dd00e
//     ; --- install overload-notifier if still enabled + still ok ----------
//     0x218367  movq    (%r15), %rdi                         ; rdi = this->STMixer_at_0x10
//     0x21836a  testq   %rdi, %rdi
//     0x21836d  je      0x218310                             ;   null -> return true
//     0x21836f  cmpb    $0x1, 0x159(%rbx)                    ; still enabled?
//     0x218376  jne     0x218310
//     0x218378  leaq    -0x20(%rbp), %rsi                    ; rsi = &STTransport out
//     0x21837c  callq   _STMixerGetTransport                 ; @stub 0x6dcf84
//     0x218381  testl   %eax, %eax
//     0x218383  jne     0x218310                             ;   err -> return true
//     0x218385  movq    0x58(%rbx), %rsi                     ; rsi = this->overloadNotifierUPP_at_0x58
//     0x218389  testq   %rsi, %rsi
//     0x21838c  jne     0x2183a1                             ;   already installed? -> reuse
//     0x21838e  leaq    __ZL20overloadNotifierProcPv(%rip), %rdi ; rdi = &overloadNotifierProc
//     0x218395  callq   _NewSTTransportOverloadNotifierUPP   ; @stub 0x6dce1c
//     0x21839a  movq    %rax, %rsi                           ; rsi = new UPP handle
//     0x21839d  movq    %rax, 0x58(%rbx)                     ; cache: this[0x58] = UPP
//     0x2183a1  movq    -0x20(%rbp), %rdi                    ; rdi = transport
//     0x2183a5  movq    %rbx, %rdx                           ; rdx = this
//     0x2183a8  callq   _STTransportAddOverloadNotifier      ; @stub 0x6dd008
//     0x2183ad  jmp     0x218310                             ; return true
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _STMixerGetTransport                 @Ozone 0x6dcf84 (called
//                                          @0x21c65d, @0x218336, @0x21837c)
//   * _STTransportIsPlaying                @Ozone 0x6dd01a (called @0x21c679)
//   * _STMixerCreate                       @Ozone 0x6dcf36 (called @0x2182e9)
//   * _STMixerSetMixFormat                 @Ozone 0x6dcfa2 (called @0x218304)
//   * _NewSTTransportStoppedNotifierUPP    @Ozone 0x6dce22 (called @0x21834f)
//   * _STTransportAddStopNotifier          @Ozone 0x6dd00e (called @0x218362)
//   * _NewSTTransportOverloadNotifierUPP   @Ozone 0x6dce1c (called @0x218395)
//   * _STTransportAddOverloadNotifier      @Ozone 0x6dd008 (called @0x2183a8)
//
// All eight are the ST* Sound-Transport C API (Apple host-audio subsystem)
// referenced through `## symbol stub for: _ST...` — outside the 5-framework
// port scope, same policy as CGColorSpace/AVFoundation/CoreMedia externs
// already modelled as boundary throws in raw-port/src/infra/CMTime.ts and
// PCColorSpaceHandle.ts.
//
// Local statics referenced by ADDRESS ONLY (not called):
//   * __ZL16stopNotifierProcPv     (leaq @0x218348) — stopNotifierProc(void*)
//   * __ZL20overloadNotifierProcPv (leaq @0x21838e) — overloadNotifierProc(void*)
// These are file-local (Itanium `L` linkage) callback functions handed to
// ST-notifier UPP factories; they are invoked later by the ST transport
// on its own thread, never by this ledger unit. We model them as opaque
// function-pointer sentinels — no in-scope call happens through them from
// this file, so no ledger dependency.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN12OZAudioMixer11isScrubbingEv   OZAudioMixer::isScrubbing()  @0x21c640
//   * __ZN12OZAudioMixer9initMixerEv      OZAudioMixer::initMixer()    @0x2182d0
//   * __ZN12OZAudioMixer9isPlayingEv      OZAudioMixer::isPlaying()    @0x21bc20
//   * __ZN12OZAudioMixer4stopEbb          OZAudioMixer::stop(bool,bool) @0x21c150
//   * __ZN12OZAudioMixer16postTrackPanRampEP7STTrackidd
//                                         OZAudioMixer::postTrackPanRamp(
//                                           STTrack*, int, double, double) @0x21b020

/** Opaque STMixer* handle (Apple ST audio-transport subsystem). Not
 *  modelled — ST is out-of-scope, same policy as pthread/CoreMedia
 *  externs in this port. */
export type STMixerHandle = object;

/** Opaque STTransport* handle (sub-object hung off STMixer). */
export type STTransportHandle = object;

/** Opaque UPP (Universal Procedure Pointer) handle returned by
 *  `NewSTTransport*NotifierUPP` factories. */
export type STNotifierUPP = object;

/** Opaque STTrack* handle (Apple ST audio-transport track). First arg of
 *  postTrackPanRamp; the disasm never dereferences it in-scope, only
 *  passes it to ST APIs. */
export type STTrackHandle = object;

/** Opaque STModule* handle (Apple ST audio-transport module — the sub-
 *  object returned by _STTrackGetPanModule and consumed by
 *  _STModuleGetIndexedParameter). */
export type STModuleHandle = object;

/** Opaque STParameter* handle (Apple ST audio-transport parameter — the
 *  out-param of _STModuleGetIndexedParameter and first arg of
 *  _STParameterPostComplexRamp). */
export type STParameterHandle = object;

/** Opaque UPP handle returned by _NewSTValueSupplierUPP — wraps a
 *  `SupplyTrackPanRampValues`-style callback into an ST value-supplier
 *  function-pointer. */
export type STValueSupplierUPP = object;

/**
 * File-scope static held inside postTrackPanRamp — a lazily-cached
 * `STValueSupplierUPP` wrapping `SupplyTrackPanRampValues`. Cached
 * because `_NewSTValueSupplierUPP` allocation is expensive; every
 * invocation of `postTrackPanRamp` reuses this UPP across all tracks.
 *
 * BSS symbol: `__ZZN12OZAudioMixer16postTrackPanRampEP7STTrackiddE16trackPanSupplier`
 * (Itanium mangling for a static local variable inside the method).
 * Read/written @Ozone 0x21b056/0x21b06c/0x21b08a/0x21b0d3.
 *
 * Initial state = null (BSS zero-fill). The one-time allocation gate at
 * @0x21b056 (`cmpq $0x0, ...`) mirrors the C++ `static` init pattern:
 * install-once, reuse thereafter.
 */
let trackPanSupplier: STValueSupplierUPP | null = null;

/**
 * `OZAudioMixer` — instance shape decoded from the two ported methods only.
 * Additional fields (channel pans, output-bus vectors, level observers, …)
 * are exercised by sibling methods (`postTrackPanRamp`, `stop`, etc.) not
 * in this ledger unit; they are not modelled here.
 */
export class OZAudioMixer {
  /** (this+0x10) — the underlying ST audio mixer, allocated by
   *  `STMixerCreate` in initMixer @0x2182e9 and consumed as `this->mixer`
   *  by isScrubbing @0x21c655 and every subsequent initMixer read
   *  (@0x2182f2, @0x21832a, @0x218367). Null before init. */
  STMixer_at_0x10: STMixerHandle | null = null;

  /** (this+0x48) — cached UPP for the "transport stopped" notifier, so we
   *  don't re-allocate a new UPP each time initMixer is called (see
   *  the null-check + install-once pattern at @0x218343..@0x218357). */
  stopNotifierUPP_at_0x48: STNotifierUPP | null = null;

  /** (this+0x58) — cached UPP for the "transport overload" notifier
   *  (mirror of stopNotifierUPP_at_0x48, same install-once pattern at
   *  @0x218389..@0x21839d). */
  overloadNotifierUPP_at_0x58: STNotifierUPP | null = null;

  /** (this+0x68) — pointer to an array of `STParameter*` (opaque
   *  per-channel-index parameter handles). Read @Ozone 0x21b094 as
   *  `movq 0x68(%r14), %rcx` then indexed by the `channelIndex` int arg:
   *  `movq (%rcx,%rax,8), %rdx` — 8-byte-per-slot array. The stored
   *  handle in slot [channelIndex] is passed as the 3rd arg to
   *  `_STParameterPostComplexRamp` (context/refCon for the ramp).
   *  Layout: `STParameter* [channelCount]` (element size = 8 bytes;
   *  scale factor `,rax,8` implies pointer-sized entries). Populated by
   *  a separate mixer-init step (not by isScrubbing/initMixer/
   *  postTrackPanRamp — its writer is out of scope here). */
  channelParams_at_0x68: (STParameterHandle | null)[] | null = null;

  /** (this+0xdc) — "startedPlayback" gate byte. isScrubbing's very first
   *  instruction @0x21c640 is `cmpb $0x1, 0xdc(%rdi)`; failing that
   *  compare short-circuits the whole method to return 0. */
  startedPlayback_at_0xdc = false;

  /** (this+0x130) — channel count (int32). Second argument to
   *  `STMixerSetMixFormat` (@0x218304). */
  channels_at_0x130 = 0;

  /** (this+0x140) — sample rate (Float64, double). Third argument to
   *  `STMixerSetMixFormat` (@0x218304). */
  sampleRate_at_0x140 = 0.0;

  /** (this+0x159) — "install notifiers" bool. Both notifier-install
   *  passes in initMixer gate on `cmpb $0x1, 0x159(%rbx)` (@0x218321,
   *  @0x21836f). */
  notifiersEnabled_at_0x159 = false;

  /** (this+0x50) — an STScheduledCallbackUPP handle (opaque). Disposed by
   *  `stop()` @0x21c1fc via `_DisposeSTScheduledCallbackUPP` and then
   *  nulled (@0x21c201). Null when no scheduled callback is installed. */
  scheduledCallbackUPP_at_0x50: STNotifierUPP | null = null;

  /** (this+0x88) — a __CFRunLoopTimer* (opaque CoreFoundation handle).
   *  `stop()` @0x21c184..0x21c1a1 invalidates it (`_CFRunLoopTimerInvalidate`),
   *  releases it (`_CFRelease`), then nulls the slot when non-null. Null
   *  when no timer is installed. */
  runLoopTimer_at_0x88: object | null = null;

  /** (this+0x90) — a second __CFRunLoopTimer* (opaque). Same invalidate+
   *  release+null treatment by `stop()` @0x21c1ac..0x21c1c9 as the +0x88
   *  timer. Null when unset. */
  runLoopTimer_at_0x90: object | null = null;

  /** (this+0xa1) — a one-byte flag set to 1 by `stop()` @0x21c17d
   *  (`movb $0x1, 0xa1(%rbx)`) ONLY when the first bool argument (`a`) is
   *  non-zero. 1-byte store => bool/uint8; preserved as `number` (0..255).
   *  Reader lives elsewhere. */
  flagByte_at_0xa1 = 0;

  /** (this+0xd4) — a one-byte flag written UNCONDITIONALLY at the top of
   *  `stop()` @0x21c161 (`movb %dl, 0xd4(%rdi)`) from the SECOND bool
   *  argument (`b`, in %dl). 1-byte store => bool/uint8; preserved as
   *  `number` (0..255). Reader lives elsewhere. */
  flagByte_at_0xd4 = 0;

  // ═════════════════════════════════════════════════════════════════════════
  // OZAudioMixer::isScrubbing()
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZAudioMixer11isScrubbingEv.s
  // (Full disasm quoted in the file-header comment above.)
  //
  // FRONTIER CALLEES: _STMixerGetTransport, _STTransportIsPlaying
  //                   (both TRUE out-of-scope ST audio externs).
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZAudioMixer::isScrubbing()` — @Ozone 0x21c640
   * (__ZN12OZAudioMixer11isScrubbingEv).
   *
   * Returns `true` iff (a) `this->startedPlayback_at_0xdc` is 1, AND
   * (b) `STMixerGetTransport(this->mixer, &transport) == 0`, AND
   * (c) `STTransportIsPlaying(transport, &out) == 0`, AND
   * (d) the out-bool is non-zero. Any earlier failure returns false.
   *
   * Both ST calls are TRUE out-of-scope externs (Apple ST audio API —
   * outside the 5-framework port scope, same policy as pthread/CoreMedia
   * externs). We faithfully transcribe the branch structure and raise at
   * the first boundary call rather than paper over it.
   */
  isScrubbing(): boolean {
    // ------------------------------------------------------------
    // @0x21c640  cmpb $0x1, 0xdc(%rdi) ; @0x21c647 jne 0x21c66e
    //   AT&T `cmpb $0x1, mem` computes `mem - 1`; jne iff mem != 1.
    //   The disasm exits at 0x21c66e (`xorl %eax,%eax ; retq`) when
    //   the flag is not exactly 1.  We mirror that as an early-return
    //   false path.
    // ------------------------------------------------------------
    if (!this.startedPlayback_at_0xdc) {
      // @0x21c66e xorl %eax, %eax ; @0x21c670 retq  -> return 0
      return false;
    }
    // NOTE the disasm gates specifically on `cmpb $0x1` — it accepts
    // exactly the byte 1, not "any truthy". We use a strict boolean
    // check here; the caller of setter mirrors the machine byte.

    // ------------------------------------------------------------
    // @0x21c649..0x21c651  frame + stack-out-bool init.
    // @0x21c655  movq 0x10(%rdi), %rdi        : rdi = this->STMixer_at_0x10
    // @0x21c659  leaq -0x10(%rbp), %rsi       : rsi = &transport_out
    // @0x21c65d  callq _STMixerGetTransport   : ST audio boundary extern.
    //
    // ST* is Apple's Sound-Transport C API — same out-of-scope status
    // as CoreMedia/pthread externs already modelled as boundary throws
    // (see PCMutex.ts, CMTime.ts).  We RAISE, not paper-over.
    // ------------------------------------------------------------
    // Materialise the read of `this->STMixer_at_0x10` so it is observably
    // referenced in the port (matches the disasm's `movq 0x10(%rdi), %rdi`).
    void this.STMixer_at_0x10;
    // @0x21c65d _STMixerGetTransport — TRUE out-of-scope extern.
    throw new Error(
      "OZAudioMixer::isScrubbing() requires _STMixerGetTransport on " +
        "this->STMixer_at_0x10 @Ozone 0x21c65d (ST audio-transport stub " +
        "@0x6dcf84) — ST* is not modelled in TS (Apple Sound-Transport API, " +
        "same boundary policy as CoreMedia/pthread externs). After a " +
        "successful STMixerGetTransport the disasm calls _STTransportIsPlaying " +
        "@0x21c679 (stub @0x6dd01a) and ANDs err==0 with the out-bool. " +
        "@0x21c640",
    );

    // Unreachable — kept as documentation of the disasm's post-throw
    // structure so a future porter can wire the boundary if ST ever
    // enters scope:
    //   @0x21c662 testl %eax, %eax ; @0x21c664 je 0x21c671   : err ? no -> continue
    //   @0x21c666 xorl %eax, %eax  ; @0x21c66c retq          : err -> return false
    //   @0x21c671..@0x21c691:
    //     movq -0x10(%rbp), %rdi        : rdi = transport
    //     leaq -0x1(%rbp), %rsi         : rsi = &out_bool
    //     callq _STTransportIsPlaying   : @stub 0x6dd01a  (out-of-scope)
    //     testl %eax, %eax ; sete %cl   : cl = (err == 0)
    //     cmpb $0x0, -0x1(%rbp) ; setne %al : al = (out_bool != 0)
    //     andb %cl, %al                 : return err==0 && out_bool!=0
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZAudioMixer::initMixer()
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZAudioMixer9initMixerEv.s
  // (Full disasm quoted in the file-header comment above.)
  //
  // FRONTIER CALLEES (all TRUE out-of-scope ST audio externs):
  //   * _STMixerCreate                     (@0x2182e9,  stub 0x6dcf36)
  //   * _STMixerSetMixFormat               (@0x218304,  stub 0x6dcfa2)
  //   * _STMixerGetTransport               (@0x218336,@0x21837c,  stub 0x6dcf84)
  //   * _NewSTTransportStoppedNotifierUPP  (@0x21834f,  stub 0x6dce22)
  //   * _STTransportAddStopNotifier        (@0x218362,  stub 0x6dd00e)
  //   * _NewSTTransportOverloadNotifierUPP (@0x218395,  stub 0x6dce1c)
  //   * _STTransportAddOverloadNotifier    (@0x2183a8,  stub 0x6dd008)
  //
  // Local statics referenced by ADDRESS only:
  //   * __ZL16stopNotifierProcPv      (leaq @0x218348 — passed to NewST…UPP)
  //   * __ZL20overloadNotifierProcPv  (leaq @0x21838e — passed to NewST…UPP)
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZAudioMixer::initMixer()` — @Ozone 0x2182d0
   * (__ZN12OZAudioMixer9initMixerEv).
   *
   * Faithful transcription of the disasm above.  Sequence:
   *   1. `STMixerCreate(5, &this->STMixer_at_0x10)` — err aborts (return
   *       false).
   *   2. `STMixerSetMixFormat(this->STMixer, this->channels, this->sampleRate)`
   *       — err aborts.
   *   3. If `this->notifiersEnabled_at_0x159 == 1` and the mixer pointer
   *       is non-null and `STMixerGetTransport` succeeds:
   *         * Lazily allocate `stopNotifierUPP_at_0x48` (via
   *           `NewSTTransportStoppedNotifierUPP(&stopNotifierProc)`) if
   *           not yet cached.
   *         * `STTransportAddStopNotifier(transport, UPP, this)`.
   *   4. Same pattern for the overload notifier via
   *      `overloadNotifierUPP_at_0x58` +
   *      `NewSTTransportOverloadNotifierUPP(&overloadNotifierProc)` +
   *      `STTransportAddOverloadNotifier`.
   *   5. Return `true` iff steps 1+2 succeeded (r14b was set to 1 at
   *      @0x21831e and persists to the ret).
   *
   * Every callee is a TRUE out-of-scope ST audio extern (Apple ST API,
   * not part of the 5-framework port), so we raise at the first boundary
   * call rather than paper over.
   */
  initMixer(): boolean {
    // ------------------------------------------------------------
    // @0x2182dd leaq 0x10(%rdi), %r15   : r15 = &this->STMixer_at_0x10
    //                                    (the sret slot for STMixerCreate).
    // @0x2182e1 movl $0x5, %edi         : STMixerCreate arg 0 = 5
    //                                    (const @0x2182e1 — magic
    //                                    channel-config code understood
    //                                    by the ST subsystem; opaque to us).
    // @0x2182e6 movq %r15, %rsi         : arg 1 = out slot
    // @0x2182e9 callq _STMixerCreate    : ST audio boundary extern.
    //
    // ST* is Apple's Sound-Transport C API — TRUE out-of-scope extern.
    // Same policy as every ST* / pthread / CoreMedia callee in this port.
    // ------------------------------------------------------------
    // Materialise the writes/reads the disasm performs before the extern
    // (so a future porter wiring ST can see what state is being handed
    //  across the boundary):
    void this.STMixer_at_0x10;
    // @const 0x2182e1  STMixerCreate arg 0 = 5 (opaque ST channel-config code)
    const _stMixerCreateArg0 = 0x5;
    void _stMixerCreateArg0;

    // @0x2182e9 _STMixerCreate — TRUE out-of-scope extern.
    throw new Error(
      "OZAudioMixer::initMixer() requires _STMixerCreate(5, &this->STMixer_at_0x10) " +
        "@Ozone 0x2182e9 (ST audio stub @0x6dcf36) — ST* is not modelled in TS. " +
        "On success, disasm continues with _STMixerSetMixFormat @0x218304 " +
        "(stub 0x6dcfa2, args: this->STMixer, channels_at_0x130, sampleRate_at_0x140), " +
        "then optionally installs stop-notifier via _NewSTTransportStoppedNotifierUPP " +
        "@0x21834f (stub 0x6dce22) + _STTransportAddStopNotifier @0x218362 " +
        "(stub 0x6dd00e), then overload-notifier via _NewSTTransportOverloadNotifierUPP " +
        "@0x218395 (stub 0x6dce1c) + _STTransportAddOverloadNotifier @0x2183a8 " +
        "(stub 0x6dd008). Both notifier passes gate on notifiersEnabled_at_0x159==1 " +
        "and cache the returned UPP in this[+0x48] (stop) / this[+0x58] (overload) " +
        "for reuse. Local-static callback addresses handed to the UPP factories: " +
        "stopNotifierProc (@0x218348) and overloadNotifierProc (@0x21838e). " +
        "@0x2182d0",
    );

    // Unreachable after throw — the rest of the disasm structure is
    // preserved in the header comment above for a future porter.
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZAudioMixer::isPlaying()
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZAudioMixer9isPlayingEv.s
  //
  // FULL DISASM (Ozone slice, 26 lines, @0x21bc20..@0x21bc65):
  //
  //   0x21bc20  pushq  %rbp                        ; frame prologue
  //   0x21bc21  movq   %rsp, %rbp
  //   0x21bc24  subq   $0x10, %rsp                 ; 16-byte local frame
  //   0x21bc28  movb   $0x0, -0x1(%rbp)            ; out-byte = 0 (default false)
  //   0x21bc2c  movq   0x10(%rdi), %rdi            ; rdi = this->STMixer_at_0x10
  //   0x21bc30  leaq   -0x10(%rbp), %rsi           ; rsi = &transportOut
  //   0x21bc34  callq  _STMixerGetTransport        ; @stub 0x6dcf84  (ST audio extern)
  //   0x21bc39  testl  %eax, %eax                  ; err ?
  //   0x21bc3b  je     0x21bc45                    ;   no -> IsPlaying
  //   0x21bc3d  xorl   %eax, %eax                  ; err path: return 0
  //   0x21bc3f  addq   $0x10, %rsp
  //   0x21bc43  popq   %rbp
  //   0x21bc44  retq
  //   0x21bc45  movq   -0x10(%rbp), %rdi           ; rdi = transportOut
  //   0x21bc49  leaq   -0x1(%rbp), %rsi            ; rsi = &out-byte
  //   0x21bc4d  callq  _STTransportIsPlaying       ; @stub 0x6dd01a  (ST audio extern)
  //   0x21bc52  testl  %eax, %eax                  ; err ?
  //   0x21bc54  sete   %cl                         ; cl = (err == 0)
  //   0x21bc57  cmpb   $0x0, -0x1(%rbp)            ; out-byte == 0 ?
  //   0x21bc5b  setne  %al                         ; al = (out-byte != 0)
  //   0x21bc5e  andb   %cl, %al                    ; return err==0 && out-byte!=0
  //   0x21bc60  addq   $0x10, %rsp
  //   0x21bc64  popq   %rbp
  //   0x21bc65  retq
  //
  // Semantics: exactly the trailing half of `isScrubbing` without the
  // `startedPlayback_at_0xdc == 1` gate. Returns true iff (a) the
  // STMixer's transport is reachable via `_STMixerGetTransport`, AND
  // (b) `_STTransportIsPlaying` succeeds (err==0), AND (c) the out-bool
  // it writes is non-zero. Any earlier failure returns false.
  //
  // FRONTIER CALLEES (both TRUE OUT-OF-SCOPE ST audio externs, exactly
  // the same pair used by isScrubbing):
  //   * _STMixerGetTransport    @Ozone stub 0x6dcf84 (called @0x21bc34)
  //   * _STTransportIsPlaying   @Ozone stub 0x6dd01a (called @0x21bc4d)
  //
  // Both are the ST* Sound-Transport C API (Apple host-audio subsystem),
  // outside the 5-framework port scope, SAME boundary policy as
  // isScrubbing/initMixer above (raise at the first ST call rather
  // than paper over).
  //
  // Anti-cheat: the disasm has REAL WORK before the ST boundary — an
  // out-byte initialisation (`movb $0x0, -0x1(%rbp)`) and a load of
  // `this->STMixer_at_0x10` (`movq 0x10(%rdi), %rdi`). Both are
  // in-scope operations that must run. We model the STMixer read
  // observably (void this.STMixer_at_0x10) exactly the way isScrubbing
  // does, then raise at the ST call site.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZAudioMixer::isPlaying()` — @Ozone 0x21bc20
   * (__ZN12OZAudioMixer9isPlayingEv).
   *
   * Returns `true` iff (a) `STMixerGetTransport(this->STMixer_at_0x10,
   * &transport) == 0`, AND (b) `STTransportIsPlaying(transport, &out)
   * == 0`, AND (c) the out-bool is non-zero. Any earlier failure
   * returns false. Unlike `isScrubbing`, there is no
   * `startedPlayback_at_0xdc` pre-gate — this method calls the ST APIs
   * unconditionally.
   *
   * Both ST calls are TRUE out-of-scope externs (Apple ST audio API —
   * outside the 5-framework port scope, same policy as pthread/
   * CoreMedia externs). We faithfully transcribe the control flow and
   * raise at the first boundary call rather than paper over it.
   */
  isPlaying(): boolean {
    // ------------------------------------------------------------
    // @0x21bc24-0x21bc28  frame + stack out-byte init to 0.
    //   (JS has no stack out-params; we track the "default false"
    //    invariant in the throw-path below.)
    // @0x21bc2c  movq 0x10(%rdi), %rdi   : rdi = this->STMixer_at_0x10
    // @0x21bc30  leaq -0x10(%rbp), %rsi  : rsi = &transport_out
    // @0x21bc34  callq _STMixerGetTransport
    //   TRUE out-of-scope ST audio boundary — SAME extern used by
    //   isScrubbing @0x21c65d. Policy: raise, don't paper over.
    // ------------------------------------------------------------
    // Materialise the read of `this->STMixer_at_0x10` so the port
    // observably references it — matches the disasm's `movq
    // 0x10(%rdi), %rdi`, and mirrors how isScrubbing handles the
    // same field.
    void this.STMixer_at_0x10;

    // @0x21bc34 _STMixerGetTransport — TRUE out-of-scope extern.
    throw new Error(
      "OZAudioMixer::isPlaying() requires _STMixerGetTransport on " +
        "this->STMixer_at_0x10 @Ozone 0x21bc34 (ST audio-transport stub " +
        "@0x6dcf84) — ST* is not modelled in TS (Apple Sound-Transport " +
        "API, same boundary policy as CoreMedia/pthread externs; see " +
        "isScrubbing @0x21c65d, initMixer @0x2182e9). After a successful " +
        "STMixerGetTransport the disasm calls _STTransportIsPlaying " +
        "@0x21bc4d (stub @0x6dd01a) and ANDs err==0 with the out-bool " +
        "(matches isScrubbing's trailing half exactly, but WITHOUT the " +
        "startedPlayback_at_0xdc pre-gate). @0x21bc20",
    );

    // Unreachable — kept as documentation of the disasm's post-throw
    // structure so a future porter can wire the boundary if ST ever
    // enters scope:
    //   @0x21bc39 testl %eax, %eax ; @0x21bc3b je 0x21bc45  : err ? no -> continue
    //   @0x21bc3d xorl %eax, %eax  ; @0x21bc44 retq         : err -> return false
    //   @0x21bc45..@0x21bc65:
    //     movq -0x10(%rbp), %rdi        : rdi = transport
    //     leaq -0x1(%rbp), %rsi         : rsi = &out_byte
    //     callq _STTransportIsPlaying   : @stub 0x6dd01a  (out-of-scope)
    //     testl %eax, %eax ; sete %cl   : cl = (err == 0)
    //     cmpb $0x0, -0x1(%rbp) ; setne %al : al = (out_byte != 0)
    //     andb %cl, %al                 : return err==0 && out_byte!=0
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZAudioMixer::stop(bool, bool)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZAudioMixer4stopEbb.s
  //
  // FULL DISASM (Ozone slice, @0x21c150..0x21c209):
  //   0x21c150  pushq  %rbp
  //   0x21c151  movq   %rsp, %rbp
  //   0x21c154  pushq  %r14
  //   0x21c156  pushq  %rbx
  //   0x21c157  subq   $0x10, %rsp
  //   0x21c15b  movl   %esi, %r14d                  ; r14d = arg0 `a` (bool, %esi)
  //   0x21c15e  movq   %rdi, %rbx                   ; rbx  = this
  //   0x21c161  movb   %dl, 0xd4(%rdi)              ; this->flagByte_at_0xd4 = arg1 `b` (%dl)
  //   0x21c167  movq   0x10(%rdi), %rdi             ; rdi = this->STMixer_at_0x10
  //   0x21c16b  leaq   -0x18(%rbp), %rsi            ; rsi = &transport_out
  //   0x21c16f  callq  _STMixerGetTransport         ; @stub 0x6dcf84 (ST audio extern)
  //   0x21c174  testl  %eax, %eax                   ; err ?
  //   0x21c176  jne    0x21c1e1                     ;   err -> return 0 (fail path)
  //   0x21c178  testb  %r14b, %r14b                 ; `a` != 0 ?
  //   0x21c17b  je     0x21c184                     ;   no -> skip the +0xa1 flag set
  //   0x21c17d  movb   $0x1, 0xa1(%rbx)             ; this->flagByte_at_0xa1 = 1
  //   0x21c184  movq   0x88(%rbx), %rdi             ; rdi = this->runLoopTimer_at_0x88
  //   0x21c18b  testq  %rdi, %rdi ; je 0x21c1ac     ;   null -> skip invalidate/release
  //   0x21c190  callq  _CFRunLoopTimerInvalidate    ; @stub 0x6dc852 (CoreFoundation extern)
  //   0x21c195  movq   0x88(%rbx), %rdi             ; reload
  //   0x21c19c  callq  _CFRelease                   ; @stub 0x6dc810 (CoreFoundation extern)
  //   0x21c1a1  movq   $0x0, 0x88(%rbx)             ; this->runLoopTimer_at_0x88 = null
  //   0x21c1ac  movq   0x90(%rbx), %rdi             ; rdi = this->runLoopTimer_at_0x90
  //   0x21c1b3  testq  %rdi, %rdi ; je 0x21c1d4     ;   null -> skip invalidate/release
  //   0x21c1b8  callq  _CFRunLoopTimerInvalidate    ; @stub 0x6dc852 (CoreFoundation extern)
  //   0x21c1bd  movq   0x90(%rbx), %rdi             ; reload
  //   0x21c1c4  callq  _CFRelease                   ; @stub 0x6dc810 (CoreFoundation extern)
  //   0x21c1c9  movq   $0x0, 0x90(%rbx)             ; this->runLoopTimer_at_0x90 = null
  //   0x21c1d4  movq   -0x18(%rbp), %rdi            ; rdi = transport (out-param from above)
  //   0x21c1d8  callq  _STTransportStop             ; @stub 0x6dd03e (ST audio extern)
  //   0x21c1dd  testl  %eax, %eax                   ; err ?
  //   0x21c1df  je     0x21c1f0                     ;   ok  -> success path
  //   0x21c1e1  xorl   %r14d, %r14d                 ; fail path: return-value = 0
  //   0x21c1e4  movl   %r14d, %eax                  ; eax = r14d
  //   0x21c1e7  addq   $0x10, %rsp ; popq %rbx ; popq %r14 ; popq %rbp ; retq
  //   0x21c1f0  movq   0x50(%rbx), %rdi             ; rdi = this->scheduledCallbackUPP_at_0x50
  //   0x21c1f4  movb   $0x1, %r14b                  ; return-value = 1 (success)
  //   0x21c1f7  testq  %rdi, %rdi ; je 0x21c1e4     ;   null -> return 1
  //   0x21c1fc  callq  _DisposeSTScheduledCallbackUPP ; @stub 0x6dcb7c (ST audio extern)
  //   0x21c201  movq   $0x0, 0x50(%rbx)             ; this->scheduledCallbackUPP_at_0x50 = null
  //   0x21c209  jmp    0x21c1e4                     ; return 1
  //
  // SEMANTICS: write the `b` flag to +0xd4, fetch the STMixer's transport,
  // and (on success) tear down any installed CFRunLoopTimers (+0x88, +0x90)
  // and scheduled-callback UPP (+0x50), calling STTransportStop in between.
  // Returns true iff BOTH STMixerGetTransport AND STTransportStop succeed
  // (err==0); any ST failure returns false.
  //
  // FRONTIER CALLEES — ALL TRUE OUT-OF-SCOPE EXTERNS:
  //   * _STMixerGetTransport          @Ozone stub 0x6dcf84 (@0x21c16f)             — ST audio
  //   * _CFRunLoopTimerInvalidate     @Ozone stub 0x6dc852 (@0x21c190,@0x21c1b8)   — CoreFoundation
  //   * _CFRelease                    @Ozone stub 0x6dc810 (@0x21c19c,@0x21c1c4)   — CoreFoundation
  //   * _STTransportStop              @Ozone stub 0x6dd03e (@0x21c1d8)             — ST audio
  //   * _DisposeSTScheduledCallbackUPP@Ozone stub 0x6dcb7c (@0x21c1fc)             — ST audio
  //
  // ST* is Apple's Sound-Transport C API and CF* is CoreFoundation — both
  // outside the 5-framework FCP port scope, SAME boundary policy as the ST
  // calls in isScrubbing/isPlaying/initMixer above. `_STMixerGetTransport`
  // is a VALUE-PRODUCING extern (its err code AND the transport out-param
  // drive the entire rest of the function), so — exactly as isPlaying does
  // @0x21bc34 — we raise at that first boundary call rather than fabricate a
  // transport handle. The pre-extern REAL WORK (`movb %dl,0xd4` @0x21c161)
  // runs first, faithfully.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZAudioMixer::stop(bool a, bool b)` — @Ozone 0x21c150
   * (__ZN12OZAudioMixer4stopEbb).
   *
   * Stores `b` into the +0xd4 flag, fetches the mixer's transport, and on
   * success tears down the two CFRunLoopTimers (+0x88, +0x90) and the
   * scheduled-callback UPP (+0x50) around a `STTransportStop` call, also
   * setting the +0xa1 flag when `a` is true. Returns true iff both
   * `STMixerGetTransport` and `STTransportStop` succeed.
   *
   * Every callee is a TRUE out-of-scope extern (Apple ST audio + Core-
   * Foundation). `_STMixerGetTransport` is value-producing (err + out-
   * param gate everything downstream), so we perform the pre-extern real
   * work (@0x21c161) and then raise at the first boundary call — the
   * identical discipline used by isScrubbing / isPlaying / initMixer.
   *
   * @param a  first bool (SysV %esi) — gates the +0xa1 flag set.
   * @param b  second bool (SysV %dl) — stored to +0xd4 unconditionally.
   * @returns  true iff the transport was fetched AND stopped without error.
   */
  stop(a: boolean, b: boolean): boolean {
    // @0x21c15b  movl %esi,%r14d          : capture arg0 `a` (used @0x21c178
    //   to gate the +0xa1 flag). Referenced so the port threads it like the
    //   machine keeps it live across the extern in r14.
    void a;
    // @0x21c161  movb %dl, 0xd4(%rdi)     : this->flagByte_at_0xd4 = `b`.
    //   REAL WORK executed BEFORE the extern — a 1-byte store of the second
    //   bool argument. C++ `bool` → 1 byte: true==1, false==0.
    this.flagByte_at_0xd4 = b ? 1 : 0;

    // @0x21c167  movq 0x10(%rdi),%rdi      : rdi = this->STMixer_at_0x10
    // @0x21c16b  leaq -0x18(%rbp),%rsi     : rsi = &transport_out
    // @0x21c16f  callq _STMixerGetTransport
    //   TRUE out-of-scope, VALUE-PRODUCING extern (Apple ST audio). Its
    //   error code (@0x21c174 testl/jne) and the transport out-param
    //   (@0x21c1d4, handed to STTransportStop) drive the entire rest of the
    //   function — we cannot honestly synthesise either. Raise at the
    //   boundary, mirroring isPlaying @0x21bc34.
    // Materialise the STMixer read so the port observably references it
    // (matches `movq 0x10(%rdi),%rdi`), exactly as the sibling methods do.
    void this.STMixer_at_0x10;

    throw new Error(
      "OZAudioMixer::stop(bool,bool) requires _STMixerGetTransport on " +
        "this->STMixer_at_0x10 @Ozone 0x21c16f (ST audio-transport stub " +
        "@0x6dcf84) — ST* is not modelled in TS (Apple Sound-Transport API, " +
        "same boundary policy as isScrubbing @0x21c65d / isPlaying @0x21bc34 / " +
        "initMixer @0x2182e9). On success (err==0), the disasm: sets " +
        "flagByte_at_0xa1=1 when `a` (@0x21c17d); invalidates+releases+nulls " +
        "the two __CFRunLoopTimers at +0x88 (@0x21c190/0x21c19c, CoreFoundation " +
        "stubs 0x6dc852/0x6dc810) and +0x90 (@0x21c1b8/0x21c1c4); calls " +
        "_STTransportStop @0x21c1d8 (stub 0x6dd03e) on the transport; and — if " +
        "that succeeds — disposes the scheduled-callback UPP at +0x50 via " +
        "_DisposeSTScheduledCallbackUPP @0x21c1fc (stub 0x6dcb7c) and nulls it, " +
        "returning true. Any ST error returns false. The pre-extern store " +
        "`this.flagByte_at_0xd4 = b` @0x21c161 has already run. @0x21c150",
    );

    // Unreachable after the throw — the disasm's post-boundary structure is
    // preserved in the header comment above for a future porter who wires the
    // ST/CF boundary: err? -> return false; else set +0xa1 (if a), tear down
    // +0x88/+0x90 timers, STTransportStop, then dispose +0x50 UPP, return true.
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZAudioMixer::postTrackPanRamp(STTrack*, int, double, double)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN12OZAudioMixer16postTrackPanRampEP7STTrackidd.s
  //
  // FULL DISASM (Ozone slice, 62 lines, @0x21b020..@0x21b0f8):
  //
  //   0x21b020  testq  %rsi, %rsi                          ; track == NULL ?
  //   0x21b023  je     0x21b0cc                            ;   yes -> return 0
  //   0x21b029  pushq  %rbp                                ; frame prologue
  //   0x21b02a  movq   %rsp, %rbp
  //   0x21b02d  pushq  %r14
  //   0x21b02f  pushq  %rbx
  //   0x21b030  subq   $0x20, %rsp
  //   0x21b034  movl   %edx, %ebx                          ; ebx = channelIndex (int32)
  //   0x21b036  movq   %rdi, %r14                          ; r14 = this
  //   0x21b039  movsd  %xmm0, -0x20(%rbp)                  ; stash toValue (double)
  //   0x21b03e  movsd  %xmm1, -0x28(%rbp)                  ; stash rampDuration (double)
  //   0x21b043  leaq   -0x30(%rbp), %rax                   ; rax = &modOut  (STModule* out-slot)
  //   0x21b047  movq   %rsi, %rdi                          ; rdi = track
  //   0x21b04a  movq   %rax, %rsi                          ; rsi = &modOut
  //   0x21b04d  callq  _STTrackGetPanModule                ; @stub 0x6dcffc  (ST audio extern)
  //   0x21b052  testl  %eax, %eax                          ; err ?
  //   0x21b054  jne    0x21b0c1                            ;   yes -> return 0
  //   0x21b056  cmpq   $0x0, trackPanSupplier(%rip)        ; static UPP cached?
  //   0x21b05e  jne    0x21b073                            ;   yes -> skip alloc
  //   0x21b060  leaq   SupplyTrackPanRampValues(%rip),%rdi ; rdi = &callback (@0x21b5c0)
  //   0x21b067  callq  _NewSTValueSupplierUPP              ; @stub 0x6dce28  (ST audio extern)
  //   0x21b06c  movq   %rax, trackPanSupplier(%rip)        ; cache the UPP
  //   0x21b073  movq   -0x30(%rbp), %rdi                   ; rdi = modOut (STModule*)
  //   0x21b077  leaq   -0x18(%rbp), %rdx                   ; rdx = &paramOut (STParameter* out-slot)
  //   0x21b07b  xorl   %esi, %esi                          ; rsi = 0  (parameterIndex = 0)
  //   0x21b07d  callq  _STModuleGetIndexedParameter        ; @stub 0x6dcfba  (ST audio extern)
  //   0x21b082  testl  %eax, %eax                          ; err ?
  //   0x21b084  jne    0x21b0ab                            ;   yes -> skip first Post, try index 1
  //   0x21b086  movq   -0x18(%rbp), %rdi                   ; rdi = paramOut
  //   0x21b08a  movq   trackPanSupplier(%rip), %rsi        ; rsi = trackPanSupplier UPP
  //   0x21b091  movslq %ebx, %rax                          ; rax = (int64)channelIndex
  //   0x21b094  movq   0x68(%r14), %rcx                    ; rcx = this->channelParams_at_0x68
  //   0x21b098  movq   (%rcx,%rax,8), %rdx                 ; rdx = channelParams[channelIndex]
  //   0x21b09c  movsd  -0x20(%rbp), %xmm0                  ; xmm0 = toValue
  //   0x21b0a1  movsd  -0x28(%rbp), %xmm1                  ; xmm1 = rampDuration
  //   0x21b0a6  callq  _STParameterPostComplexRamp         ; @stub 0x6dcfcc  (ST audio extern)
  //   0x21b0ab  movq   -0x30(%rbp), %rdi                   ; rdi = modOut
  //   0x21b0af  leaq   -0x18(%rbp), %rdx                   ; rdx = &paramOut
  //   0x21b0b3  movl   $0x1, %esi                          ; rsi = 1  (parameterIndex = 1)
  //   0x21b0b8  callq  _STModuleGetIndexedParameter        ; @stub 0x6dcfba  (ST audio extern)
  //   0x21b0bd  testl  %eax, %eax                          ; err ?
  //   0x21b0bf  je     0x21b0cf                            ;   no -> do second PostComplexRamp
  //   0x21b0c1  xorl   %eax, %eax                          ; err path: rc = 0
  //   0x21b0c3  addq   $0x20, %rsp                         ; epilogue
  //   0x21b0c7  popq   %rbx
  //   0x21b0c8  popq   %r14
  //   0x21b0ca  popq   %rbp
  //   0x21b0cb  retq
  //   0x21b0cc  xorl   %eax, %eax                          ; NULL-track early-exit
  //   0x21b0ce  retq
  //   0x21b0cf  movq   -0x18(%rbp), %rdi                   ; rdi = paramOut (index 1)
  //   0x21b0d3  movq   trackPanSupplier(%rip), %rsi        ; rsi = trackPanSupplier UPP
  //   0x21b0da  movslq %ebx, %rax                          ; rax = (int64)channelIndex
  //   0x21b0dd  movq   0x68(%r14), %rcx                    ; rcx = this->channelParams_at_0x68
  //   0x21b0e1  movq   (%rcx,%rax,8), %rdx                 ; rdx = channelParams[channelIndex]
  //   0x21b0e5  movsd  -0x20(%rbp), %xmm0                  ; xmm0 = toValue
  //   0x21b0ea  movsd  -0x28(%rbp), %xmm1                  ; xmm1 = rampDuration
  //   0x21b0ef  callq  _STParameterPostComplexRamp         ; @stub 0x6dcfcc  (ST audio extern)
  //   0x21b0f4  movb   $0x1, %al                           ; rc = 1
  //   0x21b0f6  jmp    0x21b0c3                            ; epilogue
  //
  // Semantics: install a "complex ramp" (a 2-parameter animated ramp over
  // `rampDuration` seconds to `toValue`) on BOTH of the track's pan-module
  // parameters (index 0 and index 1 — left/right pan legs, typically),
  // using the file-scope `trackPanSupplier` UPP to interpolate values.
  // Returns 1 iff BOTH parameters were successfully posted (specifically:
  // parameter 1 succeeds — the return-true path only fires from the
  // parameter-index-1 branch @0x21b0f4). Returns 0 in every other case:
  // NULL track, STTrackGetPanModule failure, or STModuleGetIndexedParameter
  // failure on index 1. (Interestingly, an index-0 failure does NOT abort:
  // control falls through to try index 1, and if THAT succeeds the return
  // is still 1 — the disasm treats index-1 as authoritative.)
  //
  // FRONTIER CALLEES (all TRUE OUT-OF-SCOPE ST audio externs):
  //   * _STTrackGetPanModule           @stub 0x6dcffc (called @0x21b04d)
  //   * _NewSTValueSupplierUPP         @stub 0x6dce28 (called @0x21b067)
  //   * _STModuleGetIndexedParameter   @stub 0x6dcfba (called @0x21b07d, @0x21b0b8)
  //   * _STParameterPostComplexRamp    @stub 0x6dcfcc (called @0x21b0a6, @0x21b0ef)
  //
  // Local statics referenced by ADDRESS ONLY (not called from this function):
  //   * __ZL24SupplyTrackPanRampValuesPvd  @Ozone 0x21b5c0 — the value-
  //     supplier callback whose address is handed to _NewSTValueSupplierUPP
  //     @0x21b067. This is a separate ledger entry (its body is a 74-insn
  //     decode of a Sound-Transport value-supplier callback, not invoked
  //     from this ledger unit). Modelled here as an opaque UPP-source
  //     sentinel — matching how initMixer treats stopNotifierProc /
  //     overloadNotifierProc.
  //
  // Same boundary policy as isScrubbing/initMixer: we raise at the first
  // ST audio call. The NULL-track early-exit before the first ST call is
  // in-scope work and MUST run (per the anti-cheat "NEVER ship EMPTY body
  // when disasm has real work" rule) — so we handle that path first.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZAudioMixer::postTrackPanRamp(STTrack* track, int channelIndex,
   *   double toValue, double rampDuration)` — @Ozone 0x21b020
   * (__ZN12OZAudioMixer16postTrackPanRampEP7STTrackidd).
   *
   * Line-for-line transcription of the disasm quoted above. Returns
   * false when `track` is NULL (the @0x21b020 nullptr fast-exit — no ST
   * call is made in that path). Every other path passes through one or
   * more ST* audio externs which are TRUE out-of-scope for this port;
   * we raise a boundary-crossing throw at the first ST call, exactly
   * matching the policy used by every peer method in this file
   * (isScrubbing, initMixer).
   */
  postTrackPanRamp(
    track: STTrackHandle | null,
    channelIndex: number,
    toValue: number,
    rampDuration: number,
  ): boolean {
    // ------------------------------------------------------------
    // @0x21b020  testq %rsi, %rsi   ; @0x21b023 je 0x21b0cc
    //   AT&T: `testq %rsi,%rsi` computes `rsi & rsi`; ZF=1 iff rsi==0.
    //   `je` taken -> jump to @0x21b0cc (xorl %eax,%eax ; retq).
    //   NULL-track short-circuit: return 0 with NO ST calls made.
    // ------------------------------------------------------------
    if (track === null) {
      // @0x21b0cc..@0x21b0ce  xorl %eax, %eax ; retq  -> return 0
      return false;
    }

    // ------------------------------------------------------------
    // @0x21b029..@0x21b043  prologue + stash toValue / rampDuration
    // in stack slots (-0x20/-0x28) — TS captures them in closures.
    // The 3 out-slots on the stack (-0x30 for modOut, -0x18 for paramOut,
    // -0x30..-0x18 for modOut) are ABI-level; not observable in TS.
    //
    // @0x21b04d  callq _STTrackGetPanModule(track, &modOut)
    //   FIRST ST audio boundary — TRUE out-of-scope extern (ST audio
    //   API, same policy as CMTime/pthread/CGColorSpace externs; see
    //   isScrubbing @0x21c65d and initMixer @0x2182e9 for the exact
    //   same boundary treatment).
    // ------------------------------------------------------------
    // Materialise the reads so the port observably references every
    // in-scope operand of the ST call site (mirrors the disasm's
    // `movl %edx,%ebx` / `movsd %xmm0,-0x20(%rbp)` /
    // `movsd %xmm1,-0x28(%rbp)` / `movq %rdi,%r14` moves; the
    // this-pointer + numeric args must survive to the boundary).
    void channelIndex;
    void toValue;
    void rampDuration;
    void this.channelParams_at_0x68; // read @0x21b094/@0x21b0dd
    void trackPanSupplier; // read @0x21b056/@0x21b08a/@0x21b0d3

    // @0x21b04d _STTrackGetPanModule — TRUE out-of-scope extern.
    throw new Error(
      "OZAudioMixer::postTrackPanRamp(track, channelIndex, toValue, " +
        "rampDuration) requires _STTrackGetPanModule(track, &modOut) " +
        "@Ozone 0x21b04d (ST audio stub @0x6dcffc) — ST* is not modelled " +
        "in TS (Apple Sound-Transport API, same boundary policy as " +
        "CoreMedia/pthread externs; see isScrubbing @0x21c65d, initMixer " +
        "@0x2182e9). On success the disasm continues with: (1) lazily " +
        "cache trackPanSupplier via _NewSTValueSupplierUPP(&SupplyTrack" +
        "PanRampValues @0x21b5c0) @stub 0x6dce28 gated on trackPanSupplier==0 " +
        "@0x21b056; (2) _STModuleGetIndexedParameter(modOut, 0, &paramOut) " +
        "@0x21b07d (stub 0x6dcfba); (3) on success, _STParameterPost" +
        "ComplexRamp(paramOut, trackPanSupplier, this->channelParams_at_0x68" +
        "[channelIndex], toValue, rampDuration) @0x21b0a6 (stub 0x6dcfcc); " +
        "(4) _STModuleGetIndexedParameter(modOut, 1, &paramOut) @0x21b0b8; " +
        "(5) on success, second _STParameterPostComplexRamp @0x21b0ef and " +
        "return TRUE (@0x21b0f4). Return FALSE otherwise (@0x21b0c1 err path " +
        "or NULL-track @0x21b0cc). All four ST callees are out-of-scope " +
        "Apple audio-transport externs. @0x21b020",
    );

    // Unreachable — kept as documentation of the disasm's post-throw
    // structure so a future porter can wire the boundary if ST ever
    // enters scope. See the FULL DISASM in the header comment above.
  }
}
