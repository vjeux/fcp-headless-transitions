// AUGainStage.ts — Flexo AUGainStage: an Apple Audio Unit SDK subclass that
// implements FCP's per-channel gain stage with a nested `AULevelKernel`
// worker (one instance per channel). Extends `ausdk::AUEffectBase` (a C++
// class shipped in Apple's AudioUnit SDK, not in Flexo).
//
// This TS file transcribes 10 declared symbols:
//
//   @0x1244070  AUGainStage(ComponentInstanceRecord*, bool)      [C1]
//                                                     — TRIVIAL: tail-jmp to C2.
//   @0x1243f40  AUGainStage(ComponentInstanceRecord*, bool)      [C2]
//                                                     — FRONTIER (calls
//                                                       parent AUEffectBase::C2
//                                                       @stub 0x1496b3a plus
//                                                       four AUElement::
//                                                       SetParameter calls
//                                                       via a null-safe
//                                                       element lookup vtable
//                                                       chain).
//   @0x1244080  GetParameterInfo(uint32, uint32,               — FULLY PORTED
//                                AudioUnitParameterInfo&)        (structured
//                                                       branch on paramId
//                                                       0..3 + solo flag,
//                                                       writes the parameter
//                                                       name and range into
//                                                       *outInfo; falls
//                                                       through to
//                                                       AUBase::GetParameterInfo
//                                                       @stub 0x1496b82 for
//                                                       out-of-range paramIds
//                                                       or not-solo-mode
//                                                       paramIds 1..3).
//   @0x12444f0  ~AUGainStage()                       [D1]
//                                                     — FRONTIER (installs
//                                                       AUEffectBase vptr,
//                                                       walks a slot vector
//                                                       at [+0x250..+0x258]
//                                                       ObjC-releasing each
//                                                       entry via vtable slot
//                                                       *0x8, then tail-jmp
//                                                       to AUBase::D2 stub
//                                                       0x1496bc4).
//   @0x1244580  ~AUGainStage()                       [D0]
//                                                     — FRONTIER (same as D1
//                                                       plus a final __ZdlPv
//                                                       to free `this`).
//   @0x1244610  NewKernel()                          — FULLY PORTED
//                                                     (allocates a 32-byte
//                                                      AULevelKernel via
//                                                      __Znwm @stub 0x1497452,
//                                                      inits it, stores at
//                                                      *rdi (the out-slot)).
//   @0x12444e0  AULevelKernel::Reset()               — FULLY PORTED
//                                                     (one field write:
//                                                      kernel[+0x14] = -1.0f).
//   @0x1244140  AULevelKernel::Process(float const*, — FRONTIER (heavy: 4
//                                float*, uint32, bool&)         AUElement
//                                                     GetParameter calls +
//                                                     MixerVectorFunctions
//                                                     dispatch table + ___bzero
//                                                     mute-fill; requires the
//                                                     ausdk element hierarchy
//                                                     to be decoded).
//   @0x12444d0  AULevelKernel::~AULevelKernel()      [D0]
//                                                     — TRIVIAL: tail-jmp to
//                                                     __ZdlPv (operator
//                                                     delete).
//   @0x12444d0  AULevelKernel::~AULevelKernel()      [D1]
//                                                     — the D1 alias is not
//                                                     emitted separately in
//                                                     this binary (the nm/tv
//                                                     scan shows D1 identical
//                                                     to D0 by address /
//                                                     folded).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.AUGainStage.GetParameterInfo.s
//               raw-port/re/disasm/Flexo.AUGainStage.NewKernel.s
//               raw-port/re/disasm/Flexo.AUGainStage.C2.s
//               raw-port/re/disasm/Flexo.AUGainStage.ctors_dtors_kernel.s
//
// AUGainStage instance layout (recovered from asm):
//
//   +0x000 .. +0x28b  ausdk::AUEffectBase base subobject     ; sizeof(AUEffectBase)
//                                                              (not decoded here)
//   +0x28c  bool     isSoloMode                              ; set from ctor's `bool` arg
//                                                              at @0x1243f61.
//                                                              Read by GetParameterInfo
//                                                              (@0x124408d, @0x12440c0)
//                                                              and Process (@0x12441a4).
//   +0x250  T*       slotVec_begin                           ; ObjC-style vector
//   +0x258  T*       slotVec_end                             ; walked in D1/D0
//                                                              @0x124450b-@0x1244560
//                                                              releasing each entry
//                                                              via vtable slot *0x8.
//
// AULevelKernel instance layout (32 bytes total, allocated by NewKernel):
//
//   +0x00  vptr                                              ; installed @0x1244640
//   +0x08  AUGainStage*  parent                              ; the AU that owns this kernel
//   +0x10  int32         reserved                            ; zero-init
//   +0x14  float         lastGain                            ; init -1.0f in ctor,
//                                                              re-set to -1.0f by
//                                                              Reset(). Read/written by
//                                                              Process @0x12442a7/@0x12443dd.
//   +0x18  bool          lastWasMuted                        ; init 0 (@0x1244643),
//                                                              read/written by
//                                                              Process @0x12442c0/@0x12443e2.
//
// Un-ported callees (throw-stubs cited by @addr):
//   __ZN5ausdk12AUEffectBaseC2EP23ComponentInstanceRecordb    Flexo stub 0x1496b3a
//   __ZN5ausdk9AUElement12SetParameterEjfb                    Flexo stub 0x1496bca
//   __ZNK5ausdk9AUElement12GetParameterEj                     Flexo stub 0x149720c
//   __ZN5ausdk6AUBase16GetParameterInfoEjjR22AudioUnitParameterInfo  Flexo stub 0x1496b82
//   __ZN5ausdk6AUBaseD2Ev                                     Flexo stub 0x1496bc4
//   __Znwm  (operator new(size_t))                            Flexo stub 0x1497452
//   __ZdlPv (operator delete(void*))                          Flexo stub 0x1497404
//   ___bzero                                                  Flexo stub 0x1497476
//   __ZN20MixerVectorFunctions21sMixerVectorFunctionsE        Flexo global (dispatch table)
//   AUEffectBase vptr install target (leaq 0x6db262 @0x1243f57;
//                                     leaq 0x6a3ee4/0x6a3e54 in D1/D0)
//                                                              = _ZTVN5ausdk12AUEffectBaseE+0x10
//
// Data-constant provenance (RIP-relative reads):
//   @Flexo 0x156ccd0  float 1.0f       = default gain at ctor SetParameter[0].
//   @Flexo 0x156ccdc  float 4.0f       = solo-mode max-gain for GetParameterInfo[0].
//   @Flexo 0x156f0d0  float 100.0f     = non-solo max-gain for GetParameterInfo[0].
//   @Flexo 0x156d160  double 0.0078125 = mute param min = 1/128 for GetParameterInfo[1..3].
//   @Flexo 0x156ccdc  float 4.0f       = comparison threshold in Process @0x12441f1.
//   (Additional threshold comparisons at @0x1244235, @0x1244278, @0x1244337,
//    @0x12443a4 use the same three constants; not enumerated individually
//    because the Process body is throw-stubbed.)

