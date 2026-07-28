// FFLoudnessAnalyzerInputReader.ts — Flexo's loudness-analysis input reader.
// Wraps an FFStreamAudioRenderSession that pulls interleaved audio frames
// from an FFStreamAudio source, converting a CMTimeRange range into
// frame-count bounds using the source's sample rate, and progressively
// consuming them one AudioBufferList at a time.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FIVE EXPORTED SYMBOLS (nm -arch x86_64):
//   @Flexo 0x0000000000538ff0  FFLoudnessAnalyzerInputReader::FFLoudnessAnalyzerInputReader(FFStreamAudio*, CMTimeRange)  (C2)
//   @Flexo 0x0000000000539120  FFLoudnessAnalyzerInputReader::FFLoudnessAnalyzerInputReader(FFStreamAudio*, CMTimeRange)  (C1 — trampoline to C2)
//   @Flexo 0x0000000000539130  FFLoudnessAnalyzerInputReader::~FFLoudnessAnalyzerInputReader()   (D2)
//   @Flexo 0x0000000000539150  FFLoudnessAnalyzerInputReader::~FFLoudnessAnalyzerInputReader()   (D1)
//   @Flexo 0x0000000000539170  FFLoudnessAnalyzerInputReader::pullFrames(unsigned long long, AudioBufferList*, bool*)
//
// NOTE ON THE C2 SYMBOL. The Flexo binary's `nm` reports this symbol at
// @0x538ff0 but the `otool -tV` linear-sweep decoder we use does NOT emit a
// label for that entry — the preceding routine _FFEDELGetIDForParameter
// ends with `addb` alignment padding that pushes the address into the
// linear stream, so the sweeper attaches the C2 body to no label. The C2
// body (0x538ff0..0x53911f) is nonetheless intact in /tmp/Flexo_tV.txt and
// is what C1's `jmp __ZN29FFLoudnessAnalyzerInputReaderC2E...` at 0x539125
// targets. Cited addresses in this file use the C2 range verbatim.
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Flexo.FFLoudnessAnalyzerInputReader.FFLoudnessAnalyzerInputReader.s
//       (C1 trampoline only — the C2 body is unlabelled; see note above)
//   Flexo.FFLoudnessAnalyzerInputReader.pullFrames.s
//   Flexo.FFLoudnessAnalyzerInputReader.~FFLoudnessAnalyzerInputReader.s
//       (D0 body @0x539150 — one of the two dtors)
// The other-half of each dtor pair (D2 @0x539130 vs D1 @0x539150) was
// extracted directly from /tmp/Flexo_tV.txt on this worktree; both bodies
// are identical (a single `objc_release(self[+0])` + return), so we model
// them as a single JS destructor.
//
// -- STRUCT LAYOUT (recovered from C2 body) --------------------------------
//
//   offset  size  field                            @Flexo cite (C2 body)
//   ------  ----  -------------------------------  ---------------------------
//   +0x00   0x08  session : id                     0x53900c movq $0,(%rdi)
//                                                  init, then 0x539045 stores
//                                                  the objc_alloc'd
//                                                  FFStreamAudioRenderSession*
//                                                  here. Read by pullFrames
//                                                  0x539191 movq (%rdi),%r15
//                                                  and released by ~D at
//                                                  0x539134/0x539154.
//   +0x08   0x28  asbd : CAStreamBasicDescription  0x53901a callq
//                                                  CAStreamBasicDescription::
//                                                  CAStreamBasicDescription()
//                                                  on self+0x08. Populated at
//                                                  0x53907d/0x539085/0x53908a
//                                                  from the render session's
//                                                  streamDescription
//                                                  (48-byte objc_msgSend_stret
//                                                  result split into
//                                                  16+16+8+padding). The
//                                                  double at self[+0x08] is
//                                                  ASBD.mSampleRate (read
//                                                  back at 0x53908e / 0x539194
//                                                  via cvttsd2si -> i32).
//   +0x30   0x08  startFrame : i64                 0x5390b8 stores the result
//                                                  of CMTimeConvertScale(
//                                                    range.start,
//                                                    (int)sampleRate,
//                                                    method=6)
//                                                  — the CMTimeValue field
//                                                  (low i64) of the rescaled
//                                                  CMTime. Semantics: this
//                                                  is the read cursor,
//                                                  advanced by pullFrames at
//                                                  0x5391d4.
//   +0x38   0x08  endFrame : i64                   0x53910c stores the result
//                                                  of CMTimeConvertScale(
//                                                    CMTimeRangeGetEnd(range),
//                                                    (int)sampleRate,
//                                                    method=5)
//                                                  — the exclusive endpoint
//                                                  cursor.
//   sizeof                = 0x40 = 64 bytes.
//
// CMTimeConvertScale rounding-method constants:
//   method 5 (@Flexo 0x5390fe movl $0x5,%edx)   — kCMTimeRoundingMethod_
//                                                 QuickTime (the "video
//                                                 host time" rounding, per
//                                                 CoreMedia CMTime.h enum).
//                                                 Used for the range's END.
//   method 6 (@Flexo 0x5390aa movl $0x6,%edx)   — kCMTimeRoundingMethod_
//                                                 Default (round toward
//                                                 zero if unset). Used for
//                                                 the range's START.
// Note: CoreMedia's CMTimeRoundingMethod enum values 5 and 6 are the
// "asymmetric" rounding modes that pair correctly for half-open range
// bracketing — start rounds down, end rounds toward the QT sample grid so
// the read window aligns to sample boundaries without duplicating frames
// across successive readers.
//
// -- ObjC INVOCATIONS ------------------------------------------------------
// Both objc_msgSend sites route through vtable-shaped __la_symbol_ptr slots
// that the tool mislabels as `-[receiver observer]` — the real selectors,
// recovered by argument shape:
//   @Flexo 0x53903f  msgSend(sessionAlloc, sel_initWithSource:, source)
//                    -> id           (0x53902d _objc_alloc → 0x53903f init).
//   @Flexo 0x53905b  objc_msgSend_stret(&outStruct, session, sel_streamDescription)
//                    -> CAStreamBasicDescription (returned by stret because
//                       it's 40 bytes, which exceeds sysv's return-register
//                       budget). The stret write covers -0x50(%rbp)..-0x21
//                       (48 bytes = 40 for ASBD + 8-byte alignment tail).
//   @Flexo 0x5391ce  msgSend(session, sel_pullFrames:count:into:,
//                            startCMTime, numFrames, buffer)
//                    -> void.
// The selrefs live at Flexo 0x1697b0d/0x1697d6f/0x1697bfc (RIP-relative
// loads at 0x539032/0x53902d.../0x5391ad) but the tool doesn't dump them.
// All three throw at the objc_msgSend frontier stub with placeholder
// selector names.
//
// -- FRONTIER CALLEES -----------------------------------------------------
//   @Flexo 0x53901a    __ZN24CAStreamBasicDescriptionC1Ev
//                      CAStreamBasicDescription::CAStreamBasicDescription()
//                      (CoreAudio public C++ ABI — not yet ported).
//   @Flexo 0x53902d    _objc_alloc(&_OBJC_CLASS_$_FFStreamAudioRenderSession)
//                      (ObjC runtime helper — throw)
//   @Flexo 0x53903f    _objc_msgSend (initWithSource: on the fresh session)
//   @Flexo 0x53905b    _objc_msgSend_stret (streamDescription getter — stret
//                      because ASBD is 40 bytes)
//   @Flexo 0x5390af    _CMTimeConvertScale (public CoreMedia API — not
//                      yet ported)
//   @Flexo 0x5390df    _CMTimeRangeGetEnd  (public CoreMedia API — not
//                      yet ported)
//   @Flexo 0x539103    _CMTimeConvertScale (again — for the range end)
//   @Flexo 0x539137    _objc_release (dtor)
//   @Flexo 0x5391a8    _CMTimeMake         (public CoreMedia API — not
//                      yet ported)
//   @Flexo 0x5391ce    _objc_msgSend (pullFrames:count:into: on the session)
//   @Flexo 0x5391e5    __Z19zeroAudioBufferListP15AudioBufferListj
//                      36FFAudioBufferList_ZeroNumBytesOptionj
//                      zeroAudioBufferList(AudioBufferList*, unsigned int,
//                                          FFAudioBufferList_ZeroNumBytesOption,
//                                          unsigned int)
//                      (Flexo helper — not yet ported)
//
// Reused ports:
//   None yet — CAStreamBasicDescription, FFStreamAudio, FFStreamAudioRender
//   Session, CMTimeConvertScale/CMTimeRangeGetEnd/CMTimeMake, and
//   zeroAudioBufferList are all separate task-queue entries. (CMTime the
//   struct is ported at raw-port/src/infra/CMTime.ts but the ConvertScale /
//   RangeGetEnd / Make free-functions aren't ported yet.)

