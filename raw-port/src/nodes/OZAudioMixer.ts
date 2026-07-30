// OZAudioMixer.ts — Ozone's audio-mixer coordinator that wraps a SoundTools
// (`ST*` prefix) transport/mixer pair. Only ONE method is decoded at this
// layer: `isScrubbing()`. Additional fields/methods will be added as their
// individual disasms are ported.
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/__ZN12OZAudioMixer11isScrubbingEv.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from isScrubbing()'s reads; other slots
// are as-yet-undecoded and left OPAQUE — we don't invent unread fields)
// -----------------------------------------------------------------------------
//   +0x010  STMixerRef  mixerAt10   ; @0x21c655 read (rdi = *(this+0x10))
//                                  ;   opaque pointer to a SoundTools STMixer*
//                                  ;   (the argument accepted by
//                                  ;   `_STMixerGetTransport`)
//   +0x0dc  uint8       flagAt0dc  ; @0x21c640 read (cmpb $0x1, 0xdc(%rdi))
//                                  ;   "scrubbing enabled?" byte flag — must
//                                  ;   equal 1 for isScrubbing() to consult
//                                  ;   the transport; ANY other value causes
//                                  ;   an immediate `return false`.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN12OZAudioMixer11isScrubbingEv
//       — OZAudioMixer::isScrubbing() @Ozone 0x21c640
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN12OZAudioMixer11isScrubbingEv.s, 30 lines)
// -----------------------------------------------------------------------------
//   __ZN12OZAudioMixer11isScrubbingEv:
//     0x21c640  cmpb    $0x1, 0xdc(%rdi)     ; CF/ZF = (this[+0xdc]) - 1
//     0x21c647  jne     0x21c66e             ; if (this[+0xdc] != 1) -> fast bail
//     0x21c649  pushq   %rbp                 ; prologue
//     0x21c64a  movq    %rsp, %rbp
//     0x21c64d  subq    $0x10, %rsp          ; allocate 16 bytes of locals
//     0x21c651  movb    $0x0, -0x1(%rbp)     ; local u8 tmp_isPlaying = 0
//     0x21c655  movq    0x10(%rdi), %rdi     ; arg0 = this[+0x10] (STMixer*)
//     0x21c659  leaq    -0x10(%rbp), %rsi    ; arg1 = &transport_out (8-byte slot)
//     0x21c65d  callq   0x6dcf84             ; _STMixerGetTransport(mixer, &tp)
//                                            ;   returns int (0 = success)
//     0x21c662  testl   %eax, %eax
//     0x21c664  je      0x21c671             ; if ret == 0 -> success, continue
//     0x21c666  xorl    %eax, %eax           ; error: return 0
//     0x21c668  addq    $0x10, %rsp
//     0x21c66c  popq    %rbp
//     0x21c66d  retq                         ; return false
//
//     0x21c66e  xorl    %eax, %eax           ; flag-mismatch fast-bail: return 0
//     0x21c670  retq                         ;   (no frame set up)
//
//     0x21c671  movq    -0x10(%rbp), %rdi    ; arg0 = transport_out (STTransport*)
//     0x21c675  leaq    -0x1(%rbp), %rsi     ; arg1 = &tmp_isPlaying (u8 out)
//     0x21c679  callq   0x6dd01a             ; _STTransportIsPlaying(tp, &pl)
//                                            ;   returns int (0 = success)
//     0x21c67e  testl   %eax, %eax
//     0x21c680  sete    %cl                  ; cl = (ret == 0)
//     0x21c683  cmpb    $0x0, -0x1(%rbp)
//     0x21c687  setne   %al                  ; al = (tmp_isPlaying != 0)
//     0x21c68a  andb    %cl, %al             ; result = success && playing
//     0x21c68c  addq    $0x10, %rsp
//     0x21c690  popq    %rbp
//     0x21c691  retq                         ; return result