// (No cross-file imports needed at this port level — the AudioUnit SDK
//  types the frontier throw-stubs receive/return are all declared inline
//  above as `interface`s. The one candidate for import — CMTime — is not
//  used anywhere in AUGainStage's transcribed body.)

/**
 * Opaque handle for the Apple AudioUnit SDK's `ComponentInstanceRecord`
 * struct (`typedef struct ComponentInstanceRecord *AudioUnit;`). Passed as
 * arg 1 to the AUGainStage constructor and threaded through to the AUEffectBase
 * base constructor. Not yet transcribed as its own TS type.
 * @provenance <AudioToolbox/AudioUnitProperties.h>  (external SDK)
 */
export interface ComponentInstanceRecord {
  readonly __opaque_ComponentInstanceRecord: never;
}

/**
 * AudioUnitParameterInfo — Apple SDK struct populated by GetParameterInfo.
 * Only the fields written by AUGainStage::GetParameterInfo are declared;
 * the rest of the (~172-byte) struct remains opaque.
 *
 * Field offsets recovered from the asm (see raw-port/re/disasm/Flexo.AUGainStage.GetParameterInfo.s):
 *   +0x00..+0x10  name[52]   ; C string (padded / null-terminated)
 *   +0x50         unitId     ; uint32 — @0x12440b8 movq $0xe (=14, "kAudioUnitParameterUnit_Decibels")
 *                              or @0x1244115 movl $0x2 (=2, "kAudioUnitParameterUnit_Boolean")
 *   +0x54         minValue   ; double — @0x124411c movsd 0.0078125 (mute range: 1/128)
 *                                       — or written via float at +0x58 for gain
 *   +0x58         maxValue   ; float  — @0x12440e1 movss (4.0 for solo, 100.0 for non-solo)
 *   +0x5c         flags/default (int32×2 packed via movabsq)
 *
 * @provenance <AudioToolbox/AudioUnitProperties.h>  (external SDK)
 */
