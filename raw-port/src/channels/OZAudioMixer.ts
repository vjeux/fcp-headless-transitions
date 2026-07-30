// OZAudioMixer — Ozone framework audio mixer.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (x86_64 slice, unadjusted VAs).
//
// This file ports ONLY the methods listed under "Symbols ported here" below.
// OZAudioMixer is a large class (fields observed at offsets 0x10, 0x28, 0x30,
// 0x38, 0x81, 0x130 imply at least a 0x140-byte layout); every other method is
// a separate ledger entry and will be added to THIS file (additive extension
// only) when it is claimed. Never a rewrite / drop of a currently-landed
// method.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * OZAudioMixer::addTrackLevelObserver(STTrack*)         @Ozone 0x21b100
//
// re/disasm:
//   raw-port/re/disasm/__ZN12OZAudioMixer21addTrackLevelObserverEP7STTrack.s
//   (75 lines)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered only from this method's disasm)
// -----------------------------------------------------------------------------
// OZAudioMixer {
//   ...                          // 0x00..0x0f not yet decoded
//   ptr      slot10;             // +0x10  — a non-null-guarded pointer field.
//                                 //   `cmpq $0x0, 0x10(%rdi); je .fail` @0x21b120
//                                 //   is a "is this mixer wired up?" precondition.
//                                 //   Semantic unknown; the field is only read,
//                                 //   never written by this method — so we can't
//                                 //   name it beyond the offset.
//   ...                          // 0x18..0x27 not yet decoded
//   STModule* levelModule;       // +0x28  — the STModule* that
//                                 //   _STTrackGetLevelModule writes into. Loaded
//                                 //   later @0x21b1c3 as rdi to
//                                 //   _STModuleAddAudioObserver, so the field
//                                 //   holds an STModule* pointer.
//   STAudioObserverUPP observer  // +0x30  — the cached
//                                 //   Universal-Procedure-Pointer wrapper for
//                                 //   `levelObserverProc`. Lazily created via
//                                 //   _NewSTAudioObserverUPP the first time
//                                 //   addTrackLevelObserver runs (@0x21b141),
//                                 //   then reused on subsequent calls.
//   TrackLevelObserverState* obs // +0x38  — the observer state struct pointer
//                                 //   (heap-allocated, `new`-ed via __Znwm @
//                                 //   0x21b16e; see TrackLevelObserverState
//                                 //   layout below). Lazily created; reused.
//   ...                          // 0x40..0x80 not yet decoded
//   uint8_t  installedFlag;      // +0x81  — one-byte "observer installed"
//                                 //   sentinel. `cmpb $0x0, 0x81(%rdi); jne
//                                 //   .exit_true` @0x21b110 turns the whole
//                                 //   method into a no-op after first success.
//                                 //   `movb $0x1, 0x81(%rbx)` @0x21b1cf sets it.
//   ...                          // 0x82..0x12f not yet decoded
//   uint32_t channelCount;       // +0x130 — u32 channel count copied into the
//                                 //   observer struct on first install
//                                 //   (`movl 0x130(%rbx), %r12d` @0x21b176).
//   ...                          // 0x134..end not yet decoded
// }
//
// TrackLevelObserverState (heap-alloc'd 40 bytes, @Ozone `new` @0x21b16e-0x21b1ac):
//   +0x00  uint32_t   channels        ; copy of mixer->channelCount
//   +0x08  float*     bufA            ; new float[channels]   (4*channels bytes)
//   +0x10  double*    bufB            ; new double[channels]  (8*channels bytes)
//   +0x18  float*     bufC            ; new float[channels]   (4*channels bytes)
//   +0x20  float*     bufD            ; new float[channels]   (4*channels bytes)
//   +0x28  (pad/end)
//
// The three float* arrays (bufA/C/D) are all sized 4*channels bytes; the
// double* array (bufB) is 8*channels bytes. The specific semantic role of
// each buffer belongs to `levelObserverProc`'s decode (a separate ledger
// entry not in this file's scope); the ctor above just tells us the widths
// and count.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   __stub _STTrackGetLevelModule    @Ozone 0x6dcfea   Apple SoundTrack extern
//   __stub _NewSTAudioObserverUPP    @Ozone 0x6dce0a   Apple SoundTrack extern
//   __stub _STModuleAddAudioObserver @Ozone 0x6dcfb4   Apple SoundTrack extern
//   __stub __Znwm                    @Ozone 0x6dfca2   libc++ operator new (extern)
//   __stub __Znam                    @Ozone 0x6dfc96   libc++ operator new[] (extern)
//   __stub __ZdlPv                   @Ozone 0x6dfc36   libc++ operator delete (extern)
//   __stub __Unwind_Resume           @Ozone 0x6dd07a   libunwind extern
//   __ZL17levelObserverProcPvdjjPKPKfh (address-taken only @0x21b14a via `leaq`;
//     never called from this method — the pointer is boxed by
//     _NewSTAudioObserverUPP and stored to +0x30 for later use by
//     _STModuleAddAudioObserver's callback dispatch. The referenced symbol is
//     an OZAudio-local (`__ZL...`) static, out-of-scope for THIS method.)
//
// All callable frontier symbols above are true out-of-scope externs (Apple
// SoundTrack, libc++, libunwind). depgraph.py reports 0 in-scope deps.
//
// -----------------------------------------------------------------------------
// PORT STRATEGY
// -----------------------------------------------------------------------------
// Two real precondition-checks precede any extern call:
//   (a) if `installedFlag != 0` return true                            @0x21b110
//   (b) if `slot10 == 0` return false                                  @0x21b120
// Both are pure field reads — ported as-is.
//
// The next instruction is the FIRST extern call (_STTrackGetLevelModule) — the
// method throws there, citing the stub address. Everything after that
// (observer-UPP creation, 40-byte observer-state alloc + four sub-arrays,
// _STModuleAddAudioObserver, installedFlag stamp) is decoded and preserved
// as documentation for the wiring pass.

