// StereoPanner.ts — Flexo Panner subclass. Two-channel stereo pan Audio Unit
// leaf class. This file transcribes 5 of the 7 methods that have complete,
// self-contained bodies (Create/Reset/SetAlgorithm/D1/D0) and provides
// PROVENANCE-CITING THROWING STUBS for the two large methods
// (Process, SetParameter) whose faithful transcription depends on subsystems
// not yet decoded (MixerVectorFunctions::sMixerVectorFunctions dispatch
// table, VectorStereoToStereoPan_CheckLevels, ausdk::AUElement::GetParameter).
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    otool -tV -arch x86_64 (line-indexed extraction from /tmp/Flexo_tV.txt).
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN12StereoPanner6CreateEv                                              @0x0124d1f0
//     ; static StereoPanner* Create()
//   __ZN12StereoPanner7ProcessERK15AudioBufferListjRS0_jj                    @0x0124d360
//     ; Process(AudioBufferList const&, unsigned int,
//     ;         AudioBufferList&,       unsigned int, unsigned int)
//   __ZN12StereoPanner12SetParameterEjf                                      @0x0124d800
//     ; SetParameter(unsigned int paramID, float value)
//   __ZN12StereoPanner12SetAlgorithmEj                                       @0x0124da40
//     ; bool SetAlgorithm(unsigned int fourcc)
//   __ZN12StereoPanner5ResetEv                                               @0x01251500
//     ; Reset()  — broadcast copy of target gains -> current gains
//   __ZN12StereoPannerD1Ev                                                   @0x01251510
//     ; ~StereoPanner() [D1, complete-object]  — trivial (frame prologue only)
//   __ZN12StereoPannerD0Ev                                                   @0x01251520
//     ; ~StereoPanner() [D0, deleting]         — tail-jmp to operator delete
//
// CLASS TOPOLOGY:
//   StereoPanner is a concrete subclass of `Panner` (see raw-port/src/channels/
//   Panner.ts already landed). The `Panner` base occupies +0x00..+0x20; the
//   StereoPanner subclass adds a further 0x28 bytes for a total instance
//   size of 0x48 (72 bytes; see `movl $0x48, %edi` @0x0124d1f4 fed to
//   operator new). The vtable pointer at (this+0x00) resolves via
//   `raw-port/army/tools/resolve.py Flexo sym 0x19210e0` to
//   "vtable for StereoPanner (+0x10)" — the Itanium ABI installed pointer
//   pointing past the RTTI header at the first virtual slot.
//
// INSTANCE LAYOUT (48 bytes, recovered from Create/Reset/SetParameter):
//   [+0x00]  vtable ptr        (leaq 0x6d3ebe(%rip); movq %rcx, (%rax)   @0x0124d21b/0x0124d222)
//   [+0x08]  u64 base field    = 0                        (movq $0x0, 0x8(%rax)       @0x0124d1fe)
//   [+0x10]  u8  needsRamp     = 0  (Panner-base @0x10; Process @0x124d383 tests ==1, clears; SetParameter @0x124da1a sets)
//   [+0x11]  u8  needsFinalize = 0  (Process @0x124d7ec sets =1; SetParameter @0x124da0d reads)
//   [+0x14]  u32 algorithmA    = 0x64666c74 ('dflt')       (movq $0x64666c74, 0x14(%rax) @0x0124d20c — 64-bit imm; upper 4 bytes -> 0x18)
//   [+0x18]  u32 channelMode   = (upper of movq @0x0124d20c is 0; then loaded/tested @0x124d80b as u32; commonly 2 or 6)
//                                  NOTE: Create leaves +0x18 = 0 initially; the Panner subclass ID stamp goes at +0x1c,
//                                  and +0x18 is the RUN-TIME channel-mode enum used by Process/SetParameter dispatch.
//   [+0x1c]  u32 classTag      = 0x3663686e ('6chn')       (movl $0x3663686e, 0x1c(%rax) @0x0124d214 — also Panner-base uiMode field)
//                                  NOTE: The Panner-base ports this field as `uiMode`; StereoPanner reuses the slot and
//                                  Create stamps it with the FourCC '6chn'. We preserve the exact bytes; no interpretation.
//   [+0x20]  2×float currentGains  = { 0.5f, 0.5f }         (movsd @0x0124d236 stores 2×float32 loaded from const 0x156cd10)
//   [+0x28]  4 bytes padding                                (not touched by Create)
//   [+0x30]  2×float targetGains   = { 0.5f, 0.5f }         (movsd @0x0124d231 stores same 2×float32 pattern)
//   [+0x38]  2×float extraGains    = { 0, 0 } (Create-time — SetParameter writes @0x30..0x3f depending on algorithm)
//                                            NOTE: SetParameter uses 0x30, 0x34, 0x38, 0x3c — four float32 slots covering
//                                            [+0x30..+0x40). Reset moves 0x30..0x3f -> 0x20..0x2f (movups), so exactly 4
//                                            floats worth of "target" gets copied to "current".
//   [+0x40]  u8  algorithmB      = 0     (movb $0x0, 0x40(%rax) @0x0124d225. SetAlgorithm sets to 1 when arg == 'scrs')
//   [+0x41..+0x48]  padding to size 0x48
//
// FRONTIER CALLEES:
//   operator new(unsigned long)           (stub @0x1497452, callq @0x0124d1f9)  — SAME stub as MonoPanner
//   operator delete(void*)                (stub @0x1497404, jmp   @0x01251525) — SAME stub as MonoPanner
//   __ZN20MixerVectorFunctions21sMixerVectorFunctionsE   (RIP-relative @0x0124d459 etc.)  — external static function-pointer table
//   _VectorStereoToStereoPan_CheckLevels  (direct callq @0x0124d606)
//   _cos                                  (stub @0x14975e4, callq @0x0124d895 / @0x0124d91c)
//   ___sincos_stret                       (stub @0x14974e8, callq @0x0124d8de)
//   ausdk::AUElement::GetParameter(unsigned int)   (stub @0x149720c, callq @0x0124da94)
//   _memcpy                               (stub @0x14978ba, callq @0x0124d76c / @0x0124d7b1)
//   ___bzero                              (stub @0x1497476, callq @0x0124d777 / @0x0124d7a3)
//   virtual *0x8, *0x18, *0x28, *0x30, *0x38, *0x50 on MixerVectorFunctions vtable (all through @0x0124d__)
//   virtual *0x8 on StereoPanner's own vtable (SetParameter re-dispatch from SetAlgorithm @0x0124daa1)
//   virtual *0x20 on ausdk parameter listener vtable (SetAlgorithm @0x0124da79)
//
// ---- Imports --------------------------------------------------------------