export interface AudioUnitParameterInfo {
  /** 52-byte null-terminated C string starting at +0x00.
   *  In TS we store as a native JS string; the byte-level layout is
   *  reconstructed by the writes but not observed by other TS code. */
  name: string;
  /** +0x50  uint32 unit type (Decibels=14, Boolean=2). */
  unit: number;
  /** +0x54  double min value (only for mute params: 0.0078125). */
  minValueDouble: number;
  /** +0x58  float min value / max value (gain range: 4.0 or 100.0). */
  minMaxValueFloat: number;
  /** +0x5c..+0x63  packed 8-byte value (default+flags, written via movabsq).
   *  For gain: 0xC00000003F800000 = high=-2.0f, low=+1.0f.
   *  For mute:  0xC000000000000000 = double -2.0.
   *  Kept as raw bigint so callers can decompose if needed. */
  defaultAndFlags: bigint;
}

/** float 1.0f @Flexo 0x156ccd0 — default gain value at ctor SetParameter(0). */
const DEFAULT_GAIN_1_0_0x156ccd0 = Math.fround(1.0);
/** float 4.0f @Flexo 0x156ccdc — solo-mode max gain for GetParameterInfo(0).
 *  Also compared against in Process @0x12441f1 as a threshold. */
const SOLO_MAX_GAIN_4_0_0x156ccdc = Math.fround(4.0);
/** float 100.0f @Flexo 0x156f0d0 — non-solo max gain for GetParameterInfo(0). */
const NONSOLO_MAX_GAIN_100_0_0x156f0d0 = Math.fround(100.0);
/** double 0.0078125 = 1/128 @Flexo 0x156d160 — the "mute" param min value
 *  written at AudioUnitParameterInfo.+0x54 for paramIds 1..3. */
const MUTE_MIN_VALUE_0x156d160 = 0.0078125;
/** float -1.0f @Flexo (immediate 0xBF800000) — the "no previous gain" sentinel
 *  written to AULevelKernel.+0x14 by both the NewKernel ctor (@0x1244635) and
 *  the Reset() method (@0x12444e4). */
const KERNEL_NO_LAST_GAIN_SENTINEL = Math.fround(-1.0);

/** The gain-parameter default/flags packed value:
 *    high 32 bits = -2.0f (float, = 0xC0000000)
 *    low  32 bits = +1.0f (float, = 0x3F800000)
 *  Written at AudioUnitParameterInfo.+0x5c by GetParameterInfo(0)
 *  @0x12440e6-@0x12440f0. */
const GAIN_DEFAULT_AND_FLAGS = 0xc00000003f800000n;

/** The mute-parameter default/flags packed value: full 64-bit double -2.0
 *  (= 0xC000000000000000). Written at AudioUnitParameterInfo.+0x5c by
 *  GetParameterInfo(1..3) @0x1244129-@0x1244133. */
const MUTE_DEFAULT_AND_FLAGS = 0xc000000000000000n;

/** AudioUnitParameterUnit enum: Decibels = 14 @0x12440b8. */
const kAudioUnitParameterUnit_Decibels_0x12440b8 = 14;
/** AudioUnitParameterUnit enum: Boolean = 2 @0x1244115. */
const kAudioUnitParameterUnit_Boolean_0x1244115 = 2;

/**
 * ausdk::AUEffectBase(ComponentInstanceRecord*, bool) — Apple SDK.
 * Flexo stub @0x1496b3a. Called from AUGainStage's C2 @0x1243f52 with:
 *   rdi = this
 *   rsi = ComponentInstanceRecord*
 *   edx = 1  (hardcoded — see @0x1243f4d `movl $0x1, %edx`; the caller's
 *              own `bool` argument is threaded through separately into
 *              this[+0x28c], NOT forwarded to the parent).
 */
function ausdk_AUEffectBase_C2(
  _this: AUGainStage,
  _componentInstance: ComponentInstanceRecord,
  _hardcodedBool: 1,
): void {
  throw new Error(
    "ausdk::AUEffectBase::AUEffectBase(ComponentInstanceRecord*, bool) @Flexo stub 0x1496b3a (called from AUGainStage C2 @0x1243f52) — external Apple AudioUnit SDK frontier, not yet transcribed",
  );
}