import type { CMTime } from "../infra/CMTime";

// -- OPAQUE FORWARD-DECLARATIONS -------------------------------------------

/** Opaque handle to Objective-C `id` — reference-counted heap pointer. */
export interface NSObject {
  readonly __brand_NSObject: "NSObject";
}

/** Opaque handle to Objective-C `Class`. */
export interface ObjCClass {
  readonly __brand_ObjCClass: "ObjCClass";
}

/** Opaque handle to FFStreamAudio* — the raw audio source. */
export interface FFStreamAudio extends NSObject {
  readonly __brand_FFStreamAudio: "FFStreamAudio";
}

/** Opaque handle to FFStreamAudioRenderSession* — the wrapping render
 *  session that translates timeline pulls into buffer emissions. */
export interface FFStreamAudioRenderSession extends NSObject {
  readonly __brand_FFStreamAudioRenderSession: "FFStreamAudioRenderSession";
}

/** Opaque handle to CoreMedia's `CMTimeRange` (48-byte value: two CMTimes). */
export interface CMTimeRange {
  readonly __brand_CMTimeRange: "CMTimeRange";
  readonly start: CMTime;
  readonly duration: CMTime;
}

/** Opaque handle to a CoreAudio `AudioBufferList`. */
export interface AudioBufferList {
  readonly __brand_AudioBufferList: "AudioBufferList";
}