/** Opaque handle to an Apple SoundTrack STTrack. */
export type STTrack = unknown;
/** Opaque handle to an Apple SoundTrack STModule. */
export type STModule = unknown;
/** Opaque handle to an Apple SoundTrack STAudioObserverUPP (universal ptr). */
export type STAudioObserverUPP = unknown;

/**
 * The 40-byte heap-alloc'd observer state stored at `OZAudioMixer.+0x38`.
 * Layout recovered from the `new(40) + 4× __Znam(channels*{4|8})` sequence
 * @0x21b16e..0x21b1ac.
 */
export interface TrackLevelObserverState {
  /** +0x00 u32 channel count (copy of `mixer.channelCountAt130`). */
  channels: number;
  /** +0x08 float[channels] — allocation size = 4*channels bytes. */
  bufA: Float32Array;
  /** +0x10 double[channels] — allocation size = 8*channels bytes. */
  bufB: Float64Array;
  /** +0x18 float[channels] — allocation size = 4*channels bytes. */
  bufC: Float32Array;
  /** +0x20 float[channels] — allocation size = 4*channels bytes. */
  bufD: Float32Array;
}

/**
 * Object layout for the OZAudioMixer fields touched by
 * `addTrackLevelObserver`. Only these five offsets + +0x81 + +0x130 are
 * decoded; everything else is opaque.
 */
export interface OZAudioMixerFields {
  /** +0x10 — precondition pointer (non-null required). */
  slot10: unknown | null;
  /** +0x28 — STModule* filled in by _STTrackGetLevelModule. */
  levelModuleAt28: STModule | null;
  /** +0x30 — cached STAudioObserverUPP (lazy, one-time). */
  observerUPPAt30: STAudioObserverUPP | null;
  /** +0x38 — the observer state struct (lazy, one-time). */
  observerStateAt38: TrackLevelObserverState | null;
  /** +0x81 — "installed?" one-byte sentinel (0 or 1). */
  installedFlagAt81: number;
  /** +0x130 — u32 channel count. */
  channelCountAt130: number;
}

/**
 * `_STTrackGetLevelModule(STTrack* track, STModule** outModule)`
 *   — Apple SoundTrack extern, out-of-scope for the port.
 *   — @Ozone __stubs 0x6dcfea (call site @0x21b131).
 */
function _STTrackGetLevelModule(
  _track: STTrack,
  _outModule: { value: STModule | null },
): number {
  throw new Error(
    "_STTrackGetLevelModule @Ozone __stubs 0x6dcfea not yet transcribed " +
      "(Apple SoundTrack extern, out of scope)",
  );
}

/**
 * `OZAudioMixer::addTrackLevelObserver(STTrack*)` -> bool   @Ozone 0x21b100
 *
 * Idempotent "install the level observer" method. On first successful call:
 *   1. Locate the STModule for the track via _STTrackGetLevelModule (stored
 *      at +0x28).
 *   2. Lazily create the STAudioObserverUPP wrapping the file-local
 *      `levelObserverProc` (cached at +0x30).
 *   3. Lazily allocate the 40-byte TrackLevelObserverState + its four
 *      per-channel buffers (cached at +0x38).
 *   4. Register the observer via _STModuleAddAudioObserver.
 *   5. Stamp `installedFlag = 1` and return `sete %al` — i.e. TRUE iff
 *      _STModuleAddAudioObserver returned 0.
 *
 * On subsequent calls the fast-path at 0x21b110 short-circuits and returns
 * `true` immediately (the installed flag having been set to 1).
 *
 * @returns  true if already installed OR install succeeded;
 *           false if slot10 was null or _STTrackGetLevelModule failed.
 */