/**
 * SoundTools (`ST*`) is Apple's private audio-transport framework linked
 * dynamically by FCP. Symbols like `_STMixerGetTransport` and
 * `_STTransportIsPlaying` live in a system dylib outside the five
 * frameworks this port covers (ProCore, ProChannel, Helium, Ozone, Flexo).
 * They are TRUE OUT-OF-SCOPE externs — modelled here as opaque handles
 * (`unknown`) and boundary stubs that throw when invoked.
 *
 * Same policy already applied to CoreMedia `_CMTimeConvertScale` in
 * raw-port/src/nodes/OZAudioSampleTimeFromFrameTime.ts — "TRUE
 * out-of-scope extern per this port's policy". The stubs are enough for
 * the type-checker and the reachability gate; any caller that reaches
 * them at run-time gets a loud, cited error.
 */

/** Opaque pointer to a SoundTools STMixer (`ST*` audio framework). */
type STMixerRef = unknown;

/** Opaque pointer to a SoundTools STTransport (`ST*` audio framework). */
type STTransportRef = unknown;

/**
 * `_STMixerGetTransport(STMixer*, STTransport**) -> int`
 *   — Apple's SoundTools (`ST*`) private audio framework, called via
 *   Ozone imported-stubs GOT slot 0x6dcf84. Returns 0 on success and
 *   writes the transport handle through the out-pointer; nonzero
 *   indicates failure (the FCP call-sites treat any nonzero return as
 *   "no transport available" and back out early).
 *
 * TRUE out-of-scope extern per this port's policy — SoundTools lives
 * outside the five FCP frameworks. Boundary stub matches the callsite's
 * two-argument signature; concrete run-time behaviour is not modelled
 * in this port.
 */
function STMixerGetTransport_stub(
  _mixer: STMixerRef,
  _outTransport: { value: STTransportRef | null },
): number {
  throw new Error(
    "_STMixerGetTransport(STMixer*, STTransport**) @Ozone imported-stubs " +
      "GOT 0x6dcf84 — SoundTools (Apple private ST* audio framework). " +
      "TRUE out-of-scope extern. Called from OZAudioMixer::isScrubbing() " +
      "@Ozone 0x21c65d.",
  );
}

/**
 * `_STTransportIsPlaying(STTransport*, uint8_t*) -> int`
 *   — Apple's SoundTools (`ST*`) private audio framework, called via
 *   Ozone imported-stubs GOT slot 0x6dd01a. Returns 0 on success and
 *   writes a `bool` (u8) through the out-pointer; nonzero indicates
 *   failure. The FCP call-site AND-s (success && *out) so only a
 *   successful "IS-playing" write counts as a positive answer.
 *
 * TRUE out-of-scope extern per this port's policy — SoundTools lives
 * outside the five FCP frameworks. Boundary stub matches the callsite's
 * two-argument signature; concrete run-time behaviour is not modelled
 * in this port.
 */
function STTransportIsPlaying_stub(
  _transport: STTransportRef,
  _outIsPlaying: { value: number },
): number {
  throw new Error(
    "_STTransportIsPlaying(STTransport*, uint8_t*) @Ozone imported-stubs " +
      "GOT 0x6dd01a — SoundTools (Apple private ST* audio framework). " +
      "TRUE out-of-scope extern. Called from OZAudioMixer::isScrubbing() " +
      "@Ozone 0x21c679.",
  );
}

/**
 * `OZAudioMixer` — Ozone's audio-mixer coordinator wrapping a
 * SoundTools (`ST*`) transport/mixer pair. Only the fields consulted
 * by the currently-ported methods are decoded; the rest of the object
 * is OPAQUE (undecoded) and intentionally NOT modelled — future ports
 * of other OZAudioMixer methods will add fields as their addresses
 * are read.
 */
export class OZAudioMixer {
  /**
   * @Ozone offset +0x010 — opaque `STMixer*` handle read by
   * `isScrubbing()` @0x21c655 as the first argument to
   * `_STMixerGetTransport`. Modelled as `STMixerRef` (unknown) —
   * populated by an as-yet-unported constructor / init method.
   */
  mixerAt10: STMixerRef = null;

  /**
   * @Ozone offset +0x0dc — one-byte flag read by `isScrubbing()`
   * @0x21c640 via `cmpb $0x1, 0xdc(%rdi)`. Meaning: "scrubbing enabled"
   * (the read-site's `!= 1` short-circuit says any other value —
   * including 0 — turns off scrubbing detection entirely, even when
   * the transport is playing). Modelled as `number` (0..255) so the
   * single-byte width the machine writes is legible; the setter for
   * this byte lives in a different (not-yet-ported) OZAudioMixer
   * method.
   */
  flagAt0dc: number = 0;