/** Opaque handle to CoreAudio's CAStreamBasicDescription (40-byte value).
 *  Only its first field (mSampleRate : double @ +0x00) is read by any
 *  method here. The full struct is populated by the render session's
 *  streamDescription getter and stored at self+0x08. */
export interface CAStreamBasicDescription {
  readonly __brand_CAStreamBasicDescription: "CAStreamBasicDescription";
  /** +0x00 (@ self+0x08 in the parent object) — double sampleRate. */
  readonly mSampleRate: number;
  // (Remaining 32 bytes: mFormatID, mFormatFlags, mBytesPerPacket,
  //  mFramesPerPacket, mBytesPerFrame, mChannelsPerFrame, mBitsPerChannel,
  //  mReserved — see <CoreAudioTypes/CoreAudioBaseTypes.h>. Not touched by
  //  this class.)
}

/** @Flexo _OBJC_CLASS_$_FFStreamAudioRenderSession — linker-provided ref. */
const OBJC_CLASS_FFStreamAudioRenderSession_stub: ObjCClass = new Proxy(
  {} as ObjCClass,
  {
    get() {
      throw new Error(
        "_OBJC_CLASS_$_FFStreamAudioRenderSession is a linker-provided ObjC " +
          "class ref; not yet ported (used at @Flexo 0x539026).",
      );
    },
  },
);

// -- FRONTIER STUBS --------------------------------------------------------

/** @Flexo 0x53901a __ZN24CAStreamBasicDescriptionC1Ev —
 *  CAStreamBasicDescription::CAStreamBasicDescription() default ctor. */