export function OZAudioMixer_addTrackLevelObserver(
  self: OZAudioMixerFields,
  track: STTrack,
): boolean {
  // @0x21b10e  movb $0x1, %al                    ; default retval = true
  // @0x21b110  cmpb $0x0, 0x81(%rdi)              ; installedFlag == 0 ?
  // @0x21b117  jne 0x21b1db                       ; nonzero -> jump to epilogue
  //                                              ;   (with %al still 1 -> return true)
  if ((self.installedFlagAt81 | 0) !== 0) {
    // Already installed. Fast-path exit — matches the epilogue that
    // preserves %al=1.
    return true;
  }

  // @0x21b11d  movq %rdi, %rbx                   ; rbx = this (saved across calls)
  // @0x21b120  cmpq $0x0, 0x10(%rdi)             ; slot10 == null ?
  // @0x21b125  je   0x21b13a                     ; if null -> xor %eax,%eax; jmp epilogue
  //                                              ;   (return false)
  if (self.slot10 === null) {
    // @0x21b13a  xorl %eax, %eax                 ; retval = false
    // @0x21b13c  jmp  0x21b1db                   ; -> epilogue
    return false;
  }

  // @0x21b127  leaq 0x28(%rbx), %rax             ; arg2 = &this->levelModuleAt28
  // @0x21b12b  movq %rsi, %rdi                    ; arg1 = track
  // @0x21b12e  movq %rax, %rsi
  // @0x21b131  callq _STTrackGetLevelModule
  //
  // First Apple SoundTrack extern in the slow path — the frontier. On a
  // real macOS build with an ST binding this would populate
  // self.levelModuleAt28 and return 0/nonzero. The TypeScript port has no
  // such binding, so we throw with the stub's exact __stubs address.
  const outLevelModule: { value: STModule | null } = { value: null };
  const rc = _STTrackGetLevelModule(track, outLevelModule);
  self.levelModuleAt28 = outLevelModule.value;

  // @0x21b136  testl %eax, %eax                   ; ST returned an error?
  // @0x21b138  je    0x21b141                     ; success (rc==0) -> continue
  //                                              ; else fall through to 0x21b13a
  //                                              ; (return false path)
  if ((rc | 0) !== 0) {
    // @0x21b13a  xorl %eax, %eax ; @0x21b13c jmp epilogue
    return false;
  }

  // The throw in _STTrackGetLevelModule above is the current frontier.
  // Everything below is UNREACHABLE at runtime — kept as documentation
  // for the wiring pass that supplies an ST binding.
  //
  // @0x21b141  movq 0x30(%rbx), %rsi              ; observerUPP = this->+0x30
  // @0x21b145  testq %rsi, %rsi
  // @0x21b148  jne   0x21b15d                      ; already have UPP -> skip create
  // @0x21b14a  leaq __ZL17levelObserverProcPvdjjPKPKfh(%rip), %rdi
  //                                              ; arg = &levelObserverProc
  // @0x21b151  callq _NewSTAudioObserverUPP        ; UPP = _NewSTAudioObserverUPP(fn)
  // @0x21b156..9  store UPP into this->+0x30 and %rsi
  //
  // @0x21b15d  movq 0x38(%rbx), %r14              ; observerState = this->+0x38
  // @0x21b161  testq %r14, %r14
  // @0x21b164  jne   0x21b1c3                      ; already have state -> jump to install
  //
  // @0x21b16e  __Znwm(0x28)                       ; new 40-byte state struct
  // @0x21b17d  state->+0x00 = channels             ; from this->+0x130
  // @0x21b18b  __Znam(4 * channels)                ; new float[channels]
  //   -> state->+0x08
  // @0x21b19b  __Znam(8 * channels)                ; new double[channels]
  //   -> state->+0x10
  // @0x21b1a7  __Znam(4 * channels)                ; new float[channels]
  //   -> state->+0x18
  // @0x21b1b3  __Znam(4 * channels)                ; new float[channels]
  //   -> state->+0x20
  // @0x21b1bc  this->+0x38 = state
  //
  // (Exception cleanup at 0x21b1ea: if any of the four __Znam calls throws
  // AFTER `new 40` succeeded, unwind path is __ZdlPv(state) then
  // __Unwind_Resume — a plain "delete the 40-byte struct and re-raise".
  // Any partial per-channel allocation is leaked in the original code; we
  // preserve that shape rather than "fixing" it.)
  //
  // @0x21b1c3  movq 0x28(%rbx), %rdi              ; arg1 = levelModule
  //           movq %r13, %rsi                    ; arg2 = observerUPP
  //           movq %r14, %rdx                    ; arg3 = observerState
  // @0x21b1ca  callq _STModuleAddAudioObserver     ; rc = ST...(module, UPP, state)
  // @0x21b1cf  movb $0x1, 0x81(%rbx)              ; installedFlag = 1
  // @0x21b1d6  testl %eax, %eax
  // @0x21b1d8  sete  %al                          ; retval = (rc == 0) ? 1 : 0
  //
  // @0x21b1db  addq $0x8, %rsp                    ; epilogue (canary+GPR restore)
  //          ...; retq

  // Unreachable (the _STTrackGetLevelModule throw above is the frontier).
  // Included only to satisfy TS's control-flow analysis without hiding the
  // fact that the wiring pass must resume from the throw site with a real
  // ST binding.
  throw new Error(
    "OZAudioMixer::addTrackLevelObserver @Ozone 0x21b100 fell through past " +
      "the _STTrackGetLevelModule frontier — post-frontier body (lazy UPP + " +
      "40-byte observer alloc + _STModuleAddAudioObserver) not yet transcribed",
  );
}