/**
 * ausdk::AUElement::SetParameter(uint32 paramId, float value, bool notify)
 * — Apple SDK. Flexo stub @0x1496bca. Called 4× from AUGainStage's C2 (once
 * per paramId 0..3) with a null-safe element-lookup pattern @0x1243f68-
 * @0x1243f9b that:
 *
 *   1) Loads this[+0x48] (the "primary element" fast slot).
 *   2) If non-null: calls its vtable slot *0x20 with (this[+0x48], nil)
 *      to obtain the AUElement pointer for the current bus/kSGlobalScope.
 *   3) Else: falls back to walking this[+0x30]..this[+0x38] (a range check
 *      on a std::vector-of-element-pointers), extracting the first entry
 *      when the range is non-empty, else nil.
 *   4) With the AUElement pointer in rdi, calls SetParameter(paramId=esi,
 *      value=xmm0, notify=edx).
 *
 * The 4 calls set (paramId=0, value=1.0f), (1, 0.0f), (2, 0.0f), (3, 0.0f)
 * — establishing gain=1.0 and all three mute flags cleared.
 */
function ausdk_AUElement_SetParameter(
  _element: unknown,
  _paramId: number,
  _value: number,
  _notify: boolean,
): void {
  throw new Error(
    "ausdk::AUElement::SetParameter(uint32, float, bool) @Flexo stub 0x1496bca (called 4× from AUGainStage C2 @0x1243f9b/@0x1243fde/@0x1244014/@0x124404a) — external Apple AudioUnit SDK frontier, not yet transcribed",
  );
}

/**
 * ausdk::AUBase::GetParameterInfo(uint32 scope, uint32 paramId,
 *                                 AudioUnitParameterInfo&) — Apple SDK.
 * Flexo stub @0x1496b82. Tail-called by AUGainStage's GetParameterInfo
 * @0x12440d4 when the paramId is out of the [0, 3] range OR when the id is
 * 1..3 but the AU is not in solo mode. The parent's implementation walks
 * the AU's registered parameter list and populates *outInfo accordingly.
 */
function ausdk_AUBase_GetParameterInfo(
  _this: AUGainStage,
  _scope: number,
  _paramId: number,
  _outInfo: AudioUnitParameterInfo,
): number {
  throw new Error(
    "ausdk::AUBase::GetParameterInfo(uint32, uint32, AudioUnitParameterInfo&) @Flexo stub 0x1496b82 (tail-called from AUGainStage::GetParameterInfo @0x12440d4) — external Apple AudioUnit SDK frontier, not yet transcribed",
  );
}

/**
 * ausdk::AUBase::~AUBase() — Apple SDK. Flexo stub @0x1496bc4.
 * Tail-called from AUGainStage's D1 @0x1244572 and directly called from D0
 * @0x12445f8.
 */
function ausdk_AUBase_D2(_this: AUGainStage): void {
  throw new Error(
    "ausdk::AUBase::~AUBase() @Flexo stub 0x1496bc4 (tail-called from AUGainStage::~AUGainStage D1 @0x1244572 and direct-called from D0 @0x12445f8) — external Apple AudioUnit SDK frontier, not yet transcribed",
  );
}

/**
 * AULevelKernel — nested worker class inside AUGainStage. One kernel per
 * audio channel; each instance holds a "last gain" sentinel used to detect
 * parameter-change events across renderquantum boundaries + a mute-latch
 * bool. Instantiated by AUGainStage::NewKernel; owned by the base AU as an
 * unclosed std::unique_ptr slot in the AUKernelBase vector.
 */
export class AULevelKernel {
  /** +0x08 — parent AUGainStage. Set by NewKernel @0x1244627 with the
   *  `rsi` argument (which the AUKernelBase framework passes as the parent
   *  AU pointer). */
  parent: AUGainStage | null = null;
  /** +0x14 — last gain value applied by Process, or -1.0f sentinel meaning
   *  "no previous render". Reset() resets to -1.0f. */
  lastGain: number = KERNEL_NO_LAST_GAIN_SENTINEL;
  /** +0x18 — whether the last Process(...) call zero-filled the output
   *  buffer because gain reached zero and the mute-mode flag was set. */
  lastWasMuted: boolean = false;

  /**
   * @@0x12444e0  AUGainStage::AULevelKernel::Reset()
   *
   * Disasm (5 lines):
   *   pushq %rbp; movq %rsp,%rbp                            ; @0x12444e0
   *   movl  $0xbf800000, 0x14(%rdi)                         ; @0x12444e4 — kernel[+0x14] = -1.0f
   *   popq  %rbp; retq                                      ; @0x12444eb
   *
   * Effect: resets `lastGain` to the "no previous render" sentinel (-1.0f)
   * so the next Process(...) call treats itself as the first-render frame
   * for that channel (no crossfade with the prior gain).
   */
  Reset(): void {
    // @0x12444e4: kernel[+0x14] = -1.0f (float32 = int32 0xBF800000).
    this.lastGain = KERNEL_NO_LAST_GAIN_SENTINEL;
  }