function CAStreamBasicDescription_C1_stub(
  _target: CAStreamBasicDescription,
): void {
  throw new Error(
    "CAStreamBasicDescription::CAStreamBasicDescription() @Flexo 0x53901a is " +
      "not yet ported (CoreAudio public C++ ABI).",
  );
}

/** @Flexo 0x53902d _objc_alloc(cls). */
function objc_alloc_stub(_cls: ObjCClass): NSObject {
  throw new Error(
    "_objc_alloc @Flexo 0x53902d is not yet ported.",
  );
}

/** @Flexo 0x53903f _objc_msgSend(sessionAlloc, initWithSource:, source). */
function objc_msgSend_session_initWithSource_stub(
  _session: NSObject,
  _source: FFStreamAudio,
): FFStreamAudioRenderSession | null {
  throw new Error(
    "_objc_msgSend(session, sel_initWithSource:, source) @Flexo 0x53903f " +
      "is not yet ported — selector identity un-decoded from selref table.",
  );
}

/** @Flexo 0x53905b _objc_msgSend_stret(&out, session, streamDescription).
 *  Returns a 40-byte CAStreamBasicDescription by struct-return. */
function objc_msgSend_stret_session_streamDescription_stub(
  _session: FFStreamAudioRenderSession,
): CAStreamBasicDescription {
  throw new Error(
    "_objc_msgSend_stret(session, sel_streamDescription) @Flexo 0x53905b is " +
      "not yet ported — CAStreamBasicDescription stret return with selector " +
      "identity un-decoded.",
  );
}

/** @Flexo 0x5390af / 0x539103 _CMTimeConvertScale(&outCMTime, cmTime,
 *  newTimescale, roundingMethod). CoreMedia public API — writes to `out`. */
function CMTimeConvertScale_stub(
  _cmTime: CMTime,
  _newTimescale: number,
  _roundingMethod: number,
): CMTime {
  throw new Error(
    "_CMTimeConvertScale @Flexo 0x5390af/0x539103 is not yet ported " +
      "(CoreMedia public API).",
  );
}

/** @Flexo 0x5390df _CMTimeRangeGetEnd(&outCMTime, range). CoreMedia public
 *  API — returns `range.start + range.duration`. */
function CMTimeRangeGetEnd_stub(_range: CMTimeRange): CMTime {
  throw new Error(
    "_CMTimeRangeGetEnd @Flexo 0x5390df is not yet ported " +
      "(CoreMedia public API).",
  );
}

/** @Flexo 0x5391a8 _CMTimeMake(&outCMTime, value, timescale). CoreMedia
 *  public API — constructs a CMTime with (value, timescale, Valid, 0). */
function CMTimeMake_stub(_value: bigint, _timescale: number): CMTime {
  throw new Error(
    "_CMTimeMake @Flexo 0x5391a8 is not yet ported (CoreMedia public API).",
  );
}

/** @Flexo 0x5391ce _objc_msgSend(session, pullFrames:count:into:, cmTime,
 *  numFrames, buffer). Selector identity un-decoded. */
function objc_msgSend_session_pullFrames_stub(
  _session: FFStreamAudioRenderSession,
  _startTime: CMTime,
  _numFrames: bigint,
  _buffer: AudioBufferList,
): void {
  throw new Error(
    "_objc_msgSend(session, sel_pullFrames:count:into:, ...) @Flexo 0x5391ce " +
      "is not yet ported — selector identity un-decoded from selref table.",
  );
}

/** @Flexo 0x5391e5 zeroAudioBufferList(list, opt1, zeroOption, opt2).
 *  Flexo helper that zero-fills the provided AudioBufferList's frames when
 *  the read cursor has already reached endFrame. Not yet ported. */
function zeroAudioBufferList_stub(
  _list: AudioBufferList,
  _opt1: number,
  _zeroOption: number,
  _opt2: number,
): void {
  throw new Error(
    "zeroAudioBufferList(...) @Flexo 0x5391e5 is not yet ported.",
  );
}