// The AudioBufferList / AudioBuffer interfaces + the operator-new/delete + memcpy
// stubs live next to their MonoPanner counterpart. We DO NOT redefine them here.

import type { AudioBufferList } from "./MonoPanner";

// ---- Frontier throwing stubs (undecoded native symbols) ------------------

/**
 * MixerVectorFunctions::sMixerVectorFunctions — global function-pointer
 * dispatch table used by StereoPanner::Process for the vectorised mix
 * kernels. The load pattern in the binary is
 *   leaq   __ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip), %rax
 *   movq   (%rax), %rax                   ; load table pointer
 *   callq  *0xNN(%rax)                    ; invoke slot 0xNN
 * The table's individual slots (0x08 / 0x18 / 0x28 / 0x30 / 0x38 / 0x50 —
 * all confirmed used) have not been decoded yet, so any Process code path
 * that reaches them MUST loudly throw.
 */
function sMixerVectorFunctions_slot(slotOffset: number): never {
  throw new Error(
    "MixerVectorFunctions::sMixerVectorFunctions slot *0x" +
      slotOffset.toString(16) +
      " (installed @Flexo table symbol __ZN20MixerVectorFunctions21sMixerVectorFunctionsE) " +
      "not yet transcribed — required by StereoPanner::Process @0x0124d360",
  );
}