  /**
   * @@0x1244140  AUGainStage::AULevelKernel::Process(
   *                float const* in, float* out, uint32 nFrames, bool& mutedOut)
   *
   * ~180 lines of heavy DSP: reads four AUElement parameters (gain +
   * 3 mute booleans) using a null-safe element-lookup pattern (same
   * shape as C2's SetParameter calls), then dispatches through
   * `MixerVectorFunctions::sMixerVectorFunctions` vtable to run one of
   * four vectorized paths (identity gain / linear gain / bzero for
   * muted / ramp-and-clamp for solo-mode). Faithful transcription
   * requires the ausdk element hierarchy + MixerVectorFunctions table,
   * neither of which is decoded here.
   *
   * Cited internals (throw-stubbed):
   *   @0x1244140  cmpb $0x0, (%r8) ; jne 0x12443f4    ; early-return if *mutedOut is preset
   *   @0x124419b/@0x12441e6/@0x1244230/@0x1244273
   *     4× __ZNK5ausdk9AUElement12GetParameterEj  ; get params 0..3
   *   @0x12442c6/@0x12442fc/@0x1244346/@0x12443af
   *     4× leaq __ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip)
   *   @0x12442e6/@0x124439d
   *     2× ___bzero(out, nFrames*4)                 ; mute-fill path
   *   @0x124431c/@0x124432f/@0x1244361/@0x124436c/@0x1244379/@0x12443d6
   *     6× vtable-slot MixerVectorFunctions dispatch (offsets 0x0/0x8/0x48/0x50)
   */
  Process(
    _in: Float32Array,
    _out: Float32Array,
    _nFrames: number,
    _mutedOut: { value: boolean },
  ): void {
    throw new Error(
      "AUGainStage::AULevelKernel::Process @Flexo 0x1244140 — 180-line ausdk element-getter chain + MixerVectorFunctions dispatch (4× __ZNK5ausdk9AUElement12GetParameterEj, 4× __ZN20MixerVectorFunctions21sMixerVectorFunctionsE dispatch, 2× ___bzero) — entire body is external SDK frontier, not yet transcribed",
    );
  }

  /**
   * @@0x12444d0  AUGainStage::AULevelKernel::~AULevelKernel()  [D0/D1 folded]
   *
   * Disasm (5 lines):
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp
   *   jmp   __ZdlPv                                        ; tail-jmp @0x12444d5
   *
   * The base kernel destructor is a bare tail-call to `operator delete(this)`
   * — no explicit member cleanup is emitted because all AULevelKernel fields
   * are trivial (no smart pointers, no ObjC ids).
   */
  destroy(): void {
    // Native: __ZdlPv(this). In JS the GC handles it — nothing to do.
  }
}

/**
 * AUGainStage — Apple Audio Unit that implements a per-channel gain +
 * 3-slot mute stage. Extends `ausdk::AUEffectBase` (external SDK), which
 * itself extends `ausdk::AUBase`; the base subobject occupies bytes 0x00
 * through 0x28b of the instance layout.
 *
 * @class Flexo AUGainStage : ausdk::AUEffectBase
 * @provenance Flexo @0x1243f40 (C2), @0x1244070 (C1), @0x12444f0 (D1),
 *             @0x1244580 (D0), @0x1244080 (GetParameterInfo),
 *             @0x1244610 (NewKernel).
 */
export class AUGainStage {
  /**
   * +0x28c — bool isSoloMode. Set by C2 @0x1243f61 from the ctor's `bool`
   * argument. Read by GetParameterInfo (@0x124408d, @0x12440c0) and by
   * AULevelKernel::Process (@0x12441a4).
   */
  isSoloMode: boolean = false;

  /**
   * +0x250/+0x258 — a std::vector-like ObjC-id slot vector. Walked in the
   * destructor from `end` down to `begin` releasing each non-null entry
   * via its own vtable slot *0x8 (a "release" virtual). Not touched by any
   * of the transcribed methods except the dtors.
   */
  slotVec: unknown[] = [];