/** @Flexo 0x539137 / 0x539157 _objc_release(id). */
function objc_release_stub(_obj: NSObject | null): void {
  throw new Error(
    "_objc_release @Flexo 0x539137 (D2) / 0x539157 (D1) is not yet ported.",
  );
}

// -- FFLoudnessAnalyzerInputReader ----------------------------------------

/**
 * FFLoudnessAnalyzerInputReader — Flexo's audio input reader for the
 * loudness analyzer pipeline. Constructs an FFStreamAudioRenderSession over
 * a passed-in FFStreamAudio source, translates a CMTimeRange into
 * frame-count bounds using the session's sample rate, and progressively
 * emits AudioBufferLists of `numFrames` samples via `pullFrames`.
 *
 * Layout (see file header for the recovery trace):
 *   +0x00 session:id (FFStreamAudioRenderSession*)
 *   +0x08 asbd:CAStreamBasicDescription (40 bytes, sampleRate at +0x00 = self+0x08)
 *   +0x30 startFrame:i64 (advanced by pullFrames on each successful pull)
 *   +0x38 endFrame:i64 (exclusive upper bound; when startFrame >= endFrame,
 *                       pullFrames zero-fills and reports done=true).
 *   sizeof = 64 bytes.
 */
export class FFLoudnessAnalyzerInputReader {
  declare readonly __brand_FFLoudnessAnalyzerInputReader: "FFLoudnessAnalyzerInputReader";

  /** +0x00 — the wrapping render session. Owned; released by ~D. */
  private _session: FFStreamAudioRenderSession | null = null;
  /** +0x08..+0x2f — CAStreamBasicDescription. mSampleRate is the only field
   *  read (as a double at +0x08, cvttsd2si-truncated to i32 whenever needed). */
  private _asbd: CAStreamBasicDescription | null = null;
  /** +0x30 — read cursor, in samples. Advanced by pullFrames. */
  private _startFrame: bigint = 0n;
  /** +0x38 — exclusive end cursor, in samples. */
  private _endFrame: bigint = 0n;