  /**
   * `OZAudioMixer::isScrubbing()`
   *   — @Ozone 0x21c640
   *   — __ZN12OZAudioMixer11isScrubbingEv
   *
   * Faithful transcription of the 30-line disassembly above.
   *
   * SEMANTICS:
   *   Returns `true` iff ALL FOUR of the following hold:
   *     1. this[+0xdc] == 1   (the "scrubbing enabled" flag)
   *     2. _STMixerGetTransport(this[+0x10], &transport) == 0  (success)
   *     3. _STTransportIsPlaying(transport, &tmp) == 0          (success)
   *     4. tmp != 0                                             (playing)
   *
   *   The disasm has TWO early-return paths for `false`:
   *     * @0x21c66e — flag mismatch (no frame set up; direct `xor eax,eax`).
   *     * @0x21c666 — transport-lookup failure (after frame setup;
   *                   epilogue via `add rsp,0x10; pop rbp`).
   *
   *   The final `andb %cl, %al` is a bitwise-AND of two setCC bytes,
   *   each already 0 or 1, so the result is a proper 1/0 boolean.
   *   Modelled as a TS boolean.
   *
   * DEPENDENCIES:
   *   * _STMixerGetTransport   — SoundTools extern (boundary stub above)
   *   * _STTransportIsPlaying  — SoundTools extern (boundary stub above)
   *   No in-scope callees. No virtuals. No indirect calls.
   */
  isScrubbing(): boolean {
    // @0x21c640  cmpb $0x1, 0xdc(%rdi)  ; @0x21c647 jne 0x21c66e
    //   Fast-bail if the scrubbing-enabled flag byte is anything other
    //   than exactly 1. Note: `cmpb $0x1, mem` sets ZF=1 iff mem==1;
    //   `jne` takes the branch iff ZF==0 (i.e. mem != 1).
    if (this.flagAt0dc !== 1) {
      // @0x21c66e  xorl %eax,%eax ; @0x21c670 retq  (no frame set up)
      return false;
    }

    // @0x21c651  movb $0x0, -0x1(%rbp)  — local `tmp_isPlaying = 0`.
    //   Modelled as a mutable u8 wrapped in an object so the boundary
    //   stub can (in principle) write through it, matching the SysV
    //   ABI's out-pointer contract.
    const tmpIsPlaying = { value: 0 };

    // @0x21c655/@0x21c659/@0x21c65d
    //   arg0 = this[+0x10] (STMixer*), arg1 = &transport_out, call
    //   _STMixerGetTransport.
    const transportOut: { value: STTransportRef | null } = { value: null };
    const rc1 = STMixerGetTransport_stub(this.mixerAt10, transportOut);

    // @0x21c662  testl %eax, %eax ; @0x21c664 je 0x21c671
    //   If ret != 0 (failure): return false via the frame-epilogue path.
    if (rc1 !== 0) {
      // @0x21c666..0x21c66d — error epilogue (frame is set up).
      return false;
    }

    // @0x21c671/@0x21c675/@0x21c679
    //   arg0 = transport_out (loaded back from the local slot), arg1 =
    //   &tmp_isPlaying, call _STTransportIsPlaying.
    const rc2 = STTransportIsPlaying_stub(
      transportOut.value,
      tmpIsPlaying,
    );

    // @0x21c67e  testl %eax,%eax  ; @0x21c680  sete %cl
    //   cl = (rc2 == 0).
    const cl: number = rc2 === 0 ? 1 : 0;

    // @0x21c683  cmpb $0x0, -0x1(%rbp) ; @0x21c687 setne %al
    //   al = (tmp_isPlaying != 0).
    const al: number = tmpIsPlaying.value !== 0 ? 1 : 0;

    // @0x21c68a  andb %cl, %al   ; result = success AND playing.
    const result: number = cl & al;

    // @0x21c691  retq
    return result !== 0;
  }
}