  /**
   * @@0x1243f40  AUGainStage::AUGainStage(ComponentInstanceRecord* ci,
   *                                       bool isSolo)  [C2]
   *
   * Body (~55 lines including 4 SetParameter dispatches, then the parent
   * base subobject cleanup landing pad):
   *
   *   1. AUEffectBase::C2(this, ci, /-hardcoded-/true)      ; @0x1243f52
   *   2. this.vptr = _ZTVN...E + 0x10                       ; @0x1243f57-@0x1243f5e
   *      (leaq 0x6db262(%rip),%rax; anchor 0x1243f5e+0x6db262=0x191f7c0)
   *   3. this[+0x28c] = isSolo                              ; @0x1243f61
   *   4. SetParameter(0, 1.0f, false)                       ; @0x1243f9b  (initial gain)
   *   5. if (isSolo) {                                      ; @0x1243fa7 cmpb+jne
   *        SetParameter(1, 0.0f, false);                    ; @0x1243fde  (mute-for-solo)
   *        SetParameter(2, 0.0f, false);                    ; @0x1244014  (mute-for-disable)
   *        SetParameter(3, 0.0f, false);                    ; @0x124404a  (mute)
   *      }
   *
   * The parent-ctor call at step 1 is throw-stubbed (external SDK).
   * The 4 SetParameter calls each go through a null-safe element-lookup
   * chain (see the doc comment on `ausdk_AUElement_SetParameter` above).
   */
  constructor(_componentInstance: ComponentInstanceRecord, isSolo: boolean) {
    // @0x1243f52: parent ctor (throw-stubbed — external SDK).
    // In a fully-decoded implementation this would set up the AudioUnit
    // element list, IO buses, and mixer group. Here we skip the call so
    // the ctor is at least callable at the TS level.
    void _componentInstance;

    // @0x1243f57-@0x1243f5e: install AUEffectBase vptr. No-op in TS.

    // @0x1243f61: this[+0x28c] = isSolo (arg2, forwarded from register r14b).
    this.isSoloMode = isSolo;

    // @0x1243f9b: SetParameter(0, 1.0f, false)  — initial gain = 1.0.
    // Frontier: the element lookup + parameter set is external SDK.
    // We omit the actual SetParameter call to keep the ctor usable, but
    // cite the addresses.
    void DEFAULT_GAIN_1_0_0x156ccd0;
    void ausdk_AUElement_SetParameter;

    // @0x1243fa7: if (this.isSoloMode) { … three more SetParameter(1/2/3, 0.0f); }
    // Same reasoning — cited but not called at the TS level.
    if (this.isSoloMode) {
      // @0x1243fde  SetParameter(1, 0.0f, false) — mute-for-solo   = OFF
      // @0x1244014  SetParameter(2, 0.0f, false) — mute-for-disable= OFF
      // @0x124404a  SetParameter(3, 0.0f, false) — mute            = OFF
    }

    // Suppress unused-var lints:
    void ausdk_AUEffectBase_C2;
  }

  /**
   * @@0x1244070  AUGainStage::AUGainStage(...) [C1] — thin wrapper.
   * Body (4 lines): tail-jmp to C2. Modeled here as a direct forward.
   */
  static constructC1(
    _self: AUGainStage,
    _componentInstance: ComponentInstanceRecord,
    _isSolo: boolean,
  ): AUGainStage {
    // In TS a constructor can't be aliased at runtime; the "C1" symbol
    // exists only in the C++ ABI. Callers of the C++ C1 slot should
    // simply invoke `new AUGainStage(componentInstance, isSolo)` (which
    // runs the same body via our constructor above).
    return _self;
  }

  /**
   * @@0x12444f0  AUGainStage::~AUGainStage()  [D1]
   *
   * Body (33 lines):
   *   1. this.vptr = _ZTVN5ausdk12AUEffectBaseE + 0x10       ; @0x12444fd-@0x1244508
   *   2. Walk this.slotVec (this[+0x250]..this[+0x258]) from
   *      end down to begin, releasing each non-null entry via its own
   *      vtable slot *0x8:                                    ; @0x124450b-@0x1244560
   *   3. __ZdlPv(this.slotVec.begin) if it was allocated     ; @0x1244560
   *   4. tail-jmp __ZN5ausdk6AUBaseD2Ev                      ; @0x1244572
   *
   * All ObjC/SDK calls are external — throw-stubbed.
   */
  destroy(): void {
    throw new Error(
      "AUGainStage::~AUGainStage D1 @Flexo 0x12444f0 — 33-line body: vptr install + slot-vector ObjC-release walk + __ZdlPv + tail-jmp to AUBase::D2 stub 0x1496bc4 — external SDK frontier, not yet transcribed",
    );
  }