  /**
   * C2 constructor — FFLoudnessAnalyzerInputReader::FFLoudnessAnalyzerInputReader(
   *                    FFStreamAudio*, CMTimeRange)
   *   @Flexo 0x0000000000538ff0 .. 0x000000000053911f
   *
   * (C1 @0x539120 is a 3-instruction trampoline that tail-jumps here.)
   *
   * Faithful decode:
   *
   *   0x538ff0..0x539007  prologue (unlabelled — see file header),
   *                        r15 = source, rbx = this, r12 = &rangeStart on
   *                        the caller's stack (rbp+0x10 in this frame).
   *   0x53900c            self[+0x00] = 0                              ; null session
   *   0x539013..0x53901a  callq CAStreamBasicDescription::CAStreamBasicDescription()
   *                        on r14 = self+0x08. Default-constructs the
   *                        40-byte ASBD in-place.
   *   0x53901f..0x539022  movups %xmm0,0x30(%rbx)                       ; zero
   *                        16 bytes at self[+0x30..+0x3f] — the start/end
   *                        cursors are pre-zeroed before their real values
   *                        land.
   *   0x539026..0x53902d  rax = objc_alloc(&_OBJC_CLASS_$_FFStreamAudioRenderSession)
   *   0x539032..0x539045  self[+0x00] = objc_msgSend(rax, sel_initWithSource:,
   *                                                  source)
   *                        (the tool mislabels the send; the argument shape
   *                        is 2-arg + object-return, so it's the standard
   *                        alloc/init pair.)
   *   0x539048..0x53904b  testq %rax ; je 0x539062                      ; if
   *                        init returned nil, bypass streamDescription.
   *   0x53904d..0x53905b  session != nil branch:
   *                        objc_msgSend_stret(&outStruct(-0x50(%rbp)), session,
   *                                            sel_streamDescription)
   *                        — 40-byte return in the stret buffer.
   *   0x539060            jmp to common tail.
   *   0x539062..0x53906d  session == nil branch:
   *                        zero-fill -0x50..-0x21 (48 bytes) — outStruct all
   *                        zeroes. This yields an all-zero ASBD when no
   *                        session was obtained.
   *   0x539075..0x53908a  common tail — copy outStruct into self[+0x08..+0x2f]:
   *                          self[+0x28] = qword at -0x30(%rbp)   (mReserved)
   *                          self[+0x18..+0x27] = xmm1 (16 bytes)  (mFramesPerPacket
   *                                                                 through
   *                                                                 mChannelsPerFrame)
   *                          self[+0x08..+0x17] = xmm0 (16 bytes)  (mSampleRate,
   *                                                                 mFormatID,
   *                                                                 mFormatFlags,
   *                                                                 mBytesPerPacket)
   *                        NB: r14 in the asm is `self+0x08`, so `r14[+0x20]`
   *                        is `self[+0x28]`, `r14[+0x10]` is `self[+0x18]`,
   *                        etc.
   *   0x53908e..0x539093  esi = (i32)cvttsd2si(self[+0x08])            ; sampleRate
   *                        truncated to a i32 for CMTimeConvertScale's
   *                        `newTimescale` argument. The truncation is toward
   *                        zero, matching CoreMedia's convention that
   *                        timescales are always positive integers.
   *   0x539098..0x5390b8  CMTimeConvertScale(&out(-0x50(%rbp)),
   *                                          range.start,
   *                                          (i32)sampleRate,
   *                                          method = 6);
   *                        self[+0x30] = out.value (the CMTimeValue field).
   *                        NB: only the .value low-i64 is stored — the
   *                        rescaled timescale is implicitly sampleRate.
   *   0x5390bc..0x5390df  CMTimeRangeGetEnd(&outCMTime(-0x68(%rbp)), range)
   *                        — computes range.start + range.duration.
   *   0x5390e4            esi = (i32)cvttsd2si(self[+0x08])            ; re-read
   *                        sampleRate (the value could not have changed but
   *                        the compiler re-reads it because it's cheap and
   *                        avoids reserving an xmm register across the
   *                        CMTimeRangeGetEnd call).
   *   0x5390e9..0x53910c  CMTimeConvertScale(&out(-0x50(%rbp)),
   *                                          rangeEndCMTime,
   *                                          (i32)sampleRate,
   *                                          method = 5);
   *                        self[+0x38] = out.value.
   *   0x539110..0x53911f  epilogue, retq.
   */
  constructor(source: FFStreamAudio, range: CMTimeRange) {
    // @Flexo 0x53900c — self[+0x00] = null.
    this._session = null;

    // @Flexo 0x53901a — default-construct the ASBD.
    // We use a synthetic all-zero ASBD until CAStreamBasicDescription is
    // ported; the stub throws to surface the frontier.
    CAStreamBasicDescription_C1_stub({} as CAStreamBasicDescription);

    // @Flexo 0x53901f..0x539022 — zero the cursors.
    this._startFrame = 0n;
    this._endFrame = 0n;

    // @Flexo 0x539026..0x53903f — objc_alloc + initWithSource:.
    const raw = objc_alloc_stub(OBJC_CLASS_FFStreamAudioRenderSession_stub);
    const session = objc_msgSend_session_initWithSource_stub(raw, source);

    // @Flexo 0x539045 — self[+0x00] = session (may be nil).
    this._session = session;

    // @Flexo 0x539048..0x53906d — populate ASBD.
    let asbd: CAStreamBasicDescription;
    if (session !== null) {
      // @Flexo 0x53904d..0x53905b — streamDescription getter (stret).
      asbd = objc_msgSend_stret_session_streamDescription_stub(session);
    } else {
      // @Flexo 0x539062..0x53906d — all-zero ASBD.
      asbd = { mSampleRate: 0 } as CAStreamBasicDescription;
    }

    // @Flexo 0x539075..0x53908a — install the ASBD.
    this._asbd = asbd;

    // @Flexo 0x53908e — sampleRate = (i32)cvttsd2si(asbd.mSampleRate).
    // Math.trunc matches cvttsd2si's "round toward zero" semantic for
    // representable-i32 values; out-of-range values would trap in the CPU
    // (setting int-indefinite 0x80000000), but CoreAudio guarantees
    // mSampleRate is a positive double so the truncation is exact.
    const sampleRate: number = Math.trunc(asbd.mSampleRate) | 0;

    // @Flexo 0x539098..0x5390b8 — start.value in sampleRate ticks.
    const rescaledStart = CMTimeConvertScale_stub(
      range.start,
      sampleRate,
      /* method */ 6,
    );
    this._startFrame = rescaledStart.value;

    // @Flexo 0x5390bc..0x5390df — endCMTime = range.start + range.duration.
    const endCM = CMTimeRangeGetEnd_stub(range);

    // @Flexo 0x5390e4 — re-truncate sampleRate.
    const sampleRate2: number = Math.trunc(asbd.mSampleRate) | 0;

    // @Flexo 0x5390e9..0x53910c — end.value in sampleRate ticks.
    const rescaledEnd = CMTimeConvertScale_stub(
      endCM,
      sampleRate2,
      /* method */ 5,
    );
    this._endFrame = rescaledEnd.value;
  }