/**
 * VectorStereoToStereoPan_CheckLevels — direct C function called by
 * StereoPanner::Process @0x0124d606 (the 6-channel ramping path).
 * Symbol NOT yet transcribed.
 */
function VectorStereoToStereoPan_CheckLevels(): never {
  throw new Error(
    "_VectorStereoToStereoPan_CheckLevels not yet transcribed — " +
      "required by StereoPanner::Process @0x0124d606",
  );
}

/**
 * ausdk::AUElement::GetParameter(unsigned int) — audio-unit SDK entry point
 * called by StereoPanner::SetAlgorithm @0x0124da94. Symbol NOT yet
 * transcribed.
 */
function ausdk_AUElement_GetParameter(): never {
  throw new Error(
    "ausdk::AUElement::GetParameter(unsigned int) @Flexo stub 0x1497208 " +
      "not yet transcribed — required by StereoPanner::SetAlgorithm @0x0124da94",
  );
}

// ---- Storage shape --------------------------------------------------------

/**
 * The 72-byte instance storage laid out by Create() @0x0124d1f0.
 * Field names use their byte offset from `this` so the mirror to the asm
 * is literal. Fields Panner touches (+0x00..+0x1f) are also present here
 * because Create writes all of them; StereoPanner-only fields start at
 * +0x20 (the current/target gain pairs).
 */
export interface StereoPannerRawStorage {
  /** @0x00 — vtable pointer (Itanium ABI +0x10). Set by Create @0x0124d222. */
  _vtablePointer: StereoPannerVTable | null;
  /** @0x08 — `movq $0x0, 0x8(%rax)` @0x0124d1fe. */
  _u64AtPlus0x08: bigint;
  /**
   * @0x10 — `movw $0x0, 0x10(%rax)` @0x0124d206 (u16 low).
   * Byte 0x10 is `needsRamp` — Process @0x0124d383 reads (`cmpb $0x1, 0x10(%rdi)`)
   * and SetParameter @0x0124da1a writes (`movb $0x1, 0x10(%rdi)`).
   * Byte 0x11 is `needsFinalize` — Process @0x0124d7ec writes 1;
   * SetParameter @0x0124da0d reads it.
   */
  _u8AtPlus0x10_needsRamp: number;
  /** @0x11 — high byte of the movw @0x0124d206; runtime "needsFinalize" flag. */
  _u8AtPlus0x11_needsFinalize: number;
  /** @0x12, @0x13 — u16 padding to align +0x14 (untouched). */
  _u16PadAtPlus0x12: number;
  /**
   * @0x14 — `movq $0x64666c74, 0x14(%rax)` @0x0124d20c (low 4 bytes of 8-byte imm).
   * 0x64666c74 = FourCC 'dflt'.
   */
  _u32AtPlus0x14_algorithmA: number;
  /**
   * @0x18 — upper 4 bytes of the movq @0x0124d20c = 0.
   * At RUN-TIME this slot is used as `channelMode` (a u32 tested against 2 and
   * 6 in SetParameter @0x0124d80e and Process @0x0124d39d/@0x0124d43c).
   */
  _u32AtPlus0x18_channelMode: number;
  /**
   * @0x1c — `movl $0x3663686e, 0x1c(%rax)` @0x0124d214 = FourCC '6chn'.
   * This is the same slot the base `Panner::GetPannerUIMode` reads.
   */
  _u32AtPlus0x1c_classTag: number;
  /**
   * @0x20..+0x28 (16 bytes; 4 floats) — CURRENT gain quad. Reset() @0x0124d1504
   * broadcast-copies +0x30..+0x3f into this slot. Process reads them
   * (`movups 0x20(%rdi), %xmm0` @0x0124d377). The two used floats are +0x20
   * (currentGainL) and +0x24 (currentGainR); the outer two are extra gains
   * used by 6-channel dispatch.
   */
  _float0AtPlus0x20: number;
  _float1AtPlus0x24: number;
  _float2AtPlus0x28: number;
  _float3AtPlus0x2c: number;
  /**
   * @0x30..+0x40 (16 bytes; 4 floats) — TARGET gain quad. Written by
   * SetParameter (see @0x0124d832, @0x0124d849, @0x0124d84e, @0x0124d879,
   * @0x0124d8a5, @0x0124d8f2, @0x0124d937, @0x0124d965, @0x0124d96a,
   * @0x0124d978, @0x0124d992, @0x0124d997, @0x0124d9d1, @0x0124d9da,
   * @0x0124d9ff, @0x0124da08). Create @0x0124d231 initializes to
   * {0.5f, 0.5f, 0.0f, 0.0f} (the movsd stores a pair of 0.5f floats).
   */
  _float0AtPlus0x30: number;
  _float1AtPlus0x34: number;
  _float2AtPlus0x38: number;
  _float3AtPlus0x3c: number;
  /**
   * @0x40 — `movb $0x0, 0x40(%rax)` @0x0124d225. Boolean "SCRS algorithm
   * enabled" flag: SetAlgorithm @0x0124da49 sets to 1 for fourcc 'scrs'
   * (0x63727373), 0 for 'dflt'.
   */
  _u8AtPlus0x40_scrsFlag: number;
}