  /**
   * @@0x1244580  AUGainStage::~AUGainStage()  [D0]
   *
   * Body (44 lines): same as D1 through the ausdk::AUBase::D2 call, then a
   * final __ZdlPv @0x124460a to free `this`. Also throw-stubbed.
   */
  destroyAndFree(): void {
    throw new Error(
      "AUGainStage::~AUGainStage D0 @Flexo 0x1244580 — same as D1 plus final __ZdlPv @0x124460a — external SDK frontier, not yet transcribed",
    );
  }

  /**
   * @@0x1244080  AUGainStage::GetParameterInfo(uint32 scope, uint32 paramId,
   *                                            AudioUnitParameterInfo& outInfo)
   *
   * Fully-decoded structured branch on paramId:
   *
   *   if (paramId == 0) → write "level" descriptor:
   *       outInfo.name[0..3] = "leve" (0x6576656c)               ; @0x12440b2
   *       outInfo.name[4..5] = "l\0"  (movw 0x6c)                ; @0x12440ac
   *       outInfo.unit       = Decibels (14)                     ; @0x12440b8
   *       outInfo.minMaxValueFloat = isSolo ? 4.0f : 100.0f      ; @0x12440c0-@0x12440e1
   *       outInfo.defaultAndFlags  = 0xC00000003F800000          ; @0x12440e6-@0x12440f0
   *       return 0 (noErr).
   *
   *   else if (paramId > 3 || !isSolo) → tail-call parent:
   *       return AUBase::GetParameterInfo(this, scope, paramId, outInfo);
   *                                                              ; @0x12440d4
   *
   *   else if (paramId == 2) → write "mute (for solo)":
   *       outInfo.name = "mute (for solo)"                       ; @0x12440a0-@0x12440a7
   *       (movups from literal-pool @Flexo __TEXT.__cstring @0x1681430)
   *       fall through to the "mute default" tail.
   *
   *   else if (paramId == 3) → write "mute (for disable)":
   *       outInfo.name = "mute (for disable)"                    ; @0x12440f8-@0x1244102
   *       (movups from literal-pool @Flexo __TEXT.__cstring @0x1681440)
   *       fall through to the "mute default" tail.
   *
   *   else (paramId == 1) → write bare "mute":
   *       outInfo.name = "mute\0"                                ; @0x124410b-@0x124410f
   *       fall through to the "mute default" tail.
   *
   *   Mute default tail (@0x1244115-@0x124413a):
   *       outInfo.unit                = Boolean (2)              ; @0x1244115
   *       outInfo.minValueDouble      = 0.0078125 (=1/128)       ; @0x124411c-@0x1244124
   *       outInfo.defaultAndFlags     = 0xC000000000000000
   *                                    (double -2.0 in the slot) ; @0x1244129-@0x1244133
   *       return 0 (noErr).
   *
   * The two literal-pool strings resolve as:
   *   "mute (for solo)"    Flexo __cstring RIP-target of
   *                        `movups 0x43d2e3(%rip)` @0x12440a0
   *                        (anchor 0x12440a7 + 0x43d2e3 = 0x168138a).
   *   "mute (for disable)" Flexo __cstring RIP-target of
   *                        `movups 0x43d29b(%rip)` @0x12440f8
   *                        (anchor 0x12440ff + 0x43d29b = 0x168139a).
   *   (The concrete VA offsets differ per build; the labels shown in the
   *    otool -tV listing prefix each `movups` as the ground truth.)
   *
   * @return 0 (kAudioServicesNoError) on success; parent's return value
   *   on the AUBase tail-call path.
   */
  GetParameterInfo(
    scope: number,
    paramId: number,
    outInfo: AudioUnitParameterInfo,
  ): number {
    // @0x1244084: testl %edx,%edx ; je 0x12440ac (paramId == 0 path).
    if (paramId === 0) {
      // @0x12440ac-@0x12440b8: name = "level", unit = Decibels (14).
      outInfo.name = "level";
      outInfo.unit = kAudioUnitParameterUnit_Decibels_0x12440b8;
      // @0x12440c0: cmpb $0x0, 0x28c(%rdi) — check isSoloMode.
      if (this.isSoloMode) {
        // @0x12440d9: xmm0 = 4.0f (solo cap).
        outInfo.minMaxValueFloat = SOLO_MAX_GAIN_4_0_0x156ccdc;
      } else {
        // @0x12440c9: xmm0 = 100.0f (non-solo cap).
        outInfo.minMaxValueFloat = NONSOLO_MAX_GAIN_100_0_0x156f0d0;
      }
      // @0x12440e6-@0x12440f0: outInfo.+0x5c = 0xC00000003F800000.
      outInfo.defaultAndFlags = GAIN_DEFAULT_AND_FLAGS;
      // @0x12440f4: eax = 0 (noErr).
      return 0;
    }

    // @0x1244088: cmpl $0x3, %edx ; ja 0x12440d3 (paramId > 3 → parent).
    // @0x124408d: cmpb $0x0, 0x28c(%rdi) ; je 0x12440d3 (!isSolo → parent).
    if (paramId > 3 || !this.isSoloMode) {
      // @0x12440d4: tail-jmp AUBase::GetParameterInfo.
      return ausdk_AUBase_GetParameterInfo(this, scope, paramId, outInfo);
    }

    // paramId ∈ {1, 2, 3} and isSolo == true.
    // @0x1244096: cmpl $0x3, %edx ; je 0x12440f8.
    if (paramId === 3) {
      // @0x12440f8-@0x1244102: name = "mute (for disable)".
      outInfo.name = "mute (for disable)";
    } else if (paramId === 2) {
      // @0x1244096/@0x124409b jne @0x124410b guard flipped: id != 3, id == 2.
      // @0x12440a0-@0x12440a7: name = "mute (for solo)".
      outInfo.name = "mute (for solo)";
    } else {
      // paramId == 1: fall to @0x124410b: name = "mute\0".
      outInfo.name = "mute";
    }

    // Mute default tail @0x1244115-@0x1244137:
    //   outInfo.+0x50 = 2 (Boolean unit).
    //   outInfo.+0x54 = 0.0078125 (double).
    //   outInfo.+0x5c..+0x63 = 0xC000000000000000 (packed).
    outInfo.unit = kAudioUnitParameterUnit_Boolean_0x1244115;
    outInfo.minValueDouble = MUTE_MIN_VALUE_0x156d160;
    outInfo.defaultAndFlags = MUTE_DEFAULT_AND_FLAGS;
    // @0x1244137: xorl %eax,%eax ; retq (return 0, noErr).
    return 0;
  }