  /**
   * D1/D2 destructor — FFLoudnessAnalyzerInputReader::~FFLoudnessAnalyzerInputReader()
   *   D2 @Flexo 0x0000000000539130 .. 0x000000000053913e
   *   D1 @Flexo 0x0000000000539150 .. 0x000000000053915e
   *
   * Both bodies are byte-for-byte identical (modulo the RIP offset of the
   * _objc_release stub):
   *
   *   0x539130 pushq %rbp / movq %rsp,%rbp
   *   0x539134 movq  (%rdi),%rdi                 ; rdi = self[+0]
   *   0x539137 callq *&_objc_release             ; release the session
   *   0x53913d popq %rbp / retq
   *
   * The CAStreamBasicDescription @+0x08 is a value type (its ctor was
   * `= default` — no owned resources), and the two i64 cursors need no
   * teardown, so only the session at +0x00 needs objc_release.
   *
   * Note: the release runs unconditionally — objc_release safely no-ops on
   * a nil receiver, so no null-check is needed. The tail `___clang_call_terminate`
   * landing pad is the compiler's synthesised handler for the impossible
   * case where objc_release itself throws (an ObjC exception during
   * -[dealloc]).
   */
  D_destructor(): void {
    // @Flexo 0x539137 / 0x539157 — objc_release(session). Safe on nil.
    if (this._session !== null) {
      objc_release_stub(this._session);
    }
  }