/**
 * Opaque vtable for `StereoPanner`. The installed pointer (this+0x00) is
 * `vtable for StereoPanner + 0x10` = @Flexo 0x19210e0
 * (from `resolve.py Flexo sym 0x19210e0` -> "vtable for StereoPanner (+0x10)").
 * Slots that Process/SetAlgorithm dispatch through are opaque here; only
 * slot +0x8 is confirmed reachable (SetAlgorithm @0x0124daa1 calls
 * `*0x8(%rax)` on the object's own vtable).
 */
export interface StereoPannerVTable {
  readonly _opaque: never;
}

/** Sentinel vtable pointer at @Flexo 0x19210e0 = "vtable for StereoPanner + 0x10". */
export const STEREOPANNER_VTABLE: StereoPannerVTable = Object.freeze(
  {} as StereoPannerVTable,
);

// ---- The port -------------------------------------------------------------

/**
 * StereoPanner — the concrete class object. Methods are STATIC (see MonoPanner
 * rationale) so the raw storage IS the "this" pointer.
 */
export const StereoPanner = {
  /**
   * StereoPanner::Create()
   * @native-addr 0x0124d1f0
   *
   * Full disasm (from /tmp/Flexo_tV.txt):
   *   @0x0124d1f0  pushq %rbp
   *   @0x0124d1f1  movq  %rsp, %rbp
   *   @0x0124d1f4  movl  $0x48, %edi
   *   @0x0124d1f9  callq 0x1497452                 ## symbol stub for: __Znwm
   *   @0x0124d1fe  movq  $0x0, 0x8(%rax)
   *   @0x0124d206  movw  $0x0, 0x10(%rax)
   *   @0x0124d20c  movq  $0x64666c74, 0x14(%rax)   ## imm = 'dflt'
   *   @0x0124d214  movl  $0x3663686e, 0x1c(%rax)   ## imm = '6chn'
   *   @0x0124d21b  leaq  0x6d3ebe(%rip), %rcx      ## -> 0x19210e0 = vtable+0x10
   *   @0x0124d222  movq  %rcx, (%rax)
   *   @0x0124d225  movb  $0x0, 0x40(%rax)
   *   @0x0124d229  movsd 0x31fadf(%rip), %xmm0     ## -> 0x156cd10 = u64 0x3f0000003f000000
   *                                                ##   = { float 0.5f, float 0.5f }
   *   @0x0124d231  movsd %xmm0, 0x30(%rax)
   *   @0x0124d236  movsd %xmm0, 0x20(%rax)
   *   @0x0124d23b  popq  %rbp
   *   @0x0124d23c  retq
   *
   * The movsd loads 8 bytes = a pair of packed float32 0.5f values (verified
   * by reading the file-VA in /tmp/Flexo.x86_64: u64 = 0x3F000000_3F000000).
   * Both stores put this pair at +0x20 (current gain quad, low half) and
   * +0x30 (target gain quad, low half); the upper 8 bytes of each quad
   * remain zero from operator new's implicit zero-init. So the initial
   * effective gain vector is (L,R,extra1,extra2) = (0.5, 0.5, 0.0, 0.0)
   * at BOTH the current and target quads.
   */
  Create(): StereoPannerRawStorage {
    // @0x0124d1f4/@0x0124d1f9  operator new(0x48)  — zero-initialised container.
    // Rather than model the raw allocator, we mirror the field-by-field
    // stores the constructor performs.
    const self: StereoPannerRawStorage = {
      _vtablePointer: null,
      _u64AtPlus0x08: 0n,
      _u8AtPlus0x10_needsRamp: 0,
      _u8AtPlus0x11_needsFinalize: 0,
      _u16PadAtPlus0x12: 0,
      _u32AtPlus0x14_algorithmA: 0,
      _u32AtPlus0x18_channelMode: 0,
      _u32AtPlus0x1c_classTag: 0,
      _float0AtPlus0x20: 0,
      _float1AtPlus0x24: 0,
      _float2AtPlus0x28: 0,
      _float3AtPlus0x2c: 0,
      _float0AtPlus0x30: 0,
      _float1AtPlus0x34: 0,
      _float2AtPlus0x38: 0,
      _float3AtPlus0x3c: 0,
      _u8AtPlus0x40_scrsFlag: 0,
    };
    // @0x0124d1fe  movq $0x0, 0x8(%rax)          (already zero from init above)
    self._u64AtPlus0x08 = 0n;
    // @0x0124d206  movw $0x0, 0x10(%rax)         (low byte -> needsRamp; high -> needsFinalize)
    self._u8AtPlus0x10_needsRamp = 0;
    self._u8AtPlus0x11_needsFinalize = 0;
    // @0x0124d20c  movq $0x64666c74, 0x14(%rax)  (64-bit imm; low 32b = 'dflt', high 32b -> 0x18 = 0)
    self._u32AtPlus0x14_algorithmA = 0x64666c74;
    self._u32AtPlus0x18_channelMode = 0;
    // @0x0124d214  movl $0x3663686e, 0x1c(%rax)  ('6chn')
    self._u32AtPlus0x1c_classTag = 0x3663686e;
    // @0x0124d21b/@0x0124d222  leaq/movq -> vtable pointer install
    self._vtablePointer = STEREOPANNER_VTABLE;
    // @0x0124d225  movb $0x0, 0x40(%rax)         (SCRS flag off by default)
    self._u8AtPlus0x40_scrsFlag = 0;
    // @0x0124d229 / @0x0124d231 / @0x0124d236  movsd 0x31fadf(%rip),%xmm0 ; movsd %xmm0, 0x30/%0x20(%rax)
    // Constant at file-VA 0x156cd10 = { 0.5f, 0.5f } (two packed float32s).
    // The movsd stores 8 bytes = two floats each; upper 8 bytes of both
    // quads stay 0 from operator-new zero-init.
    const initHalfGain = Math.fround(0.5);
    self._float0AtPlus0x20 = initHalfGain;
    self._float1AtPlus0x24 = initHalfGain;
    self._float0AtPlus0x30 = initHalfGain;
    self._float1AtPlus0x34 = initHalfGain;
    return self;
  },

  /**
   * StereoPanner::Reset()
   * @native-addr 0x01251500
   *
   * Full disasm:
   *   @0x01251500  pushq   %rbp
   *   @0x01251501  movq    %rsp, %rbp
   *   @0x01251504  movups  0x30(%rdi), %xmm0        ; load 16 bytes = target quad
   *   @0x01251508  movups  %xmm0, 0x20(%rdi)        ; store into current quad
   *   @0x0125150c  popq    %rbp
   *   @0x0125150d  retq
   *
   * Semantics: current gains := target gains (16-byte SIMD block copy). This
   * overrides `Panner::Reset()` @0x012514b0 (a no-op) — see the class
   * comment on `Panner.ts` which already anticipates this.
   */
  Reset(self: StereoPannerRawStorage): void {
    // @0x01251504  movups 0x30(%rdi), %xmm0
    // @0x01251508  movups %xmm0, 0x20(%rdi)
    self._float0AtPlus0x20 = self._float0AtPlus0x30;
    self._float1AtPlus0x24 = self._float1AtPlus0x34;
    self._float2AtPlus0x28 = self._float2AtPlus0x38;
    self._float3AtPlus0x2c = self._float3AtPlus0x3c;
  },

  /**
   * StereoPanner::SetAlgorithm(unsigned int fourcc) -> bool
   * @native-addr 0x0124da40
   *
   * The prologue tests the fourcc against two known IDs:
   *   'scrs' (0x63727373) — cmpl @0x0124da49; sets @0x40 to 1
   *   'dflt' (0x64666c74) — cmpl @0x0124da53; sets @0x40 to 0
   *   anything else       — returns false (zeroed %al @0x0124da51) with
   *                          NO state mutation
   *
   * On a hit the function does two more things:
   *   1. `movq 0x8(%rbx), %rax; movq 0x48(%rax), %rdi;` — walks into an
   *      opaque object stored at (this+0x8) at (+0x48) to find a listener
   *      pointer, then either calls `*0x20(vtable)` on it (@0x0124da79),
   *      or falls back to iterating a pair @0x30/@0x38 as a range. On
   *      success it hands the result to `ausdk::AUElement::GetParameter`
   *      (@0x0124da94) and finally calls back into its own vtable slot
   *      *0x8 (@0x0124daa1) with %esi=0. All of that is FRONTIER code we
   *      cannot decode yet — it depends on the ausdk AUElement structure
   *      which is a separate translation unit.
   *
   * We faithfully transcribe the pure-data path (the fourcc test + the
   * @0x40 byte store) here, and THROW when the caller reaches the
   * side-effect chain — because THAT half of the function is not yet
   * transcribable.
   *
   * The function's return type (like Panner::SetAlgorithm) is a bool
   * derived from the low byte of %al at ret.
   */
  SetAlgorithm(self: StereoPannerRawStorage, fourcc: number): boolean {
    const fc = fourcc >>> 0;
    // @0x0124da49  cmpl $0x63727373, %esi   ; 'scrs'
    // @0x0124da4f  je   0x124da62           ; -> path that stores %al = 1
    // @0x0124da51  xorl %eax, %eax          ; default return %al = 0
    // @0x0124da53  cmpl $0x64666c74, %esi   ; 'dflt'
    // @0x0124da59  je   0x124da64           ; -> path skips the "%al = 1" store, keeps 0
    // @0x0124da5b..@0x0124da61  epilogue+ret (return false)
    if (fc !== 0x63727373 && fc !== 0x64666c74) {
      // No mutation, return false. This is the FULLY DECODED "unknown
      // algorithm" branch.
      return false;
    }
    // @0x0124da62  movb $0x1, %al           (only for 'scrs')
    // @0x0124da64  movb %al, 0x40(%rbx)     (write flag)
    self._u8AtPlus0x40_scrsFlag = fc === 0x63727373 ? 1 : 0;
    // From here on the disassembly performs a listener-notify chain we
    // cannot yet transcribe:
    //   @0x0124da67..@0x0124da8e  walk (this+0x8)->+0x48 or (+0x30, +0x38)
    //   @0x0124da94  callq ausdk::AUElement::GetParameter(unsigned int)
    //   @0x0124daa1  callq *0x8(this-vtable)
    // A faithful port MUST NOT emit those effects with a guess. Throw.
    throw new Error(
      "StereoPanner::SetAlgorithm side-effect chain not yet transcribed: " +
        "listener walk @0x0124da67-@0x0124da8e -> " +
        "ausdk::AUElement::GetParameter @0x0124da94 -> " +
        "self-vtable *0x8 dispatch @0x0124daa1",
    );
  },

  /**
   * StereoPanner::~StereoPanner() [D1, complete-object]
   * @native-addr 0x01251510
   *
   * Full disasm:
   *   @0x01251510  pushq %rbp
   *   @0x01251511  movq  %rsp, %rbp
   *   @0x01251514  popq  %rbp
   *   @0x01251515  retq
   *
   * Trivial destructor — a bare stack frame + return. No members with
   * non-trivial dtors, no vtable-slot repointing. JS GC handles storage
   * cleanup, so this is a no-op on our side.
   */
  destructD1(_self: StereoPannerRawStorage): void {
    // No body — the C++ symbol is literally an empty function.
  },

  /**
   * StereoPanner::~StereoPanner() [D0, deleting]
   * @native-addr 0x01251520
   *
   * Full disasm:
   *   @0x01251520  pushq %rbp
   *   @0x01251521  movq  %rsp, %rbp
   *   @0x01251524  popq  %rbp
   *   @0x01251525  jmp   0x1497404      ## symbol stub for: __ZdlPv
   *
   * D0 is "run D2 (base-object dtor), then free". D2 for StereoPanner is
   * empty (same body as D1 above), so this reduces to a bare tail-call to
   * operator delete(void*). JS GC handles freeing.
   */
  destructD0(_self: StereoPannerRawStorage): void {
    // no-op: no non-trivial base destructor to run; native code tail-jmps
    // to operator delete @0x1497404. On the TS side, dropping the
    // reference is sufficient.
  },

  /**
   * StereoPanner::Process(AudioBufferList const& src, unsigned int srcBusIndex,
   *                       AudioBufferList& dst, unsigned int dstBusIndex,
   *                       unsigned int frameCount)
   * @native-addr 0x0124d360
   *
   * A 400+-line dispatcher. Reads the current-gain quad (movups 0x20(%rdi))
   * into xmm0, potentially performs a ramp from current to target (when
   * needsRamp @0x10 == 1) linearly over `frameCount` samples, and finally
   * routes to one of many mix kernels chosen by (channelMode @0x18) and
   * (scrsFlag @0x40):
   *
   *   channelMode == 2, scrsFlag == 1, needsRamp:  inline per-sample ramp+
   *                                                mix (@0x0124d3af..)
   *   channelMode == 2, scrsFlag == 1, no ramp:    calls sMixerVectorFunctions
   *                                                slot *0x38 (@0x0124d481)
   *   channelMode == 2, scrsFlag == 0:             calls sMixerVectorFunctions
   *                                                slot *0x50 four times
   *                                                (@0x0124d711..) or memcpy/bzero
   *                                                identity paths
   *   channelMode == 6, scrsFlag == 1:             calls VectorStereoToStereoPan_CheckLevels
   *                                                (@0x0124d606) and slot *0x18
   *                                                four times
   *   channelMode == 6, scrsFlag == 0:             different mix kernel via
   *                                                slot *0x50 five times
   *                                                (@0x0124d4bd, @0x0124d4e1,
   *                                                 @0x0124d52a, @0x0124d56f,
   *                                                 @0x0124d59d, @0x0124d5cb)
   *   channelMode == other (fallthrough):          slot *0x28 or slot *0x30
   *                                                or slot *0x08 with the raw
   *                                                gain quad
   *
   * Faithful transcription requires the MixerVectorFunctions dispatch table
   * (an external Flexo static — not in this class), the C symbol
   * VectorStereoToStereoPan_CheckLevels, and the exact double constants
   * loaded from the RIP-relative pool (0x335cfc / 0x335cb3 / 0x335c6d /
   * 0x335c3f / 0x335bd5 / 0x335ba6 — all in Flexo __const near
   * 0x158__ region). NONE of those are yet decoded.
   *
   * Per anti-shortcut Rule 3, we throw with citations rather than emit a
   * plausible-looking imitation that would silently corrupt audio for
   * every caller.
   */
  Process(
    _self: StereoPannerRawStorage,
    _src: AudioBufferList,
    _srcBusIndex: number,
    _dst: AudioBufferList,
    _dstBusIndex: number,
    _frameCount: number,
  ): void {
    // Dead reference so the sMixerVectorFunctions_slot / CheckLevels stubs
    // survive minification and are counted as "callees" by the frontier
    // scanner.
    if (false as boolean) {
      sMixerVectorFunctions_slot(0x38);
      VectorStereoToStereoPan_CheckLevels();
    }
    throw new Error(
      "StereoPanner::Process @0x0124d360 not yet transcribed: dispatcher " +
        "depends on MixerVectorFunctions::sMixerVectorFunctions (slots " +
        "*0x08/*0x18/*0x28/*0x30/*0x38/*0x50) + " +
        "_VectorStereoToStereoPan_CheckLevels @0x0124d606 + " +
        "the RIP-relative double constants at Flexo __const " +
        "(loaded from @0x0124d4ec/@0x0124d535/@0x0124d57b/@0x0124d5a9/" +
        "@0x0124d613/@0x0124d642). Frontier callees not yet ported.",
    );
  },

  /**
   * StereoPanner::SetParameter(unsigned int paramID, float value)
   * @native-addr 0x0124d800
   *
   * Dispatches on the CHANNEL MODE at (this+0x18):
   *   paramID != 0: early ret (@0x0124d800 testl+je+ret) — only paramID 0
   *                 is handled by StereoPanner.
   *   channelMode == 6 OR (channelMode == 2 AND scrsFlag == 0):
   *     Use the movsd @0x0124d86d branch: read a double constant from
   *     RIP-relative pool @0x0124d86d (0x31f43b -> Flexo __const),
   *     store two floats into (0x30, 0x34), then if value > 0 call `_cos`
   *     with (value * K1) where K1 is another double @0x0124d886 (0x32246a).
   *     Followed by a normalize step at @0x0124d9b1..@0x0124da0d that
   *     divides by (xmm1 + xmm2) if the sum exceeds a limit.
   *   channelMode == 2 AND scrsFlag == 1:
   *     Constant-power / SCRS branch @0x0124d822..@0x0124d868 — uses
   *     sqrtsd/sqrtss and unusual sign-manipulation via xorps with a mask
   *     from the pool (0x31f494) plus a scalar from 0x31f468.
   *   channelMode != 2 && channelMode != 6:
   *     Two-way sinf/cosf pan-law branch @0x0124d8b7..@0x0124d8fb —
   *     `_sincos_stret(value * K2)` then `sin² + cos²` combined into a
   *     packed pair.
   *
   * Ten distinct double/float constants from the RIP-pool feed this
   * function; none are yet decoded (they are all in Flexo __const near
   * offset 0x156__/0x158__). Without those exact values a faithful port
   * would fabricate gain coefficients. Rule 3 -> throw.
   */
  SetParameter(
    self: StereoPannerRawStorage,
    paramID: number,
    _value: number,
  ): void {
    // @0x0124d800  testl %esi, %esi  ; @0x0124d802 je 0x124d805 ; @0x0124d804 retq
    // The only fully-decoded slice: paramID != 0 is a no-op early return.
    // We DO reproduce it here — this is one of the few branches that has
    // NO undecoded callees.
    if ((paramID >>> 0) !== 0) {
      return;
    }
    // Silence "unused parameter" without changing semantics; also references
    // the self object so import ordering is preserved.
    void self;
    throw new Error(
      "StereoPanner::SetParameter @0x0124d800 (paramID == 0 path) not yet " +
        "transcribed: three pan-law branches (SCRS @0x0124d822, " +
        "channel-6-or-non-scrs @0x0124d86d, default sincos @0x0124d8b7) " +
        "each depend on RIP-relative double constants at Flexo __const " +
        "(0x31f0aa/0x31f175/0x31f1bf/0x31f2d9/0x31f2e3/0x31f307/0x31f311/" +
        "0x31f31e/0x31f32a/0x31f34b/0x31f3a7/0x31f3c8/0x31f41e/0x31f43b/" +
        "0x31f468/0x31f494/0x32242d/0x32246a/0x3223f3) plus libm callees " +
        "_cos @0x0124d895/@0x0124d91c and ___sincos_stret @0x0124d8de.",
    );
  },
};