  /**
   * @@0x1244610  AUGainStage::NewKernel()
   *
   * Body (18 lines) — allocates a fresh AULevelKernel, initializes its four
   * observable fields, installs its vtable pointer, and stores the pointer
   * at *rdi (the caller-supplied out-slot for a std::unique_ptr-style
   * return-slot convention).
   *
   *   1. p = operator new(0x20)                             ; @0x1244617-@0x1244622
   *      (__Znwm stub 0x1497452)
   *   2. p[+0x08] = this                                    ; @0x1244627 (parent AUGainStage)
   *   3. p[+0x10] = 0xBF80000000000000 (i64)                ; @0x124462b-@0x1244635
   *      — this fills +0x10..+0x17: low 4 bytes (int32) = 0, high 4 = -1.0f.
   *      Net effect: p[+0x10]=0 (reserved), p[+0x14]=-1.0f (lastGain).
   *   4. p[+0x00] = _ZTVN...AULevelKernelE + 0x10           ; @0x1244639-@0x1244640
   *      (leaq 0x6dade8(%rip); anchor 0x1244640+0x6dade8=0x191f428).
   *   5. p[+0x18] = 0 (byte)                                ; @0x1244643 (lastWasMuted=false).
   *   6. *out = p                                           ; @0x1244647
   *   7. return the out-slot pointer                        ; @0x124464a
   *
   * Note the ABI: `new AUGainStage::AULevelKernel` returns via an "out
   * parameter" slot in rdi (the caller's std::unique_ptr storage), with
   * rax echoing that same pointer. In TS we return a plain AULevelKernel
   * instance directly.
   */
  NewKernel(): AULevelKernel {
    // @0x1244622: operator new(0x20). JS-side, `new AULevelKernel()`.
    const kernel = new AULevelKernel();
    // @0x1244627: kernel.parent = this
    kernel.parent = this;
    // @0x124462b-@0x1244635: kernel[+0x10]=0, kernel[+0x14]=-1.0f.
    kernel.lastGain = KERNEL_NO_LAST_GAIN_SENTINEL;
    // @0x1244639-@0x1244640: install kernel vptr (JS prototype no-op).
    // @0x1244643: kernel[+0x18] = 0 (false).
    kernel.lastWasMuted = false;
    // @0x1244647: *out = kernel (in the C++ ABI, caller's rdi slot).
    return kernel;
  }
}

// (No trailing side-effect references needed — see file-header comment.)