  /**
   * pullFrames — FFLoudnessAnalyzerInputReader::pullFrames(
   *   unsigned long long numFrames, AudioBufferList* buffer, bool* done)
   *   @Flexo 0x0000000000539170 .. 0x00000000005391fc
   *
   * Faithful decode:
   *
   *   0x539170..0x539184  prologue, r14 = numFrames, rbx = &done,
   *                        rdx (buffer) → later saved to r12.
   *   0x539187            rsi = self[+0x30]                       ; startFrame
   *   0x53918b..0x53918f  cmpq  self[+0x38],rsi ; jae 0x5391dc     ; if
   *                        startFrame >= endFrame, jump to the zero-fill
   *                        path (done = true).
   *
   *   Happy path @0x539191..0x5391da:
   *     0x539191 r15 = self[+0x00]                                ; session
   *     0x539194 eax = (i32)cvttsd2si(self[+0x08])                ; sampleRate
   *     0x539199 rcx = &out(-0x40(%rbp))                          ; CMTime out
   *     0x53919d r13 = self
   *     0x5391a0..0x5391a8  CMTimeMake(&out, startFrame, (i32)sampleRate)
   *     0x5391ad rsi = @selector(pullFrames:count:into:)          ; RIP-const
   *     0x5391b4 rax = out.epoch (or the CMTime's tail qword @-0x30(%rbp))
   *     0x5391b8 stack[16] = rax
   *     0x5391bd..0x5391c1 stack[0..15] = out (first 16 bytes of CMTime)
   *     0x5391c5..0x5391cb rdi=session, rdx=buffer, ecx=(u32)numFrames
   *     0x5391ce callq *&_objc_msgSend
   *              [session pullFrames:startCMTime count:numFrames into:buffer]
   *     0x5391d4 self[+0x30] += r14                               ; advance
   *                                                                cursor
   *     0x5391d8 eax = 0                                          ; done=false
   *     0x5391da jmp 0x5391ec
   *
   *   Zero-fill path @0x5391dc..0x5391ea:
   *     0x5391dc rdi = buffer                                     ; rdx
   *                                                                (buffer)
   *                                                                had been
   *                                                                held in
   *                                                                rdx from
   *                                                                arg2
   *     0x5391df..0x5391e3 zero out the three helper-arg registers
   *     0x5391e5 callq zeroAudioBufferList(buffer, 0, 0, 0)
   *     0x5391ea al = 1                                           ; done=true
   *
   *   Tail @0x5391ec..0x5391fc:
   *     0x5391ec *done = al                                        ; caller
   *                                                                bool*
   *     0x5391ee..0x5391fc epilogue, retq
   *
   * Semantic summary: "pullFrames advances the read cursor by numFrames
   * samples if there's enough range left, delegating the actual buffer fill
   * to the session's -pullFrames:count:into: selector; if the cursor is
   * exhausted, it zero-fills the caller's buffer and reports done=true."
   */
  pullFrames(
    numFrames: bigint,
    buffer: AudioBufferList,
    done: { value: boolean },
  ): void {
    // @Flexo 0x539187..0x53918f — cursor-vs-end check.
    if (this._startFrame >= this._endFrame) {
      // @Flexo 0x5391dc..0x5391ea — zero-fill path.
      zeroAudioBufferList_stub(buffer, 0, 0, 0);
      // @Flexo 0x5391ea/0x5391ec — done = true.
      done.value = true;
      return;
    }

    // @Flexo 0x539191..0x5391cb — happy path.
    const session = this._session;
    if (session === null) {
      // Not exercised by any known FCP path — if _session was null, the
      // startFrame/endFrame both fall to 0 (see ctor's `else` branch), so
      // the cursor check above already fires. But to match the asm's
      // unconditional dereference we surface the invariant.
      throw new Error(
        "FFLoudnessAnalyzerInputReader::pullFrames: session slot @+0x00 is " +
          "null on happy path. @Flexo 0x539191 reads it unconditionally.",
      );
    }
    if (this._asbd === null) {
      // Same invariant surfacing for the sampleRate read.
      throw new Error(
        "FFLoudnessAnalyzerInputReader::pullFrames: asbd slot @+0x08 is null. " +
          "@Flexo 0x539194 reads self[+0x08] as a double sampleRate.",
      );
    }

    // @Flexo 0x539194 — sampleRate = (i32)cvttsd2si(asbd.mSampleRate).
    const sampleRate: number = Math.trunc(this._asbd.mSampleRate) | 0;

    // @Flexo 0x5391a0..0x5391a8 — CMTimeMake(startFrame, sampleRate).
    const startCM = CMTimeMake_stub(this._startFrame, sampleRate);

    // @Flexo 0x5391ad..0x5391ce — [session pullFrames:startCM
    //                              count:numFrames into:buffer].
    // The u32 truncation of numFrames (`movl %r14d,%ecx` at 0x5391cb) is
    // matched by BigInt-to-Number truncation via `Number(x & 0xffffffffn)`.
    // The session's selector expects a plain u32 count.
    objc_msgSend_session_pullFrames_stub(
      session,
      startCM,
      numFrames,
      buffer,
    );

    // @Flexo 0x5391d4 — startFrame += numFrames.
    this._startFrame = this._startFrame + numFrames;

    // @Flexo 0x5391d8/0x5391ec — done = false.
    done.value = false;
  }
}
